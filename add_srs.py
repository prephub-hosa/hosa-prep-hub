"""
add_srs.py — adds true spaced repetition to all 16 study pages.

How it works
────────────
Current system: SR levels 0-5 used as weights in random selection.
                Cards with low levels appear more often — but no scheduling.

New system (SM-2 inspired):
  - Each card gets an interval (days) and a due date.
  - "Got it" → interval grows (1 → 4 → ~10 → ~25 → ... days).
    Easiness factor also grows slightly so cards get spaced further apart.
  - "Missed it" → interval resets to 1 day, easiness drops.
  - buildSmartDeck() now picks: (1) due/overdue cards, (2) new cards,
    (3) future cards only to fill remaining space.
  - Deck-progress line shows "· 5 due today" when cards are waiting.
  - Migration: existing srLevels (0-5) auto-convert to srData on first load.

Strategy: inject a <script id="srs-engine"> block right before the
existing <script id="onboarding"> block. JS function redefinitions in
later script tags override earlier ones — so we override getSRLevel,
buildSmartDeck etc. without touching the original definitions.
Then apply targeted surgical patches for state/save/load/call-sites.
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
# SRS ENGINE SCRIPT BLOCK — injected before <script id="onboarding">
# ═══════════════════════════════════════════════════════════════════════════════
SRS_BLOCK = '''\
<script id="srs-engine">
// ── True spaced repetition engine (SM-2 inspired) ─────────────────────────
// Overrides the weight-based SR system. Later <script> definitions win
// in global scope, so these replace getSRLevel, buildSmartDeck, etc.

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getSRData(term) {
  const d = state.progress.srData && state.progress.srData[term];
  return d || { interval: 1, ease: 2.5, reps: 0, due: getTodayStr() };
}

// Dots UI (0-5) now derived from reps count
function getSRLevel(term) {
  const d = state.progress.srData && state.progress.srData[term];
  if (d) return Math.min(5, d.reps || 0);
  return (state.progress.srLevels && state.progress.srLevels[term]) || 0;
}

// Core SR update — call instead of bumpSRLevel / setSRLevel
function updateSR(term, correct) {
  if (!state.progress.srData) state.progress.srData = {};
  const d = getSRData(term);
  if (correct) {
    d.reps = (d.reps || 0) + 1;
    d.ease = Math.max(1.3, (d.ease || 2.5) + 0.1);
    if      (d.reps === 1) d.interval = 1;
    else if (d.reps === 2) d.interval = 4;
    else                   d.interval = Math.round((d.interval || 1) * d.ease);
  } else {
    d.reps     = 0;
    d.ease     = Math.max(1.3, (d.ease || 2.5) - 0.2);
    d.interval = 1;
  }
  const due = new Date();
  due.setDate(due.getDate() + d.interval);
  d.due = due.toISOString().slice(0, 10);
  state.progress.srData[term] = d;
  if (!state.progress.srLevels) state.progress.srLevels = {};
  state.progress.srLevels[term] = Math.min(5, d.reps);
}

// "Already know this" — schedules card 30 days out
function markKnown(term) {
  if (!state.progress.srData) state.progress.srData = {};
  const due = new Date();
  due.setDate(due.getDate() + 30);
  state.progress.srData[term] = { interval: 30, ease: 2.8, reps: 5, due: due.toISOString().slice(0, 10) };
  if (!state.progress.srLevels) state.progress.srLevels = {};
  state.progress.srLevels[term] = 5;
}

// Migrate old srLevels (0-5 ints) to srData on first load
function migrateSRData() {
  if (!state.progress.srData) state.progress.srData = {};
  if (Object.keys(state.progress.srData).length > 0) return; // already done
  const today = getTodayStr();
  const daysMap = [0, 1, 4, 10, 20, 30];
  Object.entries(state.progress.srLevels || {}).forEach(([term, lvl]) => {
    const days = daysMap[Math.min(5, lvl || 0)];
    const due  = new Date();
    due.setDate(due.getDate() + days);
    state.progress.srData[term] = {
      interval: Math.max(1, days || 1),
      ease:     2.5,
      reps:     lvl || 0,
      due:      days === 0 ? today : due.toISOString().slice(0, 10),
    };
  });
}

// Override buildSmartDeck — due-date scheduling replaces weight-based picks
function buildSmartDeck(pool) {
  if (!state.flash.srEnabled || pool.length === 0)
    return shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));

  migrateSRData(); // safe to call repeatedly — no-op after first run
  const today   = getTodayStr();
  const studied = state.progress.studied;

  // Categorise pool into three buckets
  const due      = shuffle(pool.filter(c =>  studied.has(c.term) && getSRData(c.term).due <= today));
  const newCards  = shuffle(pool.filter(c => !studied.has(c.term)));
  const notYetDue = shuffle(pool.filter(c =>  studied.has(c.term) && getSRData(c.term).due >  today));

  const NEW_CAP = Math.ceil(SESSION_SIZE / 2); // max new cards per session
  const session = [];

  // 1. Due / overdue cards first (up to SESSION_SIZE)
  session.push(...due.slice(0, SESSION_SIZE));
  // 2. New cards (up to half the session)
  session.push(...newCards.slice(0, Math.min(NEW_CAP, SESSION_SIZE - session.length)));
  // 3. Fill any remaining space with not-yet-due (extra practice)
  if (session.length < SESSION_SIZE)
    session.push(...notYetDue.slice(0, SESSION_SIZE - session.length));

  // Light shuffle so due + new cards interleave naturally
  return shuffle(session).slice(0, SESSION_SIZE);
}
</script>
'''

ENGINE_INJ_OLD = '<script id="onboarding">'
ENGINE_INJ_NEW = SRS_BLOCK + '<script id="onboarding">'

# ═══════════════════════════════════════════════════════════════════════════════
# SURGICAL PATCHES
# ═══════════════════════════════════════════════════════════════════════════════

# 1. State init — add srData
STATE_OLD = "    srLevels: {},\n    streak: 0,"
STATE_NEW = "    srLevels: {},\n    srData:   {},\n    streak: 0,"

# 2. State reset (reset button)
RESET_OLD = "srLevels: {}, streak:"
RESET_NEW = "srLevels: {}, srData: {}, streak:"

# 3. saveProgress — persist srData alongside srLevels
SAVE_OLD = "    srLevels:      state.progress.srLevels || {},"
SAVE_NEW = "    srLevels:      state.progress.srLevels || {},\n    srData:        state.progress.srData   || {},"

# 4. loadProgress Firebase branch
LOAD_FB_OLD = "        state.progress.srLevels      = data.srLevels   || {};\n        state.progress.streak"
LOAD_FB_NEW = "        state.progress.srLevels      = data.srLevels   || {};\n        state.progress.srData        = data.srData     || {};\n        state.progress.streak"

# 5. loadProgress localStorage branch (ends differently — use } } catch context)
LOAD_LS_OLD = "        state.progress.lastFilter    = data.lastFilter    || 'all';\n      }\n    }\n  } catch (e) {"
LOAD_LS_NEW = "        state.progress.lastFilter    = data.lastFilter    || 'all';\n        state.progress.srData        = data.srData     || {};\n      }\n    }\n  } catch (e) {"

# 6. migrateSRData call after loadProgress closes
LOAD_END_OLD = "  } catch (e) {\n    console.warn('Could not load progress:', e);\n  }\n}\n\nfunction checkAndUpdateStreak"
LOAD_END_NEW = "  } catch (e) {\n    console.warn('Could not load progress:', e);\n  }\n  migrateSRData();\n}\n\nfunction checkAndUpdateStreak"

# 7. Flashcard "Got it" — bumpSRLevel → updateSR
GOT_OLD  = "    bumpSRLevel(card.term, 1);\n    checkAndUpdateStreak();"
GOT_NEW  = "    updateSR(card.term, true);\n    checkAndUpdateStreak();"

# Biotech/EMS variant (no checkAndUpdateStreak, uses updateStreak)
GOT_OLD2 = "    bumpSRLevel(card.term, 1);\n    updateStreak();"
GOT_NEW2 = "    updateSR(card.term, true);\n    updateStreak();"

# 8. Flashcard "Missed it" — drop-2 patch → updateSR
MISS_OLD  = "    setSRLevel(card.term, Math.max(0, getSRLevel(card.term) - 2)); // drop 2 levels when missed"
MISS_NEW  = "    updateSR(card.term, false);"

# EMS variant (no trailing comment, followed by if(!state.progress.lastMissed))
MISS_OLD2 = "  setSRLevel(card.term, Math.max(0, getSRLevel(card.term) - 2));\n  if (!state.progress.lastMissed)"
MISS_NEW2 = "  updateSR(card.term, false);\n  if (!state.progress.lastMissed)"

# Biotech variant
MISS_OLD3 = "    setSRLevel(card.term, Math.max(0, getSRLevel(card.term) - 2));\n    checkAndUpdateStreak();"
MISS_NEW3 = "    updateSR(card.term, false);\n    checkAndUpdateStreak();"

# 9. skipKnown — setSRLevel 5 → markKnown
SKIP_OLD = "  setSRLevel(card.term, 5); // max mastery — already knew this"
SKIP_NEW = "  markKnown(card.term);"

# 10. Quiz/test correct — bumpSRLevel(correct.term, 1) → updateSR (all occurrences)
QUIZ_GOT_OLD = "    bumpSRLevel(correct.term, 1);"
QUIZ_GOT_NEW = "    updateSR(correct.term, true);"

# 11. Quiz wrong — -1 drop variant → updateSR
QUIZ_MISS_OLD = "    setSRLevel(correct.term, Math.max(0, getSRLevel(correct.term) - 1));"
QUIZ_MISS_NEW = "    updateSR(correct.term, false);"

# 12. Test wrong — reset-to-0 variant → updateSR
TEST_MISS_OLD = "    setSRLevel(correct.term, 0);"
TEST_MISS_NEW = "    updateSR(correct.term, false);"

# 13. renderFlashcard deck-progress: add "· N due today"
DP_OLD = "if(_el)_el.textContent=_s+' / '+_p.length+' terms introduced'; } catch(e) {}"
DP_NEW = "const _today=getTodayStr(),_due=_p.filter(c=>studied.has(c.term)&&getSRData(c.term).due<=_today).length; if(_el)_el.textContent=_s+' / '+_p.length+' terms introduced'+(_due>0?' \xb7 '+_due+' due today':''); } catch(e) {}"

# renderFlashcard deck-progress uses 'studied' — add it to the try line
DP_OLD2 = "try { const _p=filterDeck(state.flash.filter),_s=_p.filter(c=>state.progress.studied.has(c.term)).length,_el=document.getElementById('deck-progress'); "
DP_NEW2 = "try { const studied=state.progress.studied,_p=filterDeck(state.flash.filter),_s=_p.filter(c=>studied.has(c.term)).length,_el=document.getElementById('deck-progress'); "

# ═══════════════════════════════════════════════════════════════════════════════
PATCHES = [
    # label,  old,  new,  replace_all
    ('engine inject', ENGINE_INJ_OLD, ENGINE_INJ_NEW, False),
    ('state srData',  STATE_OLD,      STATE_NEW,       False),
    ('reset srData',  RESET_OLD,      RESET_NEW,       False),
    ('save srData',   SAVE_OLD,       SAVE_NEW,        False),
    ('load fb',       LOAD_FB_OLD,    LOAD_FB_NEW,     False),
    ('load ls',       LOAD_LS_OLD,    LOAD_LS_NEW,     False),
    ('load end',      LOAD_END_OLD,   LOAD_END_NEW,    False),
    ('got it',        GOT_OLD,        GOT_NEW,         False),
    ('got it2',       GOT_OLD2,       GOT_NEW2,        False),
    ('missed it',     MISS_OLD,       MISS_NEW,        False),
    ('missed it2',    MISS_OLD2,      MISS_NEW2,       False),
    ('missed it3',    MISS_OLD3,      MISS_NEW3,       False),
    ('skip known',    SKIP_OLD,       SKIP_NEW,        False),
    ('quiz got',      QUIZ_GOT_OLD,   QUIZ_GOT_NEW,    True),  # replace ALL occurrences
    ('quiz miss',     QUIZ_MISS_OLD,  QUIZ_MISS_NEW,   True),
    ('test miss',     TEST_MISS_OLD,  TEST_MISS_NEW,   True),
    ('dp study var',  DP_OLD2,        DP_NEW2,         False),
    ('dp due today',  DP_OLD,         DP_NEW,          False),
]

ESSENTIAL = {'engine inject','state srData','save srData','load fb','got it','missed it','skip known','quiz got'}

for fn in STUDY_FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    hits, misses = [], []
    for label, old, new, all_ in PATCHES:
        if old in content:
            content = content.replace(old, new) if all_ else content.replace(old, new, 1)
            hits.append(label)
        else:
            misses.append(label)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

    missed_essential = [m for m in misses if m in ESSENTIAL]
    warn = f"  WARN missing: {missed_essential}" if missed_essential else ""
    print(f"  {'OK ' if not missed_essential else 'ERR'} {fn:45s} {len(hits)}/{len(PATCHES)} hits{warn}")

print("\nDone.")
