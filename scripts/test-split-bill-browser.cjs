// Isolated development-only website QA, not restaurant, payment or mobile app testing.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4218').replace(/\/$/, '');
const origin = new URL(base).origin;
const slug = 'split-restaurant-bill';
const route = '/guides/' + slug + '/';
const incomingRoute = '/guides/compare-unit-prices/';
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
async function articleSchema(page, title, path, date, image) {
  const graph = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => {
    const value = JSON.parse(node.textContent);
    return value['@graph'] || value;
  }));
  const article = graph.find(node => node['@type'] === 'Article');
  assert(article);
  assert.equal(article.headline, title);
  assert.equal(article.url, 'https://moocsoft.net' + path);
  assert.equal(article.datePublished, date);
  assert.equal(article.dateModified, date);
  assert.equal(article.inLanguage, 'en');
  assert.equal(article.articleSection, 'Math puzzles');
  if (image) assert.deepEqual(article.image, ['https://moocsoft.net' + image]);
  assert.equal(graph.find(node => node['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, 'https://moocsoft.net' + path);
}

(async () => {
  const [{ default: newGuides, billItems, equalBillShares, itemizedBillShares }, { editorialPhotos }, { appPreviews }] = await Promise.all([
    load('math-split-bill.mjs'), load('editorial-media.mjs'), load('app-previews.mjs'),
  ]);
  assert.equal(newGuides.length, 1);
  const guide = newGuides[0], photo = editorialPhotos.math;
  assert.equal(guide.slug, slug);
  assert.equal(guide.title, 'How to Split a Restaurant Bill: Equal or Itemized?');
  assert.equal(guide.topic, 'math');
  assert.equal(guide.published, '2026-10-28');
  assert.equal(guide.modified, undefined);
  assert.equal(guide.editorialFormat, 'story');
  assert.equal(guide.appPreview, true);
  assert.equal(guide.showToolAction, false);
  assert.deepEqual([billItems.length, equalBillShares.length, itemizedBillShares.length, guide.faq.length], [4, 3, 3, 6]);
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Keep screenshots outside the public site');
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
      page.on('dialog', async dialog => { failures.push('Unexpected dialog: ' + dialog.type()); await dialog.dismiss(); });
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
  async function collectLinks(page, path) {
    for (const href of await page.locator('a[href]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))) {
      if ((!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) continue;
      const url = new URL(href, base + path);
      if (!localTargets.has(url.pathname)) localTargets.set(url.pathname, new Set());
      if (url.hash) localTargets.get(url.pathname).add(decodeURIComponent(url.hash.slice(1)));
    }
  }
  async function checkPhoto(page, fallback = false) {
    const figure = page.locator('.guide-article > figure.guide-visual');
    assert.equal(await figure.count(), 1);
    assert.equal(await figure.evaluate(node => node.previousElementSibling.id), 'step-1');
    const image = figure.locator('img[data-visual-kind="photo"]');
    assert.equal(await image.count(), 1);
    assert.equal(await image.getAttribute('src'), photo.src);
    assert.equal(await image.getAttribute('alt'), photo.alt);
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
      // Native picture fallback selection; no remote image or fabricated app UI.
      await source.evaluate(node => node.remove());
      await eventually(() => image.evaluate(node => Boolean(node.currentSrc) && new URL(node.currentSrc, document.baseURI).pathname === node.getAttribute('src')), 'Native JPEG fallback selected');
    }
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0));
    const chosen = new URL(await image.evaluate(node => node.currentSrc)).pathname;
    assert(fallback ? chosen === photo.src : photo.webp.some(variant => variant.src === chosen));
    const box = await image.boundingBox();
    assert(box && box.width > 0 && box.height > 0 && Math.abs(box.width / box.height - 16 / 9) < .01);
  }
  async function nativeDisclosure(page, detail, expectedParts) {
    assert.equal(await detail.getAttribute('open'), null, 'Native disclosure begins closed');
    await focus(page, detail.locator('summary'));
    await page.keyboard.press('Enter');
    assert.notEqual(await detail.getAttribute('open'), null, 'Native answer opens, also without JavaScript');
    assert(await detail.locator('p').first().isVisible());
    const text = await detail.innerText();
    for (const expected of expectedParts) assert(text.includes(expected), expected);
    await focus(page, detail.locator('summary'));
    await page.keyboard.press('Enter');
    assert.equal(await detail.getAttribute('open'), null);
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
      assert.match(await page.locator('.guide-hero > .guide-kicker').innerText(), /Math puzzles · Fictional story/i);
      assert.equal(await page.locator('.guide-byline time').count(), 1);
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-28');
      await articleSchema(page, guide.title, route, '2026-10-28', photo.src);
      for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) assert.equal(await page.locator(selector).getAttribute('content'), 'https://moocsoft.net' + photo.src);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
      assert.equal(await page.locator('.app-install').getAttribute('aria-label'), 'Download Math Riddles');
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both matching Math Riddles stores at ' + placement);
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
            assert.deepEqual([...url.searchParams.keys()].sort(), ['id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].sort());
          }
        }
      }
      assert.equal(await page.locator('a.install-link:not([data-app="math-riddles"])').count(), 0, 'No other app is substituted');
      assert.equal(await page.locator('.guide-hero > .guide-hero-actions a[href^="/tools/"]').count(), 0);
      assert.equal(await page.locator('.guide-hero > .guide-hero-actions a[href="#app-preview-title"]').innerText(), 'See app features and access ↓');
      const preview = page.locator('.guide-app-preview');
      assert.equal(await preview.count(), 1);
      assert.equal(await preview.locator('h2').innerText(), guide.previewCopy.heading);
      assert((await preview.innerText()).includes(guide.previewCopy.description));
      assert.equal(await preview.locator('img, svg, canvas, figure').count(), 0, 'Feature preview does not invent a receipt or app screenshot');
      assert((await preview.locator('.guide-preview-note').innerText()).includes(appPreviews.math.note));
      assert.match(await preview.innerText(), /Premium/);
      assert.match(await preview.innerText(), /not an app bill-splitting, receipt-reading or payment feature/);

      const flow = page.locator('figure.bill-split-flow');
      assert.equal(await flow.count(), 1);
      assert.equal(await flow.locator('img, svg, canvas').count(), 0, 'Native bill flow is not a fabricated receipt');
      assert.deepEqual(await flow.locator('li[data-bill-step]').evaluateAll(nodes => nodes.map(node => [node.getAttribute('data-bill-step'), node.querySelector('span').textContent, node.querySelector('strong').textContent])), [
        ['items', 'Items, including shared food', '$55.75'],
        ['tax', 'Add assumed 8% tax on $55.75', '+$4.46'],
        ['tip', 'Add chosen 20% tip on $55.75', '+$11.15'],
        ['total', 'Total to allocate', '$71.36'],
      ]);
      for (const card of await flow.locator('li[data-bill-step]').all()) {
        const box = await card.boundingBox();
        assert(box && box.width > 0 && box.height > 0);
        assert(await card.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
      }
      assert.match(await flow.locator('figcaption').innerText(), /not a restaurant receipt, payment confirmation or app screen/);
      assert.match(await flow.locator('figcaption').innerText(), /not a statement of local tax law or a tipping recommendation/);
      const tables = page.locator('.guide-article .guide-table');
      assert.equal(await tables.count(), 3);
      const expectedRows = [billItems, equalBillShares, itemizedBillShares];
      for (const [index, rows] of expectedRows.entries()) {
        const wrapper = tables.nth(index);
        assert.equal(await wrapper.getAttribute('tabindex'), '0');
        assert((await wrapper.locator('caption').innerText()).trim().length > 10);
        assert.deepEqual(await wrapper.locator('tbody tr').evaluateAll(nodes => nodes.map(node => [...node.querySelectorAll('th[scope="row"], td')].map(cell => cell.textContent))), rows);
        await focus(page, wrapper);
        if (await wrapper.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => wrapper.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the focused table');
        }
      }
      assert.equal(await page.locator('details.bill-split-check').count(), 2);
      await nativeDisclosure(page, page.locator('#equal-rounding-check'), ['$71.37', '$71.34', '$71.36']);
      await nativeDisclosure(page, page.locator('#tip-base-check'), ['$60.21', '$12.042', '$12.04', '$72.25', 'not a recommendation']);
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) { await focus(page, toc.locator('summary')); await page.keyboard.press('Enter'); }
      await focus(page, toc.locator('a[href="#step-3"]'));
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-3');
      await eventually(() => page.evaluate(() => {
        const target = document.querySelector('#step-3').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }), 'Section link lands below the sticky store header');
      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 6);
      for (const [index, detail] of (await faq.all()).entries()) {
        assert.equal(await detail.locator('summary').innerText(), guide.faq[index][0]);
        await nativeDisclosure(page, detail, [guide.faq[index][1]]);
      }
      await checkPhoto(page);
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), ['/guides/mental-multiplication-tricks/', '/guides/compare-fractions-without-decimals/', '/guides/compare-unit-prices/']);
      assert.match(await page.locator('#step-1').innerText(), /fictional worked story/);
      assert.match(await page.locator('#step-6').innerText(), /not an app level, receipt scanner, bill calculator or payment feature/);
      assert.equal(await page.locator('.guide-article form, .guide-article input, .guide-article textarea').count(), 0);
      await collectLinks(page, route);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      assert.deepEqual(await context.cookies(), []);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (qaDir && javaScriptEnabled) {
        // Hide the sticky overlay only for component captures, not navigation checks.
        await flow.screenshot({ animations: 'disabled', style: '.site-header { visibility: hidden !important; }', path: resolve(qaDir, 'split-bill-flow-' + width + '.png') });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'split-bill-top-' + width + '.png') });
      }
      assert.equal((await page.goto(base + incomingRoute)).status(), 200);
      assert(await page.locator('#step-5 a[href="' + route + '"]').count() > 0, 'Unit-price guide supplies the contextual incoming link');
      assert.equal(await page.locator('.guide-byline time').count(), 1);
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-23');
      await articleSchema(page, 'How to Compare Unit Prices: Pack Sizes and Multipacks', incomingRoute, '2026-10-23');
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
    console.log('PASS: split-bill story across ' + visits + ' mobile/desktop JS/no-JS visits; native four-step flow, exact 4/3/3 keyboard-table rows, two worked disclosures and six FAQs, dated story metadata, real Math Riddles stores/feature-access preview/attribution, responsive/JPEG photo and ' + localTargets.size + ' local targets without new storage/cookies/submissions. Website QA does not verify payments, tax rules or an app bill-splitting feature.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
