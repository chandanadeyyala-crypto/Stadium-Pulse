import dotenv from 'dotenv';
import { createApp } from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, '0.0.0.0', () => {
  const allowedOrigin = (
    process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
  ).replace(/\/$/, '');

  console.log(`StadiumPulse AI backend server running on port ${PORT}`);
  console.log(
    `Demo mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'
    }`
  );
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});