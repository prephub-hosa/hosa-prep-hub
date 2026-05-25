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
    // ── Study streaks
    { id:'first-session',      icon:'🎯', title:'First Steps',           desc:'Completed your first study session' },
    { id:'streak-3',           icon:'🔥', title:'On a Roll',             desc:'3-day study streak' },
    { id:'streak-7',           icon:'🔥', title:'Week Warrior',          desc:'7-day study streak' },
    { id:'streak-14',          icon:'💪', title:'Two Weeks Strong',      desc:'14-day study streak' },
    { id:'streak-30',          icon:'⚡', title:'Unstoppable',           desc:'30-day study streak' },
    // ── Mastery
    { id:'mastered-10',        icon:'📚', title:'Getting Started',       desc:'Mastered 10 terms' },
    { id:'mastered-50',        icon:'🧠', title:'Sharp Mind',            desc:'Mastered 50 terms' },
    { id:'mastered-100',       icon:'🏆', title:'Century Club',          desc:'Mastered 100 terms' },
    { id:'mastered-250',       icon:'⭐', title:'Scholar',               desc:'Mastered 250 terms' },
    { id:'mastered-500',       icon:'💎', title:'Elite',                 desc:'Mastered 500 terms' },
    // ── Events
    { id:'events-3',           icon:'🗺️',  title:'Explorer',             desc:'Studied 3 different events' },
    { id:'events-10',          icon:'🌟', title:'All-Rounder',           desc:'Studied 10 different HOSA events' },
    { id:'events-25',          icon:'🎖️',  title:'Generalist',           desc:'Studied 25 different HOSA events' },
    { id:'events-50',          icon:'🦅', title:'Comprehensive',         desc:'Studied 50 different HOSA events' },
    // ── Session quality
    { id:'perfect-session',    icon:'✨', title:'Perfect Session',       desc:'Finished a session with only Good & Easy' },
    // ── Levels
    { id:'level-5',            icon:'🚀', title:'Rising Star',           desc:'Reached Level 5' },
    { id:'level-10',           icon:'🎓', title:'Expert',               desc:'Reached Level 10' },
    { id:'level-20',           icon:'👑', title:'Master',               desc:'Reached Level 20' },
    { id:'level-50',           icon:'🌌', title:'Legend',               desc:'Reached Level 50' },
    // ── Daily Challenge
    { id:'dc-first',           icon:'⚡', title:'Challenge Accepted',   desc:'Completed your first Daily Challenge' },
    { id:'dc-perfect',         icon:'💥', title:'Flawless',             desc:'Scored 5/5 on a Daily Challenge' },
    { id:'dc-streak-7',        icon:'📅', title:'Daily Champion',       desc:'Completed the Daily Challenge 7 days in a row' },
    // ── Pomodoro
    { id:'pomo-5',             icon:'⏱',  title:'Focused',              desc:'Completed 5 Pomodoro focus sessions' },
    { id:'pomo-25',            icon:'🍅', title:'Pomodoro Pro',         desc:'Completed 25 Pomodoro focus sessions' },
    // ── Medical Spanish
    { id:'spanish-10',         icon:'🌎', title:'Hola Médico',          desc:'Learned 10 Medical Spanish terms' },
    { id:'spanish-all',        icon:'🏥', title:'Bilingüe',             desc:'Mastered all Medical Spanish terms' },
    // ── Time-based
    { id:'night-owl',          icon:'🦉', title:'Night Owl',            desc:'Studied after midnight' },
    { id:'early-bird',         icon:'🌅', title:'Early Bird',           desc:'Studied before 6 AM' },
    // ── XP milestones
    { id:'xp-1000',            icon:'💰', title:'First Thousand',       desc:'Earned 1,000 total XP' },
    { id:'xp-10000',           icon:'💎', title:'Ten Grand',            desc:'Earned 10,000 total XP' },
    // ── Mock Final Exam
    { id:'mfe-first',          icon:'📝', title:'Test Taker',           desc:'Completed your first Mock Final Exam' },
    { id:'mfe-pass',           icon:'🎯', title:'Solid Pass',           desc:'Scored 80%+ on a Mock Final Exam' },
    { id:'mfe-perfect',        icon:'🏆', title:'Perfect Score',        desc:'Aced a Mock Final Exam (15/15)' },
    // ── Bookmarks
    { id:'bmk-10',             icon:'⭐', title:'Curator',              desc:'Bookmarked 10 terms' },
    { id:'bmk-25',             icon:'🌟', title:'Archivist',            desc:'Bookmarked 25 terms' },
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
  function getPomodoroSessions() {
    try {
      const stats = JSON.parse(localStorage.getItem('hosa::pomo-stats') || '{}');
      return Object.values(stats.days || {}).reduce((s, d) => s + (d.sessions || 0), 0);
    } catch (e) { return 0; }
  }

  function getSpanishLearned() {
    try {
      const arr = JSON.parse(localStorage.getItem('hosa::sp-learned') || '[]');
      return Array.isArray(arr) ? arr.length : 0;
    } catch (e) { return 0; }
  }

  function getDCStreak() {
    try {
      const s = JSON.parse(localStorage.getItem('hosa::dc-streak') || '{"streak":0}');
      return s.streak || 0;
    } catch (e) { return 0; }
  }

  function getBookmarkCount() {
    try {
      const arr = JSON.parse(localStorage.getItem('hosa::bookmarks') || '[]');
      return Array.isArray(arr) ? arr.length : 0;
    } catch (e) { return 0; }
  }

  function checkAchievements(session) {
    const stats = globalStats();
    const earned = getEarned();
    const got = session.got || 0, missed = session.missed || 0, hard = session.hard || 0;
    const hour = new Date().getHours();
    const xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
    const pomoSessions = getPomodoroSessions();
    const spanishLearned = getSpanishLearned();
    const dcStreak = getDCStreak();
    const bmkCount = getBookmarkCount();

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
      'events-25':       stats.events >= 25,
      'events-50':       stats.events >= 50,
      'perfect-session': missed === 0 && hard === 0 && got >= 5,
      'level-5':         stats.level >= 5,
      'level-10':        stats.level >= 10,
      'level-20':        stats.level >= 20,
      'level-50':        stats.level >= 50,
      'dc-first':        session.dcCompleted === true,
      'dc-perfect':      session.dcPerfect === true,
      'dc-streak-7':     dcStreak >= 7,
      'pomo-5':          pomoSessions >= 5,
      'pomo-25':         pomoSessions >= 25,
      'spanish-10':      spanishLearned >= 10,
      'spanish-all':     spanishLearned >= 68,
      'night-owl':       (got + missed + hard) >= 1 && (hour === 0 || hour === 1 || hour === 23),
      'early-bird':      (got + missed + hard) >= 1 && hour < 6,
      'xp-1000':         xp >= 1000,
      'xp-10000':        xp >= 10000,
      'mfe-first':       session.mfeCompleted === true,
      'mfe-pass':        session.mfeCompleted === true && session.mfePct >= 80,
      'mfe-perfect':     session.mfeCompleted === true && session.mfePerfect === true,
      'bmk-10':          bmkCount >= 10,
      'bmk-25':          bmkCount >= 25,
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
.sc-xp-breakdown{max-width:340px;margin:14px auto 4px;display:flex;flex-direction:column;gap:4px;padding:12px 16px;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.18);border-radius:10px;}
.sc-xp-line{display:flex;justify-content:space-between;font-family:'Inter',sans-serif;font-size:12px;color:var(--ink-soft,#888);font-weight:500;}
.sc-xp-line .sc-xp-amt{color:var(--accent,#ef4444);font-weight:700;font-variant-numeric:tabular-nums;}
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
    // Sync stored level so index.html doesn't re-fire the celebration
    try { localStorage.setItem('hosa::chk-lvl', String(level)); } catch(e) {}
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

  /* ─── Patch awardXP to track session XP + trigger level-up ─
     NOTE: event pages declare `function awardXP()` lexically, so
     monkey-patching window.awardXP doesn't intercept their calls.
     We ALSO track XP via localStorage delta as a fallback. */
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

  /* ─── Snapshot baseline XP for delta-based session tracking ── */
  window._hosaSessBaseXP = parseInt(localStorage.getItem('hosa::xp') || '0', 10);

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
    let xp       = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
    const prevLvl0 = xpLevel(xp);

    // Use whichever is larger: tracked sessXP (from patched awardXP) OR delta
    // from baseline (fallback when event-page awardXP is locally-bound).
    const trackedXP = window._hosaSessXP || 0;
    const baseXP    = window._hosaSessBaseXP != null ? window._hosaSessBaseXP : xp;
    const deltaXP   = Math.max(0, xp - baseXP);
    const alreadyAwarded = Math.max(trackedXP, deltaXP);

    // Session stats — event pages declare these as lexical (not window),
    // so read from the DOM stats elements and the sc-stats text as fallback.
    function readNum(id) {
      const e = document.getElementById(id);
      const n = e ? parseInt((e.textContent || '0').replace(/[^0-9]/g, ''), 10) : 0;
      return isNaN(n) ? 0 : n;
    }
    let got    = readNum('ss-got-n') || window._sessGot    || 0;
    let missed = readNum('ss-miss-n') || window._sessMissed || 0;
    let hard   = readNum('ss-hard-n') || window._sessHard   || 0;
    // Fallback: parse "You rated X cards — Y got it, Z missed" from #sc-stats
    if (got + missed + hard === 0) {
      const sct = (document.getElementById('sc-stats') || {}).textContent || '';
      const mGot = sct.match(/(\d+)\s+got it/i);
      const mMis = sct.match(/(\d+)\s+missed/i);
      const mRated = sct.match(/rated\s+(\d+)\s+card/i);
      if (mGot) got = parseInt(mGot[1], 10);
      if (mMis) missed = parseInt(mMis[1], 10);
      if (got + missed === 0 && mRated) got = parseInt(mRated[1], 10);
    }
    const totalRated = got + missed + hard;

    // ─── Session completion bonus XP (this is the fix) ────────
    const bonusBreakdown = [];
    let bonusXP = 0;
    if (totalRated > 0) {
      bonusXP += 15; bonusBreakdown.push(['Session complete', 15]);
      const cardXP = got * 3 + hard * 2 + missed * 1;
      bonusXP += cardXP; bonusBreakdown.push([totalRated + ' cards rated', cardXP]);
      const accuracy = got / totalRated;
      if (accuracy >= 0.9 && totalRated >= 5) { bonusXP += 30; bonusBreakdown.push(['90%+ accuracy', 30]); }
      else if (accuracy >= 0.75 && totalRated >= 5) { bonusXP += 15; bonusBreakdown.push(['75%+ accuracy', 15]); }
      if (totalRated >= 30) { bonusXP += 20; bonusBreakdown.push(['Marathon (30+ cards)', 20]); }
      else if (totalRated >= 15) { bonusXP += 10; bonusBreakdown.push(['Long session', 10]); }

      // First session of day bonus
      try {
        const today = new Date().toISOString().slice(0, 10);
        const last  = localStorage.getItem('hosa::last-session-bonus-day');
        if (last !== today) {
          bonusXP += 25;
          bonusBreakdown.push(['First session today', 25]);
          localStorage.setItem('hosa::last-session-bonus-day', today);
        }
      } catch(e) {}
    }

    // Write bonus XP to storage
    if (bonusXP > 0) {
      xp = xp + bonusXP;
      try { localStorage.setItem('hosa::xp', String(xp)); } catch(e) {}
    }

    const sessXP = alreadyAwarded + bonusXP;

    // Trigger level-up overlay if the bonus pushed user past a threshold
    const newLvlAfter = xpLevel(xp);
    if (newLvlAfter > prevLvl0 && typeof showLevelUp === 'function') {
      setTimeout(() => showLevelUp(newLvlAfter), 600);
    }

    const lvl    = xpLevel(xp);
    const forLvl = xpForLevel(lvl);
    const forNxt = xpForLevel(lvl + 1);
    const pct    = Math.min(100, ((xp - forLvl) / Math.max(1, forNxt - forLvl)) * 100);
    const streak = (window.state && window.state.progress && window.state.progress.streak) || 0;

    // Animate XP
    const countEl = el.querySelector('#eg-xp-count');
    if (countEl) animCount(countEl, 0, sessXP, 900, v => '+' + v + ' XP');

    // Inject breakdown if it doesn't exist
    if (bonusBreakdown.length > 0) {
      let bd = el.querySelector('#eg-xp-breakdown');
      if (!bd) {
        bd = document.createElement('div');
        bd.id = 'eg-xp-breakdown';
        bd.className = 'sc-xp-breakdown';
        const banner = el.querySelector('.sc-xp-banner');
        if (banner) banner.parentNode.insertBefore(bd, banner.nextSibling);
      }
      bd.innerHTML = bonusBreakdown.map(function(b){
        return '<div class="sc-xp-line"><span>' + b[0] + '</span><span class="sc-xp-amt">+' + b[1] + '</span></div>';
      }).join('');
    }

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
    setTimeout(() => checkAchievements({ got, missed, hard }), 900);

    // Reset session trackers (next session starts from here)
    window._hosaSessXP = 0;
    window._hosaSessBaseXP = xp;
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

  /* ─── Session progress bar (injected into flashcard stage) ── */
  function initSessionProgressBar() {
    const cardCounter = document.querySelector('.card-counter');
    if (!cardCounter || document.getElementById('hosa-sess-pbar')) return;
    const bar = document.createElement('div');
    bar.id = 'hosa-sess-pbar';
    bar.className = 'hosa-sess-pbar';
    bar.innerHTML = '<div class="hosa-sess-pbar-fill" id="hosa-sess-pbar-fill"></div>';
    cardCounter.parentNode.insertBefore(bar, cardCounter.nextSibling);

    const fpEl = document.getElementById('flash-progress');
    if (!fpEl) return;
    function updateBar() {
      const txt = fpEl.textContent || '';
      const m = txt.match(/(\d+)\s*[\/]\s*(\d+)/);
      if (!m) return;
      const cur = parseInt(m[1], 10), tot = parseInt(m[2], 10);
      if (!tot) return;
      const pct = Math.round(Math.max(0, cur - 1) / tot * 100);
      const fill = document.getElementById('hosa-sess-pbar-fill');
      if (fill) fill.style.width = pct + '%';
    }
    new MutationObserver(updateBar).observe(fpEl, { childList: true, characterData: true, subtree: true });
    updateBar();
  }

  /* ─── Rating button pulse feedback ───────────────────────── */
  function initRatingPulse() {
    const knowBtn = document.getElementById('flash-good');
    const missBtn = document.getElementById('flash-again');
    if (!knowBtn || !missBtn) return;
    function pulse(btn) {
      btn.classList.remove('btn-pulsing');
      void btn.offsetWidth;
      btn.classList.add('btn-pulsing');
      setTimeout(() => btn.classList.remove('btn-pulsing'), 420);
    }
    knowBtn.addEventListener('click', () => pulse(knowBtn));
    missBtn.addEventListener('click', () => pulse(missBtn));
  }

  /* ─── Init ────────────────────────────────────────────────── */
  function init() {
    setTimeout(patchAwardXP, 80);
    setTimeout(watchSC, 160);
    const isHome = !!document.getElementById('due-today-section');
    const isEvent = !!document.getElementById('view-flashcards');
    if (isHome) {
      setTimeout(renderDueToday, 250);
      setTimeout(renderAchievements, 260);
    }
    if (isEvent) {
      setTimeout(initSessionProgressBar, 400);
      setTimeout(initRatingPulse, 400);
    }
  }

  /* ─── Daily challenge achievement check hook ─────────────────── */
  function checkDCComplete(score) {
    const QUESTIONS = 5;
    // Update DC streak
    try {
      const today = getTodayStr();
      let ds = JSON.parse(localStorage.getItem('hosa::dc-streak') || '{"streak":0,"last":""}');
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      if (ds.last === yStr) {
        ds.streak = (ds.streak || 0) + 1;
      } else if (ds.last !== today) {
        ds.streak = 1;
      }
      ds.last = today;
      localStorage.setItem('hosa::dc-streak', JSON.stringify(ds));
    } catch(e) {}

    checkAchievements({
      got: score,
      missed: QUESTIONS - score,
      hard: 0,
      dcCompleted: true,
      dcPerfect: score === QUESTIONS,
    });
  }
  window.hosaCheckDCComplete = checkDCComplete;

  /* ─── Mock Final Exam achievement hook ───────────────────────── */
  function checkMFE(correct, total) {
    const pct = Math.round(correct / total * 100);
    checkAchievements({
      got: correct,
      missed: total - correct,
      hard: 0,
      mfeCompleted: true,
      mfePct: pct,
      mfePerfect: correct === total,
    });
  }
  window.hosaCheckMFE = checkMFE;

  /* ─── Bookmark achievement re-check on bookmark toggle ───────── */
  setTimeout(function() {
    const _origToggleBmk = window.hosaToggleBookmark;
    if (typeof _origToggleBmk === 'function') {
      window.hosaToggleBookmark = function(term) {
        const r = _origToggleBmk(term);
        setTimeout(() => checkAchievements({ got: 0, missed: 0, hard: 0 }), 100);
        return r;
      };
    }
  }, 600);

  /* ─── Activity log on session complete ───────────────────────── */
  function logTodayActivity() {
    try {
      const today = getTodayStr();
      let act = JSON.parse(localStorage.getItem('hosa::activity') || '[]');
      if (!act.includes(today)) {
        act.push(today);
        localStorage.setItem('hosa::activity', JSON.stringify(act));
      }
    } catch(e) {}
  }

  /* ─── Homepage: re-render heatmap after activity log ─────────── */
  function initDCHook() {
    // Wire up the daily challenge hook now that checkDCComplete is defined
    if (window.hosaCheckDCComplete !== checkDCComplete) {
      window.hosaCheckDCComplete = checkDCComplete;
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  // Wire DC hook immediately
  initDCHook();

  // Log activity whenever a session completes
  const _origPopulateSC = populateSC;
  /* We already have populateSC defined above — patch it to also log activity */
  // Use MutationObserver approach: log whenever session-complete becomes visible
  (function() {
    function tryLog() {
      const sc = document.getElementById('session-complete');
      if (!sc) return;
      const obs2 = new MutationObserver(() => {
        if (sc.style.display !== 'none') logTodayActivity();
      });
      obs2.observe(sc, { attributes: true, attributeFilter: ['style'] });
    }
    setTimeout(tryLog, 500);
  })();

  /* ─── Saved Cards — bookmark cards while studying, review anytime ─ */
  (function() {
    var _slug = window.location.pathname.split('/').pop().replace(/\.html$/, '');
    var _storageKey = 'hosa::saved::' + _slug;

    function getSaved() {
      try { return JSON.parse(localStorage.getItem(_storageKey) || '[]'); } catch(e) { return []; }
    }
    function setSaved(arr) {
      try { localStorage.setItem(_storageKey, JSON.stringify(arr)); } catch(e) {}
    }
    function isSaved(term) {
      var list = getSaved();
      for (var i = 0; i < list.length; i++) { if (list[i].term === term) return true; }
      return false;
    }
    function toggle(term, meaning) {
      var list = getSaved();
      for (var i = 0; i < list.length; i++) {
        if (list[i].term === term) { list.splice(i, 1); setSaved(list); return false; }
      }
      list.push({ term: term, meaning: meaning });
      setSaved(list);
      return true;
    }
    function getCurrentTerm() {
      var el = document.getElementById('flash-front-term');
      return el ? (el.textContent || '').trim() : '';
    }
    function getCurrentDef() {
      var el = document.getElementById('flash-back-def');
      return el ? (el.textContent || '').trim() : '';
    }
    function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    /* Save star button — injected into .card-counter row */
    function injectStar() {
      if (document.getElementById('hosa-save-star')) return;
      var counter = document.querySelector('.card-counter');
      if (!counter) return;
      var btn = document.createElement('button');
      btn.id = 'hosa-save-star';
      btn.type = 'button';
      btn.title = 'Save card for later (S)';
      btn.style.cssText = 'background:none;border:none;cursor:pointer;font-size:20px;padding:2px 6px;line-height:1;color:var(--ink-faint);transition:color 0.15s,transform 0.2s;margin-left:auto;flex-shrink:0;';
      btn.textContent = '☆';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var term = getCurrentTerm(), def = getCurrentDef();
        if (!term) return;
        var added = toggle(term, def);
        refreshStar(); refreshPill(); refreshSCBtn();
        btn.style.transform = 'scale(1.5)';
        setTimeout(function() { btn.style.transform = ''; }, 200);
        if (window.hosaToast) {
          if (added) window.hosaToast('⭐', 'Card saved', '"' + term + '" added to Saved Cards.', 'good');
          else       window.hosaToast('☆', 'Removed',    'Removed from Saved Cards.', 'info');
        }
      });
      counter.style.display = 'flex';
      counter.style.alignItems = 'center';
      counter.appendChild(btn);
    }
    function refreshStar() {
      var btn = document.getElementById('hosa-save-star');
      if (!btn) return;
      var term = getCurrentTerm();
      var saved = term && isSaved(term);
      btn.textContent = saved ? '★' : '☆';
      btn.style.color = saved ? '#fbbf24' : '';
    }
    // 'S' keyboard shortcut to save current card
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 's' || e.key === 'S') {
        var btn = document.getElementById('hosa-save-star');
        if (btn && document.getElementById('flashcard') && document.getElementById('flashcard').style.display !== 'none') btn.click();
      }
    });

    /* Persistent pill — shows below flashcard when saved cards exist */
    function injectPill() {
      if (document.getElementById('hosa-saved-pill')) return;
      var stage = document.querySelector('.flashcard-stage');
      if (!stage) return;
      var pill = document.createElement('button');
      pill.id = 'hosa-saved-pill';
      pill.type = 'button';
      pill.style.cssText = 'display:none;margin:12px auto 0;padding:8px 20px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;border-radius:100px;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background 0.15s;';
      pill.addEventListener('click', openOverlay);
      pill.addEventListener('mouseenter', function(){ pill.style.background='rgba(251,191,36,0.22)'; });
      pill.addEventListener('mouseleave', function(){ pill.style.background='rgba(251,191,36,0.12)'; });
      var controls = stage.querySelector('.card-controls');
      if (controls) stage.insertBefore(pill, controls);
      else stage.appendChild(pill);
    }
    function refreshPill() {
      var pill = document.getElementById('hosa-saved-pill');
      if (!pill) return;
      var n = getSaved().length;
      pill.style.display = n > 0 ? '' : 'none';
      if (n > 0) pill.textContent = '⭐ Study ' + n + ' saved card' + (n === 1 ? '' : 's');
    }

    /* Session-complete button */
    function injectSCBtn() {
      if (document.getElementById('hosa-sc-saved-btn')) return;
      var sc = document.getElementById('session-complete');
      if (!sc) return;
      var btn = document.createElement('button');
      btn.id = 'hosa-sc-saved-btn';
      btn.type = 'button';
      btn.style.cssText = 'display:none;width:100%;padding:11px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.3);color:#fbbf24;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;margin-top:10px;transition:background 0.15s;';
      btn.addEventListener('click', openOverlay);
      btn.addEventListener('mouseenter', function(){ btn.style.background='rgba(251,191,36,0.22)'; });
      btn.addEventListener('mouseleave', function(){ btn.style.background='rgba(251,191,36,0.12)'; });
      sc.appendChild(btn);
    }
    function refreshSCBtn() {
      var btn = document.getElementById('hosa-sc-saved-btn');
      if (!btn) return;
      var n = getSaved().length;
      btn.style.display = n > 0 ? '' : 'none';
      if (n > 0) btn.textContent = '⭐ Study ' + n + ' saved card' + (n === 1 ? '' : 's');
    }

    /* Saved cards overlay */
    function openOverlay() {
      var saved = getSaved();
      if (!saved.length) {
        if (window.hosaToast) window.hosaToast('⭐', 'No saved cards yet', 'Tap ☆ on any card (or press S) to save it here.', 'info');
        return;
      }
      var idx = 0, flipped = false;
      var ov = document.getElementById('hosa-saved-ov');
      if (!ov) { ov = document.createElement('div'); ov.id = 'hosa-saved-ov'; document.body.appendChild(ov); }
      ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9998;display:flex;align-items:center;justify-content:center;';

      function render() {
        var c = saved[idx];
        var pct = Math.round((idx + 1) / saved.length * 100);
        ov.innerHTML =
          '<div style="background:var(--bg-card,#1e1e1e);border-radius:20px;max-width:560px;width:92%;padding:26px 26px 22px;position:relative;box-shadow:0 24px 64px -16px rgba(0,0,0,0.7);">' +
            '<button id="_sv-x" style="position:absolute;top:14px;right:14px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--ink-soft,#888);line-height:1;padding:4px 8px;">✕</button>' +
            '<div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-faint,#555);margin-bottom:10px;">⭐ Saved Cards &nbsp;·&nbsp; ' + (idx+1) + ' of ' + saved.length + '</div>' +
            '<div style="height:3px;background:var(--rule,rgba(255,255,255,0.08));border-radius:2px;margin-bottom:18px;"><div style="height:3px;background:#fbbf24;border-radius:2px;width:' + pct + '%;transition:width 0.3s;"></div></div>' +
            '<div id="_sv-card" style="background:var(--bg-app,#141414);border-radius:14px;padding:28px 22px;min-height:120px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;margin-bottom:14px;">' +
              (flipped
                ? '<div style="font-size:15px;line-height:1.65;color:var(--ink-soft,#aaa);">' + esc(c.meaning) + '</div><div style="font-size:11px;color:var(--ink-faint,#555);margin-top:10px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Definition</div>'
                : '<div style="font-size:20px;font-weight:700;color:var(--ink,#f0f0f0);line-height:1.3;">' + esc(c.term) + '</div><div style="font-size:12px;color:var(--ink-faint,#555);margin-top:10px;">tap · space · ↓ to flip</div>'
              ) +
            '</div>' +
            '<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;">' +
              '<button id="_sv-rem" style="padding:9px 14px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:8px;cursor:pointer;font-family:inherit;font-size:13px;font-weight:600;">Remove ✕</button>' +
              '<div style="text-align:center;font-size:12px;color:var(--ink-faint,#555);">← → to navigate</div>' +
              '<button id="_sv-next" style="padding:9px 20px;background:var(--accent,#c8102e);border:1px solid transparent;color:#fff;border-radius:8px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;">' + (idx < saved.length - 1 ? 'Next →' : 'Done ✓') + '</button>' +
            '</div>' +
          '</div>';

        document.getElementById('_sv-card').addEventListener('click', function() { flipped = !flipped; render(); });
        document.getElementById('_sv-x').addEventListener('click', close);
        document.getElementById('_sv-rem').addEventListener('click', function() {
          saved.splice(idx, 1); setSaved(saved); refreshPill(); refreshSCBtn(); refreshStar();
          if (!saved.length) { close(); return; }
          if (idx >= saved.length) idx = saved.length - 1;
          flipped = false; render();
        });
        document.getElementById('_sv-next').addEventListener('click', function() {
          if (idx < saved.length - 1) { idx++; flipped = false; render(); } else close();
        });
      }

      function close() {
        ov.style.display = 'none';
        document.removeEventListener('keydown', onKey);
        refreshPill(); refreshSCBtn(); refreshStar();
      }
      function onKey(e) {
        if (ov.style.display === 'none') return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); flipped = !flipped; render(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); if (idx < saved.length-1) { idx++; flipped=false; render(); } else close(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); if (idx > 0) { idx--; flipped=false; render(); } }
      }
      document.addEventListener('keydown', onKey);
      ov.addEventListener('click', function(e) { if (e.target === ov) close(); });
      render();
    }

    window._hosaOpenSavedCards = openOverlay;

    /* Watch for card changes to update the star */
    function watchTerm() {
      var el = document.getElementById('flash-front-term');
      if (!el) return;
      new MutationObserver(refreshStar).observe(el, { childList: true, characterData: true, subtree: true });
    }

    /* Init */
    function init() {
      if (!document.getElementById('flashcard')) return;
      injectStar();
      injectPill();
      watchTerm();
      refreshStar(); refreshPill();
      // SC button: session-complete is always in DOM, inject once
      setTimeout(function() { injectSCBtn(); refreshSCBtn(); }, 800);
      // Re-check in case SC renders late
      var _t = setInterval(function() {
        injectSCBtn(); refreshSCBtn();
        if (document.getElementById('hosa-sc-saved-btn')) clearInterval(_t);
      }, 1000);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 700); });
    } else {
      setTimeout(init, 700);
    }
  })();

  /* Games launcher — floating button visible on every event page */
  (function() {
    if (document.getElementById('games-launcher')) return;
    // Don't show the floating Games launcher on the home page — it
    // overlaps the bottom nav / Feedback button. Home has its own
    // Games entry in the sidebar and command palette.
    var _pg = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
    if (_pg === '' || _pg === 'index') return;
    var wrap = document.createElement('div');
    wrap.id = 'games-launcher';
    wrap.innerHTML =
      '<button id="games-launcher-btn" type="button" aria-label="Open games menu">🎮 Games</button>' +
      '<div id="games-launcher-menu" hidden>' +
        '<a href="index.html?game=match">🧩 Match Game</a>' +
        '<a href="index.html?game=speed">⏱ Speed Drill</a>' +
        '<a href="index.html?game=typing">⌨️ Typing Challenge</a>' +
        '<a href="index.html?game=truefalse">🎯 True/False Blitz</a>' +
        '<a href="index.html?game=quickreview">⚡ Quick Review</a>' +
        '<a href="index.html">🏠 Back to Home</a>' +
      '</div>';
    document.body.appendChild(wrap);
    var btn = wrap.querySelector('#games-launcher-btn');
    var menu = wrap.querySelector('#games-launcher-menu');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      menu.hidden = !menu.hidden;
    });
    document.addEventListener('click', function(e) {
      if (!wrap.contains(e.target)) menu.hidden = true;
    });
  })();
})();
