const CACHE_NAME = "crm-cache-v3";
const STATIC_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "https://unpkg.com/dexie@3.2.3/dist/dexie.js",
  "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  "https://fonts.googleapis.com/icon?family=Material+Icons+Round"
];

// INSTALL → Preload all static assets
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE))
  );
});

// ACTIVATE → Clean old cache versions
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// FETCH → STALE-WHILE-REVALIDATE (Fastest pattern)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(networkRes => {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, networkRes.clone());
        });
        return networkRes;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
