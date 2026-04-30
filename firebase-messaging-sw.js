/* eslint-disable no-undef */
// Firebase Cloud Messaging service worker (compat build for worker support).
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDwDlYsjPnSC4aswAYdRrzgDrqkHVGlC1E",
  authDomain: "cloud-91426.firebaseapp.com",
  projectId: "cloud-91426",
  storageBucket: "cloud-91426.firebasestorage.app",
  messagingSenderId: "178882696827",
  appId: "1:178882696827:web:4cb20484872a8a9ab9b4de"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Medicine Availability Finder";
  const options = {
    body: payload?.notification?.body || "A new medicine update is available."
  };
  self.registration.showNotification(title, options);
});
