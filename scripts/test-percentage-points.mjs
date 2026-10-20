// Original exercise verification; no user scores or claims about real survey changes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import percentageGuides, { percentagePractice } from '../content/math-percentage-points.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, escape } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = percentageGuides;
const route = `/guides/${guide.slug}/`;
assert.equal(percentageGuides.length, 1);
assert.equal(guide.slug, 'percentage-change-vs-percentage-points');
assert.equal(guide.topic, 'math');
assert.equal(guide.editorialFormat, 'puzzle');
assert.equal(guide.published, '2026-10-20');
assert.equal(guide.modified, undefined);
assert.equal(guide.showToolAction, false);
assert.equal(guide.appPreview, true);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);
assert.equal(percentagePractice.length, 6);
assert.deepEqual(percentagePractice.map(row => row.id), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(percentagePractice.slice(0, 3).map(row => [row.from, row.to, row.points, row.relative]), [
  [20, 30, 10, 50], [80, 60, -20, -25], [12, 15, 3, 25],
]);
// Independently recover end values from point differences and relative multipliers.
for (const row of percentagePractice.filter(row => row.kind === 'rate')) {
  assert(row.from > 0);
  assert.equal(row.from + row.points, row.to);
  assert.equal(row.from * (100 + row.relative), row.to * 100);
}
const wording = percentagePractice.find(row => row.kind === 'wording');
assert.deepEqual([wording.from, wording.growth, wording.relativeResult, wording.pointResult], [50, 10, 55, 60]);
assert.equal(wording.relativeResult * 100, wording.from * (100 + wording.growth));
assert.equal(wording.pointResult - wording.from, wording.growth);
assert.notEqual(wording.relativeResult, wording.pointResult);
const zero = percentagePractice.find(row => row.kind === 'zero');
assert.equal(zero.from, 0);
assert.equal(zero.points, zero.to);
assert.equal(zero.relative, null, 'No finite relative result is supplied for a zero original value');
const counts = percentagePractice.find(row => row.kind === 'count');
assert.equal(counts.beforeCount * 100, counts.beforeRate * counts.beforeTotal);
assert.equal(counts.afterCount * 100, counts.afterRate * counts.afterTotal);
assert.deepEqual([counts.beforeCount, counts.afterCount], [150, 140]);
assert(counts.afterRate > counts.beforeRate && counts.afterCount < counts.beforeCount);
assert.equal(40 * 125, 50 * 100);
assert.equal(50 * 80, 40 * 100, 'The reverse relative change uses the new starting base');
assert.equal(2 * 150, 3 * 100);

const html = read(`guides/${guide.slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
assert.equal((html.match(/<h1>/g) || []).length, 1);
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-20');
assert.equal(article.dateModified, '2026-10-20');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, site + route);
for (const key of guide.sources) assert(html.includes(escape(sources[key][1])), key);
for (const row of percentagePractice) {
  assert(html.includes(`data-percentage-practice="${row.id}"`));
  assert(html.includes(escape(row.question)));
  assert(html.includes(row.answer));
}
assert.equal((html.match(/data-percentage-practice=/g) || []).length, 6);
assert.equal((html.match(/<caption>/g) || []).length, 2);
for (const text of ['not survey findings', 'original website exercises', 'not Math Riddles levels',
  'undefined', 'different totals', 'not a precise substitute', 'no answers are sent or scores stored',
  'dedicated percentage-points course', 'ads and optional in-app purchases', 'Premium']) assert(html.includes(text), text);
for (const [question, answer] of guide.faq) assert(html.includes(escape(question)) && html.includes(escape(answer)));
assert(html.includes('id6449851642') && html.includes('com.moocsoft.math_puzzle'));
assert(html.includes('utm_campaign=guides-' + guide.slug));
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(item => item.slug), [
  'mental-math-games-for-adults', 'compare-fractions-without-decimals', 'mental-multiplication-tricks',
]);
for (const file of ['guides/index.html', 'guides/math/index.html', 'guides/mental-math-games-for-adults/index.html']) assert(read(file).includes(route));
assert.equal(guides.find(item => item.slug === 'mental-math-games-for-adults').published, '2026-09-22');
assert.equal(guides.find(item => item.slug === 'mental-math-games-for-adults').modified, undefined);
assert(read('sitemap.xml').includes(`<loc>${site}${route}</loc>\n    <lastmod>2026-10-20</lastmod>`));
console.log('PASS: six independently checked rate/wording/zero/count exercises, reversed bases, native answers, source and app boundaries, dated metadata, store attribution, incoming links and sitemap.');
