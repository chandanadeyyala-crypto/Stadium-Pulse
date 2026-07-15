import { STADIUM_NODES, STADIUM_EDGES } from './routeEngine.js';
import { db } from '../config/firebaseAdmin.js';

let activeAlerts = [
  {
    id: "alert_1",
    type: "crowd",
    severity: "warning",
    message: "Gate B (South Entrance) is experiencing heavy crowd inflow. Security queues are approximately 30 minutes. Consider using Gate D.",
    target: "Gate B",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    approved: true
  },
  {
    id: "alert_2",
    type: "gate",
    severity: "info",
    message: "Gate D is open with minimal queues. Recommended for fastest entrance.",
    target: "Gate D",
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    approved: true
  }
];

let reportedIncidents = [
  {
    id: "inc_1",
    category: "crowd",
    severity: "warning",
    location: "Gate B",
    description: "Crowd density has increased rapidly due to the arrival of shuttle buses.",
    reportedBy: "volunteer_demo",
    status: "approved",
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString()
  }
];

export const venueDataService = {
  getVenueData() {
    return {
      name: "StadiumPulse AI Arena — FIFA World Cup 2026",
      location: "East Rutherford, NJ, USA",
      capacity: 82500,
      nodes: STADIUM_NODES,
      edges: STADIUM_EDGES
    };
  },

  getGates() {
    return Object.values(STADIUM_NODES).filter(n => n.type === 'gate');
  },

  getFacilities() {
    return Object.values(STADIUM_NODES).filter(n => n.type === 'facility');
  },

  getRoutes() {
    return STADIUM_EDGES;
  },

  async getAlerts() {
    if (db) {
      try {
        const firestoreQuery = db.collection('alerts').orderBy('timestamp', 'desc').get();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore timeout')), 2000)
        );
        const snapshot = await Promise.race([firestoreQuery, timeout]);
        const alerts = [];
        snapshot.forEach(doc => {
          alerts.push({ id: doc.id, ...doc.data() });
        });
        if (alerts.length > 0) {
          return alerts;
        }
      } catch (err) {

      }
    }
    return activeAlerts;
  },

  async addAlert(alert) {
    if (db) {
      try {
        const docRef = db.collection('alerts').doc(alert.id || `alert_${Date.now()}`);
        await docRef.set(alert);
        console.log('[VenueDataService] Alert added to Firestore:', alert.id);
        return alert;
      } catch (err) {
        console.warn('[VenueDataService] Firestore addAlert failed, using memory. Error:', err.message);
      }
    }
    activeAlerts.unshift(alert);
    return alert;
  },

  async approveAlert(alertId) {
    if (db) {
      try {
        const docRef = db.collection('alerts').doc(alertId);
        const doc = await docRef.get();
        if (doc.exists) {
          await docRef.update({ approved: true });
          const updated = { id: doc.id, ...doc.data(), approved: true };

          if (updated.incidentId) {
            try {
              await db.collection('incidents').doc(updated.incidentId).update({ status: 'approved' });
            } catch (incErr) {
              console.warn('[VenueDataService] Failed to update parent incident in Firestore:', incErr.message);
            }
          }
          return updated;
        }
      } catch (err) {
        console.warn('[VenueDataService] Firestore approveAlert failed, using memory. Error:', err.message);
      }
    }

    const alertIndex = activeAlerts.findIndex(a => a.id === alertId);
    if (alertIndex !== -1) {
      activeAlerts[alertIndex].approved = true;
      const approvedAlert = activeAlerts[alertIndex];
      const incidentId = approvedAlert.incidentId;
      if (incidentId) {
        const incident = reportedIncidents.find(i => i.id === incidentId);
        if (incident) {
          incident.status = 'approved';
        }
      }
      return approvedAlert;
    }
    return null;
  },

  async getIncidents() {
    if (db) {
      try {
        const snapshot = await db.collection('incidents').orderBy('timestamp', 'desc').get();
        const incidents = [];
        snapshot.forEach(doc => {
          incidents.push({ id: doc.id, ...doc.data() });
        });
        if (incidents.length > 0) {
          return incidents;
        }
      } catch (err) {
        console.warn('[VenueDataService] Firestore getIncidents failed, using memory. Error:', err.message);
      }
    }
    return reportedIncidents;
  },

  async addIncident(incident) {
    if (db) {
      try {
        const docRef = db.collection('incidents').doc(incident.id || `inc_${Date.now()}`);
        await docRef.set(incident);
        console.log('[VenueDataService] Incident added to Firestore:', incident.id);
        return incident;
      } catch (err) {
        console.warn('[VenueDataService] Firestore addIncident failed, using memory. Error:', err.message);
      }
    }
    reportedIncidents.unshift(incident);
    return incident;
  },

  async findRelevantContext(normalizedQuestion) {
    const contextSegments = [];
    const question = normalizedQuestion.toLowerCase();

    Object.values(STADIUM_NODES).forEach(node => {
      const nodeKeywords = [
        node.id.toLowerCase(),
        node.name.toLowerCase(),
        ...(node.description ? [node.description.toLowerCase()] : [])
      ];

      const isMatch = nodeKeywords.some(keyword => question.includes(keyword) ||
        (node.type === 'gate' && keyword.includes('gate') && question.includes(node.id.split(' ')[1]?.toLowerCase())) ||
        (node.type === 'facility' && keyword.includes('restroom') && question.includes('restroom')) ||
        (node.type === 'facility' && keyword.includes('medical') && (question.includes('medical') || question.includes('doctor') || question.includes('first aid')))
      );

      if (isMatch) {
        contextSegments.push(`[Venue Info] ${node.name}: ${node.description || 'Verified location'}. Type: ${node.type}.`);
      }
    });

    const alerts = await this.getAlerts();
    alerts.forEach(alert => {
      if (alert.approved) {
        const alertText = alert.message.toLowerCase() + " " + (alert.target || "").toLowerCase();
        const matchesAlert = alertText.split(' ').some(word => word.length > 2 && question.includes(word));

        if (matchesAlert || question.includes('alert') || question.includes('warning') || question.includes('closed') || question.includes('crowded')) {
          contextSegments.push(`[Live Alert] Severity: ${alert.severity}. Target: ${alert.target || 'General'}. Status: ${alert.message}`);
        }
      }
    });

    if (question.includes('gate') && !contextSegments.some(c => c.includes('Gate'))) {
      const gates = Object.values(STADIUM_NODES).filter(n => n.type === 'gate');
      gates.forEach(g => {
        contextSegments.push(`[Venue Info] ${g.name}: ${g.description}.`);
      });
    }

    return contextSegments.join('\n');
  }
};
