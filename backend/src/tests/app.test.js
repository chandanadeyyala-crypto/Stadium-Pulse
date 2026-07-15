import request from 'supertest';
import { createApp } from '../../app.js';

describe('StadiumPulse API foundation', () => {
    let app;

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
        process.env.DEMO_MODE = 'true';
        app = createApp();
    });

    test('GET / returns backend information', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe(
            'StadiumPulse AI backend is running'
        );
    });

    test('GET /health reports a healthy service', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.status).toBe('healthy');
        expect(response.body.timestamp).toBeDefined();
    });

    test('unknown endpoint returns a structured 404', async () => {
        const response = await request(app).get('/api/not-a-real-route');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            success: false,
            error: 'Route not found',
            path: '/api/not-a-real-route',
        });
    });
});