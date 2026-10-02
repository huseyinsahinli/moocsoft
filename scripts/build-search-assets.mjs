import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { missingNumberWorksheet as worksheet } from '../content/puzzle-worksheet.mjs';

// Development-only renderer. The published worksheets use native HTML and CSS;
// neither sharp nor a third-party script is delivered to a visitor's browser.
const require = createRequire(import.meta.url);
let sharp;
try {
  sharp = require('sharp');
} catch {
  throw new Error('Make the development-only sharp package available before running this asset builder.');
}
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const money = cents => '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: Number(cents % 100 !== 0) * 2, maximumFractionDigits: 2 });
const csvMoney = cents => (cents / 100).toFixed(2);
const reverseRows = Array.from({ length: 52 }, (_, index) => {
  const week = index + 1;
  return { week, depositCents: (53 - week) * 100, totalCents: (week * (105 - week) / 2) * 100 };
});
const envelopeRows = Array.from({ length: 100 }, (_, index) => {
  const number = index + 1;
  return { number, classicCents: number * 100, halfCents: number * 50, tenthCents: number * 10 };
});
const quarterTotals = Array.from({ length: 4 }, (_, index) => reverseRows.slice(index * 13, (index + 1) * 13).reduce((sum, row) => sum + row.depositCents, 0));
if (reverseRows.at(-1).totalCents !== 137800 || envelopeRows.reduce((sum, row) => sum + row.classicCents, 0) !== 505000 || envelopeRows.reduce((sum, row) => sum + row.halfCents, 0) !== 252500 || envelopeRows.reduce((sum, row) => sum + row.tenthCents, 0) !== 50500 || quarterTotals.join(',') !== '59800,42900,26000,9100') throw new Error('Savings arithmetic failed.');

function verifyQuestions() {
  if (worksheet.questions.length !== 5) throw new Error('Expected five original practice questions.');
  for (const question of worksheet.questions) {
    const verification = question.verification;
    const operation = {
      sum: (a, b) => a + b,
      'product-minus-two': (a, b) => a * b - 2,
      'product-plus-first': (a, b) => a * b + a,
      'difference-of-squares': (a, b) => a * a - b * b,
    }[verification.rule];
    if (!operation || !Number.isFinite(question.answer)) throw new Error(`Invalid verification for question ${question.number}.`);
    const rows = verification.rows || [verification.values];
    if (!rows.every(([a, b, answer]) => operation(a, b) === answer)) throw new Error(`Incorrect arithmetic for question ${question.number}.`);
    if (question.kind === 'table') {
      let blankCount = 0;
      question.rows.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
        const expected = rows[rowIndex][columnIndex];
        if (cell === null) {
          blankCount += 1;
          if (question.answer !== expected) throw new Error(`Answer does not match the blank in question ${question.number}.`);
        } else if (cell !== expected) throw new Error(`Table mismatch in question ${question.number}.`);
      }));
      if (blankCount !== 1) throw new Error(`Expected one blank in question ${question.number}.`);
    } else if (question.kind !== 'equation' || question.answer !== verification.values[0]) {
      throw new Error(`Invalid equation question ${question.number}.`);
    }
  }
}
verifyQuestions();

const css = `
  * { box-sizing: border-box; }
  html { color-scheme: light; background: #f3f5f3; }
  body { margin: 0; color: #18201c; font: 16px/1.5 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  a { color: #155b43; text-underline-offset: 3px; }
  .toolbar { max-width: 1020px; margin: 0 auto; padding: 20px 24px; display: flex; flex-wrap: wrap; gap: 10px 20px; align-items: center; }
  .toolbar a, .toolbar button { font: inherit; }
  .toolbar button { cursor: pointer; border: 1px solid #446052; background: #fff; border-radius: 7px; padding: 9px 14px; color: #173b2b; }
  .toolbar button:focus-visible, a:focus-visible { outline: 3px solid #3472b9; outline-offset: 4px; }
  .toolbar .product { margin-left: auto; }
  .noscript-note { max-width: 950px; margin: 0 auto 20px; padding: 0 24px; font-size: 14px; }
  .paper { max-width: 950px; margin: 0 auto 32px; padding: 36px; background: #fff; border: 1px solid #d7dfd9; border-radius: 8px; }
  .eyebrow { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; margin: 0 0 6px; color: #47574d; }
  h1 { font-size: clamp(26px, 5vw, 36px); line-height: 1.15; margin: 0 0 12px; }
  h2 { font-size: 24px; margin: 0 0 12px; }
  h3 { font-size: 17px; line-height: 1.3; margin: 0 0 8px; }
  p { margin: 0 0 12px; }
  .intro { max-width: 76ch; }
  .details { display: flex; flex-wrap: wrap; gap: 15px 40px; margin: 18px 0; font-size: 14px; }
  .write-line { display: inline-block; width: 160px; height: 1em; border-bottom: 1px solid #66756c; }
  .summary { padding: 12px 14px; border: 1px solid #65776b; margin: 16px 0; font-weight: 650; }
  .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  caption { text-align: left; font-size: 13px; font-weight: 600; padding-bottom: 8px; }
  th, td { text-align: right; border-bottom: 1px solid #cbd4ce; padding: 5px 8px; font-size: 14px; }
  th { font-size: 12px; font-weight: 650; border-top: 1px solid #64786b; border-bottom: 1px solid #64786b; }
  td:first-child, th:first-child { text-align: left; }
  .completion-cell { width: 48px; text-align: center; }
  .mark-box { display: inline-block; width: 13px; height: 13px; margin: 0; vertical-align: middle; accent-color: #23624c; cursor: pointer; }
  .mark-box:focus-visible { outline: 3px solid #3472b9; outline-offset: 3px; }
  .completion-mark { display: inline-grid; place-items: center; min-width: 24px; min-height: 24px; cursor: pointer; }
  .notes { margin: 16px 0 0; font-size: 12px; color: #405148; }
  .envelope-grid { display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 7px; margin-top: 20px; padding: 0; list-style: none; }
  .envelope-grid li { border: 1px solid #75877c; }
  .envelope-entry { min-height: 61px; padding: 6px; display: grid; grid-template-columns: 1fr auto; align-content: center; cursor: pointer; }
  .envelope-number { font-size: 19px; font-weight: 650; line-height: 1.25; }
  .envelope-amount { display: block; grid-column: 1 / -1; font-size: 11px; }
  .instructions { font-size: 14px; padding-left: 20px; margin: 14px 0 22px; }
  .question-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .question { padding: 17px; border: 1px solid #92a099; break-inside: avoid; }
  .question.equation-question { grid-column: 1 / -1; }
  .question p { font-size: 13px; }
  .hint { color: #334e40; }
  .equation { font-size: 25px; font-weight: 650; padding: 4px 0; letter-spacing: .02em; }
  .question table { margin: 10px 0; }
  .question th { text-align: center; font-size: 11px; }
  .question td { text-align: center; font-size: 18px; }
  .blank { display: inline-block; width: 23px; height: 23px; border: 1px solid #53655a; vertical-align: middle; }
  .work { margin: 12px 0 0; font-size: 12px; }
  .work-line { display: block; border-bottom: 1px solid #99a59d; height: 22px; }
  .answer-key { break-before: page; }
  .answer { padding: 15px 0; border-bottom: 1px solid #cbd4ce; break-inside: avoid; }
  .answer p, .answer ul { font-size: 14px; }
  .answer ul { padding-left: 22px; margin: 0; }
  .answer-value { display: inline-block; margin-left: 8px; }
  @media (max-width: 700px) {
    .paper { margin: 0 12px 20px; padding: 20px; }
    .toolbar { padding: 16px; }
    .toolbar .product { margin-left: 0; }
    .two-columns, .question-grid { grid-template-columns: 1fr; }
    .question.equation-question { grid-column: auto; }
    .envelope-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  }
  @page { size: A4; margin: 12mm; }
  @media print {
    html, body { background: #fff; color: #000; }
    body { font-size: 10pt; line-height: 1.3; }
    .toolbar { display: none; }
    .noscript-note { display: none; }
    .paper { max-width: none; width: 100%; margin: 0; padding: 0; border: 0; border-radius: 0; }
    .eyebrow { font-size: 8pt; color: #000; }
    h1 { font-size: 22pt; margin-bottom: 7px; }
    h2 { font-size: 20pt; }
    h3 { font-size: 11pt; }
    p { margin-bottom: 7px; }
    a { color: #000; }
    .details { font-size: 9pt; margin: 12px 0; }
    .summary { margin: 10px 0; padding: 8px; }
    .two-columns { grid-template-columns: 1fr 1fr; gap: 16px; }
    caption { font-size: 8pt; padding-bottom: 5px; }
    th { font-size: 8pt; }
    td { font-size: 9pt; }
    th, td { padding: 4px 6px; border-color: #7d7d7d; }
    .mark-box { width: 11px; height: 11px; accent-color: #000; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .mark-box:focus-visible { outline: 0; }
    .completion-mark { min-width: 11px; min-height: 11px; }
    .notes { font-size: 8pt; color: #000; margin-top: 10px; }
    .envelope-grid { grid-template-columns: repeat(10, minmax(0, 1fr)); gap: 5px; margin: 12px 0; }
    .envelope-grid li { border-color: #555; }
    .envelope-entry { min-height: 43px; padding: 4px; }
    .envelope-number { font-size: 13pt; }
    .envelope-amount { font-size: 8pt; }
    .instructions { font-size: 9pt; margin: 9px 0 14px; }
    .question-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .question { padding: 12px; border-color: #555; }
    .question.equation-question { grid-column: 1 / -1; }
    .question p { font-size: 9pt; }
    .hint { color: #000; }
    .equation { font-size: 17pt; }
    .question table { margin: 6px 0; }
    .question th { font-size: 8pt; }
    .question td { font-size: 12pt; padding: 4px; }
    .blank { width: 18px; height: 18px; border-color: #000; }
    .work { font-size: 8pt; margin-top: 7px; }
    .work-line { height: 15px; border-color: #555; }
    .answer-key { padding-top: 0; }
    .answer { padding: 10px 0; }
    .answer p, .answer ul { font-size: 9pt; }
    body[data-print-mode="questions"] .answer-key { display: none; }
  }
`;

const printScript = `<script>
  document.querySelectorAll('[data-print]').forEach(function (button) {
    button.addEventListener('click', function () {
      document.body.dataset.printMode = button.dataset.print;
      window.print();
    });
  });
  window.addEventListener('afterprint', function () { delete document.body.dataset.printMode; });
</script>`;
function documentHtml(title, description, toolbar, paper, extra = '') {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <meta name="description" content="${escape(description)}">
  <title>${escape(title)} | Moocsoft printable worksheet</title>
  <link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg">
  <style>${css}</style>
</head>
<body>
  <nav class="toolbar" aria-label="Worksheet actions">${toolbar}</nav>
  <main id="main-content"><noscript><p class="noscript-note">Use your browser’s Print menu to print this worksheet.${extra ? ` For a questions-only math sheet, use the <a href="${worksheet.svgPath}" download>downloadable SVG question sheet</a>.` : ''}</p></noscript>${paper}${extra}</main>
  ${printScript}
</body>
</html>
`;
}
const savingsNote = 'Free website worksheet. On-screen checks are not saved. Keep a printout before leaving; the CSV is a blank spreadsheet copy for your own records. Savings Goal Tracker’s Premium PDF/Excel exports for app records are separate features.';
function savingsTable(rows, caption) {
  return `<table><caption>${caption}</caption><thead><tr><th scope="col">Week</th><th scope="col">Deposit</th><th scope="col">Running total</th><th scope="col" class="completion-cell">Done</th></tr></thead><tbody>${rows.map(row => `<tr data-week="${row.week}"><td>${row.week}</td><td>${money(row.depositCents)}</td><td>${money(row.totalCents)}</td><td class="completion-cell"><label class="completion-mark"><input type="checkbox" class="mark-box" aria-label="Mark week ${row.week} after depositing"></label></td></tr>`).join('')}</tbody></table>`;
}
const reverseHtml = documentHtml('Reverse 52-Week Savings Chart', 'Print every reverse 52-week deposit from $52 down to $1, with planned running totals and completion boxes.', `
    <a href="/guides/reverse-52-week-savings-challenge/">← Read the reverse challenge guide</a>
    <button type="button" data-print="all">Print chart</button>
    <a href="/assets/worksheets/reverse-52-week-savings.csv" download>Download CSV</a>
    <a class="product" href="/savings-goal-tracker/">Explore Savings Goal Tracker →</a>`, `
    <section class="paper" aria-labelledby="sheet-title">
      <p class="eyebrow">Moocsoft.net · Free website worksheet</p>
      <h1 id="sheet-title">Reverse 52-week savings chart</h1>
      <p class="intro">Start with $52 in week 1, then reduce each planned weekly deposit by $1. Tick a box only after you have actually set aside that amount. Totals below assume every planned deposit is completed in order.</p>
      <div class="details"><span>Name: <span class="write-line"></span></span><span>Start date: <span class="write-line"></span></span></div>
      <p class="summary">52 deposits · $52 → $1 · Planned total: $1,378, excluding interest</p>
      <div class="two-columns">${savingsTable(reverseRows.slice(0, 26), 'Weeks 1–26')}${savingsTable(reverseRows.slice(26), 'Weeks 27–52')}</div>
      <p class="notes">${savingsNote}</p>
      <p class="notes">Guide: moocsoft.net/guides/reverse-52-week-savings-challenge/</p>
    </section>`);
const envelopeHtml = documentHtml('100 Envelope Challenge Checklist', 'Print a complete 1–100 envelope checklist, with classic, half-size and tenth-size savings totals.', `
    <a href="/guides/100-envelope-challenge/">← Read the 100 envelope guide</a>
    <button type="button" data-print="all">Print checklist</button>
    <a href="/assets/worksheets/100-envelope-checklist.csv" download>Download CSV</a>
    <a class="product" href="/savings-goal-tracker/">Explore Savings Goal Tracker →</a>`, `
    <section class="paper" aria-labelledby="sheet-title">
      <p class="eyebrow">Moocsoft.net · Free website worksheet</p>
      <h1 id="sheet-title">100 envelope challenge checklist</h1>
      <p class="intro">Complete each number once, in any order. In the classic version, envelope 37 means a $37 contribution. Tick the box after you have set aside the money. One contribution per day is optional: 100 days is not a required deadline.</p>
      <p class="summary">Classic $1–$100: $5,050 total · Half-size $0.50–$50: $2,525 · Tenth-size $0.10–$10: $505</p>
      <div class="details"><span>Start date: <span class="write-line"></span></span><span>My multiplier: <span class="write-line"></span></span><span>My target: <span class="write-line"></span></span></div>
      <ol class="envelope-grid" aria-label="Envelope numbers 1 through 100">${envelopeRows.map(row => `<li data-envelope="${row.number}"><label class="envelope-entry"><span class="envelope-number">${row.number}</span><input type="checkbox" class="mark-box" aria-label="Mark envelope ${row.number} after contributing"><span class="envelope-amount">${money(row.classicCents)} classic</span></label></li>`).join('')}</ol>
      <p class="notes">Use the same multiplier for every number: number × $1, $0.50 or $0.10. Totals exclude interest and assume all 100 contributions are completed. Choose a pace and amount that fit your budget.</p>
      <p class="notes">${savingsNote}</p>
      <p class="notes">Guide: moocsoft.net/guides/100-envelope-challenge/</p>
    </section>`);
function questionHtml(question) {
  const puzzle = question.kind === 'equation'
    ? `<div class="equation" aria-label="${escape(question.equation.replace('□', 'missing number'))}">${escape(question.equation)}</div>`
    : `<table aria-label="Question ${question.number} number grid"><thead><tr>${question.columns.map(column => `<th scope="col">${escape(column)}</th>`).join('')}</tr></thead><tbody>${question.rows.map(row => `<tr>${row.map(value => `<td>${value === null ? '<span class="blank" aria-label="Missing number"></span>' : value}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return `<section class="question${question.kind === 'equation' ? ' equation-question' : ''}" data-question="${question.number}" aria-labelledby="question-${question.number}"><h3 id="question-${question.number}">${question.number}. ${escape(question.title)}</h3><p>${escape(question.prompt)}</p><p class="hint"><strong>Rule:</strong> ${escape(question.ruleHint)}</p>${puzzle}<div class="work">Answer: <span class="write-line"></span><span class="work-line" aria-label="Space to explain your method"></span></div></section>`;
}
const puzzleHtml = documentHtml(worksheet.title, worksheet.description, `
    <a href="${worksheet.guidePath}">← Read the missing-number guide</a>
    <button type="button" data-print="questions">Print questions only</button>
    <button type="button" data-print="all">Print questions + answer key</button>
    <a href="${worksheet.svgPath}" download>Download question sheet (SVG)</a>
    <a class="product" href="/math-riddles/">Explore Math Riddles →</a>`, `
    <section class="paper question-sheet" aria-labelledby="sheet-title">
      <p class="eyebrow">Moocsoft.net · Free website worksheet</p>
      <h1 id="sheet-title">${escape(worksheet.title)}</h1>
      <p>${escape(worksheet.subtitle)}</p>
      <ul class="instructions">${worksheet.instructions.map(instruction => `<li>${escape(instruction)}</li>`).join('')}</ul>
      <div class="question-grid">${worksheet.questions.map(questionHtml).join('')}</div>
      <p class="notes">Free website practice sheet. It is separate from the Math Riddles app and does not connect to or import into the app.</p>
      <p class="notes">Guide: moocsoft.net${worksheet.guidePath}</p>
    </section>`, `
    <section class="paper answer-key" id="answer-key" aria-labelledby="answer-key-title">
      <p class="eyebrow">Moocsoft.net · Separate answer key</p>
      <h2 id="answer-key-title">Missing-number answers and checks</h2>
      <p>Compare your method with the stated rule, then substitute your answer back into every row.</p>
      ${worksheet.questions.map(question => `<section class="answer" data-answer="${question.answer}" data-answer-for="${question.number}"><h3>${question.number}. ${escape(question.title)} <span class="answer-value">Answer: ${question.answer}</span></h3><p>${escape(question.explanation)}</p><ul>${question.checks.map(check => `<li>${escape(check)}</li>`).join('')}</ul></section>`).join('')}
      <p class="notes">These original examples are website practice, not answers to numbered app levels. Explore the current app at moocsoft.net/math-riddles/.</p>
    </section>`);

function writeAsset(path, content) {
  const target = resolve(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}
writeAsset('assets/worksheets/reverse-52-week-savings.html', reverseHtml);
writeAsset('assets/worksheets/reverse-52-week-savings.csv', 'Week,PlannedDepositUSD,PlannedCumulativeUSD,Completed,ActualDepositDate\n' + reverseRows.map(row => `${row.week},${csvMoney(row.depositCents)},${csvMoney(row.totalCents)},,`).join('\n') + '\n');
writeAsset('assets/worksheets/100-envelope-checklist.html', envelopeHtml);
writeAsset('assets/worksheets/100-envelope-checklist.csv', 'Number,ClassicUSD,HalfUSD,TenthUSD,Completed,ActualDepositDate\n' + envelopeRows.map(row => `${row.number},${csvMoney(row.classicCents)},${csvMoney(row.halfCents)},${csvMoney(row.tenthCents)},,`).join('\n') + '\n');
writeAsset('assets/worksheets/missing-number-puzzles.html', puzzleHtml);

// Text is wrapped inside the SVG so the downloaded worksheet is a standalone,
// editable vector sheet with exactly the same prompts and blanks as the HTML.
function wrapText(value, maximum) {
  const words = value.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (line && (line + ' ' + word).length > maximum) { lines.push(line); line = word; }
    else line = line ? line + ' ' + word : word;
  }
  if (line) lines.push(line);
  return lines;
}
function svgText(value, x, y, { size = 12, maximum = 48, lineHeight = 16, weight = 400, fill = '#18201c' } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${wrapText(value, maximum).map((line, index) => `<tspan x="${x}" dy="${index ? lineHeight : 0}">${escape(line)}</tspan>`).join('')}</text>`;
}
function svgQuestion(question, x, y, width, height) {
  let content = `<g transform="translate(${x} ${y})"><rect width="${width}" height="${height}" fill="#fff" stroke="#555"/>`;
  content += svgText(`${question.number}. ${question.title}`, 15, 24, { size: 15, maximum: question.kind === 'equation' ? 85 : 38, lineHeight: 18, weight: 650 });
  if (question.kind === 'equation') {
    content += svgText(question.prompt, 15, 48, { maximum: 100 });
    content += svgText(`Rule: ${question.ruleHint}`, 15, 70, { maximum: 105 });
    content += svgText(question.equation, 15, 112, { size: 24, weight: 650 });
    content += svgText('Answer:', 335, 109);
    content += '<path d="M386 112h285M335 132h336" stroke="#777" fill="none"/>';
  } else {
    content += svgText(question.prompt, 15, 72, { maximum: 44, lineHeight: 15 });
    content += svgText(`Rule: ${question.ruleHint}`, 15, 125, { maximum: 44, lineHeight: 15 });
    const tableY = 170;
    const cellWidth = (width - 30) / 3;
    const rowHeight = 27;
    content += `<path d="M15 ${tableY}h${width - 30}M15 ${tableY + rowHeight}h${width - 30}" stroke="#555" fill="none"/>`;
    question.columns.forEach((column, index) => { content += `<text x="${15 + cellWidth * (index + .5)}" y="${tableY + 18}" font-size="10" font-weight="650" text-anchor="middle">${escape(column)}</text>`; });
    question.rows.forEach((row, rowIndex) => {
      const rowY = tableY + rowHeight * (rowIndex + 1);
      row.forEach((value, columnIndex) => {
        const cellX = 15 + cellWidth * (columnIndex + .5);
        content += value === null ? `<rect x="${cellX - 9}" y="${rowY + 4}" width="18" height="18" fill="#fff" stroke="#444"/>` : `<text x="${cellX}" y="${rowY + 20}" font-size="17" text-anchor="middle">${value}</text>`;
      });
      content += `<path d="M15 ${rowY + rowHeight}h${width - 30}" stroke="#aaa" fill="none"/>`;
    });
    content += svgText('Answer:', 15, 297);
    content += `<path d="M65 300h${width - 80}M15 321h${width - 30}" stroke="#777" fill="none"/>`;
  }
  return content + '</g>';
}
const questionSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 794 1123" role="img" aria-labelledby="title description">
  <title id="title">${escape(worksheet.title)} — questions only</title>
  <desc id="description">Five original question prompts and blank answer spaces. Answers are provided separately on the HTML worksheet.</desc>
  <rect width="794" height="1123" fill="#fff"/>
  <g font-family="Arial, Helvetica, sans-serif" fill="#18201c">
    ${svgText('MOOCSOFT.NET · FREE WEBSITE WORKSHEET', 44, 39, { size: 10, maximum: 100 })}
    ${svgText(worksheet.title, 44, 73, { size: 28, maximum: 90, weight: 700 })}
    ${svgText('Five original questions · Questions only', 44, 95, { size: 12, maximum: 100 })}
    ${worksheet.instructions.map((instruction, index) => svgText('• ' + instruction, 44, 119 + index * 19, { size: 11, maximum: 119, lineHeight: 14 })).join('')}
    ${svgQuestion(worksheet.questions[0], 44, 200, 706, 148)}
    ${worksheet.questions.slice(1).map((question, index) => svgQuestion(question, 44 + (index % 2) * 361, 364 + Math.floor(index / 2) * 349, 345, 333)).join('')}
    ${svgText('Explain your method on the writing lines. Check the separate answer key after attempting all five questions.', 44, 1072, { size: 10, maximum: 125 })}
    <a href="https://moocsoft.net${worksheet.guidePath}">${svgText('Guide: moocsoft.net' + worksheet.guidePath, 44, 1090, { size: 10, maximum: 125 })}</a>
  </g>
</svg>
`;
writeAsset('assets/worksheets/missing-number-puzzles.svg', questionSvg);

function illustration(title, description, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">${escape(description)}</desc><rect width="1200" height="675" fill="#f2f6ef"/>${body}</svg>\n`;
}
const reverseVisual = illustration('Reverse 52-week savings contributions decrease over time', 'Four declining bars show deposits of 598, 429, 260 and 91 dollars in consecutive 13-week groups.', `
  <circle cx="1080" cy="105" r="180" fill="#dcead7"/><circle cx="65" cy="650" r="215" fill="#e2ebdc"/>
  <path d="M139 518h920" stroke="#829989" stroke-width="3"/>
  <g font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
    ${quarterTotals.map((cents, index) => {
      const value = cents / 100;
      const barHeight = Math.round(value / 598 * 336);
      const x = 179 + index * 216;
      return `<rect x="${x}" y="${518 - barHeight}" width="146" height="${barHeight}" rx="14" fill="${['#23624c', '#408564', '#6da382', '#a4c0a0'][index]}"/><text x="${x + 73}" y="${496 - barHeight}" font-size="32" font-weight="700" fill="#193a2b">$${value}</text><text x="${x + 73}" y="557" font-size="18" fill="#496553">${index * 13 + 1}–${(index + 1) * 13}</text>`;
    }).join('')}
  </g>
  <path d="M250 90C490 100 720 155 943 295" stroke="#a6bcaa" stroke-width="4" stroke-dasharray="7 11" fill="none"/><path d="m934 277 13 22-25-1" stroke="#a6bcaa" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <g fill="#d0dec8"><circle cx="1074" cy="526" r="11"/><circle cx="1132" cy="505" r="6"/><circle cx="1100" cy="561" r="5"/></g>`);

const checklistCells = envelopeRows.map((row, index) => {
  const x = 182 + (index % 10) * 44;
  const y = 150 + Math.floor(index / 10) * 37;
  return `<rect x="${x}" y="${y}" width="36" height="29" rx="4" fill="${[0, 2, 7, 13, 24, 41, 63, 80].includes(index) ? '#dce9d8' : '#fff'}" stroke="#b2c3b0"/><text x="${x + 18}" y="${y + 20}" font-size="13" text-anchor="middle" fill="#3a5742">${row.number}</text>`;
}).join('');
function envelope(x, y, number, rotation, color) {
  return `<g transform="translate(${x} ${y}) rotate(${rotation})"><rect width="204" height="139" rx="8" fill="${color}" stroke="#66826d" stroke-width="2"/><path d="m0 9 102 72 102-72M0 134l68-56M204 134l-68-56" fill="none" stroke="#66826d" stroke-width="2"/><circle cx="102" cy="97" r="28" fill="#fafbf6"/><text x="102" y="105" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#31513b">${number}</text></g>`;
}
const envelopeVisual = illustration('A numbered 100-envelope savings checklist with coins', 'A paper checklist displays every number from 1 to 100 beside three numbered envelopes and a small pile of coins.', `
  <circle cx="1079" cy="95" r="185" fill="#e2ecd9"/><circle cx="44" cy="510" r="217" fill="#e2eadc"/>
  <rect x="144" y="94" width="510" height="496" rx="12" fill="#dbe4d6"/><rect x="134" y="81" width="510" height="496" rx="10" fill="#fffdf6" stroke="#c2cfbc" stroke-width="2"/>
  <rect x="305" y="66" width="170" height="39" rx="10" fill="#8aa48a"/><path d="M328 82h126" stroke="#cad7c7" stroke-width="3" stroke-linecap="round"/>
  <g font-family="Arial, Helvetica, sans-serif">${checklistCells}</g>
  ${envelope(718, 98, 18, 9, '#e4eddd')}${envelope(804, 254, 42, -7, '#ccdcbc')}${envelope(719, 399, 100, 5, '#eaf0df')}
  <g stroke="#ba9b3e" stroke-width="2"><ellipse cx="1025" cy="564" rx="50" ry="16" fill="#d1b64f"/><path d="M975 540v24c0 21 100 21 100 0v-24" fill="#d8be5e"/><ellipse cx="1025" cy="540" rx="50" ry="16" fill="#ecda94"/><path d="M978 532v10c0 21 94 21 94 0v-10" fill="#d8be5e"/><ellipse cx="1025" cy="531" rx="47" ry="15" fill="#f0dfa2"/><ellipse cx="1100" cy="590" rx="35" ry="12" fill="#e9d58b"/><circle cx="1090" cy="486" r="37" fill="#e4cd76"/><circle cx="1090" cy="486" r="27" fill="none" stroke="#c6a955"/></g>`);

const gridValues = worksheet.questions.find(question => question.verification.rule === 'product-minus-two').rows;
const mathVisual = illustration('Missing-number grid reasoning', 'A three-row number grid shows a missing result with separate multiplication and subtraction symbols, illustrating a consistent row rule.', `
  <circle cx="1048" cy="115" r="207" fill="#e5e9dc"/><circle cx="75" cy="648" r="225" fill="#dee7dc"/>
  <g font-family="Arial, Helvetica, sans-serif" font-weight="700" text-anchor="middle">
    ${gridValues.map((row, rowIndex) => row.map((value, columnIndex) => {
      const x = 156 + columnIndex * 172;
      const y = 137 + rowIndex * 139;
      return `<rect x="${x}" y="${y}" width="150" height="117" rx="17" fill="${['#d1e5d7', '#d8e3ec', '#e6dac3'][columnIndex]}" stroke="${['#85a68d', '#90a6b6', '#b7a582'][columnIndex]}" stroke-width="2"/><text x="${x + 75}" y="${y + 76}" font-size="51" fill="#315044">${value === null ? '?' : value}</text>`;
    }).join('')).join('')}
    <circle cx="876" cy="209" r="50" fill="#d1e5d7" stroke="#85a68d" stroke-width="2"/><text x="876" y="228" font-size="51" fill="#315044">×</text>
    <path d="M876 274v70" stroke="#8aa192" stroke-width="4" stroke-linecap="round"/><path d="m866 331 10 13 10-13" stroke="#8aa192" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="806" y="363" width="140" height="103" rx="18" fill="#e6dac3" stroke="#b7a582" stroke-width="2"/><text x="876" y="427" font-size="41" fill="#315044">−2</text>
    <circle cx="1028" cy="505" r="9" fill="#96b09d"/><circle cx="1077" cy="449" r="5" fill="#96b09d"/><circle cx="1083" cy="542" r="5" fill="#96b09d"/>
  </g>`);
for (const [name, svg] of [['reverse-52-week-savings', reverseVisual], ['100-envelope-challenge', envelopeVisual], ['missing-number-puzzles', mathVisual]]) {
  writeAsset(`assets/guide-visuals/${name}.svg`, svg);
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, adaptiveFiltering: false }).toBuffer();
  const metadata = await sharp(png).metadata();
  if (metadata.width !== 1200 || metadata.height !== 675) throw new Error(`Invalid illustration dimensions: ${name}`);
  writeAsset(`assets/guide-visuals/${name}.png`, png);
}
console.log('Built 6 printable worksheet/CSV/SVG files and 3 original SVG/PNG guide illustrations.');
