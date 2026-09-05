// Original public-only example; no app integration, model/provider call, or storage.
export const VERSION = "synthetic-ranking-imitation-v1";
export const FEATURES = ["concern_match", "ingredient_match", "budget_fit", "evidence_completeness", "active_fit"];

function keysEqual(value, expected) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).sort().join("|") === [...expected].sort().join("|");
}

export function validateArtifact(artifact) {
  if (!keysEqual(artifact, ["version", "kind", "featureOrder", "weights", "trainingHashes", "policy"])) throw Error("Invalid artifact schema");
  if (artifact.version !== VERSION || artifact.kind !== "pairwise-logistic-baseline-imitation") throw Error("Unsupported artifact");
  if (JSON.stringify(artifact.featureOrder) !== JSON.stringify(FEATURES)) throw Error("Feature schema mismatch");
  if (!Array.isArray(artifact.weights) || artifact.weights.length !== FEATURES.length
      || artifact.weights.some(value => typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > 100)) throw Error("Invalid learned weights");
  const policy = artifact.policy;
  if (!keysEqual(policy, ["scope", "candidateCount", "maximumDisplacement", "authoritative"])
      || policy.scope !== "fictional-comparison" || policy.candidateCount !== 5
      || policy.maximumDisplacement !== 2 || policy.authoritative !== false) throw Error("Invalid authority policy");
  if (!keysEqual(artifact.trainingHashes, ["design", "dataset", "split"])
      || Object.values(artifact.trainingHashes).some(value => typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value))) throw Error("Invalid training provenance");
}

function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((value, index) => permutations(values.filter((_, other) => index !== other)).map(rest => [value, ...rest]));
}

export function infer(query, artifact) {
  const candidates = query && typeof query === "object" ? query.candidates : [];
  const order = Array.isArray(candidates) ? candidates.filter(value => value && typeof value === "object" && !Array.isArray(value)).map(value => value.id) : [];
  const fallback = {controlled: false, order, scores: [], reason: "invalid-input"};
  try { validateArtifact(artifact); } catch { return {...fallback, reason: "invalid-artifact"}; }
  if (!query || query.scope !== "fictional-comparison") return {...fallback, reason: "out-of-scope"};
  if (!Array.isArray(candidates) || candidates.length !== 5 || order.length !== 5
      || order.some(id => typeof id !== "string" || !id.startsWith("fictional-") || id.length > 60)
      || new Set(order).size !== 5) return fallback;
  if (candidates.some(candidate => !Array.isArray(candidate.features) || candidate.features.length !== FEATURES.length
      || candidate.features.some(value => typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1))) return fallback;
  const scores = candidates.map(candidate => artifact.weights.reduce((sum, weight, index) => sum + weight * candidate.features[index], 0));
  let best = [0, 1, 2, 3, 4];
  let bestScore = -Infinity;
  for (const proposed of permutations([0, 1, 2, 3, 4])) {
    if (proposed.some((original, index) => Math.abs(index - original) > 2)) continue;
    const utility = proposed.reduce((sum, original, index) => sum + (5 - index) * scores[original], 0);
    if (utility > bestScore + 1e-12) { best = proposed; bestScore = utility; }
  }
  return {controlled: true, order: best.map(index => order[index]), scores, reason: "synthetic-comparison-only"};
}

export async function sha256(text) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(value => value.toString(16).padStart(2, "0")).join("");
}

export async function parseCheckedArtifact(text, expectedHash) {
  if (await sha256(text) !== expectedHash) throw Error("Artifact checksum mismatch");
  const artifact = JSON.parse(text);
  validateArtifact(artifact);
  return artifact;
}
