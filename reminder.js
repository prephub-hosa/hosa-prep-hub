/* ═════════════════════════════════════════════════════════════════
   Study reminder.

   This site has no server, so it can never send anyone an email or a
   push notification. That is the real reason students do not come
   back: nothing ever reminds them. The one channel a static page can
   reach is the phone the student already carries — by handing them a
   calendar event.

   Pick days and a time, get a .ics file. Their own calendar app then
   fires the alert, every week, with a link straight back to the cards
   they owe. Works on iOS, Android, Google Calendar and Outlook, needs
   no permission prompt, and survives clearing site data.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var SITE = 'https://hosaprephub.vercel.app/';
  var KEY  = 'hosa::reminder';

  var DAYS = [
    { code: 'MO', label: 'Mon' }, { code: 'TU', label: 'Tue' },
    { code: 'WE', label: 'Wed' }, { code: 'TH', label: 'Thu' },
    { code: 'FR', label: 'Fri' }, { code: 'SA', label: 'Sat' },
    { code: 'SU', label: 'Sun' }
  ];

  function pad(n) { return String(n).padStart(2, '0'); }

  function saved() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }

  /**
   * The next date at `hour:minute` that falls on one of `days`.
   * Calendars need a concrete first occurrence; RRULE repeats from there.
   */
  function firstOccurrence(days, hour, minute) {
    var order = DAYS.map(function (d) { return d.code; });
    var d = new Date();
    d.setSeconds(0, 0);
    for (var i = 0; i < 8; i++) {
      var cand = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, hour, minute, 0, 0);
      // JS weeks start Sunday; our list starts Monday.
      var code = order[(cand.getDay() + 6) % 7];
      if (days.indexOf(code) !== -1 && cand > new Date()) return cand;
    }
    return new Date(Date.now() + 86400000);
  }

  // Local wall-clock stamp. Deliberately floating (no Z, no TZID): the
  // student should be reminded at 7pm wherever they are, not at 7pm in
  // whatever zone they happened to set it up in.
  function stampLocal(d) {
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
           'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }
  function stampUTC(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) +
           'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }

  // RFC 5545 wants CRLF, and long lines folded at 75 octets.
  function fold(line) {
    if (line.length <= 73) return line;
    var out = line.slice(0, 73), rest = line.slice(73);
    while (rest.length > 72) { out += '\r\n ' + rest.slice(0, 72); rest = rest.slice(72); }
    return out + '\r\n ' + rest;
  }
  function esc(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  }

  /**
   * Build the calendar file.
   *   days   — ['MO','WE','FR']
   *   hour   — 0-23
   *   minute — 0-59
   *   mins   — minutes of study, used in the description
   */
  function buildICS(days, hour, minute, mins) {
    var start = firstOccurrence(days, hour, minute);
    var end   = new Date(start.getTime() + (mins || 15) * 60000);
    var uid   = 'hosa-' + start.getTime() + '-' + Math.random().toString(36).slice(2, 8) + '@hosaprephub';

    var desc = 'Open HOSA Prep Hub and clear the cards you owe today. '
             + (mins || 15) + ' minutes is enough to keep your streak and stay on schedule.\n\n' + SITE;

    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HOSA Prep Hub//Study Reminder//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + stampUTC(new Date()),
      'DTSTART:' + stampLocal(start),
      'DTEND:' + stampLocal(end),
      'RRULE:FREQ=WEEKLY;BYDAY=' + days.join(','),
      fold('SUMMARY:' + esc('Study HOSA — ' + (mins || 15) + ' min')),
      fold('DESCRIPTION:' + esc(desc)),
      fold('URL:' + SITE),
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      fold('DESCRIPTION:' + esc('Time to study — your HOSA cards are waiting')),
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];
    return lines.join('\r\n') + '\r\n';
  }

  function download(text, filename) {
    var blob = new Blob([text], { type: 'text/calendar;charset=utf-8' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  /* ── UI ───────────────────────────────────────────────────────── */

  function render(host) {
    if (!host) return;
    var prev = saved() || { days: ['MO', 'TU', 'WE', 'TH'], hour: 19, minute: 0, mins: 15 };

    var dayBtns = DAYS.map(function (d) {
      var on = prev.days.indexOf(d.code) !== -1;
      return '<button type="button" class="rm-day' + (on ? ' on' : '') + '" data-day="' + d.code + '"' +
             ' aria-pressed="' + (on ? 'true' : 'false') + '">' + d.label + '</button>';
    }).join('');

    host.innerHTML =
      '<div class="rm-card">' +
        '<div class="rm-kicker">Reminder</div>' +
        '<div class="rm-title">Get a nudge when it is time</div>' +
        '<p class="rm-sub">This site cannot email you. Your calendar can. Pick your days and ' +
        'we will hand you a repeating reminder that opens straight back here.</p>' +
        '<div class="rm-days" role="group" aria-label="Days to study">' + dayBtns + '</div>' +
        '<div class="rm-row">' +
          '<label class="rm-field"><span>At</span>' +
            '<input type="time" id="rm-time" value="' + pad(prev.hour) + ':' + pad(prev.minute) + '"></label>' +
          '<label class="rm-field"><span>For</span>' +
            '<select id="rm-mins">' +
              [10, 15, 20, 30, 45].map(function (m) {
                return '<option value="' + m + '"' + (m === prev.mins ? ' selected' : '') + '>' + m + ' min</option>';
              }).join('') +
            '</select></label>' +
        '</div>' +
        '<button type="button" class="rm-btn" id="rm-go">Add to my calendar</button>' +
        '<p class="rm-note" id="rm-note" role="status"></p>' +
      '</div>';

    host.style.display = '';

    var picked = prev.days.slice();
    host.querySelectorAll('.rm-day').forEach(function (b) {
      b.addEventListener('click', function () {
        var code = b.getAttribute('data-day');
        var i = picked.indexOf(code);
        if (i === -1) picked.push(code); else picked.splice(i, 1);
        b.classList.toggle('on', i === -1);
        b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
      });
    });

    host.querySelector('#rm-go').addEventListener('click', function () {
      var note = host.querySelector('#rm-note');
      if (!picked.length) { note.textContent = 'Pick at least one day.'; return; }
      var t = (host.querySelector('#rm-time').value || '19:00').split(':');
      var hour = parseInt(t[0], 10) || 0, minute = parseInt(t[1], 10) || 0;
      var mins = parseInt(host.querySelector('#rm-mins').value, 10) || 15;

      // Keep the weekday order stable so the RRULE reads naturally.
      var ordered = DAYS.map(function (d) { return d.code; })
                        .filter(function (c) { return picked.indexOf(c) !== -1; });

      save({ days: ordered, hour: hour, minute: minute, mins: mins });
      download(buildICS(ordered, hour, minute, mins), 'hosa-study-reminder.ics');
      try { gtag('event', 'reminder_added', { days: ordered.length, hour: hour }); } catch (e) {}
      note.textContent = 'Downloaded. Open the file and your calendar will add it — '
                       + ordered.length + ' day' + (ordered.length === 1 ? '' : 's') + ' a week at '
                       + pad(hour) + ':' + pad(minute) + '.';
    });
  }

  global.HosaReminder = { mount: render, buildICS: buildICS, saved: saved };
})(window);
