const CACHE_NAME = 'snagline-offline-v1';
const APP_ASSETS = [
  './',
  './index.html',
  './inspection.html',
  './dashboard.html',
  './apartments.html',
  './activity.html',
  './reports.html',
  './financials.html',
  './styles.css',
  './responsive.css',
  './dashboard.css',
  './cloud-auth.css',
  './app.js',
  './cloud-sync.js',
  './cloud-config.js',
  './offline.js',
  './apartments.js',
  './activity.js',
  './reports.js',
  './financials.js',
  './dashboard.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('snagline-offline-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  }));
});
