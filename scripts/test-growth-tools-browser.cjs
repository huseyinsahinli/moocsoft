// Development-only integration QA; no browser library is loaded by the site.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4202').replace(/\/$/, '');
const qa = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const destinations = [
  ['/guides/calculate-savings-goal-contributions/', '/tools/savings-goal-calculator/'],
  ['/guides/biweekly-savings-plan/', '/tools/savings-goal-calculator/'],
  ['/guides/vacation-savings-goal-plan/', '/tools/savings-goal-calculator/'],
  ['/guides/mobile-app-mvp-checklist/', '/tools/app-brief-builder/'],
  ['/hire-flutter-developer/', '/tools/app-brief-builder/'],
];
(async () => {
  if (qa) {
    const distance = relative(resolve(__dirname, '..'), qa);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'QA stays outside published site');
    mkdirSync(qa, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  try {
    for (const width of [320, 390, 1440]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, javaScriptEnabled, reducedMotion: 'reduce' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) errors.push(request.method()); });
      try {
        assert.equal((await page.goto(base + '/tools/')).status(), 200);
        assert.equal(await page.locator('.tool-card').count(), 8);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        for (const target of ['/tools/savings-goal-calculator/', '/tools/app-brief-builder/']) {
          const card = page.locator(`.tool-card[href="${target}"]`);
          assert(await card.isVisible());
          await card.click();
          assert.equal(new URL(page.url()).pathname, target);
          assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + target);
          await page.goto(base + '/tools/');
        }
        if (qa && javaScriptEnabled) await page.screenshot({ path: resolve(qa, `tools-${width}.png`), fullPage: true });
        for (const [source, target] of destinations) {
          assert.equal((await page.goto(base + source)).status(), 200);
          const link = page.locator(`a[href="${target}"]`).first();
          assert(await link.isVisible(), source + ' has a static useful next step');
          await link.click();
          assert.equal(new URL(page.url()).pathname, target);
        }
        await page.goto(base + '/');
        assert.match(await page.locator('.stat').filter({ hasText: 'Free tools' }).innerText(), /8\s+Free tools/i);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      } finally { await context.close(); }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: eight-tool directory, new canonical destinations, five static guide/service paths and homepage count at 320/390/1440px with JS on/off.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
