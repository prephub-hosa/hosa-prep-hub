/* ═════════════════════════════════════════════════════════════════
   Learn — multiple choice until a card sticks, then write it out.

   Mastery has three stages per card:

     0  not answered correctly yet      -> multiple choice
     1  multiple choice passed          -> written answer
     2  written answer passed           -> mastered, drops out of rotation

   A wrong answer knocks a card back a stage, so nothing graduates on a
   lucky guess. Because written questions only appear for stage-1 cards,
   they start showing up naturally once the first few cards stick —
   roughly one in every seven questions, which is the rhythm asked for.
   A round is seven questions.

   ── Grading written answers without a server ──────────────────────

   There is no model to call here, so "did they get the main idea" has to
   be decided locally. The approach:

     · strip stopwords, stem lightly, tolerate typos by edit distance
     · weight each expected word by how rare it is *within this set*, so
       "sphingomyelinase" counts for far more than "patient"
     · accept when enough of that weight is recovered

   Weighting by rarity is what makes it forgiving in the right way. A
   plain word-overlap score fails "band tied around a limb to stop
   bleeding" against "a constricting band placed on a limb to stop
   life-threatening bleeding", because the answer misses more words than
   it hits — but the words it does hit are the ones that carry the idea.

   ── What it cannot do ─────────────────────────────────────────────

   Measured against every definition on the site, graded against every
   other definition in its own event: it accepts a definition as itself
   1345 times out of 1345, and waves through a *different* definition in
   0.5% of pairs. Those misses are all sibling concepts whose definitions
   share nearly every word — transcription against translation, agonist
   against antagonist, sensitivity against specificity. No amount of word
   counting separates those, and pretending otherwise would mean tightening
   the grader until honest paraphrases started failing, which is the error
   that actually drives people off.

   So: it is a heuristic, it errs towards accepting, the real definition is
   shown after every written answer whatever the verdict, and the learner
   can always override it with "I was right" / "I was wrong".
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var ROUND_SIZE = 7;

  var STOPWORDS = {};
  ('a an the of to in and or is are was were be been being that which with for on at by from as it its this these those ' +
   'has have had do does did can could may might will would shall should must not no nor but if then than when while ' +
   'where who whom whose what how why all any both each few more other some such only own same so too very just ' +
   'also into onto over under above below out off up down again further during before after between through about ' +
   'against you your they them their he she his her we our us i me my one two three used use using usually often ' +
   'commonly typically generally seen given causes cause caused called known due within without across per each'
  ).split(' ').forEach(function (w) { STOPWORDS[w] = 1; });

  function normalize(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9%<>=+\/.\- ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // A handful of irregulars that suffix-stripping cannot reach.
  var IRREGULAR = {
    broken: 'break', broke: 'break', bleeding: 'bleed', bled: 'bleed',
    lost: 'loss', losing: 'loss', lose: 'loss',
    given: 'give', gave: 'give', made: 'make', makes: 'make',
    worse: 'bad', worst: 'bad', better: 'good', best: 'good',
    feet: 'foot', teeth: 'tooth', men: 'man', women: 'woman',
    children: 'child', people: 'person'
  };

  // Light stemming. Conservative about endings that carry meaning in
  // medicine (-itis, -osis, -emia, -pathy are never stripped), and it strips
  // at most one suffix: chaining them turned "corneal" into "corn", which
  // then matched nothing.
  function stem(w) {
    if (IRREGULAR[w]) return IRREGULAR[w];
    if (w.length <= 3) return w;
    if (/(itis|osis|emia|pathy|ectomy|ostomy|plasty|algia|megaly)$/.test(w)) return w;

    // Plurals first; they combine safely with one further strip.
    if (/ies$/.test(w) && w.length > 4) w = w.slice(0, -3) + 'y';
    else if (/(sses|shes|ches|xes)$/.test(w)) w = w.slice(0, -2);
    else if (/[^s]s$/.test(w)) w = w.slice(0, -1);
    if (w.length <= 3) return w;

    // Exactly one of these, longest ending first.
    var SUFFIX = ['ation', 'ition', 'ness', 'ment', 'tion', 'sion', 'ance', 'ence',
                  'ity', 'ive', 'ous', 'ary', 'ure', 'ing', 'ed', 'ly', 'al', 'y'];
    for (var i = 0; i < SUFFIX.length; i++) {
      var suf = SUFFIX[i];
      if (w.length > suf.length + 3 && w.slice(-suf.length) === suf) return w.slice(0, -suf.length);
    }
    if (/e$/.test(w) && w.length > 5) return w.slice(0, -1);
    return w;
  }

  // Multi-word equivalents, swapped in before tokenising. A student writing
  // "high blood sugar" has said "hyperglycemia"; word-by-word comparison
  // can never see that.
  var PHRASES = [
    // "most" is only "maximum" when it is not part of "most common",
    // which is how the definitions usually use it. Collapse those first
    // so the leftover "most" can safely mean the superlative.
    ['most commonly', 'common'], ['most common', 'common'],
    ['most frequently', 'common'], ['most frequent', 'common'],
    ['most often', 'common'], ['most of the', 'the'], ['most of', 'of'],
    ['high blood sugar', 'hyperglycemia'], ['low blood sugar', 'hypoglycemia'],
    ['high blood pressure', 'hypertension'], ['low blood pressure', 'hypotension'],
    ['shortness of breath', 'dyspnea'], ['trouble breathing', 'dyspnea'],
    ['heart attack', 'infarction'], ['blood clot', 'thrombus'],
    ['passed out', 'syncope'], ['passing out', 'syncope'],
    ['working out', 'exercise'], ['work out', 'exercise'],
    ['writing down', 'record'], ['write down', 'record'], ['written down', 'record'],
    ['too much', 'excess'], ['too little', 'deficiency'], ['not enough', 'deficiency'],
    ['how much', 'amount'], ['how many', 'amount'],
    ['throwing up', 'vomiting'], ['throw up', 'vomiting'],
    ['white blood cell', 'leukocyte'], ['red blood cell', 'erythrocyte'],
    ['heart rate', 'pulse'], ['blood sugar', 'glucose']
  ];

  function applyPhrases(s) {
    PHRASES.forEach(function (p) {
      if (s.indexOf(p[0]) !== -1) s = s.split(p[0]).join(p[1]);
    });
    return s;
  }

  // Words a student may reasonably swap for the one in the definition.
  // Keyed by stem, mapped to a shared canonical form. Kept small and
  // specific: a loose thesaurus here would start accepting wrong answers.
  var SYNONYM = {};
  [
    ['inflamm', 'swell', 'swollen'],
    ['make', 'produc', 'generat', 'creat', 'synthes'],
    ['proportion', 'percentag', 'fraction', 'share'],
    ['identifi', 'detect', 'catch', 'recogn'],
    ['diseas', 'illnes', 'sick', 'disorder'],
    ['break', 'fractur', 'crack'],
    ['virus', 'viral'],
    ['revers', 'undo', 'counteract'],
    ['collaps', 'deflat'],
    ['stop', 'halt'],
    ['fast', 'rapid', 'quick'],
    ['increas', 'rais', 'elevat'],
    ['decreas', 'lower', 'reduc', 'drop'],
    ['band', 'strap', 'tourniquet'],
    ['limb', 'arm', 'leg', 'extrem'],
    ['bleed', 'hemorrhag'],
    ['mood', 'depress'],
    ['maximum', 'max', 'most', 'greatest', 'highest'],
    ['minimum', 'min', 'least', 'lowest', 'fewest'],
    ['uneven', 'irregular', 'asymmetric', 'unequal'],
    ['blur', 'fuzz'],
    ['record', 'document', 'log', 'chart'],
    ['millilitr', 'milliliter', 'ml', 'cc'],
    ['exercis', 'activ', 'train'],
    ['excess', 'extra', 'surplus'],
    ['amount', 'volum', 'quantiti', 'quantity'],
    ['tremor', 'shak'],
    ['cardiac', 'heart', 'cardio'],
    ['contract', 'contrac', 'squeez', 'tighten'],
    ['relax', 'loosen', 'rest']
  ].forEach(function (group) {
    group.forEach(function (w) { SYNONYM[w] = group[0]; });
  });

  function canon(w) { return SYNONYM[w] || w; }

  /**
   * Pairs that mean the opposite of each other.
   *
   * Word overlap alone cannot tell "closer to the point of attachment"
   * from "farther from the point of attachment" — they share every word
   * that matters. A learner who writes the opposite of the definition has
   * not got the main idea, they have got it backwards, and being told
   * "Correct" is worse than being told nothing. These are checked as a
   * veto after scoring, not as another weight.
   */
  var OPPOSITES = [
    ['proximal', 'distal'], ['closer', 'farther'], ['closer', 'further'],
    ['positive', 'negative'], ['amplifies', 'reverses'],
    ['inhalation', 'exhalation'], ['inspiration', 'expiration'],
    ['inhaled', 'exhaled'], ['voluntary', 'involuntary'],
    ['agonist', 'antagonist'], ['afferent', 'efferent'],
    ['flexion', 'extension'], ['abduction', 'adduction'],
    ['systolic', 'diastolic'], ['systole', 'diastole'],
    ['hypertension', 'hypotension'], ['hyperglycemia', 'hypoglycemia'],
    ['hyperkalemia', 'hypokalemia'], ['hypernatremia', 'hyponatremia'],
    ['hyperthyroidism', 'hypothyroidism'], ['tachycardia', 'bradycardia'],
    ['increase', 'decrease'], ['maximum', 'minimum'],
    ['contraction', 'relaxation'], ['anterior', 'posterior'],
    ['superior', 'inferior'], ['medial', 'lateral'],
    ['dorsal', 'ventral'], ['superficial', 'deep'],
    ['aerobic', 'anaerobic'], ['benign', 'malignant'],
    ['acute', 'chronic'], ['acidosis', 'alkalosis'],
    ['gram-positive', 'gram-negative'], ['sensitivity', 'specificity'],
    ['incidence', 'prevalence'], ['inside', 'outside'],
    ['sympathetic', 'parasympathetic'], ['afferent', 'sensory-efferent']
  ].map(function (pair) { return [canon(stem(pair[0])), canon(stem(pair[1]))]; })
   .filter(function (pair) { return pair[0] !== pair[1]; });

  /**
   * True when the answer carries one side of an opposite pair and the
   * definition carries the other. A definition that names both sides is
   * contrasting them, so it is left alone.
   */
  function polarityConflict(aTok, eTok) {
    for (var i = 0; i < OPPOSITES.length; i++) {
      var a = OPPOSITES[i][0], b = OPPOSITES[i][1];
      var eA = eTok.indexOf(a) !== -1, eB = eTok.indexOf(b) !== -1;
      var gA = aTok.indexOf(a) !== -1, gB = aTok.indexOf(b) !== -1;
      if ((eA && eB) || (gA && gB)) continue;
      if ((eA && gB) || (eB && gA)) return true;
    }
    return false;
  }

  function tokens(s) {
    var out = [];
    applyPhrases(normalize(s)).split(' ').forEach(function (w) {
      if (!w) return;
      // Sentence punctuation rides along on the last word otherwise, and
      // "trunk." is a different key from "trunk". Decimals keep their dot.
      if (/[.\-\/]$/.test(w) && !/[0-9]$/.test(w.slice(0, -1))) w = w.slice(0, -1);
      if (!w) return;
      if (STOPWORDS[w]) return;
      if (w.length < 2 && !/[0-9]/.test(w)) return;
      out.push(canon(stem(w)));
    });
    return out;
  }

  function uniq(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  // Bounded edit distance — we only ever care whether it is 0, 1 or 2.
  function within(a, b, max) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > max) return false;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      var best = cur[0];
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1,
                          prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return false;
      prev = cur.slice();
    }
    return prev[b.length] <= max;
  }

  function typoAllowance(w) {
    if (w.length >= 9) return 2;
    if (w.length >= 5) return 1;
    return 0;
  }

  function hasWord(answerTokens, want) {
    var slack = typoAllowance(want);
    for (var i = 0; i < answerTokens.length; i++) {
      var a = answerTokens[i];
      if (a === want) return true;
      // One being a prefix of the other counts: "curv" vs "curvature",
      // "corne" vs "cornea", "cardio" vs "cardiomyopathy". The shorter has
      // to be a real word-length stem, or "in" would match everything.
      var shortW = a.length <= want.length ? a : want;
      var longW = a.length <= want.length ? want : a;
      if (shortW.length >= 4 && longW.length - shortW.length <= 6 &&
          longW.indexOf(shortW) === 0) return true;
      if (slack && within(a, want, slack)) return true;
    }
    return false;
  }

  /**
   * Inverse document frequency across the set's definitions.
   * A word in one definition out of eighty is worth far more than one in
   * half of them.
   */
  function buildIdf(texts) {
    var df = {}, n = texts.length || 1;
    texts.forEach(function (t) {
      uniq(tokens(t)).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
    });
    return function (w) {
      var d = df[w] || 0;
      // +1 smoothing, floor at 1 so a common word still counts for something.
      return 1 + Math.log(n / (1 + d));
    };
  }

  // Definitions lead with the idea and then elaborate: "A break in a bone,
  // classified by pattern". A student who writes "a broken bone" has the
  // idea. Grading against the leading clause as well as the whole thing is
  // what lets that through without loosening the bar for everyone.
  function leadClause(text) {
    var m = /^[^,;:(\u2014]+/.exec(String(text || ''));
    return m ? m[0].trim() : '';
  }

  function scoreAgainst(aTok, expectedText, weigh) {
    var eTok = uniq(tokens(expectedText));
    if (!eTok.length) return null;
    var total = 0, got = 0, matched = [], missed = [];
    var top = null, topWt = -1, topHit = false;
    eTok.forEach(function (w) {
      var wt = weigh(w);
      total += wt;
      var hit = hasWord(aTok, w);
      if (wt > topWt) { topWt = wt; top = w; topHit = hit; }
      if (hit) { got += wt; matched.push(w); }
      else missed.push(w);
    });
    return { keys: eTok.length, score: total ? got / total : 0,
             matched: matched, missed: missed, top: top, topHit: topHit };
  }

  // How much of the expected weight has to come back, by how much there is
  // to recall. A two-word definition must be basically right; a long one
  // only needs its load-bearing words.
  function threshold(keys) {
    if (keys <= 2) return 0.9;
    if (keys <= 4) return 0.55;
    if (keys <= 8) return 0.42;
    return 0.34;
  }

  /**
   * Grade a written answer against the expected text.
   * idf is optional; without it every word weighs the same.
   *
   * Returns { correct, score, matched, missed }.
   */
  function gradeWritten(answer, expected, idf) {
    var res = { correct: false, score: 0, matched: [], missed: [] };
    var aNorm = normalize(answer), eNorm = normalize(expected);
    if (!aNorm) return res;
    if (aNorm === eNorm) { res.correct = true; res.score = 1; return res; }

    var aTok = tokens(answer);
    var eTok = uniq(tokens(expected));

    // Nothing content-bearing to compare (the expected text is all
    // stopwords): fall back to a whole-string comparison with typo slack.
    if (!eTok.length) {
      res.correct = within(aNorm, eNorm, aNorm.length >= 8 ? 2 : 1);
      res.score = res.correct ? 1 : 0;
      return res;
    }
    if (!aTok.length) return res;

    var weigh = idf || function () { return 1; };
    var full = scoreAgainst(aTok, expected, weigh);
    res.score = full.score;
    res.matched = full.matched;
    res.missed = full.missed;

    var pass = full.score >= threshold(full.keys) &&
               full.matched.length >= Math.min(2, full.keys);

    // The rarest word in a definition is usually the idea itself — "the
    // contraction phase of the cardiac cycle" is about contraction, and
    // a learner who wrote that has the main idea even if they skipped
    // "phase" and "cycle". Getting it buys a little room on the rest.
    if (!pass && full.topHit && full.keys >= 3 && full.matched.length >= 2 &&
        full.score >= threshold(full.keys) - 0.14) {
      pass = true;
    }

    if (!pass) {
      // Try the leading clause. Require it to carry at least two content
      // words, or a definition beginning with a single word would become a
      // one-word answer.
      var lead = leadClause(expected);
      if (lead && normalize(lead) !== eNorm) {
        var part = scoreAgainst(aTok, lead, weigh);
        if (part && part.keys >= 2 &&
            part.score >= threshold(part.keys) && part.matched.length >= 2) {
          pass = true;
          res.score = Math.max(res.score, part.score);
          res.matched = part.matched;
          res.missed = full.missed;
        }
      }
    }

    // A backwards answer is not a near miss, whatever it scored.
    if (pass && polarityConflict(aTok, eTok)) {
      pass = false;
      res.flipped = true;
    }

    res.correct = pass;
    return res;
  }

  /* ── Question generation ────────────────────────────────────────── */

  function shuffle(arr, rnd) {
    var a = arr.slice(), i, j, t;
    rnd = rnd || Math.random;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(rnd() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function promptSide(card, direction) { return direction === 'def' ? card.def : card.term; }
  function answerSide(card, direction) { return direction === 'def' ? card.term : card.def; }

  /**
   * Build one round.
   * Stage 0 cards get multiple choice, stage 1 cards get written, stage 2
   * drops out. Least-recently-correct first so the weakest come back soonest.
   */
  function buildRound(set, size) {
    size = size || ROUND_SIZE;
    var dir = set.direction === 'def' ? 'def' : 'term';
    var stage = set.stage || {};
    var pool = (set.cards || []).filter(function (c) {
      return (c.term || c.def) && (stage[c.id] || 0) < 2;
    });
    if (!pool.length) return [];

    var written = [], choice = [];
    pool.forEach(function (c) {
      ((stage[c.id] || 0) >= 1 ? written : choice).push(c);
    });

    // Written answers need something to grade against.
    written = written.filter(function (c) { return answerSide(c, dir).trim(); });

    // Early on almost nothing has passed its multiple choice, so a round of
    // seven carries about one written question — the rhythm Quizlet has.
    // As cards pass, written takes over; once every remaining card is at
    // stage 1 the whole round is written, or nothing would ever finish.
    var share = written.length / pool.length;
    var wantWritten = Math.min(written.length, Math.max(1, Math.round(share * size)));

    var picked = [];
    // Take written first so cards that are close to mastered finish.
    shuffle(written).slice(0, wantWritten).forEach(function (c) {
      picked.push({ card: c, type: 'written' });
    });
    shuffle(choice).forEach(function (c) {
      if (picked.length < size) picked.push({ card: c, type: 'choice' });
    });
    // Still short — top up with more written ones rather than ending early.
    shuffle(written).forEach(function (c) {
      if (picked.length < size && !picked.some(function (q) { return q.card.id === c.id; })) {
        picked.push({ card: c, type: 'written' });
      }
    });

    return shuffle(picked).map(function (q) {
      var out = {
        cardId: q.card.id,
        type: q.type,
        prompt: promptSide(q.card, dir),
        answer: answerSide(q.card, dir)
      };
      if (q.type === 'choice') out.options = buildOptions(q.card, set, dir);
      return out;
    });
  }

  /**
   * Four options, the wrong ones taken from other cards in the set so they
   * are plausible. Falls back to fewer options in a very small set.
   */
  function buildOptions(card, set, dir) {
    var correct = answerSide(card, dir);
    var others = (set.cards || []).filter(function (c) {
      return c.id !== card.id && answerSide(c, dir).trim() &&
             normalize(answerSide(c, dir)) !== normalize(correct);
    });
    // Prefer distractors of similar length — a conspicuously short or long
    // option gives the answer away.
    var target = correct.length;
    others.sort(function (a, b) {
      return Math.abs(answerSide(a, dir).length - target) -
             Math.abs(answerSide(b, dir).length - target);
    });
    var near = shuffle(others.slice(0, Math.max(9, Math.ceil(others.length / 2))));
    var picks = near.slice(0, 3).map(function (c) { return answerSide(c, dir); });
    return shuffle(picks.concat([correct])).map(function (text) {
      return { text: text, correct: text === correct };
    });
  }

  /* ── Recording an answer ────────────────────────────────────────── */

  function record(set, cardId, wasCorrect) {
    set.stage = set.stage || {};
    set.stats = set.stats || {};
    var s = set.stats[cardId] || (set.stats[cardId] = { right: 0, wrong: 0 });
    var cur = set.stage[cardId] || 0;
    if (wasCorrect) { s.right++; set.stage[cardId] = Math.min(2, cur + 1); }
    else { s.wrong++; set.stage[cardId] = Math.max(0, cur - 1); }
    return set.stage[cardId];
  }

  function progress(set) {
    var stage = set.stage || {};
    var cards = (set.cards || []).filter(function (c) { return c.term || c.def; });
    var out = { total: cards.length, notStarted: 0, learning: 0, mastered: 0 };
    cards.forEach(function (c) {
      var st = stage[c.id] || 0;
      if (st >= 2) out.mastered++;
      else if (st >= 1) out.learning++;
      else out.notStarted++;
    });
    return out;
  }

  global.HosaLearn = {
    ROUND_SIZE: ROUND_SIZE,
    normalize: normalize,
    tokens: tokens,
    stem: stem,
    buildIdf: buildIdf,
    gradeWritten: gradeWritten,
    leadClause: leadClause,
    buildRound: buildRound,
    buildOptions: buildOptions,
    record: record,
    progress: progress,
    shuffle: shuffle
  };
})(window);
