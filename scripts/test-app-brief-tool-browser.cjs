// Development-only browser QA; no browser library is delivered to visitors.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync, readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4203').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const path = '/tools/app-brief-builder/';

(async () => {
  if (qaDir) {
    const distance = relative(resolve(__dirname, '..'), qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep QA screenshots outside the public site');
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localPaths = new Set();
  if (qaDir) mkdirSync(qaDir, { recursive: true });
  try {
    for (const width of [320, 390, 1440]) for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce', acceptDownloads: true });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      if (javaScriptEnabled) await context.addInitScript(() => {
        window.__briefCopied = [];
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__briefCopied.push(text); } } });
      });
      const page = await context.newPage();
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => { if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.url()); });
      page.on('request', request => {
        if (request.method() !== 'GET') failures.push('Unexpected non-GET request: ' + request.url());
        if (!request.url().startsWith(base + '/') && !request.url().startsWith('https://fonts.google')) failures.push('Unexpected external request: ' + request.url());
      });
      assert.equal((await page.goto(base + path)).status(), 200);
      assert.equal(await page.title(), 'Free Mobile App Project Brief Builder & Template | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.locator('.app-install, .install-link, a[href*="apps.apple.com"], a[href*="play.google.com"]').count(), 0);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + path);
      assert(await page.locator('#blank-checklist ol li').count() >= 7);
      assert(await page.locator('#worked-example').isVisible());
      for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
        if (href.startsWith('/') && !href.startsWith('//')) localPaths.add(href.split('#')[0]);
        if (href.startsWith('#')) assert.equal(await page.locator(`[id="${href.slice(1)}"]`).count(), 1, href);
        assert(!href.includes('mailto:') && !href.includes('userProblem='));
      }
      if (!javaScriptEnabled) {
        assert.equal(await page.locator('[data-app-brief-form]').isVisible(), false);
        assert.equal(await page.locator('[data-app-brief-result]').isVisible(), false);
        assert(await page.locator('noscript').isVisible());
        await page.locator('.brief-jump-links a[href="#blank-checklist"]').click();
        assert.equal(new URL(page.url()).hash, '#blank-checklist');
      } else {
        const form = page.locator('[data-app-brief-form]');
        const output = page.locator('[data-app-brief-output]');
        const result = page.locator('[data-app-brief-result]');
        const status = page.locator('[data-app-brief-status]');
        const outputStatus = page.locator('[data-app-brief-output-status]');
        const field = key => page.locator(`[data-brief-field="${key}"]`);
        const generate = page.getByRole('button', { name: 'Generate my brief', exact: true });
        assert(await form.isVisible());
        assert.equal(await result.isVisible(), false);
        await generate.click();
        assert.match(await status.textContent(), /review 4 fields/);
        assert.equal(await field('userProblem').getAttribute('aria-invalid'), 'true');
        assert.equal(await field('userProblem').evaluate(node => document.activeElement === node), true);
        const hostile = '<img src=x onerror=alert(1)> & "literal text"';
        await field('userProblem').fill(hostile);
        await field('workflow').fill('Open the meeting.\nChoose a response.\nReopen and see it.');
        await field('feature1').fill('Show the meeting');
        await field('feature2').fill('Record attendance');
        await field('feature3').fill('Edit the meeting');
        await field('platform').selectOption('both');
        await field('dataNeeds').fill('Shared meeting details. Offline update behavior is undecided.');
        await generate.click();
        assert(await result.isVisible());
        const text = await output.inputValue();
        assert(text.includes(hostile));
        assert(text.includes('Open the meeting.\nChoose a response.\nReopen and see it.'));
        assert(text.includes('1. Show the meeting\n2. Record attendance\n3. Edit the meeting'));
        assert(text.includes('\n4. TARGET PLATFORMS\niOS and Android\n'));
        assert.equal(await page.locator('img[src="x"]').count(), 0, 'Plain text must not become an HTML element');
        assert.equal(await output.getAttribute('readonly'), '');
        await page.getByRole('button', { name: 'Copy brief', exact: true }).click();
        assert.deepEqual(await page.evaluate(() => window.__briefCopied), [text]);
        assert.match(await outputStatus.textContent(), /Brief copied/);
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download .txt', exact: true }).click();
        const download = await downloadPromise;
        assert.equal(download.suggestedFilename(), 'mobile-app-project-brief.txt');
        assert.equal(readFileSync(await download.path(), 'utf8'), text);
        assert.equal(new URL(page.url()).search, '', 'No private fields in a query string');
        assert.equal(new URL(page.url()).hash, '', 'No private fields in a fragment');
        await field('constraints').fill('Ask who owns the store account.');
        assert.equal(await result.isVisible(), false);
        assert.equal(await output.inputValue(), '');
        assert(await page.locator('[data-app-brief-copy]').isDisabled());
        assert(await page.locator('[data-app-brief-download]').isDisabled());
        await generate.click();
        await field('platform').selectOption('ios');
        assert.equal(await result.isVisible(), false, 'Changing a select also invalidates the old output');
        await generate.click();
        await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied'); }; });
        await page.getByRole('button', { name: 'Copy brief', exact: true }).click();
        assert.match(await outputStatus.textContent(), /selected.*Copy command/);
        assert.deepEqual(await output.evaluate(node => [node.selectionStart, node.selectionEnd]), [0, (await output.inputValue()).length]);
        assert.equal(await output.evaluate(node => document.activeElement === node), true);
        if (qaDir) {
          await page.screenshot({ path: resolve(qaDir, `app-brief-result-${width}.png`) });
          await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
          await page.screenshot({ path: resolve(qaDir, `app-brief-hero-${width}.png`) });
        }
        await page.getByRole('button', { name: 'Clear all planning fields', exact: true }).click();
        assert.equal(await output.inputValue(), '');
        assert.equal(await field('userProblem').inputValue(), '');
        assert.equal(await field('platform').inputValue(), 'undecided');
        assert.equal(await result.isVisible(), false);
        assert.equal(await field('userProblem').evaluate(node => document.activeElement === node), true);
        assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
        await field('workflow').fill('Unsaved private planning text');
        await page.reload();
        assert.equal(await field('workflow').inputValue(), '', 'Planning entries must not persist between visits');
        assert.equal(await result.isVisible(), false);
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await context.close();
    }
    const context = await browser.newContext();
    for (const route of localPaths) assert.equal((await context.request.get(base + route)).status(), 200, route);
    await context.close();
    assert.deepEqual(failures, []);
    console.log('PASS: app brief 320/390/1440px, JavaScript-off checklist/example, service-only links, literal input, local copy/download, fallback, stale output, reset, no persistence/transmission and valid local destinations.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
