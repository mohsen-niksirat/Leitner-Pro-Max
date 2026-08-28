// @ts-check
// Vortex Gateway پروکسی — تست اتصال سرتاسری از UI لایتنر
//
// ۱) تست «واقعی»: فقط وقتی اجرا می‌شود که VORTEX_URL (+ VORTEX_TOKEN، GEMINI_KEY) ست شده
//    باشد (پس از دیپلوی Vortex). کلید Gemini از UI وارد می‌شود نه از کد.
// ۲) تست «وایرینگ» (مثبت محلی): با page.route سرور Vortex شبیه‌سازی می‌شود و مطمئن
//    می‌شویم درخواست دارای کلید فقط از پروکسی می‌رود، هدر X-Vortex-Token می‌گیرد و
//    به پروکسی‌های عمومی لو نمی‌رود.
const { test, expect } = require('@playwright/test');

const VORTEX_URL = (process.env.VORTEX_URL || '').replace(/\/+$/, '');
const VORTEX_TOKEN = process.env.VORTEX_TOKEN || '';
const GEMINI_KEY = process.env.GEMINI_KEY || '';

async function openAIChat(page) {
  await page.goto('/');
  await expect(page.locator('#hamBtn')).toBeVisible();
  await page.click('#hamBtn');
  await page.click('[data-tab="aichat"]');
  await expect(page.locator('#aiChatRoot #messageInput')).toBeVisible();
}

test.describe('Vortex proxy', () => {
  test('real deployment: Gemini request goes through the Vortex proxy and succeeds', async ({ page }) => {
    test.skip(!VORTEX_URL || !GEMINI_KEY, 'اجرای خودکار فقط با VORTEX_URL و GEMINI_KEY (بعد از دیپلوی).');
    test.setTimeout(120_000);

    await openAIChat(page);
    // تنظیمات: پروکسی + توکن + کلید Gemini (همه از UI)
    await page.click('#aiChatRoot #settingsBtn');
    await page.fill('#aiChatRoot #proxyUrlInput', VORTEX_URL);
    await page.fill('#aiChatRoot #proxyTokenInput', VORTEX_TOKEN);
    const geminiKey = page.locator('#aiChatRoot #geminiKeysList input').first();
    await geminiKey.fill(GEMINI_KEY);
    await page.click('#aiChatRoot #saveKeysBtn');
    await page.click('#aiChatRoot #closeSettings');

    // تست اتصال → testConnection → aiFetch (دارای کلید → فقط از پروکسی)
    await page.click('#aiChatRoot #settingsBtn');
    await page.click('#aiChatRoot #testBtn');
    await expect(page.locator('#aiChatRoot #testStatus')).toContainText('اتصال موفق', {
      timeout: 90_000,
    });
  });

  test('wiring: requests with keys use only the custom proxy, carry X-Vortex-Token, and never leak to public proxies', async ({ page }) => {
    // پروکسی Vortex جعلی که پاسخ موفق Gemini را برمی‌گرداند
    await page.route('https://myvortex.test/api/proxy/**', async (route) => {
      const req = route.request();
      expect(req.headers()['x-vortex-token']).toBe('my-secret-token-9');
      // بدنه باید همان بدنه Gemini باشد (کلید در URL داخل پروکسی)
      expect(req.url()).toContain('generativelanguage.googleapis.com');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'ok' }] } }],
        }),
      });
    });
    let publicProxyHits = 0;
    await page.route('https://corsproxy.io/**', (r) => { publicProxyHits++; return r.fulfill({ status: 200, body: '{}', contentType: 'application/json' }); });
    await page.route('https://api.allorigins.win/**', (r) => { publicProxyHits++; return r.fulfill({ status: 200, body: '{}', contentType: 'application/json' }); });

    await openAIChat(page);
    await page.click('#aiChatRoot #settingsBtn');
    await page.fill('#aiChatRoot #proxyUrlInput', 'https://myvortex.test');
    await page.fill('#aiChatRoot #proxyTokenInput', 'my-secret-token-9');
    await page.locator('#aiChatRoot #geminiKeysList input').first().fill('AIzaFAKE_KEY_12345');
    await page.click('#aiChatRoot #saveKeysBtn');
    await page.click('#aiChatRoot #testBtn');
    await expect(page.locator('#aiChatRoot #testStatus')).toContainText('اتصال موفق', { timeout: 30_000 });

    // کلید هرگز به پروکسی‌های عمومی نمی‌رود
    expect(publicProxyHits).toBe(0);
  });
});
