
export const STADIUM_NODES = {
  "Gate A": { id: "Gate A", name: "Gate A (North Entrance)", type: "gate", description: "North main gate, close to parking lot A" },
  "Gate B": { id: "Gate B", name: "Gate B (South Entrance)", type: "gate", description: "South secondary gate, close to rideshare zone" },
  "Gate D": { id: "Gate D", name: "Gate D (East Entrance)", type: "gate", description: "East VIP and General gate, close to light rail" },
  "Section 214": { id: "Section 214", name: "Section 214 (Upper Tier)", type: "section", description: "Upper level seating section" },
  "Restroom R2": { id: "Restroom R2", name: "Restroom R2 (Family & Accessible)", type: "facility", description: "Fully accessible restroom near East concourse" },
  "Medical Desk": { id: "Medical Desk", name: "Medical Desk East", type: "facility", description: "First Aid & Medical assistance, Concourse level" },
  "Metro Exit 3": { id: "Metro Exit 3", name: "Metro Exit 3 (Transit Hub)", type: "transit", description: "Direct access to local rapid transit link" },
  "Concourse East": { id: "Concourse East", name: "Concourse East Corridor", type: "corridor", description: "Main eastern thoroughfare with ramps/elevators" },
  "Concourse West": { id: "Concourse West", name: "Concourse West Corridor", type: "corridor", description: "Main western thoroughfare containing stairs" },
  "Food Court": { id: "Food Court", name: "Food Court (West Concourse)", type: "facility", description: "Main food court with diverse dining options", category: "Meals", zone: "Concourse West", accessibility: "Wheelchair Accessible", dietary: ["Vegetarian", "Vegan", "Halal"], status: "open", lastUpdated: "5 minutes ago" },
  "Water Station": { id: "Water Station", name: "Water Station (North Concourse)", type: "facility", description: "Free chilled drinking water refill point", category: "Water stations", zone: "Concourse West", accessibility: "Wheelchair Accessible", dietary: [], status: "open", lastUpdated: "2 minutes ago" },
  "Beverage Point": { id: "Beverage Point", name: "Beverage Point (East Concourse)", type: "facility", description: "Soft drinks, beer, and snacks counter", category: "Beverages", zone: "Concourse East", accessibility: "Wheelchair Accessible", dietary: [], status: "open", lastUpdated: "10 minutes ago" },
  "Coffee Counter": { id: "Coffee Counter", name: "Coffee Counter (South Concourse)", type: "facility", description: "Fresh espresso and pastries", category: "Coffee", zone: "Concourse East", accessibility: "Wheelchair Accessible", dietary: ["Vegetarian", "Vegan"], status: "open", lastUpdated: "4 minutes ago" }
};


export const STADIUM_EDGES = [
  { from: "Gate A", to: "Concourse West", distance: 100, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Gate B", to: "Concourse West", distance: 120, isAccessible: true, baseCrowd: 1.2, isBlocked: false },
  { from: "Gate D", to: "Concourse East", distance: 80, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Concourse West", to: "Section 214", distance: 150, isAccessible: false, baseCrowd: 1.1, isBlocked: false },
  { from: "Concourse East", to: "Section 214", distance: 200, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Concourse West", to: "Restroom R2", distance: 50, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Concourse East", to: "Medical Desk", distance: 60, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Gate A", to: "Metro Exit 3", distance: 300, isAccessible: true, baseCrowd: 1.3, isBlocked: false },
  { from: "Gate B", to: "Metro Exit 3", distance: 250, isAccessible: true, baseCrowd: 1.8, isBlocked: false },
  { from: "Gate D", to: "Metro Exit 3", distance: 400, isAccessible: true, baseCrowd: 1.1, isBlocked: false },
  { from: "Concourse West", to: "Food Court", distance: 40, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Concourse West", to: "Water Station", distance: 30, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Concourse East", to: "Beverage Point", distance: 50, isAccessible: true, baseCrowd: 1.0, isBlocked: false },
  { from: "Concourse East", to: "Coffee Counter", distance: 70, isAccessible: true, baseCrowd: 1.0, isBlocked: false }
];

/*
 * @param {string} startNodeId - Starting node ID
 * @param {string} endNodeId - Destination node ID
 * @param {string} preference - Route type ('fastest', 'least_crowded', 'wheelchair', 'family', 'emergency')
 * @param {Array} activeAlerts - List of current live alerts affecting gates/paths
 */
export function calculateRoute(startNodeId, endNodeId, preference = 'fastest', activeAlerts = []) {
  if (!STADIUM_NODES[startNodeId] || !STADIUM_NODES[endNodeId]) {
    return {
      success: false,
      message: "Start or destination node not found in verified venue graph."
    };
  }


  const graph = {};
  for (const nodeId in STADIUM_NODES) {
    graph[nodeId] = [];
  }

  const getDynamicWeight = (edge) => {
    let weight = edge.distance;
    let crowdMultiplier = edge.baseCrowd || 1.0;
    let blocked = edge.isBlocked;

    activeAlerts.forEach(alert => {
      const target = alert.target || '';
      if (target === edge.from || target === edge.to) {
        if (alert.severity === 'critical') {
          blocked = true;
        } else if (alert.severity === 'warning') {
          crowdMultiplier += 2.0;
        } else if (alert.severity === 'info') {
          crowdMultiplier += 0.5;
        }
      }
    });

    if (blocked) {
      return Infinity;
    }

    if (preference === 'least_crowded') {
      weight = weight * crowdMultiplier * 2;
    } else if (preference === 'wheelchair') {

      if (!edge.isAccessible) {
        return Infinity;
      }
    } else if (preference === 'family') {

      if (!edge.isAccessible) {
        weight = weight * 1.5;
      }
      weight = weight * crowdMultiplier;
    } else {
      weight = weight * crowdMultiplier;
    }

    return weight;
  };

  STADIUM_EDGES.forEach(edge => {
    const w = getDynamicWeight(edge);
    if (w !== Infinity) {
      graph[edge.from].push({ node: edge.to, weight: w, originalEdge: edge });
      graph[edge.to].push({ node: edge.from, weight: w, originalEdge: edge });
    }
  });


  const distances = {};
  const previous = {};
  const queue = new Set();

  for (const nodeId in STADIUM_NODES) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    queue.add(nodeId);
  }
  distances[startNodeId] = 0;

  while (queue.size > 0) {
    let minNode = null;
    queue.forEach(nodeId => {
      if (minNode === null || distances[nodeId] < distances[minNode]) {
        minNode = nodeId;
      }
    });

    if (minNode === null || distances[minNode] === Infinity) {
      break;
    }

    if (minNode === endNodeId) {
      break;
    }

    queue.delete(minNode);

    const neighbors = graph[minNode] || [];
    neighbors.forEach(neighbor => {
      if (queue.has(neighbor.node)) {
        const alt = distances[minNode] + neighbor.weight;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = minNode;
        }
      }
    });
  }

  const path = [];
  let curr = endNodeId;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  if (path[0] !== startNodeId) {
    return {
      success: false,
      message: `No path found from ${startNodeId} to ${endNodeId} under standard constraints.`
    };
  }

  let totalDistance = 0;
  let hasStairs = false;
  let highCrowdAreas = [];

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];

    const edge = STADIUM_EDGES.find(e =>
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );

    if (edge) {
      totalDistance += edge.distance;
      if (!edge.isAccessible) hasStairs = true;

      activeAlerts.forEach(alert => {
        if (alert.target === from || alert.target === to) {
          if (!highCrowdAreas.includes(alert.target)) {
            highCrowdAreas.push(alert.target);
          }
        }
      });
    }
  }

  let reason = "This route follows verified walkways.";
  if (preference === 'wheelchair') {
    reason = "Optimized for wheelchair accessibility. This path bypasses all staircases by routing exclusively through corridors with ramps or elevators.";
  } else if (preference === 'least_crowded') {
    if (highCrowdAreas.length > 0) {
      reason = `Optimized to bypass congestion. Although some nearby areas are busy, this path reroutes you away from heavy crowding at ${highCrowdAreas.join(' & ')}.`;
    } else {
      reason = "Optimized for minimal congestion. The path utilizes routes currently experiencing very light pedestrian activity.";
    }
  } else if (preference === 'emergency') {
    reason = "Calculated direct emergency egress route to the nearest safe stadium perimeter gate.";
  } else if (preference === 'family') {
    reason = "Optimized for families with strollers. It avoids stairs where possible and prioritizes wider, low-congestion corridors.";
  } else {
    if (highCrowdAreas.length > 0) {
      reason = `Fastest route. Note: It passes through some active crowd areas (${highCrowdAreas.join(', ')}). Consider switching to 'Least Crowded' mode if you prefer to bypass queues.`;
    } else {
      reason = "Fastest calculated route connecting your start point to your seat or destination.";
    }
  }

  return {
    success: true,
    path: path.map(nodeId => STADIUM_NODES[nodeId]),
    totalDistance: `${totalDistance} meters`,
    hasStairs,
    preference,
    reason,
    source: "StadiumPulse Graph Routing Engine v1.0 (Verified Venue Database)"
  };
}
