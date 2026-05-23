#!/usr/bin/env python3
"""
Second pass — handles variant files that have slightly different
comment headers and streak call patterns.
"""
import os

BASE = "/home/user/hosa-prep-hub"

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

# Variant 1: old comment header (no "accepts q-value" in comment)
OLD_UPDATE_SR_V1 = """// Core SR update — call instead of bumpSRLevel / setSRLevel
function updateSR(term, qOrBool) {
  const q = typeof qOrBool === 'boolean' ? (qOrBool ? 4 : 0) : qOrBool;
  const correct = q >= 3;
  if (!state.progress.srData) state.progress.srData = {};
  const d = getSRData(term);
  if (correct) {
    d.reps = (d.reps || 0) + 1;
    // Ease adjusts by quality: q=4 normal, q=5 boost, q=2 would be < 3 so not here
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

# rateCard variant: uses updateStreak()/recordStudyDate() instead of checkAndUpdateStreak
OLD_RATE_UPDATE_V1 = """  updateSR(card.term, q);
  showNextReview((state.progress.srData||{})[card.term]?.interval||1);
  updateStreak();
  recordStudyDate();"""

NEW_RATE_UPDATE_V1 = """  updateSR(card.term, q);
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
  updateStreak();
  recordStudyDate();"""

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
    if not os.path.exists(path): continue
    with open(path, 'r') as f: html = f.read()
    orig = html
    if OLD_UPDATE_SR_V1 in html:
        html = html.replace(OLD_UPDATE_SR_V1, NEW_UPDATE_SR)
    if OLD_RATE_UPDATE_V1 in html:
        html = html.replace(OLD_RATE_UPDATE_V1, NEW_RATE_UPDATE_V1)
    if html != orig:
        with open(path, 'w') as f: f.write(html)
        updated += 1
        print(f"  Fixed: {slug}")

print(f"\nDone. {updated} files fixed.")
