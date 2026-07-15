/**
 * Integration tests for the Reports HTTP API (/api/reports).
 *
 * The AI service (Gemini / Groq) and Firebase Admin are both mocked so
 * tests run deterministically in CI without any API keys.
 *
 * Covered scenarios:
 * - Staff submitting an incident report (AI path)
 * - AI safety fallback when Gemini and Groq both fail
 * - Fan complaint submission
 * - Input validation (400)
 * - Role enforcement (403)
 * - GET all incidents
 */

import { jest } from '@jest/globals';
import request   from 'supertest';

// ─── Mock Firebase Admin ──────────────────────────────────────────────────────
jest.unstable_mockModule('../config/firebaseAdmin.js', () => ({
  admin: { auth: () => ({ verifyIdToken: jest.fn().mockRejectedValue(new Error('mocked')) }) },
  db: null,
  firebaseApp: null,
}));

// ─── Mock AI service — default: Gemini succeeds ───────────────────────────────
const mockCallGemini = jest.fn();
const mockCallGroq   = jest.fn();

jest.unstable_mockModule('../services/aiService.js', () => ({
  callGemini: mockCallGemini,
  callGroq:   mockCallGroq,
  askWithFallback: jest.fn(),
}));

// ─── Mock venueDataService ────────────────────────────────────────────────────
const storedIncidents = [];
const storedAlerts    = [];

jest.unstable_mockModule('../services/venueDataService.js', () => ({
  venueDataService: {
    getAlerts:    jest.fn().mockResolvedValue([]),
    addAlert:     jest.fn().mockImplementation(async (a) => { storedAlerts.push(a); return a; }),
    getIncidents: jest.fn().mockImplementation(async () => [...storedIncidents]),
    addIncident:  jest.fn().mockImplementation(async (i) => { storedIncidents.push(i); return i; }),
  },
}));

const { createApp } = await import('../../app.js');

// ─── Staff incident report ────────────────────────────────────────────────────
describe('POST /api/reports — staff incident submission', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  beforeEach(() => {
    storedIncidents.length = 0;
    storedAlerts.length    = 0;
    mockCallGemini.mockReset();
    mockCallGroq.mockReset();
  });

  test('creates an incident and a pending alert draft when AI succeeds', async () => {
    const aiJson = JSON.stringify({
      englishSummary: 'Escalator stopped at Gate C',
      draftFanAlert:  'The Gate C escalators are temporarily out of service. Please use the stairs or the ramp.',
    });
    mockCallGemini.mockResolvedValueOnce(aiJson);

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({
        text:     'Escalators at Gate C have stopped working',
        category: 'facility',
        severity: 'warning',
        location: 'Gate C',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.incident.category).toBe('facility');
    expect(res.body.incident.englishSummary).toBe('Escalator stopped at Gate C');
    expect(res.body.pendingAlertDraft.approved).toBe(false);
    expect(storedIncidents.length).toBe(1);
    expect(storedAlerts.length).toBe(1);
  });

  test('AI safety fallback: uses local template when both Gemini and Groq fail', async () => {
    mockCallGemini.mockRejectedValueOnce(new Error('Gemini timeout'));
    mockCallGroq.mockRejectedValueOnce(new Error('Groq timeout'));

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({
        text:     'A large crowd has gathered near Gate B',
        category: 'crowd',
        severity: 'critical',
        location: 'Gate B',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Fallback populates englishSummary with a local crowd template
    expect(res.body.incident.englishSummary).toMatch(/crowd/i);
    // A pending alert draft must still be created
    expect(res.body.pendingAlertDraft.approved).toBe(false);
  });

  test('returns 400 when required parameters are missing', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({ text: 'Incomplete report' }); // missing category, severity, location

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Input');
  });

  test('returns 403 when a fan (insufficient role) submits a staff report', async () => {
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ text: 'Issue', category: 'crowd', severity: 'warning', location: 'Gate A' });

    expect(res.status).toBe(403);
  });
});

// ─── Fan complaint ────────────────────────────────────────────────────────────
describe('POST /api/reports/fan — fan complaint', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  beforeEach(() => {
    storedIncidents.length = 0;
    storedAlerts.length    = 0;
  });

  test('any authenticated user can submit a fan complaint', async () => {
    const res = await request(app)
      .post('/api/reports/fan')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ text: 'Restroom near Section 214 is dirty.', category: 'facility', urgency: 'medium', location: 'Section 214' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.incident.reportedBy).toBe('fan@stadiumpulse-demo.com');
    expect(res.body.pendingAlertDraft.approved).toBe(false);
  });

  test('maps urgency "high" to severity "critical"', async () => {
    const res = await request(app)
      .post('/api/reports/fan')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ text: 'Medical emergency!', category: 'medical', urgency: 'high', location: 'Concourse East' });

    expect(res.status).toBe(200);
    expect(res.body.incident.severity).toBe('critical');
  });

  test('returns 400 when required fields are absent', async () => {
    const res = await request(app)
      .post('/api/reports/fan')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ text: 'something is wrong' }); // missing category, urgency, location

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Input');
  });

  test('returns 200 even without explicit auth token in DEMO_MODE (treated as demo fan)', async () => {
    const res = await request(app)
      .post('/api/reports/fan')
      .send({ text: 'issue', category: 'crowd', urgency: 'low', location: 'Gate A' });
    // DEMO_MODE=true: missing token → req.user becomes demo_fan → verifyAuthToken passes
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

// ─── GET incidents ────────────────────────────────────────────────────────────
describe('GET /api/reports — retrieve all incidents', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns 200 and a list of incidents for authenticated users', async () => {
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', 'Bearer demo_token_for_staff');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('returns 200 in DEMO_MODE even without an explicit token (demo fan)', async () => {
    const res = await request(app).get('/api/reports');
    // DEMO_MODE=true: missing token → demo fan is allowed to GET incidents
    expect(res.status).toBe(200);
  });
});
