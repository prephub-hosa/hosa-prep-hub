#!/usr/bin/env python3
"""Regenerate the lists in index.html that are supposed to cover every event.

These were all hand-maintained and had drifted as events were added:

  HOSA_TERMS    164 terms from 38 of 91 events. It feeds the Daily Challenge,
                Match, Speed Drill, Quick Review and Typing games on the home
                page, so more than half the site could never appear in any of
                them — including every event added most recently.
  ALL_EVENTS    80 of 91. Drives the Library tally of what you have studied,
                so studying a missing event counted for nothing there.
  EVENT_LEVEL   80 of 91.
  INTEREST_MAP  68 of 91, so onboarding never recommended the rest.

Generated from the pages themselves, so it cannot drift again silently.
"""
import glob
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SKIP = {'index.html', 'admin.html', 'chapters.html', 'chapter.html'}

PER_EVENT = 5          # terms contributed to the games by each event

# Level and interest for events the hand-written maps never covered.
EXTRA_LEVEL = {
    'clinical-genetics': 'advanced', 'geriatric-psychiatry': 'advanced',
    'health-equity': 'intermediate', 'interventional-cardiology': 'advanced',
    'medical-spelling': 'beginner', 'ophthalmology': 'intermediate',
    'orthopedics': 'intermediate', 'perioperative-care': 'intermediate',
    'transplant-medicine': 'advanced', 'wilderness-medicine': 'intermediate',
    'wound-care': 'intermediate',
}
EXTRA_INTEREST = {
    'anesthesiology': 'surgery', 'clinical-genetics': 'lab-research',
    'geriatric-psychiatry': 'mental-health', 'health-equity': 'public-health',
    'hepatology': 'specialty', 'interventional-cardiology': 'specialty',
    'medical-spelling': 'fundamentals', 'ophthalmology': 'specialty',
    'optometry': 'specialty', 'orthopedics': 'specialty',
    'palliative-care': 'patient-care', 'patient-safety': 'public-health',
    'pediatric-emergency': 'pediatric', 'perioperative-care': 'surgery',
    'prehospital-ems': 'emergency', 'reproductive-health': 'pediatric',
    'sleep-medicine': 'specialty', 'toxicology': 'emergency',
    'transplant-medicine': 'surgery', 'vascular-medicine': 'specialty',
    'veterinary-science': 'lab-research', 'wilderness-medicine': 'emergency',
    'wound-care': 'patient-care', 'pulmonology': 'specialty',
}


def js_str(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


def title_of(slug):
    src = open(os.path.join(BASE, slug + '.html'), encoding='utf-8').read()
    m = re.search(r'<title>(.*?) — HOSA Prep Hub</title>', src)
    assert m, 'no title in ' + slug
    return (m.group(1).replace('&amp;', '&').replace('&#x27;', "'")
                      .replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>'))


# Older pages quote their fields with ', newer ones with ". Handle both —
# parsing only double quotes silently returned zero terms for seven events.
FIELD = re.compile(r'(term|category|meaning)\s*:\s*'
                   r'(?:"((?:[^"\\]|\\.)*)"|\'((?:[^\'\\]|\\.)*)\')')


def unescape(v):
    out, i = [], 0
    while i < len(v):
        c = v[i]
        if c == '\\' and i + 1 < len(v):
            out.append({'n': '\n', 't': '\t', '"': '"', "'": "'", '\\': '\\'}.get(v[i+1], v[i+1]))
            i += 2
        else:
            out.append(c); i += 1
    return ''.join(out)


def terms_of(slug):
    src = open(os.path.join(BASE, slug + '.html'), encoding='utf-8').read()
    block = re.search(r'const TERMS = \[.*?^\];', src, re.DOTALL | re.MULTILINE)
    assert block, 'no TERMS in ' + slug
    out = []
    for rec in re.finditer(r'\{\s*term:.*?\n', block.group(0)):
        d = {k: unescape(dq or sq) for k, dq, sq in FIELD.findall(rec.group(0))}
        if d.get('term') and d.get('meaning'):
            out.append(d)
    return out


def pick(terms, n):
    """Spread the picks across categories, shortest definitions first."""
    by_cat = {}
    for t in terms:
        by_cat.setdefault(t.get('category', ''), []).append(t)
    for v in by_cat.values():
        v.sort(key=lambda t: len(t['meaning']))
    chosen, i = [], 0
    cats = sorted(by_cat)
    while len(chosen) < n and cats:
        progressed = False
        for c in cats:
            if i < len(by_cat[c]) and len(chosen) < n:
                chosen.append(by_cat[c][i]); progressed = True
        if not progressed:
            break
        i += 1
    return chosen


def main():
    events = sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(BASE, '*.html'))
                    if os.path.basename(p) not in SKIP)
    src = open(os.path.join(BASE, 'index.html'), encoding='utf-8').read()

    # ── HOSA_TERMS ──────────────────────────────────────────────────
    rows = []
    for slug in events:
        name = title_of(slug)
        for t in pick(terms_of(slug), PER_EVENT):
            rows.append('  {term:%s, def:%s, event:%s, slug:%s},'
                        % (js_str(t['term']), js_str(t['meaning'].rstrip('.')),
                           js_str(name), js_str(slug)))
    new_block = ('var HOSA_TERMS = [\n'
                 '  // Generated from every event page — see sync_registries.py.\n'
                 '  // Feeds the Daily Challenge, Match, Speed Drill, Quick Review and\n'
                 '  // Typing games, which previously drew from only 38 of the events.\n'
                 + '\n'.join(rows) + '\n];')
    old = re.search(r'var HOSA_TERMS = \[.*?\n\];', src, re.DOTALL)
    assert old, 'HOSA_TERMS not found'
    src = src[:old.start()] + new_block + src[old.end():]
    print('HOSA_TERMS: %d terms from %d events' % (len(rows), len(events)))

    # ── ALL_EVENTS ──────────────────────────────────────────────────
    old = re.search(r'  var ALL_EVENTS = \[.*?\n  \];', src, re.DOTALL)
    assert old, 'ALL_EVENTS not found'
    lines = ['  var ALL_EVENTS = [']
    lines += ['    {slug:%s,name:%s},' % (js_str(s), js_str(title_of(s))) for s in events]
    lines.append('  ];')
    src = src[:old.start()] + '\n'.join(lines) + src[old.end():]
    print('ALL_EVENTS: %d events' % len(events))

    # ── difficulty ──────────────────────────────────────────────────
    old = re.search(r'(  var EVENT_LEVEL = \{|    \'medical-terminology\':\'beginner\')', src)
    m = re.search(r'\{[^{}]*?\'anatomy-physiology\':\'intermediate\'[^{}]*?\}', src, re.DOTALL)
    assert m, 'difficulty map not found'
    existing = dict(re.findall(r"'([a-z0-9-]+)':'(beginner|intermediate|advanced)'", m.group(0)))
    for s in events:
        if s not in existing:
            existing[s] = EXTRA_LEVEL.get(s, 'intermediate')
    body = '{\n' + '\n'.join(
        '    ' + ', '.join("'%s':'%s'" % (s, existing[s]) for s in chunk) + ','
        for chunk in [sorted(existing)[i:i+3] for i in range(0, len(existing), 3)]
    ).rstrip(',') + '\n  }'
    src = src[:m.start()] + body + src[m.end():]
    print('difficulty: %d events' % len(existing))

    # ── interest map ────────────────────────────────────────────────
    m = re.search(r'(var INTEREST_MAP = \{)(.*?)(\n  \};)', src, re.DOTALL)
    assert m, 'INTEREST_MAP not found'
    body = m.group(2)
    added = 0
    for slug in events:
        if ("'%s'" % slug) in body:
            continue
        key = EXTRA_INTEREST.get(slug)
        if not key:
            continue
        km = re.search(r"('%s':\s*\[)" % re.escape(key), body)
        if not km:
            print('  !! interest key %r missing for %s' % (key, slug)); continue
        body = body[:km.end()] + "'%s'," % slug + body[km.end():]
        added += 1
    src = src[:m.start(2)] + body + src[m.end(2):]
    print('interest map: added %d events' % added)

    open(os.path.join(BASE, 'index.html'), 'w', encoding='utf-8').write(src)


if __name__ == '__main__':
    main()
