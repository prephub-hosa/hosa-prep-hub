/* ═════════════════════════════════════════════════════════════════
   What's due today — the one implementation.

   There used to be three. engage.js read the real thing
   (hosa::<slug>.srData[term].due, a "YYYY-MM-DD" string); index.html
   twice read hosa::<slug>::cards, a key nothing has ever written, and
   compared its imaginary .due to Date.now() in milliseconds. So the
   resume card lower down the page said "12 cards due today" while the
   hero at the top of the same page said "0 Due today" and offered
   "Continue Studying" instead of "Review 12 Due Cards".

   For a spaced-repetition site that number is the entire reason to come
   back tomorrow, and the most prominent copy of it was always zero.
   One function now, loaded before anything that reports a count.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  // hosa:: keys that are app settings rather than per-event progress.
  var NOT_AN_EVENT = {
    'xp': 1, 'streak': 1, 'sound': 1, 'theme': 1, 'achievements': 1,
    'bookmarks': 1, 'school': 1, 'display-name': 1, 'chapter': 1,
    'chapter-owner': 1, 'daily-goal': 1, 'save-prompt-snooze': 1,
    'onboard-v1': 1, 'intro-v1': 1, 'pomo-stats': 1, 'dc-streak': 1,
    'reminder': 1, 'guest-id': 1
  };

  function titleCase(slug) {
    return String(slug).replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  /**
   * Every event with at least one card due, most-due first.
   * @returns {Array<{slug:string, name:string, due:number}>}
   */
  function dueByEvent() {
    var today = todayStr();
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('hosa::') !== 0) continue;
        var slug = k.slice(6);
        // Settings, and namespaced sub-keys like "hosa::<slug>::cards".
        if (!slug || NOT_AN_EVENT[slug] || slug.indexOf('::') !== -1) continue;
        if (slug.indexOf('daily') === 0) continue;
        try {
          var d = JSON.parse(localStorage.getItem(k));
          if (!d || !d.srData) continue;
          var due = 0;
          for (var term in d.srData) {
            if (!Object.prototype.hasOwnProperty.call(d.srData, term)) continue;
            var c = d.srData[term];
            // Dates are "YYYY-MM-DD", so a string compare is a date compare.
            if (c && c.due && c.due <= today) due++;
          }
          if (due > 0) out.push({ slug: slug, name: titleCase(slug), due: due });
        } catch (e) {}
      }
    } catch (e) {}
    return out.sort(function (a, b) { return b.due - a.due; });
  }

  /** Total cards due across every event. */
  function dueCount() {
    return dueByEvent().reduce(function (s, e) { return s + e.due; }, 0);
  }

  global.hosaDueToday  = dueByEvent;   // name kept — engage.js and index.html both call it
  global.hosaDueByEvent = dueByEvent;
  global.hosaDueCount  = dueCount;
})(window);
