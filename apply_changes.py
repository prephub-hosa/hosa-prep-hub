#!/usr/bin/env python3
"""Apply two UX changes:
1. index.html – replace raw term counts with "20 Cards/Session" on all 18 event cards
2. All 18 subject pages – add category picker screen before flashcard stage
"""
import re, os

BASE = '/home/user/hosa-prep-hub'

# ── Change 1: index.html ─────────────────────────────────────────────────────

idx_path = os.path.join(BASE, 'index.html')
with open(idx_path, 'r', encoding='utf-8') as f:
    idx = f.read()

first_stat_pattern = re.compile(
    r'(<div class="card-stats">\s*)'
    r'(<div class="card-stat">\s*<div class="stat-num">\d+</div>\s*<div class="stat-label">[^<]+</div>\s*</div>)',
    re.DOTALL
)

replacement_stat = (
    '<div class="card-stat">\n'
    '            <div class="stat-num">20</div>\n'
    '            <div class="stat-label">Cards/Session</div>\n'
    '          </div>'
)

def replace_first_stat(m):
    return m.group(1) + replacement_stat

changes_found = len(first_stat_pattern.findall(idx))
print(f'index.html: {changes_found} card-stats blocks found (expect 18)')

idx_new = first_stat_pattern.sub(replace_first_stat, idx)

with open(idx_path, 'w', encoding='utf-8') as f:
    f.write(idx_new)
print('index.html updated.\n')

# ── Change 2: All 18 subject pages ──────────────────────────────────────────

SUBJECT_PAGES = [
    'anatomy-physiology.html',
    'behavioral-health.html',
    'biochemistry.html',
    'biomedical-lab-science.html',
    'biotechnology.html',
    'clinical-nursing.html',
    'dental-science.html',
    'emergency-medical-science.html',
    'human-growth-development.html',
    'medical-law-ethics.html',
    'medical-math.html',
    'medical-terminology.html',
    'nutrition.html',
    'pathophysiology.html',
    'pharmacology.html',
    'physical-therapy.html',
    'public-health.html',
    'sports-medicine.html',
]

CSS_SNIPPET = (
    "  .cpb { padding: 9px 18px; background: var(--bg-card); border: 1px solid var(--rule); "
    "border-radius: 4px; font-family: 'Source Serif 4', Georgia, serif; font-size: 14px; "
    "color: var(--ink); cursor: pointer; transition: border-color 0.15s; }\n"
    "  .cpb:hover { border-color: var(--ink-soft); }\n"
)

CAT_SCREEN_HTML = (
    '    <div id="cat-screen" style="display:none;padding:32px 20px 24px;text-align:center;max-width:560px;margin:0 auto;">\n'
    '      <h3 style="font-family:\'Fraunces\',serif;font-size:20px;font-weight:500;margin-bottom:8px;">What would you like to focus on?</h3>\n'
    '      <p style="color:var(--ink-soft);font-size:14px;margin-bottom:20px;">Pick a topic — you can switch anytime</p>\n'
    '      <div id="cpb-wrap" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;"></div>\n'
    '      <button id="cpb-all" style="margin-top:20px;padding:10px 24px;background:transparent;border:1px solid var(--rule);border-radius:4px;font-family:\'Source Serif 4\',Georgia,serif;font-size:14px;color:var(--ink-soft);cursor:pointer;">Study all topics \\u2192</button>\n'
    '    </div>\n'
)

RESUME_BANNER = '    <div id="resume-banner" class="resume-banner" style="display:none"></div>\n'
FLASH_STAGE_START = '    <div class="flashcard-stage">'

# JS pattern for pages with single initFlashcards() (most pages):
# Replace the two lines that build deck and render first card
OLD_JS_SINGLE = (
    '  state.flash.deck = buildSmartDeck(filterDeck(state.flash.filter));\n'
    '  renderFlashcard();\n'
)

NEW_JS_SINGLE = (
    '  const _cpKey = \'_cpk_\' + DB_PATH;\n'
    '  const _catScr = document.getElementById(\'cat-screen\');\n'
    '  const _flashStg = document.querySelector(\'.flashcard-stage\');\n'
    '  const _showPicker = _catScr && _flashStg && !sessionStorage.getItem(_cpKey) && !state.progress.lastFilter;\n'
    '  if (_showPicker) {\n'
    '    _flashStg.style.display = \'none\';\n'
    '    _catScr.style.display = \'\';\n'
    '    categories.forEach(cat => {\n'
    '      const _b = document.createElement(\'button\');\n'
    '      _b.className = \'cpb\';\n'
    '      _b.textContent = categoryLabel(cat);\n'
    '      _b.addEventListener(\'click\', () => { sessionStorage.setItem(_cpKey,\'1\'); _catScr.style.display=\'none\'; _flashStg.style.display=\'\'; onFlashFilter(cat); });\n'
    '      document.getElementById(\'cpb-wrap\').appendChild(_b);\n'
    '    });\n'
    '    document.getElementById(\'cpb-all\').addEventListener(\'click\', () => { sessionStorage.setItem(_cpKey,\'1\'); _catScr.style.display=\'none\'; _flashStg.style.display=\'\'; state.flash.deck=buildSmartDeck(filterDeck(\'all\')); renderFlashcard(); });\n'
    '  } else {\n'
    '    state.flash.deck = buildSmartDeck(filterDeck(state.flash.filter));\n'
    '    renderFlashcard();\n'
    '  }\n'
)

# JS pattern for pages with startFlashcards() helper (dental, ems, physical-therapy):
# Replace the final startFlashcards call + updateStreakBadge closing
OLD_JS_DOUBLE = (
    '  startFlashcards(state.flash.filter);\n'
    '  updateStreakBadge();\n'
    '}\n'
    '\n'
    'function startFlashcards(filter) {'
)

NEW_JS_DOUBLE = (
    '  const _cpKey = \'_cpk_\' + DB_PATH;\n'
    '  const _catScr = document.getElementById(\'cat-screen\');\n'
    '  const _flashStg = document.querySelector(\'.flashcard-stage\');\n'
    '  const _showPicker = _catScr && _flashStg && !sessionStorage.getItem(_cpKey) && !state.progress.lastFilter;\n'
    '  if (_showPicker) {\n'
    '    _flashStg.style.display = \'none\';\n'
    '    _catScr.style.display = \'\';\n'
    '    categories.forEach(cat => {\n'
    '      const _b = document.createElement(\'button\');\n'
    '      _b.className = \'cpb\';\n'
    '      _b.textContent = categoryLabel(cat);\n'
    '      _b.addEventListener(\'click\', () => { sessionStorage.setItem(_cpKey,\'1\'); _catScr.style.display=\'none\'; _flashStg.style.display=\'\'; startFlashcards(cat); });\n'
    '      document.getElementById(\'cpb-wrap\').appendChild(_b);\n'
    '    });\n'
    '    document.getElementById(\'cpb-all\').addEventListener(\'click\', () => { sessionStorage.setItem(_cpKey,\'1\'); _catScr.style.display=\'none\'; _flashStg.style.display=\'\'; startFlashcards(state.flash.filter); });\n'
    '  } else {\n'
    '    startFlashcards(state.flash.filter);\n'
    '  }\n'
    '  updateStreakBadge();\n'
    '}\n'
    '\n'
    'function startFlashcards(filter) {'
)

for page in SUBJECT_PAGES:
    path = os.path.join(BASE, page)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    ok = True
    msgs = []

    # 1. Add CSS
    if CSS_SNIPPET.strip() not in content:
        if '</style>' in content:
            content = content.replace('</style>', CSS_SNIPPET + '</style>', 1)
            msgs.append('css added')
        else:
            print(f'  WARNING: no </style> in {page}')
            ok = False

    # 2. Insert cat-screen HTML
    if 'id="cat-screen"' not in content:
        target = RESUME_BANNER + FLASH_STAGE_START
        replacement = RESUME_BANNER + CAT_SCREEN_HTML + FLASH_STAGE_START
        if target in content:
            content = content.replace(target, replacement, 1)
            msgs.append('cat-screen inserted')
        else:
            print(f'  WARNING: resume-banner anchor not found in {page}')
            ok = False

    # 3. Patch initFlashcards JS — try single pattern first, then double
    if '_cpKey' not in content:
        if OLD_JS_SINGLE in content:
            # Count occurrences — only replace the one inside initFlashcards
            # The OLD_JS_SINGLE pattern may appear in sc-more handler too, so replace only first
            content = content.replace(OLD_JS_SINGLE, NEW_JS_SINGLE, 1)
            msgs.append('js patched (single)')
        elif OLD_JS_DOUBLE in content:
            content = content.replace(OLD_JS_DOUBLE, NEW_JS_DOUBLE, 1)
            msgs.append('js patched (double/startFlashcards)')
        else:
            print(f'  WARNING: no matching JS pattern in {page}')
            ok = False

    if ok:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  {page}: OK ({", ".join(msgs) if msgs else "already done"})')
    else:
        print(f'  {page}: SKIPPED')

print('\nDone.')
