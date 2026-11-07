import { table } from './apps.mjs';

export const fourFoursSolutions = Object.freeze([
  Object.freeze({ target: 0, expression: '4 + 4 - 4 - 4' }),
  Object.freeze({ target: 1, expression: '4 / 4 + 4 - 4' }),
  Object.freeze({ target: 2, expression: '4 / 4 + 4 / 4' }),
  Object.freeze({ target: 3, expression: '(4 + 4 + 4) / 4' }),
  Object.freeze({ target: 5, expression: '(4 * 4 + 4) / 4' }),
  Object.freeze({ target: 6, expression: '4 + (4 + 4) / 4' }),
  Object.freeze({ target: 8, expression: '4 + 4 + 4 - 4' }),
  Object.freeze({ target: 9, expression: '4 + 4 + 4 / 4' }),
  Object.freeze({ target: 12, expression: '4 * (4 - 4 / 4)' }),
  Object.freeze({ target: 15, expression: '4 * 4 - 4 / 4' }),
  Object.freeze({ target: 16, expression: '4 * 4 + 4 - 4' }),
  Object.freeze({ target: 24, expression: '(4 * 4) + 4 + 4' }),
]);

const answerList = table('Original four-fours practice: each row uses four 4s exactly once', ['Target', 'One valid expression'], fourFoursSolutions.map(({ target, expression }) => [String(target), expression]));
const diagram = `<figure class="four-fours-flow"><ol><li><strong>Four tokens</strong><span>Write exactly four 4s</span></li><li><strong>State the rules</strong><span>Basic operations and parentheses</span></li><li><strong>Respect order</strong><span>Multiplication and division before addition</span></li><li><strong>Check the target</strong><span>Count digits and calculate independently</span></li></ol><figcaption>Original text diagram for this website puzzle, not a Math Riddles app screen or level.</figcaption></figure>`;

export default [{
  topic: 'math', slug: 'four-fours-make-24-puzzle', published: '2026-11-07',
  editorialFormat: 'puzzle', appPreview: true, showToolAction: false,
  title: 'Four 4s Puzzle: Make 24 and Solve 11 More Targets',
  description: 'Use exactly four 4s to make 24, then try 11 more target numbers. See checked answers, parentheses and order-of-operations rules.',
  intro: 'Make 24 with exactly four 4s: (4 × 4) + 4 + 4 = 24. This solution uses multiplication first, then adds the remaining two 4s. Keep the rule fixed—four copies of the digit 4, each used once—and check both the arithmetic and the digit count before accepting an answer.',
  takeaway: 'Write the allowed operations before solving. The practice below uses addition, subtraction, multiplication, division and parentheses; each expression contains exactly four 4s. It does not use concatenation, decimals, factorials, exponents or other digits.',
  previewCopy: {
    heading: 'Want another kind of number puzzle?',
    description: 'Math Riddles is a separate mobile collection of number and logic puzzles with hints and solutions. This four-fours worksheet is original website practice, not an app level or a four-fours game mode.',
  },
  sections: [
    ['Start with the 24 solution and write the rules', `<p>The target is 24. A valid answer is <strong>(4 × 4) + 4 + 4 = 24</strong>: multiply the first pair to get 16, then add 4 and 4. Count the digits in the written expression—there are exactly four. Parentheses make the grouping visible, even though ordinary order of operations also evaluates the multiplication before addition.</p>${diagram}<p>For this page, use exactly four 4s and only <code>+</code>, <code>−</code>, <code>×</code>, <code>÷</code> and parentheses. Use standard order of operations. Do not join digits into 44 or introduce a decimal point, factorial, exponent or another number. Puzzle collections sometimes permit different rules; an answer is valid only under the rule set being used.</p><p>These are invented educational expressions, not solutions copied from a numbered game. First write the allowed symbols on paper, then test the expression. If you get a different result, check the grouping and operation order before deciding the puzzle is impossible.</p>`],
    ['Try a target before opening the answer list', `<p>Using the same rules, make <strong>0, 1, 2, 3, 5, 6, 8, 9, 12, 15 and 16</strong>. Try one target at a time. For each answer, check that the expression has four digit-4 tokens and that the operations produce the target.</p><p>When you are ready, compare your expressions with one valid set of answers. Some targets can have more than one valid expression; the list gives one per target.</p>${answerList}<p>Every row uses the same four allowed operations and ordinary precedence. For example, <strong>(4 × 4 + 4) ÷ 4 = 5</strong> because 16 + 4 = 20 and 20 ÷ 4 = 5. The parentheses keep the numerator together.</p>`],
    ['Check the answer without guessing', `<p>Use this four-step check for each line:</p><ol><li><strong>Count:</strong> exactly four digit-4 tokens appear.</li><li><strong>Scan:</strong> no unallowed symbol or extra number appears.</li><li><strong>Group:</strong> parentheses are balanced and show the intended order.</li><li><strong>Calculate:</strong> evaluate multiplication and division before addition and subtraction, moving left to right within the same precedence level.</li></ol><p>For 24, the grouped expression is (4 × 4) + 4 + 4 = 16 + 4 + 4 = 24. A common mistake is to calculate an unparenthesized string strictly left to right even when multiplication appears before addition. Another is to use a fifth 4 while trying to repair an expression. Count the symbols again after making any change.</p><p>If a different puzzle source allows concatenation, factorials or decimal points, treat those as separate rules. Do not silently borrow them for this worksheet: adding an operation changes which answers are permitted.</p>`],
    ['Try changing the target, not the rule halfway through', `<p>Choose a new whole-number target and see whether you can make it with four 4s under the stated rules. Write a proposed expression first, then check it with the same count and precedence steps. If you cannot find one, label it “not solved yet”; a short search is not proof that no expression exists.</p><p>For a different style of number reasoning, read the <a href="/guides/target-sum-number-puzzles/">target-sum puzzle set</a> or the <a href="/guides/order-of-operations-puzzles/">order-of-operations practice</a>. Those pages use their own stated rules and answer checks.</p><p>For more number and logic puzzles on a phone, explore <a href="/math-riddles/">Math Riddles</a>. The app’s store listings describe a separate collection with hints and solutions; this guide does not claim that the four-fours puzzle appears in the app. Check your store for current availability and purchase details.</p>`],
  ],
  sources: ['mathStore', 'mathGoogleStore'],
  faq: [
    ['How do you make 24 with four 4s?', 'One solution is (4 × 4) + 4 + 4 = 24. It uses exactly four 4s and standard arithmetic operations.'],
    ['Can I use 44 in the four-fours puzzle?', 'Not under this guide’s rules. Each 4 must remain a separate digit; concatenation, decimals, factorials and exponents are excluded. Other versions may set different rules.'],
    ['What order of operations should I use?', 'Evaluate parentheses first, then multiplication and division from left to right, then addition and subtraction from left to right.'],
    ['Are the answers shown Math Riddles app levels?', 'No. These are original website exercises. The app has its own separately described math and logic puzzles; this page does not claim a four-fours mode.'],
  ],
}];
