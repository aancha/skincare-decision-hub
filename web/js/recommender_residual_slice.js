import {
  RECOMMENDER_V2_FEATURE_ORDER,
  buildRecommenderV2FeatureMap,
  getRecommenderV2HardEligibilityReason,
} from "./recommender_v2.js";


export const RESIDUAL_EXPERIMENT_ID = "recommender-residual-slice-v1";
export const RESIDUAL_FEATURE_SCHEMA_VERSION = 3;
export const RESIDUAL_MAX_TREES = 100;
export const RESIDUAL_MAX_TREE_NODES = 1500;
export const RESIDUAL_FEATURE_ORDER = Object.freeze([
  ...RECOMMENDER_V2_FEATURE_ORDER,
  "deterministic_score",
  "deterministic_position",
  "deterministic_score_margin",
  "explicit_ingredient_missing",
  "concern_ingredient_interaction",
  "category_role_integrity",
  "capped_strategic_ingredient_count",
  "capped_active_load",
]);


function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}


function finiteNumberArray(values, length, { positive = false } = {}) {
  return Array.isArray(values) && values.length === length && values.every(
    (value) => typeof value === "number" && Number.isFinite(value) && (!positive || value > 0)
  );
}


function validTree(tree) {
  if (!tree || typeof tree !== "object" || Array.isArray(tree)) return false;
  const length = tree.values?.length;
  if (!Number.isInteger(length) || length < 1) return false;
  const arrays = [tree.childrenLeft, tree.childrenRight, tree.features, tree.thresholds, tree.values];
  if (arrays.some((values) => !Array.isArray(values) || values.length !== length)) return false;
  if (!finiteNumberArray(tree.thresholds, length) || !finiteNumberArray(tree.values, length)) return false;
  for (let index = 0; index < length; index += 1) {
    const left = tree.childrenLeft[index];
    const right = tree.childrenRight[index];
    const feature = tree.features[index];
    if (![left, right, feature].every(Number.isInteger)) return false;
    const leaf = left === -1 && right === -1;
    if (leaf && feature !== -2) return false;
    if (!leaf && (left < 0 || right < 0 || left >= length || right >= length || feature < 0 || feature >= RESIDUAL_FEATURE_ORDER.length)) return false;
  }
  return true;
}


export function validateResidualArtifact(artifact, { taxonomyHash = null, manifest = null } = {}) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
    return { valid: false, reason: "malformed-artifact" };
  }
  if (
    artifact.schemaVersion !== 1 ||
    artifact.experimentId !== RESIDUAL_EXPERIMENT_ID ||
    artifact.featureSchemaVersion !== RESIDUAL_FEATURE_SCHEMA_VERSION
  ) return { valid: false, reason: "unsupported-schema" };
  if (artifact.defaultPolicy !== "off") return { valid: false, reason: "default-policy-not-off" };
  if (taxonomyHash && artifact.taxonomyHash !== taxonomyHash) return { valid: false, reason: "taxonomy-mismatch" };
  if (
    artifact.featureOrder?.length !== RESIDUAL_FEATURE_ORDER.length ||
    artifact.featureOrder.some((name, index) => name !== RESIDUAL_FEATURE_ORDER[index])
  ) return { valid: false, reason: "feature-order-mismatch" };
  const preprocessing = artifact.preprocessing;
  if (
    !preprocessing ||
    preprocessing.featureOrder?.some((name, index) => name !== RESIDUAL_FEATURE_ORDER[index]) ||
    preprocessing.featureOrder?.length !== RESIDUAL_FEATURE_ORDER.length ||
    !finiteNumberArray(preprocessing.means, RESIDUAL_FEATURE_ORDER.length) ||
    !finiteNumberArray(preprocessing.scales, RESIDUAL_FEATURE_ORDER.length, { positive: true })
  ) return { valid: false, reason: "invalid-preprocessing" };
  const runtime = artifact.runtimePolicy;
  if (
    !runtime || runtime.maximumDisplacement !== 2 || runtime.killSwitchDefault !== "off" ||
    runtime.fallback !== "exact deterministic order" || runtime.telemetry !== "none" ||
    runtime.liveLearning !== false || !Number.isFinite(runtime.residualWeight) ||
    !Number.isFinite(runtime.overrideThreshold)
  ) return { valid: false, reason: "invalid-runtime-policy" };
  const supported = artifact.supportedSlice;
  if (
    !supported || supported.candidateLimit !== 5 || supported.sort !== "relevance" ||
    !Array.isArray(supported.contextTypes) || !Array.isArray(supported.categories)
  ) return { valid: false, reason: "invalid-supported-slice" };
  if (artifact.modelType === "residual-pairwise-logistic-l2") {
    if (artifact.intercept !== 0 || !finiteNumberArray(artifact.weights, RESIDUAL_FEATURE_ORDER.length)) {
      return { valid: false, reason: "invalid-linear-model" };
    }
  } else if (artifact.modelType === "residual-pairwise-gradient-boosting") {
    if (
      !Number.isFinite(artifact.initialScore) || !Number.isFinite(artifact.learningRate) ||
      artifact.learningRate <= 0 || !Array.isArray(artifact.trees) || !artifact.trees.length ||
      artifact.trees.length > RESIDUAL_MAX_TREES ||
      artifact.trees.reduce((count, tree) => count + (tree.values?.length || 0), 0) > RESIDUAL_MAX_TREE_NODES ||
      artifact.trees.some((tree) => !validTree(tree))
    ) return { valid: false, reason: "invalid-tree-model" };
  } else return { valid: false, reason: "unsupported-model" };
  if (
    manifest &&
    (manifest.experimentId !== RESIDUAL_EXPERIMENT_ID || manifest.artifactHash !== artifact.artifactHash ||
      manifest.modelVersion !== artifact.modelVersion || manifest.defaultPolicy !== "off")
  ) return { valid: false, reason: "manifest-mismatch" };
  return { valid: true, reason: null };
}


async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}


export async function loadResidualArtifact(
  modelUrl,
  manifestUrl,
  { taxonomyHash = null, expectedManifestFileHash = null } = {},
) {
  if (!/^[a-f0-9]{64}$/.test(String(expectedManifestFileHash || ""))) {
    throw new Error("expected-manifest-file-hash-required");
  }
  const [modelResponse, manifestResponse] = await Promise.all([
    fetch(modelUrl, { cache: "no-store" }),
    fetch(manifestUrl, { cache: "no-store" }),
  ]);
  if (!modelResponse.ok || !manifestResponse.ok) throw new Error("residual-artifact-unavailable");
  const [modelText, manifestText] = await Promise.all([modelResponse.text(), manifestResponse.text()]);
  const artifact = JSON.parse(modelText);
  const manifest = JSON.parse(manifestText);
  if (await sha256Hex(manifestText) !== expectedManifestFileHash) throw new Error("manifest-file-hash-mismatch");
  if (await sha256Hex(modelText) !== manifest.artifactFileHash) throw new Error("artifact-file-hash-mismatch");
  const structural = validateResidualArtifact(artifact, { taxonomyHash, manifest });
  if (!structural.valid) throw new Error(structural.reason);
  return { artifact, manifest };
}


export function buildResidualFeatureMap(context, product, residualSignal, artifact) {
  const expectedSignals = [
    "deterministicPosition",
    "deterministicScore",
    "deterministicScoreMargin",
    "insideDeterministicTopFive",
  ];
  if (
    !residualSignal ||
    Object.keys(residualSignal).sort().some((name, index) => name !== expectedSignals[index]) ||
    expectedSignals.some((name) => !(name in residualSignal))
  ) throw new Error("invalid-residual-signal");
  const baseSchemaHash = artifact.featureConfig?.baseFeatureSchemaHash;
  const baseArtifact = {
    featureSchemaHash: baseSchemaHash,
    featureConfig: { ...artifact.featureConfig, schemaVersion: 2, featureSchemaHash: baseSchemaHash },
  };
  const values = buildRecommenderV2FeatureMap(context, product, baseArtifact);
  const ingredients = new Set((product.ingredients || []).map(normalize));
  const explicitIngredient = normalize(context.ingredient);
  const strategicCount = Number(values.strategic_ingredient_count || 0);
  const explicitMatch = Number(values.explicit_ingredient_match || 0);
  const concernMatch = Number(values.concern_direct_match || 0);
  Object.assign(values, {
    deterministic_score: Number(residualSignal.deterministicScore),
    deterministic_position: Number(residualSignal.deterministicPosition),
    deterministic_score_margin: Number(residualSignal.deterministicScoreMargin),
    explicit_ingredient_missing: Number(Boolean(explicitIngredient && !ingredients.has(explicitIngredient))),
    concern_ingredient_interaction: concernMatch * (explicitIngredient ? explicitMatch : Math.min(strategicCount, 1)),
    category_role_integrity: 1,
    capped_strategic_ingredient_count: Math.min(strategicCount, 2),
    capped_active_load: Math.min(Number(values.strong_active_count || 0), 2),
  });
  if (Object.keys(values).some((name, index) => name !== RESIDUAL_FEATURE_ORDER[index])) {
    throw new Error("feature-order-drift");
  }
  Object.entries(values).forEach(([name, value]) => {
    if (value != null && !Number.isFinite(value)) throw new Error(`non-finite-feature:${name}`);
  });
  return values;
}


export function vectorizeResidualFeatures(featureMap, artifact) {
  const validation = validateResidualArtifact(artifact);
  if (!validation.valid) throw new Error(validation.reason);
  return RESIDUAL_FEATURE_ORDER.map((name, index) => {
    const raw = featureMap[name] == null ? artifact.preprocessing.means[index] : featureMap[name];
    const value = (raw - artifact.preprocessing.means[index]) / artifact.preprocessing.scales[index];
    if (!Number.isFinite(value)) throw new Error(`non-finite-vector:${name}`);
    return value;
  });
}


function treeScore(tree, vector) {
  let node = 0;
  for (let step = 0; step <= tree.values.length; step += 1) {
    const left = tree.childrenLeft[node];
    const right = tree.childrenRight[node];
    if (left === right) return tree.values[node];
    node = vector[tree.features[node]] <= tree.thresholds[node] ? left : right;
  }
  throw new Error("cyclic-tree");
}


export function scoreResidualVector(vector, artifact) {
  const validation = validateResidualArtifact(artifact);
  if (!validation.valid) throw new Error(validation.reason);
  if (!finiteNumberArray(vector, RESIDUAL_FEATURE_ORDER.length)) throw new Error("invalid-feature-vector");
  const score = artifact.modelType === "residual-pairwise-logistic-l2"
    ? vector.reduce((total, value, index) => total + value * artifact.weights[index], 0)
    : artifact.initialScore + artifact.learningRate * artifact.trees.reduce(
      (total, tree) => total + treeScore(tree, vector), 0
    );
  if (!Number.isFinite(score)) throw new Error("non-finite-score");
  return score;
}


export function scoreResidualPair(left, right, artifact) {
  const difference = left.map((value, index) => value - right[index]);
  return (scoreResidualVector(difference, artifact) - scoreResidualVector(difference.map((value) => -value), artifact)) / 2;
}


function permutations(values) {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) => permutations(values.filter((_, other) => other !== index)).map((rest) => [value, ...rest]));
}


export function boundResidualOrder(proposed, deterministic, maximum = 2) {
  if ([...proposed].sort().join("\0") !== [...deterministic].sort().join("\0")) {
    throw new Error("candidate-order-mismatch");
  }
  const original = new Map(deterministic.map((candidateId, index) => [candidateId, index]));
  const desired = new Map(proposed.map((candidateId, index) => [candidateId, index]));
  const valid = permutations([...deterministic]).filter(
    (order) => order.every((candidateId, index) => Math.abs(index - original.get(candidateId)) <= maximum)
  );
  valid.sort((left, right) => {
    const leftDistance = left.reduce((total, candidateId, index) => total + Math.abs(index - desired.get(candidateId)), 0);
    const rightDistance = right.reduce((total, candidateId, index) => total + Math.abs(index - desired.get(candidateId)), 0);
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;
    for (let index = 0; index < left.length; index += 1) {
      const desiredDelta = desired.get(left[index]) - desired.get(right[index]);
      if (desiredDelta) return desiredDelta;
      const idDelta = left[index].localeCompare(right[index]);
      if (idDelta) return idDelta;
    }
    return 0;
  });
  if (!valid.length) throw new Error("no-valid-bounded-order");
  return valid[0];
}


function supportedSliceBypassReason(context, products, residualSignals, artifact) {
  const validation = validateResidualArtifact(artifact);
  if (!validation.valid) return validation.reason;
  const supported = artifact.supportedSlice;
  if (!supported.contextTypes.includes(context.contextType) || !supported.categories.includes(context.category)) return "unsupported-context";
  if ((context.sort || "relevance") !== supported.sort) return "unsupported-sort";
  if (["pregnancy", "allergy", "prescription", "medical", "redFlag", "safetyReview", "freeText", "unknownRequiredIngredients"].some((key) => context[key])) return "safety-or-unrestricted-context";
  if (products.length !== supported.candidateLimit) return "candidate-count-mismatch";
  const ids = products.map((product) => String(product.candidateId || ""));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length || Object.keys(residualSignals).sort().join("\0") !== [...ids].sort().join("\0")) return "candidate-identity-mismatch";
  for (const product of products) {
    if (normalize(product.category) !== normalize(context.category)) return "role-incompatible-product";
    if (!product.ingredients?.length || !String(product.description || "").trim()) return "insufficient-evidence";
    if (getRecommenderV2HardEligibilityReason(context, product)) return "hard-ineligible-product";
    if (residualSignals[product.candidateId]?.insideDeterministicTopFive !== true) return "invalid-residual-signal";
  }
  return null;
}


function sigmoid(value) {
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const exponential = Math.exp(value);
  return exponential / (1 + exponential);
}


export function rankResidualSlice(context, products, residualSignals, artifact, { enabled = false, killSwitch = false } = {}) {
  const deterministicOrder = products.map((product) => product.candidateId);
  if (!enabled || killSwitch) return { products, order: deterministicOrder, controlled: false, reason: enabled ? "kill-switch" : "disabled" };
  const bypass = supportedSliceBypassReason(context, products, residualSignals, artifact);
  if (bypass) return { products, order: deterministicOrder, controlled: false, reason: bypass };
  try {
    const vectors = new Map(products.map((product) => [
      product.candidateId,
      vectorizeResidualFeatures(buildResidualFeatureMap(context, product, residualSignals[product.candidateId], artifact), artifact),
    ]));
    const corrections = new Map();
    if (artifact.modelType === "residual-pairwise-logistic-l2") {
      deterministicOrder.forEach((id) => corrections.set(id, scoreResidualVector(vectors.get(id), artifact)));
    } else {
      deterministicOrder.forEach((left) => corrections.set(left, deterministicOrder
        .filter((right) => right !== left)
        .reduce((total, right) => total + sigmoid(scoreResidualPair(vectors.get(left), vectors.get(right), artifact)), 0)));
    }
    const combined = new Map(deterministicOrder.map((id) => [
      id,
      -Number(residualSignals[id].deterministicPosition) + artifact.runtimePolicy.residualWeight * corrections.get(id),
    ]));
    const proposed = [...deterministicOrder].sort((left, right) => combined.get(right) - combined.get(left) || left.localeCompare(right));
    const confidence = proposed[0] === deterministicOrder[0] ? 0 : Math.abs(scoreResidualPair(vectors.get(proposed[0]), vectors.get(deterministicOrder[0]), artifact));
    if (proposed.every((id, index) => id === deterministicOrder[index]) || confidence < artifact.runtimePolicy.overrideThreshold) {
      return { products, order: deterministicOrder, controlled: false, reason: "below-threshold", confidence };
    }
    const order = boundResidualOrder(proposed, deterministicOrder, artifact.runtimePolicy.maximumDisplacement);
    const byId = new Map(products.map((product) => [product.candidateId, product]));
    return {
      products: order.map((id) => byId.get(id)),
      order,
      controlled: order.some((id, index) => id !== deterministicOrder[index]),
      reason: order.some((id, index) => id !== deterministicOrder[index]) ? "ml-ranked" : "no-order-change",
      confidence,
      modelVersion: artifact.modelVersion,
    };
  } catch (error) {
    return { products, order: deterministicOrder, controlled: false, reason: `fail-closed:${error.message}` };
  }
}
