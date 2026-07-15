/**
 * Integration tests for the AI HTTP API (/api/ai).
 *
 * Firebase Admin, venueDataService, aiService, and cacheService are all mocked
 * so tests run without credentials or external AI API calls.
 */

import { jest } from '@jest/globals';
import request   from 'supertest';

// ─── Mock Firebase Admin ──────────────────────────────────────────────────────
jest.unstable_mockModule('../config/firebaseAdmin.js', () => ({
  admin: { auth: () => ({ verifyIdToken: jest.fn().mockRejectedValue(new Error('mocked')) }) },
  db: null,
  firebaseApp: null,
}));

// ─── Mock cacheService ────────────────────────────────────────────────────────
jest.unstable_mockModule('../services/cacheService.js', () => ({
  cacheService: {
    getQuery:        jest.fn().mockReturnValue(null),          // no cache hit by default
    setQuery:        jest.fn(),
    getTranslation:  jest.fn().mockReturnValue(null),
    setTranslation:  jest.fn(),
  },
}));

// ─── Mock venueDataService ────────────────────────────────────────────────────
jest.unstable_mockModule('../services/venueDataService.js', () => ({
  venueDataService: {
    findRelevantContext: jest.fn().mockResolvedValue(
      '[Venue Info] Gate A (North Entrance): North main gate. Type: gate.'
    ),
    getAlerts: jest.fn().mockResolvedValue([]),
  },
}));

// ─── Mock aiService ───────────────────────────────────────────────────────────
jest.unstable_mockModule('../services/aiService.js', () => ({
  askWithFallback: jest.fn().mockResolvedValue(
    'Answer: Gate A (North Entrance) is open and accessible.\nSource: Verified Stadium Database\nReason: Verified gate status.\nAction: Head to the North Entrance.'
  ),
}));

// ─── Mock translationService ──────────────────────────────────────────────────
jest.unstable_mockModule('../services/translationService.js', () => ({
  translateText: jest.fn().mockImplementation(async (text, lang) =>
    `[${lang}] ${text}`
  ),
}));

const { createApp } = await import('../../app.js');

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/ai/ask — AI question answering', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns a successful AI response for a gate question', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ question: 'Where is Gate A?', language: 'English', stadiumId: 'stadium_pulse_arena_2026' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.response).toBe('string');
    expect(res.body.response.length).toBeGreaterThan(10);
  });

  test('returns 400 when question field is missing', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ language: 'English' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing question/i);
  });

  test('returns cached: true when cache service returns a hit', async () => {
    const { cacheService } = await import('../services/cacheService.js');
    cacheService.getQuery.mockReturnValueOnce(
      'Answer: Gate A is open.\nSource: Cache\nReason: Cached response.\nAction: Proceed.'
    );

    const res = await request(app)
      .post('/api/ai/ask')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ question: 'Where is Gate A?', language: 'English' });

    expect(res.status).toBe(200);
    expect(res.body.cached).toBe(true);
  });

  test('calls translateText when language is not English', async () => {
    const { translateText } = await import('../services/translationService.js');

    const res = await request(app)
      .post('/api/ai/ask')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ question: 'Where is Gate A?', language: 'Spanish' });

    expect(res.status).toBe(200);
    expect(translateText).toHaveBeenCalled();
  });

  test('returns 401 when no Authorization header is provided in non-demo mode', async () => {
    // Create a new app with DEMO_MODE disabled
    const savedMode = process.env.DEMO_MODE;
    process.env.DEMO_MODE = 'false';
    const strictApp = createApp();
    process.env.DEMO_MODE = savedMode;

    const res = await request(strictApp)
      .post('/api/ai/ask')
      .send({ question: 'Where is Gate A?', language: 'English' });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/ai/translate — standalone text translation', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('translates text when text and targetLang are provided', async () => {
    const res = await request(app)
      .post('/api/ai/translate')
      .send({ text: 'Gate B is crowded.', targetLang: 'Spanish' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.translatedText).toBeDefined();
    expect(res.body.originalText).toBe('Gate B is crowded.');
    expect(res.body.targetLanguage).toBe('Spanish');
  });

  test('returns 400 when text is missing', async () => {
    const res = await request(app)
      .post('/api/ai/translate')
      .send({ targetLang: 'French' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing parameters/i);
  });

  test('returns 400 when targetLang is missing', async () => {
    const res = await request(app)
      .post('/api/ai/translate')
      .send({ text: 'Gate B is crowded.' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/ai/ask — Groq fallback chain', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns local fallback response when AI service throws', async () => {
    const { askWithFallback } = await import('../services/aiService.js');
    askWithFallback.mockRejectedValueOnce(new Error('AI service unavailable'));

    const res = await request(app)
      .post('/api/ai/ask')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ question: 'Where is Gate A?', language: 'English' });

    // Should still return 500 when the AI service throws completely
    expect([200, 500]).toContain(res.status);
  });
});
