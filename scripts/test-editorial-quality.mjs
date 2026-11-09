import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { guides } from '../content/index.mjs';
import { apps, published } from '../content/apps.mjs';
import { appPreviews } from '../content/app-previews.mjs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const revised = ['how-to-save-1000-in-a-year', 'biweekly-savings-plan', 'vacation-savings-goal-plan', 'how-to-track-personal-records-in-gym', 'habit-tracker-ideas', 'food-photo-log', 'math-puzzle-strategies', 'calculate-cigarette-cost-and-savings'];
for (const guide of guides) {
  const html = read(`guides/${guide.slug}/index.html`);
  const toc = html.match(/<aside class="guide-toc"[\s\S]*?<\/aside>/)[0];
  assert(!toc.includes('install-link'), `${guide.slug}: navigation is not another install block`);
  assert(html.includes('href="/editorial-policy/"'), guide.slug);
  assert(html.includes('This guide uses AI assistance.'), guide.slug);
  if (apps[guide.topic]) assert(html.includes('class="app-install"'), `${guide.slug}: original upper store area retained`);
  if (guide.appPreview && !appPreviews[guide.topic].image) assert(!toc.includes('in action'), `${guide.slug}: no unsupported screenshot promise`);
  if (revised.includes(guide.slug)) {
    assert.equal(guide.modified, '2026-11-09');
    assert.equal(guide.published || published, ['food-photo-log', 'calculate-cigarette-cost-and-savings'].includes(guide.slug) ? '2026-09-12' : '2026-09-22');
    assert(html.includes('<table>'), `${guide.slug}: visible worked comparison`);
  } else assert.notEqual(guide.modified, '2026-11-09', `${guide.slug}: no blanket date refresh`);
}
const policy = read('editorial-policy/index.html');
assert(policy.includes('href="https://moocsoft.net/editorial-policy/"'));
assert(policy.includes('"@type":"WebPage"') && !policy.includes('"@type":"Article"'));
assert(policy.includes('href="/contact/"') && policy.includes('AI assistance'));
assert(read('sitemap.xml').includes('<loc>https://moocsoft.net/editorial-policy/</loc>'));
console.log('PASS: all English guides retain publishing identity and app headers, navigation has no duplicate install controls, screenshot labels match assets, only eight substantive revisions change dates, and the correction policy is discoverable.');
