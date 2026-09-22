import { table } from './apps.mjs';

export default [
  {
    topic: 'math', slug: 'how-to-solve-number-pattern-puzzles', published: '2026-09-22',
    title: 'How to Solve Number Pattern Puzzles Step by Step',
    description: 'Learn a repeatable method for solving number pattern puzzles, with worked examples for differences, ratios, alternating rules and position-based sequences.',
    intro: 'A number sequence becomes easier when you stop guessing the next term and start testing one small rule at a time. This guide gives you a checklist you can reuse on unfamiliar pattern puzzles.',
    takeaway: 'Write the gaps between terms, test simple multiplication or division, look for alternating rules, and verify your idea against every transition—not only the final two numbers.',
    sections: [
      ['Start with the differences between terms', `<p>For the sequence <strong>4, 7, 10, 13, ?</strong>, subtract each term from the one after it. The differences are +3, +3 and +3, so the simplest rule is “add three.” The next term is 16.</p><p>Do not stop after checking one pair. A rule is useful only if it explains every visible transition. In <strong>2, 5, 10, 17, ?</strong>, the differences are +3, +5 and +7. Those differences form their own pattern: consecutive odd numbers. The next difference is +9, which gives 26.</p><p>When first differences are not constant, write a second difference row. This turns a visual hunch into something you can test.</p>`],
      ['Check ratios when the values grow quickly', `<p>A sequence such as <strong>3, 6, 12, 24, ?</strong> grows too quickly for a small fixed addition. Divide each term by the previous one: every ratio is 2. The next term is therefore 48.</p><p>Some puzzles combine multiplication and addition. For <strong>2, 5, 11, 23, ?</strong>, each term is the previous term multiplied by 2, then increased by 1. Applying the same two-step rule gives 47.</p><p>Keep the order of operations visible in your notes. “Multiply by two, then add one” is not the same as “add one, then multiply by two.”</p>`],
      ['Test alternating and interleaved rules', table('Worked alternating-pattern example', ['Position', 'Term', 'Change from previous term'], [
        ['1', '5', '—'], ['2', '8', '+3'], ['3', '16', '×2'], ['4', '19', '+3'], ['5', '38', '×2'], ['6', '41', '+3'],
      ]) + `<p>Here the operation alternates between +3 and ×2. Another common construction interleaves two independent sequences. In <strong>2, 10, 4, 20, 6, 30, ?</strong>, the odd positions are 2, 4, 6, … while the even positions are 10, 20, 30, … . The seventh term belongs to the odd-position sequence, so it is 8.</p><p>If one rule almost works but repeatedly fails at every second term, split the odd and even positions before inventing a complicated formula.</p>`],
      ['Use the term position when the numbers look familiar', `<p>The position can be part of the rule. The sequence <strong>1, 4, 9, 16, 25</strong> contains square numbers: 1², 2², 3², 4² and 5². Triangular numbers, powers of two and Fibonacci-style sums also appear often, but a familiar-looking list is not proof by itself.</p><p>Label the positions 1, 2, 3 and so on, then state the connection clearly. If your explanation depends on an exception that appears nowhere in the question, look for a simpler rule first.</p>`],
      ['Verify the rule before choosing an answer', `<ol><li>Apply the proposed rule from the first term onward.</li><li>Check every transition, including any alternating steps.</li><li>Confirm that your next value matches the position being asked for.</li><li>If two rules fit, prefer the simpler rule supported by the puzzle’s format and answer choices.</li></ol><p>Math Riddles includes handcrafted number and logic puzzles with hints and solutions, so you can compare your reasoning after committing to an answer. Use the solo journey to practise at your own pace, or try the same question against a friend in a live 1v1 match.</p>`],
    ],
    sources: [],
    faq: [
      ['What should I check first in a number pattern?', 'Start with the differences between consecutive terms. If the values grow quickly, also check ratios. Then test alternating operations or separate odd and even positions.'],
      ['Can a number sequence have more than one valid answer?', 'A short sequence can sometimes support several mathematical rules. Puzzle context, answer choices and the simplest rule that explains every term usually indicate the intended answer.'],
    ],
  },
  {
    topic: 'math', slug: 'mental-math-games-for-adults', published: '2026-09-22',
    title: 'Mental Math Games for Adults: A Practical Practice Routine',
    description: 'Build a short mental-math practice routine with estimation, number bonds, percentage shortcuts and quick games you can repeat without worksheets.',
    intro: 'Mental math practice does not need a long worksheet. A few focused rounds can help you become more comfortable estimating totals, splitting numbers and checking whether an answer is reasonable.',
    takeaway: 'Practise one skill at a time, explain the shortcut you used, and value accurate reasoning before speed. A ten-minute routine is enough to create a repeatable habit.',
    sections: [
      ['Warm up with number bonds', `<p>Number bonds are pairs that make a convenient total. For example, 37 needs 63 to reach 100, and 68 needs 32. These pairs make later addition and subtraction easier because you can bridge through a round number.</p><p>Try a one-minute round: choose a target such as 10, 50 or 100 and name the complement of each number you see. Then reverse the direction—start with the complement and recover the original number.</p>`],
      ['Split addition into friendly parts', `<p>Instead of adding 48 + 37 in one jump, move 2 from 37 to 48. You now have 50 + 35 = 85. For 196 + 58, add 4 to reach 200 and then add the remaining 54, giving 254.</p><p>This compensation method works because you are redistributing part of one addend, not changing the total. Say the intermediate step aloud until the move feels obvious.</p>`],
      ['Estimate before calculating exactly', table('Example estimation rounds', ['Question', 'Fast estimate', 'Exact answer'], [
        ['49 × 21', '50 × 20 ≈ 1,000', '1,029'],
        ['19% of 81', '20% of 80 ≈ 16', '15.39'],
        ['$7.80 + $12.15 + $4.10', '$8 + $12 + $4 ≈ $24', '$24.05'],
      ]) + `<p>An estimate is not a failed exact answer. It is a separate tool for checking scale. If your exact calculation for 49 × 21 produces 10,029, the estimate immediately tells you to inspect the arithmetic or the decimal place.</p>`],
      ['Practise percentages by building from 10%', `<p>Ten percent is one tenth, so 10% of 240 is 24. From there, 5% is half of 24, and 15% is 24 + 12 = 36. For 25%, divide by four; for 50%, divide by two.</p><p>Run a quick game with prices or round numbers: calculate 10%, then combine it to form 5%, 15%, 20% or 30%. Keep the base number visible and avoid racing until you can explain each step.</p><p>Change the direction occasionally. If a $60 item is reduced by 25%, first find the $15 reduction and then subtract it to get $45. Keeping the discount and final price as separate steps makes the calculation easier to check.</p>`],
      ['Turn ten minutes into a simple game', `<ol><li><strong>Two minutes:</strong> complements to 10, 50 or 100.</li><li><strong>Three minutes:</strong> addition and subtraction by compensation.</li><li><strong>Two minutes:</strong> estimate first, then calculate.</li><li><strong>Three minutes:</strong> solve a varied puzzle and explain the rule.</li></ol><p>Math Riddles combines short brain games with a solo puzzle journey, so you can vary the final round without building your own question list. When you want a social version, open a private 1v1 room and compare accuracy and response time on the same questions.</p>`],
    ],
    sources: [],
    faq: [
      ['Do mental math games need a timer?', 'No. Start without a timer and focus on a method you can explain. Add a gentle time limit only after the process is accurate and comfortable.'],
      ['How often should adults practise mental math?', 'A short, repeatable session is easier to maintain than an occasional marathon. Choose a schedule that fits you and vary the skill when practice becomes automatic.'],
    ],
  },
  {
    topic: 'math', slug: 'math-puzzle-strategies', published: '2026-09-22',
    title: 'Math Puzzle Strategies: Operations, Sequences and Hidden Rules',
    description: 'Use a clear checklist for math puzzles: identify the question type, test operations, track constraints, reject near-matches and verify the final rule.',
    intro: 'Most frustrating math puzzles become manageable once you separate observation from calculation. The goal is not to try every formula—it is to identify the puzzle type and test the smallest plausible rule.',
    takeaway: 'Classify the puzzle, write down what must stay true, test a simple rule on every example, and reject explanations that only fit part of the evidence.',
    sections: [
      ['Identify the puzzle family first', `<p>Ask what kind of relationship the layout suggests. A horizontal list usually points toward a sequence. Several balanced rows may suggest the same operation applied repeatedly. A grid may depend on rows, columns, diagonals or position. A word problem may hide a constraint in ordinary language.</p><p>Naming the family narrows the search. It also prevents you from forcing a sequence technique onto a shape puzzle or treating a visual arrangement as a standard equation.</p>`],
      ['Write the visible facts before calculating', `<p>List the numbers, symbols and repeated structures exactly as shown. Note whether an object changes size, direction or count. If a symbol represents a value, check whether it is identical in every row.</p><p>Then write the target: a missing number, the next term, a comparison or a count. Solving the wrong target quickly is still a wrong solution.</p>`],
      ['Test operations in a controlled order', table('A compact operation checklist', ['Check', 'Useful clue', 'Question to ask'], [
        ['Addition or subtraction', 'Steady gaps or balanced totals', 'Do the same differences repeat?'],
        ['Multiplication or division', 'Rapid growth or repeated scaling', 'Is there a constant ratio?'],
        ['Mixed operations', 'A two-step relationship repeats', 'Is the operation order consistent?'],
        ['Position-based rule', 'Squares, powers or alternating terms', 'Does the term index explain the value?'],
      ]) + `<p>Begin with the simplest operations because they are easier to verify and more common in short puzzles. Parentheses matter: if a rule combines addition and multiplication, write the grouping explicitly instead of relying on memory.</p>`],
      ['Reject rules that only almost work', `<p>A near-match is useful evidence, but it is not a solution. If “add four” explains three transitions and fails on the fourth, either the rule changes in a visible pattern or your hypothesis is incomplete.</p><p>Be suspicious of rules that require a different unexplained exception for each line. Split alternating positions, inspect a second-difference row or reconsider the layout before adding complexity.</p>`],
      ['Use answer choices as a final check, not the method', `<p>Multiple-choice answers can reveal whether you misplaced a sign or applied the correct rule in the wrong order. They should not replace the explanation. Work out the relationship first, then compare the result with the options.</p><p>In Math Riddles, hints and solutions let you inspect the intended reasoning after you answer. Review why a rule works across the whole puzzle, then try a different puzzle type or challenge a friend in live 1v1 mode to practise under light time pressure.</p>`],
    ],
    sources: [],
    faq: [
      ['What is the best first move on a difficult math puzzle?', 'State what the puzzle is asking and classify the layout. Then record the visible relationships before trying operations.'],
      ['Should I use trial and error?', 'Small tests are useful when they are systematic. Write each hypothesis and reject it as soon as it fails a visible example instead of making random calculations.'],
    ],
  },
  {
    topic: 'math', slug: 'play-math-games-with-friends', published: '2026-09-22',
    title: 'Math Games to Play With Friends: Try a Live 1v1 Challenge',
    description: 'Set up a fair math-game challenge with shared questions, short rounds and a useful rematch review, then invite a friend to a private 1v1 room.',
    intro: 'A good two-player math game gives both people the same problem and makes the result easy to understand. Short rounds keep the challenge friendly while still giving you something to discuss afterward.',
    takeaway: 'Agree on the format, use the same questions, reward correct answers before speed, and review one interesting mistake after each round.',
    sections: [
      ['Choose a format both players understand', `<p>Decide whether the round focuses on arithmetic, number patterns, logic or a mixture. Agree on the number of questions and whether calculators or notes are allowed. A clear format avoids arguing about the rules after the first answer.</p><p>For mixed experience levels, use a shorter round or alternate who chooses the category. The purpose can be a close contest, shared practice or simply a quick game—pick the format that fits the people playing.</p>`],
      ['Make accuracy the first condition', `<p>Speed is exciting only when the answer is correct. Score a correct response first, then use time to separate two correct answers. This discourages random tapping and rewards a method that can survive a rematch.</p><p>If the game includes a streak or bonus, explain it before starting. Keep the scoring visible and use the same rule for both players.</p>`],
      ['Set up a private Math Riddles room', `<ol><li>Open Math Riddles and choose the live 1v1 battle option.</li><li>Create a private room and share the room invitation with your friend.</li><li>Confirm that both players are ready before the round begins.</li><li>Solve the same questions and compare the result at the end.</li></ol><p>Current features and availability can vary by platform and version, so check the store listing and the app screen on your device. Use an invitation only with people you intend to play with.</p>`],
      ['Review one question after the match', table('A useful one-minute rematch review', ['Prompt', 'Example response'], [
        ['What type was it?', 'Alternating number sequence'],
        ['Where did the mistake happen?', 'I repeated +3 instead of switching to ×2'],
        ['What will I check next time?', 'Write both operations above the sequence'],
      ]) + `<p>The review does not need to become a lesson. Pick one interesting question, compare methods and start the rematch. Explaining a correct shortcut can be as useful as examining a wrong answer.</p><p>If one player answered correctly much faster, compare the intermediate step rather than only the final number. A useful shortcut is something both players can describe and test on a similar question.</p>`],
      ['Try three variations for the next round', `<ul><li><strong>Accuracy round:</strong> ignore speed and compare only correct answers.</li><li><strong>Category round:</strong> choose number patterns, arithmetic or logic.</li><li><strong>Best-of-three:</strong> play short rounds and switch the category each time.</li></ul><p>If your friend is not available, use the solo journey or quick brain games to practise the same habits. When you are ready, return to a private 1v1 room and see which method holds up under a faster pace.</p>`],
    ],
    sources: [],
    faq: [
      ['Can I play Math Riddles against a specific friend?', 'Math Riddles supports private live 1v1 rooms so you can invite a friend. Check the current app version and store listing for platform availability.'],
      ['How do we keep a math battle fair?', 'Use the same questions and scoring rules, agree on allowed tools before starting, and count correct answers before response speed.'],
    ],
  },
];
