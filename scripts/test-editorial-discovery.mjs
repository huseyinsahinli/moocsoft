import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { apps, site, sources } from '../content/apps.mjs';
import { editorialFormats, formatFor, homePicks, productPicks, selectHomePicks, selectProductPicks, selectReaderJourneys } from '../content/discovery.mjs';
import { cafePeople, cafeDrinks, cafePrices, cafeAnswer, satisfiesCafeClues } from '../content/math-cafe-mystery.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const cases = [
  ['backup-habit-tracker-before-changing-phones', 'habits', 'story', 'monthly-habit-tracker'],
  ['cafe-logic-grid-puzzle-with-answers', 'math', 'puzzle', 'math-puzzle-strategies'],
  ['website-vs-mobile-app-small-business', 'development', 'decision', 'mobile-app-mvp-checklist'],
];
for (const [slug, topic, format, incoming] of cases) {
  const guide = guides.find(item => item.slug === slug);
  assert.equal(guides.filter(item => item.slug === slug).length, 1);
  assert.equal(guide.topic, topic);
  assert.equal(guide.editorialFormat, format);
  assert.equal(guide.published, '2026-10-12');
  const html = read(`guides/${slug}/index.html`);
  assert(html.includes(`<link rel="canonical" href="${site}/guides/${slug}/">`));
  assert(html.includes(formatFor(guide).label));
  const article = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(node => node['@type'] === 'Article');
  assert.equal(article.headline, guide.title);
  assert.equal(article.description, guide.description);
  assert.equal(article.datePublished, guide.published);
  assert.equal(article.dateModified, guide.published);
  assert.equal(article.inLanguage, 'en');
  assert.equal(article.url, `${site}/guides/${slug}/`);
  for (const key of guide.sources) assert(html.includes(sources[key][1]));
  assert(read(`guides/${incoming}/index.html`).includes(`href="/guides/${slug}/"`));
  assert(read(`guides/${topic}/index.html`).includes(`href="/guides/${slug}/"`));
  assert(read('sitemap.xml').includes(`<loc>${site}/guides/${slug}/</loc>`));
  assert.equal(html.includes('class="app-install"'), topic !== 'development');
}
const backup = read('guides/backup-habit-tracker-before-changing-phones/index.html');
assert(!backup.match(/<div class="guide-hero">([\s\S]*?)<div class="guide-layout">/)[1].includes('/tools/habit-streak-calendar/'));
for (const phrase of ['fictional', 'not a customer testimonial', 'Premium', 'not mean the entire app collects no', 'no file-format or Android-to-iPhone compatibility promise', 'not a backup or an automatic app import']) assert(backup.includes(phrase), phrase);
const decision = read('guides/website-vs-mobile-app-small-business/index.html');
assert(decision.includes('fictional planning examples, not Moocsoft client stories'));
assert(!decision.includes('class="install-link') && !decision.includes('SoftwareApplication'));
assert(decision.includes('href="/hire-flutter-developer/"'));
const puzzle = read('guides/cafe-logic-grid-puzzle-with-answers/index.html');
assert(puzzle.includes('See app features and access'));
assert(puzzle.includes('fictional characters') && puzzle.includes('not an app level'));
assert(puzzle.includes('<summary>Hint 1') && puzzle.includes('<summary>Show the complete café answer'));

const permutations = items => items.length ? items.flatMap((item, i) => permutations(items.filter((_, j) => j !== i)).map(rest => [item, ...rest])) : [[]];
let examined = 0;
const solutions = [];
for (const drinks of permutations(cafeDrinks)) for (const prices of permutations(cafePrices)) {
  examined++;
  const rows = cafePeople.map((person, i) => ({ person, drink: drinks[i], price: prices[i] }));
  const maya = rows.find(row => row.person === 'Maya');
  const noah = rows.find(row => row.person === 'Noah');
  const cocoa = rows.find(row => row.drink === 'cocoa');
  const tea = rows.find(row => row.drink === 'tea');
  const espresso = rows.find(row => row.drink === 'espresso');
  const valid = maya.price < noah.price && cocoa.price === 3 && noah.drink === 'cocoa' && tea.price > espresso.price;
  assert.equal(satisfiesCafeClues(rows), valid);
  if (valid) solutions.push(rows);
}
assert.equal(examined, 36);
assert.equal(solutions.length, 1);
assert.deepEqual(solutions[0], [
  { person: 'Maya', drink: 'espresso', price: 2 },
  { person: 'Noah', drink: 'cocoa', price: 3 },
  { person: 'Iris', drink: 'tea', price: 4 },
]);
assert.deepEqual(cafeAnswer, solutions[0]);
assert.equal(satisfiesCafeClues([cafeAnswer[0], cafeAnswer[0], cafeAnswer[2]]), false);

const library = read('guides/index.html');
assert.equal((library.match(/data-guide-format="/g) || []).length, guides.length);
assert.equal((library.match(/class="reader-journey"/g) || []).length, 3);
assert(library.includes('data-guide-filter hidden') && library.includes('data-guide-no-results hidden'));
assert(library.includes('/assets/guide-discovery.js') && library.includes('/assets/guide-discovery.css'));
assert(library.includes('role="status"') && library.includes('autocomplete="off"'));
for (const key of Object.keys(editorialFormats)) assert(library.includes(`<option value="${key}">`));
assert.deepEqual(selectHomePicks(guides).map(guide => guide.slug), homePicks);
const home = read('index.html').match(/<section class="block" id="guides">([\s\S]*?)<\/section>/)[1];
assert.equal((home.match(/class="guide-card"/g) || []).length, 3);
for (const slug of homePicks) assert(home.includes(`href="/guides/${slug}/"`));
for (const [topic, app] of Object.entries(apps)) {
  const picks = selectProductPicks(guides, topic);
  assert.deepEqual(picks.map(guide => guide.slug), productPicks[topic]);
  for (const file of [`${app.slug}/index.html`, `tools/${app.tool}/index.html`]) {
    const html = read(file);
    const block = html.match(/<section class="(?:wrap )?guide-inline-resources" style="--guide-accent:[^"]+">([\s\S]*?)<\/section>/)[1];
    assert.equal((block.match(/class="guide-card"/g) || []).length, 3, file);
    for (const slug of productPicks[topic]) assert(block.includes(`href="/guides/${slug}/"`), file);
    assert(block.includes(`href="/guides/${topic}/"`), file);
  }
}
assert.equal(selectReaderJourneys(guides).length, 3);
assert.throws(() => selectHomePicks(guides.filter(guide => guide.slug !== homePicks[0])), /Missing/);
assert.throws(() => selectProductPicks(guides, 'development'), /Unknown product/);
assert.throws(() => selectProductPicks([...guides, guides[0]], 'nutrition'), /duplicate/);
assert.throws(() => selectProductPicks(guides.map(guide => guide.slug === productPicks.math[0] ? { ...guide, topic: 'habits' } : guide), 'math'), /Wrong topic/);
assert.throws(() => formatFor({ slug: 'test', editorialFormat: 'testimonial' }), /Unknown editorial format/);
for (const [slug, published, modified] of [
  ['monthly-habit-tracker', '2026-09-22', '2026-10-05'],
  ['math-puzzle-strategies', '2026-09-22', undefined],
  ['mobile-app-mvp-checklist', '2026-10-09', undefined],
]) {
  const guide = guides.find(item => item.slug === slug);
  assert.equal(guide.published, published);
  assert.equal(guide.modified, modified);
}
const js = read('assets/guide-discovery.js');
assert(!/fetch\(|XMLHttpRequest|localStorage|sessionStorage|location\.|history\.|innerHTML|sendBeacon/.test(js));
assert(js.includes("normalize('NFKD')"));
console.log('PASS: three distinct editorial formats, uniquely solved café mystery, real product/service boundaries, curated journeys/picks, static library and local-only filtering.');
