// Service Worker for Blue Logic PWA v5.3
const CACHE_NAME = 'bluelogic-v5.3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // NEVER cache or intercept /api/ requests
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // For page navigation (HTML requests)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html').then(res => res || caches.match('/')))
    );
    return;
  }

  // Network-First for static assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => cached || (event.request.mode === 'navigate' ? caches.match('/index.html') : null));
      })
  );
});
