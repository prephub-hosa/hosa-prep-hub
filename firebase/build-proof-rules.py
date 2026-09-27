"""
Generates firebase/proof.rules.json — the rules for the Rewards tab.

What lives under proof/:

  reviews/<uid>            one review per account: stars + a sentence
  results/<uid>/<id>       competition results an account reports
  chapters/<slug>          a founder's shout-out for their chapter
  stats                    headline numbers the admin publishes (public)
  snapshots/<yyyy-mm-dd>   the admin's daily record of those numbers

The point of all of it is proof, so the rules make it trustworthy:
everything is tied to a signed-in account, stamped with server time,
length-capped, and only the admin can mark anything approved — any edit
by the author clears the approval, so an approved review cannot be
swapped for something else afterwards.

Run:  python3 firebase/build-proof-rules.py
"""
import json, os

ADMIN_EMAIL = 'tylerkim1215@gmail.com'   # must match build-chat-rules.py and admin.html

is_admin = "(auth != null && auth.token.email === '%s')" % ADMIN_EMAIL
is_owner = "(auth != null && root.child('chat/' + $slug + '/owners/' + auth.uid).val() === true)"

def text(max_len, min_len=1):
    return {".validate": "newData.isString() && newData.val().length >= %d && newData.val().length <= %d" % (min_len, max_len)}

def authored(required, owner_check):
    """Write/validate for something a signed-in person writes about
    themselves, which only the admin may approve."""
    return {
        ".write": "(%s) || %s" % (owner_check, is_admin),
        ".validate": " && ".join([
            "(!newData.exists() || newData.hasChildren(%s))" % json.dumps(required).replace('"', "'"),
            # the author: server time, and never an approval of their own
            "(!newData.exists() || %s || (newData.child('ts').val() === now && !newData.child('approved').exists()))" % is_admin,
        ]),
    }

common = {
    "name":        text(40),
    "chapter":     text(80, 0),
    "chapterSlug": {".validate": "newData.isString() && newData.val().matches(/^[a-z0-9-]{0,44}$/)"},
    "public":      {".validate": "newData.isBoolean()"},
    "approved":    {".validate": "newData.isBoolean()"},
    "ts":          {".validate": "newData.isNumber()"},
    "$other":      {".validate": False},
}

review = authored(['stars', 'text', 'name', 'ts'], "auth != null && auth.uid === $uid")
review.update(common)
review.update({
    "stars": {".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 5 && newData.val() % 1 === 0"},
    "text":  text(280),
})

result = authored(['level', 'event', 'place', 'year', 'name', 'ts'], "auth != null && auth.uid === $uid")
result.update(common)
result.update({
    "level": {".validate": "newData.isString() && newData.val().matches(/^(regional|area|state|ilc|other)$/)"},
    "event": text(80),
    # 0 = competed without placing, 1..10 = the place
    "place": {".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10 && newData.val() % 1 === 0"},
    "year":  {".validate": "newData.isNumber() && newData.val() >= 2020 && newData.val() <= 2100"},
})

shout = authored(['text', 'name', 'uid', 'ts'], is_owner)
shout.update(common)
shout.update({
    "text": text(400),
    "uid":  {".validate": "newData.isString() && (newData.val() === auth.uid || %s)" % is_admin},
})

rules = {
    "proof": {
        "reviews": {
            ".read": True,
            "$uid": review,
        },
        "results": {
            ".read": True,
            "$uid": {
                "$rid": dict(result, **{".validate": result[".validate"] + " && $rid.matches(/^[A-Za-z0-9_-]{1,40}$/)"}),
            },
        },
        "chapters": {
            ".read": True,
            "$slug": dict(shout, **{".validate": shout[".validate"] + " && $slug.matches(/^[a-z0-9-]{1,44}$/)"}),
        },
        "stats": {
            ".read": True,
            ".write": is_admin,
        },
        "snapshots": {
            ".read": is_admin,
            "$day": {
                ".write": is_admin,
                ".validate": "$day.matches(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)",
            },
        },
        "$other": {".validate": False},
    },
}

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'proof.rules.json')
with open(out, 'w') as f:
    json.dump(rules, f, indent=2)
    f.write('\n')
print('wrote', out)

# Ready to paste on a new line straight after `"rules": {` in the Firebase
# console, exactly like the chat block. Ends with a comma for the same reason.
body = json.dumps(rules, indent=2)
inner = body[body.index('{') + 1: body.rindex('}')].strip('\n')
snippet = os.path.join(here, 'PASTE-PROOF-INTO-FIREBASE-RULES.txt')
with open(snippet, 'w') as f:
    f.write(inner.rstrip() + ',\n')
print('wrote', snippet)
