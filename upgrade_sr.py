#!/usr/bin/env python3
"""
Upgrade the spaced repetition system across all 60 event pages.

Changes:
1. updateSR — proper SM-2 with ease cap (2.5), Hard/Good/Easy calibrated,
   fuzz factor (±10%) to prevent review storms, lapse tracking
2. buildSmartDeck — resets per-session recycle map at deck start
3. rateCard — "Again" re-queues card ~3 cards ahead in current session
   (max 2 requeues); Hard no longer removes from mastered set
4. showNextReview — shows "back this session" when card was recycled
"""
import os, re

BASE = "/home/user/hosa-prep-hub"

# ── 1. updateSR replacement ──────────────────────────────────────────────────

OLD_UPDATE_SR = """// Core SR update — accepts q-value (0=Again,2=Hard,4=Good,5=Easy) or bool
function updateSR(term, qOrBool) {
  const q = typeof qOrBool === 'boolean' ? (qOrBool ? 4 : 0) : qOrBool;
  const correct = q >= 3;
  if (!state.progress.srData) state.progress.srData = {};
  const d = getSRData(term);
  if (correct) {
    d.reps = (d.reps || 0) + 1;
    d.ease = Math.max(1.3, (d.ease || 2.5) + 0.1 - (5 - q) * 0.08);
    if      (d.reps === 1) d.interval = q === 5 ? 3 : 1;
    else if (d.reps === 2) d.interval = q === 5 ? 6 : 4;
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
}"""

NEW_UPDATE_SR = """// Core SR update — SM-2 v2 with proper ease bounds, calibrated ratings,
// fuzz factor, and lapse tracking.
// q: 0=Again, 2=Hard, 4=Good, 5=Easy  (or boolean for quiz compatibility)
function updateSR(term, qOrBool) {
  const q = typeof qOrBool === 'boolean' ? (qOrBool ? 4 : 0) : qOrBool;
  if (!state.progress.srData) state.progress.srData = {};
  const d = getSRData(term);
  // Clamp ease to [1.3, 2.5] — old data may have no upper bound
  const ease = Math.min(2.5, Math.max(1.3, d.ease || 2.5));
  const reps = d.reps || 0;
  const interval = d.interval || 1;
  let ni, ne, nr; // new interval, ease, reps

  if (q === 0) {
    // Again: lapse — card goes back to start, ease penalty
    nr = 0;
    ne = Math.max(1.3, ease - 0.20);
    ni = 1;
  } else if (q === 2) {
    // Hard: correct but slow — small interval growth, ease drops slightly
    nr = reps + 1;
    ne = Math.max(1.3, ease - 0.15);
    ni = reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
  } else if (q === 4) {
    // Good: standard SM-2 — ease unchanged, interval by formula
    nr = reps + 1;
    ne = ease;
    if      (nr === 1) ni = 1;
    else if (nr === 2) ni = 4;
    else               ni = Math.max(nr, Math.round(interval * ease));
  } else {
    // Easy: fast track — ease bonus, larger initial intervals
    nr = reps + 1;
    ne = Math.min(2.5, ease + 0.15);
    if      (nr === 1) ni = 3;
    else if (nr === 2) ni = 7;
    else               ni = Math.max(nr, Math.round(interval * ease * 1.3));
  }

  // Fuzz: ±10% on intervals > 2 days to spread out review load
  if (ni > 2) {
    const fuzz = Math.max(1, Math.floor(ni * 0.10));
    ni += Math.floor(Math.random() * (fuzz * 2 + 1)) - fuzz;
    ni  = Math.max(1, ni);
  }

  const due = new Date();
  due.setDate(due.getDate() + ni);
  state.progress.srData[term] = {
    interval: ni,
    ease:     ne,
    reps:     nr,
    due:      due.toISOString().slice(0, 10),
    lapses:   (d.lapses || 0) + (q === 0 && reps >= 3 ? 1 : 0),
  };
  if (!state.progress.srLevels) state.progress.srLevels = {};
  state.progress.srLevels[term] = Math.min(5, nr);
}"""

# ── 2. showNextReview — add recycled-card message ─────────────────────────────

OLD_SHOW_NEXT = """// Show a brief "next review" hint after rating a card
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
}"""

NEW_SHOW_NEXT = """// Show a brief "next review" hint after rating a card.
// Pass recycled=true when the card was re-queued into this session.
function showNextReview(interval, recycled) {
  const el = document.getElementById('next-review-badge');
  if (!el) return;
  el.textContent = recycled         ? '↻ Showing again this session'
    : interval <= 1                 ? '↻ Due again tomorrow'
    : interval <= 3                 ? `↻ Back in ${interval} days`
    : interval <= 7                 ? `↻ Scheduled — ${interval} days`
    : interval <= 14                ? `↻ Next review in ${interval} days`
    : interval <= 30                ? `↻ Well spaced — ${interval} days`
    :                                 `↻ Mastered — ${interval} days out`;
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = '0'; }, 1800);
}"""

# ── 3. buildSmartDeck — reset recycle map at session start ────────────────────

OLD_BUILD_SMART = """function buildSmartDeck(pool) {
  if (!state.flash.srEnabled || pool.length === 0)
    return shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));

  migrateSRData(); // safe to call repeatedly — no-op after first run
  const today   = getTodayStr();"""

NEW_BUILD_SMART = """function buildSmartDeck(pool) {
  window._srRecycles = {}; // reset per-session requeue counts
  if (!state.flash.srEnabled || pool.length === 0)
    return shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));

  migrateSRData(); // safe to call repeatedly — no-op after first run
  const today   = getTodayStr();"""

# ── 4. rateCard — Again recycling + Hard mastered fix + showNextReview(q) ─────

# The mastered / lastMissed block currently uses `correct = q >= 3`
# We change it so Hard (q=2) leaves mastered state alone.
OLD_RATE_MASTERED = """  const correct = q >= 3;
  state.progress.studied.add(card.term);
  if (correct) state.progress.mastered.add(card.term);
  else { state.progress.mastered.delete(card.term); if (!state.progress.lastMissed) state.progress.lastMissed = []; if (!state.progress.lastMissed.includes(card.term)) state.progress.lastMissed.push(card.term); }"""

NEW_RATE_MASTERED = """  state.progress.studied.add(card.term);
  // Good/Easy → mastered; Again → remove from mastered; Hard → no change
  if (q >= 4) state.progress.mastered.add(card.term);
  else if (q === 0) { state.progress.mastered.delete(card.term); if (!state.progress.lastMissed) state.progress.lastMissed = []; if (!state.progress.lastMissed.includes(card.term)) state.progress.lastMissed.push(card.term); }"""

# The updateSR call + showNextReview — pass q to showNextReview, add recycling
OLD_RATE_UPDATE = """  updateSR(card.term, q);
  showNextReview((state.progress.srData||{})[card.term]?.interval||1);
  if (typeof checkAndUpdateStreak === 'function') checkAndUpdateStreak();"""

NEW_RATE_UPDATE = """  updateSR(card.term, q);
  // Re-queue "Again" cards back into this session (max 2 requeues per card)
  let _recycled = false;
  if (q === 0) {
    if (!window._srRecycles) window._srRecycles = {};
    window._srRecycles[card.term] = (window._srRecycles[card.term] || 0) + 1;
    if (window._srRecycles[card.term] <= 2) {
      const _ins = Math.min(state.flash.deck.length, state.flash.index + 4);
      state.flash.deck.splice(_ins, 0, card);
      _recycled = true;
    }
  }
  showNextReview((state.progress.srData||{})[card.term]?.interval||1, _recycled);
  if (typeof checkAndUpdateStreak === 'function') checkAndUpdateStreak();"""

# ── Apply all replacements ────────────────────────────────────────────────────

REPLACEMENTS = [
    (OLD_UPDATE_SR,      NEW_UPDATE_SR),
    (OLD_SHOW_NEXT,      NEW_SHOW_NEXT),
    (OLD_BUILD_SMART,    NEW_BUILD_SMART),
    (OLD_RATE_MASTERED,  NEW_RATE_MASTERED),
    (OLD_RATE_UPDATE,    NEW_RATE_UPDATE),
]

events = [
    "allergy-immunology","anatomy-physiology","audiology","behavioral-health",
    "biochemistry","biomedical-lab-science","biotechnology","cardiovascular-science",
    "clinical-nursing","dental-science","dermatology","emergency-medical-science",
    "endocrinology","epidemiology","forensic-science","gastroenterology","genetics",
    "geriatrics","global-health","health-informatics","healthcare-systems","hematology",
    "human-growth-development","immunology","infectious-disease","medical-assisting",
    "medical-law-ethics","medical-math","medical-microbiology","medical-terminology",
    "neonatology","nephrology","neurology","nursing-assisting","nutrition",
    "obstetrics-gynecology","occupational-therapy","oncology","optometry","otolaryngology",
    "pain-management","pathophysiology","pediatrics","pharmacology","pharmacy-science",
    "phlebotomy","physical-medicine-rehabilitation","physical-therapy","psychiatry",
    "public-health","radiologic-science","respiratory-therapy","rheumatology",
    "sleep-medicine","speech-language-pathology","sports-medicine","surgical-technology",
    "trauma-critical-care","urology","veterinary-science",
]

updated = 0
for slug in events:
    path = os.path.join(BASE, f"{slug}.html")
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        html = f.read()
    orig = html
    misses = []
    for old, new in REPLACEMENTS:
        if old in html:
            html = html.replace(old, new)
        else:
            misses.append(old.split('\n')[0][:60].strip())
    if html != orig:
        with open(path, 'w') as f:
            f.write(html)
        updated += 1
        if misses:
            print(f"  Updated (with {len(misses)} miss): {slug}")
            for m in misses:
                print(f"    MISS: {m}")
        else:
            print(f"  Updated: {slug}")
    else:
        print(f"  NO CHANGES: {slug}")

print(f"\nDone. {updated} files updated.")
