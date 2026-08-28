// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('AI chat tab — full-version link & provider reference table', () => {
  test('full-version button renders with correct link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');
    await page.click('[data-tab="aichat"]');

    const link = page.locator('#aiChatRoot .full-chat-link');
    await expect(link).toBeVisible();
    await expect(link).toHaveText('🚀 نسخه کامل');
    await expect(link).toHaveAttribute('href', 'https://mohsen-niksirat.github.io/Free-AI-Chat/');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('AI settings lists all 23 providers of the full version with key links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');
    await page.click('[data-tab="aichat"]');
    await page.click('#aiChatRoot #settingsBtn');
    await expect(page.locator('#aiChatRoot #settingsPanel')).toHaveClass(/active/);

    const table = page.locator('#aiChatRoot #fullProvidersTable');
    await expect(table).toBeVisible();
    // 23 provider rows
    const rows = table.locator('div[style*="justify-content:space-between"]');
    await expect(rows).toHaveCount(23);
    // DeepSeek is flagged paid, others free
    await expect(table).toContainText('DeepSeek');
    await expect(table.getByText('پولی')).toHaveCount(1);
    await expect(table.getByText('رایگان')).toHaveCount(22);
    // Key links resolve to provider dashboards
    const geminiKey = table.locator('a[href="https://aistudio.google.com/app/apikey"]');
    await expect(geminiKey).toBeVisible();
    const openrouterKey = table.locator('a[href="https://openrouter.ai/keys"]');
    await expect(openrouterKey).toBeVisible();
    // footer hint linking to the full chat
    await expect(page.locator('#aiChatRoot #settingsPanel')).toContainText('Free-AI-Chat');
  });
});
