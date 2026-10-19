// Isolated development-only article QA, not a food-analysis or absorption test.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4209').replace(/\/$/, '');
const root = resolve(__dirname, '..');
const slug = 'count-cooking-oil-calories';
const route = '/guides/' + slug + '/';
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
async function eventually(check, message) {
  for (let attempt = 0; attempt < 30; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail(message);
}

(async () => {
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep evidence outside public files');
    mkdirSync(qaDir, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localPaths = new Set();
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
      assert.equal(await page.title(), 'How to Count Cooking Oil Calories Without Counting Twice | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both real stores at ' + placement);
        for (const href of await links.evaluateAll(nodes => nodes.map(node => node.href))) {
          const url = new URL(href);
          if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6755138291$/);
          else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.food_scan_ai');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
          }
        }
      }
      assert.equal(await page.locator('.guide-table table').count(), 4);
      for (const table of await page.locator('.guide-table').all()) {
        await table.scrollIntoViewIfNeeded();
        await table.focus();
        assert(await table.evaluate(node => node === document.activeElement));
        if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls focused table');
        }
      }
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) {
        await toc.locator('summary').focus();
        await page.keyboard.press('Enter');
      }
      await toc.locator('a[href="#step-2"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-2');
      await eventually(() => page.evaluate(() => {
        const top = document.querySelector('#step-2').getBoundingClientRect().top;
        return top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && top < innerHeight;
      }), 'Worked example lands below the store header');
      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 4);
      await faq.first().locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await faq.first().getAttribute('open'), null);
      const preview = page.locator('.guide-app-preview img');
      assert.equal(await preview.count(), 1);
      await preview.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await preview.evaluate(node => node.decode());
      assert.equal(await preview.getAttribute('src'), '/assets/apps/nutrilens/screenshot-2.jpg');
      assert.equal(await preview.evaluate(node => node.naturalWidth), 554);
      assert.match(await page.locator('.guide-app-preview figcaption').innerText(), /Store screenshot/);
      assert.match(await page.locator('.guide-app-preview').innerText(), /Premium/);
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [
        '/guides/track-calories-homemade-meals/', '/guides/calories-per-serving-vs-per-container/', '/guides/ai-calorie-scanner-accuracy/',
      ]);
      const text = await page.locator('.guide-article').innerText();
      for (const value of ['842', '814', '240 kcal', '60 kcal', '90 kcal', '30 kcal']) assert(text.includes(value), value);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator('[id="' + href.slice(1) + '"]').count(), 1);
      }
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'cooking-oil-' + width + '.png') });
        await page.locator('#step-2').evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, 'oil-example-' + width + '.png') });
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const linkContext = await browser.newContext();
    for (const path of localPaths) assert.equal((await linkContext.request.get(base + path)).status(), 200, path);
    await linkContext.close();
    assert.deepEqual(failures, []);
    console.log('PASS: cooking-oil guide mobile/desktop with and without JS, native keyboard tables/TOC/FAQ, real NutriLens preview/stores/attribution, local links and no extra storage/transmission.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
