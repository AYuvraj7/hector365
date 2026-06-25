const CACHE = 'hector365-v3';
const FILES = ['./index.html', './manifest.json', './logo.png'];

// On install, pre-cache the core files (used as offline fallback only)
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

// On activate, delete any old caches so stale versions never linger
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always try to get the latest file from the internet.
// Only fall back to cache if the network request fails (offline).
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Save a fresh copy in cache for offline use later
        const resClone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
