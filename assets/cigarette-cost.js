(() => {
  'use strict';
  const form = document.getElementById('cigarette-cost-form');
  if (!form) return;
  const results = document.getElementById('cigarette-cost-results');
  const error = document.getElementById('cigarette-cost-error');
  const status = document.getElementById('cigarette-cost-status');
  const currencyField = document.getElementById('cost-currency');
  const priceField = document.getElementById('cost-pack-price');
  const packField = document.getElementById('cost-pack-size');
  const dailyField = document.getElementById('cost-daily-use');
  const currencies = new Set(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'TRY']);
  form.hidden = false;

  const invalidate = () => {
    if (!results.hidden) status.textContent = 'Inputs changed. Calculate again to update your costs.';
    results.hidden = true;
    error.textContent = '';
  };
  form.addEventListener('input', invalidate);
  form.addEventListener('change', invalidate);
  form.addEventListener('submit', event => {
    event.preventDefault();
    results.hidden = true;
    error.textContent = '';
    status.textContent = '';
    const currency = currencyField.value;
    const price = priceField.valueAsNumber;
    const packSize = packField.valueAsNumber;
    const dailyUse = dailyField.valueAsNumber;
    const invalid = [priceField, packField, dailyField].find(field => !field.validity.valid || !Number.isFinite(field.valueAsNumber));
    if (invalid || !currencies.has(currency)) {
      error.textContent = 'Enter a pack price from 0 to 10,000 (up to 2 decimal places), a whole-number pack size from 1 to 1,000, and daily use from 0 to 1,000 (up to 1 decimal place).';
      (invalid || currencyField).focus();
      return;
    }
    // Normalize the pack price to cents; keep fractional per-cigarette costs until display.
    const dailyCost = dailyUse / packSize * Math.round(price * 100) / 100;
    const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    const periods = [['day', 1], ['week', 7], ['month', 30], ['year', 365]];
    for (const [id, days] of periods) document.getElementById(`cost-${id}`).textContent = money(dailyCost * days);
    document.getElementById('cost-calculation').textContent = `${dailyUse} cigarettes per day ÷ ${packSize} cigarettes per pack × ${money(price)} per pack = ${money(dailyCost)} per day.`;
    results.hidden = false;
    status.textContent = `Estimated cigarette spending: ${money(dailyCost)} per day and ${money(dailyCost * 365)} over 365 days.`;
  });
})();
