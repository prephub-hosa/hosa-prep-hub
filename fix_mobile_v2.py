#!/usr/bin/env python3
"""
Round 2 mobile fixes:
1. Tab nav: lock to horizontal-only touch panning (no vertical drift)
2. Flashcard: scrollable face on all sizes so long terms/definitions fit
3. Desktop flashcard text: smaller clamp so long content fits in 8/5 aspect
4. Header on mobile: hide user email, tighten XP pill
5. Quiz options: ensure long text wraps
6. Buttons: prevent text-overflow issues
"""
import os

BASE = "/home/user/hosa-prep-hub"

# 1. Lock tab nav to horizontal panning only — add to base nav.tabs rule
OLD_NAV_TABS = """  nav.tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 48px;
    border: 1px solid var(--rule);
    background: var(--rule);
    width: fit-content;
  }"""

NEW_NAV_TABS = """  nav.tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 48px;
    border: 1px solid var(--rule);
    background: var(--rule);
    width: fit-content;
    max-width: 100%;
    overflow-y: hidden;
    touch-action: pan-x;
    overscroll-behavior-x: contain;
  }"""

# 2. Flashcard face: make content scrollable + reduce desktop term size
OLD_TERM = """  .term {
    font-family: 'Fraunces', serif;
    font-size: clamp(40px, 6vw, 68px);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }"""

NEW_TERM = """  .term {
    font-family: 'Fraunces', serif;
    font-size: clamp(28px, 4.5vw, 56px);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.03em;
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    max-width: 100%;
  }"""

OLD_DEF = """  .definition {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: clamp(22px, 3vw, 30px);
    font-weight: 500;
    line-height: 1.4;
    max-width: 600px;
    color: var(--ink);
  }"""

NEW_DEF = """  .definition {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: clamp(17px, 2.2vw, 24px);
    font-weight: 500;
    line-height: 1.45;
    max-width: 600px;
    color: var(--ink);
    word-break: break-word;
    overflow-wrap: break-word;
  }"""

# 3. Face: allow scroll on desktop for long content (was only mobile)
OLD_FACE = """  .face {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 48px;
    text-align: center;
    transition: opacity 0.25s ease;
  }"""

NEW_FACE = """  .face {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 40px 44px;
    text-align: center;
    transition: opacity 0.25s ease;
    overflow-y: auto;
    overflow-x: hidden;
  }"""

# 4. Flashcard aspect-ratio: keep on desktop but cap at min-height too
OLD_FLASHCARD = """  .flashcard {
    aspect-ratio: 8 / 5;
    background: var(--bg-card);
    border: 1px solid var(--rule);
    position: relative;
    cursor: pointer;
    box-shadow:
      0 1px 0 rgba(0,0,0,0.04),
      0 12px 32px -12px rgba(0,0,0,0.15);
  }"""

NEW_FLASHCARD = """  .flashcard {
    aspect-ratio: 8 / 5;
    min-height: 320px;
    background: var(--bg-card);
    border: 1px solid var(--rule);
    position: relative;
    cursor: pointer;
    box-shadow:
      0 1px 0 rgba(0,0,0,0.04),
      0 12px 32px -12px rgba(0,0,0,0.15);
  }"""

# 5. Quiz term: smaller + wrap
OLD_QUIZ_TERM = """  .quiz-term {
    font-family: 'Fraunces', serif;
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 400;
    line-height: 1.05;
    letter-spacing: -0.03em;
  }"""

NEW_QUIZ_TERM = """  .quiz-term {
    font-family: 'Fraunces', serif;
    font-size: clamp(26px, 4vw, 48px);
    font-weight: 400;
    line-height: 1.1;
    letter-spacing: -0.03em;
    word-break: break-word;
    overflow-wrap: break-word;
  }"""

# 6. Option: word-break baseline
OLD_OPTION = """  .option {
    background: var(--bg-card);
    border: 1px solid var(--rule);
    padding: 20px 24px;
    text-align: left;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 17px;"""

NEW_OPTION = """  .option {
    background: var(--bg-card);
    border: 1px solid var(--rule);
    padding: 20px 24px;
    text-align: left;
    cursor: pointer;
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 17px;
    word-break: break-word;
    overflow-wrap: break-word;"""

# 7. Test intro h2: smaller default + wrap
OLD_TEST_INTRO_H2 = """  .test-intro h2 {
    font-family: 'Fraunces', serif;
    font-size: 36px;
    font-weight: 500;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }"""

NEW_TEST_INTRO_H2 = """  .test-intro h2 {
    font-family: 'Fraunces', serif;
    font-size: clamp(24px, 3.5vw, 36px);
    font-weight: 500;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
    word-break: break-word;
    overflow-wrap: break-word;
  }"""

# 8. Masthead h1: better clamp
OLD_MASTHEAD_H1 = """  .masthead h1 {
    font-family: 'Fraunces', serif;
    font-size: clamp(48px, 7vw, 88px);
    font-weight: 400;"""

NEW_MASTHEAD_H1 = """  .masthead h1 {
    font-family: 'Fraunces', serif;
    font-size: clamp(36px, 6vw, 84px);
    font-weight: 400;
    word-break: break-word;
    overflow-wrap: break-word;"""

# 9. Header user-pill: hide email on mobile (already had .brand changes)
OLD_USER_EMAIL = """  .user-email { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-style: italic; color: var(--ink-soft); }"""
NEW_USER_EMAIL = """  .user-email { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-style: italic; color: var(--ink-soft); }
  @media (max-width: 640px) { .user-email { display: none; } }
  @media (max-width: 480px) { .xp-pill { padding: 3px 8px; font-size: 11px; } .user-pill { gap: 8px; } }"""

# 10. Mobile 480px face padding refinement
OLD_MOBILE_FACE = """    .face {
      position: relative !important; inset: auto !important;
      width: 100%; box-sizing: border-box;
      min-height: 200px; height: auto !important; max-height: 55vh;
      padding: 20px 16px; overflow-y: auto; overflow-x: hidden;
      word-break: break-word; overflow-wrap: break-word; hyphens: auto;
      transform: none !important; backface-visibility: visible !important;
    }"""

NEW_MOBILE_FACE = """    .face {
      position: relative !important; inset: auto !important;
      width: 100%; box-sizing: border-box;
      min-height: 220px; height: auto !important; max-height: 60vh;
      padding: 24px 20px; overflow-y: auto; overflow-x: hidden;
      word-break: break-word; overflow-wrap: break-word; hyphens: auto;
      transform: none !important; backface-visibility: visible !important;
      justify-content: center;
    }
    .face::before { top: 12px; left: 12px; right: 12px; bottom: 12px; }
    .flashcard { min-height: 220px !important; }"""

# 11. Mobile: ensure tab nav locked horizontally there too
OLD_MOBILE_NAV_760 = """    nav.tabs { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; white-space: nowrap; display: flex; flex-wrap: nowrap; }"""
NEW_MOBILE_NAV_760 = """    nav.tabs { width: 100%; overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; scrollbar-width: none; white-space: nowrap; display: flex; flex-wrap: nowrap; touch-action: pan-x; overscroll-behavior: contain; }"""

REPLACEMENTS = [
    (OLD_NAV_TABS, NEW_NAV_TABS),
    (OLD_TERM, NEW_TERM),
    (OLD_DEF, NEW_DEF),
    (OLD_FACE, NEW_FACE),
    (OLD_FLASHCARD, NEW_FLASHCARD),
    (OLD_QUIZ_TERM, NEW_QUIZ_TERM),
    (OLD_OPTION, NEW_OPTION),
    (OLD_TEST_INTRO_H2, NEW_TEST_INTRO_H2),
    (OLD_MASTHEAD_H1, NEW_MASTHEAD_H1),
    (OLD_USER_EMAIL, NEW_USER_EMAIL),
    (OLD_MOBILE_FACE, NEW_MOBILE_FACE),
    (OLD_MOBILE_NAV_760, NEW_MOBILE_NAV_760),
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

for slug in events:
    path = os.path.join(BASE, f"{slug}.html")
    if not os.path.exists(path): continue
    with open(path, 'r') as f: html = f.read()
    orig = html
    misses = []
    for old, new in REPLACEMENTS:
        if old in html:
            html = html.replace(old, new)
        else:
            misses.append(old[:50])
    if html != orig:
        with open(path, 'w') as f: f.write(html)
        print(f"  Updated: {slug}" + (f" (missed {len(misses)})" if misses else ""))
    else:
        print(f"  NO CHANGES: {slug}")

print("Done.")
