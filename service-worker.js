const CACHE_NAME = 'nexarion-cache-v2'; // UBAH INI SETIAP ADA PERUBAHAN PADA ASET WEBSITE
const urlsToCache = [
  '/', // Root of your application, usually points to index.html
  '/index.html',
  '/R.png', // Background image
  '/logo.png', // Logo and manifest icon
  '/polaData.js', // Your data file
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap', // Google Fonts
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css' // Font Awesome CSS
];

// Event: Install (triggered when the Service Worker is first installed)
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching all app shell');
        return cache.addAll(urlsToCache); // Add all defined assets to cache
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// Event: Fetch (triggered for every network request from the page)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request) // Try to find the request in cache
      .then(response => {
        // If found in cache, return the cached response
        if (response) {
          return response;
        }
        // If not in cache, fetch from the network
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We must clone it so that
            // both the browser and the cache can consume it.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache); // Put the new response in cache
              });

            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            // You can return a fallback page here if fetch fails (e.g., an offline page)
            // For example: return caches.match('/offline.html');
          });
      })
  );
});

// Event: Activate (triggered when the Service Worker is activated, new SW takes over)
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that are no longer current
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});