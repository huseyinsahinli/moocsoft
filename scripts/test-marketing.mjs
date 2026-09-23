// Run after `node scripts/build-guides.mjs`. No server or dependencies required.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, published, site } from '../content/apps.mjs';
import { appPreviews } from '../content/app-previews.mjs';
import { guides } from '../content/index.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = new URL(site).origin;
const errors = [];
const check = (condition, file, message) => {
  if (!condition) errors.push(`${relative(root, file) || '.'}: ${message}`);
};
const decode = value => value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (entity, name) => {
  if (name[0] === '#') {
    const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
  }
  return { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' }[name.toLowerCase()];
});
const attrs = tag => Object.fromEntries([...tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
  .map(match => [match[1].toLowerCase(), decode(match[2] ?? match[3] ?? match[4])]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => attrs(match[0]));
const classes = value => (value || '').split(/\s+/);
const documentUrl = file => `${site}/${relative(root, file).split(sep).join('/').replace(/index\.html$/, '')}`;

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || ['node_modules', 'assets', 'content', 'scripts'].includes(entry.name)) return [];
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : entry.name.endsWith('.html') ? [file] : [];
  });
}

function localTarget(url) {
  const file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (file !== root && !file.startsWith(root + sep)) return null;
  if (existsSync(file) && statSync(file).isFile()) return file;
  const index = resolve(file, 'index.html');
  return existsSync(index) && statSync(index).isFile() ? index : null;
}

function schemaNodes(html, file) {
  const nodes = [];
  const collect = value => {
    if (Array.isArray(value)) { value.forEach(collect); return; }
    if (value && typeof value === 'object') {
      nodes.push(value);
      if (value['@graph']) collect(value['@graph']);
    }
  };
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (attrs(match[1]).type?.toLowerCase() !== 'application/ld+json') continue;
    try { collect(JSON.parse(match[2])); }
    catch (error) { check(false, file, `Invalid JSON-LD: ${error.message}`); }
  }
  return nodes;
}

function imageSize(file) {
  const data = readFileSync(file);
  if (data.length >= 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return [data.readUInt32BE(16), data.readUInt32BE(20)];
  }
  if (data.length > 4 && data[0] === 0xff && data[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < data.length) {
      if (data[offset++] !== 0xff) continue;
      while (data[offset] === 0xff) offset++;
      const marker = data[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) continue;
      const size = data.readUInt16BE(offset);
      if (size < 2 || offset + size > data.length) break;
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return [data.readUInt16BE(offset + 5), data.readUInt16BE(offset + 3)];
      }
      offset += size;
    }
  }
  throw new Error('Expected a valid JPEG or PNG screenshot with readable dimensions');
}

const pages = new Map(htmlFiles(root).map(file => [file, readFileSync(file, 'utf8')]));
const schemas = new Map();
const guideMetadata = { title: new Map(), description: new Map(), canonical: new Map() };
let marketingCount = 0;
let checkedLinks = 0;
for (const [file, html] of pages) {
  const marketing = tags(html, 'body').some(body => classes(body.class).includes('marketing-page'));
  if (!marketing) continue;
  marketingCount++;
  schemas.set(file, schemaNodes(html, file));
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  for (const tag of markup.matchAll(/<[a-z][^>]*>/gi)) {
    const attributes = attrs(tag[0]);
    for (const attribute of ['href', 'src']) {
      const value = attributes[attribute];
      if (!value || value.startsWith('#')) continue;
      try {
        const url = new URL(value, documentUrl(file));
        if (url.origin !== origin) continue;
        checkedLinks++;
        check(Boolean(localTarget(url)), file, `Missing local ${attribute} target: ${value}`);
      } catch (error) { check(false, file, `Invalid ${attribute} "${value}": ${error.message}`); }
    }
  }
  if (!relative(root, file).startsWith(`guides${sep}`)) continue;
  const title = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(match => decode(match[1]).trim());
  const description = tags(html, 'meta').filter(meta => meta.name?.toLowerCase() === 'description').map(meta => meta.content?.trim());
  const canonical = tags(html, 'link').filter(link => classes(link.rel).includes('canonical')).map(link => link.href);
  for (const [field, values] of Object.entries({ title, description, canonical })) {
    check(values.length === 1 && Boolean(values[0]), file, `Expected exactly one non-empty ${field}; found ${values.length}`);
    if (!values[0]) continue;
    const value = values[0].replace(/\s+/g, ' ').toLowerCase();
    const previous = guideMetadata[field].get(value);
    check(!previous, file, `Duplicate ${field}${previous ? ` also in ${relative(root, previous)}` : ''}`);
    guideMetadata[field].set(value, file);
  }
  check(canonical[0] === documentUrl(file), file, `Canonical must match ${documentUrl(file)}`);
}

let previewCount = 0;
for (const guide of guides) {
  const file = resolve(root, 'guides', guide.slug, 'index.html');
  const html = pages.get(file);
  check(Boolean(html), file, 'Missing generated guide; run node scripts/build-guides.mjs');
  if (!html) continue;
  const articles = (schemas.get(file) || []).filter(node => [].concat(node['@type'] || []).includes('Article'));
  check(articles.length === 1, file, `Expected one Article schema; found ${articles.length}`);
  if (articles[0]) {
    const article = articles[0];
    check(article.datePublished === (guide.published || published), file, 'Article datePublished differs from source publication date');
    check(article.dateModified === (guide.modified || guide.published || published), file, 'Article dateModified differs from source revision date');
    check(article.headline === guide.title && article.description === guide.description, file, 'Article headline/description differs from source');
    check(article.url === documentUrl(file), file, 'Article URL differs from guide URL');
  }
  const previews = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/gi)]
    .filter(match => classes(attrs(match[1]).class).includes('guide-app-preview'));
  check(previews.length === (guide.appPreview ? 1 : 0), file, `Expected ${guide.appPreview ? 'one' : 'no'} app preview; found ${previews.length}`);
  if (!guide.appPreview || previews.length !== 1) continue;
  previewCount++;
  const preview = appPreviews[guide.topic];
  check(Boolean(preview), file, `No preview source for topic ${guide.topic}`);
  if (!preview) continue;
  const app = apps[guide.topic];
  const previewHtml = previews[0][2];
  const stores = tags(previewHtml, 'a').filter(link => link['data-placement'] === 'guide-preview');
  const expected = [app.apple, app.google].filter(Boolean).sort();
  check(JSON.stringify(stores.map(link => link.href).sort()) === JSON.stringify(expected), file, 'App preview store URLs do not match the app catalogue');
  check(stores.every(link => link['data-app'] === app.slug), file, 'App preview links identify the wrong app');
  const screenshots = tags(previewHtml, 'img');
  check(screenshots.length === (preview.image ? 1 : 0), file, 'App preview screenshot count differs from source');
  if (!preview.image || screenshots.length !== 1) continue;
  const screenshot = screenshots[0];
  check(screenshot.src === preview.image && Boolean(screenshot.alt?.trim()), file, 'App preview screenshot source or alt text is missing/incorrect');
  check(Number(screenshot.width) === preview.width && Number(screenshot.height) === preview.height && preview.width > 0 && preview.height > 0, file, 'App preview screenshot dimensions differ from source');
  try {
    const asset = localTarget(new URL(screenshot.src, documentUrl(file)));
    if (!asset) throw new Error(`Missing screenshot ${screenshot.src}`);
    const [width, height] = imageSize(asset);
    check(width === Number(screenshot.width) && height === Number(screenshot.height), file, `Screenshot dimensions ${screenshot.width}×${screenshot.height} differ from actual ${width}×${height}`);
  } catch (error) { check(false, file, error.message); }
}

const sitemapFile = resolve(root, 'sitemap.xml');
const sitemap = readFileSync(sitemapFile, 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(match => decode(match[1]));
const sitemapSet = new Set(sitemapUrls);
check(/<urlset\b/.test(sitemap) && /<\/urlset>/.test(sitemap) && sitemapUrls.length > 0, sitemapFile, 'Expected a non-empty sitemap urlset');
check(sitemapSet.size === sitemapUrls.length, sitemapFile, 'Sitemap contains duplicate URLs');
for (const location of sitemapUrls) {
  try {
    const url = new URL(location);
    check(url.origin === origin && !url.search && !url.hash, sitemapFile, `Non-canonical sitemap URL: ${location}`);
    const target = localTarget(url);
    check(Boolean(target), sitemapFile, `URL does not resolve to a file: ${location}`);
    const html = target && pages.get(target);
    if (html) check(!tags(html, 'meta').some(meta => ['robots', 'googlebot'].includes(meta.name?.toLowerCase()) && /\bnoindex\b/i.test(meta.content || '')), sitemapFile, `Noindex route is in sitemap: ${location}`);
  } catch (error) { check(false, sitemapFile, `Invalid URL ${location}: ${error.message}`); }
}
for (const [file] of pages) {
  if (relative(root, file).startsWith(`guides${sep}`)) check(sitemapSet.has(documentUrl(file)), sitemapFile, `Missing generated guide URL: ${documentUrl(file)}`);
}

if (errors.length) {
  console.error(`Marketing validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n${errors.map(error => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Marketing validation passed: ${marketingCount} pages, ${guides.length} articles, ${previewCount} app previews, ${checkedLinks} local references, ${sitemapSet.size} sitemap URLs.`);
}
