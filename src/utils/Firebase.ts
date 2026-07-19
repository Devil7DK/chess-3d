import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously, User } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';

const firebaseConfig: FirebaseOptions = {
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

let app: FirebaseApp | undefined;

const getFirebaseApp = (): FirebaseApp => {
    if (!isFirebaseConfigured) {
        throw new Error(
            'Firebase is not configured — set the VITE_FIREBASE_* variables (see .env.example)',
        );
    }

    app ??= initializeApp(firebaseConfig);

    return app;
};

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp());

export const getFirebaseDatabase = (): Database =>
    getDatabase(getFirebaseApp());

/**
 * Resolves with the signed-in user, creating an anonymous session if none
 * exists. Firebase persists the anonymous user across reloads, so the same
 * uid is kept as long as site data isn't cleared.
 */
export const ensureSignedIn = async (): Promise<User> => {
    const auth = getFirebaseAuth();

    await auth.authStateReady();

    if (auth.currentUser) {
        return auth.currentUser;
    }

    const credential = await signInAnonymously(auth);

    return credential.user;
};
