import { admin } from '../config/firebaseAdmin.js';
import dotenv from 'dotenv';

dotenv.config();

const isDemo = process.env.DEMO_MODE === 'true';

/**
 * Express middleware to verify Firebase ID tokens.
 * In DEMO_MODE, it bypasses verification and attaches a simulated user based on Headers.
 */
export async function verifyAuthToken(req, res, next) {
  // 1. Check if running in Demo Mode
  if (isDemo) {
    // Check if the request specifies a demo role header, otherwise default to fan
    const demoRole = req.headers['x-demo-role'] || 'fan';
    req.user = {
      uid: `demo_user_${demoRole}`,
      email: `${demoRole}@stadiumpulse-demo.com`,
      role: demoRole,
      email_verified: true
    };
    return next();
  }

  // 2. Production token verification
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Access denied. No authorization token provided.' 
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // To enable Firebase token verification, ensure Admin SDK was successfully initialized in firebaseAdmin.js
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    
    // Attach custom user roles if they are set on the token claims
    // e.g., decodedToken.role could be 'fan', 'volunteer', 'staff', 'organizer'
    if (!req.user.role) {
      req.user.role = 'fan'; // Default role
    }

    next();
  } catch (error) {
    console.error('Firebase Auth verification failed:', error.message);
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Invalid or expired authentication token.' 
    });
  }
}
