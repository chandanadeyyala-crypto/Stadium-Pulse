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


try {
  const result = calculateRoute("Gate A", "Section 214", "wheelchair", []);
  assert(result.success === true, "Wheelchair route calculation succeeded");
  assert(result.hasStairs === false, "Wheelchair route contains zero stairs");
  const pathIds = result.path.map(n => n.id);
  assert(pathIds.includes("Concourse East"), "Routes via Concourse East to utilize ramp/elevator");
  assert(!pathIds.includes("Concourse West") || pathIds.indexOf("Concourse West") < pathIds.indexOf("Section 214"), "Bypasses the stairs on Concourse West -> Section 214");
} catch (e) {
  console.error("Test 2 encountered error:", e);
  testsFailed++;
}

try {

  const alerts = [
    { target: "Gate B", severity: "warning", message: "Gate B congestion" }
  ];
  const normalRoute = calculateRoute("Gate B", "Metro Exit 3", "fastest", []);
  const busyAlertRoute = calculateRoute("Gate B", "Metro Exit 3", "least_crowded", alerts);

  assert(normalRoute.success === true, "Normal calculation succeeded");
  assert(busyAlertRoute.success === true, "Congestion calculation succeeded");

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
