// Run after editorial photo/chart assets and the normal guide build. No dependencies.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { germanGuides } from '../content/de-index.mjs';
import { guideMedia } from '../content/guide-media.mjs';
import { guideCharts } from '../content/guide-charts.mjs';
import { editorialPhotos, editorialPhotosDe } from '../content/editorial-media.mjs';
import { site, published, escape } from '../content/apps.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, '.' + path));
const text = path => read(path).toString('utf8');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
const sitemap = text('/sitemap.xml');
const topics = ['nutrition', 'savings', 'quitting', 'training', 'habits', 'math', 'development'];
assert.deepEqual(Object.keys(editorialPhotos).sort(), topics.sort());
assert.deepEqual(Object.keys(editorialPhotosDe).sort(), topics.sort());
assert.equal(Object.keys(guideMedia).length, 7, 'Legacy diagrams are preserved');
assert.equal(Object.keys(guideCharts).length, 12);
for (const slug of Object.keys(guideCharts)) {
  assert(guides.some(guide => guide.slug === slug), 'No stale chart: ' + slug);
  assert(!guideMedia[slug], 'Do not override an existing diagram');
}

function dimensions(buffer) {
  if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset++] !== 0xff) continue;
      while (buffer[offset] === 0xff) offset++;
      const marker = buffer[offset++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || marker >= 0xd0 && marker <= 0xd8) continue;
      const size = buffer.readUInt16BE(offset);
      assert(size >= 2 && offset + size <= buffer.length);
      if ([0xc0,0xc1,0xc2].includes(marker)) return [buffer.readUInt16BE(offset + 5), buffer.readUInt16BE(offset + 3)];
      offset += size;
    }
  }
  if (buffer.toString('ascii',0,4) === 'RIFF' && buffer.toString('ascii',8,12) === 'WEBP') {
    assert.equal(buffer.readUInt32LE(4) + 8, buffer.length);
    for (let offset = 12; offset + 8 <= buffer.length;) {
      const kind = buffer.toString('ascii', offset, offset + 4), length = buffer.readUInt32LE(offset + 4), data = offset + 8;
      assert(data + length <= buffer.length);
      if (kind === 'VP8X') return [buffer.readUIntLE(data + 4,3)+1, buffer.readUIntLE(data + 7,3)+1];
      if (kind === 'VP8 ') return [buffer.readUInt16LE(data + 6)&0x3fff, buffer.readUInt16LE(data + 8)&0x3fff];
      if (kind === 'VP8L') { const bits=buffer.readUInt32LE(data+1); return [(bits&0x3fff)+1,((bits>>>14)&0x3fff)+1]; }
      offset = data + length + length % 2;
    }
  }
  assert.fail('No valid image dimensions');
}
const unique = new Map([...Object.values(editorialPhotos), ...Object.values(guideCharts)].map(visual => [visual.src, visual]));
let totalBytes = 0;
for (const visual of unique.values()) {
  const master = read(visual.src);
  assert.deepEqual(dimensions(master), [1200,675], visual.src);
  assert(master.length <= 220000, 'Master exceeds 220 KB: ' + visual.src);
  assert(!master.includes(Buffer.from('Exif')), 'No camera/private EXIF: ' + visual.src);
  assert.equal(visual.webp.length, 3);
  totalBytes += master.length;
  for (const [index, variant] of visual.webp.entries()) {
    const width = [480,800,1200][index], buffer = read(variant.src);
    assert.equal(variant.width, width);
    assert.equal(variant.height, width*9/16);
    assert.deepEqual(dimensions(buffer), [width,width*9/16], variant.src);
    assert(buffer.length <= (width === 480 ? 50000 : 160000), 'Responsive image too large: ' + variant.src);
    totalBytes += buffer.length;
  }
  if (visual.kind === 'photo') assert(visual.caption.includes('AI-generated editorial illustration'));
}
assert(totalBytes < 4_000_000, 'Keep the entire new image set below 4 MB');
let photoGuides = 0, chartGuides = 0;
const checkGuide = (guide, locale, visual) => {
  const path = (locale === 'de' ? '/de' : '') + '/guides/' + guide.slug + '/';
  const html = text(path+'index.html');
  const figures = [...html.matchAll(/<figure class="guide-visual">([\s\S]*?)<\/figure>/g)];
  assert.equal(figures.length, 1, path);
  const figure = figures[0][1], img = attrs(figure.match(/<img\b[^>]*>/)[0]), source = attrs(figure.match(/<source\b[^>]*>/)[0]);
  assert.equal(img.src, visual.src, path);
  assert.equal(img.alt, escape(visual.alt));
  assert.equal(img.width, '1200'); assert.equal(img.height, '675');
  assert.equal(img.loading, 'lazy'); assert.equal(img.decoding, 'async');
  assert.equal(img['data-visual-kind'], visual.kind || 'diagram');
  assert.equal(source.type, 'image/webp');
  assert.equal(source.srcset, visual.webp.map(image=>`${image.src} ${image.width}w`).join(', '));
  assert(source.sizes);
  assert(figure.includes(escape(visual.caption)));
  const article = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(node=>node['@type']==='Article');
  assert.deepEqual(article.image, [site+visual.src]);
  assert.equal(article.datePublished, guide.published || published);
  assert.equal(article.dateModified, guide.modified || guide.published || published);
  assert.equal(article.url, site+path);
  assert(html.includes(`<meta property="og:image" content="${site}${visual.src}">`));
  assert(html.includes(`<meta name="twitter:image" content="${site}${visual.src}">`));
  const entry = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].find(match=>match[1].includes(`<loc>${site}${path}</loc>`));
  assert(entry && entry[1].includes(`<image:loc>${site}${visual.src}</image:loc>`), path+' image sitemap');
  if (visual.kind === 'photo') {
    assert(figures[0].index > html.indexOf('<section id="step-1">'));
    assert(figures[0].index < html.indexOf('<section id="step-2">'));
    assert(visual.caption.includes(locale === 'de' ? 'KI-generierte redaktionelle Illustration' : 'AI-generated editorial illustration'));
    if (locale === 'en') photoGuides++;
  } else if (visual.kind === 'chart' && locale === 'en') {
    assert(figures[0].index > html.indexOf(`<section id="step-${visual.afterSection}">`));
    if (visual.afterSection < guide.sections.length) assert(figures[0].index < html.indexOf(`<section id="step-${visual.afterSection+1}">`));
    chartGuides++;
    const fullSize = `<a href="${visual.src}" target="_blank" rel="noopener">Open full-size chart ↗</a>`;
    assert(html.includes(fullSize), 'Native full-resolution chart link: ' + path);
  }
};
for (const guide of guides) checkGuide(guide, 'en', guideMedia[guide.slug] || guideCharts[guide.slug] || editorialPhotos[guide.topic]);
for (const guide of germanGuides) checkGuide(guide, 'de', editorialPhotosDe[guide.topic]);
assert(!text('/guides/count-rectangles-in-a-grid/index.html').includes('rectangle-grid-title'), 'Replace the older duplicate inline grid with the new explanatory boundary diagram');
assert.equal(photoGuides, guides.length - 7 - 12);
assert.equal(chartGuides, 12);
console.log(`PASS: all ${guides.length} English + ${germanGuides.length} German guides have visible descriptive media; ${photoGuides} English topic photos, 12 new charts, 7 preserved diagrams; metadata, dates, placement, asset dimensions and ${(totalBytes/1_000_000).toFixed(2)} MB total new image payload.`);
