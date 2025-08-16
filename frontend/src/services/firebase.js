import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Debug: Check which config values are missing
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase config values:', missingKeys);
  console.error('Current config:', firebaseConfig);
} else {
  console.log('✅ Firebase config loaded successfully');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analytics;
try {
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics initialization skipped:', error.message);
}

const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, firestore, auth };
export default app;