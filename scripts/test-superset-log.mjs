// Verify the original A/B worksheet independently; no app or exercise-effectiveness test.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import supersetGuides, { supersetRows, supersetIntervals } from '../content/training-supersets.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, escape } from '../content/apps.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = supersetGuides;
const path = `/guides/${guide.slug}/`;
assert.equal(supersetGuides.length, 1);
assert.equal(guide.slug, 'how-to-log-supersets');
assert.equal(guide.published, '2026-10-21');
assert.equal(guide.modified, undefined);
assert.equal(guide.topic, 'training');
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false, 'A generic per-set countdown is not a round-aware timer');
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);
assert.deepEqual(supersetRows.map(row => [row.id, row.round, row.reps, row.kg]), [
  ['A1',1,12,25], ['B1',1,10,15], ['A2',2,10,25], ['B2',2,8,15], ['A3',3,9,25], ['B3',3,7,15],
]);
// Enumerate each repetition's entered load, not the source's displayed totals.
const loads = supersetRows.flatMap(row => Array.from({ length: row.reps }, () => ({ exercise: row.id[0], kg: row.kg })));
assert.equal(loads.length, 56);
assert.equal(loads.reduce((sum, rep) => sum + rep.kg, 0), 1150);
for (const [name, reps, volume] of [['A',31,775], ['B',25,375]]) {
  const actual = loads.filter(rep => rep.exercise === name);
  assert.equal(actual.length, reps);
  assert.equal(actual.reduce((sum, rep) => sum + rep.kg, 0), volume);
}
for (let round = 1; round <= 3; round++) assert.deepEqual(supersetRows.filter(row => row.round === round).map(row => row.id), [`A${round}`,`B${round}`]);
const stopped = supersetRows.slice(0, 5);
assert.equal(stopped.reduce((sum, row) => sum + row.reps, 0), 49);
assert.equal(stopped.reduce((sum, row) => sum + row.reps * row.kg, 0), 1045);
assert.equal(stopped.filter(row => row.id[0] === 'B').reduce((sum, row) => sum + row.reps * row.kg, 0), 270);
assert.equal([1,2,3].filter(round => stopped.some(row => row.id === `A${round}`) && stopped.some(row => row.id === `B${round}`)).length, 2);
const clockSeconds = value => value.split(':').map(Number).reduce((sum, part) => sum * 60 + part, 0);
assert.deepEqual(supersetIntervals.map(row => clockSeconds(row.end) - clockSeconds(row.start)), [20,90]);
for (const interval of supersetIntervals) assert.equal(clockSeconds(interval.end) - clockSeconds(interval.start), interval.seconds);
assert.equal(clockSeconds('18:20:50') - clockSeconds('18:20:20'), 30, 'B1 activity is separate from the later pause');

const html = read('.' + path + 'index.html');
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(`<title>${escape(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="${site}${path}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(node => node['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-21');
assert.equal(article.dateModified, '2026-10-21');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, site + path);
assert.deepEqual(article.image, [site + editorialPhotos.training.src]);
assert(graph.some(node => node['@type'] === 'BreadcrumbList'));
assert.equal((html.match(/<div class="guide-table"/g) || []).length, 3);
assert.equal((html.match(/class="guide-superset-sequence"/g) || []).length, 1);
for (const round of [1,2,3]) assert(html.includes(`<strong>A${round} → B${round}</strong>`));
assert.equal((html.match(/data-superset-check/g) || []).length, 1);
for (const value of ['31 × 25 = 775 kg','25 × 15 = 375 kg','1,150 kg','1,045 kg','270 kg','49','56','20 seconds','90 seconds']) assert(html.includes(value), value);
for (const phrase of ['not a routine to follow','explicitly ends after A3 and before B3 begins','documented sets','B3 remains unknown',
  'not a score of session quality','not mechanical work in joules','manual labeling method','do not establish a dedicated superset grouping mode',
  'automatic A/B switching','not a simulated superset screen','not an app screen or a prescribed routine','optional one-time Lifetime Premium',
  'no verified claim of dedicated superset grouping']) assert(html.includes(phrase), phrase);
assert(html.includes('src="/assets/apps/did-you-lift/app-store-set-log.jpg"'));
assert(html.includes('src="/assets/editorial/training.jpg"'));
assert(html.includes('AI-generated editorial illustration'));
for (const key of guide.sources) assert(html.includes(escape(sources[key][1])), key);
for (const [, body] of guide.sections) assert(!/<form|<input|<script\b|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(body));
const next = createRelatedGuideSelector(guides)(guide);
assert.deepEqual(next.map(item => item.slug), ['how-to-log-gym-workouts','rest-timer-between-sets','workout-volume-explained']);
for (const file of ['guides/index.html','guides/training/index.html','guides/rest-timer-between-sets/index.html']) assert(read(file).includes(path), file);
assert.equal(guides.find(item => item.slug === 'rest-timer-between-sets').modified, undefined, 'Incoming links do not fabricate a new revision date');
assert(read('sitemap.xml').includes(`<loc>${site}${path}</loc>\n    <lastmod>2026-10-21</lastmod>`));
console.log('PASS: original six-set/three-round totals, interrupted versus unknown states, independently timed boundaries, honest app access/flow, native sequence, real preview/stores, dated metadata and reciprocal discovery.');
