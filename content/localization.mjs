import { site, escape as e } from './apps.mjs';

// Only genuine equivalents belong here. The small German reading hub is a
// curated subset, not a full translation of the English guide catalogue.
export const languagePairs = [
  { en: '/guides/7-day-no-spend-challenge/', de: '/de/guides/7-tage-no-spend-challenge/' },
  { en: '/guides/habit-tracker-for-shift-work/', de: '/de/guides/habit-tracker-schichtarbeit/' },
  { en: '/guides/mobile-app-handover-checklist/', de: '/de/guides/mobile-app-uebergabe-checkliste/' },
  { en: '/savings-goal-tracker/', de: '/de/frugal/' },
  { en: '/habit-tracker/', de: '/de/habit-tracker/' },
];

export function languageAlternates(path) {
  const pair = languagePairs.find(item => Object.values(item).includes(path));
  if (!pair) return '';
  return ['en', 'de'].map(lang => `<link rel="alternate" hreflang="${lang}" href="${site}${pair[lang]}">`).join('\n  ')
    + `\n  <link rel="alternate" hreflang="x-default" href="${site}${pair.en}">`;
}

export function languageSwitcher(path) {
  const pair = languagePairs.find(item => Object.values(item).includes(path));
  if (!pair) return '';
  const current = path === pair.de ? 'de' : 'en';
  return `<!-- Language switcher --><nav class="guide-shell guide-language-switcher" aria-label="${current === 'de' ? 'Sprache wählen' : 'Choose language'}">${Object.entries(pair).map(([lang, href]) => lang === current ? `<span lang="${lang}" aria-current="page">${lang === 'de' ? 'Deutsch' : 'English'}</span>` : `<a href="${e(href)}" lang="${lang}" hreflang="${lang}">${lang === 'de' ? 'Deutsch' : 'English'}</a>`).join('<span aria-hidden="true"> · </span>')}</nav><!-- End language switcher -->`;
}
