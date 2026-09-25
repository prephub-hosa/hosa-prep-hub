"""
Generates firebase/chat.rules.json.

The Realtime Database rules language has no functions or variables, so the
same checks ("is this person the admin?", "is this person in the chapter?")
have to be pasted into every rule that needs them. Writing them out by hand
is how one copy ends up subtly different from the others. They are written
once here and substituted in.

Run:  python3 firebase/build-chat-rules.py
"""
import json, os

ADMIN_EMAIL = 'tylerkim1215@gmail.com'   # must match ADMIN_EMAIL in admin.html

signed_in = "auth != null"
is_admin  = "(auth != null && auth.token.email === '%s')" % ADMIN_EMAIL
# Membership is the chapter tag on the student's own leaderboard row — the
# same field joining a chapter has always written.
is_member = "(auth != null && root.child('leaderboard/level/' + auth.uid + '/chapter').val() === $slug)"
is_owner  = "(auth != null && root.child('chat/' + $slug + '/owners/' + auth.uid).val() === true)"

def email_matches(path):
    # Guarded: calling toLowerCase() on a missing value is an evaluation
    # error, and an error anywhere in a rule denies the whole write.
    return ("(auth.token.email != null && root.child('%s/' + $slug + '/contactEmail').isString() && "
            "auth.token.email.toLowerCase() === root.child('%s/' + $slug + '/contactEmail').val().toLowerCase())"
            % (path, path))

last_post_old = "root.child('chat/' + $slug + '/lastPost/' + auth.uid)"
last_post_new = "newData.parent().parent().child('lastPost/' + auth.uid)"

def message_rules(can_read, can_post, allowed_roles):
    role_checks = []
    for role, who in allowed_roles:
        role_checks.append("(newData.child('role').val() === '%s' && %s)" % (role, who))
    return {
        ".read": can_read,
        "$msg": {
            ".write": " || ".join([
                # post: only a brand new message, only as yourself (validated below)
                "(!data.exists() && newData.exists() && %s)" % can_post,
                # delete: your own, or anything if you run the chapter or the site
                "(data.exists() && !newData.exists() && (data.child('uid').val() === auth.uid || %s || %s))" % (is_owner, is_admin),
                # there is deliberately no third case: nobody can edit a message
            ]),
            ".validate": " && ".join([
                "newData.hasChildren(['uid', 'name', 'text', 'ts', 'role'])",
                "newData.child('uid').val() === auth.uid",
                "(%s)" % " || ".join(role_checks),
                # server time only, so nobody can backdate or future-date a message
                "newData.child('ts').val() === now",
                # 1.5 s between posts, enforced by the database rather than the page
                "%s.val() === now" % last_post_new,
                "(!%s.exists() || %s.val() <= now - 1500)" % (last_post_old, last_post_old),
            ]),
            "uid":  {".validate": "newData.isString()"},
            "name": {".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 40"},
            "text": {".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 500"},
            "ts":   {".validate": "newData.isNumber()"},
            "role": {".validate": "newData.isString()"},
            "$other": {".validate": False},
        },
    }

rules = {
    "chat": {
        # Only the admin can list every chapter's chat at once.
        ".read": is_admin,
        "$slug": {
            ".validate": "$slug.matches(/^[a-z0-9-]{1,44}$/)",
            # Chapter room: members, the founder, and you.
            "room": message_rules(
                can_read=" || ".join([is_member, is_owner, is_admin]),
                can_post=" || ".join([is_member, is_owner, is_admin]),
                allowed_roles=[("member", is_member), ("founder", is_owner), ("admin", is_admin)],
            ),
            # Founder <-> HOSA Prep Hub: the founder and you, nobody else.
            "team": message_rules(
                can_read=" || ".join([is_owner, is_admin]),
                can_post=" || ".join([is_owner, is_admin]),
                allowed_roles=[("founder", is_owner), ("admin", is_admin)],
            ),
            "owners": {
                ".read": signed_in,
                "$uid": {
                    ".write": " || ".join([
                        is_admin,
                        # A founder claims an unclaimed chapter by signing in with
                        # the email the chapter was registered under.
                        "(auth != null && auth.uid === $uid && !data.parent().exists() && newData.val() === true && (%s || %s))"
                        % (email_matches('chapters'), email_matches('analytics/chapters')),
                    ]),
                    ".validate": "newData.isBoolean()",
                },
            },
            "lastPost": {
                "$uid": {
                    ".write": "auth != null && auth.uid === $uid",
                    ".validate": "newData.val() === now",
                },
            },
            "$other": {".validate": False},
        },
    },
}

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'chat.rules.json')
with open(out, 'w') as f:
    json.dump(rules, f, indent=2)
    f.write('\n')
print('wrote', out)

# The same block, ready to paste straight after the opening `"rules": {` in
# the Firebase console. It ends with a comma so it slots in ahead of
# whatever rules are already there without anyone editing JSON by hand.
body = json.dumps(rules, indent=2)
inner = body[body.index('{') + 1: body.rindex('}')].strip('\n')
snippet = os.path.join(here, 'PASTE-INTO-FIREBASE-RULES.txt')
with open(snippet, 'w') as f:
    f.write(inner.rstrip() + ',\n')
print('wrote', snippet)
