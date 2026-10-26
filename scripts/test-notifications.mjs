// Independent editorial fixtures and generated-page checks, not mobile notification tests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides } from '../content/index.mjs';
import { notificationChoices, meetingSequence, notificationChecks } from '../content/development-notifications.mjs';
import { sources, site, escape } from '../content/apps.mjs';
import { editorialPhotos } from '../content/editorial-media.mjs';
import { createRelatedGuideSelector } from '../content/related-guides.mjs';
import { guideHref } from '../content/topics.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
const slug = 'local-vs-push-notifications';
const route = `/guides/${slug}/`;
const guide = guides.find(item => item.slug === slug);
assert(guide);
assert.equal(guides.filter(item => item.slug === slug).length, 1);
assert.equal(guide.topic, 'development');
assert.equal(guide.editorialFormat, 'decision');
assert.equal(guide.published, '2026-10-26');
assert.equal(guide.modified, undefined);
assert.equal(guide.appPreview, undefined);
assert.equal(guide.showToolAction, false);
assert.deepEqual(guide.startAction, ['#step-2', 'Compare four notification decisions ↓']);
assert.deepEqual(guides.filter(item => item.published === '2026-10-26').map(item => item.slug), [slug], 'One new English guide for this Istanbul date');

// Literal expectations are separate from the article data and table generator.
const expectedChoices = [
  ['A personal reading reminder chosen on this phone', 'The phone already has the time and message.', 'Start with a local notification.', 'Define editing, cancellation and the intended time-zone behavior.'],
  ['A club organizer changes a shared meeting time', 'The organizer’s service owns the new time.', 'Use a remote update path; push can draw attention to it.', 'Keep the current meeting available in the app even if no alert is seen.'],
  ['A known reminder that must also change from another device', 'The current schedule is shared, not just local.', 'Synchronize the schedule; choose how each device alerts.', 'Decide which device should notify and how stale local requests are replaced.'],
  ['A countdown shown only while the screen is open', 'The active screen knows the remaining time.', 'An in-app display may be enough.', 'Specify separately whether anything should happen after leaving the screen.'],
];
const expectedSequence = [
  ['1. Original record', 'The service stores meeting M-42, revision 1, starting at 19:00.', 'An alert may refer to this version; it is not a permanent copy of the meeting’s truth.'],
  ['2. Organizer edits', 'The service accepts revision 2, starting at 18:30.', 'The authoritative time is now 18:30, whether or not an update alert has arrived.'],
  ['3. An older alert remains', 'A participant still sees a notification saying 19:00.', 'Do not infer that the service reverted to revision 1 or that the participant read the change.'],
  ['4. Participant taps online', 'The app opens M-42 and successfully retrieves the current record.', 'Show revision 2 at 18:30; do not overwrite it with the old notification text.'],
  ['5. Participant taps offline', 'The app can only open its cached revision 1.', 'Label it last known / not refreshed. Do not claim that 19:00 is confirmed current.'],
];
const expectedChecks = [
  ['Permission declined', 'Choose a reminder but decline notification access.', 'The underlying record remains usable; the app explains that alerts are unavailable.'],
  ['Local reminder edited or completed', 'Change the scheduled time, then complete the task before it is due.', 'Replace or cancel the associated pending request under the agreed rule; do not leave an obsolete reminder queued.'],
  ['Known reminder, device offline', 'Schedule a local reminder with its content already on the device; disconnect the test device.', 'Observe the actual platform behavior and timing. No new server event is assumed to have reached the phone.'],
  ['Remote change, device offline', 'Update M-42 on the service while the test device is disconnected.', 'The app does not claim the remote change arrived; after reconnection, refresh the record and record any alert separately.'],
  ['App open versus background', 'Repeat the same remote event with the app in each state.', 'Compare the agreed in-app and system presentation; do not count receiving a payload as seeing a banner.'],
  ['Stale or repeated message', 'Use approved test messages for an older revision and a repeated event.', 'Keep the current record; apply the specified stale-message and duplicate-alert rules.'],
  ['Time-zone or clock change', 'Change the test device setting after a reminder is scheduled.', 'Compare with the chosen wall-clock or fixed-instant rule; record the device, setting and actual outcome.'],
];
assert.deepEqual(notificationChoices, expectedChoices);
assert.deepEqual(meetingSequence, expectedSequence);
assert.deepEqual(notificationChecks, expectedChecks);
const minutes = clock => {
  assert.match(clock, /^\d{2}:\d{2}$/);
  const [hour, minute] = clock.split(':').map(Number);
  assert(hour < 24 && minute < 60);
  return hour * 60 + minute;
};
assert.equal(minutes('19:00'), 1140);
assert.equal(minutes('18:30'), 1110);
assert.equal(minutes('19:00') - minutes('18:30'), 30, 'Same-date, same-zone change is thirty minutes earlier');
assert.match(meetingSequence[3][2], /revision 2 at 18:30; do not overwrite/);
assert.match(meetingSequence[4][2], /last known \/ not refreshed/);

const html = read(`guides/${slug}/index.html`);
assert.equal((html.match(/<h1>/g) || []).length, 1);
assert(html.includes(`<title>${escape(guide.title)} | Moocsoft</title>`));
assert(html.includes(`<link rel="canonical" href="${site}${route}">`));
assert(html.includes(`<meta name="description" content="${escape(guide.description)}">`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
const article = graph.find(item => item['@type'] === 'Article');
assert.equal(article.url, site + route);
assert.equal(article.headline, guide.title);
assert.equal(article.description, guide.description);
assert.equal(article.datePublished, '2026-10-26');
assert.equal(article.dateModified, '2026-10-26');
assert.equal(article.articleSection, 'Mobile app development');
assert.equal(article.inLanguage, 'en');
assert.deepEqual(article.image, [site + editorialPhotos.development.src]);
const breadcrumbs = graph.find(item => item['@type'] === 'BreadcrumbList');
assert.equal(breadcrumbs.itemListElement.at(-1).item, site + route);
for (const tag of ['property="og:image"', 'name="twitter:image"']) assert(html.includes(`${tag} content="${site}${editorialPhotos.development.src}"`));
assert.equal((html.match(/src="\/assets\/editorial\/development.jpg"/g) || []).length, 1);
assert(html.includes('width="1200" height="675"'));
for (const width of [480, 800, 1200]) assert(html.includes(`/assets/editorial/development-${width}.webp ${width}w`));
assert(html.includes(escape(editorialPhotos.development.alt)));
assert(html.includes('AI-generated editorial illustration; not an app screenshot or a customer record.'));

const tables = [...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map(match => match[1]);
assert.equal(tables.length, 3);
const expectedRows = [expectedChoices, expectedSequence, expectedChecks.map(row => [...row, 'Untested'])];
for (let i = 0; i < tables.length; i++) {
  const tbody = tables[i].match(/<tbody>([\s\S]*?)<\/tbody>/)[1];
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(match => [...match[1].matchAll(/<(?:td|th)\b[^>]*>([\s\S]*?)<\/(?:td|th)>/g)].map(cell => cell[1]));
  assert.deepEqual(rows, expectedRows[i].map(row => row.map(escape)), `Visible literal table ${i + 1}`);
}
assert.equal((tables[2].match(/<td>Untested<\/td>/g) || []).length, 7);
assert.equal((html.match(/class="notification-routes"/g) || []).length, 1);
assert.deepEqual([...html.matchAll(/data-notification-route="([^"]+)"/g)].map(match => match[1]), ['local', 'remote']);
const flow = html.match(/<figure class="notification-routes">([\s\S]*?)<\/figure>/)[1];
assert.equal((flow.match(/<li>/g) || []).length, 6);
for (const phrase of [
  'Original HTML planning diagram, not an app screen or a measured delivery trace.',
  'the paths can be combined', 'Neither path proves that a person saw or read an alert',
  'same date in the same named meeting time zone', '30 minutes earlier, not a time-zone conversion',
  'The two tap rows are alternative test conditions', 'not a claim about an existing app',
  'not itself a complete synchronization policy', 'Do not use arrival order as a database version rule',
  'it does not guarantee delivery before that limit', 'For ordinary, non-exempt app notifications',
  'not a blanket description of every background data message', 'Scheduling capabilities are a separate question',
  'do not display a visible notification by default', 'Do not infer reading from a successful send response',
  'does not promise to recall an alert already displayed', 'a wall-clock preference',
  'an identifier in a notification is not authorization', 'not a delivery benchmark',
  'This web page sends no notifications and asks for no browser notification permission',
]) assert(html.includes(escape(phrase)), `Preserve honest boundary: ${phrase}`);
assert(html.includes('aria-label="Discuss a Flutter project"'));
assert(html.includes('href="/hire-flutter-developer/"'));
assert(!html.includes('class="app-install"'));
assert(!html.includes('class="guide-app-preview"'));
assert(!html.includes('data-placement="article-end"'));
assert(!html.includes('SoftwareApplication'));
assert(!html.includes('href="/tools/app-brief-builder/"'), 'Explicit comparison anchor replaces a competing tool action');
assert.equal(guide.faq.length, 6);
for (const [question, answer] of guide.faq) assert(html.includes(escape(question)) && html.includes(escape(answer)));
for (const [, body] of guide.sections) assert(!/<form\b|<input\b|<script\b|requestPermission\s*\(|new Notification\b|serviceWorker\s*\.|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/.test(body));
assert(!/<script[^>]+src="https?:\/\//i.test(html));

assert.deepEqual(guide.sources, ['appleLocalNotifications', 'appleRemoteNotifications', 'applePushDelivery', 'androidNotificationPermission', 'androidAlarmScheduling', 'firebaseFlutterReceiving', 'firebaseMessageLifespan']);
for (const key of guide.sources) {
  assert(sources[key]);
  assert(html.includes(escape(sources[key][1])), key);
  assert(['developer.apple.com', 'developer.android.com', 'firebase.google.com'].includes(new URL(sources[key][1]).hostname));
}
assert.deepEqual(createRelatedGuideSelector(guides)(slug).map(guideHref), [
  '/guides/mobile-app-backend-decision/', '/guides/offline-first-flutter-app-local-storage-cloud-sync/', '/guides/mobile-app-mvp-checklist/',
]);
const incoming = guides.find(item => item.slug === 'mobile-app-mvp-checklist');
assert.equal(incoming.published, '2026-10-09');
assert.equal(incoming.modified, undefined);
assert(incoming.sections.find(([heading]) => heading === 'Choose platforms and check integrations')[1].includes(`href="${route}"`));
const incomingHtml = read('guides/mobile-app-mvp-checklist/index.html');
assert(incomingHtml.includes(`href="${route}"`));
const incomingArticle = JSON.parse(incomingHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'].find(item => item['@type'] === 'Article');
assert.equal(incomingArticle.datePublished, '2026-10-09');
assert.equal(incomingArticle.dateModified, '2026-10-09');
for (const file of ['guides/development/index.html', 'guides/index.html']) assert(read(file).includes(`href="${route}"`));
const sitemapEntry = read('sitemap.xml').match(new RegExp(`<url>\\s*<loc>${site}${route}</loc>([\\s\\S]*?)<\\/url>`))?.[1];
assert(sitemapEntry);
assert(sitemapEntry.includes('<lastmod>2026-10-26</lastmod>'));
assert.deepEqual([...sitemapEntry.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(match => match[1]), [site + editorialPhotos.development.src]);
console.log('PASS: four independent notification decisions, five versioned states, seven explicitly untested cases, same-zone time arithmetic, native routes, honest delivery boundaries, primary sources, service-only CTAs, original dates/photo and reciprocal discovery.');
