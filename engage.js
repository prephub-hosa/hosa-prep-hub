/* ═══════════════════════════════════════════════════════════════
   HOSA Prep Hub — Engagement Engine
   · 16 achievements with unlock toasts
   · Session complete: animated XP, streak pill, level bar
   · Level-up full-screen celebration with particles
   · Homepage: due-today queue widget + achievement gallery
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__hosaEngage) return;
  window.__hosaEngage = true;

  /* ─── Achievement definitions ─────────────────────────────── */
  const ACH = [
    { id:'first-session',   icon:'🎯', title:'First Steps',       desc:'Completed your first study session' },
    { id:'streak-3',        icon:'🔥', title:'On a Roll',         desc:'3-day study streak' },
    { id:'streak-7',        icon:'🔥', title:'Week Warrior',      desc:'7-day study streak' },
    { id:'streak-14',       icon:'💪', title:'Two Weeks Strong',  desc:'14-day study streak' },
    { id:'streak-30',       icon:'⚡', title:'Unstoppable',       desc:'30-day study streak' },
    { id:'mastered-10',     icon:'📚', title:'Getting Started',   desc:'Mastered 10 terms' },
    { id:'mastered-50',     icon:'🧠', title:'Sharp Mind',        desc:'Mastered 50 terms' },
    { id:'mastered-100',    icon:'🏆', title:'Century Club',      desc:'Mastered 100 terms' },
    { id:'mastered-250',    icon:'⭐', title:'Scholar',           desc:'Mastered 250 terms' },
    { id:'mastered-500',    icon:'💎', title:'Elite',             desc:'Mastered 500 terms' },
    { id:'events-3',        icon:'🗺️', title:'Explorer',          desc:'Studied 3 different events' },
    { id:'events-10',       icon:'🌟', title:'All-Rounder',       desc:'Studied 10 different HOSA events' },
    { id:'perfect-session', icon:'✨', title:'Perfect Session',   desc:'Finished a session with only Good & Easy' },
    { id:'level-5',         icon:'🚀', title:'Rising Star',       desc:'Reached Level 5' },
    { id:'level-10',        icon:'🎓', title:'Expert',            desc:'Reached Level 10' },
    { id:'level-20',        icon:'👑', title:'Master',            desc:'Reached Level 20' },
  ];
  window.HOSA_ACH = ACH;

  /* ─── XP math (mirrors event-page functions) ──────────────── */
  function xpLevel(xp) { return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1; }
  function xpForLevel(lvl) { return (lvl - 1) * (lvl - 1) * 50; }

  /* ─── localStorage helpers ────────────────────────────────── */
  function getEarned() {
    try { return new Set(JSON.parse(localStorage.getItem('hosa::achievements') || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveEarned(s) {
    try { localStorage.setItem('hosa::achievements', JSON.stringify([...s])); } catch (e) {}
  }
  function getTodayStr() { return new Date().toISOString().slice(0, 10); }

  /* ─── Aggregate progress across all event keys ────────────── */
  function globalStats() {
    let mastered = 0, events = 0, streak = 0;
    const SKIP = new Set(['xp','achievements','theme','onboard-v1','intro-v1']);
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('hosa::')) continue;
        const slug = k.slice(6);
        if (!slug || SKIP.has(slug) || slug.startsWith('daily')) continue;
        try {
          const d = JSON.parse(localStorage.getItem(k));
          if (!d) continue;
          // mastered may be a serialised Array or Set
          const m = Array.isArray(d.mastered) ? d.mastered.length : 0;
          const sv = Array.isArray(d.studied) ? d.studied.length : 0;
          if (m > 0 || sv > 0) events++;
          mastered += m;
          if ((d.streak || 0) > streak) streak = d.streak;
        } catch (_) {}
      }
    } catch (_) {}
    const xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
    return { mastered, events, streak, xp, level: xpLevel(xp) };
  }
  window.hosaGlobalStats = globalStats;

  /* ─── Cards due today per event ───────────────────────────── */
  function getDueToday() {
    const today = getTodayStr();
    const SKIP = new Set(['xp','achievements','theme','onboard-v1','intro-v1']);
    const results = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('hosa::')) continue;
        const slug = k.slice(6);
        if (!slug || SKIP.has(slug) || slug.startsWith('daily')) continue;
        try {
          const d = JSON.parse(localStorage.getItem(k));
          if (!d || !d.srData) continue;
          let due = 0;
          Object.values(d.srData).forEach(c => { if (c && c.due && c.due <= today) due++; });
          if (due > 0) {
            const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            results.push({ slug, name, due });
          }
        } catch (_) {}
      }
    } catch (_) {}
    return results.sort((a, b) => b.due - a.due);
  }
  window.hosaDueToday = getDueToday;

  /* ─── Achievement check ───────────────────────────────────── */
  function checkAchievements(session) {
    const stats = globalStats();
    const earned = getEarned();
    const got = session.got || 0, missed = session.missed || 0, hard = session.hard || 0;
    const newly = [];
    const pass = {
      'first-session':   (got + missed + hard) >= 1,
      'streak-3':        stats.streak >= 3,
      'streak-7':        stats.streak >= 7,
      'streak-14':       stats.streak >= 14,
      'streak-30':       stats.streak >= 30,
      'mastered-10':     stats.mastered >= 10,
      'mastered-50':     stats.mastered >= 50,
      'mastered-100':    stats.mastered >= 100,
      'mastered-250':    stats.mastered >= 250,
      'mastered-500':    stats.mastered >= 500,
      'events-3':        stats.events >= 3,
      'events-10':       stats.events >= 10,
      'perfect-session': missed === 0 && hard === 0 && got >= 5,
      'level-5':         stats.level >= 5,
      'level-10':        stats.level >= 10,
      'level-20':        stats.level >= 20,
    };
    for (const a of ACH) {
      if (!earned.has(a.id) && pass[a.id]) {
        earned.add(a.id);
        newly.push(a);
      }
    }
    if (newly.length) {
      saveEarned(earned);
      newly.forEach((a, i) => setTimeout(() => showAchToast(a), i * 3600));
    }
    return newly;
  }
  window.hosaCheckAchievements = checkAchievements;

  /* ─── Inject styles ───────────────────────────────────────── */
  if (!document.getElementById('engage-css')) {
    const s = document.createElement('style');
    s.id = 'engage-css';
    s.textContent = `
/* Achievement toast */
#ach-toast-box{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none;width:360px;max-width:calc(100vw - 24px);}
.ach-toast{background:var(--bg-card,#121212);border:1px solid var(--accent,#ef4444);border-radius:18px;padding:16px 22px;display:flex;align-items:center;gap:14px;box-shadow:0 8px 48px -8px rgba(0,0,0,0.65),0 0 60px -12px var(--accent-glow,rgba(239,68,68,0.3));opacity:0;transform:translateY(28px) scale(0.92);transition:opacity 0.4s ease,transform 0.45s cubic-bezier(0.16,1,0.3,1);width:100%;}
.ach-toast.show{opacity:1;transform:translateY(0) scale(1);}
.ach-ti{font-size:32px;flex-shrink:0;line-height:1;}
.ach-te{font-size:10px;letter-spacing:0.09em;text-transform:uppercase;color:var(--accent,#ef4444);margin-bottom:3px;font-family:'Geist Mono',monospace,sans-serif;}
.ach-tt{font-size:16px;font-weight:700;color:var(--ink,#fff);letter-spacing:-0.01em;font-family:'Inter',sans-serif;}
.ach-td{font-size:12px;color:var(--ink-soft,#a3a3a3);margin-top:2px;font-family:'Inter',sans-serif;}

/* Session complete extra UI */
.sc-xp-banner{text-align:center;padding:8px 0 4px;}
.sc-xp-count{font-family:'Inter',sans-serif;font-size:56px;font-weight:800;letter-spacing:-0.05em;color:var(--accent,#ef4444);line-height:1;display:block;}
.sc-xp-sublabel{font-family:'Geist Mono',monospace,sans-serif;font-size:10px;letter-spacing:0.09em;text-transform:uppercase;color:var(--ink-faint,#6b6b6b);margin-top:5px;display:block;}
.sc-streak-wrap{text-align:center;margin:14px 0 0;}
.sc-streak-pill{display:inline-flex;align-items:center;gap:8px;background:rgba(239,68,68,0.09);border:1px solid rgba(239,68,68,0.28);border-radius:100px;padding:9px 20px;font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:var(--ink,#fff);}
.sc-fire{font-size:18px;}
.sc-lvl-wrap{margin:18px auto 0;max-width:300px;width:100%;}
.sc-lvl-labels{display:flex;justify-content:space-between;font-family:'Geist Mono',monospace,sans-serif;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-faint,#6b6b6b);margin-bottom:8px;}
.sc-lvl-track{height:8px;background:var(--rule,rgba(255,255,255,0.08));border-radius:100px;overflow:hidden;}
.sc-lvl-fill{height:100%;background:var(--accent,#ef4444);border-radius:100px;width:0;transition:width 1.2s cubic-bezier(0.16,1,0.3,1);box-shadow:0 0 14px var(--accent-glow,rgba(239,68,68,0.4));}
.sc-inject-divider{height:1px;background:var(--rule,rgba(255,255,255,0.08));margin:24px 0;}

/* Level-up overlay */
#lu-overlay{position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);opacity:0;pointer-events:none;transition:opacity 0.4s ease;}
#lu-overlay.show{opacity:1;pointer-events:auto;}
#lu-overlay.hide{opacity:0;}
.lu-inner{text-align:center;position:relative;z-index:1;}
.lu-eyebrow{font-family:'Geist Mono',monospace,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink-soft,#a3a3a3);margin-bottom:10px;}
.lu-num{font-family:'Inter',sans-serif;font-size:clamp(88px,20vw,152px);font-weight:800;letter-spacing:-0.06em;line-height:0.9;background:linear-gradient(135deg,#ef4444 0%,#f97316 60%,#fbbf24 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:lu-pop 0.65s cubic-bezier(0.16,1,0.3,1) both;}
.lu-name{font-family:'Inter',sans-serif;font-size:clamp(20px,4vw,30px);font-weight:700;color:var(--ink,#fff);margin-top:10px;letter-spacing:-0.02em;}
.lu-tap{font-family:'Geist Mono',monospace,sans-serif;font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--ink-faint,#6b6b6b);margin-top:20px;}
@keyframes lu-pop{from{transform:scale(0.5) translateY(20px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
.lu-burst{position:fixed;inset:0;pointer-events:none;overflow:hidden;}
.lu-p{position:absolute;border-radius:50%;animation:lu-fly 1.4s ease-out forwards;}
@keyframes lu-fly{from{transform:translate(0,0) scale(1);opacity:1;}to{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0;}}

/* Homepage: due-today widget */
#due-today-section{margin-bottom:56px;}
.due-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px;}
.due-eyebrow{font-family:'Geist Mono',monospace,sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent,#ef4444);margin-bottom:6px;}
.due-headline{font-family:'Inter',sans-serif;font-size:clamp(22px,3.5vw,30px);font-weight:700;letter-spacing:-0.03em;color:var(--ink,#fff);}
.due-streak-pill{display:inline-flex;align-items:center;gap:7px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.22);border-radius:100px;padding:7px 16px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:var(--ink,#fff);flex-shrink:0;}
#due-today-list{display:flex;flex-direction:column;gap:8px;}
.due-item{display:flex;align-items:center;justify-content:space-between;background:var(--bg-card,#121212);border:1px solid var(--rule,rgba(255,255,255,0.08));border-radius:14px;padding:16px 20px;text-decoration:none;color:var(--ink,#fff);transition:transform 0.2s ease,box-shadow 0.25s ease,border-color 0.2s ease;position:relative;overflow:hidden;}
.due-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent,#ef4444);border-radius:14px 0 0 14px;}
.due-item:hover{transform:translateY(-2px);box-shadow:0 12px 32px -12px rgba(0,0,0,0.4),0 0 40px -16px var(--accent-glow,rgba(239,68,68,0.3));border-color:rgba(239,68,68,0.3);}
.due-name{font-family:'Inter',sans-serif;font-size:15px;font-weight:600;letter-spacing:-0.01em;}
.due-right{display:flex;align-items:center;gap:12px;}
.due-count{font-family:'Geist Mono',monospace,sans-serif;font-size:12px;letter-spacing:0.04em;color:var(--accent,#ef4444);font-weight:600;}
.due-arrow{color:var(--ink-faint,#6b6b6b);font-size:16px;transition:transform 0.2s;}
.due-item:hover .due-arrow{transform:translateX(4px);color:var(--accent,#ef4444);}
.due-item-streak{font-size:12px;color:var(--ink-faint);}

/* Homepage: achievement gallery */
#achievements-section{margin-bottom:56px;}
.ach-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:12px;margin-top:24px;}
.ach-badge{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 8px;background:var(--bg-card,#121212);border:1px solid var(--rule,rgba(255,255,255,0.08));border-radius:14px;text-align:center;transition:transform 0.2s,box-shadow 0.25s,border-color 0.2s;}
.ach-badge.earned{border-color:rgba(239,68,68,0.3);}
.ach-badge.earned:hover{transform:translateY(-3px);box-shadow:0 10px 28px -10px rgba(0,0,0,0.4),0 0 32px -12px var(--accent-glow,rgba(239,68,68,0.3));border-color:rgba(239,68,68,0.5);}
.ach-badge.locked{opacity:0.32;filter:grayscale(1);}
.ach-badge-icon{font-size:28px;line-height:1;}
.ach-badge-name{font-family:'Geist Mono',monospace,sans-serif;font-size:9px;letter-spacing:0.04em;text-transform:uppercase;color:var(--ink-soft,#a3a3a3);line-height:1.3;}

@media(max-width:640px){
  .sc-xp-count{font-size:44px;}
  .ach-grid{grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:8px;}
  .ach-badge{padding:12px 6px;}
  .ach-badge-icon{font-size:22px;}
  .due-headline{font-size:20px;}
}
    `;
    document.head.appendChild(s);
  }

  /* ─── Toast ───────────────────────────────────────────────── */
  function toastBox() {
    let el = document.getElementById('ach-toast-box');
    if (!el) { el = document.createElement('div'); el.id = 'ach-toast-box'; document.body.appendChild(el); }
    return el;
  }

  function showAchToast(a) {
    const el = document.createElement('div');
    el.className = 'ach-toast';
    el.innerHTML = `<div class="ach-ti">${a.icon}</div><div><div class="ach-te">Achievement Unlocked</div><div class="ach-tt">${a.title}</div><div class="ach-td">${a.desc}</div></div>`;
    toastBox().appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 3400);
  }
  window.hosaShowAchToast = showAchToast;

  /* ─── Level-up celebration ────────────────────────────────── */
  function showLevelUp(level) {
    // Particles
    const burst = document.createElement('div');
    burst.className = 'lu-burst';
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const colors = ['#ef4444','#f97316','#fbbf24','#34d399','#60a5fa','#a78bfa'];
    for (let i = 0; i < 36; i++) {
      const p = document.createElement('div');
      p.className = 'lu-p';
      const angle = (i / 36) * 360;
      const dist = 120 + Math.random() * 200;
      const tx = Math.cos(angle * Math.PI / 180) * dist;
      const ty = Math.sin(angle * Math.PI / 180) * dist;
      const size = 5 + Math.random() * 7;
      p.style.cssText = `left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${colors[i%colors.length]};--tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random()*0.15}s;animation-duration:${1+Math.random()*0.7}s;`;
      burst.appendChild(p);
    }

    let ov = document.getElementById('lu-overlay');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'lu-overlay';
      ov.innerHTML = `<div class="lu-inner"><div class="lu-eyebrow">Level Up</div><div class="lu-num" id="lu-num">${level}</div><div class="lu-name">You reached Level ${level}</div><div class="lu-tap">Tap anywhere to continue</div></div>`;
      ov.addEventListener('click', () => { ov.classList.add('hide'); setTimeout(() => ov.classList.remove('show','hide'), 500); });
      document.body.appendChild(ov);
    } else {
      document.getElementById('lu-num').textContent = level;
      ov.querySelector('.lu-name').textContent = `You reached Level ${level}`;
    }
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 2000);

    ov.classList.remove('hide');
    ov.classList.add('show');
    setTimeout(() => { ov.classList.add('hide'); setTimeout(() => ov.classList.remove('show','hide'), 500); }, 3200);
  }
  window.hosaShowLevelUp = showLevelUp;

  /* ─── Patch awardXP to track session XP + trigger level-up ─ */
  function patchAwardXP() {
    if (typeof window.awardXP !== 'function' || window._hosaXPPatched) return;
    window._hosaXPPatched = true;
    const orig = window.awardXP;
    window.awardXP = function (amount) {
      const prevLvl = xpLevel(parseInt(localStorage.getItem('hosa::xp') || '0', 10));
      orig.call(this, amount);
      window._hosaSessXP = (window._hosaSessXP || 0) + (amount || 0);
      const newLvl = xpLevel(parseInt(localStorage.getItem('hosa::xp') || '0', 10));
      if (newLvl > prevLvl) setTimeout(() => showLevelUp(newLvl), 500);
    };
  }

  /* ─── Animate counter ─────────────────────────────────────── */
  function animCount(el, from, to, dur, fmt) {
    if (!el) return;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = (fmt || String)(Math.round(from + (to - from) * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ─── Enhance session-complete HTML (inject extra nodes) ──── */
  function injectSCExtras(el) {
    if (el.dataset.engageInjected) return;
    el.dataset.engageInjected = '1';
    const anchor = el.querySelector('#sc-stats') || el.querySelector('.sc-sub');

    const xpBanner = document.createElement('div');
    xpBanner.className = 'sc-xp-banner';
    xpBanner.innerHTML = '<span class="sc-xp-count" id="eg-xp-count">+0 XP</span><span class="sc-xp-sublabel">earned this session</span>';

    const streakWrap = document.createElement('div');
    streakWrap.className = 'sc-streak-wrap';
    streakWrap.innerHTML = '<div class="sc-streak-pill" id="eg-streak-pill" style="display:none"><span class="sc-fire">🔥</span> <span id="eg-streak-n">0</span>-day streak</div>';

    const lvlWrap = document.createElement('div');
    lvlWrap.className = 'sc-lvl-wrap';
    lvlWrap.innerHTML = '<div class="sc-lvl-labels"><span>Level <span id="eg-lvl-n">1</span></span><span id="eg-lvl-next"></span></div><div class="sc-lvl-track"><div class="sc-lvl-fill" id="eg-lvl-fill"></div></div>';

    const divider = document.createElement('div');
    divider.className = 'sc-inject-divider';

    if (anchor) {
      el.insertBefore(divider, anchor);
      el.insertBefore(lvlWrap, divider);
      el.insertBefore(streakWrap, lvlWrap);
      el.insertBefore(xpBanner, streakWrap);
    }
  }

  function populateSC(el) {
    const xp     = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
    const lvl    = xpLevel(xp);
    const forLvl = xpForLevel(lvl);
    const forNxt = xpForLevel(lvl + 1);
    const pct    = Math.min(100, ((xp - forLvl) / Math.max(1, forNxt - forLvl)) * 100);
    const sessXP = window._hosaSessXP || 0;
    const streak = (window.state && window.state.progress && window.state.progress.streak) || 0;

    // Animate XP
    const countEl = el.querySelector('#eg-xp-count');
    if (countEl) animCount(countEl, 0, sessXP, 900, v => '+' + v + ' XP');

    // Streak pill
    const pill = el.querySelector('#eg-streak-pill');
    const sn   = el.querySelector('#eg-streak-n');
    if (pill && streak >= 2) { if (sn) sn.textContent = streak; pill.style.display = 'inline-flex'; }

    // Level bar
    const fill = el.querySelector('#eg-lvl-fill');
    const lvlN = el.querySelector('#eg-lvl-n');
    const nxt  = el.querySelector('#eg-lvl-next');
    if (lvlN) lvlN.textContent = lvl;
    if (nxt)  nxt.textContent  = (forNxt - xp) + ' XP to Lv ' + (lvl + 1);
    if (fill) { fill.style.width = '0%'; setTimeout(() => { fill.style.width = pct + '%'; }, 200); }

    // Achievement check (after slight delay so XP is written)
    const got    = window._sessGot    || 0;
    const missed = window._sessMissed || 0;
    const hard   = window._sessHard   || 0;
    setTimeout(() => checkAchievements({ got, missed, hard }), 900);

    // Reset session tracker
    window._hosaSessXP = 0;
  }

  /* ─── Watch #session-complete visibility ──────────────────── */
  function watchSC() {
    const sc = document.getElementById('session-complete');
    if (!sc) return;
    injectSCExtras(sc);
    const obs = new MutationObserver(() => {
      const visible = sc.style.display !== 'none';
      if (visible && !sc.dataset.populated) {
        sc.dataset.populated = '1';
        populateSC(sc);
      }
      if (!visible) { delete sc.dataset.populated; }
    });
    obs.observe(sc, { attributes: true, attributeFilter: ['style'] });
  }

  /* ─── Homepage: due-today widget ──────────────────────────── */
  function renderDueToday() {
    const section = document.getElementById('due-today-section');
    if (!section) return;
    const due    = getDueToday();
    const stats  = globalStats();
    const total  = due.reduce((s, e) => s + e.due, 0);

    if (total === 0) { section.style.display = 'none'; return; }
    section.style.display = '';

    const hEl = document.getElementById('due-headline');
    if (hEl) hEl.textContent = total + ' card' + (total !== 1 ? 's' : '') + ' due today';

    // Streak pill
    const sp = document.getElementById('due-streak-pill');
    if (sp) {
      if (stats.streak >= 2) {
        sp.style.display = 'inline-flex';
        const sn = document.getElementById('due-streak-n');
        if (sn) sn.textContent = stats.streak;
      } else {
        sp.style.display = 'none';
      }
    }

    const list = document.getElementById('due-today-list');
    if (!list) return;
    list.innerHTML = '';
    due.slice(0, 6).forEach(ev => {
      const a = document.createElement('a');
      a.href = ev.slug + '.html';
      a.className = 'due-item';
      a.innerHTML = `<span class="due-name">${ev.name}</span><span class="due-right"><span class="due-count">${ev.due} due</span><span class="due-arrow">→</span></span>`;
      list.appendChild(a);
    });
  }

  /* ─── Homepage: achievement gallery ──────────────────────── */
  function renderAchievements() {
    const section = document.getElementById('achievements-section');
    if (!section) return;
    const earned = getEarned();
    if (earned.size === 0) { section.style.display = 'none'; return; }
    section.style.display = '';
    const grid = document.getElementById('ach-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ACH.forEach(a => {
      const div = document.createElement('div');
      const e = earned.has(a.id);
      div.className = 'ach-badge ' + (e ? 'earned' : 'locked');
      div.title = a.desc;
      div.innerHTML = `<span class="ach-badge-icon">${e ? a.icon : '🔒'}</span><span class="ach-badge-name">${a.title}</span>`;
      grid.appendChild(div);
    });
  }

  /* ─── Init ────────────────────────────────────────────────── */
  function init() {
    setTimeout(patchAwardXP, 80);
    setTimeout(watchSC, 160);
    const isHome = !!document.getElementById('categories-section');
    if (isHome) {
      setTimeout(renderDueToday, 250);
      setTimeout(renderAchievements, 260);
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
