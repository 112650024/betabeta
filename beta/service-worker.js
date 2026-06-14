const CACHE_NAME = "beta-demo-v26";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./assets/icon.svg",
  "./assets/avatar-green.png",
  "./assets/avatar-orange.png",
  "./assets/avatar-red.png",
  "./assets/peer-huimin.png",
  "./assets/peer-yishan.png",
];

self.addEventListener("install", (event) => {
  // 新版 SW 立刻接手，不用等所有分頁關閉
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  // 跨網域(Firebase / gstatic 等)不攔截，直接走網路
  if (url.origin !== self.location.origin) return;

  // 同網域的 HTML / JS / CSS / JSON → 網路優先：有網路就拿最新，離線才用快取
  if (
    event.request.mode === "navigate" ||
    url.pathname === "/" ||
    /\.(?:js|css|html|json)$/.test(url.pathname)
  ) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // 其他(圖片等)維持快取優先
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
