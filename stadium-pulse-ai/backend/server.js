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

// Enable CORS with customizable origin configuration
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

// Parsers
app.use(express.json());

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === 'true'
  });
});

// Register routes
app.use('/api/venue', venueRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reports', reportRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/routes', routeRouter);

// Express global error handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the StadiumPulse AI server.'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`StadiumPulse AI backend server running on port ${PORT}`);
  console.log(`Demo mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log(`CORS allowed origin: ${allowedOrigin}`);
});
