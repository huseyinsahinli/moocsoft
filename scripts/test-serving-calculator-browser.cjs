const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4286';
const path = '/guides/calories-per-serving-vs-per-container/';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 850 } });
      await page.goto(base + '/tools/');
      await page.locator('a[href="' + path + '#serving-calculator"]').click();
      const tool = page.locator('#serving-calculator');
      const total = tool.locator('[data-total]');
      const basis = tool.locator('[name=basis]');
      const calories = tool.locator('[name=calories]');
      const portion = tool.locator('[name=portion]');
      const quantity = tool.locator('[name=quantity]');
      assert.equal(await total.innerText(), '450 kcal');
      await basis.selectOption('container');
      assert.equal(await total.innerText(), '90 kcal');
      await portion.fill('1');
      assert.equal(await total.innerText(), '180 kcal');
      await basis.selectOption('grams');
      assert.equal(await total.innerText(), '315 kcal');
      await quantity.fill('100');
      await calories.fill('280');
      await portion.fill('45');
      assert.equal(await total.innerText(), '126 kcal');
      await basis.selectOption('volume');
      await calories.fill('110');
      assert.equal(await total.innerText(), '132 kcal');
      await quantity.fill('0');
      assert.equal(await total.innerText(), '—');
      await quantity.fill('250');
      await portion.fill('');
      assert.equal(await total.innerText(), '—');
      await portion.fill('0');
      assert.equal(await total.innerText(), '0 kcal');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.close();
    }
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto(base + path);
    assert(await page.locator('#serving-calculator form').isHidden());
    assert.match(await page.locator('#serving-calculator').innerText(), /180 kcal × 2.5 servings/);
    assert.match(await page.locator('#serving-calculator noscript').innerText(), /multiply calories per serving/);
    await page.close();
  } finally {
    await browser.close();
  }
  console.log('Portion calculator passed on mobile and desktop, including partial packs, invalid input and the offline arithmetic example.');
})().catch(error => { console.error(error); process.exitCode = 1; });
