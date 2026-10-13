/* ===== Note or Not: service worker ===== */

// Change this number every time you edit any app file,
// so users get the new version instead of the old cache.
const CACHE = "note-or-not-v1";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

// 1. Install: save all files in the cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// 2. Activate: delete old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// 3. Fetch: answer from the cache first, then the network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // save new same-site files for next time
          if (response.ok && new URL(event.request.url).origin === location.origin) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          // offline and not cached: show the app page for page loads
          if (event.request.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});