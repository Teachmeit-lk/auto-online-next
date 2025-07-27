// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS1Ol30f8qhRKO6ZXKmZWXPawJ-BxZj_Q",
  authDomain: "auto-online-e261c.firebaseapp.com",
  projectId: "auto-online-e261c",
  storageBucket: "auto-online-e261c.firebasestorage.app",
  messagingSenderId: "767047010611",
  appId: "1:767047010611:web:a9446ee9dcd7da10361646",
  measurementId: "G-TXET6MN8SC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only in browser environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;