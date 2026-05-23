#!/usr/bin/env python3
"""Add <script src="engage.js" defer></script> to all 60 event pages."""
import os

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

ENGAGE_TAG = '<script src="engage.js" defer></script>'
updated = 0
skipped = 0

for slug in events:
    path = os.path.join(BASE, f"{slug}.html")
    if not os.path.exists(path):
        print(f"  MISSING: {slug}")
        continue
    with open(path, 'r') as f:
        html = f.read()
    if ENGAGE_TAG in html:
        skipped += 1
        continue
    # Insert after the aura.js script tag (any version query string)
    import re
    new_html = re.sub(
        r'(<script[^>]+src="aura\.js[^"]*"[^>]*></script>)',
        r'\1\n' + ENGAGE_TAG,
        html,
        count=1
    )
    if new_html == html:
        # Fallback: insert before </body>
        new_html = html.replace('</body>', ENGAGE_TAG + '\n</body>', 1)
    if new_html != html:
        with open(path, 'w') as f:
            f.write(new_html)
        updated += 1
        print(f"  Added: {slug}")
    else:
        print(f"  NO MATCH: {slug}")

print(f"\nDone. {updated} files updated, {skipped} already had tag.")
