const CACHE_NAME = "margdarshak-student-v1";

const STUDENT_ROUTES = [
  "/student/login",
  "/student/signup",
  "/student/dashboard",
  "/student/courses",
  "/student/notes",
  "/student/results",
  "/student/profile",
  "/student/verify-email"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STUDENT_ROUTES))
  );
  self.skipWaiting();
});

// Activate
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

// Fetch (student-only)
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 🚫 Ignore non-student requests
  if (!url.pathname.startsWith("/student/")) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache =>
          cache.put(event.request, clone)
        );
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
