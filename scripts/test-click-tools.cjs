// Local browser regression test; requires a static server and development-only Playwright.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const base = process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4193';
const moneyNumber = text => Number(text.replace(/[^\d.-]/g, ''));
const cigarettePath = '/guides/calculate-cigarette-cost-and-savings/';
const savingsPath = '/tools/52-week-savings-calculator/';
const workoutPath = '/tools/workout-volume-rest-timer/';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const errors = [];
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'en-US' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      await context.addInitScript(() => { window.print = () => { window.__printCalls = (window.__printCalls || 0) + 1; }; });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      const layout = async () => {
        assert.equal(await page.locator('h1').count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No page overflow at ${width}px`);
        for (const link of await page.locator('.app-install .install-link').all()) {
          const box = await link.boundingBox();
          assert(box && box.y >= 0 && box.y + box.height < 900 && box.height >= 44, 'Top download link visible and touch-sized');
        }
      };
      const downloadCsv = async selector => {
        const promise = page.waitForEvent('download');
        await page.locator(selector).click();
        const download = await promise;
        assert.match(download.suggestedFilename(), /\.csv$/);
        return readFileSync(await download.path(), 'utf8').replace(/^\uFEFF/, '');
      };

      assert.equal((await page.goto(base + cigarettePath)).status(), 200);
      await layout();
      assert(await page.locator('#cigarette-cost-form').isVisible());
      assert(await page.locator('#cigarette-cost-results').isHidden());
      const cigaretteSubmit = () => page.locator('#cigarette-cost-form button[type=submit]').click();
      await cigaretteSubmit();
      for (const [id, expected] of [['day',5],['week',35],['month',150],['year',1825]]) assert.equal(moneyNumber(await page.locator('#cost-' + id).innerText()), expected);
      assert.match(await page.locator('[data-placement="cigarette-cost-result"]').getAttribute('href'), /id6747658536$/);
      await page.locator('#cost-pack-price').fill('9.99');
      assert(await page.locator('#cigarette-cost-results').isHidden(), 'No stale cigarette cost');
      await page.locator('#cost-daily-use').fill('5');
      await cigaretteSubmit();
      assert.equal(moneyNumber(await page.locator('#cost-year').innerText()), 911.59, 'Unrounded daily total');
      await page.locator('#cost-currency').selectOption('GBP');
      assert(await page.locator('#cigarette-cost-results').isHidden());
      await cigaretteSubmit();
      assert.match(await page.locator('#cost-day').innerText(), /£/);
      for (const [selector, value] of [['#cost-pack-size','0'],['#cost-pack-size','20.5'],['#cost-pack-size',''],['#cost-pack-price','10.001'],['#cost-daily-use','1001']]) {
        await page.locator('#cost-pack-price').fill('10');
        await page.locator('#cost-pack-size').fill('20');
        await page.locator('#cost-daily-use').fill('10');
        await page.locator(selector).fill(value);
        await cigaretteSubmit();
        assert(await page.locator('#cigarette-cost-results').isHidden());
        assert((await page.locator('#cigarette-cost-error').innerText()).length > 0);
      }
      await page.locator('#cost-daily-use').fill('0');
      await cigaretteSubmit();
      assert.equal(moneyNumber(await page.locator('#cost-year').innerText()), 0);
      await layout();
      if (process.env.MOOCSOFT_QA_DIR) await page.locator('#step-1').screenshot({path: `${process.env.MOOCSOFT_QA_DIR}/cigarette-${width}.png`});

      assert.equal((await page.goto(base + savingsPath)).status(), 200);
      await layout();
      assert(await page.locator('#export-plan').isDisabled());
      await page.locator('#savings-form button[type=submit]').click();
      assert.equal(await page.locator('#total-saved').innerText(), '$1,378.00');
      assert.equal(await page.locator('#weekly-plan-rows tr').count(), 52);
      const csv = await downloadCsv('#export-plan');
      assert.equal(csv.trim().split('\r\n').at(-1), '52,52.00,1378.00,USD');
      assert.equal(await page.locator('#first-deposit').innerText(), '$1.00');
      assert.equal(await page.locator('#final-deposit').innerText(), '$52.00');
      await page.locator('#deposit-order').selectOption('reverse');
      assert(await page.locator('#weekly-plan').isHidden(), 'Order changes invalidate the visible chart');
      assert(await page.locator('#export-plan').isDisabled());
      assert(await page.locator('#print-plan').isDisabled());
      assert.equal(await page.locator('#start-label').textContent(), 'Final (smallest) deposit');
      assert.equal(await page.locator('#step-label').textContent(), 'Decrease each week');
      await page.locator('#savings-form button[type=submit]').click();
      assert.equal(await page.locator('#total-saved').innerText(), '$1,378.00');
      assert.equal(await page.locator('#first-deposit').innerText(), '$52.00');
      assert.equal(await page.locator('#final-deposit').innerText(), '$1.00');
      assert.equal(await page.locator('#first-quarter').innerText(), '$598.00');
      const reverseCsv = (await downloadCsv('#export-plan')).trim().split('\r\n');
      assert.equal(reverseCsv[1], '1,52.00,52.00,USD');
      assert.equal(reverseCsv.at(-1), '52,1.00,1378.00,USD');
      assert.match(await page.locator('#plan-summary').innerText(), /First deposit: \$52\.00; decrease by \$1\.00 each week/);
      await page.locator('#print-plan').click();
      assert.equal(await page.evaluate(() => window.__printCalls), 1);
      await page.emulateMedia({ media: 'print' });
      assert(await page.locator('.site-header').isHidden());
      assert(await page.locator('.calculator-layout').isHidden());
      assert(await page.locator('#plan-summary').isVisible());
      assert(await page.locator('#weekly-plan-rows tr').last().isVisible());
      assert.equal(await page.locator('#weekly-plan-rows td').first().evaluate(el => getComputedStyle(el).color), 'rgb(0, 0, 0)');
      assert.equal(await page.locator('#weekly-plan-rows tr').first().locator('td').first().innerText(), '$52.00');
      assert.equal(await page.locator('#weekly-plan-rows tr').last().locator('td').first().innerText(), '$1.00');
      if (process.env.MOOCSOFT_QA_DIR) await page.locator('#savings-chart').screenshot({path: `${process.env.MOOCSOFT_QA_DIR}/savings-print-${width}.png`});
      await page.emulateMedia({ media: 'screen' });
      await page.locator('#weekly-increase').fill('0.50');
      assert(await page.locator('#weekly-plan').isHidden());
      assert(await page.locator('#export-plan').isDisabled());
      assert(await page.locator('#print-plan').isDisabled());
      await page.locator('[data-start="0.50"]').click();
      assert.equal(await page.locator('#total-saved').innerText(), '$689.00');
      await page.locator('[data-start="10"]').click();
      assert.equal(await page.locator('#total-saved').innerText(), '$520.00');
      assert.equal(await page.locator('#first-deposit').innerText(), '$10.00');
      assert.equal(await page.locator('#final-deposit').innerText(), '$10.00');
      assert.match(await page.locator('#plan-summary').innerText(), /deposit \$10\.00 every week/);
      await page.locator('#deposit-order').selectOption('standard');
      assert(await page.locator('#result-content').isHidden());
      await page.locator('#weeks').selectOption('13');
      await page.locator('#start-amount').fill('0.01');
      await page.locator('#weekly-increase').fill('0.01');
      await page.locator('#currency').selectOption('GBP');
      await page.locator('#savings-form button[type=submit]').click();
      assert.equal(await page.locator('#total-saved').innerText(), '£0.91');
      assert.equal((await downloadCsv('#export-plan')).trim().split('\r\n').at(-1), '13,0.13,0.91,GBP');
      for (const weeks of ['13', '26', '52']) {
        await page.locator('#weeks').selectOption(weeks);
        await page.locator('#deposit-order').selectOption('reverse');
        await page.locator('#savings-form button[type=submit]').click();
        const penniesCsv = (await downloadCsv('#export-plan')).trim().split('\r\n');
        const count = Number(weeks);
        const expectedTotal = (count * (count + 1) / 2 / 100).toFixed(2);
        assert.equal(penniesCsv[1], `1,${(count / 100).toFixed(2)},${(count / 100).toFixed(2)},GBP`);
        assert.equal(penniesCsv.at(-1), `${count},0.01,${expectedTotal},GBP`);
        assert.equal(await page.locator('#weekly-plan-rows tr').count(), count);
      }
      for (const value of ['', '-1', '0.001', '1000000.01']) {
        await page.locator('#start-amount').fill(value);
        await page.locator('#savings-form button[type=submit]').click();
        assert(await page.locator('#result-content').isHidden());
        assert(await page.locator('#export-plan').isDisabled());
      }
      assert.equal((await page.goto(base + savingsPath + '?order=reverse')).status(), 200);
      assert.equal(await page.locator('#deposit-order').inputValue(), 'reverse');
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://moocsoft.net/tools/52-week-savings-calculator/');
      assert(await page.locator('#export-plan').isDisabled(), 'Public mode link does not create a plan or export stale inputs');
      await page.locator('#savings-form button[type=submit]').click();
      assert.equal(await page.locator('#first-deposit').innerText(), '$52.00');
      assert.equal((await page.goto(base + savingsPath + '?order=unrecognized')).status(), 200);
      assert.equal(await page.locator('#deposit-order').inputValue(), 'standard');
      await layout();

      assert.equal((await page.goto(base + workoutPath)).status(), 200);
      await page.clock.install();
      await layout();
      assert(await page.locator('#export-workout').isDisabled());
      const calculateWorkout = () => page.locator('#calculate-volume').click();
      await calculateWorkout();
      assert.equal(moneyNumber(await page.locator('#total-volume').innerText()), 2640);
      assert.equal(await page.locator('#total-sets').innerText(), '6');
      assert.equal(await page.locator('#total-reps').innerText(), '54');
      assert.match(await downloadCsv('#export-workout'), /"Workout totals","6","","","kg","54","2640"/);
      await page.locator('.exercise-row .name').first().fill('=1+1,"test"');
      assert(await page.locator('#export-workout').isDisabled());
      await calculateWorkout();
      assert.match(await downloadCsv('#export-workout'), /"'=1\+1,""test"""/);
      await page.locator('#weight-unit').selectOption('lb');
      assert(await page.locator('#result-content').isHidden());
      await calculateWorkout();
      assert.equal(await page.locator('#volume-unit').innerText(), 'lb');
      assert.equal(moneyNumber(await page.locator('#total-volume').innerText()), 2640, 'Unit selector must not silently convert weights');
      await page.locator('#add-exercise').click();
      assert(await page.locator('#export-workout').isDisabled());
      await calculateWorkout();
      await page.locator('.exercise-row .remove').last().click();
      assert(await page.locator('#result-content').isHidden());
      for (const [field, value] of [['sets','1.5'],['sets','101'],['reps','1001'],['weight','10001'],['weight','']]) {
        await page.locator('.exercise-row .sets').first().fill('3');
        await page.locator('.exercise-row .reps').first().fill('8');
        await page.locator('.exercise-row .weight').first().fill('60');
        await page.locator('.exercise-row .' + field).first().fill(value);
        await calculateWorkout();
        assert(await page.locator('#export-workout').isDisabled());
        assert((await page.locator('#form-error').innerText()).length > 0);
      }
      await page.locator('#timer-toggle').click();
      await page.clock.runFor(2000);
      assert.equal(await page.locator('#timer-display').innerText(), '01:28');
      await page.locator('#timer-toggle').click();
      await page.clock.runFor(2000);
      assert.equal(await page.locator('#timer-display').innerText(), '01:28');
      await page.locator('#timer-reset').click();
      assert.equal(await page.locator('#timer-display').innerText(), '01:30');
      assert.match(await page.title(), /^Workout Volume Calculator/);
      assert.equal(await page.evaluate(() => localStorage.length), 0, 'No persistence added');
      await context.close();
    }
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    await nojs.route('https://fonts.googleapis.com/**', route => route.abort());
    await nojs.route('https://fonts.gstatic.com/**', route => route.abort());
    const page = await nojs.newPage();
    await page.goto(base + cigarettePath);
    assert(await page.locator('#cigarette-cost-form').isHidden());
    assert.match(await page.locator('article').innerText(), /\$3,650/);
    assert(await page.locator('noscript').isVisible());
    await page.goto(base + savingsPath);
    assert.equal(await page.locator('noscript a').count(), 2);
    for (const link of await page.locator('noscript a').all()) assert(await link.isVisible());
    assert.equal(await page.locator('noscript a').last().getAttribute('href'), '/guides/reverse-52-week-savings-challenge/');
    assert.deepEqual(errors, []);
    console.log('PASS: mobile/desktop layouts, arithmetic, CSVs, formula-safe names, print, input invalidation, bounds, timer and no-JS fallbacks.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
