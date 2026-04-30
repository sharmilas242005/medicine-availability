// Firebase app setup using modular SDK (v9+).
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getMessaging, isSupported } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging.js";

// Replace with your Firebase project config from Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyDwDlYsjPnSC4aswAYdRrzgDrqkHVGlC1E",
  authDomain: "cloud-91426.firebaseapp.com",
  projectId: "cloud-91426",
  storageBucket: "cloud-91426.firebasestorage.app",
  messagingSenderId: "178882696827",
  appId: "1:178882696827:web:4cb20484872a8a9ab9b4de"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Messaging can fail in unsupported browsers, so guard the initialization.
async function setupMessaging() {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
}

export { app, auth, db, setupMessaging };
