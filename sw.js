/* ═════════════════════════════════════════════════════════════════
   Service worker — offline study.

   Students study on phones, on school wifi, on the bus. Losing the page
   because a tunnel ate the connection is a reason not to come back.

   Strategy, chosen so a bad cache can never outlive a deploy:
     · navigations (HTML) → network first, cache as backup. Online you
       always get the deployed page; offline you get the last one you
       opened. An event page you have studied is therefore available
       offline; one you have never opened is not, and says so.
     · static assets (css/js/png) → stale-while-revalidate. Instant, and
       repaired in the background on the next load.
     · everything cross-origin (Firebase, fonts, analytics) → straight to
       the network, never cached. Auth and the database must not be
       served from a cache.

   Bump CACHE to invalidate everything.
   ═════════════════════════════════════════════════════════════════ */
const CACHE = 'hosa-v1';

// The shell needed to render any page. Event pages are cached on visit.
const SHELL = [
  './',
  'index.html',
  'aura.css',
  'aura.js',
  'due.js',
  'engage.js',
  'leaderboard.js',
  'feedback-widget.js',
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

function isStatic(url) {
  return /\.(css|js|png|jpg|jpeg|svg|woff2?|ico|webmanifest|json)$/i.test(url.pathname);
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

  // Static assets: serve what we have, refresh behind it.
  if (isStatic(url)) {
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
