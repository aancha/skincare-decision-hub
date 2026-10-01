import {
  ACTIVE_LED_CONCERNS,
  BARRIER_FIRST_CONCERNS,
  BARRIER_SUPPORT_INGREDIENTS,
  CONCERN_STRATEGIES,
  EXFOLIATING_ACIDS,
  SKIN_PROFILES,
  STRONG_ACTIVE_INGREDIENTS,
} from "./guardrails.js";


export const RECOMMENDER_V2_FEATURE_SCHEMA_VERSION = 2;
export const RECOMMENDER_V2_MAX_TREES = 100;
export const RECOMMENDER_V2_MAX_TREE_NODES = 1500;
export const RECOMMENDER_V2_FEATURE_ORDER = Object.freeze([
  "concern_direct_match",
  "explicit_ingredient_match",
  "strategic_ingredient_count",
  "profile_concern_match_count",
  "profile_ingredient_match_count",
  "barrier_support_count",
  "strong_active_count",
  "exfoliating_acid_count",
  "fragrance_free",
  "log_ingredient_count",
  "price",
  "log_price",
  "category_price_percentile",
  "budget_fit",
  "budget_mismatch",
  "rating",
  "log_review_count",
  "bayesian_rating",
  "rating_confidence",
  "value_rating_interaction",
  "value_review_interaction",
  "rating_provenance_depth",
  "review_provenance_depth",
  "ingredient_provenance_depth",
  "description_provenance_depth",
  "evidence_freshness",
  "availability_known",
  "ingredient_evidence_complete",
  "description_complete",
  "evidence_completeness",
  "source_depth",
  "multi_retailer",
  "price_missing",
  "rating_missing",
  "review_count_missing",
  "ingredients_missing",
  "description_missing",
  "provenance_missing",
  "freshness_missing",
  "availability_missing",
  "sensitivity_active_interaction",
  "sensitivity_barrier_interaction",
  "sensitivity_fragrance_free_interaction",
  "actives_comfort_active_interaction",
  "barrier_first_interaction",
  "active_led_strategic_interaction",
  "concern_evidence_interaction",
  "ingredient_evidence_interaction",
  "explicit_retailer_match",
  "evidence_uncertainty_count",
]);


function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}


function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}


function unique(values) {
  return [...new Set(values || [])];
}


function intersectionCount(values, references) {
  const referenceSet = references instanceof Set ? references : new Set(references || []);
  return [...values].filter((value) => referenceSet.has(value)).length;
}


function provenance(product, field) {
  const direct = product?.[`${field}Provenance`];
  if (direct && typeof direct === "object" && !Array.isArray(direct)) return direct;
  const nested = product?.provenance?.fields?.[field];
  return nested && typeof nested === "object" && !Array.isArray(nested) ? nested : {};
}


function isEmptyEvidenceValue(value) {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}


function provenanceDepth(value) {
  return Object.values(value || {}).filter((entry) => !isEmptyEvidenceValue(entry)).length;
}


function parseTimestamp(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const clean = value.trim();
  const hasOffset = /(?:Z|[+-]\d\d:\d\d)$/i.test(clean);
  const parsed = Date.parse(hasOffset ? clean : `${clean}Z`);
  return Number.isFinite(parsed) ? parsed : null;
}


function evidenceFreshness(product, referenceTime) {
  const reference = parseTimestamp(referenceTime);
  const timestamps = ["rating", "reviewCount", "ingredients", "description"]
    .map((field) => provenance(product, field))
    .map((value) => parseTimestamp(value.observedAt || value.fetchedAt))
    .filter((value) => value != null);
  if (reference == null || !timestamps.length) return null;
  const ageDays = Math.max(0, (reference - Math.max(...timestamps)) / 86400000);
  return Math.max(0, 1 - ageDays / 365);
}


function percentile(value, references) {
  if (value == null || !Array.isArray(references) || !references.length) return null;
  return references.filter((reference) => reference <= value).length / references.length;
}


function budgetValues(budget, pricePercentile) {
  if (pricePercentile == null) return [null, null];
  let fit;
  if (budget === "budget") fit = 1 - pricePercentile;
  else if (budget === "balanced") fit = 1 - Math.abs(pricePercentile - 0.5) * 2;
  else if (budget === "premium") fit = pricePercentile;
  else return [0, 0];
  const bounded = Math.min(1, Math.max(0, fit));
  return [bounded, 1 - bounded];
}


export function getRecommenderV2HardEligibilityReason(context, product) {
  const ingredients = new Set(product?.ingredients || []);
  const avoid = new Set(context?.avoidIngredients || []);
  const requiresIngredientEvidence = Boolean(
    avoid.size || context?.sensitivity === "high" || context?.activesComfort === "low"
  );
  if (requiresIngredientEvidence && !ingredients.size) return "unknown-ingredients";
  if ([...avoid].some((ingredient) => ingredients.has(ingredient))) return "avoid-list-match";
  const activeCount = intersectionCount(ingredients, STRONG_ACTIVE_INGREDIENTS);
  if (context?.sensitivity === "high" && activeCount > 1) return "high-sensitivity-active-load";
  if (context?.activesComfort === "low" && activeCount > 1) return "actives-comfort-load";
  return null;
}


export function buildRecommenderV2FeatureMap(context, product, artifact) {
  if (artifact?.featureConfig?.featureSchemaHash !== artifact?.featureSchemaHash) {
    throw new Error("feature-config-schema-mismatch");
  }
  const eligibilityReason = getRecommenderV2HardEligibilityReason(context, product);
  if (eligibilityReason) throw new Error(`hard-ineligible:${eligibilityReason}`);
  const category = normalize(product?.category);
  const contextCategory = normalize(context?.category);
  if (contextCategory && category !== contextCategory) throw new Error("role-incompatible-product");

  const concerns = new Set((product?.concerns || []).map(normalize).filter(Boolean));
  const ingredients = new Set((product?.ingredients || []).map(normalize).filter(Boolean));
  const contextConcern = normalize(context?.concern);
  const explicitIngredient = normalize(context?.ingredient);
  const strategic = new Set(
    (CONCERN_STRATEGIES[contextConcern]?.lookFor || []).map(normalize).filter(Boolean)
  );
  const profile = SKIN_PROFILES[String(context?.profile || "all")] || {};
  const profileConcerns = new Set((profile.concerns || []).map(normalize).filter(Boolean));
  const profileIngredients = new Set((profile.ingredients || []).map(normalize).filter(Boolean));
  const barrierCount = intersectionCount(ingredients, BARRIER_SUPPORT_INGREDIENTS);
  const activeCount = intersectionCount(ingredients, STRONG_ACTIVE_INGREDIENTS);
  const exfoliatingCount = intersectionCount(ingredients, EXFOLIATING_ACIDS);
  const fragranceFree = Number(ingredients.has("fragrance-free"));
  const strategicCount = intersectionCount(ingredients, strategic);
  const directConcernMatch = Number(Boolean(contextConcern && concerns.has(contextConcern)));
  const explicitIngredientMatch = Number(
    Boolean(explicitIngredient && ingredients.has(explicitIngredient))
  );
  const price = finiteNumber(product?.price);
  const logPrice = price != null && price >= 0 ? Math.log1p(price) : null;
  const rating = finiteNumber(product?.rating);
  const reviewCount = finiteNumber(product?.reviewCount);
  const logReviews = reviewCount != null && reviewCount >= 0 ? Math.log1p(reviewCount) : null;
  const references = artifact.featureConfig?.categoryPriceReferences?.[category] || [];
  const pricePercentile = percentile(price, references);
  const [budgetFit, budgetMismatch] = budgetValues(
    String(context?.budget || "any"), pricePercentile
  );
  const prior = Number(artifact.featureConfig?.ratingPrior || 0);
  const priorStrength = Number(artifact.featureConfig?.ratingPriorStrength || 25);
  let bayesianRating = null;
  let ratingConfidence = null;
  if (rating != null && reviewCount != null && reviewCount >= 0) {
    bayesianRating = (rating * reviewCount + prior * priorStrength) / (reviewCount + priorStrength);
    ratingConfidence = 1 - Math.exp(-reviewCount / 100);
  }
  const valueRating = bayesianRating != null && logPrice > 0 ? bayesianRating / logPrice : null;
  const valueReview = ratingConfidence != null && logPrice > 0 ? ratingConfidence / logPrice : null;

  const ratingProvenance = provenance(product, "rating");
  const reviewProvenance = provenance(product, "reviewCount");
  const ingredientProvenance = provenance(product, "ingredients");
  const descriptionProvenance = provenance(product, "description");
  const provenancePresent = [
    ratingProvenance,
    reviewProvenance,
    ingredientProvenance,
    descriptionProvenance,
  ].some((value) => Object.keys(value).length > 0);
  const freshness = evidenceFreshness(product, artifact.featureConfig?.referenceTime);
  const descriptionPresent = Boolean(String(product?.description || "").trim());
  const availabilityKnown = Boolean(
    product?.availabilityKnown ||
      (product && Object.prototype.hasOwnProperty.call(product, "availability") && product.availability != null) ||
      product?.availabilityState
  );
  const retailers = product?.retailers || (product?.retailer ? [product.retailer] : []);
  const offers = product?.offerIds || (product?.id ? [product.id] : []);
  const evidenceFlags = [
    price != null,
    rating != null,
    reviewCount != null,
    ingredients.size > 0,
    descriptionPresent,
    availabilityKnown,
  ];
  const evidenceCompleteness = evidenceFlags.filter(Boolean).length / evidenceFlags.length;
  const uncertaintyCount = evidenceFlags.filter((value) => !value).length;
  const sensitivityWeight = ({ low: 0, moderate: 0.5, high: 1 })[
    String(context?.sensitivity || "moderate")
  ] ?? 0.5;
  const activesWeight = ({ low: -1, medium: 0, high: 1 })[
    String(context?.activesComfort || "medium")
  ] ?? 0;
  const explicitRetailer = normalize(context?.retailer);
  const normalizedRetailers = new Set(retailers.map(normalize).filter(Boolean));

  const values = {
    concern_direct_match: directConcernMatch,
    explicit_ingredient_match: explicitIngredientMatch,
    strategic_ingredient_count: strategicCount,
    profile_concern_match_count: intersectionCount(concerns, profileConcerns),
    profile_ingredient_match_count: intersectionCount(ingredients, profileIngredients),
    barrier_support_count: barrierCount,
    strong_active_count: activeCount,
    exfoliating_acid_count: exfoliatingCount,
    fragrance_free: fragranceFree,
    log_ingredient_count: Math.log1p(ingredients.size),
    price,
    log_price: logPrice,
    category_price_percentile: pricePercentile,
    budget_fit: budgetFit,
    budget_mismatch: budgetMismatch,
    rating,
    log_review_count: logReviews,
    bayesian_rating: bayesianRating,
    rating_confidence: ratingConfidence,
    value_rating_interaction: valueRating,
    value_review_interaction: valueReview,
    rating_provenance_depth: provenanceDepth(ratingProvenance),
    review_provenance_depth: provenanceDepth(reviewProvenance),
    ingredient_provenance_depth: provenanceDepth(ingredientProvenance),
    description_provenance_depth: provenanceDepth(descriptionProvenance),
    evidence_freshness: freshness,
    availability_known: Number(availabilityKnown),
    ingredient_evidence_complete: Number(ingredients.size > 0),
    description_complete: Number(descriptionPresent),
    evidence_completeness: evidenceCompleteness,
    source_depth: unique(retailers).length + Math.log1p(unique(offers).length),
    multi_retailer: Number(unique(retailers).length > 1),
    price_missing: Number(price == null),
    rating_missing: Number(rating == null),
    review_count_missing: Number(reviewCount == null),
    ingredients_missing: Number(!ingredients.size),
    description_missing: Number(!descriptionPresent),
    provenance_missing: Number(!provenancePresent),
    freshness_missing: Number(freshness == null),
    availability_missing: Number(!availabilityKnown),
    sensitivity_active_interaction: sensitivityWeight * activeCount,
    sensitivity_barrier_interaction: sensitivityWeight * barrierCount,
    sensitivity_fragrance_free_interaction: sensitivityWeight * fragranceFree,
    actives_comfort_active_interaction: activesWeight * activeCount,
    barrier_first_interaction: Number(BARRIER_FIRST_CONCERNS.includes(contextConcern)) * barrierCount,
    active_led_strategic_interaction: Number(ACTIVE_LED_CONCERNS.includes(contextConcern)) * strategicCount,
    concern_evidence_interaction: directConcernMatch * evidenceCompleteness,
    ingredient_evidence_interaction: explicitIngredientMatch * Number(ingredients.size > 0),
    explicit_retailer_match: Number(
      Boolean(explicitRetailer && normalizedRetailers.has(explicitRetailer))
    ),
    evidence_uncertainty_count: uncertaintyCount,
  };
  if (Object.keys(values).some((name, index) => name !== RECOMMENDER_V2_FEATURE_ORDER[index])) {
    throw new Error("feature-order-drift");
  }
  Object.entries(values).forEach(([name, value]) => {
    if (value != null && (typeof value !== "number" || !Number.isFinite(value))) {
      throw new Error(`non-finite-feature:${name}`);
    }
  });
  return values;
}


function validNumberArray(values, length, { positive = false } = {}) {
  return Array.isArray(values) &&
    values.length === length &&
    values.every((value) => typeof value === "number" && Number.isFinite(value) && (!positive || value > 0));
}


function validTree(tree) {
  if (!tree || typeof tree !== "object" || Array.isArray(tree)) return false;
  const length = tree.values?.length;
  if (!Number.isInteger(length) || length < 1) return false;
  if (![tree.childrenLeft, tree.childrenRight, tree.features, tree.thresholds].every(
    (values) => Array.isArray(values) && values.length === length
  )) return false;
  if (!validNumberArray(tree.thresholds, length) || !validNumberArray(tree.values, length)) return false;
  for (let index = 0; index < length; index += 1) {
    const left = tree.childrenLeft[index];
    const right = tree.childrenRight[index];
    const feature = tree.features[index];
    if (![left, right, feature].every(Number.isInteger)) return false;
    const leaf = left === -1 && right === -1;
    if (!leaf && (left < 0 || right < 0 || left >= length || right >= length)) return false;
    if (!leaf && (feature < 0 || feature >= RECOMMENDER_V2_FEATURE_ORDER.length)) return false;
    if (leaf && feature !== -2) return false;
  }
  return true;
}


export function validateRecommenderV2Artifact(artifact, expectedTaxonomyHash = null) {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact)) {
    return { valid: false, reason: "malformed-artifact" };
  }
  if (
    artifact.schemaVersion !== 2 ||
    artifact.featureSchemaVersion !== RECOMMENDER_V2_FEATURE_SCHEMA_VERSION ||
    !["pairwise-logistic-l2", "pairwise-gradient-boosting"].includes(artifact.modelType)
  ) return { valid: false, reason: "unsupported-schema" };
  if (artifact.defaultPolicy !== "off") return { valid: false, reason: "default-policy-not-off" };
  if (expectedTaxonomyHash && artifact.taxonomyHash !== expectedTaxonomyHash) {
    return { valid: false, reason: "taxonomy-mismatch" };
  }
  if (
    !Array.isArray(artifact.featureOrder) ||
    artifact.featureOrder.length !== RECOMMENDER_V2_FEATURE_ORDER.length ||
    artifact.featureOrder.some((name, index) => name !== RECOMMENDER_V2_FEATURE_ORDER[index]) ||
    new Set(artifact.featureOrder).size !== artifact.featureOrder.length
  ) return { valid: false, reason: "feature-order-mismatch" };
  const preprocessing = artifact.preprocessing;
  if (
    !preprocessing ||
    !Array.isArray(preprocessing.featureOrder) ||
    preprocessing.featureOrder.length !== RECOMMENDER_V2_FEATURE_ORDER.length ||
    preprocessing.featureOrder.some((name, index) => name !== RECOMMENDER_V2_FEATURE_ORDER[index]) ||
    !validNumberArray(preprocessing.means, RECOMMENDER_V2_FEATURE_ORDER.length) ||
    !validNumberArray(preprocessing.scales, RECOMMENDER_V2_FEATURE_ORDER.length, { positive: true })
  ) return { valid: false, reason: "invalid-preprocessing" };
  if (!artifact.featureConfig || artifact.featureConfig.featureSchemaHash !== artifact.featureSchemaHash) {
    return { valid: false, reason: "feature-config-schema-mismatch" };
  }
  if (artifact.modelType === "pairwise-logistic-l2") {
    if (
      artifact.intercept !== 0 ||
      !validNumberArray(artifact.weights, RECOMMENDER_V2_FEATURE_ORDER.length)
    ) return { valid: false, reason: "invalid-linear-model" };
  } else {
    if (
      typeof artifact.initialScore !== "number" ||
      !Number.isFinite(artifact.initialScore) ||
      typeof artifact.learningRate !== "number" ||
      !Number.isFinite(artifact.learningRate) ||
      artifact.learningRate <= 0 ||
      !Array.isArray(artifact.trees) ||
      !artifact.trees.length ||
      artifact.trees.length > RECOMMENDER_V2_MAX_TREES ||
      artifact.trees.reduce((count, tree) => count + (tree.values?.length || 0), 0) > RECOMMENDER_V2_MAX_TREE_NODES ||
      artifact.trees.some((tree) => !validTree(tree))
    ) return { valid: false, reason: "invalid-tree-model" };
  }
  return { valid: true, reason: null };
}


export function vectorizeRecommenderV2(featureMap, artifact) {
  const validation = validateRecommenderV2Artifact(artifact);
  if (!validation.valid) throw new Error(validation.reason);
  return RECOMMENDER_V2_FEATURE_ORDER.map((name, index) => {
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


export function scoreRecommenderV2Vector(vector, artifact) {
  const validation = validateRecommenderV2Artifact(artifact);
  if (!validation.valid) throw new Error(validation.reason);
  if (!validNumberArray(vector, RECOMMENDER_V2_FEATURE_ORDER.length)) {
    throw new Error("invalid-feature-vector");
  }
  let score;
  if (artifact.modelType === "pairwise-logistic-l2") {
    score = vector.reduce((total, value, index) => total + value * artifact.weights[index], 0);
  } else {
    score = artifact.initialScore + artifact.learningRate * artifact.trees.reduce(
      (total, tree) => total + treeScore(tree, vector), 0
    );
  }
  if (!Number.isFinite(score)) throw new Error("non-finite-score");
  return score;
}


export function scoreRecommenderV2Product(context, product, artifact) {
  return scoreRecommenderV2Vector(
    vectorizeRecommenderV2(buildRecommenderV2FeatureMap(context, product, artifact), artifact),
    artifact
  );
}


export function scoreRecommenderV2Pair(leftVector, rightVector, artifact) {
  if (leftVector.length !== rightVector.length) throw new Error("pair-vector-length-mismatch");
  const difference = leftVector.map((value, index) => value - rightVector[index]);
  const inverse = difference.map((value) => -value);
  return (scoreRecommenderV2Vector(difference, artifact) - scoreRecommenderV2Vector(inverse, artifact)) / 2;
}


function sigmoid(value) {
  if (value >= 0) return 1 / (1 + Math.exp(-value));
  const expValue = Math.exp(value);
  return expValue / (1 + expValue);
}


export function rankRecommenderV2Candidates(context, products, artifact) {
  const rows = products.map((product) => ({
    candidateId: String(product.candidateId || product.id || ""),
    vector: vectorizeRecommenderV2(
      buildRecommenderV2FeatureMap(context, product, artifact), artifact
    ),
  }));
  if (rows.some((row) => !row.candidateId) || new Set(rows.map((row) => row.candidateId)).size !== rows.length) {
    throw new Error("invalid-candidate-identifiers");
  }
  const scores = new Map(rows.map((row) => [row.candidateId, 0]));
  if (artifact.modelType === "pairwise-logistic-l2") {
    rows.forEach((row) => scores.set(row.candidateId, scoreRecommenderV2Vector(row.vector, artifact)));
  } else {
    rows.forEach((left, leftIndex) => {
      rows.slice(leftIndex + 1).forEach((right) => {
        const probability = sigmoid(scoreRecommenderV2Pair(left.vector, right.vector, artifact));
        scores.set(left.candidateId, scores.get(left.candidateId) + probability);
        scores.set(right.candidateId, scores.get(right.candidateId) + 1 - probability);
      });
    });
  }
  return [...rows]
    .sort((left, right) => scores.get(right.candidateId) - scores.get(left.candidateId) || left.candidateId.localeCompare(right.candidateId))
    .map((row) => row.candidateId);
}


export function rankRecommenderV2Shadow(products, context, artifact) {
  const learnedOrder = rankRecommenderV2Candidates(context, products, artifact);
  return {
    products,
    audit: {
      policy: "shadow",
      modelVersion: artifact.modelVersion,
      learnedOrder,
      visibleOrderUnchanged: true,
      localOnly: true,
    },
  };
}
