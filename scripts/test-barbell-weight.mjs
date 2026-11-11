import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import guidesForBarbell, { barbellExamples } from '../content/training-barbell-weight.mjs';
import { guides } from '../content/index.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const [guide] = guidesForBarbell;
// Count individual pieces in grams independently of the article's shortcut.
const pieces = [
  [20000, 10000, 5000, 10000, 5000],
  [15000, 10000, 5000, 10000, 5000],
  [20000, 10000, 5000, 2500, 10000, 5000, 2500],
];
assert.deepEqual(barbellExamples.map(x => x.total), pieces.map(row => row.reduce((a, b) => a + b, 0) / 1000));
assert.equal(pieces[2].reduce((a, b) => a + b) - pieces[0].reduce((a, b) => a + b), 5000);
assert.equal([...pieces[0], 250, 250].reduce((a, b) => a + b) / 1000, 50.5);
const actualRepetitions = [8, 8, 6].flatMap(n => Array(n).fill(50));
assert.equal(actualRepetitions.length, 22);
assert.equal(actualRepetitions.reduce((a, b) => a + b, 0), 1100);
assert.equal(Array(24).fill(50).reduce((a, b) => a + b, 0) - 1100, 100);
assert.equal([15000, 10000, 2500, 10000, 2500].reduce((a, b) => a + b) / 1000, 40);
const path = `/guides/${guide.slug}/`;
const html = read(path.slice(1) + 'index.html');
assert.equal(guide.published, '2026-11-11');
assert.equal(guide.modified, undefined);
assert.equal(guides.filter(x => x.slug === guide.slug).length, 1);
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(x => x['@type'] === 'Article');
assert.equal(article.datePublished, guide.published);
assert.equal(article.dateModified, guide.published);
assert.equal(article.headline, guide.title);
assert(html.includes(`rel="canonical" href="https://moocsoft.net${path}"`));
for (const text of ['15 + 20 + 15 = 50 kg', '20 + 17.5 + 17.5', '50.5 kg', '22 × 50 = 1,100 kg', 'by 100 kg', '15 + 12.5 + 12.5', 'Unknown bar + 30 kg plates', 'not an automatic plate calculator', 'Lifetime Premium', 'data-barbell-diagram', 'aria-labelledby="barbell-title barbell-desc"', 'data-barbell-check']) assert(html.includes(text), text);
assert(html.includes('id6808200259'));
assert(html.includes('com.moocsoft.didyoulift'));
assert(html.includes('/assets/apps/did-you-lift/app-store-set-log.jpg'));
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(x => x.slug), ['workout-volume-explained', 'log-warm-up-and-working-sets', 'dumbbell-workout-volume']);
for (const p of ['guides/index.html', 'guides/training/index.html', 'guides/dumbbell-workout-volume/index.html', 'sitemap.xml']) assert(read(p).includes(path), p);
assert.equal(guides.find(x => x.slug === 'dumbbell-workout-volume').modified, undefined);
console.log('PASS: barbell pieces, paired additions, collars, actual reps, unknown boundaries, accessible diagram, dates and discovery.');
