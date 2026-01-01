const CACHE_NAME = 'expense-tracker-v1';
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Install event - cache resources
self.addEventListener('install', (event) => {
  if (isDev) {
    // In dev mode, skip waiting immediately
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        const urlsToCache = ['/', '/home', '/budgets', '/analysis', '/profile', '/login', '/signup'];
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('Cache install failed (non-critical):', error);
        });
      })
      .catch((error) => {
        console.error('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests - always use network
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('localhost:5001') ||
      event.request.url.includes('onrender.com') ||
      event.request.url.includes('_next/')) {
    return;
  }

  // In dev mode, always use network first
  if (isDev) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

