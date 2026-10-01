// Central state, constants, DOM handles, and static copy setup.
// Browser-native ES module. Keep behavior changes in focused feature commits.
export function createRoutinePlannerState(previousRoutinePlanner = null) {
  if (!previousRoutinePlanner) {
    return {
      draftId: null,
      draftUpdatedAt: null,
      sessionUpdatedAt: null,
      contextKey: null,
      plan: null,
      alternatives: {},
      loading: false,
      syncingDraft: false,
      loadingAlternatives: {},
      planError: null,
      rationaleContextKey: null,
      rationale: null,
      rationaleLoading: false,
      rationaleError: false,
      draftSyncError: false,
      restoringDraft: false,
      restoredDraft: false,
      restoreError: false,
    };
  }

  return {
    ...previousRoutinePlanner,
    alternatives: { ...previousRoutinePlanner.alternatives },
    loadingAlternatives: { ...previousRoutinePlanner.loadingAlternatives },
  };
}

export function createDefaultContinuityVersions() {
  return {
    user_profile: 0,
    shortlist: 0,
    watched_items: 0,
    saved_articles: 0,
    saved_profiles: 0,
    saved_routines: 0,
    routine_session: 0,
  };
}

export function createDefaultContinuityDomains() {
  return {
    user_profile: {
      name: "",
      budget: "any",
      goal: "dryness",
      goalSource: "default",
      profile: "all",
      sensitivity: "moderate",
      activesComfort: "medium",
      avoidIngredients: [],
      clientUpdatedAt: null,
    },
    shortlist: { items: {} },
    watched_items: { items: [] },
    saved_articles: { entries: [] },
    saved_profiles: { entries: [] },
    saved_routines: { entries: [] },
    routine_session: {
      draftId: null,
      concern: null,
      timing: null,
      budgetLane: null,
      profile: null,
      sensitivity: null,
      activesComfort: null,
      avoidIngredients: [],
      draftState: {},
      updatedAt: null,
    },
  };
}

export function createContinuityState(previous = null) {
  if (!previous) {
    return {
      available: false,
      token: null,
      workspaceId: null,
      deviceId: null,
      versions: createDefaultContinuityVersions(),
      shadow: createDefaultContinuityDomains(),
      bootstrapping: false,
      syncing: false,
      applyingRemote: false,
      syncTimer: null,
      syncPromise: null,
      pendingSync: false,
      remoteRefreshPending: false,
      pairCode: null,
      pairCodeExpiresAt: null,
      pairingBusy: false,
      joinPanelOpen: false,
      joinCode: "",
      joinMessage: "",
      dataActionBusy: null,
      dataActionMessage: "",
      statusNote: "",
      error: null,
    };
  }
  return {
    ...previous,
    versions: { ...createDefaultContinuityVersions(), ...(previous.versions || {}) },
    shadow: { ...createDefaultContinuityDomains(), ...(previous.shadow || {}) },
  };
}

export function createCatalogHydrationState(previous = null) {
  const phase = previous?.phase || "idle";
  const partial = Boolean(previous?.partial);
  const loading =
    previous?.loading != null
      ? Boolean(previous.loading)
      : phase === "loading" || Boolean(previous?.fullRequestInFlight);
  return {
    phase,
    loading,
    partial,
    ready:
      previous?.ready != null
        ? Boolean(previous.ready)
        : phase === "ready" && !partial && !loading,
    fullRequestInFlight: Boolean(previous?.fullRequestInFlight),
    source: previous?.source || null,
    activeQuery: previous?.activeQuery && typeof previous.activeQuery === "object" ? { ...previous.activeQuery } : null,
    total: Number.isFinite(Number(previous?.total)) ? Number(previous.total) : null,
    loadedCount: Number.isFinite(Number(previous?.loadedCount)) ? Number(previous.loadedCount) : 0,
    requestKey: previous?.requestKey || null,
    inFlightQueryKey: previous?.inFlightQueryKey || previous?.requestKey || null,
    startedAt: previous?.startedAt || null,
    firstReadyAt: previous?.firstReadyAt || null,
    fullReadyAt: previous?.fullReadyAt || null,
    error: Boolean(previous?.error),
  };
}

export function createCatalogFocusedFilterState(previous = null) {
  return {
    requestKey: previous?.requestKey || null,
    inFlightQueryKey: previous?.inFlightQueryKey || previous?.requestKey || null,
    activeQuery: previous?.activeQuery && typeof previous.activeQuery === "object" ? { ...previous.activeQuery } : null,
    filters: previous?.filters && typeof previous.filters === "object" ? { ...previous.filters } : {},
    products: Array.isArray(previous?.products) ? previous.products : [],
    total: Number.isFinite(Number(previous?.total)) ? Number(previous.total) : null,
    loadedCount: Number.isFinite(Number(previous?.loadedCount)) ? Number(previous.loadedCount) : 0,
    loading: Boolean(previous?.loading),
    partial: Boolean(previous?.partial),
    ready: Boolean(previous?.ready),
    error: Boolean(previous?.error),
    startedAt: previous?.startedAt || null,
    loadedAt: previous?.loadedAt || null,
  };
}

export function createStartupSecondaryState(previous = null) {
  const createDomainState = (domain) => ({
    status: previous?.[domain]?.status || "idle",
    errorCode: previous?.[domain]?.errorCode || null,
  });
  return {
    snapshotVersion: Number(previous?.snapshotVersion || 0),
    ratings: createDomainState("ratings"),
    articles: createDomainState("articles"),
    status: createDomainState("status"),
  };
}

export const state = {
  products: [],
  metadata: null,
  syncStatus: null,
  live: {
    apiBacked: false,
    snapshotVersion: 0,
    initialSnapshotFailure: null,
    startupSecondary: createStartupSecondaryState(),
    catalog: createCatalogHydrationState(),
    catalogFocus: createCatalogFocusedFilterState(),
    sseConnected: false,
    eventCursor: null,
    refreshInFlight: false,
    refreshQueuedForPlannerModal: false,
    lastRefreshAt: null,
    productComparisons: {},
    productComparisonLoading: {},
    compareExplainers: {},
    compareExplainerLoading: {},
    learnAnswers: {},
    learnAnswerLoading: {},
    learnAnswerDrafts: {},
    overview: {
      requestKey: null,
      scopeKey: null,
      scope: null,
      payloadScopeKey: null,
      payload: null,
      loading: false,
      error: false,
    },
  },
  freshness: {
    catalog: null,
    ratings: null,
    articles: null,
  },
  browseLaneKey: null,
  profile: "all",
  concern: "all",
  retailer: "all",
  brand: "all",
  category: "all",
  ingredient: "all",
  search: "",
  sort: "relevance",
  page: 1,
  pageSize: 36,
  picksMode: "overall",
  routineConcern: "dryness",
  routineTime: "am",
  routineBudget: "smart",
  userProfile: {
    name: "",
    budget: "any",
    goal: "dryness",
    goalSource: "default",
    profile: "all",
    sensitivity: "moderate",
    activesComfort: "medium",
    avoidIngredients: [],
  },
  favoriteIds: [],
  shortlistStatuses: {},
  watchedItems: [],
  legacyTrackedAlertIds: [],
  savedArticleIds: [],
  savedProfiles: [],
  savedRoutines: [],
  routineDraft: {},
  routinePlanner: createRoutinePlannerState(),
  continuity: createContinuityState(),
  conversion: {
    currentRoutineEntries: [],
    baskets: {
      routine: { requestKey: null, payload: null, loading: false, error: null },
      shortlist: { requestKey: null, payload: null, loading: false, error: null },
    },
    notificationCenter: { requestKey: null, payload: null, loading: false, error: null, lastBrowserAlertIds: [] },
  },
  articleGroup: "skincare",
  articleId: "barrier-basics",
  ui: {
    marketExpanded: false,
    advisorExpanded: false,
    shortlistExpanded: false,
    workMode: false,
    lensDrawerOpen: false,
    activeShellView: "overview",
    lastWorkView: "catalog",
    shortlistReturnView: "catalog",
    activeWorkspaceTab: "shopping-brief-panel",
    catalogDensity: "decision",
    secondaryFiltersOpen: false,
    catalogFocusRailOpen: false,
    profileSummaryTab: "overview",
    profileEditing: false,
    profileDirty: false,
    lensDirtyPromptOpen: false,
    lensDirtyPromptTarget: null,
    userProfileDraft: null,
    userProfileDraftBaseKey: null,
    trackedAlertsView: "alerts",
    watchDialogProductId: null,
    activeOverviewExplainer: null,
    pendingOverviewLauncher: null,
    overviewConcernText: "",
    overviewConcernParsed: false,
    overviewConcernValidation: "",
    overviewSelectedFocus: null,
    catalogFindTargetId: null,
    activeSupportSection: "shopping-brief-panel",
    openRetailerCompareId: null,
    openRoutineChooserStep: null,
  },
};

export const productComparisonRequests = new Map();
export const compareExplainerRequests = new Map();

export const DATA_REFRESH_INTERVAL_MS = 120000;
export const LIVE_PRODUCTS_LIMIT = 10000;
export const CATALOG_INITIAL_PAGE_LIMIT = 36;
export const CATALOG_BACKGROUND_PAGE_LIMIT = 500;
export const CATALOG_BACKGROUND_PAGE_CONCURRENCY = 3;
export const CATALOG_FOCUSED_FILTER_LIMIT = 60;
export const CATALOG_FOCUSED_FILTER_TIMEOUT_MS = 6000;
export const CATALOG_FULL_HYDRATION_STALL_MS = 12000;
export const STARTUP_API_CRITICAL_TIMEOUT_MS = 5000;
export const STARTUP_SECONDARY_TIMEOUT_MS = 4000;
export const STARTUP_STATIC_CATALOG_TIMEOUT_MS = 10000;
export const LIVE_ARTICLES_LIMIT = 1000;
export const DEFAULT_API_PORT = "8150";
export const API_ORIGIN_QUERY_PARAM = "apiOrigin";
export const API_ORIGIN_STORAGE_KEY = "skincare-hub-api-origin";
export const CATALOG_PROOF_HIGHLIGHT_QUERY_PARAM = "uiProof";
export const CATALOG_PROOF_HIGHLIGHT_VALUE = "catalog";
export const ROOT_ENTRY_PATHS = new Set(["/", "/index.html", "/web", "/web/", "/web/index.html"]);
export const SHELL_VIEW_ROUTE_BY_VIEW = Object.freeze({
  overview: "",
  catalog: "catalog/",
  workspace: "workspace/",
  shortlist: "shortlist/",
});
export const SHELL_VIEW_PATH_BY_VIEW = Object.freeze(
  Object.fromEntries(Object.entries(SHELL_VIEW_ROUTE_BY_VIEW).map(([view, route]) => [view, `/${route}`])),
);
export const SHELL_VIEW_BY_ENTRY_PATH = new Map([
  ...Array.from(ROOT_ENTRY_PATHS, (path) => [path, "overview"]),
  ["/web/catalog", "catalog"],
  ["/web/catalog/", "catalog"],
  ["/web/catalog/index.html", "catalog"],
  ["/web/workspace", "workspace"],
  ["/web/workspace/", "workspace"],
  ["/web/workspace/index.html", "workspace"],
  ["/web/workplace", "workspace"],
  ["/web/workplace/", "workspace"],
  ["/web/workplace/index.html", "workspace"],
  ["/web/shortlist", "shortlist"],
  ["/web/shortlist/", "shortlist"],
  ["/web/shortlist/index.html", "shortlist"],
  ["/catalog", "catalog"],
  ["/catalog/", "catalog"],
  ["/catalog/index.html", "catalog"],
  ["/workspace", "workspace"],
  ["/workspace/", "workspace"],
  ["/workspace/index.html", "workspace"],
  ["/workplace", "workspace"],
  ["/workplace/", "workspace"],
  ["/workplace/index.html", "workspace"],
  ["/shortlist", "shortlist"],
  ["/shortlist/", "shortlist"],
  ["/shortlist/index.html", "shortlist"],
]);
export const SHELL_VIEW_KEYS = Object.keys(SHELL_VIEW_PATH_BY_VIEW);
export const shellScrollYByView = Object.fromEntries(SHELL_VIEW_KEYS.map((view) => [view, 0]));
export const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);
export const ROUTINE_PLANNER_SESSION_KEY = "skincare-hub-routine-planner-session";
export const WATCHED_ITEMS_STORAGE_KEY = "skincare-hub-watched-items";
export const TRACKED_ALERTS_STORAGE_KEY = "skincare-hub-tracked-alerts";
export const SHORTLIST_STATUS_STORAGE_KEY = "skincare-hub-shortlist-statuses";
export const UI_SESSION_STORAGE_KEY = "skincare-hub-ui-session";
export const CONTINUITY_SESSION_STORAGE_KEY = "skincare-hub-continuity-session";
export const CONTINUITY_SHADOW_STORAGE_KEY = "skincare-hub-continuity-shadow";
export const CONTINUITY_SYNC_DEBOUNCE_MS = 450;
export const CONTINUITY_BUSY_WAIT_TIMEOUT_MS = 5000;
export const WORKSPACE_TAB_IDS = [
  "shopping-brief-panel",
  "market-view-panel",
  "routine-builder-panel",
  "saved-presets-panel",
  "learn-workspace-panel",
];
export const SHORTLIST_STATUS_LABELS = {
  core: "Champion",
  optional: "Backup",
  wait: "Hold",
  reject: "Cut",
};
export const SHORTLIST_ACTIONABLE_STATUSES = new Set(["core", "optional"]);
export const SKINCARE_GUARDRAILS_STATIC_URL = new URL("skincare_guardrails.json", document.baseURI).toString();
export const SEARCH_RENDER_DEBOUNCE_MS = 90;

export function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

export function getMotionSafeScrollBehavior(preferred = "smooth") {
  return prefersReducedMotion() ? "auto" : preferred;
}

export const derivedRenderCache = {
  filteredProductsKey: "",
  filteredProducts: [],
  catalogContextKey: "",
  catalogContext: null,
  browseLaneScope: new Map(),
  decisionBoostKey: "",
  decisionBoostContext: null,
  productLookupKey: "",
  productLookup: null,
};

export const FALLBACK_ARTICLES = [
  {
    id: "read-the-shortlist",
    group: "product decisions",
    retailer: "Showcase note",
    kicker: "Decision literacy",
    title: "How to read a synthetic shortlist",
    summary:
      "A useful shortlist keeps the leading option, its closest alternative, the evidence gap, and the tradeoff visible at the same time.",
    preview: "Read the lead, evidence, catch, and backup as one decision record.",
    sections: [
      {
        heading: "Start with the decision",
        body:
          "Champion, backup, hold, and cut are decision states, not product-quality claims. They preserve why an option is still in or out for the current case.",
      },
      {
        heading: "Separate evidence from inference",
        body:
          "Price, category, retailer, and listed attributes are fixture facts. Ranking rationale is a bounded interpretation of those fields and should remain open to review.",
      },
      {
        heading: "Keep the catch visible",
        bullets: [
          "A high rank does not erase missing evidence",
          "A backup should differ in a useful way",
          "An unresolved conflict should remain unresolved",
        ],
      },
    ],
  },
  {
    id: "compare-offers",
    group: "product decisions",
    retailer: "Showcase note",
    kicker: "Comparison",
    title: "Confirm comparable offers before choosing a retailer",
    summary:
      "A retailer comparison is useful only when the underlying offers refer to the same product identity, size, and variant.",
    preview: "Confirm identity first; compare price and availability second.",
    sections: [
      {
        heading: "Match before comparing",
        body:
          "Similar names are not enough. Product, size, and variant need to align before an offer can support a price decision.",
      },
      {
        heading: "Treat availability as volatile",
        body:
          "Availability and price are observations from a point in time. The interface keeps those signals separate from the product-fit rationale.",
      },
      {
        heading: "Know what is synthetic",
        bullets: [
          "All products and brands in this showcase are fictional",
          "Outbound product URLs are intentionally inert",
          "No retailer partnership or endorsement is implied",
        ],
      },
    ],
  },
  {
    id: "model-promotion-gates",
    group: "engineering evidence",
    retailer: "Showcase note",
    kicker: "Responsible ML",
    title: "Why the learned ranker stayed out of production",
    summary:
      "The learned candidate missed predeclared promotion gates, so the deterministic ranker retained authority.",
    preview: "A negative experiment result became a product-safety decision.",
    sections: [
      {
        heading: "Define the gate first",
        body:
          "The comparison used explicit quality and safety thresholds established before the final result was reviewed.",
      },
      {
        heading: "Keep authority bounded",
        body:
          "The learned candidate could not expand eligibility, override hard exclusions, or silently replace the deterministic ordering.",
      },
      {
        heading: "Preserve the negative result",
        bullets: [
          "Five required gates failed",
          "The candidate was not promoted",
          "Aggregate evidence is public; labels and trained artifacts remain private",
        ],
      },
    ],
  },
  {
    id: "shopping-tool-boundary",
    group: "evidence",
    retailer: "Showcase note",
    kicker: "Trust boundary",
    title: "Know what a shopping tool can establish",
    summary:
      "A product-comparison interface can organize evidence and tradeoffs, but it cannot establish diagnosis, medical effectiveness, retailer endorsement, or future availability.",
    preview: "Useful evidence begins with a clear boundary around what is not proven.",
    sections: [
      {
        heading: "Decision support only",
        body:
          "The showcase explains how a result follows from its fixture fields and rules. It does not turn those inputs into medical evidence.",
      },
      {
        heading: "Volatile signals stay qualified",
        body:
          "Price, inventory, and retailer content can change. A reachable deployment proves availability of the site, not freshness of every product signal.",
      },
      {
        heading: "Escalate uncertainty",
        bullets: [
          "Do not treat product output as a diagnosis",
          "Use qualified clinical guidance for health-sensitive decisions",
          "Keep missing or private evidence labeled as such",
        ],
      },
    ],
  },
];
export const DEFAULT_AFFILIATE_CONFIG = {
  disclosure:
    "Synthetic demo links are inert. No affiliate tracking or partner IDs are included.",
  retailers: {
    Bluemercury: {
      enabled: false,
      mode: "query_params",
      params: {},
    },
    Dermstore: {
      enabled: false,
      mode: "query_params",
      params: {},
    },
    Sephora: {
      enabled: false,
      mode: "query_params",
      params: {},
    },
  },
};

export const AFFILIATE_CONFIG = (() => {
  const provided = window.SKINCARE_HUB_AFFILIATES || {};
  const retailers = { ...DEFAULT_AFFILIATE_CONFIG.retailers };

  Object.entries(provided.retailers || {}).forEach(([retailer, config]) => {
    retailers[retailer] = {
      ...(retailers[retailer] || { enabled: false, mode: "query_params", params: {} }),
      ...config,
      params: {
        ...((retailers[retailer] && retailers[retailer].params) || {}),
        ...((config && config.params) || {}),
      },
    };
  });

  return {
    disclosure: provided.disclosure || DEFAULT_AFFILIATE_CONFIG.disclosure,
    retailers,
  };
})();

export const ROUTINE_STEPS = {
  am: [
    { key: "cleanser", label: "Cleanse", categories: ["cleanser"] },
    { key: "treat", label: "Treat", categories: ["serum", "toner", "treatment"] },
    { key: "moisturize", label: "Moisturize", categories: ["moisturizer"] },
    { key: "protect", label: "Protect", categories: ["sunscreen"] },
  ],
  pm: [
    { key: "cleanser", label: "Cleanse", categories: ["cleanser"] },
    { key: "treat", label: "Treat", categories: ["serum", "toner", "treatment"] },
    { key: "seal", label: "Seal", categories: ["moisturizer", "mask"] },
  ],
};

export const PICK_MODES = {
  overall: "Signature fit",
  budget: "Value signature",
  sensitive: "Calmer signature",
};

export const ROUTINE_BUDGETS = {
  open: { label: "Open budget", cap: null, bias: 0 },
  smart: { label: "Smart spend", cap: 110, bias: 1.5 },
  "under-75": { label: "Under $75", cap: 75, bias: 3 },
  "under-120": { label: "Under $120", cap: 120, bias: 2 },
  premium: { label: "Premium routine", cap: null, bias: -0.5 },
};

export const BROWSE_LANES = [
  {
    key: "bestsellers",
    label: "Synthetic review leaders",
    description: "Fictional fixture formulas with stronger synthetic review counts across demo retailers.",
    minRating: 4.2,
    minReviews: 200,
    sort: "most-reviewed",
    tone: "neutral",
  },
  {
    key: "under-50",
    label: "Under $50",
    description: "Lower-spend fictional options compared on fit, ratings, and fixture coverage.",
    maxPrice: 50,
    minRating: 4.1,
    minReviews: 20,
    sort: "top-rated",
    tone: "sand",
    hero: true,
    heroKicker: "Lower spend path",
    heroCopy: "Start with a lower-spend shortlist, then use retailer checks to see where value still holds.",
  },
  {
    key: "barrier-repair",
    label: "Barrier Repair",
    description: "Low-noise barrier-first products for tight, dry, or stressed skin.",
    concernsAny: ["dryness", "redness", "general care"],
    ingredientsAny: ["ceramides", "hyaluronic acid", "squalane", "fragrance-free"],
    primaryConcern: "dryness",
    sort: "top-rated",
    tone: "warm",
    hero: true,
    heroKicker: "Barrier path",
    heroCopy: "Start with supportive cleansers, serums, and creams that calm the routine instead of crowding it.",
  },
  {
    key: "best-acne-picks",
    label: "Best Acne Picks",
    description: "Breakout-led formulas with synthetic review depth and practical active support.",
    concernsAny: ["acne", "pores"],
    ingredientsAny: ["salicylic acid", "niacinamide", "benzoyl peroxide", "retinol"],
    primaryConcern: "acne",
    minRating: 4,
    minReviews: 25,
    sort: "top-rated",
    tone: "sage",
    hero: true,
    heroKicker: "Breakout path",
    heroCopy: "Use this when acne is the decision driver and you need one credible treatment-led place to start.",
  },
  {
    key: "dark-spot-picks",
    label: "Dark Spot Picks",
    description: "Tone-evening support built around brightening, daily protection, and realistic patience.",
    concernsAny: ["dark spots", "dullness"],
    ingredientsAny: ["vitamin c", "niacinamide", "retinol", "spf"],
    primaryConcern: "dark spots",
    sort: "relevance",
    tone: "sand",
  },
  {
    key: "daily-spf",
    label: "Daily SPF",
    description: "Everyday sunscreen that is easy to trust, compare, and repeat.",
    category: "sunscreen",
    primaryConcern: "dark spots",
    minRating: 4,
    minReviews: 20,
    sort: "relevance",
    tone: "cool",
  },
  {
    key: "vitamin-c",
    label: "Vitamin C",
    description: "Brightening-led serums and treatments for glow and dark-spot support.",
    ingredientsAny: ["vitamin c"],
    concernsAny: ["dark spots", "dullness"],
    primaryConcern: "dark spots",
    sort: "relevance",
    tone: "warm",
  },
  {
    key: "sensitive-skin-safe",
    label: "Sensitive-skin cautious picks",
    description: "Lower-irritation picks that stay calmer around barrier and fragrance concerns.",
    sensitiveSafe: true,
    primaryConcern: "redness",
    minRating: 4,
    minReviews: 20,
    sort: "top-rated",
    tone: "cool",
    hero: true,
    heroKicker: "Low-irritation path",
    heroCopy: "Use this when you need the current view to stay conservative around fragrance, irritation, and barrier load.",
  },
];

export const LENS_PRESETS = [
  {
    key: "barrier-reset",
    label: "Barrier reset",
    profile: {
      goal: "dryness",
      profile: "dry-sensitive",
      sensitivity: "high",
      activesComfort: "low",
      budget: "balanced",
      avoidIngredients: ["retinol", "glycolic acid", "lactic acid"],
    },
  },
  {
    key: "acne-control",
    label: "Acne control",
    profile: {
      goal: "acne",
      profile: "oily-acne",
      sensitivity: "moderate",
      activesComfort: "medium",
      budget: "balanced",
      avoidIngredients: [],
    },
  },
  {
    key: "dark-spot-focus",
    label: "Dark spot focus",
    profile: {
      goal: "dark spots",
      profile: "dark-spot-texture",
      sensitivity: "moderate",
      activesComfort: "medium",
      budget: "balanced",
      avoidIngredients: [],
    },
  },
  {
    key: "sensitive-safe-basics",
    label: "Sensitive-safe basics",
    profile: {
      goal: "redness",
      profile: "dry-sensitive",
      sensitivity: "high",
      activesComfort: "low",
      budget: "budget",
      avoidIngredients: ["retinol", "glycolic acid", "lactic acid", "salicylic acid"],
    },
  },
];

export const RETAILER_SIGNATURES = {
  Sephora: {
    badge: "Synthetic offer set",
    summary: "Compare only the fictional products, prices, ratings, and overlap visible in this showcase.",
    strength: "Any lead is computed from the current fictional fixture, not a claim about the real retailer.",
    caution: "Do not infer real-world breadth, quality, availability, or retailer positioning from this demo.",
  },
  Bluemercury: {
    badge: "Synthetic offer set",
    summary: "Compare only the fictional products, prices, ratings, and overlap visible in this showcase.",
    strength: "Any lead is computed from the current fictional fixture, not a claim about the real retailer.",
    caution: "Do not infer real-world breadth, quality, availability, or retailer positioning from this demo.",
  },
  Dermstore: {
    badge: "Synthetic offer set",
    summary: "Compare only the fictional products, prices, ratings, and overlap visible in this showcase.",
    strength: "Any lead is computed from the current fictional fixture, not a claim about the real retailer.",
    caution: "Do not infer real-world breadth, quality, availability, or retailer positioning from this demo.",
  },
};

export const OVERVIEW_LAUNCHER_CONCERN_PRIORITY = ["dryness", "acne", "dark spots", "redness", "texture", "wrinkles"];
export const OVERVIEW_LAUNCHER_INGREDIENT_MAP = {
  dryness: "ceramides",
  redness: "ceramides",
  "general care": "ceramides",
  acne: "salicylic acid",
  pores: "salicylic acid",
  "dark spots": "vitamin c",
  dullness: "vitamin c",
  texture: "retinol",
  wrinkles: "retinol",
};
export const OVERVIEW_TEMPLATE_CONFIG = [
  {
    key: "barrier-reset",
    label: "Barrier reset",
    copy: "Start with a calmer barrier-first case before adding treatment pressure back.",
    concern: "dryness",
    category: "moisturizer",
    goal: "dryness",
    sensitivity: "high",
    activesComfort: "low",
  },
  {
    key: "gentle-acne-start",
    label: "Gentle acne start",
    copy: "Open a lower-irritation breakout case first instead of starting with the strongest active.",
    concern: "acne",
    category: "cleanser",
    goal: "acne",
    sensitivity: "high",
    activesComfort: "low",
  },
  {
    key: "dark-spot-safe-start",
    label: "Dark spot safe start",
    copy: "Begin with brightening support that still respects barrier and sunscreen realism.",
    concern: "dark spots",
    category: "serum",
    goal: "dark spots",
    sensitivity: "moderate",
    activesComfort: "low",
  },
  {
    key: "daily-spf",
    label: "Daily SPF",
    copy: "Start with protection-first products when prevention should anchor the whole case.",
    concern: "all",
    category: "sunscreen",
    ingredient: "spf",
    goal: "general care",
  },
  {
    key: "one-active-only",
    label: "One active only",
    copy: "Keep the treatment stack narrow and let one active do the work before you layer more.",
    concern: "texture",
    category: "treatment",
    goal: "texture",
    sensitivity: "moderate",
    activesComfort: "low",
  },
];

export const DECISION_DESK_COPY = {
  supportFlowCaptions: {
    "shopping-brief-panel": "Choose focus, compare candidates, and save the leader only when the case is ready.",
    "market-view-panel": "Compare retailer paths after the candidate and backup are real.",
    "saved-presets-panel": "Reopen saved lenses and routine drafts without changing the case first.",
    "routine-builder-panel": "Draft routine fit; do not treat it as checkout proof.",
    "retailer-picks-panel": "Hold one signature product from each retailer.",
    "learn-workspace-panel": "Read evidence tied to the case; do not treat Learn as readiness.",
  },
  compare: {
    label: "Retailer check",
    toggle: "Open retailer check",
    exactTitle: "Check the same product across retailers",
    fallbackTitle: "Check retailer options for this pick",
    bestLabel: "Best current retailer",
    explainLabel: "Explain this compare",
    thinkingLabel: "Reading retailer check...",
    answerBadge: "Grounded compare",
    sourceNoteFallback: "Source: App fallback with grounded compare context.",
  },
  shortlist: {
    dockEmptyHint: "Save products from the catalog to build a pinned decision shortlist.",
    dockReadyHint: "Review the saved decision set, ask AI which product deserves champion status, or carry the strongest pair into routine planning.",
    idleLead: "Structured decision read ready",
    idleBody: "Start with a suggested question or open the full input. The answer stays grounded in what you have saved, your skin lens, and routine context.",
    singleIdleLead: "Single-product decision read ready",
    singleIdleBody: "Ask whether this product deserves champion status, what the main caution is, or whether you should save a better backup.",
    noShortlistTitle: "No saved decision set yet",
    noShortlistBody: "Save a few products first, then ask which one deserves champion status or where the main tradeoffs sit.",
    tradeoffsTitle: "Decision tradeoffs",
    noClearLeadTitle: "No clear shortlist lead",
    noClearLeadBody: "The current saved products do not produce a confident champion yet.",
    bestStartTitle: "Current champion call",
    thinkingLead: "Grounding this saved set against the current lens and routine posture.",
    thinkingBody: "Checking champion, backup, budget lane, retailer signals, and routine timing before the next call.",
    singleThinkingLead: "Grounding this saved product against the current lens and routine posture.",
    singleThinkingBody: "Checking fit, caution, budget lane, retailer signals, and routine timing before the next call.",
    thinkingHint: "AI is reviewing your decision shortlist",
    thinkingButtonLabel: "Reading current shortlist...",
    answerBadge: "Grounded answer",
    askLabel: "Run decision read",
    sourceNoteFallback: "Source: App fallback with grounded shortlist context.",
  },
};

export const DECISION_DESK_STATIC_COPY = [
  { selector: ".hero-copy .eyebrow", value: "Decision overview" },
  { selector: ".hero-copy h1", value: "Start with a focus. Explore the strongest paths." },
  {
    selector: ".hero-subtitle",
    value: "Choose the focus, scan the current starting points, then open Catalog, Shortlist, Routine, or Learn without losing the same constraints.",
  },
  {
    selector: ".hero-copy .lede",
    value:
      "SkinCare Hub is built to make the next product decision clearer: stronger fit logic, sharper retailer calls, visible cautions, and a routine path that stays realistic instead of crowded.",
  },
  { selector: ".hero-trust-pill:nth-of-type(1)", value: "Current leader logic" },
  { selector: ".hero-trust-pill:nth-of-type(2)", value: "Visible caution and sensitivity signals" },
  { selector: ".hero-trust-pill:nth-of-type(3)", value: "Best current retailer check" },
  { selector: '.hero-button.primary[data-jump="concern-paths-panel"]', value: "Start with a concern" },
  { selector: '.hero-button.secondary[data-jump="catalog-section"]', value: "Open decision catalog" },
  { selector: ".overview-decision-panel .overview-section-kicker", value: "Demo board" },
  { selector: ".mosaic-card.warm .eyebrow", value: "Concern path" },
  { selector: ".mosaic-card.warm h3", value: "Choose one focus before browsing the whole shelf." },
  {
    selector: ".mosaic-card.warm .mosaic-copy",
    value:
      "Templates set a realistic treatment shape, then the catalog shows whether the current starting point is worth saving, comparing, or refining.",
  },
  { selector: ".mosaic-card.cool .eyebrow", value: "Retailer lens" },
  { selector: ".mosaic-card.cool h3", value: "Check which store fits this focus best." },
  {
    selector: ".mosaic-card.cool .mosaic-copy",
    value:
      "Use only current fictional-fixture counts, price, ratings, and exact-overlap evidence to compare the next step.",
  },
  { selector: ".mosaic-card.neutral .eyebrow", value: "Routine start" },
  { selector: ".mosaic-card.neutral h3", value: "Check readiness for shortlist, routine, and Learn." },
  {
    selector: ".mosaic-card.neutral .mosaic-copy",
    value:
      "Move only when the current set is strong enough to save, safe enough to plan, and clear enough to support with one useful piece of evidence.",
  },
  { selector: ".user-profile-panel h2", value: "Skin Profile Lens." },
  {
    selector: ".user-profile-intro",
    value: "One saved lens drives ranking, retailer call, and routine caution.",
  },
  { selector: ".profile-summary-eyebrow", value: "Skin profile lens" },
  { selector: "#user-profile-nav-overview", value: "Lens" },
  { selector: "#user-profile-nav-saved", value: "Saved" },
  { selector: "#user-profile-nav-edit", value: "Edit" },
  { selector: ".profile-impact-label", value: "Saved lenses" },
  {
    selector: "#user-profile-saved-panel .profile-card-heading.compact p",
    value: "Reuse a saved lens.",
  },
  { selector: "#user-profile-card .sidebar-subeyebrow", value: "Edit lens" },
  {
    selector: "#user-profile-card .sidebar-subhead p",
    value: "Update the demo ranking lens.",
  },
  { selector: ".profile-editor-impact-row span:nth-child(2)", value: DECISION_DESK_COPY.compare.label },
  { selector: ".catalog-browse-copy .eyebrow", value: "Focus rail" },
  {
    selector: ".catalog-browse-title",
    value: "Quick starts and concerns stay close.",
  },
  { selector: ".results-head .eyebrow", value: "Results" },
  { selector: ".support-header-copy .eyebrow", value: "Workspace" },
  { selector: ".support-header-copy h2", value: "Work the same case without losing context." },
  {
    selector: ".support-header-text",
    value: "One demo case. One open workspace tab.",
  },
  { selector: ".support-header-note-kicker", value: "Next surfaces" },
  { selector: ".support-header-note strong", value: "Move from browse into action without leaving the case." },
  { selector: '.support-flow-chip[data-support-flow="shopping-brief-panel"]', value: "1 Champion brief" },
  { selector: '.support-flow-chip[data-support-flow="market-view-panel"]', value: "2 Store check" },
  { selector: '.support-flow-chip[data-support-flow="saved-presets-panel"]', value: "3 Saved states" },
  { selector: '.support-flow-chip[data-support-flow="routine-builder-panel"]', value: "4 Routine" },
  { selector: '.support-flow-chip[data-support-flow="retailer-picks-panel"]', value: "5 Signature picks" },
  { selector: '.support-flow-chip[data-support-flow="learn-workspace-panel"]', value: "6 Learn notes" },
  { selector: "#shortlist-dock-hint", value: "Save products from the catalog to keep leader calls, champion calls, AI guidance, and checkout steps pinned here." },
  { selector: ".shortlist-panel .section-heading .eyebrow", value: "Shortlist" },
  { selector: ".shortlist-panel .section-heading h2", value: "Lock a champion before you buy." },
  {
    selector: ".shortlist-panel .section-heading > p",
    value: "Pick the champion, lock one backup, then buy or plan from it.",
  },
  { selector: ".shortlist-ai-head .eyebrow", value: "Decision read" },
  { selector: ".shortlist-ai-head h3", value: "Structured assistant" },
  {
    selector: ".shortlist-ai-copy",
    value: "Ready when you have a saved set. Start with one suggested question or open the full input.",
  },
  { selector: ".shortlist-ai-prompt:nth-of-type(3)", value: "What are the tradeoffs here?" },
  { selector: "#shortlist-ai-submit", value: DECISION_DESK_COPY.shortlist.askLabel },
  { selector: "#shortlist-ai-input", attribute: "placeholder", value: "Ask what deserves champion status, or what caution matters most." },
  { selector: "#shortlist-ai-response strong", value: DECISION_DESK_COPY.shortlist.idleLead },
  { selector: "#shortlist-ai-response p", value: DECISION_DESK_COPY.shortlist.idleBody },
  { selector: "#saved-empty strong", value: "No saved products yet." },
  {
    selector: "#saved-empty > span",
    value: "Save from the catalog to open approval, buy-path, and routine carryover tools.",
  },
];

export function applyDecisionDeskStaticCopy() {
  DECISION_DESK_STATIC_COPY.forEach(({ selector, value, attribute = "textContent" }) => {
    const node = document.querySelector(selector);
    if (!node || value == null) return;
    if (attribute === "textContent") {
      node.textContent = value;
      return;
    }
    node.setAttribute(attribute, value);
  });
}

export const productGrid = document.querySelector("#product-grid");
export const catalogResultsLayout = document.querySelector(".catalog-results-layout");
export const concernChips = document.querySelector("#concern-chips");
export const profileFilter = document.querySelector("#profile-filter");
export const retailerFilter = document.querySelector("#retailer-filter");
export const brandFilter = document.querySelector("#brand-filter");
export const categoryFilter = document.querySelector("#category-filter");
export const ingredientFilter = document.querySelector("#ingredient-filter");
export const searchInput = document.querySelector("#search");
export const sortFilter = document.querySelector("#sort-filter");
export const catalogFocusToggleButton = document.querySelector("#catalog-focus-toggle");
export const catalogMoreFiltersButton = document.querySelector("#catalog-more-filters");
export const catalogSecondaryFilters = document.querySelector("#catalog-secondary-filters");
export const catalogCommandBar = document.querySelector("#catalog-command-bar");
export const decisionStrip = document.querySelector("#decision-strip");
export const workModeCaseHeader = document.querySelector("#work-mode-case-header");
export const workModeCasebar = document.querySelector("#work-mode-casebar");
export const lensSummaryTitle = document.querySelector("#lens-summary-title");
export const lensSummaryMeta = document.querySelector("#lens-summary-meta");
export const routineDraftBrief = document.querySelector("#routine-draft-brief");
export const resultsTitle = document.querySelector("#results-title");
export const resultsCaption = document.querySelector("#results-caption");
export const resultsNextStep = document.querySelector("#results-next-step");
export const affiliateNote = document.querySelector("#affiliate-note");
export const freshnessBar = document.querySelector("#freshness-bar");
export const profileStatus = document.querySelector("#profile-status");
export const paginationBar = document.querySelector("#pagination-bar");
export const activeFilters = document.querySelector("#active-filters");
export const clearFiltersButton = document.querySelector("#clear-filters");
export const saveProfileButton = document.querySelector("#save-profile");
export const saveRoutineButton = document.querySelector("#save-routine");
export const routineSaveCurrentButton = document.querySelector("#routine-save-current");
export const savedProfiles = document.querySelector("#saved-profiles");
export const savedRoutines = document.querySelector("#saved-routines");
export const marketGrid = document.querySelector("#market-grid");
export const advisorSummary = document.querySelector("#advisor-summary");
export const advisorChips = document.querySelector("#advisor-chips");
export const advisorGuidance = document.querySelector("#advisor-guidance");
export const advisorPicks = document.querySelector("#advisor-picks");
export const heroStats = document.querySelector("#hero-stats");
export const template = document.querySelector("#product-card-template");
export const userProfilePanel = document.querySelector(".user-profile-panel");
export const lensDrawer = document.querySelector("#lens-drawer");
export const lensDrawerPanel = document.querySelector("#lens-drawer-panel");
export const lensDrawerScroll = document.querySelector("#lens-drawer-scroll");
export const lensDrawerBackdrop = document.querySelector("#lens-drawer-backdrop");
export const closeUserProfileDrawerButton = document.querySelector("#close-user-profile-drawer");
export const lensDirtyConfirm = document.querySelector("#lens-dirty-confirm");
export const lensDirtyConfirmCopy = document.querySelector("#lens-dirty-confirm-copy");
export const lensDirtySaveButton = document.querySelector("#lens-dirty-save");
export const lensDirtyDiscardButton = document.querySelector("#lens-dirty-discard");
export const lensDirtyKeepButton = document.querySelector("#lens-dirty-keep");
export const lensEditorFooter = document.querySelector("#lens-editor-footer");
export const userNameInput = document.querySelector("#user-name");
export const userBudgetSelect = document.querySelector("#user-budget");
export const userSensitivitySelect = document.querySelector("#user-sensitivity");
export const userActivesComfortSelect = document.querySelector("#user-actives-comfort");
export const userSkinProfileSelect = document.querySelector("#user-skin-profile");
export const userGoalSelect = document.querySelector("#user-goal");
export const avoidIngredients = document.querySelector("#avoid-ingredients");
export const editUserProfileButton = document.querySelector("#edit-user-profile");
export const openUserProfileEditorButton = document.querySelector("#open-user-profile-editor");
export const saveUserProfileButton = document.querySelector("#save-user-profile");
export const cancelUserProfileButton = document.querySelector("#cancel-user-profile");
export const resetUserProfileButton = document.querySelector("#reset-user-profile");
export const userProfileCard = document.querySelector("#user-profile-card");
export const userSummaryCard = document.querySelector(".user-summary-card");
export const userProfileAvatar = document.querySelector("#user-profile-avatar");
export const userSummaryTitle = document.querySelector("#user-summary-title");
export const userSummaryMeta = document.querySelector("#user-summary-meta");
export const userProfileNavOverview = document.querySelector("#user-profile-nav-overview");
export const userProfileNavSaved = document.querySelector("#user-profile-nav-saved");
export const userProfileNavEdit = document.querySelector("#user-profile-nav-edit");
export const userProfileOverviewPanel = document.querySelector("#user-profile-overview-panel");
export const userProfileSavedPanel = document.querySelector("#user-profile-saved-panel");
export const userSummaryContext = document.querySelector("#user-summary-context");
export const userSummaryPriority = document.querySelector("#user-summary-priority");
export const userSummaryCopy = document.querySelector("#user-summary-copy");
export const userProfileActivityState = document.querySelector("#user-profile-activity-state");
export const userProfileActivityMeta = document.querySelector("#user-profile-activity-meta");
export const userProfileGuidance = document.querySelector("#user-profile-guidance");
export const userProfileSummaryRows = document.querySelector("#user-profile-summary-rows");
export const userProfileImpactInline = document.querySelector("#user-profile-impact-inline");
export const lensImpactRow = document.querySelector("#lens-impact-row");
export const saveCurrentProfileInlineButton = document.querySelector("#save-current-profile-inline");
export const userProfileOpenSavedButton = document.querySelector("#user-profile-open-saved");
export const userProfileQuickSwitches = document.querySelector("#user-profile-quick-switches");
export const continuityCard = document.querySelector("#continuity-card");
export const continuityStatusCopy = document.querySelector("#continuity-status-copy");
export const continuityStatusMeta = document.querySelector("#continuity-status-meta");
export const continuityPairCode = document.querySelector("#continuity-pair-code");
export const continuityPairExpires = document.querySelector("#continuity-pair-expires");
export const continuityCreateCodeButton = document.querySelector("#continuity-create-code");
export const continuityJoinToggleButton = document.querySelector("#continuity-join-toggle");
export const continuityJoinPanel = document.querySelector("#continuity-join-panel");
export const continuityJoinCodeInput = document.querySelector("#continuity-join-code");
export const continuityJoinSubmitButton = document.querySelector("#continuity-join-submit");
export const continuityJoinMessage = document.querySelector("#continuity-join-message");
export const continuityResetDataButton = document.querySelector("#continuity-reset-data");
export const continuityDeleteWorkspaceButton = document.querySelector("#continuity-delete-workspace");
export const continuityDataMessage = document.querySelector("#continuity-data-message");
export const userProfileSaveState = document.querySelector("#user-profile-save-state");
export const userProfileSaveNote = document.querySelector("#user-profile-save-note");
export const userProfileFormState = document.querySelector("#user-profile-form-state");
export const userProfileDraftPreview = document.querySelector("#user-profile-draft-preview");
export const lensQuickPresets = document.querySelector("#lens-quick-presets");
export const lensTensionWarning = document.querySelector("#lens-tension-warning");
export const retailerCoverage = document.querySelector("#retailer-coverage");
export const topConcerns = document.querySelector("#top-concerns");
export const quickConcerns = document.querySelector("#quick-concerns");
export const overviewLauncherGrid = document.querySelector("#overview-launcher-grid");
export const overviewLauncherCards = Array.from(document.querySelectorAll("[data-overview-launch]"));
export const overviewLauncherTitles = Array.from(document.querySelectorAll("[data-launcher-title]"));
export const overviewLauncherProofs = Array.from(document.querySelectorAll("[data-launcher-proof]"));
export const overviewActionLauncherTitles = Array.from(document.querySelectorAll("[data-overview-action-title]"));
export const overviewActionLauncherProofs = Array.from(document.querySelectorAll("[data-overview-action-proof]"));
export const overviewScopeStrip = document.querySelector("#overview-scope-strip");
export const overviewWorkingSummary = document.querySelector("#overview-working-summary");
export const overviewDecisionBoard = document.querySelector("#overview-decision-board");
export const overviewShellView = document.querySelector("#shell-view-overview");
export const overviewConcernInput = document.querySelector("#overview-concern-input");
export const overviewConcernValidation = document.querySelector("#overview-concern-validation");
export const overviewPrimaryAction = document.querySelector("#overview-primary-action");
export const overviewFocusPanel = document.querySelector("#overview-focus-panel");
export const overviewFocusDeck = document.querySelector("#overview-focus-deck");
export const overviewRoutingPanel = document.querySelector("#overview-routing-panel");
export const overviewShopperSaid = document.querySelector("#overview-shopper-said");
export const overviewHeardChips = document.querySelector("#overview-heard-chips");
export const overviewSafetyGate = document.querySelector("#overview-safety-gate");
export const overviewSuggestedFocus = document.querySelector("#overview-suggested-focus");
export const overviewRoutingAction = document.querySelector("#overview-routing-action");
export const overviewProofLock = document.querySelector("#overview-proof-lock");
export const overviewProofHandoff = document.querySelector("#overview-proof-handoff");
export const overviewMobilePrimaryAction = document.querySelector("#overview-mobile-primary-action");
export const overviewMobilePrimaryMeta = document.querySelector("#overview-mobile-primary-meta");
export const browseLanes = document.querySelector("#browse-lanes");
export const spotlightTitle = document.querySelector("#spotlight-title");
export const spotlightCopy = document.querySelector("#spotlight-copy");
export const densityDecisionButton = document.querySelector("#density-decision");
export const densityCompactButton = document.querySelector("#density-compact");
export const resultsStateLine = document.querySelector("#results-state-line");
export const routineConcern = document.querySelector("#routine-concern");
export const routineTime = document.querySelector("#routine-time");
export const routineBudget = document.querySelector("#routine-budget");
export const routineSummary = document.querySelector("#routine-summary");
export const routineGrid = document.querySelector("#routine-grid");
export const routineSwapBackdrop = document.querySelector("#routine-swap-backdrop");
export const routineSwapDrawer = document.querySelector("#routine-swap-drawer");
export const routineBuilderPanel = document.querySelector("#routine-builder-panel");
export const routineWorkspace = document.querySelector(".routine-workspace");
export const controlsPanel = document.querySelector(".controls");
export const pickModes = document.querySelector("#pick-modes");
export const bestPicks = document.querySelector("#best-picks");
export const articleGroups = document.querySelector("#article-groups");
export const savedArticles = document.querySelector("#saved-articles");
export const articleTabs = document.querySelector("#article-tabs");
export const articleKicker = document.querySelector("#article-kicker");
export const articleTitle = document.querySelector("#article-title");
export const articleSummary = document.querySelector("#article-summary");
export const articleHelper = document.querySelector("#article-helper");
export const articleMeta = document.querySelector("#article-meta");
export const learnTrustLabels = document.querySelector("#learn-trust-labels");
export const learnEvidenceNotes = document.querySelector("#learn-evidence-notes");
export const learnAnswer = document.querySelector("#learn-answer");
export const learnAnswerMeta = document.querySelector("#learn-answer-meta");
export const learnAnswerPrompts = document.querySelector("#learn-answer-prompts");
export const learnAnswerPromptButtons = Array.from(document.querySelectorAll(".learn-answer-prompt"));
export const learnAnswerInput = document.querySelector("#learn-answer-input");
export const learnAnswerSubmit = document.querySelector("#learn-answer-submit");
export const learnAnswerResponse = document.querySelector("#learn-answer-response");
export const articleBody = document.querySelector("#article-body");

export function getBrandQuickPickProducts() {
  const activeLane = getActiveBrowseLane();
  return state.products.filter((product) => {
    const browseLaneMatch = !activeLane || browseLaneMatchesProduct(product, activeLane);
    const retailerMatch = state.retailer === "all" || product.retailer === state.retailer;
    const categoryMatch = state.category === "all" || product.category === state.category;
    const ingredientMatch = state.ingredient === "all" || product.ingredients.includes(state.ingredient);
    const concernMatch = state.concern === "all" || product.concerns.includes(state.concern);
    return browseLaneMatch && retailerMatch && categoryMatch && ingredientMatch && concernMatch && matchesSearch(product, state.search);
  });
}

export function getBrandQuickPickEntries() {
  const products = getBrandQuickPickProducts();
  const brandStats = products.reduce((stats, product) => {
    if (!stats[product.brand]) {
      stats[product.brand] = { brand: product.brand, count: 0, totalPrice: 0, pricedCount: 0 };
    }
    stats[product.brand].count += 1;
    if (typeof product.price === "number") {
      stats[product.brand].totalPrice += product.price;
      stats[product.brand].pricedCount += 1;
    }
    return stats;
  }, {});

  return Object.values(brandStats)
    .map((entry) => ({
      ...entry,
      avgPrice: entry.pricedCount ? entry.totalPrice / entry.pricedCount : null,
    }))
    .map((entry) => {
      let score = Math.sqrt(entry.count) * 3;
      if (state.userProfile.budget === "budget") {
        score += entry.avgPrice != null ? Math.max(0, 120 - entry.avgPrice) / 4 : 0;
        score -= entry.avgPrice != null ? Math.max(0, entry.avgPrice - 90) / 6 : 0;
      } else if (state.userProfile.budget === "balanced") {
        score += entry.avgPrice != null ? Math.max(0, 45 - Math.abs(entry.avgPrice - 60)) / 2.5 : 0;
      } else if (state.userProfile.budget === "premium") {
        score += entry.avgPrice != null ? Math.min(20, Math.max(0, entry.avgPrice - 70) / 6 + entry.avgPrice / 18) : 0;
      } else {
        score += entry.avgPrice != null ? Math.max(0, 95 - entry.avgPrice) / 7 : 0;
      }
      return { ...entry, score };
    })
    .sort((a, b) => b.score - a.score || a.brand.localeCompare(b.brand))
    .slice(0, 4);
}

export const articleSaveButton = document.querySelector("#article-save");
export const articleShopLink = document.querySelector("#article-shop-link");
export const articleSourceLink = document.querySelector("#article-source-link");
export const savedGrid = document.querySelector("#saved-grid");
export const savedEmpty = document.querySelector("#saved-empty");
export const shortlistToRoutineButton = document.querySelector("#shortlist-to-routine");
export const shortlistBuyCoreButton = document.querySelector("#shortlist-buy-core");
export const shortlistGapSummary = document.querySelector("#shortlist-gap-summary");
export const shortlistBuySummary = document.querySelector("#shortlist-buy-summary");
export const shortlistAi = document.querySelector("#shortlist-ai");
export const shortlistAiCopy = document.querySelector(".shortlist-ai-copy");
export const shortlistAiPrompts = document.querySelector("#shortlist-ai-prompts");
export const shortlistAiPromptButtons = Array.from(document.querySelectorAll(".shortlist-ai-prompt"));
export const shortlistAiInput = document.querySelector("#shortlist-ai-input");
export const shortlistAiSubmit = document.querySelector("#shortlist-ai-submit");
export const shortlistAiMeta = document.querySelector("#shortlist-ai-meta");
export const shortlistAiGuardrail = document.querySelector("#shortlist-ai-guardrail");
export const shortlistAiResponse = document.querySelector("#shortlist-ai-response");
export const shortlistAiToggle = document.querySelector("#shortlist-ai-toggle");
export const shortlistDock = document.querySelector("#shortlist-dock");
export const shortlistSavedCount = document.querySelector("#shortlist-saved-count");
export const shortlistSummary = document.querySelector("#shortlist-summary");
export const shortlistConflicts = document.querySelector("#shortlist-conflicts");
export const shortlistBuildPlanButton = document.querySelector("#shortlist-build-plan");
export const shortlistEmptyCtaButton = document.querySelector("#shortlist-empty-cta");
export const shortlistSheetBackdrop = document.querySelector("#shortlist-sheet-backdrop");
export const shortlistSheetCloseButton = document.querySelector("#shortlist-sheet-close");
export const workspaceSupernavShell = document.querySelector(".workspace-supernav-shell");
export const workspaceActiveTitle = document.querySelector("#workspace-active-title");
export const workspaceActiveChip = document.querySelector("#workspace-active-chip");
export const workspaceActiveNote = document.querySelector("#workspace-active-note");
export const workspaceShellRailLabel = document.querySelector("#workspace-shell-rail-label");
export const workspaceShellRailPrimary = document.querySelector("#workspace-shell-rail-primary");
export const workspaceShellRailSecondary = document.querySelector("#workspace-shell-rail-secondary");
export const workspaceShellRailTertiary = document.querySelector("#workspace-shell-rail-tertiary");
export const overviewPanel = document.querySelector("#overview-panel");
export const mosaicPanel = document.querySelector(".mosaic");
export const shellViewPanels = Array.from(document.querySelectorAll("[data-shell-view-panel]"));
export const shellViewPanelByKey = new Map(
  shellViewPanels.map((panel) => [panel.dataset.shellViewPanel, panel]),
);
export const workspaceLayout = document.querySelector(".workspace-layout");
export const workspaceShortlistRail = document.querySelector("#catalog-shortlist-rail");
export const catalogOpenShortlistButton = document.querySelector("#catalog-open-shortlist");
export const catalogShortlistMetrics = document.querySelector("#catalog-shortlist-metrics");
export const catalogShortlistSummary = document.querySelector("#catalog-shortlist-summary");
export const trackedAlertsPanel = document.querySelector("#tracked-alerts-panel");
export const trackedAlertsBody = document.querySelector("#tracked-alerts-body");
export const trackedAlertsTabAlerts = document.querySelector("#tracked-alerts-tab-alerts");
export const trackedAlertsTabWatching = document.querySelector("#tracked-alerts-tab-watching");
export const trackedAlertsMarkReadButton = document.querySelector("#tracked-alerts-mark-read");
export const watchSettingsDialog = document.querySelector("#watch-settings-dialog");
export const watchSettingsBackdrop = document.querySelector("#watch-settings-backdrop");
export const watchSettingsCloseButton = document.querySelector("#watch-settings-close");
export const watchSettingsForm = document.querySelector("#watch-settings-form");
export const watchSettingsCopy = document.querySelector("#watch-settings-copy");
export const watchSettingsDeliveryNote = document.querySelector("#watch-settings-delivery-note");
export const watchSettingsRemoveButton = document.querySelector("#watch-settings-remove");
export const watchTargetPriceInput = document.querySelector("#watch-target-price");
export const watchMinAbsoluteInput = document.querySelector("#watch-min-absolute");
export const watchMinPercentInput = document.querySelector("#watch-min-percent");
export const watchMutedUntilInput = document.querySelector("#watch-muted-until");
export const watchQuietEnabledInput = document.querySelector("#watch-quiet-enabled");
export const watchQuietStartInput = document.querySelector("#watch-quiet-start");
export const watchQuietEndInput = document.querySelector("#watch-quiet-end");
export const watchEmailInput = document.querySelector("#watch-email-input");
export const watchEmailCodeInput = document.querySelector("#watch-email-code");
export const watchEmailStartButton = document.querySelector("#watch-email-start");
export const watchEmailVerifyButton = document.querySelector("#watch-email-verify");
export const watchEmailStatus = document.querySelector("#watch-email-status");
export const marketToggle = document.querySelector("#market-toggle");
export const advisorToggle = document.querySelector("#advisor-toggle");
export const scrollTopButton = document.querySelector("#scroll-top");
export const shellNavButtons = Array.from(document.querySelectorAll(".workspace-nav-button[data-shell-view]"));
export const mobileShellNav = document.querySelector("#mobile-shell-nav");
export const mobileShellButtons = Array.from(document.querySelectorAll(".mobile-shell-button"));
export const supportNavButtons = Array.from(document.querySelectorAll("[data-workspace-jump]"));
export const supportWorkspaceSections = Array.from(document.querySelectorAll("[data-workspace-section]"));
export const supportNavMetaBySection = new Map(
  supportNavButtons.map((button) => [button.dataset.workspaceJump, button.querySelector(".support-nav-meta")]),
);
export const supportNavButtonBySection = new Map(
  supportNavButtons.map((button) => [button.dataset.workspaceJump, button]),
);
export const supportSessionStrip = document.querySelector("#support-session-strip");
export const supportFlowCaption = document.querySelector("#support-flow-caption");
export const supportFlowChips = Array.from(document.querySelectorAll("[data-support-flow]"));
export const advisorSessionSummary = document.querySelector("#advisor-session-summary");
export const marketSessionSummary = document.querySelector("#market-session-summary");
export const advisorSaveLeadButton = document.querySelector("#advisor-save-lead");
export const advisorPlanLeadButton = document.querySelector("#advisor-plan-lead");
export const marketApplyWinnerButton = document.querySelector("#market-apply-winner");
export const marketOpenBasketButton = document.querySelector("#market-open-basket");
export const picksSaveModeButton = document.querySelector("#picks-save-mode");
export let supportWorkspaceObserver = null;
