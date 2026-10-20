import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, relative, sep } from 'node:path';
import { apps, site, published, sources, escape as e } from '../content/apps.mjs';
import { guides } from '../content/index.mjs';
import { guideTopics } from '../content/topics.mjs';
import { head, header, footer, card, download, resultDownload, appPreview, choices, storeDirectory, storeLinks, resources, faviconLinks, serviceNextStep } from '../content/components.mjs';
import { attributeStoreLinks } from '../content/store-attribution.mjs';
import { guideMedia } from '../content/guide-media.mjs';
import { guideCharts } from '../content/guide-charts.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { appPreviews } from '../content/app-previews.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
import { languageAlternates, languageSwitcher } from '../content/localization.mjs';
import { buildLocalizedGuides } from './build-localized-guides.mjs';
import { formatFor, editorialFormats, selectHomePicks, selectReaderJourneys } from '../content/discovery.mjs';
import { browserTools } from '../content/tools.mjs';
import './build-math-challenge.mjs';
import './build-savings-goal-tool.mjs';
import './build-app-brief-tool.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputs = [];
const selectRelatedGuides = createRelatedGuideSelector(guides);
const modified = guide => guide.modified || guide.published || published;
const latest = list => list.map(modified).sort().at(-1) || published;
const toolCount = browserTools.length;
const toolAction = (app, verb = 'Open') => app?.tool ? `<a href="/tools/${app.tool}/">${verb} the free ${e(app.toolName.toLowerCase())} →</a>` : '';
const topicAction = (topic, app) => app ? `<a href="/${app.slug}/">Explore ${e(app.name)} →</a>` : `<a href="${e(topic.actionPath)}">${e(topic.actionLabel)}</a>`;
const displayDate = value => new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
for (const guide of guides) {
  formatFor(guide);
  for (const value of [guide.published || published, modified(guide)]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`Invalid date for ${guide.slug}`);
  }
  if (modified(guide) < (guide.published || published)) throw new Error(`Modification precedes publication: ${guide.slug}`);
}
const byline = { '@type': 'Organization', name: 'Moocsoft', url: `${site}/#about` };
const breadcrumbs = items => ({ '@type':'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({'@type':'ListItem',position:i+1,name,item:site+path})) });
const crumbHtml = items => `<div class="guide-breadcrumb" aria-label="Breadcrumb">${items.map(([name,path]) => path ? `<a href="${path}">${e(name)}</a>` : `<span aria-current="page">${e(name)}</span>`).join('<span aria-hidden="true">/</span>')}</div>`;
const items = list => ({ '@type': 'ItemList', itemListElement: list.map((g,i) => ({'@type':'ListItem',position:i+1,name:g.title,url:`${site}/guides/${g.slug}/`})) });
function write(path, html, lastmod = published, images = []) {
  const target = resolve(root, '.' + path, 'index.html');
  mkdirSync(dirname(target), {recursive:true});
  writeFileSync(target, attributeStoreLinks(html, path).replace(/[ \t]+$/gm, '').trimEnd() + '\n');
  outputs.push({path, lastmod, images});
}
const slugs = new Set();
const guidesBySlug = new Map(guides.map(guide => [guide.slug, guide]));
function rasterSize(src) {
  const data = readFileSync(resolve(root, '.' + src));
  if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return [data.readUInt32BE(16), data.readUInt32BE(20)];
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') {
    const format = data.toString('ascii', 12, 16);
    if (format === 'VP8X') return [1 + data.readUIntLE(24, 3), 1 + data.readUIntLE(27, 3)];
    if (format === 'VP8 ') return [data.readUInt16LE(26) & 0x3fff, data.readUInt16LE(28) & 0x3fff];
    if (format === 'VP8L') {
      const packed = data.readUInt32LE(21);
      return [(packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1];
    }
  }
  if (data[0] === 0xff && data[1] === 0xd8) {
    for (let offset = 2; offset + 9 < data.length;) {
      if (data[offset] !== 0xff) break;
      while (data[offset] === 0xff) offset++;
      const marker = data[offset++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const length = data.readUInt16BE(offset);
      if (length < 2 || offset + length > data.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return [data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3)];
      offset += length;
    }
  }
  throw new Error(`Unsupported or invalid raster: ${src}`);
}
function validateVisual(visual, label) {
  if (visual.width !== 1200 || visual.height !== 675 || !visual.alt || !visual.caption || !Array.isArray(visual.webp)
      || visual.webp.length !== 3) throw new Error(`Invalid visual metadata: ${label}`);
  for (const image of [visual, ...visual.webp]) {
    if (!/^\/assets\/[a-z0-9/-]+\.(?:png|jpg|webp)$/.test(image.src)) throw new Error(`Invalid visual asset path: ${label}`);
    const [width, height] = rasterSize(image.src);
    if (width !== image.width || height !== image.height) throw new Error(`Visual file dimensions differ from metadata: ${image.src}`);
  }
  if (visual.webp.some((image, index) => image.width !== [480, 800, 1200][index]
      || image.height !== image.width * 9 / 16 || image.src !== visual.src.replace(/\.(?:png|jpg)$/, `-${image.width}.webp`))) throw new Error(`Invalid responsive visual: ${label}`);
}
for (const [slug, visual] of Object.entries(guideMedia)) {
  if (!guidesBySlug.has(slug) || !/^\/assets\/guide-visuals\/[a-z0-9-]+\.png$/.test(visual.src)
      || visual.width !== 1200 || visual.height !== 675 || !visual.alt || !visual.caption) {
    throw new Error(`Invalid guide media: ${slug}`);
  }
  if (visual.webp.length !== 3 || visual.webp.some((image, index) => image.width !== [480, 800, 1200][index]
      || image.height !== image.width * 9 / 16 || image.src !== visual.src.replace(/\.png$/, `-${image.width}.webp`))) {
    throw new Error(`Invalid responsive guide media: ${slug}`);
  }
  validateVisual(visual, slug);
}
for (const [slug, visual] of Object.entries(guideCharts)) {
  const guide = guidesBySlug.get(slug);
  if (!guide || guideMedia[slug] || visual.kind !== 'chart' || visual.src !== `/assets/guide-charts/${slug}.png` || !Number.isInteger(visual.afterSection)
      || visual.afterSection < 1 || visual.afterSection > guide.sections.length) throw new Error(`Invalid guide chart or placement: ${slug}`);
  validateVisual(visual, slug);
}
for (const [topic, visual] of Object.entries(editorialPhotos)) {
  if (!guideTopics[topic] || visual.kind !== 'photo' || visual.src !== `/assets/editorial/${topic}.jpg`) throw new Error(`Invalid editorial photo: ${topic}`);
  validateVisual(visual, topic);
}
// Match the article column in assets/content.css, including the two mobile margins.
const imageSizes = '(max-width: 600px) calc(100vw - 32px), (max-width: 900px) calc(100vw - 40px), (max-width: 1054px) calc(100vw - 294px), 760px';
const visualFigure = visual => {
  const picture = `<picture><source type="image/webp" srcset="${visual.webp.map(image => `${image.src} ${image.width}w`).join(', ')}" sizes="${imageSizes}"><img data-visual-kind="${visual.kind || 'diagram'}" src="${visual.src}" width="${visual.width}" height="${visual.height}" loading="lazy" decoding="async" alt="${e(visual.alt)}"></picture>`;
  const chart = visual.kind === 'chart';
  return `<figure class="guide-visual">${chart ? `<a class="guide-visual-enlarge" href="${visual.src}" target="_blank" rel="noopener" aria-label="Open full-size explanatory chart">${picture}</a>` : picture}<figcaption>${e(visual.caption)}</figcaption></figure>${chart ? `<p class="guide-visual-open"><a href="${visual.src}" target="_blank" rel="noopener">Open full-size chart ↗</a></p>` : ''}`;
};
for (const guide of guides) {
  if (!guideTopics[guide.topic] || slugs.has(guide.slug) || !/^[a-z0-9-]+$/.test(guide.slug)) throw new Error(`Invalid guide: ${guide.slug}`);
  slugs.add(guide.slug);
  const app = apps[guide.topic];
  const topic = guideTopics[guide.topic];
  if (guide.appPreview && !app) throw new Error(`App preview requires an app topic: ${guide.slug}`);
  const path = `/guides/${guide.slug}/`;
  const visual = guideMedia[guide.slug] ?? guideCharts[guide.slug] ?? editorialPhotos[guide.topic];
  if (!visual) throw new Error(`Missing representative visual: ${guide.slug}`);
  if (guide.mediaAfterSection !== undefined && (!guideMedia[guide.slug] || !Number.isInteger(guide.mediaAfterSection) || guide.mediaAfterSection < 1 || guide.mediaAfterSection > guide.sections.length)) {
    throw new Error(`Invalid media section placement: ${guide.slug}`);
  }
  const mediaAfterSection = guideMedia[guide.slug] ? guide.mediaAfterSection : guideCharts[guide.slug] ? visual.afterSection : 1;
  const previewImage = guide.appPreview ? appPreviews[guide.topic]?.image : null;
  const images = [...new Set([visual?.src, previewImage].filter(Boolean))].map(src => site + src);
  const words = [guide.intro,guide.takeaway,...guide.sections.map(([title,html]) => title+' '+html.replace(/<[^>]*>/g,' '))].join(' ').split(/\s+/).filter(Boolean).length;
  const graph = [
    {'@type':'Article','@id':site+path+'#article',headline:guide.title,description:guide.description,inLanguage:'en',mainEntityOfPage:site+path,url:site+path,datePublished:guide.published || published,dateModified:modified(guide),author:byline,publisher:byline,image:[site+(visual?.src || '/assets/social/moocsoft-og.png')],articleSection:topic.category,isAccessibleForFree:true},
    breadcrumbs([['Home','/'],['Guides','/guides/'],[topic.category,`/guides/${guide.topic}/`],[guide.title,path]]),
  ];
  const faq = `<section class="guide-faq" id="questions"><h2>Common questions</h2>${guide.faq.map(([q,a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</section>`;
  const refs = guide.sources.length ? `<section class="guide-references" id="references"><h2>References and further reading</h2><ul>${guide.sources.map(key => {if(!sources[key])throw new Error('Unknown source '+key);const [name,url]=sources[key];return `<li><a href="${e(url)}" target="_blank" rel="noopener">${e(name)}</a></li>`;}).join('')}</ul></section>` : '';
  write(path, `${head(guide.title, guide.description, path, graph, app, guide.assets, visual)}
<main id="main-content" class="guide-shell">
  ${crumbHtml([['Home','/'],['Guides','/guides/'],[topic.category,`/guides/${guide.topic}/`]])}
  <div class="guide-hero"><span class="guide-kicker">${e(topic.category)} · ${e(formatFor(guide).label)}</span><h1>${e(guide.title)}</h1><p>${e(guide.intro)}</p><div class="guide-byline"><a href="/#about">By Moocsoft</a><time datetime="${guide.published || published}">${displayDate(guide.published || published)}</time>${modified(guide) !== (guide.published || published) ? `<span>Updated <time datetime="${modified(guide)}">${displayDate(modified(guide))}</time></span>` : ''}<span>${Math.max(2,Math.ceil(words/200))} min read</span></div><div class="guide-hero-actions">${guide.startAction ? `<a href="${e(guide.startAction[0])}">${e(guide.startAction[1])}</a>` : ''}${guide.showToolAction === false ? '' : toolAction(app)}${topicAction(topic, app)}${guide.appPreview ? `<a href="#app-preview-title">${appPreviews[guide.topic].image ? `See ${e(app.name)} in action` : 'See app features and access'} ↓</a>` : ''}</div></div>
  <div class="guide-layout">
    <aside class="guide-toc" aria-label="On this page"><details class="guide-toc-menu"><summary>Jump to a section</summary><nav aria-label="Article sections"><ol>${guide.sections.map(([title],i) => `<li><a href="#step-${i+1}">${e(title)}</a></li>`).join('')}<li><a href="#questions">Common questions</a></li>${guide.appPreview ? `<li><a href="#app-preview-title">See ${e(app.name)} in action</a></li>` : ''}</ol></nav></details>${app ? storeLinks(app, 'sidebar') : ''}</aside>
    <article class="guide-article" aria-label="${e(guide.title)}">
      <div class="guide-answer"><span>The useful takeaway</span><p>${e(guide.takeaway)}</p></div>
      ${!mediaAfterSection ? visualFigure(visual) + '\n      ' : ''}${guide.sections.map(([title,body],i) => `<section id="step-${i+1}"><h2>${e(title)}</h2>${body}</section>${mediaAfterSection === i + 1 ? '\n      ' + visualFigure(visual) : ''}`).join('\n      ')}
      ${faq}${refs}
      <p class="guide-editor-note">${app ? `Published by Moocsoft, the independent studio behind ${e(app.name)}. Examples and worksheets are illustrative. App features can vary by platform and version; see the store listing for current availability and in-app purchases.` : 'Published by Moocsoft, an independent Flutter development studio. Examples and worksheets are illustrative. Project scope, platform requirements and release responsibilities need to be agreed for each project.'}</p>
    </article>
  </div>
  ${guide.appPreview ? appPreview(guide.topic, guide.previewCopy) : ''}
  ${app ? download(app) : serviceNextStep(topic)}
  <section class="guide-related" aria-label="Suggested next reads"><span class="guide-kicker">Your next useful step</span><h2>Keep exploring ${e(topic.category.toLowerCase())}</h2><div class="guide-card-grid">${selectRelatedGuides(guide).map(card).join('')}</div><div class="guide-hero-actions"><a href="/guides/${guide.topic}/">Browse all ${e(topic.category.toLowerCase())} guides →</a></div></section>
</main>
${footer()}
</body>
</html>`, modified(guide), images);
}

for (const [topic, config] of Object.entries(guideTopics)) {
  const app = apps[topic];
  const selected = guides.filter(g => g.topic === topic);
  const path = `/guides/${topic}/`;
  const graph = [{'@type':'CollectionPage',name:config.heading,description:config.description,inLanguage:'en',url:site+path,mainEntity:items(selected)},breadcrumbs([['Home','/'],['Guides','/guides/'],[config.category,path]])];
  write(path, `${head(config.heading,config.description,path,graph,app)}
<main id="main-content" class="guide-shell">
  ${crumbHtml([['Home','/'],['Guides','/guides/'],[config.category,null]])}
  <div class="guide-hero"><span class="guide-kicker">The ${e(config.name)} reading list</span><h1>${e(config.heading)}</h1><p>${e(config.intro)}</p><div class="guide-hero-actions">${toolAction(app, 'Try')}${topicAction(config, app)}</div></div>
  <section class="guide-related"><h2>Choose your starting point</h2><p class="guide-topic-intro">${e(config.choice)}</p><div class="guide-card-grid">${selected.map(card).join('')}</div></section>
  ${app ? `<section class="guide-related"><span class="guide-kicker">From the guide to the app</span><h2>Put it into practice with ${e(app.name)}</h2><p class="guide-topic-intro">${e(app.use)}</p>${download(app, 'topic-end')}</section>` : serviceNextStep(config)}
  <div class="guide-related"><h2>Explore another topic</h2><div class="guide-topic-links">${Object.entries(guideTopics).filter(([key]) => key !== topic).map(([key,a])=>`<a href="/guides/${key}/">${e(a.category)} →</a>`).join('')}</div></div>
</main>
${footer()}
</body>
</html>`, latest(selected));
}

const hubTitle = 'Stories, Puzzles and Practical App Guides';
const hubDescription = 'Find a useful answer: solve an original puzzle, read an illustrative story, compare app ideas or use a practical worksheet for your everyday routine.';
write('/guides/', `${head(hubTitle,hubDescription,'/guides/',[{'@type':'CollectionPage',name:hubTitle,description:hubDescription,inLanguage:'en',url:site+'/guides/',mainEntity:items(guides)},breadcrumbs([['Home','/'],['Guides','/guides/']])], undefined, ['guide-discovery'])}
<main id="main-content" class="guide-shell">
  ${crumbHtml([['Home','/'],['Guides',null]])}
  <div class="guide-hero-actions"><a href="/de/guides/" lang="de" hreflang="de">Deutsche Leitfäden →</a></div>
  <div class="guide-hero"><span class="guide-kicker">${guides.length} guides · ${toolCount} free tools · Different ways to begin</span><h1>Stories, puzzles<br>and useful answers.</h1><p>Try a mystery, follow a fictional everyday story or compare a real product decision. Choose a question you want to answer—not a reading list you need to finish.</p><div class="guide-hero-actions"><a href="#guide-library">Find a guide ↓</a><a href="/tools/">Try a free browser tool →</a></div></div>
  <section class="guide-related" aria-labelledby="start-here"><span class="guide-kicker">Start with one task</span><h2 id="start-here">Three paths into the library</h2><div class="reader-journeys">${selectReaderJourneys(guides).map(journey => `<article class="reader-journey"><h3>${e(journey.title)}</h3><p>${e(journey.description)}</p><ol>${journey.steps.map(step => `<li><a href="${e(step.href)}">${e(step.label)}</a></li>`).join('')}</ol></article>`).join('')}</div></section>
  <section id="guide-library" data-guide-library aria-labelledby="library-title"><h2 id="library-title">Find your next useful read</h2><p>Search stays in your browser. Without JavaScript, every guide is still listed by topic below.</p><form data-guide-filter hidden role="search" aria-label="Find a Moocsoft guide"><label>Search the library<input name="q" type="search" autocomplete="off" placeholder="Try backup, café, meal or Flutter"></label><label>Topic<select name="topic"><option value="">All topics</option>${Object.entries(guideTopics).map(([key,config]) => `<option value="${key}">${e(config.category)}</option>`).join('')}</select></label><label>Format<select name="format"><option value="">All formats</option>${Object.values(editorialFormats).map(format => `<option value="${format.key}">${e(format.label)}</option>`).join('')}</select></label><button type="reset">Clear filters</button></form><p data-guide-result-count role="status" aria-live="polite">All ${guides.length} guides are listed below.</p><p data-guide-no-results hidden>No matching guide yet. Try fewer words, another topic or clear the filters. You can also <a href="/tools/">browse the free tools</a>.</p><div class="guide-topic-links" aria-label="Browse guide topics">${Object.entries(guideTopics).map(([key,config]) => `<a href="/guides/${key}/">${e(config.category)} →</a>`).join('')}</div>
  ${Object.entries(guideTopics).map(([topic,config]) => { const app = apps[topic]; return `<section class="guide-related" id="${topic}" data-guide-topic="${topic}" style="--guide-accent:${config.color}"><span class="guide-kicker">${e(config.name)}</span><h2>${e(config.heading)}</h2><p>${e(config.intro)}</p><div class="guide-hero-actions"><a href="/guides/${topic}/">Browse ${e(config.category.toLowerCase())} →</a>${app?.tool ? `<a href="/tools/${app.tool}/">${e(app.toolName)} →</a>` : topicAction(config, app)}</div><div class="guide-card-grid">${guides.filter(g => g.topic === topic).map(guide => card(guide, { filterable: true })).join('')}</div></section>`; }).join('\n')}</section>
  <section class="guide-related" aria-label="Choose an app directly"><h2>Prefer to choose an app directly?</h2>${choices()}${storeDirectory()}</section>
</main>
${footer()}
</body>
</html>`, latest(guides));

// Keep hand-built marketing pages connected to the same brand and guide catalogue.
const resourcePages = new Map([
  [resolve(root, 'nutrilens/index.html'), ['nutrition', true]],
  [resolve(root, 'savings-goal-tracker/index.html'), ['savings', true]],
  [resolve(root, 'quitbit/index.html'), ['quitting', true]],
  [resolve(root, 'did-you-lift/index.html'), ['training', false]],
  [resolve(root, 'habit-tracker/index.html'), ['habits', true]],
  [resolve(root, 'math-riddles/index.html'), ['math', false]],
  ...Object.entries(apps).filter(([, app]) => app.tool).map(([topic, app]) => [resolve(root, `tools/${app.tool}/index.html`), [topic, true]]),
]);
const productPages = new Map([
  [resolve(root, 'nutrilens/index.html'), 'nutrition'],
  [resolve(root, 'savings-goal-tracker/index.html'), 'savings'],
  [resolve(root, 'quitbit/index.html'), 'quitting'],
  [resolve(root, 'did-you-lift/index.html'), 'training'],
  [resolve(root, 'habit-tracker/index.html'), 'habits'],
  [resolve(root, 'math-riddles/index.html'), 'math'],
]);
const resultPages = new Map(['nutrition', 'savings', 'training', 'habits'].map(topic => [resolve(root, `tools/${apps[topic].tool}/index.html`), topic]));
const appStoreId = app => app.apple?.match(/\/id(\d+)/)?.[1];
const playPackage = app => app.google ? new URL(app.google).searchParams.get('id') : null;
function productSchema(app) {
  const storeUrls = [app.apple, app.google].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication', '@id': `${site}/${app.slug}/#app`,
        name: app.name, applicationCategory: app.schemaCategory,
        operatingSystem: app.operatingSystem, description: app.schemaDescription,
        url: `${site}/${app.slug}/`, downloadUrl: storeUrls[0], sameAs: storeUrls,
        image: `${site}${app.icon}`, isAccessibleForFree: true,
        author: { '@type': 'Organization', '@id': `${site}/#organization`, name: 'Moocsoft', url: site },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
      },
      breadcrumbs([['Home','/'],[app.name,`/${app.slug}/`]]),
    ],
  };
}
function syncMarketing(directory) {
  for (const entry of readdirSync(directory, {withFileTypes:true})) {
    if (entry.name.startsWith('.') || ['node_modules', 'assets', 'content', 'scripts', 'guides'].includes(entry.name)) continue;
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) { syncMarketing(file); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const original = readFileSync(file, 'utf8');
    if (!/<body[^>]*class="[^"]*\bmarketing-page\b/.test(original)) continue;
    let html = original.replace(/[ \t]*<link\b[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*>\n?/g, '');
    // Keep repeated install copy out of search snippets, without hiding page content.
    html = html.replace(/<(div|section) class="(app-install|(?:wrap )?app-cta|guide-download|guide-app-preview(?: has-image)?)"(?! data-nosnippet)/g, '<$1 class="$2" data-nosnippet');
    html = html.replace('</head>', `  ${faviconLinks}\n</head>`);
    html = html.replace(/Browse all \d+ →/g, `Browse all ${guides.length} →`).replace(/Explore all \d+ guides/g, `Explore all ${guides.length} guides`);
    html = html.replace(/(<div class="stat-num">)\d+(<\/div>\s*<div class="stat-label">Practical guides)/, (_, before, after) => `${before}${guides.length}${after}`);
    html = html.replace(/(<div class="stat-num">)\d+(<\/div>\s*<div class="stat-label">Free tools)/, (_, before, after) => `${before}${toolCount}${after}`);
    // Hand-picked home/tool cards use the same current copy as the article source.
    html = html.replace(/<a\b(?=[^>]*class="guide-card")(?=[^>]*href="\/guides\/([a-z0-9-]+)\/")[^>]*>[\s\S]*?<\/a>/g, (original, slug) => guidesBySlug.has(slug) ? card(guidesBySlug.get(slug)) : original);
    if (file === resolve(root, 'index.html') || file === resolve(root, 'tools/index.html')) {
      html = html.replace(/<div class="guide-app-choices"[^>]*>[\s\S]*?<\/div>/, choices());
      html = html.replace(/<details class="guide-store-directory">[\s\S]*?<\/details>/, storeDirectory());
    }
    if (resourcePages.has(file)) {
      const [topic, wrapped] = resourcePages.get(file);
      html = html.replace(/<section class="(?:wrap )?guide-inline-resources" style="--guide-accent:[^"]+">[\s\S]*?<\/section>/, resources(topic, guides, wrapped));
    }
    if (resultPages.has(file)) {
      const marker = '<!-- Calculator app download -->';
      const end = '<!-- End calculator app download -->';
      const block = `${marker}${resultDownload(resultPages.get(file))}${end}`;
      if (html.includes(marker)) {
        html = html.replace(/<!-- Calculator app download -->[\s\S]*?<!-- End calculator app download -->/, block);
      } else {
        // The result wrapper is the final child of the calculator's aside.
        html = html.replace(/(<\/div>)(\s*<\/aside>)/, `${block}$1$2`);
      }
    }
    if (productPages.has(file)) {
      const app = apps[productPages.get(file)];
      const sharedHeader = header(app).replace(/^<a class="skip-link"[\s\S]*?<\/a>\n\s*/, '');
      if (!/<header class="site-header">/.test(html)) throw new Error(`Missing shared product header: ${file}`);
      html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, sharedHeader);
      const productPath = `/${app.slug}/`;
      const alternates = languageAlternates(productPath);
      if (alternates) {
        html = html.replace(/\s*<link rel="alternate" hreflang="(?:en|de|x-default)"[^>]*>/g, '');
        html = html.replace(/(<link rel="canonical"[^>]*>)/, '$1\n  ' + alternates);
        html = html.replace(/\s*<!-- Language switcher -->[\s\S]*?<!-- End language switcher -->/, '');
        html = html.replace('</header>', '</header>\n' + languageSwitcher(productPath));
      }
      if (app.slug === 'math-riddles') html = html.replace(/<!-- Math app download -->[\s\S]*?<!-- End math app download -->/, `<!-- Math app download -->${download(app, 'product-end')}<!-- End math app download -->`);
      const mobileMeta = [
        appStoreId(app) ? `<meta name="apple-itunes-app" content="app-id=${appStoreId(app)}">` : '',
        playPackage(app) ? `<meta name="google-play-app" content="app-id=${e(playPackage(app))}">` : '',
      ].filter(Boolean).join('\n  ');
      if (mobileMeta) html = html.replace(/(<meta name="theme-color"[^>]*>)[\s\S]*?(?=<link rel="canonical")/, `$1\n  ${mobileMeta}\n  `);
      const schema = `  <script type="application/ld+json">${JSON.stringify(productSchema(app)).replaceAll('<','\\u003c')}</script>`;
      const schemaPattern = /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/;
      html = schemaPattern.test(html) ? html.replace(schemaPattern, `\n${schema}\n  `) : html.replace('</head>', `${schema}\n</head>`);
      if (app.slug === 'habit-tracker') {
        const oldDescription = 'Track daily and weekly routines, edit calendar check-ins and review progress with Habit Tracker Daily. Explore a free streak calendar and practical guides.';
        const newDescription = 'Track daily and weekly routines on iPhone, iPad and Android, edit calendar check-ins and review progress with Habit Tracker Daily.';
        html = html.replaceAll('Habit Tracker Daily: Routine Planner for iPhone &amp; iPad', 'Habit Tracker App for iPhone, iPad &amp; Android');
        html = html.replaceAll(oldDescription, newDescription);
        html = html.replace('Free to download · Optional in-app purchases · iPhone and iPad', 'Free to download · Optional in-app purchases · iPhone, iPad and Android');
        const playButton = `<a class="store-btn secondary" href="${e(app.google)}" target="_blank" rel="noopener">Get it on Google Play</a>`;
        html = html.replace('</svg>Download on the App Store</a></div><p class="platform-note">', `</svg>Download on the App Store</a>${playButton}</div><p class="platform-note">`);
        html = html.replace('target="_blank" rel="noopener">Get Habit Tracker free</a><a class="store-btn secondary" href="/tools/habit-streak-calendar/">', `target="_blank" rel="noopener">Get Habit Tracker for iOS</a>${playButton}<a class="store-btn secondary" href="/tools/habit-streak-calendar/">`);
      }
    }
    if (file === resolve(root, 'index.html')) {
      const topicLinks = `<div class="guide-topic-links">${Object.entries(guideTopics).map(([topic, config]) => `<a href="/guides/${topic}/">${e(config.category)} →</a>`).join('')}</div>`;
      // Scope discovery links to the guides section; other home sections may
      // sit between it and About (for example the freelance-service section).
      html = html.replace(/(<section\b(?=[^>]*\bid="guides")[^>]*>)([\s\S]*?)(<\/section>)/, (_, open, body, close) => open + body
        .replace(/<h2 class="section-title">[^<]+<\/h2>/, '<h2 class="section-title">A different kind of useful read</h2>')
        .replace(/<p class="guide-topic-intro">[\s\S]*?<\/p>/, '<p class="guide-topic-intro">A fictional phone-change story, a café mystery and a business decision. Choose the format that fits your question.</p>')
        .replace(/<div class="guide-card-grid">[\s\S]*?<\/div>/, `<div class="guide-card-grid">${selectHomePicks(guides).map(card).join('')}</div>`)
        .replace(/<div class="guide-topic-links">[\s\S]*?<\/div>/, topicLinks) + close);
    }
    const pagePath = '/' + relative(root, file).split(sep).join('/').replace(/index\.html$/, '');
    html = attributeStoreLinks(html, pagePath);
    if (html !== original) writeFileSync(file, html);
  }
}
syncMarketing(root);
outputs.push(...buildLocalizedGuides(root));

const sitemapPath = resolve(root, 'sitemap.xml');
const marker = '  <!-- Generated guide pages: scripts/build-guides.mjs -->';
let sitemap = readFileSync(sitemapPath, 'utf8');
if (!sitemap.includes('xmlns:image=')) sitemap = sitemap.replace(/<urlset\b/, '<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
sitemap = sitemap.replace(/  <!-- Generated guide pages: scripts\/build-guides\.mjs -->[\s\S]*?  <!-- End generated guide pages -->\n?/g, '');
const entries = outputs.map(({path, lastmod, images}) => `  <url>\n    <loc>${site}${path}</loc>\n    <lastmod>${lastmod}</lastmod>${images.map(url => `\n    <image:image><image:loc>${e(url)}</image:loc></image:image>`).join('')}\n  </url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${marker}\n${entries}\n  <!-- End generated guide pages -->\n</urlset>`);
writeFileSync(sitemapPath, sitemap);
console.log(`Built ${guides.length} guides, ${Object.keys(guideTopics).length} topic pages and the guide hub. Updated sitemap with ${outputs.length} guide URLs.`);
