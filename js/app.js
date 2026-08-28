import { APP_CONFIG } from './config.js';

const MODULES = [
  './js/core/dependencies.js',
  './js/core/constants.js',
  './js/storage/indexeddb.js',
  './js/core/utils.js',
  './js/storage/state.js',
  './js/core/error-handler.js',
  './js/vocabulary/vocabulary.js',
  './js/vocabulary/card-repository.js',
  './js/vocabulary/card-repository-bridge.js',
  './js/storage/backup.js',
  './js/statistics/leaderboard.js',
  './js/learning/fsrs.js',
  './js/learning/review.js',
  './js/ui/toast.js',
  './js/vocabulary/enrichment.js',
  './js/ui/translation-popup.js',
  './js/ui/navigation.js',
  './js/vocabulary/library.js',
  './js/vocabulary/import.js',
  './js/pdf/reader.js',
  './js/pdf/pdf-mobile.js',
  './js/reading/reading.js',
  './js/vocabulary/export.js',
  './js/statistics/statistics.js',
  './js/statistics/calendar.js',
  './js/ui/dashboard.js',
  './js/ui/settings.js',
  './js/learning/quiz.js',
  './js/ai/ai-manager.js',
  './js/word-web/word-web.js',
  './js/ui/help-vocabforge.js',
  './js/ui/tags-drive.js',
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
  for (const moduleUrl of MODULES) {
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
