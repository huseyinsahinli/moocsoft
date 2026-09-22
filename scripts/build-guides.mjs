import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { apps, site, published, sources, escape as e } from '../content/apps.mjs';
import { guides } from '../content/index.mjs';
import { head, header, footer, card, download, choices, storeDirectory, storeLinks, resources, faviconLinks } from '../content/components.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputs = [];
const modified = guide => guide.modified || guide.published || published;
const latest = list => list.map(modified).sort().at(-1) || published;
const toolCount = Object.values(apps).filter(app => app.tool).length;
const toolAction = (app, verb = 'Open') => app.tool ? `<a href="/tools/${app.tool}/">${verb} the free ${e(app.toolName.toLowerCase())} →</a>` : '';
const displayDate = value => new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z'));
for (const guide of guides) {
  for (const value of [guide.published || published, modified(guide)]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0, 10) !== value) throw new Error(`Invalid date for ${guide.slug}`);
  }
  if (modified(guide) < (guide.published || published)) throw new Error(`Modification precedes publication: ${guide.slug}`);
}
const byline = { '@type': 'Organization', name: 'Moocsoft', url: `${site}/#about` };
const breadcrumbs = items => ({ '@type':'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({'@type':'ListItem',position:i+1,name,item:site+path})) });
const crumbHtml = items => `<div class="guide-breadcrumb" aria-label="Breadcrumb">${items.map(([name,path]) => path ? `<a href="${path}">${e(name)}</a>` : `<span aria-current="page">${e(name)}</span>`).join('<span aria-hidden="true">/</span>')}</div>`;
const items = list => ({ '@type': 'ItemList', itemListElement: list.map((g,i) => ({'@type':'ListItem',position:i+1,name:g.title,url:`${site}/guides/${g.slug}/`})) });
function write(path, html, lastmod = published) {
  const target = resolve(root, '.' + path, 'index.html');
  mkdirSync(dirname(target), {recursive:true});
  writeFileSync(target, html.replace(/[ \t]+$/gm, '').trimEnd() + '\n');
  outputs.push({path, lastmod});
}
const slugs = new Set();
for (const guide of guides) {
  if (!apps[guide.topic] || slugs.has(guide.slug) || !/^[a-z0-9-]+$/.test(guide.slug)) throw new Error(`Invalid guide: ${guide.slug}`);
  slugs.add(guide.slug);
  const app = apps[guide.topic];
  const path = `/guides/${guide.slug}/`;
  const words = [guide.intro,guide.takeaway,...guide.sections.map(([title,html]) => title+' '+html.replace(/<[^>]*>/g,' '))].join(' ').split(/\s+/).filter(Boolean).length;
  const graph = [
    {'@type':'Article','@id':site+path+'#article',headline:guide.title,description:guide.description,inLanguage:'en',mainEntityOfPage:site+path,url:site+path,datePublished:guide.published || published,dateModified:modified(guide),author:byline,publisher:byline,image:[site+'/assets/social/moocsoft-og.png'],articleSection:app.category,isAccessibleForFree:true},
    breadcrumbs([['Home','/'],['Guides','/guides/'],[app.category,`/guides/${guide.topic}/`],[guide.title,path]]),
  ];
  const faq = `<section class="guide-faq" id="questions"><h2>Common questions</h2>${guide.faq.map(([q,a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</section>`;
  const refs = guide.sources.length ? `<section class="guide-references" id="references"><h2>References and further reading</h2><ul>${guide.sources.map(key => {if(!sources[key])throw new Error('Unknown source '+key);const [name,url]=sources[key];return `<li><a href="${e(url)}" target="_blank" rel="noopener">${e(name)}</a></li>`;}).join('')}</ul></section>` : '';
  write(path, `${head(guide.title, guide.description, path, graph, app)}
<main id="main-content" class="guide-shell">
  ${crumbHtml([['Home','/'],['Guides','/guides/'],[app.category,`/guides/${guide.topic}/`]])}
  <div class="guide-hero"><span class="guide-kicker">${e(app.category)} · Practical guide</span><h1>${e(guide.title)}</h1><p>${e(guide.intro)}</p><div class="guide-byline"><a href="/#about">By Moocsoft</a><time datetime="${guide.published || published}">${displayDate(guide.published || published)}</time><span>${Math.max(2,Math.ceil(words/200))} min read</span></div><div class="guide-hero-actions">${toolAction(app)}<a href="/${app.slug}/">Explore ${e(app.name)} →</a></div></div>
  <div class="guide-layout">
    <article class="guide-article" aria-label="${e(guide.title)}">
      <div class="guide-answer"><span>The useful takeaway</span><p>${e(guide.takeaway)}</p></div>
      ${guide.sections.map(([title,body],i) => `<section id="step-${i+1}"><h2>${e(title)}</h2>${body}</section>`).join('\n      ')}
      ${faq}${refs}
      <p class="guide-editor-note">Published by Moocsoft, the independent studio behind ${e(app.name)}. Examples and worksheets are illustrative. App features can vary by platform and version; see the store listing for current availability and in-app purchases.</p>
    </article>
    <aside class="guide-toc" aria-label="On this page"><p>ON THIS PAGE</p><ol>${guide.sections.map(([title],i) => `<li><a href="#step-${i+1}">${e(title)}</a></li>`).join('')}<li><a href="#questions">Common questions</a></li></ol>${storeLinks(app, 'sidebar')}</aside>
  </div>
  ${download(app)}
  <section class="guide-related"><span class="guide-kicker">Keep exploring</span><h2>More ${e(app.category.toLowerCase())} guides</h2><div class="guide-card-grid">${guides.filter(g => g.topic === guide.topic && g.slug !== guide.slug).map(card).join('')}</div></section>
</main>
${footer()}
</body>
</html>`, modified(guide));
}

for (const [topic, app] of Object.entries(apps)) {
  const selected = guides.filter(g => g.topic === topic);
  const path = `/guides/${topic}/`;
  const graph = [{'@type':'CollectionPage',name:app.heading,description:app.description,inLanguage:'en',url:site+path,mainEntity:items(selected)},breadcrumbs([['Home','/'],['Guides','/guides/'],[app.category,path]])];
  write(path, `${head(app.heading,app.description,path,graph,app)}
<main id="main-content" class="guide-shell">
  ${crumbHtml([['Home','/'],['Guides','/guides/'],[app.category,null]])}
  <div class="guide-hero"><span class="guide-kicker">The ${e(app.name)} reading list</span><h1>${e(app.heading)}</h1><p>${e(app.intro)}</p><div class="guide-hero-actions">${toolAction(app, 'Try')}<a href="/${app.slug}/">Explore ${e(app.name)} →</a></div></div>
  <section class="guide-related"><h2>Choose your starting point</h2><p class="guide-topic-intro">${e(app.choice)}</p><div class="guide-card-grid">${selected.map(card).join('')}</div></section>
  <section class="guide-related"><span class="guide-kicker">From the guide to the app</span><h2>Put it into practice with ${e(app.name)}</h2><p class="guide-topic-intro">${e(app.use)}</p>${download(app, 'topic-end')}</section>
  <div class="guide-related"><h2>Explore another topic</h2><div class="guide-topic-links">${Object.entries(apps).filter(([key]) => key !== topic).map(([key,a])=>`<a href="/guides/${key}/">${e(a.category)} →</a>`).join('')}</div></div>
</main>
${footer()}
</body>
</html>`, latest(selected));
}

const hubTitle = 'Practical Guides for Food, Savings, Fitness, Habits and Math';
const hubDescription = `Explore ${guides.length} practical guides with calculators, worked examples and worksheets. Find an app to track meals, savings, smoke-free progress, workouts and habits or practise math puzzles.`;
write('/guides/', `${head(hubTitle,hubDescription,'/guides/',[{'@type':'CollectionPage',name:hubTitle,description:hubDescription,inLanguage:'en',url:site+'/guides/',mainEntity:items(guides)},breadcrumbs([['Home','/'],['Guides','/guides/']])])}
<main id="main-content" class="guide-shell">
  ${crumbHtml([['Home','/'],['Guides',null]])}
  <div class="guide-hero"><span class="guide-kicker">${guides.length} guides · ${toolCount} free tools · Your next step</span><h1>Small steps.<br>Useful answers.</h1><p>Learn how to log a meal, plan a savings goal, record smoke-free progress, organize a workout, build a routine or solve a math puzzle. Start with a worked example, then use the matching tool or app.</p>${choices()}${storeDirectory()}<div class="guide-topic-links" aria-label="Browse guide topics">${Object.entries(apps).map(([key,app])=>`<a href="#${key}">${e(app.category)}</a>`).join('')}</div></div>
  ${Object.entries(apps).map(([topic,app]) => `<section class="guide-related" id="${topic}" style="--guide-accent:${app.color}"><span class="guide-kicker">${e(app.name)}</span><h2>${e(app.heading)}</h2><p>${e(app.intro)}</p><div class="guide-hero-actions"><a href="/guides/${topic}/">Browse ${e(app.category.toLowerCase())} →</a>${app.tool ? `<a href="/tools/${app.tool}/">${e(app.toolName)} →</a>` : `<a href="/${app.slug}/">Explore ${e(app.name)} →</a>`}</div><div class="guide-card-grid">${guides.filter(g => g.topic === topic).map(card).join('')}</div></section>`).join('\n')}
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
  [resolve(root, 'tools/quit-smoking-savings-calculator/index.html'), ['quitting', true]],
]);
const productPages = new Map([
  [resolve(root, 'nutrilens/index.html'), 'nutrition'],
  [resolve(root, 'savings-goal-tracker/index.html'), 'savings'],
  [resolve(root, 'quitbit/index.html'), 'quitting'],
  [resolve(root, 'did-you-lift/index.html'), 'training'],
  [resolve(root, 'habit-tracker/index.html'), 'habits'],
  [resolve(root, 'math-riddles/index.html'), 'math'],
]);
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
    html = html.replace('</head>', `  ${faviconLinks}\n</head>`);
    html = html.replace(/Browse all \d+ →/g, `Browse all ${guides.length} →`).replace(/Explore all \d+ guides/g, `Explore all ${guides.length} guides`);
    html = html.replace(/(<div class="stat-num">)\d+(<\/div>\s*<div class="stat-label">Practical guides)/, (_, before, after) => `${before}${guides.length}${after}`);
    if (resourcePages.has(file)) {
      const [topic, wrapped] = resourcePages.get(file);
      html = html.replace(/<section class="(?:wrap )?guide-inline-resources" style="--guide-accent:[^"]+">[\s\S]*?<\/section>/, resources(topic, guides, wrapped));
    }
    if (productPages.has(file)) {
      const app = apps[productPages.get(file)];
      const sharedHeader = header(app).replace(/^<a class="skip-link"[\s\S]*?<\/a>\n\s*/, '');
      html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, sharedHeader);
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
      const topicLinks = `<div class="guide-topic-links">${Object.entries(apps).map(([topic, app]) => `<a href="/guides/${topic}/">${e(app.category)} →</a>`).join('')}</div>`;
      html = html.replace(/<div class="guide-topic-links">[\s\S]*?<\/div>(?=<\/section>\s*<!-- ABOUT -->)/, topicLinks);
    }
    if (html !== original) writeFileSync(file, html);
  }
}
syncMarketing(root);

const sitemapPath = resolve(root, 'sitemap.xml');
const marker = '  <!-- Generated guide pages: scripts/build-guides.mjs -->';
let sitemap = readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/  <!-- Generated guide pages: scripts\/build-guides\.mjs -->[\s\S]*?  <!-- End generated guide pages -->\n?/g, '');
const entries = outputs.map(({path, lastmod}) => `  <url>\n    <loc>${site}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${marker}\n${entries}\n  <!-- End generated guide pages -->\n</urlset>`);
writeFileSync(sitemapPath, sitemap);
console.log(`Built ${guides.length} guides, ${Object.keys(apps).length} topic pages and the guide hub. Updated sitemap with ${outputs.length} guide URLs.`);
