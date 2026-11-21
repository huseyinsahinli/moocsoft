import { table } from './apps.mjs';

export const readerTools = [
  {
    key: 'savings-pace-tracker', topic: 'savings', name: 'Weekly Savings Tracker: Plan vs. Actual Deposits',
    description: 'Use this free savings tracking tool to compare weekly deposits with your plan. See how far ahead or behind you are and what to set aside next week.',
    guide: 'track-savings-pace-after-a-missed-deposit',
    nextStep: 'Want to keep a record between visits? Record contributions in Frugal on your phone. Entries from this calculator stay on this page.',
    fields: [['goal', 'Target amount', '300'], ['opening', 'Starting balance', '60'], ['weeks', 'Total planned weeks (1–104)', '6'], ['entries', 'Net deposits for completed weeks, separated by commas', '40, 0, 55']],
    help: 'Use one currency and plain numbers. Enter 0 for a completed week with no deposit and a negative amount for a withdrawal. Leave future weeks out. A blank list means the plan has just started.',
    example: 'With 60 at the start and a target of 300, six weeks call for 40 per week. Deposits of 40, 0 and 55 leave 155 after week three. The planned balance is 180, so the gap is 25. The remaining 145 can be split into 48.34, 48.33 and 48.33.',
  },
  {
    key: 'repeating-pattern-calculator', topic: 'math', name: 'Repeating Pattern Calculator',
    description: 'Enter a repeating block and a position to find the term, the shortest repeating unit and the number of complete cycles before that term.',
    guide: 'find-nth-term-repeating-pattern',
    fields: [['block', 'One complete repeating block (separate terms with spaces)', 'red blue blue red blue blue'], ['position', 'Position to find (first position is 1)', '100']],
    help: 'Terms can be words, numbers or symbols. Spaces separate terms and capitalization matters. Enter up to 100 terms and a position from 1 to 1,000,000,000.',
    example: 'Red, blue, blue repeats every three positions. Position 99 ends the 33rd cycle. Position 100 starts the next cycle on red. Positions 101 and 102 both land on blue.',
  },
];

export const readerGuides = [
  {
    topic: 'savings', slug: readerTools[0].guide, published: '2026-11-21', appPreview: true,
    title: 'How to Track Savings Progress After a Missed Deposit',
    description: 'Build a weekly savings checkpoint, record a missed deposit or withdrawal, and work out what remains. Try the free savings pace tracker with your own entries.',
    intro: 'Count the missed week as a zero. Add the deposits you actually made to your starting balance, then compare that balance with where you planned to be at the same checkpoint. A later extra deposit can close part of the gap.',
    takeaway: 'A balance answers “How much is there?” A checkpoint answers “Where did I expect to be by now?” Write down both using the same end date.',
    startAction: ['/tools/savings-pace-tracker/', 'Check my savings pace'],
    sections: [
      ['Build a checkpoint you can repeat', '<p>Imagine setting aside 60 before a six-week plan begins. You want 300 by the end. The amount still to save on day one is 240, so the straight-line plan adds 40 each week. The opening 60 appears once, before week one.</p>' + table('A six-week plan at its halfway checkpoint', ['End of week', 'Actual deposit', 'Actual balance', 'Planned balance'], [['1','40','100','100'],['2','0','100','140'],['3','55','155','180']])],
      ['Decide what belongs in the missed week', '<p>Week two has finished, so it belongs in the calculation even though its deposit was zero. Omitting it would make 155 look ahead of the week-two target of 140. Comparing it with the correct week-three target of 180 shows a shortfall of 25. A future week stays empty until that week ends.</p><p>If you deposited 35 and withdrew 10 in the same week, enter 25 as the net movement. A withdrawal of 10 with no deposit is entered as −10. Count only money assigned to this goal.</p>'],
      ['Spread the remaining amount across real deposit dates', '<p>At week three, 300 minus 155 leaves 145. An exact split over three more weeks is 48.34, 48.33 and 48.33. If those dates or amounts no longer suit your plan, record the new deadline separately so you can still explain the original gap. This worksheet assumes no interest or fees.</p><p>Use the <a href="/tools/savings-pace-tracker/">savings pace tracker</a> to repeat the checkpoint with your own numbers. Its entries stay in the current page. For ongoing goal records, explore <a href="/savings-goal-tracker/">Moocsoft’s savings goal app</a>.</p>'],
    ],
    faq: [['What if I have made no deposits yet?', 'Before the first week ends, use only your starting balance. After the first week ends, record a zero if no money moved.'],['What if the last week has already ended?', 'Compare your closing balance with the target. Any difference is the final surplus or shortfall for that plan.']],
    sources: [],
  },
  {
    topic: 'math', slug: readerTools[1].guide, published: '2026-11-21', appPreview: true, editorialFormat: 'puzzle',
    title: 'How to Find the 100th Term of a Repeating Pattern',
    description: 'Find any position in a repeating pattern using the remainder. Solve three boundary puzzles, then check your own sequence with a free pattern calculator.',
    intro: 'Write one complete cycle, subtract one from the position you want, then divide by the cycle length. The remainder counts how many steps to move from the first symbol. In red, blue, blue on repeat, the 100th term is red.',
    takeaway: 'Position 1 starts at offset 0. Using (position − 1) before taking the remainder handles exact multiples and first positions with the same rule.',
    startAction: ['/tools/repeating-pattern-calculator/', 'Find a term in my pattern'],
    sections: [
      ['Read the boundary between two cycles', '<p>Make a bracelet by repeating red, blue, blue. Positions 1, 2 and 3 finish the first cycle. The two blue beads occupy different slots even though they look the same. Choosing a slot by counting distinct colors would give a cycle of two and the wrong answer.</p>' + table('Four beads around the cycle boundary', ['Position', 'Complete cycles before this bead', 'Slot in cycle', 'Color'], [['98','32','2','Blue'],['99','32','3','Blue'],['100','33','1','Red'],['101','33','2','Blue']])],
      ['Check whether a printed block can shrink', '<p>For the block A B A B, two copies of A B fill all four slots exactly. Using a period of two gives the same terms with smaller numbers. A B A is different: when that whole block loops, its boundary is A followed by A. Shortening it to A B would erase that boundary.</p><p>The <a href="/tools/repeating-pattern-calculator/">repeating pattern calculator</a> checks which smaller blocks tile your input exactly. Supply a block that the puzzle actually says repeats. A few observed terms alone cannot determine the continuation.</p>'],
      ['Try three positions before opening the answers', '<details><summary>1. Bell, drum, clap, rest repeats. What is term 64?</summary><p>Rest. The first 63 terms contain 15 full cycles plus three beats. Term 64 is the fourth beat.</p></details><details><summary>2. The printed block is 2 2 7 2 2 7. What is term 31?</summary><p>2. The shortest unit has three slots. The first 30 terms fill ten cycles, so term 31 returns to slot one.</p></details><details><summary>3. A B A repeats. What is term 5?</summary><p>B. Write two copies: A B A | A B A. Slot two of the second copy is position five.</p></details><p>For a fresh set of number and logic problems on your phone, explore <a href="/math-riddles/">Moocsoft’s Math Riddles</a>.</p>'],
    ],
    faq: [['What does a remainder of zero mean?', 'Using (position − 1) modulo period, zero selects the first term. If you divide the original position instead, zero selects the last term.'],['Can the calculator predict an unknown sequence?', 'It assumes the complete block you supply repeats indefinitely. Several different rules can fit a short sample.']],
    sources: [],
  },
];
