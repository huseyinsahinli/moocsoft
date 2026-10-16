import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const html = read('savings-goal-tracker/index.html');
const toolPath = '/tools/savings-goal-calculator/';
const finalCta = html.match(/<section class="wrap final-cta">([\s\S]*?)<\/section>/)?.[1];
const usingFrugal = html.match(/<section class="wrap guide-inline-resources"><span class="guide-kicker">Using Frugal<\/span>([\s\S]*?)<\/section>/)?.[1];
assert(finalCta && usingFrugal, 'Both product-to-planning entry points remain discoverable');
assert(finalCta.includes(`<a class="store-btn secondary" href="${toolPath}">Calculate contributions for your goal</a>`));
assert(!finalCta.includes('/tools/52-week-savings-calculator/'), 'The target-based CTA uses the target-based tool');
assert(usingFrugal.includes(`Use the separate <a href="${toolPath}">free savings goal calculator</a>`));
assert(usingFrugal.includes('subtract money already set aside from your target'));
assert(usingFrugal.includes('future deposits you choose'));
assert(usingFrugal.includes('This website plan is not automatically imported into Frugal.'));
assert(usingFrugal.includes('does not hold money or execute bank transfers'));
assert.equal(html.split(`href="${toolPath}"`).length - 1, 2);
assert(html.includes('href="/tools/52-week-savings-calculator/">Try the free 52-week savings calculator'), 'The shared savings-challenge resource is preserved');
assert(existsSync(resolve(root, '.' + toolPath, 'index.html')));
const tool = read('.' + toolPath + 'index.html');
assert(tool.includes('This free website tool does not select calendar dates'));
assert(tool.includes('not a Frugal export or an automatic import'));
assert(tool.includes('Currency changes the label only'));
assert(tool.includes('Unlimited goals and exports require Premium'));
assert(html.includes('<link rel="canonical" href="https://moocsoft.net/savings-goal-tracker/">'));
assert(html.includes('Ads and feature limits'));
assert(html.includes('PDF and Excel exports · Premium'));
assert(html.includes('Frugal records the amounts you enter; it does not hold or transfer money.'));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const app = graph.find(item => item['@type'] === 'SoftwareApplication');
assert.equal(app.name, 'Frugal');
assert.equal(app.url, 'https://moocsoft.net/savings-goal-tracker/');
assert.equal(app.downloadUrl, 'https://apps.apple.com/us/app/frugal-savings-tracker/id6450431254');
assert.deepEqual(app.sameAs, ['https://apps.apple.com/us/app/frugal-savings-tracker/id6450431254', 'https://play.google.com/store/apps/details?id=com.moocsoft.goal_tracker']);
const storeHrefs = [...html.matchAll(/<a\b[^>]*href="([^\"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&')).filter(href => href.startsWith('https://apps.apple.com/') || href.startsWith('https://play.google.com/'));
assert(storeHrefs.length >= 6, 'Existing app download choices remain available');
for (const href of storeHrefs) {
  const url = new URL(href);
  if (url.hostname === 'apps.apple.com') assert.match(url.pathname, /id6450431254$/);
  else {
    assert.equal(url.searchParams.get('id'), 'com.moocsoft.goal_tracker');
    assert.equal(url.searchParams.get('utm_source'), 'moocsoft');
    assert.equal(url.searchParams.get('utm_campaign'), 'savings-goal-tracker');
  }
}
assert(!/<form\b|<script\b[^>]*\bsrc=/.test(html), 'Discovery links introduce no new form, account step or client script');
console.log('PASS: Frugal goal-calculator discovery in final CTA and explanatory copy, retained challenge route, correct app identity/stores and explicit separate free-web/Premium boundaries.');
