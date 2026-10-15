import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import riceGuides, { riceBatches } from '../content/nutrition-rice-weight.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, published } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = riceGuides;
assert.equal(riceGuides.length, 1);
assert.equal(guide.slug, 'dry-to-cooked-rice-weight');
assert.equal(guide.topic, 'nutrition');
assert.equal(guide.published, '2026-10-15');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false, 'A daily macro-target tool is not a rice converter');
assert.deepEqual(guide.startAction, ['#step-4', 'Try the two portion checks ↓']);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);

// Independently verify with cross-multiplied mass/energy identities, without
// importing an article calculation function. The numerical examples are invented.
assert.deepEqual(riceBatches.map(row => row.id), ['A', 'B', 'C']);
const expected = [[150, 420, 140, 50, 180], [150, 480, 140, 43.75, 157.5], [120, 300, 75, 30, 108]];
for (const [index, row] of riceBatches.entries()) {
  assert.deepEqual([row.dryGrams, row.cookedGrams, row.portionGrams, row.dryEquivalent, row.portionCalories], expected[index]);
  assert.equal(row.kcalPer100g, 360);
  assert(row.dryGrams > 0 && row.cookedGrams > 0 && row.portionGrams > 0 && row.portionGrams <= row.cookedGrams);
  assert.equal(row.dryEquivalent * row.cookedGrams, row.portionGrams * row.dryGrams);
  assert.equal(row.portionCalories * 100, row.dryEquivalent * row.kcalPer100g);
}
assert.equal(riceBatches[0].dryGrams * 360 / 100, 540);
assert.equal(riceBatches[1].dryGrams * 360 / 100, 540);
assert.equal(riceBatches[0].portionCalories * 3, 540);
assert.equal(riceBatches[2].portionCalories * 4, 432);
assert.equal(140 * 360 / 100, 504, 'The displayed wrong-basis arithmetic is arithmetically correct but uses the wrong preparation');
assert.notEqual(504, riceBatches[0].portionCalories);
assert.notEqual(riceBatches[0].cookedGrams / riceBatches[0].dryGrams, riceBatches[1].cookedGrams / riceBatches[1].dryGrams);
assert.equal(Math.round(riceBatches[1].portionCalories), 158);

const html = read(`guides/${guide.slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}/guides/${guide.slug}/">`));
assert(html.includes(`<title>${guide.title} | Moocsoft</title>`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-15');
assert.equal(article.dateModified, '2026-10-15');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, `${site}/guides/${guide.slug}/`);
assert.equal((html.match(/<details data-rice-practice>/g) || []).length, 2);
for (const phrase of ['invented worksheet figures', 'not USDA rice values', 'not a laboratory measurement', 'Not from that weight alone', 'not modeled', 'Do not generalize', 'Unknown oil stays unknown', 'Automatic import, barcode reading and manual correction are not promised', 'subscriptions and scan credit packs', 'Premium']) assert(html.includes(phrase), phrase);
for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
assert(html.includes('id6755138291') && html.includes('id=com.moocsoft.food_scan_ai'));
assert(html.includes('utm_campaign=guides-' + guide.slug));
assert(html.includes('src="/assets/apps/nutrilens/screenshot-2.jpg"'));
assert(!html.includes('Open the free calorie &amp; macro calculator'), 'No misleading converter CTA');
const related = createRelatedGuideSelector(guides)(guide);
assert.deepEqual(related.map(item => item.slug), ['track-calories-homemade-meals', 'calories-per-serving-vs-per-container', 'ai-calorie-scanner-accuracy']);
assert(related.every(item => item.topic === 'nutrition'));
for (const file of ['guides/nutrition/index.html', 'guides/index.html', 'guides/track-calories-homemade-meals/index.html']) assert(read(file).includes(`/guides/${guide.slug}/`));
const incoming = guides.find(item => item.slug === 'track-calories-homemade-meals');
assert.equal(incoming.published || published, '2026-09-12');
assert.equal(incoming.modified, undefined, 'A link-only addition does not manufacture a fresh article date');
assert(read('sitemap.xml').includes(`<loc>${site}/guides/${guide.slug}/</loc>\n    <lastmod>2026-10-15</lastmod>`));
console.log('PASS: independently verified dry-equivalent rice/energy arithmetic, wrong-basis and missing-data boundaries, dates, real app access/attribution and reciprocal links.');
