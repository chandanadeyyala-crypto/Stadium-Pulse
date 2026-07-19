import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Silent, non-blocking backend warm-up to reduce Render cold-start latency.
// Does not block rendering and fails silently.
const warmUpBackend = () => {
  const controller = new AbortController();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  fetch(`${backendUrl}/health`, { signal: controller.signal }).catch(() => {});
  return () => controller.abort();
};
warmUpBackend();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
