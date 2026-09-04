// Product card, retailer-check comparison, basket, popover, and practical card-level handlers.
// Browser-native ES module. Keep behavior changes in focused feature commits.
import { applyProductImage, buildProductComparisonQuery, fetchJson, postJson } from "./api.js";
import {
  clearResidualShadowDemo,
  renderResidualShadowDemo,
} from "./recommender_residual_shadow_demo.js";
import {
  addProductsToFavorites,
  applyArticleJourney,
  applyBrowseLane,
  applyLensPreset,
  applyLensPromptTarget,
  applyOverviewLauncher,
  applyOverviewTemplate,
  buildCatalogChoiceMap,
  clearBrowseLaneSelection,
  clearLensDirtyPrompt,
  clearSingleFilter,
  closeLensDrawer,
  CATALOG_DECISION_MODES,
  enterWorkMode,
  escapeHtml,
  explainCatalogChoiceCompact,
  explainProductChoice,
  formatCompactRatingLine,
  formatOfferAvailability,
  formatRatingLine,
  getActiveBrowseLane,
  getActiveCatalogFilterCount,
  getBestPickEntries,
  getBudgetLabel,
  getCatalogCardSignalProfile,
  getCatalogComparisonSnapshot,
  getCatalogCaseEvidence,
  getCatalogContextSignal,
  getCatalogDecisionMode,
  getCatalogFamilyCollapseKey,
  getCatalogMerchBadgeEntries,
  getCatalogRankingContext,
  getCatalogRenderContext,
  getCatalogTagLabels,
  getDefaultLearnAnswerQuestion,
  getVisibleLensGoalLabel,
  getMarketViewSnapshot,
  getOfferAvailabilityGroup,
  getPrimaryProductCaution,
  getProductById,
  getProductLookupState,
  getProfileLabel,
  getSavedUserProfileRecord,
  getSpotlightProduct,
  getStrongActiveCount,
  handleOverviewAction,
  handleOverviewConcernChip,
  handleOverviewConcernInput,
  handleOverviewConcernPrimaryAction,
  handleOverviewRouteAction,
  isFocusedCatalogFilterLoading,
  isFocusedCatalogFilterSettled,
  isCatalogDecisionReady,
  isMobileCatalogViewport,
  money,
  normalizeCatalogVariantFamilyText,
  normalizeUserProfileGoalForLens,
  openMobileCatalogFocusRail,
  openShortlistCompareMode,
  openUserProfileEditor,
  parseTimestamp,
  persistRoutinePlannerSession,
  persistUiSessionState,
  pickTopProduct,
  refreshOverviewSurface,
  renderActiveFilters,
  renderActiveWorkspaceSurface,
  renderArticles,
  renderBestPicks,
  renderBrowseLanes,
  renderCaseSummaryItems,
  renderCatalogContextSignalMarkup,
  renderCatalogProofGridMarkup,
  renderCatalogQuickStatusMarkup,
  renderCatalogSupportDetailMarkup,
  renderHeroMerchGrid,
  renderPagination,
  renderRetailerOfferHistory,
  renderSavedPresets,
  requestFocusedCatalogFilterSlice,
  requestLearnAnswer,
  resetFilters,
  resetRoutinePlannerCaches,
  resetUserProfile,
  resolveArticleSelection,
  scheduleAfterCatalogCardsPaint,
  saveUserProfile,
  scoreBudgetOverall,
  scrollLensDrawerElementIntoView,
  setActiveShellView,
  setConcern,
  setLastLensDrawerTrigger,
  setLearnAnswerDraft,
  setUserProfileSummaryTab,
  selectOverviewFocusPath,
  setupCatalogStickyOffsetSync,
  setupShellNavigation,
  setupSupportWorkspaceNavigation,
  shouldShowCatalogIngredientInsight,
  syncCatalogFilterDisclosure,
  syncCatalogStickyOffsets,
  syncCatalogResultsReadyState,
  syncCatalogStickyState,
  syncShellViewToLocation,
  syncSupportDisclosureUi,
  syncUserProfileSurface,
  titleCase,
  toggleMobileCatalogFocusRail,
  toggleLensDrawer,
  trapLensDrawerFocus,
  updateUserProfileDraft,
} from "./catalog.js";
import {
  EQUIVALENT_INGREDIENT_GROUPS,
  INGREDIENT_RULES,
  getProductConflictWarnings,
  renderConflictMarkup,
  renderIngredientInsightMarkup,
} from "./guardrails.js";
import {
  closeRoutineChooser,
  focusRoutineBuilder,
  getRoutinePlannerAvoidIngredients,
  getRoutineStepPriority,
  getSerializableRoutineDraftState,
  handleRoutineAction,
  normalizeSkinProfile,
  planAroundProduct,
  positionRoutineSwapDrawer,
  renderRoutineBuilder,
  syncRoutinePlannerDraftSoon,
  trapRoutineSwapFocus,
} from "./routine.js";
import {
  applySavedProfile,
  applySavedRoutine,
  claimContinuityPairCode,
  closeShortlistSheet,
  closeWatchSettings,
  deleteContinuityData,
  getDecisionNextActionContext,
  getFirstProductIdForComparisonKey,
  getGroundedAiCitationLabels,
  getGroundedAiReadState,
  getGroundedAiStateBadge,
  getShortlistBackupProduct,
  getShortlistChampionProduct,
  getShortlistCoreFirstSubset,
  getShortlistSavedProducts,
  getShortlistStatus,
  getWatchByIdentityKey,
  isGroundedAiFallbackPayload,
  isTrackedAlertId,
  markAllNotificationsRead,
  markNotificationRead,
  normalizeCompareAiAnswer,
  openDecisionWorkspaceSection,
  openWatchSettings,
  persistUserProfile,
  removeSavedPreset,
  removeWatchSettings,
  renderCompareAiSourceNote,
  renderCompareAiStructuredAnswerMarkup,
  renderCatalogShortlistRail,
  renderContinuityCard,
  renderDecisionWorkspaceSummary,
  renderFavorites,
  renderShortlistAiIdleState,
  renderShortlistAiResponse,
  renderTrackedAlertsPanel,
  requestContinuityPairCode,
  resetContinuityData,
  runDecisionNextAction,
  saveCurrentProfile,
  saveCurrentRoutine,
  saveWatchSettings,
  scrollShortlistDockToAiArea,
  setShortlistStatus,
  startNotificationEmailFromDialog,
  syncShortlistAiControls,
  toggleFavorite,
  toggleSavedArticle,
  toggleTrackedAlert,
  trapWatchSettingsFocus,
  verifyNotificationEmailFromDialog,
} from "./shortlist.js";
import {
  AFFILIATE_CONFIG,
  DECISION_DESK_COPY,
  SEARCH_RENDER_DEBOUNCE_MS,
  activeFilters,
  advisorPicks,
  advisorPlanLeadButton,
  advisorSaveLeadButton,
  advisorToggle,
  articleGroups,
  articleSaveButton,
  articleShopLink,
  articleTabs,
  avoidIngredients,
  bestPicks,
  brandFilter,
  browseLanes,
  cancelUserProfileButton,
  catalogCommandBar,
  catalogFocusToggleButton,
  catalogMoreFiltersButton,
  catalogOpenShortlistButton,
  categoryFilter,
  clearFiltersButton,
  closeUserProfileDrawerButton,
  compareExplainerRequests,
  concernChips,
  continuityCard,
  continuityCreateCodeButton,
  continuityDeleteWorkspaceButton,
  continuityJoinCodeInput,
  continuityJoinPanel,
  continuityJoinSubmitButton,
  continuityJoinToggleButton,
  continuityPairCode,
  continuityResetDataButton,
  controlsPanel,
  decisionStrip,
  densityCompactButton,
  densityDecisionButton,
  editUserProfileButton,
  ingredientFilter,
  learnAnswerInput,
  learnAnswerPrompts,
  learnAnswerSubmit,
  lensDirtyDiscardButton,
  lensDirtyKeepButton,
  lensDirtySaveButton,
  lensDrawerBackdrop,
  lensQuickPresets,
  marketApplyWinnerButton,
  marketOpenBasketButton,
  marketToggle,
  openUserProfileEditorButton,
  overviewLauncherGrid,
  overviewShellView,
  paginationBar,
  pickModes,
  picksSaveModeButton,
  productComparisonRequests,
  productGrid,
  profileFilter,
  quickConcerns,
  resetUserProfileButton,
  resultsCaption,
  resultsNextStep,
  resultsStateLine,
  resultsTitle,
  retailerFilter,
  routineBudget,
  routineConcern,
  routineDraftBrief,
  routineGrid,
  routineSaveCurrentButton,
  routineSummary,
  routineSwapDrawer,
  routineTime,
  saveCurrentProfileInlineButton,
  saveProfileButton,
  saveRoutineButton,
  saveUserProfileButton,
  savedArticles,
  savedGrid,
  savedProfiles,
  savedRoutines,
  scrollTopButton,
  searchInput,
  shortlistAiInput,
  shortlistAiPrompts,
  shortlistAiSubmit,
  shortlistAiToggle,
  shortlistBuildPlanButton,
  shortlistBuyCoreButton,
  shortlistBuySummary,
  shortlistEmptyCtaButton,
  shortlistSheetBackdrop,
  shortlistSheetCloseButton,
  shortlistToRoutineButton,
  sortFilter,
  getMotionSafeScrollBehavior,
  state,
  supportSessionStrip,
  template,
  trackedAlertsBody,
  trackedAlertsMarkReadButton,
  trackedAlertsTabAlerts,
  trackedAlertsTabWatching,
  userActivesComfortSelect,
  userBudgetSelect,
  userGoalSelect,
  userNameInput,
  userProfileNavEdit,
  userProfileNavOverview,
  userProfileNavSaved,
  userProfileOpenSavedButton,
  userProfileQuickSwitches,
  userSensitivitySelect,
  userSkinProfileSelect,
  watchEmailStartButton,
  watchEmailVerifyButton,
  watchSettingsBackdrop,
  watchSettingsCloseButton,
  watchSettingsDialog,
  watchSettingsForm,
  watchSettingsRemoveButton,
  workModeCasebar,
  workspaceSupernavShell,
} from "./state.js";

export let catalogSearchRenderTimer = null;

function closeMobileCatalogHeaderModesAfterSelection() {
  if (!isMobileCatalogViewport()) return;
  const changed = Boolean(state.ui.secondaryFiltersOpen || state.ui.catalogFocusRailOpen);
  state.ui.secondaryFiltersOpen = false;
  state.ui.catalogFocusRailOpen = false;
  if (changed) persistUiSessionState();
}
let openCatalogReasoningProductId = null;
let catalogProductRenderSequence = 0;

export function normalizeComparableText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/\b(serum|cream|cleanser|moisturizer|mask|treatment|gel|lotion|spf|sunscreen|essence|toner|face|facial)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatEquivalentSharedConcernReason(sharedConcerns = []) {
  const concerns = sharedConcerns
    .map((concern) => String(concern || "").replace(/\s+/g, " ").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 2);
  if (!concerns.length) return "";
  return `Shared ${concerns.join(" + ")} concern${concerns.length === 1 ? "" : "s"}`;
}

export function normalizeEquivalentReasonLabel(reason) {
  const text = String(reason || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const match = text.match(/^([a-z0-9]+(?: [a-z0-9]+)*(?: \+ [a-z0-9]+(?: [a-z0-9]+)*)*) fit$/i);
  if (!match) return text;
  return formatEquivalentSharedConcernReason(match[1].split(" + "));
}

export function normalizeEquivalentReasonLabels(reasons = [], limit = 3) {
  if (!Array.isArray(reasons)) return [];
  const labels = [];
  reasons.forEach((reason) => {
    const label = normalizeEquivalentReasonLabel(reason);
    if (label && !labels.includes(label)) {
      labels.push(label);
    }
  });
  return labels.slice(0, limit);
}

export function hasAffiliateEnabled(retailer) {
  return Boolean(AFFILIATE_CONFIG.retailers[retailer]?.enabled);
}

export function getOutboundLabel(retailer, baseLabel = "") {
  return `Inert demo link · ${retailer}`;
}

export function getTopLabel(items, key) {
  const counts = {};
  items.forEach((item) => {
    const value = item[key];
    if (!value) return;
    counts[value] = (counts[value] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted[0]?.[0] || null;
}

export function getTopConcern(products) {
  const counts = {};
  products.forEach((product) => {
    product.concerns.forEach((concern) => {
      counts[concern] = (counts[concern] || 0) + 1;
    });
  });
  const sorted = Object.entries(counts)
    .filter(([concern]) => concern !== "general care")
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return sorted[0]?.[0] || "general care";
}

export function getDecisionStripData(filtered, overall = null, marketSnapshot = null) {
  const rankingContext = getCatalogRankingContext();
  const decisionReady = isCatalogDecisionReady(rankingContext);
  const currentConcern = rankingContext.primaryConcern || rankingContext.concern || "general care";
  const currentLabel =
    rankingContext.isNeutral && state.category !== "all"
      ? state.category
      : rankingContext.isNeutral
        ? "broad catalog"
        : rankingContext.sourceLabel || currentConcern;
  const leadProduct = overall || getSpotlightProduct(filtered);
  const budget = pickTopProduct(filtered, scoreBudgetOverall);
  const snapshot = marketSnapshot || getMarketViewSnapshot(filtered);
  const groups = snapshot.groups || [];
  const selectionLeader = snapshot.selectionLeader || null;
  const valueLeader = snapshot.valueLeader || null;
  const ratedLeader = snapshot.ratedLeader || null;
  const concernLeader = snapshot.concernLeader || null;
  const retailerLeader =
    groups.find((entry) => entry.retailer === (concernLeader || valueLeader || ratedLeader || selectionLeader)) || groups[0] || null;

  return {
    overall: leadProduct,
    budget,
    currentConcern,
    retailerLeader,
    decisionReady,
    nextStep:
      !decisionReady
        ? "Pick a lane to rank with confidence."
        : state.category === "all"
        ? `Start with ${titleCase(currentLabel)} and let the app narrow the strongest cleanser, treatment, moisturizer, or SPF step.`
        : `Stay in ${titleCase(state.category)} and keep the shortlist tight around ${titleCase(currentLabel)}.`,
  };
}

export function getCatalogLeadLanguage(decisionReady = isCatalogDecisionReady()) {
  return decisionReady
    ? {
        summaryLabel: "Leader",
        emptyValue: "No clear leader yet",
        emptyDetail: "Tighten the case until one product deserves the lead.",
        stripLabel: "Current leader",
        signalLabel: "Strongest signal",
        spotlightLabel: "Current leader",
        saveLabel: "Save current leader",
        planAction: "plan",
        planLabel: "Plan around leader",
        retailerLabel: "Retailer winner",
      }
    : {
        summaryLabel: "Starting point",
        emptyValue: "Choose a focus",
        emptyDetail: "Choose a product type, concern, lane, or ingredient before ranking products.",
        stripLabel: "Starting point",
        signalLabel: "Representative shelf scan",
        spotlightLabel: "Starting point",
        saveLabel: "Save first pick",
        planAction: "focus",
        planLabel: "Choose focus",
        retailerLabel: "Retailer read",
      };
}

export function renderDecisionStrip(filtered, leadProduct = null, marketSnapshot = null) {
  if (!decisionStrip) return;
  const readyForDecision = isCatalogDecisionReady();
  decisionStrip.dataset.decisionReady = String(readyForDecision);
  decisionStrip.setAttribute(
    "aria-label",
    readyForDecision ? "Current strongest product signal" : "Representative catalog starting point",
  );
  if (!filtered.length) {
    decisionStrip.hidden = true;
    decisionStrip.innerHTML = "";
    return;
  }

  const data = getDecisionStripData(filtered, leadProduct, marketSnapshot);
  decisionStrip.dataset.decisionReady = String(data.decisionReady);
  if (!data.overall?.id) {
    decisionStrip.hidden = true;
    decisionStrip.innerHTML = "";
    return;
  }
  const overallCaution = getPrimaryProductCaution(data.overall);
  const leadLanguage = getCatalogLeadLanguage(data.decisionReady);
  decisionStrip.setAttribute(
    "aria-label",
    data.decisionReady ? "Current strongest product signal" : "Representative catalog starting point",
  );
  const proofLine = (explainProductChoice(data.overall, { type: "overall-pick" }) || "")
    .replace(/^Why this was picked:\s*/i, "")
    .replace(/\.$/, "");
  const alreadySaved = state.favoriteIds.includes(data.overall.id);
  decisionStrip.hidden = false;
  decisionStrip.innerHTML = `
    <article class="lead-strip-card">
      <div class="lead-strip-copy">
        <span class="lead-strip-label">${escapeHtml(leadLanguage.signalLabel || leadLanguage.stripLabel)}</span>
        <div class="lead-strip-head">
          <strong>${escapeHtml(`${data.overall.brand} ${data.overall.name}`)}</strong>
          <div class="lead-strip-meta">
            <span>${escapeHtml(data.overall.retailer)}</span>
            <span>${escapeHtml(money(data.overall.price))}</span>
          </div>
        </div>
        <p class="lead-strip-proof"><strong>Proof</strong> <span>${escapeHtml(proofLine || "Strong fit right now.")}</span></p>
        <p class="lead-strip-caution"><strong>Caution</strong><span>${escapeHtml(overallCaution)}</span></p>
      </div>
      <div class="lead-strip-sidecar">
        <p class="lead-strip-retailer">
          <span>${escapeHtml(leadLanguage.retailerLabel)}</span>
          <strong>${escapeHtml(data.retailerLeader?.retailer || "Still balancing")}</strong>
        </p>
        <p class="lead-strip-next">${escapeHtml(data.nextStep)}</p>
      </div>
      <div class="lead-strip-actions">
        <button class="panel-action-button primary" type="button" data-lead-action="save" data-product-id="${escapeHtml(data.overall.id)}">${alreadySaved ? "Open shortlist" : leadLanguage.saveLabel}</button>
        <button class="panel-action-button" type="button" data-lead-action="${escapeHtml(leadLanguage.planAction)}" data-product-id="${escapeHtml(data.overall.id)}">${escapeHtml(leadLanguage.planLabel)}</button>
      </div>
    </article>
  `;
}

export function getCatalogCommandCaseSummary(activeLane, filteredCount, totalPages) {
  if (!filteredCount) {
    return {
      value: "No fixture matches",
      detail: "Clear one scope filter or switch lanes to reopen the catalog.",
    };
  }
  const rankingContext = getCatalogRankingContext();
  const decisionReady = isCatalogDecisionReady(rankingContext);
  const searchText = String(state.search || "").trim();
  const scopeFilters = [
    state.retailer !== "all" ? state.retailer : null,
    state.brand !== "all" ? state.brand : null,
  ].filter(Boolean);
  const caseLabel = activeLane?.label
    || (state.concern !== "all" ? `${titleCase(state.concern)} case` : "")
    || (state.category !== "all" ? titleCase(state.category) : "")
    || (decisionReady && !rankingContext.isNeutral && rankingContext.sourceLabel ? rankingContext.sourceLabel : "")
    || (searchText ? `Search · ${searchText}` : "")
    || "Broad catalog";
  const pageLabel = totalPages > 1 ? ` · ${totalPages} page${totalPages === 1 ? "" : "s"}` : "";
  const scopeLabel = scopeFilters.length ? ` · ${scopeFilters.join(" + ")} scope` : "";
  return {
    value: caseLabel,
    detail: `${filteredCount} fixture match${filteredCount === 1 ? "" : "es"}${pageLabel}${scopeLabel}`,
  };
}

export function getCatalogCommandDecisionSummary(savedProducts = getShortlistSavedProducts(), { decisionReady = true } = {}) {
  const count = savedProducts.length;
  const championProduct = getShortlistChampionProduct(savedProducts);
  const backupProduct = getShortlistBackupProduct(savedProducts);
  if (!count) {
    return {
      value: "No decision set yet",
      detail: decisionReady
        ? "Save one leader and one challenger to start the call."
        : "Choose a product type, concern, ingredient, lane, or specific search before ranking saved picks.",
    };
  }
  if (!decisionReady) {
    return {
      value: `${count} saved · focus open`,
      detail: "Use saved picks as references until a product type, concern, ingredient, lane, or specific search is active.",
    };
  }
  if (championProduct && backupProduct) {
    return {
      value: `${count} saved · champion + backup`,
      detail: `${championProduct.brand} leads while ${backupProduct.brand} stays ready as backup.`,
    };
  }
  if (championProduct) {
    return {
      value: `${count} saved · backup still open`,
      detail: `${championProduct.brand} is locked as champion. Add or promote one backup next.`,
    };
  }
  return {
    value: `${count} saved · champion still open`,
    detail: "Promote one saved product to champion before you price the path.",
  };
}

export function getCatalogDecisionActionForReadiness(decisionAction = null, decisionReady = isCatalogDecisionReady()) {
  if (decisionReady || !decisionAction) return decisionAction;
  return {
    ...decisionAction,
    key: "focus-catalog-work",
    tone: "build",
    badge: "Choose focus",
    primaryLabel: "Choose focus",
    detail: "Choose a product type, concern, ingredient, lane, or a search like vitamin c serum before ranking or promoting saved picks.",
    productId: "",
    workspaceSection: "shopping-brief-panel",
  };
}

export function getCaseSummaryLeaderSummary(leadProduct = null, { decisionReady = true } = {}) {
  if (!leadProduct) {
    const leadLanguage = getCatalogLeadLanguage(decisionReady);
    return {
      value: leadLanguage.emptyValue,
      detail: leadLanguage.emptyDetail,
    };
  }
  return {
    value: `${leadProduct.brand} ${leadProduct.name}`,
    detail: `${leadProduct.retailer}${typeof leadProduct.price === "number" ? ` · ${money(leadProduct.price)}` : ""}`,
  };
}

export function getCatalogCommandLensSummary() {
  const savedProfile = getSavedUserProfileRecord();
  const profileLabel = getProfileLabel(savedProfile.profile);
  const budgetLabel = getBudgetLabel(savedProfile.budget);
  const goalLabel = getVisibleLensGoalLabel(savedProfile);
  const decisionReady = isCatalogDecisionReady();

  return {
    value: [profileLabel, budgetLabel].filter(Boolean).join(" · "),
    detail: goalLabel === "Goal not set"
      ? "exploratory lens"
      : decisionReady
        ? `${goalLabel} ranking lens`
        : `${goalLabel} starting-point lens`,
  };
}

export function buildCaseSummaryItems({
  filteredCount = 0,
  totalPages = 1,
  activeLane = null,
  leadProduct = null,
  marketSnapshot = null,
  shortlistPayload = null,
  savedProducts = getShortlistSavedProducts(),
  includeAction = false,
  compactLabels = false,
  decisionReady = null,
} = {}) {
  const rankingContext = getCatalogRankingContext();
  const resolvedDecisionReady = decisionReady == null ? isCatalogDecisionReady(rankingContext) : Boolean(decisionReady);
  const leadLanguage = getCatalogLeadLanguage(resolvedDecisionReady);
  const lensSummary = getCatalogCommandLensSummary();
  const caseSummary = getCatalogCommandCaseSummary(activeLane, filteredCount, totalPages);
  const leaderSummary = getCaseSummaryLeaderSummary(leadProduct, { decisionReady: resolvedDecisionReady });
  const decisionSummary = getCatalogCommandDecisionSummary(savedProducts, { decisionReady: resolvedDecisionReady });
  const decisionAction = getDecisionNextActionContext({
    leadProduct,
    savedProducts,
    marketSnapshot,
    shortlistPayload,
  });
  const displayDecisionAction = getCatalogDecisionActionForReadiness(decisionAction, resolvedDecisionReady);

  const scopeDetail = [caseSummary.detail, `${lensSummary.value} · ${lensSummary.detail}`].filter(Boolean).join(" · ");

  return [
    {
      key: "case",
      label: "Shopping within",
      value: caseSummary.value,
      detail: scopeDetail,
      action: includeAction
        ? {
            key: "open-lens-editor",
            label: "Edit lens",
            ariaLabel: "Edit Skin Lens",
            ariaControls: "lens-drawer-panel",
            ariaExpanded: state.ui.lensDrawerOpen,
          }
        : null,
    },
    {
      key: "leader",
      label: leadLanguage.summaryLabel,
      value: leaderSummary.value,
      detail: resolvedDecisionReady || !leadProduct
        ? leaderSummary.detail
        : "Choose a product type, concern, lane, or ingredient before ranking this pick.",
    },
    {
      key: "decision",
      label: compactLabels ? "Saved" : "Saved set",
      value: decisionSummary.value,
      detail: decisionSummary.detail,
    },
    {
      key: "next",
      label: compactLabels ? "Next" : "Next action",
      value: displayDecisionAction.primaryLabel,
      detail: displayDecisionAction.detail,
      action: includeAction
        ? {
            key: displayDecisionAction.key,
            label: displayDecisionAction.primaryLabel,
            productId: displayDecisionAction.productId || "",
            workspaceSection: displayDecisionAction.workspaceSection || "",
            tone: "primary",
          }
        : null,
    },
  ];
}

export function renderMobileCatalogSummary(target, items, { filteredCount = 0 } = {}) {
  const caseItem = items.find((item) => item.key === "case") || null;
  const nextItem = items.find((item) => item.key === "next") || null;
  if (!caseItem || !nextItem) return;

  const decisionReady = isCatalogDecisionReady();
  const readyLabel = `${Number(filteredCount || 0).toLocaleString()} ready`;
  const lensAction = caseItem.action || null;
  const nextAction = nextItem.action || null;
  const lensActionMarkup = lensAction
    ? `
      <button
        class="panel-action-button case-summary-mobile-lens"
        type="button"
        data-decision-action="${escapeHtml(lensAction.key || "")}"
        data-product-id="${escapeHtml(lensAction.productId || "")}"
        data-workspace-section="${escapeHtml(lensAction.workspaceSection || "")}"
        aria-controls="${escapeHtml(lensAction.ariaControls || "lens-drawer-panel")}"
        aria-expanded="${escapeHtml(String(lensAction.ariaExpanded || false))}"
        aria-label="${escapeHtml(lensAction.ariaLabel || "Edit Skin Lens")}"
      >
        Lens
      </button>
    `
    : "";
  const nextActionMarkup = nextAction
    ? `
      <button
        class="panel-action-button primary"
        type="button"
        data-decision-action="${escapeHtml(nextAction.key || "")}"
        data-product-id="${escapeHtml(nextAction.productId || "")}"
        data-workspace-section="${escapeHtml(nextAction.workspaceSection || "")}"
      >
        ${escapeHtml(nextAction.label || nextItem.value || "Choose focus")}
      </button>
    `
    : "";

  target.insertAdjacentHTML(
    "afterbegin",
    `
      <article class="case-summary-mobile-row" aria-label="Mobile catalog case summary">
        <span>${escapeHtml(caseItem.value)} · ${escapeHtml(readyLabel)}</span>
        ${decisionReady ? "" : `<small>Representative shelf scan · Starting point · Choose focus</small>`}
        <div class="case-summary-mobile-actions">
          ${lensActionMarkup}
          ${nextActionMarkup}
        </div>
      </article>
    `,
  );
}

export function renderCatalogCommandBar({ filteredCount = 0, totalPages = 1, activeLane = null, spotlight = null, marketSnapshot = null } = {}) {
  if (!catalogCommandBar) return;
  const savedProducts = getShortlistSavedProducts();
  const hasCommandContent = Boolean(filteredCount || spotlight?.id || savedProducts.length || activeLane || getActiveCatalogFilterCount());
  catalogCommandBar.hidden = !hasCommandContent;
  catalogCommandBar.classList.toggle("is-empty", !hasCommandContent);
  catalogCommandBar.setAttribute("aria-hidden", String(!hasCommandContent));
  if (!hasCommandContent) {
    catalogCommandBar.innerHTML = "";
    return;
  }
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const summaryItems = buildCaseSummaryItems({
    filteredCount,
    totalPages,
    activeLane,
    leadProduct: spotlight,
    marketSnapshot,
    shortlistPayload,
    savedProducts,
    includeAction: true,
  });
  renderCaseSummaryItems(
    catalogCommandBar,
    summaryItems,
    { variant: "catalog", actionAttribute: "data-decision-action" },
  );
  renderMobileCatalogSummary(catalogCommandBar, summaryItems, { filteredCount });
}

export function renderResultsCasebar({ activeLane = null, spotlight = null, marketSnapshot = null, ratedCount = 0, totalPages = 1 } = {}) {
  if (resultsNextStep) {
    resultsNextStep.textContent = "Product cards below reflect the decision ledger above.";
  }
}

export const RETAILER_EQUIVALENT_CATEGORY_GROUPS = {
  cleanser: "cleanser",
  "body care": "body care",
  "eye care": "eye care",
  "lip care": "lip care",
  mask: "mask",
  moisturizer: "moisturizer",
  serum: "active-treatment",
  sunscreen: "sunscreen",
  toner: "active-treatment",
  treatment: "active-treatment",
};

export const RETAILER_EQUIVALENT_GENERIC_TOKENS = new Set([
  "advanced",
  "aging",
  "anti",
  "daily",
  "face",
  "facial",
  "for",
  "gentle",
  "glow",
  "hydrating",
  "intensive",
  "skin",
  "skincare",
  "the",
  "with",
]);

export function getRetailerEquivalentCategoryGroup(product) {
  const category = String(product?.category || "").trim().toLowerCase();
  return RETAILER_EQUIVALENT_CATEGORY_GROUPS[category] || category;
}

export function getRetailerEquivalentVariantKind(product) {
  const text = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
  if (/\b(refill|refillable)\b/.test(text)) return "refill";
  if (/\b(kit|set|duo|trio|bundle|collection|edit)\b/.test(text)) return "kit";
  if (/\b(mini|travel(?: size)?|trial|sample)\b/.test(text)) return "mini";
  return "standard";
}

export function normalizeRetailerEquivalentProductId(product) {
  return String(product?.id || "").trim();
}

export function normalizeRetailerEquivalentComparisonKey(product) {
  return String(product?.comparisonKey || "").trim();
}

export function normalizeRetailerEquivalentText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:\.\d+)?\s*(?:ml|oz|fl oz|g|kg|lb|count|ct)\b/gi, " ")
    .replace(
      /\b(travel size|travel|mini|value size|jumbo|deluxe|sample|trial|limited edition|oz|ounce|ounces|fl oz|ml|g|kg|lb|count|ct|pack|set)\b/gi,
      " ",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeRetailerEquivalentSet(values, { stringsOnly = false } = {}) {
  return new Set(
    (Array.isArray(values) ? values : [])
      .filter((value) => !stringsOnly || typeof value === "string")
      .map((value) => String(value || "").trim().toLowerCase())
      .filter(Boolean),
  );
}

let retailerEquivalentIngredientAliasGroups = null;
let retailerEquivalentIngredientAliasRules = null;
let retailerEquivalentIngredientNameAliases = [];

function getRetailerEquivalentIngredientNameAliases() {
  if (
    retailerEquivalentIngredientAliasGroups === EQUIVALENT_INGREDIENT_GROUPS &&
    retailerEquivalentIngredientAliasRules === INGREDIENT_RULES
  ) {
    return retailerEquivalentIngredientNameAliases;
  }
  retailerEquivalentIngredientAliasGroups = EQUIVALENT_INGREDIENT_GROUPS;
  retailerEquivalentIngredientAliasRules = INGREDIENT_RULES;
  retailerEquivalentIngredientNameAliases = [...new Set(
    [
      ...Object.values(EQUIVALENT_INGREDIENT_GROUPS)
        .flatMap((values) => (Array.isArray(values) ? values : [])),
      ...Object.entries(INGREDIENT_RULES)
        .flatMap(([ingredient, values]) => [
          ingredient,
          ...(Array.isArray(values) ? values : []),
        ]),
    ]
      .map((value) => normalizeCatalogVariantFamilyText(value))
      .filter(Boolean),
  )].sort((left, right) => right.length - left.length || left.localeCompare(right));
  return retailerEquivalentIngredientNameAliases;
}

export function getRetailerEquivalentNameTokens(product) {
  const brandTokens = new Set(normalizeRetailerEquivalentText(product?.brand || "").split(" ").filter(Boolean));
  let normalizedName = normalizeCatalogVariantFamilyText(product?.name || "");
  getRetailerEquivalentIngredientNameAliases().forEach((alias) => {
    const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    normalizedName = normalizedName.replace(new RegExp(`\\b${escapedAlias}\\b`, "g"), " ");
  });
  return new Set(
    normalizedName
      .split(" ")
      .filter((token) => token.length > 2 && !brandTokens.has(token) && !RETAILER_EQUIVALENT_GENERIC_TOKENS.has(token)),
  );
}

export function getRetailerEquivalentEvidenceState(product, fieldName, hasValue) {
  const field = product?.provenance?.fields?.[fieldName];
  if (field && typeof field === "object") {
    const declared = String(field.evidenceState || field.state || "").trim().toLowerCase();
    if (["observed", "inferred", "unavailable", "unknown"].includes(declared)) return declared;
    if (field.inferred) return "inferred";
  }
  if (fieldName === "ingredients") return "unknown";
  return hasValue ? "observed" : "unknown";
}

export function getRetailerEquivalentConcernEvidenceStateV2(product) {
  const field = product?.provenance?.fields?.concerns;
  if (!field || typeof field !== "object" || Array.isArray(field)) return "unknown";
  if (typeof field.evidenceState !== "string") return "unknown";
  const declared = field.evidenceState.trim().toLowerCase();
  if (
    declared === "observed"
    && !getRetailerEquivalentValidatedObservedProvenanceV2(product, "concerns")
  ) return "unknown";
  return ["observed", "inferred", "unavailable", "unknown"].includes(declared)
    ? declared
    : "unknown";
}

export const RETAILER_EQUIVALENT_CONCERN_ALIASES_V2 = {
  acneblemishes: "acne",
  antiaging: "wrinkles",
  darkcircles: "dark circles",
  darkspots: "dark spots",
  finelineswrinkles: "wrinkles",
  lossoffirmnesselasticity: "wrinkles",
  unevenskintone: "dark spots",
  uneventexture: "texture",
};

export function normalizeRetailerEquivalentConcernValueV2(value) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return RETAILER_EQUIVALENT_CONCERN_ALIASES_V2[normalized] || normalized;
}

function normalizeRetailerEquivalentConcernSetV2(values) {
  if (!Array.isArray(values)) return new Set();
  const normalized = new Set();
  for (const value of values) {
    if (typeof value !== "string" || !value.trim()) return new Set();
    const item = value.trim().toLowerCase().replace(/\s+/g, " ");
    if (normalized.has(item)) return new Set();
    normalized.add(item);
  }
  return normalized;
}

function getRetailerEquivalentLineageCollisionKeyV2(value, fieldName) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  return fieldName === "concerns"
    ? normalizeRetailerEquivalentConcernValueV2(normalized)
    : normalized;
}

function getRetailerEquivalentLineageProductKeyV2(value, fieldName) {
  if (typeof value !== "string") return "";
  const normalized = value.trim().toLowerCase();
  return fieldName === "concerns" ? normalized.replace(/\s+/g, " ") : normalized;
}

function isRetailerEquivalentInferenceOnlyLineageV2(sourceSurface, evidenceKind) {
  const inferenceMarkers = [
    "normalizer",
    "classifier",
    "classification",
    "inference",
    "inferred",
    "derived",
    "description",
  ];
  return inferenceMarkers.some(
    (marker) => sourceSurface.includes(marker) || evidenceKind.includes(marker),
  );
}

function normalizeRetailerEquivalentLineageValuesV2(value, fieldName) {
  if (!Array.isArray(value)) return null;
  const normalized = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) return null;
    const cleaned = item.trim();
    const key = getRetailerEquivalentLineageCollisionKeyV2(cleaned, fieldName);
    if (!key) return null;
    if (seen.has(key)) return null;
    seen.add(key);
    normalized.push(cleaned);
  }
  return normalized;
}

function isRetailerEquivalentTimezoneTimestampV2(value) {
  if (typeof value !== "string") return false;
  if (value !== value.trim()) return false;
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):(\d{2}))$/,
  );
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  if (year < 1) return false;
  const calendarDate = new Date(0);
  calendarDate.setUTCHours(0, 0, 0, 0);
  calendarDate.setUTCFullYear(year, month - 1, day);
  if (
    calendarDate.getUTCFullYear() !== year
    || calendarDate.getUTCMonth() !== month - 1
    || calendarDate.getUTCDate() !== day
    || hour > 23
    || minute > 59
    || second > 59
  ) return false;
  if (zone !== "Z" && (Number(offsetHourText) > 23 || Number(offsetMinuteText) > 59)) {
    return false;
  }
  return true;
}

function normalizeRetailerEquivalentLineageIdentityV2(
  value,
  { child = false, fieldName = "" } = {},
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (!Object.prototype.hasOwnProperty.call(value, "observedAt")) return null;
  if (
    typeof value.evidenceState !== "string"
    || typeof value.sourceSurface !== "string"
    || typeof value.evidenceKind !== "string"
    || typeof value.carriedForward !== "boolean"
  ) return null;
  const evidenceState = value.evidenceState.trim().toLowerCase();
  const sourceSurface = value.sourceSurface.trim().toLowerCase();
  const evidenceKind = value.evidenceKind.trim().toLowerCase();
  const identifierPattern = /^[a-z0-9]+(?:[-._:/+][a-z0-9]+)*$/;
  if (
    !["observed", "inferred", "unavailable", "unknown"].includes(evidenceState)
    || value.evidenceState !== evidenceState
    || !identifierPattern.test(sourceSurface)
    || !identifierPattern.test(evidenceKind)
  ) return null;
  const isMultiple = sourceSurface === "multiple" && evidenceKind === "multiple";
  const isLegacy = sourceSurface === "unknown" && evidenceKind === "legacy-untracked";
  const reserved = new Set(["unknown", "legacy-untracked", "multiple"]);
  if (
    (reserved.has(sourceSurface) || reserved.has(evidenceKind))
    && !isMultiple
    && !isLegacy
  ) return null;
  if (child && isMultiple) return null;
  if (isMultiple && !["observed", "unknown"].includes(evidenceState)) return null;

  const observedValues = normalizeRetailerEquivalentLineageValuesV2(value.observedValues, fieldName);
  const inferredValues = normalizeRetailerEquivalentLineageValuesV2(value.inferredValues, fieldName);
  const unknownValues = normalizeRetailerEquivalentLineageValuesV2(value.unknownValues, fieldName);
  if (!observedValues || !inferredValues || !unknownValues) return null;
  const partitionSets = [observedValues, inferredValues, unknownValues]
    .map((values) => new Set(
      values.map((item) => getRetailerEquivalentLineageCollisionKeyV2(item, fieldName)),
    ));
  if (
    [...partitionSets[0]].some((item) => partitionSets[1].has(item) || partitionSets[2].has(item))
    || [...partitionSets[1]].some((item) => partitionSets[2].has(item))
  ) return null;

  const inferenceOnly = isRetailerEquivalentInferenceOnlyLineageV2(
    sourceSurface,
    evidenceKind,
  );
  const internalInferenceOnly = ["catalog-normalizer", "catalog-classifier"]
    .includes(sourceSurface);
  const stateMatchesPartitions = evidenceState === "observed"
    ? observedValues.length > 0
    : evidenceState === "inferred"
      ? !observedValues.length && inferredValues.length > 0 && !unknownValues.length
      : evidenceState === "unavailable"
        ? !observedValues.length && !inferredValues.length
        : !observedValues.length && !(inferredValues.length && !unknownValues.length);
  if (!stateMatchesPartitions) return null;
  let observedAt = null;
  if (isLegacy) {
    if (
      evidenceState !== "unknown"
      || value.observedAt !== null
      || !value.carriedForward
      || observedValues.length
      || inferredValues.length
    ) return null;
  } else if (isMultiple) {
    if (evidenceState === "observed" && value.observedAt !== null) return null;
    if (value.observedAt !== null) {
      if (!isRetailerEquivalentTimezoneTimestampV2(value.observedAt)) return null;
      observedAt = value.observedAt.trim();
    }
  } else if (isRetailerEquivalentTimezoneTimestampV2(value.observedAt)) {
    observedAt = value.observedAt.trim();
  } else if (!(internalInferenceOnly && evidenceState !== "observed" && value.observedAt === null)) {
    return null;
  }
  if (inferenceOnly && (evidenceState === "observed" || observedValues.length)) return null;
  if (
    value.fetchedAt !== undefined
    && value.fetchedAt !== null
    && !isLegacy
    && (
      !isRetailerEquivalentTimezoneTimestampV2(value.fetchedAt)
      || observedAt === null
      || value.fetchedAt !== observedAt
    )
  ) return null;
  return {
    evidenceState,
    sourceSurface,
    evidenceKind,
    observedAt,
    carriedForward: value.carriedForward,
    observedValues,
    inferredValues,
    unknownValues,
  };
}

function retailerEquivalentLineageIdentityMatchesV2(left, right, fieldName) {
  if (!left || !right) return false;
  const scalarKeys = [
    "evidenceState",
    "sourceSurface",
    "evidenceKind",
    "observedAt",
    "carriedForward",
  ];
  if (scalarKeys.some((key) => left[key] !== right[key])) return false;
  return ["observedValues", "inferredValues", "unknownValues"].every((key) => {
    const leftValues = [...left[key]]
      .map((value) => value.toLowerCase())
      .sort();
    const rightValues = [...right[key]]
      .map((value) => value.toLowerCase())
      .sort();
    return JSON.stringify(leftValues) === JSON.stringify(rightValues);
  });
}

function getRetailerEquivalentValidatedObservedProvenanceV2(product, fieldName) {
  const field = product?.provenance?.fields?.[fieldName];
  const parent = normalizeRetailerEquivalentLineageIdentityV2(field, { fieldName });
  const rawObservations = field?.observations;
  if (
    !parent
    || parent.evidenceState !== "observed"
    || !Array.isArray(rawObservations)
    || !rawObservations.length
    || rawObservations.some((item) => !item || typeof item !== "object" || Array.isArray(item))
  ) return null;
  const children = rawObservations.map(
    (item) => normalizeRetailerEquivalentLineageIdentityV2(
      item,
      { child: true, fieldName },
    ),
  );
  if (children.some((item) => !item)) return null;
  const lineageEntries = [
    [field, parent],
    ...rawObservations.map((item, index) => [item, children[index]]),
  ];
  if (lineageEntries.some(([rawEntry, normalizedEntry]) => {
    if (!Object.prototype.hasOwnProperty.call(rawEntry, "matchEligibleValues")) return false;
    const matchEligibleValues = normalizeRetailerEquivalentLineageValuesV2(
      rawEntry.matchEligibleValues,
      fieldName,
    );
    if (!matchEligibleValues) return true;
    const observedValues = new Set(normalizedEntry.observedValues.map(
      (value) => getRetailerEquivalentLineageCollisionKeyV2(value, fieldName),
    ));
    return matchEligibleValues.some(
      (value) => !observedValues.has(
        getRetailerEquivalentLineageCollisionKeyV2(value, fieldName),
      ),
    );
  })) return null;
  if (children.length === 1) {
    if (!retailerEquivalentLineageIdentityMatchesV2(parent, children[0], fieldName)) return null;
  } else {
    const sourcePairs = new Set(
      children.map((item) => `${item.sourceSurface}\u0000${item.evidenceKind}`),
    );
    if (
      parent.sourceSurface !== "multiple"
      || parent.evidenceKind !== "multiple"
      || sourcePairs.size !== children.length
      || parent.carriedForward !== children.some((item) => item.carriedForward)
    ) return null;
    for (const key of ["observedValues", "inferredValues", "unknownValues"]) {
      const expected = new Set(children.flatMap(
        (item) => item[key].map(
          (value) => value.toLowerCase(),
        ),
      ));
      const actual = new Set(parent[key].map(
        (value) => value.toLowerCase(),
      ));
      if (
        expected.size !== actual.size
        || [...expected].some((value) => !actual.has(value))
      ) return null;
    }
  }

  const rawProductValues = product?.[fieldName];
  if (!Array.isArray(rawProductValues)) return null;
  const productValues = [];
  const seenProductValues = new Set();
  for (const value of rawProductValues) {
    if (
      fieldName === "concerns"
      && typeof value === "string"
      && value.trim().toLowerCase().startsWith("filter::concern_")
    ) return null;
    const normalized = getRetailerEquivalentLineageProductKeyV2(value, fieldName);
    if (!normalized || seenProductValues.has(normalized)) return null;
    seenProductValues.add(normalized);
    productValues.push(normalized);
  }
  const partitionValues = new Set(
    ["observedValues", "inferredValues", "unknownValues"]
      .flatMap((key) => parent[key])
      .map((value) => getRetailerEquivalentLineageProductKeyV2(value, fieldName)),
  );
  if (
    fieldName === "concerns"
    && ["observedValues", "inferredValues", "unknownValues"]
      .flatMap((key) => parent[key])
      .some((value) => value.trim().toLowerCase().startsWith("filter::concern_"))
  ) return null;
  if (
    partitionValues.size !== seenProductValues.size
    || [...partitionValues].some((value) => !seenProductValues.has(value))
  ) return null;
  if (fieldName === "ingredients") {
    const matchEligibleValues = normalizeRetailerEquivalentLineageValuesV2(
      field.matchEligibleValues,
      fieldName,
    );
    if (!matchEligibleValues) return null;
    const observedValues = new Set(parent.observedValues.map(
      (value) => value.toLowerCase(),
    ));
    if (matchEligibleValues.some(
      (value) => !observedValues.has(
        value.toLowerCase(),
      ),
    )) return null;
  }
  return { parent, field };
}

export function getRetailerEquivalentObservedConcernsV2(product) {
  const validated = getRetailerEquivalentValidatedObservedProvenanceV2(product, "concerns");
  if (!validated) return new Set();
  const observedValues = validated.parent.observedValues;

  const normalizedObservedValues = new Set();
  for (const value of observedValues) {
    const normalized = normalizeRetailerEquivalentConcernValueV2(value);
    if (typeof value !== "string" || !normalized) return new Set();
    normalizedObservedValues.add(normalized);
  }
  const normalizedProductConcerns = new Set(
    [...normalizeRetailerEquivalentSet(product?.concerns)]
      .map((value) => normalizeRetailerEquivalentConcernValueV2(value))
      .filter(Boolean),
  );
  return new Set(
    [...normalizedObservedValues].filter((value) => normalizedProductConcerns.has(value)),
  );
}

export function getRetailerEquivalentMatchEligibleIngredientsV2(product) {
  const validated = getRetailerEquivalentValidatedObservedProvenanceV2(product, "ingredients");
  if (!validated) return new Set();
  const { field } = validated;

  const declaredValues = new Set();
  for (const value of field.matchEligibleValues) {
    if (typeof value !== "string" || !value.trim()) return new Set();
    declaredValues.add(value.trim().toLowerCase());
  }
  return declaredValues;
}

export function getRetailerEquivalentIngredientGroups(product, ingredientValues = null) {
  const ingredients = ingredientValues instanceof Set
    ? ingredientValues
    : normalizeRetailerEquivalentSet(product?.ingredients, { stringsOnly: true });
  const hasAny = (values) => values.some((value) => ingredients.has(value));
  return new Set(
    Object.entries(EQUIVALENT_INGREDIENT_GROUPS)
      .filter(([, values]) => hasAny(Array.isArray(values) ? values : []))
      .map(([groupName]) => groupName),
  );
}

export function getSharedSetValues(a, b) {
  return [...a]
    .filter((value) => b.has(value))
    .sort((left, right) => left.localeCompare(right));
}

export function getRetailerEquivalentIdentityRelation(baseProduct, candidate) {
  const baseId = normalizeRetailerEquivalentProductId(baseProduct);
  const candidateId = normalizeRetailerEquivalentProductId(candidate);
  if (!baseProduct || !candidate || (baseId && candidateId && baseId === candidateId)) return "incompatible";

  const baseCategoryGroup = getRetailerEquivalentCategoryGroup(baseProduct);
  const candidateCategoryGroup = getRetailerEquivalentCategoryGroup(candidate);
  if (!baseCategoryGroup || !candidateCategoryGroup || baseCategoryGroup !== candidateCategoryGroup) {
    return "incompatible";
  }

  const baseVariantKind = getRetailerEquivalentVariantKind(baseProduct);
  const candidateVariantKind = getRetailerEquivalentVariantKind(candidate);
  const strictVariantKinds = new Set(["kit", "refill"]);
  if (
    baseVariantKind !== candidateVariantKind &&
    (strictVariantKinds.has(baseVariantKind) || strictVariantKinds.has(candidateVariantKind))
  ) {
    return "incompatible";
  }

  const baseComparisonKey = normalizeRetailerEquivalentComparisonKey(baseProduct);
  const candidateComparisonKey = normalizeRetailerEquivalentComparisonKey(candidate);
  if (baseComparisonKey && candidateComparisonKey && baseComparisonKey === candidateComparisonKey) return "exact";

  const baseFamilyKey = getCatalogFamilyCollapseKey(baseProduct);
  const candidateFamilyKey = getCatalogFamilyCollapseKey(candidate);
  if (baseFamilyKey && candidateFamilyKey && baseFamilyKey === candidateFamilyKey) return "family";
  return "alternative";
}

export function getRetailerEquivalentFamilyKeyV2(product) {
  if (!product) return "";
  const comparisonKey = normalizeRetailerEquivalentComparisonKey(product);
  const category = String(product.category || "").trim();
  if (comparisonKey) return `${comparisonKey}::${category}`;
  const brandKey = normalizeRetailerEquivalentText(product.brand);
  const familyNameKey = normalizeCatalogVariantFamilyText(product.name);
  if (!brandKey || !familyNameKey) return "";
  return `${brandKey}::${familyNameKey}::${category}`;
}

export function getRetailerEquivalentIdentityRelationV2(baseProduct, candidate) {
  const baseId = normalizeRetailerEquivalentProductId(baseProduct);
  const candidateId = normalizeRetailerEquivalentProductId(candidate);
  if (!baseProduct || !candidate || (baseId && candidateId && baseId === candidateId)) return "incompatible";

  const baseCategoryGroup = getRetailerEquivalentCategoryGroup(baseProduct);
  const candidateCategoryGroup = getRetailerEquivalentCategoryGroup(candidate);
  if (!baseCategoryGroup || !candidateCategoryGroup || baseCategoryGroup !== candidateCategoryGroup) {
    return "incompatible";
  }

  const baseVariantKind = getRetailerEquivalentVariantKind(baseProduct);
  const candidateVariantKind = getRetailerEquivalentVariantKind(candidate);
  const strictVariantKinds = new Set(["kit", "refill"]);
  if (
    baseVariantKind !== candidateVariantKind &&
    (strictVariantKinds.has(baseVariantKind) || strictVariantKinds.has(candidateVariantKind))
  ) {
    return "incompatible";
  }

  const baseComparisonKey = normalizeRetailerEquivalentComparisonKey(baseProduct);
  const candidateComparisonKey = normalizeRetailerEquivalentComparisonKey(candidate);
  if (baseComparisonKey && candidateComparisonKey && baseComparisonKey === candidateComparisonKey) return "exact";

  const baseFamilyKey = getRetailerEquivalentFamilyKeyV2(baseProduct);
  const candidateFamilyKey = getRetailerEquivalentFamilyKeyV2(candidate);
  if (baseFamilyKey && candidateFamilyKey && baseFamilyKey === candidateFamilyKey) return "family";
  return "alternative";
}

export function getRetailerEquivalentMatch(baseProduct, candidate) {
  const identityRelation = getRetailerEquivalentIdentityRelation(baseProduct, candidate);
  if (identityRelation === "incompatible") {
    return {
      eligible: false,
      identityRelation,
      matchClass: "insufficient_evidence",
      matchKind: "alternative",
      score: Number.NEGATIVE_INFINITY,
      reasons: [],
      sharedConcerns: [],
      sharedIngredientGroups: [],
    };
  }
  const baseCategoryGroup = getRetailerEquivalentCategoryGroup(baseProduct);
  if (identityRelation === "exact") {
    return {
      eligible: true,
      identityRelation,
      matchClass: "exact",
      matchKind: "exact",
      score: null,
      reasons: ["Exact same product"],
      sharedConcerns: [],
      sharedIngredientGroups: [],
    };
  }

  const baseVariantKind = getRetailerEquivalentVariantKind(baseProduct);
  const candidateVariantKind = getRetailerEquivalentVariantKind(candidate);

  const baseConcerns = normalizeRetailerEquivalentSet(baseProduct.concerns);
  const candidateConcerns = normalizeRetailerEquivalentSet(candidate.concerns);
  const sharedConcerns = getSharedSetValues(baseConcerns, candidateConcerns);
  const baseAllIngredients = normalizeRetailerEquivalentSet(baseProduct.ingredients, { stringsOnly: true });
  const candidateAllIngredients = normalizeRetailerEquivalentSet(candidate.ingredients, { stringsOnly: true });
  const baseIngredients = getRetailerEquivalentEvidenceState(
    baseProduct,
    "ingredients",
    baseAllIngredients.size > 0,
  ) === "observed" ? baseAllIngredients : new Set();
  const candidateIngredients = getRetailerEquivalentEvidenceState(
    candidate,
    "ingredients",
    candidateAllIngredients.size > 0,
  ) === "observed" ? candidateAllIngredients : new Set();
  const sharedIngredients = getSharedSetValues(baseIngredients, candidateIngredients);
  const sharedIngredientGroups = getSharedSetValues(
    getRetailerEquivalentIngredientGroups(baseProduct, baseIngredients),
    getRetailerEquivalentIngredientGroups(candidate, candidateIngredients),
  );
  const sharedNameTokens = getSharedSetValues(getRetailerEquivalentNameTokens(baseProduct), getRetailerEquivalentNameTokens(candidate));
  const baseBrandKey = normalizeRetailerEquivalentText(baseProduct.brand);
  const candidateBrandKey = normalizeRetailerEquivalentText(candidate.brand);
  const sameBrand = Boolean(baseBrandKey) && baseBrandKey === candidateBrandKey;
  const sameCategory = baseProduct.category === candidate.category;

  if (!sameBrand && !sharedConcerns.length && !sharedIngredientGroups.length && sharedNameTokens.length < 2) {
    return {
      eligible: false,
      identityRelation,
      matchClass: "insufficient_evidence",
      matchKind: "alternative",
      score: Number.NEGATIVE_INFINITY,
      reasons: [],
      sharedConcerns: [],
      sharedIngredientGroups: [],
    };
  }
  if (
    baseCategoryGroup === "active-treatment" &&
    !sharedIngredientGroups.length &&
    sharedConcerns.length < 2 &&
    sharedNameTokens.length < 2
  ) {
    return {
      eligible: false,
      identityRelation,
      matchClass: "insufficient_evidence",
      matchKind: "alternative",
      score: Number.NEGATIVE_INFINITY,
      reasons: [],
      sharedConcerns: [],
      sharedIngredientGroups: [],
    };
  }

  let score = sameBrand ? 4 : 0;
  score += sameCategory ? 5 : 2.5;
  score += Math.min(6, sharedConcerns.length * 2.5);
  score += Math.min(6, sharedIngredientGroups.length * 3);
  score += Math.min(4, sharedIngredients.length * 0.9);
  score += Math.min(3, sharedNameTokens.length * 1.1);
  if (baseVariantKind === candidateVariantKind && baseVariantKind !== "standard") score += 1;
  if (baseVariantKind !== candidateVariantKind && [baseVariantKind, candidateVariantKind].includes("mini")) score -= 1.5;
  score = Math.round(score * 1000) / 1000;

  const reasons = [];
  if (sameBrand) reasons.push("Same brand");
  reasons.push(sameCategory ? "Same routine role" : "Compatible routine role");
  if (sharedIngredientGroups.length) reasons.push(`${sharedIngredientGroups.slice(0, 2).join(" + ")} overlap`);
  else if (sharedIngredients.length) reasons.push("Ingredient overlap");
  if (sharedConcerns.length) reasons.push(formatEquivalentSharedConcernReason(sharedConcerns));
  if (sharedNameTokens.length >= 2) reasons.push("Product-name similarity");

  let matchClass = "insufficient_evidence";
  if (score >= 7.5) {
    if (baseCategoryGroup === "active-treatment" && !sharedIngredientGroups.length) {
      matchClass = "weak_alternative";
    } else if (identityRelation === "family" || score >= 10) {
      matchClass = "strong_alternative";
    } else {
      matchClass = "weak_alternative";
    }
  }

  return {
    eligible: matchClass !== "insufficient_evidence",
    identityRelation,
    matchClass,
    matchKind: matchClass === "strong_alternative" && identityRelation === "family" ? "family" : "alternative",
    score,
    reasons: reasons.slice(0, 3),
    sharedConcerns: sharedConcerns.slice(0, 4),
    sharedIngredientGroups: sharedIngredientGroups.slice(0, 4),
  };
}

export function getRetailerEquivalentMatchV2(baseProduct, candidate) {
  const identityRelation = getRetailerEquivalentIdentityRelationV2(baseProduct, candidate);
  if (identityRelation === "incompatible") {
    return {
      eligible: false,
      identityRelation,
      matchClass: "insufficient_evidence",
      matchKind: "alternative",
      score: Number.NEGATIVE_INFINITY,
      reasons: [],
      sharedConcerns: [],
      sharedIngredientGroups: [],
      sharedObservedConcerns: [],
      affirmativeSemanticAxes: [],
    };
  }
  if (identityRelation === "exact") {
    return {
      eligible: true,
      identityRelation,
      matchClass: "exact",
      matchKind: "exact",
      score: null,
      reasons: ["Exact same product"],
      sharedConcerns: [],
      sharedIngredientGroups: [],
      sharedObservedConcerns: [],
      affirmativeSemanticAxes: [],
    };
  }

  const baseCategoryGroup = getRetailerEquivalentCategoryGroup(baseProduct);
  const baseVariantKind = getRetailerEquivalentVariantKind(baseProduct);
  const candidateVariantKind = getRetailerEquivalentVariantKind(candidate);
  const baseConcerns = normalizeRetailerEquivalentConcernSetV2(baseProduct.concerns);
  const candidateConcerns = normalizeRetailerEquivalentConcernSetV2(candidate.concerns);
  const sharedConcerns = getSharedSetValues(baseConcerns, candidateConcerns);
  const sharedObservedConcerns = getSharedSetValues(
    getRetailerEquivalentObservedConcernsV2(baseProduct),
    getRetailerEquivalentObservedConcernsV2(candidate),
  );
  const baseIngredients = getRetailerEquivalentMatchEligibleIngredientsV2(baseProduct);
  const candidateIngredients = getRetailerEquivalentMatchEligibleIngredientsV2(candidate);
  const sharedIngredients = getSharedSetValues(baseIngredients, candidateIngredients);
  const sharedIngredientGroups = getSharedSetValues(
    getRetailerEquivalentIngredientGroups(baseProduct, baseIngredients),
    getRetailerEquivalentIngredientGroups(candidate, candidateIngredients),
  );
  const sharedNameTokens = getSharedSetValues(
    getRetailerEquivalentNameTokens(baseProduct),
    getRetailerEquivalentNameTokens(candidate),
  );
  const baseBrandKey = normalizeRetailerEquivalentText(baseProduct.brand);
  const candidateBrandKey = normalizeRetailerEquivalentText(candidate.brand);
  const sameBrand = Boolean(baseBrandKey) && baseBrandKey === candidateBrandKey;
  const sameCategory = baseProduct.category === candidate.category;
  const affirmativeSemanticAxes = [];
  if (sharedIngredientGroups.length) affirmativeSemanticAxes.push("ingredient_group");
  if (sharedObservedConcerns.length) affirmativeSemanticAxes.push("observed_concern");
  if (identityRelation === "family" || sharedNameTokens.length >= 2) affirmativeSemanticAxes.push("name_family");
  affirmativeSemanticAxes.sort((left, right) => left.localeCompare(right));

  const passesV1SemanticFloor =
    (sameBrand || sharedObservedConcerns.length > 0 || sharedIngredientGroups.length > 0 || sharedNameTokens.length >= 2) &&
    (
      baseCategoryGroup !== "active-treatment" ||
      sharedIngredientGroups.length > 0 ||
      sharedObservedConcerns.length >= 2 ||
      sharedNameTokens.length >= 2
    );
  if (!passesV1SemanticFloor || !affirmativeSemanticAxes.length) {
    return {
      eligible: false,
      identityRelation,
      matchClass: "insufficient_evidence",
      matchKind: "alternative",
      score: Number.NEGATIVE_INFINITY,
      reasons: [],
      sharedConcerns: [],
      sharedIngredientGroups: [],
      sharedObservedConcerns: sharedObservedConcerns.slice(0, 4),
      affirmativeSemanticAxes,
    };
  }

  let score = sameBrand ? 4 : 0;
  score += sameCategory ? 5 : 2.5;
  score += Math.min(6, sharedObservedConcerns.length * 2.5);
  score += Math.min(6, sharedIngredientGroups.length * 3);
  score += Math.min(4, sharedIngredients.length * 0.9);
  score += Math.min(3, sharedNameTokens.length * 1.1);
  if (baseVariantKind === candidateVariantKind && baseVariantKind !== "standard") score += 1;
  if (baseVariantKind !== candidateVariantKind && [baseVariantKind, candidateVariantKind].includes("mini")) score -= 1.5;
  score = Math.round(score * 1000) / 1000;

  const reasons = [];
  if (affirmativeSemanticAxes.includes("ingredient_group") && sharedIngredientGroups.length) {
    reasons.push(`${sharedIngredientGroups.slice(0, 2).join(" + ")} overlap`);
  }
  if (affirmativeSemanticAxes.includes("name_family")) {
    reasons.push(sharedNameTokens.length >= 2 ? "Product-name similarity" : "Product-family similarity");
  }
  if (affirmativeSemanticAxes.includes("observed_concern") && sharedObservedConcerns.length) {
    reasons.push(formatEquivalentSharedConcernReason(sharedObservedConcerns));
  }
  if (sameBrand) reasons.push("Same brand");
  reasons.push(sameCategory ? "Same routine role" : "Compatible routine role");

  const hasMinimumEvidence = score >= 7.5;
  const activeTreatmentStrongEligible =
    baseCategoryGroup !== "active-treatment" || affirmativeSemanticAxes.includes("ingredient_group");
  const strongEligible =
    hasMinimumEvidence &&
    score >= 10 &&
    affirmativeSemanticAxes.length >= 2 &&
    activeTreatmentStrongEligible;
  const matchClass = !hasMinimumEvidence
    ? "insufficient_evidence"
    : strongEligible
      ? "strong_alternative"
      : "weak_alternative";

  return {
    eligible: matchClass !== "insufficient_evidence",
    identityRelation,
    matchClass,
    matchKind: matchClass === "strong_alternative" && identityRelation === "family" ? "family" : "alternative",
    score,
    reasons: reasons.slice(0, 3),
    sharedConcerns: sharedObservedConcerns.slice(0, 4),
    sharedIngredientGroups: sharedIngredientGroups.slice(0, 4),
    sharedObservedConcerns: sharedObservedConcerns.slice(0, 4),
    affirmativeSemanticAxes,
  };
}

export function getRetailerEquivalentMatchClassFromMetadata(entry) {
  const matchKind = String(entry?.comparisonMatchKind || entry?.matchKind || "").trim().toLowerCase();
  if (matchKind === "exact") return "exact";
  if (matchKind === "family") return "strong_alternative";
  if (matchKind !== "alternative") return "insufficient_evidence";

  const score = Number.isFinite(entry?.equivalenceScore)
    ? entry.equivalenceScore
    : Number.isFinite(entry?.score)
      ? entry.score
      : null;
  if (score === null || score < 7.5) return "insufficient_evidence";

  const sharedIngredientGroups = Array.isArray(entry?.sharedIngredientGroups)
    ? entry.sharedIngredientGroups.filter((value) => String(value || "").trim())
    : [];
  if (
    getRetailerEquivalentCategoryGroup(entry) === "active-treatment" &&
    !sharedIngredientGroups.length
  ) {
    return "weak_alternative";
  }
  return score >= 10 ? "strong_alternative" : "weak_alternative";
}

export function getRetailerEquivalentMatchClassRank(matchClass) {
  return {
    exact: 0,
    strong_alternative: 1,
    weak_alternative: 2,
    insufficient_evidence: 3,
  }[matchClass] ?? 3;
}

export function scoreRetailerEquivalent(baseProduct, candidate) {
  const match = getRetailerEquivalentMatch(baseProduct, candidate);
  return match.eligible ? match.score : Number.NEGATIVE_INFINITY;
}

export function getComparableProductKey(product) {
  const comparisonKey = normalizeRetailerEquivalentComparisonKey(product);
  if (comparisonKey) return comparisonKey;
  const brandKey = normalizeComparableText(product?.brand);
  const nameKey = normalizeComparableText(product?.name);
  return brandKey && nameKey ? `${brandKey}::${nameKey}` : "";
}

export function sortRetailerOfferEntries(currentProductId, a, b) {
  const aCurrent = a.id === currentProductId ? 1 : 0;
  const bCurrent = b.id === currentProductId ? 1 : 0;
  if (aCurrent !== bCurrent) return bCurrent - aCurrent;

  const aPrice = typeof a.price === "number" ? a.price : Number.MAX_SAFE_INTEGER;
  const bPrice = typeof b.price === "number" ? b.price : Number.MAX_SAFE_INTEGER;
  if (aPrice !== bPrice) return aPrice - bPrice;

  const aRating = typeof a.rating === "number" ? a.rating : -1;
  const bRating = typeof b.rating === "number" ? b.rating : -1;
  if (aRating !== bRating) return bRating - aRating;

  const aReviews = typeof a.reviewCount === "number" ? a.reviewCount : -1;
  const bReviews = typeof b.reviewCount === "number" ? b.reviewCount : -1;
  if (aReviews !== bReviews) return bReviews - aReviews;

  return (
    String(a.retailer || "").localeCompare(String(b.retailer || "")) ||
    String(a.name || "").localeCompare(String(b.name || "")) ||
    String(a.id || "").localeCompare(String(b.id || ""))
  );
}

export function getTrackedLongestOffer(offers, currentProductId = "") {
  const trackedOffers = (offers || []).filter((entry) => parseTimestamp(entry.firstSeenAt));
  if (!trackedOffers.length) return null;
  return [...trackedOffers].sort(
    (a, b) =>
      parseTimestamp(a.firstSeenAt) - parseTimestamp(b.firstSeenAt) ||
      sortRetailerOfferEntries(currentProductId, a, b),
  )[0];
}

export function getCachedProductComparison(product) {
  if (!product?.id) return null;
  return state.live.productComparisons[product.id] || null;
}

export function buildRetailerOfferGraphFromPayload(product, payload) {
  const offers = Array.isArray(payload?.offers)
    ? payload.offers.filter(Boolean).map((entry) => ({
        ...entry,
        equivalenceReasons: normalizeEquivalentReasonLabels(entry.equivalenceReasons),
      }))
    : [];
  if (offers.length <= 1) return null;

  const retailerCount =
    typeof payload?.retailerCount === "number"
      ? payload.retailerCount
      : new Set(offers.map((entry) => entry.retailer).filter(Boolean)).size;
  if (retailerCount <= 1) return null;
  const comparisonMode =
    typeof payload?.comparisonMode === "string" && payload.comparisonMode
      ? payload.comparisonMode
      : offers.some((entry) => ["family", "alternative"].includes(String(entry?.matchKind || "").toLowerCase()))
        ? "closest-equivalent"
        : "exact";

  return {
    comparisonKey: payload?.comparisonKey || getComparableProductKey(product),
    comparisonMode,
    exactOfferCount: Number.isFinite(payload?.exactOfferCount) ? payload.exactOfferCount : null,
    equivalentGroup: payload?.equivalentGroup && typeof payload.equivalentGroup === "object" ? payload.equivalentGroup : null,
    offers,
    retailerCount,
    lowestPriceOffer: offers.find((entry) => entry.id === payload?.lowestPriceOfferId) || null,
    topRatedOffer: offers.find((entry) => entry.id === payload?.topRatedOfferId) || null,
    bestTrustOffer: offers.find((entry) => entry.id === payload?.bestTrustOfferId) || null,
    trackedLongestOffer:
      offers.find((entry) => entry.id === payload?.longestTrackedOfferId) || getTrackedLongestOffer(offers, product.id),
  };
}

export function getApiRetailerOfferGraph(product) {
  return buildRetailerOfferGraphFromPayload(product, getCachedProductComparison(product));
}

export function getLocalRetailerOfferGraph(product) {
  const comparisonKey = getComparableProductKey(product);
  if (!comparisonKey) return null;

  const { productsByComparableKey } = getProductLookupState();
  const productId = normalizeRetailerEquivalentProductId(product);
  const offers = (productsByComparableKey.get(comparisonKey) || [])
    .filter((candidate) => {
      if (!candidate) return false;
      const candidateId = normalizeRetailerEquivalentProductId(candidate);
      const isCurrentOffer =
        Boolean(productId) &&
        candidateId === productId &&
        candidate.retailer === product.retailer;
      return (
        isCurrentOffer ||
        getRetailerEquivalentIdentityRelation(product, candidate) === "exact"
      );
    })
    .sort((a, b) => sortRetailerOfferEntries(product.id, a, b));

  if (offers.length <= 1) return null;
  const retailerCount = new Set(offers.map((entry) => entry.retailer).filter(Boolean)).size;
  if (retailerCount <= 1) return null;

  const pricedOffers = offers.filter((entry) => typeof entry.price === "number");
  const ratedOffers = offers.filter((entry) => typeof entry.rating === "number");

  return {
    comparisonKey,
    comparisonMode: "exact",
    exactOfferCount: offers.length,
    equivalentGroup: null,
    offers,
    retailerCount,
    lowestPriceOffer: pricedOffers.length
      ? [...pricedOffers].sort(
          (a, b) =>
            a.price - b.price ||
            sortRetailerOfferEntries(product.id, a, b),
        )[0]
      : null,
    topRatedOffer: ratedOffers.length
      ? [...ratedOffers].sort(
          (a, b) =>
            b.rating - a.rating ||
            (b.reviewCount || 0) - (a.reviewCount || 0) ||
            sortRetailerOfferEntries(product.id, a, b),
        )[0]
      : null,
    trackedLongestOffer: getTrackedLongestOffer(offers, product.id),
  };
}

export function getRetailerOfferGraph(product) {
  return getApiRetailerOfferGraph(product) || getLocalRetailerOfferGraph(product);
}

export const RETAILER_MATCH_LABELS = {
  exact: "Exact same product",
  family: "Same family variant",
  alternative: "Closest alternative",
};

export function getRetailerMatchKind(product, candidate) {
  if (!product || !candidate) return "alternative";
  return getRetailerEquivalentMatch(product, candidate).matchKind;
}

export function getRetailerMatchLabel(matchKind) {
  return RETAILER_MATCH_LABELS[matchKind] || RETAILER_MATCH_LABELS.alternative;
}

export function getOfferGraphMatchKind(entry) {
  const matchKind = String(entry?.matchKind || "").toLowerCase();
  return RETAILER_MATCH_LABELS[matchKind] ? matchKind : "exact";
}

export function isClosestEquivalentGraph(graph) {
  return graph?.comparisonMode === "closest-equivalent" || (graph?.offers || []).some((entry) => getOfferGraphMatchKind(entry) !== "exact");
}

export function getRetailerGraphPresentationMode(product, graph) {
  const offers = Array.isArray(graph?.offers) ? graph.offers.filter(Boolean) : [];
  const explicitClosestEquivalent = graph?.comparisonMode === "closest-equivalent";
  const exactOfferCount = Number(graph?.exactOfferCount || 0);
  const exactRetailers = new Set(
    offers
      .filter((entry) => getOfferGraphMatchKind(entry) === "exact")
      .map((entry) => entry.retailer)
      .filter(Boolean),
  );
  if (exactRetailers.size > 1 && (!explicitClosestEquivalent || exactOfferCount > 1)) return "exact";

  const comparisonOffers = offers.filter((entry) => entry.id !== product?.id);
  if (comparisonOffers.some((entry) => getOfferGraphMatchKind(entry) === "family")) return "family";
  if (comparisonOffers.some((entry) => getOfferGraphMatchKind(entry) === "alternative")) return "alternative";
  return isClosestEquivalentGraph(graph) ? "alternative" : "exact";
}

export function getFallbackComparisonPresentationMode(comparisons) {
  const entries = Array.isArray(comparisons) ? comparisons : [];
  if (entries.some((entry) => entry.matchKind === "exact")) return "exact";
  if (entries.some((entry) => entry.matchKind === "family")) return "family";
  return "alternative";
}

export function isExactRetailerPresentationMode(mode) {
  return mode === "exact";
}

export function getRetailerComparisonModeCopy(mode) {
  if (mode === "exact") {
    return {
      title: DECISION_DESK_COPY.compare.exactTitle,
      offerNoun: "fictional demo offer",
      buyLabel: DECISION_DESK_COPY.compare.bestLabel,
      summaryTitle: "",
      summaryDetail: "",
      currentRole: "Current store",
      alternativeRole: "Alternative",
      choiceLabel: "Current lead",
      loadingNoun: "retailer",
    };
  }
  if (mode === "family") {
    return {
      title: "Compare same-family variants",
      offerNoun: "same-family option",
      buyLabel: "Same-family variant",
      summaryTitle: "Compare as variants",
      summaryDetail:
        "No exact same-product retailer match is available, so price, synthetic rating, and synthetic review differences are product tradeoffs rather than store savings.",
      currentRole: "Current product",
      alternativeRole: "Same-family variant",
      choiceLabel: "Variant read",
      loadingNoun: "variant",
    };
  }
  return {
    title: "Compare closest alternatives",
    offerNoun: "substitute option",
    buyLabel: "Alternative to compare",
    summaryTitle: "Compare as substitutes",
    summaryDetail:
      "No exact same-product retailer match is available, so price, synthetic rating, and synthetic review differences are product tradeoffs rather than store savings.",
    currentRole: "Current product",
    alternativeRole: "Substitute option",
    choiceLabel: "Alternative read",
    loadingNoun: "alternative",
  };
}

export function isRetailerExactMatch(entry) {
  return entry?.matchKind === "exact";
}

export async function ensureProductComparison(product, force = false) {
  if (!state.live.apiBacked || !product?.id) return null;
  if (!force && state.live.productComparisons[product.id]) {
    return state.live.productComparisons[product.id];
  }
  const inFlightRequest = productComparisonRequests.get(product.id);
  if (inFlightRequest) {
    if (!state.live.productComparisonLoading[product.id]) {
      state.live.productComparisonLoading = {
        ...state.live.productComparisonLoading,
        [product.id]: true,
      };
      requestRetailerCompareRender(product.id);
    }
    return inFlightRequest;
  }

  const query = buildProductComparisonQuery(product);
  if (!query) return null;

  state.live.productComparisonLoading = {
    ...state.live.productComparisonLoading,
    [product.id]: true,
  };
  positionOpenRetailerPopover();

  const request = (async () => {
    try {
      const payload = await fetchJson(`/api/product-comparison?${query}`);
      state.live.productComparisons = {
        ...state.live.productComparisons,
        [product.id]: payload,
      };
      return payload;
    } catch {
      return null;
    } finally {
      productComparisonRequests.delete(product.id);
      const { [product.id]: _ignored, ...rest } = state.live.productComparisonLoading;
      state.live.productComparisonLoading = rest;
      requestRetailerCompareRender(product.id);
    }
  })();

  productComparisonRequests.set(product.id, request);
  return request;
}

export function buildCompareExplainerSignals() {
  return {
    goal: state.userProfile.goal || state.routineConcern,
    budget: state.userProfile.budget,
    routineBudget: state.routineBudget,
    routineTime: state.routineTime,
    profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
    sensitivity: state.userProfile.sensitivity,
    activesComfort: state.userProfile.activesComfort,
    avoidIngredients: getRoutinePlannerAvoidIngredients(),
  };
}

export function serializeCompareAvailabilityDetail(detail) {
  if (!detail || typeof detail !== "object") return null;
  const serialized = {
    label: typeof detail.label === "string" ? detail.label : null,
    state: typeof detail.state === "string" ? detail.state : null,
    confidence: typeof detail.confidence === "string" ? detail.confidence : null,
    sourceType: typeof detail.sourceType === "string" ? detail.sourceType : null,
  };
  return Object.values(serialized).some(Boolean) ? serialized : null;
}

export function serializeCompareSignalEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const serialized = {
    label: typeof entry.label === "string" ? entry.label : null,
    detail: typeof entry.detail === "string" ? entry.detail : null,
    tone: typeof entry.tone === "string" ? entry.tone : null,
  };
  return Object.values(serialized).some(Boolean) ? serialized : null;
}

export function serializeCompareTrust(trust) {
  if (!trust || typeof trust !== "object") return null;
  const serialized = {};

  if (trust.sourceSummary && typeof trust.sourceSummary === "object") {
    const sourceSummary = {
      label: typeof trust.sourceSummary.label === "string" ? trust.sourceSummary.label : null,
      fieldCount: Number.isFinite(trust.sourceSummary.fieldCount) ? trust.sourceSummary.fieldCount : null,
      fields: Array.isArray(trust.sourceSummary.fields)
        ? trust.sourceSummary.fields
            .map((entry) => {
              if (!entry || typeof entry !== "object") return null;
              return {
                field: typeof entry.field === "string" ? entry.field : null,
                label: typeof entry.label === "string" ? entry.label : null,
              };
            })
            .filter((entry) => entry && (entry.field || entry.label))
            .slice(0, 4)
        : [],
    };
    if (sourceSummary.label || sourceSummary.fieldCount || sourceSummary.fields.length) {
      serialized.sourceSummary = sourceSummary;
    }
  }

  if (trust.match && typeof trust.match === "object") {
    const match = {
      label: typeof trust.match.label === "string" ? trust.match.label : null,
      confidence: typeof trust.match.confidence === "string" ? trust.match.confidence : null,
      offerCount: Number.isFinite(trust.match.offerCount) ? trust.match.offerCount : null,
      retailerCount: Number.isFinite(trust.match.retailerCount) ? trust.match.retailerCount : null,
    };
    if (Object.values(match).some((value) => value !== null)) {
      serialized.match = match;
    }
  }

  if (trust.history && typeof trust.history === "object") {
    const history = {
      label: typeof trust.history.label === "string" ? trust.history.label : null,
      historyCount: Number.isFinite(trust.history.historyCount) ? trust.history.historyCount : null,
      firstSeenAt: typeof trust.history.firstSeenAt === "string" ? trust.history.firstSeenAt : null,
      lastSeenAt: typeof trust.history.lastSeenAt === "string" ? trust.history.lastSeenAt : null,
      priceChanged: typeof trust.history.priceChanged === "boolean" ? trust.history.priceChanged : null,
      priceDrop: typeof trust.history.priceDrop === "boolean" ? trust.history.priceDrop : null,
      atLowestTrackedPrice:
        typeof trust.history.atLowestTrackedPrice === "boolean" ? trust.history.atLowestTrackedPrice : null,
      priceDirection: typeof trust.history.priceDirection === "string" ? trust.history.priceDirection : null,
      currentPrice: typeof trust.history.currentPrice === "number" ? trust.history.currentPrice : null,
      previousPrice: typeof trust.history.previousPrice === "number" ? trust.history.previousPrice : null,
      lowestPrice: typeof trust.history.lowestPrice === "number" ? trust.history.lowestPrice : null,
      priceDeltaFromPrevious:
        typeof trust.history.priceDeltaFromPrevious === "number" ? trust.history.priceDeltaFromPrevious : null,
      priceDeltaPercentFromPrevious:
        typeof trust.history.priceDeltaPercentFromPrevious === "number" ? trust.history.priceDeltaPercentFromPrevious : null,
      availabilityChanged: typeof trust.history.availabilityChanged === "boolean" ? trust.history.availabilityChanged : null,
      coarseAvailabilityChanged:
        typeof trust.history.coarseAvailabilityChanged === "boolean" ? trust.history.coarseAvailabilityChanged : null,
      availabilityDetailChanged:
        typeof trust.history.availabilityDetailChanged === "boolean" ? trust.history.availabilityDetailChanged : null,
      backInStock: typeof trust.history.backInStock === "boolean" ? trust.history.backInStock : null,
      availabilityDetailState:
        typeof trust.history.availabilityDetailState === "string" ? trust.history.availabilityDetailState : null,
      availabilityGroup: typeof trust.history.availabilityGroup === "string" ? trust.history.availabilityGroup : null,
      currentAvailabilityLabel:
        typeof trust.history.currentAvailabilityLabel === "string" ? trust.history.currentAvailabilityLabel : null,
      previousAvailabilityState:
        typeof trust.history.previousAvailabilityState === "string" ? trust.history.previousAvailabilityState : null,
      previousAvailabilityDetailState:
        typeof trust.history.previousAvailabilityDetailState === "string" ? trust.history.previousAvailabilityDetailState : null,
      previousAvailabilityGroup:
        typeof trust.history.previousAvailabilityGroup === "string" ? trust.history.previousAvailabilityGroup : null,
      previousAvailabilityLabel:
        typeof trust.history.previousAvailabilityLabel === "string" ? trust.history.previousAvailabilityLabel : null,
    };
    if (Object.values(history).some((value) => value !== null)) {
      serialized.history = history;
    }
  }

  if (trust.freshness && typeof trust.freshness === "object") {
    const freshness = {
      label: typeof trust.freshness.label === "string" ? trust.freshness.label : null,
      generatedAt: typeof trust.freshness.generatedAt === "string" ? trust.freshness.generatedAt : null,
      ratingGeneratedAt: typeof trust.freshness.ratingGeneratedAt === "string" ? trust.freshness.ratingGeneratedAt : null,
    };
    if (Object.values(freshness).some(Boolean)) {
      serialized.freshness = freshness;
    }
  }

  if (trust.rating && typeof trust.rating === "object") {
    const rating = {
      label: typeof trust.rating.label === "string" ? trust.rating.label : null,
      source: typeof trust.rating.source === "string" ? trust.rating.source : null,
      depth: typeof trust.rating.depth === "string" ? trust.rating.depth : null,
      fetchedAt: typeof trust.rating.fetchedAt === "string" ? trust.rating.fetchedAt : null,
    };
    if (Object.values(rating).some(Boolean)) {
      serialized.rating = rating;
    }
  }

  const primarySignal = serializeCompareSignalEntry(trust.primarySignal);
  if (primarySignal) {
    serialized.primarySignal = primarySignal;
  }

  if (Array.isArray(trust.signals)) {
    const signals = trust.signals.map((entry) => serializeCompareSignalEntry(entry)).filter(Boolean).slice(0, 4);
    if (signals.length) {
      serialized.signals = signals;
    }
  }

  return Object.keys(serialized).length ? serialized : null;
}

export function serializeCompareRecentHistory(recentHistory) {
  if (!Array.isArray(recentHistory)) return [];
  return recentHistory
    .map((historyEntry) => {
      if (!historyEntry || typeof historyEntry !== "object") return null;
      const serialized = {
        observedAt: typeof historyEntry.observedAt === "string" ? historyEntry.observedAt : null,
        price: typeof historyEntry.price === "number" ? historyEntry.price : null,
        availabilityState: typeof historyEntry.availabilityState === "string" ? historyEntry.availabilityState : null,
        availabilityDetail: serializeCompareAvailabilityDetail(historyEntry.availabilityDetail),
      };
      return Object.values(serialized).some((value) => value !== null) ? serialized : null;
    })
    .filter(Boolean)
    .slice(0, 3);
}

export function serializeCompareProductFacts(product) {
  if (!product || typeof product !== "object") return null;
  const productId = typeof product.id === "string" ? product.id : "";
  if (!productId) return null;
  const serialized = {
    id: productId,
    canonicalProductId: typeof product.canonicalProductId === "string" ? product.canonicalProductId : null,
    comparisonKey: typeof product.comparisonKey === "string" ? product.comparisonKey : null,
    retailer: typeof product.retailer === "string" ? product.retailer : null,
    brand: typeof product.brand === "string" ? product.brand : null,
    name: typeof product.name === "string" ? product.name : null,
    category: typeof product.category === "string" ? product.category : null,
    concerns: Array.isArray(product.concerns)
      ? product.concerns.map((value) => (typeof value === "string" ? value : "")).filter(Boolean)
      : [],
    ingredients: Array.isArray(product.ingredients)
      ? product.ingredients.map((value) => (typeof value === "string" ? value : "")).filter(Boolean)
      : [],
    price: typeof product.price === "number" ? product.price : null,
    rating: typeof product.rating === "number" ? product.rating : null,
    reviewCount: typeof product.reviewCount === "number" ? product.reviewCount : null,
    availabilityState: typeof product.availabilityState === "string" ? product.availabilityState : null,
    availabilityDetail: serializeCompareAvailabilityDetail(product.availabilityDetail),
    previousPrice: typeof product.previousPrice === "number" ? product.previousPrice : null,
    lowestPrice: typeof product.lowestPrice === "number" ? product.lowestPrice : null,
    firstSeenAt: typeof product.firstSeenAt === "string" ? product.firstSeenAt : null,
    lastSeenAt: typeof product.lastSeenAt === "string" ? product.lastSeenAt : null,
    matchKind: typeof product.matchKind === "string" ? product.matchKind : null,
    matchType: typeof product.matchType === "string" ? product.matchType : null,
    equivalenceScore: typeof product.equivalenceScore === "number" ? product.equivalenceScore : null,
    equivalenceReasons: normalizeEquivalentReasonLabels(product.equivalenceReasons),
    trust: serializeCompareTrust(product.trust),
  };
  const recentHistory = serializeCompareRecentHistory(product.recentHistory);
  if (recentHistory.length) {
    serialized.recentHistory = recentHistory;
  }
  return serialized;
}

export function buildCompareExplainerContext(product, { signals, savedIds, routineDraftState } = {}) {
  if (!product?.id) return null;

  const compareSignals = signals || buildCompareExplainerSignals();
  const compareSavedIds = Array.isArray(savedIds) ? [...new Set(savedIds.filter(Boolean))] : [];
  const compareRoutineDraftState = routineDraftState && typeof routineDraftState === "object" ? routineDraftState : {};
  const baseContext = {
    goal: compareSignals.goal || "",
    budget: compareSignals.budget || "",
    budgetLabel: getBudgetLabel(compareSignals.budget || "any"),
    routineTime: compareSignals.routineTime || "",
    profile: compareSignals.profile || "",
    sensitivity: compareSignals.sensitivity || "",
    activesComfort: compareSignals.activesComfort || "",
    savedIds: compareSavedIds,
    routineDraftState: compareRoutineDraftState,
  };

  const graph = getRetailerOfferGraph(product);
  if (graph?.offers?.length >= 2) {
    const presentationMode = getRetailerGraphPresentationMode(product, graph);
    const currentOffer =
      graph.offers.find((entry) => entry?.id === product.id) ||
      getProductById(product.id) ||
      product;
    return {
      ...baseContext,
      mode: "retailer",
      productId: product.id,
      comparisonKey: getComparableProductKey(product) || product.comparisonKey || "",
      currentProduct: serializeCompareProductFacts(currentOffer),
      retailerGraph: {
        comparisonMode: graph.comparisonMode || "exact",
        presentationMode,
        offerCount: graph.offers.length,
        retailerCount: graph.retailerCount || new Set(graph.offers.map((entry) => entry?.retailer).filter(Boolean)).size,
        lowestPriceOfferId: graph.lowestPriceOffer?.id || null,
        topRatedOfferId: graph.topRatedOffer?.id || null,
        bestTrustOfferId: graph.bestTrustOffer?.id || graph.topRatedOffer?.id || graph.trackedLongestOffer?.id || null,
        longestTrackedOfferId: graph.trackedLongestOffer?.id || null,
        offers: graph.offers.map((entry) => serializeCompareProductFacts(entry)).filter(Boolean),
      },
    };
  }

  const comparisons = getRetailerComparison(product);
  if (!comparisons.length) return null;
  const compareTarget = getRetailerFallbackBuyNowSummary(product, comparisons)?.winner || comparisons[0]?.candidate || null;
  const serializedCurrent = serializeCompareProductFacts(product);
  const serializedComparison = serializeCompareProductFacts(compareTarget);
  if (!serializedCurrent || !serializedComparison || serializedCurrent.id === serializedComparison.id) return null;
  return {
    ...baseContext,
    mode: "pair",
    currentProduct: serializedCurrent,
    comparisonProduct: serializedComparison,
  };
}

export function buildCompareExplainerPayload(product) {
  if (!product?.id) return null;
  const signals = buildCompareExplainerSignals();
  const savedIds = [...new Set(state.favoriteIds.filter(Boolean))];
  const routineDraftState = getSerializableRoutineDraftState();
  const comparisonKey = getComparableProductKey(product) || product.comparisonKey || "";
  const context = buildCompareExplainerContext(product, { signals, savedIds, routineDraftState });
  if (!context) return null;

  if (context.mode === "retailer") {
    const presentationMode =
      context.retailerGraph?.presentationMode ||
      (context.retailerGraph?.comparisonMode === "closest-equivalent" ? "alternative" : "exact");
    const retailerQuestion =
      isExactRetailerPresentationMode(presentationMode)
        ? "Which retailer leads this fictional exact-product fixture?"
        : "Which alternative should be compared against the current product?";
    return {
      question: retailerQuestion,
      productId: product.id,
      comparisonKey,
      savedIds,
      routineDraftState,
      signals,
      context,
    };
  }

  const comparisonProductId = context.comparisonProduct?.id || "";
  if (!comparisonProductId) return null;
  return {
    question: "Which of these two fictional products leads this fixture?",
    productId: product.id,
    comparisonProductId,
    comparisonKey,
    savedIds,
    routineDraftState,
    signals,
    context,
  };
}

export function getCompareExplainerProductFingerprint(product) {
  if (!product || typeof product !== "object") return null;
  const recentHistory = Array.isArray(product.recentHistory)
    ? product.recentHistory.slice(0, 3).map((entry) => ({
        observedAt: entry?.observedAt || "",
        price: typeof entry?.price === "number" ? entry.price : null,
        availabilityState: entry?.availabilityState || "",
        availabilityLabel: entry?.availabilityDetail?.label || "",
      }))
    : [];
  return {
    id: product.id || "",
    retailer: product.retailer || "",
    brand: product.brand || "",
    name: product.name || "",
    price: typeof product.price === "number" ? product.price : null,
    previousPrice: typeof product.previousPrice === "number" ? product.previousPrice : null,
    lowestPrice: typeof product.lowestPrice === "number" ? product.lowestPrice : null,
    rating: typeof product.rating === "number" ? product.rating : null,
    reviewCount: typeof product.reviewCount === "number" ? product.reviewCount : null,
    availabilityState: product.availabilityState || "",
    firstSeenAt: product.firstSeenAt || "",
    lastSeenAt: product.lastSeenAt || "",
    recentHistory,
    concerns: Array.isArray(product.concerns) ? [...product.concerns].sort() : [],
    ingredients: Array.isArray(product.ingredients) ? [...product.ingredients].slice(0, 8).sort() : [],
    trust: {
      match: product.trust?.match?.label || "",
      confidence: product.trust?.match?.confidence || "",
      historyLabel: product.trust?.history?.label || "",
      historyCount: Number.isFinite(product.trust?.history?.historyCount) ? product.trust.history.historyCount : null,
      ratingDepth: product.trust?.rating?.depth || "",
      primarySignal: product.trust?.primarySignal?.label || "",
    },
  };
}

export function getCompareExplainerContextFingerprint(context = {}) {
  const graph = context.retailerGraph || {};
  return {
    mode: context.mode || "",
    goal: context.goal || "",
    budget: context.budget || "",
    routineTime: context.routineTime || "",
    profile: context.profile || "",
    sensitivity: context.sensitivity || "",
    activesComfort: context.activesComfort || "",
    savedIds: Array.isArray(context.savedIds) ? [...context.savedIds].sort() : [],
    routineDraftState: context.routineDraftState || {},
    productId: context.productId || "",
    comparisonProductId: context.comparisonProductId || "",
    comparisonKey: context.comparisonKey || "",
    currentProduct: getCompareExplainerProductFingerprint(context.currentProduct),
    comparisonProduct: getCompareExplainerProductFingerprint(context.comparisonProduct),
    retailerGraph: {
      comparisonMode: graph.comparisonMode || "",
      presentationMode: graph.presentationMode || "",
      lowestPriceOfferId: graph.lowestPriceOfferId || "",
      topRatedOfferId: graph.topRatedOfferId || "",
      bestTrustOfferId: graph.bestTrustOfferId || "",
      longestTrackedOfferId: graph.longestTrackedOfferId || "",
      offers: Array.isArray(graph.offers)
        ? graph.offers.map((offer) => getCompareExplainerProductFingerprint(offer)).filter(Boolean)
        : [],
    },
  };
}

export function getCompareExplainerRequestKey(payload) {
  if (!payload?.productId) return "";
  return JSON.stringify({
    question: payload.question || "",
    productId: payload.productId,
    comparisonKey: payload.comparisonKey || "",
    comparisonProductId: payload.comparisonProductId || "",
    context: getCompareExplainerContextFingerprint(payload.context || {}),
  });
}

export function getCompareExplainerPresentationMode(payload) {
  if (payload?.comparisonProductId || payload?.context?.mode === "pair") return "pair";
  const graph = payload?.context?.retailerGraph || {};
  if (graph.presentationMode) return graph.presentationMode;
  if (graph.comparisonMode === "closest-equivalent") return "alternative";
  if (Array.isArray(graph.offers) && graph.offers.some((offer) => getOfferGraphMatchKind(offer) !== "exact")) {
    return graph.offers.some((offer) => getOfferGraphMatchKind(offer) === "family") ? "family" : "alternative";
  }
  return "exact";
}

export function getCompareExplainerChoiceLabel(payload) {
  const presentationMode = getCompareExplainerPresentationMode(payload);
  if (presentationMode === "pair") return "Current lead";
  return getRetailerComparisonModeCopy(presentationMode).choiceLabel;
}

export async function ensureCompareExplainer(product, force = false) {
  if (!state.live.apiBacked || !product?.id) return null;
  await ensureProductComparison(product, force);
  const currentProduct = getProductById(product.id) || product;
  const payload = buildCompareExplainerPayload(currentProduct);
  if (!payload) return null;
  const requestKey = getCompareExplainerRequestKey(payload);
  if (!requestKey) return null;
  if (!force && state.live.compareExplainers[requestKey]) {
    return state.live.compareExplainers[requestKey];
  }
  const inFlightRequest = compareExplainerRequests.get(requestKey);
  if (inFlightRequest) {
    if (!state.live.compareExplainerLoading[requestKey]) {
      state.live.compareExplainerLoading = {
        ...state.live.compareExplainerLoading,
        [requestKey]: true,
      };
      positionOpenRetailerPopover();
    }
    return inFlightRequest;
  }

  state.live.compareExplainerLoading = {
    ...state.live.compareExplainerLoading,
    [requestKey]: true,
  };
  positionOpenRetailerPopover();

  const request = (async () => {
    try {
      const response = await postJson("/api/compare-explainer", payload);
      state.live.compareExplainers = {
        ...state.live.compareExplainers,
        [requestKey]: response,
      };
      return response;
    } catch {
      state.live.compareExplainers = {
        ...state.live.compareExplainers,
        [requestKey]: { ok: false, error: "request-failed" },
      };
      return null;
    } finally {
      compareExplainerRequests.delete(requestKey);
      const { [requestKey]: _ignored, ...rest } = state.live.compareExplainerLoading;
      state.live.compareExplainerLoading = rest;
      requestRetailerCompareRender(product.id);
    }
  })();

  compareExplainerRequests.set(requestKey, request);
  return request;
}

export function renderCompareExplainerMarkup(product) {
  const payload = buildCompareExplainerPayload(product);
  if (!payload) return "";
  const requestKey = getCompareExplainerRequestKey(payload);
  const response = state.live.compareExplainers[requestKey] || null;
  const loading = Boolean(state.live.compareExplainerLoading[requestKey] || compareExplainerRequests.has(requestKey));
  const mode = payload.comparisonProductId ? "pair" : "retailer";
  const presentationMode = getCompareExplainerPresentationMode(payload);
  const modeCopy = presentationMode === "pair" ? null : getRetailerComparisonModeCopy(presentationMode);
  const choiceLabel = getCompareExplainerChoiceLabel(payload);

  if (loading) {
    return `
      <div class="compare-ai-block grounded-ai-read" data-state="loading">
        <div class="grounded-ai-read-head">
          <span class="compare-ai-kicker grounded-ai-kicker">Compare read</span>
          <span class="grounded-ai-state-badge">Thinking</span>
        </div>
        <p>Loading a bounded ${mode === "retailer" ? modeCopy?.loadingNoun || "retailer" : "pair"} explanation...</p>
      </div>
    `;
  }

  if (response?.ok && response.answer) {
    const structuredAnswer = normalizeCompareAiAnswer(response, payload);
    const isFallback = isGroundedAiFallbackPayload(response, response.answer);
    const defaultSourceNote = response.fallback
      ? "Using the bounded product/app fallback while the model path stays unavailable."
      : "Grounded in the current compare graph and product facts.";
    const sourceNote = renderCompareAiSourceNote(response, response.answer, {
      fallback: isFallback,
      citationLabels: getGroundedAiCitationLabels(response),
    }) || defaultSourceNote;
    return `
      <div class="compare-ai-block grounded-ai-read" data-state="${escapeHtml(getGroundedAiReadState(response, response.answer))}">
        <div class="grounded-ai-read-head">
          <span class="compare-ai-kicker grounded-ai-kicker">Compare read</span>
          <span class="grounded-ai-state-badge">${escapeHtml(getGroundedAiStateBadge(response, response.answer))}</span>
        </div>
        <div class="compare-ai-choice-shell">
          <span class="compare-ai-choice-label">${escapeHtml(choiceLabel)}</span>
          <strong class="compare-ai-choice">${escapeHtml(structuredAnswer?.choice || "Bounded compare read")}</strong>
        </div>
        <div class="compare-ai-copy">
          ${renderCompareAiStructuredAnswerMarkup({ ...response, answer: structuredAnswer }, { omitKeys: ["choice"] })}
        </div>
        <p class="compare-ai-source"><small>${escapeHtml(sourceNote)}</small></p>
      </div>
    `;
  }

  if (response?.error) {
    return `
      <div class="compare-ai-block grounded-ai-read" data-state="warning">
        <div class="grounded-ai-read-head">
          <span class="compare-ai-kicker grounded-ai-kicker">Compare read</span>
          <span class="grounded-ai-state-badge">Fallback</span>
        </div>
        <p>Keeping the deterministic compare summary while the comparison explanation reloads.</p>
      </div>
    `;
  }

  return `
    <div class="compare-ai-block grounded-ai-read" data-state="idle">
      <div class="grounded-ai-read-head">
        <span class="compare-ai-kicker grounded-ai-kicker">Compare read</span>
        <span class="grounded-ai-state-badge">Ready</span>
      </div>
      <p>Open this check to see a bounded explanation grounded in the current compare set.</p>
    </div>
  `;
}

export function getRetailerGraphRecommendation(entry, product, graph) {
  const presentationMode = getRetailerGraphPresentationMode(product, graph);
  const matchKind = getOfferGraphMatchKind(entry);
  if (!isExactRetailerPresentationMode(presentationMode)) {
    if (entry.id === product.id) {
      return { label: "Current product", tone: "current" };
    }
    if (matchKind === "family") {
      return { label: "Same-family variant", tone: "family" };
    }
    return { label: "Substitute option", tone: "alternative" };
  }

  const oneStoreRetailer = getCurrentRoutineOneStoreRetailer();
  if (oneStoreRetailer && entry.retailer === oneStoreRetailer) {
    return { label: "Included in one-store basket", tone: "exact" };
  }
  if (graph.lowestPriceOffer?.id === entry.id) {
    return { label: "Lowest fixture price", tone: "price" };
  }
  const hasAnyRatings = graph.offers.some((offer) => typeof offer.rating === "number");
  const trustOffer = graph.bestTrustOffer || graph.topRatedOffer || (!hasAnyRatings ? graph.trackedLongestOffer : null);
  if (trustOffer?.id === entry.id) {
    return { label: "Strongest fixture evidence", tone: hasAnyRatings ? "rating" : "history" };
  }
  if (graph.trackedLongestOffer?.id === entry.id) {
    return { label: "Longest fixture history", tone: "history" };
  }
  if (entry.id === product.id) {
    return { label: "Current retailer", tone: "current" };
  }
  if (entry.availabilityState === "in_stock" && graph.offers.some((offer) => offer.availabilityState === "out_of_stock")) {
    return { label: "In stock in fixture", tone: "availability" };
  }
  return null;
}

export function getFallbackRetailerRecommendation(product, comparisonEntry) {
  const candidate = comparisonEntry.candidate;
  if (comparisonEntry.matchKind !== "exact") {
    if (comparisonEntry.matchKind === "family") {
      return { label: "Same-family variant", tone: "family" };
    }
    return { label: "Substitute option", tone: "alternative" };
  }
  if (typeof product.price === "number" && typeof candidate.price === "number" && candidate.price < product.price) {
    return { label: "Lower-price exact offer", tone: "price" };
  }
  if (
    typeof product.rating === "number" &&
    typeof candidate.rating === "number" &&
    candidate.rating > product.rating + 0.05
  ) {
    return { label: "Higher synthetic-rated exact offer", tone: "rating" };
  }
  if (comparisonEntry.equivalenceReasons?.length) {
    return { label: normalizeEquivalentReasonLabel(comparisonEntry.equivalenceReasons[0]), tone: "alternative" };
  }
  return null;
}

export function renderRetailerRecommendationMarkup(recommendation) {
  if (!recommendation?.label) return "";
  return `<p class="compare-recommendation compare-recommendation-${escapeHtml(recommendation.tone || "neutral")}">${escapeHtml(
    recommendation.label,
  )}</p>`;
}

export function getCompareDeltaEntries(currentEntry, candidateEntry, options = {}) {
  if (!currentEntry || !candidateEntry || currentEntry.id === candidateEntry.id) return [];

  const comparisonMode = options.comparisonMode || "exact";
  const productTradeoff = !isExactRetailerPresentationMode(comparisonMode);
  const deltas = [];
  if (typeof currentEntry.price === "number" && typeof candidateEntry.price === "number") {
    const diff = candidateEntry.price - currentEntry.price;
    if (Math.abs(diff) >= 0.01) {
      deltas.push({
        label: productTradeoff
          ? `${money(Math.abs(diff))} ${diff < 0 ? "lower" : "higher"} product price`
          : `${diff < 0 ? "-" : "+"}${money(Math.abs(diff))} vs current`,
        tone: diff < 0 ? "positive" : "negative",
      });
    }
  }

  if (typeof currentEntry.rating === "number" && typeof candidateEntry.rating === "number") {
    const diff = candidateEntry.rating - currentEntry.rating;
    if (Math.abs(diff) >= 0.05) {
      deltas.push({
      label: productTradeoff
          ? `${Math.abs(diff).toFixed(1)} ${diff > 0 ? "higher" : "lower"} synthetic rating tradeoff`
          : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} synthetic rating`,
        tone: diff > 0 ? "positive" : "negative",
      });
    }
  }

  if (typeof currentEntry.reviewCount === "number" && typeof candidateEntry.reviewCount === "number") {
    const diff = candidateEntry.reviewCount - currentEntry.reviewCount;
    if (Math.abs(diff) >= 10) {
      deltas.push({
        label: productTradeoff
          ? `${Math.abs(diff).toLocaleString()} ${diff > 0 ? "more" : "fewer"} synthetic review-depth signal`
          : `${diff > 0 ? "+" : ""}${diff.toLocaleString()} synthetic reviews`,
        tone: diff > 0 ? "positive" : "negative",
      });
    }
  }

  return deltas.slice(0, 3);
}

export function renderCompareDeltaMarkup(currentEntry, candidateEntry, options = {}) {
  const deltas = getCompareDeltaEntries(currentEntry, candidateEntry, options);
  if (!deltas.length) return "";
  return `
    <div class="compare-delta-row">
      ${deltas
        .map(
          (delta) =>
            `<span class="compare-delta compare-delta-${escapeHtml(delta.tone || "neutral")}">${escapeHtml(delta.label)}</span>`,
        )
        .join("")}
    </div>
  `;
}

export function getCompareDeltaSummary(currentEntry, candidateEntry, options = {}) {
  const details = [];
  const comparisonMode = options.comparisonMode || "exact";
  const productTradeoff = !isExactRetailerPresentationMode(comparisonMode);

  if (typeof currentEntry.price === "number" && typeof candidateEntry.price === "number") {
    const diff = candidateEntry.price - currentEntry.price;
    if (Math.abs(diff) >= 0.01) {
      details.push(
        productTradeoff
          ? `${money(Math.abs(diff))} ${diff < 0 ? "lower" : "higher"} product price than current.`
          : diff < 0
            ? `Save ${money(Math.abs(diff))} vs current.`
            : `${money(Math.abs(diff))} above current.`,
      );
    }
  }

  if (typeof currentEntry.rating === "number" && typeof candidateEntry.rating === "number") {
    const diff = candidateEntry.rating - currentEntry.rating;
    if (Math.abs(diff) >= 0.05) {
      details.push(
        productTradeoff
          ? `${Math.abs(diff).toFixed(1)} ${diff > 0 ? "higher" : "lower"} synthetic rating as a separate product.`
          : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} synthetic rating.`,
      );
    }
  }

  if (typeof currentEntry.reviewCount === "number" && typeof candidateEntry.reviewCount === "number") {
    const diff = candidateEntry.reviewCount - currentEntry.reviewCount;
    if (Math.abs(diff) >= 10) {
      details.push(
        productTradeoff
          ? `${Math.abs(diff).toLocaleString()} ${diff > 0 ? "more" : "fewer"} synthetic reviews as separate product evidence.`
          : `${diff > 0 ? "+" : ""}${diff.toLocaleString()} synthetic reviews.`,
      );
    }
  }

  return details.join(" ");
}

export function getRetailerBuyNowOffer(product, graph, options = {}) {
  const comparisonMode = options.comparisonMode || getRetailerGraphPresentationMode(product, graph);
  const eligibleOffers = isExactRetailerPresentationMode(comparisonMode)
    ? graph.offers.filter((entry) => getOfferGraphMatchKind(entry) === "exact")
    : graph.offers;
  const inStockOffers = eligibleOffers.filter((entry) => entry.availabilityState === "in_stock");
  const scopedOffers = inStockOffers.length ? inStockOffers : eligibleOffers;
  const pricedOffers = scopedOffers.filter((entry) => typeof entry.price === "number");
  if (pricedOffers.length) {
    return [...pricedOffers].sort(
      (a, b) =>
        a.price - b.price ||
        (b.rating ?? -1) - (a.rating ?? -1) ||
        (b.reviewCount ?? -1) - (a.reviewCount ?? -1) ||
        sortRetailerOfferEntries(product.id, a, b),
    )[0];
  }

  const ratedOffers = scopedOffers.filter((entry) => typeof entry.rating === "number");
  if (ratedOffers.length) {
    return [...ratedOffers].sort(
      (a, b) =>
        (b.rating ?? -1) - (a.rating ?? -1) ||
        (b.reviewCount ?? -1) - (a.reviewCount ?? -1) ||
        sortRetailerOfferEntries(product.id, a, b),
    )[0];
  }

  return getTrackedLongestOffer(scopedOffers, product.id) || scopedOffers[0] || null;
}

export function getRetailerGraphBuyNowSummary(product, graph, options = {}) {
  const comparisonMode = options.comparisonMode || getRetailerGraphPresentationMode(product, graph);
  if (!isExactRetailerPresentationMode(comparisonMode)) return null;
  const winner = getRetailerBuyNowOffer(product, graph, { comparisonMode });
  if (!winner) return null;
  const groupLabel = "Exact same product";
  const detail = winner.id === product.id
    ? `${groupLabel} across ${graph.retailerCount} stores. The selected fixture retailer carries the clearest fixture value signal.`
    : `${groupLabel} across ${graph.retailerCount} stores. ${getCompareDeltaSummary(product, winner) || "Best current mix of price, trust, and availability."}`;
  return {
    winner,
    title: winner.id === product.id ? `Selected fixture: ${winner.retailer}` : `${winner.retailer} leads this fixture`,
    detail,
  };
}

export function getRetailerFallbackBuyNowSummary(product, comparisons, options = {}) {
  const comparisonMode = options.comparisonMode || getFallbackComparisonPresentationMode(comparisons);
  if (!isExactRetailerPresentationMode(comparisonMode)) return null;
  const exactComparisons = comparisons.filter((entry) => entry.matchKind === "exact");
  if (!exactComparisons.length) return null;
  const bestEntry = [...exactComparisons].sort((a, b) => {
    const rank = { exact: 3, family: 2, alternative: 1 };
    return (
      (rank[b.matchKind] || 0) - (rank[a.matchKind] || 0) ||
      (a.candidate.price ?? Number.MAX_SAFE_INTEGER) - (b.candidate.price ?? Number.MAX_SAFE_INTEGER) ||
      (b.candidate.rating ?? -1) - (a.candidate.rating ?? -1) ||
      (b.candidate.reviewCount ?? -1) - (a.candidate.reviewCount ?? -1)
    );
  })[0];
  return {
    winner: bestEntry.candidate,
    title: bestEntry.candidate.retailer,
    detail: `${bestEntry.matchType}. ${getCompareDeltaSummary(product, bestEntry.candidate) || "Strongest available store option in this fictional fixture."}`,
  };
}

export function getCompareRoleState(entryId, currentId, winnerId, options = {}) {
  const {
    includeAlternative = true,
    currentWinnerLabel = "Current winner",
    winnerLabel = "Fixture leader",
    currentLabel = "Current store",
    alternativeLabel = "Alternative",
  } = options;
  if (entryId && winnerId && entryId === winnerId && entryId === currentId) {
    return { label: currentWinnerLabel, tone: "best" };
  }
  if (entryId && winnerId && entryId === winnerId) {
    return { label: winnerLabel, tone: "best" };
  }
  if (entryId && currentId && entryId === currentId) {
    return { label: currentLabel, tone: "current" };
  }
  if (includeAlternative) {
    return { label: alternativeLabel, tone: "alternative" };
  }
  return null;
}

export function renderCompareRoleMarkup(roleState) {
  if (!roleState?.label) return "";
  return `<span class="compare-role compare-role-${escapeHtml(roleState.tone || "neutral")}">${escapeHtml(roleState.label)}</span>`;
}

export function getCompareRoleOptionsForMode(comparisonMode, matchKind = "alternative") {
  if (isExactRetailerPresentationMode(comparisonMode)) return {};
  const modeCopy = getRetailerComparisonModeCopy(matchKind === "family" ? "family" : comparisonMode);
  return {
    currentLabel: getRetailerComparisonModeCopy(comparisonMode).currentRole,
    alternativeLabel: modeCopy.alternativeRole,
  };
}

export function renderCurrentCompareProductItem(product, comparisonMode) {
  const modeCopy = getRetailerComparisonModeCopy(comparisonMode);
  const roleState = getCompareRoleState(product.id, product.id, "", {
    currentLabel: modeCopy.currentRole,
    includeAlternative: false,
  });
  return `
    <article class="compare-item compare-item-current">
      <div class="compare-topline">
        <div class="compare-topline-main">
          <span class="compare-retailer">${escapeHtml(product.retailer || "Current retailer")}</span>
          ${renderCompareRoleMarkup(roleState)}
        </div>
        <span class="compare-match compare-match-current">Current product</span>
      </div>
      <strong>${escapeHtml([product.brand, product.name].filter(Boolean).join(" "))}</strong>
      ${renderRetailerRecommendationMarkup({ label: "Baseline for this alternative check", tone: "current" })}
      <p class="compare-stats">
        <span>${money(product.price)}</span>
        ${
          typeof product.rating === "number"
            ? `<span>${product.rating.toFixed(1)}★ synthetic fixture${typeof product.reviewCount === "number" ? ` · ${product.reviewCount.toLocaleString()} synthetic fixture reviews` : ""}</span>`
            : `<span>Rating unavailable</span>`
        }
      </p>
      ${renderRetailerOfferHistory(product)}
      <span class="compare-link" aria-disabled="true">${escapeHtml(getOutboundLabel(
        product.retailer,
        "Open current demo offer",
      ))}</span>
    </article>
  `;
}

export function sortGraphOffersForDisplay(product, graph, winnerId = "") {
  return [...(graph?.offers || [])].sort((a, b) => {
    const aWinner = winnerId && a.id === winnerId ? 1 : 0;
    const bWinner = winnerId && b.id === winnerId ? 1 : 0;
    if (aWinner !== bWinner) return bWinner - aWinner;

    const aCurrent = a.id === product.id ? 1 : 0;
    const bCurrent = b.id === product.id ? 1 : 0;
    if (aCurrent !== bCurrent) return bCurrent - aCurrent;

    const classDelta =
      getRetailerEquivalentMatchClassRank(getRetailerEquivalentMatchClassFromMetadata(a)) -
      getRetailerEquivalentMatchClassRank(getRetailerEquivalentMatchClassFromMetadata(b));
    if (classDelta) return classDelta;

    return (
      (b.equivalenceScore || 0) - (a.equivalenceScore || 0) ||
      sortRetailerOfferEntries(product.id, a, b)
    );
  });
}

export function sortFallbackComparisonsForDisplay(product, comparisons, winnerId = "") {
  return [...comparisons].sort((a, b) => {
    const aWinner = winnerId && a.candidate.id === winnerId ? 1 : 0;
    const bWinner = winnerId && b.candidate.id === winnerId ? 1 : 0;
    if (aWinner !== bWinner) return bWinner - aWinner;

    const aMatch = getRetailerEquivalentMatch(product, a.candidate);
    const bMatch = getRetailerEquivalentMatch(product, b.candidate);
    const classDelta =
      getRetailerEquivalentMatchClassRank(aMatch.matchClass) -
      getRetailerEquivalentMatchClassRank(bMatch.matchClass);
    if (classDelta) return classDelta;

    const aScore = Number.isFinite(a.equivalenceScore) ? a.equivalenceScore : aMatch.score;
    const bScore = Number.isFinite(b.equivalenceScore) ? b.equivalenceScore : bMatch.score;
    return (
      (Number.isFinite(bScore) ? bScore : 0) - (Number.isFinite(aScore) ? aScore : 0) ||
      (a.candidate.price ?? Number.MAX_SAFE_INTEGER) - (b.candidate.price ?? Number.MAX_SAFE_INTEGER) ||
      (b.candidate.rating ?? -1) - (a.candidate.rating ?? -1) ||
      (b.candidate.reviewCount ?? -1) - (a.candidate.reviewCount ?? -1) ||
      String(a.retailer || "").localeCompare(String(b.retailer || ""))
    );
  });
}

export function getRetailerGraphSummary(product, graph, options = {}) {
  const comparisonMode = options.comparisonMode || getRetailerGraphPresentationMode(product, graph);
  const modeCopy = getRetailerComparisonModeCopy(comparisonMode);
  const optionCount = graph.retailerCount || graph.offers?.length || 0;
  const offerCountLabel = `${optionCount} ${modeCopy.offerNoun}${optionCount === 1 ? "" : "s"}`;
  if (!isExactRetailerPresentationMode(comparisonMode)) {
    return {
      offerCountLabel,
      priceSummary: "Prices compare product tradeoffs, not store savings",
      ratingSummary: "Synthetic ratings compare different products",
      trustSummary: "Synthetic review and rating signals compare different products",
      closestEquivalent: true,
    };
  }
  const priceSummary = graph.lowestPriceOffer
    ? graph.lowestPriceOffer.id === product.id
      ? "Lowest fixture price on this card"
      : `Lowest fixture price at ${graph.lowestPriceOffer.retailer}`
    : "Price comparison limited";
  const ratingSummary = graph.topRatedOffer
    ? graph.topRatedOffer.id === product.id
      ? "Highest synthetic rating on this card"
      : `Highest synthetic rating at ${graph.topRatedOffer.retailer}`
    : "Synthetic rating coverage varies";
  const trustSummary = graph.bestTrustOffer
    ? graph.bestTrustOffer.id === product.id
      ? "Strongest trust signal on this card"
      : `Strongest trust signal at ${graph.bestTrustOffer.retailer}`
    : ratingSummary;
  return {
    offerCountLabel,
    priceSummary,
    ratingSummary,
    trustSummary,
    closestEquivalent: false,
  };
}

export function compareRetailerEquivalentChoices(a, b) {
  const classRank = {
    exact: 0,
    strong_alternative: 1,
    weak_alternative: 2,
    insufficient_evidence: 3,
  };
  const classDelta =
    (classRank[a?.match?.matchClass] ?? 3) -
    (classRank[b?.match?.matchClass] ?? 3);
  if (classDelta) return classDelta;

  const aScore = Number.isFinite(a?.match?.score) ? a.match.score : 0;
  const bScore = Number.isFinite(b?.match?.score) ? b.match.score : 0;
  if (aScore !== bScore) return bScore - aScore;
  return sortRetailerOfferEntries("", a?.candidate || {}, b?.candidate || {});
}

export function resolvePrecomputedRetailerMatches(product, productLookup) {
  const entries = Array.isArray(product?.closestEquivalentMatches) ? product.closestEquivalentMatches : [];
  const productsByNormalizedId = productLookup?.productsByNormalizedId;
  if (!(productsByNormalizedId instanceof Map)) return [];

  const baseId = normalizeRetailerEquivalentProductId(product);
  const seenIds = new Set();
  const resolved = [];
  entries.forEach((entry) => {
    if (!entry || typeof entry !== "object") return;
    const candidateId = String(entry.id || "").trim();
    if (!candidateId || candidateId === baseId || seenIds.has(candidateId)) return;
    const candidate = productsByNormalizedId.get(candidateId);
    if (!candidate || candidate.retailer === product.retailer) return;
    if (entry.retailer && String(entry.retailer).trim() !== String(candidate.retailer || "").trim()) return;

    const entryKind = String(entry.matchKind || "").trim().toLowerCase();
    if (!RETAILER_MATCH_LABELS[entryKind]) return;
    if (entryKind === "exact") {
      if (entry.score !== null && entry.score !== undefined) return;
    } else if (!Number.isFinite(entry.score)) {
      return;
    }
    const match = {
      eligible: true,
      identityRelation: entryKind === "exact" ? "exact" : "alternative",
      matchClass: getRetailerEquivalentMatchClassFromMetadata({
        ...entry,
        category: candidate.category,
      }),
      matchKind: entryKind,
      score: entryKind === "exact" ? null : Number(entry.score),
      reasons: [],
      sharedConcerns: Array.isArray(entry.sharedConcerns) ? entry.sharedConcerns : [],
      sharedIngredientGroups: Array.isArray(entry.sharedIngredientGroups) ? entry.sharedIngredientGroups : [],
    };
    if (match.matchClass === "insufficient_evidence") return;

    seenIds.add(candidateId);
    resolved.push({
      candidate,
      match: {
        ...match,
        score: entryKind === "exact" ? null : Number(entry.score),
        reasons: (Array.isArray(entry.reasons) ? entry.reasons : [])
          .map((reason) => normalizeEquivalentReasonLabel(reason))
          .filter(Boolean)
          .slice(0, 3),
      },
    });
  });
  return resolved;
}

export function getRetailerComparison(product) {
  const comparisonKey = getComparableProductKey(product);
  const productLookup = getProductLookupState();
  const { productsByComparableKey } = productLookup;
  const exactMatches = comparisonKey
    ? (productsByComparableKey.get(comparisonKey) || []).filter(
        (candidate) =>
          normalizeRetailerEquivalentProductId(candidate) !== normalizeRetailerEquivalentProductId(product) &&
          candidate.retailer !== product.retailer,
      )
    : [];
  const precomputedMatches = resolvePrecomputedRetailerMatches(product, productLookup);
  const precomputedByRetailer = new Map(
    precomputedMatches.map((entry) => [entry.candidate.retailer, entry]),
  );
  const retailers = new Set([
    ...(state.metadata?.retailers || []),
    ...precomputedMatches.map((entry) => entry.candidate.retailer),
  ]);
  const comparisons = [];

  [...retailers]
    .filter((retailer) => retailer !== product.retailer)
    .sort((a, b) => String(a || "").localeCompare(String(b || "")))
    .forEach((retailer) => {
      let selected = precomputedByRetailer.get(retailer) || null;
      if (!selected) {
        const exactCandidate = exactMatches.find(
          (candidate) => candidate.retailer === retailer,
        );
        if (exactCandidate) {
          selected = {
            candidate: exactCandidate,
            match: {
              eligible: true,
              identityRelation: "exact",
              matchClass: "exact",
              matchKind: "exact",
              score: null,
              reasons: ["Exact same product"],
              sharedConcerns: [],
              sharedIngredientGroups: [],
            },
          };
        }
      }

      if (!selected) return;
      const { candidate, match } = selected;
      comparisons.push({
        retailer,
        candidate,
        matchKind: match.matchKind,
        matchType: getRetailerMatchLabel(match.matchKind),
        equivalenceScore: Number.isFinite(match.score) ? match.score : null,
        equivalenceReasons: match.reasons || [],
        _matchClass: match.matchClass,
      });
    });

  return comparisons
    .sort((a, b) => {
      const classRank = {
        exact: 0,
        strong_alternative: 1,
        weak_alternative: 2,
      };
      return (
        (classRank[a._matchClass] ?? 3) - (classRank[b._matchClass] ?? 3) ||
        (b.equivalenceScore || 0) - (a.equivalenceScore || 0) ||
        String(a.retailer || "").localeCompare(String(b.retailer || "")) ||
        normalizeRetailerEquivalentProductId(a.candidate).localeCompare(
          normalizeRetailerEquivalentProductId(b.candidate),
        )
      );
    })
    .slice(0, 2)
    .map(({ _matchClass, ...entry }) => entry);
}

export function renderRetailerComparisonMarkup(product) {
  return getRetailerComparisonRenderState(product).markup;
}

export function getCatalogCardComparisonMetadataState(product) {
  const canonicalRetailers = Array.isArray(product?.canonicalRetailers) ? product.canonicalRetailers : [];
  const comparisonRetailerCount = Number(product?.comparisonRetailerCount || 0);
  const hasExactMetadata =
    canonicalRetailers.length > 1 ||
    comparisonRetailerCount > 1;
  const closestEquivalentMatches = Array.isArray(product?.closestEquivalentMatches) ? product.closestEquivalentMatches : [];
  const closestMatchKind = closestEquivalentMatches.some((entry) => String(entry?.matchKind || "").toLowerCase() === "family")
    ? "family"
    : closestEquivalentMatches.length ||
        (Array.isArray(product?.closestEquivalentIds) && product.closestEquivalentIds.length) ||
        Number(product?.closestEquivalentGroupSize || 0) > 1 ||
        Number(product?.closestEquivalentRetailerCount || 0) > 1
      ? "alternative"
      : "";
  return {
    hasExactGraph: hasExactMetadata,
    matchKind: hasExactMetadata ? "exact" : closestMatchKind || "none",
    comparisonMode: hasExactMetadata ? "exact" : closestMatchKind ? "closest-equivalent" : "none",
  };
}

export function getCatalogCardComparisonSummaryState(product) {
  const graph = getRetailerOfferGraph(product);
  if (graph) {
    const presentationMode = getRetailerGraphPresentationMode(product, graph);
    const exactStoreMode = isExactRetailerPresentationMode(presentationMode);
    return {
      hasExactGraph: true,
      comparisonMode: exactStoreMode ? "exact" : "closest-equivalent",
      matchKind: exactStoreMode ? "exact" : presentationMode === "family" ? "family" : "alternative",
    };
  }

  const comparisons = getRetailerComparison(product);
  if (comparisons.length) {
    const presentationMode = getFallbackComparisonPresentationMode(comparisons);
    const exactStoreMode = isExactRetailerPresentationMode(presentationMode);
    return {
      hasExactGraph: false,
      comparisonMode: exactStoreMode ? "exact" : "closest-equivalent",
      matchKind: exactStoreMode ? "exact" : presentationMode === "family" ? "family" : "alternative",
    };
  }

  return getCatalogCardComparisonMetadataState(product);
}

export function getCatalogCardComparisonShellState(product) {
  return getCatalogCardComparisonSummaryState(product);
}

export function hydrateCatalogCardComparisons(products, options = {}) {
  const renderSequence = Number(options.renderSequence || 0);
  if (renderSequence && renderSequence !== catalogProductRenderSequence) return;
  if (!productGrid || !Array.isArray(products) || !products.length) return;
  const snapshotContextByProductId = options.snapshotContextByProductId instanceof Map ? options.snapshotContextByProductId : new Map();
  const cardsById = new Map(
    Array.from(productGrid.querySelectorAll(".product-card[data-product-id]")).map((card) => [
      card.dataset.productId,
      card,
    ]),
  );
  products.forEach((product) => {
    if (!product?.id) return;
    const productCard = cardsById.get(product.id);
    if (!productCard) return;
    const retailerCompare = productCard.querySelector(".retailer-compare");
    const snapshotRow = productCard.querySelector(".product-snapshot-row");
    if (!retailerCompare && !snapshotRow) return;
    const comparisonState = getRetailerComparisonRenderState(product);
    const snapshotContext = snapshotContextByProductId.get(product.id) || {};
    const initialComparisonSummary = snapshotContext.retailerComparison || null;
    const comparisonSummary = getApiRetailerOfferGraph(product)
      ? getCatalogCardComparisonSummaryState(product)
      : initialComparisonSummary || getCatalogCardComparisonSummaryState(product);
    if (retailerCompare) {
      retailerCompare.hidden = !comparisonState.markup;
      retailerCompare.innerHTML = comparisonState.markup || "";
    }
    const warnings = Array.isArray(snapshotContext.warnings)
      ? snapshotContext.warnings
      : getProductConflictWarnings(product, { routineTime: state.routineTime });
    const contextSignal = getCatalogContextSignal(product);
    const hasIngredientInsight =
      shouldShowCatalogIngredientInsight(product) && !contextSignal && !comparisonSummary.hasExactGraph;
    const signalProfile = getCatalogCardSignalProfile(product, {
      hasIngredientInsight,
      hasConflict: warnings.length > 0,
      hasRetailerGraph: comparisonSummary.hasExactGraph,
      hasContextSignal: Boolean(contextSignal),
    });
    productCard.classList.toggle("product-card-comparison-strong", signalProfile.hasOverlap);
    productCard.classList.toggle("product-card-weak-data", signalProfile.weakData);
    renderCatalogComparisonSnapshotRow(
      snapshotRow,
      buildCatalogComparisonSnapshotForCard(product, {
        ...snapshotContext,
        retailerComparison: comparisonSummary,
        warnings,
      }),
    );
  });
  syncRetailerPopoverChromeInterlocks();
}

export function getStableDomToken(value) {
  return (
    String(value || "item")
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

export function getComparePopoverPanelId(product) {
  return `compare-popover-panel-${getStableDomToken(product?.id)}`;
}

export function getCompareToggleLabel(comparisonMode = "exact") {
  if (comparisonMode === "family") return "Check variants";
  if (comparisonMode === "alternative" || comparisonMode === "closest-equivalent") return "Check alternatives";
  return "Compare stores";
}

export function getCompareToggleMeta(product, { comparisonMode = "exact", graph = null, comparisons = [] } = {}) {
  const mode = comparisonMode === "closest-equivalent" ? "alternative" : comparisonMode;
  const cues = [];
  if (mode === "exact") {
    const retailerCount =
      Number(graph?.retailerCount || 0) ||
      new Set([product?.retailer, ...(comparisons || []).map((entry) => entry?.retailer)].filter(Boolean)).size;
    if (retailerCount > 1) cues.push(`${retailerCount} stores`);
    if (graph?.lowestPriceOffer?.retailer) {
      cues.push(`lowest fixture price ${graph.lowestPriceOffer.retailer}`);
    } else if (graph?.bestTrustOffer?.retailer) {
      cues.push(`strongest fixture evidence ${graph.bestTrustOffer.retailer}`);
    } else if (graph?.topRatedOffer?.retailer) {
      cues.push(`highest synthetic rating ${graph.topRatedOffer.retailer}`);
    } else if (comparisons?.length) {
      const lowest = comparisons
        .map((entry) => entry?.candidate || entry)
        .filter((entry) => typeof entry?.price === "number")
        .sort((a, b) => a.price - b.price)[0];
      if (lowest?.retailer) cues.push(`lowest fixture price ${lowest.retailer}`);
    }
    return cues.slice(0, 2).join(" · ");
  }

  const optionCount = Number(graph?.offers?.length || 0) || (comparisons?.length ? comparisons.length + 1 : 0);
  if (optionCount > 1) cues.push(`${optionCount} options`);
  cues.push(mode === "family" ? "variant mode" : "closest mode");
  return cues.join(" · ");
}

export function renderCompareToggleMarkup(product, options = {}) {
  const isOpen = state.ui.openRetailerCompareId === product.id;
  const label = getCompareToggleLabel(options.comparisonMode);
  const meta = getCompareToggleMeta(product, options);
  const ariaLabel = [DECISION_DESK_COPY.compare.toggle, label, meta].filter(Boolean).join(": ");
  return `<summary class="compare-toggle" aria-expanded="${String(isOpen)}" aria-controls="${escapeHtml(getComparePopoverPanelId(product))}" aria-label="${escapeHtml(ariaLabel)}"><span>${escapeHtml(label)}</span>${meta ? `<small>${escapeHtml(meta)}</small>` : ""}</summary>`;
}

export function getRetailerComparisonRenderState(product) {
  const graph = getRetailerOfferGraph(product);
  const comparisonLoading = Boolean(state.live.productComparisonLoading[product.id]);
  const comparisonRefreshMarkup = comparisonLoading
    ? `<p class="compare-graph-note">Refreshing fixture comparison...</p>`
    : "";
  if (graph) {
    const comparisonMode = getRetailerGraphPresentationMode(product, graph);
    const modeCopy = getRetailerComparisonModeCopy(comparisonMode);
    const exactStoreMode = isExactRetailerPresentationMode(comparisonMode);
    const { offerCountLabel, priceSummary, trustSummary, closestEquivalent } = getRetailerGraphSummary(product, graph, { comparisonMode });
    const buyNowSummary = exactStoreMode ? getRetailerGraphBuyNowSummary(product, graph, { comparisonMode }) : null;
    const winnerId = buyNowSummary?.winner?.id || "";
    const orderedOffers = sortGraphOffersForDisplay(product, graph, winnerId);
    const compareTitle = modeCopy.title;
    const introText = exactStoreMode
      ? `${product.brand} ${product.name} appears across ${graph.retailerCount} stores in the fictional demo catalog.`
      : comparisonMode === "family"
        ? `${product.brand} ${product.name} does not have broad exact overlap, so this check uses same-family variants without treating them as retailer-price equivalents.`
        : `${product.brand} ${product.name} does not have broad exact overlap, so this check uses the closest compatible substitute options without treating them as retailer-price equivalents.`;
    return {
      hasExactGraph: true,
      comparisonMode: exactStoreMode ? "exact" : "closest-equivalent",
      matchKind: exactStoreMode ? "exact" : comparisonMode === "family" ? "family" : "alternative",
      markup: `
      <div class="compare-head">
        <span>${DECISION_DESK_COPY.compare.label}</span>
        <strong>${escapeHtml(offerCountLabel)}</strong>
      </div>
      <p class="compare-summary-note">${escapeHtml(priceSummary)} · ${escapeHtml(trustSummary)}</p>
      <details class="compare-popover" data-product-id="${escapeHtml(product.id)}" ${state.ui.openRetailerCompareId === product.id ? "open" : ""}>
        ${renderCompareToggleMarkup(product, { comparisonMode, graph })}
        <div id="${escapeHtml(getComparePopoverPanelId(product))}" class="compare-popover-panel">
        <div class="compare-popover-header">
          <div>
            <span class="compare-popover-kicker">${DECISION_DESK_COPY.compare.label}</span>
            <strong>${escapeHtml(compareTitle)}</strong>
          </div>
          <button class="compare-close" type="button" aria-label="Close retailer check">Close</button>
        </div>
        ${
          exactStoreMode && buyNowSummary
            ? `
              <div class="compare-buy-now">
                <span class="compare-buy-now-label">${escapeHtml(modeCopy.buyLabel)}</span>
                <strong>${escapeHtml(buyNowSummary.title)}</strong>
                <p>${escapeHtml(buyNowSummary.detail)}</p>
              </div>
            `
            : !exactStoreMode
              ? `
                <div class="compare-buy-now compare-buy-now-alternative">
                  <span class="compare-buy-now-label">${escapeHtml(modeCopy.buyLabel)}</span>
                  <strong>${escapeHtml(modeCopy.summaryTitle)}</strong>
                  <p>${escapeHtml(modeCopy.summaryDetail)}</p>
                </div>
              `
            : ""
        }
        <div class="compare-popover-intro">
          <p>${escapeHtml(introText)}</p>
          <p class="compare-graph-note">${escapeHtml(priceSummary)}. ${escapeHtml(trustSummary)}.</p>
          ${comparisonRefreshMarkup}
        </div>
        <div class="compare-list">
            ${orderedOffers
              .map((entry) => {
                const isCurrent = entry.id === product.id;
                const isWinner = winnerId && entry.id === winnerId;
                const recommendation = getRetailerGraphRecommendation(entry, product, graph);
                const matchKind = getOfferGraphMatchKind(entry);
                const roleState = getCompareRoleState(
                  entry.id,
                  product.id,
                  winnerId,
                  getCompareRoleOptionsForMode(comparisonMode, matchKind),
                );
                const matchLabel = !exactStoreMode && isCurrent ? "Current product" : entry.matchType || getRetailerMatchLabel(matchKind);
                return `
                  <article class="compare-item ${isCurrent ? "compare-item-current" : matchKind === "exact" ? "compare-item-exact" : "compare-item-close"}${isWinner ? " compare-item-best" : ""}">
                    <div class="compare-topline">
                      <div class="compare-topline-main">
                        <span class="compare-retailer">${escapeHtml(entry.retailer)}</span>
                        ${renderCompareRoleMarkup(roleState)}
                      </div>
                      <span class="compare-match compare-match-${!exactStoreMode && isCurrent ? "current" : matchKind}">${escapeHtml(matchLabel)}</span>
                    </div>
                    <strong>${escapeHtml(entry.brand)} ${escapeHtml(entry.name)}</strong>
                    ${renderRetailerRecommendationMarkup(recommendation)}
                    <p class="compare-stats">
                      <span>${money(entry.price)}</span>
                      ${
                        typeof entry.rating === "number"
                          ? `<span>${entry.rating.toFixed(1)}★ synthetic fixture${typeof entry.reviewCount === "number" ? ` · ${entry.reviewCount.toLocaleString()} synthetic fixture reviews` : ""}</span>`
                        : `<span>Rating unavailable</span>`
                      }
                    </p>
                    ${renderCompareDeltaMarkup(product, entry, { comparisonMode })}
                    ${renderRetailerOfferHistory(entry)}
                    <span class="compare-link" aria-disabled="true">${escapeHtml(getOutboundLabel(
                      entry.retailer,
                      isCurrent ? "Open current demo offer" : `Open ${entry.retailer} demo offer`,
                    ))}</span>
                  </article>
                `;
              })
              .join("")}
          </div>
          ${renderCompareExplainerMarkup(product)}
        </div>
      </details>
    `,
    };
  }

  const comparisons = getRetailerComparison(product);
  if (!comparisons.length) {
    const shellState = getCatalogCardComparisonShellState(product);
    return {
      hasExactGraph: false,
      matchKind: shellState.matchKind || "none",
      markup: "",
    };
  }
  const exactCount = comparisons.filter((entry) => entry.matchKind === "exact").length;
  const familyCount = comparisons.filter((entry) => entry.matchKind === "family").length;
  const closeCount = comparisons.filter((entry) => entry.matchKind === "alternative").length;
  const comparisonMode = getFallbackComparisonPresentationMode(comparisons);
  const modeCopy = getRetailerComparisonModeCopy(comparisonMode);
  const exactStoreMode = isExactRetailerPresentationMode(comparisonMode);
  let comparisonSummary = `${comparisons.length} retailer match${comparisons.length === 1 ? "" : "es"}`;
  if (exactCount || familyCount || closeCount) {
    const parts = [];
    if (exactCount) parts.push(`${exactCount} exact`);
    if (familyCount) parts.push(`${familyCount} family`);
    if (closeCount) parts.push(`${closeCount} alternative${closeCount === 1 ? "" : "s"}`);
    comparisonSummary = parts.join(" · ");
  }
  const buyNowSummary = exactStoreMode ? getRetailerFallbackBuyNowSummary(product, comparisons, { comparisonMode }) : null;
  const winnerId = buyNowSummary?.winner?.id || "";
  const orderedComparisons = sortFallbackComparisonsForDisplay(product, comparisons, winnerId);
  const fallbackIntroNote = exactStoreMode
    ? "Exact same-product matches stay first, then same-family variants, then broader alternatives."
    : comparisonMode === "family"
      ? "No exact same-product match showed up, so same-family variants are shown as product tradeoffs rather than store savings."
      : "No exact same-product match showed up, so this view falls back to substitute options and frames price, synthetic ratings, and synthetic reviews as product tradeoffs.";
  return {
    hasExactGraph: false,
    comparisonMode: exactStoreMode ? "exact" : "closest-equivalent",
    matchKind: exactStoreMode ? "exact" : comparisonMode === "family" ? "family" : "alternative",
    markup: `
    <div class="compare-head">
      <span>${DECISION_DESK_COPY.compare.label}</span>
      <strong>${escapeHtml(comparisonSummary)}</strong>
    </div>
    <details class="compare-popover" data-product-id="${escapeHtml(product.id)}" ${state.ui.openRetailerCompareId === product.id ? "open" : ""}>
      ${renderCompareToggleMarkup(product, { comparisonMode, comparisons })}
      <div id="${escapeHtml(getComparePopoverPanelId(product))}" class="compare-popover-panel">
        <div class="compare-popover-header">
          <div>
            <span class="compare-popover-kicker">${DECISION_DESK_COPY.compare.label}</span>
            <strong>${escapeHtml(exactStoreMode ? DECISION_DESK_COPY.compare.fallbackTitle : modeCopy.title)}</strong>
          </div>
          <button class="compare-close" type="button" aria-label="Close retailer check">Close</button>
        </div>
        ${
          exactStoreMode && buyNowSummary
            ? `
              <div class="compare-buy-now">
                <span class="compare-buy-now-label">${escapeHtml(modeCopy.buyLabel)}</span>
                <strong>${escapeHtml(buyNowSummary.title)}</strong>
                <p>${escapeHtml(buyNowSummary.detail)}</p>
              </div>
            `
            : !exactStoreMode
              ? `
                <div class="compare-buy-now compare-buy-now-alternative">
                  <span class="compare-buy-now-label">${escapeHtml(modeCopy.buyLabel)}</span>
                  <strong>${escapeHtml(modeCopy.summaryTitle)}</strong>
                  <p>${escapeHtml(modeCopy.summaryDetail)}</p>
                </div>
              `
            : ""
        }
        <div class="compare-popover-intro">
          <p>${escapeHtml(comparisonSummary)} in the fictional demo catalog.</p>
          <p class="compare-graph-note">${escapeHtml(fallbackIntroNote)}</p>
          ${comparisonRefreshMarkup}
        </div>
        <div class="compare-list">
          ${!exactStoreMode ? renderCurrentCompareProductItem(product, comparisonMode) : ""}
          ${orderedComparisons
            .map((entry) => {
              const recommendation = getFallbackRetailerRecommendation(product, entry);
              const isWinner = winnerId && entry.candidate.id === winnerId;
              const roleState = getCompareRoleState(
                entry.candidate.id,
                "",
                winnerId,
                getCompareRoleOptionsForMode(comparisonMode, entry.matchKind),
              );
              return `
                <article class="compare-item ${entry.matchKind === "exact" ? "compare-item-exact" : "compare-item-close"}${isWinner ? " compare-item-best" : ""}">
                  <div class="compare-topline">
                    <div class="compare-topline-main">
                      <span class="compare-retailer">${escapeHtml(entry.retailer)}</span>
                      ${renderCompareRoleMarkup(roleState)}
                    </div>
                    <span class="compare-match compare-match-${escapeHtml(entry.matchKind)}">${escapeHtml(entry.matchType)}</span>
                  </div>
                  <strong>${escapeHtml(entry.candidate.brand)} ${escapeHtml(entry.candidate.name)}</strong>
                  ${renderRetailerRecommendationMarkup(recommendation)}
                  ${
                    entry.equivalenceReasons?.length
                      ? `<p class="compare-equivalence-note">${escapeHtml(normalizeEquivalentReasonLabels(entry.equivalenceReasons, 2).join(" · "))}</p>`
                      : ""
                  }
                  <p class="compare-stats">
                    <span>${money(entry.candidate.price)}</span>
                    ${
                      typeof entry.candidate.rating === "number"
                        ? `<span>${entry.candidate.rating.toFixed(1)}★ synthetic fixture${typeof entry.candidate.reviewCount === "number" ? ` · ${entry.candidate.reviewCount.toLocaleString()} synthetic fixture reviews` : ""}</span>`
                        : `<span>Rating unavailable</span>`
                    }
                  </p>
                  ${renderCompareDeltaMarkup(product, entry.candidate, { comparisonMode })}
                  ${renderRetailerOfferHistory(entry.candidate)}
                  <span class="compare-link" aria-disabled="true">${escapeHtml(getOutboundLabel(
                    entry.retailer,
                    `Open ${entry.retailer} demo offer`,
                  ))}</span>
                </article>
              `;
            })
            .join("")}
        </div>
        ${renderCompareExplainerMarkup(product)}
      </div>
    </details>
  `,
  };
}

export function getRoutineBasketOffers(product) {
  const graph = getRetailerOfferGraph(product);
  const offers = graph?.offers?.length ? graph.offers : [product];
  const productId = normalizeRetailerEquivalentProductId(product);
  return offers.filter((entry) => {
    if (!entry) return false;
    if (normalizeRetailerEquivalentProductId(entry) === productId) return true;
    return (
      getOfferGraphMatchKind(entry) === "exact" &&
      getRetailerEquivalentIdentityRelation(product, entry) === "exact"
    );
  });
}

export function getRoutineBasketAvailabilityRank(entry) {
  const group = getOfferAvailabilityGroup(entry);
  if (group === "available_now") return 0;
  if (group === "limited_now") return 1;
  if (group === "unknown") return 2;
  if (group === "future") return 3;
  return 4;
}

export function sortRoutineBasketOffers(currentProductId, a, b) {
  const availabilityDelta = getRoutineBasketAvailabilityRank(a) - getRoutineBasketAvailabilityRank(b);
  if (availabilityDelta) return availabilityDelta;

  const aPrice = typeof a.price === "number" ? a.price : Number.MAX_SAFE_INTEGER;
  const bPrice = typeof b.price === "number" ? b.price : Number.MAX_SAFE_INTEGER;
  if (aPrice !== bPrice) return aPrice - bPrice;

  const aCurrent = a.id === currentProductId ? 1 : 0;
  const bCurrent = b.id === currentProductId ? 1 : 0;
  if (aCurrent !== bCurrent) return bCurrent - aCurrent;

  return sortRetailerOfferEntries(currentProductId, a, b);
}

export function buildMixedRoutineBasket(selectedEntries) {
  if (!selectedEntries.length) return null;

  const items = selectedEntries
    .map(({ step, product }) => {
      const offer = [...getRoutineBasketOffers(product)].sort((a, b) => sortRoutineBasketOffers(product.id, a, b))[0] || null;
      if (!offer) return null;
      return { step, product, offer };
    })
    .filter(Boolean);

  if (!items.length) return null;
  const retailerCount = new Set(items.map((item) => item.offer.retailer).filter(Boolean)).size;

  return {
    kind: "mixed",
    title: "Best mixed basket",
    subtitle: `Lowest exact total across ${retailerCount} retailer${retailerCount === 1 ? "" : "s"}.`,
    total: items.every((item) => typeof item.offer.price === "number")
      ? items.reduce((sum, item) => sum + item.offer.price, 0)
      : null,
    items,
  };
}

export function buildSingleRetailerRoutineBasket(selectedEntries) {
  if (!selectedEntries.length) return null;

  const entriesWithOffers = selectedEntries.map(({ step, product }) => ({
    step,
    product,
    offers: getRoutineBasketOffers(product),
  }));

  const retailers = [...new Set(entriesWithOffers.flatMap((entry) => entry.offers.map((offer) => offer.retailer)).filter(Boolean))];
  const candidates = retailers
    .map((retailer) => {
      const items = entriesWithOffers
        .map((entry) => {
          const offer = [...entry.offers]
            .filter((candidate) => candidate.retailer === retailer)
            .sort((a, b) => sortRoutineBasketOffers(entry.product.id, a, b))[0];
          return offer ? { step: entry.step, product: entry.product, offer } : null;
        })
        .filter(Boolean);
      if (items.length !== entriesWithOffers.length) return null;

      const availabilityPenalty = items.reduce((sum, item) => sum + getRoutineBasketAvailabilityRank(item.offer), 0);
      const total = items.every((item) => typeof item.offer.price === "number")
        ? items.reduce((sum, item) => sum + item.offer.price, 0)
        : null;

      return {
        kind: "single",
        title: "Best one-store basket",
        retailer,
        subtitle: `All exact picks on ${retailer}.`,
        total,
        sortTotal: total ?? Number.MAX_SAFE_INTEGER,
        availabilityPenalty,
        items,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.availabilityPenalty - b.availabilityPenalty ||
        a.sortTotal - b.sortTotal ||
        String(a.retailer || "").localeCompare(String(b.retailer || "")),
    );

  return candidates[0] || null;
}

export function serializeBasketOffer(offer) {
  if (!offer) return null;
  return {
    id: offer.id,
    canonicalProductId: offer.canonicalProductId || null,
    comparisonKey: offer.comparisonKey || null,
    retailer: offer.retailer,
    brand: offer.brand,
    name: offer.name,
    category: offer.category,
    price: offer.price,
    rating: offer.rating,
    reviewCount: offer.reviewCount,
    ratingSource: offer.ratingSource,
    availabilityState: offer.availabilityState || null,
    availabilityDetail: offer.availabilityDetail || null,
    url: offer.url,
    image: offer.image,
    previousPrice: offer.previousPrice,
    lowestPrice: offer.lowestPrice,
    firstSeenAt: offer.firstSeenAt || null,
    lastSeenAt: offer.lastSeenAt || null,
    trust: offer.trust || null,
  };
}

export function buildLocalBasketPayloadObject(basket, guidance) {
  if (!basket) return null;
  const items = basket.items.map((item) => ({
    requestedProductId: item.product.id,
    step: {
      key: item.step.key || null,
      label: item.step.label || "",
      priority: item.step.priority || getRoutineStepPriority(item.step, item.product),
    },
    requestedProduct: serializeBasketOffer(item.product),
    offer: serializeBasketOffer(item.offer),
    match: {
      kind: "exact",
      offerCount: getRoutineBasketOffers(item.product).length,
    },
  }));
  return {
    kind: basket.kind,
    title: basket.title,
    guidance,
    reason: guidance,
    retailer: basket.retailer || null,
    retailerCount: new Set(items.map((item) => item.offer?.retailer).filter(Boolean)).size,
    total: basket.total,
    coverageCount: items.length,
    subtitle: basket.subtitle,
    items,
  };
}

export function buildLocalBasketPlanPayload(selectedEntries, intent = "routine") {
  const mixedBasket = buildMixedRoutineBasket(selectedEntries);
  const singleRetailerBasket = buildSingleRetailerRoutineBasket(selectedEntries);
  return {
    generatedAt: state.freshness.catalog,
    intent,
    requestedCount: selectedEntries.length,
    coverageCount: mixedBasket?.items?.length || 0,
    guidance: {
      value: "Lowest fixture total",
      oneStore: "Best if you want one-store checkout",
    },
    mixedBasket: mixedBasket ? buildLocalBasketPayloadObject(mixedBasket, "Lowest fixture total") : null,
    oneStoreBasket: singleRetailerBasket ? buildLocalBasketPayloadObject(singleRetailerBasket, "Best if you want one-store checkout") : null,
    oneStoreStatus: singleRetailerBasket
      ? {
          complete: true,
          retailer: singleRetailerBasket.retailer || null,
          coverageCount: singleRetailerBasket.items.length,
          requestedCount: selectedEntries.length,
          missingProductIds: [],
          reason: `All exact picks line up on ${singleRetailerBasket.retailer}.`,
        }
      : {
          complete: false,
          retailer: null,
          coverageCount: 0,
          requestedCount: selectedEntries.length,
          missingProductIds: [],
          reason: "No single retailer covers every exact pick yet.",
        },
  };
}

export function buildBasketRequestKey(intent, productIds) {
  return `${intent}:${productIds.join(",")}`;
}

export function buildBasketStepContext(selectedEntries) {
  return selectedEntries.map(({ step, product }) => ({
    productId: product.id,
    stepKey: step.key || null,
    stepLabel: step.label || "",
    priority: step.priority || null,
  }));
}

export function getActiveBasketCache(intent) {
  return state.conversion.baskets[intent];
}

export function getActiveBasketPayload(intent, selectedEntries, fallbackPayload = null) {
  const productIds = selectedEntries.map((entry) => entry.product.id).filter(Boolean);
  const requestKey = buildBasketRequestKey(intent, productIds);
  const cache = getActiveBasketCache(intent);
  if (cache.requestKey === requestKey && cache.payload) {
    return cache.payload;
  }
  return fallbackPayload;
}

export async function ensureBasketPlan(intent, selectedEntries, options = {}) {
  const dedupe = Boolean(options.dedupe);
  const useLocalFallback = Boolean(options.useLocalFallback);
  const force = Boolean(options.force);
  const entries = dedupe
    ? selectedEntries.filter((entry, index, collection) => collection.findIndex((candidate) => candidate.product.id === entry.product.id) === index)
    : selectedEntries;
  const productIds = entries.map((entry) => entry.product.id).filter(Boolean);
  const requestKey = buildBasketRequestKey(intent, productIds);
  const cache = getActiveBasketCache(intent);

  if (!productIds.length) {
    cache.requestKey = null;
    cache.payload = null;
    cache.loading = false;
    cache.error = null;
    return null;
  }
  if (!force && cache.requestKey === requestKey && (cache.payload || cache.loading)) {
    return cache.payload;
  }

  cache.requestKey = requestKey;
  cache.loading = true;
  cache.error = null;
  if (intent === "routine") {
    renderRoutineBuilder();
  } else {
    renderFavorites();
  }

  const fallbackPayload = useLocalFallback ? buildLocalBasketPlanPayload(entries, intent) : null;
  try {
    if (state.live.apiBacked) {
      cache.payload = await postJson("/api/basket-plan", {
        productIds,
        intent,
        stepContext: buildBasketStepContext(entries),
      });
    } else {
      cache.payload = fallbackPayload;
    }
    cache.error = null;
  } catch {
    if (!cache.payload || cache.requestKey !== requestKey) {
      cache.payload = fallbackPayload;
    }
    cache.error = "request-failed";
  } finally {
    cache.loading = false;
    if (intent === "routine") {
      renderRoutineBuilder();
    } else {
      renderFavorites();
    }
  }
  return cache.payload;
}

export function renderBasketDegradedNoteMarkup(intent) {
  const cache = getActiveBasketCache(intent);
  if (!cache.error || !cache.payload) return "";
  return `<p class="routine-basket-note">Keeping the last basket view while fixture ${intent === "routine" ? "routine pricing" : "shortlist pricing"} reloads.</p>`;
}

export function renderRoutineBasketCardMarkup(basket) {
  if (!basket) return "";
  const totalLabel = typeof basket.total === "number" && Number.isFinite(basket.total) ? money(basket.total) : "Price mixed";
  const guidanceLabel = basket.guidance || basket.reason || "";
  return `
    <article class="routine-basket-card routine-basket-card-${escapeHtml(basket.kind || "mixed")}">
      <div class="routine-basket-head">
        <div>
          <span class="routine-basket-label">${escapeHtml(basket.title)}</span>
          <strong>${totalLabel}</strong>
        </div>
        <p>${escapeHtml(basket.subtitle || "")}</p>
      </div>
      ${guidanceLabel ? `<p class="routine-basket-guidance">${escapeHtml(guidanceLabel)}</p>` : ""}
      <div class="routine-basket-list">
        ${basket.items
          .map(
            (item) => `
              <div class="routine-basket-item">
                <div class="routine-basket-copy">
                  <span>${escapeHtml(item.step?.label || "Saved pick")}</span>
                  <strong>${escapeHtml(item.offer?.retailer || "Retailer")}</strong>
                  <small>${typeof item.offer?.price === "number" ? money(item.offer.price) : "Price unavailable"}${
                    item.offer?.availabilityState ? ` · ${escapeHtml(formatOfferAvailability(item.offer.availabilityState, item.offer?.availabilityDetail))}` : ""
                  }</small>
                </div>
                <div class="routine-basket-actions">
                  <button class="track-button ${isTrackedAlertId(item.offer?.id) ? "active" : ""}" type="button" data-track-id="${escapeHtml(item.offer?.id || "")}">
                    ${isTrackedAlertId(item.offer?.id) ? "Watching" : "Watch"}
                  </button>
                  <span class="routine-basket-link" aria-disabled="true">${escapeHtml(getOutboundLabel(
                    item.offer?.retailer,
                    "Open",
                  ))}</span>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </article>
  `;
}

export function renderRoutineBasketEmptyMarkup() {
  return `
    <article class="routine-basket-card routine-basket-card-empty">
      <div class="routine-basket-head">
        <div>
          <span class="routine-basket-label">Best one-store basket</span>
          <strong>No one-store exact basket yet</strong>
        </div>
        <p>Use the mixed basket when the exact same routine does not line up at one retailer.</p>
      </div>
    </article>
  `;
}

export function renderRoutineBasketPlannerMarkup(selectedEntries, intent = "routine") {
  if (!selectedEntries.length) return "";

  const fallbackPayload = buildLocalBasketPlanPayload(selectedEntries, intent);
  const payload = getActiveBasketPayload(intent, selectedEntries, fallbackPayload);
  const mixedBasket = payload?.mixedBasket || null;
  const singleRetailerBasket = payload?.oneStoreBasket || null;
  if (!mixedBasket && !singleRetailerBasket && !payload?.oneStoreStatus) return "";

  return `
    <section class="routine-basket-planner">
      <span class="routine-summary-label">${intent === "routine" ? "Buy this routine" : "Buy core shortlist"}</span>
      ${renderBasketDegradedNoteMarkup(intent)}
      <div class="routine-basket-grid">
        ${renderRoutineBasketCardMarkup(mixedBasket)}
        ${
          singleRetailerBasket
            ? renderRoutineBasketCardMarkup(singleRetailerBasket)
            : renderRoutineBasketEmptyMarkup()
        }
      </div>
    </section>
  `;
}

export function getCurrentRoutineOneStoreRetailer() {
  return state.conversion.baskets.routine.payload?.oneStoreBasket?.retailer || null;
}

export function positionRetailerPopover(popover) {
  const panel = popover?.querySelector(".compare-popover-panel");
  if (!popover || !panel || !popover.open) return;
  const triggerRect = popover.getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const { top: topInset, bottom: bottomInset } = getRetailerPopoverViewportInsets();
  const spaceBelow = window.innerHeight - bottomInset - triggerRect.bottom;
  const spaceAbove = triggerRect.top - topInset;
  const spaceRight = window.innerWidth - triggerRect.left;
  const spaceLeft = triggerRect.right;
  const vertical = spaceBelow < panelRect.height + 24 && spaceAbove > spaceBelow ? "top" : "bottom";
  const horizontal = spaceRight < panelRect.width + 24 && spaceLeft > spaceRight ? "right" : "left";
  popover.dataset.placement = `${vertical}-${horizontal}`;
}

export function getRetailerPopoverViewportInsets() {
  let topInset = 16;
  const bottomInset = 16;
  [workspaceSupernavShell, controlsPanel, state.ui.workMode ? decisionStrip : null].forEach((element) => {
    if (!element || element.hidden) return;
    const styles = window.getComputedStyle(element);
    if (!["sticky", "fixed"].includes(styles.position)) return;
    const rect = element.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    if (rect.top <= topInset + 4) {
      topInset = Math.max(topInset, rect.bottom + 12);
    }
  });
  return { top: topInset, bottom: bottomInset };
}

export function ensureRetailerPopoverInView(popover) {
  const panel = popover?.querySelector(".compare-popover-panel");
  if (!popover || !panel || !popover.open) return;
  const { top, bottom } = getRetailerPopoverViewportInsets();
  const panelRect = panel.getBoundingClientRect();
  const availableHeight = Math.max(160, window.innerHeight - top - bottom);
  const isLongPanel = panelRect.height > availableHeight;
  let scrollDelta = 0;

  if (isLongPanel) {
    scrollDelta = panelRect.top - top;
  } else if (panelRect.top < top) {
    scrollDelta = panelRect.top - top;
  } else if (panelRect.bottom > window.innerHeight - bottom) {
    scrollDelta = panelRect.bottom - (window.innerHeight - bottom);
  }

  if (Math.abs(scrollDelta) > 1) {
    window.scrollBy({ top: scrollDelta, left: 0, behavior: "auto" });
  }
}

export function syncRetailerPopoverLayout(popover = null) {
  const activePopover = popover || productGrid?.querySelector(".compare-popover[open]");
  if (!activePopover || !activePopover.open) return;
  positionRetailerPopover(activePopover);
  requestAnimationFrame(() => {
    ensureRetailerPopoverInView(activePopover);
    requestAnimationFrame(() => {
      positionRetailerPopover(activePopover);
    });
  });
}

export function positionOpenRetailerPopover() {
  const popover = productGrid?.querySelector(".compare-popover[open]");
  if (!popover) return;
  syncRetailerPopoverLayout(popover);
}

export function syncRetailerPopoverChromeInterlocks() {
  document.body.classList.toggle("compare-popover-active", Boolean(state.ui.openRetailerCompareId));
}

export function syncComparePopoverA11y(popover) {
  const toggle = popover?.querySelector(".compare-toggle");
  if (!toggle) return;
  toggle.setAttribute("aria-expanded", String(Boolean(popover.open)));
}

export function focusCompareToggleForProduct(productId) {
  const target = Array.from(productGrid?.querySelectorAll(".compare-popover") || []).find(
    (entry) => entry.dataset.productId === productId,
  );
  target?.querySelector(".compare-toggle")?.focus({ preventScroll: true });
}

export function restoreCompareToggleFocus(productId) {
  if (!productId) return;
  let attemptsRemaining = 20;
  const focusWhenReady = () => {
    if (productGrid?.closest("[hidden]")) return;
    const target = Array.from(productGrid?.querySelectorAll(".compare-popover") || []).find(
      (entry) => entry.dataset.productId === productId,
    );
    const toggle = target?.querySelector(".compare-toggle");
    const activeElement = document.activeElement;
    const focusIsUnclaimed =
      !activeElement ||
      activeElement === document.body ||
      activeElement === document.documentElement ||
      activeElement === toggle ||
      target?.contains(activeElement);
    if (toggle) {
      if (focusIsUnclaimed) {
        toggle.focus({ preventScroll: true });
      } else {
        return;
      }
    }
    attemptsRemaining -= 1;
    if (attemptsRemaining > 0) {
      window.setTimeout(() => {
        requestAnimationFrame(focusWhenReady);
      }, 150);
    }
  };
  requestAnimationFrame(focusWhenReady);
}

export function requestRetailerCompareRender(productId) {
  if (
    productId &&
    state.ui.activeShellView === "catalog" &&
    state.ui.openRetailerCompareId === productId
  ) {
    const activePopover = productGrid?.querySelector(".compare-popover[open]");
    if (activePopover?.dataset.productId === productId) {
      renderProducts();
      requestAnimationFrame(positionOpenRetailerPopover);
      return;
    }
  }
  renderProducts();
}

export function requestRetailerCompareRenderAfterClose() {
  if (state.ui.activeShellView !== "catalog") {
    renderProducts();
    return;
  }
  requestAnimationFrame(() => {
    if (!state.ui.openRetailerCompareId) {
      renderProducts();
    }
  });
}

export function closeOpenRetailerPopover(popover = null, { restoreFocus = true } = {}) {
  const activePopover = popover || productGrid?.querySelector(".compare-popover[open]");
  const productId = activePopover?.dataset.productId || state.ui.openRetailerCompareId || null;
  state.ui.openRetailerCompareId = null;
  syncRetailerPopoverChromeInterlocks();
  if (activePopover) {
    activePopover.open = false;
    delete activePopover.dataset.placement;
    syncComparePopoverA11y(activePopover);
  }
  if (!activePopover) {
    requestRetailerCompareRenderAfterClose();
  }
  if (restoreFocus && productId && !productGrid?.closest("[hidden]")) {
    restoreCompareToggleFocus(productId);
  }
}

export function getCatalogVerdictLabel(product, { spotlight, primaryMerchBadge, retailerComparison }) {
  const shortlistStatus = getShortlistStatus(product.id);
  const decisionReady = isCatalogDecisionReady();
  if (shortlistStatus === "core") return decisionReady ? "Current champion" : "Saved pick";
  if (shortlistStatus === "optional") return decisionReady ? "Current backup" : "Saved backup";
  const badgeLabel = String(primaryMerchBadge?.label || "").toLowerCase();
  if (product.id === spotlight?.id) return getCatalogLeadLanguage(decisionReady).spotlightLabel;
  if (badgeLabel.includes("irritation") || badgeLabel.includes("sensitivity")) return "Safer for sensitivity";
  if (badgeLabel.includes("review")) return "Higher review confidence";
  if (badgeLabel.includes("spend") || badgeLabel.includes("value")) return "Better value";
  if (retailerComparison?.hasExactGraph && retailerComparison?.comparisonMode === "closest-equivalent") return "Retailer equivalents";
  if (retailerComparison?.hasExactGraph) return "Retailer check strong";
  return primaryMerchBadge?.label || "Should stay on the shortlist";
}

export function getCatalogCatchText(product, { activeLane, warnings, retailerComparison }) {
  if (warnings.length) return warnings[0];
  if (state.userProfile.budget === "budget" && typeof product.price === "number" && product.price > 70) {
    return "less aligned to budget";
  }
  if (state.userProfile.sensitivity === "high" && getStrongActiveCount(product) >= 2) {
    return "stronger actives";
  }
  if (activeLane?.primaryConcern && !product.concerns.includes(activeLane.primaryConcern)) {
    return "limited concern match";
  }
  if (retailerComparison?.comparisonMode === "closest-equivalent") {
    return "closest equivalent only";
  }
  if (getRetailerComparison(product).length && !retailerComparison?.hasExactGraph) {
    return "closest equivalent only";
  }
  return "caution level stays moderate";
}

export function getCatalogVerdictTone(verdictLabel, catchText = "") {
  const normalizedVerdict = String(verdictLabel || "").toLowerCase();
  const normalizedCatch = String(catchText || "").toLowerCase();
  if (normalizedCatch && normalizedCatch !== "caution level stays moderate") {
    return "warning";
  }
  if (normalizedVerdict.includes("safer for sensitivity")) return "safety";
  if (normalizedVerdict.includes("better value")) return "value";
  return "trust";
}

export function ensureSentence(value, fallback = "Strong fit right now.") {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function getCatalogSignalToneFromVerdict(verdictTone, primaryMerchBadge = null) {
  if (primaryMerchBadge?.tone) {
    return primaryMerchBadge.tone;
  }
  if (verdictTone === "safety") return "cool";
  if (verdictTone === "value") return "sand";
  if (verdictTone === "warning") return "warm";
  return "sage";
}

export function getCatalogSignalBadgeLabel(verdictTone, primaryMerchBadge = null) {
  const badgeLabel = String(primaryMerchBadge?.label || "").toLowerCase();
  if (badgeLabel.includes("review")) return "Trust";
  if (badgeLabel.includes("spend") || badgeLabel.includes("value") || badgeLabel.includes("under $")) return "Value";
  if (badgeLabel.includes("irritation") || badgeLabel.includes("sensitive")) return "Safety";
  if (badgeLabel.includes("barrier")) return "Barrier";
  if (badgeLabel.includes("vitamin c")) return "Brighten";
  if (badgeLabel.includes("spf")) return "SPF";
  if (badgeLabel.includes("retailer")) return "Retailer";

  const tone = getCatalogSignalToneFromVerdict(verdictTone, primaryMerchBadge);
  if (tone === "sand") return "Value";
  if (tone === "cool") return "Safety";
  if (tone === "warm") return "Watch";
  if (tone === "neutral") return "Retailer";
  return "Trust";
}

export function renderCatalogComparisonSnapshotRow(snapshotRow, snapshot) {
  if (!snapshotRow) return;
  const entries = Array.isArray(snapshot) ? snapshot.filter((entry) => entry?.value) : [];
  snapshotRow.hidden = entries.length === 0;
  snapshotRow.innerHTML = entries
    .map(
      (entry) => `
        <span class="product-snapshot-item product-snapshot-${escapeHtml(entry.key || "item")} product-snapshot-tone-${escapeHtml(entry.tone || "neutral")}" data-snapshot-key="${escapeHtml(entry.key || "item")}">
          <span>${escapeHtml(entry.label || "")}</span>
          <strong>${escapeHtml(entry.value || "")}</strong>
        </span>
      `,
    )
    .join("");
}

export function buildCatalogComparisonSnapshotForCard(product, options = {}) {
  const retailerComparison = options.retailerComparison || { hasExactGraph: false, matchKind: "none", markup: "" };
  const warnings = Array.isArray(options.warnings)
    ? options.warnings
    : getProductConflictWarnings(product, { routineTime: state.routineTime });
  const merchBadges = Array.isArray(options.merchBadges)
    ? options.merchBadges
    : getCatalogMerchBadgeEntries(product, { hasRetailerGraph: retailerComparison.hasExactGraph });
  const primaryMerchBadge = options.primaryMerchBadge || merchBadges[0] || null;
  const compactExplanation =
    options.compactExplanation || explainCatalogChoiceCompact(product, { hasRetailerGraph: retailerComparison.hasExactGraph });
  const catchText =
    options.catchText ||
    getCatalogCatchText(product, {
      activeLane: options.activeLane || getActiveBrowseLane(),
      warnings,
      retailerComparison,
    });
  return getCatalogComparisonSnapshot(product, {
    retailerComparison,
    merchBadges,
    primaryMerchBadge,
    compactExplanation,
    catchText,
    warnings,
    categoryLabel: options.categoryLabel || getCatalogProductCategoryLabel(product),
    focusLabel: options.focusLabel || getCatalogProductFocusLabel(product),
  });
}

export function getCatalogDecisionSentence(product, explanation, verdictLabel) {
  const sentence = ensureSentence(explanation);
  if (!verdictLabel) return sentence;
  const decisionReady = isCatalogDecisionReady();
  if (getShortlistStatus(product.id) === "core") {
    return decisionReady
      ? ensureSentence("Current champion. Pressure-test one backup before you buy.")
      : ensureSentence("Saved pick. Choose a product type, concern, ingredient, lane, or specific search before ranking it.");
  }
  if (getShortlistStatus(product.id) === "optional") {
    return decisionReady
      ? ensureSentence("Current backup. Keep it only if it can still beat the holds on fit, caution, or price.")
      : ensureSentence("Saved backup. Choose a focus before comparing saved picks.");
  }
  if (sentence.toLowerCase().includes(String(verdictLabel).toLowerCase())) {
    return sentence;
  }
  if (product.id && state.favoriteIds.includes(product.id) && verdictLabel === "Current leader") {
    return ensureSentence("Already saved as the current decision leader");
  }
  if (product.id && state.favoriteIds.includes(product.id) && verdictLabel === "Starting point") {
    return ensureSentence("Already saved as an exploratory starting point");
  }
  return sentence;
}

export function getTrustTone(label) {
  const normalized = String(label || "").toLowerCase();
  if (normalized === "ingredient-led fit") return "fit";
  if (normalized === "review-supported") return "review";
  if (
    normalized === "retailer-confirmed" ||
    normalized === "retailer-confirmed match" ||
    normalized === "recently verified" ||
    normalized === "back in stock" ||
    normalized === "price dropped" ||
    normalized === "lowest tracked price"
  ) {
    return "confirmed";
  }
  if (normalized === "lower-confidence match" || normalized === "lower-confidence") return "low-confidence";
  return "low-confidence";
}

export function getCatalogBiasLabel() {
  const rankingContext = getCatalogRankingContext();
  const decisionMode = getCatalogDecisionMode(rankingContext);
  if (decisionMode === CATALOG_DECISION_MODES.BROAD_NEUTRAL) return "representative shelf scan";
  if (decisionMode === CATALOG_DECISION_MODES.SOFT_PERSONALIZED_BROAD) {
    if (rankingContext.type === "search") return "search-ranked starting points";
    return "profile-biased starting points";
  }
  const activeConcern = rankingContext.primaryConcern || rankingContext.concern;
  if (activeConcern) return `ranking biased for ${titleCase(activeConcern).toLowerCase()}`;
  if (!rankingContext.isNeutral && rankingContext.sourceLabel) {
    return `ranking biased for ${String(rankingContext.sourceLabel).toLowerCase()}`;
  }
  if (state.userProfile.sensitivity === "high") return "ranking biased for sensitivity";
  if (state.userProfile.activesComfort === "low") return "ranking biased for caution";
  if (state.userProfile.budget === "budget") return "ranking biased for lower spend";
  return "focused ranking context";
}

export function getCatalogProductCategoryLabel(product) {
  const category = String(product?.category || "").trim();
  if (!category) return null;
  return titleCase(category.replace(/[-_]+/g, " "));
}

export function getProductImageFallbackLabel(product) {
  const source = String(product?.brand || product?.name || "").trim();
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "Image";
}

export function getCatalogProductFocusLabel(product) {
  if (!product) return null;
  const rankingContext = getCatalogRankingContext();
  const evidence = getCatalogCaseEvidence(product, rankingContext);
  const activeConcern = rankingContext.primaryConcern || rankingContext.concern;
  if (activeConcern && Array.isArray(product.concerns) && product.concerns.includes(activeConcern)) {
    return titleCase(String(activeConcern).replace(/[-_]+/g, " "));
  }
  const matchedConcern = (evidence.directConcernEvidence || []).find((concern) => product.concerns.includes(concern));
  if (matchedConcern) {
    return titleCase(String(matchedConcern).replace(/[-_]+/g, " "));
  }
  const matchedIngredient = (evidence.ingredientEvidence || []).find((ingredient) => product.ingredients.includes(ingredient));
  if (matchedIngredient) {
    return titleCase(matchedIngredient);
  }
  if (evidence.supportEligible && !evidence.leadEligible) {
    return "Support pick";
  }
  if (state.ingredient !== "all" && Array.isArray(product.ingredients) && product.ingredients.includes(state.ingredient)) {
    return titleCase(state.ingredient);
  }
  if (Array.isArray(product.concerns) && product.concerns.length) {
    return titleCase(String(product.concerns[0]).replace(/[-_]+/g, " "));
  }
  if (Array.isArray(product.ingredients) && product.ingredients.length) {
    return titleCase(String(product.ingredients[0]).replace(/[-_]+/g, " "));
  }
  return null;
}

export function renderWorkspacePanels(renderContext = null) {
  renderActiveWorkspaceSurface(renderContext);
}

export function hydrateProductReasoning(reasoningElement) {
  if (!reasoningElement || reasoningElement.dataset.hydrated === "true") return;
  const product = getProductById(reasoningElement.dataset.productId);
  if (!product) return;

  const activeLane = getActiveBrowseLane();
  const spotlight = getCatalogRenderContext().leadProduct;
  const retailerComparison = getRetailerComparisonRenderState(product);
  const categoryLabel = getCatalogProductCategoryLabel(product);
  const focusLabel = getCatalogProductFocusLabel(product);
  const contextSignalMarkup = renderCatalogContextSignalMarkup(product);
  const ingredientInsight =
    shouldShowCatalogIngredientInsight(product) && !contextSignalMarkup && !retailerComparison.hasExactGraph
      ? renderIngredientInsightMarkup(product, true)
      : "";
  const warnings = getProductConflictWarnings(product, { routineTime: state.routineTime });
  const conflictMarkup = renderConflictMarkup(warnings, true);
  const signalProfile = getCatalogCardSignalProfile(product, {
    hasIngredientInsight: Boolean(ingredientInsight),
    hasConflict: Boolean(conflictMarkup),
    hasRetailerGraph: retailerComparison.hasExactGraph,
    hasContextSignal: Boolean(contextSignalMarkup),
  });
  const supportDetailMarkup = signalProfile.weakData
    ? renderCatalogSupportDetailMarkup(product, {
        compact: true,
      })
    : "";
  const compactExplanation = explainCatalogChoiceCompact(product, {
    hasRetailerGraph: retailerComparison.hasExactGraph,
  });
  const expandedExplanation = ensureSentence(
    explainProductChoice(product, {
      type: product.id === spotlight?.id ? "overall-pick" : "spotlight",
      concern: getCatalogRankingContext().primaryConcern || getCatalogRankingContext().concern || state.routineConcern,
    }).replace(/^Why this was picked:\s*/i, ""),
    compactExplanation,
  );
  const catchText = getCatalogCatchText(product, { activeLane, warnings, retailerComparison });
  const supportBlocks = [contextSignalMarkup, ingredientInsight, supportDetailMarkup].filter(Boolean);

  const productProofGrid = reasoningElement.querySelector(".product-proof-grid");
  const productDecisionShell = reasoningElement.querySelector(".product-decision-shell");
  const whyPicked = reasoningElement.querySelector(".why-picked");
  const productCatch = reasoningElement.querySelector(".product-catch");
  const productConflicts = reasoningElement.querySelector(".product-conflicts");
  const productSupportStack = reasoningElement.querySelector(".product-support-stack");

  if (productProofGrid) {
    productProofGrid.hidden = false;
    productProofGrid.innerHTML = renderCatalogProofGridMarkup(product, {
      focusLabel,
      categoryLabel,
      retailerComparison,
    });
  }

  if (productDecisionShell) {
    const quickStatusMarkup = renderCatalogQuickStatusMarkup(product);
    productDecisionShell.hidden = !quickStatusMarkup;
    productDecisionShell.innerHTML = quickStatusMarkup;
  }

  if (whyPicked) {
    whyPicked.hidden = !expandedExplanation;
    whyPicked.innerHTML = expandedExplanation ? `<strong>Why it fits</strong><span>${escapeHtml(expandedExplanation)}</span>` : "";
  }

  if (productCatch) {
    productCatch.hidden = catchText === "caution level stays moderate";
    productCatch.textContent = catchText === "caution level stays moderate" ? "" : `Watch: ${catchText}`;
  }

  if (productConflicts) {
    productConflicts.hidden = !conflictMarkup;
    productConflicts.innerHTML = conflictMarkup || "";
  }

  if (productSupportStack) {
    productSupportStack.hidden = supportBlocks.length === 0;
    productSupportStack.innerHTML = supportBlocks.join("");
  }

  reasoningElement.dataset.hydrated = "true";
}

export function isCatalogHydrationPending() {
  const hydration = state.live?.catalog || {};
  if (hydration.error) return false;
  return (
    Boolean(hydration.loading) ||
    hydration.phase === "loading" ||
    hydration.phase === "partial" ||
    Boolean(hydration.fullRequestInFlight)
  );
}

export function shouldHoldCatalogEmptyState(filtered) {
  if (filtered.length) return false;
  if (isFocusedCatalogFilterLoading()) return true;
  if (isFocusedCatalogFilterSettled()) return false;
  return isCatalogHydrationPending();
}

export function getCatalogHydrationTotalLabel() {
  const total = Number(state.live?.catalog?.total);
  return Number.isFinite(total) && total > 0 ? total.toLocaleString() : null;
}

export function getCatalogSearchMatchReason(searchText = state.search, rankingContext = getCatalogRankingContext()) {
  if (!String(searchText || "").trim()) return "catalog relevance";
  const intent = rankingContext?.searchIntent || {};
  const reasons = [];
  if (Array.isArray(intent.ingredients) && intent.ingredients.length) reasons.push("ingredient");
  if (
    (Array.isArray(intent.productTypes) && intent.productTypes.length) ||
    (Array.isArray(intent.compatibleProductTypes) && intent.compatibleProductTypes.length)
  ) {
    reasons.push("product type");
  }
  if (Array.isArray(intent.concerns) && intent.concerns.length) reasons.push("concern");
  return reasons.length ? `${reasons.join(" + ")} match` : "text match";
}

export function renderCatalogSearchSettlingState(searchText = state.search) {
  const query = String(searchText || "").trim();
  if (!query || !resultsTitle) return;
  const escapedQuery = escapeHtml(query);
  resultsTitle.textContent = `Searching "${query}"`;
  if (resultsCaption) {
    resultsCaption.textContent = `Matching "${query}" and sorting by search relevance. Results may still settle.`;
  }
  if (resultsStateLine) {
    resultsStateLine.innerHTML = `
      <span>matching "${escapedQuery}"</span>
      <span>sorted by search relevance</span>
      <span>results settling</span>
    `;
  }
  productGrid?.setAttribute("aria-busy", "true");
}

export function renderCatalogLoadingState({ activeLane = null } = {}) {
  const loadingMarketSnapshot = getMarketViewSnapshot([]);
  productGrid.replaceChildren();
  productGrid.setAttribute("aria-busy", "true");
  paginationBar.replaceChildren();
  syncCatalogFilterDisclosure();
  renderHeroMerchGrid();
  renderBrowseLanes();
  renderCatalogCommandBar({ filteredCount: 0, totalPages: 1, activeLane });
  renderActiveFilters({ filteredCount: null, activeLane, totalPages: null });
  renderDecisionStrip([], null, null);
  clearResidualShadowDemo();
  renderResultsCasebar({ activeLane, spotlight: null, marketSnapshot: loadingMarketSnapshot, ratedCount: 0, totalPages: 1 });

  const totalLabel = getCatalogHydrationTotalLabel();
  const hasFilters = getActiveCatalogFilterCount() > 0;
  resultsTitle.textContent = hasFilters ? "Loading matching products..." : "Loading demo catalog...";
  resultsCaption.textContent = hasFilters
    ? "Fixture results are still loading for this case."
    : "The first demo catalog page is being prepared while the full fixture loads in the background.";
  if (resultsStateLine) {
    resultsStateLine.innerHTML = `
      <span>demo catalog loading</span>
      <span>${totalLabel ? `${totalLabel} total products` : "catalog total pending"}</span>
      <span>waiting for fixture matches</span>
    `;
  }

  const skeletonCount = window.matchMedia?.("(max-width: 720px)").matches ? 3 : 6;
  const loadingState = document.createElement("div");
  loadingState.className = "catalog-loading-state";
  loadingState.setAttribute("role", "status");
  loadingState.setAttribute("aria-live", "polite");
  loadingState.innerHTML = Array.from({ length: skeletonCount }, () => `
    <article class="catalog-skeleton-card" aria-hidden="true">
      <span class="catalog-skeleton-media"></span>
      <span class="catalog-skeleton-line catalog-skeleton-line-short"></span>
      <span class="catalog-skeleton-line"></span>
      <span class="catalog-skeleton-line catalog-skeleton-line-mid"></span>
      <span class="catalog-skeleton-button"></span>
    </article>
  `).join("");
  productGrid.replaceChildren(loadingState);
  syncCatalogResultsReadyState(false);
  renderDecisionWorkspaceSummary({
    filtered: [],
    marketSnapshot: loadingMarketSnapshot,
    leadProduct: null,
  });
  syncCatalogStickyOffsets();
}

export function renderProducts({ force = false } = {}) {
  if (catalogSearchRenderTimer) {
    window.clearTimeout(catalogSearchRenderTimer);
    catalogSearchRenderTimer = null;
  }
  const renderSequence = ++catalogProductRenderSequence;
  requestFocusedCatalogFilterSlice();
  const renderContext = getCatalogRenderContext({ mutableFiltered: true });
  if (!force && state.ui.activeShellView !== "catalog") {
    syncCatalogResultsReadyState(false);
    if (state.ui.activeShellView === "overview") {
      refreshOverviewSurface(renderContext.filtered, { fetchRemote: true, renderHidden: false });
    } else if (state.ui.activeShellView === "workspace") {
      renderActiveWorkspaceSurface(renderContext);
    } else if (state.ui.activeShellView === "shortlist") {
      renderFavorites({ force: true });
    }
    return;
  }
  const filtered = renderContext.filtered;
  const isCompactDensity = state.ui.catalogDensity === "compact";
  const activeLane = getActiveBrowseLane();
  if (shouldHoldCatalogEmptyState(filtered)) {
    renderCatalogLoadingState({ activeLane });
    return;
  }
  const marketSnapshot = renderContext.marketSnapshot;
  const ratedCount = filtered.filter(
    (product) => typeof product.rating === "number" && typeof product.reviewCount === "number",
  ).length;
  const spotlight = renderContext.leadProduct;
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const startIndex = (state.page - 1) * state.pageSize;
  const paginated = filtered.slice(startIndex, startIndex + state.pageSize);
  productGrid.replaceChildren();
  productGrid.toggleAttribute("aria-busy", isCatalogHydrationPending());
  syncCatalogFilterDisclosure();
  renderHeroMerchGrid();
  renderBrowseLanes();
  renderCatalogCommandBar({
    filteredCount: filtered.length,
    totalPages,
    activeLane,
    spotlight,
    marketSnapshot,
  });
  renderActiveFilters({ filteredCount: filtered.length, activeLane, totalPages });
  renderDecisionStrip(filtered, spotlight, marketSnapshot);
  renderCatalogShortlistRail(renderContext);
  const catalogHydrating = isCatalogHydrationPending();
  const totalLabel = getCatalogHydrationTotalLabel();
  const hasActiveFilters = getActiveCatalogFilterCount() > 0;
  const rankingContext = getCatalogRankingContext();
  const decisionReady = isCatalogDecisionReady(rankingContext);
  renderResidualShadowDemo({
    products: filtered,
    catalogContext: rankingContext,
    category: state.category,
    ingredient: state.ingredient,
    retailer: state.retailer,
    sort: state.sort,
    host: decisionStrip,
  });
  const searchText = String(state.search || "").trim();
  const hasSearch = Boolean(searchText);
  const searchMatchReason = hasSearch ? getCatalogSearchMatchReason(searchText, rankingContext) : "";
  const isMobileCatalog = isMobileCatalogViewport();
  const filteredCountLabel = filtered.length.toLocaleString();
  if (isMobileCatalog && hasSearch && !decisionReady) {
    resultsTitle.textContent = `${filteredCountLabel} loose search matches`;
  } else if (isMobileCatalog && hasSearch) {
    resultsTitle.textContent = `${filteredCountLabel} for "${searchText}"`;
  } else if (isMobileCatalog && catalogHydrating && !hasActiveFilters && totalLabel) {
    resultsTitle.textContent = `${totalLabel} products loading`;
  } else if (isMobileCatalog && catalogHydrating) {
    resultsTitle.textContent = `${filteredCountLabel} ready`;
  } else if (isMobileCatalog) {
    resultsTitle.textContent = `${filteredCountLabel} ${decisionReady ? "matches" : "products"}`;
  } else if (hasSearch && !decisionReady) {
    resultsTitle.textContent = `${filtered.length} loose match${filtered.length === 1 ? "" : "es"} for "${searchText}"`;
  } else if (hasSearch && catalogHydrating) {
    resultsTitle.textContent = `${filtered.length} search match${filtered.length === 1 ? "" : "es"} ready so far`;
  } else if (hasSearch) {
    resultsTitle.textContent = `${filtered.length} match${filtered.length === 1 ? "" : "es"} for "${searchText}"`;
  } else if (catalogHydrating && !hasActiveFilters && totalLabel) {
    resultsTitle.textContent = `${totalLabel} products loading`;
  } else if (catalogHydrating) {
    resultsTitle.textContent = `${filtered.length} matching product${filtered.length === 1 ? "" : "s"} ready so far`;
  } else if (!decisionReady) {
    resultsTitle.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} to explore`;
  } else {
    resultsTitle.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"} in the current case`;
  }
  const familyCollapseNote =
    state.page === 1 && state.sort === "relevance" && !String(state.search || "").trim()
      ? decisionReady
        ? " Page 1 keeps one lead per product family."
        : " Page 1 keeps one starting point per product family."
      : "";
  const nextStepLabel = titleCase(state.category === "all" ? spotlight?.category || "core care" : state.category);
  const contextLabel = !decisionReady
    ? "Cross-store exploration"
    : rankingContext.isNeutral
    ? (state.profile === "all" ? "Cross-store lens" : `${getProfileLabel()} lens`)
    : rankingContext.sourceLabel || rankingContext.label || rankingContext.primaryConcern || rankingContext.concern || "current case";
  const profileLensLabel = `${contextLabel}.`;
  renderResultsCasebar({ activeLane, spotlight, marketSnapshot, ratedCount, totalPages });
  if (resultsStateLine) {
    const bestForLabel = activeLane?.label || titleCase(rankingContext.sourceLabel || rankingContext.primaryConcern || rankingContext.concern || nextStepLabel);
    resultsStateLine.innerHTML = hasSearch && !decisionReady
      ? `
        <span>${filtered.length} loose match${filtered.length === 1 ? "" : "es"} for "${escapeHtml(searchText)}"</span>
        <span>choose product type, concern, ingredient, lane, or stronger search</span>
        <span>${escapeHtml(getCatalogBiasLabel())}</span>
      `
      : hasSearch
      ? `
        <span>${filtered.length} match${filtered.length === 1 ? "" : "es"} for "${escapeHtml(searchText)}"</span>
        <span>${escapeHtml(searchMatchReason)}</span>
        <span>${catalogHydrating ? "results settling" : "results settled"}</span>
      `
      : catalogHydrating
      ? `
        <span>${filtered.length} ready now</span>
        <span>${totalLabel ? `${totalLabel} total products` : "full catalog loading"}</span>
        <span>${escapeHtml(getCatalogBiasLabel())}</span>
      `
      : !decisionReady
      ? `
        <span>${filtered.length} matches</span>
        <span>explore by type, concern, ingredient, lane, or specific search</span>
        <span>${escapeHtml(getCatalogBiasLabel())}</span>
      `
      : `
        <span>${filtered.length} matches</span>
        <span>best for ${escapeHtml(bestForLabel.toLowerCase())}</span>
        <span>${escapeHtml(getCatalogBiasLabel())}</span>
      `;
  }
  if (hasSearch && !decisionReady) {
    resultsCaption.textContent = catalogHydrating
      ? `Loose search matches "${searchText}" by ${searchMatchReason}; treat these as exploratory while the full catalog is still settling.${familyCollapseNote}`
      : `Loose search matches "${searchText}" by ${searchMatchReason}; choose an ingredient, concern, product type, or clearer phrase before ranking with confidence.${familyCollapseNote}`;
  } else if (hasSearch) {
    resultsCaption.textContent = catalogHydrating
      ? `Search matches "${searchText}" by ${searchMatchReason}; sorted by search relevance while the full catalog is still settling.${familyCollapseNote}`
      : `Search matches "${searchText}" by ${searchMatchReason}; sorted by search relevance.${familyCollapseNote}`;
  } else if (activeLane) {
    resultsCaption.textContent = catalogHydrating
      ? `${profileLensLabel} ${activeLane.label} is active. The full demo catalog is still loading.${familyCollapseNote}`
      : `${profileLensLabel} ${activeLane.label} is active. Start with ${nextStepLabel.toLowerCase()}.${familyCollapseNote}`;
  } else if (!decisionReady) {
    resultsCaption.textContent = catalogHydrating
      ? `${profileLensLabel} First fixture products are ready while the full catalog keeps loading.${familyCollapseNote}`
      : `${profileLensLabel} Representative starting points are ready; choose a product type, concern, ingredient, or lane before ranking with confidence.${familyCollapseNote}`;
  } else if (state.concern === "all" && rankingContext.isNeutral) {
    resultsCaption.textContent = catalogHydrating
      ? `${profileLensLabel} First fixture products are ready while the full catalog keeps loading.${familyCollapseNote}`
      : `${profileLensLabel} Start with ${nextStepLabel.toLowerCase()}.${familyCollapseNote}`;
  } else if (state.concern === "all") {
    resultsCaption.textContent = catalogHydrating
      ? `${profileLensLabel} The full demo catalog is still loading for this case.${familyCollapseNote}`
      : `${profileLensLabel} Start with ${nextStepLabel.toLowerCase()}.${familyCollapseNote}`;
  } else {
    resultsCaption.textContent = catalogHydrating
      ? `${profileLensLabel} Focused on ${titleCase(state.concern).toLowerCase()}. The full demo catalog is still loading.${familyCollapseNote}`
      : `${profileLensLabel} Focused on ${titleCase(state.concern).toLowerCase()}. Start with ${nextStepLabel.toLowerCase()}.${familyCollapseNote}`;
  }

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state catalog-empty-state";
    const hasFilters = getActiveCatalogFilterCount() > 0;
    empty.innerHTML = `
      <strong>${hasSearch ? "No products match this search." : "No products match this case."}</strong>
      <span>${hasSearch ? "Try a broader search or clear one filter to reopen the catalog." : hasFilters ? "Clear the current case or remove one filter to reopen the catalog." : "Try a broader catalog lens to rebuild the result set."}</span>
      ${hasFilters ? `<button class="panel-action-button" type="button" data-empty-action="clear-case">Clear case</button>` : ""}
    `;
    productGrid.replaceChildren(empty);
    syncCatalogResultsReadyState(false);
    paginationBar.replaceChildren();
    renderDecisionWorkspaceSummary({
      ...renderContext,
      filtered,
      leadProduct: spotlight,
    });
    return;
  }

  const comparisonSummaryByProductId = new Map(
    paginated.map((product) => [product.id, getCatalogCardComparisonSummaryState(product)]),
  );
  const explanationByProductId = buildCatalogChoiceMap(
    paginated,
    new Map(
      paginated.map((product) => [
        product.id,
        { hasRetailerGraph: Boolean(comparisonSummaryByProductId.get(product.id)?.hasExactGraph) },
      ]),
    ),
  );
  const snapshotContextByProductId = new Map();

  const cardsFragment = document.createDocumentFragment();
  paginated.forEach((product, index) => {
    const fragment = template.content.cloneNode(true);
    const productCard = fragment.querySelector(".product-card");
    const media = fragment.querySelector(".product-media");
    const image = fragment.querySelector(".product-image");
    const imageFallback = fragment.querySelector(".product-image-fallback");
    const flagRow = fragment.querySelector(".product-flag-row");
    const signalBadge = fragment.querySelector(".product-signal-badge");
    const productReasoning = fragment.querySelector(".product-reasoning");
    const productReasoningToggle = fragment.querySelector(".product-reasoning-toggle");
    const productReasoningBody = fragment.querySelector(".product-reasoning-body");
    const cardActions = fragment.querySelector(".card-actions");
    const productDomToken = getStableDomToken(product.id);
    productCard.dataset.productId = product.id;
    const isSaved = state.favoriteIds.includes(product.id);
    productCard.classList.toggle("is-saved", isSaved);
    productCard.classList.toggle("is-catalog-find-target", state.ui.catalogFindTargetId === product.id);
    if (state.ui.catalogFindTargetId === product.id) {
      productCard.setAttribute("tabindex", "-1");
    }
    fragment.querySelector(".retailer-badge").textContent = product.retailer;
    fragment.querySelector(".price").textContent = money(product.price);
    fragment.querySelector(".brand").textContent = product.brand;
    fragment.querySelector(".name").textContent = product.name;
    const ratingLine = fragment.querySelector(".product-rating");
    const productVerdict = fragment.querySelector(".product-verdict");
    const productMobileCatch = fragment.querySelector(".product-mobile-catch");
    const retailerCompare = fragment.querySelector(".retailer-compare");
    const productSnapshotRow = fragment.querySelector(".product-snapshot-row");
    const factRow = fragment.querySelector(".product-fact-row");
    const categoryFact = fragment.querySelector(".product-category-fact");
    const focusFact = fragment.querySelector(".product-focus-fact");
    const productProofGrid = fragment.querySelector(".product-proof-grid");
    const productDecisionShell = fragment.querySelector(".product-decision-shell");
    const retailerComparison = comparisonSummaryByProductId.get(product.id) || { hasExactGraph: false, matchKind: "none" };
    image.alt = `${product.brand} ${product.name}`;
    if (imageFallback) {
      imageFallback.textContent = getProductImageFallbackLabel(product);
    }
    if (product.image) {
      if (index === 0) {
        image.setAttribute("loading", "eager");
        image.setAttribute("fetchpriority", "high");
      } else {
        image.setAttribute("loading", "lazy");
        image.removeAttribute("fetchpriority");
      }
      media.dataset.imageState = "loading";
      media.classList.remove("product-media-fallback");
      image.addEventListener(
        "load",
        () => {
          media.dataset.imageState = "loaded";
          media.classList.remove("product-media-fallback");
        },
        { once: true },
      );
      image.addEventListener(
        "error",
        () => {
          media.dataset.imageState = "fallback";
          media.classList.add("product-media-fallback");
        },
        { once: true },
      );
      applyProductImage(image, product.image, { container: media });
    } else {
      image.hidden = true;
      media.classList.remove("has-image");
      media.classList.remove("image-loaded");
      media.dataset.imageState = "missing";
      media.classList.add("product-media-fallback");
    }

    const hasRating = typeof product.rating === "number";
    if (hasRating) {
      ratingLine.hidden = false;
      ratingLine.textContent = isCompactDensity ? formatCompactRatingLine(product) : formatRatingLine(product);
    }

    const categoryLabel = getCatalogProductCategoryLabel(product);
    const focusLabel = getCatalogProductFocusLabel(product);
    if (isCompactDensity) {
      const compactFactLabel = focusLabel || categoryLabel || "";
      if (categoryFact) {
        categoryFact.hidden = !compactFactLabel;
        categoryFact.textContent = compactFactLabel;
      }
      if (focusFact) {
        focusFact.hidden = true;
        focusFact.textContent = "";
      }
    } else {
      if (categoryFact) {
        categoryFact.hidden = !categoryLabel;
        categoryFact.textContent = categoryLabel || "";
      }
      if (focusFact) {
        focusFact.hidden = !focusLabel;
        focusFact.textContent = focusLabel || "";
      }
    }
    if (factRow) {
      factRow.hidden = isCompactDensity ? !(focusLabel || categoryLabel) : !categoryLabel && !focusLabel;
    }
    if (productProofGrid) {
      productProofGrid.hidden = true;
      productProofGrid.innerHTML = "";
    }
    if (productDecisionShell) {
      productDecisionShell.hidden = true;
      productDecisionShell.innerHTML = "";
    }

    const warnings = getProductConflictWarnings(product, { routineTime: state.routineTime });
    const contextSignal = getCatalogContextSignal(product);
    const hasContextSignal = Boolean(contextSignal);
    const hasIngredientInsight =
      shouldShowCatalogIngredientInsight(product) && !hasContextSignal && !retailerComparison.hasExactGraph;
    const signalProfile = getCatalogCardSignalProfile(product, {
      hasIngredientInsight,
      hasConflict: warnings.length > 0,
      hasRetailerGraph: retailerComparison.hasExactGraph,
      hasContextSignal: Boolean(contextSignal),
    });
    const merchBadges = getCatalogMerchBadgeEntries(product, { hasRetailerGraph: retailerComparison.hasExactGraph });
    const [primaryMerchBadge] = merchBadges;
    const verdictLabel = getCatalogVerdictLabel(product, { spotlight, primaryMerchBadge, retailerComparison });
    const catchText = getCatalogCatchText(product, { activeLane, warnings, retailerComparison });
    const compactExplanation = explanationByProductId.get(product.id) || explainCatalogChoiceCompact(product, { hasRetailerGraph: retailerComparison.hasExactGraph });
    const snapshotContext = {
      retailerComparison,
      merchBadges,
      primaryMerchBadge,
      compactExplanation,
      catchText,
      warnings,
      activeLane,
      categoryLabel,
      focusLabel,
    };
    snapshotContextByProductId.set(product.id, snapshotContext);
    renderCatalogComparisonSnapshotRow(
      productSnapshotRow,
      buildCatalogComparisonSnapshotForCard(product, {
        retailerComparison,
        ...snapshotContext,
      }),
    );
    productCard.dataset.verdictTone = getCatalogVerdictTone(verdictLabel, catchText);
    if (productVerdict) {
      productVerdict.hidden = false;
      productVerdict.dataset.verdictTone = productCard.dataset.verdictTone;
      productVerdict.textContent = getCatalogDecisionSentence(product, compactExplanation, verdictLabel);
    }
    if (productMobileCatch) {
      const hasMeaningfulCatch = catchText && catchText !== "caution level stays moderate";
      productMobileCatch.hidden = !hasMeaningfulCatch;
      productMobileCatch.textContent = hasMeaningfulCatch ? `Watch: ${catchText}` : "";
    }

    if (signalBadge) {
      signalBadge.hidden = false;
      signalBadge.textContent = getCatalogSignalBadgeLabel(productCard.dataset.verdictTone, primaryMerchBadge);
      signalBadge.className = `product-signal-badge product-signal-${getCatalogSignalToneFromVerdict(productCard.dataset.verdictTone, primaryMerchBadge)}`;
    }
    if (flagRow) {
      flagRow.hidden = true;
      flagRow.innerHTML = "";
    }
    if (retailerCompare) {
      cardActions?.appendChild(retailerCompare);
      retailerCompare.hidden = !retailerComparison.markup;
      retailerCompare.innerHTML = retailerComparison.markup || "";
    }
    if (productReasoning) {
      productReasoning.hidden = isCompactDensity;
      productReasoning.open = !isCompactDensity && openCatalogReasoningProductId === product.id;
      productReasoning.dataset.productId = product.id;
      productReasoning.dataset.hydrated = "false";
      if (productReasoning.open) {
        hydrateProductReasoning(productReasoning);
      }
    }
    if (productReasoningBody) {
      productReasoningBody.id = `product-reasoning-body-${productDomToken}`;
    }
    if (productReasoningToggle && productReasoningBody) {
      productReasoningToggle.setAttribute("aria-expanded", String(Boolean(productReasoning?.open)));
      productReasoningToggle.setAttribute("aria-controls", productReasoningBody.id);
    }
    productCard.classList.toggle("product-card-comparison-strong", signalProfile.hasOverlap);
    productCard.classList.toggle("product-card-weak-data", signalProfile.weakData);

    const tagRow = fragment.querySelector(".tag-row");
    if (tagRow) {
      const visibleTags = [...merchBadges, ...getCatalogTagLabels(product).map((label) => ({ tone: "neutral", label }))]
        .filter((entry, index, entries) => {
          const label = String(entry.label || "").trim();
          if (!label) return false;
          if (label.toLowerCase() === String(verdictLabel || "").toLowerCase()) return false;
          return entries.findIndex((candidate) => String(candidate.label || "").trim().toLowerCase() === label.toLowerCase()) === index;
        })
        .slice(0, 2);
      tagRow.hidden = visibleTags.length === 0;
      tagRow.innerHTML = visibleTags
        .map(
          (entry) => `
            <span class="tag tag-${escapeHtml(entry.tone || "neutral")}">${escapeHtml(entry.label)}</span>
          `,
        )
        .join("");
    }

    const favoriteButton = fragment.querySelector(".favorite-button");
    favoriteButton.dataset.id = product.id;
    favoriteButton.classList.toggle("active", isSaved);
    favoriteButton.textContent = isSaved ? "Saved" : "Save";
    favoriteButton.setAttribute("aria-label", isSaved ? "Remove from shortlist" : "Save to shortlist");

    const link = fragment.querySelector(".product-link");
    if (product.url) {
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.setAttribute("aria-disabled", "true");
      link.textContent = isCompactDensity ? "Demo link" : getOutboundLabel(product.retailer, `Open ${product.retailer} demo offer`);
    } else {
      link.removeAttribute("href");
      link.textContent = isCompactDensity ? "No link" : "Link unavailable";
    }

    cardsFragment.appendChild(fragment);
  });
  productGrid.appendChild(cardsFragment);
  syncCatalogResultsReadyState(paginated.length > 0);

  renderPagination(filtered.length);
  const secondaryRenderContext = {
    ...renderContext,
    filtered,
    leadProduct: spotlight,
  };
  syncCatalogStickyOffsets();
  scheduleAfterCatalogCardsPaint(() => {
    if (renderSequence !== catalogProductRenderSequence) return;
    hydrateCatalogCardComparisons(paginated, { snapshotContextByProductId, renderSequence });
    refreshOverviewSurface(filtered, { fetchRemote: true, renderHidden: false });
    renderSavedPresets();
    renderDecisionWorkspaceSummary(secondaryRenderContext);
    positionOpenRetailerPopover();
    syncCatalogStickyOffsets();
  });
}

export function scheduleCatalogSecondaryRefresh({
  routine = false,
  bestPicks = false,
  articles = false,
  routineDraftSync = false,
} = {}) {
  scheduleAfterCatalogCardsPaint(() => {
    if (routine) renderRoutineBuilder();
    if (bestPicks) renderBestPicks();
    if (articles) renderArticles();
    if (routineDraftSync) syncRoutinePlannerDraftSoon();
  });
}

export function wireEvents() {
  setupCatalogStickyOffsetSync();

  concernChips.addEventListener("click", (event) => {
    const target = event.target.closest(".chip");
    if (!target) return;
    setConcern(target.dataset.concern);
  });

  activeFilters.addEventListener("click", (event) => {
    const chip = event.target.closest(".active-filter-chip");
    if (!chip) return;
    if (chip.dataset.focusAction === "change") {
      openMobileCatalogFocusRail();
      return;
    }
    clearSingleFilter(chip.dataset.filterKey);
  });

  clearFiltersButton.addEventListener("click", () => {
    resetFilters();
    renderProducts();
    scheduleCatalogSecondaryRefresh({ routine: true, bestPicks: true });
  });

  saveProfileButton.addEventListener("click", () => {
    saveCurrentProfile();
  });

  saveCurrentProfileInlineButton?.addEventListener("click", () => {
    saveCurrentProfile();
  });

  userProfileOpenSavedButton?.addEventListener("click", () => {
    setUserProfileSummaryTab("saved");
  });

  continuityCreateCodeButton?.addEventListener("click", () => {
    void requestContinuityPairCode().then(() => {
      if (!state.continuity.pairCode) return;
      requestAnimationFrame(() => {
        scrollLensDrawerElementIntoView(continuityPairCode || continuityCard);
      });
    });
  });

  continuityJoinToggleButton?.addEventListener("click", () => {
    state.continuity.joinPanelOpen = !state.continuity.joinPanelOpen;
    state.continuity.joinMessage = "";
    renderContinuityCard();
    if (state.continuity.joinPanelOpen) {
      requestAnimationFrame(() => {
        scrollLensDrawerElementIntoView(continuityJoinPanel || continuityCard);
        continuityJoinCodeInput?.focus({ preventScroll: true });
      });
    }
  });

  continuityJoinCodeInput?.addEventListener("input", (event) => {
    state.continuity.joinCode = String(event.target.value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    state.continuity.joinMessage = "";
    renderContinuityCard();
  });

  continuityJoinCodeInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void claimContinuityPairCode();
  });

  continuityJoinSubmitButton?.addEventListener("click", () => {
    void claimContinuityPairCode();
  });

  continuityResetDataButton?.addEventListener("click", () => {
    void resetContinuityData();
  });

  continuityDeleteWorkspaceButton?.addEventListener("click", () => {
    void deleteContinuityData();
  });

  userProfileNavOverview?.addEventListener("click", () => {
    setUserProfileSummaryTab("overview");
  });

  userProfileNavSaved?.addEventListener("click", () => {
    setUserProfileSummaryTab("saved");
  });

  userProfileNavEdit?.addEventListener("click", () => {
    setUserProfileSummaryTab("edit");
  });

  editUserProfileButton?.addEventListener("click", () => {
    setLastLensDrawerTrigger(editUserProfileButton);
    toggleLensDrawer();
  });

  openUserProfileEditorButton?.addEventListener("click", () => {
    setLastLensDrawerTrigger(openUserProfileEditorButton);
    openUserProfileEditor({ scrollToEditor: true, trigger: openUserProfileEditorButton });
  });

  closeUserProfileDrawerButton?.addEventListener("click", () => {
    closeLensDrawer();
  });

  lensDrawerBackdrop?.addEventListener("click", () => {
    closeLensDrawer();
  });

  saveUserProfileButton.addEventListener("click", () => {
    saveUserProfile();
  });

  cancelUserProfileButton?.addEventListener("click", () => {
    closeLensDrawer();
  });

  lensDirtySaveButton?.addEventListener("click", () => {
    const target = state.ui.lensDirtyPromptTarget;
    saveUserProfile({
      closeDrawer: target?.type !== "tab",
      afterSaveTarget: target?.type === "tab" ? target : null,
    });
  });

  lensDirtyDiscardButton?.addEventListener("click", () => {
    const target = state.ui.lensDirtyPromptTarget;
    clearLensDirtyPrompt();
    syncUserProfileSurface({ closeEditor: true });
    applyLensPromptTarget(target);
  });

  lensDirtyKeepButton?.addEventListener("click", () => {
    clearLensDirtyPrompt();
    requestAnimationFrame(() => {
      userSkinProfileSelect?.focus({ preventScroll: true });
    });
  });

  resetUserProfileButton.addEventListener("click", () => {
    resetUserProfile();
  });

  saveRoutineButton?.addEventListener("click", () => {
    saveCurrentRoutine();
  });

  routineSaveCurrentButton?.addEventListener("click", () => {
    saveCurrentRoutine();
  });

  advisorSaveLeadButton?.addEventListener("click", () => {
    const productId = advisorSaveLeadButton.dataset.productId;
    const actionKey = advisorSaveLeadButton.dataset.decisionAction;
    if (actionKey && actionKey !== "save-lead" && actionKey !== "save-challenger") {
      runDecisionNextAction({
        key: actionKey,
        productId: productId || null,
        workspaceSection: advisorSaveLeadButton.dataset.workspaceSection || null,
      });
      return;
    }
    if (!productId) return;
    if (state.favoriteIds.includes(productId)) {
      openShortlistCompareMode();
      return;
    }
    addProductsToFavorites([productId], { openShortlist: true });
  });

  advisorPlanLeadButton?.addEventListener("click", () => {
    const productId = advisorPlanLeadButton.dataset.productId;
    const actionKey = advisorPlanLeadButton.dataset.decisionAction;
    if (actionKey) {
      runDecisionNextAction({
        key: actionKey,
        productId: productId || null,
        workspaceSection: advisorPlanLeadButton.dataset.workspaceSection || null,
      });
      return;
    }
    if (!productId) return;
    planAroundProduct(productId);
  });

  decisionStrip?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-lead-action]");
    if (!actionButton) return;
    const productId = actionButton.dataset.productId;
    if (!productId) return;
    if (actionButton.dataset.leadAction === "save") {
      if (state.favoriteIds.includes(productId)) {
        openShortlistCompareMode();
        return;
      }
      addProductsToFavorites([productId], { openShortlist: true });
      return;
    }
    if (actionButton.dataset.leadAction === "focus") {
      controlsPanel?.scrollIntoView({ behavior: getMotionSafeScrollBehavior(), block: "start" });
      categoryFilter?.focus({ preventScroll: true });
      return;
    }
    planAroundProduct(productId);
  });

  marketApplyWinnerButton?.addEventListener("click", () => {
    const retailer = marketApplyWinnerButton.dataset.retailer;
    if (!retailer || state.retailer === retailer) return;
    enterWorkMode("catalog");
    setActiveShellView("catalog", { focus: false });
    state.retailer = retailer;
    state.page = 1;
    retailerFilter.value = retailer;
    renderProducts();
    scheduleCatalogSecondaryRefresh({ routine: true, bestPicks: true });
  });

  marketOpenBasketButton?.addEventListener("click", () => {
    if (marketOpenBasketButton.disabled) return;
    if (!isCatalogDecisionReady()) {
      runDecisionNextAction({ key: "focus-catalog-work", workspaceSection: "shopping-brief-panel" });
      return;
    }
    const renderContext = getCatalogRenderContext();
    const leadProduct = renderContext.leadProduct;
    const shortlistSubset = getShortlistCoreFirstSubset();
    const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
    const shortlistPayload = shortlistSubset.length
      ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
      : null;
    const action = getDecisionNextActionContext({
      leadProduct,
      marketSnapshot: renderContext.marketSnapshot,
      shortlistPayload,
    });
    if (action.key === "store-check") {
      openDecisionWorkspaceSection("market-view-panel");
      return;
    }
    if (action.key === "approve-basket" || state.favoriteIds.length) {
      openShortlistCompareMode();
      return;
    }
    if (state.conversion.currentRoutineEntries.length) {
      focusRoutineBuilder();
      return;
    }
    setActiveShellView("catalog");
  });

  picksSaveModeButton?.addEventListener("click", () => {
    const pickIds = getBestPickEntries()
      .map((entry) => entry.product?.id)
      .filter(Boolean);
    if (!pickIds.length) return;
    const added = addProductsToFavorites(pickIds, { openShortlist: true });
    if (!added) {
      openShortlistCompareMode();
    }
  });

  savedProfiles.addEventListener("click", (event) => {
    const remove = event.target.closest(".saved-preset-remove");
    if (remove) {
      removeSavedPreset("profile", remove.dataset.id);
      return;
    }
    const button = event.target.closest(".saved-preset-main");
    if (!button) return;
    applySavedProfile(button.dataset.id);
  });

  userProfileQuickSwitches?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-profile-shortcut-id]");
    if (!button) return;
    applySavedProfile(button.dataset.profileShortcutId);
  });

  savedRoutines.addEventListener("click", (event) => {
    const remove = event.target.closest(".saved-preset-remove");
    if (remove) {
      removeSavedPreset("routine", remove.dataset.id);
      return;
    }
    const button = event.target.closest(".saved-preset-main");
    if (!button) return;
    applySavedRoutine(button.dataset.id);
  });

  quickConcerns.addEventListener("click", (event) => {
    const target = event.target.closest(".quick-pill");
    if (!target) return;
    if (target.dataset.overviewTemplate) {
      applyOverviewTemplate(target.dataset.overviewTemplate);
      return;
    }
    setConcern(target.dataset.concern);
  });

  browseLanes?.addEventListener("click", (event) => {
    const target = event.target.closest(".browse-lane");
    if (!target) return;
    applyBrowseLane(target.dataset.laneKey);
  });

  overviewLauncherGrid?.addEventListener("click", (event) => {
    const target = event.target.closest("[data-overview-launch]");
    if (!target) return;
    applyOverviewLauncher(target.dataset.overviewLaunch);
  });

  overviewShellView?.addEventListener("input", (event) => {
    const input = event.target.closest("#overview-concern-input");
    if (!input) return;
    handleOverviewConcernInput(input.value);
  });

  overviewShellView?.addEventListener("keydown", (event) => {
    const input = event.target.closest("#overview-concern-input");
    if (!input || event.key !== "Enter") return;
    event.preventDefault();
    handleOverviewConcernPrimaryAction();
  });

  overviewShellView?.addEventListener("click", (event) => {
    const intakeAction = event.target.closest("[data-overview-intake-action]");
    if (intakeAction) {
      handleOverviewConcernPrimaryAction();
      return;
    }
    const concernChip = event.target.closest("[data-overview-concern-chip]");
    if (concernChip) {
      handleOverviewConcernChip(concernChip.dataset.overviewConcernChip);
      return;
    }
    const focusAction = event.target.closest("[data-overview-focus-action]");
    if (focusAction) {
      selectOverviewFocusPath(focusAction.dataset.overviewFocusAction);
      return;
    }
    const routeAction = event.target.closest("[data-overview-route-action]");
    if (routeAction) {
      handleOverviewRouteAction(routeAction.dataset.overviewRouteAction);
      return;
    }
    const templateAction = event.target.closest("[data-overview-template]");
    if (templateAction) {
      applyOverviewTemplate(templateAction.dataset.overviewTemplate);
      return;
    }
    const explainButton = event.target.closest("[data-overview-explain]");
    if (explainButton) {
      const explainerKey = explainButton.dataset.overviewExplain;
      state.ui.activeOverviewExplainer =
        state.ui.activeOverviewExplainer === explainerKey ? null : explainerKey;
      refreshOverviewSurface(null, { fetchRemote: false });
      return;
    }
    const actionButton = event.target.closest("[data-overview-action]");
    if (!actionButton) return;
    const actionValue =
      actionButton.dataset.articleId ||
      actionButton.dataset.productId ||
      actionButton.dataset.retailer ||
      actionButton.dataset.workspaceSection ||
      null;
    handleOverviewAction(actionButton.dataset.overviewAction, actionValue);
  });

  catalogMoreFiltersButton?.addEventListener("click", () => {
    const shouldOpenFilters = !state.ui.secondaryFiltersOpen;
    state.ui.secondaryFiltersOpen = shouldOpenFilters;
    if (shouldOpenFilters) {
      state.ui.catalogFocusRailOpen = false;
    }
    persistUiSessionState();
    syncCatalogFilterDisclosure();
    syncCatalogStickyOffsets();
  });

  catalogFocusToggleButton?.addEventListener("click", () => {
    toggleMobileCatalogFocusRail();
  });

  retailerFilter.addEventListener("change", (event) => {
    enterWorkMode();
    state.retailer = event.target.value;
    state.page = 1;
    closeMobileCatalogHeaderModesAfterSelection();
    renderProducts();
    scheduleCatalogSecondaryRefresh({ routine: true, bestPicks: true });
  });

  brandFilter.addEventListener("change", (event) => {
    enterWorkMode();
    clearBrowseLaneSelection();
    state.brand = event.target.value;
    state.page = 1;
    closeMobileCatalogHeaderModesAfterSelection();
    renderProducts();
    scheduleCatalogSecondaryRefresh({ routine: true, bestPicks: true });
  });

  profileFilter.addEventListener("change", (event) => {
    enterWorkMode();
    state.profile = normalizeSkinProfile(event.target.value);
    state.userProfile.profile = state.profile;
    state.userProfile.goalSource = state.profile === "all" ? "default" : "profile";
    state.userProfile.goal = normalizeUserProfileGoalForLens(state.userProfile.goal, state.profile);
    if (state.concern !== "all") state.concern = "all";
    setConcernChipSelection("all");
    persistUserProfile();
    state.page = 1;
    resetRoutinePlannerCaches({ clearRestoreState: true });
    persistRoutinePlannerSession();
    syncUserProfileSurface();
    closeMobileCatalogHeaderModesAfterSelection();
    renderProducts();
    scheduleCatalogSecondaryRefresh({
      routine: true,
      bestPicks: true,
      articles: true,
      routineDraftSync: true,
    });
  });

  userNameInput.addEventListener("input", (event) => {
    updateUserProfileDraft({ name: event.target.value });
  });

  userSkinProfileSelect.addEventListener("change", (event) => {
    updateUserProfileDraft({ profile: normalizeSkinProfile(event.target.value) });
  });

  userBudgetSelect.addEventListener("change", (event) => {
    updateUserProfileDraft({ budget: event.target.value });
  });

  userGoalSelect.addEventListener("change", (event) => {
    updateUserProfileDraft({ goal: event.target.value });
  });

  userSensitivitySelect.addEventListener("change", (event) => {
    updateUserProfileDraft({ sensitivity: event.target.value });
  });

  userActivesComfortSelect.addEventListener("change", (event) => {
    updateUserProfileDraft({ activesComfort: event.target.value });
  });

  lensQuickPresets?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lens-preset]");
    if (!button) return;
    applyLensPreset(button.dataset.lensPreset);
  });

  categoryFilter.addEventListener("change", (event) => {
    enterWorkMode();
    clearBrowseLaneSelection();
    state.category = event.target.value;
    state.page = 1;
    closeMobileCatalogHeaderModesAfterSelection();
    renderProducts();
  });

  ingredientFilter.addEventListener("change", (event) => {
    enterWorkMode();
    clearBrowseLaneSelection();
    state.ingredient = event.target.value;
    state.page = 1;
    closeMobileCatalogHeaderModesAfterSelection();
    renderProducts();
  });

  sortFilter.addEventListener("change", (event) => {
    enterWorkMode();
    clearBrowseLaneSelection();
    state.sort = event.target.value;
    state.page = 1;
    closeMobileCatalogHeaderModesAfterSelection();
    renderProducts();
  });

  searchInput.addEventListener("input", (event) => {
    enterWorkMode();
    clearBrowseLaneSelection();
    state.search = event.target.value.trim();
    state.page = 1;
    closeMobileCatalogHeaderModesAfterSelection();
    renderCatalogSearchSettlingState(state.search);
    if (catalogSearchRenderTimer) {
      window.clearTimeout(catalogSearchRenderTimer);
    }
    catalogSearchRenderTimer = window.setTimeout(() => {
      catalogSearchRenderTimer = null;
      renderProducts();
    }, SEARCH_RENDER_DEBOUNCE_MS);
  });

  avoidIngredients.addEventListener("click", (event) => {
    const button = event.target.closest(".toggle-chip");
    if (!button) return;
    const ingredient = button.dataset.avoidIngredient;
    updateUserProfileDraft((draft) => ({
      ...draft,
      avoidIngredients: draft.avoidIngredients.includes(ingredient)
        ? draft.avoidIngredients.filter((value) => value !== ingredient)
        : [...draft.avoidIngredients, ingredient],
    }));
  });

  routineConcern.addEventListener("change", (event) => {
    enterWorkMode();
    state.routineConcern = event.target.value;
    resetRoutinePlannerCaches({ clearRestoreState: true });
    persistRoutinePlannerSession();
    syncUserProfileSurface();
    renderProducts();
    scheduleCatalogSecondaryRefresh({ routine: true, bestPicks: true, routineDraftSync: true });
  });

  routineTime.addEventListener("change", (event) => {
    enterWorkMode();
    state.routineTime = event.target.value;
    resetRoutinePlannerCaches({ clearRestoreState: true });
    persistRoutinePlannerSession();
    renderProducts();
    scheduleCatalogSecondaryRefresh({ routine: true, routineDraftSync: true });
  });

  routineBudget.addEventListener("change", (event) => {
    enterWorkMode();
    state.routineBudget = event.target.value;
    resetRoutinePlannerCaches({ clearRestoreState: true });
    persistRoutinePlannerSession();
    renderRoutineBuilder();
    syncRoutinePlannerDraftSoon();
  });

  routineGrid.addEventListener("click", (event) => {
    const trackButton = event.target.closest(".track-button");
    if (trackButton) {
      toggleTrackedAlert(trackButton.dataset.trackId, { trigger: trackButton });
      return;
    }
    const actionButton = event.target.closest("[data-routine-action]");
    if (!actionButton) return;
    handleRoutineAction(actionButton);
  });

  routineSwapDrawer?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-routine-action]");
    if (!actionButton) return;
    handleRoutineAction(actionButton);
  });

  routineDraftBrief?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-routine-brief-action='open']");
    if (!trigger) return;
    focusRoutineBuilder();
  });

  densityDecisionButton?.addEventListener("click", () => {
    state.ui.catalogDensity = "decision";
    persistUiSessionState();
    syncSupportDisclosureUi();
    renderProducts();
  });

  densityCompactButton?.addEventListener("click", () => {
    state.ui.catalogDensity = "compact";
    persistUiSessionState();
    syncSupportDisclosureUi();
    renderProducts();
  });

  catalogOpenShortlistButton?.addEventListener("click", () => {
    const savedProducts = getShortlistSavedProducts();
    if (savedProducts.length || catalogOpenShortlistButton.dataset.primaryAction === "open-shortlist") {
      openShortlistCompareMode();
      return;
    }
    const renderContext = getCatalogRenderContext();
    const fallbackAction = getDecisionNextActionContext({
      leadProduct: renderContext.leadProduct,
      marketSnapshot: renderContext.marketSnapshot,
    });
    const shouldUseFreshSaveAction =
      fallbackAction.key === "save-lead";
    const primaryAction = shouldUseFreshSaveAction
      ? fallbackAction.key
      : catalogOpenShortlistButton.dataset.primaryAction || fallbackAction.key;
    runDecisionNextAction({
      key: primaryAction,
      productId: catalogOpenShortlistButton.dataset.productId || fallbackAction.productId || null,
      workspaceSection: catalogOpenShortlistButton.dataset.workspaceSection || fallbackAction.workspaceSection || null,
    });
  });

  const handleDecisionActionTrigger = (event) => {
    const primaryActionButton = event.target.closest("[data-decision-action]");
    if (!primaryActionButton) return false;
    if (primaryActionButton.dataset.decisionAction === "open-lens-editor") {
      setLastLensDrawerTrigger(primaryActionButton);
      openUserProfileEditor({ scrollToEditor: true, trigger: primaryActionButton });
      return true;
    }
    runDecisionNextAction({
      key: primaryActionButton.dataset.decisionAction,
      productId: primaryActionButton.dataset.productId || null,
      workspaceSection: primaryActionButton.dataset.workspaceSection || null,
    });
    return true;
  };

  catalogCommandBar?.addEventListener("click", (event) => {
    handleDecisionActionTrigger(event);
  });

  workModeCasebar?.addEventListener("click", (event) => {
    handleDecisionActionTrigger(event);
  });

  supportSessionStrip?.addEventListener("click", (event) => {
    handleDecisionActionTrigger(event);
  });

  routineSummary?.addEventListener("click", (event) => {
    const trackButton = event.target.closest(".track-button");
    if (!trackButton) return;
    toggleTrackedAlert(trackButton.dataset.trackId, { trigger: trackButton });
  });

  trackedAlertsTabAlerts?.addEventListener("click", () => {
    state.ui.trackedAlertsView = "alerts";
    renderTrackedAlertsPanel();
  });

  trackedAlertsTabWatching?.addEventListener("click", () => {
    state.ui.trackedAlertsView = "watching";
    renderTrackedAlertsPanel();
  });

  trackedAlertsMarkReadButton?.addEventListener("click", () => {
    void markAllNotificationsRead();
  });

  trackedAlertsBody?.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-watch-open]");
    if (openButton) {
      openWatchSettings(openButton.dataset.watchOpen, { trigger: openButton });
      return;
    }
    const removeButton = event.target.closest("[data-watch-remove]");
    if (removeButton) {
      const watch = getWatchByIdentityKey(removeButton.dataset.watchRemove);
      if (watch) {
        state.ui.watchDialogProductId = watch.seedOfferId || getFirstProductIdForComparisonKey(watch.comparisonKey);
        void removeWatchSettings();
      }
      return;
    }
    const readButton = event.target.closest("[data-alert-read]");
    if (readButton) {
      void markNotificationRead(readButton.dataset.alertRead);
    }
  });

  watchSettingsBackdrop?.addEventListener("click", closeWatchSettings);
  watchSettingsCloseButton?.addEventListener("click", closeWatchSettings);
  watchSettingsForm?.addEventListener("submit", (event) => {
    void saveWatchSettings(event);
  });
  watchSettingsRemoveButton?.addEventListener("click", () => {
    void removeWatchSettings();
  });
  watchEmailStartButton?.addEventListener("click", () => {
    void startNotificationEmailFromDialog();
  });
  watchEmailVerifyButton?.addEventListener("click", () => {
    void verifyNotificationEmailFromDialog();
  });

  productGrid.addEventListener("click", (event) => {
    const emptyActionButton = event.target.closest("[data-empty-action='clear-case']");
    if (emptyActionButton) {
      resetFilters();
      renderProducts();
      scheduleCatalogSecondaryRefresh({ routine: true, bestPicks: true });
      return;
    }
    const statusButton = event.target.closest("button[data-shortlist-status]");
    if (statusButton) {
      setShortlistStatus(statusButton.dataset.id, statusButton.dataset.shortlistStatus);
      return;
    }
    const favoriteButton = event.target.closest(".favorite-button");
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.id);
      return;
    }
    const reasoningToggle = event.target.closest(".product-reasoning-toggle");
    if (reasoningToggle) {
      const reasoning = reasoningToggle.closest(".product-reasoning");
      reasoningToggle.setAttribute("aria-expanded", String(!reasoning?.open));
      window.setTimeout(() => {
        reasoningToggle.setAttribute("aria-expanded", String(Boolean(reasoning?.open)));
        if (reasoning?.open) {
          openCatalogReasoningProductId = reasoning.dataset.productId || null;
          hydrateProductReasoning(reasoning);
        } else if (openCatalogReasoningProductId === reasoning?.dataset.productId) {
          openCatalogReasoningProductId = null;
        }
      }, 0);
      return;
    }
    const compareToggle = event.target.closest(".compare-toggle");
    if (compareToggle) {
      const popover = compareToggle.closest(".compare-popover");
      const productId = popover?.dataset.productId || null;
      state.ui.openRetailerCompareId = popover?.open ? null : productId;
      compareToggle.setAttribute("aria-expanded", String(!popover?.open));
      return;
    }
    const compareClose = event.target.closest(".compare-close");
    if (compareClose) {
      event.preventDefault();
      event.stopPropagation();
      const popover = compareClose.closest(".compare-popover");
      closeOpenRetailerPopover(popover);
      return;
    }
  });

  productGrid.addEventListener(
    "toggle",
    (event) => {
      const reasoning = event.target.closest?.(".product-reasoning");
      if (reasoning) {
        requestAnimationFrame(() => {
          reasoning.querySelector(".product-reasoning-toggle")?.setAttribute("aria-expanded", String(reasoning.open));
          if (reasoning.open) {
            openCatalogReasoningProductId = reasoning.dataset.productId || null;
            hydrateProductReasoning(reasoning);
          } else if (openCatalogReasoningProductId === reasoning.dataset.productId) {
            openCatalogReasoningProductId = null;
          }
        });
        return;
      }
      const popover = event.target.closest?.(".compare-popover");
      if (!popover) return;
      syncComparePopoverA11y(popover);
      if (popover.open) {
        state.ui.openRetailerCompareId = popover.dataset.productId || null;
        syncRetailerPopoverChromeInterlocks();
        productGrid.querySelectorAll(".compare-popover[open]").forEach((entry) => {
          if (entry !== popover) {
            entry.open = false;
            syncComparePopoverA11y(entry);
          }
        });
        const product = getProductById(popover.dataset.productId);
        if (product) {
          ensureProductComparison(product);
          ensureCompareExplainer(product);
        }
        syncRetailerPopoverLayout(popover);
      } else {
        if (state.ui.openRetailerCompareId === popover.dataset.productId) {
          state.ui.openRetailerCompareId = null;
        }
        syncRetailerPopoverChromeInterlocks();
      }
    },
    true,
  );

  document.addEventListener("click", (event) => {
    if (event.target.closest("#routine-swap-backdrop")) {
      closeRoutineChooser();
      return;
    }
    if (
      state.ui.openRoutineChooserStep &&
      !event.target.closest("#routine-swap-drawer") &&
      !event.target.closest('[data-routine-action="swap"]')
    ) {
      closeRoutineChooser();
      return;
    }
    if (event.target.closest(".compare-popover")) return;
    if (!state.ui.openRetailerCompareId) return;
    closeOpenRetailerPopover(null, { restoreFocus: false });
  });

  document.addEventListener("keydown", (event) => {
    if (trapWatchSettingsFocus(event)) return;
    if (trapRoutineSwapFocus(event)) return;
    if (trapLensDrawerFocus(event)) return;
    if (event.key !== "Escape") return;
    if (!watchSettingsDialog?.hidden) {
      closeWatchSettings();
      return;
    }
    if (state.ui.openRoutineChooserStep) {
      closeRoutineChooser();
      return;
    }
    if (state.ui.openRetailerCompareId) {
      closeOpenRetailerPopover();
      return;
    }
    if (state.ui.activeShellView === "shortlist") {
      closeShortlistSheet();
      return;
    }
    if (state.ui.lensDrawerOpen) {
      closeLensDrawer();
    }
  });

  window.addEventListener("resize", () => {
    positionOpenRetailerPopover();
    positionRoutineSwapDrawer();
    syncCatalogFilterDisclosure();
    syncCatalogStickyState();
    syncCatalogStickyOffsets();
  });

  bestPicks.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-button");
    if (!favoriteButton) return;
    toggleFavorite(favoriteButton.dataset.id);
  });

  advisorPicks.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest(".favorite-button");
    if (!favoriteButton) return;
    toggleFavorite(favoriteButton.dataset.id);
  });

  pickModes.addEventListener("click", (event) => {
    const button = event.target.closest(".pick-mode");
    if (!button) return;
    state.picksMode = button.dataset.pickMode;
    renderBestPicks();
  });

  savedGrid.addEventListener("click", (event) => {
    const statusButton = event.target.closest("button[data-shortlist-status]");
    if (statusButton) {
      setShortlistStatus(statusButton.dataset.id, statusButton.dataset.shortlistStatus);
      return;
    }
    const favoriteButton = event.target.closest(".favorite-button");
    if (!favoriteButton) return;
    toggleFavorite(favoriteButton.dataset.id);
  });

  shortlistToRoutineButton?.addEventListener("click", () => {
    if (shortlistToRoutineButton.disabled) return;
    if (!getShortlistChampionProduct()) {
      openShortlistCompareMode();
      return;
    }
    focusRoutineBuilder();
  });

  const triggerShortlistBuyPlan = () => {
    const subset = getShortlistCoreFirstSubset();
    if (!subset.length) return;
    void ensureBasketPlan("shortlist", subset, { dedupe: true, useLocalFallback: true, force: true });
    renderFavorites();
  };

  shortlistBuyCoreButton?.addEventListener("click", () => {
    triggerShortlistBuyPlan();
  });

  shortlistBuildPlanButton?.addEventListener("click", () => {
    runDecisionNextAction({
      key: shortlistBuildPlanButton.dataset.primaryAction,
      productId: shortlistBuildPlanButton.dataset.productId || null,
      workspaceSection: shortlistBuildPlanButton.dataset.workspaceSection || null,
    });
  });

  shortlistEmptyCtaButton?.addEventListener("click", () => {
    enterWorkMode("catalog");
    setActiveShellView("catalog");
  });

  shortlistBuySummary?.addEventListener("click", (event) => {
    const trackButton = event.target.closest(".track-button");
    if (!trackButton) return;
    toggleTrackedAlert(trackButton.dataset.trackId, { trigger: trackButton });
  });

  shortlistAiPrompts.addEventListener("click", (event) => {
    const button = event.target.closest(".shortlist-ai-prompt");
    if (!button) return;
    shortlistAiInput.value = button.textContent.trim();
    syncShortlistAiControls();
    renderShortlistAiResponse();
  });

  shortlistAiSubmit.addEventListener("click", () => {
    renderShortlistAiResponse();
  });

  shortlistAiInput?.addEventListener("input", () => {
    syncShortlistAiControls();
    if (!shortlistAiInput.value.trim()) {
      renderShortlistAiIdleState();
    }
  });

  shortlistAiToggle?.addEventListener("click", () => {
    state.ui.shortlistExpanded = !state.ui.shortlistExpanded;
    syncSupportDisclosureUi();
    if (state.ui.shortlistExpanded) {
      scrollShortlistDockToAiArea();
      requestAnimationFrame(() => {
        shortlistAiInput?.focus({ preventScroll: true });
      });
    }
  });

  marketToggle?.addEventListener("click", () => {
    state.ui.marketExpanded = !state.ui.marketExpanded;
    syncSupportDisclosureUi();
  });

  advisorToggle?.addEventListener("click", () => {
    state.ui.advisorExpanded = !state.ui.advisorExpanded;
    syncSupportDisclosureUi();
  });

  articleTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".article-tab");
    if (!button) return;
    state.articleId = button.dataset.articleId;
    renderArticles();
  });

  savedArticles.addEventListener("click", (event) => {
    const button = event.target.closest(".saved-article-chip");
    if (!button) return;
    state.articleId = button.dataset.articleId;
    renderArticles();
  });

  articleGroups.addEventListener("click", (event) => {
    const button = event.target.closest(".article-group");
    if (!button) return;
    state.articleGroup = button.dataset.articleGroup;
    renderArticles();
  });

  articleSaveButton.addEventListener("click", () => {
    toggleSavedArticle(articleSaveButton.dataset.articleId);
  });

  articleShopLink.addEventListener("click", () => {
    if (articleShopLink.disabled) return;
    applyArticleJourney(articleShopLink.dataset.articleId);
  });

  learnAnswerPrompts?.addEventListener("click", (event) => {
    const button = event.target.closest(".learn-answer-prompt");
    if (!button) return;
    const { article: activeArticle } = resolveArticleSelection();
    if (!activeArticle) return;
    const question = button.textContent.trim();
    setLearnAnswerDraft(activeArticle.id, question);
    if (learnAnswerInput) {
      learnAnswerInput.value = question;
    }
    void requestLearnAnswer(question, activeArticle, { force: true });
  });

  learnAnswerInput?.addEventListener("input", () => {
    const { article: activeArticle } = resolveArticleSelection();
    if (!activeArticle) return;
    setLearnAnswerDraft(activeArticle.id, learnAnswerInput.value);
  });

  learnAnswerInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) return;
    event.preventDefault();
    const { article: activeArticle } = resolveArticleSelection();
    if (!activeArticle) return;
    const question = learnAnswerInput.value.trim() || getDefaultLearnAnswerQuestion(activeArticle);
    setLearnAnswerDraft(activeArticle.id, question);
    void requestLearnAnswer(question, activeArticle, { force: true });
  });

  learnAnswerSubmit?.addEventListener("click", () => {
    const { article: activeArticle } = resolveArticleSelection();
    if (!activeArticle) return;
    const question = learnAnswerInput?.value.trim() || getDefaultLearnAnswerQuestion(activeArticle);
    setLearnAnswerDraft(activeArticle.id, question);
    void requestLearnAnswer(question, activeArticle, { force: true });
  });

  shortlistSheetBackdrop?.addEventListener("click", closeShortlistSheet);
  shortlistSheetCloseButton?.addEventListener("click", closeShortlistSheet);

  setupShellNavigation();
  setupSupportWorkspaceNavigation();
  window.addEventListener("popstate", (event) => {
    syncShellViewToLocation(event.state);
  });

  const syncScrollChrome = () => {
    scrollTopButton.classList.toggle("visible", window.scrollY > 500);
    workspaceSupernavShell?.classList.toggle("is-scrolled", window.scrollY > 40);
    syncCatalogStickyState();
  };

  scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: getMotionSafeScrollBehavior() });
  });

  window.addEventListener("scroll", syncScrollChrome);
  syncScrollChrome();
}
