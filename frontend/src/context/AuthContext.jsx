import { createContext, useContext, useState, useEffect } from 'react';
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
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseEnabled) {
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

          let role = 'fan';
          try {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              role = userSnap.data().role || 'fan';
            } else {
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
          } catch (dbErr) {
            console.warn('Firestore user fetch failed, defaulting to email rules or fan role:', dbErr.message);
            if (firebaseUser.email?.endsWith('@stadiumpulse.com')) {
              role = 'staff';
            } else if (firebaseUser.email?.endsWith('@stadiumpulse-admin.com')) {
              role = 'organizer';
            }
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

  const signInAsDemoRole = (role) => {
    const demoUser = {
      uid: `demo_user_${role}`,
      email: `${role}@stadiumpulse-demo.com`,
      displayName: `${role.charAt(0).toUpperCase() + role.slice(1)} Experience`,
      role,
      token: `demo_token_for_${role}`,
      isDemo: true,
    };

    setUser(demoUser);
    localStorage.setItem('stadiumpulse_user', JSON.stringify(demoUser));

    console.log(`Started instant demo session as: ${role}`);
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
      console.error('Firebase Google Sign In failed:', error.message);
      throw error;
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
