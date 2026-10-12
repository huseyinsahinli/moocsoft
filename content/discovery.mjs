// These are editorial reading choices, not popularity or performance claims.
// Keep identifiers explicit so publishing a new guide does not reorder a journey.
export const editorialFormats = Object.freeze({
  guide: Object.freeze({ key: 'guide', label: 'Practical guide', action: 'Read the guide' }),
  story: Object.freeze({ key: 'story', label: 'Fictional story', action: 'Read the story' }),
  decision: Object.freeze({ key: 'decision', label: 'Decision guide', action: 'Compare the options' }),
  puzzle: Object.freeze({ key: 'puzzle', label: 'Puzzle practice', action: 'Solve the puzzle' }),
});

export function formatFor(guide) {
  const key = guide?.editorialFormat ?? 'guide';
  if (!Object.hasOwn(editorialFormats, key)) {
    throw new Error(`Unknown editorial format for ${guide?.slug || 'guide'}: ${key}`);
  }
  return editorialFormats[key];
}

export const homePicks = Object.freeze([
  'backup-habit-tracker-before-changing-phones',
  'cafe-logic-grid-puzzle-with-answers',
  'website-vs-mobile-app-small-business',
]);

export const productPicks = Object.freeze({
  nutrition: Object.freeze([
    'calories-per-serving-vs-per-container',
    'ai-calorie-scanner-accuracy',
    'track-calories-homemade-meals',
  ]),
  savings: Object.freeze([
    '7-day-no-spend-challenge',
    'calculate-savings-goal-contributions',
    'track-multiple-savings-goals',
  ]),
  quitting: Object.freeze([
    'smoking-trigger-journal-template',
    'quit-smoking-cravings-plan',
    'smoking-slip-reset-and-restart',
  ]),
  training: Object.freeze([
    'log-warm-up-and-working-sets',
    'how-to-log-gym-workouts',
    'workout-planner-vs-workout-log',
  ]),
  habits: Object.freeze([
    'backup-habit-tracker-before-changing-phones',
    'how-to-start-habit-tracking',
    'habit-tracker-for-shift-work',
  ]),
  math: Object.freeze([
    'cafe-logic-grid-puzzle-with-answers',
    'missing-number-puzzles-with-answers',
    'play-math-games-with-friends',
  ]),
});

const journey = (id, title, description, steps) => Object.freeze({
  id, title, description,
  steps: Object.freeze(steps.map(step => Object.freeze(step))),
});

export const readerJourneys = Object.freeze([
  journey('puzzle-break', 'Take a puzzle break',
    'Start with a cafe mystery, try five more original browser questions, then explore the app.', [
      { href: '/guides/cafe-logic-grid-puzzle-with-answers/', label: 'Solve the cafe logic puzzle' },
      { href: '/tools/math-puzzle-challenge/', label: 'Try the free five-question challenge' },
      { href: '/math-riddles/', label: 'Explore Math Riddles' },
    ]),
  journey('keep-your-routine', 'Keep your routine when life changes',
    'Before changing phones, check how your habit records are backed up. Then make your next habit easy to track.', [
      { href: '/guides/backup-habit-tracker-before-changing-phones/', label: 'Check your habit-tracker backup' },
      { href: '/guides/how-to-start-habit-tracking/', label: 'Define one habit and a clear done rule' },
      { href: '/habit-tracker/', label: 'Explore Habit Tracker Daily' },
    ]),
  journey('plan-your-product', 'Decide what your business needs',
    'Compare a website with a mobile app before choosing features or starting a development conversation.', [
      { href: '/guides/website-vs-mobile-app-small-business/', label: 'Compare a website and a mobile app' },
      { href: '/guides/mobile-app-mvp-checklist/', label: 'Outline a focused first release' },
      { href: '/hire-flutter-developer/', label: 'Explore Flutter development services' },
    ]),
]);

function guideMap(guides) {
  if (!Array.isArray(guides)) throw new Error('Discovery requires a guide catalogue');
  const map = new Map();
  for (const guide of guides) {
    if (!guide?.slug || !guide.topic || map.has(guide.slug)) {
      throw new Error(`Invalid or duplicate discovery guide: ${guide?.slug}`);
    }
    formatFor(guide);
    map.set(guide.slug, guide);
  }
  return map;
}

function select(ids, map, context, topic) {
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${context} selection`);
  return ids.map(id => {
    const guide = map.get(id);
    if (!guide) throw new Error(`Missing ${context} guide: ${id}`);
    if (topic && guide.topic !== topic) throw new Error(`Wrong topic in ${context}: ${id}`);
    return guide;
  });
}

export function selectHomePicks(guides) {
  return select(homePicks, guideMap(guides), 'home');
}

export function selectProductPicks(guides, topic) {
  if (!Object.hasOwn(productPicks, topic)) throw new Error(`Unknown product reading topic: ${topic}`);
  return select(productPicks[topic], guideMap(guides), `${topic} product`, topic);
}

export function selectReaderJourneys(guides) {
  const map = guideMap(guides);
  const knownResources = new Set([
    '/tools/math-puzzle-challenge/', '/math-riddles/',
    '/habit-tracker/', '/hire-flutter-developer/',
  ]);
  const journeyIds = new Set();
  for (const item of readerJourneys) {
    if (journeyIds.has(item.id) || item.steps.length < 2 || item.steps.length > 3) {
      throw new Error(`Invalid reader journey: ${item.id}`);
    }
    journeyIds.add(item.id);
    const paths = new Set();
    for (const step of item.steps) {
      const slug = step.href.match(/^\/guides\/([a-z0-9-]+)\/$/)?.[1];
      if (!step.label || paths.has(step.href) || (slug ? !map.has(slug) : !knownResources.has(step.href))) {
        throw new Error(`Invalid step in reader journey ${item.id}: ${step.href}`);
      }
      paths.add(step.href);
    }
  }
  return readerJourneys;
}
