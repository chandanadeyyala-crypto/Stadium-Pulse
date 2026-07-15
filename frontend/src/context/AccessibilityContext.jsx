import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('accessibility_high_contrast') === 'true');
  const [textScale, setTextScale] = useState(() => localStorage.getItem('accessibility_text_scale') || 'normal'); // normal, large, extra
  const [speechEnabled, setSpeechEnabled] = useState(() => localStorage.getItem('accessibility_speech_enabled') === 'true');

  const [routePreference, setRoutePreference] = useState(() => localStorage.getItem('accessibility_route_preference') || 'fastest'); // fastest, least_crowded, wheelchair, family
  const [language, setLanguage] = useState(() => localStorage.getItem('accessibility_language') || 'English');
  const [theme, setTheme] = useState(() => localStorage.getItem('accessibility_theme') || 'dark'); // light, dark

  useEffect(() => {
    const root = document.documentElement;

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_high_contrast', highContrast);

    root.classList.remove('large-text', 'large-text-extra');
    if (textScale === 'large') {
      root.classList.add('large-text');
    } else if (textScale === 'extra') {
      root.classList.add('large-text-extra');
    }
    localStorage.setItem('accessibility_text_scale', textScale);

    root.classList.remove('theme-light', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    localStorage.setItem('accessibility_theme', theme);

    localStorage.setItem('accessibility_speech_enabled', speechEnabled);
    localStorage.setItem('accessibility_route_preference', routePreference);
    localStorage.setItem('accessibility_language', language);
  }, [highContrast, textScale, speechEnabled, routePreference, language, theme]);

  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

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
      theme,
      setTheme,
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
