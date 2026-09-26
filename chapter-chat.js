/* ═════════════════════════════════════════════════════════════════
   Chapter chat.

   Two threads per chapter:

     room — everyone in the chapter, the founder, and the site admin
     team — the founder and the site admin only

   The second exists because email to founders stopped arriving: many
   registered with school accounts that drop mail from outside the
   district. A line that lives on the site cannot be filtered out.

   Everything that matters for safety is enforced by the database rules
   in firebase/chat.rules.json, not by this file — who can read which
   thread, that you can only post as yourself, the 500-character cap,
   server-stamped times, a rate limit, no editing, and who may delete.
   This file is only the surface, and a modified copy of it gets nothing
   the rules would not already allow.

   No links are made clickable and no HTML is rendered from a message.
   The people using this are mostly high-school students.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // SHA-256 of the admin's sign-in email. This file loads on every page for
  // every visitor, so the address itself is not written here — only the
  // hash, which is enough to decide whether to show admin controls. The
  // database rules hold the real address and are what actually grant access.
  // Regenerate with: python3 -c "import hashlib;print(hashlib.sha256(b'EMAIL').hexdigest())"
  var ADMIN_EMAIL_SHA256 = '62aaee8b7a887377ccf8e476078bb73e4715ef7e51e411e76b1969fc24b58260';
  var MAX_TEXT = 500;
  var MAX_NAME = 40;
  var PAGE = 80;                                 // messages loaded per thread

  /* ── Small helpers ──────────────────────────────────────────────── */

  function db() { return global.firebase.database(); }
  function me() { try { return global.firebase.auth().currentUser; } catch (e) { return null; } }
  var adminMemo = {};
  /** Resolves true for the site admin. Presentation only — the rules decide. */
  function checkAdmin(u) {
    if (!u || !u.email) return Promise.resolve(false);
    if (adminMemo[u.uid] != null) return Promise.resolve(adminMemo[u.uid]);
    var subtle = global.crypto && global.crypto.subtle;
    if (!subtle || !global.TextEncoder) return Promise.resolve(false);
    return subtle.digest('SHA-256', new TextEncoder().encode(String(u.email).toLowerCase())).then(function (buf) {
      var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      return (adminMemo[u.uid] = hex === ADMIN_EMAIL_SHA256);
    }, function () { return false; });
  }
  function cleanSlug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 44); }
  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) : s; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;       // never innerHTML for message content
    return e;
  }
  function ready() {
    return !!(global.firebase && global.firebase.database && global.firebase.auth);
  }
  // "hosa::chat-seen::<slug>::<thread>" — two "::" so the event scanners skip it.
  function seenKey(slug, thread) { return 'hosa::chat-seen::' + slug + '::' + thread; }
  function seenAt(slug, thread) { return +ls(seenKey(slug, thread)) || 0; }
  /** Record that everything up to `ts` in a thread has been read, and tell
      the unread counters on this page. Other tabs hear it via 'storage'. */
  function markSeen(slug, thread, ts) {
    if (!ts || ts <= seenAt(slug, thread)) return;
    lsSet(seenKey(slug, thread), ts);
    try { global.dispatchEvent(new CustomEvent('hosa-chat-seen', { detail: { slug: slug, thread: thread } })); } catch (e) {}
  }

  // Panels on this page, so a counter can tell whether a thread is on screen
  // right now — a message you are looking at is not "new".
  var viewers = [];
  function isViewing(slug, thread) {
    return viewers.some(function (v) { return v.slug === slug && v.thread() === thread && v.visible(); });
  }

  function when(ts) {
    if (!ts) return '';
    var d = new Date(ts), now = new Date();
    var time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return time;
    var y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return 'Yesterday ' + time;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + time;
  }

  /* ── Identity ───────────────────────────────────────────────────── */

  var nameCache = {};
  /** The name shown on your messages: your username, never your email. */
  function displayName(u) {
    if (nameCache[u.uid]) return Promise.resolve(nameCache[u.uid]);
    var fallback = ls('hosa-username') || ls('hosa-lb-name') || String(u.email || '').split('@')[0] || 'Student';
    return db().ref('users/' + u.uid + '/profile/username').get()
      .then(function (s) { return s.val() || fallback; }, function () { return fallback; })
      .then(function (n) { n = clip(n, MAX_NAME) || 'Student'; nameCache[u.uid] = n; return n; });
  }

  /** The database rules decide membership from the chapter tag on your own
      leaderboard row — the same field joining a chapter has always written.
      Only ever set for the chapter this browser actually joined. */
  function ensureMembership(u, slug, chapterName, admin) {
    if (cleanSlug(ls('hosa::chapter')) !== slug || admin) return Promise.resolve();
    return db().ref('leaderboard/level/' + u.uid)
      .update({ chapter: slug, chapterName: chapterName || slug })
      .catch(function () {});
  }

  /** Who runs this chapter, as far as the database is concerned. */
  function owners(slug) {
    return db().ref('chat/' + slug + '/owners').get()
      .then(function (s) { return s.val() || {}; });
  }

  /**
   * A founder claims an unclaimed chapter by signing in with the email it
   * was registered under. The database rules make that comparison — this
   * page never reads anyone's contact email to check it. So we simply ask,
   * once per chapter per session, and the rules say yes or no.
   */
  function tryClaim(u, slug, known) {
    if (!u.email) return Promise.resolve(false);
    if (known && Object.keys(known).length) return Promise.resolve(known[u.uid] === true);
    var flag = 'hosa-chat-claimed-' + slug;
    try { if (sessionStorage.getItem(flag)) return Promise.resolve(false); sessionStorage.setItem(flag, '1'); } catch (e) {}
    return db().ref('chat/' + slug + '/owners/' + u.uid).set(true)
      .then(function () { return true; }, function () { return false; });
  }

  /* ── A thread ───────────────────────────────────────────────────── */

  function Thread(slug, name) {
    this.slug = slug;
    this.name = name;                  // 'room' | 'team'
    this.path = 'chat/' + slug + '/' + name;
    this._ref = null;
  }
  Thread.prototype.listen = function (onAdd, onRemove, onError) {
    this.stop();
    var q = db().ref(this.path).limitToLast(PAGE);
    this._ref = q;
    q.on('child_added', function (s) { onAdd(s.key, s.val() || {}); }, onError);
    q.on('child_removed', function (s) { onRemove(s.key); }, function () {});
  };
  Thread.prototype.stop = function () {
    if (this._ref) { this._ref.off(); this._ref = null; }
  };
  /** Post as yourself. The message and your rate-limit stamp go in one write. */
  Thread.prototype.send = function (u, name, role, text) {
    var TS = global.firebase.database.ServerValue.TIMESTAMP;
    var key = db().ref(this.path).push().key;
    var upd = {};
    upd[this.name + '/' + key] = { uid: u.uid, name: name, text: text, ts: TS, role: role };
    upd['lastPost/' + u.uid] = TS;
    return db().ref('chat/' + this.slug).update(upd);
  };
  Thread.prototype.remove = function (key) {
    return db().ref(this.path + '/' + key).remove();
  };
  /** The latest message, for the unread dot. Returns an unsubscribe. */
  Thread.prototype.latest = function (cb) {
    var q = db().ref(this.path).limitToLast(1);
    var h = q.on('child_added', function (s) { cb(s.val() || {}); }, function () {});
    return function () { q.off('child_added', h); };
  };

  /* ── Styles ─────────────────────────────────────────────────────── */

  var CSS = [
    '.hc-panel{display:flex;flex-direction:column;background:var(--bg-card,#fff);color:var(--ink,#1a1a1a);border:1px solid var(--rule-strong,rgba(0,0,0,.12));border-radius:16px;overflow:hidden;font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.45;box-shadow:0 18px 50px -18px rgba(0,0,0,.35)}',
    '.hc-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--rule,rgba(0,0,0,.08))}',
    '.hc-title{flex:1;min-width:0;font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.hc-close{border:0;background:none;color:var(--ink-soft,#666);font-size:22px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:8px}',
    '.hc-close:hover{background:var(--highlight,rgba(0,0,0,.05))}',
    '.hc-tabs{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid var(--rule,rgba(0,0,0,.08))}',
    '.hc-tab{flex:1;border:1px solid var(--rule-strong,rgba(0,0,0,.12));background:none;color:var(--ink-soft,#666);border-radius:999px;padding:6px 10px;font:600 12.5px Inter,system-ui,sans-serif;cursor:pointer;position:relative}',
    '.hc-tab.on{background:var(--accent-soft,rgba(239,68,68,.12));border-color:var(--accent,#c2182b);color:var(--ink,#1a1a1a)}',
    '.hc-tab .hc-dot{top:4px;right:8px}',
    '.hc-list{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:120px}',
    '.hc-empty{margin:auto;text-align:center;color:var(--ink-soft,#666);font-size:13px;max-width:30ch}',
    '.hc-msg{max-width:86%;align-self:flex-start;display:flex;flex-direction:column;gap:2px}',
    '.hc-msg.mine{align-self:flex-end;align-items:flex-end}',
    '.hc-meta{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--ink-soft,#666)}',
    '.hc-who{font-weight:700;color:var(--ink,#1a1a1a)}',
    '.hc-role{font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:1px 6px;border-radius:999px}',
    '.hc-role.founder{background:rgba(234,179,8,.18);color:#a16207}',
    '.hc-role.admin{background:var(--grad-cta,#c2182b);color:#fff}',
    '.hc-bubble{background:rgba(127,127,127,.09);border:1px solid rgba(127,127,127,.16);border-radius:14px;padding:8px 11px;white-space:pre-wrap;overflow-wrap:anywhere}',
    '.hc-msg.mine .hc-bubble{background:var(--accent-soft,rgba(239,68,68,.1));border-color:rgba(239,68,68,.25)}',
    '.hc-msg.admin .hc-bubble{border-color:var(--accent,#c2182b)}',
    '.hc-del{border:0;background:none;color:var(--ink-faint,#999);cursor:pointer;font-size:11px;padding:0 2px}',
    '.hc-del:hover{color:var(--error,#dc2626)}',
    '.hc-note{padding:6px 12px 0;font-size:11.5px;color:var(--ink-soft,#666)}',
    '.hc-form{display:flex;gap:8px;align-items:flex-end;padding:8px 12px 12px}',
    '.hc-input{flex:1;resize:none;border:1px solid var(--rule-strong,rgba(0,0,0,.15));border-radius:12px;padding:9px 11px;font:14px Inter,system-ui,sans-serif;background:var(--bg,#fff);color:var(--ink,#1a1a1a);max-height:120px;min-height:40px}',
    '.hc-input:focus{outline:none;border-color:var(--accent,#c2182b);box-shadow:0 0 0 3px var(--accent-soft,rgba(239,68,68,.12))}',
    '.hc-send{border:0;border-radius:12px;background:var(--grad-cta,#c2182b);color:#fff;font:600 14px Inter,system-ui,sans-serif;padding:10px 14px;cursor:pointer;min-height:40px}',
    '.hc-send:disabled{opacity:.5;cursor:not-allowed}',
    '.hc-count{font-size:11px;color:var(--ink-soft,#666);padding:0 12px;text-align:right;min-height:14px}',
    '.hc-err{color:var(--error,#dc2626);font-size:12px;padding:0 12px}',
    '.hc-gate{margin:auto;text-align:center;padding:24px;display:flex;flex-direction:column;gap:12px;align-items:center;color:var(--ink-soft,#666);font-size:13.5px}',
    '.hc-gate button{border:0;border-radius:10px;background:var(--grad-cta,#c2182b);color:#fff;font:600 14px Inter,system-ui,sans-serif;padding:10px 16px;cursor:pointer}',
    '.hc-dot{position:absolute;width:9px;height:9px;border-radius:50%;background:var(--accent,#ef4444);box-shadow:0 0 0 2px var(--bg,#fff)}',
    /* The launcher: small, bottom-left, clear of the sidebar and the
       Feedback / timer buttons that own the bottom-right corner. */
    '.hc-launch{position:fixed;left:264px;bottom:24px;z-index:9990;display:flex;align-items:center;gap:8px;border:1px solid var(--rule-strong,rgba(0,0,0,.12));background:var(--bg-card,#fff);color:var(--ink,#1a1a1a);border-radius:999px;padding:9px 15px 9px 12px;font:600 13.5px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px -10px rgba(0,0,0,.35)}',
    '.hc-launch:hover{border-color:var(--accent,#c2182b)}',
    '.hc-launch .hc-dot{top:4px;right:6px}',
    '.hc-launch{overflow:visible}',
    '.hc-pop{position:fixed;left:264px;bottom:78px;z-index:9999;width:360px;height:min(520px,calc(100vh - 110px))}',
    '.hc-pop .hc-panel{height:100%}',
    '@media (max-width:768px){.hc-launch{left:14px;bottom:calc(78px + env(safe-area-inset-bottom,0px));padding:10px 12px}.hc-launch .hc-lbl{display:none}',
    '.hc-pop{left:0;right:0;bottom:0;width:auto;height:82vh}.hc-pop .hc-panel{border-radius:16px 16px 0 0}}',
    '.hc-inline{height:460px}',
    '.hc-bell{border:1px solid var(--rule-strong,rgba(0,0,0,.12));background:none;color:var(--ink-soft,#666);border-radius:999px;padding:4px 10px;font:600 12px Inter,system-ui,sans-serif;cursor:pointer;white-space:nowrap}',
    '.hc-bell:hover{border-color:var(--accent,#c2182b);color:var(--ink,#1a1a1a)}',
    '.hc-bell.on{background:var(--accent-soft,rgba(239,68,68,.12));border-color:var(--accent,#c2182b);color:var(--ink,#1a1a1a)}',
    '.hc-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--accent,#dc2626);color:#fff;font:700 11px/18px Inter,system-ui,sans-serif;text-align:center;box-shadow:0 0 0 2px var(--bg,#fff)}',
    '.hc-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10000;display:flex;gap:10px;align-items:flex-start;width:min(380px,calc(100vw - 28px));background:var(--bg-card,#fff);color:var(--ink,#1a1a1a);border:1px solid var(--rule-strong,rgba(0,0,0,.12));border-left:4px solid var(--accent,#c2182b);border-radius:12px;padding:11px 12px;box-shadow:0 18px 40px -14px rgba(0,0,0,.4);font:14px/1.4 Inter,system-ui,sans-serif;cursor:pointer;animation:hcIn .18s ease-out}',
    '.hc-toast b{display:block;font-size:13px}',
    '.hc-toast span{display:block;color:var(--ink-soft,#555);overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
    '.hc-toast .hc-tx{margin-left:auto;border:0;background:none;color:var(--ink-faint,#999);font-size:18px;line-height:1;cursor:pointer;padding:0 2px}',
    '@keyframes hcIn{from{opacity:0;transform:translate(-50%,8px)}to{opacity:1;transform:translate(-50%,0)}}',
    '@media (prefers-reduced-motion:reduce){.hc-toast{animation:none}}',
    '@media print{.hc-launch,.hc-pop,.hc-toast{display:none}}'
  ].join('\n');
  function injectCss() {
    if (document.getElementById('hc-css')) return;
    var s = document.createElement('style');
    s.id = 'hc-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Notifications ──────────────────────────────────────────────── */

  // There is no server, so nothing can reach a phone with the site closed.
  // What we can do: while any page of the site is open — even in a
  // background tab — show a system notification (if you allowed them) and
  // an in-page toast, and keep an unread count in the tab title.
  var NOTIFY_KEY = 'hosa::chat-notify';
  var notify = {
    supported: function () { return 'Notification' in global; },
    permission: function () { return notify.supported() ? global.Notification.permission : 'denied'; },
    enabled: function () { return notify.permission() === 'granted' && ls(NOTIFY_KEY) === '1'; },
    /** Must run from a click: browsers only show the prompt on a gesture. */
    enable: function () {
      if (!notify.supported()) return Promise.resolve(false);
      var ask = global.Notification.permission === 'granted'
        ? Promise.resolve('granted')
        : new Promise(function (res) {
            var r = global.Notification.requestPermission(res);   // older Safari takes a callback
            if (r && r.then) r.then(res);
          });
      return ask.then(function (p) { if (p === 'granted') lsSet(NOTIFY_KEY, '1'); fireBell(); return p === 'granted'; });
    },
    disable: function () { lsSet(NOTIFY_KEY, '0'); fireBell(); },
    /** A system notification. Uses the service worker where there is one —
        Android Chrome refuses `new Notification()` outright. */
    show: function (title, body, url, tag) {
      if (!notify.enabled()) return;
      var o = { body: body, tag: tag || 'hosa-chat', renotify: true, icon: 'apple-touch-icon.png', badge: 'apple-touch-icon.png', data: { url: url } };
      var sw = global.navigator && global.navigator.serviceWorker;
      var viaPage = function () {
        try {
          var n = new global.Notification(title, o);
          n.onclick = function () { try { global.focus(); } catch (e) {} if (url && url !== location.href) location.href = url; n.close(); };
        } catch (e) {}
      };
      if (sw && sw.getRegistration) {
        sw.getRegistration().then(function (r) { if (r && r.showNotification) r.showNotification(title, o).catch(viaPage); else viaPage(); }, viaPage);
      } else viaPage();
    }
  };
  function fireBell() { try { global.dispatchEvent(new CustomEvent('hosa-chat-bell')); } catch (e) {} }

  /** The "Notify me" toggle shown in every chat panel. */
  function bellButton() {
    if (!notify.supported()) return null;
    var b = el('button', 'hc-bell');
    b.type = 'button';
    function paint() {
      var p = notify.permission(), on = notify.enabled();
      b.classList.toggle('on', on);
      b.textContent = on ? '\uD83D\uDD14 On' : '\uD83D\uDD14 Notify me';
      b.title = p === 'denied'
        ? 'Notifications are blocked for this site in your browser settings.'
        : on ? 'You get a notification for new messages while the site is open. Click to turn off.'
             : 'Get a notification when someone messages, while the site is open in a tab.';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    b.addEventListener('click', function () {
      if (notify.enabled()) { notify.disable(); return; }
      if (notify.permission() === 'denied') {
        alert('Notifications are blocked for this site. Allow them in your browser\u2019s site settings, then click again.');
        return;
      }
      notify.enable();
    });
    global.addEventListener('hosa-chat-bell', paint);
    paint();
    return b;
  }

  /** A small in-page card for a new message. Click runs `onOpen`. */
  var toastEl = null, toastTimer = null;
  function toast(title, body, onOpen) {
    injectCss();
    if (toastEl) toastEl.remove();
    clearTimeout(toastTimer);
    var t = el('div', 'hc-toast');
    t.setAttribute('role', 'status');
    var txt = el('div');
    txt.appendChild(el('b', null, title));
    txt.appendChild(el('span', null, body));
    t.appendChild(txt);
    var x = el('button', 'hc-tx', '\u00D7');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.addEventListener('click', function (e) { e.stopPropagation(); t.remove(); });
    t.appendChild(x);
    t.addEventListener('click', function () { t.remove(); if (onOpen) onOpen(); });
    document.body.appendChild(t);
    toastEl = t;
    toastTimer = setTimeout(function () { if (t.isConnected) t.remove(); }, 8000);
  }

  function dismissToast() { if (toastEl) { toastEl.remove(); toastEl = null; } clearTimeout(toastTimer); }

  /** "(3) Title" while there is something unread. */
  var baseTitle = null;
  function titleCount(n) {
    if (baseTitle === null) baseTitle = document.title.replace(/^\(\d+\+?\)\s*/, '');
    document.title = (n > 0 ? '(' + (n > 99 ? '99+' : n) + ') ' : '') + baseTitle;
  }

  /**
   * Keep count of unread messages in a chapter's chat and announce new ones.
   *   onCount(n)             — unread total, whenever it changes
   *   onNew(msg, threadName) — a message that arrived after we started
   *                            listening, from someone else, not on screen
   * Returns a stop function.
   */
  function watch(slug, opts) {
    opts = opts || {};
    slug = cleanSlug(slug);
    var stops = [], msgs = {}, uid = null, last = -1;

    function count() {
      var n = 0;
      Object.keys(msgs).forEach(function (t) {
        if (isViewing(slug, t)) return;
        var since = seenAt(slug, t);
        Object.keys(msgs[t]).forEach(function (k) {
          var m = msgs[t][k];
          if (m.uid !== uid && m.ts > since) n++;
        });
      });
      if (n !== last) { last = n; if (opts.onCount) opts.onCount(n); }
    }
    var threadStops = {};
    function stopAll() {
      stops.forEach(function (f) { f(); }); stops = [];
      Object.keys(threadStops).forEach(unlisten);
      msgs = {};
    }
    function unlisten(t) {
      if (threadStops[t]) { threadStops[t](); delete threadStops[t]; }
      delete msgs[t];
      count();
    }

    function listen(t) {
      if (threadStops[t]) return;
      msgs[t] = {};
      var q = db().ref('chat/' + slug + '/' + t).limitToLast(PAGE), loaded = false;
      var add = q.on('child_added', function (s) {
        var m = s.val() || {};
        msgs[t][s.key] = { uid: m.uid, ts: +m.ts || 0 };
        if (loaded && m.uid !== uid && !isViewing(slug, t) && opts.onNew) opts.onNew(m, t);
        count();
      }, function () {});
      var rm = q.on('child_removed', function (s) { delete msgs[t][s.key]; count(); }, function () {});
      // Existing messages arrive as child_added before this resolves; only
      // what comes after it is news.
      q.once('value').then(function () { loaded = true; }, function () {});
      threadStops[t] = function () { q.off('child_added', add); q.off('child_removed', rm); };
    }

    function start(u) {
      stopAll();
      uid = u ? u.uid : null;
      last = -1;
      if (!u || !slug) { count(); return; }
      checkAdmin(u).then(function (admin) {
        if (uid !== u.uid) return;
        listen('room');
        if (admin) { listen('team'); return; }
        // Founder status can change while the page is open — the first time
        // a founder opens the chat is when they claim it — so follow it live.
        var ref = db().ref('chat/' + slug + '/owners/' + u.uid);
        var h = ref.on('value', function (s) { if (s.val() === true) listen('team'); else unlisten('team'); }, function () {});
        stops.push(function () { ref.off('value', h); });
      }).catch(function () { count(); });
    }

    function recount() { count(); }
    global.addEventListener('hosa-chat-seen', recount);
    global.addEventListener('storage', recount);
    document.addEventListener('visibilitychange', recount);
    var unsub = global.firebase.auth().onAuthStateChanged(start);
    return function () {
      stopAll();
      unsub();
      global.removeEventListener('hosa-chat-seen', recount);
      global.removeEventListener('storage', recount);
      document.removeEventListener('visibilitychange', recount);
    };
  }

  /** Announce a message: toast on the page, system notification if allowed. */
  function announce(m, chapterName, url, onOpen) {
    var who = m.role === 'admin' ? 'HOSA Prep Hub' : clip(m.name, MAX_NAME) || 'Someone';
    var body = clip(m.text, 140);
    toast(who + ' \u00B7 ' + chapterName, body, onOpen);
    // The toast covers someone looking at the page; the system notification
    // is for when they are in another tab or app.
    if (document.hidden) notify.show(who + ' \u00B7 ' + chapterName, body, url, 'hosa-chat-' + cleanSlug(chapterName));
  }

  /* ── The panel ──────────────────────────────────────────────────── */

  /**
   * Render a chat panel into `host`.
   *   slug, chapterName
   *   onClose     — shows a close button when given
   *   onSignIn    — shows a sign-in button to signed-out visitors when given
   *   admin       — the admin page: both threads, no membership write
   */
  function mountPanel(host, opts) {
    injectCss();
    opts = opts || {};
    var slug = cleanSlug(opts.slug);
    var chapterName = opts.chapterName || slug.replace(/-/g, ' ');
    var state = { thread: null, threads: [], user: null, name: '', owner: false, admin: false, keys: {}, newest: 0 };
    function visible() {
      return !document.hidden && host.isConnected && host.getClientRects().length > 0;
    }
    /** Mark the open thread read — only while it is actually on screen. */
    function seen() {
      if (state.thread && state.newest && visible()) markSeen(slug, state.thread.name, state.newest);
    }
    var viewer = { slug: slug, visible: visible, thread: function () { return state.thread && state.thread.name; } };
    viewers.push(viewer);
    function onVis() { seen(); }
    document.addEventListener('visibilitychange', onVis);

    host.innerHTML = '';
    var panel = el('div', 'hc-panel');
    var head = el('div', 'hc-head');
    var titleEl = el('div', 'hc-title', chapterName);
    head.appendChild(titleEl);
    var bell = bellButton();
    if (bell) head.appendChild(bell);
    if (opts.onClose) {
      var x = el('button', 'hc-close', '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Close chat');
      x.addEventListener('click', opts.onClose);
      head.appendChild(x);
    }
    panel.appendChild(head);
    var tabs = el('div', 'hc-tabs');
    var list = el('div', 'hc-list');
    list.setAttribute('role', 'log');
    list.setAttribute('aria-live', 'polite');
    var note = el('div', 'hc-note');
    var err = el('div', 'hc-err');
    var count = el('div', 'hc-count');
    var form = el('form', 'hc-form');
    var input = el('textarea', 'hc-input');
    input.rows = 1;
    input.maxLength = MAX_TEXT;
    input.placeholder = 'Message';
    input.setAttribute('aria-label', 'Message');
    var send = el('button', 'hc-send', 'Send');
    send.type = 'submit';
    form.appendChild(input);
    form.appendChild(send);
    panel.appendChild(tabs);
    panel.appendChild(list);
    panel.appendChild(note);
    panel.appendChild(count);
    panel.appendChild(err);
    panel.appendChild(form);
    host.appendChild(panel);

    function gate(message, button, action) {
      tabs.style.display = 'none'; form.style.display = 'none'; note.textContent = ''; count.textContent = '';
      list.innerHTML = '';
      var g = el('div', 'hc-gate');
      g.appendChild(el('div', null, message));
      if (button && action) {
        var b = el('button', null, button);
        b.type = 'button';
        b.addEventListener('click', action);
        g.appendChild(b);
      }
      list.appendChild(g);
    }

    function canDelete(m) {
      if (!state.user) return false;
      if (state.admin) return true;
      if (m.uid === state.user.uid) return true;
      return state.owner && state.thread && state.thread.name === 'room';
    }

    function atBottom() { return list.scrollHeight - list.scrollTop - list.clientHeight < 60; }

    function addMessage(key, m) {
      if (state.keys[key]) return;
      var empty = list.querySelector('.hc-empty');
      if (empty) empty.remove();
      var stick = atBottom();
      var mine = state.user && m.uid === state.user.uid;
      var row = el('div', 'hc-msg' + (mine ? ' mine' : '') + (m.role === 'admin' ? ' admin' : ''));
      row.setAttribute('data-key', key);
      var meta = el('div', 'hc-meta');
      meta.appendChild(el('span', 'hc-who', mine ? 'You' : clip(m.name, MAX_NAME) || 'Student'));
      if (m.role === 'founder') meta.appendChild(el('span', 'hc-role founder', 'Founder'));
      if (m.role === 'admin') meta.appendChild(el('span', 'hc-role admin', 'HOSA Prep Hub'));
      meta.appendChild(el('span', null, when(m.ts)));
      if (canDelete(m)) {
        var d = el('button', 'hc-del', 'Delete');
        d.type = 'button';
        d.addEventListener('click', function () {
          if (!mine && !global.confirm('Delete this message from ' + (m.name || 'this member') + '?')) return;
          state.thread.remove(key).catch(function () { err.textContent = 'Could not delete that message.'; });
        });
        meta.appendChild(d);
      }
      row.appendChild(meta);
      row.appendChild(el('div', 'hc-bubble', String(m.text || '')));
      list.appendChild(row);
      state.keys[key] = true;
      if (stick || mine) list.scrollTop = list.scrollHeight;
      if (m.ts > state.newest) state.newest = m.ts;
      seen();
    }
    function removeMessage(key) {
      var n = list.querySelector('[data-key="' + key + '"]');
      if (n) n.remove();
      delete state.keys[key];
      if (!list.querySelector('.hc-msg')) showEmpty();
    }
    function showEmpty() {
      if (list.querySelector('.hc-empty')) return;
      var t = state.thread && state.thread.name === 'team'
        ? (state.admin ? 'Nothing yet. Say hello to this chapter’s founder.'
                       : 'A private line between you and the person who runs HOSA Prep Hub. Ask for anything — a custom set for your events, something broken, an idea.')
        : 'No messages yet. Say hi to your chapter.';
      list.appendChild(el('div', 'hc-empty', t));
    }

    function open(thread) {
      if (state.thread) state.thread.stop();
      state.thread = thread;
      state.keys = {};
      state.newest = 0;
      list.innerHTML = '';
      err.textContent = '';
      tabs.querySelectorAll('.hc-tab').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-thread') === thread.name);
      });
      note.textContent = thread.name === 'team'
        ? (state.admin ? 'Only this chapter’s founder and you can see this.' : 'Only you and HOSA Prep Hub can see this.')
        : 'Everyone in ' + chapterName + ' can see this. Keep personal info out of it.';
      showEmpty();
      thread.listen(addMessage, removeMessage, function () {
        gate(state.owner || state.admin
          ? 'Chat isn’t available for this chapter right now.'
          : 'Only members of ' + chapterName + ' can read this chat. Join with your chapter’s link to take part.');
      });
      setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 30);
    }

    function role() {
      if (state.admin) return 'admin';
      if (state.owner) return 'founder';
      return 'member';
    }

    function buildTabs() {
      tabs.innerHTML = '';
      state.threads = [new Thread(slug, 'room')];
      if (state.owner || state.admin) state.threads.push(new Thread(slug, 'team'));
      if (state.threads.length < 2) { tabs.style.display = 'none'; return; }
      tabs.style.display = '';
      state.threads.forEach(function (t) {
        var b = el('button', 'hc-tab', t.name === 'room' ? 'Chapter' : (state.admin ? 'Founder' : 'HOSA Prep Hub'));
        b.type = 'button';
        b.setAttribute('data-thread', t.name);
        b.addEventListener('click', function () { open(t); });
        tabs.appendChild(b);
      });
    }

    input.addEventListener('input', function () {
      var n = input.value.length;
      count.textContent = n > MAX_TEXT - 100 ? n + ' / ' + MAX_TEXT : '';
      input.style.height = 'auto';
      input.style.height = Math.min(120, input.scrollHeight) + 'px';
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : submit(e); }
    });
    var sending = false, lastSent = 0;
    function submit(e) {
      if (e) e.preventDefault();
      if (sending || !state.thread || !state.user) return;   // one in flight at a time
      var text = input.value.replace(/^\s+|\s+$/g, '');
      if (!text) return;
      if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT);
      // The database refuses a second post inside 1.5 s. Say so straight
      // away rather than sending something we know will bounce.
      if (Date.now() - lastSent < 1500) { err.textContent = 'Slow down \u2014 wait a moment and send again.'; return; }
      sending = true;
      send.disabled = true;
      err.textContent = '';
      // Clear now, not when the write lands: clearing on success wiped out
      // whatever had been typed while the first message was still sending.
      input.value = '';
      input.style.height = '';
      count.textContent = '';
      state.thread.send(state.user, state.name, role(), text).then(function () {
        sending = false;
        lastSent = Date.now();
        send.disabled = false;
        try { input.focus(); } catch (x) {}
      }, function (e) {
        sending = false;
        send.disabled = false;
        if (!input.value) input.value = text;               // give it back, never lose it
        err.textContent = /permission/i.test(String(e && (e.code || e.message)))
          ? 'Not sent \u2014 wait a moment and try again.'
          : 'Not sent \u2014 check your connection.';
      });
    }
    form.addEventListener('submit', submit);

    function start(u) {
      if (state.thread) { state.thread.stop(); state.thread = null; }
      state.user = u;
      if (!u) {
        if (opts.onSignIn) gate('Sign in to chat with ' + chapterName + '.', 'Sign in', opts.onSignIn);
        else gate('Sign in to chat with ' + chapterName + '.');
        return;
      }
      gate('Loading…');
      checkAdmin(u).then(function (admin) {
        state.admin = admin;
        return Promise.all([
          displayName(u),
          opts.admin || admin ? Promise.resolve() : ensureMembership(u, slug, chapterName, admin),
          owners(slug).catch(function () { return null; })
        ]);
      }).then(function (r) {
        state.name = state.admin ? clip(r[0], MAX_NAME) : r[0];
        var known = r[2];
        if (known === null && !state.admin) { gate('Chat isn’t available yet.'); return; }
        return (state.admin ? Promise.resolve(false) : tryClaim(u, slug, known || {})).then(function (isOwner) {
          state.owner = !!isOwner || !!(known && known[u.uid] === true);
          tabs.style.display = '';
          form.style.display = '';
          buildTabs();
          open(state.threads[opts.startThread === 'team' && state.threads[1] ? 1 : 0]);
        });
      }).catch(function () { gate('Chat isn’t available yet.'); });
    }

    var unsub = null;
    if (!ready()) { gate('Chat isn’t available on this page.'); return { destroy: function () {} }; }
    unsub = global.firebase.auth().onAuthStateChanged(start);

    return {
      destroy: function () {
        if (state.thread) state.thread.stop();
        if (unsub) unsub();
        document.removeEventListener('visibilitychange', onVis);
        var i = viewers.indexOf(viewer); if (i !== -1) viewers.splice(i, 1);
        host.innerHTML = '';
      },
      focus: function () { try { input.focus({ preventScroll: true }); } catch (e) {} },
      /** Call when the panel's container is shown again (a tab switch). */
      seen: seen,
      /** The chapter's real name, once the page has loaded it. */
      rename: function (n) {
        if (!n || n === chapterName) return;
        chapterName = n;
        titleEl.textContent = n;
        if (state.thread && state.thread.name === 'room') note.textContent = 'Everyone in ' + n + ' can see this. Keep personal info out of it.';
      },
      thread: function () { return state.thread && state.thread.name; }
    };
  }

  /* ── The floating launcher (home page) ──────────────────────────── */

  /**
   * A small "Chapter chat" button, bottom-left, for anyone in a chapter.
   * Stays out of the way entirely until the database rules are live —
   * a chat button that only ever says "not available" is worse than none.
   */
  function mountLauncher(opts) {
    opts = opts || {};
    if (!ready()) return;
    injectCss();
    var btn = null, pop = null, panel = null, stopWatch = null, watching = '';

    function slugNow() { return cleanSlug(opts.slug || ls('hosa::chapter')); }
    function nameNow() { return opts.chapterName || ls('hosa::chapter-name') || slugNow().replace(/-/g, ' '); }

    function close() {
      if (panel) { panel.destroy(); panel = null; }
      if (pop) { pop.remove(); pop = null; }
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
    function openPanel() {
      if (pop) { close(); return; }
      pop = el('div', 'hc-pop');
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-label', 'Chapter chat');
      document.body.appendChild(pop);
      btn.setAttribute('aria-expanded', 'true');
      dismissToast();
      panel = mountPanel(pop, {
        slug: slugNow(), chapterName: nameNow(), onClose: close, onSignIn: opts.onSignIn
      });
    }
    function setCount(n) {
      if (!btn) return;
      var d = btn.querySelector('.hc-badge');
      if (n > 0 && !d) { d = el('span', 'hc-badge'); d.setAttribute('aria-hidden', 'true'); btn.appendChild(d); }
      if (d) { if (n > 0) d.textContent = n > 99 ? '99+' : String(n); else d.remove(); }
      btn.setAttribute('aria-label', n > 0 ? 'Chapter chat — ' + n + ' unread' : 'Chapter chat');
      titleCount(n);
    }
    function watchNow(slug) {
      if (watching === slug) return;
      if (stopWatch) { stopWatch(); stopWatch = null; }
      watching = slug;
      setCount(0);
      if (!slug) return;
      stopWatch = watch(slug, {
        onCount: setCount,
        onNew: function (m) {
          announce(m, nameNow(), location.href, function () { if (!pop) openPanel(); });
        }
      });
    }

    function render() {
      var slug = slugNow();
      if (!slug) { if (btn) { btn.remove(); btn = null; } close(); watchNow(''); return; }
      if (!btn) {
        btn = el('button', 'hc-launch');
        btn.type = 'button';
        btn.setAttribute('aria-haspopup', 'dialog');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
          + 'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
        btn.appendChild(el('span', 'hc-lbl', 'Chapter chat'));
        btn.addEventListener('click', openPanel);
        btn.style.display = 'none';
        document.body.appendChild(btn);
      }
      var u = me();
      // Signed out: still show it — the panel asks them to sign in, which is
      // the point. Signed in: only once the rules answer, so a site whose
      // rules have not been published shows no chat button at all.
      if (!u) { btn.style.display = ''; watchNow(''); return; }
      owners(slug).then(function () { btn.style.display = ''; watchNow(slug); },
                        function () { btn.style.display = 'none'; watchNow(''); });
    }

    global.firebase.auth().onAuthStateChanged(function () { close(); render(); });
    // Joining or leaving a chapter elsewhere on the page.
    global.addEventListener('storage', function (e) { if (e.key === 'hosa::chapter') render(); });
    global.__hosaChatRefresh = render;
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop) close(); });
    render();
  }

  global.HosaChat = {
    mountPanel: mountPanel,
    mountLauncher: mountLauncher,
    owners: owners,
    Thread: Thread,
    watch: watch,
    announce: announce,
    notify: notify,
    bellButton: bellButton,
    toast: toast,
    dismissToast: dismissToast,
    titleCount: titleCount,
    markSeen: markSeen,
    isViewing: isViewing
  };
})(window);
