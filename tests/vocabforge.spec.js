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
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');
    // غنی‌سازی ذخیره شد (اسلاید ۲ لیست ساده دارد؛ اسلاید ۴ تعریف‌ها را نشان می‌دهد)
    await expect(page.locator('#vfSlide2 [data-vf-select]').first().locator('..')).toContainText('غنی‌شده');
    expect(apiCalls.dict).toBe(TEST_WORDS.length);

    // --- Enrich again: served from IndexedDB cache, no new network calls ---
    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');
    expect(apiCalls.dict).toBe(TEST_WORDS.length);

    // --- Translate (first run hits the network) ---
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfTransStatus')).toContainText('ترجمه کامل شد');
    await expect(page.locator('#vfTranslateBtn')).toBeEnabled();
    expect(apiCalls.trans).toBe(TEST_WORDS.length);

    // --- Translate again: served from cache ---
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfTransStatus')).toContainText('ترجمه کامل شد');
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

  test('enrichment speed regression guard — 9 words under 10s with mocked 80ms latency', async ({ page }) => {
    const SPEED_WORDS = ['alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india'];
    const start = Date.now();

    await page.route('**/api.dictionaryapi.dev/**', async (route) => {
      await new Promise(r => setTimeout(r, 80)); // simulate network latency
      const url = new URL(route.request().url());
      const word = decodeURIComponent(url.pathname.split('/').pop() || 'word');
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(dictionaryBody(word)) });
    });
    await page.route('**/en.wiktionary.org/**', async (route) => {
      await new Promise(r => setTimeout(r, 50));
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api.datamuse.com/**', async (route) => {
      await new Promise(r => setTimeout(r, 30));
      await route.fulfill({ contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      await new Promise(r => setTimeout(r, 50));
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه ' + word } }) });
    });
    await page.route('**/translate.googleapis.com/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '[]' })
    );
    await page.route('**/fa.wiktionary.org/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/fonts.gstatic.com/**', (route) => route.abort());

    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfText')).toBeVisible();

    await page.fill('#vfText', SPEED_WORDS.join(' '));
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('9 کلمه اضافه شد');

    await page.click('#vfSlide2 #vfSelectAll');
    await page.click('#vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');

    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');

    const elapsed = Date.now() - start;
    // 9 words × ~160ms (dict+etym parallel) / 6 workers ≈ ~240ms total;
    // 10s threshold is extremely generous for regression detection
    expect(elapsed).toBeLessThan(10000);
    console.log(`[speed] enriched ${SPEED_WORDS.length} words in ${elapsed}ms`);

    // Verify all enriched
    const enriched = await page.evaluate(() => vfCards().filter(c => c.definitions && c.definitions.length).length);
    expect(enriched).toBe(9);
  });

  test('retry button re-runs only incomplete words', async ({ page }) => {
    let dictCallCount = 0;

    await page.route('**/api.dictionaryapi.dev/**', async (route) => {
      dictCallCount++;
      const url = new URL(route.request().url());
      const word = decodeURIComponent(url.pathname.split('/').pop() || 'word');
      // 'unknownword' always returns empty definitions
      if (word === 'unknownword') {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '[]' });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(dictionaryBody(word)) });
      }
    });
    await page.route('**/en.wiktionary.org/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api.datamuse.com/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      if (word === 'unknownword') {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه ' + word } }) });
      }
    });
    await page.route('**/fa.wiktionary.org/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/translate.googleapis.com/**', async (route) => {
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      if (word === 'unknownword') {
        await route.fulfill({ status: 404, contentType: 'application/json', body: '[]' });
      } else {
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify([[['ترجمه ' + word]]]) });
      }
    });
    await page.route('**/fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/fonts.gstatic.com/**', (route) => route.abort());

    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfText')).toBeVisible();

    await page.fill('#vfText', 'happy unknownword clear');
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('3 کلمه اضافه شد');

    await page.click('#vfSlide2 #vfSelectAll');
    await page.click('#vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');

    // First enrich: 'unknownword' fails, 'happy' and 'clear' succeed
    dictCallCount = 0;
    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');

    // Verify incomplete section shows the failed word
    const failedSection = page.locator('#vfFailedSection');
    await expect(failedSection).toBeVisible();
    await expect(failedSection).toContainText('unknownword');
    await expect(page.locator('#vfRetryFailedBtn')).toBeVisible();

    // Now fix the mock so unknownword succeeds
    await page.route('**/api.dictionaryapi.dev/**', async (route) => {
      dictCallCount++;
      const url = new URL(route.request().url());
      const word = decodeURIComponent(url.pathname.split('/').pop() || 'word');
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(dictionaryBody(word)) });
    });
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه ' + word } }) });
    });

    // Click retry — should only process incomplete words, not all 3
    dictCallCount = 0;
    await page.click('#vfRetryFailedBtn');
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');

    // Only the failed word should have been re-fetched
    expect(dictCallCount).toBe(1);

    // Verify all words are now complete
    const allComplete = await page.evaluate(() => vfCards().every(c => c.definitions && c.definitions.length && c.translation));
    expect(allComplete).toBe(true);

    // Incomplete section should show success message
    await expect(page.locator('#vfFailedSection')).toContainText('همه کلمات غنی‌شده و ترجمه شده‌اند');
  });

  test('MyMemory circuit breaker falls through to Google after 429', async ({ page }) => {
    let myMemoryCalls = 0, googleCalls = 0;

    await page.route('**/api.dictionaryapi.dev/**', async (route) => {
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
    await page.route('**/fa.wiktionary.org/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
    );
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      myMemoryCalls++;
      await route.fulfill({ status: 429, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/translate.googleapis.com/**', async (route) => {
      googleCalls++;
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify([[[`ترجمه ${word}`]]]) });
    });
    await page.route('**/fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/fonts.gstatic.com/**', (route) => route.abort());

    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfText')).toBeVisible();

    // First word translate → MyMemory 429 trips the breaker, Google fallback used
    await page.fill('#vfText', 'alpha');
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('1 کلمه اضافه شد');
    await page.click('#vfSlide2 #vfSelectAll');
    await page.click('#vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfTransStatus')).toContainText('ترجمه کامل شد');
    expect(myMemoryCalls).toBe(1);
    expect(googleCalls).toBe(1);

    // Add two more words — breaker (60s cooldown) must skip MyMemory entirely
    await page.evaluate(() => { vfSetSlide(1); render(); });
    await page.fill('#vfText', 'bravo charlie');
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('2 کلمه اضافه شد');
    await page.click('#vfSlide2 #vfSelectAll');
    await page.click('#vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfTransStatus')).toContainText('ترجمه کامل شد');

    expect(myMemoryCalls).toBe(1); // no new MyMemory calls
    expect(googleCalls).toBe(3);   // both new words went straight to Google
  });

  test('Wiktionary REST definitions used as source 2 for rare words', async ({ page }) => {
    let faWiktionaryCalls = 0;

    // Rare word: not in dictionaryapi.dev at all
    await page.route('**/api.dictionaryapi.dev/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '[]' })
    );
    await page.route('**/en.wiktionary.org/**', async (route) => {
      const url = new URL(route.request().url());
      const word = decodeURIComponent(url.pathname.split('/').pop() || 'word');
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ en: [{ partOfSpeech: 'noun', definitions: [{ definition: `Wiki definition of ${word}`, examples: [`Example with ${word}`] }] }] })
      });
    });
    await page.route('**/api.datamuse.com/**', (route) =>
      route.fulfill({ contentType: 'application/json', body: '[]' })
    );
    await page.route('**/fa.wiktionary.org/**', async (route) => {
      faWiktionaryCalls++;
      await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
    });
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: `ترجمه ${word}` } }) });
    });
    await page.route('**/translate.googleapis.com/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '[]' })
    );
    await page.route('**/fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/fonts.gstatic.com/**', (route) => route.abort());

    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfText')).toBeVisible();

    await page.fill('#vfText', 'sesquipedalian');
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText('1 کلمه اضافه شد');
    await page.click('#vfSlide2 #vfSelectAll');
    await page.click('#vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');

    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');

    const card = await page.evaluate(() => vfCards()[0]);
    expect(card.definitions[0]).toContain('Wiki definition');
    expect(card.defSource).toBe('wiktionary');
    expect(card.examples[0]).toContain('Example with');
    expect(card.partOfSpeech).toBe('noun');
    expect(faWiktionaryCalls).toBe(0); // fa fallback skipped once wiktionary hit
  });

  test('enrichment speed benchmark: 20 words under 15s with mocked 30ms latency', async ({ page }) => {
    const WORDS = ['apple','brave','calm','dance','eager','fair','grace','happy','iron','jolly','kind','light','merry','noble','open','proud','quick','rare','smart','tender'];
    const LATENCY_MS = 30;

    await page.route('**/api.dictionaryapi.dev/**', async (route) => {
      const url = new URL(route.request().url());
      const word = decodeURIComponent(url.pathname.split('/').pop() || 'word');
      await new Promise(r => setTimeout(r, LATENCY_MS));
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify(dictionaryBody(word)) });
    });
    await page.route('**/en.wiktionary.org/**', (route) => route.fulfill({ status: 404, body: '{}' }));
    await page.route('**/api.datamuse.com/**', async (route) => {
      await new Promise(r => setTimeout(r, LATENCY_MS));
      await route.fulfill({ contentType: 'application/json', body: '[]' });
    });
    await page.route('**/api.mymemory.translated.net/**', async (route) => {
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await new Promise(r => setTimeout(r, LATENCY_MS));
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ responseData: { translatedText: 'ترجمه ' + word } }) });
    });
    await page.route('**/translate.googleapis.com/**', async (route) => {
      const url = new URL(route.request().url());
      const word = url.searchParams.get('q') || 'word';
      await new Promise(r => setTimeout(r, LATENCY_MS));
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify([[['ترجمه ' + word]]]) });
    });
    await page.route('**/fa.wiktionary.org/**', (route) => route.fulfill({ status: 404, body: '{}' }));
    await page.route('**/fonts.googleapis.com/**', (route) => route.abort());
    await page.route('**/fonts.gstatic.com/**', (route) => route.abort());

    await page.goto('/');
    await page.click('#hamBtn');
    await page.click('[data-tab="vocabforge"]');
    await expect(page.locator('#vfText')).toBeVisible();

    await page.fill('#vfText', WORDS.join(' '));
    await page.click('#vfAddText');
    await expect(page.locator('#vfImportStatus')).toHaveText(WORDS.length + ' کلمه اضافه شد');
    await page.click('#vfSlide2 #vfSelectAll');
    await page.click('#vfNextBtn2');
    await expect(page.locator('.import-step-dot.active')).toHaveText('۳');

    const t0 = Date.now();
    await page.click('#vfEnrichBtn');
    await expect(page.locator('#vfEnrichStatus')).toContainText('غنی‌سازی کامل شد');
    const enrichMs = Date.now() - t0;

    // With 6 concurrent workers and 30ms latency per request,
    // 20 words should complete well under 15 seconds.
    expect(enrichMs).toBeLessThan(15000);

    const t1 = Date.now();
    await page.click('#vfTranslateBtn');
    await expect(page.locator('#vfTransStatus')).toContainText('ترجمه کامل شد');
    const transMs = Date.now() - t1;
    expect(transMs).toBeLessThan(15000);

    // All words should have definitions and translation
    const allComplete = await page.evaluate(() => vfCards().every(c => c.definitions && c.definitions.length && c.translation));
    expect(allComplete).toBe(true);
  });
});
