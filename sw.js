/* ═════════════════════════════════════════════════════════════════
   Service worker — offline study.

   Students study on phones, on school wifi, on the bus. Losing the page
   because a tunnel ate the connection is a reason not to come back.

   Strategy, chosen so a bad cache can never outlive a deploy:
     · navigations (HTML) → network first, cache as backup. Online you
       always get the deployed page; offline you get the last one you
       opened. An event page you have studied is therefore available
       offline; one you have never opened is not, and says so.
     · our own css/js → network first, cache as backup, for the same
       reason as HTML. These used to be stale-while-revalidate, which
       meant a deploy did not take effect until the load AFTER the one
       that fetched it: index.html arrived new while aura.css came from
       the cache, so the page rendered with last week's stylesheet. One
       shipped that way — a whole tab rendered unstyled — and "it comes
       right if you reload" is not something a student will do.
     · images and fonts → stale-while-revalidate. They change rarely and
       the latency win is real.
     · everything cross-origin (Firebase, fonts, analytics) → straight to
       the network, never cached. Auth and the database must not be
       served from a cache.

   Bump CACHE to invalidate everything.
   ═════════════════════════════════════════════════════════════════ */
// Bumped to v2 to evict the stale css/js the old strategy left behind.
const CACHE = 'hosa-v3';

// The shell needed to render any page. Event pages are cached on visit.
// These must match the URLs the pages actually request, query string and
// all — 'aura.css' and 'aura.css?v=39' are two different cache keys, and
// precaching the wrong one silently achieves nothing.
const SHELL = [
  './',
  'index.html',
  'aura.css?v=39',
  'aura.js?v=7',
  'due.js',
  'engage.js',
  'terms.js',
  'feedback-widget.js',
  'progress.js',
  'review-plan.js',
  'home-extras.js',
  'sets.js',
  'learn.js',
  'sets-ui.js',
  'chapter-link.js',
  'chapter-seed.js',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll rejects the whole batch if any single file 404s, which would
      // leave the worker uninstalled; take them one at a time instead.
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Our own code: must never be served older than the deployed page.
function isCode(url) {
  return /\.(css|js)$/i.test(url.pathname);
}

// Everything else static: safe to serve instantly and refresh behind.
function isAsset(url) {
  return /\.(png|jpg|jpeg|svg|woff2?|ico|webmanifest|json)$/i.test(url.pathname);
}

// Network first, falling back to whatever we stored last.
function freshFirst(req) {
  return fetch(req)
    .then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    })
    .catch(() => caches.match(req).then(hit => hit || Promise.reject(new Error('offline'))));
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Firebase, analytics, fonts — always live, never stored.
  if (url.origin !== self.location.origin) return;

  // HTML: network first.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then(hit => hit || caches.match('index.html'))
        )
    );
    return;
  }

  // Our own css/js: network first, so the page and its styles always come
  // from the same deploy. Offline still works — the cache is the fallback.
  if (isCode(url)) {
    event.respondWith(freshFirst(req));
    return;
  }

  // Images and fonts: serve what we have, refresh behind it.
  if (isAsset(url)) {
    event.respondWith(
      caches.match(req).then(hit => {
        const live = fetch(req)
          .then(res => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => hit);
        return hit || live;
      })
    );
  }
});
