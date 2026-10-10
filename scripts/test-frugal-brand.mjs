// Website rebrand regression: no account access or network requests.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { apps, site, sources } from '../content/apps.mjs';
import { appPreviews } from '../content/app-previews.mjs';
import { guides } from '../content/index.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
const apple = 'https://apps.apple.com/us/app/frugal-savings-tracker/id6450431254';
const google = 'https://play.google.com/store/apps/details?id=com.moocsoft.goal_tracker';
assert.equal(apps.savings.name, 'Frugal');
assert.equal(apps.savings.slug, 'savings-goal-tracker', 'Keep the indexed product route');
assert.equal(apps.savings.apple, apple);
assert.equal(apps.savings.google, google);
assert.equal(sources.savingsStore[1], apple);
assert.equal(apps.savings.icon, '/assets/apps/frugal/icon.jpg');
assert.match(apps.savings.platform, /Ads and optional Premium/);

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (entry.name.startsWith('.') || ['node_modules', 'content', 'scripts'].includes(entry.name)) return [];
    const name = resolve(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(name) : entry.name.endsWith('.html') ? [name] : [];
  });
}
let checked = 0;
for (const file of htmlFiles(root)) {
  const html = readFileSync(file, 'utf8');
  // Legal pages are deliberately outside the marketing generator/rebrand scope.
  if (!/<body[^>]*class="[^"]*\bmarketing-page\b/.test(html) && !relative(root, file).startsWith('assets/worksheets/')) continue;
  checked++;
  assert(!/Savings Goal Tracker|Saving Goal Tracker/.test(html), `Old visible brand: ${relative(root, file)}`);
  assert(!html.includes('apps.apple.com/us/app/savings-goal-tracker/id6450431254'), `Old store URL: ${file}`);
  assert(!html.includes('/assets/apps/savings-goal-tracker/'), `Old artwork reference: ${file}`);
}
const product = read('savings-goal-tracker/index.html');
assert.match(product, /<title>Frugal: Savings Tracker for iPhone &amp; Android \| Moocsoft<\/title>/);
assert(product.includes(`<link rel="canonical" href="${site}/savings-goal-tracker/">`));
assert(product.includes('app-id=6450431254'));
assert(product.includes('app-id=com.moocsoft.goal_tracker'));
assert(product.includes('utm_campaign=savings-goal-tracker'));
assert(product.includes('Free to download') && product.includes('Ads and feature limits'));
assert(product.includes('does not hold or transfer money'));
assert(product.includes('advertising and usage-data information'));
assert(!/subcategories|add milestones/.test(product), 'Do not imply undocumented current app features');
const graph = JSON.parse(product.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const software = graph.find(item => item['@type'] === 'SoftwareApplication');
assert.equal(software.name, 'Frugal');
assert.equal(software.downloadUrl, apple);
assert.deepEqual(software.sameAs, [apple, google]);
assert.equal(software.url, `${site}/savings-goal-tracker/`);
assert.equal(software.image, `${site}/assets/apps/frugal/icon.jpg`);
for (const name of ['goals', 'progress', 'history']) {
  const image = readFileSync(resolve(root, `assets/apps/frugal/${name}.png`));
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.deepEqual([image.readUInt32BE(16), image.readUInt32BE(20)], [1000, 2173]);
  assert(product.includes(`src="/assets/apps/frugal/${name}.png" width="1000" height="2173"`));
}
const preview = appPreviews.savings;
assert.deepEqual([preview.width, preview.height], [1000, 2173]);
assert.equal(preview.image, '/assets/apps/frugal/goals.png');
assert.match(preview.alt, /emergency fund, summer vacation and laptop/);
assert.match(preview.note, /ads and feature limits/);
assert.match(preview.caption, /require Premium/);
const home = read('index.html');
assert(home.includes('<a href="/savings-goal-tracker/">Frugal</a>'));
assert(home.includes('alt="Frugal app icon"'));
assert(read('tools/52-week-savings-calculator/index.html').includes('Create a goal in Frugal'));
for (const guide of guides.filter(guide => guide.topic === 'savings')) {
  const html = read(`guides/${guide.slug}/index.html`);
  assert(html.includes('Download Frugal'), `Guide install area: ${guide.slug}`);
  assert(html.includes(apple) && html.includes('com.moocsoft.goal_tracker'), `Guide stores: ${guide.slug}`);
  assert(html.includes(`${site}/guides/${guide.slug}/`), `Keep article route: ${guide.slug}`);
}
const sitemap = read('sitemap.xml');
const productEntry = sitemap.match(/<url>\s*<loc>https:\/\/moocsoft\.net\/savings-goal-tracker\/<\/loc>([\s\S]*?)<\/url>/)?.[1];
const lastmod = productEntry?.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/)?.[1];
assert(lastmod && lastmod >= '2026-10-10', 'Product modification date includes the substantive Frugal refresh');
assert(!sitemap.includes('<loc>https://moocsoft.net/frugal/</loc>'), 'Do not duplicate the existing indexed product page');
console.log(`PASS: Frugal branding on ${checked} marketing/worksheet pages; current official assets, store IDs, purchase boundaries and stable SEO routes.`);
