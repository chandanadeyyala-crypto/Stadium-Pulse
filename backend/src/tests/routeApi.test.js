/**
 * Integration tests for the Navigation Routes API (/api/routes).
 *
 * Firebase Admin and venueDataService are mocked so the tests run in CI
 * without credentials. The real routeEngine (graph/Dijkstra) is exercised
 * through the HTTP layer.
 */

import { jest } from '@jest/globals';
import request   from 'supertest';

// ─── Mock Firebase Admin ──────────────────────────────────────────────────────
jest.unstable_mockModule('../config/firebaseAdmin.js', () => ({
  admin: { auth: () => ({ verifyIdToken: jest.fn().mockRejectedValue(new Error('mocked')) }) },
  db: null,
  firebaseApp: null,
}));

// ─── Mock venueDataService ────────────────────────────────────────────────────
// Expose a mutable alert list so individual tests can simulate active alerts
let liveAlerts = [];

jest.unstable_mockModule('../services/venueDataService.js', () => ({
  venueDataService: {
    getAlerts: jest.fn().mockImplementation(async () => [...liveAlerts]),
  },
}));

const { createApp } = await import('../../app.js');

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/routes/recommend — navigation routing', () => {
  let app;

  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  beforeEach(() => {
    liveAlerts = [];
  });

  test('returns a successful route from Gate A to Section 214 (fastest)', async () => {
    const res = await request(app)
      .post('/api/routes/recommend')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ currentLocation: 'Gate A', destination: 'Section 214', routePreference: 'fastest' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.path)).toBe(true);
    expect(res.body.path[0].id).toBe('Gate A');
    const lastNode = res.body.path[res.body.path.length - 1];
    expect(lastNode.id).toBe('Section 214');
  });

  test('returns a wheelchair-accessible route that avoids stairs', async () => {
    const res = await request(app)
      .post('/api/routes/recommend')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ currentLocation: 'Gate A', destination: 'Section 214', routePreference: 'wheelchair' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hasStairs).toBe(false);
  });

  test('returns 422 when destination does not exist in the venue graph', async () => {
    const res = await request(app)
      .post('/api/routes/recommend')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ currentLocation: 'Gate A', destination: 'Nonexistent Location' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('Route Planning Failed');
  });

  test('returns 422 when a critical alert blocks the only path to destination', async () => {
    liveAlerts = [{
      id: 'block_1',
      target: 'Medical Desk',
      severity: 'critical',
      message: 'Medical area closed for decontamination',
      approved: true,
    }];

    const res = await request(app)
      .post('/api/routes/recommend')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ currentLocation: 'Concourse East', destination: 'Medical Desk', routePreference: 'fastest' });

    expect(res.status).toBe(422);
  });

  test('returns 400 when currentLocation is missing', async () => {
    const res = await request(app)
      .post('/api/routes/recommend')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ destination: 'Section 214' }); // missing currentLocation

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Inputs');
  });

  test('returns 400 when destination is missing', async () => {
    const res = await request(app)
      .post('/api/routes/recommend')
      .set('Authorization', 'Bearer demo_token_for_fan')
      .send({ currentLocation: 'Gate A' }); // missing destination

    expect(res.status).toBe(400);
  });

  test('returns 200 in DEMO_MODE even without a token (treated as demo fan)', async () => {
    const res = await request(app)
      .post('/api/routes/recommend')
      .send({ currentLocation: 'Gate A', destination: 'Section 214' });
    // DEMO_MODE=true: missing token → demo fan → route is accessible
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
