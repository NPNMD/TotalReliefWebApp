import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAtBRrVvheg2cIVyBq7RfXLTRlwXGhyw6Q",
  authDomain: "totalreliefmd.firebaseapp.com",
  projectId: "totalreliefmd",
  storageBucket: "totalreliefmd.firebasestorage.app",
  messagingSenderId: "906049680832",
  appId: "1:906049680832:web:76093f680d8a3009398425",
  measurementId: "G-CT16QBMPPC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app); // Added Realtime Database
export const analytics = getAnalytics(app);
export const messaging = getMessaging(app);
export default app;
