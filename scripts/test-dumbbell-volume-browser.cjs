// Development-only browser QA. No browser dependency is delivered to readers.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4204').replace(/\/$/, '');
const siteRoot = resolve(__dirname, '..');
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const slug = 'dumbbell-workout-volume';
const route = '/guides/' + slug + '/';

(async () => {
  const { guides } = await import(pathToFileURL(resolve(siteRoot, 'content/index.mjs')).href);
  const { createRelatedGuideSelector } = await import(pathToFileURL(resolve(siteRoot, 'content/related-guides.mjs')).href);
  const { guideHref } = await import(pathToFileURL(resolve(siteRoot, 'content/topics.mjs')).href);
  const guide = guides.find(item => item.slug === slug);
  assert(guide, 'The new article is registered exactly once');
  const expectedNext = createRelatedGuideSelector(guides)(guide);
  assert.equal(expectedNext.length, 3);
  assert(expectedNext.every(item => item.topic === 'training'));
  if (qaDir) {
    const distance = relative(siteRoot, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep QA evidence outside the public site');
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
        if (url.origin !== new URL(base).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected external request: ' + request.url());
      });
      assert.equal((await page.goto(base + route)).status(), 200);
      assert.equal(await page.title(), 'Dumbbell Workout Volume: One Weight or Both? | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow at ' + width);
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both real stores at ' + placement);
        for (const href of await links.evaluateAll(nodes => nodes.map(node => node.href))) {
          const url = new URL(href);
          if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6808200259$/);
          else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.didyoulift');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
          }
        }
      }
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) {
        await toc.locator('summary').focus();
        await page.keyboard.press('Enter');
      }
      assert(await toc.locator('nav').isVisible());
      await toc.locator('a[href="#step-1"]').focus();
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-1');
      await page.waitForFunction(() => {
        const target = document.querySelector('#step-1').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      });
      assert(await page.locator('.guide-article .guide-table table').count() >= 3, 'All three worked cases are static');
      const articleText = await page.locator('.guide-article').innerText();
      for (const value of ['720', '360', '192', '96', '230', '210', '440', '460']) assert(articleText.includes(value), 'Worked figure ' + value);
      const check = page.locator('details[data-dumbbell-check]');
      assert.equal(await check.count(), 1);
      assert.equal(await check.getAttribute('open'), null);
      await check.locator('summary').focus();
      await page.keyboard.press('Space');
      assert.notEqual(await check.getAttribute('open'), null, 'Original check opens with the keyboard, including without JavaScript');
      const faq = page.locator('#questions details');
      assert(await faq.count() >= 3);
      await faq.first().locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.notEqual(await faq.first().getAttribute('open'), null, 'FAQ is a native disclosure');
      const image = page.locator('.guide-app-preview img');
      assert.equal(await image.count(), 1);
      await image.evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await image.evaluate(node => node.decode());
      assert.equal(await image.getAttribute('src'), '/assets/apps/did-you-lift/app-store-set-log.jpg');
      assert.equal(await image.evaluate(node => node.naturalWidth), 600);
      assert.match(await page.locator('.guide-app-preview figcaption').innerText(), /Official iPhone store screenshot/);
      assert.match(await page.locator('.guide-app-preview').innerText(), /Premium/);
      const related = page.locator('section[aria-label="Suggested next reads"] .guide-card');
      assert.deepEqual(await related.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), expectedNext.map(guideHref));
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator('[id="' + href.slice(1) + '"]').count(), 1, href);
      }
      assert.equal(new URL(page.url()).search, '');
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0, 'This static worksheet introduces no answer transmission');
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'dumbbell-volume-' + width + '.png') });
        await page.locator('.guide-article .guide-table').first().evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await page.screenshot({ path: resolve(qaDir, 'dumbbell-volume-example-' + width + '.png') });
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const links = await browser.newContext();
    for (const local of localPaths) assert.equal((await links.request.get(base + local)).status(), 200, local);
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: dumbbell guide mobile/desktop, no-JS worked arithmetic, keyboard navigation/disclosures, real Did You Lift preview/stores, attribution, three next reads, local links and no new transmission/storage.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
