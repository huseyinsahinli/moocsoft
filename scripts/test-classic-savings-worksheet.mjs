// Independent checks for the free standard chart; no browser, library or network required.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import savingsGuides from '../content/savings.mjs';
import { published } from '../content/apps.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const worksheetPath = '/assets/worksheets/52-week-savings.html';
const csvPath = '/assets/worksheets/52-week-savings.csv';
const html = read('.' + worksheetPath);
const csv = read('.' + csvPath).trimEnd().split(/\r?\n/).map(line => line.split(','));
assert.deepEqual(csv.shift(), ['Week', 'PlannedDepositUSD', 'PlannedCumulativeUSD', 'Completed', 'ActualDepositDate']);
assert.equal(csv.length, 52, 'CSV has all 52 deposits');

const htmlRows = [...html.matchAll(/<tr data-week="(\d+)">([\s\S]*?)<\/tr>/g)];
assert.equal(htmlRows.length, 52, 'Every week is available as static HTML');
let expectedTotalDollars = 0;
for (let index = 0; index < 52; index += 1) {
  const week = index + 1;
  expectedTotalDollars += week;
  const [weekText, deposit, cumulative, completed, actualDate] = csv[index];
  assert.equal(weekText, String(week));
  assert.equal(deposit, week.toFixed(2), `Week ${week} planned deposit`);
  assert.equal(cumulative, expectedTotalDollars.toFixed(2), `Week ${week} cumulative amount`);
  assert.equal(completed, '', 'CSV does not pre-mark future deposits complete');
  assert.equal(actualDate, '', 'CSV does not invent an actual deposit date');
  assert.equal(htmlRows[index][1], String(week));
  const cells = [...htmlRows[index][2].matchAll(/<td(?:\s[^>]*)?>([\s\S]*?)<\/td>/g)].map(match => match[1]);
  assert.equal(cells[0], String(week));
  assert.equal(cells[1], '$' + week.toLocaleString('en-US'));
  assert.equal(cells[2], '$' + expectedTotalDollars.toLocaleString('en-US'));
  assert.match(cells[3], /<label\b[^>]*><input type="checkbox"/);
  assert.match(cells[3], new RegExp(`aria-label="Mark week ${week} after depositing"`));
  assert.doesNotMatch(cells[3], /\b(?:checked|disabled|hidden)\b/);
}
assert.equal(expectedTotalDollars, 1378);
assert.equal((html.match(/<input type="checkbox"/g) || []).length, 52);
assert.match(html, /<meta name="robots" content="noindex,\s*follow">/);
assert.match(html, /<html lang="en">/);
assert.match(html, /<noscript><p[^>]*>Use your browser’s Print menu/);
assert.match(html, /@media print\s*\{[\s\S]*?\.toolbar\s*\{\s*display:\s*none;/);
assert.match(html, /@page\s*\{\s*size:\s*A4;/);
assert.match(html, /href="\/assets\/worksheets\/52-week-savings\.csv" download/);
assert.match(html, /href="\/guides\/52-week-savings-challenge\/"/);
assert.match(html, /href="\/savings-goal-tracker\/"/);
assert.match(html, /On-screen checks are not saved/);
assert.match(html, /Premium PDF\/Excel exports for app records are separate features/);
assert.doesNotMatch(html, /(?:localStorage|sessionStorage|document\.cookie|fetch\(|XMLHttpRequest|sendBeacon|<script\b[^>]*\bsrc=|https?:\/\/)/);

// The complete table and native checkboxes do not depend on running the print helper.
const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
assert.equal((withoutScripts.match(/<tr data-week=/g) || []).length, 52);
assert.equal((withoutScripts.match(/<input type="checkbox"/g) || []).length, 52);
assert.doesNotMatch(withoutScripts, /\bhidden\b/);
for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
  const target = resolve(root, '.' + match[1]);
  assert(existsSync(target) || existsSync(resolve(target, 'index.html')), `Missing public worksheet destination: ${match[1]}`);
}

// Printing is user-triggered, with no automatic dialog on load and no side effects.
const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)];
assert.equal(script.length, 1);
let printCount = 0;
let clickPrint;
let afterPrint;
const dataset = {};
runInNewContext(script[0][1], {
  document: {
    body: { dataset },
    querySelectorAll: selector => {
      assert.equal(selector, '[data-print]');
      return [{ dataset: { print: 'all' }, addEventListener: (event, callback) => { assert.equal(event, 'click'); clickPrint = callback; } }];
    },
  },
  window: {
    print: () => { printCount += 1; },
    addEventListener: (event, callback) => { assert.equal(event, 'afterprint'); afterPrint = callback; },
  },
});
assert.equal(printCount, 0, 'Printing does not start on page load');
clickPrint();
assert.equal(printCount, 1);
assert.equal(dataset.printMode, 'all');
afterPrint();
assert.equal(dataset.printMode, undefined);

const guide = savingsGuides.find(item => item.slug === '52-week-savings-challenge');
assert(guide);
assert.equal(guide.published || published, '2026-09-12', 'Original publication date stays unchanged');
assert.equal(guide.modified, '2026-10-16');
assert.match(guide.title, /Free Printable Chart/);
assert.match(guide.description, /\$1,378/);
assert.equal(guide.startAction[0], '#step-2');
const content = guide.sections.map(([, body]) => body).join('\n');
assert.match(content, /id="classic-savings-chart"/);
assert.match(content, /href="\/assets\/worksheets\/52-week-savings\.html"/);
assert.match(content, /href="\/assets\/worksheets\/52-week-savings\.csv" download/);
assert.match(content, /does not connect to a bank or import your plan into the app/);
console.log('Classic savings worksheet passed: 52 independently counted deposits, CSV/HTML parity, $1,378 total, native no-JS checklist, user-triggered printing, privacy and preserved guide publication date.');
