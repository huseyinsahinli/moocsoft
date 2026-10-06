// Original website exercises, separate from numbered Math Riddles app levels.
// Each question supplies enough constraints for one numeric answer.
export const mathChallenge = [
  {
    id: 'brackets', category: 'Order of operations', title: 'Brackets before speed',
    question: 'What is 9 + 4 × (8 − 5)?', display: '9 + 4 × (8 − 5) = ?',
    answer: 21,
    hint: 'Calculate the brackets first. Multiplication comes before the final addition.',
    explanation: '8 − 5 = 3. Then 4 × 3 = 12, and 9 + 12 = 21. Adding 9 and 4 first would change the expression.',
    guide: '/guides/order-of-operations-puzzles/', guideLabel: 'Practise order of operations',
  },
  {
    id: 'row-rule', category: 'Missing number', title: 'Follow the row rule',
    question: 'Every row uses first × second + first. The examples are 3, 4 → 15 and 5, 6 → 35. What is the result for 7, 8?',
    display: '3, 4 → 15 · 5, 6 → 35 · 7, 8 → ?',
    answer: 63,
    hint: 'Apply the stated rule to the final pair, not to the preceding result.',
    explanation: 'The stated rule gives 7 × 8 + 7 = 56 + 7 = 63. It also checks both examples: 3 × 4 + 3 = 15 and 5 × 6 + 5 = 35. Giving the rule prevents several invented patterns from fitting a short list.',
    guide: '/guides/missing-number-puzzles-with-answers/', guideLabel: 'Try more missing-number puzzles',
  },
  {
    id: 'reversed-digits', category: 'Digit logic', title: 'Reverse the digits',
    question: 'I am a two-digit positive whole number. My digits add to 13. Reversing them produces a number 27 greater than me. What number am I?',
    display: 'Digit sum: 13 · Reversed number − original: 27',
    answer: 58,
    hint: 'The units digit must be larger. Reversing two digits changes the number by nine times their difference.',
    explanation: 'Let the tens digit be a and the units digit be b. The difference is (10b + a) − (10a + b) = 9(b − a). Therefore b − a = 3. Together with a + b = 13, this gives a = 5 and b = 8. The number is 58: 85 − 58 = 27.',
    guide: '/guides/math-puzzle-strategies/', guideLabel: 'Build a puzzle-solving checklist',
  },
  {
    id: 'fraction', category: 'Equivalent fractions', title: 'Keep the fraction equal',
    question: 'Fill the missing numerator: ? / 12 = 5 / 6. Enter the numerator only.',
    display: '? / 12 = 5 / 6',
    answer: 10,
    hint: 'The denominator doubles from 6 to 12. Apply the same change to the numerator.',
    explanation: 'Multiply both parts of 5/6 by 2: 5 × 2 = 10 and 6 × 2 = 12. Thus 10/12 equals 5/6. As a second check, 10 × 6 and 5 × 12 both equal 60.',
    guide: '/guides/compare-fractions-without-decimals/', guideLabel: 'Compare fractions without decimals',
  },
  {
    id: 'rectangles', category: 'Grid counting', title: 'Count more than the small boxes',
    question: 'A grid has 2 rows and 3 columns of equal square cells. How many rectangles of all sizes have sides on its grid lines? Include squares as rectangles; do not count tilted shapes.',
    display: '2 rows × 3 columns · Count all axis-aligned rectangles',
    grid: { rows: 2, columns: 3 },
    answer: 18,
    hint: 'A rectangle is determined by choosing two horizontal grid lines and two vertical grid lines.',
    explanation: 'There are 3 horizontal grid lines, giving 3 possible pairs, and 4 vertical grid lines, giving 6 possible pairs. Each combination makes one rectangle, so 3 × 6 = 18. Counting by size gives the same total: 6 + 4 + 2 one-row rectangles and 3 + 2 + 1 two-row rectangles.',
    guide: '/guides/count-rectangles-in-a-grid/', guideLabel: 'See the grid formula and more counting puzzles',
  },
];
