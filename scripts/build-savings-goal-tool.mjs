import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, site } from '../content/apps.mjs';
import { head, footer, storeLinks, resultDownload } from '../content/components.mjs';
import { attributeStoreLinks } from '../content/store-attribution.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = '/tools/savings-goal-calculator/';
const title = 'Savings Goal Calculator: Plan Weekly or Monthly Deposits';
const description = 'Calculate how much to save for a goal after subtracting money already set aside. Choose future deposit slots, see an exact-cent schedule and download a free CSV.';
const graph = [
  { '@type': 'WebPage', name: title, description, url: site + path, inLanguage: 'en', isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'Moocsoft', url: site },
    about: { '@type': 'Thing', name: 'Savings goal contribution planning' } },
  { '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Free tools', '/tools/'], ['Savings goal calculator', path]].map(([name, target], index) => ({ '@type': 'ListItem', position: index + 1, name, item: site + target })) },
];
const html = `${head(title, description, path, graph, apps.savings, ['savings-goal-tool']).replace('class="marketing-page"', 'class="marketing-page savings-goal-page"')}
<main id="main-content" class="wrap">
  <div class="breadcrumb" aria-label="Breadcrumb"><a href="/">Moocsoft</a> / <a href="/tools/">Free tools</a> / Savings goal calculator</div>
  <section class="tool-hero">
    <span class="eyebrow">Free savings goal calculator · No sign-up</span>
    <h1>What should each<br>deposit be?</h1>
    <p class="hero-copy">Subtract the money already set aside from your target, then split the gap across the future deposits you choose. Get a cent-accurate plan for weekly, every-two-week or monthly contributions.</p>
    <p class="goal-note">Count your real contribution dates before entering a number. This free website tool does not select calendar dates, assess affordability, earn interest, connect to a bank or move money. Your inputs stay in this page; they are not stored or sent to Moocsoft.</p>
    <div class="guide-hero-actions"><a href="#goal-planner">Build your plan ↓</a><a href="#worked-example">See the worked example ↓</a></div>
  </section>
  <section class="panel goal-planner" id="goal-planner" aria-labelledby="planner-title">
    <h2 id="planner-title">Plan your next contributions</h2>
    <p>Use money allocated only to this goal. Enter amounts with a decimal point, without commas or currency symbols.</p>
    <noscript><p class="goal-note">The interactive calculator needs JavaScript. The formula and complete worked example below remain available without it.</p></noscript>
    <form data-goal-form hidden novalidate aria-labelledby="planner-title">
      <div class="goal-inputs">
        <label class="field" for="goal-target"><span>Target amount</span><input id="goal-target" name="target" type="text" inputmode="decimal" maxlength="10" value="1000.01" autocomplete="off" aria-describedby="goal-amount-help goal-error"></label>
        <label class="field" for="goal-saved"><span>Already set aside for this goal</span><input id="goal-saved" name="saved" type="text" inputmode="decimal" maxlength="10" value="200.00" autocomplete="off" aria-describedby="goal-amount-help goal-error"></label>
        <label class="field" for="goal-deposits"><span>Number of future deposits</span><input id="goal-deposits" name="deposits" type="text" inputmode="numeric" maxlength="3" value="12" autocomplete="off" aria-describedby="goal-deposit-help goal-error"><small id="goal-deposit-help">1–520 actual contribution opportunities before you need the money.</small></label>
        <label class="field" for="goal-cadence"><span>Deposit frequency</span><select id="goal-cadence" name="cadence" aria-describedby="goal-cadence-help goal-error"><option value="weekly">Weekly</option><option value="biweekly">Every two weeks</option><option value="monthly" selected>Monthly</option></select><small id="goal-cadence-help">A schedule label, not an automatic date count.</small></label>
        <label class="field" for="goal-currency"><span>Currency label</span><select id="goal-currency" name="currency" aria-describedby="goal-amount-help goal-error"><option value="USD">USD — US dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — British pound</option></select></label>
      </div>
      <p class="goal-note" id="goal-amount-help">Amounts: 0–9,999,999.99, with up to two decimal places. Currency changes the label only; no exchange-rate conversion is performed.</p>
      <div class="action-row"><button class="button" type="submit">Calculate my deposit plan</button></div>
      <p class="goal-error" id="goal-error" data-goal-error role="alert"></p>
    </form>
    <p class="goal-status" data-goal-status role="status" aria-live="polite" aria-atomic="true"></p>
    <section class="goal-output" data-goal-output hidden aria-labelledby="goal-output-title">
      <h3 id="goal-output-title">Your planned contribution schedule</h3>
      <p class="goal-summary" data-goal-summary></p>
      <p class="goal-note">The regular contribution rounds up to a whole cent. Each row is capped at the remaining gap, so the last positive contribution may be smaller. If the target is reached early, later slots are zero. Planned balances include the savings you entered; they are not completed deposits.</p>
      <div class="goal-table-wrap" role="region" aria-label="Planned savings deposits; scroll to see all columns and deposit slots" tabindex="0"><table><caption>Illustrative schedule — no dates or bank transfers are created</caption><thead><tr><th scope="col">Deposit slot</th><th scope="col">Contribution</th><th scope="col">Planned balance</th><th scope="col">Gap after deposit</th></tr></thead><tbody data-goal-rows></tbody></table></div>
      <button class="button secondary" data-goal-export type="button" disabled>Download this plan as CSV</button>
      <p class="goal-note">This is a free browser-generated file, not a Frugal export or an automatic import. Editing an input removes the old plan until you calculate again.</p>
      ${resultDownload('savings')}
    </section>
  </section>
  <section class="content-section goal-example" id="worked-example" aria-labelledby="example-title">
    <span class="eyebrow">Check the arithmetic</span>
    <h2 id="example-title">A target of 1,000.01, with 200 already saved</h2>
    <p>This fictional example uses USD and 12 future monthly deposits. It does not assume any interest, fees, tax or currency conversion.</p>
    <p class="goal-formula">Remaining gap = 1,000.01 − 200.00 = 800.01<br>800.01 ÷ 12 = 66.6675 → regular contribution 66.67</p>
    <p>Eleven deposits of <strong>USD 66.67</strong> total <strong>USD 733.37</strong>. The final deposit is <strong>USD 66.64</strong>, bringing new contributions to <strong>USD 800.01</strong> and the planned balance to <strong>USD 1,000.01</strong>. Twelve deposits of 66.66 would leave a 9-cent shortfall.</p>
    <p>Frequency does not determine how many dates remain: 12 monthly slots are not necessarily “one year from today.” Count the dates you can use before the expense is due, then enter that count.</p>
  </section>
  <section class="content-section goal-help" aria-labelledby="goal-help-title">
    <h2 id="goal-help-title">A useful plan still needs a cash-flow check</h2>
    <h3>What if the required contribution is too high?</h3><p>The formula describes a gap; it does not show what you can afford. Compare it with money available after essential costs and other commitments. A later deadline or smaller target changes the arithmetic. Do not count the same saved money toward several goals.</p>
    <h3>What happens if I miss a contribution?</h3><p>Return with the actual amount now set aside and count the future dates again. Do not add planned contributions to your “already set aside” amount before you have made them. The <a href="https://www.consumerfinance.gov/consumer-tools/educator-tools/your-money-your-goals/toolkit/#saving" target="_blank" rel="noopener">CFPB savings-plan toolkit</a> provides a separate worksheet for connecting a goal to a savings plan.</p>
    <h3>What if I already have more than the target?</h3><p>The additional required contribution is zero. The tool keeps your entered balance intact and does not tell you how to reallocate an excess. A very small remaining gap can be reached before every chosen slot is used; later rows then show zero.</p>
    <h3>Does this calculator include interest or automatically update Frugal?</h3><p>No. It is a simple contribution schedule, not an interest forecast, investment recommendation, bank product or app feature. Record actual contributions separately in Frugal if you choose to use the app. Frugal does not hold or transfer money; the free version has ads and limits, and unlimited goals and exports require Premium. Check your store for current access.</p>
  </section>
  <section class="goal-reading" aria-labelledby="goal-reading-title"><h2 id="goal-reading-title">Choose your next step</h2><ul>
    <li><a href="/guides/calculate-savings-goal-contributions/">Build a dated savings-goal plan and handle a missed deposit →</a></li>
    <li><a href="/guides/biweekly-savings-plan/">Count every-two-week paydays instead of assuming two per month →</a></li>
    <li><a href="/guides/track-multiple-savings-goals/">Keep several goals from counting the same money twice →</a></li>
  </ul><p><a href="/tools/52-week-savings-calculator/">Prefer increasing or reverse deposits? Try the 52-week savings calculator →</a></p></section>
  <section class="guide-download" data-nosnippet aria-label="Continue with Frugal"><div><span class="guide-kicker">From planned to actually saved</span><h2>Give your real savings a record.</h2><p>Keep a named goal and manually record money you actually set aside in Frugal. The free web plan above remains separate from the app.</p><small>iPhone, iPad and Android · Free download with ads and limits. Unlimited goals and exports require Premium.</small></div>${storeLinks(apps.savings, 'tool-end')}</section>
</main>
${footer()}
</body>
</html>`;
const target = resolve(root, '.' + path, 'index.html');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, attributeStoreLinks(html, path).trimEnd() + '\n');
console.log('Built the free savings goal contribution calculator with a static worked example and local CSV schedule.');
