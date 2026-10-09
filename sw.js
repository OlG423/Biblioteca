// Cambia el número de versión cada vez que subas cambios,
// para que los dispositivos descarguen la versión nueva.
const CACHE = "biblioteca-v2";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then(hit => {
      if (hit) return hit;
      return fetch(event.request)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
