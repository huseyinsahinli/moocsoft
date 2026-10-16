// Development-only reader-path QA. No browser library ships to visitors.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync, readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4206').replace(/\/$/, '');
const siteRoot = resolve(__dirname, '..');
const qa = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const cigarettePath = '/guides/calculate-cigarette-cost-and-savings/';
const classicPath = '/guides/52-week-savings-challenge/';
const calculatorPath = '/tools/52-week-savings-calculator/';
const worksheetPath = '/assets/worksheets/52-week-savings.html';
const worksheetCsvPath = '/assets/worksheets/52-week-savings.csv';
const money = text => Number(text.replace(/[^\d.-]/g, ''));

(async () => {
  if (qa) {
    const distance = relative(siteRoot, qa);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'QA evidence must stay outside the public site');
    mkdirSync(qa, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localPaths = new Set();
  try {
    for (const width of [320, 390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 950 }, javaScriptEnabled, locale: 'en-US', reducedMotion: 'reduce', acceptDownloads: true });
      await context.route('https://fonts.googleapis.com/**', request => request.abort());
      await context.route('https://fonts.gstatic.com/**', request => request.abort());
      if (javaScriptEnabled) await context.addInitScript(() => { window.__readerPrintCalls = 0; window.print = () => { window.__readerPrintCalls++; }; });
      const page = await context.newPage();
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.status() + ' ' + response.url());
      });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) failures.push('Unexpected method ' + request.method());
        if (url.origin !== new URL(base).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected external request ' + request.url());
      });
      const fits = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow at ' + width + ': ' + page.url());
      const storeHeader = async (appleId, googleId, campaign) => {
        const links = page.locator('.app-install .install-link');
        assert.equal(await links.count(), googleId ? 2 : 1);
        for (const link of await links.all()) {
          assert(await link.isVisible());
          const box = await link.boundingBox();
          assert(box && box.height >= 44 && box.y >= 0 && box.y + box.height < 950, 'Top store choice remains visible and touch-sized');
          const url = new URL(await link.getAttribute('href'));
          if (url.hostname === 'apps.apple.com') assert.match(url.pathname, new RegExp('id' + appleId + '$'));
          else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), googleId);
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_campaign'), campaign);
            assert.equal(url.searchParams.get('utm_content'), 'header');
          }
        }
      };
      const collectLinks = async () => {
        for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
          if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
          if (href.startsWith('#')) assert.equal(await page.locator('[id="' + href.slice(1) + '"]').count(), 1, href);
        }
      };
      const jump = async (scope, targetId) => {
        const action = page.locator(scope + ' a[href="#' + targetId + '"]').first();
        assert(await action.isVisible());
        await action.focus();
        await page.keyboard.press('Enter');
        assert.equal(new URL(page.url()).hash, '#' + targetId);
        await page.waitForFunction(id => {
          const target = document.getElementById(id).getBoundingClientRect();
          const header = document.querySelector('.site-header').getBoundingClientRect();
          return target.top >= header.bottom - 1 && target.top < innerHeight;
        }, targetId, { timeout: 2500 });
      };
      const download = async selector => {
        const pending = page.waitForEvent('download');
        await page.locator(selector).click();
        const file = await pending;
        assert.match(file.suggestedFilename(), /\.csv$/);
        return readFileSync(await file.path(), 'utf8').replace(/^\uFEFF/, '').trim().split(/\r?\n/).map(line => line.split(','));
      };
      const privacy = async () => {
        if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
        assert(['', '?order=reverse'].includes(new URL(page.url()).search), 'No entered amounts in URLs');
      };

      assert.equal((await page.goto(base + cigarettePath)).status(), 200);
      assert.equal(await page.locator('h1').count(), 1);
      assert.match(await page.title(), /^Cigarette Cost Calculator: Day, Month & Year/);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + cigarettePath);
      await fits();
      await storeHeader('6747658536', null, 'guides-calculate-cigarette-cost-and-savings');
      assert.equal(await page.locator('#cigarette-cost-calculator').count(), 1);
      assert(await page.locator('#cigarette-cost-calculator').evaluate(node => {
        const image = document.querySelector('.guide-visual');
        return image && Boolean(node.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING);
      }), 'The calculator appears before the optional original illustration');
      assert.equal(await page.locator('.guide-hero-actions a[href="/tools/quit-smoking-savings-calculator/"]').count(), 0, 'The primary cost task is not competing with a quit-date hero link');
      assert(await page.locator('.guide-article a[href="/tools/quit-smoking-savings-calculator/"]').count() > 0, 'Quit-date savings remains an explicit later task');
      await jump('.guide-hero-actions', 'cigarette-cost-calculator');
      if (javaScriptEnabled) {
        const submit = () => page.locator('#cigarette-cost-form button[type="submit"]').click();
        assert(await page.locator('#cigarette-cost-form').isVisible());
        await submit();
        for (const [id, expected] of [['day', 5], ['week', 35], ['month', 150], ['year', 1825]]) assert.equal(money(await page.locator('#cost-' + id).innerText()), expected);
        await page.locator('#cost-pack-price').fill('9.99');
        assert(await page.locator('#cigarette-cost-results').isHidden());
        await page.locator('#cost-daily-use').fill('5');
        await submit();
        assert.equal(money(await page.locator('#cost-year').innerText()), 911.59, 'Year uses the unrounded daily amount');
        await page.locator('#cost-pack-size').fill('0');
        await submit();
        assert(await page.locator('#cigarette-cost-results').isHidden());
        assert((await page.locator('#cigarette-cost-error').innerText()).length > 0);
        await page.locator('#cost-pack-size').fill('20');
        await page.locator('#cost-daily-use').fill('0');
        await submit();
        assert.equal(money(await page.locator('#cost-year').innerText()), 0);
        assert.match(await page.locator('[data-placement="cigarette-cost-result"]').getAttribute('href'), /id6747658536$/);
      } else {
        assert(await page.locator('#cigarette-cost-form').isHidden());
        assert(await page.locator('#cigarette-cost-calculator noscript').isVisible());
        assert.match(await page.locator('.guide-article').innerText(), /\$3,650/);
      }
      if (qa) {
        await page.locator('#cigarette-cost-calculator').evaluate(node => scrollTo({ top: scrollY + node.getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().height - 18, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qa, 'cigarette-reader-' + width + '-' + (javaScriptEnabled ? 'js' : 'no-js') + '.png') });
      }
      await collectLinks(); await fits(); await privacy();

      assert.equal((await page.goto(base + classicPath)).status(), 200);
      assert.match(await page.title(), /^52-Week Savings Challenge: Free Printable Chart & CSV/);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + classicPath);
      await storeHeader('6450431254', 'com.moocsoft.goal_tracker', 'guides-52-week-savings-challenge');
      await fits();
      await jump('.guide-hero-actions', 'step-2');
      assert(await page.locator('#step-2 a[href="' + worksheetPath + '"]').isVisible());
      const classicCsv = await download('#step-2 a[href="' + worksheetCsvPath + '"]');
      assert.equal(classicCsv.length, 53);
      let running = 0;
      for (let week = 1; week <= 52; week++) {
        running += week;
        assert.equal(Number(classicCsv[week][0]), week);
        assert.equal(Number(classicCsv[week][1]), week);
        assert.equal(Number(classicCsv[week][2]), running);
      }
      assert.equal(running, 1378);
      assert.match(await page.locator('#step-2').innerText(), /separate from Frugal/);
      await collectLinks(); await fits(); await privacy();
      if (qa) await page.screenshot({ path: resolve(qa, 'classic-guide-reader-' + width + '-' + (javaScriptEnabled ? 'js' : 'no-js') + '.png') });
      await page.locator('#step-2 a[href="' + worksheetPath + '"]').click();
      assert.equal(new URL(page.url()).pathname, worksheetPath);
      assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
      assert.equal(await page.locator('tr[data-week]').count(), 52);
      assert.equal(await page.locator('input[type="checkbox"]').count(), 52);
      for (const week of [1, 26, 27, 52]) {
        const cells = await page.locator('tr[data-week="' + week + '"] td').allTextContents();
        assert.equal(Number(cells[0]), week);
        assert.equal(money(cells[1]), week);
        assert.equal(money(cells[2]), week * (week + 1) / 2);
      }
      await page.locator('input[type="checkbox"]').first().check();
      assert(await page.locator('input[type="checkbox"]').first().isChecked(), 'Temporary native completion checks work without JavaScript');
      if (javaScriptEnabled) {
        await page.locator('[data-print]').click();
        assert.equal(await page.evaluate(() => window.__readerPrintCalls), 1);
      }
      await page.emulateMedia({ media: 'print' });
      assert(await page.locator('.toolbar').isHidden());
      assert(await page.locator('tr[data-week="52"]').isVisible());
      await page.emulateMedia({ media: 'screen' });
      await fits(); await collectLinks(); await privacy();
      if (qa && width === 390) await page.screenshot({ path: resolve(qa, 'classic-worksheet-' + (javaScriptEnabled ? 'js' : 'no-js') + '.png') });

      assert.equal((await page.goto(base + calculatorPath)).status(), 200);
      assert.equal(await page.title(), '52-Week Savings Calculator: Standard & Reverse Chart');
      assert.equal(await page.locator('h1').innerText(), '52-Week Savings Calculator');
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + calculatorPath);
      await storeHeader('6450431254', 'com.moocsoft.goal_tracker', 'tools-52-week-savings-calculator');
      assert.equal(await page.locator('.tool-hero a[href="/tools/savings-goal-calculator/"]').count(), 1);
      assert.match(await page.locator('.tool-hero').innerText(), /Website plans are not automatically imported into Frugal/);
      await fits();
      await jump('.tool-hero', 'savings-form');
      if (javaScriptEnabled) {
        const calculate = () => page.locator('#savings-form button[type="submit"]').click();
        assert(await page.locator('#export-plan').isDisabled());
        await calculate();
        assert.equal(await page.locator('#total-saved').innerText(), '$1,378.00');
        assert.equal(await page.locator('#weekly-plan-rows tr').count(), 52);
        const csv = await download('#export-plan');
        assert.deepEqual(csv.at(-1), ['52', '52.00', '1378.00', 'USD']);
        await page.locator('#print-plan').click();
        assert.equal(await page.evaluate(() => window.__readerPrintCalls), 1);
        await page.emulateMedia({ media: 'print' });
        assert(await page.locator('.site-header').isHidden());
        assert(await page.locator('.calculator-layout').isHidden());
        assert(await page.locator('#weekly-plan-rows tr').last().isVisible());
        await page.emulateMedia({ media: 'screen' });
        await page.locator('#deposit-order').selectOption('reverse');
        assert(await page.locator('#weekly-plan').isHidden());
        assert(await page.locator('#export-plan').isDisabled());
        assert(await page.locator('#print-plan').isDisabled());
        await calculate();
        assert.equal(await page.locator('#first-deposit').innerText(), '$52.00');
        assert.equal(await page.locator('#final-deposit').innerText(), '$1.00');
        const reverse = await download('#export-plan');
        assert.deepEqual(reverse[1], ['1', '52.00', '52.00', 'USD']);
        assert.deepEqual(reverse.at(-1), ['52', '1.00', '1378.00', 'USD']);
        await page.locator('[data-start="0.50"]').click();
        assert.equal(await page.locator('#total-saved').innerText(), '$689.00');
        await page.locator('[data-start="10"]').click();
        assert.equal(await page.locator('#total-saved').innerText(), '$520.00');
        await page.locator('#start-amount').fill('0.001');
        assert(await page.locator('#weekly-plan').isHidden());
        assert(await page.locator('#export-plan').isDisabled());
        await calculate();
        assert((await page.locator('#form-error').innerText()).length > 0);
        assert(await page.locator('#export-plan').isDisabled());
        await page.goto(base + calculatorPath + '?order=reverse');
        assert.equal(await page.locator('#deposit-order').inputValue(), 'reverse');
        assert(await page.locator('#export-plan').isDisabled());
      } else {
        assert(await page.locator('#savings-form noscript').isVisible());
        assert.equal(await page.locator('#savings-form noscript a').count(), 2);
        assert(await page.locator('#export-plan').isDisabled());
        assert(await page.locator('#print-plan').isDisabled());
      }
      if (qa) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qa, 'savings-calculator-reader-' + width + '-' + (javaScriptEnabled ? 'js' : 'no-js') + '.png') });
      }
      await collectLinks(); await fits(); await privacy();
      await context.close();
    }
    const links = await browser.newContext();
    for (const local of localPaths) assert.equal((await links.request.get(base + local)).status(), 200, local);
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: three search-reader paths320/390/1280px with/without JavaScript, direct keyboard anchors, real store attribution, classic printable/CSV arithmetic, cost estimates, stale plans, presets/order/print and no added transport/storage.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
