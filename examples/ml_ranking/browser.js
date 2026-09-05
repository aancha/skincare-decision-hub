import {infer, parseCheckedArtifact, sha256, VERSION} from "./inference.js";

function check(condition, message) { if (!condition) throw Error(message); }

async function textFile(name) {
  const response = await fetch(`./artifacts/${name}`, {credentials: "omit", cache: "no-store"});
  if (!response.ok) throw Error(`Unavailable artifact: ${name}`);
  return response.text();
}

async function run() {
  const manifest = JSON.parse(await textFile("manifest.json"));
  check(manifest.version === VERSION, "Unsupported manifest");
  const modelText = await textFile("model.json");
  const model = await parseCheckedArtifact(modelText, manifest.sha256["model.json"]);
  const parityText = await textFile("parity.json");
  check(await sha256(parityText) === manifest.sha256["parity.json"], "Parity checksum mismatch");
  const fixtures = JSON.parse(parityText);
  let maximumError = 0;
  for (const {query, expected} of fixtures.cases) {
    const actual = infer(query, model);
    check(actual.reason === expected.reason && actual.controlled === expected.controlled, "Fallback parity mismatch");
    check(JSON.stringify(actual.order) === JSON.stringify(expected.order), "Order parity mismatch");
    check(actual.scores.length === expected.scores.length, "Score count mismatch");
    actual.scores.forEach((value, index) => { maximumError = Math.max(maximumError, Math.abs(value - expected.scores[index])); });
  }
  check(maximumError <= fixtures.tolerance, "Numeric tolerance exceeded");
  const query = fixtures.cases[0].query;
  const invalid = [null, {...model, version: "other"}, {...model, weights: [NaN, 0, 0, 0, 0]},
    {...model, weights: [true, 0, 0, 0, 0]}, {...model, policy: {...model.policy, authoritative: true}},
    {...model, featureOrder: [...model.featureOrder].reverse()}];
  for (const artifact of invalid) check(infer(query, artifact).reason === "invalid-artifact", "Invalid artifact accepted");
  const malformed = structuredClone(query);
  malformed.candidates[0].features[0] = Infinity;
  check(infer(malformed, model).reason === "invalid-input", "Nonfinite feature accepted");
  const tied = structuredClone(query);
  tied.candidates.forEach(candidate => { candidate.features = [0, 0, 0, 0, 0]; });
  check(JSON.stringify(infer(tied, model).order) === JSON.stringify(tied.candidates.map(candidate => candidate.id)), "Tie order changed");
  let checksumRejected = false;
  try { await parseCheckedArtifact(`${modelText} `, manifest.sha256["model.json"]); } catch { checksumRejected = true; }
  check(checksumRejected, "Tampered bytes accepted");
  const report = {status: "PASS", evidence: "offline synthetic imitation, not recommendation quality", parityCases: fixtures.cases.length,
    maximumNumericError: maximumError, invalidArtifactsRejected: invalid.length, checksumRejected,
    viewportWidth: window.innerWidth,
    overflow: document.documentElement.scrollWidth > window.innerWidth};
  document.querySelector("#status").textContent = `PASS — ${fixtures.cases.length} Python / JavaScript cases`;
  document.querySelector("#results").textContent = JSON.stringify(report, null, 2);
  document.querySelector("#comparison").textContent = JSON.stringify({teacherOrder: query.candidates.map(candidate => candidate.id),
    learnedComparison: infer(query, model).order}, null, 2);
  document.documentElement.dataset.result = "PASS";
  window.parityReport = report;
  return report;
}

run().catch(error => {
  document.querySelector("#status").textContent = "FAIL — local verification incomplete";
  document.querySelector("#results").textContent = error.message;
  document.documentElement.dataset.result = "FAIL";
  window.parityReport = {status: "FAIL", error: error.message};
}).finally(async () => {
  if (new URLSearchParams(location.search).get("test") === "1") {
    await fetch("/__ml_result__", {method: "POST", credentials: "omit", headers: {"Content-Type": "application/json"},
      body: JSON.stringify(window.parityReport)});
  }
});
