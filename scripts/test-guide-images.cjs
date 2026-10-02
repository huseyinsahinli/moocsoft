// Local responsive-image regression; requires built assets/guides, a static server and development-only Playwright.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync } = require('node:fs');
const { resolve, relative, isAbsolute, sep } = require('node:path');
const { pathToFileURL } = require('node:url');

const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4196').replace(/\/$/, '');
const root = resolve(__dirname, '..');
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const readable = text => text.replace(/\s+/g, ' ').trim();
const canonicalStore = value => {
  const url = new URL(value);
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('utm_')) url.searchParams.delete(key);
  return url.href;
};
const errors = [];

const fonts = async context => {
  await context.route('https://fonts.googleapis.com/**', route => route.abort());
  await context.route('https://fonts.gstatic.com/**', route => route.abort());
};
const watch = (page, label) => {
  page.on('pageerror', error => errors.push(`${label}: ${error.message}`));
  page.on('response', response => {
    if (response.url().startsWith(base + '/') && response.status() >= 400) errors.push(`${label}: ${response.status()} ${response.url()}`);
  });
};
const visit = async (page, slug, width) => {
  const response = await page.goto(`${base}/guides/${slug}/`);
  assert(response && response.status() === 200, `Guide returns 200: ${slug}`);
  await page.waitForLoadState('networkidle');
  assert.equal(await page.locator('h1').count(), 1, `One main heading: ${slug}`);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No horizontal overflow: ${slug} at ${width}px`);
};
const decode = async image => {
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(element => element.decode());
  const result = await image.evaluate(element => ({
    currentSrc: element.currentSrc,
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
    width: element.getAttribute('width'),
    height: element.getAttribute('height'),
  }));
  assert.deepEqual([result.width, result.height], ['1200', '675'], 'PNG fallback dimensions reserve the diagram aspect ratio');
  assert(result.naturalWidth > 0 && result.naturalHeight > 0 && Math.abs(result.naturalHeight - result.naturalWidth * 9 / 16) <= 1, 'Selected image decodes at 16:9, including density-corrected intrinsic dimensions');
  return result;
};

(async () => {
  if (qaDir) {
    const location = relative(root, qaDir);
    assert(location && (location === '..' || location.startsWith('..' + sep) || isAbsolute(location)), 'Screenshots must stay outside the published repository');
    mkdirSync(qaDir, { recursive: true });
  }
  const [{ guideMedia }, { guides }, { apps, sources, site }] = await Promise.all([
    import(pathToFileURL(resolve(root, 'content/guide-media.mjs')).href),
    import(pathToFileURL(resolve(root, 'content/index.mjs')).href),
    import(pathToFileURL(resolve(root, 'content/apps.mjs')).href),
  ]);
  const entries = Object.entries(guideMedia);
  assert.equal(entries.length, 7, 'Seven existing guides have original responsive diagrams');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [390, 1280]) {
      for (const dpr of [1, 2]) {
        // Fresh contexts keep a previously cached large image from influencing candidate selection.
        const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: dpr, locale: 'en-US' });
        await fonts(context);
        const page = await context.newPage();
        watch(page, `${width}px DPR${dpr}`);
        const selections = [];
        try {
          for (const [slug, visual] of entries) {
            const guide = guides.find(item => item.slug === slug);
            const app = apps[guide.topic];
            await visit(page, slug, width);
            const stores = page.locator('.app-install .install-link');
            assert.deepEqual((await stores.evaluateAll(links => links.map(link => link.href))).map(canonicalStore).sort(), [app.apple, app.google].filter(Boolean).sort(), 'Header store links retain the matching app destinations');
            for (const link of await stores.all()) {
              assert(await link.isVisible(), `Top store link is visible: ${slug}`);
              const box = await link.boundingBox();
              assert(box && box.height >= 44 && box.width >= 44 && box.y >= 0 && box.y + box.height <= 900 && box.x >= 0 && box.x + box.width <= width + 1, 'Top store link is in view and at least 44px in both dimensions');
            }

            const figure = page.locator('article figure.guide-visual');
            assert.equal(await figure.count(), 1, `One visible article diagram: ${slug}`);
            const source = figure.locator('picture > source[type="image/webp"]');
            assert.equal(await source.count(), 1, 'Diagram has a WebP picture source');
            assert((await source.getAttribute('sizes'))?.trim(), 'Responsive source declares its layout sizes');
            const candidates = (await source.getAttribute('srcset')).split(',').map(value => value.trim().split(/\s+/));
            assert.deepEqual(candidates, visual.webp.map(variant => [variant.src, `${variant.width}w`]), 'Source offers the registered 480/800/1200 width variants');
            const image = figure.locator('picture > img');
            assert.equal(await image.getAttribute('src'), visual.src, 'Image retains the canonical PNG fallback');
            assert.equal(await image.getAttribute('loading'), 'lazy', 'Below-hero diagram stays lazy loaded');
            assert.equal(await image.getAttribute('alt'), visual.alt, 'Alt text matches the actual diagram registry');
            assert.equal(readable(await figure.locator('figcaption').innerText()), readable(visual.caption), 'Caption matches the diagram');
            const decoded = await decode(image);
            const selected = visual.webp.find(variant => variant.src === new URL(decoded.currentSrc).pathname);
            assert(selected, `Chrome selected a registered WebP image: ${decoded.currentSrc}`);
            const box = await image.boundingBox();
            assert(box && box.width > 0 && box.width <= width, 'Diagram fits its rendered column');
            const adequate = visual.webp.find(variant => variant.width >= box.width * dpr - 1) || visual.webp.at(-1);
            assert.equal(selected.width, adequate.width, `Closest adequate image for ${width}px DPR${dpr}: ${slug}`);
            selections.push(selected.width);

            assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), site + visual.src, 'Open Graph retains the 1200px PNG');
            assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute('content'), site + visual.src, 'Twitter retains the 1200px PNG');
            const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
            assert.deepEqual(graph.find(item => item['@type'] === 'Article').image, [site + visual.src], 'Article metadata retains the PNG search image');
            if (qaDir) await figure.screenshot({ path: resolve(qaDir, `${slug}-${width}-dpr${dpr}.png`) });

            // Removing only the source exercises a browser without WebP/picture selection.
            await source.evaluate(element => element.remove());
            await page.waitForFunction(expected => document.querySelector('article figure.guide-visual img').currentSrc === expected, base + visual.src);
            const fallback = await decode(image);
            assert.equal(new URL(fallback.currentSrc).pathname, visual.src, 'PNG fallback loads when the source is unavailable');
            // An existing img can retain the previous candidate's density correction.
            // A plain image confirms the PNG's decoded pixel dimensions independently.
            const pngPixels = await image.evaluate(async element => {
              const png = new Image();
              png.src = element.src;
              await png.decode();
              return [png.naturalWidth, png.naturalHeight];
            });
            assert.deepEqual(pngPixels, [1200, 675], 'PNG fallback decodes at full pixel dimensions');
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'PNG fallback does not introduce overflow');
          }
          assert.deepEqual(errors, [], 'No browser errors or failed local assets');
          console.log(`PASS ${width}px DPR${dpr}: seven WebP diagrams selected at ${[...new Set(selections)].join('/')}px, PNG fallbacks, metadata and top store links.`);
        } catch (error) {
          if (qaDir) await page.screenshot({ path: resolve(qaDir, `guide-images-failure-${width}-dpr${dpr}.png`), fullPage: true }).catch(() => {});
          throw error;
        } finally {
          await context.close();
        }
      }
    }

    const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 }, locale: 'en-US' });
    await fonts(nojs);
    const page = await nojs.newPage();
    watch(page, 'No JavaScript');
    try {
      for (const [slug, visual] of entries) {
        const guide = guides.find(item => item.slug === slug);
        await visit(page, slug, 390);
        assert.equal(readable(await page.locator('.guide-answer p').innerText()), readable(guide.takeaway), 'Original article takeaway is available without JavaScript');
        for (const [title] of guide.sections) assert(await page.locator('article').getByRole('heading', { name: title, exact: true }).isVisible(), `Original section remains readable without JavaScript: ${title}`);
        const figure = page.locator('article figure.guide-visual');
        assert.equal(readable(await figure.locator('figcaption').innerText()), readable(visual.caption), 'Diagram caption is readable without JavaScript');
        const image = figure.locator('picture > img');
        const decoded = await decode(image);
        assert(visual.webp.some(variant => variant.src === new URL(decoded.currentSrc).pathname), 'Static picture selects WebP without JavaScript');
        if (guide.sources.length) {
          const references = page.locator('#references');
          assert(await references.isVisible(), 'Original reference section remains visible without JavaScript');
          for (const key of guide.sources) {
            const [name, url] = sources[key];
            const link = references.locator('a').filter({ hasText: name });
            assert.equal(await link.getAttribute('href'), url, 'Original reference keeps its primary-source destination');
          }
        }
      }
      assert.deepEqual(errors, [], 'No browser errors or failed local assets');
    } finally {
      await nojs.close();
    }
    console.log('PASS without JavaScript: seven responsive figures, captions, original article sections and reference links.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
