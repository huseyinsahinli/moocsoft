// Development-only browser QA. No browser dependency ships to readers.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4200').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;
const slug = 'dry-to-cooked-rice-weight';

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
      page.on('response', response => { if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(response.url()); });
      assert.equal((await page.goto(base + '/guides/' + slug + '/')).status(), 200);
      assert.equal(await page.title(), 'Dry to Cooked Rice: Convert Your Portion by Weight | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('.app-install .install-link').count(), 2);
      const play = new URL(await page.locator('.app-install a[href*="play.google.com"]').getAttribute('href'));
      assert.equal(play.searchParams.get('id'), 'com.moocsoft.food_scan_ai');
      assert.equal(play.searchParams.get('utm_campaign'), 'guides-' + slug);
      assert.equal(await page.locator('.app-install a[href*="id6755138291"]').count(), 1);
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) await toc.locator('summary').click();
      await toc.locator('a[href="#step-1"]').click();
      assert.equal(new URL(page.url()).hash, '#step-1');
      const practice = page.locator('details[data-rice-practice]');
      assert(await practice.count() >= 2, 'Worked case and insufficient-information case stay readable without JavaScript');
      for (const disclosure of await practice.all()) {
        assert.equal(await disclosure.getAttribute('open'), null);
        await disclosure.locator('summary').click();
        assert.notEqual(await disclosure.getAttribute('open'), null);
      }
      const faq = page.locator('#questions details');
      assert(await faq.count() >= 4);
      await faq.first().locator('summary').click();
      assert.notEqual(await faq.first().getAttribute('open'), null);
      const image = page.locator('.guide-app-preview img');
      assert.equal(await image.count(), 1);
      await image.evaluate(img => img.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await image.evaluate(img => img.decode());
      assert(await image.evaluate(img => img.naturalWidth > 0));
      assert.equal(await image.getAttribute('src'), '/assets/apps/nutrilens/screenshot-2.jpg');
      assert.equal(await page.locator('section[aria-label="Suggested next reads"] .guide-card').count(), 3);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
      }
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, `rice-weight-${width}.png`) });
        await page.locator('.guide-table').first().evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, `rice-weight-example-${width}.png`) });
      }
      await context.close();
    }
    const links = await browser.newContext();
    for (const route of localPaths) assert.equal((await links.request.get(base + route)).status(), 200, route);
    await links.close();
    assert.deepEqual(errors, []);
    console.log('PASS: rice-weight guide mobile/desktop, no-JS worked answers/FAQ/navigation, real app preview/download links, public attribution and local paths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
