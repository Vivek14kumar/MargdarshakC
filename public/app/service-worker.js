const CACHE_NAME = "margdarshak-pwa-v3";
const PDF_CACHE = "margdarshak-pdf-cache-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== PDF_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// ✅ Cache ONLY PDFs
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache PDFs
  if (request.url.endsWith(".pdf")) {
    event.respondWith(
      caches.open(PDF_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          cache.put(request, response.clone());
          return response;
        } catch {
          return cached;
        }
      })
    );
  }
});
