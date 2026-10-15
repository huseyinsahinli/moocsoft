(function () {
  'use strict';

  const MAX_CENTS = 999999999;
  const currencies = ['USD', 'EUR', 'GBP'];
  const cadences = { weekly: 'Weekly', biweekly: 'Every two weeks', monthly: 'Monthly' };

  function parseGoalAmount(text) {
    const value = String(text).trim();
    if (!/^(?:\d{1,7}(?:\.\d{1,2})?|\.\d{1,2})$/.test(value)) return null;
    const parts = value.split('.');
    const cents = Number(parts[0] || '0') * 100 + Number((parts[1] || '').padEnd(2, '0'));
    return Number.isSafeInteger(cents) && cents <= MAX_CENTS ? cents : null;
  }

  function createGoalPlan(targetCents, savedCents, deposits, currency, cadence) {
    if (![targetCents, savedCents].every(value => Number.isSafeInteger(value) && value >= 0 && value <= MAX_CENTS)
        || !Number.isInteger(deposits) || deposits < 1 || deposits > 520
        || !currencies.includes(currency) || !Object.hasOwn(cadences, cadence)) {
      throw new Error('Use valid nonnegative amounts, 1–520 future deposits and a supported currency and cadence.');
    }
    const remainingCents = Math.max(0, targetCents - savedCents);
    const regularCents = Math.ceil(remainingCents / deposits);
    let outstanding = remainingCents;
    let cumulativeCents = savedCents;
    const rows = Array.from({ length: deposits }, (_, index) => {
      const contributionCents = Math.min(regularCents, outstanding);
      outstanding -= contributionCents;
      cumulativeCents += contributionCents;
      return { deposit: index + 1, contributionCents, cumulativeCents, remainingCents: outstanding };
    });
    const positiveRows = rows.filter(row => row.contributionCents > 0);
    return { targetCents, savedCents, deposits, currency, cadence, remainingCents, regularCents,
      finalCents: positiveRows.at(-1)?.contributionCents || 0, positiveDeposits: positiveRows.length,
      finalBalanceCents: cumulativeCents, rows };
  }

  function decimalAmount(cents) {
    return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
  }

  function csvForGoalPlan(plan) {
    // Only fixed labels, validated numbers and enumerated currency/cadence enter the CSV.
    const lines = ['Deposit,Contribution,Planned balance,Remaining to target,Currency,Cadence'];
    for (const row of plan.rows) {
      lines.push([row.deposit, decimalAmount(row.contributionCents), decimalAmount(row.cumulativeCents),
        decimalAmount(row.remainingCents), plan.currency, cadences[plan.cadence]].join(','));
    }
    return lines.join('\r\n') + '\r\n';
  }

  function initializeGoalPlanner(root) {
    const form = root.querySelector('[data-goal-form]');
    const output = root.querySelector('[data-goal-output]');
    const error = root.querySelector('[data-goal-error]');
    const status = root.querySelector('[data-goal-status]');
    const summary = root.querySelector('[data-goal-summary]');
    const body = root.querySelector('[data-goal-rows]');
    const exportButton = root.querySelector('[data-goal-export]');
    if (!form || !output || !error || !status || !summary || !body || !exportButton) return false;
    const names = ['target', 'saved', 'deposits', 'currency', 'cadence'];
    const fields = Object.fromEntries(names.map(name => [name, form.querySelector(`[name="${name}"]`)]));
    if (names.some(name => !fields[name])) return false;
    const doc = form.ownerDocument;
    let plan = null;
    const money = cents => new Intl.NumberFormat('en', { style: 'currency', currency: plan.currency, currencyDisplay: 'code' }).format(cents / 100);
    const invalidate = () => {
      const hadResult = plan !== null;
      plan = null;
      output.hidden = true;
      exportButton.disabled = true;
      body.replaceChildren();
      error.textContent = '';
      names.forEach(name => fields[name].removeAttribute('aria-invalid'));
      status.textContent = hadResult ? 'Inputs changed. Calculate again for an updated plan and CSV.' : '';
    };
    form.addEventListener('input', invalidate);
    form.addEventListener('change', invalidate);
    form.addEventListener('submit', event => {
      event.preventDefault();
      invalidate();
      const target = parseGoalAmount(fields.target.value);
      const saved = parseGoalAmount(fields.saved.value);
      const countText = fields.deposits.value.trim();
      const count = /^\d{1,3}$/.test(countText) ? Number(countText) : NaN;
      const invalid = target === null ? ['target', 'Enter a target from 0 to 9,999,999.99, using a decimal point and no currency symbol or commas.']
        : saved === null ? ['saved', 'Enter savings from 0 to 9,999,999.99, using a decimal point and no currency symbol or commas.']
          : !Number.isInteger(count) || count < 1 || count > 520 ? ['deposits', 'Enter a whole number of future deposits from 1 to 520.']
            : !currencies.includes(fields.currency.value) ? ['currency', 'Choose USD, EUR or GBP.']
              : !Object.hasOwn(cadences, fields.cadence.value) ? ['cadence', 'Choose a listed deposit frequency.'] : null;
      if (invalid) {
        error.textContent = invalid[1];
        fields[invalid[0]].setAttribute('aria-invalid', 'true');
        fields[invalid[0]].focus();
        return;
      }
      plan = createGoalPlan(target, saved, count, fields.currency.value, fields.cadence.value);
      summary.textContent = plan.remainingCents === 0
        ? `Your entered savings already meet or exceed the target. No additional contribution is required. The plan does not move or reallocate your money.`
        : `Remaining gap: ${money(plan.remainingCents)}. Plan up to ${money(plan.regularCents)} per deposit (${cadences[plan.cadence].toLowerCase()}). The last positive contribution is ${money(plan.finalCents)} at deposit ${plan.positiveDeposits} of ${plan.deposits}.`;
      const fragment = doc.createDocumentFragment();
      for (const row of plan.rows) {
        const tr = doc.createElement('tr');
        const index = doc.createElement('th');
        index.scope = 'row';
        index.textContent = String(row.deposit);
        tr.appendChild(index);
        for (const cents of [row.contributionCents, row.cumulativeCents, row.remainingCents]) {
          const td = doc.createElement('td');
          td.textContent = money(cents);
          tr.appendChild(td);
        }
        fragment.appendChild(tr);
      }
      body.appendChild(fragment);
      output.hidden = false;
      exportButton.disabled = false;
      status.textContent = `Plan ready: ${plan.deposits} deposit slots, ${plan.positiveDeposits} positive contributions. Nothing is saved or sent.`;
    });
    exportButton.addEventListener('click', () => {
      if (!plan) return;
      const url = URL.createObjectURL(new Blob([csvForGoalPlan(plan)], { type: 'text/csv;charset=utf-8' }));
      const link = doc.createElement('a');
      link.href = url;
      link.download = 'savings-goal-plan.csv';
      doc.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    form.hidden = false;
    return true;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseGoalAmount, createGoalPlan, csvForGoalPlan, initializeGoalPlanner };
  }
  if (typeof document !== 'undefined') initializeGoalPlanner(document);
}());
