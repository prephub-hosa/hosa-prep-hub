"""
improve_mobile_and_ux.py  —  comprehensive UX + mobile pass

Changes applied to all 16 study pages:

1. MOBILE FLASHCARD FIX
   - Both card faces now share a min-height (230 px) → no size jump
     between the small front and the long-definition back
   - word-break / overflow-wrap / hyphens on faces → no text overflow
   - Back face is scrollable (max-height: 58vh) for very long definitions
   - Consistent padding on both faces

2. PAGE LOADER
   - Spinner overlay shown while Firebase auth + progress loads
   - Fades out and removes itself after initFlashcards() runs
   - Prevents the flash of "01 / 00" and empty cards

3. INITIAL COUNTER FIX
   - "01 / 00" placeholder → "—" so no wrong number flashes

4. MOBILE SWIPE SUPPORT
   - Swipe left on card → next card
   - Swipe right on card → previous card
   (uses touchstart/touchend, passive listeners, no library needed)

5. EMPTY STATE
   - When a category filter produces 0 cards, shows a friendly message
     instead of a blank screen

6. QUIZ NEXT-BUTTON GRACE PERIOD
   - 300 ms delay before "Next Question" enables after answering
   - Gives users time to actually read the feedback

7. SCORE CELEBRATION
   - 100 % quiz score: score number pops and turns success green
   - CSS @keyframes _score-pop injected into style block

8. GLOBAL KEYFRAMES
   - @keyframes _pl-spin (loader spinner)
   - @keyframes _score-pop (perfect-score celebration)
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

# ─────────────────────────────────────────────────────────────────────────────
# 1. MOBILE FLASHCARD CSS  (inside @media (max-width: 480px))
# ─────────────────────────────────────────────────────────────────────────────
MOBILE_OLD = """\
    /* ── Mobile flashcard: disable 3-D flip so height follows content ── */
    .flashcard { aspect-ratio: unset; height: auto; overflow: hidden; perspective: none; }
    .flashcard-inner { height: auto !important; transform-style: flat !important; transition: none !important; }
    .flashcard.flipped .flashcard-inner { transform: none !important; }
    .face {
      position: relative !important; inset: auto !important;
      width: 100%; height: auto !important; min-height: 180px;
      padding: 28px 20px;
      transform: none !important; backface-visibility: visible !important;
    }
    .face.back { display: none !important; }
    .flashcard.flipped .face.front { display: none !important; }
    .flashcard.flipped .face.back  { display: flex !important; }"""

MOBILE_NEW = """\
    /* ── Mobile flashcard: consistent height, no jump between front/back ── */
    .flashcard { aspect-ratio: unset; min-height: 230px; overflow: hidden; perspective: none; }
    .flashcard-inner { min-height: 230px; height: auto !important; transform-style: flat !important; transition: none !important; }
    .flashcard.flipped .flashcard-inner { transform: none !important; }
    .face {
      position: relative !important; inset: auto !important;
      width: 100%; box-sizing: border-box;
      min-height: 230px; height: auto !important; max-height: 58vh;
      padding: 22px 18px; overflow-y: auto;
      word-break: break-word; overflow-wrap: break-word; hyphens: auto;
      transform: none !important; backface-visibility: visible !important;
    }
    .face.back { display: none !important; }
    .flashcard.flipped .face.front { display: none !important; }
    .flashcard.flipped .face.back  { display: flex !important; }"""

# ─────────────────────────────────────────────────────────────────────────────
# 2. GLOBAL KEYFRAMES  (injected just before main </style> close)
# ─────────────────────────────────────────────────────────────────────────────
# We find the last </style> before the Firebase <script> tags
KEYFRAMES_OLD = '</style>\n<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js">'
KEYFRAMES_NEW = (
    '  @keyframes _pl-spin  { to { transform: rotate(360deg); } }\n'
    '  @keyframes _score-pop { 0%{transform:scale(0.82);opacity:0.6} 55%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }\n'
    '</style>\n'
    '<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js">'
)

# ─────────────────────────────────────────────────────────────────────────────
# 3. PAGE LOADER  (HTML injected before first <section>)
# ─────────────────────────────────────────────────────────────────────────────
LOADER_HTML_OLD = '\n  <section class="view active" id="view-flashcards">'
LOADER_HTML_NEW = (
    '\n  <div id="page-loader" style="'
    'position:fixed;inset:0;background:var(--bg);z-index:999;'
    'display:flex;align-items:center;justify-content:center;'
    'transition:opacity 0.25s ease">'
    '<div style="width:26px;height:26px;border:2px solid var(--border);'
    'border-top-color:var(--accent);border-radius:50%;'
    'animation:_pl-spin 0.7s linear infinite"></div></div>'
    '\n  <section class="view active" id="view-flashcards">'
)

# Hide loader — guest branch (has saveProgress call before initFlashcards)
LOADER_JS_GUEST_OLD = (
    '      saveProgress(); // sync localStorage → Firebase guest-stats on load\n'
    '      initFlashcards();\n'
    '      initQuiz();\n'
    '      initTest();\n'
    '    });'
)
LOADER_JS_GUEST_NEW = (
    '      saveProgress(); // sync localStorage → Firebase guest-stats on load\n'
    '      initFlashcards();\n'
    '      initQuiz();\n'
    '      initTest();\n'
    '      (function(){var lo=document.getElementById(\'page-loader\');'
    'if(lo){lo.style.opacity=\'0\';setTimeout(function(){lo.remove();},280);}})();\n'
    '    });'
)

# Hide loader — logged-in branch
LOADER_JS_AUTH_OLD = (
    '  loadProgress(user.uid).then(() => {\n'
    '    initFlashcards();\n'
    '    initQuiz();\n'
    '    initTest();\n'
    '  });'
)
LOADER_JS_AUTH_NEW = (
    '  loadProgress(user.uid).then(() => {\n'
    '    initFlashcards();\n'
    '    initQuiz();\n'
    '    initTest();\n'
    '    (function(){var lo=document.getElementById(\'page-loader\');'
    'if(lo){lo.style.opacity=\'0\';setTimeout(function(){lo.remove();},280);}})();\n'
    '  });'
)

# ─────────────────────────────────────────────────────────────────────────────
# 4. INITIAL COUNTER  "01 / 00"  →  "—"
# ─────────────────────────────────────────────────────────────────────────────
COUNTER_OLD = '<span id="flash-progress">01 / 00</span>'
COUNTER_NEW = '<span id="flash-progress">—</span>'

# ─────────────────────────────────────────────────────────────────────────────
# 5. MOBILE SWIPE  (added right after the flashcard click handler)
# ─────────────────────────────────────────────────────────────────────────────
SWIPE_OLD = (
    "  $('#flashcard').addEventListener('click', () => {\n"
    "    $('#flashcard').classList.toggle('flipped');\n"
    "  });"
)
SWIPE_NEW = (
    "  $('#flashcard').addEventListener('click', () => {\n"
    "    $('#flashcard').classList.toggle('flipped');\n"
    "  });\n"
    "  // Mobile swipe: left → next card, right → prev card\n"
    "  (function(){\n"
    "    var _swX=0;\n"
    "    var _fc=document.getElementById('flashcard');\n"
    "    if(!_fc) return;\n"
    "    _fc.addEventListener('touchstart',function(e){_swX=e.touches[0].clientX;},{passive:true});\n"
    "    _fc.addEventListener('touchend',function(e){\n"
    "      var dx=e.changedTouches[0].clientX-_swX;\n"
    "      if(Math.abs(dx)>48){if(dx<0)nextFlashcard(1);else nextFlashcard(-1);}\n"
    "    },{passive:true});\n"
    "  })();"
)

# ─────────────────────────────────────────────────────────────────────────────
# 6. EMPTY STATE  (in renderFlashcard when no card)
# ─────────────────────────────────────────────────────────────────────────────
EMPTY_OLD = (
    'function renderFlashcard() {\n'
    '  const card = state.flash.deck[state.flash.index];\n'
    '  if (!card) return;'
)
EMPTY_NEW = (
    'function renderFlashcard() {\n'
    '  const card = state.flash.deck[state.flash.index];\n'
    "  if (!card) {\n"
    "    try {\n"
    "      const _dp=document.getElementById('deck-progress');\n"
    "      if(_dp) _dp.textContent='No cards match this filter — try a different category above.';\n"
    "      const _fp=document.getElementById('flash-progress');\n"
    "      if(_fp) _fp.textContent='—';\n"
    "    } catch(e){}\n"
    "    return;\n"
    "  }"
)

# ─────────────────────────────────────────────────────────────────────────────
# 7. QUIZ NEXT-BUTTON GRACE PERIOD  (300 ms delay so feedback is readable)
# ─────────────────────────────────────────────────────────────────────────────
QUIZ_NEXT_OLD = "  $('#quiz-next').disabled = false;\n  saveProgress();"
QUIZ_NEXT_NEW = "  setTimeout(() => { $('#quiz-next').disabled = false; }, 300);\n  saveProgress();"

# ─────────────────────────────────────────────────────────────────────────────
# 8. SCORE CELEBRATION  (100% quiz = score number pops green)
# ─────────────────────────────────────────────────────────────────────────────
SCORE_OLD = "  if (pct === 100) msg = 'Flawless. The terminology bends to you.';"
SCORE_NEW = (
    "  if (pct === 100) {\n"
    "    msg = 'Flawless. The terminology bends to you.';\n"
    "    try {\n"
    "      var _sn=$('#quiz-results .score-num')||document.querySelector('#quiz-results .score-num');\n"
    "      if(_sn){ _sn.style.color='var(--success)'; _sn.style.animation='none';\n"
    "        setTimeout(function(){_sn.style.animation='_score-pop 0.55s ease';},40); }\n"
    "    } catch(e){}\n"
    "  }"
)

# ─────────────────────────────────────────────────────────────────────────────
PATCHES = [
    # label,                old,                 new,               essential
    ('mobile css',          MOBILE_OLD,          MOBILE_NEW,          True),
    ('keyframes',           KEYFRAMES_OLD,       KEYFRAMES_NEW,       True),
    ('loader html',         LOADER_HTML_OLD,     LOADER_HTML_NEW,     True),
    ('loader js guest',     LOADER_JS_GUEST_OLD, LOADER_JS_GUEST_NEW, True),
    ('loader js auth',      LOADER_JS_AUTH_OLD,  LOADER_JS_AUTH_NEW,  True),
    ('counter fix',         COUNTER_OLD,         COUNTER_NEW,         False),
    ('swipe support',       SWIPE_OLD,           SWIPE_NEW,           False),
    ('empty state',         EMPTY_OLD,           EMPTY_NEW,           False),
    ('quiz next delay',     QUIZ_NEXT_OLD,       QUIZ_NEXT_NEW,       False),
    ('score celebration',   SCORE_OLD,           SCORE_NEW,           False),
]

ESSENTIAL = {p[0] for p in PATCHES if p[3]}

for fn in STUDY_FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    hits, misses = [], []
    for label, old, new, _ in PATCHES:
        if old in content:
            content = content.replace(old, new, 1)
            hits.append(label)
        else:
            misses.append(label)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

    missed_ess = [m for m in misses if m in ESSENTIAL]
    warn = f'  WARN essential missing: {missed_ess}' if missed_ess else ''
    status = 'ERR' if missed_ess else 'OK '
    print(f'  {status} {fn:45s} {len(hits)}/{len(PATCHES)} hits  miss={misses}{warn}')

print('\nDone.')
