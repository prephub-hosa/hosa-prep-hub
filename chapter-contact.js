/* ═════════════════════════════════════════════════════════════════
   Direct line to the site owner — chapter founders only.

   IMPORTANT, and the reason this file looks the way it does: this is a
   static site with no server, so nothing here is a real secret. The
   address is assembled at runtime instead of sitting in the markup,
   which stops address-harvesting crawlers and casual readers, and the
   reveal is gated on proving you registered the chapter. Someone who
   reads the JavaScript can still find it. Treat this as "not published
   to the world", not as "only founders can ever obtain it".

   Two ways to qualify as a founder:
     1. You registered on this device  (hosa::chapter-owner)
     2. You can state the contact email on the chapter's record, which
        works on any device and survives cleared storage.
   Members who arrive through a join link never see it, and neither does
   anyone who merely looked a chapter up by school name.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // Never written as one literal, so the page source carries no address.
  function addr() {
    return ['hosa', 'prep'].join('')
      + String.fromCharCode(64)
      + ['gmail', 'com'].join(String.fromCharCode(46));
  }

  function norm(s) { return String(s || '').trim().toLowerCase(); }

  function isOwnerDevice(slug) {
    try { return norm(localStorage.getItem('hosa::chapter-owner')) === norm(slug); }
    catch (e) { return false; }
  }

  function rememberOwner(slug) {
    try { localStorage.setItem('hosa::chapter-owner', slug); } catch (e) {}
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /**
   * Render the founder-only contact block into `host`.
   *   slug   — chapter slug
   *   record — the chapters/{slug} record (needs contactEmail to allow the
   *            email route; without it only the owner-device route works)
   *   name   — chapter name, used in the mail subject
   */
  function mount(host, opts) {
    if (!host) return;
    opts = opts || {};
    var slug = opts.slug || '';
    var record = opts.record || {};
    var chapterName = opts.name || record.name || record.school || slug.replace(/-/g, ' ');
    var onRecord = norm(record.contactEmail);

    // Nothing to verify against and not the registering device: stay silent
    // rather than offering a challenge nobody can pass.
    if (!onRecord && !isOwnerDevice(slug)) { host.innerHTML = ''; host.style.display = 'none'; return; }

    host.style.display = '';
    host.className = (host.className ? host.className + ' ' : '') + 'fc-contact';

    function reveal() {
      rememberOwner(slug);
      var a = addr();
      var subject = encodeURIComponent('HOSA Prep Hub — ' + chapterName);
      host.innerHTML =
          '<div class="fc-contact-kicker">Your direct line</div>'
        + '<div class="fc-contact-title">Email the person who built this</div>'
        + '<p class="fc-contact-sub">You registered ' + esc(chapterName) + ', so you get to reach me directly. '
        + 'Ask for a custom study set for the events your chapter competes in, report anything broken, '
        + 'or tell me what your chapter needs that the site does not do yet. I read all of it.</p>'
        + '<a class="fc-contact-mail" href="mailto:' + a + '?subject=' + subject + '">' + a + '</a>'
        + '<p class="fc-contact-note">Founders only — please don’t post this publicly or pass it to members.</p>';
    }

    function askEmail() {
      host.innerHTML =
          '<div class="fc-contact-kicker">Founders only</div>'
        + '<div class="fc-contact-title">Email the person who built this</div>'
        + '<p class="fc-contact-sub">Whoever registered ' + esc(chapterName) + ' can reach me directly '
        + '— for a custom study set, a bug, or anything your chapter needs. '
        + 'Confirm the email you registered with and I’ll show you the address.</p>'
        + '<div class="fc-contact-row">'
        +   '<input id="fc-contact-input" type="email" autocomplete="email" placeholder="you@school.edu" aria-label="The email you registered this chapter with">'
        +   '<button id="fc-contact-go" type="button">Show me</button>'
        + '</div>'
        + '<p class="fc-contact-err" id="fc-contact-err" role="status"></p>';

      var input = host.querySelector('#fc-contact-input');
      var err = host.querySelector('#fc-contact-err');
      function submit() {
        if (norm(input.value) === onRecord) { reveal(); return; }
        err.textContent = 'That is not the email on record for this chapter.';
      }
      host.querySelector('#fc-contact-go').addEventListener('click', submit);
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
    }

    if (isOwnerDevice(slug)) reveal();
    else askEmail();
  }

  global.HosaChapterContact = { mount: mount, rememberOwner: rememberOwner, isOwnerDevice: isOwnerDevice };
})(window);
