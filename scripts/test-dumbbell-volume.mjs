import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dumbbellGuides, { dumbbellExamples } from '../content/training-dumbbell-volume.mjs';
import { guides } from '../content/index.mjs';
import { site, sources, escape as e } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const [guide] = dumbbellGuides;
assert.equal(dumbbellGuides.length, 1);
assert.equal(guide.slug, 'dumbbell-workout-volume');
assert.equal(guide.title, 'Dumbbell Workout Volume: One Weight or Both?');
assert.equal(guide.topic, 'training');
assert.equal(guide.published, '2026-10-16');
assert.equal(guide.modified, undefined, 'A new guide uses its real publication date');
assert.equal(guide.appPreview, true);
assert.deepEqual(guide.startAction, ['#step-5', 'Copy the matching calculator entries ↓']);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);

// Independently enumerate individual dumbbell movements. Do not use an article
// calculation helper or treat either a per-hand subtotal or planned work as a
// completed both-sides total.
assert.deepEqual(Object.keys(dumbbellExamples), ['paired', 'alternating', 'unequal']);
const paired = dumbbellExamples.paired;
assert.deepEqual([paired.sets, paired.pairedReps, paired.kgPerDumbbell], [3, 10, 12]);
const pairedMovements = [];
for (let set = 0; set < 3; set++) for (let rep = 0; rep < 10; rep++) {
  pairedMovements.push({ side: 'left', kg: 12 }, { side: 'right', kg: 12 });
}
assert.equal(pairedMovements.length, 60);
const pairedBoth = pairedMovements.reduce((sum, movement) => sum + movement.kg, 0);
const pairedLeft = pairedMovements.filter(movement => movement.side === 'left').reduce((sum, movement) => sum + movement.kg, 0);
assert.equal(pairedBoth, 720);
assert.equal(pairedLeft, 360);
assert.equal(paired.totalVolume, pairedBoth);
assert.equal(paired.perHandVolume, pairedLeft);
assert.equal(3 * 20 * 24, 1440);
assert.equal(paired.doubledWrong, 1440);
assert.equal(paired.doubledWrong, pairedBoth * 2, 'Both rep and pair-load doubling is the displayed mistake');

const alternating = dumbbellExamples.alternating;
assert.deepEqual([alternating.sets, alternating.totalReps, alternating.repsPerSide, alternating.kgPerDumbbell], [2, 12, 6, 8]);
const alternatingMovements = [];
for (let set = 0; set < 2; set++) for (let movement = 0; movement < 12; movement++) alternatingMovements.push({ side: movement % 2 === 0 ? 'left' : 'right', kg: 8 });
assert.equal(alternatingMovements.length, 24);
const alternatingBoth = alternatingMovements.reduce((sum, movement) => sum + movement.kg, 0);
const alternatingLeft = alternatingMovements.filter(movement => movement.side === 'left').reduce((sum, movement) => sum + movement.kg, 0);
assert.equal(alternatingBoth, 192);
assert.equal(alternatingLeft, 96);
assert.equal(alternating.totalVolume, alternatingBoth);
assert.equal(alternating.perSideVolume, alternatingLeft);
assert.equal(alternating.doubledWrong, 2 * 12 * 16);
assert.equal(alternating.doubledWrong, 384);

const unequal = dumbbellExamples.unequal;
assert.deepEqual(unequal.leftReps, [8, 8, 7]);
assert.deepEqual(unequal.rightReps, [8, 7, 6]);
assert.equal(unequal.kgPerDumbbell, 10);
const sideSetRows = [
  ['left', 8, 10], ['right', 8, 10],
  ['left', 8, 10], ['right', 7, 10],
  ['left', 7, 10], ['right', 6, 10],
];
assert.equal(sideSetRows.length, 6);
assert.equal(sideSetRows.reduce((sum, [, reps]) => sum + reps, 0), 44);
for (const [side, expected] of [['left', 230], ['right', 210]]) {
  const total = sideSetRows.filter(([name]) => name === side).reduce((sum, [, reps, kg]) => sum + reps * kg, 0);
  assert.equal(total, expected);
  assert.equal(unequal[side + 'Volume'], expected);
}
assert.equal(sideSetRows.reduce((sum, [, reps, kg]) => sum + reps * kg, 0), 440);
assert.equal(unequal.totalVolume, 440);
assert.equal(unequal.mirroredWrong, 230 * 2);
assert.equal(unequal.mirroredWrong, 460);
assert.equal(unequal.mirroredWrong - unequal.totalVolume, 20);
assert.equal(16 * 10, 160, 'The separate native-disclosure check already counts both arms');
assert.equal(16 * 2 * 10, 320, 'This requires a different, per-side record');

const path = '/guides/' + guide.slug + '/';
const html = read('.' + path + 'index.html');
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert(html.includes(`<title>${e(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="${site}${path}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-16');
assert.equal(article.dateModified, '2026-10-16');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, site + path);
assert.equal(article.isAccessibleForFree, true);
assert(graph.some(item => item['@type'] === 'BreadcrumbList'));
assert.equal((html.match(/<div class="guide-table"/g) || []).length, 3);
assert.equal((html.match(/<details data-dumbbell-check>/g) || []).length, 1);
for (const phrase of ['3 × 10 × 24 = 720 kg', '3 × 10 × 12 = 360 kg', '3 × 20 × 24 = 1,440 kg', '2 × 12 × 8 = 192 kg', '96 + 96 = 192 kg', '(23 × 10) + (21 × 10) = 440 kg', 'six side-specific sets and 44 individual repetitions', 'overstating the recorded total by 20 kg', '16 × 10']) assert(html.includes(phrase), phrase);
for (const phrase of ['invented worksheet figures', 'not a routine to follow', 'not mechanical work in joules', 'not an instruction to replace a per-dumbbell target with 24 kg', 'does not promise dedicated left/right fields', 'not an automatic app setting or left/right report', 'not an automatic import into Did You Lift', 'Lifetime Premium', 'require Premium', 'A missing result remains unknown']) assert(html.includes(phrase), phrase);
assert(html.includes('src="/assets/apps/did-you-lift/app-store-set-log.jpg"'));
assert(existsSync(resolve(root, 'assets/apps/did-you-lift/app-store-set-log.jpg')));
for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
for (const [, question] of guide.sections) assert(!/<form|<input|<script\b|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(question), 'Worked text adds no transport or state');
assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]), ['/assets/guide-navigation.js']);
const storeLinks = [...html.matchAll(/<a class="install-link[^\"]*"[^>]*href="([^"]+)"/g)].map(match => new URL(match[1].replaceAll('&amp;', '&')));
assert(storeLinks.length >= 6);
for (const url of storeLinks) {
  if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6808200259$/);
  else {
    assert.equal(url.hostname, 'play.google.com');
    assert.equal(url.searchParams.get('id'), 'com.moocsoft.didyoulift');
    assert.equal(url.searchParams.get('utm_campaign'), 'guides-' + guide.slug);
    assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
  }
}
const related = createRelatedGuideSelector(guides)(guide);
assert.deepEqual(related.map(item => item.slug), ['workout-volume-explained', 'how-to-log-gym-workouts', 'log-warm-up-and-working-sets']);
assert(related.every(item => item.topic === 'training'));
for (const file of ['guides/training/index.html', 'guides/index.html', 'guides/workout-volume-explained/index.html']) assert(read(file).includes(path), file);
assert.equal(guides.find(item => item.slug === 'workout-volume-explained').modified, '2026-10-07', 'Related-link changes do not manufacture a content revision date');
assert.equal(read('sitemap.xml').split(`<loc>${site}${path}</loc>`).length - 1, 1);
assert(read('sitemap.xml').includes(`<loc>${site}${path}</loc>\n    <lastmod>2026-10-16</lastmod>`));
console.log('PASS: independent per-movement dumbbell arithmetic, doubled/mirrored counterexamples, six-side-set scope, static native check, actual dates, real app preview/access, attribution and reciprocal reading links.');
