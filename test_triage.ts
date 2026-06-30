import test from "node:test";
import assert from "node:assert";
import { 
  getDuplicationRadius, 
  classifyTextHeuristics, 
  handleScoreAndRoute 
} from "./src/utils/triageUtils";

test("Dynamic Duplication Radius Configuration", (t) => {
  // Test distinct radii for different issue types
  assert.strictEqual(getDuplicationRadius("pothole"), 20);
  assert.strictEqual(getDuplicationRadius("streetlight"), 30);
  assert.strictEqual(getDuplicationRadius("graffiti"), 15);
  assert.strictEqual(getDuplicationRadius("trash"), 50);
  assert.strictEqual(getDuplicationRadius("water_leak"), 100);

  // Test case insensitivity & trimming
  assert.strictEqual(getDuplicationRadius("  POTHOLE  "), 20);
  assert.strictEqual(getDuplicationRadius("Water_Leak"), 100);

  // Test default fallback
  assert.strictEqual(getDuplicationRadius("unknown_category"), 40);
  assert.strictEqual(getDuplicationRadius(""), 40);
});

test("Weighted Semantic Heuristics Text Classification", (t) => {
  // Test clear single keyword matching
  const pResult = classifyTextHeuristics("There is a large pothole on the road");
  assert.strictEqual(pResult.category, "pothole");
  assert.ok(pResult.confidence >= 0.6);
  assert.ok(pResult.cues.includes("hazardous road hole"));

  const gResult = classifyTextHeuristics("I noticed spray graffiti on the main wall");
  assert.strictEqual(gResult.category, "graffiti");
  assert.ok(gResult.cues.includes("unauthorized street art"));

  // Test case-insensitivity
  const tResult = classifyTextHeuristics("OVERFLOWING GARBAGE AT THE CORNER");
  assert.strictEqual(tResult.category, "trash");

  // Test multilingual support (e.g. Marathi/Hindi keywords)
  const multiResult = classifyTextHeuristics("रस्त्यावर मोठा खड्डा आहे");
  assert.strictEqual(multiResult.category, "pothole");

  // Test unresolved/unmatched content
  const blankResult = classifyTextHeuristics("This is some random feedback with no keywords");
  assert.strictEqual(blankResult.category, "other");
  assert.strictEqual(blankResult.confidence, 0.5);
});

test("Autonomous Score and Route Decision Engine", async (t) => {
  // Test default category scoring & routing
  const potholeRoute = await handleScoreAndRoute("pothole");
  assert.strictEqual(potholeRoute.assigned_department, "Public Works Department (PWD)");
  assert.strictEqual(potholeRoute.severity_score, 7);

  const trashRoute = await handleScoreAndRoute("trash");
  assert.strictEqual(trashRoute.assigned_department, "Solid Waste Management");
  assert.strictEqual(trashRoute.severity_score, 4);

  // Test sub-categorization scoring & routing under "other" category
  const animalRoute = await handleScoreAndRoute("other", [], "stray_animal");
  assert.strictEqual(animalRoute.assigned_department, "Municipal Animal Husbandry & Veterinary Department");
  assert.strictEqual(animalRoute.severity_score, 6);

  const parkRoute = await handleScoreAndRoute("other", [], "park_maintenance");
  assert.strictEqual(parkRoute.assigned_department, "Parks and Gardens Department");
  assert.strictEqual(parkRoute.severity_score, 4);

  const treeRoute = await handleScoreAndRoute("other", [], "unpruned_tree");
  assert.strictEqual(treeRoute.assigned_department, "Municipal Tree Authority & Garden Department");
  assert.strictEqual(treeRoute.severity_score, 7);

  const vehicleRoute = await handleScoreAndRoute("other", [], "abandoned_vehicle");
  assert.strictEqual(vehicleRoute.assigned_department, "Traffic Police & RTO Department");
  assert.strictEqual(vehicleRoute.severity_score, 5);

  const encroachmentRoute = await handleScoreAndRoute("other", [], "encroachment");
  assert.strictEqual(encroachmentRoute.assigned_department, "Anti-Encroachment Department");
  assert.strictEqual(encroachmentRoute.severity_score, 6);

  const noiseRoute = await handleScoreAndRoute("other", [], "noise_complaint");
  assert.strictEqual(noiseRoute.assigned_department, "Environmental Protection & Noise Control Cell");
  assert.strictEqual(noiseRoute.severity_score, 5);

  // Test unspecified/unknown sub_category defaults
  const unRoute = await handleScoreAndRoute("other", [], "unknown_sub");
  assert.strictEqual(unRoute.assigned_department, "Public Works Department (PWD)");
  assert.strictEqual(unRoute.severity_score, 5);
});
