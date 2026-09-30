import { APP_CONFIG } from './config.js';
import { MS_PER_DAY, PDF_DEFAULT_SCALE, PDF_THUMB_SCALE, FSRS_DECAY_COEFF, LIST_PAGE_SIZE } from './core/constants.js';
import { esc, errMsg, uid, fmtDate, todayKey } from './core/utils.js';
import { loadDep, ensureChartJs, ensurePdfJs, ensureJsZip } from './core/dependencies.js';
import { withErrorBoundary } from './core/error-handler.js';
import { LS_KEY, LS_KEY_V1, LS_KEY_OLD, LS_BACKUP_KEY, SCHEMA_VERSION, IDB_NAME, IDB_STORE, openDB, idbPut, idbGet } from './storage/indexeddb.js';
import { S, save, saveForce, saveNow, loadFromIDB, sanitizeCard, hydrateState, defaultState, loadLegacyState, loadState, stateSnapshotSizeKB, renderStorageMeter } from './storage/state.js';
import { sanitizeStateSnapshot, exportStateSnapshot, importStateSnapshot, exportSharedDeck, exportSharedDeckJSON, exportSharedDeckLink, importSharedDeck, checkSharedDeckHash, BACKUP_STORE, BACKUP_META_STORE, MAX_BACKUPS, openBackupDb, autoBackup, listSnapshots, restoreSnapshot, exportBackup, restoreBackup, deleteSnapshot } from './storage/backup.js';
import { createCard, rebuildIndex, wordExists, FREQ_T1, FREQ_T2, FREQ_T3, getFrequencyTier, tierLabel } from './vocabulary/vocabulary.js';
import { buildCardRepository } from './vocabulary/card-repository.js';
import { getCardRepository, resetCardRepository, repoAdd, cardRepository } from './vocabulary/card-repository-bridge.js';
import { getPlayerId, submitScore, getLeaderboard, renderLeaderboard } from './statistics/leaderboard.js';
import { FSRS_W, FSRS_RETENTION, FSRS_MAX_INTERVAL, FSRS_DECAY, fsrsRetrieveProbability, fsrsInitialDifficulty, fsrsInitialStability, fsrsShortTermStability, fuzzInterval, fsrsNext, clampReviewValues, sm2Legacy, mapRating } from './learning/fsrs.js';
import { openWordDrill, getMemoryTrick, getUsageTip, generateWordQuiz } from './learning/word-drill.js';
import { speedState, renderSpeedReview, listenState, renderListening } from './learning/review-modes.js';
import { reviewSession, findCardById, autoPlayState, AUTO_PLAY_SPEEDS, stopAutoPlay, startAutoPlay, autoPlayTick, autoPlayScheduleNext, updateAutoPlayCountdown, renderAutoPlayBar, getDue, dueCards, getDueAll, prioritizeReviewQueue, startReview, renderReview, rateReview, reviewKeyHandler } from './learning/review.js';
import { DICT_API, MYMEMORY_API, RETRY_MAX, FETCH_TIMEOUT_MS, retryDelay, timedFetch, fetchWithRetry, LANGUAGES, normalizeWordLookup, playAudioUrl, PRONUNCIATION_DIALECTS, getVoicesByDialect, speakWord, decodeHtmlEntities, APP_CACHE_TTL, appCacheKey, appCacheLookup, appCacheInvalidate, flushLookupCaches, lookupCacheSizeBytes, fitBytes, fetchDictionaryRaw, fetchTranslation, myMemoryAvailable, myMemoryMarkDead, fetchTranslationRaw, fetchPersianTranslation, fetchEtymology, fetchWiktionaryDefinitions, fetchWiktionaryDefinitionsRaw, MORPH_SUFFIXES, getMorphologicalFamily, COMMON_COLLOCATIONS, suggestCollocations, getFrequencyRank, fetchDictionary, fetchEtymologyCached } from './vocabulary/enrichment.js';
import { hideTransPopup, positionTransPopup, renderTransPopup } from './ui/translation-popup.js';
import { renderExport } from './vocabulary/export.js';
import { renderStats, buildHeatmap, buildForecast } from './statistics/statistics.js';
import { renderCalendar } from './statistics/calendar.js';
import { getDailyChallenge, renderDailyChallengeWidget, RELEASE_HISTORY, ABOUT_FEATURES, CURRENT_RELEASE_FEATURES, aboutFeatureMarkup, releaseMarkup, renderAbout } from './ui/dashboard.js';
import { libSelected, toggleLibSelect, updateBulkBar, getAllTags, tagCount, openTagManager, assignTagToIds, removeTagFromIds, bulkAddTagPrompt, bulkRemoveTagPrompt, quizStrengthLabel, isAdaptiveQuiz, DRIVE_SCOPE, DRIVE_FILE, driveSettings, loadGisLib, handleTokenResp, initTokenClient, ensureDriveToken, driveFindFile, driveUpload, driveDownload, syncNow, restoreFromDrive, disconnectDrive, maybeAutoSync, checkDriveOnLoad } from './ui/tags-drive.js';
import { trackWordAdded, toast } from './ui/toast.js';
import { renderAiChat } from './ai/ai-manager.js';

// ── Expose core API on window so legacy non-module scripts can still access them ──
// (These assignments will be removed one-by-one as each module is migrated)
Object.assign(window, {
  APP_CONFIG,
  // Constants
  MS_PER_DAY, PDF_DEFAULT_SCALE, PDF_THUMB_SCALE, FSRS_DECAY_COEFF, LIST_PAGE_SIZE, SCHEMA_VERSION,
  IDB_NAME, IDB_STORE, LS_KEY, LS_KEY_V1, LS_KEY_OLD, LS_BACKUP_KEY,
  // Utils & Core
  esc, errMsg, uid, fmtDate, todayKey,
  loadDep, ensureChartJs, ensurePdfJs, ensureJsZip,
  withErrorBoundary,
  // Storage, State & Backup
  openDB, idbPut, idbGet, loadFromIDB,
  save, saveForce, saveNow,
  sanitizeCard, hydrateState, defaultState, loadLegacyState, loadState, stateSnapshotSizeKB, renderStorageMeter,
  sanitizeStateSnapshot, exportStateSnapshot, importStateSnapshot,
  exportSharedDeck, exportSharedDeckJSON, exportSharedDeckLink, importSharedDeck, checkSharedDeckHash,
  BACKUP_STORE, BACKUP_META_STORE, MAX_BACKUPS, openBackupDb, autoBackup, listSnapshots, restoreSnapshot, exportBackup, restoreBackup, deleteSnapshot,
  // Vocabulary & Repository
  createCard, rebuildIndex, wordExists, FREQ_T1, FREQ_T2, FREQ_T3, getFrequencyTier, tierLabel,
  __createCardRepositoryFactory: buildCardRepository,
  buildCardRepository, getCardRepository, resetCardRepository, repoAdd, cardRepository,
  // Enrichment & Translation Popup
  DICT_API, MYMEMORY_API, RETRY_MAX, FETCH_TIMEOUT_MS, retryDelay, timedFetch, fetchWithRetry, LANGUAGES,
  normalizeWordLookup, playAudioUrl, PRONUNCIATION_DIALECTS, getVoicesByDialect, speakWord, decodeHtmlEntities,
  APP_CACHE_TTL, appCacheKey, appCacheLookup, appCacheInvalidate, flushLookupCaches, lookupCacheSizeBytes, fitBytes,
  fetchDictionaryRaw, fetchTranslation, myMemoryAvailable, myMemoryMarkDead, fetchTranslationRaw, fetchPersianTranslation,
  fetchEtymology, fetchWiktionaryDefinitions, fetchWiktionaryDefinitionsRaw, MORPH_SUFFIXES, getMorphologicalFamily,
  COMMON_COLLOCATIONS, suggestCollocations, getFrequencyRank, fetchDictionary, fetchEtymologyCached,
  hideTransPopup, positionTransPopup, renderTransPopup,
  // Export, Statistics, Calendar & Dashboard
  renderExport,
  renderStats, buildHeatmap, buildForecast,
  renderCalendar,
  getDailyChallenge, renderDailyChallengeWidget, RELEASE_HISTORY, ABOUT_FEATURES, CURRENT_RELEASE_FEATURES, aboutFeatureMarkup, releaseMarkup, renderAbout,
  // Tags & Drive Sync
  libSelected, toggleLibSelect, updateBulkBar, getAllTags, tagCount, openTagManager, assignTagToIds, removeTagFromIds, bulkAddTagPrompt, bulkRemoveTagPrompt,
  quizStrengthLabel, isAdaptiveQuiz,
  DRIVE_SCOPE, DRIVE_FILE, driveSettings, loadGisLib, handleTokenResp, initTokenClient, ensureDriveToken, driveFindFile, driveUpload, driveDownload, syncNow, restoreFromDrive, disconnectDrive, maybeAutoSync, checkDriveOnLoad,
  // Leaderboard
  getPlayerId, submitScore, getLeaderboard, renderLeaderboard,
  // FSRS & Review
  FSRS_W, FSRS_RETENTION, FSRS_MAX_INTERVAL, FSRS_DECAY,
  fsrsRetrieveProbability, fsrsInitialDifficulty, fsrsInitialStability, fsrsShortTermStability,
  fuzzInterval, fsrsNext, clampReviewValues, sm2Legacy, mapRating,
  openWordDrill, getMemoryTrick, getUsageTip, generateWordQuiz,
  speedState, renderSpeedReview, listenState, renderListening,
  reviewSession, findCardById, autoPlayState, AUTO_PLAY_SPEEDS, stopAutoPlay, startAutoPlay, autoPlayTick, autoPlayScheduleNext, updateAutoPlayCountdown, renderAutoPlayBar,
  getDue, dueCards, getDueAll, prioritizeReviewQueue, startReview, renderReview, rateReview, reviewKeyHandler,
  // Toast & AI
  trackWordAdded, toast, renderAiChat
});

// ── Legacy script loader (for modules not yet converted to ES Modules) ──
const LEGACY_MODULES = [
  './js/ui/navigation.js',
  './js/vocabulary/library.js',
  './js/vocabulary/import.js',
  './js/pdf/reader.js',
  './js/pdf/pdf-mobile.js',
  './js/reading/reading.js',
  './js/ui/settings.js',
  './js/learning/quiz.js',
  './js/word-web/word-web.js',
  './js/ui/help-vocabforge.js',
  './js/vocabulary/packs.js',
  './js/core/boot.js'
];

function loadClassicScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadApplication() {
  for (const moduleUrl of LEGACY_MODULES) {
    await loadClassicScript(moduleUrl);
  }
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js', {
      scope: './'
    });
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated' && navigator.serviceWorker.controller) {
          window.dispatchEvent(new CustomEvent('leitner:updated'));
        }
      });
    });
    console.info(`[PWA] ${APP_CONFIG.repository} ${APP_CONFIG.version}:`, registration.scope);
  } catch (error) {
    console.warn('[PWA] Service worker registration failed:', error);
  }
}

try {
  await loadApplication();
  await registerServiceWorker();
} catch (error) {
  console.error('[Leitner] Application failed to start:', error);
  const content = document.getElementById('content');
  if (content) {
    content.innerHTML = '<div class="card" style="text-align:center;padding:40px"><div class="empty"><div class="icon">⚠️</div><p>خطا در بارگذاری برنامه</p><p style="font-size:.8rem;color:var(--text2);margin-top:8px">صفحه را بازنشانی کنید.</p><button class="btn btn-ghost btn-sm" type="button" onclick="location.reload()" style="margin-top:12px">بازنشانی صفحه</button></div></div>';
  }
}
