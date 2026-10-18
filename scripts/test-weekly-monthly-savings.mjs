import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import weeklyGuides, { weeklySavingsExample as example } from '../content/savings-weekly-monthly.mjs';
import { guides } from '../content/index.mjs';
import { published, site, sources } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = weeklyGuides;
const route = `/guides/${guide.slug}/`;
assert.equal(weeklyGuides.length, 1);
assert.equal(guide.slug, 'weekly-to-monthly-savings');
assert.equal(guide.topic, 'savings');
assert.equal(guide.published, '2026-10-18');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);

// Independently enumerate UTC calendar days instead of importing a date-count function.
const fridays = [];
for (let date = new Date('2027-01-01T00:00:00Z'); date.getUTCFullYear() === 2027; date.setUTCDate(date.getUTCDate() + 1)) {
  if (date.getUTCDay() === 5) fridays.push(date.toISOString().slice(0, 10));
}
assert.equal(fridays.length, 53);
assert.equal(fridays[0], '2027-01-01');
assert.equal(fridays.at(-1), '2027-12-31');
assert.deepEqual(example.months[0].dates, fridays.filter(date => date.startsWith('2027-01')));
assert.deepEqual(example.months[1].dates, fridays.filter(date => date.startsWith('2027-02')));
assert.equal(example.depositCents, 2500);
assert.equal(example.startingCents, 10000);
assert.deepEqual(example.months.map(month => month.dates.length), [5, 4]);
assert.deepEqual(example.months.map(month => month.actualCents.reduce((sum, amount) => sum + amount, 0)), [10000, 10000]);
assert.deepEqual(example.months.map(month => month.dates.length * example.depositCents), [12500, 10000]);
const noDeposit = example.months.flatMap(month => month.dates.filter((_, index) => month.actualCents[index] === 0));
assert.deepEqual(noDeposit, ['2027-01-15']);
assert.equal(example.startingCents + example.months.flatMap(month => month.actualCents).reduce((sum, amount) => sum + amount, 0), 30000);
assert.deepEqual(example.comparisons.map(plan => plan.count), [4 * 12, 52, fridays.length]);
assert.deepEqual(example.comparisons.map(plan => plan.count * example.depositCents), [120000, 130000, 132500]);
assert.equal(52 * 2500 - 48 * 2500, 10000);
assert.equal(Math.round(52 * 2500 / 12), 10833);
assert.equal(Math.round(fridays.length * 2500 / 12), 11042);
assert.equal(10833 * 12, 129996, 'Monthly rounding is not an exact $1300 schedule');

const html = read(`guides/${guide.slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
assert.equal((html.match(/<h1>/g) || []).length, 1);
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-18');
assert.equal(article.dateModified, '2026-10-18');
assert.equal(article.url, site + route);
assert.equal(article.inLanguage, 'en');
for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
for (const text of ['invented $25-every-Friday', 'not a real payroll schedule', 'bank-transfer promise',
  '$108.33', '$110.42', '$1,299.96', '$1,325', '$300', 'No contribution; do not add $25',
  'does not read your payroll calendar', 'not an automatic scheduling or import feature',
  'ads and feature limits', 'Premium', 'Official iPhone store screenshot']) assert(html.includes(text), text);
assert.equal((html.match(/<caption>/g) || []).length, 4);
for (const [question, answer] of guide.faq) assert(html.includes(question) && html.includes(answer));
assert(html.includes('src="/assets/apps/frugal/goals.png"'));
assert(html.includes('id6450431254') && html.includes('id=com.moocsoft.goal_tracker'));
assert(html.includes('utm_campaign=guides-' + guide.slug));
assert(!html.includes('Open the free 52-week'), 'No misleading challenge calculator CTA');
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(item => item.slug), [
  'calculate-savings-goal-contributions', 'biweekly-savings-plan', 'track-multiple-savings-goals',
]);
for (const file of ['guides/savings/index.html', 'guides/index.html', 'guides/track-multiple-savings-goals/index.html']) assert(read(file).includes(route), file);
const incoming = guides.find(item => item.slug === 'track-multiple-savings-goals');
assert.equal(incoming.published || published, '2026-10-10');
assert.equal(incoming.modified, undefined, 'A reciprocal link must not reset the older guide date');
assert(read('sitemap.xml').includes(`<loc>${site}${route}</loc>\n    <lastmod>2026-10-18</lastmod>`));
console.log('PASS: independent 2027 Friday enumeration, average-vs-calendar totals, missed-deposit ledger, original dates, Frugal stores/access/preview, internal links and sitemap.');
