// Run after the normal guide build. No browser/image dependency ships to readers.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, escape } from '../content/apps.mjs';
import { guideTopics } from '../content/topics.mjs';
import { guides } from '../content/index.mjs';
import { germanGuides } from '../content/de-index.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { head } from '../content/components.mjs';
import { pageVisualUpdated, englishVisualTopics, germanVisualTopics, pagePhotoFigure, visualTopicNavigation } from '../content/page-visuals.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, '.' + path), 'utf8');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
const nodes = html => JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const sitemap = read('/sitemap.xml');
const sitemapEntry = path => [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(match => match[1].includes(`<loc>${site}${path}</loc>`))?.[1];
const images = html => [...html.matchAll(/<img\b[^>]*data-page-visual="photo"[^>]*>/g)].map(match => attrs(match[0]));
const allTopics = Object.keys(guideTopics);
assert.equal(allTopics.length, 7);
assert.deepEqual(englishVisualTopics.map(item => item.topic), allTopics);
assert.equal(new Set(englishVisualTopics.map(item => item.href)).size, allTopics.length);

function checkPhoto(html, visual) {
  const img = images(html).find(image => image.src === visual.src);
  assert(img, visual.src);
  assert.equal(img.alt, escape(visual.alt));
  assert.equal(img.width, '1200'); assert.equal(img.height, '675');
  assert.equal(img.loading, 'lazy'); assert.equal(img.decoding, 'async');
  const variants = visual.webp.map(image => `${image.src} ${image.width}w`).join(', ');
  assert(html.includes(`srcset="${variants}"`));
  for (const image of [visual, ...visual.webp]) assert(existsSync(resolve(root, '.' + image.src)), image.src);
  assert.deepEqual(visual.webp.map(image => [image.width, image.height]), [[480,270],[800,450],[1200,675]]);
}
function checkCss(html) {
  assert.equal((html.match(/href="\/assets\/page-visuals\.css"/g) || []).length, 1);
  assert(!html.includes('/assets/page-visuals.js'), 'CSS-only enhancement must not request a phantom script');
}
for (const topic of allTopics) {
  const path = `/guides/${topic}/`, html = read(path + 'index.html'), visual = editorialPhotos[topic];
  checkCss(html); checkPhoto(html, visual);
  assert.equal((html.match(/class="page-topic-photo"/g) || []).length, 1);
  assert.equal((html.match(/class="guide-visual"/g) || []).length, 0, 'Collection image is not an article figure');
  assert(html.indexOf('class="guide-hero-actions"') < html.indexOf('class="page-topic-photo"'), 'Keep useful actions first');
  assert(html.includes(escape(visual.caption)) && visual.caption.includes('AI-generated editorial illustration'));
  assert(html.includes(`<meta property="og:image" content="${site}${visual.src}">`));
  assert(html.includes(`<meta name="twitter:image" content="${site}${visual.src}">`));
  assert.deepEqual(nodes(html).find(node => node['@type'] === 'CollectionPage').image, [site + visual.src]);
  const entry = sitemapEntry(path);
  assert(entry?.includes(`<image:loc>${site}${visual.src}</image:loc>`));
  assert(entry.match(/<lastmod>([^<]+)<\/lastmod>/)[1] >= pageVisualUpdated);
  assert.equal((html.match(/class="guide-card"/g) || []).length, guides.filter(guide => guide.topic === topic).length);
}
for (const [path, locale, entries] of [
  ['/guides/', 'en', englishVisualTopics],
  ['/de/guides/', 'de', germanVisualTopics(germanGuides)],
]) {
  const html = read(path + 'index.html'), entry = sitemapEntry(path);
  checkCss(html);
  assert.equal((html.match(/class="page-topic-card"/g) || []).length, entries.length);
  assert.equal(images(html).length, entries.length);
  assert(html.indexOf('class="guide-hero-actions"') < html.indexOf('class="page-visual-topics"'));
  assert(html.includes(locale === 'de' ? 'KI-generierte redaktionelle Illustrationen' : 'AI-generated editorial illustrations'));
  assert.deepEqual(nodes(html).find(node => node['@type'] === 'CollectionPage').image, entries.map(item => site + item.visual.src));
  for (const item of entries) {
    checkPhoto(html, item.visual);
    assert(html.includes(`<a class="page-topic-card" href="${item.href}">`));
    assert(existsSync(resolve(root, '.' + item.href, 'index.html')));
    assert(entry?.includes(`<image:loc>${site}${item.visual.src}</image:loc>`));
  }
  if (locale === 'en') assert.equal((html.match(/data-guide-format="/g) || []).length, guides.length, 'Visual topics are not filterable guide cards');
  else {
    assert.equal(entries.length, 3);
    assert(entries.every(item => germanGuides.some(guide => item.href === `/de/guides/${guide.slug}/`)), 'German topics link only to genuine translated articles');
    assert.equal((html.match(/class="guide-card"/g) || []).length, germanGuides.length);
  }
}
const helperHead = head('A title', 'A description', '/guides/', [], undefined, [], undefined, { stylesheets: ['page-visuals'] });
checkCss(helperHead);
assert.throws(() => head('A', 'B', '/guides/', [], undefined, [], undefined, { stylesheets: '../bad' }), /stylesheet/);
assert.throws(() => head('A', 'B', '/guides/', [], undefined, [], undefined, { stylesheets: ['../bad'] }), /stylesheet/);
assert.throws(() => pagePhotoFigure(undefined), /photograph/);
assert.throws(() => visualTopicNavigation([...englishVisualTopics, englishVisualTopics[0]]), /navigation/);
assert.throws(() => germanVisualTopics([{ topic: 'math', slug: 'not-translated' }]), /translated/);
const css = read('/assets/page-visuals.css');
assert(css.includes('repeat(2, minmax(0, 1fr))') && css.includes('repeat(3, minmax(0, 1fr))'));
assert(!/url\(|@import|\.guide-visual\b|position:\s*fixed/.test(css), 'No network assets, article override or fixed overlay');
console.log('PASS: seven visual topic hubs, seven English/three genuine German image destinations, disclosures, responsive assets, metadata/sitemap, action-first layout and CSS-only enhancement.');
