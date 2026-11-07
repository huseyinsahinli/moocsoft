import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fourFoursSolutions } from '../content/four-fours.mjs';
import { guides } from '../content/index.mjs';
import { sources } from '../content/apps.mjs';
import { relatedGuides } from '../content/related-guides.mjs';

const root = resolve(new URL('..', import.meta.url).pathname);

function evaluate(expression) {
  const tokens = expression.match(/\d+|[()+*/-]/g) ?? [];
  assert.equal(tokens.join(''), expression.replace(/\s+/g, ''), `Unexpected token in ${expression}`);
  let cursor = 0;
  function atom() {
    if (tokens[cursor] === '+') { cursor++; return atom(); }
    if (tokens[cursor] === '-') { cursor++; return -atom(); }
    if (tokens[cursor] === '(') {
      cursor++;
      const value = sum();
      assert.equal(tokens[cursor++], ')', `Unclosed parentheses in ${expression}`);
      return value;
    }
    const token = tokens[cursor++];
    assert.equal(token, '4', `Only separate digit-4 tokens are allowed in ${expression}`);
    return 4;
  }
  function product() {
    let value = atom();
    while (tokens[cursor] === '*' || tokens[cursor] === '/') {
      const operator = tokens[cursor++], right = atom();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }
  function sum() {
    let value = product();
    while (tokens[cursor] === '+' || tokens[cursor] === '-') {
      const operator = tokens[cursor++], right = product();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }
  const value = sum();
  assert.equal(cursor, tokens.length, `Unparsed tokens in ${expression}`);
  assert.equal(tokens.filter(token => token === '4').length, 4, `Expected exactly four 4s in ${expression}`);
  return value;
}

assert.equal(fourFoursSolutions.length, 12);
for (const { target, expression } of fourFoursSolutions) assert.equal(evaluate(expression), target, expression);
assert.equal(fourFoursSolutions.find(row => row.target === 24).expression, '(4 * 4) + 4 + 4');

const guide = guides.find(item => item.slug === 'four-fours-make-24-puzzle');
assert(guide, 'Four-fours article is registered');
assert.equal(guide.published, '2026-11-07');
assert.equal(guide.topic, 'math');
assert.equal(guide.editorialFormat, 'puzzle');
assert.equal(guide.appPreview, true);
assert.equal(guide.showToolAction, false);
assert.deepEqual(guide.sources, ['mathStore', 'mathGoogleStore']);
assert(guide.sources.every(key => sources[key]));
assert.equal(relatedGuides(guide, guides).length, 3);
assert.equal(new Set(relatedGuides(guide, guides).map(item => item.slug)).size, 3);

const html = readFileSync(resolve(root, 'guides/four-fours-make-24-puzzle/index.html'), 'utf8');
const source = readFileSync(resolve(root, 'content/math-practice.mjs'), 'utf8');
const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
assert.match(html, /<h1>Four 4s Puzzle: Make 24 and Solve 11 More Targets<\/h1>/);
assert.match(html, /\(4 × 4\) \+ 4 \+ 4 = 24/);
assert.match(html, /class="four-fours-flow"/);
assert.match(html, /AI-generated editorial illustration/);
assert.match(html, /application\/ld\+json/);
assert.match(html, /https:\/\/apps\.apple\.com\/app\/math-riddles-brain-games\/id6449851642/);
assert.match(html, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.moocsoft\.math_puzzle/);
assert.match(html, /This four-fours worksheet is original website practice, not an app level/);
assert.match(source, /href="\/guides\/four-fours-make-24-puzzle\/"/);
assert.match(sitemap, /<loc>https:\/\/moocsoft\.net\/guides\/four-fours-make-24-puzzle\/<\/loc>/);
assert.doesNotMatch(html, /four-fours-make-24-puzzle\/print/);

console.log('PASS: independently evaluated all 12 exact-four-4 expressions; article metadata, official store links, puzzle boundaries, shared illustration, reciprocal discovery and sitemap verified.');
