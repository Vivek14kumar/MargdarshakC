const CACHE_NAME = "margdarshak-app-v1";

/* Cache only app shell routes */
const APP_SHELL = [
  "/app/login",
  "/app/signup"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 🚫 Ignore non-app routes
  if (!url.pathname.startsWith("/app") && !url.pathname.startsWith("/student")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
