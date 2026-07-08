/**
 * StadiumPulse AI Caching Service
 * Currently runs a high-performance in-memory cache.
 * Follow instructions in comments to swap this with Firestore or Redis when deploying to production.
 */

// In-memory cache structures
const queryCache = new Map();
const translationCache = new Map();

/**
 * Normalizes cache keys by removing spaces, casing, and punctuation.
 */
function hashKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const cacheService = {
  /**
   * Retrieves a cached AI response.
   * 
   * TO MIGRATE TO FIRESTORE:
   * const cached = await db.collection('aiCache').doc(hashKey(question)).get();
   * return cached.exists ? cached.data().answer : null;
   */
  getQuery(question, role, language) {
    const key = hashKey(`${question}_${role}_${language}`);
    const entry = queryCache.get(key);
    
    if (entry && Date.now() - entry.timestamp < 1000 * 60 * 5) { // 5 minutes TTL
      entry.hits++;
      console.log(`[Cache Hit] Serving cached answer for: "${question}"`);
      return entry.answer;
    }
    return null;
  },

  /**
   * Caches an AI response.
   * 
   * TO MIGRATE TO FIRESTORE:
   * await db.collection('aiCache').doc(hashKey(question)).set({
   *   question, normalizedQuestion: hashKey(question), answer, role, language,
   *   timestamp: admin.firestore.FieldValue.serverTimestamp()
   * });
   */
  setQuery(question, role, language, answer) {
    const key = hashKey(`${question}_${role}_${language}`);
    queryCache.set(key, {
      answer,
      timestamp: Date.now(),
      hits: 0
    });
    console.log(`[Cache Set] Cached response for: "${question}"`);
  },

  /**
   * Retrieves a cached translation.
   */
  getTranslation(text, targetLang) {
    const key = hashKey(`${text}_to_${targetLang}`);
    const entry = translationCache.get(key);
    
    if (entry && Date.now() - entry.timestamp < 1000 * 60 * 60 * 24) { // 24 hours TTL
      return entry.translatedText;
    }
    return null;
  },

  /**
   * Caches a translation.
   */
  setTranslation(text, targetLang, translatedText) {
    const key = hashKey(`${text}_to_${targetLang}`);
    translationCache.set(key, {
      translatedText,
      timestamp: Date.now()
    });
  },

  /**
   * Clears the cache.
   */
  clear() {
    queryCache.clear();
    translationCache.clear();
    console.log('[Cache Cleared] Memory structures reset.');
  }
};
