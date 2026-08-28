// @ts-check
// Smoke gate for the legacy-main.js refactor: every tab must render without
// uncaught exceptions after each extraction phase.
const { test, expect } = require('@playwright/test');

const TABS = [
  'review', 'quiz', 'engquiz', 'library', 'longterm', 'wordweb',
  'import', 'vocabforge', 'export', 'reading', 'pdfreader', 'pdfmobile',
  'stats', 'aichat', 'settings', 'about'
];

test.describe('Smoke — every tab renders', () => {
  test('all tabs render without uncaught errors', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));

    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    await page.click('#hamBtn');

    for (const tab of TABS) {
      // Click through the nav's own onclick handler (works even when the
      // button is below the sidebar fold).
      await page.evaluate((t) => {
        const btn = document.querySelector(`[data-tab="${t}"]`);
        if (btn) btn.click();
      }, tab);
      await page.waitForTimeout(200);
      const len = (await page.locator('#content').innerHTML()).length;
      expect(len, `tab ${tab} rendered empty content`).toBeGreaterThan(0);
      const errToasts = await page.locator('#toasts .toast-error').count();
      expect(errToasts, `tab ${tab} produced error toasts`).toBe(0);
    }
    expect(pageErrors, 'uncaught page errors during tab smoke').toEqual([]);
  });
});

test.describe('Smoke — review flow', () => {
  test('seed a due word, flip the card, rate it, session completes', async ({ page }) => {
    await page.addInitScript(() => {
      const legacy = {
        words: [{ id: 'w1', word: 'resilient', translation: 'تاب‌آور', box: 0, repetitions: 0, interval: 1, easeFactor: 2.5, nextReviewDate: null, fsrsState: 'new', stability: 0, difficulty: 0, reps: 0, lapses: 0 }],
        longTerm: [],
        stats: { reviewed: 0, correct: 0, wrong: 0, streak: 0, xp: 0, lastReviewDate: null, history: {} },
        quizStats: { sessions: [], totalCorrect: 0, totalWrong: 0, wordPerformance: {}, currentSession: null },
        settings: { theme: 'dark' },
        version: 3
      };
      localStorage.setItem('leitner_v2', JSON.stringify(legacy));
    });
    await page.goto('/');
    await expect(page.locator('#rCard')).toBeVisible();
    await page.click('#rCard');
    await expect(page.locator('[data-rate="4"]')).toBeVisible();
    await page.click('[data-rate="4"]');
    await expect(page.locator('#reviewRestart')).toBeVisible();
    const errToasts = await page.locator('#toasts .toast-error').count();
    expect(errToasts).toBe(0);
  });
});
