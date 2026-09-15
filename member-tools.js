/* ═════════════════════════════════════════════════════════════════
   Chapter member tools — benefits for the competitor, not the chapter.

   The chapter perks that already existed (leaderboard, badge, dashboard)
   are all chapter-scoped pride. None of them make one person better at
   their event, which is the only thing a competitor actually wants. These
   two do:

     1. Exam Readiness Report — a projected score from your own recall
        history, the categories dragging it down, and exactly how many
        terms you'd have to fix to hit your target.
     2. Printable practice exam with an answer key — the real thing on
        paper, which is how the actual HOSA test is taken.

   Both are new. Nothing that used to be free became locked.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;')
      .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Recall model ────────────────────────────────────────────────
  // Spaced-repetition level 0-5 -> probability of getting the term right
  // on a four-option question. Level 0 means we have no evidence at all,
  // so it sits at chance; level 5 tops out below 1 because nobody is
  // perfect under time pressure. Deliberately simple: this is an estimate
  // from the user's own ratings, and it is labelled as one everywhere.
  var P_FLOOR = 0.25, P_CEIL = 0.97;
  function pFor(level) {
    var l = Math.max(0, Math.min(5, level | 0));
    return P_FLOOR + l * (P_CEIL - P_FLOOR) / 5;
  }

  function terms() {
    try { return (typeof TERMS !== 'undefined' && TERMS.length) ? TERMS : []; } catch (e) { return []; }
  }
  function levels() {
    try { return (state && state.progress && state.progress.srLevels) || {}; } catch (e) { return {}; }
  }
  function eventName() {
    var t = (document.title || '').split('—')[0].trim();
    return t || 'this event';
  }
  function chapterName() {
    try { return (localStorage.getItem('hosa::chapter-name') || '').trim(); } catch (e) { return ''; }
  }
  function inChapter() {
    try { return !!(localStorage.getItem('hosa::chapter') || '').trim(); } catch (e) { return false; }
  }

  function analyse() {
    var T = terms(), L = levels();
    if (!T.length) return null;
    var rows = T.map(function (t) {
      var lv = (L[t.term] || 0) | 0;
      return { term: t.term, meaning: t.meaning, cat: t.category || t.type || 'General', level: lv, p: pFor(lv) };
    });
    var total = rows.length;
    var sum = rows.reduce(function (a, r) { return a + r.p; }, 0);
    var score = sum / total;

    var byCat = {};
    rows.forEach(function (r) {
      var c = byCat[r.cat] || (byCat[r.cat] = { cat: r.cat, n: 0, sum: 0, weak: 0 });
      c.n++; c.sum += r.p;
      if (r.level <= 2) c.weak++;
    });
    var cats = Object.keys(byCat).map(function (k) {
      var c = byCat[k]; c.score = c.sum / c.n; return c;
    }).sort(function (a, b) { return a.score - b.score; });

    var dist = [0, 0, 0, 0, 0, 0];
    rows.forEach(function (r) { dist[r.level]++; });

    // How many of the weakest terms would have to reach full mastery for
    // the projected score to clear the target.
    function termsToReach(target) {
      var need = target * total - sum;
      if (need <= 0) return 0;
      var sorted = rows.slice().sort(function (a, b) { return a.p - b.p; });
      var gained = 0, n = 0;
      for (var i = 0; i < sorted.length; i++) {
        gained += (P_CEIL - sorted[i].p);
        n++;
        if (gained >= need) return n;
      }
      return -1;              // unreachable even at full mastery
    }

    return {
      total: total, score: score, cats: cats, dist: dist, rows: rows,
      seen: total - dist[0],
      toNinety: termsToReach(0.90),
      weakest: rows.slice().sort(function (a, b) { return a.p - b.p || a.term.localeCompare(b.term); })
    };
  }

  // ── Readiness report ────────────────────────────────────────────
  function openReadiness() {
    var a = analyse();
    if (!a) return;
    var pct = Math.round(a.score * 100);
    var ev = eventName(), ch = chapterName();

    var verdict, tone;
    if (a.seen === 0) {
      verdict = 'No data yet — rate some cards and this fills in.'; tone = 'cold';
    } else if (pct >= 90) { verdict = 'Competition ready.'; tone = 'hot'; }
    else if (pct >= 75) { verdict = 'Close. A focused week gets you there.'; tone = 'warm'; }
    else if (pct >= 55) { verdict = 'Real gaps. Worth a plan, not panic.'; tone = 'mid'; }
    else { verdict = 'Early days — most of this deck is still new to you.'; tone = 'cold'; }

    var plan;
    if (a.toNinety === 0) plan = 'You are already projecting above 90%. Keep the streak alive so it does not decay.';
    else if (a.toNinety < 0) plan = 'Even full mastery of every term leaves you short — that only happens with an empty deck.';
    else plan = 'Take <strong>' + a.toNinety + '</strong> more term'
             + (a.toNinety === 1 ? '' : 's') + ' to full mastery and this projection clears <strong>90%</strong>.';

    var catRows = a.cats.map(function (c) {
      var p = Math.round(c.score * 100);
      return '<tr><td>' + esc(c.cat) + '</td>'
        + '<td class="rr-num">' + c.n + '</td>'
        + '<td class="rr-bar"><span style="width:' + p + '%"></span></td>'
        + '<td class="rr-num rr-pct">' + p + '%</td></tr>';
    }).join('');

    var weakList = a.weakest.filter(function (r) { return r.level <= 2; }).slice(0, 20)
      .map(function (r) {
        return '<li><strong>' + esc(r.term) + '</strong> <span>' + esc(r.meaning || '') + '</span></li>';
      }).join('');

    var w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>' + esc(ev) + ' — Exam Readiness</title>'
      + '<style>'
      + '@page{margin:14mm}'
      + '*{box-sizing:border-box}'
      + 'body{margin:0;padding:34px 30px 60px;font-family:Inter,system-ui,-apple-system,sans-serif;'
      + 'color:#111;background:#fff;max-width:820px;margin:0 auto;line-height:1.55}'
      + '.kick{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#b91c1c;font-weight:700}'
      + 'h1{font-size:33px;letter-spacing:-.03em;margin:6px 0 2px}'
      + '.sub{color:#666;font-size:14px;margin-bottom:26px}'
      + '.hero{display:flex;align-items:center;gap:26px;border:1px solid #e6e6e6;border-radius:16px;'
      + 'padding:24px 26px;margin-bottom:12px;flex-wrap:wrap}'
      + '.big{font-size:70px;font-weight:800;letter-spacing:-.05em;line-height:1;color:#b91c1c}'
      + '.big small{display:block;font-size:11px;letter-spacing:.13em;text-transform:uppercase;'
      + 'color:#888;font-weight:700;margin-top:8px}'
      + '.verdict{flex:1 1 260px;min-width:0}'
      + '.verdict b{font-size:20px;letter-spacing:-.02em;display:block;margin-bottom:6px}'
      + '.verdict p{margin:0;color:#555;font-size:14.5px}'
      + '.note{font-size:12.5px;color:#777;background:#faf7f3;border:1px solid #eee3d6;'
      + 'border-radius:10px;padding:11px 14px;margin-bottom:28px}'
      + 'h2{font-size:17px;letter-spacing:-.02em;margin:30px 0 10px}'
      + 'table{width:100%;border-collapse:collapse;font-size:14px}'
      + 'th{text-align:left;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;'
      + 'color:#888;font-weight:700;padding:0 8px 7px 0;border-bottom:1px solid #eee}'
      + 'td{padding:9px 8px 9px 0;border-bottom:1px solid #f2f2f2;vertical-align:middle}'
      + '.rr-num{text-align:right;width:58px;color:#666}'
      + '.rr-pct{font-weight:700;color:#111}'
      + '.rr-bar{width:44%}'
      + '.rr-bar span{display:block;height:8px;border-radius:99px;background:#b91c1c;min-width:2px}'
      + 'ol.wk{padding-left:20px;font-size:14px;columns:2;column-gap:28px}'
      + 'ol.wk li{margin-bottom:6px;break-inside:avoid}'
      + 'ol.wk span{color:#666}'
      + '.dist{display:flex;gap:6px;margin:10px 0 0}'
      + '.dist div{flex:1;text-align:center;font-size:12px;color:#666}'
      + '.dist b{display:block;font-size:19px;color:#111}'
      + '.foot{margin-top:38px;padding-top:14px;border-top:1px solid #eee;font-size:12px;color:#999}'
      + '@media print{.noprint{display:none}}'
      + '</style>'
      + '<div class="kick">' + (ch ? esc(ch) + ' &middot; ' : '') + 'Exam readiness</div>'
      + '<h1>' + esc(ev) + '</h1>'
      + '<div class="sub">Projected from your own recall history &mdash; ' + a.seen + ' of ' + a.total + ' terms rated.</div>'
      + '<div class="hero"><div class="big">' + pct + '%<small>Projected</small></div>'
      + '<div class="verdict"><b>' + esc(verdict) + '</b><p>' + plan + '</p></div></div>'
      + '<div class="note"><strong>What this is:</strong> an estimate built from how you have rated your own '
      + 'cards, not a prediction of your real score. A term you have never seen counts as a guess; one you '
      + 'have mastered counts as near-certain. Use it to find gaps, not to feel safe.</div>'
      + '<h2>Where you stand by category</h2>'
      + '<table><thead><tr><th>Category</th><th class="rr-num">Terms</th><th></th><th class="rr-num">Est.</th></tr></thead>'
      + '<tbody>' + catRows + '</tbody></table>'
      + '<h2>Your mastery spread</h2>'
      + '<div class="dist">'
      + a.dist.map(function (n, i) { return '<div><b>' + n + '</b>level ' + i + '</div>'; }).join('')
      + '</div>'
      + (weakList
          ? '<h2>Fix these first</h2><ol class="wk">' + weakList + '</ol>'
          : '<h2>Fix these first</h2><p style="color:#666;font-size:14px">Nothing is sitting at level 2 or below. '
            + 'Keep reviewing so it stays that way.</p>')
      + '<div class="foot">HOSA Prep Hub &middot; hosaprephub.vercel.app &middot; '
      + 'generated ' + new Date().toLocaleDateString() + '</div>'
      + '<p class="noprint" style="margin-top:26px"><button onclick="window.print()" '
      + 'style="background:#b91c1c;color:#fff;border:none;border-radius:9px;padding:12px 22px;'
      + 'font-size:15px;font-weight:600;cursor:pointer">Print / Save as PDF</button></p>'
    );
    w.document.close();
    try { gtag('event', 'readiness_report', { event_category: eventName() }); } catch (e) {}
  }

  // ── Printable practice exam ─────────────────────────────────────
  function openPracticeExam() {
    var T = terms();
    if (!T.length) return;
    var n = Math.min(25, T.length);
    var pool = T.slice();
    for (var i = pool.length - 1; i > 0; i--) {         // Fisher-Yates
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var picked = pool.slice(0, n);

    var qs = picked.map(function (q, idx) {
      // Prefer distractors from the same category so the paper is as hard
      // as the real thing rather than obviously wrong.
      var same = T.filter(function (t) {
        return t !== q && (t.category || t.type) === (q.category || q.type) && t.meaning && t.meaning !== q.meaning;
      });
      var others = T.filter(function (t) { return t !== q && t.meaning && t.meaning !== q.meaning; });
      var src = same.length >= 3 ? same : others;
      var picks = [], used = {};
      var guard = 0;
      while (picks.length < 3 && guard++ < 400 && src.length) {
        var c = src[Math.floor(Math.random() * src.length)];
        if (!used[c.meaning]) { used[c.meaning] = 1; picks.push(c.meaning); }
      }
      var opts = picks.concat([q.meaning]);
      for (var k = opts.length - 1; k > 0; k--) {
        var m = Math.floor(Math.random() * (k + 1));
        var t2 = opts[k]; opts[k] = opts[m]; opts[m] = t2;
      }
      return { i: idx + 1, term: q.term, opts: opts, answer: opts.indexOf(q.meaning) };
    });

    var LET = ['A', 'B', 'C', 'D'];
    var body = qs.map(function (q) {
      return '<div class="q"><div class="qt"><span class="qn">' + q.i + '.</span> ' + esc(q.term) + '</div>'
        + '<ol class="opts">' + q.opts.map(function (o, i2) {
            return '<li><span class="let">' + LET[i2] + '</span>' + esc(o) + '</li>';
          }).join('') + '</ol></div>';
    }).join('');

    var key = qs.map(function (q) {
      return '<span><b>' + q.i + '.</b> ' + LET[q.answer] + '</span>';
    }).join('');

    var ev = eventName(), ch = chapterName();
    var w = window.open('', '_blank');
    if (!w) return;
    w.document.write(
      '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>' + esc(ev) + ' — Practice Exam</title>'
      + '<style>'
      + '@page{margin:15mm}'
      + '*{box-sizing:border-box}'
      + 'body{margin:0 auto;padding:30px 26px 60px;max-width:800px;color:#111;background:#fff;'
      + 'font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.5}'
      + '.kick{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#b91c1c;font-weight:700}'
      + 'h1{font-size:30px;letter-spacing:-.03em;margin:6px 0 4px}'
      + '.meta{color:#666;font-size:13.5px;margin-bottom:6px}'
      + '.rule{border:0;border-top:2px solid #111;margin:14px 0 22px}'
      + '.namebar{display:flex;gap:26px;font-size:13px;color:#555;margin-bottom:22px}'
      + '.namebar div{flex:1;border-bottom:1px solid #bbb;padding-bottom:3px}'
      + '.q{margin-bottom:17px;break-inside:avoid}'
      + '.qt{font-size:14.5px;font-weight:600;margin-bottom:5px}'
      + '.qn{color:#b91c1c;margin-right:3px}'
      + 'ol.opts{list-style:none;margin:0;padding:0 0 0 18px;font-size:13.5px;color:#333}'
      + 'ol.opts li{margin-bottom:2px}'
      + '.let{display:inline-block;width:20px;color:#999;font-weight:700}'
      + '.key{page-break-before:always;border-top:2px solid #111;padding-top:16px}'
      + '.keys{display:flex;flex-wrap:wrap;gap:8px 20px;font-size:14px;margin-top:10px}'
      + '.foot{margin-top:34px;padding-top:12px;border-top:1px solid #eee;font-size:12px;color:#999}'
      + '@media print{.noprint{display:none}}'
      + '</style>'
      + '<div class="kick">' + (ch ? esc(ch) + ' &middot; ' : '') + 'Practice exam</div>'
      + '<h1>' + esc(ev) + '</h1>'
      + '<div class="meta">' + n + ' questions &middot; suggested time 20 minutes &middot; no notes</div>'
      + '<hr class="rule">'
      + '<div class="namebar"><div>Name</div><div>Date</div><div>Score</div></div>'
      + body
      + '<div class="key"><h1 style="font-size:22px">Answer key</h1>'
      + '<div class="meta">' + esc(ev) + ' &middot; ' + n + ' questions</div>'
      + '<div class="keys">' + key + '</div></div>'
      + '<div class="foot">HOSA Prep Hub &middot; hosaprephub.vercel.app &middot; '
      + 'questions drawn at random &mdash; reload for a different paper</div>'
      + '<p class="noprint" style="margin-top:26px"><button onclick="window.print()" '
      + 'style="background:#b91c1c;color:#fff;border:none;border-radius:9px;padding:12px 22px;'
      + 'font-size:15px;font-weight:600;cursor:pointer">Print / Save as PDF</button></p>'
    );
    w.document.close();
    try { gtag('event', 'practice_exam', { event_category: eventName() }); } catch (e) {}
  }

  // ── Panel ───────────────────────────────────────────────────────
  function mount(host) {
    if (!host) return;
    var member = inChapter();
    var a = member ? analyse() : null;
    var pct = a ? Math.round(a.score * 100) : null;

    function tool(id, title, desc, cta, extra) {
      return '<div class="mt-tool">'
        + '<div class="mt-tool-main">'
        +   '<div class="mt-tool-h">' + title + '</div>'
        +   '<p class="mt-tool-p">' + desc + '</p>'
        +   (extra || '')
        + '</div>'
        + '<div class="mt-tool-act">' + cta + '</div>'
        + '</div>';
    }

    if (member) {
      var teaser = (a && a.seen > 0)
        ? '<div class="mt-score"><b>' + pct + '%</b> projected right now &middot; '
          + a.seen + ' of ' + a.total + ' terms rated</div>'
        : '<div class="mt-score mt-score-empty">Rate a few cards and your projection appears here.</div>';

      host.innerHTML =
          '<div class="mt-kicker">Chapter member tools</div>'
        + '<div class="mt-title">Two things only chapter members get</div>'
        + '<p class="mt-sub">Not leaderboard points &mdash; actual preparation for the day of the event.</p>'
        + tool('rr', 'Exam Readiness Report',
               'A projected score built from your own recall history, every category ranked weakest first, '
               + 'and the exact number of terms standing between you and 90%.',
               '<button type="button" class="mt-btn" id="mt-readiness">Open my report &rarr;</button>',
               teaser)
        + tool('pe', 'Printable practice exam + answer key',
               '25 randomised multiple-choice questions on paper, with the answer key on its own page. '
               + 'The real exam is on paper &mdash; practise the way you will actually sit it. '
               + 'Reload for a fresh paper every time.',
               '<button type="button" class="mt-btn mt-btn-ghost" id="mt-exam">Generate exam &rarr;</button>');

      var rb = host.querySelector('#mt-readiness');
      if (rb) rb.addEventListener('click', openReadiness);
      var eb = host.querySelector('#mt-exam');
      if (eb) eb.addEventListener('click', openPracticeExam);
    } else {
      host.innerHTML =
          '<div class="mt-kicker">Locked &mdash; chapter members only</div>'
        + '<div class="mt-title">Two tools that tell you if you are actually ready</div>'
        + '<p class="mt-sub">Everything else on this site is free and open. These two are the exception, '
          + 'and any member can unlock them for their whole school in about a minute.</p>'
        + tool('rr', 'Exam Readiness Report',
               'A projected score built from your own recall history, every category ranked weakest first, '
               + 'and the exact number of terms standing between you and 90%. No other free HOSA tool will tell you this.',
               '<a class="mt-btn" href="chapters.html">Unlock it &rarr;</a>')
        + tool('pe', 'Printable practice exam + answer key',
               '25 randomised multiple-choice questions on paper with the answer key, so you can sit a mock '
               + 'the way the real exam is actually written. Fresh paper every time.',
               '<a class="mt-btn mt-btn-ghost" href="chapters.html">Unlock it &rarr;</a>')
        + '<p class="mt-foot">Starting a chapter takes a school name and an email. You do not have to be an '
          + 'officer, and it unlocks these for everyone who uses your link.</p>';
    }
  }

  // Self-mount. The projection moves as you rate cards, so re-render every
  // time the Guide tab is opened rather than only once on load.
  function boot() {
    var host = document.getElementById('member-tools');
    if (!host) return;
    mount(host);
    var tabs = document.getElementById('tabs');
    if (tabs && !tabs.__mtHooked) {
      tabs.__mtHooked = true;
      tabs.addEventListener('click', function (e) {
        var b = e.target && e.target.closest ? e.target.closest('button[data-view]') : null;
        if (b && b.getAttribute('data-view') === 'guide') setTimeout(function () { mount(host); }, 40);
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 350); });
  else setTimeout(boot, 350);

  global.HosaMemberTools = { mount: mount, analyse: analyse, openReadiness: openReadiness, openPracticeExam: openPracticeExam };
})(window);
