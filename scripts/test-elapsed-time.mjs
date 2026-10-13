import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import elapsedGuides, { timePractice } from '../content/math-elapsed-time.mjs';
import { guides } from '../content/index.mjs';
import { site, sources } from '../content/apps.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');
const [guide] = elapsedGuides;
assert.equal(elapsedGuides.length, 1);
assert.equal(guide.slug, 'elapsed-time-across-midnight');
assert.equal(guide.topic, 'math');
assert.equal(guide.editorialFormat, 'puzzle');
assert.equal(guide.published, '2026-10-13');
assert.equal(guide.showToolAction, false);
assert.equal(guides.filter(item => item.slug === guide.slug).length, 1);

// Verify the illustrative intervals using fixed UTC timestamps rather than
// importing an article calculation helper or repeating its midnight formula.
const stamp = (clock, nextDay = false) => {
  assert.match(clock, /^\d{2}:\d{2}$/);
  const [hours, minutes] = clock.split(':').map(Number);
  assert(hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60);
  return Date.UTC(2026, 9, nextDay ? 14 : 13, hours, minutes);
};
assert.equal(timePractice.length, 5);
for (const [index, row] of timePractice.entries()) {
  if (row.durationMinutes !== undefined) {
    assert.equal(row.durationMinutes, 185);
    assert.equal(stamp(row.start) + row.durationMinutes * 60000, stamp(row.end));
    assert.equal(row.end, '11:30');
  } else {
    const measured = (stamp(row.end, row.nextDay) - stamp(row.start)) / 60000;
    assert.equal(measured, [95, 95, 75, 215][index]);
    assert.equal(row.answerMinutes, measured);
    if (row.breakMinutes !== undefined) {
      assert.equal(row.breakMinutes, 25);
      assert.equal(row.netMinutes, measured - row.breakMinutes);
      assert.equal(row.netMinutes, 190);
    }
  }
}
assert.equal(95, 1 * 60 + 35);
assert.equal(1.35 * 60, 81);
assert(Math.abs(95 / 60 - (1 + 35 / 60)) < 1e-12);

const html = read(`guides/${guide.slug}/index.html`);
assert(html.includes(`<link rel="canonical" href="${site}/guides/${guide.slug}/">`));
assert(html.includes(`<title>${guide.title} | Moocsoft</title>`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.headline, guide.title);
assert.equal(article.datePublished, '2026-10-13');
assert.equal(article.dateModified, '2026-10-13');
assert.equal(article.inLanguage, 'en');
assert.equal(article.url, `${site}/guides/${guide.slug}/`);
for (const key of guide.sources) assert(html.includes(sources[key][1]));
assert(guide.sources.includes('nistTimeOfDay') && guide.sources.includes('mathStore'));
assert(html.includes('id6449851642') && html.includes('com.moocsoft.math_puzzle'));
assert(html.includes('utm_campaign=guides-elapsed-time-across-midnight'));
const recommendations = createRelatedGuideSelector(guides)(guide.slug);
assert.equal(recommendations.length, 3);
assert(recommendations.every(item => item.topic === 'math'));
for (const file of ['guides/math/index.html', 'guides/index.html', 'guides/mental-math-games-for-adults/index.html']) assert(read(file).includes(`/guides/${guide.slug}/`));
assert(read('sitemap.xml').includes(`<loc>${site}/guides/${guide.slug}/</loc>`));
assert.equal(guides.find(item => item.slug === 'mental-math-games-for-adults').published, '2026-09-22');
assert.equal(guides.find(item => item.slug === 'mental-math-games-for-adults').modified, undefined);
console.log('PASS: independent timestamp solutions for five original elapsed-time problems, decimal-hours distinction, dated metadata, references, app attribution and reciprocal discovery.');
