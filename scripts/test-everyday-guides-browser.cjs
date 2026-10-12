// Development-only QA; no Playwright code or browser dependency is shipped.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4198').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;
const slugs = ['log-exercise-substitution-busy-gym', 'annual-bills-sinking-fund', 'mobile-app-bug-report-template'];

(async () => {
  const { guides } = await import(pathToFileURL(resolve(__dirname, '../content/index.mjs')).href);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const paths = new Set();
  if (qaDir) mkdirSync(qaDir, { recursive: true });
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      for (const slug of slugs) {
        const guide = guides.find(item => item.slug === slug);
        assert.equal((await page.goto(`${base}/guides/${slug}/`)).status(), 200);
        assert.equal(await page.title(), `${guide.title} | Moocsoft`);
        assert.equal(await page.locator('h1').innerText(), guide.title);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${slug}: ${width}px JS=${javaScriptEnabled}`);
        const install = page.locator('.app-install .install-link');
        assert.equal(await install.count(), guide.topic === 'development' ? 0 : 2);
        if (guide.topic === 'development') assert(await page.locator('a[href="/hire-flutter-developer/"]').count() > 0);
        for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
          if (href.startsWith('/') && !href.startsWith('//')) paths.add(href.split('#')[0]);
        }
        const menu = page.locator('.guide-toc-menu');
        if (!await menu.evaluate(element => element.open)) await menu.locator('summary').click();
        await menu.locator('a[href="#step-1"]').click();
        assert.equal(new URL(page.url()).hash, '#step-1');
        assert.equal(await page.locator('section[aria-label="Suggested next reads"] .guide-card').count(), 3);
        for (const table of await page.locator('.guide-table').all()) {
          assert(await table.getAttribute('aria-label'));
          assert(await table.locator('caption').count() > 0);
          assert(await table.locator('th[scope="col"]').count() > 0);
        }
        if (qaDir && javaScriptEnabled) {
          await page.goto(`${base}/guides/${slug}/`);
          await page.screenshot({ path: resolve(qaDir, `${slug}-${width}.png`) });
          if (slug === 'mobile-app-bug-report-template') {
            const template = page.locator('#step-2');
            await template.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }));
            await page.screenshot({ path: resolve(qaDir, `bug-report-template-${width}.png`) });
          }
        }
      }
      await context.close();
    }
    const linkContext = await browser.newContext();
    for (const path of paths) {
      const response = await linkContext.request.get(base + path);
      assert.equal(response.status(), 200, `Internal link ${path}`);
    }
    await linkContext.close();
    assert.deepEqual(errors, []);
    console.log(`PASS: three new guides at mobile/desktop with and without JS, install/service CTAs, native navigation, accessible tables and ${paths.size} internal destinations.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
