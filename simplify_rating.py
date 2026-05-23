#!/usr/bin/env python3
"""Replace 4-button rating (Again/Hard/Good/Easy) with 2-button (Know it / Don't know it).
Keeps hidden #flash-hard and #flash-easy so existing JS listeners don't error."""
import os, glob, re

BASE = "/home/user/hosa-prep-hub"

OLD_VARIANTS = ['''<div class="rating-btns">
          <button class="btn rate-again" id="flash-again">&#x2717; Again</button>
          <button class="btn rate-hard"  id="flash-hard">~ Hard</button>
          <button class="btn rate-good"  id="flash-good">&#x2713; Good</button>
          <button class="btn rate-easy"  id="flash-easy">&#x2605; Easy</button>
        </div>''',
'''<div class="rating-btns">
          <button class="btn rate-again" id="flash-again">✗ Again</button>
          <button class="btn rate-hard"  id="flash-hard">~ Hard</button>
          <button class="btn rate-good"  id="flash-good">✓ Good</button>
          <button class="btn rate-easy"  id="flash-easy">★ Easy</button>
        </div>''']
OLD = OLD_VARIANTS[0]  # kept for back-compat

NEW = '''<div class="rating-btns rating-btns-simple">
          <button class="btn rate-dont-know" id="flash-again">&#x2717; Don't know it</button>
          <button class="btn rate-know" id="flash-good">&#x2713; Know it</button>
          <button id="flash-hard" style="display:none" aria-hidden="true" tabindex="-1"></button>
          <button id="flash-easy" style="display:none" aria-hidden="true" tabindex="-1"></button>
        </div>'''

updated = 0
skipped = 0
for path in sorted(glob.glob(os.path.join(BASE, "*.html"))):
    with open(path, 'r') as f:
        html = f.read()
    matched = False
    for variant in OLD_VARIANTS:
        if variant in html:
            html = html.replace(variant, NEW)
            matched = True
            break
    if matched:
        with open(path, 'w') as f:
            f.write(html)
        updated += 1
        print(f"  Updated: {os.path.basename(path)}")
    elif 'rate-dont-know' in html:
        skipped += 1
    elif 'flash-again' in html and 'rating-btns' in html:
        print(f"  MISS (variant): {os.path.basename(path)}")

print(f"\nDone. {updated} updated, {skipped} already simplified.")
