import { calculateRoute } from '../services/routeEngine.js';

describe('Route engine', () => {
    test('calculates the fastest route from Gate A to Section 214', () => {
        const result = calculateRoute(
            'Gate A',
            'Section 214',
            'fastest',
            []
        );

        expect(result.success).toBe(true);
        expect(result.path.map((node) => node.id)).toEqual([
            'Gate A',
            'Concourse West',
            'Section 214',
        ]);
        expect(result.hasStairs).toBe(true);
        expect(result.totalDistance).toBe('250 meters');
    });

    test('wheelchair route avoids inaccessible edges', () => {
        const result = calculateRoute(
            'Gate A',
            'Section 214',
            'wheelchair',
            []
        );

        expect(result.success).toBe(true);
        expect(result.hasStairs).toBe(false);

        const pathIds = result.path.map((node) => node.id);

        expect(pathIds).toContain('Concourse East');
        expect(pathIds).not.toEqual([
            'Gate A',
            'Concourse West',
            'Section 214',
        ]);
    });

    test('returns a safe error for an unknown destination', () => {
        const result = calculateRoute(
            'Gate A',
            'Unknown Facility',
            'fastest',
            []
        );

        expect(result).toEqual({
            success: false,
            message:
                'Start or destination node not found in verified venue graph.',
        });
    });

    test('blocks a route when a critical alert makes it unreachable', () => {
        const result = calculateRoute(
            'Concourse East',
            'Medical Desk',
            'fastest',
            [
                {
                    target: 'Medical Desk',
                    severity: 'critical',
                    message: 'Medical area temporarily closed',
                },
            ]
        );

        expect(result.success).toBe(false);
        expect(result.message).toContain('No path found');
    });

    test('least-crowded preference produces a grounded explanation', () => {
        const result = calculateRoute(
            'Gate B',
            'Section 214',
            'least_crowded',
            [
                {
                    target: 'Gate B',
                    severity: 'warning',
                    message: 'Gate B congestion',
                },
            ]
        );

        expect(result.success).toBe(true);
        expect(result.preference).toBe('least_crowded');
        expect(result.reason).toBeTruthy();
        expect(result.source).toContain('Verified Venue Database');
    });
});