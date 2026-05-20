const CACHE_VERSION = "rwr-cache-2026-05-19-1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const MANIFEST_URL = "./data/asset-manifest.json";
const PLAYER_MANIFEST_URL = "./data/rwr-players-pacific.meta.json";
const MANIFEST_TTL = 30000;
const PLAYER_STREAM_FORMAT = "rwr-player-stream-v1";
const PLAYER_STABLE_FIELDS = [
  "leaderboard_position",
  "username",
  "kills",
  "deaths",
  "score",
  "kd_ratio",
  "time_played",
  "longest_kill_streak",
  "targets_destroyed",
  "vehicles_destroyed",
  "soldiers_healed",
  "teamkills",
  "distance_moved",
  "shots_fired",
  "throwables_thrown",
  "xp"
];

let manifestState = {
  checkedAt: 0,
  latest: null,
  cached: null,
  promise: null
};
let playerManifestState = {
  checkedAt: 0,
  latest: null,
  cached: null,
  promise: null
};
const verifiedResponses = new Map();

const APP_SHELL = [
  "./",
  "./index.html",
  "./model-viewer.html",
  "./ico.webp",
  "./data/asset-manifest.json",
  "./data/vehicles.json",
  "./data/weapons.json",
  "./data/maps.json",
  "./data/rwr-players-pacific.meta.json",
  "./model/models.json"
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

  if (url.pathname.endsWith("/asset-manifest.json")) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (url.pathname.endsWith("/data/rwr-players-pacific.meta.json")) {
    event.respondWith(playerManifestCache(request));
    return;
  }

  if (url.pathname.endsWith("/data/rwr-players-pacific.json")) {
    event.respondWith(playerDataCache(request));
    return;
  }

  if (request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/model-viewer.html")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.endsWith(".json")) {
    event.respondWith(manifestAwareCache(request));
    return;
  }

  if (/\.(html|js|json|png|jpg|jpeg|webp|gif|svg|ico|glb|blend)$/i.test(url.pathname)) {
    event.respondWith(manifestAwareCache(request));
    return;
  }
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
    const fallbackPage = requestPath(request.url) === "model-viewer.html"
      ? "./model-viewer.html"
      : "./index.html";
    return (await cache.match(request)) || (await caches.match(fallbackPage)) || (await caches.match("./index.html")) || Response.error();
  }
}

async function networkOnly(request) {
  const response = await fetch(request, { cache: "no-store" });
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

async function networkOnlyNoStore(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.delete(request);
  const response = await fetch(request, { cache: "no-store" });
  await cache.delete(request);
  return response;
}

async function playerManifestCache(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      cache.put(request, response.clone());
      return response;
    }
    if (response.status === 404 || response.status === 410) {
      await cache.delete(request);
    }
    return response;
  } catch (error) {
    return cached || Response.error();
  }
}

async function playerDataCache(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const manifests = await getPlayerManifests().catch(() => ({ latest: null, cached: null }));
  const latestHash = manifests.latest?.version || null;

  if (cached && latestHash && await cachedPlayerResponseMatches(request.url, cached.clone(), latestHash)) {
    return cached;
  }

  if (!latestHash && cached) {
    return cached;
  }

  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      if (latestHash && !await responseMatchesPlayerHash(response.clone(), latestHash)) {
        await cache.delete(request);
        return response;
      }
      rememberVerified(request.url, latestHash);
      cache.put(request, response.clone());
    } else if (response.status === 404 || response.status === 410) {
      await cache.delete(request);
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function manifestAwareCache(request) {
  const path = requestPath(request.url);
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const manifests = await getManifests().catch(() => ({ latest: null, cached: null }));
  const previousHash = manifests.cached?.files?.[path] || null;
  const latestHash = manifests.latest?.files?.[path] || null;

  if (cached && latestHash && await cachedResponseMatches(request.url, cached.clone(), latestHash)) {
    return cached;
  }

  if (latestHash === null && previousHash !== null) {
    await cache.delete(request);
  }

  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response.ok) {
      if (latestHash && !await responseMatchesHashText(response.clone(), latestHash)) {
        await cache.delete(request);
        return response;
      }
      rememberVerified(request.url, latestHash);
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

async function cachedResponseMatches(requestUrl, response, expectedHash) {
  const cacheKey = verifiedCacheKey(requestUrl, expectedHash);
  if (verifiedResponses.get(cacheKey)) return true;
  const matches = await responseMatchesHashText(response, expectedHash);
  if (matches) rememberVerified(requestUrl, expectedHash);
  return matches;
}

async function cachedPlayerResponseMatches(requestUrl, response, expectedHash) {
  const cacheKey = verifiedCacheKey(requestUrl, expectedHash);
  if (verifiedResponses.get(cacheKey)) return true;
  const matches = await responseMatchesPlayerHash(response, expectedHash);
  if (matches) rememberVerified(requestUrl, expectedHash);
  return matches;
}

function rememberVerified(requestUrl, expectedHash) {
  if (!expectedHash) return;
  verifiedResponses.set(verifiedCacheKey(requestUrl, expectedHash), true);
  if (verifiedResponses.size > 500) {
    verifiedResponses.delete(verifiedResponses.keys().next().value);
  }
}

function verifiedCacheKey(requestUrl, expectedHash) {
  return `${requestPath(requestUrl)}:${expectedHash}`;
}

async function responseMatchesHashText(response, expectedHash) {
  try {
    const buffer = await response.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return hexDigest(digest) === expectedHash;
  } catch (error) {
    return false;
  }
}

function hexDigest(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

async function getPlayerManifests() {
  if (playerManifestState.promise) return playerManifestState.promise;
  if (playerManifestState.latest && Date.now() - playerManifestState.checkedAt < MANIFEST_TTL) {
    return { latest: playerManifestState.latest, cached: playerManifestState.cached };
  }
  playerManifestState.promise = loadPlayerManifestPair().finally(() => {
    playerManifestState.promise = null;
  });
  return playerManifestState.promise;
}

async function loadPlayerManifestPair() {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(PLAYER_MANIFEST_URL);
  const cached = cachedResponse ? await cachedResponse.clone().json().catch(() => null) : null;
  let latest = null;
  try {
    const response = await fetch(PLAYER_MANIFEST_URL, { cache: "no-store" });
    if (response.ok) {
      latest = await response.clone().json();
      await cache.put(PLAYER_MANIFEST_URL, response);
    }
  } catch (error) {
    latest = null;
  }
  playerManifestState = {
    checkedAt: Date.now(),
    latest,
    cached,
    promise: null
  };
  return { latest, cached };
}

async function responseMatchesPlayerHash(response, expectedHash) {
  try {
    const text = await response.text();
    const json = parsePlayerPayload(text);
    const stablePayload = {
      source: json.source,
      database: json.database,
      count: json.count,
      players: Array.isArray(json.players)
        ? json.players.map((player) => {
          const entry = {};
          for (const field of PLAYER_STABLE_FIELDS) {
            entry[field] = player?.[field] ?? null;
          }
          return entry;
        })
        : []
    };
    const buffer = new TextEncoder().encode(JSON.stringify(stablePayload));
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    return hexDigest(digest) === expectedHash;
  } catch (error) {
    return false;
  }
}

function parsePlayerPayload(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { source: null, database: null, count: 0, players: [] };
  }

  const firstNewline = trimmed.indexOf("\n");
  if (firstNewline > 0) {
    try {
      const header = JSON.parse(trimmed.slice(0, firstNewline).trim());
      if (header?.format === PLAYER_STREAM_FORMAT) {
        const players = trimmed
          .slice(firstNewline + 1)
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => JSON.parse(line));
        return {
          source: header.source,
          database: header.database,
          count: header.count,
          players
        };
      }
    } catch (error) {
      // Fall through to legacy JSON parsing.
    }
  }

  const legacy = JSON.parse(trimmed);
  return {
    source: legacy.source,
    database: legacy.database,
    count: legacy.count,
    players: Array.isArray(legacy) ? legacy : legacy.players
  };
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CLEAR_RWR_CACHES") return;
  manifestState = {
    checkedAt: 0,
    latest: null,
    cached: null,
    promise: null
  };
  playerManifestState = {
    checkedAt: 0,
    latest: null,
    cached: null,
    promise: null
  };
  verifiedResponses.clear();
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith("rwr-cache-"))
        .map((key) => caches.delete(key))))
  );
});

function requestPath(requestUrl) {
  const url = new URL(requestUrl);
  const scope = new URL(self.registration.scope);
  let pathname = decodeURIComponent(url.pathname);
  const scopePath = decodeURIComponent(scope.pathname);
  if (pathname.startsWith(scopePath)) {
    pathname = pathname.slice(scopePath.length);
  } else {
    pathname = pathname.replace(/^\/+/, "");
  }
  if (!pathname || pathname.endsWith("/")) return "index.html";
  return pathname.replace(/^\/+/, "");
}
