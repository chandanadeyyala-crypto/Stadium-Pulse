/**
 * StadiumPulse AI — centralised API helper
 * All HTTP requests flow through this module so the backend URL,
 * auth headers, and demo-role header are managed in one place.
 */
import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

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

// ── Venue ──────────────────────────────────────────────────────────────────────
export const getVenue      = ()  => axios.get(`${BASE_URL}/api/venue`,            { headers: getAuthHeaders() });
export const getGates      = ()  => axios.get(`${BASE_URL}/api/venue/gates`,       { headers: getAuthHeaders() });
export const getFacilities = ()  => axios.get(`${BASE_URL}/api/venue/facilities`,  { headers: getAuthHeaders() });

// ── Alerts ─────────────────────────────────────────────────────────────────────
export const getAlerts      = ()    => axios.get(`${BASE_URL}/api/alerts`,                                          { headers: getAuthHeaders() });
export const getPendingAlerts = ()  => axios.get(`${BASE_URL}/api/alerts/pending`,                                  { headers: getAuthHeaders() });
export const approveAlert   = (id)  => axios.post(`${BASE_URL}/api/alerts/approve`,    { alertId: id },             { headers: getAuthHeaders() });
export const createAlert    = (payload) => axios.post(`${BASE_URL}/api/alerts`,         payload,                    { headers: getAuthHeaders() });

// ── Reports ────────────────────────────────────────────────────────────────────
export const submitReport    = (payload) => axios.post(`${BASE_URL}/api/reports`,       payload,                    { headers: getAuthHeaders() });
export const submitFanReport = (payload) => axios.post(`${BASE_URL}/api/reports/fan`,   payload,                    { headers: getAuthHeaders() });
export const getIncidents    = ()        => axios.get(`${BASE_URL}/api/reports`,                                    { headers: getAuthHeaders() });

// ── AI ─────────────────────────────────────────────────────────────────────────
export const askAI = (question, language = 'English', stadiumId = 'stadium_pulse_arena_2026') =>
  axios.post(`${BASE_URL}/api/ai/ask`,       { question, language, stadiumId }, { headers: getAuthHeaders() });

export const translateText = (text, targetLang) =>
  axios.post(`${BASE_URL}/api/ai/translate`, { text, targetLang },              { headers: getAuthHeaders() });

// ── Navigation ─────────────────────────────────────────────────────────────────
export const recommendRoute = (currentLocation, destination, routePreference = 'fastest') =>
  axios.post(`${BASE_URL}/api/routes/recommend`, { currentLocation, destination, routePreference }, { headers: getAuthHeaders() });

// ── System ─────────────────────────────────────────────────────────────────────
export const healthCheck = () => axios.get(`${BASE_URL}/health`);
