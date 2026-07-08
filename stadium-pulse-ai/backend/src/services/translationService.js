import { callGemini, callGroq } from './aiService.js';
import { cacheService } from './cacheService.js';

/**
 * Translates a given block of text to the target language.
 * Uses Gemini Flash first, falls back to Groq, and then falls back to original text if both fail.
 * Integrates with cacheService to avoid redundant API billing/quota usage.
 */
export async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang.toLowerCase() === 'en' || targetLang.toLowerCase() === 'english') {
    return text; // Return text as is for empty, missing, or English conversions if original is English
  }

  // Check cache first
  const cachedTranslation = cacheService.getTranslation(text, targetLang);
  if (cachedTranslation) {
    console.log(`[Cache Hit] Serving cached translation for: "${text.substring(0, 20)}..." to ${targetLang}`);
    return cachedTranslation;
  }

  const prompt = `Translate the following text into target language: "${targetLang}". 
Only return the translated text. Do not include quotes, explanations, or introductory statements.

Text to translate:
"${text}"`;

  const systemInstruction = "You are a professional translator for the FIFA World Cup 2026. Translate accurately and naturally. Do not output anything else but the translation.";

  try {
    console.log(`[Translate API] Calling Gemini for translation to: ${targetLang}`);
    const translation = await callGemini(prompt, systemInstruction);
    const cleaned = translation.replace(/^["']|["']$/g, '').trim(); // Strip quotes
    cacheService.setTranslation(text, targetLang, cleaned);
    return cleaned;
  } catch (geminiError) {
    console.warn('Gemini translation failed, falling back to Groq. Error:', geminiError.message);

    try {
      console.log(`[Translate API] Calling Groq for translation to: ${targetLang}`);
      const translation = await callGroq(prompt, systemInstruction);
      const cleaned = translation.replace(/^["']|["']$/g, '').trim();
      cacheService.setTranslation(text, targetLang, cleaned);
      return cleaned;
    } catch (groqError) {
      console.warn('All translation APIs failed. Returning original text. Error:', groqError.message);

      // Return a simulated mock translation if keys are missing (so translations works in full demo mode)
      const simulatedTranslations = {
        es: {
          "Gate B (South Entrance) is experiencing heavy crowd inflow. Security queues are approximately 30 minutes. Consider using Gate D.": "La Puerta B (Entrada Sur) está experimentando una gran afluencia de público. Las colas de seguridad son de aproximadamente 30 minutos. Considere usar la Puerta D.",
          "Gate D is open with minimal queues. Recommended for fastest entrance.": "La Puerta D está abierta con colas mínimas. Recomendado para una entrada más rápida.",
          "Gate B is closed due to overcrowding. Use Gate D.": "La Puerta B está cerrada debido al hacinamiento. Use la Puerta D."
        },
        fr: {
          "Gate B (South Entrance) is experiencing heavy crowd inflow. Security queues are approximately 30 minutes. Consider using Gate D.": "La porte B (entrée sud) connaît un afflux important de foule. Les files d'attente de sécurité sont d'environ 30 minutes. Pensez à utiliser la porte D.",
          "Gate D is open with minimal queues. Recommended for fastest entrance.": "La porte D est ouverte avec des files d'attente minimales. Recommandé pour l'entrée la plus rapide.",
          "Gate B is closed due to overcrowding. Use Gate D.": "La porte B est fermée en raison de la surpopulation. Utilisez la porte D."
        }
      };

      const langCode = targetLang.toLowerCase().substring(0, 2);
      if (simulatedTranslations[langCode] && simulatedTranslations[langCode][text]) {
        return simulatedTranslations[langCode][text];
      }

      // Default translation fallback
      return `[Translated to ${targetLang}] ${text}`;
    }
  }
}
