#!/usr/bin/env python3
import os, re

EVENT_GUIDES = {
"allergy-immunology": {
  "title": "Allergy & Immunology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Immune system basics, allergy mechanisms, hypersensitivity reactions, immunodeficiency disorders, autoimmune diseases, immunotherapy"},
  "tips": [
    "Master the four types of hypersensitivity (Type I–IV) — they appear repeatedly in different question forms.",
    "Know your immunoglobulins: IgE for allergies, IgG for most immunity, IgA for mucosal surfaces, IgM for primary response.",
    "Memorize classic clinical presentations: anaphylaxis (Type I), contact dermatitis (Type IV), serum sickness (Type III).",
    "Distinguish innate vs. adaptive immunity — know which cells belong to each branch.",
    "Study complement pathways (classical, lectin, alternative) and what activates each.",
    "HOSA tests clinical application — practice 'a patient presents with X, which mechanism is responsible?'-style questions.",
  ]
},
"anatomy-physiology": {
  "title": "Anatomy & Physiology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Body systems, directional terms, organ functions, homeostasis, physiological processes"},
  "tips": [
    "Start with directional/anatomical terminology — these appear in many questions as modifiers.",
    "Learn organ functions at the system level first, then drill individual structures.",
    "Homeostasis questions are common: understand negative vs. positive feedback with real examples (thermoregulation, blood glucose).",
    "The nervous and endocrine systems are high-yield: know hormone sources, targets, and effects.",
    "For each body system, know: organs, function, major diseases/disorders, and key hormones or enzymes.",
    "Use body system diagrams — spatial recall helps with structural questions on the exam.",
  ]
},
"audiology": {
  "title": "Audiology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Hearing mechanisms, audiometric testing, hearing loss types, balance disorders, assistive devices"},
  "tips": [
    "Know the anatomy of the ear (outer, middle, inner) cold — many questions hinge on location of pathology.",
    "Distinguish conductive vs. sensorineural vs. mixed hearing loss and their causes.",
    "Understand audiogram interpretation: frequency on x-axis, intensity (dBHL) on y-axis.",
    "Weber and Rinne tests: know which ear lateralizes and what each result means for each loss type.",
    "Study vestibular disorders: BPPV, Meniere's disease, vestibular neuritis — causes and symptoms.",
    "Know assistive technology: hearing aids, cochlear implants, FM systems — candidacy criteria matter.",
  ]
},
"behavioral-health": {
  "title": "Behavioral Health",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Mental health disorders, DSM-5 criteria, treatment modalities, crisis intervention, substance use"},
  "tips": [
    "DSM-5 diagnostic criteria are heavily tested — focus on major depressive disorder, bipolar, schizophrenia, anxiety disorders.",
    "Know first-line treatments (therapy type + medication class) for each major disorder.",
    "Substance use disorder: understand tolerance, withdrawal, dependence; know which substances have dangerous withdrawal.",
    "Study crisis intervention steps and suicide risk assessment frameworks.",
    "Distinguish psychotic features, mood episodes, and personality disorders — overlap questions are common.",
    "Therapeutic modalities: CBT, DBT, motivational interviewing — know what condition each is best for.",
  ]
},
"biochemistry": {
  "title": "Biochemistry",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Macromolecule structure, metabolism, enzyme kinetics, cell signaling, molecular biology"},
  "tips": [
    "Master metabolic pathways in order: glycolysis → pyruvate dehydrogenase → TCA cycle → oxidative phosphorylation.",
    "Know net ATP yields and where each pathway occurs (cytoplasm vs. mitochondria).",
    "Enzyme kinetics: Km, Vmax, competitive vs. noncompetitive inhibition — be able to read Michaelis-Menten graphs.",
    "Macromolecule structure: peptide bonds, phosphodiester bonds, glycosidic bonds — know which links which monomer.",
    "Regulation points: know which enzymes are allosterically regulated and by what molecules.",
    "DNA replication, transcription, translation — know the enzymes involved at each step.",
  ]
},
"biomedical-lab-science": {
  "title": "Biomedical Laboratory Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Lab safety, specimen handling, hematology, urinalysis, microbiology lab, clinical chemistry"},
  "tips": [
    "Lab safety (OSHA, biohazard handling, PPE, spill protocols) is always tested — never skip it.",
    "Know normal reference ranges for CBC, BMP, lipid panel — questions often ask what an abnormal value indicates.",
    "Urinalysis: normal vs. abnormal findings, what each abnormality suggests clinically.",
    "Gram stain: gram positive (purple) vs. gram negative (pink), and example pathogens of each.",
    "Quality control in the lab: what systematic vs. random error looks like on a Levey-Jennings chart.",
    "Blood typing: ABO/Rh compatibility, universal donor (O-), universal recipient (AB+).",
  ]
},
"biotechnology": {
  "title": "Biotechnology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "PCR, gel electrophoresis, CRISPR, recombinant DNA, bioinformatics, ethical issues"},
  "tips": [
    "PCR steps (denaturation, annealing, extension) and what each temperature accomplishes — tested every year.",
    "Gel electrophoresis: smaller fragments travel farther, DNA moves toward positive electrode.",
    "CRISPR-Cas9: know guide RNA, Cas9 function, and how cuts are made vs. repaired.",
    "Recombinant DNA: restriction enzymes, sticky ends, ligation, transformation — know the sequence of steps.",
    "Bioinformatics tools: BLAST, GenBank — what they're used for.",
    "Ethical questions (GMOs, gene editing, patents) appear — know multiple perspectives, not just scientific facts.",
  ]
},
"cardiovascular-science": {
  "title": "Cardiovascular Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Cardiac anatomy, conduction system, ECG interpretation, heart diseases, pharmacology"},
  "tips": [
    "Master the conduction pathway: SA node → AV node → Bundle of His → Purkinje fibers — and what each controls.",
    "ECG waves: P (atrial depolarization), QRS (ventricular depolarization), T (ventricular repolarization).",
    "Know the major cardiac conditions: MI, heart failure (systolic vs. diastolic), arrhythmias, valve disorders.",
    "Starling's Law and Frank-Starling relationship — preload, afterload, contractility questions appear often.",
    "Pharmacology: beta blockers, ACE inhibitors, statins, anticoagulants — know drug class mechanisms.",
    "Coronary artery anatomy: LAD, RCA, circumflex — which territory each supplies and what MI looks like.",
  ]
},
"clinical-nursing": {
  "title": "Clinical Nursing",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Nursing process, vital signs, medication administration, wound care, patient safety, documentation"},
  "tips": [
    "The nursing process (ADPIE) frames many questions — practice identifying which step a scenario describes.",
    "Vital sign normal ranges by age group are essential: pediatric values differ significantly from adult.",
    "Medication administration: rights of medication administration (right patient, drug, dose, route, time).",
    "Know wound care stages and appropriate dressings — pressure ulcer staging is frequently tested.",
    "Patient safety: fall prevention, restraint protocols, infection control (standard + transmission-based precautions).",
    "Documentation and legal aspects: confidentiality, informed consent, advance directives.",
  ]
},
"dental-science": {
  "title": "Dental Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Tooth anatomy, dental procedures, oral diseases, radiography, infection control, dental materials"},
  "tips": [
    "Tooth numbering systems (Universal, Palmer, FDI) — know at least Universal system cold.",
    "Tooth anatomy layers: enamel, dentin, cementum, pulp — and what each does.",
    "Common oral conditions: caries progression, periodontal disease stages, oral cancer warning signs.",
    "Dental radiography: types (periapical, bitewing, panoramic), what each reveals, radiation safety.",
    "Infection control in dentistry: sterilization vs. disinfection, PPE requirements, sharps handling.",
    "Dental materials: composite vs. amalgam, GIC, impression materials — properties and uses.",
  ]
},
"dermatology": {
  "title": "Dermatology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Skin anatomy, skin lesion types, common dermatoses, wound healing, skin cancer"},
  "tips": [
    "Skin lesion terminology is non-negotiable: macule, papule, plaque, vesicle, pustule, bulla, wheal — know all.",
    "Skin layers (epidermis layers → dermis → hypodermis) and cell types (keratinocytes, melanocytes, Langerhans).",
    "Skin cancer: ABCDE criteria for melanoma, differences between BCC, SCC, and melanoma.",
    "Common conditions: acne pathogenesis, eczema vs. psoriasis (key distinguishing features), rosacea.",
    "Wound healing phases: hemostasis, inflammation, proliferation, remodeling — what happens in each.",
    "Sun protection: SPF meaning, UVA vs. UVB damage, photoaging vs. carcinogenesis.",
  ]
},
"emergency-medical-science": {
  "title": "Emergency Medical Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "EMS systems, patient assessment, trauma, medical emergencies, airway management, pharmacology"},
  "tips": [
    "Primary assessment (ABCDE) must be automatic — every scenario question flows from this framework.",
    "Trauma: know Glasgow Coma Scale scoring, hemorrhagic shock classes, and spinal immobilization criteria.",
    "Airway management: BVM technique, supraglottic airways, when to intubate, cricothyrotomy indications.",
    "Medical emergencies: ACS presentation, stroke (BE-FAST), diabetic emergencies (hypo vs. hyperglycemia).",
    "EMS pharmacology: epinephrine, naloxone, aspirin, nitroglycerin — doses, routes, contraindications.",
    "Triage systems (START, SALT) — know color categories and the criteria for each.",
  ]
},
"endocrinology": {
  "title": "Endocrinology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Hormone physiology, diabetes, thyroid disorders, adrenal disorders, pituitary axis"},
  "tips": [
    "The hypothalamic-pituitary axis is the foundation — know every releasing hormone and what it controls.",
    "Diabetes: Type 1 vs. Type 2 mechanisms, diagnostic criteria (fasting glucose, HbA1c, OGTT), complications.",
    "Thyroid: hypothyroidism vs. hyperthyroidism signs/symptoms, TSH interpretation, thyroid storm vs. myxedema coma.",
    "Adrenal: Cushing's (cortisol excess) vs. Addison's (cortisol deficiency) — clinical features and causes.",
    "Feedback loops: negative feedback for most axes, positive feedback for LH surge — draw them out.",
    "Know hormone types (peptide vs. steroid) and how they signal (cell surface vs. nuclear receptors).",
  ]
},
"epidemiology": {
  "title": "Epidemiology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Study designs, measures of disease, outbreak investigation, screening, public health surveillance"},
  "tips": [
    "Study designs hierarchy: RCT > cohort > case-control > cross-sectional > case report — know strengths/limits of each.",
    "Calculate and interpret: incidence, prevalence, relative risk, odds ratio, attributable risk.",
    "Sensitivity vs. specificity: sensitivity rules OUT disease, specificity rules IN — use the mnemonic SnNout/SpPin.",
    "Outbreak investigation steps: confirm diagnosis → identify cases → characterize by person/place/time → hypothesis.",
    "Herd immunity threshold formula: 1 - 1/R₀ — know what R₀ means and how it affects vaccination targets.",
    "Bias types: selection, information/measurement, confounding — know how each distorts study results.",
  ]
},
"forensic-science": {
  "title": "Forensic Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Crime scene investigation, evidence types, forensic pathology, DNA analysis, toxicology, legal framework"},
  "tips": [
    "Chain of custody is foundational — know why it matters and what breaks it.",
    "Evidence types: class vs. individual evidence, and examples of each.",
    "Forensic pathology: manner of death (natural/accident/homicide/suicide/undetermined) vs. cause of death.",
    "Postmortem changes: livor mortis, rigor mortis, algor mortis — timing and what factors affect them.",
    "DNA profiling: STR analysis, CODIS, what a DNA profile can and cannot prove.",
    "Toxicology: how drugs are detected, half-life concept, postmortem redistribution.",
  ]
},
"gastroenterology": {
  "title": "Gastroenterology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "GI anatomy, digestion, liver function, GI disorders, endoscopy, nutrition"},
  "tips": [
    "GI tract order and function at each segment — from mouth to rectum, know what each does.",
    "Liver functions: bile production, metabolism, detoxification, protein synthesis (albumin, clotting factors).",
    "Common GI conditions: GERD, peptic ulcer disease (H. pylori connection), IBD (Crohn's vs. UC differences).",
    "Liver diseases: hepatitis types (A–E transmission routes), cirrhosis complications, NAFLD.",
    "Digestion enzymes: where produced, what substrate each acts on, pH optima.",
    "Liver function tests (ALT, AST, bilirubin, albumin) — what each measures and what elevation means.",
  ]
},
"genetics": {
  "title": "Genetics",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Mendelian inheritance, chromosomal disorders, molecular genetics, genetic testing, ethical issues"},
  "tips": [
    "Inheritance patterns: autosomal dominant/recessive, X-linked — be able to determine from a pedigree.",
    "Practice Punnett squares for dihybrid crosses and sex-linked traits.",
    "Chromosomal disorders: Down (trisomy 21), Turner (45,X), Klinefelter (47,XXY) — features and mechanisms.",
    "Molecular: DNA replication fidelity, mutations (missense, nonsense, frameshift) and consequences.",
    "Genetic testing types: karyotype, FISH, microarray, sequencing — what each detects.",
    "Pharmacogenomics and ethical considerations (genetic privacy, testing in minors) appear on the exam.",
  ]
},
"geriatrics": {
  "title": "Geriatrics",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Aging physiology, geriatric syndromes, polypharmacy, dementia, end-of-life care, falls"},
  "tips": [
    "Normal aging changes vs. disease — know what's expected (decreased GFR, reduced lung elasticity) vs. pathological.",
    "Geriatric syndromes: falls, delirium, frailty, urinary incontinence — causes and management.",
    "Dementia types: Alzheimer's (most common), vascular, Lewy body, frontotemporal — distinguishing features.",
    "Delirium vs. dementia: onset (acute vs. gradual), attention, reversibility.",
    "Polypharmacy: Beers Criteria drugs to avoid in elderly, anticholinergic burden, drug-drug interactions.",
    "End-of-life: palliative vs. hospice care differences, advance directives, goals-of-care conversations.",
  ]
},
"global-health": {
  "title": "Global Health",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Global disease burden, health disparities, international organizations, social determinants, infectious disease"},
  "tips": [
    "Know WHO, UNICEF, CDC, Médecins Sans Frontières — roles, mandates, and key programs.",
    "Leading causes of death globally (ischemic heart disease, stroke, COPD) vs. in low-income countries.",
    "Social determinants of health: income, education, housing, food security — how each affects outcomes.",
    "Neglected tropical diseases (NTDs): malaria, tuberculosis, HIV — transmission, burden, prevention.",
    "Global health metrics: DALYs, QALYs, under-5 mortality rate — definitions and how to interpret them.",
    "Health equity vs. equality distinction — HOSA questions often test conceptual understanding here.",
  ]
},
"health-informatics": {
  "title": "Health Informatics",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "EHR systems, health data standards, interoperability, HIPAA, clinical decision support, telehealth"},
  "tips": [
    "HIPAA: Privacy Rule vs. Security Rule, PHI definition, permitted disclosures — this section is always tested.",
    "EHR vs. EMR difference: EHR is shared across providers, EMR is single-practice.",
    "Health data standards: HL7, FHIR, ICD-10, CPT, SNOMED — know what each is used for.",
    "Interoperability: what it means and why it's a challenge in healthcare IT.",
    "Clinical decision support systems (CDSS): alerts, order sets, reminders — benefits and alert fatigue risk.",
    "Telehealth: types (synchronous vs. asynchronous), reimbursement challenges, HIPAA compliance for virtual visits.",
  ]
},
"healthcare-systems": {
  "title": "Healthcare Systems",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "US healthcare structure, insurance, quality measures, health policy, healthcare workforce, ethics"},
  "tips": [
    "Insurance types: Medicare (65+/disability), Medicaid (low income), CHIP, private — eligibility and coverage.",
    "Healthcare delivery models: ACO, HMO, PPO, fee-for-service vs. value-based care.",
    "Quality frameworks: Donabedian model (structure-process-outcome), IHI Triple Aim.",
    "Key legislation: ACA provisions, EMTALA, HIPAA, Hill-Burton Act — what each requires.",
    "Healthcare disparities: racial, socioeconomic, rural — causes and policy approaches.",
    "Healthcare workforce shortage areas, scope of practice laws, and interprofessional collaboration.",
  ]
},
"hematology": {
  "title": "Hematology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Blood cell types, CBC interpretation, anemia types, coagulation, blood disorders, transfusion"},
  "tips": [
    "CBC components: RBC, WBC (differential), platelets, hemoglobin, hematocrit — normal ranges and what each indicates.",
    "Anemia classification: microcytic (iron deficiency, thalassemia), normocytic (aplastic, hemolytic), macrocytic (B12/folate).",
    "Coagulation cascade: intrinsic (PTT) vs. extrinsic (PT/INR) pathways — what each test measures.",
    "Blood cell production: hematopoiesis from stem cells, where each cell line differentiates.",
    "Common disorders: sickle cell disease mechanism, leukemia types (ALL, AML, CLL, CML) key differences.",
    "Transfusion reactions: types (hemolytic, febrile, allergic), recognition, and immediate management.",
  ]
},
"human-growth-development": {
  "title": "Human Growth & Development",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Developmental milestones, developmental theories, adolescence, aging, developmental disorders"},
  "tips": [
    "Piaget's stages (sensorimotor, preoperational, concrete operational, formal operational) — ages and key abilities.",
    "Erikson's 8 psychosocial stages — the conflict at each stage and the virtue if resolved successfully.",
    "Motor milestones: head control (3 mo), sitting (6 mo), walking (12 mo) — red flags for delays.",
    "Language milestones: cooing (2 mo), babbling (6 mo), first word (12 mo), 2-word phrases (24 mo).",
    "Adolescent development: Tanner stages, identity formation (Erikson's Stage 5), risk-taking behavior.",
    "Theories of aging: wear-and-tear, free radical, telomere shortening — know the evidence for each.",
  ]
},
"immunology": {
  "title": "Immunology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Innate and adaptive immunity, lymphocytes, antibodies, vaccines, immunodeficiency, autoimmunity"},
  "tips": [
    "Cell types: neutrophils (first responders), macrophages (phagocytosis + APC), dendritic cells (APC), NK cells.",
    "T cell types: CD4+ helper (Th1, Th2, Treg, Th17), CD8+ cytotoxic — what each does.",
    "B cell activation and antibody class switching: IgM → IgG (most common), IgA (mucosal), IgE (allergy).",
    "MHC I (all nucleated cells, presents to CD8) vs. MHC II (APCs, presents to CD4) — crucial distinction.",
    "Vaccine types: live-attenuated, inactivated, subunit, mRNA — mechanism and who can't receive each.",
    "Primary vs. secondary immune response: timing, antibody class, magnitude — graph interpretation questions are common.",
  ]
},
"infectious-disease": {
  "title": "Infectious Disease",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Microbiology basics, bacterial/viral/fungal/parasitic diseases, antimicrobials, infection control"},
  "tips": [
    "Pathogen types and their key differences: bacteria (prokaryote), viruses (obligate intracellular), fungi, parasites.",
    "High-yield bacteria: S. aureus (MRSA), S. pneumoniae, E. coli, M. tuberculosis, C. difficile — diseases caused.",
    "Antibiotic classes: penicillins, cephalosporins, fluoroquinolones, macrolides — mechanism and coverage.",
    "Antibiotic resistance mechanisms: beta-lactamase, efflux pumps, altered target — and which organisms use each.",
    "Transmission-based precautions: contact, droplet, airborne — examples of diseases for each.",
    "Key viral diseases: HIV (CD4 count staging), influenza (strain naming, vaccines), hepatitis (transmission routes).",
  ]
},
"medical-assisting": {
  "title": "Medical Assisting",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Clinical procedures, administrative tasks, pharmacology, patient communication, medical law"},
  "tips": [
    "Vital signs technique and normal values — errors in measurement technique appear as scenario questions.",
    "Injection routes: subcutaneous, intramuscular, intradermal — sites, needle angle, and what each is used for.",
    "Medical terminology: prefixes, suffixes, root words — this is essential for reading every other question.",
    "Administrative: ICD-10 coding basics, CPT codes, SOAP note format, scheduling types.",
    "Medical law: scope of practice for MAs, consent types, HIPAA in the office setting.",
    "EKG: electrode placement, normal sinus rhythm identification, patient preparation steps.",
  ]
},
"medical-law-ethics": {
  "title": "Medical Law & Ethics",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Bioethical principles, informed consent, patient rights, legal liability, end-of-life, research ethics"},
  "tips": [
    "Four bioethical principles: autonomy, beneficence, non-maleficence, justice — apply each to scenarios.",
    "Informed consent elements: disclosure, comprehension, voluntariness, competence, decision — know all five.",
    "HIPAA: who is covered, what is PHI, when disclosure is permitted without consent.",
    "Types of legal liability: malpractice elements (duty, breach, causation, damages), assault vs. battery in medical context.",
    "End-of-life ethics: living wills, healthcare proxies, DNR orders, futility, euthanasia vs. palliative sedation.",
    "Research ethics: Belmont Report principles (respect for persons, beneficence, justice), IRB role.",
  ]
},
"medical-math": {
  "title": "Medical Math",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice/Calculation", "topics": "Dosage calculations, unit conversions, IV flow rates, statistical measures, body measurements"},
  "tips": [
    "Dimensional analysis (factor-label method) is the most reliable approach for dosage calculations — practice it.",
    "Memorize key conversions: 1 kg = 2.2 lb, 1 inch = 2.54 cm, 1 tsp = 5 mL, 1 oz = 30 mL.",
    "IV flow rate formula: (volume × drop factor) ÷ time = drops/min — know standard drop factors (10, 15, 60).",
    "Pediatric dosing: weight-based (mg/kg) calculations are high-yield.",
    "Statistics: mean, median, mode, standard deviation — be able to calculate from a small data set.",
    "BMI formula: weight(kg) ÷ height(m)² — know BMI categories (underweight <18.5, normal 18.5-24.9, overweight 25-29.9, obese ≥30).",
  ]
},
"medical-microbiology": {
  "title": "Medical Microbiology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Bacteriology, virology, mycology, parasitology, lab techniques, sterilization"},
  "tips": [
    "Gram stain results and what they tell you — plus which organisms are gram-variable or don't stain.",
    "Bacterial growth curve: lag, log, stationary, death phases — antibiotics work best in which phase?",
    "Culture media types: blood agar, MacConkey, chocolate agar — selective vs. differential, what grows on each.",
    "Virulence factors: capsules, toxins, adhesins, biofilms — how each helps pathogens evade defenses.",
    "Fungal infections: candidiasis, aspergillosis, cryptococcosis — who gets them (immunocompromised focus).",
    "Sterilization vs. disinfection vs. antisepsis — methods (autoclave, UV, chemical) and what level each achieves.",
  ]
},
"medical-terminology": {
  "title": "Medical Terminology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Prefixes, suffixes, word roots, body system terms, abbreviations, pluralization"},
  "tips": [
    "Learn roots by body system clusters — cardio-, hepat-, nephro-, neur-, derm- etc. all at once.",
    "High-yield suffixes: -itis (inflammation), -ectomy (removal), -plasty (repair), -oscopy (visual exam), -ology (study).",
    "Common prefixes: brady- (slow), tachy- (fast), hyper-, hypo-, peri-, endo-, epi-, sub-.",
    "Practice combining forms — the exam gives you a term you haven't seen and expects you to decode it.",
    "Medical abbreviations: BID, QID, PRN, NPO, SOB, DOE — know clinical context for each.",
    "Pluralization rules: -us → -i, -is → -es, -um → -a, -a → -ae — irregular plurals appear on exams.",
  ]
},
"neonatology": {
  "title": "Neonatology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Normal newborn physiology, Apgar scoring, prematurity, neonatal disorders, resuscitation"},
  "tips": [
    "Apgar score: 5 components (Appearance, Pulse, Grimace, Activity, Respiration), score at 1 and 5 minutes.",
    "Normal newborn transitions: circulatory changes at birth (foramen ovale, ductus arteriosus closure).",
    "Prematurity complications: RDS (surfactant deficiency), IVH, NEC, retinopathy of prematurity.",
    "Neonatal jaundice: physiologic vs. pathologic, bilirubin mechanism, phototherapy indication.",
    "Neonatal resuscitation: warm-dry-stimulate → assess breathing → PPV → chest compressions.",
    "Common congenital conditions: CDH, TEF, omphalocele vs. gastroschisis — presentation and urgency.",
  ]
},
"nephrology": {
  "title": "Nephrology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Kidney anatomy, nephron function, fluid/electrolytes, renal diseases, dialysis, pharmacology"},
  "tips": [
    "Nephron segments and what each does: PCT (bulk reabsorption), loop of Henle (concentration), DCT and CD (fine-tuning).",
    "GFR: what it measures, CKD staging (GFR <60 for >3 months), how creatinine relates to it.",
    "Electrolyte disorders: hyponatremia, hyperkalemia — causes, symptoms, and acute treatment.",
    "Acid-base: metabolic vs. respiratory acidosis/alkalosis — use HCO3 and pCO2 to distinguish.",
    "Renal failure: prerenal (BUN:Cr >20:1), intrinsic, postrenal — causes and distinguishing labs.",
    "Dialysis: hemodialysis vs. peritoneal dialysis — indications, principles, and complications.",
  ]
},
"neurology": {
  "title": "Neurology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Neuroanatomy, stroke, seizures, dementia, headache, neuromuscular disorders, pharmacology"},
  "tips": [
    "Brain lobes and their functions: frontal (executive), parietal (sensory), temporal (memory/language), occipital (vision).",
    "Stroke: ischemic vs. hemorrhagic, tPA eligibility window (4.5 hours), NIHSS components.",
    "Seizure types: focal vs. generalized — tonic-clonic, absence, myoclonic — treatment by type.",
    "Cranial nerves I–XII: name, number, function (sensory/motor/both) — know all 12.",
    "Headache types: migraine (with/without aura), cluster, tension — distinguishing features and treatment.",
    "Common drugs: levodopa (Parkinson's), valproate (seizures), sumatriptan (migraine) — mechanisms.",
  ]
},
"nursing-assisting": {
  "title": "Nursing Assisting",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "CNA scope of practice, ADLs, patient safety, vital signs, infection control, long-term care"},
  "tips": [
    "CNA scope of practice vs. licensed nurse — know what CNAs can and cannot do in each state context.",
    "ADL assistance: bathing, dressing, grooming, toileting, feeding — proper technique and patient dignity.",
    "Vital signs: technique, normal ranges, when to report abnormal findings immediately.",
    "Infection control: hand hygiene (5 moments), standard precautions, PPE donning/doffing order.",
    "Patient safety: fall risk assessment, restraint alternatives, safe patient handling and mobility.",
    "Residents' rights in long-term care (Omnibus Budget Reconciliation Act): privacy, dignity, grievances.",
  ]
},
"nutrition": {
  "title": "Nutrition",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Macronutrients, micronutrients, dietary guidelines, malnutrition, clinical nutrition, metabolism"},
  "tips": [
    "Macronutrient calorie density: carbohydrates 4 kcal/g, protein 4 kcal/g, fat 9 kcal/g — memorize these.",
    "Essential vitamins: fat-soluble (A, D, E, K) vs. water-soluble (B-complex, C) and what each does.",
    "Deficiency diseases: scurvy (C), rickets (D), pellagra (B3), beriberi (B1), pernicious anemia (B12).",
    "Dietary guidelines: MyPlate, recommended daily intakes, acceptable macronutrient distribution ranges.",
    "Malnutrition types: marasmus (calorie deficiency) vs. kwashiorkor (protein deficiency) — clinical features.",
    "Enteral vs. parenteral nutrition: indications, types, and complications.",
  ]
},
"obstetrics-gynecology": {
  "title": "Obstetrics & Gynecology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Reproductive anatomy, menstrual cycle, pregnancy, labor, postpartum, gynecologic disorders"},
  "tips": [
    "Menstrual cycle phases: follicular (days 1-13), ovulation (day 14), luteal (days 15-28) — hormones driving each.",
    "Pregnancy dating: Naegele's rule (LMP + 9 months + 7 days), trimesters and what happens in each.",
    "Pregnancy complications: preeclampsia (HTN + proteinuria), gestational diabetes, placenta previa vs. abruption.",
    "Labor stages: first (dilation), second (delivery), third (placenta) — normal duration for each.",
    "Postpartum complications: hemorrhage (most common cause: uterine atony), endometritis, DVT.",
    "Gynecologic cancer screening: Pap smear guidelines, HPV vaccination, BRCA testing indications.",
  ]
},
"occupational-therapy": {
  "title": "Occupational Therapy",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "OT frameworks, occupational performance areas, assessment tools, conditions treated, adaptive equipment"},
  "tips": [
    "OTPF (Occupational Therapy Practice Framework): occupations, client factors, performance skills, contexts — know these.",
    "Areas of occupation: ADLs, IADLs, rest/sleep, education, work, play, leisure, social participation.",
    "OT assessment tools: COPM (Canadian Occupational Performance Measure), FIM, Barthel Index.",
    "Common conditions: stroke (compensatory vs. remediation approaches), TBI, autism spectrum, hand injuries.",
    "Adaptive equipment: button hooks, reachers, weighted utensils — which condition each device helps.",
    "OT vs. PT distinction: OT focuses on function/daily tasks; PT focuses on movement/strength.",
  ]
},
"oncology": {
  "title": "Oncology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Cancer biology, staging, treatment modalities, common cancers, side effects, palliative care"},
  "tips": [
    "Cell cycle and how cancer disrupts it: proto-oncogenes vs. tumor suppressor genes, key checkpoints.",
    "TNM staging: T (tumor size/extent), N (lymph nodes), M (metastasis) — Stage I–IV interpretation.",
    "Treatment modalities: surgery, radiation, chemotherapy, immunotherapy, targeted therapy — mechanism of each.",
    "Common cancers: lung (leading cause of cancer death), breast, colorectal, prostate — screening guidelines.",
    "Chemotherapy side effects: myelosuppression (neutropenia risk, ANC nadir), nausea, alopecia, mucositis.",
    "Tumor markers: PSA (prostate), CA-125 (ovarian), CEA (colorectal), AFP (liver/testicular).",
  ]
},
"optometry": {
  "title": "Optometry",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Eye anatomy, refractive errors, eye diseases, visual testing, optics, systemic conditions affecting eyes"},
  "tips": [
    "Eye anatomy: cornea → aqueous → lens → vitreous → retina (rods and cones) → optic nerve.",
    "Refractive errors: myopia (near-sighted, too long), hyperopia (far-sighted, too short), astigmatism (irregular cornea).",
    "Glaucoma: open-angle vs. closed-angle — mechanism, IOP, optic nerve cupping, treatment.",
    "Cataracts, macular degeneration, diabetic retinopathy — risk factors and distinguishing features.",
    "Visual acuity testing: Snellen chart (20/20 standard), what 20/40 means clinically.",
    "Systemic diseases with ocular manifestations: diabetes, hypertension, multiple sclerosis — what to look for.",
  ]
},
"otolaryngology": {
  "title": "Otolaryngology (ENT)",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Ear/nose/throat anatomy, hearing loss, sinusitis, throat disorders, head/neck cancers, airway"},
  "tips": [
    "Anatomy of ear, nose, and throat — structures and their functions are tested heavily.",
    "Hearing loss types again (conductive vs. sensorineural) with ENT-specific causes (otosclerosis, cholesteatoma).",
    "Sinusitis: acute vs. chronic, bacterial vs. viral, treatment differences.",
    "Tonsils and adenoids: indications for tonsillectomy, complications (post-tonsillectomy bleed is an emergency).",
    "Head and neck cancer: risk factors (tobacco, alcohol, HPV), common sites, staging.",
    "Airway emergencies: croup vs. epiglottitis — which is more dangerous, how to differentiate, management.",
  ]
},
"pain-management": {
  "title": "Pain Management",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Pain physiology, assessment, pharmacology, interventional techniques, chronic pain, opioid safety"},
  "tips": [
    "Pain types: nociceptive (somatic + visceral) vs. neuropathic — characteristics and treatment approach for each.",
    "WHO pain ladder: non-opioid → weak opioid → strong opioid — know which analgesics at each step.",
    "Pain assessment tools: NRS (0-10), VAS, Wong-Baker FACES (pediatric), CPOT (non-verbal) — indications for each.",
    "Opioid pharmacology: mechanism (mu receptor), tolerance vs. dependence vs. addiction.",
    "Opioid safety: respiratory depression risk, naloxone reversal, equianalgesic dosing conversions.",
    "Non-pharmacological approaches: physical therapy, CBT, nerve blocks, TENS — evidence base for each.",
  ]
},
"pathophysiology": {
  "title": "Pathophysiology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Disease mechanisms, cellular injury, inflammation, neoplasia, organ system pathology"},
  "tips": [
    "Cellular injury: reversible vs. irreversible changes, apoptosis vs. necrosis — what distinguishes them.",
    "Inflammation: acute vs. chronic, cellular mediators, classic signs (rubor, calor, tumor, dolor, functio laesa).",
    "Shock types: hypovolemic, cardiogenic, distributive (septic, anaphylactic), obstructive — mechanisms.",
    "High-yield pathology per organ: MI (coagulative necrosis), stroke, cirrhosis, CKD progression.",
    "Neoplasia: benign vs. malignant features, invasion, metastasis routes.",
    "Genetics of disease: autosomal dominant (gain of function) vs. recessive (loss of function) in pathology context.",
  ]
},
"pediatrics": {
  "title": "Pediatrics",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Development, immunizations, pediatric illness, growth parameters, child safety, adolescent health"},
  "tips": [
    "Growth charts: plot and interpret weight, height, head circumference — know what <3rd or >97th percentile means.",
    "Immunization schedule: key vaccines and ages — DTaP, MMR, IPV, Varicella, Hep B timing.",
    "Common childhood illnesses: otitis media, RSV bronchiolitis, croup (stridor), kawasaki disease criteria.",
    "Fever in infants: <28 days → full sepsis workup, 28–90 days → risk-based approach.",
    "Child maltreatment: physical abuse patterns (spiral fractures, bruising in non-ambulatory), mandatory reporting.",
    "Adolescent health: confidentiality laws (STIs, contraception, mental health), HEADSS assessment.",
  ]
},
"pharmacology": {
  "title": "Pharmacology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Pharmacokinetics, pharmacodynamics, drug classes, adverse effects, drug interactions"},
  "tips": [
    "Pharmacokinetics ADME: Absorption, Distribution, Metabolism (liver CYP450), Excretion (kidney) — for every drug class.",
    "Pharmacodynamics: agonist vs. antagonist, partial agonist, inverse agonist — ED50, LD50, therapeutic index.",
    "High-yield drug classes: beta-blockers, ACE inhibitors, statins, anticoagulants, antibiotics — mechanism and key adverse effects.",
    "Drug interactions: CYP450 inhibitors (slow metabolism → toxicity) vs. inducers (speed metabolism → therapeutic failure).",
    "Autonomic pharmacology: sympathomimetics vs. parasympathomimetics, alpha/beta receptor effects.",
    "Narrow therapeutic index drugs (digoxin, warfarin, lithium, phenytoin) — monitoring and toxicity signs.",
  ]
},
"pharmacy-science": {
  "title": "Pharmacy Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Pharmaceutical calculations, drug compounding, drug delivery systems, drug regulation, pharmacokinetics"},
  "tips": [
    "Pharmaceutical calculations: percent solutions, dilutions, alligation method — practice all three types.",
    "Drug delivery routes and their pharmacokinetic implications: oral (first pass), IV (100% bioavailability), transdermal.",
    "Compounding: sterile vs. non-sterile, beyond-use dates, USP <795> and <797> standards.",
    "Drug regulation: FDA drug approval process (phases I-IV trials), controlled substance schedules (I–V).",
    "Drug storage requirements: temperature-sensitive medications, light-sensitive storage, proper disposal.",
    "OTC vs. prescription distinction and behind-the-counter medications (pseudoephedrine regulations).",
  ]
},
"phlebotomy": {
  "title": "Phlebotomy",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Venipuncture technique, tube order, specimen handling, lab tests, patient identification, complications"},
  "tips": [
    "Tube order of draw: blood cultures → yellow → light blue → red → SST (gold) → green → lavender → gray.",
    "Additives by tube color: EDTA (lavender/pink), citrate (light blue), heparin (green), fluoride (gray).",
    "Venipuncture site selection: median cubital vein preferred, contraindications (mastectomy side, lymphedema, AV fistula).",
    "Complications: hematoma, petechiae, nerve injury, syncope — recognition and immediate response.",
    "Specimen rejection criteria: hemolysis, lipemia, wrong tube, insufficient volume, mislabeling.",
    "Patient ID: two identifiers required (name + DOB or MRN), confirm verbally — never skip this step.",
  ]
},
"physical-medicine-rehabilitation": {
  "title": "Physical Medicine & Rehabilitation",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Rehabilitation principles, spinal cord injury, stroke rehab, prosthetics, pain management, adaptive equipment"},
  "tips": [
    "Spinal cord injury levels: cervical (C3-5 diaphragm, C5-6 arm), thoracic (trunk), lumbar (legs) — function at each.",
    "ASIA Impairment Scale: A (complete) through E (normal) — definitions and clinical implication.",
    "Stroke rehabilitation: plasticity principles, constraint-induced movement therapy, AFO indication.",
    "Prosthetics and orthotics: K-levels for lower limb prosthetics (K0 non-ambulatory → K4 high activity).",
    "Electrodiagnosis: EMG and nerve conduction studies — what each measures and what findings indicate.",
    "Functional Independence Measure (FIM): 7-level scale, what each level means, 18 items total.",
  ]
},
"physical-therapy": {
  "title": "Physical Therapy",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "PT examination, therapeutic exercise, modalities, musculoskeletal conditions, neurological PT, documentation"},
  "tips": [
    "PT examination process: history → systems review → tests and measures → evaluation → diagnosis → prognosis → plan of care.",
    "Gait analysis: normal gait cycle phases (stance 60%, swing 40%), common deviations and their causes.",
    "Manual muscle testing: 0–5 scale, what each grade means (grade 3 = against gravity, no resistance).",
    "Therapeutic modalities: ultrasound (deep heat), TENS (pain), cryotherapy vs. thermotherapy — indications/contraindications.",
    "Common conditions: rotator cuff tears, ACL injury, low back pain — evidence-based treatment approaches.",
    "Special tests: Lachman (ACL), McMurray (meniscus), empty can (supraspinatus) — positive finding and what it indicates.",
  ]
},
"psychiatry": {
  "title": "Psychiatry",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Psychiatric disorders, DSM-5, psychopharmacology, psychotherapy, involuntary commitment, mental status exam"},
  "tips": [
    "Mental Status Exam (MSE): appearance, behavior, speech, mood/affect, thought process/content, cognition, insight — components.",
    "Major psychiatric disorders: schizophrenia (positive vs. negative symptoms), bipolar (I vs. II difference), MDD criteria.",
    "Psychopharmacology: SSRIs (first-line depression/anxiety), atypical antipsychotics (risperidone, olanzapine — metabolic side effects).",
    "Mood stabilizers: lithium (levels + toxicity signs), valproate, lamotrigine — indications and monitoring.",
    "Psychotherapy types: CBT, DBT (borderline PD), motivational interviewing — best-matched condition for each.",
    "Involuntary commitment criteria: danger to self, danger to others, grave disability — varies by state but principles are consistent.",
  ]
},
"public-health": {
  "title": "Public Health",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Health promotion, disease prevention, epidemiology basics, environmental health, community health, policy"},
  "tips": [
    "Three levels of prevention: primary (prevent disease), secondary (early detection), tertiary (manage existing disease) — examples of each.",
    "Social-ecological model: individual → interpersonal → community → societal levels — how each influences health.",
    "Health Belief Model components: perceived susceptibility, severity, benefits, barriers, self-efficacy, cues to action.",
    "Environmental health: air quality (PM2.5, ozone), water quality, lead exposure — health effects.",
    "Reportable diseases: why mandated, who reports to whom (provider → local health dept → state → CDC).",
    "Community health assessment: needs assessment, MAPP model, Healthy People 2030 framework.",
  ]
},
"radiologic-science": {
  "title": "Radiologic Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Radiation physics, imaging modalities, radiographic positioning, radiation safety, contrast agents, pathology recognition"},
  "tips": [
    "Radiation types: alpha, beta, gamma, X-ray — penetrating ability, ionization potential, and shielding for each.",
    "Imaging modalities: X-ray (bone/chest), CT (detail/trauma), MRI (soft tissue), ultrasound (no radiation), nuclear medicine.",
    "ALARA principle: As Low As Reasonably Achievable — the foundation of radiation protection.",
    "Distance, time, shielding: the three pillars of radiation protection — how each reduces dose.",
    "Radiographic positioning: AP vs. PA, lateral, oblique — how patient position affects what you see.",
    "Contrast agents: iodinated (CT), gadolinium (MRI) — contraindications (renal failure, allergy).",
  ]
},
"respiratory-therapy": {
  "title": "Respiratory Therapy",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Pulmonary anatomy, ABG interpretation, ventilator management, respiratory diseases, oxygen therapy"},
  "tips": [
    "ABG interpretation: pH (7.35-7.45), PaCO2 (35-45), HCO3 (22-26) — systematic approach: acidosis/alkalosis → respiratory or metabolic → compensation.",
    "Lung volumes: tidal volume, IRV, ERV, RV, and the capacities — FRC = ERV + RV, TLC = everything.",
    "Obstructive vs. restrictive pattern on PFTs: obstructive (reduced FEV1/FVC), restrictive (reduced TLC).",
    "Oxygen delivery devices: nasal cannula (1-6 L → 24-44% FiO2), simple mask, NRB mask, Venturi mask — FiO2 ranges.",
    "Mechanical ventilation modes: AC, SIMV, PSV — how each supports the patient, when to use.",
    "Common diseases: COPD (barrel chest, pursed-lip breathing), asthma, pneumonia, pulmonary embolism.",
  ]
},
"rheumatology": {
  "title": "Rheumatology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Autoimmune diseases, joint disorders, connective tissue diseases, rheumatologic labs, pharmacology"},
  "tips": [
    "Rheumatoid arthritis vs. osteoarthritis: RA (symmetric, small joints, morning stiffness >1hr, RF/anti-CCP), OA (asymmetric, weight-bearing, Heberden's nodes).",
    "Systemic lupus: butterfly rash, ANA (sensitive), anti-dsDNA (specific), SLEDAI scoring.",
    "Crystal arthropathies: gout (urate crystals, podagra, allopurinol) vs. pseudogout (CPPD, knee joint).",
    "Seronegative spondyloarthropathies: ankylosing spondylitis, psoriatic arthritis, reactive arthritis — HLA-B27 link.",
    "Rheumatologic labs: ANA, RF, anti-CCP, ESR, CRP, complement levels — what each indicates.",
    "DMARDs: methotrexate (RA first-line), hydroxychloroquine (lupus), biologics (TNF inhibitors) — monitoring requirements.",
  ]
},
"sleep-medicine": {
  "title": "Sleep Medicine",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Sleep physiology, sleep disorders, polysomnography, treatment, circadian rhythms, pharmacology"},
  "tips": [
    "Sleep architecture: NREM stages (N1, N2, N3/slow-wave) and REM — what happens physiologically in each.",
    "Sleep disorders: OSA (apnea-hypopnea index, CPAP treatment), insomnia (CBT-I first-line), narcolepsy (cataplexy, REM intrusion).",
    "Polysomnography: what it measures (EEG, EOG, EMG, airflow, oxygen, ECG) and how to interpret AHI.",
    "Circadian rhythm disorders: delayed sleep phase, shift work disorder, jet lag — light therapy principles.",
    "Restless legs syndrome: symptoms (urge to move, worse at rest, evening), dopamine agonist treatment.",
    "Sleep pharmacology: benzodiazepines vs. non-benzo hypnotics (Z-drugs) vs. melatonin — mechanisms and risks.",
  ]
},
"speech-language-pathology": {
  "title": "Speech-Language Pathology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Communication disorders, swallowing, assessment, treatment approaches, AAC, SLP scope of practice"},
  "tips": [
    "Language vs. speech: language (content/form/use), speech (articulation, fluency, voice) — which disorders affect which.",
    "Aphasia types: Broca's (non-fluent, frontal lobe), Wernicke's (fluent, nonsensical, temporal lobe), global (severe).",
    "Dysphagia: phases of swallowing (oral prep, oral, pharyngeal, esophageal) and which disorders affect each.",
    "Modified barium swallow study vs. FEES — what each evaluates, who performs it.",
    "Articulation vs. phonological disorders — how to distinguish clinically and in treatment approach.",
    "AAC (augmentative and alternative communication): unaided (sign language) vs. aided (SGDs) — candidacy.",
  ]
},
"sports-medicine": {
  "title": "Sports Medicine",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Musculoskeletal anatomy, common sports injuries, concussion, orthopedic assessment, rehabilitation, prevention"},
  "tips": [
    "Common sports injuries: ankle sprain (ATFL most common), ACL tear (mechanism: plant-and-twist), rotator cuff.",
    "PRICE/POLICE protocol for acute injury: Protection, Optimal Loading, Ice, Compression, Elevation.",
    "Concussion: symptoms, return-to-play protocol steps, post-concussive syndrome.",
    "Special orthopedic tests: Lachman (ACL), drawer test, McMurray (meniscus), Hawkins-Kennedy (impingement).",
    "Overuse injuries: stress fractures (femur neck high-risk), tendinopathy vs. tendinitis distinction.",
    "Performance-enhancing drugs: anabolic steroids (effects/risks), EPO, stimulants — WADA categories.",
  ]
},
"surgical-technology": {
  "title": "Surgical Technology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Surgical anatomy, sterile technique, instrumentation, anesthesia, wound closure, OR safety"},
  "tips": [
    "Sterile field principles: what breaks sterility (falling below waist level, dampened drapes, unmonitored field) — non-negotiable.",
    "Surgical instrument categories: cutting (scalpels, scissors), grasping (forceps, clamps), retracting, suturing.",
    "Counts: soft goods, sharps, instruments — when performed, what happens on incorrect count.",
    "Anesthesia types: general, regional (spinal, epidural), local — monitoring requirements for each.",
    "Wound classification: clean, clean-contaminated, contaminated, dirty-infected — infection risk for each.",
    "Suture materials: absorbable (Vicryl, chromic gut) vs. non-absorbable (Prolene, nylon) — when each is used.",
  ]
},
"trauma-critical-care": {
  "title": "Trauma & Critical Care",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Trauma assessment, ATLS, shock management, ICU monitoring, critical care pharmacology, organ failure"},
  "tips": [
    "ATLS primary survey: A (Airway with C-spine), B (Breathing), C (Circulation), D (Disability), E (Exposure) — in strict order.",
    "Hemorrhagic shock classes: I (<15%), II (15-30%), III (30-40%), IV (>40%) — vital sign changes at each class.",
    "Damage control resuscitation: 1:1:1 ratio (pRBC:FFP:platelets), permissive hypotension concept.",
    "ICU monitoring: arterial line, CVP, pulmonary artery catheter — what each measures and normal values.",
    "ARDS: Berlin definition (acute onset, bilateral infiltrates, PaO2/FiO2 <300, non-cardiac), protective ventilation.",
    "Sepsis: Sepsis-3 definition (life-threatening organ dysfunction from infection), SOFA score, 1-hour bundle.",
  ]
},
"urology": {
  "title": "Urology",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Urinary anatomy, kidney stones, urinary tract infections, prostate conditions, urologic cancers, incontinence"},
  "tips": [
    "Urinary tract anatomy: kidney → ureter → bladder → urethra — male vs. female anatomy differences.",
    "UTI: lower (cystitis) vs. upper (pyelonephritis) — symptoms, common organisms, treatment duration differences.",
    "Kidney stones: types (calcium oxalate most common, uric acid, struvite), diagnosis (CT without contrast), treatment by size.",
    "BPH: symptoms (LUTS), alpha-blocker (tamsulosin) vs. 5-alpha reductase inhibitor (finasteride) — mechanism and timing.",
    "Urologic cancers: bladder (transitional cell, hematuria), prostate (PSA screening), renal cell (hematuria + flank pain + mass).",
    "Urinary incontinence types: stress (leaks with Valsalva), urge (OAB), overflow (BPH/neurogenic) — treatment for each.",
  ]
},
"veterinary-science": {
  "title": "Veterinary Science",
  "format": {"questions": 50, "time": "45 min", "type": "Multiple Choice", "topics": "Animal anatomy, common diseases, zoonoses, pharmacology, surgical procedures, animal behavior"},
  "tips": [
    "Zoonotic diseases are high-yield: rabies, Lyme disease, toxoplasmosis, leptospirosis — transmission and prevention.",
    "Species-specific anatomy differences: ruminant digestive system (four chambers), avian respiratory system.",
    "Common companion animal diseases: parvovirus, distemper (dogs), FeLV/FIV, panleukopenia (cats).",
    "Veterinary pharmacology: drugs safe in dogs but toxic to cats (NSAIDs, acetaminophen) — always tested.",
    "Core vaccines: rabies, DHPP (dogs), FVRCP + rabies (cats) — core vs. non-core distinction.",
    "Animal behavior basics: dominance hierarchies, territorial behavior, signs of pain and stress in animals.",
  ]
},
}

GUIDE_CSS = """
  /* ——— GUIDE TAB ——— */
  .guide-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .guide-panel {
    background: var(--bg-card);
    border: 1px solid var(--rule);
    padding: 32px 28px;
  }
  .guide-panel-title {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: -0.02em;
    margin-bottom: 6px;
  }
  .guide-panel-sub {
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px;
    font-style: italic;
    color: var(--ink-faint);
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--rule);
  }
  .guide-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
  .guide-stat {
    padding: 16px;
    border: 1px solid var(--rule);
  }
  .guide-stat-label {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 4px;
  }
  .guide-stat-val {
    font-family: 'Fraunces', serif;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: var(--ink);
  }
  .guide-topics-label {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 8px;
  }
  .guide-topics-text {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 14px;
    line-height: 1.65;
    color: var(--ink-soft);
  }
  .guide-tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .guide-tip {
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .guide-tip-num {
    font-family: 'Fraunces', serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    min-width: 20px;
    padding-top: 1px;
    flex-shrink: 0;
  }
  .guide-tip-text {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink);
  }
  @media (max-width: 760px) {
    .guide-layout { grid-template-columns: 1fr; gap: 24px; }
    .guide-panel { padding: 24px 20px; }
  }
"""

ADDITIONAL_RESPONSIVE_CSS = """
  /* ——— Test section responsive fixes ——— */
  .test-intro { box-sizing: border-box; width: 100%; }
  @media (max-width: 480px) {
    .test-intro { padding: 24px 16px; border-left: none; border-right: none; }
    .test-intro h2 { font-size: 24px; }
    .test-specs { grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .spec-item .spec-val { font-size: 20px; }
    .timer-bar { top: 52px; padding: 12px 0; }
    .quiz-term { font-size: clamp(24px, 6vw, 40px); }
    .option { padding: 14px 16px; font-size: 15px; }
    nav.tabs button { padding: 12px 18px; font-size: 14px; }
    .quiz-header { flex-wrap: wrap; gap: 8px; }
  }
"""

def make_guide_html(slug, data):
    tips_html = ""
    for i, tip in enumerate(data["tips"], 1):
        tips_html += f"""
        <li class="guide-tip">
          <span class="guide-tip-num">0{i}</span>
          <span class="guide-tip-text">{tip}</span>
        </li>"""

    fmt = data["format"]
    return f"""
  <!-- GUIDE VIEW -->
  <section class="view" id="view-guide">
    <div class="guide-layout">
      <div class="guide-panel">
        <div class="guide-panel-title">Competition Format</div>
        <div class="guide-panel-sub">What to expect at the HOSA competitive event</div>
        <div class="guide-stat-grid">
          <div class="guide-stat">
            <div class="guide-stat-label">Questions</div>
            <div class="guide-stat-val">{fmt['questions']}</div>
          </div>
          <div class="guide-stat">
            <div class="guide-stat-label">Time Limit</div>
            <div class="guide-stat-val">{fmt['time']}</div>
          </div>
          <div class="guide-stat">
            <div class="guide-stat-label">Format</div>
            <div class="guide-stat-val" style="font-size:15px;padding-top:3px;">{fmt['type']}</div>
          </div>
          <div class="guide-stat">
            <div class="guide-stat-label">Level</div>
            <div class="guide-stat-val" style="font-size:15px;padding-top:3px;">State &amp; ILC</div>
          </div>
        </div>
        <div class="guide-topics-label">Topics Covered</div>
        <div class="guide-topics-text">{fmt['topics']}</div>
      </div>
      <div class="guide-panel">
        <div class="guide-panel-title">Study Strategy</div>
        <div class="guide-panel-sub">High-yield tips for scoring well on this event</div>
        <ul class="guide-tips-list">{tips_html}
        </ul>
      </div>
    </div>
  </section>"""


def process_file(path, slug, data):
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Skip if guide already added
    if 'view-guide' in html:
        print(f"  Skipped (already has guide): {slug}")
        return

    # 1. Inject guide CSS before </style>
    css_injection = GUIDE_CSS + ADDITIONAL_RESPONSIVE_CSS + "\n"
    html = html.replace("</style>", css_injection + "</style>", 1)

    # 2. Add Guide tab button
    html = html.replace(
        '<button data-view="progress">Progress</button>',
        '<button data-view="progress">Progress</button>\n    <button data-view="guide">Guide</button>'
    )

    # 3. Insert guide section before </main>
    guide_html = make_guide_html(slug, data)
    html = html.replace("</main>", guide_html + "\n</main>")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  Updated: {slug}")


base = "/home/user/hosa-prep-hub"
for slug, data in EVENT_GUIDES.items():
    path = os.path.join(base, f"{slug}.html")
    if os.path.exists(path):
        process_file(path, slug, data)
    else:
        print(f"  NOT FOUND: {path}")

print("Done.")
