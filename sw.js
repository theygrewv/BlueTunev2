const CACHE_NAME = 'nimbus-v13-stable';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'https://cdn.jsdelivr.net/npm/hls.js@latest'
];

// Install: Cache all essential assets and skip waiting for the old version
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: The "Nuclear Cleanup" of old, broken versions
self.addEventListener('activate', (e) => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(), 
      caches.keys().then(keys => {
        return Promise.all(keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }));
      })
    ])
  );
});

// Fetch: Serve from cache, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
