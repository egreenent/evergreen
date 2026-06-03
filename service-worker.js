const CACHE_NAME = 'evergreen-dashboard-v2';

// শুধু local ফাইল cache করা — external URL নয়
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './member-dashboard.html',
  './admin.html',
  './logo.png',
  './manifest.json'
];

// Install — local assets cache করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching local assets');
      // addAll এর বদলে আলাদাভাবে add — একটা fail হলে বাকিগুলো থামবে না
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(e => console.warn('[SW] Cache skip:', url)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate — পুরনো cache মুছে ফেলা
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — request handle করা
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Google APIs, Fonts, Scripts — সরাসরি network এ যাবে, cache হবে না
  if (
    url.includes('script.google.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('cdnjs.cloudflare.com') ||
    url.includes('ui-avatars.com') ||
    url.includes('raw.githubusercontent.com')
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Local files — cache first, তারপর network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Background এ update করা
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
