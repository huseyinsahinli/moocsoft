import { table } from './apps.mjs';

// Invented label and measured-yield examples, not food-composition data or app results.
export const riceBatches = [
  { id: 'A', dryGrams: 150, cookedGrams: 420, portionGrams: 140, kcalPer100g: 360, dryEquivalent: 50, portionCalories: 180 },
  { id: 'B', dryGrams: 150, cookedGrams: 480, portionGrams: 140, kcalPer100g: 360, dryEquivalent: 43.75, portionCalories: 157.5 },
  { id: 'C', dryGrams: 120, cookedGrams: 300, portionGrams: 75, kcalPer100g: 360, dryEquivalent: 30, portionCalories: 108 },
];

export default [{
  topic: 'nutrition', slug: 'dry-to-cooked-rice-weight', published: '2026-10-15',
  startAction: ['#step-4', 'Try the two portion checks ↓'],
  title: 'Dry to Cooked Rice: Convert Your Portion by Weight',
  description: 'Convert a cooked rice portion to dry-equivalent grams using your measured batch yield. Worked examples explain why a fixed dry-to-cooked ratio can mislead.',
  intro: 'Match dry rice to a dry-food label, or cooked rice to a matching cooked-food entry. If you have a dry label but a cooked portion, use that batch’s dry input and cooked yield to find its dry-equivalent grams. Cooked weight alone cannot recover the original dry amount.',
  takeaway: 'Dry-equivalent grams = dry batch grams × (cooked portion grams ÷ cooked batch grams). In the invented example, 150 g dry becomes 420 g cooked: a 140 g cooked portion represents 50 g dry, approximately 180 kcal under the example label.',
  appPreview: true, showToolAction: false,
  previewCopy: {
    heading: 'Keep the weighed calculation beside your meal photo.',
    description: 'NutriLens estimates calories and macros from a meal photo. It does not weigh rice or recover your batch yield; keep this calculation separately when reviewing a photo estimate.',
  },
  sections: [
    ['Choose the basis before converting anything', `<p>You do not need a conversion when your measured preparation already matches the reference. The <a href="https://fdc.nal.usda.gov/Foundation_Foods_Documentation/">USDA Foundation Foods documentation</a> explains that food descriptions identify characteristics including raw or cooked. Read the complete description, not only “rice.”</p><p>To use a dry label for a cooked portion, record three weights: rice before cooking, the whole cooked batch, and your portion. Exclude containers with the scale’s tare function. Weigh batch and portions in the same condition, before later drying or reheating changes their weights.</p>`],
    ['Convert one cooked portion to dry-equivalent grams', `<p>These are <strong>invented worksheet figures</strong>, not USDA rice values, recommended portions or NutriLens scan results. Assume plain rice cooked with water, all the rice retained, and the finished batch reasonably uniform. The illustrative dry label says <strong>360 kcal per 100 g</strong>.</p><p class="guide-formula">Dry-equivalent grams = dry batch grams × (portion grams ÷ cooked batch grams)<br>Portion calorie estimate = dry-equivalent grams × dry-label kcal per 100 g ÷ 100</p><p>In batch A, 150 g dry rice yields 420 g cooked. Your 140 g portion is <strong>140 ÷ 420 = one third</strong> of the cooked batch. Its dry equivalent is <strong>150 × one third = 50 g</strong>. The example label therefore gives <strong>50 × 360 ÷ 100 = 180 kcal</strong>.</p>` + table('Batch A: an illustrative dry-label calculation, not real product nutrition data', ['Record', 'Example value', 'What it describes'], [
      ['Dry rice weighed before cooking', '150 g', 'The rice covered by the dry label'],
      ['Whole cooked rice batch, excluding pot', '420 g', 'The finished yield used for portioning'],
      ['Cooked portion', '140 g', 'One third of that same batch'],
      ['Dry-equivalent amount', '50 g', 'The quantity to scale against the dry label'],
      ['Approximate label-based portion estimate', '180 kcal', 'One third of the 540 kcal batch estimate'],
    ]) + `<p>The wrong-basis calculation, <strong>140 × 360 ÷ 100 = 504 kcal</strong>, treats cooked grams as dry grams. Do not also add a cooked-food entry: that would count the rice twice. Label-based bookkeeping remains approximate, not a laboratory measurement.</p>`],
    ['Why the same cooked weight can represent different dry amounts', `<p>Now suppose another 150 g dry batch finishes at 480 g cooked. With the same invented label, both whole batches start with a 540 kcal estimate, but a 140 g serving is a different fraction of each yield:</p>` + table('Two invented plain-rice batches: equal dry input, different measured cooked yields', ['Batch', 'Dry input', 'Cooked batch', 'Cooked portion', 'Dry equivalent', 'Portion estimate'], riceBatches.slice(0, 2).map(item => [
      item.id, `${item.dryGrams} g`, `${item.cookedGrams} g`, `${item.portionGrams} g`, `${item.dryEquivalent} g`, item.id === 'B' ? '157.5 kcal (about 158)' : `${item.portionCalories} kcal`,
    ])) + `<p>For B, <strong>150 × 140 ÷ 480 = 43.75 g</strong> dry equivalent, giving <strong>43.75 × 360 ÷ 100 = 157.5 kcal</strong>, or about 158. More water-containing yield spreads the same batch estimate over more grams; it does not create rice calories.</p><p>There is no universal ratio in these examples. Rinsed or drained-away solids and rice left in the pan are not modeled. Discarded material weakens the retained-batch assumption. Do not generalize this plain-rice worksheet to meat or every cooked food.</p>`],
    ['Try a portion—and spot when information is missing', `<div class="guide-faq"><details data-rice-practice><summary>A plain batch uses 120 g dry rice and weighs 300 g cooked. What does a 75 g cooked portion represent?</summary><p><strong>75 ÷ 300 = one quarter</strong>, so the dry equivalent is <strong>120 × 0.25 = 30 g</strong>. With the invented 360 kcal per 100 g dry label: <strong>30 × 360 ÷ 100 = 108 kcal</strong>. Check: the 432 kcal batch estimate divided by four also gives 108.</p></details><details data-rice-practice><summary>You have 150 g cooked rice, but the batch yield is unknown. Can you calculate its dry equivalent?</summary><p><strong>Not from that weight alone.</strong> Use a suitable cooked-food reference if available and retain preparation uncertainty. Do not borrow batch A’s yield as a measurement of your rice. Next time, record the dry input and cooked yield.</p></details></div>`],
    ['Keep additions outside the plain-rice conversion', `<p>For sauce added only to your plate, record its quantity against its matching reference, once. Do not spread it across the rice batch.</p><p>If additions are mixed into the whole batch, use a recipe total and matching measured finished mixture, not the plain-rice yield above. Follow the <a href="/guides/track-calories-homemade-meals/">homemade-meal batch worksheet</a>. Unknown oil stays unknown; this conversion cannot supply a guessed amount.</p>`],
    ['Use a photo as context, not a replacement for weights', `<p><a href="/nutrilens/">NutriLens</a> estimates calories and macros from a new meal photo or gallery image; it cannot establish rice weight or batch yield. Keep calculations separately. Automatic import, barcode reading and manual correction are not promised here.</p><p>Use the store links on this page for that photo workflow. The <a href="https://apps.apple.com/us/app/nutrilens-food-ai-scanner/id6755138291">official iOS listing</a> describes subscriptions and scan credit packs, with detailed analysis and saved history in Premium. Check current platform access. This is record-keeping education, not a calorie target, personal dietary advice or an allergy assessment.</p>`],
  ],
  sources: ['energy', 'portions', 'nutritionStore'],
  faq: [
    ['Should I weigh rice dry or cooked?', 'Either can work when the reference matches the measured preparation. Use a dry label with dry grams or an appropriate cooked-food entry with cooked grams. To combine a dry label with a cooked portion, measure the dry input and cooked yield of the same batch.'],
    ['Is there one reliable dry-to-cooked rice ratio?', 'Do not treat one ratio as a measurement of every batch. Cooking and the finished water-containing yield can differ. This worksheet uses your measured batch yield instead of assuming a fixed ratio.'],
    ['How do I convert 140 g cooked rice to dry grams?', 'You need the batch relationship. In the invented example, 150 g dry becomes 420 g cooked, so 150 × 140 ÷ 420 = 50 g dry equivalent. A different cooked yield gives a different result.'],
    ['Can cooked weight alone tell me the dry equivalent?', 'No. A cooked portion weight does not supply the original dry input or finished batch yield. Use a suitable cooked-food reference if available, rather than presenting an assumed conversion as measured.'],
    ['Does NutriLens measure how much water the rice absorbed?', 'No such measurement is promised here. NutriLens provides meal-photo estimates; keep separately measured weights and batch calculations in your own notes.'],
  ],
}];
