// No dependencies or network needed. Run after building search assets and guides.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { missingNumberWorksheet as worksheet } from '../content/puzzle-worksheet.mjs';
import { guideMedia } from '../content/guide-media.mjs';
import { guides } from '../content/index.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const text = path => readFileSync(resolve(root, '.' + path), 'utf8');
const csv = path => text(path).trimEnd().split(/\r?\n/).map(line => line.split(','));
const money = value => Math.round(Number(value) * 100);
const worksheetGuideSlugs = new Set(['reverse-52-week-savings-challenge', '100-envelope-challenge', 'missing-number-puzzles-with-answers']);
const expectedMediaSlugs = [...worksheetGuideSlugs, 'estimate-calories-from-food-photo', 'calories-vs-macros', 'workout-volume-explained', 'calculate-cigarette-cost-and-savings'];
const webpDimensions = (buffer, path) => {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF', `Invalid WebP RIFF header: ${path}`);
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP', `Invalid WebP format: ${path}`);
  assert.equal(buffer.readUInt32LE(4) + 8, buffer.length, `Invalid WebP RIFF length: ${path}`);
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const kind = buffer.toString('ascii', offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    const data = offset + 8;
    assert(data + length <= buffer.length, `Truncated WebP chunk: ${path}`);
    if (kind === 'VP8X') {
      assert(length >= 10, `Invalid extended WebP header: ${path}`);
      return [buffer.readUIntLE(data + 4, 3) + 1, buffer.readUIntLE(data + 7, 3) + 1];
    }
    if (kind === 'VP8 ') {
      assert(length >= 10, `Invalid lossy WebP frame: ${path}`);
      assert.deepEqual([...buffer.subarray(data + 3, data + 6)], [157, 1, 42], `Invalid WebP frame signature: ${path}`);
      return [buffer.readUInt16LE(data + 6) & 0x3fff, buffer.readUInt16LE(data + 8) & 0x3fff];
    }
    if (kind === 'VP8L') {
      assert(length >= 5 && buffer[data] === 47, `Invalid lossless WebP frame: ${path}`);
      const bits = buffer.readUInt32LE(data + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    offset = data + length + (length % 2);
  }
  assert.fail(`WebP has no readable image dimensions: ${path}`);
};
const reverse = csv('/assets/worksheets/reverse-52-week-savings.csv');
assert.deepEqual(reverse.shift(), ['Week', 'PlannedDepositUSD', 'PlannedCumulativeUSD', 'Completed', 'ActualDepositDate']);
assert.equal(reverse.length, 52);
let cumulative = 0;
reverse.forEach(([week, deposit, total, completed, date], index) => {
  assert.equal(Number(week), index + 1);
  assert.equal(money(deposit), (52 - index) * 100);
  cumulative += money(deposit);
  assert.equal(money(total), cumulative);
  assert.equal(completed, '');
  assert.equal(date, '');
});
assert.equal(cumulative, 137800);
const envelopes = csv('/assets/worksheets/100-envelope-checklist.csv');
assert.deepEqual(envelopes.shift(), ['Number', 'ClassicUSD', 'HalfUSD', 'TenthUSD', 'Completed', 'ActualDepositDate']);
assert.equal(envelopes.length, 100);
const totals = [0, 0, 0];
envelopes.forEach(([number, classic, half, tenth, completed, date], index) => {
  assert.equal(Number(number), index + 1);
  [classic, half, tenth].forEach((amount, scale) => {
    assert.equal(money(amount), (index + 1) * [100, 50, 10][scale]);
    totals[scale] += money(amount);
  });
  assert.equal(completed, '');
  assert.equal(date, '');
});
assert.deepEqual(totals, [505000, 252500, 50500]);

const evaluate = (rule, [a, b]) => ({
  sum: a + b,
  'product-minus-two': a * b - 2,
  'product-plus-first': a * b + a,
  'difference-of-squares': a ** 2 - b ** 2,
})[rule];
assert.deepEqual(worksheet.questions.map(question => question.answer), [29, 19, 22, 6, 56]);
for (const question of worksheet.questions) {
  const rows = question.verification.rows || [question.verification.values];
  rows.forEach(row => assert.equal(evaluate(question.verification.rule, row), row[2]));
  if (question.rows) {
    assert.equal(question.rows.flat().filter(value => value === null).length, 1);
    assert.deepEqual(question.rows.map(row => row.map(value => value ?? question.answer)), rows);
  }
}

for (const path of ['/assets/worksheets/reverse-52-week-savings.html', '/assets/worksheets/100-envelope-checklist.html', worksheet.htmlPath]) {
  const html = text(path);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta name="robots" content="noindex,\s*follow">/);
  assert.match(html, /@media print/);
  assert.match(html, /\/guides\//);
  assert.doesNotMatch(html, /(?:localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest|https?:\/\/(?:fonts|analytics|www\.googletagmanager))/);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const target = resolve(root, '.' + match[1]);
    assert.ok(existsSync(target) || existsSync(resolve(target, 'index.html')), `Missing worksheet target: ${match[1]}`);
  }
}
assert.match(text(worksheet.htmlPath), /answer-key/);
const questionSvg = text(worksheet.svgPath);
assert.match(questionSvg, /<svg\b/);
assert.match(questionSvg, /viewBox=/);
assert.doesNotMatch(questionSvg, /<script|<foreignObject/);
for (const link of questionSvg.matchAll(/(?:xlink:)?href="([^"]+)"/g)) {
  assert.equal(link[1], 'https://moocsoft.net' + worksheet.guidePath, 'SVG may link only to its corresponding public guide');
}

assert.deepEqual(Object.keys(guideMedia).sort(), expectedMediaSlugs.sort(), 'All seven selected guides have registered diagrams');
let webpCount = 0;
for (const [slug, visual] of Object.entries(guideMedia)) {
  const guide = guides.find(item => item.slug === slug);
  assert.ok(guide, `Unknown media guide ${slug}`);
  if (worksheetGuideSlugs.has(slug)) {
    assert.equal(guide.modified, slug === 'reverse-52-week-savings-challenge' ? '2026-10-06' : '2026-10-03');
    assert.ok(guide.startAction?.[0].startsWith('/assets/worksheets/'), `Missing printable action: ${slug}`);
  }
  assert.equal(visual.width, 1200);
  assert.equal(visual.height, 675);
  assert.ok(visual.alt.trim() && visual.caption.trim(), `Missing visible diagram description: ${slug}`);
  const png = readFileSync(resolve(root, '.' + visual.src));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 675);
  assert.ok(png.length <= 150000, `PNG diagram exceeds the 150 KB budget: ${visual.src}`);
  assert.doesNotMatch(text(visual.src.replace(/\.png$/, '.svg')), /<script|<foreignObject|href="https?:/);
  assert.deepEqual(visual.webp.map(variant => [variant.width, variant.height]), [[480, 270], [800, 450], [1200, 675]], `Responsive dimensions: ${slug}`);
  for (const variant of visual.webp) {
    assert.equal(variant.src, visual.src.replace(/\.png$/, `-${variant.width}.webp`), `Responsive filename: ${slug}`);
    const image = readFileSync(resolve(root, '.' + variant.src));
    assert.deepEqual(webpDimensions(image, variant.src), [variant.width, variant.height], `Responsive file dimensions: ${variant.src}`);
    assert(image.length < png.length, `WebP should be smaller than the PNG fallback: ${variant.src}`);
    if (variant.width === 480) assert(image.length <= 25000, `Mobile WebP exceeds the 25 KB budget: ${variant.src}`);
    if (variant.width === 1200) assert(image.length <= 80000, `Full-width WebP exceeds the 80 KB budget: ${variant.src}`);
    webpCount += 1;
  }
}
assert.equal(webpCount, 21);
console.log('Search assets passed: 52 reverse rows, 100 scaled envelope rows, five verified puzzles, three printable pages, seven 1200×675 PNG diagrams and 21 smaller WebP variants.');
