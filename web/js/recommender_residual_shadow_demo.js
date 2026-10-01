import {
  BARRIER_SUPPORT_INGREDIENTS,
  CONCERN_STRATEGIES,
  INGREDIENT_RULES,
  STRONG_ACTIVE_INGREDIENTS,
} from "./guardrails.js";
import { getRecommenderV2HardEligibilityReason } from "./recommender_v2.js";
import {
  RESIDUAL_EXPERIMENT_ID,
  loadResidualArtifact,
  rankResidualSlice,
} from "./recommender_residual_slice.js";


export const RESIDUAL_SHADOW_DEMO_BUNDLE_ID = "recommender-residual-slice-shadow-demo-v1";
export const RESIDUAL_SHADOW_DEMO_QUERY_NAME = "mlDemo";
export const RESIDUAL_SHADOW_DEMO_QUERY_VALUE = "1";
export const RESIDUAL_SHADOW_DEMO_MANIFEST_FILE_HASH = "410c1949c0780430d7a8086217ee7918509f16e9ce8ec8f1f45b10c4eb64c7f4";
export const RESIDUAL_SHADOW_DEMO_MODEL_FILE_HASH = "804c72af8f70d0fab73483a568aa0c352b7de05adc97f4a4bc8603928d9dda91";
export const RESIDUAL_SHADOW_DEMO_ARTIFACT_HASH = "ae7e3c96ff711b02ef23cc022cbc9567e9dd5acdeb9b4ba30b633554779dd555";
export const RESIDUAL_SHADOW_DEMO_SELECTION_FREEZE_HASH = "5470fee1e2725d3178be246d164cc6de96b82ce6d325291cdf987c0a3bf6b65e";
export const RESIDUAL_SHADOW_DEMO_EVALUATION_HASH = "a23365595691cfd99dc4adc6bbb88b96486986ad5381d970c452625e7e8ca1c1";
export const RESIDUAL_SHADOW_DEMO_TAXONOMY_HASH = "de4ffc0b26293fcc5dfd009c69c3e1a5fb5fcec43fb9cfd60fb13065a2c23134";

const DEFAULT_MODEL_URL = new URL("../recommender_residual_slice_model.json", import.meta.url);
const DEFAULT_MANIFEST_URL = new URL("../recommender_residual_slice_model.manifest.json", import.meta.url);
const DEFAULT_TAXONOMY_URL = new URL("../skincare_guardrails.json", import.meta.url);
const DEMO_ROOT_ID = "residual-shadow-demo";

const runtime = {
  requested: null,
  killed: false,
  loadPromise: null,
  bundle: null,
  loadReason: null,
  loadCount: 0,
  renderGeneration: 0,
  lastInput: null,
  lastResult: null,
};


function normalize(value) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}


function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}


function includesValue(collection, value) {
  return collection?.has ? collection.has(value) : (collection || []).includes(value);
}


function intersectionCount(values, collection) {
  return [...values].filter((value) => includesValue(collection, value)).length;
}


function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}


async function sha256Hex(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((entry) => entry.toString(16).padStart(2, "0")).join("");
}


export function isResidualShadowDemoRequested(locationLike = globalThis.location) {
  if (document.documentElement.dataset.publicShowcase === "true") return false;
  try {
    const parameters = new URLSearchParams(locationLike?.search || "");
    const values = parameters.getAll(RESIDUAL_SHADOW_DEMO_QUERY_NAME);
    return values.length === 1 && values[0] === RESIDUAL_SHADOW_DEMO_QUERY_VALUE;
  } catch {
    return false;
  }
}


export function validateResidualShadowDemoManifest(manifest, artifact) {
  const failedGates = [
    "groupedPairedBootstrapLowerBoundAboveZero",
    "ownerBestTopFiveCoverageAtLeastNinetyFivePercent",
    "pairwiseAccuracyImprovementAtLeastThreePoints",
    "repeatDirectionAgreementAtLeastNinetyPercent",
    "topChoiceAccuracyAtLeastStrongestDeterministic",
  ];
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return { valid: false, reason: "malformed-shadow-manifest" };
  if (manifest.schemaVersion !== 1 || manifest.bundleId !== RESIDUAL_SHADOW_DEMO_BUNDLE_ID) return { valid: false, reason: "unsupported-shadow-manifest" };
  if (manifest.deploymentMode !== "shadow-demo-only" || manifest.defaultPolicy !== "off") return { valid: false, reason: "invalid-shadow-policy" };
  if (manifest.experimentId !== RESIDUAL_EXPERIMENT_ID || manifest.experimentId !== artifact?.experimentId) return { valid: false, reason: "shadow-experiment-mismatch" };
  if (manifest.modelVersion !== artifact?.modelVersion) return { valid: false, reason: "shadow-model-version-mismatch" };
  if (manifest.artifactHash !== RESIDUAL_SHADOW_DEMO_ARTIFACT_HASH || manifest.artifactHash !== artifact?.artifactHash) return { valid: false, reason: "shadow-artifact-hash-mismatch" };
  if (manifest.artifactFileHash !== RESIDUAL_SHADOW_DEMO_MODEL_FILE_HASH) return { valid: false, reason: "shadow-artifact-file-hash-mismatch" };
  if (manifest.selectionFreezeHash !== RESIDUAL_SHADOW_DEMO_SELECTION_FREEZE_HASH) return { valid: false, reason: "shadow-selection-freeze-mismatch" };
  if (manifest.evaluationReportHash !== RESIDUAL_SHADOW_DEMO_EVALUATION_HASH) return { valid: false, reason: "shadow-evaluation-mismatch" };
  if (manifest.taxonomyHash !== RESIDUAL_SHADOW_DEMO_TAXONOMY_HASH || manifest.taxonomyHash !== artifact?.taxonomyHash) return { valid: false, reason: "shadow-taxonomy-mismatch" };
  if (manifest.featureSchemaHash !== artifact?.featureSchemaHash) return { valid: false, reason: "shadow-feature-schema-mismatch" };
  if (manifest.evaluationDecision !== "continue-research" || manifest.allPromotionGatesPassed !== false) return { valid: false, reason: "shadow-decision-mismatch" };
  if (stableJson(manifest.failedPromotionGates) !== stableJson(failedGates)) return { valid: false, reason: "shadow-failed-gates-mismatch" };
  if (stableJson(manifest.supportedSlice) !== stableJson(artifact?.supportedSlice)) return { valid: false, reason: "shadow-supported-slice-mismatch" };
  if (stableJson(manifest.runtimePolicy) !== stableJson(artifact?.runtimePolicy)) return { valid: false, reason: "shadow-runtime-policy-mismatch" };
  if (manifest.authoritativeOrder !== "deterministic" || manifest.mlMayChangeAuthoritativeOrder !== false) return { valid: false, reason: "shadow-authority-mismatch" };
  if (manifest.telemetry !== "none" || manifest.liveLearning !== false || manifest.preferenceEvidenceBundled !== false) return { valid: false, reason: "shadow-privacy-mismatch" };
  if (
    manifest.queryActivation?.name !== RESIDUAL_SHADOW_DEMO_QUERY_NAME ||
    manifest.queryActivation?.value !== RESIDUAL_SHADOW_DEMO_QUERY_VALUE ||
    manifest.queryActivation?.exactSingleValueRequired !== true ||
    manifest.queryActivation?.persisted !== false
  ) return { valid: false, reason: "shadow-activation-mismatch" };
  return { valid: true, reason: null };
}


export async function loadResidualShadowDemoBundle({
  modelUrl = DEFAULT_MODEL_URL,
  manifestUrl = DEFAULT_MANIFEST_URL,
  taxonomyUrl = DEFAULT_TAXONOMY_URL,
  expectedManifestFileHash = RESIDUAL_SHADOW_DEMO_MANIFEST_FILE_HASH,
} = {}) {
  if (expectedManifestFileHash !== RESIDUAL_SHADOW_DEMO_MANIFEST_FILE_HASH) {
    throw new Error("shadow-manifest-trust-root-mismatch");
  }
  const taxonomyResponse = await fetch(taxonomyUrl, { cache: "no-store" });
  if (!taxonomyResponse.ok) throw new Error("shadow-taxonomy-unavailable");
  const taxonomyHash = await sha256Hex(await taxonomyResponse.arrayBuffer());
  if (taxonomyHash !== RESIDUAL_SHADOW_DEMO_TAXONOMY_HASH) throw new Error("shadow-taxonomy-file-hash-mismatch");
  const loaded = await loadResidualArtifact(modelUrl, manifestUrl, {
    taxonomyHash,
    expectedManifestFileHash,
  });
  const validation = validateResidualShadowDemoManifest(loaded.manifest, loaded.artifact);
  if (!validation.valid) throw new Error(validation.reason);
  return loaded;
}


function normalizedRetailers(product) {
  return [...new Set([
    ...(Array.isArray(product?.retailers) ? product.retailers : []),
    ...(Array.isArray(product?.canonicalRetailers) ? product.canonicalRetailers : []),
    product?.retailer,
  ].map((value) => String(value || "").trim()).filter(Boolean))];
}


function normalizedOfferIds(product) {
  return [...new Set([
    ...(Array.isArray(product?.offerIds) ? product.offerIds : []),
    product?.id,
  ].map((value) => String(value || "").trim()).filter(Boolean))];
}


export function normalizeResidualShadowProduct(product) {
  return {
    ...product,
    candidateId: String(product?.candidateId || product?.id || ""),
    category: normalize(product?.category),
    concerns: (product?.concerns || []).map(normalize).filter(Boolean),
    ingredients: (product?.ingredients || []).map(normalize).filter(Boolean),
    description: String(product?.description || "").trim(),
    retailers: normalizedRetailers(product),
    offerIds: normalizedOfferIds(product),
  };
}


export function buildResidualShadowContext(catalogContext = {}, options = {}) {
  const selectedCategory = normalize(options.category);
  const selectedIngredient = normalize(options.ingredient);
  const contextType = selectedIngredient && selectedIngredient !== "all"
    ? "ingredient"
    : catalogContext.type === "concern" && (catalogContext.primaryConcern || catalogContext.concern)
      ? "concern"
      : "unsupported";
  const concern = normalize(catalogContext.primaryConcern || catalogContext.concern || catalogContext.goal || "general care");
  const unknownIngredient = contextType === "ingredient" && !Object.prototype.hasOwnProperty.call(INGREDIENT_RULES, selectedIngredient);
  return {
    contextType,
    category: selectedCategory === "all" ? "" : selectedCategory,
    concern: concern || "general care",
    ingredient: contextType === "ingredient" ? selectedIngredient : null,
    profile: normalize(catalogContext.profile || "all") || "all",
    budget: normalize(catalogContext.budget || "any") || "any",
    sensitivity: normalize(catalogContext.sensitivity || "moderate") || "moderate",
    activesComfort: normalize(catalogContext.activesComfort || "medium") || "medium",
    avoidIngredients: (catalogContext.avoidIngredients || []).map(normalize).filter(Boolean),
    retailer: options.retailer && options.retailer !== "all" ? String(options.retailer) : null,
    sort: normalize(options.sort || catalogContext.sort || "relevance") || "relevance",
    pregnancy: Boolean(catalogContext.pregnancy || catalogContext.pregnancyRequested),
    allergy: Boolean(catalogContext.allergy || catalogContext.allergyRequested),
    prescription: Boolean(catalogContext.prescription || catalogContext.prescriptionContext),
    medical: Boolean(catalogContext.medicalContext),
    redFlag: Boolean(catalogContext.redFlag || catalogContext.severeSymptoms || catalogContext.safetyBypassReason),
    safetyReview: Boolean(catalogContext.safetyReview),
    freeText: Boolean(catalogContext.unrestrictedFreeText || catalogContext.type === "search"),
    unknownRequiredIngredients: unknownIngredient,
  };
}


export function scoreResidualShadowDeterministicCandidate(product, context) {
  if (!product || product.category !== context.category) return Number.NEGATIVE_INFINITY;
  if (getRecommenderV2HardEligibilityReason(context, product)) return Number.NEGATIVE_INFINITY;
  const concerns = new Set(product.concerns || []);
  const ingredients = new Set(product.ingredients || []);
  const strategic = new Set((CONCERN_STRATEGIES[context.concern]?.lookFor || []).map(normalize));
  let score = 4;
  if (context.concern && concerns.has(context.concern)) score += 7;
  score += intersectionCount(ingredients, strategic) * 2.5;
  if (context.ingredient && ingredients.has(context.ingredient)) score += 6;
  const barrierCount = intersectionCount(ingredients, BARRIER_SUPPORT_INGREDIENTS);
  const activeCount = intersectionCount(ingredients, STRONG_ACTIVE_INGREDIENTS);
  if (context.sensitivity === "high") score += barrierCount * 1.5 - activeCount * 2;
  if (context.activesComfort === "low") score -= activeCount * 1.5;
  if (context.activesComfort === "high") score += activeCount * 0.75;
  const price = finiteNumber(product.price);
  if (price != null) {
    if (context.budget === "budget") score += price <= 30 ? 3 : price <= 50 ? 1 : -1;
    else if (context.budget === "balanced") score += price >= 20 && price <= 75 ? 2 : 0.5;
    else if (context.budget === "premium") score += price >= 60 ? 2 : 0.5;
  }
  if (ingredients.size) score += 0.5;
  if (product.description) score += 0.25;
  return score;
}


export function buildResidualShadowInput(products, catalogContext = {}, options = {}) {
  const deterministicProducts = (Array.isArray(products) ? products : []).slice(0, 5).map(normalizeResidualShadowProduct);
  const context = buildResidualShadowContext(catalogContext, options);
  const scores = deterministicProducts.map((product) => scoreResidualShadowDeterministicCandidate(product, context));
  const residualSignals = {};
  deterministicProducts.forEach((product, index) => {
    const score = scores[index];
    const nextScore = index + 1 < scores.length ? scores[index + 1] : score;
    residualSignals[product.candidateId] = {
      deterministicScore: Number.isFinite(score) ? score : 0,
      deterministicPosition: index + 1,
      deterministicScoreMargin: Number.isFinite(score) && Number.isFinite(nextScore) ? score - nextScore : 0,
      insideDeterministicTopFive: true,
    };
  });
  return {
    context,
    products: deterministicProducts,
    residualSignals,
    deterministicOrder: deterministicProducts.map((product) => product.candidateId),
  };
}


export function evaluateResidualShadowDemo(products, catalogContext, artifact, options = {}) {
  const input = buildResidualShadowInput(products, catalogContext, options);
  const result = rankResidualSlice(input.context, input.products, input.residualSignals, artifact, {
    enabled: true,
    killSwitch: Boolean(options.killSwitch),
  });
  return { ...input, result };
}


function humanizeReason(reason) {
  const labels = {
    "below-threshold": "confidence below the frozen threshold",
    "candidate-count-mismatch": "five eligible candidates are required",
    "candidate-identity-mismatch": "candidate identity validation failed",
    "hard-ineligible-product": "deterministic eligibility rejected a candidate",
    "insufficient-evidence": "ingredient or description evidence is insufficient",
    "invalid-residual-signal": "residual signal validation failed",
    "kill-switch": "the local demo kill switch is active",
    "no-order-change": "the bounded ML order matches deterministic order",
    "role-incompatible-product": "candidate roles are not comparable",
    "safety-or-unrestricted-context": "deterministic safety or unrestricted-search routing applies",
    "unsupported-context": "this context is outside the frozen slice",
    "unsupported-sort": "only relevance sorting is supported",
  };
  if (labels[reason]) return labels[reason];
  if (String(reason || "").startsWith("fail-closed:")) return "runtime validation failed closed";
  return reason ? String(reason).replace(/-/g, " ") : "the deterministic fallback remains active";
}


function productLabel(product) {
  const name = [product?.brand, product?.name].map((value) => String(value || "").trim()).filter(Boolean).join(" ");
  return name || String(product?.candidateId || "Unknown candidate");
}


function appendOrderList(container, title, order, productById, { fallback = false } = {}) {
  const section = document.createElement("section");
  section.className = "residual-shadow-order";
  const heading = document.createElement("h4");
  heading.textContent = title;
  section.appendChild(heading);
  const list = document.createElement("ol");
  if (fallback) list.dataset.fallback = "true";
  order.forEach((candidateId) => {
    const item = document.createElement("li");
    item.textContent = productLabel(productById.get(candidateId));
    list.appendChild(item);
  });
  section.appendChild(list);
  container.appendChild(section);
}


function removeDemoRoot() {
  document.querySelector(`#${DEMO_ROOT_ID}`)?.remove();
}


function createDemoRoot(host) {
  removeDemoRoot();
  if (!host?.parentNode) return null;
  const root = document.createElement("aside");
  root.id = DEMO_ROOT_ID;
  root.className = "residual-shadow-demo";
  root.setAttribute("aria-label", "Experimental ML comparison");
  root.setAttribute("aria-live", "polite");
  host.insertAdjacentElement("afterend", root);
  return root;
}


function renderPanel(host, input, result, { loading = false, loadReason = null } = {}) {
  const root = createDemoRoot(host);
  if (!root) return;
  const deterministicOrder = input.deterministicOrder;
  const productById = new Map(input.products.map((product) => [product.candidateId, product]));
  const reason = loadReason || result?.reason || (loading ? "validating-artifact" : "deterministic-fallback");
  root.dataset.reason = reason;
  root.dataset.controlled = String(Boolean(result?.controlled));
  root.dataset.loading = String(Boolean(loading));

  const header = document.createElement("div");
  header.className = "residual-shadow-head";
  const headingWrap = document.createElement("div");
  const badge = document.createElement("span");
  badge.className = "residual-shadow-badge";
  badge.textContent = "Experimental ML";
  const heading = document.createElement("h3");
  heading.textContent = "Deterministic vs. shadow ranking";
  headingWrap.append(badge, heading);
  const disableButton = document.createElement("button");
  disableButton.type = "button";
  disableButton.className = "residual-shadow-disable";
  disableButton.textContent = "Disable ML demo";
  disableButton.setAttribute("aria-label", "Disable the experimental ML comparison");
  disableButton.addEventListener("click", () => {
    runtime.killed = true;
    runtime.lastResult = { controlled: false, reason: "kill-switch", order: deterministicOrder };
    removeDemoRoot();
  });
  header.append(headingWrap, disableButton);
  root.appendChild(header);

  const disclosure = document.createElement("p");
  disclosure.className = "residual-shadow-disclosure";
  disclosure.textContent = "Research model—not production-validated. Your recommendations remain deterministically ranked.";
  root.appendChild(disclosure);

  const outcome = document.createElement("p");
  outcome.className = "residual-shadow-outcome";
  if (loading) {
    outcome.textContent = "Validating the frozen, hash-bound model. Deterministic ranking remains active.";
  } else if (result?.controlled) {
    const moved = result.order.filter((candidateId, index) => candidateId !== deterministicOrder[index]).length;
    const confidence = Number.isFinite(result.confidence)
      ? result.confidence === 0
        ? " · confidence signal: top pick unchanged"
        : ` · confidence margin ${result.confidence.toFixed(4)}`
      : "";
    outcome.textContent = `ML would move ${moved} of ${deterministicOrder.length} products${confidence}.`;
  } else {
    outcome.textContent = `Deterministic fallback: ${humanizeReason(reason)}.`;
  }
  root.appendChild(outcome);

  if (deterministicOrder.length) {
    const orders = document.createElement("div");
    orders.className = "residual-shadow-orders";
    appendOrderList(orders, "Deterministic top five", deterministicOrder, productById);
    if (!loading) {
      const shadowOrder = Array.isArray(result?.order) && result.order.length === deterministicOrder.length
        ? result.order
        : deterministicOrder;
      appendOrderList(
        orders,
        result?.controlled ? "Bounded shadow ML" : "Validated fallback order",
        shadowOrder,
        productById,
        { fallback: !result?.controlled },
      );
    }
    root.appendChild(orders);
  }

  const details = document.createElement("details");
  details.className = "residual-shadow-details";
  const summary = document.createElement("summary");
  summary.textContent = "How it works";
  const copy = document.createElement("p");
  copy.textContent = "Deterministic safety, eligibility, retrieval, and the visible order run first. The frozen model may compare only five already eligible products, cannot move one more than two positions, and falls back on any unsupported or invalid input. This model failed its promotion gates, so this view is demonstration-only.";
  details.append(summary, copy);
  root.appendChild(details);
}


function ensureBundle() {
  if (runtime.bundle) return Promise.resolve(runtime.bundle);
  if (runtime.loadPromise) return runtime.loadPromise;
  runtime.loadCount += 1;
  runtime.loadPromise = loadResidualShadowDemoBundle()
    .then((bundle) => {
      runtime.bundle = bundle;
      runtime.loadReason = null;
      return bundle;
    })
    .catch((error) => {
      runtime.loadReason = error?.message || "shadow-artifact-validation-failed";
      throw error;
    });
  return runtime.loadPromise;
}


export function clearResidualShadowDemo() {
  removeDemoRoot();
}


export function renderResidualShadowDemo({
  products = [],
  catalogContext = {},
  category = "all",
  ingredient = "all",
  retailer = "all",
  sort = "relevance",
  host = document.querySelector("#decision-strip"),
} = {}) {
  if (runtime.requested == null) runtime.requested = isResidualShadowDemoRequested();
  if (!runtime.requested || runtime.killed) {
    removeDemoRoot();
    return { requested: runtime.requested, killed: runtime.killed, rendered: false };
  }
  const input = buildResidualShadowInput(products, catalogContext, { category, ingredient, retailer, sort });
  runtime.lastInput = input;
  const generation = ++runtime.renderGeneration;
  renderPanel(host, input, null, { loading: true });
  void ensureBundle()
    .then(({ artifact }) => {
      if (runtime.killed || generation !== runtime.renderGeneration || runtime.lastInput !== input) return;
      const evaluated = evaluateResidualShadowDemo(products, catalogContext, artifact, { category, ingredient, retailer, sort });
      runtime.lastResult = evaluated.result;
      renderPanel(host, evaluated, evaluated.result);
    })
    .catch(() => {
      if (runtime.killed || generation !== runtime.renderGeneration || runtime.lastInput !== input) return;
      runtime.lastResult = { controlled: false, reason: runtime.loadReason, order: input.deterministicOrder };
      renderPanel(host, input, runtime.lastResult, { loadReason: runtime.loadReason });
    });
  return { requested: true, killed: false, rendered: true };
}


export function getResidualShadowDemoRuntimeSnapshot() {
  return {
    requested: runtime.requested == null ? isResidualShadowDemoRequested() : runtime.requested,
    killed: runtime.killed,
    loadAttempted: runtime.loadCount > 0,
    loadCount: runtime.loadCount,
    modelVersion: runtime.bundle?.artifact?.modelVersion || null,
    loadReason: runtime.loadReason,
    deterministicOrder: runtime.lastInput ? [...runtime.lastInput.deterministicOrder] : [],
    shadowOrder: runtime.lastResult?.order ? [...runtime.lastResult.order] : [],
    controlled: Boolean(runtime.lastResult?.controlled),
    reason: runtime.lastResult?.reason || null,
  };
}


export function resetResidualShadowDemoForTests() {
  runtime.requested = null;
  runtime.killed = false;
  runtime.loadPromise = null;
  runtime.bundle = null;
  runtime.loadReason = null;
  runtime.loadCount = 0;
  runtime.renderGeneration = 0;
  runtime.lastInput = null;
  runtime.lastResult = null;
  removeDemoRoot();
}
