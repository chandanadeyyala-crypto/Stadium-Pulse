import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  isFirebaseEnabled, 
  googleProvider 
} from '../config/firebase';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle Firebase auth listener
  useEffect(() => {
    if (!isFirebaseEnabled) {
      // Bypassed if firebase is disabled
      const savedUser = localStorage.getItem('stadiumpulse_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          
          // Fetch user role from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          let role = 'fan';
          
          if (userSnap.exists()) {
            role = userSnap.data().role || 'fan';
          } else {
            // Document doesn't exist, create it (default to fan, or if email matches specific patterns)
            let emailRole = 'fan';
            if (firebaseUser.email?.endsWith('@stadiumpulse.com')) {
              emailRole = 'staff';
            } else if (firebaseUser.email?.endsWith('@stadiumpulse-admin.com')) {
              emailRole = 'organizer';
            }
            
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Fan User',
              role: emailRole,
              createdAt: new Date().toISOString()
            });
            role = emailRole;
          }

          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Fan',
            role: role,
            token: token
          };

          setUser(userData);
          localStorage.setItem('stadiumpulse_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error fetching user profile in auth state change:', error.message);
        }
      } else {
        // User is logged out of Firebase. Check if they are logged in as a local demo user
        const saved = localStorage.getItem('stadiumpulse_user');
        const parsed = saved ? JSON.parse(saved) : null;
        if (parsed && parsed.uid.startsWith('demo_user_')) {
          setUser(parsed);
        } else {
          setUser(null);
          localStorage.removeItem('stadiumpulse_user');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sandbox demo helper
  const signInAsDemoRole = async (role) => {
    if (isFirebaseEnabled) {
      try {
        setLoading(true);
        // Sign in anonymously to Firebase
        const credential = await signInAnonymously(auth);
        const firebaseUser = credential.user;
        
        // Write their role to Firestore users collection
        const userRef = doc(db, 'users', firebaseUser.uid);
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: `${role}@stadiumpulse-demo.com`,
          displayName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role: role,
          createdAt: new Date().toISOString()
        });
        console.log(`Signed in anonymously to Firebase as role: ${role}`);
      } catch (error) {
        console.error('Anonymous demo sign-in failed, falling back to mock session:', error.message);
        // Mock fallback if Firebase anonymous auth is disabled
        const demoUser = {
          uid: `demo_user_${role}`,
          email: `${role}@stadiumpulse-demo.com`,
          displayName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          role: role,
          token: `demo_token_for_${role}`
        };
        setUser(demoUser);
        localStorage.setItem('stadiumpulse_user', JSON.stringify(demoUser));
      } finally {
        setLoading(false);
      }
    } else {
      // Pure local mock mode
      const demoUser = {
        uid: `demo_user_${role}`,
        email: `${role}@stadiumpulse-demo.com`,
        displayName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role,
        token: `demo_token_for_${role}`
      };
      setUser(demoUser);
      localStorage.setItem('stadiumpulse_user', JSON.stringify(demoUser));
      console.log(`Signed in successfully as Demo role: ${role}`);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseEnabled) {
      signInAsDemoRole('fan');
      return;
    }
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.warn('Firebase Google Sign In failed, falling back to mock Google Sign In:', error.message);
      // Fallback mock login so the app works seamlessly during demo/testing
      const demoUser = {
        uid: 'google_demo_user',
        email: 'google-user@gmail.com',
        displayName: 'Google Fan User',
        role: 'fan',
        token: 'mock_google_token'
      };
      setUser(demoUser);
      localStorage.setItem('stadiumpulse_user', JSON.stringify(demoUser));
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    if (!isFirebaseEnabled) {
      signInAsDemoRole('fan');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email Sign In failed:', error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isFirebaseEnabled) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Sign Out failed:', error.message);
      }
    }
    setUser(null);
    localStorage.removeItem('stadiumpulse_user');
    console.log('User signed out.');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInAsDemoRole,
      loginWithGoogle,
      loginWithEmail,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
