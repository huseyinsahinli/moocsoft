// Development-only browser test. No browser library ships with the website.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4197').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;
const examples = [
  'estimate-calories-from-food-photo', '52-week-savings-challenge',
  'calculate-cigarette-cost-and-savings', 'workout-volume-explained',
  'monthly-habit-tracker', 'missing-number-puzzles-with-answers',
  'ai-calorie-scanner-accuracy', 'savings-tracker-irregular-income',
  'repeating-pattern-puzzles-with-answers', 'count-rectangles-in-a-grid',
  'round-robin-match-count',
  'weekly-reset-checklist', 'mobile-app-mvp-checklist',
];

(async () => {
  const { guides } = await import(pathToFileURL(resolve(__dirname, '../content/index.mjs')).href);
  const { createRelatedGuideSelector } = await import(pathToFileURL(resolve(__dirname, '../content/related-guides.mjs')).href);
  const { guideHref } = await import(pathToFileURL(resolve(__dirname, '../content/topics.mjs')).href);
  const select = createRelatedGuideSelector(guides);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  if (qaDir) mkdirSync(qaDir, { recursive: true });
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'en-US' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      for (const slug of examples) {
        assert.equal((await page.goto(`${base}/guides/${slug}/`)).status(), 200);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No overflow: ${slug} at ${width}`);
        const toc = page.locator('.guide-toc');
        const menu = toc.locator('details');
        assert.equal(await menu.evaluate(element => element.open), width > 900, `Responsive default: ${slug}`);
        const tocBox = await toc.boundingBox();
        const articleBox = await page.locator('.guide-article').boundingBox();
        if (width === 390) {
          assert(tocBox.y + tocBox.height <= articleBox.y, 'Compact mobile navigation comes before the answer');
          await toc.locator('summary').click();
        } else assert(tocBox.x >= articleBox.x + articleBox.width, 'Desktop navigation stays beside the article');
        assert(await menu.locator('nav').isVisible());
        await menu.locator('a[href="#step-1"]').click();
        await page.waitForFunction(() => {
          const section = document.querySelector('#step-1').getBoundingClientRect();
          const header = document.querySelector('.site-header').getBoundingClientRect();
          return section.top >= header.bottom - 1 && section.top < innerHeight;
        });
        assert.equal(new URL(page.url()).hash, '#step-1');
        const related = page.locator('section[aria-label="Suggested next reads"]');
        assert.deepEqual(await related.locator('.guide-card').evaluateAll(links => links.map(link => new URL(link.href).pathname + new URL(link.href).hash)), select(slug).map(guideHref));
        const guide = guides.find(guide => guide.slug === slug);
        assert.equal(await related.locator(`a[href="/guides/${guide.topic}/"]`).count(), 1);
        if (guide.appPreview) {
          await menu.locator('a[href="#app-preview-title"]').click();
          await page.waitForFunction(() => {
            const title = document.querySelector('#app-preview-title').getBoundingClientRect();
            return title.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && title.top < innerHeight;
          });
        }
        if (qaDir && ['calculate-cigarette-cost-and-savings', 'monthly-habit-tracker'].includes(slug)) {
          await page.screenshot({ path: resolve(qaDir, `${slug}-navigation-${width}.png`) });
          const preview = page.locator('.guide-app-preview');
          await preview.scrollIntoViewIfNeeded();
          await preview.locator('img').evaluate(image => image.decode());
          assert.equal(await preview.locator('img').evaluate(image => image.naturalWidth), 554);
          assert.equal(await preview.locator('a[data-placement="guide-preview"]').count(), guide.topic === 'quitting' ? 1 : 2);
          // Keep the whole card below the sticky header during the evidence capture.
          const cardHeight = await preview.evaluate(element => element.getBoundingClientRect().height);
          await page.setViewportSize({ width, height: Math.max(900, Math.ceil(cardHeight) + 300) });
          await preview.evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().height - 16, behavior: 'instant' }));
          await preview.screenshot({ path: resolve(qaDir, `${slug}-preview-${width}.png`) });
          await page.setViewportSize({ width, height: 900 });
        }
      }
      for (const [path, answer, title] of [
        ['/tools/52-week-savings-calculator/', '$1,378', '52-Week Savings Calculator: Standard & Reverse Chart'],
        ['/tools/workout-volume-rest-timer/', '1,500 kg', 'Workout Volume Calculator & Rest Timer'],
      ]) {
        await page.goto(base + path);
        assert((await page.locator('.tool-quick-answer').innerText()).includes(answer));
        assert.equal(await page.title(), title, 'Rendered search title stays consistent after initialization');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Tool answer fits at ${width}`);
        if (path.includes('workout-volume')) {
          await page.locator('#timer-toggle').click();
          assert.match(await page.title(), /^01:30 · Rest Timer$/);
          await page.locator('#timer-toggle').click();
          assert.equal(await page.title(), title, 'Pausing restores the canonical page title');
          await page.locator('#timer-reset').click();
          assert.equal(await page.title(), title, 'Resetting restores the canonical page title');
        }
      }
      await page.goto(`${base}/guides/monthly-habit-tracker/`);
      await page.setViewportSize({ width: width === 390 ? 1280 : 390, height: 900 });
      assert.equal(await page.locator('.guide-toc-menu').evaluate(element => element.open), width === 390, 'Crossing the breakpoint updates the layout');
      await context.close();

      const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } });
      await noJs.route('https://fonts.googleapis.com/**', route => route.abort());
      await noJs.route('https://fonts.gstatic.com/**', route => route.abort());
      const plain = await noJs.newPage();
      await plain.goto(`${base}/guides/calculate-cigarette-cost-and-savings/`);
      assert.equal(await plain.locator('.guide-toc-menu').getAttribute('open'), null);
      await plain.locator('.guide-toc-menu summary').click();
      assert.notEqual(await plain.locator('.guide-toc-menu').getAttribute('open'), null, 'Native menu works without JavaScript');
      assert(await plain.locator('.guide-toc-menu nav').isVisible());
      await plain.locator('.guide-toc-menu a[href="#step-1"]').click();
      assert.equal(new URL(plain.url()).hash, '#step-1');
      assert.equal(await plain.locator('.guide-app-preview .install-link').count(), 1, 'iOS-only QuitBit stays iOS-only');
      await noJs.close();
    }
    assert.deepEqual(errors, []);
    console.log(`Guide navigation passed: ${examples.length} guides across app and service topics, mobile/desktop layout, native no-JS links, curated next reads, real app previews and calculator quick answers.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
