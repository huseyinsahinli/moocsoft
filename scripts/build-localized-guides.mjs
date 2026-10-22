import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { apps, site, sources, escape as e } from '../content/apps.mjs';
import { appPreviews } from '../content/app-previews.mjs';
import { editorialPhotosDe } from '../content/editorial-media.mjs';
import { pageVisualUpdated, germanVisualTopics, visualTopicNavigation } from '../content/page-visuals.mjs';
import { guides } from '../content/index.mjs';
import { germanGuides } from '../content/de-index.mjs';
import { germanProducts, germanSourceNames } from '../content/de-products.mjs';
import { languagePairs } from '../content/localization.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
import { guideHref } from '../content/topics.mjs';
import { head, storeLinks } from '../content/components.mjs';
import { attributeStoreLinks } from '../content/store-attribution.mjs';

const selectRelated = createRelatedGuideSelector(guides);
const byline = { '@type': 'Organization', name: 'Moocsoft', url: site + '/#about' };
const guidePath = guide => `/de/guides/${guide.slug}/`;
const category = topic => germanProducts[topic]?.category || 'Mobile App-Entwicklung';
const germanDate = date => new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date + 'T00:00:00Z'));
const appFor = topic => ({ ...apps[topic], ...germanProducts[topic] });
// The same article column as the English edition; German descriptions remain local.
const imageSizes = '(max-width: 600px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 40px), (max-width: 1054px) calc(100vw - 294px), 760px';
const visualFigure = visual => `<figure class="guide-visual"><picture><source type="image/webp" srcset="${visual.webp.map(image => `${image.src} ${image.width}w`).join(', ')}" sizes="${imageSizes}"><img data-visual-kind="${visual.kind}" src="${visual.src}" width="${visual.width}" height="${visual.height}" loading="lazy" decoding="async" alt="${e(visual.alt)}"></picture><figcaption>${e(visual.caption)}</figcaption></figure>`;

function stores(app, placement = 'header') {
  return storeLinks(app, placement).replaceAll(`Download ${e(app.name)} on the App Store`, `${e(app.name)} im App Store herunterladen`).replaceAll(`Download ${e(app.name)} on Google Play`, `${e(app.name)} bei Google Play herunterladen`);
}
function header(app) {
  return `<a class="skip-link" href="#main-content">Zum Inhalt springen</a>
<header class="site-header"><div class="site-header-top"><a class="site-wordmark" href="/de/guides/">moocsoft</a><div class="site-menu" role="navigation" aria-label="Hauptnavigation"><a href="/de/frugal/">Frugal</a><a href="/de/habit-tracker/">Habit Tracker</a><a href="/de/guides/">Leitfäden</a><a href="/hire-flutter-developer/" hreflang="en">Flutter-Service (Englisch)</a></div></div>${app ? `<div class="app-install" data-nosnippet aria-label="${e(app.name)} herunterladen"><img src="${app.icon}" width="42" height="42" alt=""><div class="app-install-copy"><a href="${app.path}">${e(app.name)}</a><span>${e(app.promise)}</span></div>${stores(app)}</div>` : ''}</header>`;
}
function footer() {
  return `<footer class="guide-foot"><div class="guide-shell"><a class="site-wordmark" href="/de/guides/">moocsoft</a><div class="guide-foot-links"><a href="/de/guides/">Deutsche Leitfäden</a><a href="/guides/" hreflang="en">Alle Leitfäden (Englisch)</a><a href="/hire-flutter-developer/" hreflang="en">Flutter-Service (Englisch)</a><a href="/privacy-policy/" hreflang="en">Datenschutz (Englisch)</a><a href="/contact/" hreflang="en">Kontakt (Englisch)</a></div><span>© 2026 Huseyin Sahinli</span></div></footer>`;
}
function crumbs(items) {
  return { '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: site + path })) };
}
const crumbHtml = label => `<div class="guide-breadcrumb" aria-label="Brotkrumennavigation"><a href="/de/guides/">Deutsche Leitfäden</a><span aria-hidden="true">/</span><span aria-current="page">${e(label)}</span></div>`;
function download(app, placement = 'article-end') {
  return `<section class="guide-download" data-nosnippet style="--guide-accent:${app.color}" aria-label="${e(app.name)} herunterladen"><div><span class="guide-kicker">Der nächste Schritt</span><h2>${e(app.name)} herunterladen</h2><p>${e(app.promise)}</p><small>Kostenloser Download · iPhone, iPad und Android · Optionale In-App-Käufe</small></div>${stores(app, placement)}</section>`;
}
function service() {
  return `<section class="guide-download" data-nosnippet aria-label="Flutter-Projekt besprechen"><div><span class="guide-kicker">Vom Leitfaden zur Projektfrage</span><h2>Eine mobile App entwickeln lassen?</h2><p>Moocsoft bietet mobile App-Entwicklung mit Flutter an. Nutzen Sie die Checkliste, um Lieferumfang und Wartung in einem Projektgespräch zu klären.</p></div><div class="guide-hero-actions"><a href="/hire-flutter-developer/" hreflang="en">Flutter-Service ansehen (Englisch) →</a></div></section>`;
}
function preview(topic, contextual = {}) {
  const app = appFor(topic);
  const visual = appPreviews[topic];
  return `<section class="guide-app-preview has-image" data-nosnippet aria-labelledby="app-preview-title"><div class="guide-preview-intro"><span class="guide-kicker">Vom Leitfaden zum Smartphone</span><h2 id="app-preview-title">${e(contextual.heading || app.previewHeading)}</h2><p>${e(contextual.description || app.previewDescription)}</p></div><ol class="guide-preview-steps">${app.steps.map(step => `<li>${e(step)}</li>`).join('')}</ol><div class="guide-preview-actions">${stores(app, 'guide-preview')}<p class="guide-preview-note">${e(app.note)}</p><p class="guide-preview-note">${e(app.languageNote)}</p><a class="guide-preview-details" href="${app.path}">${e(app.name)} kennenlernen →</a></div><figure><a href="${app.path}" aria-label="Mehr über ${e(app.name)}"><img src="${visual.image}" width="${visual.width}" height="${visual.height}" loading="lazy" decoding="async" alt="${e(app.alt)}"></a><figcaption>${e(app.caption)}</figcaption></figure></section>`;
}
const faqMarkup = faq => `<section class="guide-faq" id="questions"><h2>Häufige Fragen</h2>${faq.map(([question, answer]) => `<details><summary>${e(question)}</summary><p>${e(answer)}</p></details>`).join('')}</section>`;
function card(guide, path, english = false) {
  const color = apps[guide.topic]?.color || '#ff9878';
  return `<a class="guide-card" style="--guide-accent:${color}" href="${e(path)}"${english ? ' hreflang="en"' : ''}><span class="guide-kicker">${e(category(guide.topic))}${english ? ' · Englisch' : ''}</span><h3${english ? ' lang="en"' : ''}>${e(guide.title)}</h3><p${english ? ' lang="en"' : ''}>${e(guide.description)}</p><span>${english ? 'Auf Englisch lesen' : 'Leitfaden lesen'} →</span></a>`;
}

export function buildLocalizedGuides(root) {
  const outputs = [];
  function write(path, html, images = [], lastmod = '2026-10-11') {
    const translation = germanGuides.find(guide => guidePath(guide) === path);
    lastmod = translation?.modified || translation?.published || lastmod;
    const target = resolve(root, '.' + path, 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, attributeStoreLinks(html, path).replace(/[ \t]+$/gm, '').trimEnd() + '\n');
    outputs.push({ path, lastmod, images });
  }
  const originals = new Map(guides.map(guide => [guide.slug, guide]));
  const seen = new Set();
  for (const guide of germanGuides) {
    const original = originals.get(guide.originalSlug);
    const path = guidePath(guide);
    if (!original || guide.topic !== original.topic || guide.locale !== 'de' || seen.has(guide.slug)
        || !/^[a-z0-9-]+$/.test(guide.slug) || guide.sections.length !== original.sections.length
        || guide.faq.length !== original.faq.length || !languagePairs.some(pair => pair.de === path && pair.en === `/guides/${original.slug}/`)) throw new Error(`Invalid German translation: ${guide.slug}`);
    seen.add(guide.slug);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(guide.published) || new Date(guide.published).toISOString().slice(0, 10) !== guide.published) throw new Error('Invalid translation date');
    const app = germanProducts[guide.topic] ? appFor(guide.topic) : null;
    if (guide.appPreview && !app) throw new Error('Service translation must not have an app preview');
    const visual = editorialPhotosDe[guide.topic];
    if (!visual || visual.kind !== 'photo') throw new Error(`Missing German editorial photo: ${guide.slug}`);
    const graph = [
      { '@type': 'Article', '@id': site + path + '#article', headline: guide.title, description: guide.description, inLanguage: 'de', mainEntityOfPage: site + path, url: site + path, datePublished: guide.published, dateModified: guide.modified || guide.published, author: byline, publisher: byline, image: [site + visual.src], articleSection: category(guide.topic), isAccessibleForFree: true, translationOfWork: { '@type': 'Article', url: `${site}/guides/${original.slug}/`, inLanguage: 'en' } },
      crumbs([['Deutsche Leitfäden', '/de/guides/'], [guide.title, path]]),
    ];
    const words = [guide.intro, guide.takeaway, ...guide.sections.map(([title, body]) => title + ' ' + body.replace(/<[^>]*>/g, ' '))].join(' ').split(/\s+/).length;
    const next = selectRelated(original).map(item => {
      const translation = germanGuides.find(local => local.originalSlug === item.slug);
      return translation ? card(translation, guidePath(translation)) : card(item, guideHref(item), true);
    }).join('');
    const refs = guide.sources.map(key => {
      if (!sources[key] || !germanSourceNames[key]) throw new Error(`Missing German source label: ${key}`);
      return `<li><a href="${e(sources[key][1])}" target="_blank" rel="noopener">${e(germanSourceNames[key])}</a></li>`;
    }).join('');
    write(path, `${head(guide.title, guide.description, path, graph, app, [], visual, { locale: 'de', header: header(app) })}
<main id="main-content" class="guide-shell">${crumbHtml(category(guide.topic))}<div class="guide-hero"><span class="guide-kicker">${e(category(guide.topic))} · Praktischer Leitfaden</span><h1>${e(guide.title)}</h1><p>${e(guide.intro)}</p><div class="guide-byline"><a href="/#about" hreflang="en">Von Moocsoft</a><time datetime="${guide.published}">${germanDate(guide.published)}</time><span>${Math.max(2, Math.ceil(words / 200))} Minuten Lesezeit</span></div><div class="guide-hero-actions">${app ? `<a href="${app.path}">${e(app.name)} kennenlernen →</a><a href="#app-preview-title">Echtes App-Beispiel ansehen ↓</a>` : '<a href="/hire-flutter-developer/" hreflang="en">Flutter-Service (Englisch) →</a>'}</div></div>
<div class="guide-layout"><aside class="guide-toc" aria-label="Auf dieser Seite"><details class="guide-toc-menu"><summary>Zu einem Abschnitt springen</summary><nav aria-label="Artikelabschnitte"><ol>${guide.sections.map(([title], i) => `<li><a href="#step-${i + 1}">${e(title)}</a></li>`).join('')}<li><a href="#questions">Häufige Fragen</a></li>${app ? '<li><a href="#app-preview-title">App-Beispiel und Hinweise</a></li>' : ''}</ol></nav></details>${app ? stores(app, 'sidebar') : ''}</aside><article class="guide-article" aria-label="${e(guide.title)}"><div class="guide-answer"><span>Das Wichtigste zuerst</span><p>${e(guide.takeaway)}</p></div>${guide.sections.map(([title, body], i) => `<section id="step-${i + 1}"><h2>${e(title)}</h2>${body}</section>${i === 0 ? '\n' + visualFigure(visual) : ''}`).join('\n')}${faqMarkup(guide.faq)}<section class="guide-references" id="references"><h2>Quellen und weiterführende Informationen</h2><ul>${refs}</ul></section><p class="guide-editor-note">${app ? `Veröffentlicht von Moocsoft, dem unabhängigen Studio hinter ${e(app.name)}. Beispiele und Vorlagen dienen der Erklärung. Funktionen und In-App-Käufe können je nach Plattform und Version abweichen. ${e(app.languageNote)}` : 'Veröffentlicht von Moocsoft, einem unabhängigen Flutter-Entwicklungsstudio. Beispiele und Vorlagen dienen der Erklärung. Projektumfang, Plattformanforderungen und Release-Verantwortung müssen für jedes Projekt vereinbart werden.'}</p></article></div>
${app ? preview(guide.topic, guide.previewCopy) + download(app) : service()}
<section class="guide-related" aria-label="Passende nächste Schritte"><span class="guide-kicker">Weiterlesen zum selben Thema</span><h2>Der nächste passende Schritt</h2><p class="guide-topic-intro">Noch nicht übersetzte Ziele sind als Englisch gekennzeichnet.</p><div class="guide-card-grid">${next}</div><div class="guide-hero-actions"><a href="/de/guides/">Alle deutschen Leitfäden →</a></div></section></main>${footer()}</body></html>`, [site + visual.src, ...(app ? [site + appPreviews[guide.topic].image] : [])]);
  }
  const hubTitle = 'Praktische Leitfäden: Sparziele, Gewohnheiten und App-Entwicklung';
  const hubDescription = 'Drei deutsche Leitfäden mit Vorlagen: eine No-Spend-Woche planen, Gewohnheiten bei Schichtarbeit dokumentieren und eine mobile App sicher übernehmen.';
  const visualTopics = germanVisualTopics(germanGuides);
  const hubImages = visualTopics.map(item => site + item.visual.src);
  write('/de/guides/', `${head(hubTitle, hubDescription, '/de/guides/', [{ '@type': 'CollectionPage', name: hubTitle, inLanguage: 'de', url: site + '/de/guides/', image: hubImages, mainEntity: { '@type': 'ItemList', itemListElement: germanGuides.map((guide, i) => ({ '@type': 'ListItem', position: i + 1, name: guide.title, url: site + guidePath(guide) })) } }], undefined, [], undefined, { locale: 'de', header: header(), stylesheets: ['page-visuals'] })}<main id="main-content" class="guide-shell"><div class="guide-hero"><span class="guide-kicker">${germanGuides.length} deutsche Leitfäden · Konkrete nächste Schritte</span><h1>Klare Fragen.<br>Brauchbare Antworten.</h1><p>Mit nachvollziehbaren Beispielen und Vorlagen: Geld bewusst zurücklegen, eine Routine an wechselnde Schichten anpassen oder eine App-Übergabe prüfen. Diese Auswahl ergänzt unsere englischen Leitfäden; die gesamte Website ist noch nicht übersetzt.</p><div class="guide-hero-actions"><a href="/guides/" hreflang="en">Gesamte Leseliste (Englisch) →</a></div></div>${visualTopicNavigation(visualTopics, 'de')}<section class="guide-related"><h2>Womit möchtest du anfangen?</h2><div class="guide-card-grid">${germanGuides.map(guide => card(guide, guidePath(guide))).join('')}</div></section><section class="guide-related"><h2>Vom Beispiel zur passenden App</h2><p>Frugal dokumentiert Sparziele; Habit Tracker Daily hält Gewohnheiten fest. Prüfe jeweils App-Sprache und Funktionsgrenzen.</p><div class="guide-hero-actions"><a href="/de/frugal/">Frugal kennenlernen →</a><a href="/de/habit-tracker/">Habit Tracker kennenlernen →</a></div></section></main>${footer()}</body></html>`, hubImages, pageVisualUpdated);
  for (const topic of Object.keys(germanProducts)) {
    const app = appFor(topic);
    // Page language is not proof of the software's supported UI languages.
    const graph = [{ '@type': 'WebPage', '@id': site + app.path + '#page', name: app.title, description: app.description, inLanguage: 'de', url: site + app.path, mainEntity: { '@id': site + app.path + '#app' } }, { '@type': 'SoftwareApplication', '@id': site + app.path + '#app', name: app.name, applicationCategory: app.schemaCategory, operatingSystem: app.operatingSystem, description: app.intro, url: site + app.path, downloadUrl: app.apple, sameAs: [app.apple, app.google], image: site + app.icon, author: byline }, crumbs([['Deutsche Leitfäden', '/de/guides/'], [app.name, app.path]])];
    const related = germanGuides.filter(guide => guide.topic === topic);
    write(app.path, `${head(app.title, app.description, app.path, graph, app, [], undefined, { locale: 'de', header: header(app) })}<main id="main-content" class="guide-shell">${crumbHtml(app.name)}<div class="guide-hero"><span class="guide-kicker">${e(app.category)} · Moocsoft-App</span><h1>${e(app.title)}</h1><p>${e(app.intro)}</p><p class="guide-topic-intro">${e(app.languageNote)}</p><div class="guide-hero-actions"><a href="#app-preview-title">Offizielles App-Bild ansehen ↓</a></div></div><article class="guide-article">${app.sections.map(([title, body]) => `<section><h2>${e(title)}</h2>${body}</section>`).join('')}${faqMarkup(app.faq)}<section class="guide-references"><h2>Aktuelle Angaben in den Stores</h2><p>Funktionen, Sprachangaben und In-App-Käufe im jeweiligen Store prüfen.</p>${stores(app, 'store-reference')}</section></article>${preview(topic)}${download(app, 'product-end')}<section class="guide-related"><h2>Ein praktischer Anfang</h2><div class="guide-card-grid">${related.map(guide => card(guide, guidePath(guide))).join('')}</div></section></main>${footer()}</body></html>`, [site + appPreviews[topic].image]);
  }
  return outputs;
}
