// The Infinity Art — app-shell service worker.
// Scope per §3/§10: cache the shell + static assets only. No offline data
// sync — server actions still need a real connection. Hand-written rather
// than a bundler plugin (Serwist's webpack integration doesn't run under
// Next 16's Turbopack build) so there's nothing to wire into next.config.ts.

const CACHE_VERSION = "v1";
const CACHE_NAME = `infinity-shell-${CACHE_VERSION}`;

const SHELL_URLS = [
  "/login",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API/data traffic — Supabase calls, server actions, RSC
  // fetches all need a live network round trip.
  if (url.pathname.startsWith("/api/")) return;

  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest";

  if (isStaticAsset) {
    // Cache-first: these are content-hashed or effectively immutable.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    // Network-first for pages: always show live data when online, fall back
    // to the cached shell (the login screen) only when truly offline.
    event.respondWith(
      fetch(request).catch(() => caches.match("/login").then((res) => res || Response.error())),
    );
  }
});
