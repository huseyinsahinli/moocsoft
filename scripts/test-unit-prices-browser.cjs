// Isolated development-only QA: fictional website arithmetic, not a shopping app.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4214').replace(/\/$/, '');
const origin = new URL(base).origin;
const slug = 'compare-unit-prices';
const route = '/guides/' + slug + '/';
const incomingRoute = '/guides/mental-math-games-for-adults/';
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
  }, 'Native focus scrolling settles before activation');
  assert(await locator.evaluate(node => node === document.activeElement));
}

(async () => {
  const [{ guides }, { editorialPhotos }, { createRelatedGuideSelector }, { guideHref }, { packComparison, unitPricePractice }] = await Promise.all([
    load('index.mjs'), load('editorial-media.mjs'), load('related-guides.mjs'), load('topics.mjs'), load('math-unit-prices.mjs'),
  ]);
  const guide = guides.find(item => item.slug === slug);
  assert(guide && guide.topic === 'math' && guide.published === '2026-10-23');
  assert.equal(guide.appPreview, true);
  assert.equal(guide.showToolAction, false);
  const expectedRelated = createRelatedGuideSelector(guides)(guide).map(guideHref);
  assert.equal(expectedRelated.length, 3);
  assert.equal(new Set(expectedRelated).size, 3);
  assert.deepEqual(expectedRelated, ['/guides/compare-fractions-without-decimals/', '/guides/mental-multiplication-tricks/', '/guides/mental-math-games-for-adults/']);
  assert.equal(packComparison.length, 3);
  assert.equal(unitPricePractice.length, 6);
  for (const row of packComparison) assert.equal(row.priceCents * 100 / (row.packs * row.gramsPerPack), row.centsPer100g);
  const quantity = option => option.quantity || option.packs * option.quantityPerPack;
  for (const row of unitPricePractice) {
    // Integer cross-products identify the lower original ratio, even when both
    // displayed rates round to the same number in the final exercise.
    const left = row.a.priceCents * quantity(row.b);
    const right = row.b.priceCents * quantity(row.a);
    assert.notEqual(left, right);
    assert.equal(row.lower, left < right ? 'A' : 'B');
  }
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep screenshots outside public files');
    mkdirSync(qaDir, { recursive: true });
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [], localTargets = new Map();
  const expectedRates = { A: .64, B: .60, C: .65 };
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
    assert.equal(await figure.count(), 1, 'One representative article photo');
    const image = figure.locator('img[data-visual-kind="photo"]');
    assert.equal(await image.count(), 1);
    assert.equal(await image.getAttribute('src'), editorialPhotos.math.src);
    assert.equal(await image.getAttribute('alt'), editorialPhotos.math.alt);
    assert.equal(await image.getAttribute('width'), '1200');
    assert.equal(await image.getAttribute('height'), '675');
    assert.equal(await image.getAttribute('loading'), 'lazy');
    assert.match(await figure.locator('figcaption').innerText(), /AI.generated/i);
    const source = figure.locator('source[type="image/webp"]');
    assert.equal(await source.count(), 1);
    assert.match(await source.getAttribute('srcset'), /480w.*800w.*1200w/);
    assert.match(await source.getAttribute('sizes'), /100vw/);
    await image.scrollIntoViewIfNeeded();
    if (fallback) {
      // Removing the preferred source exercises native img fallback; failing a
      // WebP request alone does not make a browser select another picture type.
      await source.evaluate(node => node.remove());
      await eventually(() => image.evaluate(node => Boolean(node.currentSrc) && new URL(node.currentSrc, document.baseURI).pathname === node.getAttribute('src')), 'Native photo fallback selected');
    }
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0));
    const chosen = new URL(await image.evaluate(node => node.currentSrc)).pathname;
    assert(fallback ? chosen === editorialPhotos.math.src : editorialPhotos.math.webp.some(variant => variant.src === chosen));
    const box = await image.boundingBox();
    assert(box && box.width > 0 && box.height > 0 && Math.abs(box.width / box.height - 16 / 9) < .01);
  }
  try {
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) {
      const context = await contextFor(width, javaScriptEnabled);
      const page = await context.newPage();
      assert.equal((await page.goto(base + route)).status(), 200);
      visits++;
      assert.equal(await page.title(), 'How to Compare Unit Prices: Pack Sizes and Multipacks | Moocsoft');
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://moocsoft.net' + route);
      assert.equal(await page.locator('.guide-byline time').first().getAttribute('datetime'), '2026-10-23');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both verified Math Riddles stores at ' + placement);
        for (const link of await links.all()) {
          const url = new URL(await link.getAttribute('href'));
          assert.equal(await link.getAttribute('data-app'), 'math-riddles');
          assert(await link.isVisible());
          if (url.hostname === 'apps.apple.com') {
            assert.match(url.pathname, /id6449851642$/);
            assert.equal(url.search, '');
          } else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.math_puzzle');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_medium'), 'referral');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
            assert.deepEqual([...url.searchParams.keys()].sort(), ['id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].sort(), 'No private inputs in attribution');
          }
        }
      }
      const comparison = page.locator('#step-2 .guide-table');
      assert.equal(await comparison.count(), 1);
      assert.equal(await comparison.locator('tbody tr').count(), 3, 'Three packs in the main comparison');
      for (const table of await page.locator('.guide-article .guide-table').all()) {
        assert.equal(await table.getAttribute('tabindex'), '0');
        await focus(page, table);
        if (await table.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => table.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the table');
        }
      }
      const chart = page.locator('figure.unit-price-comparison');
      assert.equal(await chart.count(), 1);
      assert.equal(await chart.locator('img').count(), 0, 'Comparison is native HTML, not a fabricated product screen');
      assert.equal(await chart.locator('li[data-pack]').count(), 3);
      for (const [pack, rate] of Object.entries(expectedRates)) {
        const row = chart.locator('li[data-pack="' + pack + '"]');
        assert.equal(await row.count(), 1);
        assert.match(await row.innerText(), new RegExp('\\$' + rate.toFixed(2).replace('.', '\\.') + '\\s*(?:per|/)\\s*100\\s*g', 'i'), 'Bar has an explicit comparable rate');
        const track = row.locator('.unit-price-bar');
        const bar = track.locator('> span');
        assert.equal(await bar.count(), 1);
        const [trackBox, barBox] = await Promise.all([track.boundingBox(), bar.boundingBox()]);
        assert(trackBox && barBox && Math.abs(barBox.width / trackBox.width - rate) < .015, 'Bar uses the common $1 per 100 g scale for pack ' + pack);
      }
      assert.match(await chart.locator('figcaption').innerText(), /(?:fictional|invented|illustrative)/i);
      const practiceLink = page.locator('.guide-hero-actions a[href="#step-4"]').first();
      assert.equal(await practiceLink.count(), 1);
      await focus(page, practiceLink);
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-4');
      await eventually(() => page.evaluate(() => {
        const target = document.querySelector('#step-4').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }), 'Practice action lands below the sticky download header');
      const practice = page.locator('#step-4 details[data-unit-price-practice]');
      assert.equal(await practice.count(), 6);
      assert.deepEqual(await practice.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-unit-price-practice'))), ['1', '2', '3', '4', '5', '6']);
      for (let index = 0; index < unitPricePractice.length; index++) {
        const detail = practice.nth(index), fixture = unitPricePractice[index];
        assert.equal(await detail.getAttribute('open'), null, 'Answers begin closed');
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.notEqual(await detail.getAttribute('open'), null, 'Practice answer opens natively without a score script');
        assert(await detail.locator('p').first().isVisible());
        const answerText = await detail.locator('p').first().innerText();
        for (const option of [fixture.a, fixture.b]) {
          const rate = option.priceCents / 100 / quantity(option) * fixture.basis;
          assert(answerText.includes('$' + rate.toFixed(fixture.kind === 'rounding' ? 4 : 2)), 'Worked answer includes independently calculated rate for exercise ' + fixture.id);
        }
        if (fixture.singlePriceCents) {
          const singleRate = fixture.singlePriceCents / 100 / fixture.a.quantityPerPack * fixture.basis;
          assert(answerText.includes('$' + singleRate.toFixed(2)), 'Conditional offer retains the different single-pack price');
        }
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.equal(await detail.getAttribute('open'), null);
      }
      await checkPhoto(page);
      assert.equal(await page.locator('.guide-app-preview img').count(), 0, 'Feature preview does not invent a unit-pricing screenshot');
      assert.match(await page.locator('.guide-app-preview').innerText(), /Premium/);
      assert.equal(await page.locator('.guide-article form, .guide-article input').count(), 0, 'There is no shopping input or answer submission');
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), expectedRelated);
      await collectLinks(page, route);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (qaDir && javaScriptEnabled) {
        await page.locator('.guide-article > figure.guide-visual').screenshot({ path: resolve(qaDir, 'unit-prices-photo-' + width + '.png'), animations: 'disabled' });
        await chart.screenshot({ path: resolve(qaDir, 'unit-prices-comparison-' + width + '.png'), animations: 'disabled' });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'unit-prices-top-' + width + '.png') });
      }
      assert.equal((await page.goto(base + incomingRoute)).status(), 200);
      assert(await page.locator('.guide-article a[href="' + route + '"]').count() > 0, 'Existing mental-math guide provides a contextual incoming link');
      await context.close();
    }
    const fallback = await contextFor(390, false);
    const fallbackPage = await fallback.newPage();
    await fallbackPage.goto(base + route);
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
    console.log('PASS: unit-price guide across ' + visits + ' mobile/desktop JS/no-JS visits; native exercises, common-scale bars, keyboard tables/navigation, honest Math preview, responsive/fallback photo, verified stores/attribution, contextual incoming link and ' + localTargets.size + ' local targets, without new storage/transmission.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
