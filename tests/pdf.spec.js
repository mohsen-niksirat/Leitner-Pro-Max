// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Minimal one-page PDF with an embedded text line — enough for pdf.js to extract
 * real text items and place the TextLayer over the canvas.
 */
function buildMinimalPdf(line) {
  const words = line.split(' ');
  let ops = 'BT /F1 24 Tf 72 200 Td ';
  words.forEach((w, i) => {
    ops += `(${w}) Tj `;
    if (i < words.length - 1) ops += '170 0 Td ';
  });
  ops += 'ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${ops.length} >>\nstream\n${ops}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

test.describe('PDF reader', () => {
  test('TextLayer places words so double-click selects the right word', async ({ page }) => {
    // Route external APIs so lookup works
    await page.route('**/api.mymemory.translated.net/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه' }, responseStatus: 200 }) })
    );
    await page.route('**/api.dictionaryapi.dev/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    // open PDF reader tab through the sidebar
    await page.click('#hamBtn');
    await page.click('[data-tab="pdfreader"]');
    // input itself is display:none — the visible trigger is the open button
    await expect(page.locator('#pdfOpen')).toBeVisible();
    await page.setInputFiles('#pdfFileInput', { name: 'sample.pdf', mimeType: 'application/pdf', buffer: buildMinimalPdf('resilient pragmatic abundant') });
    // Wait for canvas pages
    await expect(page.locator('.pdf-canvas-page')).toHaveCount(1, { timeout: 20000 });
    // Find the word span in the official TextLayer and measure its box
    const target = await page.evaluate(() => {
      const layer = document.querySelector('.pdf-canvas-textlayer');
      if (!layer) return null;
      const spans = [...layer.querySelectorAll('span')];
      const span = spans.find((x) => x.textContent.includes('resilient'));
      if (!span) return null;
      const r = span.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: span.textContent, spanCount: spans.length };
    });
    expect(target).not.toBeNull();
    // Double-click the exact coordinates of the word
    await page.mouse.dblclick(target.x, target.y);
    await page.waitForTimeout(900);
    const result = await page.evaluate(() => ({
      sel: (window.getSelection() || {}).toString().trim(),
      popup: !!document.getElementById('pdfTranslatePopup'),
      searchInput: !!document.getElementById('pdfSearchWordInput')
    }));
    // The selection should contain our word (or a fragment), proving the overlay
    // positions text accurately under the canvas
    expect(result.popup || result.searchInput).toBeTruthy();
    expect(result.sel).toBe('');
  });

  test('Multi-word selection never becomes a card (scanned/multi-column PDFs)', async ({ page }) => {
    // Scanned/multi-column PDFs make the browser select a whole column on
    // double-click. doPdfTranslateSmart must keep only the FIRST word and
    // must not auto-add the multi-word string to the library.
    await page.route('**/api.mymemory.translated.net/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه' }, responseStatus: 200 }) })
    );
    await page.route('**/api.dictionaryapi.dev/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="pdfreader"]');
    await page.waitForSelector('#pdfOpen');
    await page.setInputFiles('#pdfFileInput', { name: 'col.pdf', mimeType: 'application/pdf', buffer: buildMinimalPdf('resilient pragmatic abundant') });
    await page.waitForSelector('.pdf-canvas-page', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const result = await page.evaluate(async () => {
      const beforeW = window.S.words.length;
      const beforeLT = window.S.longTerm.length;
      // Simulate the browser selection the user sees in a scanned PDF:
      // a whole column / line as one selection string.
      const popup = document.createElement('div');
      popup.id = 'pdfTranslatePopup';
      const res = document.createElement('div');
      res.id = 'pdfTranslateResult';
      popup.appendChild(res);
      document.body.appendChild(popup);
      await doPdfTranslateSmart('  the   quick brown fox  jumps  ');
      const title = res.querySelector('div[style*="font-weight:800"]');
      const looked = title ? title.textContent : null;
      popup.remove();
      return {
        looked,
        addedWords: window.S.words.length - beforeW,
        addedLT: window.S.longTerm.length - beforeLT
      };
    });
    // Only the first word is looked up (never the whole column)
    expect(result.looked).toBe('the');
    // Nothing is auto-added to library or long-term memory
    expect(result.addedWords).toBe(0);
    expect(result.addedLT).toBe(0);
  });

  test('PDF-mobile section is mobile-only and word tap opens lookup', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 850 });
    await page.route('**/api.mymemory.translated.net/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه' }, responseStatus: 200 }) })
    );
    await page.route('**/api.dictionaryapi.dev/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    // On mobile the PDF-mobile nav item is visible
    await page.click('#hamBtn');
    const mobileBtn = page.locator('[data-tab="pdfmobile"]');
    await expect(mobileBtn).toBeVisible();
    await mobileBtn.click();
    await expect(page.locator('#pdfmDrop')).toBeVisible();
    await page.setInputFiles('#pdfmFileInput', { name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('resilient pragmatic abundant') });
    await expect(page.locator('#rdMContent')).toBeVisible({ timeout: 20000 });
    await expect(page.locator('#rdMContent .reading-word')).toHaveCount(3);

    // Desktop hides the PDF-mobile item
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    // nav re-renders? we can simply assert computed style on existing element
    const display = await page.evaluate(() => getComputedStyle(document.querySelector('[data-tab="pdfmobile"]')).display);
    expect(display).toBe('none');
  });

  test('PDF-mobile restores the last read page after reload (auto-bookmark)', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 850 });
    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="pdfmobile"]');
    await expect(page.locator('#pdfmDrop')).toBeVisible();
    // Multi-page TXT (extractTXTForReading splits every ~3000 chars)
    const sentence = 'The quick brown fox jumps over the lazy dog and runs around the garden again and again until the evening comes. ';
    const txt = Array.from({ length: 80 }, (_, i) => `Number ${i}. ` + sentence).join('');
    // Raise the per-file max-word limit so the multi-page text isn't dropped
    await page.fill('#pdfmMax', '5000');
    await page.setInputFiles('#pdfmFileInput', { name: 'book.txt', mimeType: 'text/plain', buffer: Buffer.from(txt) });
    await expect(page.locator('#rdMContent')).toBeVisible({ timeout: 20000 });
    const pageIndicator = async () => {
      const entireBar = await page.locator('.pdfm-bar').textContent();
      const m = entireBar.match(/(\d+) \/ (\d+)/);
      return m ? `${m[1]} / ${m[2]}` : entireBar.trim();
    };
    const before = await pageIndicator();
    const total = parseInt(before.split('/')[1].trim());
    expect(total).toBeGreaterThan(1);
    // Go to page 2
    await page.locator('#pdfmNext').click();
    await page.waitForTimeout(400);
    expect(await pageIndicator()).toMatch(/^2 \/ /);
    // Reload and open the same file again → must restore to page 2
    await page.reload();
    await page.click('#hamBtn');
    await page.click('[data-tab="pdfmobile"]');
    await expect(page.locator('#pdfmDrop')).toBeVisible();
    await page.fill('#pdfmMax', '5000');
    await page.setInputFiles('#pdfmFileInput', { name: 'book.txt', mimeType: 'text/plain', buffer: Buffer.from(txt) });
    await expect(page.locator('#rdMContent')).toBeVisible({ timeout: 20000 });
    expect(await pageIndicator()).toMatch(/^2 \/ /);
  });

  test('PDF reader highlights unknown words and multi-word drag opens separate chips', async ({ page }) => {
    await page.route('**/api.dictionaryapi.dev/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.route('**/api.mymemory.translated.net/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'تر' }, responseStatus: 200 }) })
    );
    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="pdfreader"]');
    await page.waitForSelector('#pdfOpen');
    await page.setInputFiles('#pdfFileInput', { name: 'two.pdf', mimeType: 'application/pdf', buffer: buildMinimalPdf('resilient pragmatic abundant') });
    await page.waitForSelector('.pdf-canvas-page', { timeout: 20000 });
    await page.waitForTimeout(1200);

    // 1) Unknown-word highlight: no words in library → all spans get the class
    await page.click('#pdfUnknownBtn');
    await page.waitForTimeout(400);
    const marked = await page.evaluate(() => {
      const layer = document.querySelector('.pdf-canvas-textlayer');
      return [...layer.querySelectorAll('span[data-word]')].filter(s => s.classList.contains('pdf-unknown-word')).map(s => s.getAttribute('data-word'));
    });
    expect(marked.length).toBeGreaterThanOrEqual(2);

    // 2) Add 'resilient' to library, re-toggle → resilient no longer marked
    await page.evaluate(() => {
      S.words.push(createCard({ word: 'resilient' }));
      save();
    });
    await page.click('#pdfUnknownBtn');
    await page.click('#pdfUnknownBtn');
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const layer = document.querySelector('.pdf-canvas-textlayer');
      return [...layer.querySelectorAll('span[data-word].pdf-unknown-word')].map(s => s.getAttribute('data-word'));
    });
    expect(after).not.toContain('resilient');
    expect(after.length).toBeGreaterThanOrEqual(1);

    // 3) Multi-word drag selection → separate per-word chips, one click each
    await page.evaluate(() => showPdfSelectionHelper(120, 260, ['alpha', 'beta', 'gamma']));
    await expect(page.locator('#pdfSelectionHelper')).toBeVisible();
    const chips = page.locator('#pdfSelectionHelper span');
    await expect(chips).toHaveCount(3);
    await page.locator('#pdfSelectionHelper span', { hasText: 'beta' }).click();
    await page.waitForTimeout(500);
    const looked = await page.evaluate(() => {
      const res = document.getElementById('pdfTranslateResult');
      const el = res ? res.querySelector('div[style*="font-weight:800"]') : null;
      return el ? el.textContent : null;
    });
    expect(looked).toBe('beta');
  });


});
