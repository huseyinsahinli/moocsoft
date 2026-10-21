// Isolated development-only QA. The website does not collect workout answers.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');
const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4212').replace(/\/$/, '');
const slug = 'how-to-log-supersets';
const route = '/guides/' + slug + '/';
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const load = name => import(pathToFileURL(resolve(root, 'content', name)).href);
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Node-side polling also runs when the browser has JavaScript disabled.
async function eventually(check, message) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail(message);
}
async function settledFocus(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.focus();
  let previous = null;
  await eventually(async () => {
    const current = await page.evaluate(() => scrollY);
    const stable = previous !== null && Math.abs(current - previous) < 1;
    previous = current;
    return stable;
  }, 'Native focus scrolling settles before key activation');
}

(async () => {
  const [{ guides }, { editorialPhotos }, { appPreviews }] = await Promise.all([
    load('index.mjs'), load('editorial-media.mjs'), load('app-previews.mjs'),
  ]);
  assert.equal(guides.filter(guide => guide.slug === slug).length, 1);
  const guide = guides.find(guide => guide.slug === slug);
  assert.equal(guide.topic, 'training');
  assert.equal(guide.published, '2026-10-21');
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Screenshots stay outside public files');
    mkdirSync(qaDir, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localTargets = new Map();
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
      await context.route('https://fonts.googleapis.com/**', request => request.abort());
      await context.route('https://fonts.gstatic.com/**', request => request.abort());
      const page = await context.newPage();
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.status() + ' ' + response.url());
      });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) failures.push('Unexpected method: ' + request.method());
        if (url.origin !== new URL(base).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected request: ' + request.url());
      });
      assert.equal((await page.goto(base + route)).status(), 200);
      assert.equal(await page.title(), 'How to Log Supersets: Sets, Rounds and Rest | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both verified app stores at ' + placement);
        for (const href of await links.evaluateAll(nodes => nodes.map(node => node.href))) {
          const url = new URL(href);
          if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6808200259$/);
          else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.didyoulift');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
          }
        }
      }

      assert.equal(await page.locator('.guide-article .guide-table table').count(), 3);
      for (const table of await page.locator('.guide-article .guide-table').all()) {
        assert.equal(await table.getAttribute('tabindex'), '0', 'Native table wrapper is keyboard focusable');
        await settledFocus(page, table);
        assert(await table.evaluate(node => node === document.activeElement));
        if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the table');
        }
      }
      const sequence = page.locator('figure.guide-superset-sequence');
      assert.equal(await sequence.count(), 1);
      assert.equal(await sequence.locator('ol > li').count(), 3);
      assert.equal(await sequence.locator('img').count(), 0, 'Original exercise sequence is native HTML, not an app screenshot');
      for (let index = 0; index < 3; index++) {
        const label = await sequence.locator('ol > li').nth(index).innerText();
        assert.match(label, new RegExp('A' + (index + 1) + '[\\s\\S]*B' + (index + 1)), 'Pair order is readable in the native list');
      }
      assert.match(await sequence.locator('figcaption').innerText(), /not.{0,25}(?:app|screen)/i);
      const articleText = await page.locator('.guide-article').innerText();
      for (const value of ['775', '375', '1,150', '1,045', '18:20:00', '18:20:20', '18:20:50', '18:22:20']) {
        assert(articleText.includes(value), 'Worked record remains visible: ' + value);
      }

      const check = page.locator('details[data-superset-check]');
      assert.equal(await check.count(), 1);
      assert.equal(await check.getAttribute('open'), null, 'The counting answer is not spoiled');
      const sectionId = await check.evaluate(node => node.closest('section').id);
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) {
        await settledFocus(page, toc.locator('summary'));
        await page.keyboard.press('Enter');
      }
      const sectionLink = toc.locator('a[href="#' + sectionId + '"]');
      await settledFocus(page, sectionLink);
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#' + sectionId);
      await eventually(() => page.evaluate(id => {
        const target = document.getElementById(id).getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }, sectionId), 'TOC lands below the sticky app header at ' + width + ', JS=' + javaScriptEnabled);
      await settledFocus(page, check.locator('summary'));
      await page.keyboard.press('Space');
      assert.notEqual(await check.getAttribute('open'), null, 'Native check opens without JavaScript');
      assert(await check.locator('p').isVisible());
      assert.match(await check.locator('p').innerText(), /(?:5|five)\s+(?:documented\s+)?(?:exercise\s+)?sets/i);
      assert.match(await check.locator('p').innerText(), /B3[\s\S]*(?:unknown|unrecorded|not recorded)|(?:unknown|unrecorded|not recorded)[\s\S]*B3/i);
      await settledFocus(page, check.locator('summary'));
      await page.keyboard.press('Enter');
      assert.equal(await check.getAttribute('open'), null);

      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 4);
      await settledFocus(page, faq.first().locator('summary'));
      await page.keyboard.press('Enter');
      assert.notEqual(await faq.first().getAttribute('open'), null);
      assert(await faq.first().locator('p').isVisible());

      const photo = page.locator('.guide-article > figure.guide-visual img[data-visual-kind="photo"]');
      assert.equal(await photo.count(), 1);
      assert.equal(await photo.getAttribute('src'), editorialPhotos.training.src);
      assert.equal(await photo.getAttribute('alt'), editorialPhotos.training.alt);
      await photo.scrollIntoViewIfNeeded();
      await photo.evaluate(node => node.decode());
      assert(await photo.evaluate(node => node.naturalWidth > 0));
      assert.match(await page.locator('.guide-article > figure.guide-visual figcaption').innerText(), /AI.generated/i);
      const preview = page.locator('.guide-app-preview img');
      assert.equal(await preview.count(), 1);
      assert.equal(await preview.getAttribute('src'), appPreviews.training.image);
      await preview.scrollIntoViewIfNeeded();
      await preview.evaluate(node => node.decode());
      assert.equal(await preview.evaluate(node => node.naturalWidth), 600);
      assert.match(await page.locator('.guide-app-preview figcaption').innerText(), /Official iPhone store screenshot/);
      assert.match(await page.locator('.guide-app-preview').innerText(), /Premium/);

      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [
        '/guides/how-to-log-gym-workouts/', '/guides/rest-timer-between-sets/', '/guides/workout-volume-explained/',
      ]);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (!href.startsWith('/') && !href.startsWith('#')) continue;
        if (href.startsWith('//')) continue;
        const target = new URL(href, base + route);
        if (!localTargets.has(target.pathname)) localTargets.set(target.pathname, new Set());
        if (target.hash) localTargets.get(target.pathname).add(decodeURIComponent(target.hash.slice(1)));
      }
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0, 'No answer submission is introduced');
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'superset-guide-' + width + '.png') });
        await sequence.screenshot({ path: resolve(qaDir, 'superset-sequence-' + width + '.png'), animations: 'disabled' });
        await page.locator('.guide-article .guide-table').first().evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, 'superset-log-' + width + '.png') });
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const printContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
    await printContext.route('https://fonts.googleapis.com/**', request => request.abort());
    await printContext.route('https://fonts.gstatic.com/**', request => request.abort());
    const printPage = await printContext.newPage();
    await printPage.goto(base + route);
    await printPage.emulateMedia({ media: 'print' });
    assert.equal(await printPage.locator('.guide-superset-sequence li').first().evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await printPage.locator('.guide-superset-sequence figcaption').evaluate(node => getComputedStyle(node).color), 'rgb(0, 0, 0)');
    assert.equal(await printPage.locator('.guide-superset-sequence ol > li').count(), 3);
    await printContext.close();
    const links = await browser.newContext();
    for (const [path, fragments] of localTargets) {
      const response = await links.request.get(base + path);
      assert.equal(response.status(), 200, 'Local destination: ' + path);
      if (fragments.size) {
        const html = await response.text();
        for (const fragment of fragments) assert.match(html, new RegExp('\\bid=["\']' + escapeRegex(fragment) + '["\']'), 'Local fragment exists: ' + path + '#' + fragment);
      }
    }
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: superset guide mobile/desktop, no-JS sequence/tables/disclosures, keyboard TOC, real store preview/links, source photo, next reads, all local targets/fragments and no answer storage/transmission.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
