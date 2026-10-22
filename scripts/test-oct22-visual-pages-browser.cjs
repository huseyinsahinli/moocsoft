// Isolated development-only regression checks for the 22 October visual update.
// This verifies the website, not an installed app's large-text behavior.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4213').replace(/\/$/, '');
const origin = new URL(base).origin;
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const load = name => import(pathToFileURL(resolve(root, 'content', name)).href);
const articleRoute = '/guides/mobile-app-large-text-testing/';
const normal = value => value.replace(/\s+/g, ' ').trim();
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const canonicalStore = href => {
  const url = new URL(href);
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key);
  return url.href;
};
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
  }, 'Focus scrolling settles before native key activation');
  assert(await locator.evaluate(node => node === document.activeElement));
}

(async () => {
  const [{ guides }, { apps, site }, { editorialPhotos }, { englishVisualTopics, germanVisualTopics }, { germanGuides }, { largeTextCases }] = await Promise.all([
    load('index.mjs'), load('apps.mjs'), load('editorial-media.mjs'), load('page-visuals.mjs'), load('de-index.mjs'), load('development-large-text.mjs'),
  ]);
  const guide = guides.find(item => '/guides/' + item.slug + '/' === articleRoute);
  assert(guide && guide.topic === 'development' && guide.published === '2026-10-22');
  assert.equal(largeTextCases.length, 6);
  assert.equal(englishVisualTopics.length, 7);
  const germanTopics = germanVisualTopics(germanGuides);
  assert.equal(germanTopics.length, 3);
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'QA images stay outside the public site');
    mkdirSync(qaDir, { recursive: true });
  }

  const routes = [articleRoute, ...englishVisualTopics.map(item => item.href), '/guides/', '/de/guides/', '/hire-flutter-developer/', '/math-riddles/'];
  const failures = [], localTargets = new Map();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  let visits = 0;
  async function contextFor(width, javaScriptEnabled) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
    await context.route('https://fonts.googleapis.com/**', route => route.abort());
    await context.route('https://fonts.gstatic.com/**', route => route.abort());
    context.on('page', page => {
      page.on('pageerror', error => failures.push(error.message));
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
  async function storeTargets(page, expectedApp = null) {
    for (const link of await page.locator('a.install-link').all()) {
      const key = await link.getAttribute('data-app');
      const app = Object.values(apps).find(item => item.slug === key);
      assert(app, 'Every existing install link belongs to a real catalogue app');
      assert([app.apple, app.google].filter(Boolean).includes(canonicalStore(await link.getAttribute('href'))), 'Verified store destination retained');
      const url = new URL(await link.getAttribute('href'));
      if (url.hostname === 'play.google.com') {
        assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
        assert.equal(url.searchParams.get('utm_medium'), 'referral');
        assert.equal(url.searchParams.get('utm_content'), await link.getAttribute('data-placement'));
        assert.deepEqual([...url.searchParams.keys()].sort(), ['id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].sort());
      } else assert.equal(url.search, '', 'App Store target stays canonical');
    }
    const header = page.locator('.site-header .install-link');
    assert.equal(await header.count(), expectedApp ? [expectedApp.apple, expectedApp.google].filter(Boolean).length : 0, 'Correct app or service header retained');
    if (expectedApp) {
      assert.deepEqual((await header.evaluateAll(nodes => nodes.map(node => node.href))).map(canonicalStore).sort(), [expectedApp.apple, expectedApp.google].filter(Boolean).sort());
      for (const link of await header.all()) {
        assert(await link.isVisible());
        assert((await link.boundingBox()).height >= 44, 'Header install action stays touch-sized');
      }
    }
  }
  async function collectLinks(page, route) {
    for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
      if ((!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
      const url = new URL(href, base + route);
      if (!localTargets.has(url.pathname)) localTargets.set(url.pathname, new Set());
      if (url.hash) localTargets.get(url.pathname).add(decodeURIComponent(url.hash.slice(1)));
    }
  }
  async function visuals(page, route, fallback = false) {
    const images = page.locator('img[data-page-visual="photo"], .guide-article > .guide-visual img, .product-puzzle-visual img');
    const topic = englishVisualTopics.find(item => item.href === route);
    const expected = route === '/guides/' ? 7 : route === '/de/guides/' ? 3 : route === '/hire-flutter-developer/' ? 0 : 1;
    assert.equal(await images.count(), expected, 'Expected relevant visual count: ' + route);
    for (const image of await images.all()) {
      assert.equal(await image.getAttribute('width'), '1200');
      assert.equal(await image.getAttribute('height'), '675');
      assert.equal(await image.getAttribute('loading'), 'lazy');
      assert((await image.getAttribute('alt')).length > 35, 'Descriptive non-empty visual alt');
      const picture = image.locator('..');
      const source = picture.locator('source[type="image/webp"]');
      assert.equal(await source.count(), 1);
      assert.match(await source.getAttribute('srcset'), /480w.*800w.*1200w/);
      assert.match(await source.getAttribute('sizes'), /100vw/);
      await image.scrollIntoViewIfNeeded();
      if (fallback) {
        await source.evaluate(node => node.remove());
        await eventually(() => image.evaluate(node => Boolean(node.currentSrc) && new URL(node.currentSrc, document.baseURI).pathname === node.getAttribute('src')), 'Native JPEG/PNG fallback selected');
      }
      await image.evaluate(node => node.decode());
      assert(await image.evaluate(node => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0), 'Visual decodes: ' + route);
      assert.match(await image.evaluate(node => node.currentSrc), fallback ? /\.(?:jpg|png)$/ : /\.webp$/);
      const box = await image.boundingBox();
      assert(box && box.width > 0 && box.height > 0 && Math.abs(box.width / box.height - 16 / 9) < .01, 'Image retains its aspect ratio');
    }
    if (topic) {
      const caption = page.locator('figure.page-topic-photo figcaption');
      assert.equal(normal(await caption.innerText()), normal(topic.visual.caption));
      assert(await caption.isVisible());
      assert.equal(await images.first().getAttribute('src'), topic.visual.src);
      assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), site + topic.visual.src);
    }
    if (route === '/guides/' || route === '/de/guides/') {
      const disclosure = page.locator('.page-visual-disclosure');
      assert(await disclosure.isVisible());
      assert.match(await disclosure.innerText(), route.startsWith('/de/') ? /KI.generiert/i : /AI.generated/i);
    }
  }
  async function navigation(page, entries) {
    const cards = page.locator('a.page-topic-card');
    assert.deepEqual(await cards.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), entries.map(item => item.href));
    for (let index = 0; index < entries.length; index++) {
      const card = cards.nth(index);
      assert((await card.innerText()).includes(entries[index].label));
      await focus(page, card);
      assert((await card.boundingBox()).height >= 44);
      assert.equal(await card.locator('img').getAttribute('alt'), entries[index].visual.alt);
    }
  }
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await contextFor(width, javaScriptEnabled);
      const page = await context.newPage();
      for (const route of routes) {
        assert.equal((await page.goto(base + route)).status(), 200, route);
        visits++;
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), site + route);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow: ' + route + ', width=' + width);
        await collectLinks(page, route);
        const topic = englishVisualTopics.find(item => item.href === route)?.topic;
        await storeTargets(page, route === '/math-riddles/' ? apps.math : apps[topic] || null);
        await visuals(page, route);
        if (route === articleRoute) {
          assert.equal(await page.title(), guide.title + ' | Moocsoft');
          assert.equal(await page.locator('.large-text-journey ol > li').count(), 4);
          assert.match(await page.locator('.large-text-journey figcaption').innerText(), /not an app screen.*completed test/i);
          assert.equal(await page.locator('.guide-article .guide-table tbody tr').count(), 6);
          for (const cell of await page.locator('.guide-article .guide-table tbody tr td:last-child').all()) assert.equal((await cell.innerText()).trim(), 'Untested');
          const table = page.locator('.guide-article .guide-table');
          assert.equal(await table.getAttribute('tabindex'), '0');
          await focus(page, table);
          if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
            await page.keyboard.press('ArrowRight');
            await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Six-case matrix scrolls from keyboard');
          }
          assert.equal(await page.locator('.guide-article > figure.guide-visual img').getAttribute('src'), editorialPhotos.development.src);
          assert.match(await page.locator('.guide-article > figure.guide-visual figcaption').innerText(), /AI.generated/i);
          assert.equal(await page.locator('.guide-app-preview, .guide-download .install-link').count(), 0);
          assert.equal(await page.locator('.guide-download a[href="/hire-flutter-developer/"]').count(), 1, 'One honest service CTA block');
          assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0);
          assert.match(await page.locator('.guide-editor-note[aria-label="Copyable large-text test note"]').innerText(), /Evidence:\s*None collected/);
        }
        if (route === '/guides/') {
          await navigation(page, englishVisualTopics);
          const cards = page.locator('#guide-library a.guide-card[data-guide-topic]');
          assert.equal(await cards.count(), guides.length, 'Visual navigator does not replace or duplicate article cards');
          const form = page.locator('form[data-guide-filter]');
          if (javaScriptEnabled) {
            assert(await form.isVisible());
            await form.locator('input[name="q"]').fill('Large Text in Mobile Apps');
            assert.equal(await cards.filter({ visible: true }).count(), 1);
            assert.equal(await cards.filter({ visible: true }).first().getAttribute('href'), articleRoute);
            assert.equal(await page.locator('.page-topic-card:visible').count(), 7, 'Filtering does not hide the independent topic navigator');
            await form.locator('button[type="reset"]').click();
            assert.equal(await cards.filter({ visible: true }).count(), guides.length);
          } else {
            assert.equal(await form.getAttribute('hidden'), '');
            assert.equal(await cards.filter({ visible: true }).count(), guides.length, 'Full catalogue works without JavaScript');
          }
          assert.equal(await page.locator('.guide-app-choices a.guide-app-choice').count(), 6);
        }
        if (route === '/de/guides/') await navigation(page, germanTopics);
        if (route === '/hire-flutter-developer/') {
          const flow = page.locator('ol.service-process');
          assert.equal(await flow.locator('> li').count(), 4);
          assert.match(await flow.innerText(), /Share the goal.*Define the first scope.*Build and review.*Prepare to launch/s);
          assert.match(await page.locator('.service-process-note').innerText(), /not a fixed timeline/i);
          assert(await page.locator('a[href="/tools/app-brief-builder/"]').count() > 0);
        }
        if (route === '/math-riddles/') {
          assert.match(await page.locator('.product-puzzle-visual figcaption').innerText(), /not an app screenshot/i);
          const answer = page.locator('details.product-puzzle-answer');
          assert.equal(await answer.getAttribute('open'), null);
          await focus(page, answer.locator('summary'));
          await page.keyboard.press('Enter');
          assert.notEqual(await answer.getAttribute('open'), null, 'Original worked answer opens natively with no app script');
          assert.match(await answer.locator('p').innerText(), /^22\..*6 × 4 − 2 = 22/s);
          assert(await answer.locator('p').isVisible());
          await focus(page, answer.locator('summary'));
          await page.keyboard.press('Enter');
          assert.equal(await answer.getAttribute('open'), null);
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Expanded/native controls do not cause page overflow');
        if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
        if (qaDir && javaScriptEnabled && [articleRoute, '/guides/', '/guides/development/', '/hire-flutter-developer/', '/math-riddles/'].includes(route)) {
          const selector = route === articleRoute ? '.large-text-journey' : route === '/guides/' ? '.page-visual-topics' : route === '/hire-flutter-developer/' ? '.service-process' : route === '/math-riddles/' ? '.product-puzzle-visual' : '.page-topic-photo';
          // A component crop can auto-scroll under the sticky header. Hide only
          // that overlay during capture; normal layout/navigation is tested above.
          await page.locator(selector).screenshot({ path: resolve(qaDir, 'oct22-' + route.split('/').filter(Boolean).join('-') + '-' + width + '.png'), animations: 'disabled', style: '.site-header { visibility: hidden !important; }' });
        }
      }
      await context.close();
    }
    const fallback = await contextFor(390, false);
    const page = await fallback.newPage();
    for (const route of routes) {
      await page.goto(base + route);
      await visuals(page, route, true);
    }
    await fallback.close();

    const links = await browser.newContext();
    for (const [path, fragments] of localTargets) {
      assert.equal((await links.request.head(base + path)).status(), 200, 'Local target HEAD: ' + path);
      if (fragments.size) {
        const response = await links.request.get(base + path);
        assert.equal(response.status(), 200);
        const html = await response.text();
        for (const fragment of fragments) assert.match(html, new RegExp('\\bid=["\']' + escapeRegex(fragment) + '["\']'), 'Local fragment: ' + path + '#' + fragment);
      }
    }
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: ' + visits + ' mobile/desktop JS/no-JS visits; large-text guide matrix and journey, seven hubs, EN/DE visual navigators, preserved store/service actions, native math answer, responsive/fallback images and all ' + localTargets.size + ' local targets.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
