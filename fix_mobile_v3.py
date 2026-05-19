#!/usr/bin/env python3
"""Catch files where fix_mobile.py didn't apply the 480px block due to variant CSS."""
import os, re

BASE = "/home/user/hosa-prep-hub"

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

# Replace 480px responsive block using a regex anchored to comment marker
# Match from "@media (max-width: 480px)" up to the matching closing brace
PATTERN_480 = re.compile(
    r'@media \(max-width: 480px\) \{[^@]*?\n  \}',
    re.DOTALL
)

NEW_480_BLOCK = """@media (max-width: 480px) {
    header { padding: 10px 14px; }
    .brand { font-size: 16px; }
    .brand::before { content: ''; }
    main { padding: 16px 12px 48px; }

    /* Masthead */
    .masthead h1 { font-size: clamp(28px, 7vw, 44px); line-height: 1; }
    .masthead { margin-bottom: 20px; padding-bottom: 16px; }
    .category-eyebrow { font-size: 11px; margin-bottom: 12px; }

    /* Tabs: scrollable row, never clip text, horizontal-only touch */
    nav.tabs { margin-bottom: 20px; overflow-y: hidden; touch-action: pan-x; overscroll-behavior: contain; }
    nav.tabs button { padding: 11px 14px; font-size: 13px; min-height: 44px; }

    /* Flashcard face: no clipping, grows with content */
    .flashcard { aspect-ratio: unset !important; min-height: 220px !important; overflow: hidden; perspective: none; }
    .flashcard-inner { min-height: 220px; height: auto !important; transform-style: flat !important; transition: none !important; }
    .flashcard.flipped .flashcard-inner { transform: none !important; }
    .face {
      position: relative !important; inset: auto !important;
      width: 100%; box-sizing: border-box;
      min-height: 220px; height: auto !important; max-height: 60vh;
      padding: 24px 20px; overflow-y: auto; overflow-x: hidden;
      word-break: break-word; overflow-wrap: break-word; hyphens: auto;
      transform: none !important; backface-visibility: visible !important;
      justify-content: center;
    }
    .face::before { top: 12px; left: 12px; right: 12px; bottom: 12px; }
    .face.back { display: none !important; }
    .flashcard.flipped .face.front { display: none !important; }
    .flashcard.flipped .face.back  { display: flex !important; }

    /* Card text */
    .term { font-size: clamp(18px, 5.5vw, 28px); word-break: break-word; overflow-wrap: break-word; hyphens: auto; max-width: 100%; }
    .definition { font-size: 15px; line-height: 1.5; word-break: break-word; overflow-wrap: break-word; }
    .example { font-size: 13px; margin-top: 14px; padding-top: 12px; }

    /* Rating buttons: 2×2 on tiny screens */
    .rating-btns { display: grid !important; grid-template-columns: 1fr 1fr; gap: 8px; }
    .rating-btns .btn { min-height: 48px; font-size: 13px; }

    /* Quiz / Test */
    .quiz-term { font-size: clamp(22px, 6.5vw, 36px); word-break: break-word; overflow-wrap: break-word; }
    .quiz-prompt { font-size: 11px; }
    .option { padding: 14px 16px; font-size: 15px; word-break: break-word; overflow-wrap: break-word; }
    .quiz-options { gap: 8px; }
    .quiz-question { margin-bottom: 18px; }
    .quiz-header { padding-bottom: 12px; margin-bottom: 22px; font-size: 13px; flex-wrap: wrap; gap: 8px; }

    /* Timed test */
    .timer-bar { top: 48px; padding: 10px 0; margin-bottom: 22px; flex-wrap: wrap; gap: 8px; }
    .timer { font-size: 22px; }
    .timer-progress { min-width: 0; flex: 1; }
    .test-intro { padding: 22px 16px; border-left: none; border-right: none; }
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
    .guide-layout { gap: 16px; grid-template-columns: 1fr; }
    .guide-panel { padding: 18px 14px; }
    .guide-panel-title { font-size: 18px; }
    .guide-stat { padding: 12px; }
    .guide-stat-val { font-size: 16px; }
    .guide-tip-text { font-size: 14px; }
    .guide-topics-text { font-size: 13px; }
  }"""

NEW_760_BLOCK_PATCH = """  /* Tabs: horizontal-only touch on all mobile sizes */"""

# Also normalize the 760px tab nav rule
NAV_760_VARIANTS = [
    "nav.tabs { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; white-space: nowrap; display: flex; flex-wrap: nowrap; }",
    "nav.tabs { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }",
]
NAV_760_NEW = "nav.tabs { width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; white-space: nowrap; display: flex; flex-wrap: nowrap; touch-action: pan-x; overscroll-behavior: contain; }"

count = 0
for slug in events:
    path = os.path.join(BASE, f"{slug}.html")
    if not os.path.exists(path): continue
    with open(path, 'r') as f: html = f.read()
    orig = html

    # Replace any 480px block (only the FIRST one — the main responsive block)
    matches = list(PATTERN_480.finditer(html))
    if matches:
        # Replace only the first (main responsive) block
        m = matches[0]
        html = html[:m.start()] + NEW_480_BLOCK + html[m.end():]

    # Patch the 760px tab nav rule
    for variant in NAV_760_VARIANTS:
        if variant in html and NAV_760_NEW not in html:
            html = html.replace(variant, NAV_760_NEW)
            break

    if html != orig:
        with open(path, 'w') as f: f.write(html)
        count += 1
        print(f"  Updated: {slug}")

print(f"\nDone. {count} files updated.")
