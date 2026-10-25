// Isolated development-only website QA, not a bank/app reconciliation or money transfer.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4215').replace(/\/$/, '');
const origin = new URL(base).origin;
const slug = 'reconcile-savings-tracker-balance';
const route = '/guides/' + slug + '/';
const incomingRoute = '/guides/sinking-funds-vs-emergency-fund/';
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const load = name => import(pathToFileURL(resolve(root, 'content', name)).href);
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function eventually(check, message) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail(message);
}

async function focus(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.focus();
  let previous = null;
  await eventually(async () => {
    const current = await page.evaluate(() => scrollY);
    const stable = previous !== null && Math.abs(current - previous) < 1;
    previous = current;
    return stable;
  }, 'Native focus scrolling settles before keyboard activation');
  assert(await locator.evaluate(node => node === document.activeElement));
}

(async () => {
  const [{ guides }, { editorialPhotos }, { appPreviews }, { createRelatedGuideSelector }, { guideHref }, { reconciliationExample }] = await Promise.all([
    load('index.mjs'), load('editorial-media.mjs'), load('app-previews.mjs'), load('related-guides.mjs'), load('topics.mjs'), load('savings-reconciliation.mjs'),
  ]);
  const guide = guides.find(item => item.slug === slug);
  assert(guide && guide.topic === 'savings' && guide.published === '2026-10-25');
  assert.equal(guide.title, 'How to Reconcile a Savings Tracker Balance');
  assert.equal(guide.appPreview, true);
  assert.equal(guide.showToolAction, false);
  assert.deepEqual(guide.startAction, ['#step-2', 'Check the worked reconciliation ↓']);
  const expectedRelated = createRelatedGuideSelector(guides)(guide).map(guideHref);
  assert.deepEqual(expectedRelated, [
    '/guides/savings-goal-tracker-app-vs-spreadsheet/',
    '/guides/track-multiple-savings-goals/',
    '/guides/sinking-funds-vs-emergency-fund/',
  ]);
  assert.equal(guide.faq.length, 6);
  // These original examples are checked independently, without using generated HTML.
  assert.equal(420 + 85 - 30 + 45, 520);
  assert.equal(420 + 85 + 85 + 45, 635);
  assert.equal(635 - 85 - 30, 520);
  assert.equal(300 + 220, 230 + 290);
  assert.equal(230 + 290, 520);
  assert.equal(reconciliationExample.openingCents, 42000);
  for (const name of ['verified', 'draft']) {
    let balance = reconciliationExample.openingCents;
    for (const entry of reconciliationExample[name]) {
      balance += entry.depositCents - entry.withdrawalCents;
      assert.equal(entry.closingCents, balance, 'Every ' + name + ' running balance is independently checked');
    }
    assert.equal(balance, name === 'verified' ? 52000 : 63500);
  }
  assert.deepEqual(reconciliationExample.correction.map(row => [row.key, row.amountCents]), [['draft', 63500], ['duplicate', -8500], ['missing', -3000], ['corrected', 52000]]);
  assert.deepEqual(reconciliationExample.allocation, { beforeCents: [30000, 22000], moveCents: 7000, afterCents: [23000, 29000] });
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep evidence outside the public site');
    mkdirSync(qaDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localTargets = new Map();
  let visits = 0;
  async function contextFor(width, javaScriptEnabled) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, reducedMotion: 'reduce' });
    await context.route('https://fonts.googleapis.com/**', request => request.abort());
    await context.route('https://fonts.gstatic.com/**', request => request.abort());
    context.on('page', page => {
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.status() + ' ' + response.url());
      });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) failures.push('Unexpected method: ' + request.method());
        if (url.origin !== origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected remote request: ' + request.url());
      });
    });
    return context;
  }
  async function collectLinks(page, currentRoute) {
    for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
      if ((!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
      const url = new URL(href, base + currentRoute);
      if (!localTargets.has(url.pathname)) localTargets.set(url.pathname, new Set());
      if (url.hash) localTargets.get(url.pathname).add(decodeURIComponent(url.hash.slice(1)));
    }
  }
  async function checkPhoto(page, fallback = false) {
    const figure = page.locator('.guide-article > figure.guide-visual');
    assert.equal(await figure.count(), 1, 'One representative editorial photo');
    assert.equal(await figure.evaluate(node => node.previousElementSibling.id), 'step-1', 'Useful first section precedes the fallback topic photo');
    const image = figure.locator('img[data-visual-kind="photo"]');
    assert.equal(await image.count(), 1);
    assert.equal(await image.getAttribute('src'), editorialPhotos.savings.src);
    assert.equal(await image.getAttribute('alt'), editorialPhotos.savings.alt);
    assert.equal(await image.getAttribute('width'), '1200');
    assert.equal(await image.getAttribute('height'), '675');
    assert.equal(await image.getAttribute('loading'), 'lazy');
    assert.match(await figure.locator('figcaption').innerText(), /AI.generated.*not an app screenshot/i);
    const source = figure.locator('source[type="image/webp"]');
    assert.equal(await source.count(), 1);
    assert.match(await source.getAttribute('srcset'), /480w.*800w.*1200w/);
    assert.match(await source.getAttribute('sizes'), /100vw/);
    await image.scrollIntoViewIfNeeded();
    if (fallback) {
      // A native picture source change exercises JPEG fallback without assuming
      // that failure to fetch a WebP will make the browser select another type.
      await source.evaluate(node => node.remove());
      await eventually(() => image.evaluate(node => Boolean(node.currentSrc) && new URL(node.currentSrc, document.baseURI).pathname === node.getAttribute('src')), 'Native JPEG fallback selected');
    }
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0));
    const chosen = new URL(await image.evaluate(node => node.currentSrc)).pathname;
    assert(fallback ? chosen === editorialPhotos.savings.src : editorialPhotos.savings.webp.some(variant => variant.src === chosen));
    const box = await image.boundingBox();
    assert(box && box.width > 0 && box.height > 0 && Math.abs(box.width / box.height - 16 / 9) < .01);
  }
  async function checkPreview(page) {
    const block = page.locator('.guide-app-preview');
    const image = block.locator('img');
    assert.equal(await image.count(), 1, 'Use the existing actual Frugal preview, not an invented reconciliation screen');
    assert.equal(await image.getAttribute('src'), appPreviews.savings.image);
    assert.equal(await image.getAttribute('src'), '/assets/apps/frugal/goals.png');
    assert.equal(await image.getAttribute('alt'), appPreviews.savings.alt);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth === 1000 && node.naturalHeight === 2173));
    assert.match(await block.locator('figcaption').innerText(), /Official iPhone store screenshot.*Premium/i);
    assert.match(await block.innerText(), /does not hold or transfer money/i);
  }
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await contextFor(width, javaScriptEnabled);
      const page = await context.newPage();
      assert.equal((await page.goto(base + route)).status(), 200);
      visits++;
      assert.equal(await page.title(), guide.title + ' | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('h1').innerText(), guide.title);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), guide.description);
      assert.equal(await page.locator('.guide-byline time').count(), 1, 'No invented update date');
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-25');
      for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
        assert.equal(await page.locator(selector).getAttribute('content'), 'https://moocsoft.net' + editorialPhotos.savings.src);
      }
      const graph = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => JSON.parse(node.textContent)['@graph'] || JSON.parse(node.textContent)));
      const article = graph.find(node => node['@type'] === 'Article');
      assert(article);
      assert.equal(article.headline, guide.title);
      assert.equal(article.datePublished, '2026-10-25');
      assert.equal(article.dateModified, '2026-10-25');
      assert.equal(article.url, 'https://moocsoft.net' + route);
      assert.deepEqual(article.image, ['https://moocsoft.net' + editorialPhotos.savings.src]);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both verified Frugal stores at ' + placement);
        for (const link of await links.all()) {
          const url = new URL(await link.getAttribute('href'));
          assert.equal(await link.getAttribute('data-app'), 'savings-goal-tracker');
          assert(await link.isVisible());
          if (url.hostname === 'apps.apple.com') {
            assert.match(url.pathname, /id6450431254$/);
            assert.equal(url.search, '');
          } else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.goal_tracker');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_medium'), 'referral');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
            assert.deepEqual([...url.searchParams.keys()].sort(), ['id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].sort(), 'No private inputs in public attribution');
          }
        }
      }
      assert.equal(await page.locator('.guide-hero > .guide-hero-actions a[href^="/tools/"]').count(), 0, 'An unrelated savings calculator is not the first action');
      const flow = page.locator('figure.savings-reconciliation-flow');
      assert.equal(await flow.count(), 1);
      assert.equal(await flow.locator('img').count(), 0, 'The original reconciliation diagram is native HTML, not an app screen');
      assert.deepEqual(await flow.locator('li[data-reconcile-step]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-reconcile-step'))), ['draft', 'duplicate', 'missing', 'corrected']);
      for (const [step, amount] of Object.entries({ draft: 635, duplicate: 85, missing: 30, corrected: 520 })) {
        assert.match(await flow.locator('[data-reconcile-step="' + step + '"]').innerText(), new RegExp('\\$' + amount + '(?:\\.00)?(?:\\D|$)'));
      }
      assert.match(await flow.locator('[data-reconcile-step="duplicate"]').innerText(), /[−-]/, 'Removing the duplicate is a reduction');
      assert.match(await flow.locator('[data-reconcile-step="missing"]').innerText(), /[−-]/, 'Recording the missing withdrawal is a reduction');
      assert.match(await flow.locator('figcaption').innerText(), /(?:fictional|invented|illustrative)/i);
      const tables = page.locator('.guide-article .guide-table');
      assert.equal(await tables.count(), 3, 'Two transaction records and one allocation comparison');
      const usd = cents => '$' + (cents / 100).toFixed(2);
      for (const [index, name] of ['verified', 'draft'].entries()) {
        const rows = tables.nth(index).locator('tbody tr');
        assert.equal(await rows.count(), 4);
        assert.deepEqual(await rows.first().locator('th[scope="row"], td').allTextContents(), ['2026-10-01', 'Opening balance — earlier activity already included', '—', '—', '$420.00']);
        for (const [rowIndex, entry] of reconciliationExample[name].entries()) {
          assert.deepEqual(await rows.nth(rowIndex + 1).locator('th[scope="row"], td').allTextContents(), [entry.date, entry.reference, usd(entry.depositCents), usd(entry.withdrawalCents), usd(entry.closingCents)]);
        }
      }
      assert.deepEqual(await tables.nth(2).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('th[scope="row"], td')].map(cell => cell.textContent))), [
        ['Goal A', '$300.00', '−$70.00', '$230.00'],
        ['Goal B', '$220.00', '+$70.00', '$290.00'],
      ]);
      const rowCounts = [];
      for (const table of await tables.all()) {
        assert.equal(await table.getAttribute('tabindex'), '0');
        assert((await table.locator('caption').innerText()).trim().length > 10, 'Each record has a meaningful caption');
        rowCounts.push(await table.locator('tbody tr').count());
        await focus(page, table);
        if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the record table');
        }
      }
      assert.deepEqual(rowCounts.sort((a, b) => a - b), [2, 4, 4]);
      const recordsText = await tables.allTextContents();
      for (const amount of [420, 85, 30, 45, 635, 520, 300, 220, 230, 290]) {
        assert(recordsText.some(text => new RegExp('\\$' + amount + '(?:\\.00)?(?:\\D|$)').test(text)), 'The static records retain worked amount $' + amount);
      }
      const workedLink = page.locator('.guide-hero > .guide-hero-actions a[href="#step-2"]').first();
      assert.equal(await workedLink.innerText(), 'Check the worked reconciliation ↓');
      await focus(page, workedLink);
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-2');
      await eventually(() => page.evaluate(() => {
        const target = document.querySelector('#step-2').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }), 'Worked-record action lands below the sticky store header');
      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 6);
      for (const detail of await faq.all()) {
        assert.equal(await detail.getAttribute('open'), null);
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.notEqual(await detail.getAttribute('open'), null, 'Each FAQ opens natively, also with JavaScript disabled');
        assert(await detail.locator('p').isVisible());
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.equal(await detail.getAttribute('open'), null);
      }
      await checkPhoto(page);
      await checkPreview(page);
      assert.equal(await page.locator('.guide-article form, .guide-article input, .guide-article textarea').count(), 0, 'The note is copyable static text, not financial data submission');
      const note = page.locator('[aria-label="Copyable savings reconciliation note"]');
      assert.equal(await note.count(), 1);
      for (const field of ['Goal / currency:', 'Opening amount:', 'Difference and explanation:', 'Remaining uncertainty:']) assert((await note.innerText()).includes(field));
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), expectedRelated);
      await collectLinks(page, route);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      assert.deepEqual(await context.cookies(), [], 'Reading worked records creates no cookies');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (qaDir && javaScriptEnabled) {
        // Component crops can auto-scroll under the sticky header. Hide that
        // overlay only during capture; normal header/anchor behavior is tested above.
        const cropOptions = { animations: 'disabled', style: '.site-header { visibility: hidden !important; }' };
        await flow.screenshot({ ...cropOptions, path: resolve(qaDir, 'savings-reconciliation-flow-' + width + '.png') });
        await page.locator('#step-2').screenshot({ ...cropOptions, path: resolve(qaDir, 'savings-reconciliation-records-' + width + '.png') });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'savings-reconciliation-top-' + width + '.png') });
      }
      assert.equal((await page.goto(base + incomingRoute)).status(), 200);
      const monthlySection = page.locator('.guide-article > section').filter({ has: page.getByRole('heading', { name: 'Do a short monthly reconciliation', exact: true }) });
      assert.equal(await monthlySection.count(), 1);
      assert(await monthlySection.locator('a[href="' + route + '"]').count() > 0, 'The existing monthly review has the contextual incoming link');
      await collectLinks(page, incomingRoute);
      await context.close();
    }
    const fallback = await contextFor(390, false);
    const fallbackPage = await fallback.newPage();
    assert.equal((await fallbackPage.goto(base + route)).status(), 200);
    await checkPhoto(fallbackPage, true);
    await fallback.close();
    const links = await browser.newContext();
    for (const [path, fragments] of localTargets) {
      assert.equal((await links.request.head(base + path)).status(), 200, 'Local HEAD target: ' + path);
      if (fragments.size) {
        const response = await links.request.get(base + path);
        assert.equal(response.status(), 200);
        const html = await response.text();
        for (const fragment of fragments) assert.match(html, new RegExp('\\bid=["\']' + escapeRegex(fragment) + '["\']'), 'Local fragment: ' + path + '#' + fragment);
      }
    }
    await links.close();
    assert.deepEqual(failures, []);
    console.log('PASS: savings reconciliation guide across ' + visits + ' mobile/desktop JS/no-JS visits; native record flow, three keyboard tables, six native FAQs, canonical/date/image metadata, real Frugal screenshot/stores/attribution, responsive/JPEG photo, contextual incoming link and ' + localTargets.size + ' local targets, without new cookies/storage/submission. Website QA does not access or verify financial accounts.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
