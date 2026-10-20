// Independently verify the examples displayed by the new editorial diagrams.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guideCharts } from '../content/guide-charts.mjs';
import { guides } from '../content/index.mjs';
import { renderGuideChart } from './build-guide-charts.mjs';
import { weeklySavingsExample } from '../content/savings-weekly-monthly.mjs';
import { goalPlan } from '../content/savings-multiple.mjs';
import { oilExample } from '../content/nutrition-cooking-oil.mjs';
import { riceBatches } from '../content/nutrition-rice-weight.mjs';
import { labelExamples } from '../content/nutrition-labels.mjs';
import { dumbbellExamples } from '../content/training-dumbbell-volume.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, '.' + path));
const diagram = slug => renderGuideChart(guideCharts[slug]);
const data = slug => guideCharts[slug].data;
assert.equal(Object.keys(guideCharts).length, 12);

let d = data('percentage-change-vs-percentage-points');
assert.deepEqual([d.from, d.to], [40, 50]);
assert.equal(d.to - d.from, 10);
assert.equal((d.to / d.from - 1) * 100, 25);
assert.match(diagram('percentage-change-vs-percentage-points'), /\+10 percentage points/);
assert.match(diagram('percentage-change-vs-percentage-points'), /\+25%/);

d = data('compare-fractions-without-decimals');
assert.deepEqual([d.first, d.second, d.denominator], [[5, 8], [7, 12], 24]);
assert.equal(d.first[0] * 3, 15);
assert.equal(d.second[0] * 2, 14);
assert(5 * 12 > 7 * 8);
assert.match(diagram('compare-fractions-without-decimals'), /15\/24 &gt; 14\/24/);

d = data('elapsed-time-across-midnight');
assert.equal((24 - d.startHour) * 60 - d.startMinute, 20);
assert.equal(d.endHour * 60 + d.endMinute, 75);
assert.equal(24 * 60 + d.endHour * 60 + d.endMinute - d.startHour * 60 - d.startMinute, 95);
assert.equal(d.nextDay, true);
assert.match(diagram('elapsed-time-across-midnight'), /20 \+ 75 = 95 minutes/);
assert.match(guideCharts['elapsed-time-across-midnight'].caption, /unchanged UTC offset/);

d = data('count-rectangles-in-a-grid');
let rectangles = 0;
for (let top = 0; top < d.rows; top += 1) for (let bottom = top + 1; bottom <= d.rows; bottom += 1)
  for (let left = 0; left < d.columns; left += 1) for (let right = left + 1; right <= d.columns; right += 1) rectangles += 1;
assert.equal(rectangles, 18);
assert.match(diagram('count-rectangles-in-a-grid'), /18 rectangles/);
assert.match(guideCharts['count-rectangles-in-a-grid'].caption, /Squares count/);

d = data('weekly-to-monthly-savings');
assert.equal(d.deposit * 100, weeklySavingsExample.depositCents);
assert.deepEqual(d.months.map(month => month.days), weeklySavingsExample.months.map(month => month.dates.map(date => Number(date.slice(-2)))));
d.months.forEach((month, index) => {
  for (const day of month.days) assert.equal(new Date(Date.UTC(2027, index, day)).getUTCDay(), 5);
});
assert.deepEqual(d.months.map(month => month.days.length * d.deposit), [125, 100]);
assert.match(guideCharts['weekly-to-monthly-savings'].caption, /planned contributions/);

d = data('track-multiple-savings-goals');
const requirements = goalPlan.map(goal => (goal.target - goal.saved) / goal.dates);
assert.deepEqual(d.goals.map(goal => goal.amount), requirements);
assert.equal(requirements.reduce((sum, amount) => sum + amount, 0), 450);
assert.equal(d.budget, 300);
assert.match(diagram('track-multiple-savings-goals'), /Shortfall \$150/);

d = data('count-cooking-oil-calories');
assert.deepEqual([d.before, d.after, d.labelGrams, d.labelKcal, d.batchGrams, d.portionGrams], [oilExample.bottleBeforeGrams, oilExample.bottleAfterGrams, oilExample.labelGrams, oilExample.labelCalories, oilExample.batchGrams, oilExample.portions[0].grams]);
const oilInput = (d.before - d.after) * d.labelKcal / d.labelGrams;
assert.equal(oilInput, 240);
assert.equal(oilInput * d.portionGrams / d.batchGrams, 60);
assert.match(diagram('count-cooking-oil-calories'), /60 kcal oil share/);
assert.match(diagram('count-cooking-oil-calories'), /full transfer, retention and even mixing/);
assert.match(guideCharts['count-cooking-oil-calories'].caption, /not measured absorption/i);

d = data('dry-to-cooked-rice-weight');
assert.deepEqual(d, { dryGrams: riceBatches[0].dryGrams, cookedGrams: riceBatches[0].cookedGrams, portionGrams: riceBatches[0].portionGrams, kcalPer100g: riceBatches[0].kcalPer100g });
assert.equal(d.dryGrams / (d.cookedGrams / d.portionGrams), 50);
assert.equal(50 * d.kcalPer100g / 100, 180);
assert.match(diagram('dry-to-cooked-rice-weight'), /180 kcal estimate/);
assert.match(guideCharts['dry-to-cooked-rice-weight'].caption, /not a universal cooking ratio/);

d = data('calories-per-serving-vs-per-container');
const partialPack = labelExamples.find(example => example.id === 'partial-pack');
assert.deepEqual(d, { servingGrams: partialPack.basisAmount, labelKcal: partialPack.labelCalories, eatenGrams: partialPack.amountEaten });
assert.equal(d.eatenGrams / d.servingGrams, 1.75);
assert.equal(d.eatenGrams / d.servingGrams * d.labelKcal, 315);
assert.match(diagram('calories-per-serving-vs-per-container'), /315 kcal/);

d = data('habit-streak-vs-completion-rate');
assert.equal(d.days, 14);
assert.deepEqual(Array.from({ length: 14 }, (_, index) => index + 1).filter(day => !d.completed.includes(day)), [6, 12]);
let current = 0, longest = 0, length = 0;
for (let day = 1; day <= 14; day += 1) { length = d.completed.includes(day) ? length + 1 : 0; longest = Math.max(longest, length); }
for (let day = 14; d.completed.includes(day); day -= 1) current += 1;
assert.deepEqual([current, longest, Math.round(d.completed.length / 14 * 100)], [2, 5, 86]);
const habitBody = guides.find(guide => guide.slug === 'habit-streak-vs-completion-rate').sections[1][1];
assert.match(habitBody, /complete days 1–5, miss day 6, complete days 7–11, miss day 12/);
assert.match(diagram('habit-streak-vs-completion-rate'), /Current: 2 days/);
assert.match(diagram('habit-streak-vs-completion-rate'), /Longest: 5 days/);

d = data('dumbbell-workout-volume');
assert.equal(d.paired.sets * d.paired.reps * d.paired.perHandKg * 2, dumbbellExamples.paired.totalVolume);
assert.equal(d.alternating.sets * d.alternating.totalReps * d.alternating.kg, dumbbellExamples.alternating.totalVolume);
assert.equal(dumbbellExamples.paired.totalVolume, 720);
assert.equal(dumbbellExamples.alternating.totalVolume, 192);
assert.match(diagram('dumbbell-workout-volume'), /720 kg volume load/);
assert.match(diagram('dumbbell-workout-volume'), /192 kg volume load/);
assert.match(guideCharts['dumbbell-workout-volume'].caption, /separate invented records/);

d = data('mobile-app-backend-decision');
assert.deepEqual(d.states, ['Draft saved', 'Request sent', 'Reservation confirmed']);
assert.equal(d.owners.at(-1), 'Booking service accepts');
assert.match(diagram('mobile-app-backend-decision'), /No confirmation yet\? Do not display a confirmed booking/);
const backend = guides.find(guide => guide.slug === 'mobile-app-backend-decision');
assert.match(backend.sections[2][1], /draft, a submitted request and a reservation actually confirmed/);

for (const [slug, chart] of Object.entries(guideCharts)) {
  const guide = guides.find(guide => guide.slug === slug);
  assert(guide, `Existing article: ${slug}`);
  assert.equal(chart.kind, 'chart');
  assert.equal(typeof chart.chartType, 'string');
  assert(Number.isInteger(chart.afterSection) && chart.afterSection > 0 && chart.afterSection <= guide.sections.length);
  assert(chart.alt.length > 40 && chart.caption.length > 40);
  assert.equal(chart.src, `/assets/guide-charts/${slug}.png`);
  const svg = read(chart.src.replace(/\.png$/, '.svg')).toString('utf8');
  assert.equal(svg, renderGuideChart(chart), `Generated SVG is current: ${slug}`);
  assert.match(svg, /width="1200" height="675" viewBox="0 0 1200 675"/);
  assert.match(svg, /<title id="title">/);
  assert.match(svg, /<desc id="description">/);
  assert.doesNotMatch(svg, /<script|<foreignObject|<image|(?:xlink:)?href=|@import|<iframe|onload=/i);
  const png = read(chart.src);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 675]);
  assert(png.length < 180000, `PNG size budget: ${slug}`);
  assert.deepEqual(chart.webp.map(image => image.width), [480, 800, 1200]);
  for (const image of chart.webp) {
    assert.equal(image.height, image.width * 9 / 16);
    const bytes = read(image.src);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert(bytes.length < png.length, `WebP is smaller than PNG: ${image.src}`);
    assert(bytes.length < (image.width === 480 ? 35000 : 120000), `WebP size budget: ${image.src}`);
  }
}
console.log('Guide charts passed: 12 independently checked existing examples, explicit assumptions, safe native SVG, full-size PNG and 36 smaller responsive WebP exports.');
