const CACHE_NAME = "margdarshak-pwa-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

// Cache PDFs for offline view
self.addEventListener("fetch", event => {
  const { request } = event;

  if (request.destination === "document" || request.url.endsWith(".pdf")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      })
    );
  }
});
