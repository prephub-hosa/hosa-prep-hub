/* The Rewards tab's security rules, run through Firebase's own rules engine.

   To run (same setup as chat.rules.test.mjs):
     java -jar ~/.cache/firebase/emulators/firebase-database-emulator-*.jar --port 9000 &
     node firebase/proof.rules.test.mjs

   The chat rules are loaded alongside, because a chapter shout-out is
   allowed for whoever the chat rules say owns the chapter. */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { ref, set, get, update, remove, serverTimestamp } from 'firebase/database';
import fs from 'fs';

const load = f => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), 'utf8'));
const rules = Object.assign({}, load('./chat.rules.json'), load('./proof.rules.json'));
const env = await initializeTestEnvironment({
  projectId: 'demo-hosa-proof',
  database: { host: '127.0.0.1', port: 9000, rules: JSON.stringify({ rules }) }
});

let pass = 0, fail = 0;
async function check(name, p, ok) {
  try { if (ok) await assertSucceeds(p); else await assertFails(p); pass++; }
  catch (e) { fail++; console.log('  FAIL ' + name + (ok ? ' (was denied)' : ' (was ALLOWED)') + ' — ' + (e.message || '').slice(0, 140)); }
}
const allow = (n, p) => check(n, p, true);
const deny  = (n, p) => check(n, p, false);

const who = {
  alice: () => env.authenticatedContext('alice', { email: 'alice@gmail.com' }).database(),
  bob:   () => env.authenticatedContext('bob',   { email: 'bob@gmail.com' }).database(),
  fran:  () => env.authenticatedContext('fran',  { email: 'fran@school.org' }).database(),
  admin: () => env.authenticatedContext('tyler', { email: 'tylerkim1215@gmail.com' }).database(),
  guest: () => env.unauthenticatedContext().database(),
};
const TS = serverTimestamp();
const review = (o = {}) => Object.assign({ stars: 5, text: 'Helped me a lot', name: 'Alice', ts: TS, public: true }, o);
const result = (o = {}) => Object.assign({ level: 'state', event: 'Pathophysiology', place: 2, year: 2026, name: 'Alice', ts: TS, public: true }, o);
const shout  = (o = {}) => Object.assign({ text: 'Our whole chapter studies here', name: 'Fran', uid: 'fran', ts: TS }, o);

await env.clearDatabase();
await env.withSecurityRulesDisabled(async ctx => {
  await set(ref(ctx.database(), 'chat/haas/owners/fran'), true);
});

/* ── Reviews ──────────────────────────────────────────────────── */
await allow('a signed-in student writes their own review', set(ref(who.alice(), 'proof/reviews/alice'), review()));
await allow('anyone, even signed out, can read reviews (it is the Wall of Wins)', get(ref(who.guest(), 'proof/reviews')));
await deny ('signed out cannot write one', set(ref(who.guest(), 'proof/reviews/alice'), review()));
await deny ('nobody writes a review as someone else', set(ref(who.bob(), 'proof/reviews/alice'), review()));
await deny ('a student cannot approve their own review', set(ref(who.alice(), 'proof/reviews/alice'), review({ approved: true })));
await deny ('or approve it afterwards', set(ref(who.alice(), 'proof/reviews/alice/approved'), true));
await deny ('no back-dating: the time must be the server\'s', set(ref(who.alice(), 'proof/reviews/alice'), review({ ts: 1000 })));
await deny ('stars must be 1–5', set(ref(who.alice(), 'proof/reviews/alice'), review({ stars: 6 })));
await deny ('whole stars only', set(ref(who.alice(), 'proof/reviews/alice'), review({ stars: 4.5 })));
await deny ('no empty review', set(ref(who.alice(), 'proof/reviews/alice'), review({ text: '' })));
await deny ('280 characters at most', set(ref(who.alice(), 'proof/reviews/alice'), review({ text: 'x'.repeat(281) })));
await deny ('no extra fields', set(ref(who.alice(), 'proof/reviews/alice'), review({ email: 'a@b.c' })));
await deny ('must have stars', set(ref(who.alice(), 'proof/reviews/alice'), { text: 'hi', name: 'A', ts: TS }));
await allow('the admin approves it', set(ref(who.admin(), 'proof/reviews/alice/approved'), true));
await allow('the author edits it…', set(ref(who.alice(), 'proof/reviews/alice'), review({ text: 'Edited' })));
await env.withSecurityRulesDisabled(async ctx => {
  const v = (await get(ref(ctx.database(), 'proof/reviews/alice'))).val();
  if (v.approved) { fail++; console.log('  FAIL an edit must clear the approval'); } else pass++;
});
await deny ('another student cannot delete it', remove(ref(who.bob(), 'proof/reviews/alice')));
await allow('the admin can remove a review', remove(ref(who.admin(), 'proof/reviews/alice')));

/* ── Competition results ──────────────────────────────────────── */
await allow('a student reports a result', set(ref(who.alice(), 'proof/results/alice/r1'), result()));
await allow('"competed, did not place" is a result too', set(ref(who.alice(), 'proof/results/alice/r2'), result({ place: 0, level: 'regional' })));
await deny ('not for someone else', set(ref(who.bob(), 'proof/results/alice/r3'), result()));
await deny ('only known levels', set(ref(who.alice(), 'proof/results/alice/r4'), result({ level: 'olympics' })));
await deny ('place 0–10', set(ref(who.alice(), 'proof/results/alice/r5'), result({ place: 11 })));
await deny ('a sensible year', set(ref(who.alice(), 'proof/results/alice/r6'), result({ year: 1999 })));
await deny ('no self-approval', set(ref(who.alice(), 'proof/results/alice/r7'), result({ approved: true })));
await deny ('a sane id', set(ref(who.alice(), 'proof/results/alice/' + 'x'.repeat(41)), result()));
await allow('the admin approves one', set(ref(who.admin(), 'proof/results/alice/r1/approved'), true));
await allow('anyone reads results', get(ref(who.guest(), 'proof/results')));

/* ── Chapter shout-outs ───────────────────────────────────────── */
await allow('the chapter\'s founder posts a shout-out', set(ref(who.fran(), 'proof/chapters/haas'), shout()));
await deny ('a member who is not the founder cannot', set(ref(who.alice(), 'proof/chapters/haas'), shout({ uid: 'alice', name: 'Alice' })));
await deny ('the founder cannot sign it as someone else', set(ref(who.fran(), 'proof/chapters/haas'), shout({ uid: 'alice' })));
await deny ('nor for a chapter they do not run', set(ref(who.fran(), 'proof/chapters/other'), shout()));
await deny ('nor approve it', set(ref(who.fran(), 'proof/chapters/haas'), shout({ approved: true })));
await allow('the admin approves it', set(ref(who.admin(), 'proof/chapters/haas/approved'), true));
await allow('anyone reads shout-outs', get(ref(who.guest(), 'proof/chapters')));

/* ── Admin-only numbers ───────────────────────────────────────── */
await allow('the admin publishes stats', set(ref(who.admin(), 'proof/stats'), { students: 10, updated: 1 }));
await allow('anyone reads published stats', get(ref(who.guest(), 'proof/stats')));
await deny ('a student cannot change them', set(ref(who.alice(), 'proof/stats'), { students: 99999 }));
await allow('the admin saves a daily snapshot', set(ref(who.admin(), 'proof/snapshots/2026-09-27'), { accounts: 10 }));
await deny ('a student cannot', set(ref(who.alice(), 'proof/snapshots/2026-09-27'), { accounts: 1 }));
await deny ('or read them', get(ref(who.alice(), 'proof/snapshots')));
await deny ('snapshot keys are dates', set(ref(who.admin(), 'proof/snapshots/today'), { accounts: 1 }));
await deny ('nothing else can be written under proof/', set(ref(who.alice(), 'proof/anything'), { x: 1 }));

console.log('proof rules: ' + pass + ' passed, ' + fail + ' failed');
await env.cleanup();
process.exit(fail ? 1 : 0);
