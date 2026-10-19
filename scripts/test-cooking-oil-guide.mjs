// Independent bookkeeping checks. No lab measurement, absorption or nutrition outcome is simulated.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import oilGuides, { oilExample as e } from '../content/nutrition-cooking-oil.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, published } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = oilGuides;
const route = `/guides/${guide.slug}/`;
assert.equal(oilGuides.length, 1);
assert.equal(guide.slug, 'count-cooking-oil-calories');
assert.equal(guide.topic, 'nutrition');
assert.equal(guide.published, '2026-10-19');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);

// Verify original numeric fixtures through independent mass/energy identities.
assert.deepEqual([e.bottleBeforeGrams, e.bottleAfterGrams, e.labelGrams, e.labelCalories, e.batchGrams], [842, 814, 14, 120, 800]);
const removed = e.bottleBeforeGrams - e.bottleAfterGrams;
assert.equal(removed, 28);
assert.equal(240 * e.labelGrams, removed * e.labelCalories);
assert.deepEqual(e.portions.map(row => [row.grams, row.oilCalories]), [[200, 60], [300, 90]]);
for (const portion of e.portions) {
  assert.equal(portion.oilCalories * e.batchGrams, portion.grams * 240);
  assert(portion.grams > 0 && portion.grams <= e.batchGrams);
}
assert.equal(60 * 4, 240);
assert.equal(e.plateExtraGrams, 3.5);
assert.equal(e.plateExtraCalories, 30);
assert.equal(e.plateExtraCalories * e.labelGrams, e.plateExtraGrams * e.labelCalories);
assert.equal(e.portions[0].oilCalories + e.plateExtraCalories, 90);
assert.notEqual(e.portions[0].oilCalories + 240 + e.plateExtraCalories, 90);

const html = read(`guides/${guide.slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
assert.equal((html.match(/<h1>/g) || []).length, 1);
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-19');
assert.equal(article.dateModified, '2026-10-19');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, site + route);
for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
for (const phrase of ['invented worksheet figures', 'not nutrition values for a named product',
  'Oil removed from the bottle, not measured oil eaten', 'all 28 g reached and remained',
  'not evidence that real cooking always retains all oil', 'only the oil component',
  'no absorption rate measured', 'Mixed residue', 'not a precision promise',
  'manual-correction or label-import feature', 'subscriptions and scan credit packs',
  'not an additional portion entry', 'Premium', 'Official']) {
  // The final counterexample uses initial-capital table text.
  assert(html.toLowerCase().includes(phrase.toLowerCase()), phrase);
}
assert.equal((html.match(/<caption>/g) || []).length, 4);
for (const [question, answer] of guide.faq) assert(html.includes(question) && html.includes(answer));
assert(html.includes('id6755138291') && html.includes('id=com.moocsoft.food_scan_ai'));
assert(html.includes('utm_campaign=guides-' + guide.slug));
assert(html.includes('src="/assets/apps/nutrilens/screenshot-2.jpg"'));
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(item => item.slug), [
  'track-calories-homemade-meals', 'calories-per-serving-vs-per-container', 'ai-calorie-scanner-accuracy',
]);
for (const file of ['guides/index.html', 'guides/nutrition/index.html', 'guides/track-calories-homemade-meals/index.html']) assert(read(file).includes(route), file);
const incoming = guides.find(item => item.slug === 'track-calories-homemade-meals');
assert.equal(incoming.published || published, '2026-09-12');
assert.equal(incoming.modified, undefined);
assert(read('sitemap.xml').includes(`<loc>${site}${route}</loc>\n    <lastmod>2026-10-19</lastmod>`));
console.log('PASS: original oil-input/portion/plate-addition arithmetic, retention and double-counting boundaries, honest product access, dated metadata, real stores/preview, reciprocal links and sitemap.');
