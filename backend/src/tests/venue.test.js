/**
 * Integration tests for the Venue HTTP API (/api/venue).
 *
 * Firebase Admin and venueDataService are mocked so tests are
 * fully self-contained and require no credentials or database.
 */

import { jest } from '@jest/globals';
import request from 'supertest';

// ─── Mock Firebase Admin ──────────────────────────────────────────────────────
jest.unstable_mockModule('../config/firebaseAdmin.js', () => ({
  admin: { auth: () => ({ verifyIdToken: jest.fn().mockRejectedValue(new Error('mocked')) }) },
  db: null,
  firebaseApp: null,
}));


// ─── Mock venueDataService ────────────────────────────────────────────────────
const mockVenueData = {
  name: 'StadiumPulse AI Arena — FIFA World Cup 2026',
  location: 'East Rutherford, NJ, USA',
  capacity: 82500,
  nodes: {},
  edges: []
};

const mockGates = [
  { id: 'Gate A', name: 'Gate A (North Entrance)', type: 'gate', description: 'North main gate' },
  { id: 'Gate B', name: 'Gate B (South Entrance)', type: 'gate', description: 'South secondary gate' },
  { id: 'Gate D', name: 'Gate D (East Entrance)', type: 'gate', description: 'East VIP gate' },
];

const mockFacilities = [
  { id: 'Food Court', name: 'Food Court (West Concourse)', type: 'facility', category: 'Meals', status: 'open', zone: 'Concourse West', dietary: ['Vegetarian', 'Halal'] },
  { id: 'Water Station', name: 'Water Station (North Concourse)', type: 'facility', category: 'Water stations', status: 'open', zone: 'Concourse West', dietary: [] },
  { id: 'Coffee Counter', name: 'Coffee Counter (South)', type: 'facility', category: 'Coffee', status: 'open', zone: 'Concourse East', dietary: ['Vegan'] },
];

const mockRoutes = [
  { from: 'Gate A', to: 'Concourse West', distance: 100, isAccessible: true },
];

jest.unstable_mockModule('../services/venueDataService.js', () => ({
  venueDataService: {
    getVenueData: jest.fn().mockReturnValue(mockVenueData),
    getGates: jest.fn().mockReturnValue([...mockGates]),
    getFacilities: jest.fn().mockReturnValue([...mockFacilities]),
    getRoutes: jest.fn().mockReturnValue([...mockRoutes]),
    getAlerts: jest.fn().mockResolvedValue([]),
    getIncidents: jest.fn().mockResolvedValue([]),
  },
}));

const { createApp } = await import('../../app.js');

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('GET /api/venue — venue overview data', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns venue metadata with name and capacity', async () => {
    const res = await request(app)
      .get('/api/venue')
      .set('Authorization', 'Bearer demo_token_for_fan');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('StadiumPulse AI Arena — FIFA World Cup 2026');
    expect(res.body.capacity).toBe(82500);
    expect(res.body.location).toBe('East Rutherford, NJ, USA');
  });
});

describe('GET /api/venue/gates — gate list', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns an array of gate objects', async () => {
    const res = await request(app)
      .get('/api/venue/gates')
      .set('Authorization', 'Bearer demo_token_for_fan');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    expect(res.body[0].type).toBe('gate');
  });

  test('each gate has an id and name', async () => {
    const res = await request(app)
      .get('/api/venue/gates')
      .set('Authorization', 'Bearer demo_token_for_fan');

    res.body.forEach(gate => {
      expect(gate).toHaveProperty('id');
      expect(gate).toHaveProperty('name');
    });
  });
});

describe('GET /api/venue/facilities — facilities list', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns an array of facility objects', async () => {
    const res = await request(app)
      .get('/api/venue/facilities')
      .set('Authorization', 'Bearer demo_token_for_fan');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('food facilities include category and status fields', async () => {
    const res = await request(app)
      .get('/api/venue/facilities')
      .set('Authorization', 'Bearer demo_token_for_fan');

    const foodCourt = res.body.find(f => f.id === 'Food Court');
    expect(foodCourt).toBeDefined();
    expect(foodCourt.category).toBe('Meals');
    expect(foodCourt.status).toBe('open');
  });

  test('water station is included in facilities', async () => {
    const res = await request(app)
      .get('/api/venue/facilities')
      .set('Authorization', 'Bearer demo_token_for_fan');

    const waterStation = res.body.find(f => f.id === 'Water Station');
    expect(waterStation).toBeDefined();
    expect(waterStation.category).toBe('Water stations');
  });
});

describe('GET /api/venue/routes — route edges', () => {
  let app;
  beforeAll(() => {
    process.env.DEMO_MODE = 'true';
    app = createApp();
  });

  test('returns an array of route edge objects', async () => {
    const res = await request(app)
      .get('/api/venue/routes')
      .set('Authorization', 'Bearer demo_token_for_fan');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('from');
    expect(res.body[0]).toHaveProperty('to');
    expect(res.body[0]).toHaveProperty('distance');
  });
});
