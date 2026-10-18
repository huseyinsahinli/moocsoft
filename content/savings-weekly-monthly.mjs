import { table } from './apps.mjs';

// Invented USD contribution plan. These are calendar Fridays, not payroll or bank-processing dates.
export const weeklySavingsExample = {
  depositCents: 2500,
  startingCents: 10000,
  months: [
    { label: 'January 2027', dates: ['2027-01-01', '2027-01-08', '2027-01-15', '2027-01-22', '2027-01-29'], actualCents: [2500, 2500, 0, 2500, 2500] },
    { label: 'February 2027', dates: ['2027-02-05', '2027-02-12', '2027-02-19', '2027-02-26'], actualCents: [2500, 2500, 2500, 2500] },
  ],
  comparisons: [
    { label: 'Four deposits in each of twelve months', count: 48 },
    { label: 'A plan containing exactly 52 weekly deposits', count: 52 },
    { label: 'Every calendar Friday in 2027', count: 53 },
  ],
};
const dollars = cents => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const example = weeklySavingsExample;

export default [
  {
    topic: 'savings', slug: 'weekly-to-monthly-savings', published: '2026-10-18',
    appPreview: true, showToolAction: false,
    title: 'Weekly to Monthly Savings: Why Four Weeks Is Not a Month',
    description: 'Convert weekly savings into a monthly average, then check real deposit dates. Worked $25 examples show four- and five-Friday months, missed deposits and 53 Fridays.',
    intro: 'For a plan with exactly 52 weekly deposits, multiply the weekly amount by 52 and divide by 12 to find a monthly average. At $25 per deposit, that is about $108.33—not $100. But an average is not a calendar-month total: count the actual contribution dates and record only deposits that happened.',
    takeaway: 'Keep three numbers separate: the average for comparing plans, the deposits scheduled inside a month, and the money actually set aside. Four weeks is 28 days, not a general definition of a month.',
    startAction: ['#step-2', 'See the dated weekly example ↓'],
    previewCopy: {
      heading: 'Keep actual weekly contributions in Frugal.',
      description: 'Give the goal a target, then manually record each real contribution with its date and amount. Keep the calendar plan separate so a monthly average never becomes a deposit that did not happen.',
    },
    sections: [
      ['Use an average only when you mean an average', `<p>Suppose you plan a flat $25 contribution on each of 52 dates. The total is $25 × 52 = $1,300. Spreading that total across twelve months for comparison gives:</p><p class="guide-formula">Monthly average = $25 × 52 ÷ 12 = $108.333… ≈ $108.33</p><p>Multiplying by four gives $100, but twelve blocks of four deposits contain only 48 deposits. At $25 each, that is $1,200: $100 less than the 52-deposit model. The difference comes from the number of contributions, not interest or a return on savings.</p><p>The rounded average is not an exact twelve-payment instruction either. Twelve payments of $108.33 total $1,299.96. If you deliberately switch to a monthly schedule, work out its actual deposit amounts and dates instead of silently changing the weekly plan.</p><p>An annual average can help compare two schedules. It cannot show whether cash is available before a particular bill. The <a href="https://www.consumerfinance.gov/archive/blog/budget-help-manage-your-monthly-expenses-bill-calendar/" target="_blank" rel="noopener">CFPB’s bill-calendar guidance</a> explains why due dates belong alongside an overall budget. Check those dates before choosing an affordable savings contribution.</p>`],
      ['Count the Fridays in the month you are planning', `<p>Here is an <strong>invented $25-every-Friday contribution plan</strong>. January 2027 has five calendar Fridays; February 2027 has four. These are illustrative planning dates, not a real payroll schedule, bank-transfer promise or instruction to transact on a holiday.</p>` + table('Same weekly amount, different calendar-month plans', ['Month', 'Calendar contribution dates', 'Count', 'Planned total'], example.months.map(month => [
        month.label, month.dates.join(', '), String(month.dates.length), dollars(month.dates.length * example.depositCents),
      ])) + `<p>January’s plan is $125 and February’s is $100. Neither is the $108.33 average from the 52-deposit model. A month with a smaller total does not automatically mean you missed a contribution; it may simply contain fewer scheduled dates.</p><p>If your contributions follow actual paydays, use your employer’s confirmed calendar instead of these Fridays. Holidays or other arrangements can shift when money is received or available. Do not assume a fifth scheduled contribution is affordable just because there is a fifth date; bills and essential spending still matter.</p><p>For every-two-week contributions, see the separate <a href="/guides/biweekly-savings-plan/">biweekly savings plan</a>. Every two weeks and twice a month are different schedules, not interchangeable labels.</p>`],
      ['Check the year before assuming there are 52 deposits', `<p>A 52-deposit plan is a useful model, but it is not every possible calendar-year schedule. In 2027, January 1 and December 31 are both Fridays. Counting every Friday from January 1 through December 31 gives <strong>53 dates</strong>.</p>` + table('Three different $25 plans: totals assume every listed contribution happens', ['Defined plan', 'Deposit count', 'Total before interest, fees or withdrawals'], example.comparisons.map(plan => [
        plan.label, String(plan.count), dollars(plan.count * example.depositCents),
      ])) + `<p>All three calculations are valid for their stated counts. They are not the same plan. A calendar-Friday plan for all of 2027 would total $1,325 if all 53 contributions happened; dividing by twelve gives an average of about $110.42, not $108.33.</p><p>Do not add an unplanned deposit merely to match a generic annual number. Write the first contribution date and the last usable date, count the dates in that interval, then check the amounts against your own budget. A goal that starts partway through a year needs its own count.</p>`],
      ['Separate the monthly plan from the actual record', `<p>Now imagine the same person begins January with $100 already reserved for the goal. They complete four January contributions, but the planned January 15 contribution does not happen. They complete all four February contributions. The amounts below are invented, in the same currency, and exclude interest, fees and withdrawals.</p>` + table('Fictional contribution ledger: a planned date does not create saved money', ['Planned date', 'Planned contribution', 'Actually set aside', 'Record'], example.months.flatMap(month => month.dates.map((date, index) => [
        date, dollars(example.depositCents), dollars(month.actualCents[index]), month.actualCents[index] ? 'Completed contribution' : 'No contribution; do not add $25 to savings',
      ]))) + table('Month-end reconciliation for the fictional record', ['Period', 'Planned new contributions', 'Actual new contributions', 'Actual saved balance at period end'], [
        ['Before January', 'Not applicable', 'Starting allocation: $100.00', '$100.00'],
        ['January 2027', '$125.00', '$100.00', '$200.00'],
        ['February 2027', '$100.00', '$100.00', '$300.00'],
      ]) + `<p>The actual balance is $100 starting savings + $100 in January + $100 in February = <strong>$300</strong>. The $25 missed in January remains a planning difference, not money saved. Entering the $108.33 average for each month would also produce a record that does not match these contributions.</p><p>If money is later used or reassigned, record that reduction separately. Reconcile the goal with the money genuinely allocated to it. Do not count the same account balance under several goals; use the <a href="/guides/track-multiple-savings-goals/">multiple-goal planning and reconciliation guide</a> when your money supports more than one purpose.</p>`],
      ['Use one short check before updating your goal', `<ol><li><strong>Name the unit:</strong> per week, per payday, per month or total for a defined interval.</li><li><strong>Write the usable dates:</strong> check the real calendar and when money can be available.</li><li><strong>Total the plan:</strong> add the contributions inside the period you are reviewing.</li><li><strong>Record reality:</strong> enter completed contributions and withdrawals, not the average or an expected paycheck.</li><li><strong>Review the gap:</strong> compare the actual balance with the target and the remaining dates.</li></ol><p>For a fixed target, use the <a href="/guides/calculate-savings-goal-contributions/">savings contribution formula</a> or the <a href="/tools/savings-goal-calculator/">free savings goal calculator</a> after you have counted the remaining deposits. That calculator divides a gap across a number of deposits; it does not read your payroll calendar, calculate bank-processing dates or establish affordability.</p><p><a href="/savings-goal-tracker/">Frugal</a> can keep a named goal, target and manual contribution history together on iPhone, iPad or Android. Record the actual date and amount after money has been reserved. A reminder can prompt this check, but does not confirm a deposit or move money.</p><p>The current store listings describe locally stored goal records without a bank connection. The free version has ads and feature limits; unlimited goals, detailed analysis and PDF/Excel exports require Premium. The calendar tables above are original website examples, not an automatic scheduling or import feature in the app.</p><p>This is general educational arithmetic and record-keeping, not individualized financial advice. A correctly counted schedule can still be unaffordable; revise the amount, target or deadline when necessary.</p>`],
    ],
    sources: ['billCalendar', 'savingsStore', 'savingsGoogleStore'],
    faq: [
      ['How do I convert weekly savings to a monthly average?', 'For a model containing 52 weekly deposits, multiply the weekly amount by 52 and divide by 12. For a defined calendar interval, use its actual contribution count. An average is not the amount deposited in every month.'],
      ['Is $25 a week the same as $100 a month?', 'No. Fifty-two $25 deposits total $1,300, while twelve $100 deposits total $1,200. A specific month may contain four or five of your weekly contribution dates.'],
      ['Does every calendar year have exactly 52 weekly deposit dates?', 'No. For example, 2027 contains 53 calendar Fridays. Count your chosen dates between the actual start and end of your plan, using your real payment arrangements when relevant.'],
      ['Should I enter the monthly average into Frugal?', 'Record the money actually set aside, with its actual date and amount. Keep a monthly average or future contribution schedule in the plan, not as a completed deposit. Frugal does not transfer money.'],
    ],
  },
];
