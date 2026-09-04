// Champion/Backup/Hold/Cut state, saved-set health, watches, buy-plan summary, and shortlist AI fallback.
// Browser-native ES module. Keep behavior changes in focused feature commits.
import {
  articleCatalog,
  deleteJson,
  fetchJson,
  postJson,
  putJson,
  renderSnapshot,
} from "./api.js";
import {
  buildBasketRequestKey,
  buildCaseSummaryItems,
  buildLocalBasketPlanPayload,
  ensureBasketPlan,
  ensureSentence,
  getActiveBasketCache,
  getActiveBasketPayload,
  getComparableProductKey,
  getCatalogDecisionActionForReadiness,
  getCurrentRoutineOneStoreRetailer,
  getOutboundLabel,
  getRetailerComparison,
  getRetailerEquivalentCategoryGroup,
  getRetailerEquivalentIdentityRelation,
  getRetailerEquivalentVariantKind,
  getTrustTone,
  isRetailerExactMatch,
  renderProducts,
  renderRoutineBasketPlannerMarkup,
  serializeBasketOffer,
  sortRoutineBasketOffers,
} from "./cards.js";
import {
  addProductsToFavorites,
  clearBrowseLaneSelection,
  createDefaultQuietHours,
  createDefaultWatchDelivery,
  createDefaultWatchEventRules,
  createDefaultWatchThresholds,
  createSavedProfileFilters,
  deepCopy,
  deriveAvailabilityDetail,
  enterWorkMode,
  escapeHtml,
  explainProductChoice,
  formatOfferAvailability,
  generateLocalId,
  getActiveBrowseLane,
  getBestPickEntries,
  getBrowseLaneByKey,
  getBudgetLabel,
  getCatalogRenderContext,
  getCurrentArticleRecord,
  getCurrentProfileFiltersSnapshot,
  getProductById,
  getProfileLabel,
  getSavedProfileFiltersSignature,
  getStrongActiveCount,
  getTrustSignalLabels,
  isCatalogDecisionReady,
  isSensitiveSafeProduct,
  money,
  normalizeContinuityDomains,
  normalizeContinuitySavedEntries,
  normalizeContinuityVersions,
  normalizeContinuityWatchedItems,
  normalizeRoutineConcern,
  normalizeSavedRoutineConfig,
  normalizeWatchNumber,
  normalizeWatchedItem,
  nowIso,
  openShortlistCompareMode,
  overlapBoost,
  parseTimestamp,
  persistContinuitySessionState,
  persistContinuityShadowState,
  persistRoutinePlannerSession,
  renderArticles,
  renderBestPicks,
  renderCaseSummaryItems,
  renderSavedPresets,
  renderShellChrome,
  renderTrustMetaMarkup,
  renderWorkModeCaseSummary,
  resetRoutinePlannerCaches,
  scoreBestOverall,
  scoreProduct,
  scoreRoutineConflictPenalty,
  scoreRoutineMatch,
  setActiveShellView,
  setActiveSupportWorkspaceSection,
  setConcernChipSelection,
  setWorkspaceNavProcessState,
  shouldShowCatalogIngredientInsight,
  stableJsonStringify,
  syncSupportDisclosureUi,
  syncSupportFlowState,
  syncUserProfileSurface,
  titleCase,
  toIsoTimestamp,
} from "./catalog.js";
import {
  chooseConservativeShortlistProduct,
  evaluateShortlistQuestionGuardrails,
  getProductConflictWarnings,
  renderShortlistAiGuardrailNote,
} from "./guardrails.js";
import {
  getActiveRoutinePlannerPlan,
  getLeadRoutineStep,
  getRoutinePlannerAvoidIngredients,
  getRoutinePlannerState,
  getRoutineStepPriority,
  getSerializableRoutineDraftState,
  isRoutineProductValidForStep,
  normalizeSkinProfile,
  renderRoutineBuilder,
  syncRoutinePlannerDraftSoon,
} from "./routine.js";
import {
  CONTINUITY_SESSION_STORAGE_KEY,
  CONTINUITY_SHADOW_STORAGE_KEY,
  CONTINUITY_BUSY_WAIT_TIMEOUT_MS,
  CONTINUITY_SYNC_DEBOUNCE_MS,
  DECISION_DESK_COPY,
  ROUTINE_STEPS,
  SHORTLIST_ACTIONABLE_STATUSES,
  SHORTLIST_STATUS_LABELS,
  SHORTLIST_STATUS_STORAGE_KEY,
  TRACKED_ALERTS_STORAGE_KEY,
  WATCHED_ITEMS_STORAGE_KEY,
  advisorPlanLeadButton,
  advisorSaveLeadButton,
  avoidIngredients,
  brandFilter,
  catalogOpenShortlistButton,
  catalogResultsLayout,
  catalogShortlistMetrics,
  catalogShortlistSummary,
  categoryFilter,
  continuityCard,
  continuityCreateCodeButton,
  continuityDataMessage,
  continuityDeleteWorkspaceButton,
  continuityJoinCodeInput,
  continuityJoinMessage,
  continuityJoinPanel,
  continuityJoinSubmitButton,
  continuityJoinToggleButton,
  continuityPairCode,
  continuityPairExpires,
  continuityResetDataButton,
  continuityStatusCopy,
  continuityStatusMeta,
  controlsPanel,
  createContinuityState,
  createRoutinePlannerState,
  ingredientFilter,
  marketApplyWinnerButton,
  marketOpenBasketButton,
  picksSaveModeButton,
  profileFilter,
  retailerFilter,
  routineBudget,
  routineConcern,
  routineSaveCurrentButton,
  routineTime,
  saveRoutineButton,
  savedEmpty,
  savedGrid,
  savedProfiles,
  savedRoutines,
  searchInput,
  getMotionSafeScrollBehavior,
  shortlistAi,
  shortlistAiCopy,
  shortlistAiInput,
  shortlistAiMeta,
  shortlistAiPromptButtons,
  shortlistAiResponse,
  shortlistAiSubmit,
  shortlistBuildPlanButton,
  shortlistBuyCoreButton,
  shortlistBuySummary,
  shortlistConflicts,
  shortlistDock,
  shortlistEmptyCtaButton,
  shortlistGapSummary,
  shortlistSavedCount,
  shortlistSummary,
  shortlistToRoutineButton,
  sortFilter,
  state,
  supportSessionStrip,
  trackedAlertsBody,
  trackedAlertsMarkReadButton,
  trackedAlertsPanel,
  trackedAlertsTabAlerts,
  trackedAlertsTabWatching,
  watchEmailCodeInput,
  watchEmailInput,
  watchEmailStatus,
  watchMinAbsoluteInput,
  watchMinPercentInput,
  watchMutedUntilInput,
  watchQuietEnabledInput,
  watchQuietEndInput,
  watchQuietStartInput,
  watchSettingsCopy,
  watchSettingsCloseButton,
  watchSettingsDeliveryNote,
  watchSettingsDialog,
  watchSettingsForm,
  watchSettingsRemoveButton,
  watchTargetPriceInput,
  workspaceShortlistRail,
} from "./state.js";

export let routineSaveFeedbackTimer = null;
export let lastWatchSettingsTrigger = null;
let lastWatchSettingsTriggerProductId = null;

export function getShortlistStatusCounts() {
  return state.favoriteIds.reduce(
    (counts, id) => {
      const status = getShortlistStatus(id);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    },
    { core: 0, optional: 0, wait: 0, reject: 0 },
  );
}

export function getShortlistSavedProducts() {
  return state.favoriteIds.map((id) => getProductById(id)).filter(Boolean);
}

export function getShortlistChampionProduct(savedProducts = getShortlistSavedProducts()) {
  return savedProducts.find((product) => getShortlistStatus(product.id) === "core") || null;
}

export function getShortlistBackupProduct(savedProducts = getShortlistSavedProducts()) {
  return savedProducts.find((product) => getShortlistStatus(product.id) === "optional") || null;
}

export function getNormalizedShortlistStatusValue(status) {
  return SHORTLIST_STATUS_LABELS[status] ? status : "wait";
}

export function getDefaultShortlistStatusForNewSave(statusMap = state.shortlistStatuses, favoriteIds = state.favoriteIds) {
  const savedIds = (favoriteIds || []).filter(Boolean);
  const hasChampion = savedIds.some((id) => statusMap[id] === "core");
  if (!hasChampion) return "core";
  const hasBackup = savedIds.some((id) => statusMap[id] === "optional");
  if (!hasBackup) return "optional";
  return "wait";
}

export function normalizeShortlistDecisionStatuses({
  preferredCoreId = null,
  preferredBackupId = null,
  fillSlots = false,
  favorPreviousCoreAsBackup = false,
} = {}) {
  const previous = state.shortlistStatuses && typeof state.shortlistStatuses === "object" ? state.shortlistStatuses : {};
  const savedIds = state.favoriteIds.filter((id) => id && getProductById(id));
  const next = {};
  const nonRejectedIds = [];
  const previousCoreIds = [];
  const previousOptionalIds = [];
  const previousWaitingIds = [];

  savedIds.forEach((id) => {
    const normalized = getNormalizedShortlistStatusValue(previous[id]);
    if (normalized === "reject") {
      next[id] = "reject";
      return;
    }
    nonRejectedIds.push(id);
    if (normalized === "core") {
      previousCoreIds.push(id);
    } else if (normalized === "optional") {
      previousOptionalIds.push(id);
    } else {
      previousWaitingIds.push(id);
    }
  });

  const championId =
    (preferredCoreId && nonRejectedIds.includes(preferredCoreId) && preferredCoreId) ||
    previousCoreIds[0] ||
    (fillSlots ? nonRejectedIds[0] || null : null);
  const backupPool = nonRejectedIds.filter((id) => id !== championId);
  const backupPriority = [
    preferredBackupId && backupPool.includes(preferredBackupId) ? preferredBackupId : null,
    ...(favorPreviousCoreAsBackup ? previousCoreIds : previousOptionalIds).filter((id) => id !== championId),
    ...(favorPreviousCoreAsBackup ? previousOptionalIds : previousCoreIds).filter((id) => id !== championId),
    ...(fillSlots ? previousWaitingIds.filter((id) => id !== championId) : []),
  ]
    .filter(Boolean)
    .filter((id, index, values) => values.indexOf(id) === index);
  const backupId = backupPriority.find((id) => backupPool.includes(id)) || null;

  savedIds.forEach((id) => {
    if (next[id] === "reject") return;
    next[id] = id === championId ? "core" : id === backupId ? "optional" : "wait";
  });

  const changed =
    savedIds.some((id) => next[id] !== previous[id]) ||
    Object.keys(previous).some((id) => !savedIds.includes(id));
  if (changed) {
    state.shortlistStatuses = next;
  }
  return changed;
}

export function getShortlistDecisionState(savedProducts = getShortlistSavedProducts()) {
  const championProduct = getShortlistChampionProduct(savedProducts);
  const backupProduct = getShortlistBackupProduct(savedProducts);
  const candidateProducts = savedProducts.filter((product) => getShortlistStatus(product.id) !== "reject");
  const holdProducts = savedProducts.filter((product) => getShortlistStatus(product.id) === "wait");
  const cutProducts = savedProducts.filter((product) => getShortlistStatus(product.id) === "reject");
  return {
    savedProducts,
    championProduct,
    backupProduct,
    candidateProducts,
    holdProducts,
    cutProducts,
  };
}

export function getShortlistComparisonFamilyKey(product) {
  const comparisonKey = getComparableProductKey(product);
  if (comparisonKey) {
    const categoryGroup = getRetailerEquivalentCategoryGroup(product);
    const variantKind = getRetailerEquivalentVariantKind(product);
    const variantBucket = ["kit", "refill"].includes(variantKind)
      ? variantKind
      : "flexible";
    return `${comparisonKey}::${categoryGroup}::${variantBucket}`;
  }
  return `${product.brand}::${product.category}::${product.name}`.toLowerCase();
}

export function buildShortlistConflictSignals(savedProducts) {
  if (!savedProducts.length) return [];
  const conflicts = [];
  const familyCounts = new Map();
  const roleCounts = new Map();
  const actionable = savedProducts.filter((product) => SHORTLIST_ACTIONABLE_STATUSES.has(getShortlistStatus(product.id)));
  const exactComparisonLimited = actionable.some((product) => {
    const comparisons = getRetailerComparison(product);
    return comparisons.length > 0 && !comparisons.some((entry) => isRetailerExactMatch(entry));
  });

  actionable.forEach((product) => {
    const familyKey = getShortlistComparisonFamilyKey(product);
    familyCounts.set(familyKey, (familyCounts.get(familyKey) || 0) + 1);
    const matchedStep = ROUTINE_STEPS[state.routineTime].find((step) => isRoutineProductValidForStep(step, product));
    if (matchedStep) {
      roleCounts.set(matchedStep.key, (roleCounts.get(matchedStep.key) || 0) + 1);
    }
  });

  const familyConflict = [...familyCounts.values()].find((count) => count > 1);
  if (familyConflict) {
    conflicts.push(`You have ${familyConflict} saved products in the same product family across retailers or close variants.`);
  }

  const duplicateRole = [...roleCounts.entries()].find(([, count]) => count > 1);
  if (duplicateRole) {
    conflicts.push(`Two or more actionable picks are filling the same ${getShortlistRoleLabel(duplicateRole[0])} role.`);
  }

  const activeHeavy = actionable.filter((product) => getStrongActiveCount(product) >= 1).length >= 2;
  if (activeHeavy) {
    conflicts.push("The actionable shortlist is getting active-heavy for a starter case.");
  }

  const missingCore = [...ROUTINE_STEPS[state.routineTime]]
    .filter((step) => getRoutineStepPriority(step) === "core")
    .find((step) => !actionable.some((product) => isRoutineProductValidForStep(step, product)));
  if (missingCore) {
    conflicts.push(
      missingCore.key === "protect"
        ? "The actionable shortlist still needs SPF coverage."
        : `The actionable shortlist still misses a ${missingCore.label.toLowerCase()} core step.`,
    );
  }

  if (exactComparisonLimited) {
    conflicts.push("At least one actionable pick only has closest-equivalent retailer comparison confidence.");
  }

  return conflicts.slice(0, 4);
}

export function openDecisionWorkspaceSection(sectionId = "shopping-brief-panel") {
  setActiveSupportWorkspaceSection(sectionId);
  return true;
}

export function getDecisionNextActionContext({
  leadProduct = null,
  savedProducts = getShortlistSavedProducts(),
  marketSnapshot = null,
  shortlistPayload = null,
} = {}) {
  if (!isCatalogDecisionReady()) {
    return {
      key: "focus-catalog-work",
      tone: "build",
      badge: "Choose focus",
      primaryLabel: "Choose focus",
      detail: "Broad catalog is not decision-ready. Choose a product type, concern, ingredient, lane, or specific search before ranking with confidence.",
      productId: "",
      workspaceSection: "shopping-brief-panel",
    };
  }

  const decisionState = getShortlistDecisionState(savedProducts);
  const championProduct = decisionState.championProduct;
  const backupProduct = decisionState.backupProduct;
  const savedLead = Boolean(leadProduct?.id && state.favoriteIds.includes(leadProduct.id));
  const nonChampionCandidates = decisionState.candidateProducts.filter((product) => product.id !== championProduct?.id);

  if (!decisionState.savedProducts.length) {
    if (leadProduct) {
      return {
        key: "save-lead",
        tone: "ready",
        badge: "Save leader",
        primaryLabel: "Save current leader",
        detail: `Save ${leadProduct.brand} ${leadProduct.name} as the current champion before you widen the case again.`,
        productId: leadProduct.id,
        workspaceSection: "shopping-brief-panel",
      };
    }
    return {
      key: "tighten-case",
      tone: "build",
      badge: "Tighten case",
      primaryLabel: "Tighten case",
      detail: "Tighten the case until one product deserves champion status.",
      workspaceSection: "shopping-brief-panel",
    };
  }

  if (!championProduct) {
    if (leadProduct && !savedLead) {
      return {
        key: "save-lead",
        tone: "ready",
        badge: "Save leader",
        primaryLabel: "Save current leader",
        detail: `Save ${leadProduct.brand} ${leadProduct.name} and use it as the current champion candidate.`,
        productId: leadProduct.id,
        workspaceSection: "shopping-brief-panel",
      };
    }
    return {
      key: "choose-champion",
      tone: "build",
      badge: "Choose champion",
      primaryLabel: "Choose champion",
      detail: "Mark one saved product Champion. Everything else should become backup, hold, or cut.",
      workspaceSection: "shopping-brief-panel",
    };
  }

  if (!backupProduct) {
    if (leadProduct && leadProduct.id !== championProduct.id && !savedLead) {
      return {
        key: "save-challenger",
        tone: "trim",
        badge: "Save challenger",
        primaryLabel: "Save one challenger",
        detail: `Save ${leadProduct.brand} ${leadProduct.name} as the challenger next to ${championProduct.brand} ${championProduct.name}.`,
        productId: leadProduct.id,
        workspaceSection: "shopping-brief-panel",
      };
    }
    if (nonChampionCandidates.length) {
      return {
        key: "choose-backup",
        tone: "trim",
        badge: "Choose backup",
        primaryLabel: "Choose backup",
        detail: `Lock one challenger next to ${championProduct.brand} ${championProduct.name}. Hold or cut the rest.`,
        workspaceSection: "shopping-brief-panel",
      };
    }
    return {
      key: "save-challenger",
      tone: "trim",
      badge: "Save challenger",
      primaryLabel: "Save one challenger",
      detail: `Save one more serious contender so ${championProduct.brand} ${championProduct.name} has a real side-by-side check.`,
      workspaceSection: "shopping-brief-panel",
    };
  }

  if (!shortlistPayload?.oneStoreBasket?.retailer) {
    return {
      key: "store-check",
      tone: "working",
      badge: "Run store check",
      primaryLabel: "Run store check",
      detail: `Pressure-test ${championProduct.brand} ${championProduct.name} against ${backupProduct.brand} ${backupProduct.name} and lock one checkout path.`,
      workspaceSection: "market-view-panel",
    };
  }

  return {
    key: "approve-basket",
    tone: "ready",
    badge: "Approve basket",
    primaryLabel: "Approve final basket",
    detail: `${shortlistPayload.oneStoreBasket.retailer} can cover the current champion path. Approve the basket and buy.`,
    workspaceSection: "shopping-brief-panel",
  };
}

const SHORTLIST_DECISION_COPY = {
  title: "Lock a champion before you buy.",
  body: "Pick the champion, lock one backup, then buy or plan from it.",
  aiPlaceholder: "Ask what deserves champion status, or what caution matters most.",
};

const SHORTLIST_EXPLORATORY_COPY = {
  title: "Choose a focus before deciding.",
  body: "This saved pick came from broad browsing. Choose a product type, concern, ingredient, lane, or specific search before ranking it.",
  aiCopySingle: "Saved pick is a reference from broad browsing.",
  aiCopyMultiple: "Saved set is still exploratory.",
  aiMetaSingle: "Grounded in this saved pick and your skin lens; choose a product focus before ranking it.",
  aiMetaMultiple: "Grounded in these saved picks and your skin lens; choose a product focus before comparing them directly.",
  aiPlaceholder: "Ask what focus to choose before comparing.",
  idleLead: "Exploratory save ready",
  idleBody: "Use this saved pick as a reference point, then choose a product type, concern, ingredient, lane, or specific search before ranking it.",
  prompts: [
    "What focus should I choose before comparing?",
    "Is this a safe starter for my skin lens?",
    "What should I check before narrowing?",
  ],
};

const SHORTLIST_EXPLORATORY_STATUS_LABELS = {
  core: "Focused pick",
  optional: "Compare",
  wait: "Reference",
  reject: "Cut",
};

export function isShortlistExploratoryHandoff(savedProducts = getShortlistSavedProducts()) {
  const products = (savedProducts || []).filter(Boolean);
  if (!products.length || isCatalogDecisionReady()) return false;
  return !getShortlistDecisionState(products).championProduct;
}

function getShortlistDisplayStatusLabels(savedProducts = getShortlistSavedProducts()) {
  return isShortlistExploratoryHandoff(savedProducts) ? SHORTLIST_EXPLORATORY_STATUS_LABELS : SHORTLIST_STATUS_LABELS;
}

function getShortlistDisplayDecisionAction(decisionAction, savedProducts = getShortlistSavedProducts()) {
  return isShortlistExploratoryHandoff(savedProducts)
    ? getCatalogDecisionActionForReadiness(decisionAction, false)
    : decisionAction;
}

function getShortlistHeadingIntro() {
  const heading = document.querySelector("#shortlist-view-heading");
  const intro = heading?.closest(".section-heading")?.querySelector("p:not(.eyebrow)") || null;
  return { heading, intro };
}

function syncShortlistHandoffCopy(savedProducts = getShortlistSavedProducts()) {
  const copy = isShortlistExploratoryHandoff(savedProducts) ? SHORTLIST_EXPLORATORY_COPY : SHORTLIST_DECISION_COPY;
  const { heading, intro } = getShortlistHeadingIntro();
  if (heading) heading.textContent = copy.title;
  if (intro) intro.textContent = copy.body;
  if (shortlistAiInput) shortlistAiInput.placeholder = copy.aiPlaceholder;
}

export function getDecisionWorkspaceBlockerSection(options = {}) {
  const action = getDecisionNextActionContext(options);
  if (action.key === "store-check") return "market-view-panel";
  return "shopping-brief-panel";
}

export function getCatalogShortlistHealthSummary({
  savedProducts = [],
  championProduct = null,
  backupProduct = null,
  shortlistPayload = null,
  gapSignals = [],
  conflictSignals = [],
} = {}) {
  if (!savedProducts.length) {
    return {
      label: "Not started",
      tone: "neutral",
      detail: "Save the current leader to start the saved set.",
    };
  }

  if (shortlistPayload?.oneStoreBasket?.retailer) {
    if (conflictSignals[0]) {
      return {
        label: "Review cautions",
        tone: "warning",
        detail: `${shortlistPayload.oneStoreBasket.retailer} can cover the current path, but ${conflictSignals[0].charAt(0).toLowerCase()}${conflictSignals[0].slice(1)}`,
      };
    }
    return {
      label: "Ready",
      tone: "ready",
      detail: `${shortlistPayload.oneStoreBasket.retailer} can cover the current champion path.`,
    };
  }

  if (!championProduct) {
    if (isShortlistExploratoryHandoff(savedProducts)) {
      return {
        label: "Focus open",
        tone: "build",
        detail: "Choose a product type, concern, ingredient, lane, or specific search before ranking saved picks.",
      };
    }
    return {
      label: "Needs leader",
      tone: "build",
      detail: "Mark one saved product Champion so the set has a clear leader.",
    };
  }

  if (!backupProduct) {
    return {
      label: "Needs backup",
      tone: "build",
      detail: `Add one challenger next to ${championProduct.brand} ${championProduct.name}.`,
    };
  }

  if (conflictSignals[0]) {
    return {
      label: "Needs cleanup",
      tone: "warning",
      detail: conflictSignals[0],
    };
  }

  if (gapSignals[0]) {
    return {
      label: "Needs coverage",
      tone: "build",
      detail: gapSignals[0],
    };
  }

  return {
    label: "Healthy",
    tone: "ready",
    detail: "Champion and backup are locked. Compare stores next.",
  };
}

export function openDecisionWorkspaceBlocker() {
  const renderContext = getCatalogRenderContext();
  const filtered = renderContext.filtered;
  const leadProduct = renderContext.leadProduct;
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const marketSnapshot = renderContext.marketSnapshot;
  return openDecisionWorkspaceSection(
    getDecisionWorkspaceBlockerSection({
      leadProduct,
      marketSnapshot,
      shortlistPayload,
    }),
  );
}

export function focusCatalogWorkbench({ focusSearch = false } = {}) {
  enterWorkMode("catalog");
  setActiveShellView("catalog", { focus: false, restoreScroll: false });
  requestAnimationFrame(() => {
    controlsPanel?.scrollIntoView({ block: "start", behavior: getMotionSafeScrollBehavior() });
    if (focusSearch) {
      searchInput?.focus({ preventScroll: true });
      searchInput?.select?.();
    }
  });
  return true;
}

export function runDecisionNextAction(action) {
  if (!action?.key) return false;

  if (action.key === "open-catalog-shell") {
    return focusCatalogWorkbench();
  }

  if (action.key === "focus-catalog-work") {
    return focusCatalogWorkbench({ focusSearch: true });
  }

  if (action.key === "open-workspace-stage") {
    return openDecisionWorkspaceSection(action.workspaceSection || state.ui.activeWorkspaceTab || "shopping-brief-panel");
  }

  if (action.key === "save-lead" || action.key === "save-challenger") {
    if (action.productId) {
      addProductsToFavorites([action.productId]);
      return true;
    }
    enterWorkMode("catalog");
    setActiveShellView("catalog");
    return false;
  }

  if (action.key === "store-check") {
    return openDecisionWorkspaceSection(action.workspaceSection || "market-view-panel");
  }

  if (action.key === "tighten-case") {
    enterWorkMode("catalog");
    setActiveShellView("catalog");
    return true;
  }

  if (action.key === "approve-basket") {
    const subset = getShortlistCoreFirstSubset();
    if (subset.length) {
      void ensureBasketPlan("shortlist", subset, { dedupe: true, useLocalFallback: true, force: true });
    }
    openShortlistCompareMode();
    return true;
  }

  if (action.key === "choose-champion") {
    const decisionState = getShortlistDecisionState();
    if (decisionState.candidateProducts.length === 1) {
      setShortlistStatus(decisionState.candidateProducts[0].id, "core");
    }
    openShortlistCompareMode();
    return true;
  }

  if (action.key === "choose-backup") {
    const championProduct = getShortlistChampionProduct();
    const backupCandidates = getShortlistDecisionState().candidateProducts.filter((product) => product.id !== championProduct?.id);
    if (backupCandidates.length === 1) {
      setShortlistStatus(backupCandidates[0].id, "optional");
    }
    openShortlistCompareMode();
    return true;
  }

  openShortlistCompareMode();
  return true;
}

export function renderCatalogShortlistRail(renderContext = null) {
  const savedProducts = getShortlistSavedProducts();
  const isEmpty = savedProducts.length === 0;
  const context = renderContext || getCatalogRenderContext();
  const leadProduct = context.leadProduct;
  const marketSnapshot = context.marketSnapshot;
  const decisionAction = getDecisionNextActionContext({
    leadProduct,
    savedProducts,
    marketSnapshot,
    shortlistPayload: null,
  });
  const displayDecisionAction = getCatalogDecisionActionForReadiness(decisionAction);
  workspaceShortlistRail?.classList.add("is-empty");
  workspaceShortlistRail?.toggleAttribute("hidden", true);
  workspaceShortlistRail?.setAttribute("aria-hidden", "true");
  catalogResultsLayout?.classList.toggle("has-shortlist", false);
  catalogResultsLayout?.classList.toggle("is-shortlist-empty", true);
  catalogShortlistMetrics?.closest(".catalog-shortlist-panel")?.classList.add("is-empty");
  catalogShortlistMetrics?.replaceChildren();

  if (isEmpty) {
    if (catalogShortlistSummary) {
      catalogShortlistSummary.textContent = displayDecisionAction.detail;
    }
    if (catalogOpenShortlistButton) {
      catalogOpenShortlistButton.disabled = false;
      catalogOpenShortlistButton.classList.add("is-empty");
      catalogOpenShortlistButton.classList.remove("has-saved");
      catalogOpenShortlistButton.textContent = displayDecisionAction.primaryLabel;
      catalogOpenShortlistButton.dataset.primaryAction = displayDecisionAction.key;
      catalogOpenShortlistButton.dataset.productId = displayDecisionAction.productId || "";
      catalogOpenShortlistButton.dataset.workspaceSection = displayDecisionAction.workspaceSection || "";
      catalogOpenShortlistButton.dataset.savedCount = "0";
      catalogOpenShortlistButton.setAttribute("aria-label", displayDecisionAction.primaryLabel);
    }
    return;
  }

  if (catalogShortlistSummary) {
    catalogShortlistSummary.textContent = `${savedProducts.length} saved in Shortlist. Review saved products in Shortlist.`;
  }

  if (catalogOpenShortlistButton) {
    catalogOpenShortlistButton.disabled = false;
    catalogOpenShortlistButton.classList.remove("is-empty");
    catalogOpenShortlistButton.classList.add("has-saved");
    catalogOpenShortlistButton.textContent = `Saved ${savedProducts.length} · Review`;
    catalogOpenShortlistButton.dataset.primaryAction = "open-shortlist";
    catalogOpenShortlistButton.dataset.productId = "";
    catalogOpenShortlistButton.dataset.workspaceSection = "shortlist";
    catalogOpenShortlistButton.dataset.savedCount = String(savedProducts.length);
    catalogOpenShortlistButton.setAttribute(
      "aria-label",
      `Review ${savedProducts.length} saved ${savedProducts.length === 1 ? "product" : "products"} in Shortlist`,
    );
  }
}

export function getWorkspaceDecisionActionDisplay(action = {}) {
  if (!action?.key) {
    return {
      label: "Choose focus",
      detail: "Choose a focus before the Workspace can make a useful product call.",
    };
  }

  if (action.key === "focus-catalog-work") {
    return {
      label: "Choose focus",
      detail: action.detail || "Choose a product type, concern, ingredient, lane, or specific search before ranking with confidence.",
    };
  }

  if (action.key === "tighten-case") {
    return {
      label: "Find candidate",
      detail: action.detail || "Widen or adjust the focused case until one product can carry the board.",
    };
  }

  if (action.key === "save-lead") {
    return {
      label: "Save leader",
      detail: action.detail || "Save the best candidate before comparing backups or stores.",
    };
  }

  if (action.key === "save-challenger") {
    return {
      label: "Save backup",
      detail: action.detail || "Save one serious challenger beside the champion.",
    };
  }

  if (action.key === "choose-champion") {
    return {
      label: "Choose champion",
      detail: action.detail || "Promote one saved product before pricing the path.",
    };
  }

  if (action.key === "choose-backup") {
    return {
      label: "Choose backup",
      detail: action.detail || "Lock one backup before comparing stores.",
    };
  }

  if (action.key === "store-check") {
    return {
      label: "Compare stores",
      detail: action.detail || "Compare retailer paths for the champion and backup.",
    };
  }

  if (action.key === "approve-basket") {
    return {
      label: "Review basket",
      detail: action.detail || "Review the basket path before buying.",
    };
  }

  return {
    label: action.primaryLabel || action.badge || "Open next",
    detail: action.detail || "Continue the current decision path.",
  };
}

export function renderDecisionWorkspaceSummary(renderContext = null) {
  const context = renderContext || getCatalogRenderContext();
  const filtered = context.filtered;
  const activeLane = getActiveBrowseLane();
  const marketSnapshot = context.marketSnapshot;
  const leadProduct = context.leadProduct;
  const savedProducts = getShortlistSavedProducts();
  const decisionState = getShortlistDecisionState(savedProducts);
  const championProduct = decisionState.championProduct;
  const backupProduct = decisionState.backupProduct;
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const shortlistRetailer = shortlistPayload?.oneStoreBasket?.retailer || null;
  const blockerSection = getDecisionWorkspaceBlockerSection({
    leadProduct,
    marketSnapshot,
    shortlistPayload,
    savedProducts,
  });
  const coreSteps = [...ROUTINE_STEPS[state.routineTime]].filter((step) => getRoutineStepPriority(step) === "core").length;
  const selectedCoreSteps = getCurrentRoutineCoreEntries().length;
  const routineEntries = state.conversion.currentRoutineEntries;
  const routineFallback = routineEntries.length ? buildLocalBasketPlanPayload(routineEntries, "routine") : null;
  const routinePayload = routineEntries.length
    ? getActiveBasketPayload("routine", routineEntries, routineFallback) || routineFallback
    : null;
  const routineRetailer = routinePayload?.oneStoreBasket?.retailer || getCurrentRoutineOneStoreRetailer();
  const activeArticle = getCurrentArticleRecord();
  const availablePickCount = getBestPickEntries().filter((entry) => entry.product).length;
  const decisionReady = isCatalogDecisionReady();
  const primaryAction = getDecisionNextActionContext({
    leadProduct,
    marketSnapshot,
    shortlistPayload,
    savedProducts,
  });
  const primaryActionDisplay = getWorkspaceDecisionActionDisplay(primaryAction);

  renderShellChrome(context);
  renderWorkModeCaseSummary(filtered, marketSnapshot, leadProduct, context);

  if (supportSessionStrip) {
    const summaryItems = buildCaseSummaryItems({
      filteredCount: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / state.pageSize)),
      activeLane,
      leadProduct: decisionReady ? leadProduct : null,
      marketSnapshot,
      shortlistPayload,
      savedProducts,
      includeAction: true,
      compactLabels: true,
      decisionReady,
    });
    const workspaceItems = summaryItems.map((item) => {
      if (item.key === "case") {
        return {
          ...item,
          label: "Focus",
          detail: decisionReady
            ? item.detail
            : "Broad/unfocused catalog. Choose a concrete axis before naming a leader.",
        };
      }
      if (item.key === "leader") {
        if (!decisionReady) {
          return {
            ...item,
            label: "Candidate",
            value: "Focus open",
            detail: "No valid candidate until the case is narrowed.",
          };
        }
        if (championProduct) {
          return {
            ...item,
            label: "Champion",
            value: `${championProduct.brand} ${championProduct.name}`,
            detail: `${championProduct.retailer}${typeof championProduct.price === "number" ? ` · ${money(championProduct.price)}` : ""}`,
          };
        }
        return {
          ...item,
          label: "Candidate",
        };
      }
      if (item.key === "decision") {
        return {
          ...item,
          label: "Saved",
          value: savedProducts.length
            ? `${savedProducts.length} saved${decisionReady ? "" : " · focus open"}`
            : "0 saved",
          detail: decisionReady
            ? item.detail
            : "Saved products stay as references until a focus is active.",
        };
      }
      if (item.key === "next") {
        return {
          ...item,
          label: "Next action",
          value: primaryActionDisplay.label,
          detail: primaryActionDisplay.detail,
          action: item.action
            ? {
                ...item.action,
                key: primaryAction.key,
                label: primaryActionDisplay.label,
                productId: primaryAction.productId || "",
                workspaceSection: primaryAction.workspaceSection || "",
              }
            : null,
        };
      }
      return item;
    });
    renderCaseSummaryItems(
      supportSessionStrip,
      workspaceItems,
      { variant: "workspace", actionAttribute: "data-decision-action" },
    );
  }

  setWorkspaceNavProcessState(
    "shopping-brief-panel",
    championProduct ? "ready" : "next",
    primaryActionDisplay.label,
  );
  setWorkspaceNavProcessState(
    "market-view-panel",
    shortlistRetailer ? "ready" : championProduct && backupProduct ? "next" : "neutral",
    shortlistRetailer ? "Review basket" : championProduct && backupProduct ? "Compare stores" : "Needs champion + backup",
  );
  setWorkspaceNavProcessState(
    "routine-builder-panel",
    routineRetailer || selectedCoreSteps ? "ready" : championProduct || leadProduct ? "next" : "neutral",
    routineRetailer || selectedCoreSteps ? "Draft saved" : championProduct || leadProduct ? "Draft fit" : "Draft later",
  );
  setWorkspaceNavProcessState("saved-presets-panel", "reference", "Reopen state");
  setWorkspaceNavProcessState("learn-workspace-panel", activeArticle ? "ready" : "reference", activeArticle ? "Case evidence" : "Reference");

  syncSupportFlowState();

  if (picksSaveModeButton) {
    picksSaveModeButton.disabled = availablePickCount === 0;
    picksSaveModeButton.textContent = availablePickCount
      ? `Save ${availablePickCount} store leader${availablePickCount === 1 ? "" : "s"}`
      : "Save one pick per store";
  }

  if (advisorSaveLeadButton) {
    advisorSaveLeadButton.disabled = false;
    advisorSaveLeadButton.dataset.productId = primaryAction.productId || "";
    advisorSaveLeadButton.dataset.decisionAction = primaryAction.key || "";
    advisorSaveLeadButton.dataset.workspaceSection = primaryAction.workspaceSection || "";
    advisorSaveLeadButton.textContent =
      primaryAction.key === "save-lead" && leadProduct && state.favoriteIds.includes(leadProduct.id)
        ? "Open shortlist"
        : primaryActionDisplay.label;
  }

  if (advisorPlanLeadButton) {
    const leadRoutineStep = leadProduct ? getLeadRoutineStep(leadProduct) : null;
    advisorPlanLeadButton.disabled = decisionReady ? !leadRoutineStep : false;
    advisorPlanLeadButton.dataset.productId = leadProduct?.id || "";
    advisorPlanLeadButton.dataset.decisionAction = decisionReady ? "" : "focus-catalog-work";
    advisorPlanLeadButton.dataset.workspaceSection = decisionReady ? "" : "shopping-brief-panel";
    advisorPlanLeadButton.textContent = decisionReady
      ? leadRoutineStep
        ? "Draft routine fit"
        : "Routine fit unavailable"
      : "Choose focus first";
  }

  if (marketApplyWinnerButton) {
    marketApplyWinnerButton.disabled = !marketSnapshot.leadingRetailer || state.retailer === marketSnapshot.leadingRetailer;
    marketApplyWinnerButton.dataset.retailer = marketSnapshot.leadingRetailer || "";
    marketApplyWinnerButton.textContent =
      marketSnapshot.leadingRetailer && state.retailer !== marketSnapshot.leadingRetailer
        ? `Focus ${marketSnapshot.leadingRetailer}`
        : "Focus winning store";
  }

  if (marketOpenBasketButton) {
    const hasOpenPath = Boolean(state.favoriteIds.length || selectedCoreSteps);
    marketOpenBasketButton.disabled = decisionReady ? !hasOpenPath : false;
    marketOpenBasketButton.textContent = !decisionReady
      ? "Choose focus first"
      : shortlistRetailer
        ? `Review ${shortlistRetailer} basket`
        : championProduct && backupProduct
          ? "Compare store path"
          : championProduct
            ? "Choose backup first"
            : state.favoriteIds.length
              ? "Choose champion first"
              : selectedCoreSteps
                ? "Review routine draft"
                : "No retailer path yet";
  }

  renderCatalogShortlistRail();
}

export function scrollShortlistDockToBottom() {
  if (!shortlistDock || state.ui.activeShellView !== "shortlist") return;
  const panel = shortlistDock.querySelector(".shortlist-panel");
  if (!panel) return;
  requestAnimationFrame(() => {
    const panelCanScroll = panel.scrollHeight > panel.clientHeight + 12;
    if (panelCanScroll) {
      panel.scrollTop = panel.scrollHeight;
      return;
    }
    shortlistDock.scrollIntoView({ behavior: getMotionSafeScrollBehavior(), block: "nearest" });
  });
}

export function scrollShortlistDockToAiArea() {
  if (!shortlistDock || state.ui.activeShellView !== "shortlist" || shortlistAi?.hidden) return;
  const panel = shortlistDock.querySelector(".shortlist-panel");
  if (!panel) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const target = shortlistAiInput || shortlistAiResponse || shortlistAi;
      if (!target) return;
      const panelCanScroll = panel.scrollHeight > panel.clientHeight + 12;
      if (!panelCanScroll) {
        target.scrollIntoView({ behavior: getMotionSafeScrollBehavior(), block: "nearest" });
        return;
      }
      const panelRect = panel.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offset = Math.max(0, targetRect.top - panelRect.top + panel.scrollTop - 14);
      panel.scrollTo({ top: offset, behavior: getMotionSafeScrollBehavior() });
    });
  });
}

export function closeShortlistSheet() {
  const nextView =
    state.ui.shortlistReturnView && state.ui.shortlistReturnView !== "shortlist"
      ? state.ui.shortlistReturnView
      : state.ui.lastWorkView === "shortlist"
        ? "catalog"
        : state.ui.lastWorkView || "catalog";
  setActiveShellView(nextView);
}
export function hasMeaningfulContinuityShadow(domains = state.continuity.shadow) {
  const next = normalizeContinuityDomains(domains);
  return Boolean(
    next.user_profile.clientUpdatedAt ||
      Object.keys(next.shortlist.items || {}).length ||
      (next.watched_items.items || []).length ||
      (next.saved_articles.entries || []).length ||
      (next.saved_profiles.entries || []).length ||
      (next.saved_routines.entries || []).length ||
      next.routine_session.updatedAt,
  );
}

export function normalizeContinuityShortlistStatus(status) {
  return SHORTLIST_STATUS_LABELS[status] ? status : "wait";
}

export function buildContinuityUserProfileDomain(previous = state.continuity.shadow.user_profile) {
  return {
    name: String(state.userProfile.name || "").trim(),
    budget: ["any", "budget", "balanced", "premium"].includes(state.userProfile.budget) ? state.userProfile.budget : "any",
    goal: String(state.userProfile.goal || "dryness"),
    goalSource: state.userProfile.goalSource || "default",
    profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
    sensitivity: state.userProfile.sensitivity || "moderate",
    activesComfort: state.userProfile.activesComfort || "medium",
    avoidIngredients: [...new Set((state.userProfile.avoidIngredients || []).map((ingredient) => String(ingredient || "").trim()).filter(Boolean))].sort(),
    clientUpdatedAt: toIsoTimestamp(state.userProfile.updatedAt, previous?.clientUpdatedAt || null),
  };
}

export function buildContinuityShortlistDomain(previous = state.continuity.shadow.shortlist) {
  const previousItems = normalizeContinuityDomains({ shortlist: previous }).shortlist.items;
  const savedIds = new Set((state.favoriteIds || []).filter(Boolean));
  const statusMap = state.shortlistStatuses || {};
  const currentAt = nowIso();
  const itemIds = new Set([
    ...Object.keys(previousItems),
    ...savedIds,
    ...Object.keys(statusMap),
  ]);
  const items = {};

  itemIds.forEach((productId) => {
    const previousItem = previousItems[productId] || {
      saved: false,
      savedChangedAt: null,
      status: "wait",
      statusChangedAt: null,
    };
    const currentSaved = savedIds.has(productId);
    const hasStatus = Object.prototype.hasOwnProperty.call(statusMap, productId);
    const currentStatus = hasStatus
      ? normalizeContinuityShortlistStatus(statusMap[productId])
      : previousItem.status || "wait";
    const nextItem = {
      saved: currentSaved,
      savedChangedAt:
        currentSaved === Boolean(previousItem.saved)
          ? previousItem.savedChangedAt || (currentSaved ? currentAt : null)
          : currentAt,
      status: currentStatus,
      statusChangedAt:
        currentStatus === (previousItem.status || "wait")
          ? previousItem.statusChangedAt || (currentSaved ? previousItem.savedChangedAt || currentAt : null)
          : currentAt,
    };
    if (
      nextItem.saved ||
      nextItem.status === "reject" ||
      nextItem.savedChangedAt
    ) {
      items[productId] = nextItem;
    }
  });

  return { items };
}

export function buildContinuityWatchedItemsDomain(previous = state.continuity.shadow.watched_items) {
  const previousItems = normalizeContinuityWatchedItems(previous).items;
  const previousByIdentityKey = new Map(previousItems.map((item) => [item.identityKey, item]));
  const currentByIdentityKey = new Map();
  (state.watchedItems || []).forEach((item) => {
    const normalized = normalizeWatchedItem(item);
    if (!normalized || normalized.deletedAt) return;
    currentByIdentityKey.set(normalized.identityKey, normalized);
  });
  const allIdentityKeys = new Set([
    ...previousByIdentityKey.keys(),
    ...currentByIdentityKey.keys(),
  ]);
  const items = [];
  allIdentityKeys.forEach((identityKey) => {
    const currentItem = currentByIdentityKey.get(identityKey);
    const previousItem = previousByIdentityKey.get(identityKey);
    if (currentItem) {
      const samePayload =
        previousItem &&
        stableJsonStringify({
          eventRules: previousItem.eventRules,
          thresholds: previousItem.thresholds,
          delivery: previousItem.delivery,
          mutedUntil: previousItem.mutedUntil,
          preferredRetailer: previousItem.preferredRetailer,
          seedOfferId: previousItem.seedOfferId,
          deletedAt: previousItem.deletedAt,
        }) ===
          stableJsonStringify({
            eventRules: currentItem.eventRules,
            thresholds: currentItem.thresholds,
            delivery: currentItem.delivery,
            mutedUntil: currentItem.mutedUntil,
            preferredRetailer: currentItem.preferredRetailer,
            seedOfferId: currentItem.seedOfferId,
            deletedAt: null,
          });
      items.push({
        ...currentItem,
        createdAt: previousItem?.createdAt || currentItem.createdAt || nowIso(),
        updatedAt: samePayload ? previousItem?.updatedAt || currentItem.updatedAt : currentItem.updatedAt || nowIso(),
        deletedAt: null,
      });
      return;
    }
    if (previousItem) {
      items.push({
        ...previousItem,
        deletedAt: previousItem.deletedAt || nowIso(),
        updatedAt: previousItem.deletedAt ? previousItem.updatedAt : nowIso(),
      });
    }
  });
  return normalizeContinuityWatchedItems({ items });
}

export function buildContinuitySavedCollectionDomain(currentEntries, previousDomain, valueKey) {
  const previousEntries = normalizeContinuitySavedEntries(previousDomain, valueKey).entries;
  const previousById = new Map(previousEntries.map((entry) => [entry.id, entry]));
  const currentAt = nowIso();
  const nextById = new Map();

  currentEntries.forEach((entry) => {
    if (!entry?.id) return;
    const previousEntry = previousById.get(entry.id);
    const nextEntry = {
      id: String(entry.id),
      label: String(entry.label || ""),
      savedAt: toIsoTimestamp(entry.savedAt, previousEntry?.savedAt || currentAt),
      updatedAt: toIsoTimestamp(entry.updatedAt, previousEntry?.updatedAt || currentAt),
      deletedAt: null,
      [valueKey]: entry[valueKey] && typeof entry[valueKey] === "object" ? deepCopy(entry[valueKey]) : {},
    };
    if (
      previousEntry &&
      !previousEntry.deletedAt &&
      stableJsonStringify({
        label: previousEntry.label,
        savedAt: previousEntry.savedAt,
        [valueKey]: previousEntry[valueKey],
      }) ===
        stableJsonStringify({
          label: nextEntry.label,
          savedAt: nextEntry.savedAt,
          [valueKey]: nextEntry[valueKey],
        })
    ) {
      nextEntry.updatedAt = previousEntry.updatedAt;
    } else if (!entry.updatedAt) {
      nextEntry.updatedAt = currentAt;
    }
    nextById.set(nextEntry.id, nextEntry);
  });

  previousEntries.forEach((entry) => {
    if (nextById.has(entry.id)) return;
    nextById.set(entry.id, {
      ...deepCopy(entry),
      deletedAt: entry.deletedAt || currentAt,
      updatedAt: entry.deletedAt ? entry.updatedAt : currentAt,
    });
  });

  return {
    entries: [...nextById.values()].sort(
      (left, right) =>
        parseTimestamp(right.updatedAt)?.getTime() - parseTimestamp(left.updatedAt)?.getTime() ||
        parseTimestamp(right.savedAt)?.getTime() - parseTimestamp(left.savedAt)?.getTime() ||
        String(left.id).localeCompare(String(right.id)),
    ),
  };
}

export function buildContinuitySavedArticlesDomain(previous = state.continuity.shadow.saved_articles) {
  const previousEntries = normalizeContinuitySavedEntries(previous, "article").entries;
  const previousById = new Map(previousEntries.map((entry) => [entry.id, entry]));
  const currentEntries = state.savedArticleIds
    .filter(Boolean)
    .map((articleId) => {
      const previousEntry = previousById.get(articleId);
      const article = articleCatalog.find((entry) => entry.id === articleId);
      return {
        id: articleId,
        label: article?.title || previousEntry?.label || articleId,
        savedAt: previousEntry?.savedAt || null,
        updatedAt: previousEntry?.updatedAt || null,
        article: {
          articleId,
          group: article?.group || previousEntry?.article?.group || null,
          retailer: article?.retailer || previousEntry?.article?.retailer || null,
        },
      };
    });
  return buildContinuitySavedCollectionDomain(currentEntries, previous, "article");
}

export function buildContinuityRoutineSessionDomain() {
  return {
    draftId: state.routinePlanner.draftId || null,
    concern: state.routineConcern,
    timing: state.routineTime,
    budgetLane: state.routineBudget,
    profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
    sensitivity: state.userProfile.sensitivity || "moderate",
    activesComfort: state.userProfile.activesComfort || "medium",
    avoidIngredients: getRoutinePlannerAvoidIngredients(),
    draftState: getSerializableRoutineDraftState(),
    updatedAt: toIsoTimestamp(state.routinePlanner.sessionUpdatedAt || state.routinePlanner.draftUpdatedAt, null),
  };
}

export function buildContinuityShadowFromLocalState(previous = state.continuity.shadow) {
  return normalizeContinuityDomains({
    user_profile: buildContinuityUserProfileDomain(previous?.user_profile),
    shortlist: buildContinuityShortlistDomain(previous?.shortlist),
    watched_items: buildContinuityWatchedItemsDomain(previous?.watched_items),
    saved_articles: buildContinuitySavedArticlesDomain(previous?.saved_articles),
    saved_profiles: buildContinuitySavedCollectionDomain(state.savedProfiles, previous?.saved_profiles, "filters"),
    saved_routines: buildContinuitySavedCollectionDomain(state.savedRoutines, previous?.saved_routines, "config"),
    routine_session: buildContinuityRoutineSessionDomain(),
  });
}

export function applyContinuityDomainsToLocalState(
  domains,
  { skipContinuitySync = true, preservePendingLocalState = true } = {},
) {
  let normalized = normalizeContinuityDomains(domains);
  const remoteUserUpdatedAt = parseTimestamp(normalized.user_profile.clientUpdatedAt)?.getTime() || 0;
  const localUserUpdatedAt = parseTimestamp(state.userProfile.updatedAt)?.getTime() || 0;
  const remoteRoutineUpdatedAt = parseTimestamp(normalized.routine_session.updatedAt)?.getTime() || 0;
  const localRoutineUpdatedAt = parseTimestamp(state.routinePlanner.sessionUpdatedAt)?.getTime() || 0;
  const localSyncPending =
    preservePendingLocalState &&
    Boolean(state.continuity.pendingSync || state.continuity.syncTimer || state.continuity.syncPromise);
  const keepLocalUserProfile = localSyncPending || localUserUpdatedAt > remoteUserUpdatedAt;
  const keepLocalRoutineSession = localSyncPending || localRoutineUpdatedAt > remoteRoutineUpdatedAt;
  normalized = normalizeContinuityDomains({
    ...normalized,
    user_profile: keepLocalUserProfile
      ? buildContinuityUserProfileDomain(normalized.user_profile)
      : normalized.user_profile,
    routine_session: keepLocalRoutineSession
      ? buildContinuityRoutineSessionDomain()
      : normalized.routine_session,
  });
  state.continuity.applyingRemote = true;
  try {
    state.continuity.shadow = normalized;
    persistContinuityShadowState();

    state.userProfile = {
      ...state.userProfile,
      name: normalized.user_profile.name,
      budget: normalized.user_profile.budget,
      goal: normalized.user_profile.goal,
      goalSource: normalized.user_profile.goalSource || "default",
      profile: normalized.user_profile.profile,
      sensitivity: normalized.user_profile.sensitivity,
      activesComfort: normalized.user_profile.activesComfort,
      avoidIngredients: [...normalized.user_profile.avoidIngredients],
      updatedAt: normalized.user_profile.clientUpdatedAt,
    };
    state.profile = normalized.user_profile.profile || "all";
    state.routineConcern = normalized.user_profile.goal || state.routineConcern;
    state.favoriteIds = Object.entries(normalized.shortlist.items)
      .filter(([, item]) => item.saved)
      .sort(
        (left, right) =>
          parseTimestamp(right[1].savedChangedAt)?.getTime() - parseTimestamp(left[1].savedChangedAt)?.getTime() ||
          String(left[0]).localeCompare(String(right[0])),
      )
      .map(([productId]) => productId);
    state.shortlistStatuses = Object.fromEntries(
      Object.entries(normalized.shortlist.items)
        .filter(([, item]) => item.saved)
        .map(([productId, item]) => [productId, normalizeContinuityShortlistStatus(item.status)]),
    );
    state.watchedItems = normalizeContinuityWatchedItems(normalized.watched_items).items.filter((item) => !item.deletedAt);
    state.savedArticleIds = normalized.saved_articles.entries
      .filter((entry) => !entry.deletedAt)
      .map((entry) => entry.id);
    state.savedProfiles = normalized.saved_profiles.entries
      .filter((entry) => !entry.deletedAt)
      .slice(0, 6)
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        savedAt: entry.savedAt,
        updatedAt: entry.updatedAt,
        filters: deepCopy(entry.filters),
      }));
    state.savedRoutines = normalized.saved_routines.entries
      .filter((entry) => !entry.deletedAt)
      .slice(0, 6)
      .map((entry) => ({
        id: entry.id,
        label: entry.label,
        savedAt: entry.savedAt,
        updatedAt: entry.updatedAt,
        config: deepCopy(entry.config),
      }));
    const hasRoutineSession = Boolean(normalized.routine_session.updatedAt || normalized.routine_session.concern);
    state.routinePlanner.draftId = normalized.routine_session.draftId || null;
    state.routinePlanner.sessionUpdatedAt = normalized.routine_session.updatedAt || null;
    if (hasRoutineSession) {
      state.routineConcern = normalized.routine_session.concern || state.routineConcern;
      state.routineTime = normalized.routine_session.timing || state.routineTime;
      state.routineBudget = normalized.routine_session.budgetLane || state.routineBudget;
      state.profile = normalizeSkinProfile(normalized.routine_session.profile || state.profile);
      state.userProfile.profile = state.profile;
      state.userProfile.sensitivity = normalized.routine_session.sensitivity || state.userProfile.sensitivity;
      state.userProfile.activesComfort = normalized.routine_session.activesComfort || state.userProfile.activesComfort;
      state.userProfile.avoidIngredients = [...normalized.routine_session.avoidIngredients];
    }
    state.routineDraft =
      normalized.routine_session.draftState && typeof normalized.routine_session.draftState === "object"
        ? deepCopy(normalized.routine_session.draftState)
        : {};
    persistUserProfile({ skipContinuitySync });
    persistFavorites({ skipContinuitySync });
    persistShortlistStatuses({ skipContinuitySync });
    persistWatchedItems({ skipContinuitySync });
    persistSavedArticles({ skipContinuitySync });
    persistSavedProfiles({ skipContinuitySync });
    persistSavedRoutines({ skipContinuitySync });
    persistRoutinePlannerSession({ skipContinuitySync, preserveUpdatedAt: true });
    renderSnapshot();
  } finally {
    state.continuity.applyingRemote = false;
  }
}

export function updateContinuityShadowFromLocalState({ scheduleSync = true, force = false } = {}) {
  if (state.continuity.applyingRemote) return;
  const nextShadow = buildContinuityShadowFromLocalState(state.continuity.shadow);
  if (!force && stableJsonStringify(nextShadow) === stableJsonStringify(state.continuity.shadow)) {
    return;
  }
  state.continuity.shadow = nextShadow;
  persistContinuityShadowState();
  if (scheduleSync) {
    scheduleContinuitySync();
  }
}

function coerceContinuityVersion(value) {
  const version = Number(value);
  return Number.isInteger(version) && version >= 0 ? version : 0;
}

export function mergeContinuityVersions(currentVersions, incomingVersions) {
  const current = normalizeContinuityVersions(currentVersions);
  const incoming = normalizeContinuityVersions(incomingVersions);
  return Object.fromEntries(
    [...new Set([...Object.keys(current), ...Object.keys(incoming)])].map((domain) => [
      domain,
      Math.max(coerceContinuityVersion(current[domain]), coerceContinuityVersion(incoming[domain])),
    ]),
  );
}

export function hasRegressiveContinuityVersion(currentVersions, incomingVersions) {
  const current = normalizeContinuityVersions(currentVersions);
  const incoming = normalizeContinuityVersions(incomingVersions);
  return Object.keys(current).some(
    (domain) => coerceContinuityVersion(incoming[domain]) < coerceContinuityVersion(current[domain]),
  );
}

export function drainDeferredContinuityRefresh() {
  if (!state.continuity.remoteRefreshPending) return;
  if (state.continuity.bootstrapping || state.continuity.pairingBusy || state.continuity.dataActionBusy) return;
  state.continuity.remoteRefreshPending = false;
  if (!state.live.apiBacked || !state.continuity.token) return;
  void refreshContinuityInPlace();
}

export async function fetchContinuityStateFromServer({ applyRemote = true } = {}) {
  if (!state.live.apiBacked || !state.continuity.token) return null;
  const sessionBeforeRequest = {
    token: state.continuity.token,
    workspaceId: state.continuity.workspaceId,
    deviceId: state.continuity.deviceId,
  };
  const shadowSignatureBeforeRequest = stableJsonStringify(state.continuity.shadow);
  const payload = await fetchJson("/api/continuity-state");
  const continuitySessionChanged =
    state.continuity.token !== sessionBeforeRequest.token ||
    state.continuity.workspaceId !== sessionBeforeRequest.workspaceId ||
    state.continuity.deviceId !== sessionBeforeRequest.deviceId;
  const continuitySessionTransitioning = Boolean(
    state.continuity.bootstrapping ||
      state.continuity.pairingBusy ||
      state.continuity.dataActionBusy,
  );
  if (continuitySessionChanged || continuitySessionTransitioning) {
    if (!state.continuity.dataActionBusy) {
      state.continuity.remoteRefreshPending = true;
      drainDeferredContinuityRefresh();
    }
    return null;
  }
  const responseHasRegressiveVersion = hasRegressiveContinuityVersion(
    state.continuity.versions,
    payload.versions,
  );
  const localShadowChanged = stableJsonStringify(state.continuity.shadow) !== shadowSignatureBeforeRequest;
  const localSyncPending = Boolean(
    state.continuity.pendingSync ||
      state.continuity.syncTimer ||
      state.continuity.syncPromise ||
      state.continuity.syncing,
  );
  const deferRemoteApply = responseHasRegressiveVersion || localShadowChanged || localSyncPending;
  state.continuity.available = true;
  state.continuity.workspaceId = payload.workspaceId || state.continuity.workspaceId;
  state.continuity.deviceId = payload.deviceId || state.continuity.deviceId;
  state.continuity.error = null;
  if (!deferRemoteApply) {
    state.continuity.versions = mergeContinuityVersions(state.continuity.versions, payload.versions);
  }
  if (applyRemote && !deferRemoteApply) {
    applyContinuityDomainsToLocalState(payload.domains || {});
  }
  persistContinuitySessionState();
  if (applyRemote && deferRemoteApply) {
    scheduleContinuitySync({ immediate: true });
  }
  return payload;
}

export async function refreshContinuityInPlace() {
  if (!state.live.apiBacked || !state.continuity.token) return null;
  if (state.continuity.bootstrapping || state.continuity.pairingBusy) {
    state.continuity.remoteRefreshPending = true;
    return null;
  }
  if (state.continuity.dataActionBusy) {
    return null;
  }
  try {
    const payload = await fetchContinuityStateFromServer({ applyRemote: true });
    if (!payload) return null;
    state.continuity.statusNote = state.continuity.syncPromise
      ? "Local changes are syncing before paired-device updates are applied."
      : "Saved state was refreshed from a paired device.";
    return payload;
  } catch (error) {
    state.continuity.error = error;
    state.continuity.statusNote = "This device is staying local-first until shared sync catches up.";
    return null;
  } finally {
    renderContinuityCard();
  }
}

export async function syncContinuityNow() {
  if (!state.live.apiBacked || !state.continuity.token) return null;
  if (state.continuity.syncPromise) {
    state.continuity.pendingSync = true;
    return state.continuity.syncPromise;
  }
  state.continuity.error = null;
  state.continuity.syncPromise = (async () => {
    let latestPayload = null;
    try {
      do {
        state.continuity.syncing = true;
        state.continuity.pendingSync = false;
        const syncDomains = deepCopy(state.continuity.shadow);
        const syncDomainsSignature = stableJsonStringify(syncDomains);
        const payload = await postJson("/api/continuity-sync", {
          baseVersions: state.continuity.versions,
          domains: syncDomains,
        });
        state.continuity.available = true;
        state.continuity.workspaceId = payload.workspaceId || state.continuity.workspaceId;
        state.continuity.deviceId = payload.deviceId || state.continuity.deviceId;
        state.continuity.versions = normalizeContinuityVersions(payload.versions);
        const localShadowChanged = stableJsonStringify(state.continuity.shadow) !== syncDomainsSignature;
        if (localShadowChanged) {
          state.continuity.pendingSync = true;
          persistContinuityShadowState();
        } else {
          applyContinuityDomainsToLocalState(payload.domains || {}, {
            preservePendingLocalState: false,
          });
        }
        persistContinuitySessionState();
        state.continuity.statusNote = "Shared state is current on this device.";
        latestPayload = payload;
        state.continuity.syncing = false;
        renderContinuityCard();
      } while (state.continuity.pendingSync);
      return latestPayload;
    } catch (error) {
      state.continuity.error = error;
      state.continuity.statusNote = state.live.apiBacked
        ? "This device is staying local-first until shared sync catches up."
        : "This device is staying local-first.";
      return null;
    } finally {
      state.continuity.syncing = false;
      state.continuity.syncPromise = null;
      renderContinuityCard();
    }
  })();
  return state.continuity.syncPromise;
}

export function getContinuityStatusState() {
  if (!state.live.apiBacked) return "local";
  if (state.continuity.error) return "warning";
  if (
    state.continuity.syncing ||
    state.continuity.bootstrapping ||
    state.continuity.pairingBusy ||
    state.continuity.dataActionBusy
  ) {
    return "working";
  }
  return state.continuity.available ? "ready" : "idle";
}

export function getContinuityExpiryLabel(expiresAt) {
  const expires = parseTimestamp(expiresAt);
  if (!expires) return "Create a short code on one device, then enter it on another.";
  const minutesLeft = Math.ceil((expires.getTime() - Date.now()) / 60_000);
  if (minutesLeft <= 0) return "Code expired. Create a fresh one on the device you want to keep.";
  return minutesLeft === 1 ? "Code expires in 1 minute." : `Code expires in ${minutesLeft} minutes.`;
}

export function renderContinuityCard() {
  if (!continuityCard) return;
  const pairCodeExpires = parseTimestamp(state.continuity.pairCodeExpiresAt);
  if (state.continuity.pairCode && (!pairCodeExpires || pairCodeExpires.getTime() <= Date.now())) {
    state.continuity.pairCode = null;
    state.continuity.pairCodeExpiresAt = null;
  }

  const canPair = Boolean(state.live.apiBacked && state.continuity.token);
  const busy = Boolean(
    state.continuity.bootstrapping ||
      state.continuity.syncing ||
      state.continuity.pairingBusy ||
      state.continuity.dataActionBusy,
  );
  continuityCard.dataset.state = getContinuityStatusState();

  if (continuityStatusCopy) {
    if (!state.live.apiBacked) {
      continuityStatusCopy.textContent = "Saved state is staying local on this browser right now.";
    } else if (state.continuity.available) {
      continuityStatusCopy.textContent = "Saved state can follow this device across paired browsers.";
    } else {
      continuityStatusCopy.textContent = "This browser is ready to pair once saved state exists.";
    }
  }

  if (continuityStatusMeta) {
    continuityStatusMeta.textContent =
      state.continuity.statusNote ||
      (!state.live.apiBacked
        ? "The current local-first behavior stays in place whenever the API is unavailable."
        : "Profiles, shortlist choices, tracking, saved routines, and routine progress can merge across paired devices.");
  }

  if (continuityPairCode) {
    continuityPairCode.hidden = !state.continuity.pairCode;
    continuityPairCode.textContent = state.continuity.pairCode || "";
  }

  if (continuityPairExpires) {
    continuityPairExpires.textContent = state.continuity.pairCode
      ? getContinuityExpiryLabel(state.continuity.pairCodeExpiresAt)
      : "Create a short code on one device, then enter it on another.";
  }

  if (continuityCreateCodeButton) {
    continuityCreateCodeButton.disabled = !canPair || busy;
    continuityCreateCodeButton.textContent = state.continuity.pairCode ? "Refresh code" : "Show code";
  }

  if (continuityJoinToggleButton) {
    continuityJoinToggleButton.disabled = !state.live.apiBacked || busy;
    continuityJoinToggleButton.textContent = state.continuity.joinPanelOpen ? "Hide join" : "Join with code";
    continuityJoinToggleButton.setAttribute("aria-expanded", String(state.continuity.joinPanelOpen));
  }

  if (continuityJoinPanel) {
    continuityJoinPanel.hidden = !state.continuity.joinPanelOpen;
  }

  if (continuityJoinCodeInput) {
    if (continuityJoinCodeInput.value !== state.continuity.joinCode) {
      continuityJoinCodeInput.value = state.continuity.joinCode;
    }
    continuityJoinCodeInput.disabled = !state.live.apiBacked || busy;
  }

  if (continuityJoinSubmitButton) {
    continuityJoinSubmitButton.disabled = !state.live.apiBacked || busy || !String(state.continuity.joinCode || "").trim();
  }

  if (continuityJoinMessage) {
    continuityJoinMessage.textContent = state.continuity.joinMessage || "";
    continuityJoinMessage.hidden = !state.continuity.joinMessage;
  }

  if (continuityResetDataButton) {
    continuityResetDataButton.disabled = !canPair || busy;
    continuityResetDataButton.textContent =
      state.continuity.dataActionBusy === "reset" ? "Resetting…" : "Reset shared data";
  }

  if (continuityDeleteWorkspaceButton) {
    continuityDeleteWorkspaceButton.disabled = !canPair || busy;
    continuityDeleteWorkspaceButton.textContent =
      state.continuity.dataActionBusy === "delete" ? "Deleting…" : "Delete shared workspace";
  }

  if (continuityDataMessage) {
    continuityDataMessage.textContent = state.continuity.dataActionMessage || "";
    continuityDataMessage.hidden = !state.continuity.dataActionMessage;
    continuityDataMessage.dataset.state = state.continuity.dataActionBusy
      ? "working"
      : state.continuity.error
        ? "error"
        : "ready";
  }
}

export async function requestContinuityPairCode() {
  if (!state.live.apiBacked) return null;
  if (state.continuity.pairingBusy) return null;
  const continuityIdle = await waitForContinuityIdle();
  if (!continuityIdle) {
    state.continuity.statusNote = "Shared state is still loading on this browser.";
    renderContinuityCard();
    return null;
  }
  state.continuity.joinMessage = "";
  state.continuity.error = null;
  state.continuity.pairingBusy = true;
  renderContinuityCard();
  try {
    if (!state.continuity.token) {
      const bootstrapPayload = await bootstrapContinuity();
      if (!bootstrapPayload || !state.continuity.token) {
        return null;
      }
    }
    updateContinuityShadowFromLocalState({ scheduleSync: false, force: true });
    const syncPayload = await syncContinuityNow();
    if (!syncPayload && state.continuity.error) {
      state.continuity.statusNote = "Shared state needs to finish syncing before this pairing code can be created.";
      return null;
    }
    const payload = await postJson("/api/continuity/pair-code", {});
    state.continuity.available = true;
    state.continuity.workspaceId = payload.workspaceId || state.continuity.workspaceId;
    state.continuity.deviceId = payload.deviceId || state.continuity.deviceId;
    state.continuity.pairCode = payload.code || null;
    state.continuity.pairCodeExpiresAt = payload.expiresAt || null;
    state.continuity.statusNote = "Use this short code on the second device within the next few minutes.";
    persistContinuitySessionState();
    return payload;
  } catch (error) {
    state.continuity.error = error;
    state.continuity.statusNote = "This browser stayed local-first because the pairing code could not be created.";
    return null;
  } finally {
    state.continuity.pairingBusy = false;
    drainDeferredContinuityRefresh();
    renderContinuityCard();
  }
}

export async function waitForContinuityIdle(timeoutMs = CONTINUITY_BUSY_WAIT_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (state.continuity.bootstrapping || state.continuity.syncing) {
    if (Date.now() >= deadline) {
      return false;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return true;
}

export async function claimContinuityPairCode() {
  if (!state.live.apiBacked) return null;
  if (state.continuity.pairingBusy) return null;
  const continuityIdle = await waitForContinuityIdle();
  if (!continuityIdle) {
    state.continuity.joinMessage = "Shared state is still loading on this browser. Try the code again in a moment.";
    renderContinuityCard();
    return null;
  }
  const normalizedCode = String(state.continuity.joinCode || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  if (!normalizedCode) {
    state.continuity.joinMessage = "Enter the 8-character code from the device you want to keep.";
    renderContinuityCard();
    return null;
  }

  state.continuity.joinCode = normalizedCode;
  state.continuity.joinMessage = "";
  state.continuity.error = null;
  state.continuity.pairingBusy = true;
  renderContinuityCard();
  try {
    updateContinuityShadowFromLocalState({ scheduleSync: false, force: true });
    const payload = await postJson("/api/continuity/claim", {
      code: normalizedCode,
      domains: state.continuity.shadow,
    });
    state.continuity.available = true;
    state.continuity.token = payload.token || state.continuity.token;
    state.continuity.workspaceId = payload.workspaceId || state.continuity.workspaceId;
    state.continuity.deviceId = payload.deviceId || state.continuity.deviceId;
    state.continuity.versions = normalizeContinuityVersions(payload.versions);
    state.continuity.shadow = normalizeContinuityDomains(payload.domains || {});
    state.continuity.pairCode = null;
    state.continuity.pairCodeExpiresAt = null;
    state.continuity.joinPanelOpen = false;
    state.continuity.joinCode = "";
    state.continuity.joinMessage = "This browser is now using the shared saved state.";
    state.continuity.statusNote = "Local state was merged into the shared device workspace.";
    persistContinuitySessionState();
    applyContinuityDomainsToLocalState(payload.domains || {});
    return payload;
  } catch (error) {
    state.continuity.error = error;
    state.continuity.joinMessage = "That code did not work. Create a fresh code on the paired device and try again.";
    state.continuity.statusNote = "This browser stayed local-first because the join code was not accepted.";
    return null;
  } finally {
    state.continuity.pairingBusy = false;
    drainDeferredContinuityRefresh();
    renderContinuityCard();
  }
}

export function clearSkinCareHubBrowserStorage() {
  for (const storageName of ["localStorage", "sessionStorage"]) {
    try {
      const storage = window[storageName];
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (String(key || "").startsWith("skincare-hub-")) {
          keys.push(key);
        }
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      // Keep the confirmed server action even if browser storage is unavailable.
    }
  }
}

export function resetCurrentBrowserWorkspaceState(continuityPayload = null) {
  clearSkinCareHubBrowserStorage();
  state.profile = "all";
  state.routineConcern = "dryness";
  state.routineTime = "am";
  state.routineBudget = "smart";
  state.userProfile = {
    name: "",
    budget: "any",
    goal: "dryness",
    goalSource: "default",
    profile: "all",
    sensitivity: "moderate",
    activesComfort: "medium",
    avoidIngredients: [],
  };
  state.favoriteIds = [];
  state.shortlistStatuses = {};
  state.watchedItems = [];
  state.legacyTrackedAlertIds = [];
  state.savedArticleIds = [];
  state.savedProfiles = [];
  state.savedRoutines = [];
  state.routineDraft = {};
  state.routinePlanner = createRoutinePlannerState();
  state.conversion.currentRoutineEntries = [];
  state.conversion.baskets = {
    routine: { requestKey: null, payload: null, loading: false, error: null },
    shortlist: { requestKey: null, payload: null, loading: false, error: null },
  };
  state.conversion.notificationCenter = {
    requestKey: null,
    payload: null,
    loading: false,
    error: null,
    lastBrowserAlertIds: [],
  };
  state.continuity = continuityPayload
    ? createContinuityState({
        available: true,
        token: continuityPayload.token || null,
        workspaceId: continuityPayload.workspaceId || null,
        deviceId: continuityPayload.deviceId || null,
        versions: normalizeContinuityVersions(continuityPayload.versions),
        shadow: normalizeContinuityDomains(continuityPayload.domains || {}),
        dataActionMessage: "Shared data and this browser were reset.",
      })
    : createContinuityState({
        dataActionMessage: "The shared workspace and this browser were deleted.",
      });
  if (continuityPayload) {
    persistContinuitySessionState();
    persistContinuityShadowState();
  }
  try {
    renderSnapshot();
  } catch {
    // The confirmed privacy action remains authoritative if an in-page render fails.
  }
}

export function continuityDataActionErrorMessage(error, action) {
  const code = String(error?.code || "");
  if (["rate-limit", "concurrency-limit", "daily-limit"].includes(code)) {
    return "Too many shared-state requests. Try again later; this browser remains local-first.";
  }
  if (code === "workspace-size-quota") {
    return "This anonymous workspace has reached its storage limit. Reset the workspace to start fresh.";
  }
  if (code.includes("quota")) {
    return "This anonymous workspace has reached a safety limit. Reset it, or remove an active item when that control is available.";
  }
  if (code === "invalid-token") {
    return "The server session is no longer available. Data stored in this browser remains local.";
  }
  if (action === "delete") {
    return "Workspace deletion was not confirmed, so data in this browser was kept.";
  }
  return "Shared data could not be reset. Data in this browser was kept.";
}

export async function resetContinuityData() {
  if (!state.live.apiBacked || !state.continuity.token || state.continuity.dataActionBusy) return null;
  const confirmed = window.confirm(
    "Reset shared data? This clears the server copy, disconnects paired browsers, and clears SkinCare Hub data in this browser. Other browsers may keep offline copies.",
  );
  if (!confirmed) return null;
  const continuityIdle = await waitForContinuityIdle();
  if (!continuityIdle) {
    state.continuity.dataActionMessage = "Shared state is still syncing. Try reset again in a moment.";
    renderContinuityCard();
    return null;
  }

  state.continuity.dataActionBusy = "reset";
  state.continuity.dataActionMessage = "Resetting the shared workspace and this browser…";
  state.continuity.error = null;
  renderContinuityCard();
  try {
    const payload = await postJson("/api/continuity/reset", {});
    resetCurrentBrowserWorkspaceState(payload);
    return payload;
  } catch (error) {
    state.continuity.error = error;
    state.continuity.dataActionMessage = continuityDataActionErrorMessage(error, "reset");
    return null;
  } finally {
    state.continuity.dataActionBusy = null;
    renderContinuityCard();
  }
}

export async function deleteContinuityData() {
  if (!state.live.apiBacked || !state.continuity.token || state.continuity.dataActionBusy) return null;
  const confirmed = window.confirm(
    "Delete this shared workspace? The server copy and paired access will be removed, and SkinCare Hub data in this browser will be cleared. Other browsers may keep offline copies.",
  );
  if (!confirmed) return null;
  const continuityIdle = await waitForContinuityIdle();
  if (!continuityIdle) {
    state.continuity.dataActionMessage = "Shared state is still syncing. Try deletion again in a moment.";
    renderContinuityCard();
    return null;
  }

  state.continuity.dataActionBusy = "delete";
  state.continuity.dataActionMessage = "Deleting the shared workspace and clearing this browser…";
  state.continuity.error = null;
  renderContinuityCard();
  try {
    const payload = await deleteJson("/api/continuity/workspace");
    resetCurrentBrowserWorkspaceState();
    return payload;
  } catch (error) {
    state.continuity.error = error;
    state.continuity.dataActionMessage = continuityDataActionErrorMessage(error, "delete");
    return null;
  } finally {
    state.continuity.dataActionBusy = null;
    renderContinuityCard();
  }
}

export function scheduleContinuitySync({ immediate = false } = {}) {
  if (!state.live.apiBacked || !state.continuity.token) return;
  if (state.continuity.applyingRemote) return;
  if (state.continuity.syncing || state.continuity.syncPromise) {
    state.continuity.pendingSync = true;
    return;
  }
  if (state.continuity.syncTimer) {
    window.clearTimeout(state.continuity.syncTimer);
    state.continuity.syncTimer = null;
  }
  if (immediate) {
    void syncContinuityNow();
    return;
  }
  state.continuity.syncTimer = window.setTimeout(() => {
    state.continuity.syncTimer = null;
    void syncContinuityNow();
  }, CONTINUITY_SYNC_DEBOUNCE_MS);
}

export async function bootstrapContinuity() {
  if (!state.live.apiBacked) return null;
  state.continuity.bootstrapping = true;
  renderContinuityCard();
  try {
    updateContinuityShadowFromLocalState({ scheduleSync: false, force: true });
    const payload = await postJson("/api/continuity/bootstrap", {});
    state.continuity.available = true;
    state.continuity.token = payload.token || state.continuity.token;
    state.continuity.workspaceId = payload.workspaceId || state.continuity.workspaceId;
    state.continuity.deviceId = payload.deviceId || state.continuity.deviceId;
    state.continuity.versions = normalizeContinuityVersions(payload.versions);
    persistContinuitySessionState();
    const shouldSeedOrMergeLocal = hasMeaningfulContinuityShadow(state.continuity.shadow);
    if (shouldSeedOrMergeLocal) {
      await syncContinuityNow();
    } else {
      applyContinuityDomainsToLocalState(payload.domains || {});
    }
    state.continuity.statusNote = payload.sessionReplaced
      ? "The previous server copy expired or was deleted. Browser data stayed local and now uses a new anonymous workspace."
      : "This device can share saved state across paired devices.";
    return payload;
  } catch (error) {
    state.continuity.error = error;
    state.continuity.statusNote = "This device is staying local-first right now.";
    return null;
  } finally {
    state.continuity.bootstrapping = false;
    drainDeferredContinuityRefresh();
    renderContinuityCard();
  }
}

function persistLocalStorageValue(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeLocalStorageValue(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function persistFavorites({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue("skincare-hub-favorites", state.favoriteIds);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistShortlistStatuses({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue(SHORTLIST_STATUS_STORAGE_KEY, state.shortlistStatuses);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistTrackedAlertIds({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue(TRACKED_ALERTS_STORAGE_KEY, state.legacyTrackedAlertIds || []);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistWatchedItems({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue(WATCHED_ITEMS_STORAGE_KEY, state.watchedItems);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistSavedArticles({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue("skincare-hub-articles", state.savedArticleIds);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistSavedProfiles({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue("skincare-hub-profiles", state.savedProfiles);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistSavedRoutines({ skipContinuitySync = false } = {}) {
  persistLocalStorageValue("skincare-hub-routines", state.savedRoutines);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function persistUserProfile({ skipContinuitySync = false, preserveUpdatedAt = false } = {}) {
  if (!preserveUpdatedAt || !state.userProfile.updatedAt) {
    state.userProfile.updatedAt = nowIso();
  }
  persistLocalStorageValue("skincare-hub-user-profile", state.userProfile);
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function getShortlistStatus(productId) {
  return getNormalizedShortlistStatusValue(state.shortlistStatuses[productId]);
}

export function ensureShortlistStatuses(ids = [], { defaultStatus = null } = {}) {
  const nextStatuses = { ...state.shortlistStatuses };
  const normalizedDefaultStatus = SHORTLIST_STATUS_LABELS[defaultStatus] ? defaultStatus : null;
  let changed = false;
  ids.forEach((id) => {
    if (!id || nextStatuses[id]) return;
    nextStatuses[id] = normalizedDefaultStatus || getDefaultShortlistStatusForNewSave(nextStatuses, state.favoriteIds);
    changed = true;
  });
  if (changed) {
    state.shortlistStatuses = nextStatuses;
    persistShortlistStatuses();
  }
}

export function setShortlistStatus(productId, status) {
  if (!productId || !SHORTLIST_STATUS_LABELS[status]) return;
  const previousStatus = getShortlistStatus(productId);
  state.shortlistStatuses[productId] = status;
  normalizeShortlistDecisionStatuses({
    preferredCoreId: status === "core" ? productId : null,
    preferredBackupId: status === "optional" ? productId : null,
    fillSlots: false,
    favorPreviousCoreAsBackup: status === "core" && previousStatus !== "core",
  });
  persistShortlistStatuses();
  renderFavorites();
  renderProducts();
  renderRoutineBuilder();
}

export function getActionableShortlistProducts() {
  return state.favoriteIds
    .map((id) => getProductById(id))
    .filter(Boolean)
    .filter((product) => SHORTLIST_ACTIONABLE_STATUSES.has(getShortlistStatus(product.id)));
}

export function isActionableShortlistProduct(productOrId) {
  const productId = typeof productOrId === "string" ? productOrId : productOrId?.id;
  return Boolean(productId) && SHORTLIST_ACTIONABLE_STATUSES.has(getShortlistStatus(productId));
}

export function getComparisonKeyForProduct(productOrId) {
  const product = typeof productOrId === "string" ? getProductById(productOrId) : productOrId;
  if (!product) return null;
  return String(getComparableProductKey(product) || product.comparisonKey || product.id || "").trim() || null;
}

export function getFirstProductIdForComparisonKey(comparisonKey) {
  return state.products.find((product) => getComparisonKeyForProduct(product) === comparisonKey)?.id || null;
}

export function getActiveWatchedItems() {
  return (state.watchedItems || []).filter((item) => item && !item.deletedAt);
}

export function getWatchByComparisonKey(comparisonKey) {
  return getActiveWatchedItems().find((item) => item.comparisonKey === comparisonKey) || null;
}

export function getWatchByIdentityKey(identityKey) {
  return getActiveWatchedItems().find((item) => item.identityKey === identityKey) || null;
}

export function getWatchIdentityForProduct(product) {
  return String(
    product?.canonicalProductId ||
      product?.id ||
      getComparisonKeyForProduct(product) ||
      "",
  ).trim() || null;
}

export function isProductInWatchExactPartition(product, watch) {
  if (!product || !watch) return false;
  const comparisonKey = getComparisonKeyForProduct(product);
  if (!comparisonKey || comparisonKey !== watch.comparisonKey) return false;
  const seedProduct = watch.seedOfferId
    ? getProductById(watch.seedOfferId)
    : null;
  if (!seedProduct) return false;
  const productId = String(product.id || "").trim();
  const seedProductId = String(seedProduct.id || "").trim();
  return (
    Boolean(productId) &&
    productId === seedProductId
  ) || getRetailerEquivalentIdentityRelation(seedProduct, product) === "exact";
}

export function getLocalExactOffersForWatch(watch) {
  if (!watch?.seedOfferId) return [];
  return state.products.filter(
    (product) => isProductInWatchExactPartition(product, watch),
  );
}

export function getWatchForProductId(productId) {
  const product = getProductById(productId);
  const comparisonKey = getComparisonKeyForProduct(product);
  const identityKey = getWatchIdentityForProduct(product);
  const activeWatches = getActiveWatchedItems();
  const watch =
    activeWatches.find((item) => item.identityKey === identityKey) ||
    activeWatches.find(
      (item) =>
        comparisonKey &&
        item.comparisonKey === comparisonKey &&
        isProductInWatchExactPartition(product, item),
    ) ||
    null;
  return isProductInWatchExactPartition(product, watch) ? watch : null;
}

export function createWatchFromProductId(productId, { source = "manual", previous = null } = {}) {
  const product = getProductById(productId);
  const comparisonKey = getComparisonKeyForProduct(product);
  if (!product || !comparisonKey) return null;
  const base =
    previous &&
    previous.comparisonKey === comparisonKey &&
    isProductInWatchExactPartition(product, previous)
      ? previous
      : null;
  const identityKey = getWatchIdentityForProduct(product);
  if (!identityKey) return null;
  const timestamp = nowIso();
  return normalizeWatchedItem({
    id: base?.id || `watch-${identityKey}`,
    comparisonKey,
    identityKey,
    scopeType: "exact-product-group",
    seedOfferId: product.id,
    preferredRetailer: product.retailer || base?.preferredRetailer || null,
    eventRules: base?.eventRules || createDefaultWatchEventRules(),
    thresholds: base?.thresholds || createDefaultWatchThresholds(),
    delivery: base?.delivery || createDefaultWatchDelivery(),
    mutedUntil: base?.mutedUntil || null,
    source: base?.source || source,
    createdAt: base?.createdAt || timestamp,
    updatedAt: timestamp,
    deletedAt: null,
  });
}

export function upsertLocalWatchItem(watchItem, { skipContinuitySync = false } = {}) {
  const normalized = normalizeWatchedItem(watchItem);
  if (!normalized) return null;
  const nextItems = getActiveWatchedItems().filter(
    (item) => item.identityKey !== normalized.identityKey,
  );
  state.watchedItems = [normalized, ...nextItems].sort(
    (left, right) =>
      parseTimestamp(right.updatedAt)?.getTime() - parseTimestamp(left.updatedAt)?.getTime() ||
      String(left.comparisonKey).localeCompare(String(right.comparisonKey)),
  );
  persistWatchedItems({ skipContinuitySync });
  return normalized;
}

export function removeLocalWatchItem(identityKey, { skipContinuitySync = false } = {}) {
  state.watchedItems = getActiveWatchedItems().filter((item) => item.identityKey !== identityKey);
  persistWatchedItems({ skipContinuitySync });
}

export function migrateLegacyWatchedItems() {
  if (getActiveWatchedItems().length) return;
  const seenComparisonKeys = new Set();
  const migrated = [];
  [...state.favoriteIds, ...(state.legacyTrackedAlertIds || [])].forEach((productId) => {
    const product = getProductById(productId);
    const comparisonKey = getComparisonKeyForProduct(product);
    if (!product || !comparisonKey || seenComparisonKeys.has(comparisonKey)) return;
    seenComparisonKeys.add(comparisonKey);
    migrated.push(
      createWatchFromProductId(product.id, {
        source: (state.legacyTrackedAlertIds || []).includes(product.id) ? "legacy-tracked" : "legacy-favorite",
      }),
    );
  });
  state.watchedItems = migrated.filter(Boolean);
  persistWatchedItems({ skipContinuitySync: true });
  removeLocalStorageValue(TRACKED_ALERTS_STORAGE_KEY);
  state.legacyTrackedAlertIds = [];
}

export function getNotificationCenterPayload() {
  return state.conversion.notificationCenter.payload || buildLocalTrackedAlertsPayload();
}

export function getNotificationQuietHours() {
  return getNotificationCenterPayload()?.settings?.quietHours || createDefaultQuietHours();
}

export function toDatetimeLocalValue(isoValue) {
  const parsed = parseTimestamp(isoValue);
  if (!parsed) return "";
  const pad = (value) => String(value).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function fromDatetimeLocalValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function getWatchDialogProduct() {
  return state.ui.watchDialogProductId ? getProductById(state.ui.watchDialogProductId) : null;
}

export function getWatchDialogWatch() {
  const product = getWatchDialogProduct();
  return product ? getWatchForProductId(product.id) : null;
}

export function syncWatchSettingsForm() {
  if (!watchSettingsDialog || !watchSettingsForm) return;
  const product = getWatchDialogProduct();
  const watch = getWatchDialogWatch();
  const quietHours = getNotificationQuietHours();
  const deliveryAvailability = getNotificationCenterPayload()?.settings?.deliveryAvailability || { push: false, email: false };
  const publicShowcase = document.documentElement.dataset.publicShowcase === "true";
  const emailEndpoint = getNotificationCenterPayload()?.emailEndpoint || null;
  const effectiveWatch = watch || createWatchFromProductId(product?.id, { source: "manual" });
  if (!effectiveWatch || !product) return;
  watchSettingsDialog.hidden = false;
  watchSettingsCopy.textContent = `${product.brand} ${product.name} across exact same-product offers.`;
  ["priceDrop", "lowestTracked", "backInStock", "limitedStock", "backorder", "preorder", "discontinued"].forEach((ruleKey) => {
    const input = watchSettingsForm.elements.namedItem(ruleKey);
    if (input) {
      input.checked = Boolean(effectiveWatch.eventRules?.[ruleKey]);
    }
  });
  watchTargetPriceInput.value = effectiveWatch.thresholds?.targetPrice ?? "";
  watchMinAbsoluteInput.value = effectiveWatch.thresholds?.minAbsoluteDrop ?? "";
  watchMinPercentInput.value = effectiveWatch.thresholds?.minPercentDrop ?? "";
  watchMutedUntilInput.value = toDatetimeLocalValue(effectiveWatch.mutedUntil);
  const delivery = effectiveWatch.delivery || createDefaultWatchDelivery();
  const inAppInput = watchSettingsForm.elements.namedItem("deliveryInApp");
  const pushInput = watchSettingsForm.elements.namedItem("deliveryPush");
  const emailInput = watchSettingsForm.elements.namedItem("deliveryEmail");
  if (inAppInput) inAppInput.checked = true;
  if (pushInput) {
    pushInput.checked = !publicShowcase && Boolean(delivery.push);
    pushInput.disabled = !deliveryAvailability.push;
  }
  if (emailInput) {
    emailInput.checked = Boolean(delivery.email);
    emailInput.disabled = !state.live.apiBacked;
  }
  watchSettingsDeliveryNote.textContent = [
    publicShowcase
      ? "Browser notifications are unavailable in the public showcase."
      : deliveryAvailability.push
        ? "Browser notifications can be enabled on this device."
        : "Browser notifications need permission and a supported browser.",
    publicShowcase
      ? "Email delivery is unavailable in the public showcase."
      : state.live.apiBacked
        ? "Email verification is available while the live API is running."
        : "Email verification requires the live API.",
  ].join(" ");
  watchQuietEnabledInput.checked = Boolean(quietHours.enabled);
  watchQuietStartInput.value = quietHours.startHour ?? 22;
  watchQuietEndInput.value = quietHours.endHour ?? 8;
  watchEmailInput.value = emailEndpoint?.email || "";
  watchEmailCodeInput.value = "";
  watchEmailStatus.textContent = emailEndpoint?.verifiedAt
    ? `Verified for ${emailEndpoint.email}.`
    : emailEndpoint?.verificationStartedAt
      ? `Verification started for ${emailEndpoint.email}.`
      : "Email delivery is off until you verify an address.";
  watchSettingsRemoveButton.hidden = !watch;
}

export function getWatchSettingsSheet() {
  return watchSettingsDialog?.querySelector(".watch-settings-sheet") || null;
}

export function getWatchSettingsRestoreTarget(productId = lastWatchSettingsTriggerProductId) {
  if (lastWatchSettingsTrigger?.isConnected && !lastWatchSettingsTrigger.disabled) {
    return lastWatchSettingsTrigger;
  }
  const normalizedProductId = String(productId || "").trim();
  if (!normalizedProductId) return null;
  return (
    Array.from(document.querySelectorAll("[data-watch-open], [data-track-id]")).find((element) => {
      if (!(element instanceof HTMLElement) || element.disabled) return false;
      return element.dataset.watchOpen === normalizedProductId || element.dataset.trackId === normalizedProductId;
    }) || null
  );
}

export function getWatchSettingsFocusableElements() {
  const sheet = getWatchSettingsSheet();
  if (!sheet || watchSettingsDialog?.hidden) return [];
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(sheet.querySelectorAll(focusableSelector)).filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hidden || element.closest("[hidden]")) return false;
    return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  });
}

export function trapWatchSettingsFocus(event) {
  if (watchSettingsDialog?.hidden || event.key !== "Tab") return false;
  const sheet = getWatchSettingsSheet();
  const focusable = getWatchSettingsFocusableElements();
  if (!focusable.length) {
    event.preventDefault();
    sheet?.focus({ preventScroll: true });
    return true;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  if (!activeElement || !sheet?.contains(activeElement)) {
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

export function closeWatchSettings({ restoreFocus = true, productId = null } = {}) {
  const restoreProductId = productId || state.ui.watchDialogProductId || lastWatchSettingsTriggerProductId;
  const restoreTarget = restoreFocus ? getWatchSettingsRestoreTarget(restoreProductId) : null;
  state.ui.watchDialogProductId = null;
  if (watchSettingsDialog) {
    watchSettingsDialog.hidden = true;
    watchSettingsDialog.setAttribute("aria-hidden", "true");
  }
  if (restoreFocus && restoreTarget) {
    requestAnimationFrame(() => {
      restoreTarget?.focus({ preventScroll: true });
      lastWatchSettingsTrigger = null;
      lastWatchSettingsTriggerProductId = null;
    });
  } else {
    lastWatchSettingsTrigger = null;
    lastWatchSettingsTriggerProductId = null;
  }
}

export function openWatchSettings(productId, { trigger = null } = {}) {
  const product = getProductById(productId);
  if (!product) return;
  const activeElement = document.activeElement;
  lastWatchSettingsTrigger = trigger instanceof HTMLElement ? trigger : activeElement instanceof HTMLElement ? activeElement : null;
  lastWatchSettingsTriggerProductId = product.id;
  state.ui.watchDialogProductId = product.id;
  syncWatchSettingsForm();
  if (watchSettingsDialog) {
    watchSettingsDialog.setAttribute("aria-hidden", "false");
  }
  requestAnimationFrame(() => {
    (watchSettingsCloseButton || getWatchSettingsSheet())?.focus({ preventScroll: true });
  });
}

export async function ensureBrowserNotificationPermission() {
  if (document.documentElement.dataset.publicShowcase === "true") return false;
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}

export function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export async function syncPushSubscriptionForDialog(pushEnabled) {
  if (document.documentElement.dataset.publicShowcase === "true") return;
  if (!pushEnabled || !state.live.apiBacked || !navigator.serviceWorker?.ready) return;
  const payload = getNotificationCenterPayload();
  const publicKey = payload?.settings?.pushConfig?.publicKey || null;
  if (!publicKey || !("PushManager" in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  await postJson("/api/push-subscriptions", {
    subscription: subscription.toJSON ? subscription.toJSON() : subscription,
    endpoint: subscription.endpoint,
    userAgent: navigator.userAgent,
  });
}

export function refreshTrackedAlertsAfterWatchWrite(productId) {
  void ensureTrackedAlerts(true).finally(() => {
    if (!watchSettingsDialog?.hidden || state.ui.watchDialogProductId) return;
    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (activeElement && activeElement !== document.body && activeElement !== document.documentElement) return;
    getWatchSettingsRestoreTarget(productId)?.focus({ preventScroll: true });
  });
}

export async function saveWatchSettings(event) {
  event?.preventDefault?.();
  const product = getWatchDialogProduct();
  if (!product) return;
  const restoreProductId = product.id;
  const currentWatch = getWatchDialogWatch();
  const nextWatch = createWatchFromProductId(product.id, { source: currentWatch?.source || "manual", previous: currentWatch });
  if (!nextWatch) return;
  const pushEnabled = Boolean(watchSettingsForm.elements.namedItem("deliveryPush")?.checked);
  const emailEnabled = Boolean(watchSettingsForm.elements.namedItem("deliveryEmail")?.checked);
  const browserPermissionOkay = pushEnabled ? await ensureBrowserNotificationPermission() : false;
  const payload = {
    ...nextWatch,
    eventRules: {
      priceDrop: Boolean(watchSettingsForm.elements.namedItem("priceDrop")?.checked),
      lowestTracked: Boolean(watchSettingsForm.elements.namedItem("lowestTracked")?.checked),
      backInStock: Boolean(watchSettingsForm.elements.namedItem("backInStock")?.checked),
      limitedStock: Boolean(watchSettingsForm.elements.namedItem("limitedStock")?.checked),
      backorder: Boolean(watchSettingsForm.elements.namedItem("backorder")?.checked),
      preorder: Boolean(watchSettingsForm.elements.namedItem("preorder")?.checked),
      discontinued: Boolean(watchSettingsForm.elements.namedItem("discontinued")?.checked),
    },
    thresholds: {
      targetPrice: normalizeWatchNumber(watchTargetPriceInput.value),
      minAbsoluteDrop: normalizeWatchNumber(watchMinAbsoluteInput.value),
      minPercentDrop: normalizeWatchNumber(watchMinPercentInput.value),
    },
    delivery: {
      inApp: true,
      push: pushEnabled && browserPermissionOkay,
      email: emailEnabled,
    },
    mutedUntil: fromDatetimeLocalValue(watchMutedUntilInput.value),
    workspaceSettings: {
      quietHours: {
        enabled: Boolean(watchQuietEnabledInput.checked),
        startHour: Number(watchQuietStartInput.value || 22),
        endHour: Number(watchQuietEndInput.value || 8),
      },
    },
  };
  if (state.live.apiBacked) {
    const savedWatch = await putJson(
      `/api/watches/${encodeURIComponent(payload.comparisonKey)}`,
      payload,
    );
    upsertLocalWatchItem(savedWatch, { skipContinuitySync: true });
    state.conversion.notificationCenter.requestKey = null;
    state.conversion.notificationCenter.payload = buildLocalTrackedAlertsPayload();
    state.conversion.notificationCenter.error = null;
    renderTrackedAlertsPanel();
    if (payload.delivery.push) {
      try {
        await syncPushSubscriptionForDialog(true);
      } catch {
        // Keep the watch saved even if push subscription setup fails.
      }
    }
  } else {
    upsertLocalWatchItem(payload);
    state.conversion.notificationCenter.payload = buildLocalTrackedAlertsPayload();
    renderTrackedAlertsPanel();
  }
  renderRoutineBuilder();
  renderFavorites();
  closeWatchSettings({ productId: restoreProductId });
  if (state.live.apiBacked) {
    refreshTrackedAlertsAfterWatchWrite(restoreProductId);
  }
}

export async function removeWatchSettings() {
  const product = getWatchDialogProduct();
  const watch = getWatchDialogWatch();
  if (!product || !watch) return;
  const restoreProductId = product.id;
  if (state.live.apiBacked) {
    await deleteJson(`/api/watches/${encodeURIComponent(watch.identityKey)}`);
    removeLocalWatchItem(watch.identityKey, { skipContinuitySync: true });
    state.conversion.notificationCenter.requestKey = null;
    state.conversion.notificationCenter.payload = buildLocalTrackedAlertsPayload();
    state.conversion.notificationCenter.error = null;
    renderTrackedAlertsPanel();
  } else {
    removeLocalWatchItem(watch.identityKey);
    state.conversion.notificationCenter.payload = buildLocalTrackedAlertsPayload();
  }
  renderRoutineBuilder();
  renderFavorites();
  renderTrackedAlertsPanel();
  closeWatchSettings({ productId: restoreProductId });
  if (state.live.apiBacked) {
    refreshTrackedAlertsAfterWatchWrite(restoreProductId);
  }
}

export async function startNotificationEmailFromDialog() {
  if (!state.live.apiBacked) {
    watchEmailStatus.textContent = "Email verification needs the live API.";
    return;
  }
  const email = String(watchEmailInput.value || "").trim();
  if (!email) {
    watchEmailStatus.textContent = "Enter an email first.";
    return;
  }
  const payload = await postJson("/api/notification-email/start", { email });
  watchEmailStatus.textContent = payload.verificationCodePreview
    ? `Verification started for ${email}. Preview code: ${payload.verificationCodePreview}`
    : `Verification started for ${email}. Check your inbox for the code.`;
  await ensureTrackedAlerts(true);
  syncWatchSettingsForm();
}

export async function verifyNotificationEmailFromDialog() {
  if (!state.live.apiBacked) {
    watchEmailStatus.textContent = "Email verification needs the live API.";
    return;
  }
  const code = String(watchEmailCodeInput.value || "").trim();
  if (!code) {
    watchEmailStatus.textContent = "Enter the verification code.";
    return;
  }
  await postJson("/api/notification-email/verify", { code });
  watchEmailStatus.textContent = "Email verified for this workspace.";
  await ensureTrackedAlerts(true);
  syncWatchSettingsForm();
}

export async function markNotificationRead(notificationId) {
  if (!notificationId || !state.live.apiBacked) return;
  await postJson("/api/notifications/read", { notificationIds: [notificationId] });
  await ensureTrackedAlerts(true);
}

export async function markAllNotificationsRead() {
  if (!state.live.apiBacked) return;
  await postJson("/api/notifications/read", { markAll: true });
  await ensureTrackedAlerts(true);
}

export function toggleFavorite(id) {
  const isRemoving = state.favoriteIds.includes(id);
  if (isRemoving) {
    state.favoriteIds = state.favoriteIds.filter((value) => value !== id);
    delete state.shortlistStatuses[id];
    persistShortlistStatuses();
  } else {
    enterWorkMode("catalog");
    state.favoriteIds = [id, ...state.favoriteIds];
    ensureShortlistStatuses([id], { defaultStatus: isCatalogDecisionReady() ? null : "wait" });
  }
  persistFavorites();
  resetRoutinePlannerCaches({ clearRestoreState: true });
  persistRoutinePlannerSession();
  renderFavorites();
  renderProducts();
  renderRoutineBuilder();
  renderBestPicks();
  renderTrackedAlertsPanel();
  syncRoutinePlannerDraftSoon();
}

export function getEffectiveTrackedIds() {
  return getActiveWatchedItems()
    .map((watch) => watch.seedOfferId || getFirstProductIdForComparisonKey(watch.comparisonKey))
    .filter(Boolean);
}

export function isTrackedAlertId(id) {
  return Boolean(getWatchForProductId(id));
}

export function toggleTrackedAlert(id, options = {}) {
  openWatchSettings(id, options);
}

export function toggleSavedArticle(id) {
  if (state.savedArticleIds.includes(id)) {
    state.savedArticleIds = state.savedArticleIds.filter((value) => value !== id);
  } else {
    state.savedArticleIds = [id, ...state.savedArticleIds];
  }
  persistSavedArticles();
  renderArticles();
}

export function saveCurrentProfile() {
  enterWorkMode();
  const savedAt = nowIso();
  const labelParts = [
    titleCase(state.userProfile.goal || "dryness"),
    state.profile !== "all" ? getProfileLabel() : "Broad view",
    state.userProfile.budget !== "any" ? getBudgetLabel(state.userProfile.budget) : null,
    state.browseLaneKey ? getBrowseLaneByKey(state.browseLaneKey)?.label : null,
  ].filter(Boolean);
  const filters = getCurrentProfileFiltersSnapshot();
  const entry = {
    id: generateLocalId("profile"),
    label: labelParts.slice(0, 2).join(" · "),
    savedAt,
    updatedAt: savedAt,
    filters,
  };
  state.savedProfiles = [
    entry,
    ...state.savedProfiles.filter((item) => getSavedProfileFiltersSignature(item.filters) !== getSavedProfileFiltersSignature(entry.filters)),
  ].slice(0, 6);
  state.ui.profileSummaryTab = "saved";
  persistSavedProfiles();
  renderSavedPresets();
  syncUserProfileSurface();
}

export function flashRoutineSaveFeedback() {
  const buttons = [routineSaveCurrentButton, saveRoutineButton].filter(Boolean);
  if (!buttons.length) return;
  buttons.forEach((button) => {
    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent.trim();
    }
    button.textContent = "Routine saved";
    button.classList.add("is-saved");
  });
  window.clearTimeout(routineSaveFeedbackTimer);
  routineSaveFeedbackTimer = window.setTimeout(() => {
    buttons.forEach((button) => {
      button.textContent = button.dataset.defaultLabel || "Save routine";
      button.classList.remove("is-saved");
    });
    routineSaveFeedbackTimer = null;
  }, 1400);
}

export function saveCurrentRoutine() {
  enterWorkMode();
  const savedAt = nowIso();
  const entry = {
    id: generateLocalId("routine"),
    label: `${state.routineTime.toUpperCase()} · ${titleCase(state.routineConcern)}`,
    savedAt,
    updatedAt: savedAt,
    config: {
      routineConcern: state.routineConcern,
      routineTime: state.routineTime,
      routineBudget: state.routineBudget,
      retailer: state.retailer,
      profile: state.profile,
      sensitivity: state.userProfile.sensitivity,
      activesComfort: state.userProfile.activesComfort,
      avoidIngredients: state.userProfile.avoidIngredients,
      routineDraft: getSerializableRoutineDraftState(),
    },
  };
  state.savedRoutines = [entry, ...state.savedRoutines.filter((item) => JSON.stringify(item.config) !== JSON.stringify(entry.config))].slice(0, 6);
  persistSavedRoutines();
  renderSavedPresets();
  flashRoutineSaveFeedback();
}

export function applySavedProfile(id) {
  const entry = state.savedProfiles.find((item) => item.id === id);
  if (!entry) return;
  enterWorkMode();
  const filters = createSavedProfileFilters(entry.filters);
  state.browseLaneKey = filters.browseLaneKey || null;
  state.profile = filters.profile;
  state.retailer = filters.retailer;
  state.brand = filters.brand;
  state.category = filters.category;
  state.ingredient = filters.ingredient;
  state.concern = filters.concern;
  state.search = filters.search;
  state.sort = filters.sort;
  state.userProfile.goal = filters.goal || state.userProfile.goal;
  state.userProfile.goalSource = filters.goalSource || "saved-profile";
  state.userProfile.budget = filters.budget || state.userProfile.budget;
  state.userProfile.profile = state.profile;
  state.userProfile.sensitivity = filters.sensitivity || state.userProfile.sensitivity;
  state.userProfile.activesComfort = filters.activesComfort || state.userProfile.activesComfort;
  state.userProfile.avoidIngredients = [...filters.avoidIngredients];
  state.routineConcern = state.userProfile.goal;
  state.page = 1;
  profileFilter.value = state.profile;
  routineConcern.value = state.routineConcern;
  retailerFilter.value = state.retailer;
  brandFilter.value = state.brand;
  categoryFilter.value = state.category;
  ingredientFilter.value = state.ingredient;
  sortFilter.value = state.sort;
  searchInput.value = state.search;
  persistUserProfile();
  setConcernChipSelection(state.concern);
  syncUserProfileSurface({ closeEditor: true });
  renderSavedPresets();
  renderProducts();
  resetRoutinePlannerCaches({ clearRestoreState: true });
  persistRoutinePlannerSession();
  renderRoutineBuilder();
  renderBestPicks();
  renderArticles();
  syncRoutinePlannerDraftSoon();
}

export function applySavedRoutine(id) {
  const entry = state.savedRoutines.find((item) => item.id === id);
  if (!entry) return;
  const config = normalizeSavedRoutineConfig(entry.config);
  enterWorkMode();
  clearBrowseLaneSelection();
  state.routineConcern = normalizeRoutineConcern(config.routineConcern, "dryness");
  state.routineTime = config.routineTime;
  state.routineBudget = config.routineBudget;
  state.retailer = config.retailer;
  state.profile = config.profile;
  state.userProfile.profile = state.profile;
  state.userProfile.sensitivity = config.sensitivity;
  state.userProfile.activesComfort = config.activesComfort;
  state.userProfile.avoidIngredients = [...config.avoidIngredients];
  state.routineDraft = { ...config.routineDraft };
  routineConcern.value = state.routineConcern;
  routineTime.value = state.routineTime;
  routineBudget.value = state.routineBudget;
  retailerFilter.value = state.retailer;
  profileFilter.value = state.profile;
  persistUserProfile();
  state.page = 1;
  syncUserProfileSurface({ closeEditor: true });
  renderSavedPresets();
  renderProducts();
  resetRoutinePlannerCaches({ clearRestoreState: true });
  persistRoutinePlannerSession();
  renderRoutineBuilder();
  renderBestPicks();
  renderArticles();
  syncRoutinePlannerDraftSoon();
}

export function removeSavedPreset(kind, id) {
  if (kind === "profile") {
    state.savedProfiles = state.savedProfiles.filter((item) => item.id !== id);
    persistSavedProfiles();
  } else {
    state.savedRoutines = state.savedRoutines.filter((item) => item.id !== id);
    persistSavedRoutines();
  }
  renderSavedPresets();
}

export function getShortlistTrustLabels(product) {
  const labels = [];
  if (shouldShowCatalogIngredientInsight(product)) {
    labels.push("ingredient-led fit");
  }
  getTrustSignalLabels(
    product,
    ["review-supported", "retailer-confirmed-match", "recently-verified", "lower-confidence-match"],
  ).forEach((label) => {
    const neutralLabel = {
      "review-supported": "synthetic review sample",
      "retailer-confirmed-match": "fixture overlap",
      "recently-verified": "fixture timestamp",
    }[String(label).trim().toLowerCase()] || label;
    if (!labels.includes(neutralLabel)) {
      labels.push(neutralLabel);
    }
  });
  if (!labels.includes("synthetic review sample") && typeof product.rating === "number" && typeof product.reviewCount === "number" && product.reviewCount >= 50) {
    labels.push("synthetic review sample");
  }
  if (!labels.includes("fixture overlap")) {
    if (getRetailerComparison(product).some((entry) => isRetailerExactMatch(entry))) {
      labels.push("fixture overlap");
    } else if (!labels.some((label) => String(label).toLowerCase().includes("lower-confidence"))) {
      labels.push("lower-confidence match");
    }
  }
  return labels.slice(0, 3);
}

export function getShortlistAiEligibleProducts() {
  const savedProducts = getShortlistSavedProducts();
  const championProduct = getShortlistChampionProduct(savedProducts);
  const backupProduct = getShortlistBackupProduct(savedProducts);
  return [championProduct, backupProduct, ...savedProducts]
    .filter(Boolean)
    .filter((product, index, products) => products.findIndex((entry) => entry.id === product.id) === index)
    .slice(0, 4);
}

export function getShortlistAiMode(savedProducts = getShortlistAiEligibleProducts()) {
  const count = (savedProducts || []).filter(Boolean).length;
  if (count >= 2) return "compare";
  if (count === 1) return "single";
  return "empty";
}

export function getShortlistAiPromptLabels(savedProducts = getShortlistAiEligibleProducts()) {
  if (isShortlistExploratoryHandoff(savedProducts)) {
    return SHORTLIST_EXPLORATORY_COPY.prompts;
  }
  return getShortlistAiMode(savedProducts) === "compare"
    ? [
        "Which one should I start with?",
        "Which is the safest starter?",
        "What are the tradeoffs here?",
      ]
    : [
        "Should I buy this first?",
        "Is this a safe starter for my skin lens?",
        "What is the main caution before I buy this?",
      ];
}

export function syncShortlistAiPromptLabels(savedProducts = getShortlistAiEligibleProducts()) {
  const labels = getShortlistAiPromptLabels(savedProducts);
  shortlistAiPromptButtons.forEach((button, index) => {
    if (!button) return;
    button.textContent = labels[index] || button.textContent;
  });
}

export function getRecommendedShortlistAiQuestion(savedProducts = getShortlistAiEligibleProducts()) {
  const eligibleProducts = (savedProducts || []).filter(Boolean);
  const mode = getShortlistAiMode(eligibleProducts);
  const conflictSignals = buildShortlistConflictSignals(eligibleProducts);
  const gapSignals = buildShortlistGapSignals(eligibleProducts);
  const counts = getShortlistStatusCounts();
  const leadProduct = eligibleProducts[0] || null;
  const leadWarnings = leadProduct ? getProductConflictWarnings(leadProduct, { routineTime: state.routineTime }) : [];
  const exploratoryHandoff = isShortlistExploratoryHandoff(eligibleProducts);

  if (exploratoryHandoff) {
    if (state.userProfile.sensitivity === "high" || getStrongActiveCount(leadProduct) >= 2 || leadWarnings.length) {
      return "Is this a safe starter for my skin lens?";
    }
    if (state.userProfile.budget === "budget") {
      return "Is this worth keeping as a comparison point?";
    }
    if (gapSignals.length) {
      return "What should I check before narrowing?";
    }
    return "What focus should I choose before comparing?";
  }

  if (mode === "single") {
    if (state.userProfile.sensitivity === "high" || getStrongActiveCount(leadProduct) >= 2 || leadWarnings.length) {
      return "Is this a safe starter for my skin lens?";
    }
    if (state.userProfile.budget === "budget") {
      return "Is this worth buying first for the money?";
    }
    if (gapSignals.length) {
      return "What is the main caution before I buy this?";
    }
    return "Should I buy this first?";
  }

  if (
    state.userProfile.sensitivity === "high" ||
    conflictSignals.some((signal) => /starter case|active-heavy|misses/i.test(String(signal || "")))
  ) {
    return "Which is the safest starter for my skin lens?";
  }
  if (state.userProfile.budget === "budget") {
    return "Which saved product gives me the strongest champion call for the money?";
  }
  if (gapSignals.length && counts.core + counts.optional < 2) {
    return "What is missing from this shortlist before I buy?";
  }
  if (conflictSignals.length || counts.wait) {
    return "What are the tradeoffs here?";
  }
  return "Which one should I start with?";
}

export function setShortlistAiState(stateKey = "ready") {
  if (!shortlistAi) return;
  shortlistAi.dataset.assistantState = stateKey || "ready";
}

export function syncShortlistAiControls() {
  const eligibleProducts = getShortlistAiEligibleProducts();
  const hasEnoughContext = eligibleProducts.length >= 1;
  const hasQuestion = Boolean(shortlistAiInput?.value.trim());
  const question = hasEnoughContext ? getRecommendedShortlistAiQuestion(eligibleProducts) : "";
  const exploratoryHandoff = isShortlistExploratoryHandoff(eligibleProducts);

  syncShortlistAiPromptLabels(eligibleProducts);

  if (shortlistAi) {
    shortlistAi.hidden = !hasEnoughContext;
    if (!hasEnoughContext) {
      setShortlistAiState("ready");
    } else if (
      !shortlistAiResponse?.classList.contains("shortlist-ai-response-thinking") &&
      !shortlistAiResponse?.classList.contains("shortlist-ai-response-answered")
    ) {
      setShortlistAiState("ready");
    }
  }
  if (!hasEnoughContext) {
    state.ui.shortlistExpanded = false;
  }
  if (shortlistAiSubmit) {
    shortlistAiSubmit.disabled = !hasEnoughContext || !hasQuestion;
  }
  if (shortlistAiCopy) {
    shortlistAiCopy.textContent = hasEnoughContext && exploratoryHandoff
      ? eligibleProducts.length === 1
        ? `${SHORTLIST_EXPLORATORY_COPY.aiCopySingle} Start with: ${question}`
        : `${SHORTLIST_EXPLORATORY_COPY.aiCopyMultiple} Start with: ${question}`
      : hasEnoughContext
      ? eligibleProducts.length === 1
        ? `Saved product is ready. Start with: ${question}`
        : `Saved set is ready across ${eligibleProducts.length} products. Start with: ${question}`
      : "Save one product to unlock a structured decision read.";
  }
  if (shortlistAiMeta) {
    shortlistAiMeta.textContent = hasEnoughContext && exploratoryHandoff
      ? eligibleProducts.length === 1
        ? SHORTLIST_EXPLORATORY_COPY.aiMetaSingle
        : SHORTLIST_EXPLORATORY_COPY.aiMetaMultiple
      : hasEnoughContext
      ? eligibleProducts.length === 1
        ? `Grounded in your saved product, skin lens, and ${state.routineTime.toUpperCase()} routine signals.`
        : `Grounded in ${eligibleProducts.length} saved products, your skin lens, and ${state.routineTime.toUpperCase()} routine signals.`
      : "Uses saved products, your skin lens, and routine context once unlocked.";
  }
  if (shortlistAiInput) {
    shortlistAiInput.placeholder = exploratoryHandoff
      ? SHORTLIST_EXPLORATORY_COPY.aiPlaceholder
      : SHORTLIST_DECISION_COPY.aiPlaceholder;
  }
  renderShortlistAiGuardrailNote(shortlistAiInput?.value || "", eligibleProducts);
}

export function renderShortlistSummary() {
  if (!shortlistSummary) return;
  const counts = getShortlistStatusCounts();
  const savedProducts = getShortlistSavedProducts();
  const championProduct = getShortlistChampionProduct(savedProducts);
  const backupProduct = getShortlistBackupProduct(savedProducts);
  if (isShortlistExploratoryHandoff(savedProducts)) {
    const savedLead = savedProducts[0] || null;
    shortlistSummary.innerHTML = `
      <article class="shortlist-summary-card shortlist-summary-card-core">
        <span>Saved pick</span>
        <strong>${escapeHtml(savedLead ? `${savedLead.brand} ${savedLead.name}` : "Reference saved")}</strong>
      </article>
      <article class="shortlist-summary-card shortlist-summary-card-optional">
        <span>Focus</span>
        <strong>Choose type, concern, ingredient, lane, or search</strong>
      </article>
      <article class="shortlist-summary-card shortlist-summary-card-wide shortlist-summary-card-retailer">
        <span>Store path</span>
        <strong>Compare stores after narrowing</strong>
      </article>
      <article class="shortlist-summary-card shortlist-summary-card-wide shortlist-summary-card-budget">
        <span>Price read</span>
        <strong>Check spend after focus is set</strong>
      </article>
    `;
    return;
  }
  const subset = getShortlistCoreFirstSubset();
  const shortlistFallback = subset.length ? buildLocalBasketPlanPayload(subset, "shortlist") : null;
  const shortlistPayload = subset.length ? getActiveBasketPayload("shortlist", subset, shortlistFallback) || shortlistFallback : null;
  const retailerMix = shortlistPayload?.oneStoreBasket?.retailer
    ? `${shortlistPayload.oneStoreBasket.retailer} is the cleanest checkout path`
    : "Checkout path appears after champion and backup are locked";
  const budgetImpact = shortlistPayload?.summary?.total != null
    ? `${money(shortlistPayload.summary.total)} for the approved subset`
    : "Spend appears after the decision pair becomes actionable";

  shortlistSummary.innerHTML = `
    <article class="shortlist-summary-card shortlist-summary-card-core">
      <span>Champion</span>
      <strong>${escapeHtml(championProduct ? `${championProduct.brand} ${championProduct.name}` : "Pick one now")}</strong>
    </article>
    <article class="shortlist-summary-card shortlist-summary-card-optional">
      <span>Backup</span>
      <strong>${escapeHtml(backupProduct ? `${backupProduct.brand} ${backupProduct.name}` : counts.wait ? "Promote one hold" : "Save one challenger")}</strong>
    </article>
    <article class="shortlist-summary-card shortlist-summary-card-wide shortlist-summary-card-retailer">
      <span>Best store path</span>
      <strong>${escapeHtml(retailerMix)}</strong>
    </article>
    <article class="shortlist-summary-card shortlist-summary-card-wide shortlist-summary-card-budget">
      <span>Current spend</span>
      <strong>${escapeHtml(budgetImpact)}</strong>
    </article>
  `;
}

export function renderShortlistConflicts() {
  if (!shortlistConflicts) return;
  const savedProducts = state.favoriteIds.map((id) => getProductById(id)).filter(Boolean);
  const conflicts = buildShortlistConflictSignals(savedProducts);
  shortlistConflicts.hidden = conflicts.length === 0;
  shortlistConflicts.innerHTML = conflicts.map((conflict) => `<p>${escapeHtml(conflict)}</p>`).join("");
}

export function renderFavorites({ force = false } = {}) {
  if (!force && state.ui.activeShellView !== "shortlist") {
    return;
  }
  savedGrid.innerHTML = "";
  if (state.favoriteIds.length === 0) {
    state.ui.shortlistExpanded = false;
  }
  const renderContext = getCatalogRenderContext();
  const filtered = renderContext.filtered;
  const leadProduct = renderContext.leadProduct;
  const marketSnapshot = renderContext.marketSnapshot;
  const actionableProducts = getActionableShortlistProducts();
  const routineReadyProducts = actionableProducts.filter((product) => getLeadRoutineStep(product));
  const coreSubset = getShortlistCoreFirstSubset();
  const hasBuyPath = coreSubset.length > 0;
  const shortlistFallback = hasBuyPath ? buildLocalBasketPlanPayload(coreSubset, "shortlist") : null;
  const shortlistPayload = hasBuyPath ? getActiveBasketPayload("shortlist", coreSubset, shortlistFallback) || shortlistFallback : null;
  const decisionAction = getDecisionNextActionContext({
    leadProduct,
    marketSnapshot,
    shortlistPayload,
  });
  const decisionState = getShortlistDecisionState();
  const championProduct = decisionState.championProduct;
  const backupProduct = decisionState.backupProduct;
  const savedProducts = decisionState.savedProducts;
  const exploratoryHandoff = isShortlistExploratoryHandoff(savedProducts);
  const statusLabels = getShortlistDisplayStatusLabels(savedProducts);
  const displayDecisionAction = getShortlistDisplayDecisionAction(decisionAction, savedProducts);
  syncShortlistHandoffCopy(savedProducts);
  savedEmpty.hidden = state.favoriteIds.length > 0;
  if (shortlistToRoutineButton) {
    shortlistToRoutineButton.disabled = !championProduct;
    shortlistToRoutineButton.textContent = championProduct
      ? "Plan around champion"
      : exploratoryHandoff
        ? "Choose focus first"
        : "Choose champion first";
  }
  if (shortlistBuildPlanButton) {
    shortlistBuildPlanButton.disabled = false;
    shortlistBuildPlanButton.textContent = displayDecisionAction.primaryLabel;
    shortlistBuildPlanButton.dataset.primaryAction = displayDecisionAction.key;
    shortlistBuildPlanButton.dataset.productId = displayDecisionAction.productId || "";
    shortlistBuildPlanButton.dataset.workspaceSection = displayDecisionAction.workspaceSection || "";
  }
  if (shortlistBuyCoreButton) {
    shortlistBuyCoreButton.hidden = !hasBuyPath;
    shortlistBuyCoreButton.disabled = !hasBuyPath;
    shortlistBuyCoreButton.textContent = "Refresh final basket";
  }
  if (shortlistEmptyCtaButton) {
    shortlistEmptyCtaButton.disabled = false;
  }
  shortlistDock?.classList.toggle("is-empty", state.favoriteIds.length === 0);
  if (shortlistSavedCount) {
    shortlistSavedCount.textContent = state.favoriteIds.length
      ? exploratoryHandoff
        ? `${state.favoriteIds.length} saved · focus open`
        : `${state.favoriteIds.length} saved · ${championProduct ? "champion locked" : "no champion"}${backupProduct ? " · backup locked" : ""}`
      : "No products yet";
  }
  syncShortlistAiControls();
  if (!shortlistAi.hidden && !shortlistAiInput.value.trim()) {
    renderShortlistAiIdleState();
  }
  renderShortlistSummary();
  renderShortlistConflicts();
  renderShortlistGapSummary();
  renderShortlistBuySummary();
  renderCatalogShortlistRail(renderContext);

  state.favoriteIds
    .map((id) => getProductById(id))
    .filter(Boolean)
    .forEach((product) => {
      const status = getShortlistStatus(product.id);
      const trustLabels = getShortlistTrustLabels(product);
      const card = document.createElement("article");
      card.className = "saved-card";
      card.dataset.shortlistStatus = status;
      card.innerHTML = `
        <p class="brand">${escapeHtml(product.brand)}</p>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="routine-brand">${escapeHtml(product.retailer)} · ${money(product.price)}</p>
        <div class="saved-status-row" role="group" aria-label="${exploratoryHandoff ? "Saved pick status" : "Shortlist status"} for ${escapeHtml(product.name)}">
          ${Object.entries(statusLabels)
            .map(
              ([value, label]) => `
                <button class="saved-status-chip${status === value ? " active" : ""}" type="button" data-shortlist-status="${escapeHtml(value)}" data-id="${escapeHtml(product.id)}" aria-pressed="${status === value}">
                  ${escapeHtml(label)}
                </button>
              `,
            )
            .join("")}
        </div>
        <p class="saved-tradeoff">${escapeHtml(summarizeShortlistTradeoff(product))}</p>
        <div class="saved-meta">
          ${product.concerns.slice(0, 2).map((concern) => `<span>${escapeHtml(titleCase(concern))}</span>`).join("")}
          ${product.ingredients.slice(0, 1).map((ingredient) => `<span>${escapeHtml(titleCase(ingredient))}</span>`).join("")}
          ${trustLabels
            .map(
              (label) =>
                `<span class="saved-trust-chip" data-trust-tone="${escapeHtml(getTrustTone(label))}">${escapeHtml(label)}</span>`,
            )
            .join("")}
        </div>
        <div class="card-actions">
          <button class="favorite-button active" type="button" data-id="${escapeHtml(product.id)}">Remove</button>
          <span class="product-link" aria-disabled="true">${escapeHtml(getOutboundLabel(product.retailer))}</span>
        </div>
      `;
      savedGrid.appendChild(card);
    });

  syncSupportDisclosureUi();
  renderTrackedAlertsPanel();
  renderDecisionWorkspaceSummary(renderContext);
}

export function scoreShortlistStart(product) {
  return (
    scoreBestOverall(product) +
    scoreRoutineMatch(product, state.userProfile.goal || state.routineConcern, {
      label: state.routineTime === "am" ? "AM core step" : "PM core step",
      categories: ["serum", "moisturizer", "sunscreen", "cleanser", "treatment"],
    }) +
    scoreRoutineConflictPenalty(product, []) * 0.8 +
    overlapBoost(product)
  );
}

export function scoreShortlistGoal(product) {
  return scoreProduct(product) + scoreRoutineMatch(product, state.userProfile.goal || state.routineConcern, { label: "Goal fit", categories: [product.category] });
}

export function summarizeShortlistTradeoff(product) {
  const warnings = getProductConflictWarnings(product, { routineTime: state.routineTime });
  const comparisons = getRetailerComparison(product);
  const exactMatch = comparisons.find((entry) => isRetailerExactMatch(entry));

  if (warnings.length) return warnings[0];
  if (typeof product.price === "number" && state.userProfile.budget === "budget" && product.price > 70) {
    return `Higher spend at ${money(product.price)} for a value-first plan.`;
  }
  if (typeof product.price === "number" && state.userProfile.budget === "premium" && product.price < 35) {
    return `Lower spend than most premium-leaning options in this shortlist.`;
  }
  if (exactMatch) return `Same product is also available at ${exactMatch.retailer}, so retailer choice can come down to price or trust.`;
  if (!comparisons.length) return "No strong cross-store comparison showed up in the current view.";
  return `Retailer check is based on closest equivalents rather than an exact match.`;
}

export function buildShortlistPlannerSignals(savedProducts) {
  const backendPlan = getActiveRoutinePlannerPlan();
  const plannerState = getRoutinePlannerState(backendPlan);
  const plannerSteps = [];
  const plannerMatchByProductId = new Map();

  (backendPlan?.steps || []).forEach((entry) => {
    if (!entry?.step || entry.removed) return;
    const plannerEntry = {
      stepKey: entry.step.key,
      stepLabel: entry.step.label,
      priority: entry.priority || null,
      locked: Boolean(entry.locked),
      fromSavedSet: Boolean(entry.fromSavedSet),
      productId: entry.product?.id || null,
      productName: entry.product?.name || null,
      retailer: entry.product?.retailer || null,
      reason: entry.reason || null,
      reasonTags: [...(entry.reasonTags || [])],
      warningTags: [...(entry.warningTags || [])],
    };
    plannerSteps.push(plannerEntry);
    if (plannerEntry.productId) {
      plannerMatchByProductId.set(plannerEntry.productId, plannerEntry);
    }
  });

  return {
    planner: {
      source: backendPlan ? (backendPlan.degraded ? "planner-fallback" : "planner-service") : (state.live.apiBacked ? "planner-pending" : "local-planner"),
      status: plannerState.label,
      detail: plannerState.detail,
      summary: backendPlan?.summary
        ? {
            total: backendPlan.summary.total,
            withinBudget: backendPlan.summary.withinBudget,
            budgetAssessment: backendPlan.summary.budgetAssessment,
            coreStepsSelected: backendPlan.summary.coreStepsSelected,
            coreStepsTotal: backendPlan.summary.coreStepsTotal,
            optionalStepsSelected: backendPlan.summary.optionalStepsSelected,
            keptSteps: backendPlan.summary.keptSteps,
            removedSteps: backendPlan.summary.removedSteps,
            savedSetSteps: backendPlan.summary.savedSetSteps,
            warningTags: [...(backendPlan.summary.warningTags || [])],
            warnings: (backendPlan.summary.warnings || []).map((entry) => entry.message || entry),
          }
        : null,
      steps: plannerSteps,
    },
    plannerMatchByProductId,
  };
}

export function getCurrentRoutineProductIds() {
  return state.conversion.currentRoutineEntries.map((entry) => entry.product.id).filter(Boolean);
}

export function getCurrentRoutineCoreEntries() {
  return state.conversion.currentRoutineEntries.filter((entry) => entry.step?.priority === "core" && entry.product);
}

export function buildShortlistFallbackSubset(savedProducts) {
  const orderedSteps = [...ROUTINE_STEPS[state.routineTime]].sort((a, b) => {
    const aRank = getRoutineStepPriority(a) === "core" ? 0 : 1;
    const bRank = getRoutineStepPriority(b) === "core" ? 0 : 1;
    return aRank - bRank;
  });
  const usedIds = new Set();
  const subset = [];

  orderedSteps.forEach((step) => {
    if (subset.length >= 4) return;
    const candidate = savedProducts
      .filter((product) => !usedIds.has(product.id) && isRoutineProductValidForStep(step, product))
      .map((product) => ({
        product,
        score:
          scoreRoutineMatch(product, state.userProfile.goal || state.routineConcern, step) +
          scoreProduct(product) * 0.35 +
          (getShortlistStatus(product.id) === "core" ? 8 : 0),
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER),
      )[0]?.product;

    if (!candidate) return;
    usedIds.add(candidate.id);
    subset.push({
      step: {
        ...step,
        priority: getRoutineStepPriority(step, candidate),
      },
      product: candidate,
    });
  });

  return subset.slice(0, 4);
}

export function getShortlistCoreFirstSubset() {
  const activeRoutineCore = getCurrentRoutineCoreEntries();
  if (activeRoutineCore.length) {
    return activeRoutineCore.slice(0, 4);
  }
  const savedProducts = getActionableShortlistProducts();
  return buildShortlistFallbackSubset(savedProducts);
}

export function getShortlistRoleLabel(stepKey) {
  const mapping = {
    cleanser: "cleanse",
    treat: "treatment",
    moisturize: "moisture",
    protect: "AM protection",
    seal: "seal",
  };
  return mapping[stepKey] || "routine";
}

export function buildShortlistGapSignals(savedProducts) {
  if (!savedProducts.length) return [];
  const signals = [];
  const roleCounts = new Map();
  const activeCore = getCurrentRoutineCoreEntries();
  const coreSteps = [...ROUTINE_STEPS[state.routineTime]].filter((step) => getRoutineStepPriority(step) === "core");
  const actionableProducts = savedProducts.filter((product) => SHORTLIST_ACTIONABLE_STATUSES.has(getShortlistStatus(product.id)));

  actionableProducts.forEach((product) => {
    const matchedStep = ROUTINE_STEPS[state.routineTime].find((step) => isRoutineProductValidForStep(step, product));
    if (!matchedStep) return;
    roleCounts.set(matchedStep.key, (roleCounts.get(matchedStep.key) || 0) + 1);
  });

  const duplicateRole = [...roleCounts.entries()].find(([, count]) => count > 1);
  if (duplicateRole) {
    signals.push(`You already have ${duplicateRole[1]} ${getShortlistRoleLabel(duplicateRole[0])}-style picks.`);
  }

  const missingCore = coreSteps.find((step) => !actionableProducts.some((product) => isRoutineProductValidForStep(step, product)));
  if (missingCore) {
    signals.push(
      missingCore.key === "protect"
        ? "You still need AM protection."
        : `You still need ${state.routineTime.toUpperCase()} ${missingCore.label.toLowerCase()}.`,
    );
  }

  if (activeCore.length) {
    signals.push(`This decision set already covers your ${state.routineTime.toUpperCase()} ${activeCore[0].step.label.toLowerCase()} step.`);
  } else if (getShortlistCoreFirstSubset().length >= Math.min(2, coreSteps.length)) {
    signals.push("This decision set is tight enough for a champion-versus-backup call.");
  } else {
    signals.push("Start with one champion and one backup before you price every saved pick.");
  }

  return signals.slice(0, 3);
}

export function renderShortlistGapSummary() {
  if (!shortlistGapSummary) return;
  const savedProducts = state.favoriteIds.map((id) => getProductById(id)).filter(Boolean);
  const signals = isShortlistExploratoryHandoff(savedProducts)
    ? ["Choose a product type, concern, ingredient, lane, or specific search before turning this saved pick into a final call."]
    : buildShortlistGapSignals(savedProducts);
  shortlistGapSummary.hidden = signals.length === 0;
  shortlistGapSummary.innerHTML = signals.map((signal) => `<p>${escapeHtml(signal)}</p>`).join("");
}

export function getLocalPreviousAvailabilityDetail(offer) {
  if (offer?.previousAvailabilityDetail && typeof offer.previousAvailabilityDetail === "object") {
    return offer.previousAvailabilityDetail;
  }
  if (offer?.previousAvailabilityState) {
    return deriveAvailabilityDetail({ availabilityState: offer.previousAvailabilityState });
  }
  return null;
}

export function watchPriceThresholdsMet(watch, { currentPrice, priceDelta, percentDelta }) {
  const thresholds = watch?.thresholds || {};
  if (typeof thresholds.targetPrice === "number" && (!(typeof currentPrice === "number") || currentPrice > thresholds.targetPrice + 0.005)) {
    return false;
  }
  if (typeof thresholds.minAbsoluteDrop === "number" && (!(typeof priceDelta === "number") || priceDelta + 0.005 < thresholds.minAbsoluteDrop)) {
    return false;
  }
  if (typeof thresholds.minPercentDrop === "number" && (!(typeof percentDelta === "number") || percentDelta + 0.005 < thresholds.minPercentDrop)) {
    return false;
  }
  return true;
}

export function buildLocalWatchEventCandidate(offer, watch = null) {
  if (!offer) return null;
  const currentDetail = offer.availabilityDetail || deriveAvailabilityDetail(offer);
  const previousDetail = getLocalPreviousAvailabilityDetail(offer);
  const currentState = currentDetail?.state || null;
  const currentGroup = currentDetail?.group || null;
  const previousState = previousDetail?.state || null;
  const previousGroup = previousDetail?.group || null;
  const currentPrice = typeof offer.price === "number" ? offer.price : null;
  const previousPrice = typeof offer.previousPrice === "number" ? offer.previousPrice : null;
  const lowestPrice = typeof offer.lowestPrice === "number" ? offer.lowestPrice : null;
  const priceDelta = typeof currentPrice === "number" && typeof previousPrice === "number" ? previousPrice - currentPrice : null;
  const percentDelta = typeof priceDelta === "number" && typeof previousPrice === "number" && previousPrice > 0 ? (priceDelta / previousPrice) * 100 : null;
  const rules = watch?.eventRules || createDefaultWatchEventRules();
  const candidates = [];
  if (["available_now", "limited_now"].includes(currentGroup) && ["future", "not_available"].includes(previousGroup)) {
    candidates.push({ eventType: "back_in_stock", whyNow: "Back in stock in fixture", rule: "backInStock" });
  }
  if (currentState === "limited_stock" && previousState !== "limited_stock") {
    candidates.push({ eventType: "limited_stock", whyNow: "Limited stock in fixture", rule: "limitedStock" });
  }
  if (currentState === "backorder" && previousState !== "backorder") {
    candidates.push({ eventType: "backorder", whyNow: "Backorder · synthetic fixture", rule: "backorder" });
  }
  if (currentState === "preorder" && previousState !== "preorder") {
    candidates.push({ eventType: "preorder", whyNow: "Preorder · synthetic fixture", rule: "preorder" });
  }
  if (currentState === "discontinued" && previousState !== "discontinued") {
    candidates.push({ eventType: "discontinued", whyNow: "Discontinued · synthetic fixture", rule: "discontinued" });
  }
  if (typeof priceDelta === "number" && priceDelta > 0) {
    candidates.push({ eventType: "price_drop", whyNow: "Fixture price dropped", rule: "priceDrop", priceEvent: true });
  }
  if (typeof currentPrice === "number" && typeof lowestPrice === "number" && Math.abs(lowestPrice - currentPrice) < 0.005) {
    candidates.push({ eventType: "lowest_tracked", whyNow: "Lowest tracked fixture price", rule: "lowestTracked", priceEvent: true });
  }
  if (previousDetail && (previousDetail.state !== currentState || previousDetail.group !== currentGroup)) {
    candidates.push({ eventType: "availability_change", whyNow: currentDetail?.label ? `${currentDetail.label} · synthetic fixture` : "Availability changed · synthetic fixture", rule: null });
  }
  return candidates.find((candidate) => {
    if (watch && candidate.rule && !rules[candidate.rule]) return false;
    if (watch && !candidate.rule) return false;
    if (candidate.priceEvent && watch && !watchPriceThresholdsMet(watch, { currentPrice, priceDelta, percentDelta })) return false;
    return true;
  }) || null;
}

export function buildLocalTrackedAlertsPayload() {
  const watches = getActiveWatchedItems();
  const alerts = [];
  const watching = watches
    .map((watch) => {
      const offers = getLocalExactOffersForWatch(watch)
        .sort((left, right) => sortRoutineBasketOffers("", left, right));
      const bestOffer = offers[0] || null;
      const candidate = buildLocalWatchEventCandidate(bestOffer, watch);
      const product = bestOffer
        ? {
            canonicalProductId: bestOffer.canonicalProductId || bestOffer.id,
            comparisonKey: bestOffer.comparisonKey || null,
            brand: bestOffer.brand,
            name: bestOffer.name,
            category: bestOffer.category,
            retailers: [...new Set(offers.map((offer) => offer.retailer).filter(Boolean))],
            offerCount: offers.length,
          }
        : null;
      const watchRecord = {
        ...watch,
        product,
        bestOfferNow: bestOffer ? serializeBasketOffer(bestOffer) : null,
        unreadCount: candidate ? 1 : 0,
        latestEvent: candidate
          ? {
              id: `local-${watch.comparisonKey}-${candidate.eventType}`,
              eventType: candidate.eventType,
              title: candidate.whyNow,
              whyNow: candidate.whyNow,
              triggeredAt: state.freshness.catalog || nowIso(),
              read: false,
            }
          : null,
      };
      if (candidate) {
        alerts.push({
          id: `local-${watch.comparisonKey}-${candidate.eventType}`,
          comparisonKey: watch.comparisonKey,
          eventType: candidate.eventType,
          title: candidate.whyNow,
          whyNow: candidate.whyNow,
          body: `${product?.brand || "Tracked product"} ${product?.name || ""}`.trim(),
          read: false,
          triggeredAt: state.freshness.catalog || nowIso(),
          bestOfferNow: bestOffer ? serializeBasketOffer(bestOffer) : null,
          product,
          watch: watchRecord,
        });
      }
      return watchRecord;
    })
    .sort(
      (left, right) =>
        parseTimestamp(right.updatedAt)?.getTime() - parseTimestamp(left.updatedAt)?.getTime() ||
        String(left.comparisonKey).localeCompare(String(right.comparisonKey)),
    );
  return {
    generatedAt: state.freshness.catalog,
    summary: {
      watchCount: watching.length,
      notificationCount: alerts.length,
      unreadCount: alerts.length,
      latestNotificationId: alerts[0]?.id || null,
      latestTriggeredAt: alerts[0]?.triggeredAt || null,
    },
    alerts,
    watching,
    pushSubscriptions: [],
    emailEndpoint: null,
    settings: {
      quietHours: createDefaultQuietHours(),
      deliveryAvailability: {
        push: document.documentElement.dataset.publicShowcase !== "true" && Boolean("Notification" in window),
        email: false,
      },
      pushConfig: {
        publicKey: null,
      },
    },
  };
}

export function getTrackedAlertsRequestKey() {
  return [
    getActiveWatchedItems()
      .map((watch) => `${watch.comparisonKey}:${watch.updatedAt}`)
      .join(","),
    getCurrentRoutineProductIds().join(","),
    state.favoriteIds.join(","),
  ].join("|");
}

export function maybeShowBrowserNotifications(payload) {
  if (document.documentElement.dataset.publicShowcase === "true") return;
  if (!payload || !Array.isArray(payload.alerts) || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  const cache = state.conversion.notificationCenter;
  const seenIds = new Set(cache.lastBrowserAlertIds || []);
  payload.alerts.forEach((alert) => {
    if (!alert?.id || seenIds.has(alert.id)) return;
    if (!alert.watch?.delivery?.push) return;
    const title = alert.title || alert.whyNow || "Tracked change";
    const body = alert.body || `${alert.product?.brand || ""} ${alert.product?.name || ""}`.trim();
    if (navigator.serviceWorker?.ready) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          data: { comparisonKey: alert.comparisonKey || null, url: window.location.href },
          tag: alert.id,
        });
      }).catch(() => {
        new Notification(title, { body });
      });
    } else {
      new Notification(title, { body });
    }
    seenIds.add(alert.id);
  });
  cache.lastBrowserAlertIds = [...seenIds];
}

export async function ensureTrackedAlerts(force = false) {
  const requestKey = getTrackedAlertsRequestKey();
  const cache = state.conversion.notificationCenter;
  const fallbackPayload = buildLocalTrackedAlertsPayload();
  const activeWatches = getActiveWatchedItems();

  if (!activeWatches.length) {
    cache.requestKey = null;
    cache.payload = null;
    cache.loading = false;
    cache.error = null;
    renderTrackedAlertsPanel();
    return null;
  }
  if (!force && cache.requestKey === requestKey && (cache.payload || cache.loading)) {
    return cache.payload;
  }

  cache.requestKey = requestKey;
  cache.loading = true;
  cache.error = null;
  renderTrackedAlertsPanel();
  try {
    cache.payload = state.live.apiBacked ? await fetchJson("/api/notifications") : fallbackPayload;
    cache.error = null;
    maybeShowBrowserNotifications(cache.payload);
  } catch {
    if (!cache.payload || cache.requestKey !== requestKey) {
      cache.payload = fallbackPayload;
    }
    cache.error = "request-failed";
  } finally {
    cache.loading = false;
    renderTrackedAlertsPanel();
  }
  return cache.payload;
}

export function renderTrackedAlertCardMarkup(alert) {
  return `
    <article class="tracked-alert-card">
      <div class="tracked-alert-head">
        <div>
          <span class="tracked-alert-label">${escapeHtml(alert.title || alert.whyNow || "Tracked change")}</span>
          <strong>${escapeHtml(`${alert.product?.brand || ""} ${alert.product?.name || ""}`.trim() || "Tracked product")}</strong>
        </div>
        <span class="tracked-alert-state${alert.read ? "" : " active"}">${escapeHtml(alert.read ? "Read" : alert.title || alert.whyNow || "New")}</span>
      </div>
      <p class="tracked-alert-note">${escapeHtml(alert.body || "This tracked product changed.")}</p>
      ${
        alert.bestOfferNow
          ? `
            <div class="tracked-alert-best">
              <span>Best exact fixture offer</span>
              <strong>${escapeHtml(alert.bestOfferNow?.retailer || "Retailer")}</strong>
              <small>${typeof alert.bestOfferNow?.price === "number" ? money(alert.bestOfferNow.price) : "Price unavailable"}${
                alert.bestOfferNow?.availabilityState ? ` · ${escapeHtml(formatOfferAvailability(alert.bestOfferNow.availabilityState, alert.bestOfferNow?.availabilityDetail))}` : ""
              }</small>
              ${renderTrustMetaMarkup(alert.bestOfferNow?.trust, "tracked-alert-trust", { includeMatch: true, includeFreshness: true, includeSource: true })}
              <div class="watching-card-actions">
                <button class="panel-action-button" type="button" data-watch-open="${escapeHtml(alert.bestOfferNow?.id || alert.watch?.seedOfferId || "")}">Edit watch</button>
                ${state.live.apiBacked && !alert.read ? `<button class="panel-action-button" type="button" data-alert-read="${escapeHtml(alert.id || "")}">Mark read</button>` : ""}
                <span class="routine-basket-link" aria-disabled="true">${escapeHtml(getOutboundLabel(
                  alert.bestOfferNow?.retailer,
                  "Open",
                ))}</span>
              </div>
            </div>
          `
          : ""
      }
    </article>
  `;
}

export function renderWatchingCardMarkup(watch) {
  const latestEvent = watch.latestEvent;
  return `
    <article class="tracked-alert-card">
      <div class="tracked-alert-head">
        <div>
          <span class="tracked-alert-label">Watching</span>
          <strong>${escapeHtml(`${watch.product?.brand || ""} ${watch.product?.name || ""}`.trim() || "Tracked product")}</strong>
        </div>
        <span class="watching-card-chip">${watch.unreadCount ? `${watch.unreadCount} unread` : "Stable"}</span>
      </div>
      <div class="tracked-alert-best">
        <span>Best exact fixture offer</span>
        <strong>${escapeHtml(watch.bestOfferNow?.retailer || watch.preferredRetailer || "Retailer")}</strong>
        <small>${typeof watch.bestOfferNow?.price === "number" ? money(watch.bestOfferNow.price) : "Price unavailable"}${
          watch.bestOfferNow?.availabilityState ? ` · ${escapeHtml(formatOfferAvailability(watch.bestOfferNow.availabilityState, watch.bestOfferNow?.availabilityDetail))}` : ""
        }</small>
        ${renderTrustMetaMarkup(watch.bestOfferNow?.trust, "tracked-alert-trust", { includeMatch: true, includeFreshness: true, includeSource: true })}
        <p class="tracked-alert-note">${escapeHtml(latestEvent?.whyNow ? `Latest change: ${latestEvent.whyNow}` : "No triggered alerts yet. This watch is ready.")}</p>
        <div class="watching-card-actions">
          <button class="panel-action-button" type="button" data-watch-open="${escapeHtml(watch.seedOfferId || getFirstProductIdForComparisonKey(watch.comparisonKey) || "")}">Edit watch</button>
          <button class="panel-action-button" type="button" data-watch-remove="${escapeHtml(watch.identityKey || "")}">Stop watching</button>
        </div>
      </div>
    </article>
  `;
}

export function renderTrackedAlertsPanel() {
  if (!trackedAlertsPanel || !trackedAlertsBody) return;
  const cache = state.conversion.notificationCenter;
  const payload = cache.payload || buildLocalTrackedAlertsPayload();
  const alerts = Array.isArray(payload?.alerts) ? payload.alerts : [];
  const watching = Array.isArray(payload?.watching) ? payload.watching : [];
  const hasWatches = watching.length > 0 || getActiveWatchedItems().length > 0;
  trackedAlertsPanel.hidden = !hasWatches;
  if (!hasWatches) {
    trackedAlertsBody.innerHTML = "";
    trackedAlertsMarkReadButton.hidden = true;
    return;
  }
  void ensureTrackedAlerts();
  trackedAlertsTabAlerts?.classList.toggle("active", state.ui.trackedAlertsView === "alerts");
  trackedAlertsTabWatching?.classList.toggle("active", state.ui.trackedAlertsView === "watching");
  trackedAlertsTabAlerts?.setAttribute("aria-selected", String(state.ui.trackedAlertsView === "alerts"));
  trackedAlertsTabWatching?.setAttribute("aria-selected", String(state.ui.trackedAlertsView === "watching"));
  trackedAlertsMarkReadButton.hidden = state.ui.trackedAlertsView !== "alerts" || !state.live.apiBacked || !(payload?.summary?.unreadCount > 0);
  trackedAlertsBody.innerHTML = `
    ${cache.error && cache.payload ? `<p class="tracked-alert-note">Keeping the last alerts view while live notifications catch up.</p>` : ""}
    ${
      state.ui.trackedAlertsView === "alerts"
        ? alerts.length
          ? alerts.map((alert) => renderTrackedAlertCardMarkup(alert)).join("")
          : `<p class="tracked-alert-empty"><strong>No alerts yet.</strong> Watches are active, but nothing has crossed your price or stock rules.</p>`
        : watching.map((watch) => renderWatchingCardMarkup(watch)).join("")
    }
  `;
}

export function renderShortlistBuySummary() {
  if (!shortlistBuySummary) return;
  const subset = getShortlistCoreFirstSubset();
  const cache = getActiveBasketCache("shortlist");
  const requestKey = buildBasketRequestKey("shortlist", subset.map((entry) => entry.product.id));
  if (!subset.length || !cache.requestKey) {
    shortlistBuySummary.hidden = true;
    shortlistBuySummary.innerHTML = "";
    return;
  }
  if (cache.requestKey !== requestKey && !cache.loading) {
    void ensureBasketPlan("shortlist", subset, { dedupe: true, useLocalFallback: true });
  }
  shortlistBuySummary.hidden = false;
  shortlistBuySummary.innerHTML = renderRoutineBasketPlannerMarkup(subset, "shortlist");
}

export function chooseSaferShortlistProduct(savedProducts) {
  return [...savedProducts]
    .map((product) => ({
      product,
      score:
        scoreProduct(product) +
        (isSensitiveSafeProduct(product) ? 10 : 0) -
        getStrongActiveCount(product) * 5 -
        getProductConflictWarnings(product, { routineTime: state.routineTime }).length * 4,
    }))
    .sort((a, b) => b.score - a.score || (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER))[0]
    ?.product || null;
}

export function chooseValueShortlistProduct(savedProducts) {
  return [...savedProducts]
    .map((product) => ({
      product,
      score:
        scoreProduct(product) * 0.75 +
        (typeof product.rating === "number" ? product.rating * 2 : 0) -
        (typeof product.price === "number" ? product.price / 16 : 0),
    }))
    .sort((a, b) => b.score - a.score || (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER))[0]
    ?.product || null;
}

export const SHORTLIST_AI_FIELDS = [
  { key: "start_with", label: "Start with" },
  { key: "safer_option", label: "Safer option" },
  { key: "tradeoff", label: "Tradeoff" },
  { key: "budget_note", label: "Budget note" },
  { key: "next_step", label: "Next step" },
];
export const COMPARE_AI_FIELDS = [
  { key: "choice", label: "Choice" },
  { key: "rationale", label: "Rationale" },
  { key: "caution", label: "Caution" },
  { key: "next_step", label: "Next step" },
];
export const ROUTINE_RATIONALE_AI_FIELDS = [
  { key: "why_conservative", label: "Why this routine" },
  { key: "pressure_point", label: "Pressure point" },
  { key: "next_edit", label: "Next edit" },
];
export const LEARN_ANSWER_AI_FIELDS = [
  { key: "answer", label: "Answer" },
  { key: "evidence", label: "Evidence" },
  { key: "caution", label: "Caution" },
  { key: "next_step", label: "Next step" },
];

export function normalizeGroundedAiText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function escapeCompareAiRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function compareAiTokenPattern(token) {
  const escaped = escapeCompareAiRegex(token);
  return new RegExp(`(^|[^A-Za-z0-9_-])${escaped}(?=$|[^A-Za-z0-9_-])`, "gi");
}

export function getCompareAiProductLabel(product, fallback = "This product") {
  const displayLabel = normalizeGroundedAiText(product?.displayLabel);
  if (displayLabel) return displayLabel;
  const productLabel = normalizeGroundedAiText([product?.brand, product?.name].filter(Boolean).join(" "));
  return productLabel || fallback;
}

export function getCompareAiContextEntities(context = {}) {
  const mode = normalizeGroundedAiText(context?.mode).toLowerCase() || (context?.comparisonProduct ? "pair" : "retailer");
  const entities = [];
  const seenKeys = new Set();

  const addEntity = ({ keys = [], choiceLabel, textLabel, matchKind = "" }) => {
    const cleanKeys = keys.map((key) => normalizeGroundedAiText(key)).filter(Boolean);
    if (!cleanKeys.length) return;
    const entityKey = cleanKeys.map((key) => key.toLowerCase()).join("|");
    if (seenKeys.has(entityKey)) return;
    seenKeys.add(entityKey);
    entities.push({
      keys: cleanKeys,
      choiceLabel: normalizeGroundedAiText(choiceLabel),
      textLabel: normalizeGroundedAiText(textLabel || choiceLabel),
      matchKind: normalizeGroundedAiText(matchKind).toLowerCase(),
    });
  };

  if (mode === "pair") {
    [context?.currentProduct, context?.comparisonProduct].forEach((product, index) => {
      if (!product?.id) return;
      const label = getCompareAiProductLabel(product);
      addEntity({
        keys: [product.id, `product_${index + 1}`],
        choiceLabel: label,
        textLabel: label,
      });
    });
    return entities;
  }

  const offers = Array.isArray(context?.retailerGraph?.offers) ? context.retailerGraph.offers : [];
  const presentationMode = getCompareAiRetailerPresentationMode(context);
  offers.forEach((offer, index) => {
    if (!offer?.id) return;
    const retailer = normalizeGroundedAiText(offer.retailer || offer.displayLabel) || "This retailer";
    const matchKind = normalizeGroundedAiText(offer.matchKind).toLowerCase() || "exact";
    const textLabel =
      presentationMode === "exact"
        ? `${retailer} offer`
        : matchKind === "family"
          ? `${retailer} same-family variant`
          : matchKind === "exact"
            ? `${retailer} current product`
            : `${retailer} alternative`;
    addEntity({
      keys: [offer.id, `offer_${index + 1}`],
      choiceLabel: retailer,
      textLabel,
      matchKind,
    });
  });

  if (!offers.length && context?.currentProduct?.id) {
    const retailer = normalizeGroundedAiText(context.currentProduct.retailer || context.currentProduct.displayLabel) || "This retailer";
    addEntity({
      keys: [context.currentProduct.id, "offer_1"],
      choiceLabel: retailer,
      textLabel: `${retailer} offer`,
      matchKind: "exact",
    });
  }

  return entities;
}

export function getCompareAiRetailerPresentationMode(context = {}) {
  const graph = context?.retailerGraph || {};
  const explicitMode = normalizeGroundedAiText(graph.presentationMode).toLowerCase();
  if (explicitMode) return explicitMode;
  const graphMode = normalizeGroundedAiText(graph.comparisonMode).toLowerCase();
  if (graphMode === "closest-equivalent") return "alternative";
  const offers = Array.isArray(graph.offers) ? graph.offers : [];
  if (offers.some((offer) => normalizeGroundedAiText(offer?.matchKind).toLowerCase() === "family")) return "family";
  if (offers.some((offer) => normalizeGroundedAiText(offer?.matchKind).toLowerCase() === "alternative")) return "alternative";
  return "exact";
}

export function compareAiTextContainsContextId(text, context = {}) {
  const normalized = normalizeGroundedAiText(text);
  if (!normalized) return false;
  if (/\b(?:offer|product)_\d+\b/i.test(normalized)) return true;
  return getCompareAiContextEntities(context).some((entity) =>
    entity.keys.some((key) => compareAiTokenPattern(key).test(` ${normalized} `)),
  );
}

export function rewriteCompareAiContextIds(text, context = {}) {
  let rewritten = normalizeGroundedAiText(text);
  if (!rewritten) return rewritten;
  const replacements = [];
  getCompareAiContextEntities(context).forEach((entity) => {
    entity.keys.forEach((key) => {
      replacements.push({ key, label: entity.textLabel || entity.choiceLabel });
    });
  });
  replacements
    .sort((a, b) => b.key.length - a.key.length)
    .forEach(({ key, label }) => {
      rewritten = rewritten.replace(new RegExp(`\\(\\s*${escapeCompareAiRegex(key)}\\s*\\)`, "gi"), "");
      rewritten = rewritten.replace(compareAiTokenPattern(key), (match, prefix) => `${prefix || ""}${label}`);
    });
  return normalizeGroundedAiText(rewritten).replace(/\s+([,.;:!?])/g, "$1").replace(/\(\s*\)/g, "").trim();
}

export function getCompareAiChoiceFallback(context = {}, citedIds = [], defaultChoice = "") {
  const mode = normalizeGroundedAiText(context?.mode).toLowerCase() || (context?.comparisonProduct ? "pair" : "retailer");
  const entities = getCompareAiContextEntities(context);
  const citedSet = new Set((citedIds || []).map((id) => normalizeGroundedAiText(id).toLowerCase()).filter(Boolean));
  const cleanedDefault = normalizeGroundedAiText(defaultChoice);
  const choiceEntity = entities.find((entity) =>
    entity.keys.some((key) => compareAiTokenPattern(key).test(` ${cleanedDefault} `)),
  );
  const citedEntity = entities.find((entity) => entity.keys.some((key) => citedSet.has(key.toLowerCase())));
  const leadEntity = choiceEntity || citedEntity || entities[0] || null;
  if (leadEntity?.choiceLabel) {
    if (mode === "pair") return `${leadEntity.choiceLabel} leads this fictional pair.`;
    const presentationMode = getCompareAiRetailerPresentationMode(context);
    if (presentationMode !== "exact") {
      if (leadEntity.matchKind === "family") {
        return `${leadEntity.choiceLabel} is the same-family variant to compare against the current product.`;
      }
      if (leadEntity.matchKind === "exact") {
        return `${leadEntity.choiceLabel} is the current product in this alternative check.`;
      }
      return `${leadEntity.choiceLabel} is the closest alternative to compare against the current product.`;
    }
    return `${leadEntity.choiceLabel} leads this fictional exact-product fixture.`;
  }
  if (cleanedDefault && !compareAiTextContainsContextId(cleanedDefault, context)) {
    return ensureSentence(cleanedDefault, "Keep the current lead narrow.");
  }
  return "Keep the current lead narrow.";
}

export function parseLegacyGroundedAiString(value, fields, citationKey = "cited_product_ids") {
  const normalized = String(value || "").replace(/\r/g, "").trim();
  if (!normalized) return null;
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const leadParts = [];
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    const headingMatch = line.match(/^#*\s*([^:]+?)\s*:?\s*(.*)$/);
    const normalizedHeading = normalizeGroundedAiText(headingMatch?.[1]).toLowerCase();
    const field = fields.find(({ label }) => label.toLowerCase() === normalizedHeading);
    if (field) {
      currentSection = {
        key: field.key,
        label: field.label,
        text: headingMatch?.[2] ? [headingMatch[2]] : [],
      };
      sections.push(currentSection);
      return;
    }

    const bulletText = line.replace(/^[-*•]\s+/, "").trim();
    if (currentSection) {
      currentSection.text.push(bulletText);
      return;
    }
    leadParts.push(bulletText);
  });

  const result = {
    lead: leadParts.join(" ").trim(),
    [citationKey]: [],
  };
  fields.forEach(({ key }) => {
    result[key] = "";
  });
  sections.forEach((section) => {
    result[section.key] = section.text.join(" ").replace(/\s+/g, " ").trim();
  });
  if (!result.lead) {
    const firstKey = fields[0]?.key;
    result.lead = firstKey && result[firstKey] ? result[firstKey] : normalized;
  }
  return result;
}

export function getGroundedAiAnswerRecord(answerOrPayload) {
  if (!answerOrPayload || typeof answerOrPayload !== "object") return null;
  if (answerOrPayload.answer && typeof answerOrPayload.answer === "object") {
    return answerOrPayload.answer;
  }
  if (answerOrPayload.structuredAnswer && typeof answerOrPayload.structuredAnswer === "object") {
    return answerOrPayload.structuredAnswer;
  }
  return answerOrPayload;
}

export function getGroundedAiSectionValue(answerOrPayload, key, label) {
  const payload = answerOrPayload && typeof answerOrPayload === "object" ? answerOrPayload : null;
  const answer = getGroundedAiAnswerRecord(answerOrPayload);
  if (!answer || typeof answer !== "object") return "";

  const directValue = normalizeGroundedAiText(answer[key] ?? answer[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())]);
  if (directValue) return directValue;

  const presentationCards = Array.isArray(payload?.presentation?.cards)
    ? payload.presentation.cards
    : Array.isArray(answer.presentation?.cards)
      ? answer.presentation.cards
      : [];
  if (presentationCards.length) {
    const cardMatch = presentationCards.find((card) => {
      const cardKey = normalizeGroundedAiText(card?.key).toLowerCase();
      const cardLabel = normalizeGroundedAiText(card?.label).toLowerCase();
      return cardKey === key.toLowerCase() || cardLabel === label.toLowerCase();
    });
    if (cardMatch) {
      return normalizeGroundedAiText(cardMatch.text ?? cardMatch.body ?? cardMatch.value);
    }
  }

  if (Array.isArray(answer.sections)) {
    const sectionMatch = answer.sections.find((section) => {
      const sectionLabel = normalizeShortlistAiText(section?.label).toLowerCase();
      return sectionLabel === label.toLowerCase();
    });
    if (sectionMatch) {
      return normalizeShortlistAiText(sectionMatch.text ?? sectionMatch.body ?? sectionMatch.value);
    }
  }

  return "";
}

export function normalizeGroundedAiAnswer(
  answerOrPayload,
  fields,
  {
    fallbackLead = "Here is the current grounded read.",
    emptyLead = "Grounded AI did not return an answer.",
    citationKey = "cited_product_ids",
  } = {},
) {
  if (!answerOrPayload) {
    return null;
  }

  if (typeof answerOrPayload === "string") {
    return parseLegacyGroundedAiString(answerOrPayload, fields, citationKey);
  }

  const payload = answerOrPayload && typeof answerOrPayload === "object" ? answerOrPayload : null;
  const answer = getGroundedAiAnswerRecord(answerOrPayload);
  if (!answer || typeof answer !== "object") {
    return null;
  }

  const lead = normalizeGroundedAiText(
    answer.lead ?? answer.summary ?? answer.intro ?? answer.overview ?? payload?.presentation?.lead,
  );
  const normalized = {
    lead,
    [citationKey]: Array.isArray(answer[citationKey])
      ? answer[citationKey].map((value) => (typeof value === "string" ? value.trim() : "")).filter(Boolean)
      : [],
    citations: Array.isArray(payload?.citations) ? payload.citations : [],
  };

  fields.forEach(({ key, label }) => {
    normalized[key] = getGroundedAiSectionValue(answerOrPayload, key, label);
  });

  if (!normalized.lead) {
    const hasAnyField = fields.some(({ key }) => normalized[key]);
    normalized.lead = hasAnyField ? fallbackLead : emptyLead;
  }

  return normalized;
}

export function normalizeShortlistAiText(value) {
  return normalizeGroundedAiText(value);
}

export function normalizeShortlistAiAnswer(answer) {
  return normalizeGroundedAiAnswer(answer, SHORTLIST_AI_FIELDS, {
    fallbackLead: "Here is the current read on this decision set.",
    emptyLead: "Shortlist AI did not return an answer.",
    citationKey: "cited_product_ids",
  });
}

export function getShortlistAiSourceLabel(aiPayload = {}, answer = {}) {
  const sourceKey = normalizeGroundedAiText(answer.source || aiPayload.source).toLowerCase();
  if (sourceKey === "degraded" || sourceKey === "guardrails") return "App";
  if (sourceKey === "openai") {
    return normalizeGroundedAiText(aiPayload.model || answer.model) || "OpenAI";
  }
  const sourceLabel = normalizeGroundedAiText(
    answer.sourceLabel || answer.source || aiPayload.sourceLabel || aiPayload.source || aiPayload.model,
  );
  if (sourceLabel) return sourceLabel;
  if (answer.fallback || aiPayload.fallback) return "App";
  return "OpenAI";
}

export function isGroundedAiOpenAiPayload(aiPayload = {}, answer = {}) {
  const sourceKey = normalizeGroundedAiText(answer.source || aiPayload.source).toLowerCase();
  const model = normalizeGroundedAiText(aiPayload.model || answer.model).toLowerCase();
  return sourceKey === "openai" || /^gpt[-\w.]*$/.test(model);
}

export function isGroundedAiFallbackPayload(aiPayload = {}, answer = {}) {
  const sourceKey = normalizeGroundedAiText(answer.source || aiPayload.source).toLowerCase();
  const model = normalizeGroundedAiText(aiPayload.model || answer.model).toLowerCase();
  if (isGroundedAiOpenAiPayload(aiPayload, answer)) return false;
  if (sourceKey === "guardrails") return false;
  return Boolean(aiPayload.fallback || answer.fallback || sourceKey === "degraded" || model === "local-fallback");
}

export function getGroundedAiReadState(aiPayload = {}, answer = {}) {
  if (isGroundedAiFallbackPayload(aiPayload, answer)) return "fallback";
  if (aiPayload.degraded || answer.degraded) return "degraded";
  return "ready";
}

export function getGroundedAiStateBadge(aiPayload = {}, answer = {}) {
  const sourceKey = normalizeGroundedAiText(answer.source || aiPayload.source).toLowerCase();
  if (isGroundedAiFallbackPayload(aiPayload, answer)) return "Fallback";
  if (isGroundedAiOpenAiPayload(aiPayload, answer)) return aiPayload.degraded || answer.degraded ? "GPT + bounded" : "GPT";
  if (sourceKey === "guardrails") return "Guardrail";
  return "Grounded";
}

export function getShortlistAiCitedProducts(answerOrPayload, products = getShortlistAiEligibleProducts()) {
  const normalized = normalizeShortlistAiAnswer(answerOrPayload);
  const citedIds = Array.isArray(normalized?.cited_product_ids) ? normalized.cited_product_ids : [];
  if (!citedIds.length) return [];
  const productById = new Map(products.map((product) => [product.id, product]));
  return citedIds.map((id) => productById.get(id)).filter(Boolean);
}

export function getGroundedAiCitationLabels(aiPayload = {}, fallbackLabels = []) {
  const citations = Array.isArray(aiPayload?.citations) ? aiPayload.citations : [];
  const labels = citations
    .map((citation) => normalizeGroundedAiText(citation?.label))
    .filter(Boolean);
  return labels.length ? [...new Set(labels)] : [...new Set((fallbackLabels || []).map((label) => normalizeGroundedAiText(label)).filter(Boolean))];
}

export function renderGroundedAiSourceNote(
  contextLabel,
  aiPayload = {},
  answer = {},
  { fallback = false, citedProducts = [], citationLabels = [] } = {},
) {
  const fullFallback = Boolean(fallback) && !isGroundedAiOpenAiPayload(aiPayload, answer);
  const isFallback = fullFallback || isGroundedAiFallbackPayload(aiPayload, answer);
  const sourceLabel = getShortlistAiSourceLabel(aiPayload, answer);
  const normalizedSource = sourceLabel || (isFallback ? "App" : "OpenAI");
  const labels = getGroundedAiCitationLabels(
    aiPayload,
    citationLabels.length
      ? citationLabels
      : citedProducts.map((product) => `${product.brand} ${product.name}`),
  );
  const citationText = labels.length
    ? ` Cites ${labels.join(", ")}.`
    : "";
  if (isFallback && !/fallback/i.test(normalizedSource)) {
    return `Source: ${normalizedSource} fallback with grounded ${contextLabel} context.${citationText}`;
  }
  const validationText = aiPayload.degraded && aiPayload.degradedReason === "openai-partial-answer"
    ? " App validation filled a bounded gap."
    : "";
  return `Source: ${normalizedSource} with grounded ${contextLabel} context.${citationText}${validationText}`;
}

export function renderShortlistAiSourceNote(aiPayload = {}, answer = {}, options = {}) {
  return renderGroundedAiSourceNote("shortlist", aiPayload, answer, options);
}

export function renderCompareAiSourceNote(aiPayload = {}, answer = {}, options = {}) {
  return renderGroundedAiSourceNote("compare", aiPayload, answer, options);
}

export function normalizeCompareAiAnswer(answer, comparePayload = null) {
  const normalized = normalizeGroundedAiAnswer(answer, COMPARE_AI_FIELDS, {
    fallbackLead: "Here is the current bounded compare read.",
    emptyLead: "Compare AI did not return an answer.",
    citationKey: "cited_product_ids",
  });
  const context = comparePayload?.context || null;
  if (!normalized || !context) return normalized;

  const sanitized = { ...normalized };
  const fallbackChoice = getCompareAiChoiceFallback(context, sanitized.cited_product_ids, sanitized.choice);
  sanitized.choice = compareAiTextContainsContextId(sanitized.choice, context)
    ? fallbackChoice
    : ensureSentence(rewriteCompareAiContextIds(sanitized.choice, context), fallbackChoice);
  if (!sanitized.choice) {
    sanitized.choice = fallbackChoice;
  }
  ["rationale", "caution", "next_step"].forEach((key) => {
    sanitized[key] = rewriteCompareAiContextIds(sanitized[key], context);
  });
  return sanitized;
}

export function renderGroundedAiStructuredAnswerMarkup(
  answerOrPayload,
  fields,
  classPrefix,
  {
    emptyMessage = "Grounded AI did not return an answer.",
    fallbackLead = "Here is the current grounded read.",
    citationKey = "cited_product_ids",
    omitKeys = [],
  } = {},
) {
  const structured = normalizeGroundedAiAnswer(answerOrPayload, fields, {
    fallbackLead,
    emptyLead: emptyMessage,
    citationKey,
  });
  if (!structured) {
    return `<p class="${classPrefix}-answer-empty">${escapeHtml(emptyMessage)}</p>`;
  }
  const sections = fields
    .filter(({ key }) => !omitKeys.includes(key))
    .map(({ key, label }) => ({
      key,
      label,
      text: normalizeGroundedAiText(structured[key]),
    }))
    .filter((section) => section.text);
  return `
    <div class="${classPrefix}-answer-summary grounded-ai-answer-summary">
      <span class="grounded-ai-answer-summary-label">Grounded read</span>
      <p class="${classPrefix}-answer-lead grounded-ai-answer-lead">${escapeHtml(structured.lead)}</p>
    </div>
    <div class="${classPrefix}-answer-grid grounded-ai-answer-grid">
      ${sections
        .map(
          (section, index) => `
            <article class="${classPrefix}-answer-card grounded-ai-answer-card" data-answer-key="${escapeHtml(section.key)}" data-answer-index="${index + 1}">
              <span class="grounded-ai-answer-card-label">${escapeHtml(section.label)}</span>
              <p>${escapeHtml(section.text)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderCompareAiStructuredAnswerMarkup(answer, options = {}) {
  return renderGroundedAiStructuredAnswerMarkup(answer, COMPARE_AI_FIELDS, "compare-ai", {
    emptyMessage: "Compare AI did not return an answer.",
    fallbackLead: "Here is the current bounded compare read.",
    citationKey: "cited_product_ids",
    ...options,
  });
}

export function renderShortlistAiStructuredAnswerMarkup(answer, options = {}) {
  return renderGroundedAiStructuredAnswerMarkup(answer, SHORTLIST_AI_FIELDS, "shortlist-ai", {
    emptyMessage: "Shortlist AI did not return an answer.",
    fallbackLead: "Here is the current read on this decision set.",
    citationKey: "cited_product_ids",
    ...options,
  });
}

export function renderRoutineRationaleStructuredAnswerMarkup(answer, options = {}) {
  return renderGroundedAiStructuredAnswerMarkup(answer, ROUTINE_RATIONALE_AI_FIELDS, "routine-rationale", {
    emptyMessage: "Routine rationale is not ready yet.",
    fallbackLead: "Here is why this routine is staying conservative right now.",
    citationKey: "cited_product_ids",
    ...options,
  });
}

export function renderLearnAnswerStructuredAnswerMarkup(answer, options = {}) {
  return renderGroundedAiStructuredAnswerMarkup(answer, LEARN_ANSWER_AI_FIELDS, "learn-answer", {
    emptyMessage: "Learn answer did not return an answer.",
    fallbackLead: "Here is the grounded read from this guide.",
    citationKey: "cited_article_ids",
    ...options,
  });
}

export function buildSingleProductShortlistAnswer(question, product) {
  const normalizedQuestion = String(question || "").toLowerCase();
  const askingGoal =
    normalizedQuestion.includes("goal") ||
    normalizedQuestion.includes("best for") ||
    normalizedQuestion.includes("redness") ||
    normalizedQuestion.includes("acne") ||
    normalizedQuestion.includes("dryness") ||
    normalizedQuestion.includes("dark spots") ||
    normalizedQuestion.includes("wrinkles") ||
    normalizedQuestion.includes("texture");
  const warnings = getProductConflictWarnings(product, { routineTime: state.routineTime });
  const comparisons = getRetailerComparison(product);
  const exactMatch = comparisons.find((entry) => isRetailerExactMatch(entry));
  const why = explainProductChoice(product, {
    type: askingGoal ? "overall-pick" : "spotlight",
    concern: state.userProfile.goal || state.routineConcern,
  }).replace(/^Why this was picked:\s*/i, "");
  const strongActiveCount = getStrongActiveCount(product);
  const isCalmerStarter = isSensitiveSafeProduct(product) && strongActiveCount <= 1 && warnings.length === 0;
  const budgetNote = typeof product.price === "number"
    ? `The fictional fixture lists ${product.brand} ${product.name} at ${money(product.price)} for ${product.retailer}.${exactMatch && typeof exactMatch.candidate.price === "number" ? ` The same-product fixture at ${exactMatch.retailer} lists ${money(exactMatch.candidate.price)}.` : ""}`
    : `The fictional fixture has limited price coverage for ${product.brand} ${product.name}.${exactMatch ? ` A same-product fixture is included for ${exactMatch.retailer}.` : ""}`;
  const tradeoffText = exactMatch
    ? `${summarizeShortlistTradeoff(product)} The same fictional product also appears at ${exactMatch.retailer}, so the fixture tradeoff is price, synthetic evidence, or one-store convenience.`
    : `${summarizeShortlistTradeoff(product)} There is no exact same-product overlap in the fixture, so the main tradeoff is fit versus certainty.`;
  const currentStatus = getShortlistStatus(product.id);
  const nextStep = exactMatch
    ? `Save the ${exactMatch.retailer} match too if you want a fixture comparison before deciding.`
    : warnings[0] || strongActiveCount >= 1
      ? "Save one gentler or lower-spend backup so this product has a real comparison point before you buy."
      : currentStatus === "core"
        ? "Keep this locked as Champion only if it still beats every challenger you save next."
        : "Promote this to Champion if it still looks like the winner, or save one backup for a side-by-side check.";

  return {
    lead: askingGoal
      ? `Here is the current read for ${titleCase(state.userProfile.goal || state.routineConcern).toLowerCase()}.`
      : `Here is the current read on ${product.brand} ${product.name}.`,
    start_with: `${product.brand} ${product.name} on ${product.retailer}${isCalmerStarter ? " can stand as a reasonable starting pick" : " can work as the current leader"} because ${why.charAt(0).toLowerCase()}${why.slice(1)}.`,
    safer_option: isCalmerStarter
      ? `${product.brand} ${product.name} is already the calmer path here, so the safer move is to keep the rest of the routine simple while you test it.`
      : warnings[0]
        ? `This is not automatically the calmest starter for your current lens. Watch ${warnings[0].toLowerCase()}.`
        : "This can still work, but keep the rest of the routine gentle until you know how your skin responds.",
    tradeoff: tradeoffText,
    budget_note: budgetNote,
    next_step: nextStep,
    cited_product_ids: [product.id].filter(Boolean),
  };
}

export function buildGuardrailedShortlistAnswer(question, savedProducts) {
  const evaluation = evaluateShortlistQuestionGuardrails(question, savedProducts);
  if (!evaluation.hasGuardrail) return null;
  const safer = chooseConservativeShortlistProduct(savedProducts) || chooseSaferShortlistProduct(savedProducts);
  const saferLabel = safer ? `${safer.brand} ${safer.name}` : "the calmest cleanser, moisturizer, and sunscreen trio you can tolerate";

  if (evaluation.severity === "redirect") {
    return {
      lead: "Guardrail check for this question.",
      start_with: "Pause new actives and keep the routine simple while the skin issue is active.",
      safer_option: `${saferLabel} reads as the most conservative option in this saved set, but the symptoms themselves matter more than choosing a stronger product right now.`,
      tradeoff: `${evaluation.primaryMessage} Shopping advice should stay conservative until the reaction or symptom is assessed.`,
      budget_note: "Price is secondary when swelling, burning, rash, open skin, or other red-flag symptoms are in play.",
      next_step: "Stop new actives, use only a gentle cleanser, simple moisturizer, and sunscreen if tolerated, and get medical guidance.",
      cited_product_ids: safer?.id ? [safer.id] : [],
    };
  }

  if (evaluation.pregnancyRequested || String(evaluation.primaryTag || "").includes("pregnancy")) {
    return {
      lead: "Guardrail check for this question.",
      start_with: `${saferLabel} is the most conservative place to start from this saved set while the routine stays simple.`,
      safer_option: "Favor cleanser, moisturizer, and sunscreen before adding treatment pressure back in, and avoid calling an active definitively pregnancy-safe.",
      tradeoff: `${evaluation.primaryMessage} That shifts the read away from stronger treatment claims and toward conservative support.`,
      budget_note: "The cheaper move is usually the simpler move here: one cleanser, one moisturizer, and one sunscreen beat buying multiple actives before ingredient review.",
      next_step: "Confirm the full ingredient list with a clinician before buying a treatment step for a pregnancy-related routine.",
      cited_product_ids: safer?.id ? [safer.id] : [],
    };
  }

  return {
    lead: "Guardrail check for this question.",
    start_with: `${saferLabel} is still the better first move if you want the routine to stay realistic and repeatable.`,
    safer_option: "Keep one main treatment step and let the rest of the routine stay supportive instead of chasing a faster result with more actives.",
    tradeoff: `${evaluation.primaryMessage} Pores, dark spots, texture, and wrinkle changes usually need steady use over weeks, not overnight pressure.`,
    budget_note: "Stacking extra actives usually costs more without making the timeline realistic.",
    next_step: "Pick one lead product, wear sunscreen consistently when the goal needs it, and judge progress over weeks rather than days.",
    cited_product_ids: safer?.id ? [safer.id] : [],
  };
}

export function buildExploratoryShortlistAnswer(question, savedProducts) {
  const products = (savedProducts || []).filter(Boolean);
  const leadProduct = products[0] || null;
  const safer = chooseSaferShortlistProduct(products) || leadProduct;
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean).map(titleCase))];
  const concerns = [...new Set(products.flatMap((product) => product.concerns || []).filter(Boolean).map(titleCase))];
  const focusOptions = [
    categories.length ? `${categories.slice(0, 3).join(", ")} type${categories.length > 1 ? "s" : ""}` : null,
    concerns.length ? `${concerns.slice(0, 3).join(", ")} concern${concerns.length > 1 ? "s" : ""}` : null,
    "a browse lane",
  ].filter(Boolean);
  const leadLabel = leadProduct ? `${leadProduct.brand} ${leadProduct.name}` : "This saved pick";
  const saferLabel = safer ? `${safer.brand} ${safer.name}` : leadLabel;
  const questionText = String(question || "").toLowerCase();
  const asksSafety = /safe|starter|sensitive|irritat|caution/.test(questionText);

  return {
    lead: products.length > 1 ? "Here is the exploratory read on this saved set." : `Here is the exploratory read on ${leadLabel}.`,
    start_with: `${leadLabel} should stay a comparison point until the catalog is narrowed by ${focusOptions[0] || "a clearer shopping axis"}.`,
    safer_option: asksSafety
      ? `${saferLabel} is the calmer reference to check first, but the safer move is still to compare within one focused product type, concern, ingredient, lane, or specific search.`
      : `Use ${saferLabel} as a reference point, then compare it against products from the same focused shopping case.`,
    tradeoff: products.length > 1
      ? "The saved products may still mix different jobs, so direct winner language is premature until the focus is set."
      : "One broad saved pick is useful for orientation, but it is not enough to name a final winner across unrelated product types.",
    budget_note: "Price becomes more useful after the focus is set, because a cleanser, serum, moisturizer, and SPF do not answer the same buying question.",
    next_step: `Return to Catalog, choose ${focusOptions.join(", or ")}, then save or promote a product inside that narrower set.`,
    cited_product_ids: products.map((product) => product.id).filter(Boolean).slice(0, 4),
  };
}

export function buildShortlistAnswer(question, savedProducts) {
  if (!savedProducts.length) {
    return {
      lead: DECISION_DESK_COPY.shortlist.noShortlistBody,
      start_with: "",
      safer_option: "",
      tradeoff: "",
      budget_note: "",
      next_step: "",
      cited_product_ids: [],
    };
  }

  const guardrailed = buildGuardrailedShortlistAnswer(question, savedProducts);
  if (guardrailed) return guardrailed;

  if (isShortlistExploratoryHandoff(savedProducts)) {
    return buildExploratoryShortlistAnswer(question, savedProducts);
  }

  if (savedProducts.length === 1) {
    return buildSingleProductShortlistAnswer(question, savedProducts[0]);
  }

  const normalizedQuestion = question.toLowerCase();
  const askingGoal =
    normalizedQuestion.includes("goal") ||
    normalizedQuestion.includes("best for") ||
    normalizedQuestion.includes("redness") ||
    normalizedQuestion.includes("acne") ||
    normalizedQuestion.includes("dryness") ||
    normalizedQuestion.includes("dark spots") ||
    normalizedQuestion.includes("wrinkles") ||
    normalizedQuestion.includes("texture");

  const ranked = [...savedProducts]
    .map((product) => ({
      product,
      score: askingGoal ? scoreShortlistGoal(product) : scoreShortlistStart(product),
    }))
    .sort((a, b) => b.score - a.score || (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER));

  const decisionState = getShortlistDecisionState(savedProducts);
  const winner = decisionState.championProduct || ranked[0]?.product;
  const safer = chooseSaferShortlistProduct(savedProducts) || winner;
  const backupProduct = decisionState.backupProduct || null;
  const valuePick = chooseValueShortlistProduct(savedProducts) || winner;
  if (!winner) {
    return {
      lead: DECISION_DESK_COPY.shortlist.noClearLeadBody,
      start_with: "",
      safer_option: "",
      tradeoff: "",
      budget_note: "",
      next_step: "",
      cited_product_ids: [],
    };
  }

  const warnings = getProductConflictWarnings(winner, { routineTime: state.routineTime });
  const comparisons = getRetailerComparison(winner);
  const exactMatch = comparisons.find((entry) => isRetailerExactMatch(entry));
  const why = explainProductChoice(winner, {
    type: askingGoal ? "overall-pick" : "spotlight",
    concern: state.userProfile.goal || state.routineConcern,
  }).replace(/^Why this was picked:\s*/i, "");
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const gapSignals = buildShortlistGapSignals(savedProducts);
  const conflictSignals = buildShortlistConflictSignals(savedProducts);
  const saferWarnings = getProductConflictWarnings(safer, { routineTime: state.routineTime });
  const tradeoffParts = [];

  if (winner && backupProduct && winner.id !== backupProduct.id) {
    tradeoffParts.push(`${winner.brand} ${winner.name} is the current champion, while ${backupProduct.brand} ${backupProduct.name} is the current backup.`);
  } else if (winner && safer && winner.id !== safer.id) {
    tradeoffParts.push(`${winner.brand} ${winner.name} is the stronger start, while ${safer.brand} ${safer.name} is the calmer option.`);
  }
  if (valuePick && winner.id !== valuePick.id && safer.id !== valuePick.id) {
    tradeoffParts.push(`${valuePick.brand} ${valuePick.name} is the lower-spend pick if price pressure matters most.`);
  }
  if (!tradeoffParts.length) {
    tradeoffParts.push(`${winner.brand} ${winner.name} is doing more than one job here: strongest lead, calmer fit, or best value.`);
  }

  const budgetNote = shortlistPayload?.summary?.total != null
    ? `The current approved subset lands at ${money(shortlistPayload.summary.total)}${shortlistPayload?.oneStoreBasket?.retailer ? ` with the cleanest one-store path at ${shortlistPayload.oneStoreBasket.retailer}` : ""}.`
    : valuePick && typeof valuePick.price === "number"
      ? `${valuePick.brand} ${valuePick.name} is the lowest-spend strong option at ${money(valuePick.price)} on ${valuePick.retailer}.`
      : "Budget gets clearer once one saved product is Champion and one backup is locked.";

  let nextStep = shortlistPayload?.oneStoreBasket?.retailer
    ? `Open Shortlist and approve the final basket at ${shortlistPayload.oneStoreBasket.retailer}.`
    : !backupProduct
      ? `Lock one backup next to ${winner.brand} ${winner.name} before you price or plan the basket.`
    : gapSignals[0]
      ? gapSignals[0]
      : "Mark one product Champion and one product Backup so the decision set becomes actionable.";
  if (conflictSignals[0] && !shortlistPayload?.oneStoreBasket?.retailer) {
    nextStep = `${conflictSignals[0]} Then cut back to the strongest 2 to 4 products.`;
  }

  return {
    lead: askingGoal
      ? `Here is the current read for ${titleCase(state.userProfile.goal || state.routineConcern).toLowerCase()}.`
      : "Here is the current read on this decision set.",
    start_with: `${winner.brand} ${winner.name} on ${winner.retailer} leads because ${why.charAt(0).toLowerCase()}${why.slice(1)}.`,
    safer_option:
      safer.id === winner.id
        ? `${safer.brand} ${safer.name} is also the calmer starter in this set.${warnings[0] ? ` Watch ${warnings[0].toLowerCase()}` : ""}`
        : `${safer.brand} ${safer.name} is the calmer pick if you want a lower-irritation start.${saferWarnings[0] ? ` Watch ${saferWarnings[0].toLowerCase()}` : ""}`,
    tradeoff: `${tradeoffParts.join(" ")} ${exactMatch ? `The lead product also appears at ${exactMatch.retailer}, so retailer choice can come down to price or trust.` : summarizeShortlistTradeoff(winner)}`,
    budget_note: budgetNote,
    next_step: nextStep,
    cited_product_ids: [winner?.id, safer?.id, backupProduct?.id].filter(Boolean),
  };
}

export function buildShortlistAiPayload(question, savedProducts) {
  return {
    question,
    productIds: savedProducts.map((product) => product.id).filter(Boolean).slice(0, 4),
    savedIds: [...new Set(state.favoriteIds.filter(Boolean))],
    savedArticleIds: [...new Set(state.savedArticleIds.filter(Boolean))],
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

export async function requestShortlistAiAnswer(question, savedProducts) {
  const payload = buildShortlistAiPayload(question, savedProducts);
  return postJson("/api/shortlist-explainer", payload);
}

export function formatShortlistAiAnswer(answer) {
  return renderShortlistAiStructuredAnswerMarkup(answer);
}

export function renderShortlistAiIdleState() {
  const savedProducts = getShortlistAiEligibleProducts();
  const mode = getShortlistAiMode(savedProducts);
  const exploratoryHandoff = isShortlistExploratoryHandoff(savedProducts);
  const lead = exploratoryHandoff
    ? SHORTLIST_EXPLORATORY_COPY.idleLead
    : mode === "single"
      ? DECISION_DESK_COPY.shortlist.singleIdleLead
      : mode === "empty"
        ? DECISION_DESK_COPY.shortlist.noShortlistTitle
        : DECISION_DESK_COPY.shortlist.idleLead;
  const body = exploratoryHandoff
    ? SHORTLIST_EXPLORATORY_COPY.idleBody
    : mode === "single"
      ? DECISION_DESK_COPY.shortlist.singleIdleBody
      : mode === "empty"
        ? DECISION_DESK_COPY.shortlist.noShortlistBody
        : DECISION_DESK_COPY.shortlist.idleBody;
  setShortlistAiState("ready");
  shortlistAiResponse.hidden = false;
  shortlistAiResponse.classList.remove("shortlist-ai-response-thinking", "shortlist-ai-response-answered");
  shortlistAiResponse.classList.add("shortlist-ai-response-idle");
  shortlistAiResponse.removeAttribute("aria-busy");
  shortlistAiResponse.innerHTML = `
    <strong>${lead}</strong>
    <p>${body}</p>
  `;
}

export async function renderShortlistAiResponse() {
  const question = shortlistAiInput.value.trim();
  const savedProducts = getShortlistAiEligibleProducts();
  const mode = getShortlistAiMode(savedProducts);
  if (!savedProducts.length) {
    renderShortlistAiIdleState();
    return;
  }
  if (!question) {
    renderShortlistAiIdleState();
    return;
  }
  const answer = buildShortlistAnswer(question, savedProducts);

  setActiveShellView("shortlist", { focus: false });
  state.ui.shortlistExpanded = true;
  shortlistAiSubmit.disabled = true;
  shortlistAiSubmit.textContent = DECISION_DESK_COPY.shortlist.thinkingButtonLabel;
  setShortlistAiState("thinking");
  shortlistAiResponse.hidden = false;
  shortlistAiResponse.classList.remove("shortlist-ai-response-idle", "shortlist-ai-response-answered");
  shortlistAiResponse.classList.add("shortlist-ai-response-thinking");
  shortlistAiResponse.setAttribute("aria-busy", "true");
  shortlistAiResponse.innerHTML = `
    <span class="shortlist-ai-source-badge">Thinking</span>
    <strong>Decision read</strong>
    <div class="shortlist-ai-answer-body">
      <p class="shortlist-ai-answer-lead">${mode === "single" ? DECISION_DESK_COPY.shortlist.singleThinkingLead : DECISION_DESK_COPY.shortlist.thinkingLead}</p>
      <p>${mode === "single" ? DECISION_DESK_COPY.shortlist.singleThinkingBody : DECISION_DESK_COPY.shortlist.thinkingBody}</p>
    </div>
  `;
  syncSupportDisclosureUi();
  scrollShortlistDockToAiArea();

  try {
    const aiPayload = await requestShortlistAiAnswer(question, savedProducts);
    if (aiPayload?.ok && aiPayload.answer) {
      const isFallback = isGroundedAiFallbackPayload(aiPayload, aiPayload.answer);
      const sourceNote = renderShortlistAiSourceNote(aiPayload, aiPayload.answer, {
        fallback: isFallback,
        citedProducts: getShortlistAiCitedProducts(aiPayload, savedProducts),
      });
      setShortlistAiState("answered");
      shortlistAiResponse.classList.remove("shortlist-ai-response-thinking", "shortlist-ai-response-idle");
      shortlistAiResponse.classList.add("shortlist-ai-response-answered");
      shortlistAiResponse.removeAttribute("aria-busy");
      shortlistAiResponse.innerHTML = `
        <span class="shortlist-ai-source-badge answer">${escapeHtml(getGroundedAiStateBadge(aiPayload, aiPayload.answer))}</span>
        <strong>Decision read</strong>
        <div class="shortlist-ai-answer-body">
          ${renderShortlistAiStructuredAnswerMarkup(aiPayload)}
        </div>
        <p class="shortlist-ai-source-note"><small>${escapeHtml(sourceNote)}</small></p>
      `;
      scrollShortlistDockToAiArea();
      return;
    }
  } catch {
    // Fall back to the grounded local answer below.
  } finally {
    shortlistAiSubmit.disabled = false;
    shortlistAiSubmit.textContent = DECISION_DESK_COPY.shortlist.askLabel;
    syncShortlistAiControls();
  }

  setShortlistAiState("answered");
  shortlistAiResponse.classList.remove("shortlist-ai-response-thinking", "shortlist-ai-response-idle");
  shortlistAiResponse.classList.add("shortlist-ai-response-answered");
  shortlistAiResponse.removeAttribute("aria-busy");
  shortlistAiResponse.innerHTML = `
    <span class="shortlist-ai-source-badge answer">${DECISION_DESK_COPY.shortlist.answerBadge}</span>
    <strong>Decision read</strong>
    <div class="shortlist-ai-answer-body">
      ${renderShortlistAiStructuredAnswerMarkup(answer)}
    </div>
    <p class="shortlist-ai-source-note"><small>${DECISION_DESK_COPY.shortlist.sourceNoteFallback}</small></p>
  `;
  scrollShortlistDockToAiArea();
}
