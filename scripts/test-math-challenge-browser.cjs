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
  const { mathChallenge } = await import(pathToFileURL(resolve(siteRoot, 'content/math-challenge.mjs')).href);
  const { apps } = await import(pathToFileURL(resolve(siteRoot, 'content/apps.mjs')).href);
  const expectedStores = [apps.math.apple, apps.math.google].sort();
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  const prepareContext = async (width, javaScriptEnabled = true) => {
    const context = await browser.newContext({ viewport: { width, height: 960 }, locale: 'en-US', reducedMotion: 'reduce', javaScriptEnabled });
    await context.route('https://fonts.googleapis.com/**', route => route.abort());
    await context.route('https://fonts.gstatic.com/**', route => route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(`${width}px: ${error.message}`));
    page.on('response', response => {
      if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${width}px: ${response.status()} ${response.url()}`);
    });
    page.on('request', request => {
      if (!['GET', 'HEAD'].includes(request.method())) errors.push(`${width}px: unexpected ${request.method()} ${request.url()}`);
    });
    assert.equal((await page.goto(base + path)).status(), 200);
    return { context, page };
  };
  const noOverflow = async (page, width) => {
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No horizontal page overflow at ${width}px`);
    for (const card of await page.locator('[data-math-question]').all()) {
      const box = await card.boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= width + 1, `Question card fits ${width}px`);
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
  try {
    for (const width of [320, 390, 1440]) {
      const { context, page } = await prepareContext(width);
      try {
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + path);
        assert.equal(await page.locator('.math-challenge-form:visible').count(), 5, 'All check forms are enhanced');
        assert(await page.locator('[data-math-reset]').isVisible());
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
        const summary = page.locator('[data-math-summary]');
        assert.match(await summary.innerText(), /^0 correct checks out of 5/);
        for (const [index, question] of mathChallenge.entries()) {
          const card = page.locator(`[data-math-question="${question.id}"]`);
          const input = card.locator('input');
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
          assert.match(await summary.innerText(), new RegExp(`^${index + 1} correct checks out of 5`));
        }
        const first = page.locator('[data-math-question="brackets"]');
        await first.locator('input').fill('22');
        assert.match(await summary.innerText(), /^4 correct checks out of 5/, 'Editing invalidates a previous correct check');
        assert.equal(await first.locator('[data-math-feedback]').innerText(), '');
        for (const bad of ['1e2', '21.0', '9+12', 'Infinity', '1000000']) {
          await first.locator('input').fill(bad);
          await first.locator('input').press('Enter');
          assert.equal(await first.locator('input').getAttribute('aria-invalid'), 'true', `${bad}: invalid whole-number input`);
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
        assert.match(await summary.innerText(), /^4 correct checks out of 5/, 'Revealing a solution is not a correct check');
        await first.locator('input').fill('21');
        await first.locator('input').press('Enter');
        assert.match(await summary.innerText(), /^5 correct checks out of 5/);
        if (qaDir) await first.screenshot({ path: resolve(qaDir, `math-challenge-feedback-${width}.png`) });
        await stores(page.locator('#continue-playing'), 'tool-end');
        await page.locator('#continue-playing').scrollIntoViewIfNeeded();
        if (qaDir) await page.locator('#continue-playing').screenshot({ path: resolve(qaDir, `math-challenge-download-${width}.png`) });
        await page.locator('[data-math-reset]').click();
        assert.match(await summary.innerText(), /^0 correct checks out of 5/);
        assert.deepEqual(await page.locator('.math-challenge-form input').evaluateAll(inputs => inputs.map(input => input.value)), ['', '', '', '', '']);
        assert.equal(await page.locator('details[open]').count(), 0, 'Reset closes every hint and answer');
        assert.equal(await page.locator('[data-math-feedback][data-kind]').count(), 0);
        assert(await first.locator('input').evaluate(element => element === document.activeElement), 'Reset returns focus to the first answer');
        await noOverflow(page, width);
        assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0], 'Challenge does not save browser records');
      } finally { await context.close(); }

      const { context: plainContext, page: plain } = await prepareContext(width, false);
      try {
        assert.equal(await plain.locator('.math-challenge-form:visible').count(), 0, 'No dead check forms without JavaScript');
        assert(await plain.locator('[data-math-reset]').isHidden());
        assert(await plain.locator('noscript').isVisible());
        for (const question of mathChallenge) {
          const card = plain.locator(`[data-math-question="${question.id}"]`);
          assert(await card.locator('h2').isVisible());
          for (const details of await card.locator('details').all()) {
            await details.locator('summary').click();
            assert.notEqual(await details.getAttribute('open'), null, 'Native details opens without JavaScript');
            assert(await details.locator('p').isVisible());
          }
          assert((await card.locator('details').last().innerText()).includes(`Answer: ${question.answer}.`));
        }
        await noOverflow(plain, width);
        await stores(plain.locator('.app-install'), 'header');
        await stores(plain.locator('#continue-playing'), 'tool-end');
        if (qaDir) await plain.locator('[data-math-question="rectangles"]').screenshot({ path: resolve(qaDir, `math-challenge-nojs-${width}.png`) });
      } finally { await plainContext.close(); }
    }
    assert.deepEqual(errors, [], 'No JavaScript errors, missing local assets or answer submissions over the network');
    console.log('PASS: Math challenge browser QA at 320/390/1440px; valid/invalid/retry checks, all five answers, edit/reveal/reset, keyboard focus, stores and native no-JS fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
