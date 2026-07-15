import express from 'express';
import { normalizeQuestion } from '../utils/normalizeQuestion.js';
import { cacheService } from '../services/cacheService.js';
import { venueDataService } from '../services/venueDataService.js';
import { askWithFallback } from '../services/aiService.js';
import { translateText } from '../services/translationService.js';
import { verifyAuthToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/ask', verifyAuthToken, async (req, res) => {
  const { question, language = 'English', stadiumId, location } = req.body;
  const role = req.user?.role || 'fan';

  if (!question) {
    return res.status(400).json({ error: 'Missing question in request body.' });
  }

  try {
    const normalized = normalizeQuestion(question);

    const cachedResponse = await cacheService.getQuery(normalized, role, language);
    if (cachedResponse) {
      return res.json({
        success: true,
        response: cachedResponse,
        cached: true
      });
    }

    const contextText = await venueDataService.findRelevantContext(normalized);

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

    let aiResponse = await askWithFallback(question, contextText);

    if (language.toLowerCase() !== 'english' && language.toLowerCase() !== 'en') {
      aiResponse = await translateText(aiResponse, language);
    }

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

router.post('/translate', async (req, res) => {
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


function getLocalFallbackAnalysis(text, inputLang, role) {
  const cleaned = text.toLowerCase();
  let category = 'other';
  let location = 'General';
  let urgency = 'medium';
  let severity = 'info';
  let details = text;
  let actionRequired = 'monitor';
  let targetAudience = 'fans';
  let actionableInstruction = text;


  if (cleaned.includes('gate b') || cleaned.includes('puerta b') || cleaned.includes('porte b')) {
    location = 'Gate B';
  } else if (cleaned.includes('gate d') || cleaned.includes('puerta d') || cleaned.includes('porte d')) {
    location = 'Gate D';
  } else if (cleaned.includes('section 214') || cleaned.includes('sec 214') || cleaned.includes('sección 214') || cleaned.includes('seccion 214')) {
    location = 'Section 214';
  } else if (cleaned.includes('restroom') || cleaned.includes('baño') || cleaned.includes('toilet') || cleaned.includes('toilette')) {
    location = 'Restroom R2';
  }

  if (cleaned.includes('medica') || cleaned.includes('medico') || cleaned.includes('sick') || cleaned.includes('hurt') || cleaned.includes('dolor') || cleaned.includes('doctor')) {
    category = 'medical';
    urgency = 'high';
    severity = 'critical';
    actionRequired = 'dispatch medical staff';
  } else if (cleaned.includes('crowd') || cleaned.includes('fila') || cleaned.includes('congestion') || cleaned.includes('lleno') || cleaned.includes('queue') || cleaned.includes('busy')) {
    category = 'crowd';
    urgency = 'high';
    severity = 'warning';
    actionRequired = 'redirect crowd';
  } else if (cleaned.includes('restroom') || cleaned.includes('baño') || cleaned.includes('water') || cleaned.includes('agua') || cleaned.includes('escalator') || cleaned.includes('elevator') || cleaned.includes('trash')) {
    category = 'facilities';
    actionRequired = 'dispatch maintenance team';
  } else if (cleaned.includes('wheelchair') || cleaned.includes('ramp') || cleaned.includes('access') || cleaned.includes('disability') || cleaned.includes('silla de ruedas')) {
    category = 'accessibility';
    actionRequired = 'assist disabled visitor';
  } else if (cleaned.includes('fight') || cleaned.includes('seguridad') || cleaned.includes('danger') || cleaned.includes('security') || cleaned.includes('fire') || cleaned.includes('fuego')) {
    category = 'safety';
    urgency = 'high';
    severity = 'critical';
    actionRequired = 'notify operations response team';
  }

  let englishTranslation = text;
  if (inputLang === 'Spanish') {
    if (cleaned.includes('puerta b está muy llena')) englishTranslation = "Gate B is very crowded.";
    else if (cleaned.includes('no hay agua')) englishTranslation = "There is no water in the restroom.";
    else if (cleaned.includes('me siento mal')) englishTranslation = "I feel sick.";
    else englishTranslation = `[Spanish Translation] ${text}`;
  } else if (inputLang === 'French') {
    if (cleaned.includes('porte b est bondée')) englishTranslation = "Gate B is crowded.";
    else if (cleaned.includes('perdu mon sac')) englishTranslation = "I lost my bag.";
    else englishTranslation = `[French Translation] ${text}`;
  }

  if (role === 'fan') {
    details = `Fan complaint regarding ${category} at ${location}: ${englishTranslation}`;
    return JSON.stringify({
      englishTranslation,
      category,
      location,
      urgency,
      cleanedDescription: details
    });
  } else if (role === 'volunteer' || role === 'staff') {
    return JSON.stringify({
      englishTranslation,
      category,
      location,
      severity,
      details: englishTranslation,
      actionRequired
    });
  } else {
    targetAudience = location !== 'General' ? `fans near ${location}` : 'all fans';
    actionableInstruction = `Attention: ${englishTranslation}`;
    return JSON.stringify({
      englishTranslation,
      targetAudience,
      locationAffected: location,
      actionableInstruction,
      severity
    });
  }
}

router.post('/process-query', verifyAuthToken, async (req, res) => {
  const { text, inputLang, role } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter.' });
  }

  const prompt = `You are a FIFA operations intelligence assistant. Process the following input:
Language of origin: ${inputLang}
User role: ${role}
Input text: "${text}"

Perform the following:
1. Translate the text into English (if it is not English).
2. Based on the user's role (${role}), analyze and extract structured details:
   - For role "fan" (reporting a complaint):
     Extract Category (facilities, crowd, safety, medical, accessibility, other), Location (e.g. Gate B, Section 214, Concourse East, or "General" if unspecified), Cleaned Description (clear, professional English summary of the issue), and Urgency (low, medium, high).
   - For role "volunteer" or "staff" (reporting field status or incident):
     Extract Category (facilities, crowd, safety, medical, accessibility, other), Location (e.g. Gate B), Details (concise summary of update), Severity (info, warning, critical), and ActionRequired (what needs to be done, e.g., 'dispatch crew', 'monitor', 'none').
   - For role "organizer" (broadcasting alerts/instructions):
     Extract TargetAudience (e.g., fans near Gate B, all staff, medical crew), Location (e.g. Gate B, Section 214), ActionableInstruction (the command or broadcast alert content), and Severity (info, warning, critical).

Format the output EXACTLY as a JSON object. Do not include markdown code block syntax (like \`\`\`json). The JSON keys must be:
{
  "englishTranslation": "The full translation of the text to English",
  "category": "facilities|crowd|safety|medical|accessibility|other",
  "location": "extracted location",
  "urgency": "low|medium|high",
  "severity": "info|warning|critical",
  "details": "concise English summary",
  "actionRequired": "action description",
  "targetAudience": "audience description",
  "actionableInstruction": "instruction content"
}`;

  try {
    let aiRaw = '';
    try {
      aiRaw = await askWithFallback(prompt, "You are a StadiumPulse Operations Assistant. Output valid JSON only.");
    } catch (err) {
      console.warn('AI call failed, using mock client fallback. Error:', err.message);
      aiRaw = getLocalFallbackAnalysis(text, inputLang, role);
    }

    const cleanJson = aiRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    res.json({ success: true, analysis: parsed });
  } catch (error) {
    console.error('Error in process-query route:', error.message);
    res.status(500).json({ error: 'Processing error', message: error.message });
  }
});

export default router;
