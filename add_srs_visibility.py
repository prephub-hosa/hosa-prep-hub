"""
add_srs_visibility.py

Makes the spaced repetition system visible to users:

1. "Next review" badge — after clicking Got it or Missed it, a small
   line fades in below the buttons showing when the card will come back:
     "↻ See you in 4 days"   /   "↻ Review again tomorrow"
   It fades out automatically as the next card slides in.

2. Session complete screen — adds an SRS schedule summary:
     "Due tomorrow: 3 · in 4 days: 2 · well spaced: 15"

3. showNextReview() function added to the srs-engine block so it's
   always available alongside updateSR().
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

# ── 1. CSS ────────────────────────────────────────────────────────────────────
CSS_OLD = '  .rating-hint { text-align: center; font-size: 12px; color: var(--ink-faint); margin-top: 10px; letter-spacing: 0.02em; }'
CSS_NEW = (
    '  .rating-hint { text-align: center; font-size: 12px; color: var(--ink-faint); margin-top: 10px; letter-spacing: 0.02em; }\n'
    '  .next-review-badge { text-align: center; font-size: 12px; color: var(--accent); letter-spacing: 0.02em; min-height: 16px; margin: 6px 0 0; opacity: 0; transition: opacity 0.5s ease; }'
)

# ── 2. HTML badge element (injected before the rating-hint paragraph) ─────────
HTML_OLD = '      <p class="rating-hint">Tap a card to reveal'
HTML_NEW = '      <p id="next-review-badge" class="next-review-badge"></p>\n      <p class="rating-hint">Tap a card to reveal'

# ── 3. showNextReview added to the srs-engine block (before closing </script>) ─
SRS_ENGINE_CLOSE_OLD = '</script>\n<script id="onboarding">'
SRS_ENGINE_CLOSE_NEW = '''\

// Show a brief "next review" hint after rating a card
function showNextReview(interval) {
  const el = document.getElementById('next-review-badge');
  if (!el) return;
  el.textContent = interval <= 1 ? '↻ Review again tomorrow'
    : interval <= 3              ? `↻ See you in ${interval} days`
    : interval <= 10             ? `↻ Next review in ${interval} days`
    : interval <= 20             ? `↻ Well spaced — back in ${interval} days`
    :                              `↻ Mastered! Returning in ${interval} days`;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 1800);
}
</script>
<script id="onboarding">'''

# ── 4. Got it handler — add showNextReview call (standard pages) ──────────────
GOT_SNR_OLD  = '    updateSR(card.term, true);\n    checkAndUpdateStreak();'
GOT_SNR_NEW  = '    updateSR(card.term, true);\n    showNextReview((state.progress.srData||{})[card.term]?.interval||1);\n    checkAndUpdateStreak();'

# Biotech/EMS variant (uses updateStreak)
GOT_SNR_OLD2 = '    updateSR(card.term, true);\n    updateStreak();'
GOT_SNR_NEW2 = '    updateSR(card.term, true);\n    showNextReview((state.progress.srData||{})[card.term]?.interval||1);\n    updateStreak();'

# ── 5. Missed it handler — add showNextReview(1) ──────────────────────────────
MISS_SNR_OLD  = '    updateSR(card.term, false);\n    checkAndUpdateStreak();'
MISS_SNR_NEW  = '    updateSR(card.term, false);\n    showNextReview(1);\n    checkAndUpdateStreak();'

MISS_SNR_OLD2 = '  updateSR(card.term, false);\n  if (!state.progress.lastMissed)'   # EMS variant
MISS_SNR_NEW2 = '  updateSR(card.term, false);\n  showNextReview(1);\n  if (!state.progress.lastMissed)'

MISS_SNR_OLD3 = '    updateSR(card.term, false);\n    checkAndUpdateStreak();'  # same as MISS_SNR_OLD but alias for clarity
# (handled by the first replace — no separate biotech variant needed for missed)

# ── 6. Session complete — inject SRS schedule summary ─────────────────────────
# Append to showSessionComplete() — find the end of the try block and add after it
SC_OLD = "    document.getElementById('sc-deck-progress').textContent = allSeen"
SC_NEW = """\
    // SRS schedule summary
    try {
      const today2 = getTodayStr();
      const pool2  = filterDeck(state.flash.filter);
      const tom    = new Date(); tom.setDate(tom.getDate()+1);
      const tomStr = tom.toISOString().slice(0,10);
      const in4    = new Date(); in4.setDate(in4.getDate()+4);
      const in4Str = in4.toISOString().slice(0,10);
      let dueTom=0, due4=0, later=0;
      pool2.forEach(c => {
        if (!state.progress.studied.has(c.term)) return;
        const d = getSRData(c.term);
        if (d.due <= today2)      return; // already shown as "due today"
        if (d.due <= tomStr)      dueTom++;
        else if (d.due <= in4Str) due4++;
        else                      later++;
      });
      const parts = [];
      if (dueTom > 0) parts.push(`${dueTom} due tomorrow`);
      if (due4  > 0)  parts.push(`${due4} due within 4 days`);
      if (later > 0)  parts.push(`${later} well spaced`);
      const sched = document.getElementById('sc-srs-schedule');
      if (sched && parts.length) sched.textContent = parts.join(' \xb7 ');
    } catch(e) {}
    document.getElementById('sc-deck-progress').textContent = allSeen"""

# HTML: add the schedule line to the session-complete div
SC_HTML_OLD = '        <p id="sc-deck-progress" class="sc-sub" style="margin-top:0;opacity:0.75;font-size:13px;"></p>'
SC_HTML_NEW = ('        <p id="sc-deck-progress" class="sc-sub" style="margin-top:0;opacity:0.75;font-size:13px;"></p>\n'
               '        <p id="sc-srs-schedule" class="sc-sub" style="margin-top:0;opacity:0.6;font-size:12px;letter-spacing:0.01em;"></p>')

# ═══════════════════════════════════════════════════════════════════════════════
PATCHES = [
    ('css badge',      CSS_OLD,           CSS_NEW,           False),
    ('html badge',     HTML_OLD,          HTML_NEW,          False),
    ('srs fn close',   SRS_ENGINE_CLOSE_OLD, SRS_ENGINE_CLOSE_NEW, False),
    ('got snr std',    GOT_SNR_OLD,       GOT_SNR_NEW,       False),
    ('got snr alt',    GOT_SNR_OLD2,      GOT_SNR_NEW2,      False),
    ('miss snr std',   MISS_SNR_OLD,      MISS_SNR_NEW,      False),
    ('miss snr ems',   MISS_SNR_OLD2,     MISS_SNR_NEW2,     False),
    ('sc srs logic',   SC_OLD,            SC_NEW,            False),
    ('sc html sched',  SC_HTML_OLD,       SC_HTML_NEW,       False),
]

ESSENTIAL = {'css badge', 'html badge', 'srs fn close', 'got snr std', 'miss snr std'}

for fn in STUDY_FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    hits, misses = [], []
    for label, old, new, all_ in PATCHES:
        if old in content:
            content = content.replace(old, new, 1) if not all_ else content.replace(old, new)
            hits.append(label)
        else:
            misses.append(label)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

    missed_ess = [m for m in misses if m in ESSENTIAL]
    warn = f'  WARN {missed_ess}' if missed_ess else ''
    status = 'ERR' if missed_ess else 'OK '
    print(f'  {status} {fn:45s} {len(hits)}/{len(PATCHES)} hits{warn}')

print('\nDone.')
