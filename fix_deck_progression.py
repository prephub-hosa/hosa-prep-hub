"""
fix_deck_progression.py

Replaces buildSmartDeck across all 16 study pages with an Anki-style
new-cards / review-cards split so users actually progress through the
full deck instead of cycling the same weighted cards indefinitely.

New logic:
  - Unseen cards  (never rated): up to half the session (10 of 20)
  - Review cards  (rated before): fill remaining slots, SR-weighted
  - Interleaved   so new and review cards alternate in the session
  - Once ALL cards have been seen, it's 100% SR-weighted review

This guarantees: if you do enough sessions you will see every term,
because new cards always get priority slots over already-seen ones.
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

# The old comment + function that starts buildSmartDeck (common across all pages
# after our previous patches).  We search for the opening line.
BSMD_OPEN = "function buildSmartDeck(pool) {"

# The last line of the old function body (common to all pages after previous patches)
BSMD_CLOSE = "  return deck.slice(0, Math.min(SESSION_SIZE, deck.length));\n}"

NEW_BSMD = """\
// buildSmartDeck — new/review split so users progress through the full deck.
//   Unseen cards (never rated) always get priority slots so every term is
//   eventually seen. Review cards fill remaining slots, weighted by SR level.
function buildSmartDeck(pool) {
  if (!state.flash.srEnabled || pool.length === 0)
    return shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));

  // ── Split pool into unseen and previously-seen cards ──────────────────────
  const unseen = pool.filter(c => !state.progress.studied.has(c.term));
  const seen   = pool.filter(c =>  state.progress.studied.has(c.term));

  // Up to half the session is new cards; rest is SR-weighted review
  const newSlots    = Math.min(Math.ceil(SESSION_SIZE / 2), unseen.length);
  const reviewSlots = Math.min(SESSION_SIZE - newSlots, seen.length);

  // New cards — plain shuffle (all unseen cards are equal priority)
  const newCards = shuffle(unseen).slice(0, newSlots);

  // Review cards — SR-weighted pick (struggles first, mastered rarely)
  function weightedPick(candidates, count) {
    if (!candidates.length || count <= 0) return [];
    const w     = candidates.map(c => ({ card: c, w: SR_WEIGHTS[getSRLevel(c.term)] }));
    const total = w.reduce((s, x) => s + x.w, 0);
    const win   = Math.min(5, Math.floor(candidates.length / 3));
    const result = [], recent = [];
    let att = 0;
    while (result.length < count && att < count * 20) {
      att++;
      let r = Math.random() * total, picked = null;
      for (const x of w) { r -= x.w; if (r <= 0) { picked = x.card; break; } }
      if (!picked) picked = w[w.length - 1].card;
      if (recent.includes(picked.term)) continue;
      result.push(picked);
      recent.push(picked.term);
      if (recent.length > win) recent.shift();
    }
    // top-off if weighted loop didn't fill all slots
    const used = new Set(result.map(c => c.term));
    const leftover = shuffle(candidates.filter(c => !used.has(c.term)));
    result.push(...leftover.slice(0, count - result.length));
    return result;
  }
  const reviewCards = weightedPick(seen, reviewSlots);

  // Interleave: new card, review card, new card, review card …
  // so users don't get all new cards in a block then all reviews
  const deck = [];
  let ni = 0, ri = 0;
  while (ni < newCards.length || ri < reviewCards.length) {
    if (ni < newCards.length)    deck.push(newCards[ni++]);
    if (ri < reviewCards.length) deck.push(reviewCards[ri++]);
  }
  return deck.slice(0, SESSION_SIZE);
}"""

def replace_bsmd(content):
    # Find the opening line
    start = content.find(BSMD_OPEN)
    if start == -1:
        return content, False
    # Find the closing sentinel after the opening
    end = content.find(BSMD_CLOSE, start)
    if end == -1:
        return content, False
    end += len(BSMD_CLOSE)
    # Also strip any old comment block immediately before the function
    # (look back up to 5 lines for comment lines)
    pre = content[:start]
    lines = pre.split('\n')
    while lines and (lines[-1].strip().startswith('//') or lines[-1].strip() == ''):
        lines.pop()
    new_pre = '\n'.join(lines) + '\n'
    new_content = new_pre + NEW_BSMD + '\n' + content[end:]
    return new_content, True

for fn in STUDY_FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content, changed = replace_bsmd(content)
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"  {'OK  ' if changed else 'MISS'} {fn}")

print("\nDone.")
