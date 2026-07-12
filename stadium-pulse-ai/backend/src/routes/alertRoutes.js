import express from 'express';
import { verifyAuthToken } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { venueDataService } from '../services/venueDataService.js';

const router = express.Router();

// GET /api/alerts - Retrieve all approved active alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await venueDataService.getAlerts();
    const approvedAlerts = alerts.filter(a => a.approved === true);
    res.json(approvedAlerts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/alerts/pending - Retrieve pending alerts awaiting verification (Staff/Organizer only)
router.get('/pending', verifyAuthToken, requireRole(['staff', 'organizer']), async (req, res) => {
  try {
    const alerts = await venueDataService.getAlerts();
    const pendingAlerts = alerts.filter(a => a.approved === false);
    res.json(pendingAlerts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/alerts/approve - Approve and publish a pending alert draft
router.post('/approve', verifyAuthToken, requireRole(['staff', 'organizer']), async (req, res) => {
  const { alertId } = req.body;

  if (!alertId) {
    return res.status(400).json({
      error: 'Invalid Request',
      message: 'Parameter alertId is required to approve alerts.'
    });
  }

  try {
    const approvedAlert = await venueDataService.approveAlert(alertId);

    if (!approvedAlert) {
      return res.status(404).json({
        error: 'Alert Not Found',
        message: `No pending alert draft found matching ID: ${alertId}`
      });
    }

    // Mark the parent incident as verified if applicable
    const incidents = await venueDataService.getIncidents();
    const incidentId = approvedAlert.incidentId;
    if (incidentId) {
      const incident = incidents.find(i => i.id === incidentId);
      if (incident) {
        incident.status = 'approved';
      }
    }

    res.json({
      success: true,
      message: 'Alert draft successfully approved and broadcasted.',
      alert: approvedAlert
    });
  } catch (error) {
    console.error('Error approving alert:', error.message);
    res.status(500).json({
      error: 'Approval Failure',
      message: error.message
    });
  }
});

export default router;
