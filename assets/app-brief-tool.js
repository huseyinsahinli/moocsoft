(function () {
  'use strict';

  const briefFields = Object.freeze([
    { key: 'userProblem', label: 'Intended user and problem', max: 600, required: true },
    { key: 'workflow', label: 'One key workflow', max: 900, required: true },
    { key: 'feature1', label: 'Must-have feature 1', max: 240, required: true, singleLine: true },
    { key: 'feature2', label: 'Must-have feature 2', max: 240, singleLine: true },
    { key: 'feature3', label: 'Must-have feature 3', max: 240, singleLine: true },
    { key: 'platform', label: 'Target platforms', choices: ['undecided', 'ios', 'android', 'both'], required: true },
    { key: 'dataNeeds', label: 'Data and offline needs', max: 700, required: true },
    { key: 'materials', label: 'Existing materials', max: 600 },
    { key: 'constraints', label: 'Constraints and open questions', max: 600 },
  ]);
  const platformLabels = Object.freeze({ undecided: 'Undecided — discuss platform priorities.', ios: 'iOS', android: 'Android', both: 'iOS and Android' });

  function normalizeText(value) {
    return typeof value === 'string' ? value.replace(/\r\n?|\u2028|\u2029/g, '\n').trim() : '';
  }

  function validateBrief(input) {
    const source = input && typeof input === 'object' ? input : {};
    const values = {}, errors = {};
    for (const field of briefFields) {
      const value = normalizeText(source[field.key]);
      values[field.key] = value;
      if (field.choices && !field.choices.includes(value)) errors[field.key] = 'Choose iOS, Android, both, or undecided.';
      else if (field.required && !value) errors[field.key] = `Add ${field.label.toLowerCase()}. “Undecided” is fine when you do not know yet.`;
      else if (field.max && value.length > field.max) errors[field.key] = `Keep this field to ${field.max} characters or fewer.`;
      else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) errors[field.key] = 'Remove unsupported control characters from this field.';
      else if (field.singleLine && value.includes('\n')) errors[field.key] = 'Use one short feature per field, with up to three features in total.';
    }
    return { ok: Object.keys(errors).length === 0, values, errors };
  }

  function formatBrief(input) {
    const checked = validateBrief(input);
    if (!checked.ok) return null;
    const value = checked.values;
    const features = ['feature1', 'feature2', 'feature3'].map(key => value[key]).filter(Boolean);
    return [
      'MOBILE APP PROJECT BRIEF',
      'A first-conversation draft, not an estimate or agreed specification.',
      '', '1. INTENDED USER AND PROBLEM', value.userProblem,
      '', '2. ONE KEY WORKFLOW', value.workflow,
      '', '3. MUST-HAVE FEATURES', ...features.map((feature, index) => `${index + 1}. ${feature}`),
      '', '4. TARGET PLATFORMS', platformLabels[value.platform],
      '', '5. DATA AND OFFLINE NEEDS', value.dataNeeds,
      '', '6. EXISTING MATERIALS', value.materials || 'Not specified — discuss available designs, code and service documentation.',
      '', '7. CONSTRAINTS AND OPEN QUESTIONS', value.constraints || 'Not specified — agree priorities and unresolved decisions before estimating.',
      '', 'NEXT CONVERSATION',
      '- Define a visible completion check for each included feature.',
      '- Agree what is deferred, who reviews the work and what delivery means.',
      '- Discuss ownership, testing, release and handover responsibilities.',
      '- Arrange any necessary access separately; do not include secrets or customer data in this brief.',
      '', 'Created with the free Moocsoft app brief builder.',
      'https://moocsoft.net/tools/app-brief-builder/',
    ].join('\n');
  }

  function initializeBriefTool(root, environment) {
    const form = root.querySelector('[data-app-brief-form]');
    if (!form || form.dataset.briefReady === 'true') return;
    const section = root.querySelector('[data-app-brief-result]');
    const output = root.querySelector('[data-app-brief-output]');
    const status = root.querySelector('[data-app-brief-status]');
    const outputStatus = root.querySelector('[data-app-brief-output-status]');
    const copy = root.querySelector('[data-app-brief-copy]');
    const download = root.querySelector('[data-app-brief-download]');
    const reset = root.querySelector('[data-app-brief-reset]');
    const fields = briefFields.map(definition => ({ definition,
      input: form.querySelector(`[data-brief-field="${definition.key}"]`),
      error: form.querySelector(`[data-brief-error="${definition.key}"]`),
    }));
    if (!section || !output || !status || !outputStatus || !copy || !download || !reset || fields.some(field => !field.input || !field.error)) return;
    const browser = environment || (typeof window !== 'undefined' ? window : {});
    let generated = null, revision = 0;
    function clearErrors() {
      fields.forEach(field => { field.error.textContent = ''; field.input.removeAttribute('aria-invalid'); });
    }
    function invalidate() {
      const hadOutput = generated !== null;
      revision++;
      generated = null;
      output.value = '';
      section.hidden = true;
      copy.disabled = download.disabled = true;
      outputStatus.textContent = '';
      clearErrors();
      status.textContent = hadOutput ? 'Your draft changed. Generate a fresh brief before copying or downloading.' : '';
    }
    fields.forEach(field => {
      field.input.addEventListener('input', invalidate);
      field.input.addEventListener('change', invalidate);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      invalidate();
      const input = Object.fromEntries(fields.map(field => [field.definition.key, field.input.value]));
      const checked = validateBrief(input);
      if (!checked.ok) {
        for (const field of fields) if (checked.errors[field.definition.key]) {
          field.error.textContent = checked.errors[field.definition.key];
          field.input.setAttribute('aria-invalid', 'true');
        }
        const count = Object.keys(checked.errors).length;
        status.textContent = `Please review ${count} ${count === 1 ? 'field' : 'fields'} before generating your brief.`;
        fields.find(field => checked.errors[field.definition.key]).input.focus();
        return;
      }
      generated = formatBrief(checked.values);
      output.value = generated;
      section.hidden = false;
      copy.disabled = download.disabled = false;
      status.textContent = 'Your brief is ready below. It has not been sent or saved by Moocsoft.';
      outputStatus.textContent = 'Review the text, then copy or download it if you choose.';
      output.focus();
    });
    copy.addEventListener('click', async function () {
      if (generated === null || copy.disabled) return;
      const text = generated, generation = revision;
      try {
        if (!browser.navigator || !browser.navigator.clipboard || typeof browser.navigator.clipboard.writeText !== 'function') throw new Error('Clipboard unavailable');
        await browser.navigator.clipboard.writeText(text);
        if (generation === revision && generated === text) outputStatus.textContent = 'Brief copied. Nothing was sent to Moocsoft.';
      } catch (_) {
        if (generation !== revision || generated !== text) return;
        output.focus(); output.select();
        outputStatus.textContent = 'Automatic copying is unavailable. The brief is selected: use your device’s Copy command.';
      }
    });
    download.addEventListener('click', function () {
      if (generated === null || download.disabled) return;
      if (typeof browser.Blob !== 'function' || !browser.URL || typeof browser.URL.createObjectURL !== 'function') {
        output.focus(); output.select();
        outputStatus.textContent = 'This browser cannot create a text download. The brief is selected so you can copy it manually.';
        return;
      }
      const url = browser.URL.createObjectURL(new browser.Blob([generated], { type: 'text/plain;charset=utf-8' }));
      const link = root.createElement('a');
      link.href = url;
      link.download = 'mobile-app-project-brief.txt';
      link.hidden = true;
      root.body.appendChild(link);
      link.click(); link.remove();
      browser.setTimeout(() => browser.URL.revokeObjectURL(url), 1000);
      outputStatus.textContent = 'Text download requested. The file is created in your browser, not uploaded.';
    });
    reset.addEventListener('click', function () {
      invalidate();
      form.reset();
      status.textContent = 'Planning fields cleared. No draft is saved here.';
      fields[0].input.focus();
    });
    form.dataset.briefReady = 'true';
    form.hidden = false;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { briefFields, normalizeText, validateBrief, formatBrief, initializeBriefTool };
  if (typeof document !== 'undefined') initializeBriefTool(document);
}());
