#!/usr/bin/env python3
"""Prevent double-rating: once a card is rated, ignore further clicks until
the deck index advances to a new card."""
import os, glob

BASE = "/home/user/hosa-prep-hub"

OLD = '''function rateCard(q) {
  const card = state.flash.deck[state.flash.index];
  if (!card) return;
  state.progress.studied.add(card.term);'''

NEW = '''function rateCard(q) {
  const card = state.flash.deck[state.flash.index];
  if (!card) return;
  // Guard: ignore double-clicks on the same card
  if (state.flash._ratedIndex === state.flash.index) return;
  state.flash._ratedIndex = state.flash.index;
  state.progress.studied.add(card.term);'''

updated = 0
for path in sorted(glob.glob(os.path.join(BASE, "*.html"))):
    with open(path, 'r') as f:
        html = f.read()
    if '_ratedIndex' in html:
        continue  # already patched
    if OLD in html:
        html = html.replace(OLD, NEW)
        with open(path, 'w') as f:
            f.write(html)
        updated += 1

print(f"Done. {updated} files patched.")
