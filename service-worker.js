// Keep this version aligned with js/config.js so GitHub Pages clients receive
// the same release across the application and service worker caches.
const CACHE_NAME = 'leitner-pro-max-v5.0.0';
const RUNTIME_CACHE = 'leitner-pro-max-runtime-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './css/base.css',
  './css/learning.css',
  './css/accessibility.css',
  './css/statistics.css',
  './css/reading.css',
  './css/components.css',
  './css/responsive.css',
  './js/app.js',
  './js/config.js',
  './js/core/dependencies.js',
  './js/core/constants.js',
  './js/storage/indexeddb.js',
  './js/core/utils.js',
  './js/storage/state.js',
  './js/state.js',
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
  './js/core/boot.js',
  './data/cefr.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const fallback = await caches.match('./index.html');
    return fallback || new Response('آفلاین هستید', {
      status: 503,
      headers: {'Content-Type': 'text/plain; charset=utf-8'}
    });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('آفلاین هستید', {
      status: 503,
      headers: {'Content-Type': 'text/plain; charset=utf-8'}
    });
  }
}
