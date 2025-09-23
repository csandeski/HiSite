// Firebase configuration for push notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - Replace with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummy-Key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "radioplay-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "radioplay-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "radioplay-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:dummy",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DUMMY"
};

// VAPID Key for Web Push - Replace with your key from Firebase Console
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BKagOny0KF_dummy_vapid_key";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging with proper browser support check
let messaging: any = null;

// Check for full browser support before initializing messaging
const isMessagingSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    // Check for HTTPS or localhost (required for service workers)
    (window.location.protocol === 'https:' || 
     window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1')
  );
};

// Only initialize messaging if fully supported
if (isMessagingSupported()) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging could not be initialized:', error);
    messaging = null;
  }
} else {
  console.warn('Push notifications are not supported in this browser');
}

export { app, messaging, getToken, onMessage, VAPID_KEY };