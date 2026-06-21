// Firebase initialization. This and the repo files are the ONLY places that
// import from `firebase/*`. Everything above the data layer works with domain
// types (see src/domain).
//
// The web config below is public client configuration (it ships in every web
// build and is not a secret). Values can be overridden via VITE_FIREBASE_*
// env vars; the defaults are the production "win-the-day-bcb3b" project.
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCmadAWVY2oh8fT7kpg40u7YK8tr8WAjhM',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? 'win-the-day-bcb3b.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID ?? 'win-the-day-bcb3b',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET ?? 'win-the-day-bcb3b.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '630435934005',
  appId: env.VITE_FIREBASE_APP_ID ?? '1:630435934005:web:710efedf655aa341cc267c',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-QCHK4PXW4E',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Point at the local Firebase Emulator Suite when VITE_USE_EMULATORS=true,
// so the whole app can be exercised end-to-end without touching production.
if (env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.info('[firebase] connected to local emulators (auth:9099, firestore:8080)');
}
