"""
add_guest_tracking.py
Patches saveProgress() in all 16 study pages so guest sessions
also write a lightweight summary to Firebase under guest-stats/{gid}/{category}.
No account needed — the guest ID is a random key stored in localStorage.
"""

import os

ROOT = r"C:\Users\iamtk\Downloads\correct-source"

OLD = """\
  } else {
    try { localStorage.setItem('hosa::' + DB_PATH, JSON.stringify(data)); } catch(e) {}
  }
}"""

NEW = """\
  } else {
    try { localStorage.setItem('hosa::' + DB_PATH, JSON.stringify(data)); } catch(e) {}
    // Mirror a lightweight summary to Firebase so admin can track guest activity
    try {
      let gid = localStorage.getItem('hosa-guest-id');
      if (!gid) {
        gid = 'g-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
        localStorage.setItem('hosa-guest-id', gid);
      }
      firebase.database().ref('guest-stats/' + gid + '/' + DB_PATH).set({
        studied:    data.studied.length,
        mastered:   data.mastered.length,
        questions:  (data.quizzes || []).reduce((s, q) => s + (q.total || 0), 0),
        quizzes:    (data.quizzes || []).length,
        lastActive: new Date().toISOString(),
      }).catch(() => {});
    } catch(e) {}
  }
}"""

FILES = [
    'medical-terminology.html', 'pathophysiology.html', 'nutrition.html', 'biochemistry.html',
    'anatomy-physiology.html', 'pharmacology.html', 'medical-math.html', 'medical-law-ethics.html',
    'human-growth-development.html', 'behavioral-health.html', 'clinical-nursing.html', 'public-health.html',
    'sports-medicine.html', 'biomedical-lab-science.html', 'biotechnology.html', 'emergency-medical-science.html',
]

for fn in FILES:
    fp = os.path.join(ROOT, fn)
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    if OLD in content:
        content = content.replace(OLD, NEW, 1)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  OK  {fn}')
    else:
        print(f'  MISS {fn}')

print('\nDone.')
