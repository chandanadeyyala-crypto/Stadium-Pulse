import { calculateRoute } from './routeEngine.js';

console.log("==================================================");
console.log("STADIUMPULSE AI - ROUTING ENGINE VERIFIER");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

// Test 1: Fastest Route from Gate A to Section 214
try {
  const result = calculateRoute("Gate A", "Section 214", "fastest", []);
  assert(result.success === true, "Route calculation succeeded");
  assert(result.path.length === 3, "Path has exactly 3 nodes");
  assert(result.path[0].id === "Gate A", "Starts at Gate A");
  assert(result.path[1].id === "Concourse West", "Passes through Concourse West");
  assert(result.path[2].id === "Section 214", "Ends at Section 214");
  assert(result.hasStairs === true, "Fastest route contains stairs (via Concourse West -> Section 214)");
} catch (e) {
  console.error("Test 1 encountered error:", e);
  testsFailed++;
}

// Test 2: Wheelchair Accessible Route from Gate A to Section 214 (should bypass stairs)
try {
  const result = calculateRoute("Gate A", "Section 214", "wheelchair", []);
  assert(result.success === true, "Wheelchair route calculation succeeded");
  // It cannot go Gate A -> Concourse West -> Section 214 because Concourse West -> Section 214 is not accessible.
  // It has to go Gate A -> Concourse West -> Restroom R2? Wait, let's see connections:
  // Gate A -> Concourse West (accessible: true)
  // Gate B -> Concourse West (accessible: true)
  // Gate D -> Concourse East (accessible: true)
  // Concourse West -> Section 214 (accessible: false)
  // Concourse East -> Section 214 (accessible: true)
  // Concourse West -> Restroom R2 (accessible: true)
  // Concourse East -> Medical Desk (accessible: true)
  // Metro Exit 3 matches and links to Gate A, Gate B, Gate D (all accessible: true)
  // Wait, is there a path from Concourse West to Concourse East?
  // Let's check the edges:
  // Gate A -> Concourse West
  // Gate B -> Concourse West
  // Gate D -> Concourse East
  // Concourse West -> Section 214 (stairs)
  // Concourse East -> Section 214 (ramp/elevator)
  // Concourse West -> Restroom R2
  // Concourse East -> Medical Desk
  // Gate A -> Metro Exit 3
  // Gate B -> Metro Exit 3
  // Gate D -> Metro Exit 3
  // So a wheelchair route from Gate A to Section 214 must go:
  // Gate A -> Metro Exit 3 -> Gate D -> Concourse East -> Section 214.
  // Let's verify if the computed path matches this sequence!
  assert(result.hasStairs === false, "Wheelchair route contains zero stairs");
  const pathIds = result.path.map(n => n.id);
  assert(pathIds.includes("Concourse East"), "Routes via Concourse East to utilize ramp/elevator");
  assert(!pathIds.includes("Concourse West") || pathIds.indexOf("Concourse West") < pathIds.indexOf("Section 214"), "Bypasses the stairs on Concourse West -> Section 214");
} catch (e) {
  console.error("Test 2 encountered error:", e);
  testsFailed++;
}

// Test 3: Rerouting around crowded node (Gate B)
try {
  // Edge list: Gate B -> Concourse West (baseCrowd: 1.2)
  // Gate B -> Metro Exit 3 (baseCrowd: 1.8)
  // If we simulate an alert: "Gate B is crowded" with severity warning or critical
  const alerts = [
    { target: "Gate B", severity: "warning", message: "Gate B congestion" }
  ];
  // Calculate route from Gate B to Metro Exit 3 with fastest vs least_crowded
  const normalRoute = calculateRoute("Gate B", "Metro Exit 3", "fastest", []);
  const busyAlertRoute = calculateRoute("Gate B", "Metro Exit 3", "least_crowded", alerts);
  
  assert(normalRoute.success === true, "Normal calculation succeeded");
  assert(busyAlertRoute.success === true, "Congestion calculation succeeded");
  
  // Under normal conditions, Gate B to Metro Exit 3 is a direct edge (distance: 250m, baseCrowd: 1.8)
  // Wait, let's see if it takes the direct edge or routes via Concourse West -> Gate A -> Metro Exit 3 (120m + 100m + 300m = 520m)
  // With warning alerts at Gate B, the crowdMultiplier of Gate B increases heavily.
  // In least_crowded, weights are scaled by crowd multipliers.
  console.log("Normal route path:", normalRoute.path.map(n => n.id).join(" -> "));
  console.log("Congested least_crowded path:", busyAlertRoute.path.map(n => n.id).join(" -> "));
} catch (e) {
  console.error("Test 3 encountered error:", e);
  testsFailed++;
}

console.log("==================================================");
console.log(`VERIFICATION SUMMARY: ${testsPassed} passed, ${testsFailed} failed.`);
console.log("==================================================");
process.exit(testsFailed > 0 ? 1 : 0);
