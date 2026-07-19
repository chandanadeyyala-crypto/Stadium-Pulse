/**
 * StadiumPulse AI — centralised API helper
 * All HTTP requests flow through this module so the backend URL,
 * auth headers, demo-role header, timeout, and AbortController
 * are managed in one place.
 */
import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

/** Default request timeout in milliseconds */
const DEFAULT_TIMEOUT_MS = 11000;

export function getAuthHeaders() {
  try {
    const raw  = localStorage.getItem('stadiumpulse_user');
    const user = raw ? JSON.parse(raw) : null;
    return {
      'Authorization': `Bearer ${user?.token || 'demo'}`,
      'x-demo-role':   user?.role || 'fan',
    };
  } catch {
    return { 'Authorization': 'Bearer demo', 'x-demo-role': 'fan' };
  }
}

/**
 * Build axios config with a shared AbortController signal and timeout.
 * Pass the signal from an AbortController so callers can cancel on unmount.
 * @param {AbortSignal|null} signal
 * @returns axios config object
 */
function cfg(signal = null) {
  return {
    headers: getAuthHeaders(),
    timeout: DEFAULT_TIMEOUT_MS,
    ...(signal ? { signal } : {}),
  };
}

// ── Venue ──────────────────────────────────────────────────────────────────────
export const getVenue      = (signal) => axios.get(`${BASE_URL}/api/venue`,            cfg(signal));
export const getGates      = (signal) => axios.get(`${BASE_URL}/api/venue/gates`,       cfg(signal));
export const getFacilities = (signal) => axios.get(`${BASE_URL}/api/venue/facilities`,  cfg(signal));

// ── Alerts ─────────────────────────────────────────────────────────────────────
export const getAlerts      = (signal) => axios.get(`${BASE_URL}/api/alerts`,                                         cfg(signal));
export const getPendingAlerts = (signal) => axios.get(`${BASE_URL}/api/alerts/pending`,                               cfg(signal));
export const approveAlert   = (id)      => axios.post(`${BASE_URL}/api/alerts/approve`,    { alertId: id },           cfg());
export const createAlert    = (payload) => axios.post(`${BASE_URL}/api/alerts`,             payload,                   cfg());

// ── Reports ────────────────────────────────────────────────────────────────────
export const submitReport    = (payload) => axios.post(`${BASE_URL}/api/reports`,       payload,  cfg());
export const submitFanReport = (payload) => axios.post(`${BASE_URL}/api/reports/fan`,   payload,  cfg());
export const getIncidents    = (signal)  => axios.get(`${BASE_URL}/api/reports`,                  cfg(signal));

// ── AI ─────────────────────────────────────────────────────────────────────────
export const askAI = (question, language = 'English', stadiumId = 'stadium_pulse_arena_2026', signal = null) =>
  axios.post(`${BASE_URL}/api/ai/ask`, { question, language, stadiumId }, cfg(signal));

export const translateText = (text, targetLang, signal = null) =>
  axios.post(`${BASE_URL}/api/ai/translate`, { text, targetLang }, cfg(signal));

// ── Navigation ─────────────────────────────────────────────────────────────────
export const recommendRoute = (currentLocation, destination, routePreference = 'fastest', signal = null) =>
  axios.post(`${BASE_URL}/api/routes/recommend`, { currentLocation, destination, routePreference }, cfg(signal));

// ── System ─────────────────────────────────────────────────────────────────────
export const healthCheck = () => axios.get(`${BASE_URL}/health`, { timeout: 5000 });

// ── Session cache helpers (venue / facility static data) ───────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function cacheSet(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch { /* quota exceeded or private browsing — ignore */ }
}

export function cacheGet(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
