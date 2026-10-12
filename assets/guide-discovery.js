// A progressive, local-only filter. The full linked library is already HTML.
(() => {
  function enhance() {
    const normalize = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLocaleLowerCase('en');
    document.querySelectorAll('[data-guide-library]').forEach(library => {
      const form = library.querySelector('form[data-guide-filter]');
      const query = form?.querySelector('input[name="q"]');
      const topic = form?.querySelector('select[name="topic"]');
      const format = form?.querySelector('select[name="format"]');
      const status = library.querySelector('[data-guide-result-count]');
      const empty = library.querySelector('[data-guide-no-results]');
      const cards = Array.from(library.querySelectorAll('a.guide-card[data-guide-topic][data-guide-format]'));
      if (!form || !query || !topic || !format || !status || !empty || !cards.length) return;

      const blocks = Array.from(library.querySelectorAll('[data-guide-topic]'))
        .filter(block => !block.matches('a.guide-card') && block.querySelector('a.guide-card[data-guide-topic][data-guide-format]'));
      const text = new Map(cards.map(card => [card, normalize(card.textContent)]));
      function update() {
        const words = normalize(query.value.trim()).split(/\s+/).filter(Boolean);
        let shown = 0;
        for (const card of cards) {
          const match = (!topic.value || card.dataset.guideTopic === topic.value)
            && (!format.value || card.dataset.guideFormat === format.value)
            && words.every(word => text.get(card).includes(word));
          card.hidden = !match;
          if (match) shown += 1;
        }
        for (const block of blocks) {
          block.hidden = !Array.from(block.querySelectorAll('a.guide-card[data-guide-topic][data-guide-format]'))
            .some(card => !card.hidden);
        }
        status.textContent = `${shown} of ${cards.length} guides shown.`;
        empty.hidden = shown !== 0;
      }

      form.addEventListener('submit', event => event.preventDefault());
      query.addEventListener('input', update);
      topic.addEventListener('change', update);
      format.addEventListener('change', update);
      form.addEventListener('reset', event => {
        event.preventDefault();
        query.value = '';
        topic.value = '';
        format.value = '';
        update();
        query.focus();
      });
      form.hidden = false;
      update();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
  else enhance();
})();
