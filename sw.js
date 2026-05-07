const CACHE_VERSION = "rwr-cache-2026-05-07-2";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const MANIFEST_URL = "./asset-manifest.json";

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

  if (request.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.endsWith(".json")) {
    event.respondWith(manifestNetworkFirst(request));
    return;
  }

  if (/\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(manifestCacheFirst(request));
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
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (await caches.match("./index.html")) || Response.error();
  }
}

async function manifestNetworkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const key = await manifestCacheKey(request);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(key, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(key)) || (await cache.match(request)) || Response.error();
  }
}

async function manifestCacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const key = await manifestCacheKey(request);
  const cached = await cache.match(key);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(key, response.clone());
  return response;
}

async function manifestCacheKey(request) {
  const hash = await manifestHashForRequest(request);
  if (!hash) return request;
  const url = new URL(request.url);
  url.searchParams.set("__rwr_hash", hash);
  return new Request(url.toString(), { method: "GET" });
}

async function manifestHashForRequest(request) {
  const manifest = await loadAssetManifest();
  if (!manifest?.files) return "";
  const path = requestPath(request.url);
  return manifest.files[path] || "";
}

async function loadAssetManifest() {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (response.ok) {
      cache.put(MANIFEST_URL, response.clone());
      return response.json();
    }
  } catch (error) {
    // Fall through to the cached manifest for offline use.
  }
  const cached = await cache.match(MANIFEST_URL);
  return cached ? cached.json() : null;
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
