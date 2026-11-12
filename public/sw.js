// Service worker SenYummies (App Client).
// - Pages : reseau d'abord, repli sur la coquille en cache hors connexion.
// - Fichiers de l'app (JS/CSS/icones/polices) : cache, mis a jour en fond.
// - Photos : cache limite (affichage rapide du menu deja vu).
// - API (menu, zones, commandes, statuts) : JAMAIS mise en cache — un statut
//   de commande ou un prix perime serait pire qu'une erreur reseau.
const VERSION = 'v1';
const CACHE_APP = `senyummies-app-${VERSION}`;
const CACHE_IMAGES = `senyummies-images-${VERSION}`;
const MAX_IMAGES = 80;
const COQUILLE = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_APP).then((cache) => cache.addAll(COQUILLE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => ![CACHE_APP, CACHE_IMAGES].includes(c)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

async function limiter(nomCache, max) {
  const cache = await caches.open(nomCache);
  const cles = await cache.keys();
  for (let i = 0; i < cles.length - max; i += 1) await cache.delete(cles[i]);
}

async function cacheEnFond(requete, nomCache) {
  const cache = await caches.open(nomCache);
  const enCache = await cache.match(requete);
  const reseau = fetch(requete)
    .then((reponse) => {
      if (reponse && (reponse.ok || reponse.type === 'opaque')) {
        cache.put(requete, reponse.clone());
        if (nomCache === CACHE_IMAGES) limiter(CACHE_IMAGES, MAX_IMAGES);
      }
      return reponse;
    })
    .catch(() => enCache);
  return enCache || reseau;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Navigation (ouverture de l'app, changement de page) : reseau d'abord.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((reponse) => {
          const copie = reponse.clone();
          caches.open(CACHE_APP).then((cache) => cache.put('/index.html', copie));
          return reponse;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheEnFond(request, CACHE_IMAGES));
    return;
  }

  const estFichierApp =
    (url.origin === self.location.origin &&
      (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest')) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (estFichierApp) {
    event.respondWith(cacheEnFond(request, CACHE_APP));
  }
  // Tout le reste (API) : comportement reseau normal, sans cache.
});
