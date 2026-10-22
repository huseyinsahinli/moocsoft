import { escape as e } from './apps.mjs';
import { editorialPhotos, editorialPhotosDe } from './editorial-media.mjs';
import { guideTopics } from './topics.mjs';

// The scene library is reused, not presented as product screenshots or unique
// illustrations for every page. Article visuals keep their own separate layout.
export const pageVisualUpdated = '2026-10-22';
export const englishVisualTopics = Object.entries(guideTopics).map(([topic, config]) => ({
  topic, href: `/guides/${topic}/`, label: config.category, visual: editorialPhotos[topic],
}));

const germanLabels = {
  savings: 'Eine No-Spend-Woche planen',
  habits: 'Gewohnheiten bei Schichtarbeit',
  development: 'Eine App-Übergabe prüfen',
};
export function germanVisualTopics(guides) {
  return guides.map(guide => {
    if (!germanLabels[guide.topic] || !editorialPhotosDe[guide.topic]) throw new Error('Missing translated visual destination');
    return { topic: guide.topic, href: `/de/guides/${guide.slug}/`, label: germanLabels[guide.topic], visual: editorialPhotosDe[guide.topic] };
  });
}

const fullSizes = '(max-width: 600px) calc(100vw - 32px), (max-width: 890px) calc(100vw - 40px), 850px';
const cardSizes = '(max-width: 600px) calc((100vw - 46px) / 2), (max-width: 820px) calc((100vw - 68px) / 3), (max-width: 1160px) calc((100vw - 82px) / 4), 269px';
const threeCardSizes = '(max-width: 600px) calc((100vw - 46px) / 2), (max-width: 1160px) calc((100vw - 68px) / 3), 364px';
function picture(visual, sizes) {
  if (!visual || visual.kind !== 'photo' || !visual.webp?.length || !visual.alt || !visual.caption) throw new Error('Missing editorial page photograph');
  return `<picture><source type="image/webp" srcset="${visual.webp.map(image => `${image.src} ${image.width}w`).join(', ')}" sizes="${sizes}"><img data-page-visual="photo" src="${visual.src}" width="${visual.width}" height="${visual.height}" loading="lazy" decoding="async" alt="${e(visual.alt)}"></picture>`;
}
export function pagePhotoFigure(visual) {
  return `<figure class="page-topic-photo">${picture(visual, fullSizes)}<figcaption>${e(visual.caption)}</figcaption></figure>`;
}
export function visualTopicNavigation(entries, locale = 'en') {
  if (!['en', 'de'].includes(locale) || !entries.length || new Set(entries.map(item => item.topic)).size !== entries.length) throw new Error('Invalid visual topic navigation');
  const german = locale === 'de';
  const title = german ? 'Wähle deine nächste Frage' : 'Choose a topic at a glance';
  const intro = german ? 'Jedes Bild führt zu einem vollständigen deutschen Leitfaden.' : 'Pick a topic to see the practical questions, worked examples and tools in that reading list.';
  const disclosure = german ? 'KI-generierte redaktionelle Illustrationen; keine App-Screenshots oder Kundendokumentation.' : 'AI-generated editorial illustrations; not app screenshots or customer records.';
  return `<section class="page-visual-topics" aria-labelledby="visual-topics-title"><h2 id="visual-topics-title">${title}</h2><p>${intro}</p><nav class="page-topic-grid${entries.length === 3 ? ' page-topic-grid-three' : ''}" aria-label="${german ? 'Deutsche Themenleitfäden' : 'Visual guide topics'}">${entries.map(item => `<a class="page-topic-card" href="${e(item.href)}">${picture(item.visual, entries.length === 3 ? threeCardSizes : cardSizes)}<span>${e(item.label)} <span aria-hidden="true">→</span></span></a>`).join('')}</nav><p class="page-visual-disclosure">${disclosure}</p></section>`;
}
