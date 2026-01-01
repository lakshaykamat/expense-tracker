const CACHE_NAME = 'expense-tracker-static-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
];

// Install — cache ONLY truly static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// Fetch — cache ONLY static files, never pages
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // ❌ NEVER intercept navigation (App Router needs network)
  if (request.mode === 'navigate') {
    return;
  }

  // ❌ Never touch Next.js internals or APIs
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api')
  ) {
    return;
  }

  // ✅ Cache static assets only
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        });
      })
    );
  }
});
