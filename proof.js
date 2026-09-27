/* ═════════════════════════════════════════════════════════════════
   Rewards.

   Two jobs, one tab.

   For students: "your progress, proven" — how your quiz accuracy has
   moved since your first try, from the quizzes you have already taken —
   and three ten-second things to do that each pay out something real
   the moment you do them:

     ⭐ Rate the site          → your Study Wrapped story card,
                                 +500 XP, Supporter badge
     🏅 Report a competition  → +1,000 XP, Medalist/Competitor badge,
                                 your result card, a spot on the Wall
     📣 Chapter shout-out      → a printable Chapter Impact Report
        (founders)               and your chapter on the Wall

   For the site: every one of those is evidence — reviews, placements,
   chapters vouching for it — stored under proof/ with rules that tie
   each to a signed-in account, stamp it with server time, and let only
   the admin approve it for the public Wall of Wins.

   Nothing here renders HTML from what someone typed.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var XP_REVIEW = 500, XP_RESULT = 1000;
  var LEVELS = { regional: 'Regional', area: 'Area', state: 'State Leadership Conference', ilc: 'International Leadership Conference', other: 'Competition' };
  var LEVEL_SHORT = { regional: 'Regional', area: 'Area', state: 'State', ilc: 'ILC', other: 'Competition' };

  /* ── Helpers ────────────────────────────────────────────────────── */

  function db() { return global.firebase.database(); }
  function me() { try { return global.firebase.auth().currentUser; } catch (e) { return null; } }
  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(n) { return (Math.round(n) || 0).toLocaleString(); }
  function pct(x) { return Math.round(x * 100); }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n) : s; }
  function xpLevel(xp) { return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1; }
  function ordinal(n) { var t = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (t[(v - 20) % 10] || t[v] || t[0]); }
  function eventName(slug) {
    var names = global.__hosaEventNames || {};
    return names[slug] || String(slug).replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function displayName() {
    return clip(ls('hosa-username') || ls('hosa::username') || ls('hosa-lb-name') || String((me() || {}).email || '').split('@')[0] || 'Student', 40);
  }
  function chapter() { return { slug: ls('hosa::chapter').trim(), name: ls('hosa::chapter-name').trim() }; }

  /* ── Your progress, from what is already on this device ─────────── */

  /**
   * Every event row the site keeps (hosa::<slug>), reduced to how the
   * student's quiz accuracy has moved. For a signed-in student progress.js
   * has already mirrored the account's rows here, so this is their whole
   * history, not just this device's.
   *
   * "Recent" is the average of the last three quizzes after the first, so
   * one lucky or unlucky quiz does not decide the number.
   */
  function myStats() {
    var events = [], days = {}, quizzes = 0, questions = 0, mastered = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('hosa::') !== 0) continue;
        var slug = k.slice(6);
        if (!slug || slug.indexOf('::') !== -1 || slug.indexOf('daily') === 0) continue;
        var row; try { row = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
        if (!row || typeof row !== 'object' || !Array.isArray(row.studied)) continue;
        (row.studyDates || []).forEach(function (d) { if (d) days[String(d).slice(0, 10)] = 1; });
        mastered += (row.mastered || []).length;
        var qs = (row.quizzes || []).filter(function (q) { return q && q.total > 0 && q.score >= 0; })
          .sort(function (a, b) { return (a.date || 0) - (b.date || 0); });
        quizzes += qs.length;
        qs.forEach(function (q) { questions += q.total; if (q.date) days[new Date(q.date).toISOString().slice(0, 10)] = 1; });
        if (!qs.length) continue;
        var first = qs[0].score / qs[0].total;
        var rest = qs.slice(1).slice(-3);
        var recent = rest.length ? rest.reduce(function (s, q) { return s + q.score / q.total; }, 0) / rest.length : null;
        var best = qs.reduce(function (m, q) { return Math.max(m, q.score / q.total); }, 0);
        events.push({ slug: slug, name: eventName(slug), quizzes: qs.length, first: first, recent: recent, best: best,
                      delta: recent == null ? null : recent - first });
      }
    } catch (e) {}
    var measured = events.filter(function (e) { return e.recent != null; });
    var overall = null;
    if (measured.length) {
      var f = 0, r = 0;
      measured.forEach(function (e) { f += e.first; r += e.recent; });
      overall = { first: f / measured.length, recent: r / measured.length };
      overall.delta = overall.recent - overall.first;
    }
    events.sort(function (a, b) { return (b.delta == null ? -9 : b.delta) - (a.delta == null ? -9 : a.delta) || b.quizzes - a.quizzes; });
    var xp = parseInt(ls('hosa::xp') || '0', 10) || 0;
    return {
      events: events, overall: overall, quizzes: quizzes, questions: questions, mastered: mastered,
      days: Object.keys(days).length, xp: xp, level: xpLevel(xp),
      top: measured.slice().sort(function (a, b) { return b.delta - a.delta; })[0] || null
    };
  }

  /* ── Rewards ────────────────────────────────────────────────────── */

  /** XP, once per reward per account. The account record is the ledger. */
  function grantXP(kind, amount) {
    var u = me();
    if (!u) return Promise.resolve(false);
    var ref = db().ref('users/' + u.uid + '/rewards/' + kind);
    return ref.get().then(function (s) {
      if (s.exists()) return false;
      return ref.set(Date.now()).then(function () {
        var xp = (parseInt(ls('hosa::xp') || '0', 10) || 0) + amount;
        lsSet('hosa::xp', xp);
        // The home page pushes XP to the leaderboard every few seconds; do it
        // now as well so the jump shows immediately.
        db().ref('leaderboard/level/' + u.uid).update({ xp: xp }).catch(function () {});
        try { if (global.__hosaRenderLeaderboard) global.__hosaRenderLeaderboard(); } catch (e) {}
        try { if (global.__hosaRenderProgress) global.__hosaRenderProgress(); } catch (e) {}
        return true;
      });
    }).catch(function () { return false; });
  }

  /** A badge beside your name on the leaderboard. */
  function giveBadge(kind) {
    var u = me();
    var have = {};
    try { have = JSON.parse(ls('hosa::badges') || '{}') || {}; } catch (e) {}
    have[kind] = true;
    lsSet('hosa::badges', JSON.stringify(have));
    if (u) db().ref('leaderboard/level/' + u.uid + '/badges/' + kind).set(true).catch(function () {});
  }

  /* ── The share cards (1080 × 1920, story-sized) ─────────────────── */

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function base(c, W, H) {
    var g = c.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#8f1420'); g.addColorStop(0.55, '#3a0a10'); g.addColorStop(1, '#0b0b0f');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var glow = c.createRadialGradient(W * 0.8, H * 0.12, 20, W * 0.8, H * 0.12, 700);
    glow.addColorStop(0, 'rgba(255,120,120,.35)'); glow.addColorStop(1, 'rgba(255,120,120,0)');
    c.fillStyle = glow; c.fillRect(0, 0, W, H);
    c.textBaseline = 'alphabetic';
    c.fillStyle = 'rgba(255,255,255,.85)';
    c.font = '700 34px Inter, system-ui, sans-serif';
    c.fillText('✚  HOSA PREP HUB', 80, 130);
  }
  function footer(c, W, H, s) {
    var ch = chapter();
    c.fillStyle = '#fff';
    c.font = '700 54px Inter, system-ui, sans-serif';
    c.fillText(displayName(), 80, H - 230);
    c.fillStyle = 'rgba(255,255,255,.7)';
    c.font = '500 36px Inter, system-ui, sans-serif';
    c.fillText(clip(ch.name || 'HOSA competitor', 44) + '  ·  Level ' + s.level, 80, H - 175);
    c.fillStyle = 'rgba(255,255,255,.55)';
    c.font = '500 32px Inter, system-ui, sans-serif';
    c.fillText('Study free at hosaprephub.vercel.app', 80, H - 90);
  }
  function tile(c, x, y, w, h, big, small) {
    c.fillStyle = 'rgba(255,255,255,.08)'; roundRect(c, x, y, w, h, 28); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#fff'; c.font = '800 76px Inter, system-ui, sans-serif'; c.fillText(big, x + 36, y + 110);
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '600 30px Inter, system-ui, sans-serif'; c.fillText(small, x + 36, y + 160);
  }
  function fit(c, text, max, size, weight) {
    var s = size;
    do { c.font = weight + ' ' + s + 'px Inter, system-ui, sans-serif'; s -= 4; } while (c.measureText(text).width > max && s > 20);
  }

  function drawWrapped(s) {
    var W = 1080, H = 1920, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    base(c, W, H);
    c.fillStyle = 'rgba(255,255,255,.7)';
    c.font = '600 40px Inter, system-ui, sans-serif';
    c.fillText('MY STUDY WRAPPED · ' + new Date().getFullYear(), 80, 250);

    var y = 300;
    if (s.overall && s.overall.delta > 0) {
      c.fillStyle = '#fff'; c.font = '900 260px Inter, system-ui, sans-serif';
      c.fillText('+' + pct(s.overall.delta), 70, y + 230);
      var w = c.measureText('+' + pct(s.overall.delta)).width;
      c.font = '800 70px Inter, system-ui, sans-serif'; c.fillText('pts', 90 + w, y + 230);
      c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 46px Inter, system-ui, sans-serif';
      c.fillText('quiz accuracy: ' + pct(s.overall.first) + '% → ' + pct(s.overall.recent) + '%', 80, y + 320);
      // the before / after bars
      var bx = 80, bw = W - 160;
      [[s.overall.first, 'First quiz', 'rgba(255,255,255,.35)'], [s.overall.recent, 'Now', '#ffd166']].forEach(function (b, i) {
        var by = y + 390 + i * 90;
        c.fillStyle = 'rgba(255,255,255,.1)'; roundRect(c, bx, by, bw, 50, 25); c.fill();
        c.fillStyle = b[2]; roundRect(c, bx, by, Math.max(50, bw * b[0]), 50, 25); c.fill();
        c.fillStyle = i ? '#1a1a1a' : '#fff'; c.font = '700 28px Inter, system-ui, sans-serif'; c.fillText(b[1], bx + 22, by + 35);
      });
      y += 620;
    } else {
      c.fillStyle = '#fff'; c.font = '900 200px Inter, system-ui, sans-serif';
      c.fillText(num(s.questions || s.mastered), 70, y + 190);
      c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 50px Inter, system-ui, sans-serif';
      c.fillText(s.questions ? 'practice questions answered' : 'terms mastered', 80, y + 270);
      y += 380;
    }
    var gw = (W - 160 - 30) / 2;
    tile(c, 80, y, gw, 200, num(s.questions), 'questions answered');
    tile(c, 110 + gw, y, gw, 200, num(s.days), s.days === 1 ? 'day studied' : 'days studied');
    tile(c, 80, y + 230, gw, 200, num(s.quizzes), s.quizzes === 1 ? 'quiz taken' : 'quizzes taken');
    tile(c, 110 + gw, y + 230, gw, 200, num(s.mastered), 'terms mastered');
    y += 490;
    if (s.top && s.top.delta > 0) {
      c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '600 34px Inter, system-ui, sans-serif';
      c.fillText('BIGGEST GLOW-UP', 80, y);
      c.fillStyle = '#fff'; fit(c, s.top.name, W - 160, 64, '800');
      c.fillText(s.top.name, 80, y + 80);
      c.fillStyle = '#ffd166'; c.font = '700 48px Inter, system-ui, sans-serif';
      c.fillText(pct(s.top.first) + '% → ' + pct(s.top.recent) + '%', 80, y + 150);
    }
    footer(c, W, H, s);
    return cv;
  }

  function drawResult(r, s) {
    var W = 1080, H = 1920, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var c = cv.getContext('2d');
    base(c, W, H);
    var medal = { 1: ['#f5c542', '#b8860b'], 2: ['#d9dde3', '#8a9099'], 3: ['#e0995e', '#8a4b1c'] }[r.place] || ['#ef4444', '#7f1d1d'];
    var cx = W / 2, cy = 560;
    var g = c.createRadialGradient(cx - 60, cy - 80, 30, cx, cy, 250);
    g.addColorStop(0, medal[0]); g.addColorStop(1, medal[1]);
    c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 230, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, 190, 0, Math.PI * 2); c.stroke();
    c.textAlign = 'center';
    c.fillStyle = { 1: '#4a3200', 2: '#2b2f36', 3: '#3b1a05' }[r.place] || '#fff';
    c.font = '900 150px Inter, system-ui, sans-serif';
    c.fillText(r.place ? ordinal(r.place) : '✓', cx, cy + 55);
    c.fillStyle = '#fff';
    c.font = '800 84px Inter, system-ui, sans-serif';
    c.fillText(r.place ? ordinal(r.place) + ' Place' : 'I competed', cx, 930);
    c.fillStyle = '#ffd166'; fit(c, r.event, W - 160, 70, '800'); c.fillText(r.event, cx, 1030);
    c.fillStyle = 'rgba(255,255,255,.85)'; fit(c, (LEVELS[r.level] || 'Competition') + ' ' + r.year, W - 160, 44, '600');
    c.fillText((LEVELS[r.level] || 'Competition') + ' ' + r.year, cx, 1100);
    c.fillStyle = 'rgba(255,255,255,.7)'; c.font = '600 38px Inter, system-ui, sans-serif';
    c.fillText('HOW I PREPARED', cx, 1230);
    c.textAlign = 'left';
    var gw = (W - 160 - 30) / 2;
    tile(c, 80, 1270, gw, 200, num(s.questions), 'practice questions');
    var gain = s.overall && s.overall.delta > 0;
    tile(c, 110 + gw, 1270, gw, 200, gain ? '+' + pct(s.overall.delta) : num(s.days), gain ? 'pts quiz improvement' : (s.days === 1 ? 'day studied' : 'days studied'));
    footer(c, W, H, s);
    return cv;
  }

  /** Save the card, or hand it to the phone's share sheet. */
  function deliver(cv, filename, share) {
    return new Promise(function (resolve) {
      cv.toBlob(function (blob) {
        if (!blob) return resolve(false);
        var file = null;
        try { file = new File([blob], filename, { type: 'image/png' }); } catch (e) {}
        if (share && file && navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: 'HOSA Prep Hub', text: 'Studying for HOSA? hosaprephub.vercel.app' })
            .then(function () { resolve(true); }, function () { resolve(false); });
          return;
        }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        resolve(true);
      }, 'image/png');
    });
  }

  /* ── Styles ─────────────────────────────────────────────────────── */

  var CSS = [
    '.rw{max-width:980px}',
    '.rw-hero{border-radius:20px;padding:26px 26px 24px;background:linear-gradient(135deg,#8f1420,#3a0a10 60%,#141418);color:#fff;margin-bottom:22px;position:relative;overflow:hidden}',
    '.rw-hero h2{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:clamp(26px,4.4vw,36px);line-height:1.1;margin:6px 0 8px;color:#fff}',
    '.rw-hero p{margin:0;color:rgba(255,255,255,.82);font-size:15px;max-width:60ch}',
    '.rw-kick{font:700 11px/1 "Geist Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#ffd166}',
    '.rw-h{font-family:Fraunces,Georgia,serif;font-weight:500;font-size:22px;margin:30px 0 4px;color:var(--ink)}',
    '.rw-sub{color:var(--ink-soft);font-size:14px;margin:0 0 14px}',
    '.rw-card{background:var(--bg-card);border:1px solid var(--rule);border-radius:16px;padding:18px}',
    '.rw-proof{display:grid;grid-template-columns:1.2fr 1fr;gap:16px}',
    '.rw-big{font:800 56px/1 Inter,system-ui,sans-serif;color:var(--ink);letter-spacing:-.02em}',
    '.rw-big small{font-size:20px;font-weight:700;margin-left:4px}',
    '.rw-up{color:#16a34a}.rw-down{color:#dc2626}',
    '.rw-bars{margin-top:14px;display:grid;gap:8px}',
    '.rw-bar{position:relative;height:30px;border-radius:15px;background:var(--highlight,rgba(127,127,127,.12));overflow:hidden}',
    '.rw-bar i{position:absolute;inset:0 auto 0 0;border-radius:15px;background:rgba(127,127,127,.35)}',
    '.rw-bar.now i{background:linear-gradient(90deg,#ef4444,#f59e0b)}',
    '.rw-bar span{position:relative;z-index:1;font:700 12.5px/30px Inter,system-ui,sans-serif;padding-left:12px;color:var(--ink)}',
    '.rw-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.rw-stat{border:1px solid var(--rule);border-radius:12px;padding:12px 14px}',
    '.rw-stat b{display:block;font:800 26px/1.1 Inter,system-ui,sans-serif;color:var(--ink)}',
    '.rw-stat span{font-size:12px;color:var(--ink-soft)}',
    '.rw-table{width:100%;border-collapse:collapse;margin-top:14px;font-size:14px}',
    '.rw-table th{font:700 10.5px "Geist Mono",ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-faint);text-align:left;padding:8px 6px;border-bottom:1px solid var(--rule)}',
    '.rw-table td{padding:9px 6px;border-bottom:1px solid var(--rule);color:var(--ink)}',
    '.rw-table td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}',
    '.rw-empty{color:var(--ink-soft);font-size:14px;padding:6px 0}',
    '.rw-earn{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}',
    '.rw-offer{display:flex;flex-direction:column;gap:10px;position:relative}',
    '.rw-offer h3{margin:0;font:700 17px Inter,system-ui,sans-serif;color:var(--ink)}',
    '.rw-time{font:700 11px Inter,system-ui,sans-serif;color:var(--ink-soft)}',
    '.rw-get{margin:0;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,rgba(245,197,66,.16),rgba(239,68,68,.1));border:1px solid rgba(245,197,66,.4);list-style:none;display:grid;gap:7px}',
    '.rw-get li{font-size:13.5px;color:var(--ink);line-height:1.35}',
    '.rw-get .lbl{font:800 10.5px "Geist Mono",ui-monospace,monospace;letter-spacing:.12em;color:#b45309;text-transform:uppercase}',
    '.rw-btn{border:0;border-radius:11px;background:var(--grad-cta,#c2182b);color:#fff;font:700 14.5px Inter,system-ui,sans-serif;padding:11px 14px;cursor:pointer;margin-top:auto}',
    '.rw-btn:hover{filter:brightness(1.07)}',
    '.rw-btn.ghost{background:none;color:var(--ink);border:1px solid var(--rule-strong,var(--rule))}',
    '.rw-btn:disabled{opacity:.55;cursor:not-allowed}',
    '.rw-done{display:inline-flex;align-items:center;gap:6px;font:700 12px Inter,system-ui,sans-serif;color:#15803d;background:rgba(22,163,74,.12);border-radius:999px;padding:3px 10px;align-self:flex-start}',
    '.rw-form{display:grid;gap:10px}',
    '.rw-form label{font:600 12.5px Inter,system-ui,sans-serif;color:var(--ink-soft);display:grid;gap:5px}',
    '.rw-form input,.rw-form select,.rw-form textarea{font:15px Inter,system-ui,sans-serif;padding:10px 11px;border-radius:10px;border:1px solid var(--rule-strong,var(--rule));background:var(--bg);color:var(--ink);width:100%;box-sizing:border-box}',
    '.rw-form textarea{min-height:74px;resize:vertical}',
    '.rw-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
    '.rw-stars{display:flex;gap:4px}',
    '.rw-stars button{border:0;background:none;font-size:34px;line-height:1;cursor:pointer;color:#d1d5db;padding:0 2px}',
    '.rw-stars button.on{color:#f5b50a}',
    '.rw-check{display:flex!important;grid-template-columns:none!important;align-items:center;gap:8px!important;font-weight:500!important}',
    '.rw-check input{width:auto}',
    '.rw-err{color:#dc2626;font-size:13px;min-height:16px}',
    '.rw-modal{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px}',
    '.rw-dlg{background:var(--bg-card);color:var(--ink);border-radius:18px;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:22px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6)}',
    '.rw-dlg h3{margin:0 0 4px;font:800 22px Inter,system-ui,sans-serif}',
    '.rw-dlg .x{float:right;border:0;background:none;font-size:24px;cursor:pointer;color:var(--ink-soft)}',
    '.rw-prize{display:grid;grid-template-columns:150px 1fr;gap:16px;align-items:start;margin-top:14px}',
    '.rw-prize img{width:150px;border-radius:12px;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)}',
    '.rw-got{list-style:none;margin:0;padding:0;display:grid;gap:8px;font-size:14.5px}',
    '.rw-got b{color:#16a34a}',
    '.rw-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}',
    '.rw-wall{columns:3 260px;column-gap:14px}',
    '.rw-quote{break-inside:avoid;margin:0 0 14px;background:var(--bg-card);border:1px solid var(--rule);border-radius:14px;padding:14px 16px}',
    '.rw-quote .st{color:#f5b50a;letter-spacing:2px;font-size:15px}',
    '.rw-quote p{margin:6px 0 8px;font-size:14.5px;color:var(--ink);line-height:1.5}',
    '.rw-quote .by{font-size:12.5px;color:var(--ink-soft)}',
    '.rw-quote.win{border-color:rgba(245,197,66,.55);background:linear-gradient(135deg,rgba(245,197,66,.12),var(--bg-card))}',
    '.rw-quote.ch{border-color:rgba(239,68,68,.35)}',
    '.rw-numbers{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px}',
    '.rw-numbers div{flex:1 1 150px;border-radius:12px;padding:12px 14px;background:var(--highlight,rgba(127,127,127,.08))}',
    '.rw-numbers b{display:block;font:800 24px Inter,system-ui,sans-serif;color:var(--ink)}',
    '.rw-numbers span{font-size:12px;color:var(--ink-soft)}',
    '.rw-badge{display:inline-flex;align-items:center;gap:3px;margin-left:6px;padding:1px 7px;border-radius:999px;font:700 10px Inter,system-ui,sans-serif;vertical-align:middle;white-space:nowrap}',
    '.rw-badge.supporter{background:rgba(245,181,10,.18);color:#a16207}',
    '.rw-badge.medalist{background:linear-gradient(90deg,#f5c542,#e0995e);color:#3b2400}',
    '.rw-badge.competitor{background:rgba(239,68,68,.14);color:#b91c1c}',
    '@media (max-width:820px){.rw-earn{grid-template-columns:1fr}.rw-proof{grid-template-columns:1fr}}',
    '@media (max-width:560px){.rw-q{display:none}.rw-table{font-size:13px}.rw-table td,.rw-table th{padding:8px 4px}}',
    '@media (max-width:480px){.rw-prize{grid-template-columns:1fr}.rw-prize img{width:60%;margin:0 auto;display:block}.rw-row{grid-template-columns:1fr}.rw-big{font-size:46px}}'
  ].join('\n');
  function injectCss() {
    if (document.getElementById('rw-css')) return;
    var s = document.createElement('style'); s.id = 'rw-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  /** The little pill used on the leaderboard and the Wall. */
  function badgeHtml(badges) {
    badges = badges || {};
    var h = '';
    if (badges.medalist) h += '<span class="rw-badge medalist" title="Placed top 3 at a HOSA competition">🏅 Medalist</span>';
    else if (badges.competitor) h += '<span class="rw-badge competitor" title="Competed at a HOSA competition">🎖 Competitor</span>';
    if (badges.supporter) h += '<span class="rw-badge supporter" title="Rated HOSA Prep Hub">✦ Supporter</span>';
    return h;
  }
  function myBadges() { try { return JSON.parse(ls('hosa::badges') || '{}') || {}; } catch (e) { return {}; } }

  /* ── The tab ────────────────────────────────────────────────────── */

  function mount(root) {
    if (!root) return;
    injectCss();
    var state = { user: null, review: null, results: {}, founder: false, shout: null, live: null, wall: null };

    function signIn() {
      var g = document.getElementById('auth-gate'); if (g) g.style.display = 'flex';
      var t = document.getElementById('tab-signin'); if (t) t.click();
    }

    /* The improvement checker */
    function proofHtml(s) {
      var h = '<h2 class="rw-h">Your progress, proven</h2>'
        + '<p class="rw-sub">Worked out from every quiz you have taken here — your first try in each event against your recent average.</p>';
      if (!s.overall) {
        h += '<div class="rw-card rw-empty">'
          + (s.quizzes ? 'Take one more quiz in an event you have already quizzed on and your improvement shows up here.'
                       : 'Take two quizzes in the same event and your improvement shows up here — first try versus now.')
          + (s.questions ? '<div style="margin-top:10px"><b>' + num(s.questions) + '</b> practice questions answered so far across <b>' + num(s.days) + '</b> day' + (s.days === 1 ? '' : 's') + '.</div>' : '')
          + '</div>';
        return h;
      }
      var d = pct(s.overall.delta);
      h += '<div class="rw-proof"><div class="rw-card">'
        + '<div class="rw-kick" style="color:var(--accent)">Quiz accuracy</div>'
        + '<div class="rw-big ' + (d >= 0 ? 'rw-up' : 'rw-down') + '">' + (d >= 0 ? '+' : '') + d + '<small>pts</small></div>'
        + '<div style="color:var(--ink-soft);font-size:14px;margin-top:4px">' + pct(s.overall.first) + '% on your first quizzes → ' + pct(s.overall.recent) + '% now</div>'
        + '<div class="rw-bars"><div class="rw-bar"><i style="width:' + Math.max(8, pct(s.overall.first)) + '%"></i><span>First try · ' + pct(s.overall.first) + '%</span></div>'
        + '<div class="rw-bar now"><i style="width:' + Math.max(8, pct(s.overall.recent)) + '%"></i><span>Now · ' + pct(s.overall.recent) + '%</span></div></div>'
        + '</div><div class="rw-stats">'
        + '<div class="rw-stat"><b>' + num(s.questions) + '</b><span>questions answered</span></div>'
        + '<div class="rw-stat"><b>' + num(s.quizzes) + '</b><span>quizzes taken</span></div>'
        + '<div class="rw-stat"><b>' + num(s.days) + '</b><span>days studied</span></div>'
        + '<div class="rw-stat"><b>' + num(s.events.length) + '</b><span>events quizzed</span></div>'
        + '</div></div>';
      h += '<div class="rw-card" style="margin-top:14px;overflow-x:auto"><table class="rw-table"><thead><tr><th>Event</th><th class="n rw-q">Quizzes</th><th class="n">First try</th><th class="n">Recent</th><th class="n">Change</th></tr></thead><tbody>';
      s.events.slice(0, 12).forEach(function (e) {
        var dd = e.delta == null ? null : pct(e.delta);
        h += '<tr><td>' + esc(e.name) + '</td><td class="n rw-q">' + e.quizzes + '</td><td class="n">' + pct(e.first) + '%</td>'
          + '<td class="n">' + (e.recent == null ? '—' : pct(e.recent) + '%') + '</td>'
          + '<td class="n ' + (dd == null ? '' : dd >= 0 ? 'rw-up' : 'rw-down') + '">' + (dd == null ? 'quiz again' : (dd >= 0 ? '↑ +' : '↓ ') + dd) + '</td></tr>';
      });
      h += '</tbody></table></div>';
      return h;
    }

    /* The three offers */
    function offer(o) {
      return '<div class="rw-card rw-offer" data-offer="' + o.id + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3>' + o.title + '</h3><span class="rw-time">⏱ ' + o.time + '</span></div>'
        + (o.done ? '<span class="rw-done">✓ ' + o.done + '</span>' : '')
        + '<div style="font-size:13.5px;color:var(--ink-soft)">' + o.ask + '</div>'
        + '<ul class="rw-get"><li class="lbl">You get</li>' + o.get.map(function (g) { return '<li>' + g + '</li>'; }).join('') + '</ul>'
        + o.buttons + '</div>';
    }
    function offersHtml() {
      var u = state.user;
      var gate = !u ? '<button class="rw-btn" data-act="signin">Sign in to claim →</button>' : '';
      var rv = state.review, nRes = Object.keys(state.results).length;
      var h = '<h2 class="rw-h">Earn something good</h2>'
        + '<p class="rw-sub">Each takes about ten seconds and pays out the moment you finish. ' + (u ? '' : 'Rewards are saved to your account, so sign in first.') + '</p>'
        + '<div class="rw-earn">';
      h += offer({
        id: 'review', title: '⭐ Rate HOSA Prep Hub', time: '10 sec',
        ask: 'Stars and one sentence on how it has helped you.',
        done: rv ? 'Claimed' : '',
        get: ['<b>Your Study Wrapped</b> — a story-sized card of your stats and glow-up, ready for Instagram',
              '<b>+' + XP_REVIEW + ' XP</b> added to your level instantly',
              '<b>✦ Supporter badge</b> next to your name on the leaderboard'],
        buttons: gate || (rv ? '<button class="rw-btn" data-act="wrapped">Get my Study Wrapped</button><button class="rw-btn ghost" data-act="review">Edit my review</button>'
                             : '<button class="rw-btn" data-act="review">Rate it &amp; unlock →</button>')
      });
      h += offer({
        id: 'result', title: '🏅 Report a competition result', time: '15 sec',
        ask: 'Competed at regionals, state or ILC? Tell us how it went — placing or not.',
        done: nRes ? nRes + ' reported' : '',
        get: ['<b>+' + XP_RESULT + ' XP</b> on your first result',
              '<b>🏅 Medalist</b> badge for a top-3 finish (🎖 Competitor otherwise) on the leaderboard',
              '<b>Your result card</b> to post, and a spot on the <b>Wall of Wins</b>'],
        buttons: gate || '<button class="rw-btn" data-act="result">' + (nRes ? 'Add another result' : 'Report &amp; unlock →') + '</button>'
          + (nRes ? '<button class="rw-btn ghost" data-act="resultcard">Get my result card</button>' : '')
      });
      var ch = chapter();
      if (state.founder) {
        h += offer({
          id: 'chapter', title: '📣 Chapter shout-out', time: '20 sec',
          ask: 'For founders: one or two sentences on how ' + esc(ch.name || 'your chapter') + ' uses the site.',
          done: state.shout ? 'Unlocked' : '',
          get: ['<b>Chapter Impact Report</b> — a printable one-pager for your advisor: members, who is active, chapter XP, national rank, top studiers',
                'Your chapter <b>featured on the Wall of Wins</b>'],
          buttons: state.shout ? '<a class="rw-btn" style="text-align:center;text-decoration:none" href="chapter-report.html?c=' + encodeURIComponent(ch.slug) + '" target="_blank" rel="noopener">Open the Impact Report</a><button class="rw-btn ghost" data-act="shout">Edit shout-out</button>'
                               : '<button class="rw-btn" data-act="shout">Write it &amp; unlock →</button>'
        });
      } else {
        h += offer({
          id: 'chapter', title: '📣 Chapter shout-out', time: '20 sec',
          ask: 'For chapter founders. ' + (ch.slug ? 'Your founder can unlock this for ' + esc(ch.name || 'your chapter') + '.' : 'Start a chapter for your school to unlock it.'),
          get: ['<b>Chapter Impact Report</b> — a printable one-pager for your advisor',
                'Your chapter <b>featured on the Wall of Wins</b>'],
          buttons: ch.slug ? '' : '<a class="rw-btn ghost" style="text-align:center;text-decoration:none" href="chapters.html">Start a chapter</a>'
        });
      }
      return h + '</div>';
    }

    /* The Wall of Wins */
    function wallHtml() {
      var w = state.wall;
      var h = '<h2 class="rw-h">Wall of Wins</h2><p class="rw-sub">Real students, real results — every one tied to an account and checked before it shows here.</p>';
      if (!w) return h + '<div class="rw-empty">Loading…</div>';
      var st = w.stats;
      if (st && st.accounts) {
        h += '<div class="rw-numbers">'
          + '<div><b>' + num(st.accounts) + '</b><span>students with an account</span></div>'
          + (st.questions ? '<div><b>' + num(st.questions) + '</b><span>practice questions answered</span></div>' : '')
          + (st.gainPts ? '<div><b>+' + st.gainPts + ' pts</b><span>average quiz improvement</span></div>' : '')
          + (st.chapters ? '<div><b>' + num(st.chapters) + '</b><span>chapters</span></div>' : '')
          + '</div>';
      }
      var items = [];
      Object.keys(w.results || {}).forEach(function (uid) {
        Object.keys(w.results[uid] || {}).forEach(function (rid) {
          var r = w.results[uid][rid];
          if (r && r.approved && r.public !== false) items.push({ ts: r.ts, html: '<div class="rw-quote win"><div class="st">' + (r.place && r.place <= 3 ? ['', '🥇', '🥈', '🥉'][r.place] : '🎖') + ' ' + esc(r.place ? ordinal(r.place) + ' place' : 'Competed') + '</div>'
            + '<p><b>' + esc(r.event) + '</b> · ' + esc(LEVEL_SHORT[r.level] || '') + ' ' + esc(r.year) + '</p><div class="by">' + esc(r.name) + (r.chapter ? ' · ' + esc(r.chapter) : '') + '</div></div>' });
        });
      });
      Object.keys(w.chapters || {}).forEach(function (slug) {
        var c = w.chapters[slug];
        if (c && c.approved) items.push({ ts: c.ts, html: '<div class="rw-quote ch"><div class="st" style="color:var(--accent)">📣 Chapter</div><p>“' + esc(c.text) + '”</p><div class="by">' + esc(c.name) + ', founder · ' + esc(c.chapter || slug.replace(/-/g, ' ')) + '</div></div>' });
      });
      Object.keys(w.reviews || {}).forEach(function (uid) {
        var r = w.reviews[uid];
        if (r && r.approved && r.public !== false) items.push({ ts: r.ts, html: '<div class="rw-quote"><div class="st">' + '★★★★★'.slice(0, r.stars) + '<span style="color:#d1d5db">' + '★★★★★'.slice(r.stars) + '</span></div><p>“' + esc(r.text) + '”</p><div class="by">' + esc(r.name) + (r.chapter ? ' · ' + esc(r.chapter) : '') + '</div></div>' });
      });
      items.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
      if (!items.length) return h + '<div class="rw-card rw-empty">The first wins go up here soon. Yours could be one of them.</div>';
      return h + '<div class="rw-wall">' + items.slice(0, 30).map(function (i) { return i.html; }).join('') + '</div>';
    }

    function render() {
      var s = myStats();
      var h = '<div class="rw">'
        + '<div class="rw-hero"><div class="rw-kick">Rewards</div>'
        + '<h2>Ten seconds from you. Something good back.</h2>'
        + '<p>See how much you have actually improved, then trade a quick review or your competition result for your own <b>Study Wrapped</b> card, bonus XP and a badge on the leaderboard.</p></div>'
        + proofHtml(s);
      if (state.live === false) {
        h += '<div class="rw-card rw-empty" style="margin-top:24px">Rewards are switching on shortly — check back soon.</div>';
      } else {
        h += offersHtml() + wallHtml();
      }
      root.innerHTML = h + '</div>';
    }

    /* ── Forms ── */
    function modal(title, sub, bodyEl, onClose) {
      var m = document.createElement('div'); m.className = 'rw-modal';
      var d = document.createElement('div'); d.className = 'rw-dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      d.innerHTML = '<button class="x" type="button" aria-label="Close">×</button><h3></h3><div class="rw-sub"></div>';
      d.querySelector('h3').textContent = title;
      d.querySelector('.rw-sub').textContent = sub || '';
      d.appendChild(bodyEl);
      m.appendChild(d);
      function close() { m.remove(); document.removeEventListener('keydown', key); if (onClose) onClose(); }
      function key(e) { if (e.key === 'Escape') close(); }
      d.querySelector('.x').addEventListener('click', close);
      m.addEventListener('click', function (e) { if (e.target === m) close(); });
      document.addEventListener('keydown', key);
      document.body.appendChild(m);
      return { close: close, el: d };
    }
    function field(label, html) { return '<label>' + label + html + '</label>'; }
    function commonFields(nameVal, publicVal) {
      var ch = chapter();
      return '<div class="rw-row">' + field('Name to show', '<input name="name" maxlength="40" required value="' + esc(nameVal) + '">')
        + field('Chapter', '<input name="chapter" maxlength="80" value="' + esc(ch.name) + '" placeholder="Optional">') + '</div>'
        + (publicVal === null ? '' : '<label class="rw-check"><input type="checkbox" name="public"' + (publicVal !== false ? ' checked' : '') + '> Show it on the Wall of Wins</label>');
    }

    function reviewForm() {
      var r = state.review || {};
      var f = document.createElement('form'); f.className = 'rw-form';
      var stars = r.stars || 0;
      f.innerHTML = '<div class="rw-stars" role="radiogroup" aria-label="Stars">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-s="' + n + '" aria-label="' + n + ' star' + (n > 1 ? 's' : '') + '">★</button>'; }).join('') + '</div>'
        + field('One sentence — how has it helped?', '<textarea name="text" maxlength="280" required placeholder="e.g. Went from guessing to 90% on pathophysiology quizzes in two weeks.">' + esc(r.text || '') + '</textarea>')
        + commonFields(r.name || displayName(), r.public)
        + '<div class="rw-err"></div><button class="rw-btn" type="submit">' + (state.review ? 'Save' : 'Submit &amp; unlock my rewards') + '</button>';
      function paint() { f.querySelectorAll('.rw-stars button').forEach(function (b) { b.classList.toggle('on', +b.dataset.s <= stars); b.setAttribute('aria-checked', String(+b.dataset.s === stars)); }); }
      f.querySelectorAll('.rw-stars button').forEach(function (b) { b.addEventListener('click', function () { stars = +b.dataset.s; paint(); }); });
      paint();
      var m = modal(state.review ? 'Edit your review' : 'Rate HOSA Prep Hub', 'Unlocks your Study Wrapped card, +' + XP_REVIEW + ' XP and the Supporter badge.', f);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = f.querySelector('.rw-err'), text = clip(f.text.value, 280), name = clip(f.name.value, 40);
        if (!stars) { err.textContent = 'Pick how many stars.'; return; }
        if (text.length < 3) { err.textContent = 'Write a few words.'; return; }
        if (!name) { err.textContent = 'Add a name to show.'; return; }
        var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Saving…';
        var ch = chapter();
        var rec = { stars: stars, text: text, name: name, chapter: clip(f.chapter.value, 80), chapterSlug: ch.slug.replace(/[^a-z0-9-]/g, '').slice(0, 44),
                    public: !!f.public.checked, ts: global.firebase.database.ServerValue.TIMESTAMP };
        var first = !state.review;
        db().ref('proof/reviews/' + state.user.uid).set(rec).then(function () {
          state.review = rec;
          giveBadge('supporter');
          return grantXP('review', XP_REVIEW);
        }).then(function (gotXP) {
          m.close(); render();
          if (first || gotXP) prize('review', gotXP);
        }, function () {
          btn.disabled = false; btn.textContent = 'Try again';
          err.textContent = 'Could not save — check your connection and try again.';
        });
      });
    }

    function resultForm() {
      var f = document.createElement('form'); f.className = 'rw-form';
      var y = new Date().getFullYear();
      var evs = Object.keys(global.__hosaEventNames || {}).map(function (k) { return global.__hosaEventNames[k]; }).sort();
      f.innerHTML = '<div class="rw-row">' + field('Competition', '<select name="level"><option value="regional">Regional</option><option value="area">Area</option><option value="state" selected>State (SLC)</option><option value="ilc">International (ILC)</option><option value="other">Other</option></select>')
        + field('Year', '<select name="year">' + [y, y - 1, y - 2].map(function (v) { return '<option>' + v + '</option>'; }).join('') + '</select>') + '</div>'
        + field('Event', '<input name="event" list="rw-evlist" maxlength="80" required placeholder="e.g. Pathophysiology"><datalist id="rw-evlist">' + evs.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist>')
        + field('How did you place?', '<select name="place"><option value="1">1st place</option><option value="2">2nd place</option><option value="3">3rd place</option>'
          + [4, 5, 6, 7, 8, 9, 10].map(function (n) { return '<option value="' + n + '">' + ordinal(n) + ' place</option>'; }).join('') + '<option value="0" selected>Competed — didn’t place</option></select>')
        + commonFields(displayName(), true)
        + '<div class="rw-err"></div><button class="rw-btn" type="submit">Submit &amp; unlock</button>';
      var m = modal('Report a competition result', 'Placing or not — every result counts. First one earns +' + XP_RESULT + ' XP.', f);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = f.querySelector('.rw-err'), ev = clip(f.event.value, 80), name = clip(f.name.value, 40);
        if (ev.length < 2) { err.textContent = 'Which event?'; return; }
        if (!name) { err.textContent = 'Add a name to show.'; return; }
        var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Saving…';
        var ch = chapter();
        var rec = { level: f.level.value, event: ev, place: +f.place.value, year: +f.year.value, name: name,
                    chapter: clip(f.chapter.value, 80), chapterSlug: ch.slug.replace(/[^a-z0-9-]/g, '').slice(0, 44),
                    public: !!f.public.checked, ts: global.firebase.database.ServerValue.TIMESTAMP };
        var ref = db().ref('proof/results/' + state.user.uid).push();
        ref.set(rec).then(function () {
          state.results[ref.key] = rec;
          giveBadge(rec.place >= 1 && rec.place <= 3 ? 'medalist' : 'competitor');
          return grantXP('result', XP_RESULT);
        }).then(function (gotXP) {
          m.close(); render(); prize('result', gotXP, rec);
        }, function () {
          btn.disabled = false; btn.textContent = 'Try again';
          err.textContent = 'Could not save — check your connection and try again.';
        });
      });
    }

    function shoutForm() {
      var s0 = state.shout || {}, ch = chapter();
      var f = document.createElement('form'); f.className = 'rw-form';
      f.innerHTML = field('How does ' + esc(ch.name || 'your chapter') + ' use HOSA Prep Hub?', '<textarea name="text" maxlength="400" required placeholder="e.g. We run a 10-minute quiz race at every meeting and our members study the events they signed up for.">' + esc(s0.text || '') + '</textarea>')
        + commonFields(s0.name || displayName(), null)
        + '<div class="rw-err"></div><button class="rw-btn" type="submit">' + (state.shout ? 'Save' : 'Submit &amp; unlock the report') + '</button>';
      var m = modal('Chapter shout-out', 'Unlocks your Chapter Impact Report and features your chapter on the Wall of Wins.', f);
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = f.querySelector('.rw-err'), text = clip(f.text.value, 400), name = clip(f.name.value, 40);
        if (text.length < 3) { err.textContent = 'Write a sentence or two.'; return; }
        if (!name) { err.textContent = 'Add your name.'; return; }
        var btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Saving…';
        var rec = { text: text, name: name, uid: state.user.uid, chapter: clip(f.chapter.value, 80),
                    chapterSlug: ch.slug, ts: global.firebase.database.ServerValue.TIMESTAMP };
        var first = !state.shout;
        db().ref('proof/chapters/' + ch.slug).set(rec).then(function () {
          state.shout = rec; m.close(); render();
          if (first) prize('chapter');
        }, function () {
          btn.disabled = false; btn.textContent = 'Try again';
          err.textContent = 'Could not save — only the chapter’s founder can post this.';
        });
      });
    }

    /* ── The payout ── */
    function prize(kind, gotXP, result) {
      var s = myStats();
      var body = document.createElement('div');
      var cv = null, file = 'hosa-prep-hub.png', items = [];
      if (kind === 'review') {
        cv = drawWrapped(s); file = 'my-hosa-study-wrapped.png';
        items = ['Your <b>Study Wrapped</b> card — below, ready to post',
                 gotXP ? '<b>+' + XP_REVIEW + ' XP</b> — you are now Level ' + xpLevel(parseInt(ls('hosa::xp') || '0', 10)) : 'Your XP bonus was already claimed',
                 '<b>✦ Supporter</b> badge on the leaderboard'];
      } else if (kind === 'result') {
        cv = drawResult(result, s); file = 'my-hosa-result.png';
        items = ['Your <b>result card</b> — below, ready to post',
                 gotXP ? '<b>+' + XP_RESULT + ' XP</b> — you are now Level ' + xpLevel(parseInt(ls('hosa::xp') || '0', 10)) : 'XP was paid on your first result',
                 '<b>' + (result.place >= 1 && result.place <= 3 ? '🏅 Medalist' : '🎖 Competitor') + '</b> badge on the leaderboard',
                 'A spot on the <b>Wall of Wins</b> once it is checked'];
      } else {
        var ch = chapter();
        items = ['Your <b>Chapter Impact Report</b> is ready', 'Your chapter joins the <b>Wall of Wins</b> once it is checked'];
        body.innerHTML = '<ul class="rw-got">' + items.map(function (i) { return '<li>✔ ' + i + '</li>'; }).join('') + '</ul>'
          + '<div class="rw-actions"><a class="rw-btn" style="text-decoration:none" href="chapter-report.html?c=' + encodeURIComponent(ch.slug) + '" target="_blank" rel="noopener">Open the Impact Report</a></div>';
        modal('Unlocked 🎉', 'Thanks for vouching for HOSA Prep Hub.', body);
        return;
      }
      var url = cv.toDataURL('image/png');
      body.innerHTML = '<div class="rw-prize"><img alt="Your card"><ul class="rw-got">' + items.map(function (i) { return '<li>✔ ' + i + '</li>'; }).join('') + '</ul></div>'
        + '<div class="rw-actions"><button class="rw-btn" type="button" data-save>Save image</button>'
        + (navigator.canShare ? '<button class="rw-btn ghost" type="button" data-share>Share…</button>' : '') + '</div>';
      body.querySelector('img').src = url;
      body.querySelector('[data-save]').addEventListener('click', function () { deliver(cv, file, false); });
      var sh = body.querySelector('[data-share]');
      if (sh) sh.addEventListener('click', function () { deliver(cv, file, true); });
      modal('Unlocked 🎉', kind === 'review' ? 'Thank you — here is everything you just earned.' : 'Congrats on competing — here is what you earned.', body);
    }

    /* ── Wiring ── */
    root.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-act]');
      if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'signin') return signIn();
      if (!state.user) return signIn();
      if (a === 'review') reviewForm();
      if (a === 'result') resultForm();
      if (a === 'shout') shoutForm();
      if (a === 'wrapped') prize('review', false);
      if (a === 'resultcard') {
        var list = Object.keys(state.results).map(function (k) { return state.results[k]; })
          .sort(function (x, y) { return (x.place || 99) - (y.place || 99); });
        if (list[0]) prize('result', false, list[0]);
      }
    });

    function loadWall() {
      function val(p) { return db().ref(p).get().then(function (s) { return s.val(); }); }
      return Promise.all([val('proof/reviews'), val('proof/results'), val('proof/chapters'), val('proof/stats').catch(function () { return null; })])
        .then(function (r) { state.live = true; state.wall = { reviews: r[0] || {}, results: r[1] || {}, chapters: r[2] || {}, stats: r[3] }; },
              function () { state.live = false; });
    }
    function loadMine(u) {
      state.review = null; state.results = {}; state.founder = false; state.shout = null;
      if (!u) return Promise.resolve();
      var ch = chapter();
      return Promise.all([
        db().ref('proof/reviews/' + u.uid).get().then(function (s) { state.review = s.val(); }, function () {}),
        db().ref('proof/results/' + u.uid).get().then(function (s) { state.results = s.val() || {}; }, function () {}),
        ch.slug ? db().ref('chat/' + ch.slug + '/owners/' + u.uid).get().then(function (s) { state.founder = s.val() === true; }, function () {}) : null,
        ch.slug ? db().ref('proof/chapters/' + ch.slug).get().then(function (s) { state.shout = s.val(); }, function () {}) : null
      ]);
    }

    var loadedFor = undefined;
    function refresh() {
      var u = me();
      state.user = u;
      render();
      if (!global.firebase || !global.firebase.database) return;
      var key = u ? u.uid : '';
      Promise.all([loadWall(), loadedFor === key ? null : loadMine(u)]).then(function () { loadedFor = key; render(); });
    }
    global.firebase.auth().onAuthStateChanged(function () { loadedFor = undefined; refresh(); });
    // Numbers move as they study; redraw whenever the tab is opened.
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-tab="rewards"]');
      if (t) setTimeout(refresh, 30);
    });
  }

  global.HosaProof = { mount: mount, myStats: myStats, badgeHtml: badgeHtml, myBadges: myBadges,
                       drawWrapped: drawWrapped, drawResult: drawResult };
})(window);
