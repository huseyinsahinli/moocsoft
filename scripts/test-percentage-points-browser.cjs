// Isolated development-only browser QA; no score collection or app-level simulation.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4210').replace(/\/$/, '');
const root = resolve(__dirname, '..');
const slug = 'percentage-change-vs-percentage-points';
const route = '/guides/' + slug + '/';
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
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
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep screenshots outside public files');
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
      assert.equal(await page.title(), 'Percentage Change vs Percentage Points: 6 Examples | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both verified stores at ' + placement);
        for (const href of await links.evaluateAll(nodes => nodes.map(node => node.href))) {
          const url = new URL(href);
          if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6449851642$/);
          else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.math_puzzle');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
          }
        }
      }
      assert.equal(await page.locator('.guide-table table').count(), 2);
      for (const table of await page.locator('.guide-table').all()) {
        await table.scrollIntoViewIfNeeded();
        await table.focus();
        assert(await table.evaluate(node => node === document.activeElement));
        if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls table');
        }
      }
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) {
        await toc.locator('summary').focus();
        await page.keyboard.press('Enter');
      }
      const practiceLink = toc.locator('a[href="#step-4"]');
      await practiceLink.scrollIntoViewIfNeeded();
      await practiceLink.focus();
      // Let focus scrolling settle before activation; otherwise two native scrolls can compete.
      let priorScroll = null;
      await eventually(async () => {
        const current = await page.evaluate(() => scrollY);
        const stable = priorScroll !== null && Math.abs(current - priorScroll) < 1;
        priorScroll = current;
        return stable;
      }, 'Focus scrolling settles before activating the section link');
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-4');
      await eventually(() => page.evaluate(() => {
        const top = document.querySelector('#step-4').getBoundingClientRect().top;
        return top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && top < innerHeight;
      }), 'Practice section lands below the store header').catch(async error => {
        throw new Error(error.message + ': ' + JSON.stringify({ width, javaScriptEnabled, position: await page.evaluate(() => ({
          section: document.querySelector('#step-4').getBoundingClientRect().top,
          heading: document.querySelector('#step-4 h2').getBoundingClientRect().top,
          header: document.querySelector('.site-header').getBoundingClientRect().bottom,
          scrollY, hash: location.hash,
        })) }));
      });
      const practice = page.locator('details[data-percentage-practice]');
      assert.equal(await practice.count(), 6);
      for (const detail of await practice.all()) {
        assert.equal(await detail.getAttribute('open'), null);
        await detail.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.notEqual(await detail.getAttribute('open'), null);
        assert(await detail.locator('p').isVisible());
        await detail.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await detail.getAttribute('open'), null);
      }
      assert.equal(await page.locator('#questions details').count(), 4);
      assert.equal(await page.locator('.guide-app-preview img').count(), 0, 'Do not fabricate a percentage-mode screenshot');
      assert.match(await page.locator('.guide-app-preview').innerText(), /Premium/);
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), [
        '/guides/mental-math-games-for-adults/', '/guides/compare-fractions-without-decimals/', '/guides/mental-multiplication-tricks/',
      ]);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator('[id="' + href.slice(1) + '"]').count(), 1);
      }
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      if (qaDir && javaScriptEnabled) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'percentage-points-' + width + '.png') });
        await page.locator('#step-4').evaluate(node => node.scrollIntoView({ behavior: 'instant', block: 'start' }));
        await practice.first().locator('summary').click();
        await page.screenshot({ path: resolve(qaDir, 'percentage-practice-' + width + '.png') });
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const links = await browser.newContext();
    for (const path of localPaths) assert.equal((await links.request.get(base + path)).status(), 200, path);
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: percentage guide mobile/desktop, no-JS keyboard answers/tables/navigation, verified store links/attribution, honest feature preview, local references and no new storage/transmission.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
