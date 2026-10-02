(() => {
  'use strict';

  const currencies = ['USD', 'EUR', 'GBP', 'TRY'];
  const durations = [13, 26, 52];
  const maximumCents = 100000000;

  // Parse decimal text directly so every planned deposit is an integer number of cents.
  const parseAmountCents = (input) => {
    const value = String(input).trim();
    if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(value)) return null;
    const [whole, fraction = ''] = value.split('.');
    const cents = Number(whole || '0') * 100 + Number(fraction.padEnd(2, '0'));
    return Number.isSafeInteger(cents) && cents <= maximumCents ? cents : null;
  };

  const createPlan = (weeks, startCents, increaseCents, currency) => {
    if (!durations.includes(weeks) || !currencies.includes(currency)) throw new Error('Choose a listed currency and duration.');
    if (![startCents, increaseCents].every((cents) => Number.isSafeInteger(cents) && cents >= 0 && cents <= maximumCents) || startCents + increaseCents === 0) {
      throw new Error('Choose valid deposits with a starting amount or increase greater than zero.');
    }
    let totalCents = 0;
    const rows = Array.from({ length: weeks }, (_, index) => {
      const depositCents = startCents + index * increaseCents;
      totalCents += depositCents;
      return { week: index + 1, depositCents, totalCents };
    });
    return { weeks, startCents, increaseCents, currency, rows, totalCents };
  };

  const decimalAmount = (cents) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
  const csvForPlan = (plan) => [
    'Week,Deposit,Running total,Currency',
    ...plan.rows.map((row) => `${row.week},${decimalAmount(row.depositCents)},${decimalAmount(row.totalCents)},${plan.currency}`)
  ].join('\r\n') + '\r\n';

  // The same calculation and export functions are available to local Node checks.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { parseAmountCents, createPlan, csvForPlan };
    return;
  }

  const byId = (id) => document.getElementById(id);
  const form = byId('savings-form');
  const inputs = [byId('currency'), byId('weeks'), byId('start-amount'), byId('weekly-increase')];
  const error = byId('form-error');
  const status = byId('plan-status');
  const printButton = byId('print-plan');
  const exportButton = byId('export-plan');
  let activePlan = null;

  const formatMoney = (cents, currency) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(cents / 100);

  const invalidatePlan = () => {
    const hadPlan = activePlan !== null;
    activePlan = null;
    document.body.classList.remove('has-savings-plan');
    ['result-content', 'milestones', 'weekly-plan'].forEach((id) => byId(id).classList.add('hidden'));
    byId('result-empty').classList.remove('hidden');
    printButton.disabled = true;
    exportButton.disabled = true;
    error.textContent = '';
    inputs.forEach((input) => input.removeAttribute('aria-invalid'));
    if (hadPlan) status.textContent = 'Inputs changed. Create your savings chart again to update the totals, printout and CSV.';
  };

  const showError = (message, input) => {
    error.textContent = message;
    status.textContent = 'Your chart is unavailable until the inputs are corrected.';
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  };

  const calculate = () => {
    invalidatePlan();
    const startCents = parseAmountCents(byId('start-amount').value);
    const increaseCents = parseAmountCents(byId('weekly-increase').value);
    if (startCents === null || increaseCents === null) {
      showError('Enter both amounts from 0 to 1,000,000, with no more than two decimal places.', byId(startCents === null ? 'start-amount' : 'weekly-increase'));
      return;
    }
    if (startCents + increaseCents === 0) {
      showError('Enter a starting deposit or weekly increase greater than zero.', byId('start-amount'));
      return;
    }
    let plan;
    try {
      plan = createPlan(Number(byId('weeks').value), startCents, increaseCents, byId('currency').value);
    } catch (problem) {
      showError(problem.message);
      return;
    }
    const money = (cents) => formatMoney(cents, plan.currency);
    byId('total-saved').textContent = money(plan.totalCents);
    byId('result-weeks').textContent = plan.weeks;
    byId('final-deposit').textContent = money(plan.rows.at(-1).depositCents);
    byId('average-weekly').textContent = money(Math.round(plan.totalCents / plan.weeks));
    byId('first-quarter').textContent = money(plan.rows[Math.min(13, plan.weeks) - 1].totalCents);
    byId('monthly-average').textContent = money(Math.round(plan.totalCents * 52 / (plan.weeks * 12)));
    const checkpoints = [...new Set([Math.ceil(plan.weeks / 4), Math.ceil(plan.weeks / 2), Math.ceil(plan.weeks * .75), plan.weeks])];
    byId('milestones').innerHTML = checkpoints.map((week) => `<div class="milestone"><span>Through week ${week}</span><strong>${money(plan.rows[week - 1].totalCents)}</strong></div>`).join('');
    byId('plan-title').textContent = `Your ${plan.weeks}-week savings plan`;
    byId('plan-summary').textContent = `${plan.currency} · Start with ${money(plan.startCents)}, increase by ${money(plan.increaseCents)} each week and save ${money(plan.totalCents)} in total. Final deposit: ${money(plan.rows.at(-1).depositCents)}.`;
    byId('weekly-plan-rows').innerHTML = plan.rows.map((row) => `<tr><th scope="row">${row.week}</th><td>${money(row.depositCents)}</td><td>${money(row.totalCents)}</td><td class="savings-done"><span class="savings-check-box" aria-hidden="true"></span></td></tr>`).join('');
    byId('result-empty').classList.add('hidden');
    ['result-content', 'milestones', 'weekly-plan'].forEach((id) => byId(id).classList.remove('hidden'));
    activePlan = plan;
    document.body.classList.add('has-savings-plan');
    printButton.disabled = false;
    exportButton.disabled = false;
    status.textContent = `Your ${plan.weeks}-week chart is ready. Planned total: ${money(plan.totalCents)}. Print or download CSV below. Weekly and monthly averages are rounded; the monthly average uses 52 weeks over 12 months.`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculate();
  });
  form.addEventListener('input', invalidatePlan);
  form.addEventListener('change', invalidatePlan);
  form.querySelectorAll('[data-start]').forEach((button) => {
    button.addEventListener('click', () => {
      byId('start-amount').value = button.dataset.start;
      byId('weekly-increase').value = button.dataset.increase;
      calculate();
    });
  });
  printButton.addEventListener('click', () => {
    if (activePlan) window.print();
  });
  exportButton.addEventListener('click', () => {
    if (!activePlan) return;
    const url = URL.createObjectURL(new Blob([csvForPlan(activePlan)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `moocsoft-${activePlan.weeks}-week-savings-${activePlan.currency.toLowerCase()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
