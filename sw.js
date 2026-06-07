const CACHE = 'eg-chat-v1';
const ASSETS = [
  '/evergreen/evergreen-chat.html',
  '/evergreen/logo.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase ও Apps Script request cache করবো না
  if(e.request.url.includes('firebaseio') ||
     e.request.url.includes('googleapis') ||
     e.request.url.includes('script.google')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
