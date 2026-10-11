import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, site } from '../content/apps.mjs';
import { guides } from '../content/index.mjs';
import { germanGuides } from '../content/de-index.mjs';
import { germanProducts } from '../content/de-products.mjs';
import { languagePairs, languageAlternates, languageSwitcher } from '../content/localization.mjs';
import { appPreviews } from '../content/app-previews.mjs';
import { canonicalStoreUrl, pageCampaign } from '../content/store-attribution.mjs';
import { noSpendDiary } from '../content/savings-no-spend.mjs';
import { shiftHabitWeek, shiftHabitRule } from '../content/habits-shifts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, '.' + path, 'index.html'), 'utf8');
const nodes = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value.replaceAll('&amp;', '&')]));
const anchors = html => [...html.matchAll(/<a\b[^>]*>/g)].map(match => attrs(match[0]));
const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const expectedPaths = ['/de/guides/', ...germanGuides.map(guide => `/de/guides/${guide.slug}/`), ...Object.values(germanProducts).map(app => app.path)];
assert.equal(germanGuides.length, 3);
assert.equal(guides.length, 62, 'Translations do not inflate the original English catalogue');
assert.equal(languagePairs.length, 5);
assert.equal(new Set(languagePairs.flatMap(pair => Object.values(pair))).size, 10);
assert.equal(languageAlternates('/de/guides/'), '', 'A subset is not an alternate of the full English catalogue');
assert.equal(languageAlternates('/unknown/'), '');
assert.equal(languageSwitcher('/unknown/'), '');
const metadataTitles = new Set();
for (const path of expectedPaths) {
  const html = read(path);
  assert(html.includes('<html lang="de">'), path);
  assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, path);
  assert(html.includes(`<link rel="canonical" href="${site}${path}">`), path);
  assert.equal(urls.filter(url => url === site + path).length, 1, path);
  assert(!html.includes('noindex'), path);
  assert(!/undefined|Skip to content|Common questions|The useful takeaway|Free to download/.test(html), path);
  assert(html.includes('Zum Inhalt springen') && html.includes('Hauptnavigation') && html.includes('Datenschutz (Englisch)'), path);
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  assert(!metadataTitles.has(title), path);
  metadataTitles.add(title);
  assert(html.includes('content="de_DE"'), path);
  assert(nodes(html).every(node => ['BreadcrumbList', 'SoftwareApplication'].includes(node['@type']) || node.inLanguage === 'de'), path);
  for (const link of anchors(html)) {
    if (!link.href?.startsWith('https://play.google.com/store/apps/details')) continue;
    const url = new URL(link.href);
    assert.equal(url.searchParams.get('utm_campaign'), pageCampaign(path));
    assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
    assert.equal(url.searchParams.get('utm_medium'), 'referral');
    assert(url.searchParams.get('utm_content'));
  }
  for (const match of html.matchAll(/\b(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const path = match[1];
    assert(existsSync(resolve(root, '.' + path)) || existsSync(resolve(root, '.' + path, 'index.html')), path);
  }
}
for (const pair of languagePairs) {
  for (const [locale, path] of Object.entries(pair)) {
    const html = read(path);
    assert(html.includes(`<html lang="${locale}">`), path);
    assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 3, path);
    assert(html.includes(languageAlternates(path)), path);
    assert(html.includes(languageSwitcher(path)), path);
    assert(html.includes(`<link rel="canonical" href="${site}${path}">`), path);
    assert(html.includes(`href="${pair[locale === 'de' ? 'en' : 'de']}" lang="${locale === 'de' ? 'en' : 'de'}"`), path);
  }
}
for (const translation of germanGuides) {
  const original = guides.find(guide => guide.slug === translation.originalSlug);
  const path = `/de/guides/${translation.slug}/`;
  const html = read(path);
  assert.equal(translation.topic, original.topic);
  assert.equal(translation.sections.length, original.sections.length);
  assert.equal(translation.faq.length, original.faq.length);
  assert.deepEqual(translation.sources, original.sources);
  assert.equal(translation.published, '2026-10-11');
  const article = nodes(html).find(node => node['@type'] === 'Article');
  assert.equal(article.headline, translation.title);
  assert.equal(article.description, translation.description);
  assert.equal(article.url, site + path);
  assert.equal(article.inLanguage, 'de');
  assert.equal(article.datePublished, translation.published);
  assert.equal(article.dateModified, translation.modified || translation.published);
  assert.equal(article.translationOfWork.url, `${site}/guides/${original.slug}/`);
  assert(html.includes(`<h1>${translation.title}</h1>`));
  assert.equal((html.match(/<section id="step-/g) || []).length, translation.sections.length);
  assert.equal((html.match(/<summary>/g) || []).length, translation.faq.length + 1);
  const related = html.match(/<section class="guide-related" aria-label="Passende nächste Schritte">([\s\S]*?)<\/section>/)[1];
  assert.equal((related.match(/class="guide-card"/g) || []).length, 3);
  const header = html.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1];
  if (apps[translation.topic]) {
    const app = apps[translation.topic];
    const stores = anchors(header).filter(link => link['data-placement'] === 'header');
    assert.deepEqual(stores.map(link => canonicalStoreUrl(link.href)).sort(), [app.apple, app.google].sort());
    assert(html.includes(`src="${appPreviews[translation.topic].image}"`));
    assert(html.includes('Premium') && html.includes('englische Oberfläche'));
    assert(html.includes(`href="${germanProducts[translation.topic].path}"`));
  } else {
    assert(!html.includes('class="install-link') && !html.includes('class="app-install"'));
    assert(html.includes('Flutter-Service ansehen (Englisch)'));
  }
  const englishArticle = nodes(read(`/guides/${original.slug}/`)).find(node => node['@type'] === 'Article');
  assert.equal(englishArticle.datePublished, original.published, 'Original date preserved');
  assert.equal(englishArticle.dateModified, original.modified || original.published, 'Adding a selector is not a substantive revision');
}
for (const [topic, product] of Object.entries(germanProducts)) {
  const html = read(product.path);
  const app = nodes(html).find(node => node['@type'] === 'SoftwareApplication');
  assert.equal(app.name, apps[topic].name);
  assert.equal(app.downloadUrl, apps[topic].apple);
  assert.deepEqual(app.sameAs, [apps[topic].apple, apps[topic].google]);
  assert.equal(app.inLanguage, undefined, 'Translated page does not imply German app UI');
  assert.equal(nodes(html).find(node => node['@type'] === 'WebPage').inLanguage, 'de');
  assert(html.includes('Häufige Fragen') && html.includes('Premium') && html.includes('englische Oberfläche'));
}
assert.equal(noSpendDiary.reduce((sum, day) => sum + day.reduced, 0), 31);
assert.equal(noSpendDiary.reduce((sum, day) => sum + day.reserved, 0), 27);
const savingHtml = read('/de/guides/7-tage-no-spend-challenge/');
for (const amount of ['31 €', '27 €', '<strong>22 €</strong>', '<strong>18 €</strong>']) assert(savingHtml.includes(amount));
const planned = shiftHabitWeek.filter(day => day.planned);
assert.equal(planned.length, 5);
assert.equal(planned.filter(day => day.pagesRead >= shiftHabitRule.pagesForCompletion).length, 4);
const habitHtml = read('/de/guides/habit-tracker-schichtarbeit/');
assert(habitHtml.includes('80 %') && habitHtml.includes('57 %') && habitHtml.includes('01:00'));
assert(read('/guides/').includes('href="/de/guides/"'));
console.log('German pilot passed: three complete translations, two real product destinations, six sitemap routes, reciprocal language links, self-canonicals, exact examples and unchanged English dates/catalogue.');
