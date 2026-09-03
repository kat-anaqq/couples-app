const CACHE = 'vdvoem-shell-v16';
self.addEventListener('install', (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll([
          '/app.html',
          '/app.css',
          '/app.js',
          '/price-engine.js',
          '/manifest.webmanifest',
          '/favicon.svg',
          '/favicon-32x32.png',
          '/favicon.ico',
          '/apple-touch-icon.png',
          '/icon-192.png',
          '/icon-512.png',
        ]),
      )
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/'))
    return;
  if (
    ['document', 'script', 'style', 'manifest', 'image'].includes(
      event.request.destination,
    )
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          void caches
            .open(CACHE)
            .then((cache) => cache.put(event.request, copy))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
  }
});
