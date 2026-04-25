"""
improve_flashcard_ux.py

Makes three focused UX improvements to all 16 study pages:

1. SESSION CAP (20 cards)
   buildSmartDeck now returns at most SESSION_SIZE cards.
   Users see "1 / 20" instead of "1 / 150" — no more intimidation.

2. SESSION COMPLETE SCREEN
   Instead of wrapping back to card 1, nextFlashcard() shows a
   "Session complete!" screen with got/missed stats and two buttons:
     • Study 20 more  →  rebuilds fresh deck, resets counters
     • Switch to quiz →  one-click to practice quiz tab

3. RATING HINT
   Tiny subtitle below the Got-it / Missed-it buttons:
   "Tap a card to reveal · Rate how well you knew it · Smart Review
    adjusts what comes next"
"""

import os, re

ROOT = r"C:\Users\iamtk\Downloads\correct-source"

STUDY_FILES = [
    'medical-terminology.html', 'pathophysiology.html', 'nutrition.html',
    'biochemistry.html', 'anatomy-physiology.html', 'pharmacology.html',
    'medical-math.html', 'medical-law-ethics.html', 'human-growth-development.html',
    'behavioral-health.html', 'clinical-nursing.html', 'public-health.html',
    'sports-medicine.html', 'biomedical-lab-science.html', 'biotechnology.html',
    'emergency-medical-science.html',
]

# ── 1. CSS additions ───────────────────────────────────────────────────────────
CSS_OLD = "  .rating-btns .got:hover { background: var(--success); color: var(--bg); border-color: var(--success); }"
CSS_NEW = """\
  .rating-btns .got:hover { background: var(--success); color: var(--bg); border-color: var(--success); }
  /* ── Rating hint ── */
  .rating-hint { text-align: center; font-size: 12px; color: var(--ink-faint); margin-top: 10px; letter-spacing: 0.02em; }
  /* ── Session complete ── */
  #session-complete { text-align: center; padding: 48px 20px 32px; }
  #session-complete .sc-icon { font-size: 44px; color: var(--success); margin-bottom: 12px; }
  #session-complete .sc-title { font-size: 22px; font-weight: 400; margin-bottom: 8px; }
  #session-complete .sc-sub { color: var(--ink-soft); font-size: 14px; margin-bottom: 28px; line-height: 1.6; max-width: 340px; margin-left: auto; margin-right: auto; }
  #session-complete .sc-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }"""

# ── 2. HTML additions — rating hint + session-complete div ────────────────────
HTML_OLD = """\
      <div class="card-controls">
        <button class="btn" id="flash-prev">← Previous</button>
        <div class="rating-btns">
          <button class="btn miss" id="flash-miss">Missed it</button>
          <button class="btn got" id="flash-got">Got it</button>
        </div>
        <button class="btn primary" id="flash-next">Next →</button>
      </div>
    </div>
  </section>"""

HTML_NEW = """\
      <div class="card-controls">
        <button class="btn" id="flash-prev">← Previous</button>
        <div class="rating-btns">
          <button class="btn miss" id="flash-miss">Missed it</button>
          <button class="btn got" id="flash-got">Got it</button>
        </div>
        <button class="btn primary" id="flash-next">Next →</button>
      </div>
      <p class="rating-hint">Tap a card to reveal &middot; "Got it" / "Missed it" train Smart Review &middot; your progress is saved automatically</p>
      <div id="session-complete" style="display:none">
        <div class="sc-icon">✓</div>
        <h3 class="sc-title">Session complete!</h3>
        <p id="sc-stats" class="sc-sub"></p>
        <div class="sc-btns">
          <button class="btn primary" id="sc-more">Study 20 more →</button>
          <button class="btn" id="sc-quiz">Switch to quiz →</button>
        </div>
      </div>
    </div>
  </section>"""

# ── 3. SESSION_SIZE constant ───────────────────────────────────────────────────
CONST_OLD = "const QUIZ_LENGTH = 10;"
CONST_NEW = "const SESSION_SIZE = 20; // cards shown per flashcard session\nconst QUIZ_LENGTH = 10;"

# ── 4. Session trackers + showSessionComplete ──────────────────────────────────
TRACKER_OLD = "function initFlashcards() {"
TRACKER_NEW = """\
let _sessGot = 0, _sessMissed = 0;

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
}

function initFlashcards() {"""

# ── 5. Cap buildSmartDeck — shuffle-only path ──────────────────────────────────
BD_SHUFFLE_OLD = "  if (!state.flash.srEnabled || pool.length === 0) return shuffle(pool);"
BD_SHUFFLE_NEW = "  if (!state.flash.srEnabled || pool.length === 0) return shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));"

# ── 6. Cap buildSmartDeck — weighted path return ───────────────────────────────
BD_RETURN_OLD = """\
  // Fallback if we couldn't fill (unusual): top off with random shuffle
  if (deck.length < deckSize) {
    const missing = pool.filter(c => !deck.includes(c));
    deck.push(...shuffle(missing).slice(0, deckSize - deck.length));
  }

  return deck;
}"""
BD_RETURN_NEW = """\
  // Fallback if we couldn't fill (unusual): top off with random shuffle
  if (deck.length < deckSize) {
    const missing = pool.filter(c => !deck.includes(c));
    deck.push(...shuffle(missing).slice(0, deckSize - deck.length));
  }

  return deck.slice(0, Math.min(SESSION_SIZE, deck.length));
}"""

# ── 7. nextFlashcard — show completion instead of wrapping ────────────────────
NF_OLD = """\
function nextFlashcard(dir) {
  const card = $('#flashcard');
  card.style.transition = 'transform 0.13s ease-in, opacity 0.13s ease-in';
  card.style.transform = dir > 0 ? 'translateX(-14px)' : 'translateX(14px)';
  card.style.opacity = '0';
  setTimeout(() => {
    card.classList.remove('flipped');
    const total = state.flash.deck.length;
    state.flash.index = (state.flash.index + dir + total) % total;
    renderFlashcard();
    card.style.transition = 'none';
    card.style.transform = dir > 0 ? 'translateX(14px)' : 'translateX(-14px)';
    card.offsetHeight;
    card.style.transition = 'transform 0.13s ease-out, opacity 0.13s ease-out';
    card.style.transform = 'translateX(0)';
    card.style.opacity = '1';
  }, 140);
}"""
NF_NEW = """\
function nextFlashcard(dir) {
  const total = state.flash.deck.length;
  if (dir > 0 && state.flash.index >= total - 1) { showSessionComplete(); return; }
  const card = $('#flashcard');
  card.style.transition = 'transform 0.13s ease-in, opacity 0.13s ease-in';
  card.style.transform = dir > 0 ? 'translateX(-14px)' : 'translateX(14px)';
  card.style.opacity = '0';
  setTimeout(() => {
    card.classList.remove('flipped');
    state.flash.index = Math.max(0, Math.min(state.flash.index + dir, total - 1));
    renderFlashcard();
    card.style.transition = 'none';
    card.style.transform = dir > 0 ? 'translateX(14px)' : 'translateX(-14px)';
    card.offsetHeight;
    card.style.transition = 'transform 0.13s ease-out, opacity 0.13s ease-out';
    card.style.transform = 'translateX(0)';
    card.style.opacity = '1';
  }, 140);
}"""

# ── 8. Got it / Missed it — increment session counters ───────────────────────
GOT_OLD = """\
  $('#flash-got').addEventListener('click', () => {
    const card = state.flash.deck[state.flash.index];
    state.progress.studied.add(card.term);
    state.progress.mastered.add(card.term);
    bumpSRLevel(card.term, 1);
    checkAndUpdateStreak();
    saveProgress();
    renderFlashcard(); // update level indicator before leaving
    nextFlashcard(1);
  });
  $('#flash-miss').addEventListener('click', () => {
    const card = state.flash.deck[state.flash.index];
    state.progress.studied.add(card.term);
    state.progress.mastered.delete(card.term);
    setSRLevel(card.term, 0); // reset fully when missed
    checkAndUpdateStreak();
    saveProgress();
    renderFlashcard();
    nextFlashcard(1);
  });"""
GOT_NEW = """\
  $('#flash-got').addEventListener('click', () => {
    const card = state.flash.deck[state.flash.index];
    state.progress.studied.add(card.term);
    state.progress.mastered.add(card.term);
    bumpSRLevel(card.term, 1);
    checkAndUpdateStreak();
    saveProgress();
    _sessGot++;
    renderFlashcard(); // update level indicator before leaving
    nextFlashcard(1);
  });
  $('#flash-miss').addEventListener('click', () => {
    const card = state.flash.deck[state.flash.index];
    state.progress.studied.add(card.term);
    state.progress.mastered.delete(card.term);
    setSRLevel(card.term, 0); // reset fully when missed
    checkAndUpdateStreak();
    saveProgress();
    _sessMissed++;
    renderFlashcard();
    nextFlashcard(1);
  });"""

# ── 9. Wire up session-complete buttons (add at end of initFlashcards) ────────
WIRE_OLD = """\
  $('#flashcard').addEventListener('click', () => {
    $('#flashcard').classList.toggle('flipped');
  });"""
WIRE_NEW = """\
  $('#flashcard').addEventListener('click', () => {
    $('#flashcard').classList.toggle('flipped');
  });

  document.getElementById('sc-more').addEventListener('click', () => {
    _sessGot = 0; _sessMissed = 0;
    state.flash.deck = buildSmartDeck(filterDeck(state.flash.filter));
    state.flash.index = 0;
    $('#flashcard').style.display = '';
    document.querySelector('.card-controls').style.display = '';
    document.getElementById('session-complete').style.display = 'none';
    renderFlashcard();
  });
  document.getElementById('sc-quiz').addEventListener('click', () => {
    _sessGot = 0; _sessMissed = 0;
    document.getElementById('session-complete').style.display = 'none';
    $('#flashcard').style.display = '';
    document.querySelector('.card-controls').style.display = '';
    document.querySelector('#tabs button[data-view="quiz"]').click();
  });"""

# ── Apply all patches ──────────────────────────────────────────────────────────
PATCHES = [
    ('CSS',          CSS_OLD,          CSS_NEW),
    ('HTML',         HTML_OLD,         HTML_NEW),
    ('SESSION_SIZE', CONST_OLD,        CONST_NEW),
    ('trackers+fn',  TRACKER_OLD,      TRACKER_NEW),
    ('bd-shuffle',   BD_SHUFFLE_OLD,   BD_SHUFFLE_NEW),
    ('bd-return',    BD_RETURN_OLD,    BD_RETURN_NEW),
    ('nextFC',       NF_OLD,           NF_NEW),
    ('got/miss',     GOT_OLD,          GOT_NEW),
    ('wire-sc',      WIRE_OLD,         WIRE_NEW),
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

    status = f"OK ({len(hits)}/9)"
    if misses:
        status = f"PARTIAL — MISS: {', '.join(misses)}"
    print(f"  {fn:45s}  {status}")

print("\nDone.")
