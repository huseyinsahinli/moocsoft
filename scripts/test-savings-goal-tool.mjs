import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { parseGoalAmount, createGoalPlan, csvForGoalPlan } = require('../assets/savings-goal-tool.js');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const [value, cents] of [['0', 0], ['1', 100], ['1.01', 101], ['.02', 2], ['0.9', 90], ['9999999.99', 999999999], [' 200.00 ', 20000]]) {
  assert.equal(parseGoalAmount(value), cents, value);
}
for (const value of ['', '.', '-1', '+2', '1e3', '1,000', '1.000', 'NaN', 'Infinity', '10000000', '=1+1', '0x10', '1.', '00000000', '1 00']) {
  assert.equal(parseGoalAmount(value), null, value);
}
const example = createGoalPlan(100001, 20000, 12, 'USD', 'monthly');
assert.equal(example.remainingCents, 80001);
assert.equal(example.regularCents, 6667);
assert.equal(example.finalCents, 6664);
assert.equal(example.finalBalanceCents, 100001);
assert.equal(example.positiveDeposits, 12);
assert.deepEqual(example.rows.slice(0, 11).map(row => row.contributionCents), Array(11).fill(6667));
assert.equal(6666 * 12, 79992, 'Twelve 66.66 deposits leave 9 cents of the worked gap');
assert.equal(csvForGoalPlan(example).split('\r\n').at(-2), '12,66.64,1000.01,0.00,USD,Monthly');

// Independent integer-division fixture, including a gap smaller than the slot count.
for (const target of [0, 1, 2, 99, 100, 101, 100001, 999999999]) {
  for (const saved of [0, 1, 100, 20000, 999999999]) {
    for (const count of [1, 2, 3, 12, 26, 52, 520]) {
      for (const currency of ['USD', 'EUR', 'GBP']) {
        for (const cadence of ['weekly', 'biweekly', 'monthly']) {
          const plan = createGoalPlan(target, saved, count, currency, cadence);
          const gap = target > saved ? target - saved : 0;
          const ceiling = Math.floor(gap / count) + (gap % count === 0 ? 0 : 1);
          let cumulative = saved;
          let remaining = gap;
          assert.equal(plan.regularCents, ceiling);
          assert.equal(plan.rows.length, count);
          for (let i = 0; i < count; i++) {
            const contribution = remaining < ceiling ? remaining : ceiling;
            cumulative += contribution;
            remaining -= contribution;
            assert.deepEqual(plan.rows[i], { deposit: i + 1, contributionCents: contribution, cumulativeCents: cumulative, remainingCents: remaining });
            assert(Number.isSafeInteger(cumulative));
          }
          assert.equal(remaining, 0);
          assert.equal(cumulative, Math.max(target, saved));
          assert.equal(plan.rows.reduce((sum, row) => sum + row.contributionCents, 0), gap);
          const lines = csvForGoalPlan(plan).trim().split('\r\n');
          assert.equal(lines.length, count + 1);
          assert.equal(lines[0], 'Deposit,Contribution,Planned balance,Remaining to target,Currency,Cadence');
          assert(lines.slice(1).every(line => /^\d+,\d+\.\d{2},\d+\.\d{2},\d+\.\d{2},(USD|EUR|GBP),(Weekly|Every two weeks|Monthly)$/.test(line)));
        }
      }
    }
  }
}
assert.deepEqual(createGoalPlan(2, 0, 10, 'EUR', 'weekly').rows.map(row => row.contributionCents), [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
for (const args of [[-1,0,2,'USD','weekly'], [1.5,0,2,'USD','weekly'], [1000000000,0,2,'USD','weekly'], [100,-1,2,'USD','weekly'], [100,0,0,'USD','weekly'], [100,0,521,'USD','weekly'], [100,0,1.5,'USD','weekly'], [100,0,2,'TRY','weekly'], [100,0,2,'USD','daily'], [100,0,2,'USD','toString']]) {
  assert.throws(() => createGoalPlan(...args), String(args));
}

const html = readFileSync(resolve(root, 'tools/savings-goal-calculator/index.html'), 'utf8');
const js = readFileSync(resolve(root, 'assets/savings-goal-tool.js'), 'utf8');
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, /<link rel="canonical" href="https:\/\/moocsoft.net\/tools\/savings-goal-calculator\/">/);
assert.match(html, /<form data-goal-form hidden novalidate/);
assert.match(html, /<section class="goal-output" data-goal-output hidden/);
assert.match(html, /800\.01 ÷ 12 = 66\.6675/);
assert.match(html, /final deposit is <strong>USD 66\.64/);
assert.match(html, /not a Frugal export or an automatic import/);
assert.match(html, /Currency changes the label only/);
assert.match(html, /CFPB savings-plan toolkit/);
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
assert.deepEqual(graph.map(node => node['@type']), ['WebPage', 'BreadcrumbList']);
assert.equal(graph[0].isAccessibleForFree, true);
for (const href of [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1])) {
  const url = new URL(href.replaceAll('&amp;', '&'), 'https://moocsoft.net');
  if (url.hostname === 'play.google.com') {
    assert.equal(url.searchParams.get('id'), 'com.moocsoft.goal_tracker');
    assert.equal(url.searchParams.get('utm_campaign'), 'tools-savings-goal-calculator');
  } else if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6450431254$/);
  else if (url.origin === 'https://moocsoft.net' && url.pathname.startsWith('/guides/')) assert(existsSync(resolve(root, '.' + url.pathname, 'index.html')), href);
}
assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|URLSearchParams|location\./);
assert.doesNotMatch(js, /\.innerHTML\s*=/);
console.log('PASS: savings goal exact-cent schedules/CSV across currencies, frequencies, tiny gaps, fully funded/overfunded targets, invalid inputs, static SEO and privacy boundaries.');
