import { apps, site, escape as e } from './apps.mjs';

export const faviconLinks = '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">\n  <link rel="icon" type="image/png" href="/assets/brand/favicon-96.png" sizes="96x96">\n  <link rel="icon" type="image/svg+xml" href="/assets/brand/favicon.svg" sizes="any">\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">';

export function storeLinks(app, placement = 'header') {
  const links = [];
  if (app.apple) links.push(`<a class="install-link" data-app="${app.slug}" data-placement="${placement}" href="${e(app.apple)}" target="_blank" rel="noopener" aria-label="Download ${e(app.name)} on the App Store">App Store <span aria-hidden="true">↗</span></a>`);
  if (app.google) links.push(`<a class="install-link${app.apple ? ' secondary' : ''}" data-app="${app.slug}" data-placement="${placement}" href="${e(app.google)}" target="_blank" rel="noopener" aria-label="Download ${e(app.name)} on Google Play">Google Play <span aria-hidden="true">↗</span></a>`);
  return `<div class="install-actions">${links.join('')}</div>`;
}

export function header(app) {
  return `<a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header">
    <div class="site-header-top"><a class="site-wordmark" href="/">moocsoft</a><div class="site-menu" role="navigation" aria-label="Main navigation"><a href="/#work">Apps</a><a href="/tools/">Free tools</a><a href="/guides/">Guides</a></div></div>
    ${app ? `<div class="app-install" aria-label="Download ${e(app.name)}"><img src="${app.icon}" width="42" height="42" alt=""><div class="app-install-copy"><a href="/${app.slug}/">${e(app.name)}</a><span>${e(app.promise)}</span></div>${storeLinks(app)}</div>` : ''}
  </header>`;
}

export function download(app, placement = 'article-end') {
  return `<section class="guide-download" style="--guide-accent:${app.color}" aria-label="Get ${e(app.name)}"><div><span class="guide-kicker">Take the next step</span><h2>Get ${e(app.name)}.</h2><p>${e(app.promise)}</p><small>Free to download · ${e(app.platform)}</small></div>${storeLinks(app, placement)}</section>`;
}

export function choices() {
  return `<div class="guide-app-choices" aria-label="Choose a Moocsoft app">${Object.values(apps).map(app => `<a class="guide-app-choice" href="/${app.slug}/"><img src="${app.icon}" width="27" height="27" alt="">${e(app.name)} <span aria-hidden="true">→</span></a>`).join('')}</div>`;
}

export function storeDirectory() {
  return `<details class="guide-store-directory"><summary>Download an app · App Store &amp; Google Play</summary>${Object.values(apps).map(app => download(app, 'directory')).join('')}</details>`;
}

export function card(guide) {
  const app = apps[guide.topic];
  return `<a class="guide-card" style="--guide-accent:${app.color}" href="/guides/${guide.slug}/"><span class="guide-kicker">${e(app.category)}</span><h3>${e(guide.title)}</h3><p>${e(guide.description)}</p><span>Read the guide <span aria-hidden="true">→</span></span></a>`;
}

export function resources(topic, guides, wrapped = true) {
  const app = apps[topic];
  return `<section class="${wrapped ? 'wrap ' : ''}guide-inline-resources" style="--guide-accent:${app.color}"><span class="guide-kicker">Learn with ${e(app.name)}</span><h2>${e(app.heading)}</h2><p>${e(app.use)}</p><div class="guide-hero-actions"><a href="/tools/${app.tool}/">Try the free ${e(app.toolName.toLowerCase())} →</a><a href="/guides/${topic}/">All ${e(app.category.toLowerCase())} guides →</a></div><div class="guide-card-grid">${guides.filter(g => g.topic === topic).map(card).join('')}</div></section>`;
}

export function footer() {
  return `<footer class="guide-foot"><div class="guide-shell"><a class="site-wordmark" href="/">moocsoft</a><div class="guide-foot-links"><a href="/#about">About the studio</a><a href="/guides/">All guides</a><a href="/tools/">Free tools</a><a href="/privacy-policy/">Privacy</a><a href="mailto:moocsoft@gmail.com">Contact</a></div><span>© 2026 Huseyin Sahinli</span></div></footer>`;
}

export function head(title, description, path, graph, app) {
  const url = site + path;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${e(title)} | Moocsoft</title>
  <meta name="description" content="${e(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#090a0c">
  <link rel="canonical" href="${url}">
  ${faviconLinks}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&amp;family=Outfit:wght@300;400;500;600&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/tools.css">
  <link rel="stylesheet" href="/assets/content.css">
  <meta property="og:type" content="${graph.some(node => node['@type'] === 'Article') ? 'article' : 'website'}">
  <meta property="og:site_name" content="Moocsoft">
  <meta property="og:locale" content="en_US">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site}/assets/social/moocsoft-og.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(title)}">
  <meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="${site}/assets/social/moocsoft-og.png">
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>
</head>
<body class="marketing-page"${app ? ` style="--guide-accent:${app.color}"` : ''}>
${header(app)}`;
}
