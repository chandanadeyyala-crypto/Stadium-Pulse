import { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import axios from 'axios';

// In-memory cache for fast lookups across components
const translationCache = {};

export function useTranslation() {
  const { language } = useAccessibility();
  const [cacheVersion, setCacheVersion] = useState(0);

  // Initialize cache for current language if needed
  useEffect(() => {
    if (language && !translationCache[language]) {
      const stored = localStorage.getItem(`ui_translations_${language}`);
      translationCache[language] = stored ? JSON.parse(stored) : {};
    }
  }, [language]);

  const t = (text) => {
    // 1. If no text or language is English, return original text directly
    if (!text || !language || language === 'English') {
      return text;
    }

    const cache = translationCache[language] || {};
    
    // 2. If translation is already cached, return it immediately
    if (cache[text]) {
      return cache[text];
    }

    // 3. If translation request is not pending, trigger backend API call in background
    if (!cache[text] && !cache[`pending_${text}`]) {
      cache[`pending_${text}`] = true;
      translationCache[language] = cache;

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      axios.post(`${backendUrl}/api/ai/translate`, {
        text: text,
        targetLang: language
      })
      .then(res => {
        if (res.data && res.data.translatedText) {
          const cleanText = res.data.translatedText;
          // Save in cache
          cache[text] = cleanText;
          delete cache[`pending_${text}`];
          
          translationCache[language] = cache;
          localStorage.setItem(`ui_translations_${language}`, JSON.stringify(cache));
          
          // Trigger state update to force all active hook instances to re-render with new translations
          setCacheVersion(prev => prev + 1);
        }
      })
      .catch(err => {
        console.warn('AI Translation failed for:', text.substring(0, 15) + '...', err.message);
        delete cache[`pending_${text}`];
        translationCache[language] = cache;
      });
    }

    // While pending, return the original text
    return text;
  };

  return { t, language };
}
