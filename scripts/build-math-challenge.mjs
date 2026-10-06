import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, site, escape as e } from '../content/apps.mjs';
import { mathChallenge } from '../content/math-challenge.mjs';
import { head, footer, storeLinks } from '../content/components.mjs';
import { attributeStoreLinks } from '../content/store-attribution.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = '/tools/math-puzzle-challenge/';
const title = 'Free Math Puzzle Challenge: 5 Riddles With Answers';
const description = 'Try five original math puzzles online: order of operations, missing numbers, digit logic, fractions and grid counting. Check answers, hints and explanations. No sign-up.';
const app = apps.math;
const ids = new Set();
if (mathChallenge.length !== 5) throw new Error('This challenge needs five original questions.');
for (const question of mathChallenge) {
  if (!/^[a-z0-9-]+$/.test(question.id) || ids.has(question.id) || !Number.isSafeInteger(question.answer)
      || Math.abs(question.answer) > 999999 || !question.question || !question.hint || !question.explanation
      || !/^\/guides\/[a-z0-9-]+\/$/.test(question.guide)) throw new Error(`Invalid math challenge: ${question.id}`);
  ids.add(question.id);
}
const graph = [
  { '@type': 'WebPage', name: title, description, url: site + path, inLanguage: 'en', isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'Moocsoft', url: site },
    about: { '@type': 'Thing', name: 'Math puzzles with hints and worked explanations' } },
  { '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Free tools', '/tools/'], ['Math puzzle challenge', path]].map(([name, target], index) => ({ '@type': 'ListItem', position: index + 1, name, item: site + target })) },
];
const grid = question => question.grid ? `<svg class="math-grid-visual" width="304" height="204" viewBox="-2 -2 304 204" role="img" aria-labelledby="grid-title-${question.id}"><title id="grid-title-${question.id}">A rectangular grid with two rows and three columns of equal square cells</title><rect x="0" y="0" width="300" height="200" fill="none" stroke="currentColor" stroke-width="3"></rect><path d="M100 0v200M200 0v200M0 100h300" fill="none" stroke="currentColor" stroke-width="3"></path></svg>` : '';
const questions = mathChallenge.map((question, index) => `<article class="panel math-question" id="puzzle-${e(question.id)}" data-math-question="${e(question.id)}" data-answer="${question.answer}" aria-labelledby="question-title-${e(question.id)}">
      <span class="eyebrow">Puzzle ${index + 1} of 5 · ${e(question.category)}</span>
      <h2 id="question-title-${e(question.id)}">${e(question.title)}</h2>
      <p id="question-copy-${e(question.id)}">${e(question.question)}</p>
      <p class="math-question-display" aria-hidden="true">${e(question.display)}</p>${grid(question)}
      <form class="math-challenge-form" hidden novalidate aria-label="Check puzzle ${index + 1}: ${e(question.title)}">
        <label class="field" for="answer-${e(question.id)}"><span>Your whole-number answer</span><input id="answer-${e(question.id)}" type="text" inputmode="numeric" maxlength="8" autocomplete="off" aria-describedby="question-copy-${e(question.id)} feedback-${e(question.id)}"></label>
        <button class="button" type="submit">Check answer</button>
      </form>
      <p class="math-feedback" id="feedback-${e(question.id)}" data-math-feedback role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="math-hints">
        <details><summary>Get a hint for puzzle ${index + 1}</summary><p>${e(question.hint)}</p></details>
        <details><summary>Reveal answer and explanation for puzzle ${index + 1}</summary><p><strong>Answer: ${question.answer}.</strong> ${e(question.explanation)}</p><a href="${e(question.guide)}">${e(question.guideLabel)} →</a></details>
      </div>
    </article>`).join('\n    ');
const html = `${head(title, description, path, graph, app, ['math-challenge']).replace('class="marketing-page"', 'class="marketing-page math-challenge-page"')}
<main id="main-content" class="wrap">
  <div class="breadcrumb" aria-label="Breadcrumb"><a href="/">Moocsoft</a> / <a href="/tools/">Free tools</a> / Math puzzle challenge</div>
  <section class="tool-hero">
    <span class="eyebrow">Free online math puzzles · No sign-up</span>
    <h1>Five math puzzles.<br>Can you explain your answers?</h1>
    <p class="hero-copy">Try a short, untimed round of number puzzles. Enter your answers to check them, or open each hint and worked explanation. Start with reasoning; speed can wait.</p>
    <p class="math-challenge-note">These are original website practice questions, not app levels or a preview of the app interface. Nothing is saved or sent to Moocsoft. The free web challenge is separate from Math Riddles, which has ads and optional in-app purchases.</p>
    <div class="guide-hero-actions"><a href="#puzzle-brackets">Start the five-puzzle round ↓</a><a href="/math-riddles/">Explore Math Riddles →</a></div>
    <noscript><p class="math-challenge-note">The questions, hints and explanations work without JavaScript. Automatic answer checking needs JavaScript; use “Reveal answer and explanation” to check your work.</p></noscript>
  </section>
  <section class="math-challenge-list" aria-label="Five original math puzzles">
    ${questions}
  </section>
  <section class="panel math-round-review" aria-labelledby="round-review-title">
    <h2 id="round-review-title">Review the reasoning, not just the number.</h2>
    <p data-math-summary role="status" aria-live="polite" aria-atomic="true">Use each worked explanation to check your answer. Your work is not saved.</p>
    <button class="button secondary" type="button" data-math-reset hidden>Reset all answers and close hints</button>
  </section>
  <section class="guide-download" id="continue-playing" data-nosnippet aria-label="Continue with Math Riddles">
    <div><span class="guide-kicker">Enjoyed this round?</span><h2>Keep playing with Math Riddles.</h2><p>Explore the separate app’s handcrafted riddles, hints and solutions, or challenge a friend in live 1v1. Available on iPhone, iPad and Android.</p><small>Free to download · Ads and optional in-app purchases. Check your store for current features and access.</small></div>
    ${storeLinks(app, 'tool-end')}
  </section>
  <section class="content-section math-help" aria-labelledby="challenge-help-title">
    <h2 id="challenge-help-title">How to use this math puzzle challenge</h2>
    <p>Make one attempt before opening a hint. Write the rule or calculation that led to your answer. If you get stuck, use the hint and try again; the explanation is there to make the reasoning visible, not to grade you.</p>
    <h3>Do these puzzles have one correct answer?</h3><p>Yes, under the stated rules. The row puzzle supplies its formula, the digit puzzle has two constraints, and the grid question defines which rectangles count. Short number patterns without those constraints can support more than one constructed rule.</p>
    <h3>Are the exercises from Math Riddles app levels?</h3><p>No. This page contains five original web exercises. The mobile app has its own content and modes, including hints, solutions and live 1v1. See the store listing for current platform features and purchases.</p>
    <h3>Is my score saved or shared?</h3><p>No. Answer checks only run in this page. Editing an answer clears its previous check; refreshing or resetting clears the round. Opening an explanation does not count as a correct answer. This is practice, not an IQ test or a claim about cognitive improvement.</p>
    <div class="guide-hero-actions"><a href="/guides/math/">Choose another math guide →</a><a href="/guides/missing-number-puzzles-with-answers/">Get the free missing-number worksheet →</a></div>
  </section>
</main>
${footer()}
</body>
</html>`;
const target = resolve(root, '.' + path, 'index.html');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, attributeStoreLinks(html, path).trimEnd() + '\n');
console.log('Built one free Math puzzle challenge with five static questions and accessible answer checking.');
