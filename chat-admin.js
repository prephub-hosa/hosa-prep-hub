/* ═════════════════════════════════════════════════════════════════
   Admin: every chapter's chat, in one place.

   Lists every chapter — not only the ones that have talked — so you can
   open a line to any founder. Chapters with recent messages float to the
   top, and one you have not read yet carries a dot.

   Opening a chapter gives you both threads (the chapter room and the
   private founder line) and the founder controls: see who the database
   treats as founder, make a member founder, or remove one. A founder who
   signs in with the email their chapter was registered under is verified
   automatically; everyone else needs you to confirm them here.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  function db() { return global.firebase.database(); }
  function ls(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function ago(ts) {
    if (!ts) return '';
    var s = Math.max(0, (Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }
  function seen(slug, thread) { return +ls('hosa::chat-seen::' + slug + '::' + thread) || 0; }

  var CSS = [
    '.ci-banner{border:1px solid #e0a3a3;background:#fbe9e9;color:#7f1d1d;border-radius:10px;padding:14px 16px;font-size:13.5px;line-height:1.55}',
    '.ci-banner code{background:rgba(0,0,0,.06);padding:1px 5px;border-radius:4px}',
    '.ci-list{display:flex;flex-direction:column;gap:6px}',
    '.ci-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid rgba(0,0,0,.1);border-radius:10px;background:var(--bg-card,#fff);cursor:pointer;text-align:left;font:inherit;color:inherit;width:100%}',
    '.ci-row:hover{border-color:#c2182b}',
    '.ci-main{flex:1;min-width:0}',
    '.ci-name{font-weight:700;display:flex;align-items:center;gap:8px}',
    '.ci-dot{width:8px;height:8px;border-radius:50%;background:#dc2626;flex:none}',
    '.ci-sub{font-size:12.5px;color:#777;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ci-tag{font-size:10.5px;font-weight:700;padding:1px 7px;border-radius:99px;white-space:nowrap}',
    '.ci-tag.ok{background:#fdf3d6;border:1px solid #e6c766;color:#8a6100}',
    '.ci-tag.none{background:#f3f3f3;border:1px solid #ddd;color:#888}',
    '.ci-when{font-size:12px;color:#999;white-space:nowrap}',
    '.cd-shade{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:10000}',
    '.cd-drawer{position:fixed;top:0;right:0;bottom:0;width:min(460px,100vw);z-index:10001;background:var(--bg,#faf9f7);display:flex;flex-direction:column;box-shadow:-18px 0 50px -20px rgba(0,0,0,.4)}',
    '.cd-founder{padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.08);font-size:13px;line-height:1.5}',
    '.cd-founder h3{margin:0 0 6px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#888}',
    '.cd-founder select{max-width:220px;padding:5px 8px;border-radius:8px;border:1px solid #ccc;font:inherit}',
    '.cd-founder button{padding:5px 10px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer;font:600 12.5px Inter,system-ui,sans-serif}',
    '.cd-founder button.primary{background:#c2182b;border-color:#c2182b;color:#fff}',
    '.cd-owner{display:flex;align-items:center;gap:8px;margin:3px 0}',
    '.cd-muted{color:#888;font-size:12px}',
    '.cd-chat{flex:1;min-height:0;padding:10px}',
    '.cd-chat .hc-panel{height:100%}'
  ].join('\n');
  function injectCss() {
    if (document.getElementById('ci-css')) return;
    var s = document.createElement('style');
    s.id = 'ci-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /** Chapter names, founder contact details and the member roster. */
  function loadDirectory() {
    function val(p) { return db().ref(p).once('value').then(function (s) { return s.val() || {}; }, function () { return {}; }); }
    return Promise.all([val('chapters'), val('analytics/chapters'), val('leaderboard/level')]).then(function (r) {
      var dir = {};
      [r[0], r[1]].forEach(function (store) {
        Object.keys(store).forEach(function (slug) {
          if (!dir[slug]) dir[slug] = { slug: slug, record: store[slug] || {}, members: [] };
        });
      });
      Object.keys(r[2]).forEach(function (id) {
        var row = r[2][id] || {};
        if (!row.chapter) return;
        var d = dir[row.chapter] || (dir[row.chapter] = { slug: row.chapter, record: { name: row.chapterName }, members: [] });
        d.members.push({ uid: id, name: row.name || id, xp: +row.xp || 0 });
      });
      Object.keys(dir).forEach(function (slug) {
        var rec = dir[slug].record || {};
        dir[slug].name = rec.name || rec.school || slug.replace(/-/g, ' ');
        dir[slug].members.sort(function (a, b) { return b.xp - a.xp; });
      });
      return dir;
    });
  }

  /* ── The drawer ─────────────────────────────────────────────────── */

  var openDrawer = null;
  function closeDrawer() { if (openDrawer) { openDrawer(); openDrawer = null; } }

  function showDrawer(entry, startThread, onClosed) {
    closeDrawer();
    injectCss();
    var shade = document.createElement('div');
    shade.className = 'cd-shade';
    var drawer = document.createElement('div');
    drawer.className = 'cd-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Chat with ' + entry.name);
    var founder = document.createElement('div');
    founder.className = 'cd-founder';
    var chat = document.createElement('div');
    chat.className = 'cd-chat';
    drawer.appendChild(founder);
    drawer.appendChild(chat);
    document.body.appendChild(shade);
    document.body.appendChild(drawer);

    var panel = global.HosaChat.mountPanel(chat, {
      slug: entry.slug, chapterName: entry.name, admin: true, startThread: startThread,
      onClose: function () { closeDrawer(); }
    });

    var slug = entry.slug;
    var ownersRef = db().ref('chat/' + slug + '/owners');
    function renderFounder(owners) {
      var rec = entry.record || {};
      var ids = Object.keys(owners || {}).filter(function (k) { return owners[k] === true; });
      var byUid = {};
      entry.members.forEach(function (m) { byUid[m.uid] = m; });
      var h = '<h3>Founder</h3>';
      if (ids.length) {
        ids.forEach(function (id) {
          h += '<div class="cd-owner"><strong>' + esc((byUid[id] || {}).name || id) + '</strong>'
             + '<button type="button" data-remove="' + esc(id) + '">Remove</button></div>';
        });
      } else {
        h += '<div class="cd-muted">No verified founder yet'
           + (rec.contactEmail ? ' — they are verified automatically if they sign in with <code>' + esc(rec.contactEmail) + '</code>.' : '.')
           + '</div>';
      }
      var others = entry.members.filter(function (m) { return ids.indexOf(m.uid) === -1; });
      if (others.length) {
        h += '<div style="margin-top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">'
           + '<select data-pick><option value="">Make a member founder…</option>'
           + others.map(function (m) { return '<option value="' + esc(m.uid) + '">' + esc(m.name) + '</option>'; }).join('')
           + '</select><button type="button" class="primary" data-assign>Make founder</button></div>';
      } else if (!entry.members.length) {
        h += '<div class="cd-muted" style="margin-top:6px;">No signed-in members yet.</div>';
      }
      if (rec.contactName) {
        h += '<div class="cd-muted" style="margin-top:6px;">Registered by ' + esc(rec.contactName)
           + (rec.contactRole ? ' (' + esc(rec.contactRole) + ')' : '') + '</div>';
      }
      founder.innerHTML = h;
      founder.querySelectorAll('[data-remove]').forEach(function (b) {
        b.addEventListener('click', function () {
          var id = b.getAttribute('data-remove');
          if (!global.confirm('Remove ' + ((byUid[id] || {}).name || id) + ' as founder? They lose the private line to you.')) return;
          ownersRef.child(id).remove().catch(function (e) { alert('Could not remove: ' + (e && e.message)); });
        });
      });
      var assign = founder.querySelector('[data-assign]');
      if (assign) assign.addEventListener('click', function () {
        var id = founder.querySelector('[data-pick]').value;
        if (!id) return;
        ownersRef.child(id).set(true).catch(function (e) { alert('Could not assign: ' + (e && e.message)); });
      });
    }
    var h = ownersRef.on('value', function (s) { renderFounder(s.val() || {}); }, function () {
      founder.innerHTML = '<h3>Founder</h3><div class="cd-muted">Could not read founder data.</div>';
    });

    function onKey(e) { if (e.key === 'Escape') closeDrawer(); }
    shade.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', onKey);
    openDrawer = function () {
      ownersRef.off('value', h);
      panel.destroy();
      document.removeEventListener('keydown', onKey);
      shade.remove();
      drawer.remove();
      if (onClosed) onClosed();
    };
  }

  /* ── The inbox ──────────────────────────────────────────────────── */

  function mountInbox(host, countEl) {
    injectCss();
    host.innerHTML = '<p class="empty">Loading chats…</p>';
    var dir = {}, chat = {}, denied = false;

    function latest(slug) {
      var best = null;
      ['room', 'team'].forEach(function (t) {
        var msgs = ((chat[slug] || {})[t]) || {};
        Object.keys(msgs).forEach(function (k) {
          var m = msgs[k];
          if (m && m.ts && (!best || m.ts > best.ts)) best = { ts: m.ts, name: m.name, text: m.text, role: m.role, thread: t };
        });
      });
      return best;
    }
    function unread(slug) {
      return ['room', 'team'].some(function (t) {
        var msgs = ((chat[slug] || {})[t]) || {};
        return Object.keys(msgs).some(function (k) {
          var m = msgs[k];
          return m && m.ts > seen(slug, t) && m.role !== 'admin';
        });
      });
    }

    function render() {
      if (denied) {
        host.innerHTML = '<div class="ci-banner"><strong>Chat is built but switched off.</strong> '
          + 'The database rules that let people read and post have not been published yet. '
          + 'Open <code>firebase/README.md</code> in the repo for the two-minute setup, then reload this page.</div>';
        if (countEl) countEl.textContent = 'off';
        return;
      }
      var slugs = Object.keys(dir);
      Object.keys(chat).forEach(function (s) { if (slugs.indexOf(s) === -1 && dir[s] === undefined) { dir[s] = { slug: s, name: s.replace(/-/g, ' '), record: {}, members: [] }; slugs.push(s); } });
      slugs.sort(function (a, b) {
        var la = latest(a), lb = latest(b);
        if (la && lb) return lb.ts - la.ts;
        if (la) return -1;
        if (lb) return 1;
        return dir[a].name.localeCompare(dir[b].name);
      });
      var nUnread = slugs.filter(unread).length;
      if (countEl) countEl.textContent = slugs.length + (nUnread ? ' · ' + nUnread + ' unread' : '');
      if (!slugs.length) { host.innerHTML = '<p class="empty">No chapters yet.</p>'; return; }
      var h = '<div class="ci-list">';
      slugs.forEach(function (slug) {
        var d = dir[slug], l = latest(slug);
        var owners = ((chat[slug] || {}).owners) || {};
        var hasFounder = Object.keys(owners).some(function (k) { return owners[k] === true; });
        h += '<button type="button" class="ci-row" data-slug="' + esc(slug) + '" data-thread="' + (l ? l.thread : 'team') + '">'
           + '<div class="ci-main"><div class="ci-name">' + (unread(slug) ? '<span class="ci-dot" aria-label="unread"></span>' : '')
           + esc(d.name) + ' <span class="ci-tag ' + (hasFounder ? 'ok">Founder verified' : 'none">No founder yet') + '</span></div>'
           + '<div class="ci-sub">' + (l
                ? (l.thread === 'team' ? '🔒 ' : '') + esc(l.role === 'admin' ? 'You' : l.name) + ': ' + esc(l.text)
                : d.members.length + ' member' + (d.members.length === 1 ? '' : 's') + ' · no messages yet')
           + '</div></div>'
           + '<div class="ci-when">' + (l ? ago(l.ts) : '') + '</div></button>';
      });
      h += '</div>';
      host.innerHTML = h;
      host.querySelectorAll('.ci-row').forEach(function (row) {
        row.addEventListener('click', function () {
          var slug = row.getAttribute('data-slug');
          showDrawer(dir[slug], row.getAttribute('data-thread'), render);
        });
      });
    }

    loadDirectory().then(function (d) {
      dir = d;
      db().ref('chat').on('value', function (s) { chat = s.val() || {}; denied = false; render(); },
        function () { denied = true; render(); });
    }, function () { host.innerHTML = '<p class="empty">Could not load chapters.</p>'; });
  }

  /** Open a chapter's chat directly (the "Chat" button in the chapters table). */
  function openChapter(slug) {
    loadDirectory().then(function (dir) {
      showDrawer(dir[slug] || { slug: slug, name: slug.replace(/-/g, ' '), record: {}, members: [] }, 'team');
    });
  }

  global.HosaChatAdmin = { mountInbox: mountInbox, openChapter: openChapter };
})(window);
