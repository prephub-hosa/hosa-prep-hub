/* HOSA Prep Hub — Leaderboard
   Adds a Leaderboard tab to each subject page. Tracks two metrics:
   • Practice/Timed Test best score (%)
   • Flashcard session best accuracy (got / (got+missed), 5+ ratings)
   Reads/writes to Firebase under /leaderboard/{subject}/{userId}.
   Mixes in deterministic dummy players so boards aren't empty.
*/
(function(){
  if (window.__hosaLBLoaded) return;
  window.__hosaLBLoaded = true;

  var subject = (location.pathname.split('/').pop() || '').replace('.html','') || '';
  // Skip homepage, admin
  if (!subject || subject === 'index' || subject === 'home' || subject === 'admin') return;

  // ── Dummy player pool ──────────────────────────────────────
  var NAMES = [
    'Aria K.','Devon M.','Priya S.','Marcus R.','Sofia L.',
    'Aiden T.','Maya P.','Ethan C.','Layla B.','Noah W.',
    'Zara H.','Caleb O.','Mia G.','Jonah D.','Iris V.',
    'Tariq A.','Eliza N.','Owen F.','Anika Y.','Brody U.',
    'Naomi I.','Cole E.','Hana J.','Liam Q.','Riya Z.',
    'Wyatt X.','Saanvi P.','Holden M.','Ava S.','Reed C.',
    'Asha B.','Theo W.','Mila R.','Felix L.','Yara T.',
    'Beck N.','Imani O.','Quinn G.','Sage D.','Roman V.'
  ];

  // Total term count per subject — used to scale dummy mastery and to display "X / total"
  var TOTAL_TERMS = {
    'medical-terminology':216, 'pathophysiology':147, 'nutrition':127, 'biochemistry':112,
    'anatomy-physiology':96, 'pharmacology':72, 'medical-math':75, 'medical-law-ethics':69,
    'human-growth-development':78, 'behavioral-health':77, 'clinical-nursing':87,
    'public-health':80, 'sports-medicine':73, 'biomedical-lab-science':68, 'biotechnology':80,
    'emergency-medical-science':69, 'physical-therapy':72, 'dental-science':67,
    'veterinary-science':68, 'epidemiology':58, 'phlebotomy':60,
    'medical-assisting':51, 'radiologic-science':43,
    'medical-microbiology':56, 'pharmacy-science':47,
    'forensic-science':38, 'occupational-therapy':34
  };
  var TOTAL = TOTAL_TERMS[subject] || 100;

  function hashStr(s){
    var h = 2166136261;
    for (var i=0; i<s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function makeDummies(subj){
    var seed = hashStr(subj || 'x');
    function rand(){ seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
    var used = {};
    var out = [];
    var count = 10;
    for (var i=0; i<count; i++){
      var idx;
      var attempts = 0;
      do { idx = Math.floor(rand() * NAMES.length); attempts++; } while (used[idx] && attempts < 100);
      used[idx] = 1;
      // Test % skewed for challenge but beatable
      var bestTest = Math.round(72 + rand() * 20);   // 72–92
      // Mastered: 38–78% of total deck so the top is reachable
      var frac = 0.38 + rand() * 0.40;
      var mastered = Math.max(1, Math.round(TOTAL * frac));
      out.push({ name: NAMES[idx], bestTest: bestTest, mastered: mastered, seed: true });
    }
    return out;
  }
  var DUMMIES = makeDummies(subject);

  // ── Identity ────────────────────────────────────────────────
  function getGuestId(){
    try {
      var g = localStorage.getItem('hosa-guest-id');
      if (!g) { g = 'g_' + Math.random().toString(36).slice(2,10); localStorage.setItem('hosa-guest-id', g); }
      return g;
    } catch(e) { return 'g_anon'; }
  }
  function getUserId(){
    try {
      var u = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
      if (u && u.uid) return u.uid;
    } catch(e){}
    return getGuestId();
  }
  function getDefaultName(){
    try {
      var u = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
      if (u){
        if (u.displayName) return u.displayName;
        if (u.email){
          var p = u.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim();
          if (p) return p.charAt(0).toUpperCase() + p.slice(1, 14);
        }
      }
    } catch(e){}
    return null;
  }
  function getDisplayName(){
    try {
      var n = localStorage.getItem('hosa-lb-name');
      if (n) return n;
    } catch(e){}
    return getDefaultName() || '';
  }
  function setDisplayName(n){
    try { localStorage.setItem('hosa-lb-name', n); } catch(e){}
  }

  // ── Firebase R/W ───────────────────────────────────────────
  function userRef(){
    return firebase.database().ref('leaderboard/' + subject + '/' + getUserId());
  }
  function submit(field, value){
    if (typeof firebase === 'undefined' || !firebase.database) return;
    value = Math.max(0, Math.round(value));
    if (field === 'bestTest') value = Math.min(100, value);
    if (field === 'mastered') value = Math.min(TOTAL, value);
    if (value < 1) return;
    var name = getDisplayName() || 'Student';
    var ref = userRef();
    ref.once('value').then(function(snap){
      var cur = snap.val() || {};
      var update = {
        name: name,
        bestTest: cur.bestTest || 0,
        mastered: cur.mastered || 0,
        updatedAt: new Date().toISOString()
      };
      if (field === 'bestTest') update.bestTest = Math.max(update.bestTest, value);
      if (field === 'mastered') update.mastered = Math.max(update.mastered, value);
      ref.set(update);
    }).catch(function(){});
  }

  // ── gtag interception ──────────────────────────────────────
  var _origGtag = window.gtag;
  window.gtag = function(type, name, params){
    try { if (typeof _origGtag === 'function') _origGtag.apply(this, arguments); } catch(e){}
    if (type === 'event' && params && typeof params === 'object'){
      try {
        if (name === 'test_completed' && typeof params.value === 'number'){
          submit('bestTest', params.value);
          // Re-render if leaderboard tab is open
          if (document.getElementById('view-leaderboard') && document.getElementById('view-leaderboard').classList.contains('active')) {
            setTimeout(render, 400);
          }
        } else if (name === 'session_complete'){
          // Read live mastered count from the page (window.__hosaMastered is exposed per page)
          try {
            if (typeof window.__hosaMastered === 'function') {
              var m = window.__hosaMastered();
              if (typeof m === 'number' && m > 0) submit('mastered', m);
            }
          } catch(e){}
          if (document.getElementById('view-leaderboard') && document.getElementById('view-leaderboard').classList.contains('active')) {
            setTimeout(render, 400);
          }
        }
      } catch(e){}
    }
  };

  // ── UI injection ───────────────────────────────────────────
  function activateLeaderboard(){
    var btns = document.querySelectorAll('#tabs button');
    btns.forEach(function(b){ b.classList.remove('active'); });
    document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
    var myBtn = document.querySelector('#tabs button[data-view="leaderboard"]');
    if (myBtn) myBtn.classList.add('active');
    var myView = document.getElementById('view-leaderboard');
    if (myView) myView.classList.add('active');
    render();
  }

  function buildUI(){
    var tabs = document.getElementById('tabs');
    if (!tabs || tabs.querySelector('[data-view="leaderboard"]')) return;

    // Inject button before the Progress button (or append)
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.view = 'leaderboard';
    btn.textContent = 'Leaderboard';
    btn.addEventListener('click', activateLeaderboard);
    var progBtn = tabs.querySelector('[data-view="progress"]');
    if (progBtn) tabs.insertBefore(btn, progBtn); else tabs.appendChild(btn);

    // Inject view section before view-progress
    var section = document.createElement('section');
    section.className = 'view';
    section.id = 'view-leaderboard';
    section.innerHTML =
      '<div class="section-head" style="margin-bottom:18px;">' +
        '<h2 style="font-family:\'Fraunces\',serif;font-weight:500;">Leader<em>board</em></h2>' +
        '<div class="section-label" style="color:var(--ink-soft);font-size:13px;">Top scores — beat the field</div>' +
      '</div>' +
      '<div id="lb-namebar" style="margin-bottom:24px;padding:14px 18px;background:var(--bg-card);border:1px solid var(--rule);border-radius:4px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-family:\'Source Serif 4\',Georgia,serif;font-size:14px;">' +
        '<span style="color:var(--ink-soft);">Display name:</span>' +
        '<input id="lb-name-input" placeholder="(set a name to appear)" style="flex:1;min-width:160px;padding:7px 10px;background:var(--bg);color:var(--ink);border:1px solid var(--rule);border-radius:3px;font-family:inherit;font-size:14px;">' +
        '<button type="button" id="lb-name-save" style="padding:7px 16px;background:var(--accent);color:#fff;border:none;border-radius:3px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;">Save</button>' +
        '<span id="lb-name-status" style="color:var(--ink-soft);font-size:12px;"></span>' +
      '</div>' +
      '<div id="lb-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;">' +
        '<div>' +
          '<h3 style="font-family:\'Fraunces\',serif;font-size:18px;font-weight:500;margin-bottom:12px;">Timed Test — Top 10</h3>' +
          '<div id="lb-test-table" class="lb-table"></div>' +
        '</div>' +
        '<div>' +
          '<h3 style="font-family:\'Fraunces\',serif;font-size:18px;font-weight:500;margin-bottom:12px;">Cards Mastered — Top 10 <span style="color:var(--ink-faint);font-size:12px;font-weight:400;">(out of ' + TOTAL + ')</span></h3>' +
          '<div id="lb-flash-table" class="lb-table"></div>' +
        '</div>' +
      '</div>' +
      '<p style="margin-top:28px;font-size:12px;color:var(--ink-faint);font-style:italic;line-height:1.6;">Marked entries (★) are simulated students so the board has competition while the site grows. Real users always show first when tied.</p>';
    var progView = document.getElementById('view-progress');
    if (progView) progView.parentNode.insertBefore(section, progView);
    else document.querySelector('main, body').appendChild(section);

    // Inject styles
    var style = document.createElement('style');
    style.textContent = ''
      + '.lb-table table { width:100%; border-collapse:collapse; font-size:14px; font-family:\'Source Serif 4\',Georgia,serif; }'
      + '.lb-table th { text-align:left; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--ink-soft); padding:8px 10px; border-bottom:1px solid var(--rule); }'
      + '.lb-table td { padding:9px 10px; border-bottom:1px solid var(--rule); }'
      + '.lb-table tr.me { background:rgba(201,55,45,0.08); }'
      + '.lb-table tr.me td:first-child { color:var(--accent); font-weight:700; }'
      + '.lb-table .rank { width:38px; color:var(--ink-soft); font-family:monospace; font-size:13px; }'
      + '.lb-table .pct { width:64px; text-align:right; font-variant-numeric:tabular-nums; font-weight:600; }'
      + '.lb-table .seed-tag { color:var(--ink-faint); font-size:11px; margin-left:6px; }';
    document.head.appendChild(style);

    // Wire name save
    var input = document.getElementById('lb-name-input');
    var saveBtn = document.getElementById('lb-name-save');
    var status = document.getElementById('lb-name-status');
    input.value = getDisplayName();
    saveBtn.addEventListener('click', function(){
      var v = input.value.trim().slice(0, 24);
      if (!v) { status.textContent = 'Please enter a name.'; return; }
      setDisplayName(v);
      status.textContent = 'Saved!';
      setTimeout(function(){ status.textContent = ''; }, 1800);
      // Update existing entry name if user already has scores
      try {
        userRef().once('value').then(function(snap){
          if (snap.exists()) userRef().update({ name: v });
        });
      } catch(e){}
      render();
    });
  }

  function fmtValue(key, v){
    v = v || 0;
    if (key === 'mastered') return v + ' / ' + TOTAL;
    return v + '%';
  }

  function rankTable(rows, key, myId){
    // For mastered board, hide entries with 0 mastered (real users only — keep seeds for visual completeness)
    var pool = rows.filter(function(r){ return r.seed || (r[key] || 0) > 0; });
    var sorted = pool.slice().sort(function(a,b){
      var av = a[key] || 0, bv = b[key] || 0;
      if (bv !== av) return bv - av;
      if (!a.seed && b.seed) return -1;
      if (a.seed && !b.seed) return 1;
      return 0;
    });
    var top = sorted.slice(0, 10);
    var html = '<table><thead><tr><th class="rank">#</th><th>Name</th><th class="pct">' + (key==='mastered' ? 'Mastered' : 'Best') + '</th></tr></thead><tbody>';
    top.forEach(function(r, i){
      var isMe = (!r.seed && r._id && r._id === myId);
      html += '<tr class="' + (isMe ? 'me' : '') + '">'
            + '<td class="rank">' + (i + 1) + '</td>'
            + '<td>' + escapeHtml(r.name || 'Student')
                + (r.seed ? '<span class="seed-tag">★</span>' : '')
                + (isMe ? ' <span style="color:var(--accent);font-size:11px;font-weight:700;">YOU</span>' : '')
            + '</td>'
            + '<td class="pct">' + fmtValue(key, r[key]) + '</td>'
          + '</tr>';
    });
    html += '</tbody></table>';
    var myIdx = sorted.findIndex(function(r){ return !r.seed && r._id === myId; });
    if (myIdx >= 10) {
      var me = sorted[myIdx];
      html += '<div style="margin-top:12px;padding:10px 12px;background:rgba(201,55,45,0.08);border:1px solid var(--rule);border-radius:3px;font-size:13px;color:var(--ink-soft);">Your rank: <strong style="color:var(--accent);">#' + (myIdx+1) + '</strong> · ' + escapeHtml(me.name) + ' · ' + fmtValue(key, me[key]) + '</div>';
    } else if (myIdx === -1) {
      html += '<div style="margin-top:12px;padding:10px 12px;background:var(--bg-card);border:1px solid var(--rule);border-radius:3px;font-size:13px;color:var(--ink-soft);">' + (key==='bestTest' ? 'Take a test to appear on this board.' : 'Master cards (rate them \\u201CGot it\\u201D) to appear on this board.') + '</div>';
    }
    return html;
  }

  function escapeHtml(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  function render(){
    var testBody = document.getElementById('lb-test-table');
    var flashBody = document.getElementById('lb-flash-table');
    if (!testBody || !flashBody) return;
    testBody.innerHTML  = '<p style="color:var(--ink-soft);font-size:13px;">Loading…</p>';
    flashBody.innerHTML = '<p style="color:var(--ink-soft);font-size:13px;">Loading…</p>';

    if (typeof firebase === 'undefined' || !firebase.database){
      var rowsOnly = DUMMIES.slice();
      testBody.innerHTML  = rankTable(rowsOnly, 'bestTest', null);
      flashBody.innerHTML = rankTable(rowsOnly, 'mastered', null);
      return;
    }

    firebase.database().ref('leaderboard/' + subject).once('value').then(function(snap){
      var data = snap.val() || {};
      var real = Object.keys(data).map(function(id){
        var v = data[id] || {};
        return { _id: id, name: v.name || 'Student', bestTest: v.bestTest||0, mastered: v.mastered||0 };
      });
      var rows = DUMMIES.concat(real);
      var myId = getUserId();
      testBody.innerHTML  = rankTable(rows, 'bestTest', myId);
      flashBody.innerHTML = rankTable(rows, 'mastered', myId);
    }).catch(function(){
      testBody.innerHTML  = rankTable(DUMMIES, 'bestTest', null);
      flashBody.innerHTML = rankTable(DUMMIES, 'mastered', null);
    });
  }

  function init(){
    buildUI();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
