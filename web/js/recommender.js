import {
  BARRIER_SUPPORT_INGREDIENTS,
  CONCERN_STRATEGIES,
  SKIN_PROFILES,
  STRONG_ACTIVE_INGREDIENTS,
} from "./guardrails.js";

export const RECOMMENDER_POLICIES = Object.freeze({ OFF: "off", SHADOW: "shadow", BLEND: "blend" });
export const RECOMMENDER_AUDIT_LIMIT = 50;
export const RECOMMENDER_TOP_K = 10;
export const RECOMMENDER_FEATURE_SCHEMA_VERSION = 1;

const EXPECTED_FEATURE_ORDER = [
  "category::cleanser", "category::mask", "category::moisturizer", "category::serum",
  "category::sunscreen", "category::toner", "category::treatment",
  "category_role_match", "concern_direct_match", "strategic_ingredient_count",
  "explicit_ingredient_match", "profile_concern_match_count", "routine_step_category_match",
  "barrier_support_count", "strong_active_count", "price", "log_price",
  "category_price_percentile", "rating", "log_review_count", "rating_provenance_depth",
  "review_provenance_depth", "evidence_freshness", "availability_known",
  "ingredient_evidence_complete", "description_complete", "general_provenance_completeness",
  "comparison_family_known", "source_depth", "price_missing", "rating_missing",
  "review_count_missing", "ingredients_missing", "description_missing", "provenance_missing",
  "freshness_missing", "sensitivity_active_interaction", "sensitivity_barrier_interaction",
  "actives_comfort_active_interaction", "budget_price_interaction", "explicit_retailer_match",
  "avoid_match_count",
];

const runtime = {
  requestedPolicy: RECOMMENDER_POLICIES.OFF,
  activeModel: null,
  pendingModel: null,
  lastCaseKey: null,
  loadAttempted: false,
  loadResult: null,
  audits: [],
};

function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function unique(values) {
  return [...new Set((values || []).filter((value) => value != null && value !== ""))];
}

function provenance(product, field) {
  const direct = product?.[`${field}Provenance`];
  if (direct && typeof direct === "object" && !Array.isArray(direct)) return direct;
  const value = product?.provenance?.fields?.[field];
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function provenanceDepth(value) {
  return Object.values(value || {}).filter((entry) => entry != null && entry !== "" && !(Array.isArray(entry) && !entry.length) && !(typeof entry === "object" && !Array.isArray(entry) && !Object.keys(entry).length)).length;
}

function evidenceFreshness(product, referenceTime) {
  const reference = Date.parse(referenceTime || "");
  const timestamps = ["rating", "reviewCount", "ingredients", "description"]
    .map((field) => provenance(product, field))
    .map((value) => Date.parse(value.observedAt || value.fetchedAt || ""))
    .filter(Number.isFinite);
  if (!Number.isFinite(reference) || !timestamps.length) return null;
  const ageDays = Math.max(0, (reference - Math.max(...timestamps)) / 86400000);
  return Math.max(0, 1 - ageDays / 365);
}

function percentile(value, references) {
  if (value == null || !Array.isArray(references) || !references.length) return null;
  return references.filter((reference) => reference <= value).length / references.length;
}

export function buildRecommenderFeatureMap(context, product, artifact) {
  const category = normalize(product?.category);
  const concerns = new Set((product?.concerns || []).map(normalize).filter(Boolean));
  const ingredients = new Set((product?.ingredients || []).map(normalize).filter(Boolean));
  const contextConcern = normalize(context?.concern || context?.primaryConcern);
  const explicitIngredient = normalize(context?.ingredient);
  const contextCategories = new Set([context?.category, ...(context?.categories || [])].map(normalize).filter(Boolean));
  const strategic = new Set((CONCERN_STRATEGIES[contextConcern]?.lookFor || []).map(normalize).filter(Boolean));
  const profileConcerns = new Set((SKIN_PROFILES[String(context?.profile || "all")]?.concerns || []).map(normalize).filter(Boolean));
  const barrierCount = [...ingredients].filter((value) => BARRIER_SUPPORT_INGREDIENTS.has ? BARRIER_SUPPORT_INGREDIENTS.has(value) : BARRIER_SUPPORT_INGREDIENTS.includes(value)).length;
  const activeCount = [...ingredients].filter((value) => STRONG_ACTIVE_INGREDIENTS.has ? STRONG_ACTIVE_INGREDIENTS.has(value) : STRONG_ACTIVE_INGREDIENTS.includes(value)).length;
  const price = finiteNumber(product?.price);
  const rating = finiteNumber(product?.rating);
  const reviewCount = finiteNumber(product?.reviewCount);
  const ratingProvenance = provenance(product, "rating");
  const reviewProvenance = provenance(product, "reviewCount");
  const ingredientProvenance = provenance(product, "ingredients");
  const descriptionProvenance = provenance(product, "description");
  const provenancePresent = [ratingProvenance, reviewProvenance, ingredientProvenance, descriptionProvenance].some((value) => Object.keys(value).length);
  const freshness = evidenceFreshness(product, artifact.featureConfig?.referenceTime);
  const descriptionPresent = Boolean(String(product?.description || "").trim());
  const availabilityKnown = Boolean(product?.availabilityKnown || (product && Object.prototype.hasOwnProperty.call(product, "availability") && product.availability != null) || product?.availabilityState);
  const comparisonKnown = Boolean(product?.comparisonFamilyKey || product?.comparisonKey || product?.canonicalProductId);
  const retailers = unique(product?.retailers || (product?.retailer ? [product.retailer] : []));
  const offers = unique(product?.offerIds || (product?.id ? [product.id] : []));
  const pricePercentile = percentile(price, artifact.featureConfig?.categoryPriceReferences?.[category] || []);
  const sensitivityWeight = ({low: 0, moderate: 0.5, high: 1})[String(context?.sensitivity)] ?? 0.5;
  const activesWeight = ({low: -1, medium: 0, high: 1})[String(context?.activesComfort)] ?? 0;
  const budget = String(context?.budget || "any");
  const budgetPrice = pricePercentile == null ? null : ({
    budget: 1 - pricePercentile,
    balanced: 1 - Math.abs(pricePercentile - 0.5) * 2,
    premium: pricePercentile,
    any: 0,
  })[budget] ?? 0;
  const avoid = new Set((context?.avoidIngredients || []).map(normalize).filter(Boolean));
  const routineCategories = new Set((context?.routineCategories || []).map(normalize).filter(Boolean));
  const explicitRetailer = String(context?.retailer || "").trim();
  const values = Object.fromEntries(EXPECTED_FEATURE_ORDER.slice(0, 7).map((name) => [name, Number(category === name.slice("category::".length))]));
  Object.assign(values, {
    category_role_match: Number(!contextCategories.size || contextCategories.has(category)),
    concern_direct_match: Number(Boolean(contextConcern && concerns.has(contextConcern))),
    strategic_ingredient_count: [...ingredients].filter((value) => strategic.has(value)).length,
    explicit_ingredient_match: Number(Boolean(explicitIngredient && ingredients.has(explicitIngredient))),
    profile_concern_match_count: [...concerns].filter((value) => profileConcerns.has(value)).length,
    routine_step_category_match: Number(Boolean(routineCategories.size && routineCategories.has(category))),
    barrier_support_count: barrierCount,
    strong_active_count: activeCount,
    price,
    log_price: price != null && price >= 0 ? Math.log1p(price) : null,
    category_price_percentile: pricePercentile,
    rating,
    log_review_count: reviewCount != null && reviewCount >= 0 ? Math.log1p(reviewCount) : null,
    rating_provenance_depth: provenanceDepth(ratingProvenance),
    review_provenance_depth: provenanceDepth(reviewProvenance),
    evidence_freshness: freshness,
    availability_known: Number(availabilityKnown),
    ingredient_evidence_complete: Number(Boolean(ingredients.size)),
    description_complete: Number(descriptionPresent),
    general_provenance_completeness: [Boolean(ingredients.size), descriptionPresent, rating != null, reviewCount != null, availabilityKnown].filter(Boolean).length / 5,
    comparison_family_known: Number(comparisonKnown),
    source_depth: retailers.length + Math.log1p(offers.length),
    price_missing: Number(price == null),
    rating_missing: Number(rating == null),
    review_count_missing: Number(reviewCount == null),
    ingredients_missing: Number(!ingredients.size),
    description_missing: Number(!descriptionPresent),
    provenance_missing: Number(!provenancePresent),
    freshness_missing: Number(freshness == null),
    sensitivity_active_interaction: sensitivityWeight * activeCount,
    sensitivity_barrier_interaction: sensitivityWeight * barrierCount,
    actives_comfort_active_interaction: activesWeight * activeCount,
    budget_price_interaction: budgetPrice,
    explicit_retailer_match: Number(Boolean(explicitRetailer && retailers.includes(explicitRetailer))),
    avoid_match_count: [...ingredients].filter((value) => avoid.has(value)).length,
  });
  return values;
}

export function validateRecommenderArtifact(artifact, expectedTaxonomyHash = null) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) return {valid: false, reason: "malformed-artifact"};
  if (artifact.schemaVersion !== 1 || artifact.modelType !== "pairwise-logistic-linear" || artifact.featureSchemaVersion !== RECOMMENDER_FEATURE_SCHEMA_VERSION) return {valid: false, reason: "unsupported-schema"};
  if (expectedTaxonomyHash && artifact.taxonomyHash !== expectedTaxonomyHash) return {valid: false, reason: "taxonomy-mismatch"};
  if (!Array.isArray(artifact.featureOrder) || artifact.featureOrder.length !== EXPECTED_FEATURE_ORDER.length || artifact.featureOrder.some((name, index) => name !== EXPECTED_FEATURE_ORDER[index])) return {valid: false, reason: "feature-order-mismatch"};
  if (new Set(artifact.featureOrder).size !== artifact.featureOrder.length) return {valid: false, reason: "duplicate-feature"};
  for (const key of ["means", "scales", "weights"]) {
    if (!Array.isArray(artifact[key]) || artifact[key].length !== artifact.featureOrder.length || artifact[key].some((value) => typeof value !== "number" || !Number.isFinite(value))) return {valid: false, reason: `invalid-${key}`};
  }
  if (artifact.scales.some((value) => value <= 0) || artifact.intercept !== 0) return {valid: false, reason: "invalid-linear-parameters"};
  if (!artifact.featureConfig || !artifact.supportedContexts || artifact.defaultPolicy !== RECOMMENDER_POLICIES.OFF) return {valid: false, reason: "incomplete-contract"};
  return {valid: true, reason: null};
}

export function scoreRecommenderProduct(context, product, artifact) {
  const validation = validateRecommenderArtifact(artifact);
  if (!validation.valid) throw new Error(validation.reason);
  const raw = buildRecommenderFeatureMap(context, product, artifact);
  let score = 0;
  artifact.featureOrder.forEach((name, index) => {
    const rawValue = raw[name] == null ? artifact.means[index] : raw[name];
    if (typeof rawValue !== "number" || !Number.isFinite(rawValue)) throw new Error(`non-finite-feature:${name}`);
    const standardized = (rawValue - artifact.means[index]) / artifact.scales[index];
    score += standardized * artifact.weights[index];
  });
  if (!Number.isFinite(score)) throw new Error("non-finite-score");
  return score;
}

export function getRecommenderBypassReason(context, artifact, policy = runtime.requestedPolicy) {
  if (policy === RECOMMENDER_POLICIES.OFF) return "policy-off";
  if (!artifact) return "model-unavailable";
  if (String(context?.sort || "relevance") !== "relevance") return "unsupported-sort";
  if (context?.pregnancy || context?.pregnancyRequested) return "pregnancy-context";
  if (context?.allergy || context?.allergyRequested) return "allergy-context";
  if (context?.prescription || context?.prescriptionContext) return "prescription-context";
  if (context?.redFlag || context?.severeSymptoms || context?.medicalContext) return "medical-context";
  if (context?.unrestrictedFreeText || context?.type === "search") return "unrestricted-free-text";
  if (!artifact.supportedContexts.types.includes(context?.type)) return "unsupported-context";
  if (!context?.enforcesEligibility) return "focused-context-required";
  return null;
}

export function getRecommenderFamilyId(product) {
  return String(product?.canonicalProductId || product?.comparisonKey || product?.comparisonFamilyKey || product?.id || "");
}

export function rankRecommenderShadow(products, context, deterministicScores, {policy = runtime.requestedPolicy, artifact = runtime.activeModel, caseKey = ""} = {}) {
  const startedAt = performance.now();
  const bypassReason = getRecommenderBypassReason(context, artifact, policy);
  if (bypassReason) return {products, audit: {policy, caseKey, bypassReason, totalMs: performance.now() - startedAt}};
  const representatives = [];
  const seenFamilies = new Set();
  for (const product of products) {
    const familyId = getRecommenderFamilyId(product);
    if (!familyId || seenFamilies.has(familyId)) continue;
    if ((context?.avoidIngredients || []).some((ingredient) => (product.ingredients || []).map(normalize).includes(normalize(ingredient)))) return {products, audit: {policy, caseKey, bypassReason: "hard-eligibility-violation", totalMs: performance.now() - startedAt}};
    seenFamilies.add(familyId);
    representatives.push(product);
    if (representatives.length === RECOMMENDER_TOP_K) break;
  }
  const scored = representatives.map((product, deterministicPosition) => ({
    product,
    familyId: getRecommenderFamilyId(product),
    deterministicPosition,
    deterministicScore: deterministicScores.get(product.id) ?? 0,
    learnedScore: scoreRecommenderProduct(context, product, artifact),
  }));
  const learned = [...scored].sort((left, right) => right.learnedScore - left.learnedScore || left.familyId.localeCompare(right.familyId));
  const learnedPosition = new Map(learned.map((entry, index) => [entry.familyId, index]));
  const audit = {
    policy,
    modelVersion: artifact.modelVersion,
    contextId: [context.type, context.primaryConcern || context.concern || "", context.category || (context.categories || [])[0] || ""].map(normalize).join(":"),
    caseKey,
    candidates: scored.map((entry) => ({
      familyId: entry.familyId,
      deterministicPosition: entry.deterministicPosition,
      learnedPosition: learnedPosition.get(entry.familyId),
      scoreMargin: entry.learnedScore - (learned[1]?.learnedScore ?? entry.learnedScore),
    })),
    bypassReason: null,
    scoreMs: performance.now() - startedAt,
    totalMs: performance.now() - startedAt,
  };
  runtime.audits.push(audit);
  if (runtime.audits.length > RECOMMENDER_AUDIT_LIMIT) runtime.audits.splice(0, runtime.audits.length - RECOMMENDER_AUDIT_LIMIT);
  return {products, audit};
}

export function applyFutureRecommenderBlend(products, deterministicScores, learnedScores, {alpha, clampRadius, maxDisplacement}) {
  const originalPosition = new Map(products.map((product, index) => [product.id, index]));
  const top = products.slice(0, RECOMMENDER_TOP_K);
  const proposed = [...top].sort((left, right) => {
    const leftLearned = Math.max(-clampRadius, Math.min(clampRadius, learnedScores.get(left.id) ?? 0));
    const rightLearned = Math.max(-clampRadius, Math.min(clampRadius, learnedScores.get(right.id) ?? 0));
    return ((deterministicScores.get(right.id) ?? 0) + alpha * rightLearned) - ((deterministicScores.get(left.id) ?? 0) + alpha * leftLearned) || left.id.localeCompare(right.id);
  });
  const bounded = [...top];
  proposed.forEach((product, proposedIndex) => {
    const originalIndex = originalPosition.get(product.id);
    const boundedIndex = Math.max(originalIndex - maxDisplacement, Math.min(originalIndex + maxDisplacement, proposedIndex));
    const currentIndex = bounded.findIndex((entry) => entry.id === product.id);
    bounded.splice(currentIndex, 1);
    bounded.splice(boundedIndex, 0, product);
  });
  return [...bounded, ...products.slice(RECOMMENDER_TOP_K)];
}

async function sha256Hex(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((entry) => entry.toString(16).padStart(2, "0")).join("");
}

export async function loadRecommenderArtifact({modelUrl = new URL("../recommender_model.json", import.meta.url), manifestUrl = new URL("../recommender_model.manifest.json", import.meta.url), taxonomyUrl = new URL("../skincare_guardrails.json", import.meta.url)} = {}) {
  const startedAt = performance.now();
  try {
    const [modelResponse, manifestResponse, taxonomyResponse] = await Promise.all([fetch(modelUrl, {cache: "no-store"}), fetch(manifestUrl, {cache: "no-store"}), fetch(taxonomyUrl, {cache: "no-store"})]);
    if (!modelResponse.ok || !manifestResponse.ok || !taxonomyResponse.ok) throw new Error("artifact-fetch-failed");
    const [modelText, manifest, taxonomyBytes] = await Promise.all([modelResponse.text(), manifestResponse.json(), taxonomyResponse.arrayBuffer()]);
    const artifact = JSON.parse(modelText);
    const taxonomyHash = await sha256Hex(taxonomyBytes);
    const validation = validateRecommenderArtifact(artifact, taxonomyHash);
    if (!validation.valid) throw new Error(validation.reason);
    if (manifest?.modelVersion !== artifact.modelVersion || manifest?.artifactLogicalHash !== artifact.artifactHash || await sha256Hex(modelText) !== manifest?.artifactFileHash) throw new Error("artifact-hash-mismatch");
    return {artifact, reason: null, loadMs: performance.now() - startedAt};
  } catch (error) {
    return {artifact: null, reason: error.message || "artifact-load-failed", loadMs: performance.now() - startedAt};
  }
}

export function getRequestedRecommenderPolicy() {
  if (document.documentElement.dataset.publicShowcase === "true") return RECOMMENDER_POLICIES.OFF;
  try {
    const loopback = ["127.0.0.1", "localhost", "::1"].includes(window.location.hostname);
    return loopback && new URLSearchParams(window.location.search).get("mlPolicy") === RECOMMENDER_POLICIES.SHADOW ? RECOMMENDER_POLICIES.SHADOW : RECOMMENDER_POLICIES.OFF;
  } catch {
    return RECOMMENDER_POLICIES.OFF;
  }
}

export function beginRecommenderCase(caseKey) {
  if (runtime.lastCaseKey == null) {
    runtime.lastCaseKey = caseKey;
    return;
  }
  if (caseKey !== runtime.lastCaseKey) {
    runtime.lastCaseKey = caseKey;
    if (runtime.pendingModel) {
      runtime.activeModel = runtime.pendingModel;
      runtime.pendingModel = null;
    }
  }
}

export function initializeRecommenderAfterFirstRender() {
  runtime.requestedPolicy = getRequestedRecommenderPolicy();
  if (runtime.requestedPolicy === RECOMMENDER_POLICIES.OFF || runtime.loadAttempted) return;
  runtime.loadAttempted = true;
  window.setTimeout(async () => {
    runtime.loadResult = await loadRecommenderArtifact();
    if (runtime.loadResult.artifact) runtime.pendingModel = runtime.loadResult.artifact;
  }, 0);
}

export function getRecommenderRuntimeSnapshot() {
  return {
    policy: runtime.requestedPolicy,
    activeModelVersion: runtime.activeModel?.modelVersion || null,
    pendingModelVersion: runtime.pendingModel?.modelVersion || null,
    loadResult: runtime.loadResult ? {reason: runtime.loadResult.reason, loadMs: runtime.loadResult.loadMs} : null,
    audits: runtime.audits.map((audit) => ({...audit, candidates: audit.candidates?.map((candidate) => ({...candidate}))})),
  };
}
