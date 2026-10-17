// Isolated, development-only browser checks. No service access or backend tests are simulated.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4207').replace(/\/$/, '');
const root = resolve(__dirname, '..');
const route = '/guides/mobile-app-backend-decision/';
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
// Poll from Node: page-side timer polling does not run in a JavaScript-disabled context.
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
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Evidence stays outside public files');
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
      assert.equal(await page.title(), 'Does Your Mobile App Need a Backend? A Decision Checklist | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('.app-install, .guide-app-preview').count(), 0, 'Service guide has no unrelated store promotion');
      const service = page.locator('[aria-label="Discuss a Flutter project"]');
      assert(await service.isVisible());
      assert.equal(await service.locator('a[href="/hire-flutter-developer/"]').count(), 1);
      assert.equal(await page.locator('.guide-table table').count(), 3);
      for (const table of await page.locator('.guide-table').all()) {
        assert.equal(await table.getAttribute('tabindex'), '0');
        await table.scrollIntoViewIfNeeded();
        await table.focus();
        assert(await table.evaluate(node => node === document.activeElement));
        if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the focused table');
        }
      }
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) {
        await toc.locator('summary').focus();
        await page.keyboard.press('Enter');
      }
      await toc.locator('a[href="#step-3"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-3');
      await eventually(() => page.evaluate(() => {
        const target = document.querySelector('#step-3').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }), 'Section link lands below the sticky header at ' + width + ', JS=' + javaScriptEnabled);
      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 4);
      await faq.first().locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await faq.first().getAttribute('open'), null);
      const related = page.locator('section[aria-label="Suggested next reads"] .guide-card');
      assert.deepEqual(await related.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [
        '/guides/offline-first-flutter-app-local-storage-cloud-sync/',
        '/guides/mobile-app-mvp-checklist/',
        '/guides/mobile-app-handover-checklist/',
      ]);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator('[id="' + href.slice(1) + '"]').count(), 1);
      }
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'backend-guide-' + width + '.png') });
        await page.locator('#step-3').evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, 'backend-example-' + width + '.png') });
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const linkContext = await browser.newContext();
    for (const path of localPaths) assert.equal((await linkContext.request.get(base + path)).status(), 200, path);
    await linkContext.close();
    assert.deepEqual(failures, []);
    console.log('PASS: backend guide mobile/desktop with and without JS, service CTA, keyboard TOC/tables/FAQ, next reads, local links and no extra network/storage.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
