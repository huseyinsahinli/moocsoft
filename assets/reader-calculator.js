const form = document.querySelector('[data-reader-calculator]');
const appResult = document.querySelector('[data-reader-app-result]');
const output = form.querySelector('output');

function patternResult(data) {
  const block = data.get('block').trim().split(/\s+/);
  const position = Number(data.get('position'));
  if (!block[0] || block.length > 100 || !Number.isInteger(position) || position < 1 || position > 1e9) {
    return { error: 'Enter a block of 1–100 terms and a whole position from 1 to 1,000,000,000.' };
  }
  const period = block.findIndex((_, index) => {
    const size = index + 1;
    return block.length % size === 0 && block.every((term, i) => term === block[i % size]);
  }) + 1;
  const offset = (position - 1) % period;
  return { message: `Term ${position}: ${block[offset]}. Shortest unit: ${block.slice(0, period).join(' ')} (period ${period}). Complete cycles before this term: ${Math.floor((position - 1) / period)}. Slot: ${offset + 1}.` };
}

function cents(value) {
  if (!/^-?\d{1,9}(?:\.\d{1,2})?$/.test(value.trim())) return NaN;
  return Math.round(Number(value) * 100);
}
function savingsResult(data) {
  const goal = cents(data.get('goal'));
  const opening = cents(data.get('opening'));
  const weeks = Number(data.get('weeks'));
  const entries = data.get('entries').trim();
  const deposits = entries ? entries.split(',').map(cents) : [];
  if (!(goal > 0 && opening >= 0 && Number.isInteger(weeks) && weeks >= 1 && weeks <= 104 && deposits.length <= weeks && deposits.every(Number.isFinite))) {
    return { error: 'Enter a positive target, a nonnegative starting balance and 1–104 whole weeks. Use at most one signed amount per completed week, with up to nine digits before the decimal and two after.' };
  }
  const money = amount => (amount / 100).toFixed(2);
  const balance = deposits.reduce((total, deposit) => total + deposit, opening);
  const planned = opening + Math.round(Math.max(0, goal - opening) * deposits.length / weeks);
  const gap = balance - planned;
  const left = weeks - deposits.length;
  const needed = Math.max(0, goal - balance);
  let next = 'Target reached.';
  if (needed && !left) next = `Plan ended with ${money(needed)} left to save.`;
  if (needed && left) {
    const low = Math.floor(needed / left);
    const extra = needed % left;
    next = extra ? `Remaining deposits: ${extra} × ${money(low + 1)} and ${left - extra} × ${money(low)}.` : `Remaining deposits: ${left} × ${money(low)}.`;
  }
  return { message: `Week ${deposits.length} of ${weeks}. Balance: ${money(balance)}. Planned: ${money(planned)}. ${gap === 0 ? 'On pace.' : money(Math.abs(gap)) + (gap > 0 ? ' ahead.' : ' behind.')} ${next}` };
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const result = form.dataset.readerCalculator === 'savings-pace-tracker' ? savingsResult(data) : patternResult(data);
  output.textContent = result.message || result.error;
  if (appResult) appResult.hidden = !result.message;
});
form.addEventListener('input', () => {
  output.textContent = '';
  if (appResult) appResult.hidden = true;
});
form.hidden = false;
