import { table } from './apps.mjs';

// Editorial examples shared with the independent enumeration regression test.
export const matchCountExamples = [
  [2, 1], [3, 3], [4, 6], [5, 10], [6, 15], [8, 28], [10, 45], [12, 66],
];
export const sixPlayerRounds = [
  [['A', 'F'], ['B', 'E'], ['C', 'D']],
  [['A', 'E'], ['F', 'D'], ['B', 'C']],
  [['A', 'D'], ['E', 'C'], ['F', 'B']],
  [['A', 'C'], ['D', 'B'], ['E', 'F']],
  [['A', 'B'], ['C', 'F'], ['D', 'E']],
];

export default [
  {
    topic: 'math', slug: 'round-robin-match-count', published: '2026-10-09', appPreview: true,
    title: 'Round-Robin Match Count: Formula and 6 Worked Examples',
    description: 'Calculate round-robin matches with n(n − 1)/2. Check a six-player schedule, distinguish matches from rounds, and solve six questions with explained answers.',
    intro: 'If six players each face every other player once, they need 15 matches—not 30. For n players in a complete single round-robin, the match count is n(n − 1) ÷ 2. That counts pairings, not the number of rounds or hours needed.',
    takeaway: 'Count each pair once: multiply the number of players by one fewer player, then divide by two. Six players give 6 × 5 ÷ 2 = 15 matches. If every pair meets twice, double that total to 30.',
    startAction: ['#step-6', 'Try six match-count puzzles ↓'],
    previewCopy: {
      heading: 'Enjoy this counting puzzle? Explore Math Riddles.',
      description: 'Try a separate collection of number and logic puzzles with hints and solutions, or invite a friend to a live 1v1 battle. The match-count questions and schedule here are original website examples, not app levels or an app tournament planner.',
    },
    sections: [
      ['State the rules before counting matches', `<p>A <strong>single round-robin</strong> means every player faces every other player exactly once. The same rule works for teams: replace “players” with “teams.” Nobody plays themselves, and A versus B is the same pairing as B versus A.</p><p>Assume everyone completes all their matches. If the question includes withdrawals, repeated meetings, separate groups or a playoff, first decide which matches belong in the total. The formula does not describe every tournament format.</p>`],
      ['Why the round-robin formula divides by two', `<p>With six players, each has five opponents. Multiplying 6 × 5 gives 30 player–opponent entries, but every match appears twice: once in each participant’s list. Dividing by two removes that duplication.</p><p>For n players, the same reasoning gives <strong>n(n − 1) ÷ 2</strong>. Another check is to list only pairs not counted before. A faces five new opponents; B adds four; C adds three; D adds two; E adds one. The sum is 5 + 4 + 3 + 2 + 1 = 15.</p>` + table('All 15 pairings for six players, with no repeated pair', ['Player', 'New opponents only', 'Matches added'], [
        ['A', 'B, C, D, E, F', '5'], ['B', 'C, D, E, F', '4'], ['C', 'D, E, F', '3'],
        ['D', 'E, F', '2'], ['E', 'F', '1'], ['F', 'None left', '0'], ['Total', 'Each pair once', '15'],
      ]) + `<p>The same “choose two distinct things” idea appears in <a href="/guides/count-rectangles-in-a-grid/">counting rectangles in a grid</a>, where you choose pairs of boundary lines instead of opponents.</p>`],
      ['Quick reference: players and total matches', table('Complete single round-robin match counts', ['Players or teams', 'Calculation', 'Matches'], matchCountExamples.map(([players, matches]) => [String(players), `${players} × ${players - 1} ÷ 2`, String(matches)])) + `<p>These totals count one meeting per pair. With only one player there are no opponents and zero matches. Two players need one match; adding a third creates two new pairings, not just one.</p><p>A useful mental check: adding one player to a group of n adds exactly n matches, because the newcomer must face each existing player.</p>`],
      ['Matches are not rounds: a six-player schedule', `<p>A <strong>match</strong> is one meeting between two players. A <strong>round</strong> can contain several simultaneous matches, as long as no player is scheduled twice. Six players can complete their 15 matches in five rounds of three matches, if three playing areas and everyone’s availability allow it.</p>` + table('Six-player single round-robin schedule: every pair meets once', ['Round', 'Match 1', 'Match 2', 'Match 3'], sixPlayerRounds.map((pairs, index) => [String(index + 1), ...pairs.map(pair => pair.join('–'))])) + `<p>Each player appears once in each row, and all 15 pairs appear exactly once across the five rows. The schedule is a paper example, not a Math Riddles app feature.</p><p>For an even number of players, at least n − 1 rounds are needed when a player can play only once per round. For an odd number greater than one, at least n rounds are needed because one player must sit out each round. Complete schedules can reach these minimums with enough simultaneous playing areas and no availability restrictions. With five players, that means five rounds of two matches, with one bye in each round.</p><p>If only one playing area is available, all 15 six-player matches must be played in sequence. Match duration and breaks determine the elapsed time; a match-count formula alone cannot tell you the finish time.</p>`],
      ['Check double round-robin, groups and knockout rules', `<ul><li><strong>Double round-robin:</strong> every pair meets twice. Multiply the single count by two, giving n(n − 1). Six players need 30 matches.</li><li><strong>Separate groups:</strong> count each group separately. Two groups of four produce 6 + 6 = 12 group-stage matches if there is no cross-group play. Add any later playoffs separately.</li><li><strong>Single-elimination knockout:</strong> this is a different format. With n entrants and one elimination per match, n − 1 eliminations leave one winner. Extra placement matches or a third-place match change that total.</li></ul><p>Do not multiply by two just because a match has two participants. That is exactly the duplication the single round-robin formula already removes.</p>`],
      ['Try six original match-count puzzles', `<p>These questions were written for this guide and are separate from app levels. Assume all stated matches are completed. Try each answer before opening its explanation.</p>
<div class="guide-faq">
<details><summary>1. Four players each meet every other player once. How many matches?</summary><p><strong>6 matches.</strong> Each of four players has three opponents: 4 × 3 ÷ 2 = 6. Listing AB, AC, AD, BC, BD and CD checks the result without a formula.</p></details>
<details><summary>2. Five players play a complete single round-robin. How many matches?</summary><p><strong>10 matches.</strong> Calculate 5 × 4 ÷ 2. The odd number of players creates byes in a simultaneous schedule; it does not change the pair-count formula.</p></details>
<details><summary>3. Six players play once per pair. Is 30 the correct total?</summary><p><strong>No: 15 matches.</strong> The calculation 6 × 5 counts each pair from both players’ perspectives. Divide 30 by two.</p></details>
<details><summary>4. Eight teams each face every other team once. How many matches?</summary><p><strong>28 matches.</strong> There are 8 × 7 = 56 team–opponent entries. Every match uses two of those entries, so 56 ÷ 2 = 28.</p></details>
<details><summary>5. Six players each meet every opponent twice. How many matches?</summary><p><strong>30 matches.</strong> A single round-robin has 15 pairs; two meetings per pair give 15 × 2 = 30. The reverse listing alone is not a second meeting unless the rules say so.</p></details>
<details><summary>6. A complete single round-robin had 28 matches. How many players?</summary><p><strong>8 players.</strong> Look for consecutive numbers whose product is 56, because the pair count was halved. 8 × 7 = 56, and 56 ÷ 2 = 28. This inference requires the complete single-round-robin rule; 28 arbitrary matches do not establish the number of players.</p></details>
</div>`],
      ['Take the counting method into your next puzzle', `<p>Write the objects being paired, decide whether order matters, and check whether a pair can repeat. This short checklist is often more useful than remembering a formula without its conditions. The <a href="/guides/math-puzzle-strategies/">math puzzle strategy guide</a> explains how to keep those constraints visible.</p><p>For a different challenge, explore <a href="/math-riddles/">Math Riddles for iPhone, iPad and Android</a>. It offers number and logic puzzles with hints and solutions, plus private live 1v1 rooms for playing a friend. The <a href="/guides/play-math-games-with-friends/">friend-game walkthrough</a> explains that separate feature; the app does not organize the round-robin schedule shown here.</p><p>Math Riddles is free to download with ads and optional in-app purchases. Some mini-games and battle options require Premium. Check the current store listing before choosing a plan or assuming unlimited play.</p>`],
    ],
    sources: [],
    faq: [
      ['What is the formula for a single round-robin tournament?', 'For n players or teams, the number of matches is n(n − 1) ÷ 2 when every distinct pair meets exactly once.'],
      ['How many matches do six players need?', 'A complete single round-robin needs 15 matches. A double round-robin needs 30. With enough playing areas, the single version can fit into five rounds of three matches.'],
      ['Does an odd number of players change the match-count formula?', 'No. It changes the simultaneous schedule: one player has a bye in each full round. Five players still have 10 distinct pairings.'],
      ['Can a single round-robin have seven matches?', 'Not if every pair completes exactly one match. Four players give six matches and five give ten, so seven requires a different or incomplete format.'],
    ],
  },
];
