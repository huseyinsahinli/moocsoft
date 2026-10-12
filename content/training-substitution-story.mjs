import { table } from './apps.mjs';

export const substitutionRecord = {
  planned: { exercise: 'Seated cable row', equipment: 'Cable machine A', reps: 10, loadKg: 30 },
  completed: { exercise: 'Bench-supported dumbbell row', equipment: '12 kg dumbbell', repsPerSide: [8, 8, 7], loadPerDumbbellKg: 12 },
};

export const substitutionGuides = [
  {
    topic: 'training', slug: 'log-exercise-substitution-busy-gym', published: '2026-10-12',
    editorialFormat: 'story', appPreview: true, showToolAction: false,
    title: 'Busy Gym? How to Log an Exercise Substitution',
    description: 'The cable machine is taken. Use this fictional gym scene and a simple record template to log a replacement exercise without creating a false personal record.',
    intro: 'When you change an exercise because the equipment is unavailable, log the movement you actually completed under its own name and equipment label. Do not copy its results into the original exercise just to make the plan look finished.',
    takeaway: 'A substitution needs a new exercise label, a clear weight convention and actual set results. Keep the reason for the change, then compare the record with the same setup—not with the machine you did not use.',
    previewCopy: {
      heading: 'Keep the exercise and its equipment together',
      description: 'Did You Lift lets you name an exercise, label its equipment and record actual reps and kilograms. The story below is an illustrative logging problem, not an app screenshot or a workout prescription.',
    },
    sections: [
      ['The machine is occupied. The log is not broken.', `<p>Alex arrives with a planned cable-row exercise. The machine is busy, and there is not enough time to wait. Alex already has a coach-approved alternative for this situation and uses it instead. <strong>This is a fictional teaching scene, not a customer story or a recommendation to swap these exercises.</strong></p><p>The planned line says “Seated cable row — cable machine A — 10 reps at 30 kg.” The completed work uses a bench-supported dumbbell row with a 12 kg dumbbell. Alex is tempted to tap through the old targets and leave a note saying “machine busy.” That would put dumbbell results under a cable-machine label.</p><p>The better record is boring but useful: keep the original work identifiable as not completed, record the replacement by its actual name, and explain why the session changed. You can do that in a paper log first; the principle does not depend on a particular app control.</p>`],
      ['Write the replacement as its own entry', table('Illustrative replacement record—not a routine to follow', ['Record field', 'What Alex writes'], [
        ['Planned exercise', 'Seated cable row — cable machine A'],
        ['Change reason', 'Cable machine unavailable; used the previously agreed alternative'],
        ['Completed exercise', 'Bench-supported dumbbell row — 12 kg dumbbell'],
        ['Weight convention', '12 kg is the weight of one dumbbell, not a pair'],
        ['Repetition convention', 'Reps are recorded per side; both sides matched in this example'],
        ['Actual results', 'Set 1: 8 per side; set 2: 8 per side; set 3: 7 per side'],
      ]) + `<p>If the sides differ, write the two results explicitly rather than averaging them. If the setup changes again, note it. “Row, 12, 8” is much harder to interpret a month later than a name, equipment label and stated convention.</p><p>The template describes the record you want, not a promise that an app automatically recognizes substitutions, checks exercise suitability or has separate left/right input fields. A short note can carry context that does not have its own field.</p>`],
      ['Why the new number is not an automatic personal record', `<p>The planned 30 kg and the completed 12 kg refer to different equipment and movements. This is not a calculation of how much weaker or stronger Alex became. Even matching numbers on two different machines would not establish an equivalent load or training effect.</p><p>Do not combine the old target and replacement results into a single “row progress” line. The next cable-machine session belongs beside a comparable cable-machine session. The next dumbbell session belongs beside the dumbbell record, using the same per-dumbbell and per-side conventions.</p><p>A useful note for next time is: “12 kg per dumbbell; 8, 8, 7 per side; bench-supported; replacement because cable machine unavailable.” That is enough to explain what happened without inventing a new personal best. See <a href="/guides/how-to-track-personal-records-in-gym/">how to keep personal-record comparisons meaningful</a> and <a href="/guides/workout-volume-explained/">what workout volume totals leave out</a>.</p>`],
      ['Keep an interruption from becoming a misleading target', `<p>Before your next session, ask three small questions:</p><ol><li>Which exercise did I actually complete, and with which equipment?</li><li>Which result belongs to that setup, and which numbers were only the original plan?</li><li>Am I returning to the original plan or intentionally using the alternative again?</li></ol><p>Do not let a busy-gym workaround silently rewrite your usual program. Your existing program or qualified coach should decide exercise selection and future targets; a log preserves the facts.</p><p>In <a href="/did-you-lift/">Did You Lift</a>, exercise names, equipment labels and optional notes provide a place for that context, while actual reps and weight distinguish completed sets from targets. It is a planning and record-keeping tool, not an automatic substitution coach. Optional Lifetime Premium adds features such as last logged values; it is not required to understand this logging method.</p><p>Use the <a href="/guides/how-to-log-gym-workouts/">set-by-set workout-log template</a> for the rest of the session. If you want to keep those records alongside your plan and rest timer, <a href="/did-you-lift/">see Did You Lift for iPhone and Android</a>.</p>`],
    ],
    sources: ['trainingStore'],
    faq: [
      ['Should I enter a substitute exercise under the original name?', 'Use the movement and equipment you actually used. Keep the reason for the change in a note and do not present the original planned sets as completed.'],
      ['Can I compare kilograms from a machine and dumbbells directly?', 'Not as an equivalent-load or personal-record comparison. The numbers describe different setups. Keep each exercise and weight convention identifiable.'],
      ['Does Did You Lift choose a replacement exercise for me?', 'This guide does not claim automatic substitutions or individualized coaching. Choose appropriate exercises from your program or qualified coaching, then use the app to organize and record the work.'],
    ],
  },
];
