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

    const hasFirebaseCredentials =
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      privateKey &&
      privateKey.includes('PRIVATE KEY');

    if (hasFirebaseCredentials) {
      const config = {
        projectId: process.env.FIREBASE_PROJECT_ID
      };

      // Only load cert credential if details exist and look like a real private key cert
      if (process.env.FIREBASE_CLIENT_EMAIL && privateKey && privateKey.includes('PRIVATE KEY')) {
        config.credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        });
      }

      firebaseApp = admin.initializeApp(config);

      try {
        db = admin.firestore();
        console.log('Firestore initialized successfully in backend.');
      } catch (dbErr) {
        console.warn('Firestore failed to initialize in backend. Operating without database backing. Error:', dbErr.message);
      }

      console.log('Firebase Admin SDK initialized successfully with Project ID:', process.env.FIREBASE_PROJECT_ID);
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
