// Sign-in entry points. Mirrors the providers offered by the Flutter app
// (lib/services/auth_service.dart): Google, Apple, and — DEV ONLY — anonymous.
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInAnonymously as fbSignInAnonymously,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth } from '../data/firebase';

/**
 * Whether to expose anonymous "Continue as guest" sign-in. Enabled in dev builds
 * (import.meta.env.DEV) or when VITE_ALLOW_ANON=true, so the app can be tested
 * end-to-end without real Google/Apple credentials. Compiled out of prod builds.
 */
export const ANON_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ALLOW_ANON === 'true';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signInWithApple() {
  // Web Sign in with Apple uses a Services ID configured in the Firebase console
  // + Apple Developer portal (distinct from the native App ID). See the plan.
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}

export async function signInAsGuest() {
  if (!ANON_ENABLED) throw new Error('Anonymous sign-in is disabled in this build');
  return fbSignInAnonymously(auth);
}

export async function signOut() {
  return fbSignOut(auth);
}
