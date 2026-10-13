// Isolated development-only QA. No browser dependency is shipped to visitors.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4198').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;

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
      assert.equal((await page.goto(base + '/guides/elapsed-time-across-midnight/')).status(), 200);
      assert.equal(await page.title(), 'How to Calculate Elapsed Time Across Midnight | Moocsoft');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('.app-install .install-link').count(), 2);
      const play = await page.locator('.app-install a[href*="play.google.com"]').getAttribute('href');
      assert.equal(new URL(play).searchParams.get('id'), 'com.moocsoft.math_puzzle');
      assert.equal(new URL(play).searchParams.get('utm_campaign'), 'guides-elapsed-time-across-midnight');
      assert.equal(await page.locator('.app-install a[href*="id6449851642"]').count(), 1);
      const toc = page.locator('.guide-toc-menu');
      if (!await toc.evaluate(element => element.open)) await toc.locator('summary').click();
      await toc.locator('a[href="#step-3"]').click();
      assert.equal(new URL(page.url()).hash, '#step-3');
      const answers = page.locator('#step-3 details');
      assert.equal(await answers.count(), 5);
      for (const answer of await answers.all()) {
        assert.equal(await answer.getAttribute('open'), null);
        await answer.locator('summary').click();
        assert.notEqual(await answer.getAttribute('open'), null);
      }
      assert.equal(await page.locator('section[aria-label="Suggested next reads"] .guide-card').count(), 3);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
      }
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, `elapsed-time-${width}.png`) });
        await page.locator('#step-3').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, `elapsed-time-answers-${width}.png`) });
      }
      await context.close();
    }
    const links = await browser.newContext();
    for (const route of localPaths) assert.equal((await links.request.get(base + route)).status(), 200, route);
    await links.close();
    assert.deepEqual(errors, []);
    console.log('PASS: elapsed-time guide mobile/desktop, no-JS native answers and navigation, real store CTAs, attribution, responsive layout and local links.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
