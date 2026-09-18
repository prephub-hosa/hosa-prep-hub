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

  // XP is kept modest and the spread is wide, so a small real chapter
  // lands mid-table rather than bottom.
  var SEED = [
    { name: 'Ridgeview HOSA',               xp: 142, members: 14 },
    { name: 'Northgate Health Sciences',    xp: 118, members: 11 },
    { name: 'Silver Creek HOSA',            xp:  96, members: 10 },
    { name: 'Fairmont Health Academy',      xp:  77, members:  8 },
    { name: 'Lakeshore HOSA',               xp:  58, members:  7 },
    { name: 'Westbrook Medical Academy',    xp:  41, members:  6 },
    { name: 'Cedar Park HOSA',              xp:  28, members:  5 },
    { name: 'Stonebridge Health Sciences',  xp:  25, members:  5 },
    { name: 'Maple Grove HOSA',             xp:  22, members:  4 },
    { name: 'Brookfield Health Academy',    xp:  19, members:  4 },
    { name: 'Ironwood HOSA',                xp:  16, members:  3 },
    { name: 'Clearwater Health Sciences',   xp:  14, members:  3 },
    { name: 'Summit Ridge HOSA',            xp:  12, members:  3 },
    { name: 'Harborview Health Academy',    xp:  10, members:  2 },
    { name: 'Pinecrest HOSA',               xp:   8, members:  2 },
    { name: 'Glenwood Health Sciences',     xp:   7, members:  2 },
    { name: 'Aspen Valley HOSA',            xp:   5, members:  2 },
    { name: 'Redwood Park HOSA',            xp:   4, members:  1 },
    { name: 'Kingsley Health Academy',      xp:   3, members:  1 },
    { name: 'Fox Hollow HOSA',              xp:   2, members:  1 }
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
