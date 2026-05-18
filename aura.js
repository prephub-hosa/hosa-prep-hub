/* AURA — scroll reveal & micro-motion. Auto-tags common content blocks. */
(function() {
  if (window.__auraInit) return;
  window.__auraInit = true;

  function init() {
    // Tag sections/cards for reveal if not already tagged
    var selectors = [
      '.hero', '.section-head', '.your-progress', '#continue-studying > *',
      '.category-card', '.totd-section', '.find-event-pill',
      '#start-here > *', '#how-section > *', '.newsletter',
      '.masthead', 'nav.tabs', '.flashcard-stage', '.quiz-stage',
      '.must-know-section'
    ];
    var nodes = document.querySelectorAll(selectors.join(','));
    nodes.forEach(function(el, i) {
      if (!el.hasAttribute('data-aura-reveal')) {
        el.setAttribute('data-aura-reveal', '');
        // Tiny stagger for nicer flow
        var delay = Math.min(i * 30, 240);
        el.style.transitionDelay = delay + 'ms';
      }
    });

    // Reveal on scroll
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      nodes.forEach(function(el) { obs.observe(el); });
    } else {
      // Fallback: just show them
      nodes.forEach(function(el) { el.classList.add('in-view'); });
    }

    // Subtle parallax on aurora glows (only if reduce-motion not set)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var lastY = 0, ticking = false;
      window.addEventListener('scroll', function() {
        lastY = window.scrollY;
        if (!ticking) {
          requestAnimationFrame(function() {
            var shift = Math.min(lastY * 0.05, 60);
            document.body.style.backgroundPosition =
              '0 ' + (-shift) + 'px, 0 ' + (-shift * 1.4) + 'px, 0 ' + (-shift * 0.6) + 'px';
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
