#!/usr/bin/env python3
"""Fix kbd-section that accidentally got aria-label and 'Cards' text."""
import os

BASE = "/home/user/hosa-prep-hub"
OLD = '<div class="kbd-section" aria-label="Flashcards">Cards</div>'
NEW = '<div class="kbd-section">Flashcards</div>'

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
    if OLD in html:
        html = html.replace(OLD, NEW)
        with open(path, 'w') as f: f.write(html)
        print(f"  Fixed: {slug}")

print("Done.")
