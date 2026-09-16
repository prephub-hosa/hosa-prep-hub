#!/usr/bin/env python3
"""Register the new event pages everywhere index.html and the sitemap list events.

An event that exists as a page but is missing from one of these lists is
invisible in exactly one place, which is worse than not shipping it. Every
insertion asserts, and the script is idempotent — re-running it changes nothing.
"""
import html as _html
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SITE = 'https://hosaprephub.vercel.app/'

# slug, display name, group, card description, difficulty, picker blurb,
# interest keys, and three searchable terms.
NEW = [
    dict(slug='cpr-first-aid', name='CPR & First Aid', em='First Aid', lead='CPR &',
         group='allied', level='beginner',
         desc='Chain of survival, adult and pediatric CPR, AED use, choking relief, bleeding control, '
              'burns and medical emergencies — the skills every health career starts with.',
         blurb='Compressions, AED, choking and bleeding control. The most universally useful event on the site.',
         interests=['emergency', 'patient-care'],
         search=[('Chain of Survival', 'The sequence of actions giving a cardiac arrest victim the best chance of living'),
                 ('Abdominal Thrusts', 'Inward and upward thrusts above the navel to expel an airway obstruction'),
                 ('Tourniquet', 'A constricting band placed on a limb to stop life-threatening bleeding')]),

    dict(slug='disaster-preparedness', name='Disaster Preparedness', em='Preparedness', lead='Disaster',
         group='allied', level='intermediate',
         desc='Incident command, START triage, light search and rescue, hazard types, shelters and '
              'disaster psychology — the CERT curriculum for community response.',
         blurb='Incident command, mass-casualty triage and community response. Pairs with CPR & First Aid.',
         interests=['emergency', 'public-health'],
         search=[('START Triage', 'A rapid system sorting mass-casualty victims in under a minute each'),
                 ('Incident Command System', 'A standard management structure for organizing people and resources at an incident'),
                 ('Span of Control', 'The number of people one supervisor can effectively direct — three to seven')]),

    dict(slug='parliamentary-procedure', name='Parliamentary Procedure', em='Procedure', lead='Parliamentary',
         group='basic', level='intermediate',
         desc='Motions, the order of precedence, debate and voting, officers and minutes — '
              "Robert's Rules of Order as HOSA tests it.",
         blurb="Motions, precedence and voting from Robert's Rules. A leadership event with a real written test.",
         interests=['public-health'],
         search=[('Order of Precedence', 'The ranking deciding which motion may be made while another is pending'),
                 ('Quorum', 'The minimum number of members who must be present to transact business'),
                 ('Previous Question', 'A motion to end debate immediately and vote, requiring two-thirds')]),

    dict(slug='job-seeking-skills', name='Job Seeking Skills', em='Job Seeking', lead='Résumés &',
         group='basic', level='beginner',
         desc='Résumé formats, cover letters, applications, interview types, the STAR method, '
              'professionalism and employment law — for Job Seeking and Interviewing Skills.',
         blurb='Résumés, the STAR method and interview technique. Useful well beyond the competition.',
         interests=['public-health'],
         search=[('STAR Method', 'Situation, Task, Action, Result — a structure for answering behavioral questions'),
                 ('Chronological Résumé', 'A résumé listing experience in reverse order, most recent first'),
                 ('Illegal Interview Question', 'A question about a protected characteristic rather than ability to do the job')]),

    dict(slug='medical-coding-billing', name='Medical Coding & Billing', em='Medical Billing', lead='Coding &',
         group='allied', level='intermediate',
         desc='ICD-10-CM, CPT and HCPCS coding, modifiers, the revenue cycle, insurance plans, '
              'claims and denials, and billing compliance.',
         blurb='ICD-10, CPT, modifiers and the revenue cycle. The business side of healthcare.',
         interests=['public-health'],
         search=[('ICD-10-CM', 'The U.S. code set for reporting diagnoses and reasons for a visit'),
                 ('Medical Necessity', 'The requirement that a service be appropriate for the diagnosis reported'),
                 ('Upcoding', 'Reporting a higher-paying code than the documentation supports')]),

    dict(slug='biostatistics-research', name='Biostatistics & Research', em='Research Methods', lead='Biostatistics &',
         group='basic', level='advanced',
         desc='Study designs and the evidence hierarchy, sampling and bias, descriptive and inferential '
              'statistics, diagnostic accuracy and research ethics.',
         blurb='Study design, p-values, sensitivity and specificity. The event that makes every other one easier to read.',
         interests=['lab-research', 'public-health'],
         search=[('Sensitivity', 'The proportion of people with a disease that a test correctly identifies'),
                 ('Confounding', 'Distortion of an association by a third factor related to both exposure and outcome'),
                 ('P-Value', 'The probability of a result at least this extreme if the null hypothesis were true')]),

    dict(slug='addiction-medicine', name='Addiction Medicine', em='Addiction Medicine', lead='Substance Use &',
         group='clinical', level='advanced',
         desc='The reward pathway, substance classes, intoxication and withdrawal, screening tools, '
              'medication for opioid use disorder and harm reduction.',
         blurb='Withdrawal, screening and treatment of substance use disorders. Pairs with Behavioral Health.',
         interests=['mental-health', 'patient-care'],
         search=[('Naloxone', 'An opioid antagonist that reverses overdose within minutes'),
                 ('Delirium Tremens', 'Severe alcohol withdrawal with confusion, hallucinations and autonomic instability'),
                 ('Harm Reduction', 'Reducing the harms of drug use without requiring abstinence first')]),

    dict(slug='cell-biology-histology', name='Cell Biology & Histology', em='Histology', lead='Cell Biology &',
         group='basic', level='intermediate',
         desc='Organelles and their functions, membrane transport, the cell cycle and mitosis, the four '
              'tissue types, and microscopy and staining.',
         blurb='Organelles, transport, mitosis and the four tissue types. The foundation under Anatomy and Lab Science.',
         interests=['lab-research', 'fundamentals'],
         search=[('Mitochondrion', "The organelle producing most of the cell's ATP by aerobic respiration"),
                 ('Basement Membrane', 'The layer anchoring epithelium to the connective tissue beneath'),
                 ('Hematoxylin and Eosin', 'The routine histology stain colouring nuclei blue-purple and cytoplasm pink')]),

    dict(slug='exercise-physiology', name='Exercise Physiology', em='Exercise Physiology', lead='Energy Systems &',
         group='systems', level='intermediate',
         desc='ATP energy systems, muscle fiber types and contraction, cardiorespiratory response, '
              'training principles, exercise testing, and environmental and nutritional factors.',
         blurb='Energy systems, VO2 max and training principles. The physiology behind Sports Medicine.',
         interests=['therapy-rehab', 'fundamentals'],
         search=[('VO2 Max', 'The maximum rate at which the body can use oxygen during exercise'),
                 ('Cardiac Output', 'The volume of blood the heart pumps per minute — rate times stroke volume'),
                 ('Progressive Overload', 'Gradually increasing demand so the body keeps adapting')]),

    dict(slug='occupational-health-safety', name='Occupational Health & Safety', em='Occupational Safety',
         lead='Workplace Hazards &', group='allied', level='beginner',
         desc='OSHA standards, bloodborne pathogens and standard precautions, hazard communication, '
              'PPE and the hierarchy of controls, ergonomics and emergency action.',
         blurb='OSHA, bloodborne pathogens, PPE and ergonomics. What every clinical workplace expects you to know.',
         interests=['patient-care', 'public-health'],
         search=[('Hierarchy of Controls', 'Elimination, substitution, engineering, administrative controls, then PPE'),
                 ('Standard Precautions', "Treating every patient's blood and body fluids as potentially infectious"),
                 ('Safety Data Sheet', "A 16-section document describing a chemical's hazards and safe handling")]),
]


def esc(s):
    return _html.escape(s, quote=True)


def term_count(slug):
    src = open(os.path.join(BASE, slug + '.html'), encoding='utf-8').read()
    block = re.search(r'const TERMS = \[.*?^\];', src, re.DOTALL | re.MULTILINE)
    assert block, 'no TERMS in ' + slug
    return len(re.findall(r'\{\s*term:', block.group(0)))


def cat_count(slug):
    src = open(os.path.join(BASE, slug + '.html'), encoding='utf-8').read()
    block = re.search(r'const categoryLabel = c => \(\{(.*?)\}\)\[c\]', src, re.DOTALL)
    assert block, 'no categoryLabel in ' + slug
    return len(re.findall(r"^\s*'", block.group(1), re.M))


def main():
    path = os.path.join(BASE, 'index.html')
    src = open(path, encoding='utf-8').read()
    changed = 0

    # highest existing card number, so the new cards continue the sequence
    nums = [int(n) for n in re.findall(r'<div class="card-number">(\d+)</div>', src)]
    next_num = max(nums) + 1

    for ev in NEW:
        slug = ev['slug']
        if 'href="%s.html"' % slug in src:
            continue                                   # already registered

        terms, cats = term_count(slug), cat_count(slug)

        # ── 1. event card in the grid ───────────────────────────────
        card = (
            '\n      <a href="{slug}.html" class="category-card" data-group="{group}">\n'
            '        <div class="card-number">{num}</div>\n'
            '        <div class="card-meta">HOSA Competitive Event <span class="card-group-dot"></span></div>\n'
            '        <h3>{lead} <em>{em}</em></h3>\n'
            '        <p class="card-desc">{desc}</p>\n'
            '        <div class="card-stats">\n'
            '          <div class="card-stat">\n'
            '            <div class="stat-num">{terms}</div>\n'
            '            <div class="stat-label">Terms</div>\n'
            '          </div>\n'
            '          <div class="card-stat">\n'
            '            <div class="stat-num">{cats}</div>\n'
            '            <div class="stat-label">Domains</div>\n'
            '          </div>\n'
            '        </div>\n'
            '        <div class="card-cta">\n'
            '          <span>Begin studying</span>\n'
            '          <span class="card-arrow">&rarr;</span>\n'
            '        </div>\n'
            '        <div class="card-progress-wrap" id="cp-{slug}">\n'
            '          <div class="cp-bar-track"><div class="cp-bar-fill"></div></div>\n'
            '          <div class="cp-label"></div>\n'
            '        </div>\n'
            '      </a>\n'
        ).format(slug=slug, group=ev['group'], num=next_num,
                 lead=esc(ev['lead']), em=esc(ev['em']),   # esc handles & — do not pre-escape
                 desc=esc(ev['desc']), terms=terms, cats=cats)
        next_num += 1

        # insert after the last existing card in the grid
        last = None
        for m in re.finditer(r'\n      <a href="[a-z0-9-]+\.html" class="category-card".*?\n      </a>\n',
                             src, re.DOTALL):
            last = m
        assert last, 'no category cards found'
        src = src[:last.end()] + card + src[last.end():]
        changed += 1

        # ── 2. term-count map ───────────────────────────────────────
        anchor = "'medical-terminology':216,"
        assert src.count(anchor) == 1, 'term-count anchor: %d' % src.count(anchor)
        src = src.replace(anchor, "'%s':%d,%s" % (slug, terms, anchor), 1)

        # ── 3. name list used by search and pickers ─────────────────
        anchor = "    {slug:'medical-math',name:'Medical Math'},"
        assert src.count(anchor) == 1
        src = src.replace(anchor, "    {slug:'%s',name:'%s'},\n%s"
                          % (slug, ev['name'].replace("'", "\\'"), anchor), 1)

        # ── 4. difficulty level ─────────────────────────────────────
        anchor = "    'anatomy-physiology':'intermediate',"
        assert src.count(anchor) == 1
        src = src.replace(anchor, "    '%s':'%s',\n%s" % (slug, ev['level'], anchor), 1)

        # ── 5. recommendation picker ────────────────────────────────
        anchor = "    { slug:'anatomy-physiology', name:'Anatomy & Physiology',"
        assert src.count(anchor) == 1
        src = src.replace(anchor, "    { slug:'%s', name:'%s', desc:'%s' },\n%s"
                          % (slug, ev['name'].replace("'", "\\'"),
                             ev['blurb'].replace("'", "\\'"), anchor), 1)

        # ── 6. interest map, so onboarding can recommend it ─────────
        for key in ev['interests']:
            m = re.search(r"('%s':\s*\[)" % re.escape(key), src)
            assert m, 'interest key %r not found' % key
            src = src[:m.end()] + "'%s'," % slug + src[m.end():]

        # ── 7. searchable terms ─────────────────────────────────────
        anchor = "  // Cardiovascular Science"
        assert src.count(anchor) == 1
        rows = ''.join(
            "  {term:'%s', def:'%s', event:'%s', slug:'%s'},\n"
            % (t.replace("'", "\\'"), d.replace("'", "\\'"),
               ev['name'].replace("'", "\\'"), slug)
            for t, d in ev['search'])
        src = src.replace(anchor, rows + anchor, 1)

    open(path, 'w', encoding='utf-8').write(src)
    print('registered %d new events in index.html' % changed)

    # ── sitemap ─────────────────────────────────────────────────────
    sp = os.path.join(BASE, 'sitemap.xml')
    sm = open(sp, encoding='utf-8').read()
    added = 0
    for ev in NEW:
        loc = SITE + ev['slug'] + '.html'
        if loc in sm:
            continue
        template = re.search(
            r'  <url>\s*<loc>%ssports-medicine\.html</loc>.*?</url>\n' % re.escape(SITE),
            sm, re.DOTALL)
        assert template, 'sitemap template entry not found'
        entry = template.group(0).replace(SITE + 'sports-medicine.html', loc)
        sm = sm[:template.end()] + entry + sm[template.end():]
        added += 1
    open(sp, 'w', encoding='utf-8').write(sm)
    print('added %d urls to sitemap.xml' % added)


if __name__ == '__main__':
    main()
