/* ===== PWA: registers the service worker (offline support) ===== */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("sw.js").catch((err) =>
    console.log("Service worker not registered:", err)
  );
}
