import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { apps, site, published } from '../content/apps.mjs';
import { browserTools } from '../content/tools.mjs';
import { selectToolPicks, toolPicks } from '../content/discovery.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, '.' + path, 'index.html'), 'utf8');
const graphs = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .flatMap(match => { const data = JSON.parse(match[1]); return data['@graph'] || [data]; });

for (const [topic, app] of Object.entries(apps)) {
  const picks = selectToolPicks(guides, topic);
  assert.equal(picks.length, 3);
  assert.equal(new Set(picks.map(g => g.slug)).size, 3);
  assert(picks.every(g => g.topic === topic));
  const html = read(`/tools/${app.tool}/`);
  const block = html.match(/<section class="(?:wrap )?guide-inline-resources" style="--guide-accent:[^"]+">([\s\S]*?)<\/section>/)[1];
  for (const guide of picks) {
    assert(block.includes(`href="/guides/${guide.slug}/"`));
    assert(existsSync(resolve(root, `guides/${guide.slug}/index.html`)));
  }
  assert(!block.includes(`href="/tools/${app.tool}/"`), 'Next action must not lead back to the same tool');
  assert(block.includes(`href="/guides/${topic}/"`));
  assert(block.includes(`href="/${app.slug}/"`));
  assert(html.includes('data-placement="header"'), 'Existing app download header remains');
  const first = toolPicks[topic][0];
  assert.throws(() => selectToolPicks(guides.filter(g => g.slug !== first), topic), /Missing/);
  assert.throws(() => selectToolPicks(guides.map(g => g.slug === first ? { ...g, topic: 'development' } : g), topic), /Wrong topic/);
}
assert.throws(() => selectToolPicks(guides, 'development'), /Unknown tool/);
for (const tool of browserTools) {
  const html = read(tool.path);
  const trails = graphs(html).filter(node => node['@type'] === 'BreadcrumbList');
  assert.equal(trails.length, 1, tool.path);
  assert.deepEqual(trails[0].itemListElement.map(item => item.item), [site + '/', site + '/tools/', site + tool.path]);
  assert.deepEqual(trails[0].itemListElement.map(item => item.position), [1, 2, 3]);
  assert(html.includes('href="/tools/"') && html.includes('href="/"'));
  assert(html.includes(`<link rel="canonical" href="${site}${tool.path}">`));
}
for (const guide of guides) {
  const article = graphs(read(`/guides/${guide.slug}/`)).find(node => node['@type'] === 'Article');
  assert.equal(article.datePublished, guide.published || published);
  assert.equal(article.dateModified, guide.modified || guide.published || published);
}
for (const [path, heading] of [
  ['/tools/savings-goal-calculator/', 'Savings Goal Calculator'],
  ['/tools/app-brief-builder/', 'Mobile App Brief Builder'],
  ['/savings-goal-tracker/', 'Frugal Savings<br>Goal Tracker'],
  ['/hire-flutter-developer/', 'Freelance Flutter Developer for iOS and Android'],
]) assert(read(path).includes(`<h1>${heading}</h1>`));
const service = read('/hire-flutter-developer/');
assert(service.includes('not client projects or testimonials'));
for (const path of ['/savings-goal-tracker/', '/did-you-lift/', '/nutrilens/', '/guides/compare-flutter-app-development-quotes/']) {
  assert(service.includes(`href="${path}"`));
  assert(existsSync(resolve(root, '.' + path, 'index.html')));
}
console.log('PASS: relevant tool reading paths, invalid selections, one breadcrumb trail per tool, article dates, descriptive landing headings and real portfolio links.');
