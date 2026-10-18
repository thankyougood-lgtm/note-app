/* ===== Note app: service worker ===== */

// Change the number whenever you edit any app file
const CACHE = "note-app-5.3.0";

const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./js/main.js",
  "./js/db.js",
  "./js/utils.js",
  "./js/store.js",
  "./js/notes.js",
  "./js/render.js",
  "./js/ui.js",
  "./js/events.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
];

// 1. Install: precache all the app files
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// 2. Activate: delete caches from older versions
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

// 3. Fetch: answer the browser's requests
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;

  // Opening the app: ask the server first.
  // If the server is stopped or there is no internet, use the saved page.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("./index.html", copy));
          }
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Other files: saved copy first (fast), and refresh it quietly in the background
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const fresh = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fresh;
    })
  );
});
