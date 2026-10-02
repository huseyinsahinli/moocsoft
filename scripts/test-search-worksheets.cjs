// Local browser regression; run after both builds with a static server and development-only Playwright.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute, sep } = require('node:path');
const { pathToFileURL } = require('node:url');

const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4195').replace(/\/$/, '');
const repoRoot = resolve(__dirname, '..');
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const examples = [
  { slug: 'reverse-52-week-savings-challenge', worksheet: 'reverse-52-week-savings', csv: true },
  { slug: '100-envelope-challenge', worksheet: '100-envelope-checklist', csv: true },
  { slug: 'missing-number-puzzles-with-answers', worksheet: 'missing-number-puzzles', csv: false },
];
const errors = [];
const readable = text => text.replace(/\s+/g, ' ').trim();

const interceptFonts = async context => {
  await context.route('https://fonts.googleapis.com/**', route => route.abort());
  await context.route('https://fonts.gstatic.com/**', route => route.abort());
};

const visit = async (page, path, width) => {
  const response = await page.goto(base + path);
  assert(response && response.status() === 200, `Route returns 200: ${path}`);
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('h1').count(), 1, `One main heading: ${path}`);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No horizontal page overflow: ${path} at ${width}px`);
};

const saveScreenshot = async (locator, name) => {
  if (qaDir) await locator.screenshot({ path: resolve(qaDir, name) });
};

const checkNoPersistence = async page => {
  assert.equal(await page.evaluate(() => localStorage.length), 0, 'No localStorage records created');
  assert.deepEqual(await page.evaluate(() => window.__worksheetStorageWrites), [], 'No localStorage write attempts');
  assert.deepEqual(await page.evaluate(() => window.__worksheetNetworkCalls), [], 'No fetch, XHR or beacon events');
};

(async () => {
  if (qaDir) {
    const location = relative(repoRoot, qaDir);
    assert(location && (location === '..' || location.startsWith('..' + sep) || isAbsolute(location)), 'Browser screenshots must stay outside the published repository');
    mkdirSync(qaDir, { recursive: true });
  }
  const { missingNumberWorksheet } = await import(pathToFileURL(resolve(repoRoot, 'content/puzzle-worksheet.mjs')).href);
  assert.equal(missingNumberWorksheet.questions.length, 5);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'en-US' });
      await interceptFonts(context);
      await context.addInitScript(() => {
        window.__worksheetPrintCalls = [];
        window.__worksheetStorageWrites = [];
        window.__worksheetNetworkCalls = [];
        window.print = () => {
          window.__worksheetPrintCalls.push({
            printMode: document.body.dataset.printMode || null,
            answerKeyDisplay: document.querySelector('#answer-key') ? getComputedStyle(document.querySelector('#answer-key')).display : null,
          });
        };
        for (const method of ['setItem', 'removeItem', 'clear']) {
          const original = Storage.prototype[method];
          Storage.prototype[method] = function (...args) {
            if (this === window.localStorage) window.__worksheetStorageWrites.push(method);
            return original.apply(this, args);
          };
        }
        const fetch = window.fetch;
        window.fetch = function (...args) {
          window.__worksheetNetworkCalls.push('fetch');
          return fetch.apply(this, args);
        };
        const send = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (...args) {
          window.__worksheetNetworkCalls.push('xhr');
          return send.apply(this, args);
        };
        const beacon = navigator.sendBeacon;
        navigator.sendBeacon = function (...args) {
          window.__worksheetNetworkCalls.push('beacon');
          return beacon.apply(this, args);
        };
      });
      const page = await context.newPage();
      const actionRequests = [];
      page.on('request', request => actionRequests.push(request.url()));
      page.on('pageerror', error => errors.push(`${width}px: ${error.message}`));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${width}px: ${response.status()} ${response.url()}`);
      });
      try {
        for (const example of examples) {
          const guidePath = `/guides/${example.slug}/`;
          const worksheetPath = `/assets/worksheets/${example.worksheet}.html`;
          await visit(page, guidePath, width);
          const visual = page.locator('figure.guide-visual');
          assert.equal(await visual.count(), 1, `One meaningful guide image: ${guidePath}`);
          const image = visual.locator('img[src^="/assets/guide-visuals/"]');
          assert.equal(await image.count(), 1);
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(element => element.decode());
          const decoded = await image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight, currentSrc: element.currentSrc, declaredWidth: element.getAttribute('width'), declaredHeight: element.getAttribute('height') }));
          assert.deepEqual([decoded.declaredWidth, decoded.declaredHeight], ['1200', '675'], 'Guide image retains its declared PNG fallback dimensions');
          assert(decoded.width > 0 && decoded.height > 0 && Math.abs(decoded.height - decoded.width * 9 / 16) <= 1, 'Selected responsive image decodes at the diagram aspect ratio');
          const selectedWidth = /-(480|800|1200)\.webp$/.exec(new URL(decoded.currentSrc).pathname)?.[1];
          assert(selectedWidth || new URL(decoded.currentSrc).pathname.endsWith('.png'), 'Guide image selects a known WebP width or its PNG fallback');
          assert((await image.getAttribute('alt')).trim().length > 0, 'Guide image has descriptive alt text');
          assert((await visual.locator('figcaption').innerText()).trim().length > 0, 'Guide image has a visible caption');
          assert(await page.locator(`.guide-hero-actions a[href="${worksheetPath}"]`).isVisible(), 'Printable worksheet is reachable from the guide hero');
          await saveScreenshot(visual, `${example.worksheet}-guide-${width}.png`);
          if (example.csv) {
            const csvPath = `/assets/worksheets/${example.worksheet}.csv`;
            assert(await page.locator(`article a[href="${csvPath}"][download]`).isVisible(), 'Guide offers a static CSV download');
            const csvResponse = await context.request.get(base + csvPath);
            assert.equal(csvResponse.status(), 200, `CSV route returns 200: ${csvPath}`);
            assert((await csvResponse.text()).trim().split(/\r?\n/).length > 1, 'CSV contains data rows');
          }
          await checkNoPersistence(page);
          await visit(page, worksheetPath, width);
          actionRequests.length = 0;
          if (example.worksheet === 'reverse-52-week-savings') {
            assert.equal(await page.locator('table tbody tr').count(), 52, 'Reverse worksheet has all 52 static rows');
            assert.equal(await page.locator('input[type="checkbox"]').count(), 52, 'Every reverse week has a native completion box');
            assert.match(await page.locator('table tbody tr').first().innerText(), /\$52(?:\.00)?/);
            assert.match(await page.locator('table tbody tr').last().innerText(), /\$1,378(?:\.00)?/);
            await page.locator('input[type="checkbox"]').first().check();
          } else if (example.worksheet === '100-envelope-checklist') {
            assert.equal(await page.locator('input[type="checkbox"]').count(), 100, 'All 100 envelope checkboxes are static');
            await page.locator('input[type="checkbox"]').first().check();
            await page.locator('input[type="checkbox"]').last().check();
            assert(await page.locator('input[type="checkbox"]').first().isChecked());
            assert(await page.locator('input[type="checkbox"]').last().isChecked());
          } else {
            assert.equal(await page.locator('.question-sheet .question[data-question]').count(), 5, 'All five original questions are on the question sheet');
            for (const question of missingNumberWorksheet.questions) {
              assert.match(await page.locator(`.question[data-question="${question.number}"]`).innerText(), new RegExp(question.title), `Question ${question.number} is readable`);
              assert.equal(await page.locator(`#answer-key [data-answer-for="${question.number}"]`).getAttribute('data-answer'), String(question.answer), 'Separate answer key matches the original question');
            }
            assert(await page.locator('#answer-key').isVisible(), 'The answer key is a separate readable section');
            await page.locator('[data-print="questions"]').click();
            assert.deepEqual(await page.evaluate(() => window.__worksheetPrintCalls.map(call => call.printMode)), ['questions'], 'Question-only button invokes print with the right mode');
            await page.emulateMedia({ media: 'print' });
            assert(await page.locator('#answer-key').isHidden(), 'Question-only printing hides the separate answer key');
            assert(await page.locator('.question[data-question="5"]').isVisible(), 'Question-only printing retains every question');
            assert(await page.locator('.toolbar').isHidden(), 'Print output excludes the toolbar');
            await saveScreenshot(page.locator('.question-sheet'), `missing-number-questions-print-${width}.png`);
            await page.emulateMedia({ media: 'screen' });
            assert(await page.locator('#answer-key').isVisible(), 'Question-only print mode does not hide answers on screen');
            await page.locator('[data-print="all"]').click();
            assert.deepEqual(await page.evaluate(() => window.__worksheetPrintCalls.map(call => call.printMode)), ['questions', 'all'], 'Questions-and-key button invokes print with the right mode');
            await page.emulateMedia({ media: 'print' });
            assert(await page.locator('#answer-key').isVisible(), 'Questions-and-key print mode restores the answer key');
            assert.equal(await page.locator('#answer-key .answer').count(), 5, 'Printed answer key contains all five worked answers');
            await saveScreenshot(page.locator('#answer-key'), `missing-number-answer-key-print-${width}.png`);
            await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
            assert.equal(await page.locator('body').getAttribute('data-print-mode'), null, 'Finishing print removes its temporary mode');
            await page.emulateMedia({ media: 'screen' });
          }
          if (example.csv) {
            await page.locator('[data-print="all"]').click();
            assert.deepEqual(await page.evaluate(() => window.__worksheetPrintCalls.map(call => call.printMode)), ['all'], 'Savings print button invokes window.print');
            await page.emulateMedia({ media: 'print' });
            assert(await page.locator('input[type="checkbox"]').first().isChecked(), 'Completion checks remain checked in print output');
            assert(await page.locator('.toolbar').isHidden(), 'Savings print output excludes the toolbar');
            await saveScreenshot(page.locator('.paper'), `${example.worksheet}-print-${width}.png`);
            await page.emulateMedia({ media: 'screen' });
          }
          await checkNoPersistence(page);
          assert.deepEqual(actionRequests, [], 'Worksheet interactions make no network requests');
          await saveScreenshot(page.locator('body'), `${example.worksheet}-${width}.png`);
        }
        assert.deepEqual(errors, [], 'No browser errors or failed local resources');
      } catch (error) {
        if (qaDir) await page.screenshot({ path: resolve(qaDir, `worksheets-failure-${width}.png`), fullPage: true }).catch(() => {});
        throw error;
      } finally {
        await context.close();
      }
      console.log(`PASS ${width}px: three existing guides, decoded visuals, three printable routes, CSV downloads and no overflow/persistence/network events.`);
    }
    // A4 has 186 × 273 mm available after the worksheet's 12 mm page margins.
    // Check the content boxes and forced key break in print CSS; do not create a PDF.
    const a4Width = Math.ceil(186 * 96 / 25.4);
    const a4Height = Math.ceil(273 * 96 / 25.4);
    const a4 = await browser.newContext({ viewport: { width: a4Width, height: a4Height }, locale: 'en-US' });
    await interceptFonts(a4);
    const printPage = await a4.newPage();
    try {
      await visit(printPage, '/assets/worksheets/missing-number-puzzles.html', a4Width);
      await printPage.emulateMedia({ media: 'print' });
      const questions = printPage.locator('.question-sheet');
      const key = printPage.locator('#answer-key');
      for (const [label, section] of [['Questions', questions], ['Answer key', key]]) {
        const box = await section.boundingBox();
        assert(box && box.width <= a4Width + 1 && box.height <= a4Height + 1, `${label} content fits one A4 page with 12 mm margins`);
      }
      assert.equal(await key.evaluate(element => getComputedStyle(element).breakBefore), 'page', 'Answer key starts on a separate printed page');
      await saveScreenshot(questions, 'missing-number-questions-a4-print.png');
      await saveScreenshot(key, 'missing-number-answer-key-a4-print.png');
    } finally {
      await a4.close();
    }
    console.log('PASS A4 print CSS: questions and answer key each fit the printable content area; key starts a separate page.');
    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 }, locale: 'en-US' });
    await interceptFonts(nojs);
    const page = await nojs.newPage();
    try {
      for (const example of examples) {
        const worksheetPath = `/assets/worksheets/${example.worksheet}.html`;
        await visit(page, worksheetPath, 390);
        if (example.worksheet === 'reverse-52-week-savings') {
          assert.equal(await page.locator('table tbody tr').count(), 52, 'All 52 reverse rows exist without JavaScript');
          assert.equal(await page.locator('input[type="checkbox"]').count(), 52, 'All 52 native reverse completion boxes exist without JavaScript');
          assert(await page.locator('table tbody tr').last().isVisible(), 'The final reverse row is readable without JavaScript');
        } else if (example.worksheet === '100-envelope-checklist') {
          assert.equal(await page.locator('input[type="checkbox"]').count(), 100, 'All 100 checklist boxes exist without JavaScript');
          await page.locator('input[type="checkbox"]').first().check();
          assert(await page.locator('input[type="checkbox"]').first().isChecked(), 'Native checklist boxes work without JavaScript');
        } else {
          assert.equal(await page.locator('.question-sheet .question[data-question]').count(), 5, 'All five questions exist without JavaScript');
          const bodyText = readable(await page.locator('body').innerText());
          for (const question of missingNumberWorksheet.questions) assert(bodyText.includes(question.title), `Question ${question.number} is readable without JavaScript`);
          const key = page.locator('#answer-key');
          assert(await key.isVisible(), 'Static answer key is readable without JavaScript');
          const answerText = readable(await key.innerText());
          for (const question of missingNumberWorksheet.questions) {
            assert(answerText.includes(readable(question.explanation)), `Worked answer ${question.number} exists without JavaScript`);
            assert.equal(await key.locator(`[data-answer-for="${question.number}"]`).getAttribute('data-answer'), String(question.answer), 'Static answer metadata matches the question without JavaScript');
          }
        }
      }
      await visit(page, '/guides/missing-number-puzzles-with-answers/', 390);
      const answers = page.locator('article .guide-faq details').filter({ has: page.locator('summary', { hasText: 'Reveal answer and check' }) });
      assert.equal(await answers.count(), 5, 'The guide contains all five native answer reveals');
      for (const answer of await answers.all()) {
        await answer.locator('summary').click();
        for (const paragraph of await answer.locator('p').all()) assert(await paragraph.isVisible(), 'Every worked guide answer and check opens without JavaScript');
      }
      assert.deepEqual(errors, [], 'No browser errors or failed local resources');
    } finally {
      await nojs.close();
    }
    console.log('PASS without JavaScript: all five questions and worked answers, native guide reveals, 52 reverse rows and 100 checklist boxes.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
