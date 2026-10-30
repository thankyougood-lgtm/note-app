/* ==========================================================================
   SERVICE WORKER — Enables offline-first functionality
   Caches app shell files so the app works without internet.
   ========================================================================== */

const CACHE_NAME = 'noteapp-cache-v14';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',

  '/css/main.css',
  '/css/print.css',
  '/css/base/reset.css',
  '/css/base/variables.css',
  '/css/base/typography.css',
  '/css/base/dark-theme.css',
  '/css/layout/container.css',
  '/css/layout/header.css',
  '/css/layout/drawer.css',
  '/css/layout/pages.css',
  '/css/layout/bottom-nav.css',
  '/css/components/search-bar.css',
  '/css/components/quick-actions.css',
  '/css/components/note-card.css',
  '/css/components/fab-button.css',
  '/css/components/modal.css',
  '/css/components/confirm-dialog.css',
  '/css/components/toast.css',

  '/js/app.js',
  '/js/modules/storage.js',
  '/js/modules/notes.js',
  '/js/modules/folders.js',
  '/js/modules/render.js',
  '/js/modules/navigation.js',
  '/js/modules/search.js',
  '/js/modules/theme.js',
  '/js/modules/export.js',
  '/js/utils/generateId.js',
  '/js/utils/dateFormat.js',
  '/js/utils/dialogs.js',
  '/js/pwa/registerSW.js',
  '/js/pwa/installPrompt.js',

  '/assets/icons/icon-72.png',
  '/assets/icons/icon-96.png',
  '/assets/icons/icon-128.png',
  '/assets/icons/icon-144.png',
  '/assets/icons/icon-152.png',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-384.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png'
];

/* ---- INSTALL: Cache all app files ---- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* ---- ACTIVATE: Clean up old caches ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

/* ---- FETCH: Serve from cache first, fallback to network, fallback to offline page ---- */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (like Google Fonts) — let browser handle normally
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});
