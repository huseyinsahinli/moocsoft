// Editorial and generated-output checks; no backend access or security audit is simulated.
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
const slug = 'mobile-app-backend-decision';
const path = `/guides/${slug}/`;
const guide = guides.find(item => item.slug === slug);
assert(guide);
assert.equal(guides.filter(item => item.slug === slug).length, 1);
assert.equal(guide.topic, 'development');
assert.equal(guide.published, '2026-10-17');
assert.equal(guide.appPreview, undefined);
const html = read(`guides/${slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}${path}">`));
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(guide.description));
assert(html.includes('aria-label="Discuss a Flutter project"'));
assert(!html.includes('class="app-install"'));
assert(!html.includes('SoftwareApplication'));
assert(html.includes('href="/hire-flutter-developer/"'));
assert(html.includes('href="/tools/app-brief-builder/"'));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.url, site + path);
assert.equal(article.headline, guide.title);
assert.equal(article.datePublished, '2026-10-17');
assert.equal(article.dateModified, '2026-10-17');
assert.equal(article.articleSection, 'Mobile app development');
assert.equal(article.inLanguage, 'en');
for (const [question, answer] of guide.faq) {
  assert(html.includes(question) && html.includes(answer), 'FAQ answers are visible without JavaScript');
}
const breadcrumbs = graph.find(item => item['@type'] === 'BreadcrumbList');
assert.equal(breadcrumbs.itemListElement.at(-1).item, site + path);
for (const key of guide.sources) assert(html.includes(sources[key][1]), `Primary reference: ${key}`);
for (const phrase of [
  'fictional class-booking app', 'Two saved requests do not create two available places',
  'existing booking API', 'Authentication establishes who', 'Authorization decides',
  'identify a project rather than authorize access', 'service-account private key',
  'No remote data service required for that operation', 'Missing service work',
  'Ongoing service owner', 'not a privacy review',
]) assert(html.includes(phrase), `Keep a concrete decision or boundary: ${phrase}`);
assert.equal((html.match(/<caption>/g) || []).length, 3);
assert.deepEqual(createRelatedGuideSelector(guides)(slug).map(guideHref), [
  '/guides/offline-first-flutter-app-local-storage-cloud-sync/',
  '/guides/mobile-app-mvp-checklist/',
  '/guides/mobile-app-handover-checklist/',
]);
const mvp = read('guides/mobile-app-mvp-checklist/index.html');
assert(mvp.includes(`href="${path}"`));
const mvpArticle = JSON.parse(mvp.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(item => item['@type'] === 'Article');
assert.equal(mvpArticle.datePublished, '2026-10-09');
assert.equal(mvpArticle.dateModified, '2026-10-09', 'A new reading link must not reset the older guide date');
for (const file of ['guides/development/index.html', 'guides/index.html']) assert(read(file).includes(`href="${path}"`));
assert(read('sitemap.xml').includes(`<loc>${site}${path}</loc>\n    <lastmod>2026-10-17</lastmod>`));
console.log('PASS: Backend guide dates/schema, service CTA, original authority worksheet, source boundaries, reciprocal links and sitemap.');
