import express from 'express';
import { venueDataService } from '../services/venueDataService.js';

const router = express.Router();

// GET /api/venue - Full layout
router.get('/', (req, res) => {
  try {
    const venue = venueDataService.getVenueData();
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/venue/gates - Retrieve verified entrances
router.get('/gates', (req, res) => {
  try {
    const gates = venueDataService.getGates();
    res.json(gates);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/venue/facilities - Retrieve restrooms, medical desks, elevators
router.get('/facilities', (req, res) => {
  try {
    const facilities = venueDataService.getFacilities();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/venue/routes - Retrieve graph routes
router.get('/routes', (req, res) => {
  try {
    const routes = venueDataService.getRoutes();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
