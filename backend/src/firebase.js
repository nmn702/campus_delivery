import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
// Locally, you should set the GOOGLE_APPLICATION_CREDENTIALS environment variable
// to point to your service account key JSON file.
// In production (e.g. Cloud Run, App Engine), this works automatically without credentials.

try {
    initializeApp();
} catch (error) {
    if (!/already exists/u.test(error.message)) {
        console.error('Firebase admin initialization error', error.stack);
    }
}
