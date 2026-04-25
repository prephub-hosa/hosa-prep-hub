"""
improve_all.py  —  comprehensive UX pass on all 16 study pages

Changes per page
────────────────
1.  CSS  — deck-progress counter + know-it-btn styles
2.  HTML — "X / Y terms introduced" line above the flashcard
3.  HTML — "★ Already know this" skip button on card front
4.  HTML — deck-progress paragraph in session-complete screen
5.  HTML — update Smart Review tooltip text (no longer resets to 0)
6.  JS   — fix missed-it: drop 2 SR levels instead of full reset to 0
7.  JS   — fix quiz/test wrong: drop 1 SR level instead of reset to 0
8.  JS   — skipKnown() function (sets SR level 5, advances card)
9.  JS   — renderFlashcard() updates the deck-progress counter
10. JS   — showSessionComplete() shows deck % + dynamic button label
11. JS   — wire know-it button inside initFlashcards
12. JS   — first-time onboarding modal (localStorage flag hosa-onboarded-v1)
"""

import os

ROOT = r"C:\Users\iamtk\Downloads\correct-source"

STUDY_FILES = [
    'medical-terminology.html', 'pathophysiology.html', 'nutrition.html',
    'biochemistry.html', 'anatomy-physiology.html', 'pharmacology.html',
    'medical-math.html', 'medical-law-ethics.html', 'human-growth-development.html',
    'behavioral-health.html', 'clinical-nursing.html', 'public-health.html',
    'sports-medicine.html', 'biomedical-lab-science.html', 'biotechnology.html',
    'emergency-medical-science.html',
]

# ═══════════════════════════════════════════════════════════════════════════════
# 1. CSS
# ═══════════════════════════════════════════════════════════════════════════════
CSS_OLD = "  /* ── Rating hint ── */\n  .rating-hint {"

CSS_NEW = """\
  /* ── Deck progress line ── */
  .deck-progress-line {
    text-align: center; font-size: 12px; color: var(--ink-faint);
    margin: -4px 0 14px; letter-spacing: 0.03em;
  }
  /* ── Know-it skip button ── */
  .know-it-btn {
    display: inline-block; margin-top: 10px;
    background: none; border: 1px solid var(--ink-faint);
    color: var(--ink-faint); font-size: 11px; padding: 4px 12px;
    border-radius: 20px; cursor: pointer; font-family: Georgia, serif;
    letter-spacing: 0.04em; transition: color 0.15s, border-color 0.15s;
  }
  .know-it-btn:hover { border-color: var(--success); color: var(--success); }
  /* ── Rating hint ── */
  .rating-hint {"""

# ═══════════════════════════════════════════════════════════════════════════════
# 2. HTML — deck-progress line before flashcard div
# ═══════════════════════════════════════════════════════════════════════════════
DECKP_OLD = '      <div class="flashcard" id="flashcard">'
DECKP_NEW = '''\
      <p id="deck-progress" class="deck-progress-line"></p>
      <div class="flashcard" id="flashcard">'''

# ═══════════════════════════════════════════════════════════════════════════════
# 3. HTML — know-it button inside card front face
# ═══════════════════════════════════════════════════════════════════════════════
KNOWIT_OLD = '            <div class="flip-hint">↻ tap to reveal</div>'
KNOWIT_NEW = '''\
            <div class="flip-hint">↻ tap to reveal</div>
            <button class="know-it-btn" id="flash-know-it" title="Mark as already known — jumps to SR level 5">★ Already know this</button>'''

# ═══════════════════════════════════════════════════════════════════════════════
# 4. HTML — deck-progress paragraph in session-complete
# ═══════════════════════════════════════════════════════════════════════════════
SCD_OLD = '        <p id="sc-stats" class="sc-sub"></p>\n        <div class="sc-btns">'
SCD_NEW = '''\
        <p id="sc-stats" class="sc-sub"></p>
        <p id="sc-deck-progress" class="sc-sub" style="margin-top:0;opacity:0.75;font-size:13px;"></p>
        <div class="sc-btns">'''

# ═══════════════════════════════════════════════════════════════════════════════
# 5. HTML — update Smart Review tooltip (no longer resets to zero)
# ═══════════════════════════════════════════════════════════════════════════════
SRINFO_OLD = '<strong>Smart Review</strong> prioritizes cards you\'re weak on and reduces cards you\'ve mastered. The five dots (○ through ●) show your mastery level for each card — "Got it" fills one in, "Missed it" resets to zero. Turn this off to see every card in a single random pass instead.'
SRINFO_NEW = '<strong>Smart Review</strong> prioritizes cards you\'re weak on and reduces cards you\'ve mastered. The five dots (○ through ●) show your mastery level — "Got it" adds a dot, "Missed it" drops two. New terms mix in each session until you\'ve seen the full deck. Turn off for a plain shuffle.'

# ═══════════════════════════════════════════════════════════════════════════════
# 6. JS — fix missed-it flashcard (drop 2 SR levels, not full reset)
# ═══════════════════════════════════════════════════════════════════════════════
MISS0_OLD = "    setSRLevel(card.term, 0); // reset fully when missed"
MISS0_NEW = "    setSRLevel(card.term, Math.max(0, getSRLevel(card.term) - 2)); // drop 2 levels when missed"

# biotech / EMS variant (no comment on same line)
MISS0B_OLD = "    setSRLevel(card.term, 0);\n    checkAndUpdateStreak();"
MISS0B_NEW = "    setSRLevel(card.term, Math.max(0, getSRLevel(card.term) - 2));\n    checkAndUpdateStreak();"

# EMS variant (uses updateStreak, not checkAndUpdateStreak)
MISS0C_OLD = "  setSRLevel(card.term, 0);\n  if (!state.progress.lastMissed)"
MISS0C_NEW = "  setSRLevel(card.term, Math.max(0, getSRLevel(card.term) - 2));\n  if (!state.progress.lastMissed)"

# ═══════════════════════════════════════════════════════════════════════════════
# 7. JS — fix quiz / test wrong answer (drop 1 SR level)
# ═══════════════════════════════════════════════════════════════════════════════
QUIZ0_OLD = "    setSRLevel(correct.term, 0);"
QUIZ0_NEW = "    setSRLevel(correct.term, Math.max(0, getSRLevel(correct.term) - 1));"

# ═══════════════════════════════════════════════════════════════════════════════
# 8 + 9. JS — skipKnown() + renderFlashcard deck-progress update
#   Injected before the existing showSessionComplete function
# ═══════════════════════════════════════════════════════════════════════════════
SKIP_OLD = "function showSessionComplete() {"
SKIP_NEW = """\
function skipKnown() {
  const card = state.flash.deck[state.flash.index];
  if (!card) return;
  state.progress.studied.add(card.term);
  state.progress.mastered.add(card.term);
  setSRLevel(card.term, 5); // max mastery — already knew this
  saveProgress();
  nextFlashcard(1);
}

function showSessionComplete() {"""

# ═══════════════════════════════════════════════════════════════════════════════
# 10. JS — enhanced showSessionComplete
# ═══════════════════════════════════════════════════════════════════════════════
SC_OLD = """\
function showSessionComplete() {
  const rated = _sessGot + _sessMissed;
  let msg = rated > 0
    ? `You rated ${rated} card${rated !== 1 ? 's' : ''} — ${_sessGot} got it, ${_sessMissed} missed.`
    : 'You reached the end of this session.';
  if (_sessGot > _sessMissed && rated > 0) msg += ' Great work!';
  else if (_sessMissed > 0 && rated > 0) msg += ' Keep at it — practice makes perfect.';
  document.getElementById('sc-stats').textContent = msg;
  $('#flashcard').style.display = 'none';
  document.querySelector('.card-controls').style.display = 'none';
  document.getElementById('session-complete').style.display = '';
}"""

SC_NEW = """\
function showSessionComplete() {
  const rated = _sessGot + _sessMissed;
  let msg = rated > 0
    ? `You rated ${rated} card${rated !== 1 ? 's' : ''} — ${_sessGot} got it, ${_sessMissed} missed.`
    : 'You reached the end of this session.';
  if (_sessGot > _sessMissed && rated > 0) msg += ' Great work!';
  else if (_sessMissed > 0 && rated > 0) msg += ' Keep at it!';
  document.getElementById('sc-stats').textContent = msg;

  try {
    const pool       = filterDeck(state.flash.filter);
    const introduced = pool.filter(c => state.progress.studied.has(c.term)).length;
    const allSeen    = introduced >= pool.length;
    const pct        = Math.round(introduced / pool.length * 100);
    const dpEl = document.getElementById('sc-deck-progress');
    if (dpEl) dpEl.textContent = allSeen
      ? `You've now seen all ${pool.length} terms! Switch to the quiz to test yourself.`
      : `${introduced} of ${pool.length} terms introduced (${pct}%) — keep going to unlock the rest.`;
    const moreBtn = document.getElementById('sc-more');
    if (moreBtn) moreBtn.textContent = allSeen
      ? 'Review weak cards →'
      : `Continue (${pool.length - introduced} new terms left) →`;
  } catch(e) {}

  $('#flashcard').style.display = 'none';
  document.querySelector('.card-controls').style.display = 'none';
  document.getElementById('session-complete').style.display = '';
}"""

# ═══════════════════════════════════════════════════════════════════════════════
# 11. JS — renderFlashcard: update deck-progress counter on each card
# ═══════════════════════════════════════════════════════════════════════════════
RENDER_OLD = "  $('#flash-progress').textContent = `${pad(state.flash.index + 1)} / ${pad(state.flash.deck.length)}`;"
RENDER_NEW = """\
  $('#flash-progress').textContent = `${pad(state.flash.index + 1)} / ${pad(state.flash.deck.length)}`;
  try { const _p=filterDeck(state.flash.filter),_s=_p.filter(c=>state.progress.studied.has(c.term)).length,_el=document.getElementById('deck-progress'); if(_el)_el.textContent=_s+' / '+_p.length+' terms introduced'; } catch(e) {}"""

# ═══════════════════════════════════════════════════════════════════════════════
# 12. JS — wire know-it button inside initFlashcards
#   Insert right after the existing flashcard click listener
# ═══════════════════════════════════════════════════════════════════════════════
WIRE_OLD = "  $('#flashcard').addEventListener('click', () => {\n    $('#flashcard').classList.toggle('flipped');\n  });"
WIRE_NEW = """\
  $('#flashcard').addEventListener('click', () => {
    $('#flashcard').classList.toggle('flipped');
  });
  const _kiBtn = document.getElementById('flash-know-it');
  if (_kiBtn) _kiBtn.addEventListener('click', e => { e.stopPropagation(); skipKnown(); });"""

# Single-line variant (biotech/EMS)
WIRE_OLD2 = "  $('#flashcard').addEventListener('click', () => { $('#flashcard').classList.toggle('flipped'); });"
WIRE_NEW2 = """\
  $('#flashcard').addEventListener('click', () => { $('#flashcard').classList.toggle('flipped'); });
  const _kiBtn = document.getElementById('flash-know-it');
  if (_kiBtn) _kiBtn.addEventListener('click', e => { e.stopPropagation(); skipKnown(); });"""

# EMS variant (uses document.getElementById directly)
WIRE_OLD3 = "document.getElementById('flashcard').addEventListener('click', () => {\n  document.getElementById('flashcard').classList.toggle('flipped');\n});"
WIRE_NEW3 = """\
document.getElementById('flashcard').addEventListener('click', () => {
  document.getElementById('flashcard').classList.toggle('flipped');
});
(function(){ const _ki=document.getElementById('flash-know-it'); if(_ki) _ki.addEventListener('click',e=>{e.stopPropagation();skipKnown();}); })();"""

# ═══════════════════════════════════════════════════════════════════════════════
# 13. JS — first-time onboarding modal (injected before dark-mode-toggle script)
# ═══════════════════════════════════════════════════════════════════════════════
ONBOARD_OLD = '<script id="dark-mode-toggle">'
ONBOARD_NEW = '''\
<script id="onboarding">
(function(){
  if(localStorage.getItem('hosa-onboarded-v1')) return;
  var s=document.createElement('style');
  s.textContent=[
    '#ob-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;}',
    '#ob-box{background:var(--bg);border:1px solid var(--border);max-width:420px;width:100%;padding:36px 32px 28px;}',
    '#ob-box h2{font-size:19px;font-weight:400;margin-bottom:22px;letter-spacing:-0.01em;}',
    '.ob-step{display:flex;gap:14px;margin-bottom:15px;align-items:flex-start;}',
    '.ob-icon{font-size:20px;flex-shrink:0;width:26px;text-align:center;margin-top:1px;}',
    '.ob-text{font-size:13px;line-height:1.55;color:var(--ink-soft);}',
    '.ob-text strong{color:var(--ink);}',
    '#ob-start{margin-top:26px;width:100%;padding:13px;background:var(--accent);color:#fff;border:none;font-family:Georgia,serif;font-size:15px;cursor:pointer;letter-spacing:0.01em;}',
    '#ob-start:hover{opacity:0.88;}',
  ].join('');
  document.head.appendChild(s);
  var el=document.createElement('div');
  el.id='ob-overlay';
  el.innerHTML='<div id="ob-box">'
    +'<h2>Welcome to HOSA Prep Hub ✢</h2>'
    +'<div class="ob-step"><div class="ob-icon">🃏</div><div class="ob-text"><strong>Tap a card to flip it</strong> — term on the front, definition on the back.</div></div>'
    +'<div class="ob-step"><div class="ob-icon">✓ ✗</div><div class="ob-text"><strong>Rate yourself honestly</strong> — "Got it" or "Missed it" teaches Smart Review which cards to bring back sooner.</div></div>'
    +'<div class="ob-step"><div class="ob-icon">📊</div><div class="ob-text"><strong>20 cards per session</strong> — a mix of new terms and review cards. You\'ll work through the full deck over multiple sessions.</div></div>'
    +'<div class="ob-step"><div class="ob-icon">★</div><div class="ob-text"><strong>Already know a term?</strong> Hit "Already know this" on any card to skip it straight to mastered.</div></div>'
    +'<div class="ob-step"><div class="ob-icon">☁</div><div class="ob-text"><strong>Progress saves automatically</strong> — sign in to sync across devices, or study as a guest.</div></div>'
    +'<button id="ob-start">Got it — start studying!</button>'
    +'</div>';
  document.body.appendChild(el);
  document.getElementById('ob-start').addEventListener('click',function(){
    el.remove(); localStorage.setItem('hosa-onboarded-v1','1');
  });
})();
</script>
<script id="dark-mode-toggle">'''

# ═══════════════════════════════════════════════════════════════════════════════
# APPLY
# ═══════════════════════════════════════════════════════════════════════════════
PATCHES = [
    ('css',           CSS_OLD,       CSS_NEW),
    ('deck-p html',   DECKP_OLD,     DECKP_NEW),
    ('know-it html',  KNOWIT_OLD,    KNOWIT_NEW),
    ('sc-deck html',  SCD_OLD,       SCD_NEW),
    ('sr-info text',  SRINFO_OLD,    SRINFO_NEW),
    ('miss drop2',    MISS0_OLD,     MISS0_NEW),
    ('miss drop2b',   MISS0B_OLD,    MISS0B_NEW),
    ('miss drop2c',   MISS0C_OLD,    MISS0C_NEW),
    ('quiz drop1',    QUIZ0_OLD,     QUIZ0_NEW),
    ('skipKnown fn',  SKIP_OLD,      SKIP_NEW),
    ('sc enhanced',   SC_OLD,        SC_NEW),
    ('render+dp',     RENDER_OLD,    RENDER_NEW),
    ('wire know-it',  WIRE_OLD,      WIRE_NEW),
    ('wire ki2',      WIRE_OLD2,     WIRE_NEW2),
    ('wire ki3',      WIRE_OLD3,     WIRE_NEW3),
    ('onboarding',    ONBOARD_OLD,   ONBOARD_NEW),
]

for fn in STUDY_FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    hits, misses = [], []
    for label, old, new in PATCHES:
        if old in content:
            content = content.replace(old, new, 1)
            hits.append(label)
        else:
            misses.append(label)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

    essential = {'css','deck-p html','know-it html','sc-deck html','miss drop2','quiz drop1',
                 'skipKnown fn','sc enhanced','render+dp','onboarding'}
    missed_essential = [m for m in misses if m in essential]
    if missed_essential:
        print(f"  WARN {fn:45s}  missing: {missed_essential}")
    else:
        print(f"  OK   {fn}")

print("\nDone.")
