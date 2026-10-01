const API_ORIGIN_STORAGE_KEY = "skincare-hub-api-origin";
const PUBLIC_APP_BASE_URL = new URL("./", import.meta.url).href;

function parseRegistrationScope(registration, pageUrl, appBaseUrl) {
  try {
    const scope = new URL(registration.scope);
    const page = new URL(pageUrl);
    const appBase = new URL(appBaseUrl);
    if (scope.origin !== page.origin || scope.origin !== appBase.origin) return null;
    return { scope, page, appBase };
  } catch {
    return null;
  }
}

function registrationBelongsToPublicApp(registration, pageUrl, appBaseUrl) {
  const urls = parseRegistrationScope(registration, pageUrl, appBaseUrl);
  if (!urls || !urls.scope.href.startsWith(urls.appBase.href)) return false;
  const expectedScriptUrl = new URL(["service", "worker.js"].join("-"), urls.appBase).href;
  const workers = [registration.active, registration.waiting, registration.installing].filter(Boolean);
  return Boolean(
    workers.length &&
      workers.every((worker) => {
        try {
          return new URL(worker.scriptURL).href === expectedScriptUrl;
        } catch {
          return false;
        }
      }),
  );
}

function registrationCanControlPage(registration, pageUrl, appBaseUrl) {
  const urls = parseRegistrationScope(registration, pageUrl, appBaseUrl);
  return Boolean(urls && urls.page.href.startsWith(urls.scope.href));
}

export async function enforcePublicStaticPreflight({
  storage,
  serviceWorker,
  pageUrl,
  appBaseUrl = PUBLIC_APP_BASE_URL,
  reload,
  blockAfterReload = true,
} = {}) {
  if (storage === undefined) {
    try {
      storage = window.localStorage;
    } catch {
      storage = null;
    }
  }
  if (serviceWorker === undefined) {
    try {
      serviceWorker = navigator.serviceWorker;
    } catch {
      throw new Error("Public static-safety preflight could not inspect service-worker state");
    }
  }
  pageUrl ||= window.location.href;
  reload ||= () => window.location.reload();
  try {
    storage?.removeItem(API_ORIGIN_STORAGE_KEY);
  } catch {
    // Storage availability cannot enable a network path in the public build.
  }
  if (!serviceWorker) return { cleanedRegistrations: 0, reloading: false };

  const registrations = await serviceWorker.getRegistrations();
  let rootNamespace = true;
  try {
    rootNamespace = new URL(appBaseUrl).pathname === "/";
  } catch {
    // An unparseable namespace must never grant service-worker ownership.
  }
  const appRegistrations = rootNamespace
    ? []
    : registrations.filter((registration) =>
        registrationBelongsToPublicApp(registration, pageUrl, appBaseUrl),
      );
  const foreignAncestorRegistrations = registrations.filter(
    (registration) =>
      (rootNamespace || !registrationBelongsToPublicApp(registration, pageUrl, appBaseUrl))
      && registrationCanControlPage(registration, pageUrl, appBaseUrl),
  );

  const cleanupFailures = [];
  for (const registration of appRegistrations) {
    try {
      const subscription = await registration.pushManager?.getSubscription?.();
      if (subscription) {
        const unsubscribed = await subscription.unsubscribe();
        if (!unsubscribed) cleanupFailures.push("push subscription removal returned false");
      }
    } catch {
      cleanupFailures.push("push subscription removal failed");
    }
    try {
      const unregistered = await registration.unregister();
      if (!unregistered) cleanupFailures.push("service-worker removal returned false");
    } catch {
      cleanupFailures.push("service-worker removal failed");
    }
  }

  try {
    const remaining = (await serviceWorker.getRegistrations()).filter((registration) =>
      registrationBelongsToPublicApp(registration, pageUrl, appBaseUrl),
    );
    if (remaining.length) cleanupFailures.push("service-worker removal could not be verified");
  } catch {
    cleanupFailures.push("service-worker removal verification failed");
  }
  if (foreignAncestorRegistrations.length) {
    cleanupFailures.push("an ancestor service worker outside the public app namespace can control this page");
  }
  if (rootNamespace && serviceWorker.controller) {
    cleanupFailures.push("a root-namespace service worker controller cannot be attributed safely");
  }
  if (cleanupFailures.length) throw new Error("Public static-safety preflight could not remove legacy notification state");

  if (serviceWorker.controller) {
    reload();
    if (blockAfterReload) await new Promise(() => {});
    return { cleanedRegistrations: appRegistrations.length, reloading: true };
  }
  return { cleanedRegistrations: appRegistrations.length, reloading: false };
}
