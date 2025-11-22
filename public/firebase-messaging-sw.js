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

