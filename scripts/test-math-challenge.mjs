import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mathChallenge } from '../content/math-challenge.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { parseWholeAnswer, checkAnswer, initializeMathChallenge } = require('../assets/math-challenge.js');

// Verify independently rather than merely comparing the checker to its own answer data.
assert.equal(mathChallenge[0].answer, 9 + 4 * (8 - 5));
assert.equal(mathChallenge[1].answer, 7 * 8 + 7);
const digitAnswers = Array.from({ length: 90 }, (_, i) => i + 10).filter(number => {
  const tens = Math.floor(number / 10), units = number % 10;
  return tens + units === 13 && 10 * units + tens - number === 27;
});
assert.deepEqual(digitAnswers, [mathChallenge[2].answer]);
const numerators = Array.from({ length: 13 }, (_, i) => i).filter(n => n * 6 === 5 * 12);
assert.deepEqual(numerators, [mathChallenge[3].answer]);
let rectangles = 0;
for (let top = 0; top < 2; top++) for (let bottom = top + 1; bottom <= 2; bottom++)
  for (let left = 0; left < 3; left++) for (let right = left + 1; right <= 3; right++) rectangles++;
assert.equal(mathChallenge[4].answer, rectangles);
assert.equal(rectangles, 18);
assert.equal(new Set(mathChallenge.map(q => q.id)).size, 5);
for (const question of mathChallenge) {
  assert.equal(checkAnswer(String(question.answer), question.answer).kind, 'correct');
  assert.equal(checkAnswer(String(question.answer + 1), question.answer).kind, 'retry');
  assert.equal(checkAnswer('', question.answer).kind, 'invalid');
}
for (const [input, expected] of [['21', 21], [' 21 ', 21], ['+21', 21], ['000021', 21], ['-99', -99], ['0', 0], ['999999', 999999], ['-999999', -999999]]) assert.equal(parseWholeAnswer(input), expected);
for (const input of ['', ' ', '1.5', '21.0', '1e2', 'Infinity', 'NaN', '9+12', '0x15', '21junk', '1,000', '1000000', '-1000000', '１２', '999999999999999999']) assert.equal(parseWholeAnswer(input), null, input);

// A minimal DOM stand-in exercises event wiring without dependencies.
function element() {
  return { hidden: true, value: '', textContent: '', dataset: {}, attrs: {}, events: {}, focused: false,
    addEventListener(name, fn) { this.events[name] = fn; },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
    focus() { this.focused = true; },
    emit(name) { let prevented = false; this.events[name]({ preventDefault() { prevented = true; } }); return prevented; },
  };
}
const cards = mathChallenge.map(question => {
  const form = element(), input = element(), feedback = element(), details = [{ open: false }, { open: false }];
  return { dataset: { answer: String(question.answer) }, form, input, feedback, details,
    querySelector(selector) { return { form, input, '[data-math-feedback]': feedback }[selector]; },
    querySelectorAll(selector) { assert.equal(selector, 'details'); return details; },
  };
});
const summary = element(), reset = element();
const fakeDocument = {
  querySelectorAll(selector) { assert.equal(selector, '[data-math-question]'); return cards; },
  querySelector(selector) { return { '[data-math-summary]': summary, '[data-math-reset]': reset }[selector]; },
};
initializeMathChallenge(fakeDocument);
assert(cards.every(card => !card.form.hidden));
assert.equal(reset.hidden, false);
assert.match(summary.textContent, /^0 correct checks out of 5/);
cards[0].input.value = '21';
assert(cards[0].form.emit('submit'));
assert.match(cards[0].feedback.textContent, /^Correct/);
assert.match(summary.textContent, /^1 correct checks out of 5/);
cards[0].input.value = '22'; cards[0].input.emit('input');
assert.equal(cards[0].feedback.textContent, '');
assert.equal(cards[0].input.attrs['aria-invalid'], undefined);
assert.match(summary.textContent, /^0 correct checks out of 5/);
cards[0].form.emit('submit');
assert.equal(cards[0].feedback.dataset.kind, 'retry');
assert.match(summary.textContent, /1 answers currently checked/);
cards[0].input.value = '1e2'; cards[0].form.emit('submit');
assert.equal(cards[0].input.attrs['aria-invalid'], 'true');
assert.equal(cards[0].input.focused, true);
assert.match(summary.textContent, /0 answers currently checked/);
cards[1].details[1].open = true;
assert.match(summary.textContent, /^0 correct checks/); // A revealed solution is not a solved question.
for (const [index, card] of cards.entries()) { card.input.value = String(mathChallenge[index].answer); card.form.emit('submit'); }
assert.match(summary.textContent, /^5 correct checks out of 5/);
cards[0].details[0].open = true; reset.emit('click');
assert(cards.every(card => card.input.value === '' && card.feedback.textContent === '' && card.details.every(detail => !detail.open)));
assert.match(summary.textContent, /^0 correct checks out of 5/);

const html = readFileSync(resolve(root, 'tools/math-puzzle-challenge/index.html'), 'utf8');
assert.match(html, /<link rel="canonical" href="https:\/\/moocsoft\.net\/tools\/math-puzzle-challenge\/">/);
assert.equal((html.match(/data-math-question=/g) || []).length, 5);
assert.equal((html.match(/class="math-challenge-form" hidden/g) || []).length, 5);
assert.equal((html.match(/Reveal answer and explanation for puzzle/g) || []).length, 5);
assert.equal((html.match(/role="status" aria-live="polite" aria-atomic="true"/g) || []).length, 6);
for (const question of mathChallenge) {
  assert(html.includes(`<strong>Answer: ${question.answer}.</strong>`));
  assert(html.includes(question.guide));
  assert(html.includes(`id="answer-${question.id}"`));
  assert(html.includes(`for="answer-${question.id}"`));
}
assert.match(html, /<noscript>/);
assert.match(html, /original website practice questions, not app levels/);
assert.match(html, /Ads and optional in-app purchases/);
assert.match(html, /data-placement="tool-end"/);
assert.match(html, /id6449851642/);
assert.match(html, /com\.moocsoft\.math_puzzle/);
assert.match(html, /utm_campaign=tools-math-puzzle-challenge/);
assert.match(html, /utm_content=tool-end/);
assert.match(html, /\/assets\/math-challenge\.js" defer/);
assert.match(html, /\/assets\/math-challenge\.css/);
const script = readFileSync(resolve(root, 'assets/math-challenge.js'), 'utf8');
assert(!/\b(?:fetch|XMLHttpRequest|localStorage|sessionStorage)\b|document\.cookie/.test(script));
console.log('PASS: all five independent solutions, whole-number validation, check/edit/reveal/reset behavior, static no-JS answers, accessibility and real store links.');
