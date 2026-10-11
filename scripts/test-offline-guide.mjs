// Static editorial regression. No account access, backend or app sync is simulated.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { sources, site } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
import { guideHref } from '../content/topics.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
const slug = 'offline-first-flutter-app-local-storage-cloud-sync';
const path = `/guides/${slug}/`;
const guide = guides.find(item => item.slug === slug);
assert(guide);
assert.equal(guide.topic, 'development');
assert.equal(guide.published, '2026-10-11');
assert.equal(guide.appPreview, undefined, 'Do not fabricate an app preview for a service guide');
const html = read(`guides/${slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}${path}">`));
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(guide.description));
assert(html.includes('aria-label="Discuss a Flutter project"'));
assert(!html.includes('class="app-install"'));
assert(!html.includes('SoftwareApplication'));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.datePublished, '2026-10-11');
assert.equal(article.dateModified, '2026-10-11');
assert.equal(article.url, site + path);
assert.equal(article.headline, guide.title);
assert.equal(article.articleSection, 'Mobile app development');
for (const key of guide.sources) assert(html.includes(sources[key][1]), `Primary reference: ${key}`);
assert.deepEqual(createRelatedGuideSelector(guides)(slug).map(guideHref), [
  '/guides/mobile-app-mvp-checklist/', '/hire-flutter-developer/', '/contact/',
]);
for (const phrase of [
  'Saved on this device; sync pending.', 'acknowledgment is lost',
  'original operation identity', 'no duplicate B', 'conflict and deletion rules',
  'PDF and Excel export are Premium features',
  'without supporting import', 'App closes with pending work',
  'A failed local save', 'Fresh installation, no network',
]) assert(html.includes(phrase), `Keep a meaningful boundary or acceptance check: ${phrase}`);
const mvp = read('guides/mobile-app-mvp-checklist/index.html');
assert(mvp.includes(`href="${path}"`), 'Existing guide links to the new worksheet');
const mvpArticle = JSON.parse(mvp.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(item => item['@type'] === 'Article');
assert.equal(mvpArticle.datePublished, '2026-10-09');
assert.equal(mvpArticle.dateModified, '2026-10-09', 'A reciprocal link does not reset the older guide date');
for (const file of ['guides/development/index.html', 'guides/index.html']) assert(read(file).includes(`href="${path}"`), file);
const sitemap = read('sitemap.xml');
assert(sitemap.includes(`<loc>${site}${path}</loc>\n    <lastmod>2026-10-11</lastmod>`));
assert.equal(guides.filter(item => item.slug === slug).length, 1, 'One catalogue entry for this guide');
console.log('PASS: Offline Flutter guide date/schema, service CTA, primary sources, illustrative retry/conflict checks, reciprocal links and sitemap.');
