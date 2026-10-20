// Development-only SVG renderer. No renderer library is shipped to readers.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve, delimiter } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { guideCharts } from '../content/guide-charts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const colors = { bg: '#151513', panel: '#22221f', line: '#4f4a42', ink: '#f2ede3', muted: '#c2b9aa', orange: '#f1a27b', green: '#a7cfb0', gold: '#e9c783' };
const t = (x, y, value, size = 32, color = colors.ink, weight = 400, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escape(value)}</text>`;
const box = (x, y, width, height, fill = colors.panel, stroke = colors.line, radius = 18) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
const line = (x1, y1, x2, y2, stroke = colors.line, width = 3) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
const arrow = (x, y) => `<path d="M${x - 20} ${y}h40m-13-13 13 13-13 13" fill="none" stroke="${colors.orange}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
const note = (first, second = '') => t(64, 593, first, 26, colors.muted) + (second ? t(64, 630, second, 26, colors.muted) : '');
const number = value => Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
const money = value => '$' + number(value);

const renderers = {
  'percentage-points': d => {
    const gap = d.to - d.from, relative = gap / d.from * 100;
    return t(350, 246, `${d.from}%`, 78, colors.ink, 700, 'middle') + arrow(600, 221) + t(850, 246, `${d.to}%`, 78, colors.ink, 700, 'middle')
      + box(64, 300, 520, 238) + box(616, 300, 520, 238)
      + t(94, 352, 'Direct difference', 30, colors.muted) + t(94, 420, `+${gap} percentage points`, 40, colors.orange, 700)
      + t(94, 484, `${d.to} − ${d.from} = ${gap}`, 36)
      + t(646, 352, 'Relative to the original', 30, colors.muted) + t(646, 420, `+${number(relative)}%`, 54, colors.green, 700)
      + t(646, 484, `${gap} ÷ ${d.from} × 100 = ${number(relative)}%`, 36)
      + note('Same fictional rate change; different questions and units.');
  },
  'fraction-strips': d => {
    let out = '';
    for (const [index, fraction] of [d.first, d.second].entries()) {
      const shaded = fraction[0] * d.denominator / fraction[1], y = 244 + index * 142;
      out += t(64, y + 38, `${fraction[0]}/${fraction[1]}`, 47, colors.ink, 700) + t(245, y - 19, `${shaded}/${d.denominator}`, 40, colors.muted);
      for (let part = 0; part < d.denominator; part += 1) out += box(245 + part * 36, y, 32, 59, part < shaded ? (index ? colors.orange : colors.green) : colors.panel, colors.line, 3);
    }
    return out + t(600, 526, '15/24 > 14/24, so 5/8 > 7/12', 42, colors.ink, 700, 'middle') + note('Equal-length wholes. Each small block is one twenty-fourth.');
  },
  'midnight-timeline': d => {
    const before = 1440 - d.startHour * 60 - d.startMinute, after = d.endHour * 60 + d.endMinute, total = before + after;
    const split = 110 + 980 * before / total;
    return t(110, 248, 'Monday', 30, colors.muted) + t(110, 302, '23:40', 46, colors.ink, 700)
      + t(split + 12, 248, 'Tuesday', 30, colors.muted) + t(split + 12, 302, '00:00', 46, colors.ink, 700)
      + t(1090, 302, '01:15', 46, colors.ink, 700, 'end')
      + line(110, 367, split, 367, colors.orange, 22) + line(split, 367, 1090, 367, colors.green, 22)
      + [110, split, 1090].map(x => line(x, 341, x, 393, colors.ink, 3)).join('')
      + t((110 + split) / 2, 441, `${before} min`, 42, colors.orange, 700, 'middle') + t((split + 1090) / 2, 441, `${after} min`, 42, colors.green, 700, 'middle')
      + t(600, 526, `${before} + ${after} = ${total} minutes`, 48, colors.ink, 700, 'middle')
      + note('Segments share one time scale. The finish is explicitly the next day.', 'Assumes an unchanged UTC offset; no clock or time-zone changes.');
  },
  'rectangle-boundaries': d => {
    let out = box(112, 245, 450, 260, colors.bg, colors.line, 0);
    out += box(112, 245, 300, 130, '#4c3a2c', colors.orange, 0);
    for (let row = 0; row <= d.rows; row += 1) out += line(112, 245 + row * 130, 562, 245 + row * 130, colors.gold, 3) + t(82, 254 + row * 130, ['A', 'B', 'C'][row], 30, colors.muted, 400, 'end');
    for (let column = 0; column <= d.columns; column += 1) out += line(112 + column * 150, 245, 112 + column * 150, 505, colors.gold, 3) + t(112 + column * 150, 218, column + 1, 30, colors.muted, 400, 'middle');
    const horizontal = (d.rows + 1) * d.rows / 2, vertical = (d.columns + 1) * d.columns / 2;
    return out + t(650, 269, 'Choose boundary pairs', 31, colors.muted)
      + t(650, 332, `${horizontal} horizontal choices`, 34) + t(650, 389, `× ${vertical} vertical choices`, 34)
      + t(650, 479, `${horizontal * vertical} rectangles`, 49, colors.green, 700)
      + note('Complete 2-row × 3-column grid. Squares count.', 'The shaded 1 × 2 rectangle is only one of the eighteen.');
  },
  'weekly-dates': d => {
    let out = '';
    d.months.forEach((month, index) => {
      const x = 64 + index * 552;
      out += box(x, 216, 520, 326) + t(x + 30, 270, month.label, 34, colors.muted);
      month.days.forEach((day, part) => { out += box(x + 30 + part * 89, 303, 73, 65, index ? colors.orange : colors.green, colors.line, 12) + t(x + 66 + part * 89, 347, day, 40, colors.bg, 700, 'middle'); });
      out += t(x + 30, 424, `${month.days.length} Fridays × ${money(d.deposit)}`, 38) + t(x + 30, 501, `${money(month.days.length * d.deposit)} planned`, 49, index ? colors.orange : colors.green, 700);
    });
    return out + note('Each box is a calendar date, not evidence of a completed deposit.', 'Illustrative plan only; not payroll dates or bank-processing promises.');
  },
  'goal-budget': d => {
    const total = d.goals.reduce((sum, goal) => sum + goal.amount, 0), left = 88, scale = 1024 / total;
    let x = left, out = t(64, 240, `${money(total)} required each month`, 44, colors.ink, 700);
    d.goals.forEach((goal, index) => {
      const width = goal.amount * scale, fill = [colors.green, colors.gold, colors.orange][index];
      out += box(x, 294, width, 104, fill, colors.bg, 0) + t(x + width / 2, 356, money(goal.amount), 42, colors.bg, 700, 'middle') + t(x + width / 2, 448, goal.name, 29, colors.muted, 400, 'middle');
      x += width;
    });
    const marker = left + d.budget * scale;
    return out + line(marker, 276, marker, 411, colors.ink, 4) + t(64, 526, `Budget ${money(d.budget)}   ·   Shortfall ${money(total - d.budget)}`, 42, colors.ink, 700)
      + note('One shared scale. The vertical marker is the $300 budget.', 'Fictional contribution requirements, not an affordable-budget recommendation.');
  },
  'oil-portion': d => {
    const grams = d.before - d.after, kcal = grams / d.labelGrams * d.labelKcal, portion = kcal * d.portionGrams / d.batchGrams;
    return box(64, 225, 515, 292) + box(621, 225, 515, 292)
      + t(94, 278, 'Measured bottle difference', 30, colors.muted) + t(94, 345, `${d.before} − ${d.after} = ${grams} g`, 42, colors.orange, 700)
      + t(94, 407, `${grams} ÷ ${d.labelGrams} × ${d.labelKcal}`, 40) + t(94, 472, `${kcal} kcal input`, 45, colors.orange, 700)
      + t(651, 278, 'Conditional portion allocation', 29, colors.muted) + t(651, 345, `${d.portionGrams} g of an ${d.batchGrams} g dish`, 37, colors.ink, 700)
      + t(651, 407, `${kcal} × (${d.portionGrams} ÷ ${d.batchGrams})`, 40) + t(651, 472, `${number(portion)} kcal oil share`, 45, colors.green, 700)
      + note('Assumes full transfer, retention and even mixing for the portion.', 'Hypothetical label: 120 kcal per 14 g. Not measured absorption.');
  },
  'rice-equivalent': d => {
    const dry = d.dryGrams * d.portionGrams / d.cookedGrams, kcal = dry * d.kcalPer100g / 100;
    return box(64, 217, 1072, 116) + t(94, 264, `${d.dryGrams} g dry  →  ${d.cookedGrams} g cooked`, 41, colors.ink, 700) + t(94, 310, 'A measured yield for this one plain-rice batch', 29, colors.muted)
      + box(64, 358, 515, 181) + box(621, 358, 515, 181)
      + t(94, 407, `${d.portionGrams} ÷ ${d.cookedGrams} = 1/3 of batch`, 38) + t(94, 480, `${dry} g dry equivalent`, 43, colors.green, 700)
      + t(651, 407, `${dry} × ${d.kcalPer100g} ÷ 100`, 40) + t(651, 480, `${kcal} kcal estimate`, 43, colors.orange, 700)
      + note('Invented dry label: 360 kcal per 100 g. All rice retained; uniform batch.', 'Not a universal dry-to-cooked ratio or a photo measurement.');
  },
  'label-scaling': d => {
    const multiplier = d.eatenGrams / d.servingGrams, kcal = multiplier * d.labelKcal;
    return box(64, 225, 520, 202) + box(616, 225, 520, 202)
      + t(94, 279, 'Hypothetical label', 30, colors.muted) + t(94, 351, `${d.labelKcal} kcal / ${d.servingGrams} g`, 46, colors.ink, 700)
      + t(646, 279, 'Measured amount eaten', 30, colors.muted) + t(646, 351, `${d.eatenGrams} g = ${multiplier} servings`, 40, colors.green, 700)
      + t(600, 513, `${d.labelKcal} × (${d.eatenGrams} ÷ ${d.servingGrams}) = ${kcal} kcal`, 50, colors.orange, 700, 'middle')
      + note('Same product and preparation basis. Not a recommended portion.', 'The calculated number is an approximate label-based estimate, not a scan.');
  },
  'habit-record': d => {
    const complete = new Set(d.completed); let longest = 0, run = 0;
    for (let day = 1; day <= d.days; day += 1) { run = complete.has(day) ? run + 1 : 0; longest = Math.max(longest, run); }
    let out = t(64, 235, 'Day', 28, colors.muted);
    for (let day = 1; day <= d.days; day += 1) {
      const x = 64 + (day - 1) * 77;
      out += t(x + 29, 280, day, 36, colors.muted, 400, 'middle') + box(x, 303, 59, 64, complete.has(day) ? colors.green : colors.panel, complete.has(day) ? colors.green : colors.orange, 9)
        + t(x + 29, 348, complete.has(day) ? '✓' : '–', 35, complete.has(day) ? colors.bg : colors.orange, 700, 'middle');
    }
    [[`Current: ${run} days`, 64], [`Longest: ${longest} days`, 416], [`12/14 ≈ ${Math.round(complete.size / d.days * 100)}%`, 800]].forEach(([value, x]) => { out += t(x, 477, value, 40, colors.ink, 700); });
    return out + note('Evaluated at the end of day 14; every day was scheduled.', 'Twelve completions, two gaps. This is an example record, not an app screen.');
  },
  'dumbbell-scope': d => {
    const pairLoad = d.paired.perHandKg * 2, pairVolume = d.paired.sets * d.paired.reps * pairLoad, alternate = d.alternating.sets * d.alternating.totalReps * d.alternating.kg;
    return box(64, 224, 520, 316) + box(616, 224, 520, 316)
      + t(94, 276, 'Paired repetitions', 32, colors.green, 700) + t(94, 331, `${d.paired.perHandKg} + ${d.paired.perHandKg} = ${pairLoad} kg`, 37)
      + t(94, 385, `${d.paired.sets} sets × ${d.paired.reps} paired reps`, 33) + t(94, 469, `${pairVolume} kg volume load`, 41, colors.green, 700)
      + t(646, 276, 'Alternating: total reps', 32, colors.orange, 700) + t(646, 331, `${d.alternating.kg} kg per arm movement`, 34)
      + t(646, 385, `${d.alternating.sets} sets × ${d.alternating.totalReps} total reps`, 33) + t(646, 469, `${alternate} kg volume load`, 41, colors.orange, 700)
      + note('Separate fictional records; do not add or compare these as one workout.', 'Count each load once per movement. Not energy or training effectiveness.');
  },
  'booking-authority': d => {
    let out = '';
    d.states.forEach((state, index) => {
      const x = 64 + index * 368;
      out += box(x, 260, 336, 235) + t(x + 24, 314, String(index + 1).padStart(2, '0'), 35, colors.muted)
        + t(x + 24, 374, index === 2 ? 'Confirmed' : state, 40, index === 2 ? colors.green : colors.ink, 700)
        + t(x + 24, 436, index === 2 ? 'Service accepted' : index === 1 ? 'Await service reply' : 'Saved on phone', 29, colors.muted);
      if (index < 2) out += arrow(x + 352, 382);
    });
    return out + note('Only the service’s accepted reservation secures the place in this example.', 'No confirmation yet? Do not display a confirmed booking.');
  },
};

export function renderGuideChart(chart) {
  const render = renderers[chart.chartType];
  if (!render) throw new Error(`Unknown guide chart type: ${chart.chartType}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title description"><title id="title">${escape(chart.title)}</title><desc id="description">${escape(chart.alt)}</desc><rect width="1200" height="675" fill="${colors.bg}"/><path d="M64 158H1136" stroke="${colors.line}" stroke-width="2"/><g font-family="Arial, Helvetica, sans-serif">${t(64, 53, chart.kicker, 23, colors.orange, 700)}${t(64, 119, chart.title, 43, colors.ink, 700)}${render(chart.data)}</g></svg>\n`;
}

async function build() {
  const require = createRequire(import.meta.url);
  let sharp;
  try { sharp = require('sharp'); } catch {
    for (const dependencyDir of (process.env.NODE_PATH || '').split(delimiter).filter(Boolean)) {
      try { sharp = require(resolve(dependencyDir, 'sharp')); break; } catch {}
    }
  }
  if (!sharp) throw new Error('Make the development-only sharp package available through NODE_PATH.');
  mkdirSync(resolve(root, 'assets/guide-charts'), { recursive: true });
  for (const chart of Object.values(guideCharts)) {
    const svg = renderGuideChart(chart), target = resolve(root, '.' + chart.src);
    writeFileSync(target.replace(/\.png$/, '.svg'), svg);
    writeFileSync(target, await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: false }).toBuffer());
    for (const image of chart.webp) writeFileSync(resolve(root, '.' + image.src), await sharp(Buffer.from(svg)).resize({ width: image.width }).webp({ quality: 86, effort: 6 }).toBuffer());
  }
  console.log(`Built ${Object.keys(guideCharts).length} original SVG/PNG charts and ${Object.keys(guideCharts).length * 3} responsive WebP exports.`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await build();
