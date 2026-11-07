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

  test('supports 20 built-in providers, manual model addition, custom provider creation, and multi-key rotation policies', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');
    await page.click('[data-tab="aichat"]');
    await page.click('#aiChatRoot #settingsBtn');

    // 1. Built-in providers include famous providers (OpenAI, Anthropic, DeepSeek, xAI, Cerebras, Mistral, SambaNova)
    const chips = page.locator('#aiChatRoot #providerChips .provider-chip');
    expect(await chips.count()).toBeGreaterThanOrEqual(20);
    await page.click('#aiChatRoot #providerChips .provider-chip[data-provider="openai"]');
    await expect(page.locator('#aiChatRoot #modelSelect')).toContainText('GPT-4.1');

    // 2. Add a manual model to OpenAI
    await page.fill('#aiChatRoot #customModelIdInput', 'gpt-5-custom-turbo');
    await page.fill('#aiChatRoot #customModelLabelInput', 'GPT-5 Custom');
    await page.click('#aiChatRoot #addCustomModelBtn');
    await expect(page.locator('#aiChatRoot #modelSelect')).toHaveValue('gpt-5-custom-turbo');
    await expect(page.locator('#aiChatRoot #customModelsList')).toContainText('GPT-5 Custom');

    // 3. Add multiple keys via Bulk Import and switch rotation policy
    await page.click('#aiChatRoot #toggleBulkKeysBtn');
    await page.fill('#aiChatRoot #bulkKeysTextarea', 'sk-test-key-1\nsk-test-key-2\nsk-test-key-3');
    await page.click('#aiChatRoot #applyBulkKeysBtn');
    await expect(page.locator('#aiChatRoot #providerBadge')).toContainText('3🔑');

    await page.selectOption('#aiChatRoot #keyPolicySelect', 'least_used');
    await expect(page.locator('#aiChatRoot #quickPolicySelect')).toHaveValue('least_used');
    await page.selectOption('#aiChatRoot #keyPolicySelect', 'round_robin');

    // 4. Create a Custom Provider with Base URL, multiple keys, and models, and verify Round-Robin & Failover on 429
    const seenAuthHeaders = [];
    await page.route('https://custom-ai.example.com/v1/chat/completions', async (route) => {
      const auth = route.request().headers()['authorization'] || '';
      seenAuthHeaders.push(auth);
      // Simulate 429 on the first key so transparent failover retries with key #2!
      if (auth === 'Bearer ckey-alpha') {
        await route.fulfill({
          status: 429,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Rate limit reached for ckey-alpha' } })
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{ message: { content: 'پاسخ موفق از کلید دوم پروایدر سفارشی!' } }]
        })
      });
    });

    await page.fill('#aiChatRoot #customProvName', 'MyCustomGateway');
    await page.fill('#aiChatRoot #customProvBaseUrl', 'https://custom-ai.example.com/v1');
    await page.fill('#aiChatRoot #customProvKeysInput', 'ckey-alpha\nckey-beta');
    await page.fill('#aiChatRoot #customProvModelsInput', 'custom-llm-v1, custom-llm-v2');
    await page.click('#aiChatRoot #saveCustomProvBtn');

    await expect(page.locator('#aiChatRoot #providerBadge')).toContainText('MyCustomGateway');
    await expect(page.locator('#aiChatRoot #modelSelect')).toHaveValue('custom-llm-v1');

    // Close settings and send a chat message -> key #1 returns 429 -> transparent failover uses key #2!
    await page.click('#aiChatRoot #closeSettings');
    await page.fill('#aiChatRoot #messageInput', 'سلام تست چرخش کلید');
    await page.click('#aiChatRoot #sendBtn');

    await expect(page.locator('#aiChatRoot .message.assistant .message-bubble').last()).toContainText('پاسخ موفق از کلید دوم پروایدر سفارشی!');
    expect(seenAuthHeaders).toEqual(['Bearer ckey-alpha', 'Bearer ckey-beta']);
  });
});
