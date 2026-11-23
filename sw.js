/*
 * Offline support for the home-screen web app. Filled in at build time by vite.config.ts:
 * VERSION becomes a hash of the build, ASSETS the list of files to keep on the phone.
 * Only the empty app is cached. Student data never passes through here: it lives in IndexedDB.
 */
const VERSION = "82aaed6107f7";
const ASSETS = [
  "./",
  "./index.html",
  "./assets/index-teq0NF-m.js",
  "./assets/CaseloadStep-DlgTlW7e.js",
  "./assets/ClassListsStep-8Yzds5Ah.js",
  "./assets/ConcernsStep-bufO5WrB.js",
  "./assets/ConfirmStep-DyO4CA3y.js",
  "./assets/DisciplineStep-BMdEc1aL.js",
  "./assets/HistoryStep-Da97Y0Yp.js",
  "./assets/MyClassesStep-C2-ljGzG.js",
  "./assets/TimetableStep-C-qzNIZN.js",
  "./assets/classListPdf-B0bPjBcB.js",
  "./assets/classNotes-Bz2bGR2d.js",
  "./assets/esm-B4BOdWd0.js",
  "./assets/esm-BppUGoRp.js",
  "./assets/esm-C-36Qstd.js",
  "./assets/esm-CNla6vnP.js",
  "./assets/esm-STqYO1HL.js",
  "./assets/esm-hKYIhqJy.js",
  "./assets/files-ClDW02D0.js",
  "./assets/jsQR-B1eQcpQl.js",
  "./assets/jszip.min-CMUAYIqb.js",
  "./assets/logo-BoiPceLf.js",
  "./assets/observationsSheet-HkYR7yQY.js",
  "./assets/observationsWord-BJhGujUU.js",
  "./assets/pdf-B4qgaVv7.js",
  "./assets/pdf-CAyRursJ.js",
  "./assets/pdf.worker.min-DKdi9fvh.js",
  "./assets/periodReport-CTrG6Iez.js",
  "./assets/rolldown-runtime-Dd_uD5pT.js",
  "./assets/studentReport-CxopPt8r.js",
  "./assets/time-PUD3MHdy.js",
  "./assets/vault-E1gyQYw7.js",
  "./assets/web-9BnhUAEL.js",
  "./assets/web-CWVWrFpK.js",
  "./assets/web-CnppDNab.js",
  "./assets/web-CzkxyZMW.js",
  "./assets/web-D0U-7Bs8.js",
  "./assets/web-Q165Qwqq.js",
  "./assets/amiri-arabic-400-normal-D0NIBXga.woff2",
  "./assets/amiri-arabic-700-normal-D8FrblyB.woff2",
  "./assets/ibm-plex-sans-arabic-arabic-400-normal-CyU-ddYS.woff2",
  "./assets/ibm-plex-sans-arabic-arabic-500-normal-C4MQITzh.woff2",
  "./assets/ibm-plex-sans-arabic-arabic-600-normal-0pRdybE_.woff2",
  "./assets/ibm-plex-sans-arabic-arabic-700-normal-DrtBj6UE.woff2",
  "./assets/index-D_BhyBzo.css",
  "./assets/inter-latin-400-normal-C38fXH4l.woff2",
  "./assets/inter-latin-500-normal-Cerq10X2.woff2",
  "./assets/inter-latin-600-normal-LgqL8muc.woff2",
  "./assets/inter-latin-700-normal-Yt3aPRUw.woff2",
  "./assets/noto-kufi-arabic-arabic-500-normal-DrsK1iQh.woff2",
  "./assets/noto-kufi-arabic-arabic-700-normal-CGKuvZQr.woff2",
  "./assets/playfair-display-latin-600-normal-CZLGqjJe.woff2",
  "./assets/playfair-display-latin-700-normal-CuDiGg7c.woff2",
  "./assets/roboto-slab-latin-500-normal-DwNfslcc.woff2",
  "./assets/roboto-slab-latin-700-normal-WCCj9XVQ.woff2",
  "./icons/test-apple-touch-icon.png",
  "./icons/test-favicon-64.png",
  "./icons/test-icon-192.png",
  "./icons/test-icon-512.png",
  "./icons/test-maskable-512.png",
  "./manifest-test.webmanifest",
  "./brand/school-crest.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-64.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./manifest.webmanifest"
];
const CACHE = `imperial-counselling-${VERSION}`;
/**
 * Hosts mark files "Vary: Origin" or "Vary: Accept-Encoding", and the page's own script and style requests carry
 * different headers from the ones that filled the cache, so honouring Vary made every lookup miss and the app
 * opened blank offline. These are our own static files: the URL alone identifies them.
 */
const MATCH = { ignoreSearch: true, ignoreVary: true };
/** Update files are always read fresh, so a release is seen as soon as the phone is online. */
const NEVER_CACHED = /(?:^|\/)(?:version\.json|bundle-[^/]*\.zip)$/;

/*
 * A new version waits (no skipWaiting) until every page of the running one is closed, and is used from the next launch.
 * Taking over at once would delete, in activate, the cache that the open page still loads its lazy screens from,
 * while the release has already removed those files from the host. Copies are fetched past the browser's HTTP cache,
 * so a just-published index.html is never stored as the previous one.
 */
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })))));
});

// Runs only once no page uses the previous version any more, so its cache can go.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(name => name.startsWith('imperial-counselling-') && name !== CACHE).map(name => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

function fromNetworkThenCache(request, fallbackUrl) {
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
  return Promise.race([fetch(request), timeout])
    .then(response => {
      if (response.ok) {
        caches.open(CACHE).then(cache => cache.put(fallbackUrl, response.clone()));
        return response.clone();
      }
      if (response.type === 'opaqueredirect') return response;
      // The host answered with an error page (an outage, or the site withdrawn or moved): the kept copy still opens the app.
      return caches.match(fallbackUrl, MATCH).then(hit => hit || response);
    })
    .catch(() => caches.match(fallbackUrl, MATCH).then(hit => hit || Response.error()));
}

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || NEVER_CACHED.test(url.pathname)) return;

  // The page itself: newest when online (so an update arrives by itself), the kept copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(fromNetworkThenCache(request, new URL('./index.html', self.registration.scope).href));
    return;
  }

  // Everything else has its content hash in its name, or rarely changes: kept copy first.
  event.respondWith(
    caches.match(request, MATCH).then(hit => hit || fetch(request).then(response => {
      if (response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, copy));
      }
      return response;
    })),
  );
});
