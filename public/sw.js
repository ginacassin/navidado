// Navidado: caché para que el modo «un solo móvil» funcione sin conexión.
// __BUILD_ID__ se sustituye en cada build: cada versión usa una caché nueva y borra las anteriores.
const CACHE = 'navidado-__BUILD_ID__';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/', '/icon.svg', '/manifest.webmanifest'])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.startsWith('/socket.io') || url.pathname === '/health' || url.pathname === '/sw.js') return;
  // Recursos con hash en el nombre: caché primero (nunca cambian).
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
            }
            return res;
          })
      )
    );
    return;
  }
  // Páginas y resto: siempre red primero (sin caché HTTP); la caché solo sirve sin conexión.
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then((res) => {
        if (res.ok && e.request.mode === 'navigate') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('/', copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match('/')))
  );
});
