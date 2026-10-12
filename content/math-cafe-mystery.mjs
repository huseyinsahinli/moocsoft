import { table } from './apps.mjs';

// This is an original fictional website puzzle, not a Math Riddles level.
export const cafePeople = Object.freeze(['Maya', 'Noah', 'Iris']);
export const cafeDrinks = Object.freeze(['espresso', 'tea', 'cocoa']);
export const cafePrices = Object.freeze([2, 3, 4]);
export const cafeClues = Object.freeze([
  'Maya paid less than Noah.',
  'The cocoa cost $3.',
  'Noah ordered the cocoa.',
  'The tea cost more than the espresso.',
]);
export const cafeAnswer = Object.freeze([
  Object.freeze({ person: 'Maya', drink: 'espresso', price: 2 }),
  Object.freeze({ person: 'Noah', drink: 'cocoa', price: 3 }),
  Object.freeze({ person: 'Iris', drink: 'tea', price: 4 }),
]);

// Exposed for independent tests. The complete four-clue condition does not
// contain the answer fixture; each category must also be used exactly once.
export function satisfiesCafeClues(rows) {
  if (!Array.isArray(rows) || rows.length !== 3) return false;
  const exactly = (values, expected) => values.length === expected.length &&
    new Set(values).size === expected.length && expected.every(value => values.includes(value));
  if (!exactly(rows.map(row => row.person), cafePeople) ||
      !exactly(rows.map(row => row.drink), cafeDrinks) ||
      !exactly(rows.map(row => row.price), cafePrices)) return false;
  const person = name => rows.find(row => row.person === name);
  const drink = name => rows.find(row => row.drink === name);
  return person('Maya').price < person('Noah').price &&
    drink('cocoa').price === 3 && person('Noah').drink === 'cocoa' &&
    drink('tea').price > drink('espresso').price;
}

export default [
  {
    topic: 'math', slug: 'cafe-logic-grid-puzzle-with-answers',
    published: '2026-10-12', editorialFormat: 'puzzle', appPreview: true,
    title: 'Café Logic Grid Puzzle With Answers: Match the Three Orders',
    description: 'Solve an original café logic-grid mystery with four clues, a blank worksheet, optional hints and a fully explained answer. No guessing or sign-up needed.',
    intro: 'Three friends, three drinks and three receipts without names: can you match the orders? Use each clue to rule out impossible pairs, then check every remaining match. This beginner-friendly logic grid has one solution, with hints and the answer below when you want them.',
    takeaway: 'Write the exact categories and clues first. Make a certain match before guessing, use each item once, and check the completed table against all four clues.',
    startAction: ['#step-1', 'Start the café mystery ↓'],
    previewCopy: {
      heading: 'Enjoyed following the clues? Try a different riddle next.',
      description: 'Math Riddles offers a separate solo collection of math and logic puzzles with hints and solutions. This café mystery was created for the website; it is not an app level or a promise of a café-grid game mode.',
    },
    sections: [
      ['The mystery: who ordered what?', `<p>In this fictional café, Maya, Noah and Iris each ordered exactly one drink: an espresso, a tea or a cocoa. Each drink was ordered by exactly one person. The three prices were <strong>$2, $3 and $4</strong>, and each price was paid once. There were no extras, tips or split bills.</p><p>The receipts have lost their names, but the barista remembers four facts:</p><ol>${cafeClues.map(clue => `<li>${clue}</li>`).join('')}</ol><p><strong>Your task:</strong> match each person to a drink and its price. “Less than” and “more than” are strict comparisons: two equal prices would not satisfy either clue. These invented café prices exist only for the puzzle; they are not real menu prices or spending advice.</p><p>This is an original Moocsoft website exercise with fictional characters, not a story about customers or a screenshot or level from Math Riddles. All the facts needed to solve it are above.</p>`],
      ['Make a small logic grid before opening a hint', `<p>Copy the grids onto paper or use your own notes. Mark a possible pair with a question mark, an impossible pair with a cross, and a confirmed pair with a tick. A tick in one row also rules out that column for the other people: nobody shares a drink in this puzzle.</p>` + table('Worksheet one: match each person to a drink', ['Person', 'Espresso', 'Tea', 'Cocoa'], cafePeople.map(person => [person, '?', '?', '?'])) + table('Worksheet two: match each drink to a price', ['Drink', '$2', '$3', '$4'], cafeDrinks.map(drink => [drink.charAt(0).toUpperCase() + drink.slice(1), '?', '?', '?'])) + `<p>Begin with a direct statement such as “Noah ordered the cocoa.” A comparison like “Maya paid less than Noah” becomes more useful after you know one of those prices. Keep the two grids connected: when you know a person's drink and that drink's price, you know the person's price too.</p><p>The displayed worksheet is a static reading aid, not an editable or saved tracker. You can use the clues, hints and answer without JavaScript or an account.</p>`],
      ['Three optional hints, one deduction at a time', `<p>Try the puzzle first. Open only the next hint you need; the later hints reveal more of the solution.</p><div class="guide-faq"><details><summary>Hint 1: Which two clues describe the same drink?</summary><p>The cocoa costs $3, and Noah ordered it. Put those facts together before using either price comparison.</p></details><details><summary>Hint 2: What can Maya have paid?</summary><p>Noah paid $3. Of the available prices $2, $3 and $4, only $2 is strictly less than $3. Maya therefore paid $2, leaving $4 for Iris.</p></details><details><summary>Hint 3: Which of the remaining drinks costs more?</summary><p>Only espresso and tea remain for Maya and Iris. Their prices are $2 and $4. The clue says tea costs more than espresso, so match the cheaper drink to the cheaper receipt.</p></details></div><p>If you reach a contradiction, inspect the last assumption rather than adding a new exception. The categories and clues do not change to accommodate a guess. The <a href="/guides/math-puzzle-strategies/">math puzzle strategy checklist</a> explains the same habit of separating stated facts from hypotheses.</p>`],
      ['Reveal the answer and check every clue', `<div class="guide-faq"><details><summary>Show the complete café answer and explanation</summary>` + table('The unique solution to the fictional café mystery', ['Person', 'Drink', 'Price'], cafeAnswer.map(row => [row.person, row.drink.charAt(0).toUpperCase() + row.drink.slice(1), '$' + row.price])) + `<p><strong>Start with Noah:</strong> he ordered cocoa, which costs $3. Maya must pay less than $3, so she pays $2. Since each price appears exactly once, Iris pays the remaining $4.</p><p>Noah already has cocoa. Espresso and tea must therefore belong to Maya and Iris. Tea costs more than espresso, so tea is the $4 drink and espresso is the $2 drink. That gives Maya espresso and Iris tea.</p><p>Now check the original facts: Maya's $2 is less than Noah's $3; cocoa costs $3; Noah has cocoa; and tea at $4 costs more than espresso at $2. All three people, drinks and prices appear once. Each step is forced, so another complete assignment cannot also satisfy the stated rules.</p></details></div><p>A finished table is not enough if it breaks a clue. Checking all four facts is the difference between finding a plausible story and solving this particular puzzle.</p>`],
      ['Play the mystery with a friend, then try another kind of puzzle', `<p>Share the four clues and the empty grids without sharing the answer. Compare explanations rather than only who finishes first. Ask: “Which match became certain first?” and “Which clue determined the last two drinks?” You do not need a timer or a special scoring system.</p><p>For a new challenge, change the setting only after writing and checking its clues. Renaming drinks changes the story, not the reasoning. Adding or removing a constraint can create several solutions or none at all; do not assume a revised mystery is still uniquely solvable.</p><p>If you want a separate mobile collection, <a href="/math-riddles/">explore Math Riddles</a>. Its current <a href="https://apps.apple.com/us/app/math-riddles-brain-games/id6449851642" target="_blank" rel="noopener">official iOS listing</a> describes solo math riddles with hints and solutions, as well as additional game modes. Check your platform's store for current access and optional purchases. The café grid here is independent website practice, not an advertised feature of the app.</p><p>For another paper-friendly exercise, try the <a href="/guides/missing-number-puzzles-with-answers/">missing-number questions and answer sheet</a>. If you prefer playing with someone, the <a href="/guides/play-math-games-with-friends/">two-player math guide</a> distinguishes a homemade practice round from the app's live match.</p>`],
    ],
    sources: [],
    faq: [
      ['What is the answer to the café logic-grid puzzle?', 'Maya ordered the $2 espresso, Noah ordered the $3 cocoa, and Iris ordered the $4 tea. Each category is used once, and the complete assignment satisfies all four clues.'],
      ['Can this café puzzle have more than one solution?', 'Not with the categories and four clues stated here. Noah’s drink and price are fixed first, which forces the other prices. The tea-versus-espresso comparison then fixes the remaining drinks.'],
      ['Do I need a printable grid or an account?', 'No. The clues, static worksheet, optional hints and answer are visible on this page. You can copy the grids into your own notes, and the answer disclosures work without JavaScript.'],
      ['Is this mystery a level in the Math Riddles app?', 'No. It is an original fictional website puzzle. Math Riddles has its own math-riddle collection and game modes; this page does not promise a café logic-grid mode in the app.'],
    ],
  },
];
