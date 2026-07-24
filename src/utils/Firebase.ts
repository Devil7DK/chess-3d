import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth, signInAnonymously, User } from 'firebase/auth';
import { Database, getDatabase } from 'firebase/database';

import { firebaseConfig, isFirebaseConfigured } from './FirebaseConfig';

let app: FirebaseApp | undefined;

const getFirebaseApp = (): FirebaseApp => {
    if (!isFirebaseConfigured) {
        throw new Error(
            'Firebase is not configured. Set the VITE_FIREBASE_* variables (see .env.example)',
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
