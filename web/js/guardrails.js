// Shared skincare guardrail loading, taxonomy-derived helpers, and static shortlist guardrail evaluation.
// Browser-native ES module. Keep behavior changes in focused feature commits.
import { fetchJson } from "./api.js";
import {
  escapeHtml,
  formatList,
  getRoutineProductFamilyKey,
  isSensitiveSafeProduct,
  titleCase,
} from "./catalog.js";
import { getShortlistAiEligibleProducts } from "./shortlist.js";
import {
  SKINCARE_GUARDRAILS_STATIC_URL,
  avoidIngredients,
  routineTime,
  shortlistAiGuardrail,
  shortlistAiInput,
  state,
} from "./state.js";

export let skincareGuardrailsPayload = null;
export let ROUTINE_STEP_PRIORITY = { am: {}, pm: {} };
export let BARRIER_FIRST_CONCERNS = [];
export let ACTIVE_LED_CONCERNS = [];
export let INGREDIENT_RULES = {};
export let EQUIVALENT_INGREDIENT_GROUPS = {};
export let SKIN_PROFILES = {};
export let CONCERN_STRATEGIES = {};
export let STRONG_ACTIVE_INGREDIENTS = [];
export let EXFOLIATING_ACIDS = [];
export let BARRIER_SUPPORT_INGREDIENTS = [];
export let AVOID_INGREDIENT_OPTIONS = [];
export let SENSITIVE_SAFE_CATEGORIES = [];
export let HIGH_ACTIVES_CATEGORIES = [];

export function applySkincareGuardrails(payload) {
  skincareGuardrailsPayload = payload || {};
  const routine = skincareGuardrailsPayload.routine || {};
  INGREDIENT_RULES = { ...(skincareGuardrailsPayload.ingredientRules || {}) };
  EQUIVALENT_INGREDIENT_GROUPS = {
    ...(skincareGuardrailsPayload.equivalentIngredientGroups || {}),
  };
  SKIN_PROFILES = { ...(skincareGuardrailsPayload.skinProfiles || {}) };
  CONCERN_STRATEGIES = { ...(skincareGuardrailsPayload.concernStrategies || {}) };
  ROUTINE_STEP_PRIORITY = {
    am: { ...((routine.stepPriority || {}).am || {}) },
    pm: { ...((routine.stepPriority || {}).pm || {}) },
  };
  BARRIER_FIRST_CONCERNS = [...(routine.barrierFirstConcerns || [])];
  ACTIVE_LED_CONCERNS = [...(routine.activeLedConcerns || [])];
  STRONG_ACTIVE_INGREDIENTS = [...(routine.strongActiveIngredients || [])];
  EXFOLIATING_ACIDS = [...(routine.exfoliatingAcids || [])];
  BARRIER_SUPPORT_INGREDIENTS = [...(routine.barrierSupportIngredients || [])];
  AVOID_INGREDIENT_OPTIONS = [...(skincareGuardrailsPayload.avoidIngredientOptions || [])];
  SENSITIVE_SAFE_CATEGORIES = [...(routine.sensitiveSafeCategories || [])];
  HIGH_ACTIVES_CATEGORIES = [...(routine.highActivesCategories || [])];
}

export async function loadSkincareGuardrails() {
  try {
    applySkincareGuardrails(await fetchJson(SKINCARE_GUARDRAILS_STATIC_URL));
    return;
  } catch {
    // Fall back to the API path when the UI origin cannot serve the shared file directly.
  }
  applySkincareGuardrails(await fetchJson("/api/guardrails"));
}

export function isSunProtectionProduct(product) {
  if (!product) return false;
  if (String(product.category || "").toLowerCase() === "sunscreen") return true;
  const primaryText = [product.name, product.brand, product.url]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\bspf(?:\s*\d+\+?)?\b|\bsunscreen\b|\bsun protection\b|\buv defense\b/.test(primaryText);
}

export function getIngredientInsight(product) {
  const heroIngredients = product.ingredients
    .filter((ingredient) => ingredient !== "spf" || isSunProtectionProduct(product))
    .slice(0, 3)
    .map((ingredient) => titleCase(ingredient));
  const cautions = [];

  if (product.ingredients.includes("retinol")) cautions.push("Introduce slowly");
  if (product.ingredients.includes("glycolic acid") || product.ingredients.includes("lactic acid")) cautions.push("Avoid over-exfoliating");
  if (product.ingredients.includes("salicylic acid")) cautions.push("Best when pores or breakouts are the goal");
  if (isSunProtectionProduct(product)) cautions.push("Use as the final AM step");
  if (product.ingredients.includes("ceramides") || product.ingredients.includes("fragrance-free")) cautions.push("Leans barrier-friendly");

  return {
    heroIngredients,
    caution: cautions[0] || "Useful in a focused routine",
  };
}

export function renderIngredientInsightMarkup(product, compact = false) {
  const insight = getIngredientInsight(product);
  if (!insight.heroIngredients.length && !insight.caution) return "";
  return `
    <div class="ingredient-insight${compact ? " compact" : ""}">
      <div class="ingredient-head">
        <span>Ingredient lens</span>
        <strong>${insight.heroIngredients.length ? insight.heroIngredients.join(" + ") : "Core support"}</strong>
      </div>
      <p>${insight.caution}</p>
    </div>
  `;
}

export function getProfileWarnings() {
  const warnings = [];
  if (state.profile === "dry-sensitive") warnings.push("Keep exfoliants and retinoids slow if skin is reactive.");
  if (state.profile === "oily-acne") warnings.push("Avoid stacking too many strong actives in one routine.");
  if (state.profile === "mature-dehydrated") warnings.push("Hydration and barrier support usually need to stay in the routine.");
  if (state.userProfile.sensitivity === "high") warnings.push("High sensitivity is active, so stronger actives are being down-ranked.");
  if (state.userProfile.activesComfort === "low") warnings.push("Gentler, fewer-treatment routines are being prioritized.");
  if (state.userProfile.avoidIngredients.length) {
    warnings.push(`Avoiding ${formatList(state.userProfile.avoidIngredients.map((ingredient) => titleCase(ingredient)), 2)} in recommendations.`);
  }
  return warnings;
}

export function getProductConflictWarnings(product, context = {}) {
  const warnings = [];
  const avoidMatches = product.ingredients.filter((ingredient) => state.userProfile.avoidIngredients.includes(ingredient));
  const strongMatches = product.ingredients.filter((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient));
  const selectedIngredients = (context.selectedProducts || []).flatMap((entry) => entry.ingredients);
  const hasExfoliatingAcid = product.ingredients.some((ingredient) => EXFOLIATING_ACIDS.includes(ingredient));
  const hasBenzoylPeroxide = product.ingredients.includes("benzoyl peroxide");
  const hasAzelaicAcid = product.ingredients.includes("azelaic acid");
  const hasVitaminC = product.ingredients.includes("vitamin c");
  const selectedHasExfoliatingAcid = selectedIngredients.some((ingredient) => EXFOLIATING_ACIDS.includes(ingredient));
  const selectedHasRetinol = selectedIngredients.includes("retinol");
  const selectedHasBenzoylPeroxide = selectedIngredients.includes("benzoyl peroxide");
  const selectedHasVitaminC = selectedIngredients.includes("vitamin c");

  if (avoidMatches.length) {
    warnings.push(`Matches your avoid list: ${formatList(avoidMatches.map((ingredient) => titleCase(ingredient)), 2)}.`);
  }
  if (state.userProfile.sensitivity === "high" && strongMatches.length) {
    warnings.push(`Contains stronger actives for a high-sensitivity plan: ${formatList(strongMatches.map((ingredient) => titleCase(ingredient)), 2)}.`);
  }
  if (state.userProfile.activesComfort === "low" && strongMatches.length) {
    warnings.push("Leans stronger than your current actives comfort setting.");
  }
  if (context.routineTime === "am" && product.ingredients.includes("retinol")) {
    warnings.push("Retinol usually fits better in a PM routine.");
  }
  if (context.routineTime === "pm" && isSunProtectionProduct(product) && !Array.isArray(context.selectedProducts)) {
    warnings.push("SPF usually fits better in an AM routine.");
  }
  if (context.routineTime === "am" && hasExfoliatingAcid) {
    warnings.push("Exfoliating acids can be a stronger AM choice, especially if the rest of the routine is active-heavy.");
  }
  if (context.routineTime === "am" && hasBenzoylPeroxide) {
    warnings.push("Benzoyl peroxide can be a stronger AM choice if the rest of the routine is already treatment-heavy.");
  }
  if (context.routineTime === "am" && hasAzelaicAcid && (selectedHasExfoliatingAcid || selectedHasVitaminC || state.userProfile.sensitivity === "high")) {
    warnings.push("Azelaic acid can work in AM, but keep the rest of the morning routine calmer if skin is reactive.");
  }
  if (context.routineTime === "pm" && hasVitaminC && !hasExfoliatingAcid && !product.ingredients.includes("retinol")) {
    warnings.push("Vitamin C is often prioritized in AM routines, especially when brightening is the goal.");
  }
  if (hasExfoliatingAcid && selectedHasExfoliatingAcid) {
    warnings.push("Stacks exfoliating acids with another treatment already in this routine.");
  }
  if ((product.ingredients.includes("retinol") && selectedHasExfoliatingAcid) || (hasExfoliatingAcid && selectedHasRetinol)) {
    warnings.push("Pairs retinol with exfoliating acids in the same routine.");
  }
  if ((hasBenzoylPeroxide && selectedHasRetinol) || (product.ingredients.includes("retinol") && selectedHasBenzoylPeroxide)) {
    warnings.push("Pairs benzoyl peroxide with retinol in the same routine.");
  }
  if ((hasBenzoylPeroxide && selectedHasExfoliatingAcid) || (hasExfoliatingAcid && selectedHasBenzoylPeroxide)) {
    warnings.push("Stacks benzoyl peroxide with exfoliating acids in the same routine.");
  }

  return [...new Set(warnings)].slice(0, 2);
}

export function getRoutineWarnings(products) {
  const allIngredients = products.flatMap((product) => product.ingredients);
  const warnings = [];
  const acidCount = allIngredients.filter((ingredient) => EXFOLIATING_ACIDS.includes(ingredient)).length;
  const hasRetinol = allIngredients.includes("retinol");
  const hasBenzoylPeroxide = allIngredients.includes("benzoyl peroxide");
  const hasAzelaicAcid = allIngredients.includes("azelaic acid");
  const hasVitaminC = allIngredients.includes("vitamin c");
  const hasSunProtectionProduct = products.some((product) => isSunProtectionProduct(product));
  const treatmentCount = products.filter((product) => ["serum", "toner", "treatment"].includes(product.category)).length;
  const activeLedProducts = products.filter(
    (product) =>
      ["serum", "toner", "treatment"].includes(product.category) ||
      product.ingredients.some((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)),
  );
  const familyCounts = products.reduce((counts, product) => {
    const key = getRoutineProductFamilyKey(product);
    if (!key) return counts;
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
  const avoidMatches = [...new Set(allIngredients.filter((ingredient) => state.userProfile.avoidIngredients.includes(ingredient)))];

  if (acidCount >= 2) {
    warnings.push("This routine stacks multiple exfoliating acids. Start slower if skin is sensitive.");
  }
  if (acidCount >= 1 && hasRetinol) {
    warnings.push("Retinol plus acids can feel aggressive together. Alternate if irritation shows up.");
  }
  if (treatmentCount >= 2 && (state.profile === "dry-sensitive" || state.userProfile.activesComfort === "low")) {
    warnings.push("This routine is treatment-heavy for the current sensitivity and actives settings.");
  }
  if (
    activeLedProducts.length >= 3 ||
    (activeLedProducts.length >= 2 &&
      (state.userProfile.sensitivity === "high" || state.userProfile.activesComfort === "low"))
  ) {
    warnings.push("This routine leans too heavily on treatment-style steps for a starter plan. Keep one main active and let the rest stay supportive.");
  }
  if (state.routineTime === "am" && hasRetinol) {
    warnings.push("This AM routine includes retinol. Consider moving that step to PM.");
  }
  if (state.routineTime === "pm" && hasSunProtectionProduct) {
    warnings.push("This PM routine includes SPF. That step is usually more useful in AM.");
  }
  if (state.routineTime === "am" && hasBenzoylPeroxide && (acidCount >= 1 || hasRetinol)) {
    warnings.push("This AM routine combines benzoyl peroxide with other strong actives. Consider simplifying the morning stack.");
  }
  if (state.routineTime === "am" && hasAzelaicAcid && state.userProfile.sensitivity === "high" && treatmentCount >= 2) {
    warnings.push("This AM routine includes azelaic acid in a treatment-heavy, high-sensitivity setup. A calmer morning routine may fit better.");
  }
  if (state.routineTime === "pm" && hasVitaminC && !hasRetinol) {
    warnings.push("This PM routine leans on vitamin C, which some people prefer to prioritize in AM.");
  }
  if (Object.values(familyCounts).some((count) => count >= 2)) {
    warnings.push("This routine repeats the same product family across multiple steps. Keep each step doing a clearer job.");
  }
  if (avoidMatches.length) {
    warnings.push(`The routine still includes ${formatList(avoidMatches.map((ingredient) => titleCase(ingredient)), 2)} from your avoid list.`);
  }
  warnings.push(...getProfileWarnings());
  warnings.push(
    ...products.flatMap((product, index) =>
      getProductConflictWarnings(product, {
        routineTime: state.routineTime,
        selectedProducts: products.slice(0, index),
      }),
    ),
  );
  return [...new Set(warnings)].slice(0, 3);
}

export function renderConflictMarkup(warnings, compact = false) {
  if (!warnings.length) return "";
  return `
    <div class="conflict-box${compact ? " compact" : ""}">
      <div class="conflict-head">
        <span>Conflict watch</span>
        <strong>${warnings[0]}</strong>
      </div>
      ${warnings[1] ? `<p>${warnings[1]}</p>` : ""}
    </div>
  `;
}

export function getSkincareGuardrailConfig() {
  return skincareGuardrailsPayload?.recommendationGuardrails || {};
}

export function getProductGuardrailSearchText(product) {
  return [product?.brand, product?.name, product?.category, product?.description, ...(product?.ingredients || []), ...(product?.concerns || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getProductGuardrailIngredients(product) {
  const explicit = (product?.ingredients || []).map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
  const searchText = getProductGuardrailSearchText(product);
  const inferred = Object.entries(INGREDIENT_RULES)
    .filter(([, keywords]) => (keywords || []).some((keyword) => searchText.includes(String(keyword || "").toLowerCase())))
    .map(([ingredient]) => ingredient);
  return [...new Set([...explicit, ...inferred])].sort();
}

export function assessProductGuardrails(product) {
  const ingredients = getProductGuardrailIngredients(product);
  const ingredientSet = new Set(ingredients);
  const strongActiveCount = ingredients.filter((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)).length;
  const barrierSupportCount = ingredients.filter((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient)).length;
  const category = String(product?.category || "").trim().toLowerCase();
  const fragranceFree = ingredientSet.has("fragrance-free");
  const sensitiveSafe =
    (fragranceFree && strongActiveCount <= 1) ||
    (barrierSupportCount >= 2 && strongActiveCount === 0) ||
    (SENSITIVE_SAFE_CATEGORIES.includes(category) &&
      barrierSupportCount >= 1 &&
      !HIGH_ACTIVES_CATEGORIES.includes(category) &&
      strongActiveCount === 0);
  const pregnancyCautionTags = (getSkincareGuardrailConfig().pregnancyIngredientRules || [])
    .filter((rule) => (rule.ingredientGroupsAny || []).some((groupName) => productMatchesGuardrailGroup(product, groupName)))
    .map((rule) => rule.tag);
  const tags = [];
  if (sensitiveSafe) tags.push("sensitive-safe");
  if (barrierSupportCount) tags.push("barrier-support");
  if (strongActiveCount >= 2) tags.push("high-irritation-active");
  else if (strongActiveCount === 1) tags.push("active-led");
  tags.push(...pregnancyCautionTags);
  return {
    ingredients,
    barrierSupportCount,
    strongActiveCount,
    sensitiveSafe,
    pregnancyCautionTags,
    tags,
  };
}

export function questionMatchesGuardrailRule(question, rule) {
  return (rule?.patterns || []).some((pattern) => {
    try {
      return new RegExp(pattern, "i").test(question);
    } catch {
      return false;
    }
  });
}

export function productMatchesGuardrailGroup(product, groupName) {
  const config = getSkincareGuardrailConfig();
  const groupValues = new Set(((config.ingredientGroups || {})[groupName] || []).map((value) => String(value || "").toLowerCase()));
  if (!groupValues.size) return false;
  const searchText = getProductGuardrailSearchText(product);
  const ingredients = getProductGuardrailIngredients(product);
  return [...groupValues].some((value) => ingredients.includes(value) || searchText.includes(value));
}

export function buildRoutineGuardrailWarningEntries(products, timing, avoidIngredients = []) {
  const normalizedProducts = (products || []).map((product) => ({
    ...product,
    ingredients: getProductGuardrailIngredients(product),
  }));
  const allIngredients = normalizedProducts.flatMap((product) => product.ingredients);
  const acidCount = allIngredients.filter((ingredient) => EXFOLIATING_ACIDS.includes(ingredient)).length;
  const treatmentCount = normalizedProducts.filter((product) => ["serum", "toner", "treatment"].includes(product.category)).length;
  const activeLedProducts = normalizedProducts.filter(
    (product) =>
      ["serum", "toner", "treatment"].includes(product.category) ||
      product.ingredients.some((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)),
  );
  const familyCounts = normalizedProducts.reduce((counts, product) => {
    const identityParts = [product.brand, product.name, product.category].map((value) => String(value || "").trim().toLowerCase());
    const identity = identityParts.some(Boolean) ? identityParts.join("|") : getRoutineProductFamilyKey(product);
    if (identity) counts[identity] = (counts[identity] || 0) + 1;
    return counts;
  }, {});
  const avoidSet = new Set((avoidIngredients || []).map((value) => String(value || "").trim().toLowerCase()).filter(Boolean));
  const avoidMatches = [...new Set(allIngredients.filter((ingredient) => avoidSet.has(ingredient)))].sort();
  const warnings = [];
  const add = (tag, message) => {
    if (!warnings.some((entry) => entry.tag === tag)) warnings.push({ tag, message });
  };
  const hasRetinol = allIngredients.includes("retinol");
  const hasBenzoylPeroxide = allIngredients.includes("benzoyl peroxide");
  const hasAzelaicAcid = allIngredients.includes("azelaic acid");
  const hasVitaminC = allIngredients.includes("vitamin c");
  if (acidCount >= 2) add("acid-stack", "This routine stacks multiple exfoliating acids. Start slower if skin is sensitive.");
  if (acidCount >= 1 && hasRetinol) add("retinol-acid-stack", "Retinol plus acids can feel aggressive together. Alternate if irritation shows up.");
  if (treatmentCount >= 2 && activeLedProducts.length >= 2) add("starter-plan-too-active", "This routine leans too heavily on treatment-style steps for a starter plan. Keep one main active and let the rest stay supportive.");
  if (timing === "am" && hasRetinol) add("retinol-am", "This AM routine includes retinol. Consider moving that step to PM.");
  if (timing === "pm" && allIngredients.includes("spf")) add("pm-spf", "This PM routine includes SPF. That step is usually more useful in AM.");
  if (timing === "am" && hasBenzoylPeroxide && (acidCount >= 1 || hasRetinol)) add("benzoyl-peroxide-stack", "This AM routine combines benzoyl peroxide with other strong actives. Consider simplifying the morning stack.");
  if (timing === "am" && hasAzelaicAcid && treatmentCount >= 2) add("azelaic-heavy-am", "This AM routine includes azelaic acid in a treatment-heavy setup. A calmer morning routine may fit better.");
  if (timing === "pm" && hasVitaminC && !hasRetinol) add("vitamin-c-pm", "This PM routine leans on vitamin C, which some people prefer to prioritize in AM.");
  if (Object.values(familyCounts).some((count) => count >= 2)) add("duplicate-product-family", "This routine repeats the same product family across multiple steps. Keep each step doing a clearer job.");
  if (avoidMatches.length) add("avoid-list-match", `The routine still includes ${formatList(avoidMatches.map((ingredient) => titleCase(ingredient)), 2)} from your avoid list.`);
  return warnings.slice(0, 3);
}

export function evaluateShortlistQuestionGuardrails(question, savedProducts = getShortlistAiEligibleProducts()) {
  const normalizedQuestion = String(question || "").trim().toLowerCase();
  const config = getSkincareGuardrailConfig();
  const matches = [];

  const addMatch = (rule, source) => {
    if (!rule?.tag || matches.some((entry) => entry.tag === rule.tag)) return;
    matches.push({
      id: rule.id,
      tag: rule.tag,
      severity: rule.severity || "warning",
      message: rule.message || "",
      source,
    });
  };

  let pregnancyRequested = false;
  (config.questionSignals || []).forEach((rule) => {
    if (questionMatchesGuardrailRule(normalizedQuestion, rule)) {
      addMatch(rule, "question");
      if (rule.id === "pregnancy-request") pregnancyRequested = true;
    }
  });

  if (pregnancyRequested) {
    (config.pregnancyIngredientRules || []).forEach((rule) => {
      const matched = (rule.ingredientGroupsAny || []).some((groupName) => savedProducts.some((product) => productMatchesGuardrailGroup(product, groupName)));
      if (matched) addMatch(rule, "product");
    });
  }

  const severityOrder = { none: 0, info: 1, warning: 2, redirect: 3 };
  const primary = matches.reduce((selected, entry) => {
    if (!selected) return entry;
    return severityOrder[entry.severity] >= severityOrder[selected.severity] ? entry : selected;
  }, null);

  return {
    hasGuardrail: matches.length > 0,
    severity: primary?.severity || "none",
    primaryTag: primary?.tag || null,
    primaryMessage: primary?.message || "",
    matches,
    tags: matches.map((entry) => entry.tag),
    pregnancyRequested,
  };
}

export function chooseConservativeShortlistProduct(savedProducts = getShortlistAiEligibleProducts()) {
  const ranked = savedProducts
    .map((product) => {
      const ingredients = product.ingredients || [];
      const barrierSupportCount = ingredients.filter((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient)).length;
      const strongActiveCount = ingredients.filter((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)).length;
      let score = 0;
      if (isSensitiveSafeProduct(product)) score += 10;
      score += barrierSupportCount * 2;
      score -= strongActiveCount * 4;
      if (["cleanser", "moisturizer", "sunscreen", "mask"].includes(product.category)) score += 1;
      if (typeof product.price === "number") score -= product.price / 200;
      return { score, product };
    })
    .sort((left, right) => right.score - left.score);
  return ranked[0]?.product || null;
}

export function renderShortlistAiGuardrailNote(question = shortlistAiInput?.value || "", savedProducts = getShortlistAiEligibleProducts()) {
  const evaluation = evaluateShortlistQuestionGuardrails(question, savedProducts);
  if (!shortlistAiGuardrail) return evaluation;
  shortlistAiGuardrail.hidden = !evaluation.hasGuardrail;
  shortlistAiGuardrail.dataset.severity = evaluation.severity || "none";
  if (!evaluation.hasGuardrail) {
    shortlistAiGuardrail.innerHTML = "";
    return evaluation;
  }
  const label = evaluation.severity === "redirect" ? "Medical caution" : evaluation.pregnancyRequested ? "Pregnancy caution" : "Expectation reset";
  shortlistAiGuardrail.innerHTML = `
    <strong>${escapeHtml(label)}</strong>
    <p>${escapeHtml(evaluation.primaryMessage)}</p>
  `;
  return evaluation;
}
