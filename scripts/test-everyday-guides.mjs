import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { site, sources } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
import { substitutionRecord } from '../content/training-substitution-story.mjs';
import { annualBillsExample } from '../content/savings-annual-bills.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const selectRelated = createRelatedGuideSelector(guides);
const cases = [
  ['log-exercise-substitution-busy-gym', 'training', 'how-to-log-gym-workouts'],
  ['annual-bills-sinking-fund', 'savings', 'sinking-funds-vs-emergency-fund'],
  ['mobile-app-bug-report-template', 'development', 'mobile-app-mvp-checklist'],
];
for (const [slug, topic, incoming] of cases) {
  const guide = guides.find(item => item.slug === slug);
  assert.equal(guides.filter(item => item.slug === slug).length, 1);
  assert.equal(guide.topic, topic);
  assert.equal(guide.published, '2026-10-12');
  const html = read(`guides/${slug}/index.html`);
  assert(html.includes(`<link rel="canonical" href="${site}/guides/${slug}/">`));
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const article = graph.find(item => item['@type'] === 'Article');
  assert.equal(article.headline, guide.title);
  assert.equal(article.description, guide.description);
  assert.equal(article.datePublished, '2026-10-12');
  assert.equal(article.dateModified, '2026-10-12');
  assert.equal(article.inLanguage, 'en');
  assert.equal(article.url, `${site}/guides/${slug}/`);
  assert.equal(graph.filter(item => item['@type'] === 'BreadcrumbList').length, 1);
  for (const key of guide.sources) assert(html.includes(sources[key][1]), key);
  const next = selectRelated(slug);
  assert.equal(next.length, 3);
  assert(next.every(item => item.topic === topic));
  assert(read(`guides/${incoming}/index.html`).includes(`href="/guides/${slug}/"`));
  assert(read(`guides/${topic}/index.html`).includes(`href="/guides/${slug}/"`));
  assert(read('guides/index.html').includes(`href="/guides/${slug}/"`));
  assert(read('sitemap.xml').includes(`<loc>${site}/guides/${slug}/</loc>`));
  assert.equal(html.includes('class="app-install"'), topic !== 'development');
  if (topic === 'development') {
    assert(!html.includes('class="install-link') && !html.includes('SoftwareApplication'));
    assert(html.includes('href="/hire-flutter-developer/"'));
  }
}
const story = read('guides/log-exercise-substitution-busy-gym/index.html');
assert(story.includes('fictional teaching scene, not a customer story'));
assert(story.includes('not an automatic substitution coach'));
assert.equal(substitutionRecord.planned.loadKg, 30);
assert.equal(substitutionRecord.completed.loadPerDumbbellKg, 12);
assert.deepEqual(substitutionRecord.completed.repsPerSide, [8, 8, 7]);
assert(story.includes('both sides matched in this example'));
assert(story.includes('not a promise that an app automatically recognizes substitutions'));
assert(story.includes('Lifetime Premium'));
const savings = read('guides/annual-bills-sinking-fund/index.html');
const review = Date.parse(annualBillsExample.reviewed);
let allocated = 0;
let remaining = 0;
for (const bill of annualBillsExample.bills) {
  assert(bill.deposits.every(date => Date.parse(date) > review && Date.parse(date) < Date.parse(bill.due)));
  assert.equal(new Set(bill.deposits).size, bill.deposits.length);
  allocated += bill.reservedCents;
  remaining += bill.targetCents - bill.reservedCents;
}
assert.equal(allocated, 8400);
assert.equal(remaining, 25200);
assert.equal((annualBillsExample.bills[0].targetCents - annualBillsExample.bills[0].reservedCents) / annualBillsExample.bills[0].deposits.length, 6000);
assert.equal((annualBillsExample.bills[1].targetCents - annualBillsExample.bills[1].reservedCents) / annualBillsExample.bills[1].deposits.length, 3600);
assert.equal(annualBillsExample.nextMembershipCycle.deposits.length, 12);
assert.deepEqual(annualBillsExample.nextMembershipCycle.deposits, [
  '2027-02-01', '2027-03-01', '2027-04-01', '2027-05-01', '2027-06-01', '2027-07-01',
  '2027-08-01', '2027-09-01', '2027-10-01', '2027-11-01', '2027-12-01', '2028-01-01',
]);
assert(annualBillsExample.nextMembershipCycle.deposits.every(date => Date.parse(date) > Date.parse(annualBillsExample.bills[0].due) && Date.parse(date) < Date.parse(annualBillsExample.nextMembershipCycle.due)));
assert.equal((annualBillsExample.nextMembershipCycle.targetCents - annualBillsExample.nextMembershipCycle.reservedCents) / 12, 2000);
for (const phrase of ['not quotes for real products', 'does not hold or transfer funds', 'feature limits', 'require Premium', 'is not imported into the app', 'general education and record-keeping']) assert(savings.includes(phrase), phrase);
const bug = read('guides/mobile-app-bug-report-template/index.html');
for (const phrase of ['Copyable mobile app bug report template', 'fictional example for an invented reading-log app', 'not a bug in a Moocsoft product', 'Do not infer an installed version', 'Do not uninstall an app', 'not a measured failure rate', 'developer investigation step']) assert(bug.includes(phrase), phrase);
assert(bug.includes('href="#step-2"'));
assert.equal(guides.find(item => item.slug === 'how-to-log-gym-workouts').modified, '2026-10-02');
assert.equal(guides.find(item => item.slug === 'sinking-funds-vs-emergency-fund').modified, undefined);
assert.equal(guides.find(item => item.slug === 'mobile-app-mvp-checklist').published, '2026-10-09');
console.log('PASS: three useful everyday/service guides, honest story and app boundaries, dates, metadata, contextual incoming links and sitemap.');
