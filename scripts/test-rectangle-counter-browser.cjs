const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = (process.env.MOOCSOFT_TEST_URL || 'http://127.0.0.1:4197').replace(/\/$/, '');
const path = '/guides/count-rectangles-in-a-grid/';

function countBySize(rows, columns) {
  let total = 0;
  let squares = 0;
  for (let height = 1; height <= rows; height++) {
    for (let width = 1; width <= columns; width++) {
      const positions = (rows - height + 1) * (columns - width + 1);
      total += positions;
      if (height === width) squares += positions;
    }
  }
  return [total, squares, total - squares];
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 850 } });
      await context.route('https://fonts.**', route => route.abort());
      const page = await context.newPage();
      assert.equal((await page.goto(base + path)).status(), 200);
      const counter = page.locator('#rectangle-counter');
      const rows = counter.getByLabel('Rows', { exact: true });
      const columns = counter.getByLabel('Columns', { exact: true });
      assert.equal(await rows.inputValue(), '2');
      assert.equal(await columns.inputValue(), '3');
      const requests = [];
      // Scrolling the tool into view can load the guide's existing responsive illustration.
      page.on('request', request => {
        const url = new URL(request.url());
        const guideIllustration = url.origin === new URL(base).origin && request.resourceType() === 'image'
          && url.pathname.startsWith('/assets/guide-charts/count-rectangles-in-a-grid');
        if (!guideIllustration) requests.push(request.url());
      });
      for (const [r, c] of [[2, 3], [1, 1], [1, 30], [30, 1], [3, 4], [8, 8], [30, 30]]) {
        await rows.fill(String(r));
        await columns.fill(String(c));
        const values = (await counter.locator('[data-count]').allTextContents()).map(value => Number(value.replaceAll(',', '')));
        assert.deepEqual(values, countBySize(r, c));
        const drawing = await counter.locator('[data-grid-lines]').getAttribute('d');
        assert.equal(drawing.split('M').length - 1, r + c + 2);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No overflow at ${width}px for ${r}×${c}`);
      }
      await rows.fill('2');
      for (const value of ['', '0', '31', '1.5']) {
        await columns.fill(value);
        assert.equal(await columns.getAttribute('aria-invalid'), 'true');
        assert(await counter.locator('[data-grid-output]').isHidden());
        assert.match(await counter.getByRole('status').innerText(), /whole number/);
      }
      await columns.fill('3');
      assert.equal(await columns.getAttribute('aria-invalid'), 'false');
      assert(await counter.locator('[data-grid-output]').isVisible());
      assert.match(await counter.locator('[data-example-caption]').innerText(), /4 positions/);
      await counter.locator('summary').click();
      assert.match(await counter.locator('[data-square-detail]').innerText(), /6 \+ 2 = 8 squares/);
      assert.deepEqual(requests, [], 'Changing the grid makes no requests');
      await context.close();
    }
    const plain = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 850 } });
    await plain.route('https://fonts.**', route => route.abort());
    const page = await plain.newPage();
    await page.goto(base + path);
    assert(await page.locator('[data-grid-inputs]').isHidden());
    assert.equal(await page.locator('[data-count="total"]').innerText(), '18');
    assert(await page.getByRole('link', { name: 'use the boundary formula' }).isVisible());
    assert.equal(await page.locator('#step-5 details').count(), 6);
    assert.equal(await page.locator('#rectangle-counter .rectangle-practice a').getAttribute('href'), '#step-5');
    console.log('PASS: default 2×3, independent rectangle and square counts, extreme dimensions, invalid inputs and recovery, mobile layout, network-free updates and no-JS practice.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
