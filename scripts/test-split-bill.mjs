// Independent integer-cent website checks, not payments, tax advice or app tests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import billGuides, { billItems, equalBillShares, itemizedBillShares } from '../content/math-split-bill.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, escape } from '../content/apps.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const [guide] = billGuides;
const route = '/guides/split-restaurant-bill/';
assert.equal(billGuides.length, 1);
assert.equal(guide.slug, 'split-restaurant-bill');
assert.equal(guide.topic, 'math');
assert.equal(guide.editorialFormat, 'story');
assert.equal(guide.published, '2026-10-28');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false, 'A puzzle round is not a bill calculator');
assert.deepEqual(guide.startAction, ['#step-3', 'See the equal split and remaining cents ↓']);
assert.equal(guides.filter(row => row.slug === guide.slug).length, 1);
assert.deepEqual(guides.filter(row => row.published === '2026-10-28').map(row => row.slug), [guide.slug]);

// Literal fixtures are independent of source formatting and table generation.
const expectedItems = [
  ['Maya’s individual items', 'Maya', '$11.50'],
  ['Leo’s individual items', 'Leo', '$19.00'],
  ['Nora’s individual items', 'Nora', '$16.25'],
  ['One shared appetizer', 'All three, equally', '$9.00'],
];
const expectedEqual = [
  ['Maya', '$23.78', '$0.01', '$23.79'],
  ['Leo', '$23.78', '$0.01', '$23.79'],
  ['Nora', '$23.78', '$0.00', '$23.78'],
];
const expectedItemized = [
  ['Maya', '$11.50', '$3.00', '$14.50', '$1.16', '$2.90', '$18.56'],
  ['Leo', '$19.00', '$3.00', '$22.00', '$1.76', '$4.40', '$28.16'],
  ['Nora', '$16.25', '$3.00', '$19.25', '$1.54', '$3.85', '$24.64'],
];
assert.deepEqual(billItems, expectedItems);
assert.deepEqual(equalBillShares, expectedEqual);
assert.deepEqual(itemizedBillShares, expectedItemized);
const cents = value => {
  assert.match(value, /^\$\d+\.\d{2}$/);
  const [whole, fractional] = value.slice(1).split('.');
  return BigInt(whole) * 100n + BigInt(fractional);
};
const sum = values => values.reduce((total, value) => total + value, 0n);
const exactPercent = (base, rate) => {
  assert.equal(base * rate % 100n, 0n, 'These selected percentage rows land exactly on cents');
  return base * rate / 100n;
};
const roundCent = (numerator, denominator) => (2n * numerator + denominator) / (2n * denominator);
const items = billItems.map(row => cents(row[2]));
assert.deepEqual(items, [1150n, 1900n, 1625n, 900n]);
const subtotal = sum(items);
assert.equal(subtotal, 5575n);
const tax = exactPercent(subtotal, 8n), tip = exactPercent(subtotal, 20n);
assert.deepEqual([tax, tip, subtotal + tax + tip], [446n, 1115n, 7136n]);
const target = subtotal + tax + tip;
assert.equal(target / 3n, 2378n);
assert.equal(target % 3n, 2n);
assert.equal(3n * 2378n + 2n, target);
const equal = equalBillShares.map(row => cents(row[3]));
assert.deepEqual(equal, [2379n, 2379n, 2378n]);
assert.equal(sum(equal), target);
assert.equal(2379n * 3n - target, 1n, 'Rounding all three shares up overcollects one cent');
assert.equal(target - 2378n * 3n, 2n, 'Rounding all three down leaves two cents');
assert.equal(items[3] / 3n, 300n);
assert.equal(items[3] % 3n, 0n);
const itemized = itemizedBillShares.map(row => row.slice(1).map(cents));
assert.deepEqual(itemized.map(row => row[2]), [1450n, 2200n, 1925n]);
assert.deepEqual(itemized.map(row => row[3]), [116n, 176n, 154n]);
assert.deepEqual(itemized.map(row => row[4]), [290n, 440n, 385n]);
assert.deepEqual(itemized.map(row => row[5]), [1856n, 2816n, 2464n]);
for (let i = 0; i < itemized.length; i++) {
  const [own, shared, base, rowTax, rowTip, final] = itemized[i];
  assert.equal(own, items[i]);
  assert.equal(shared, 300n);
  assert.equal(base, own + shared);
  assert.equal(rowTax, exactPercent(base, 8n));
  assert.equal(rowTip, exactPercent(base, 20n));
  assert.equal(final, base + rowTax + rowTip);
  assert.equal(base * 128n, final * 100n, 'Same-base additions, not compounding');
}
assert.equal(sum(itemized.map(row => row[2])), subtotal);
assert.equal(sum(itemized.map(row => row[3])), tax);
assert.equal(sum(itemized.map(row => row[4])), tip);
assert.equal(sum(itemized.map(row => row[5])), target);
const differences = itemized.map((row, i) => row[5] - equal[i]);
assert.deepEqual(differences, [-523n, 437n, 86n]);
assert.equal(sum(differences), 0n, 'Allocations redistribute the same total, not group savings');
const taxInclusive = subtotal + tax;
assert.equal(taxInclusive, 6021n);
assert.equal(taxInclusive * 20n, 120420n, 'Alternate tip is 1204.2 cents before rounding');
const alternateTip = roundCent(taxInclusive * 20n, 100n);
assert.equal(alternateTip, 1204n);
assert.equal(taxInclusive + alternateTip, 7225n);
assert.notEqual(taxInclusive + alternateTip, target);
assert.equal(roundCent(subtotal * 108n * 120n, 10000n), 7225n);
assert.notEqual(108n * 120n, 128n * 100n, 'Changing the percentage base changes the calculation');

const html = read(`guides/${guide.slug}/index.html`);
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(`<title>${escape(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<meta name="description" content="${escape(guide.description)}">`));
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(row => row['@type'] === 'Article');
assert.equal(article.url, site + route);
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-28');
assert.equal(article.dateModified, '2026-10-28');
assert.equal(article.inLanguage, 'en');
assert.deepEqual(article.image, [site + editorialPhotos.math.src]);
assert.equal(graph.find(row => row['@type'] === 'BreadcrumbList').itemListElement.at(-1).item, site + route);
for (const tag of ['property="og:image"', 'name="twitter:image"']) assert(html.includes(`${tag} content="${site}${editorialPhotos.math.src}"`));
assert.equal((html.match(/src="\/assets\/editorial\/math.jpg"/g) || []).length, 1);
assert(html.includes('width="1200" height="675"'));
for (const width of [480, 800, 1200]) assert(html.includes(`/assets/editorial/math-${width}.webp ${width}w`));
assert(html.includes(escape(editorialPhotos.math.alt)));
assert(html.includes('AI-generated editorial illustration; not an app screenshot or a customer record.'));
const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
assert.equal(tables.length, 3);
for (const [i, expected] of [expectedItems, expectedEqual, expectedItemized].entries()) {
  const body = tables[i].match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const rows = [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(match => [...match[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/g)].map(cell => cell[1]));
  assert.deepEqual(rows, expected.map(row => row.map(escape)), `Literal visible table ${i + 1}`);
}
assert.equal((html.match(/class="bill-split-flow"/g) || []).length, 1);
const flow = html.match(/<figure class="bill-split-flow">([\s\S]*?)<\/figure>/)[1];
assert.deepEqual([...flow.matchAll(/data-bill-step="([^"]+)"/g)].map(match => match[1]), ['items', 'tax', 'tip', 'total']);
assert(!/<img\b|<svg\b|<canvas\b/.test(flow));
for (const value of ['$55.75', '+$4.46', '+$11.15', '$71.36']) assert(flow.includes(value));
assert.equal((html.match(/<details class="bill-split-check"/g) || []).length, 2);
for (const id of ['equal-rounding-check', 'tip-base-check']) assert(html.includes(`id="${id}"`));
for (const phrase of [
  'fictional worked story', 'not real menu prices', 'No gratuity or service charge is already included',
  'not a suggested tip, a real tax rate', 'currency with 100 cents per dollar',
  'These characters are not Moocsoft customers', 'not personal experience',
  'Neither method is automatically fairest', 'not a statement of local tax law or a tipping recommendation',
  'same pretax item subtotal', 'different agreed tie-break', 'not a cash-denomination rule',
  'not evidence that somebody paid or reimbursed it', 'not a transaction record or a bank transfer',
  'do not create a saving for the group', 'Do not automatically apply this 1.28 multiplier',
  '$60.21 × 0.20 = $12.042', '$60.21 + $12.04 = $72.25',
  'does not claim the restaurant accepted three payments', 'not an app level, receipt scanner, bill calculator or payment feature',
  'No bill inputs, friends’ identities or payment details are collected here',
]) assert(html.includes(escape(phrase)), `Keep honest boundary: ${phrase}`);
const preview = html.match(/<section class="guide-app-preview"[\s\S]*?<\/section>/)?.[0];
assert(preview && !/<img\b/.test(preview), 'Text-only math preview does not invent a bill interface');
assert(html.includes(escape(guide.previewCopy.heading)) && html.includes(escape(guide.previewCopy.description)));
assert(!html.includes('aria-label="Discuss a Flutter project"'));
for (const placement of ['header', 'guide-preview', 'article-end']) {
  const anchors = [...html.matchAll(new RegExp(`<a[^>]*data-app="math-riddles"[^>]*data-placement="${placement}"[^>]*href="([^"]+)"`, 'g'))];
  assert.equal(anchors.length, 2, placement);
  const urls = anchors.map(match => new URL(match[1].replaceAll('&amp;', '&')));
  assert(urls.some(url => url.hostname === 'apps.apple.com' && url.pathname.endsWith('/id6449851642')));
  const play = urls.find(url => url.hostname === 'play.google.com');
  assert.equal(play.searchParams.get('id'), 'com.moocsoft.math_puzzle');
  assert.equal(play.searchParams.get('utm_source'), 'moocsoft');
  assert.equal(play.searchParams.get('utm_medium'), 'referral');
  assert.equal(play.searchParams.get('utm_campaign'), 'guides-' + guide.slug);
  assert.equal(play.searchParams.get('utm_content'), placement);
}
assert.equal(guide.faq.length, 6);
for (const [question, answer] of guide.faq) assert(html.includes(escape(question)) && html.includes(escape(answer)));
for (const [, body] of guide.sections) assert(!/<form\b|<input\b|<script\b|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(body));
assert(!/<script[^>]+src="https?:\/\//i.test(html));
assert.deepEqual(guide.sources, ['openStaxPercentApplications', 'cfpbSpendingTracker', 'mathStore', 'mathGoogleStore']);
for (const key of guide.sources) assert(html.includes(escape(sources[key][1])), key);
assert.equal(new URL(sources.openStaxPercentApplications[1]).hostname, 'openstax.org');
assert.equal(new URL(sources.cfpbSpendingTracker[1]).hostname, 'www.consumerfinance.gov');
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(row => row.slug), ['mental-multiplication-tricks', 'compare-fractions-without-decimals', 'compare-unit-prices']);
const incoming = guides.find(row => row.slug === 'compare-unit-prices');
assert.equal(incoming.published, '2026-10-23');
assert.equal(incoming.modified, undefined);
assert(incoming.sections.find(([heading]) => heading === 'Use a short check before choosing')[1].includes(`href="${route}"`));
const incomingHtml = read('guides/compare-unit-prices/index.html');
assert(incomingHtml.includes(`href="${route}"`));
const incomingArticle = JSON.parse(incomingHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(row => row['@type'] === 'Article');
assert.equal(incomingArticle.datePublished, '2026-10-23');
assert.equal(incomingArticle.dateModified, '2026-10-23');
for (const file of ['guides/index.html', 'guides/math/index.html']) assert(read(file).includes(`href="${route}"`));
const sitemapEntry = read('sitemap.xml').match(new RegExp(`<url>\\s*<loc>${site}${route}</loc>([\\s\\S]*?)<\\/url>`))?.[1];
assert(sitemapEntry && sitemapEntry.includes('<lastmod>2026-10-28</lastmod>'));
assert.deepEqual([...sitemapEntry.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(match => match[1]), [site + editorialPhotos.math.src]);
console.log('PASS: independent integer-cent bill totals, equal residual cents, itemized charge allocation, changed-base counterexample, disclosed story/native diagram, real app stores, dated metadata and reciprocal reading.');
