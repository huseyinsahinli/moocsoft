import assert from 'node:assert/strict';
import { apps, escape as e } from '../content/apps.mjs';
import { attributeStoreLinks, canonicalStoreUrl, pageCampaign } from '../content/store-attribution.mjs';

const destination = html => html.match(/href="([^"]*)"/)[1].replaceAll('&amp;', '&');
for (const app of Object.values(apps).filter(app => app.google)) {
  const input = `<a data-placement="calculator-result" href="${e(app.google)}">Google Play</a>`;
  const output = attributeStoreLinks(input, '/guides/example/');
  const url = new URL(destination(output));
  assert.equal(canonicalStoreUrl(url.href), app.google);
  assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
  assert.equal(url.searchParams.get('utm_medium'), 'referral');
  assert.equal(url.searchParams.get('utm_campaign'), 'guides-example');
  assert.equal(url.searchParams.get('utm_content'), 'calculator-result');
  assert.equal(attributeStoreLinks(output, '/guides/example/'), output);
  assert.equal(new URL(destination(attributeStoreLinks(output, '/'))).searchParams.get('utm_campaign'), 'home');
}
for (const input of [
  `<a href="${apps.nutrition.apple}">App Store</a>`,
  '<a href="/nutrilens/">Features</a>',
  '<a href="https://play.google.com/store/apps/dev?id=123">Developer</a>',
  '<a href="https://play.google.com/store/apps/details?id=com.example.unrelated">Other app</a>',
  `<script type="application/ld+json">${JSON.stringify({ downloadUrl: apps.nutrition.google })}</script>`,
  `<a data-href="${apps.nutrition.google}" href="https://example.com/">Not a store link</a>`,
  `<!-- <a href="${apps.nutrition.google}">Not displayed</a> -->`,
  `<script>const example = '<a href="${apps.nutrition.google}">Example</a>';</script>`,
]) assert.equal(attributeStoreLinks(input, '/'), input);
assert.equal(pageCampaign('/tools/calorie-macro-calculator/'), 'tools-calorie-macro-calculator');
console.log('Store attribution passed: five Play destinations, idempotence, public page/placement labels and untouched canonical schema/other destinations.');
