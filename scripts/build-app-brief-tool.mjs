import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { site, escape as e } from '../content/apps.mjs';
import { head, footer } from '../content/components.mjs';

const require = createRequire(import.meta.url);
const { briefFields } = require('../assets/app-brief-tool.js');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = '/tools/app-brief-builder/';
const title = 'Free Mobile App Project Brief Builder & Template';
const description = 'Turn your app idea into a clear project brief: users, one workflow, three must-have features, platforms and data needs. Copy or download locally. No sign-up.';
const graph = [
  { '@type': 'WebPage', name: title, description, url: site + path, inLanguage: 'en', isAccessibleForFree: true,
    publisher: { '@type': 'Organization', name: 'Moocsoft', url: site },
    about: { '@type': 'Thing', name: 'Planning a mobile app development project' } },
  { '@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ['Free tools', '/tools/'], ['App project brief builder', path]].map(([name, target], index) => ({ '@type': 'ListItem', position: index + 1, name, item: site + target })) },
];
const copy = {
  userProblem: ['Who is it for, and what problem should it solve?', 'Describe a type of user and a task, not a real person. Up to 600 characters.', 'For example: Members of a small book club need one place to see the next meeting.'],
  workflow: ['What is the one key workflow?', 'Describe the starting point, actions and useful result. Up to 900 characters.', 'For example: Open the app → see the next meeting → mark whether you can attend.'],
  feature1: ['Must-have feature 1', 'One short feature per field; at most three. Up to 240 characters each.', 'For example: Show the next meeting and its selected book'],
  feature2: ['Must-have feature 2', '', 'For example: Record an attendance response'],
  feature3: ['Must-have feature 3', '', 'For example: Let the organizer update meeting details'],
  platform: ['Which platforms should the first version target?', 'Choose a starting preference, not a promise about scope or cost.', ''],
  dataNeeds: ['What data and offline behavior are needed?', 'Mention one-device or shared data, offline actions and recovery questions. “Undecided” is valid. Up to 700 characters.', 'For example: Meeting details are shared. Previously loaded details should remain readable offline. Sync and account choices are undecided.'],
  materials: ['What materials already exist?', 'Optional. Describe designs, code or documentation without pasting private links, credentials or customer records. Up to 600 characters.', 'For example: A rough screen sketch and a fictional sample meeting'],
  constraints: ['What constraints or open questions matter?', 'Optional. List decisions to discuss; the tool does not estimate a price or delivery date. Up to 600 characters.', 'For example: Decide who can edit meeting details and what happens when someone leaves the club.'],
};
const fields = briefFields.map(field => {
  const [label, hint, placeholder] = copy[field.key];
  const optional = field.required ? '' : ' <span>(optional)</span>';
  const id = 'brief-' + field.key;
  const descriptions = `${hint ? id + '-hint ' : ''}${id}-error`;
  const common = `id="${id}" data-brief-field="${field.key}" aria-describedby="${descriptions}"${field.required ? ' required' : ''}`;
  let control;
  if (field.choices) control = `<select ${common}><option value="undecided">Undecided</option><option value="ios">iOS</option><option value="android">Android</option><option value="both">iOS and Android</option></select>`;
  else if (field.singleLine) control = `<input ${common} type="text" maxlength="${field.max}" autocomplete="off" placeholder="${e(placeholder)}">`;
  else control = `<textarea ${common} rows="4" maxlength="${field.max}" autocomplete="off" placeholder="${e(placeholder)}"></textarea>`;
  return `<div class="brief-field${field.singleLine ? '' : ' brief-field-wide'}"><label for="${id}">${e(label)}${optional}</label>${hint ? `<p class="brief-hint" id="${id}-hint">${e(hint)}</p>` : ''}${control}<p class="brief-field-error" id="${id}-error" data-brief-error="${field.key}"></p></div>`;
}).join('\n');

const html = `${head(title, description, path, graph, undefined, ['app-brief-tool']).replace('class="marketing-page"', 'class="marketing-page app-brief-page"')}
<main id="main-content" class="wrap">
  <div class="breadcrumb" aria-label="Breadcrumb"><a href="/">Moocsoft</a> / <a href="/tools/">Free tools</a> / App project brief builder</div>
  <section class="tool-hero">
    <span class="eyebrow">Free mobile app planning tool · No sign-up</span>
    <h1>Turn an app idea into a brief a developer can discuss.</h1>
    <p class="hero-copy">Start with the user, one useful workflow and up to three must-have features. Generate a readable first-conversation brief, then copy it or download a text file. No price estimate, invented timeline or automatic submission.</p>
    <p class="brief-notice">Your entries stay in this page. They are not sent to Moocsoft or saved between visits. Do not paste passwords, keys, customer data or confidential business information. Review a downloaded or copied brief before sharing it elsewhere.</p>
    <nav class="brief-jump-links" aria-label="App brief page sections"><a href="#brief-builder">Build a brief ↓</a><a href="#blank-checklist">Use the blank checklist ↓</a><a href="#worked-example">Read a fictional example ↓</a></nav>
  </section>
  <section class="panel brief-builder" id="brief-builder" aria-labelledby="brief-builder-title">
    <h2 id="brief-builder-title">A small first version, clearly described.</h2>
    <p>Required fields capture the user, workflow, first feature, platform preference and data questions. You can write “undecided” instead of guessing. Nothing is generated until you choose the button.</p>
    <noscript><p class="brief-notice">Interactive generation needs JavaScript. The complete <a href="#blank-checklist">blank planning checklist</a> and <a href="#worked-example">fictional worked example</a> below work without it. Copy their headings into your own notes.</p></noscript>
    <form data-app-brief-form hidden novalidate aria-label="Build a mobile app project brief">
      <div class="brief-fields">${fields}</div>
      <div class="action-row"><button class="button" type="submit">Generate my brief</button><button class="button secondary" type="button" data-app-brief-reset>Clear all planning fields</button></div>
      <p class="brief-status" data-app-brief-status role="status" aria-live="polite" aria-atomic="true"></p>
    </form>
    <section class="brief-result" data-app-brief-result hidden aria-labelledby="brief-result-title">
      <h3 id="brief-result-title">Your first-conversation brief</h3>
      <p>This is your draft, not a quote, contract or agreed specification. Editing a planning field clears the old output; generate a fresh version before exporting.</p>
      <label class="brief-output-label" for="brief-output">Reviewable plain-text brief</label>
      <textarea class="brief-output" id="brief-output" data-app-brief-output rows="20" readonly spellcheck="false" aria-describedby="brief-output-status"></textarea>
      <div class="action-row"><button class="button" type="button" data-app-brief-copy disabled>Copy brief</button><button class="button secondary" type="button" data-app-brief-download disabled>Download .txt</button></div>
      <p class="brief-status" id="brief-output-status" data-app-brief-output-status role="status" aria-live="polite" aria-atomic="true"></p>
    </section>
  </section>
  <section class="brief-static brief-prose" id="blank-checklist" aria-labelledby="brief-checklist-title">
    <h2 id="brief-checklist-title">A blank mobile app brief checklist</h2>
    <p>You do not need to know the implementation before starting. Separate what the person must accomplish from how the software will be built. Record unknowns rather than silently turning them into requirements.</p>
    <ol>
      <li><strong>User and problem:</strong> Who needs the app? What task is difficult today?</li>
      <li><strong>One workflow:</strong> What is the starting state, what does the user do, and what useful result do they reach?</li>
      <li><strong>Up to three must-haves:</strong> Which features make that workflow usable? Put extra ideas on a separate later list.</li>
      <li><strong>Platforms:</strong> Is the first version for iOS, Android, both or undecided? Note any device-specific needs separately.</li>
      <li><strong>Data and offline needs:</strong> What is recorded, who can access it, and which actions should work without a connection? What needs recovery or transfer?</li>
      <li><strong>Existing materials:</strong> What designs, code, documented services or sample content can be discussed safely?</li>
      <li><strong>Constraints and questions:</strong> What decisions need agreement before scope, price or delivery can be estimated?</li>
    </ol>
    <p>For each included feature, add a visible completion check. “A member can change their response and see the updated value after reopening the meeting” is more useful to review than “attendance works.” The builder organizes your answers; it does not verify feasibility or completeness.</p>
  </section>
  <section class="brief-static" id="worked-example" aria-labelledby="brief-example-title">
    <h2 id="brief-example-title">Worked example: a small book-club app</h2>
    <p>This is a fictional planning example, not a customer project, testimonial or promised feature set.</p>
    <div class="panel brief-example"><dl>
      <dt>User and problem</dt><dd>Members of a small book club need to find the next meeting and reply without searching through a long message thread.</dd>
      <dt>One key workflow</dt><dd>A member opens the app, reads the next meeting’s book and time, marks “attending” or “not attending,” and sees their current response.</dd>
      <dt>Three must-have features</dt><dd>Show the next meeting. Record and update one attendance response per member. Let the organizer update meeting details.</dd>
      <dt>Target platforms</dt><dd>Undecided. Confirm which devices members use before choosing the first release target.</dd>
      <dt>Data and offline needs</dt><dd>Meeting details and responses are shared. Previously loaded details should remain readable offline; whether an offline response can be queued is an open decision. Account and recovery choices are undecided.</dd>
      <dt>Existing materials</dt><dd>A rough screen sketch and fictional sample meeting data. No production credentials or real member records in the brief.</dd>
      <dt>Constraints and open questions</dt><dd>Decide who can edit a meeting, what a member sees after details change, and what happens when someone leaves. Payment, chat and public club discovery are outside this first draft.</dd>
    </dl></div>
  </section>
  <section class="brief-static" aria-labelledby="brief-next-reading-title">
    <h2 id="brief-next-reading-title">Make the next conversation more concrete.</h2>
    <ul class="brief-reading">
      <li><a href="/guides/mobile-app-mvp-checklist/">Mobile app MVP checklist</a> — choose included work and define completion checks before expanding the feature list.</li>
      <li><a href="/guides/offline-first-flutter-app-local-storage-cloud-sync/">Local storage, offline behavior or cloud sync?</a> — separate on-device records, shared data, recovery and conflicting edits.</li>
      <li><a href="/guides/mobile-app-handover-checklist/">Mobile app handover checklist</a> — plan ownership, a fresh build and the next update path.</li>
    </ul>
  </section>
  <section class="brief-service-cta" data-nosnippet aria-labelledby="brief-service-title">
    <span class="eyebrow">From a brief to a project conversation</span>
    <h2 id="brief-service-title">Want to discuss building it with Flutter?</h2>
    <p>Moocsoft offers Flutter mobile app development. Review the service and portfolio, then choose whether to get in touch. The builder never emails your draft or attaches it to a contact link.</p>
    <div class="action-row"><a class="button" href="/hire-flutter-developer/">Explore Flutter development</a><a class="button secondary" href="/contact/">Contact Moocsoft</a></div>
  </section>
</main>
${footer()}
</body>
</html>`;
const target = resolve(root, '.' + path, 'index.html');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, html.replace(/[ \t]+$/gm, '').trimEnd() + '\n');
console.log('Built one free service-only app brief builder with a static checklist and fictional worked example.');
