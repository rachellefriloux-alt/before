import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Get build flavor from Expo config
const buildFlavor = Constants.expoConfig?.extra?.buildFlavor || 'cloud';
const isLocalOnly = Constants.expoConfig?.extra?.isLocalOnly || false;

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBaQJLn_pOrdbNfzo0vh5hGfQ11cudv3b0",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "sallie2025001.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "sallie2025001",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "sallie2025001.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1036741251722",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1036741251722:android:49fff50dfbab956edd5373"
};

// Log Firebase configuration for debugging
console.log(`🔥 Firebase Config - Flavor: ${buildFlavor}, Local: ${isLocalOnly}, Project: ${firebaseConfig.projectId}`);

// Initialize Firebase (avoid multiple initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const firebaseApp = app;

export default app;