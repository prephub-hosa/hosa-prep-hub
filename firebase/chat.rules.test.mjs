/* The chat's security rules, run through Firebase's own rules engine.
   Every allow and every deny here is what production would do.

   To run:
     npm install firebase-tools @firebase/rules-unit-testing firebase
     npx firebase setup:emulators:database
     java -jar ~/.cache/firebase/emulators/firebase-database-emulator-*.jar --port 9000 &
     node firebase/chat.rules.test.mjs

   Every check was also confirmed to fail when the rule it guards is removed,
   so a pass here means the rules hold rather than that the tests are blind. */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { ref, set, get, update, remove, push, serverTimestamp } from 'firebase/database';
import fs from 'fs';

const chatRules = JSON.parse(fs.readFileSync(new URL('./chat.rules.json', import.meta.url), 'utf8'));
const env = await initializeTestEnvironment({
  projectId: 'demo-hosa',
  database: { host: '127.0.0.1', port: 9000, rules: JSON.stringify({ rules: chatRules }) }
});

const SLUG = 'haas-hall-academy', OTHER = 'other-school';
let pass = 0, fail = 0;
async function check(name, p, shouldSucceed) {
  try {
    if (shouldSucceed) await assertSucceeds(p); else await assertFails(p);
    pass++;
  } catch (e) { fail++; console.log('  FAIL ' + name + (shouldSucceed ? ' (was denied)' : ' (was ALLOWED)') + ' — ' + (e.message || '').slice(0, 120)); }
}
const allow = (n, p) => check(n, p, true);
const deny  = (n, p) => check(n, p, false);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function seed() {
  await env.clearDatabase();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.database();
    await set(ref(db, 'chapters/' + SLUG), { name: 'Haas Hall Academy', contactEmail: 'Founder@School.org' });
    await set(ref(db, 'analytics/chapters/' + OTHER), { name: 'Other School', contactEmail: 'otherfounder@x.com' });
    await set(ref(db, 'leaderboard/level/alice'), { chapter: SLUG, xp: 10 });
    await set(ref(db, 'leaderboard/level/bob'),   { chapter: SLUG, xp: 5 });
    await set(ref(db, 'leaderboard/level/eve'),   { chapter: OTHER, xp: 1 });
  });
}
const who = {
  alice: () => env.authenticatedContext('alice', { email: 'alice@gmail.com' }).database(),
  bob:   () => env.authenticatedContext('bob',   { email: 'bob@gmail.com' }).database(),
  eve:   () => env.authenticatedContext('eve',   { email: 'eve@gmail.com' }).database(),
  fran:  () => env.authenticatedContext('fran',  { email: 'founder@school.org' }).database(),   // lower-case vs record
  otto:  () => env.authenticatedContext('otto',  { email: 'otherfounder@x.com' }).database(),
  admin: () => env.authenticatedContext('tyler', { email: 'tylerkim1215@gmail.com' }).database(),
  anon:  () => env.authenticatedContext('anon',  {}).database(),
  guest: () => env.unauthenticatedContext().database(),
};
// A message the way the widget writes it: the message and the sender's
// lastPost stamp in one atomic update.
function post(db, slug, thread, uid, fields, opts = {}) {
  const key = push(ref(db, 'chat/' + slug + '/' + thread)).key;
  const msg = Object.assign({ uid, name: 'Name', text: 'hello', ts: serverTimestamp(), role: 'member' }, fields || {});
  const u = { [thread + '/' + key]: msg };
  // stampAs lets a test forge only the author field while stamping its own
  // rate-limit entry honestly — otherwise an impersonation attempt is
  // refused for touching someone else's stamp, and the check that is meant
  // to stop it never gets exercised.
  if (!opts.skipLastPost) u['lastPost/' + (opts.stampAs || uid)] = serverTimestamp();
  return { key, p: update(ref(db, 'chat/' + slug), u) };
}

/* ── Chapter room: who can read ─────────────────────────────────── */
await seed();
await allow('a member reads their chapter room',        get(ref(who.alice(), 'chat/' + SLUG + '/room')));
await deny ('someone from another chapter cannot',      get(ref(who.eve(),   'chat/' + SLUG + '/room')));
await deny ('a signed-out visitor cannot',               get(ref(who.guest(), 'chat/' + SLUG + '/room')));
await allow('the admin reads any chapter room',          get(ref(who.admin(), 'chat/' + SLUG + '/room')));
await deny ('a member cannot list every chapter\'s chat', get(ref(who.alice(), 'chat')));
await allow('the admin can list every chapter\'s chat',  get(ref(who.admin(), 'chat')));

/* ── Chapter room: posting ───────────────────────────────────────── */
let m = post(who.alice(), SLUG, 'room', 'alice');
await allow('a member posts a normal message', m.p);
const aliceMsg = m.key;
await sleep(1600);
await deny ('…but not as someone else',        post(who.alice(), SLUG, 'room', 'bob', {}, { stampAs: 'alice' }).p);
await sleep(1600);
await deny ('…not even in the private thread',  post(who.fran(), SLUG, 'team', 'tyler', { role: 'admin' }, { stampAs: 'fran' }).p);
await deny ('…nor claiming to be the founder', post(who.alice(), SLUG, 'room', 'alice', { role: 'founder' }).p);
await deny ('…nor claiming to be the admin',   post(who.alice(), SLUG, 'room', 'alice', { role: 'admin' }).p);
await deny ('…nor over 500 characters',        post(who.alice(), SLUG, 'room', 'alice', { text: 'x'.repeat(501) }).p);
await deny ('…nor empty',                      post(who.alice(), SLUG, 'room', 'alice', { text: '' }).p);
await deny ('…nor with a 41-character name',   post(who.alice(), SLUG, 'room', 'alice', { name: 'n'.repeat(41) }).p);
await deny ('…nor backdated',                  post(who.alice(), SLUG, 'room', 'alice', { ts: 1000 }).p);
await deny ('…nor with extra fields',          post(who.alice(), SLUG, 'room', 'alice', { img: 'x' }).p);
await deny ('…nor skipping the rate-limit stamp', post(who.alice(), SLUG, 'room', 'alice', {}, { skipLastPost: true }).p);
await allow('500 characters exactly is fine',  post(who.alice(), SLUG, 'room', 'alice', { text: 'x'.repeat(500) }).p);
await deny ('a second post inside 1.5 s is refused', post(who.alice(), SLUG, 'room', 'alice').p);
await sleep(1600);
await allow('…and allowed again after it',     post(who.alice(), SLUG, 'room', 'alice').p);
await deny ('an outsider cannot post',         post(who.eve(),   SLUG, 'room', 'eve').p);
await deny ('a signed-out visitor cannot post', post(who.guest(), SLUG, 'room', 'x').p);
await deny ('no chapter slug with odd characters', post(who.alice(), 'Bad_Slug!', 'room', 'alice').p);

/* ── Editing and deleting ────────────────────────────────────────── */
await deny ('nobody edits a message, even its author',
  set(ref(who.alice(), 'chat/' + SLUG + '/room/' + aliceMsg + '/text'), 'edited'));
await deny ('a member cannot delete someone else\'s message',
  remove(ref(who.bob(), 'chat/' + SLUG + '/room/' + aliceMsg)));
await allow('the author deletes their own message',
  remove(ref(who.alice(), 'chat/' + SLUG + '/room/' + aliceMsg)));
await sleep(1600);
m = post(who.bob(), SLUG, 'room', 'bob');
await allow('(bob posts)', m.p);
await allow('the admin deletes anyone\'s message', remove(ref(who.admin(), 'chat/' + SLUG + '/room/' + m.key)));

/* ── Founder claim ───────────────────────────────────────────────── */
await deny ('a member cannot make themselves founder',
  set(ref(who.alice(), 'chat/' + SLUG + '/owners/alice'), true));
await allow('the founder claims with the email the chapter was registered under (any case)',
  set(ref(who.fran(), 'chat/' + SLUG + '/owners/fran'), true));
await deny ('once claimed, nobody else can self-claim',
  set(ref(who.fran(), 'chat/' + SLUG + '/owners/fran2'), true));
await allow('a founder whose record fell back to analytics/chapters can claim too',
  set(ref(who.otto(), 'chat/' + OTHER + '/owners/otto'), true));
await deny ('no registered email, no self-claim',
  set(ref(who.alice(), 'chat/no-record-school/owners/alice'), true));
await deny ('an account with no email cannot claim',
  set(ref(who.anon(), 'chat/' + SLUG + '/owners/anon'), true));
await deny ('owners must be true/false',
  set(ref(who.admin(), 'chat/' + SLUG + '/owners/bob'), 'yes'));
await allow('the admin can make anyone a founder',
  set(ref(who.admin(), 'chat/' + SLUG + '/owners/bob'), true));
await allow('the admin can remove a founder',
  remove(ref(who.admin(), 'chat/' + SLUG + '/owners/bob')));
await allow('a signed-in member can see who the founder is',
  get(ref(who.alice(), 'chat/' + SLUG + '/owners')));

/* ── Founder powers in the room ──────────────────────────────────── */
await sleep(1600);
m = post(who.alice(), SLUG, 'room', 'alice');
await allow('(alice posts)', m.p);
await allow('the founder can delete a member\'s message', remove(ref(who.fran(), 'chat/' + SLUG + '/room/' + m.key)));
await allow('the founder posts in the room as founder', post(who.fran(), SLUG, 'room', 'fran', { role: 'founder' }).p);
await sleep(1600);
m = post(who.alice(), SLUG, 'room', 'alice');
await allow('(alice posts again)', m.p);
await sleep(1600);
// Overwriting a message in place is an edit, and nobody may edit — not the
// founder, not the admin. An operator-precedence slip once let both through.
await deny ('the founder cannot overwrite a member\'s message', update(ref(who.fran(), 'chat/' + SLUG), {
  ['room/' + m.key]: { uid: 'fran', name: 'x', text: 'rewritten', ts: serverTimestamp(), role: 'founder' },
  ['lastPost/fran']: serverTimestamp() }));
await deny ('the admin cannot overwrite it either', update(ref(who.admin(), 'chat/' + SLUG), {
  ['room/' + m.key]: { uid: 'tyler', name: 'x', text: 'rewritten', ts: serverTimestamp(), role: 'admin' },
  ['lastPost/tyler']: serverTimestamp() }));
await sleep(1600);
await deny ('a founder of one chapter has no power in another',
  post(who.fran(), OTHER, 'room', 'fran', { role: 'founder' }).p);

/* ── The private founder ↔ admin thread ──────────────────────────── */
await deny ('a member cannot read the founder thread', get(ref(who.alice(), 'chat/' + SLUG + '/team')));
await deny ('…or post in it',          post(who.alice(), SLUG, 'team', 'alice').p);
await allow('the founder reads it',    get(ref(who.fran(), 'chat/' + SLUG + '/team')));
await sleep(1600);
await allow('the founder writes in it as founder', post(who.fran(), SLUG, 'team', 'fran', { role: 'founder' }).p);
await sleep(1600);
await deny ('…but not as a plain member',          post(who.fran(), SLUG, 'team', 'fran', { role: 'member' }).p);
await deny ('…and not as the admin',               post(who.fran(), SLUG, 'team', 'fran', { role: 'admin' }).p);
await allow('the admin reads it',      get(ref(who.admin(), 'chat/' + SLUG + '/team')));
await allow('the admin writes in it as admin', post(who.admin(), SLUG, 'team', 'tyler', { role: 'admin' }).p);
await deny ('another chapter\'s founder cannot read it', get(ref(who.otto(), 'chat/' + SLUG + '/team')));
await sleep(1600);
const tm = post(who.fran(), SLUG, 'team', 'fran', { role: 'founder' });
await allow('(fran posts on the founder line)', tm.p);
await sleep(1600);
await deny ('the admin cannot overwrite the founder\'s message on the private line', update(ref(who.admin(), 'chat/' + SLUG), {
  ['team/' + tm.key]: { uid: 'tyler', name: 'x', text: 'rewritten', ts: serverTimestamp(), role: 'admin' },
  ['lastPost/tyler']: serverTimestamp() }));

/* ── Rate-limit stamp itself ─────────────────────────────────────── */
await deny ('you cannot touch someone else\'s rate-limit stamp',
  set(ref(who.alice(), 'chat/' + SLUG + '/lastPost/bob'), serverTimestamp()));
await deny ('…or set your own to an old time to skip the limit',
  set(ref(who.alice(), 'chat/' + SLUG + '/lastPost/alice'), 1000));

/* ── Nothing else can be written under a chapter ─────────────────── */
await deny ('no stray nodes under a chapter', set(ref(who.admin(), 'chat/' + SLUG + '/junk'), 'x'));

console.log('chat rules: ' + pass + ' passed, ' + fail + ' failed');
await env.cleanup();
process.exit(fail ? 1 : 0);
