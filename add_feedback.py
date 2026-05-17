#!/usr/bin/env python3
"""Add <script src="feedback-widget.js"></script> to all main pages
   right after firebase-config.js."""
import os, glob

BASE = '/home/user/hosa-prep-hub'
TARGET = '<script src="firebase-config.js"></script>'
INSERT = '<script src="firebase-config.js"></script>\n<script src="feedback-widget.js" defer></script>'

skip = {'admin.html'}  # admin gets its own integration below
pages = [p for p in glob.glob(os.path.join(BASE, '*.html')) if os.path.basename(p) not in skip]

for path in pages:
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()
    if 'feedback-widget.js' in c:
        print(f'  {os.path.basename(path)}: already has widget')
        continue
    if TARGET not in c:
        print(f'  {os.path.basename(path)}: NO firebase-config.js anchor — skipped')
        continue
    c = c.replace(TARGET, INSERT, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f'  {os.path.basename(path)}: widget added')

print('Done.')
