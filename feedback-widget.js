/* HOSA Prep Hub — feedback widget
   Adds a floating "Feedback" button and modal to every page.
   Submissions are saved to Firebase under /feedback/{pushId}.
*/
(function(){
  if (window.__fbWidgetLoaded) return;
  window.__fbWidgetLoaded = true;

  var path = (location.pathname.split('/').pop() || 'index.html').replace('.html','') || 'home';

  var btn = document.createElement('button');
  btn.id = 'fb-fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Send feedback');
  btn.innerHTML = '<span style="margin-right:6px;">✱</span>Feedback';
  btn.style.cssText = [
    'position:fixed','bottom:20px','right:20px','z-index:9998',
    'padding:10px 18px','background:#c9372d','color:#fff',
    'border:none','border-radius:24px',
    "font-family:'Source Serif 4',Georgia,serif",'font-size:14px','font-weight:600',
    'cursor:pointer','box-shadow:0 4px 14px rgba(0,0,0,0.3)',
    'transition:transform 0.15s, box-shadow 0.15s',
    'display:flex','align-items:center'
  ].join(';');
  btn.addEventListener('mouseenter', function(){ btn.style.transform='translateY(-2px)'; btn.style.boxShadow='0 6px 18px rgba(0,0,0,0.35)'; });
  btn.addEventListener('mouseleave', function(){ btn.style.transform=''; btn.style.boxShadow='0 4px 14px rgba(0,0,0,0.3)'; });

  var modal = document.createElement('div');
  modal.id = 'fb-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.65);display:none;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(2px);';
  modal.innerHTML =
    '<div style="background:var(--bg-card,#1e1b17);color:var(--ink,#e4dfd5);max-width:460px;width:100%;padding:30px;border-radius:8px;border:1px solid var(--rule,#302d28);font-family:\'Source Serif 4\',Georgia,serif;max-height:90vh;overflow-y:auto;">' +
      '<h3 style="font-family:\'Fraunces\',serif;font-size:22px;font-weight:500;margin:0 0 6px;">Share your thoughts</h3>' +
      '<p style="color:var(--ink-soft,#9a948c);font-size:14px;margin:0 0 22px;line-height:1.5;">Found a bug, missing topic, or have a suggestion? Anything you say helps me improve the site.</p>' +
      '<div style="margin-bottom:18px;">' +
        '<div style="font-size:13px;color:var(--ink-soft,#9a948c);margin-bottom:8px;">Rate your experience</div>' +
        '<div id="fb-stars" style="display:flex;gap:8px;">' +
          '<span data-r="1" style="cursor:pointer;font-size:28px;color:#555;user-select:none;">★</span>' +
          '<span data-r="2" style="cursor:pointer;font-size:28px;color:#555;user-select:none;">★</span>' +
          '<span data-r="3" style="cursor:pointer;font-size:28px;color:#555;user-select:none;">★</span>' +
          '<span data-r="4" style="cursor:pointer;font-size:28px;color:#555;user-select:none;">★</span>' +
          '<span data-r="5" style="cursor:pointer;font-size:28px;color:#555;user-select:none;">★</span>' +
        '</div>' +
      '</div>' +
      '<div style="margin-bottom:14px;">' +
        '<div style="font-size:13px;color:var(--ink-soft,#9a948c);margin-bottom:6px;">What\'s on your mind?</div>' +
        '<textarea id="fb-text" rows="4" placeholder="Suggestions, bugs, missing topics, anything..." style="width:100%;padding:10px;background:var(--bg,#161411);color:var(--ink,#e4dfd5);border:1px solid var(--rule,#302d28);border-radius:4px;font-family:inherit;font-size:14px;resize:vertical;line-height:1.5;"></textarea>' +
      '</div>' +
      '<div style="margin-bottom:20px;">' +
        '<div style="font-size:13px;color:var(--ink-soft,#9a948c);margin-bottom:6px;">Email <span style="opacity:0.7;">(optional — only if you want a reply)</span></div>' +
        '<input id="fb-email" type="email" placeholder="you@example.com" style="width:100%;padding:10px;background:var(--bg,#161411);color:var(--ink,#e4dfd5);border:1px solid var(--rule,#302d28);border-radius:4px;font-family:inherit;font-size:14px;">' +
      '</div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
        '<button type="button" id="fb-cancel" style="padding:9px 18px;background:transparent;color:var(--ink-soft,#9a948c);border:1px solid var(--rule,#302d28);border-radius:4px;cursor:pointer;font-family:inherit;font-size:14px;">Cancel</button>' +
        '<button type="button" id="fb-submit" style="padding:9px 20px;background:#c9372d;color:#fff;border:none;border-radius:4px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;">Send →</button>' +
      '</div>' +
      '<div id="fb-status" style="margin-top:14px;font-size:13px;min-height:18px;"></div>' +
    '</div>';

  function init() {
    document.body.appendChild(btn);
    document.body.appendChild(modal);

    var rating = 0;
    var stars = modal.querySelectorAll('#fb-stars span');
    function paintStars(n){ stars.forEach(function(s,i){ s.style.color = (i<n) ? '#f1c40f' : '#555'; }); }
    stars.forEach(function(s){
      s.addEventListener('mouseenter', function(){ paintStars(parseInt(s.dataset.r,10)); });
      s.addEventListener('mouseleave', function(){ paintStars(rating); });
      s.addEventListener('click', function(){ rating = parseInt(s.dataset.r,10); paintStars(rating); });
    });

    var fbText = modal.querySelector('#fb-text');
    var fbEmail = modal.querySelector('#fb-email');
    var fbStatus = modal.querySelector('#fb-status');

    function openModal(){ modal.style.display = 'flex'; setTimeout(function(){ fbText.focus(); }, 50); }
    function closeModal(){ modal.style.display = 'none'; }

    btn.addEventListener('click', openModal);
    modal.querySelector('#fb-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && modal.style.display === 'flex') closeModal(); });

    modal.querySelector('#fb-submit').addEventListener('click', function(){
      var text = fbText.value.trim();
      var email = fbEmail.value.trim();
      if (!rating && !text) {
        fbStatus.textContent = 'Add a rating or a comment to send.';
        fbStatus.style.color = '#c04a3f';
        return;
      }
      var data = {
        rating: rating || null,
        text: text || null,
        email: email || null,
        page: path,
        url: location.href,
        userAgent: (navigator.userAgent || '').slice(0,200),
        submittedAt: new Date().toISOString()
      };
      try {
        var user = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
        if (user) { data.userId = user.uid; data.userEmail = user.email || null; }
      } catch(e){}

      fbStatus.textContent = 'Sending…';
      fbStatus.style.color = 'var(--ink-soft,#9a948c)';

      if (typeof firebase === 'undefined' || !firebase.database) {
        fbStatus.textContent = 'Couldn\'t connect. Please refresh and try again.';
        fbStatus.style.color = '#c04a3f';
        return;
      }

      firebase.database().ref('feedback').push(data).then(function(){
        fbStatus.textContent = 'Thank you — your feedback was received.';
        fbStatus.style.color = '#3d7a52';
        try { if (typeof gtag === 'function') gtag('event', 'feedback_submitted', { rating: rating || 0, page: path, has_text: text ? 1 : 0 }); } catch(e){}
        setTimeout(function(){
          closeModal();
          fbText.value = ''; fbEmail.value = '';
          rating = 0; paintStars(0);
          fbStatus.textContent = '';
        }, 1600);
      }).catch(function(err){
        fbStatus.textContent = 'Couldn\'t send: ' + ((err && err.message) || 'try again later');
        fbStatus.style.color = '#c04a3f';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
