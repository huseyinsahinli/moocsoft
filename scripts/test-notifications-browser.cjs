// Isolated development-only website QA, not a mobile notification or delivery test.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4216').replace(/\/$/, '');
const origin = new URL(base).origin;
const route = '/guides/local-vs-push-notifications/';
const incomingRoute = '/guides/mobile-app-mvp-checklist/';
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const load = name => import(pathToFileURL(resolve(root, 'content', name)).href);
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function eventually(check, message) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail(message);
}

async function focus(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.focus();
  let previous = null;
  await eventually(async () => {
    const current = await page.evaluate(() => scrollY);
    const stable = previous !== null && Math.abs(current - previous) < 1;
    previous = current;
    return stable;
  }, 'Native focus scrolling settles before keyboard activation');
  assert(await locator.evaluate(node => node === document.activeElement));
}

async function checkSchema(page, expected) {
  const graph = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => {
    const value = JSON.parse(node.textContent);
    return value['@graph'] || value;
  }));
  const article = graph.find(node => node['@type'] === 'Article');
  assert(article);
  assert.equal(article.headline, expected.title);
  assert.equal(article.url, 'https://moocsoft.net' + expected.route);
  assert.equal(article.datePublished, expected.date);
  assert.equal(article.dateModified, expected.date);
  assert.equal(article.inLanguage, 'en');
  assert.equal(article.articleSection, 'Mobile app development');
  return article;
}

(async () => {
  const [{ default: notificationGuides, notificationChoices, meetingSequence, notificationChecks }, { editorialPhotos }] = await Promise.all([
    load('development-notifications.mjs'), load('editorial-media.mjs'),
  ]);
  const guide = notificationGuides[0];
  assert.equal(notificationGuides.length, 1);
  assert.equal(guide.slug, 'local-vs-push-notifications');
  assert.equal(guide.title, 'Local vs Push Notifications: Which Does Your App Need?');
  assert.equal(guide.topic, 'development');
  assert.equal(guide.published, '2026-10-26');
  assert.equal(guide.modified, undefined);
  assert.equal(guide.editorialFormat, 'decision');
  assert.equal(guide.appPreview, undefined);
  assert.equal(guide.showToolAction, false);
  assert.deepEqual([notificationChoices.length, meetingSequence.length, notificationChecks.length], [4, 5, 7]);
  assert.equal(guide.faq.length, 6);
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep evidence outside the public site');
    mkdirSync(qaDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localTargets = new Map();
  let visits = 0;
  async function contextFor(width, javaScriptEnabled) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
    await context.route('https://fonts.googleapis.com/**', request => request.abort());
    await context.route('https://fonts.gstatic.com/**', request => request.abort());
    if (javaScriptEnabled) await context.addInitScript(() => {
      // Intercept attempts; never call the real permission or presentation APIs.
      window.__websiteNotificationAttempts = 0;
      if (typeof window.Notification === 'function') {
        const OriginalNotification = window.Notification;
        const blocked = () => {
          window.__websiteNotificationAttempts++;
          throw new Error('A reading guide must not request or display browser notifications');
        };
        Object.defineProperty(window, 'Notification', {
          configurable: true,
          value: new Proxy(OriginalNotification, {
            construct: blocked,
            get(target, key) { return key === 'requestPermission' ? blocked : Reflect.get(target, key); },
          }),
        });
      }
    });
    context.on('page', page => {
      page.on('pageerror', error => failures.push(error.message));
      page.on('dialog', async dialog => { failures.push('Unexpected page dialog: ' + dialog.type()); await dialog.dismiss(); });
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.status() + ' ' + response.url());
      });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) failures.push('Unexpected method: ' + request.method());
        if (url.origin !== origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected remote request: ' + request.url());
      });
    });
    return context;
  }
  async function collectLinks(page, currentRoute) {
    for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
      if ((!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
      const url = new URL(href, base + currentRoute);
      if (!localTargets.has(url.pathname)) localTargets.set(url.pathname, new Set());
      if (url.hash) localTargets.get(url.pathname).add(decodeURIComponent(url.hash.slice(1)));
    }
  }
  async function checkPhoto(page, fallback = false) {
    const figure = page.locator('.guide-article > figure.guide-visual');
    assert.equal(await figure.count(), 1);
    assert.equal(await figure.evaluate(node => node.previousElementSibling.id), 'step-1', 'Useful first section precedes the shared topic photo');
    const image = figure.locator('img[data-visual-kind="photo"]');
    assert.equal(await image.count(), 1);
    assert.equal(await image.getAttribute('src'), editorialPhotos.development.src);
    assert.equal(await image.getAttribute('alt'), editorialPhotos.development.alt);
    assert.equal(await image.getAttribute('width'), '1200');
    assert.equal(await image.getAttribute('height'), '675');
    assert.equal(await image.getAttribute('loading'), 'lazy');
    assert.match(await figure.locator('figcaption').innerText(), /AI.generated.*not an app screenshot/i);
    const source = figure.locator('source[type="image/webp"]');
    assert.equal(await source.count(), 1);
    assert.match(await source.getAttribute('srcset'), /480w.*800w.*1200w/);
    assert.match(await source.getAttribute('sizes'), /100vw/);
    await image.scrollIntoViewIfNeeded();
    if (fallback) {
      // Force normal native picture fallback selection, not a simulated fetch failure.
      await source.evaluate(node => node.remove());
      await eventually(() => image.evaluate(node => Boolean(node.currentSrc) && new URL(node.currentSrc, document.baseURI).pathname === node.getAttribute('src')), 'Native JPEG fallback selected');
    }
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0));
    const chosen = new URL(await image.evaluate(node => node.currentSrc)).pathname;
    assert(fallback ? chosen === editorialPhotos.development.src : editorialPhotos.development.webp.some(variant => variant.src === chosen));
    const box = await image.boundingBox();
    assert(box && box.width > 0 && box.height > 0 && Math.abs(box.width / box.height - 16 / 9) < .01);
  }
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await contextFor(width, javaScriptEnabled);
      const page = await context.newPage();
      assert.equal((await page.goto(base + route)).status(), 200);
      visits++;
      assert.equal(await page.title(), guide.title + ' | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('h1').innerText(), guide.title);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), guide.description);
      assert.match(await page.locator('.guide-hero > .guide-kicker').innerText(), /Mobile app development · Decision guide/i);
      assert.equal(await page.locator('.guide-byline time').count(), 1);
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-26');
      const article = await checkSchema(page, { title: guide.title, route, date: '2026-10-26' });
      assert.deepEqual(article.image, ['https://moocsoft.net' + editorialPhotos.development.src]);
      for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
        assert.equal(await page.locator(selector).getAttribute('content'), 'https://moocsoft.net' + editorialPhotos.development.src);
      }
      assert.equal(await page.locator('.app-install, .guide-app-preview, a.install-link').count(), 0, 'Service guide has no unrelated app/store promotion');
      const service = page.locator('[aria-label="Discuss a Flutter project"]');
      assert.equal(await service.count(), 1);
      assert(await service.isVisible());
      assert.equal(await service.locator('a[href="/hire-flutter-developer/"]').count(), 1);
      assert.equal(await page.locator('.guide-hero > .guide-hero-actions a[href^="/tools/"]').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');

      const flow = page.locator('figure.notification-routes');
      assert.equal(await flow.count(), 1);
      assert.equal(await flow.locator('img, svg, canvas').count(), 0, 'Original route diagram remains native HTML');
      assert.deepEqual(await flow.locator('[data-notification-route]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-notification-route'))), ['local', 'remote']);
      for (const [key, steps] of Object.entries({ local: ['Choose', 'Schedule', 'Present, if allowed'], remote: ['Change', 'Send', 'Open current record'] })) {
        const card = flow.locator('[data-notification-route="' + key + '"]');
        assert.deepEqual(await card.locator('ol li strong').allTextContents(), steps);
        const box = await card.boundingBox();
        assert(box && box.width > 0 && box.height > 0);
        assert(await card.evaluate(node => node.scrollWidth <= node.clientWidth + 1), 'Native route labels fit their card');
      }
      assert.match(await flow.locator('figcaption').innerText(), /not an app screen or a measured delivery trace/);
      const tables = page.locator('.guide-article .guide-table');
      assert.equal(await tables.count(), 3);
      const expectedRows = [notificationChoices, meetingSequence, notificationChecks.map(row => [...row, 'Untested'])];
      for (const [index, rows] of expectedRows.entries()) {
        const wrapper = tables.nth(index);
        assert.equal(await wrapper.getAttribute('tabindex'), '0');
        assert((await wrapper.locator('caption').innerText()).trim().length > 10);
        assert.deepEqual(await wrapper.locator('tbody tr').evaluateAll(nodes => nodes.map(node => [...node.querySelectorAll('th[scope="row"], td')].map(cell => cell.textContent))), rows);
        await focus(page, wrapper);
        if (await wrapper.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => wrapper.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the focused comparison table');
        }
      }
      assert.deepEqual(await tables.nth(2).locator('tbody tr td:last-child').allTextContents(), Array(7).fill('Untested'));
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) {
        await focus(page, toc.locator('summary'));
        await page.keyboard.press('Enter');
      }
      await focus(page, toc.locator('a[href="#step-2"]'));
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-2');
      await eventually(() => page.evaluate(() => {
        const target = document.querySelector('#step-2').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }), 'Section navigation lands below the sticky header');
      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 6);
      for (const [index, detail] of (await faq.all()).entries()) {
        assert.equal(await detail.getAttribute('open'), null);
        assert.equal(await detail.locator('summary').innerText(), guide.faq[index][0]);
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.notEqual(await detail.getAttribute('open'), null, 'FAQ opens natively, also without JavaScript');
        assert.equal(await detail.locator('p').innerText(), guide.faq[index][1]);
        assert(await detail.locator('p').isVisible());
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.equal(await detail.getAttribute('open'), null);
      }
      await checkPhoto(page);
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [
        '/guides/mobile-app-backend-decision/',
        '/guides/offline-first-flutter-app-local-storage-cloud-sync/',
        '/guides/mobile-app-mvp-checklist/',
      ]);
      assert.equal(await page.locator('.guide-article form, .guide-article input, .guide-article textarea').count(), 0, 'Planning rows are static, not submitted data');
      assert.match(await page.locator('#step-6').innerText(), /sends no notifications and asks for no browser notification permission/);
      await collectLinks(page, route);
      if (javaScriptEnabled) {
        assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
        assert.equal(await page.evaluate(() => window.__websiteNotificationAttempts), 0, 'No notification or permission API attempted');
      }
      assert.deepEqual(await context.cookies(), []);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (qaDir && javaScriptEnabled) {
        // Hide the sticky overlay only for component crops; real header behavior was tested above.
        await flow.screenshot({ animations: 'disabled', style: '.site-header { visibility: hidden !important; }', path: resolve(qaDir, 'notifications-flow-' + width + '.png') });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'notifications-top-' + width + '.png') });
      }
      assert.equal((await page.goto(base + incomingRoute)).status(), 200);
      const incomingSection = page.locator('.guide-article > section').filter({ has: page.getByRole('heading', { name: 'Choose platforms and check integrations', exact: true }) });
      assert.equal(await incomingSection.count(), 1);
      assert(await incomingSection.locator('a[href="' + route + '"]').count() > 0, 'MVP integrations section links the notification decision');
      assert.equal(await page.locator('.guide-byline time').count(), 1);
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-09');
      await checkSchema(page, { title: 'Mobile App MVP Checklist: Before You Hire a Developer', route: incomingRoute, date: '2026-10-09' });
      await collectLinks(page, incomingRoute);
      if (javaScriptEnabled) assert.equal(await page.evaluate(() => window.__websiteNotificationAttempts), 0);
      await context.close();
    }
    const fallback = await contextFor(390, false);
    const fallbackPage = await fallback.newPage();
    assert.equal((await fallbackPage.goto(base + route)).status(), 200);
    await checkPhoto(fallbackPage, true);
    await fallback.close();
    const links = await browser.newContext();
    for (const [path, fragments] of localTargets) {
      assert.equal((await links.request.head(base + path)).status(), 200, 'Local HEAD target: ' + path);
      if (fragments.size) {
        const response = await links.request.get(base + path);
        assert.equal(response.status(), 200);
        const html = await response.text();
        for (const fragment of fragments) assert.match(html, new RegExp('\\bid=["\']' + escapeRegex(fragment) + '["\']'), 'Local fragment: ' + path + '#' + fragment);
      }
    }
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: notification decision guide across ' + visits + ' mobile/desktop JS/no-JS visits; native dual-path flow, three keyboard tables (4/5/7 rows), six native FAQs, source dates/image metadata, service-only CTA, responsive/JPEG photo, contextual incoming link and ' + localTargets.size + ' local targets without notification API calls, new cookies/storage/submission. Website QA does not test mobile push delivery.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
