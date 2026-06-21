const CACHE_NAME = "quiz-force-latest-normal-url-force-latest-normal-url-20260621-001";
const APP_SHELL = ["./manifest.json","./icon-192.png","./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // 通常URL・index.htmlは常にネットワーク優先。古いindex.htmlをキャッシュから先に返さない。
  if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      fetch(req, { cache: "no-store" })
        .then(res => res)
        .catch(() => caches.match("./").then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  // service-worker.js自体もネットワーク優先
  if (url.pathname.endsWith("/service-worker.js")) {
    event.respondWith(fetch(req, { cache: "no-store" }));
    return;
  }

  // 静的アセットのみキャッシュ利用
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }))
  );
});
