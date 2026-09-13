// Run against a local static server with the development-only Playwright package.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4183';
const slugs = ['quit-smoking-calculator-guide', 'quit-smoking-cravings-plan', 'prepare-for-your-quit-date', 'quit-smoking-at-work'];

(async () => {
  const browser = await chromium.launch({headless:true, channel:'chrome'});
  try {
    const context = await browser.newContext({timezoneId:'UTC', viewport:{width:390,height:844}});
    await context.route('https://fonts.googleapis.com/**', route => route.abort());
    await context.route('https://fonts.gstatic.com/**', route => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-09-13T12:00:00Z'));
    await page.goto(base + '/tools/quit-smoking-savings-calculator/');
    const submit = () => page.locator('#quit-form button[type="submit"]').click();
    const hidden = () => page.locator('#result-content').isHidden();
    await page.locator('#quit-date').fill('2026-09-10T00:00');
    await page.locator('#per-day').fill('10');
    await submit();
    assert.equal(await page.locator('#money-saved').innerText(), '$17.50');
    assert.equal(await page.locator('#cigarettes-avoided').innerText(), '35');
    assert.equal(await page.locator('#time-reclaimed').innerText(), '2 hours');
    for (const [days, expected] of [[7,'$35.00'],[30,'$150.00'],[90,'$450.00'],[365,'$1,825.00']]) {
      assert.equal(await page.locator(`[data-projection-days="${days}"]`).innerText(), expected);
    }
    await page.locator('#savings-outlook').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    if (process.env.MOOCSOFT_QA_DIR) await page.screenshot({path:process.env.MOOCSOFT_QA_DIR + '/savings-mobile.png'});

    await page.locator('#currency').selectOption('GBP');
    assert(await hidden(), 'Changed inputs must hide stale results');
    assert(await page.locator('#savings-outlook').isHidden());
    await submit();
    assert.equal(await page.locator('#money-saved').innerText(), '£17.50');
    await page.locator('#quit-date').fill('2026-09-14T00:00');
    await submit();
    assert.match(await page.locator('#form-error').innerText(), /not in the future/);
    assert(await hidden());
    await page.locator('#quit-date').fill('2026-09-13T12:00');
    await submit();
    assert.equal(await page.locator('#money-saved').innerText(), '£0.00');
    await page.locator('#pack-price').fill('0');
    await submit();
    assert(await hidden());
    await page.locator('#pack-price').fill('10');
    await page.locator('#per-day').fill('201');
    await submit();
    assert(await hidden(), 'Maximum daily-use limit must be enforced');
    await page.locator('#per-day').fill('10');
    await page.locator('#quit-date').fill('');
    await submit();
    assert(await hidden(), 'Missing date must not produce a result');
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    console.log('PASS: exact arithmetic, four projections, currency, future/empty dates, zero values, bounds and stale-result handling.');

    for (const slug of slugs) {
      await page.goto(base + '/guides/' + slug + '/');
      const a = page.locator('.app-install .install-link');
      assert.match(await a.getAttribute('href'), /id6747658536$/);
      const bounds = await a.boundingBox();
      assert(bounds.y >= 0 && bounds.y + bounds.height < 200);
      assert.equal(await page.locator('time').getAttribute('datetime'), '2026-09-13');
      const article = await page.locator('script[type="application/ld+json"]').textContent();
      assert.equal(JSON.parse(article)['@graph'][0].datePublished, '2026-09-13');
      assert.equal(await page.locator('link[rel="icon"]').count(), 3);
      assert.equal(await page.locator('h1').count(), 1);
    }
    await page.goto(base + '/guides/quitting/');
    assert.equal(await page.locator('.guide-card').count(), 8);
    await page.goto(base + '/guides/calculate-cigarette-cost-and-savings/');
    assert.equal(await page.locator('time').getAttribute('datetime'), '2026-09-12');
    for (const [file, type] of [['/favicon.ico', /image\//], ['/assets/brand/favicon.svg', /image\/svg\+xml/], ['/assets/brand/favicon-96.png', /image\/png/], ['/apple-touch-icon.png', /image\/png/]]) {
      const response = await context.request.get(base + file);
      assert.equal(response.status(), 200);
      assert.match(response.headers()['content-type'], type);
    }
    assert.deepEqual(errors, []);
    console.log('PASS: four new articles, eight-guide hub, preserved original publication date, app links and favicon responses.');
    const nojs = await browser.newContext({javaScriptEnabled:false});
    await nojs.route('https://fonts.googleapis.com/**', route => route.abort());
    await nojs.route('https://fonts.gstatic.com/**', route => route.abort());
    const staticPage = await nojs.newPage();
    await staticPage.goto(base + '/guides/prepare-for-your-quit-date/');
    assert.equal(await staticPage.locator('.guide-table tbody tr').count(), 6);
    await staticPage.goto(base + '/tools/quit-smoking-savings-calculator/');
    assert(await staticPage.locator('noscript').isVisible());
    console.log('PASS: new checklist and calculator fallback accessible without JavaScript.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
