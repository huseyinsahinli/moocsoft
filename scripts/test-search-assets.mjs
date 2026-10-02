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

for (const [slug, visual] of Object.entries(guideMedia)) {
  const guide = guides.find(item => item.slug === slug);
  assert.ok(guide, `Unknown media guide ${slug}`);
  assert.equal(guide.modified, '2026-10-03');
  assert.ok(guide.startAction?.[0].startsWith('/assets/worksheets/'));
  const png = readFileSync(resolve(root, '.' + visual.src));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 675);
  assert.ok(png.length < 600000, `Diagram too large: ${visual.src}`);
  assert.doesNotMatch(text(visual.src.replace(/\.png$/, '.svg')), /<script|<foreignObject|href="https?:/);
}
console.log('Search assets passed: 52 reverse rows, 100 scaled envelope rows, five verified puzzles, three printable pages and three 1200×675 diagrams.');
