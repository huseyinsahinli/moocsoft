// Development-only browser QA. No browser dependency is shipped to readers.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4199').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;
const slug = 'flutter-camera-permission-test-checklist';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const localPaths = new Set();
  if (qaDir) mkdirSync(qaDir, { recursive: true });
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(response.url());
      });
      assert.equal((await page.goto(base + '/guides/' + slug + '/')).status(), 200);
      assert.equal(await page.title(), 'Flutter Camera Permissions: iOS and Android Test Checklist | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('.app-install, .install-link').count(), 0, 'Service guide must not get a fabricated app install header');
      assert(await page.locator('a[href="/hire-flutter-developer/"]').count() > 0);
      assert(await page.locator('[aria-label="Discuss a Flutter project"]').isVisible());
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) await toc.locator('summary').click();
      await toc.locator('a[href="#step-1"]').click();
      assert.equal(new URL(page.url()).hash, '#step-1');
      const faq = page.locator('#questions details');
      assert(await faq.count() >= 4);
      await faq.first().locator('summary').click();
      assert.notEqual(await faq.first().getAttribute('open'), null, 'Native answers work with JavaScript disabled');
      assert(await page.locator('.guide-table table tbody tr').count() >= 7);
      const table = page.locator('.guide-table').first();
      if (width === 390) assert(await table.evaluate(element => element.scrollWidth >= element.clientWidth));
      assert.equal(await page.locator('section[aria-label="Suggested next reads"] .guide-card').count(), 3);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
      }
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, `camera-permissions-${width}.png`) });
        await table.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, `camera-permissions-matrix-${width}.png`) });
      }
      // Existing app guides must retain their real two-store download header.
      await page.goto(base + '/guides/how-to-log-gym-workouts/');
      assert.equal(await page.locator('.app-install .install-link').count(), 2);
      const play = await page.locator('.app-install a[href*="play.google.com"]').getAttribute('href');
      assert.equal(new URL(play).searchParams.get('id'), 'com.moocsoft.didyoulift');
      assert.equal(new URL(play).searchParams.get('utm_campaign'), 'guides-how-to-log-gym-workouts');
      assert.equal(await page.locator('.app-install a[href*="id6808200259"]').count(), 1);
      await context.close();
    }
    const links = await browser.newContext();
    for (const route of localPaths) assert.equal((await links.request.get(base + route)).status(), 200, route);
    await links.close();
    assert.deepEqual(errors, []);
    console.log('PASS: camera checklist mobile/desktop, no-JS native navigation/FAQ, scrollable matrix, genuine service CTA, preserved app install links and local paths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
