/**
 * Integration tests for the Alerts HTTP API (/api/alerts).
 *
 * Firebase Admin and venueDataService are mocked so the tests are
 * fully self-contained and require no credentials or database.
 */

import { jest }  from '@jest/globals';
import request   from 'supertest';

// ─── Mock Firebase Admin (no real SDK calls) ──────────────────────────────────
jest.unstable_mockModule('../config/firebaseAdmin.js', () => ({
  admin: { auth: () => ({ verifyIdToken: jest.fn().mockRejectedValue(new Error('mocked')) }) },
  db: null,
  firebaseApp: null,
}));

// ─── Mock venueDataService ────────────────────────────────────────────────────
const mockAlerts = [
  { id: 'a1', type: 'crowd', severity: 'warning', message: 'Gate B heavy', target: 'Gate B', approved: true  },
  { id: 'a2', type: 'gate',  severity: 'info',    message: 'Gate D open',  target: 'Gate D', approved: true  },
  { id: 'a3', type: 'crowd', severity: 'critical', message: 'Draft alert', target: 'Gate A', approved: false },
];

jest.unstable_mockModule('../services/venueDataService.js', () => ({
  venueDataService: {
    getAlerts:    jest.fn().mockResolvedValue([...mockAlerts]),
    addAlert:     jest.fn().mockImplementation(async (a) => a),
    approveAlert: jest.fn().mockImplementation(async (id) => {
      const found = mockAlerts.find(a => a.id === id);
      if (!found) return null;
      found.approved = true;
      return found;
    }),
    getIncidents: jest.fn().mockResolvedValue([]),
  },
}));

const { createApp } = await import('../../app.js');

describe('GET /api/alerts — public approved alerts list', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns only approved alerts', async () => {
    const res = await request(app).get('/api/alerts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const approved = res.body.filter(a => a.approved === false);
    expect(approved.length).toBe(0);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/alerts/pending — staff-only list', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns pending alerts for authenticated staff', async () => {
    const res = await request(app)
      .get('/api/alerts/pending')
      .set('Authorization', 'Bearer demo_token_for_staff');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const unapproved = res.body.filter(a => a.approved === false);
    expect(unapproved.length).toBeGreaterThan(0);
  });

  test('returns 403 when no auth token is supplied (DEMO_MODE gives fan role, then roleMiddleware denies)', async () => {
    const res = await request(app).get('/api/alerts/pending');
    // In DEMO_MODE the missing token is treated as demo fan → roleMiddleware blocks with 403
    expect(res.status).toBe(403);
  });

  test('returns 403 when a fan token is used', async () => {
    const res = await request(app)
      .get('/api/alerts/pending')
      .set('Authorization', 'Bearer demo_token_for_fan');
    expect(res.status).toBe(403);
  });
});

describe('POST /api/alerts/approve — approve a pending alert', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('successfully approves an existing pending alert', async () => {
    const res = await request(app)
      .post('/api/alerts/approve')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({ alertId: 'a3' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alert.id).toBe('a3');
  });

  test('returns 400 when alertId is missing from request body', async () => {
    const res = await request(app)
      .post('/api/alerts/approve')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Request');
  });

  test('returns 404 when alertId does not match any alert', async () => {
    // Override mock to return null for this one call
    const { venueDataService } = await import('../services/venueDataService.js');
    venueDataService.approveAlert.mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/alerts/approve')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({ alertId: 'nonexistent_alert' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Alert Not Found');
  });
});

describe('POST /api/alerts — organizer creates a new alert', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('creates an approved alert with valid body (organizer)', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', 'Bearer demo_token_for_organizer')
      .send({ type: 'safety', severity: 'critical', message: 'Evacuation drill', target: 'All Gates' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.alert.approved).toBe(true);
    expect(res.body.alert.message).toBe('Evacuation drill');
  });

  test('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', 'Bearer demo_token_for_organizer')
      .send({ type: 'safety' }); // missing severity, message, target

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Input');
  });

  test('returns 403 when a non-organizer (staff) tries to create an alert directly', async () => {
    const res = await request(app)
      .post('/api/alerts')
      .set('Authorization', 'Bearer demo_token_for_staff')
      .send({ type: 'safety', severity: 'warning', message: 'Alert', target: 'Gate A' });

    expect(res.status).toBe(403);
  });
});
