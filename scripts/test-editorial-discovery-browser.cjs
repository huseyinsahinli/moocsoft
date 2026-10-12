// Development-only browser QA. No browser package ships with the public site.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4198').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;

(async () => {
  const { guides } = await import(pathToFileURL(resolve(__dirname, '../content/index.mjs')).href);
  const { apps } = await import(pathToFileURL(resolve(__dirname, '../content/apps.mjs')).href);
  const { selectHomePicks, selectProductPicks } = await import(pathToFileURL(resolve(__dirname, '../content/discovery.mjs')).href);
  const slugs = selectHomePicks(guides).map(guide => guide.slug);
  if (qaDir) mkdirSync(qaDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  try {
    for (const width of [360, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(response.url()); });
      const visit = async route => {
        assert.equal((await page.goto(base + route)).status(), 200, route);
        assert.equal(await page.locator('h1').count(), 1, route);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route} overflow ${width}`);
      };
      await visit('/guides/');
      assert.equal(await page.locator('#guide-library a.guide-card').count(), guides.length);
      const shown = () => page.locator('#guide-library a.guide-card:visible').count();
      assert.equal(await shown(), guides.length);
      assert.equal(await page.locator('.reader-journey').count(), 3);
      const form = page.locator('[data-guide-filter]');
      assert.equal(await form.isVisible(), javaScriptEnabled);
      if (javaScriptEnabled) {
        const query = form.locator('[name=q]');
        const topic = form.locator('[name=topic]');
        const format = form.locator('[name=format]');
        const requests = [];
        page.on('request', request => requests.push(request.url()));
        await query.fill('CAFE logic');
        assert.equal(await shown(), 1, 'Accent-insensitive AND-word matching');
        await topic.selectOption('math');
        await format.selectOption('puzzle');
        assert.equal(await shown(), 1);
        assert.equal(await page.locator('#guide-library [data-guide-topic]:not(a.guide-card):visible').count(), 1);
        await topic.selectOption('nutrition');
        assert.equal(await shown(), 0);
        assert(await page.locator('[data-guide-no-results]').isVisible());
        assert.match(await page.locator('[data-guide-result-count]').innerText(), /^0 of/);
        await form.locator('button[type=reset]').click();
        assert.equal(await query.inputValue(), '');
        assert.equal(await shown(), guides.length);
        await format.selectOption('story');
        assert.equal(await shown(), guides.filter(guide => guide.editorialFormat === 'story').length);
        await query.fill('zz-private-filter-probe-5187');
        await query.press('Enter');
        assert.equal(await shown(), 0);
        assert.equal(new URL(page.url()).pathname, '/guides/');
        assert.equal(new URL(page.url()).search, '');
        assert(!requests.some(url => url.includes('zz-private-filter')));
        assert.deepEqual(await page.evaluate(() => [Object.keys(localStorage), Object.keys(sessionStorage)]), [[], []]);
        await form.locator('button[type=reset]').click();
        if (qaDir) {
          await page.locator('#guide-library').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
          await page.screenshot({ path: resolve(qaDir, `library-${width}.png`) });
        }
      }
      for (const slug of slugs) {
        await visit(`/guides/${slug}/`);
        const guide = guides.find(guide => guide.slug === slug);
        assert.equal(await page.locator('.site-header .install-link').count(), guide.topic === 'development' ? 0 : 2);
        const faq = page.locator('#questions details');
        await faq.first().locator('summary').click();
        assert.notEqual(await faq.first().getAttribute('open'), null);
        const toc = page.locator('.guide-toc-menu');
        if (await toc.getAttribute('open') === null) await toc.locator('summary').click();
        await toc.locator('a[href="#step-1"]').click();
        assert.equal(new URL(page.url()).hash, '#step-1');
        if (guide.topic === 'math') {
          await page.getByText('Show the complete café answer and explanation', { exact: true }).click();
          assert(await page.locator('details[open]').filter({ hasText: 'Maya' }).count() > 0);
        }
        const image = page.locator('.guide-app-preview img');
        if (await image.count()) {
          await image.evaluate(img => img.scrollIntoView({ behavior: 'instant', block: 'center' }));
          await image.evaluate(img => img.decode());
          assert(await image.evaluate(img => img.naturalWidth > 0));
        }
        if (qaDir && javaScriptEnabled && guide.topic === 'math') {
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: resolve(qaDir, `mystery-${width}.png`) });
        }
      }
      await visit('/');
      assert.equal(await page.locator('#guides .guide-card').count(), 3);
      for (const guide of selectHomePicks(guides)) assert.equal(await page.locator(`#guides a[href="/guides/${guide.slug}/"]`).count(), 1);
      for (const [topic, app] of Object.entries(apps)) {
        await visit(`/${app.slug}/`);
        const reading = page.locator('.guide-inline-resources[style]');
        assert.equal(await reading.locator('.guide-card').count(), 3);
        for (const guide of selectProductPicks(guides, topic)) assert.equal(await reading.locator(`a[href="/guides/${guide.slug}/"]`).count(), 1);
        assert(await page.locator('.site-header .install-link').first().isVisible());
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: library search/topic/format/reset/no-match, no query requests or storage, full static no-JS library, three new formats, native puzzle hints/answer, homepage picks and six curated product journeys at mobile/desktop widths.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
