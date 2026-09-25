# Chapter chat — switching it on

The chat is already on the site, but it stays **hidden** until the database
rules below are published. That's deliberate: without the rules, nobody can
read or post, and a chat button that only ever errors is worse than none.

Only you can do this step — it's in the Firebase console, not the code.

## Publish the rules (about two minutes)

1. Open the [Firebase console](https://console.firebase.google.com/) →
   **hosa-prep-hub** → **Realtime Database** → **Rules** tab.
2. Near the top you'll see a line that reads `"rules": {`.
   Click at the very end of that line, just after the `{`, and press Enter.
3. Open [`PASTE-INTO-FIREBASE-RULES.txt`](PASTE-INTO-FIREBASE-RULES.txt),
   copy **all** of it, and paste it on the new line. It ends with a comma on
   purpose — that is what lets it sit in front of your existing rules.
4. Click **Publish**. If the console reports an error, nothing has changed —
   undo the paste and message me the error.
5. Reload `/admin.html`. The "Chapter chats" section should list your
   chapters instead of saying the chat is switched off.

Nothing already in your rules is changed; this only adds a new `chat` section.

### One check before you publish

Look at the lines directly under `"rules": {`. If you see a `".read"` or
`".write"` set to `true` or `"auth != null"` **at that top level** (not
inside a named section), tell me before publishing. Firebase rules cascade:
a blanket grant at the top would override the chat's privacy rules, and the
private founder line would not be private.

## What the rules guarantee

These are enforced by Firebase itself, so a modified copy of the page can't
get around them:

| | |
|---|---|
| **Who can read the chapter room** | Signed-in members of that chapter, its founder, and you |
| **Who can read the founder line** | That chapter's founder and you — no members, no other founders |
| **Posting** | Signed-in only, only as yourself, 1–500 characters, server-stamped time, at most one post every 1.5 s |
| **Badges** | "Founder" and "HOSA Prep Hub" can only be used by the real founder and by you |
| **Editing** | Nobody, including you |
| **Deleting** | The author, the chapter's founder (in their own room), and you |
| **Listing every chapter's chat** | You only |

Messages are shown as plain text: no HTML is rendered and no links are made
clickable. The people using this are mostly high-school students.

## How founders get verified

A chapter's founder gets the private line to you when either:

- they sign in with **the same email the chapter was registered under** —
  this is automatic; or
- **you** make them founder from the chapter's chat on the admin page
  (Chapter chats → open the chapter → "Make a member founder…").

A founder who registered with a school email they can't sign in with needs
the second route. They must have joined their own chapter and signed in at
least once to appear in that list.

## If the admin email ever changes

It appears in three places, which must agree:

- `firebase/build-chat-rules.py` — the address itself; this is what grants access
- `admin.html` — the address itself (`ADMIN_EMAIL`)
- `chapter-chat.js` — only a SHA-256 **hash** of it (`ADMIN_EMAIL_SHA256`),
  because that file loads on every page for every visitor. Regenerate with
  `python3 -c "import hashlib;print(hashlib.sha256(b'new@email.com').hexdigest())"`

Change all three, run `python3 firebase/build-chat-rules.py`, and publish the
regenerated rules.

## Testing the rules locally

`chat.rules.test.mjs` runs 54 checks against Firebase's real rules engine in
the local emulator. See the comment at the top of that file for how to run it.
