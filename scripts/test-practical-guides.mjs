// Original illustrative fixtures and public metadata; no private account data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { site, sources } from '../content/apps.mjs';
import { noSpendDiary, noSpendFollowUp } from '../content/savings-no-spend.mjs';
import { shiftHabitWeek, shiftHabitRule, shiftHabitOvernightExample } from '../content/habits-shifts.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const cases = [
  ['7-day-no-spend-challenge', 'savings', 'savings-goal-tracker-app-vs-spreadsheet', ['savings-goal-tracker-app-vs-spreadsheet', 'savings-tracker-irregular-income', 'calculate-savings-goal-contributions']],
  ['habit-tracker-for-shift-work', 'habits', 'monthly-habit-tracker', ['daily-vs-weekly-habit-tracking', 'habit-streak-vs-completion-rate', 'weekly-reset-checklist']],
  ['mobile-app-handover-checklist', 'development', 'mobile-app-mvp-checklist', ['mobile-app-mvp-checklist', 'offline-first-flutter-app-local-storage-cloud-sync', 'flutter-development-service']],
];
const related = createRelatedGuideSelector(guides);
for (const [slug, topic, incoming, next] of cases) {
  const matching = guides.filter(guide => guide.slug === slug);
  assert.equal(matching.length, 1);
  const guide = matching[0];
  assert.equal(guide.topic, topic);
  assert.equal(guide.published, '2026-10-11');
  assert.equal(guide.sections.length, 6);
  assert.equal(guide.faq.length, 4);
  assert.deepEqual(related(slug).map(item => item.slug), next);
  const html = read(`guides/${slug}/index.html`);
  assert(html.includes(`<link rel="canonical" href="${site}/guides/${slug}/">`));
  const nodes = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const article = nodes.find(node => node['@type'] === 'Article');
  assert.equal(article.headline, guide.title);
  assert.equal(article.datePublished, guide.published);
  assert.equal(article.dateModified, guide.published);
  for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
  assert(read(`guides/${incoming}/index.html`).includes(`href="/guides/${slug}/"`));
  assert(read(`guides/${topic}/index.html`).includes(`href="/guides/${slug}/"`));
  assert(read('sitemap.xml').includes(`<loc>${site}/guides/${slug}/</loc>\n    <lastmod>2026-10-11</lastmod>`));
  assert.equal(guide.appPreview, topic === 'development' ? undefined : true);
  assert.equal(html.includes('class="app-install"'), topic !== 'development');
}

// Recompute reductions from costs, excluding delayed/future/essential entries.
assert.equal(noSpendDiary.length, 7);
const costReduction = noSpendDiary.reduce((sum, row) => {
  const expected = ['avoided', 'replaced'].includes(row.kind) ? row.comparisonCost - row.actualCost : 0;
  assert.equal(row.reduced, expected);
  assert(row.reserved >= 0 && row.reserved <= expected);
  return sum + expected;
}, 0);
const reserved = noSpendDiary.reduce((sum, row) => sum + row.reserved, 0);
assert.equal(costReduction, 31);
assert.equal(reserved, 27);
assert.equal(reserved - noSpendFollowUp.goalWithdrawal, 18);
assert.equal(costReduction - noSpendFollowUp.additionalCost, 22);
const noSpendHtml = read('guides/7-day-no-spend-challenge/index.html');
for (const phrase of ['$31', '$27', '$18', '$22', 'Deferred', 'manual', 'Premium']) assert(noSpendHtml.includes(phrase));

assert.equal(shiftHabitWeek.length, 7);
const planned = shiftHabitWeek.filter(day => day.planned);
const completed = planned.filter(day => day.pagesRead >= shiftHabitRule.pagesForCompletion);
assert.deepEqual(planned.map(day => day.day), [1, 2, 3, 6, 7]);
assert.deepEqual(completed.map(day => day.day), [1, 2, 3, 7]);
assert.equal(completed.length / planned.length * 100, 80);
assert.equal(Math.round(completed.length / shiftHabitWeek.length * 100), 57);
const overnight = shiftHabitOvernightExample;
assert.equal(new Date(`${overnight.shiftStartDate}T12:00:00Z`).getUTCDay(), 1);
assert.equal(new Date(`${overnight.actionDate}T12:00:00Z`).getUTCDay(), 2);
assert.equal(overnight.checkInDate, overnight.actionDate);
const habitHtml = read('guides/habit-tracker-for-shift-work/index.html');
for (const phrase of ['80%', '57%', 'October 20', 'not an automatic shift planner', 'Premium']) assert(habitHtml.includes(phrase));

const handoverHtml = read('guides/mobile-app-handover-checklist/index.html');
for (const phrase of ['fresh checkout', 'upload key', 'app signing key', 'test environment', 'private signing keys', 'contractual rights']) assert(handoverHtml.includes(phrase));
assert(!handoverHtml.includes('SoftwareApplication'));
assert(handoverHtml.includes('aria-label="Discuss a Flutter project"'));

// Link additions do not manufacture freshness for existing guides.
for (const [slug, published, modified] of [
  ['monthly-habit-tracker', '2026-09-22', '2026-10-05'],
  ['savings-goal-tracker-app-vs-spreadsheet', '2026-09-22', '2026-09-22'],
  ['mobile-app-mvp-checklist', '2026-10-09', '2026-10-09'],
]) {
  const guide = guides.find(item => item.slug === slug);
  assert.equal(guide.published, published);
  assert.equal(guide.modified || guide.published, modified);
}
console.log('PASS: Three practical guides, independent diary/shift arithmetic, dates, product/service boundaries, references, reciprocal links and sitemap.');
