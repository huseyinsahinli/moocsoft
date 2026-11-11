import { table } from './apps.mjs';

// Fictional records for arithmetic checks, not recommended training loads.
export const barbellExamples = [
  { bar: 20, perSide: [10, 5], total: 50 },
  { bar: 15, perSide: [10, 5], total: 45 },
  { bar: 20, perSide: [10, 5, 2.5], total: 55 },
];

const loadingDiagram = `<figure data-barbell-diagram aria-labelledby="barbell-caption" style="margin:1.5rem 0">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 270" width="600" height="270" style="display:block;width:100%;height:auto" role="img" aria-labelledby="barbell-title barbell-desc">
<title id="barbell-title">A 50 kg total includes the bar and both sides</title>
<desc id="barbell-desc">An assumed 20 kg bar plus 10 and 5 kg plates on the left and 10 and 5 kg plates on the right. Each side contributes 15 kg. No collar mass is included in this example.</desc>
<rect width="600" height="270" rx="18" fill="#15202a"/>
<text x="300" y="38" text-anchor="middle" fill="#fff" font-size="24" font-family="sans-serif">Count each part once</text>
<rect x="40" y="117" width="520" height="12" rx="6" fill="#b5c4cf"/>
<rect x="155" y="76" width="32" height="94" rx="5" fill="#d8ff3e"/>
<rect x="113" y="91" width="30" height="64" rx="5" fill="#8acbd8"/>
<rect x="413" y="76" width="32" height="94" rx="5" fill="#d8ff3e"/>
<rect x="457" y="91" width="30" height="64" rx="5" fill="#8acbd8"/>
<g text-anchor="middle" fill="#fff" font-family="sans-serif" font-size="24">
<text x="150" y="202">10 + 5 kg</text><text x="300" y="93">20 kg bar</text><text x="450" y="202">10 + 5 kg</text>
<text x="300" y="247">15 + 20 + 15 = 50 kg</text></g>
</svg><figcaption id="barbell-caption">Invented loading example: a known 20 kg bar and 15 kg of plates on each side. Diagram is not to scale; collar mass is excluded from this example’s recorded total.</figcaption></figure>`;

export default [{
  topic: 'training', slug: 'barbell-weight-bar-and-plates', published: '2026-11-11', appPreview: true,
  title: 'Barbell Weight: Count the Bar and Plates in Your Workout Log',
  description: 'Do you include the bar when logging weight? Add its known mass and both sides of plates. See a loading diagram, worked totals and a simple gym-log note.',
  intro: 'Yes—if your workout log means total barbell weight, include the bar and every plate on both sides. For a known 20 kg bar with a 10 kg and a 5 kg plate on each side, enter 50 kg, not 30 or 35. Check the bar’s own label or equipment information first; its weight is an input, not something to guess.',
  takeaway: 'Total barbell weight = known bar mass + left-side plates + right-side plates. Add known collar mass too if your record includes it, and keep that convention consistent.',
  startAction: ['#step-4', 'Copy a clear workout-log entry ↓'],
  previewCopy: {
    heading: 'Record the total beside your actual repetitions',
    description: 'Use Did You Lift to log actual reps and weight for each set. Keep your bar and plate convention in the exercise note. This guide’s loading diagram is a separate website example, not an automatic plate calculator in the app.',
  },
  sections: [
    ['Add the bar and both sides once', `<p>Start with the physical pieces in the record. In this example, the left plates total 10 + 5 = 15 kg. The right plates also total 15 kg. Add the assumed 20 kg bar: <strong>15 + 20 + 15 = 50 kg</strong>.</p>${loadingDiagram}<p>For identical plate stacks on both sides, the shortcut is bar + 2 × one side’s plates. The longer addition is useful when checking your arithmetic. A 30 kg entry would describe only these plates; a 35 kg entry would include the bar but omit one side.</p><p>These are fictional bookkeeping examples, not suggested lifting weights or loading instructions. “No collar mass counted” describes the arithmetic only; it does not mean removing safety equipment.</p>`],
    ['Check the bar before reusing yesterday’s number', `<p>A familiar-looking bar is not enough evidence for its mass. Read the equipment label or ask staff for the specification of that particular bar. If the mass remains unknown, record the bar identity and known plates without inventing a total.</p>${table('Same plates, different assumed bar: different total', ['Known bar in example', 'Plates on each side', 'Calculation', 'Recorded total'], [
      ['20 kg', '10 kg + 5 kg', '20 + 15 + 15', '50 kg'],
      ['15 kg', '10 kg + 5 kg', '15 + 15 + 15', '45 kg'],
      ['Unknown', '10 kg + 5 kg', 'Unknown bar + 30 kg plates', 'Unknown; retain the parts'],
    ])}<p>For example, “blue-end bar; 15 kg plates per side; bar mass not confirmed” is a more useful historical note than a guessed 50 kg. Keep the unresolved value out of a numerical total until you can verify it.</p><p>For a fixed-weight bar, check whether its marked value describes the complete implement before adding anything. For a Smith machine, use that machine’s documented loading convention and identify the machine in your log. Do not treat a machine marking as an interchangeable free-bar total.</p>`],
    ['Count additions on both sides, and name the units', `<p>Returning to the 50 kg example, adding one 2.5 kg plate to <em>each</em> side adds 5 kg overall. The new arithmetic is 20 + 17.5 + 17.5 = <strong>55 kg</strong>. Writing 52.5 kg would count only one of the two new plates.</p><p>If a separate example includes two collars with a known mass of 0.25 kg each, a collar-inclusive total for the original setup is 50 + 0.25 + 0.25 = <strong>50.5 kg</strong>. Those collar masses are assumptions for this worksheet, not a statement about your equipment. A plates-and-bar log can exclude collars if clearly labeled; do not silently switch conventions between sessions.</p><p>Keep the inputs in one unit. A plate marked in pounds is not the same numerical mass in kilograms. Do not relabel the numbers when changing units, or combine a pound-marked bar with kilogram plates without conversion. If equipment gives two rounded labels, pick one consistent unit for the record.</p>`],
    ['Copy a complete entry into your workout log', `<p>The weight field should have a short, stable meaning: <strong>total bar plus both plate stacks, in kg</strong>. Put details that explain the number in a note. For the fictional first setup, a note could read: “20 kg bar; each side 10 + 5 kg; collars excluded from recorded load.”</p>${table('Invented completed sets using the same 50 kg setup', ['Set', 'Actual completed reps', 'Total entered load', 'Reps × entered load'], [
      ['1', '8', '50 kg', '400 kg'],
      ['2', '8', '50 kg', '400 kg'],
      ['3', '6', '50 kg', '300 kg'],
      ['Total', '22', 'Same setup', '1,100 kg'],
    ])}<p>This record contains 22 completed reps, so its volume load is 22 × 50 = 1,100 kg. Using the planned eight reps for every set would produce 1,200 kg and overstate this record by 100 kg. Preserve the actual results; the bar-and-plate calculation does not fill in missing reps.</p><p>Volume load here is just repetitions multiplied by entered external load. It is not mechanical work, calories or a measure of which workout is better. The <a href="/guides/workout-volume-explained/">workout volume guide</a> explains that distinction; the <a href="/guides/log-warm-up-and-working-sets/">warm-up and working-set guide</a> explains how to keep different set types separate.</p>`],
    ['Fix an old plates-only entry without rewriting history blindly', `<p>Suppose an older entry says “30 kg plates total, 20 kg bar,” with the same explicit convention as this example. You have enough information to derive a 50 kg bar-inclusive total. Retain the original note and state that the total was corrected to include the bar.</p><p>If the old entry says only “30,” you do not know whether that means plates on one side, both sides or the complete load. Leave its meaning unresolved. Adding 20 kg to every old entry could introduce errors rather than correct them.</p><div class="guide-faq"><details data-barbell-check><summary>Quick check: a 15 kg bar and 10 + 2.5 kg on each side. What total belongs in the log?</summary><p><strong>40 kg:</strong> 15 + 12.5 + 12.5. A 27.5 kg answer omits one side, and 25 kg omits the bar. This example excludes collar mass.</p></details></div><p>Dumbbells need their own explicit per-hand or combined convention. See <a href="/guides/dumbbell-workout-volume/">one dumbbell or both?</a> before copying a barbell rule into a dumbbell entry.</p>`],
    ['Keep the convention with your next set', `<p>The official <a href="https://apps.apple.com/us/app/did-you-lift-workout-log/id6808200259">App Store listing</a> and <a href="https://play.google.com/store/apps/details?id=com.moocsoft.didyoulift">Google Play listing</a> describe Did You Lift’s set targets, actual reps and weight logging, exercise notes and rest countdown. Use the note to preserve what your entered weight includes; verify the equipment separately.</p><p>Did You Lift is free to download with optional one-time Lifetime Premium. The listings place previous logged values, the exercise library and advanced week saving, copying and sharing in Premium. Check the current store details before purchasing. The app screenshot below illustrates the set log; the diagram above is an original teaching illustration.</p><p>For the next visit, the useful record is the exercise, equipment identity, actual reps, known total weight and units. If one of those is unknown, keep the uncertainty visible instead of making the log look more precise than the evidence.</p>`],
  ],
  sources: ['trainingStore', 'trainingGoogleStore'],
  faq: [
    ['Do you count the bar when logging barbell weight?', 'Yes, when the field represents total barbell load: add the known bar mass and every plate on both sides. State whether known collar mass is included.'],
    ['Does a 2.5 kg plate increase the total by 2.5 or 5 kg?', 'One such plate adds 2.5 kg. One on each side adds 5 kg in total. Count the pieces actually described by the record.'],
    ['What if I do not know how much the bar weighs?', 'Check its label or ask for that equipment’s specification. Until verified, record the known plates and bar identity without inventing a total.'],
    ['Should I add the bar to old workout entries?', 'Only when their original meaning and bar mass are known. An unlabeled number does not establish whether the bar was already included.'],
  ],
}];
