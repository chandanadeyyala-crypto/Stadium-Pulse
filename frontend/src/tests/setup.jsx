import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Firebase app
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

// Mock Firebase auth
vi.mock('firebase/auth', () => {
  return {
    getAuth: vi.fn(() => ({})),
    GoogleAuthProvider: class {},
    signInWithPopup: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn((auth, cb) => {
      // By default, simulate no logged-in user
      cb(null);
      return () => {};
    }),
  };
});

// Mock Firebase firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));

// Mock Geolocation API
if (typeof navigator !== 'undefined') {
  Object.defineProperty(navigator, 'geolocation', {
    value: {
      getCurrentPosition: vi.fn((success) => success({
        coords: {
          latitude: 51.505,
          longitude: -0.09,
        }
      })),
      watchPosition: vi.fn(() => 1),
      clearWatch: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
}

// Mock SpeechSynthesis and DOM layout methods
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
  };
  window.SpeechSynthesisUtterance = function(text) {
    return {
      text: text,
      lang: 'en-US',
    };
  };
}

// Mock Leaflet & React-Leaflet Map components
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({
    setView: vi.fn(),
    flyTo: vi.fn(),
  }),
}));

vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
  },
  icon: vi.fn(() => ({})),
}));

// Mock Axios
const mockAxiosInstance = {
  get: vi.fn(() => Promise.resolve({ data: [] })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  create: vi.fn(() => mockAxiosInstance),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  }
};

vi.mock('axios', () => ({
  default: mockAxiosInstance,
  ...mockAxiosInstance
}));
