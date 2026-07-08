import { STADIUM_NODES, STADIUM_EDGES } from './routeEngine.js';

// Local store representing active operational statuses and lists
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
    status: "approved", // approved incidents are committed to activeAlerts
    timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString()
  }
];

export const venueDataService = {
  getVenueData() {
    return {
      name: "StadiumPulse AI Arena (FIFA 2026 Prototype)",
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

  getAlerts() {
    return activeAlerts;
  },

  addAlert(alert) {
    activeAlerts.unshift(alert);
    return alert;
  },

  approveAlert(alertId) {
    const alertIndex = activeAlerts.findIndex(a => a.id === alertId);
    if (alertIndex !== -1) {
      activeAlerts[alertIndex].approved = true;
      return activeAlerts[alertIndex];
    }
    return null;
  },

  getIncidents() {
    return reportedIncidents;
  },

  addIncident(incident) {
    reportedIncidents.unshift(incident);
    return incident;
  },

  /**
   * Performs keyword extraction and matches questions to verified node info.
   * This handles RAG grounding.
   */
  findRelevantContext(normalizedQuestion) {
    const contextSegments = [];
    const question = normalizedQuestion.toLowerCase();

    // 1. Check for specific venue nodes (gates, restrooms, medical desk, transit)
    Object.values(STADIUM_NODES).forEach(node => {
      const nodeKeywords = [
        node.id.toLowerCase(),
        node.name.toLowerCase(),
        ...(node.description ? [node.description.toLowerCase()] : [])
      ];

      // Match nodes
      const isMatch = nodeKeywords.some(keyword => question.includes(keyword) || 
        (node.type === 'gate' && keyword.includes('gate') && question.includes(node.id.split(' ')[1]?.toLowerCase())) ||
        (node.type === 'facility' && keyword.includes('restroom') && question.includes('restroom')) ||
        (node.type === 'facility' && keyword.includes('medical') && (question.includes('medical') || question.includes('doctor') || question.includes('first aid')))
      );

      if (isMatch) {
        contextSegments.push(`[Venue Info] ${node.name}: ${node.description || 'Verified location'}. Type: ${node.type}.`);
      }
    });

    // 2. Attach active alerts affecting those nodes
    activeAlerts.forEach(alert => {
      if (alert.approved) {
        // If alert matches search keywords
        const alertText = alert.message.toLowerCase() + " " + (alert.target || "").toLowerCase();
        const matchesAlert = alertText.split(' ').some(word => word.length > 2 && question.includes(word));
        
        if (matchesAlert || question.includes('alert') || question.includes('warning') || question.includes('closed') || question.includes('crowded')) {
          contextSegments.push(`[Live Alert] Severity: ${alert.severity}. Target: ${alert.target || 'General'}. Status: ${alert.message}`);
        }
      }
    });

    // 3. Fallback: if they ask generic gate info, provide all gates
    if (question.includes('gate') && !contextSegments.some(c => c.includes('Gate'))) {
      const gates = Object.values(STADIUM_NODES).filter(n => n.type === 'gate');
      gates.forEach(g => {
        contextSegments.push(`[Venue Info] ${g.name}: ${g.description}.`);
      });
    }

    return contextSegments.join('\n');
  }
};
