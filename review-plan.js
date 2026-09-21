/* ═════════════════════════════════════════════════════════════════
   A review queue a student can actually finish.

   Spaced repetition schedules a card forward from the day you rate it.
   Study fifty cards in one sitting and all fifty come back on the same
   day; miss a fortnight and every card you have ever learned is overdue
   at once. The nav badge then reads "99+", which is accurate, useless,
   and impossible to clear — so it sits there permanently telling you
   you are behind. The honest count is the one thing guaranteed not to
   get anybody to review anything.

   So the backlog is spread instead of dumped. The oldest cards are due
   today up to a day's worth; the rest are pushed over the following
   days, a day's worth at a time. Come back after a month away and you
   are shown twenty cards, not four hundred, and the pile drains at a
   pace that fits the goal you set rather than the accident of when you
   happened to study.

   ── What this is allowed to touch ────────────────────────────────

   The due date, and nothing else. Never reps, ease, interval, lapses,
   what you have studied or what you have mastered. Due dates only ever
   move *forward* — nothing is ever made due sooner than the scheduler
   intended, so this cannot pull a card back from a long interval and
   cannot undo a card you have learned. Run it twice and it plans the
   same thing; that is tested, because a planner that shuffles the queue
   on every page load is worse than no planner.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // Same exclusions due.js uses: settings and namespaced sub-keys are not
  // events. Kept in one place there and read through the helper below.
  function eventRows() {
    var out = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('hosa::') !== 0) continue;
        var slug = k.slice(6);
        if (!slug || slug.indexOf('::') !== -1 || slug.indexOf('daily') === 0) continue;
        var row;
        try { row = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
        if (!row || !row.srData || typeof row.srData !== 'object') continue;
        out.push({ key: k, slug: slug, row: row });
      }
    } catch (e) {}
    return out;
  }

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function addDays(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  /**
   * How many cards to ask for in a day: the goal the student set, held to
   * a sensible range. Someone with a 20-card goal should not be shown a
   * hundred, and someone who has not set one should not be shown two.
   */
  function dailyCap() {
    var goal = 20;
    try { goal = parseInt(localStorage.getItem('hosa::daily-goal') || '20', 10) || 20; } catch (e) {}
    return Math.max(10, Math.min(50, goal));
  }

  /**
   * Plan today's queue.
   *
   * Returns { today, deferred, days, changed } — `changed` lists the slugs
   * whose rows were rewritten, so the caller can push them to the account.
   * Pass { dryRun: true } to see the plan without writing anything.
   */
  function plan(opts) {
    opts = opts || {};
    var cap = opts.cap || dailyCap();
    var today = todayStr();
    var rows = eventRows();

    // Every card that is due, oldest first. The tiebreak is the slug and
    // the term, so the same backlog always plans the same way — otherwise
    // two page loads on the same day would produce different queues.
    var due = [];
    rows.forEach(function (r) {
      Object.keys(r.row.srData).forEach(function (term) {
        var c = r.row.srData[term];
        if (!c || !c.due || c.due > today) return;
        due.push({ slug: r.slug, term: term, due: c.due, card: c, row: r });
      });
    });
    if (due.length <= cap) {
      return { today: due.length, deferred: 0, days: due.length ? 1 : 0, changed: [] };
    }

    due.sort(function (a, b) {
      if (a.due !== b.due) return a.due < b.due ? -1 : 1;
      if (a.slug !== b.slug) return a.slug < b.slug ? -1 : 1;
      return a.term < b.term ? -1 : (a.term > b.term ? 1 : 0);
    });

    var touched = {};
    for (var i = cap; i < due.length; i++) {
      var when = addDays(1 + Math.floor((i - cap) / cap));
      var card = due[i].card;
      // Forward only. A card the scheduler already put further out keeps
      // its own date — this is a delay, never a promotion.
      if (card.due >= when) continue;
      card.due = when;
      touched[due[i].slug] = due[i].row;
    }

    var changed = Object.keys(touched);
    if (!opts.dryRun) {
      changed.forEach(function (slug) {
        var r = touched[slug];
        try { localStorage.setItem(r.key, JSON.stringify(r.row)); } catch (e) {}
      });
    }

    return {
      today: cap,
      deferred: due.length - cap,
      days: Math.ceil(due.length / cap),
      changed: changed
    };
  }

  /**
   * Plan, then keep the account in step so the same queue shows up on
   * every device rather than each one spreading the backlog differently.
   */
  function run(uid) {
    var res = plan();
    if (uid && res.changed.length && global.HosaProgress && global.HosaProgress.pushEvent) {
      res.changed.forEach(function (slug) {
        var row;
        try { row = JSON.parse(localStorage.getItem('hosa::' + slug)); } catch (e) { return; }
        if (row) global.HosaProgress.pushEvent(uid, slug, row);
      });
    }
    return res;
  }

  global.HosaReviewPlan = { plan: plan, run: run, dailyCap: dailyCap };
})(window);
