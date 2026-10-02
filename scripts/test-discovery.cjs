// Local browser regression test; run after build-guides with a static server and development-only Playwright.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4194').replace(/\/$/, '');
const qaDir = process.env.MOOCSOFT_QA_DIR;
const macroPath = '/tools/calorie-macro-calculator/';
const habitPath = '/tools/habit-streak-calendar/';
const privateMarker = 'discovery-form-marker-724197';
const number = text => Number(text.replace(/[^\d.-]/g, ''));
const canonicalStore = value => {
  const url = new URL(value);
  for (const name of [...url.searchParams.keys()]) if (name.startsWith('utm_')) url.searchParams.delete(name);
  return url.href;
};
const placements = new Set(['page', 'header', 'directory', 'calculator-result', 'guide-preview', 'product-end', 'tool-end', 'article-end', 'topic-end', 'sidebar']);

(async () => {
  const { apps } = await import(pathToFileURL(resolve(__dirname, '../content/apps.mjs')).href);
  const catalogue = Object.values(apps);
  assert.equal(catalogue.length, 6, 'The public app catalogue has six apps');
  if (qaDir) mkdirSync(qaDir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: 'en-US', timezoneId: 'Europe/Istanbul' });
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      await context.route('https://fonts.gstatic.com/**', route => route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(`${width}px: ${error.message}`));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${width}px: ${response.status()} ${response.url()}`);
      });
      const visit = async path => {
        assert.equal((await page.goto(base + path)).status(), 200, path);
        assert.equal(await page.locator('h1').count(), 1, `One heading: ${path}`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No page overflow: ${path} at ${width}px`);
      };
      const screenshot = async (locator, name) => {
        if (qaDir) await locator.screenshot({ path: resolve(qaDir, `${name}-${width}.png`) });
      };
      const storeLinks = async scope => scope.locator('a.install-link').evaluateAll(links => links.map(link => ({ href: link.href, app: link.dataset.app, placement: link.dataset.placement })));
      const checkStoreScope = async (scope, app, placement) => {
        const links = await storeLinks(scope);
        assert.deepEqual(links.map(link => canonicalStore(link.href)).sort(), [app.apple, app.google].filter(Boolean).sort(), `Store destinations: ${app.name}`);
        assert(links.every(link => link.app === app.slug && link.placement === placement), `App and placement: ${app.name}`);
        for (const link of await scope.locator('a.install-link').all()) {
          assert(await link.isVisible(), `Download link rendered: ${app.name}`);
          const box = await link.boundingBox();
          assert(box && box.height >= 44, `Touch-sized download link: ${app.name}`);
        }
      };
      const checkAttribution = async (campaign, expectPlay = true) => {
        const links = await page.locator('a[href*="play.google.com/store/apps/details"]').evaluateAll(links => links.map(link => ({ href: link.href, placement: link.dataset.placement || 'page' })));
        if (expectPlay) assert(links.length > 0, `Google Play links present: ${campaign}`);
        else assert.equal(links.length, 0, 'An iOS-only app must not acquire a Google Play destination');
        for (const link of links) {
          const url = new URL(link.href);
          assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
          assert.equal(url.searchParams.get('utm_medium'), 'referral');
          assert.equal(url.searchParams.get('utm_campaign'), campaign, 'Campaign identifies the public page');
          assert(placements.has(link.placement), 'Placement is a public UI label');
          assert.equal(url.searchParams.get('utm_content'), link.placement);
          assert.deepEqual([...url.searchParams.keys()].sort(), ['id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].sort(), 'No visitor or form-value parameters');
          assert(!link.href.includes(privateMarker) && !link.href.includes('724197'), 'No form values in attribution');
        }
        for (const href of await page.locator('a[href*="apps.apple.com/"]').evaluateAll(links => links.map(link => link.href))) {
          assert.equal(new URL(href).search, '', 'App Store links retain canonical destinations');
        }
      };

      try {
        for (const [path, campaign] of [['/', 'home'], ['/tools/', 'tools'], ['/guides/', 'guides']]) {
          await visit(path);
          const choices = page.locator('.guide-app-choices');
          assert.equal(await choices.count(), 1, `One app chooser: ${path}`);
          assert.deepEqual((await choices.locator('a.guide-app-choice').evaluateAll(links => links.map(link => new URL(link.href).pathname))).sort(), catalogue.map(app => `/${app.slug}/`).sort(), `All six chooser destinations: ${path}`);
          await screenshot(choices, `${campaign}-chooser`);
          const directory = page.locator('.guide-store-directory');
          assert.equal(await directory.count(), 1);
          assert.equal(await directory.getAttribute('open'), null, 'Store directory begins collapsed');
          await directory.locator('summary').click();
          assert.notEqual(await directory.getAttribute('open'), null, 'Store directory opens');
          assert.equal(await directory.locator('.guide-download').count(), 6);
          for (const app of catalogue) await checkStoreScope(directory.locator(`section[aria-label="Get ${app.name}"]`), app, 'directory');
          await checkAttribution(campaign);
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Expanded directory does not overflow');
          await screenshot(directory, `${campaign}-directory`);
        }

        for (const app of catalogue) {
          await visit(`/${app.slug}/`);
          await checkStoreScope(page.locator('.app-install'), app, 'header');
          await checkAttribution(app.slug, Boolean(app.google));
          for (const link of await page.locator('.app-install .install-link').all()) {
            const box = await link.boundingBox();
            assert(box && box.y >= 0 && box.y + box.height <= 900, `Header download visible: ${app.name}`);
          }
          if (app.slug === 'math-riddles') {
            await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
            assert.equal(await page.locator('.site-header').evaluate(element => getComputedStyle(element).position), 'sticky');
            const headerBox = await page.locator('.site-header').boundingBox();
            assert(headerBox && Math.abs(headerBox.y) <= 1, 'Math header remains at the top after scrolling');
            const finalCta = page.locator('.guide-download');
            await finalCta.scrollIntoViewIfNeeded();
            await checkStoreScope(finalCta, app, 'product-end');
            await screenshot(finalCta, 'math-final-download');
          }
        }

        await visit('/did-you-lift/');
        const proof = page.locator('.dyl-proof');
        await proof.scrollIntoViewIfNeeded();
        assert.equal(await proof.locator('img').count(), 3);
        await proof.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
        assert.deepEqual(await proof.locator('img').evaluateAll(images => images.map(image => [image.naturalWidth, image.naturalHeight])), [[600, 1304], [600, 1304], [600, 1304]]);
        assert.match(await proof.innerText(), /Last time.*Premium/s);
        await screenshot(proof, 'dyl-proof');
        const gallery = page.locator('.dyl-proof-gallery');
        if (width === 390) {
          assert(await gallery.evaluate(element => element.scrollWidth > element.clientWidth), 'Mobile gallery has a horizontal scroll region');
          await gallery.scrollIntoViewIfNeeded();
          await gallery.evaluate(element => element.scrollTo({ left: element.scrollWidth, behavior: 'instant' }));
          await page.waitForFunction(() => {
            const element = document.querySelector('.dyl-proof-gallery');
            return element.scrollLeft >= element.scrollWidth - element.clientWidth - 2;
          });
          const last = await gallery.locator('figure').last().boundingBox();
          assert(last && last.x >= 0 && last.x + last.width <= width, 'Last mobile screenshot is fully reachable');
          if (qaDir) await page.screenshot({ path: resolve(qaDir, `dyl-gallery-last-${width}.png`) });
        }
        for (const slug of ['how-to-log-gym-workouts', 'workout-planner-vs-workout-log']) {
          await visit(`/guides/${slug}/`);
          const preview = page.locator('.guide-app-preview.has-image');
          assert.equal(await preview.count(), 1);
          await preview.scrollIntoViewIfNeeded();
          const image = preview.locator('figure img');
          await image.evaluate(element => element.decode());
          assert.equal(await image.getAttribute('src'), '/assets/apps/did-you-lift/app-store-set-log.jpg');
          assert.equal(await image.evaluate(element => element.naturalWidth), 600);
          assert.match(await preview.locator('figcaption').innerText(), /Last time.*requires Premium/);
          await checkStoreScope(preview, apps.training, 'guide-preview');
          await checkAttribution(`guides-${slug}`);
          await screenshot(preview, slug);
        }

        await page.clock.setFixedTime(new Date('2026-10-02T12:00:00+03:00'));
        await visit(habitPath);
        const habitResult = page.locator('.panel-side .result-download');
        assert.equal(await habitResult.count(), 1);
        assert.equal(await page.locator('.result-list .result-download').count(), 0, 'Habit CTA is outside the numeric result list');
        await checkStoreScope(habitResult, apps.habits, 'calculator-result');
        await checkAttribution('tools-habit-streak-calendar');
        const habitHrefs = (await storeLinks(habitResult)).map(link => link.href);
        assert.equal(await page.locator('#total-completions').innerText(), '0');
        await page.locator('#habit-name').fill(privateMarker);
        await page.locator('#mark-today').click();
        for (const id of ['current-streak', 'longest-streak', 'month-completions', 'total-completions']) assert.equal(await page.locator('#' + id).innerText(), '1');
        assert.equal(await page.locator('#completion-rate').innerText(), '50%');
        assert.equal(await page.locator('.calendar-day.today').getAttribute('aria-pressed'), 'true');
        await page.locator('#mark-today').click();
        assert.equal(await page.locator('#total-completions').innerText(), '1', 'Mark today is idempotent');
        assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('moocsoft-habit-streak-v1'))), ['2026-10-02']);
        assert.deepEqual((await storeLinks(habitResult)).map(link => link.href), habitHrefs, 'Habit name and completions do not change store URLs');
        await checkAttribution('tools-habit-streak-calendar');
        await page.reload();
        assert.equal(await page.locator('#total-completions').innerText(), '1', 'Existing local persistence is preserved');
        await screenshot(page.locator('.calculator-layout'), 'habit-result');

        await visit(macroPath + '?age=724197&goal=724197');
        await checkAttribution('tools-calorie-macro-calculator');
        const macroHrefs = await page.locator('#result-content .install-link').evaluateAll(links => links.map(link => link.href));
        const submit = () => page.locator('#macro-form button[type=submit]').click();
        const staleHidden = async () => {
          assert(await page.locator('#result-content').isHidden(), 'Old macro result is hidden');
          assert(await page.locator('#result-content .result-download').isHidden(), 'Old result CTA is hidden');
          assert(await page.locator('#result-empty').isVisible());
        };
        await staleHidden();
        await submit();
        for (const [id, expected] of [['calories', 2250], ['maintenance', 2250], ['protein', 112], ['carbs', 310], ['fat', 62], ['bmr', 1452]]) assert.equal(number(await page.locator('#' + id).innerText()), expected, `Default macro arithmetic: ${id}`);
        for (const [selector, value, select] of [['#age', '31'], ['#height-cm', '175'], ['#weight-kg', '72.5'], ['#sex', 'male', true], ['#activity', '1.2', true], ['#goal', '-250', true]]) {
          if (select) await page.locator(selector).selectOption(value); else await page.locator(selector).fill(value);
          await staleHidden();
          await submit();
          assert(await page.locator('#result-content').isVisible(), 'Recalculation restores the result');
        }
        await page.locator('#us-button').click();
        await staleHidden();
        assert.equal(await page.locator('#us-button').getAttribute('aria-pressed'), 'true');
        await submit();
        assert(await page.locator('#result-content').isVisible());
        await page.locator('#metric-button').click();
        await staleHidden();
        for (const [selector, value] of [['#age', ''], ['#age', '17'], ['#age', '101'], ['#age', '30.5'], ['#height-cm', ''], ['#height-cm', '119'], ['#height-cm', '231'], ['#weight-kg', ''], ['#weight-kg', '0'], ['#weight-kg', '301']]) {
          await page.locator('#age').fill('30');
          await page.locator('#height-cm').fill('170');
          await page.locator('#weight-kg').fill('70');
          await page.locator(selector).fill(value);
          await submit();
          await staleHidden();
          assert((await page.locator('#form-error').innerText()).length > 0, `Invalid input rejected: ${selector}=${value}`);
        }
        await page.locator('#age').fill('30');
        await page.locator('#sex').selectOption('female');
        await page.locator('#activity').selectOption('1.55');
        await page.locator('#goal').selectOption('0');
        await page.locator('#us-button').click();
        for (const [feet, inches, pounds] of [['5', '', '154'], ['', '0', '154'], ['5.5', '0', '154'], ['7', '11.9', '154'], ['5', '0', '']]) {
          await page.locator('#height-ft').fill(feet);
          await page.locator('#height-in').fill(inches);
          await page.locator('#weight-lb').fill(pounds);
          await submit();
          await staleHidden();
          assert((await page.locator('#form-error').innerText()).length > 0, `Invalid US values rejected: ${feet} ft, ${inches} in, ${pounds} lb`);
        }
        await page.locator('#height-ft').fill('5');
        await page.locator('#height-in').fill('0');
        await page.locator('#weight-lb').fill('154');
        await submit();
        assert(await page.locator('#result-content').isVisible(), 'Zero additional inches is valid');
        assert.equal(number(await page.locator('#calories').innerText()), 2077);
        assert.equal(number(await page.locator('#bmr').innerText()), 1340);
        assert.equal(await page.locator('#form-error').innerText(), '');
        assert.deepEqual(await page.locator('#result-content .install-link').evaluateAll(links => links.map(link => link.href)), macroHrefs, 'Body measurements and goals do not change store URLs');
        await checkAttribution('tools-calorie-macro-calculator');
        await screenshot(page.locator('.calculator-layout'), 'macro-us-zero-inches');
        assert.deepEqual(errors, [], 'No browser errors or failed local resources');
        console.log(`PASS ${width}px: discovery directories, six product headers, math sticky CTA, DYL screenshots/previews, Habit check-in, macro arithmetic/validation and public-only attribution.`);
      } catch (error) {
        if (qaDir) await page.screenshot({ path: resolve(qaDir, `discovery-failure-${width}.png`), fullPage: true }).catch(() => {});
        throw error;
      } finally { await context.close(); }
    }
    console.log('PASS: discovery regression completed on mobile and desktop.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
