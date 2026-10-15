// Development-only browser QA. Serve the static site; no browser code ships with it.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4193').replace(/\/$/, '');
const siteRoot = resolve(__dirname, '..');
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const path = '/tools/math-puzzle-challenge/';
const publicPage = 'https://moocsoft.net' + path;
const canonicalStore = href => {
  const url = new URL(href);
  for (const name of [...url.searchParams.keys()]) if (name.startsWith('utm_')) url.searchParams.delete(name);
  return url.href;
};
const luminance = color => {
  const channels = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(channel => {
    const value = channel / 255;
    return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
  });
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
};
const contrastRatio = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + .05) / (values[1] + .05);
};

(async () => {
  if (qaDir) {
    const distance = relative(siteRoot, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'QA screenshots must stay outside the published repository');
    mkdirSync(qaDir, { recursive: true });
  }
  const { mathRounds } = await import(pathToFileURL(resolve(siteRoot, 'content/math-challenge.mjs')).href);
  const { apps } = await import(pathToFileURL(resolve(siteRoot, 'content/apps.mjs')).href);
  assert.deepEqual(mathRounds.map(round => round.id), ['mixed', 'everyday', 'logic']);
  assert(mathRounds.every(round => round.questions.length === 5));
  const questions = mathRounds.flatMap(round => round.questions);
  const expectedStores = [apps.math.apple, apps.math.google].sort();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const prepareContext = async (width, javaScriptEnabled = true, clipboardMode = 'success') => {
    const context = await browser.newContext({ viewport: { width, height: 960 }, locale: 'en-US', reducedMotion: 'reduce', javaScriptEnabled });
    await context.route('https://fonts.googleapis.com/**', route => route.abort());
    await context.route('https://fonts.gstatic.com/**', route => route.abort());
    if (javaScriptEnabled) {
      await context.addInitScript(mode => {
        window.__mathClipboardCalls = [];
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: {
            writeText: text => {
              window.__mathClipboardCalls.push(text);
              return mode === 'reject' ? Promise.reject(new Error('Clipboard blocked for this test')) : Promise.resolve();
            }
          }
        });
      }, clipboardMode);
    }
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(`${width}px: ${error.message}`));
    page.on('response', response => {
      if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${width}px: ${response.status()} ${response.url()}`);
    });
    page.on('request', request => {
      if (!['GET', 'HEAD'].includes(request.method())) errors.push(`${width}px: unexpected ${request.method()} ${request.url()}`);
      const url = new URL(request.url());
      if (url.origin !== new URL(base).origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) errors.push(`${width}px: unexpected external request ${request.url()}`);
    });
    assert.equal((await page.goto(base + path)).status(), 200);
    return { context, page };
  };
  const roundScope = (page, round) => page.locator(`[data-math-round="${round.id}"]`);
  const summary = (page, round) => roundScope(page, round).locator('[data-math-summary]');
  const correctCount = async (page, round, expected) => {
    assert.match(await summary(page, round).innerText(), new RegExp(`^${expected} correct checks out of 5`), `${round.id}: isolated score`);
  };
  const noOverflow = async (page, width) => {
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No horizontal page overflow at ${width}px`);
    for (const card of await page.locator('[data-math-question]').all()) {
      const box = await card.boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width + 1, `Question card fits ${width}px`);
    }
    for (const input of await page.locator('[data-math-share-url]').all()) {
      const box = await input.boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width + 1, `Public share field fits ${width}px`);
    }
  };
  const stores = async (scope, placement) => {
    const links = await scope.locator('.install-link').evaluateAll(links => links.map(link => ({ href: link.href, app: link.dataset.app, placement: link.dataset.placement })));
    assert.deepEqual(links.map(link => canonicalStore(link.href)).sort(), expectedStores, `${placement}: current Math destinations`);
    assert(links.every(link => link.app === 'math-riddles' && link.placement === placement));
    for (const link of links) {
      if (link.href.includes('play.google.com')) {
        const url = new URL(link.href);
        assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
        assert.equal(url.searchParams.get('utm_campaign'), 'tools-math-puzzle-challenge');
        assert.equal(url.searchParams.get('utm_content'), placement);
      } else assert.equal(new URL(link.href).search, '');
    }
    for (const link of await scope.locator('.install-link').all()) {
      assert(await link.isVisible(), `${placement}: store link visible`);
      assert((await link.boundingBox()).height >= 44, `${placement}: touch-sized store link`);
    }
  };
  const shareDestination = round => `${publicPage}#round-${round.id}`;
  const shareFields = async (page, javaScriptEnabled) => {
    for (const round of mathRounds) {
      const scope = roundScope(page, round);
      const expected = shareDestination(round);
      assert.equal(await scope.locator('[data-math-round-link]').getAttribute('href'), expected);
      assert.equal(await scope.locator('[data-math-share-url]').inputValue(), expected);
      assert(await scope.locator('[data-math-share-url]').evaluate(input => input.readOnly), 'Public share destination is read-only');
      assert.equal(new URL(expected).search, '', 'Shared URL contains no inputs, score or visitor parameters');
      assert.equal(await scope.locator('[data-math-share-status]').getAttribute('role'), 'status');
      assert.equal(await scope.locator('[data-math-copy]').isVisible(), javaScriptEnabled, 'Copy button is progressively enhanced');
      assert(await scope.locator('[data-math-round-link]').isVisible(), 'Static share link works without JavaScript');
      assert(await scope.locator('[data-math-share-url]').isVisible(), 'Public URL remains available for manual copy');
    }
  };
  const nativeNavigation = async page => {
    for (const id of ['mixed', 'logic']) {
      await page.locator(`a[href="#round-${id}"]`).first().click();
      assert.equal(new URL(page.url()).hash, `#round-${id}`);
      const box = await page.locator(`#round-${id}`).boundingBox();
      assert(box && box.y >= 0 && box.y < 960, `${id}: native round anchor scrolls to its target`);
    }
    await page.goBack();
    assert.equal(new URL(page.url()).hash, '#round-mixed', 'Browser back retains native anchor navigation');
    await page.goto(base + path + '#puzzle-brackets');
    assert.equal(new URL(page.url()).hash, '#puzzle-brackets');
    const legacyBox = await page.locator('#puzzle-brackets').boundingBox();
    assert(legacyBox && legacyBox.y >= 0 && legacyBox.y < 960, 'Existing puzzle deep link remains usable');
    assert.equal(await page.locator('[data-math-question]:visible').count(), 15, 'Deep links do not hide the other static rounds');
  };
  try {
    for (const width of [320, 390, 1440]) {
      const { context, page } = await prepareContext(width);
      try {
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), publicPage);
        assert.equal(await page.locator('[data-math-round]').count(), 3);
        assert.equal(await page.locator('[data-math-question]:visible').count(), 15);
        assert.equal(await page.locator('.math-challenge-form:visible').count(), 15, 'All fifteen check forms are enhanced');
        assert.equal(await page.locator('[data-math-reset]:visible').count(), 3, 'Each round has its own reset');
        await noOverflow(page, width);
        await stores(page.locator('.app-install'), 'header');
        for (const link of await page.locator('.app-install .install-link').all()) {
          const box = await link.boundingBox();
          assert(box.y >= 0 && box.y + box.height <= 960, 'Top store links begin inside the viewport');
        }
        if (qaDir) await page.screenshot({ path: resolve(qaDir, `math-challenge-top-${width}.png`) });
        const firstCheckButton = page.locator('[data-math-question="brackets"] button[type="submit"]');
        for (const hovered of [false, true]) {
          if (hovered) await firstCheckButton.hover();
          else await page.mouse.move(0, 0);
          const colors = await firstCheckButton.evaluate(element => {
            const style = getComputedStyle(element);
            return { color: style.color, background: style.backgroundColor };
          });
          assert(contrastRatio(colors.color, colors.background) >= 4.5, `Check answer ${hovered ? 'hover' : 'default'} text contrast at ${width}px: ${JSON.stringify(colors)}`);
        }
        for (const round of mathRounds) await correctCount(page, round, 0);
        for (const [roundIndex, round] of mathRounds.entries()) {
          for (const [index, question] of round.questions.entries()) {
            const card = roundScope(page, round).locator(`[data-math-question="${question.id}"]`);
            assert(await card.locator('h3').isVisible(), 'Question uses a heading below its round heading');
            const input = card.locator('.math-challenge-form input');
            const feedback = card.locator('[data-math-feedback]');
            await input.fill('');
            await card.getByRole('button', { name: 'Check answer' }).click();
            assert.equal(await input.getAttribute('aria-invalid'), 'true');
            assert(await input.evaluate(element => element === document.activeElement), 'Invalid answer returns keyboard focus to the field');
            assert.match(await feedback.innerText(), /^Enter a whole number/);
            assert.equal(await feedback.getAttribute('role'), 'status');
            assert.equal(await feedback.getAttribute('aria-live'), 'polite');
            await input.fill(String(question.answer + 1));
            await input.press('Enter');
            assert.equal(await feedback.getAttribute('data-kind'), 'retry');
            assert.equal(await input.getAttribute('aria-invalid'), 'false');
            assert.match(await feedback.innerText(), /^Not quite/);
            await input.fill(String(question.answer));
            assert.equal(await feedback.innerText(), '', 'Editing clears stale feedback');
            await input.press('Enter');
            assert.equal(await feedback.getAttribute('data-kind'), 'correct');
            await correctCount(page, round, index + 1);
            for (const [otherIndex, other] of mathRounds.entries()) {
              if (otherIndex !== roundIndex) await correctCount(page, other, otherIndex < roundIndex ? 5 : 0);
            }
          }
        }
        const mixed = mathRounds[0];
        const first = page.locator('[data-math-question="brackets"]');
        const firstInput = first.locator('.math-challenge-form input');
        await firstInput.fill('22');
        await correctCount(page, mixed, 4);
        assert.equal(await first.locator('[data-math-feedback]').innerText(), '', 'Editing invalidates a previous correct check');
        for (const bad of ['1e2', '21.0', '9+12', 'Infinity', '1000000']) {
          await firstInput.fill(bad);
          await firstInput.press('Enter');
          assert.equal(await firstInput.getAttribute('aria-invalid'), 'true', `${bad}: invalid whole-number input`);
        }
        const hint = first.locator('details').first();
        await hint.locator('summary').focus();
        await page.keyboard.press('Enter');
        assert.equal(await hint.evaluate(element => element.open), true, 'Native hint opens by keyboard');
        assert(await hint.locator('p').isVisible());
        const solution = first.locator('details').last();
        await solution.locator('summary').click();
        assert.equal(await solution.evaluate(element => element.open), true);
        assert.match(await solution.locator('p').innerText(), /Answer: 21\./);
        await correctCount(page, mixed, 4);
        for (const other of mathRounds.slice(1)) await correctCount(page, other, 5);
        await firstInput.fill('21');
        await firstInput.press('Enter');
        await correctCount(page, mixed, 5);
        if (qaDir) await first.screenshot({ path: resolve(qaDir, `math-challenge-feedback-${width}.png`) });
        // Keep a hint open in a different round to prove reset is not global.
        const otherHint = roundScope(page, mathRounds[1]).locator('details').first();
        await otherHint.locator('summary').click();
        await roundScope(page, mixed).locator('[data-math-reset]').click();
        await correctCount(page, mixed, 0);
        assert.deepEqual(await roundScope(page, mixed).locator('.math-challenge-form input').evaluateAll(inputs => inputs.map(input => input.value)), ['', '', '', '', '']);
        assert.equal(await roundScope(page, mixed).locator('details[open]').count(), 0, 'Round reset closes only its own hints and answers');
        assert.equal(await roundScope(page, mixed).locator('[data-math-feedback][data-kind]').count(), 0);
        assert(await firstInput.evaluate(element => element === document.activeElement), 'Reset returns focus to the first answer in its round');
        assert.equal(await otherHint.evaluate(element => element.open), true, 'A different round keeps its open hint');
        for (const other of mathRounds.slice(1)) {
          await correctCount(page, other, 5);
          assert.deepEqual(await roundScope(page, other).locator('.math-challenge-form input').evaluateAll(inputs => inputs.map(input => input.value)), other.questions.map(question => String(question.answer)), 'A different round keeps all answers');
          await roundScope(page, other).locator('[data-math-reset]').click();
          await correctCount(page, other, 0);
        }
        assert.equal(await page.locator('details[open]').count(), 0);
        await stores(page.locator('#continue-playing'), 'tool-end');
        await page.locator('#continue-playing').scrollIntoViewIfNeeded();
        if (qaDir) await page.locator('#continue-playing').screenshot({ path: resolve(qaDir, `math-challenge-download-${width}.png`) });
        await shareFields(page, true);
        assert.deepEqual(await page.evaluate(() => window.__mathClipboardCalls), [], 'No clipboard write happens before an explicit copy click');
        for (const round of mathRounds) {
          const scope = roundScope(page, round);
          await scope.locator('[data-math-copy]').click();
          assert.match(await scope.locator('[data-math-share-status]').innerText(), /copied/i);
        }
        assert.deepEqual(await page.evaluate(() => window.__mathClipboardCalls), mathRounds.map(shareDestination), 'Only requested public round links reach the clipboard');
        await noOverflow(page, width);
        assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0], 'Challenge does not save browser records');
        await nativeNavigation(page);
      } finally { await context.close(); }

      const { context: plainContext, page: plain } = await prepareContext(width, false);
      try {
        assert.equal(await plain.locator('[data-math-question]:visible').count(), 15, 'All questions are readable without JavaScript');
        assert.equal(await plain.locator('.math-challenge-form:visible').count(), 0, 'No dead check forms without JavaScript');
        assert.equal(await plain.locator('[data-math-reset]:visible').count(), 0);
        assert(await plain.locator('noscript').isVisible());
        for (const question of questions) {
          const card = plain.locator(`[data-math-question="${question.id}"]`);
          assert(await card.locator('h3').isVisible());
          for (const details of await card.locator('details').all()) {
            await details.locator('summary').click();
            assert.notEqual(await details.getAttribute('open'), null, 'Native details opens without JavaScript');
            assert(await details.locator('p').isVisible());
          }
          assert((await card.locator('details').last().innerText()).includes(`Answer: ${question.answer}.`));
        }
        await shareFields(plain, false);
        await noOverflow(plain, width);
        await stores(plain.locator('.app-install'), 'header');
        await stores(plain.locator('#continue-playing'), 'tool-end');
        if (qaDir) await plain.locator('[data-math-question="rectangles"]').screenshot({ path: resolve(qaDir, `math-challenge-nojs-${width}.png`) });
        await nativeNavigation(plain);
      } finally { await plainContext.close(); }
    }
    const { context: blockedContext, page: blocked } = await prepareContext(390, true, 'reject');
    try {
      const round = mathRounds[1];
      const scope = roundScope(blocked, round);
      await scope.locator('.math-challenge-form input').first().fill('12345');
      await scope.locator('.math-challenge-form input').first().press('Enter');
      await scope.locator('[data-math-copy]').click();
      const field = scope.locator('[data-math-share-url]');
      assert.match(await scope.locator('[data-math-share-status]').innerText(), /copy|select|manually/i, 'Clipboard rejection explains the manual-copy fallback');
      assert(await field.evaluate(input => input === document.activeElement && input.selectionStart === 0 && input.selectionEnd === input.value.length), 'Clipboard rejection focuses and selects the complete public URL');
      assert.equal(await field.inputValue(), shareDestination(round));
      assert.deepEqual(await blocked.evaluate(() => window.__mathClipboardCalls), [shareDestination(round)], 'Failed clipboard attempt still excludes answer data and query strings');
      assert.deepEqual(await blocked.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      if (qaDir) await scope.locator('[data-math-share-url]').screenshot({ path: resolve(qaDir, 'math-challenge-manual-copy-390.png') });
    } finally { await blockedContext.close(); }
    assert.deepEqual(errors, [], 'No JavaScript errors, missing local assets, extra external requests or answer submissions over the network');
    console.log('PASS: Math challenge browser QA at 320/390/1440px; all 15 answers, three isolated round scores/resets, keyboard/no-JS access, legacy anchors, native back, verified stores, public-only sharing and clipboard fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
