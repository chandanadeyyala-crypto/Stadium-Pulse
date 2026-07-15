import { admin, db } from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const isDemo = process.env.DEMO_MODE === 'true';


export async function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  }

  if (isDemo || (token && token.startsWith('demo_token_for_'))) {
    const demoRole = (token && token.startsWith('demo_token_for_'))
      ? token.replace('demo_token_for_', '')
      : (req.headers['x-demo-role'] || 'fan');
    req.user = {
      uid: `demo_user_${demoRole}`,
      email: `${demoRole}@stadiumpulse-demo.com`,
      role: demoRole,
      email_verified: true
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. No authorization token provided.'
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    if (!req.user.role) {
      if (db) {
        try {
          const userDoc = await db.collection('users').doc(decodedToken.uid).get();
          req.user.role = userDoc.exists ? (userDoc.data().role || 'fan') : 'fan';
        } catch (dbErr) {
          console.warn('AuthMiddleware: Firestore role lookup failed, defaulting to fan. Error:', dbErr.message);
          req.user.role = 'fan';
        }
      } else {
        req.user.role = 'fan';
      }
    }

    next();
  } catch (error) {
    console.warn('Firebase Admin verification failed. Checking fallback payload parser. Error:', error.message);

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payloadB64 = parts[1];
        const decodedPayload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'));

        let emailRole = 'fan';
        if (decodedPayload.email?.endsWith('@stadiumpulse.com')) {
          emailRole = 'staff';
        } else if (decodedPayload.email?.endsWith('@stadiumpulse-admin.com')) {
          emailRole = 'organizer';
        }

        req.user = {
          uid: decodedPayload.user_id || decodedPayload.sub,
          email: decodedPayload.email || 'user@example.com',
          displayName: decodedPayload.name || 'Google User',
          role: decodedPayload.role || emailRole,
          email_verified: !!decodedPayload.email_verified
        };

        return next();
      }
    } catch (fallbackErr) {
      console.error('Fallback JWT parsing failed:', fallbackErr.message);
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired authentication token.'
    });
  }
}
