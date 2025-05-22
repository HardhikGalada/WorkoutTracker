import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Check if Firebase is already initialized
let app

// Only initialize Firebase if API key is available
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY

if (apiKey) {
  const firebaseConfig = {
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  // Initialize Firebase only if it hasn't been initialized already
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
} else {
  console.warn("Firebase API key is missing. Authentication will not work.")
}

// Export auth and db conditionally
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = () => {
  return !!app && !!auth && !!db
}
