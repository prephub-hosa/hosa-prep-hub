"""
add_analytics.py
Adds two things to every HTML file in the HOSA Prep Hub:

  1. Analytics IIFE (all 17 pages)
       - Page-view counter   → analytics/pv/{date}/{page}
       - Unique visitor mark → analytics/vis/{date}/{id}
       - Device type count   → analytics/dev/{date}/{mobile|desktop|tablet}
       - Traffic source      → analytics/src/{date}/{direct|google|search|social|other}
       - Session duration    → analytics/sess/{push-id}  (fired on pagehide, ≥5 s)
     All writes use firebase.database.ServerValue.increment so they're atomic.

  2. Guest sync-on-load (study pages only)
       Calls saveProgress() immediately after loadProgress(null) so any
       returning guest's existing localStorage data is mirrored to Firebase
       guest-stats/, making their historical activity visible in admin.html.
"""

import os, re

ROOT = r"C:\Users\iamtk\Downloads\correct-source"

# ── Analytics IIFE template ───────────────────────────────────────────────────
ANALYTICS_TMPL = """\
<script id="hosa-analytics">
(function(){{
  var PAGE_KEY='{page_key}';
  var t0=Date.now();
  var today=new Date().toISOString().slice(0,10);
  var vid=localStorage.getItem('hosa-guest-id');
  if(!vid){{vid='g-'+Math.random().toString(36).slice(2,9)+Date.now().toString(36);localStorage.setItem('hosa-guest-id',vid);}}
  var ua=navigator.userAgent;
  var dev=/Mobi|Android/i.test(ua)?'mobile':/iPad|Tablet/i.test(ua)?'tablet':'desktop';
  var ref=document.referrer,src='direct';
  if(ref){{if(/google\./i.test(ref))src='google';else if(/bing\.|yahoo\./i.test(ref))src='search';else if(/instagram\.|facebook\.|twitter\.|tiktok\.|reddit\./i.test(ref))src='social';else src='other';}}
  var pushed=false;
  function push(uid){{
    if(pushed)return;pushed=true;
    var id=uid||vid;
    var inc=firebase.database.ServerValue.increment(1);
    var u={{}};
    u['analytics/pv/'+today+'/'+PAGE_KEY]=inc;
    u['analytics/vis/'+today+'/'+id]=true;
    u['analytics/dev/'+today+'/'+dev]=inc;
    u['analytics/src/'+today+'/'+src]=inc;
    firebase.database().ref().update(u).catch(function(){{}});
  }}
  firebase.auth().onAuthStateChanged(function(user){{push(user?user.uid:null);}});
  setTimeout(function(){{push(null);}},4000);
  window.addEventListener('pagehide',function(){{
    var dur=Math.round((Date.now()-t0)/1000);
    if(dur<5)return;
    var id=(firebase.auth().currentUser||{{}}).uid||vid;
    firebase.database().ref('analytics/sess').push({{id:id,page:PAGE_KEY,sec:dur,dev:dev,src:src,ts:new Date().toISOString()}}).catch(function(){{}});
  }});
}})();
</script>
</body>
</html>"""

# ── Guest sync-on-load ────────────────────────────────────────────────────────
SYNC_OLD = "    loadProgress(null).then(() => {\n      initFlashcards();"
SYNC_NEW = "    loadProgress(null).then(() => {\n      saveProgress(); // sync localStorage → Firebase guest-stats on load\n      initFlashcards();"

# ── Files ─────────────────────────────────────────────────────────────────────
STUDY_FILES = {
    'medical-terminology.html':    'medical-terminology',
    'pathophysiology.html':        'pathophysiology',
    'nutrition.html':              'nutrition',
    'biochemistry.html':           'biochemistry',
    'anatomy-physiology.html':     'anatomy-physiology',
    'pharmacology.html':           'pharmacology',
    'medical-math.html':           'medical-math',
    'medical-law-ethics.html':     'medical-law-ethics',
    'human-growth-development.html': 'human-growth-development',
    'behavioral-health.html':      'behavioral-health',
    'clinical-nursing.html':       'clinical-nursing',
    'public-health.html':          'public-health',
    'sports-medicine.html':        'sports-medicine',
    'biomedical-lab-science.html': 'biomedical-lab-science',
    'biotechnology.html':          'biotechnology',
    'emergency-medical-science.html': 'emergency-medical-science',
}

ALL_FILES = {'index.html': 'home', **STUDY_FILES}

# ── Apply ─────────────────────────────────────────────────────────────────────
TAIL = "</body>\n</html>"

for fn, page_key in ALL_FILES.items():
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    ok = []

    # 1. Inject analytics before </body></html>
    snippet = ANALYTICS_TMPL.format(page_key=page_key)
    if '<script id="hosa-analytics">' in content:
        ok.append('analytics already present')
    elif content.rstrip().endswith(TAIL):
        content = content.rstrip()[:-len(TAIL)] + snippet + "\n"
        ok.append('analytics injected')
    else:
        ok.append('MISS: could not find </body></html> tail')

    # 2. Guest sync-on-load (study pages only)
    if fn != 'index.html':
        if SYNC_OLD in content:
            content = content.replace(SYNC_OLD, SYNC_NEW, 1)
            ok.append('guest-sync injected')
        else:
            ok.append('MISS: guest-sync pattern not found')

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  {fn:45s}  {' | '.join(ok)}")

print("\nDone.")
