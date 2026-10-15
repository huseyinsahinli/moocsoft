// Progressive enhancement only. Questions, hints and explanations are static HTML.
(function () {
  'use strict';

  function parseWholeAnswer(value) {
    const text = String(value).trim();
    if (!/^[+-]?\d{1,6}$/.test(text)) return null;
    const answer = Number(text);
    return Number.isSafeInteger(answer) && Math.abs(answer) <= 999999 ? answer : null;
  }

  function checkAnswer(value, expected) {
    const answer = parseWholeAnswer(value);
    if (answer === null) return { kind: 'invalid', correct: false, message: 'Enter a whole number from −999999 to 999999. Use digits, not a decimal or an expression.' };
    if (answer === expected) return { kind: 'correct', correct: true, message: 'Correct. Open the explanation to check the reasoning, then try the next puzzle.' };
    return { kind: 'retry', correct: false, message: 'Not quite. Check the question’s rule, try a hint, or open the explanation. You can try again.' };
  }

  function initializeMathRound(root) {
    const cards = Array.from(root.querySelectorAll('[data-math-question]'));
    const summary = root.querySelector('[data-math-summary]');
    const reset = root.querySelector('[data-math-reset]');
    if (!cards.length || !summary || !reset) return;
    const checks = cards.map(() => null);
    const fields = cards.map(card => ({ card, form: card.querySelector('form'), input: card.querySelector('input'), feedback: card.querySelector('[data-math-feedback]'), expected: Number(card.dataset.answer) }));
    // Validate the whole round before exposing any controls.
    if (fields.some(field => !field.form || !field.input || !field.feedback || !Number.isSafeInteger(field.expected))) return;
    const updateSummary = () => {
      const tried = checks.filter(value => value !== null).length;
      const correct = checks.filter(value => value === true).length;
      summary.textContent = `${correct} correct checks out of ${cards.length} puzzles; ${tried} answers currently checked. Nothing is saved. Opening an explanation does not mark an answer correct.`;
    };
    for (const [index, { form, input, feedback, expected }] of fields.entries()) {
      form.hidden = false;
      form.addEventListener('submit', event => {
        event.preventDefault();
        const result = checkAnswer(input.value, expected);
        feedback.textContent = result.message;
        feedback.dataset.kind = result.kind;
        input.setAttribute('aria-invalid', String(result.kind === 'invalid'));
        checks[index] = result.kind === 'invalid' ? null : result.correct;
        updateSummary();
        if (result.kind === 'invalid') input.focus();
      });
      input.addEventListener('input', () => {
        checks[index] = null;
        feedback.textContent = '';
        delete feedback.dataset.kind;
        input.removeAttribute('aria-invalid');
        updateSummary();
      });
    }
    reset.hidden = false;
    reset.addEventListener('click', () => {
      for (const [index, { card, input, feedback }] of fields.entries()) {
        checks[index] = null;
        input.value = '';
        input.removeAttribute('aria-invalid');
        feedback.textContent = '';
        delete feedback.dataset.kind;
        card.querySelectorAll('details').forEach(details => { details.open = false; });
      }
      updateSummary();
      fields[0].input.focus();
    });
    updateSummary();
  }

  function initializeRoundLink(round, browser) {
    const link = round.querySelector('[data-math-round-link]');
    const input = round.querySelector('[data-math-share-url]');
    const copy = round.querySelector('[data-math-copy]');
    const status = round.querySelector('[data-math-share-status]');
    if (!link || !input || !copy || !status) return;
    // Use the static public destination, never the visitor URL or form values.
    const url = link.getAttribute('href');
    if (!/^https:\/\/moocsoft\.net\/tools\/math-puzzle-challenge\/#round-(mixed|everyday|logic)$/.test(url)) return;
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      try {
        if (!browser.clipboard || typeof browser.clipboard.writeText !== 'function') throw new Error('Manual copy needed');
        await browser.clipboard.writeText(url);
        status.textContent = 'Round link copied. It contains no answers or score.';
      } catch (_) {
        input.focus();
        input.select();
        status.textContent = 'Automatic copying is unavailable. Copy the selected public round link manually.';
      }
    });
  }

  function initializeMathChallenge(root, browser) {
    const rounds = Array.from(root.querySelectorAll('[data-math-round]'));
    for (const round of rounds) {
      initializeMathRound(round);
      initializeRoundLink(round, browser || {});
    }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { parseWholeAnswer, checkAnswer, initializeMathRound, initializeRoundLink, initializeMathChallenge };
  if (typeof document !== 'undefined') initializeMathChallenge(document, navigator);
}());
