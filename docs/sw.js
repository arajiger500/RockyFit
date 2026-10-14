/* No network dependencies. Version is updated when the offline shell changes. */
const CACHE = "rockyfit-offline-v2-20261014";
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./plan.js",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) =>
        key.startsWith("rockyfit-offline-") && key !== CACHE
      ).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put("./index.html", copy)));
        }
        return response;
      }).catch(async () =>
        (await caches.match(request)) ||
        (await caches.match("./index.html")) ||
        Response.error()
      )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((saved) => {
      if (saved) return saved;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
        }
        return response;
      });
    })
  );
});
