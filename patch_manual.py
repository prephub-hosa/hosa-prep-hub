#!/usr/bin/env python3
"""Patch 17 HTML files to add cram mode, daily goal ring, and streak badges."""

import os, sys

BASE = '/home/user/hosa-prep-hub'

FILES = [
    'behavioral-health.html',
    'anatomy-physiology.html',
    'biochemistry.html',
    'biotechnology.html',
    'biomedical-lab-science.html',
    'emergency-medical-science.html',
    'clinical-nursing.html',
    'human-growth-development.html',
    'medical-law-ethics.html',
    'medical-math.html',
    'medical-terminology.html',
    'nutrition.html',
    'pharmacology.html',
    'pathophysiology.html',
    'physical-therapy.html',
    'public-health.html',
    'sports-medicine.html',
]

# ── CSS: old → new ──────────────────────────────────────────────────────────
OLD_CSS = '''  /* ── Deck progress line ── */
  .deck-progress-line {
    text-align: center; font-size: 12px; color: var(--ink-faint);
    margin: -4px 0 14px; letter-spacing: 0.03em;
  }'''

NEW_CSS = '''  /* ── Deck progress line + cram row ── */
  .deck-progress-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 20px; margin: -4px 0 14px; }
  .deck-progress-line {
    text-align: left; font-size: 12px; color: var(--ink-faint);
    margin: 0; letter-spacing: 0.03em; flex: 1;
  }
  .cram-btn { padding: 3px 9px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; font-variant: small-caps; font-family: 'Cormorant Garamond',serif; border: 1px solid #c08040; color: #c08040; background: transparent; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .cram-btn:hover { background: #c08040; color: var(--bg); }
  .cram-btn.active { background: #c08040; color: var(--bg); }
  .sess-timer-display { font-family: 'Fraunces',serif; font-size: 12px; color: var(--ink-soft); letter-spacing: 0.01em; white-space: nowrap; display: none; }
  /* ── Daily goal ring ── */
  .goal-section { margin-bottom: 40px; }
  .goal-ring-wrap { display: flex; align-items: center; gap: 24px; margin-bottom: 14px; }
  .goal-ring-svg { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
  .goal-ring-svg svg { width: 72px; height: 72px; transform: rotate(-90deg); display: block; }
  .goal-ring-track { fill: none; stroke: var(--rule); stroke-width: 7; }
  .goal-ring-fill { fill: none; stroke: var(--accent); stroke-width: 7; stroke-linecap: round; transition: stroke-dashoffset 0.6s ease; }
  .goal-ring-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .goal-ring-num { font-family: 'Fraunces',serif; font-size: 18px; font-weight: 600; line-height: 1; color: var(--ink); }
  .goal-ring-sub { font-family: 'Cormorant Garamond',serif; font-size: 10px; letter-spacing: 0.06em; font-variant: small-caps; color: var(--ink-faint); }
  .goal-ring-meta h4 { font-family: 'Fraunces',serif; font-size: 18px; font-weight: 400; letter-spacing: -0.02em; margin: 0 0 4px; }
  .goal-ring-meta p { font-family: 'Source Serif 4',Georgia,serif; font-size: 13px; color: var(--ink-soft); margin: 0 0 10px; }
  .goal-adj { display: flex; align-items: center; gap: 8px; }
  .goal-adj-btn { border: 1px solid var(--rule); background: transparent; color: var(--ink); width: 24px; height: 24px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; line-height: 1; padding: 0; transition: border-color 0.15s; }
  .goal-adj-btn:hover { border-color: var(--ink); }
  .goal-adj-val { font-family: 'Fraunces',serif; font-size: 14px; min-width: 60px; color: var(--ink); }
  /* ── Milestone streak badges ── */
  .milestone-badges { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
  .ms-badge { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--rule); font-family: 'Cormorant Garamond',serif; font-size: 12px; letter-spacing: 0.06em; font-variant: small-caps; color: var(--ink-faint); transition: border-color 0.3s, color 0.3s; }
  .ms-badge.earned { color: var(--ink); border-color: var(--accent); }
  .ms-badge-icon { font-size: 14px; filter: grayscale(1); opacity: 0.4; transition: filter 0.3s, opacity 0.3s; }
  .ms-badge.earned .ms-badge-icon { filter: none; opacity: 1; }'''

# ── HTML: deck-progress-line → deck-progress-row ────────────────────────────
OLD_DECK_PROGRESS_HTML = '      <p id="deck-progress" class="deck-progress-line"></p>'
NEW_DECK_PROGRESS_HTML = '''      <div class="deck-progress-row">
        <p id="deck-progress" class="deck-progress-line"></p>
        <span class="sess-timer-display" id="sess-timer"></span>
        <button class="cram-btn" id="cram-btn" title="Study only cards due today">⚡ Cram</button>
      </div>'''

# ── HTML: goal-section + heatmap-wrap to insert before mastery-section ───────
GOAL_AND_HEATMAP_HTML = '''    <div class="goal-section">
      <h3 style="font-family:'Fraunces',serif;font-size:20px;font-weight:400;letter-spacing:-0.02em;margin-bottom:6px;">Daily Goal</h3>
      <div class="section-sub" style="margin-bottom:16px;">Cards reviewed today vs. your goal</div>
      <div class="goal-ring-wrap">
        <div class="goal-ring-svg">
          <svg viewBox="0 0 72 72">
            <circle class="goal-ring-track" cx="36" cy="36" r="31"/>
            <circle class="goal-ring-fill" id="goal-ring-fill" cx="36" cy="36" r="31" stroke-dasharray="194.78" stroke-dashoffset="194.78"/>
          </svg>
          <div class="goal-ring-inner">
            <span class="goal-ring-num" id="goal-done">0</span>
            <span class="goal-ring-sub">today</span>
          </div>
        </div>
        <div class="goal-ring-meta">
          <h4 style="font-family:'Fraunces',serif;font-size:18px;font-weight:400;letter-spacing:-0.02em;margin:0 0 4px;">Set your daily target</h4>
          <p style="font-family:'Source Serif 4',Georgia,serif;font-size:13px;color:var(--ink-soft);margin:0 0 10px;">Adjust in increments of 5 cards</p>
          <div class="goal-adj">
            <button class="goal-adj-btn" id="goal-dec">−</button>
            <span class="goal-adj-val"><span id="goal-target">20</span> cards</span>
            <button class="goal-adj-btn" id="goal-inc">+</button>
          </div>
        </div>
      </div>
      <div class="milestone-badges" id="milestone-badges">
        <div class="ms-badge" data-days="7"><span class="ms-badge-icon">🥉</span> 7-day streak</div>
        <div class="ms-badge" data-days="30"><span class="ms-badge-icon">🥈</span> 30-day streak</div>
        <div class="ms-badge" data-days="100"><span class="ms-badge-icon">🥇</span> 100-day streak</div>
      </div>
    </div>

    <div class="heatmap-wrap">
      <h3 style="font-family:'Fraunces',serif;font-size:20px;font-weight:400;letter-spacing:-0.02em;margin-bottom:6px;">Study Activity</h3>
      <div class="section-sub" style="margin-bottom:16px;">Last 28 days</div>
      <div class="hm-label-row" id="hm-label-row"></div>
      <div class="heatmap-grid" id="heatmap-grid"></div>
    </div>

    '''

OLD_MASTERY_ANCHOR = '    <div class="mastery-section" style="margin-bottom:32px">'
NEW_MASTERY_ANCHOR = GOAL_AND_HEATMAP_HTML + '<div class="mastery-section" style="margin-bottom:32px">'

# ── JS: daily goal tracking in rateCard (Type B files) ──────────────────────
# These files have: if (typeof renderFlashcard === 'function') renderFlashcard();\n  nextFlashcard(1);\n}
OLD_RATECARDEND_B = '''  if (typeof renderFlashcard === 'function') renderFlashcard();
  nextFlashcard(1);
}
document.getElementById('flash-again').addEventListener('click', () => rateCard(0));
document.getElementById('flash-hard').addEventListener('click',  () => rateCard(2));
document.getElementById('flash-good').addEventListener('click',  () => rateCard(4));
document.getElementById('flash-easy').addEventListener('click',  () => rateCard(5));'''

NEW_RATECARDEND_B = '''  if (typeof renderFlashcard === 'function') renderFlashcard();
  // Track daily goal progress
  try {
    _dailyDone++;
    const _dk = 'hosa::daily::' + (typeof getTodayStr==='function'?getTodayStr():new Date().toISOString().slice(0,10));
    localStorage.setItem(_dk, _dailyDone);
    updateGoalRing();
  } catch(e) {}
  nextFlashcard(1);
}
document.getElementById('flash-again').addEventListener('click', () => rateCard(0));
document.getElementById('flash-hard').addEventListener('click',  () => rateCard(2));
document.getElementById('flash-good').addEventListener('click',  () => rateCard(4));
document.getElementById('flash-easy').addEventListener('click',  () => rateCard(5));'''

# ── JS: daily goal tracking in rateCard (Type A files) ──────────────────────
# These files have: } catch(e) {}\n  nextFlashcard(1);\n}  (no renderFlashcard check)
OLD_RATECARDEND_A = '''  } catch(e) {}
  nextFlashcard(1);
}
document.getElementById('flash-again').addEventListener('click', () => rateCard(0));
document.getElementById('flash-hard').addEventListener('click',  () => rateCard(2));
document.getElementById('flash-good').addEventListener('click',  () => rateCard(4));
document.getElementById('flash-easy').addEventListener('click',  () => rateCard(5));'''

NEW_RATECARDEND_A = '''  } catch(e) {}
  // Track daily goal progress
  try {
    _dailyDone++;
    const _dk = 'hosa::daily::' + (typeof getTodayStr==='function'?getTodayStr():new Date().toISOString().slice(0,10));
    localStorage.setItem(_dk, _dailyDone);
    updateGoalRing();
  } catch(e) {}
  nextFlashcard(1);
}
document.getElementById('flash-again').addEventListener('click', () => rateCard(0));
document.getElementById('flash-hard').addEventListener('click',  () => rateCard(2));
document.getElementById('flash-good').addEventListener('click',  () => rateCard(4));
document.getElementById('flash-easy').addEventListener('click',  () => rateCard(5));'''

# ── JS: cram mode + daily goal ring block ────────────────────────────────────
# For Type B files: inserted after the flash event handlers (which end with }catch(e){})
# We insert before the sc-more handler (but different files have it differently)
# The safest anchor: after the 4 addEventListener lines, before whatever comes next.
# The 4 listeners always end with:
#   document.getElementById('flash-easy').addEventListener('click',  () => rateCard(5));

CRAM_AND_GOAL_JS = '''

// ── Cram mode ─────────────────────────────────────────────────
let _cramMode = false, _cramInterval = null;
function startCramMode() {
  const today = typeof getTodayStr==='function' ? getTodayStr() : new Date().toISOString().slice(0,10);
  const pool = filterDeck(state.flash.filter);
  const due = pool.filter(c => state.progress.studied.has(c.term) && getSRData(c.term).due <= today);
  const cramBtn = document.getElementById('cram-btn');
  if (due.length === 0) {
    if (cramBtn) { cramBtn.textContent = '✓ All caught up!'; setTimeout(()=>{ cramBtn.textContent='⚡ Cram'; },2500); }
    return;
  }
  _cramMode = true;
  if (cramBtn) { cramBtn.classList.add('active'); cramBtn.textContent = '✗ Exit Cram'; }
  const timerEl = document.getElementById('sess-timer');
  if (timerEl) timerEl.style.display = '';
  const _start = Date.now();
  clearInterval(_cramInterval);
  _cramInterval = setInterval(() => {
    if (!_cramMode) { clearInterval(_cramInterval); return; }
    const s = Math.floor((Date.now()-_start)/1000);
    if (timerEl) timerEl.textContent = Math.floor(s/60).toString().padStart(2,'0')+':'+String(s%60).padStart(2,'0');
  }, 1000);
  state.flash.deck = (typeof shuffle==='function' ? shuffle(due) : due);
  state.flash.index = 0;
  document.getElementById('flashcard').style.display = '';
  document.querySelector('.card-controls').style.display = '';
  document.getElementById('session-complete').style.display = 'none';
  renderFlashcard();
}
function exitCramMode() {
  _cramMode = false;
  clearInterval(_cramInterval);
  const timerEl = document.getElementById('sess-timer');
  if (timerEl) { timerEl.style.display = 'none'; timerEl.textContent = ''; }
  const cramBtn = document.getElementById('cram-btn');
  if (cramBtn) { cramBtn.classList.remove('active'); cramBtn.textContent = '⚡ Cram'; }
}
document.getElementById('cram-btn')?.addEventListener('click', () => { _cramMode ? exitCramMode() : startCramMode(); });

// ── Daily goal ring ───────────────────────────────────────────
const GOAL_STORAGE = 'hosa::daily-goal';
let _dailyGoal = parseInt(localStorage.getItem(GOAL_STORAGE)||'20', 10);
const _todayKey = 'hosa::daily::' + (typeof getTodayStr==='function' ? getTodayStr() : new Date().toISOString().slice(0,10));
let _dailyDone  = parseInt(localStorage.getItem(_todayKey)||'0', 10);

function updateGoalRing() {
  try {
    const fill = document.getElementById('goal-ring-fill');
    const doneEl = document.getElementById('goal-done');
    const targetEl = document.getElementById('goal-target');
    if (!fill) return;
    const circ = 2 * Math.PI * 31; // 194.78
    const pct = Math.min(1, _dailyDone / Math.max(1, _dailyGoal));
    fill.style.strokeDashoffset = circ * (1 - pct);
    if (doneEl) doneEl.textContent = _dailyDone;
    if (targetEl) targetEl.textContent = _dailyGoal;
  } catch(e) {}
}
document.getElementById('goal-inc')?.addEventListener('click', () => {
  _dailyGoal = Math.min(100, _dailyGoal + 5);
  localStorage.setItem(GOAL_STORAGE, _dailyGoal);
  updateGoalRing();
});
document.getElementById('goal-dec')?.addEventListener('click', () => {
  _dailyGoal = Math.max(5, _dailyGoal - 5);
  localStorage.setItem(GOAL_STORAGE, _dailyGoal);
  updateGoalRing();
});'''

# ── JS: renderProgress() additions ───────────────────────────────────────────
OLD_RENDER_HEATMAP = '  renderHeatmap();\n}'
NEW_RENDER_HEATMAP = '''  renderHeatmap();
  updateGoalRing();
  // Milestone streak badges
  try {
    const streak = state.progress.streak || 0;
    document.querySelectorAll('#milestone-badges .ms-badge').forEach(b => {
      b.classList.toggle('earned', streak >= parseInt(b.getAttribute('data-days'),10));
    });
  } catch(e) {}
}'''

def patch_file(fname, is_type_a):
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html
    errors = []

    # 1. CSS replacement
    if OLD_CSS in html:
        html = html.replace(OLD_CSS, NEW_CSS, 1)
    else:
        errors.append('CSS: old pattern not found')

    # 2. HTML: deck-progress-line → deck-progress-row
    if OLD_DECK_PROGRESS_HTML in html:
        html = html.replace(OLD_DECK_PROGRESS_HTML, NEW_DECK_PROGRESS_HTML, 1)
    else:
        errors.append('HTML deck-progress: old pattern not found')

    # 3. HTML: insert goal-section + heatmap-wrap before mastery-section
    if OLD_MASTERY_ANCHOR in html:
        html = html.replace(OLD_MASTERY_ANCHOR, NEW_MASTERY_ANCHOR, 1)
    else:
        errors.append('HTML mastery anchor: old pattern not found')

    # 4. JS: add daily goal tracking to rateCard
    if is_type_a:
        if OLD_RATECARDEND_A in html:
            html = html.replace(OLD_RATECARDEND_A, NEW_RATECARDEND_A, 1)
        else:
            errors.append('JS rateCard (Type A): old pattern not found')
    else:
        if OLD_RATECARDEND_B in html:
            html = html.replace(OLD_RATECARDEND_B, NEW_RATECARDEND_B, 1)
        else:
            errors.append('JS rateCard (Type B): old pattern not found')

    # 5. JS: insert cram mode + daily goal ring block
    # Find the 4 flash-easy listener line, then insert after it
    # But for Type B files there's }catch(e){} after; for Type A there's a blank line then sc-more
    # We key off the end of the 4 listener block specifically
    flash_easy_line = "document.getElementById('flash-easy').addEventListener('click',  () => rateCard(5));"
    if flash_easy_line in html:
        # Find the last occurrence of flash-easy in the rateCard handlers context
        idx = html.find(flash_easy_line)
        # Insert CRAM_AND_GOAL_JS right after this line
        insert_pos = idx + len(flash_easy_line)
        html = html[:insert_pos] + CRAM_AND_GOAL_JS + html[insert_pos:]
    else:
        errors.append('JS flash-easy listener: pattern not found')

    # 6. JS: renderProgress() - add updateGoalRing + milestone badges after renderHeatmap()
    # We need to find renderHeatmap(); followed by } (end of renderProgress)
    # But OLD_RENDER_HEATMAP might match multiple times - let's be careful
    # Count occurrences
    count = html.count(OLD_RENDER_HEATMAP)
    if count == 1:
        html = html.replace(OLD_RENDER_HEATMAP, NEW_RENDER_HEATMAP, 1)
    elif count > 1:
        # Find the one inside renderProgress function
        # renderProgress function contains renderHeatmap() at its end
        # We'll replace only the first occurrence (which should be in renderProgress)
        html = html.replace(OLD_RENDER_HEATMAP, NEW_RENDER_HEATMAP, 1)
    else:
        errors.append('JS renderHeatmap: old pattern not found')

    if errors:
        print(f'ERRORS in {fname}:')
        for e in errors:
            print(f'  - {e}')
        return False
    else:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'OK: {fname}')
        return True

TYPE_A = {'emergency-medical-science.html', 'physical-therapy.html'}

success = 0
fail = 0
for fname in FILES:
    is_a = fname in TYPE_A
    ok = patch_file(fname, is_a)
    if ok:
        success += 1
    else:
        fail += 1

print(f'\nDone: {success} OK, {fail} failed')
