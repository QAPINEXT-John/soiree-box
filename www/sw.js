// Service worker de Soirée Box : met l'appli en cache pour qu'elle s'ouvre même sans réseau.
// Change CACHE à chaque mise à jour, et ajoute ici le fichier de chaque nouveau jeu.
const CACHE = "soireebox-4.6.1";
const FILES = [
  "./",
  "core.js",
  "firebase-app-compat.js",
  "firebase-auth-compat.js",
  "firebase-config.js",
  "firebase-database-compat.js",
  "fonts/bricolage-grotesque-latin-600-normal.woff2",
  "fonts/bricolage-grotesque-latin-700-normal.woff2",
  "fonts/bricolage-grotesque-latin-800-normal.woff2",
  "fonts/bricolage-grotesque-latin-ext-600-normal.woff2",
  "fonts/bricolage-grotesque-latin-ext-700-normal.woff2",
  "fonts/bricolage-grotesque-latin-ext-800-normal.woff2",
  "fonts/figtree-latin-400-normal.woff2",
  "fonts/figtree-latin-600-normal.woff2",
  "fonts/figtree-latin-800-normal.woff2",
  "fonts/figtree-latin-ext-400-normal.woff2",
  "fonts/figtree-latin-ext-600-normal.woff2",
  "fonts/figtree-latin-ext-800-normal.woff2",
  "games/actionverite.js",
  "games/defis.js",
  "games/dernierecarte.js",
  "games/killer.js",
  "games/loupgarou.js",
  "games/menteurs.js",
  "games/motsint.js",
  "games/note10.js",
  "games/photoroulette.js",
  "games/priorites.js",
  "games/punchline.js",
  "games/purete.js",
  "games/quiadit.js",
  "games/quiplus.js",
  "games/redflag.js",
  "games/tupref.js",
  "games/undercover.js",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png",
  "icons/icon-1024.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "index.html",
  "manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const path = new URL(req.url).pathname;
  // Page, cœur, jeux et config : réseau d'abord pour recevoir les mises à jour, cache si hors ligne.
  if (req.mode === "navigate" || /\/(core|firebase-config)\.js$/.test(path) || /\/games\//.test(path)) {
    event.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "index.html" : req, copy)); return res; })
        .catch(() => caches.match(req.mode === "navigate" ? "index.html" : req))
    );
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
