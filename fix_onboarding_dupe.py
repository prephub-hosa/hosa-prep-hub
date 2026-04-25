"""
fix_onboarding_dupe.py

The inline onboarding fix (Firebase-backed modal) only replaced the
opening guard line of the original IIFE. The rest of the old onboarding
code (second var s, var el, document.body.appendChild, addEventListener)
was left behind inside the same IIFE.

For new users (localStorage flag not set) the old leftover code runs and
creates a SECOND #ob-overlay div with NO display:none, producing a
persistent blocking overlay over the entire page. That's why Got it /
Missed it buttons appear to do nothing — the invisible (75% opaque) overlay
is intercepting all clicks.

Fix: strip everything from the start of the stale second style-tag block
to the closing of the stale addEventListener block, keeping the IIFE close.
"""

import os, re

ROOT = r"C:\Users\iamtk\Downloads\correct-source"

STUDY_FILES = [
    'medical-terminology.html', 'pathophysiology.html', 'nutrition.html',
    'biochemistry.html', 'anatomy-physiology.html', 'pharmacology.html',
    'medical-math.html', 'medical-law-ethics.html', 'human-growth-development.html',
    'behavioral-health.html', 'clinical-nursing.html', 'public-health.html',
    'sports-medicine.html', 'biomedical-lab-science.html', 'biotechnology.html',
    'emergency-medical-science.html',
]

# The end of the NEW auth-state listener (keep this)
ANCHOR = "  }).catch(function(){ el.style.display=''; }); // on error, show it\n  });"

# The end of the OLD stale addEventListener block (remove everything between
# ANCHOR and here, then keep the IIFE close)
OLD_END = "    el.remove(); localStorage.setItem('hosa-onboarded-v1','1');\n  });"

# After removing, the script should close cleanly:
# ANCHOR + "\n})();\n"

for fn in STUDY_FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    anchor_pos = content.find(ANCHOR)
    if anchor_pos == -1:
        print(f"  SKIP {fn} — anchor not found")
        continue

    old_end_pos = content.find(OLD_END, anchor_pos)
    if old_end_pos == -1:
        print(f"  OK   {fn} — old code not present (already clean)")
        continue

    # Remove from just after the anchor to the end of OLD_END
    cut_start = anchor_pos + len(ANCHOR)   # right after the new auth listener closes
    cut_end   = old_end_pos + len(OLD_END) # right after the old addEventListener closes

    new_content = content[:cut_start] + content[cut_end:]

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  FIXED {fn}")

print("\nDone.")
