// Tests an original educational ledger, not a bank account or Frugal implementation.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import reconciliationGuides, { reconciliationExample as example } from '../content/savings-reconciliation.mjs';
import { guides } from '../content/index.mjs';
import { published, site, sources, escape } from '../content/apps.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = reconciliationGuides;
const route = `/guides/${guide.slug}/`;
assert.equal(reconciliationGuides.length, 1);
assert.equal(guide.slug, 'reconcile-savings-tracker-balance');
assert.equal(guide.topic, 'savings');
assert.equal(guide.published, '2026-10-25');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false, 'The contribution planner is not a reconciliation tool');
assert.deepEqual(guide.startAction, ['#step-2', 'Check the worked reconciliation ↓']);
assert.equal(guides.filter(row => row.slug === guide.slug).length, 1);
assert.deepEqual(guides.filter(row => row.published === '2026-10-25').map(row => row.slug), [guide.slug], 'Only one new guide today');
assert.equal(guides.filter(row => row.published === '2026-10-24').length, 0, 'Do not backdate a catch-up guide');

// Fixed independent expectations guard against a fixture and its displayed sum drifting together.
assert.equal(example.openingCents, 42000);
assert.deepEqual(example.verified.map(row => [row.date, row.reference, row.depositCents, row.withdrawalCents, row.closingCents]), [
  ['2026-10-05', 'D-05', 8500, 0, 50500],
  ['2026-10-11', 'W-11', 0, 3000, 47500],
  ['2026-10-19', 'D-19', 4500, 0, 52000],
]);
assert.deepEqual(example.draft.map(row => [row.date, row.reference, row.depositCents, row.withdrawalCents, row.closingCents]), [
  ['2026-10-05', 'D-05', 8500, 0, 50500],
  ['2026-10-05', 'D-05', 8500, 0, 59000],
  ['2026-10-19', 'D-19', 4500, 0, 63500],
]);
const balanceAfter = rows => {
  let balance = 42000;
  for (const row of rows) {
    for (const cents of [row.depositCents, row.withdrawalCents, row.closingCents]) assert(Number.isSafeInteger(cents) && cents >= 0);
    balance += row.depositCents - row.withdrawalCents;
    assert.equal(balance, row.closingCents, row.reference);
  }
  return balance;
};
assert.equal(balanceAfter(example.verified), 52000);
assert.equal(balanceAfter(example.draft), 63500);
assert.equal(example.verified.reduce((sum, row) => sum + row.depositCents, 0), 13000);
assert.equal(example.verified.reduce((sum, row) => sum + row.withdrawalCents, 0), 3000);
assert.equal(8500 + 4500 - 3000, 10000, 'New deposits and retained net change are different');
assert.equal(63500 - 52000, 11500);
assert.deepEqual(example.correction.map(row => [row.key, row.amountCents]), [
  ['draft', 63500], ['duplicate', -8500], ['missing', -3000], ['corrected', 52000],
]);
assert.equal(63500 - 8500, 55000);
assert.equal(55000 - 3000, 52000);
assert.equal(63500 - 8500 - 3000, 42000 + 8500 - 3000 + 4500);
assert.equal(42000 + 6000, 48000, 'Re-entering pre-opening activity inflates the opening amount');
const uncompletedPlanCents = 7500;
assert.equal(52000 + 0 * uncompletedPlanCents, 52000, 'An uncompleted plan contributes zero to actual savings');
assert.deepEqual(example.allocation, { beforeCents: [30000, 22000], moveCents: 7000, afterCents: [23000, 29000] });
assert.equal(30000 - 7000, 23000);
assert.equal(22000 + 7000, 29000);
assert.equal(30000 + 22000, 23000 + 29000);
assert.equal(30000 + 29000, 59000, 'A one-sided allocation change invents an additional $70');
assert.equal(example.coveredAccountCents, 76000);
assert.equal(example.otherPurposeCents, 24000);
assert.equal(example.coveredAccountCents - example.otherPurposeCents, 52000);
assert.equal(52000 - 20000 + 20000, 52000, 'An internal move of already assigned money changes location, not the covered total');

const html = read(`guides/${guide.slug}/index.html`);
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(`<title>${escape(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
assert(html.includes(`<meta name="description" content="${escape(guide.description)}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(row => row['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-25');
assert.equal(article.dateModified, '2026-10-25');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, site + route);
assert.deepEqual(article.image, [site + editorialPhotos.savings.src]);
assert(graph.some(row => row['@type'] === 'BreadcrumbList'));
for (const tag of ['property="og:image"', 'name="twitter:image"']) assert(html.includes(`${tag} content="${site}${editorialPhotos.savings.src}"`));
assert.equal((html.match(/src="\/assets\/editorial\/savings.jpg"/g) || []).length, 1);
assert(html.includes('width="1200" height="675"'));
for (const width of [480, 800, 1200]) assert(html.includes(`/assets/editorial/savings-${width}.webp ${width}w`));
assert(html.includes(escape(editorialPhotos.savings.alt)));
assert(html.includes('AI-generated editorial illustration; not an app screenshot or a customer record.'));

const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
assert.equal(tables.length, 3);
assert.deepEqual(tables.map(table => (table.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].match(/<tr>/g) || []).length), [4, 4, 2]);
assert(tables[0].includes('2026-10-01') && tables[0].includes('2026-10-11') && tables[0].includes('$520.00'));
assert(tables[1].includes('$635.00') && !tables[1].match(/<tbody>([\s\S]*?)<\/tbody>/)[1].includes('W-11'));
assert(tables[2].includes('$230.00') && tables[2].includes('$290.00'));
assert.equal((html.match(/class="savings-reconciliation-flow"/g) || []).length, 1);
assert.deepEqual([...html.matchAll(/data-reconcile-step="([^"]+)"/g)].map(match => match[1]), ['draft', 'duplicate', 'missing', 'corrected']);
assert(html.includes('Original HTML reconciliation: $635.00 − $85.00 − $30.00 = $520.00.'));
assert(html.includes('Invented records for teaching, not a Frugal screen, customer incident or recovered money.'));

for (const phrase of [
  'Preserve the current tracking record before correcting it.',
  'Do not uninstall an app or erase its data',
  'Identical dates and amounts alone would not prove',
  'checked against the evidence',
  'leave the difference unresolved',
  'not a reported Frugal bug',
  'not an instruction to transfer money',
  'a scheduled $75 contribution that has not happened is still a plan',
  'Moving $200 of money already assigned',
  'not a verified in-app goal-transfer feature',
  'not automatic transaction matching, an app import',
  'not a bank reconciliation or automatic transaction matching',
  'does not require a bank connection, hold money or execute transfers',
  'without a bank connection',
  'ads and limits', 'Premium', 'PDF/Excel exports',
  'does not create savings, guarantee account accuracy or recover missing funds',
]) assert(html.includes(escape(phrase)), phrase);
assert(html.includes('between two accounts that are both included in your record'));
assert(html.includes('no fee and that both sides of the movement are accounted for'));
assert(html.includes('A transfer crossing the boundary of what you track is different'));
assert(html.includes('an opening balance') || html.includes('opening amount'));
assert.equal((html.match(/aria-label="Copyable savings reconciliation note"/g) || []).length, 1);
for (const [, body] of guide.sections) assert(!/<form\b|<input\b|<script\b|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(body));
assert(!/<script[^>]+src="https?:\/\//i.test(html), 'No third-party analytics or other remote script is introduced');

assert.deepEqual(guide.sources, ['accountStatements', 'savings', 'savingsStore', 'savingsGoogleStore']);
for (const key of guide.sources) assert(html.includes(escape(sources[key][1])), key);
assert.equal(new URL(sources.accountStatements[1]).hostname, 'mycreditunion.gov');
assert.equal(new URL(sources.savings[1]).hostname, 'www.consumerfinance.gov');
assert(html.includes('src="/assets/apps/frugal/goals.png"'));
assert(html.includes('Official iPhone store screenshot'));
for (const placement of ['header', 'guide-preview', 'article-end']) {
  const anchors = [...html.matchAll(new RegExp(`<a[^>]*data-app="savings-goal-tracker"[^>]*data-placement="${placement}"[^>]*href="([^"]+)"`, 'g'))];
  assert.equal(anchors.length, 2, placement);
  const urls = anchors.map(match => new URL(match[1].replaceAll('&amp;', '&')));
  assert(urls.some(url => url.hostname === 'apps.apple.com' && url.pathname.endsWith('/id6450431254')));
  const play = urls.find(url => url.hostname === 'play.google.com');
  assert.equal(play.searchParams.get('id'), 'com.moocsoft.goal_tracker');
  assert.equal(play.searchParams.get('utm_source'), 'moocsoft');
  assert.equal(play.searchParams.get('utm_medium'), 'referral');
  assert.equal(play.searchParams.get('utm_campaign'), 'guides-' + guide.slug);
  assert.equal(play.searchParams.get('utm_content'), placement);
}
assert(!html.includes('Open the free 52-week'), 'A contribution schedule is not a reconciliation calculator');
for (const [question, answer] of guide.faq) assert(html.includes(escape(question)) && html.includes(escape(answer)));
assert.deepEqual(createRelatedGuideSelector(guides)(guide).map(row => row.slug), [
  'savings-goal-tracker-app-vs-spreadsheet', 'track-multiple-savings-goals', 'sinking-funds-vs-emergency-fund',
]);
for (const file of ['guides/index.html', 'guides/savings/index.html', 'guides/sinking-funds-vs-emergency-fund/index.html']) assert(read(file).includes(route), file);
const incoming = guides.find(row => row.slug === 'sinking-funds-vs-emergency-fund');
assert.equal(incoming.published, undefined, 'Keep the original fallback publication date');
assert.equal(incoming.published || published, '2026-09-12');
assert.equal(incoming.modified, undefined, 'Adding a contextual link must not reset an older article date');
assert(incoming.sections.find(([heading]) => heading === 'Do a short monthly reconciliation')[1].includes(route));
const incomingHtml = read('guides/sinking-funds-vs-emergency-fund/index.html');
const incomingGraph = JSON.parse(incomingHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const incomingArticle = incomingGraph.find(row => row['@type'] === 'Article');
assert.equal(incomingArticle.datePublished, '2026-09-12');
assert.equal(incomingArticle.dateModified, '2026-09-12');
const sitemap = read('sitemap.xml');
const sitemapEntry = sitemap.match(new RegExp(`<url>\\s*<loc>${site}${route}</loc>([\\s\\S]*?)<\\/url>`))?.[1];
assert(sitemapEntry);
assert(sitemapEntry.includes('<lastmod>2026-10-25</lastmod>'));
const sitemapImages = [...sitemapEntry.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(match => match[1]);
assert.deepEqual(sitemapImages, [site + editorialPhotos.savings.src, site + '/assets/apps/frugal/goals.png']);
console.log('PASS: independent cent-based ledger/correction/allocation arithmetic, scoped transfer and opening-balance boundaries, honest native visual/evidence, current Frugal stores/attribution, original dates and reciprocal discovery.');
