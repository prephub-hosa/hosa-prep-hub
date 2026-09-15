/* ═════════════════════════════════════════════════════════════════
   Share kit — turns a chapter's join link into something a founder
   can actually send.

   Four chapters registered and two members joined between them. The
   links were never the problem; asking a 16-year-old to compose a
   pitch for their group chat was. This hands them the message already
   written, one tap to send, and a QR code for the moment that
   converts best: a room of people at a chapter meeting, phones out.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function messageFor(chapterName, link) {
    return 'Hey ' + chapterName + ' — I set us up on HOSA Prep Hub. '
      + 'Free flashcards, quizzes and timed tests for every HOSA event.\n\n'
      + 'Open this link and you unlock two things the site doesn\'t give anyone else: '
      + 'a readiness report that projects your exam score and tells you which categories '
      + 'you\'re weakest in, and printable practice exams with answer keys.\n\n'
      + link + '\n\n'
      + 'No account, nothing to sign up for.';
  }

  /**
   * Render the kit into `host`.
   *   slug / name — chapter identity
   *   link        — the join URL to share
   */
  function mount(host, opts) {
    if (!host) return;
    opts = opts || {};
    var name = opts.name || 'our chapter';
    var link = opts.link || '';
    if (!link) { host.style.display = 'none'; return; }

    var msg = messageFor(name, link);
    var canShare = !!(navigator.share);

    host.style.display = '';
    host.className = (host.className ? host.className + ' ' : '') + 'sk';
    host.innerHTML =
        '<div class="sk-kicker">Share it</div>'
      + '<div class="sk-title">Three ways to get your chapter on</div>'
      + '<p class="sk-sub">The link only works if people actually open it. Pick whichever '
      + 'of these fits how your chapter already talks to each other.</p>'

      + '<div class="sk-step">'
      +   '<div class="sk-n">1</div>'
      +   '<div class="sk-body">'
      +     '<div class="sk-h">Send it to the group chat</div>'
      +     '<p class="sk-p">Already written. Copy it, paste it into GroupMe, Remind, Snap or Instagram.</p>'
      +     '<div class="sk-msg" id="sk-msg">' + esc(msg) + '</div>'
      +     '<div class="sk-row">'
      +       '<button type="button" class="sk-btn" id="sk-copy">Copy message</button>'
      +       (canShare ? '<button type="button" class="sk-btn sk-btn-ghost" id="sk-share">Share…</button>' : '')
      +     '</div>'
      +     '<p class="sk-note" id="sk-copied" role="status"></p>'
      +   '</div>'
      + '</div>'

      + '<div class="sk-step">'
      +   '<div class="sk-n">2</div>'
      +   '<div class="sk-body">'
      +     '<div class="sk-h">Put this on the screen at a meeting</div>'
      +     '<p class="sk-p">The one that actually works. Everyone has a phone out already — '
      +     'they point, they scan, they\'re on your chapter before the meeting ends.</p>'
      +     '<div class="sk-qr-wrap"><canvas id="sk-qr" aria-label="QR code for the chapter join link"></canvas></div>'
      +     '<div class="sk-row">'
      +       '<button type="button" class="sk-btn sk-btn-ghost" id="sk-qr-dl">Download QR</button>'
      +       '<button type="button" class="sk-btn sk-btn-ghost" id="sk-qr-print">Print / project</button>'
      +     '</div>'
      +   '</div>'
      + '</div>'

      + '<div class="sk-step">'
      +   '<div class="sk-n">3</div>'
      +   '<div class="sk-body">'
      +     '<div class="sk-h">Say it out loud once</div>'
      +     '<p class="sk-p">&ldquo;Scan this, it\'s free, it\'s the flashcards for our events — '
      +     'do fifteen minutes before the next meeting and we\'ll see where our chapter ranks.&rdquo;</p>'
      +   '</div>'
      + '</div>';

    // ── QR ──────────────────────────────────────────────────────────
    var canvas = host.querySelector('#sk-qr');
    var qrOk = false;
    try {
      if (global.HosaQR) { global.HosaQR.toCanvas(canvas, link, { scale: 6, quiet: 4 }); qrOk = true; }
    } catch (e) {}
    if (!qrOk) {
      // Never leave a blank box where a code should be.
      var w = host.querySelector('.sk-qr-wrap');
      if (w) w.innerHTML = '<p class="sk-note">Couldn\'t draw the code here — the link above still works.</p>';
      var dl = host.querySelector('#sk-qr-dl'), pr = host.querySelector('#sk-qr-print');
      if (dl) dl.style.display = 'none';
      if (pr) pr.style.display = 'none';
    }

    // ── Actions ─────────────────────────────────────────────────────
    var note = host.querySelector('#sk-copied');
    host.querySelector('#sk-copy').addEventListener('click', function () {
      var ok = false;
      try {
        var ta = document.createElement('textarea');
        ta.value = msg;
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select(); ta.setSelectionRange(0, 99999);
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {}
      if (navigator.clipboard) { try { navigator.clipboard.writeText(msg); ok = true; } catch (e) {} }
      note.textContent = ok ? 'Copied — paste it into your chapter\'s group chat.'
                            : 'Select the message above and copy it.';
    });

    var shareBtn = host.querySelector('#sk-share');
    if (shareBtn) shareBtn.addEventListener('click', function () {
      try {
        navigator.share({ title: name + ' on HOSA Prep Hub', text: msg, url: link })
          .catch(function () {});
      } catch (e) {}
    });

    if (qrOk) {
      host.querySelector('#sk-qr-dl').addEventListener('click', function () {
        try {
          var a = document.createElement('a');
          a.download = (opts.slug || 'chapter') + '-join-qr.png';
          a.href = canvas.toDataURL('image/png');
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        } catch (e) {}
      });

      host.querySelector('#sk-qr-print').addEventListener('click', function () {
        var img;
        try { img = canvas.toDataURL('image/png'); } catch (e) { return; }
        var w = window.open('', '_blank');
        if (!w) return;
        w.document.write(
            '<!doctype html><meta charset="utf-8"><title>' + esc(name) + ' — join</title>'
          + '<style>@page{margin:14mm}body{margin:0;font-family:system-ui,-apple-system,sans-serif;'
          + 'text-align:center;display:flex;flex-direction:column;align-items:center;'
          + 'justify-content:center;min-height:92vh;color:#111}'
          + 'h1{font-size:44px;letter-spacing:-.03em;margin:0 0 6px}'
          + 'h2{font-size:23px;font-weight:500;color:#b91c1c;margin:0 0 26px}'
          + 'img{width:340px;height:340px;image-rendering:pixelated}'
          + 'p{font-size:17px;color:#555;margin:22px 0 0}'
          + 'code{font-size:15px;color:#333;word-break:break-all}</style>'
          + '<h1>' + esc(name) + '</h1><h2>Scan to join our HOSA Prep Hub chapter</h2>'
          + '<img src="' + img + '" alt="">'
          + '<p>Free flashcards, quizzes and timed tests for every HOSA event.<br>'
          + 'No account needed &mdash; everything you study counts toward our chapter.</p>'
          + '<p><code>' + esc(link) + '</code></p>'
        );
        w.document.close();
        setTimeout(function () { try { w.print(); } catch (e) {} }, 350);
      });
    }
  }

  global.HosaShareKit = { mount: mount, messageFor: messageFor };
})(window);
