importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAtBRrVvheg2cIVyBq7RfXLTRlwXGhyw6Q",
  authDomain: "totalreliefmd.firebaseapp.com",
  projectId: "totalreliefmd",
  storageBucket: "totalreliefmd.firebasestorage.app",
  messagingSenderId: "906049680832",
  appId: "1:906049680832:web:76093f680d8a3009398425",
  measurementId: "G-CT16QBMPPC"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // Ensure you have an icon in public/
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event);
  event.notification.close();

  // Handle specific actions
  if (event.action === 'answer') {
      // Open dashboard to answer call
      event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(windowClients) {
          for (var i = 0; i < windowClients.length; i++) {
            var client = windowClients[i];
            if ((client.url.indexOf('/dashboard') !== -1 || client.url.indexOf(self.registration.scope) !== -1) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
      );
  } else if (event.action === 'decline') {
      // Just close notification (already done above)
      // Optionally send a signal to server if we wanted to decline explicitly from background
  } else {
      // Default click behavior (open app)
      event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true}).then(function(windowClients) {
          for (var i = 0; i < windowClients.length; i++) {
            var client = windowClients[i];
            if ((client.url.indexOf('/dashboard') !== -1 || client.url.indexOf(self.registration.scope) !== -1) && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/dashboard');
          }
        })
      );
  }
});

