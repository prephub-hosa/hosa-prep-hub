#!/usr/bin/env python3
"""
Comprehensive mobile revamp for all 60 event pages.
Fixes:
  1. Tabs: short labels + proper scrollable tab bar (no flex:1 clipping)
  2. Masthead h1: smaller minimum on tiny screens
  3. Text overflow: word-break + overflow-wrap everywhere
  4. Card face: no clipping, proper scroll
  5. Rating buttons: 2×2 grid on very small screens
  6. Quiz/test options: better spacing and font sizes
  7. Timer bar: tighter on mobile
  8. Guide tab: single-column, tighter
  9. Header: simpler on mobile
"""
import os, re

BASE = "/home/user/hosa-prep-hub"

# Tab label replacements (keeps aria-label = original text for a11y)
TAB_REPLACEMENTS = {
    '>Flashcards<': ' aria-label="Flashcards">Cards<',
    '>Practice Quiz<': ' aria-label="Practice Quiz">Quiz<',
    '>Timed Test<': ' aria-label="Timed Test">Test<',
    '>Progress<': ' aria-label="Progress">Progress<',
    '>Guide<': ' aria-label="Guide">Guide<',
}

OLD_MOBILE_480 = """  @media (max-width: 480px) {
    header { padding: 12px 16px; }
    main { padding: 20px 14px 48px; }
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
    .flashcard.flipped .face.back  { display: flex !important; }
    .term       { font-size: clamp(18px, 5vw, 26px); }
    .definition { font-size: 15px; line-height: 1.5; }
    .option { padding: 14px; font-size: 16px; }
    .quiz-options { gap: 8px; }
    .results { padding: 28px 16px; }
    .test-intro { padding: 24px 16px; }
    .progress-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat-card { padding: 20px 16px; }
    .stat-card .stat-val { font-size: 40px; }
    .spec-item .spec-val { font-size: 22px; }
    /* ── Mobile tabs: full-width, compact ── */
    nav.tabs { width: 100%; margin-bottom: 28px; }
    nav.tabs button { flex: 1; padding: 11px 4px; font-size: 12px; letter-spacing: 0; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .quiz-question { margin-bottom: 20px; }
  }"""

NEW_MOBILE_760 = """  /* ——— Responsive 760px ——— */
  @media (max-width: 760px) {
    header { padding: 14px 18px; }
    main { padding: 28px 18px 56px; }
    .masthead { grid-template-columns: 1fr; gap: 12px; margin-bottom: 28px; padding-bottom: 20px; }
    .masthead .subtitle { text-align: left; max-width: 100%; font-size: 15px; }
    .masthead h1 { font-size: clamp(36px, 9vw, 72px); }
    nav.tabs { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; white-space: nowrap; display: flex; flex-wrap: nowrap; }
    nav.tabs::-webkit-scrollbar { display: none; }
    nav.tabs button { flex: 0 0 auto; padding: 13px 18px; font-size: 14px; white-space: nowrap; min-height: 48px; }
    .test-specs { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .mastery-row { grid-template-columns: 1fr; gap: 8px; }
    .card-controls { flex-direction: column; gap: 10px; }
    .card-controls > * { width: 100%; justify-content: center; }
    .btn { min-height: 44px; }
    .rating-btns { gap: 8px; }
    .rating-btns .btn { flex: 1; min-height: 52px; font-size: 14px; }
    .face { padding: 28px 20px; }
    .results { padding: 36px 20px; }
    .test-intro { padding: 28px 20px; }
    .option { padding: 15px 18px; font-size: 16px; }
    .progress-grid { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); }
    .quiz-header { flex-wrap: wrap; gap: 8px; }
    .quiz-term { font-size: clamp(28px, 6vw, 44px); }
    .timer-bar { top: 54px; padding: 12px 0; margin-bottom: 28px; }
    .category-bar { gap: 6px; margin-bottom: 28px; }
    .brand { font-size: 18px; }
    /* Guide */
    .guide-layout { grid-template-columns: 1fr; gap: 20px; }
    .guide-panel { padding: 22px 18px; }
    .guide-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  }"""

NEW_MOBILE_480 = """
  /* ——— Responsive 480px ——— */
  @media (max-width: 480px) {
    header { padding: 10px 14px; }
    .brand { font-size: 16px; }
    .brand::before { content: ''; }
    main { padding: 16px 12px 48px; }

    /* Masthead */
    .masthead h1 { font-size: clamp(30px, 8vw, 48px); line-height: 1; }
    .masthead { margin-bottom: 20px; padding-bottom: 16px; }
    .category-eyebrow { font-size: 11px; margin-bottom: 12px; }

    /* Tabs: scrollable row, never clip text */
    nav.tabs { margin-bottom: 20px; }
    nav.tabs button { padding: 11px 14px; font-size: 13px; min-height: 44px; }

    /* Flashcard face: no clipping, grows with content */
    .flashcard { aspect-ratio: unset; min-height: 200px; overflow: hidden; perspective: none; }
    .flashcard-inner { min-height: 200px; height: auto !important; transform-style: flat !important; transition: none !important; }
    .flashcard.flipped .flashcard-inner { transform: none !important; }
    .face {
      position: relative !important; inset: auto !important;
      width: 100%; box-sizing: border-box;
      min-height: 200px; height: auto !important; max-height: 55vh;
      padding: 20px 16px; overflow-y: auto; overflow-x: hidden;
      word-break: break-word; overflow-wrap: break-word; hyphens: auto;
      transform: none !important; backface-visibility: visible !important;
    }
    .face.back { display: none !important; }
    .flashcard.flipped .face.front { display: none !important; }
    .flashcard.flipped .face.back  { display: flex !important; }

    /* Card text */
    .term { font-size: clamp(17px, 5vw, 24px); word-break: break-word; }
    .definition { font-size: 14px; line-height: 1.55; word-break: break-word; overflow-wrap: break-word; }
    .example { font-size: 13px; }

    /* Rating buttons: 2×2 on tiny screens */
    .rating-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .rating-btns .btn { min-height: 48px; font-size: 13px; }

    /* Quiz / Test */
    .quiz-term { font-size: clamp(22px, 7vw, 36px); word-break: break-word; overflow-wrap: break-word; }
    .quiz-prompt { font-size: 11px; }
    .option { padding: 13px 14px; font-size: 15px; word-break: break-word; overflow-wrap: break-word; }
    .quiz-options { gap: 8px; }
    .quiz-question { margin-bottom: 16px; }
    .quiz-header { padding-bottom: 12px; margin-bottom: 20px; font-size: 13px; }
    .quiz-header .meta { font-size: 12px; }

    /* Timed test */
    .timer-bar { top: 48px; padding: 10px 0; margin-bottom: 20px; flex-wrap: wrap; gap: 6px; }
    .timer { font-size: 22px; }
    .timer-progress { min-width: 0; flex: 1; }
    .test-intro { padding: 20px 14px; border-left: none; border-right: none; }
    .test-intro h2 { font-size: 22px; margin-bottom: 14px; }
    .test-intro p { font-size: 15px; }
    .test-specs { grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; padding: 16px 0; }
    .spec-item .spec-label { font-size: 10px; }
    .spec-item .spec-val { font-size: 20px; }

    /* Results */
    .results { padding: 24px 14px; }
    .score-num { font-size: clamp(60px, 18vw, 100px); }

    /* Progress */
    .progress-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .stat-card { padding: 16px 12px; }
    .stat-card .stat-val { font-size: 36px; }
    .mastery-label { font-size: 12px; }

    /* Must-know section */
    .mk-term { font-size: 16px; }
    .mk-meaning { font-size: 14px; }
    .mk-why { font-size: 13px; }

    /* Guide */
    .guide-layout { gap: 16px; }
    .guide-panel { padding: 18px 14px; }
    .guide-panel-title { font-size: 18px; }
    .guide-stat { padding: 12px; }
    .guide-stat-val { font-size: 16px; }
    .guide-tip-text { font-size: 14px; }
    .guide-topics-text { font-size: 13px; }
  }"""

OLD_760_BLOCK = """  /* ——— Responsive ——— */
  @media (max-width: 760px) {
    header { padding: 16px 20px; }
    main { padding: 32px 20px 60px; }
    .masthead { grid-template-columns: 1fr; gap: 16px; }
    .masthead .subtitle { text-align: left; }
    nav.tabs { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    nav.tabs::-webkit-scrollbar { display: none; }
    nav.tabs button { white-space: nowrap; min-height: 44px; }
    .test-specs { grid-template-columns: 1fr; gap: 12px; }
    .mastery-row { grid-template-columns: 1fr; gap: 8px; }
    .card-controls { flex-direction: column; gap: 12px; }
    .card-controls > * { width: 100%; justify-content: center; }
    .btn { min-height: 44px; }
    .rating-btns .btn { flex: 1; min-height: 48px; }
    .face { padding: 32px 24px; }
    .results { padding: 40px 24px; }
    .test-intro { padding: 32px 24px; }
    .option { padding: 16px 18px; }
    .progress-grid { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
  }"""

# Also fix the guide section's inner responsive block added by add_guide_tabs.py
OLD_GUIDE_RESPONSIVE = """  @media (max-width: 760px) {
    .guide-layout { grid-template-columns: 1fr; gap: 24px; }
    .guide-panel { padding: 24px 20px; }
  }"""

NEW_GUIDE_RESPONSIVE = "  /* Guide responsive: handled in main 760px block above */"

# Additional responsive CSS injected after guide block (from add_guide_tabs.py)
OLD_TEST_RESPONSIVE = """
  /* ——— Test section responsive fixes ——— */
  .test-intro { box-sizing: border-box; width: 100%; }
  @media (max-width: 480px) {
    .test-intro { padding: 24px 16px; border-left: none; border-right: none; }
    .test-intro h2 { font-size: 24px; }
    .test-specs { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .spec-item .spec-val { font-size: 20px; }
    .timer-bar { top: 52px; padding: 12px 0; }
    .quiz-term { font-size: clamp(24px, 6vw, 40px); }
    .option { padding: 14px 16px; font-size: 15px; }
    nav.tabs button { padding: 12px 18px; font-size: 14px; }
    .quiz-header { flex-wrap: wrap; gap: 8px; }
  }
"""

NEW_TEST_RESPONSIVE = """
  /* ——— Test section base ——— */
  .test-intro { box-sizing: border-box; width: 100%; }
"""


def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    changed = False

    # 1. Shorten tab labels (if not already done)
    for old, new in TAB_REPLACEMENTS.items():
        if old in html and new not in html:
            html = html.replace(old, new)
            changed = True

    # 2. Replace old 760px responsive block with new combined version
    if OLD_760_BLOCK in html:
        html = html.replace(OLD_760_BLOCK, NEW_MOBILE_760)
        changed = True

    # 3. Replace old 480px block with new comprehensive version
    if OLD_MOBILE_480 in html:
        html = html.replace(OLD_MOBILE_480, NEW_MOBILE_480)
        changed = True

    # 4. Remove duplicate guide responsive block (now merged into 760px)
    if OLD_GUIDE_RESPONSIVE in html:
        html = html.replace(OLD_GUIDE_RESPONSIVE, NEW_GUIDE_RESPONSIVE)
        changed = True

    # 5. Simplify old test responsive (now covered by 480px block)
    if OLD_TEST_RESPONSIVE in html:
        html = html.replace(OLD_TEST_RESPONSIVE, NEW_TEST_RESPONSIVE)
        changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        return True
    return False


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
skipped = 0
for slug in events:
    path = os.path.join(BASE, f"{slug}.html")
    if not os.path.exists(path):
        print(f"  NOT FOUND: {slug}")
        continue
    if process_file(path):
        print(f"  Updated: {slug}")
        updated += 1
    else:
        print(f"  Skipped (no match): {slug}")
        skipped += 1

print(f"\nDone. Updated: {updated}, Skipped: {skipped}")
