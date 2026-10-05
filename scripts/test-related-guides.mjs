import assert from 'node:assert/strict';
import { guides } from '../content/index.mjs';
import {
  createRelatedGuideSelector,
  relatedGuideMap,
  relatedGuides,
  validateRelatedGuides,
} from '../content/related-guides.mjs';

assert.equal(validateRelatedGuides(guides), true);
assert.deepEqual(Object.keys(relatedGuideMap).sort(), guides.map(guide => guide.slug).sort());
const select = createRelatedGuideSelector(guides);
for (const guide of guides) {
  const choices = select(guide);
  assert.equal(choices.length, 3, guide.slug);
  assert.equal(new Set(choices.map(choice => choice.slug)).size, 3, guide.slug);
  assert(choices.every(choice => choice !== guide && choice.slug !== guide.slug), guide.slug);
  assert(choices.every(choice => choice.topic === guide.topic), guide.slug);
  assert(choices.every(choice => guides.includes(choice)), guide.slug);
  assert.deepEqual(choices.map(choice => choice.slug), relatedGuideMap[guide.slug], guide.slug);
  assert.deepEqual(relatedGuides(guide, guides), choices, guide.slug);
  assert.deepEqual(select(guide.slug), choices, guide.slug);
}

// Catalogue order must not replace the editorial order of the next reads.
const reversed = createRelatedGuideSelector([...guides].reverse());
for (const guide of guides) assert.deepEqual(reversed(guide), select(guide), guide.slug);

// Check a few intent-specific paths in addition to the structural guarantees.
assert.equal(select('reverse-52-week-savings-challenge')[0].slug, '52-week-savings-challenge');
assert.equal(select('estimate-calories-from-food-photo')[0].slug, 'estimate-portion-size-from-food-photo');
assert.equal(select('missing-number-puzzles-with-answers')[0].slug, 'how-to-solve-number-pattern-puzzles');

const cloneMap = () => Object.fromEntries(Object.entries(relatedGuideMap).map(([slug, choices]) => [slug, [...choices]]));
const current = guides[0];
const assertBadMapping = (change, message) => {
  const mapping = cloneMap();
  change(mapping);
  assert.throws(() => validateRelatedGuides(guides, mapping), message);
  assert.throws(() => createRelatedGuideSelector(guides, mapping), message);
};

assertBadMapping(mapping => { delete mapping[current.slug]; }, /missing curated mapping/);
assertBadMapping(mapping => { mapping['removed-article'] = [...mapping[current.slug]]; }, /stale mapping/);
assertBadMapping(mapping => { mapping[current.slug][0] = 'removed-article'; }, /stale target/);
assertBadMapping(mapping => { mapping[current.slug][0] = current.slug; }, /self-link/);
assertBadMapping(mapping => { mapping[current.slug][1] = mapping[current.slug][0]; }, /duplicate choice/);
assertBadMapping(mapping => { mapping[current.slug][0] = guides.find(guide => guide.topic !== current.topic).slug; }, /wrong-topic choice/);
assertBadMapping(mapping => { mapping[current.slug].pop(); }, /exactly three/);
assertBadMapping(mapping => { mapping[current.slug].push('calories-vs-macros'); }, /exactly three/);
assertBadMapping(mapping => { mapping[current.slug] = 'estimate-portion-size-from-food-photo'; }, /exactly three/);

assert.throws(() => validateRelatedGuides([...guides, current]), /duplicate catalogue slug/);
assert.throws(() => validateRelatedGuides([...guides, { slug: 'missing-topic' }]), /needs a slug and topic/);
assert.throws(() => validateRelatedGuides(guides.slice(1)), /stale mapping/);
assert.throws(() => select('unknown-article'), /unknown guide/);
assert.throws(() => select({ ...current, topic: 'other' }), /topic mismatch/);

// A future guide fails publication until an editor provides its own choices.
const futureGuide = { slug: 'future-food-guide', topic: current.topic, title: 'Future Food Guide' };
const expanded = [...guides, futureGuide];
assert.throws(() => createRelatedGuideSelector(expanded), /missing curated mapping.*future-food-guide/);
const expandedMap = cloneMap();
expandedMap[futureGuide.slug] = [...relatedGuideMap[current.slug]];
const expandedSelect = createRelatedGuideSelector(expanded, expandedMap);
assert.deepEqual(expandedSelect(futureGuide).map(guide => guide.slug), expandedMap[futureGuide.slug]);

// Configuration and returned choices cannot be accidentally reordered in place.
assert(Object.isFrozen(relatedGuideMap));
assert(Object.values(relatedGuideMap).every(Object.isFrozen));
assert(Object.isFrozen(select(current)));

console.log(`Related guides passed: ${guides.length} deliberately mapped articles, three same-topic next reads each, stable order and invalid-configuration failures.`);
