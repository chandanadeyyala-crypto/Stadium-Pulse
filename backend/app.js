import express from 'express';
import cors from 'cors';

import venueRouter from './src/routes/venueRoutes.js';
import aiRouter from './src/routes/aiRoutes.js';
import reportRouter from './src/routes/reportRoutes.js';
import alertRouter from './src/routes/alertRoutes.js';
import routeRouter from './src/routes/routeRoutes.js';

export function createApp() {
    const app = express();

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

    app.use((req, res, next) => {
        if (process.env.NODE_ENV !== 'test') {
            console.log(
                `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
            );
        }

        next();
    });

    app.get('/', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'StadiumPulse AI backend is running',
            environment: process.env.NODE_ENV || 'development',
            demoMode: process.env.DEMO_MODE === 'true',
        });
    });

    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            demoMode: process.env.DEMO_MODE === 'true',
        });
    });

    app.use('/api/venue', venueRouter);
    app.use('/api/ai', aiRouter);
    app.use('/api/reports', reportRouter);
    app.use('/api/alerts', alertRouter);
    app.use('/api/routes', routeRouter);

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: 'Route not found',
            path: req.originalUrl,
        });
    });

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

    return app;
}