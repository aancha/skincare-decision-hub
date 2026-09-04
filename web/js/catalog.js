// Catalog filtering, ranking, browse lanes, overview/workspace rendering, Learn, and catalog orchestration.
// Browser-native ES module. Keep behavior changes in focused feature commits.
import {
  applyProductImage,
  articleCatalog,
  buildApiHeaders,
  buildApiUrl,
  buildOverviewQuery,
  ensureOverviewSnapshot,
  fetchFocusedProductsPage,
  postJson,
  renderProfileStatus,
  resolveShellViewFromPathname,
  syncShellHistory,
} from "./api.js";
import {
  buildLocalBasketPlanPayload,
  getActiveBasketPayload,
  getCaseSummaryLeaderSummary,
  getCatalogCommandCaseSummary,
  getCatalogCommandDecisionSummary,
  getComparableProductKey,
  getCurrentRoutineOneStoreRetailer,
  getOutboundLabel,
  getRetailerComparison,
  getRetailerEquivalentCategoryGroup,
  getRetailerEquivalentIdentityRelation,
  getRetailerEquivalentVariantKind,
  getTopConcern,
  getTopLabel,
  getTrustTone,
  hasAffiliateEnabled,
  isRetailerExactMatch,
  normalizeComparableText,
  positionOpenRetailerPopover,
  renderProducts,
  renderRetailerComparisonMarkup,
  syncRetailerPopoverChromeInterlocks,
} from "./cards.js";
import {
  ACTIVE_LED_CONCERNS,
  AVOID_INGREDIENT_OPTIONS,
  BARRIER_FIRST_CONCERNS,
  BARRIER_SUPPORT_INGREDIENTS,
  CONCERN_STRATEGIES,
  INGREDIENT_RULES,
  SKIN_PROFILES,
  STRONG_ACTIVE_INGREDIENTS,
  evaluateShortlistQuestionGuardrails,
  getIngredientInsight,
  getProductConflictWarnings,
  getProfileWarnings,
  getRoutineWarnings,
  isSunProtectionProduct,
  renderConflictMarkup,
  renderIngredientInsightMarkup,
} from "./guardrails.js";
import {
  closeRoutineChooser,
  focusRoutineBuilder,
  getActiveRoutinePlannerPlan,
  getLeadRoutineStep,
  getRoutinePlannerAvoidIngredients,
  getRoutineStepPriority,
  getSerializableRoutineDraftState,
  isRoutineProductValidForStep,
  normalizeSkinProfile,
  planAroundProduct,
  renderRoutineBuilder,
  syncRoutinePlannerDraftSoon,
} from "./routine.js";
import {
  beginRecommenderCase,
  initializeRecommenderAfterFirstRender,
  rankRecommenderShadow,
} from "./recommender.js";
import {
  ensureShortlistStatuses,
  focusCatalogWorkbench,
  getDecisionNextActionContext,
  getDecisionWorkspaceBlockerSection,
  getGroundedAiCitationLabels,
  getGroundedAiReadState,
  getGroundedAiStateBadge,
  getWorkspaceDecisionActionDisplay,
  getShortlistBackupProduct,
  getShortlistChampionProduct,
  getShortlistComparisonFamilyKey,
  getShortlistCoreFirstSubset,
  getShortlistDecisionState,
  getShortlistSavedProducts,
  getShortlistStatus,
  getShortlistStatusCounts,
  isGroundedAiFallbackPayload,
  isShortlistExploratoryHandoff,
  normalizeGroundedAiText,
  openDecisionWorkspaceBlocker,
  openDecisionWorkspaceSection,
  persistFavorites,
  persistUserProfile,
  renderContinuityCard,
  renderDecisionWorkspaceSummary,
  renderFavorites,
  renderGroundedAiSourceNote,
  renderLearnAnswerStructuredAnswerMarkup,
  renderTrackedAlertsPanel,
  runDecisionNextAction,
  setShortlistStatus,
  updateContinuityShadowFromLocalState,
} from "./shortlist.js";
import {
  AFFILIATE_CONFIG,
  BROWSE_LANES,
  CATALOG_PROOF_HIGHLIGHT_QUERY_PARAM,
  CATALOG_PROOF_HIGHLIGHT_VALUE,
  CATALOG_FOCUSED_FILTER_LIMIT,
  CATALOG_FOCUSED_FILTER_TIMEOUT_MS,
  CONTINUITY_SESSION_STORAGE_KEY,
  CONTINUITY_SHADOW_STORAGE_KEY,
  DECISION_DESK_COPY,
  FALLBACK_ARTICLES,
  LENS_PRESETS,
  OVERVIEW_LAUNCHER_CONCERN_PRIORITY,
  OVERVIEW_LAUNCHER_INGREDIENT_MAP,
  OVERVIEW_TEMPLATE_CONFIG,
  PICK_MODES,
  RETAILER_SIGNATURES,
  ROUTINE_BUDGETS,
  ROUTINE_PLANNER_SESSION_KEY,
  ROUTINE_STEPS,
  SHELL_VIEW_KEYS,
  SHORTLIST_ACTIONABLE_STATUSES,
  SHORTLIST_STATUS_LABELS,
  SHORTLIST_STATUS_STORAGE_KEY,
  TRACKED_ALERTS_STORAGE_KEY,
  UI_SESSION_STORAGE_KEY,
  WATCHED_ITEMS_STORAGE_KEY,
  WORKSPACE_TAB_IDS,
  activeFilters,
  advisorChips,
  advisorGuidance,
  advisorPicks,
  advisorPlanLeadButton,
  advisorSaveLeadButton,
  advisorSessionSummary,
  advisorSummary,
  advisorToggle,
  affiliateNote,
  articleBody,
  articleGroups,
  articleHelper,
  articleKicker,
  articleMeta,
  articleSaveButton,
  articleShopLink,
  articleSourceLink,
  articleSummary,
  articleTabs,
  articleTitle,
  avoidIngredients,
  bestPicks,
  brandFilter,
  browseLanes,
  cancelUserProfileButton,
  catalogCommandBar,
  catalogFocusToggleButton,
  catalogMoreFiltersButton,
  catalogSecondaryFilters,
  categoryFilter,
  clearFiltersButton,
  closeUserProfileDrawerButton,
  concernChips,
  controlsPanel,
  createCatalogFocusedFilterState,
  createDefaultContinuityDomains,
  createDefaultContinuityVersions,
  decisionStrip,
  densityCompactButton,
  densityDecisionButton,
  derivedRenderCache,
  editUserProfileButton,
  freshnessBar,
  getBrandQuickPickEntries,
  getMotionSafeScrollBehavior,
  heroStats,
  ingredientFilter,
  learnAnswer,
  learnAnswerInput,
  learnAnswerMeta,
  learnAnswerResponse,
  learnAnswerSubmit,
  learnEvidenceNotes,
  learnTrustLabels,
  lensDirtyConfirm,
  lensDirtyConfirmCopy,
  lensDirtyKeepButton,
  lensDrawer,
  lensDrawerBackdrop,
  lensDrawerPanel,
  lensDrawerScroll,
  lensEditorFooter,
  lensImpactRow,
  lensQuickPresets,
  lensSummaryMeta,
  lensSummaryTitle,
  lensTensionWarning,
  marketApplyWinnerButton,
  marketGrid,
  marketOpenBasketButton,
  marketSessionSummary,
  marketToggle,
  mobileShellButtons,
  mobileShellNav,
  mosaicPanel,
  overviewActionLauncherProofs,
  overviewActionLauncherTitles,
  overviewConcernInput,
  overviewConcernValidation,
  overviewDecisionBoard,
  overviewFocusDeck,
  overviewFocusPanel,
  overviewHeardChips,
  overviewLauncherCards,
  overviewLauncherProofs,
  overviewLauncherTitles,
  overviewMobilePrimaryAction,
  overviewMobilePrimaryMeta,
  overviewPanel,
  overviewPrimaryAction,
  overviewProofHandoff,
  overviewProofLock,
  overviewRoutingAction,
  overviewRoutingPanel,
  overviewSafetyGate,
  overviewScopeStrip,
  overviewShopperSaid,
  overviewSuggestedFocus,
  overviewWorkingSummary,
  paginationBar,
  pickModes,
  picksSaveModeButton,
  productGrid,
  profileFilter,
  quickConcerns,
  retailerCoverage,
  retailerFilter,
  routineBudget,
  routineConcern,
  routineTime,
  saveUserProfileButton,
  savedArticles,
  savedProfiles,
  savedRoutines,
  searchInput,
  shellNavButtons,
  shellScrollYByView,
  shellViewPanelByKey,
  shortlistAi,
  shortlistAiToggle,
  shortlistDock,
  shortlistSheetBackdrop,
  shortlistSummary,
  sortFilter,
  spotlightCopy,
  spotlightTitle,
  state,
  supportFlowCaption,
  supportFlowChips,
  supportNavButtonBySection,
  supportNavButtons,
  supportNavMetaBySection,
  supportWorkspaceSections,
  template,
  topConcerns,
  userActivesComfortSelect,
  userBudgetSelect,
  userGoalSelect,
  userNameInput,
  userProfileActivityMeta,
  userProfileActivityState,
  userProfileAvatar,
  userProfileCard,
  userProfileDraftPreview,
  userProfileFormState,
  userProfileImpactInline,
  userProfileNavEdit,
  userProfileNavOverview,
  userProfileNavSaved,
  userProfileOverviewPanel,
  userProfilePanel,
  userProfileQuickSwitches,
  userProfileSaveNote,
  userProfileSaveState,
  userProfileSavedPanel,
  userProfileSummaryRows,
  userSensitivitySelect,
  userSkinProfileSelect,
  userSummaryCard,
  userSummaryContext,
  userSummaryCopy,
  userSummaryMeta,
  userSummaryPriority,
  userSummaryTitle,
  workModeCaseHeader,
  workModeCasebar,
  workspaceActiveChip,
  workspaceActiveNote,
  workspaceActiveTitle,
  workspaceLayout,
  workspaceShellRailLabel,
  workspaceShellRailPrimary,
  workspaceShellRailSecondary,
  workspaceShellRailTertiary,
  workspaceSupernavShell,
} from "./state.js";

export let pendingShellScrollFrame = null;
export let catalogFindHighlightTimer = null;
export let profileSurfaceTransitionTimer = null;
export let catalogStickyResizeObserver = null;
export let lastRenderedUserProfileSignature = null;
export let lastLensDrawerTrigger = null;

export function setLastLensDrawerTrigger(trigger) {
  lastLensDrawerTrigger = trigger;
}

export const SHELL_VIEW_CONTEXT = {
  overview: {
    title: "Overview",
    chip: "Start case",
    note: "One working case across four views.",
  },
  catalog: {
    title: "Catalog",
    chip: "Demo case",
    note: "Scope and compare the fictional fixture.",
  },
  workspace: {
    title: "Workspace",
    chip: "Active stage",
    note: "Pressure-test and plan the lead.",
  },
  shortlist: {
    title: "Shortlist",
    chip: "Approve set",
    note: "Approve the final set and path.",
  },
};

export const WORKSPACE_STAGE_SHELL_META = {
  "shopping-brief-panel": {
    title: "Brief",
    pill: "Brief",
    detail: "Choose focus, then decide whether the best candidate is worth saving.",
    actionLabel: "Open brief",
  },
  "market-view-panel": {
    title: "Stores",
    pill: "Stores",
    detail: "Compare retailer path after the case has a real champion and backup.",
    actionLabel: "Open stores",
  },
  "routine-builder-panel": {
    title: "Routine",
    pill: "Routine",
    detail: "Draft routine fit without treating it as checkout proof.",
    actionLabel: "Open routine",
  },
  "saved-presets-panel": {
    title: "Saved",
    pill: "Saved",
    detail: "Reopen saved lenses and routine drafts without losing the current case.",
    actionLabel: "Open saved",
  },
  "learn-workspace-panel": {
    title: "Learn",
    pill: "Learn",
    detail: "Read evidence attached to the case; do not use it as readiness proof.",
    actionLabel: "Open learn",
  },
};

export const WORKSPACE_STAGE_FLOW = [
  "shopping-brief-panel",
  "market-view-panel",
  "routine-builder-panel",
  "saved-presets-panel",
  "learn-workspace-panel",
];

export function getWorkspaceShellStageMeta(sectionId = state.ui.activeWorkspaceTab) {
  return WORKSPACE_STAGE_SHELL_META[sectionId] || WORKSPACE_STAGE_SHELL_META["shopping-brief-panel"];
}

export function getWorkspaceShellFlow(sectionId = state.ui.activeWorkspaceTab) {
  const activeSection = WORKSPACE_STAGE_FLOW.includes(sectionId) ? sectionId : "shopping-brief-panel";
  const startIndex = Math.max(0, WORKSPACE_STAGE_FLOW.indexOf(activeSection));
  return {
    now: {
      id: activeSection,
      ...getWorkspaceShellStageMeta(activeSection),
    },
    next: WORKSPACE_STAGE_FLOW[startIndex + 1]
      ? {
          id: WORKSPACE_STAGE_FLOW[startIndex + 1],
          ...getWorkspaceShellStageMeta(WORKSPACE_STAGE_FLOW[startIndex + 1]),
        }
      : null,
    later: WORKSPACE_STAGE_FLOW.slice(startIndex + 2).map((id) => ({
      id,
      ...getWorkspaceShellStageMeta(id),
    })),
  };
}

export function getWorkspaceShellProgression(metrics) {
  const flow = getWorkspaceShellFlow(state.ui.activeWorkspaceTab);
  const blockedNext = metrics?.blockerSection && metrics.blockerSection !== flow.now.id
    ? {
        id: metrics.blockerSection,
        ...getWorkspaceShellStageMeta(metrics.blockerSection),
      }
    : null;
  const next = blockedNext || flow.next;
  const later = flow.later.find((stage) => stage.id !== next?.id) || null;
  return {
    now: flow.now,
    next,
    later,
  };
}

export function getShellRenderMetrics(renderContext = null) {
  const context = renderContext || getCatalogRenderContext();
  const filtered = Array.isArray(context?.filtered) ? context.filtered : [];
  const activeLane = getActiveBrowseLane();
  const leadProduct = context?.leadProduct || null;
  const marketSnapshot = context?.marketSnapshot || getMarketViewSnapshot(filtered);
  const savedProducts = getShortlistSavedProducts();
  const decisionState = getShortlistDecisionState(savedProducts);
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const blockerSection = getDecisionWorkspaceBlockerSection({
    leadProduct,
    marketSnapshot,
    shortlistPayload,
    savedProducts,
  });
  const savedProfile = getSavedUserProfileRecord();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  const savedProfileActive = state.savedProfiles.some((entry) => isSavedProfileEntryActive(entry));
  const savedRoutineActive = state.savedRoutines.some((entry) => JSON.stringify(entry.config) === getCurrentRoutineSignature());
  const savedStateCount = state.savedProfiles.length + state.savedRoutines.length;
  return {
    context,
    filtered,
    filteredCount: filtered.length,
    totalPages,
    activeLane,
    leadProduct,
    marketSnapshot,
    savedProducts,
    decisionState,
    shortlistPayload,
    blockerSection,
    savedProfile,
    savedProfileActive,
    savedRoutineActive,
    savedStateCount,
  };
}

export function getOverviewShellStartingCase(metrics) {
  if (!metrics.filteredCount) {
    return {
      value: "Case still open",
      detail: "Choose one concern, budget, or retailer to start the working path.",
    };
  }
  if (metrics.activeLane?.label) {
    return {
      value: `${metrics.activeLane.label} case`,
      detail: `${metrics.filteredCount.toLocaleString()} fixture matches are already grouped under the current starting case.`,
    };
  }
  if (state.concern !== "all") {
    return {
      value: `${titleCase(state.concern)} case`,
      detail: `${metrics.filteredCount.toLocaleString()} fixture matches are already grouped under the current starting case.`,
    };
  }
  return {
    value: "Concern-first case",
    detail: "Begin from the cleanest case before widening the decision.",
  };
}

export function getCatalogShellShortlistSummary(metrics) {
  if (!metrics.savedProducts.length) {
    return {
      value: "No saved picks",
      detail: isCatalogDecisionReady()
        ? "Save the current leader to start a real decision set."
        : "Save a starting point only when it is useful as a reference.",
    };
  }
  if (isShortlistExploratoryHandoff(metrics.savedProducts)) {
    return {
      value: `${metrics.savedProducts.length} saved`,
      detail: "Saved as a broad reference. Choose a product type, concern, ingredient, lane, or specific search before ranking it.",
    };
  }
  if (metrics.decisionState.championProduct && metrics.decisionState.backupProduct) {
    return {
      value: `${metrics.savedProducts.length} saved`,
      detail: "Champion + backup stay attached to the current case.",
    };
  }
  if (metrics.decisionState.championProduct) {
    return {
      value: `${metrics.savedProducts.length} saved`,
      detail: "Champion is set. Backup still needs to open.",
    };
  }
  return {
    value: `${metrics.savedProducts.length} saved`,
    detail: "Promote one saved product to champion next.",
  };
}

export function getShortlistShellBackupSummary(metrics) {
  if (metrics.decisionState.backupProduct) {
    return {
      value: "Backup ready",
      detail: `${metrics.decisionState.backupProduct.brand} stays visible as the secondary option.`,
    };
  }
  return {
    value: "Backup open",
    detail: "Keep one secondary option visible before approval.",
  };
}

export function getShortlistShellBuyPathSummary(metrics) {
  if (metrics.shortlistPayload?.oneStoreBasket?.retailer) {
    return {
      value: `${titleCase(metrics.shortlistPayload.oneStoreBasket.retailer)} basket`,
      detail: "One-store path is close to checkout.",
    };
  }
  return {
    value: "Buy path open",
    detail: "Retailer pressure still needs to settle the checkout path.",
  };
}

export function getShellRailData(renderContext = null) {
  const view = Object.hasOwn(SHELL_VIEW_CONTEXT, state.ui.activeShellView) ? state.ui.activeShellView : "overview";
  const metrics = getShellRenderMetrics(renderContext);
  const savedProfile = metrics.savedProfile || getSavedUserProfileRecord();
  const lensTitle = savedProfile.profile === "all" ? "Broad view" : getProfileLabel(savedProfile.profile);
  const caseSummary = getCatalogCommandCaseSummary(metrics.activeLane, metrics.filteredCount, metrics.totalPages);

  if (view === "overview") {
    const startingCaseSummary = getOverviewShellStartingCase(metrics);
    return {
      label: "Case",
      items: [startingCaseSummary.value, lensTitle],
    };
  }

  if (view === "workspace") {
    const decisionReady = isCatalogDecisionReady();
    const candidateItem = !decisionReady
      ? "Choose focus"
      : metrics.decisionState.championProduct
        ? `Champion: ${metrics.decisionState.championProduct.brand}`
        : metrics.leadProduct
          ? `Candidate: ${metrics.leadProduct.brand}`
          : "Find candidate";
    return {
      label: "Case",
      items: [
        caseSummary.value,
        candidateItem,
        `${metrics.savedProducts.length} saved`,
      ],
    };
  }

  if (view === "shortlist") {
    const buyPathSummary = getShortlistShellBuyPathSummary(metrics);
    const exploratoryHandoff = isShortlistExploratoryHandoff(metrics.savedProducts);
    return {
      label: "Decision",
      items: [
        exploratoryHandoff
          ? "Focus open"
          : metrics.decisionState.championProduct
            ? `Champion: ${metrics.decisionState.championProduct.brand}`
            : "Champion open",
        buyPathSummary.value,
      ],
    };
  }

  return {
    label: "Scope",
    items: [
      caseSummary.value,
      metrics.filteredCount ? `${metrics.filteredCount.toLocaleString()} match${metrics.filteredCount === 1 ? "" : "es"}` : "Tighten case",
    ],
  };
}

export function renderShellChrome(renderContext = null) {
  const view = Object.hasOwn(SHELL_VIEW_CONTEXT, state.ui.activeShellView) ? state.ui.activeShellView : "overview";
  const context = SHELL_VIEW_CONTEXT[view] || SHELL_VIEW_CONTEXT.overview;
  const railData = getShellRailData(renderContext);

  if (workspaceSupernavShell) {
    workspaceSupernavShell.dataset.activeView = view;
  }
  if (workModeCaseHeader) {
    workModeCaseHeader.dataset.activeView = view;
  }
  if (workModeCasebar) {
    workModeCasebar.dataset.activeView = view;
  }
  if (workspaceActiveTitle) {
    workspaceActiveTitle.textContent = context.title;
  }
  if (workspaceActiveChip) {
    workspaceActiveChip.textContent = context.chip;
  }
  if (workspaceActiveNote) {
    workspaceActiveNote.textContent = context.note;
  }
  if (workspaceShellRailLabel) {
    workspaceShellRailLabel.textContent = railData.label;
  }
  if (workspaceShellRailPrimary) {
    workspaceShellRailPrimary.textContent = railData.items[0] || "";
  }
  if (workspaceShellRailSecondary) {
    workspaceShellRailSecondary.textContent = railData.items[1] || "";
  }
  if (workspaceShellRailTertiary) {
    workspaceShellRailTertiary.textContent = railData.items[2] || "";
  }
}

export function getBrowseLaneByKey(laneKey) {
  return BROWSE_LANES.find((lane) => lane.key === laneKey) || null;
}

export function getActiveBrowseLane() {
  return getBrowseLaneByKey(state.browseLaneKey);
}

export function getProductIngredientSet(product) {
  return new Set((product.ingredients || []).map((ingredient) => String(ingredient).toLowerCase()));
}

export function getStrongActiveCount(product) {
  return [...getProductIngredientSet(product)].filter((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)).length;
}

export function isSensitiveSafeProduct(product) {
  const lowerIngredients = getProductIngredientSet(product);
  const barrierIngredientCount = [...lowerIngredients].filter((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient)).length;
  const fragranceFree = lowerIngredients.has("fragrance-free");
  const strongActiveCount = getStrongActiveCount(product);
  const calmerCategory = ["cleanser", "moisturizer", "sunscreen", "mask"].includes(product.category);
  const highActivesCategory = ["treatment", "toner"].includes(product.category);
  if (fragranceFree && strongActiveCount <= 1) return true;
  if (barrierIngredientCount >= 2 && strongActiveCount === 0) return true;
  if (calmerCategory && barrierIngredientCount >= 1 && !highActivesCategory && strongActiveCount === 0) return true;
  return false;
}

export function getBrowseLaneScopeProducts(lane, options = {}) {
  const { respectRetailer = true } = options;
  const cacheKey = `${getProductsRevisionKey()}::${respectRetailer ? state.retailer : "*"}::${lane?.key || ""}`;
  const cached = derivedRenderCache.browseLaneScope.get(cacheKey);
  if (cached) {
    return cached;
  }

  const products = state.products.filter((product) => {
    if (respectRetailer && state.retailer !== "all" && product.retailer !== state.retailer) return false;
    return browseLaneMatchesProduct(product, lane);
  });
  derivedRenderCache.browseLaneScope.set(cacheKey, products);
  return products;
}

export function scoreBrowseLaneProduct(product, lane) {
  let score = scoreBestOverall(product);
  const lowerIngredients = getProductIngredientSet(product);

  if (lane.primaryConcern && product.concerns.includes(lane.primaryConcern)) score += 2.2;
  if (lane.concernsAny?.some((concern) => product.concerns.includes(concern))) score += 1.2;
  if (lane.ingredientsAny?.some((ingredient) => lowerIngredients.has(ingredient))) score += 1.5;
  if (lane.sensitiveSafe && isSensitiveSafeProduct(product)) score += 2;
  if (typeof product.rating === "number") score += product.rating / 4;
  if (typeof product.reviewCount === "number") score += Math.min(2.4, product.reviewCount / 500);
  if (hasCatalogRetailerCheckSignal(product)) score += 0.4;
  if (lane.maxPrice != null && typeof product.price === "number") {
    score += Math.max(0, (lane.maxPrice - product.price) / 20);
  }

  return score;
}

export function getBrowseLaneLeadProduct(lane) {
  return [...getBrowseLaneScopeProducts(lane)]
    .sort(
      (a, b) =>
        scoreBrowseLaneProduct(b, lane) - scoreBrowseLaneProduct(a, lane) ||
        (b.reviewCount ?? -1) - (a.reviewCount ?? -1) ||
        (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER),
    )[0] || null;
}

export function clearBrowseLaneSelection(options = {}) {
  const { resetSort = false } = options;
  const activeLane = getActiveBrowseLane();
  const shouldResetSort = resetSort || Boolean(activeLane?.sort && state.sort === activeLane.sort);
  state.browseLaneKey = null;
  if (shouldResetSort) {
    state.sort = "relevance";
    if (sortFilter) sortFilter.value = state.sort;
  }
}

export function money(value) {
  return typeof value === "number" ? `$${value.toFixed(2)} · synthetic fixture` : "Price unavailable";
}

export function qualifySyntheticAvailability(value) {
  const label = String(value || "").trim();
  if (!label) return "Fixture availability mixed";
  return /synthetic fixture/i.test(label) ? label : `${label} · synthetic fixture`;
}

export function formatOfferAvailability(value, detail = null) {
  const label = typeof detail?.label === "string" ? detail.label.trim() : "";
  if (label) return qualifySyntheticAvailability(label);
  if (value === "in_stock") return "In stock · synthetic fixture";
  if (value === "out_of_stock") return "Out of stock · synthetic fixture";
  return "Fixture availability mixed";
}

export function deriveAvailabilityDetail(entry = {}) {
  if (entry?.availabilityDetail && typeof entry.availabilityDetail === "object") {
    return entry.availabilityDetail;
  }
  if (entry?.availabilityState === "in_stock") {
    return {
      state: "available",
      group: "available_now",
      label: "Available · synthetic fixture",
    };
  }
  if (entry?.availabilityState === "out_of_stock") {
    return {
      state: "out_of_stock",
      group: "not_available",
      label: "Out of stock · synthetic fixture",
    };
  }
  return {
    state: "unknown",
    group: "unknown",
    label: "Fixture availability mixed",
  };
}

export function getOfferAvailabilityGroup(entry) {
  return entry?.availabilityDetail?.group || "unknown";
}

export function formatCompactTimestamp(value) {
  const date = parseTimestamp(value);
  if (!date) return "Unknown";
  const dateLabel = date.toLocaleDateString([], { month: "short", day: "numeric" });
  const timeLabel = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${dateLabel}, ${timeLabel}`;
}

export function getRetailerOfferHistoryCue(entry) {
  if (entry?.trust?.history?.backInStock) {
    return "Back in stock · synthetic fixture.";
  }

  if (entry?.availabilityDetail?.state === "limited_stock") {
    return "Limited stock · synthetic fixture.";
  }

  if (entry?.availabilityDetail?.state === "backorder") {
    return "Available on backorder · synthetic fixture.";
  }

  if (entry?.availabilityDetail?.state === "preorder") {
    return "Available for preorder · synthetic fixture.";
  }

  if (entry?.availabilityDetail?.state === "discontinued") {
    return "Marked discontinued in the latest synthetic fixture check.";
  }

  if (typeof entry.price === "number" && typeof entry.previousPrice === "number" && entry.previousPrice > entry.price) {
    return `Fixture price dropped from ${money(entry.previousPrice)}.`;
  }

  if (typeof entry.price === "number" && typeof entry.previousPrice === "number" && entry.previousPrice < entry.price) {
    return `Price rose from ${money(entry.previousPrice)}.`;
  }

  if (typeof entry.price === "number" && typeof entry.lowestPrice === "number" && Math.abs(entry.lowestPrice - entry.price) < 0.005) {
    return "At the lowest tracked fixture price.";
  }

  if (typeof entry.price === "number" && typeof entry.lowestPrice === "number" && entry.price > entry.lowestPrice + 0.005) {
    return "Above the lowest tracked fixture price.";
  }

  if (entry.availabilityState === "in_stock" && entry.lastSeenAt) {
    return "Seen in stock in the latest synthetic fixture check.";
  }

  return "";
}

export function getPreviousOfferAvailabilityLabel(entry) {
  if (!entry || typeof entry !== "object") return "";
  if (entry.previousAvailabilityDetail?.label) {
    return qualifySyntheticAvailability(entry.previousAvailabilityDetail.label);
  }
  if (entry.trust?.history?.previousAvailabilityLabel) {
    return qualifySyntheticAvailability(entry.trust.history.previousAvailabilityLabel);
  }
  if (entry.previousAvailabilityState) {
    return formatOfferAvailability(entry.previousAvailabilityState, entry.previousAvailabilityDetail);
  }
  return "";
}

export function getRetailerOfferRecentHistory(entry) {
  if (!Array.isArray(entry?.recentHistory)) return [];
  const seen = new Set();
  return entry.recentHistory
    .map((historyEntry) => {
      if (!historyEntry || typeof historyEntry !== "object") return null;
      const observedAt = typeof historyEntry.observedAt === "string" ? historyEntry.observedAt : "";
      const key = `${observedAt}|${historyEntry.price ?? ""}|${historyEntry.availabilityState || ""}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return {
        observedAt,
        price: typeof historyEntry.price === "number" ? historyEntry.price : null,
        availabilityState: typeof historyEntry.availabilityState === "string" ? historyEntry.availabilityState : "",
        availabilityDetail: historyEntry.availabilityDetail && typeof historyEntry.availabilityDetail === "object"
          ? historyEntry.availabilityDetail
          : null,
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

export function renderRetailerOfferRecentHistory(entry) {
  const recentHistory = getRetailerOfferRecentHistory(entry);
  if (!recentHistory.length) return "";
  return `
    <div class="compare-history-timeline" aria-label="Recent price and stock checks">
      <dt>Recent checks</dt>
      <dd>
        <ol>
          ${recentHistory
            .map((historyEntry, index) => {
              const priceLabel = typeof historyEntry.price === "number" ? money(historyEntry.price) : "Price unavailable";
              const availabilityLabel = formatOfferAvailability(historyEntry.availabilityState, historyEntry.availabilityDetail);
              return `
                <li>
                  <strong>${index === 0 ? "Latest" : formatCompactTimestamp(historyEntry.observedAt)}</strong>
                  <span>${priceLabel} · ${escapeHtml(availabilityLabel)}</span>
                </li>
              `;
            })
            .join("")}
        </ol>
      </dd>
    </div>
  `;
}

export function renderRetailerOfferHistory(entry) {
  const historyRows = [];
  const historyCue = getRetailerOfferHistoryCue(entry);
  const recentHistoryMarkup = renderRetailerOfferRecentHistory(entry);

  if (typeof entry.previousPrice === "number" && entry.previousPrice !== entry.price) {
    historyRows.push(`
      <div class="compare-history-row">
        <dt>Previous price</dt>
        <dd>${money(entry.previousPrice)}</dd>
      </div>
    `);
  }

  if (typeof entry.lowestPrice === "number") {
    historyRows.push(`
      <div class="compare-history-row">
        <dt>Lowest seen</dt>
        <dd>${money(entry.lowestPrice)}</dd>
      </div>
    `);
  }

  if (entry.availabilityState) {
    const currentAvailabilityLabel = formatOfferAvailability(entry.availabilityState, entry.availabilityDetail);
    historyRows.push(`
      <div class="compare-history-row">
        <dt>Stock state</dt>
        <dd>${escapeHtml(currentAvailabilityLabel)}</dd>
      </div>
    `);
    const previousAvailabilityLabel = getPreviousOfferAvailabilityLabel(entry);
    if (previousAvailabilityLabel && previousAvailabilityLabel !== currentAvailabilityLabel) {
      historyRows.push(`
        <div class="compare-history-row">
          <dt>Previous stock</dt>
          <dd>${escapeHtml(previousAvailabilityLabel)}</dd>
        </div>
      `);
    }
  }

  if (
    typeof entry.price === "number" &&
    typeof entry.lowestPrice === "number" &&
    entry.price > entry.lowestPrice + 0.005
  ) {
    historyRows.push(`
      <div class="compare-history-row">
        <dt>Above low</dt>
        <dd>+${money(entry.price - entry.lowestPrice)}</dd>
      </div>
    `);
  }

  if (entry.lastSeenAt) {
    historyRows.push(`
      <div class="compare-history-row">
        <dt>Last seen</dt>
        <dd>${formatCompactTimestamp(entry.lastSeenAt)}</dd>
      </div>
    `);
  }

  if (entry.firstSeenAt) {
    historyRows.push(`
      <div class="compare-history-row">
        <dt>Tracking since</dt>
        <dd>${formatCompactTimestamp(entry.firstSeenAt)}</dd>
      </div>
    `);
  }

  const trustRows = [];
  if (entry?.trust?.freshness?.lastVerifiedAt && entry.trust.freshness.lastVerifiedAt !== entry.lastSeenAt) {
    trustRows.push(`
      <div class="compare-history-row">
        <dt>Verified</dt>
        <dd>${formatCompactTimestamp(entry.trust.freshness.lastVerifiedAt)}</dd>
      </div>
    `);
  } else if (entry?.trust?.freshness?.refreshedAt && entry.trust.freshness.refreshedAt !== entry.lastSeenAt) {
    trustRows.push(`
      <div class="compare-history-row">
        <dt>Refreshed</dt>
        <dd>${formatCompactTimestamp(entry.trust.freshness.refreshedAt)}</dd>
      </div>
    `);
  }

  if (entry?.trust?.sourceSummary?.label) {
    trustRows.push(`
      <div class="compare-history-row">
        <dt>Source</dt>
        <dd>${escapeHtml(entry.trust.sourceSummary.label)}</dd>
      </div>
    `);
  }

  if (!historyRows.length && !trustRows.length && !historyCue && !recentHistoryMarkup) return "";

  return `
    <dl class="compare-history" aria-label="Demo offer history">
      ${historyCue ? `<div class="compare-history-note">${escapeHtml(historyCue)}</div>` : ""}
      ${historyRows.join("")}
      ${recentHistoryMarkup}
      ${trustRows.join("")}
    </dl>
  `;
}

export function getTrustSignalLabels(entity, allowedKeys = [], limit = 3) {
  const signals = Array.isArray(entity?.trust?.signals) ? entity.trust.signals : [];
  const allowed = allowedKeys.length ? new Set(allowedKeys) : null;
  const labels = [];
  signals.forEach((signal) => {
    if (!signal?.label) return;
    if (allowed && !allowed.has(signal.key)) return;
    const neutralLabel = {
      "review-supported": "synthetic review sample",
      "retailer-confirmed": "fixture overlap",
      "retailer-confirmed match": "fixture overlap",
      "recently-verified": "fixture timestamp",
    }[String(signal.label).trim().toLowerCase()] || signal.label;
    if (labels.includes(neutralLabel)) return;
    labels.push(neutralLabel);
  });
  return labels.slice(0, limit);
}

export function getTrustMetaParts(trust, options = {}) {
  const {
    includeMatch = true,
    includeFreshness = true,
    includeSource = true,
  } = options;
  const parts = [];
  if (includeMatch && trust?.match?.label) {
    parts.push(trust.match.label);
  }
  if (includeFreshness && trust?.freshness?.lastVerifiedAt) {
    parts.push(`Verified ${formatCompactTimestamp(trust.freshness.lastVerifiedAt)}`);
  } else if (includeFreshness && trust?.freshness?.refreshedAt) {
    parts.push(`Refreshed ${formatCompactTimestamp(trust.freshness.refreshedAt)}`);
  }
  if (includeSource && trust?.sourceSummary?.label) {
    parts.push(trust.sourceSummary.label);
  }
  return parts.slice(0, 3);
}

export function renderTrustMetaMarkup(trust, className = "tracked-alert-trust", options = {}) {
  const parts = getTrustMetaParts(trust, options);
  if (!parts.length) return "";
  return `<p class="${className}">${parts.map((part) => escapeHtml(part)).join(" · ")}</p>`;
}

export function titleCase(value) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatStarDisplay(rating) {
  if (typeof rating !== "number") return "";
  const rounded = Math.round(rating * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0;
  return `${"★".repeat(full)}${half ? "½" : ""}${"☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}`;
}

export function formatReviewCount(reviewCount) {
  if (typeof reviewCount !== "number") return "";
  return `${reviewCount.toLocaleString()} synthetic fixture review${reviewCount === 1 ? "" : "s"}`;
}

export function formatRatingLine(product) {
  if (typeof product.rating !== "number") return "";
  const reviewText = formatReviewCount(product.reviewCount);
  return `${product.rating.toFixed(1)} synthetic fixture rating${reviewText ? ` · ${reviewText}` : ""}`;
}

export function formatCompactRatingLine(product) {
  if (typeof product.rating !== "number") return "";
  const reviewText = formatReviewCount(product.reviewCount);
  return `${product.rating.toFixed(1)}★ synthetic fixture${reviewText ? ` · ${reviewText}` : ""}`;
}

export function mergeRatings(products, ratingsPayload) {
  const ratings = ratingsPayload?.ratings || {};
  return products.map((product) => ({
    ...product,
    rating: ratings[product.id]?.rating ?? product.rating ?? null,
    reviewCount: ratings[product.id]?.reviewCount ?? product.reviewCount ?? null,
    ratingSource: ratings[product.id]?.ratingSource ?? product.ratingSource ?? null,
    ratingFetchedAt: ratings[product.id]?.ratingFetchedAt ?? product.ratingFetchedAt ?? null,
  }));
}

export function normalizeArticle(article) {
  const preview = article.preview || article.summary || "Read the latest guide.";
  const sourceUrl = article.url || article.sourceUrl || "";
  const sections =
    Array.isArray(article.sections) && article.sections.length
      ? article.sections
      : [
          {
            heading: "Why it matters",
            body: article.summary || article.preview || "This guide is available in the library, but the live source returned a thinner article shape.",
          },
          {
            heading: "Read the full guide",
            body: sourceUrl ? `Open the source guide for the full retailer article.` : "Open the guide source when available for more detail.",
          },
        ];

  return {
    ...article,
    url: sourceUrl,
    preview,
    sections,
  };
}

export function resolveArticleSelection(preferredGroup = state.articleGroup, preferredArticleId = state.articleId) {
  const selectedArticle = articleCatalog.find((entry) => entry.id === preferredArticleId) || null;
  const nextGroup = articleCatalog.some((entry) => entry.group === preferredGroup)
    ? preferredGroup
    : selectedArticle?.group || articleCatalog[0]?.group || FALLBACK_ARTICLES[0]?.group || "skincare";
  const visibleArticles = articleCatalog.filter((entry) => entry.group === nextGroup);
  const article =
    visibleArticles.find((entry) => entry.id === preferredArticleId) ||
    visibleArticles[0] ||
    selectedArticle ||
    articleCatalog[0] ||
    FALLBACK_ARTICLES[0] ||
    null;

  return {
    group: nextGroup,
    visibleArticles,
    article,
  };
}

export function estimateReadTime(article) {
  const text = [
    article.title,
    article.summary,
    ...(article.sections || []).flatMap((section) => [section.heading, section.body || "", ...(section.bullets || [])]),
  ]
    .join(" ")
    .trim();
  const words = text ? text.split(/\s+/).length : 0;
  return `${Math.max(2, Math.ceil(words / 180))} min read`;
}

export function inferArticleTags(article) {
  const text = `${article.title} ${article.summary}`.toLowerCase();
  const tags = [titleCase(article.group)];
  const mapping = [
    ["acne", "Acne"],
    ["dry", "Dryness"],
    ["scalp", "Scalp"],
    ["hair", "Hair"],
    ["barrier", "Barrier"],
    ["spot", "Dark Spots"],
    ["vitamin c", "Vitamin C"],
    ["spf", "SPF"],
    ["routine", "Routine"],
    ["damage", "Damage"],
  ];
  mapping.forEach(([needle, label]) => {
    if (text.includes(needle) && !tags.includes(label)) {
      tags.push(label);
    }
  });
  return tags.slice(0, 4);
}

export function extractIngredients(product) {
  const text = [product.name, product.description, product.category, ...(product.concerns || [])]
    .join(" ")
    .toLowerCase();
  return Object.entries(INGREDIENT_RULES)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([ingredient]) => ingredient);
}

export function sanitizeProductIngredients(product, ingredients) {
  return [...new Set((ingredients || []).filter(Boolean))].filter(
    (ingredient) => ingredient !== "spf" || isSunProtectionProduct(product),
  );
}

export function buildProductSearchText(product, ingredients = []) {
  return [
    product.brand,
    product.name,
    product.category,
    product.description,
    product.retailer,
    ...(product.concerns || []),
    ...ingredients,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function decorateProducts(products) {
  return products.map((product) => {
    const ingredients =
      Array.isArray(product.ingredients) && product.ingredients.length
        ? product.ingredients
        : extractIngredients(product);
    const normalizedIngredients = sanitizeProductIngredients(product, ingredients);
    return {
      ...product,
      ingredients: normalizedIngredients,
      searchText: buildProductSearchText(product, normalizedIngredients),
    };
  });
}

const SEARCH_INGREDIENT_ALIASES = {
  "vitamin c": [
    "vitamin c",
    "vit c",
    "vit-c",
    "ascorbic acid",
    "l ascorbic acid",
    "l-ascorbic acid",
    "ascorbate",
    "tetrahexyldecyl ascorbate",
  ],
  retinol: ["retinol", "retinal", "retinoid", "retinaldehyde", "bio retinol", "bio-retinol"],
  "salicylic acid": ["salicylic acid", "salicylic", "bha", "beta hydroxy acid"],
  niacinamide: ["niacinamide", "vitamin b3", "vit b3"],
  "hyaluronic acid": ["hyaluronic acid", "sodium hyaluronate", "hyaluronic"],
  ceramides: ["ceramides", "ceramide"],
  "glycolic acid": ["glycolic acid", "glycolic"],
  "lactic acid": ["lactic acid"],
  peptides: ["peptides", "peptide", "collagen"],
  squalane: ["squalane"],
  spf: ["spf", "sunscreen", "sun protection", "uv defense"],
  "fragrance-free": ["fragrance-free", "fragrance free", "no fragrance"],
  "azelaic acid": ["azelaic acid", "azelaic"],
  "benzoyl peroxide": ["benzoyl peroxide"],
  bakuchiol: ["bakuchiol"],
  "tranexamic acid": ["tranexamic acid", "tranexamic"],
  "kojic acid": ["kojic acid", "kojic"],
  caffeine: ["caffeine", "guarana"],
  "green tea": ["green tea"],
  centella: ["centella", "centella asiatica", "madecassoside"],
  urea: ["urea"],
  zinc: ["zinc"],
  sulfur: ["sulfur"],
  hydroquinone: ["hydroquinone"],
};

const SEARCH_PRODUCT_TYPE_ALIASES = [
  {
    category: "cleanser",
    aliases: ["cleanser", "cleansers", "cleanse", "cleansing", "face wash", "facial wash", "gel wash", "foaming wash"],
    compatible: [],
  },
  {
    category: "serum",
    aliases: ["serum", "serums", "drops", "booster", "ampoule", "face oil", "facial oil"],
    compatible: ["treatment"],
  },
  {
    category: "treatment",
    aliases: ["treatment", "treatments", "exfoliant", "exfoliator", "peel", "pads", "spot treatment"],
    compatible: ["serum", "toner"],
  },
  {
    category: "moisturizer",
    aliases: ["moisturizer", "moisturiser", "cream", "lotion", "face cream", "facial cream", "balm"],
    compatible: [],
  },
  {
    category: "sunscreen",
    aliases: ["sunscreen", "spf", "sun protection", "uv defense", "sun cream"],
    compatible: [],
  },
  {
    category: "toner",
    aliases: ["toner", "essence", "mist"],
    compatible: ["treatment"],
  },
  {
    category: "mask",
    aliases: ["mask", "masque", "sheet mask"],
    compatible: [],
  },
  {
    category: "eye care",
    aliases: ["eye cream", "eye serum", "eye mask", "eye treatment"],
    compatible: [],
  },
  {
    category: "body care",
    aliases: ["body lotion", "body cream", "body serum", "body wash", "body care"],
    compatible: [],
  },
];

const SEARCH_CONCERN_ALIASES = {
  acne: ["acne", "breakout", "breakouts", "blemish", "blemishes", "pimple", "pimples"],
  pores: ["pores", "pore", "blackhead", "blackheads", "congestion", "congested"],
  dryness: ["dryness", "dry skin", "dehydrated", "hydrate", "hydration", "barrier"],
  redness: ["redness", "red skin", "sensitive", "sensitivity", "irritation", "calm", "soothing"],
  texture: ["texture", "roughness", "rough skin", "resurfacing", "smooth"],
  "dark spots": ["dark spots", "dark spot", "hyperpigmentation", "pigment", "pigmentation", "uneven tone", "brightening"],
  dullness: ["dullness", "dull", "glow", "radiance", "brighten"],
  wrinkles: ["wrinkles", "wrinkle", "fine lines", "lines", "firming", "anti aging", "anti-aging"],
  "general care": ["general care", "maintenance", "daily care"],
};

const SEARCH_STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "into",
  "skin",
  "skincare",
  "the",
  "this",
  "that",
  "with",
  "without",
  "your",
]);

const catalogSearchIntentCache = new Map();

export function normalizeCatalogSearchText(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bvit[\s./-]*c\b/g, "vitamin c")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9%]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCatalogSearchTokens(value = "") {
  const normalized = normalizeCatalogSearchText(value);
  if (!normalized) return [];
  return normalized
    .split(" ")
    .map((token) => token.trim())
    .filter((token, index, tokens) => token.length >= 3 && !SEARCH_STOP_WORDS.has(token) && tokens.indexOf(token) === index);
}

function escapeCatalogSearchRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function catalogSearchIncludesPhrase(text, phrase) {
  const normalizedText = normalizeCatalogSearchText(text);
  const normalizedPhrase = normalizeCatalogSearchText(phrase);
  if (!normalizedText || !normalizedPhrase) return false;
  const pattern = normalizedPhrase
    .split(" ")
    .map((part) => escapeCatalogSearchRegExp(part))
    .join("\\s+");
  return new RegExp(`(?:^|\\s)${pattern}(?:\\s|$)`).test(normalizedText);
}

function uniqueCatalogSearchValues(values) {
  return [...new Set((values || []).map((value) => normalizeCatalogSearchText(value)).filter(Boolean))];
}

function getCatalogSearchIngredientEntries() {
  const aliasesByIngredient = new Map();
  const addAliases = (ingredient, aliases) => {
    const normalizedIngredient = normalizeCatalogSearchText(ingredient);
    if (!normalizedIngredient) return;
    const nextAliases = aliasesByIngredient.get(normalizedIngredient) || [];
    nextAliases.push(normalizedIngredient, ...(Array.isArray(aliases) ? aliases : []));
    aliasesByIngredient.set(normalizedIngredient, uniqueCatalogSearchValues(nextAliases));
  };

  Object.entries(SEARCH_INGREDIENT_ALIASES).forEach(([ingredient, aliases]) => addAliases(ingredient, aliases));
  Object.entries(INGREDIENT_RULES || {}).forEach(([ingredient, aliases]) => addAliases(ingredient, aliases));

  return [...aliasesByIngredient.entries()].map(([ingredient, aliases]) => ({
    ingredient,
    aliases: uniqueCatalogSearchValues(aliases).sort((left, right) => right.length - left.length || left.localeCompare(right)),
  }));
}

function getCatalogSearchAliasesForIngredient(ingredient) {
  const normalizedIngredient = normalizeCatalogSearchText(ingredient);
  return getCatalogSearchIngredientEntries().find((entry) => entry.ingredient === normalizedIngredient)?.aliases || [normalizedIngredient];
}

function findCatalogSearchPhraseMatches(text, aliases) {
  const normalizedText = normalizeCatalogSearchText(text);
  if (!normalizedText) return [];
  return (aliases || []).filter((alias) => catalogSearchIncludesPhrase(normalizedText, alias));
}

export function getCatalogSearchIntent(query = "") {
  const normalizedQuery = normalizeCatalogSearchText(query);
  if (!normalizedQuery) {
    return {
      rawQuery: String(query || ""),
      normalizedQuery: "",
      ingredients: [],
      ingredientAliases: [],
      ingredientAliasMap: {},
      productTypes: [],
      compatibleProductTypes: [],
      concerns: [],
      tokens: [],
      hasStrongIntent: false,
    };
  }

  if (catalogSearchIntentCache.has(normalizedQuery)) {
    return {
      ...catalogSearchIntentCache.get(normalizedQuery),
      rawQuery: String(query || ""),
    };
  }

  const ingredients = [];
  const ingredientAliases = [];
  const ingredientAliasMap = {};
  getCatalogSearchIngredientEntries().forEach(({ ingredient, aliases }) => {
    ingredientAliasMap[ingredient] = aliases;
    const alias = aliases.find((candidate) => catalogSearchIncludesPhrase(normalizedQuery, candidate));
    if (!alias) return;
    ingredients.push(ingredient);
    if (alias !== ingredient) {
      ingredientAliases.push({ ingredient, alias });
    }
  });

  const productTypes = [];
  const compatibleProductTypes = [];
  SEARCH_PRODUCT_TYPE_ALIASES.forEach((entry) => {
    const aliases = uniqueCatalogSearchValues(entry.aliases);
    if (!aliases.some((alias) => catalogSearchIncludesPhrase(normalizedQuery, alias))) return;
    productTypes.push(entry.category);
    compatibleProductTypes.push(...(entry.compatible || []));
  });

  const concerns = [];
  Object.entries(SEARCH_CONCERN_ALIASES).forEach(([concern, aliases]) => {
    if (uniqueCatalogSearchValues([concern, ...(aliases || [])]).some((alias) => catalogSearchIncludesPhrase(normalizedQuery, alias))) {
      concerns.push(concern);
    }
  });

  const intent = {
    rawQuery: String(query || ""),
    normalizedQuery,
    ingredients: uniqueCatalogSearchValues(ingredients),
    ingredientAliases,
    ingredientAliasMap,
    productTypes: uniqueCatalogSearchValues(productTypes),
    compatibleProductTypes: uniqueCatalogSearchValues(compatibleProductTypes),
    concerns: uniqueCatalogSearchValues(concerns),
    tokens: getCatalogSearchTokens(normalizedQuery),
    hasStrongIntent: Boolean(ingredients.length || productTypes.length || concerns.length),
  };

  catalogSearchIntentCache.set(normalizedQuery, intent);
  if (catalogSearchIntentCache.size > 30) {
    catalogSearchIntentCache.delete(catalogSearchIntentCache.keys().next().value);
  }
  return intent;
}

export function getCatalogSearchBackendQuery(query = "") {
  const intent = getCatalogSearchIntent(query);
  if (intent.ingredients.length && intent.productTypes.length) {
    return `${intent.ingredients[0]} ${intent.productTypes[0]}`;
  }
  if (intent.ingredients.length) return intent.ingredients[0];
  if (intent.productTypes.length) return intent.productTypes[0];
  if (intent.concerns.length) return intent.concerns[0];
  return intent.normalizedQuery;
}

function getProductSearchFields(product) {
  const ingredients = Array.isArray(product?.ingredients) ? product.ingredients : [];
  const concerns = Array.isArray(product?.concerns) ? product.concerns : [];
  const titleText = normalizeCatalogSearchText([product?.brand, product?.name].filter(Boolean).join(" "));
  const nameText = normalizeCatalogSearchText(product?.name || "");
  const brandText = normalizeCatalogSearchText(product?.brand || "");
  const categoryText = normalizeCatalogSearchText(product?.category || "");
  const descriptionText = normalizeCatalogSearchText(product?.description || "");
  const retailerText = normalizeCatalogSearchText(product?.retailer || "");
  const searchText = normalizeCatalogSearchText(
    typeof product?.searchText === "string" && product.searchText
      ? product.searchText
      : buildProductSearchText(product || {}, ingredients),
  );
  const allText = normalizeCatalogSearchText(
    [
      titleText,
      categoryText,
      descriptionText,
      retailerText,
      ...concerns,
      ...ingredients,
      searchText,
    ].join(" "),
  );

  return {
    ingredients: uniqueCatalogSearchValues(ingredients),
    concerns: uniqueCatalogSearchValues(concerns),
    titleText,
    nameText,
    brandText,
    categoryText,
    descriptionText,
    retailerText,
    searchText,
    allText,
  };
}

function getCatalogSearchProductTypeEntry(category) {
  const normalizedCategory = normalizeCatalogSearchText(category);
  return SEARCH_PRODUCT_TYPE_ALIASES.find((entry) => entry.category === normalizedCategory) || null;
}

export function scoreCatalogSearchIntent(product, queryOrIntent = state.search) {
  const intent =
    queryOrIntent && typeof queryOrIntent === "object" && Object.prototype.hasOwnProperty.call(queryOrIntent, "normalizedQuery")
      ? queryOrIntent
      : getCatalogSearchIntent(queryOrIntent);
  const signals = {
    exactIngredients: [],
    ingredientAliases: [],
    productTypes: [],
    compatibleProductTypes: [],
    concerns: [],
    titlePhrase: false,
    weak: false,
  };
  if (!intent.normalizedQuery) return { total: 0, signals };

  const fields = getProductSearchFields(product);
  const ingredientSet = new Set(fields.ingredients);
  const concernSet = new Set(fields.concerns);
  let score = 0;
  let exactIngredientCount = 0;
  let aliasIngredientCount = 0;

  intent.ingredients.forEach((ingredient) => {
    const aliases = intent.ingredientAliasMap?.[ingredient] || getCatalogSearchAliasesForIngredient(ingredient);
    const titleAliasMatches = findCatalogSearchPhraseMatches(fields.titleText, aliases);
    const descriptionAliasMatches = findCatalogSearchPhraseMatches(fields.descriptionText, aliases);
    const searchAliasMatches = findCatalogSearchPhraseMatches(fields.searchText, aliases);

    if (ingredientSet.has(ingredient)) {
      exactIngredientCount += 1;
      signals.exactIngredients.push(ingredient);
      score += 90;
    } else if (titleAliasMatches.length || descriptionAliasMatches.length || searchAliasMatches.length) {
      aliasIngredientCount += 1;
      signals.ingredientAliases.push(ingredient);
      score += 56;
    }

    if (titleAliasMatches.length) score += 18;
    if (descriptionAliasMatches.length) score += 6;
  });

  let productTypeExact = false;
  let productTypeCompatible = false;
  intent.productTypes.forEach((category) => {
    const typeEntry = getCatalogSearchProductTypeEntry(category);
    const aliases = uniqueCatalogSearchValues([category, ...(typeEntry?.aliases || [])]);
    const titleTypeMatch = aliases.some((alias) => catalogSearchIncludesPhrase(fields.titleText, alias));

    if (fields.categoryText === category) {
      productTypeExact = true;
      signals.productTypes.push(category);
      score += 42;
    } else if ((typeEntry?.compatible || []).map((value) => normalizeCatalogSearchText(value)).includes(fields.categoryText)) {
      productTypeCompatible = true;
      signals.compatibleProductTypes.push(fields.categoryText);
      score += 26;
    }

    if (titleTypeMatch) score += 8;
  });

  if (exactIngredientCount && productTypeExact) score += 80;
  if (exactIngredientCount && productTypeCompatible) score += 52;
  if (aliasIngredientCount && productTypeExact) score += 44;
  if (intent.productTypes.length && !productTypeExact && !productTypeCompatible) score -= 22;

  intent.concerns.forEach((concern) => {
    const aliases = uniqueCatalogSearchValues([concern, ...(SEARCH_CONCERN_ALIASES[concern] || [])]);
    if (concernSet.has(concern)) {
      signals.concerns.push(concern);
      score += 24;
    } else if (
      aliases.some(
        (alias) => catalogSearchIncludesPhrase(fields.titleText, alias) || catalogSearchIncludesPhrase(fields.descriptionText, alias),
      )
    ) {
      signals.concerns.push(concern);
      score += 8;
    }
  });

  if (catalogSearchIncludesPhrase(fields.titleText, intent.normalizedQuery)) {
    signals.titlePhrase = true;
    score += 32;
  } else if (intent.tokens.length && intent.tokens.every((token) => catalogSearchIncludesPhrase(fields.titleText, token))) {
    score += 10;
  }

  if (catalogSearchIncludesPhrase(fields.brandText, intent.normalizedQuery)) score += 34;
  if (catalogSearchIncludesPhrase(fields.nameText, intent.normalizedQuery)) score += 30;
  if (catalogSearchIncludesPhrase(fields.retailerText, intent.normalizedQuery)) score += 12;
  if (fields.categoryText && catalogSearchIncludesPhrase(fields.categoryText, intent.normalizedQuery)) score += 16;

  const titleTokenMatches = intent.tokens.filter((token) => catalogSearchIncludesPhrase(fields.titleText, token));
  const descriptionTokenMatches = intent.tokens.filter((token) => catalogSearchIncludesPhrase(fields.descriptionText, token));
  const allTokenMatches = intent.tokens.filter((token) => catalogSearchIncludesPhrase(fields.allText, token));
  score += Math.min(12, titleTokenMatches.length * 3);
  score += Math.min(6, descriptionTokenMatches.length * 0.75);
  score += Math.min(4, allTokenMatches.length * 0.5);

  if (catalogSearchIncludesPhrase(fields.allText, intent.normalizedQuery)) {
    signals.weak = true;
    score += 7;
  } else if (fields.allText.includes(intent.normalizedQuery)) {
    signals.weak = true;
    score += 3;
  }

  if (
    intent.ingredients.includes("vitamin c") &&
    !signals.exactIngredients.includes("vitamin c") &&
    (catalogSearchIncludesPhrase(fields.allText, "multi vitamin") || fields.allText.includes("multivitamin"))
  ) {
    score -= 2;
  }

  return {
    total: Math.max(0, score),
    signals,
  };
}

export function matchesSearch(product, query) {
  if (!query) return true;
  const intent = getCatalogSearchIntent(query);
  const relevance = scoreCatalogSearchIntent(product, intent);
  if (intent.ingredients.length) {
    return Boolean(
      relevance.signals.exactIngredients.length ||
        relevance.signals.ingredientAliases.length ||
        relevance.signals.titlePhrase,
    );
  }
  return relevance.total > 0;
}

export function normalizeCatalogRankingConcern(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized && normalized !== "all" ? normalized : "all";
}

export function getBrowseLaneRankingConcern(lane = getActiveBrowseLane()) {
  if (!lane) return "all";
  return normalizeCatalogRankingConcern(
    lane.primaryConcern ||
      lane.concern ||
      (Array.isArray(lane.concernsAny) && lane.concernsAny.length ? lane.concernsAny[0] : "all"),
  );
}

export function uniqueCatalogCaseValues(values = []) {
  return [...new Set(
    (values || [])
      .map((value) => normalizeCatalogRankingConcern(value))
      .filter((value) => value && value !== "all"),
  )];
}

export function getCatalogConcernIngredients(concern) {
  const normalized = normalizeCatalogRankingConcern(concern);
  if (normalized === "all") return [];
  return uniqueCatalogCaseValues(CONCERN_STRATEGIES[normalized]?.lookFor || []);
}

export function getSearchIntentPrimaryConcern(intent = getCatalogSearchIntent(state.search)) {
  if (intent.concerns?.length) return intent.concerns[0];
  const ingredientSet = new Set(intent.ingredients || []);
  if (!ingredientSet.size) return null;
  const concernPriority = ["acne", "dark spots", "texture", "wrinkles", "redness", "dryness", "general care"];
  return concernPriority.find((concern) =>
    getCatalogConcernIngredients(concern).some((ingredient) => ingredientSet.has(ingredient)),
  ) || null;
}

export function normalizeCatalogGoalSource({
  goal = state.userProfile.goal,
  profile = state.profile || state.userProfile.profile,
  goalSource = state.userProfile.goalSource,
} = {}) {
  const normalizedGoal = normalizeCatalogRankingConcern(goal);
  const normalizedProfile = normalizeSkinProfile(profile || "all");
  const normalizedSource = String(goalSource || "").trim().toLowerCase();
  const knownSources = new Set(["profile", "saved-profile", "continuity-profile", "routine", "default"]);
  if (normalizedSource === "routine") {
    return normalizedProfile !== "all" ? "profile" : "routine";
  }
  if (normalizedSource === "default") {
    return normalizedProfile !== "all" ? "profile" : "default";
  }
  if (normalizedSource === "saved-profile" || normalizedSource === "continuity-profile") {
    if (normalizedProfile === "all" && (normalizedGoal === "all" || normalizedGoal === "dryness")) {
      return "default";
    }
    return normalizedSource;
  }
  if (normalizedSource === "profile") {
    if (normalizedProfile === "all" && (normalizedGoal === "all" || normalizedGoal === "dryness")) {
      return "default";
    }
    return "profile";
  }
  if (knownSources.has(normalizedSource)) return normalizedSource;
  if (normalizedProfile !== "all" || (normalizedGoal !== "all" && normalizedGoal !== "dryness")) {
    return "profile";
  }
  return "default";
}

export function hasCatalogLensContext({
  goal = state.userProfile.goal,
  profile = state.profile || state.userProfile.profile,
  goalSource = state.userProfile.goalSource,
} = {}) {
  const normalizedGoal = normalizeCatalogRankingConcern(goal);
  const normalizedProfile = normalizeSkinProfile(profile || "all");
  const normalizedSource = normalizeCatalogGoalSource({ goal, profile, goalSource });
  if (normalizedSource === "routine" || normalizedSource === "default") return false;
  if (normalizedProfile !== "all") return true;
  return normalizedGoal !== "all" && normalizedGoal !== "dryness";
}

export function isDefaultCatalogLensGoal(profileRecord = getSavedUserProfileRecord()) {
  const normalizedProfile = normalizeSkinProfile(profileRecord?.profile || "all");
  const normalizedGoal = normalizeCatalogRankingConcern(profileRecord?.goal || state.userProfile.goal || "dryness");
  const normalizedSource = normalizeCatalogGoalSource({
    goal: normalizedGoal,
    profile: normalizedProfile,
    goalSource: profileRecord?.goalSource || state.userProfile.goalSource,
  });
  return normalizedSource === "default" && normalizedProfile === "all" && normalizedGoal === "dryness";
}

export function getVisibleLensGoalLabel(profileRecord = getSavedUserProfileRecord()) {
  if (isDefaultCatalogLensGoal(profileRecord)) return "Goal not set";
  const normalizedGoal = normalizeCatalogRankingConcern(profileRecord?.goal || state.userProfile.goal || "general care");
  return titleCase(normalizedGoal === "all" ? "general care" : normalizedGoal);
}

export const CATALOG_DECISION_MODES = {
  BROAD_NEUTRAL: "broad-neutral",
  SOFT_PERSONALIZED_BROAD: "soft-personalized-broad",
  FOCUSED_DECISION: "focused-decision",
};

export function hasCatalogStrongSearchIntent(value = state.search) {
  const query = String(value || "").trim();
  if (!query) return false;
  return Boolean(getCatalogSearchIntent(query).hasStrongIntent);
}

export function hasCatalogActiveSearch(value = state.search) {
  return Boolean(String(value || "").trim());
}

export function hasCatalogFocusedDecisionAxis(context = getCatalogRankingContext()) {
  const strongSearchIntent =
    context?.type === "search"
      ? Boolean(context.searchIntent?.hasStrongIntent)
      : hasCatalogStrongSearchIntent(state.search);
  return Boolean(
    normalizeCatalogRankingConcern(state.category) !== "all" ||
      normalizeCatalogRankingConcern(state.concern) !== "all" ||
      normalizeCatalogRankingConcern(state.ingredient) !== "all" ||
      state.browseLaneKey ||
      context?.type === "browse-lane" ||
      context?.lane ||
      strongSearchIntent,
  );
}

export function getCatalogDecisionMode(context = getCatalogRankingContext()) {
  const rankingContext = context || getCatalogRankingContext();
  if (hasCatalogFocusedDecisionAxis(rankingContext) || rankingContext?.strongCaseIntent) {
    return CATALOG_DECISION_MODES.FOCUSED_DECISION;
  }
  if (!rankingContext?.isNeutral || hasCatalogLensContext()) {
    return CATALOG_DECISION_MODES.SOFT_PERSONALIZED_BROAD;
  }
  return CATALOG_DECISION_MODES.BROAD_NEUTRAL;
}

export function isCatalogBroadDecisionMode(context = getCatalogRankingContext()) {
  return getCatalogDecisionMode(context) !== CATALOG_DECISION_MODES.FOCUSED_DECISION;
}

export function buildCatalogCaseContext({
  type = "neutral",
  concern = null,
  concerns = [],
  ingredients = [],
  categories = [],
  label = "",
  sourceLabel = "",
  lane = null,
  searchIntent = null,
  goalSource = null,
  enforcesEligibility = false,
  strongCaseIntent = false,
} = {}) {
  const primaryConcern = normalizeCatalogRankingConcern(concern);
  const concernValues = uniqueCatalogCaseValues([primaryConcern, ...concerns]);
  const ingredientValues = uniqueCatalogCaseValues([
    ...ingredients,
    ...concernValues.flatMap((entry) => getCatalogConcernIngredients(entry)),
  ]);
  const categoryValues = uniqueCatalogCaseValues([
    ...categories,
    ...concernValues.flatMap((entry) => getGoalCategoryHints(entry)),
  ]);
  const normalizedProfile = normalizeSkinProfile(state.profile || state.userProfile.profile || "all");
  const profileConfig = SKIN_PROFILES[normalizedProfile] || null;
  const normalizedGoalSource = goalSource || normalizeCatalogGoalSource();
  const isNeutral = type === "neutral";
  const hasSignals = Boolean(concernValues.length || ingredientValues.length || categoryValues.length);
  return {
    type,
    concern: primaryConcern === "all" ? null : primaryConcern,
    primaryConcern: primaryConcern === "all" ? null : primaryConcern,
    concerns: concernValues,
    ingredients: ingredientValues,
    categories: categoryValues,
    label: label || sourceLabel || (primaryConcern !== "all" ? primaryConcern : "Broad catalog"),
    sourceLabel: sourceLabel || label || (primaryConcern !== "all" ? primaryConcern : "Broad catalog"),
    lane,
    searchIntent,
    profile: normalizedProfile,
    profileLabel: profileConfig?.label || "All skin profiles",
    goal: normalizeCatalogRankingConcern(state.userProfile.goal),
    goalSource: normalizedGoalSource,
    budget: state.userProfile.budget || "any",
    sensitivity: state.userProfile.sensitivity || "moderate",
    activesComfort: state.userProfile.activesComfort || "medium",
    avoidIngredients: [...(state.userProfile.avoidIngredients || [])],
    sort: state.sort || "relevance",
    strongCaseIntent: Boolean(strongCaseIntent),
    enforcesEligibility: Boolean(enforcesEligibility && !isNeutral && hasSignals),
    isNeutral,
  };
}

export function resolveCatalogCaseContext() {
  const activeConcern = normalizeCatalogRankingConcern(state.concern);
  if (activeConcern !== "all") {
    return buildCatalogCaseContext({
      type: "concern",
      concern: activeConcern,
      concerns: [activeConcern],
      label: activeConcern,
      sourceLabel: activeConcern,
      enforcesEligibility: true,
    });
  }

  const activeLane = getActiveBrowseLane();
  if (activeLane) {
    const laneConcern = getBrowseLaneRankingConcern(activeLane);
    return buildCatalogCaseContext({
      type: "browse-lane",
      concern: laneConcern !== "all" ? laneConcern : null,
      concerns: [laneConcern, activeLane.concern, ...(activeLane.concernsAny || [])],
      ingredients: [activeLane.ingredient, ...(activeLane.ingredientsAny || [])],
      categories: [activeLane.category, ...(activeLane.categoryAny || [])],
      label: activeLane.label || laneConcern,
      sourceLabel: activeLane.label || laneConcern,
      lane: activeLane,
      enforcesEligibility: true,
    });
  }

  const searchText = String(state.search || "").trim();
  const searchIntent = getCatalogSearchIntent(searchText);
  if (searchText) {
    const searchConcern = getSearchIntentPrimaryConcern(searchIntent);
    const searchLabel = searchIntent.normalizedQuery || searchText;
    return buildCatalogCaseContext({
      type: "search",
      concern: searchConcern,
      concerns: searchIntent.concerns,
      ingredients: searchIntent.ingredients,
      categories: [...(searchIntent.productTypes || []), ...(searchIntent.compatibleProductTypes || [])],
      label: `Search · ${searchLabel}`,
      sourceLabel: `Search · ${searchLabel}`,
      searchIntent,
      enforcesEligibility: true,
      strongCaseIntent: searchIntent.hasStrongIntent,
    });
  }

  const profileGoal = normalizeCatalogRankingConcern(state.userProfile.goal);
  const profileKey = normalizeSkinProfile(state.profile || state.userProfile.profile || "all");
  const profileConfig = SKIN_PROFILES[profileKey] || {};
  const goalSource = normalizeCatalogGoalSource({ goal: profileGoal, profile: profileKey, goalSource: state.userProfile.goalSource });
  if (hasCatalogLensContext({ goal: profileGoal, profile: profileKey, goalSource })) {
    return buildCatalogCaseContext({
      type: goalSource === "saved-profile" || goalSource === "continuity-profile" ? "saved-lens" : "skin-lens",
      concern: getLensDefaultCatalogConcern({ goal: profileGoal, profile: profileKey }),
      concerns: [profileGoal, ...(profileConfig.concerns || [])],
      ingredients: profileConfig.ingredients || [],
      categories: profileConfig.categories || [],
      label: profileKey === "all" ? profileGoal : profileConfig.label || profileGoal,
      sourceLabel: profileKey === "all" ? profileGoal : profileConfig.label || profileGoal,
      goalSource,
      enforcesEligibility: false,
    });
  }

  return buildCatalogCaseContext({
    type: "neutral",
    concern: null,
    label: "Broad catalog",
    sourceLabel: "Broad catalog",
    goalSource,
    enforcesEligibility: false,
  });
}

export function getCatalogRankingContext() {
  return resolveCatalogCaseContext();
}

export function isCatalogDecisionReady(context = getCatalogRankingContext()) {
  return getCatalogDecisionMode(context) === CATALOG_DECISION_MODES.FOCUSED_DECISION;
}

export function getGoalCategoryHints(goal) {
  const mapping = {
    acne: ["cleanser", "toner", "serum", "treatment"],
    pores: ["cleanser", "toner", "serum", "treatment"],
    dryness: ["cleanser", "moisturizer", "sunscreen", "mask"],
    redness: ["cleanser", "moisturizer", "sunscreen", "serum"],
    texture: ["serum", "toner", "treatment"],
    "dark spots": ["serum", "treatment", "sunscreen"],
    dullness: ["serum", "treatment", "moisturizer"],
    wrinkles: ["serum", "moisturizer", "sunscreen", "treatment"],
    "general care": ["cleanser", "serum", "moisturizer", "sunscreen"],
  };
  return mapping[goal] || [];
}

export function isCatalogDarkSpotContext(context = getCatalogRankingContext()) {
  const primaryConcern = context?.primaryConcern || context?.concern;
  return primaryConcern === "dark spots";
}

export function getCatalogDarkSpotStrategicIngredients() {
  return uniqueCatalogCaseValues([
    ...getCatalogConcernIngredients("dark spots"),
    "retinol",
    "glycolic acid",
    "lactic acid",
  ]);
}

export function getCatalogDarkSpotRoleFit(product, context = getCatalogRankingContext()) {
  if (!product || !isCatalogDarkSpotContext(context)) {
    return {
      rank: 0,
      leadCompatible: true,
      supportCompatible: true,
      scoreBoost: 0,
    };
  }

  const category = String(product.category || "").toLowerCase();
  const ingredients = getProductIngredientSet(product);
  const concerns = new Set(product.concerns || []);
  const strategicIngredients = getCatalogDarkSpotStrategicIngredients();
  const leadCategories = new Set(getGoalCategoryHints("dark spots"));
  const hasToneConcern = ["dark spots", "dullness", "texture"].some((concern) => concerns.has(concern));
  const hasToneIngredient = strategicIngredients.some((ingredient) => ingredients.has(ingredient));
  const hasDirectToneEvidence = hasToneConcern || hasToneIngredient;
  const isLeadCategory = leadCategories.has(category);
  const isSkincareSupportCategory = ["toner", "moisturizer", "mask", "cleanser"].includes(category);
  const isPeripheralCategory = ["lip care", "eye care", "body care", "fragrance", "tool", "tools", "set", "kit"].includes(category);

  if (isLeadCategory && hasDirectToneEvidence) {
    return {
      rank: 0,
      leadCompatible: true,
      supportCompatible: true,
      scoreBoost: category === "serum" ? 3.5 : category === "treatment" ? 3.25 : 3,
    };
  }

  if (isSkincareSupportCategory && hasDirectToneEvidence) {
    return {
      rank: 1,
      leadCompatible: false,
      supportCompatible: true,
      scoreBoost: category === "toner" ? 1.75 : category === "moisturizer" ? 1.25 : 0.75,
    };
  }

  if (hasDirectToneEvidence) {
    return {
      rank: isPeripheralCategory ? 3 : 2,
      leadCompatible: false,
      supportCompatible: true,
      scoreBoost: isPeripheralCategory ? -1.5 : 0,
    };
  }

  return {
    rank: 4,
    leadCompatible: false,
    supportCompatible: false,
    scoreBoost: -3,
  };
}

export function browseLaneMatchesDarkSpotSupportProduct(product, lane, lowerIngredients = getProductIngredientSet(product)) {
  if (!product || !lane || lane.primaryConcern !== "dark spots") return false;
  if (!["dark-spot-picks", "vitamin-c"].includes(lane.key)) return false;
  if (lane.category && product.category !== lane.category) return false;
  if (lane.categoryAny && !lane.categoryAny.includes(product.category)) return false;
  if (lane.maxPrice != null && (typeof product.price !== "number" || product.price > lane.maxPrice)) return false;
  if (lane.minRating != null && (typeof product.rating !== "number" || product.rating < lane.minRating)) return false;
  if (lane.minReviews != null && (typeof product.reviewCount !== "number" || product.reviewCount < lane.minReviews)) return false;
  if (lane.sensitiveSafe && !isSensitiveSafeProduct(product)) return false;

  const concerns = new Set(product.concerns || []);
  const hasToneConcern = ["dark spots", "dullness", "texture"].some((concern) => concerns.has(concern));
  const hasStrategicIngredient = getCatalogDarkSpotStrategicIngredients().some((ingredient) => lowerIngredients.has(ingredient));
  const isLeadCategory = getGoalCategoryHints("dark spots").includes(product.category);
  return hasToneConcern && hasStrategicIngredient && isLeadCategory;
}

export function goalBoost(product) {
  const rankingContext = getCatalogRankingContext();
  const goal = rankingContext.primaryConcern || rankingContext.concern;
  if (!goal) return 0;
  let score = 0;

  if (product.concerns.includes(goal)) score += 3.5;

  const goalCategories = getGoalCategoryHints(goal);
  if (goalCategories.includes(product.category)) score += 1.5;

  if (goal === "dryness" || goal === "redness") {
    score += product.ingredients.filter((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient)).length * 1.2;
  }
  if (goal === "acne" || goal === "pores") {
    score += product.ingredients.filter((ingredient) => ["salicylic acid", "niacinamide", "retinol"].includes(ingredient)).length * 1.2;
  }
  if (goal === "dark spots" || goal === "dullness") {
    score += product.ingredients.filter((ingredient) => ["vitamin c", "niacinamide", "retinol", "glycolic acid", "lactic acid"].includes(ingredient)).length * 1.1;
  }
  if (goal === "wrinkles") {
    score += product.ingredients.filter((ingredient) => ["retinol", "peptides", "hyaluronic acid"].includes(ingredient)).length * 1.1;
  }

  return score;
}

export function profileBoost(product) {
  if (state.profile === "all") return 0;
  const profile = SKIN_PROFILES[state.profile];
  if (!profile) return 0;

  let score = 0;
  score += product.concerns.filter((concern) => profile.concerns.includes(concern)).length * 2;
  score += product.ingredients.filter((ingredient) => profile.ingredients.includes(ingredient)).length * 1.5;
  if (profile.categories.includes(product.category)) score += 1.5;
  return score;
}

export function sensitivityBoost(product) {
  const sensitivity = state.userProfile.sensitivity || "moderate";
  const barrierCount = product.ingredients.filter((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient)).length;
  const strongActives = product.ingredients.filter((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)).length;

  if (sensitivity === "high") {
    return barrierCount * 1.5 - strongActives * 2 + (product.concerns.includes("redness") ? 1.5 : 0);
  }
  if (sensitivity === "low") {
    return strongActives * 0.5;
  }
  return barrierCount * 0.5 - strongActives * 0.5;
}

export function activesComfortBoost(product) {
  const comfort = state.userProfile.activesComfort || "medium";
  const strongActives = product.ingredients.filter((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient)).length;

  if (comfort === "low") {
    let score = 0;
    if (["cleanser", "moisturizer", "sunscreen"].includes(product.category)) score += 1.5;
    score -= strongActives * 2;
    return score;
  }
  if (comfort === "high") {
    return (["serum", "toner", "treatment"].includes(product.category) ? 1.25 : 0) + strongActives * 1.25;
  }
  return strongActives > 1 ? -0.75 : 0;
}

export function avoidIngredientPenalty(product) {
  const avoidList = state.userProfile.avoidIngredients || [];
  if (!avoidList.length) return 0;
  return product.ingredients.filter((ingredient) => avoidList.includes(ingredient)).length * -7;
}

export function budgetBoost(product) {
  if (typeof product.price !== "number") return 0;
  if (state.userProfile.budget === "budget") {
    return product.price <= 30 ? 3 : product.price <= 50 ? 1 : -1;
  }
  if (state.userProfile.budget === "balanced") {
    return product.price >= 20 && product.price <= 75 ? 2 : product.price < 20 ? 1 : 0;
  }
  if (state.userProfile.budget === "premium") {
    return product.price >= 60 ? 2 : product.price >= 35 ? 1 : 0;
  }
  return 0;
}

export function profileFitBoost(product, weights = {}) {
  const {
    goal = 1,
    profile = 1,
    budget = 1,
    sensitivity = 1,
    actives = 1,
    avoid = 1,
  } = weights;

  return (
    goalBoost(product) * goal +
    profileBoost(product) * profile +
    budgetBoost(product) * budget +
    sensitivityBoost(product) * sensitivity +
    activesComfortBoost(product) * actives +
    avoidIngredientPenalty(product) * avoid
  );
}

export function overlapBoost(product) {
  const canonicalRetailers = Array.isArray(product?.canonicalRetailers)
    ? product.canonicalRetailers
    : [];
  const retailerCount = Math.max(
    canonicalRetailers.length,
    Number(product?.comparisonRetailerCount || 0),
    Number(product?.closestEquivalentRetailerCount || 0),
  );
  if (retailerCount <= 1) return 0;
  return Math.min(1.2, (retailerCount - 1) * 0.3);
}

export function getCatalogCaseWeakText(product) {
  return [
    product?.brand || "",
    product?.name || "",
    product?.category || "",
    product?.description || "",
    product?.searchText || "",
    ...(product?.concerns || []),
    ...(product?.ingredients || []),
  ]
    .join(" ")
    .toLowerCase();
}

export function getCatalogCaseSafetyPenalty(product, context = getCatalogRankingContext()) {
  let penalty = 0;
  const ingredients = getProductIngredientSet(product);
  const strongActiveCount = getStrongActiveCount(product);
  const avoidList = context.avoidIngredients || state.userProfile.avoidIngredients || [];
  penalty += avoidList.filter((ingredient) => ingredients.has(ingredient)).length * 4;
  if (context.sensitivity === "high" && strongActiveCount > 1) penalty += (strongActiveCount - 1) * 2.5;
  if (context.activesComfort === "low" && strongActiveCount > 0) penalty += strongActiveCount * 2;
  if ((context.primaryConcern === "dryness" || context.primaryConcern === "redness") && strongActiveCount > 1) {
    penalty += 1.5;
  }
  return penalty;
}

export function getCatalogCaseEvidence(product, context = getCatalogRankingContext()) {
  const emptyEvidence = {
    directConcernEvidence: [],
    ingredientEvidence: [],
    categoryRoleEvidence: [],
    weakMetadataEvidence: [],
    supportOnlyEvidence: [],
    safetyConflictPenalty: 0,
    leadEligible: !context?.enforcesEligibility,
    supportEligible: !context?.enforcesEligibility,
    score: 0,
  };
  if (!product || !context || context.isNeutral) return emptyEvidence;

  const productConcerns = Array.isArray(product.concerns) ? product.concerns : [];
  const productIngredients = Array.isArray(product.ingredients) ? product.ingredients : [];
  const concernSet = new Set(context.concerns || []);
  const ingredientSet = new Set(context.ingredients || []);
  const categorySet = new Set(context.categories || []);
  const primaryConcern = context.primaryConcern || context.concern || null;

  const directConcernEvidence = productConcerns.filter((concern) => concernSet.has(concern));
  const ingredientEvidence = productIngredients.filter((ingredient) => ingredientSet.has(ingredient));
  const categoryRoleEvidence = categorySet.has(product.category) ? [product.category] : [];
  const weakText = getCatalogCaseWeakText(product);
  const weakMetadataEvidence = [
    ...(primaryConcern && weakText.includes(primaryConcern) ? [primaryConcern] : []),
    ...(context.concerns || []).filter((concern) => concern !== primaryConcern && weakText.includes(concern)),
    ...(context.ingredients || []).filter((ingredient) => weakText.includes(ingredient)).slice(0, 3),
  ].filter((value, index, values) => value && values.indexOf(value) === index);
  const safetyConflictPenalty = getCatalogCaseSafetyPenalty(product, context);

  let score = 0;
  if (primaryConcern && directConcernEvidence.includes(primaryConcern)) score += 7;
  score += directConcernEvidence.filter((concern) => concern !== primaryConcern).length * 4.5;
  score += ingredientEvidence.length * 2.5;
  score += categoryRoleEvidence.length * 1.5;
  score += Math.min(2, weakMetadataEvidence.length * 0.5);

  let leadEligible = false;
  let supportEligible = false;
  const hasDirectPrimary = Boolean(primaryConcern && directConcernEvidence.includes(primaryConcern));
  const hasAnyDirect = directConcernEvidence.length > 0;
  const hasIngredient = ingredientEvidence.length > 0;
  const hasCategory = categoryRoleEvidence.length > 0;
  const activeEvidenceCount = directConcernEvidence.length + ingredientEvidence.length + categoryRoleEvidence.length;
  const darkSpotRoleFit = getCatalogDarkSpotRoleFit(product, context);
  const darkSpotEvidence = isCatalogDarkSpotContext(context) ? hasDirectPrimary || hasAnyDirect || hasIngredient || hasCategory : false;
  if (isCatalogDarkSpotContext(context)) {
    score += darkSpotRoleFit.scoreBoost;
    if (darkSpotRoleFit.rank >= 3) score -= 1.5;
  }

  if (isCatalogDarkSpotContext(context)) {
    leadEligible = Boolean(darkSpotEvidence && darkSpotRoleFit.leadCompatible);
    supportEligible = leadEligible || Boolean(darkSpotEvidence && darkSpotRoleFit.supportCompatible);
  } else if (context.type === "concern") {
    leadEligible = hasDirectPrimary || hasAnyDirect;
    supportEligible = leadEligible || (hasIngredient && hasCategory);
  } else if (context.profile === "dry-sensitive") {
    const barrier = productIngredients.filter((ingredient) =>
      ["ceramides", "hyaluronic acid", "squalane", "fragrance-free", "niacinamide"].includes(ingredient),
    );
    leadEligible = (productConcerns.includes("dryness") || productConcerns.includes("redness")) && (barrier.length || hasCategory);
    supportEligible = leadEligible || barrier.length >= 2 || (isSensitiveSafeProduct(product) && (hasCategory || hasIngredient));
  } else if (context.profile === "oily-acne") {
    const acneActives = productIngredients.filter((ingredient) =>
      ["salicylic acid", "benzoyl peroxide", "niacinamide", "retinol", "azelaic acid"].includes(ingredient),
    );
    leadEligible = (productConcerns.includes("acne") || productConcerns.includes("pores")) && (acneActives.length || hasCategory);
    supportEligible = leadEligible || (acneActives.length && hasCategory) || productConcerns.includes("texture");
  } else if (context.profile === "dark-spot-texture") {
    const toneActives = productIngredients.filter((ingredient) =>
      ["vitamin c", "niacinamide", "retinol", "glycolic acid", "lactic acid", "spf"].includes(ingredient),
    );
    leadEligible =
      productConcerns.some((concern) => ["dark spots", "texture", "dullness"].includes(concern)) &&
      (toneActives.length || product.category === "sunscreen" || hasCategory);
    supportEligible = leadEligible || (toneActives.length && hasCategory);
  } else if (context.profile === "mature-dehydrated") {
    const matureActives = productIngredients.filter((ingredient) =>
      ["retinol", "peptides", "hyaluronic acid", "ceramides", "spf"].includes(ingredient),
    );
    leadEligible =
      productConcerns.some((concern) => ["wrinkles", "dryness", "dullness"].includes(concern)) &&
      (matureActives.length || hasCategory);
    supportEligible = leadEligible || (matureActives.length && hasCategory);
  } else if (context.profile === "balanced-maintenance") {
    const maintenanceIngredients = productIngredients.filter((ingredient) =>
      ["spf", "niacinamide", "hyaluronic acid", "vitamin c", "ceramides"].includes(ingredient),
    );
    leadEligible =
      productConcerns.some((concern) => ["general care", "dullness"].includes(concern)) ||
      (maintenanceIngredients.length && ["cleanser", "serum", "moisturizer", "sunscreen"].includes(product.category));
    supportEligible = leadEligible || (maintenanceIngredients.length && hasCategory);
  } else {
    leadEligible = hasDirectPrimary || (hasAnyDirect && (hasIngredient || hasCategory)) || (hasIngredient && hasCategory);
    supportEligible = leadEligible || activeEvidenceCount >= 2 || (hasIngredient && context.type === "search");
  }

  if (!leadEligible && supportEligible) {
    score += 1.2;
  }
  if (leadEligible) {
    score += 5;
  }
  score -= safetyConflictPenalty;
  if (safetyConflictPenalty >= 6) {
    leadEligible = false;
  }
  if (score < 1.5 && !hasAnyDirect) {
    supportEligible = false;
  }

  return {
    directConcernEvidence,
    ingredientEvidence,
    categoryRoleEvidence,
    weakMetadataEvidence,
    supportOnlyEvidence: supportEligible && !leadEligible ? [...ingredientEvidence, ...categoryRoleEvidence, ...weakMetadataEvidence] : [],
    safetyConflictPenalty,
    leadEligible,
    supportEligible: supportEligible || leadEligible,
    score: Math.max(0, score),
  };
}

export function getCatalogCaseEvidenceMap(products, context = getCatalogRankingContext()) {
  return new Map((products || []).map((product) => [product.id, getCatalogCaseEvidence(product, context)]));
}

export function shouldFilterByCatalogCaseEligibility(context = getCatalogRankingContext()) {
  return Boolean(context?.enforcesEligibility);
}

export const CATALOG_ELIGIBILITY_STATUSES = Object.freeze({
  ELIGIBLE: "eligible",
  NO_VERIFIED_MATCH: "no-verified-match",
  UNSUPPORTED_CONTEXT: "unsupported-context",
  INSUFFICIENT_EVIDENCE: "insufficient-evidence",
  SAFETY_BYPASS: "safety-bypass",
});

export function getCatalogSafetyBypassReason(context = getCatalogRankingContext()) {
  const explicitReason = String(context?.safetyBypassReason || "").trim().toLowerCase();
  if (explicitReason) return explicitReason;
  if (context?.pregnancy || context?.pregnancyRequested) return "pregnancy-context";
  if (context?.allergy || context?.allergyRequested) return "allergy-context";
  if (context?.prescription || context?.prescriptionContext) return "prescription-context";
  if (context?.redFlag || context?.severeSymptoms || context?.medicalContext) return "medical-context";
  if (context?.unrestrictedFreeText) return "unrestricted-free-text";
  return null;
}

export function getCatalogHardEligibilityReason(product, context = getCatalogRankingContext()) {
  if (!product || typeof product !== "object") return "invalid-product";
  const avoidList = uniqueCatalogCaseValues(
    context?.avoidIngredients || state.userProfile.avoidIngredients || [],
  );
  const ingredients = Array.isArray(product.ingredients)
    ? product.ingredients.map((ingredient) => normalizeCatalogRankingConcern(ingredient)).filter(Boolean)
    : [];
  const requiresIngredientEvidence = Boolean(
    avoidList.length || context?.sensitivity === "high" || context?.activesComfort === "low",
  );
  if (!ingredients.length && requiresIngredientEvidence) return "unknown-ingredients";
  if (avoidList.some((ingredient) => ingredients.includes(ingredient))) return "avoid-list-match";
  return null;
}

export function getCatalogCaseEligibilityResult(products, context = getCatalogRankingContext()) {
  const sourceProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const safetyBypassReason = getCatalogSafetyBypassReason(context);
  if (safetyBypassReason) {
    return {
      status: CATALOG_ELIGIBILITY_STATUSES.SAFETY_BYPASS,
      products: sourceProducts,
      eligibleProducts: [],
      hardExcluded: [],
      relevanceExcluded: [],
      reason: safetyBypassReason,
    };
  }
  if (!shouldFilterByCatalogCaseEligibility(context)) {
    return {
      status: CATALOG_ELIGIBILITY_STATUSES.UNSUPPORTED_CONTEXT,
      products: sourceProducts,
      eligibleProducts: [],
      hardExcluded: [],
      relevanceExcluded: [],
      reason: "focused-context-required",
    };
  }

  const hardExcluded = [];
  const relevanceExcluded = [];
  const eligibleProducts = [];
  sourceProducts.forEach((product) => {
    const hardReason = getCatalogHardEligibilityReason(product, context);
    if (hardReason) {
      hardExcluded.push({ product, reason: hardReason });
      return;
    }
    const evidence = getCatalogCaseEvidence(product, context);
    if (!evidence.leadEligible && !evidence.supportEligible) {
      relevanceExcluded.push({ product, reason: "no-contextual-evidence" });
      return;
    }
    eligibleProducts.push(product);
  });

  if (eligibleProducts.length) {
    return {
      status: CATALOG_ELIGIBILITY_STATUSES.ELIGIBLE,
      products: eligibleProducts,
      eligibleProducts,
      hardExcluded,
      relevanceExcluded,
      reason: null,
    };
  }
  const insufficientEvidence = hardExcluded.some((entry) => entry.reason === "unknown-ingredients");
  return {
    status: insufficientEvidence
      ? CATALOG_ELIGIBILITY_STATUSES.INSUFFICIENT_EVIDENCE
      : CATALOG_ELIGIBILITY_STATUSES.NO_VERIFIED_MATCH,
    products: [],
    eligibleProducts: [],
    hardExcluded,
    relevanceExcluded,
    reason: insufficientEvidence ? "ingredient-evidence-missing" : "no-eligible-product",
  };
}

export function filterCatalogCaseEligibleProducts(products, context = getCatalogRankingContext()) {
  return getCatalogCaseEligibilityResult(products, context).products;
}

export function compareCatalogCaseLeadEligibility(a, b, evidenceById, context = getCatalogRankingContext()) {
  if (!shouldFilterByCatalogCaseEligibility(context)) return 0;
  const aEvidence = evidenceById.get(a.id) || getCatalogCaseEvidence(a, context);
  const bEvidence = evidenceById.get(b.id) || getCatalogCaseEvidence(b, context);
  if (aEvidence.leadEligible !== bEvidence.leadEligible) {
    return aEvidence.leadEligible ? -1 : 1;
  }
  if (aEvidence.supportEligible !== bEvidence.supportEligible) {
    return aEvidence.supportEligible ? -1 : 1;
  }
  return 0;
}

export function getCatalogLeadProduct(products, context = getCatalogRankingContext()) {
  if (!Array.isArray(products) || !products.length) return null;
  if (state.sort === "relevance") return products[0] || null;
  if (!shouldFilterByCatalogCaseEligibility(context)) return products[0] || null;
  return products.find((product) => getCatalogCaseEvidence(product, context).leadEligible) || products[0] || null;
}

export function invalidateCatalogProductDerivations({ includeLookup = true } = {}) {
  derivedRenderCache.filteredProductsKey = "";
  derivedRenderCache.filteredProducts = [];
  derivedRenderCache.catalogContextKey = "";
  derivedRenderCache.catalogContext = null;
  derivedRenderCache.browseLaneScope.clear();
  if (includeLookup) {
    derivedRenderCache.productLookupKey = "";
    derivedRenderCache.productLookup = null;
  }
}

export function normalizeFocusedCatalogQueryValue(value, fallback = "all") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

export function normalizeFocusedCatalogSearch(value = state.search) {
  return getCatalogSearchBackendQuery(value);
}

export function getFocusedCatalogApiSort(sort = state.sort) {
  const normalized = normalizeFocusedCatalogQueryValue(sort, "relevance");
  if (normalized === "relevance" || normalized === "case-relevance") {
    return hasCatalogFocusedDecisionAxis(getCatalogRankingContext()) ? "case-relevance" : "brand";
  }
  return normalized;
}

export function getFocusedCatalogActiveQuery({ limit = CATALOG_FOCUSED_FILTER_LIMIT, offset = 0 } = {}) {
  const caseContext = getCatalogRankingContext();
  const contextConcern =
    state.concern === "all" && isCatalogDecisionReady(caseContext) && caseContext.primaryConcern
      ? caseContext.primaryConcern
      : state.concern;
  return {
    retailer: normalizeFocusedCatalogQueryValue(state.retailer),
    brand: normalizeFocusedCatalogQueryValue(state.brand),
    category: normalizeFocusedCatalogQueryValue(state.category),
    concern: normalizeFocusedCatalogQueryValue(contextConcern),
    ingredient: normalizeFocusedCatalogQueryValue(state.ingredient),
    search: normalizeFocusedCatalogSearch(),
    sort: normalizeFocusedCatalogQueryValue(state.sort, "relevance"),
    limit: Number(limit),
    offset: Number(offset),
  };
}

export function getFocusedCatalogApiFilters(query = getFocusedCatalogActiveQuery()) {
  const filters = {};
  [
    ["retailer", query.retailer],
    ["brand", query.brand],
    ["category", query.category],
    ["concern", query.concern],
    ["ingredient", query.ingredient],
  ].forEach(([key, value]) => {
    if (value && value !== "all") {
      filters[key] = value;
    }
  });
  if (query.search) {
    filters.search = query.search;
  }
  return filters;
}

export function hasBackendScopedCatalogQueryFilters(query = getFocusedCatalogActiveQuery()) {
  return Boolean(
    query.search ||
      [query.retailer, query.brand, query.category, query.concern, query.ingredient].some(
        (value) => value && value !== "all",
      ),
  );
}

export function buildFocusedCatalogFilterKey(query = getFocusedCatalogActiveQuery()) {
  if (!hasBackendScopedCatalogQueryFilters(query)) return "";
  return stableJsonStringify({
    retailer: query.retailer || "all",
    brand: query.brand || "all",
    category: query.category || "all",
    concern: query.concern || "all",
    ingredient: query.ingredient || "all",
    search: query.search || "",
    sort: query.sort || "relevance",
    limit: Number(query.limit) || CATALOG_FOCUSED_FILTER_LIMIT,
    offset: Number(query.offset) || 0,
  });
}

export function isFocusedCatalogFilterResponseCurrent(requestKey) {
  return Boolean(
    requestKey &&
      state.live.catalogFocus?.requestKey === requestKey &&
      buildFocusedCatalogFilterKey() === requestKey,
  );
}

export function isCatalogReadyFromFullSnapshot() {
  const hydration = state.live?.catalog || {};
  return hydration.phase === "ready" && !hydration.partial;
}

export function canRequestFocusedCatalogFilterSlice() {
  if (!state.live.apiBacked || isCatalogReadyFromFullSnapshot()) return false;
  const hydration = state.live?.catalog || {};
  return hydration.phase === "partial" || Boolean(hydration.fullRequestInFlight);
}

export function clearFocusedCatalogFilterSlice() {
  if (!state.live.catalogFocus?.requestKey && !state.live.catalogFocus?.products?.length) return;
  state.live.catalogFocus = createCatalogFocusedFilterState();
  invalidateCatalogProductDerivations();
}

export function requestFocusedCatalogFilterSlice() {
  const activeQuery = getFocusedCatalogActiveQuery();
  const filters = getFocusedCatalogApiFilters(activeQuery);
  const requestKey = buildFocusedCatalogFilterKey(activeQuery);
  if (!requestKey) {
    clearFocusedCatalogFilterSlice();
    return false;
  }
  if (!canRequestFocusedCatalogFilterSlice()) return false;

  const currentFocus = state.live.catalogFocus || {};
  if (
    currentFocus.requestKey === requestKey &&
    (currentFocus.loading || currentFocus.loadedAt || currentFocus.error)
  ) {
    return false;
  }

  const startedAt = new Date().toISOString();
  state.live.catalogFocus = createCatalogFocusedFilterState({
    requestKey,
    inFlightQueryKey: requestKey,
    activeQuery,
    filters,
    products: [],
    loading: true,
    error: false,
    total: null,
    loadedCount: 0,
    partial: true,
    ready: false,
    startedAt,
    loadedAt: null,
  });
  invalidateCatalogProductDerivations();

  let timeoutId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(
      () => reject(new Error("Focused catalog filter request timed out")),
      CATALOG_FOCUSED_FILTER_TIMEOUT_MS,
    );
  });

  const requestPromise = Promise.race([
    fetchFocusedProductsPage({
      filters,
      limit: activeQuery.limit,
      offset: activeQuery.offset,
      sort: getFocusedCatalogApiSort(activeQuery.sort),
    }),
    timeoutPromise,
  ]);

  void requestPromise
    .then((payload) => {
      if (!isFocusedCatalogFilterResponseCurrent(requestKey)) return;
      const products = decorateProducts(Array.isArray(payload?.items) ? payload.items : []);
      const total = Number.isFinite(Number(payload?.total)) ? Number(payload.total) : products.length;
      state.live.catalogFocus = createCatalogFocusedFilterState({
        requestKey,
        inFlightQueryKey: null,
        activeQuery,
        filters,
        products,
        total,
        loadedCount: products.length,
        loading: false,
        partial: total > products.length,
        ready: true,
        error: false,
        startedAt,
        loadedAt: new Date().toISOString(),
      });
      invalidateCatalogProductDerivations();
      renderActiveShellSurface({ force: true });
    })
    .catch(() => {
      if (!isFocusedCatalogFilterResponseCurrent(requestKey)) return;
      state.live.catalogFocus = createCatalogFocusedFilterState({
        requestKey,
        inFlightQueryKey: null,
        activeQuery,
        filters,
        products: [],
        total: null,
        loadedCount: 0,
        loading: false,
        partial: true,
        ready: false,
        error: true,
        startedAt,
        loadedAt: new Date().toISOString(),
      });
      invalidateCatalogProductDerivations();
      renderActiveShellSurface({ force: true });
    })
    .finally(() => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    });

  return true;
}

export function getActiveFocusedCatalogProducts() {
  const requestKey = buildFocusedCatalogFilterKey();
  const focus = state.live.catalogFocus || {};
  if (!requestKey || focus.requestKey !== requestKey || !Array.isArray(focus.products) || !focus.products.length) {
    return [];
  }
  if (isCatalogReadyFromFullSnapshot()) return [];
  return focus.products;
}

export function getActiveFocusedCatalogQueryState() {
  const requestKey = buildFocusedCatalogFilterKey();
  const focus = state.live.catalogFocus || {};
  if (!requestKey || focus.requestKey !== requestKey || isCatalogReadyFromFullSnapshot()) return null;
  if (!focus.loading && !focus.loadedAt && !focus.error) return null;
  return focus;
}

export function isFocusedCatalogFilterLoading() {
  const requestKey = buildFocusedCatalogFilterKey();
  const focus = state.live.catalogFocus || {};
  return Boolean(requestKey && focus.requestKey === requestKey && focus.loading);
}

export function isFocusedCatalogFilterSettled() {
  const focus = getActiveFocusedCatalogQueryState();
  return Boolean(focus && !focus.loading && focus.loadedAt && !focus.error);
}

export function getCatalogFilterSourceProducts() {
  const focus = getActiveFocusedCatalogQueryState();
  if (focus && !focus.loading && !focus.error) {
    return Array.isArray(focus.products) ? focus.products : [];
  }
  const focusedProducts = getActiveFocusedCatalogProducts();
  return focusedProducts.length ? focusedProducts : state.products;
}

export function getCatalogLookupProducts() {
  const focusedProducts = getActiveFocusedCatalogProducts();
  if (!focusedProducts.length) return state.products;
  const productsById = new Map(state.products.map((product) => [product.id, product]));
  focusedProducts.forEach((product) => {
    if (product?.id) {
      productsById.set(product.id, product);
    }
  });
  return [...productsById.values()];
}

export function getFocusedCatalogRevisionKey() {
  const requestKey = buildFocusedCatalogFilterKey();
  const focus = state.live.catalogFocus || {};
  if (!requestKey || focus.requestKey !== requestKey) return "";
  return [
    requestKey,
    stableJsonStringify(focus.activeQuery || {}),
    focus.inFlightQueryKey || "",
    Array.isArray(focus.products) ? focus.products.length : 0,
    Number.isFinite(Number(focus.total)) ? Number(focus.total) : "",
    Number.isFinite(Number(focus.loadedCount)) ? Number(focus.loadedCount) : "",
    focus.loading ? "loading" : "idle",
    focus.ready ? "ready" : "not-ready",
    focus.partial ? "partial" : "complete",
    focus.error ? "error" : "ok",
    focus.loadedAt || "",
  ].join("::");
}

export function getProductsRevisionKey() {
  return [
    state.products.length,
    state.freshness.catalog || state.metadata?.generatedAt || "",
    state.freshness.ratings || "",
    getFocusedCatalogRevisionKey(),
  ].join("::");
}

export function getProductLookupState() {
  const cacheKey = getProductsRevisionKey();
  if (derivedRenderCache.productLookupKey === cacheKey && derivedRenderCache.productLookup) {
    return derivedRenderCache.productLookup;
  }

  const productsById = new Map();
  const productsByNormalizedId = new Map();
  const ambiguousNormalizedProductIds = new Set();
  const productsByRetailer = new Map();
  const productsByComparableKey = new Map();
  const productsByRetailerCategoryGroup = new Map();

  getCatalogLookupProducts().forEach((product) => {
    if (!product) return;
    if (product.id) {
      productsById.set(product.id, product);
      const normalizedId = String(product.id).trim();
      if (normalizedId) {
        if (productsByNormalizedId.has(normalizedId)) {
          productsByNormalizedId.delete(normalizedId);
          ambiguousNormalizedProductIds.add(normalizedId);
        } else if (!ambiguousNormalizedProductIds.has(normalizedId)) {
          productsByNormalizedId.set(normalizedId, product);
        }
      }
    }
    if (product.retailer) {
      if (!productsByRetailer.has(product.retailer)) {
        productsByRetailer.set(product.retailer, []);
      }
      productsByRetailer.get(product.retailer).push(product);
      const categoryGroup = getRetailerEquivalentCategoryGroup(product);
      if (categoryGroup) {
        const retailerCategoryKey = `${product.retailer}::${categoryGroup}`;
        if (!productsByRetailerCategoryGroup.has(retailerCategoryKey)) {
          productsByRetailerCategoryGroup.set(retailerCategoryKey, []);
        }
        productsByRetailerCategoryGroup.get(retailerCategoryKey).push(product);
      }
    }
    const comparableKey = getComparableProductKey(product);
    if (!comparableKey) return;
    if (!productsByComparableKey.has(comparableKey)) {
      productsByComparableKey.set(comparableKey, []);
    }
    productsByComparableKey.get(comparableKey).push(product);
  });

  const lookup = {
    productsById,
    productsByNormalizedId,
    ambiguousNormalizedProductIds,
    productsByRetailer,
    productsByComparableKey,
    productsByRetailerCategoryGroup,
  };
  derivedRenderCache.productLookupKey = cacheKey;
  derivedRenderCache.productLookup = lookup;
  return lookup;
}

export function getShortlistStatusesSignature() {
  return Object.entries(state.shortlistStatuses || {})
    .sort(([aId], [bId]) => aId.localeCompare(bId))
    .map(([productId, status]) => `${productId}:${status}`)
    .join("|");
}

export function getDerivedCatalogStateKey() {
  return [
    getProductsRevisionKey(),
    state.browseLaneKey || "",
    state.retailer || "all",
    state.brand || "all",
    state.category || "all",
    state.ingredient || "all",
    state.concern || "all",
    state.search || "",
    state.sort || "relevance",
    state.profile || state.userProfile.profile || "all",
    state.userProfile.goal || "",
    state.userProfile.goalSource || "",
    state.userProfile.budget || "",
    state.userProfile.sensitivity || "",
    state.userProfile.activesComfort || "",
    state.routineConcern || "",
    state.routineTime || "",
    (state.userProfile.avoidIngredients || []).join(","),
    state.favoriteIds.join(","),
    getShortlistStatusesSignature(),
  ].join("::");
}

export function getFilteredProductsState() {
  const cacheKey = getDerivedCatalogStateKey();
  if (derivedRenderCache.filteredProductsKey === cacheKey) {
    return {
      cacheKey,
      products: derivedRenderCache.filteredProducts,
    };
  }

  const activeLane = getActiveBrowseLane();
  const caseContext = getCatalogRankingContext();
  const recommenderCaseKey = [
    caseContext?.type || "neutral",
    caseContext?.primaryConcern || caseContext?.concern || "",
    state.category || "all",
    state.ingredient || "all",
    state.browseLaneKey || "",
    state.sort || "relevance",
    state.profile || state.userProfile.profile || "all",
    state.userProfile.budget || "any",
    state.userProfile.sensitivity || "moderate",
    state.userProfile.activesComfort || "medium",
    (state.userProfile.avoidIngredients || []).join(","),
  ].join("::");
  beginRecommenderCase(recommenderCaseKey);
  let filtered = getCatalogFilterSourceProducts().filter((product) => {
    const browseLaneMatch = !activeLane || browseLaneMatchesProduct(product, activeLane);
    const retailerMatch = state.retailer === "all" || product.retailer === state.retailer;
    const brandMatch = state.brand === "all" || product.brand === state.brand;
    const categoryMatch = state.category === "all" || product.category === state.category;
    const ingredientMatch = state.ingredient === "all" || product.ingredients.includes(state.ingredient);
    const concernMatch = state.concern === "all" || product.concerns.includes(state.concern);
    return (
      browseLaneMatch &&
      retailerMatch &&
      brandMatch &&
      categoryMatch &&
      ingredientMatch &&
      concernMatch &&
      matchesSearch(product, state.search)
    );
  });
  filtered = filterCatalogCaseEligibleProducts(filtered, caseContext);
  const caseEvidenceById = getCatalogCaseEvidenceMap(filtered, caseContext);

  if (state.sort === "price-asc") {
    filtered.sort(
      (a, b) =>
        compareCatalogCaseLeadEligibility(a, b, caseEvidenceById, caseContext) ||
        (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name),
    );
  } else if (state.sort === "price-desc") {
    filtered.sort(
      (a, b) =>
        compareCatalogCaseLeadEligibility(a, b, caseEvidenceById, caseContext) ||
        (b.price ?? -1) - (a.price ?? -1) ||
        a.name.localeCompare(b.name),
    );
  } else if (state.sort === "top-rated") {
    filtered.sort(
      (a, b) =>
        compareCatalogCaseLeadEligibility(a, b, caseEvidenceById, caseContext) ||
        (b.rating ?? -1) - (a.rating ?? -1) ||
        (b.reviewCount ?? -1) - (a.reviewCount ?? -1) ||
        scoreBestOverall(b) - scoreBestOverall(a) ||
        a.name.localeCompare(b.name),
    );
  } else if (state.sort === "most-reviewed") {
    filtered.sort(
      (a, b) =>
        compareCatalogCaseLeadEligibility(a, b, caseEvidenceById, caseContext) ||
        (b.reviewCount ?? -1) - (a.reviewCount ?? -1) ||
        (b.rating ?? -1) - (a.rating ?? -1) ||
        scoreBestOverall(b) - scoreBestOverall(a) ||
        a.name.localeCompare(b.name),
    );
  } else if (state.sort === "brand") {
    filtered.sort(
      (a, b) =>
        compareCatalogCaseLeadEligibility(a, b, caseEvidenceById, caseContext) ||
        a.brand.localeCompare(b.brand) ||
        a.name.localeCompare(b.name),
    );
  } else {
    const scoreById = new Map(filtered.map((product) => [product.id, scoreProduct(product, caseContext)]));
    filtered.sort(
      (a, b) =>
        (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0) ||
        a.name.localeCompare(b.name),
    );
    if (isCatalogBroadDecisionMode(caseContext)) {
      const representative = buildBroadCatalogRepresentativeResults(filtered, scoreById, caseContext);
      filtered.splice(0, filtered.length, ...representative);
    } else {
      rankRecommenderShadow(filtered.slice(0, 10), caseContext, scoreById, {
        caseKey: recommenderCaseKey,
      });
      const diversified = diversifyCatalogResults(filtered, scoreById);
      const collapsed = collapseCatalogFamilyResults(diversified, scoreById);
      filtered.splice(0, filtered.length, ...collapsed);
      pinSavedCatalogDecisionLeaders(filtered, caseContext);
    }
  }

  derivedRenderCache.filteredProductsKey = cacheKey;
  derivedRenderCache.filteredProducts = filtered;
  initializeRecommenderAfterFirstRender();
  if (derivedRenderCache.catalogContextKey !== cacheKey) {
    derivedRenderCache.catalogContextKey = "";
    derivedRenderCache.catalogContext = null;
  }

  return {
    cacheKey,
    products: filtered,
  };
}

export function getCatalogRenderContext({ mutableFiltered = false } = {}) {
  const filteredState = getFilteredProductsState();
  if (derivedRenderCache.catalogContextKey !== filteredState.cacheKey || !derivedRenderCache.catalogContext) {
    const filtered = filteredState.products;
    derivedRenderCache.catalogContextKey = filteredState.cacheKey;
    derivedRenderCache.catalogContext = {
      cacheKey: filteredState.cacheKey,
      filtered,
      marketSnapshot: getMarketViewSnapshot(filtered),
      leadProduct: getCatalogLeadProduct(filtered),
    };
  }

  return {
    cacheKey: derivedRenderCache.catalogContext.cacheKey,
    filtered: mutableFiltered ? [...derivedRenderCache.catalogContext.filtered] : derivedRenderCache.catalogContext.filtered,
    marketSnapshot: derivedRenderCache.catalogContext.marketSnapshot,
    leadProduct: derivedRenderCache.catalogContext.leadProduct,
  };
}

export function getCatalogDecisionBoostContext() {
  const cacheKey = `${state.favoriteIds.join(",")}::${getShortlistStatusesSignature()}`;
  if (derivedRenderCache.decisionBoostKey === cacheKey && derivedRenderCache.decisionBoostContext) {
    return derivedRenderCache.decisionBoostContext;
  }

  const savedProducts = getShortlistSavedProducts();
  const championProduct = getShortlistChampionProduct(savedProducts);
  const backupProduct = getShortlistBackupProduct(savedProducts);
  const context = {
    championProduct,
    backupProduct,
    decisionKeys: [championProduct, backupProduct]
      .filter(Boolean)
      .map((entry) => getShortlistComparisonFamilyKey(entry)),
  };
  derivedRenderCache.decisionBoostKey = cacheKey;
  derivedRenderCache.decisionBoostContext = context;
  return context;
}

export function getCatalogDecisionBoost(product) {
  const { championProduct, backupProduct, decisionKeys } = getCatalogDecisionBoostContext();
  if (!championProduct && !backupProduct) return 0;
  let score = 0;

  if (product.id === championProduct?.id) score += 8;
  if (product.id === backupProduct?.id) score += 6;
  if (decisionKeys.includes(getShortlistComparisonFamilyKey(product)) && product.id !== championProduct?.id && product.id !== backupProduct?.id) {
    score += 4;
  }
  if (championProduct && product.category === championProduct.category) score += 1.25;
  if (backupProduct && product.category === backupProduct.category) score += 0.75;
  if (championProduct && product.concerns.some((concern) => championProduct.concerns.includes(concern))) score += 0.6;
  if (backupProduct && product.concerns.some((concern) => backupProduct.concerns.includes(concern))) score += 0.35;
  return score;
}

export function pinSavedCatalogDecisionLeaders(products, context = getCatalogRankingContext()) {
  if (!Array.isArray(products) || products.length <= 1 || state.sort !== "relevance") return products;

  const savedProducts = getShortlistSavedProducts();
  const championProduct = getShortlistChampionProduct(savedProducts);
  const backupProduct = getShortlistBackupProduct(savedProducts);
  const priorityIds = [championProduct?.id, backupProduct?.id]
    .filter((id, index, ids) => {
      if (!id || ids.indexOf(id) !== index) return false;
      const product = products.find((entry) => entry.id === id);
      if (!product) return false;
      if (!shouldFilterByCatalogCaseEligibility(context)) return true;
      return getCatalogCaseEvidence(product, context).leadEligible;
    });
  if (!priorityIds.length) return products;

  const priorityById = new Map(priorityIds.map((id, index) => [id, index]));
  products.sort((a, b) => {
    const aPriority = priorityById.has(a.id) ? priorityById.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bPriority = priorityById.has(b.id) ? priorityById.get(b.id) : Number.MAX_SAFE_INTEGER;
    return aPriority - bPriority;
  });
  return products;
}

export function scoreProduct(product, context = getCatalogRankingContext()) {
  let score = 0;
  if (state.concern !== "all" && product.concerns.includes(state.concern)) score += 4;
  if (state.retailer !== "all" && product.retailer === state.retailer) score += 2;
  if (state.category !== "all" && product.category === state.category) score += 1;
  if (state.search) score += scoreCatalogSearchIntent(product, state.search).total;
  const caseEvidence = getCatalogCaseEvidence(product, context);
  if (shouldFilterByCatalogCaseEligibility(context)) {
    score += caseEvidence.score * 1.8;
    if (caseEvidence.leadEligible) score += 10;
    else if (caseEvidence.supportEligible) score += 2;
    else score -= 10;
  }
  score += overlapBoost(product);
  score += getCatalogDecisionBoost(product);
  score += profileFitBoost(product, {
    goal: shouldFilterByCatalogCaseEligibility(context) ? 0.45 : 1.4,
    profile: 1.3,
    budget: 1,
    sensitivity: 1.15,
    actives: 1.05,
    avoid: 1,
  });
  return score;
}

const CATALOG_BROAD_REPRESENTATIVE_LANES = [
  { key: "review-confidence", label: "Review-confidence pick" },
  { key: "value", label: "Value pick" },
  { key: "barrier-repair", label: "Barrier repair pick", browseLaneKey: "barrier-repair" },
  { key: "daily-spf", label: "Daily SPF pick", browseLaneKey: "daily-spf" },
  { key: "sensitive-safe", label: "Sensitive-safe pick", browseLaneKey: "sensitive-skin-safe" },
  { key: "acne", label: "Acne pick", browseLaneKey: "best-acne-picks" },
  { key: "dark-spots", label: "Dark-spots pick", browseLaneKey: "dark-spot-picks" },
  { key: "retailer-check-ready", label: "Retailer-check-ready pick" },
];

let catalogBroadStartingPointCache = { key: "", ids: [], settledRevision: "" };

export function getCatalogBroadStartingPointCacheKey(context = getCatalogRankingContext()) {
  return stableJsonStringify({
    mode: getCatalogDecisionMode(context),
    retailer: state.retailer || "all",
    brand: state.brand || "all",
    category: state.category || "all",
    ingredient: state.ingredient || "all",
    concern: state.concern || "all",
    search: normalizeFocusedCatalogSearch(),
    sort: state.sort || "relevance",
    profile: state.profile || state.userProfile.profile || "all",
    goal: state.userProfile.goal || "",
    goalSource: state.userProfile.goalSource || "",
    budget: state.userProfile.budget || "",
    sensitivity: state.userProfile.sensitivity || "",
    activesComfort: state.userProfile.activesComfort || "",
    avoidIngredients: [...(state.userProfile.avoidIngredients || [])].sort(),
  });
}

export function getCatalogBroadCachedStartingProducts(products, cacheKey) {
  if (!cacheKey || catalogBroadStartingPointCache.key !== cacheKey || !catalogBroadStartingPointCache.ids.length) {
    return [];
  }
  const productById = new Map((products || []).map((product) => [product.id, product]));
  return catalogBroadStartingPointCache.ids.map((id) => productById.get(id)).filter(Boolean);
}

export function rememberCatalogBroadStartingProducts(products, cacheKey) {
  if (!cacheKey || !Array.isArray(products) || !products.length) return;
  catalogBroadStartingPointCache = {
    key: cacheKey,
    ids: products.slice(0, getCatalogBroadFirstScreenLimit()).map((product) => product.id),
    settledRevision: "",
  };
}

export function applyCatalogBroadStartingPointCache(products, cacheKey) {
  const cachedProducts = getCatalogBroadCachedStartingProducts(products, cacheKey);
  if (cachedProducts.length < Math.min(4, getCatalogBroadFirstScreenLimit())) return products;
  const currentRevision = getProductsRevisionKey();
  if (catalogBroadStartingPointCache.settledRevision && catalogBroadStartingPointCache.settledRevision !== currentRevision) {
    return products;
  }
  const catalogSettled = !Boolean(
    state.live?.catalog?.partial || state.live?.catalog?.fullRequestInFlight || state.live?.catalog?.loading,
  );
  if (catalogSettled && !catalogBroadStartingPointCache.settledRevision) {
    catalogBroadStartingPointCache = {
      ...catalogBroadStartingPointCache,
      settledRevision: currentRevision,
    };
  }
  const cachedIds = new Set(cachedProducts.map((product) => product.id));
  return [...cachedProducts, ...products.filter((product) => !cachedIds.has(product.id))];
}

export function hasCatalogRetailerCheckSignal(product) {
  if (!product) return false;
  const canonicalRetailers = Array.isArray(product.canonicalRetailers)
    ? product.canonicalRetailers
    : [];
  return Boolean(
    canonicalRetailers.length > 1 ||
      Number(product.comparisonRetailerCount || 0) > 1 ||
      (Array.isArray(product.closestEquivalentIds) && product.closestEquivalentIds.length) ||
      (Array.isArray(product.closestEquivalentMatches) && product.closestEquivalentMatches.length) ||
      Number(product.closestEquivalentGroupSize || 0) > 1 ||
      Number(product.closestEquivalentRetailerCount || 0) > 1,
  );
}

export function isCatalogPremiumProduct(product) {
  return typeof product?.price === "number" && product.price >= 120;
}

export function isCatalogPremiumBroadPathSelected() {
  return Boolean(state.userProfile.budget === "premium" || state.brand !== "all");
}

export function isCatalogBroadWeakDataProduct(product) {
  if (!product?.url) return true;
  const reviewCount = Number(product.reviewCount || 0);
  const rating = Number(product.rating);
  const hasReviewSignal = Number.isFinite(rating) && rating >= 4 && reviewCount >= 10;
  const hasRetailerSignal = hasCatalogRetailerCheckSignal(product);
  return !hasReviewSignal && !hasRetailerSignal;
}

export function isCatalogBroadRepresentativeCategory(product) {
  if (state.category !== "all") return true;
  return ["cleanser", "toner", "serum", "treatment", "moisturizer", "sunscreen", "mask", "eye care"].includes(
    product?.category,
  );
}

export function productMatchesCatalogBroadLane(product, lane) {
  if (!product || !lane) return false;
  const ingredients = getProductIngredientSet(product);
  const concerns = new Set(product.concerns || []);
  const browseLane = lane.browseLaneKey ? getBrowseLaneByKey(lane.browseLaneKey) : null;

  if (browseLane && browseLaneMatchesProduct(product, browseLane)) return true;
  if (lane.key === "review-confidence") {
    return typeof product.rating === "number" && product.rating >= 4.2 && Number(product.reviewCount || 0) >= 75;
  }
  if (lane.key === "value") {
    return typeof product.price === "number" && product.price <= 50 && (typeof product.rating !== "number" || product.rating >= 4);
  }
  if (lane.key === "barrier-repair") {
    return (
      ["dryness", "redness", "general care"].some((concern) => concerns.has(concern)) &&
      BARRIER_SUPPORT_INGREDIENTS.some((ingredient) => ingredients.has(ingredient))
    );
  }
  if (lane.key === "daily-spf") {
    return product.category === "sunscreen" || ingredients.has("spf");
  }
  if (lane.key === "sensitive-safe") {
    return isSensitiveSafeProduct(product);
  }
  if (lane.key === "acne") {
    return (
      concerns.has("acne") ||
      concerns.has("pores") ||
      ["salicylic acid", "benzoyl peroxide", "niacinamide", "retinol"].some((ingredient) => ingredients.has(ingredient))
    );
  }
  if (lane.key === "dark-spots") {
    return (
      concerns.has("dark spots") ||
      concerns.has("dullness") ||
      ["vitamin c", "niacinamide", "retinol", "glycolic acid", "lactic acid", "spf"].some((ingredient) =>
        ingredients.has(ingredient),
      )
    );
  }
  if (lane.key === "retailer-check-ready") {
    return hasCatalogRetailerCheckSignal(product);
  }
  return false;
}

export function scoreCatalogBroadLaneProduct(product, lane, scoreById, context = getCatalogRankingContext()) {
  const reviewCount = Number(product.reviewCount || 0);
  const rating = Number(product.rating || 0);
  let score = scoreById.get(product.id) ?? scoreProduct(product, context);

  if (reviewCount > 0) score += Math.min(4, Math.log10(reviewCount + 1) * 1.5);
  if (rating > 0) score += Math.max(0, rating - 4) * 2;
  if (hasCatalogRetailerCheckSignal(product)) score += 1.8;
  if (isCatalogPremiumProduct(product) && !isCatalogPremiumBroadPathSelected()) score -= 1.75;

  if (lane.key === "review-confidence") score += Math.min(4.5, reviewCount / 350) + Math.max(0, rating - 4.2) * 3;
  if (lane.key === "value" && typeof product.price === "number") score += Math.max(0, (55 - product.price) / 12);
  if (lane.key === "barrier-repair") {
    score += (product.ingredients || []).filter((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient)).length * 1.5;
  }
  if (lane.key === "daily-spf" && product.category === "sunscreen") score += 3;
  if (lane.key === "sensitive-safe" && isSensitiveSafeProduct(product)) score += 3;
  if (lane.key === "acne") {
    score += (product.concerns || []).filter((concern) => ["acne", "pores"].includes(concern)).length * 2;
  }
  if (lane.key === "dark-spots") {
    score += (product.concerns || []).filter((concern) => ["dark spots", "dullness", "texture"].includes(concern)).length * 1.7;
  }
  if (lane.key === "retailer-check-ready" && hasCatalogRetailerCheckSignal(product)) score += 3;

  if (getCatalogDecisionMode(context) === CATALOG_DECISION_MODES.SOFT_PERSONALIZED_BROAD) {
    score += getCatalogCaseEvidence(product, context).score * 0.35;
  }

  return score;
}

export function getCatalogBroadFirstScreenLimit() {
  return Math.max(8, Math.min(state.pageSize || 36, 12));
}

export function getCatalogBroadDiversityPenalty(product, selectedProducts, { strict = false } = {}) {
  if (!selectedProducts.length) return 0;
  const recentProducts = selectedProducts.slice(-getCatalogBroadFirstScreenLimit());
  const brandKey = normalizeComparableText(product.brand);
  const familyKey = getCatalogFamilyCollapseKey(product) || getComparableProductKey(product);
  const brandCount = recentProducts.filter((entry) => normalizeComparableText(entry.brand) === brandKey).length;
  const retailerCount = recentProducts.filter((entry) => entry.retailer === product.retailer).length;
  const categoryCount = recentProducts.filter((entry) => entry.category === product.category).length;
  const familyCount = familyKey
    ? recentProducts.filter((entry) => (getCatalogFamilyCollapseKey(entry) || getComparableProductKey(entry)) === familyKey).length
    : 0;
  const premiumCount = recentProducts.filter(isCatalogPremiumProduct).length;

  let penalty = 0;
  if (familyCount) penalty += strict ? 40 : 18;
  if (state.brand === "all") penalty += brandCount * (strict ? 18 : 6);
  if (state.retailer === "all" && retailerCount >= 2) penalty += (retailerCount - 1) * (strict ? 8 : 3);
  if (state.category === "all" && categoryCount >= 1) penalty += categoryCount * (strict ? 9 : 3.5);
  if (!isCatalogPremiumBroadPathSelected() && isCatalogPremiumProduct(product) && premiumCount) {
    penalty += strict ? 18 : 7;
  }
  return penalty;
}

export function isCatalogBroadDiversityAllowed(product, selectedProducts, { strict = false } = {}) {
  if (!selectedProducts.length) return true;
  const familyKey = getCatalogFamilyCollapseKey(product) || getComparableProductKey(product);
  if (
    familyKey &&
    selectedProducts.some((entry) => (getCatalogFamilyCollapseKey(entry) || getComparableProductKey(entry)) === familyKey)
  ) {
    return false;
  }
  if (state.brand === "all") {
    const brandCount = selectedProducts.filter(
      (entry) => normalizeComparableText(entry.brand) === normalizeComparableText(product.brand),
    ).length;
    if (brandCount >= (strict ? 1 : 2)) return false;
  }
  if (state.category === "all") {
    const categoryCount = selectedProducts.filter((entry) => entry.category === product.category).length;
    if (categoryCount >= (strict ? 1 : 2)) return false;
  }
  if (state.retailer === "all") {
    const retailerCount = selectedProducts.filter((entry) => entry.retailer === product.retailer).length;
    if (retailerCount >= (strict ? 2 : 3)) return false;
  }
  if (!isCatalogPremiumBroadPathSelected() && isCatalogPremiumProduct(product)) {
    const premiumCount = selectedProducts.filter(isCatalogPremiumProduct).length;
    if (premiumCount >= (strict ? 1 : 2)) return false;
  }
  return true;
}

export function pickCatalogBroadLaneRepresentative(products, lane, scoreById, selectedProducts, context = getCatalogRankingContext()) {
  const baseCandidates = products.filter(
    (product) =>
      !selectedProducts.some((entry) => entry.id === product.id) &&
      !isCatalogBroadWeakDataProduct(product) &&
      isCatalogBroadRepresentativeCategory(product) &&
      productMatchesCatalogBroadLane(product, lane),
  );
  const candidateSets = [
    baseCandidates.filter((product) => isCatalogBroadDiversityAllowed(product, selectedProducts, { strict: true })),
    baseCandidates.filter((product) => isCatalogBroadDiversityAllowed(product, selectedProducts, { strict: false })),
    baseCandidates,
  ];
  const candidates = candidateSets.find((entries) => entries.length) || [];
  if (!candidates.length) return null;

  return [...candidates].sort((a, b) => {
    const aScore =
      scoreCatalogBroadLaneProduct(a, lane, scoreById, context) -
      getCatalogBroadDiversityPenalty(a, selectedProducts, { strict: true });
    const bScore =
      scoreCatalogBroadLaneProduct(b, lane, scoreById, context) -
      getCatalogBroadDiversityPenalty(b, selectedProducts, { strict: true });
    return (
      bScore - aScore ||
      (b.reviewCount ?? -1) - (a.reviewCount ?? -1) ||
      (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER) ||
      a.name.localeCompare(b.name) ||
      a.id.localeCompare(b.id)
    );
  })[0] || null;
}

export function diversifyCatalogResultsWithSeed(products, scoreById, seedProducts = []) {
  const windowSize = Math.min(products.length, 120);
  if (windowSize <= 1) return products;

  const pool = products.slice(0, windowSize);
  const remainder = products.slice(windowSize);
  const selectedHistory = [...seedProducts];
  const selected = [];

  while (pool.length) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;
    let bestBaseScore = Number.NEGATIVE_INFINITY;

    pool.forEach((product, index) => {
      const baseScore = scoreById.get(product.id) ?? 0;
      const firstScreen = selectedHistory.length < getCatalogBroadFirstScreenLimit();
      const adjustedScore =
        baseScore -
        getCatalogDiversityPenalty(product, selectedHistory) -
        (firstScreen ? getCatalogBroadDiversityPenalty(product, selectedHistory, { strict: false }) : 0);
      const currentBest = pool[bestIndex];
      const shouldReplace =
        adjustedScore > bestAdjustedScore ||
        (adjustedScore === bestAdjustedScore && baseScore > bestBaseScore) ||
        (adjustedScore === bestAdjustedScore &&
          baseScore === bestBaseScore &&
          product.name.localeCompare(currentBest.name) < 0);

      if (shouldReplace) {
        bestIndex = index;
        bestAdjustedScore = adjustedScore;
        bestBaseScore = baseScore;
      }
    });

    const nextProduct = pool.splice(bestIndex, 1)[0];
    selected.push(nextProduct);
    selectedHistory.push(nextProduct);
  }

  return [...selected, ...remainder];
}

export function prioritizeCatalogSoftLensEligibleProducts(products, context = getCatalogRankingContext()) {
  if (getCatalogDecisionMode(context) !== CATALOG_DECISION_MODES.SOFT_PERSONALIZED_BROAD) {
    return products;
  }
  const eligible = [];
  const remaining = [];
  (products || []).forEach((product) => {
    const evidence = getCatalogCaseEvidence(product, context);
    (evidence.leadEligible || evidence.supportEligible ? eligible : remaining).push(product);
  });
  return eligible.length ? [...eligible, ...remaining] : products;
}

export function buildBroadCatalogRepresentativeResults(products, scoreById, context = getCatalogRankingContext()) {
  if (!Array.isArray(products) || products.length <= 1) return products;
  const selected = [];
  const cacheKey = getCatalogBroadStartingPointCacheKey(context);
  const catalogHydrating = Boolean(state.live?.catalog?.partial || state.live?.catalog?.fullRequestInFlight);

  CATALOG_BROAD_REPRESENTATIVE_LANES.forEach((lane) => {
    const representative = pickCatalogBroadLaneRepresentative(products, lane, scoreById, selected, context);
    if (representative) {
      selected.push(representative);
    }
  });

  if (!selected.length) {
    const fallback = prioritizeCatalogSoftLensEligibleProducts(
      collapseCatalogFamilyResults(diversifyCatalogResults(products, scoreById), scoreById),
      context,
    );
    if (catalogHydrating) {
      rememberCatalogBroadStartingProducts(fallback, cacheKey);
      return fallback;
    }
    return applyCatalogBroadStartingPointCache(fallback, cacheKey);
  }

  const selectedIds = new Set(selected.map((product) => product.id));
  const remaining = products
    .filter((product) => !selectedIds.has(product.id))
    .sort(
      (a, b) =>
        (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0) ||
        a.name.localeCompare(b.name) ||
        a.id.localeCompare(b.id),
    );
  const diversifiedFill = diversifyCatalogResultsWithSeed(remaining, scoreById, selected);
  const representativeResults = prioritizeCatalogSoftLensEligibleProducts(
    collapseCatalogFamilyResults([...selected, ...diversifiedFill], scoreById),
    context,
  );
  if (catalogHydrating) {
    rememberCatalogBroadStartingProducts(representativeResults, cacheKey);
    return representativeResults;
  }
  return applyCatalogBroadStartingPointCache(representativeResults, cacheKey);
}

export function getCatalogDiversityIngredientKey(product) {
  const rankingContext = getCatalogRankingContext();
  const focus = rankingContext.primaryConcern || rankingContext.concern;
  const priorityByFocus = {
    acne: ["salicylic acid", "niacinamide", "benzoyl peroxide", "retinol"],
    pores: ["salicylic acid", "niacinamide", "retinol"],
    dryness: ["ceramides", "hyaluronic acid", "squalane", "fragrance-free"],
    redness: ["fragrance-free", "ceramides", "niacinamide", "hyaluronic acid", "green tea", "squalane"],
    texture: ["glycolic acid", "lactic acid", "retinol", "salicylic acid"],
    "dark spots": ["vitamin c", "niacinamide", "retinol", "glycolic acid", "lactic acid"],
    dullness: ["vitamin c", "glycolic acid", "lactic acid", "niacinamide"],
    wrinkles: ["retinol", "peptides", "hyaluronic acid"],
    "general care": ["spf", "niacinamide", "hyaluronic acid"],
  };
  const priority = priorityByFocus[focus] || [];
  const matched = priority.find((ingredient) => product.ingredients.includes(ingredient));
  return matched || product.ingredients[0] || "";
}

export function getCatalogVariantPenalty(product) {
  const text = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
  let penalty = 0;

  if (/\bmini\b|\btravel(?: size)?\b|\btrial\b|\bsample\b/.test(text)) penalty += 3.6;
  if (/\brefill(?:able)?\b/.test(text)) penalty += 2.2;
  if (/\bkit\b|\bset\b|\bduo\b|\btrio\b|\bbundle\b|\bcollection\b|\bedit\b/.test(text)) penalty += 4.5;
  if (/\bvarious sizes\b|\bvarious shades\b/.test(text)) penalty += 1.4;

  return penalty;
}

export function normalizeCatalogVariantFamilyText(value) {
  return (value || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/\bmini\b|\btravel(?: size)?\b|\btrial\b|\bsample\b/g, " ")
    .replace(/\brefill(?:able)?\b/g, " ")
    .replace(/\bkit\b|\bset\b|\bduo\b|\btrio\b|\bbundle\b|\bcollection\b|\bedit\b/g, " ")
    .replace(/\bvarious (?:sizes|shades)\b/g, " ")
    .replace(/\b\d+(?:\.\d+)?\s*(?:ml|oz|fl oz|g|kg|lb|count|ct)\b/g, " ")
    .replace(/\b(serum|cream|cleanser|moisturizer|mask|treatment|gel|lotion|spf|sunscreen|essence|toner|face|facial)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCatalogFamilyCollapseKey(product) {
  if (!product) return "";
  const category = String(product.category || "").trim();
  const comparisonKey = String(product.comparisonKey || "").trim();
  if (comparisonKey) return `${comparisonKey}::${category}`;
  const brandKey = normalizeComparableText(product.brand);
  const familyNameKey = normalizeCatalogVariantFamilyText(product.name);
  if (!brandKey || !familyNameKey) return "";
  return `${brandKey}::${familyNameKey}::${category}`;
}

export function getCatalogDiversityPenalty(product, selectedProducts) {
  if (!selectedProducts.length) return 0;

  let penalty = 0;
  const recentProducts = selectedProducts.slice(-8);
  const searchDriven = Boolean((state.search || "").trim());
  const familyKey = getComparableProductKey(product);
  const familyCount = familyKey
    ? recentProducts.filter((entry) => getComparableProductKey(entry) === familyKey).length
    : 0;

  if (familyCount) {
    penalty += 8 + (familyCount - 1) * 3.5;
    if (!searchDriven) {
      penalty += getCatalogVariantPenalty(product);
    }
  }

  if (!searchDriven && state.brand === "all") {
    const recentBrandCount = recentProducts.filter(
      (entry) => normalizeComparableText(entry.brand) === normalizeComparableText(product.brand),
    ).length;
    penalty += recentBrandCount * 1.6;
  }

  if (!searchDriven && state.category === "all") {
    const recentCategoryCount = recentProducts.filter((entry) => entry.category === product.category).length;
    if (recentCategoryCount >= 2) {
      penalty += (recentCategoryCount - 1) * 0.85;
    }
  }

  if (!searchDriven && state.retailer === "all") {
    const recentRetailerCount = recentProducts.filter((entry) => entry.retailer === product.retailer).length;
    if (recentRetailerCount >= 3) {
      penalty += (recentRetailerCount - 2) * 0.45;
    }
  }

  if (!searchDriven) {
    penalty += getCatalogVariantPenalty(product);
    const ingredientKey = getCatalogDiversityIngredientKey(product);
    if (ingredientKey) {
      const recentIngredientCount = recentProducts.filter(
        (entry) => getCatalogDiversityIngredientKey(entry) === ingredientKey,
      ).length;
      if (recentIngredientCount >= 2) {
        penalty += (recentIngredientCount - 1) * 0.7;
      }
    }
  }

  return penalty;
}

export function diversifyCatalogResults(products, scoreById) {
  const windowSize = Math.min(products.length, 120);
  if (windowSize <= 1) return products;

  const pool = products.slice(0, windowSize);
  const remainder = products.slice(windowSize);
  const selected = [];

  while (pool.length) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;
    let bestBaseScore = Number.NEGATIVE_INFINITY;

    pool.forEach((product, index) => {
      const baseScore = scoreById.get(product.id) ?? 0;
      const adjustedScore = baseScore - getCatalogDiversityPenalty(product, selected);
      const currentBest = pool[bestIndex];
      const shouldReplace =
        adjustedScore > bestAdjustedScore ||
        (adjustedScore === bestAdjustedScore && baseScore > bestBaseScore) ||
        (adjustedScore === bestAdjustedScore &&
          baseScore === bestBaseScore &&
          product.name.localeCompare(currentBest.name) < 0);

      if (shouldReplace) {
        bestIndex = index;
        bestAdjustedScore = adjustedScore;
        bestBaseScore = baseScore;
      }
    });

    selected.push(pool.splice(bestIndex, 1)[0]);
  }

  return [...selected, ...remainder];
}

export function collapseCatalogFamilyResults(products, scoreById) {
  const searchDriven = Boolean((state.search || "").trim());
  if (searchDriven || products.length <= state.pageSize) return products;

  const prioritized = [];
  const deferred = [];
  const seenFamilies = new Set();

  products.forEach((product) => {
    const familyKey = getCatalogFamilyCollapseKey(product);
    if (!familyKey || !seenFamilies.has(familyKey)) {
      if (familyKey) seenFamilies.add(familyKey);
      prioritized.push(product);
      return;
    }

    deferred.push(product);
  });

  if (!deferred.length) return products;

  deferred.sort(
    (a, b) =>
      (scoreById.get(b.id) ?? 0) - (scoreById.get(a.id) ?? 0) ||
      a.name.localeCompare(b.name),
  );

  return [...prioritized, ...deferred];
}

export function scoreRoutineMatch(product, concern, step) {
  let score = 0;
  if (product.concerns.includes(concern)) score += 5;
  if (step.categories.includes(product.category)) score += 4;
  if (state.retailer !== "all" && product.retailer === state.retailer) score += 1;
  if (product.price != null) score += Math.max(0, 2 - product.price / 60);
  score += profileFitBoost(product, {
    goal: 1.5,
    profile: 1.25,
    budget: 1,
    sensitivity: 1.1,
    actives: 1.1,
    avoid: 1,
  });
  return score;
}

export function scoreRoutineBudgetFit(product, softCap) {
  if (typeof product.price !== "number") return 0;
  const mode = ROUTINE_BUDGETS[state.routineBudget] || ROUTINE_BUDGETS.smart;
  let score = 0;
  if (mode.cap && product.price <= softCap) score += mode.bias;
  if (mode.cap && product.price > softCap) score -= Math.min(3, (product.price - softCap) / 15);
  if (state.routineBudget === "premium") score += Math.min(2, product.price / 70);
  return score;
}

export function scoreRoutineConflictPenalty(product, selectedProducts) {
  return getProductConflictWarnings(product, {
    routineTime: state.routineTime,
    selectedProducts,
  }).length * -2.5;
}

export function scoreRoutineShortlistBoost(product, step) {
  if (!SHORTLIST_ACTIONABLE_STATUSES.has(getShortlistStatus(product.id))) return 0;
  let score = 2.5;
  if (step?.categories?.includes(product.category)) score += 2;
  return score;
}

export function getRoutineStepCandidates(step, selectedProducts, usedIds, softCap) {
  return state.products
    .filter((product) => !usedIds.has(product.id) && step.categories.includes(product.category))
    .map((product) => ({
      product,
      score:
        scoreRoutineMatch(product, state.routineConcern, step) +
        scoreRoutineBudgetFit(product, softCap) +
        scoreRoutineConflictPenalty(product, selectedProducts) +
        scoreRoutineShortlistBoost(product, step),
    }))
    .filter((entry) => entry.score >= 4)
    .sort((a, b) => b.score - a.score || (a.product.price ?? 0) - (b.product.price ?? 0));
}

export function estimateRemainingCoreFloor(steps, startIndex, selectedProducts, usedIds) {
  const budgetMode = ROUTINE_BUDGETS[state.routineBudget] || ROUTINE_BUDGETS.smart;
  const projectedSelected = [...selectedProducts];
  const projectedUsed = new Set(usedIds);
  let floorTotal = 0;

  for (let index = startIndex + 1; index < steps.length; index += 1) {
    const futureStep = steps[index];
    if (getRoutineStepPriority(futureStep) !== "core") continue;
    const candidates = getRoutineStepCandidates(
      futureStep,
      projectedSelected,
      projectedUsed,
      budgetMode.cap != null ? budgetMode.cap : Number.MAX_SAFE_INTEGER,
    );
    if (!candidates.length) continue;
    const priced = candidates.map((entry) => entry.product).filter((product) => typeof product.price === "number");
    const chosenFloor = priced.length
      ? [...priced].sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0]
      : candidates[0].product;
    projectedUsed.add(chosenFloor.id);
    projectedSelected.push(chosenFloor);
    floorTotal += chosenFloor.price || 0;
  }

  return floorTotal;
}

export function getRoutineProductFamilyKey(product) {
  return String(product?.comparisonKey || `${product?.brand || ""}::${product?.name || ""}`).trim();
}

export function scoreBestPick(product, retailer) {
  let score = 0;
  if (product.retailer === retailer) score += 4;

  if (["serum", "moisturizer", "sunscreen", "cleanser", "toner", "treatment"].includes(product.category)) {
    score += 3;
  }

  score += Math.min(product.concerns.length, 4);
  score += Math.min(product.ingredients.length, 3) * 0.75;

  if (product.category === "sunscreen") {
    score += 1;
  }

  if (product.price != null) score += Math.max(0, 2.5 - product.price / 90);
  score += profileFitBoost(product, {
    goal: 1.2,
    profile: 1.15,
    budget: 1,
    sensitivity: 1,
    actives: 1,
    avoid: 1,
  });
  return score;
}

export function scoreBudgetPick(product, retailer) {
  let score = 0;
  if (product.retailer === retailer) score += 4;
  if (["cleanser", "moisturizer", "sunscreen", "serum", "treatment"].includes(product.category)) score += 2;
  score += Math.min(product.concerns.length, 3) * 1.5;
  score += Math.min(product.ingredients.length, 2);
  if (product.price != null) score += Math.max(0, 4 - product.price / 35);
  score += profileFitBoost(product, {
    goal: 1.15,
    profile: 1.1,
    budget: 1.2,
    sensitivity: 1,
    actives: 1,
    avoid: 1,
  });
  return score;
}

export function scoreSensitivePick(product, retailer) {
  let score = 0;
  if (product.retailer === retailer) score += 4;
  if (["moisturizer", "cleanser", "sunscreen", "serum"].includes(product.category)) score += 2;
  if (product.concerns.includes("redness")) score += 3;
  if (product.concerns.includes("dryness")) score += 2;
  if (product.ingredients.includes("ceramides")) score += 2;
  if (product.ingredients.includes("hyaluronic acid")) score += 1.5;
  if (product.ingredients.includes("fragrance-free")) score += 2;
  if (product.price != null) score += Math.max(0, 2 - product.price / 80);
  score += profileFitBoost(product, {
    goal: 1.1,
    profile: 1.15,
    budget: 1,
    sensitivity: 1.35,
    actives: 1.1,
    avoid: 1,
  });
  return score;
}

export function scorePickByMode(product, retailer) {
  if (state.picksMode === "budget") return scoreBudgetPick(product, retailer);
  if (state.picksMode === "sensitive") return scoreSensitivePick(product, retailer);
  return scoreBestPick(product, retailer);
}

export function scoreBestOverall(product) {
  let score = 0;

  if (["serum", "moisturizer", "sunscreen", "cleanser", "toner", "treatment"].includes(product.category)) {
    score += 3;
  }

  score += Math.min(product.concerns.length, 4);
  score += Math.min(product.ingredients.length, 3) * 0.75;

  if (product.category === "sunscreen") {
    score += 1;
  }

  if (product.image) {
    score += 0.5;
  }

  if (product.price != null) score += Math.max(0, 2.5 - product.price / 90);
  score += profileFitBoost(product, {
    goal: 1.25,
    profile: 1.2,
    budget: 1,
    sensitivity: 1.05,
    actives: 1.05,
    avoid: 1,
  });
  return score;
}

export function formatList(items, limit = 2) {
  const visible = items.filter(Boolean).slice(0, limit);
  if (!visible.length) return "";
  if (visible.length === 1) return visible[0];
  if (visible.length === 2) return `${visible[0]} and ${visible[1]}`;
  return `${visible.slice(0, -1).join(", ")}, and ${visible[visible.length - 1]}`;
}

export function getProfileLabel(profileValue = state.profile) {
  return SKIN_PROFILES[normalizeSkinProfile(profileValue)]?.label || "All skin profiles";
}

export const PRIMARY_LENS_CONCERNS = new Set(["acne", "dryness", "redness", "texture", "dark spots", "wrinkles"]);

export function normalizeCatalogConcern(value) {
  return normalizeCatalogRankingConcern(value);
}

export function normalizeRoutineConcern(value, fallback = "dryness") {
  const normalized = normalizeCatalogConcern(value);
  return PRIMARY_LENS_CONCERNS.has(normalized) ? normalized : fallback;
}

export function getLensProfileConcerns(profileValue = state.profile) {
  const profile = SKIN_PROFILES[normalizeSkinProfile(profileValue)] || {};
  return (profile.concerns || [])
    .map((concern) => normalizeCatalogConcern(concern))
    .filter((concern, index, list) => concern !== "all" && list.indexOf(concern) === index);
}

export function getLensDefaultCatalogConcern({ goal = state.userProfile.goal, profile = state.profile } = {}) {
  const profileConcerns = getLensProfileConcerns(profile);
  const goalConcern = normalizeCatalogConcern(goal);
  if (profileConcerns.length) {
    if (PRIMARY_LENS_CONCERNS.has(goalConcern) && profileConcerns.includes(goalConcern)) {
      return goalConcern;
    }
    return profileConcerns.find((concern) => PRIMARY_LENS_CONCERNS.has(concern)) || goalConcern;
  }
  return PRIMARY_LENS_CONCERNS.has(goalConcern) ? goalConcern : "all";
}

export function normalizeUserProfileGoalForLens(goal = "dryness", profile = state.profile) {
  const profileKey = normalizeSkinProfile(profile || "all");
  const goalConcern = normalizeRoutineConcern(goal, "dryness");
  if (profileKey !== "all") {
    return getLensDefaultCatalogConcern({ goal: goalConcern, profile: profileKey });
  }
  return goalConcern === "all" ? "dryness" : goalConcern;
}

export function resolveLensCatalogConcern({
  concern = state.concern,
  goal = state.userProfile.goal,
  profile = state.profile,
} = {}) {
  const activeConcern = normalizeCatalogConcern(concern);
  if (activeConcern !== "all") return activeConcern;
  return getLensDefaultCatalogConcern({ goal, profile });
}

export function normalizeSavedCatalogConcern(source = {}) {
  const concern = normalizeCatalogConcern(source?.concern || "all");
  if (concern === "all") return "all";
  if (source?.concernSource === "explicit") return concern;
  return "all";
}

export function getBudgetLabel(budgetValue = state.userProfile.budget) {
  const labels = {
    any: "Open budget",
    budget: "Value first",
    balanced: "Balanced spend",
    premium: "Premium okay",
  };
  return labels[budgetValue] || "Open budget";
}

const PUBLIC_SAVED_FILTER_ALLOWLISTS = {
  retailer: new Set(["all", "Bluemercury", "Dermstore", "Sephora"]),
  brand: new Set(["all", "Demo Lab", "Placeholder Skin", "Sample Science"]),
  category: new Set(["all", "cleanser", "moisturizer", "serum", "sunscreen"]),
  ingredient: new Set([
    "all",
    "allantoin",
    "ceramides",
    "glycerin",
    "green tea",
    "niacinamide",
    "oat",
    "panthenol",
    "squalane",
    "vitamin e",
    "zinc oxide",
  ]),
  sort: new Set(["relevance", "top-rated", "most-reviewed", "price-asc", "price-desc", "brand"]),
};

function normalizeSavedFilterValue(field, value, fallback = "all") {
  return typeof value === "string" && PUBLIC_SAVED_FILTER_ALLOWLISTS[field]?.has(value) ? value : fallback;
}

export function createSavedProfileFilters(source = {}) {
  const profile = normalizeSkinProfile(source?.profile || "all");
  const goal = normalizeUserProfileGoalForLens(
    typeof source?.goal === "string" && source.goal ? source.goal : "dryness",
    profile,
  );
  const goalSource = normalizeCatalogGoalSource({
    goal,
    profile,
    goalSource: source?.goalSource || (profile !== "all" || normalizeCatalogConcern(goal) !== "dryness" ? "saved-profile" : "default"),
  });
  const concern = normalizeSavedCatalogConcern(source);
  return {
    browseLaneKey: getBrowseLaneByKey(source?.browseLaneKey)?.key || null,
    profile,
    retailer: normalizeSavedFilterValue("retailer", source?.retailer),
    brand: normalizeSavedFilterValue("brand", source?.brand),
    category: normalizeSavedFilterValue("category", source?.category),
    ingredient: normalizeSavedFilterValue("ingredient", source?.ingredient),
    concern,
    concernSource: concern !== "all" ? "explicit" : "all",
    search: typeof source?.search === "string" ? source.search.slice(0, 120) : "",
    sort: normalizeSavedFilterValue("sort", source?.sort, "relevance"),
    goal,
    goalSource,
    budget: ["any", "budget", "balanced", "premium"].includes(source?.budget) ? source.budget : "any",
    sensitivity: ["low", "moderate", "high"].includes(source?.sensitivity) ? source.sensitivity : "moderate",
    activesComfort: ["low", "medium", "high"].includes(source?.activesComfort) ? source.activesComfort : "medium",
    avoidIngredients: Array.isArray(source?.avoidIngredients)
      ? source.avoidIngredients.filter((ingredient) => AVOID_INGREDIENT_OPTIONS.includes(ingredient))
      : [],
  };
}

export function getCurrentProfileFiltersSnapshot() {
  return createSavedProfileFilters({
    browseLaneKey: state.browseLaneKey,
    profile: state.profile,
    retailer: state.retailer,
    brand: state.brand,
    category: state.category,
    ingredient: state.ingredient,
    concern: state.concern,
    concernSource: state.concern !== "all" ? "explicit" : "all",
    search: state.search,
    sort: state.sort,
    goal: state.userProfile.goal,
    goalSource: state.userProfile.goalSource,
    budget: state.userProfile.budget,
    sensitivity: state.userProfile.sensitivity,
    activesComfort: state.userProfile.activesComfort,
    avoidIngredients: state.userProfile.avoidIngredients,
  });
}

export function getSavedProfileFiltersSignature(source = getCurrentProfileFiltersSnapshot()) {
  return JSON.stringify(createSavedProfileFilters(source));
}

export function isSavedProfileEntryActive(entry) {
  return getSavedProfileFiltersSignature(entry?.filters || {}) === getCurrentProfileSignature();
}

export function getSavedProfileCardSummary(entry) {
  const filters = createSavedProfileFilters(entry?.filters || {});
  const goalLabel = titleCase(filters.goal);
  const profileLabel = filters.profile === "all" ? "Broad view" : getProfileLabel(filters.profile);
  const budgetLabel = getBudgetLabel(filters.budget);
  const browseLaneLabel = filters.browseLaneKey ? getBrowseLaneByKey(filters.browseLaneKey)?.label : null;
  return {
    primary: [goalLabel, profileLabel].filter(Boolean).join(" · "),
    secondary: [budgetLabel, browseLaneLabel || null, filters.retailer !== "all" ? filters.retailer : null].filter(Boolean).join(" · "),
  };
}

export function getSavedRoutineCardSummary(entry) {
  const config = entry?.config || {};
  const timingLabel = String(config.routineTime || state.routineTime || "am").toUpperCase();
  const goalLabel = titleCase(config.routineConcern || state.routineConcern || "dryness");
  const budgetLabel = ROUTINE_BUDGETS[config.routineBudget]?.label || ROUTINE_BUDGETS.smart.label;
  const profileLabel = config.profile && config.profile !== "all" ? getProfileLabel(config.profile) : "Broad view";
  return {
    primary: `${timingLabel} routine · ${goalLabel}`,
    secondary: [budgetLabel, profileLabel, config.retailer && config.retailer !== "all" ? config.retailer : null].filter(Boolean).join(" · "),
  };
}

export function getRetailerSignature(retailer) {
  return RETAILER_SIGNATURES[retailer] || {
    badge: "Synthetic offer set",
    summary: "Compare only the fictional products and fields visible in this showcase.",
    strength: "Any lead is computed from the current fictional fixture.",
    caution: "Do not infer real-world retailer positioning from this demo.",
  };
}

export function getPrimaryProductCaution(product, options = {}) {
  if (!product) return "No major caution surfaced first.";
  const warnings = getProductConflictWarnings(product, { routineTime: options.routineTime || state.routineTime });
  return warnings[0] || `No major ${String(options.routineTime || state.routineTime).toUpperCase()} caution surfaced first.`;
}

export function getUserProfileGuidance(profile = getSavedUserProfileRecord()) {
  const nextProfile = createUserProfileRecord(profile);
  const goalLabel = titleCase(nextProfile.goal);
  const budgetLabel = getBudgetLabel(nextProfile.budget).toLowerCase();
  const profileLabel = nextProfile.profile === "all" ? "broad cross-store browse" : getProfileLabel(nextProfile.profile).toLowerCase();
  const activesLabel = getActivesComfortLabel(nextProfile.activesComfort).toLowerCase();
  const avoidLabel = nextProfile.avoidIngredients.length
    ? `Avoiding ${formatList(nextProfile.avoidIngredients.slice(0, 2).map((ingredient) => titleCase(ingredient)), 2).toLowerCase()} keeps stronger mismatches down.`
    : "No ingredient exclusions are holding products back right now.";

  if (nextProfile.sensitivity === "high") {
    return {
      kicker: "How this lens behaves",
      title: `Bias toward calmer ${goalLabel.toLowerCase()} decisions`,
      copy: `Ranking stays conservative for ${profileLabel}, ${budgetLabel}, and ${state.routineTime.toUpperCase()} routine planning. ${avoidLabel}`,
    };
  }

  return {
    kicker: "How this lens behaves",
    title: `${goalLabel} stays first without collapsing the field too fast`,
    copy: `This keeps the catalog tuned to ${profileLabel}, ${budgetLabel}, and ${activesLabel} so the shortlist, retailer call, and ${state.routineTime.toUpperCase()} routine build stay aligned. ${avoidLabel}`,
  };
}

export function getSupportFlowCaption(sectionId = state.ui.activeSupportSection) {
  const captions = DECISION_DESK_COPY.supportFlowCaptions;
  return captions[sectionId] || captions["shopping-brief-panel"];
}

export function syncSupportFlowState(sectionId = state.ui.activeSupportSection) {
  state.ui.activeSupportSection = sectionId || state.ui.activeSupportSection || "shopping-brief-panel";
  supportFlowChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.supportFlow === state.ui.activeSupportSection);
  });
  if (supportFlowCaption) {
    supportFlowCaption.textContent = getSupportFlowCaption(state.ui.activeSupportSection);
  }
}

export function averagePrice(products) {
  const prices = products.map((product) => product.price).filter((price) => typeof price === "number");
  if (!prices.length) return null;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

export function parseTimestamp(value) {
  if (!value) return null;
  if (typeof value === "number") {
    return new Date(value > 10_000_000_000 ? value : value * 1000);
  }
  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    const numericValue = Number(value);
    return new Date(numericValue > 10_000_000_000 ? numericValue : numericValue * 1000);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function nowIso() {
  return new Date().toISOString();
}

export function toIsoTimestamp(value, fallback = null) {
  const parsed = parseTimestamp(value);
  return parsed ? parsed.toISOString() : fallback;
}

export function stableJsonStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJsonStringify(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function scheduleAfterCatalogCardsPaint(callback) {
  if (typeof callback !== "function") return;
  const run = () => {
    try {
      callback();
    } catch (error) {
      window.setTimeout(() => {
        throw error;
      }, 0);
    }
  };
  if (!window.requestAnimationFrame) {
    window.setTimeout(run, 0);
    return;
  }
  window.requestAnimationFrame(() => {
    window.setTimeout(run, 0);
  });
}

export function scheduleCatalogSecondarySurfaceRefresh({
  routine = false,
  bestPicks = false,
  articles = false,
  favorites = false,
  trackedAlerts = false,
  routineDraftSync = false,
} = {}) {
  scheduleAfterCatalogCardsPaint(() => {
    if (routine) renderRoutineBuilder();
    if (bestPicks) renderBestPicks();
    if (articles) renderArticles();
    if (favorites) renderFavorites();
    if (trackedAlerts) renderTrackedAlertsPanel();
    if (routineDraftSync) syncRoutinePlannerDraftSoon();
  });
}

export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function generateLocalId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function loadUiSessionState() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(UI_SESSION_STORAGE_KEY) || "{}");
    if (saved?.workMode === true) {
      state.ui.workMode = true;
      state.ui.lastWorkView = ["catalog", "workspace", "shortlist"].includes(saved?.lastWorkView)
        ? saved.lastWorkView
        : "catalog";
      state.ui.activeShellView = state.ui.lastWorkView;
    } else if (["overview", "catalog", "workspace", "shortlist"].includes(saved?.activeShellView)) {
      state.ui.activeShellView = saved.activeShellView;
    }
    if (WORKSPACE_TAB_IDS.includes(saved?.activeWorkspaceTab)) {
      state.ui.activeWorkspaceTab = saved.activeWorkspaceTab;
      state.ui.activeSupportSection = saved.activeWorkspaceTab;
    }
    if (saved?.catalogDensity === "compact") {
      state.ui.catalogDensity = "compact";
    }
    if (saved?.secondaryFiltersOpen === true) {
      state.ui.secondaryFiltersOpen = true;
    }
    if (saved?.catalogFocusRailOpen === true) {
      state.ui.catalogFocusRailOpen = true;
    }
  } catch {
    // Ignore malformed UI session state and fall back to defaults.
  }
  const routedShellView = resolveShellViewFromPathname();
  if (routedShellView === "overview") {
    state.ui.workMode = false;
    state.ui.activeShellView = "overview";
    state.ui.lastWorkView = "catalog";
    return;
  }
  if (routedShellView && routedShellView !== "overview") {
    state.ui.workMode = true;
    state.ui.activeShellView = routedShellView;
    state.ui.lastWorkView = routedShellView;
  }
}

export function persistUiSessionState() {
  try {
    window.sessionStorage.setItem(
      UI_SESSION_STORAGE_KEY,
      JSON.stringify({
        workMode: Boolean(state.ui.workMode),
        activeShellView: state.ui.activeShellView,
        lastWorkView: state.ui.lastWorkView,
        activeWorkspaceTab: WORKSPACE_TAB_IDS.includes(state.ui.activeWorkspaceTab)
          ? state.ui.activeWorkspaceTab
          : "shopping-brief-panel",
        catalogDensity: state.ui.catalogDensity === "compact" ? "compact" : "decision",
        secondaryFiltersOpen: Boolean(state.ui.secondaryFiltersOpen),
        catalogFocusRailOpen: Boolean(state.ui.catalogFocusRailOpen),
      }),
    );
  } catch {
    // Ignore session persistence failures and keep the current UI state.
  }
}

export function setRootPixelProperty(name, value) {
  document.documentElement.style.setProperty(name, `${Math.max(0, Math.ceil(value))}px`);
}

export function syncCatalogStickyOffsets() {
  const shellRect = workspaceSupernavShell?.getBoundingClientRect();
  const shellBottom = shellRect && shellRect.height
    ? Math.min(window.innerHeight, Math.max(0, shellRect.bottom))
    : 0;
  const controlsRect = controlsPanel && !controlsPanel.hidden
    ? controlsPanel.getBoundingClientRect()
    : null;
  const controlsHeight = controlsRect?.height || 0;
  const controlsTop = shellBottom ? shellBottom + 10 : 92;
  const safeOffset = controlsTop + controlsHeight + 16;
  setRootPixelProperty("--workspace-sticky-top", controlsTop);
  setRootPixelProperty("--workspace-anchor-offset", controlsTop + 24);
  setRootPixelProperty("--controls-stack-height", controlsHeight);
  setRootPixelProperty("--catalog-sticky-safe-offset", safeOffset);
}

export function syncCatalogResultsReadyState(hasRenderedCards = null) {
  const hasCards = hasRenderedCards == null
    ? Boolean(productGrid?.querySelector(".product-card"))
    : Boolean(hasRenderedCards);
  const isReady = state.ui.activeShellView === "catalog" && hasCards;
  document.body.classList.toggle("catalog-results-ready", isReady);
}

export function syncCatalogStickyState() {
  if (!controlsPanel) return;
  const shouldCompress =
    state.ui.activeShellView === "catalog" &&
    !isMobileCatalogViewport() &&
    !state.ui.secondaryFiltersOpen &&
    window.scrollY > 92;
  const changed = controlsPanel.classList.toggle("is-compact-sticky", shouldCompress);
  controlsPanel.dataset.stickyState = shouldCompress ? "compressed" : "expanded";
  document.body.classList.toggle("catalog-sticky-compressed", shouldCompress);
  if (changed) {
    requestAnimationFrame(syncCatalogStickyOffsets);
  }
}

export function setupCatalogStickyOffsetSync() {
  if (!("ResizeObserver" in window) || catalogStickyResizeObserver) return;
  catalogStickyResizeObserver = new ResizeObserver(() => {
    syncCatalogStickyOffsets();
    positionOpenRetailerPopover();
  });
  [
    workspaceSupernavShell,
    workModeCaseHeader,
    controlsPanel,
    catalogCommandBar,
    activeFilters,
    decisionStrip,
  ].forEach((element) => {
    if (element) catalogStickyResizeObserver.observe(element);
  });
}

export function hasActiveSecondaryCatalogFilters() {
  return state.brand !== "all" || state.ingredient !== "all" || state.profile !== "all";
}

export function getActiveCatalogFilterCount() {
  const activeLane = getActiveBrowseLane();
  const hasExplicitSort = state.sort !== "relevance" && (!activeLane?.sort || state.sort !== activeLane.sort);
  return [
    state.browseLaneKey,
    state.profile !== "all",
    state.retailer !== "all",
    state.brand !== "all",
    state.category !== "all",
    state.ingredient !== "all",
    state.concern !== "all",
    Boolean(state.search),
    hasExplicitSort,
  ].filter(Boolean).length;
}

export function isMobileCatalogViewport() {
  return Boolean(window.matchMedia?.("(max-width: 720px)").matches);
}

export function shouldShowCatalogProofHighlights() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(CATALOG_PROOF_HIGHLIGHT_QUERY_PARAM) === CATALOG_PROOF_HIGHLIGHT_VALUE;
  } catch {
    return false;
  }
}

export function syncCatalogProofHighlights() {
  document.body.classList.toggle(
    "catalog-proof-highlight",
    state.ui.activeShellView === "catalog" && shouldShowCatalogProofHighlights(),
  );
}

export function syncCatalogFilterDisclosure() {
  const activeFilterCount = getActiveCatalogFilterCount();
  const isMobile = isMobileCatalogViewport();
  const shouldOpen = isMobile
    ? Boolean(state.ui.secondaryFiltersOpen)
    : Boolean(state.ui.secondaryFiltersOpen || hasActiveSecondaryCatalogFilters());
  if (catalogSecondaryFilters) {
    catalogSecondaryFilters.hidden = !shouldOpen;
  }
  if (controlsPanel) {
    controlsPanel.classList.toggle("is-expanded", shouldOpen);
    controlsPanel.classList.toggle("has-active-filters", activeFilterCount > 0);
    controlsPanel.dataset.activeFilterCount = String(activeFilterCount);
  }
  if (catalogMoreFiltersButton) {
    catalogMoreFiltersButton.setAttribute("aria-expanded", String(shouldOpen));
    catalogMoreFiltersButton.textContent = shouldOpen
      ? isMobile
        ? "Done"
        : "Hide filters"
      : isMobile
        ? activeFilterCount
          ? `Filters (${activeFilterCount})`
          : "Filters"
        : activeFilterCount
          ? `More filters (${activeFilterCount})`
          : "More filters";
  }
  syncCatalogFocusRailDisclosure();
  syncCatalogStickyState();
}

export function shouldShowCatalogFocusRail() {
  if (!isMobileCatalogViewport()) return true;
  return !getActiveCatalogFocusDescriptor() || Boolean(state.ui.catalogFocusRailOpen);
}

export function syncCatalogFocusRailDisclosure() {
  const activeFocus = getActiveCatalogFocusDescriptor();
  const activeFocusLabel = activeFocus?.mobileLabel || activeFocus?.label || "";
  const isMobile = isMobileCatalogViewport();
  const focusRailOpen = shouldShowCatalogFocusRail();
  const focusRailVisible = focusRailOpen && !(isMobile && state.ui.secondaryFiltersOpen);
  const browseBar = browseLanes?.closest(".catalog-browse-bar");
  if (browseBar) {
    browseBar.classList.toggle("has-active-focus", Boolean(activeFocus));
    browseBar.classList.toggle("is-focus-open", focusRailOpen);
    browseBar.dataset.activeFocusLabel = activeFocusLabel;
    browseBar.setAttribute("aria-hidden", String(!focusRailVisible));
  }
  if (controlsPanel) {
    controlsPanel.classList.toggle("is-focus-open", focusRailOpen);
  }
  if (catalogFocusToggleButton) {
    catalogFocusToggleButton.hidden = !isMobile;
    catalogFocusToggleButton.setAttribute("aria-expanded", String(focusRailVisible));
    catalogFocusToggleButton.classList.toggle("is-open", focusRailOpen);
    catalogFocusToggleButton.setAttribute(
      "aria-label",
      focusRailVisible ? "Hide catalog focus options" : "Show catalog focus options",
    );
    catalogFocusToggleButton.textContent = "Focus";
  }
}

export function setMobileCatalogFocusRailOpen(open) {
  if (!isMobileCatalogViewport()) return;
  state.ui.catalogFocusRailOpen = Boolean(open);
  if (open) {
    state.ui.secondaryFiltersOpen = false;
  }
  persistUiSessionState();
  syncCatalogFilterDisclosure();
  renderBrowseLanes();
  syncCatalogStickyOffsets();
}

export function openMobileCatalogFocusRail() {
  setMobileCatalogFocusRailOpen(true);
}

export function toggleMobileCatalogFocusRail() {
  if (state.ui.secondaryFiltersOpen || !getActiveCatalogFocusDescriptor()) {
    setMobileCatalogFocusRailOpen(true);
    return;
  }
  setMobileCatalogFocusRailOpen(!state.ui.catalogFocusRailOpen);
}

export function getShellViewHeading(view) {
  const selectorByView = {
    overview: "#overview-panel h1",
    catalog: "#catalog-view-heading",
    workspace: "#workspace-view-heading",
    shortlist: "#shortlist-view-heading",
  };
  return document.querySelector(selectorByView[view] || selectorByView.catalog);
}

export function focusShellView(view) {
  requestAnimationFrame(() => {
    getShellViewHeading(view)?.focus({ preventScroll: true });
  });
}

export function setupShellScrollRestoration() {
  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch {
    // Keep native restoration if the browser does not allow manual control.
  }
}

export function getDocumentMaxScrollY() {
  const root = document.documentElement;
  const body = document.body;
  return Math.max(0, Math.max(root?.scrollHeight || 0, body?.scrollHeight || 0) - window.innerHeight);
}

export function clampShellScrollY(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(Math.max(0, numeric), getDocumentMaxScrollY()) : 0;
}

export function getShellHistoryScrollY(historyState) {
  const scrollY = Number(historyState?.shellScrollY);
  return Number.isFinite(scrollY) ? Math.max(0, scrollY) : null;
}

export function getSavedShellScrollY(view) {
  const scrollY = Number(shellScrollYByView[view]);
  return SHELL_VIEW_KEYS.includes(view) && Number.isFinite(scrollY) ? Math.max(0, scrollY) : 0;
}

export function rememberShellScrollPosition(view = state.ui.activeShellView, { updateHistoryState = true } = {}) {
  if (!SHELL_VIEW_KEYS.includes(view)) return;
  const scrollY = clampShellScrollY(window.scrollY || window.pageYOffset || 0);
  shellScrollYByView[view] = scrollY;
  if (!updateHistoryState || !window.history?.replaceState) return;
  try {
    const currentState = window.history.state || {};
    if (currentState.shellView === view) {
      window.history.replaceState({ ...currentState, shellScrollY: scrollY }, "", window.location.href);
    }
  } catch {
    // Ignore history-state write failures; in-memory restoration still works.
  }
}

export function restoreShellScrollPosition(view, explicitScrollY = null) {
  if (!SHELL_VIEW_KEYS.includes(view)) return;
  const requestedScrollY = explicitScrollY == null ? getSavedShellScrollY(view) : Number(explicitScrollY);
  if (pendingShellScrollFrame != null) {
    window.cancelAnimationFrame(pendingShellScrollFrame);
  }
  pendingShellScrollFrame = window.requestAnimationFrame(() => {
    pendingShellScrollFrame = null;
    window.scrollTo({
      top: clampShellScrollY(requestedScrollY),
      left: 0,
      behavior: "auto",
    });
  });
}

export function focusConcernLauncherTarget() {
  requestAnimationFrame(() => {
    const target =
      concernChips?.querySelector('.chip[data-concern]:not([data-concern="all"])') ||
      concernChips?.querySelector(".chip");
    target?.focus({ preventScroll: true });
  });
}

export function setupButtonArrowNavigation(buttons, { activate = false } = {}) {
  const entries = Array.from(buttons || []).filter(Boolean);
  if (!entries.length) return;
  const handledKeys = new Set(["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]);
  entries.forEach((button) => {
    button.addEventListener("keydown", (event) => {
      if (!handledKeys.has(event.key)) return;
      const available = entries.filter((entry) => !entry.disabled && !entry.hidden && !entry.closest("[hidden]"));
      if (!available.length) return;
      const currentIndex = Math.max(0, available.indexOf(event.currentTarget));
      let nextIndex = currentIndex;
      if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = available.length - 1;
      } else {
        const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
        nextIndex = (currentIndex + direction + available.length) % available.length;
      }
      event.preventDefault();
      const nextButton = available[nextIndex];
      nextButton.focus({ preventScroll: true });
      if (activate) {
        nextButton.click();
      }
    });
  });
}

export function getDefaultConcernLaunchValue() {
  const preferredGoal = state.userProfile.goal || state.routineConcern || "all";
  if (preferredGoal !== "all" && preferredGoal !== "general care" && state.metadata?.concerns?.includes(preferredGoal)) {
    return preferredGoal;
  }
  return state.metadata?.concerns?.find((concern) => concern !== "general care") || "all";
}

export function getOverviewLaunchIngredientValue() {
  const ingredientCandidatesByGoal = {
    acne: ["salicylic acid", "niacinamide"],
    dryness: ["hyaluronic acid", "ceramides"],
    redness: ["niacinamide", "ceramides"],
    "dark spots": ["vitamin c", "niacinamide"],
    dullness: ["vitamin c", "glycolic acid"],
    texture: ["glycolic acid", "retinol"],
    wrinkles: ["retinol", "vitamin c"],
  };
  const candidatePool = new Set(state.products.flatMap((product) => product.ingredients || []));
  const goal = state.userProfile.goal || state.routineConcern || "dryness";
  const candidates = ingredientCandidatesByGoal[goal] || ingredientCandidatesByGoal.dryness;
  return candidates.find((ingredient) => candidatePool.has(ingredient)) || "all";
}

export function syncCatalogFilterControls() {
  retailerFilter.value = state.retailer;
  brandFilter.value = state.brand;
  categoryFilter.value = state.category;
  ingredientFilter.value = state.ingredient;
  profileFilter.value = state.profile;
  sortFilter.value = state.sort;
  searchInput.value = state.search;
  syncCatalogFilterDisclosure();
}

export function setConcernChipSelection(concern) {
  concernChips?.querySelectorAll(".chip").forEach((chip) => {
    const selected = chip.dataset.concern === concern;
    chip.classList.toggle("active", selected);
    chip.setAttribute("aria-pressed", String(selected));
  });
}

export function applyOverviewLaunch(launchMode) {
  enterWorkMode("catalog");
  setActiveShellView("catalog", { focus: false });

  if (launchMode === "budget") {
    state.retailer = "all";
    state.brand = "all";
    state.category = "all";
    state.ingredient = "all";
    state.concern = "all";
    state.search = "";
    syncCatalogFilterControls();
    applyBrowseLane("under-50");
    return;
  }

  clearBrowseLaneSelection({ resetSort: true });
  state.page = 1;

  if (launchMode === "concern") {
    state.concern = getDefaultConcernLaunchValue();
    state.retailer = "all";
    state.brand = "all";
    state.category = "all";
    state.ingredient = "all";
    state.search = "";
    setConcernChipSelection(state.concern);
    syncCatalogFilterControls();
    renderProducts();
    scheduleCatalogSecondarySurfaceRefresh({ routine: true, bestPicks: true });
    requestAnimationFrame(() => {
      focusConcernLauncherTarget();
    });
    return;
  }

  state.concern = "all";
  setConcernChipSelection("all");
  if (launchMode === "ingredient") {
    state.retailer = "all";
    state.ingredient = getOverviewLaunchIngredientValue();
    state.category = "all";
    state.brand = "all";
    state.search = "";
    syncCatalogFilterControls();
    renderProducts();
    scheduleCatalogSecondarySurfaceRefresh({ routine: true, bestPicks: true });
    requestAnimationFrame(() => {
      ingredientFilter?.focus({ preventScroll: true });
    });
    return;
  }

  if (launchMode === "retailer") {
    const retailerLead = getMarketViewSnapshot(state.products).leadingRetailer || "all";
    state.retailer = retailerLead;
    state.brand = "all";
    state.category = "all";
    state.ingredient = "all";
    state.search = "";
    syncCatalogFilterControls();
    renderProducts();
    scheduleCatalogSecondarySurfaceRefresh({ routine: true, bestPicks: true });
    requestAnimationFrame(() => {
      retailerFilter?.focus({ preventScroll: true });
    });
    return;
  }

  syncCatalogFilterControls();
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({ routine: true, bestPicks: true });
}

export function closeShellTransientUi() {
  if (state.ui.openRoutineChooserStep) {
    closeRoutineChooser();
  }
  state.ui.openRetailerCompareId = null;
  syncRetailerPopoverChromeInterlocks();
  productGrid?.querySelectorAll(".compare-popover[open]").forEach((popover) => {
    popover.open = false;
  });
}

export function setActiveShellView(
  view,
  { focus = true, updateHistory = true, replaceHistory = false, restoreScroll = true, restoreScrollY = null } = {},
) {
  if (!Object.hasOwn(SHELL_VIEW_CONTEXT, view)) {
    view = "catalog";
  }
  const previousView = state.ui.activeShellView;
  const viewChanged = previousView !== view;
  if (viewChanged) {
    rememberShellScrollPosition(previousView);
  }
  if (view === "shortlist" && state.ui.activeShellView !== "shortlist") {
    state.ui.shortlistReturnView =
      state.ui.activeShellView && state.ui.activeShellView !== "overview"
        ? state.ui.activeShellView
        : state.ui.lastWorkView || "catalog";
  }
  closeShellTransientUi();
  state.ui.activeShellView = view;
  state.ui.workMode = view !== "overview";
  if (view !== "overview") {
    state.ui.lastWorkView = view;
  }
  if (updateHistory) {
    syncShellHistory(view, { replace: replaceHistory });
  }
  persistUiSessionState();
  syncWorkModeUi();
  syncSupportDisclosureUi();
  renderActiveShellSurface({ force: true });
  if (viewChanged && restoreScroll) {
    restoreShellScrollPosition(view, restoreScrollY);
  }
  if (focus) {
    focusShellView(view);
  }
}

export function enterWorkMode(view = "catalog") {
  const nextView = Object.hasOwn(SHELL_VIEW_CONTEXT, view) ? view : "catalog";
  if (!state.ui.workMode) {
    state.ui.workMode = true;
  }
  if (state.ui.activeShellView === "overview" || !state.ui.activeShellView) {
    rememberShellScrollPosition("overview");
    state.ui.activeShellView = nextView;
  }
  if (state.ui.activeShellView !== "overview") {
    state.ui.lastWorkView = state.ui.activeShellView;
  }
  persistUiSessionState();
  syncWorkModeUi();
  syncSupportDisclosureUi();
  return true;
}

export function openLensDrawer(trigger = editUserProfileButton) {
  if (trigger) {
    lastLensDrawerTrigger = trigger;
  }
  state.ui.lensDrawerOpen = true;
  state.ui.lensDirtyPromptOpen = false;
  state.ui.lensDirtyPromptTarget = null;
  syncSupportDisclosureUi();
  requestAnimationFrame(() => {
    closeUserProfileDrawerButton?.focus({ preventScroll: true });
  });
}

export function hasUnsavedLensDraft() {
  return Boolean(state.ui.lensDrawerOpen && state.ui.profileEditing && state.ui.profileDirty);
}

export function clearLensDirtyPrompt() {
  state.ui.lensDirtyPromptOpen = false;
  state.ui.lensDirtyPromptTarget = null;
  syncSupportDisclosureUi();
}

export function requestLensDirtyPrompt(target = { type: "close" }) {
  if (!hasUnsavedLensDraft()) {
    return false;
  }
  state.ui.lensDirtyPromptOpen = true;
  state.ui.lensDirtyPromptTarget = target;
  syncSupportDisclosureUi();
  requestAnimationFrame(() => {
    lensDirtyKeepButton?.focus({ preventScroll: true });
  });
  return true;
}

export function syncLensEditorFooterVisibility() {
  if (!lensEditorFooter) return;
  lensEditorFooter.hidden = !(
    state.ui.lensDrawerOpen &&
    state.ui.profileEditing &&
    !state.ui.lensDirtyPromptOpen
  );
}

export function applyLensPromptTarget(target, { restoreFocus = true } = {}) {
  if (!target) return;
  if (target.type === "tab") {
    state.ui.profileSummaryTab = target.tab === "saved" ? "saved" : "overview";
    syncUserProfileSurface({ closeEditor: true });
    return;
  }
  closeLensDrawer({ restoreFocus, force: true });
}

export function closeLensDrawer({ restoreFocus = true, force = false } = {}) {
  if (!state.ui.lensDrawerOpen) return;
  if (!force && requestLensDirtyPrompt({ type: "close" })) {
    return;
  }
  state.ui.profileSummaryTab = "overview";
  state.ui.lensDirtyPromptOpen = false;
  state.ui.lensDirtyPromptTarget = null;
  if (state.ui.profileEditing || state.ui.profileDirty || state.ui.userProfileDraft) {
    syncUserProfileSurface({ closeEditor: true });
  } else {
    syncUserProfileSummaryTabs();
    syncUserProfileEditorUi();
  }
  state.ui.lensDrawerOpen = false;
  syncSupportDisclosureUi();
  if (restoreFocus && lastLensDrawerTrigger) {
    requestAnimationFrame(() => {
      lastLensDrawerTrigger?.focus({ preventScroll: true });
    });
  }
}

export function toggleLensDrawer() {
  if (state.ui.lensDrawerOpen) {
    closeLensDrawer();
    return;
  }
  openLensDrawer(editUserProfileButton);
  if (!state.ui.profileEditing) {
    state.ui.profileSummaryTab = "overview";
    syncUserProfileSummaryTabs();
  }
}

export function getLensDrawerFocusableElements() {
  if (!lensDrawerPanel) return [];
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(lensDrawerPanel.querySelectorAll(focusableSelector)).filter((element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hidden || element.closest("[hidden]")) return false;
    return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  });
}

export function trapLensDrawerFocus(event) {
  if (!state.ui.lensDrawerOpen || event.key !== "Tab") return false;
  const focusable = getLensDrawerFocusableElements();
  if (!focusable.length) {
    event.preventDefault();
    lensDrawerPanel?.focus({ preventScroll: true });
    return true;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  if (!activeElement || !lensDrawerPanel?.contains(activeElement)) {
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

export function syncWorkModeUi() {
  const workMode = Boolean(state.ui.workMode);
  document.body.classList.toggle("is-work-mode", workMode);
  document.body.classList.toggle("catalog-density-compact", state.ui.catalogDensity === "compact");
  document.body.classList.toggle("catalog-density-decision", state.ui.catalogDensity !== "compact");
  if (mobileShellNav) {
    mobileShellNav.hidden = false;
  }
  if (workModeCaseHeader) {
    const hidesSharedCaseHeader = state.ui.activeShellView === "catalog" || state.ui.activeShellView === "workspace";
    workModeCaseHeader.hidden = !workMode || hidesSharedCaseHeader;
  }
  syncOverviewMosaicVisibility();
  overviewPanel?.classList.remove("is-compact-launcher");

  shellViewPanelByKey.forEach((panel, key) => {
    panel.hidden = key !== state.ui.activeShellView;
  });

  shellNavButtons.forEach((button) => {
    const isActive = button.dataset.shellView === state.ui.activeShellView;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  mobileShellButtons.forEach((button) => {
    const isLensButton = button.dataset.mobileShellAction === "lens";
    if (isLensButton) {
      button.setAttribute("aria-expanded", String(state.ui.lensDrawerOpen));
      return;
    }
    const isActive = button.dataset.shellView === state.ui.activeShellView;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  renderShellChrome();
  syncCatalogProofHighlights();
  syncCatalogFilterDisclosure();
  syncCatalogResultsReadyState();
  syncCatalogStickyOffsets();
}

export function syncSupportDisclosureUi() {
  const marketPanel = document.querySelector(".market-panel");
  const advisorPanel = document.querySelector(".advisor-panel");

  marketPanel?.classList.toggle("is-collapsed", !state.ui.marketExpanded);
  advisorPanel?.classList.toggle("is-collapsed", !state.ui.advisorExpanded);
  shortlistAi?.classList.toggle("is-collapsed", !state.ui.shortlistExpanded);
  userProfilePanel?.classList.toggle("is-dirty-confirming", state.ui.lensDirtyPromptOpen);
  shortlistDock?.classList.toggle("is-sheet-open", state.ui.activeShellView === "shortlist");
  workspaceLayout?.classList.toggle("has-shortlist-rail", true);
  lensDrawer?.classList.toggle("is-open", state.ui.lensDrawerOpen);
  document.body.classList.toggle("catalog-density-compact", state.ui.catalogDensity === "compact");
  document.body.classList.toggle("catalog-density-decision", state.ui.catalogDensity !== "compact");
  document.body.classList.toggle("has-lens-drawer", state.ui.lensDrawerOpen);
  document.body.classList.toggle("is-shortlist-sheet-open", state.ui.activeShellView === "shortlist");

  if (lensDrawer) {
    lensDrawer.hidden = !state.ui.lensDrawerOpen;
    lensDrawer.setAttribute("aria-hidden", String(!state.ui.lensDrawerOpen));
  }
  if (lensDrawerBackdrop) {
    lensDrawerBackdrop.hidden = !state.ui.lensDrawerOpen;
  }
  if (lensDirtyConfirm) {
    lensDirtyConfirm.hidden = !state.ui.lensDirtyPromptOpen;
  }
  if (lensDirtyConfirmCopy) {
    const target = state.ui.lensDirtyPromptTarget;
    lensDirtyConfirmCopy.textContent =
      target?.type === "tab"
        ? `Save or discard changes before opening ${target.tab === "saved" ? "Saved" : "Lens"}.`
        : "Save or discard your lens edits before closing.";
  }
  syncLensEditorFooterVisibility();
  if (shortlistSheetBackdrop) {
    shortlistSheetBackdrop.hidden = state.ui.activeShellView !== "shortlist";
  }
  if (shortlistDock) {
    shortlistDock.hidden = state.ui.activeShellView !== "shortlist";
  }

  if (marketToggle) {
    marketToggle.textContent = state.ui.marketExpanded ? "Collapse" : "Expand";
    marketToggle.setAttribute("aria-expanded", String(state.ui.marketExpanded));
  }
  if (advisorToggle) {
    advisorToggle.textContent = state.ui.advisorExpanded ? "Collapse" : "Expand";
    advisorToggle.setAttribute("aria-expanded", String(state.ui.advisorExpanded));
  }
  if (shortlistAiToggle) {
    shortlistAiToggle.textContent = state.ui.shortlistExpanded ? "Collapse" : "Expand";
    shortlistAiToggle.setAttribute("aria-expanded", String(state.ui.shortlistExpanded));
  }
  if (editUserProfileButton) {
    editUserProfileButton.setAttribute("aria-expanded", String(state.ui.lensDrawerOpen));
  }
  if (openUserProfileEditorButton) {
    openUserProfileEditorButton.setAttribute("aria-expanded", String(state.ui.lensDrawerOpen));
  }
  document.querySelectorAll('[data-decision-action="open-lens-editor"]').forEach((button) => {
    button.setAttribute("aria-controls", "lens-drawer-panel");
    button.setAttribute("aria-expanded", String(state.ui.lensDrawerOpen));
  });
  if (densityDecisionButton && densityCompactButton) {
    const isDecision = state.ui.catalogDensity !== "compact";
    densityDecisionButton.classList.toggle("active", isDecision);
    densityDecisionButton.setAttribute("aria-selected", String(isDecision));
    densityCompactButton.classList.toggle("active", !isDecision);
    densityCompactButton.setAttribute("aria-selected", String(!isDecision));
  }
}

export function setActiveSupportWorkspaceSection(sectionId, { updateShell = true } = {}) {
  if (!sectionId || !supportNavButtons.length) return;
  state.ui.activeSupportSection = sectionId;
  state.ui.activeWorkspaceTab = sectionId;
  persistUiSessionState();
  let activeSupportButton = null;
  supportNavButtons.forEach((button) => {
    const isActive = button.dataset.workspaceJump === sectionId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    if (isActive) {
      activeSupportButton = button;
      button.setAttribute("aria-current", "true");
      button.setAttribute("tabindex", "0");
    } else {
      button.removeAttribute("aria-current");
      button.setAttribute("tabindex", "-1");
    }
  });
  supportWorkspaceSections.forEach((section) => {
    const isActive = section.id === sectionId;
    section.hidden = !isActive;
  });
  syncSupportFlowState(sectionId);
  if (updateShell) {
    enterWorkMode("workspace");
    setActiveShellView("workspace", { focus: false });
  } else if (state.ui.activeShellView === "workspace") {
    renderActiveWorkspaceSurface();
  }
  if (
    activeSupportButton &&
    (updateShell || state.ui.activeShellView === "workspace") &&
    window.matchMedia?.("(max-width: 720px)").matches
  ) {
    requestAnimationFrame(() => {
      activeSupportButton.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
    });
  }
  syncCatalogStickyOffsets();
}

export function renderActiveWorkspaceSurface(renderContext = null) {
  const context = renderContext || getCatalogRenderContext({ mutableFiltered: true });
  renderDecisionWorkspaceSummary(context);
  switch (state.ui.activeWorkspaceTab) {
    case "market-view-panel":
      renderMarketView(context.filtered, context.marketSnapshot);
      renderBestPicks({ force: true });
      renderTrackedAlertsPanel();
      break;
    case "routine-builder-panel":
      renderRoutineBuilder({ force: true });
      break;
    case "saved-presets-panel":
      renderSavedPresets();
      break;
    case "learn-workspace-panel":
      renderArticles({ force: true });
      break;
    case "shopping-brief-panel":
    default:
      renderAdvisor(context.filtered, context.leadProduct);
      break;
  }
}

export function clearHiddenCatalogCardsForOverview() {
  if (state.ui.activeShellView !== "overview") return;
  productGrid?.replaceChildren();
  paginationBar?.replaceChildren();
}

export function renderActiveShellSurface({ force = false } = {}) {
  if (state.ui.activeShellView === "overview") {
    clearHiddenCatalogCardsForOverview();
    refreshOverviewSurface(null, { fetchRemote: true, renderHidden: true });
    return;
  }
  if (state.ui.activeShellView === "catalog") {
    renderProducts({ force: force || state.ui.activeShellView === "catalog" });
    return;
  }
  if (state.ui.activeShellView === "workspace") {
    renderActiveWorkspaceSurface();
    return;
  }
  if (state.ui.activeShellView === "shortlist") {
    renderFavorites({ force: true });
  }
}

export function setupShellNavigation() {
  if (!shellNavButtons.length) return;

  shellNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = button.dataset.shellView;
      if (!targetView) return;
      if (targetView === "overview") {
        setActiveShellView("overview");
        return;
      }
      if (targetView === "workspace") {
        openDecisionWorkspaceBlocker();
        return;
      }
      enterWorkMode(targetView);
      setActiveShellView(targetView);
    });
  });

  mobileShellButtons.forEach((button) => {
    if (button.dataset.mobileShellAction === "lens") {
      button.addEventListener("click", () => {
        lastLensDrawerTrigger = button;
        openLensDrawer(button);
      });
      return;
    }
    button.addEventListener("click", () => {
      const targetView = button.dataset.shellView;
      if (!targetView) return;
      if (targetView === "overview") {
        setActiveShellView("overview");
        return;
      }
      if (targetView === "workspace") {
        openDecisionWorkspaceBlocker();
        return;
      }
      enterWorkMode(targetView);
      setActiveShellView(targetView);
    });
  });

  setupButtonArrowNavigation(shellNavButtons);
  setupButtonArrowNavigation(mobileShellButtons);
  setupButtonArrowNavigation([userProfileNavOverview, userProfileNavSaved, userProfileNavEdit], { activate: true });
  setupButtonArrowNavigation([densityDecisionButton, densityCompactButton], { activate: true });

  syncWorkModeUi();
}

export function setupSupportWorkspaceNavigation() {
  if (!supportNavButtons.length) return;

  supportNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.workspaceJump);
      if (!target) return;
      setActiveSupportWorkspaceSection(target.id);
    });
  });

  setupButtonArrowNavigation(supportNavButtons, { activate: true });

  setActiveSupportWorkspaceSection(state.ui.activeWorkspaceTab || supportNavButtons[0].dataset.workspaceJump, { updateShell: false });
}

export function syncShellViewToLocation(historyState = window.history.state) {
  const requestedView =
    (Object.hasOwn(SHELL_VIEW_CONTEXT, historyState?.shellView) && historyState.shellView) || resolveShellViewFromPathname();
  if (!requestedView) return false;
  if (requestedView === "workspace" && WORKSPACE_TAB_IDS.includes(historyState?.activeWorkspaceTab)) {
    state.ui.activeWorkspaceTab = historyState.activeWorkspaceTab;
    state.ui.activeSupportSection = historyState.activeWorkspaceTab;
    setActiveSupportWorkspaceSection(historyState.activeWorkspaceTab, { updateShell: false });
  }
  state.ui.workMode = requestedView !== "overview";
  setActiveShellView(requestedView, {
    focus: false,
    updateHistory: false,
    restoreScrollY: getShellHistoryScrollY(historyState),
  });
  return true;
}

export function getMarketViewSnapshot(filtered) {
  const groups = (state.metadata?.retailers || [])
    .map((retailer) => {
      const products = filtered.filter((product) => product.retailer === retailer);
      const ratedProducts = products.filter(
        (product) => typeof product.rating === "number" && typeof product.reviewCount === "number",
      );
      return {
        retailer,
        products,
        ratedProducts,
        count: products.length,
        avgPrice: averagePrice(products),
        topCategory: getTopLabel(products, "category"),
        topConcern: getTopConcern(products),
      };
    })
    .filter((entry) => entry.count > 0);

  const selectionLeader = [...groups].sort((a, b) => b.count - a.count)[0]?.retailer || null;
  const valueLeader = [...groups]
    .filter((entry) => entry.avgPrice != null)
    .sort((a, b) => a.avgPrice - b.avgPrice)[0]?.retailer || null;
  const ratedLeader = [...groups]
    .sort((a, b) => b.ratedProducts.length - a.ratedProducts.length)[0]?.retailer || null;
  const concernLeader = state.concern !== "all"
    ? [...groups].sort(
        (a, b) =>
          b.products.filter((product) => product.concerns.includes(state.concern)).length -
          a.products.filter((product) => product.concerns.includes(state.concern)).length,
      )[0]?.retailer || null
    : null;
  const maxCount = groups.length ? Math.max(...groups.map((entry) => entry.count), 0) : 0;
  const maxRatedCount = groups.length ? Math.max(...groups.map((entry) => entry.ratedProducts.length), 0) : 0;
  const maxConcernCount =
    state.concern !== "all" && groups.length
      ? Math.max(...groups.map((entry) => entry.products.filter((product) => product.concerns.includes(state.concern)).length), 0)
      : 0;
  const avgPrices = groups.map((entry) => entry.avgPrice).filter((value) => value != null);
  const minAveragePrice = avgPrices.length ? Math.min(...avgPrices) : null;
  const leadingRetailer = concernLeader || valueLeader || ratedLeader || selectionLeader || groups[0]?.retailer || null;

  return {
    groups,
    selectionLeader,
    valueLeader,
    ratedLeader,
    concernLeader,
    maxCount,
    maxRatedCount,
    maxConcernCount,
    minAveragePrice,
    leadingRetailer,
  };
}

export function getMarketLeadReason(snapshot) {
  if (!snapshot?.leadingRetailer) return "current fit";
  if (snapshot.concernLeader === snapshot.leadingRetailer && state.concern !== "all") {
    return `fictional ${titleCase(state.concern).toLowerCase()} count`;
  }
  if (snapshot.valueLeader === snapshot.leadingRetailer) return "fictional average price";
  if (snapshot.ratedLeader === snapshot.leadingRetailer) return "fictional rating coverage";
  if (snapshot.selectionLeader === snapshot.leadingRetailer) return "fictional product count";
  return "current fictional fields";
}

export function getBestPickEntries() {
  const activeProducts = getCatalogRenderContext().filtered;
  const sourceProducts = activeProducts.length ? activeProducts : state.products;
  return (state.metadata?.retailers || []).map((retailer) => {
    const pick = sourceProducts
      .filter((product) => product.url && product.retailer === retailer)
      .map((product) => ({ product, score: scorePickByMode(product, retailer) }))
      .filter((entry) => entry.score >= 6)
      .sort((a, b) => b.score - a.score || (a.product.price ?? 0) - (b.product.price ?? 0))[0]?.product || null;
    return { retailer, product: pick };
  });
}

export function openShortlistCompareMode() {
  enterWorkMode("shortlist");
  setActiveShellView("shortlist");
  return true;
}

export function addProductsToFavorites(ids, options = {}) {
  const uniqueIds = [...new Set((ids || []).filter((id) => id && getProductById(id)))];
  const nextIds = uniqueIds.filter((id) => !state.favoriteIds.includes(id));
  if (!nextIds.length) return false;

  enterWorkMode();
  state.favoriteIds = [...nextIds, ...state.favoriteIds];
  const exploratoryInitialStatus = options.initialStatus || (!isCatalogDecisionReady() ? "wait" : null);
  ensureShortlistStatuses(nextIds, {
    defaultStatus: SHORTLIST_STATUS_LABELS[exploratoryInitialStatus] ? exploratoryInitialStatus : null,
  });
  persistFavorites();
  resetRoutinePlannerCaches({ clearRestoreState: true });
  persistRoutinePlannerSession();
  renderFavorites();
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({
    routine: true,
    bestPicks: true,
    trackedAlerts: true,
    routineDraftSync: true,
  });

  if (options.openShortlist) {
    openShortlistCompareMode();
  }
  return true;
}

export function getCurrentArticleRecord() {
  return articleCatalog.find((article) => article.id === state.articleId) || articleCatalog[0] || FALLBACK_ARTICLES[0] || null;
}

export function setSupportNavMeta(sectionId, text) {
  const target = supportNavMetaBySection.get(sectionId);
  if (target) {
    target.textContent = text;
  }
}

export function setSupportNavState(sectionId, stateKey) {
  const button = supportNavButtonBySection.get(sectionId);
  if (button) {
    button.dataset.stepState = stateKey || "neutral";
  }
}

export const WORKSPACE_PROCESS_STATE_LABELS = {
  active: "Open",
  next: "Use next",
  blocked: "Needs input",
  neutral: "Available",
  ready: "Ready",
  reference: "Reference",
};

export function setWorkspaceNavProcessState(sectionId, stateKey, metaText = null) {
  const activeSection = state.ui.activeWorkspaceTab || "shopping-brief-panel";
  const normalizedState = sectionId === activeSection ? "active" : stateKey || "next";
  setSupportNavMeta(sectionId, metaText || WORKSPACE_PROCESS_STATE_LABELS[normalizedState] || "Use next");
  setSupportNavState(sectionId, normalizedState);
}

export function renderCaseSummaryItems(target, items, { variant = "catalog", actionAttribute = null } = {}) {
  if (!target) return;
  target.dataset.summaryVariant = variant;
  target.innerHTML = items
    .map((item) => {
      let actionMarkup = "";
      if (item.action && actionAttribute) {
        const ariaControls = item.action.ariaControls
          ? ` aria-controls="${escapeHtml(item.action.ariaControls)}"`
          : "";
        const ariaExpanded = typeof item.action.ariaExpanded === "boolean" || typeof item.action.ariaExpanded === "string"
          ? ` aria-expanded="${escapeHtml(String(item.action.ariaExpanded))}"`
          : "";
        const ariaLabel = item.action.ariaLabel
          ? ` aria-label="${escapeHtml(item.action.ariaLabel)}"`
          : "";
        actionMarkup = `
          <div class="case-summary-actions">
            <button
              class="panel-action-button${item.action.tone === "primary" ? " primary" : ""}"
              type="button"
              ${actionAttribute}="${escapeHtml(item.action.key || "")}"
              data-product-id="${escapeHtml(item.action.productId || "")}"
              data-workspace-section="${escapeHtml(item.action.workspaceSection || "")}"
              ${ariaControls}${ariaExpanded}${ariaLabel}
            >
              ${escapeHtml(item.action.label)}
            </button>
          </div>
        `;
      }
      return `
        <article class="case-summary-item case-summary-item-${escapeHtml(item.key)}${item.action ? " case-summary-item-action" : ""}">
          <span class="case-summary-label">${escapeHtml(item.label)}</span>
          <strong class="case-summary-value">${escapeHtml(item.value)}</strong>
          <p class="case-summary-detail">${escapeHtml(item.detail)}</p>
          ${actionMarkup}
        </article>
      `;
    })
    .join("");
}

export function getOverviewShellReadinessSummary(metrics, decisionSummary, { decisionReady = true } = {}) {
  if (!decisionReady) {
    return {
      value: "Focus open",
      detail: "Choose a product type, concern, ingredient, lane, or specific search before ranking with confidence.",
    };
  }
  if (!metrics.savedProducts.length) {
    return {
      value: "Not started",
      detail: "Save one leader and one challenger before you move into approval mode.",
    };
  }
  if (metrics.decisionState.championProduct && metrics.decisionState.backupProduct) {
    return {
      value: `${metrics.savedProducts.length} saved · ready`,
      detail: "Champion and backup are already in place.",
    };
  }
  if (metrics.decisionState.championProduct) {
    return {
      value: `${metrics.savedProducts.length} saved · backup open`,
      detail: "One challenger still needs to be locked beside the champion.",
    };
  }
  return {
    value: decisionSummary.value,
    detail: "Mark one saved product Champion before you treat this like a real decision.",
  };
}

export function buildWorkModeShellSummaryItems(renderContext = null) {
  const view = Object.hasOwn(SHELL_VIEW_CONTEXT, state.ui.activeShellView) ? state.ui.activeShellView : "overview";
  const metrics = getShellRenderMetrics(renderContext);
  const catalogDecisionReady = isCatalogDecisionReady();
  const summaryDecisionReady = view === "catalog" || view === "overview" || view === "workspace" ? catalogDecisionReady : true;
  const caseSummary = getCatalogCommandCaseSummary(metrics.activeLane, metrics.filteredCount, metrics.totalPages);
  const leaderSummary = getCaseSummaryLeaderSummary(metrics.leadProduct, { decisionReady: summaryDecisionReady });
  const decisionSummary = getCatalogCommandDecisionSummary(metrics.savedProducts, { decisionReady: summaryDecisionReady });
  const decisionAction = getDecisionNextActionContext({
    leadProduct: metrics.leadProduct,
    savedProducts: metrics.savedProducts,
    marketSnapshot: metrics.marketSnapshot,
    shortlistPayload: metrics.shortlistPayload,
  });
  const championSummary = getCaseSummaryLeaderSummary(metrics.decisionState.championProduct);

  if (view === "overview") {
    const startingCaseSummary = getOverviewShellStartingCase(metrics);
    const readinessSummary = getOverviewShellReadinessSummary(metrics, decisionSummary, { decisionReady: catalogDecisionReady });
    return [
      {
        key: "primary",
        label: "Starting case",
        value: startingCaseSummary.value,
        detail: startingCaseSummary.detail,
      },
      {
        key: "leader",
        label: catalogDecisionReady ? "Current leader" : "Starting point",
        value: leaderSummary.value,
        detail: catalogDecisionReady
          ? metrics.leadProduct
            ? `${leaderSummary.detail} · leader proof stays visible before exploration begins.`
            : "Current proof stays visible before exploration begins."
          : metrics.leadProduct
            ? "Representative starting point stays visible while the focus is open."
            : "Choose a focus before ranking products.",
      },
      {
        key: "decision",
        label: "Case readiness",
        value: readinessSummary.value,
        detail: readinessSummary.detail,
      },
      {
        key: "next",
        label: "Next move",
        value: catalogDecisionReady ? "Open this case in Catalog" : "Choose focus",
        detail: catalogDecisionReady
          ? "Carry the same lens and starting case into the main working surface."
          : "Carry the broad scan into Catalog controls before saving or routing a decision.",
        action: {
          key: catalogDecisionReady ? "open-catalog-shell" : "focus-catalog-work",
          label: catalogDecisionReady ? "Open path" : "Choose focus",
          tone: "primary",
        },
      },
    ];
  }

  if (view === "workspace") {
    const workspaceActionDisplay = getWorkspaceDecisionActionDisplay(decisionAction);
    const candidateSummary = !catalogDecisionReady
      ? {
          value: "Focus open",
          detail: "No valid candidate until the case is narrowed.",
        }
      : metrics.decisionState.championProduct
        ? championSummary
        : leaderSummary;
    return [
      {
        key: "primary",
        label: "Focus",
        value: caseSummary.value,
        detail: catalogDecisionReady
          ? caseSummary.detail
          : "Broad/unfocused catalog. Choose a product decision axis before saving.",
      },
      {
        key: "leader",
        label: metrics.decisionState.championProduct ? "Champion" : "Candidate",
        value: candidateSummary.value,
        detail: candidateSummary.detail,
      },
      {
        key: "decision",
        label: "Saved",
        value: decisionSummary.value,
        detail: decisionSummary.detail,
      },
      {
        key: "next",
        label: "Next action",
        value: workspaceActionDisplay.label,
        detail: workspaceActionDisplay.detail,
        action: {
          key: decisionAction.key,
          label: workspaceActionDisplay.label,
          productId: decisionAction.productId || "",
          workspaceSection: decisionAction.workspaceSection || "",
          tone: "primary",
        },
      },
    ];
  }

  if (view === "shortlist") {
    const backupSummary = getShortlistShellBackupSummary(metrics);
    const buyPathSummary = getShortlistShellBuyPathSummary(metrics);
    const exploratoryHandoff = isShortlistExploratoryHandoff(metrics.savedProducts);
    if (exploratoryHandoff) {
      const savedProduct = metrics.savedProducts[0] || null;
      return [
        {
          key: "primary",
          label: "Focus",
          value: "Still open",
          detail: "Choose a product type, concern, ingredient, lane, or specific search before ranking saved picks.",
        },
        {
          key: "leader",
          label: "Saved pick",
          value: savedProduct ? `${savedProduct.brand} ${savedProduct.name}` : "Reference saved",
          detail: "Use this as a comparison point while you narrow the case.",
        },
        {
          key: "decision",
          label: "Store path",
          value: "Check after focus",
          detail: "Retailer pressure should wait until the comparison set is narrower.",
        },
        {
          key: "next",
          label: "Next move",
          value: "Choose a focus",
          detail: "Return to Catalog filters, concern chips, or browse lanes before ranking the saved pick.",
          action: {
            key: "focus-catalog-work",
            label: "Choose focus",
            tone: "primary",
          },
        },
      ];
    }
    const finalActionValue = decisionAction.key === "approve-basket" ? "Approve the current basket" : "Review the decision set";
    return [
      {
        key: "primary",
        label: "Champion",
        value: metrics.decisionState.championProduct ? championSummary.value : "Champion still open",
        detail: metrics.decisionState.championProduct
          ? championSummary.detail
          : "Promote one saved product before the basket can behave like a final call.",
      },
      {
        key: "leader",
        label: "Backup",
        value: backupSummary.value,
        detail: backupSummary.detail,
      },
      {
        key: "decision",
        label: "Buy path",
        value: buyPathSummary.value,
        detail: buyPathSummary.detail,
      },
      {
        key: "next",
        label: "Final decision",
        value: finalActionValue,
        detail: "Shortlist becomes a commitment surface through warmer emphasis, not extra chrome.",
        action: {
          key: decisionAction.key,
          label: decisionAction.key === "approve-basket" ? "Approve basket" : "Review decision",
          productId: decisionAction.productId || "",
          workspaceSection: decisionAction.workspaceSection || "",
          tone: "primary",
        },
      },
    ];
  }

  const shortlistSummary = getCatalogShellShortlistSummary(metrics);

  return [
    {
      key: "primary",
      label: "Active scope",
      value: caseSummary.value,
      detail: metrics.filteredCount
        ? `${metrics.filteredCount.toLocaleString()} matches · ${metrics.totalPages} page${metrics.totalPages === 1 ? "" : "s"} in the ${catalogDecisionReady ? "current case" : "current scope"}.`
        : caseSummary.detail,
    },
    {
      key: "leader",
      label: catalogDecisionReady ? "Current leader" : "Starting point",
      value: leaderSummary.value,
      detail: catalogDecisionReady
        ? metrics.leadProduct
          ? `${leaderSummary.detail} · leader stays visible while you filter and compare.`
          : "Tighten the case until one product deserves the lead."
        : metrics.leadProduct
          ? "Choose a product type, concern, ingredient, lane, or specific search before ranking this pick."
          : "Choose a product type, concern, ingredient, lane, or specific search before ranking products.",
    },
    {
      key: "decision",
      label: "Shortlist",
      value: shortlistSummary.value,
      detail: shortlistSummary.detail,
    },
    {
      key: "next",
      label: "Primary action",
      value: "Work the demo case with quick find nearby",
      detail: "Catalog owns scope, search, and ranking pressure in one surface.",
      action: {
        key: "focus-catalog-work",
        label: "Quick find",
        tone: "primary",
      },
    },
  ];
}

export function renderWorkModeCaseSummary(filtered, marketSnapshot, leadProduct, renderContext = null) {
  renderCaseSummaryItems(
    workModeCasebar,
    buildWorkModeShellSummaryItems(renderContext || {
      filtered,
      marketSnapshot,
      leadProduct,
    }),
    { variant: "shell", actionAttribute: "data-decision-action" },
  );

  const savedProfile = getSavedUserProfileRecord();
  const lensTitle = getProfileLabel(savedProfile.profile);
  const lensGoalLabel = getVisibleLensGoalLabel(savedProfile);
  const lensMeta = [
    lensGoalLabel,
    getBudgetLabel(savedProfile.budget),
    savedProfile.name?.trim() || null,
  ]
    .filter(Boolean)
    .join(" · ");
  if (lensSummaryTitle) {
    lensSummaryTitle.textContent = lensTitle;
  }
  if (lensSummaryMeta) {
    lensSummaryMeta.textContent = lensMeta;
  }
}

export function getCurrentProfileSignature() {
  return getSavedProfileFiltersSignature(getCurrentProfileFiltersSnapshot());
}

export function getCurrentRoutineSignature() {
  return JSON.stringify({
    routineConcern: state.routineConcern,
    routineTime: state.routineTime,
    routineBudget: state.routineBudget,
    retailer: state.retailer,
    profile: state.profile,
    sensitivity: state.userProfile.sensitivity,
    activesComfort: state.userProfile.activesComfort,
    avoidIngredients: state.userProfile.avoidIngredients,
  });
}

export function resetFilters() {
  clearBrowseLaneSelection();
  clearFocusedCatalogFilterSlice();
  state.profile = "all";
  state.retailer = "all";
  state.brand = "all";
  state.category = "all";
  state.ingredient = "all";
  state.concern = "all";
  state.search = "";
  state.sort = "relevance";
  state.page = 1;
  state.userProfile.profile = "all";

  profileFilter.value = "all";
  retailerFilter.value = "all";
  brandFilter.value = "all";
  categoryFilter.value = "all";
  ingredientFilter.value = "all";
  sortFilter.value = "relevance";
  searchInput.value = "";

  setConcernChipSelection("all");
  persistUserProfile();
  syncUserProfileSurface();
}

export function clearSingleFilter(key) {
  if (key === "browse-lane") {
    clearBrowseLaneSelection({ resetSort: true });
  } else if (key === "profile") {
    state.profile = "all";
    state.userProfile.profile = "all";
    profileFilter.value = "all";
    persistUserProfile();
    syncUserProfileSurface();
  } else if (key === "retailer") {
    state.retailer = "all";
    retailerFilter.value = "all";
    clearFocusedCatalogFilterSlice();
  } else if (key === "brand") {
    state.brand = "all";
    brandFilter.value = "all";
  } else if (key === "category") {
    state.category = "all";
    categoryFilter.value = "all";
  } else if (key === "ingredient") {
    state.ingredient = "all";
    ingredientFilter.value = "all";
  } else if (key === "sort") {
    state.sort = "relevance";
    sortFilter.value = "relevance";
  } else if (key === "concern") {
    setConcern("all");
    return;
  } else if (key === "search") {
    state.search = "";
    searchInput.value = "";
  }

  state.page = 1;
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({ routine: true, bestPicks: true });
}

export function describeFilters() {
  const chips = [];
  if (state.browseLaneKey) {
    const lane = getActiveBrowseLane();
    if (lane) chips.push(`Edit: ${lane.label}`);
  }
  if (state.profile !== "all") chips.push(getProfileLabel());
  if (state.retailer !== "all") chips.push(state.retailer);
  if (state.brand !== "all") chips.push(state.brand);
  if (state.category !== "all") chips.push(titleCase(state.category));
  if (state.ingredient !== "all") chips.push(titleCase(state.ingredient));
  if (state.concern !== "all") chips.push(titleCase(state.concern));
  if (state.search) chips.push(`Search · ${state.search}`);
  return chips;
}

export function getConcernStrategy(concern) {
  const strategies = {
    acne: {
      focus: "Keep the routine ingredient-led and center one proven acne step before layering more actives.",
      lookFor: CONCERN_STRATEGIES.acne?.lookFor || ["salicylic acid", "niacinamide", "retinol"],
      avoid: "Avoid stacking too many exfoliating or retinoid steps at the same time.",
    },
    dryness: {
      focus: "Put barrier support first so comfort and hydration recover before chasing brightness or texture.",
      lookFor: CONCERN_STRATEGIES.dryness?.lookFor || ["ceramides", "hyaluronic acid", "squalane"],
      avoid: "Avoid over-exfoliating when skin already feels tight, flaky, or reactive.",
    },
    redness: {
      focus: "Favor lower-irritation, barrier-aware formulas over aggressive treatment stacks.",
      lookFor: CONCERN_STRATEGIES.redness?.lookFor || ["ceramides", "hyaluronic acid", "fragrance-free"],
      avoid: "Avoid combining too many strong acids and retinoids in the same routine window.",
    },
    "dark spots": {
      focus: "Start with brightening plus consistent sunscreen rather than relying on multiple peel steps.",
      lookFor: CONCERN_STRATEGIES["dark spots"]?.lookFor || ["vitamin c", "niacinamide", "spf"],
      avoid: "Avoid skipping sunscreen if fading discoloration is the goal.",
    },
    texture: {
      focus: "Use one texture-focused active consistently instead of rotating through too many resurfacing treatments.",
      lookFor: CONCERN_STRATEGIES.texture?.lookFor || ["retinol", "glycolic acid", "lactic acid"],
      avoid: "Avoid pushing retinoids and strong acids too aggressively in the same week.",
    },
    wrinkles: {
      focus: "Lean into long-game support with retinoids, hydration, and sunscreen rather than fast swaps.",
      lookFor: CONCERN_STRATEGIES.wrinkles?.lookFor || ["retinol", "peptides", "spf"],
      avoid: "Avoid judging a wrinkle routine too quickly before consistent use.",
    },
    "general care": {
      focus: "Keep the routine balanced and dependable with cleanser, moisturizer, and sunscreen as the stable core.",
      lookFor: CONCERN_STRATEGIES["general care"]?.lookFor || ["hyaluronic acid", "ceramides", "spf"],
      avoid: "Avoid adding actives without a specific reason.",
    },
  };
  return strategies[concern] || strategies["general care"];
}

export function scoreBudgetOverall(product) {
  let score = 0;
  if (["cleanser", "moisturizer", "sunscreen", "serum", "treatment"].includes(product.category)) score += 2;
  score += Math.min(product.concerns.length, 3) * 1.5;
  score += Math.min(product.ingredients.length, 2);
  if (product.price != null) score += Math.max(0, 4 - product.price / 35);
  score += profileBoost(product);
  score += sensitivityBoost(product);
  score += activesComfortBoost(product);
  score += avoidIngredientPenalty(product);
  return score;
}

export function pickTopProduct(products, scorer) {
  return products
    .filter((product) => product.url)
    .map((product) => ({ product, score: scorer(product) }))
    .sort((a, b) => b.score - a.score || (a.product.price ?? 0) - (b.product.price ?? 0))[0]?.product || null;
}

export function explainProductChoice(product, context = {}) {
  const reasons = [];
  const concerns = formatList(product.concerns.map((concern) => titleCase(concern)), 2);
  const ingredients = formatList(product.ingredients.map((ingredient) => titleCase(ingredient)), 2);
  const rankingContext = getCatalogRankingContext();
  const goal = context.type === "routine"
    ? normalizeCatalogRankingConcern(context.concern || state.routineConcern)
    : rankingContext.primaryConcern || rankingContext.concern;
  const goalLabel = goal ? titleCase(goal) : "";

  if (goal && goal !== "all" && product.concerns.includes(goal)) {
    reasons.push(`it directly supports your ${goalLabel.toLowerCase()} goal`);
  } else if (goal && goal !== "all" && getGoalCategoryHints(goal).includes(product.category)) {
    reasons.push(`it fits the kind of ${titleCase(product.category).toLowerCase()} step that helps with ${goalLabel.toLowerCase()}`);
  }

  if (context.type === "routine") {
    if (context.concern && product.concerns.includes(context.concern)) {
      reasons.push(`it directly supports ${titleCase(context.concern)}`);
    }
    if (context.step?.label && context.step.categories.includes(product.category)) {
      reasons.push(`it fits the ${context.step.label.toLowerCase()} step`);
    }
  } else if (context.type === "sensitive-pick") {
    if (product.concerns.includes("redness") || product.concerns.includes("dryness")) {
      reasons.push(`it leans barrier-friendly for ${formatList(
        product.concerns.filter((concern) => ["redness", "dryness"].includes(concern)).map((concern) => titleCase(concern)),
        2,
      )}`);
    }
    if (["ceramides", "hyaluronic acid", "fragrance-free"].some((ingredient) => product.ingredients.includes(ingredient))) {
      reasons.push(`it includes ${formatList(
        product.ingredients
          .filter((ingredient) => ["ceramides", "hyaluronic acid", "fragrance-free"].includes(ingredient))
          .map((ingredient) => titleCase(ingredient)),
        2,
      )}`);
    }
  } else if (context.type === "budget-pick") {
    if (product.price != null) {
      reasons.push(`it stays relatively budget-friendly at ${money(product.price)}`);
    }
    if (["cleanser", "moisturizer", "sunscreen", "serum", "treatment"].includes(product.category)) {
      reasons.push(`it is a practical ${titleCase(product.category)} step`);
    }
  } else {
    if (["serum", "moisturizer", "sunscreen", "cleanser", "toner", "treatment"].includes(product.category)) {
      reasons.push(`it is a strong ${titleCase(product.category)} category pick`);
    }
    if (concerns) {
      reasons.push(`it covers ${concerns}`);
    }
    if (ingredients) {
      reasons.push(`it signals ${ingredients}`);
    }
    if (product.price != null && product.price <= 45) {
      reasons.push(`it still lands at a reasonable ${money(product.price)}`);
    }
  }

  if (state.profile !== "all") {
    const profile = SKIN_PROFILES[state.profile];
    const profileMatched =
      product.concerns.some((concern) => profile.concerns.includes(concern)) ||
      product.ingredients.some((ingredient) => profile.ingredients.includes(ingredient)) ||
      profile.categories.includes(product.category);
    if (profileMatched) {
      reasons.push(`it aligns with your ${getProfileLabel().toLowerCase()} profile`);
    }
  }

  if (state.retailer !== "all" && product.retailer === state.retailer && context.type !== "routine") {
    reasons.push(`it matches the ${state.retailer} filter`);
  }

  if (state.ingredient !== "all" && product.ingredients.includes(state.ingredient)) {
    reasons.push(`it includes ${titleCase(state.ingredient)}`);
  }

  if (state.search && matchesSearch(product, state.search)) {
    reasons.push(`it matches your current search`);
  }

  const summary = reasons.filter(Boolean).slice(0, 3);
  if (!summary.length) {
    return `Why this was picked: it scored well for your current goal, category fit, and overall usefulness.`;
  }
  return `Why this was picked: ${summary.join(", ")}.`;
}

export function explainRoutineChoice(product, step) {
  const reasons = [];
  const strategy = getConcernStrategy(state.routineConcern);
  const matchedLookFor = strategy.lookFor.filter((ingredient) => product.ingredients.includes(ingredient));
  const exactMatch = getRetailerComparison(product).find((entry) => isRetailerExactMatch(entry));
  const ingredientInsight = getIngredientInsight(product);
  const leadIngredients = matchedLookFor.length
    ? formatList(matchedLookFor.map((ingredient) => titleCase(ingredient)), 2)
    : formatList(ingredientInsight.heroIngredients, 2);

  if (leadIngredients) {
    if (step?.key === "cleanser") {
      reasons.push(`${leadIngredients} keep this cleanse more aligned with a ${state.routineConcern} plan`);
    } else if (step?.key === "treat") {
      reasons.push(`${leadIngredients} give the treatment step a clearer ${state.routineConcern} focus`);
    } else if (step?.key === "moisturize" || step?.key === "seal") {
      reasons.push(`${leadIngredients} make this the steadier support step in the plan`);
    } else if (step?.key === "protect") {
      reasons.push(`${leadIngredients} keep the daytime protection step working toward the same goal`);
    }
  }

  if (!reasons.length && product.concerns.includes(state.routineConcern)) {
    reasons.push(`directly targets ${titleCase(state.routineConcern)} without overcomplicating this step`);
  }

  if (!reasons.length && step?.categories?.includes(product.category)) {
    reasons.push(`fits the ${step.label.toLowerCase()} step with a clear ${titleCase(product.category).toLowerCase()} match`);
  }

  if (!reasons.length && ingredientInsight.caution) {
    reasons.push(ingredientInsight.caution);
  }

  if (typeof product.rating === "number" && typeof product.reviewCount === "number" && product.reviewCount >= 1000) {
    reasons.push(`has a strong synthetic review signal at ${product.rating.toFixed(1)}★ from ${product.reviewCount.toLocaleString()} synthetic fixture reviews`);
  }

  if (typeof product.price === "number" && state.routineBudget !== "premium") {
    if (product.price <= 30) {
      reasons.push(`keeps this step lower-commitment at ${money(product.price)}`);
    } else if (product.price >= 85) {
      reasons.push(`is the bigger spend in this plan at ${money(product.price)}`);
    }
  }

  if (exactMatch) {
    reasons.push(`has the same product available at ${exactMatch.retailer} if you want to compare retailer trust or price`);
  }

  if (!reasons.length && product.ingredients.length) {
    reasons.push(`leans on ${formatList(product.ingredients.map((ingredient) => titleCase(ingredient)), 2)} as the main signal`);
  }

  if (!reasons.length) {
    reasons.push(`scored well for this ${step.label.toLowerCase()} step under your current routine settings`);
  }

  return reasons[0];
}

export function pushCatalogChoiceCandidate(candidates, phrase) {
  if (!phrase || candidates.includes(phrase)) return;
  candidates.push(phrase);
}

export function explainCatalogChoiceCompact(product, options = {}) {
  const candidates = getCatalogChoiceCandidates(product, options);
  return candidates[0] || "Strong fit right now.";
}

export function getCatalogChoiceCandidates(product, options = {}) {
  const candidates = [];
  const activeConcern = state.concern !== "all" ? state.concern : null;
  const rankingContext = getCatalogRankingContext();
  const goal = rankingContext.primaryConcern || rankingContext.concern;
  const activeLane = getActiveBrowseLane();

  if (activeLane?.key === "under-50" && typeof product.price === "number" && product.price <= 50) {
    pushCatalogChoiceCandidate(candidates, "Lower-spend fit.");
  }

  if (activeLane?.key === "sensitive-skin-safe" && isSensitiveSafeProduct(product)) {
    pushCatalogChoiceCandidate(candidates, "Lower-irritation formula.");
  }

  if (activeConcern) {
    getCatalogActiveConcernPhrases(product, activeConcern).forEach((phrase) => pushCatalogChoiceCandidate(candidates, phrase));
  }

  if (goal && (!activeConcern || goal !== activeConcern)) {
    getCatalogFocusPhrases(product, goal, product.category).forEach((phrase) => pushCatalogChoiceCandidate(candidates, phrase));
  }

  const profilePhrase = getCatalogProfilePhrase(state.profile);
  if (profilePhrase && profileMatchesProduct(product, state.profile)) {
    pushCatalogChoiceCandidate(candidates, profilePhrase);
  }

  if (options.hasRetailerGraph) {
    pushCatalogChoiceCandidate(candidates, "Strong retailer-check coverage.");
  }

  pushCatalogChoiceCandidate(candidates, getCatalogCategoryPhrase(product.category));

  if (product.concerns.length) {
    product.concerns
      .filter((concern) => concern !== activeConcern)
      .slice(0, 2)
      .forEach((concern) => pushCatalogChoiceCandidate(candidates, `Supports ${titleCase(concern).toLowerCase()}.`));
  }

  pushCatalogChoiceCandidate(candidates, "Strong fit right now.");
  return candidates;
}

export function buildCatalogChoiceMap(products, optionsByProductId = new Map()) {
  const phraseCounts = new Map();
  const explanationById = new Map();

  products.forEach((product) => {
    const options = optionsByProductId.get(product.id) || {};
    const candidates = getCatalogChoiceCandidates(product, options);
    const choice =
      candidates.reduce((bestPhrase, phrase, index) => {
        const bestScore = bestPhrase ? (phraseCounts.get(bestPhrase) || 0) * 10 + candidates.indexOf(bestPhrase) : Number.POSITIVE_INFINITY;
        const score = (phraseCounts.get(phrase) || 0) * 10 + index;
        return score < bestScore ? phrase : bestPhrase;
      }, "") || "Strong fit right now.";
    explanationById.set(product.id, choice);
    phraseCounts.set(choice, (phraseCounts.get(choice) || 0) + 1);
  });

  return explanationById;
}

export function getCatalogActiveConcernPhrases(product, concern) {
  if (!concern || concern === "all") return [];

  const ingredientPhrases = {
    acne: [
      ["salicylic acid", "Salicylic-acid lead."],
      ["niacinamide", "Niacinamide breakout support."],
      ["benzoyl peroxide", "Blemish-targeting active."],
      ["retinol", "Retinoid acne support."],
    ],
    pores: [
      ["salicylic acid", "Pore-clearing active."],
      ["niacinamide", "Pore-balancing support."],
      ["retinol", "Texture-reset support."],
    ],
    dryness: [
      ["ceramides", "Ceramide barrier support."],
      ["hyaluronic acid", "Hydration-first support."],
      ["squalane", "Squalane comfort step."],
      ["fragrance-free", "Low-irritation support."],
    ],
    redness: [
      ["fragrance-free", "Lower-irritation support."],
      ["ceramides", "Ceramide calm support."],
      ["niacinamide", "Niacinamide calm support."],
      ["hyaluronic acid", "Hydration calm support."],
      ["green tea", "Antioxidant calm support."],
      ["squalane", "Barrier-softening support."],
    ],
    texture: [
      ["glycolic acid", "Texture-reset acid step."],
      ["lactic acid", "Smoother-skin acid step."],
      ["retinol", "Retinoid texture support."],
      ["salicylic acid", "Clarity-and-texture step."],
    ],
    "dark spots": [
      ["vitamin c", "Brightening-active step."],
      ["niacinamide", "Tone-evening support."],
      ["retinol", "Tone-and-texture retinoid."],
      ["glycolic acid", "Glow-renewal step."],
      ["lactic acid", "Glow-renewal step."],
    ],
    dullness: [
      ["vitamin c", "Glow-brightening step."],
      ["glycolic acid", "Glow-renewal step."],
      ["lactic acid", "Glow-renewal step."],
      ["niacinamide", "Glow-support step."],
    ],
    wrinkles: [
      ["retinol", "Retinoid firming step."],
      ["peptides", "Peptide firming support."],
      ["hyaluronic acid", "Plumping hydration step."],
    ],
    "general care": [
      ["spf", "Daily protection anchor."],
      ["niacinamide", "Steady skin-support step."],
      ["hyaluronic acid", "Hydration-support step."],
    ],
  };

  const phrases = [];
  (ingredientPhrases[concern] || [])
    .filter(([ingredient]) => product.ingredients.includes(ingredient))
    .forEach(([, phrase]) => pushCatalogChoiceCandidate(phrases, phrase));

  const secondaryConcern = product.concerns.find((item) => item !== concern && item !== "general care");
  if (secondaryConcern) {
    const secondaryLabels = {
      acne: "Also supports breakouts.",
      pores: "Also supports pores.",
      dryness: "Also supports dryness.",
      redness: "Also supports redness.",
      texture: "Also supports texture.",
      "dark spots": "Also supports tone.",
      dullness: "Also supports glow.",
      wrinkles: "Also supports firmness.",
    };
    pushCatalogChoiceCandidate(phrases, secondaryLabels[secondaryConcern]);
  }

  getCatalogFocusPhrases(product, concern, product.category).forEach((phrase) => pushCatalogChoiceCandidate(phrases, phrase));
  return phrases;
}

export function getCatalogFocusPhrases(product, focus, category) {
  if (!focus || focus === "all") return [];
  const focusMatchesProduct = product.concerns.includes(focus);
  const categoryMatchesFocus = getGoalCategoryHints(focus).includes(category);
  if (!focusMatchesProduct && !categoryMatchesFocus) return [];

  const concernMap = {
    acne: {
      cleanser: "Breakout-control cleanse.",
      toner: "Breakout-focus step.",
      serum: "Breakout-focus step.",
      treatment: "Breakout-focus step.",
      moisturizer: "Lighter breakout support.",
    },
    pores: {
      cleanser: "Pore-reset cleanse.",
      toner: "Pore-refining step.",
      serum: "Pore-refining step.",
      treatment: "Pore-refining step.",
    },
    dryness: {
      cleanser: "Barrier-first cleanse.",
      moisturizer: "Barrier-first support.",
      sunscreen: "Barrier-first SPF.",
      mask: "Barrier-first reset.",
      serum: "Hydration-first step.",
      toner: "Hydration-first step.",
    },
    redness: {
      cleanser: "Calmer-skin cleanse.",
      moisturizer: "Calmer-skin support.",
      sunscreen: "Calmer-skin SPF.",
      toner: "Calmer-skin prep.",
      serum: "Calmer-skin treatment.",
      treatment: "Calmer-skin treatment.",
      mask: "Calmer-skin reset.",
    },
    texture: {
      cleanser: "Texture-reset cleanse.",
      toner: "Texture-smoothing step.",
      serum: "Texture-smoothing step.",
      treatment: "Texture-smoothing step.",
    },
    "dark spots": {
      sunscreen: "Tone-protect SPF.",
      serum: "Tone-evening treatment.",
      treatment: "Tone-evening treatment.",
      moisturizer: "Tone-evening support.",
    },
    dullness: {
      serum: "Glow-reset step.",
      treatment: "Glow-reset step.",
      moisturizer: "Glow-support pick.",
      cleanser: "Glow-reset cleanse.",
    },
    wrinkles: {
      serum: "Line-smoothing treatment.",
      treatment: "Line-smoothing treatment.",
      moisturizer: "Firming support step.",
      sunscreen: "Daily defense step.",
    },
    "general care": {
      cleanser: "Steady everyday cleanse.",
      serum: "Steady daily step.",
      moisturizer: "Steady daily support.",
      sunscreen: "Daily SPF anchor.",
    },
  };

  return concernMap[focus]?.[category] ? [concernMap[focus][category]] : [];
}

export function profileMatchesProduct(product, profileKey) {
  if (!profileKey || profileKey === "all") return false;
  const profile = SKIN_PROFILES[profileKey];
  if (!profile) return false;
  return (
    product.concerns.some((concern) => profile.concerns.includes(concern)) ||
    product.ingredients.some((ingredient) => profile.ingredients.includes(ingredient)) ||
    profile.categories.includes(product.category)
  );
}

export function getCatalogProfilePhrase(profileKey) {
  const mapping = {
    "dry-sensitive": "Barrier-friendly profile fit.",
    "oily-acne": "Oil-aware profile fit.",
    "dark-spot-texture": "Tone-and-texture profile fit.",
    "mature-dehydrated": "Plumping-support profile fit.",
    "balanced-maintenance": "Steady-maintenance fit.",
  };
  return mapping[profileKey] || "";
}

export function getCatalogCategoryPhrase(category) {
  const mapping = {
    cleanser: "Strong cleanse candidate.",
    toner: "Focused treatment candidate.",
    serum: "Focused treatment candidate.",
    treatment: "Focused treatment candidate.",
    moisturizer: "Steady support candidate.",
    sunscreen: "Daily protection anchor.",
    mask: "Optional support step.",
  };
  return mapping[category] || "";
}

export function getCatalogOpenRoutineStep(product, backendPlan) {
  const steps = ROUTINE_STEPS[state.routineTime] || [];
  for (const step of steps) {
    if (!isRoutineProductValidForStep(step, product)) continue;
    const planEntry = (backendPlan?.steps || []).find((entry) => entry.step?.key === step.key) || null;
    const filled = Boolean(planEntry?.product) && !planEntry?.removed && isRoutineProductValidForStep(step, planEntry.product);
    if (filled) continue;
    if (getRoutineStepPriority(step, product) === "core") return step;
  }
  return null;
}

export function getCatalogSameProductRoutineEntry(product, activeEntries, comparableKey) {
  if (!comparableKey) return null;
  return (
    activeEntries.find(
      (entry) =>
        entry.product &&
        entry.product.id !== product.id &&
        getRetailerEquivalentIdentityRelation(
          product,
          entry.product,
        ) === "exact",
    ) || null
  );
}

export function getCatalogContextSignal(product) {
  const backendPlan = getActiveRoutinePlannerPlan();
  const timingLabel = state.routineTime.toUpperCase();
  const comparableKey = getComparableProductKey(product);
  const activeEntries = (backendPlan?.steps || []).filter(
    (entry) => entry?.step && entry.product && !entry.removed && isRoutineProductValidForStep(entry.step, entry.product),
  );

  const exactRoutineEntry = activeEntries.find((entry) => entry.product?.id === product.id);
  if (exactRoutineEntry) {
    return {
      label: "Your routine",
      text: `Current ${timingLabel} ${exactRoutineEntry.step.label.toLowerCase()} pick.`,
      tone: "current",
    };
  }

  const sameProductRoutineEntry = getCatalogSameProductRoutineEntry(product, activeEntries, comparableKey);
  if (sameProductRoutineEntry) {
    return {
      label: "Your routine",
      text: `Same product already covers your ${timingLabel} ${sameProductRoutineEntry.step.label.toLowerCase()} step.`,
      tone: "overlap",
    };
  }

  const exactShortlistMatch = state.favoriteIds.includes(product.id);
  if (exactShortlistMatch) {
    return {
      label: "Your shortlist",
      text: "Already in your shortlist.",
      tone: "saved",
    };
  }

  const openStep = backendPlan ? getCatalogOpenRoutineStep(product, backendPlan) : null;
  if (openStep) {
    return {
      label: "Your routine",
      text: `Could fill your ${timingLabel} ${openStep.label.toLowerCase()} step.`,
      tone: "opportunity",
    };
  }

  return null;
}

export function renderCatalogContextSignalMarkup(product) {
  const signal = getCatalogContextSignal(product);
  if (!signal) return "";
  return `
    <p class="product-context-signal product-context-signal-${escapeHtml(signal.tone)}">
      <strong>${escapeHtml(signal.label)}</strong>
      <span>${escapeHtml(signal.text)}</span>
    </p>
  `;
}

export function getCatalogSpendSummary(product) {
  if (typeof product?.price !== "number") return "Price pending";
  const priceLabel = money(product.price);
  if (state.userProfile.budget === "budget") {
    if (product.price <= 35) return `${priceLabel} lower spend`;
    if (product.price <= 70) return `${priceLabel} mid spend`;
    return `${priceLabel} stretch lane`;
  }
  if (state.userProfile.budget === "premium") {
    return product.price >= 70 ? `${priceLabel} premium lane` : `${priceLabel} below premium`;
  }
  if (product.price <= 35) return `${priceLabel} lower spend`;
  if (product.price >= 70) return `${priceLabel} premium lane`;
  return `${priceLabel} mid-range`;
}

export function getCatalogStoreSummary(retailerComparison) {
  if (retailerComparison?.hasExactGraph && retailerComparison?.comparisonMode === "closest-equivalent") return "Closest equivalent check";
  if (retailerComparison?.hasExactGraph) return "Exact cross-store check";
  if (retailerComparison?.markup) return "Closest equivalent check";
  return "Single-store read";
}

export function cleanCatalogSnapshotLabel(value, fallback = "") {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\.$/, "")
    .trim();
  return text || fallback;
}

export function getCatalogSnapshotClosestMatchKind(product) {
  const matches = Array.isArray(product?.closestEquivalentMatches) ? product.closestEquivalentMatches : [];
  if (matches.some((entry) => String(entry?.matchKind || "").toLowerCase() === "family")) return "family";
  if (
    matches.length ||
    (Array.isArray(product?.closestEquivalentIds) && product.closestEquivalentIds.length) ||
    Number(product?.closestEquivalentGroupSize || 0) > 1 ||
    Number(product?.closestEquivalentRetailerCount || 0) > 1
  ) {
    return "alternative";
  }
  return "";
}

export function getCatalogSnapshotMatchKind(product, retailerComparison = null) {
  const explicitKind = String(retailerComparison?.matchKind || retailerComparison?.snapshotMatchKind || "").toLowerCase();
  if (["exact", "family", "alternative"].includes(explicitKind)) return explicitKind;

  const comparisonMode = String(retailerComparison?.comparisonMode || "").toLowerCase();
  if (comparisonMode === "exact") return "exact";
  if (comparisonMode === "family") return "family";
  if (comparisonMode === "alternative") return "alternative";
  if (comparisonMode === "closest-equivalent") return getCatalogSnapshotClosestMatchKind(product) || "alternative";

  const canonicalRetailers = Array.isArray(product?.canonicalRetailers) ? product.canonicalRetailers : [];
  if (
    canonicalRetailers.length > 1 ||
    Number(product?.comparisonRetailerCount || 0) > 1
  ) {
    return "exact";
  }

  return getCatalogSnapshotClosestMatchKind(product) || "none";
}

export function getCatalogSnapshotMatchLabel(product, retailerComparison = null) {
  const matchKind = getCatalogSnapshotMatchKind(product, retailerComparison);
  const labels = {
    exact: "Exact match",
    family: "Same-family variant",
    alternative: "Closest substitute",
    none: "No store match",
  };
  return {
    value: labels[matchKind] || labels.none,
    tone: matchKind || "none",
  };
}

export function getCatalogSnapshotAvailabilityLabel(product) {
  const detail = product?.availabilityDetail && typeof product.availabilityDetail === "object" ? product.availabilityDetail : null;
  const detailState = String(detail?.state || "").toLowerCase();
  const detailGroup = String(detail?.group || "").toLowerCase();
  const availabilityState = String(product?.availabilityState || "").toLowerCase();
  const label = String(detail?.label || "").trim();
  const isUnknown =
    (!availabilityState && !detailState && !label) ||
    availabilityState === "unknown" ||
    detailState === "unknown" ||
    detailGroup === "unknown" ||
    /availability\s+(mixed|unknown)/i.test(label);
  if (isUnknown) {
    return {
      value: "Fixture availability unknown",
      tone: "unknown",
    };
  }
  if (label) {
    return {
      value: qualifySyntheticAvailability(label),
      tone: detailGroup || detailState || availabilityState || "known",
    };
  }
  const formatted = formatOfferAvailability(product?.availabilityState, detail);
  return {
    value: /availability\s+mixed/i.test(formatted) ? "Fixture availability unknown" : formatted,
    tone: availabilityState || "known",
  };
}

export function getCatalogSnapshotEvidenceLabel(product, options = {}) {
  const compactExplanation = cleanCatalogSnapshotLabel(options.compactExplanation);
  if (compactExplanation && compactExplanation.toLowerCase() !== "strong fit right now") {
    return compactExplanation;
  }

  const merchBadges = Array.isArray(options.merchBadges) ? options.merchBadges : [];
  const evidenceBadge = merchBadges.find((entry) => {
    const label = String(entry?.label || "").toLowerCase();
    return label && !label.includes("review") && !label.includes("retailer check");
  });
  if (evidenceBadge?.label) return cleanCatalogSnapshotLabel(evidenceBadge.label);

  const ingredient =
    (product.ingredients || []).find((entry) =>
      ["vitamin c", "niacinamide", "retinol", "salicylic acid", "ceramides", "hyaluronic acid", "spf"].includes(entry),
    );
  if (ingredient) return titleCase(ingredient);

  const focusLabel = cleanCatalogSnapshotLabel(options.focusLabel);
  if (focusLabel) return `${focusLabel} fit`;

  const categoryLabel = cleanCatalogSnapshotLabel(options.categoryLabel);
  if (categoryLabel) return `${categoryLabel} role`;

  return "Evidence limited";
}

export function getCatalogSnapshotWatchTrust(product, options = {}) {
  const catchText = cleanCatalogSnapshotLabel(options.catchText);
  if (catchText && catchText.toLowerCase() !== "caution level stays moderate") {
    return {
      label: "Watch",
      value: catchText,
      tone: "watch",
    };
  }

  const warnings = Array.isArray(options.warnings) ? options.warnings : [];
  const warning = cleanCatalogSnapshotLabel(warnings[0]);
  if (warning) {
    return {
      label: "Watch",
      value: warning,
      tone: "watch",
    };
  }

  const primaryMerchBadge = options.primaryMerchBadge || null;
  const badgeLabel = cleanCatalogSnapshotLabel(primaryMerchBadge?.label);
  if (/review|confidence|trust/i.test(badgeLabel)) {
    return {
      label: "Trust",
      value: badgeLabel,
      tone: "trust",
    };
  }

  if (typeof product?.rating === "number" && typeof product?.reviewCount === "number") {
    if (product.reviewCount >= 200 && product.rating >= 4.5) {
      return {
        label: "Trust",
        value: "Large synthetic review sample",
        tone: "trust",
      };
    }
    if (product.reviewCount >= 75 && product.rating >= 4.2) {
      return {
        label: "Trust",
        value: "Synthetic review sample",
        tone: "trust",
      };
    }
    return {
      label: "Trust",
      value: "Limited synthetic review sample",
      tone: "limited",
    };
  }

  if (typeof product?.rating === "number") {
    return {
      label: "Trust",
      value: `${product.rating.toFixed(1)} synthetic rating`,
      tone: "limited",
    };
  }

  return {
    label: "Trust",
    value: "Review signal limited",
    tone: "limited",
  };
}

export function getCatalogComparisonSnapshot(product, options = {}) {
  const match = getCatalogSnapshotMatchLabel(product, options.retailerComparison);
  const availability = getCatalogSnapshotAvailabilityLabel(product);
  const evidence = getCatalogSnapshotEvidenceLabel(product, options);
  const watchTrust = getCatalogSnapshotWatchTrust(product, options);
  return [
    { key: "match", label: "Match", value: match.value, tone: match.tone },
    { key: "availability", label: "Stock", value: availability.value, tone: availability.tone },
    { key: "evidence", label: "Evidence", value: evidence, tone: "evidence" },
    { key: "watch", label: watchTrust.label, value: watchTrust.value, tone: watchTrust.tone },
  ];
}

export function renderCatalogProofGridMarkup(product, { focusLabel = "", categoryLabel = "", retailerComparison = null } = {}) {
  const rankingContext = getCatalogRankingContext();
  const evidence = getCatalogCaseEvidence(product, rankingContext);
  const contextLabel = rankingContext.primaryConcern || rankingContext.sourceLabel || rankingContext.label || "";
  const caseValue = rankingContext.isNeutral
    ? focusLabel || categoryLabel || "Broad fit"
    : evidence.leadEligible
      ? `Lead for ${titleCase(contextLabel).toLowerCase()}`
      : evidence.supportEligible
        ? `Supports ${titleCase(contextLabel).toLowerCase()}`
        : focusLabel || categoryLabel || "Broad fit";
  const entries = [
    { label: "Case", value: caseValue },
    { label: "Spend", value: getCatalogSpendSummary(product) },
    { label: "Store", value: getCatalogStoreSummary(retailerComparison) },
  ];
  return entries
    .map(
      (entry) => `
        <article class="product-proof-item">
          <span>${escapeHtml(entry.label)}</span>
          <strong>${escapeHtml(entry.value)}</strong>
        </article>
      `,
    )
    .join("");
}

export function getCatalogDecisionStateCopy(product) {
  const status = getShortlistStatus(product.id);
  if (status === "core") return "Saved as champion";
  if (status === "optional") return "Saved as backup";
  if (status === "reject") return "Saved but cut from this case";
  return "Saved and still under review";
}

export function renderCatalogQuickStatusMarkup(product) {
  if (!state.favoriteIds.includes(product.id)) return "";
  const currentStatus = getShortlistStatus(product.id);
  return `
    <p class="product-decision-state">
      <strong>Decision set</strong>
      <span>${escapeHtml(getCatalogDecisionStateCopy(product))}</span>
    </p>
    <div class="product-status-quickbar" role="group" aria-label="Decision status for ${escapeHtml(product.name)}">
      ${Object.entries(SHORTLIST_STATUS_LABELS)
        .map(
          ([value, label]) => `
            <button class="product-status-chip${currentStatus === value ? " active" : ""}" type="button" data-shortlist-status="${escapeHtml(
              value,
            )}" data-id="${escapeHtml(product.id)}" aria-pressed="${currentStatus === value}">
              ${escapeHtml(label)}
            </button>
          `,
        )
      .join("")}
    </div>
  `;
}

export function truncateSupportText(value, maxLength = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength - 1);
  const lastBreak = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf(";"), clipped.lastIndexOf(","), clipped.lastIndexOf(" "));
  const safe = (lastBreak > 70 ? clipped.slice(0, lastBreak) : clipped).trim();
  return `${safe}…`;
}

export function getCatalogSupportDetails(product, options = {}) {
  const compact = Boolean(options.compact);
  const details = [];
  if (product.benefitsText) {
    details.push({ label: "Benefits", text: truncateSupportText(product.benefitsText, compact ? 112 : 150) });
  }
  if (product.howToUseText) {
    details.push({ label: "How to use", text: truncateSupportText(product.howToUseText, compact ? 124 : 165) });
  }
  return details.slice(0, compact ? 1 : 2);
}

export function renderCatalogSupportDetailMarkup(product, options = {}) {
  const details = getCatalogSupportDetails(product, options);
  if (!details.length) return "";
  const className = options.compact ? "product-support-detail product-support-detail-compact" : "product-support-detail";
  return `
    <div class="${className}">
      ${details
        .map(
          (detail) => `
            <p>
              <strong>${escapeHtml(detail.label)}</strong>
              <span>${escapeHtml(detail.text)}</span>
            </p>
          `,
        )
        .join("")}
    </div>
  `;
}

export function getCatalogTagLabels(product) {
  const rankingContext = getCatalogRankingContext();
  const goal = rankingContext.primaryConcern || rankingContext.concern;
  const labels = [];

  if (state.concern !== "all" && product.concerns.includes(state.concern)) {
    labels.push(titleCase(state.concern));
  } else if (goal && goal !== "all" && product.concerns.includes(goal)) {
    labels.push(titleCase(goal));
  }

  if (
    state.profile !== "all" &&
    product.concerns.some((concern) => SKIN_PROFILES[state.profile].concerns.includes(concern))
  ) {
    const profileConcern = product.concerns.find((concern) => SKIN_PROFILES[state.profile].concerns.includes(concern));
    if (profileConcern && !labels.includes(titleCase(profileConcern))) {
      labels.push(titleCase(profileConcern));
    }
  }

  product.concerns.forEach((concern) => {
    const label = titleCase(concern);
    if (!labels.includes(label)) {
      labels.push(label);
    }
  });

  return labels.slice(0, labels.length > 1 ? 2 : 1);
}

export function getCatalogMerchBadgeEntries(product, options = {}) {
  const lowerIngredients = new Set((product.ingredients || []).map((ingredient) => String(ingredient).toLowerCase()));
  const entries = [];
  const rankingContext = getCatalogRankingContext();
  const evidence = getCatalogCaseEvidence(product, rankingContext);
  const caseRelevant = Boolean(evidence.leadEligible || evidence.supportEligible);
  const activeLaneKey = rankingContext.lane?.key || state.browseLaneKey || "";
  const hasVitaminC = lowerIngredients.has("vitamin c") && product.concerns.some((concern) => ["dark spots", "dullness"].includes(concern));
  const hasDailySpf = product.category === "sunscreen" || lowerIngredients.has("spf");

  if (isCatalogDarkSpotContext(rankingContext) && caseRelevant) {
    if (activeLaneKey === "daily-spf" && hasDailySpf) {
      entries.push({ tone: "cool", label: "Daily SPF" });
    }
    if (hasVitaminC) {
      entries.push({ tone: "warm", label: "Vitamin C" });
    }
    if (activeLaneKey !== "daily-spf" && hasDailySpf) {
      entries.push({ tone: "cool", label: "Daily SPF" });
    }
    if (!hasVitaminC && lowerIngredients.has("niacinamide")) {
      entries.push({ tone: "warm", label: "Tone support" });
    }
  }

  if (typeof product.rating === "number" && product.rating >= 4.5 && (product.reviewCount || 0) >= 200) {
    entries.push({ tone: "sage", label: "Large synthetic review sample" });
  } else if (typeof product.rating === "number" && product.rating >= 4.2 && (product.reviewCount || 0) >= 75) {
    entries.push({ tone: "sage", label: "Synthetic review sample" });
  }

  if (typeof product.price === "number" && product.price <= 35 && typeof product.rating === "number" && product.rating >= 4.2) {
    entries.push({ tone: "sand", label: "Lower spend" });
  } else if (typeof product.price === "number" && product.price <= 50) {
    entries.push({ tone: "sand", label: "Under $50" });
  }

  if (product.category === "sunscreen") {
    entries.push({ tone: "cool", label: "Daily SPF" });
  }

  if (isSensitiveSafeProduct(product) && (state.userProfile.sensitivity === "high" || lowerIngredients.has("fragrance-free"))) {
    entries.push({ tone: "cool", label: "Lower irritation" });
  } else if ([...lowerIngredients].some((ingredient) => BARRIER_SUPPORT_INGREDIENTS.includes(ingredient))) {
    entries.push({ tone: "warm", label: "Barrier support" });
  }

  if (lowerIngredients.has("vitamin c") && product.concerns.some((concern) => ["dark spots", "dullness"].includes(concern))) {
    entries.push({ tone: "warm", label: "Vitamin C" });
  }

  if (options.hasRetailerGraph) {
    entries.push({ tone: "neutral", label: "Fixture overlap" });
  }

  return entries.filter((entry, index, all) => all.findIndex((candidate) => candidate.label === entry.label) === index).slice(0, 3);
}

export function shouldShowCatalogIngredientInsight(product) {
  const highlightedIngredients = product.ingredients.filter((ingredient) =>
    ["retinol", "salicylic acid", "glycolic acid", "lactic acid", "vitamin c", "niacinamide", "ceramides", "spf"].includes(ingredient),
  );
  const rankingContext = getCatalogRankingContext();
  const goal = rankingContext.primaryConcern || rankingContext.concern;
  const ingredientMatchesGoal = highlightedIngredients.some((ingredient) => {
    if (goal === "dark spots") return ["vitamin c", "niacinamide", "retinol", "spf"].includes(ingredient);
    if (goal === "acne") return ["salicylic acid", "niacinamide", "retinol"].includes(ingredient);
    if (goal === "dryness" || goal === "redness") return ["ceramides", "niacinamide"].includes(ingredient);
    if (goal === "texture" || goal === "wrinkles") return ["retinol", "glycolic acid", "lactic acid"].includes(ingredient);
    return false;
  });

  return highlightedIngredients.length > 0 && (ingredientMatchesGoal || highlightedIngredients.length >= 2);
}

export function getCatalogCardSignalProfile(product, options = {}) {
  const hasRating = typeof product.rating === "number" && typeof product.reviewCount === "number";
  const hasOverlap = Boolean(options.hasRetailerGraph);
  const hasIngredientInsight = Boolean(options.hasIngredientInsight);
  const hasConflict = Boolean(options.hasConflict);
  const hasContextSignal = Boolean(options.hasContextSignal);
  const weakData = !hasRating && !hasOverlap && !hasIngredientInsight && !hasConflict && !hasContextSignal;
  return {
    hasRating,
    hasOverlap,
    weakData,
  };
}

export function getCatalogSortLabel() {
  return sortFilter?.selectedOptions?.[0]?.textContent?.trim() || "Best match";
}

export function renderActiveFilters({ filteredCount = null, activeLane = null, totalPages = null } = {}) {
  if (!activeFilters) return;
  const activeFocus = getActiveCatalogFocusDescriptor();
  const selectedLane = getActiveBrowseLane();
  const hasExplicitSort = state.sort !== "relevance" && (!selectedLane?.sort || state.sort !== selectedLane.sort);
  const chips = [
    state.browseLaneKey ? { key: "browse-lane", label: `Path: ${getBrowseLaneByKey(state.browseLaneKey)?.label || "Browse lane"}` } : null,
    state.profile !== "all" ? { key: "profile", label: getProfileLabel() } : null,
    state.retailer !== "all" ? { key: "retailer", label: state.retailer } : null,
    state.brand !== "all" ? { key: "brand", label: state.brand } : null,
    state.category !== "all" ? { key: "category", label: titleCase(state.category) } : null,
    state.ingredient !== "all" ? { key: "ingredient", label: titleCase(state.ingredient) } : null,
    state.concern !== "all" ? { key: "concern", label: titleCase(state.concern) } : null,
    state.search ? { key: "search", label: `Search · ${state.search}` } : null,
    hasExplicitSort ? { key: "sort", label: `Show · ${getCatalogSortLabel()}` } : null,
  ].filter(Boolean);
  const filtersBar = activeFilters.closest(".active-filters-bar");

  activeFilters.innerHTML = "";
  chips.forEach((chip) => {
    const isFocusChip = chip.key === activeFocus?.key;
    const label = isFocusChip ? `Focus: ${activeFocus.mobileLabel || activeFocus.label} · Change` : chip.label;
    const button = document.createElement("button");
    button.className = "active-filter-chip";
    button.classList.toggle("is-focus-chip", isFocusChip);
    button.type = "button";
    button.dataset.filterKey = chip.key;
    if (isFocusChip) {
      button.dataset.focusAction = "change";
      button.setAttribute("aria-label", `${label}. Tap to change focus.`);
      button.innerHTML = `<span>${escapeHtml(label)}</span>`;
    } else {
      button.setAttribute("aria-label", `${label}. Tap to clear this filter.`);
      button.innerHTML = `<span>${escapeHtml(label)}</span><strong aria-hidden="true">×</strong>`;
    }
    activeFilters.appendChild(button);
  });

  if (clearFiltersButton) {
    clearFiltersButton.hidden = !chips.length;
  }
  if (filtersBar) {
    const isEmpty = chips.length === 0;
    filtersBar.hidden = isEmpty;
    filtersBar.classList.toggle("is-empty", isEmpty);
    filtersBar.setAttribute("aria-hidden", String(isEmpty));
  }
}

export function renderMarketView(filtered, marketSnapshot = null) {
  marketGrid.innerHTML = "";
  if (!filtered.length) {
    marketGrid.innerHTML = `<article class="market-card empty-market"><h3>No store comparison yet</h3><p>Widen the current filters to compare stores again.</p></article>`;
    if (marketSessionSummary) {
      marketSessionSummary.textContent = "No retailer read yet. Widen the current scope.";
    }
    return;
  }

  const snapshot = marketSnapshot || getMarketViewSnapshot(filtered);
  const {
    groups,
    selectionLeader,
    valueLeader,
    ratedLeader,
    concernLeader,
    maxCount,
    maxRatedCount,
    maxConcernCount,
    minAveragePrice,
    leadingRetailer,
  } = snapshot;
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const shortlistRetailer = shortlistPayload?.oneStoreBasket?.retailer || null;
  const routineEntries = state.conversion.currentRoutineEntries;
  const routineFallback = routineEntries.length ? buildLocalBasketPlanPayload(routineEntries, "routine") : null;
  const routinePayload = routineEntries.length
    ? getActiveBasketPayload("routine", routineEntries, routineFallback) || routineFallback
    : null;
  const routineRetailer = routinePayload?.oneStoreBasket?.retailer || getCurrentRoutineOneStoreRetailer();
  const decisionReady = isCatalogDecisionReady();

  if (marketSessionSummary) {
    if (!decisionReady) {
      marketSessionSummary.textContent = `${leadingRetailer} has the strongest current fictional-fixture signal, but choose a product type, concern, ingredient, lane, or specific search before treating this as a checkout path.`;
    } else if (shortlistRetailer) {
      const shortlistSignature = getRetailerSignature(shortlistRetailer);
      marketSessionSummary.textContent =
        shortlistRetailer === leadingRetailer
          ? `${shortlistRetailer} is the cleanest decision-set checkout and still leads this view. ${shortlistSignature.summary}`
          : `${shortlistRetailer} is the cleanest one-store checkout for your current decision set. ${leadingRetailer} still leads the wider view on ${getMarketLeadReason(snapshot)}.`;
    } else if (routineRetailer) {
      const routineSignature = getRetailerSignature(routineRetailer);
      marketSessionSummary.textContent =
        routineRetailer === leadingRetailer
          ? `${routineRetailer} is the cleanest routine basket and still leads this view. ${routineSignature.summary}`
          : `${routineRetailer} is the cleanest one-store basket for your current routine. ${leadingRetailer} still leads the wider view on ${getMarketLeadReason(snapshot)}.`;
    } else {
      marketSessionSummary.textContent = `${leadingRetailer} leads this filtered view on ${getMarketLeadReason(snapshot)}. ${getRetailerSignature(leadingRetailer).summary}`;
    }
  }

  groups.forEach((entry) => {
    const signature = getRetailerSignature(entry.retailer);
    const pick = entry.products
      .map((product) => ({ product, score: scorePickByMode(product, entry.retailer) }))
      .sort((a, b) => b.score - a.score || (a.product.price ?? 0) - (b.product.price ?? 0))[0]?.product;
    const topReviewed = [...entry.ratedProducts].sort(
      (a, b) => (b.reviewCount ?? -1) - (a.reviewCount ?? -1) || (b.rating ?? -1) - (a.rating ?? -1),
    )[0];

    const badges = [
      entry.retailer === selectionLeader ? "Largest fixture set" : null,
      entry.retailer === valueLeader ? "Lowest fixture average" : null,
      entry.retailer === ratedLeader && entry.ratedProducts.length ? "Most fixture ratings" : null,
      entry.retailer === concernLeader ? `Largest fixture ${titleCase(state.concern)} set` : null,
    ].filter(Boolean);

    const currentEdge =
      entry.retailer === concernLeader && state.concern !== "all"
        ? `Largest fixture set for ${titleCase(state.concern)}`
        : entry.retailer === valueLeader
          ? "Lowest fixture average price"
          : entry.retailer === ratedLeader && entry.ratedProducts.length
            ? "Most fixture rating coverage"
            : entry.retailer === selectionLeader
              ? "Largest current fixture set"
              : `Most common fixture category: ${titleCase(entry.topCategory || "treatment")}`;
    const currentReason =
      entry.retailer === concernLeader && state.concern !== "all"
        ? `${entry.products.filter((product) => product.concerns.includes(state.concern)).length} products in this filtered slice support ${titleCase(state.concern).toLowerCase()}.`
        : entry.retailer === valueLeader && entry.avgPrice != null
          ? `${money(entry.avgPrice)} is the lowest average price across the visible fictional fixture sets.`
          : entry.retailer === ratedLeader && entry.ratedProducts.length
            ? `${entry.ratedProducts.length} fictional products in this slice carry fixture ratings.`
            : entry.retailer === selectionLeader
              ? `${entry.count} fictional products are in the current view, the largest fixture count right now.`
              : `${titleCase(entry.topCategory || "treatment")} is the most common category in this fictional store label's current view.`;
    const tradeoffs = [];
    if (entry.avgPrice != null && minAveragePrice != null && entry.avgPrice > minAveragePrice + 8) {
      tradeoffs.push("higher average spend");
    }
    if (entry.count < maxCount && maxCount - entry.count >= 3) {
      tradeoffs.push("narrower current selection");
    }
    if (entry.ratedProducts.length < maxRatedCount && maxRatedCount - entry.ratedProducts.length >= 2) {
      tradeoffs.push("lighter review coverage");
    }
    if (
      state.concern !== "all" &&
      maxConcernCount > 0 &&
      entry.products.filter((product) => product.concerns.includes(state.concern)).length < maxConcernCount
    ) {
      tradeoffs.push(`less ${titleCase(state.concern).toLowerCase()} depth`);
    }
    const tradeoffLine = tradeoffs.length
      ? `Watch for ${tradeoffs.slice(0, 2).join(" · ")}.`
      : "Watch for fewer obvious downsides in the current slice.";

    const supportingSignals = [
      {
        label: "Average price",
        value: entry.avgPrice != null ? `${money(entry.avgPrice)}` : "Mixed",
        emphasis: entry.retailer === valueLeader,
      },
      {
        label: state.concern !== "all" ? `${titleCase(state.concern)} picks` : "Top concern",
        value:
          state.concern !== "all"
            ? `${entry.products.filter((product) => product.concerns.includes(state.concern)).length}`
            : titleCase(entry.topConcern),
        emphasis: entry.retailer === concernLeader && state.concern !== "all",
      },
      {
        label: "Top category",
        value: titleCase(entry.topCategory || "treatment"),
        emphasis: false,
      },
      {
        label: "Rated coverage",
        value: `${entry.ratedProducts.length}/${entry.count}`,
        emphasis: entry.retailer === ratedLeader && entry.ratedProducts.length > 0,
      },
    ];

    const card = document.createElement("article");
    card.className = "market-card";
    card.classList.toggle("market-card-leading", entry.retailer === leadingRetailer);
    card.innerHTML = `
      <div class="market-topline">
        <div class="market-topline-main">
          <span class="market-retailer">${escapeHtml(entry.retailer)}</span>
        ${entry.retailer === leadingRetailer ? '<span class="market-winner-badge">Current fixture leader</span>' : ""}
        </div>
        <strong>${entry.count} products</strong>
      </div>
      <p class="market-takeaway">${escapeHtml(currentEdge)}</p>
      <p class="market-reason">${escapeHtml(currentReason)}</p>
      <p class="market-tradeoff">Fixture boundary: ${escapeHtml(signature.summary)} ${escapeHtml(tradeoffLine)}</p>
      <p class="market-stat">${entry.avgPrice != null ? `${money(entry.avgPrice)} avg` : "Price coverage mixed"}</p>
      <div class="market-badges">
        ${[signature.badge, ...badges].map((badge) => `<span>${escapeHtml(badge)}</span>`).join("") || `<span>In current view</span>`}
      </div>
      <div class="market-details">
        ${supportingSignals
          .map(
            (signal) =>
              `<p class="${signal.emphasis ? "market-detail-emphasis" : ""}"><strong>${escapeHtml(signal.label)}</strong><span>${escapeHtml(signal.value)}</span></p>`,
          )
          .join("")}
      </div>
      ${
        topReviewed
          ? `<p class="market-copy">Fixture example: ${
              topReviewed.url
                ? `<span class="market-copy-link" aria-disabled="true">${escapeHtml(topReviewed.brand)} ${escapeHtml(topReviewed.name)}</span>`
                : `${escapeHtml(topReviewed.brand)} ${escapeHtml(topReviewed.name)}`
            } · ${topReviewed.reviewCount.toLocaleString()} synthetic fixture reviews. ${escapeHtml(signature.caution)}</p>`
          : pick
            ? `<p class="market-copy">Fixture example: ${
                pick.url
                  ? `<span class="market-copy-link" aria-disabled="true">${escapeHtml(pick.brand)} ${escapeHtml(pick.name)}</span>`
                  : `${escapeHtml(pick.brand)} ${escapeHtml(pick.name)}`
              }. ${escapeHtml(signature.caution)}</p>`
            : `<p class="market-copy">${escapeHtml(signature.caution)}</p>`
      }
    `;
    marketGrid.appendChild(card);
  });

  if (marketApplyWinnerButton) {
    marketApplyWinnerButton.disabled = !leadingRetailer || state.retailer === leadingRetailer;
    marketApplyWinnerButton.dataset.retailer = leadingRetailer || "";
    marketApplyWinnerButton.textContent =
      leadingRetailer && state.retailer !== leadingRetailer ? `Focus ${leadingRetailer}` : "Focus winning store";
  }

  if (marketOpenBasketButton) {
    const hasOpenPath = Boolean(state.favoriteIds.length || routineEntries.length);
    marketOpenBasketButton.disabled = decisionReady ? !hasOpenPath : false;
    marketOpenBasketButton.textContent = !decisionReady
      ? "Choose focus first"
      : shortlistRetailer
        ? `Review ${shortlistRetailer} basket`
        : state.favoriteIds.length
          ? "Open shortlist"
          : routineRetailer
            ? "Review routine draft"
            : "No retailer path yet";
  }
}

export function getSpotlightProduct(products) {
  const savedProducts = getShortlistSavedProducts();
  const championProduct = getShortlistChampionProduct(savedProducts);
  if (championProduct && products.some((product) => product.id === championProduct.id)) {
    return championProduct;
  }
  const backupProduct = getShortlistBackupProduct(savedProducts);
  if (!championProduct && backupProduct && products.some((product) => product.id === backupProduct.id)) {
    return backupProduct;
  }
  let bestProduct = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  products.forEach((product) => {
    if (!product?.url) return;
    const score = scoreBestOverall(product);
    if (
      score > bestScore ||
      (score === bestScore && (product.price ?? Number.MAX_SAFE_INTEGER) < (bestProduct?.price ?? Number.MAX_SAFE_INTEGER))
    ) {
      bestProduct = product;
      bestScore = score;
    }
  });

  return bestProduct || products[0] || state.products[0] || null;
}

export function filterProducts() {
  return getFilteredProductsState().products.slice();
}

export function getProductById(id) {
  return getProductLookupState().productsById.get(id) || null;
}

export function loadFavorites() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("skincare-hub-favorites") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function loadShortlistStatuses() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SHORTLIST_STATUS_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

export function loadTrackedAlertIds() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(TRACKED_ALERTS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function createDefaultWatchEventRules() {
  return {
    priceDrop: true,
    lowestTracked: true,
    backInStock: true,
    limitedStock: true,
    backorder: true,
    preorder: true,
    discontinued: true,
  };
}

export function createDefaultWatchThresholds() {
  return {
    targetPrice: null,
    minAbsoluteDrop: null,
    minPercentDrop: null,
  };
}

export function createDefaultWatchDelivery() {
  return {
    inApp: true,
    push: false,
    email: false,
  };
}

export function createDefaultQuietHours() {
  return {
    enabled: false,
    startHour: 22,
    endHour: 8,
  };
}

export function normalizeWatchNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeWatchedItem(value) {
  if (!value || typeof value !== "object") return null;
  const comparisonKey = String(value.comparisonKey || "").trim();
  if (!comparisonKey) return null;
  const createdAt = toIsoTimestamp(value.createdAt, nowIso());
  const updatedAt = toIsoTimestamp(value.updatedAt, createdAt);
  return {
    id: String(value.id || `watch-${comparisonKey}`),
    comparisonKey,
    identityKey: String(
      value.identityKey ||
        value.canonicalProductId ||
        value.seedOfferId ||
        comparisonKey,
    ).trim(),
    scopeType: "exact-product-group",
    seedOfferId: value.seedOfferId ? String(value.seedOfferId) : null,
    preferredRetailer: value.preferredRetailer ? String(value.preferredRetailer) : null,
    eventRules: {
      ...createDefaultWatchEventRules(),
      ...(value.eventRules && typeof value.eventRules === "object" ? value.eventRules : {}),
    },
    thresholds: {
      targetPrice: normalizeWatchNumber(value.thresholds?.targetPrice),
      minAbsoluteDrop: normalizeWatchNumber(value.thresholds?.minAbsoluteDrop),
      minPercentDrop: normalizeWatchNumber(value.thresholds?.minPercentDrop),
    },
    delivery: {
      ...createDefaultWatchDelivery(),
      ...(value.delivery && typeof value.delivery === "object" ? value.delivery : {}),
      inApp: true,
    },
    mutedUntil: value.mutedUntil ? toIsoTimestamp(value.mutedUntil, null) : null,
    source: String(value.source || "manual"),
    createdAt,
    updatedAt,
    deletedAt: value.deletedAt ? toIsoTimestamp(value.deletedAt, updatedAt) : null,
  };
}

export function loadWatchedItems() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(WATCHED_ITEMS_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.map((item) => normalizeWatchedItem(item)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function loadSavedArticles() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("skincare-hub-articles") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function loadSavedProfiles() {
  try {
    return JSON.parse(window.localStorage.getItem("skincare-hub-profiles") || "[]")
      .filter((entry) => entry?.filters)
      .map((entry) => ({
        ...entry,
        filters: createSavedProfileFilters(entry.filters),
      }));
  } catch {
    return [];
  }
}

export function createDefaultUserProfile() {
  return {
    name: "",
    budget: "any",
    goal: "dryness",
    goalSource: "default",
    profile: "all",
    sensitivity: "moderate",
    activesComfort: "medium",
    avoidIngredients: [],
    updatedAt: null,
  };
}

export function loadUserProfile() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("skincare-hub-user-profile") || "{}");
    const profile = normalizeSkinProfile(saved.profile || "all");
    const goal = normalizeUserProfileGoalForLens(saved.goal || "dryness", profile);
    return {
      name: typeof saved.name === "string" ? saved.name.slice(0, 80) : "",
      budget: saved.budget || "any",
      goal,
      goalSource: normalizeCatalogGoalSource({
        goal,
        profile,
        goalSource: saved.goalSource || (profile !== "all" ? "profile" : "default"),
      }),
      profile,
      sensitivity: saved.sensitivity || "moderate",
      activesComfort: saved.activesComfort || "medium",
      updatedAt: saved.updatedAt || null,
      avoidIngredients: Array.isArray(saved.avoidIngredients)
        ? saved.avoidIngredients.filter((ingredient) => AVOID_INGREDIENT_OPTIONS.includes(ingredient))
        : [],
    };
  } catch {
    return createDefaultUserProfile();
  }
}

export function loadSavedRoutines() {
  try {
    const saved = JSON.parse(window.localStorage.getItem("skincare-hub-routines") || "[]");
    return Array.isArray(saved)
      ? saved
          .filter((entry) => entry?.config)
          .map((entry) => ({ ...entry, config: normalizeSavedRoutineConfig(entry.config) }))
      : [];
  } catch {
    return [];
  }
}

export function normalizeSavedRoutineConfig(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const retailer = source.retailer === "all" || Object.prototype.hasOwnProperty.call(RETAILER_SIGNATURES, source.retailer)
    ? source.retailer
    : "all";
  return {
    ...source,
    routineConcern: normalizeRoutineConcern(source.routineConcern, "dryness"),
    routineTime: source.routineTime === "pm" ? "pm" : "am",
    routineBudget: Object.prototype.hasOwnProperty.call(ROUTINE_BUDGETS, source.routineBudget) ? source.routineBudget : "smart",
    retailer,
    profile: normalizeSkinProfile(source.profile || "all"),
    sensitivity: ["low", "moderate", "high"].includes(source.sensitivity) ? source.sensitivity : "moderate",
    activesComfort: ["low", "medium", "high"].includes(source.activesComfort) ? source.activesComfort : "medium",
    avoidIngredients: Array.isArray(source.avoidIngredients)
      ? source.avoidIngredients.filter((ingredient) => AVOID_INGREDIENT_OPTIONS.includes(ingredient))
      : [],
    routineDraft: source.routineDraft && typeof source.routineDraft === "object" ? deepCopy(source.routineDraft) : {},
  };
}

export function normalizeContinuityVersions(value = {}) {
  return {
    ...createDefaultContinuityVersions(),
    ...(value && typeof value === "object" ? value : {}),
  };
}

export function normalizeContinuitySavedEntries(value, valueKey) {
  const entries = Array.isArray(value?.entries) ? value.entries : [];
  return {
    entries: entries
      .map((entry) => {
        if (!entry?.id) return null;
        const storedValue = entry[valueKey] && typeof entry[valueKey] === "object" ? deepCopy(entry[valueKey]) : {};
        return {
          id: String(entry.id),
          label: String(entry.label || ""),
          savedAt: toIsoTimestamp(entry.savedAt, nowIso()),
          updatedAt: toIsoTimestamp(entry.updatedAt, toIsoTimestamp(entry.savedAt, nowIso())),
          deletedAt: entry.deletedAt ? toIsoTimestamp(entry.deletedAt, nowIso()) : null,
          [valueKey]: valueKey === "config"
            ? normalizeSavedRoutineConfig(storedValue)
            : valueKey === "filters"
              ? createSavedProfileFilters(storedValue)
              : storedValue,
        };
      })
      .filter(Boolean),
  };
}

export function normalizeContinuityWatchedItems(value) {
  const items = Array.isArray(value?.items) ? value.items : [];
  return {
    items: items
      .map((item) => normalizeWatchedItem(item))
      .filter(Boolean)
      .sort(
        (left, right) =>
          parseTimestamp(right.updatedAt)?.getTime() - parseTimestamp(left.updatedAt)?.getTime() ||
          parseTimestamp(right.createdAt)?.getTime() - parseTimestamp(left.createdAt)?.getTime() ||
          String(left.comparisonKey).localeCompare(String(right.comparisonKey)),
      ),
  };
}

export function normalizeContinuityDomains(value = {}) {
  const next = createDefaultContinuityDomains();
  const source = value && typeof value === "object" ? value : {};
  next.user_profile = {
    ...next.user_profile,
    ...(source.user_profile && typeof source.user_profile === "object" ? source.user_profile : {}),
    avoidIngredients: Array.isArray(source.user_profile?.avoidIngredients)
      ? [...new Set(source.user_profile.avoidIngredients.map((ingredient) => String(ingredient).trim()).filter(Boolean))].sort()
      : [],
    clientUpdatedAt: toIsoTimestamp(source.user_profile?.clientUpdatedAt, null),
  };
  next.user_profile.profile = normalizeSkinProfile(next.user_profile.profile || "all");
  next.user_profile.goal = normalizeUserProfileGoalForLens(next.user_profile.goal || "dryness", next.user_profile.profile);
  next.user_profile.budget = ["any", "budget", "balanced", "premium"].includes(next.user_profile.budget)
    ? next.user_profile.budget
    : "any";
  next.user_profile.sensitivity = ["low", "moderate", "high"].includes(next.user_profile.sensitivity)
    ? next.user_profile.sensitivity
    : "moderate";
  next.user_profile.activesComfort = ["low", "medium", "high"].includes(next.user_profile.activesComfort)
    ? next.user_profile.activesComfort
    : "medium";
  next.user_profile.avoidIngredients = next.user_profile.avoidIngredients.filter((ingredient) =>
    AVOID_INGREDIENT_OPTIONS.includes(ingredient),
  );
  next.user_profile.goalSource = normalizeCatalogGoalSource({
    goal: next.user_profile.goal,
    profile: next.user_profile.profile,
    goalSource:
      source.user_profile?.goalSource ||
      (next.user_profile.profile !== "all" || normalizeCatalogConcern(next.user_profile.goal) !== "dryness"
        ? "continuity-profile"
        : "default"),
  });
  next.shortlist = {
    items: Object.fromEntries(
      Object.entries(source.shortlist?.items || {})
        .map(([productId, item]) => {
          const normalizedId = String(productId || "").trim();
          if (!normalizedId) return [null, null];
          return [
            normalizedId,
            {
              saved: Boolean(item?.saved),
              savedChangedAt: toIsoTimestamp(item?.savedChangedAt, null),
              status: SHORTLIST_STATUS_LABELS[item?.status] ? item.status : "wait",
              statusChangedAt: toIsoTimestamp(item?.statusChangedAt, null),
              trackedExplicit: Boolean(item?.trackedExplicit),
              trackedChangedAt: toIsoTimestamp(item?.trackedChangedAt, null),
            },
          ];
        })
        .filter(([productId]) => Boolean(productId)),
    ),
  };
  next.watched_items = normalizeContinuityWatchedItems(source.watched_items);
  next.saved_articles = normalizeContinuitySavedEntries(source.saved_articles, "article");
  next.saved_profiles = normalizeContinuitySavedEntries(source.saved_profiles, "filters");
  next.saved_routines = normalizeContinuitySavedEntries(source.saved_routines, "config");
  next.routine_session = {
    ...next.routine_session,
    ...(source.routine_session && typeof source.routine_session === "object" ? source.routine_session : {}),
    avoidIngredients: Array.isArray(source.routine_session?.avoidIngredients)
      ? [...new Set(source.routine_session.avoidIngredients.map((ingredient) => String(ingredient).trim()).filter(Boolean))].sort()
      : [],
    draftState: source.routine_session?.draftState && typeof source.routine_session.draftState === "object"
      ? deepCopy(source.routine_session.draftState)
      : {},
    updatedAt: toIsoTimestamp(source.routine_session?.updatedAt, null),
  };
  next.routine_session.concern = next.routine_session.concern
    ? normalizeRoutineConcern(next.routine_session.concern, null)
    : null;
  next.routine_session.timing = next.routine_session.timing === "pm" ? "pm" : "am";
  next.routine_session.budgetLane = Object.prototype.hasOwnProperty.call(ROUTINE_BUDGETS, next.routine_session.budgetLane)
    ? next.routine_session.budgetLane
    : "smart";
  next.routine_session.profile = normalizeSkinProfile(next.routine_session.profile || "all");
  next.routine_session.sensitivity = ["low", "moderate", "high"].includes(next.routine_session.sensitivity)
    ? next.routine_session.sensitivity
    : "moderate";
  next.routine_session.activesComfort = ["low", "medium", "high"].includes(next.routine_session.activesComfort)
    ? next.routine_session.activesComfort
    : "medium";
  next.routine_session.avoidIngredients = next.routine_session.avoidIngredients.filter((ingredient) =>
    AVOID_INGREDIENT_OPTIONS.includes(ingredient),
  );
  return next;
}

export function loadContinuitySession() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CONTINUITY_SESSION_STORAGE_KEY) || "{}");
    return {
      token: typeof saved.token === "string" && saved.token ? saved.token : null,
      workspaceId: typeof saved.workspaceId === "string" && saved.workspaceId ? saved.workspaceId : null,
      deviceId: typeof saved.deviceId === "string" && saved.deviceId ? saved.deviceId : null,
      versions: normalizeContinuityVersions(saved.versions),
    };
  } catch {
    return {
      token: null,
      workspaceId: null,
      deviceId: null,
      versions: createDefaultContinuityVersions(),
    };
  }
}

export function loadContinuityShadowState() {
  try {
    return normalizeContinuityDomains(JSON.parse(window.localStorage.getItem(CONTINUITY_SHADOW_STORAGE_KEY) || "{}"));
  } catch {
    return createDefaultContinuityDomains();
  }
}

export function persistContinuitySessionState() {
  try {
    window.localStorage.setItem(
      CONTINUITY_SESSION_STORAGE_KEY,
      JSON.stringify({
        token: state.continuity.token,
        workspaceId: state.continuity.workspaceId,
        deviceId: state.continuity.deviceId,
        versions: state.continuity.versions,
      }),
    );
  } catch {
    // Ignore continuity session persistence failures.
  }
}

export function persistContinuityShadowState() {
  try {
    window.localStorage.setItem(CONTINUITY_SHADOW_STORAGE_KEY, JSON.stringify(state.continuity.shadow));
  } catch {
    // Ignore continuity shadow persistence failures.
  }
}

export function loadRoutinePlannerSession() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(ROUTINE_PLANNER_SESSION_KEY) || "{}");
    if (!saved || typeof saved !== "object") return null;
    return {
      draftId: typeof saved.draftId === "string" && saved.draftId ? saved.draftId : null,
      concern: typeof saved.concern === "string" && saved.concern ? normalizeRoutineConcern(saved.concern, null) : null,
      timing: saved.timing === "pm" ? "pm" : saved.timing === "am" ? "am" : null,
      budgetLane: Object.prototype.hasOwnProperty.call(ROUTINE_BUDGETS, saved.budgetLane) ? saved.budgetLane : null,
      profile: typeof saved.profile === "string" ? normalizeSkinProfile(saved.profile) : null,
      sensitivity: saved.sensitivity === "high" ? "high" : saved.sensitivity === "low" ? "low" : saved.sensitivity === "moderate" ? "moderate" : null,
      activesComfort:
        saved.activesComfort === "high" ? "high" : saved.activesComfort === "low" ? "low" : saved.activesComfort === "medium" ? "medium" : null,
      avoidIngredients: Array.isArray(saved.avoidIngredients)
        ? saved.avoidIngredients.filter((ingredient) => AVOID_INGREDIENT_OPTIONS.includes(ingredient))
        : [],
      draftState: saved.draftState && typeof saved.draftState === "object" ? { ...saved.draftState } : {},
      updatedAt: toIsoTimestamp(saved.updatedAt, null),
    };
  } catch {
    return null;
  }
}

export function persistRoutinePlannerSession({ skipContinuitySync = false, preserveUpdatedAt = false } = {}) {
  if (!preserveUpdatedAt || !state.routinePlanner.sessionUpdatedAt) {
    state.routinePlanner.sessionUpdatedAt = toIsoTimestamp(state.routinePlanner.draftUpdatedAt, null) || nowIso();
  }
  try {
    window.localStorage.setItem(
      ROUTINE_PLANNER_SESSION_KEY,
      JSON.stringify({
        draftId: state.routinePlanner.draftId,
        concern: state.routineConcern,
        timing: state.routineTime,
        budgetLane: state.routineBudget,
        profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
        sensitivity: state.userProfile.sensitivity,
        activesComfort: state.userProfile.activesComfort,
        avoidIngredients: getRoutinePlannerAvoidIngredients(),
        draftState: getSerializableRoutineDraftState(),
        updatedAt: state.routinePlanner.sessionUpdatedAt,
      }),
    );
  } catch {
    // Keep the in-memory planner usable when browser storage is unavailable.
  }
  if (!skipContinuitySync) {
    updateContinuityShadowFromLocalState();
  }
}

export function clearRoutinePlannerSession() {
  try {
    window.localStorage.removeItem(ROUTINE_PLANNER_SESSION_KEY);
  } catch {
    // The in-memory reset remains authoritative when browser storage is unavailable.
  }
}

export function resetRoutinePlannerCaches({ clearRestoreState = false } = {}) {
  state.routinePlanner.contextKey = null;
  state.routinePlanner.plan = null;
  state.routinePlanner.alternatives = {};
  state.routinePlanner.loadingAlternatives = {};
  state.routinePlanner.loading = false;
  state.routinePlanner.planError = null;
  state.routinePlanner.rationaleContextKey = null;
  state.routinePlanner.rationale = null;
  state.routinePlanner.rationaleLoading = false;
  state.routinePlanner.rationaleError = false;
  if (clearRestoreState) {
    state.routinePlanner.restoredDraft = false;
    state.routinePlanner.restoreError = false;
  }
}

export async function restoreRoutinePlannerSession() {
  const session = loadRoutinePlannerSession();
  if (!session) return;

  if (session.concern) {
    state.routineConcern = session.concern;
  }
  if (session.timing) {
    state.routineTime = session.timing;
  }
  if (session.budgetLane) {
    state.routineBudget = session.budgetLane;
  }
  if (session.profile) {
    state.profile = session.profile;
    state.userProfile.profile = session.profile;
  }
  if (session.sensitivity) {
    state.userProfile.sensitivity = session.sensitivity;
  }
  if (session.activesComfort) {
    state.userProfile.activesComfort = session.activesComfort;
  }
  if (Array.isArray(session.avoidIngredients)) {
    state.userProfile.avoidIngredients = [...session.avoidIngredients];
  }
  state.routineDraft = session.draftState && typeof session.draftState === "object" ? { ...session.draftState } : {};
  state.routinePlanner.draftId = session.draftId || null;
  state.routinePlanner.draftUpdatedAt = session.updatedAt || null;
  state.routinePlanner.sessionUpdatedAt = session.updatedAt || null;
  state.routinePlanner.restoredDraft = Boolean(session.draftId || Object.keys(state.routineDraft).length);
  state.routinePlanner.restoreError = false;
  resetRoutinePlannerCaches();
  const restoreContextSignature = JSON.stringify({
    concern: state.routineConcern,
    timing: state.routineTime,
    budgetLane: state.routineBudget,
    profile: state.profile,
    sensitivity: state.userProfile.sensitivity,
    activesComfort: state.userProfile.activesComfort,
    avoidIngredients: [...(state.userProfile.avoidIngredients || [])].sort(),
    draftId: state.routinePlanner.draftId,
  });

  if (!state.live.apiBacked || !state.routinePlanner.draftId) {
    persistRoutinePlannerSession();
    return;
  }

  state.routinePlanner.restoringDraft = true;
  try {
    const response = await fetch(buildApiUrl(`/api/routine-drafts/${state.routinePlanner.draftId}`), {
      cache: "no-store",
      headers: buildApiHeaders(`/api/routine-drafts/${state.routinePlanner.draftId}`),
    });
    if (response.status === 404) {
      state.routinePlanner.draftId = null;
      state.routinePlanner.draftUpdatedAt = null;
      state.routinePlanner.restoredDraft = Boolean(Object.keys(state.routineDraft).length);
      persistRoutinePlannerSession();
      return;
    }
    if (!response.ok) {
      throw new Error("Routine draft restore failed");
    }
    const payload = await response.json();
    const currentRestoreContextSignature = JSON.stringify({
      concern: state.routineConcern,
      timing: state.routineTime,
      budgetLane: state.routineBudget,
      profile: state.profile,
      sensitivity: state.userProfile.sensitivity,
      activesComfort: state.userProfile.activesComfort,
      avoidIngredients: [...(state.userProfile.avoidIngredients || [])].sort(),
      draftId: state.routinePlanner.draftId,
    });
    if (currentRestoreContextSignature !== restoreContextSignature) {
      state.routinePlanner.restoreError = false;
      persistRoutinePlannerSession();
      return;
    }
    state.routineConcern = normalizeRoutineConcern(payload.concern, state.routineConcern);
    state.routineTime = payload.timing || state.routineTime;
    state.routineBudget = payload.budgetLane || state.routineBudget;
    state.profile = normalizeSkinProfile(payload.profile || payload.summary?.context?.profile || state.profile);
    state.userProfile.profile = state.profile;
    state.userProfile.sensitivity = payload.sensitivity || payload.summary?.context?.sensitivity || state.userProfile.sensitivity;
    state.userProfile.activesComfort =
      payload.activesComfort || payload.summary?.context?.activesComfort || state.userProfile.activesComfort;
    state.userProfile.avoidIngredients = Array.isArray(payload.avoidIngredients)
      ? [...payload.avoidIngredients]
      : Array.isArray(payload.summary?.context?.avoidIngredients)
        ? [...payload.summary.context.avoidIngredients]
        : state.userProfile.avoidIngredients;
    state.routineDraft = payload.draftState && typeof payload.draftState === "object" ? { ...payload.draftState } : state.routineDraft;
    state.routinePlanner.draftId = payload.id || state.routinePlanner.draftId;
    state.routinePlanner.draftUpdatedAt = payload.updatedAt || payload.createdAt || state.routinePlanner.draftUpdatedAt;
    state.routinePlanner.sessionUpdatedAt = state.routinePlanner.draftUpdatedAt;
    state.routinePlanner.restoredDraft = true;
    state.routinePlanner.restoreError = false;
    persistRoutinePlannerSession();
  } catch {
    state.routinePlanner.restoreError = true;
  } finally {
    state.routinePlanner.restoringDraft = false;
  }
}

export function renderSavedPresets() {
  const currentProfileSignature = getCurrentProfileSignature();
  const currentRoutineSignature = getCurrentRoutineSignature();

  savedProfiles.innerHTML = "";
  if (!state.savedProfiles.length) {
    savedProfiles.innerHTML = `<span class="preset-empty">Save a shopping setup once you know it is worth reusing.</span>`;
  } else {
    state.savedProfiles.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "saved-preset";
      const isActive = getSavedProfileFiltersSignature(entry.filters) === currentProfileSignature;
      const summary = getSavedProfileCardSummary(entry);
      item.innerHTML = `
        <button class="saved-preset-main${isActive ? " active" : ""}" type="button" data-kind="profile" data-id="${escapeHtml(entry.id)}">
          <span class="saved-preset-kicker">Profile setup</span>
          <strong>${escapeHtml(entry.label || "Saved setup")}</strong>
          <span class="saved-preset-context">${escapeHtml(summary.primary)}</span>
          <small>${escapeHtml(summary.secondary || "Ready to reuse")} · ${isActive ? "Active now" : escapeHtml(formatFreshness(entry.savedAt))}</small>
        </button>
        <button class="saved-preset-remove" type="button" data-remove-kind="profile" data-id="${escapeHtml(entry.id)}" aria-label="Remove saved profile">×</button>
      `;
      savedProfiles.appendChild(item);
    });
  }

  savedRoutines.innerHTML = "";
  if (!state.savedRoutines.length) {
    savedRoutines.innerHTML = `<span class="preset-empty">Save a routine once the core steps feel realistic enough to reopen later.</span>`;
  } else {
    state.savedRoutines.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "saved-preset";
      const isActive = JSON.stringify(entry.config) === currentRoutineSignature;
      const summary = getSavedRoutineCardSummary(entry);
      item.innerHTML = `
        <button class="saved-preset-main${isActive ? " active" : ""}" type="button" data-kind="routine" data-id="${escapeHtml(entry.id)}">
          <span class="saved-preset-kicker">Routine setup</span>
          <strong>${escapeHtml(entry.label || "Saved routine")}</strong>
          <span class="saved-preset-context">${escapeHtml(summary.primary)}</span>
          <small>${escapeHtml(summary.secondary || "Ready to reuse")} · ${isActive ? "Active now" : escapeHtml(formatFreshness(entry.savedAt))}</small>
        </button>
        <button class="saved-preset-remove" type="button" data-remove-kind="routine" data-id="${escapeHtml(entry.id)}" aria-label="Remove saved routine">×</button>
      `;
      savedRoutines.appendChild(item);
    });
  }

  renderContinuityCard();
  renderDecisionWorkspaceSummary();
}

export function renderStats(metadata) {
  const stats = [
    { label: "Products", value: metadata.productCount },
    {
      label: "Synthetic ratings",
      value: state.products.filter(
        (product) => typeof product.rating === "number" && typeof product.reviewCount === "number",
      ).length,
    },
    {
      label: "Under $50",
      value: state.products.filter((product) => typeof product.price === "number" && product.price <= 50).length,
    },
    {
      label: "Compare-ready",
      value: state.products.filter(hasCatalogRetailerCheckSignal).length,
    },
  ];

  heroStats.innerHTML = "";
  stats.forEach((stat) => {
    const card = document.createElement("div");
    card.className = "stat";
    card.innerHTML = `<strong>${Number(stat.value || 0).toLocaleString()}</strong><span>${stat.label}</span>`;
    heroStats.appendChild(card);
  });
}

export function createUserProfileRecord(source = state.userProfile) {
  const profile = normalizeSkinProfile(source?.profile || state.profile || "all");
  return {
    name: String(source?.name || "").trim(),
    budget: ["any", "budget", "balanced", "premium"].includes(source?.budget) ? source.budget : "any",
    goal: normalizeUserProfileGoalForLens(typeof source?.goal === "string" && source.goal ? source.goal : "dryness", profile),
    profile,
    sensitivity: ["low", "moderate", "high"].includes(source?.sensitivity) ? source.sensitivity : "moderate",
    activesComfort: ["low", "medium", "high"].includes(source?.activesComfort) ? source.activesComfort : "medium",
    avoidIngredients: Array.isArray(source?.avoidIngredients)
      ? source.avoidIngredients.filter((ingredient) => AVOID_INGREDIENT_OPTIONS.includes(ingredient))
      : [],
  };
}

export function getSavedUserProfileRecord() {
  return createUserProfileRecord({ ...state.userProfile, profile: state.profile });
}

export function getUserProfileRecordKey(profile = getSavedUserProfileRecord()) {
  return JSON.stringify(profile);
}

export function syncUserProfileControls(profile = state.ui.profileEditing && state.ui.userProfileDraft ? state.ui.userProfileDraft : getSavedUserProfileRecord()) {
  const nextProfile = createUserProfileRecord(profile);
  userNameInput.value = nextProfile.name;
  userBudgetSelect.value = nextProfile.budget;
  userSensitivitySelect.value = nextProfile.sensitivity;
  userActivesComfortSelect.value = nextProfile.activesComfort;
  userSkinProfileSelect.value = nextProfile.profile;
  userGoalSelect.value = nextProfile.goal;
}

export function getSensitivityLabel(sensitivityValue = state.userProfile.sensitivity) {
  const labels = {
    low: "Low sensitivity",
    moderate: "Moderate sensitivity",
    high: "High sensitivity",
  };
  return labels[sensitivityValue] || "Moderate sensitivity";
}

export function getActivesComfortLabel(activesComfortValue = state.userProfile.activesComfort) {
  const labels = {
    low: "Gentle actives",
    medium: "Balanced actives",
    high: "Stronger actives okay",
  };
  return labels[activesComfortValue] || "Balanced actives";
}

export function getSavedProfileAvatarConfig(entry) {
  const filters = entry?.filters || {};
  const focus = String(filters.goal || filters.concern || "").toLowerCase();
  const mapping = [
    { matches: ["acne", "pores"], initials: "AC", tone: "clarity" },
    { matches: ["dryness", "redness", "general care"], initials: "BR", tone: "barrier" },
    { matches: ["dark spots", "dullness"], initials: "DS", tone: "brighten" },
    { matches: ["texture"], initials: "TX", tone: "texture" },
    { matches: ["wrinkles"], initials: "RN", tone: "renew" },
  ];
  const matched = mapping.find((entryConfig) => entryConfig.matches.some((value) => focus.includes(value)));
  if (matched) return matched;

  const fallbackSource = filters.profile && filters.profile !== "all" ? getProfileLabel(filters.profile) : entry?.label || "Setup";
  const initials = String(fallbackSource)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("") || "ST";
  return {
    initials,
    tone: "neutral",
  };
}

export function getUserProfileAvatarConfig(profile = getSavedUserProfileRecord()) {
  const nextProfile = createUserProfileRecord(profile);
  return getSavedProfileAvatarConfig({
    label: nextProfile.name || getProfileLabel(nextProfile.profile),
    filters: {
      goal: nextProfile.goal,
      concern: nextProfile.goal,
      profile: nextProfile.profile,
    },
  });
}

export function maybeAnimateUserProfileSurface(profileSignature) {
  if (!userProfilePanel) return;
  if (!profileSignature) return;
  if (lastRenderedUserProfileSignature === null) {
    lastRenderedUserProfileSignature = profileSignature;
    return;
  }
  if (profileSignature === lastRenderedUserProfileSignature) return;

  lastRenderedUserProfileSignature = profileSignature;
  userProfilePanel.classList.remove("is-transitioning");
  void userProfilePanel.offsetWidth;
  userProfilePanel.classList.add("is-transitioning");
  window.clearTimeout(profileSurfaceTransitionTimer);
  profileSurfaceTransitionTimer = window.setTimeout(() => {
    userProfilePanel.classList.remove("is-transitioning");
  }, 520);
}

export function syncUserProfileSummaryTabs() {
  const activeTab = state.ui.profileEditing ? "edit" : state.ui.profileSummaryTab === "saved" ? "saved" : "overview";
  const isOverview = activeTab === "overview";
  const isSaved = activeTab === "saved";
  const isEdit = activeTab === "edit";

  if (userProfileNavOverview) {
    userProfileNavOverview.classList.toggle("active", isOverview);
    userProfileNavOverview.setAttribute("aria-selected", String(isOverview));
    userProfileNavOverview.setAttribute("tabindex", isOverview ? "0" : "-1");
  }

  if (userProfileNavSaved) {
    userProfileNavSaved.classList.toggle("active", isSaved);
    userProfileNavSaved.setAttribute("aria-selected", String(isSaved));
    userProfileNavSaved.setAttribute("tabindex", isSaved ? "0" : "-1");
  }

  if (userProfileNavEdit) {
    userProfileNavEdit.classList.toggle("active", isEdit);
    userProfileNavEdit.setAttribute("aria-selected", String(isEdit));
    userProfileNavEdit.setAttribute("tabindex", isEdit ? "0" : "-1");
  }

  if (userProfileOverviewPanel) {
    userProfileOverviewPanel.hidden = !isOverview;
  }

  if (userProfileSavedPanel) {
    userProfileSavedPanel.hidden = !isSaved;
  }
}

export function setUserProfileSummaryTab(tab = "overview") {
  if (tab === "edit") {
    clearLensDirtyPrompt();
    openUserProfileEditor({ scrollToEditor: true });
    syncUserProfileSummaryTabs();
    return;
  }
  if (requestLensDirtyPrompt({ type: "tab", tab })) {
    return;
  }
  clearLensDirtyPrompt();
  state.ui.profileSummaryTab = tab === "saved" ? "saved" : "overview";
  if (state.ui.profileEditing) {
    syncUserProfileSurface({ closeEditor: true });
    return;
  }
  syncUserProfileSummaryTabs();
}

export function syncUserProfileEditorUi() {
  if (!userProfileCard) return;

  const isEditing = Boolean(state.ui.profileEditing);
  const isDirty = Boolean(state.ui.profileDirty);

  userProfileCard.hidden = !isEditing;
  userProfilePanel?.classList.toggle("is-editing", isEditing);

  if (editUserProfileButton) {
    editUserProfileButton.disabled = false;
    const triggerLabel = editUserProfileButton.querySelector(".lens-summary-trigger-label");
    if (triggerLabel) {
      triggerLabel.textContent = "Skin lens";
    }
    editUserProfileButton.setAttribute("aria-expanded", String(state.ui.lensDrawerOpen));
    editUserProfileButton.dataset.mode = isEditing ? "jump" : "open";
  }

  if (userProfileFormState) {
    userProfileFormState.dataset.state = isDirty ? "dirty" : "clean";
    userProfileFormState.textContent = isDirty ? "Unsaved" : "Draft";
  }

  if (userProfileSaveState) {
    userProfileSaveState.dataset.state = isDirty ? "dirty" : isEditing ? "draft" : "saved";
    userProfileSaveState.textContent = isDirty ? "Unsaved" : isEditing ? "Draft" : "Saved";
  }

  if (userProfileSaveNote) {
    userProfileSaveNote.textContent = isDirty
      ? "Save to update the demo lens."
      : isEditing
        ? "The demo lens stays unchanged until you save."
        : "";
  }

  if (saveUserProfileButton) {
    saveUserProfileButton.disabled = !isDirty;
  }

  if (cancelUserProfileButton) {
    cancelUserProfileButton.textContent = "Done";
  }

  if (userProfileDraftPreview) {
    const nextProfile = createUserProfileRecord(state.ui.userProfileDraft || getSavedUserProfileRecord());
    const previewTokens = [
      titleCase(nextProfile.goal),
      nextProfile.profile === "all" ? "Broad view" : getProfileLabel(nextProfile.profile),
      getBudgetLabel(nextProfile.budget),
      getSensitivityLabel(nextProfile.sensitivity),
      getActivesComfortLabel(nextProfile.activesComfort),
      ...(nextProfile.avoidIngredients.length
        ? nextProfile.avoidIngredients.slice(0, 2).map((ingredient) => `Avoiding ${titleCase(ingredient)}`)
        : []),
    ];
    userProfileDraftPreview.innerHTML = previewTokens
      .map((token) => `<span class="profile-draft-chip">${escapeHtml(token)}</span>`)
      .join("");
  }

  syncUserProfileSummaryTabs();
  syncLensEditorFooterVisibility();
  renderProfileStatus();
}

export function renderAvoidIngredientControls(profile = state.ui.profileEditing && state.ui.userProfileDraft ? state.ui.userProfileDraft : getSavedUserProfileRecord()) {
  const nextProfile = createUserProfileRecord(profile);
  avoidIngredients.innerHTML = "";
  AVOID_INGREDIENT_OPTIONS.forEach((ingredient) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `toggle-chip${nextProfile.avoidIngredients.includes(ingredient) ? " active" : ""}`;
    button.dataset.avoidIngredient = ingredient;
    button.textContent = titleCase(ingredient);
    avoidIngredients.appendChild(button);
  });
}

export function renderLensQuickPresets() {
  if (!lensQuickPresets) return;
  lensQuickPresets.innerHTML = LENS_PRESETS.map(
    (preset) => `
      <button class="lens-quick-preset" type="button" data-lens-preset="${preset.key}">
        ${escapeHtml(preset.label)}
      </button>
    `,
  ).join("");
}

export function getLensTensionWarning(profile = getSavedUserProfileRecord()) {
  const nextProfile = createUserProfileRecord(profile);
  if (nextProfile.sensitivity === "high" && nextProfile.activesComfort === "high") {
    return "Tension: high sensitivity + strong actives needs a calmer catalog bias.";
  }
  const premiumHeavyCount = state.favoriteIds
    .map((id) => getProductById(id))
    .filter(Boolean)
    .filter((product) => getShortlistStatus(product.id) !== "reject" && typeof product.price === "number" && product.price >= 80)
    .length;
  if (nextProfile.budget === "budget" && premiumHeavyCount >= 2) {
    return "Tension: tight budget + premium-heavy shortlist will likely force more waiting or cuts.";
  }
  return "";
}

export function applyLensPreset(presetKey) {
  const preset = LENS_PRESETS.find((entry) => entry.key === presetKey);
  if (!preset) return;
  enterWorkMode("catalog");
  const nextProfile = createUserProfileRecord({
    ...state.userProfile,
    ...preset.profile,
  });
  state.userProfile = {
    ...state.userProfile,
    ...nextProfile,
    goalSource: "profile",
  };
  state.profile = nextProfile.profile;
  state.routineConcern = nextProfile.goal;
  state.concern = "all";
  state.page = 1;
  persistUserProfile();
  resetRoutinePlannerCaches({ clearRestoreState: true });
  persistRoutinePlannerSession();
  syncUserProfileSurface({ closeEditor: true });
  renderFilters(state.metadata);
  setConcernChipSelection("all");
  retailerFilter.value = state.retailer;
  brandFilter.value = state.brand;
  categoryFilter.value = state.category;
  ingredientFilter.value = state.ingredient;
  sortFilter.value = state.sort;
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({
    routine: true,
    bestPicks: true,
    articles: true,
    routineDraftSync: true,
  });
}

export function syncUserProfileSurface({ closeEditor = false } = {}) {
  const savedProfile = getSavedUserProfileRecord();
  const savedProfileKey = getUserProfileRecordKey(savedProfile);

  if (closeEditor) {
    state.ui.profileEditing = false;
    state.ui.profileDirty = false;
    state.ui.userProfileDraft = null;
    state.ui.userProfileDraftBaseKey = savedProfileKey;
  } else if (state.ui.profileEditing) {
    if (!state.ui.userProfileDraft || state.ui.userProfileDraftBaseKey !== savedProfileKey) {
      state.ui.userProfileDraft = savedProfile;
      state.ui.userProfileDraftBaseKey = savedProfileKey;
      state.ui.profileDirty = false;
    }
  } else {
    state.ui.userProfileDraftBaseKey = savedProfileKey;
  }

  syncUserProfileControls();
  renderAvoidIngredientControls();
  renderLensQuickPresets();
  renderUserProfileSummary();
  renderContinuityCard();
  maybeAnimateUserProfileSurface(getCurrentProfileSignature());
}

export function scrollLensDrawerElementIntoView(element, { behavior = "auto", padding = 14 } = {}) {
  if (!lensDrawerScroll || !element) return;
  const scrollRect = lensDrawerScroll.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();
  let nextTop = lensDrawerScroll.scrollTop;

  if (targetRect.bottom > scrollRect.bottom - padding) {
    nextTop += targetRect.bottom - scrollRect.bottom + padding;
  } else if (targetRect.top < scrollRect.top + padding) {
    nextTop += targetRect.top - scrollRect.top - padding;
  } else {
    return;
  }

  lensDrawerScroll.scrollTo({ top: Math.max(0, nextTop), behavior });
}

export function scrollToUserProfileEditor() {
  requestAnimationFrame(() => {
    if (lensDrawerScroll && userProfileCard) {
      const stickyTabOffset = userSummaryCard ? userSummaryCard.getBoundingClientRect().height + 8 : 8;
      const scrollTop = lensDrawerScroll.scrollTop + userProfileCard.getBoundingClientRect().top - lensDrawerScroll.getBoundingClientRect().top - stickyTabOffset;
      lensDrawerScroll.scrollTo({ top: Math.max(0, scrollTop), behavior: "auto" });
    } else {
      userProfileCard?.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
    userSkinProfileSelect?.focus({ preventScroll: true });
  });
}

export function openUserProfileEditor({ scrollToEditor = false, trigger = editUserProfileButton } = {}) {
  const savedProfile = getSavedUserProfileRecord();
  openLensDrawer(trigger);
  clearLensDirtyPrompt();
  state.ui.profileEditing = true;
  state.ui.profileDirty = false;
  state.ui.userProfileDraft = savedProfile;
  state.ui.userProfileDraftBaseKey = getUserProfileRecordKey(savedProfile);
  syncUserProfileControls(savedProfile);
  renderAvoidIngredientControls(savedProfile);
  syncUserProfileEditorUi();
  if (scrollToEditor) {
    scrollToUserProfileEditor();
  }
}

export function jumpToUserProfileEditor() {
  if (!state.ui.lensDrawerOpen) {
    openLensDrawer(editUserProfileButton);
  }
  if (!state.ui.profileEditing) {
    openUserProfileEditor({ scrollToEditor: true });
    return;
  }
  scrollToUserProfileEditor();
}

export function updateUserProfileDraft(updater, { syncControls = false } = {}) {
  if (!state.ui.profileEditing) return;
  const currentDraft = createUserProfileRecord(state.ui.userProfileDraft || getSavedUserProfileRecord());
  const nextDraft = createUserProfileRecord(typeof updater === "function" ? updater(currentDraft) : { ...currentDraft, ...updater });
  state.ui.userProfileDraft = nextDraft;
  state.ui.profileDirty = getUserProfileRecordKey(nextDraft) !== state.ui.userProfileDraftBaseKey;
  if (syncControls) {
    syncUserProfileControls(nextDraft);
  }
  renderAvoidIngredientControls(nextDraft);
  syncUserProfileEditorUi();
}

export function renderUserProfileSummary() {
  const savedProfile = getSavedUserProfileRecord();
  const name = savedProfile.name.trim();
  const currentProfileSignature = getCurrentProfileSignature();
  const activeSavedProfile = state.savedProfiles.find((entry) => isSavedProfileEntryActive(entry)) || null;
  const profileLabel = getProfileLabel(savedProfile.profile);
  const goalLabel = getVisibleLensGoalLabel(savedProfile);
  const defaultGoalPlaceholder = isDefaultCatalogLensGoal(savedProfile);
  const budgetLabel = getBudgetLabel(savedProfile.budget);
  const activesLabel = getActivesComfortLabel(savedProfile.activesComfort);
  const laneLabel = getActiveBrowseLane()?.label || "";
  const shoppingContext = laneLabel ? `Shopping ${laneLabel}` : "Shopping the full catalog";
  const updatedLabel = state.userProfile.updatedAt ? formatFreshness(state.userProfile.updatedAt).replace(/^Updated /, "") : "Saved recently";
  const avoidIngredientsSummary = savedProfile.avoidIngredients.length
    ? formatList(savedProfile.avoidIngredients.slice(0, 2).map((ingredient) => titleCase(ingredient)))
    : "None set";

  if (userSummaryTitle) {
    userSummaryTitle.textContent = name || "Current setup";
  }

  if (userProfileNavSaved) {
    userProfileNavSaved.textContent = state.savedProfiles.length ? `Saved (${state.savedProfiles.length})` : "Saved";
  }

  if (userSummaryMeta) {
    userSummaryMeta.textContent = activeSavedProfile
      ? `${activeSavedProfile.label} · ${updatedLabel}`
      : `${savedProfile.profile === "all" ? "Custom lens" : profileLabel} · ${updatedLabel}`;
  }

  if (userProfileAvatar) {
    const avatar = getUserProfileAvatarConfig(savedProfile);
    userProfileAvatar.textContent = avatar.initials;
    userProfileAvatar.dataset.tone = avatar.tone;
  }

  if (userSummaryContext) {
    userSummaryContext.textContent = shoppingContext;
  }

  if (userSummaryPriority) {
    userSummaryPriority.textContent = goalLabel;
  }

  userSummaryCopy.textContent = defaultGoalPlaceholder
    ? `Broad catalog view. ${budgetLabel}.`
    : savedProfile.profile === "all"
      ? `${goalLabel} first. ${budgetLabel}.`
      : `${profileLabel} tuned for ${goalLabel.toLowerCase()} first. ${budgetLabel}.`;

  if (userProfileActivityState) {
    userProfileActivityState.textContent = activeSavedProfile ? "Saved demo lens" : "Custom demo lens";
  }

  if (userProfileActivityMeta) {
    userProfileActivityMeta.textContent = activeSavedProfile
      ? `${activeSavedProfile.label} · ${updatedLabel}`
      : `${shoppingContext} · ${updatedLabel}`;
  }

  if (userProfileSummaryRows) {
    const summaryRows = [
      {
        label: "Goal",
        value: goalLabel,
      },
      {
        label: "Skin",
        value: savedProfile.profile === "all" ? "Broad view" : profileLabel,
      },
      {
        label: "Sensitivity",
        value: getSensitivityLabel(savedProfile.sensitivity),
      },
      {
        label: "Actives",
        value: activesLabel,
      },
      {
        label: "Budget",
        value: budgetLabel,
      },
      {
        label: "Avoid",
        value: avoidIngredientsSummary,
      },
    ];
    userProfileSummaryRows.innerHTML = summaryRows
      .map(
        (row) => `
          <div class="profile-summary-row">
            <span class="profile-summary-row-label">${row.label}</span>
            <strong class="profile-summary-row-value">${escapeHtml(row.value)}</strong>
          </div>
        `,
      )
      .join("");
  }

  if (userProfileImpactInline) {
    userProfileImpactInline.textContent = `Affects ranking, retailer call, shortlist reasoning, and ${state.routineTime.toUpperCase()} routine planning.`;
  }

  if (lensImpactRow) {
    lensImpactRow.innerHTML = [
      "Ranks catalog",
      state.userProfile.sensitivity === "high" ? "High caution" : "Balanced caution",
      state.userProfile.activesComfort === "low" ? "Gentle routine" : state.userProfile.activesComfort === "high" ? "Stronger routine" : "Balanced routine",
    ]
      .map((item) => `<span>${escapeHtml(item)}</span>`)
      .join("");
  }

  if (lensTensionWarning) {
    const warning = getLensTensionWarning(savedProfile);
    lensTensionWarning.hidden = !warning;
    lensTensionWarning.textContent = warning;
  }

  if (userProfileQuickSwitches) {
    const quickEntries = state.savedProfiles.slice(0, 3);
    if (!quickEntries.length) {
      userProfileQuickSwitches.innerHTML = `<span class="profile-quick-empty">Save a setup once and it shows up here for one-tap switching.</span>`;
    } else {
      userProfileQuickSwitches.innerHTML = quickEntries
        .map((entry) => {
          const isActive = isSavedProfileEntryActive(entry);
          const avatar = getSavedProfileAvatarConfig(entry);
          const shortcutFilters = createSavedProfileFilters(entry.filters);
          const shortcutGoal = titleCase(shortcutFilters.goal || shortcutFilters.concern || "General care");
          const shortcutProfile = shortcutFilters.profile !== "all" ? getProfileLabel(shortcutFilters.profile) : "Broad view";
          const shortcutFreshness = formatFreshness(entry.savedAt).replace(/^Updated /, "");
          return `
            <button class="profile-quick-switch${isActive ? " active" : ""}" type="button" data-profile-shortcut-id="${escapeHtml(entry.id)}">
              <span class="profile-quick-avatar" data-tone="${avatar.tone}">${escapeHtml(avatar.initials)}</span>
              <span class="profile-quick-switch-copy">
                <strong>${escapeHtml(entry.label || "Saved setup")}</strong>
                <small>${escapeHtml(shortcutGoal)} · ${escapeHtml(shortcutProfile)} · ${escapeHtml(shortcutFreshness)}</small>
              </span>
              <span class="profile-quick-switch-badge">${isActive ? "Active" : "Use"}</span>
            </button>
          `;
        })
        .join("");
    }
  }

  syncUserProfileSummaryTabs();
  syncUserProfileEditorUi();
}

export function saveUserProfile({ closeDrawer = true, afterSaveTarget = null } = {}) {
  enterWorkMode();
  const nextProfile = createUserProfileRecord(state.ui.userProfileDraft || getSavedUserProfileRecord());
  state.userProfile.name = nextProfile.name;
  state.userProfile.budget = nextProfile.budget;
  state.userProfile.sensitivity = nextProfile.sensitivity;
  state.userProfile.activesComfort = nextProfile.activesComfort;
  state.userProfile.goal = nextProfile.goal;
  state.userProfile.goalSource = "profile";
  state.userProfile.profile = nextProfile.profile;
  state.userProfile.avoidIngredients = [...nextProfile.avoidIngredients];
  state.profile = nextProfile.profile;
  state.routineConcern = nextProfile.goal;
  state.concern = "all";

  profileFilter.value = state.profile;
  routineConcern.value = state.routineConcern;
  state.page = 1;
  persistUserProfile();
  renderFilters(state.metadata);
  setConcernChipSelection("all");
  retailerFilter.value = state.retailer;
  brandFilter.value = state.brand;
  categoryFilter.value = state.category;
  ingredientFilter.value = state.ingredient;
  sortFilter.value = state.sort;
  state.ui.profileSummaryTab = "overview";
  clearLensDirtyPrompt();
  syncUserProfileSurface({ closeEditor: true });
  if (closeDrawer) {
    closeLensDrawer({ restoreFocus: false, force: true });
  } else if (afterSaveTarget) {
    applyLensPromptTarget(afterSaveTarget, { restoreFocus: false });
  }
  renderProducts();
  resetRoutinePlannerCaches({ clearRestoreState: true });
  persistRoutinePlannerSession();
  state.userProfile.goalSource = "profile";
  persistUserProfile({ preserveUpdatedAt: true });
  scheduleCatalogSecondarySurfaceRefresh({
    routine: true,
    bestPicks: true,
    articles: true,
    routineDraftSync: true,
  });
}

export function resetUserProfile() {
  if (!state.ui.profileEditing) {
    openUserProfileEditor();
  }
  updateUserProfileDraft(createDefaultUserProfile(), { syncControls: true });
}

export function renderFreshnessBar() {
  if (!freshnessBar) return;
  freshnessBar.hidden = true;
  freshnessBar.innerHTML = "";
  renderProfileStatus();
}

export function renderAffiliateDisclosure() {
  if (!affiliateNote) return;
  const enabledRetailers = Object.keys(AFFILIATE_CONFIG.retailers).filter(hasAffiliateEnabled);
  if (!enabledRetailers.length) {
    affiliateNote.textContent = "Synthetic demo links are inert; no affiliate tracking is active.";
    return;
  }
  affiliateNote.textContent = `Affiliate links active: ${enabledRetailers.join(", ")}. ${AFFILIATE_CONFIG.disclosure}`;
}

export function renderMetrics(container, entries) {
  container.innerHTML = "";
  const maxValue = Math.max(...entries.map((entry) => entry.value), 1);

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "metric-row";
    row.innerHTML = `
      <div class="metric-label">
        <span>${entry.label}</span>
        <strong>${entry.value}</strong>
      </div>
      <div class="metric-bar">
        <span style="width: ${(entry.value / maxValue) * 100}%"></span>
      </div>
    `;
    container.appendChild(row);
  });
}

export function setConcern(concern) {
  enterWorkMode();
  state.concern = concern;
  state.page = 1;
  setConcernChipSelection(concern);
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({ bestPicks: true });
}

export function renderPagination(totalItems) {
  paginationBar.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));
  state.page = Math.min(state.page, totalPages);

  if (totalItems <= state.pageSize) {
    return;
  }

  const start = (state.page - 1) * state.pageSize + 1;
  const end = Math.min(state.page * state.pageSize, totalItems);

  const prev = document.createElement("button");
  prev.className = "page-button";
  prev.type = "button";
  prev.textContent = "Previous";
  prev.disabled = state.page === 1;
  prev.addEventListener("click", () => {
    state.page -= 1;
    renderProducts();
    paginationBar.scrollIntoView({ behavior: getMotionSafeScrollBehavior(), block: "nearest" });
  });

  const info = document.createElement("div");
  info.className = "page-info";
  info.textContent = `${start}-${end} of ${totalItems} products`;

  const next = document.createElement("button");
  next.className = "page-button";
  next.type = "button";
  next.textContent = "Next";
  next.disabled = state.page === totalPages;
  next.addEventListener("click", () => {
    state.page += 1;
    renderProducts();
    paginationBar.scrollIntoView({ behavior: getMotionSafeScrollBehavior(), block: "nearest" });
  });

  paginationBar.append(prev, info, next);
}

export function getFilterMetadata(metadata) {
  const fallbackConcerns = [
    state.routineConcern,
    state.userProfile.goal,
    "dryness",
    "acne",
    "redness",
    "texture",
    "dark spots",
    "wrinkles",
    "general care",
  ].filter((concern, index, list) => typeof concern === "string" && concern.trim() && list.indexOf(concern) === index);

  return {
    retailers: Array.isArray(metadata?.retailers) ? metadata.retailers : [],
    categories: Array.isArray(metadata?.categories) ? metadata.categories : [],
    concerns: Array.isArray(metadata?.concerns) && metadata.concerns.length ? metadata.concerns : fallbackConcerns,
  };
}

export function renderFilters(metadata) {
  const filterMetadata = getFilterMetadata(metadata);

  profileFilter.innerHTML = "";
  userSkinProfileSelect.innerHTML = "";
  retailerFilter.innerHTML = '<option value="all">All retailers</option>';
  brandFilter.innerHTML = '<option value="all">All brands</option>';
  categoryFilter.innerHTML = '<option value="all">All categories</option>';
  ingredientFilter.innerHTML = '<option value="all">All ingredients</option>';
  concernChips.innerHTML = "";
  quickConcerns.innerHTML = "";

  Object.entries(SKIN_PROFILES).forEach(([value, profile]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = profile.label;
    profileFilter.appendChild(option);
    userSkinProfileSelect.appendChild(option.cloneNode(true));
  });

  filterMetadata.retailers.forEach((retailer) => {
    const option = document.createElement("option");
    option.value = retailer;
    option.textContent = retailer;
    retailerFilter.appendChild(option);
  });

  const brandCounts = state.products.reduce((counts, product) => {
    counts[product.brand] = (counts[product.brand] || 0) + 1;
    return counts;
  }, {});
  const brands = Object.keys(brandCounts).sort((a, b) => a.localeCompare(b));
  const suggestions = getBrandQuickPickEntries().slice(0, 3).map((entry) => entry.brand);
  const suggestedSet = new Set(suggestions);
  if (suggestions.length) {
    const suggestedGroup = document.createElement("optgroup");
    suggestedGroup.label = "Suggested now";
    suggestions.forEach((brand) => {
      const option = document.createElement("option");
      option.value = brand;
      option.textContent = `${brand} (${brandCounts[brand]})`;
      suggestedGroup.appendChild(option);
    });
    brandFilter.appendChild(suggestedGroup);
  }
  const allBrandsGroup = document.createElement("optgroup");
  allBrandsGroup.label = suggestions.length ? "All brands" : "Brands";
  brands.forEach((brand) => {
    if (suggestedSet.has(brand)) return;
    const option = document.createElement("option");
    option.value = brand;
    option.textContent = `${brand} (${brandCounts[brand]})`;
    allBrandsGroup.appendChild(option);
  });
  brandFilter.appendChild(allBrandsGroup);

  filterMetadata.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = titleCase(category);
    categoryFilter.appendChild(option);
  });

  const ingredients = [...new Set(state.products.flatMap((product) => product.ingredients))].sort();
  ingredients.forEach((ingredient) => {
    const option = document.createElement("option");
    option.value = ingredient;
    option.textContent = titleCase(ingredient);
    ingredientFilter.appendChild(option);
  });

  routineConcern.innerHTML = filterMetadata.concerns
    .filter((concern) => concern !== "general care")
    .map(
      (concern) => `<option value="${concern}"${concern === state.routineConcern ? " selected" : ""}>${titleCase(
        concern,
      )}</option>`,
    )
    .join("");

  userGoalSelect.innerHTML = filterMetadata.concerns
    .filter((concern) => concern !== "general care")
    .map(
      (concern) => `<option value="${concern}"${concern === state.userProfile.goal ? " selected" : ""}>${titleCase(
        concern,
      )}</option>`,
    )
    .join("");

  const activeConcern = filterMetadata.concerns.includes(state.concern) ? state.concern : "all";

  const allChip = document.createElement("button");
  allChip.className = `chip${activeConcern === "all" ? " active" : ""}`;
  allChip.type = "button";
  allChip.textContent = "All concerns";
  allChip.dataset.concern = "all";
  allChip.setAttribute("aria-pressed", String(activeConcern === "all"));
  concernChips.appendChild(allChip);

  filterMetadata.concerns.forEach((concern) => {
    const chip = document.createElement("button");
    chip.className = `chip${concern === activeConcern ? " active" : ""}`;
    chip.type = "button";
    chip.textContent = titleCase(concern);
    chip.dataset.concern = concern;
    chip.setAttribute("aria-pressed", String(concern === activeConcern));
    concernChips.appendChild(chip);
  });

  ["acne", "dryness", "redness", "texture", "dark spots", "wrinkles"].forEach((concern) => {
    if (!filterMetadata.concerns.includes(concern)) return;
    const button = document.createElement("button");
    button.className = "quick-pill";
    button.dataset.concern = concern;
    button.textContent = titleCase(concern);
    quickConcerns.appendChild(button);
  });

  syncOverviewCaseControls();
  syncCatalogFilterDisclosure();
  renderBrowseLanes();
}

export function browseLaneMatchesProduct(product, lane) {
  if (!product || !lane) return false;
  const lowerIngredients = getProductIngredientSet(product);
  const matchesStandardLane =
    (!lane.concern || product.concerns.includes(lane.concern)) &&
    (!lane.concernsAny || lane.concernsAny.some((concern) => product.concerns.includes(concern))) &&
    (!lane.category || product.category === lane.category) &&
    (!lane.categoryAny || lane.categoryAny.includes(product.category)) &&
    (!lane.ingredient || lowerIngredients.has(lane.ingredient)) &&
    (!lane.ingredientsAny || lane.ingredientsAny.some((ingredient) => lowerIngredients.has(ingredient))) &&
    (lane.maxPrice == null || (typeof product.price === "number" && product.price <= lane.maxPrice)) &&
    (lane.minRating == null || (typeof product.rating === "number" && product.rating >= lane.minRating)) &&
    (lane.minReviews == null || (typeof product.reviewCount === "number" && product.reviewCount >= lane.minReviews)) &&
    (!lane.sensitiveSafe || isSensitiveSafeProduct(product));
  return matchesStandardLane || browseLaneMatchesDarkSpotSupportProduct(product, lane, lowerIngredients);
}

export function isBrowseLaneActive(lane) {
  return state.browseLaneKey === lane.key;
}

const MOBILE_BROWSE_LANE_LABELS = {
  bestsellers: "Best first",
  "under-50": "Under $50",
  "barrier-repair": "Barrier",
  "best-acne-picks": "Acne-safe",
  "dark-spot-picks": "Dark spots",
  "daily-spf": "Daily SPF",
  "vitamin-c": "Vitamin C",
  "sensitive-skin-safe": "Sensitive",
};

function getBrowseLaneMobileLabel(lane) {
  if (!lane) return "";
  return MOBILE_BROWSE_LANE_LABELS[lane.key] || lane.label || "Focus";
}

function getActiveCatalogFocusDescriptor() {
  const activeLane = getActiveBrowseLane();
  if (activeLane) {
    return {
      key: "browse-lane",
      label: activeLane.label,
      mobileLabel: getBrowseLaneMobileLabel(activeLane),
    };
  }
  if (state.concern !== "all") return { key: "concern", label: titleCase(state.concern) };
  if (state.category !== "all") return { key: "category", label: titleCase(state.category) };
  if (state.ingredient !== "all") return { key: "ingredient", label: titleCase(state.ingredient) };
  if (String(state.search || "").trim()) return { key: "search", label: `Search · ${String(state.search || "").trim()}` };
  if (state.retailer !== "all") return { key: "retailer", label: state.retailer };
  if (state.brand !== "all") return { key: "brand", label: state.brand };
  if (state.profile !== "all") return { key: "profile", label: getProfileLabel() };
  return null;
}

export function renderHeroMerchGrid() {
  // Overview launchers are now explicit shell-entry paths in static markup.
}

export function renderBrowseLanes() {
  if (!browseLanes) return;
  browseLanes.innerHTML = "";
  const retailerScope = state.retailer === "all" ? "Cross-store" : state.retailer;

  BROWSE_LANES.forEach((lane) => {
    const matchCount = getBrowseLaneScopeProducts(lane).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `browse-lane browse-lane-${lane.tone || "neutral"}`;
    button.dataset.laneKey = lane.key;
    button.classList.toggle("active", isBrowseLaneActive(lane));
    button.setAttribute("aria-label", `${lane.label}: ${lane.description}`);
    button.innerHTML = `
      <span class="browse-lane-eyebrow">${escapeHtml(retailerScope)} · ${matchCount.toLocaleString()} picks</span>
      <strong data-mobile-label="${escapeHtml(getBrowseLaneMobileLabel(lane))}">${escapeHtml(lane.label)}</strong>
      <span>${escapeHtml(lane.description)}</span>
    `;
    browseLanes.appendChild(button);
  });
  syncCatalogFocusRailDisclosure();
}

export function applyBrowseLane(laneKey) {
  const lane = BROWSE_LANES.find((entry) => entry.key === laneKey);
  if (!lane) return;

  enterWorkMode();
  state.ui.catalogFocusRailOpen = false;
  state.ui.secondaryFiltersOpen = false;
  state.browseLaneKey = lane.key;
  state.concern = "all";
  state.category = "all";
  state.ingredient = "all";
  state.search = "";
  state.brand = "all";
  state.sort = lane.sort || "relevance";
  state.page = 1;

  categoryFilter.value = state.category;
  ingredientFilter.value = state.ingredient;
  brandFilter.value = state.brand;
  sortFilter.value = state.sort;
  searchInput.value = state.search;
  setConcernChipSelection("all");
  persistUiSessionState();

  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({ bestPicks: true });
}

export function filterOverviewBaseProducts(products = state.products) {
  return products.filter((product) => {
    const retailerMatch = state.retailer === "all" || product.retailer === state.retailer;
    const brandMatch = state.brand === "all" || product.brand === state.brand;
    return retailerMatch && brandMatch && matchesSearch(product, state.search);
  });
}

export function normalizeOverviewScopeText(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

export function isOverviewBroadPath(value = "") {
  const normalized = normalizeOverviewScopeText(value);
  return !normalized || normalized === "broadscan" || normalized === "broadcatalog";
}

export function getOverviewCurrentCasePath() {
  const activeLane = getActiveBrowseLane();
  const searchText = String(state.search || "").trim();
  if (activeLane?.label) return activeLane.label;
  if (state.concern !== "all") return `${titleCase(state.concern)} case`;
  if (state.ingredient !== "all") return `${titleCase(state.ingredient)} focus`;
  if (state.category !== "all") return `${titleCase(state.category)} view`;
  if (searchText) return `Search · ${searchText}`;
  if (state.retailer !== "all") return `${state.retailer} view`;
  return "Broad catalog";
}

export function getOverviewCaseDisplayTitle(snapshot = null) {
  const path = snapshot?.case?.path || getOverviewCurrentCasePath();
  if (!isOverviewBroadPath(path)) return path;
  return "Broad catalog";
}

export function buildOverviewScopeIdentity({ filtered = null, requestKey = buildOverviewQuery().toString() } = {}) {
  const currentFiltered = Array.isArray(filtered) ? filtered : filterProducts();
  const currentPath = getOverviewCurrentCasePath();
  const currentGoal = titleCase(state.userProfile.goal || state.routineConcern || "general care");
  const filteredSignature = currentFiltered
    .slice(0, 12)
    .map((product) => product?.id)
    .filter(Boolean)
    .join("|");
  const values = {
    requestKey,
    retailer: state.retailer || "all",
    brand: state.brand || "all",
    category: state.category || "all",
    concern: state.concern || "all",
    ingredient: state.ingredient || "all",
    search: String(state.search || "").trim(),
    sort: state.sort || "relevance",
    browseLane: state.browseLaneKey || "",
    goal: state.userProfile.goal || state.routineConcern || "general care",
    budget: state.userProfile.budget || "any",
    profile: state.profile || "all",
    sensitivity: state.userProfile.sensitivity || "moderate",
    activesComfort: state.userProfile.activesComfort || "medium",
    routineTime: state.routineTime || "am",
    avoidIngredients: [...(state.userProfile.avoidIngredients || [])].filter(Boolean).sort().join("|"),
    favoriteIds: [...state.favoriteIds].filter(Boolean).sort().join("|"),
    path: normalizeOverviewScopeText(currentPath),
    filteredCount: currentFiltered.length,
    filteredSignature,
  };
  return {
    key: JSON.stringify(values),
    requestKey,
    filteredCount: currentFiltered.length,
    filteredSignature,
    case: {
      goal: currentGoal,
      retailer: state.retailer === "all" ? "All retailers" : state.retailer,
      path: currentPath,
      routineTime: state.routineTime.toUpperCase(),
    },
    values,
  };
}

export function resolveOverviewConcernTarget(products = state.products) {
  const goal = state.userProfile.goal || state.routineConcern || "general care";
  if (goal !== "all" && products.some((product) => product.concerns.includes(goal))) {
    return goal;
  }
  return OVERVIEW_LAUNCHER_CONCERN_PRIORITY.find((concern) =>
    products.some((product) => product.concerns.includes(concern)),
  ) || "general care";
}

export function resolveOverviewIngredientTarget(products = state.products) {
  const goal = state.userProfile.goal || resolveOverviewConcernTarget(products);
  const ingredient =
    OVERVIEW_LAUNCHER_INGREDIENT_MAP[goal] ||
    OVERVIEW_LAUNCHER_INGREDIENT_MAP[resolveOverviewConcernTarget(products)] ||
    "ceramides";
  const available = products.some((product) => product.ingredients.includes(ingredient));
  return {
    ingredient,
    available,
  };
}

export function scoreSaferBeginner(product) {
  const warnings = getProductConflictWarnings(product, { routineTime: state.routineTime });
  let score = scoreBestOverall(product);
  if (["cleanser", "moisturizer", "sunscreen", "serum"].includes(product.category)) score += 2;
  if (isSensitiveSafeProduct(product)) score += 3.5;
  if (!product.ingredients.some((ingredient) => STRONG_ACTIVE_INGREDIENTS.includes(ingredient))) score += 2;
  score -= warnings.length * 4;
  score += sensitivityBoost(product) * 1.4;
  score += activesComfortBoost(product) * 0.75;
  return score;
}

export function pickOverviewDistinctProduct(products, scorer, excludedIds = []) {
  const excluded = new Set(excludedIds.filter(Boolean));
  return products
    .filter((product) => product.url && !excluded.has(product.id))
    .map((product) => ({ product, score: scorer(product) }))
    .sort((a, b) => b.score - a.score || (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER))[0]?.product || null;
}

export function getOverviewOverlapSummary(products) {
  const groups = new Map();
  products.forEach((product) => {
    const comparisonKey = getComparableProductKey(product);
    if (!comparisonKey) return;
    const categoryGroup = getRetailerEquivalentCategoryGroup(product);
    const variantKind = getRetailerEquivalentVariantKind(product);
    const variantBucket = ["kit", "refill"].includes(variantKind)
      ? variantKind
      : "flexible";
    const identityKey = `${comparisonKey}::${categoryGroup}::${variantBucket}`;
    if (!groups.has(identityKey)) {
      groups.set(identityKey, { offers: 0, retailers: new Set() });
    }
    const entry = groups.get(identityKey);
    entry.offers += 1;
    if (product.retailer) entry.retailers.add(product.retailer);
  });
  const exactGroups = [...groups.values()].filter((entry) => entry.retailers.size > 1);
  const offerCount = exactGroups.reduce((total, entry) => total + entry.offers, 0);
  const confidenceLabel =
    exactGroups.length >= 6
      ? "High exact-retailer support"
      : exactGroups.length >= 2
        ? "Exact overlap available"
        : exactGroups.length === 1
          ? "Limited exact overlap"
          : "No exact overlap in view";
  return {
    groupCount: exactGroups.length,
    offerCount,
    confidenceLabel,
  };
}

export function getOverviewRetailerConfidenceCopy(overlapSummary, hasRunnerUp = true) {
  const groupCount = Number(overlapSummary?.groupCount || 0);
  const offerCount = Number(overlapSummary?.offerCount || 0);
  if (groupCount >= 6) {
    return {
      label: "Strong exact-retailer support",
      copy: `${groupCount} exact same-product groups and ${offerCount} offers support this retailer read.`,
      tone: "strong",
    };
  }
  if (groupCount >= 2) {
    return {
      label: "Exact overlap available",
      copy: `${groupCount} exact same-product groups support the read, but confirm the winning product in Catalog before locking a store.`,
      tone: "moderate",
    };
  }
  if (groupCount === 1) {
    return {
      label: "Thin exact overlap",
      copy: "Only one exact same-product retailer group is visible, so the winner is a directional store read.",
      tone: "thin",
    };
  }
  return {
    label: hasRunnerUp ? "Directional retailer read" : "Single-retailer slice",
    copy: hasRunnerUp
      ? "No exact same-product overlap is visible, so this compares fit, value, and synthetic review depth rather than a confirmed same-product graph."
      : "Only one retailer is active in this case, so there is no cross-store confidence read yet.",
    tone: "directional",
  };
}

export function getOverviewRetailerScore(entry, snapshot) {
  if (!entry) return -1;
  let score = 0;
  if (entry.retailer === snapshot.concernLeader) score += 4;
  if (entry.retailer === snapshot.valueLeader) score += 3;
  if (entry.retailer === snapshot.ratedLeader) score += 2;
  if (entry.retailer === snapshot.selectionLeader) score += 2;
  score += entry.count / 25;
  score += (entry.ratedProducts?.length || 0) / 20;
  if (entry.avgPrice != null) score += Math.max(0, 40 - entry.avgPrice) / 40;
  return score;
}

export function buildOverviewRetailerEntry(entry, snapshot) {
  if (!entry) return null;
  const concernDepth =
    state.concern !== "all" ? entry.products.filter((product) => product.concerns.includes(state.concern)).length : 0;
  const tradeoffs = [];
  if (snapshot.minAveragePrice != null && entry.avgPrice != null && entry.avgPrice > snapshot.minAveragePrice + 8) {
    tradeoffs.push("higher spend");
  }
  if (snapshot.maxCount > entry.count && snapshot.maxCount - entry.count >= 3) {
    tradeoffs.push("narrower fixture field");
  }
  if (snapshot.maxRatedCount > entry.ratedProducts.length && snapshot.maxRatedCount - entry.ratedProducts.length >= 2) {
    tradeoffs.push("lighter review coverage");
  }
  if (state.concern !== "all" && snapshot.maxConcernCount > concernDepth && snapshot.maxConcernCount - concernDepth >= 2) {
    tradeoffs.push(`less ${titleCase(state.concern).toLowerCase()} depth`);
  }
  let reason = "";
  if (entry.retailer === snapshot.concernLeader && state.concern !== "all") {
    reason = `${entry.retailer} is leading on ${titleCase(state.concern).toLowerCase()} depth with ${concernDepth} products in the current case.`;
  } else if (entry.retailer === snapshot.valueLeader && entry.avgPrice != null) {
    reason = `${entry.retailer} is leading on average visible value at ${money(entry.avgPrice)}.`;
  } else if (entry.retailer === snapshot.ratedLeader && entry.ratedProducts.length) {
    reason = `${entry.retailer} has the strongest synthetic review depth in the current fixture with ${entry.ratedProducts.length} rated fictional products.`;
  } else if (entry.retailer === snapshot.selectionLeader) {
    reason = `${entry.retailer} has the broadest fixture scope with ${entry.count} fictional products.`;
  } else {
    reason = `${entry.retailer} has ${entry.count} fictional products in the current case; no qualitative retailer position is inferred.`;
  }
  return {
    retailer: entry.retailer,
    count: entry.count,
    avgPrice: entry.avgPrice,
    ratedCount: entry.ratedProducts.length,
    topCategory: titleCase(entry.topCategory || "treatment"),
    reason,
    tradeoff: tradeoffs[0] ? `Watch for ${tradeoffs[0]}.` : getRetailerSignature(entry.retailer).caution,
    signature: getRetailerSignature(entry.retailer),
    score: getOverviewRetailerScore(entry, snapshot),
  };
}

export function getOverviewTemplateResolvedConfig(template, products = state.products) {
  if (template.key !== "one-active-only") return { ...template };
  const goal = ACTIVE_LED_CONCERNS.includes(state.userProfile.goal) ? state.userProfile.goal : resolveOverviewConcernTarget(products);
  return {
    ...template,
    concern: goal,
    goal,
    category: "treatment",
  };
}

export function getOverviewTemplateProducts(template, products = state.products) {
  const config = getOverviewTemplateResolvedConfig(template, products);
  return filterOverviewBaseProducts(products).filter((product) => {
    if (config.concern && config.concern !== "all" && !product.concerns.includes(config.concern)) return false;
    if (config.category && config.category !== "all" && product.category !== config.category) return false;
    if (config.ingredient && config.ingredient !== "all" && !product.ingredients.includes(config.ingredient)) return false;
    if (config.key === "one-active-only" && getStrongActiveCount(product) > 1) return false;
    return Boolean(product.url);
  });
}

export function getOverviewTemplateEntries(products = state.products) {
  return OVERVIEW_TEMPLATE_CONFIG.map((template) => {
    const resolved = getOverviewTemplateResolvedConfig(template, products);
    const matches = getOverviewTemplateProducts(resolved, products);
    const enabled = matches.length >= 6;
    return {
      ...resolved,
      count: matches.length,
      enabled,
      status: enabled ? `${matches.length.toLocaleString()} products in view` : matches.length ? `${matches.length} products; too thin to lead` : "Coverage too thin right now",
    };
  });
}

export function getOverviewCoreStepKeys(timing, concern) {
  if (timing === "am") {
    return ACTIVE_LED_CONCERNS.includes(concern)
      ? ["cleanser", "treat", "moisturize", "protect"]
      : ["cleanser", "moisturize", "protect"];
  }
  return BARRIER_FIRST_CONCERNS.includes(concern)
    ? ["cleanser", "seal"]
    : ["cleanser", "treat", "seal"];
}

export function scoreOverviewRoutineProduct(product, step, timing, concern) {
  let score = scoreBestOverall(product);
  if (isRoutineProductValidForStep(step, product)) score += 4;
  if (getOverviewCoreStepKeys(timing, concern).includes(step.key)) score += 1.5;
  if (timing === "am" && product.category === "sunscreen") score += 2;
  if (timing === "pm" && product.category === "mask") score -= 0.5;
  score -= getProductConflictWarnings(product, { routineTime: timing }).length * 2;
  return score;
}

export function buildOverviewRoutineStarter(products, timing = state.routineTime, concern = state.routineConcern || state.userProfile.goal || "general care") {
  const steps = ROUTINE_STEPS[timing] || [];
  const coreStepKeys = new Set(getOverviewCoreStepKeys(timing, concern));
  const chosen = [];

  steps.forEach((step) => {
    const candidate = products
      .filter((product) => isRoutineProductValidForStep(step, product))
      .filter(
        (product) =>
          !chosen.some(
            (entry) =>
              getRetailerEquivalentIdentityRelation(
                product,
                entry.product,
              ) === "exact",
          ),
      )
      .map((product) => ({ product, score: scoreOverviewRoutineProduct(product, step, timing, concern) }))
      .sort((a, b) => b.score - a.score || (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER))[0]?.product;
    if (!candidate) return;
    chosen.push({ step, product: candidate, core: coreStepKeys.has(step.key) });
  });

  const selectedProducts = chosen.filter((entry) => entry.core).map((entry) => entry.product);
  const coreFilled = chosen.filter((entry) => entry.core).length;
  const coreTotal = coreStepKeys.size;
  const totalPrice = selectedProducts.reduce((sum, product) => sum + (typeof product.price === "number" ? product.price : 0), 0);
  const budgetConfig = ROUTINE_BUDGETS[state.routineBudget] || ROUTINE_BUDGETS.smart;
  const primaryWarning = selectedProducts.length ? getRoutineWarnings(selectedProducts)[0] : "";
  const caution = primaryWarning || (selectedProducts.length ? "Starter set covers the core steps; keep extra actives limited." : "No routine-ready starter surfaced yet.");
  const budgetPosture =
    budgetConfig.cap == null
      ? (totalPrice ? `${money(totalPrice)} estimated starter spend.` : "Price coverage is mixed for the current starter.")
      : totalPrice <= budgetConfig.cap
        ? `${money(totalPrice)} starter fits ${budgetConfig.label.toLowerCase()}.`
        : `${money(totalPrice)} starter runs above ${budgetConfig.label.toLowerCase()}.`;
  return {
    timing,
    concern,
    coreFilled,
    coreTotal,
    ready: coreTotal > 0 && coreFilled === coreTotal,
    caution,
    budgetPosture,
  };
}

export function formatOverviewRoutineTiming(starter) {
  const total = Number(starter?.coreTotal || 0);
  const filled = Number(starter?.coreFilled || 0);
  return `${String(starter?.timing || "").toUpperCase()} ${filled}/${total || 0}`;
}

export function buildOverviewRoutineReadiness(filtered) {
  const routineConcernKey = state.routineConcern || state.userProfile.goal || "general care";
  const amStarter = buildOverviewRoutineStarter(filtered, "am", routineConcernKey);
  const pmStarter = buildOverviewRoutineStarter(filtered, "pm", routineConcernKey);
  const activeStarter = state.routineTime === "pm" ? pmStarter : amStarter;
  const otherStarter = state.routineTime === "pm" ? amStarter : pmStarter;
  const bothReady = amStarter.ready && pmStarter.ready;
  const oneReady = amStarter.ready || pmStarter.ready;
  const activeLabel = formatOverviewRoutineTiming(activeStarter);
  const otherLabel = formatOverviewRoutineTiming(otherStarter);
  const status = bothReady
    ? "AM/PM starter ready"
    : oneReady
      ? `${activeLabel} · ${otherLabel}`
      : "Starter still incomplete";
  const balanceCopy = bothReady
    ? "Both AM and PM core timings have enough coverage for a starter pass."
    : oneReady
      ? `${activeStarter.timing.toUpperCase()} may look ready, but ${otherStarter.timing.toUpperCase()} still needs stronger core coverage before the routine reads complete.`
      : "Neither timing has a complete core starter yet, so keep routine planning as a pressure test rather than a finished set.";
  return {
    status,
    copy: `${balanceCopy} Active timing watch: ${activeStarter.caution} ${activeStarter.budgetPosture}`,
    ready: bothReady,
    activeReady: activeStarter.ready,
    actionLabel: bothReady ? "Continue routine" : "Check routine gaps",
    timingSummary: [
      {
        label: "AM",
        value: `${amStarter.coreFilled}/${amStarter.coreTotal}`,
        ready: amStarter.ready,
      },
      {
        label: "PM",
        value: `${pmStarter.coreFilled}/${pmStarter.coreTotal}`,
        ready: pmStarter.ready,
      },
    ],
  };
}

export function getOverviewMatchedArticle() {
  const skincareArticles = articleCatalog.filter((article) => article.group === "skincare");
  if (!skincareArticles.length) return null;
  return [...skincareArticles]
    .sort((a, b) => scoreArticleForProfile(b) - scoreArticleForProfile(a) || a.title.localeCompare(b.title))[0] || null;
}

export function buildOverviewLearnBridge(article) {
  if (!article) {
    return {
      articleId: null,
      title: "No strong Learn match yet",
      copy: "The current case does not have a clear evidence bridge yet. Broaden the case or change the concern to surface a more useful guide.",
      actionLabel: "Open Learn",
      canShop: false,
      journeyReady: false,
      matched: false,
      matchLabel: "No guide match",
      status: "Evidence still broad",
    };
  }
  const journey = buildArticleJourney(article);
  const matched = articleMatchesCurrentGoal(article);
  return {
    articleId: article.id,
    title: article.title,
    copy: matched
      ? `${article.kicker} is the strongest evidence note for this case right now.`
      : `Best available guide right now: ${article.kicker.toLowerCase()} still supports the current case even though it is not an exact topical match.`,
    actionLabel: matched ? "Open advice" : "Open best available advice",
    canShop: Boolean(journey),
    journeyReady: Boolean(journey),
    matched,
    matchLabel: matched ? "Exact case guide" : "Useful, not exact",
    status: matched ? article.kicker : "Useful, not exact",
  };
}

export function getOverviewDecisionActionContext(filtered = filterProducts(), marketSnapshot = null) {
  const currentMarketSnapshot = marketSnapshot || getMarketViewSnapshot(filtered);
  const leadProduct = filtered.length ? getSpotlightProduct(filtered) : null;
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  return getDecisionNextActionContext({
    leadProduct,
    marketSnapshot: currentMarketSnapshot,
    shortlistPayload,
  });
}

export function buildOverviewReadiness(filtered, matchedArticle = null) {
  const statusCounts = getShortlistStatusCounts();
  const learnBridge = buildOverviewLearnBridge(matchedArticle);
  const savedProductsInView = filtered.filter((product) => state.favoriteIds.includes(product.id)).length;
  const decisionReady = isCatalogDecisionReady();
  const decisionAction = getOverviewDecisionActionContext(filtered);
  const shortlistNextStep =
    !decisionReady
      ? "Choose a product type, concern, ingredient, lane, or specific search before ranking with confidence."
      : !state.favoriteIds.length
      ? "Save the strongest current leader to start a decision set."
      : statusCounts.core + statusCounts.optional > 0
        ? "Open Shortlist and turn the champion path into a checkout path."
        : "Mark one saved product Champion and one Backup.";

  return {
    shortlist: {
      count: state.favoriteIds.length,
      statusText: `${statusCounts.core} champion · ${statusCounts.optional} backup · ${statusCounts.wait} hold`,
      copy: state.favoriteIds.length
        ? `${savedProductsInView} saved product${savedProductsInView === 1 ? "" : "s"} still sit inside the current case. ${shortlistNextStep}`
        : shortlistNextStep,
      status: !decisionReady ? "Choose focus first" : state.favoriteIds.length ? "Ready to review" : "Waiting on leader save",
      actionLabel: !decisionReady ? "Choose focus" : decisionAction.primaryLabel || "Continue decision",
      actionBadge: !decisionReady ? "Explore path" : decisionAction.badge || "Next step",
      actionTone: !decisionReady ? "build" : decisionAction.tone || "working",
      decisionAction,
    },
    routine: buildOverviewRoutineReadiness(filtered),
    learn: {
      status: learnBridge.status,
      copy: learnBridge.copy,
      articleId: learnBridge.articleId,
      canShop: learnBridge.canShop,
      journeyReady: learnBridge.journeyReady,
      actionLabel: learnBridge.actionLabel,
      title: learnBridge.title,
      matched: learnBridge.matched,
      matchLabel: learnBridge.matchLabel,
    },
  };
}

export function buildOverviewRetailerBoard(filtered, snapshot, overlapSummary) {
  if (!filtered.length || !snapshot.groups.length || !snapshot.leadingRetailer) {
    return {
      winner: null,
      runnerUp: null,
      confidenceLabel: "Retailer call not ready",
      copy: "Widen the current case before choosing a store winner.",
      canAutoFocus: false,
    };
  }

  const ordered = [...snapshot.groups]
    .map((entry) => buildOverviewRetailerEntry(entry, snapshot))
    .sort((a, b) => b.score - a.score || b.count - a.count || a.retailer.localeCompare(b.retailer));
  const winner = ordered[0] || null;
  const runnerUp = ordered[1] || null;
  const confidentGap = winner && runnerUp ? winner.score - runnerUp.score : 2;
  const confidence = getOverviewRetailerConfidenceCopy(overlapSummary, Boolean(runnerUp));
  const canAutoFocus = Boolean(winner) && confidence.tone !== "directional" && (!runnerUp || confidentGap >= 1.2);
  const copy = winner
    ? `${winner.retailer} is leading because ${winner.reason.charAt(0).toLowerCase()}${winner.reason.slice(1)}`
    : "No current retailer winner surfaced yet.";
  return {
    winner,
    runnerUp,
    confidenceLabel: confidence.label,
    confidenceTone: confidence.tone,
    copy,
    canAutoFocus,
    overlapCopy: confidence.copy,
  };
}

export function buildOverviewLaunchers(products, retailerBoard) {
  const concern = resolveOverviewConcernTarget(products);
  const concernCount = products.filter((product) => product.concerns.includes(concern)).length;
  const budgetLane = BROWSE_LANES.find((lane) => lane.key === "under-50");
  const budgetCount = budgetLane ? products.filter((product) => browseLaneMatchesProduct(product, budgetLane)).length : 0;
  const ingredientTarget = resolveOverviewIngredientTarget(products);
  const ingredientCount = ingredientTarget.available
    ? products.filter((product) => product.ingredients.includes(ingredientTarget.ingredient)).length
    : products.length;
  const retailerCount = retailerBoard?.winner
    ? products.filter((product) => product.retailer === retailerBoard.winner.retailer).length
    : 0;

  return {
    concern: {
      title: titleCase(concern),
      count: concernCount,
      scope: "pivot",
      proof: concernCount
        ? `Switch to ${titleCase(concern)} · ${concernCount.toLocaleString()} catalog matches.`
        : `Switch to ${titleCase(concern)} when you want the strongest supported concern path.`,
    },
    budget: {
      title: "Under $50",
      count: budgetCount,
      scope: "pivot",
      proof: budgetCount
        ? `Switch to Under $50 · ${budgetCount.toLocaleString()} catalog matches.`
        : "Switch to Under $50 when you want the clearest lower-spend case.",
    },
    ingredient: {
      title: titleCase(ingredientTarget.ingredient),
      count: ingredientCount,
      scope: "pivot",
      proof: ingredientTarget.available
        ? `Switch to ${titleCase(ingredientTarget.ingredient)} · ${ingredientCount.toLocaleString()} catalog matches.`
        : `Switch to ${titleCase(ingredientTarget.ingredient)} focus in Catalog so you can set the active manually.`,
    },
    retailer: {
      title: retailerBoard?.winner?.retailer || "Retailer board",
      count: retailerCount,
      scope: "pivot",
      proof: retailerBoard?.winner && retailerBoard.canAutoFocus
        ? `Switch to ${retailerBoard.winner.retailer} · ${retailerCount.toLocaleString()} catalog matches.`
        : "Use the retailer winner board before locking one store.",
    },
  };
}

export function getOverviewProductDisplayTitle(product) {
  return [product?.brand, product?.name].filter(Boolean).join(" ").replace(/\s+/g, " ").trim() || "Current product";
}

export function getOverviewDecisionContextItems(product, entry = {}) {
  const primaryConcern =
    (product.concerns || []).find((concern) => concern && concern !== "general care") ||
    product.category ||
    "general care";
  const rating = formatCompactRatingLine(product);
  const status = state.favoriteIds.includes(product.id)
    ? `Saved as ${SHORTLIST_STATUS_LABELS[getShortlistStatus(product.id)] || "saved"}`
    : "Not saved yet";
  return [
    {
      label: "Catalog fit",
      value: titleCase(primaryConcern),
    },
    {
      label: "Evidence",
      value: entry.comparisonCue || "Retailer check stays directional",
    },
    {
      label: rating ? "Review signal" : "Decision status",
      value: rating || status,
    },
  ];
}

export function getOverviewBoardProduct(entry = {}) {
  return entry?.product || entry || null;
}

export function getOverviewBoardCategory(product) {
  return String(product?.category || "").trim().toLowerCase();
}

export function getOverviewBoardRole(product) {
  const category = getOverviewBoardCategory(product);
  const step = (ROUTINE_STEPS[state.routineTime || "am"] || ROUTINE_STEPS.am || []).find((entry) => entry.categories.includes(category));
  return step?.key || category;
}

export function getOverviewBoardSharedConcerns(leader, candidate, { allowGeneralCare = false } = {}) {
  const candidateConcerns = new Set(candidate?.concerns || []);
  return [...new Set(leader?.concerns || [])].filter(
    (concern) => candidateConcerns.has(concern) && (allowGeneralCare || concern !== "general care"),
  );
}

export function getOverviewBoardSharedIngredients(leader, candidate) {
  const candidateIngredients = getProductIngredientSet(candidate);
  return [...getProductIngredientSet(leader)].filter((ingredient) => candidateIngredients.has(ingredient));
}

export function getOverviewBoardCompatibility(leader, candidate) {
  const leaderCategory = getOverviewBoardCategory(leader);
  const candidateCategory = getOverviewBoardCategory(candidate);
  const sameCategory = Boolean(leaderCategory && leaderCategory === candidateCategory);
  const serumTreatment =
    getOverviewBoardRole(leader) === getOverviewBoardRole(candidate) &&
    ["serum", "treatment"].includes(leaderCategory) &&
    ["serum", "treatment"].includes(candidateCategory) &&
    (getOverviewBoardSharedConcerns(leader, candidate).length || getOverviewBoardSharedIngredients(leader, candidate).length);
  return {
    sameCategory,
    serumTreatment,
    sameSubstituteRole: sameCategory || serumTreatment,
  };
}

export function getOverviewBoardVariantKind(product) {
  const text = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
  if (/\b(refill|refillable)\b/.test(text)) return "refill";
  if (/\b(kit|set|duo|trio|bundle|collection|edit)\b/.test(text)) return "bundle";
  if (/\b(mini|travel(?: size)?|trial|sample)\b/.test(text)) return "mini";
  return "standard";
}

export function getOverviewBoardVariantFamilyKey(product) {
  const brandKey = normalizeComparableText(product?.brand || "");
  const familyKey = normalizeCatalogVariantFamilyText(product?.name || "");
  const category = getOverviewBoardCategory(product);
  return brandKey && familyKey && category ? `${brandKey}::${familyKey}::${category}` : "";
}

export function isOverviewBoardVariant(leader, candidate) {
  if (
    getRetailerEquivalentIdentityRelation(leader, candidate) !== "family"
  ) {
    return false;
  }
  const leaderFamily = getOverviewBoardVariantFamilyKey(leader);
  const candidateFamily = getOverviewBoardVariantFamilyKey(candidate);
  const sameFamily = Boolean(leaderFamily && leaderFamily === candidateFamily);
  if (!sameFamily) return false;
  const leaderKind = getOverviewBoardVariantKind(leader);
  const candidateKind = getOverviewBoardVariantKind(candidate);
  return leaderKind !== candidateKind || leaderKind !== "standard" || candidateKind !== "standard";
}

export function isOverviewBoardRetailerCheckProduct(leader, candidate) {
  return (
    getRetailerEquivalentIdentityRelation(leader, candidate) === "exact"
  );
}

export function isOverviewBoardActiveCaseEligible(product) {
  const context = getCatalogRankingContext();
  if (!context || context.isNeutral || !context.enforcesEligibility) return false;
  const evidence = getCatalogCaseEvidence(product, context);
  return Boolean(evidence.leadEligible || evidence.supportEligible);
}

export function getOverviewBoardRisk(product) {
  const warnings = getProductConflictWarnings(product, { routineTime: state.routineTime });
  const avoidPenalty = Math.max(0, avoidIngredientPenalty(product) * -1);
  return warnings.length * 4 + getStrongActiveCount(product) * 1.8 + avoidPenalty + (isSensitiveSafeProduct(product) ? 0 : 1);
}

export function hasOverviewBoardLowerTotalPrice(leader, candidate) {
  if (typeof leader?.price !== "number" || typeof candidate?.price !== "number") return false;
  return candidate.price <= leader.price - Math.max(5, leader.price * 0.15);
}

export function getOverviewBoardRelationship(leader, candidate, intent = "safer") {
  if (!leader?.id || !candidate?.id || leader.id === candidate.id || !candidate.url) return { eligible: false };
  if (isOverviewBoardRetailerCheckProduct(leader, candidate)) return { eligible: false };
  const compatibility = getOverviewBoardCompatibility(leader, candidate);
  const isVariant = isOverviewBoardVariant(leader, candidate);
  const sharedConcerns = getOverviewBoardSharedConcerns(leader, candidate, { allowGeneralCare: compatibility.sameSubstituteRole });
  const activeCaseEligible = isOverviewBoardActiveCaseEligible(candidate);
  if (!sharedConcerns.length && !activeCaseEligible) return { eligible: false };
  const lowerTotalPrice = hasOverviewBoardLowerTotalPrice(leader, candidate);
  const riskOk = getOverviewBoardRisk(candidate) <= getOverviewBoardRisk(leader);

  if (intent === "value") {
    if (!lowerTotalPrice) return { eligible: false };
    if (compatibility.sameSubstituteRole && !isVariant) {
      return { eligible: true, label: "Value backup", shortlistStatus: "optional", backup: true, compatibility, sharedConcerns, lowerTotalPrice };
    }
    return {
      eligible: true,
      label: isVariant ? "Lower total spend" : "Lower-spend support",
      shortlistStatus: "wait",
      backup: false,
      compatibility,
      sharedConcerns,
      lowerTotalPrice,
    };
  }

  if (compatibility.sameSubstituteRole && !isVariant && riskOk) {
    return { eligible: true, label: "Safer backup", shortlistStatus: "optional", backup: true, compatibility, sharedConcerns, lowerTotalPrice };
  }
  if (!compatibility.sameSubstituteRole && riskOk) {
    return { eligible: true, label: "Routine support", shortlistStatus: "wait", backup: false, compatibility, sharedConcerns, lowerTotalPrice };
  }
  return { eligible: false };
}

export function scoreOverviewBoardCandidate(candidate, relationship, scorer) {
  let score = scorer(candidate);
  score += relationship.backup ? 80 : 20;
  if (relationship.compatibility?.sameCategory) score += 18;
  if (relationship.compatibility?.serumTreatment) score += 10;
  score += Math.min(8, (relationship.sharedConcerns || []).length * 4);
  if (relationship.lowerTotalPrice && typeof candidate.price === "number") score += Math.max(0, 8 - candidate.price / 20);
  return score;
}

export function pickOverviewBoardCandidate(products, leader, intent, excludedIds = []) {
  const excluded = new Set(excludedIds.filter(Boolean));
  const scorer = intent === "value" ? scoreBudgetOverall : scoreSaferBeginner;
  return products
    .filter((product) => product?.url && !excluded.has(product.id))
    .map((product) => {
      const relationship = getOverviewBoardRelationship(leader, product, intent);
      if (!relationship.eligible) return null;
      return { product, relationship, score: scoreOverviewBoardCandidate(product, relationship, scorer) };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (a.product.price ?? Number.MAX_SAFE_INTEGER) - (b.product.price ?? Number.MAX_SAFE_INTEGER))[0] || null;
}

export function getOverviewBoardReason(product, contextType, relationship = {}) {
  if (relationship.label === "Value backup") return "Same shopper job with a meaningfully lower known total price; unit-size value is not confirmed.";
  if (relationship.label === "Lower total spend") return "Same product family in a lower total-spend size or format; unit-size value is not confirmed.";
  if (relationship.label === "Lower-spend support") return "Supports the active case at a meaningfully lower known total price, but it is not the same routine-job substitute.";
  if (relationship.label === "Routine support") return "Supports the active case with equal or lower conflict pressure, but it complements rather than replaces the leader.";
  return explainProductChoice(product, { type: contextType }).replace(/^Why this was picked:\s*/i, "");
}

export function getOverviewBoardCaution(product, relationship = {}) {
  if (relationship.label === "Value backup") return "Treat the value read as lower total price only; confirm size and format before buying.";
  if (relationship.label === "Lower total spend") return "Lower spend can mean smaller size, refill, or bundle format. It is not a unit-value claim.";
  if (relationship.label === "Lower-spend support" || relationship.label === "Routine support") return "This supports a different routine job, so it is not a backup for the leader.";
  return getPrimaryProductCaution(product);
}

export function getOverviewBoardDisplayLabel(key, label, { decisionReady = isCatalogDecisionReady() } = {}) {
  if (decisionReady) {
    if (key === "best-first") return "Current leader";
    if (key === "safer-beginner") return "Safer backup";
    if (key === "better-value") return label || "Value pick";
    return label;
  }
  if (decisionReady) return label;
  if (key === "best-first") return "First strong pick";
  if (key === "better-value" || /value|spend/i.test(label || "")) return "Explore path";
  return "Starting point";
}

export function buildOverviewBoardEntry(key, label, product, options = {}) {
  if (!product?.id) return null;
  const decisionReady = options.decisionReady ?? isCatalogDecisionReady();
  const displayLabel = getOverviewBoardDisplayLabel(key, label, { decisionReady });
  return {
    key,
    label: displayLabel,
    decisionLabel: label,
    confidence: decisionReady ? "decision-ready" : "exploratory",
    product,
    reason: options.reason || getOverviewBoardReason(product, options.contextType || "spotlight", options.relationship || {}),
    caution: options.caution || getOverviewBoardCaution(product, options.relationship || {}),
    shortlistStatus: options.shortlistStatus || (key === "best-first" ? "core" : "optional"),
    comparisonCue: getRetailerComparison(product).some((comparison) => comparison.matchKind === "exact")
      ? "Exact retailer check available"
      : "Retailer check is closest-match only",
  };
}

export function buildOverviewBoardSummary(entries, { decisionReady = isCatalogDecisionReady() } = {}) {
  const leadTitle = getOverviewProductDisplayTitle(entries[0]?.product);
  const supportingEntries = entries.slice(1);
  if (!decisionReady) {
    if (!supportingEntries.length) {
      return `${truncateSupportText(leadTitle, 82)} is a broad starting point only. Choose a focus before saving or naming a leader.`;
    }
    return `${truncateSupportText(leadTitle, 82)} starts the broad scan with ${supportingEntries.length} exploratory comparison pick${supportingEntries.length === 1 ? "" : "s"}. Choose a focus before treating this as a decision set.`;
  }
  if (!supportingEntries.length) {
    return `${truncateSupportText(leadTitle, 82)} is still the clearest current leader. No credible same-job backup surfaced in this slice yet.`;
  }
  const backupCount = supportingEntries.filter((entry) => /backup/i.test(entry.label || "")).length;
  const supportCount = supportingEntries.length - backupCount;
  const supportCopy = [
    backupCount ? `${backupCount} same-job backup${backupCount === 1 ? "" : "s"}` : "",
    supportCount ? `${supportCount} support pick${supportCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(" and ");
  const slotCopy = entries.length >= 3
    ? ` Three proof slots are visible: ${entries.map((entry) => entry.label).join(", ")}.`
    : "";
  return `${truncateSupportText(leadTitle, 82)} is still the clearest current leader. Compare it against ${supportCopy} before you lock the decision set.${slotCopy}`;
}

export function normalizeOverviewBoardEntries(entries = []) {
  const sourceEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];
  const leadSource = sourceEntries.find((entry) => getOverviewBoardProduct(entry)?.id) || null;
  const leadProduct = getOverviewBoardProduct(leadSource);
  const decisionReady = isCatalogDecisionReady();
  if (!leadProduct?.id) return [];
  const normalized = [
    buildOverviewBoardEntry("best-first", "Current leader", leadProduct, {
      reason: leadSource?.reason,
      caution: leadSource?.caution,
      shortlistStatus: "core",
      decisionReady,
    }),
  ].filter(Boolean);
  const usedIds = new Set([leadProduct.id]);
  sourceEntries.slice(1).some((entry) => {
    const product = getOverviewBoardProduct(entry);
    if (!product?.id || usedIds.has(product.id)) return false;
    const isValue = /value|spend/i.test(entry.label || entry.key || "");
    const relationship = getOverviewBoardRelationship(leadProduct, product, isValue ? "value" : "safer");
    if (!relationship.eligible) return false;
    normalized.push(
      buildOverviewBoardEntry(isValue ? "better-value" : "safer-beginner", relationship.label, product, {
        relationship,
        contextType: isValue ? "budget-pick" : "sensitive-pick",
        shortlistStatus: relationship.shortlistStatus,
        decisionReady,
      }),
    );
    usedIds.add(product.id);
    return normalized.length >= 3;
  });
  return normalized;
}

export function buildOverviewDecisionBoard(filtered) {
  const decisionReady = isCatalogDecisionReady();
  if (!filtered.length) {
    return {
      summary: decisionReady
        ? "No clear leader yet. Widen the current case to surface a stronger leader."
        : "Choose a focus before judging product proof in the broad catalog.",
      entries: [],
    };
  }
  const bestFirst = getSpotlightProduct(filtered);
  const safer = pickOverviewBoardCandidate(filtered, bestFirst, "safer", [bestFirst?.id]);
  const saferProduct = safer?.product || null;
  const betterValue = pickOverviewBoardCandidate(filtered, bestFirst, "value", [bestFirst?.id, saferProduct?.id]);
  const valueProduct = betterValue?.product || null;
  const entries = [
    bestFirst
      ? buildOverviewBoardEntry("best-first", "Current leader", bestFirst, {
          contextType: "spotlight",
          shortlistStatus: "core",
          decisionReady,
        })
      : null,
    saferProduct
      ? buildOverviewBoardEntry("safer-beginner", safer?.relationship?.label || "Safer backup", saferProduct, {
          contextType: "sensitive-pick",
          relationship: safer?.relationship || {},
          shortlistStatus: safer?.relationship?.shortlistStatus || "optional",
          decisionReady,
        })
      : null,
    valueProduct
      ? buildOverviewBoardEntry("better-value", betterValue?.relationship?.label || "Value pick", valueProduct, {
          contextType: "budget-pick",
          relationship: betterValue?.relationship || {},
          shortlistStatus: betterValue?.relationship?.shortlistStatus || "optional",
          decisionReady,
        })
      : null,
  ].filter(Boolean);
  return {
    summary: buildOverviewBoardSummary(entries, { decisionReady }),
    entries,
  };
}

export function getOverviewShortlistReadyCount(filtered) {
  return filtered.filter(
    (product) =>
      Boolean(product.url) &&
      ["cleanser", "moisturizer", "sunscreen", "serum", "treatment"].includes(product.category) &&
      avoidIngredientPenalty(product) >= 0,
  ).length;
}

export function mergeOverviewSection(localSection, remoteSection) {
  if (!remoteSection || typeof remoteSection !== "object" || Array.isArray(remoteSection)) return localSection;
  return { ...localSection, ...remoteSection };
}

export function getOverviewRemoteClientScope(remotePayload) {
  const scope = remotePayload?._clientScope;
  return scope && typeof scope === "object" && !Array.isArray(scope) ? scope : null;
}

export function overviewRemoteCaseMatchesScope(remotePayload, scopeIdentity) {
  const clientScope = getOverviewRemoteClientScope(remotePayload);
  if (clientScope?.key && clientScope.key !== scopeIdentity.key) return false;
  if (clientScope?.requestKey && clientScope.requestKey !== scopeIdentity.requestKey) return false;
  if (clientScope?.key === scopeIdentity.key) return true;

  const remoteCase = remotePayload?.case || {};
  const localCase = scopeIdentity.case || {};
  const remoteRetailer = normalizeOverviewScopeText(remoteCase.retailer || "");
  const localRetailer = normalizeOverviewScopeText(localCase.retailer || "");
  if (remoteRetailer && localRetailer && remoteRetailer !== localRetailer) return false;

  const remoteRoutineTime = normalizeOverviewScopeText(remoteCase.routineTime || "");
  const localRoutineTime = normalizeOverviewScopeText(localCase.routineTime || "");
  if (remoteRoutineTime && localRoutineTime && remoteRoutineTime !== localRoutineTime) return false;

  const remoteGoal = normalizeOverviewScopeText(remoteCase.goal || "");
  const localGoal = normalizeOverviewScopeText(localCase.goal || "");
  if (remoteGoal && localGoal && remoteGoal !== localGoal) return false;

  const remotePath = String(remoteCase.path || "");
  const localPath = String(localCase.path || "");
  if (isOverviewBroadPath(remotePath)) {
    return isOverviewBroadPath(localPath);
  }

  const acceptedPathTokens = new Set(
    [
      localPath,
      state.browseLaneKey,
      state.concern,
      state.ingredient,
      state.category,
      state.retailer !== "all" ? state.retailer : "",
      state.search ? `Search ${state.search}` : "",
    ]
      .map(normalizeOverviewScopeText)
      .filter(Boolean),
  );
  return acceptedPathTokens.has(normalizeOverviewScopeText(remotePath));
}

export function overviewRemoteFilteredCountMatchesScope(remotePayload, scopeIdentity) {
  const remoteCount = Number(remotePayload?.summary?.filteredCount);
  return Number.isFinite(remoteCount) && remoteCount === scopeIdentity.filteredCount;
}

export function getOverviewRemoteScopeEligibility(remotePayload, scopeIdentity) {
  if (!remotePayload || typeof remotePayload !== "object" || Array.isArray(remotePayload)) {
    return {
      scoped: false,
      currentCaseProof: false,
    };
  }
  const requestMatches = state.live.overview.requestKey === scopeIdentity.requestKey;
  const storedScopeMatches =
    !state.live.overview.scopeKey ||
    state.live.overview.scopeKey === scopeIdentity.key ||
    state.live.overview.payloadScopeKey === scopeIdentity.key;
  const caseMatches = overviewRemoteCaseMatchesScope(remotePayload, scopeIdentity);
  const countMatches = overviewRemoteFilteredCountMatchesScope(remotePayload, scopeIdentity);
  const scoped = requestMatches && storedScopeMatches && caseMatches;
  return {
    scoped,
    currentCaseProof: scoped && countMatches,
  };
}

export function mergeOverviewDecisionBoard(localBoard, remoteBoard) {
  const mergedBoard = mergeOverviewSection(localBoard, remoteBoard);
  const localEntries = Array.isArray(localBoard?.entries) ? localBoard.entries.filter(Boolean) : [];
  const remoteEntries = Array.isArray(remoteBoard?.entries) ? remoteBoard.entries.filter(Boolean) : [];
  if (localEntries.length) {
    const normalizedLocalEntries = normalizeOverviewBoardEntries(localEntries);
    if (!normalizedLocalEntries.length) {
      return {
        ...mergedBoard,
        summary: localBoard.summary || mergedBoard?.summary || "",
        entries: [],
      };
    }
    return {
      ...mergedBoard,
      summary: buildOverviewBoardSummary(normalizedLocalEntries) || localBoard.summary || mergedBoard?.summary || "",
      entries: normalizedLocalEntries,
    };
  }
  if (remoteEntries.length) {
    const normalizedRemoteEntries = normalizeOverviewBoardEntries(remoteEntries);
    return {
      ...mergedBoard,
      summary: normalizedRemoteEntries.length ? buildOverviewBoardSummary(normalizedRemoteEntries) : mergedBoard?.summary || "",
      entries: normalizedRemoteEntries,
    };
  }
  return mergedBoard;
}

export function mergeOverviewReadiness(localReadiness, remoteReadiness) {
  const merged = mergeOverviewSection(localReadiness, remoteReadiness);
  const localRoutine = localReadiness?.routine || null;
  const remoteRoutine = remoteReadiness?.routine || null;
  const remoteHasTwoTimingSummary =
    Array.isArray(remoteRoutine?.timingSummary) &&
    remoteRoutine.timingSummary.some((entry) => entry?.label === "AM") &&
    remoteRoutine.timingSummary.some((entry) => entry?.label === "PM");
  return {
    ...merged,
    routine: remoteHasTwoTimingSummary ? mergeOverviewSection(localRoutine, remoteRoutine) : localRoutine || remoteRoutine,
    learn: mergeOverviewSection(localReadiness?.learn || {}, remoteReadiness?.learn || {}),
    shortlist: mergeOverviewSection(localReadiness?.shortlist || {}, remoteReadiness?.shortlist || {}),
  };
}

export function buildOverviewSnapshot(options = {}) {
  const filtered = options.filtered || filterProducts();
  const scopeIdentity = buildOverviewScopeIdentity({ filtered });
  const activeRemotePayload =
    options.remotePayload ||
    (state.live.overview.requestKey === scopeIdentity.requestKey && state.live.overview.scopeKey === scopeIdentity.key ? state.live.overview.payload : null);
  const baseProducts = filterOverviewBaseProducts();
  const overlapSummary = getOverviewOverlapSummary(filtered);
  const retailerSnapshot = getMarketViewSnapshot(filtered);
  const retailerBoard = buildOverviewRetailerBoard(filtered, retailerSnapshot, overlapSummary);
  const matchedArticle = getOverviewMatchedArticle();
  const local = {
    generatedAt: state.freshness.catalog,
    source: {
      mode: state.live.apiBacked ? "api-local-fallback" : "static",
      generatedAt: state.freshness.catalog,
    },
    case: {
      goal: scopeIdentity.case.goal,
      lens: state.profile === "all" ? "Cross-store lens" : getProfileLabel(),
      retailer: scopeIdentity.case.retailer,
      path: scopeIdentity.case.path,
      routineTime: scopeIdentity.case.routineTime,
    },
    scope: scopeIdentity,
    summary: {
      filteredCount: filtered.length,
      exactOverlapGroups: overlapSummary.groupCount,
      exactOverlapOffers: overlapSummary.offerCount,
      ratedCount: filtered.filter((product) => typeof product.rating === "number" && typeof product.reviewCount === "number").length,
      shortlistReadyCount: getOverviewShortlistReadyCount(filtered),
      evidence: [
        {
          label: overlapSummary.confidenceLabel,
          value: overlapSummary.groupCount ? `${overlapSummary.groupCount} groups` : "Directional only",
          detail: overlapSummary.groupCount ? `${overlapSummary.offerCount} offers in exact retailer groups` : "No exact same-product overlap in this slice",
        },
        {
          label: "Rated options",
          value: `${filtered.filter((product) => typeof product.rating === "number" && typeof product.reviewCount === "number").length}`,
          detail: "Products in the current case with synthetic rating support",
        },
        {
          label: "Shortlist-ready matches",
          value: `${getOverviewShortlistReadyCount(filtered)}`,
          detail: "Core-category products that look viable for a first save",
        },
      ],
    },
    launchers: buildOverviewLaunchers(baseProducts, retailerBoard),
    decisionBoard: buildOverviewDecisionBoard(filtered),
    retailerBoard,
    readiness: buildOverviewReadiness(filtered, matchedArticle),
    learnBridge: buildOverviewLearnBridge(matchedArticle),
    templates: getOverviewTemplateEntries(),
  };

  if (!activeRemotePayload) return local;
  const remoteEligibility = getOverviewRemoteScopeEligibility(activeRemotePayload, scopeIdentity);
  const remoteCurrentCasePayload = remoteEligibility.currentCaseProof ? activeRemotePayload : null;
  const remoteScopedPayload = remoteEligibility.scoped ? activeRemotePayload : null;

  return {
    ...local,
    generatedAt: remoteScopedPayload?.generatedAt || local.generatedAt,
    source: remoteScopedPayload ? mergeOverviewSection(local.source, remoteScopedPayload.source) : local.source,
    summary: remoteCurrentCasePayload ? mergeOverviewSection(local.summary, remoteCurrentCasePayload.summary) : local.summary,
    launchers: remoteScopedPayload ? mergeOverviewSection(local.launchers, remoteScopedPayload.launchers) : local.launchers,
    decisionBoard: remoteCurrentCasePayload ? mergeOverviewDecisionBoard(local.decisionBoard, remoteCurrentCasePayload.decisionBoard) : local.decisionBoard,
    retailerBoard: remoteCurrentCasePayload ? mergeOverviewSection(local.retailerBoard, remoteCurrentCasePayload.retailerBoard) : local.retailerBoard,
    readiness: remoteCurrentCasePayload ? mergeOverviewReadiness(local.readiness, remoteCurrentCasePayload.readiness) : local.readiness,
    learnBridge: remoteCurrentCasePayload ? mergeOverviewSection(local.learnBridge, remoteCurrentCasePayload.learnBridge) : local.learnBridge,
    templates: Array.isArray(remoteScopedPayload?.templates) && remoteScopedPayload.templates.length ? remoteScopedPayload.templates : local.templates,
  };
}

export function syncOverviewCaseControls() {
  if (profileFilter) profileFilter.value = state.profile;
  if (retailerFilter) retailerFilter.value = state.retailer;
  if (brandFilter) brandFilter.value = state.brand;
  if (categoryFilter) categoryFilter.value = state.category;
  if (ingredientFilter) ingredientFilter.value = state.ingredient;
  if (sortFilter) sortFilter.value = state.sort;
  if (searchInput) searchInput.value = state.search;
  if (routineConcern) routineConcern.value = state.routineConcern;
  if (routineTime) routineTime.value = state.routineTime;
  if (routineBudget) routineBudget.value = state.routineBudget;
  setConcernChipSelection(state.concern);
}

export function refreshOverviewSurface(filtered = null, { fetchRemote = true, forceRemote = false, renderHidden = true } = {}) {
  const currentFiltered = filtered || filterProducts();
  if (renderHidden || state.ui.activeShellView === "overview") {
    renderOverview(buildOverviewSnapshot({ filtered: currentFiltered }));
  }
  if (fetchRemote && state.ui.activeShellView === "overview") {
    void ensureOverviewSnapshot(forceRemote);
  }
}

export function applyOverviewCasePatch(patch = {}, options = {}) {
  const { openView = "catalog", focusTarget = null } = options;
  const userProfileChanged =
    Object.prototype.hasOwnProperty.call(patch, "goal") ||
    Object.prototype.hasOwnProperty.call(patch, "budget") ||
    Object.prototype.hasOwnProperty.call(patch, "profile") ||
    Object.prototype.hasOwnProperty.call(patch, "sensitivity") ||
    Object.prototype.hasOwnProperty.call(patch, "activesComfort");
  const plannerChanged =
    userProfileChanged ||
    Object.prototype.hasOwnProperty.call(patch, "routineTime") ||
    Object.prototype.hasOwnProperty.call(patch, "routineBudget");

  enterWorkMode(openView === "overview" ? "catalog" : openView);
  setActiveShellView(openView, { focus: false, restoreScroll: false });

  if (patch.clearBrowseLane) {
    clearBrowseLaneSelection({ resetSort: patch.resetSort !== false });
  }

  if (Object.prototype.hasOwnProperty.call(patch, "concern")) state.concern = patch.concern;
  if (Object.prototype.hasOwnProperty.call(patch, "retailer")) state.retailer = patch.retailer;
  if (Object.prototype.hasOwnProperty.call(patch, "brand")) state.brand = patch.brand;
  if (Object.prototype.hasOwnProperty.call(patch, "category")) state.category = patch.category;
  if (Object.prototype.hasOwnProperty.call(patch, "ingredient")) state.ingredient = patch.ingredient;
  if (Object.prototype.hasOwnProperty.call(patch, "search")) state.search = patch.search;
  if (Object.prototype.hasOwnProperty.call(patch, "sort")) state.sort = patch.sort;

  if (Object.prototype.hasOwnProperty.call(patch, "profile")) {
    const nextProfile = normalizeSkinProfile(patch.profile);
    state.profile = nextProfile;
    state.userProfile.profile = nextProfile;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "goal")) {
    state.userProfile.goal = patch.goal;
    state.userProfile.goalSource = "profile";
    state.routineConcern = patch.goal;
  }
  if (Object.prototype.hasOwnProperty.call(patch, "budget")) state.userProfile.budget = patch.budget;
  if (Object.prototype.hasOwnProperty.call(patch, "sensitivity")) state.userProfile.sensitivity = patch.sensitivity;
  if (Object.prototype.hasOwnProperty.call(patch, "activesComfort")) state.userProfile.activesComfort = patch.activesComfort;
  if (Object.prototype.hasOwnProperty.call(patch, "routineTime")) state.routineTime = patch.routineTime;
  if (Object.prototype.hasOwnProperty.call(patch, "routineBudget")) state.routineBudget = patch.routineBudget;

  state.page = 1;
  state.ui.activeOverviewExplainer = null;
  syncOverviewCaseControls();

  if (userProfileChanged) {
    persistUserProfile();
  }
  if (plannerChanged) {
    resetRoutinePlannerCaches({ clearRestoreState: true });
    persistRoutinePlannerSession();
  }

  syncUserProfileSurface();
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({
    routine: true,
    bestPicks: true,
    articles: true,
    favorites: true,
  });

  if (plannerChanged) {
    scheduleCatalogSecondarySurfaceRefresh({ routineDraftSync: true });
  }
  if (focusTarget) {
    requestAnimationFrame(() => {
      focusTarget.focus({ preventScroll: true });
    });
  }
}

export function applyOverviewTemplate(templateKey) {
  const template = OVERVIEW_TEMPLATE_CONFIG.find((entry) => entry.key === templateKey);
  if (!template) return;
  const resolved = getOverviewTemplateResolvedConfig(template, state.products);
  const matches = getOverviewTemplateProducts(resolved, state.products);
  if (!matches.length || matches.length < 6) return;

  applyOverviewCasePatch(
    {
      clearBrowseLane: true,
      resetSort: true,
      concern: resolved.concern || "all",
      category: resolved.category || "all",
      ingredient: resolved.ingredient || "all",
      sort: "relevance",
      goal: resolved.goal || state.userProfile.goal || state.routineConcern,
      sensitivity: resolved.sensitivity || state.userProfile.sensitivity,
      activesComfort: resolved.activesComfort || state.userProfile.activesComfort,
    },
    { openView: "catalog" },
  );
}

export function applyOverviewLauncher(launchMode) {
  const launchedFromOverview = state.ui.activeShellView === "overview";
  const resetOverviewReturnScroll = () => {
    if (launchedFromOverview) shellScrollYByView.overview = 0;
  };
  if (!state.products.length && launchMode !== "budget") {
    state.ui.pendingOverviewLauncher = launchMode;
    enterWorkMode("catalog");
    setActiveShellView("catalog", { focus: false, restoreScroll: false });
    resetOverviewReturnScroll();
    return;
  }
  state.ui.pendingOverviewLauncher = null;
  const baseProducts = filterOverviewBaseProducts();
  if (launchMode === "concern") {
    const concern = resolveOverviewConcernTarget(baseProducts);
    applyOverviewCasePatch(
      {
        clearBrowseLane: true,
        resetSort: true,
        concern,
        category: "all",
        ingredient: "all",
        sort: "relevance",
      },
      { openView: "catalog" },
    );
    resetOverviewReturnScroll();
    return;
  }
  if (launchMode === "budget") {
    enterWorkMode("catalog");
    setActiveShellView("catalog", { focus: false, restoreScroll: false });
    applyBrowseLane("under-50");
    resetOverviewReturnScroll();
    return;
  }
  if (launchMode === "ingredient") {
    const ingredientTarget = resolveOverviewIngredientTarget(baseProducts);
    if (!ingredientTarget.available) {
      applyOverviewCasePatch(
        {
          clearBrowseLane: true,
          resetSort: true,
          concern: "all",
          category: "all",
          ingredient: "all",
          sort: "relevance",
        },
        { openView: "catalog", focusTarget: ingredientFilter },
      );
      resetOverviewReturnScroll();
      return;
    }
    applyOverviewCasePatch(
      {
        clearBrowseLane: true,
        resetSort: true,
        concern: "all",
        category: "all",
        ingredient: ingredientTarget.ingredient,
        sort: "relevance",
      },
      { openView: "catalog" },
    );
    resetOverviewReturnScroll();
    return;
  }
  if (launchMode === "retailer") {
    const renderContext = getCatalogRenderContext();
    const filtered = renderContext.filtered;
    const retailerBoard = buildOverviewRetailerBoard(
      filtered,
      renderContext.marketSnapshot,
      getOverviewOverlapSummary(filtered),
    );
    if (retailerBoard?.winner?.retailer && retailerBoard.canAutoFocus) {
      applyOverviewCasePatch(
        {
          retailer: retailerBoard.winner.retailer,
        },
        { openView: "catalog" },
      );
      resetOverviewReturnScroll();
      return;
    }
    state.ui.activeOverviewExplainer = "retailer:winner";
    openDecisionWorkspaceSection("market-view-panel");
    resetOverviewReturnScroll();
  }
}

export function openOverviewArticle(articleId) {
  const article = articleCatalog.find((entry) => entry.id === articleId);
  if (!article) return;
  state.articleId = article.id;
  state.articleGroup = article.group || "skincare";
  renderArticles();
  setActiveSupportWorkspaceSection("learn-workspace-panel");
}

export function getOverviewLeadProduct() {
  const context = getCatalogRenderContext();
  return context.leadProduct || getSpotlightProduct(context.filtered) || null;
}

export function openOverviewShortlistPath() {
  if (!state.favoriteIds.length && !isCatalogDecisionReady()) {
    applyOverviewLauncher(getOverviewRecommendedLauncherKey());
    return true;
  }
  if (!state.favoriteIds.length) {
    const leadProduct = getOverviewLeadProduct();
    if (leadProduct?.id) {
      addProductsToFavorites([leadProduct.id], { openShortlist: true });
      return true;
    }
  }
  return openShortlistCompareMode();
}

export function openOverviewRoutinePath() {
  if (!isCatalogDecisionReady()) {
    applyOverviewLauncher(getOverviewRecommendedLauncherKey());
    return true;
  }
  const leadProduct = getOverviewLeadProduct();
  if (leadProduct?.id && getLeadRoutineStep(leadProduct)) {
    return planAroundProduct(leadProduct.id);
  }
  focusRoutineBuilder();
  return true;
}

export function continueOverviewDecisionPath() {
  if (!isCatalogDecisionReady()) {
    applyOverviewLauncher(getOverviewRecommendedLauncherKey());
    return true;
  }
  const context = getCatalogRenderContext();
  const action = getOverviewDecisionActionContext(context.filtered, context.marketSnapshot);
  return runDecisionNextAction(action);
}

export function getCatalogOrderedProductsForCurrentCase() {
  const context = getCatalogRenderContext({ mutableFiltered: true });
  const ordered = context.filtered;
  const spotlight = context.leadProduct;
  const backupProduct = getShortlistBackupProduct();
  if (spotlight) {
    ordered.sort((a, b) => {
      if (a.id === spotlight.id) return -1;
      if (b.id === spotlight.id) return 1;
      if (backupProduct?.id && a.id === backupProduct.id) return -1;
      if (backupProduct?.id && b.id === backupProduct.id) return 1;
      return 0;
    });
  }
  return ordered;
}

export function getCatalogPageForProduct(productId) {
  const index = getCatalogOrderedProductsForCurrentCase().findIndex((product) => product.id === productId);
  return index >= 0 ? Math.floor(index / state.pageSize) + 1 : 1;
}

export function focusCatalogProductCard(productId) {
  requestAnimationFrame(() => {
    const targetCard = [...(productGrid?.querySelectorAll(".product-card") || [])].find(
      (card) => card.dataset.productId === productId,
    );
    if (!targetCard) {
      controlsPanel?.scrollIntoView({ block: "start", behavior: getMotionSafeScrollBehavior() });
      return;
    }
    productGrid?.querySelectorAll(".product-card.is-catalog-find-target").forEach((card) => {
      if (card !== targetCard) card.classList.remove("is-catalog-find-target");
    });
    targetCard.classList.add("is-catalog-find-target");
    targetCard.setAttribute("tabindex", "-1");
    targetCard.scrollIntoView({ block: "center", behavior: getMotionSafeScrollBehavior() });
    targetCard.focus({ preventScroll: true });
    if (catalogFindHighlightTimer) {
      window.clearTimeout(catalogFindHighlightTimer);
    }
    catalogFindHighlightTimer = window.setTimeout(() => {
      if (state.ui.catalogFindTargetId === productId) {
        state.ui.catalogFindTargetId = null;
      }
      targetCard.classList.remove("is-catalog-find-target");
      catalogFindHighlightTimer = null;
    }, 2400);
  });
}

export function focusOverviewProductInCatalog(productId) {
  const product = getProductById(productId);
  if (!product) {
    return focusCatalogWorkbench({ focusSearch: true });
  }
  state.ui.catalogFindTargetId = product.id;
  state.page = getCatalogPageForProduct(product.id);
  enterWorkMode("catalog");
  setActiveShellView("catalog", { focus: false, restoreScroll: false });
  focusCatalogProductCard(product.id);
  return true;
}

export function saveOverviewProductToShortlist(productId, status = "wait") {
  const product = getProductById(productId);
  if (!product) return false;
  if (status === "optional" && !getShortlistChampionProduct()) {
    const leadProduct = getOverviewLeadProduct();
    if (leadProduct?.id && leadProduct.id !== product.id) {
      if (!state.favoriteIds.includes(leadProduct.id)) {
        addProductsToFavorites([leadProduct.id]);
      }
      setShortlistStatus(leadProduct.id, "core");
    }
  }
  if (!state.favoriteIds.includes(product.id)) {
    addProductsToFavorites([product.id]);
  }
  if (SHORTLIST_STATUS_LABELS[status]) {
    setShortlistStatus(product.id, status);
  }
  openShortlistCompareMode();
  return true;
}

export function applyOverviewRetailerFilter(retailer) {
  if (!retailer || retailer === "all" || !(state.metadata?.retailers || []).includes(retailer)) {
    return openDecisionWorkspaceSection("market-view-panel");
  }
  applyOverviewCasePatch(
    {
      retailer,
      sort: "relevance",
    },
    { openView: "catalog", focusTarget: retailerFilter },
  );
  requestAnimationFrame(() => {
    controlsPanel?.scrollIntoView({ block: "start", behavior: getMotionSafeScrollBehavior() });
  });
  return true;
}

export function handleOverviewAction(action, articleId = null) {
  if (action === "choose-focus") {
    applyOverviewLauncher(getOverviewRecommendedLauncherKey());
    return;
  }
  if (action === "edit-lens") {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : editUserProfileButton;
    openUserProfileEditor({ scrollToEditor: true, trigger: trigger || editUserProfileButton });
    return;
  }
  if (action === "continue-decision") {
    continueOverviewDecisionPath();
    return;
  }
  if (action === "find-product" && articleId) {
    focusOverviewProductInCatalog(articleId);
    return;
  }
  if (action === "save-product-core" && articleId) {
    saveOverviewProductToShortlist(articleId, "core");
    return;
  }
  if (action === "save-product-optional" && articleId) {
    saveOverviewProductToShortlist(articleId, "optional");
    return;
  }
  if (action === "save-product-support" && articleId) {
    saveOverviewProductToShortlist(articleId, "wait");
    return;
  }
  if (action === "plan-product" && articleId) {
    if (!planAroundProduct(articleId)) {
      focusRoutineBuilder();
    }
    return;
  }
  if (action === "apply-retailer") {
    applyOverviewRetailerFilter(articleId);
    return;
  }
  if (action === "open-retailer-workspace") {
    openDecisionWorkspaceSection("market-view-panel");
    return;
  }
  if (action === "open-catalog") {
    focusCatalogWorkbench();
    return;
  }
  if (action === "open-shortlist") {
    openOverviewShortlistPath();
    return;
  }
  if (action === "open-routine") {
    openOverviewRoutinePath();
    return;
  }
  if (action === "open-article" && articleId) {
    openOverviewArticle(articleId);
    return;
  }
  if (action === "open-article-library" && articleId) {
    openOverviewArticle(articleId);
    return;
  }
  if (action === "open-article-library") {
    setActiveSupportWorkspaceSection("learn-workspace-panel");
    return;
  }
  if (action === "shop-article" && articleId) {
    openOverviewArticle(articleId);
    applyArticleJourney(articleId);
  }
}

function setOverviewSectionHidden(element, hidden) {
  if (!element) return;
  element.hidden = Boolean(hidden);
  element.setAttribute("aria-hidden", String(Boolean(hidden)));
}

function getOverviewMosaicCard(element) {
  return element?.closest(".overview-support-card") || element?.closest(".mosaic-card") || null;
}

export function syncOverviewMosaicVisibility() {
  if (!mosaicPanel) return;
  const supportCards = Array.from(mosaicPanel.querySelectorAll(".overview-support-card, .mosaic-card"));
  const hasVisibleCard = supportCards.some((card) => !card.hidden);
  setOverviewSectionHidden(mosaicPanel, !hasVisibleCard);
}

function getOverviewFilteredCount(snapshot) {
  const count = Number(snapshot?.summary?.filteredCount);
  return Number.isFinite(count) ? count : filterProducts().length;
}

function hasOverviewCatalogSignal(snapshot) {
  return getOverviewFilteredCount(snapshot) > 0 || (snapshot?.decisionBoard?.entries || []).some((entry) => entry?.product?.id || entry?.id);
}

function normalizeOverviewTemplateValue(value, fallback = "all") {
  const normalized = String(value || fallback || "all").trim().toLowerCase();
  return normalized || "all";
}

function getOverviewTemplateActiveAxes(snapshot = null) {
  const activeLane = getActiveBrowseLane();
  const laneIngredients = new Set(
    [
      activeLane?.ingredient,
      ...(Array.isArray(activeLane?.ingredientsAny) ? activeLane.ingredientsAny : []),
    ]
      .map((value) => normalizeOverviewTemplateValue(value, ""))
      .filter(Boolean),
  );
  return {
    path: snapshot?.case?.path || getOverviewCurrentCasePath(),
    concern:
      normalizeOverviewTemplateValue(state.concern) !== "all"
        ? normalizeOverviewTemplateValue(state.concern)
        : normalizeOverviewTemplateValue(activeLane?.primaryConcern || activeLane?.concern),
    category:
      normalizeOverviewTemplateValue(state.category) !== "all"
        ? normalizeOverviewTemplateValue(state.category)
        : normalizeOverviewTemplateValue(activeLane?.category),
    ingredient: normalizeOverviewTemplateValue(state.ingredient),
    laneIngredients,
    goal: normalizeOverviewTemplateValue(state.userProfile.goal || state.routineConcern || "general care", "general care"),
    sensitivity: normalizeOverviewTemplateValue(state.userProfile.sensitivity || "moderate", "moderate"),
    activesComfort: normalizeOverviewTemplateValue(state.userProfile.activesComfort || "medium", "medium"),
  };
}

export function getOverviewTemplateUsefulPivotKeys(template, snapshot = null) {
  if (!template?.enabled) return [];
  const activeAxes = getOverviewTemplateActiveAxes(snapshot);
  const currentPath = normalizeOverviewScopeText(activeAxes.path);
  if (template.label && currentPath && normalizeOverviewScopeText(template.label) === currentPath) {
    return [];
  }

  const pivotKeys = [];
  const concern = normalizeOverviewTemplateValue(template.concern);
  const category = normalizeOverviewTemplateValue(template.category);
  const ingredient = normalizeOverviewTemplateValue(template.ingredient);
  const goal = normalizeOverviewTemplateValue(template.goal, "");
  const sensitivity = normalizeOverviewTemplateValue(template.sensitivity, "");
  const activesComfort = normalizeOverviewTemplateValue(template.activesComfort, "");

  if (concern !== "all" && concern !== activeAxes.concern) pivotKeys.push("concern");
  if (category !== "all" && category !== activeAxes.category) pivotKeys.push("category");
  if (ingredient !== "all" && ingredient !== activeAxes.ingredient && !activeAxes.laneIngredients.has(ingredient)) pivotKeys.push("ingredient");
  if (goal && goal !== "all" && goal !== activeAxes.goal) pivotKeys.push("posture");
  if (sensitivity && sensitivity !== "all" && sensitivity !== activeAxes.sensitivity) pivotKeys.push("posture");
  if (activesComfort && activesComfort !== "all" && activesComfort !== activeAxes.activesComfort) pivotKeys.push("posture");

  return [...new Set(pivotKeys)];
}

function getOverviewMosaicRecommendedLauncherKey() {
  return state.retailer !== "all"
    ? "retailer"
    : state.ingredient !== "all"
      ? "ingredient"
      : state.browseLaneKey === "under-50" || state.userProfile.budget === "budget"
        ? "budget"
        : "concern";
}

export function isOverviewTemplateUseful(template, snapshot = null) {
  const pivotKeys = getOverviewTemplateUsefulPivotKeys(template, snapshot);
  if (!pivotKeys.length) return false;
  return !(pivotKeys.length === 1 && pivotKeys[0] === getOverviewMosaicRecommendedLauncherKey());
}

export function getVisibleOverviewTemplates(snapshot = null) {
  const templates = Array.isArray(snapshot?.templates) ? snapshot.templates : [];
  return templates.filter((template) => template?.enabled && isOverviewTemplateUseful(template, snapshot));
}

export function shouldShowOverviewRetailerMosaic(snapshot = null) {
  const retailerBoard = snapshot?.retailerBoard || {};
  const winner = retailerBoard.winner || null;
  if (!winner?.retailer) return false;

  const runnerUp = retailerBoard.runnerUp || null;
  const confidenceTone = retailerBoard.confidenceTone || "directional";
  const exactOverlapGroups = Number(snapshot?.summary?.exactOverlapGroups || 0);
  const exactOverlapOffers = Number(snapshot?.summary?.exactOverlapOffers || 0);
  const activePath = normalizeOverviewScopeText(snapshot?.case?.path || getOverviewCurrentCasePath());
  const winnerPath = normalizeOverviewScopeText(winner.retailer);

  const hasRunnerTradeoff = Boolean(
    runnerUp?.retailer &&
      runnerUp.retailer !== winner.retailer &&
      (runnerUp.tradeoff || runnerUp.reason),
  );
  const needsConfidenceExplanation = ["directional", "thin"].includes(confidenceTone);
  const hasExactOverlapContext = exactOverlapGroups > 0 && (exactOverlapOffers > 0 || retailerBoard.overlapCopy);
  const activeRetailerDecision =
    state.retailer !== "all" ||
    Boolean(winnerPath && activePath.includes(winnerPath)) ||
    String(state.ui.activeOverviewExplainer || "").startsWith("retailer:");

  return hasRunnerTradeoff || needsConfidenceExplanation || hasExactOverlapContext || activeRetailerDecision;
}

function hasOverviewRoutineSignal(routine = {}) {
  if (routine.ready || routine.activeReady) return true;
  const timingSummary = Array.isArray(routine.timingSummary) ? routine.timingSummary : [];
  return timingSummary.some((entry) => Number(String(entry?.value || "0").split("/")[0]) > 0);
}

export function getOverviewRecommendedLauncherKey() {
  return state.retailer !== "all"
    ? "retailer"
    : state.ingredient !== "all"
      ? "ingredient"
      : state.browseLaneKey === "under-50" || state.userProfile.budget === "budget"
        ? "budget"
        : "concern";
}

const OVERVIEW_DEFAULT_CONCERN_TEXT = "Dry, tight, reactive after cleansing";
const OVERVIEW_NEUTRAL_SAFETY_GATE_COPY =
  "Safety gate watches for rash, swelling, prescription actives, pregnancy, breastfeeding, or severe irritation before product proof.";
const OVERVIEW_NO_SAFETY_FLAGS_COPY = "No safety flags found in this text.";
const OVERVIEW_SAFETY_HANDOFF_COPY =
  "This mentions rash, swelling, prescription actives, pregnancy, breastfeeding, or severe irritation context. Pause product proof and use Routine Check or Learn for conservative next steps.";
const OVERVIEW_EMPTY_CONCERN_VALIDATION = "Add one concern first.";

const OVERVIEW_CONCERN_CHIP_COPY = {
  dryness: "Dry, tight, reactive after cleansing",
  sensitive: "Sensitive and reactive after cleansing",
  acne: "Breakouts, clogged pores, and irritation risk",
  "dark-spots": "Dark spots and uneven tone",
  "under-50": "I need a good option under $50",
};

const OVERVIEW_FOCUS_PATHS = [
  {
    key: "dryness-barrier",
    launcherKey: "concern",
    kicker: "Recommended",
    title: "Dryness and barrier",
    why: "Best fit for dry, tight, reactive language. It keeps sensitivity guardrails visible before products appear.",
    unlocks: "Unlocks best match, safer backup, and value pick.",
    actionLabel: "Use Dryness focus",
    suggestedLabel: "Dryness and barrier",
  },
  {
    key: "under-50",
    launcherKey: "budget",
    kicker: "Budget path",
    title: "Under $50",
    why: "Use when price is the constraint and the proof needs to show tradeoffs without hiding irritation risk.",
    unlocks: "Unlocks lower-spend proof with value watchouts.",
    actionLabel: "Use Under $50",
    suggestedLabel: "Under $50",
  },
  {
    key: "ceramide-support",
    launcherKey: "ingredient",
    kicker: "Ingredient path",
    title: "Ceramide support",
    why: "Use when the shopper already knows the ingredient family they want to compare for barrier support.",
    unlocks: "Unlocks product proof grouped by ingredient signal.",
    actionLabel: "Use Ceramide path",
    suggestedLabel: "Ceramide support",
  },
];

const OVERVIEW_PROOF_FOCUS_KEYS = new Set(OVERVIEW_FOCUS_PATHS.map((entry) => entry.key));
const OVERVIEW_SAFETY_RULE_IDS = new Set([
  "pregnancy-request",
  "red-flag-severe-reaction",
  "red-flag-post-procedure",
  "red-flag-cystic",
  "red-flag-eczema-rosacea",
  "prescription-active-context",
]);

const OVERVIEW_HANDOFF_PATHS = {
  safety: {
    key: "safety",
    kicker: "Safety handoff",
    title: "Routine Check safety review",
    suggestedLabel: "Routine Check",
    why: "Safety-sensitive language should be handled before any product proof appears.",
    unlocks: "Routes to Routine Check or Learn. Overview proof stays paused.",
    primaryAction: "open-routine",
    primaryLabel: "Open Routine Check",
    secondaryAction: "open-learn",
    secondaryLabel: "Open Learn",
  },
  acne: {
    key: "acne",
    kicker: "Catalog handoff",
    title: "Acne starter",
    suggestedLabel: "Acne starter",
    why: "Breakout language needs active strength, irritation risk, and routine context before products are judged here.",
    unlocks: "Opens Catalog focused on acne support. Overview proof remains locked for this path.",
    primaryAction: "catalog-acne",
    primaryLabel: "Open Catalog focus",
    secondaryAction: "open-learn",
    secondaryLabel: "Open Learn guide",
  },
  "dark-spots": {
    key: "dark-spots",
    kicker: "Catalog handoff",
    title: "Dark spots and SPF",
    suggestedLabel: "Dark spots and SPF",
    why: "Tone concerns need SPF and active-context checks before this Overview proof deck can be honest.",
    unlocks: "Opens Catalog focused on dark spots. Learn can explain the SPF-first decision.",
    primaryAction: "catalog-dark-spots",
    primaryLabel: "Open Catalog focus",
    secondaryAction: "open-learn",
    secondaryLabel: "Open Learn guide",
  },
};

const OVERVIEW_HEARD_CHIP_LABELS = {
  dryness: "Dryness",
  sensitive: "Sensitive",
  acne: "Acne",
  "dark-spots": "Dark spots",
  "under-50": "Under $50",
  "ceramide-support": "Ceramides",
  rash: "Rash",
  swelling: "Swelling",
  "severe-irritation": "Severe irritation",
  "prescription-actives": "Prescription actives",
  pregnancy: "Pregnancy",
  breastfeeding: "Breastfeeding",
  "safety-check": "Safety check",
  waiting: "Waiting",
};

function getOverviewFocusPath(focusKey) {
  return OVERVIEW_FOCUS_PATHS.find((entry) => entry.key === focusKey) || null;
}

function getOverviewProofFocusPath(focusKey = "dryness-barrier") {
  return getOverviewFocusPath(focusKey) || OVERVIEW_FOCUS_PATHS[0];
}

function normalizeOverviewIntakeText(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function getOverviewConcernText() {
  return normalizeOverviewIntakeText(state.ui.overviewConcernText);
}

function getOverviewBaseSignalKeys(text = getOverviewConcernText()) {
  const normalized = text.toLowerCase();
  const keys = [];
  if (/\b(dry|dryness|tight|dehydrat(?:ed|ion)?|flaky|cleanse|cleansing|moisturi[sz]er|barrier)\b/.test(normalized)) keys.push("dryness");
  if (/\b(sensitive|reactive|sting|stinging|redness|reactivity)\b|\birritat/.test(normalized)) keys.push("sensitive");
  if (/\b(acne|breakouts?|blemish(?:es)?|pimples?|pores?|clog(?:ged|ging)?)\b/.test(normalized)) keys.push("acne");
  if (/\bdark\s*spots?\b|\bhyperpig|\bdiscolor|\buneven\s*tone\b|\bmelasma\b|\bpost-acne\s*marks?\b/.test(normalized)) keys.push("dark-spots");
  if (/\bunder\s*\$?\s*50\b|\$50\b|\bunder\s*fifty\b|\bbudget\b|\blower[-\s]?spend\b|\bcheap\b|\baffordable\b/.test(normalized)) keys.push("under-50");
  if (/\bceramides?\b|\bbarrier\s+(support|repair|cream)\b|\bingredient\s+(path|family|focus)\b/.test(normalized)) keys.push("ceramide-support");
  return [...new Set(keys)];
}

function getOverviewSafetySignalState(text = getOverviewConcernText()) {
  const normalized = normalizeOverviewIntakeText(text).toLowerCase();
  if (!normalized) {
    return { keys: [], guardrail: { hasGuardrail: false, matches: [] } };
  }
  const guardrail = evaluateShortlistQuestionGuardrails(normalized, []);
  const configuredSafetyMatches = (guardrail.matches || []).filter((match) => OVERVIEW_SAFETY_RULE_IDS.has(match.id));
  const keys = [];
  if (/\brash(?:es)?\b|\bhives?\b/.test(normalized)) keys.push("rash");
  if (/\bswelling\b|\bswollen\b|\beye\s+swelling\b/.test(normalized)) keys.push("swelling");
  if (/\bsevere\s+irritation\b|\bsevere\s+burning\b|\bskin\s+is\s+burning\b|\bburning\b.*\bafter\b/.test(normalized)) keys.push("severe-irritation");
  if (/\bprescription\b|\btretinoin\b|\badapalene\b|\bclindamycin\b/.test(normalized)) keys.push("prescription-actives");
  if (/\bpregnan|\btrying\s+to\s+conceive\b|\bttc\b|\bexpectant\b/.test(normalized)) keys.push("pregnancy");
  if (/\bbreastfeed|\bnursing\b/.test(normalized)) keys.push("breastfeeding");
  if (configuredSafetyMatches.length && !keys.length) keys.push("safety-check");
  return {
    keys: [...new Set(keys)],
    guardrail,
    hasSafetyFlag: keys.length > 0 || configuredSafetyMatches.length > 0,
    matches: configuredSafetyMatches,
  };
}

function getOverviewHeardChipLabel(key) {
  return OVERVIEW_HEARD_CHIP_LABELS[key] || titleCase(key);
}

function getOverviewHandoffRoute(handoffKey) {
  return OVERVIEW_HANDOFF_PATHS[handoffKey] || null;
}

function getOverviewRoutingState(text = getOverviewConcernText()) {
  const concernText = normalizeOverviewIntakeText(text);
  const parsed = Boolean(concernText && state.ui.overviewConcernParsed);
  if (!parsed) {
    return {
      status: "idle",
      concernText,
      parsed: false,
      heardKeys: [],
      safetyKeys: [],
      proofCapable: false,
      suggestedFocusKey: null,
      focus: null,
      suggestedLabel: "Waiting for concern",
      primaryLabel: "Analyze concern",
      safetyCopy: OVERVIEW_NEUTRAL_SAFETY_GATE_COPY,
      safetyTone: "idle",
      recommendedLauncher: "concern",
    };
  }

  const baseKeys = getOverviewBaseSignalKeys(concernText);
  const safetyState = getOverviewSafetySignalState(concernText);
  const heardKeys = [...new Set([...baseKeys, ...safetyState.keys])];
  if (safetyState.hasSafetyFlag) {
    const handoff = getOverviewHandoffRoute("safety");
    return {
      status: "safety-handoff",
      concernText,
      parsed: true,
      heardKeys,
      safetyKeys: safetyState.keys,
      proofCapable: false,
      handoff,
      suggestedFocusKey: null,
      focus: null,
      suggestedLabel: handoff.suggestedLabel,
      primaryLabel: handoff.primaryLabel,
      safetyCopy: OVERVIEW_SAFETY_HANDOFF_COPY,
      safetyTone: "alert",
      recommendedLauncher: "concern",
    };
  }

  if (baseKeys.includes("acne")) {
    const handoff = getOverviewHandoffRoute("acne");
    return {
      status: "parsed",
      routeKind: "handoff",
      concernText,
      parsed: true,
      heardKeys,
      safetyKeys: [],
      proofCapable: false,
      handoff,
      suggestedFocusKey: null,
      focus: null,
      suggestedLabel: handoff.suggestedLabel,
      primaryLabel: handoff.primaryLabel,
      safetyCopy: OVERVIEW_NO_SAFETY_FLAGS_COPY,
      safetyTone: "clear",
      recommendedLauncher: "concern",
    };
  }

  if (baseKeys.includes("dark-spots")) {
    const handoff = getOverviewHandoffRoute("dark-spots");
    return {
      status: "parsed",
      routeKind: "handoff",
      concernText,
      parsed: true,
      heardKeys,
      safetyKeys: [],
      proofCapable: false,
      handoff,
      suggestedFocusKey: null,
      focus: null,
      suggestedLabel: handoff.suggestedLabel,
      primaryLabel: handoff.primaryLabel,
      safetyCopy: OVERVIEW_NO_SAFETY_FLAGS_COPY,
      safetyTone: "clear",
      recommendedLauncher: "concern",
    };
  }

  const hasOnlyBudgetSignal = baseKeys.includes("under-50") && baseKeys.every((key) => key === "under-50");
  const suggestedFocusKey = baseKeys.includes("ceramide-support")
    ? "ceramide-support"
    : hasOnlyBudgetSignal
      ? "under-50"
      : "dryness-barrier";
  const focus = getOverviewProofFocusPath(suggestedFocusKey);
  return {
    status: "parsed",
    routeKind: "proof",
    concernText,
    parsed: true,
    heardKeys,
    safetyKeys: [],
    proofCapable: true,
    handoff: null,
    suggestedFocusKey: focus.key,
    focus,
    suggestedLabel: focus.suggestedLabel,
    primaryLabel: "Use suggested focus",
    safetyCopy: OVERVIEW_NO_SAFETY_FLAGS_COPY,
    safetyTone: "clear",
    recommendedLauncher: focus.launcherKey || "concern",
  };
}

function getOverviewHeardChipKeys(text = getOverviewConcernText()) {
  return getOverviewRoutingState(text).heardKeys;
}

function getOverviewSuggestedFocusKey() {
  return getOverviewRoutingState().suggestedFocusKey;
}

function hasOverviewParsedConcern() {
  return Boolean(getOverviewConcernText() && state.ui.overviewConcernParsed);
}

function clearOverviewSelectedFocusCase() {
  if (!state.ui.overviewSelectedFocus) return;
  state.ui.overviewSelectedFocus = null;
  clearBrowseLaneSelection({ resetSort: true });
  state.concern = "all";
  state.category = "all";
  state.ingredient = "all";
  state.retailer = "all";
  state.brand = "all";
  state.search = "";
  state.page = 1;
  syncOverviewCaseControls();
  renderShellChrome();
}

export function handleOverviewConcernInput(value) {
  const nextText = normalizeOverviewIntakeText(value);
  const previousText = getOverviewConcernText();
  state.ui.overviewConcernText = nextText;
  state.ui.overviewConcernParsed = nextText.length >= 3;
  state.ui.overviewConcernValidation = "";
  if (previousText !== nextText) {
    clearOverviewSelectedFocusCase();
    state.ui.activeOverviewExplainer = null;
  }
  refreshOverviewSurface(null, { fetchRemote: false });
}

export function handleOverviewConcernChip(chipKey) {
  const nextText = OVERVIEW_CONCERN_CHIP_COPY[chipKey] || OVERVIEW_DEFAULT_CONCERN_TEXT;
  state.ui.overviewConcernText = nextText;
  state.ui.overviewConcernParsed = true;
  state.ui.overviewConcernValidation = "";
  clearOverviewSelectedFocusCase();
  state.ui.activeOverviewExplainer = null;
  refreshOverviewSurface(null, { fetchRemote: false });
}

export function handleOverviewConcernPrimaryAction() {
  const routingState = getOverviewRoutingState();
  if (!routingState.parsed) {
    state.ui.overviewConcernValidation = OVERVIEW_EMPTY_CONCERN_VALIDATION;
    state.ui.overviewSelectedFocus = null;
    refreshOverviewSurface(null, { fetchRemote: false });
    requestAnimationFrame(() => {
      overviewConcernInput?.focus({ preventScroll: true });
    });
    return;
  }
  state.ui.overviewConcernValidation = "";
  if (routingState.handoff?.primaryAction) {
    handleOverviewRouteAction(routingState.handoff.primaryAction);
    return;
  }
  if (routingState.proofCapable && routingState.suggestedFocusKey) {
    selectOverviewFocusPath(routingState.suggestedFocusKey);
  }
}

export function handleOverviewRouteAction(routeAction) {
  if (routeAction === "open-routine") {
    focusRoutineBuilder();
    return;
  }
  if (routeAction === "open-learn") {
    setActiveSupportWorkspaceSection("learn-workspace-panel");
    return;
  }
  if (routeAction === "catalog-acne") {
    applyOverviewCasePatch(
      {
        clearBrowseLane: true,
        resetSort: true,
        concern: "acne",
        category: "all",
        ingredient: "all",
        sort: "relevance",
        goal: "acne",
      },
      { openView: "catalog" },
    );
    return;
  }
  if (routeAction === "catalog-dark-spots") {
    applyOverviewCasePatch(
      {
        clearBrowseLane: true,
        resetSort: true,
        concern: "dark spots",
        category: "all",
        ingredient: "all",
        sort: "relevance",
        goal: "dark spots",
      },
      { openView: "catalog" },
    );
  }
}

export function selectOverviewFocusPath(focusKey = "dryness-barrier") {
  const routingState = getOverviewRoutingState();
  if (!routingState.parsed) {
    state.ui.overviewConcernValidation = OVERVIEW_EMPTY_CONCERN_VALIDATION;
    refreshOverviewSurface(null, { fetchRemote: false });
    return;
  }
  if (routingState.handoff?.primaryAction) {
    handleOverviewRouteAction(routingState.handoff.primaryAction);
    return;
  }
  if (!OVERVIEW_PROOF_FOCUS_KEYS.has(focusKey)) return;
  const focus = getOverviewProofFocusPath(focusKey);
  state.ui.overviewConcernValidation = "";
  state.ui.overviewConcernParsed = true;
  state.ui.overviewSelectedFocus = focus.key;
  state.ui.activeOverviewExplainer = null;
  state.page = 1;
  state.retailer = "all";
  state.brand = "all";
  state.search = "";

  if (focus.key === "under-50") {
    const lane = BROWSE_LANES.find((entry) => entry.key === "under-50");
    state.browseLaneKey = "under-50";
    state.concern = "all";
    state.category = "all";
    state.ingredient = "all";
    state.sort = lane?.sort || "top-rated";
  } else {
    clearBrowseLaneSelection({ resetSort: true });
    state.concern = "dryness";
    state.category = "all";
    state.ingredient = focus.key === "ceramide-support" ? "ceramides" : "all";
    state.sort = "relevance";
  }

  syncOverviewCaseControls();
  renderShellChrome();
  refreshOverviewSurface(null, { fetchRemote: true, forceRemote: true });
  requestAnimationFrame(() => {
    overviewProofLock?.closest(".overview-proof-panel")?.scrollIntoView({
      block: "nearest",
      behavior: getMotionSafeScrollBehavior(),
    });
  });
}

export function getOverviewDecisionPrimaryLabel(decisionAction = {}, leader = null) {
  if (leader?.id && !state.favoriteIds.includes(leader.id)) return "Save leader";
  if (leader?.id && state.favoriteIds.includes(leader.id)) {
    return decisionAction?.key && decisionAction.key !== "save-lead" ? "Continue decision" : "Open Shortlist";
  }
  const label = decisionAction?.primaryLabel || "";
  if (/save current leader/i.test(label)) return "Save leader";
  if (/open shortlist/i.test(label)) return "Open Shortlist";
  return label || "Continue decision";
}

export function getOverviewHierarchyState(snapshot = null) {
  const rankingContext = getCatalogRankingContext();
  const decisionReady = isCatalogDecisionReady(rankingContext);
  const routingState = getOverviewRoutingState();
  const path = snapshot?.case?.path || getOverviewCurrentCasePath();
  const entries = Array.isArray(snapshot?.decisionBoard?.entries) ? snapshot.decisionBoard.entries : [];
  const hasLeader = entries.some((entry) => getOverviewBoardProduct(entry)?.id);
  const selectedFocus = getOverviewFocusPath(state.ui.overviewSelectedFocus);
  const overviewFocusSelected = Boolean(selectedFocus && routingState.parsed && routingState.proofCapable);
  const broadPath = isOverviewBroadPath(path);
  const retailerFocused = state.retailer !== "all" && hasLeader;
  const mode = (decisionReady || retailerFocused) && hasLeader
    ? "focused"
    : routingState.status === "idle" && broadPath && hasLeader
      ? "broad"
      : routingState.status;
  return {
    mode,
    decisionReady,
    overviewFocusSelected,
    broadPath,
    hasLeader,
    routingState,
    recommendedLauncher: routingState.recommendedLauncher || getOverviewRecommendedLauncherKey(),
    label:
      mode === "focused"
        ? "Focused case"
        : mode === "idle"
          ? "Waiting"
          : mode === "safety-handoff"
            ? "Safety handoff"
            : routingState.proofCapable
              ? "Focus suggested"
              : "Handoff suggested",
  };
}

export function getOverviewPrimaryNextAction(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  const entries = Array.isArray(snapshot?.decisionBoard?.entries) ? snapshot.decisionBoard.entries : [];
  const leader = getOverviewBoardProduct(entries[0]);
  if (hierarchy.mode === "focused" && leader?.id) {
    const shortlistReadiness = snapshot.readiness?.shortlist || {};
    const decisionAction = shortlistReadiness.decisionAction || {};
    const label = getOverviewDecisionPrimaryLabel(decisionAction, leader);
    return {
      key: "primary-next",
      label: "Next action",
      value: label,
      detail: `${truncateSupportText(getOverviewProductDisplayTitle(leader), 72)} is the proof surface to pressure-test now.`,
      action: "continue-decision",
      actionLabel: label,
      tone: "primary",
    };
  }

  const launcherKey = hierarchy.recommendedLauncher || getOverviewRecommendedLauncherKey();
  const launcher = snapshot?.launchers?.[launcherKey] || {};
  const launcherTitle = launcher.title || titleCase(launcherKey);
  return {
    key: "primary-next",
    label: "Next action",
    value: "Choose focus",
    detail: `${launcherTitle} is the strongest first axis before judging product proof.`,
    action: "choose-focus",
    actionLabel: "Choose focus",
    tone: "primary",
  };
}

function getOverviewSecondaryPathSummary(snapshot) {
  const readiness = snapshot?.readiness || {};
  const shortlist = readiness.shortlist || {};
  const routine = readiness.routine || {};
  const learn = readiness.learn || {};
  const hierarchy = getOverviewHierarchyState(snapshot);
  const parts = [
    Number(shortlist.count || 0) > 0 ? `${shortlist.count} saved` : "Shortlist waiting",
    routine.status || "Routine forming",
    learn.matchLabel || learn.status || "Learn broad",
  ].filter(Boolean);
  const action = hierarchy.mode !== "focused"
    ? { action: "open-article-library", actionLabel: "Review context" }
    : Number(shortlist.count || 0) > 0
    ? { action: "open-shortlist", actionLabel: "Open Shortlist" }
    : hasOverviewRoutineSignal(routine)
      ? { action: "open-routine", actionLabel: routine.actionLabel || "Check routine" }
      : learn.articleId
        ? { action: "open-article", articleId: learn.articleId, actionLabel: learn.actionLabel || "Open Learn" }
        : { action: "open-article-library", actionLabel: "Open Learn" };
  return {
    key: "secondary-paths",
    label: "Secondary paths",
    value: "Shortlist · Routine · Learn",
    detail: truncateSupportText(parts.join(" · "), 132),
    tone: "secondary",
    ...action,
  };
}

function applyOverviewHierarchyState(snapshot) {
  const hierarchy = getOverviewHierarchyState(snapshot);
  const overviewShell = overviewPanel?.closest(".shell-view-overview");
  [overviewPanel, overviewShell].forEach((element) => {
    if (!element) return;
    element.dataset.overviewState = hierarchy.mode;
    element.dataset.overviewRecommended = hierarchy.recommendedLauncher || "";
    element.classList.toggle("is-overview-focused", hierarchy.mode === "focused");
    element.classList.toggle("is-overview-broad", hierarchy.mode !== "focused");
  });
  return hierarchy;
}

function isOverviewEvidenceMeaningful(entry) {
  const value = String(entry?.value || "").trim().toLowerCase();
  if (!value || value === "0" || value === "0 groups" || value === "directional only") return false;
  return !/^(no |none\b|waiting\b|loading\b)/i.test(value);
}

function isOverviewDecisionEntryThin(entry, product) {
  const comparisonCue = String(entry?.comparisonCue || "").toLowerCase();
  const hasExactRetailerCheck = comparisonCue.includes("exact");
  const hasReviewSignal = typeof product?.rating === "number" && Number(product?.reviewCount || 0) > 0;
  const hasReadableProof = Boolean(String(entry?.reason || "").trim() && String(entry?.caution || "").trim());
  return !hasReadableProof || (!hasExactRetailerCheck && !hasReviewSignal);
}

function isOverviewWorkingSummaryItemMeaningful(item, snapshot) {
  if (!item) return false;
  const readiness = snapshot?.readiness || {};
  if (item.key === "case" || item.key === "primary-next" || item.key === "secondary-paths") return true;
  if (item.key === "retailer") return Boolean(snapshot?.retailerBoard?.winner?.retailer);
  if (item.key === "shortlist") return Number(readiness.shortlist?.count || 0) > 0;
  if (item.key === "routine") return hasOverviewRoutineSignal(readiness.routine || {});
  if (item.key === "learn") return Boolean(readiness.learn?.articleId);
  return true;
}

function syncOverviewDecisionPanelVisibility() {
  const overviewLivePanel = overviewDecisionBoard?.closest(".overview-live-panel");
  const overviewEvidencePanel = heroStats?.closest(".overview-evidence-panel");
  const overviewNextPanel = topConcerns?.closest(".overview-next-panel");
  const overviewDecisionPanel = overviewDecisionBoard?.closest(".overview-decision-panel");
  const hasVisiblePanel = [overviewLivePanel, overviewEvidencePanel, overviewNextPanel, overviewProofLock, overviewProofHandoff].some(
    (panel) => panel && !panel.hidden,
  );
  setOverviewSectionHidden(overviewDecisionPanel, !hasVisiblePanel);
}

export function getOverviewWorkingSummaryItems(snapshot) {
  const caseData = snapshot.case || {};
  const summary = snapshot.summary || {};
  const retailerBoard = snapshot.retailerBoard || {};
  const readiness = snapshot.readiness || {};
  const winner = retailerBoard.winner || null;
  const retailerCanApply = Boolean(winner?.retailer) && !["directional", "thin"].includes(retailerBoard.confidenceTone);
  const count = Number.isFinite(summary.filteredCount) ? summary.filteredCount : filterProducts().length;
  const caseValue = getOverviewCaseDisplayTitle(snapshot);
  const hierarchy = getOverviewHierarchyState(snapshot);
  const primaryNext = getOverviewPrimaryNextAction(snapshot, hierarchy);
  const secondaryPaths = getOverviewSecondaryPathSummary(snapshot);
  const retailerActionReady = retailerCanApply;
  return [
    {
      key: "case",
      label: "Case state",
      value: caseValue,
      detail: `${hierarchy.label} · ${count.toLocaleString()} active match${count === 1 ? "" : "es"} · ${caseData.retailer || "All retailers"}`,
      action: "open-catalog",
      actionLabel: "Open Catalog",
      tone: "case",
    },
    primaryNext,
    {
      key: "retailer",
      label: "Retailer winner",
      value: winner?.retailer || "Not ready",
      detail: retailerBoard.confidenceLabel || "Store signal still forming",
      action: retailerActionReady ? "apply-retailer" : "open-retailer-workspace",
      actionLabel: retailerActionReady ? "Use retailer" : "Compare stores",
      retailer: retailerActionReady ? winner.retailer : null,
      tone: retailerBoard.confidenceTone || "directional",
    },
    secondaryPaths,
  ];
}

export function renderOverviewWorkingSummary(snapshot) {
  if (!overviewWorkingSummary) return;
  const items = getOverviewWorkingSummaryItems(snapshot).filter((item) => isOverviewWorkingSummaryItemMeaningful(item, snapshot));
  const hasUsefulSummary = items.length > 0;
  setOverviewSectionHidden(overviewWorkingSummary, !hasUsefulSummary);
  if (!hasUsefulSummary) {
    overviewWorkingSummary.innerHTML = "";
    return;
  }
  overviewWorkingSummary.innerHTML = items
    .map((item) => {
      const valueAttr = item.articleId
        ? ` data-article-id="${escapeHtml(item.articleId)}"`
        : item.retailer
          ? ` data-retailer="${escapeHtml(item.retailer)}"`
          : item.productId
            ? ` data-product-id="${escapeHtml(item.productId)}"`
          : "";
      const actionAttr = item.launch
        ? `data-overview-launch="${escapeHtml(item.launch)}"`
        : item.action
          ? `data-overview-action="${escapeHtml(item.action)}"${valueAttr}`
          : "";
      return `
        <article class="overview-summary-item" data-overview-summary="${escapeHtml(item.key)}" data-summary-tone="${escapeHtml(item.tone || "neutral")}">
          <span class="overview-summary-label">${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
          <small>${escapeHtml(item.detail || "")}</small>
          ${actionAttr ? `<button class="overview-summary-action" type="button" ${actionAttr}>${escapeHtml(item.actionLabel || "Open")}</button>` : ""}
        </article>
      `;
    })
    .join("");
}

export function renderOverviewScope(snapshot) {
  if (!overviewScopeStrip) return;
  const caseData = snapshot.case || {};
  const summary = snapshot.summary || {};
  const count = Number.isFinite(summary.filteredCount) ? summary.filteredCount : filterProducts().length;
  const hasCatalogSignal = count > 0;
  const savedProfile = getSavedUserProfileRecord();
  const lensTitle = getProfileLabel(savedProfile.profile);
  const lensDetail = [
    getVisibleLensGoalLabel(savedProfile),
    getBudgetLabel(savedProfile.budget),
  ]
    .filter(Boolean)
    .join(" · ");
  const pathTitle = getOverviewCaseDisplayTitle(snapshot);
  const scopeItems = [
    {
      label: "Skin lens",
      value: lensTitle,
      detail: lensDetail,
      action: "edit-lens",
      actionLabel: "Edit",
      meaningful: Boolean(lensTitle),
    },
    {
      label: "Case path",
      value: pathTitle,
      detail: isOverviewBroadPath(caseData.path) ? "Current broad catalog view" : "Active current-case path",
      meaningful: Boolean(pathTitle && (!isOverviewBroadPath(pathTitle) || hasCatalogSignal)),
    },
    {
      label: "Retailer",
      value: caseData.retailer || "All retailers",
      detail: "Store path still open",
      meaningful: Boolean(caseData.retailer && caseData.retailer !== "All retailers"),
    },
    {
      label: "Fixture set",
      value: `${count.toLocaleString()} match${count === 1 ? "" : "es"}`,
      detail: "Matches in active case",
      meaningful: hasCatalogSignal,
    },
  ].filter((item) => item.meaningful);
  setOverviewSectionHidden(overviewScopeStrip, !scopeItems.length);
  if (!scopeItems.length) {
    overviewScopeStrip.innerHTML = "";
    return;
  }
  overviewScopeStrip.innerHTML = scopeItems
    .map(
      (item) => `
        <article class="overview-scope-item${item.action ? " overview-scope-item-action" : ""}">
          <div class="overview-scope-copy">
            <span>${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(item.value)}</strong>
            <small>${escapeHtml(item.detail || "")}</small>
          </div>
          ${
            item.action
              ? `<button class="overview-scope-edit" type="button" data-overview-action="${escapeHtml(item.action)}">${escapeHtml(item.actionLabel || "Edit")}</button>`
              : ""
          }
        </article>
      `,
    )
    .join("");
}

export function getOverviewCompactLauncherProof(launcherKey, entry) {
  const proof = String(entry?.proof || "");
  const title = String(entry?.title || "");
  const count =
    Number.isFinite(Number(entry?.count)) && Number(entry.count) > 0
      ? Number(entry.count).toLocaleString()
      : proof.match(/[\d,]+/)?.[0] || "";
  if (!count) return proof;
  if (launcherKey === "concern" && title) {
    return `Switch to ${title} · ${count} catalog matches`;
  }
  if (launcherKey === "budget") {
    return `Switch to Under $50 · ${count} catalog matches`;
  }
  if (launcherKey === "ingredient" && title) {
    return `Switch to ${title} · ${count} catalog matches`;
  }
  if (launcherKey === "retailer" && title) {
    return `Switch to ${title} · ${count} catalog matches`;
  }
  return proof;
}

export function renderOverviewLaunchers(snapshot) {
  const launchers = snapshot.launchers || {};
  const recommendedLauncher = getOverviewHierarchyState(snapshot).recommendedLauncher;
  overviewLauncherCards.forEach((card) => {
    const isRecommended = card.dataset.overviewLaunch === recommendedLauncher;
    card.classList.toggle("is-recommended", isRecommended);
    card.setAttribute("aria-current", isRecommended ? "step" : "false");
  });
  overviewLauncherTitles.forEach((node) => {
    const entry = launchers[node.dataset.launcherTitle];
    if (!entry?.title) return;
    node.textContent = entry.title;
  });
  overviewLauncherProofs.forEach((node) => {
    const launcherKey = node.dataset.launcherProof;
    const entry = launchers[launcherKey];
    if (!entry) return;
    node.textContent = getOverviewCompactLauncherProof(launcherKey, entry);
  });
}

export function renderOverviewActionLaunchers(snapshot) {
  const shortlistReadiness = snapshot.readiness?.shortlist || {};
  const routineReadiness = snapshot.readiness?.routine || {};
  const learnReadiness = snapshot.readiness?.learn || {};
  const hierarchy = getOverviewHierarchyState(snapshot);
  const broadMode = hierarchy.mode !== "focused";
  const hasSavedSet = Number(shortlistReadiness.count || 0) > 0;
  const leader = getOverviewBoardProduct(snapshot.decisionBoard?.entries?.[0]);
  const shortlistPrimaryLabel = getOverviewDecisionPrimaryLabel(shortlistReadiness.decisionAction || {}, leader);
  const actionCopy = {
    "open-shortlist": {
      title: broadMode ? "Choose focus" : shortlistReadiness.actionBadge || (hasSavedSet ? "Approve set" : "Save leader"),
      proof: broadMode
        ? "Pick a case axis before saving"
        : shortlistPrimaryLabel || (hasSavedSet ? "Review saved picks" : "Save leader"),
    },
    "open-routine": {
      title: broadMode ? "Starting point" : routineReadiness.ready && hasSavedSet ? "Continue routine" : "Plan routine",
      proof: broadMode
        ? "Secondary pressure test"
        : routineReadiness.actionLabel || "Plan core steps",
    },
    "open-article-library": {
      title: broadMode ? "Explore path" : learnReadiness.articleId ? "Read case note" : "Open Learn",
      proof: broadMode
        ? learnReadiness.matchLabel || "Directional evidence"
        : learnReadiness.actionLabel || learnReadiness.matchLabel || "Open evidence notes",
    },
  };
  overviewActionLauncherTitles.forEach((node) => {
    const entry = actionCopy[node.dataset.overviewActionTitle];
    if (entry?.title) node.textContent = entry.title;
    const actionButton = node.closest("[data-overview-action]");
    if (actionButton && node.dataset.overviewActionTitle) {
      actionButton.dataset.overviewAction = broadMode ? "choose-focus" : node.dataset.overviewActionTitle;
    }
  });
  overviewActionLauncherProofs.forEach((node) => {
    const entry = actionCopy[node.dataset.overviewActionProof];
    if (entry?.proof) node.textContent = entry.proof;
  });
}

export function renderOverviewStats(snapshot) {
  if (!heroStats) return;
  const evidencePanel = heroStats.closest(".overview-evidence-panel");
  const evidence = (snapshot.summary?.evidence || []).filter(isOverviewEvidenceMeaningful);
  setOverviewSectionHidden(evidencePanel, !evidence.length);
  setOverviewSectionHidden(heroStats, !evidence.length);
  if (!evidence.length) {
    heroStats.innerHTML = "";
    return;
  }
  heroStats.innerHTML = evidence
    .map(
      (entry) => `
        <article class="stat">
          <strong>${escapeHtml(entry.value)}</strong>
          <span>${escapeHtml(entry.label)}</span>
          ${entry.detail ? `<small>${escapeHtml(entry.detail)}</small>` : ""}
        </article>
      `,
    )
    .join("");
}

function getOverviewRenderedFocusKey(hierarchy = getOverviewHierarchyState(), routingState = getOverviewRoutingState()) {
  const selectedFocus = getOverviewFocusPath(state.ui.overviewSelectedFocus);
  if (selectedFocus) return selectedFocus.key;
  if (hierarchy.mode === "focused") {
    if (state.browseLaneKey === "under-50") return "under-50";
    if (state.ingredient === "ceramides") return "ceramide-support";
    if (state.concern === "dryness") return "dryness-barrier";
  }
  return routingState.suggestedFocusKey || "dryness-barrier";
}

function getOverviewIntakeState(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  const routingState = hierarchy.routingState || getOverviewRoutingState();
  const concernText = routingState.concernText;
  const focused = hierarchy.mode === "focused";
  const parsed = routingState.parsed || focused;
  const focusKey = getOverviewRenderedFocusKey(hierarchy, routingState);
  const focus = getOverviewFocusPath(focusKey);
  return {
    ...routingState,
    concernText,
    parsed,
    focused,
    focus,
    focusKey,
    heardKeys: routingState.heardKeys || getOverviewHeardChipKeys(concernText),
  };
}

export function renderOverviewIntake(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  const intake = getOverviewIntakeState(snapshot, hierarchy);
  if (overviewConcernInput && document.activeElement !== overviewConcernInput) {
    overviewConcernInput.value = intake.concernText;
  }
  if (overviewPrimaryAction) {
    overviewPrimaryAction.textContent = intake.focused ? "Focus selected" : intake.primaryLabel || "Analyze concern";
    overviewPrimaryAction.disabled = intake.focused;
  }
  if (overviewConcernValidation) {
    const message = state.ui.overviewConcernValidation || "";
    overviewConcernValidation.textContent = message;
    overviewConcernValidation.hidden = !message;
  }
}

export function renderOverviewFocusDeck(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  if (!overviewFocusPanel || !overviewFocusDeck) return;
  const intake = getOverviewIntakeState(snapshot, hierarchy);
  setOverviewSectionHidden(overviewFocusPanel, false);
  const selectedKey = intake.focused ? intake.focusKey : "";
  if (intake.handoff) {
    const handoff = intake.handoff;
    overviewFocusDeck.innerHTML = `
      <article class="overview-focus-card overview-focus-card-handoff is-recommended" data-route-kind="${escapeHtml(intake.status)}">
        <div class="overview-focus-card-head">
          <span>${escapeHtml(handoff.kicker)}</span>
          <strong>${escapeHtml(intake.status === "safety-handoff" ? "Proof paused" : "Handoff")}</strong>
        </div>
        <h3>${escapeHtml(handoff.title)}</h3>
        <p>${escapeHtml(handoff.why)}</p>
        <div class="overview-focus-unlock">${escapeHtml(handoff.unlocks)}</div>
        <div class="overview-focus-card-actions">
          <button class="overview-action-button primary" type="button" data-overview-route-action="${escapeHtml(handoff.primaryAction)}">${escapeHtml(handoff.primaryLabel)}</button>
          <button class="overview-action-button" type="button" data-overview-route-action="${escapeHtml(handoff.secondaryAction)}">${escapeHtml(handoff.secondaryLabel)}</button>
        </div>
      </article>
    `;
    return;
  }
  overviewFocusDeck.innerHTML = OVERVIEW_FOCUS_PATHS.map((focus) => {
    const selected = selectedKey === focus.key;
    const suggested = intake.focusKey === focus.key;
    const recommended = focus.key === (intake.suggestedFocusKey || intake.focusKey);
    return `
      <article class="overview-focus-card${recommended ? " is-recommended" : ""}${selected ? " is-selected" : ""}">
        <div class="overview-focus-card-head">
          <span>${escapeHtml(recommended ? "Suggested" : focus.kicker)}</span>
          ${selected ? `<strong>Selected</strong>` : suggested ? `<strong>Suggested</strong>` : ""}
        </div>
        <h3>${escapeHtml(focus.title)}</h3>
        <p>${escapeHtml(focus.why)}</p>
        <div class="overview-focus-unlock">${escapeHtml(focus.unlocks)}</div>
        <button class="overview-action-button" type="button" data-overview-focus-action="${escapeHtml(focus.key)}">${escapeHtml(selected ? "Use this focus" : focus.actionLabel)}</button>
      </article>
    `;
  }).join("");
}

export function renderOverviewRoutingPanel(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  if (!overviewRoutingPanel) return;
  const intake = getOverviewIntakeState(snapshot, hierarchy);
  const shopperText = intake.concernText || "Waiting for one concern.";
  if (overviewShopperSaid) {
    overviewShopperSaid.textContent = shopperText;
  }
  if (overviewHeardChips) {
    const chips = intake.heardKeys.length ? intake.heardKeys : ["waiting"];
    overviewHeardChips.innerHTML = chips
      .map((key) => `<span data-heard-chip="${escapeHtml(key)}">${escapeHtml(key === "waiting" ? "Waiting" : getOverviewHeardChipLabel(key))}</span>`)
      .join("");
  }
  if (overviewSafetyGate) {
    overviewSafetyGate.dataset.safetyState = intake.safetyTone || "idle";
    overviewSafetyGate.innerHTML = `
      <span>Safety gate</span>
      <p>${escapeHtml(intake.safetyCopy || OVERVIEW_NEUTRAL_SAFETY_GATE_COPY)}</p>
    `;
  }
  if (overviewSuggestedFocus) {
    overviewSuggestedFocus.textContent = intake.suggestedLabel || "Waiting for concern";
  }
  if (overviewRoutingAction) {
    overviewRoutingAction.removeAttribute("data-overview-focus-action");
    overviewRoutingAction.removeAttribute("data-overview-route-action");
    overviewRoutingAction.disabled = false;
    if (!intake.parsed) {
      overviewRoutingAction.textContent = "Waiting for concern";
      overviewRoutingAction.disabled = true;
    } else if (intake.focused) {
      overviewRoutingAction.textContent = "Focus selected";
      overviewRoutingAction.disabled = true;
    } else if (intake.handoff?.primaryAction) {
      overviewRoutingAction.textContent = intake.handoff.primaryLabel;
      overviewRoutingAction.dataset.overviewRouteAction = intake.handoff.primaryAction;
    } else if (intake.proofCapable && intake.suggestedFocusKey) {
      overviewRoutingAction.textContent = `Use ${intake.suggestedLabel}`;
      overviewRoutingAction.dataset.overviewFocusAction = intake.suggestedFocusKey;
    } else {
      overviewRoutingAction.textContent = "Open Catalog focus";
      overviewRoutingAction.disabled = true;
    }
  }
}

export function renderOverviewMobilePrimary(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  if (!overviewMobilePrimaryAction) return;
  const intake = getOverviewIntakeState(snapshot, hierarchy);
  const leader = getOverviewBoardProduct(snapshot.decisionBoard?.entries?.[0]);
  overviewMobilePrimaryAction.removeAttribute("data-overview-action");
  overviewMobilePrimaryAction.removeAttribute("data-product-id");
  overviewMobilePrimaryAction.removeAttribute("data-overview-route-action");
  overviewMobilePrimaryAction.dataset.overviewIntakeAction = "primary";

  if (intake.focused && leader?.id) {
    delete overviewMobilePrimaryAction.dataset.overviewIntakeAction;
    const saved = state.favoriteIds.includes(leader.id);
    overviewMobilePrimaryAction.dataset.overviewAction = saved ? "open-shortlist" : "save-product-core";
    if (!saved) overviewMobilePrimaryAction.dataset.productId = leader.id;
    overviewMobilePrimaryAction.textContent = saved ? "Open Shortlist" : "Save best match";
    if (overviewMobilePrimaryMeta) overviewMobilePrimaryMeta.textContent = "Shortlist owns product questions";
    return;
  }

  if (intake.handoff?.primaryAction) {
    delete overviewMobilePrimaryAction.dataset.overviewIntakeAction;
    overviewMobilePrimaryAction.dataset.overviewRouteAction = intake.handoff.primaryAction;
    overviewMobilePrimaryAction.textContent = intake.handoff.primaryLabel;
    if (overviewMobilePrimaryMeta) {
      overviewMobilePrimaryMeta.textContent = intake.status === "safety-handoff" ? "Proof paused" : "Handoff path";
    }
    return;
  }

  overviewMobilePrimaryAction.textContent = intake.primaryLabel || "Analyze concern";
  if (overviewMobilePrimaryMeta) {
    overviewMobilePrimaryMeta.textContent = intake.parsed ? "Select focus to unlock proof" : "1 step before products";
  }
}

export function renderOverviewProofLock(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  if (!overviewProofLock) return;
  const intake = getOverviewIntakeState(snapshot, hierarchy);
  const locked = hierarchy.mode !== "focused";
  setOverviewSectionHidden(overviewProofLock, !locked);
  if (!locked) {
    overviewProofLock.innerHTML = "";
    return;
  }
  const lockTitle =
    intake.status === "safety-handoff"
      ? "Proof is paused."
      : intake.handoff
        ? "Proof stays in the handoff path."
        : intake.parsed
          ? "Proof is ready to unlock."
          : "Product proof stays locked.";
  const lockCopy =
    intake.status === "safety-handoff"
      ? "Use Routine Check or Learn before adding product proof for this concern."
      : intake.handoff
        ? "Open Catalog or Learn for this route; Overview proof is limited to supported focus paths."
        : intake.parsed
          ? "Use a focus first; then Overview will show only best match, safer backup, and value pick."
          : "Start with one concern. Named product cards do not appear until the path is selected.";
  overviewProofLock.innerHTML = `
    <span>After focus</span>
    <strong>${escapeHtml(lockTitle)}</strong>
    <p>${escapeHtml(lockCopy)}</p>
    <div class="overview-proof-slot-row" aria-label="Locked product proof slots">
      <article class="overview-proof-slot">
        <span>Slot 1</span>
        <strong>Leader slot</strong>
        <small>Unlocked after focus</small>
      </article>
      <article class="overview-proof-slot">
        <span>Slot 2</span>
        <strong>Safer backup</strong>
        <small>Same job, lower risk</small>
      </article>
      <article class="overview-proof-slot">
        <span>Slot 3</span>
        <strong>Value pick</strong>
        <small>Price tradeoff visible</small>
      </article>
    </div>
  `;
}

export function renderOverviewProofHandoff(snapshot, hierarchy = getOverviewHierarchyState(snapshot)) {
  if (!overviewProofHandoff) return;
  const focused = hierarchy.mode === "focused";
  setOverviewSectionHidden(overviewProofHandoff, !focused);
  if (!focused) {
    overviewProofHandoff.innerHTML = "";
    return;
  }
  overviewProofHandoff.innerHTML = `
    <div>
      <span>After first save</span>
      <strong>Leave Overview for product-specific questions.</strong>
    </div>
    <div class="overview-proof-handoff-actions">
      <button class="overview-action-button" type="button" data-overview-action="open-shortlist">Ask in Shortlist</button>
      <button class="overview-action-button" type="button" data-overview-action="open-routine">Routine Check</button>
      <button class="overview-action-button" type="button" data-overview-action="open-article-library">Learn basics</button>
    </div>
  `;
}

export function getOverviewProductInitials(product = {}) {
  const brandInitial = String(product.brand || "").trim().charAt(0);
  const nameInitial = String(product.name || "")
    .trim()
    .split(/\s+/)
    .find((word) => /^[a-z0-9]/i.test(word))
    ?.charAt(0);
  const initials = `${brandInitial}${nameInitial || ""}`.trim().toUpperCase();
  return initials || "SK";
}

export function renderOverviewDecisionBoard(snapshot) {
  if (!overviewDecisionBoard) return;
  const livePanel = overviewDecisionBoard.closest(".overview-live-panel");
  const hierarchy = getOverviewHierarchyState(snapshot);
  renderOverviewProofLock(snapshot, hierarchy);
  const entries = hierarchy.mode === "focused" ? (snapshot.decisionBoard?.entries || []).slice(0, 3) : [];
  if (hierarchy.mode !== "focused") {
    setOverviewSectionHidden(livePanel, false);
    setOverviewSectionHidden(overviewDecisionBoard, true);
    overviewDecisionBoard.innerHTML = "";
    renderOverviewProofHandoff(snapshot, hierarchy);
    return;
  }
  if (!entries.length) {
    setOverviewSectionHidden(livePanel, true);
    setOverviewSectionHidden(overviewDecisionBoard, true);
    overviewDecisionBoard.innerHTML = "";
    return;
  }
  setOverviewSectionHidden(livePanel, false);
  setOverviewSectionHidden(overviewDecisionBoard, false);
  overviewDecisionBoard.innerHTML = entries
    .map((entry) => {
      const product = entry.product || entry;
      if (!product?.id) return "";
      const isPrimaryLeader = entry.key === "best-first" || /leader|first/i.test(entry.label || "");
      const promoteLeaderAction = isPrimaryLeader;
      const evidenceThin = isOverviewDecisionEntryThin(entry, product);
      const productTitle = getOverviewProductDisplayTitle(product);
      const imageUrl = String(product.image || "").trim();
      const targetStatus = entry.shortlistStatus || (isPrimaryLeader ? "core" : "optional");
      const currentStatus = getShortlistStatus(product.id);
      const isSaved = state.favoriteIds.includes(product.id);
      const saveAction = isPrimaryLeader && isSaved
          ? "open-shortlist"
        : targetStatus === "core"
          ? "save-product-core"
          : targetStatus === "optional"
            ? "save-product-optional"
            : "save-product-support";
      const contextItems = getOverviewDecisionContextItems(product, entry);
      const saveLabel = isPrimaryLeader && isSaved
          ? "Open Shortlist"
        : isSaved
        ? currentStatus === targetStatus
          ? "Open Shortlist"
          : targetStatus === "core"
            ? "Make champion"
            : targetStatus === "optional"
              ? "Make backup"
              : "Move to hold"
        : targetStatus === "core"
          ? "Save leader"
          : targetStatus === "optional"
            ? "Save backup"
            : "Save support";
      const primaryActionProductAttr = saveAction === "open-shortlist"
        ? ""
        : ` data-product-id="${escapeHtml(product.id)}"`;
      const decisionReason = entry.reason || "This remains the strongest decision fit in the current focus.";
      const decisionCaution = entry.caution || "Comparison depth is still limited in this slice.";
      const explainerKey = `decision:${entry.key || product.id}`;
      const explainerOpen = state.ui.activeOverviewExplainer === explainerKey;
      const saveButton = `<button class="overview-action-button${promoteLeaderAction ? " primary" : ""}" type="button" data-overview-action="${saveAction}"${primaryActionProductAttr}>${escapeHtml(saveLabel)}</button>`;
      return `
        <article class="overview-decision-card${isPrimaryLeader ? " is-primary-leader" : ""}">
          <div class="overview-decision-topline">
            <span class="overview-decision-label">${escapeHtml(entry.label)}</span>
            ${promoteLeaderAction ? `<span class="overview-next-step-chip">${escapeHtml(evidenceThin ? "Proof check" : "Best next check")}</span>` : ""}
            <span class="overview-summary-chip">${escapeHtml(product.retailer || "Retailer mixed")}</span>
          </div>
          <div class="overview-decision-product">
            <div class="overview-product-thumb" data-overview-product-image="${escapeHtml(imageUrl)}">
              <img class="overview-product-thumb-image" alt="${escapeHtml(productTitle)}" hidden>
              <span class="overview-product-thumb-fallback" aria-hidden="true">${escapeHtml(getOverviewProductInitials(product))}</span>
            </div>
            <div class="overview-decision-copy">
              <strong class="overview-decision-title" title="${escapeHtml(productTitle)}">${escapeHtml(productTitle)}</strong>
              <div class="overview-decision-meta">
                <span>${escapeHtml(money(product.price))}</span>
                <span>${escapeHtml(product.retailer || "Retailer mixed")}</span>
                <span>${escapeHtml(titleCase(product.category || "product"))}</span>
                <span>${escapeHtml(entry.comparisonCue || "Retailer check stays directional")}</span>
              </div>
            </div>
          </div>
          <div class="overview-product-context" aria-label="Catalog context for ${escapeHtml(productTitle)}">
            ${contextItems
              .map(
                (item) => `
                  <span>
                    <small>${escapeHtml(item.label)}</small>
                    <strong>${escapeHtml(item.value)}</strong>
                  </span>
                `,
              )
              .join("")}
          </div>
          <p class="overview-decision-reason"><strong>Why this card exists</strong> ${escapeHtml(decisionReason)}</p>
          <p class="overview-decision-caution"><strong>Watchout</strong> ${escapeHtml(decisionCaution)}</p>
          <div class="overview-decision-actions">
            ${saveButton}
            <button class="overview-action-button" type="button" data-overview-explain="${escapeHtml(explainerKey)}">Why this pick</button>
            <button class="overview-action-button" type="button" data-overview-action="find-product" data-product-id="${escapeHtml(product.id)}">Compare</button>
            <button class="overview-action-button" type="button" data-overview-action="plan-product" data-product-id="${escapeHtml(product.id)}">Routine Check</button>
          </div>
          ${
            explainerOpen
              ? `<div class="overview-explainer"><p class="overview-explainer-body">${escapeHtml(`Watch for ${decisionCaution.replace(/^Watch\\s+/i, "").replace(/\\.$/, "")}. ${decisionReason}`)}</p></div>`
              : ""
          }
        </article>
      `;
    })
    .filter(Boolean)
    .join("");
  overviewDecisionBoard.querySelectorAll(".overview-decision-caution strong").forEach((label) => {
    label.textContent = "Watch";
  });
  overviewDecisionBoard.querySelectorAll(".overview-product-thumb").forEach((container) => {
    const image = container.querySelector(".overview-product-thumb-image");
    applyProductImage(image, container.dataset.overviewProductImage, { container });
  });
  renderOverviewProofHandoff(snapshot, hierarchy);
}

export function renderOverviewTemplates(snapshot) {
  if (!quickConcerns) return;
  const templateCard = getOverviewMosaicCard(quickConcerns);
  const templates = getVisibleOverviewTemplates(snapshot);
  if (!templates.length) {
    quickConcerns.innerHTML = "";
    setOverviewSectionHidden(quickConcerns, true);
    setOverviewSectionHidden(templateCard, true);
    syncOverviewMosaicVisibility();
    return;
  }
  setOverviewSectionHidden(templateCard, false);
  setOverviewSectionHidden(quickConcerns, false);
  quickConcerns.innerHTML = templates
    .map(
      (template) => `
        <button class="overview-template-pill quick-pill" type="button" data-overview-template="${escapeHtml(template.key)}">
          <strong>${escapeHtml(template.label)}</strong>
          <span>${escapeHtml(template.copy)}</span>
          <span>${escapeHtml(template.status)}</span>
        </button>
      `,
    )
    .join("");
  syncOverviewMosaicVisibility();
}

export function renderOverviewRetailerBoard(snapshot) {
  if (!retailerCoverage) return;
  const retailerCard = getOverviewMosaicCard(retailerCoverage);
  const hierarchy = getOverviewHierarchyState(snapshot);
  const winner = snapshot.retailerBoard?.winner || null;
  const runnerUp = snapshot.retailerBoard?.runnerUp || null;
  if (!winner || !shouldShowOverviewRetailerMosaic(snapshot)) {
    setOverviewSectionHidden(retailerCoverage, true);
    setOverviewSectionHidden(retailerCard, true);
    retailerCoverage.innerHTML = "";
    syncOverviewMosaicVisibility();
    return;
  }
  setOverviewSectionHidden(retailerCard, false);
  setOverviewSectionHidden(retailerCoverage, false);
  const winnerExplainOpen = state.ui.activeOverviewExplainer === "retailer:winner";
  const runnerExplainOpen = state.ui.activeOverviewExplainer === "retailer:runner-up";
  const winnerSignature = winner.signature || getRetailerSignature(winner.retailer);
  const runnerSignature = runnerUp?.signature || (runnerUp ? getRetailerSignature(runnerUp.retailer) : null);
  const canApplyRetailer =
    hierarchy.mode === "focused" &&
    state.retailer !== "all" &&
    !["directional", "thin"].includes(snapshot.retailerBoard.confidenceTone);
  const retailerActionLabel = canApplyRetailer ? `Use ${winner.retailer}` : "Compare stores";
  const retailerActionAttr = canApplyRetailer
    ? `data-overview-action="apply-retailer" data-retailer="${escapeHtml(winner.retailer)}"`
    : `data-overview-action="open-retailer-workspace"`;
  retailerCoverage.innerHTML = `
    <article class="overview-retailer-summary">
      <div class="overview-retailer-subhead">
        <div>
          <span class="overview-retailer-label">Current fixture leader</span>
          <strong class="overview-retailer-title">${escapeHtml(winner.retailer)}</strong>
        </div>
        <span class="overview-retailer-chip" data-confidence-tone="${escapeHtml(snapshot.retailerBoard.confidenceTone || "directional")}">${escapeHtml(snapshot.retailerBoard.confidenceLabel || winnerSignature.badge)}</span>
      </div>
      <div class="overview-retailer-meta">
        <span>${escapeHtml(winnerSignature.badge)}</span>
        <span>${escapeHtml(`${winner.count} product${winner.count === 1 ? "" : "s"} in current case`)}</span>
        <span>${escapeHtml(winner.avgPrice != null ? `${money(winner.avgPrice)} avg` : "Average price mixed")}</span>
      </div>
      <p class="overview-retailer-reason"><strong>Why this fixture leads</strong> ${escapeHtml(winner.reason || winnerSignature.summary)}</p>
      <p class="overview-retailer-tradeoff"><strong>Watch</strong> ${escapeHtml(winner.tradeoff || winnerSignature.caution)}</p>
      <p class="overview-readiness-copy">${escapeHtml(snapshot.retailerBoard.overlapCopy || snapshot.retailerBoard.copy || "")}</p>
      <div class="overview-retailer-actions">
        <button class="overview-action-button${canApplyRetailer ? " primary" : ""}" type="button" ${retailerActionAttr}>${escapeHtml(retailerActionLabel)}</button>
        ${canApplyRetailer ? `<button class="overview-action-button" type="button" data-overview-action="open-retailer-workspace">Compare stores</button>` : ""}
        <button class="overview-action-button" type="button" data-overview-explain="retailer:winner">Why this fixture label</button>
        ${runnerUp ? `<button class="overview-action-button" type="button" data-overview-explain="retailer:runner-up">Why not the runner-up</button>` : ""}
      </div>
      ${
        winnerExplainOpen
          ? `<div class="overview-explainer"><p class="overview-explainer-body">${escapeHtml(`${winner.retailer} ranks first in this fictional fixture because ${(winner.reason || winnerSignature.summary).charAt(0).toLowerCase()}${(winner.reason || winnerSignature.summary).slice(1)} ${winner.tradeoff || winnerSignature.caution}`)}</p></div>`
          : ""
      }
      ${
        runnerUp && runnerExplainOpen
          ? `<div class="overview-explainer"><p class="overview-explainer-body">${escapeHtml(`${runnerUp.retailer} remains the fixture runner-up because ${(runnerUp.reason || runnerSignature?.summary || "it keeps useful coverage for this case").charAt(0).toLowerCase()}${(runnerUp.reason || runnerSignature?.summary || "it keeps useful coverage for this case").slice(1)} It trails because ${winner.retailer} ranks first on the current fictional fields.`)}</p></div>`
          : ""
      }
    </article>
    ${
      runnerUp
        ? `
          <div class="overview-metric">
            <strong>${escapeHtml(`Runner-up: ${runnerUp.retailer}`)}</strong>
            <span>${escapeHtml(runnerUp.tradeoff || runnerSignature?.caution || "Still viable, but weaker for this case right now.")}</span>
          </div>
        `
        : ""
    }
  `;
  syncOverviewMosaicVisibility();
}

export function renderOverviewReadiness(snapshot) {
  if (!topConcerns) return;
  const hierarchy = getOverviewHierarchyState(snapshot);
  const broadMode = hierarchy.mode !== "focused";
  const readiness = snapshot.readiness || {};
  const routineTimings = Array.isArray(readiness.routine?.timingSummary) ? readiness.routine.timingSummary : [];
  const nextPanel = topConcerns.closest(".overview-next-panel");
  const hasLeadAction = !broadMode && Boolean(readiness.shortlist?.decisionAction?.productId);
  const showShortlist = Number(readiness.shortlist?.count || 0) > 0 || hasLeadAction;
  const showRoutine = hasOverviewRoutineSignal(readiness.routine || {});
  const showLearn = Boolean(readiness.learn?.articleId);
  const focusActionAttr = `data-overview-action="choose-focus"`;
  const leader = getOverviewBoardProduct(snapshot.decisionBoard?.entries?.[0]);
  const savedLeader = Boolean(leader?.id && state.favoriteIds.includes(leader.id));
  const savedDecisionReadySet = !broadMode && Number(readiness.shortlist?.count || 0) > 0;
  const sections = [];

  if (showShortlist) {
    const shortlistPrimaryAction = broadMode
      ? focusActionAttr
      : leader?.id && !savedLeader
        ? `data-overview-action="save-product-core" data-product-id="${escapeHtml(leader.id)}"`
        : savedLeader
          ? `data-overview-action="open-shortlist"`
          : `data-overview-action="continue-decision"`;
    const shortlistPrimaryLabel = broadMode
      ? "Choose focus"
      : getOverviewDecisionPrimaryLabel(readiness.shortlist?.decisionAction || {}, leader);
    sections.push(`
      <article class="overview-readiness-section">
        <div class="overview-readiness-head">
          <div>
            <span class="overview-readiness-label">Shortlist readiness</span>
            <strong class="overview-readiness-title">${escapeHtml(readiness.shortlist?.count ? `${readiness.shortlist.count} saved` : "Ready to save leader")}</strong>
          </div>
          <span class="overview-readiness-status">${escapeHtml(readiness.shortlist?.status || "Next action ready")}</span>
        </div>
        <p class="overview-readiness-copy">${escapeHtml(readiness.shortlist?.copy || (broadMode ? "Save a starting point to start a reference set." : "Save the current leader to start a shortlist."))}</p>
        ${
          readiness.shortlist?.count
            ? `<p class="overview-readiness-copy"><strong>Status mix</strong> ${escapeHtml(readiness.shortlist?.statusText || "0 champion · 0 backup · 0 hold")}</p>`
            : ""
        }
        <div class="overview-learn-actions">
          <button class="overview-action-button" type="button" ${shortlistPrimaryAction}>${escapeHtml(shortlistPrimaryLabel)}</button>
          ${shortlistPrimaryAction.includes('data-overview-action="open-shortlist"') ? "" : `<button class="overview-action-button" type="button" data-overview-action="open-shortlist">Open Shortlist</button>`}
        </div>
      </article>
    `);
  }

  if (showRoutine) {
    const routineActionLabel = broadMode
      ? "Explore path"
      : savedDecisionReadySet && readiness.routine?.ready
        ? readiness.routine?.actionLabel || "Continue routine"
        : "Check routine gaps";
    const routineActionAttr = broadMode ? focusActionAttr : `data-overview-action="open-routine"`;
    sections.push(`
      <article class="overview-readiness-section">
        <div class="overview-readiness-head">
          <div>
            <span class="overview-readiness-label">Routine readiness</span>
            <strong class="overview-readiness-title">${escapeHtml(readiness.routine?.status || "Routine signal forming")}</strong>
          </div>
          <span class="overview-readiness-status">${escapeHtml(state.routineTime.toUpperCase())}</span>
        </div>
        <p class="overview-readiness-copy">${escapeHtml(readiness.routine?.copy || "The current case has enough routine signal to inspect next.")}</p>
        ${
          routineTimings.length
            ? `
              <div class="overview-routine-timing-row">
                ${routineTimings
                  .map(
                    (entry) => `
                      <span data-routine-ready="${entry.ready ? "true" : "false"}">
                        <small>${escapeHtml(entry.label)}</small>
                        <strong>${escapeHtml(entry.value)}</strong>
                      </span>
                    `,
                  )
                  .join("")}
              </div>
            `
            : ""
        }
        <div class="overview-learn-actions">
          <button class="overview-action-button" type="button" ${routineActionAttr}>${escapeHtml(routineActionLabel)}</button>
        </div>
      </article>
    `);
  }

  if (showLearn) {
    sections.push(`
      <article class="overview-readiness-section">
        <div class="overview-readiness-head">
          <div>
            <span class="overview-readiness-label">Learn match</span>
            <strong class="overview-readiness-title">${escapeHtml(readiness.learn?.title || "Learn match")}</strong>
          </div>
          <span class="overview-readiness-status" data-learn-match="${readiness.learn?.matched ? "exact" : readiness.learn?.articleId ? "useful" : "none"}">${escapeHtml(readiness.learn?.matchLabel || readiness.learn?.status || "Useful guide")}</span>
        </div>
        <p class="overview-readiness-copy">${escapeHtml(readiness.learn?.copy || "Open the best available evidence note for this case.")}</p>
        <div class="overview-learn-actions">
          <button class="overview-action-button" type="button" data-overview-action="open-article" data-article-id="${escapeHtml(readiness.learn.articleId)}">${escapeHtml(readiness.learn.actionLabel || "Open advice")}</button>
          ${
            !broadMode && readiness.learn?.journeyReady
              ? `<button class="overview-action-button" type="button" data-overview-action="shop-article" data-article-id="${escapeHtml(readiness.learn.articleId)}">Use this topic</button>`
              : ""
          }
        </div>
      </article>
    `);
  }

  setOverviewSectionHidden(nextPanel, !sections.length);
  setOverviewSectionHidden(topConcerns, !sections.length);
  topConcerns.innerHTML = sections.join("");
}

export function renderOverview(snapshot = buildOverviewSnapshot()) {
  const hierarchy = applyOverviewHierarchyState(snapshot);
  renderOverviewIntake(snapshot, hierarchy);
  renderOverviewFocusDeck(snapshot, hierarchy);
  renderOverviewRoutingPanel(snapshot, hierarchy);
  renderOverviewMobilePrimary(snapshot, hierarchy);
  if (spotlightTitle) {
    spotlightTitle.textContent = hierarchy.mode === "focused" ? "Three choices, three jobs." : "Proof unlocks after focus.";
  }
  if (spotlightCopy) {
    spotlightCopy.textContent = hierarchy.mode === "focused"
      ? "Use the three proof slots to save one product, compare in Catalog, or send routine questions to Routine Check."
      : "Products stay unnamed until a concern is parsed and a focus path is selected.";
  }
  renderOverviewScope(snapshot);
  renderOverviewWorkingSummary(snapshot);
  renderOverviewLaunchers(snapshot);
  renderOverviewActionLaunchers(snapshot);
  renderOverviewStats(snapshot);
  renderOverviewTemplates(snapshot);
  renderOverviewRetailerBoard(snapshot);
  renderOverviewReadiness(snapshot);
  syncOverviewMosaicVisibility();
  renderOverviewDecisionBoard(snapshot);
  syncOverviewDecisionPanelVisibility();
}

export function renderAdvisor(filtered, leadProduct = null) {
  const activeLane = getActiveBrowseLane();
  const explicitConcern = state.concern !== "all" ? state.concern : activeLane?.primaryConcern || null;
  const visibleGoalLabel = getVisibleLensGoalLabel();
  const hasExplicitLensGoal = visibleGoalLabel !== "Goal not set";
  const currentConcern = explicitConcern || (hasExplicitLensGoal ? normalizeCatalogRankingConcern(state.userProfile.goal) : "general care");
  const strategy = getConcernStrategy(currentConcern);
  const overall = leadProduct || getSpotlightProduct(filtered);
  const budget = pickTopProduct(filtered, scoreBudgetOverall);
  const activeFilters = describeFilters();
  const profileWarnings = getProfileWarnings();
  const decisionReady = isCatalogDecisionReady();
  const advisorPanel = document.querySelector("#shopping-brief-panel");
  const savedProducts = getShortlistSavedProducts();
  const shortlistSubset = getShortlistCoreFirstSubset();
  const shortlistFallback = shortlistSubset.length ? buildLocalBasketPlanPayload(shortlistSubset, "shortlist") : null;
  const shortlistPayload = shortlistSubset.length
    ? getActiveBasketPayload("shortlist", shortlistSubset, shortlistFallback) || shortlistFallback
    : null;
  const marketSnapshot = filtered.length ? getMarketViewSnapshot(filtered) : null;
  const primaryAction = getDecisionNextActionContext({
    leadProduct: decisionReady ? overall : null,
    savedProducts,
    marketSnapshot,
    shortlistPayload,
  });
  const primaryActionDisplay = getWorkspaceDecisionActionDisplay(primaryAction);

  advisorPanel?.setAttribute("data-case-readiness", decisionReady ? "focused" : "unfocused");

  const syncBriefActionButtons = (candidate = null) => {
    if (advisorSaveLeadButton) {
      advisorSaveLeadButton.disabled = false;
      advisorSaveLeadButton.dataset.productId = primaryAction.productId || "";
      advisorSaveLeadButton.dataset.decisionAction = primaryAction.key || "";
      advisorSaveLeadButton.dataset.workspaceSection = primaryAction.workspaceSection || "";
      advisorSaveLeadButton.textContent =
        primaryAction.key === "save-lead" && candidate?.id && state.favoriteIds.includes(candidate.id)
          ? "Open shortlist"
          : primaryActionDisplay.label;
    }

    if (advisorPlanLeadButton) {
      const leadRoutineStep = candidate ? getLeadRoutineStep(candidate) : null;
      advisorPlanLeadButton.disabled = decisionReady ? !leadRoutineStep : false;
      advisorPlanLeadButton.dataset.productId = candidate?.id || "";
      advisorPlanLeadButton.dataset.decisionAction = decisionReady ? "" : "focus-catalog-work";
      advisorPlanLeadButton.dataset.workspaceSection = decisionReady ? "" : "shopping-brief-panel";
      advisorPlanLeadButton.textContent = decisionReady
        ? leadRoutineStep
          ? "Draft routine fit"
          : "Routine fit unavailable"
        : "Choose focus first";
    }
  };

  if (!decisionReady) {
    advisorSummary.textContent =
      "Broad catalog is not decision-ready. Choose one product type, concern, ingredient, lane, or specific search before ranking with confidence.";
    if (advisorSessionSummary) {
      advisorSessionSummary.textContent = "Next useful decision: choose the focus that should make products comparable.";
    }
    advisorChips.innerHTML = "";
    const chipValues = activeFilters.length ? activeFilters : ["Broad catalog", `${getProfileLabel()} lens`];
    chipValues.slice(0, 4).forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "advisor-chip";
      chip.textContent = label;
      advisorChips.appendChild(chip);
    });
    advisorGuidance.innerHTML = `
      <article class="guidance-card">
        <span class="guidance-label">Focus builder</span>
        <strong>Pick the comparison axis</strong>
        <p>Choose a concern, product type, ingredient, lane, or a search like vitamin c serum before ranking products.</p>
      </article>
      <article class="guidance-card">
        <span class="guidance-label">Why it matters</span>
        <strong>Products need the same job</strong>
        <p>A cleanser, SPF, treatment, and moisturizer should not compete for one winner until the case says which job matters next.</p>
      </article>
      <article class="guidance-card">
        <span class="guidance-label">Action reason</span>
        <strong>${escapeHtml(primaryActionDisplay.label)}</strong>
        <p>${escapeHtml(primaryActionDisplay.detail)}</p>
      </article>
    `;
    advisorPicks.innerHTML = "";
    syncBriefActionButtons(null);
    return;
  }

  if (!filtered.length) {
    advisorSummary.textContent = "No products match this case yet.";
    if (advisorSessionSummary) {
      advisorSessionSummary.textContent = "Focused case has no candidate. Widen one constraint to reopen useful options.";
    }
    advisorChips.innerHTML = "";
    activeFilters.forEach((label) => {
      const chip = document.createElement("span");
      chip.className = "advisor-chip";
      chip.textContent = label;
      advisorChips.appendChild(chip);
    });
    advisorGuidance.innerHTML = `
      <article class="guidance-card">
        <span class="guidance-label">Next move</span>
        <strong>${escapeHtml(primaryActionDisplay.label)}</strong>
        <p>${escapeHtml(primaryActionDisplay.detail)}</p>
      </article>
    `;
    advisorPicks.innerHTML = "";
    syncBriefActionButtons(null);
    return;
  }

  const leadIn = state.userProfile.name.trim() ? `${state.userProfile.name}, ` : "";
  const advisorGoalLabel = explicitConcern ? titleCase(explicitConcern) : hasExplicitLensGoal ? visibleGoalLabel : "";
  const goalCopy = advisorGoalLabel ? ` for ${advisorGoalLabel.toLowerCase()}` : "";
  advisorSummary.textContent = `${leadIn}${filtered.length} focused products are in view. ${
    activeLane
      ? `${activeLane.label} is pulling the clearest candidate board.`
      : state.profile === "all"
        ? `These are the clearest candidate fits${goalCopy} across retailers.`
        : `${getProfileLabel()} is narrowing the strongest candidate fits${goalCopy}.`
  }`;
  if (advisorSessionSummary) {
    advisorSessionSummary.textContent = overall
      ? `${overall.brand} ${overall.name} is the best candidate right now.`
      : "This focused view is ready for a candidate call.";
  }

  advisorChips.innerHTML = "";
  const chipValues = activeFilters.length ? activeFilters : ["Across stores"];
  chipValues.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "advisor-chip";
    chip.textContent = label;
    advisorChips.appendChild(chip);
  });

  const lookFor = strategy.lookFor
    .filter((ingredient) => state.products.some((product) => product.ingredients.includes(ingredient)))
    .slice(0, 3)
    .map((ingredient) => titleCase(ingredient));
  const personalizedWatch = [
    profileWarnings[0],
    state.userProfile.avoidIngredients.length
      ? `Watch for ${formatList(state.userProfile.avoidIngredients.map((ingredient) => titleCase(ingredient)), 2)} because those are in your avoid list.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const proofLine = overall
    ? explainProductChoice(overall, { type: "overall-pick" }).replace(/^Why this was picked:\s*/i, "")
    : "The strongest candidate should match the active case.";
  const cautionLine = overall
    ? getProductConflictWarnings(overall, { routineTime: state.routineTime })[0] || personalizedWatch || strategy.avoid
    : personalizedWatch || strategy.avoid;
  const alternativeLine = budget && (!overall || budget.id !== overall.id)
    ? `${budget.brand} ${budget.name} is the closest lower-spend alternative in this board.`
    : "No comparable alternative is strong enough yet; keep the board narrow before adding one.";

  advisorGuidance.innerHTML = `
    <article class="guidance-card">
      <span class="guidance-label">Why it fits</span>
      <strong>${escapeHtml(lookFor.length ? lookFor.join(" + ") : "Barrier ritual + a practical core routine")}</strong>
      <p>${escapeHtml(proofLine)}</p>
    </article>
    <article class="guidance-card">
      <span class="guidance-label">Cautions/conflicts</span>
      <strong>Check before saving</strong>
      <p>${escapeHtml(cautionLine)}</p>
    </article>
    <article class="guidance-card">
      <span class="guidance-label">Comparable alternatives</span>
      <strong>${budget && (!overall || budget.id !== overall.id) ? "One backup to inspect" : "Backup still open"}</strong>
      <p>${escapeHtml(alternativeLine)}</p>
    </article>
  `;

  advisorPicks.innerHTML = "";
  [
    overall
      ? {
          label: "Best candidate",
          product: overall,
          reason: explainProductChoice(overall, { type: "overall-pick" }),
        }
      : null,
    budget && (!overall || budget.id !== overall.id)
      ? {
          label: "Comparable alternative",
          product: budget,
          reason: explainProductChoice(budget, { type: "budget-pick" }),
        }
      : null,
  ]
    .filter(Boolean)
    .forEach((entry) => {
      const concernTags = entry.product.concerns.slice(0, 2).map((concern) => titleCase(concern));
      const ingredientTags = entry.product.ingredients.slice(0, 2).map((ingredient) => titleCase(ingredient));
      const comparisonMarkup = renderRetailerComparisonMarkup(entry.product);
      const ingredientInsight = renderIngredientInsightMarkup(entry.product, true);
      const conflictMarkup = renderConflictMarkup(
        getProductConflictWarnings(entry.product, { routineTime: state.routineTime }),
        true,
      );
      const card = document.createElement("article");
      card.className = "advisor-pick";
      card.innerHTML = `
        <div class="advisor-pick-shell">
            <div class="advisor-pick-media${entry.product.image ? " has-image" : ""}">
              ${entry.product.image ? `<img alt="${escapeHtml(`${entry.product.brand} ${entry.product.name}`)}">` : ""}
            <div class="advisor-pick-fallback" aria-hidden="true">${entry.label === "Best candidate" ? "Candidate" : "Alt"}</div>
          </div>
          <div class="advisor-pick-content">
            <div class="advisor-pick-topline">
              <span class="advisor-pick-label">${escapeHtml(entry.label)}</span>
              <strong class="advisor-price">${money(entry.product.price)}</strong>
            </div>
            <h3>${escapeHtml(entry.product.name)}</h3>
            <p class="routine-brand">${escapeHtml(entry.product.brand)} · ${escapeHtml(entry.product.retailer)}</p>
            <div class="advisor-signal-row">
              <span class="advisor-signal">${escapeHtml(titleCase(entry.product.category))}</span>
              ${concernTags.map((tag) => `<span class="advisor-signal soft">${escapeHtml(tag)}</span>`).join("")}
            </div>
            <p class="why-picked"><strong>Why it fits:</strong> ${escapeHtml(entry.reason.replace(/^Why this was picked:\s*/i, ""))}</p>
            <div class="pick-meta">
              ${ingredientTags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
            ${ingredientInsight}
            ${conflictMarkup}
            ${comparisonMarkup ? `<div class="retailer-compare advisor-compare">${comparisonMarkup}</div>` : ""}
            <div class="card-actions">
              <button class="favorite-button ${state.favoriteIds.includes(entry.product.id) ? "active" : ""}" type="button" data-id="${escapeHtml(entry.product.id)}">
                ${state.favoriteIds.includes(entry.product.id) ? "♥" : "♡"}
              </button>
              <span class="product-link" aria-disabled="true">${escapeHtml(getOutboundLabel(entry.product.retailer))}</span>
            </div>
          </div>
        </div>
      `;
      const advisorMedia = card.querySelector(".advisor-pick-media");
      const advisorImage = card.querySelector(".advisor-pick-media img");
      if (advisorImage) {
        applyProductImage(advisorImage, entry.product.image, { container: advisorMedia });
      }
      advisorPicks.appendChild(card);
    });

  syncBriefActionButtons(overall);
}

export function renderBestPicks({ force = false } = {}) {
  if (!force && !(state.ui.activeShellView === "workspace" && state.ui.activeWorkspaceTab === "market-view-panel")) {
    return;
  }
  pickModes.innerHTML = "";
  Object.entries(PICK_MODES).forEach(([value, label]) => {
    const button = document.createElement("button");
    button.className = `pick-mode${value === state.picksMode ? " active" : ""}`;
    button.type = "button";
    button.dataset.pickMode = value;
    button.textContent = label;
    pickModes.appendChild(button);
  });

  bestPicks.innerHTML = "";
  const pickEntries = getBestPickEntries();
  const savableEntries = pickEntries.filter((entry) => entry.product);

  pickEntries.forEach(({ retailer, product: pick }) => {

    const card = document.createElement("article");
    card.className = "pick-card";

    if (!pick) {
      card.innerHTML = `
        <div class="pick-topline">
          <span class="pick-retailer">${escapeHtml(retailer)}</span>
        </div>
        <h3>No clear signature</h3>
        <p class="pick-reason">There is not a confident ${escapeHtml(PICK_MODES[state.picksMode].toLowerCase())} recommendation from ${escapeHtml(retailer)} in the current dataset yet.</p>
      `;
      bestPicks.appendChild(card);
      return;
    }

    card.innerHTML = `
      <div class="pick-topline">
        <span class="pick-retailer">${escapeHtml(retailer)}</span>
        <strong>${money(pick.price)}</strong>
      </div>
      <h3>${escapeHtml(pick.name)}</h3>
      <p class="routine-brand">${escapeHtml(pick.brand)}</p>
      <p class="pick-reason">${escapeHtml(PICK_MODES[state.picksMode])} for ${escapeHtml(retailer)} under the current scope.</p>
      <p class="why-picked"><strong>Why it fits:</strong> ${escapeHtml(explainProductChoice(pick, {
        type:
          state.picksMode === "budget"
            ? "budget-pick"
            : state.picksMode === "sensitive"
              ? "sensitive-pick"
              : "overall-pick",
        retailer,
      }).replace(/^Why this was picked:\s*/i, ""))}</p>
      <div class="pick-meta">
        ${pick.concerns.slice(0, 3).map((concern) => `<span>${escapeHtml(titleCase(concern))}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="favorite-button ${state.favoriteIds.includes(pick.id) ? "active" : ""}" type="button" data-id="${escapeHtml(pick.id)}">
          ${state.favoriteIds.includes(pick.id) ? "♥" : "♡"}
        </button>
        <span class="product-link" aria-disabled="true">${escapeHtml(getOutboundLabel(retailer))}</span>
      </div>
    `;
    bestPicks.appendChild(card);
  });

  if (picksSaveModeButton) {
    picksSaveModeButton.disabled = savableEntries.length === 0;
    picksSaveModeButton.textContent = savableEntries.length
      ? `Save ${savableEntries.length} signature pick${savableEntries.length === 1 ? "" : "s"}`
      : "Save one pick per store";
  }
  renderDecisionWorkspaceSummary();
}

export function renderArticles({ force = false } = {}) {
  if (!force && !(state.ui.activeShellView === "workspace" && state.ui.activeWorkspaceTab === "learn-workspace-panel")) {
    return;
  }
  const { group: activeGroup, visibleArticles, article: activeArticle } = resolveArticleSelection();
  state.articleGroup = activeGroup;
  state.articleId = activeArticle?.id || FALLBACK_ARTICLES[0]?.id || null;
  const groups = [...new Set(articleCatalog.map((article) => article.group))];
  articleGroups.innerHTML = "";
  groups.forEach((group) => {
    const button = document.createElement("button");
    button.className = `article-group${group === state.articleGroup ? " active" : ""}`;
    button.type = "button";
    button.dataset.articleGroup = group;
    button.textContent = titleCase(group);
    articleGroups.appendChild(button);
  });

  const rankedVisibleArticles = [...visibleArticles].sort((a, b) => scoreArticleForProfile(b) - scoreArticleForProfile(a));

  savedArticles.innerHTML = "";
  const savedForGroup = state.savedArticleIds
    .map((id) => articleCatalog.find((article) => article.id === id))
    .filter((article) => article && article.group === state.articleGroup);
  if (savedForGroup.length) {
    const label = document.createElement("p");
    label.className = "saved-articles-label";
    label.textContent = "Saved tips";
    savedArticles.appendChild(label);
    savedForGroup.forEach((article) => {
      const button = document.createElement("button");
      button.className = `saved-article-chip${article.id === state.articleId ? " active" : ""}`;
      button.type = "button";
      button.dataset.articleId = article.id;
      button.textContent = article.title;
      savedArticles.appendChild(button);
    });
  }

  articleTabs.innerHTML = "";
  rankedVisibleArticles.forEach((article) => {
    const tags = inferArticleTags(article);
    const saved = state.savedArticleIds.includes(article.id);
    const button = document.createElement("button");
    button.className = `article-tab${article.id === state.articleId ? " active" : ""}${saved ? " saved" : ""}`;
    button.type = "button";
    button.dataset.articleId = article.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(article.id === state.articleId));
    button.innerHTML = `
      <div class="article-card-topline">
        <span class="article-source-badge">${escapeHtml(article.retailer)}</span>
        <span class="article-read-time">${escapeHtml(estimateReadTime(article))}</span>
      </div>
      <strong>${escapeHtml(article.title)}</strong>
      <span>${escapeHtml(article.preview)}</span>
      <div class="article-card-tags">
        ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
      <div class="article-card-status">${saved ? "Saved tip" : "Library pick"}</div>
    `;
    articleTabs.appendChild(button);
  });

  if (!activeArticle) return;

  const articleJourney = buildArticleJourney(activeArticle);
  const isFallbackGuide = !articleMatchesCurrentGoal(activeArticle);
  articleKicker.textContent = `${activeArticle.kicker}`;
  articleTitle.textContent = activeArticle.title;
  articleSummary.textContent = activeArticle.summary;
  articleHelper.hidden = !isFallbackGuide;
  articleMeta.innerHTML = `
    <span class="article-source-badge">${escapeHtml(activeArticle.retailer)}</span>
    <span class="article-read-time">${escapeHtml(estimateReadTime(activeArticle))}</span>
    ${inferArticleTags(activeArticle).map((tag) => `<span class="article-meta-tag">${escapeHtml(tag)}</span>`).join("")}
  `;
  const learnTrust = getLearnTrustLabels(activeArticle);
  if (learnTrustLabels) {
    learnTrustLabels.innerHTML = learnTrust
      .map(
        (label) =>
          `<span class="learn-trust-chip" data-trust-tone="${escapeHtml(getTrustTone(label))}">${escapeHtml(label)}</span>`,
      )
      .join("");
    learnTrustLabels.hidden = learnTrust.length === 0;
  }
  if (learnEvidenceNotes) {
    learnEvidenceNotes.innerHTML = buildLearnEvidenceNotes(activeArticle)
      .map(
        (note) => `
          <article class="learn-evidence-note">
            <span>${escapeHtml(note.title)}</span>
            <p>${escapeHtml(note.body)}</p>
          </article>
        `,
      )
      .join("");
    learnEvidenceNotes.hidden = false;
  }
  renderLearnAnswerUi(activeArticle);
  articleSourceLink.removeAttribute("href");
  articleSourceLink.textContent = "Source link not included in this synthetic showcase";
  articleSourceLink.classList.add("disabled");
  articleSourceLink.removeAttribute("target");
  articleSourceLink.removeAttribute("rel");
  articleSourceLink.setAttribute("aria-disabled", "true");
  articleSourceLink.setAttribute("tabindex", "-1");
  articleSaveButton.textContent = state.savedArticleIds.includes(activeArticle.id) ? "Unsave tip" : "Save tip";
  articleSaveButton.classList.toggle("active", state.savedArticleIds.includes(activeArticle.id));
  articleSaveButton.dataset.articleId = activeArticle.id;
  articleShopLink.disabled = !articleJourney;
  articleShopLink.dataset.articleId = activeArticle.id;
  articleShopLink.textContent = articleJourney ? "Use topic in Catalog" : "No catalog filter for this guide";
  articleBody.innerHTML = "";

  activeArticle.sections.forEach((section) => {
    const block = document.createElement("section");
    block.className = "article-section";
    const heading = `<h4>${escapeHtml(section.heading)}</h4>`;
    const body = section.bullets
      ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<p>${escapeHtml(section.body)}</p>`;
    block.innerHTML = `${heading}${body}`;
    articleBody.appendChild(block);
  });
  renderDecisionWorkspaceSummary();
}

export function getLearnTrustLabels(article) {
  const labels = [];
  const matchesGoal = articleMatchesCurrentGoal(article);
  const hasReliableSource = hasReliableArticleSourceLink(article);
  if (matchesGoal) {
    labels.push("topic fit");
  }
  if (hasReliableSource) {
    labels.push("linked demo source");
  }
  if (matchesGoal && inferArticleTags(article).length >= 2) {
    labels.push("multi-tag fixture");
  }
  if (!matchesGoal) {
    labels.push("lower-confidence match");
  }
  return labels.slice(0, 3);
}

export function buildLearnEvidenceNotes(article) {
  const concernLabel = titleCase(state.userProfile.goal || state.routineConcern || "general care").toLowerCase();
  const tags = inferArticleTags(article);
  const primaryTag = (tags.find((tag) => !/guide|routine|basics/i.test(String(tag).toLowerCase())) || tags[0] || "This topic").toLowerCase();
  const articleText = JSON.stringify(article).toLowerCase();
  return [
    {
      title: "Why this ingredient fits",
      body: `${primaryTag} stays relevant for ${concernLabel} under your current skin lens, so this note stays tied to the active case instead of the full library.`,
    },
    {
      title: "Why this concern needs caution",
      body:
        state.userProfile.sensitivity === "high" || state.userProfile.activesComfort === "low"
          ? "Your current lens is biasing toward calmer, lower-irritation choices, so introduce stronger treatment steps more carefully."
          : "This case can tolerate a slightly stronger treatment posture, but the decision set should still stay focused enough to avoid an active-heavy routine.",
    },
    {
      title: "Why SPF choices differ here",
      body:
        state.routineTime === "am" || articleText.includes("spf") || articleText.includes("sunscreen") || articleText.includes("uv")
          ? "Protection matters more when this case is brightening-led or daytime-facing, because daily SPF changes how tone-evening and active plans pay off over time."
          : "Even when this topic is not sunscreen-led, daytime protection still changes how brightening and active plans perform over time.",
    },
  ];
}

export function getDefaultLearnAnswerQuestion(article) {
  const concernLabel = titleCase(state.userProfile.goal || state.routineConcern || "general care").toLowerCase();
  const title = normalizeGroundedAiText(article?.title).toLowerCase();
  if (title.includes("spf") || title.includes("sunscreen")) {
    return `What matters most from this guide for ${concernLabel}?`;
  }
  if (title.includes("routine") || title.includes("layer")) {
    return `What is the next practical step from this guide for ${concernLabel}?`;
  }
  return `What matters most from this guide for ${concernLabel}?`;
}

export function setLearnAnswerDraft(articleId, question) {
  if (!articleId) return;
  state.live.learnAnswerDrafts = {
    ...state.live.learnAnswerDrafts,
    [articleId]: String(question || ""),
  };
}

export function buildLearnAnswerPayload(question, article) {
  return {
    question: normalizeGroundedAiText(question) || getDefaultLearnAnswerQuestion(article),
    articleId: article?.id || null,
    savedArticleIds: [...new Set(state.savedArticleIds.filter(Boolean))],
    signals: {
      goal: state.userProfile.goal || state.routineConcern,
      routineTime: state.routineTime,
      profile: normalizeSkinProfile(state.profile || state.userProfile.profile || "all"),
      sensitivity: state.userProfile.sensitivity,
      activesComfort: state.userProfile.activesComfort,
      avoidIngredients: getRoutinePlannerAvoidIngredients(),
    },
  };
}

export function getLearnAnswerRequestKey(payload) {
  if (!payload?.articleId) return "";
  return JSON.stringify(payload);
}

export function getLearnAnswerTerms(question) {
  const stopWords = new Set(["what", "which", "with", "from", "this", "that", "guide", "article", "your", "case", "skin", "does", "mean"]);
  return normalizeGroundedAiText(question)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token, index, values) => token.length >= 4 && !stopWords.has(token) && values.indexOf(token) === index)
    .slice(0, 6);
}

export function getLearnGoalNeedles(goal) {
  return {
    acne: ["acne", "breakout", "blemish", "salicylic"],
    dryness: ["dry", "barrier", "hydrate", "ceramide"],
    redness: ["redness", "sensitive", "calm", "barrier"],
    "dark spots": ["dark spot", "pigment", "brighten", "vitamin c", "spf"],
    texture: ["texture", "smooth", "retinol", "acid"],
    wrinkles: ["wrinkle", "fine line", "retinol", "firm"],
    "general care": ["routine", "basics", "healthy skin"],
  }[goal] || [goal].filter(Boolean);
}

export function getLearnSectionText(section) {
  if (!section) return "";
  return [section.heading || "", section.body || "", ...(section.bullets || [])].join(" ").toLowerCase();
}

export function scoreLearnAnswerSection(section, question, goal) {
  const text = getLearnSectionText(section);
  let score = 0;
  getLearnAnswerTerms(question).forEach((term) => {
    if (text.includes(term)) score += 2;
  });
  getLearnGoalNeedles(goal).forEach((needle) => {
    if (text.includes(needle)) score += 1.5;
  });
  if ((section?.bullets || []).length) score += 0.5;
  return score;
}

export function buildGuardrailedLearnAnswerPayload(question, article) {
  const normalizedQuestion = String(question || "").trim().toLowerCase();
  const questionIngredientContext = normalizedQuestion
    ? [{ brand: "Learn question", ingredients: [normalizedQuestion] }]
    : [];
  const evaluation = evaluateShortlistQuestionGuardrails(question, questionIngredientContext);
  if (!evaluation.hasGuardrail) return null;
  const redirect = evaluation.severity === "redirect";
  return {
    ok: true,
    job: "learn_answer",
    answerVersion: 1,
    source: "guardrail",
    model: "deterministic-guardrail",
    fallback: true,
    degraded: false,
    guardrail: evaluation,
    answer: {
      lead: redirect ? "This question needs a safety handoff." : "This question needs a conservative read.",
      answer: evaluation.primaryMessage,
      evidence: `Matched the shared deterministic guardrail: ${evaluation.primaryTag}.`,
      caution: "Do not use a shopping result as medical or allergy clearance.",
      next_step: redirect
        ? "Pause new actives and get appropriate medical guidance before choosing another product."
        : "Keep the decision simple and confirm health-sensitive ingredients with a qualified clinician.",
      cited_article_ids: article?.id ? [article.id] : [],
    },
    citations: article?.id
      ? [
          {
            type: "article",
            id: article.id,
            label: article.title,
          },
        ]
      : [],
  };
}

export function buildLocalLearnAnswerPayload(question, article) {
  const guardrailed = buildGuardrailedLearnAnswerPayload(question, article);
  if (guardrailed) return guardrailed;
  const goal = state.userProfile.goal || state.routineConcern || "general care";
  const sections = Array.isArray(article?.sections) ? article.sections : [];
  const bestSection =
    [...sections].sort((left, right) => {
      return scoreLearnAnswerSection(right, question, goal) - scoreLearnAnswerSection(left, question, goal);
    })[0] || null;
  const bestSectionHeading = normalizeGroundedAiText(bestSection?.heading);
  const bestSectionBody = normalizeGroundedAiText(bestSection?.body);
  const bulletSummary = Array.isArray(bestSection?.bullets)
    ? bestSection.bullets.map((item) => normalizeGroundedAiText(item)).filter(Boolean).slice(0, 2).join(", ")
    : "";
  const answerText = bestSectionBody || bulletSummary || normalizeGroundedAiText(article?.summary) || "Stay with the clearest grounded point from this guide.";
  const evidenceText = bestSectionHeading
    ? `${article.title} leans most on ${bestSectionHeading.toLowerCase()} here.`
    : `This answer stays anchored to ${article?.title || "the open guide"} and its strongest relevant section.`;
  const cautionText =
    "Treat this as decision support; product copy and ranking signals are not medical evidence.";
  const journey = buildArticleJourney(article);
  const nextStepText = journey
    ? "Use this topic to reopen the catalog around the same subject, then keep the shortlist focused to one next move."
    : "Save this guide if it still matches the case, then make one concrete decision from it.";

  return {
    ok: true,
    job: "learn_answer",
    answerVersion: 1,
    source: "degraded",
    model: "local-fallback",
    fallback: true,
    degraded: true,
    answer: {
      lead: "Here is the grounded read from this guide.",
      answer: answerText,
      evidence: evidenceText,
      caution: cautionText,
      next_step: nextStepText,
      cited_article_ids: article?.id ? [article.id] : [],
    },
    citations: article?.id
      ? [
          {
            type: "article",
            id: article.id,
            label: article.title,
          },
        ]
      : [],
  };
}

export async function requestLearnAnswer(question, article, { force = false } = {}) {
  if (!article?.id) return null;
  const payload = buildLearnAnswerPayload(question, article);
  const requestKey = getLearnAnswerRequestKey(payload);
  if (!requestKey) return null;
  if (!force && state.live.learnAnswers[requestKey]) {
    return state.live.learnAnswers[requestKey];
  }
  if (state.live.learnAnswerLoading[requestKey]) {
    return null;
  }

  const guardrailed = buildGuardrailedLearnAnswerPayload(payload.question, article);
  if (guardrailed) {
    state.live.learnAnswers = {
      ...state.live.learnAnswers,
      [requestKey]: guardrailed,
    };
    renderArticles();
    return guardrailed;
  }

  state.live.learnAnswerLoading = {
    ...state.live.learnAnswerLoading,
    [requestKey]: true,
  };
  renderArticles();
  try {
    const response = state.live.apiBacked
      ? await postJson("/api/learn-answer", payload)
      : buildLocalLearnAnswerPayload(payload.question, article);
    const normalizedResponse =
      response?.ok && response.answer ? response : buildLocalLearnAnswerPayload(payload.question, article);
    state.live.learnAnswers = {
      ...state.live.learnAnswers,
      [requestKey]: normalizedResponse,
    };
    return normalizedResponse;
  } catch {
    const fallbackResponse = buildLocalLearnAnswerPayload(payload.question, article);
    state.live.learnAnswers = {
      ...state.live.learnAnswers,
      [requestKey]: fallbackResponse,
    };
    return fallbackResponse;
  } finally {
    const { [requestKey]: _ignored, ...rest } = state.live.learnAnswerLoading;
    state.live.learnAnswerLoading = rest;
    renderArticles();
  }
}

export function renderLearnAnswerUi(article) {
  if (!learnAnswer || !learnAnswerResponse || !learnAnswerInput || !learnAnswerSubmit) return;
  if (!article?.id) {
    learnAnswer.hidden = true;
    return;
  }
  learnAnswer.hidden = false;
  const savedDraft = state.live.learnAnswerDrafts[article.id] || "";
  const defaultQuestion = getDefaultLearnAnswerQuestion(article);
  const activeQuestion = savedDraft.trim() || defaultQuestion;
  const payload = buildLearnAnswerPayload(activeQuestion, article);
  const requestKey = getLearnAnswerRequestKey(payload);
  const response = requestKey ? state.live.learnAnswers[requestKey] || null : null;
  const loading = requestKey ? Boolean(state.live.learnAnswerLoading[requestKey]) : false;

  if (learnAnswerInput.value !== savedDraft) {
    learnAnswerInput.value = savedDraft;
  }
  learnAnswerSubmit.disabled = loading;
  learnAnswerSubmit.textContent = loading ? "Thinking..." : "Run answer";
  if (learnAnswerMeta) {
    learnAnswerMeta.textContent = `Grounded in ${article.title} and your current skin lens.`;
  }

  if (!response && !loading) {
    queueMicrotask(() => {
      void requestLearnAnswer(activeQuestion, article);
    });
  }

  if (loading && !response) {
    learnAnswer.dataset.answerState = "thinking";
    learnAnswerResponse.innerHTML = `
      <div class="grounded-ai-read-head">
        <strong>Grounded answer</strong>
        <span class="grounded-ai-state-badge">Thinking</span>
      </div>
      <p class="learn-answer-answer-lead">Loading a guide-specific answer for this case.</p>
    `;
    return;
  }

  if (response?.ok && response.answer) {
    const isFallback = isGroundedAiFallbackPayload(response, response.answer);
    const sourceNote = renderGroundedAiSourceNote("article", response, response.answer, {
      fallback: isFallback,
      citationLabels: getGroundedAiCitationLabels(response, [article.title]),
    });
    learnAnswer.dataset.answerState = getGroundedAiReadState(response, response.answer);
    learnAnswerResponse.innerHTML = `
      <div class="grounded-ai-read-head">
        <strong>Grounded answer</strong>
        <span class="grounded-ai-state-badge">${escapeHtml(getGroundedAiStateBadge(response, response.answer))}</span>
      </div>
      <div class="learn-answer-body">
        ${renderLearnAnswerStructuredAnswerMarkup(response)}
      </div>
      <p class="learn-answer-source"><small>${escapeHtml(sourceNote)}</small></p>
    `;
    return;
  }

  learnAnswer.dataset.answerState = "idle";
  learnAnswerResponse.innerHTML = `
    <div class="grounded-ai-read-head">
      <strong>Grounded answer ready</strong>
      <span class="grounded-ai-state-badge">Ready</span>
    </div>
    <p class="learn-answer-answer-lead">Ask what matters, what to watch, or what to do next from this guide.</p>
  `;
}

export function hasReliableArticleSourceLink(article) {
  return Boolean(article?.url) && article.retailer !== "Sephora";
}

export function buildArticleJourney(article) {
  if (!article || article.group !== "skincare") return null;

  const text = `${article.title} ${article.summary} ${(article.sections || []).map((section) => `${section.heading} ${section.body || ""} ${(section.bullets || []).join(" ")}`).join(" ")}`.toLowerCase();
  const journey = {
    concern: "all",
    ingredient: "all",
    category: "all",
    search: "",
  };

  const concernMap = [
    ["acne", "acne"],
    ["dry", "dryness"],
    ["red", "redness"],
    ["dark spot", "dark spots"],
    ["texture", "texture"],
    ["wrinkle", "wrinkles"],
    ["barrier", "dryness"],
  ];
  const ingredientMap = [
    ["vitamin c", "vitamin c"],
    ["niacinamide", "niacinamide"],
    ["retinol", "retinol"],
    ["salicylic", "salicylic acid"],
    ["ceramide", "ceramides"],
    ["hyaluronic", "hyaluronic acid"],
    ["spf", "spf"],
    ["sunscreen", "spf"],
  ];

  const matchedConcern = concernMap.find(([needle]) => text.includes(needle));
  const matchedIngredient = ingredientMap.find(([needle]) => text.includes(needle));

  if (matchedConcern) {
    journey.concern = matchedConcern[1];
  }
  if (matchedIngredient) {
    journey.ingredient = matchedIngredient[1];
  }
  if (journey.ingredient === "spf" || text.includes("sunscreen")) {
    journey.category = "sunscreen";
  } else if (text.includes("routine") || text.includes("layer")) {
    journey.category = "serum";
  }

  if (journey.concern === "all" && journey.ingredient === "all" && journey.category === "all") {
    return null;
  }
  return journey;
}

export function scoreArticleForProfile(article) {
  const text = [
    article.title,
    article.summary,
    article.preview,
    ...(article.sections || []).flatMap((section) => [section.heading, section.body || "", ...(section.bullets || [])]),
  ]
    .join(" ")
    .toLowerCase();
  const tags = inferArticleTags(article).map((tag) => tag.toLowerCase());
  let score = 0;

  const rankingContext = getCatalogRankingContext();
  const goal = rankingContext.primaryConcern || rankingContext.concern || "general care";
  if (goal !== "all" && (text.includes(goal) || tags.some((tag) => tag.includes(goal)))) {
    score += 4;
  }
  if (goal === "dark spots" && (text.includes("spot") || text.includes("pigment") || text.includes("bright"))) score += 3;
  if (goal === "dryness" && (text.includes("barrier") || text.includes("hydrate") || text.includes("moistur"))) score += 3;
  if (goal === "acne" && (text.includes("breakout") || text.includes("clogged pore") || text.includes("salicylic"))) score += 3;
  if (goal === "wrinkles" && (text.includes("retinol") || text.includes("firm") || text.includes("aging"))) score += 3;
  if (goal === "dark spots") {
    if (text.includes("vitamin c") || text.includes("retinol") || text.includes("sunscreen")) score += 2.5;
    if (text.includes("treat") || text.includes("target") || text.includes("protect")) score += 1.5;
    if (text.includes("step 1") || text.includes("step 2") || text.includes("step 3") || text.includes("step 4")) score += 2;
    if (text.includes("4 steps")) score += 1.5;
    if (text.includes("healthy skin") || text.includes("basics")) score -= 1.5;
  }
  if (goal === "dryness" || goal === "redness") {
    if (text.includes("routine") || text.includes("gentle") || text.includes("protect")) score += 1.25;
  }
  if (goal === "acne" || goal === "texture") {
    if (text.includes("treat") || text.includes("active") || text.includes("cleanse")) score += 1.5;
  }
  if (goal === "general care") {
    if (text.includes("routine") || text.includes("basics") || text.includes("healthy skin")) score += 2;
  }

  const profile = SKIN_PROFILES[state.profile];
  if (profile) {
    score += profile.concerns.filter((concern) => text.includes(concern)).length * 1.75;
    score += profile.ingredients.filter((ingredient) => text.includes(ingredient)).length * 1.35;
    score += profile.categories.filter((category) => text.includes(category)).length;
  }

  if (state.userProfile.sensitivity === "high" && (text.includes("barrier") || text.includes("gentle") || text.includes("sensitive"))) {
    score += 2.5;
  }
  if (state.userProfile.activesComfort === "low" && (text.includes("slow") || text.includes("gentle") || text.includes("barrier"))) {
    score += 1.5;
  }
  if (state.userProfile.activesComfort === "high" && (text.includes("retinol") || text.includes("acid") || text.includes("active"))) {
    score += 1.5;
  }

  const avoidList = state.userProfile.avoidIngredients || [];
  if (avoidList.length) {
    score += avoidList.filter((ingredient) => text.includes(ingredient)).length * -2;
  }

  if (text.includes("routine") || text.includes("step") || text.includes("treat")) score += 1;
  if (article.title && article.title.trim().toLowerCase() === "skincare") score -= 0.75;
  if (article.group === "skincare") score += 1;
  return score;
}

export function articleMatchesCurrentGoal(article) {
  if (!article || article.group !== "skincare") return true;
  const rankingContext = getCatalogRankingContext();
  const goal = rankingContext.primaryConcern || rankingContext.concern || "general care";
  if (goal === "all" || goal === "general care") return true;

  const text = [
    article.title,
    article.summary,
    article.preview,
    ...(article.sections || []).flatMap((section) => [section.heading, section.body || "", ...(section.bullets || [])]),
  ]
    .join(" ")
    .toLowerCase();

  const exactNeedles = {
    acne: ["acne", "breakout", "blemish"],
    pores: ["pores", "clogged pore", "blackhead"],
    dryness: ["dry", "dryness", "barrier", "hydrate"],
    redness: ["redness", "red", "sensitive", "irritat"],
    texture: ["texture", "rough", "smooth"],
    "dark spots": ["dark spot", "pigment", "discolor", "brighten"],
    dullness: ["dull", "glow", "brighten"],
    wrinkles: ["wrinkle", "fine line", "aging", "firm"],
  };

  return (exactNeedles[goal] || []).some((needle) => text.includes(needle));
}

export function applyArticleJourney(articleId) {
  const article = articleCatalog.find((entry) => entry.id === articleId);
  const journey = buildArticleJourney(article);
  if (!journey) return;

  enterWorkMode("catalog");
  setActiveShellView("catalog", { focus: false });
  state.concern = journey.concern;
  state.ingredient = journey.ingredient;
  state.category = journey.category;
  state.search = journey.search;
  state.page = 1;

  ingredientFilter.value = state.ingredient;
  categoryFilter.value = state.category;
  searchInput.value = state.search;
  setConcernChipSelection(state.concern);

  renderSavedPresets();
  renderProducts();
  scheduleCatalogSecondarySurfaceRefresh({ routine: true, bestPicks: true });
}
