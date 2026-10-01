// Firebase Admin initialisation + a reusable token-verification helper.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from '../config/env.js';

/** Thrown when Firebase credentials are missing or invalid in the environment. */
export class AuthNotConfiguredError extends Error {
  constructor() {
    super('Firebase Admin is not configured');
    this.name = 'AuthNotConfiguredError';
  }
}

let firebaseAuth = null;

const hasCredentials =
  env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY;

if (hasCredentials) {
  try {
    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
    firebaseAuth = getAuth(app);
    console.log('✓ Firebase Admin initialized');
  } catch (err) {
    console.error('✗ Firebase Admin initialization FAILED');
    console.error(`  Reason: ${err.message}`);
    console.error('  Check FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.');
  }
} else {
  console.warn(
    '! Firebase credentials missing (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY). ' +
      'Protected routes will not work until they are set.'
  );
}

/**
 * Verifies a Firebase ID token and returns the decoded claims.
 * Throws if the token is invalid/expired, or AuthNotConfiguredError if Firebase isn't set up.
 */
export async function verifyIdToken(idToken) {
  if (!firebaseAuth) throw new AuthNotConfiguredError();
  return firebaseAuth.verifyIdToken(idToken);
}
