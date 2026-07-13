import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import venueRouter from './src/routes/venueRoutes.js';
import aiRouter from './src/routes/aiRoutes.js';
import reportRouter from './src/routes/reportRoutes.js';
import alertRouter from './src/routes/alertRoutes.js';
import routeRouter from './src/routes/routeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Remove any trailing slash from the configured frontend origin.
const allowedOrigin = (
  process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
).replace(/\/$/, '');

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StadiumPulse AI backend is running',
    environment: process.env.NODE_ENV || 'development',
    demoMode: process.env.DEMO_MODE === 'true',
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === 'true',
  });
});

// API routes
app.use('/api/venue', venueRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reports', reportRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/routes', routeRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler must be last
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message:
      err.message ||
      'An unexpected error occurred on the StadiumPulse AI server.',
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StadiumPulse AI backend server running on port ${PORT}`);
  console.log(
    `Demo mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'
    }`
  );
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});