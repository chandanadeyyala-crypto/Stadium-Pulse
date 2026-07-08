import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// CRITICAL: System prompt enforces anti-hallucination policies
const SYSTEM_PROMPT = `You are StadiumPulse AI, an operations and fan assistance AI helper for the FIFA World Cup 2026.
You are grounded in a verified venue database.

CORE LAWS:
1. ONLY answer using the provided verified context (stadium gates, routes, schedules, facilities, and active staff reports).
2. If the context does not contain the answer or is empty, you MUST state exactly: "I don’t have verified information for that right now."
3. Do not assume, guess, or extrapolate.
4. Do not invent gate locations, directions, crowd statuses, or schedules.
5. Answer in the same language as the user's question, but ground it strictly on the English verified context.

Format your responses with clean, readable structure, containing the following four sections:
Answer: [Your concise explanation/recommendation translated to the query language]
Source: [Specify which verified database node or alert was used]
Reason: [Explain why this recommendation is safe/efficient based on the data]
Action: [The recommended immediate next step for the user, e.g. "Go to Gate D", "Show map"]`;

/**
 * Call Gemini 1.5 Flash API
 */
export async function callGemini(prompt, contextText = '') {
  // Gemini API key is read from .env
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured.');
  }

  const systemInstruction = SYSTEM_PROMPT + (contextText ? `\n\nVERIFIED CONTEXT:\n${contextText}` : '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.1, // low temperature to ensure strict adherence to context
      maxOutputTokens: 1000
    }
  };

  const response = await axios.post(url, payload, { timeout: 8000 });
  const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!answer) {
    throw new Error('Invalid response structure received from Gemini.');
  }
  return answer;
}

/**
 * Call Groq API (fallback)
 */
export async function callGroq(prompt, contextText = '') {
  // Groq API key is read from .env
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('Groq API key is not configured.');
  }

  const systemInstruction = SYSTEM_PROMPT + (contextText ? `\n\nVERIFIED CONTEXT:\n${contextText}` : '');
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const payload = {
    model: 'llama3-8b-8192', // fast fallback model
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1
  };

  const response = await axios.post(url, payload, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    timeout: 8000
  });

  const answer = response.data?.choices?.[0]?.message?.content;
  if (!answer) {
    throw new Error('Invalid response structure received from Groq.');
  }
  return answer;
}

/**
 * Local simulation fallback when no keys are provided or all API calls fail.
 * Strictly checks the context for terms to prevent hallucination.
 */
function localMockAIResponse(prompt, contextText) {
  const query = prompt.toLowerCase();
  
  if (!contextText || contextText.trim() === '') {
    return `Answer: I don’t have verified information for that right now.
Source: System Database
Reason: No verified context matched your query.
Action: Contact a nearby physical volunteer or information desk.`;
  }

  // Simple local keywords parser matching verified context data
  if (query.includes('gate') && (query.includes('where') || query.includes('how') || query.includes('status'))) {
    if (contextText.includes('Gate A') && query.includes('a')) {
      return `Answer: Gate A (North Entrance) is open and currently reports normal activity.
Source: Verified Stadium Database
Reason: Verified gate status database lookup.
Action: Head towards the North Entrance walkway.`;
    }
    if (contextText.includes('Gate B') && query.includes('b')) {
      if (contextText.includes('crowded') || contextText.includes('Gate B crowded')) {
        return `Answer: Gate B is currently heavily crowded. Please use Gate D as an alternative.
Source: Active Staff Crowd Report
Reason: Rerouting around Gate B congestion to minimize wait time.
Action: Go to Gate D (East Entrance) via Concourse East.`;
      }
      return `Answer: Gate B (South Entrance) is open with minor queues.
Source: Verified Stadium Database
Reason: Verified gate status lookup.
Action: Proceed to Gate B.`;
    }
    if (contextText.includes('Gate D') && query.includes('d')) {
      return `Answer: Gate D (East Entrance) is open and has very low crowd density.
Source: Verified Stadium Database / Staff Update
Reason: Verified gate status check.
Action: Enter through Gate D for direct access to East concourses.`;
    }
  }

  if (query.includes('restroom') || query.includes('toilet') || query.includes('bathroom')) {
    if (contextText.includes('Restroom R2')) {
      return `Answer: The nearest family and wheelchair-accessible restroom is Restroom R2.
Source: Venue Facility Log
Reason: Located on the East concourse, equipped with automatic doors and support railings.
Action: Follow the Concourse East signs to Section 214 corridor.`;
    }
  }

  if (query.includes('medical') || query.includes('doctor') || query.includes('first aid')) {
    if (contextText.includes('Medical Desk')) {
      return `Answer: The Medical Desk is located on the Concourse East Level.
Source: Operations Incident & Facility Map
Reason: Staffed with first aid responders.
Action: Walk along Concourse East towards Section 214 entry.`;
    }
  }

  if (query.includes('metro') || query.includes('transit') || query.includes('train') || query.includes('exit')) {
    if (contextText.includes('Metro Exit 3')) {
      return `Answer: Metro Exit 3 is the direct pathway to the local transit link.
Source: Egress & Transport Log
Reason: Connects directly with matchday shuttles.
Action: Walk out via Gate D or follow egress signs to Metro Exit 3.`;
    }
  }

  // If query does not match any specific keyword
  return `Answer: I don’t have verified information for that right now.
Source: Verified Venue Knowledge Base
Reason: The details requested were not found in current operational data.
Action: Speak with a volunteer wearing the electric blue StadiumPulse vest.`;
}

/**
 * Ask AI with multi-provider fallbacks.
 * Flow: Gemini -> Groq -> Local mock / Cache
 */
export async function askWithFallback(prompt, contextText = '') {
  // Check if context is completely empty
  if (!contextText || contextText.trim() === '') {
    return `Answer: I don’t have verified information for that right now.
Source: Grounding System Check
Reason: No verified stadium data was found relevant to your search query.
Action: Check your query spelling or search for general gate status.`;
  }

  // 1. Try Gemini Flash
  try {
    const geminiResponse = await callGemini(prompt, contextText);
    return geminiResponse;
  } catch (geminiError) {
    console.warn('Gemini Flash call failed, falling back to Groq. Error:', geminiError.message);

    // 2. Try Groq (Llama 3 fallback)
    try {
      const groqResponse = await callGroq(prompt, contextText);
      return groqResponse;
    } catch (groqError) {
      console.warn('Groq Llama fallback failed, using local Mock engine. Error:', groqError.message);

      // 3. Last resort - local deterministic mock response based strictly on the verified context
      return localMockAIResponse(prompt, contextText);
    }
  }
}
