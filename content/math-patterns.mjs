import { table } from './apps.mjs';

export default [
  {
    topic: 'math', slug: 'repeating-pattern-puzzles-with-answers', published: '2026-10-06', appPreview: true,
    title: 'Repeating Pattern Puzzles With Answers: Find the Period',
    description: 'Find the minimum period of a repeating pattern, distinguish motifs from concurrent cycles, and try six original puzzles with explained answers.',
    intro: 'The minimum period is the smallest positive shift that leaves a repeating pattern unchanged. For A B A B continuing forever, it is 2, not 4.',
    takeaway: 'Find the shortest repeating motif for a symbol pattern. Use the least common multiple only when independent loops must return together to their complete starting states. A finite prefix alone does not prove future repetition.',
    startAction: ['#step-4', 'Try six repeating-pattern puzzles ↓'],
    previewCopy: {
      heading: 'Enjoy finding the rule? Try a separate riddle collection.',
      description: 'Math Riddles offers number and logic challenges with hints and solutions, plus live 1v1 play. These repeating-pattern exercises were written for the website and are separate from app levels.',
    },
    sections: [
      ['Find the minimum period before a pattern repeats', `<p>A <strong>motif</strong> is a block that repeats; the <strong>minimum period</strong> is the length of the shortest such block. If A B A B is the supplied repeating block, A B already generates the same infinite sequence. Advancing one position changes A to B, while advancing two returns every symbol to the same symbol. The minimum period is therefore 2.</p><p>Test the whole supplied motif, including the join from its end back to its beginning. Matching one pair of letters is not enough.</p>`],
      ['A visible prefix is evidence, not a guarantee', `<p>The four visible terms A B A B could continue with A, but they could also continue with C. Both continuations preserve the four terms already shown. Without a stated rule, neither continuation is forced.</p><p>These exercises explicitly say when a motif repeats forever. In an ordinary puzzle, distinguish “the shortest repeating rule supported by the examples” from a proof about an unspecified future. The <a href="/guides/how-to-solve-number-pattern-puzzles/">number-pattern walkthrough</a> uses the same distinction for finite number sequences.</p>`],
      ['Use LCM when complete independent cycles must return together', `<p>Suppose one dial cycles through three distinct positions and another through four. Both start at their marked starting positions and move one step at the same time. The first returns after 3, 6, 9, 12 steps; the second after 4, 8, 12. Their first shared return is <strong>12 steps</strong>, the least common multiple, or LCM, of 3 and 4.</p><p>This applies to independent loops with those full state-cycle lengths. It is not a shortcut for every symbol motif. If several states display the same symbol, the visible pattern may repeat sooner than the complete state does.</p>`],
      ['Try six original repeating-pattern puzzles', `<p>Answer before opening each explanation. Positions are counted from 1, and a stated repeating block continues unchanged forever. These are website exercises, not solutions to numbered app levels.</p>
<div class="guide-faq">
<details><summary>1. The block A B A B repeats. What is the minimum period?</summary><p><strong>2 positions.</strong> The shorter motif A B generates the same sequence. A shift of one fails because A and B differ. Four is also a period, but it is not the minimum.</p></details>
<details><summary>2. The block C D D C D D repeats. What is the minimum period?</summary><p><strong>3 positions.</strong> C D D occurs twice inside the block. Shifts of one and two both move the first C onto a D; shifting three preserves every symbol.</p></details>
<details><summary>3. The block K K K K repeats. What is the minimum period?</summary><p><strong>1 position.</strong> Every position contains K, including across the block boundary. The supplied four-symbol block is longer than the smallest motif.</p></details>
<details><summary>4. X Y Z repeats forever. What is the 17th symbol?</summary><p><strong>Y.</strong> Five complete three-symbol blocks use 15 positions. Position 17 is the second position of the next block, so it contains Y.</p></details>
<details><summary>5. Independent 4-state and 6-state loops start together. After how many steps do both first return?</summary><p><strong>12 steps.</strong> Return times must be multiples of both 4 and 6. Checking 4, 8 and 12 finds the first value also divisible by 6.</p></details>
<details><summary>6. Only A B A B is shown, with no rule. Must the fifth symbol be A?</summary><p><strong>No.</strong> A B A B A and A B A B C have the same four-symbol prefix. A repeating rule would justify A; the prefix by itself does not.</p></details>
</div>`],
      ['Check what your answer actually establishes', `<p>State the motif, period or shared return time you found. A block’s printed length can differ from its minimum period; a symbol’s position is not a cycle length.</p><p>For another exercise, try <a href="/guides/missing-number-puzzles-with-answers/">missing-number puzzles with answers</a>. For mixed layouts, use the <a href="/guides/math-puzzle-strategies/">math puzzle strategy checklist</a> to write the constraints before calculating.</p>`],
    ],
    sources: [],
    faq: [
      ['Is the minimum period always the printed block length?', 'No. A B A B has a four-symbol printed block but a minimum period of two because A B already repeats.'],
      ['When should I use LCM for a repeating pattern?', 'Use it when independent loops with known full state-cycle lengths must return to their combined starting state together.'],
      ['Can a finite sequence prove what comes next?', 'Not without constraints on its rule. Several continuations can share the same visible prefix.'],
    ],
  },
  {
    topic: 'math', slug: 'count-rectangles-in-a-grid', published: '2026-10-06', appPreview: true,
    title: 'Count Rectangles in a Grid: Formula and 6 Answered Puzzles',
    description: 'Count every rectangle in a complete grid, including squares. See why a 2-by-3 grid contains 18 rectangles, then try six questions with worked answers.',
    intro: 'A grid with 2 rows and 3 columns contains 18 rectangles of all sizes, including squares. Counting only its six small cells misses rectangles that span several cells. Choose grid-line boundaries or count each possible size to find the total.',
    takeaway: 'For r rows and c columns, choose two of the r + 1 horizontal lines and two of the c + 1 vertical lines. The total is r(r + 1)c(c + 1) ÷ 4, including squares.',
    startAction: ['#step-5', 'Try six rectangle-counting puzzles ↓'],
    previewCopy: {
      heading: 'Ready for a different kind of math riddle?',
      description: 'After the website grid exercises, explore Math Riddles for a separate collection of number and logic challenges, with hints, solutions and live 1v1 play. The original grid questions here are website practice, separate from app levels.',
    },
    sections: [
      ['Decide which shapes count', `<p>This guide uses a complete rectangular grid with <strong>sides on its horizontal and vertical grid lines</strong>. Squares count as rectangles. Tilted shapes and diagonals do not count, and there are no missing cells or broken lines.</p><p>Rows and columns describe the cells, not the boundary lines. Two rows have three horizontal lines; three columns have four vertical lines. The outer border counts too.</p>`],
      ['Choose boundaries to get 18 rectangles in a 2-by-3 grid', `<p>Each rectangle needs a top and bottom boundary. From three horizontal lines, the possible pairs are first–second, first–third and second–third: <strong>3 choices</strong>. From four vertical lines, there are <strong>6 choices</strong> for the left and right boundaries.</p><figure><svg width="400" height="280" viewBox="0 0 400 280" style="display:block;width:100%;max-width:400px;height:auto;color:#e5a181" role="img" aria-labelledby="rectangle-grid-title rectangle-grid-description"><title id="rectangle-grid-title">Two rows and three columns: choose two boundaries in each direction</title><desc id="rectangle-grid-description">Three horizontal lines are labeled A, B, C. Four vertical lines are labeled 1, 2, 3, 4. The rectangle between horizontal lines A and B and vertical lines 1 and 3 is shaded as one example; larger and smaller rectangles also count.</desc><rect x="60" y="40" width="200" height="100" fill="currentColor" fill-opacity=".18"></rect><path d="M60 40h300M60 140h300M60 240h300M60 40v200M160 40v200M260 40v200M360 40v200" fill="none" stroke="currentColor" stroke-width="2"></path><g fill="currentColor" font-size="20" font-family="sans-serif" text-anchor="middle"><text x="60" y="26">1</text><text x="160" y="26">2</text><text x="260" y="26">3</text><text x="360" y="26">4</text><text x="32" y="47">A</text><text x="32" y="147">B</text><text x="32" y="247">C</text></g></svg><figcaption>The shaded 1-by-2 rectangle is just one of 18. Choose any two horizontal and any two vertical boundaries, including the outer border.</figcaption></figure><p>Every horizontal pair works with every vertical pair, so the total is <strong>3 × 6 = 18</strong>. Each selection identifies exactly one rectangle. You are choosing unordered pairs of distinct lines: swapping “top” and “bottom” does not create another shape.</p>`],
      ['Check the answer by counting every size', table('Rectangles by size in a 2-row, 3-column grid', ['Height × width in cells', 'Number of positions'], [
        ['1 × 1', '6'], ['1 × 2', '4'], ['1 × 3', '2'],
        ['2 × 1', '3'], ['2 × 2', '2'], ['2 × 3', '1'],
        ['Total', '18'],
      ]) + `<p>A rectangle h cells high and w cells wide has (r − h + 1)(c − w + 1) possible positions. For example, a 1-by-2 rectangle fits in two horizontal positions in each of two rows: 2 × 2 = 4. Add all six size counts to confirm 18.</p>`],
      ['Apply the same formula to a larger complete grid', `<p>A grid with r rows has r + 1 horizontal boundaries. The number of pairs is r(r + 1) ÷ 2. Similarly, c columns provide c(c + 1) ÷ 2 vertical pairs. Multiplying gives <strong>r(r + 1)c(c + 1) ÷ 4</strong>.</p><p>For a 3-by-4 grid, the horizontal count is 3 × 4 ÷ 2 = 6 and the vertical count is 4 × 5 ÷ 2 = 10. Therefore it contains 60 rectangles. Use the pair counts before multiplying if the combined formula looks crowded.</p>`],
      ['Try six rectangle-counting questions', `<p>Count rectangles of every size, including squares, with sides on the grid lines. Each question uses a complete grid of square cells.</p>
<div class="guide-faq">
<details><summary>1. How many rectangles are in a 1-row, 1-column grid?</summary><p><strong>1.</strong> Two horizontal and two vertical lines each provide one pair. The single square is also a rectangle.</p></details>
<details><summary>2. How many rectangles are in a 1-row, 4-column grid?</summary><p><strong>10.</strong> There is one horizontal pair and 5 × 4 ÷ 2 = 10 vertical pairs. Counting widths gives 4 + 3 + 2 + 1 = 10.</p></details>
<details><summary>3. How many rectangles are in a 2-row, 2-column grid?</summary><p><strong>9.</strong> Three horizontal lines give three pairs, as do three vertical lines. The total is 3 × 3 = 9.</p></details>
<details><summary>4. How many rectangles are in a 2-row, 3-column grid?</summary><p><strong>18.</strong> Multiply three horizontal pairs by six vertical pairs. The six small cells are only one size within the total.</p></details>
<details><summary>5. How many rectangles are in a 3-row, 4-column grid?</summary><p><strong>60.</strong> Four horizontal lines give six pairs; five vertical lines give ten. Thus 6 × 10 = 60.</p></details>
<details><summary>6. How many rectangles are in a 4-row, 5-column grid?</summary><p><strong>150.</strong> Five horizontal lines give ten pairs; six vertical lines give fifteen. Multiply 10 × 15 = 150.</p></details>
</div>`],
      ['Use the free challenge to check your method', `<p>The <a href="/tools/math-puzzle-challenge/">free Math Puzzle Challenge</a> includes the 2-by-3 grid and an answer check. Solve it before opening the hint, then compare the explanation with your boundary pairs. These original website exercises are separate from Math Riddles app levels.</p><p>If you missed a constraint, use the <a href="/guides/math-puzzle-strategies/">puzzle strategy checklist</a>. For another grid task, try <a href="/guides/missing-number-puzzles-with-answers/">missing-number puzzles</a>; for the products, review <a href="/guides/mental-multiplication-tricks/">mental multiplication shortcuts</a>.</p>`],
    ],
    sources: [],
    faq: [
      ['Do squares count when counting rectangles?', 'Yes, under the rule used here. A square is a rectangle with equal side lengths. Read the question carefully if it excludes squares.'],
      ['Does turning the grid sideways change the total?', 'No. Swapping rows and columns swaps the two pair counts without changing their product.'],
      ['Can I use the formula on a grid with missing lines?', 'Not directly. The formula assumes every chosen pair of horizontal and vertical lines forms a complete rectangle.'],
    ],
  },
];
