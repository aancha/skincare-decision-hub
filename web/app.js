import * as stateModule from "./js/state.js";
import * as apiModule from "./js/api.js";
import * as guardrailsModule from "./js/guardrails.js";
import * as catalogModule from "./js/catalog.js";
import * as cardsModule from "./js/cards.js";
import * as routineModule from "./js/routine.js";
import * as shortlistModule from "./js/shortlist.js";
import * as residualShadowDemoModule from "./js/recommender_residual_shadow_demo.js";

const moduleNamespaces = [
  stateModule,
  apiModule,
  guardrailsModule,
  routineModule,
  shortlistModule,
  residualShadowDemoModule,
  cardsModule,
  catalogModule,
];

const exportOverrides = new Map();
const app = {};

moduleNamespaces.forEach((moduleNamespace) => {
  Object.keys(moduleNamespace).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(app, key)) return;
    Object.defineProperty(app, key, {
      configurable: true,
      enumerable: true,
      get: () => (exportOverrides.has(key) ? exportOverrides.get(key) : moduleNamespace[key]),
      set: (value) => {
        exportOverrides.set(key, value);
      },
    });
  });
});

Object.keys(app).forEach((key) => {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    get: () => app[key],
    set: (value) => {
      app[key] = value;
    },
  });
});
globalThis.SkinCareHubApp = app;

function runContainedPostRenderTask(task) {
  void Promise.resolve()
    .then(task)
    .catch(() => {
      // Keep optional post-render work from replacing an already usable catalog.
    });
}

async function init() {
  app.applyDecisionDeskStaticCopy();
  app.setupShellScrollRestoration();
  const continuitySession = app.loadContinuitySession();
  app.state.continuity = app.createContinuityState({
    ...app.state.continuity,
    ...continuitySession,
    shadow: app.loadContinuityShadowState(),
    available: Boolean(continuitySession.token),
  });
  app.loadUiSessionState();
  app.markCatalogHydrationLoading();
  app.syncShellHistory(app.state.ui.activeShellView, { replace: true });
  app.wireEvents();
  app.renderCatalogHydrationShell();
  const guardrailsPromise = app.loadSkincareGuardrails();
  const snapshotPromise = app.fetchInitialAppSnapshot();
  await guardrailsPromise;
  const snapshot = await snapshotPromise;
  const snapshotVersion = app.applySnapshot(snapshot, { initial: true });
  app.renderSnapshot();
  runContainedPostRenderTask(() => app.hydrateStartupSecondarySnapshot(snapshot, { snapshotVersion }));
  if (snapshot.source === "api" && app.state.live.catalog?.partial) {
    runContainedPostRenderTask(() => app.hydrateFullAppSnapshot());
  }
  runContainedPostRenderTask(async () => {
    if (app.state.live.apiBacked) {
      await app.bootstrapContinuity();
    }
    await app.restoreRoutinePlannerSession();
    app.renderSnapshot();
  });
  app.startDataRefreshWatcher();
  app.syncShellHistory(app.state.ui.activeShellView, { replace: true });
  const pendingOverviewLauncher = app.state.ui.pendingOverviewLauncher;
  app.state.ui.pendingOverviewLauncher = null;
  if (pendingOverviewLauncher && (app.state.ui.activeShellView === "overview" || app.state.ui.activeShellView === "catalog")) {
    app.applyOverviewLauncher(pendingOverviewLauncher);
  }
}

init().catch((error) => {
  app.resultsTitle.textContent = "Unable to load catalog";
  app.resultsCaption.textContent = error.message;
});
