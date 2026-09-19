/* ═════════════════════════════════════════════════════════════════
   Study Sets — the tab.

   Everything a learner sees: the list of their sets, the import screen,
   the card editor, flashcards, and Learn. The data lives in sets.js and
   the question logic in learn.js; this file is only the surface.

   It renders into #sets-root, one screen at a time, from a tiny router.
   No framework, because nothing else on this site uses one and a build
   step would be a strange price to pay for one tab.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var S = global.HosaSets, L = global.HosaLearn;
  var root = null;

  /* State for whichever screen is up. Deliberately flat — every screen
     re-renders from the stored set, so there is nothing to keep in sync. */
  var view = { screen: 'list', setId: null };
  var deck = null;           // flashcard mode
  var run = null;            // learn session

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function toast(msg, type) {
    if (typeof global._showToast === 'function') global._showToast(esc(msg), type || 'success');
  }

  function go(screen, setId) {
    view.screen = screen;
    if (setId !== undefined) view.setId = setId;
    render();
    var pane = document.getElementById('tab-sets');
    if (pane) pane.scrollIntoView ? window.scrollTo(0, 0) : null;
  }

  function current() { return view.setId ? S.get(view.setId) : null; }

  /* ── List ───────────────────────────────────────────────────────── */

  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  function listScreen() {
    var sets = S.index();
    var cards = sets.map(function (r) {
      var p = pct(r.mastered || 0, r.count || 0);
      return '' +
        '<button class="set-card" data-open="' + esc(r.id) + '">' +
          '<div class="set-card-top">' +
            '<h3>' + esc(r.title) + '</h3>' +
            '<span class="set-card-count">' + (r.count || 0) + ' term' + (r.count === 1 ? '' : 's') + '</span>' +
          '</div>' +
          '<div class="set-meter"><div class="set-meter-fill" style="width:' + p + '%"></div></div>' +
          '<div class="set-card-foot">' + (r.count ? p + '% mastered' : 'Empty set') + '</div>' +
        '</button>';
    }).join('');

    return '' +
      '<h1 class="page-title">Study Sets</h1>' +
      '<p class="sets-lede">Paste in your own terms — from a class handout, a spreadsheet, or one of the 91 events here — then drill them with flashcards or Learn.</p>' +
      '<div class="sets-actions">' +
        '<button class="sets-btn sets-btn-primary" data-act="new">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
          'Create a set</button>' +
        '<button class="sets-btn" data-act="from-event">Import an event</button>' +
      '</div>' +
      (sets.length
        ? '<div class="sets-grid">' + cards + '</div>'
        : '<div class="sets-empty">' +
            '<p><strong>No sets yet.</strong></p>' +
            '<p>Create one from anything you need to memorise. Learn will ask you multiple choice first, then make you write the definition out once you know it.</p>' +
          '</div>');
  }

  /* ── Import ─────────────────────────────────────────────────────── */

  var draft = { title: '', text: '', between: 'tab', betweenCustom: '', rows: 'newline', rowsCustom: '', fromEvent: '' };

  function sepButtons(name, opts, chosen) {
    return opts.map(function (o) {
      return '<button type="button" class="sep-btn' + (chosen === o[0] ? ' active' : '') +
             '" data-sep="' + name + '" data-val="' + o[0] + '">' + esc(o[1]) + '</button>';
    }).join('');
  }

  /**
   * The preview, and only the preview. Typing in the paste box re-renders
   * this — rebuilding the whole screen on every keystroke would throw away
   * the textarea's undo history and stutter on a long paste.
   */
  function previewHtml() {
    var parsed = S.parseImport(draft.text, draft);
    var rows = parsed.cards.slice(0, 40).map(function (c, i) {
      return '<tr><td class="pv-n">' + (i + 1) + '</td><td>' + esc(c.term) +
             '</td><td>' + (c.def ? esc(c.def) : '<em class="pv-blank">no definition</em>') + '</td></tr>';
    }).join('');

    var warn = '';
    if (parsed.skipped && parsed.skipped >= parsed.total / 2) {
      warn = '<p class="sets-warn">' + parsed.skipped + ' of ' + parsed.total +
             ' rows had no separator in them. Try a different option above — ' +
             'that is almost always what has gone wrong.</p>';
    } else if (parsed.skipped) {
      warn = '<p class="sets-note">' + parsed.skipped + ' row' + (parsed.skipped === 1 ? '' : 's') +
             ' skipped — no separator found.</p>';
    }

    return '' +
      '<div class="pv-head"><strong>' + parsed.cards.length + '</strong> card' + (parsed.cards.length === 1 ? '' : 's') +
        (parsed.cards.length > 40 ? ' <span class="pv-more">(showing the first 40)</span>' : '') + '</div>' +
      warn +
      (parsed.cards.length
        ? '<div class="pv-wrap"><table class="pv-table"><tbody>' + rows + '</tbody></table></div>'
        : '<p class="sets-note">Nothing to preview yet.</p>') +
      '<div class="sets-actions sets-actions-end">' +
        '<button class="sets-btn" data-act="' + (draft.into ? 'back-set' : 'back-list') + '">Cancel</button>' +
        '<button class="sets-btn sets-btn-primary" data-act="create"' + (parsed.cards.length ? '' : ' disabled') + '>' +
          (draft.into ? 'Add to set' : 'Create set') +
          (parsed.cards.length ? ' · ' + parsed.cards.length + ' cards' : '') + '</button>' +
      '</div>';
  }

  function importScreen() {
    var into = draft.into ? S.get(draft.into) : null;
    return '' +
      '<button class="sets-back" data-act="' + (into ? 'back-set' : 'back-list') + '">&larr; ' +
        (into ? esc(into.title) : 'Your sets') + '</button>' +
      '<h1 class="page-title">' + (into ? 'Paste more in' : 'Create a set') + '</h1>' +
      (into
        ? '<p class="sets-lede">These cards are added to <strong>' + esc(into.title) + '</strong>.</p>'
        : '<label class="sets-label" for="set-title">Title</label>' +
          '<input id="set-title" class="sets-input" type="text" maxlength="90" ' +
            'placeholder="e.g. Unit 4 &mdash; Cardiovascular" value="' + esc(draft.title) + '">') +

      '<label class="sets-label" for="set-paste">Paste your terms</label>' +
      '<textarea id="set-paste" class="sets-textarea" rows="10" spellcheck="false" ' +
        'placeholder="Tachycardia&#9;A heart rate over 100 beats per minute&#10;' +
        'Bradycardia&#9;A heart rate under 60 beats per minute">' + esc(draft.text) + '</textarea>' +

      '<div class="sep-grid">' +
        '<div>' +
          '<span class="sets-label">Between term and definition</span>' +
          '<div class="sep-row">' +
            sepButtons('between', [['tab', 'Tab'], ['comma', 'Comma'], ['dash', 'Dash –'], ['custom', 'Custom']], draft.between) +
          '</div>' +
          (draft.between === 'custom'
            ? '<input id="sep-between-custom" class="sets-input sets-input-sm" type="text" maxlength="8" ' +
              'placeholder="e.g. ::" value="' + esc(draft.betweenCustom) + '">'
            : '') +
        '</div>' +
        '<div>' +
          '<span class="sets-label">Between cards</span>' +
          '<div class="sep-row">' +
            sepButtons('rows', [['newline', 'New line'], ['blankline', 'Blank line'], ['semicolon', 'Semicolon'], ['custom', 'Custom']], draft.rows) +
          '</div>' +
          (draft.rows === 'custom'
            ? '<input id="sep-rows-custom" class="sets-input sets-input-sm" type="text" maxlength="8" ' +
              'placeholder="e.g. |" value="' + esc(draft.rowsCustom) + '">'
            : '') +
        '</div>' +
      '</div>' +

      '<div id="pv-zone">' + previewHtml() + '</div>';
  }

  /* ── Import from an event ───────────────────────────────────────── */

  function eventList() {
    // The homepage already knows every event; reuse it rather than keeping
    // a second list that can drift out of date.
    var out = [];
    document.querySelectorAll('#tab-events .category-card[href$=".html"]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var slug = href.replace(/\.html$/, '');
      var h = a.querySelector('h3');
      var name = h ? h.textContent.replace(/\s+/g, ' ').trim() : slug;
      if (slug) out.push({ slug: slug, name: name });
    });
    return out;
  }

  function fromEventScreen() {
    var evs = eventList();
    var opts = evs.map(function (e) {
      return '<option value="' + esc(e.slug) + '">' + esc(e.name) + '</option>';
    }).join('');
    return '' +
      '<button class="sets-back" data-act="back-list">&larr; Your sets</button>' +
      '<h1 class="page-title">Import an event</h1>' +
      '<p class="sets-lede">Pull an event’s terms straight in as a set you can edit, cut down, and learn.</p>' +
      (evs.length
        ? '<label class="sets-label" for="ev-pick">Event</label>' +
          '<select id="ev-pick" class="sets-input">' + opts + '</select>' +
          '<div class="sets-actions sets-actions-end">' +
            '<button class="sets-btn" data-act="back-list">Cancel</button>' +
            '<button class="sets-btn sets-btn-primary" data-act="pull-event">Import terms</button>' +
          '</div>' +
          '<p class="sets-note" id="ev-status"></p>'
        : '<p class="sets-warn">The event list has not loaded. Open the Events tab once, then come back.</p>');
  }

  /* ── Set detail ─────────────────────────────────────────────────── */

  function setScreen() {
    var set = current();
    if (!set) return listScreen();
    var p = L.progress(set);
    var rows = set.cards.map(function (c) {
      var st = (set.stage[c.id] || 0);
      var label = st >= 2 ? 'Mastered' : st >= 1 ? 'Learning' : 'Not started';
      return '<li class="sd-row"><div class="sd-term">' + esc(c.term) + '</div>' +
             '<div class="sd-def">' + esc(c.def) + '</div>' +
             '<span class="sd-stage sd-stage-' + st + '">' + label + '</span></li>';
    }).join('');

    return '' +
      '<button class="sets-back" data-act="back-list">&larr; Your sets</button>' +
      '<h1 class="page-title">' + esc(set.title) + '</h1>' +
      '<div class="sd-stats">' +
        '<span><strong>' + p.total + '</strong> terms</span>' +
        '<span><strong>' + p.mastered + '</strong> mastered</span>' +
        '<span><strong>' + p.learning + '</strong> learning</span>' +
        '<span><strong>' + p.notStarted + '</strong> not started</span>' +
      '</div>' +
      '<div class="set-meter set-meter-lg"><div class="set-meter-fill" style="width:' + pct(p.mastered, p.total) + '%"></div></div>' +

      '<div class="mode-grid">' +
        '<button class="mode-card" data-act="cards"' + (p.total ? '' : ' disabled') + '>' +
          '<span class="mode-name">Flashcards</span>' +
          '<span class="mode-desc">Flip through at your own pace.</span></button>' +
        '<button class="mode-card mode-card-accent" data-act="learn"' + (p.total ? '' : ' disabled') + '>' +
          '<span class="mode-name">Learn</span>' +
          '<span class="mode-desc">Multiple choice until you know it, then write it out.</span></button>' +
      '</div>' +

      '<div class="sets-actions">' +
        '<button class="sets-btn" data-act="edit">Edit cards</button>' +
        '<button class="sets-btn" data-act="rename">Rename</button>' +
        '<button class="sets-btn" data-act="reset">Reset progress</button>' +
        '<button class="sets-btn sets-btn-danger" data-act="delete">Delete set</button>' +
      '</div>' +

      '<h2 class="sets-h2">Cards</h2>' +
      '<ul class="sd-list">' + rows + '</ul>';
  }

  /* ── Editor ─────────────────────────────────────────────────────── */

  function editScreen() {
    var set = current();
    if (!set) return listScreen();
    var rows = set.cards.map(function (c, i) {
      return '<li class="ed-row" data-card="' + esc(c.id) + '">' +
        '<span class="ed-n">' + (i + 1) + '</span>' +
        '<input class="sets-input ed-term" type="text" value="' + esc(c.term) + '" placeholder="Term" aria-label="Term ' + (i + 1) + '">' +
        '<textarea class="sets-input ed-def" rows="2" placeholder="Definition" aria-label="Definition ' + (i + 1) + '">' + esc(c.def) + '</textarea>' +
        '<button class="ed-del" data-act="del-card" data-card="' + esc(c.id) + '" aria-label="Delete card ' + (i + 1) + '">&times;</button>' +
      '</li>';
    }).join('');
    return '' +
      '<button class="sets-back" data-act="back-set">&larr; ' + esc(set.title) + '</button>' +
      '<h1 class="page-title">Edit cards</h1>' +
      '<p class="sets-note">Changes save when you press Save. Deleting a card also clears its progress.</p>' +
      '<ul class="ed-list">' + rows + '</ul>' +
      '<div class="sets-actions sets-actions-end">' +
        '<button class="sets-btn" data-act="add-card">Add a card</button>' +
        '<button class="sets-btn" data-act="paste-more">Paste more in</button>' +
        '<button class="sets-btn sets-btn-primary" data-act="save-edit">Save</button>' +
      '</div>';
  }

  function harvestEdits(set) {
    var byId = {};
    set.cards.forEach(function (c) { byId[c.id] = c; });
    root.querySelectorAll('.ed-row').forEach(function (row) {
      var c = byId[row.getAttribute('data-card')];
      if (!c) return;
      c.term = row.querySelector('.ed-term').value.trim();
      c.def = row.querySelector('.ed-def').value.trim();
    });
  }

  /* ── Flashcards ─────────────────────────────────────────────────── */

  function cardsScreen() {
    var set = current();
    if (!set || !deck) return setScreen();
    var c = deck.order[deck.i];
    if (!c) return setScreen();
    var front = deck.flipped ? c.def : c.term;
    var back = deck.flipped ? c.term : c.def;
    return '' +
      '<button class="sets-back" data-act="back-set">&larr; ' + esc(set.title) + '</button>' +
      '<div class="fc-bar">' +
        '<span class="fc-count">' + (deck.i + 1) + ' / ' + deck.order.length + '</span>' +
        '<button class="sets-btn sets-btn-sm" data-act="fc-flip-side">' +
          (deck.flipped ? 'Definition first' : 'Term first') + '</button>' +
        '<button class="sets-btn sets-btn-sm" data-act="fc-shuffle">Shuffle</button>' +
      '</div>' +
      '<div class="fc-card' + (deck.shown ? ' is-back' : '') + '" id="fc-card" tabindex="0" role="button" ' +
           'aria-label="Flashcard — press space to flip">' +
        '<div class="fc-side fc-front"><span class="fc-hint">' + (deck.flipped ? 'Definition' : 'Term') + '</span>' +
          '<p>' + esc(front) + '</p></div>' +
        '<div class="fc-side fc-back"><span class="fc-hint">' + (deck.flipped ? 'Term' : 'Definition') + '</span>' +
          '<p>' + esc(back) + '</p></div>' +
      '</div>' +
      '<div class="fc-nav">' +
        '<button class="sets-btn" data-act="fc-prev"' + (deck.i ? '' : ' disabled') + '>&larr; Back</button>' +
        '<button class="sets-btn sets-btn-primary" data-act="fc-next">' +
          (deck.i + 1 >= deck.order.length ? 'Finish' : 'Next →') + '</button>' +
      '</div>' +
      '<p class="sets-note fc-keys">Space flips · arrow keys move</p>';
  }

  function startCards(set) {
    deck = { order: L.shuffle(set.cards.filter(function (c) { return c.term || c.def; })),
             i: 0, shown: false, flipped: set.direction === 'def' };
    go('cards');
  }

  /* ── Learn ──────────────────────────────────────────────────────── */

  function startLearn(set) {
    var idf = L.buildIdf(set.cards.map(function (c) {
      return set.direction === 'def' ? c.term : c.def;
    }));
    run = { round: L.buildRound(set), i: 0, idf: idf, result: null,
            right: 0, wrong: 0, roundNo: 1, done: false };
    if (!run.round.length) { toast('Every card in this set is mastered. Reset progress to go again.', 'info'); go('set'); return; }
    go('learn');
  }

  function learnScreen() {
    var set = current();
    if (!set || !run) return setScreen();
    var p = L.progress(set);
    var head = '' +
      '<button class="sets-back" data-act="back-set">&larr; ' + esc(set.title) + '</button>' +
      '<div class="ln-top">' +
        '<div class="ln-progress" aria-label="Question ' + Math.min(run.i + 1, run.round.length) + ' of ' + run.round.length + '">' +
          '<div class="ln-progress-fill" style="width:' + pct(run.i, run.round.length) + '%"></div></div>' +
        '<span class="ln-step">Round ' + run.roundNo + ' · ' + Math.min(run.i + 1, run.round.length) + '/' + run.round.length + '</span>' +
      '</div>';

    if (run.done) {
      return head +
        '<div class="ln-summary">' +
          '<h2>Set complete</h2>' +
          '<p>Every card is mastered. You answered ' + run.right + ' right and ' + run.wrong + ' wrong along the way.</p>' +
          '<div class="sets-actions sets-actions-end">' +
            '<button class="sets-btn" data-act="back-set">Back to the set</button>' +
            '<button class="sets-btn sets-btn-primary" data-act="reset-and-learn">Start over</button>' +
          '</div>' +
        '</div>';
    }

    if (run.i >= run.round.length) {
      return head +
        '<div class="ln-summary">' +
          '<h2>Round ' + run.roundNo + ' done</h2>' +
          '<p><strong>' + run.right + '</strong> right · <strong>' + run.wrong + '</strong> wrong so far.</p>' +
          '<div class="ln-meter-row">' +
            '<div class="set-meter set-meter-lg"><div class="set-meter-fill" style="width:' + pct(p.mastered, p.total) + '%"></div></div>' +
            '<span class="ln-meter-label">' + p.mastered + ' of ' + p.total + ' mastered</span>' +
          '</div>' +
          '<ul class="ln-legend">' +
            '<li><span class="sd-stage sd-stage-0">Not started</span> asked as multiple choice</li>' +
            '<li><span class="sd-stage sd-stage-1">Learning</span> asked as a written answer</li>' +
            '<li><span class="sd-stage sd-stage-2">Mastered</span> out of rotation</li>' +
          '</ul>' +
          '<div class="sets-actions sets-actions-end">' +
            '<button class="sets-btn" data-act="back-set">Done for now</button>' +
            '<button class="sets-btn sets-btn-primary" data-act="next-round">Keep going →</button>' +
          '</div>' +
        '</div>';
    }

    var q = run.round[run.i];
    var r = run.result;
    var body;

    if (q.type === 'choice') {
      body = '<div class="ln-options">' + q.options.map(function (o, i) {
        var cls = 'ln-opt';
        if (r) {
          if (o.correct) cls += ' is-right';
          else if (r.picked === o.text) cls += ' is-wrong';
          else cls += ' is-dim';
        }
        return '<button class="' + cls + '" data-opt="' + i + '"' + (r ? ' disabled' : '') + '>' +
               '<span class="ln-opt-n">' + (i + 1) + '</span>' + esc(o.text) + '</button>';
      }).join('') + '</div>';
    } else {
      body = '' +
        '<label class="sets-label" for="ln-write">Write the definition in your own words</label>' +
        '<textarea id="ln-write" class="sets-textarea ln-write" rows="3" spellcheck="false" ' +
          (r ? 'disabled' : '') + ' placeholder="The main idea is enough — it does not have to match word for word">' +
          esc(r ? r.typed : '') + '</textarea>' +
        (r ? '' : '<div class="sets-actions sets-actions-end">' +
             '<button class="sets-btn" data-act="skip">I don’t know</button>' +
             '<button class="sets-btn sets-btn-primary" data-act="submit">Answer</button></div>');
    }

    var feedback = '';
    if (r) {
      feedback = '<div class="ln-feedback ' + (r.correct ? 'is-right' : 'is-wrong') + '">' +
        '<div class="ln-verdict">' + (r.correct ? 'Correct' : (r.skipped ? 'No problem — here it is' : 'Not quite')) + '</div>' +
        (q.type === 'written' || !r.correct
          ? '<div class="ln-answer"><span>Answer</span><p>' + esc(q.answer) + '</p></div>' : '') +
        (q.type === 'written'
          ? '<button class="ln-override" data-act="override">' +
              (r.correct ? 'Actually, I was wrong' : 'I had the right idea — count it') + '</button>'
          : '') +
        '<div class="sets-actions sets-actions-end">' +
          '<button class="sets-btn sets-btn-primary" data-act="continue">Continue →</button>' +
        '</div>' +
      '</div>';
    }

    return head +
      '<div class="ln-card">' +
        '<span class="ln-kind">' + (q.type === 'choice' ? 'Multiple choice' : 'Written answer') + '</span>' +
        '<p class="ln-prompt">' + esc(q.prompt) + '</p>' +
        body +
        feedback +
      '</div>';
  }

  /**
   * Apply a verdict to the set and to the running tally, remembering what
   * the card looked like beforehand so an override can undo it exactly.
   */
  function settle(correct) {
    var set = current();
    var q = run.round[run.i];
    var before = set.stats[q.cardId] || { right: 0, wrong: 0 };
    run.result.before = { stage: set.stage[q.cardId] || 0, right: before.right, wrong: before.wrong };
    L.record(set, q.cardId, correct);
    S.save(set);
    if (correct) run.right++; else run.wrong++;
  }

  function answerChoice(i) {
    var q = run.round[run.i];
    var o = q.options[i];
    if (!o || run.result) return;
    run.result = { correct: !!o.correct, picked: o.text };

    settle(!!o.correct);
    render();
  }

  function answerWritten(skipped) {
    if (run.result) return;
    var q = run.round[run.i];
    var box = document.getElementById('ln-write');
    var typed = box ? box.value : '';
    if (!skipped && !typed.trim()) { if (box) box.focus(); return; }
    var g = skipped ? { correct: false } : L.gradeWritten(typed, q.answer, run.idf);
    run.result = { correct: !!g.correct, typed: typed, skipped: !!skipped };
    settle(run.result.correct);
    render();
  }

  /**
   * "I was right" / "I was wrong" — the learner has the last word.
   * The grader is lenient but it is still a heuristic, and it would be
   * insulting to move a card backwards over a phrasing it failed to see.
   */
  function override() {
    if (!run.result || !run.result.before) return;
    var set = current();
    var q = run.round[run.i];
    var was = run.result.correct;
    // Put the card back exactly as it was, then apply the other verdict.
    set.stage[q.cardId] = run.result.before.stage;
    set.stats[q.cardId] = { right: run.result.before.right, wrong: run.result.before.wrong };
    L.record(set, q.cardId, !was);
    S.save(set);
    if (was) { run.right--; run.wrong++; } else { run.wrong--; run.right++; }
    run.result.correct = !was;
    render();
  }

  function nextQuestion() {
    run.result = null;
    run.i++;
    render();
  }

  function nextRound() {
    var set = current();
    run.round = L.buildRound(set);
    run.i = 0;
    run.result = null;
    run.roundNo++;
    if (!run.round.length) run.done = true;
    render();
  }

  /* ── Render ─────────────────────────────────────────────────────── */

  function render() {
    if (!root) return;
    var html;
    switch (view.screen) {
      case 'import': html = importScreen(); break;
      case 'from-event': html = fromEventScreen(); break;
      case 'set': html = setScreen(); break;
      case 'edit': html = editScreen(); break;
      case 'cards': html = cardsScreen(); break;
      case 'learn': html = learnScreen(); break;
      default: html = listScreen();
    }
    root.innerHTML = html;
    afterRender();
  }

  function afterRender() {
    if (view.screen === 'import') {
      var t = document.getElementById('set-title');
      var box = document.getElementById('set-paste');
      if (t) t.oninput = function () { draft.title = t.value; };
      if (box) {
        box.oninput = function () {
          var first = !draft.text.trim() && box.value.trim();
          draft.text = box.value;
          // Guess the separators the first time something is pasted in,
          // then leave the learner's choice alone.
          if (first) {
            var g = S.sniff(draft.text);
            draft.between = g.between; draft.rows = g.rows;
            render();
            var again = document.getElementById('set-paste');
            if (again) { again.focus(); try { again.setSelectionRange(again.value.length, again.value.length); } catch (e) {} }
            return;
          }
          refreshPreview();
        };
      }
      var bc = document.getElementById('sep-between-custom');
      if (bc) bc.oninput = function () { draft.betweenCustom = bc.value; refreshPreview(); };
      var rc = document.getElementById('sep-rows-custom');
      if (rc) rc.oninput = function () { draft.rowsCustom = rc.value; refreshPreview(); };
    }
    if (view.screen === 'learn' && run && !run.result) {
      var w = document.getElementById('ln-write');
      if (w) {
        w.focus();
        w.onkeydown = function (e) {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); answerWritten(false); }
        };
      }
    }
    if (view.screen === 'cards') {
      var card = document.getElementById('fc-card');
      if (card) card.focus();
    }
  }

  // Redraw the preview alone, so whatever the learner is typing in keeps
  // its focus, its caret, and its undo history.
  function refreshPreview() {
    var zone = document.getElementById('pv-zone');
    if (zone) zone.innerHTML = previewHtml();
    else render();
  }

  /* ── Events ─────────────────────────────────────────────────────── */

  function onClick(e) {
    if (!root || !e.target || !e.target.closest || !root.contains(e.target)) return;
    var sep = e.target.closest('[data-sep]');
    if (sep) {
      draft[sep.getAttribute('data-sep')] = sep.getAttribute('data-val');
      render();
      return;
    }
    var open = e.target.closest('[data-open]');
    if (open) { go('set', open.getAttribute('data-open')); return; }

    var opt = e.target.closest('[data-opt]');
    if (opt && view.screen === 'learn') { answerChoice(+opt.getAttribute('data-opt')); return; }

    var card = document.getElementById('fc-card');
    if (card && card.contains(e.target)) { deck.shown = !deck.shown; render(); return; }

    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    act(btn.getAttribute('data-act'), btn);
  }

  function act(name, btn) {
    var set = current();
    switch (name) {
      case 'new':
        draft = { title: '', text: '', between: 'tab', betweenCustom: '', rows: 'newline', rowsCustom: '' };
        go('import');
        break;
      case 'back-list': go('list', null); break;
      case 'back-set': go('set'); break;
      case 'from-event': go('from-event'); break;

      case 'pull-event': {
        var pick = document.getElementById('ev-pick');
        var status = document.getElementById('ev-status');
        if (!pick) return;
        var slug = pick.value;
        var name = pick.options[pick.selectedIndex].text;
        if (status) status.textContent = 'Fetching…';
        S.fromEvent(slug, function (terms) {
          if (!terms || !terms.length) {
            if (status) status.textContent = 'Could not read that event’s terms. Check your connection and try again.';
            return;
          }
          // Hand it to the import screen so the learner can still trim it
          // down or retitle it before it becomes a set.
          draft = {
            title: name, between: 'tab', betweenCustom: '', rows: 'newline', rowsCustom: '',
            text: terms.map(function (t) { return t.term + '\t' + t.def; }).join('\n')
          };
          go('import');
        });
        break;
      }

      case 'create': {
        var parsed = S.parseImport(draft.text, draft);
        if (!parsed.cards.length) return;
        if (draft.into) {
          var target = S.get(draft.into);
          if (!target) { go('list', null); return; }
          var added = 0;
          parsed.cards.forEach(function (c) { if (S.addCard(target, c.term, c.def)) added++; });
          if (!S.save(target)) { toast('Could not save \u2014 your browser storage is full.', 'error'); return; }
          toast(added + ' card' + (added === 1 ? '' : 's') + ' added.', 'success');
          if (added < parsed.cards.length) {
            toast('A set holds up to ' + S.MAX_CARDS + ' cards, so the rest were left out.', 'info');
          }
          go('set', target.id);
          return;
        }
        var title = draft.title.trim() || 'Untitled set';
        var made = S.create(title, parsed.cards);
        if (!made) { toast('Could not save — your browser storage is full.', 'error'); return; }
        var kept = made.cards.length;
        toast(kept + ' card' + (kept === 1 ? '' : 's') + ' imported.', 'success');
        if (kept < parsed.cards.length) {
          toast('A set holds up to ' + S.MAX_CARDS + ' cards, so the rest were left out.', 'info');
        }
        go('set', made.id);
        break;
      }

      case 'cards': startCards(set); break;
      case 'learn': startLearn(set); break;
      case 'edit': go('edit'); break;

      case 'rename': {
        var name2 = prompt('Rename this set', set.title);
        if (name2 == null) return;
        if (!name2.trim()) { toast('A set needs a name.', 'error'); return; }
        S.rename(set.id, name2);
        render();
        break;
      }
      case 'reset':
        if (!confirm('Reset your progress on "' + set.title + '"? The cards stay; only what you have mastered is cleared.')) return;
        S.resetProgress(set);
        render();
        break;
      case 'reset-and-learn':
        S.resetProgress(set);
        startLearn(S.get(set.id));
        break;
      case 'delete':
        if (!confirm('Delete "' + set.title + '" and its ' + set.cards.length + ' cards? This cannot be undone.')) return;
        S.remove(set.id);
        toast('Set deleted.', 'info');
        go('list', null);
        break;

      case 'add-card':
        harvestEdits(set);
        if (!S.addCard(set, '', '')) { toast('A set holds up to ' + S.MAX_CARDS + ' cards.', 'info'); return; }
        S.save(set);
        render();
        var rows = root.querySelectorAll('.ed-row');
        if (rows.length) rows[rows.length - 1].querySelector('.ed-term').focus();
        break;
      case 'del-card':
        harvestEdits(set);
        S.removeCard(set, btn.getAttribute('data-card'));
        S.save(set);
        render();
        break;
      case 'paste-more':
        harvestEdits(set);
        S.save(set);
        draft = { title: set.title, text: '', between: 'tab', betweenCustom: '', rows: 'newline', rowsCustom: '', into: set.id };
        go('import');
        break;
      case 'save-edit':
        harvestEdits(set);
        if (!S.save(set)) { toast('Could not save — your browser storage is full.', 'error'); return; }
        toast('Saved.', 'success');
        go('set');
        break;

      case 'fc-flip-side':
        deck.flipped = !deck.flipped; deck.shown = false; render(); break;
      case 'fc-shuffle':
        deck.order = L.shuffle(deck.order); deck.i = 0; deck.shown = false; render();
        toast('Shuffled.', 'info');
        break;
      case 'fc-prev':
        if (deck.i > 0) { deck.i--; deck.shown = false; render(); } break;
      case 'fc-next':
        if (deck.i + 1 >= deck.order.length) { go('set'); return; }
        deck.i++; deck.shown = false; render(); break;

      case 'submit': answerWritten(false); break;
      case 'skip': answerWritten(true); break;
      case 'override': override(); break;
      case 'continue': nextQuestion(); break;
      case 'next-round': nextRound(); break;
    }
  }

  function onKey(e) {
    var pane = document.getElementById('tab-sets');
    if (!pane || !pane.classList.contains('active')) return;
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '');

    if (view.screen === 'cards' && deck) {
      if (typing) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); deck.shown = !deck.shown; render(); }
      else if (e.key === 'ArrowRight') { act('fc-next'); }
      else if (e.key === 'ArrowLeft') { act('fc-prev'); }
      return;
    }
    if (view.screen === 'learn' && run && run.i < run.round.length && !run.done) {
      var q = run.round[run.i];
      if (run.result) {
        if (e.key === 'Enter' && !typing) { e.preventDefault(); nextQuestion(); }
        return;
      }
      if (q.type === 'choice' && !typing && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        answerChoice(+e.key - 1);
      }
    }
  }

  /* ── Boot ───────────────────────────────────────────────────────── */

  function init() {
    root = document.getElementById('sets-root');
    if (!root || !S || !L) return;
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    render();
    // Coming back to the tab should show the current state of the sets,
    // which may have changed on another screen.
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-tab="sets"]') : null;
      if (t && view.screen === 'list') render();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  global.HosaSetsUI = { render: render, go: go, _state: view };
})(window);
