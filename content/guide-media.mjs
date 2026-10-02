// Original diagrams shown in the article, not app screenshots or promotional art.
const originals = {
  'reverse-52-week-savings-challenge': {
    src: '/assets/guide-visuals/reverse-52-week-savings.png',
    width: 1200,
    height: 675,
    alt: 'Four descending savings blocks: $598, $429, $260 and $91 across the 52-week reverse challenge.',
    caption: 'The four 13-week blocks total $1,378. The first weeks require the largest deposits; check the full chart against your budget before starting.',
  },
  '100-envelope-challenge': {
    src: '/assets/guide-visuals/100-envelope-challenge.png',
    width: 1200,
    height: 675,
    alt: 'Numbered envelopes and a 1–100 checklist representing the 100-envelope savings challenge.',
    caption: 'Use the numbered checklist at your own pace. The classic $1–$100 plan totals $5,050; smaller multipliers reduce every deposit.',
  },
  'missing-number-puzzles-with-answers': {
    src: '/assets/guide-visuals/missing-number-puzzles.png',
    width: 1200,
    height: 675,
    alt: 'A missing-number grid with rows 3, 4, 10 and 5, 3, 13, then a blank after 6 and 4; multiply the inputs and subtract two.',
    caption: 'One of the five original practice questions: multiply the two inputs, then subtract 2 in every row. The printable question sheet keeps the answer key separate.',
  },
  'estimate-calories-from-food-photo': {
    src: '/assets/guide-visuals/food-photo-review.png', width: 1200, height: 675,
    alt: 'A full meal plate inside a camera frame, with separate topping and dressing containers to review outside the photo.',
    caption: 'Review the whole serving and any extras added separately. This original illustration is a meal-review checklist, not an app screenshot or an exact calorie measurement.',
  },
  'calories-vs-macros': {
    src: '/assets/guide-visuals/calories-vs-macros.png', width: 1200, height: 675,
    alt: 'A stacked energy bar for an illustrative meal: 30 grams of protein gives 120 kcal, 50 grams of carbohydrate gives 200 kcal, and 15 grams of fat gives 135 kcal, totaling 455 kcal.',
    caption: 'The invented 30 g protein, 50 g carbohydrate and 15 g fat example totals 455 kcal using general 4/4/9 factors. It is a calculation example, not a prescribed meal.',
  },
  'workout-volume-explained': {
    src: '/assets/guide-visuals/workout-volume.png', width: 1200, height: 675,
    alt: 'Three set-volume bars: 10 reps at 50 kg equals 500 kg, 8 reps at 50 kg equals 400 kg, and 8 reps at 45 kg equals 360 kg.',
    caption: 'These three completed sets total 1,260 kg of volume load. Add unequal sets individually; the total does not measure technique, recovery or training quality.',
  },
  'calculate-cigarette-cost-and-savings': {
    src: '/assets/guide-visuals/cigarette-cost.png', width: 1200, height: 675,
    alt: 'Three cigarette-spending bars for the invented five-dollar daily baseline: $5 for one day, $150 for 30 days and $1,825 for 365 days.',
    caption: 'Example baseline: 10 cigarettes a day, with a $10 pack containing 20. The period totals describe that spending assumption, not a bank balance or a prediction of quitting success.',
  },
};

// Small screens download a matching WebP; metadata retains the 1200px PNG.
export const guideMedia = Object.fromEntries(Object.entries(originals).map(([slug, visual]) => [slug, {
  ...visual,
  webp: [480, 800, 1200].map(width => ({
    src: visual.src.replace(/\.png$/, `-${width}.webp`),
    width, height: width * 9 / 16,
  })),
}]));
