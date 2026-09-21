/* ═════════════════════════════════════════════════════════════════
   One account, every device.

   The site grew two storage backends that never met. An event page
   saves like this:

       if (user) firebase.ref('users/<uid>/progress/<event>').set(data)
       else      localStorage.setItem('hosa::<event>', json)

   …so a signed-in student's work lives in Firebase and nowhere else.
   Meanwhile everything on the home page that answers "how am I doing"
   — level, cards mastered, streak, due today, the greeting name, the
   sidebar profile card — is computed by scanning localStorage, behind

       if (studied.length > 0) { ...the whole hero... }

   For a signed-in student that array is empty, the block never runs,
   and the page falls back to "Hello, Future Champion", Level 1, 0
   mastered, 0 due — on a brand new device, and on any device where the
   browser data was cleared. A student who had used the site as a guest
   first saw the right numbers only because their old guest rows were
   still sitting in localStorage.

   XP was bridged to Firebase separately, which is why signing in on a
   second machine could pop "Level 3!" over a hero still reading
   "LEVEL 1". Same account, two different answers, on one screen.

   Rather than rewrite fifteen call sites, this mirrors the account's
   Firebase progress back into the same hosa::<slug> keys they all
   already read. One fetch on sign-in, and every existing consumer is
   correct.

   ── On not losing anyone's work ──────────────────────────────────

   Mirroring is a merge, never a copy:

     · Local rows the account has not seen (guest study from before
       signing in) are kept and uploaded, so signing up does not throw
       away the week you spent as a guest.
     · studied/mastered/studyDates take the union. A card mastered on
       either device stays mastered.
     · Per-card scheduling keeps whichever copy is further along.
     · Quizzes are concatenated and de-duplicated; streaks take the max.
     · An empty side never wins. Nothing here can turn progress into
       less progress.

   Switching accounts on a shared device clears the mirror first, so one
   student never inherits another's numbers.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LAST_UID = 'hosa::last-uid';
  var MIRROR_KEYS = 'hosa::mirror::keys';   // second "::" — not an event

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /* ── Firebase key encoding ──────────────────────────────────────
     RTDB keys may not contain . # $ / [ ] and deck terms routinely do
     ("FEV1/FVC", "Nature vs. Nurture"). The event pages encode on write
     and decode on read; the mirror has to do the same or the terms come
     back mangled. */
  function decKey(k) {
    return String(k).replace(/%([0-9A-F]{2})/g, function (_m, h) {
      return String.fromCharCode(parseInt(h, 16));
    });
  }
  function encKey(k) {
    return String(k).replace(/[%.#$\/\[\]]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  function mapKeys(o, fn) {
    var out = {};
    o = o || {};
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) out[fn(k)] = o[k];
    return out;
  }

  /* ── Merging ────────────────────────────────────────────────────── */

  function union(a, b) {
    var seen = {}, out = [];
    (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach(function (x) {
      if (x == null) return;
      var k = String(x);
      if (seen[k]) return;
      seen[k] = 1;
      out.push(x);
    });
    return out;
  }

  // How far along a card is. Used to pick a winner without ever going
  // backwards: more repetitions beats fewer, then a longer interval.
  function depth(c) {
    if (!c || typeof c !== 'object') return -1;
    return (Number(c.reps) || 0) * 1000 + (Number(c.interval) || 0);
  }

  function mergeSrData(a, b) {
    var out = {}, k;
    a = a || {}; b = b || {};
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
    for (k in b) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
      if (!(k in out) || depth(b[k]) > depth(out[k])) out[k] = b[k];
    }
    return out;
  }

  function mergeLevels(a, b) {
    var out = {}, k;
    a = a || {}; b = b || {};
    for (k in a) if (Object.prototype.hasOwnProperty.call(a, k)) out[k] = a[k];
    for (k in b) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) continue;
      if (!(k in out) || (Number(b[k]) || 0) > (Number(out[k]) || 0)) out[k] = b[k];
    }
    return out;
  }

  function mergeQuizzes(a, b) {
    var seen = {}, out = [];
    (Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b : []).forEach(function (q) {
      if (!q) return;
      var k = (q.date || '') + '|' + q.score + '|' + q.total + '|' + (q.timed ? 't' : 'f');
      if (seen[k]) return;
      seen[k] = 1;
      out.push(q);
    });
    return out;
  }

  function later(a, b) {
    if (!a) return b || null;
    if (!b) return a;
    return String(a) > String(b) ? a : b;
  }

  /**
   * Merge one event's progress. Neither side is trusted to be complete,
   * and neither side can subtract from the other.
   */
  function mergeEvent(local, remote) {
    local = local || {}; remote = remote || {};
    return {
      studied:       union(local.studied, remote.studied),
      mastered:      union(local.mastered, remote.mastered),
      studyDates:    union(local.studyDates, remote.studyDates),
      quizzes:       mergeQuizzes(local.quizzes, remote.quizzes),
      lastMissed:    (remote.lastMissed && remote.lastMissed.length)
                       ? remote.lastMissed : (local.lastMissed || []),
      srLevels:      mergeLevels(local.srLevels, remote.srLevels),
      srData:        mergeSrData(local.srData, remote.srData),
      streak:        Math.max(Number(local.streak) || 0, Number(remote.streak) || 0),
      lastStudyDate: later(local.lastStudyDate, remote.lastStudyDate),
      lastFilter:    remote.lastFilter || local.lastFilter || 'all'
    };
  }

  function isEmpty(p) {
    return !p ||
      (!(p.studied || []).length &&
       !(p.mastered || []).length &&
       !(p.quizzes || []).length &&
       !Object.keys(p.srData || {}).length);
  }

  /* ── The mirror ─────────────────────────────────────────────────── */

  /** Drop the rows mirrored for a previous account. */
  function clearMirror() {
    var keys = read(MIRROR_KEYS, []);
    if (!Array.isArray(keys)) keys = [];
    keys.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    try { localStorage.removeItem(MIRROR_KEYS); } catch (e) {}
  }

  /**
   * Pull the account's progress, merge it with whatever is on this
   * device, and leave the result in the hosa::<slug> keys that due.js,
   * engage.js and the home hero all read.
   *
   * Calls back with { events, mastered, uploaded } — or with nulls if
   * Firebase could not be reached, in which case nothing is touched and
   * the page keeps whatever it already had.
   */
  function sync(uid, cb) {
    cb = cb || function () {};
    if (!uid || !global.firebase || !firebase.database) { cb(null); return; }

    var lastUid = null;
    try { lastUid = localStorage.getItem(LAST_UID); } catch (e) {}
    // A different student signed in on this device: their rows are not
    // ours to merge, and showing them would be worse than showing none.
    if (lastUid && lastUid !== uid) clearMirror();

    firebase.database().ref('users/' + uid + '/progress').get().then(function (snap) {
      var remote = (snap && snap.exists() && snap.val()) || {};
      var slugs = {}, k;
      for (k in remote) if (Object.prototype.hasOwnProperty.call(remote, k)) slugs[k] = 1;

      // Local rows for events the account has no record of: guest study
      // from before signing in. Those come with us.
      var localOnly = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var lk = localStorage.key(i);
          if (!lk || lk.indexOf('hosa::') !== 0) continue;
          var slug = lk.slice(6);
          // Settings and namespaced sub-keys ("hosa::x::y") are not events.
          if (!slug || slug.indexOf('::') !== -1 || slug.indexOf('daily') === 0) continue;
          var v = read(lk, null);
          if (!v || typeof v !== 'object' || (!v.studied && !v.mastered && !v.srData)) continue;
          slugs[slug] = 1;
          if (!remote[slug]) localOnly.push(slug);
        }
      } catch (e) {}

      var mirrored = [], uploaded = [], mastered = 0;
      Object.keys(slugs).forEach(function (slug) {
        var localRow = read('hosa::' + slug, null);
        var remoteRow = remote[slug] ? Object.assign({}, remote[slug], {
          srLevels: mapKeys(remote[slug].srLevels, decKey),
          srData:   mapKeys(remote[slug].srData, decKey)
        }) : null;

        var merged = mergeEvent(localRow, remoteRow);
        if (isEmpty(merged)) return;

        write('hosa::' + slug, merged);
        mirrored.push('hosa::' + slug);
        mastered += (merged.mastered || []).length;

        // Push back only when this device is actually adding something —
        // never write a row that is merely what we just read.
        if (localRow && !isEmpty(localRow) && changed(remoteRow, merged)) {
          uploaded.push(slug);
          try {
            firebase.database().ref('users/' + uid + '/progress/' + slug).set(
              Object.assign({}, merged, {
                srLevels: mapKeys(merged.srLevels, encKey),
                srData:   mapKeys(merged.srData, encKey)
              })
            ).catch(function () {});
          } catch (e) {}
        }
      });

      write(MIRROR_KEYS, mirrored);
      try { localStorage.setItem(LAST_UID, uid); } catch (e) {}
      cb({ events: mirrored.length, mastered: mastered, uploaded: uploaded });
    }).catch(function () {
      // Offline, or the rules said no. Leave the device as it was.
      cb(null);
    });
  }

  /** Did merging actually add anything the account did not already have? */
  function changed(remote, merged) {
    if (!remote) return true;
    return (merged.studied || []).length   > (remote.studied || []).length ||
           (merged.mastered || []).length  > (remote.mastered || []).length ||
           (merged.quizzes || []).length   > (remote.quizzes || []).length ||
           Object.keys(merged.srData || {}).length > Object.keys(remote.srData || {}).length;
  }

  global.HosaProgress = {
    sync: sync,
    clearMirror: clearMirror,
    mergeEvent: mergeEvent,
    mergeSrData: mergeSrData,
    mergeQuizzes: mergeQuizzes,
    union: union,
    isEmpty: isEmpty
  };
})(window);
