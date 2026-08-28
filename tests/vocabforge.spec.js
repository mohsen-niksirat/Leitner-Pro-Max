// @ts-check
const { test, expect } = require('@playwright/test');

const TEST_WORDS = ['abundant', 'resilient', 'pragmatic'];

/**
 * خروجی دیکشنری جعلی به همان شکل api.dictionaryapi.dev.
 */
function dictionaryBody(word) {
  return [
    {
      word,
      phonetics: [{ text: `/${word}/` }],
      meanings: [
        {
          partOfSpeech: 'adjective',
          definitions: [
            { definition: `Test definition of ${word} — first meaning.`, example: `A sentence that uses ${word} correctly.` },
            { definition: `Test definition of ${word} — second meaning.` }
          ],
          synonyms: [`synonym-${word}`],
          antonyms: []
        }
      ]
    }
  ];
}

test.describe('VocabForge workflow', () => {
  test('input → select → enrich → cache → persist → transfer to library', async ({ page }) => {
    const apiCalls = { dict: 0, trans: 0 };

    // --- Intercept external APIs so the test is deterministic and offline-safe ---
    await page.route('**/api.dictionaryapi.dev/**', async (route) => {
      apiCalls.dict++;
      const url = new URL(route.request().url());
      const word = decodeURIComponent(url.pathname.split('/').pop() || 'word');
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(dictionaryBody(word)) });
    });
    await page.route('**/en.wiktionary.org/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api.datamuse.com/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      apiCalls.trans++;
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ responseData: { translatedText: `ترجمه ${word}` }, responseStatus: 200 })
      });
    });
    await page.route('**/fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/fonts.gstatic.com/**', (route) => route.abort());

    // --- Boot: open VocabForge through the real UI ---
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfText')).toBeVisible();

    // Step 1 active, hint about the next step shown
    await expect(page.locator('.import-step-dot.active')).toHaveText('۱');
    await expect(page.locator('text=مرحله‌ی بعدی:').first()).toBeVisible();

    // --- Step 1: input words ---
    await page.fill('#vfText', TEST_WORDS.join(' '));
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('3 کلمه اضافه شد');
    await expect(page.locator('#vfSlide2 [data-vf-select]')).toHaveCount(3);
    await expect(page.locator('.import-step-dot.active')).toHaveText('۲');

    // --- Step 2: select all ---
    await page.click('#vfSlide2 #vfSelectAll');
    await expect(page.locator('#vfSlide2').locator('text=3 انتخاب شده')).toBeVisible();
    await expect(page.locator('#vfNextBtn2')).toBeEnabled();

    // --- Go to enrichment (step 3): slide 2 -> «مرحله بعد» ---

    await page.click('#vfSlide2 #vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');

    // --- Enrich (first run hits the network) ---
    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfStatus')).toContainText('غنی‌سازی کامل شد');
    // غنی‌سازی ذخیره شد (اسلاید ۲ لیست ساده دارد؛ اسلاید ۴ تعریف‌ها را نشان می‌دهد)
    await expect(page.locator('#vfSlide2 [data-vf-select]').first().locator('..')).toContainText('غنی‌شده');
    expect(apiCalls.dict).toBe(TEST_WORDS.length);

    // --- Enrich again: served from IndexedDB cache, no new network calls ---
    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfStatus')).toContainText('غنی‌سازی کامل شد');
    expect(apiCalls.dict).toBe(TEST_WORDS.length);

    // --- Translate (first run hits the network) ---
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfStatus')).toContainText('ترجمه کامل شد');
    await expect(page.locator('#vfTranslateBtn')).toBeEnabled();
    expect(apiCalls.trans).toBe(TEST_WORDS.length);

    // --- Translate again: served from cache ---
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfStatus')).toContainText('ترجمه کامل شد');
    await expect(page.locator('#vfTranslateBtn')).toBeEnabled();
    expect(apiCalls.trans).toBe(TEST_WORDS.length);

    // --- Persistence: reload keeps enriched cards in IndexedDB ---
    await page.reload();
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfSlide4 [data-vf-select]')).toHaveCount(3);
    // ترجمه بعد از reload دیده می‌شود و تعریف‌ها در state برنامه حفظ شده‌اند
    await expect(page.locator('#vfSlide4 [data-vf-select]').first().locator('..')).toContainText('ترجمه abundant');
    const persisted = await page.evaluate(() =>
      window.S.settings.vocabForge.cards.map((c) => ({ word: c.word, defs: (c.definitions || []).length, trans: c.translation }))
    );
    expect(persisted).toEqual([
      { word: 'abundant', defs: 2, trans: 'ترجمه abundant' },
      { word: 'resilient', defs: 2, trans: 'ترجمه resilient' },
      { word: 'pragmatic', defs: 2, trans: 'ترجمه pragmatic' }
    ]);
    await expect(page.locator('.import-step-dot.active')).toHaveText('۴');

    // --- Output step: transfer selected enriched words to the library ---
    await page.click('#vfSlide4 #vfSelectAll');
    await page.click('#vfToLibrary');
    await expect(page.locator('text=3 کلمه به کتابخانه منتقل شد').first()).toBeVisible();
    // همه منتقل شدند؛ wizard به قدم اول برمی‌گردد
    await expect(page.locator('.import-step-dot.active')).toHaveText('۱');
    await expect(page.locator('.vf-slide.active')).toHaveId('vfSlide1');
    await expect(page.locator('#vfText')).toBeVisible();

    // --- Words are now in the library ---
    await page.click('#hamBtn');
    await page.click('[data-tab="library"]');
    await expect(page.locator('tbody')).toContainText('abundant');
    await expect(page.locator('tbody')).toContainText('resilient');
    await expect(page.locator('tbody')).toContainText('pragmatic');
  });

  test('CEFR level filter keeps only words of the chosen level', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfCefr')).toBeVisible();
    // abandon=B1, ability=A2, able=B1, category=B1
    await page.selectOption('#vfCefr', 'B1');
    await page.fill('#vfText', 'abandon ability able category');
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('3 کلمه اضافه شد');
    const kept = await page.evaluate(() => vfCards().map((c) => c.word));
    expect(kept).toContain('abandon');
    expect(kept).toContain('able');
    expect(kept).toContain('category');
    expect(kept).not.toContain('ability');
  });
});
