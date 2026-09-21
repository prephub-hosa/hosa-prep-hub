/* ═════════════════════════════════════════════════════════════════
   How many cards each event actually has.

   This is the denominator for every "x% mastered" figure on the site,
   and getting it wrong is not a rounding error. Three places used to
   compute mastery as

       mastered / cards-seen

   which reads 100% the moment you master the handful of cards you have
   looked at — so a student who had flipped through one card was told
   they had finished a 77-term event. A fourth place did ask for the real
   total, but the table lived in leaderboard.js, which loaded after the
   page had already rendered, so it got undefined and fell back to the
   same wrong denominator.

   One table now, loaded before anything that divides by it, generated
   from the decks themselves rather than maintained by hand.
   ═════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var TOTAL_TERMS = {
    'addiction-medicine':               64,
    'allergy-immunology':               11,
    'anatomy-physiology':               96,
    'anesthesiology':                   12,
    'audiology':                        22,
    'behavioral-health':                77,
    'biochemistry':                     112,
    'biomedical-lab-science':           68,
    'biostatistics-research':           68,
    'biotechnology':                    80,
    'cardiovascular-science':           30,
    'cell-biology-histology':           76,
    'clinical-genetics':                25,
    'clinical-nursing':                 87,
    'cpr-first-aid':                    68,
    'dental-science':                   67,
    'dermatology':                      25,
    'disaster-preparedness':            66,
    'emergency-medical-science':        69,
    'endocrinology':                    24,
    'epidemiology':                     58,
    'exercise-physiology':              66,
    'forensic-science':                 37,
    'gastroenterology':                 26,
    'genetics':                         33,
    'geriatric-psychiatry':             29,
    'geriatrics':                       18,
    'global-health':                    12,
    'health-equity':                    24,
    'health-informatics':               28,
    'healthcare-systems':               20,
    'hematology':                       26,
    'hepatology':                       13,
    'human-growth-development':         78,
    'immunology':                       27,
    'infectious-disease':               17,
    'interventional-cardiology':        33,
    'job-seeking-skills':               62,
    'medical-assisting':                50,
    'medical-coding-billing':           71,
    'medical-law-ethics':               69,
    'medical-math':                     75,
    'medical-microbiology':             55,
    'medical-spelling':                 56,
    'medical-terminology':              216,
    'neonatology':                      13,
    'nephrology':                       19,
    'neurology':                        25,
    'nursing-assisting':                27,
    'nutrition':                        127,
    'obstetrics-gynecology':            21,
    'occupational-health-safety':       66,
    'occupational-therapy':             33,
    'oncology':                         26,
    'ophthalmology':                    33,
    'optometry':                        30,
    'orthopedics':                      42,
    'otolaryngology':                   18,
    'pain-management':                  18,
    'palliative-care':                  12,
    'parliamentary-procedure':          68,
    'pathophysiology':                  147,
    'patient-safety':                   12,
    'pediatric-emergency':              12,
    'pediatrics':                       20,
    'perioperative-care':               23,
    'pharmacology':                     72,
    'pharmacy-science':                 46,
    'phlebotomy':                       60,
    'physical-medicine-rehabilitation': 12,
    'physical-therapy':                 72,
    'prehospital-ems':                  12,
    'psychiatry':                       15,
    'public-health':                    80,
    'pulmonology':                      12,
    'radiologic-science':               42,
    'reproductive-health':              12,
    'respiratory-therapy':              30,
    'rheumatology':                     17,
    'sleep-medicine':                   15,
    'speech-language-pathology':        21,
    'sports-medicine':                  73,
    'surgical-technology':              25,
    'toxicology':                       12,
    'transplant-medicine':              34,
    'trauma-critical-care':             19,
    'urology':                          18,
    'vascular-medicine':                12,
    'veterinary-science':               68,
    'wilderness-medicine':              21,
    'wound-care':                       32
  };

  global.TOTAL_TERMS = TOTAL_TERMS;

  /** The event's real card count, or 0 when we genuinely do not know. */
  global.hosaTotalTerms = function (slug) {
    return TOTAL_TERMS[slug] || 0;
  };

  /**
   * Mastery as a percentage of the whole event.
   * Returns null when the total is unknown, so a caller can say nothing
   * rather than claim a number it cannot support.
   */
  global.hosaMasteryPct = function (slug, mastered) {
    var total = TOTAL_TERMS[slug] || 0;
    if (!total) return null;
    return Math.max(0, Math.min(100, Math.round((mastered || 0) / total * 100)));
  };
})(window);
