// Original explanatory diagrams of examples already present in these articles.
// Data is illustrative where the article says so; none is an app screenshot.
const charts = {
  'percentage-change-vs-percentage-points': {
    kind: 'percentage-points', afterSection: 1,
    title: 'One rise. Two different units.', kicker: 'PERCENTAGE CHANGE',
    alt: 'A rate rises from 40% to 50%: a 10-percentage-point difference, or a 25% relative increase from the starting rate of 40%.',
    caption: 'The same fictional 40% → 50% change is +10 percentage points and +25% relative change. The relative denominator is the original 40, not the new 50.',
    data: { from: 40, to: 50 },
  },
  'compare-fractions-without-decimals': {
    kind: 'fraction-strips', afterSection: 3,
    title: 'Make the pieces the same size.', kicker: 'FRACTION COMPARISON',
    alt: 'Two equal-length strips divided into 24 parts show 5/8 as 15/24 and 7/12 as 14/24. Fifteen shaded parts exceed fourteen.',
    caption: 'Rewrite 5/8 as 15/24 and 7/12 as 14/24. With the same whole and same-sized pieces, the extra shaded twenty-fourth makes 5/8 larger.',
    data: { first: [5, 8], second: [7, 12], denominator: 24 },
  },
  'elapsed-time-across-midnight': {
    kind: 'midnight-timeline', afterSection: 1,
    title: 'Cross midnight without losing the date.', kicker: 'ELAPSED TIME',
    alt: 'A proportional timeline from Monday 23:40 to Tuesday 01:15 has a 20-minute segment to midnight and a 75-minute segment after it, totaling 95 minutes.',
    caption: 'Monday 23:40 → Tuesday 01:15 is 20 + 75 = 95 minutes. This arithmetic example assumes an unchanged UTC offset and no daylight-saving or leap-second change.',
    data: { startHour: 23, startMinute: 40, endHour: 1, endMinute: 15, nextDay: true },
  },
  'count-rectangles-in-a-grid': {
    kind: 'rectangle-boundaries', afterSection: 2,
    title: 'Six cells. Eighteen rectangles.', kicker: 'COUNT EVERY SIZE',
    alt: 'A complete grid with 2 rows and 3 columns has 3 horizontal boundaries and 4 vertical boundaries. Choose a horizontal pair in 3 ways and a vertical pair in 6 ways: 18 rectangles.',
    caption: 'Choose 2 of 3 horizontal boundaries and 2 of 4 vertical boundaries: 3 × 6 = 18. Squares count; only complete, axis-aligned rectangles on the grid lines are included.',
    data: { rows: 2, columns: 3 },
  },
  'weekly-to-monthly-savings': {
    kind: 'weekly-dates', afterSection: 2,
    title: 'Same weekly amount. Different months.', kicker: 'ILLUSTRATIVE SAVINGS PLAN',
    alt: 'Five planned Friday deposits of $25 in January 2027 total $125; four planned Friday deposits of $25 in February total $100. These are planned amounts, not actual deposits.',
    caption: 'The invented $25-every-Friday plan has five dates in January 2027 and four in February. This diagram shows planned contributions, not payroll dates, bank transfers or completed savings.',
    data: { deposit: 25, months: [{ label: 'January 2027', days: [1, 8, 15, 22, 29] }, { label: 'February 2027', days: [5, 12, 19, 26] }] },
  },
  'track-multiple-savings-goals': {
    kind: 'goal-budget', afterSection: 2,
    title: 'Check all the goals against one budget.', kicker: 'FICTIONAL MONTHLY PLAN',
    alt: 'Monthly requirements of $100 for an annual bill, $150 for a trip and $200 for a laptop total $450. A $300 monthly contribution budget leaves a $150 shortfall.',
    caption: 'The original three-goal example requires $450 per month, not $300. The $150 gap must be addressed by a revised plan; a tracker does not make that commitment affordable.',
    data: { budget: 300, goals: [{ name: 'Annual bill', amount: 100 }, { name: 'Trip', amount: 150 }, { name: 'Laptop', amount: 200 }] },
  },
  'count-cooking-oil-calories': {
    kind: 'oil-portion', afterSection: 3,
    title: 'An input is not a measurement of oil eaten.', kicker: 'HYPOTHETICAL LABEL EXAMPLE',
    alt: 'A bottle changes from 842 to 814 grams, giving 28 grams dispensed. At an invented 120 kcal per 14 grams, the input is 240 kcal. Assuming full transfer, retention and even mixing in an 800-gram dish, a 200-gram portion gets a 60-kcal oil allocation.',
    caption: 'The hypothetical label gives 240 kcal for 28 g dispensed. The 60-kcal allocation to a 200 g portion requires all oil to enter and remain in the 800 g batch and be evenly distributed. It is not measured absorption or total meal energy.',
    data: { before: 842, after: 814, labelGrams: 14, labelKcal: 120, batchGrams: 800, portionGrams: 200 },
  },
  'dry-to-cooked-rice-weight': {
    kind: 'rice-equivalent', afterSection: 2,
    title: 'Use the yield of this batch.', kicker: 'ILLUSTRATIVE PLAIN-RICE WORKSHEET',
    alt: 'A 150-gram dry rice input becomes a measured 420-gram cooked batch. A 140-gram cooked portion is one third, representing 50 dry-equivalent grams and 180 kcal under the invented 360-kcal-per-100-gram dry label.',
    caption: 'For this invented plain-rice batch: 150 × 140 ÷ 420 = 50 g dry equivalent, then 50 × 360 ÷ 100 = 180 kcal. It assumes all rice is retained and evenly distributed; this is not a universal cooking ratio.',
    data: { dryGrams: 150, cookedGrams: 420, portionGrams: 140, kcalPer100g: 360 },
  },
  'calories-per-serving-vs-per-container': {
    kind: 'label-scaling', afterSection: 2,
    title: 'Scale the label to the amount eaten.', kicker: 'INVENTED PRODUCT LABEL',
    alt: 'An invented label gives 180 kcal for 40 grams. A measured 70-gram amount is 1.75 labeled servings, giving an approximate label-based estimate of 315 kcal.',
    caption: 'The same hypothetical product and preparation: 70 ÷ 40 = 1.75 servings, and 180 × 1.75 = 315 kcal. This scales a label; it is not a NutriLens result or a recommended portion.',
    data: { servingGrams: 40, labelKcal: 180, eatenGrams: 70 },
  },
  'habit-streak-vs-completion-rate': {
    kind: 'habit-record', afterSection: 2,
    title: 'A short streak can hide a fuller record.', kicker: 'ILLUSTRATIVE DAILY HABIT',
    alt: 'A 14-day daily-habit record completes days 1–5 and 7–11, misses days 6 and 12, and completes days 13–14. Current streak is 2 days, longest is 5 and completion is 12 of 14, about 86%.',
    caption: 'At the end of day 14, the same daily record has a current streak of 2, a longest streak of 5, and 12/14 completed days (about 86%). It illustrates three metrics, not a particular app’s streak rules.',
    data: { days: 14, completed: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14] },
  },
  'dumbbell-workout-volume': {
    kind: 'dumbbell-scope', afterSection: 3,
    title: 'Match the load to the counted movement.', kicker: 'TWO SEPARATE FICTIONAL RECORDS',
    alt: 'Paired reps: 3 sets of 10 with two 12-kg dumbbells use a combined 24-kg load for 720 kg volume load. A different alternating record uses 2 sets of 12 total individual movements at 8 kg for 192 kg.',
    caption: 'These are separate invented records, not one workout or a training recommendation. Paired repetitions use the pair’s load; alternating total repetitions use the moving dumbbell’s load. The kg totals are volume load, not energy or effectiveness.',
    data: { paired: { sets: 3, reps: 10, perHandKg: 12 }, alternating: { sets: 2, totalReps: 12, kg: 8 } },
  },
  'mobile-app-backend-decision': {
    kind: 'booking-authority', afterSection: 3,
    title: 'A saved request is not a confirmed place.', kicker: 'FICTIONAL BOOKING WORKFLOW',
    alt: 'The phone can save a draft request, then send it to the booking service. Only the service’s accepted response confirms the reservation; a saved or sent request does not secure a place.',
    caption: 'The fictional booking service owns availability and accepts or refuses the request. This illustrates responsibility and visible states, not a completed backend design or a guarantee that an existing provider supports every operation.',
    data: { states: ['Draft saved', 'Request sent', 'Reservation confirmed'], owners: ['Phone', 'Await service reply', 'Booking service accepts'] },
  },
};

export const guideCharts = Object.freeze(Object.fromEntries(Object.entries(charts).map(([slug, chart]) => {
  const src = `/assets/guide-charts/${slug}.png`;
  return [slug, Object.freeze({ ...chart, chartType: chart.kind, kind: 'chart', src, width: 1200, height: 675, webp: [480, 800, 1200].map(width => ({ src: src.replace(/\.png$/, `-${width}.webp`), width, height: width * 9 / 16 })) })];
})));
