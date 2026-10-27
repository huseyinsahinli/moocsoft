// Isolated, development-only website QA; not a food measurement or mobile app test.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4217').replace(/\/$/, '');
const origin = new URL(base).origin;
const slug = 'kj-to-kcal-food-labels';
const route = '/guides/' + slug + '/';
const incomingRoute = '/guides/calories-per-serving-vs-per-container/';
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
  assert.equal(article.articleSection, 'Nutrition');
  if (image) assert.deepEqual(article.image, ['https://moocsoft.net' + image]);
  assert.equal(graph.find(node => node['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, 'https://moocsoft.net' + path);
}

(async () => {
  const [{ default: newGuides, energyConversions, energyExercises }, { editorialPhotos }, { appPreviews }] = await Promise.all([
    load('nutrition-energy-units.mjs'), load('editorial-media.mjs'), load('app-previews.mjs'),
  ]);
  assert.equal(newGuides.length, 1);
  const guide = newGuides[0], photo = editorialPhotos.nutrition;
  assert.equal(guide.slug, slug);
  assert.equal(guide.title, 'kJ to kcal: How to Convert Food Energy on a Label');
  assert.equal(guide.topic, 'nutrition');
  assert.equal(guide.published, '2026-10-27');
  assert.equal(guide.modified, undefined);
  assert.equal(guide.appPreview, true);
  assert.equal(guide.showToolAction, false);
  assert.deepEqual([energyConversions.length, energyExercises.length, guide.faq.length], [6, 6, 6]);
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Evidence stays outside the public site');
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
  async function checkPreview(page) {
    const block = page.locator('.guide-app-preview');
    assert.equal(await block.count(), 1);
    assert.equal(await block.locator('h2').innerText(), guide.previewCopy.heading);
    assert((await block.innerText()).includes(guide.previewCopy.description));
    const image = block.locator('img');
    assert.equal(await image.count(), 1);
    assert.equal(await image.getAttribute('src'), appPreviews.nutrition.image);
    assert.equal(await image.getAttribute('src'), '/assets/apps/nutrilens/screenshot-2.jpg');
    assert.equal(await image.getAttribute('alt'), appPreviews.nutrition.alt);
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth === 554 && node.naturalHeight === 1200));
    assert.match(await block.locator('figcaption').innerText(), /Store screenshot.*Premium.*estimates are not measurements/i);
    assert.match(await block.innerText(), /subscriptions and scan credit packs.*Premium/s);
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
      assert.equal(await page.locator('.guide-byline time').count(), 1);
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-27');
      await articleSchema(page, guide.title, route, '2026-10-27', photo.src);
      for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) assert.equal(await page.locator(selector).getAttribute('content'), 'https://moocsoft.net' + photo.src);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow');
      assert.equal(await page.locator('.app-install').getAttribute('aria-label'), 'Download NutriLens');
      for (const placement of ['header', 'article-end', 'guide-preview']) {
        const links = page.locator('a.install-link[data-placement="' + placement + '"]');
        assert.equal(await links.count(), 2, 'Both matching app stores at ' + placement);
        for (const link of await links.all()) {
          const url = new URL(await link.getAttribute('href'));
          assert.equal(await link.getAttribute('data-app'), 'nutrilens');
          assert(await link.isVisible());
          if (url.hostname === 'apps.apple.com') {
            assert.match(url.pathname, /id6755138291$/);
            assert.equal(url.search, '');
          } else {
            assert.equal(url.hostname, 'play.google.com');
            assert.equal(url.searchParams.get('id'), 'com.moocsoft.food_scan_ai');
            assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
            assert.equal(url.searchParams.get('utm_medium'), 'referral');
            assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + slug);
            assert.equal(url.searchParams.get('utm_content'), placement);
            assert.deepEqual([...url.searchParams.keys()].sort(), ['id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].sort());
          }
        }
      }
      assert.equal(await page.locator('.guide-hero > .guide-hero-actions a[href^="/tools/"]').count(), 0);
      const flow = page.locator('figure.energy-unit-directions');
      assert.equal(await flow.count(), 1);
      assert.equal(await flow.locator('img, svg, canvas').count(), 0, 'Conversion diagram is native HTML, not a fake screen');
      assert.deepEqual(await flow.locator('[data-energy-direction]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-energy-direction'))), ['kj-to-kcal', 'kcal-to-kj']);
      const directions = { 'kj-to-kcal': ['kJ → kcal', 'Divide by 4.184', '1,046 kJ ÷ 4.184 = 250 kcal'], 'kcal-to-kj': ['kcal → kJ', 'Multiply by 4.184', '250 kcal × 4.184 = 1,046 kJ'] };
      for (const [key, expected] of Object.entries(directions)) {
        const card = flow.locator('[data-energy-direction="' + key + '"]');
        assert.deepEqual(await card.locator('span, strong, p').allTextContents(), expected);
        const box = await card.boundingBox();
        assert(box && box.width > 0 && box.height > 0);
        assert(await card.evaluate(node => node.scrollWidth <= node.clientWidth + 1));
      }
      assert.match(await flow.locator('figcaption').innerText(), /not a food label, app screenshot or nutrition measurement/);
      const tables = page.locator('.guide-article .guide-table');
      assert.equal(await tables.count(), 2);
      assert.deepEqual(await tables.nth(0).locator('tbody tr').evaluateAll(nodes => nodes.map(node => [...node.querySelectorAll('th[scope="row"], td')].map(cell => cell.textContent))), energyConversions.map(item => [item.kj.toLocaleString('en-US') + ' kJ', item.kj.toLocaleString('en-US') + ' ÷ 4.184', item.kcal + ' kcal']));
      assert.equal(await tables.nth(1).locator('tbody tr').count(), 5);
      assert.deepEqual(await tables.nth(1).locator('tbody th[scope="row"]').allTextContents(), ['Energy unit', 'Reference quantity', 'Quantity unit', 'Food and preparation', 'Uncertainty']);
      for (const wrapper of await tables.all()) {
        assert.equal(await wrapper.getAttribute('tabindex'), '0');
        assert((await wrapper.locator('caption').innerText()).trim().length > 10);
        await focus(page, wrapper);
        if (await wrapper.evaluate(node => node.scrollWidth > node.clientWidth)) {
          await page.keyboard.press('ArrowRight');
          await eventually(() => wrapper.evaluate(node => node.scrollLeft > 0), 'Keyboard scrolls the focused table');
        }
      }
      const exercises = page.locator('.energy-unit-exercise');
      assert.equal(await exercises.count(), 6);
      for (const [index, item] of energyExercises.entries()) {
        const block = exercises.nth(index), detail = block.locator('details');
        assert.equal(await block.getAttribute('id'), item.id);
        assert.equal(await block.locator('h3').innerText(), item.title);
        assert.equal(await block.locator(':scope > p').innerText(), item.question);
        assert.equal(await detail.getAttribute('open'), null);
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.notEqual(await detail.getAttribute('open'), null, 'Worked answer opens natively without JavaScript');
        assert.equal(await detail.locator('.guide-formula').innerText(), item.calculation);
        assert.equal(await detail.locator('strong').innerText(), item.answer);
        assert((await detail.innerText()).includes(item.explanation));
        assert(await detail.locator('p').first().isVisible());
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.equal(await detail.getAttribute('open'), null);
      }
      const toc = page.locator('.guide-toc-menu');
      if (await toc.getAttribute('open') === null) { await focus(page, toc.locator('summary')); await page.keyboard.press('Enter'); }
      await focus(page, toc.locator('a[href="#step-2"]'));
      await page.keyboard.press('Enter');
      assert.equal(new URL(page.url()).hash, '#step-2');
      await eventually(() => page.evaluate(() => {
        const target = document.querySelector('#step-2').getBoundingClientRect();
        return target.top >= document.querySelector('.site-header').getBoundingClientRect().bottom - 1 && target.top < innerHeight;
      }), 'Section link lands below the sticky store header');
      const faq = page.locator('#questions details');
      assert.equal(await faq.count(), 6);
      for (const [index, detail] of (await faq.all()).entries()) {
        assert.equal(await detail.getAttribute('open'), null);
        assert.equal(await detail.locator('summary').innerText(), guide.faq[index][0]);
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.notEqual(await detail.getAttribute('open'), null);
        assert.equal(await detail.locator('p').innerText(), guide.faq[index][1]);
        assert(await detail.locator('p').isVisible());
        await focus(page, detail.locator('summary'));
        await page.keyboard.press('Enter');
        assert.equal(await detail.getAttribute('open'), null);
      }
      await checkPhoto(page);
      await checkPreview(page);
      assert.deepEqual(await page.locator('section[aria-label="Suggested next reads"] .guide-card').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), ['/guides/calories-per-serving-vs-per-container/', '/guides/calories-vs-macros/', '/guides/estimate-calories-from-food-photo/']);
      assert.equal(await page.locator('.guide-article form, .guide-article input, .guide-article textarea').count(), 0);
      await collectLinks(page, route);
      if (javaScriptEnabled) assert.deepEqual(await page.evaluate(() => [localStorage.length, sessionStorage.length]), [0, 0]);
      assert.deepEqual(await context.cookies(), []);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      if (qaDir && javaScriptEnabled) {
        // Sticky overlay is hidden only for the component capture, not navigation tests.
        await flow.screenshot({ animations: 'disabled', style: '.site-header { visibility: hidden !important; }', path: resolve(qaDir, 'energy-units-flow-' + width + '.png') });
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: resolve(qaDir, 'energy-units-top-' + width + '.png') });
      }
      assert.equal((await page.goto(base + incomingRoute)).status(), 200);
      assert(await page.locator('#step-4 a[href="' + route + '"]').count() > 0, 'Existing unit warning links the new conversion explanation');
      assert.equal(await page.locator('.guide-byline time').count(), 1);
      assert.equal(await page.locator('.guide-byline time').getAttribute('datetime'), '2026-10-12');
      await articleSchema(page, 'Calories Per Serving vs Per Container: Read the Label', incomingRoute, '2026-10-12');
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
    console.log('PASS: energy-unit guide across ' + visits + ' mobile/desktop JS/no-JS visits; native bidirectional diagram, two keyboard tables (6/5 rows), six worked answers and six FAQs, original dates/image metadata, real NutriLens stores/preview/attribution, responsive/JPEG photo and ' + localTargets.size + ' local targets without new cookies/storage/submissions. Website QA does not measure nutrition or test an app converter.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
