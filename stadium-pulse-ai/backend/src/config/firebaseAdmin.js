import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const isDemo = process.env.DEMO_MODE === 'true';
let firebaseApp = null;
let db = null;

if (!isDemo) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      db = admin.firestore();
      console.log('Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('Firebase Admin credentials missing. Operating in local mode (Firebase Admin disabled).');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
} else {
  console.log('Running in DEMO_MODE: Firebase Admin initialization bypassed.');
}

export { admin, db, firebaseApp };
