import express from 'express';
import { verifyAuthToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { callGemini, callGroq } from '../services/aiService.js';
import { venueDataService } from '../services/venueDataService.js';

const router = express.Router();

// POST /api/reports - Staff submits incident report
router.post('/', verifyAuthToken, requireRole(['volunteer', 'staff', 'organizer']), async (req, res) => {
  const { text, category, severity, location } = req.body;
  const username = req.user?.email || 'demo_staff';

  if (!text || !category || !severity || !location) {
    return res.status(400).json({
      error: 'Invalid Input',
      message: 'Missing required parameters: text, category, severity, and location.'
    });
  }

  // 1. Save original report
  const newIncident = {
    id: `inc_${Date.now()}`,
    category,
    severity,
    location,
    originalText: text,
    reportedBy: username,
    status: 'pending_approval',
    timestamp: new Date().toISOString()
  };

  // 2. Draft prompt to summarize and rewrite
  const aiPrompt = `Analyze this staff incident report:
Location: ${location}
Category: ${category}
Severity: ${severity}
Report content: "${text}"

Task:
1. Translate and summarize the report in English as a concise operations description (e.g. "Gate B escalators stopped").
2. Write a public-facing alert advising fans what to do. Ensure it is polite, clear, and actionable.

Format your output EXACTLY as a JSON object with these keys:
{
  "englishSummary": "Short English summary of operations incident",
  "draftFanAlert": "Actionable instructions for fans"
}
Ensure it is valid JSON. Do not wrap it in markdown block tags (\`\`\`).`;

  let englishSummary = `Incident at ${location} regarding ${category}`;
  let draftFanAlert = `Operational warning: ${category} issue reported near ${location}. Please proceed with caution.`;

  try {
    console.log('[Incident Report API] Summarizing incident report via AI...');
    let aiRaw = '';
    
    // Try Gemini
    try {
      aiRaw = await callGemini(aiPrompt, "You are StadiumPulse Operations AI. Output valid JSON only.");
    } catch (geminiErr) {
      console.warn('Gemini failed to summarize incident, trying Groq fallback...');
      aiRaw = await callGroq(aiPrompt, "You are StadiumPulse Operations AI. Output valid JSON only.");
    }

    // Clean up markdown block wrapping if present
    const cleanJson = aiRaw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    
    if (parsed.englishSummary) englishSummary = parsed.englishSummary;
    if (parsed.draftFanAlert) draftFanAlert = parsed.draftFanAlert;

  } catch (error) {
    console.warn('AI summary failed or JSON parsing error. Using local fallback. Error:', error.message);
    
    // Local fallback generator (demo fallback)
    if (category === 'crowd') {
      englishSummary = `Crowd surge reported near ${location}.`;
      draftFanAlert = `Notice: High pedestrian congestion at ${location}. If possible, use alternative corridors to bypass the wait.`;
    } else if (category === 'medical') {
      englishSummary = `Medical assistance dispatched to ${location}.`;
      draftFanAlert = `Safety: Medical staff are attending to an incident near ${location}. Please clear pathways for response personnel.`;
    } else if (category === 'gate') {
      englishSummary = `Access issue or gate delay at ${location}.`;
      draftFanAlert = `Gate Alert: Entrance checks at ${location} are delayed. Consider redirecting to nearby gates for quicker entry.`;
    } else {
      englishSummary = `Alert reported regarding ${category} at ${location}.`;
      draftFanAlert = `Attention: ${category} incident reported near ${location}. Please follow safety instructions and signs.`;
    }
  }

  // 3. Attach AI products to the incident
  newIncident.englishSummary = englishSummary;
  newIncident.draftFanAlert = draftFanAlert;

  // 4. Register the incident in the system (pending approval)
  venueDataService.addIncident(newIncident);

  // 5. Also construct a pending alert draft that will show up on the Alert Approval Page
  const pendingAlert = {
    id: `alert_draft_${newIncident.id}`,
    incidentId: newIncident.id,
    type: category,
    severity,
    message: draftFanAlert,
    target: location,
    timestamp: newIncident.timestamp,
    approved: false // Needs explicit approval in Alert Approval Page
  };

  venueDataService.addAlert(pendingAlert);

  res.json({
    success: true,
    incident: newIncident,
    pendingAlertDraft: pendingAlert
  });
});

export default router;
