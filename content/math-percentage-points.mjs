import { escape, table } from './apps.mjs';

// Original website exercises. Rates are nonnegative; a zero starting rate is explicitly exceptional.
export const percentagePractice = [
  { id: 1, kind: 'rate', from: 20, to: 30, points: 10, relative: 50,
    question: 'A fictional club’s attendance rate rises from 20% to 30%. Find both changes.',
    answer: '<strong>+10 percentage points and +50% relative change.</strong> Subtract 30 − 20 = 10. Then compare that change with the original 20: 10 ÷ 20 × 100 = 50%. The 10-point gap is half the starting rate, not a 10% relative increase.' },
  { id: 2, kind: 'rate', from: 80, to: 60, points: -20, relative: -25,
    question: 'A practice score falls from 80% to 60%. What are the percentage-point and relative changes?',
    answer: '<strong>−20 percentage points and −25% relative change.</strong> The signed difference is 60 − 80 = −20. Divide by the original 80: −20 ÷ 80 × 100 = −25%. The new rate is three quarters of the old one.' },
  { id: 3, kind: 'rate', from: 12, to: 15, points: 3, relative: 25,
    question: 'A fictional survey share moves from 12% to 15%. Is that a 3% relative rise?',
    answer: '<strong>No: it is +3 percentage points, or a +25% relative rise.</strong> The difference is 3, and 3 ÷ 12 = one quarter. Multiplying by 100 gives 25%. State the unit rather than writing an unlabeled “increase of 3.”' },
  { id: 4, kind: 'wording', from: 50, growth: 10, relativeResult: 55, pointResult: 60,
    question: 'Starting at 50%, compare “increase by 10%” with “increase by 10 percentage points.”',
    answer: '<strong>55% for the relative increase; 60% for the percentage-point increase.</strong> Ten percent of the original 50 is 5, so 50 + 5 = 55. Adding 10 percentage points instead gives 50 + 10 = 60. The two instructions do not mean the same thing.' },
  { id: 5, kind: 'zero', from: 0, to: 8, points: 8, relative: null,
    question: 'A share changes from 0% to 8%. Can you report the usual relative percentage increase?',
    answer: '<strong>The change is +8 percentage points; the usual relative percentage change is undefined.</strong> The relative formula would divide by the original zero. Do not replace that undefined result with 8%, 100% or infinity. Report the starting and ending rates and the point change.' },
  { id: 6, kind: 'count', beforeRate: 60, beforeTotal: 250, afterRate: 70, afterTotal: 200, beforeCount: 150, afterCount: 140,
    question: '60% of 250 members attend first; later, 70% of 200 members attend. Did the number attending rise?',
    answer: '<strong>No. The rate rises by 10 percentage points, but attendance falls from 150 to 140 people.</strong> Calculate 0.60 × 250 = 150 and 0.70 × 200 = 140. That is 10 fewer people. The two rates have different totals behind them, so a higher percentage does not establish a higher headcount.' },
];
const questions = percentagePractice.map(row => `<details data-percentage-practice="${row.id}"><summary>${row.id}. ${escape(row.question)}</summary><p>${row.answer}</p></details>`).join('\n');

export default [{
  topic: 'math', slug: 'percentage-change-vs-percentage-points', published: '2026-10-20',
  editorialFormat: 'puzzle', appPreview: true, showToolAction: false,
  title: 'Percentage Change vs Percentage Points: 6 Examples',
  description: '40% to 50% is a rise of 10 percentage points, not 10% relative growth. Learn both formulas and try six questions with answers, including zero and changing totals.',
  intro: 'A rate rising from 40% to 50% increases by 10 percentage points, but by 25% relative to its original value. Percentage points subtract the two rates; relative percentage change divides that difference by the starting rate. The unit and starting value decide which question you are answering.',
  takeaway: 'For rates written as numbers such as 40 and 50: point change = new − old; relative change = (new − old) ÷ old × 100%. The relative formula requires a nonzero starting value. A change in a rate is also different from a change in the underlying number of people or items.',
  startAction: ['#step-4', 'Try six percentage-change questions ↓'],
  previewCopy: {
    heading: 'Ready for a different number challenge?',
    description: 'These six questions are original website exercises, not Math Riddles levels or a percentage-teaching mode. Explore the separate app for number and logic riddles, hints and solutions.',
  },
  sections: [
    ['Choose the unit before doing the arithmetic', `<p>A percentage describes a quantity relative to a whole, expressed per hundred. A percentage-point change compares two percentage values directly. The <a href="https://service-manual.ons.gov.uk/content/numbers/percentages">ONS guidance on percentages and percentage points</a> distinguishes that direct difference from a relative increase or decrease.</p><p>For an original, fictional example, compare a 40% attendance rate with a later 50% attendance rate. The signed difference is 50 − 40 = <strong>+10 percentage points</strong>. To ask how large that rise is relative to the original rate, divide the difference by 40: 10 ÷ 40 = 0.25, or <strong>+25%</strong>.</p>` + table('Two questions about the same fictional 40% to 50% change', ['Question', 'Calculation', 'Answer and unit'], [
      ['How far did the rate move on the percentage scale?', '50 − 40', '+10 percentage points'],
      ['How large was the rise relative to the starting rate?', '(50 − 40) ÷ 40 × 100', '+25% relative change'],
    ]) + `<p>Neither answer replaces the other. “The rate rose by 10%” is not a precise substitute for “the rate rose by 10 percentage points.” The <a href="https://www.open.edu/openlearn/mod/oucontent/view.php?id=126533&amp;section=_unit7.4">Open University’s percentage-points lesson</a> discusses why the wording matters when interpreting a reported change.</p><p>All practice figures here are invented, not survey findings or evidence that a product improves performance. Compare rates with the same definition, and label the period and population when using real data. These exercises concern nonnegative shares, not every possible negative-base calculation.</p>`],
    ['Keep the original base when the direction changes', `<p>Reversing a change swaps the starting value. From 40% to 50%, the relative increase is 25%. From 50% back to 40%, the relative decrease is <strong>10 ÷ 50 × 100 = 20%</strong>. The point gap has the same size, but the relative denominator is different.</p>` + table('Original examples: directional changes use new minus old', ['From → to', 'Percentage-point change', 'Relative percentage change'], [
      ['40% → 50%', '+10 percentage points', '+25%'],
      ['50% → 40%', '−10 percentage points', '−20%'],
      ['2% → 3%', '+1 percentage point', '+50%'],
      ['0% → 8%', '+8 percentage points', 'Undefined: original rate is zero'],
    ]) + `<p>A small point difference can be a large relative change when the starting rate is small. That arithmetic alone does not tell you whether a result is important, reliable or caused by an intervention.</p><p>For a zero starting rate, the usual relative formula would divide by zero. The point change still has a clear answer: 0% to 8% is +8 percentage points. State those values rather than claiming an infinite or 100% relative increase.</p>`],
    ['Read “by,” “to” and the denominator carefully', `<p>“Increased <strong>to 50%</strong>” gives the final rate. “Increased <strong>by 10 percentage points</strong>” gives an amount to add on that rate scale. “Increased <strong>by 10%</strong>” describes a relative multiplier when that is the intended mathematical instruction.</p><p>Starting at 50%, a 10% relative increase adds 10% of 50, which is 5, giving <strong>55%</strong>. A 10-percentage-point increase gives <strong>60%</strong>. If a headline leaves the meaning unclear, look for the old and new values instead of silently choosing one interpretation.</p><p>A percentage can also hide a changing total. Sixty percent of 250 people is 150; seventy percent of 200 is 140. A rate can rise while the count falls. Recover the counts from their own totals before answering a question about people. The <a href="/guides/compare-fractions-without-decimals/">fraction comparison guide</a> explains the related habit of checking what whole a fraction describes.</p>`],
    ['Try six original questions before revealing the answers', `<p>Give every answer a unit. For a rate change, write the starting rate, ending rate and requested kind of change. For a headcount question, write both totals too. Each question below has a worked explanation that opens without JavaScript; no answers are sent or scores stored.</p><div class="guide-faq">${questions}</div>`],
    ['Use a three-line check for the next problem', `<ol><li><strong>State the two values and their units.</strong> Are they percentages, counts or a final value after an instruction?</li><li><strong>Name the base.</strong> For relative change, use the original value—not the new one. For a count, use the total belonging to that particular rate.</li><li><strong>Check the answer in the original direction.</strong> A +25% relative change from 40 gives 40 × 1.25 = 50. A +10-point change gives 40 + 10 = 50.</li></ol><p>If you miss a question, change just one number and explain the revised result. Keep the wording visible. For example, changing “10%” to “10 percentage points” is a change to the problem, not a different way to write the same answer. Review <a href="/guides/mental-multiplication-tricks/">mental multiplication shortcuts</a> if the division or scaling is slowing down a method you otherwise understand.</p><p>For another practice format, use the <a href="/guides/mental-math-games-for-adults/">adult mental-math routine</a>. For a separate app collection, <a href="/math-riddles/">explore Moocsoft’s Math Riddles</a>, listed as Math Puzzles: Brain Riddles on Google Play. Current official listings describe solo number and logic puzzles with hints and solutions, plus live 1v1 play.</p><p>The app is free to download with ads and optional in-app purchases. Premium adds features such as advanced mini-games and selectable private-battle modes; check the store for your version. These six website exercises do not establish that the app contains these questions or has a dedicated percentage-points course.</p>`],
  ],
  sources: ['onsPercentagePoints', 'openLearnPercentagePoints', 'mathStore', 'mathGoogleStore'],
  faq: [
    ['What is the difference between percentage change and percentage points?', 'Percentage points subtract one percentage value from another. Relative percentage change divides that difference by the original value and multiplies by 100. A move from 40% to 50% is +10 percentage points and +25% relative change.'],
    ['Is a rise from 20% to 30% a 10% increase?', 'It is a rise of 10 percentage points. Relative to the original 20%, the increase is 10 ÷ 20 × 100 = 50%. State which unit you mean.'],
    ['Can I calculate percentage change from zero?', 'The usual relative percentage-change formula is undefined when the original value is zero. You can still state the old and new rates and their percentage-point difference.'],
    ['Does a higher percentage always mean more people?', 'No. The totals may differ. In the fictional example, 60% of 250 is 150 people, while 70% of 200 is 140 people. The rate is higher but the count is lower.'],
  ],
}];
