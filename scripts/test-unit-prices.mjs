// Verify original website arithmetic with integer identities, not retail-price or app tests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import unitPriceGuides, { packComparison, unitPricePractice } from '../content/math-unit-prices.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, escape } from '../content/apps.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = unitPriceGuides;
const route = `/guides/${guide.slug}/`;
assert.equal(unitPriceGuides.length, 1);
assert.equal(guide.slug, 'compare-unit-prices');
assert.equal(guide.topic, 'math');
assert.equal(guide.published, '2026-10-23');
assert.equal(guide.modified, undefined);
assert.equal(guide.showToolAction, false, 'A puzzle round is not a shopping calculator');
assert.equal(guide.appPreview, true);
assert.equal(guides.filter(row => row.slug === guide.slug).length, 1);
assert.deepEqual(guides.filter(row => row.published === '2026-10-23').map(row => row.slug), [guide.slug]);

// Cross products independently compare price/quantity; their sign needs no rounded decimal.
const compare = (priceA, quantityA, priceB, quantityB) => {
  for (const value of [priceA, quantityA, priceB, quantityB]) assert(Number.isSafeInteger(value) && value > 0);
  const difference = BigInt(priceA) * BigInt(quantityB) - BigInt(priceB) * BigInt(quantityA);
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
};
const exactDollars = (priceCents, quantity, basis, digits) => {
  const numerator = BigInt(priceCents) * BigInt(basis) * 10n ** BigInt(digits);
  const denominator = BigInt(quantity) * 100n;
  assert.equal(numerator % denominator, 0n, 'The displayed exercise decimal is exact at this precision');
  const integer = numerator / denominator;
  const padded = integer.toString().padStart(digits + 1, '0');
  return `${padded.slice(0, -digits)}.${padded.slice(-digits)}`;
};
const roundedUnitDollars = (priceCents, quantity, basis) => {
  const numerator = BigInt(priceCents) * BigInt(basis);
  const denominator = BigInt(quantity);
  const roundedCents = (2n * numerator + denominator) / (2n * denominator);
  return `${roundedCents / 100n}.${(roundedCents % 100n).toString().padStart(2, '0')}`;
};
assert.deepEqual(packComparison.map(row => [row.id, row.packs, row.gramsPerPack, row.priceCents, row.centsPer100g]), [
  ['A', 1, 500, 320, 64], ['B', 1, 750, 450, 60], ['C', 2, 400, 520, 65],
]);
for (const row of packComparison) {
  const grams = BigInt(row.packs) * BigInt(row.gramsPerPack);
  assert.equal(BigInt(row.priceCents) * 100n, BigInt(row.centsPer100g) * grams);
}
assert.equal(compare(450, 750, 320, 500), -1);
assert.equal(compare(450, 750, 520, 800), -1);
assert(320 < 450 && 320 < 520, 'Lowest checkout price differs from the lowest unit price');
assert.equal(450 - 320, 130);
assert.equal(750 - 500, 250);
assert.equal(330n * 100n, 55n * 600n, 'The opening 600 g example is 55 cents per 100 g');
assert.equal(330n * 1000n, 550n * 600n, 'The same opening example is 550 cents per kilogram');

assert.equal(unitPricePractice.length, 6);
assert.deepEqual(unitPricePractice.map(row => [row.id, row.kind, row.unit, row.basis, row.lower]), [
  [1, 'weight', 'g', 100, 'B'], [2, 'multipack', 'g', 100, 'A'],
  [3, 'volume', 'mL', 100, 'A'], [4, 'count', 'identical notebook', 1, 'A'],
  [5, 'conditional', 'g', 100, 'A'], [6, 'rounding', 'g', 100, 'B'],
]);
// Independent expected totals prevent matching answers from masking a changed fixture.
const expected = [
  [180, 300, 275, 500, '0.60', '0.55'],
  [450, 750, 640, 1000, '0.60', '0.64'],
  [210, 1500, 120, 750, '0.14', '0.16'],
  [450, 6, 800, 10, '0.75', '0.80'],
  [480, 600, 425, 500, '0.80', '0.85'],
  [201, 400, 251, 500, '0.5025', '0.5020'],
];
for (let index = 0; index < unitPricePractice.length; index++) {
  const row = unitPricePractice[index];
  const quantity = pack => pack.quantity ?? pack.packs * pack.quantityPerPack;
  const [priceA, quantityA, priceB, quantityB, decimalA, decimalB] = expected[index];
  assert.deepEqual([row.a.priceCents, quantity(row.a), row.b.priceCents, quantity(row.b)], [priceA, quantityA, priceB, quantityB]);
  assert.equal(compare(priceA, quantityA, priceB, quantityB), row.lower === 'A' ? -1 : 1);
  const digits = row.kind === 'rounding' ? 4 : 2;
  assert.equal(exactDollars(priceA, quantityA, row.basis, digits), decimalA);
  assert.equal(exactDollars(priceB, quantityB, row.basis, digits), decimalB);
  assert(row.answer.includes('$' + decimalA) && row.answer.includes('$' + decimalB));
}
assert.deepEqual([unitPricePractice[1].a.packs, unitPricePractice[1].a.quantityPerPack], [3, 250]);
assert.equal(3 * 250, 750, 'A multipack total is not one inner pack');
assert.equal(15n * 1000n, 1500n * 10n, '1.5 L converts to 1500 mL without changing the ratio');
assert.equal(275 - 180, 95, 'Question 1 retains the additional checkout payment');
const offer = unitPricePractice[4];
assert.equal(offer.singlePriceCents, 270);
assert.equal(270n * 100n, 90n * 300n);
assert.equal(compare(480, 600, 425, 500), -1);
assert.equal(compare(270, 300, 425, 500), 1, 'Buying only one reverses the conditional comparison');
assert(480 > 425 && 270 < 425, 'Offer price per unit and actual payment answer different questions');
assert(offer.answer.includes('$0.90') && offer.answer.includes('$4.80'));
assert.equal(roundedUnitDollars(201, 400, 100), '0.50');
assert.equal(roundedUnitDollars(251, 500, 100), '0.50');
assert.notEqual(201n * 500n, 251n * 400n, 'A displayed tie is not equality of exact ratios');
assert.equal(251 - 201, 50);

const html = read(`guides/${guide.slug}/index.html`);
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(`<title>${escape(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(row => row['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-23');
assert.equal(article.dateModified, '2026-10-23');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, site + route);
assert.deepEqual(article.image, [site + editorialPhotos.math.src]);
assert(graph.some(row => row['@type'] === 'BreadcrumbList'));
assert.equal((html.match(/data-unit-price-practice=/g) || []).length, 6);
for (const row of unitPricePractice) {
  assert(html.includes(`<details data-unit-price-practice="${row.id}">`));
  assert(html.includes(escape(row.question)) && html.includes(row.answer));
}
assert.equal((html.match(/class="unit-price-comparison"/g) || []).length, 1);
assert.equal((html.match(/class="unit-price-bar" aria-hidden="true"/g) || []).length, 3);
for (const row of packComparison) {
  const item = html.match(new RegExp(`<li data-pack="${row.id}">([\\s\\S]*?)<\\/li>`))?.[1];
  assert(item, row.id);
  assert(item.includes(`style="width:${row.centsPer100g}%"`));
  assert(item.includes(`$0.${row.centsPer100g} / 100 g`));
  assert(item.includes(`${row.packs * row.gramsPerPack} g total`));
}
assert(html.includes('Each full track represents $1.00 per 100 g.'));
assert.equal((html.match(/src="\/assets\/editorial\/math.jpg"/g) || []).length, 1);
assert(html.includes('width="1200" height="675"') && html.includes('/assets/editorial/math-480.webp 480w'));
assert(html.includes('/assets/editorial/math-800.webp 800w') && html.includes('/assets/editorial/math-1200.webp 1200w'));
assert(html.includes('AI-generated editorial illustration'));
assert(!/<img[^>]*data-visual-kind="chart"/.test(html), 'The native HTML chart is not a fabricated app screenshot');
const preview = html.match(/<section class="guide-app-preview"[\s\S]*?<\/section>/)?.[0];
assert(preview && !/<img\b/.test(preview), 'A text-only app feature preview does not invent a shopping screen');
for (const phrase of ['not a grocery-price scanner or unit-price calculator', 'not current deals', 'not app levels',
  'not an app screenshot', 'No answers or shopping inputs are collected here', 'Do not treat grams and millilitres as interchangeable',
  'not a retailer offer', 'ads and optional in-app purchases', 'Premium']) assert(html.toLowerCase().includes(phrase.toLowerCase()), phrase);
for (const [, body] of guide.sections) assert(!/<form|<input|<script\b|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(body));
assert.deepEqual(guide.sources, ['nistUnitPricing', 'acccUnitPricing', 'mathStore', 'mathGoogleStore']);
for (const key of guide.sources) assert(html.includes(escape(sources[key][1])), key);
assert(sources.nistUnitPricing[1].startsWith('https://nvlpubs.nist.gov/'));
assert(sources.acccUnitPricing[1].startsWith('https://www.accc.gov.au/'));
for (const placement of ['header', 'guide-preview', 'article-end']) {
  const anchors = [...html.matchAll(new RegExp(`<a[^>]*data-app="math-riddles"[^>]*data-placement="${placement}"[^>]*href="([^"]+)"`, 'g'))];
  assert.equal(anchors.length, 2, placement);
  const urls = anchors.map(match => new URL(match[1].replaceAll('&amp;', '&')));
  assert(urls.some(url => url.hostname === 'apps.apple.com' && url.pathname.endsWith('/id6449851642')));
  const play = urls.find(url => url.hostname === 'play.google.com');
  assert.equal(play.searchParams.get('id'), 'com.moocsoft.math_puzzle');
  assert.equal(play.searchParams.get('utm_source'), 'moocsoft');
  assert.equal(play.searchParams.get('utm_campaign'), 'guides-' + guide.slug);
  assert.equal(play.searchParams.get('utm_content'), placement);
}
for (const [question, answer] of guide.faq) assert(html.includes(escape(question)) && html.includes(escape(answer)));
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(row => row.slug), [
  'compare-fractions-without-decimals', 'mental-multiplication-tricks', 'mental-math-games-for-adults',
]);
for (const file of ['guides/index.html', 'guides/math/index.html', 'guides/mental-math-games-for-adults/index.html']) assert(read(file).includes(route), file);
const incoming = guides.find(row => row.slug === 'mental-math-games-for-adults');
assert.equal(incoming.published, '2026-09-22');
assert.equal(incoming.modified, undefined, 'A contextual link does not reset the old article date');
assert(incoming.sections.find(([heading]) => heading === 'Estimate before calculating exactly')[1].includes(route));
assert(read('sitemap.xml').includes(`<loc>${site}${route}</loc>\n    <lastmod>2026-10-23</lastmod>`));
const home = read('index.html');
const mathCard = home.match(/<!-- Math Riddles -->([\s\S]*?)<\/article>/)?.[1];
assert(mathCard && !/4\.8\s*[·•]\s*100K\+/i.test(mathCard), 'The stale conflated rating/download badge stays removed');
assert(mathCard.includes('id6449851642') && mathCard.includes('com.moocsoft.math_puzzle'));
assert(read('sitemap.xml').includes(`<loc>${site}/</loc>\n    <lastmod>2026-10-23</lastmod>`));
console.log('PASS: three pack ratios and six independently cross-multiplied exercises, exact decimals versus rounded ties, conditional offers, native bars/photo, real app attribution, source/feature boundaries and dated reciprocal discovery.');
