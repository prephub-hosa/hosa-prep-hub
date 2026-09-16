/* ═════════════════════════════════════════════════════════════════
   Install to home screen, and offline support.

   The honest problem with a static study site: once the tab is closed
   there is no way to reach the student again. No email, no push, no
   server. An icon on their home screen is the one durable foothold —
   it turns "I'd have to remember the URL" into one tap.

   So: register the service worker everywhere, and offer the install on
   the home page — but only to someone who has actually studied. Asking
   a first-time visitor to install an app they have not used yet is how
   you get a permanent dismissal.
   ═════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Service worker ───────────────────────────────────────────── */
  // Needs a secure origin. isSecureContext is the browser's own answer, and
  // covers https, localhost and 127.0.0.1; file:// simply skips it.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  /* ── Install prompt ───────────────────────────────────────────── */
  var DISMISS_KEY = 'hosa::install-dismissed';
  var deferred = null;

  function dismissed() {
    try {
      var t = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10) || 0;
      // Ask again after two weeks, not never.
      return Date.now() - t < 14 * 24 * 60 * 60 * 1000;
    } catch (e) { return false; }
  }

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
    var el = document.getElementById('pwa-install');
    if (el) el.remove();
  }

  function alreadyInstalled() {
    try {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    } catch (e) { return false; }
  }

  function hasStudied() {
    try {
      if ((parseInt(localStorage.getItem('hosa::xp') || '0', 10) || 0) > 0) return true;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('hosa::') !== 0 || k.indexOf('::', 6) !== -1) continue;
        var d = null;
        try { d = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
        if (d && d.studied && d.studied.length) return true;
      }
    } catch (e) {}
    return false;
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  function card(bodyHtml) {
    var host = document.getElementById('pwa-install-slot');
    if (!host) return null;
    host.innerHTML =
      '<div class="pwa-card" id="pwa-install">' +
        '<div class="pwa-icon" aria-hidden="true">✚</div>' +
        '<div class="pwa-body">' + bodyHtml + '</div>' +
        '<button class="pwa-x" id="pwa-dismiss" type="button" aria-label="Not now">×</button>' +
      '</div>';
    host.style.display = '';
    var x = document.getElementById('pwa-dismiss');
    if (x) x.addEventListener('click', dismiss);
    return document.getElementById('pwa-install');
  }

  function showInstallable() {
    var el = card(
      '<div class="pwa-title">Keep it one tap away</div>' +
      '<p class="pwa-sub">Add HOSA Prep to your home screen. Opens like an app, and the events ' +
      'you have studied keep working with no signal.</p>' +
      '<button class="pwa-btn" id="pwa-go" type="button">Add to home screen</button>'
    );
    if (!el) return;
    var go = document.getElementById('pwa-go');
    if (go) go.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function (r) {
        try { gtag('event', 'pwa_install_prompt', { outcome: r && r.outcome }); } catch (e) {}
        if (r && r.outcome === 'accepted') dismiss();
      }).catch(function () {});
      deferred = null;
    });
  }

  function showIOS() {
    // iOS Safari never fires beforeinstallprompt, so show the real steps.
    card(
      '<div class="pwa-title">Keep it one tap away</div>' +
      '<p class="pwa-sub">Tap <strong>Share</strong> at the bottom of Safari, then ' +
      '<strong>Add to Home Screen</strong>. It opens like an app, and the events you have ' +
      'studied keep working with no signal.</p>'
    );
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    if (!dismissed() && !alreadyInstalled() && hasStudied()) showInstallable();
  });

  window.addEventListener('appinstalled', function () {
    try { gtag('event', 'pwa_installed'); } catch (e) {}
    dismiss();
  });

  // iOS gets the manual route once they have something worth keeping.
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (isIOS() && !alreadyInstalled() && !dismissed() && hasStudied()) showIOS();
    }, 1200);
  });
})();
