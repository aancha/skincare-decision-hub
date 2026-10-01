// API origin detection, static/API fetch helpers, snapshots, overview reads, and live refresh wiring.
// Browser-native ES module. Keep behavior changes in focused feature commits.
import { ensureBasketPlan, getComparableProductKey } from "./cards.js";
import {
  SHELL_VIEW_CONTEXT,
  buildOverviewScopeIdentity,
  buildOverviewSnapshot,
  decorateProducts,
  getCatalogRenderContext,
  getProfileLabel,
  getSavedShellScrollY,
  getSavedUserProfileRecord,
  loadFavorites,
  loadSavedArticles,
  loadSavedProfiles,
  loadSavedRoutines,
  loadShortlistStatuses,
  loadTrackedAlertIds,
  loadUserProfile,
  loadWatchedItems,
  mergeRatings,
  normalizeArticle,
  parseTimestamp,
  renderActiveShellSurface,
  renderAffiliateDisclosure,
  renderFilters,
  renderFreshnessBar,
  renderOverview,
  renderSavedPresets,
  renderStats,
  setConcernChipSelection,
  resolveArticleSelection,
  syncSupportDisclosureUi,
  syncUserProfileSurface,
  syncWorkModeUi,
  titleCase,
} from "./catalog.js";
import { fetchRoutinePlannerPlan, getRoutinePlannerContextKey } from "./routine.js";
import {
  ensureShortlistStatuses,
  ensureTrackedAlerts,
  getActiveWatchedItems,
  getEffectiveTrackedIds,
  getShortlistCoreFirstSubset,
  migrateLegacyWatchedItems,
  normalizeShortlistDecisionStatuses,
  persistShortlistStatuses,
  persistWatchedItems,
  refreshContinuityInPlace,
} from "./shortlist.js";
import {
  API_ORIGIN_QUERY_PARAM,
  API_ORIGIN_STORAGE_KEY,
  DATA_REFRESH_INTERVAL_MS,
  DEFAULT_API_PORT,
  FALLBACK_ARTICLES,
  LIVE_ARTICLES_LIMIT,
  CATALOG_BACKGROUND_PAGE_CONCURRENCY,
  CATALOG_BACKGROUND_PAGE_LIMIT,
  CATALOG_FOCUSED_FILTER_LIMIT,
  CATALOG_FULL_HYDRATION_STALL_MS,
  CATALOG_INITIAL_PAGE_LIMIT,
  LIVE_PRODUCTS_LIMIT,
  LOOPBACK_HOSTNAMES,
  STARTUP_API_CRITICAL_TIMEOUT_MS,
  STARTUP_SECONDARY_TIMEOUT_MS,
  STARTUP_STATIC_CATALOG_TIMEOUT_MS,
  SHELL_VIEW_BY_ENTRY_PATH,
  SHELL_VIEW_PATH_BY_VIEW,
  SHELL_VIEW_ROUTE_BY_VIEW,
  WORKSPACE_TAB_IDS,
  avoidIngredients,
  createCatalogFocusedFilterState,
  createCatalogHydrationState,
  createRoutinePlannerState,
  createStartupSecondaryState,
  derivedRenderCache,
  profileStatus,
  routineConcern,
  routineTime,
  savedProfiles,
  savedRoutines,
  state,
} from "./state.js";

export let articleCatalog = [...FALLBACK_ARTICLES];

export function isPublicShowcase() {
  return document.documentElement.dataset.publicShowcase === "true";
}

export function latestTimestamp(...values) {
  const parsed = values.map(parseTimestamp).filter(Boolean);
  if (!parsed.length) return null;
  return new Date(Math.max(...parsed.map((value) => value.getTime()))).toISOString();
}

export function buildRatingsPayloadFromApi(ratingsItems, generatedAt) {
  const ratings = Object.fromEntries(
    (ratingsItems || []).map((item) => [
      item.productId,
      {
        rating: item.rating,
        reviewCount: item.reviewCount,
        ratingSource: item.ratingSource,
      },
    ]),
  );
  return {
    generatedAt,
    ratings,
  };
}

export function normalizeApiOrigin(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const baseProtocol =
      window.location.protocol === "http:" || window.location.protocol === "https:"
        ? window.location.protocol
        : "http:";
    const parsed = /^[a-z]+:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(`${baseProtocol}//${trimmed.replace(/^\/+/, "")}`);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.origin;
  } catch {
    return "";
  }
}

export function isLikelyLocalDevHostname(hostname = window.location.hostname) {
  const normalized = String(hostname || "")
    .trim()
    .toLowerCase();
  if (!normalized) return false;
  if (LOOPBACK_HOSTNAMES.has(normalized) || normalized.endsWith(".local")) {
    return true;
  }
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) {
    return false;
  }
  if (normalized.startsWith("10.") || normalized.startsWith("192.168.")) {
    return true;
  }
  if (!normalized.startsWith("172.")) {
    return false;
  }
  const secondOctet = Number(normalized.split(".")[1]);
  return Number.isFinite(secondOctet) && secondOctet >= 16 && secondOctet <= 31;
}

export function shouldUseSameOriginApi() {
  if (window.location.protocol !== "http:" && window.location.protocol !== "https:") {
    return false;
  }
  if (window.location.port === DEFAULT_API_PORT) {
    return true;
  }
  return !isLikelyLocalDevHostname();
}

export function readStoredApiOrigin() {
  if (isPublicShowcase()) return "";
  try {
    return normalizeApiOrigin(window.localStorage.getItem(API_ORIGIN_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

export function readApiOriginQueryParam() {
  if (isPublicShowcase()) return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const queryOrigin = normalizeApiOrigin(params.get(API_ORIGIN_QUERY_PARAM) || "");
    return queryOrigin;
  } catch {
    // Ignore malformed query strings.
  }
  return "";
}

export function resolveApiOrigin() {
  if (isPublicShowcase()) {
    try {
      window.localStorage.removeItem(API_ORIGIN_STORAGE_KEY);
    } catch {
      // Public mode remains static even when storage is unavailable.
    }
    return "";
  }
  const queryOrigin = readApiOriginQueryParam();
  if (queryOrigin) {
    try {
      window.localStorage.setItem(API_ORIGIN_STORAGE_KEY, queryOrigin);
    } catch {
      // Ignore localStorage write failures.
    }
    return queryOrigin;
  }
  if (shouldUseSameOriginApi()) {
    return window.location.origin;
  }
  return readStoredApiOrigin() || deriveApiOrigin();
}

export function deriveApiOrigin() {
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    if (window.location.port === DEFAULT_API_PORT) {
      return window.location.origin;
    }
    if (window.location.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}`;
    }
  }
  return `http://127.0.0.1:${DEFAULT_API_PORT}`;
}

export function buildApiUrl(path) {
  if (typeof path !== "string" || !path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/api/")) return path;
  if (isPublicShowcase()) {
    throw new Error("Public showcase mode blocks API requests");
  }
  return `${resolveApiOrigin()}${path}`;
}

export function buildRequestUrl(url) {
  return typeof url === "string" && url.startsWith("/api/") ? buildApiUrl(url) : url;
}

export function appendStaticArtifactBaseCandidate(candidates, baseUrl) {
  if (typeof baseUrl !== "string" || !baseUrl) return;
  let candidateKey = baseUrl;
  try {
    candidateKey = new URL(baseUrl, document.baseURI).href.replace(/\/$/, "");
  } catch {
    // Keep the original string for non-URL file contexts.
  }
  const alreadyIncluded = candidates.some((candidate) => {
    try {
      return new URL(candidate, document.baseURI).href.replace(/\/$/, "") === candidateKey;
    } catch {
      return candidate === baseUrl;
    }
  });
  if (alreadyIncluded) return;
  candidates.push(baseUrl);
}

export function buildGeneratedArtifactBaseCandidates(baseUri = document.baseURI) {
  const candidates = [];
  if (isPublicShowcase()) {
    appendStaticArtifactBaseCandidate(candidates, new URL("../data/generated", baseUri).href.replace(/\/$/, ""));
    return candidates;
  }
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    appendStaticArtifactBaseCandidate(candidates, `${window.location.origin}/data/generated`);
    const apiOrigin = resolveApiOrigin();
    if (apiOrigin) {
      appendStaticArtifactBaseCandidate(candidates, `${apiOrigin}/data/generated`);
    }
  }
  appendStaticArtifactBaseCandidate(candidates, "../data/generated");
  return candidates;
}

export async function fetchStaticArtifactJson(filename, cacheKey, { timeoutMs = null } = {}) {
  const candidates = buildGeneratedArtifactBaseCandidates();
  const normalizedTimeoutMs = Number(timeoutMs);
  const hasDeadline = Number.isFinite(normalizedTimeoutMs) && normalizedTimeoutMs > 0;
  const deadlineAt = hasDeadline ? Date.now() + normalizedTimeoutMs : null;
  let lastError = null;
  for (const [index, baseUrl] of candidates.entries()) {
    const remainingMs = hasDeadline ? deadlineAt - Date.now() : null;
    if (hasDeadline && remainingMs <= 0) {
      throw isRequestTimeoutError(lastError)
        ? lastError
        : new ApiRequestTimeoutError(filename, normalizedTimeoutMs);
    }
    const remainingCandidates = candidates.length - index;
    const candidateTimeoutMs = hasDeadline
      ? Math.max(1, Math.floor(remainingMs / remainingCandidates))
      : null;
    try {
      return await fetchJson(`${baseUrl}/${filename}?v=${cacheKey}`, { timeoutMs: candidateTimeoutMs });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error(`Request failed for ${filename}`);
}

export function normalizeShellEntryPathname(pathname = window.location.pathname) {
  if (typeof pathname !== "string") return "/";
  const trimmed = pathname.trim();
  if (!trimmed) return "/";
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return normalized.replace(/\/{2,}/g, "/");
}

function normalizeShellBasePath(pathname = "/") {
  const normalized = normalizeShellEntryPathname(pathname);
  const withoutIndex = normalized.replace(/\/index\.html$/i, "/");
  return withoutIndex.endsWith("/") ? withoutIndex : `${withoutIndex}/`;
}

export function getShellAppBasePath(pathname = window.location.pathname) {
  const normalized = normalizeShellEntryPathname(pathname).replace(/\/index\.html$/i, "/");
  const routeMatch = normalized.match(/^(.*?)(?:\/)?(?:catalog|workspace|workplace|shortlist)\/?$/i);
  if (routeMatch) {
    return normalizeShellBasePath(routeMatch[1] || "/");
  }
  if (normalized === "/web" || normalized.startsWith("/web/")) return "/web/";
  return normalizeShellBasePath(normalized);
}

export function normalizeShellRoutePathname(pathname = window.location.pathname) {
  const normalized = normalizeShellEntryPathname(pathname);
  const basePath = getShellAppBasePath(pathname);
  let routePath = normalized;
  if (basePath !== "/" && normalized.startsWith(basePath)) {
    routePath = `/${normalized.slice(basePath.length)}`;
  }
  routePath = routePath.replace(/\/index\.html$/i, "/");
  return normalizeShellEntryPathname(routePath);
}

export function resolveShellViewFromSearch(search = window.location.search) {
  try {
    const view = new URLSearchParams(search).get("view") || "";
    return Object.hasOwn(SHELL_VIEW_CONTEXT, view) ? view : null;
  } catch {
    return null;
  }
}

export function resolveShellViewFromPathname(pathname = window.location.pathname) {
  const queryView = pathname === window.location.pathname ? resolveShellViewFromSearch() : null;
  if (queryView) return queryView;
  const normalized = normalizeShellEntryPathname(pathname);
  const routePath = normalizeShellRoutePathname(pathname);
  return SHELL_VIEW_BY_ENTRY_PATH.get(normalized) || SHELL_VIEW_BY_ENTRY_PATH.get(routePath) || null;
}

export function buildShellViewPath(view) {
  const route = SHELL_VIEW_ROUTE_BY_VIEW[view] ?? SHELL_VIEW_ROUTE_BY_VIEW.catalog;
  const basePath = getShellAppBasePath();
  return `${basePath}${route}`.replace(/\/{2,}/g, "/");
}

export function buildShellHistoryState(view = state.ui.activeShellView) {
  return {
    shellView: Object.hasOwn(SHELL_VIEW_CONTEXT, view) ? view : "catalog",
    workMode: view !== "overview",
    shellScrollY: getSavedShellScrollY(view),
    activeWorkspaceTab: WORKSPACE_TAB_IDS.includes(state.ui.activeWorkspaceTab)
      ? state.ui.activeWorkspaceTab
      : "shopping-brief-panel",
  };
}

export function syncShellHistory(view, { replace = false } = {}) {
  if (!window.history?.replaceState || !window.location) return;
  const nextUrl = new URL(window.location.href);
  nextUrl.pathname = buildShellViewPath(view);
  nextUrl.searchParams.delete("view");
  const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
  const historyMethod = replace || window.location.pathname === nextUrl.pathname ? "replaceState" : "pushState";
  window.history[historyMethod](buildShellHistoryState(view), "", nextHref);
}

export function shouldResetShellViewForRootEntry(pathname = window.location.pathname) {
  return resolveShellViewFromPathname(pathname) === "overview";
}

export function buildProductImageUrl(imageUrl) {
  const normalized = String(imageUrl || "").trim();
  if (!normalized) return "";
  if (!/^https?:\/\//i.test(normalized)) return normalized;
  return buildApiUrl(`/api/image?url=${encodeURIComponent(normalized)}`);
}

export function applyProductImage(imageElement, imageUrl, { container } = {}) {
  if (!imageElement) return;
  const resolvedUrl = buildProductImageUrl(imageUrl);
  if (!resolvedUrl) {
    imageElement.hidden = true;
    imageElement.removeAttribute("src");
    container?.classList.remove("has-image");
    container?.classList.remove("image-loaded");
    return;
  }

  const requestedLoading = imageElement.getAttribute("loading") === "eager" ? "eager" : "lazy";
  const requestedFetchPriority = imageElement.getAttribute("fetchpriority") === "high" ? "high" : "auto";
  imageElement.width = imageElement.width || 360;
  imageElement.height = imageElement.height || 240;
  imageElement.loading = requestedLoading;
  imageElement.decoding = "async";
  imageElement.fetchPriority = requestedFetchPriority;
  imageElement.referrerPolicy = "no-referrer";
  imageElement.hidden = false;
  container?.classList.remove("image-loaded");
  imageElement.onerror = () => {
    imageElement.hidden = true;
    imageElement.removeAttribute("src");
    container?.classList.remove("has-image");
    container?.classList.remove("image-loaded");
  };
  imageElement.onload = () => {
    imageElement.hidden = false;
    container?.classList.add("has-image");
    container?.classList.add("image-loaded");
  };
  imageElement.src = resolvedUrl;
  container?.classList.add("has-image");
  if (imageElement.complete && imageElement.naturalWidth > 0) {
    imageElement.hidden = false;
    container?.classList.add("image-loaded");
  }
}

export function buildApiHeaders(url, headers = {}) {
  const nextHeaders = { ...headers };
  const requestUrl = buildRequestUrl(url);
  if (typeof requestUrl === "string" && requestUrl.includes("/api/") && state.continuity.token) {
    nextHeaders["X-Continuity-Token"] = state.continuity.token;
  }
  return nextHeaders;
}

export class ApiRequestError extends Error {
  constructor(message, { status = 0, code = "request-failed", retryAfter = null } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.status = Number(status) || 0;
    this.code = String(code || "request-failed");
    this.retryAfter = retryAfter;
  }
}

export class ApiRequestTimeoutError extends ApiRequestError {
  constructor(requestUrl, timeoutMs) {
    super(`Request timed out after ${timeoutMs} ms for ${requestUrl}`, {
      code: "request-timeout",
    });
    this.name = "ApiRequestTimeoutError";
    this.requestUrl = requestUrl;
    this.timeoutMs = timeoutMs;
  }
}

export function isRequestTimeoutError(error) {
  return error instanceof ApiRequestTimeoutError || error?.code === "request-timeout";
}

export async function buildApiRequestError(response, requestUrl) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const code = payload?.error?.code || "request-failed";
  const message = payload?.error?.message || `Request failed for ${requestUrl}`;
  return new ApiRequestError(message, {
    status: response.status,
    code,
    retryAfter: response.headers.get("Retry-After"),
  });
}

export async function fetchJson(url, { timeoutMs = null } = {}) {
  const requestUrl = buildRequestUrl(url);
  const normalizedTimeoutMs = Number(timeoutMs);
  const hasTimeout = Number.isFinite(normalizedTimeoutMs) && normalizedTimeoutMs > 0;
  const controller = hasTimeout ? new AbortController() : null;
  let timeoutId = null;
  let didTimeout = false;
  if (controller) {
    timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, normalizedTimeoutMs);
  }
  try {
    const response = await fetch(requestUrl, {
      cache: "no-store",
      headers: buildApiHeaders(url),
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!response.ok) {
      throw await buildApiRequestError(response, requestUrl);
    }
    return await response.json();
  } catch (error) {
    if (didTimeout) {
      throw new ApiRequestTimeoutError(requestUrl, normalizedTimeoutMs);
    }
    throw error;
  } finally {
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
    }
  }
}

export function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function buildProductsQuery({ limit = LIVE_PRODUCTS_LIMIT, offset = 0, sort = "brand", filters = {} } = {}) {
  const query = new URLSearchParams();
  query.set("limit", String(limit));
  query.set("offset", String(offset));
  query.set("sort", sort || "brand");
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value == null || value === "" || value === "all") return;
    query.set(key, String(value));
  });
  return query.toString();
}

export function buildCatalogApiQueryState({ limit = LIVE_PRODUCTS_LIMIT, offset = 0, sort = "brand", filters = {} } = {}) {
  return {
    retailer: filters?.retailer || "all",
    brand: filters?.brand || "all",
    category: filters?.category || "all",
    concern: filters?.concern || "all",
    ingredient: filters?.ingredient || "all",
    search: filters?.search || "",
    sort: sort || "brand",
    limit: Number(limit),
    offset: Number(offset),
  };
}

export async function fetchProductsPage({
  limit = CATALOG_BACKGROUND_PAGE_LIMIT,
  offset = 0,
  sort = "brand",
  timeoutMs = null,
} = {}) {
  return fetchJson(`/api/products?${buildProductsQuery({ limit, offset, sort })}`, { timeoutMs });
}

export async function fetchFocusedProductsPage({
  filters = {},
  limit = CATALOG_FOCUSED_FILTER_LIMIT,
  offset = 0,
  sort = "brand",
} = {}) {
  return fetchJson(`/api/products?${buildProductsQuery({ limit, offset, sort, filters })}`);
}

export async function fetchProductsPageWithRetry(
  { limit = CATALOG_BACKGROUND_PAGE_LIMIT, offset = 0, sort = "brand", timeoutMs = null } = {},
  { attempts = 2, retryDelayMs = 250 } = {},
) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetchProductsPage({ limit, offset, sort, timeoutMs });
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) {
        await wait(retryDelayMs);
      }
    }
  }
  throw lastError || new Error("Product page request failed");
}

export async function fetchCatalogProductsInPages({
  pageLimit = CATALOG_BACKGROUND_PAGE_LIMIT,
  concurrency = CATALOG_BACKGROUND_PAGE_CONCURRENCY,
  sort = "brand",
  timeoutMs = null,
  onProgress = null,
} = {}) {
  const firstPage = await fetchProductsPageWithRetry({ limit: pageLimit, offset: 0, sort, timeoutMs });
  const firstItems = Array.isArray(firstPage?.items) ? firstPage.items : [];
  const total = Number.isFinite(Number(firstPage?.total)) ? Number(firstPage.total) : firstItems.length;
  const pages = [{ offset: Number(firstPage?.offset || 0), items: firstItems }];
  let loadedCount = firstItems.length;
  onProgress?.({ loadedCount, total, page: firstPage });

  const offsets = [];
  for (let offset = pageLimit; offset < total; offset += pageLimit) {
    offsets.push(offset);
  }

  let nextOffsetIndex = 0;
  const workerCount = Math.min(Math.max(1, concurrency), offsets.length);
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextOffsetIndex < offsets.length) {
      const offset = offsets[nextOffsetIndex];
      nextOffsetIndex += 1;
      const page = await fetchProductsPageWithRetry({ limit: pageLimit, offset, sort, timeoutMs });
      const items = Array.isArray(page?.items) ? page.items : [];
      pages.push({ offset: Number(page?.offset ?? offset), items });
      loadedCount += items.length;
      onProgress?.({ loadedCount: Math.min(loadedCount, total), total, page });
    }
  }));

  pages.sort((left, right) => left.offset - right.offset);
  const items = pages.flatMap((page) => page.items);
  return {
    ...firstPage,
    items,
    total,
    limit: items.length,
    offset: 0,
    sort,
  };
}

export async function postJson(url, payload) {
  const requestUrl = buildRequestUrl(url);
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: buildApiHeaders(url, { "Content-Type": "application/json" }),
    body: jsonStringifySafe(payload),
  });
  if (!response.ok) {
    throw await buildApiRequestError(response, requestUrl);
  }
  return response.json();
}

export async function putJson(url, payload) {
  const requestUrl = buildRequestUrl(url);
  const response = await fetch(requestUrl, {
    method: "PUT",
    headers: buildApiHeaders(url, { "Content-Type": "application/json" }),
    body: jsonStringifySafe(payload),
  });
  if (!response.ok) {
    throw await buildApiRequestError(response, requestUrl);
  }
  return response.json();
}

export async function deleteJson(url) {
  const requestUrl = buildRequestUrl(url);
  const response = await fetch(requestUrl, {
    method: "DELETE",
    headers: buildApiHeaders(url),
  });
  if (!response.ok) {
    throw await buildApiRequestError(response, requestUrl);
  }
  return response.json();
}

export function jsonStringifySafe(value) {
  return JSON.stringify(value);
}

export function buildProductComparisonQuery(product) {
  const params = new URLSearchParams();
  if (product?.id) {
    params.set("productId", product.id);
  } else {
    const comparisonKey = getComparableProductKey(product);
    if (comparisonKey) {
      params.set("comparisonKey", comparisonKey);
    }
  }
  return params.toString();
}

export function buildCatalogHydrationPayload(productsPayload, { phase = "ready", source = "api" } = {}) {
  const items = Array.isArray(productsPayload?.items) ? productsPayload.items : [];
  const total = Number(productsPayload?.total);
  const offset = Number(productsPayload?.offset || 0);
  const limit = Number(productsPayload?.limit || items.length);
  const sort = productsPayload?.sort || "brand";
  const loadedCount = items.length + Math.max(0, Number.isFinite(offset) ? offset : 0);
  const hasMore = Number.isFinite(total) && total > loadedCount;
  const partial = phase !== "ready" && hasMore;
  const activeQuery = buildCatalogApiQueryState({
    limit: Number.isFinite(limit) && limit > 0 ? limit : items.length,
    offset: Number.isFinite(offset) ? offset : 0,
    sort,
  });
  const requestKey = `${source}:${activeQuery.sort}:${activeQuery.limit}:${activeQuery.offset}:${Number.isFinite(total) ? total : "unknown"}`;
  return {
    phase: partial ? "partial" : "ready",
    loading: false,
    partial,
    ready: !partial,
    fullRequestInFlight: partial,
    source,
    total: Number.isFinite(total) ? total : items.length,
    loadedCount,
    activeQuery,
    requestKey,
    inFlightQueryKey: partial ? requestKey : null,
    firstReadyAt: new Date().toISOString(),
    fullReadyAt: partial ? null : new Date().toISOString(),
    error: false,
  };
}

export async function fetchApiSnapshot({ productLimit = LIVE_PRODUCTS_LIMIT, hydrationPhase = "ready", productSort = "brand" } = {}) {
  const [statusPayload, metaPayload, productsPayload, articlesPayload, ratingsPayload] = await Promise.all([
    fetchJson("/api/status"),
    fetchJson("/api/catalog-meta"),
    fetchJson(`/api/products?${buildProductsQuery({ limit: productLimit, offset: 0, sort: productSort })}`),
    fetchJson(`/api/articles?limit=${LIVE_ARTICLES_LIMIT}&offset=0`),
    fetchJson(`/api/ratings?limit=${productLimit}&offset=0`),
  ]);

  return {
    source: "api",
    payload: {
      generatedAt: metaPayload.generatedAt,
      metadata: metaPayload.metadata,
      products: productsPayload.items || [],
    },
    catalogHydration: buildCatalogHydrationPayload(productsPayload, { phase: hydrationPhase, source: "api" }),
    ratingsPayload: buildRatingsPayloadFromApi(
      ratingsPayload.items || [],
      statusPayload?.artifacts?.ratings?.generatedAt || ratingsPayload.generatedAt || metaPayload.generatedAt,
    ),
    articlePayload: {
      generatedAt: statusPayload?.artifacts?.articles?.generatedAt || null,
      articles: articlesPayload.items || [],
    },
    statusPayload,
  };
}

export async function fetchFullApiSnapshot({
  hydrationPhase = "ready",
  onProductsProgress = null,
} = {}) {
  const [statusPayload, metaPayload, productsPayload, articlesPayload, ratingsPayload] = await Promise.all([
    fetchJson("/api/status"),
    fetchJson("/api/catalog-meta"),
    fetchCatalogProductsInPages({ onProgress: onProductsProgress }),
    fetchJson(`/api/articles?limit=${LIVE_ARTICLES_LIMIT}&offset=0`),
    fetchJson(`/api/ratings?limit=${LIVE_PRODUCTS_LIMIT}&offset=0`),
  ]);

  return {
    source: "api",
    payload: {
      generatedAt: metaPayload.generatedAt,
      metadata: metaPayload.metadata,
      products: productsPayload.items || [],
    },
    catalogHydration: buildCatalogHydrationPayload(productsPayload, { phase: hydrationPhase, source: "api" }),
    ratingsPayload: buildRatingsPayloadFromApi(
      ratingsPayload.items || [],
      statusPayload?.artifacts?.ratings?.generatedAt || ratingsPayload.generatedAt || metaPayload.generatedAt,
    ),
    articlePayload: {
      generatedAt: statusPayload?.artifacts?.articles?.generatedAt || null,
      articles: articlesPayload.items || [],
    },
    statusPayload,
  };
}

export async function fetchInitialApiSnapshot({ productSort = "brand" } = {}) {
  const [metaPayload, productsPayload] = await Promise.all([
    fetchJson("/api/catalog-meta", { timeoutMs: STARTUP_API_CRITICAL_TIMEOUT_MS }),
    fetchJson(
      `/api/products?${buildProductsQuery({ limit: CATALOG_INITIAL_PAGE_LIMIT, offset: 0, sort: productSort })}`,
      { timeoutMs: STARTUP_API_CRITICAL_TIMEOUT_MS },
    ),
  ]);
  return {
    source: "api",
    payload: {
      generatedAt: metaPayload.generatedAt,
      metadata: metaPayload.metadata,
      products: productsPayload.items || [],
    },
    catalogHydration: buildCatalogHydrationPayload(productsPayload, { phase: "partial", source: "api" }),
    startupSecondary: { source: "api" },
  };
}

export async function fetchFullCatalogSnapshot({ onProductsProgress = null } = {}) {
  const [metaPayload, productsPayload] = await Promise.all([
    fetchJson("/api/catalog-meta", { timeoutMs: STARTUP_API_CRITICAL_TIMEOUT_MS }),
    fetchCatalogProductsInPages({
      timeoutMs: STARTUP_API_CRITICAL_TIMEOUT_MS,
      onProgress: onProductsProgress,
    }),
  ]);
  return {
    source: "api",
    payload: {
      generatedAt: metaPayload.generatedAt,
      metadata: metaPayload.metadata,
      products: productsPayload.items || [],
    },
    catalogHydration: buildCatalogHydrationPayload(productsPayload, { phase: "ready", source: "api" }),
    startupSecondary: { source: "api" },
  };
}

export function normalizeSnapshotFailure(error) {
  if (!error) return null;
  return {
    name: String(error.name || "Error"),
    code: String(error.code || "request-failed"),
    status: Number(error.status || 0),
    timeoutMs: Number.isFinite(Number(error.timeoutMs)) ? Number(error.timeoutMs) : null,
  };
}

export async function fetchStaticSnapshot({ criticalOnly = false, fallbackError = null } = {}) {
  const cacheKey = `${Date.now()}`;
  const payload = await fetchStaticArtifactJson("catalog.json", cacheKey, {
    timeoutMs: criticalOnly ? STARTUP_STATIC_CATALOG_TIMEOUT_MS : null,
  });
  const criticalSnapshot = {
    source: "static",
    payload,
    catalogHydration: {
      phase: "ready",
      partial: false,
      fullRequestInFlight: false,
      source: "static",
      total: Array.isArray(payload.products) ? payload.products.length : 0,
      loadedCount: Array.isArray(payload.products) ? payload.products.length : 0,
      requestKey: `static:${payload.generatedAt || cacheKey}`,
      firstReadyAt: new Date().toISOString(),
      fullReadyAt: new Date().toISOString(),
      error: false,
    },
    fallbackReason: normalizeSnapshotFailure(fallbackError),
  };
  if (criticalOnly) {
    return {
      ...criticalSnapshot,
      startupSecondary: { source: "static", cacheKey },
    };
  }
  let ratingsPayload = null;
  let articlePayload = null;
  let statusPayload = null;

  try {
    ratingsPayload = await fetchStaticArtifactJson("ratings.json", cacheKey);
  } catch {
    ratingsPayload = null;
  }

  try {
    articlePayload = await fetchStaticArtifactJson("articles.json", cacheKey);
  } catch {
    articlePayload = null;
  }

  if (!isPublicShowcase()) {
    try {
      statusPayload = await fetchJson("/api/status");
    } catch {
      statusPayload = null;
    }
  }

  return {
    ...criticalSnapshot,
    ratingsPayload,
    articlePayload,
    statusPayload,
  };
}

export async function fetchInitialAppSnapshot() {
  if (isPublicShowcase()) {
    return fetchStaticSnapshot({ criticalOnly: true });
  }
  try {
    const initialShellView = resolveShellViewFromPathname();
    return await fetchInitialApiSnapshot({
      productSort: initialShellView === "catalog" ? "most-reviewed" : "brand",
    });
  } catch (error) {
    return fetchStaticSnapshot({ criticalOnly: true, fallbackError: error });
  }
}

export async function fetchAppSnapshot() {
  if (isPublicShowcase()) {
    return fetchStaticSnapshot();
  }
  try {
    return await fetchFullApiSnapshot();
  } catch {
    return fetchStaticSnapshot();
  }
}

export function isStartupSnapshotCurrent(snapshotVersion) {
  return Number(snapshotVersion) === Number(state.live.snapshotVersion);
}

export function updateStartupSecondaryDomain(snapshotVersion, domain, status, errorCode = null) {
  if (Number(state.live.startupSecondary?.snapshotVersion) !== Number(snapshotVersion)) return;
  state.live.startupSecondary = createStartupSecondaryState({
    ...state.live.startupSecondary,
    snapshotVersion,
    [domain]: { status, errorCode },
  });
}

export function applyStartupRatingsPayload(ratingsPayload, snapshotVersion) {
  if (!isStartupSnapshotCurrent(snapshotVersion)) return false;
  state.products = decorateProducts(mergeRatings(state.products, ratingsPayload));
  invalidateProductDerivedCaches();
  state.freshness.ratings = latestTimestamp(ratingsPayload?.generatedAt, state.freshness.ratings);
  renderSnapshot();
  return true;
}

export function applyStartupArticlesPayload(articlePayload, snapshotVersion) {
  if (!isStartupSnapshotCurrent(snapshotVersion)) return false;
  const hydratedArticles =
    Array.isArray(articlePayload?.articles) && articlePayload.articles.length
      ? articlePayload.articles.map((article) => normalizeArticle(article))
      : [...FALLBACK_ARTICLES];
  const hydratedArticleIds = new Set(hydratedArticles.map((article) => article.id));
  articleCatalog = [
    ...hydratedArticles,
    ...articleCatalog.filter((article) => !hydratedArticleIds.has(article.id)),
  ];
  const { group: activeGroup, article } = resolveArticleSelection();
  state.articleGroup = activeGroup;
  state.articleId = article?.id || articleCatalog[0]?.id || "barrier-basics";
  state.freshness.articles = latestTimestamp(articlePayload?.generatedAt, state.freshness.articles);
  renderSnapshot();
  return true;
}

export function applyStartupStatusPayload(statusPayload, snapshotVersion) {
  if (!isStartupSnapshotCurrent(snapshotVersion)) return false;
  state.syncStatus = statusPayload;
  state.live.eventCursor = statusPayload?.liveEventCursor || state.live.eventCursor || null;
  state.freshness.catalog = statusPayload?.artifacts?.catalog?.generatedAt || state.freshness.catalog;
  state.freshness.ratings = statusPayload?.artifacts?.ratings?.generatedAt || state.freshness.ratings;
  state.freshness.articles = statusPayload?.artifacts?.articles?.generatedAt || state.freshness.articles;
  renderFreshnessBar();
  return true;
}

export async function runStartupSecondaryTask(snapshotVersion, domain, load, apply) {
  try {
    const payload = await load();
    if (!isStartupSnapshotCurrent(snapshotVersion)) {
      updateStartupSecondaryDomain(snapshotVersion, domain, "stale");
      return { domain, status: "stale" };
    }
    apply(payload, snapshotVersion);
    updateStartupSecondaryDomain(snapshotVersion, domain, "fulfilled");
    return { domain, status: "fulfilled" };
  } catch (error) {
    if (!isStartupSnapshotCurrent(snapshotVersion)) {
      updateStartupSecondaryDomain(snapshotVersion, domain, "stale");
      return { domain, status: "stale" };
    }
    const status = isRequestTimeoutError(error) ? "timed-out" : "rejected";
    updateStartupSecondaryDomain(snapshotVersion, domain, status, error?.code || "request-failed");
    return { domain, status, error };
  }
}

export async function hydrateStartupSecondarySnapshot(
  snapshot,
  { snapshotVersion = state.live.snapshotVersion, timeoutMs = STARTUP_SECONDARY_TIMEOUT_MS } = {},
) {
  const descriptor = snapshot?.startupSecondary;
  if (!descriptor?.source || !isStartupSnapshotCurrent(snapshotVersion)) return [];
  state.live.startupSecondary = createStartupSecondaryState({
    snapshotVersion,
    ratings: { status: "pending", errorCode: null },
    articles: { status: "pending", errorCode: null },
    status: { status: "pending", errorCode: null },
  });
  const cacheKey = descriptor.cacheKey || `${Date.now()}`;
  const loadRatings =
    descriptor.source === "api"
      ? async () => {
          const payload = await fetchJson(`/api/ratings?limit=${LIVE_PRODUCTS_LIMIT}&offset=0`, { timeoutMs });
          return buildRatingsPayloadFromApi(payload.items || [], payload.generatedAt || null);
        }
      : () => fetchStaticArtifactJson("ratings.json", cacheKey, { timeoutMs });
  const loadArticles =
    descriptor.source === "api"
      ? async () => {
          const payload = await fetchJson(`/api/articles?limit=${LIVE_ARTICLES_LIMIT}&offset=0`, { timeoutMs });
          return { generatedAt: payload.generatedAt || null, articles: payload.items || [] };
        }
      : () => fetchStaticArtifactJson("articles.json", cacheKey, { timeoutMs });
  const loadStatus = () =>
    isPublicShowcase() ? Promise.resolve(null) : fetchJson("/api/status", { timeoutMs });
  return Promise.all([
    runStartupSecondaryTask(snapshotVersion, "ratings", loadRatings, applyStartupRatingsPayload),
    runStartupSecondaryTask(snapshotVersion, "articles", loadArticles, applyStartupArticlesPayload),
    runStartupSecondaryTask(snapshotVersion, "status", loadStatus, applyStartupStatusPayload),
  ]);
}

export function markCatalogHydrationLoading({ source = "api" } = {}) {
  const activeQuery = buildCatalogApiQueryState({
    limit: CATALOG_INITIAL_PAGE_LIMIT,
    offset: 0,
    sort: "brand",
  });
  const requestKey = `${source}:initial:${activeQuery.sort}:${activeQuery.limit}:${activeQuery.offset}:${Date.now()}`;
  state.live.catalog = createCatalogHydrationState({
    phase: "loading",
    loading: true,
    partial: false,
    ready: false,
    fullRequestInFlight: true,
    source,
    total: null,
    loadedCount: 0,
    activeQuery,
    requestKey,
    inFlightQueryKey: requestKey,
    startedAt: new Date().toISOString(),
    firstReadyAt: null,
    fullReadyAt: null,
    error: false,
  });
}

export function buildOverviewQuery() {
  const query = new URLSearchParams();
  const currentGoal = state.userProfile.goal || state.routineConcern || "general care";
  const hasFocusedCase = Boolean(
    state.search ||
      state.browseLaneKey ||
      [state.retailer, state.brand, state.category, state.concern, state.ingredient].some((value) => value && value !== "all"),
  );
  const listFields = [
    ["retailer", state.retailer],
    ["brand", state.brand],
    ["category", state.category],
    ["concern", state.concern],
    ["ingredient", state.ingredient],
    ["search", state.search],
    ["sort", state.sort],
    ["browseLane", state.browseLaneKey || ""],
    ["goal", currentGoal],
    ["budget", state.userProfile.budget || "any"],
    ["profile", state.profile || "all"],
    ["sensitivity", state.userProfile.sensitivity || "moderate"],
    ["activesComfort", state.userProfile.activesComfort || "medium"],
    ["routineTime", state.routineTime || "am"],
  ];
  listFields.forEach(([key, value]) => {
    if (value == null || value === "" || value === "all") return;
    query.set(key, value);
  });
  (state.userProfile.avoidIngredients || []).forEach((ingredient) => {
    if (ingredient) query.append("avoidIngredient", ingredient);
  });
  state.favoriteIds.forEach((id) => {
    if (id) query.append("favoriteId", id);
  });
  query.set("overviewLimit", hasFocusedCase ? "720" : "360");
  query.set("overviewBaseLimit", hasFocusedCase ? "1400" : "900");
  return query;
}

export async function ensureOverviewSnapshot(force = false) {
  if (!state.live.apiBacked) return null;
  const requestKey = buildOverviewQuery().toString();
  const requestScope = buildOverviewScopeIdentity({ requestKey });
  if (!force && state.live.overview.requestKey === requestKey && state.live.overview.scopeKey === requestScope.key) {
    if (state.live.overview.loading || state.live.overview.payload) {
      return state.live.overview.payload;
    }
  }
  state.live.overview.requestKey = requestKey;
  state.live.overview.scopeKey = requestScope.key;
  state.live.overview.scope = requestScope;
  state.live.overview.payloadScopeKey = null;
  state.live.overview.payload = null;
  state.live.overview.loading = true;
  state.live.overview.error = false;
  try {
    const payload = await fetchJson(`/api/overview?${requestKey}`);
    if (state.live.overview.requestKey !== requestKey) return null;
    const activeScope = buildOverviewScopeIdentity({ requestKey });
    if (activeScope.key !== requestScope.key || state.live.overview.scopeKey !== requestScope.key) {
      state.live.overview.loading = false;
      return null;
    }
    const scopedPayload =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? { ...payload, _clientScope: requestScope }
        : payload;
    state.live.overview.payload = scopedPayload;
    state.live.overview.payloadScopeKey = requestScope.key;
    state.live.overview.loading = false;
    state.live.overview.error = false;
    if (state.ui.activeShellView === "overview") {
      renderOverview(buildOverviewSnapshot({ filtered: getCatalogRenderContext().filtered, remotePayload: scopedPayload }));
    }
    return scopedPayload;
  } catch {
    if (state.live.overview.requestKey === requestKey) {
      state.live.overview.loading = false;
      state.live.overview.error = true;
    }
    return null;
  }
}

export function formatFreshness(value) {
  const date = parseTimestamp(value);
  if (!date) return "Not refreshed yet";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(0, Math.round(diffMs / 3_600_000));
  const timeLabel = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const dateLabel = date.toLocaleDateString([], { month: "short", day: "numeric" });

  if (diffHours < 1) return `Updated just now at ${dateLabel}, ${timeLabel}`;
  if (diffHours < 24) return `Updated ${dateLabel} at ${timeLabel}`;
  return `Updated ${dateLabel} at ${timeLabel}`;
}

export function renderProfileStatus() {
  if (!profileStatus) return;

  const profile = state.ui.profileEditing && state.ui.userProfileDraft
    ? state.ui.userProfileDraft
    : getSavedUserProfileRecord();
  const goalLabel = titleCase(profile.goal || "general care");
  const skinLabel = profile.profile && profile.profile !== "all" ? getProfileLabel(profile.profile) : "Broad view";
  let stateName = "live";
  let label = "Lens applied";
  let meta = `${goalLabel} · ${skinLabel}`;

  if (state.ui.profileEditing && state.ui.profileDirty) {
    stateName = "updating";
    label = "Unsaved edits";
    meta = "Save to update ranking";
  } else if (state.ui.profileEditing) {
    stateName = "static";
    label = "Draft lens";
    meta = "Changes stay local until saved";
  } else if (profile.name.trim()) {
    label = "Saved lens";
    meta = profile.name.trim();
  }

  profileStatus.dataset.state = stateName;
  const labelElement = document.createElement("span");
  labelElement.className = "profile-status-label";
  labelElement.textContent = label;
  const metaElement = document.createElement("span");
  metaElement.className = "profile-status-meta";
  metaElement.textContent = meta;
  profileStatus.replaceChildren(labelElement, metaElement);
}
export function preserveLiveCache(record, maxEntries = 80) {
  const entries = Object.entries(record || {});
  if (entries.length <= maxEntries) {
    return Object.fromEntries(entries);
  }
  return Object.fromEntries(entries.slice(entries.length - maxEntries));
}

export function invalidateProductDerivedCaches() {
  derivedRenderCache.filteredProductsKey = "";
  derivedRenderCache.filteredProducts = [];
  derivedRenderCache.catalogContextKey = "";
  derivedRenderCache.catalogContext = null;
  derivedRenderCache.browseLaneScope.clear();
  derivedRenderCache.decisionBoostKey = "";
  derivedRenderCache.decisionBoostContext = null;
  derivedRenderCache.productLookupKey = "";
  derivedRenderCache.productLookup = null;
}

export function applySnapshot(
  snapshot,
  { initial = false, preserveSecondary = false } = {},
) {
  const previousRoutinePlanner = state.routinePlanner;
  const previousLive = state.live;
  const previousStatusPayload = state.syncStatus;
  const payload = snapshot.payload || { products: [], metadata: {} };
  const ratingsPayload = snapshot.ratingsPayload || null;
  const articlePayload = snapshot.articlePayload || null;
  const statusPayload = snapshot.statusPayload || (preserveSecondary ? previousStatusPayload : null);
  const nextArticles =
    Array.isArray(articlePayload?.articles) && articlePayload.articles.length
      ? articlePayload.articles.map((article) => normalizeArticle(article))
      : preserveSecondary
        ? [...articleCatalog]
        : [...FALLBACK_ARTICLES];

  articleCatalog = nextArticles;
  state.products = decorateProducts(mergeRatings(payload.products || [], ratingsPayload));
  const snapshotCatalogHydration = snapshot.catalogHydration || {};
  const nextCatalogPhase = snapshotCatalogHydration.phase || "ready";
  const nextCatalogPartial = Boolean(snapshotCatalogHydration.partial);
  const nextCatalogLoading = Boolean(snapshotCatalogHydration.loading);
  const nextCatalogHydration = createCatalogHydrationState({
    ...previousLive.catalog,
    ...snapshotCatalogHydration,
    source: snapshot.source || snapshotCatalogHydration.source || previousLive.catalog?.source || null,
    total: Number.isFinite(Number(snapshotCatalogHydration.total))
      ? Number(snapshotCatalogHydration.total)
      : state.products.length,
    loadedCount: state.products.length,
    phase: nextCatalogPhase,
    loading: nextCatalogLoading,
    partial: nextCatalogPartial,
    ready: nextCatalogPhase === "ready" && !nextCatalogPartial && !nextCatalogLoading,
    fullRequestInFlight: Boolean(snapshotCatalogHydration.fullRequestInFlight),
    activeQuery: snapshotCatalogHydration.activeQuery || previousLive.catalog?.activeQuery || null,
    inFlightQueryKey: snapshotCatalogHydration.inFlightQueryKey || null,
    firstReadyAt: previousLive.catalog?.firstReadyAt || snapshotCatalogHydration.firstReadyAt || new Date().toISOString(),
    fullReadyAt:
      nextCatalogPhase === "ready"
        ? snapshotCatalogHydration.fullReadyAt || new Date().toISOString()
        : previousLive.catalog?.fullReadyAt || null,
    error: false,
  });
  invalidateProductDerivedCaches();
  state.routinePlanner = initial ? createRoutinePlannerState() : createRoutinePlannerState(previousRoutinePlanner);
  state.metadata = payload.metadata || {};
  state.syncStatus = statusPayload;
  state.live.apiBacked = snapshot.source === "api";
  state.live.snapshotVersion = Number(previousLive.snapshotVersion || 0) + 1;
  state.live.initialSnapshotFailure = initial ? snapshot.fallbackReason || null : previousLive.initialSnapshotFailure;
  state.live.startupSecondary = createStartupSecondaryState({ snapshotVersion: state.live.snapshotVersion });
  state.live.catalog = nextCatalogHydration;
  state.live.catalogFocus = createCatalogFocusedFilterState();
  state.live.eventCursor = statusPayload?.liveEventCursor || state.live.eventCursor || null;
  state.live.productComparisons = initial ? {} : preserveLiveCache(previousLive.productComparisons);
  state.live.productComparisonLoading = initial ? {} : { ...previousLive.productComparisonLoading };
  state.live.compareExplainers = initial ? {} : preserveLiveCache(previousLive.compareExplainers);
  state.live.compareExplainerLoading = initial ? {} : { ...previousLive.compareExplainerLoading };
  state.live.learnAnswers = initial ? {} : preserveLiveCache(previousLive.learnAnswers);
  state.live.learnAnswerLoading = initial ? {} : { ...previousLive.learnAnswerLoading };
  state.live.learnAnswerDrafts = initial ? {} : { ...state.live.learnAnswerDrafts };
  state.live.overview = {
    requestKey: null,
    scopeKey: null,
    scope: null,
    payloadScopeKey: null,
    payload: null,
    loading: false,
    error: false,
  };
  state.live.refreshQueuedForPlannerModal = false;
  state.live.lastRefreshAt = new Date().toISOString();
  state.freshness.catalog = statusPayload?.artifacts?.catalog?.generatedAt || payload.generatedAt || null;
  state.freshness.ratings =
    statusPayload?.artifacts?.ratings?.generatedAt ||
    latestTimestamp(ratingsPayload?.generatedAt, preserveSecondary ? state.freshness.ratings : payload.generatedAt);
  state.freshness.articles =
    statusPayload?.artifacts?.articles?.generatedAt ||
    articlePayload?.generatedAt ||
    (preserveSecondary ? state.freshness.articles : null);

  if (initial) {
    state.favoriteIds = [...new Set(loadFavorites().filter(Boolean))];
    state.shortlistStatuses = loadShortlistStatuses();
    Object.keys(state.shortlistStatuses).forEach((id) => {
      if (!state.favoriteIds.includes(id)) {
        delete state.shortlistStatuses[id];
      }
    });
    state.watchedItems = loadWatchedItems();
    state.legacyTrackedAlertIds = [...new Set(loadTrackedAlertIds().filter(Boolean))];
    state.savedArticleIds = [...new Set(loadSavedArticles().filter(Boolean))];
    state.userProfile = loadUserProfile();
    state.profile = state.userProfile.profile || "all";
    state.routineConcern = state.userProfile.goal || state.routineConcern;
    state.savedProfiles = loadSavedProfiles();
    state.savedRoutines = loadSavedRoutines();
  } else {
    state.favoriteIds = [...new Set(state.favoriteIds.filter(Boolean))];
    Object.keys(state.shortlistStatuses).forEach((id) => {
      if (!state.favoriteIds.includes(id)) {
        delete state.shortlistStatuses[id];
      }
    });
    state.watchedItems = getActiveWatchedItems();
    state.savedArticleIds = [...new Set(state.savedArticleIds.filter(Boolean))];
  }
  migrateLegacyWatchedItems();
  ensureShortlistStatuses(state.favoriteIds);
  normalizeShortlistDecisionStatuses({ fillSlots: true });
  persistShortlistStatuses();
  persistWatchedItems({ skipContinuitySync: true });

  if (
    initial &&
    state.ui.workMode &&
    state.ui.lastWorkView === "shortlist" &&
    resolveShellViewFromPathname() !== "shortlist" &&
    !state.favoriteIds.length
  ) {
    state.ui.lastWorkView = "catalog";
    state.ui.activeShellView = "catalog";
  }

  const { group: activeGroup, article } = resolveArticleSelection();
  state.articleGroup = activeGroup;
  state.articleId = article?.id || articleCatalog[0]?.id || "barrier-basics";
  return state.live.snapshotVersion;
}

export function renderCatalogHydrationShell() {
  syncWorkModeUi();
  renderFilters(state.metadata);
  setConcernChipSelection(state.concern);
  renderFreshnessBar();
  renderAffiliateDisclosure();
  syncUserProfileSurface();
  renderActiveShellSurface({ force: true });
  syncSupportDisclosureUi();
  document.documentElement.classList.add("app-hydrated");
}

export function renderSnapshot() {
  syncWorkModeUi();
  renderStats(state.metadata);
  renderFilters(state.metadata);
  setConcernChipSelection(state.concern);
  renderSavedPresets();
  renderFreshnessBar();
  renderAffiliateDisclosure();
  syncUserProfileSurface();
  renderActiveShellSurface({ force: true });
  syncSupportDisclosureUi();
}

export async function hydrateFullAppSnapshot() {
  if (state.live.catalog?.phase === "ready" && !state.live.catalog?.partial) {
    return null;
  }
  const activeQuery = buildCatalogApiQueryState({
    limit: LIVE_PRODUCTS_LIMIT,
    offset: 0,
    sort: "brand",
  });
  const requestKey = `api-full:${Date.now()}`;
  state.live.catalog = createCatalogHydrationState({
    ...state.live.catalog,
    phase: state.products.length ? "partial" : "loading",
    loading: !state.products.length,
    partial: Boolean(state.products.length),
    ready: false,
    fullRequestInFlight: true,
    activeQuery,
    requestKey,
    inFlightQueryKey: requestKey,
    error: false,
  });
  const stallTimer = window.setTimeout(() => {
    if (state.live.catalog?.requestKey !== requestKey || state.live.catalog?.phase === "ready") return;
    state.live.catalog = createCatalogHydrationState({
      ...state.live.catalog,
      phase: state.products.length ? "partial" : "loading",
      loading: !state.products.length,
      partial: Boolean(state.products.length),
      ready: false,
      fullRequestInFlight: true,
      error: true,
    });
    renderActiveShellSurface({ force: true });
  }, CATALOG_FULL_HYDRATION_STALL_MS);
  try {
    const snapshot = await fetchFullCatalogSnapshot({
      onProductsProgress: ({ loadedCount, total }) => {
        if (state.live.catalog?.requestKey !== requestKey) return;
        state.live.catalog = createCatalogHydrationState({
          ...state.live.catalog,
          phase: "partial",
          loading: false,
          partial: true,
          ready: false,
          fullRequestInFlight: true,
          activeQuery,
          total,
          loadedCount,
          error: Boolean(state.live.catalog?.error),
        });
      },
    });
    window.clearTimeout(stallTimer);
    if (state.live.catalog?.requestKey !== requestKey) {
      return null;
    }
    const snapshotVersion = applySnapshot(snapshot, { preserveSecondary: true });
    renderSnapshot();
    refreshConversionAfterSnapshot();
    refreshRoutinePlannerAfterSnapshot();
    void hydrateStartupSecondarySnapshot(snapshot, { snapshotVersion }).catch(() => {
      // Each domain is already failure-contained; keep the full catalog usable on unexpected setup errors.
    });
    return snapshot;
  } catch {
    window.clearTimeout(stallTimer);
    if (state.live.catalog?.requestKey !== requestKey) {
      return null;
    }
    state.live.catalog = createCatalogHydrationState({
      ...state.live.catalog,
      phase: state.products.length ? "partial" : "error",
      loading: false,
      partial: Boolean(state.products.length),
      ready: false,
      fullRequestInFlight: false,
      requestKey: null,
      inFlightQueryKey: null,
      error: true,
    });
    renderActiveShellSurface({ force: true });
    return null;
  }
}

export function refreshRoutinePlannerAfterSnapshot() {
  if (!state.live.apiBacked) return;
  if (!state.routinePlanner.plan) return;
  if (state.routinePlanner.loading || state.routinePlanner.syncingDraft || state.routinePlanner.restoringDraft) return;
  const plannerContextKey = getRoutinePlannerContextKey();
  if (state.routinePlanner.contextKey !== plannerContextKey) return;
  void fetchRoutinePlannerPlan(true, { preserveExistingPlan: true });
}

export function refreshConversionAfterSnapshot() {
  if (state.conversion.currentRoutineEntries.length) {
    void ensureBasketPlan("routine", state.conversion.currentRoutineEntries, {
      force: true,
      useLocalFallback: true,
    });
  }
  if (state.conversion.baskets.shortlist.requestKey) {
    const shortlistSubset = getShortlistCoreFirstSubset();
    if (shortlistSubset.length) {
      void ensureBasketPlan("shortlist", shortlistSubset, {
        force: true,
        dedupe: true,
        useLocalFallback: true,
      });
    }
  }
  if (getEffectiveTrackedIds().length) {
    void ensureTrackedAlerts(true);
  }
}

export async function refreshStatusOnly() {
  if (!state.live.apiBacked) return;
  try {
    const statusPayload = await fetchJson("/api/status");
    state.syncStatus = statusPayload;
    state.live.eventCursor = statusPayload?.liveEventCursor || state.live.eventCursor;
    state.freshness.catalog = statusPayload?.artifacts?.catalog?.generatedAt || state.freshness.catalog;
    state.freshness.ratings = statusPayload?.artifacts?.ratings?.generatedAt || state.freshness.ratings;
    state.freshness.articles = statusPayload?.artifacts?.articles?.generatedAt || state.freshness.articles;
    renderFreshnessBar();
  } catch {
    // Ignore status-only refresh failures.
  }
}

export async function refreshDataInPlace() {
  if (state.ui.openRoutineChooserStep) {
    state.live.refreshQueuedForPlannerModal = true;
    return;
  }
  if (state.live.catalog?.fullRequestInFlight) {
    await refreshStatusOnly();
    return;
  }
  if (state.live.refreshInFlight) return;
  state.live.refreshInFlight = true;
  renderProfileStatus();
  try {
    const snapshot = await fetchAppSnapshot();
    applySnapshot(snapshot);
    renderSnapshot();
    refreshConversionAfterSnapshot();
    refreshRoutinePlannerAfterSnapshot();
  } finally {
    state.live.refreshInFlight = false;
    renderProfileStatus();
  }
}

export function subscribeToLiveEvents() {
  if (isPublicShowcase()) return;
  if (!window.EventSource) return;
  let source;
  try {
    source = new EventSource(buildApiUrl("/api/events"));
  } catch {
    return;
  }

  source.onopen = () => {
    state.live.sseConnected = true;
    renderProfileStatus();
    renderFreshnessBar();
  };

  source.onmessage = async (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (!payload?.cursor || payload.cursor === state.live.eventCursor) return;
      state.live.eventCursor = payload.cursor;
      const changed = payload.changedDomains || {};
      if (changed.products || changed.catalog || changed.articles || changed.ratings) {
        await refreshDataInPlace();
        if (changed.continuity) {
          await refreshContinuityInPlace();
        }
        if (changed.notifications) {
          await ensureTrackedAlerts(true);
        }
      } else if (changed.continuity) {
        await refreshContinuityInPlace();
        if (changed.notifications) {
          await ensureTrackedAlerts(true);
        }
      } else if (changed.notifications) {
        await ensureTrackedAlerts(true);
        await refreshStatusOnly();
      } else {
        await refreshStatusOnly();
      }
    } catch {
      // Ignore malformed live events and wait for the next one.
    }
  };

  source.onerror = () => {
    state.live.sseConnected = false;
    renderProfileStatus();
    renderFreshnessBar();
  };
}

export function startDataRefreshWatcher() {
  if (isPublicShowcase()) return;
  subscribeToLiveEvents();
  window.setInterval(async () => {
    try {
      if (state.live.apiBacked) {
        const statusPayload = await fetchJson("/api/status");
        if (statusPayload?.liveEventCursor && statusPayload.liveEventCursor !== state.live.eventCursor) {
          state.syncStatus = statusPayload;
          state.live.eventCursor = statusPayload.liveEventCursor;
          const changed = (statusPayload.liveUpdates || {}).changedDomains || {};
          if (changed.products || changed.catalog || changed.articles || changed.ratings) {
            await refreshDataInPlace();
            if (changed.continuity) {
              await refreshContinuityInPlace();
            }
            if (changed.notifications) {
              await ensureTrackedAlerts(true);
            }
          } else if (changed.continuity) {
            await refreshContinuityInPlace();
            if (changed.notifications) {
              await ensureTrackedAlerts(true);
            }
          } else if (changed.notifications) {
            await ensureTrackedAlerts(true);
          } else {
            renderFreshnessBar();
          }
          return;
        }
        state.syncStatus = statusPayload;
        renderFreshnessBar();
        return;
      }

      const snapshot = await fetchStaticSnapshot();
      const nextCatalog = snapshot.statusPayload?.artifacts?.catalog?.generatedAt || snapshot.payload?.generatedAt || null;
      const nextRatings =
        snapshot.statusPayload?.artifacts?.ratings?.generatedAt ||
        latestTimestamp(snapshot.ratingsPayload?.generatedAt, snapshot.payload?.generatedAt);
      const nextArticles = snapshot.statusPayload?.artifacts?.articles?.generatedAt || snapshot.articlePayload?.generatedAt || null;

      if (
        nextCatalog !== state.freshness.catalog ||
        nextRatings !== state.freshness.ratings ||
        nextArticles !== state.freshness.articles
      ) {
        applySnapshot(snapshot);
        renderSnapshot();
      }
    } catch {
      // Ignore background refresh failures and keep the current UI state.
    }
  }, DATA_REFRESH_INTERVAL_MS);
}
