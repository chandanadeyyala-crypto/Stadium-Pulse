import express from 'express';
import { calculateRoute } from '../services/routeEngine.js';
import { venueDataService } from '../services/venueDataService.js';
import { verifyAuthToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/routes/recommend - Fetch recommended navigation routes
router.post('/recommend', verifyAuthToken, (req, res) => {
  const { currentLocation, destination, routePreference = 'fastest' } = req.body;

  if (!currentLocation || !destination) {
    return res.status(400).json({
      error: 'Invalid Inputs',
      message: 'Both currentLocation and destination node IDs are required.'
    });
  }

  try {
    // 1. Retrieve current active operational alerts
    const alerts = venueDataService.getAlerts();

    // 2. Perform graph computation
    const routingResult = calculateRoute(currentLocation, destination, routePreference, alerts);

    if (!routingResult.success) {
      return res.status(422).json({
        error: 'Route Planning Failed',
        message: routingResult.message
      });
    }

    res.json(routingResult);
  } catch (error) {
    console.error('Error calculating route recommendations:', error.message);
    res.status(500).json({
      error: 'Routing Engine Error',
      message: error.message
    });
  }
});

export default router;
