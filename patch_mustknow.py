#!/usr/bin/env python3
"""Patch 17 legacy HTML files to add Must-Know Terms section."""

import os

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

# ── CSS to add (after .know-it-btn:hover rule) ───────────────────────────────
OLD_CSS_ANCHOR = '  .know-it-btn:hover { border-color: var(--success); color: var(--success); }'
NEW_CSS_ANCHOR = '''  .know-it-btn:hover { border-color: var(--success); color: var(--success); }
  /* ── Must-Know Terms section ── */
  .must-know-section { margin: 0 0 18px; }
  .mk-toggle-btn {
    display: flex; align-items: center; gap: 8px;
    background: none; border: 1px solid var(--accent); color: var(--accent);
    padding: 6px 14px; font-family: 'Cormorant Garamond', serif;
    font-size: 12px; font-weight: 600; font-variant: small-caps;
    letter-spacing: 0.08em; cursor: pointer; width: 100%;
    transition: background 0.15s, color 0.15s;
  }
  .mk-toggle-btn:hover { background: var(--accent); color: var(--bg); }
  .mk-toggle-btn .mk-chevron { margin-left: auto; transition: transform 0.2s; font-style: normal; font-variant: normal; letter-spacing: 0; }
  .mk-toggle-btn.open .mk-chevron { transform: rotate(180deg); }
  .mk-body { display: none; border: 1px solid var(--accent); border-top: none; padding: 16px 14px 10px; }
  .mk-body.open { display: block; }
  .mk-intro { font-family: 'Source Serif 4', Georgia, serif; font-size: 12px; color: var(--ink-soft); margin-bottom: 12px; line-height: 1.5; }
  .mk-list { display: flex; flex-direction: column; gap: 10px; }
  .mk-card {
    border-left: 3px solid var(--accent); padding: 10px 12px;
    background: var(--bg-card);
  }
  .mk-term { font-family: 'Fraunces', serif; font-size: 15px; font-weight: 500; letter-spacing: -0.01em; margin-bottom: 3px; }
  .mk-meaning { font-family: 'Source Serif 4', Georgia, serif; font-size: 13px; color: var(--ink-soft); margin-bottom: 6px; line-height: 1.5; }
  .mk-why { font-family: 'Cormorant Garamond', serif; font-size: 12px; font-weight: 600; color: var(--accent); letter-spacing: 0.04em; display: flex; align-items: flex-start; gap: 5px; line-height: 1.4; }
  .mk-why::before { content: '★'; flex-shrink: 0; font-size: 10px; margin-top: 1px; }
  .mk-jump { background: none; border: none; color: var(--ink-faint); font-family: 'Cormorant Garamond', serif; font-size: 11px; letter-spacing: 0.04em; font-variant: small-caps; cursor: pointer; padding: 0; margin-top: 4px; display: inline-block; text-decoration: underline; text-underline-offset: 2px; }
  .mk-jump:hover { color: var(--ink); }'''

# ── HTML to add (before deck-progress-row) ───────────────────────────────────
OLD_HTML_ANCHOR = '      <div class="deck-progress-row">'
NEW_HTML_ANCHOR = '''      <!-- Must-Know Terms -->
      <div class="must-know-section" id="must-know-section">
        <button class="mk-toggle-btn" id="mk-toggle" type="button">
          ★ 10 Must-Know Terms for this Event
          <em class="mk-chevron">▾</em>
        </button>
        <div class="mk-body" id="mk-body">
          <p class="mk-intro">These terms appear most frequently in HOSA materials and are the highest-yield concepts for this event. Expand a card to study it in context.</p>
          <div class="mk-list" id="mk-list"></div>
        </div>
      </div>

      <div class="deck-progress-row">'''

# ── JS to add (before cram mode block) ────────────────────────────────────────
OLD_JS_ANCHOR = '// ── Cram mode ─────────────────────────────────────────────────'
NEW_JS_ANCHOR = '''// ── Must-Know Terms ──────────────────────────────────────────
const _MK_RULES = [
  { patterns: /\\b(most common(ly)?|leading cause|number one cause|#1 cause|most frequently)\\b/i,
    label: 'Most common — this ranks #1 in frequency, so it shows up constantly in HOSA materials and clinical vignettes.' },
  { patterns: /\\b(hallmark|classic sign|classic presentation|pathognomonic|characteristic(ally)?|characterized by)\\b/i,
    label: 'Diagnostic hallmark — questions love to give you the textbook presentation and ask you to name it. Nail this and you get the point.' },
  { patterns: /\\b(gold standard|first.?line|first.?choice|treatment of choice|definitive treatment|preferred treatment)\\b/i,
    label: 'Gold-standard treatment — "what do you do first?" is one of the most common HOSA question stems. Know the answer cold.' },
  { patterns: /\\b(emergency|life.?threatening|immediately|critical|urgent|shock|failure|arrest|rupture)\\b/i,
    label: 'Critical/emergency concept — appears in clinical scenario questions where the stakes are highest. Missing this costs you full credit.' },
  { patterns: /\\b(mechanism|pathway|cascade|receptor|enzyme|inhibit|activat|signal)\\b/i,
    label: 'Core mechanism — understanding the why behind this concept lets you answer questions you have never seen before by reasoning from first principles.' },
  { patterns: /\\b(prevent|prophylax|vaccin|screen|public health|hygiene|sanitiz)\\b/i,
    label: 'Prevention/public-health angle — HOSA always includes prevention questions, and these terms bridge clinical and community health competencies.' },
  { patterns: /\\b(complication|sequelae|consequence|risk factor|predispos)\\b/i,
    label: 'High-yield complication — questions routinely ask what happens if a condition is untreated or managed incorrectly. Know the downstream effects.' },
  { patterns: /\\b(definition|defined as|refers to|is the|is a process)\\b/i,
    label: 'Foundational definition — every other concept in this event builds on this one. Mastering the definition makes harder questions feel easier.' },
];
const _MK_DEFAULT = 'High-yield concept — this term appears across multiple topic areas and is consistently tested in competitive HOSA events.';

function _mkScore(term) {
  const haystack = ((term.term || '') + ' ' + (term.meaning || '') + ' ' + (term.example || '')).toLowerCase();
  let score = 0;
  _MK_RULES.forEach((r, i) => { if (r.patterns.test(haystack)) score += (10 - i); });
  score += Math.max(0, 5 - Math.floor((term.term || '').length / 8));
  return score;
}

function _mkWhyLabel(term) {
  const haystack = ((term.term || '') + ' ' + (term.meaning || '') + ' ' + (term.example || '')).toLowerCase();
  for (const r of _MK_RULES) { if (r.patterns.test(haystack)) return r.label; }
  return _MK_DEFAULT;
}

function pickMustKnowTerms(n) {
  n = n || 10;
  const scored = TERMS.map(t => ({ t, s: _mkScore(t) }));
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, n).map(x => x.t);
}

function renderMustKnow() {
  try {
    const list = document.getElementById('mk-list');
    if (!list) return;
    const top = pickMustKnowTerms(10);
    list.innerHTML = top.map((term, i) => {
      const def = (term.meaning || '').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
      const why = _mkWhyLabel(term).replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
      const termSafe = (term.term || '').replace(/"/g, '&quot;').replace(/[&<>]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
      return '<div class="mk-card">' +
        '<div class="mk-term">' + termSafe + '</div>' +
        '<div class="mk-meaning">' + def + '</div>' +
        '<div class="mk-why">' + why + '</div>' +
        '<button class="mk-jump" data-mk-term="' + (term.term||'').replace(/"/g,'&quot;') + '">Study this card →</button>' +
        '</div>';
    }).join('');
    list.addEventListener('click', e => {
      const btn = e.target.closest('.mk-jump');
      if (!btn) return;
      const termName = btn.getAttribute('data-mk-term');
      let idx = state.flash.deck.findIndex(c => c.term === termName);
      if (idx === -1) {
        const card = TERMS.find(c => c.term === termName);
        if (!card) return;
        state.flash.deck = [card, ...state.flash.deck.filter(c => c.term !== termName)];
        idx = 0;
      }
      state.flash.index = idx;
      renderFlashcard();
      document.getElementById('mk-body')?.classList.remove('open');
      document.getElementById('mk-toggle')?.classList.remove('open');
    }, { once: true });
  } catch(e) {}
}

document.getElementById('mk-toggle')?.addEventListener('click', () => {
  const body = document.getElementById('mk-body');
  const btn  = document.getElementById('mk-toggle');
  const isOpen = body?.classList.contains('open');
  if (!isOpen && document.getElementById('mk-list')?.children.length === 0) renderMustKnow();
  body?.classList.toggle('open', !isOpen);
  btn?.classList.toggle('open', !isOpen);
});

// ── Cram mode ─────────────────────────────────────────────────'''


def patch_file(fname):
    fpath = os.path.join(BASE, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    errors = []

    # 1. CSS
    if 'must-know-section' in html:
        print(f'SKIP CSS (already done): {fname}')
    elif OLD_CSS_ANCHOR in html:
        html = html.replace(OLD_CSS_ANCHOR, NEW_CSS_ANCHOR, 1)
    else:
        errors.append('CSS anchor not found')

    # 2. HTML
    if 'id="must-know-section"' in html:
        print(f'SKIP HTML (already done): {fname}')
    elif OLD_HTML_ANCHOR in html:
        html = html.replace(OLD_HTML_ANCHOR, NEW_HTML_ANCHOR, 1)
    else:
        errors.append('HTML deck-progress-row anchor not found')

    # 3. JS
    if 'pickMustKnowTerms' in html:
        print(f'SKIP JS (already done): {fname}')
    elif OLD_JS_ANCHOR in html:
        html = html.replace(OLD_JS_ANCHOR, NEW_JS_ANCHOR, 1)
    else:
        errors.append('JS cram anchor not found')

    if errors:
        print(f'ERRORS in {fname}: {errors}')
        return False

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'OK: {fname}')
    return True


ok = err = 0
for fname in FILES:
    if patch_file(fname):
        ok += 1
    else:
        err += 1
print(f'\nDone: {ok} OK, {err} failed')
