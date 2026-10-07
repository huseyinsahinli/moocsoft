// The order is editorial: the closest next step comes first. Each new guide must
// receive its own three choices here before it can be added to the catalogue.
// There is no automatic first-three fallback, so publication order cannot quietly
// change recommendations or send readers to a different topic.
const choices = {
  // Nutrition: improve the estimate, check the inputs, then keep a useful record.
  'estimate-calories-from-food-photo': [
    'estimate-portion-size-from-food-photo',
    'how-to-take-food-photos-for-calorie-tracking',
    'photo-calorie-scanner-app-checklist',
  ],
  'calories-vs-macros': [
    'track-calories-homemade-meals',
    'estimate-calories-from-food-photo',
    'photo-calorie-scanner-app-checklist',
  ],
  'track-calories-homemade-meals': [
    'estimate-portion-size-from-food-photo',
    'calories-vs-macros',
    'food-photo-log',
  ],
  'food-photo-log': [
    'how-to-take-food-photos-for-calorie-tracking',
    'ai-calorie-scanner-vs-food-diary',
    'photo-calorie-scanner-app-checklist',
  ],
  'how-to-take-food-photos-for-calorie-tracking': [
    'estimate-portion-size-from-food-photo',
    'estimate-calories-from-food-photo',
    'food-photo-log',
  ],
  'ai-calorie-scanner-vs-food-diary': [
    'ai-calorie-scanner-accuracy',
    'food-photo-log',
    'track-calories-homemade-meals',
  ],
  'estimate-portion-size-from-food-photo': [
    'how-to-take-food-photos-for-calorie-tracking',
    'track-calories-homemade-meals',
    'restaurant-calorie-estimates',
  ],
  'photo-calorie-scanner-app-checklist': [
    'estimate-portion-size-from-food-photo',
    'how-to-take-food-photos-for-calorie-tracking',
    'calories-vs-macros',
  ],
  'restaurant-calorie-estimates': [
    'estimate-portion-size-from-food-photo',
    'estimate-calories-from-food-photo',
    'photo-calorie-scanner-app-checklist',
  ],
  'ai-calorie-scanner-accuracy': [
    'estimate-calories-from-food-photo',
    'track-calories-homemade-meals',
    'photo-calorie-scanner-app-checklist',
  ],

  // Savings: compare contribution schedules, then connect them to a real goal.
  '52-week-savings-challenge': [
    'reverse-52-week-savings-challenge',
    '100-envelope-challenge',
    'calculate-savings-goal-contributions',
  ],
  'reverse-52-week-savings-challenge': [
    '52-week-savings-challenge',
    'biweekly-savings-plan',
    'calculate-savings-goal-contributions',
  ],
  'sinking-funds-vs-emergency-fund': [
    'calculate-savings-goal-contributions',
    'vacation-savings-goal-plan',
    'savings-goal-tracker-app-vs-spreadsheet',
  ],
  'calculate-savings-goal-contributions': [
    'biweekly-savings-plan',
    'sinking-funds-vs-emergency-fund',
    'savings-goal-tracker-app-vs-spreadsheet',
  ],
  'how-to-save-1000-in-a-year': [
    'biweekly-savings-plan',
    'calculate-savings-goal-contributions',
    '52-week-savings-challenge',
  ],
  'biweekly-savings-plan': [
    'calculate-savings-goal-contributions',
    'how-to-save-1000-in-a-year',
    'savings-tracker-irregular-income',
  ],
  'vacation-savings-goal-plan': [
    'calculate-savings-goal-contributions',
    'sinking-funds-vs-emergency-fund',
    'biweekly-savings-plan',
  ],
  'savings-goal-tracker-app-vs-spreadsheet': [
    'calculate-savings-goal-contributions',
    'sinking-funds-vs-emergency-fund',
    'vacation-savings-goal-plan',
  ],
  '100-envelope-challenge': [
    '52-week-savings-challenge',
    'reverse-52-week-savings-challenge',
    'calculate-savings-goal-contributions',
  ],
  'savings-tracker-irregular-income': [
    'calculate-savings-goal-contributions',
    'sinking-funds-vs-emergency-fund',
    'biweekly-savings-plan',
  ],

  // Quitting: pair the current task with preparation, coping or honest tracking.
  'quit-smoking-calculator-guide': [
    'calculate-cigarette-cost-and-savings',
    'quit-smoking-milestones-to-track',
    'prepare-for-your-quit-date',
  ],
  'quit-smoking-cravings-plan': [
    'smoking-trigger-journal-template',
    'quit-smoking-at-work',
    'smoking-slip-reset-and-restart',
  ],
  'prepare-for-your-quit-date': [
    'quit-smoking-cravings-plan',
    'smoking-trigger-journal-template',
    'quit-smoking-at-work',
  ],
  'quit-smoking-at-work': [
    'quit-smoking-cravings-plan',
    'smoking-trigger-journal-template',
    'prepare-for-your-quit-date',
  ],
  'calculate-cigarette-cost-and-savings': [
    'quit-smoking-calculator-guide',
    'quit-smoking-milestones-to-track',
    'prepare-for-your-quit-date',
  ],
  'quit-smoking-milestones-to-track': [
    'quit-smoking-calculator-guide',
    'calculate-cigarette-cost-and-savings',
    'smoking-slip-reset-and-restart',
  ],
  'smoking-trigger-journal-template': [
    'quit-smoking-cravings-plan',
    'quit-smoking-at-work',
    'smoking-slip-reset-and-restart',
  ],
  'smoking-slip-reset-and-restart': [
    'smoking-trigger-journal-template',
    'quit-smoking-cravings-plan',
    'prepare-for-your-quit-date',
  ],

  // Training: connect planned sessions with actual sets and comparable progress.
  'log-warm-up-and-working-sets': [
    'how-to-log-gym-workouts',
    'workout-volume-explained',
    'track-progressive-overload-workout-log',
  ],
  'how-to-log-gym-workouts': [
    'workout-volume-explained',
    'track-progressive-overload-workout-log',
    'workout-planner-vs-workout-log',
  ],
  'workout-volume-explained': [
    'how-to-log-gym-workouts',
    'track-progressive-overload-workout-log',
    'how-to-track-personal-records-in-gym',
  ],
  'rest-timer-between-sets': [
    'how-to-log-gym-workouts',
    'organize-weekly-workout-plan',
    'track-progressive-overload-workout-log',
  ],
  'organize-weekly-workout-plan': [
    'workout-planner-vs-workout-log',
    'how-to-log-gym-workouts',
    'rest-timer-between-sets',
  ],
  'track-progressive-overload-workout-log': [
    'workout-volume-explained',
    'how-to-track-personal-records-in-gym',
    'how-to-log-gym-workouts',
  ],
  'how-to-track-personal-records-in-gym': [
    'track-progressive-overload-workout-log',
    'how-to-log-gym-workouts',
    'workout-volume-explained',
  ],
  'workout-planner-vs-workout-log': [
    'organize-weekly-workout-plan',
    'how-to-log-gym-workouts',
    'track-progressive-overload-workout-log',
  ],

  // Habits: choose a clear action and schedule, then review or restart accurately.
  'how-to-start-habit-tracking': [
    'habit-tracker-ideas',
    'daily-vs-weekly-habit-tracking',
    'monthly-habit-tracker',
  ],
  'daily-vs-weekly-habit-tracking': [
    'monthly-habit-tracker',
    'habit-streak-vs-completion-rate',
    'habit-tracker-ideas',
  ],
  'habit-streak-vs-completion-rate': [
    'monthly-habit-tracker',
    'restart-habit-after-missing-days',
    'daily-vs-weekly-habit-tracking',
  ],
  'restart-habit-after-missing-days': [
    'how-to-start-habit-tracking',
    'daily-vs-weekly-habit-tracking',
    'habit-streak-vs-completion-rate',
  ],
  'habit-tracker-ideas': [
    'how-to-start-habit-tracking',
    'daily-vs-weekly-habit-tracking',
    'monthly-habit-tracker',
  ],
  'monthly-habit-tracker': [
    'daily-vs-weekly-habit-tracking',
    'habit-streak-vs-completion-rate',
    'restart-habit-after-missing-days',
  ],

  // Math: pair solving methods with practice that exercises the same skills.
  'how-to-solve-number-pattern-puzzles': [
    'repeating-pattern-puzzles-with-answers',
    'math-puzzle-strategies',
    'prime-number-puzzles-with-answers',
  ],
  'mental-math-games-for-adults': [
    'mental-multiplication-tricks',
    'target-sum-number-puzzles',
    'play-math-games-with-friends',
  ],
  'math-puzzle-strategies': [
    'how-to-solve-number-pattern-puzzles',
    'order-of-operations-puzzles',
    'count-rectangles-in-a-grid',
  ],
  'play-math-games-with-friends': [
    'mental-math-games-for-adults',
    'target-sum-number-puzzles',
    'mental-multiplication-tricks',
  ],
  'missing-number-puzzles-with-answers': [
    'how-to-solve-number-pattern-puzzles',
    'math-puzzle-strategies',
    'order-of-operations-puzzles',
  ],
  'order-of-operations-puzzles': [
    'math-puzzle-strategies',
    'missing-number-puzzles-with-answers',
    'target-sum-number-puzzles',
  ],
  'mental-multiplication-tricks': [
    'mental-math-games-for-adults',
    'order-of-operations-puzzles',
    'target-sum-number-puzzles',
  ],
  'compare-fractions-without-decimals': [
    'mental-multiplication-tricks',
    'prime-number-puzzles-with-answers',
    'math-puzzle-strategies',
  ],
  'prime-number-puzzles-with-answers': [
    'how-to-solve-number-pattern-puzzles',
    'compare-fractions-without-decimals',
    'math-puzzle-strategies',
  ],
  'target-sum-number-puzzles': [
    'order-of-operations-puzzles',
    'mental-math-games-for-adults',
    'mental-multiplication-tricks',
  ],
  'repeating-pattern-puzzles-with-answers': [
    'how-to-solve-number-pattern-puzzles',
    'math-puzzle-strategies',
    'missing-number-puzzles-with-answers',
  ],
  'count-rectangles-in-a-grid': [
    'math-puzzle-strategies',
    'missing-number-puzzles-with-answers',
    'mental-multiplication-tricks',
  ],
};

export const relatedGuideMap = Object.freeze(Object.fromEntries(
  Object.entries(choices).map(([slug, targets]) => [slug, Object.freeze(targets)]),
));

export function validateRelatedGuides(catalogue, mapping = relatedGuideMap) {
  if (!Array.isArray(catalogue)) throw new TypeError('Related guides: catalogue must be an array.');
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new TypeError('Related guides: mapping must be an object.');
  }

  const bySlug = new Map();
  for (const guide of catalogue) {
    if (!guide || typeof guide.slug !== 'string' || !guide.slug ||
        typeof guide.topic !== 'string' || !guide.topic) {
      throw new TypeError('Related guides: every catalogue guide needs a slug and topic.');
    }
    if (bySlug.has(guide.slug)) throw new Error(`Related guides: duplicate catalogue slug "${guide.slug}".`);
    bySlug.set(guide.slug, guide);
  }

  for (const slug of Object.keys(mapping)) {
    if (!bySlug.has(slug)) throw new Error(`Related guides: stale mapping for "${slug}".`);
  }
  for (const guide of catalogue) {
    if (!Object.hasOwn(mapping, guide.slug)) {
      throw new Error(`Related guides: missing curated mapping for "${guide.slug}". Add three deliberate same-topic choices.`);
    }
    const targets = mapping[guide.slug];
    if (!Array.isArray(targets) || targets.length !== 3) {
      throw new Error(`Related guides: "${guide.slug}" must have exactly three choices.`);
    }
    const seen = new Set();
    for (const slug of targets) {
      if (slug === guide.slug) throw new Error(`Related guides: self-link for "${guide.slug}".`);
      if (seen.has(slug)) throw new Error(`Related guides: duplicate choice "${slug}" for "${guide.slug}".`);
      const target = bySlug.get(slug);
      if (!target) throw new Error(`Related guides: stale target "${slug}" for "${guide.slug}".`);
      if (target.topic !== guide.topic) {
        throw new Error(`Related guides: wrong-topic choice "${slug}" for "${guide.slug}".`);
      }
      seen.add(slug);
    }
  }
  return true;
}

// Use this factory in the page builder to validate the complete catalogue once.
// The selector returns the original guide objects in their curated display order.
export function createRelatedGuideSelector(catalogue, mapping = relatedGuideMap) {
  validateRelatedGuides(catalogue, mapping);
  const bySlug = new Map(catalogue.map(guide => [guide.slug, guide]));
  const selections = new Map(catalogue.map(guide => [
    guide.slug, Object.freeze(mapping[guide.slug].map(slug => bySlug.get(slug))),
  ]));
  return guide => {
    const slug = typeof guide === 'string' ? guide : guide?.slug;
    const current = bySlug.get(slug);
    if (!current) throw new Error(`Related guides: unknown guide "${slug}".`);
    if (typeof guide === 'object' && guide.topic !== current.topic) {
      throw new Error(`Related guides: topic mismatch for "${slug}".`);
    }
    return selections.get(slug);
  };
}

export function relatedGuides(guide, catalogue) {
  return createRelatedGuideSelector(catalogue)(guide);
}
