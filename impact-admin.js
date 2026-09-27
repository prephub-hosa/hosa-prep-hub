/* ═════════════════════════════════════════════════════════════════
   Admin: Impact.

   The numbers that say the site works, not just that people visited:

     · retention   — accounts active in the last 7 / 30 days, and how
                     many came back on 5 or more separate days
     · learning    — students who took 3+ quizzes in an event, their
                     first try against their recent average
     · chapters    — registered, in how many states, active this month
     · voices      — reviews and competition results

   Computed from data the site already stores (every account's quiz
   history, the leaderboard, guest summaries), so it covers everyone
   from day one, not just people who arrived after this was built.

   Opening the page saves today's numbers to proof/snapshots — the
   growth record.

   Counts are labelled for what they are: accounts are people who
   signed in; guests are browsers, and one student on two devices is
   two guests.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var DAY = 864e5;
  function db() { return global.firebase.database(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(n) { return (Math.round(n) || 0).toLocaleString(); }
  function pct(x) { return Math.round(x * 100); }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayOf(v) {
    if (typeof v === 'number') return new Date(v).toISOString().slice(0, 10);
    return String(v || '').slice(0, 10);
  }
  function val(p) { return db().ref(p).get().then(function (s) { return s.val(); }); }
  function soft(p) { return val(p).catch(function () { return null; }); }

  /* ── The numbers ────────────────────────────────────────────────── */

  function compute(d) {
    var now = Date.now();
    var users = d.users || {}, lb = d.lb || {}, guests = d.guests || {};
    var o = { accounts: 0, active7: 0, active30: 0, returning: 0, cameBack: 0, quizzes: 0, questions: 0,
              gQuizzes: 0, gQuestions: 0, guests: 0, guests30: 0, pairs: 0, gainStudents: 0,
              firstAvg: 0, recentAvg: 0, improvedPairs: 0 };
    var gainBy = {};
    Object.keys(users).forEach(function (uid) {
      var prog = (users[uid] || {}).progress;
      if (!prog || typeof prog !== 'object') return;
      var days = {}, any = false;
      Object.keys(prog).forEach(function (slug) {
        var row = prog[slug] || {};
        (row.studyDates || []).forEach(function (x) { if (x) { days[dayOf(x)] = 1; any = true; } });
        var qs = (Array.isArray(row.quizzes) ? row.quizzes : Object.keys(row.quizzes || {}).map(function (k) { return row.quizzes[k]; }))
          .filter(function (q) { return q && q.total > 0 && q.score >= 0; })
          .sort(function (a, b) { return (a.date || 0) - (b.date || 0); });
        qs.forEach(function (q) { o.quizzes++; o.questions += q.total; any = true; if (q.date) days[dayOf(q.date)] = 1; });
        if ((row.studied || []).length) any = true;
        // Learning gain: at least three quizzes in the event, so there is a
        // first try and a recent average of two or more to compare it with.
        if (qs.length >= 3) {
          var first = qs[0].score / qs[0].total;
          var rest = qs.slice(1).slice(-3);
          var recent = rest.reduce(function (s, q) { return s + q.score / q.total; }, 0) / rest.length;
          o.pairs++; o.firstAvg += first; o.recentAvg += recent;
          if (recent > first) o.improvedPairs++;
          gainBy[uid] = 1;
        }
      });
      if (!any) return;
      o.accounts++;
      var list = Object.keys(days).sort();
      var last = list.length ? Date.parse(list[list.length - 1] + 'T12:00:00') : 0;
      if (last && now - last <= 7 * DAY) o.active7++;
      if (last && now - last <= 30 * DAY) o.active30++;
      if (list.length >= 2) o.cameBack++;
      if (list.length >= 5) o.returning++;
    });
    if (o.pairs) { o.firstAvg /= o.pairs; o.recentAvg /= o.pairs; }
    o.gainStudents = Object.keys(gainBy).length;

    Object.keys(guests).forEach(function (gid) {
      var g = guests[gid] || {}, last = 0, any = false;
      Object.keys(g).forEach(function (slug) {
        var r = g[slug] || {};
        o.gQuizzes += +r.quizzes || 0; o.gQuestions += +r.questions || 0;
        if ((+r.studied || 0) + (+r.quizzes || 0) > 0) any = true;
        last = Math.max(last, Date.parse(r.lastActive || '') || 0);
      });
      if (!any) return;
      o.guests++;
      if (last && now - last <= 30 * DAY) o.guests30++;
    });

    // Chapters: only registered ones, never the demonstration seeds.
    var reg = {};
    [d.chapters || {}, d.chaptersFallback || {}].forEach(function (store) {
      Object.keys(store).forEach(function (slug) { if (!reg[slug]) reg[slug] = store[slug] || {}; });
    });
    var members = {}, active = {};
    Object.keys(lb).forEach(function (id) {
      var r = lb[id] || {};
      if (!r.chapter || !reg[r.chapter]) return;
      members[r.chapter] = (members[r.chapter] || 0) + 1;
      var t = Date.parse(r.updatedAt || '') || 0;
      if (t && now - t <= 30 * DAY) active[r.chapter] = 1;
    });
    var states = {};
    Object.keys(reg).forEach(function (s) { var st = String(reg[s].state || '').trim().toLowerCase(); if (st) states[st] = 1; });
    o.chapters = Object.keys(reg).length;
    o.chaptersWithMembers = Object.keys(members).length;
    o.chaptersActive = Object.keys(active).length;
    o.chapterMembers = Object.keys(members).reduce(function (s, k) { return s + members[k]; }, 0);
    o.states = Object.keys(states).length;

    var rv = d.reviews || {}, rs = d.results || {}, sh = d.shouts || {};
    var stars = 0;
    o.reviews = Object.keys(rv).length;
    Object.keys(rv).forEach(function (k) { stars += +(rv[k] || {}).stars || 0; });
    o.avgStars = o.reviews ? stars / o.reviews : 0;
    o.results = 0; o.top3 = 0; o.resultStudents = Object.keys(rs).length;
    Object.keys(rs).forEach(function (uid) {
      Object.keys(rs[uid] || {}).forEach(function (k) {
        var r = rs[uid][k] || {}; o.results++;
        if (r.place >= 1 && r.place <= 3) o.top3++;
      });
    });
    o.shouts = Object.keys(sh).length;
    return o;
  }

  function pl(n, one, many) { return num(n) + ' ' + (n === 1 ? one : many); }

  /** Plain sentences, each true as written, for an application. */
  function sentences(o) {
    var out = [];
    out.push(pl(o.accounts, 'student has', 'students have') + ' studied on HOSA Prep Hub with an account' + (o.guests ? ', plus ' + pl(o.guests, 'guest device', 'guest devices') + ' without one' : '') + '.');
    if (o.returning) out.push(num(o.returning) + ' of them came back to study on 5 or more separate days' + (o.cameBack ? ' (' + num(o.cameBack) + ' returned at least once)' : '') + '.');
    out.push('Students have answered ' + pl(o.questions + o.gQuestions, 'practice question', 'practice questions') + ' across ' + pl(o.quizzes + o.gQuizzes, 'quiz', 'quizzes') + '.');
    if (o.pairs >= 5) out.push('Students who took 3+ quizzes in an event raised their accuracy from ' + pct(o.firstAvg) + '% on their first try to ' + pct(o.recentAvg) + '% on average (' + pl(o.gainStudents, 'student', 'students') + ', ' + pl(o.pairs, 'student-event pair', 'student-event pairs') + '; ' + pct(o.improvedPairs / o.pairs) + '% improved).');
    if (o.chapters) out.push(pl(o.chapters, 'HOSA chapter', 'HOSA chapters') + (o.states ? ' across ' + pl(o.states, 'state/region', 'states/regions') : '') + (o.chapters === 1 ? ' has' : ' have') + ' registered, with ' + pl(o.chapterMembers, 'member', 'members') + ' joined through chapter links; ' + num(o.chaptersActive) + (o.chaptersActive === 1 ? ' was' : ' were') + ' active in the last 30 days.');
    if (o.reviews) out.push(pl(o.reviews, 'student', 'students') + ' reviewed the site, averaging ' + o.avgStars.toFixed(1) + ' out of 5 stars.');
    if (o.results) out.push(pl(o.resultStudents, 'student', 'students') + ' reported ' + pl(o.results, 'competition result', 'competition results') + ', including ' + pl(o.top3, 'top-3 placement', 'top-3 placements') + '.');
    return out;
  }

  /* ── Rendering ──────────────────────────────────────────────────── */

  var CSS = [
    '.im-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:10px 0 18px}',
    '.im-stat{border:1px solid var(--rule,rgba(0,0,0,.1));border-radius:12px;padding:14px;background:var(--bg-card,#fff)}',
    '.im-stat b{display:block;font:800 26px/1.1 Inter,system-ui,sans-serif}',
    '.im-stat span{font-size:12px;color:var(--ink-soft,#666)}',
    '.im-stat.hi{border-color:#16a34a;background:rgba(22,163,74,.06)}',
    '.im-box{border:1px solid var(--rule,rgba(0,0,0,.1));border-radius:12px;padding:14px 16px;background:var(--bg-card,#fff);margin-bottom:16px}',
    '.im-box h3{margin:0 0 8px;font-size:14px}',
    '.im-app li{margin:0 0 6px;line-height:1.5;font-size:14px}',
    '.im-btn{border:1px solid var(--rule-strong,#ccc);background:var(--bg-card,#fff);color:var(--ink,#111);border-radius:8px;padding:5px 10px;font:600 12.5px Inter,system-ui,sans-serif;cursor:pointer}',
    '.im-btn.ok{background:#16a34a;border-color:#16a34a;color:#fff}',
    '.im-btn.bad{color:#dc2626}',
    '.im-item{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;border-top:1px solid var(--rule,rgba(0,0,0,.08));padding:10px 0}',
    '.im-item p{margin:2px 0;font-size:14px}',
    '.im-item small{color:var(--ink-soft,#666)}',
    '.im-tag{font:700 10px Inter,system-ui,sans-serif;padding:2px 7px;border-radius:999px;background:#fef3c7;color:#92400e;margin-left:6px}',
    '.im-tag.ok{background:#dcfce7;color:#166534}',
    '.im-acts{display:flex;gap:6px;flex:none}',
    '.im-table{width:100%;border-collapse:collapse;font-size:13px}',
    '.im-table th,.im-table td{text-align:right;padding:6px;border-bottom:1px solid var(--rule,rgba(0,0,0,.08))}',
    '.im-table th:first-child,.im-table td:first-child{text-align:left}',
    '.im-rules textarea{width:100%;height:160px;font:12px ui-monospace,monospace;box-sizing:border-box}'
  ].join('\n');

  function mount(host) {
    if (!host) return;
    if (!document.getElementById('im-css')) { var st = document.createElement('style'); st.id = 'im-css'; st.textContent = CSS; document.head.appendChild(st); }
    host.innerHTML = '<p class="empty">Crunching the numbers…</p>';
    var data = {};

    Promise.all([
      soft('users'), soft('leaderboard/level'), soft('guest-stats'), soft('chapters'), soft('analytics/chapters'),
      val('proof/reviews').then(function (v) { return { ok: true, v: v }; }, function () { return { ok: false }; }),
      soft('proof/results'), soft('proof/chapters'), soft('proof/snapshots')
    ]).then(function (r) {
      data = { users: r[0], lb: r[1], guests: r[2], chapters: r[3], chaptersFallback: r[4],
               reviews: r[5].ok ? r[5].v : {}, results: r[6], shouts: r[7], snapshots: r[8] || {}, live: r[5].ok };
      var o = compute(data);
      if (data.live) record(o);
      render(o);
    }, function (e) { host.innerHTML = '<p class="empty">Could not load: ' + esc(e && e.message) + '</p>'; });

    /** Today's snapshot, and the public headline numbers. */
    function record(o) {
      var snap = { accounts: o.accounts, active7: o.active7, active30: o.active30, returning: o.returning,
                   questions: o.questions + o.gQuestions, quizzes: o.quizzes + o.gQuizzes, guests: o.guests,
                   chapters: o.chapters, chaptersActive: o.chaptersActive, reviews: o.reviews, results: o.results,
                   gainPts: o.pairs >= 5 ? pct(o.recentAvg - o.firstAvg) : null, at: Date.now() };
      data.snapshots[today()] = snap;
      db().ref('proof/snapshots/' + today()).set(snap).catch(function () {});
      // The public Wall is gone; clear the numbers it used to show.
      db().ref('proof/stats').remove().catch(function () {});
    }

    function stat(big, small, hi) { return '<div class="im-stat' + (hi ? ' hi' : '') + '"><b>' + big + '</b><span>' + small + '</span></div>'; }

    function render(o) {
      var h = '';
      if (!data.live) {
        h += '<div class="im-box im-rules" style="border-color:#f59e0b;background:rgba(245,158,11,.08)"><h3>Rewards are built but switched off</h3>'
          + '<p style="font-size:13.5px;margin:0 0 8px">Reviews and competition results need one more rules block, pasted exactly like the chat one: Firebase console → Realtime Database → Rules, click at the end of the <code>"rules": {</code> line, press Enter, paste, Publish. Then reload this page.</p>'
          + '<textarea readonly id="im-rules-text">Loading…</textarea><div style="margin-top:6px"><button class="im-btn ok" id="im-rules-copy">Copy rules</button></div></div>';
      }
      h += '<div class="im-grid">'
        + stat(num(o.accounts), 'students with an account who studied')
        + stat(num(o.active7) + ' / ' + num(o.active30), 'active in last 7 / 30 days')
        + stat(num(o.returning), 'came back on 5+ separate days', true)
        + stat(num(o.questions + o.gQuestions), 'practice questions answered')
        + stat(o.pairs ? pct(o.firstAvg) + '% → ' + pct(o.recentAvg) + '%' : '—', 'quiz accuracy, first try → recent' + (o.pairs ? ' (n=' + o.pairs + ')' : ''), o.pairs >= 5 && o.recentAvg > o.firstAvg)
        + stat(num(o.chapters) + (o.states ? ' · ' + o.states + ' states' : ''), 'chapters registered')
        + stat(num(o.chaptersActive), 'chapters active in 30 days')
        + stat(o.reviews ? o.avgStars.toFixed(1) + '★ · ' + o.reviews : '0', 'average rating · reviews')
        + stat(num(o.results) + (o.top3 ? ' · ' + o.top3 + ' top-3' : ''), 'competition results reported')
        + stat(num(o.guests), 'guest devices (no account)')
        + '</div>';

      var lines = sentences(o);
      h += '<div class="im-box"><h3>For your application <button class="im-btn" id="im-copy" style="float:right">Copy</button></h3><ul class="im-app">'
        + lines.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>'
        + '<small style="color:var(--ink-soft,#666)">Every figure is computed from stored data as of today. Guests are counted per browser, so they are listed separately from accounts.</small></div>';

      var days = Object.keys(data.snapshots || {}).sort().reverse().slice(0, 14);
      if (days.length) {
        h += '<div class="im-box"><h3>Growth (daily snapshots, saved each time you open this page)</h3><div style="overflow-x:auto"><table class="im-table"><thead><tr><th>Date</th><th>Accounts</th><th>Active 30d</th><th>Returning 5+</th><th>Questions</th><th>Chapters</th><th>Reviews</th><th>Results</th></tr></thead><tbody>'
          + days.map(function (k) { var s = data.snapshots[k] || {};
              return '<tr><td>' + esc(k) + '</td><td>' + num(s.accounts) + '</td><td>' + num(s.active30) + '</td><td>' + num(s.returning) + '</td><td>' + num(s.questions) + '</td><td>' + num(s.chapters) + '</td><td>' + num(s.reviews) + '</td><td>' + num(s.results) + '</td></tr>'; }).join('')
          + '</tbody></table></div></div>';
      }

      h += '<div class="im-box"><h3>Reviews, results and chapter shout-outs</h3><p style="font-size:12.5px;color:var(--ink-soft,#666);margin:0 0 4px">Only you see these. Delete anything that is spam — the student keeps their reward.</p>' + modList() + '</div>';
      host.innerHTML = h;

      var copy = document.getElementById('im-copy');
      if (copy) copy.addEventListener('click', function () {
        var t = lines.join('\n');
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { copy.textContent = 'Copied'; }, function () { prompt('Copy:', t); });
      });
      if (!data.live) {
        fetch('firebase/PASTE-PROOF-INTO-FIREBASE-RULES.txt', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (t) {
          var ta = document.getElementById('im-rules-text'); if (ta) ta.value = t;
        });
        var rc = document.getElementById('im-rules-copy');
        if (rc) rc.addEventListener('click', function () {
          var ta = document.getElementById('im-rules-text'); ta.select();
          (navigator.clipboard ? navigator.clipboard.writeText(ta.value) : Promise.reject()).then(function () { rc.textContent = 'Copied — now paste it in Firebase'; }, function () { document.execCommand('copy'); });
        });
      }
      host.querySelectorAll('[data-mod]').forEach(function (b) {
        b.addEventListener('click', function () { moderate(b.getAttribute('data-mod'), b.getAttribute('data-path'), o); });
      });
    }

    function modList() {
      var items = [];
      var rv = data.reviews || {}, rs = data.results || {}, sh = data.shouts || {};
      Object.keys(rv).forEach(function (uid) { var r = rv[uid] || {};
        items.push({ ts: r.ts, path: 'proof/reviews/' + uid,
          html: '<p>' + '★★★★★'.slice(0, r.stars || 0) + ' “' + esc(r.text) + '”</p><small>' + esc(r.name) + (r.chapter ? ' · ' + esc(r.chapter) : '') + '</small>' }); });
      Object.keys(rs).forEach(function (uid) { Object.keys(rs[uid] || {}).forEach(function (k) { var r = rs[uid][k] || {};
        items.push({ ts: r.ts, path: 'proof/results/' + uid + '/' + k,
          html: '<p>🏅 ' + (r.place ? r.place + (['th', 'st', 'nd', 'rd'][r.place] || 'th') + ' place' : 'Competed') + ' — ' + esc(r.event) + ' (' + esc(r.level) + ' ' + esc(r.year) + ')</p><small>' + esc(r.name) + (r.chapter ? ' · ' + esc(r.chapter) : '') + '</small>' }); }); });
      Object.keys(sh).forEach(function (slug) { var r = sh[slug] || {};
        items.push({ ts: r.ts, path: 'proof/chapters/' + slug,
          html: '<p>📣 “' + esc(r.text) + '”</p><small>' + esc(r.name) + ', founder · ' + esc(r.chapter || slug) + '</small>' }); });
      if (!items.length) return '<p class="empty" style="margin:8px 0 0">Nothing yet. Students see the offers on the Rewards tab.</p>';
      items.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
      return items.map(function (i) {
        return '<div class="im-item"><div>' + i.html + '</div><div class="im-acts">'
          + '<button class="im-btn bad" data-mod="delete" data-path="' + esc(i.path) + '">Delete</button></div></div>';
      }).join('');
    }

    function moderate(act, path) {
      if (act !== 'delete' || !confirm('Delete this for good? (The student keeps their reward.)')) return;
      var p = db().ref(path).remove();
      p.then(function () {
        // Reflect it locally and redraw.
        var parts = path.split('/'), store = parts[1] === 'reviews' ? data.reviews : parts[1] === 'results' ? data.results : data.shouts;
        var node = store, i;
        for (i = 2; i < parts.length - 1; i++) node = node[parts[i]] || {};
        delete node[parts[parts.length - 1]];
        render(compute(data));
      }, function (e) { alert('Could not update: ' + (e && e.message)); });
    }
  }

  global.HosaImpact = { mount: mount, compute: compute, sentences: sentences };
})(window);
