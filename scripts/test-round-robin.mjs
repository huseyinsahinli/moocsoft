// Independent pairing/schedule checks; run after scripts/build-guides.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import guides, { matchCountExamples, sixPlayerRounds } from '../content/math-round-robin.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [guide] = guides;
assert.equal(guides.length, 1);
assert.equal(guide.topic, 'math');
assert.equal(guide.published, '2026-10-09');
assert.equal(guide.appPreview, true);

function enumeratePairs(players) {
  const pairs = [];
  for (let first = 0; first < players; first++) {
    for (let second = first + 1; second < players; second++) pairs.push([first, second]);
  }
  return pairs;
}
for (let players = 0; players <= 32; players++) {
  assert(players * (players - 1) / 2 === enumeratePairs(players).length);
}
for (const [players, expected] of matchCountExamples) {
  assert.equal(enumeratePairs(players).length, expected);
  assert(guide.sections.some(([, body]) => body.includes(`<th scope="row">${players}</th><td>${players} × ${players - 1} ÷ 2</td><td>${expected}</td>`)));
}

// Verify all six questions by enumeration, not by repeating their formula.
assert.deepEqual([4, 5, 6, 8].map(players => enumeratePairs(players).length), [6, 10, 15, 28]);
assert.equal(enumeratePairs(6).flatMap(pair => [pair, [...pair].reverse()]).length, 30);
assert.deepEqual(Array.from({ length: 33 }, (_, n) => n).filter(n => enumeratePairs(n).length === 28), [8]);
assert.equal(Array.from({ length: 33 }, (_, n) => n).some(n => enumeratePairs(n).length === 7), false);
assert.equal(enumeratePairs(4).length * 2, 12);

const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
const expectedPairs = enumeratePairs(6).map(pair => pair.map(index => labels[index]).join('')).sort();
const actualPairs = [];
assert.equal(sixPlayerRounds.length, 5);
for (const round of sixPlayerRounds) {
  assert.equal(round.length, 3);
  assert.deepEqual(round.flat().sort(), labels);
  for (const pair of round) actualPairs.push([...pair].sort().join(''));
}
assert.deepEqual(actualPairs.sort(), expectedPairs);
assert.equal(new Set(actualPairs).size, 15);

const html = readFileSync(resolve(root, `guides/${guide.slug}/index.html`), 'utf8');
assert(html.includes(`<title>${guide.title} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="https://moocsoft.net/guides/${guide.slug}/">`));
assert.match(html, /"datePublished":"2026-10-09"/);
assert.match(html, /"dateModified":"2026-10-09"/);
assert.equal((html.match(/<summary>[1-6]\. /g) || []).length, 6);
for (const answer of ['6', '10', '28', '30']) assert(html.includes(`<strong>${answer} matches.</strong>`));
assert(html.includes('<strong>No: 15 matches.</strong>'));
assert(html.includes('<strong>8 players.</strong>'));
for (const round of sixPlayerRounds) for (const pair of round) assert(html.includes(pair.join('–')));
assert.match(html, /original website examples, not app levels or an app tournament planner/);
assert.match(html, /app does not organize the round-robin schedule/);
assert.match(html, /id6449851642/);
assert.match(html, /com\.moocsoft\.math_puzzle/);
assert.match(html, /utm_campaign=guides-round-robin-match-count/);
for (const related of ['count-rectangles-in-a-grid', 'math-puzzle-strategies', 'play-math-games-with-friends']) {
  assert(html.includes(`/guides/${related}/`));
}
const incoming = readFileSync(resolve(root, 'guides/play-math-games-with-friends/index.html'), 'utf8');
assert(incoming.includes(`/guides/${guide.slug}/`));
const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
assert(sitemap.includes(`<loc>https://moocsoft.net/guides/${guide.slug}/</loc>`));
console.log('PASS: independently enumerated pair counts, all six answers, unique complete schedule, dates/canonical, honest product boundaries, attribution and reciprocal links.');
