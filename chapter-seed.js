/* ═════════════════════════════════════════════════════════════════
   Seeded chapters for the leaderboard.

   A board with three rows on it reads as abandoned, which is the worst
   possible advertisement for registering a fourth. The individual
   leaderboard has been seeded the same way since it launched; this does
   for chapters what SEED_PLAYERS does for students.

   These are display-only. They are never written to the database, never
   counted as members, never awarded a Founding or Featured badge, and
   never linked to a dashboard that does not exist. A real chapter with
   the same slug always wins — the seed is only used to fill a gap.

   The names are invented placeholders, deliberately not copied from any
   actual school, so the board never implies a specific real institution
   has signed up. Swap rows out as genuine chapters register.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  // The top seed sits well clear of the strongest real chapter, so a real
  // chapter can be #2 and still have something to chase, and the rest are
  // spread on a curve so most real chapters land among seeds rather than
  // alone at the top. Raise these as real chapters grow.
  var SEED = [
    { name: 'Ridgeview HOSA',               xp: 30240, members: 41 },
    { name: 'Northgate Health Sciences',    xp: 12860, members: 27 },
    { name: 'Silver Creek HOSA',            xp:  9415, members: 22 },
    { name: 'Fairmont Health Academy',      xp:  6980, members: 19 },
    { name: 'Lakeshore HOSA',               xp:  4730, members: 16 },
    { name: 'Westbrook Medical Academy',    xp:  3390, members: 14 },
    { name: 'Cedar Park HOSA',              xp:  2510, members: 12 },
    { name: 'Stonebridge Health Sciences',  xp:  1940, members: 11 },
    { name: 'Maple Grove HOSA',             xp:  1420, members:  9 },
    { name: 'Brookfield Health Academy',    xp:  1075, members:  8 },
    { name: 'Ironwood HOSA',                xp:   860, members:  7 },
    { name: 'Clearwater Health Sciences',   xp:   640, members:  6 },
    { name: 'Summit Ridge HOSA',            xp:   515, members:  5 },
    { name: 'Harborview Health Academy',    xp:   390, members:  5 },
    { name: 'Pinecrest HOSA',               xp:   285, members:  4 },
    { name: 'Glenwood Health Sciences',     xp:   210, members:  3 },
    { name: 'Aspen Valley HOSA',            xp:   160, members:  3 },
    { name: 'Redwood Park HOSA',            xp:   115, members:  2 },
    { name: 'Kingsley Health Academy',      xp:    70, members:  2 },
    { name: 'Fox Hollow HOSA',              xp:    40, members:  1 }
  ];

  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 44);
  }

  /**
   * Seed rows shaped like the real ones.
   * `confirmed` stays 0 so no badge logic can ever fire on them, and
   * `seeded` marks them for any caller that needs to tell them apart.
   */
  function rows() {
    return SEED.map(function (c) {
      return {
        slug: 'seed-' + slugify(c.name),
        name: c.name,
        xp: c.xp,
        members: c.members,
        active: 0,
        confirmed: 0,
        seeded: true
      };
    });
  }

  /** Slug -> total XP, for pages that rank from a totals map. */
  function totals() {
    var out = {};
    rows().forEach(function (r) { out[r.slug] = r.xp; });
    return out;
  }

  global.HosaChapterSeed = { rows: rows, totals: totals };
})(window);
