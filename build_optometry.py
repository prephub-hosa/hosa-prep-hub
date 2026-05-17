#!/usr/bin/env python3
"""Generate optometry.html from dental-science.html template."""
import os, re

BASE = '/home/user/hosa-prep-hub'
SRC  = os.path.join(BASE, 'dental-science.html')
DST  = os.path.join(BASE, 'optometry.html')

with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()

TERMS_JS = '''const TERMS = [
  // ── Eye Anatomy ──────────────────────────────────────────────
  { term: "Cornea", type: "concept", category: "anatomy", meaning: "The transparent, dome-shaped anterior surface of the eye; provides ~⅔ of the eye's refractive power (~43 D). Avascular — receives oxygen directly from air and nutrients from aqueous humor and tear film.", example: "The cornea's curvature determines most of the eye's focusing power; LASIK reshapes it to correct refractive errors." },
  { term: "Sclera", type: "concept", category: "anatomy", meaning: "The opaque, white outer fibrous coat of the eye that maintains shape and protects internal structures; continuous with the cornea at the limbus. Six extraocular muscles insert into it.", example: "The patient's icteric sclera was an early sign of hyperbilirubinemia from acute hepatitis." },
  { term: "Iris and Pupil", type: "concept", category: "anatomy", meaning: "The iris is the pigmented muscular diaphragm controlling pupil diameter. Sphincter pupillae (parasympathetic) constricts; dilator pupillae (sympathetic) dilates. Normal pupil 2–4 mm; reacts to light and accommodation.", example: "The patient's pupils were equal, round, and reactive to light and accommodation (PERRLA) — normal pupillary exam." },
  { term: "Lens and Accommodation", type: "concept", category: "anatomy", meaning: "The biconvex crystalline lens behind the iris focuses light onto the retina. Ciliary muscle contraction relaxes zonules → lens becomes more convex → near focus (accommodation). Presbyopia is loss of lens elasticity with age.", example: "By age 45 the patient could no longer accommodate sufficiently for fine print — presbyopia — and was prescribed reading glasses." },
  { term: "Retina (Rods and Cones)", type: "concept", category: "anatomy", meaning: "The neural layer lining the posterior eye. Rods (~120 million, peripheral) handle scotopic (low-light) vision and motion. Cones (~6 million, concentrated in fovea) handle photopic vision and color (three types: red, green, blue).", example: "The retinitis pigmentosa patient's rod degeneration first caused night blindness, then peripheral vision loss." },
  { term: "Macula and Fovea Centralis", type: "concept", category: "anatomy", meaning: "The macula is the central retinal area responsible for high-acuity vision; the fovea is its center, packed with cones and providing 20/20 acuity. Macular degeneration causes central vision loss.", example: "The fundus exam showed drusen and pigmentary changes in the macula — early age-related macular degeneration affecting central vision." },
  { term: "Optic Nerve and Optic Disc", type: "concept", category: "anatomy", meaning: "Cranial nerve II carries retinal signals to the brain; exits the eye at the optic disc (physiologic blind spot — no photoreceptors). Cup-to-disc ratio normally <0.4; enlarged in glaucoma.", example: "The increased cup-to-disc ratio of 0.7 was a concerning sign of glaucomatous optic nerve damage." },
  { term: "Aqueous and Vitreous Humor", type: "concept", category: "anatomy", meaning: "Aqueous humor: clear fluid in anterior/posterior chambers, produced by ciliary body, drained by trabecular meshwork → Schlemm's canal. Vitreous humor: gel filling the posterior segment behind the lens; provides eye shape.", example: "Impaired aqueous drainage through the trabecular meshwork caused elevated IOP and open-angle glaucoma." },

  // ── Refractive Errors ────────────────────────────────────────
  { term: "Myopia (Nearsightedness)", type: "concept", category: "refraction", meaning: "Light focuses anterior to the retina because the eye is too long (axial) or the cornea/lens too powerful (refractive). Distance vision blurred; near vision clear. Corrected with concave (minus) lenses.", example: "The student's −3.50 D spherical correction for myopia restored 20/20 distance vision through concave lenses." },
  { term: "Hyperopia (Farsightedness)", type: "concept", category: "refraction", meaning: "Light focuses posterior to the retina because the eye is too short or refractive power too weak. Near vision blurred; distance often clear with accommodation. Corrected with convex (plus) lenses.", example: "The patient's +2.00 D hyperopic correction with convex lenses reduced eye strain from constant accommodation while reading." },
  { term: "Astigmatism", type: "concept", category: "refraction", meaning: "Asymmetric corneal or lens curvature causing light to focus at different points (instead of a single point); produces distorted vision at all distances. Corrected with cylindrical lenses at a specific axis.", example: "The prescription −2.00 −1.25 × 180 corrected myopia plus 1.25 D of astigmatism with the cylinder axis at 180°." },
  { term: "Presbyopia", type: "concept", category: "refraction", meaning: "Age-related loss of lens elasticity reducing accommodation; usually noticed after age 40. Corrected with reading glasses, bifocals, progressive lenses, or multifocal contact lenses/IOLs.", example: "After age 45 the patient could no longer read menus without holding them at arm's length — typical presbyopia — and bifocals were prescribed." },
  { term: "Snellen Visual Acuity", type: "concept", category: "refraction", meaning: "Standard distance acuity test using a chart at 20 ft (6 m). 20/20 means the patient sees at 20 ft what a normal eye sees at 20 ft. 20/200 in better eye with correction = legal blindness.", example: "The patient's uncorrected visual acuity was 20/200 — qualifying as legal blindness — but improved to 20/30 with the new prescription." },
  { term: "Refraction (Manifest vs Cycloplegic)", type: "concept", category: "refraction", meaning: "Manifest refraction measures the patient's current refractive state with full accommodation. Cycloplegic refraction uses cycloplegic drops (cyclopentolate, atropine) to paralyze accommodation — essential in children and hyperopes.", example: "The hyperopic 8-year-old required cycloplegic refraction to relax accommodation and reveal the true +4.00 D refractive error masked by manifest testing." },
  { term: "Diopter (D)", type: "concept", category: "refraction", meaning: "The unit of optical power equal to the reciprocal of focal length in meters (D = 1/f). +1.00 D = 1 m focal length; −2.00 D = diverging lens with 50 cm focal length. Used to quantify refractive corrections.", example: "A +2.50 D reading lens has a focal length of 1/2.50 = 0.40 m or 40 cm — about average reading distance." },

  // ── Eye Diseases ─────────────────────────────────────────────
  { term: "Glaucoma (Open-Angle)", type: "concept", category: "diseases", meaning: "Progressive optic neuropathy usually with elevated IOP (>21 mmHg); painless gradual peripheral vision loss → tunnel vision → blindness. Diagnosed by tonometry, optic disc exam (cupping), visual fields. Treated with topical prostaglandins, beta-blockers.", example: "The 65-year-old's IOP of 28 mmHg and 0.7 cup-to-disc ratio confirmed open-angle glaucoma; latanoprost was prescribed nightly." },
  { term: "Cataract", type: "concept", category: "diseases", meaning: "Opacification of the crystalline lens, most commonly age-related (senile cataract); causes painless gradual blurring, glare, and reduced contrast. Treated by phacoemulsification + IOL implantation when vision-impairing.", example: "The patient's progressive nuclear sclerotic cataract reduced acuity to 20/100; phacoemulsification with IOL restored 20/25 vision." },
  { term: "Age-Related Macular Degeneration (AMD)", type: "concept", category: "diseases", meaning: "Dry AMD (90%): drusen deposits and atrophy of central retina, gradual central vision loss. Wet AMD (10%): choroidal neovascularization → leakage and rapid central vision loss; treated with anti-VEGF injections.", example: "OCT showed subretinal fluid and CNV in the macula — wet AMD — and the patient received monthly bevacizumab injections." },
  { term: "Diabetic Retinopathy", type: "concept", category: "diseases", meaning: "Microvascular complication of diabetes: non-proliferative (microaneurysms, hemorrhages, exudates, cotton-wool spots) → proliferative (neovascularization → vitreous hemorrhage, traction RD). Diabetic macular edema is a major cause of vision loss.", example: "The diabetic patient's dilated exam revealed proliferative retinopathy with neovascularization; panretinal photocoagulation was performed." },
  { term: "Conjunctivitis (Pink Eye)", type: "concept", category: "diseases", meaning: "Inflammation of the conjunctiva: viral (most common, watery discharge, often adenovirus); bacterial (purulent discharge); allergic (bilateral, itchy, watery, history of allergies). Hand hygiene critical for viral spread.", example: "The child's red eyes with profuse purulent discharge and matting on awakening suggested bacterial conjunctivitis; topical antibiotics were prescribed." },
  { term: "Retinal Detachment", type: "concept", category: "diseases", meaning: "Separation of the neurosensory retina from the underlying RPE — surgical emergency. Symptoms: sudden flashes, floaters, curtain or shadow in visual field. Risk factors: high myopia, posterior vitreous detachment, trauma.", example: "The high-myope reported sudden flashes and a 'curtain' in his peripheral vision — retinal detachment confirmed by dilated exam; urgent vitrectomy was scheduled." },
  { term: "Strabismus and Amblyopia", type: "concept", category: "diseases", meaning: "Strabismus: misalignment of the eyes (esotropia inward, exotropia outward). Amblyopia ('lazy eye'): reduced acuity in one eye due to abnormal visual experience in childhood — strabismus, refractive imbalance, or deprivation. Treated by patching the dominant eye.", example: "The 5-year-old's right esotropia caused amblyopia (20/200 OD); patching the left eye 4 hours daily restored 20/40 acuity over 6 months." },
  { term: "Dry Eye Syndrome", type: "concept", category: "diseases", meaning: "Chronic disorder from inadequate tear production or excessive evaporation; symptoms: burning, foreign-body sensation, fluctuating vision. Treated with artificial tears, cyclosporine, punctal plugs, omega-3 supplementation.", example: "The postmenopausal patient's Schirmer test showed <5 mm wetting in 5 minutes — diagnostic of aqueous-deficient dry eye." },

  // ── Examination & Procedures ─────────────────────────────────
  { term: "Slit-Lamp Biomicroscopy", type: "concept", category: "exam", meaning: "Binocular microscope with a focused slit beam; allows magnified examination of anterior segment structures: eyelids, conjunctiva, cornea, anterior chamber, iris, lens, and anterior vitreous.", example: "Slit-lamp exam revealed a small corneal abrasion stained green with fluorescein and a clear anterior chamber without cells." },
  { term: "Tonometry", type: "concept", category: "exam", meaning: "Measurement of intraocular pressure. Goldmann applanation (gold standard, mounted on slit lamp). Tono-Pen (handheld). Non-contact 'air puff' tonometer for screening. Normal IOP: 10–21 mmHg.", example: "Goldmann applanation tonometry measured IOP at 16 mmHg OD and 17 mmHg OS — within normal limits." },
  { term: "Direct vs Indirect Ophthalmoscopy", type: "concept", category: "exam", meaning: "Direct: handheld scope viewed through patient's pupil at close range; provides ~15× magnified upright image; narrow field. Indirect: head-mounted with condensing lens; wider field, stereoscopic, used by ophthalmologists for peripheral retina.", example: "The PCP used direct ophthalmoscopy to inspect the optic disc; the ophthalmologist used indirect to inspect the peripheral retina for tears." },
  { term: "Visual Field Testing (Perimetry)", type: "concept", category: "exam", meaning: "Maps the visual field by detecting where the patient sees test stimuli. Automated perimetry (Humphrey) screens for glaucoma defects (arcuate scotomas, nasal step) and neurological lesions (hemianopia).", example: "Humphrey visual field testing showed a superior arcuate scotoma in the right eye — consistent with glaucomatous optic nerve damage." },
  { term: "Fluorescein Staining", type: "concept", category: "exam", meaning: "Orange dye applied to the ocular surface fluoresces green under cobalt blue light wherever the corneal epithelium is disrupted; reveals abrasions, ulcers, dry spots, and contact lens fit issues.", example: "Fluorescein staining revealed a vertical linear corneal abrasion with the patient's recent contact lens — typical of a contact-related abrasion." },
  { term: "Optical Coherence Tomography (OCT)", type: "concept", category: "exam", meaning: "Non-invasive imaging using infrared light to produce cross-sectional images of the retina with µm resolution; used for AMD, macular edema, glaucoma (RNFL thickness), and many retinal conditions.", example: "OCT showed intraretinal fluid in the macula — diabetic macular edema — guiding the decision to administer anti-VEGF injection." },
  { term: "Contact Lens Fitting and Care", type: "concept", category: "exam", meaning: "Soft lenses (most common, daily/biweekly/monthly disposables), rigid gas permeable (for astigmatism, keratoconus), scleral lenses (large diameter for severe ocular surface disease). Hygiene is critical — sleeping in lenses increases microbial keratitis risk 5–10×.", example: "The patient was educated never to sleep in her monthly soft contacts and to use only fresh multipurpose solution — minimizing risk of Pseudomonas keratitis." },
];'''

m = re.search(r'const TERMS = \[.*?^\];', html, re.DOTALL | re.MULTILINE)
if not m: raise SystemExit('TERMS not found')
html = html[:m.start()] + TERMS_JS + html[m.end():]

CAT = """const categoryLabel = c => ({
  'anatomy':    'Eye Anatomy',
  'refraction': 'Refractive Errors',
  'diseases':   'Eye Diseases',
  'exam':       'Examination & Procedures',
})[c] || c;"""
html = re.sub(r"const categoryLabel = c => \(\{[^}]+\}\)\[c\] \|\| c;", CAT, html, count=1, flags=re.DOTALL)

html = html.replace("const DB_PATH = 'dental-science';", "const DB_PATH = 'optometry';", 1)
html = html.replace('<title>HOSA Prep Hub — Dental Science</title>',
                    '<title>HOSA Prep Hub — Optometry</title>', 1)
html = html.replace('<h1>Dental<br><em>Science</em>.</h1>',
                    '<h1>Opto<em>metry</em>.</h1>', 1)
html = html.replace(
    'A study companion for Dental anatomy, oral diseases, preventive dentistry, restorative procedures, dental materials, and infection control — built for HOSA competitors.',
    'A study companion for eye anatomy, refractive errors, eye diseases, and ophthalmic examination and procedures — built for HOSA competitors.',
    1
)
html = html.replace('//  DATA — HOSA Emergency Medical Science',
                    '//  DATA — HOSA Optometry', 1)

with open(DST, 'w', encoding='utf-8') as f:
    f.write(html)

count = TERMS_JS.count('{ term:')
print(f'Wrote {DST} — {count} terms')
