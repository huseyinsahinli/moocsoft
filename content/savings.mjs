import { table } from './apps.mjs';

const money = n => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default [
  {
    topic: 'savings', slug: '52-week-savings-challenge',
    title: '52-Week Savings Challenge: Complete Chart and Examples',
    description: 'See the full 52-week savings chart, the $1,378 calculation, alternative deposit amounts, and a practical way to track completed contributions.',
    intro: 'In the classic 52-week savings challenge, you set aside $1 in week one, $2 in week two, and continue up to $52. Completing all deposits adds up to $1,378 before interest.',
    takeaway: 'The total is $1,378, but the deposits become larger over time. Check the final weeks against your budget before choosing the classic version.',
    sections: [
      ['Understand the total and the final-week commitment', `<p>The week number is the planned deposit in dollars. Add the amounts from 1 through 52 to find the complete challenge total:</p><p class="guide-formula">52 × (1 + 52) ÷ 2 = $1,378</p><p>This is a deposit schedule, not an investment return. It assumes you make every contribution and excludes interest, fees and withdrawals. You can use another currency with the same numbers; that changes the currency of the total, not the arithmetic.</p><p>The first four deposits total only $10. The last four total $202. Before starting, look at those later commitments as carefully as the approachable first week.</p>`],
      ['Your full 52-week chart', table('Classic challenge: planned deposits and running total', ['Week', 'Deposit', 'Total saved'], Array.from({length: 52}, (_, i) => {const n=i+1; return [String(n), money(n), money(n*(n+1)/2)];})) + `<p>Use this chart as a plan. Mark a week complete only after you have actually set aside the money. A future scheduled deposit belongs in the plan, not in your current saved balance.</p>`],
      ['Choose an amount that fits your year', table('Alternative versions, assuming every deposit is completed', ['Version', 'First week', 'Weekly increase', 'Week 52', 'Total'], [
        ['Half-size challenge', '$0.50', '$0.50', '$26', '$689'],
        ['Classic challenge', '$1', '$1', '$52', '$1,378'],
        ['Double-size challenge', '$2', '$2', '$104', '$2,756'],
        ['Flat contribution', '$20', '$0', '$20', '$1,040'],
      ]) + `<p>These are examples, not suggested minimums. A flat contribution may be easier to coordinate with regular pay. Our free calculator accepts a starting deposit and weekly increase, including zero, so you can compare versions before committing.</p>`],
      ['Track real contributions separately from the plan', `<p>Create a goal with a name that explains why you are saving, such as “Travel fund” or “Annual expense.” Add the challenge total as a target only if that amount serves your goal. Record each deposit with its actual date and amount.</p><p>If week eight’s planned $8 deposit happens during week nine, keep that timing honest. The challenge chart still shows the original schedule, while your contribution record shows what happened. This distinction makes it easier to adjust the rest of the plan.</p><p>Savings Goal Tracker is a place to keep that record and view progress. Entering a contribution in the app does not move money into a bank account.</p>`],
      ['Make a recovery plan for an expensive week', `<p>If you cannot make a deposit, first check what is affordable after essential expenses. You can revise the finish date, lower a future contribution or replace the increasing schedule with a flat amount. Avoid treating the chart as a bill that must be paid at any cost.</p><p>At each monthly review, compare the actual balance with the plan and choose the next manageable contribution. For a version that starts with larger deposits, read the reverse-challenge guide. For a specific deadline and amount, use the savings-goal formula instead.</p>`],
    ],
    sources: ['savings'],
    faq: [['Do I have to start in January?', 'No. Start with your first deposit and number the following weeks from there. Fifty-two weekly contributions do not have to align with a calendar year.'], ['Does the $1,378 include interest?', 'No. It is the sum of the 52 planned deposits, before interest, fees or withdrawals.']],
  },
  {
    topic: 'savings', slug: 'reverse-52-week-savings-challenge',
    title: 'Reverse 52-Week Savings Challenge: Is It a Better Fit?',
    description: 'Compare the reverse and standard 52-week savings challenges with quarterly totals, cash-flow examples, and a missed-deposit worksheet.',
    intro: 'The reverse challenge starts with $52 and reduces the deposit by $1 each week until the final $1 contribution. You save the same $1,378, but the largest commitments come first.',
    takeaway: 'Reversing the order changes when you need the money, not how much the deposits add up to. Compare both schedules with your expected expenses.',
    sections: [
      ['See how the reverse schedule works', `<p>For week <em>n</em>, the reverse deposit is <strong>53 − n</strong> dollars. Week one is $52, week two is $51, and week 52 is $1. The standard version uses those same 52 amounts in the opposite order.</p><p>If your available money is greater near the beginning of the challenge, the reverse pattern may be easier to maintain later. If money is tight at the start, the opening deposit can be a barrier. Neither order creates a larger deposit total by itself.</p>`],
      ['Compare the year in four blocks', table('Standard versus reverse: 13-week blocks, excluding interest', ['Weeks', 'Standard deposits', 'Reverse deposits', 'Reverse running total'], [
        ['1–13', '$91', '$598', '$598'],
        ['14–26', '$260', '$429', '$1,027'],
        ['27–39', '$429', '$260', '$1,287'],
        ['40–52', '$598', '$91', '$1,378'],
      ]) + `<p>The reverse schedule places $1,027 into the first half of the plan, compared with $351 in the standard version. By the last week, both reach $1,378 if every deposit is made. Actual account interest depends on where and when money is held; it is not included in this comparison.</p>`],
      ['Map deposits to your own cash flow', `<p>Write down the next several pay dates and the large expenses you already expect. Then compare those dates with the schedule. A calendar-year reverse challenge has smaller deposits near year-end, but someone starting in September will have a different relationship between challenge weeks and seasonal expenses.</p><p>For example, the first four reverse deposits are $52, $51, $50 and $49: a total of $202. If that opening block is too large, halving each deposit gives $101 for the same block and $689 for the completed challenge. These numbers describe alternatives; the suitable amount depends on your budget.</p>`],
      ['Use the calculator for amounts, then reverse the order', `<p>The Moocsoft 52-week calculator models a starting deposit with a nonnegative weekly increase. To size a reverse challenge, first calculate its matching increasing version. A $1 start and $1 increase shows the same $1,378 deposit total.</p><p>Reverse that schedule when planning your actual deposits: start with its final-week amount and work backward. Do not enter a negative increase into a tool that does not support one. The standard chart is linked below if you want to read its rows from week 52 upward.</p><p>In Savings Goal Tracker, record actual contributions as you make them. This keeps your saved balance accurate whether you follow the reverse order or change the sequence.</p>`],
      ['Handle a missed week without double-counting', `<p>Suppose you complete the first three reverse deposits and have $153. If you miss the next $49 contribution, your balance remains $153. You can keep the $49 as a pending plan item, split it across later dates if affordable, or adjust the goal timeline.</p><p>Do not record the missed amount as saved just to preserve a visual streak. The number you need for future planning is the money available for the goal. At review time, subtract that actual balance from your target and decide whether the original schedule still fits.</p>`],
    ],
    sources: [],
    faq: [['Does the reverse challenge save more?', 'Its planned deposits total the same $1,378 as the classic $1-to-$52 challenge. The order of deposits changes; interest is not included.'], ['Can I use the calculator for reverse deposits?', 'Calculate the corresponding increasing schedule to find its total, then follow those deposit amounts in reverse. The calculator does not accept a negative weekly increase.']],
  },
  {
    topic: 'savings', slug: 'sinking-funds-vs-emergency-fund',
    title: 'Sinking Funds vs an Emergency Fund: Track Each Purpose',
    description: 'Separate planned expenses from unexpected costs with a simple savings-goal worksheet, allocation example, and monthly balance check.',
    intro: 'Some costs are expected even when they are not monthly. Others arrive without warning. Giving those two kinds of savings separate names helps you see what the same balance can realistically cover.',
    takeaway: 'Use a planned-expense goal for a known upcoming cost and an emergency reserve for unexpected needs. Do not assign the same money to both totals.',
    sections: [
      ['Separate a known expense from an unexpected need', `<p>A sinking fund is a common name for money gradually set aside for a planned expense: a yearly bill, a trip or an item you expect to replace. An emergency fund is a reserve for unplanned expenses or financial shocks. The CFPB describes emergency savings as cash set aside for unexpected costs and notes that the appropriate amount depends on your circumstances.</p><p>The distinction is the purpose, not necessarily the number of bank accounts you have. A tracker can show several named goals even if money is held in one account. That makes careful allocation especially important.</p>`],
      ['Give each goal a clear job', table('Illustrative categories for a savings tracker', ['Goal', 'Type', 'Planning question'], [
        ['Annual membership renewal', 'Known expense', 'How much is due, and when?'],
        ['Planned trip', 'Known expense', 'Which costs belong in the target?'],
        ['Unexpected essential repair', 'Emergency reserve', 'What unexpected costs might I need to cover?'],
        ['Income interruption reserve', 'Emergency reserve', 'What essential spending would continue?'],
      ]) + `<p>A predictable maintenance cost can be planned even when its exact invoice is uncertain. Label your assumptions clearly instead of classifying every future expense as an emergency.</p>`],
      ['Calculate contributions for a dated expense', `<p>Imagine a $600 bill is due after six remaining contribution dates and you already allocated $120 to it. The amount still needed is $480, giving an illustrative contribution of $80 per date:</p><p class="guide-formula">($600 − $120) ÷ 6 = $80</p><p>This calculation ignores interest and changes to the bill. Check the actual due date and count deposits that can arrive before it. If the resulting amount does not fit your budget, revise the plan rather than assuming a tracker can make the gap disappear.</p><p>An emergency reserve usually has a different planning question because there may be no predictable spending date. Set a target appropriate to your own situation and revisit it as circumstances change.</p>`],
      ['Prevent double-counting across goals', `<p>Suppose one account holds $1,000. You allocate $300 to an annual bill, $200 to a planned trip and $500 to an emergency reserve. Those allocations total $1,000. Showing $1,000 under every goal would make the tracker claim $3,000 that does not exist.</p><p>If you reassign $100 from the trip to the annual bill, the account balance is unchanged. The goal allocations become $400, $100 and $500. Record the reduction as well as the increase so that the total still matches reality.</p><p>If money is spent from a goal, update the remaining balance. A completed target is a record of progress, not evidence that the spent money remains available.</p>`],
      ['Do a short monthly reconciliation', `<ol><li>Check the real balances of the money you count toward savings.</li><li>Add the amounts allocated to your tracked goals.</li><li>Explain any difference: pending transfer, withdrawal or unassigned money.</li><li>Update upcoming bill amounts and remaining contribution dates.</li><li>Choose the next affordable contributions.</li></ol><p>Savings Goal Tracker can keep your named targets and progress together. Use it as an organizational record alongside actual account information. It does not hold or transfer your money.</p>`],
    ],
    sources: ['emergency'],
    faq: [['Do I need a separate bank account for every goal?', 'Not to keep a tracking record. You can assign amounts to separate goals, but their combined allocation must not exceed the money you actually have available for them.'], ['How large should my emergency fund be?', 'There is no amount that suits every situation. Consider your essential costs, income stability and likely unexpected expenses; the CFPB resource below helps frame that decision.']],
  },
  {
    topic: 'savings', slug: 'calculate-savings-goal-contributions',
    title: 'How to Calculate Savings Goal Contributions',
    description: 'Calculate what to save per payday or month using your target, current savings and deadline, with examples for missed and extra deposits.',
    intro: 'Start with the target amount, subtract what is already assigned to it, and divide the remaining gap by the contribution dates before your deadline. Then check whether that amount is affordable.',
    takeaway: 'Contribution per date = (target − current allocated savings) ÷ remaining contribution dates. Use real deposits and real dates when you update the plan.',
    sections: [
      ['Write down three inputs', `<p><strong>Target:</strong> the amount needed for this specific goal. <strong>Current savings:</strong> money already allocated to it, excluding money promised to another goal. <strong>Remaining contribution dates:</strong> the paydays or other dates on which you can contribute before the money is needed.</p><p>A deadline expressed as “in three months” is not the same as three paydays for everyone. Count the actual dates. If a bill is due before the last payday of the month, that payday cannot help pay it on time.</p>`],
      ['Calculate the remaining gap', table('Illustrative goal calculations, excluding interest and fees', ['Target', 'Already allocated', 'Dates remaining', 'Contribution per date'], [
        ['$1,200', '$300', '9', '$100'],
        ['$800', '$200', '12', '$50'],
        ['$2,000', '$500', '10', '$150'],
      ]) + `<p>For the first example, $1,200 minus $300 leaves $900, divided across nine dates. If you already have the full target, the additional amount required is zero. If there are no contribution dates left and a gap remains, the original deadline cannot be met through that schedule.</p><p>These examples show arithmetic rather than recommended savings amounts. The plan still needs to fit essential expenses and other commitments.</p>`],
      ['Round carefully when the answer has cents', `<p>Suppose the gap is $1,000 with six contribution dates remaining. The division gives approximately $166.6667. Six deposits of $166.66 would total $999.96, leaving four cents. One workable schedule is five deposits of $166.67 followed by $166.65.</p><p>For a larger real-world buffer, you might choose a slightly higher target to account for an uncertain expense, but name that buffer separately in your plan. Avoid hiding assumptions in rounded numbers you will no longer understand later.</p>`],
      ['Recalculate after the unexpected', `<p>Return to the $1,200 goal with $300 already saved and nine dates left. After two planned $100 deposits, the allocated balance is $500 and seven dates remain. If the next contribution is missed, the balance stays $500 and six dates remain. The new gap is $700, or about $116.67 per remaining date.</p><p>An extra $100 contribution would reduce that gap instead. Recalculate from the current actual balance; do not add the original plan’s future deposits to money already saved.</p><p>When a higher required amount is not affordable, your available choices include a later deadline, a smaller target or a revised spending plan. A contribution formula shows the tradeoff; it does not choose it for you.</p>`],
      ['Keep a record you can check at a glance', `<p>In Savings Goal Tracker, give the goal a concrete name, record the target and add contributions when they happen. Review its balance against the place where the money is actually held. The app records progress; it does not execute bank transfers.</p><p>If you prefer a challenge with increasing contributions and no fixed purchase date, try the 52-week calculator. If you have several targets, read the guide to separate funds before assigning the same account balance across them.</p><p>A useful plan stays understandable after a busy month: what the goal is for, how much is truly saved, and what remains before the next review.</p>`],
    ],
    sources: ['savings'],
    faq: [['Should I count expected bonuses as current savings?', 'No. Keep expected money in the plan and add it to the saved balance only when you receive and allocate it.'], ['What if I miss a deposit?', 'Subtract the actual current balance from the target and divide by the remaining contribution dates. Then decide whether the new amount or the deadline needs adjustment.']],
  },
];
