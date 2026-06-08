importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAW0gcp3PUr3jRb3ZpS9j7IzT2gLb3U1qw",
  authDomain: "evergreen-db-9323c.firebaseapp.com",
  projectId: "evergreen-db-9323c",
  storageBucket: "evergreen-db-9323c.firebasestorage.app",
  messagingSenderId: "820228868303",
  appId: "1:820228868303:web:fd799a57051587a7af0fba",
  databaseURL: "https://evergreen-db-9323c-default-rtdb.firebaseio.com"
});

const messaging = firebase.messaging();

// Background notification
messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'EverGreen Chat', {
    body: body || 'নতুন মেসেজ এসেছে',
    icon: '/evergreen/logo.png',
    badge: '/evergreen/logo.png',
    data: { url: '/evergreen/evergreen-chat.html' }
  });
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/evergreen/evergreen-chat.html')
  );
});
