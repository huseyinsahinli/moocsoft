// Isolated, development-only QA. No browser dependency or QA image ships to visitors.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { mkdirSync, readFileSync } = require('node:fs');
const { resolve, relative, isAbsolute } = require('node:path');
const { pathToFileURL } = require('node:url');

const root = resolve(__dirname, '..');
const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4211').replace(/\/$/, '');
const origin = new URL(base).origin;
const qaDir = process.env.MOOCSOFT_QA_DIR ? resolve(process.env.MOOCSOFT_QA_DIR) : null;
const load = name => import(pathToFileURL(resolve(root, 'content', name)).href);
const normalized = value => String(value).replace(/\s+/g, ' ').trim();
const imageUrl = value => typeof value === 'string' ? value : value.url || value.contentUrl;
const xmlEscape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

async function eventually(check, message) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.fail(message);
}

(async () => {
  const [{ guides }, { apps, site, published }, { guideMedia }, { guideCharts }, { editorialPhotos, editorialPhotosDe }, { germanGuides }] = await Promise.all([
    load('index.mjs'), load('apps.mjs'), load('guide-media.mjs'), load('guide-charts.mjs'), load('editorial-media.mjs'), load('de-index.mjs'),
  ]);
  if (qaDir) {
    const distance = relative(root, qaDir);
    assert(distance && (distance.startsWith('..') || isAbsolute(distance)), 'Screenshots stay outside public files');
    mkdirSync(qaDir, { recursive: true });
  }
  const visualFor = guide => guideMedia[guide.slug] || guideCharts[guide.slug] || editorialPhotos[guide.topic];
  const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [];
  let visits = 0;
  async function contextFor(width, javaScriptEnabled, deviceScaleFactor) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, javaScriptEnabled, deviceScaleFactor, reducedMotion: 'reduce' });
    await context.route('https://fonts.googleapis.com/**', route => route.abort());
    await context.route('https://fonts.gstatic.com/**', route => route.abort());
    context.on('page', page => {
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base + '/') && response.status() >= 400) failures.push(response.status() + ' ' + response.url());
      });
      page.on('request', request => {
        const url = new URL(request.url());
        if (!['GET', 'HEAD'].includes(request.method())) failures.push('Unexpected method: ' + request.method());
        if (url.origin !== origin && !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) failures.push('Unexpected request: ' + request.url());
      });
    });
    return context;
  }
  async function verify(page, guide, visual, { german = false, allImages = false, fallback = false, screenshot = null } = {}) {
    const route = (german ? '/de/guides/' : '/guides/') + guide.slug + '/';
    assert(visual, 'Every guide has a representative visual: ' + route);
    assert.equal((await page.goto(base + route)).status(), 200, route);
    visits++;
    assert.equal(await page.locator('h1').count(), 1, route);
    assert.equal(await page.locator('html').getAttribute('lang'), german ? 'de' : 'en');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), site + route);
    const figure = page.locator('.guide-article > figure.guide-visual');
    assert.equal(await figure.count(), 1, 'One representative article visual: ' + route);
    const image = figure.locator('picture > img');
    assert.equal(await image.count(), 1);
    assert.equal(await image.getAttribute('src'), visual.src);
    assert.equal(await image.getAttribute('width'), '1200');
    assert.equal(await image.getAttribute('height'), '675');
    assert.equal(await image.getAttribute('alt'), visual.alt);
    assert.equal(normalized(await figure.locator('figcaption').innerText()), normalized(visual.caption));
    if (visual.kind === 'photo') {
      assert.equal(await image.getAttribute('data-visual-kind'), 'photo');
      assert.match(await figure.locator('figcaption').innerText(), german ? /KI.generiert/i : /AI.generated/i, 'Illustrative AI photo disclosure');
    }
    const source = figure.locator('source[type="image/webp"]');
    assert.equal(await source.count(), 1);
    for (const variant of visual.webp) assert((await source.getAttribute('srcset')).includes(variant.src + ' ' + variant.width + 'w'));
    assert.match(await source.getAttribute('sizes'), /100vw/);
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), site + visual.src);
    assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute('content'), site + visual.src);
    assert.equal(await page.locator('meta[property="og:image:alt"]').getAttribute('content'), visual.alt);
    assert.equal(await page.locator('meta[name="twitter:image:alt"]').getAttribute('content'), visual.alt);
    const graphs = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.flatMap(node => {
      const json = JSON.parse(node.textContent);
      return json['@graph'] || [json];
    }));
    const article = graphs.find(node => node['@type'] === 'Article');
    assert(article, 'Visible article retains Article metadata');
    assert.deepEqual((Array.isArray(article.image) ? article.image : [article.image]).map(imageUrl), [site + visual.src]);
    assert.equal(article.datePublished, guide.published || published, 'No artificial publication-date refresh');
    assert.equal(article.dateModified, guide.modified || guide.published || published, 'No artificial modification-date refresh');
    const sitemapEntry = [...sitemap.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map(match => match[1]).find(value => value.includes('<loc>' + xmlEscape(site + route) + '</loc>'));
    assert(sitemapEntry, 'Existing URL retained in sitemap: ' + route);
    assert(sitemapEntry.includes('<image:loc>' + xmlEscape(site + visual.src) + '</image:loc>'), 'Representative shown image is in image sitemap');
    const expectedStoreCount = apps[guide.topic] ? [apps[guide.topic].apple, apps[guide.topic].google].filter(Boolean).length : 0;
    assert.equal(await page.locator('.site-header .install-link').count(), expectedStoreCount, 'Correct app/service header retained');
    if (!expectedStoreCount) {
      assert.equal(await page.locator('.guide-download .install-link').count(), 0, 'Service guide has no fictional store target');
      assert(await page.locator('.guide-download a[href="/hire-flutter-developer/"]').count() > 0);
    }
    await image.scrollIntoViewIfNeeded();
    if (fallback) {
      // Exercise the native img fallback independently of WebP support. A failed
      // WebP request is not a browser signal to try another picture format.
      await source.evaluate(node => node.remove());
      await eventually(() => image.evaluate(node => Boolean(node.currentSrc) && new URL(node.currentSrc, document.baseURI).pathname === node.getAttribute('src')), 'Native fallback selected');
    }
    await image.evaluate(node => node.decode());
    assert(await image.evaluate(node => node.complete && node.naturalWidth > 0 && node.naturalHeight > 0), 'Visual decodes: ' + route);
    const chosen = new URL(await image.evaluate(node => node.currentSrc)).pathname;
    assert(fallback ? chosen === visual.src : visual.webp.some(variant => variant.src === chosen), 'Expected responsive or native fallback asset: ' + chosen);
    const bounds = await image.boundingBox();
    assert(bounds && bounds.width > 0 && bounds.height > 0);
    assert(Math.abs(bounds.width / bounds.height - 16 / 9) < 0.01, 'No image distortion');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No horizontal page overflow: ' + route);
    if (allImages) {
      for (const localImage of await page.locator('img').all()) {
        await localImage.scrollIntoViewIfNeeded();
        await localImage.evaluate(node => node.decode());
        assert(await localImage.evaluate(node => node.complete && node.naturalWidth > 0), 'Every existing app/logo image still decodes: ' + route);
      }
    }
    if (screenshot) await figure.screenshot({ path: resolve(qaDir, screenshot), animations: 'disabled' });
  }
  try {
    const sweep = await contextFor(390, true, 1);
    const sweepPage = await sweep.newPage();
    for (const guide of guides) await verify(sweepPage, guide, visualFor(guide), { allImages: true });
    for (const guide of germanGuides) await verify(sweepPage, guide, editorialPhotosDe[guide.topic], { german: true, allImages: true });
    await sweep.close();
    console.log('PASS: every English and current German guide loads its representative image and keeps metadata, dates, sitemap and app/service boundaries.');

    const photoSamples = Object.keys(editorialPhotos).map(topic => guides.find(guide => guide.topic === topic && !guideMedia[guide.slug] && !guideCharts[guide.slug]));
    assert(photoSamples.every(Boolean), 'A topic photo is actually used in every topic');
    const chartSamples = Object.keys(guideCharts).map(slug => guides.find(guide => guide.slug === slug));
    assert(chartSamples.every(Boolean), 'All chart samples map to real guides');
    const samples = [...photoSamples, ...chartSamples];
    for (const width of [390, 1280]) for (const javaScriptEnabled of [true, false]) for (const dpr of [1, 2]) {
      const context = await contextFor(width, javaScriptEnabled, dpr);
      const page = await context.newPage();
      for (const guide of samples) await verify(page, guide, visualFor(guide), {
        screenshot: qaDir && javaScriptEnabled && dpr === 1 ? 'visual-' + guide.topic + '-' + guide.slug + '-' + width + '.png' : null,
      });
      await context.close();
      console.log('PASS: topic photos and all exact charts, width=' + width + ', JavaScript=' + javaScriptEnabled + ', DPR=' + dpr + '.');
    }
    const enlarge = await contextFor(390, false, 1);
    const chartPage = await enlarge.newPage();
    await verify(chartPage, chartSamples[0], visualFor(chartSamples[0]));
    const fullSizeLink = chartPage.locator('.guide-visual-open a');
    await fullSizeLink.scrollIntoViewIfNeeded();
    await fullSizeLink.focus();
    assert(await fullSizeLink.evaluate(node => node === document.activeElement));
    const tapTarget = await fullSizeLink.boundingBox();
    assert(tapTarget && tapTarget.height >= 44, 'Full-size chart link has a touch-sized target');
    const popupPromise = enlarge.waitForEvent('page');
    await chartPage.keyboard.press('Enter');
    const popup = await popupPromise;
    await popup.waitForLoadState();
    assert.equal(new URL(popup.url()).pathname, visualFor(chartSamples[0]).src);
    await popup.locator('img').evaluate(node => node.decode());
    assert.deepEqual(await popup.locator('img').evaluate(node => [node.naturalWidth, node.naturalHeight]), [1200, 675]);
    await enlarge.close();
    const fallback = await contextFor(390, false, 1);
    const fallbackPage = await fallback.newPage();
    for (const guide of [...photoSamples, chartSamples[0], guides.find(guide => guideMedia[guide.slug])].filter(Boolean)) {
      await verify(fallbackPage, guide, visualFor(guide), { fallback: true });
    }
    await fallback.close();
    assert.deepEqual(failures, []);
    console.log('PASS: native JPEG/PNG fallback, no new remote requests or submission methods; ' + visits + ' isolated article visits.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
