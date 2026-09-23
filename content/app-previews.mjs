// Reuse public store screenshots; do not present illustrative UI as an app screen.
export const appPreviews = {
  nutrition: {
    heading: 'See your next meal in NutriLens',
    description: 'Start with a meal photo, then review the estimated calories and macros against what you know about the food.',
    steps: ['Take a photo or choose one from your gallery.', 'Check the identified meal and the estimate.', 'Compare meals or revisit saved scans with the relevant paid features.'],
    note: 'Free to download, with subscriptions and scan credit packs. The iOS listing places detailed analysis and saved-scan history in Premium. Check your store for current access and pricing.',
    image: '/assets/apps/nutrilens/screenshot-2.jpg', width: 554, height: 1200,
    alt: 'NutriLens food analysis screen with a meal photo and estimated nutrition breakdown',
    caption: 'Store screenshot. Detailed analysis includes Premium features; estimates are not measurements.',
  },
  savings: {
    heading: 'Give this plan a home in Savings Goal Tracker',
    description: 'Keep your target and actual contributions together, so the progress you see matches the money you have set aside.',
    steps: ['Create a named goal with an amount and deadline.', 'Record real deposits and withdrawals.', 'Review the remaining amount before the next contribution.'],
    note: 'Free to download. Unlimited goals, custom categories, images, detailed analysis and PDF/Excel exports require Premium. This is a personal tracker, not a bank or money-transfer service.',
    image: '/assets/apps/savings-goal-tracker/screenshot-1.jpg', width: 675, height: 1200,
    alt: 'Savings Goal Tracker showing an example house goal, recorded progress and contribution controls',
    caption: 'Store screenshot with an example goal. Interface may vary by version.',
  },
  training: {
    heading: 'Take your next set into Did You Lift',
    description: 'Keep the plan, actual set results and rest countdown in one workout flow. No account is needed.',
    steps: ['Set a target for each exercise and set.', 'Log the reps and kilograms you actually complete.', 'Move into the automatic rest countdown.'],
    note: 'Free to download with optional lifetime Premium. On iOS, previous logged values, the exercise library and advanced week planning/sharing are Premium features. Check your store for current availability.',
  },
};
