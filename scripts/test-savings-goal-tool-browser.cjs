// Development-only browser QA; no browser dependency ships to visitors.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync, readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4201').replace(/\/$/, '');
const siteRoot = resolve(__dirname, '..');
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const path = '/tools/savings-goal-calculator/';
const errors = [];
const stores = async page => {
  for (const placement of ['header', 'tool-end']) {
    const links = page.locator(`a.install-link[data-placement="${placement}"]`);
    assert.equal(await links.count(), 2);
    for (const href of await links.evaluateAll(anchors => anchors.map(anchor => anchor.href))) {
      const url = new URL(href);
      if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6450431254$/);
      else {
        assert.equal(url.hostname, 'play.google.com');
        assert.equal(url.searchParams.get('id'), 'com.moocsoft.goal_tracker');
        assert.equal(url.searchParams.get('utm_campaign'), 'tools-savings-goal-calculator');
        assert.equal(url.searchParams.get('utm_content'), placement);
      }
    }
  }
};
const noOverflow = async page => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No full-page horizontal overflow');

(async () => {
  if (qaDir) {
    const distance = relative(siteRoot, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep QA screenshots outside the public site');
    mkdirSync(qaDir, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 960 }, locale: 'en-US', reducedMotion: 'reduce' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) errors.push(`Unexpected ${request.method()} request`);
        if (url.origin !== new URL(base).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) errors.push(`Unexpected external request: ${request.url()}`);
      });
      assert.equal((await page.goto(base + path)).status(), 200);
      assert(await page.locator('[data-goal-form]').isVisible());
      assert(await page.locator('[data-goal-output]').isHidden());
      await stores(page);
      await noOverflow(page);
      const submit = () => page.getByRole('button', { name: 'Calculate my deposit plan' }).click();
      await submit();
      assert.match(await page.locator('[data-goal-summary]').innerText(), /USD\s*800\.01/);
      assert.match(await page.locator('[data-goal-summary]').innerText(), /USD\s*66\.64/);
      assert.equal(await page.locator('[data-goal-rows] tr').count(), 12);
      assert.match(await page.locator('[data-goal-rows] tr').last().innerText(), /1,000\.01/);
      await noOverflow(page);
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download this plan as CSV' }).click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(), 'savings-goal-plan.csv');
      const csv = readFileSync(await download.path(), 'utf8');
      assert.match(csv, /12,66\.64,1000\.01,0\.00,USD,Monthly\r\n$/);
      if (qaDir) await page.screenshot({ path: resolve(qaDir, `savings-goal-${width}.png`), fullPage: true });
      await page.locator('[name="target"]').fill('0.02');
      assert(await page.locator('[data-goal-output]').isHidden(), 'Editing invalidates results before exporting');
      assert(await page.locator('[data-goal-export]').isDisabled());
      await page.locator('[name="saved"]').fill('0');
      await page.locator('[name="deposits"]').fill('10');
      await page.locator('[name="currency"]').selectOption('EUR');
      await page.locator('[name="cadence"]').selectOption('weekly');
      await submit();
      assert.match(await page.locator('[data-goal-summary]').innerText(), /deposit 2 of 10/);
      assert.equal(await page.locator('[data-goal-rows] tr').count(), 10);
      assert.match(await page.locator('[data-goal-rows] tr').nth(2).innerText(), /EUR\s*0\.00/);
      await page.locator('[name="saved"]').fill('12');
      await submit();
      assert.match(await page.locator('[data-goal-summary]').innerText(), /already meet or exceed/);
      assert.match(await page.locator('[data-goal-rows] tr').last().innerText(), /EUR\s*12\.00/);
      for (const [name, bad, message, good] of [
        ['target', '1e3', /Enter a target/, '100'], ['saved', '-1', /Enter savings/, '0'],
        ['deposits', '0', /1 to 520/, '1'], ['deposits', '521', /1 to 520/, '520'], ['deposits', '1.5', /whole number/, '12'],
      ]) {
        await page.locator(`[name="${name}"]`).fill(bad);
        await submit();
        assert.match(await page.locator('[data-goal-error]').innerText(), message);
        assert.equal(await page.locator(`[name="${name}"]`).getAttribute('aria-invalid'), 'true');
        assert(await page.locator('[data-goal-output]').isHidden());
        assert.equal(await page.locator(':focus').getAttribute('name'), name);
        await page.locator(`[name="${name}"]`).fill(good);
      }
      await page.locator('[name="target"]').fill('9999999.99');
      await page.locator('[name="saved"]').fill('0');
      await page.locator('[name="deposits"]').fill('520');
      await submit();
      assert.equal(await page.locator('[data-goal-rows] tr').count(), 520);
      await noOverflow(page);
      assert.deepEqual(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, query: location.search })), { local: 0, session: 0, query: '' });
      await context.close();

      const noJs = await browser.newContext({ viewport: { width, height: 960 }, javaScriptEnabled: false });
      await noJs.route('https://fonts.googleapis.com/**', route => route.abort());
      await noJs.route('https://fonts.gstatic.com/**', route => route.abort());
      const staticPage = await noJs.newPage();
      assert.equal((await staticPage.goto(base + path)).status(), 200);
      assert(await staticPage.locator('[data-goal-form]').isHidden());
      assert(await staticPage.locator('[data-goal-output]').isHidden());
      assert(await staticPage.locator('#worked-example').isVisible());
      assert.match(await staticPage.locator('#worked-example').innerText(), /66\.64/);
      await stores(staticPage);
      await noOverflow(staticPage);
      if (qaDir && width === 390) await staticPage.screenshot({ path: resolve(qaDir, 'savings-goal-no-js-390.png'), fullPage: true });
      await noJs.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: savings goal mobile/desktop, exact schedules and CSV, tiny gaps, funded goals, invalid inputs, stale export, no-JavaScript examples, store links, no storage or input transmission.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
