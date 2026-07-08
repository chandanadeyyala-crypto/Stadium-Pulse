import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from local session to keep page refreshes clean
  useEffect(() => {
    const savedUser = localStorage.getItem('stadiumpulse_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Demo sign-in that bypasses full auth
  const signInAsDemoRole = (role) => {
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('stadiumpulse_user');
    console.log('User signed out.');
  };

  const loginWithGoogleMock = () => {
    // Standard mock for Google OAuth login
    signInAsDemoRole('fan');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signInAsDemoRole,
      loginWithGoogleMock,
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
