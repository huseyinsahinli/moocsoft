import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, published } from '../content/apps.mjs';
import { guides } from '../content/index.mjs';
import { guideTopics, guideHref } from '../content/topics.mjs';
import { relatedResources } from '../content/related-guides.mjs';
import { header, download, card } from '../content/components.mjs';
import { attributeStoreLinks } from '../content/store-attribution.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
assert.equal(Object.keys(apps).length, 6, 'Editorial service topic does not become an app');
assert.equal(apps.development, undefined);
assert(guideTopics.development);
for (const guide of guides.filter(guide => apps[guide.topic])) {
  const html = read(`guides/${guide.slug}/index.html`);
  // An existing app topic still gets its exact shared header and download CTA.
  assert(html.includes(attributeStoreLinks(header(apps[guide.topic]), `/guides/${guide.slug}/`)), guide.slug);
  assert(html.includes(attributeStoreLinks(download(apps[guide.topic]), `/guides/${guide.slug}/`)), guide.slug);
  assert(html.includes(`datetime="${guide.published || published}"`), guide.slug);
}
for (const path of ['guides/mobile-app-mvp-checklist/index.html', 'guides/development/index.html']) {
  const html = read(path);
  assert(html.includes(header().replace(/[ \t]+$/gm, '')), path);
  assert(!html.includes('class="app-install"'), path);
  assert(!html.includes('class="install-link'), path);
  assert(!html.includes('Free to download'), path);
  assert(!html.includes('SoftwareApplication'), path);
  assert(!html.includes('undefined'), path);
  assert(html.includes('aria-label="Discuss a Flutter project"'), path);
  assert(html.includes('href="/hire-flutter-developer/"'), path);
}
const serviceHtml = read('guides/mobile-app-mvp-checklist/index.html');
const graph = JSON.parse(serviceHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
assert.equal(graph.find(node => node['@type'] === 'Article').articleSection, 'Mobile app development');
assert(graph.find(node => node['@type'] === 'BreadcrumbList').itemListElement.some(item => item.item.endsWith('/guides/development/')));
for (const resource of Object.values(relatedResources)) {
  assert(serviceHtml.includes(card(resource)), resource.slug);
  assert.equal(guideHref(resource), resource.path);
}
const weekly = read('guides/weekly-reset-checklist/index.html');
assert(weekly.includes('class="guide-app-preview has-image"'));
assert(weekly.includes('Weekly Reset Checklist'));
assert(weekly.includes('A filled-in weekly reset example'));
assert(weekly.includes('href="/savings-goal-tracker/"'));
assert(weekly.includes('href="/did-you-lift/"'));
assert(read('guides/habit-tracker-ideas/index.html').includes('href="/guides/weekly-reset-checklist/"'));
assert(read('hire-flutter-developer/index.html').includes('href="/guides/mobile-app-mvp-checklist/"'));
assert(read('guides/index.html').includes('id="development"'));
assert(read('index.html').includes('href="/guides/development/"'));
for (const slug of ['weekly-reset-checklist', 'mobile-app-mvp-checklist', 'development']) {
  assert(read('sitemap.xml').includes(`<loc>https://moocsoft.net/guides/${slug}/</loc>`), slug);
}
console.log(`Service guides passed: app headers/downloads preserved for ${guides.filter(guide => apps[guide.topic]).length} articles; service-only CTA, real resources, reciprocal links and sitemap verified.`);
