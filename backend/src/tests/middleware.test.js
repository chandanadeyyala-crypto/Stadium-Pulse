/**
 * Unit tests for authMiddleware and roleMiddleware.
 *
 * Key design notes:
 * - authMiddleware reads DEMO_MODE once at module load time, so we must
 *   load it fresh for each describe block that needs a different env value.
 *   We achieve this by isolating each test suite in its own dynamic import
 *   after setting up the appropriate mock.
 * - Firebase Admin is fully mocked via jest.unstable_mockModule so no live
 *   credentials are required.
 */

import { jest } from '@jest/globals';

// ─── Shared mock factories ────────────────────────────────────────────────────
function makeReqRes(headers = {}) {
  const req = { headers, user: undefined };
  const res = {
    _status: null,
    _json: null,
    status(code) { this._status = code; return this; },
    json(data)   { this._json  = data; return this; },
  };
  const next = jest.fn();
  return { req, res, next };
}

// ─── verifyAuthToken — demo_token path ───────────────────────────────────────
describe('verifyAuthToken: demo_token_for_<role> bypass', () => {
  let verifyAuthToken;

  beforeAll(async () => {
    // Mock Firebase before importing the middleware
    jest.unstable_mockModule('../config/firebaseAdmin.js', () => ({
      admin: { auth: () => ({ verifyIdToken: jest.fn() }) },
      db: null,
      firebaseApp: null,
    }));
    // DEMO_MODE=false so the real token-parsing branch is exercised
    process.env.DEMO_MODE = 'false';
    ({ verifyAuthToken } = await import('../middleware/authMiddleware.js'));
  });

  test('accepts demo_token_for_staff and assigns the correct user', async () => {
    const { req, res, next } = makeReqRes({ authorization: 'Bearer demo_token_for_staff' });
    await verifyAuthToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('staff');
    expect(req.user.uid).toBe('demo_user_staff');
  });

  test('accepts demo_token_for_organizer and assigns the correct user', async () => {
    const { req, res, next } = makeReqRes({ authorization: 'Bearer demo_token_for_organizer' });
    await verifyAuthToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe('organizer');
  });

  test('returns 401 when no Authorization header is present', async () => {
    const { req, res, next } = makeReqRes({});
    await verifyAuthToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(401);
    expect(res._json.error).toBe('Unauthorized');
  });

  test('returns 403 for a completely invalid token (not demo, not valid JWT)', async () => {
    const { req, res, next } = makeReqRes({ authorization: 'Bearer invalid-not-a-jwt' });
    await verifyAuthToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(403);
    expect(res._json.error).toBe('Forbidden');
  });
});

// ─── requireRole ─────────────────────────────────────────────────────────────
describe('requireRole', () => {
  let requireRole;

  beforeAll(async () => {
    ({ requireRole } = await import('../middleware/roleMiddleware.js'));
  });

  function makeAuthReq(role) {
    const req = { user: { role }, headers: {} };
    const res = {
      _status: null,
      _json: null,
      status(code) { this._status = code; return this; },
      json(data)   { this._json  = data; return this; },
    };
    const next = jest.fn();
    return { req, res, next };
  }

  test('grants access when role is in the allowed list', () => {
    const { req, res, next } = makeAuthReq('staff');
    requireRole(['staff', 'organizer'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('organizer bypasses the allowed list (superuser)', () => {
    const { req, res, next } = makeAuthReq('organizer');
    requireRole(['staff'])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('denies fan access to a staff-only route (403)', () => {
    const { req, res, next } = makeAuthReq('fan');
    requireRole(['staff', 'organizer'])(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(403);
    expect(res._json.error).toBe('Forbidden');
  });

  test('denies volunteer access to organizer-only route (403)', () => {
    const { req, res, next } = makeAuthReq('volunteer');
    requireRole(['organizer'])(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(403);
  });

  test('returns 401 when req.user is missing entirely', () => {
    const req = { headers: {} };
    const res = {
      _status: null,
      _json: null,
      status(code) { this._status = code; return this; },
      json(data)   { this._json  = data; return this; },
    };
    const next = jest.fn();
    requireRole(['staff'])(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res._status).toBe(401);
  });
});
