/* ═════════════════════════════════════════════════════════════════
   Study sets — your own cards, not just the 91 built-in events.

   Storage shape, chosen so a set can be saved without rewriting every
   other one, and so nothing here can be mistaken for event progress:

     hosa::sets::index   [{id, title, count, updatedAt}]
     hosa::set::<id>     the full set

   Both carry a second "::", which is what due.js and pwa.js use to tell
   per-event progress keys apart from everything else.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var INDEX_KEY = 'hosa::sets::index';
  var SET_KEY = 'hosa::set::';
  var MAX_CARDS = 2000;

  function now() { return new Date().toISOString(); }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }   // quota — the caller decides what to say
  }

  /* ── Index ──────────────────────────────────────────────────────── */

  function index() {
    var v = read(INDEX_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function touchIndex(set) {
    var idx = index().filter(function (r) { return r.id !== set.id; });
    idx.unshift({ id: set.id, title: set.title, count: (set.cards || []).length,
                  updatedAt: set.updatedAt, mastered: masteredCount(set) });
    return write(INDEX_KEY, idx);
  }

  /* ── CRUD ───────────────────────────────────────────────────────── */

  function get(id) {
    var s = read(SET_KEY + id, null);
    if (!s || !s.id) return null;
    s.cards = s.cards || [];
    s.stage = s.stage || {};
    s.stats = s.stats || {};
    return s;
  }

  function save(set) {
    set.updatedAt = now();
    if (!write(SET_KEY + set.id, set)) return false;
    touchIndex(set);
    return true;
  }

  function create(title, cards) {
    var set = {
      id: uid('s_'),
      title: String(title || 'Untitled set').trim().slice(0, 90) || 'Untitled set',
      createdAt: now(),
      updatedAt: now(),
      // Which side of the card the question shows. Term-to-definition is the
      // default because that is what the written answers are graded against.
      direction: 'term',
      cards: [],
      stage: {},          // cardId -> 0 unseen, 1 multiple choice passed, 2 mastered
      stats: {}           // cardId -> {right, wrong}
    };
    (cards || []).forEach(function (c) { addCard(set, c.term, c.def); });
    return save(set) ? set : null;
  }

  function addCard(set, term, def) {
    if (set.cards.length >= MAX_CARDS) return null;
    var card = {
      id: uid('c_'),
      term: String(term == null ? '' : term).trim(),
      def: String(def == null ? '' : def).trim()
    };
    set.cards.push(card);
    set.stage[card.id] = 0;
    return card;
  }

  function removeCard(set, cardId) {
    set.cards = set.cards.filter(function (c) { return c.id !== cardId; });
    delete set.stage[cardId];
    delete set.stats[cardId];
  }

  function remove(id) {
    try { localStorage.removeItem(SET_KEY + id); } catch (e) {}
    write(INDEX_KEY, index().filter(function (r) { return r.id !== id; }));
  }

  function rename(id, title) {
    var s = get(id);
    if (!s) return false;
    s.title = String(title || '').trim().slice(0, 90) || s.title;
    return save(s);
  }

  /* ── Progress ───────────────────────────────────────────────────── */

  function masteredCount(set) {
    var n = 0, stage = set.stage || {};
    (set.cards || []).forEach(function (c) { if ((stage[c.id] || 0) >= 2) n++; });
    return n;
  }

  function resetProgress(set) {
    set.stage = {};
    set.stats = {};
    (set.cards || []).forEach(function (c) { set.stage[c.id] = 0; });
    return save(set);
  }

  /* ── Import ─────────────────────────────────────────────────────── */

  // Quizlet lets you choose both separators, because a definition with a
  // comma in it is extremely common and would otherwise split wrongly.
  var PRESETS = {
    tab: '\t',
    comma: ',',
    newline: '\n',
    blankline: '\n\n',
    semicolon: ';',
    dash: ' - '
  };

  function resolveSep(choice, custom) {
    if (choice === 'custom') return String(custom || '');
    return PRESETS[choice] != null ? PRESETS[choice] : String(choice || '');
  }

  /**
   * Parse pasted text into cards.
   *
   * between  — 'tab' | 'comma' | 'dash' | 'custom'   (term vs definition)
   * rows     — 'newline' | 'blankline' | 'semicolon' | 'custom'
   *
   * Returns { cards, skipped, total } — skipped counts rows that had no
   * separator at all, which is the usual sign of the wrong setting.
   */
  function parseImport(text, opts) {
    opts = opts || {};
    var colSep = resolveSep(opts.between || 'tab', opts.betweenCustom);
    var rowSep = resolveSep(opts.rows || 'newline', opts.rowsCustom);
    var out = { cards: [], skipped: 0, total: 0 };
    var src = String(text == null ? '' : text).replace(/\r\n?/g, '\n');
    if (!src.trim()) return out;

    var chunks = rowSep ? src.split(rowSep) : [src];
    chunks.forEach(function (rawRow) {
      // Strip surrounding blank lines, but not the separator itself: a
      // spreadsheet row whose definition cell is empty still ends in a tab,
      // and trimming it first would make that row look separator-less.
      var row = rawRow.replace(/^\n+|\n+$/g, '');
      if (!row.trim()) return;
      out.total++;
      if (!colSep) { out.skipped++; return; }
      var at = row.indexOf(colSep);
      if (at === -1) { out.skipped++; return; }
      // Split on the FIRST separator only: a definition may contain more.
      var term = row.slice(0, at).trim();
      var def = row.slice(at + colSep.length).trim();
      if (!term && !def) return;
      out.cards.push({ term: term, def: def });
    });
    return out;
  }

  /**
   * Guess the separators from the text, the way Quizlet pre-selects them.
   * Tab is chosen when present because pasting from a spreadsheet is the
   * most common route in, and a tab never appears inside a definition.
   */
  function sniff(text) {
    var src = String(text == null ? '' : text).replace(/\r\n?/g, '\n');
    var lines = src.split('\n').filter(function (l) { return l.trim(); });
    if (!lines.length) return { between: 'tab', rows: 'newline' };
    function share(ch) {
      var n = 0;
      lines.forEach(function (l) { if (l.indexOf(ch) !== -1) n++; });
      return n / lines.length;
    }
    var between = 'tab';
    if (share('\t') >= 0.6) between = 'tab';
    else if (share(' - ') >= 0.6) between = 'dash';
    else if (share(',') >= 0.6) between = 'comma';
    // A blank line between cards means definitions may wrap onto new lines.
    var rows = /\n\s*\n/.test(src) && share('\t') < 0.6 ? 'blankline' : 'newline';
    return { between: between, rows: rows };
  }

  /* ── Import from a built-in event ───────────────────────────────── */

  // The event pages hold 3,970 written definitions. Being able to pull a
  // deck straight out of one is far more useful than retyping it.
  function fromEvent(slug, cb) {
    var url = String(slug).replace(/[^a-z0-9-]/g, '') + '.html';
    try {
      fetch(url).then(function (r) { return r.ok ? r.text() : null; }).then(function (html) {
        if (!html) { cb(null); return; }
        cb(extractTerms(html));
      }).catch(function () { cb(null); });
    } catch (e) { cb(null); }
  }

  // Pages quote their fields with either ' or ", depending on when they
  // were written; handle both or half the catalogue comes back empty.
  var FIELD = /(term|meaning|category)\s*:\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')/g;

  function unescape(v) {
    return String(v).replace(/\\(.)/g, function (_, c) {
      return ({ n: '\n', t: '\t', r: '' })[c] != null ? ({ n: '\n', t: '\t', r: '' })[c] : c;
    });
  }

  function extractTerms(html) {
    var block = /const TERMS = \[[\s\S]*?\n\];/.exec(html);
    if (!block) return [];
    var out = [];
    var records = block[0].split(/\{\s*term:/).slice(1);
    records.forEach(function (chunk) {
      var rec = '{ term:' + chunk;
      var d = {}, m;
      FIELD.lastIndex = 0;
      while ((m = FIELD.exec(rec)) !== null) {
        if (d[m[1]] == null) d[m[1]] = unescape(m[2] != null ? m[2] : m[3]);
        if (d.term != null && d.meaning != null && d.category != null) break;
      }
      if (d.term && d.meaning) out.push({ term: d.term, def: d.meaning, category: d.category || '' });
    });
    return out;
  }

  global.HosaSets = {
    index: index,
    get: get,
    save: save,
    create: create,
    remove: remove,
    rename: rename,
    addCard: addCard,
    removeCard: removeCard,
    masteredCount: masteredCount,
    resetProgress: resetProgress,
    parseImport: parseImport,
    sniff: sniff,
    fromEvent: fromEvent,
    extractTerms: extractTerms,
    MAX_CARDS: MAX_CARDS
  };
})(window);
