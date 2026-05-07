const CACHE_VERSION = "rwr-cache-2026-05-07-6";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const MANIFEST_URL = "./asset-manifest.json";
const MANIFEST_TTL = 30000;

let manifestState = {
  checkedAt: 0,
  latest: null,
  cached: null,
  promise: null
};

const APP_SHELL = [
  "./",
  "./index.html",
  "./ico.webp",
  "./asset-manifest.json",
  "./data/vehicles.json",
  "./data/weapons.json",
  "./data/maps.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => !key.startsWith(CACHE_VERSION))
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/asset-manifest.json")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.endsWith(".json")) {
    event.respondWith(manifestAwareCache(request));
    return;
  }

  if (/\.(html|js|json|png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(manifestAwareCache(request));
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CLEAR_RWR_CACHES") return;
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("rwr-cache-"))
        .map((key) => caches.delete(key))))
  );
});

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (response.ok) {
      cache.put(request, response.clone());
    } else if (response.status === 404 || response.status === 410) {
      await cache.delete(request);
    }
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await caches.match("./index.html")) || Response.error();
  }
}

async function networkOnly(request) {
  const response = await fetch(request, { cache: "no-cache" });
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  } else if (response.status === 404 || response.status === 410) {
    await cache.delete(request);
  }
  return response;
}

async function manifestAwareCache(request) {
  const path = requestPath(request.url);
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const manifests = await getManifests();
  const previousHash = manifests.cached?.files?.[path] || null;
  const latestHash = manifests.latest?.files?.[path] || null;

  if (cached && latestHash && previousHash === latestHash) {
    return cached;
  }

  if (latestHash === null && previousHash !== null) {
    await cache.delete(request);
    return new Response("Resource removed", { status: 410, statusText: "Gone" });
  }

  try {
    const response = await fetch(request, { cache: "no-cache" });
    if (response.ok) {
      cache.put(request, response.clone());
    } else if (response.status === 404 || response.status === 410) {
      await cache.delete(request);
    }
    return response;
  } catch (error) {
    if (cached && !manifests.latest) return cached;
    throw error;
  }
}

async function getManifests() {
  if (manifestState.promise) return manifestState.promise;
  if (manifestState.latest && Date.now() - manifestState.checkedAt < MANIFEST_TTL) {
    return { latest: manifestState.latest, cached: manifestState.cached };
  }
  manifestState.promise = loadAssetManifestPair().finally(() => {
    manifestState.promise = null;
  });
  return manifestState.promise;
}

async function loadAssetManifestPair() {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(MANIFEST_URL);
  const cached = cachedResponse ? await cachedResponse.clone().json().catch(() => null) : null;
  let latest = null;
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (response.ok) {
      latest = await response.clone().json();
      await cache.put(MANIFEST_URL, response);
    }
  } catch (error) {
    latest = null;
  }
  manifestState = {
    checkedAt: Date.now(),
    latest,
    cached,
    promise: null
  };
  return { latest, cached };
}

function requestPath(requestUrl) {
  const url = new URL(requestUrl);
  const scope = new URL(self.registration.scope);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith(scope.pathname)) {
    pathname = pathname.slice(scope.pathname.length);
  } else {
    pathname = pathname.replace(/^\/+/, "");
  }
  if (!pathname || pathname.endsWith("/")) return "index.html";
  return pathname.replace(/^\/+/, "");
}
