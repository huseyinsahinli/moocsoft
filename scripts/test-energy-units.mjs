// Educational unit arithmetic and generated website checks, not nutrition or app accuracy tests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import energyGuides, { energyConversions, energyExercises } from '../content/nutrition-energy-units.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, escape } from '../content/apps.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = energyGuides;
const route = '/guides/kj-to-kcal-food-labels/';
assert.equal(energyGuides.length, 1);
assert.equal(guide.slug, 'kj-to-kcal-food-labels');
assert.equal(guide.topic, 'nutrition');
assert.equal(guide.published, '2026-10-27');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false, 'Daily-target calculator does not convert a product label');
assert.deepEqual(guide.startAction, ['#step-2', 'Use the kJ-to-kcal conversion table ↓']);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);
assert.deepEqual(guides.filter(item => item.published === '2026-10-27').map(item => item.slug), [guide.slug]);

// Exact independent rational arithmetic: 4.184 = 523/125. No float division or
// production conversion/formatting helper determines the expected hundredths.
const fixed2 = (numerator, denominator) => {
  assert(numerator >= 0n && denominator > 0n);
  const cents = (2n * numerator * 100n + denominator) / (2n * denominator);
  return `${cents / 100n}.${(cents % 100n).toString().padStart(2, '0')}`;
};
assert.equal(4184n * 125n, 523n * 1000n);
const expectedConversions = [
  { kj: 100, kcal: '23.90' }, { kj: 250, kcal: '59.75' },
  { kj: 500, kcal: '119.50' }, { kj: 1000, kcal: '239.01' },
  { kj: 1500, kcal: '358.51' }, { kj: 2000, kcal: '478.01' },
];
assert.deepEqual(energyConversions, expectedConversions);
for (const row of expectedConversions) assert.equal(fixed2(BigInt(row.kj) * 125n, 523n), row.kcal);

const expectedCalculations = [
  ['energy-example-1', '1,000 ÷ 4.184 ≈ 239.01 kcal', 'About 239 kcal for that same portion.'],
  ['energy-example-2', '250 × 4.184 = 1,046 kJ', '1,046 kJ, not 250 ÷ 4.184.'],
  ['energy-example-3', '1,250 × (60 ÷ 100) = 750 kJ; 750 ÷ 4.184 ≈ 179.25 kcal', 'About 179 kcal for the 60 g amount.'],
  ['energy-example-4', '360 × (250 ÷ 100) = 900 kJ; 900 ÷ 4.184 ≈ 215.11 kcal', 'About 215 kcal for the 250 ml amount.'],
  ['energy-example-5', '(600 ÷ 4.184) + 150 ≈ 293.40 kcal', 'About 293 kcal for the two items together.'],
  ['energy-example-6', 'A: 1,250 ÷ 4.184 ≈ 298.76 kcal per 100 g; B: 280 kcal per 100 g', 'B has the lower stated energy per 100 g in this example.'],
];
assert.deepEqual(energyExercises.map(item => [item.id, item.calculation, item.answer]), expectedCalculations);
assert.equal(fixed2(1000n * 125n, 523n), '239.01');
assert.equal(250n * 523n / 125n, 1046n);
assert.equal(250n * 523n % 125n, 0n, 'Reverse example is an exact whole-kJ result');
assert.equal(1250n * 60n / 100n, 750n);
assert.equal(fixed2(1250n * 60n * 125n, 100n * 523n), '179.25');
assert.equal(fixed2(750n * 125n, 523n), '179.25');
assert.equal(360n * 250n / 100n, 900n);
assert.equal(fixed2(360n * 250n * 125n, 100n * 523n), '215.11');
assert.equal(fixed2(600n * 125n + 150n * 523n, 523n), '293.40');
assert.notEqual(fixed2(600n * 125n + 150n * 523n, 523n), '750.00', 'Do not sum bare numbers with unlike units');
assert.equal(fixed2(1250n * 125n, 523n), '298.76');
assert(1250n * 125n > 280n * 523n, 'B is lower per the matched 100 g basis');
assert.equal(fixed2(100n * 523n, 125n), '418.40');
assert.equal(fixed2(418n * 125n, 523n), '99.90', 'A rounded printed pair need not reproduce the displayed kcal exactly');
assert.equal(1046n * 125n, 250n * 523n, 'The diagram expresses the same energy in both directions');

const html = read(`guides/${guide.slug}/index.html`);
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(`<title>${escape(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
assert(html.includes(`<meta name="description" content="${escape(guide.description)}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.url, site + route);
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-27');
assert.equal(article.dateModified, '2026-10-27');
assert.equal(article.inLanguage, 'en');
// Article/social metadata use the visible representative image; the separate
// real app preview is checked below and is also listed in the image sitemap.
assert.deepEqual(article.image, [site + editorialPhotos.nutrition.src]);
const crumbs = graph.find(item => item['@type'] === 'BreadcrumbList');
assert.equal(crumbs.itemListElement.at(-1).item, site + route);
for (const tag of ['property="og:image"', 'name="twitter:image"']) assert(html.includes(`${tag} content="${site}${editorialPhotos.nutrition.src}"`));
assert.equal((html.match(/src="\/assets\/editorial\/nutrition.jpg"/g) || []).length, 1);
assert(html.includes('width="1200" height="675"'));
for (const width of [480, 800, 1200]) assert(html.includes(`/assets/editorial/nutrition-${width}.webp ${width}w`));
assert(html.includes(escape(editorialPhotos.nutrition.alt)));
assert(html.includes('AI-generated editorial illustration; not an app screenshot or a customer record.'));
assert(html.includes('src="/assets/apps/nutrilens/screenshot-2.jpg"'));
assert(html.includes('Store screenshot. Detailed analysis includes Premium features; estimates are not measurements.'));
const direction = html.match(/<figure class="energy-unit-directions">([\s\S]*?)<\/figure>/)?.[1];
assert(direction);
assert.deepEqual([...direction.matchAll(/data-energy-direction="([^"]+)"/g)].map(match => match[1]), ['kj-to-kcal', 'kcal-to-kj']);
assert(direction.includes('Divide by 4.184') && direction.includes('Multiply by 4.184'));
assert(direction.includes('not a food label, app screenshot or nutrition measurement'));
assert(!/<img\b|<svg\b|<canvas\b/.test(direction), 'The teaching diagram is native HTML');
assert.equal((html.match(/class="energy-unit-exercise"/g) || []).length, 6);
for (const [id, calculation, answer] of expectedCalculations) {
  const block = html.match(new RegExp(`<div class="energy-unit-exercise" id="${id}">([\\s\\S]*?)<\\/div>`))?.[1];
  assert(block && block.includes('<details>') && block.includes('<summary>Show the calculation and answer</summary>'));
  assert(block.includes(escape(calculation)) && block.includes(escape(answer)));
}
const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
assert.equal(tables.length, 2);
assert.deepEqual(tables.map(table => (table.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].match(/<tr>/g) || []).length), [6, 5]);
for (const [input, operation, output] of [
  ['100 kJ', '100 ÷ 4.184', '23.90 kcal'], ['250 kJ', '250 ÷ 4.184', '59.75 kcal'],
  ['500 kJ', '500 ÷ 4.184', '119.50 kcal'], ['1,000 kJ', '1,000 ÷ 4.184', '239.01 kcal'],
  ['1,500 kJ', '1,500 ÷ 4.184', '358.51 kcal'], ['2,000 kJ', '2,000 ÷ 4.184', '478.01 kcal'],
]) assert(tables[0].includes(`<th scope="row">${input}</th><td>${operation}</td><td>${output}</td>`));

for (const phrase of [
  'thermochemical conversion', 'invented teaching inputs', 'not values for real products',
  'not energy to add together', 'Conversion changes the energy unit, not the reference quantity', 'Extra decimal places show the arithmetic',
  'does not assume that 250 ml weighs 250 g', 'If the two figures described the same item',
  'not a label-compliance test', 'Do not assume every difference', 'comes only from rounding',
  'Do not overwrite a stated kcal value', 'food sample', 'separately calculating energy from nutrient factors',
  'does not promise automatic nutrition-label reading', 'a kJ-to-kcal converter', 'manual result correction',
  'imports these examples', 'subscriptions and scan credit packs', 'Premium',
  'not a calorie target, dietary prescription or health-outcome claim', 'confirms allergy safety',
]) assert(html.includes(escape(phrase)), phrase);
assert(!html.includes('aria-label="Discuss a Flutter project"'));
for (const placement of ['header', 'guide-preview', 'article-end']) {
  const anchors = [...html.matchAll(new RegExp(`<a[^>]*data-app="nutrilens"[^>]*data-placement="${placement}"[^>]*href="([^"]+)"`, 'g'))];
  assert.equal(anchors.length, 2, placement);
  const urls = anchors.map(match => new URL(match[1].replaceAll('&amp;', '&')));
  assert(urls.some(url => url.hostname === 'apps.apple.com' && url.pathname.endsWith('/id6755138291')));
  const play = urls.find(url => url.hostname === 'play.google.com');
  assert.equal(play.searchParams.get('id'), 'com.moocsoft.food_scan_ai');
  assert.equal(play.searchParams.get('utm_source'), 'moocsoft');
  assert.equal(play.searchParams.get('utm_medium'), 'referral');
  assert.equal(play.searchParams.get('utm_campaign'), 'guides-' + guide.slug);
  assert.equal(play.searchParams.get('utm_content'), placement);
}
assert.equal(guide.faq.length, 6);
for (const [question, answer] of guide.faq) assert(html.includes(escape(question)) && html.includes(escape(answer)));
assert.deepEqual(guide.sources, ['nistEnergyUnits', 'cfsEnergyConversion', 'foodLabelsUk', 'fsanzNutritionPanels', 'portions', 'nutritionStore', 'nutritionGoogleStore']);
for (const key of guide.sources) assert(html.includes(escape(sources[key][1])), key);
assert.equal(new URL(sources.nistEnergyUnits[1]).hostname, 'www.nist.gov');
assert.equal(new URL(sources.cfsEnergyConversion[1]).hostname, 'www.cfs.gov.hk');
for (const [, body] of guide.sections) assert(!/<form\b|<input\b|<script\b|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(body));
assert(!/<script[^>]+src="https?:\/\//i.test(html));
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(item => item.slug), ['calories-per-serving-vs-per-container', 'calories-vs-macros', 'estimate-calories-from-food-photo']);
const incoming = guides.find(item => item.slug === 'calories-per-serving-vs-per-container');
assert.equal(incoming.published, '2026-10-12');
assert.equal(incoming.modified, undefined);
assert(incoming.sections.find(([heading]) => heading === 'Distinguish per 100 g, per 100 ml, kcal and kJ')[1].includes(`href="${route}"`));
const incomingHtml = read('guides/calories-per-serving-vs-per-container/index.html');
const incomingArticle = JSON.parse(incomingHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(item => item['@type'] === 'Article');
assert.equal(incomingArticle.datePublished, '2026-10-12');
assert.equal(incomingArticle.dateModified, '2026-10-12');
assert(incomingHtml.includes(`href="${route}"`));
for (const file of ['guides/index.html', 'guides/nutrition/index.html']) assert(read(file).includes(`href="${route}"`));
const sitemapEntry = read('sitemap.xml').match(new RegExp(`<url>\\s*<loc>${site}${route}</loc>([\\s\\S]*?)<\\/url>`))?.[1];
assert(sitemapEntry && sitemapEntry.includes('<lastmod>2026-10-27</lastmod>'));
assert.deepEqual([...sitemapEntry.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(match => match[1]), [site + editorialPhotos.nutrition.src, site + '/assets/apps/nutrilens/screenshot-2.jpg']);
console.log('PASS: independent exact-rational energy conversions and six examples, matching quantities and rounded-pair boundaries, native chart/answers, real NutriLens stores/access, metadata, original dates and reciprocal reading.');
