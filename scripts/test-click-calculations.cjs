// Dependency-free checks for exact weekly deposits and the free web CSV.
const assert = require('node:assert/strict');
const { parseAmountCents, createPlan, csvForPlan } = require('../assets/savings-plan.js');

for (const [text, expected] of [['1', 100], ['0.50', 50], ['.01', 1], ['1000000', 100000000], ['0', 0]]) {
  assert.equal(parseAmountCents(text), expected, text);
}
for (const text of ['', '-1', '0.001', '1e5', 'Infinity', '1000000.01']) assert.equal(parseAmountCents(text), null, text);
for (const [weeks, start, increase, total] of [[52,100,100,137800],[52,50,50,68900],[52,1000,0,52000],[26,100,100,35100],[13,1,1,91]]) {
  for (const order of ['standard', 'reverse']) {
    const plan = createPlan(weeks, start, increase, 'USD', order);
    assert.equal(plan.totalCents, total);
    assert.equal(plan.rows.length, weeks);
    assert.equal(plan.rows.reduce((sum, row) => sum + row.depositCents, 0), total);
    assert.equal(plan.rows.at(-1).totalCents, total);
    assert.equal(csvForPlan(plan).trim().split('\r\n').length, weeks + 1);
  }
}
assert.equal(csvForPlan(createPlan(13, 1, 1, 'GBP')).trim().split('\r\n').at(-1), '13,0.13,0.91,GBP');
assert.equal(createPlan(52, 100, 100, 'USD').order, 'standard', 'Default keeps the original order');
for (const args of [[52,0,0,'USD'],[12,100,100,'USD'],[52,-1,100,'USD'],[52,1.5,100,'USD'],[52,100,100,'XXX'],[52,100,100,'USD','sideways'],[52,100,100,'USD',null]]) {
  assert.throws(() => createPlan(...args));
}
// Verify every deposit, cumulative balance and CSV row in both orders, including
// zero final deposits, exact pennies, flat amounts and the largest accepted input.
const decimal = cents => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
for (const weeks of [13, 26, 52]) {
  for (const [start, increase] of [[0,1],[1,1],[123,17],[1000,0],[100000000,100000000]]) {
    for (const currency of ['USD', 'EUR', 'GBP', 'TRY']) {
      const standard = createPlan(weeks, start, increase, currency);
      const reverse = createPlan(weeks, start, increase, currency, 'reverse');
      assert.equal(reverse.totalCents, standard.totalCents);
      assert(Number.isSafeInteger(reverse.totalCents));
      assert.deepEqual(reverse.rows.map(row => row.depositCents), standard.rows.map(row => row.depositCents).reverse());
      for (const plan of [standard, reverse]) {
        let running = 0;
        const csvRows = csvForPlan(plan).trim().split('\r\n');
        assert.equal(csvRows[0], 'Week,Deposit,Running total,Currency');
        plan.rows.forEach((row, index) => {
          const expectedDeposit = start + (plan.order === 'reverse' ? weeks - index - 1 : index) * increase;
          running += expectedDeposit;
          assert.deepEqual(row, { week: index + 1, depositCents: expectedDeposit, totalCents: running });
          assert.equal(csvRows[index + 1], `${index + 1},${decimal(expectedDeposit)},${decimal(running)},${currency}`);
        });
      }
    }
  }
}
const classicReverse = createPlan(52, 100, 100, 'USD', 'reverse');
assert.equal(classicReverse.rows[0].depositCents, 5200);
assert.equal(classicReverse.rows.at(-1).depositCents, 100);
assert.equal(classicReverse.rows[3].totalCents, 20200);
assert.equal(classicReverse.rows[12].totalCents, 59800);
console.log('PASS: every standard/reverse exact-cent deposit, cumulative balance and CSV row across 13/26/52 weeks, currencies, flat plans and invalid-input rejection.');
