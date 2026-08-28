// @ts-check
// Final audit regression tests:
//  1) Legacy localStorage (leitner_v1) migrates fully to IndexedDB
//  2) Flushing lookup caches keeps vocabulary but removes app_cache_*/vf_cache_*
//  3) PWA: after install, the app + config.js boot fully offline
const { test, expect } = require('@playwright/test');

/** Seed a complete legacy state under a chosen localStorage key (v1/old). */
function seedLegacy(page, key) {
  return page.addInitScript(({ k }) => {
    const legacy = {
      words: [
        { id: 'w1', word: 'resilient', translation: 'تاب‌آور', box: 1, repetitions: 2, interval: 3, easeFactor: 2.5, nextReviewDate: null, fsrsState: 'learning', stability: 1.2, difficulty: 0.4, elapsedDays: 0, scheduledDays: 0, reps: 2, lapses: 0, definitions: ['able to recover'], examples: ['x'], synonyms: ['tough'], tags: ['audit'] },
        { id: 'w2', word: 'abundant', translation: 'فراوان' }
      ],
      longTerm: [{ id: 'lt1', word: 'perennial', translation: 'همیشگی' }],
      stats: { xp: 120, level: 3, totalReviews: 45, totalCorrect: 38, totalWrong: 7, history: {} },
      quizStats: { totalQuizzes: 2, totalCorrect: 5, totalWrong: 2, sessions: [] },
      settings: { dailyGoal: 20, speechRate: 0.85, theme: 'dark' },
      version: 1
    };
    localStorage.setItem(k, JSON.stringify(legacy));
  }, { k: key });
}

test.describe('Final audit — migration & PWA', () => {
  test('legacy leitner_v1 key migrates to IndexedDB once and localStorage is cleared', async ({ page }) => {
    await seedLegacy(page, 'leitner_v1');
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    // Data loaded into app state (v1 → IDB)
    const boot = await page.evaluate(() => ({
      words: window.S.words.map(w => w.word),
      lt: window.S.longTerm.map(w => w.word),
      theme: window.S.settings.theme,
      level: window.S.stats.level,
      totalReviews: window.S.stats.totalReviews,
      fsrs: window.S.words[0] ? { stability: window.S.words[0].stability, fsrsState: window.S.words[0].fsrsState } : null,
      v1Cleared: !localStorage.getItem('leitner_v1')
    }));
    expect(boot.words).toEqual(['resilient', 'abundant']);
    expect(boot.lt).toEqual(['perennial']);
    expect(boot.theme).toBe('dark');
    expect(boot.level).toBe(3);
    expect(boot.totalReviews).toBe(45);
    expect(boot.fsrs).toEqual({ stability: 1.2, fsrsState: 'learning' });
    // v1 must be cleared only after the IDB write completes — wait for it
    await expect.poll(() => page.evaluate(() => !localStorage.getItem('leitner_v1'))).toBe(true);

    // Refresh → data now comes from IndexedDB, state fully persists
    await page.reload();
    await expect(page.locator('#hamBtn')).toBeVisible();
    const afterRefresh = await page.evaluate(() => ({
      words: window.S.words.map(w => w.word),
      n: window.S.words.length
    }));
    expect(afterRefresh.words).toEqual(['resilient', 'abundant']);
  });

  test('corrupt legacy keys are skipped: healthy key still migrates', async ({ page }) => {
    // v2 holds garbage JSON, v1 holds valid data → the app must still boot
    // from v1 and never show a broken state or an error dialog.
    await page.addInitScript(() => {
      localStorage.setItem('leitner_v2', '{not valid json!!!');
      localStorage.setItem('leitner_v1', JSON.stringify({
        words: [{ id: 'ok1', word: 'survive', translation: 'جان به در بردن' }],
        longTerm: [],
        stats: { xp: 42, level: 2, totalReviews: 10, history: {} },
        settings: { dailyGoal: 15, theme: 'light' }
      }));
    });
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    const boot = await page.evaluate(() => ({
      words: window.S.words.map(w => w.word),
      theme: window.S.settings.theme,
      dailyGoal: window.S.settings.dailyGoal,
      level: window.S.stats.level,
      totalReviews: window.S.stats.totalReviews
    }));
    expect(boot.words).toEqual(['survive']);
    expect(boot.theme).toBe('light');
    expect(boot.level).toBe(2);
    expect(boot.totalReviews).toBe(10);
    // Corrupt v2 key must not block cleanup — after migration both keys are gone
    await expect.poll(() => page.evaluate(() => !localStorage.getItem('leitner_v1') && !localStorage.getItem('leitner_v2'))).toBe(true);
    // And the app is fully functional after refresh
    await page.reload();
    await expect(page.locator('#hamBtn')).toBeVisible();
    const after = await page.evaluate(() => window.S.words.map(w => w.word));
    expect(after).toEqual(['survive']);
  });

  test('v2 always wins over v1 when both keys exist (no partial loss)', async ({ page }) => {
    // Seed BOTH keys: v2 has newer data, v1 has stale data. The app must
    // migrate from v2 only and never overwrite it with v1.
    await page.addInitScript(() => {
      const v1 = {
        words: [{ id: 'old1', word: 'obsolete', translation: 'منسوخ' }],
        longTerm: [],
        stats: { xp: 5, level: 1, totalReviews: 1 },
        settings: { dailyGoal: 5, theme: 'light' }
      };
      const v2 = {
        words: [
          { id: 'w1', word: 'resilient', translation: 'تاب‌آور', box: 2, repetitions: 5, interval: 7, easeFactor: 2.5, nextReviewDate: null, fsrsState: 'review', stability: 4.1, difficulty: 0.3, elapsedDays: 0, scheduledDays: 0, reps: 5, lapses: 0 },
          { id: 'w2', word: 'abundant', translation: 'فراوان' }
        ],
        longTerm: [{ id: 'lt1', word: 'perennial', translation: 'همیشگی' }],
        stats: { xp: 900, level: 9, totalReviews: 300, totalCorrect: 280, totalWrong: 20, history: {} },
        quizStats: { sessions: [], totalCorrect: 0, totalWrong: 0, wordPerformance: {} },
        settings: { dailyGoal: 30, theme: 'dark', speechRate: 1.0 },
        version: 2
      };
      localStorage.setItem('leitner_v1', JSON.stringify(v1));
      localStorage.setItem('leitner_v2', JSON.stringify(v2));
    });
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    // v2 data must win entirely
    const boot = await page.evaluate(() => ({
      words: window.S.words.map(w => w.word),
      lt: window.S.longTerm.map(w => w.word),
      theme: window.S.settings.theme,
      dailyGoal: window.S.settings.dailyGoal,
      level: window.S.stats.level,
      totalReviews: window.S.stats.totalReviews,
      fsrs: window.S.words[0] ? { stability: window.S.words[0].stability, fsrsState: window.S.words[0].fsrsState, reps: window.S.words[0].reps } : null,
      v1Gone: !localStorage.getItem('leitner_v1'),
      v2Gone: !localStorage.getItem('leitner_v2')
    }));
    expect(boot.words).toEqual(['resilient', 'abundant']); // NOT ['obsolete', ...]
    expect(boot.words).not.toContain('obsolete');
    expect(boot.lt).toEqual(['perennial']);
    expect(boot.theme).toBe('dark');
    expect(boot.dailyGoal).toBe(30);
    expect(boot.level).toBe(9);
    expect(boot.totalReviews).toBe(300);
    expect(boot.fsrs).toEqual({ stability: 4.1, fsrsState: 'review', reps: 5 });
    // After the async IDB write, both legacy keys are cleared
    await expect.poll(() => page.evaluate(() => !localStorage.getItem('leitner_v1') && !localStorage.getItem('leitner_v2'))).toBe(true);
    // Refresh still has v2 data (from IndexedDB)
    await page.reload();
    await expect(page.locator('#hamBtn')).toBeVisible();
    const after = await page.evaluate(() => window.S.words.map(w => w.word));
    expect(after).toEqual(['resilient', 'abundant']);
  });

  test('flush-cache button in library removes app_cache_*/vf_cache_* but keeps vocabulary', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hamBtn')).toBeVisible();
    // Seed a few cache entries like the app does
    await page.evaluate(async () => {
      await idbPut('app_cache_trans:test', { translation: 'تست' });
      await idbPut('app_cache_dict:test', { ok: true });
      await idbPut('vf_cache_test', { ok: 1 });
      await idbPut('state', window.S); // state must survive
    });
    // Open Library (sidebar → library)
    await page.click('#hamBtn');
    await page.click('[data-tab="library"]');
    await expect(page.locator('#flushCacheBtn')).toBeVisible();
    // The confirm dialog must show the computed cache size before clearing
    const dialogMsg = new Promise(res => page.once('dialog', d => { res(d.message()); d.accept(); }));
    await page.click('#flushCacheBtn');
    const msg = await dialogMsg;
    expect(msg).toContain('3 آیتم');
    expect(msg).toMatch(/\d+(\.\d+)? [KBMB]/);
    await expect(page.locator('#flushCacheBtn')).toBeVisible();
    // After flush: cache keys gone, state + vocabulary intact
    const after = await page.evaluate(async () => {
      const db = await new Promise((res, rej) => {
        const rq = indexedDB.open('leitnerDB');
        rq.onsuccess = () => res(rq.result);
        rq.onerror = () => rej(rq.error);
      });
      const keys = await new Promise((res, rej) => {
        const req = db.transaction('data', 'readonly').objectStore('data').getAllKeys();
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      return {
        keys: keys.map(String).sort(),
        hasState: keys.map(String).includes('state'),
        words: window.S.words.length
      };
    });
    expect(after.hasState).toBe(true);
    expect(after.keys.some(k => k.startsWith('app_cache_') || k.startsWith('vf_cache_'))).toBe(false);
  });

  test('PWA: app + config.js boot fully offline after SW install', async ({ browser }) => {
    // The shared config blocks service workers for fast tests — use a dedicated
    // context that allows them so the real offline path is exercised.
    const ctx = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await ctx.newPage();
    try {
      // First visit (online): let the SW install & precache everything incl. config.js
      await page.goto('/');
      await expect(page.locator('#hamBtn')).toBeVisible();
      await page.waitForTimeout(2500); // let install/precache finish
      const swActive = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        return !!(reg && reg.active);
      });
      expect(swActive).toBe(true);

      // Assert config.js is in the precache
      const precached = await page.evaluate(async () => {
        const cache = await caches.open(await caches.keys().then(ks => ks.find(k => k.includes('leitner-pro-max-'))));
        return (await cache.keys()).map(r => new URL(r.url).pathname);
      });
      expect(precached).toContain('/js/config.js');

      // Kill the network (CDP) and reload — must still boot
      const client = await ctx.newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
      try {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await expect(page.locator('#hamBtn')).toBeVisible({ timeout: 15000 });
        // boot.js is the last module; wait until the boot actually rendered the nav
        await expect.poll(() => page.evaluate(() => document.querySelectorAll('[data-tab]').length), { timeout: 15000 }).toBeGreaterThan(1);
        const boot = await page.evaluate(() => ({
          appStarted: typeof window.S !== 'undefined' && !!window.S,
          nav: document.querySelectorAll('[data-tab]').length
        }));
        expect(boot.appStarted).toBe(true);
        expect(boot.nav).toBeGreaterThan(1);
      } finally {
        await client.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      }
    } finally {
      await ctx.close();
    }
  });
});