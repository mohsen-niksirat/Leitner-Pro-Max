// @ts-check
const { test, expect } = require('@playwright/test');

const TABS = ['review','quiz','engquiz','library','longterm','wordweb','import','vocabforge','export','reading','pdfreader','pdfmobile','stats','aichat','settings','about'];

test('runtime monitor: every tab has no uncaught errors or failed same-origin requests', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', request => {
    if (new URL(request.url()).origin === 'http://127.0.0.1:8795') failedRequests.push(`${request.method()} ${request.url()} — ${request.failure()?.errorText || 'failed'}`);
  });

  await page.goto('/');
  await expect(page.locator('#hamBtn')).toBeVisible();
  await page.click('#hamBtn');
  for (const tab of TABS) {
    await page.evaluate(tabId => document.querySelector(`[data-tab="${tabId}"]`)?.click(), tab);
    await expect.poll(() => page.locator('#content').innerHTML().then(html => html.length), { timeout: 15000 }).toBeGreaterThan(0);
    await page.waitForTimeout(250);
  }
  expect(pageErrors, 'uncaught runtime errors').toEqual([]);
  expect(consoleErrors, 'console errors').toEqual([]);
  expect(failedRequests, 'failed same-origin requests').toEqual([]);
});
