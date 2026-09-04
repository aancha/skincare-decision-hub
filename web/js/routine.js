// Routine planner API/static fallback helpers, draft mutation, swap/remove handling, and rendering.
// Browser-native ES module. Keep behavior changes in focused feature commits.
import {
  buildApiHeaders,
  buildApiUrl,
  fetchJson,
  formatFreshness,
  jsonStringifySafe,
  postJson,
  refreshDataInPlace,
} from "./api.js";
import { ensureBasketPlan, getOutboundLabel, renderRoutineBasketPlannerMarkup } from "./cards.js";
import {
  addProductsToFavorites,
  enterWorkMode,
  escapeHtml,
  estimateRemainingCoreFloor,
  explainRoutineChoice,
  focusShellView,
  getProductById,
  getRoutineStepCandidates,
  getStrongActiveCount,
  money,
  persistRoutinePlannerSession,
  renderSavedPresets,
  setActiveSupportWorkspaceSection,
  titleCase,
} from "./catalog.js";
import {
  ACTIVE_LED_CONCERNS,
  BARRIER_FIRST_CONCERNS,
  ROUTINE_STEP_PRIORITY,
  SKIN_PROFILES,
  getProductConflictWarnings,
  getRoutineWarnings,
  isSunProtectionProduct,
  renderConflictMarkup,
} from "./guardrails.js";
import {
  getGroundedAiCitationLabels,
  getGroundedAiReadState,
  getGroundedAiStateBadge,
  isActionableShortlistProduct,
  isGroundedAiFallbackPayload,
  isTrackedAlertId,
  normalizeGroundedAiText,
  renderDecisionWorkspaceSummary,
  renderGroundedAiSourceNote,
  renderRoutineRationaleStructuredAnswerMarkup,
  renderTrackedAlertsPanel,
  setShortlistStatus,
} from "./shortlist.js";
import {
  ROUTINE_BUDGETS,
  ROUTINE_STEPS,
  avoidIngredients,
  routineBudget,
  routineBuilderPanel,
  routineConcern,
  routineDraftBrief,
  routineGrid,
  routineSummary,
  routineSwapBackdrop,
  routineSwapDrawer,
  routineTime,
  state,
} from "./state.js";

export let routineBriefHighlightTimer = null;
export let lastRoutineSwapTrigger = null;

export function normalizeSkinProfile(value) {
  return Object.prototype.hasOwnProperty.call(SKIN_PROFILES, value) ? value : "all";
}

export function getRoutinePlannerAvoidIngredients() {
  return [...new Set((state.userProfile.avoidIngredients || []).map((ingredient) => String(ingredient || "").trim()).filter(Boolean))].sort();
}

export function getRoutinePlannerContext() {
  return {
    concern: state.routineConcern,
    timing: state.routineTime,
    budgetLane: state.routineBudget,
    savedIds: [...state.favoriteIds],
    draftState: getSerializableRoutineDraftState(),
    profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
    sensitivity: state.userProfile.sensitivity || "moderate",
    activesComfort: state.userProfile.activesComfort || "medium",
    avoidIngredients: getRoutinePlannerAvoidIngredients(),
  };
}

export function getSerializableRoutineDraftState() {
  return Object.keys(state.routineDraft)
    .sort()
    .reduce((result, key) => {
      const draft = state.routineDraft[key];
      if (!draft) return result;
      const step = getRoutineStepFromDraftKey(key);
      const normalized = {
        locked: Boolean(draft.locked),
        removed: Boolean(draft.removed),
        candidateIndex: Math.max(0, draft.candidateIndex || 0),
        productId: isRoutineDraftProductValid(step, draft.productId) ? draft.productId : null,
      };
      if (
        !normalized.locked &&
        !normalized.removed &&
        normalized.candidateIndex === 0 &&
        !normalized.productId
      ) {
        return result;
      }
      result[key] = normalized;
      return result;
    }, {});
}

export function getRoutinePlannerContextKey(context = getRoutinePlannerContext()) {
  return JSON.stringify(context);
}

export function buildRoutinePlannerQuery(context, extra = {}) {
  const params = new URLSearchParams();
  params.set("concern", context.concern);
  params.set("timing", context.timing);
  params.set("budget", context.budgetLane);
  if (context.savedIds.length) {
    params.set("savedIds", context.savedIds.join(","));
  }
  if (Object.keys(context.draftState).length) {
    params.set("draftState", jsonStringifySafe(context.draftState));
  }
  if (context.profile) {
    params.set("profile", context.profile);
  }
  if (context.sensitivity) {
    params.set("sensitivity", context.sensitivity);
  }
  if (context.activesComfort) {
    params.set("activesComfort", context.activesComfort);
  }
  if (context.avoidIngredients.length) {
    params.set("avoidIngredients", context.avoidIngredients.join(","));
  }
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, value);
    }
  });
  return params.toString();
}

export async function fetchRoutinePlannerPlan(force = false, options = {}) {
  if (!state.live.apiBacked) return null;
  const preserveExistingPlan = Boolean(options.preserveExistingPlan);
  const context = getRoutinePlannerContext();
  const contextKey = getRoutinePlannerContextKey(context);
  const hadPlanForContext = state.routinePlanner.contextKey === contextKey && Boolean(state.routinePlanner.plan);
  if (!force && state.routinePlanner.contextKey === contextKey && state.routinePlanner.plan) {
    return state.routinePlanner.plan;
  }
  if (state.routinePlanner.loading && state.routinePlanner.contextKey === contextKey) {
    return null;
  }
  state.routinePlanner.loading = true;
  state.routinePlanner.contextKey = contextKey;
  state.routinePlanner.planError = null;
  try {
    const payload = await fetchJson(`/api/routine-plan?${buildRoutinePlannerQuery(context)}`);
    if (state.routinePlanner.contextKey !== contextKey) return null;
    state.routinePlanner.plan = payload;
    state.routinePlanner.alternatives = {};
    state.routinePlanner.rationaleContextKey = null;
    state.routinePlanner.rationale = null;
    state.routinePlanner.rationaleLoading = false;
    state.routinePlanner.rationaleError = false;
    state.routinePlanner.planError = null;
    renderRoutineBuilder();
    return payload;
  } catch {
    if (state.routinePlanner.contextKey === contextKey) {
      if (preserveExistingPlan && hadPlanForContext) {
        state.routinePlanner.planError = null;
      } else {
        state.routinePlanner.plan = null;
        state.routinePlanner.planError = "request-failed";
      }
    }
    renderRoutineBuilder();
    return null;
  } finally {
    if (state.routinePlanner.contextKey === contextKey) {
      state.routinePlanner.loading = false;
    }
    renderRoutineBuilder();
  }
}

export async function ensureRoutinePlannerDraft(force = false) {
  if (!state.live.apiBacked || !state.continuity.token) return null;
  if (!force && state.routinePlanner.draftId) return state.routinePlanner.draftId;
  const payload = await postJson("/api/routine-drafts", {
    concern: state.routineConcern,
    timing: state.routineTime,
    budgetLane: state.routineBudget,
    savedIds: [...state.favoriteIds],
    draftState: getSerializableRoutineDraftState(),
    profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
    sensitivity: state.userProfile.sensitivity || "moderate",
    activesComfort: state.userProfile.activesComfort || "medium",
    avoidIngredients: getRoutinePlannerAvoidIngredients(),
  });
  state.routinePlanner.draftId = payload.id || null;
  state.routinePlanner.draftUpdatedAt = payload.updatedAt || payload.createdAt || null;
  state.routinePlanner.sessionUpdatedAt = state.routinePlanner.draftUpdatedAt;
  state.routinePlanner.draftSyncError = false;
  persistRoutinePlannerSession({ preserveUpdatedAt: true });
  return state.routinePlanner.draftId;
}

export async function syncRoutinePlannerDraft() {
  if (!state.live.apiBacked || !state.continuity.token) return null;
  if (state.routinePlanner.syncingDraft) return null;
  state.routinePlanner.syncingDraft = true;
  state.routinePlanner.draftSyncError = false;
  renderRoutineBuilder();
  try {
    const draftId = await ensureRoutinePlannerDraft();
    if (!draftId) return null;
    const payload = await fetch(buildApiUrl(`/api/routine-drafts/${draftId}`), {
      method: "PUT",
      headers: buildApiHeaders(`/api/routine-drafts/${draftId}`, { "Content-Type": "application/json" }),
      body: jsonStringifySafe({
        concern: state.routineConcern,
        timing: state.routineTime,
        budgetLane: state.routineBudget,
        savedIds: [...state.favoriteIds],
        draftState: getSerializableRoutineDraftState(),
        profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
        sensitivity: state.userProfile.sensitivity || "moderate",
        activesComfort: state.userProfile.activesComfort || "medium",
        avoidIngredients: getRoutinePlannerAvoidIngredients(),
      }),
    }).then((response) => {
      if (!response.ok) throw new Error("Routine draft update failed");
      return response.json();
    });
    state.routinePlanner.draftUpdatedAt = payload.updatedAt || state.routinePlanner.draftUpdatedAt;
    state.routinePlanner.sessionUpdatedAt = state.routinePlanner.draftUpdatedAt;
    persistRoutinePlannerSession({ preserveUpdatedAt: true });
    await fetchRoutinePlannerPlan(true);
    if (state.ui.openRoutineChooserStep) {
      const stepKey = state.ui.openRoutineChooserStep.split(":")[1];
      if (stepKey) {
        await fetchRoutinePlannerAlternatives(stepKey, true);
      }
    }
    return draftId;
  } catch {
    state.routinePlanner.draftSyncError = true;
    return null;
  } finally {
    state.routinePlanner.syncingDraft = false;
    renderRoutineBuilder();
  }
}

export function syncRoutinePlannerDraftSoon() {
  if (!state.live.apiBacked) return;
  queueMicrotask(() => {
    syncRoutinePlannerDraft();
  });
}

export async function fetchRoutinePlannerAlternatives(stepKey, force = false) {
  if (!state.live.apiBacked || !stepKey) return null;
  const context = getRoutinePlannerContext();
  const contextKey = getRoutinePlannerContextKey(context);
  if (state.routinePlanner.contextKey !== contextKey) {
    await fetchRoutinePlannerPlan(force);
  }
  const cacheKey = `${contextKey}:${stepKey}`;
  if (!force && state.routinePlanner.alternatives[cacheKey]) {
    return state.routinePlanner.alternatives[cacheKey];
  }
  if (state.routinePlanner.loadingAlternatives[cacheKey]) {
    return null;
  }
  state.routinePlanner.loadingAlternatives = {
    ...state.routinePlanner.loadingAlternatives,
    [cacheKey]: true,
  };
  renderRoutineBuilder();
  try {
    const payload = await fetchJson(
      `/api/routine-alternatives?${buildRoutinePlannerQuery(context, { step: stepKey })}`,
    );
    state.routinePlanner.alternatives = {
      ...state.routinePlanner.alternatives,
      [cacheKey]: payload,
    };
    renderRoutineBuilder();
    return payload;
  } catch {
    return null;
  } finally {
    const { [cacheKey]: _ignored, ...rest } = state.routinePlanner.loadingAlternatives;
    state.routinePlanner.loadingAlternatives = rest;
    renderRoutineBuilder();
  }
}

export function buildRoutineRationalePayload(question = "") {
  return {
    question: normalizeGroundedAiText(question),
    savedIds: [...new Set(state.favoriteIds.filter(Boolean))],
    routineDraftState: getSerializableRoutineDraftState(),
    signals: {
      goal: state.userProfile.goal || state.routineConcern,
      budget: state.userProfile.budget,
      routineBudget: state.routineBudget,
      routineTime: state.routineTime,
      profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
      sensitivity: state.userProfile.sensitivity,
      activesComfort: state.userProfile.activesComfort,
      avoidIngredients: getRoutinePlannerAvoidIngredients(),
    },
  };
}

export async function fetchRoutineRationale(force = false) {
  if (!state.live.apiBacked) return null;
  const context = getRoutinePlannerContext();
  const contextKey = getRoutinePlannerContextKey(context);
  const hasPlanForContext = state.routinePlanner.contextKey === contextKey && Boolean(state.routinePlanner.plan);
  if (!hasPlanForContext) return null;
  if (!force && state.routinePlanner.rationaleContextKey === contextKey && state.routinePlanner.rationale) {
    return state.routinePlanner.rationale;
  }
  if (state.routinePlanner.rationaleLoading && state.routinePlanner.rationaleContextKey === contextKey) {
    return null;
  }
  state.routinePlanner.rationaleLoading = true;
  state.routinePlanner.rationaleContextKey = contextKey;
  state.routinePlanner.rationaleError = false;
  renderRoutineBuilder();
  try {
    const payload = await postJson("/api/routine-rationale", buildRoutineRationalePayload());
    if (state.routinePlanner.rationaleContextKey !== contextKey) return null;
    state.routinePlanner.rationale = payload;
    state.routinePlanner.rationaleError = false;
    return payload;
  } catch {
    if (state.routinePlanner.rationaleContextKey === contextKey) {
      state.routinePlanner.rationale = null;
      state.routinePlanner.rationaleError = true;
    }
    return null;
  } finally {
    if (state.routinePlanner.rationaleContextKey === contextKey) {
      state.routinePlanner.rationaleLoading = false;
    }
    renderRoutineBuilder();
  }
}

export function buildLocalRoutineRationalePayload(summary, selectedEntries) {
  const selectedProducts = selectedEntries.map((entry) => entry.product).filter(Boolean);
  const citedProducts = selectedProducts.slice(0, 2);
  const primaryPressure =
    summary.warnings[0] ||
    summary.budgetGuidance ||
    summary.stepGuidance ||
    selectedProducts
      .flatMap((product) => getProductConflictWarnings(product, { routineTime: state.routineTime }))
      .find(Boolean) ||
    "The routine still needs enough restraint to stay repeatable.";
  let whyConservative = "This routine is keeping pressure moderate so the core steps stay realistic and repeatable.";
  if (summary.selectedCoreSteps < summary.coreSteps) {
    whyConservative = "This routine is staying conservative because it is still filling the core steps before adding more treatment pressure.";
  } else if (summary.optionalStepsDeferred) {
    whyConservative = "This routine is staying conservative by holding optional steps back until the core routine fits the current budget.";
  } else if (state.userProfile.sensitivity === "high" || state.userProfile.activesComfort === "low") {
    whyConservative = "This routine is staying conservative because your current skin lens biases toward calmer support before stronger actives.";
  } else if (selectedProducts.some((product) => getStrongActiveCount(product) > 1)) {
    whyConservative = "This routine stays conservative by limiting how many strong actives show up at once.";
  }

  let nextEdit = "Keep the routine steady for now, then change one step at a time if you still need more treatment pressure.";
  if (!summary.withinBudget) {
    nextEdit = "Swap the highest-spend optional step first, then re-check whether the core routine still fits the target.";
  } else if (summary.optionalStepsDeferred) {
    nextEdit = "Add one held-back optional step only after the core routine still fits your budget and skin tolerance.";
  } else if (state.userProfile.sensitivity === "high" || state.userProfile.activesComfort === "low") {
    nextEdit = "If you want more pressure later, add only one stronger treatment step and leave the rest of the routine supportive.";
  }

  return {
    ok: true,
    job: "routine_rationale",
    answerVersion: 1,
    source: "degraded",
    model: "local-fallback",
    fallback: true,
    degraded: true,
    answer: {
      lead: "Here is why this routine is staying conservative right now.",
      why_conservative: whyConservative,
      pressure_point: primaryPressure,
      next_edit: nextEdit,
      cited_product_ids: citedProducts.map((product) => product.id).filter(Boolean),
    },
    citations: citedProducts.map((product) => ({
      type: "product",
      id: product.id,
      label: `${product.brand} ${product.name}`,
    })),
  };
}

export function renderRoutineRationaleMarkup(plannerContextKey, summary, selectedEntries) {
  const livePayload =
    state.routinePlanner.rationaleContextKey === plannerContextKey ? state.routinePlanner.rationale : null;
  const loading =
    state.live.apiBacked &&
    state.routinePlanner.rationaleLoading &&
    state.routinePlanner.rationaleContextKey === plannerContextKey;
  const fallbackPayload = buildLocalRoutineRationalePayload(summary, selectedEntries);
  const payload = livePayload?.ok && livePayload.answer ? livePayload : fallbackPayload;
  const isFallback = isGroundedAiFallbackPayload(payload, payload.answer);
  const dataState = loading && !livePayload?.ok ? "loading" : getGroundedAiReadState(payload, payload.answer);
  const sourceNote = renderGroundedAiSourceNote("routine", payload, payload.answer, {
    fallback: isFallback,
    citationLabels: getGroundedAiCitationLabels(payload, fallbackPayload.citations.map((citation) => citation.label)),
  });

  if (loading && !livePayload?.ok) {
    return `
      <section class="routine-rationale grounded-ai-read" data-state="loading">
        <div class="grounded-ai-read-head">
          <span class="routine-rationale-kicker grounded-ai-kicker">Routine read</span>
          <span class="grounded-ai-state-badge">Thinking</span>
        </div>
        <p class="routine-rationale-answer-lead">Loading a grounded explanation for why this routine is staying conservative.</p>
      </section>
    `;
  }

  return `
    <section class="routine-rationale grounded-ai-read" data-state="${escapeHtml(dataState)}">
      <div class="grounded-ai-read-head">
        <span class="routine-rationale-kicker grounded-ai-kicker">Routine read</span>
        <span class="grounded-ai-state-badge">${escapeHtml(getGroundedAiStateBadge(payload, payload.answer))}</span>
      </div>
      <div class="routine-rationale-copy">
        ${renderRoutineRationaleStructuredAnswerMarkup(payload)}
      </div>
      <p class="routine-rationale-source"><small>${escapeHtml(sourceNote)}</small></p>
    </section>
  `;
}

export function getActiveRoutinePlannerPlan() {
  const context = getRoutinePlannerContext();
  const contextKey = getRoutinePlannerContextKey(context);
  if (state.live.apiBacked && state.routinePlanner.contextKey === contextKey && state.routinePlanner.plan) {
    return state.routinePlanner.plan;
  }
  return null;
}
export function getRoutineDraftKey(step) {
  return `${state.routineTime}:${step.key}`;
}

export function getRoutineStepFromDraftKey(key) {
  const [timing, stepKey] = String(key || "").split(":");
  if (!timing || !stepKey) return null;
  return (ROUTINE_STEPS[timing] || []).find((step) => step.key === stepKey) || null;
}

export function isRoutineProductValidForStep(step, product) {
  return Boolean(step && product && step.categories.includes(product.category));
}

export function isRoutineDraftProductValid(step, productId) {
  if (!step || !productId) return false;
  const product = getProductById(productId);
  return isRoutineProductValidForStep(step, product);
}

export function getRoutineStepDraft(step) {
  const draft = state.routineDraft[getRoutineDraftKey(step)];
  if (!draft) {
    return { locked: false, removed: false, candidateIndex: 0, productId: null };
  }
  return {
    locked: Boolean(draft.locked),
    removed: Boolean(draft.removed),
    candidateIndex: Math.max(0, draft.candidateIndex || 0),
    productId: isRoutineDraftProductValid(step, draft.productId) ? draft.productId : null,
  };
}

export function getRoutineStepPriority(step, product = null) {
  const priorityMap = ROUTINE_STEP_PRIORITY[state.routineTime] || {};
  const productCategory = product?.category || null;
  const baseCategory = productCategory || step.categories[0];
  let priority = priorityMap[baseCategory] === "optional" ? "optional" : "core";

  if (step.key === "treat") {
    if (state.routineTime === "pm" && BARRIER_FIRST_CONCERNS.includes(state.routineConcern)) {
      priority = "optional";
    } else if (state.routineTime === "am" && ACTIVE_LED_CONCERNS.includes(state.routineConcern)) {
      priority = "core";
    }
    if (productCategory === "toner" && BARRIER_FIRST_CONCERNS.includes(state.routineConcern)) {
      priority = "optional";
    }
  }

  if (step.key === "seal" && productCategory === "mask") {
    priority = "optional";
  }

  return priority;
}

export function setRoutineStepDraft(step, nextDraft, { persist = true } = {}) {
  const key = getRoutineDraftKey(step);
  const normalized = {
    locked: Boolean(nextDraft.locked),
    removed: Boolean(nextDraft.removed),
    candidateIndex: Math.max(0, nextDraft.candidateIndex || 0),
    productId: nextDraft.productId || null,
  };
  const nextState = { ...state.routineDraft };
  if (!normalized.locked && !normalized.removed && normalized.candidateIndex === 0 && !normalized.productId) {
    delete nextState[key];
  } else {
    nextState[key] = normalized;
  }
  state.routineDraft = nextState;
  if (persist) {
    state.routinePlanner.restoredDraft = false;
    state.routinePlanner.restoreError = false;
    persistRoutinePlannerSession();
  }
}

export function toggleRoutineStepLock(step) {
  const draft = getRoutineStepDraft(step);
  setRoutineStepDraft(step, {
    ...draft,
    locked: !draft.locked,
    removed: false,
  });
  renderRoutineBuilder();
  syncRoutinePlannerDraftSoon();
}

export function swapRoutineStep(step) {
  state.ui.openRoutineChooserStep = state.ui.openRoutineChooserStep === getRoutineDraftKey(step) ? null : getRoutineDraftKey(step);
  renderRoutineBuilder();
}

export function removeRoutineStep(step) {
  const draft = getRoutineStepDraft(step);
  setRoutineStepDraft(step, {
    ...draft,
    locked: false,
    removed: true,
  });
  renderRoutineBuilder();
  syncRoutinePlannerDraftSoon();
}

export function closeRoutineChooser() {
  const closedStepKey = state.ui.openRoutineChooserStep;
  const wasOpen = Boolean(closedStepKey);
  state.ui.openRoutineChooserStep = null;
  renderRoutineBuilder();
  if (wasOpen) {
    requestAnimationFrame(() => {
      const closedStep = getRoutineStepFromDraftKey(closedStepKey);
      const trigger =
        lastRoutineSwapTrigger?.isConnected
          ? lastRoutineSwapTrigger
          : routineGrid?.querySelector(`[data-routine-action="swap"][data-routine-step="${closedStep?.key || closedStepKey}"]`);
      trigger?.focus({ preventScroll: true });
      lastRoutineSwapTrigger = null;
    });
  }
  if (wasOpen && state.live.refreshQueuedForPlannerModal) {
    state.live.refreshQueuedForPlannerModal = false;
    refreshDataInPlace();
  }
}

export function restoreRoutineStep(step) {
  const draft = getRoutineStepDraft(step);
  setRoutineStepDraft(step, {
    ...draft,
    removed: false,
  });
  renderRoutineBuilder();
  syncRoutinePlannerDraftSoon();
}

export function chooseRoutineStepCandidate(step, productId) {
  const draft = getRoutineStepDraft(step);
  setRoutineStepDraft(step, {
    ...draft,
    locked: false,
    removed: false,
    candidateIndex: 0,
    productId,
  });
  closeRoutineChooser();
  syncRoutinePlannerDraftSoon();
}

export function handleRoutineAction(actionButton) {
  const step = ROUTINE_STEPS[state.routineTime].find((entry) => entry.key === actionButton.dataset.routineStep);
  if (!step) return;
  const action = actionButton.dataset.routineAction;
  if (action === "keep") {
    toggleRoutineStepLock(step);
    return;
  }
  if (action === "swap") {
    lastRoutineSwapTrigger = actionButton;
    swapRoutineStep(step);
    return;
  }
  if (action === "remove") {
    removeRoutineStep(step);
    return;
  }
  if (action === "restore") {
    restoreRoutineStep(step);
    return;
  }
  if (action === "choose") {
    chooseRoutineStepCandidate(step, actionButton.dataset.routineProductId);
    return;
  }
  if (action === "close-chooser") {
    closeRoutineChooser();
  }
}

export function getRoutinePlannerState(backendPlan) {
  if (!state.live.apiBacked) {
    return {
      tone: "fallback",
      label: "Using local planner right now",
      detail: "Routine suggestions are running in the browser.",
    };
  }
  if (backendPlan?.degraded) {
    return {
      tone: "warning",
      label: "Plan ready",
      detail: "Routine guidance is still available while live planner data catches up.",
    };
  }
  if (backendPlan) {
    return {
      tone: "good",
      label: "Plan ready",
      detail: "You can keep, swap, or remove steps below.",
    };
  }
  if (state.routinePlanner.restoringDraft) {
    return {
      tone: "working",
      label: "Building your routine...",
      detail: "Reopening your saved routine.",
    };
  }
  if (state.routinePlanner.syncingDraft) {
    return {
      tone: "working",
      label: "Updating your routine...",
      detail: "Saving your latest edits and refreshing the plan.",
    };
  }
  if (state.routinePlanner.loading && !backendPlan) {
    return {
      tone: "working",
      label: "Building your routine...",
      detail: "Finding the strongest setup for this routine.",
    };
  }
  if (state.routinePlanner.draftSyncError) {
    return {
      tone: "warning",
      label: "Using local planner right now",
      detail: "Your current routine is still here while live updates catch up.",
    };
  }
  if (state.routinePlanner.restoreError && !backendPlan) {
    return {
      tone: "warning",
      label: "Using local planner right now",
      detail: "Your saved routine could not be reopened, so the planner stayed local.",
    };
  }
  if (state.routinePlanner.planError && !backendPlan) {
    return {
      tone: "fallback",
      label: "Using local planner right now",
      detail: "The live planner is unavailable, so this routine is using local logic.",
    };
  }
  if (state.routinePlanner.restoredDraft) {
    return {
      tone: "good",
      label: "Plan ready",
      detail: state.routinePlanner.draftUpdatedAt
        ? `Continuing your saved routine from ${formatFreshness(state.routinePlanner.draftUpdatedAt).replace(/^Updated /, "")}.`
        : "Continuing your saved routine.",
    };
  }
  return {
    tone: "fallback",
    label: "Using local planner right now",
    detail: "Routine suggestions are running in the browser.",
  };
}

export function renderRoutinePlannerStateMarkup(plannerState) {
  return `
    <div class="routine-planner-state ${plannerState.tone}">
      <span class="routine-planner-state-label">${plannerState.label}</span>
      <p>${plannerState.detail}</p>
    </div>
  `;
}

export function getRoutineBudgetRailSignals(summary, budgetMode, selectedEntries) {
  const selectedProducts = selectedEntries.map((entry) => entry.product).filter(Boolean);
  const coreLeft = Math.max(0, (summary.coreSteps || 0) - (summary.selectedCoreSteps || 0));
  const activePressureCount = selectedProducts.filter(
    (product) =>
      ["serum", "toner", "treatment"].includes(product.category) ||
      getStrongActiveCount(product) >= 1,
  ).length;
  const tooManyActiveSteps =
    activePressureCount >= 3 ||
    (activePressureCount >= 2 &&
      (state.userProfile.sensitivity === "high" || state.userProfile.activesComfort === "low"));
  const missingSpf =
    state.routineTime === "am" &&
    summary.selectedSteps > 0 &&
    !selectedEntries.some((entry) => entry.step?.key === "protect" && isSunProtectionProduct(entry.product));
  const optionalHeld = Boolean(summary.optionalStepsDeferred);
  const alerts = [];

  if (!summary.withinBudget && budgetMode.cap != null) {
    alerts.push({ key: "over-budget", label: "Over target", tone: "warning" });
  }
  if (tooManyActiveSteps) {
    alerts.push({ key: "active-heavy", label: "Too many active steps", tone: "warning" });
  }
  if (missingSpf) {
    alerts.push({ key: "missing-spf", label: "Missing SPF", tone: "warning" });
  }
  if (coreLeft > 0) {
    alerts.push({ key: "incomplete", label: "Routine incomplete", tone: "caution" });
  }

  return {
    activePressureCount,
    alerts,
    coreLeft,
    missingSpf,
    optionalHeld,
    tooManyActiveSteps,
  };
}

export function getRoutineBudgetRailDecision(summary, budgetMode, signals) {
  if (!summary.withinBudget && budgetMode.cap != null) {
    return summary.budgetAssessment === "optional-first-cut"
      ? "Cut optional steps before changing the core routine."
      : "Swap one core step cheaper before saving this routine.";
  }
  if (signals.coreLeft > 1) {
    return `Fill ${signals.coreLeft} core steps before adding optional treatment.`;
  }
  if (signals.missingSpf) {
    return "Add AM protection before treating this routine as complete.";
  }
  if (signals.coreLeft > 0) {
    return "Fill 1 core step before adding optional treatment.";
  }
  if (signals.tooManyActiveSteps) {
    return "Keep one main active and let the rest stay supportive.";
  }
  if (summary.optionalStepsDeferred) {
    return "Optional treatment can wait until the core routine stays inside budget.";
  }
  return "Core steps are set; keep optional treatment deliberate.";
}

export function renderRoutineBudgetRailMarkup(summary, budgetMode, plannerState, plannerContextKey, selectedEntries) {
  const signals = getRoutineBudgetRailSignals(summary, budgetMode, selectedEntries);
  const hasBudgetCap = budgetMode.cap != null;
  const progressValue = hasBudgetCap
    ? Math.min(100, Math.max(0, Math.round((summary.total / Math.max(1, budgetMode.cap)) * 100)))
    : summary.total > 0
      ? 100
      : 0;
  const progressLabel = hasBudgetCap
    ? `${money(summary.total)} / ${money(budgetMode.cap)}`
    : `${money(summary.total)} used`;
  const progressMeta = hasBudgetCap
    ? `${progressValue}% of ${budgetMode.label.toLowerCase()}`
    : `${budgetMode.label}; no cap set`;
  const budgetState = hasBudgetCap ? (summary.withinBudget ? "good" : "warning") : "neutral";
  const statusChips = [
    {
      label: hasBudgetCap ? (summary.withinBudget ? "Within target" : "Over target") : "No cap",
      tone: hasBudgetCap ? (summary.withinBudget ? "good" : "warning") : "neutral",
    },
    {
      label: signals.coreLeft > 0 ? `${signals.coreLeft} core left` : "Core complete",
      tone: signals.coreLeft > 0 ? "caution" : "good",
    },
  ];
  if (signals.optionalHeld) {
    statusChips.push({
      label: summary.optionalStepsDeferred ? `${summary.optionalStepsDeferred} optional held` : "Optional held",
      tone: "neutral",
    });
  } else if (summary.optionalSteps) {
    statusChips.push({
      label: `${summary.optionalSteps} optional`,
      tone: "neutral",
    });
  }

  const proofItems = [
    renderRoutinePlannerStateMarkup(plannerState),
    summary.stepGuidance ? `<p class="routine-budget-guidance">${escapeHtml(summary.stepGuidance)}</p>` : "",
    summary.budgetGuidance ? `<p class="routine-budget-guidance">${escapeHtml(summary.budgetGuidance)}</p>` : "",
    summary.warnings.length
      ? `<div class="routine-warnings">${summary.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("")}</div>`
      : "",
    renderRoutineRationaleMarkup(plannerContextKey, summary, selectedEntries),
    renderRoutineBasketPlannerMarkup(selectedEntries),
  ].filter(Boolean);

  return `
    <article class="routine-summary-card routine-budget-rail" data-budget-state="${budgetState}">
      <header class="routine-budget-rail-head">
        <span class="routine-summary-label">Routine budget</span>
        <strong>${escapeHtml(progressLabel)}</strong>
        <p>${escapeHtml(progressMeta)}</p>
      </header>
      <div
        class="routine-budget-meter"
        role="progressbar"
        aria-label="Routine budget used"
        aria-valuemin="0"
        aria-valuemax="${hasBudgetCap ? Math.max(1, budgetMode.cap) : Math.max(1, summary.total)}"
        aria-valuenow="${Math.round(summary.total)}"
        style="--routine-budget-progress: ${progressValue}%"
      >
        <span class="routine-budget-meter-fill"></span>
      </div>
      <div class="routine-budget-chip-row">
        ${statusChips
          .map((chip) => `<span class="routine-budget-chip ${chip.tone}">${escapeHtml(chip.label)}</span>`)
          .join("")}
      </div>
      ${
        signals.alerts.length
          ? `<div class="routine-budget-alert-row">${signals.alerts
              .map((alert) => `<span class="routine-budget-alert ${alert.tone}">${escapeHtml(alert.label)}</span>`)
              .join("")}</div>`
          : ""
      }
      <p class="routine-budget-next">${escapeHtml(getRoutineBudgetRailDecision(summary, budgetMode, signals))}</p>
      ${
        proofItems.length
          ? `
            <details class="routine-budget-proof">
              <summary>Why this</summary>
              <div class="routine-budget-proof-body">
                ${proofItems.join("")}
              </div>
            </details>
          `
          : ""
      }
    </article>
  `;
}

export function renderRoutineSwapDrawer(step, chosen, options, meta = {}) {
  if (!routineSwapDrawer) return;
  if (routineSwapBackdrop) {
    routineSwapBackdrop.hidden = !step || !chosen;
  }
  if (!step || !chosen) {
    routineSwapDrawer.hidden = true;
    routineSwapDrawer.innerHTML = "";
    routineSwapDrawer.removeAttribute("role");
    routineSwapDrawer.removeAttribute("aria-modal");
    routineSwapDrawer.removeAttribute("aria-labelledby");
    routineSwapDrawer.removeAttribute("tabindex");
    delete routineSwapDrawer.dataset.openStep;
    return;
  }
  const previousOpenStep = routineSwapDrawer.dataset.openStep || "";
  routineSwapDrawer.dataset.openStep = step.key;
  const loading = Boolean(meta.loading);
  const normalizedOptions = options.map((option) => ({
    ...(option.product || option),
    fromSavedSet: Boolean(option.fromSavedSet || isActionableShortlistProduct(option.id || option.product?.id)),
  }));
  const savedOptions = normalizedOptions.filter((option) => option.fromSavedSet);
  const suggestedOptions = normalizedOptions.filter((option) => !option.fromSavedSet);
  const renderOptionList = (entries) =>
    entries
      .map(
        (option) => `
          <article class="routine-swap-item">
            <div class="routine-swap-copy">
              <strong>${escapeHtml(option.name)}</strong>
              <p>${escapeHtml(option.brand)} · ${escapeHtml(option.retailer)}</p>
              ${option.reason ? `<p class="routine-swap-reason">${escapeHtml(option.reason)}</p>` : ""}
              ${
                typeof option.rating === "number" && typeof option.reviewCount === "number"
                  ? `<span class="routine-swap-meta">${option.rating.toFixed(1)}★ synthetic fixture · ${option.reviewCount.toLocaleString()} synthetic fixture reviews</span>`
                  : `<span class="routine-swap-meta">${money(option.price)}</span>`
              }
              ${isActionableShortlistProduct(option.id) ? `<span class="routine-step-state shortlist">From your saved set</span>` : ""}
            </div>
            <button class="routine-action" type="button" data-routine-action="choose" data-routine-step="${escapeHtml(step.key)}" data-routine-product-id="${escapeHtml(option.id)}">Use this pick</button>
          </article>
        `,
      )
      .join("");
  routineSwapDrawer.hidden = false;
  routineSwapDrawer.setAttribute("role", "dialog");
  routineSwapDrawer.setAttribute("aria-modal", "true");
  routineSwapDrawer.setAttribute("aria-labelledby", "routine-swap-title");
  routineSwapDrawer.setAttribute("tabindex", "-1");
  routineSwapDrawer.innerHTML = `
    <div class="routine-swap-drawer-head">
      <div>
        <span class="routine-swap-drawer-kicker">Swap ${escapeHtml(step.label)}</span>
        <strong id="routine-swap-title">Choose a better fit for this step</strong>
      </div>
      <button class="routine-swap-close" type="button" data-routine-action="close-chooser">Close</button>
    </div>
    <div class="routine-swap-current">
      <span class="routine-step-state muted">Current pick</span>
      <strong>${escapeHtml(chosen.name)}</strong>
      <p>${escapeHtml(chosen.brand)} · ${escapeHtml(chosen.retailer)}</p>
      ${typeof chosen.rating === "number" && typeof chosen.reviewCount === "number" ? `<span class="routine-swap-meta">${chosen.rating.toFixed(1)}★ synthetic fixture · ${chosen.reviewCount.toLocaleString()} synthetic fixture reviews</span>` : ""}
    </div>
    ${
      loading && (savedOptions.length || suggestedOptions.length)
        ? `
          <div class="routine-swap-empty">
            <strong>Refreshing planner alternatives...</strong>
            <p>Showing local options while the backend planner refreshes this step.</p>
          </div>
        `
        : ""
    }
    ${
      savedOptions.length
        ? `
          <section class="routine-swap-group">
            <div class="routine-swap-group-head">
              <span class="routine-swap-group-label">From your saved set</span>
              <p>Use a product you already shortlisted for this step.</p>
            </div>
            <div class="routine-swap-list">
              ${renderOptionList(savedOptions)}
            </div>
          </section>
        `
        : ""
    }
    ${
      suggestedOptions.length
        ? `
          <section class="routine-swap-group">
            <div class="routine-swap-group-head">
              <span class="routine-swap-group-label">Other strong fits</span>
              <p>Alternative picks that still match this routine lane well.</p>
            </div>
            <div class="routine-swap-list">
              ${renderOptionList(suggestedOptions)}
            </div>
          </section>
        `
        : ""
    }
    ${
      loading && !savedOptions.length && !suggestedOptions.length
        ? `
          <div class="routine-swap-empty">
            <strong>Loading planner alternatives...</strong>
            <p>Pulling a fresher set of step swaps from the backend planner.</p>
          </div>
        `
        : ""
    }
    ${
      !loading && !savedOptions.length && !suggestedOptions.length
        ? `
          <div class="routine-swap-empty">
            <strong>No stronger swaps right now</strong>
            <p>This current pick is already one of the best matches for this step.</p>
          </div>
        `
      : ""
    }
  `;
  if (previousOpenStep !== step.key) {
    requestAnimationFrame(() => {
      routineSwapDrawer.querySelector(".routine-swap-close")?.focus({ preventScroll: true });
    });
  }
}

export function getRoutineSwapFocusableElements() {
  if (!routineSwapDrawer || routineSwapDrawer.hidden) return [];
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(routineSwapDrawer.querySelectorAll(focusableSelector)).filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hidden || element.closest("[hidden]")) return false;
    return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  });
}

export function trapRoutineSwapFocus(event) {
  if (!state.ui.openRoutineChooserStep || routineSwapDrawer?.hidden || event.key !== "Tab") return false;
  const focusable = getRoutineSwapFocusableElements();
  if (!focusable.length) {
    event.preventDefault();
    routineSwapDrawer?.focus({ preventScroll: true });
    return true;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!activeElement || !routineSwapDrawer?.contains(activeElement)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return true;
  }
  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    last.focus({ preventScroll: true });
    return true;
  }
  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return true;
  }
  return false;
}

export function positionRoutineSwapDrawer() {
  if (!routineSwapDrawer || routineSwapDrawer.hidden) return;
  routineSwapDrawer.style.removeProperty("left");
  routineSwapDrawer.style.removeProperty("top");
  routineSwapDrawer.style.removeProperty("width");
  routineSwapDrawer.dataset.placement = window.innerWidth <= 900 ? "sheet" : "modal";
}

export function buildRoutinePlanSummary({
  steps,
  selectedProducts,
  budgetMode,
  selectedCoreSteps,
  coreSteps,
  optionalSteps,
  optionalStepsDeferred,
  coreTotal,
}) {
  const total = selectedProducts.reduce((sum, product) => sum + (product.price || 0), 0);
  const withinBudget = budgetMode.cap == null || total <= budgetMode.cap;
  const warnings = getRoutineWarnings(selectedProducts);
  const keptSteps = steps.filter((step) => getRoutineStepDraft(step).locked).length;
  const removedSteps = steps.filter((step) => getRoutineStepDraft(step).removed).length;
  const savedSetSteps = selectedProducts.filter((product) => isActionableShortlistProduct(product.id)).length;
  let budgetGuidance = "";
  if (!withinBudget && budgetMode.cap != null) {
    budgetGuidance =
      coreTotal <= budgetMode.cap
        ? `Drop optional steps first: core steps are ${money(coreTotal)} and still fit the ${money(budgetMode.cap)} target.`
        : `Core steps alone are ${money(coreTotal)}, so this routine needs a stricter core swap to hit ${money(budgetMode.cap)}.`;
  }
  return {
    total,
    withinBudget,
    warnings,
    keptSteps,
    removedSteps,
    savedSetSteps,
    budgetGuidance,
    selectedSteps: selectedProducts.length,
    selectedCoreSteps,
    coreSteps,
    optionalSteps,
    optionalStepsDeferred,
    budgetAssessment: withinBudget ? "within_target" : coreTotal <= budgetMode.cap ? "optional-first-cut" : "core-needs-swap",
    stepGuidance: buildRoutineStepGuidance(selectedCoreSteps, coreSteps, optionalStepsDeferred),
  };
}

export function buildRoutineStepGuidance(selectedCoreSteps, coreSteps, optionalStepsDeferred) {
  if (selectedCoreSteps < coreSteps) {
    return "Fill the remaining core steps first. Optional steps stay secondary until the main routine is complete.";
  }
  if (optionalStepsDeferred) {
    return "Optional steps were held back to keep the core routine inside the current budget target.";
  }
  if (coreSteps) {
    return "Core steps come first. Add optional steps only if budget and skin tolerance still allow.";
  }
  return "";
}

export function buildRoutineBudgetGuidance(summary, budgetMode, coreTotal) {
  if (summary.withinBudget || budgetMode.cap == null) return "";
  if (summary.budgetAssessment === "optional-first-cut") {
    return `Drop optional steps first: core steps are ${money(coreTotal)} and still fit the ${money(budgetMode.cap)} target.`;
  }
  return `Core steps alone are ${money(coreTotal)}, so this routine needs a stricter core swap to hit ${money(budgetMode.cap)}.`;
}

export function getRoutineDraftStatus(summary) {
  if (!summary.withinBudget) {
    return summary.keptSteps ? "Needs one cheaper swap" : "Needs a leaner draft";
  }
  if (summary.savedSetSteps) {
    return "Draft includes saved picks";
  }
  if (summary.selectedCoreSteps === summary.coreSteps) {
    return "Core routine ready";
  }
  return "Draft ready to shape";
}

export function renderRoutineDraftBrief(summary, budgetMode) {
  if (!routineDraftBrief) return;
  const concernLabel = state.routineConcern === "all" ? "All concerns" : titleCase(state.routineConcern);
  const timingLabel = state.routineTime === "am" ? "AM routine" : "PM routine";
  const draftStatus = getRoutineDraftStatus(summary);
  const plannerState = getRoutinePlannerState(state.routinePlanner.plan);
  routineDraftBrief.hidden = false;
  routineDraftBrief.innerHTML = `
    <article class="routine-draft-card">
      <div class="routine-draft-copy">
        <span class="routine-draft-kicker">Routine draft</span>
        <div class="routine-draft-title-row">
          <strong>${escapeHtml(timingLabel)} · ${escapeHtml(concernLabel)}</strong>
          <span class="routine-draft-status${summary.withinBudget ? " good" : ""}">${draftStatus}</span>
        </div>
        <p>${summary.selectedSteps} steps · ${money(summary.total)} total${budgetMode.cap != null ? ` · target ${money(budgetMode.cap)}` : ""}</p>
        <div class="routine-draft-meta">
          <span>${summary.selectedCoreSteps}/${summary.coreSteps} core</span>
          ${summary.optionalSteps ? `<span>${summary.optionalSteps} optional</span>` : ""}
          ${summary.optionalStepsDeferred ? `<span>${summary.optionalStepsDeferred} optional held back</span>` : ""}
          ${summary.keptSteps ? `<span>${summary.keptSteps} kept</span>` : ""}
          ${summary.savedSetSteps ? `<span>${summary.savedSetSteps} from saved set</span>` : ""}
        </div>
        ${summary.stepGuidance ? `<p class="routine-budget-guidance">${escapeHtml(summary.stepGuidance)}</p>` : ""}
        ${renderRoutinePlannerStateMarkup(plannerState)}
      </div>
      <div class="routine-draft-actions">
        <button class="routine-draft-button" type="button" data-routine-brief-action="open">${summary.keptSteps || summary.savedSetSteps ? "Continue planning" : "Review steps"}</button>
        ${summary.removedSteps ? `<p>${summary.removedSteps} step${summary.removedSteps === 1 ? "" : "s"} removed. Rebuild the draft below.</p>` : `<p>Use the planner below to keep, swap, or remove steps.</p>`}
      </div>
    </article>
  `;
}

export function focusRoutineBuilder() {
  if (!routineBuilderPanel) return;
  enterWorkMode("workspace");
  setActiveSupportWorkspaceSection("routine-builder-panel");
  routineBuilderPanel.classList.add("is-highlighted");
  window.clearTimeout(routineBriefHighlightTimer);
  routineBriefHighlightTimer = window.setTimeout(() => {
    routineBuilderPanel.classList.remove("is-highlighted");
  }, 1600);
  focusShellView("workspace");
}

export function getLeadRoutineStep(product) {
  if (!product) return null;
  return (ROUTINE_STEPS[state.routineTime] || []).find((step) => isRoutineProductValidForStep(step, product)) || null;
}

export function planAroundProduct(productId) {
  const product = getProductById(productId);
  const step = getLeadRoutineStep(product);
  if (!product || !step) {
    return false;
  }
  if (!state.favoriteIds.includes(productId)) {
    addProductsToFavorites([productId]);
  }
  const status = getRoutineStepPriority(step, product) === "core" ? "core" : "optional";
  setShortlistStatus(productId, status);
  const draft = getRoutineStepDraft(step);
  setRoutineStepDraft(step, {
    ...draft,
    locked: false,
    removed: false,
    candidateIndex: 0,
    productId,
  });
  renderRoutineBuilder();
  focusRoutineBuilder();
  return true;
}

export function renderRoutineBuilder({ force = false } = {}) {
  if (!force && !(state.ui.activeShellView === "workspace" && state.ui.activeWorkspaceTab === "routine-builder-panel")) {
    return;
  }
  if (routineConcern) routineConcern.value = state.routineConcern;
  if (routineTime) routineTime.value = state.routineTime;
  if (routineBudget) routineBudget.value = state.routineBudget;
  const plannerContext = getRoutinePlannerContext();
  const plannerContextKey = getRoutinePlannerContextKey(plannerContext);
  const backendPlan =
    state.live.apiBacked && state.routinePlanner.contextKey === plannerContextKey
      ? state.routinePlanner.plan
      : null;
  if (
    state.live.apiBacked &&
    !backendPlan &&
    !state.routinePlanner.loading &&
    (!state.routinePlanner.planError || state.routinePlanner.contextKey !== plannerContextKey)
  ) {
    fetchRoutinePlannerPlan();
  }
  if (
    state.live.apiBacked &&
    backendPlan &&
    state.routinePlanner.rationaleContextKey !== plannerContextKey &&
    !state.routinePlanner.rationaleLoading
  ) {
    queueMicrotask(() => {
      void fetchRoutineRationale();
    });
  }
  renderSavedPresets();
  const steps = ROUTINE_STEPS[state.routineTime];
  const usedIds = new Set();
  const selectedProducts = [];
  const selectedEntries = [];
  const budgetMode = ROUTINE_BUDGETS[state.routineBudget] || ROUTINE_BUDGETS.smart;
  const coreSteps = steps.filter((step) => getRoutineStepPriority(step) === "core").length;
  let drawerStep = null;
  let drawerChosen = null;
  let drawerOptions = [];
  let selectedCoreSteps = 0;
  let optionalSteps = 0;
  let optionalStepsDeferred = 0;
  let coreTotal = 0;
  let optionalTotal = 0;

  routineGrid.innerHTML = "";
  steps.forEach((step, index) => {
    const backendStep = backendPlan?.steps?.find((entry) => entry.step?.key === step.key) || null;
    const draft = getRoutineStepDraft(step);
    const spent = selectedProducts.reduce((sum, product) => sum + (product.price || 0), 0);
    const remainingCap = budgetMode.cap != null ? Math.max(0, budgetMode.cap - spent) : null;
    const remainingSteps = Math.max(1, steps.length - index);
    const softCap = remainingCap != null ? remainingCap / remainingSteps : Number.MAX_SAFE_INTEGER;
    const candidates = getRoutineStepCandidates(step, selectedProducts, usedIds, softCap);
    const candidateProducts = candidates.map((entry) => entry.product);
    const chosenById = draft.productId != null ? candidateProducts.find((product) => product.id === draft.productId) || null : null;
    let chosenIndex = candidateProducts.length ? (draft.candidateIndex || 0) % candidateProducts.length : 0;
    let localChosen = draft.removed ? null : chosenById || candidateProducts[chosenIndex] || null;
    let localDeferredReason = "";
    let localDeferred = false;
    if (!draft.removed && !draft.productId && localChosen && budgetMode.cap != null) {
      const futureCoreFloor = estimateRemainingCoreFloor(steps, index, selectedProducts, usedIds);
      const localPriority = getRoutineStepPriority(step, localChosen);
      if (localPriority === "core") {
        const remainingBudgetForStep = Math.max(0, budgetMode.cap - spent - futureCoreFloor);
        const affordable = candidateProducts.find(
          (product) => typeof product.price === "number" && product.price <= remainingBudgetForStep,
        );
        if (affordable) {
          localChosen = affordable;
          chosenIndex = candidateProducts.findIndex((product) => product.id === affordable.id);
        }
      } else {
        const projectedTotal = spent + (localChosen.price || 0) + futureCoreFloor;
        if (projectedTotal > budgetMode.cap) {
          localChosen = null;
          localDeferred = true;
          localDeferredReason = `Held out to keep the core routine inside the ${money(budgetMode.cap)} target first.`;
          optionalStepsDeferred += 1;
        }
      }
    }
    const localOverridePending =
      draft.removed !== Boolean(backendStep?.removed) ||
      draft.locked !== Boolean(backendStep?.locked) ||
      (draft.productId && draft.productId !== backendStep?.product?.id);
    const stepPriority =
      (localOverridePending && localChosen ? getRoutineStepPriority(step, localChosen) : null) ||
      backendStep?.priority ||
      getRoutineStepPriority(step, chosenById || candidateProducts[chosenIndex] || null);
    const effectiveRemoved = localOverridePending ? draft.removed : (backendStep?.removed ?? draft.removed);
    const effectiveLocked = localOverridePending ? draft.locked : (backendStep?.locked ?? draft.locked);
    const effectiveFromSavedSet = localOverridePending
      ? isActionableShortlistProduct(localChosen?.id)
      : (backendStep?.fromSavedSet ?? isActionableShortlistProduct(localChosen?.id));
    const chosen = effectiveRemoved ? null : localOverridePending ? localChosen : backendStep?.product || localChosen;
    const deferredReason = localOverridePending
      ? localDeferredReason
      : (backendStep?.deferred ? backendStep.reason || "Held out to keep the core routine inside the current budget target first." : "");
    const isDeferredByBudget = Boolean(deferredReason) && !chosen;
    const chosenWarnings = chosen
      ? getProductConflictWarnings(chosen, {
          routineTime: state.routineTime,
          selectedProducts,
        }).slice(0, 1)
      : [];

    const card = document.createElement("article");
    card.className = "routine-card";
    card.dataset.routineStepKey = getRoutineDraftKey(step);
    card.classList.toggle("routine-card-optional", stepPriority === "optional");
    card.classList.toggle("routine-card-kept", Boolean(effectiveLocked));
    card.classList.toggle("routine-card-removed", Boolean(effectiveRemoved));

    if (effectiveRemoved) {
      card.innerHTML = `
        <div class="routine-step-head">
          <p class="routine-step">${escapeHtml(step.label)}</p>
          <span class="routine-step-order">Step ${index + 1}</span>
        </div>
        <span class="routine-step-priority ${stepPriority}">${stepPriority === "core" ? "Core step" : "Optional step"}</span>
        <span class="routine-step-state muted">Removed from this plan</span>
        <h3>Step removed</h3>
        <p class="routine-copy">Bring this step back if you want a fuller routine again.</p>
        <div class="routine-actions">
          <button class="routine-action" type="button" data-routine-action="restore" data-routine-step="${escapeHtml(step.key)}">Restore</button>
        </div>
      `;
      routineGrid.appendChild(card);
      return;
    }

    if (!chosen) {
      card.innerHTML = `
        <div class="routine-step-head">
          <p class="routine-step">${escapeHtml(step.label)}</p>
          <span class="routine-step-order">Step ${index + 1}</span>
        </div>
        <span class="routine-step-priority ${stepPriority}">${stepPriority === "core" ? "Core step" : "Optional step"}</span>
        <h3>${isDeferredByBudget ? "Optional for later" : "No clear match yet"}</h3>
        <p class="routine-copy">${
          isDeferredByBudget
            ? escapeHtml(deferredReason)
            : `The current catalog does not have a strong ${escapeHtml(titleCase(step.label.toLowerCase()))} pick for ${escapeHtml(titleCase(state.routineConcern))}.`
        }</p>
        <div class="routine-actions">
          <button class="routine-action routine-remove" type="button" data-routine-action="remove" data-routine-step="${escapeHtml(step.key)}">Remove</button>
        </div>
      `;
      routineGrid.appendChild(card);
      return;
    }

    const swapOptions = candidateProducts.filter((product) => product.id !== chosen.id).slice(0, 4);
    const chooserOpen = state.ui.openRoutineChooserStep === getRoutineDraftKey(step);
    card.classList.toggle("routine-card-chooser-open", chooserOpen);
    if (chooserOpen) {
      drawerStep = step;
      drawerChosen = chosen;
      const alternativesKey = `${plannerContextKey}:${step.key}`;
      const backendAlternatives = state.routinePlanner.alternatives[alternativesKey];
      if (state.live.apiBacked && !backendAlternatives && !state.routinePlanner.loadingAlternatives[alternativesKey]) {
        fetchRoutinePlannerAlternatives(step.key);
      }
      drawerOptions = backendAlternatives
        ? [...(backendAlternatives.savedSetMatches || []), ...(backendAlternatives.otherStrongFits || [])]
        : swapOptions;
    }

    usedIds.add(chosen.id);
    selectedProducts.push(chosen);
    selectedEntries.push({
      step: {
        ...step,
        priority: stepPriority,
      },
      product: chosen,
    });
    if (stepPriority === "core") {
      selectedCoreSteps += 1;
      coreTotal += chosen.price || 0;
    } else {
      optionalSteps += 1;
      optionalTotal += chosen.price || 0;
    }
    card.innerHTML = `
      <div class="routine-step-head">
        <p class="routine-step">${escapeHtml(step.label)}</p>
        <span class="routine-step-order">Step ${index + 1}</span>
      </div>
      <span class="routine-step-priority ${stepPriority}">${stepPriority === "core" ? "Core step" : "Optional step"}</span>
      ${effectiveLocked ? `<span class="routine-step-state">Kept in plan</span>` : ""}
      ${effectiveFromSavedSet ? `<span class="routine-step-state shortlist">From your saved set</span>` : ""}
      <h3>${escapeHtml(chosen.name)}</h3>
      <p class="routine-brand">${escapeHtml(chosen.brand)} · ${escapeHtml(chosen.retailer)}</p>
      ${
        typeof chosen.rating === "number" && typeof chosen.reviewCount === "number"
          ? `<p class="routine-rating">${chosen.rating.toFixed(1)}★ synthetic fixture · ${chosen.reviewCount.toLocaleString()} synthetic fixture reviews</p>`
          : ""
      }
      <p class="routine-copy">${escapeHtml(backendStep?.reason || explainRoutineChoice(chosen, step))}</p>
      ${chosenWarnings.length ? renderConflictMarkup(chosenWarnings, true) : ""}
      <div class="routine-meta">
        <span>${money(chosen.price)}</span>
        <span>${escapeHtml(titleCase(chosen.category))}</span>
      </div>
      <div class="routine-actions">
        <button class="routine-action${effectiveLocked ? " active" : ""}" type="button" data-routine-action="keep" data-routine-step="${escapeHtml(step.key)}">${effectiveLocked ? "Unlock" : "Keep"}</button>
        <button class="routine-action" type="button" data-routine-action="swap" data-routine-step="${escapeHtml(step.key)}" ${swapOptions.length ? "" : "disabled"}>${chooserOpen ? "Hide swaps" : "Swap"}</button>
        <button class="routine-action routine-remove" type="button" data-routine-action="remove" data-routine-step="${escapeHtml(step.key)}">Remove</button>
      </div>
      <button class="track-button ${isTrackedAlertId(chosen.id) ? "active" : ""}" type="button" data-track-id="${escapeHtml(chosen.id)}">
        ${isTrackedAlertId(chosen.id) ? "Watching" : "Watch"}
      </button>
      <span class="product-link" aria-disabled="true">${escapeHtml(getOutboundLabel(chosen.retailer))}</span>
    `;
    routineGrid.appendChild(card);
  });
  const plannerState = getRoutinePlannerState(backendPlan);
  const chooserLoading = drawerStep
    ? Boolean(state.live.apiBacked && state.routinePlanner.loadingAlternatives[`${plannerContextKey}:${drawerStep.key}`])
    : false;
  renderRoutineSwapDrawer(drawerStep, drawerChosen, drawerOptions, { loading: chooserLoading });
  requestAnimationFrame(() => {
    positionRoutineSwapDrawer();
  });

  const summary = buildRoutinePlanSummary({
    steps,
    selectedProducts,
    budgetMode,
    selectedCoreSteps,
    coreSteps,
    optionalSteps,
    optionalStepsDeferred,
    coreTotal,
  });
  const mergedSummary = backendPlan?.summary
    ? {
        ...summary,
        total: backendPlan.summary.total,
        withinBudget: backendPlan.summary.withinBudget,
        budgetAssessment: backendPlan.summary.budgetAssessment,
        selectedSteps: backendPlan.summary.selectedSteps,
        selectedCoreSteps: backendPlan.summary.coreStepsSelected,
        coreSteps: backendPlan.summary.coreStepsTotal,
        optionalSteps: backendPlan.summary.optionalStepsSelected,
        optionalStepsDeferred: backendPlan.summary.optionalStepsDeferred || 0,
        keptSteps: backendPlan.summary.keptSteps,
        removedSteps: backendPlan.summary.removedSteps,
        savedSetSteps: backendPlan.summary.savedSetSteps,
        stepGuidance: backendPlan.summary.stepGuidance || summary.stepGuidance,
        warnings: (backendPlan.summary.warnings || []).map((entry) => entry.message || entry),
      }
    : summary;
  mergedSummary.budgetGuidance = buildRoutineBudgetGuidance(mergedSummary, budgetMode, coreTotal);
  state.conversion.currentRoutineEntries = selectedEntries;
  void ensureBasketPlan("routine", selectedEntries, { useLocalFallback: true });
  renderRoutineDraftBrief(mergedSummary, budgetMode);
  routineSummary.innerHTML = renderRoutineBudgetRailMarkup(
    mergedSummary,
    budgetMode,
    plannerState,
    plannerContextKey,
    selectedEntries,
  );
  renderTrackedAlertsPanel();
  renderDecisionWorkspaceSummary();
}
