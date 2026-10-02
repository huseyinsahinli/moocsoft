// Dependency-free checks for exact weekly deposits and the free web CSV.
const assert = require('node:assert/strict');
const { parseAmountCents, createPlan, csvForPlan } = require('../assets/savings-plan.js');

for (const [text, expected] of [['1', 100], ['0.50', 50], ['.01', 1], ['1000000', 100000000], ['0', 0]]) {
  assert.equal(parseAmountCents(text), expected, text);
}
for (const text of ['', '-1', '0.001', '1e5', 'Infinity', '1000000.01']) assert.equal(parseAmountCents(text), null, text);
for (const [weeks, start, increase, total] of [[52,100,100,137800],[52,50,50,68900],[52,1000,0,52000],[26,100,100,35100],[13,1,1,91]]) {
  const plan = createPlan(weeks, start, increase, 'USD');
  assert.equal(plan.totalCents, total);
  assert.equal(plan.rows.length, weeks);
  assert.equal(plan.rows.reduce((sum, row) => sum + row.depositCents, 0), total);
  assert.equal(plan.rows.at(-1).totalCents, total);
  assert.equal(csvForPlan(plan).trim().split('\r\n').length, weeks + 1);
}
assert.equal(csvForPlan(createPlan(13, 1, 1, 'GBP')).trim().split('\r\n').at(-1), '13,0.13,0.91,GBP');
for (const args of [[52,0,0,'USD'],[12,100,100,'USD'],[52,-1,100,'USD'],[52,1.5,100,'USD'],[52,100,100,'XXX']]) {
  assert.throws(() => createPlan(...args));
}
assert(Number.isSafeInteger(createPlan(52,100000000,100000000,'USD').totalCents));
console.log('PASS: exact-cent plans, presets, 13/26/52 weeks, CSV amounts and invalid-input rejection.');
