const CACHE_VERSION = "v3";
const CACHE_NAME = `kocobot-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/CHAT-ACR0/",
  "/CHAT-ACR0/index.html",
  "/CHAT-ACR0/icon-192.png",
  "/CHAT-ACR0/icon-512.png",
  "/CHAT-ACR0/app.js"
];

// 🔹 INSTALL
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// 🔹 ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 🔹 FETCH (solo GET + mismo origen)
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
