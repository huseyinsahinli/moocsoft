import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { apps, site, sources } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const matching = guides.filter(guide => guide.slug === 'compare-flutter-app-development-quotes');
assert.equal(matching.length, 1);
const guide = matching[0];
assert.equal(guide.topic, 'development');
assert.equal(guide.published, '2026-10-29');
assert.equal(guide.editorialFormat, 'decision');
assert.equal(guide.appPreview, undefined);
assert.equal(apps.development, undefined);
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(item => item.slug), [
  'mobile-app-mvp-checklist', 'mobile-app-backend-decision', 'flutter-development-service',
]);

const html = read('guides/compare-flutter-app-development-quotes/index.html');
assert(html.includes(`<link rel="canonical" href="${site}/guides/compare-flutter-app-development-quotes/">`));
assert(html.includes('There is no useful Flutter app price without a defined scope'));
assert(html.includes('class="quote-comparison-flow"'));
assert.equal((html.match(/class="quote-comparison-flow"/g) || []).length, 1);
assert(html.includes('class="guide-table"'));
assert(html.includes('class="guide-visual"'));
assert(html.includes('/assets/editorial/development.jpg'));
assert(html.includes('AI-generated editorial illustration'));
assert(html.includes('aria-label="Discuss a Flutter project"'));
assert(html.includes('href="/hire-flutter-developer/"'));
assert(html.includes('href="/tools/app-brief-builder/"'));
assert(!html.includes('class="app-install"'));
assert(!html.includes('SoftwareApplication'));
for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(node => node['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.datePublished, '2026-10-29');
assert.equal(article.dateModified, '2026-10-29');

const mvp = guides.find(item => item.slug === 'mobile-app-mvp-checklist');
assert.equal(mvp.published, '2026-10-09');
assert.equal(mvp.modified, undefined);
assert(read('guides/mobile-app-mvp-checklist/index.html').includes('href="/guides/compare-flutter-app-development-quotes/"'));
assert(read('guides/development/index.html').includes('href="/guides/compare-flutter-app-development-quotes/"'));
assert(read('sitemap.xml').includes(`<loc>${site}/guides/compare-flutter-app-development-quotes/</loc>\n    <lastmod>2026-10-29</lastmod>`));
assert(read('sitemap.xml').includes(`<loc>${site}/guides/mobile-app-mvp-checklist/</loc>\n    <lastmod>2026-10-09</lastmod>`));
console.log('PASS: Flutter quote guide metadata, curated reading, service-only CTAs, visible illustration, sources, reciprocal paths and sitemap.');
