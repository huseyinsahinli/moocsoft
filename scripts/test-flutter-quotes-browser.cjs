// Isolated development-only browser checks; no service or app is contacted.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4219').replace(/\/$/, '');
const route = '/guides/compare-flutter-app-development-quotes/';

(async () => {
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
      assert.equal(await page.title(), 'Flutter App Development Cost: How to Compare Quotes | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('.app-install, .guide-app-preview').count(), 0);
      assert(await page.locator('.guide-visual').isVisible());
      const image = page.locator('.guide-visual img');
      assert(await image.getAttribute('alt'));
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(img => img.decode());
      const imageMetrics = await image.evaluate(img => ({ complete: img.complete, width: img.naturalWidth, currentSrc: img.currentSrc }));
      assert(imageMetrics.complete && imageMetrics.width > 0, JSON.stringify(imageMetrics));
      assert((await page.locator('.guide-visual figcaption').innerText()).includes('AI-generated editorial illustration'));
      assert.equal(await page.locator('.quote-comparison-flow li').count(), 4);
      assert.equal(await page.locator('.guide-table table').count(), 2);
      const gridColumns = await page.locator('.quote-comparison-flow ol').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(gridColumns, width <= 440 ? 1 : 4);
      const cta = page.locator('[aria-label="Discuss a Flutter project"]');
      assert(await cta.isVisible());
      assert.equal(await cta.locator('a[href="/hire-flutter-developer/"]').count(), 1);
      for (const table of await page.locator('.guide-table').all()) {
        assert.equal(await table.getAttribute('tabindex'), '0');
        await table.scrollIntoViewIfNeeded();
        await table.focus();
        assert(await table.evaluate(node => node === document.activeElement));
      }
      const related = page.locator('section[aria-label="Suggested next reads"] .guide-card');
      assert.deepEqual(await related.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [
        '/guides/mobile-app-mvp-checklist/', '/guides/mobile-app-backend-decision/', '/hire-flutter-developer/',
      ]);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator('[id="' + href.slice(1) + '"]').count(), 1);
      }
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const linkContext = await browser.newContext();
    for (const path of localPaths) assert.equal((await linkContext.request.get(base + path)).status(), 200, path);
    await linkContext.close();
    assert.deepEqual(failures, []);
    console.log('PASS: quote guide mobile/desktop with and without JS, responsive illustration, comparison tables, service CTA, curated reading, local links and no extra network/storage.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
