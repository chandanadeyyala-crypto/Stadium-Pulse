import express from 'express';
import { venueDataService } from '../services/venueDataService.js';

const router = express.Router();


router.get('/', (req, res) => {
  try {
    const venue = venueDataService.getVenueData();
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

router.get('/gates', (req, res) => {
  try {
    const gates = venueDataService.getGates();
    res.json(gates);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});


router.get('/facilities', (req, res) => {
  try {
    const facilities = venueDataService.getFacilities();
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

router.get('/routes', (req, res) => {
  try {
    const routes = venueDataService.getRoutes();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
