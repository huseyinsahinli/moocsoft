import { table } from './apps.mjs';

export default [
  {
    topic: 'training', slug: 'track-progressive-overload-workout-log', published: '2026-09-22',
    title: 'How to Track Progressive Overload in a Workout Log',
    description: 'Track load, reps, sets, range, rest and exercise setup so you can compare similar workouts without reducing progress to one number.',
    intro: 'Progressive overload is easier to review when your log shows exactly what changed. More weight is one option, but repetitions, sets and execution context also matter.',
    takeaway: 'Compare the same exercise and setup, record actual results, change one planned variable at a time and keep technique or range notes beside the numbers.',
    sections: [
      ['Choose a repeatable comparison', `<p>Use the same exercise name, equipment and loading convention each time. A cable row on one machine may not be directly comparable with a different machine, even if the stack labels show the same number.</p><p>For dumbbells, decide whether the logged weight describes one dumbbell or the pair. For unilateral work, decide whether reps are per side. Write the convention once and keep it consistent.</p>`],
      ['Record more than the heaviest weight', table('Fields for a comparable workout record', ['Field', 'Why it matters'], [
        ['Actual load', 'Shows external resistance using your chosen convention'], ['Actual repetitions', 'Separates completed work from the target'], ['Sets', 'Shows how many efforts were recorded'], ['Range or setup note', 'Explains a meaningful execution change'], ['Rest interval', 'Adds context between comparable sets'],
      ]) + `<p>You do not need a long diary. A short note such as “same machine, seat 4” can prevent an invalid comparison later.</p>`],
      ['Keep planned targets separate from results', `<p>If the plan says 10 repetitions and you complete 8, record 8. Copying the target into the result hides the information you need for the next session.</p><p>Likewise, record an unplanned load change or shortened session. An honest partial record is more useful than a perfect-looking plan marked complete.</p>`],
      ['Review one variable at a time', `<p>Suppose you complete 3 × 8 at 40 kg one week and 3 × 9 at the same load and setup the next week. Repetitions increased while the other recorded variables stayed similar. If load, exercise, range and rest all change together, it becomes harder to explain the difference.</p><p>Review several comparable sessions rather than treating one unusually good or difficult day as a complete trend. Sleep, equipment availability and interruptions can affect the result even when the written plan is unchanged.</p><p>This does not mean training must change only one variable forever. It means your log should make changes visible so you and an appropriate coach can interpret them.</p>`],
      ['Use Did You Lift for the next comparable session', `<p>Create individual set targets, then enter the reps and kilograms actually completed. Did You Lift keeps the active set and rest countdown together and can show prior values when an exercise returns through optional Premium features.</p><p>A log does not determine whether a progression is appropriate. Use a program suited to your experience, stop for concerning pain or symptoms, and get qualified guidance when needed.</p>`],
    ], sources: [],
    faq: [['Does progressive overload always mean adding weight?', 'No. A program may progress repetitions, sets, load or another controlled variable. Keep the comparison specific and follow suitable guidance.'], ['What should I write in the notes?', 'Record only context that affects comparison, such as equipment, setup, range or an interruption.']],
  },
  {
    topic: 'training', slug: 'how-to-track-personal-records-in-gym', published: '2026-09-22',
    title: 'How to Track Personal Records in the Gym',
    description: 'Define rep, load and volume personal records clearly, compare like-for-like exercises and keep PRs connected to the original workout entry.',
    intro: 'A personal record is only meaningful when you know exactly what was recorded. “Best set” can mean the most weight, the most reps at one load or the largest volume for a defined exercise.',
    takeaway: 'Name the record type, preserve the exercise and equipment context, keep the original set result and avoid comparing different conventions as if they were identical.',
    sections: [
      ['Define the kind of record', table('Common record labels', ['Record type', 'Example', 'What stays fixed'], [
        ['Load PR', 'Heaviest completed set', 'Exercise and rep condition'], ['Rep PR', 'Most reps at 40 kg', 'Load and exercise setup'], ['Volume PR', 'Largest sets × reps × load total', 'Session scope and units'], ['Time PR', 'Longest or fastest defined effort', 'Movement and timing rule'],
      ]) + `<p>These labels describe records; they are not instructions to attempt a maximum. Follow an appropriate program and safety practices for your circumstances.</p>`],
      ['Keep the original workout entry', `<p>A PR badge or note should lead back to the actual set: date, exercise, reps, load and relevant setup. Without that context, the headline number can become misleading.</p><p>Do not replace the full set with only “new PR.” The record is a summary of the result, not a substitute for it.</p>`],
      ['Compare like with like', `<p>A barbell lift, machine variation and dumbbell variation can share a muscle group while remaining different exercises. Equipment, range and loading conventions affect the comparison.</p><p>Use distinct names when the setup changes meaningfully. If you intentionally combine variations under one label, document that choice rather than assuming the numbers are interchangeable.</p>`],
      ['Avoid estimates that look like completed records', `<p>A formula may estimate a one-repetition maximum from a submaximal set, but the estimate is not a completed one-repetition lift. Label calculated values as estimates and keep them separate from actual results.</p><p>Likewise, a planned target is not a PR until the set is completed and recorded honestly. If the set required a changed range, assistance or a different setup, preserve that note beside the result instead of silently comparing it with earlier entries.</p>`],
      ['Review records inside the wider log', `<p>Did You Lift stores actual set values alongside the workout plan, making it easier to see the session around a notable result. Use consistent exercise names and notes, then review the comparable history rather than chasing an isolated number.</p><p>Records can be motivating, but they do not capture every part of progress. Technique, comfort, consistency and the goals of your program may matter even when no headline PR appears.</p>`],
    ], sources: [],
    faq: [['What counts as a gym personal record?', 'Define it before comparing: heaviest load under a rep condition, most reps at a fixed load, a session volume total or another specific repeatable result.'], ['Is an estimated one-rep max a PR?', 'It is an estimate derived from another set, not a completed one-repetition result. Label and store it separately.']],
  },
];
