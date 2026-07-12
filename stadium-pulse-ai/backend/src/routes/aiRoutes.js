import express from 'express';
import { normalizeQuestion } from '../utils/normalizeQuestion.js';
import { cacheService } from '../services/cacheService.js';
import { venueDataService } from '../services/venueDataService.js';
import { askWithFallback } from '../services/aiService.js';
import { translateText } from '../services/translationService.js';
import { verifyAuthToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/ai/ask - Fan and staff assistant grounded Q&A
router.post('/ask', verifyAuthToken, async (req, res) => {
  const { question, language = 'English', stadiumId, location } = req.body;
  const role = req.user?.role || 'fan';

  if (!question) {
    return res.status(400).json({ error: 'Missing question in request body.' });
  }

  try {
    const normalized = normalizeQuestion(question);

    // 1. Check in-memory cache
    const cachedResponse = await cacheService.getQuery(normalized, role, language);
    if (cachedResponse) {
      return res.json({
        success: true,
        response: cachedResponse,
        cached: true
      });
    }

    // 2. Fetch context from verified stadium records
    const contextText = await venueDataService.findRelevantContext(normalized);

    // 3. Fallback check: If no verified context matches, bypass LLM to prevent hallucination
    if (!contextText || contextText.trim() === '') {
      const emptyContextResponse = `Answer: I don’t have verified information for that right now.
Source: Grounding Check
Reason: The venue query did not map to any active gate, section, facility, or staff report.
Action: Please check the spelling of your gate/section or consult an information kiosk.`;
      
      return res.json({
        success: true,
        response: emptyContextResponse,
        cached: false
      });
    }

    // 4. Query AI model pipeline (Gemini -> Groq -> Local Mock)
    let aiResponse = await askWithFallback(question, contextText);

    // 5. If user requested a translation, translate the final AI answer
    if (language.toLowerCase() !== 'english' && language.toLowerCase() !== 'en') {
      aiResponse = await translateText(aiResponse, language);
    }

    // 6. Save answer in cache
    await cacheService.setQuery(normalized, role, language, aiResponse);

    res.json({
      success: true,
      response: aiResponse,
      cached: false
    });
  } catch (error) {
    console.error('Error in Q&A assistant route:', error.message);
    res.status(500).json({
      error: 'AI Service Error',
      message: 'Failed to process the question. Please try again later.'
    });
  }
});

// POST /api/ai/translate - Translate alert or description
router.post('/translate', verifyAuthToken, async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: 'Missing parameters: text and targetLang are required.' });
  }

  try {
    const translated = await translateText(text, targetLang);
    res.json({
      success: true,
      originalText: text,
      targetLanguage: targetLang,
      translatedText: translated
    });
  } catch (error) {
    console.error('Error in translation route:', error.message);
    res.status(500).json({
      error: 'Translation Service Error',
      message: error.message
    });
  }
});

export default router;
