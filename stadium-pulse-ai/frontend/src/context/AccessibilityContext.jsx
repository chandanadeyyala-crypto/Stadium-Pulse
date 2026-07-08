import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  // Theme & Layout Preferences
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('accessibility_high_contrast') === 'true');
  const [textScale, setTextScale] = useState(() => localStorage.getItem('accessibility_text_scale') || 'normal'); // normal, large, extra
  const [speechEnabled, setSpeechEnabled] = useState(() => localStorage.getItem('accessibility_speech_enabled') === 'true');
  
  // Navigation & Routing Preferences
  const [routePreference, setRoutePreference] = useState(() => localStorage.getItem('accessibility_route_preference') || 'fastest'); // fastest, least_crowded, wheelchair, family
  const [language, setLanguage] = useState(() => localStorage.getItem('accessibility_language') || 'English');

  // Apply contrast & text scaling on boot/change
  useEffect(() => {
    const root = document.documentElement;
    
    // 1. Apply High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_high_contrast', highContrast);

    // 2. Apply Text Scaling
    root.classList.remove('large-text', 'large-text-extra');
    if (textScale === 'large') {
      root.classList.add('large-text');
    } else if (textScale === 'extra') {
      root.classList.add('large-text-extra');
    }
    localStorage.setItem('accessibility_text_scale', textScale);
    
    // Save other settings
    localStorage.setItem('accessibility_speech_enabled', speechEnabled);
    localStorage.setItem('accessibility_route_preference', routePreference);
    localStorage.setItem('accessibility_language', language);
  }, [highContrast, textScale, speechEnabled, routePreference, language]);

  // Voice synthesis helpers (TTS)
  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any active reading
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt language mapping
    const langMap = {
      English: 'en-US',
      Spanish: 'es-ES',
      SpanishLatAm: 'es-MX',
      French: 'fr-FR',
      German: 'de-DE',
      Hindi: 'hi-IN',
      Telugu: 'te-IN'
    };
    utterance.lang = langMap[language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      setHighContrast,
      textScale,
      setTextScale,
      speechEnabled,
      setSpeechEnabled,
      routePreference,
      setRoutePreference,
      language,
      setLanguage,
      speakText,
      stopSpeaking
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
