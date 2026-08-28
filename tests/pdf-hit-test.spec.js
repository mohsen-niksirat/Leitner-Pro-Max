const { test, expect } = require('@playwright/test');

test('PDF coordinate hit-test stays inside the pointed text layer', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const first = document.createElement('div');
    first.className = 'pdf-canvas-textlayer';
    first.style.cssText = 'position:fixed;left:10px;top:10px;width:120px;height:30px;z-index:2;pointer-events:none';
    first.innerHTML = '<span style="position:absolute;left:4px;top:2px;font:16px Arial">alpha</span>';
    const second = document.createElement('div');
    second.className = 'pdf-canvas-textlayer';
    second.style.cssText = 'position:fixed;left:10px;top:50px;width:120px;height:30px;z-index:2;pointer-events:auto';
    second.innerHTML = '<span style="position:absolute;left:4px;top:2px;font:16px Arial">beta</span>';
    document.body.append(first, second);
    const value = pdfWordAtPoint(1180, 62);

    first.remove(); second.remove();
    return value;
  });
  expect(result).toBe('beta');
});
