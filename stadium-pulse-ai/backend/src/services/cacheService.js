import { db } from '../config/firebaseAdmin.js';

// In-memory cache structures
const queryCache = new Map();
const translationCache = new Map();

function hashKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const cacheService = {
  async getQuery(question, role, language) {
    const key = hashKey(`${question}_${role}_${language}`);

    if (db) {
      try {
        const cachedDoc = await db.collection('aiCache').doc(key).get();
        if (cachedDoc.exists) {
          const data = cachedDoc.data();
          console.log(`[Firestore Cache Hit] Serving cached answer for: "${question}"`);
          return data.answer;
        }
      } catch (err) {
        console.warn('[Cache Service] Firestore getQuery failed, using memory. Error:', err.message);
      }
    }

    const entry = queryCache.get(key);
    if (entry && Date.now() - entry.timestamp < 1000 * 60 * 5) {
      entry.hits++;
      console.log(`[Memory Cache Hit] Serving cached answer for: "${question}"`);
      return entry.answer;
    }
    return null;
  },

  async setQuery(question, role, language, answer) {
    const key = hashKey(`${question}_${role}_${language}`);

    if (db) {
      try {
        await db.collection('aiCache').doc(key).set({
          question,
          normalizedQuestion: hashKey(question),
          answer,
          role,
          language,
          timestamp: new Date().toISOString()
        });
        console.log(`[Firestore Cache Set] Cached response for: "${question}"`);
      } catch (err) {
        console.warn('[Cache Service] Firestore setQuery failed. Error:', err.message);
      }
    }

    queryCache.set(key, {
      answer,
      timestamp: Date.now(),
      hits: 0
    });
    console.log(`[Memory Cache Set] Cached response for: "${question}"`);
  },

  async getTranslation(text, targetLang) {
    const key = hashKey(`${text}_to_${targetLang}`);

    if (db) {
      try {
        const cachedDoc = await db.collection('translationCache').doc(key).get();
        if (cachedDoc.exists) {
          const data = cachedDoc.data();
          return data.translatedText;
        }
      } catch (err) {
        console.warn('[Cache Service] Firestore getTranslation failed, using memory. Error:', err.message);
      }
    }

    const entry = translationCache.get(key);
    if (entry && Date.now() - entry.timestamp < 1000 * 60 * 60 * 24) {
      return entry.translatedText;
    }
    return null;
  },

  async setTranslation(text, targetLang, translatedText) {
    const key = hashKey(`${text}_to_${targetLang}`);

    if (db) {
      try {
        await db.collection('translationCache').doc(key).set({
          text,
          targetLang,
          translatedText,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[Cache Service] Firestore setTranslation failed. Error:', err.message);
      }
    }

    translationCache.set(key, {
      translatedText,
      timestamp: Date.now()
    });
  },

  clear() {
    queryCache.clear();
    translationCache.clear();
    console.log('[Cache Cleared] Memory structures reset.');
  }
};
