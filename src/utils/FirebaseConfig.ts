import type { FirebaseOptions } from 'firebase/app';

// Deliberately SDK-free (the firebase import above is type-only) so UI code
// can check isFirebaseConfigured without pulling the SDK into the main
// bundle — see the note in ./index.ts.
export const firebaseConfig: FirebaseOptions = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Remote play is only offered when the build was given a Firebase config;
 * everything else (local & AI games) works without one.
 */
export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
        firebaseConfig.databaseURL &&
        firebaseConfig.projectId,
);
