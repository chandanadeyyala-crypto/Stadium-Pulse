/**
 * StadiumPulse AI — centralised API helper
 * All requests go through this module so the backend URL
 * and the demo role header are managed in one place.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const raw = localStorage.getItem('stadiumpulse_user');
  const user = raw ? JSON.parse(raw) : null;
  return {
    'Authorization': `Bearer ${user?.token || 'demo'}`,
    'x-demo-role': user?.role || 'fan'
  };
}

// ── Venue ─────────────────────────────────────────────────────────────────────
export const getVenue        = ()   => axios.get(`${BASE_URL}/api/venue`, { headers: getAuthHeaders() });
export const getGates        = ()   => axios.get(`${BASE_URL}/api/venue/gates`, { headers: getAuthHeaders() });
export const getFacilities   = ()   => axios.get(`${BASE_URL}/api/venue/facilities`, { headers: getAuthHeaders() });

// ── Alerts ────────────────────────────────────────────────────────────────────
export const getAlerts       = ()   => axios.get(`${BASE_URL}/api/alerts`);
export const getPendingAlerts = ()  => axios.get(`${BASE_URL}/api/alerts/pending`, { headers: getAuthHeaders() });
export const approveAlert    = (id) => axios.post(`${BASE_URL}/api/alerts/approve`, { alertId: id }, { headers: getAuthHeaders() });

// ── AI ────────────────────────────────────────────────────────────────────────
export const askAI = (question, language = 'English', stadiumId = 'stadium_pulse_arena_2026') =>
  axios.post(`${BASE_URL}/api/ai/ask`, { question, language, stadiumId }, { headers: getAuthHeaders() });

export const translateText = (text, targetLang) =>
  axios.post(`${BASE_URL}/api/ai/translate`, { text, targetLang }, { headers: getAuthHeaders() });

// ── Routes ────────────────────────────────────────────────────────────────────
export const recommendRoute = (currentLocation, destination, routePreference = 'fastest') =>
  axios.post(`${BASE_URL}/api/routes/recommend`, { currentLocation, destination, routePreference }, { headers: getAuthHeaders() });

// ── Reports ───────────────────────────────────────────────────────────────────
export const submitReport = (payload) =>
  axios.post(`${BASE_URL}/api/reports`, payload, { headers: getAuthHeaders() });

// ── Health ────────────────────────────────────────────────────────────────────
export const healthCheck = () => axios.get(`${BASE_URL}/health`);
