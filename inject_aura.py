#!/usr/bin/env python3
"""Inject aura.css link + aura.js into every HTML page and flip dark to default."""
import os, glob, re

BASE = '/home/user/hosa-prep-hub'

# Old theme bootstrap: forces light if user hasn't picked dark
OLD_BOOTSTRAP = '<script>try{if(localStorage.getItem("hosa-theme")!=="dark")document.documentElement.setAttribute("data-theme","light");}catch(e){}</script>'
# New: dark default; only flip to light if user explicitly chose light
NEW_BOOTSTRAP = '<script>try{if(localStorage.getItem("hosa-theme")==="light")document.documentElement.setAttribute("data-theme","light");}catch(e){}</script>'

# Inject before </head>
AURA_LINK = '<link rel="stylesheet" href="aura.css?v=3">\n<script defer src="aura.js?v=3"></script>\n</head>'

ok = skip = 0
for fp in sorted(glob.glob(os.path.join(BASE, '*.html'))):
    name = os.path.basename(fp)
    with open(fp, 'r', encoding='utf-8') as f: html = f.read()
    orig = html

    # 1) Flip theme bootstrap to dark-default
    if OLD_BOOTSTRAP in html:
        html = html.replace(OLD_BOOTSTRAP, NEW_BOOTSTRAP, 1)

    # 2) Inject aura assets just before </head> (idempotent)
    if 'aura.css' not in html and '</head>' in html:
        html = html.replace('</head>', AURA_LINK, 1)

    if html != orig:
        with open(fp, 'w', encoding='utf-8') as f: f.write(html)
        print('OK:', name)
        ok += 1
    else:
        print('SKIP:', name)
        skip += 1

print(f'\n{ok} updated, {skip} skipped')
