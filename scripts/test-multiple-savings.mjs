// Verify original examples independently after building the static guides.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import guides, { goalPlan, monthlyDeposits } from '../content/savings-multiple.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const [guide] = guides;
assert.equal(guides.length, 1);
assert.equal(guide.topic, 'savings');
assert.equal(guide.published, '2026-10-10');
assert.equal(guide.appPreview, true);
assert.deepEqual(goalPlan.map(goal => goal.target - goal.saved), [400, 900, 800]);
assert.deepEqual(goalPlan.map(goal => (goal.target - goal.saved) / goal.dates), [100, 150, 200]);
assert.equal(100 + 150 + 200 - 300, 150);
assert.equal(400 + 900 + 800 - 6 * 300, 300);
assert.deepEqual(goalPlan.map(goal => goal.revisedDeposit), [100, 150, 50]);
assert.equal(100 + 150 + 50, 300);
// Enumerate deposits to verify the revised completion dates, not just division.
assert.deepEqual(goalPlan.map(goal => {
  let balance = goal.saved;
  let count = 0;
  while (balance < goal.target) { balance += goal.revisedDeposit; count++; }
  assert.equal(balance, goal.target);
  return count;
}), [4, 6, 16]);
const balances = goalPlan.map(goal => goal.saved);
const cumulative = [];
for (const deposits of monthlyDeposits) {
  deposits.forEach((amount, index) => { balances[index] += amount; });
  cumulative.push(balances.reduce((sum, balance) => sum + balance, 0));
}
assert.deepEqual(cumulative, [900, 1150]);
assert.deepEqual(balances, [400, 550, 200]);
assert.deepEqual(goalPlan.map((goal, index) => (goal.target - balances[index]) / ([4, 6, 16][index] - 2)), [100, 162.5, 50]);
assert.equal(100 + 162.5 + 50, 312.5);
assert.equal(312.5 - 300, 12.5);
assert.equal(300 + 250, 550);

const html = read(`guides/${guide.slug}/index.html`);
assert(html.includes(`<title>${guide.title} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="https://moocsoft.net/guides/${guide.slug}/">`));
assert.match(html, /"datePublished":"2026-10-10"/);
assert.match(html, /"dateModified":"2026-10-10"/);
for (const total of ['$450 per month', '$150 monthly shortfall', '16 contribution dates', '$1,150', '$312.50']) assert(html.includes(total), total);
assert(html.includes('not every possible allocation'));
assert(html.includes('all $2,100 of the original gaps'));
assert(html.includes('six $300 deposits provide only $1,800'));
assert(html.includes('leaves a $300 gap'));
assert(html.includes('unused part of the contribution limit is not saved money'));
assert(html.includes('app does not hold or transfer money'));
assert(html.includes('Premium features'));
assert(html.includes('original website example'));
assert(html.includes('id6450431254'));
assert(html.includes('com.moocsoft.goal_tracker'));
assert(html.includes('utm_campaign=guides-track-multiple-savings-goals'));
assert(html.includes('consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/'));
assert.equal((html.match(/<div class="guide-table"/g) || []).length, 3);
for (const slug of ['calculate-savings-goal-contributions', 'sinking-funds-vs-emergency-fund', 'savings-goal-tracker-app-vs-spreadsheet']) assert(html.includes(`/guides/${slug}/`), slug);
assert(read('guides/savings-goal-tracker-app-vs-spreadsheet/index.html').includes(`/guides/${guide.slug}/`));
assert(read('guides/savings/index.html').includes(`/guides/${guide.slug}/`));
assert(read('guides/index.html').includes(`/guides/${guide.slug}/`));
assert(read('sitemap.xml').includes(`<loc>https://moocsoft.net/guides/${guide.slug}/</loc>`));
console.log('PASS: independent savings allocations, completion dates, actual ledger and revised budget; honest product limits, dated metadata, store attribution and reciprocal discovery.');
