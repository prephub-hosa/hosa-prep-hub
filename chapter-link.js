/* ═════════════════════════════════════════════════════════════════
   Chapter links — one place that builds them, absolutely.

   A founder emailed to say their join link did not work: it could not
   be clicked, and pasting it into the address bar went nowhere. Three
   separate reasons, all of them ours:

     · admin.html handed out "index.html?chapter=<slug>" — a relative
       path, not a URL. Nothing linkifies that in an email, and pasting
       it in a browser searches for it.

     · chapters.html and chapter.html built the link from whatever URL
       the founder happened to be on:

           location.href.replace(/chapters\.html$/, 'index.html')

       Land on /chapters instead of /chapters.html — which the host
       serves quite happily — and the replace misses, so the link came
       out as "/chapters?chapter=<slug>", which re-opens the
       registration page and ignores the parameter entirely.

     · index.html only read ?chapter= on the guest branch, so a signed-in
       student following a good link was never tagged to the chapter.

   Links are now built from the origin and a fixed path, so they do not
   depend on where the founder was standing when they copied one.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /**
   * Site root, with a trailing slash. Uses the origin so the result never
   * inherits the current page's path. file:// has no usable origin, so
   * fall back to the directory the page is sitting in.
   */
  function root() {
    var o = location.origin;
    if (o && o !== 'null' && /^https?:/i.test(o)) return o + '/';
    var u = location.href.split('#')[0].split('?')[0];
    return u.slice(0, u.lastIndexOf('/') + 1);
  }

  function clean(slug) {
    return String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 44);
  }

  /** The link a founder sends to their members. */
  function joinUrl(slug) {
    return root() + 'index.html?chapter=' + encodeURIComponent(clean(slug));
  }

  /** The founder's own dashboard. */
  function dashUrl(slug) {
    return root() + 'chapter.html?c=' + encodeURIComponent(clean(slug));
  }

  /** The ?chapter= slug on the current URL, or '' if there isn't one. */
  function slugFromUrl() {
    var m = /[?&]chapter=([^&#]+)/.exec(location.search);
    if (!m) return '';
    try { return clean(decodeURIComponent(m[1])); } catch (e) { return clean(m[1]); }
  }

  /**
   * Safety net for a join link that landed on the wrong page.
   *
   * Someone forwards the link with the path mangled, or a founder copies
   * one built by the old code, and it arrives at /chapters?chapter=x or
   * /chapter?chapter=x. Those pages have no idea what to do with the
   * parameter, so the member sees a registration form instead of joining.
   * Send them to the home page with the slug intact.
   *
   * Returns true when a redirect was started.
   */
  function rescueMisdirectedJoin() {
    var slug = slugFromUrl();
    if (!slug) return false;
    var path = location.pathname.replace(/\/+$/, '');
    var file = path.slice(path.lastIndexOf('/') + 1).toLowerCase();
    // The home page handles it itself; everything else hands it over.
    if (file === '' || file === 'index' || file === 'index.html') return false;
    location.replace(joinUrl(slug));
    return true;
  }

  global.HosaChapterLink = {
    root: root,
    joinUrl: joinUrl,
    dashUrl: dashUrl,
    slugFromUrl: slugFromUrl,
    rescueMisdirectedJoin: rescueMisdirectedJoin
  };
})(window);
