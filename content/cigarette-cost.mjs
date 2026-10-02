import { apps } from './apps.mjs';
import { storeLinks } from './components.mjs';

export const cigaretteCostCalculator = `<p>Enter your own pack price, pack size and average daily use. This free cost calculator does not need a quit date. Your inputs stay in this browser; they are not saved or sent to QuitBit.</p>
<div class="cigarette-cost-calculator">
  <form id="cigarette-cost-form" novalidate hidden>
    <div class="fields">
      <div class="field"><label for="cost-currency">Currency</label><select id="cost-currency"><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="CAD">CAD (C$)</option><option value="AUD">AUD (A$)</option><option value="TRY">TRY (₺)</option></select></div>
      <div class="field"><label for="cost-pack-price">Price per pack</label><input id="cost-pack-price" type="number" min="0" max="10000" step="0.01" value="10" required inputmode="decimal"></div>
      <div class="field"><label for="cost-pack-size">Cigarettes per pack</label><input id="cost-pack-size" type="number" min="1" max="1000" step="1" value="20" required inputmode="numeric"></div>
      <div class="field"><label for="cost-daily-use">Cigarettes per day</label><input id="cost-daily-use" type="number" min="0" max="1000" step="0.1" value="10" required inputmode="decimal"></div>
    </div>
    <div class="action-row"><button class="button" type="submit">Calculate cigarette costs</button></div>
    <p id="cigarette-cost-error" class="cost-error" role="alert"></p>
  </form>
  <noscript><p>JavaScript is off. Use the formula above or the worked comparison below: daily cost × 7, 30 or 365 gives the corresponding period estimate.</p></noscript>
  <div id="cigarette-cost-results" hidden>
    <dl class="cost-totals" aria-label="Estimated cigarette spending">
      <div><dt>Per day</dt><dd id="cost-day"></dd></div><div><dt>7 days</dt><dd id="cost-week"></dd></div><div><dt>30 days</dt><dd id="cost-month"></dd></div><div><dt>365 days</dt><dd id="cost-year"></dd></div>
    </dl>
    <p id="cost-calculation" class="cost-calculation"></p>
    <p class="cost-assumption">These are spending estimates at a constant price and daily use. “Month” means 30 days and “year” means 365 days. Totals use the unrounded daily estimate; displayed amounts are rounded to two decimal places. Avoided spending is not automatically money in a savings account.</p>
    <div class="result-download" data-nosnippet>
      <h3>Keep your smoke-free progress visible</h3><p>If you decide to quit, QuitBit can track smoke-free time, estimated savings and personal milestones on iPhone and iPad. It is a progress tracker, not cessation treatment.</p>
      ${storeLinks(apps.quitting, 'cigarette-cost-result')}
      <small>Free to download · Optional in-app purchases</small>
      <a class="result-download-details" href="/tools/quit-smoking-savings-calculator/">Already quit? Calculate savings since your quit date →</a>
    </div>
  </div>
  <p id="cigarette-cost-status" class="cost-status" role="status" aria-live="polite"></p>
</div>`;
