// Despensa: funciona sin conexión y siempre intenta cargar la última versión
const CACHE = "despensa-v4";
const LIBS = /(www\.gstatic\.com\/firebasejs|cdn\.jsdelivr\.net\/npm\/@zxing|fonts\.googleapis\.com|fonts\.gstatic\.com)/;
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // la app: primero internet (para tener siempre la versión nueva), si no hay, la guardada
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("./"))));
  } else if (LIBS.test(req.url)) {
    // librerías: la guardada, y si no está, de internet
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const c = n.clone(); caches.open(CACHE).then(x => x.put(req, c)); return n; })));
  }
});
