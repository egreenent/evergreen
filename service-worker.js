// ক্যাশের একটি নির্দিষ্ট নাম এবং ভার্সন সেট করা হলো
const CACHE_NAME = 'evergreen-dashboard-v1';

// ১. প্রথমে ক্যাশ করার ফাইলগুলোর তালিকা একদম ওপরে তৈরি করে নিতে হবে (সঠিক নিয়ম)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './member-dashboard.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// ২. সার্ভিস ওয়ার্কার ইনস্টল করার সময় ফাইলগুলো ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core dashboard assets');
      // ভ্যারিয়েবল উপরে থাকায় এখন এটি সফলভাবে ফাইলগুলো ক্যাশ করতে পারবে
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// ৩. পুরোনো ক্যাশ ফাইল পরিষ্কার করা (যখন ভার্সন আপডেট হবে)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache storage:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ৪. নেটওয়ার্ক রিকোয়েস্ট হ্যান্ডল করা
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.href.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
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