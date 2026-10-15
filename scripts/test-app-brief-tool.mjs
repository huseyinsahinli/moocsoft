import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { briefFields, normalizeText, validateBrief, formatBrief, initializeBriefTool } = require('../assets/app-brief-tool.js');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = { userProblem: 'Members need to find the next meeting.', workflow: 'Open the meeting.\nRecord a response.', feature1: 'Show the next meeting', feature2: 'Record attendance', feature3: '', platform: 'undecided', dataNeeds: 'Shared meeting. Offline response behavior is undecided.', materials: '', constraints: '' };
assert.equal(briefFields.length, 9);
assert.equal(briefFields.filter(field => /^feature/.test(field.key)).length, 3);
assert.equal(new Set(briefFields.map(field => field.key)).size, briefFields.length);
assert.equal(normalizeText('  A\r\nB\rC\u2028D\u2029E  '), 'A\nB\nC\nD\nE');
for (const input of [undefined, null, 42, [], {}]) assert.equal(validateBrief(input).ok, false);
assert.equal(validateBrief(fixture).ok, true);
const formatted = formatBrief(fixture);
assert(formatted.startsWith('MOBILE APP PROJECT BRIEF\nA first-conversation draft'));
assert(formatted.includes('Open the meeting.\nRecord a response.'));
assert(formatted.includes('1. Show the next meeting\n2. Record attendance'));
assert(!formatted.includes('\n3. \n'));
assert(formatted.includes('Undecided — discuss platform priorities.'));
assert(formatted.includes('Not specified — discuss available designs'));
assert(formatted.includes('Not specified — agree priorities'));
assert(!/\$|\bweeks?\b|\bdeadline\b/.test(formatted), 'Formatting must not invent a budget or delivery date');
for (const [platform, expected] of [['ios', 'iOS'], ['android', 'Android'], ['both', 'iOS and Android']]) assert(formatBrief({ ...fixture, platform }).includes('\n4. TARGET PLATFORMS\n' + expected + '\n'));
for (const platform of ['', 'web', 'iOS', 'javascript:alert(1)', null]) assert.equal(validateBrief({ ...fixture, platform }).ok, false);
for (const field of briefFields.filter(field => field.max)) {
  assert.equal(validateBrief({ ...fixture, [field.key]: 'x'.repeat(field.max) }).ok, true, field.key + ' at limit');
  assert.equal(validateBrief({ ...fixture, [field.key]: 'x'.repeat(field.max + 1) }).ok, false, field.key + ' over limit');
  assert.equal(formatBrief({ ...fixture, [field.key]: 'x'.repeat(field.max + 1) }), null);
}
for (const field of briefFields.filter(field => field.required && field.max)) assert.equal(validateBrief({ ...fixture, [field.key]: '   ' }).ok, false, field.key);
assert.equal(validateBrief({ ...fixture, feature1: 'First\nSecond' }).ok, false, 'Three controls cannot become an unlimited multiline feature list');
assert.equal(validateBrief({ ...fixture, workflow: 'Step one\nStep two' }).ok, true, 'Workflow line breaks are useful plain text');
assert.equal(validateBrief({ ...fixture, workflow: 'A\u0000B' }).ok, false);
const hostile = '<img src=x onerror=alert(1)> & "quoted"';
assert(formatBrief({ ...fixture, userProblem: hostile }).includes(hostile), 'Hostile-looking input remains literal text, not markup');
assert(!formatted.includes('?') && !formatted.includes('mailto:'), 'The generated source URL carries no private input');

// Exercise stale output, validation and export safeguards without a browser dependency.
function element(value = '') {
  return { hidden: true, value, textContent: '', dataset: {}, attrs: {}, events: {}, disabled: true, focused: false, selected: false,
    addEventListener(type, fn) { this.events[type] = fn; },
    setAttribute(name, value) { this.attrs[name] = value; }, removeAttribute(name) { delete this.attrs[name]; },
    focus() { this.focused = true; }, select() { this.selected = true; },
    emit(type) { let prevented = false; const result = this.events[type]({ preventDefault() { prevented = true; } }); return { result, prevented }; },
  };
}
const entries = Object.fromEntries(briefFields.map(field => [field.key, { input: element(fixture[field.key]), error: element() }]));
const form = element(), section = element(), output = element(), status = element(), outputStatus = element(), copy = element(), download = element(), reset = element();
form.querySelector = selector => {
  const match = selector.match(/^\[data-brief-(field|error)="([^"]+)"\]$/);
  return match ? entries[match[2]][match[1] === 'field' ? 'input' : 'error'] : null;
};
form.reset = () => { for (const key of Object.keys(entries)) entries[key].input.value = key === 'platform' ? 'undecided' : ''; };
const fakeDocument = { querySelector(selector) { return {
  '[data-app-brief-form]': form, '[data-app-brief-result]': section, '[data-app-brief-output]': output,
  '[data-app-brief-status]': status, '[data-app-brief-output-status]': outputStatus,
  '[data-app-brief-copy]': copy, '[data-app-brief-download]': download, '[data-app-brief-reset]': reset,
}[selector]; } };
let copied = [], fileTexts = [], links = [], revoked = [];
const fakeBrowser = { navigator: { clipboard: { writeText: async text => copied.push(text) } },
  Blob: function (parts, options) { fileTexts.push({ parts, options }); },
  URL: { createObjectURL: () => 'blob:local-brief', revokeObjectURL: url => revoked.push(url) },
  setTimeout(fn) { fn(); },
};
fakeDocument.createElement = () => {
  const link = { click() { this.clicked = true; }, remove() { this.removed = true; } };
  links.push(link); return link;
};
fakeDocument.body = { appendChild(link) { link.appended = true; } };
initializeBriefTool(fakeDocument, fakeBrowser);
assert.equal(form.hidden, false);
assert.equal(form.dataset.briefReady, 'true');
const originalHandler = form.events.submit;
initializeBriefTool(fakeDocument, fakeBrowser);
assert.equal(form.events.submit, originalHandler, 'Initialization is idempotent');
assert.equal(form.emit('submit').prevented, true);
assert.equal(output.value, formatted);
assert.equal(section.hidden, false);
assert.equal(copy.disabled, false);
assert.equal(download.disabled, false);
assert.equal(output.focused, true);
await copy.emit('click').result;
assert.deepEqual(copied, [formatted]);
assert.match(outputStatus.textContent, /Brief copied/);
download.emit('click');
assert.equal(links.length, 1);
assert.deepEqual(fileTexts[0], { parts: [formatted], options: { type: 'text/plain;charset=utf-8' } });
assert.equal(links[0].download, 'mobile-app-project-brief.txt');
assert.equal(links[0].href, 'blob:local-brief');
assert(links[0].clicked && links[0].removed && links[0].appended);
assert.deepEqual(revoked, ['blob:local-brief']);
entries.workflow.input.value = 'Revised workflow'; entries.workflow.input.emit('input');
assert.equal(output.value, ''); assert.equal(section.hidden, true); assert(copy.disabled && download.disabled);
await copy.emit('click').result; download.emit('click');
assert.equal(copied.length, 1); assert.equal(links.length, 1, 'Stale output cannot be exported');
assert.match(status.textContent, /Generate a fresh brief/);
entries.userProblem.input.value = ''; form.emit('submit');
assert.equal(entries.userProblem.input.attrs['aria-invalid'], 'true');
assert.equal(entries.userProblem.input.focused, true);
assert.equal(output.value, ''); assert(copy.disabled && download.disabled);
entries.userProblem.input.value = hostile; entries.userProblem.input.emit('input'); form.emit('submit');
assert(output.value.includes(hostile));
fakeBrowser.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
await copy.emit('click').result;
assert.equal(output.selected, true);
assert.match(outputStatus.textContent, /selected.*Copy command/);
reset.emit('click');
assert.equal(output.value, ''); assert.equal(section.hidden, true); assert(copy.disabled && download.disabled);
assert(briefFields.every(field => entries[field.key].input.value === (field.key === 'platform' ? 'undecided' : '')));
assert(briefFields.every(field => entries[field.key].error.textContent === '' && !entries[field.key].input.attrs['aria-invalid']));
initializeBriefTool({ querySelector() { return null; } });

const html = readFileSync(resolve(root, 'tools/app-brief-builder/index.html'), 'utf8');
assert.match(html, /<link rel="canonical" href="https:\/\/moocsoft\.net\/tools\/app-brief-builder\/">/);
assert.match(html, /<form data-app-brief-form hidden novalidate/);
assert.match(html, /<textarea class="brief-output"[^>]*readonly/);
assert.match(html, /<noscript>/);
assert.match(html, /id="blank-checklist"/);
assert.match(html, /id="worked-example"/);
assert.match(html, /fictional planning example, not a customer project/);
assert(!/class="app-install|class="install-link|play\.google\.com|apps\.apple\.com|mailto:|<form[^>]*\baction=/.test(html));
for (const field of briefFields) {
  assert(html.includes(`data-brief-field="${field.key}"`));
  assert(html.includes(`data-brief-error="${field.key}"`));
  assert(html.includes(`for="brief-${field.key}"`));
  if (field.max) assert(html.includes(`maxlength="${field.max}"`));
}
for (const href of ['/hire-flutter-developer/', '/contact/', '/guides/mobile-app-mvp-checklist/', '/guides/mobile-app-handover-checklist/', '/guides/offline-first-flutter-app-local-storage-cloud-sync/']) assert(html.includes(`href="${href}"`));
const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1])['@graph'];
assert.deepEqual(graph.map(node => node['@type']), ['WebPage', 'BreadcrumbList']);
assert.equal(graph[0].url, 'https://moocsoft.net/tools/app-brief-builder/');
const client = readFileSync(resolve(root, 'assets/app-brief-tool.js'), 'utf8');
assert(!/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie|\.innerHTML\s*=|URLSearchParams|location\./.test(client));
assert(!/gtag|analytics|sendBeacon|window\.open|mailto:/.test(client));
console.log('PASS: app brief fields, limits, line breaks, literal hostile text, deterministic formatting, validation, local download/copy fallback, stale-output safeguards and static service-only metadata.');
