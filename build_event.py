#!/usr/bin/env python3
"""Generate a new event page from the sports-medicine.html template.

Every substitution asserts that it matched, so a template drift fails the
build loudly instead of silently shipping a page that still says
"Sports Medicine" somewhere.

Definitions follow the current standard: one short sentence, no examples.
The longer wording lives in `detail`, and `example` stays a separate field.
"""
import html as _html
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
TEMPLATE = os.path.join(BASE, 'sports-medicine.html')
SITE = 'https://hosaprephub.vercel.app/'

MAX_MEANING = 115


def esc(s):
    return _html.escape(s, quote=True)


def js(s):
    """JS double-quoted string literal."""
    return '"' + (s.replace('\\', '\\\\').replace('"', '\\"')
                   .replace('\n', '\\n').replace('\r', '')) + '"'


def terms_js(terms):
    out = ['const TERMS = [']
    last_cat = None
    for t in terms:
        if t['category'] != last_cat:
            out.append('')
            last_cat = t['category']
        parts = ['term: ' + js(t['term']),
                 'type: ' + js(t.get('type', 'concept')),
                 'category: ' + js(t['category']),
                 'meaning: ' + js(t['meaning'])]
        if t.get('detail'):
            parts.append('detail: ' + js(t['detail']))
        if t.get('example'):
            parts.append('example: ' + js(t['example']))
        out.append('  { ' + ', '.join(parts) + ' },')
    out.append('];')
    return '\n'.join(out)


def cat_label_js(cats):
    lines = ['const categoryLabel = c => ({']
    for key, label in cats:
        lines.append("  '%s': '%s'," % (key, label.replace("'", "\\'")))
    lines.append('})[c] || c;')
    return '\n'.join(lines)


def sub_once(src, old, new, what):
    n = src.count(old)
    assert n == 1, 'expected 1 occurrence of %s, found %d' % (what, n)
    return src.replace(old, new, 1)


def build(spec):
    slug = spec['slug']
    name = spec['name']
    terms = spec['terms']

    # ── content rules, enforced ──────────────────────────────────────
    seen = set()
    for t in terms:
        assert t['term'] not in seen, 'duplicate term %r in %s' % (t['term'], slug)
        seen.add(t['term'])
        m = t['meaning']
        assert len(m) <= MAX_MEANING, \
            '%s: definition %d chars (max %d): %r' % (slug, len(m), MAX_MEANING, m)
        assert not re.search(r'\b(e\.g\.|for example|such as)\b', m, re.I), \
            '%s: example inside definition: %r' % (slug, m)
        assert t['category'] in dict(spec['categories']), \
            '%s: term %r has unknown category %r' % (slug, t['term'], t['category'])
    used = {t['category'] for t in terms}
    for key, _ in spec['categories']:
        assert key in used, '%s: category %r has no terms' % (slug, key)

    # Spec text is plain text; esc() adds the entities. Pre-escaping here is
    # how "CPR & First Aid" once rendered as "CPR &amp; First Aid" on the page.
    for field in ('name', 'eyebrow', 'h1_lead', 'h1_em', 'subtitle', 'topics', 'test_blurb'):
        v = spec.get(field, '')
        assert '&amp;' not in v and '&lt;' not in v and '&gt;' not in v, \
            '%s: %s is pre-escaped; pass plain text: %r' % (slug, field, v)

    h = open(TEMPLATE, encoding='utf-8').read()

    # ── data ────────────────────────────────────────────────────────
    block = re.search(r'const TERMS = \[.*?^\];', h, re.DOTALL | re.MULTILINE)
    assert block, 'TERMS array not found in template'
    h = h[:block.start()] + terms_js(terms) + h[block.end():]

    old_cats = re.search(r'const categoryLabel = c => \(\{.*?\}\)\[c\] \|\| c;', h, re.DOTALL)
    assert old_cats, 'categoryLabel not found'
    h = h[:old_cats.start()] + cat_label_js(spec['categories']) + h[old_cats.end():]

    h = sub_once(h, "const DB_PATH = 'sports-medicine';",
                 "const DB_PATH = '%s';" % slug, 'DB_PATH')

    # ── head ────────────────────────────────────────────────────────
    desc = ('%s practice for HOSA competitors: %d terms, spaced-repetition flashcards, '
            '10-question quizzes and timed tests. Free, no account needed.' % (name, len(terms)))
    old_desc = ('Sports Medicine practice for HOSA competitors: 73 terms, spaced-repetition '
                'flashcards, 10-question quizzes and timed tests. Free, no account needed.')
    assert h.count(old_desc) == 3, 'expected 3 description metas, found %d' % h.count(old_desc)
    h = h.replace(old_desc, esc(desc))

    assert h.count('Sports Medicine — HOSA Prep Hub') == 3
    h = h.replace('Sports Medicine — HOSA Prep Hub', esc(name) + ' — HOSA Prep Hub')

    assert h.count(SITE + 'sports-medicine.html') == 2
    h = h.replace(SITE + 'sports-medicine.html', SITE + slug + '.html')

    # ── page furniture ──────────────────────────────────────────────
    h = sub_once(h, '<div class="category-eyebrow">Category 13 — Sports Medicine</div>',
                 '<div class="category-eyebrow">%s</div>' % esc(spec['eyebrow']), 'eyebrow')
    h = sub_once(h, '<h1>Athletic Injury &amp;<br><em>Sports Medicine</em>.</h1>',
                 '<h1>%s<br><em>%s</em>.</h1>' % (esc(spec['h1_lead']), esc(spec['h1_em'])), 'h1')

    old_sub = re.search(r'<div class="subtitle">[^<]*</div>', h)
    assert old_sub, 'subtitle not found'
    h = h[:old_sub.start()] + '<div class="subtitle">%s</div>' % esc(spec['subtitle']) + h[old_sub.end():]

    h = sub_once(h, '<h2>The HOSA Sports Medicine Examination</h2>',
                 '<h2>The HOSA %s Examination</h2>' % esc(name), 'test heading')

    old_intro = re.search(r"<p>A timed assessment modeled on competition conditions\.[^<]*</p>", h)
    assert old_intro, 'test intro not found'
    h = h[:old_intro.start()] + (
        "<p>A timed assessment modeled on competition conditions. You'll be shown %s "
        "drawn from all topic areas. Select the correct definition. No retries, no "
        "feedback until the end.</p>" % esc(spec['test_blurb'])
    ) + h[old_intro.end():]

    h = sub_once(h,
                 '<div class="guide-topics-text">Musculoskeletal anatomy, common sports injuries, '
                 'concussion, orthopedic assessment, rehabilitation, prevention</div>',
                 '<div class="guide-topics-text">%s</div>' % esc(spec['topics']), 'guide topics')

    # ── study tips ──────────────────────────────────────────────────
    tips = re.findall(r'<li class="guide-tip">\s*<span class="guide-tip-num">\d+</span>\s*'
                      r'<span class="guide-tip-text">[^<]*</span>\s*</li>', h)
    assert len(tips) == 6, 'expected 6 guide tips, found %d' % len(tips)
    assert len(spec['tips']) == 6, '%s: need exactly 6 tips, got %d' % (slug, len(spec['tips']))
    for i, (old, new) in enumerate(zip(tips, spec['tips']), start=1):
        rebuilt = ('<li class="guide-tip">\n          <span class="guide-tip-num">%02d</span>\n'
                   '          <span class="guide-tip-text">%s</span>\n        </li>' % (i, esc(new)))
        h = sub_once(h, old, rebuilt, 'guide tip %d' % i)

    # ── stray template comment ──────────────────────────────────────
    h = h.replace('//  DATA — HOSA Medical Terminology by word part',
                  '//  DATA — HOSA %s' % name, 1)

    # ── nothing may still name the template event ───────────────────
    leftovers = [ln for ln in h.split('\n')
                 if 'Sports Medicine' in ln or 'sports-medicine' in ln]
    assert not leftovers, '%s: template event still referenced:\n  %s' % (
        slug, '\n  '.join(l.strip()[:120] for l in leftovers[:5]))

    dst = os.path.join(BASE, slug + '.html')
    open(dst, 'w', encoding='utf-8').write(h)
    return dst, len(terms), len(spec['categories'])


def main(specs):
    for spec in specs:
        dst, n, c = build(spec)
        print('  %-30s %3d terms, %d categories' % (os.path.basename(dst), n, c))


if __name__ == '__main__':
    mods = sys.argv[1:] or ['events_a', 'events_b']
    all_specs = []
    for m in mods:
        all_specs.extend(__import__(m).SPECS)
    main(all_specs)
