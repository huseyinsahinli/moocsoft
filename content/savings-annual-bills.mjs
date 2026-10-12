import { table } from './apps.mjs';

// Illustrative USD amounts and contribution dates, not prices or payment advice.
export const annualBillsExample = Object.freeze({
  reviewed: '2026-10-12',
  bills: [
    {
      name: 'Annual membership', targetCents: 24000, reservedCents: 6000,
      due: '2027-01-20', deposits: ['2026-11-01', '2026-12-01', '2027-01-01'],
    },
    {
      name: 'Annual software renewal', targetCents: 9600, reservedCents: 2400,
      due: '2026-12-10', deposits: ['2026-11-01', '2026-12-01'],
    },
  ],
  nextMembershipCycle: {
    due: '2028-01-20', targetCents: 24000, reservedCents: 0,
    deposits: Array.from({ length: 12 }, (_, index) => `${index < 11 ? '2027' : '2028'}-${String(index < 11 ? index + 2 : 1).padStart(2, '0')}-01`),
  },
});

const dollars = cents => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const perDeposit = bill => (bill.targetCents - bill.reservedCents) / bill.deposits.length;

export const annualBillsGuides = [
  {
    topic: 'savings', slug: 'annual-bills-sinking-fund', published: '2026-10-12',
    appPreview: true, showToolAction: false,
    title: 'Annual Bills Sinking Fund: Plan Renewals Without Dividing by 12',
    description: 'Use an annual-bills worksheet to count deposits before each renewal, separate reserved money from plans, and reset the fund after paying the bill.',
    intro: 'For an annual bill, subtract money already reserved and divide the gap by the contribution dates before the next payment. Dividing by 12 works only when twelve usable deposits really remain. A renewal due soon needs a different plan from the following full-year cycle.',
    takeaway: 'An annual bill is not automatically twelve months away. Plan the next due date first, then begin a fresh cycle after the payment has actually happened.',
    previewCopy: {
      heading: 'Keep a named record for the next renewal',
      description: 'Frugal records each goal and the contributions or withdrawals you enter. Use the bill calendar below for planning and the app for money actually reserved; neither creates a bank payment.',
    },
    sections: [
      ['Make a renewal list, not just a monthly average', `<p>The awkward part of an annual bill is often the timing. A membership can cost $20 per month on average while still requiring a $240 payment next January. The average is useful for comparing costs, but it is not the amount you necessarily need to reserve this month.</p><p>Gather each renewal notice or agreement and write down:</p><ul><li>The bill name and whether you still intend to keep it.</li><li>The next charge or payment date, plus when the money needs to be available.</li><li>The confirmed amount, or a clearly labeled estimate awaiting confirmation.</li><li>Money already reserved for this bill, excluding other goals.</li><li>The contribution dates you can realistically use before payment.</li></ul><p>Keep renewal terms and receipts outside the savings tracker. A goal date is a planning record; it does not change a provider’s charge date or cancel a subscription. If you no longer need a renewal, check its actual cancellation terms rather than simply deleting the savings goal.</p><p>The <a href="https://www.consumerfinance.gov/archive/blog/budgeting-how-to-create-a-budget-and-stick-with-it/" target="_blank" rel="noopener">CFPB’s budgeting guide</a> includes a bill calendar because income and due dates may not line up. Use that timing check alongside the worksheet, not just the annual total.</p>`],
      ['Work through two bills with different deadlines', `<p>This is an invented worksheet reviewed on <strong>October 12, 2026</strong>. The next affordable contribution date in this example is November 1; no October deposit is assumed. All amounts are illustrative US dollars, excluding interest and fees, not quotes for real products.</p>` + table('Example annual-bill worksheet: actual reserved money and remaining planning dates', ['Bill', 'Next payment', 'Target', 'Reserved now', 'Usable deposit dates', 'Plan per deposit'], annualBillsExample.bills.map(bill => [
        bill.name, bill.due, dollars(bill.targetCents), dollars(bill.reservedCents), bill.deposits.join(', '), dollars(perDeposit(bill)),
      ])) + `<p>For the membership, ($240 − $60) ÷ 3 = <strong>$60</strong> on each of November 1, December 1 and January 1. A flat $20 monthly amount would add only $60 before the bill, leaving the goal at $120—half the required amount.</p><p>For the software renewal, ($96 − $24) ÷ 2 = <strong>$36</strong> on November 1 and December 1. A January deposit cannot help pay a December 10 bill. This is why each annual bill needs its own next due date.</p>` + table('Combined contribution calendar: future deposits are not money already saved', ['Date', 'Membership plan', 'Software plan', 'Total planned contribution'], [
        ['November 1, 2026', '$60', '$36', '$96'],
        ['December 1, 2026', '$60', '$36', '$96'],
        ['January 1, 2027', '$60', 'Already paid if the plan happened', '$60'],
      ]) + `<p>The starting reserved total is $84. The three dates call for $252 in new contributions: $96 + $96 + $60. That is a cash-flow requirement to compare with your budget, not a recommendation to contribute more than you can afford. If a date falls too close to payment, move the planning deadline earlier and recount the usable dates.</p><p>Copy the column headings into a sheet or notebook and replace the examples with your bills. Keep future contribution amounts in the plan until the money is genuinely reserved. For rounding or a missed date, use the <a href="/guides/calculate-savings-goal-contributions/">worked contribution formula</a>.</p>`],
      ['After paying, start the next cycle from the real balance', `<p>Suppose both November and December contributions happen. Before the software bill is paid, its goal contains $96 and the membership goal contains $180. Paying the $96 software bill leaves that software allocation at zero; the $180 membership allocation remains. The old software completion percentage is not money available for another purpose.</p><p>In the example, the membership reaches $240 after the January 1 contribution. Once the January 20, 2027 payment actually uses the full $240, the amount remaining for that goal is zero. Record the spending before planning the next renewal.</p>` + table('Next membership cycle, assuming the price and due date are confirmed unchanged', ['Item', 'New cycle'], [
        ['Next payment', 'January 20, 2028'],
        ['Target / still reserved after payment', '$240 / $0'],
        ['Remaining deposit dates', 'February 1, 2027 through January 1, 2028: twelve dates'],
        ['Plan per deposit', '($240 − $0) ÷ 12 = $20'],
      ]) + `<p>The $20 plan now fits because twelve usable dates remain. It did not fit the three-date catch-up cycle. If the next price is not yet confirmed, label it as an estimate and review it when the renewal notice arrives. If money remains after a cheaper bill, either carry that actual balance into the next cycle or explicitly reassign it; do not count it twice.</p><p>A simple record can include the cycle in its name, such as “Membership — January 2028.” Keep the previous invoice and payment record so the next target has a traceable basis. This is a manual planning method, not an automatic recurring-bill feature.</p>`],
      ['Do a renewal review, then record only real contributions', `<p>At each review, ask four questions: Is the renewal still wanted? Is the amount confirmed? How much is actually reserved? Which contribution dates remain before payment? If the new requirement does not fit, examine the bill and wider budget rather than marking a deposit that never happened. Essential costs and other commitments still count.</p><p>For multiple bills, check that the sum of your goal allocations does not exceed the real money supporting them. The <a href="/guides/track-multiple-savings-goals/">multiple-goal reconciliation guide</a> shows how to spot that double-counting. Keep <a href="/guides/sinking-funds-vs-emergency-fund/">known annual expenses separate from an emergency reserve</a>.</p><p><a href="/savings-goal-tracker/">Frugal</a> lets you create named goals with targets and dates, then manually record contributions and withdrawals. Its reminders can prompt a review, but do not pay bills or confirm that money was set aside. Goal records are stored locally, without a bank login; Frugal does not hold or transfer funds.</p><p>The <a href="https://apps.apple.com/us/app/frugal-savings-tracker/id6450431254" target="_blank" rel="noopener">current iOS listing</a> describes ads and feature limits in the free version. Unlimited goals and PDF/Excel exports require Premium. The worksheet on this page does not need Premium and is not imported into the app. Try Frugal if a named, regularly updated goal record would help you follow your plan.</p><p>This guide is general education and record-keeping, not individual financial advice. A calendar and tracker make commitments visible; they do not guarantee that a bill is affordable.</p>`],
    ],
    sources: ['budgetPlanning', 'savingsStore'],
    faq: [
      ['Should I divide every annual bill by 12?', 'Only when twelve usable contribution dates remain before payment and you account for money already reserved. If the next bill is closer, divide the remaining gap by the actual dates available.'],
      ['What happens to a sinking fund after the bill is paid?', 'Record the money used, check what actually remains, and plan the next renewal from that balance. Do not carry the old funded total forward as if the payment never happened.'],
      ['Can Frugal pay an annual bill or move money automatically?', 'No. Frugal records the goals, contributions and withdrawals you enter. Its reminders do not transfer money, pay a provider or cancel a renewal.'],
    ],
  },
];
