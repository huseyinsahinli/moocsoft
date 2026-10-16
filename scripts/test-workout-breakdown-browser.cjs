// Development-only browser QA. No browser dependency ships to site visitors.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync, readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4205').replace(/\/$/, '');
const siteRoot = resolve(__dirname, '..');
const qa = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const route = '/tools/workout-volume-rest-timer/';
const numeric = value => Number(value.replace(/[^\d.-]/g, ''));

function parseCsv(source) {
  const rows = [], text = source.replace(/^\uFEFF/, '');
  let quoted = false, cell = '', row = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { cell += '"'; index++; }
      else quoted = !quoted;
    } else if (!quoted && char === ',') { row.push(cell); cell = ''; }
    else if (!quoted && (char === '\r' || char === '\n')) {
      if (char === '\r' && text[index + 1] === '\n') index++;
      row.push(cell); rows.push(row); cell = ''; row = [];
    } else cell += char;
  }
  assert.equal(quoted, false, 'CSV quotes must be balanced');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

(async () => {
  if (qa) {
    const distance = relative(siteRoot, qa);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep screenshots outside the public site');
    mkdirSync(qa, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localPaths = new Set();
  try {
    for (const width of [320, 390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 950 }, javaScriptEnabled, locale: 'en-US', reducedMotion: 'reduce', acceptDownloads: true });
      await context.route('https://fonts.googleapis.com/**', request => request.abort());
      await context.route('https://fonts.gstatic.com/**', request => request.abort());
      const page = await context.newPage();
      page.on('pageerror', error => failures.push(error.message));
      page.on('dialog', async dialog => { failures.push('Unexpected dialog: ' + dialog.message()); await dialog.dismiss(); });
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.status() + ' ' + response.url());
      });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) failures.push('Unexpected method ' + request.method());
        if (url.origin !== new URL(base).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected external request ' + request.url());
      });
      assert.equal((await page.goto(base + route)).status(), 200);
      assert.equal(await page.title(), 'Workout Volume Calculator: Sets, Reps & Weight');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      const noOverflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow at ' + width);
      await noOverflow();
      assert.equal(await page.locator('.app-install .install-link').count(), 2);
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('https://apps.apple.com/')) assert.match(new URL(href).pathname, /id6808200259$/);
        if (href.startsWith('https://play.google.com/')) {
          const url = new URL(href);
          assert.equal(url.searchParams.get('id'), 'com.moocsoft.didyoulift');
          assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
          assert.equal(url.searchParams.get('utm_campaign'), 'tools-workout-volume-rest-timer');
        }
      }
      assert(await page.locator('.app-install a[href*="id6808200259"]').isVisible());
      assert(await page.locator('.app-install a[href*="play.google.com"]').isVisible());

      if (!javaScriptEnabled) {
        assert(await page.locator('#workout-calculator').isHidden());
        for (const id of ['add-exercise', 'calculate-volume', 'timer-toggle', 'timer-reset', 'weight-unit', 'export-workout']) assert(await page.locator('#' + id).isHidden(), 'No inert-looking control: ' + id);
        assert(await page.locator('#workout-static-title').isVisible());
        const example = page.locator('noscript .guide-table');
        assert(await example.isVisible());
        assert.match(await example.innerText(), /2,640 kg/);
        assert.match(await example.innerText(), /6 entered sets · 54 reps/);
        await example.focus();
        assert(await example.evaluate(node => node === document.activeElement));
        if (qa && width === 390) {
          await example.scrollIntoViewIfNeeded();
          await page.screenshot({ path: resolve(qa, 'workout-no-js-390.png') });
        }
      } else {
        const inputs = page.locator('#exercise-list .exercise-row');
        const results = page.locator('#workout-result-rows tr');
        const breakdown = page.locator('#workout-breakdown');
        const calculate = () => page.locator('#calculate-volume').click();
        const stale = async () => {
          assert(await breakdown.isHidden());
          assert.equal(await results.count(), 0);
          assert(await page.locator('#result-content').isHidden());
          assert(await page.locator('#export-workout').isDisabled());
        };
        const downloadRows = async () => {
          const pending = page.waitForEvent('download');
          await page.locator('#export-workout').click();
          const file = await pending;
          assert.equal(file.suggestedFilename(), 'workout-log.csv');
          return parseCsv(readFileSync(await file.path(), 'utf8'));
        };
        const csvParity = async expected => {
          const csv = await downloadRows();
          assert.deepEqual(csv[0], ['Exercise', 'Sets', 'Reps per set', 'Weight', 'Weight unit', 'Total reps', 'Volume']);
          assert.equal(csv.length, expected.length + 2);
          assert.equal(await results.count(), expected.length);
          const unit = await page.locator('#weight-unit').inputValue();
          for (const [index, item] of expected.entries()) {
            const [name, sets, reps, weight] = item;
            const cells = await results.nth(index).locator('th, td').allTextContents();
            assert.equal(cells[0], (index + 1) + '. ' + name);
            assert.equal(cells[1], sets + ' × ' + reps);
            assert.equal(numeric(cells[2]), weight);
            assert(cells[2].endsWith(' ' + unit));
            assert.equal(numeric(cells[3]), sets * reps);
            assert.equal(numeric(cells[4]), sets * reps * weight);
            assert(cells[4].endsWith(' ' + unit));
            const csvName = /^[\s\u0000-\u001f]*[=+\-@]|^[\t\r\n]/.test(name) ? "'" + name : name;
            assert.deepEqual(csv[index + 1], [csvName, String(sets), String(reps), String(weight), unit, String(sets * reps), String(sets * reps * weight)]);
          }
          const totalSets = expected.reduce((sum, [, sets]) => sum + sets, 0);
          const totalReps = expected.reduce((sum, [, sets, reps]) => sum + sets * reps, 0);
          const totalVolume = expected.reduce((sum, [, sets, reps, weight]) => sum + sets * reps * weight, 0);
          assert.equal(numeric(await page.locator('#breakdown-sets').innerText()), totalSets);
          assert.equal(numeric(await page.locator('#breakdown-reps').innerText()), totalReps);
          assert.equal(numeric(await page.locator('#breakdown-volume').innerText()), totalVolume);
          assert.equal(numeric(await page.locator('#total-volume').innerText()), totalVolume);
          assert.deepEqual(csv.at(-1), ['Workout totals', String(totalSets), '', '', unit, String(totalReps), String(totalVolume)]);
        };

        assert(await page.locator('#workout-calculator').isVisible());
        assert.equal(await inputs.count(), 2);
        assert(await breakdown.isHidden());
        await calculate();
        assert(await breakdown.isVisible());
        assert.equal(numeric(await page.locator('#total-volume').innerText()), 2640);
        assert.equal(await page.locator('#total-sets').innerText(), '6');
        assert.equal(await page.locator('#total-reps').innerText(), '54');
        assert.match(await page.locator('#result-content').innerText(), /Entered sets/i);
        assert(!/Working sets/i.test(await page.locator('#result-content').innerText()));
        await csvParity([['Squat', 3, 8, 60], ['Bench press', 3, 10, 40]]);
        await noOverflow();
        const resultRegion = breakdown.locator('.guide-table');
        assert.equal(await resultRegion.getAttribute('aria-describedby'), 'workout-table-help');
        assert(await page.locator('#workout-table-help').isVisible());
        assert.match(await page.locator('#workout-table-help').innerText(), /Scroll sideways.*keyboard.*arrow keys/);
        await resultRegion.focus();
        assert(await resultRegion.evaluate(node => document.activeElement === node));
        if (width < 570) {
          assert(await resultRegion.evaluate(node => node.scrollWidth > node.clientWidth), 'Wide table scrolls inside its own focusable region');
          await resultRegion.evaluate(node => { node.scrollLeft = 0; });
          await page.keyboard.press('ArrowRight');
          await page.waitForFunction(() => document.querySelector('#workout-breakdown .guide-table').scrollLeft > 0, undefined, { timeout: 2500 });
          assert(await resultRegion.evaluate(node => node.scrollLeft > 0 && document.activeElement === node), 'The focused table responds to a horizontal arrow key');
          await resultRegion.evaluate(node => { node.scrollLeft = 0; });
        }
        if (qa) {
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: resolve(qa, 'workout-hero-' + width + '.png') });
          await breakdown.evaluate(node => scrollTo({ top: scrollY + node.getBoundingClientRect().top - document.querySelector('.site-header').getBoundingClientRect().height - 16, behavior: 'instant' }));
          await page.screenshot({ path: resolve(qa, 'workout-breakdown-' + width + '.png') });
        }
        const hostile = '<img src=x onerror=alert(1)>';
        await inputs.nth(0).locator('.name').fill(hostile);
        await stale();
        assert.match(await page.locator('#workout-status').innerText(), /Entries changed/);
        for (const [index, sets, reps, weight] of [[0, '1', '1', '0.25'], [1, '2', '3', '0']]) {
          await inputs.nth(index).locator('.name').fill(hostile);
          await inputs.nth(index).locator('.sets').fill(sets);
          await inputs.nth(index).locator('.reps').fill(reps);
          await inputs.nth(index).locator('.weight').fill(weight);
        }
        await calculate();
        assert.equal(await page.locator('img[src="x"]').count(), 0, 'Exercise names stay literal rather than becoming markup');
        await csvParity([[hostile, 1, 1, .25], [hostile, 2, 3, 0]]);
        assert.equal(await results.count(), 2, 'Identical names do not merge distinct entries');
        assert.equal(await page.locator('#total-reps').innerText(), '7', 'Zero external weight still preserves the entered repetitions');
        await page.locator('#weight-unit').selectOption('lb');
        await stale();
        assert.equal(await inputs.first().locator('.weight').inputValue(), '0.25', 'Changing the unit label does not convert numbers');
        await calculate();
        assert.equal(await page.locator('#volume-unit').innerText(), 'lb');
        await csvParity([[hostile, 1, 1, .25], [hostile, 2, 3, 0]]);
        for (const [field, invalid, valid] of [['sets', '1.5', '1'], ['weight', '', '0.25']]) {
          const control = inputs.first().locator('.' + field);
          await control.fill(invalid);
          await calculate();
          await stale();
          assert.equal(await control.getAttribute('aria-invalid'), 'true');
          assert(await control.evaluate(node => document.activeElement === node));
          assert((await page.locator('#form-error').innerText()).length > 0);
          await control.fill(valid);
          assert.equal(await control.getAttribute('aria-invalid'), null);
          await calculate();
        }
        await inputs.first().locator('.name').fill('=1+1,"test"');
        await calculate();
        await csvParity([['=1+1,"test"', 1, 1, .25], [hostile, 2, 3, 0]]);
        await page.locator('#add-exercise').focus();
        await page.keyboard.press('Enter');
        assert.equal(await inputs.count(), 3);
        assert(await inputs.last().locator('.name').evaluate(node => node === document.activeElement));
        await stale();
        await inputs.last().locator('.name').fill('Third entry');
        await inputs.nth(1).locator('.remove').focus();
        await page.keyboard.press('Enter');
        assert.equal(await inputs.count(), 2);
        assert.equal(await inputs.last().locator('.name').inputValue(), 'Third entry');
        assert(await inputs.last().locator('.name').evaluate(node => node === document.activeElement), 'Removing a middle row focuses its following row');
        assert.equal(await inputs.last().getAttribute('aria-label'), 'Workout entry 2');
        await inputs.last().locator('.remove').focus();
        await page.keyboard.press('Enter');
        assert.equal(await inputs.count(), 1);
        assert(await inputs.first().locator('.name').evaluate(node => node === document.activeElement), 'Removing the last row focuses the preceding row');
        assert(await inputs.first().locator('.remove').isDisabled(), 'The sole remaining entry cannot be removed');
        await stale();
        await calculate();
        await csvParity([['=1+1,"test"', 1, 1, .25]]);
        await noOverflow();
        assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length, location.search, location.hash]), [0, 0, '', '']);
        await page.reload();
        assert.equal(await inputs.first().locator('.name').inputValue(), 'Squat', 'Entered names are not persisted');
        assert(await breakdown.isHidden());
      }
      await noOverflow();
      await context.close();
    }
    const links = await browser.newContext();
    for (const local of localPaths) assert.equal((await links.request.get(base + local)).status(), 200, local);
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: workout breakdown320/390/1280px, visible totals/CSV parity, decimal and zero loads, repeated/literal names, stale results, label-only units, invalid fields, keyboard add/remove, no-JS fallback, real stores and no persistence/transmission.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
