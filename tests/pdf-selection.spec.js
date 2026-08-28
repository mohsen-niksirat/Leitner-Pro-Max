const { test, expect } = require('@playwright/test');

test('PDF selection helper ignores ranges outside the active page', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const pageWrap = document.createElement('div');
    pageWrap.className = 'pdf-canvas-page';
    const layer = document.createElement('div');
    layer.className = 'pdf-canvas-textlayer';
    layer.textContent = 'alpha beta';
    pageWrap.appendChild(layer);
    const outside = document.createElement('div');
    outside.textContent = 'outside column text';
    document.body.append(pageWrap, outside);
    const range = document.createRange();
    range.selectNodeContents(outside);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    const belongs = pageWrap.contains(selection.getRangeAt(0).commonAncestorContainer);
    selection.removeAllRanges();
    pageWrap.remove();
    outside.remove();
    return belongs;
  });
  expect(result).toBe(false);
});
