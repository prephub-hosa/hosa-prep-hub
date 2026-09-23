/* ═════════════════════════════════════════════════════════════════
   Home-page extras: the term pool, the games, search, the leaderboard.

   This was 212 KB of inline script sitting in index.html — a third of
   the document. Nothing can be painted until the HTML has arrived, so
   every visitor waited for all of it before seeing anything, on a page
   whose first screen is a greeting and four buttons.

   Measured on a throttled 4G connection against a compressing server,
   first paint was 4.9 s. None of it is needed to draw that first
   screen: the games open on a click and the leaderboard on a tab, so
   the whole lot loads deferred, in parallel, after the document.

   It keeps its own DOMContentLoaded handling, so running after the
   parse is what it already expected.
   ═════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════
   HOSA TERMS POOL — used by Daily Challenge + Global Search
   ═══════════════════════════════════════════════════════════════ */
var HOSA_TERMS = [
  // Generated from every event page — see sync_registries.py.
  // Feeds the Daily Challenge, Match, Speed Drill, Quick Review and
  // Typing games, which previously drew from only 38 of the events.
  {term:'Fentanyl Test Strips', def:'Strips that detect fentanyl in a drug sample before use', event:'Addiction Medicine', slug:'addiction-medicine'},
  {term:'Tolerance', def:'Needing more of a substance to get the same effect', event:'Addiction Medicine', slug:'addiction-medicine'},
  {term:'CRAFFT', def:'The standard adolescent substance-use screen', event:'Addiction Medicine', slug:'addiction-medicine'},
  {term:'Polysubstance Use', def:'Using more than one substance, together or in a pattern', event:'Addiction Medicine', slug:'addiction-medicine'},
  {term:'Contingency Management', def:'Providing tangible rewards for verified abstinence', event:'Addiction Medicine', slug:'addiction-medicine'},
  {term:'Food Allergy', def:'IgE-mediated reaction within 2 hours of eating — urticaria, angioedema, or anaphylaxis', event:'Allergy & Immunology', slug:'allergy-immunology'},
  {term:'Anaphylaxis', def:'A severe, life-threatening systemic allergic reaction. Give IM epinephrine first', event:'Allergy & Immunology', slug:'allergy-immunology'},
  {term:'Hereditary Angioedema (HAE)', def:'Autosomal dominant C1-inhibitor deficiency causing recurrent angioedema without urticaria', event:'Allergy & Immunology', slug:'allergy-immunology'},
  {term:'Allergic Asthma', def:'IgE-mediated bronchospasm triggered by allergens', event:'Allergy & Immunology', slug:'allergy-immunology'},
  {term:'Drug Allergy and Penicillin Allergy', def:'Most people labelled penicillin-allergic are not — under 1% have true IgE-mediated allergy', event:'Allergy & Immunology', slug:'allergy-immunology'},
  {term:'Leukocytes (WBCs)', def:'White blood cells that protect the body from infection and disease', event:'Anatomy & Physiology', slug:'anatomy-physiology'},
  {term:'Chemical Digestion', def:'The enzymatic breakdown of food molecules into their absorbable subunits', event:'Anatomy & Physiology', slug:'anatomy-physiology'},
  {term:'Adrenal Cortex', def:'The outer layer of the adrenal gland', event:'Anatomy & Physiology', slug:'anatomy-physiology'},
  {term:'Agonist (Prime Mover)', def:'The primary muscle producing a movement', event:'Anatomy & Physiology', slug:'anatomy-physiology'},
  {term:'Neuron', def:'The basic structural and functional unit of the nervous system', event:'Anatomy & Physiology', slug:'anatomy-physiology'},
  {term:'Malignant Hyperthermia', def:'Life-threatening hyperthermia from volatile anesthetics or succinylcholine', event:'Anesthesiology', slug:'anesthesiology'},
  {term:'Succinylcholine', def:'Depolarizing neuromuscular blocker — fast onset (45s), short duration (5–10 min)', event:'Anesthesiology', slug:'anesthesiology'},
  {term:'ASA Physical Status Classification', def:'A six-level score rating how sick a patient is before anaesthesia', event:'Anesthesiology', slug:'anesthesiology'},
  {term:'Post-Operative Nausea & Vomiting (PONV)', def:'Risk factors: female, non-smoker, history of PONV/motion sickness, opioid use, volatile anesthetics', event:'Anesthesiology', slug:'anesthesiology'},
  {term:'Propofol', def:'IV induction agent — fast onset (<60s), short duration, causes hypotension and apnea', event:'Anesthesiology', slug:'anesthesiology'},
  {term:'Outer Ear', def:'The pinna and ear canal, which collect sound and funnel it to the eardrum', event:'Audiology', slug:'audiology'},
  {term:'Newborn Hearing Screening', def:'Universal screening in the first month using OAE and/or automated ABR', event:'Audiology', slug:'audiology'},
  {term:'Mixed Hearing Loss', def:'Conductive and sensorineural loss together in the same ear', event:'Audiology', slug:'audiology'},
  {term:'Vestibular Rehabilitation', def:'Exercise-based therapy for chronic vertigo, imbalance and dizziness', event:'Audiology', slug:'audiology'},
  {term:'Auditory Pathway', def:'Cochlea → CN VIII → brainstem → thalamus → auditory cortex in the temporal lobe', event:'Audiology', slug:'audiology'},
  {term:'Coping Mechanism', def:'A strategy used to manage stress or difficult emotions', event:'Behavioral Health', slug:'behavioral-health'},
  {term:'Panic Disorder', def:'Recurrent unexpected panic attacks plus persistent worry about future attacks', event:'Behavioral Health', slug:'behavioral-health'},
  {term:'Dopamine', def:'A neurotransmitter involved in reward, motivation, and movement', event:'Behavioral Health', slug:'behavioral-health'},
  {term:'Hallucination', def:'A false sensory perception without external stimulus', event:'Behavioral Health', slug:'behavioral-health'},
  {term:'Tolerance', def:'Needing increased amounts of a substance to achieve the same effect', event:'Behavioral Health', slug:'behavioral-health'},
  {term:'Cellulose', def:'A structural polysaccharide forming plant cell walls', event:'Biochemistry', slug:'biochemistry'},
  {term:'Steroid', def:'A lipid with a four-ring carbon structure', event:'Biochemistry', slug:'biochemistry'},
  {term:'Passive Transport', def:'Movement of substances across a membrane without requiring cellular energy', event:'Biochemistry', slug:'biochemistry'},
  {term:'Beta Oxidation', def:'The process breaking down fatty acids into acetyl-CoA units in the mitochondria', event:'Biochemistry', slug:'biochemistry'},
  {term:'RNA', def:'Ribonucleic acid — typically single-stranded', event:'Biochemistry', slug:'biochemistry'},
  {term:'Bilirubin', def:'A yellow pigment from hemoglobin breakdown; elevated levels cause jaundice', event:'Biomedical Laboratory Science', slug:'biomedical-lab-science'},
  {term:'Thrombocytopenia', def:'Platelet count below 150,000/µL; increases bleeding risk', event:'Biomedical Laboratory Science', slug:'biomedical-lab-science'},
  {term:'Phlebotomy', def:'Drawing blood from a patient for lab testing', event:'Biomedical Laboratory Science', slug:'biomedical-lab-science'},
  {term:'Culture Media', def:'Nutrient preparations used to grow and identify microorganisms', event:'Biomedical Laboratory Science', slug:'biomedical-lab-science'},
  {term:'Accuracy', def:'How close a test result is to the true value', event:'Biomedical Laboratory Science', slug:'biomedical-lab-science'},
  {term:'Mode', def:'The most frequently occurring value', event:'Biostatistics & Research', slug:'biostatistics-research'},
  {term:'Cross-Sectional Study', def:'A study measuring exposure and outcome at the same moment', event:'Biostatistics & Research', slug:'biostatistics-research'},
  {term:'False Negative', def:'A negative test result in someone who does have the condition', event:'Biostatistics & Research', slug:'biostatistics-research'},
  {term:'Equipoise', def:'Genuine uncertainty about which trial arm is better', event:'Biostatistics & Research', slug:'biostatistics-research'},
  {term:'T-Test', def:'A test comparing the means of two groups', event:'Biostatistics & Research', slug:'biostatistics-research'},
  {term:'Forensic DNA Analysis', def:'Using DNA evidence to identify individuals or link suspects to crime scenes', event:'Biotechnology', slug:'biotechnology'},
  {term:'Patent Law in Biotech', def:'Legal protection for biotech inventions', event:'Biotechnology', slug:'biotechnology'},
  {term:'Stem Cell Therapy', def:'Using stem cells to replace or repair damaged tissues or organs', event:'Biotechnology', slug:'biotechnology'},
  {term:'Genome', def:'The complete set of DNA in an organism', event:'Biotechnology', slug:'biotechnology'},
  {term:'Transgenic Organism', def:'An organism whose genome contains a gene from a different species', event:'Biotechnology', slug:'biotechnology'},
  {term:'Cardiac Conduction System', def:'SA node → AV node → Bundle of His → bundle branches → Purkinje fibers', event:'Cardiovascular Science', slug:'cardiovascular-science'},
  {term:'Statins', def:'HMG-CoA reductase inhibitors that lower LDL by 20–60%', event:'Cardiovascular Science', slug:'cardiovascular-science'},
  {term:'Atrial Flutter', def:'Atrial rate ~250–350 bpm with \'sawtooth\' flutter waves', event:'Cardiovascular Science', slug:'cardiovascular-science'},
  {term:'Heart Failure', def:'The heart cannot pump enough to meet the body\'s metabolic demands', event:'Cardiovascular Science', slug:'cardiovascular-science'},
  {term:'Cardiac Cycle (Systole vs Diastole)', def:'Systole is contraction and ejection; diastole is relaxation and filling', event:'Cardiovascular Science', slug:'cardiovascular-science'},
  {term:'Elastic Fiber', def:'A fiber of elastin that stretches and recoils', event:'Cell Biology & Histology', slug:'cell-biology-histology'},
  {term:'S Phase', def:'The phase in which DNA is replicated', event:'Cell Biology & Histology', slug:'cell-biology-histology'},
  {term:'Transitional Epithelium', def:'Epithelium that changes shape as an organ stretches', event:'Cell Biology & Histology', slug:'cell-biology-histology'},
  {term:'Cardiac Muscle', def:'Striated, involuntary muscle found only in the heart', event:'Cell Biology & Histology', slug:'cell-biology-histology'},
  {term:'Active Transport', def:'Movement of a substance against its gradient, using ATP', event:'Cell Biology & Histology', slug:'cell-biology-histology'},
  {term:'Klinefelter Syndrome (47,XXY)', def:'Extra X chromosome in males; most common sex chromosome aneuploidy', event:'Clinical Genetics', slug:'clinical-genetics'},
  {term:'Genetic Counseling', def:'Helping families understand a genetic condition, its inheritance, and their options', event:'Clinical Genetics', slug:'clinical-genetics'},
  {term:'X-Linked Recessive Inheritance', def:'The mutated gene is on the X chromosome', event:'Clinical Genetics', slug:'clinical-genetics'},
  {term:'Galactosemia', def:'Autosomal recessive deficiency of galactose-1-phosphate uridyltransferase', event:'Clinical Genetics', slug:'clinical-genetics'},
  {term:'Newborn Screening (NBS)', def:'State-mandated screening of every newborn for treatable conditions', event:'Clinical Genetics', slug:'clinical-genetics'},
  {term:'Respiratory Rate', def:'Breaths per minute; normal adult range is 12–20', event:'Clinical Nursing', slug:'clinical-nursing'},
  {term:'Stethoscope', def:'A device used to listen to heart, lung, and bowel sounds', event:'Clinical Nursing', slug:'clinical-nursing'},
  {term:'Hand Hygiene', def:'The most effective infection prevention measure', event:'Clinical Nursing', slug:'clinical-nursing'},
  {term:'Oral Route (PO)', def:'Medication taken by mouth; the most common and convenient route', event:'Clinical Nursing', slug:'clinical-nursing'},
  {term:'Supine Position', def:'Lying flat on the back; used for exams, surgeries, and CPR', event:'Clinical Nursing', slug:'clinical-nursing'},
  {term:'Asystole', def:'A complete absence of electrical activity in the heart', event:'CPR & First Aid', slug:'cpr-first-aid'},
  {term:'Foreign Body Airway Obstruction', def:'Blockage of the airway by an object, usually food', event:'CPR & First Aid', slug:'cpr-first-aid'},
  {term:'Shock (Hypoperfusion)', def:'Inadequate blood flow to the tissues, which is life-threatening', event:'CPR & First Aid', slug:'cpr-first-aid'},
  {term:'Scene Safety', def:'Confirming the area is safe before approaching a victim', event:'CPR & First Aid', slug:'cpr-first-aid'},
  {term:'Compression Rate', def:'100 to 120 chest compressions per minute', event:'CPR & First Aid', slug:'cpr-first-aid'},
  {term:'Enamel', def:'The hardest substance in the human body', event:'Dental Science', slug:'dental-science'},
  {term:'Xerostomia', def:'Dry mouth from reduced salivary flow — a major caries risk', event:'Dental Science', slug:'dental-science'},
  {term:'Sterilization', def:'Complete destruction of all microorganisms', event:'Dental Science', slug:'dental-science'},
  {term:'Zinc Oxide Eugenol (ZOE)', def:'A sedative cement with analgesic and antimicrobial properties', event:'Dental Science', slug:'dental-science'},
  {term:'Bass Brushing Technique', def:'The recommended brushing method', event:'Dental Science', slug:'dental-science'},
  {term:'Hypodermis (Subcutaneous)', def:'Adipose and connective tissue layer beneath the dermis', event:'Dermatology', slug:'dermatology'},
  {term:'Melanoma', def:'Malignancy of melanocytes; most lethal skin cancer', event:'Dermatology', slug:'dermatology'},
  {term:'Scabies', def:'Infestation by mite Sarcoptes scabiei', event:'Dermatology', slug:'dermatology'},
  {term:'Secondary Lesions', def:'Skin changes that develop out of an existing primary lesion', event:'Dermatology', slug:'dermatology'},
  {term:'Skin Appendages', def:'The structures embedded in skin: hair follicles, sweat glands, sebaceous glands and nails', event:'Dermatology', slug:'dermatology'},
  {term:'Evacuation', def:'Moving people away from a threatened area', event:'Disaster Preparedness', slug:'disaster-preparedness'},
  {term:'Incident Commander', def:'The one person with overall authority for an incident', event:'Disaster Preparedness', slug:'disaster-preparedness'},
  {term:'Four Phases of Emergency Management', def:'Mitigation, preparedness, response and recovery', event:'Disaster Preparedness', slug:'disaster-preparedness'},
  {term:'Survivor Guilt', def:'Distress at having survived when others did not', event:'Disaster Preparedness', slug:'disaster-preparedness'},
  {term:'Leveraging', def:'Using a rigid bar and a fulcrum to raise a heavy object', event:'Disaster Preparedness', slug:'disaster-preparedness'},
  {term:'Head-Tilt Chin-Lift', def:'A manual airway-opening technique used in non-trauma patients', event:'Emergency Medical Science', slug:'emergency-medical-science'},
  {term:'Chief Complaint', def:'The patient\'s main reason for calling 911, in their own words', event:'Emergency Medical Science', slug:'emergency-medical-science'},
  {term:'Negligence', def:'Failure to meet the standard of care that causes harm to a patient', event:'Emergency Medical Science', slug:'emergency-medical-science'},
  {term:'Stroke', def:'Interruption of blood flow to the brain', event:'Emergency Medical Science', slug:'emergency-medical-science'},
  {term:'START Triage', def:'Simple Triage and Rapid Treatment', event:'Emergency Medical Science', slug:'emergency-medical-science'},
  {term:'Hyperparathyroidism', def:'Primary: parathyroid adenoma → ↑PTH → ↑Ca, ↓PO4', event:'Endocrinology', slug:'endocrinology'},
  {term:'Diabetic Complications (Macrovascular & Microvascular)', def:'Macrovascular: CAD, stroke, PAD', event:'Endocrinology', slug:'endocrinology'},
  {term:'Growth Hormone (GH) Disorders', def:'Conditions caused by too much or too little growth hormone', event:'Endocrinology', slug:'endocrinology'},
  {term:'Hypothyroidism (Hashimoto)', def:'Autoimmune (anti-TPO antibodies) destroys thyroid → ↓T4, ↑TSH', event:'Endocrinology', slug:'endocrinology'},
  {term:'Pheochromocytoma', def:'Catecholamine-secreting tumor of adrenal medulla', event:'Endocrinology', slug:'endocrinology'},
  {term:'Mortality Rate vs Case Fatality Rate', def:'Mortality rate: deaths per 100,000 population per year', event:'Epidemiology', slug:'epidemiology'},
  {term:'Smallpox Eradication (1980)', def:'The first and only human disease to be globally eradicated', event:'Epidemiology', slug:'epidemiology'},
  {term:'Attributable Risk (Risk Difference)', def:'The difference in incidence between exposed and unexposed groups', event:'Epidemiology', slug:'epidemiology'},
  {term:'Non-Pharmaceutical Interventions (NPIs)', def:'Non-drug measures that slow transmission during an outbreak', event:'Epidemiology', slug:'epidemiology'},
  {term:'Confounding', def:'Distortion of an exposure-outcome link by a third variable tied to both', event:'Epidemiology', slug:'epidemiology'},
  {term:'Glycogen', def:'The stored form of carbohydrate in muscle and liver', event:'Exercise Physiology', slug:'exercise-physiology'},
  {term:'Cardiac Output', def:'The volume of blood the heart pumps per minute', event:'Exercise Physiology', slug:'exercise-physiology'},
  {term:'Creatine Phosphate', def:'A stored compound that rapidly rebuilds ATP from ADP', event:'Exercise Physiology', slug:'exercise-physiology'},
  {term:'Muscle Atrophy', def:'Loss of muscle size from disuse, ageing or illness', event:'Exercise Physiology', slug:'exercise-physiology'},
  {term:'Flexibility Testing', def:'Assessment of range of motion at a joint', event:'Exercise Physiology', slug:'exercise-physiology'},
  {term:'Postmortem Interval (PMI) Estimation', def:'Estimating how long someone has been dead', event:'Forensic Science', slug:'forensic-science'},
  {term:'ABO Blood Typing in Forensics', def:'ABO antigens on RBCs and corresponding antibodies in plasma', event:'Forensic Science', slug:'forensic-science'},
  {term:'Alcohol Metabolism and Postmortem Ethanol', def:'Ethanol metabolized at ~0.015–0.020 g/dL per hour by ADH', event:'Forensic Science', slug:'forensic-science'},
  {term:'Glass Fracture Analysis', def:'Radial fractures from an impact point; concentric rings follow', event:'Forensic Science', slug:'forensic-science'},
  {term:'Sharp Force Injuries', def:'Incised wounds: longer than deep, smooth edges — from slashing', event:'Forensic Science', slug:'forensic-science'},
  {term:'Stomach Functions', def:'Stores food, secretes gastric juice', event:'Gastroenterology', slug:'gastroenterology'},
  {term:'Hepatitis (Viral)', def:'HAV (fecal-oral, acute only)', event:'Gastroenterology', slug:'gastroenterology'},
  {term:'Hemorrhoids', def:'Dilated rectal/anal veins', event:'Gastroenterology', slug:'gastroenterology'},
  {term:'H. pylori Infection', def:'Gram-negative spiral urease-producing bacterium colonizing gastric mucosa', event:'Gastroenterology', slug:'gastroenterology'},
  {term:'Liver Functions', def:'What the liver does: metabolism, detoxification, bile, and protein synthesis', event:'Gastroenterology', slug:'gastroenterology'},
  {term:'Turner Syndrome (45,X)', def:'Monosomy of one X chromosome in females', event:'Genetics & Heredity', slug:'genetics'},
  {term:'Hemophilia A and B', def:'X-linked recessive deficiencies', event:'Genetics & Heredity', slug:'genetics'},
  {term:'Prenatal Diagnosis', def:'Tests offered during pregnancy to detect fetal disorders', event:'Genetics & Heredity', slug:'genetics'},
  {term:'Pedigree Analysis', def:'Family diagram tracking inheritance', event:'Genetics & Heredity', slug:'genetics'},
  {term:'Transcription and Translation', def:'Transcription: DNA template → mRNA in the nucleus by RNA polymerase', event:'Genetics & Heredity', slug:'genetics'},
  {term:'CAM (Confusion Assessment Method)', def:'A validated bedside tool for diagnosing delirium', event:'Geriatric Psychiatry', slug:'geriatric-psychiatry'},
  {term:'IWATCHDEATH Mnemonic (Delirium Causes)', def:'A mnemonic for the common precipitants of delirium', event:'Geriatric Psychiatry', slug:'geriatric-psychiatry'},
  {term:'Frontotemporal Dementia (FTD)', def:'Dementia from degeneration of frontal and temporal lobes', event:'Geriatric Psychiatry', slug:'geriatric-psychiatry'},
  {term:'Late-Life Depression', def:'Major depressive disorder in older adults', event:'Geriatric Psychiatry', slug:'geriatric-psychiatry'},
  {term:'Polypharmacy', def:'The concurrent use of five or more medications', event:'Geriatric Psychiatry', slug:'geriatric-psychiatry'},
  {term:'Polypharmacy', def:'Use of ≥5 medications; common in older adults', event:'Geriatrics', slug:'geriatrics'},
  {term:'Cognitive Screening (MMSE, MoCA, Mini-Cog)', def:'MMSE (30 points; <24 cognitive impairment)', event:'Geriatrics', slug:'geriatrics'},
  {term:'Falls Prevention', def:'Most common cause of injury in older adults', event:'Geriatrics', slug:'geriatrics'},
  {term:'Physiologic Changes of Aging', def:'Cardiovascular: ↓max HR, arterial stiffness, ↑BP', event:'Geriatrics', slug:'geriatrics'},
  {term:'Advance Care Planning', def:'Conversations about goals, values, preferences for future care', event:'Geriatrics', slug:'geriatrics'},
  {term:'Social Determinants of Health (SDOH)', def:'Non-medical conditions that shape health outcomes', event:'Global Health', slug:'global-health'},
  {term:'Tuberculosis (Global Perspective)', def:'World\'s leading infectious disease killer', event:'Global Health', slug:'global-health'},
  {term:'Humanitarian & Disaster Health', def:'Sphere Standards guide humanitarian response', event:'Global Health', slug:'global-health'},
  {term:'Health Equity & Disparities', def:'Health equity: everyone has a fair opportunity to achieve optimal health', event:'Global Health', slug:'global-health'},
  {term:'HIV/AIDS Global Burden', def:'39 million people living with HIV globally; 70% in sub-Saharan Africa', event:'Global Health', slug:'global-health'},
  {term:'Health Equity', def:'Everyone having a fair opportunity to be as healthy as possible', event:'Health Equity', slug:'health-equity'},
  {term:'Limited English Proficiency (LEP) and Health', def:'Language barriers that raise the risk of diagnostic error, adverse events, and non-adherence', event:'Health Equity', slug:'health-equity'},
  {term:'Social Needs Screening (SDOH Screening)', def:'Asking patients directly about unmet social needs and connecting them to help', event:'Health Equity', slug:'health-equity'},
  {term:'LGBTQ+ Health Disparities', def:'Worse health outcomes in LGBTQ+ people driven by stigma and inadequate care', event:'Health Equity', slug:'health-equity'},
  {term:'Food Insecurity', def:'Lack of consistent access to enough food for an active, healthy life', event:'Health Equity', slug:'health-equity'},
  {term:'Population Health Management', def:'Managing the health of a whole defined population using its data', event:'Health Informatics', slug:'health-informatics'},
  {term:'Patient Portal', def:'A secure site where patients see their records and message their care team', event:'Health Informatics', slug:'health-informatics'},
  {term:'HIPAA Privacy Rule', def:'Federal regulation protecting Protected Health Information (PHI)', event:'Health Informatics', slug:'health-informatics'},
  {term:'ICD-10-CM / ICD-10-PCS', def:'The International Classification of Diseases, 10th Revision', event:'Health Informatics', slug:'health-informatics'},
  {term:'Usability and Alert Fatigue', def:'Too many low-value EHR alerts cause clinicians to miss the important ones', event:'Health Informatics', slug:'health-informatics'},
  {term:'Medicaid', def:'Joint federal-state insurance for low-income individuals', event:'Healthcare Systems & Policy', slug:'healthcare-systems'},
  {term:'Social Determinants of Health (SDOH)', def:'Non-medical factors shaping health', event:'Healthcare Systems & Policy', slug:'healthcare-systems'},
  {term:'Hospital Types', def:'Acute care (short-term medical/surgical)', event:'Healthcare Systems & Policy', slug:'healthcare-systems'},
  {term:'Medicare', def:'Federal insurance for ages ≥65, ESRD, and some disabilities', event:'Healthcare Systems & Policy', slug:'healthcare-systems'},
  {term:'Patient Safety and Joint Commission', def:'The Joint Commission accredits hospitals', event:'Healthcare Systems & Policy', slug:'healthcare-systems'},
  {term:'Aplastic Anemia', def:'Pancytopenia from bone marrow failure', event:'Hematology', slug:'hematology'},
  {term:'Hemoglobin Structure', def:'Tetramer of 2α + 2β chains in adult HbA (97%)', event:'Hematology', slug:'hematology'},
  {term:'Blood Typing (ABO and Rh)', def:'ABO antigens on RBCs; corresponding antibodies in plasma', event:'Hematology', slug:'hematology'},
  {term:'PT/INR vs PTT', def:'PT measures extrinsic pathway (factor VII) and common pathway', event:'Hematology', slug:'hematology'},
  {term:'Hemolytic Anemia', def:'RBC destruction faster than production', event:'Hematology', slug:'hematology'},
  {term:'Cirrhosis & Child-Pugh Score', def:'End-stage hepatic fibrosis', event:'Hepatology', slug:'hepatology'},
  {term:'Hepatitis C', def:'RNA flavivirus, parenteral transmission', event:'Hepatology', slug:'hepatology'},
  {term:'AST & ALT (Transaminases)', def:'Markers of hepatocellular injury', event:'Hepatology', slug:'hepatology'},
  {term:'Acetaminophen Toxicity', def:'Hepatotoxic dose >150 mg/kg or 7.5g in adults', event:'Hepatology', slug:'hepatology'},
  {term:'Hepatitis A', def:'RNA picornavirus, fecal-oral transmission', event:'Hepatology', slug:'hepatology'},
  {term:'Identity Formation', def:'The process of developing a stable sense of self', event:'Human Growth & Development', slug:'human-growth-development'},
  {term:'Primary Aging', def:'Inevitable biological change with age, independent of lifestyle', event:'Human Growth & Development', slug:'human-growth-development'},
  {term:'Nature vs. Nurture', def:'The debate over whether genes or environment shapes development more', event:'Human Growth & Development', slug:'human-growth-development'},
  {term:'Attachment', def:'The enduring emotional bond between an infant and primary caregiver', event:'Human Growth & Development', slug:'human-growth-development'},
  {term:'Low Birth Weight', def:'Infant weighing less than 2,500 grams (5.5 lbs) at birth', event:'Human Growth & Development', slug:'human-growth-development'},
  {term:'T Cells (CD4 vs CD8)', def:'T lymphocytes mature in thymus', event:'Immunology', slug:'immunology'},
  {term:'Autoimmunity', def:'Loss of tolerance → immune attack on self', event:'Immunology', slug:'immunology'},
  {term:'Physical and Chemical Barriers', def:'The body\'s first line of defence, before any immune cell is involved', event:'Immunology', slug:'immunology'},
  {term:'Transplant Rejection', def:'Hyperacute (minutes — preformed antibodies, ABO mismatch)', event:'Immunology', slug:'immunology'},
  {term:'B Cells and Antibodies', def:'B lymphocytes mature in bone marrow', event:'Immunology', slug:'immunology'},
  {term:'Endocarditis (Infective)', def:'Infection of cardiac valves', event:'Infectious Disease', slug:'infectious-disease'},
  {term:'SIRS, Sepsis, Septic Shock', def:'SIRS: 2+ of temp >38/<36, HR >90, RR >20, WBC >12K/<4K', event:'Infectious Disease', slug:'infectious-disease'},
  {term:'Hepatitis Viruses', def:'HAV: fecal-oral, acute only, vaccine', event:'Infectious Disease', slug:'infectious-disease'},
  {term:'Urinary Tract Infection (UTI)', def:'Uncomplicated cystitis: dysuria, frequency, urgency', event:'Infectious Disease', slug:'infectious-disease'},
  {term:'Sepsis Bundle (Hour-1)', def:'The actions that must happen within an hour of recognising sepsis', event:'Infectious Disease', slug:'infectious-disease'},
  {term:'Atrial Fibrillation', def:'The most common sustained arrhythmia', event:'Interventional Cardiology', slug:'interventional-cardiology'},
  {term:'Atrioventricular (AV) Blocks', def:'First-degree: PR >0.20s, no beats dropped', event:'Interventional Cardiology', slug:'interventional-cardiology'},
  {term:'Dual Antiplatelet Therapy (DAPT)', def:'Aspirin plus a P2Y12 inhibitor, given after PCI to prevent in-stent thrombosis', event:'Interventional Cardiology', slug:'interventional-cardiology'},
  {term:'Coronary Angiography', def:'Catheter-based contrast imaging of the coronary arteries', event:'Interventional Cardiology', slug:'interventional-cardiology'},
  {term:'NSTEMI vs Unstable Angina', def:'Both are non-ST-elevation ACS (NSTE-ACS)', event:'Interventional Cardiology', slug:'interventional-cardiology'},
  {term:'Continuing Education', def:'Ongoing training required to maintain a credential', event:'Job Seeking Skills', slug:'job-seeking-skills'},
  {term:'Mock Interview', def:'A rehearsal interview with feedback', event:'Job Seeking Skills', slug:'job-seeking-skills'},
  {term:'Fair Labor Standards Act', def:'The federal law setting minimum wage, overtime and child labor rules', event:'Job Seeking Skills', slug:'job-seeking-skills'},
  {term:'Salutation', def:'The greeting line of a letter', event:'Job Seeking Skills', slug:'job-seeking-skills'},
  {term:'Work Ethic', def:'Reliability, initiative and diligence in doing the job', event:'Job Seeking Skills', slug:'job-seeking-skills'},
  {term:'Referral vs Consultation', def:'A referral transfers care to a specialist', event:'Medical Assisting', slug:'medical-assisting'},
  {term:'Sterile Field', def:'A microorganism-free area created with sterile drapes and equipment', event:'Medical Assisting', slug:'medical-assisting'},
  {term:'Hematocrit (Spun)', def:'The percentage of whole blood volume occupied by red blood cells', event:'Medical Assisting', slug:'medical-assisting'},
  {term:'Scope of Practice (Medical Assistant)', def:'What a medical assistant may and may not do', event:'Medical Assisting', slug:'medical-assisting'},
  {term:'Controlled Substance Schedules (DEA)', def:'DEA Schedule I: no accepted medical use, high abuse (heroin, LSD)', event:'Medical Assisting', slug:'medical-assisting'},
  {term:'Audit Trail', def:'A record of who accessed or changed information and when', event:'Medical Coding & Billing', slug:'medical-coding-billing'},
  {term:'Add-On Code', def:'A code reported only alongside a primary procedure', event:'Medical Coding & Billing', slug:'medical-coding-billing'},
  {term:'Denial', def:'A payer’s refusal to pay a claim as submitted', event:'Medical Coding & Billing', slug:'medical-coding-billing'},
  {term:'Modifier 51', def:'Multiple procedures performed at the same session', event:'Medical Coding & Billing', slug:'medical-coding-billing'},
  {term:'Laterality', def:'The coded side of the body a condition affects', event:'Medical Coding & Billing', slug:'medical-coding-billing'},
  {term:'Genetic Privacy', def:'The right of individuals to control access to their genetic information', event:'Medical Law & Ethics', slug:'medical-law-ethics'},
  {term:'Liability', def:'Legal responsibility for actions or omissions', event:'Medical Law & Ethics', slug:'medical-law-ethics'},
  {term:'Veracity', def:'The duty to tell the truth and be honest with patients', event:'Medical Law & Ethics', slug:'medical-law-ethics'},
  {term:'HIPAA Privacy Rule', def:'Sets national standards for protecting medical records and PHI', event:'Medical Law & Ethics', slug:'medical-law-ethics'},
  {term:'Battery', def:'Intentional harmful or offensive contact without consent', event:'Medical Law & Ethics', slug:'medical-law-ethics'},
  {term:'Fluid Ounce to Milliliters', def:'1 fl oz = 30 mL', event:'Medical Math', slug:'medical-math'},
  {term:'Numerator', def:'The top number of a fraction, representing the part', event:'Medical Math', slug:'medical-math'},
  {term:'Young\'s Rule', def:'Pediatric dose = [age / (age + 12)] x adult dose', event:'Medical Math', slug:'medical-math'},
  {term:'Anion Gap', def:'AG = Na+ minus (Cl- + HCO3-)', event:'Medical Math', slug:'medical-math'},
  {term:'Infusion Time Calculation', def:'Time (hr) = Total volume (mL) / Rate (mL/hr)', event:'Medical Math', slug:'medical-math'},
  {term:'Antibiotic Resistance Mechanisms', def:'The ways bacteria defeat antibiotics', event:'Medical Microbiology', slug:'medical-microbiology'},
  {term:'Helicobacter pylori', def:'A gram-negative, curved/spiral rod; urease-positive', event:'Medical Microbiology', slug:'medical-microbiology'},
  {term:'Helminths Overview', def:'Multicellular parasitic worms', event:'Medical Microbiology', slug:'medical-microbiology'},
  {term:'Sterilization vs Disinfection', def:'Sterilization eliminates all microbes', event:'Medical Microbiology', slug:'medical-microbiology'},
  {term:'Serology and Antibody Testing', def:'Detects host immune response (IgM = acute, IgG = past/chronic)', event:'Medical Microbiology', slug:'medical-microbiology'},
  {term:'Dyspnea', def:'Spelling: D-Y-S-P-N-E-A', event:'Medical Spelling', slug:'medical-spelling'},
  {term:'Xero-', def:'Meaning: dry', event:'Medical Spelling', slug:'medical-spelling'},
  {term:'Phlebotomy', def:'Spelling: P-H-L-E-B-O-T-O-M-Y', event:'Medical Spelling', slug:'medical-spelling'},
  {term:'Derm(a/o)-', def:'Root meaning: skin', event:'Medical Spelling', slug:'medical-spelling'},
  {term:'-itis', def:'Meaning: inflammation', event:'Medical Spelling', slug:'medical-spelling'},
  {term:'mono-', def:'one', event:'Medical Terminology', slug:'medical-terminology'},
  {term:'cost/o', def:'rib', event:'Medical Terminology', slug:'medical-terminology'},
  {term:'-algia', def:'pain', event:'Medical Terminology', slug:'medical-terminology'},
  {term:'neo-', def:'new', event:'Medical Terminology', slug:'medical-terminology'},
  {term:'erythr/o', def:'red', event:'Medical Terminology', slug:'medical-terminology'},
  {term:'Congenital Heart Disease (CHD) Overview', def:'Most common birth defect', event:'Neonatology', slug:'neonatology'},
  {term:'Intraventricular Hemorrhage (IVH)', def:'Bleeding into germinal matrix/ventricles in preterm infants <32 weeks', event:'Neonatology', slug:'neonatology'},
  {term:'Newborn Resuscitation (NRP)', def:'Warm, dry, stimulate → assess breathing/HR', event:'Neonatology', slug:'neonatology'},
  {term:'Necrotizing Enterocolitis (NEC)', def:'Inflammatory bowel necrosis primarily in preterm infants', event:'Neonatology', slug:'neonatology'},
  {term:'Inborn Errors of Metabolism', def:'Enzyme defects in metabolic pathways', event:'Neonatology', slug:'neonatology'},
  {term:'Chronic Kidney Disease (CKD)', def:'GFR <60 for ≥3 months or kidney damage markers', event:'Nephrology', slug:'nephrology'},
  {term:'Nephron Structure', def:'Functional unit of the kidney (~1 million per kidney)', event:'Nephrology', slug:'nephrology'},
  {term:'Metabolic Acidosis (Anion Gap)', def:'AG = Na - (Cl + HCO3); normal 8-12', event:'Nephrology', slug:'nephrology'},
  {term:'Renal Transplantation', def:'Best long-term outcome for ESRD', event:'Nephrology', slug:'nephrology'},
  {term:'Nephrotic Syndrome', def:'Proteinuria >3.5 g/day, hypoalbuminemia, edema, hyperlipidemia', event:'Nephrology', slug:'nephrology'},
  {term:'Meninges and CSF', def:'Three layers: dura, arachnoid, pia', event:'Neurology', slug:'neurology'},
  {term:'Dementia (Alzheimer Disease)', def:'Most common dementia (60–70%)', event:'Neurology', slug:'neurology'},
  {term:'Antiepileptic Drugs (AEDs)', def:'Drugs that prevent seizures, chosen by seizure type', event:'Neurology', slug:'neurology'},
  {term:'Subarachnoid Hemorrhage (SAH)', def:'Bleeding into subarachnoid space, usually from ruptured berry aneurysm', event:'Neurology', slug:'neurology'},
  {term:'Cerebellum', def:'Coordinates motor activity, balance, and posture', event:'Neurology', slug:'neurology'},
  {term:'Dressing and Grooming', def:'Allow resident choice when possible', event:'Nursing Assisting', slug:'nursing-assisting'},
  {term:'Pressure Ulcer Prevention', def:'What staff do to keep a pressure injury from forming', event:'Nursing Assisting', slug:'nursing-assisting'},
  {term:'Fall Prevention', def:'Measures that keep a resident from falling', event:'Nursing Assisting', slug:'nursing-assisting'},
  {term:'CNA Scope of Practice', def:'What a certified nursing assistant may do under RN supervision', event:'Nursing Assisting', slug:'nursing-assisting'},
  {term:'Temperature Routes', def:'Oral: 97.6–99.6°F (avoid if confused, post-op, oxygen)', event:'Nursing Assisting', slug:'nursing-assisting'},
  {term:'Vegan Diet', def:'A plant-based diet excluding all animal products', event:'Nutrition', slug:'nutrition'},
  {term:'Digestion', def:'The mechanical and chemical breakdown of food into absorbable nutrient molecules', event:'Nutrition', slug:'nutrition'},
  {term:'Lactose Intolerance', def:'Inability to digest milk sugar (lactose) due to insufficient lactase enzyme', event:'Nutrition', slug:'nutrition'},
  {term:'Infant Nutrition', def:'Breast milk or formula is the sole food source for the first 4-6 months', event:'Nutrition', slug:'nutrition'},
  {term:'Glycemic Response', def:'The effect a food has on blood sugar levels after eating', event:'Nutrition', slug:'nutrition'},
  {term:'Female Reproductive Anatomy', def:'External: vulva, labia, clitoris', event:'Obstetrics & Gynecology', slug:'obstetrics-gynecology'},
  {term:'Contraception Methods', def:'The options for preventing pregnancy, reversible and permanent', event:'Obstetrics & Gynecology', slug:'obstetrics-gynecology'},
  {term:'Vaginal vs Cesarean Delivery', def:'Vaginal: faster recovery, lower infection, preferred', event:'Obstetrics & Gynecology', slug:'obstetrics-gynecology'},
  {term:'Naegele\'s Rule (EDD)', def:'Estimated due date: LMP + 7 days - 3 months + 1 year', event:'Obstetrics & Gynecology', slug:'obstetrics-gynecology'},
  {term:'Menstrual Cycle Phases', def:'Follicular (days 1-13): FSH stimulates follicle growth, rising estrogen', event:'Obstetrics & Gynecology', slug:'obstetrics-gynecology'},
  {term:'Bloodborne Pathogen', def:'A disease-causing organism carried in blood', event:'Occupational Health & Safety', slug:'occupational-health-safety'},
  {term:'Oxygen Safety', def:'Precautions around oxygen, which accelerates combustion', event:'Occupational Health & Safety', slug:'occupational-health-safety'},
  {term:'Repetitive Strain Injury', def:'Tissue damage from repeated motion over time', event:'Occupational Health & Safety', slug:'occupational-health-safety'},
  {term:'Chemical Hygiene Plan', def:'The written plan protecting workers in a laboratory setting', event:'Occupational Health & Safety', slug:'occupational-health-safety'},
  {term:'Whistleblower Protection', def:'Protection from retaliation for reporting a safety concern', event:'Occupational Health & Safety', slug:'occupational-health-safety'},
  {term:'Manual Muscle Testing (MMT)', def:'Grading muscle strength from 0 to 5 by what the muscle can move against', event:'Occupational Therapy', slug:'occupational-therapy'},
  {term:'ADLs vs IADLs', def:'ADLs (Activities of Daily Living)', event:'Occupational Therapy', slug:'occupational-therapy'},
  {term:'Model of Human Occupation (MOHO)', def:'A model of occupation built on volition, habituation and performance capacity', event:'Occupational Therapy', slug:'occupational-therapy'},
  {term:'Joint Protection Principles', def:'Ways to use painful or unstable joints with less stress on them', event:'Occupational Therapy', slug:'occupational-therapy'},
  {term:'Allen Cognitive Level Screen (ACLS)', def:'A leather-lacing task that screens cognitive level on Allen\'s 6-level scale', event:'Occupational Therapy', slug:'occupational-therapy'},
  {term:'Metastasis', def:'Spread of cancer cells from the primary site to distant organs', event:'Oncology', slug:'oncology'},
  {term:'Breast Cancer', def:'Most common female cancer', event:'Oncology', slug:'oncology'},
  {term:'Tumor Markers', def:'Substances measured in blood to track a known cancer', event:'Oncology', slug:'oncology'},
  {term:'Chemotherapy Classes', def:'Alkylating (cyclophosphamide — DNA crosslinks)', event:'Oncology', slug:'oncology'},
  {term:'Hallmarks of Cancer', def:'The six capabilities a normal cell must acquire to become cancer', event:'Oncology', slug:'oncology'},
  {term:'Extraocular Muscles and CN Innervation', def:'Six extraocular muscles control eye movement', event:'Ophthalmology', slug:'ophthalmology'},
  {term:'Strabismus', def:'Misalignment of the visual axes', event:'Ophthalmology', slug:'ophthalmology'},
  {term:'Chemical Eye Injury', def:'Alkali burns penetrate deeper than acid burns and are the more dangerous injury', event:'Ophthalmology', slug:'ophthalmology'},
  {term:'Mydriatic and Cycloplegic Agents', def:'Mydriatics dilate the pupil (phenylephrine — alpha-1 agonist)', event:'Ophthalmology', slug:'ophthalmology'},
  {term:'Tonometry', def:'Measurement of intraocular pressure', event:'Ophthalmology', slug:'ophthalmology'},
  {term:'Retina (Rods and Cones)', def:'The neural layer lining the posterior eye', event:'Optometry', slug:'optometry'},
  {term:'Diabetic Retinopathy', def:'Microvascular complication of diabetes', event:'Optometry', slug:'optometry'},
  {term:'Tonometry', def:'Measurement of intraocular pressure', event:'Optometry', slug:'optometry'},
  {term:'Snellen Visual Acuity', def:'Standard distance acuity test using a chart at 20 ft (6 m)', event:'Optometry', slug:'optometry'},
  {term:'Optic Nerve and Optic Disc', def:'Cranial nerve II carries retinal signals to the brain', event:'Optometry', slug:'optometry'},
  {term:'Epiphysis, Metaphysis, Diaphysis', def:'The epiphysis is the rounded end of a long bone', event:'Orthopedics', slug:'orthopedics'},
  {term:'Osteomyelitis', def:'Bone infection most commonly caused by Staphylococcus aureus', event:'Orthopedics', slug:'orthopedics'},
  {term:'Avascular Necrosis (AVN)', def:'Ischemic death of bone due to loss of blood supply', event:'Orthopedics', slug:'orthopedics'},
  {term:'Total Hip Arthroplasty (THA)', def:'Surgical replacement of the hip joint with a prosthesis', event:'Orthopedics', slug:'orthopedics'},
  {term:'Proprioception and Neuromuscular Training', def:'Proprioception is the sense of joint position and movement', event:'Orthopedics', slug:'orthopedics'},
  {term:'External Ear Anatomy', def:'Auricle (pinna), external auditory canal, tympanic membrane', event:'Otolaryngology (ENT)', slug:'otolaryngology'},
  {term:'Nasal Polyps', def:'Benign edematous outgrowths of nasal/sinus mucosa, often bilateral', event:'Otolaryngology (ENT)', slug:'otolaryngology'},
  {term:'Streptococcal Pharyngitis', def:'Group A strep tonsillopharyngitis', event:'Otolaryngology (ENT)', slug:'otolaryngology'},
  {term:'Otitis Media with Effusion (OME)', def:'Middle ear fluid without acute infection; often follows AOM', event:'Otolaryngology (ENT)', slug:'otolaryngology'},
  {term:'Acute Sinusitis', def:'Inflammation of the paranasal sinuses, usually viral and self-limited', event:'Otolaryngology (ENT)', slug:'otolaryngology'},
  {term:'Topical Analgesics', def:'Lidocaine patch (post-herpetic neuralgia, focal neuropathic)', event:'Pain Management', slug:'pain-management'},
  {term:'Interventional Pain Procedures', def:'Epidural steroid injection (radiculopathy)', event:'Pain Management', slug:'pain-management'},
  {term:'Pain Assessment Scales', def:'Numeric Rating Scale (NRS 0-10) for adults', event:'Pain Management', slug:'pain-management'},
  {term:'Acetaminophen', def:'Centrally acting analgesic and antipyretic; mechanism still debated', event:'Pain Management', slug:'pain-management'},
  {term:'Opioid Equianalgesic Dosing', def:'Conversion table relating doses of different opioids', event:'Pain Management', slug:'pain-management'},
  {term:'SPIKES Protocol for Bad News', def:'A six-step protocol for delivering bad news to a patient', event:'Palliative Care', slug:'palliative-care'},
  {term:'Hospice Eligibility', def:'A life expectancy of six months or less, with comfort chosen over cure', event:'Palliative Care', slug:'palliative-care'},
  {term:'Cancer Pain & Opioid Management', def:'WHO ladder: non-opioid → mild opioid → strong opioid', event:'Palliative Care', slug:'palliative-care'},
  {term:'Advance Directives', def:'Living will: specific written wishes for future medical care', event:'Palliative Care', slug:'palliative-care'},
  {term:'Hospice Levels of Care', def:'The four Medicare hospice levels, from routine home care to general inpatient', event:'Palliative Care', slug:'palliative-care'},
  {term:'Adjourn', def:'A motion to close the meeting', event:'Parliamentary Procedure', slug:'parliamentary-procedure'},
  {term:'Amendment of the Second Degree', def:'An amendment to a pending amendment', event:'Parliamentary Procedure', slug:'parliamentary-procedure'},
  {term:'Parliamentarian', def:'An adviser who counsels the chair on procedure', event:'Parliamentary Procedure', slug:'parliamentary-procedure'},
  {term:'Renewal of a Motion', def:'Making a motion again after it was already disposed of', event:'Parliamentary Procedure', slug:'parliamentary-procedure'},
  {term:'Parliamentary Inquiry', def:'A question to the chair about procedure', event:'Parliamentary Procedure', slug:'parliamentary-procedure'},
  {term:'Hypotension', def:'Abnormally low blood pressure, which may cause dizziness, fainting, or shock', event:'Pathophysiology', slug:'pathophysiology'},
  {term:'Hyperthyroidism', def:'Excess thyroid hormone production causing elevated metabolism', event:'Pathophysiology', slug:'pathophysiology'},
  {term:'Cholelithiasis', def:'Formation of stones (typically cholesterol or pigment) in the gallbladder', event:'Pathophysiology', slug:'pathophysiology'},
  {term:'Thrombocytopenia', def:'Abnormally low platelet count, increasing bleeding risk', event:'Pathophysiology', slug:'pathophysiology'},
  {term:'Melanoma', def:'Aggressive skin cancer originating in melanocytes, with high metastatic potential', event:'Pathophysiology', slug:'pathophysiology'},
  {term:'Just Culture', def:'Balances accountability and a non-punitive learning environment', event:'Patient Safety & Quality', slug:'patient-safety'},
  {term:'Plan-Do-Study-Act (PDSA) Cycle', def:'A rapid quality-improvement loop: Plan, Do, Study, Act', event:'Patient Safety & Quality', slug:'patient-safety'},
  {term:'Patient Bill of Rights', def:'The rights every hospitalised patient holds', event:'Patient Safety & Quality', slug:'patient-safety'},
  {term:'Never Events', def:'Serious, preventable safety incidents that should never happen to a patient', event:'Patient Safety & Quality', slug:'patient-safety'},
  {term:'IHI Triple Aim', def:'Better care, better population health, lower cost — pursued together', event:'Patient Safety & Quality', slug:'patient-safety'},
  {term:'Pediatric Vital Signs by Age', def:'Newborn: HR 100–160, RR 30–60, SBP 60–90', event:'Pediatric Emergency', slug:'pediatric-emergency'},
  {term:'Fever in Infants <3 Months', def:'Higher risk of serious bacterial infection', event:'Pediatric Emergency', slug:'pediatric-emergency'},
  {term:'Kawasaki Disease', def:'Vasculitis of unknown cause, ages <5', event:'Pediatric Emergency', slug:'pediatric-emergency'},
  {term:'Pediatric Assessment Triangle (PAT)', def:'Rapid 30-second visual eval: Appearance, Work of breathing, Circulation to skin. No equipment needed', event:'Pediatric Emergency', slug:'pediatric-emergency'},
  {term:'Bronchiolitis (RSV)', def:'Lower respiratory infection in infants, usually RSV', event:'Pediatric Emergency', slug:'pediatric-emergency'},
  {term:'Asthma (Pediatric)', def:'Most common chronic childhood disease', event:'Pediatrics', slug:'pediatrics'},
  {term:'Developmental Milestones', def:'2 mo: social smile, head up', event:'Pediatrics', slug:'pediatrics'},
  {term:'Otitis Media', def:'Most common pediatric infection', event:'Pediatrics', slug:'pediatrics'},
  {term:'Food Allergies and Anaphylaxis', def:'Top 9: milk, egg, peanut, tree nuts, soy, wheat, fish, shellfish, sesame', event:'Pediatrics', slug:'pediatrics'},
  {term:'Growth Charts', def:'WHO charts for 0-2 years; CDC for 2-20', event:'Pediatrics', slug:'pediatrics'},
  {term:'Dantrolene', def:'The specific pharmacologic treatment for malignant hyperthermia', event:'Perioperative Care', slug:'perioperative-care'},
  {term:'Malignant Hyperthermia (MH)', def:'A hypermetabolic crisis triggered by volatile anesthetics in susceptible people', event:'Perioperative Care', slug:'perioperative-care'},
  {term:'Standard Intraoperative Monitoring', def:'The monitoring required on every patient under anaesthesia', event:'Perioperative Care', slug:'perioperative-care'},
  {term:'DVT/PE Prophylaxis in Surgery', def:'Surgical patients are at increased VTE risk', event:'Perioperative Care', slug:'perioperative-care'},
  {term:'ASA Physical Status Classification', def:'A six-level score rating how sick a patient is before anaesthesia', event:'Perioperative Care', slug:'perioperative-care'},
  {term:'Naloxone (Narcan)', def:'A pure opioid antagonist that rapidly reverses opioid overdose', event:'Pharmacology', slug:'pharmacology'},
  {term:'Antifungals', def:'Drugs targeting fungal cell membranes or wall synthesis', event:'Pharmacology', slug:'pharmacology'},
  {term:'Atropine', def:'A muscarinic (anticholinergic) antagonist', event:'Pharmacology', slug:'pharmacology'},
  {term:'Diuretics', def:'Increase urine output to reduce fluid volume and blood pressure', event:'Pharmacology', slug:'pharmacology'},
  {term:'General Anesthetics', def:'Produce unconsciousness and analgesia for surgical procedures', event:'Pharmacology', slug:'pharmacology'},
  {term:'IV Drip Rate Calculation', def:'mL/hr or gtt/min from a desired dose/time', event:'Pharmacy Science', slug:'pharmacy-science'},
  {term:'Beta-Blockers', def:'Block beta-adrenergic receptors', event:'Pharmacy Science', slug:'pharmacy-science'},
  {term:'Half-Life (t½)', def:'Time required for plasma concentration to decrease by 50%', event:'Pharmacy Science', slug:'pharmacy-science'},
  {term:'Generic vs Brand Name', def:'The generic name is the nonproprietary name', event:'Pharmacy Science', slug:'pharmacy-science'},
  {term:'HIPAA in the Pharmacy', def:'Pharmacies are covered entities', event:'Pharmacy Science', slug:'pharmacy-science'},
  {term:'Tunica Intima, Media, and Adventitia', def:'The three layers of a vein wall', event:'Phlebotomy', slug:'phlebotomy'},
  {term:'Hemolysis', def:'Rupture of red blood cells releasing hemoglobin into plasma', event:'Phlebotomy', slug:'phlebotomy'},
  {term:'Alcohol Prep Pad (70% Isopropyl)', def:'A presoaked pad used to clean the venipuncture site', event:'Phlebotomy', slug:'phlebotomy'},
  {term:'Post-Puncture Care', def:'Pressure, a straight arm, and a bandage after the needle comes out', event:'Phlebotomy', slug:'phlebotomy'},
  {term:'Needlestick Response', def:'What to do immediately after a needlestick', event:'Phlebotomy', slug:'phlebotomy'},
  {term:'Rehabilitation Team & Settings', def:'Who is on a rehabilitation team and where rehabilitation happens', event:'Physical Medicine & Rehabilitation', slug:'physical-medicine-rehabilitation'},
  {term:'Electrodiagnostics (EMG/NCS)', def:'Nerve conduction studies (NCS)', event:'Physical Medicine & Rehabilitation', slug:'physical-medicine-rehabilitation'},
  {term:'Stroke Rehabilitation', def:'Begins as early as 24–48h post-stroke when medically stable', event:'Physical Medicine & Rehabilitation', slug:'physical-medicine-rehabilitation'},
  {term:'Spinal Cord Injury (SCI) Classification', def:'The ASIA scale grading how complete a spinal cord injury is', event:'Physical Medicine & Rehabilitation', slug:'physical-medicine-rehabilitation'},
  {term:'Functional Independence Measure (FIM)', def:'An 18-item scale scoring how much help a patient needs with daily activities', event:'Physical Medicine & Rehabilitation', slug:'physical-medicine-rehabilitation'},
  {term:'Neurological Screening', def:'A quick assessment of upper and lower motor neuron integrity', event:'Physical Therapy', slug:'physical-therapy'},
  {term:'Closed Kinetic Chain (CKC) Exercise', def:'Exercise where the distal segment is fixed against resistance', event:'Physical Therapy', slug:'physical-therapy'},
  {term:'Range of Motion (ROM)', def:'The arc of movement possible at a joint, measured in degrees', event:'Physical Therapy', slug:'physical-therapy'},
  {term:'Phonophoresis', def:'Using ultrasound to drive a topical drug through the skin', event:'Physical Therapy', slug:'physical-therapy'},
  {term:'Fracture', def:'A break in the continuity of a bone', event:'Physical Therapy', slug:'physical-therapy'},
  {term:'Endotracheal Intubation', def:'Definitive airway placement', event:'Pre-Hospital & EMS', slug:'prehospital-ems'},
  {term:'Choking (Heimlich Maneuver)', def:'Conscious adult/child with severe airway obstruction: abdominal thrusts', event:'Pre-Hospital & EMS', slug:'prehospital-ems'},
  {term:'Mass Casualty Incident (MCI)', def:'Event overwhelming local resources', event:'Pre-Hospital & EMS', slug:'prehospital-ems'},
  {term:'Prehospital Stroke Care', def:'Cincinnati Scale: facial droop, arm drift, slurred speech', event:'Pre-Hospital & EMS', slug:'prehospital-ems'},
  {term:'Pediatric BLS CPR', def:'1 rescuer 30:2. 2 rescuers 15:2 in infants/children. Depth ~1.5″ infant, 2″ child', event:'Pre-Hospital & EMS', slug:'prehospital-ems'},
  {term:'Social Anxiety Disorder', def:'Lasting fear of being scrutinised in social situations, causing avoidance', event:'Psychiatry', slug:'psychiatry'},
  {term:'Persistent Depressive Disorder (Dysthymia)', def:'Low-grade depressed mood lasting two years or more', event:'Psychiatry', slug:'psychiatry'},
  {term:'Psychotherapy Modalities', def:'The main evidence-based talk therapies, each matched to particular diagnoses', event:'Psychiatry', slug:'psychiatry'},
  {term:'Antipsychotic Medications', def:'1st gen (typical): haloperidol, chlorpromazine — block D2', event:'Psychiatry', slug:'psychiatry'},
  {term:'Personality Disorders', def:'Enduring inflexible patterns causing distress/impairment', event:'Psychiatry', slug:'psychiatry'},
  {term:'Positive Predictive Value (PPV)', def:'How likely a positive test result is to actually be correct', event:'Public Health', slug:'public-health'},
  {term:'Toxicology', def:'The study of how chemicals and biological agents harm living organisms', event:'Public Health', slug:'public-health'},
  {term:'Morbidity', def:'The rate of illness or disease in a population', event:'Public Health', slug:'public-health'},
  {term:'Global Burden of Disease (GBD)', def:'A worldwide measure of death and disability from major diseases and risk factors', event:'Public Health', slug:'public-health'},
  {term:'Health Education', def:'Teaching people skills and information to help them make healthier decisions', event:'Public Health', slug:'public-health'},
  {term:'Tuberculosis', def:'Mycobacterium tuberculosis — airborne', event:'Pulmonology', slug:'pulmonology'},
  {term:'COPD Exacerbation', def:'Worsened dyspnea, sputum volume, sputum purulence', event:'Pulmonology', slug:'pulmonology'},
  {term:'Pulmonary Hypertension', def:'Mean PA pressure ≥20 mmHg at rest', event:'Pulmonology', slug:'pulmonology'},
  {term:'Pleural Effusion & Light\'s Criteria', def:'Light\'s criteria for exudate (any one)', event:'Pulmonology', slug:'pulmonology'},
  {term:'Asthma', def:'Reversible airway obstruction with hyperresponsiveness', event:'Pulmonology', slug:'pulmonology'},
  {term:'Bone Density and Trabecular Pattern', def:'Normal bone shows a regular trabecular lattice on X-ray', event:'Radiologic Science', slug:'radiologic-science'},
  {term:'Fluoroscopy', def:'Real-time continuous X-ray imaging displayed on a monitor', event:'Radiologic Science', slug:'radiologic-science'},
  {term:'Hand and Wrist Positioning', def:'Standard hand series: PA, lateral, oblique', event:'Radiologic Science', slug:'radiologic-science'},
  {term:'X-ray Tube Components', def:'The parts of an X-ray tube and what each one does', event:'Radiologic Science', slug:'radiologic-science'},
  {term:'Personnel Dosimetry (Film Badge / TLD / OSL)', def:'Workers wear dosimeters to monitor occupational dose', event:'Radiologic Science', slug:'radiologic-science'},
  {term:'Tubal Ligation & Vasectomy', def:'The two permanent surgical sterilization procedures', event:'Reproductive Health', slug:'reproductive-health'},
  {term:'Menstrual Cycle Phases', def:'Follicular phase: variable duration, FSH stimulates follicle growth, estrogen rises', event:'Reproductive Health', slug:'reproductive-health'},
  {term:'Polycystic Ovary Syndrome (PCOS)', def:'Rotterdam criteria (2 of 3)', event:'Reproductive Health', slug:'reproductive-health'},
  {term:'Emergency Contraception', def:'Levonorgestrel 1.5 mg PO (within 72h, OTC, less effective with BMI >30)', event:'Reproductive Health', slug:'reproductive-health'},
  {term:'Menopause', def:'Permanent cessation of menses, defined retrospectively after 12 months of amenorrhea', event:'Reproductive Health', slug:'reproductive-health'},
  {term:'Ventilation/Perfusion (V/Q) Matching', def:'Normal V/Q ≈ 0.8; mismatch causes hypoxemia', event:'Respiratory Therapy', slug:'respiratory-therapy'},
  {term:'Chest X-Ray Findings', def:'Pneumonia: lobar or patchy consolidation, air bronchograms', event:'Respiratory Therapy', slug:'respiratory-therapy'},
  {term:'Pneumothorax', def:'Air in the pleural space causing lung collapse', event:'Respiratory Therapy', slug:'respiratory-therapy'},
  {term:'Suctioning (Open vs Closed)', def:'Removal of secretions from airway', event:'Respiratory Therapy', slug:'respiratory-therapy'},
  {term:'Oxyhemoglobin Dissociation Curve', def:'Sigmoid curve relating PaO2 to SaO2; SaO2 of 50% at PaO2 27 mmHg (P50)', event:'Respiratory Therapy', slug:'respiratory-therapy'},
  {term:'Psoriatic Arthritis', def:'Seronegative spondyloarthritis with psoriasis', event:'Rheumatology', slug:'rheumatology'},
  {term:'Polymyositis and Dermatomyositis', def:'Autoimmune inflammatory myopathies', event:'Rheumatology', slug:'rheumatology'},
  {term:'Common Rheum Labs (ANA, RF, anti-CCP, ESR/CRP)', def:'ANA: screening for lupus, autoimmune', event:'Rheumatology', slug:'rheumatology'},
  {term:'Ankylosing Spondylitis', def:'Inflammatory back pain in young men, HLA-B27 associated', event:'Rheumatology', slug:'rheumatology'},
  {term:'Systemic Sclerosis (Scleroderma)', def:'Fibrosis of skin and internal organs', event:'Rheumatology', slug:'rheumatology'},
  {term:'CPAP (Continuous Positive Airway Pressure)', def:'Mainstay treatment for OSA', event:'Sleep Medicine', slug:'sleep-medicine'},
  {term:'Parasomnias', def:'Abnormal behaviors during sleep', event:'Sleep Medicine', slug:'sleep-medicine'},
  {term:'Sleep Architecture and Aging', def:'Sleep needs: newborns 14-17h, adults 7-9h, elderly 7-8h', event:'Sleep Medicine', slug:'sleep-medicine'},
  {term:'Obstructive Sleep Apnea (OSA)', def:'Recurrent upper airway collapse during sleep → hypoxemia, sleep fragmentation', event:'Sleep Medicine', slug:'sleep-medicine'},
  {term:'Narcolepsy', def:'Excessive daytime sleepiness with rapid REM onset', event:'Sleep Medicine', slug:'sleep-medicine'},
  {term:'Augmentative and Alternative Communication (AAC)', def:'Any method that supplements or replaces spoken communication', event:'Speech-Language Pathology', slug:'speech-language-pathology'},
  {term:'Articulation Disorder', def:'Difficulty producing speech sounds correctly', event:'Speech-Language Pathology', slug:'speech-language-pathology'},
  {term:'Dysphagia Treatment Strategies', def:'Postural: chin tuck, head turn', event:'Speech-Language Pathology', slug:'speech-language-pathology'},
  {term:'Language Development Milestones', def:'12 mo: first words, follows simple commands', event:'Speech-Language Pathology', slug:'speech-language-pathology'},
  {term:'Hearing Loss and Communication', def:'Even mild hearing loss affects language development in children', event:'Speech-Language Pathology', slug:'speech-language-pathology'},
  {term:'Epiphyseal Plate', def:'The cartilage growth plate in a young athlete\'s long bones', event:'Sports Medicine', slug:'sports-medicine'},
  {term:'Lachman Test', def:'The most sensitive clinical test for ACL integrity', event:'Sports Medicine', slug:'sports-medicine'},
  {term:'Exercise-Induced Bronchoconstriction', def:'Airway narrowing brought on by vigorous exercise', event:'Sports Medicine', slug:'sports-medicine'},
  {term:'Fracture', def:'A complete or partial break in a bone', event:'Sports Medicine', slug:'sports-medicine'},
  {term:'Inflammatory Phase', def:'The first healing phase — vasodilation, swelling, pain, warmth, and redness', event:'Sports Medicine', slug:'sports-medicine'},
  {term:'Sterile Principles', def:'Only sterile to sterile contact', event:'Surgical Technology', slug:'surgical-technology'},
  {term:'Instrument Categories', def:'Surgical instruments grouped by what they do', event:'Surgical Technology', slug:'surgical-technology'},
  {term:'Surgical Team Roles', def:'Who does what in the operating room', event:'Surgical Technology', slug:'surgical-technology'},
  {term:'Open vs Laparoscopic Surgery', def:'Open: traditional large incision, direct visualization', event:'Surgical Technology', slug:'surgical-technology'},
  {term:'Ethylene Oxide (EtO) Sterilization', def:'Gas sterilization for heat-sensitive items (endoscopes, plastics)', event:'Surgical Technology', slug:'surgical-technology'},
  {term:'Naloxone', def:'Opioid receptor antagonist', event:'Toxicology', slug:'toxicology'},
  {term:'Tricyclic Antidepressant Overdose', def:'Anticholinergic + alpha-blockade + sodium channel block', event:'Toxicology', slug:'toxicology'},
  {term:'Cholinergic Toxidrome (SLUDGE)', def:'Salivation, Lacrimation, Urination, Defecation, GI upset, Emesis', event:'Toxicology', slug:'toxicology'},
  {term:'Flumazenil', def:'Benzodiazepine receptor antagonist', event:'Toxicology', slug:'toxicology'},
  {term:'Carbon Monoxide Poisoning', def:'Binds hemoglobin 200× more than O2 → impaired O2 delivery', event:'Toxicology', slug:'toxicology'},
  {term:'Presumed Consent vs Opt-In Systems', def:'Opt-in (U.S., U.K.): individuals must affirmatively register as donors', event:'Transplant Medicine', slug:'transplant-medicine'},
  {term:'Tolerance vs Sensitization', def:'Donor-specific unresponsiveness without ongoing immunosuppression', event:'Transplant Medicine', slug:'transplant-medicine'},
  {term:'MELD Score', def:'Model for End-stage Liver Disease', event:'Transplant Medicine', slug:'transplant-medicine'},
  {term:'Opportunistic Infections in Transplant', def:'Immunosuppression creates susceptibility to opportunistic infections', event:'Transplant Medicine', slug:'transplant-medicine'},
  {term:'Chronic Allograft Injury', def:'Slow, irreversible loss of graft function over months to years', event:'Transplant Medicine', slug:'transplant-medicine'},
  {term:'Family Communication in ICU', def:'Frequent family meetings essential', event:'Trauma & Critical Care', slug:'trauma-critical-care'},
  {term:'Crystalloid vs Colloid Resuscitation', def:'Crystalloids (LR, NS): cheap, effective, first-line', event:'Trauma & Critical Care', slug:'trauma-critical-care'},
  {term:'Hemorrhagic Shock Classification', def:'Class I: <15% blood loss (750 mL), normal vitals', event:'Trauma & Critical Care', slug:'trauma-critical-care'},
  {term:'ARDS (Acute Respiratory Distress Syndrome)', def:'Acute non-cardiogenic pulmonary edema', event:'Trauma & Critical Care', slug:'trauma-critical-care'},
  {term:'Shock Classification', def:'Distributive (septic, anaphylactic, neurogenic — vasodilation)', event:'Trauma & Critical Care', slug:'trauma-critical-care'},
  {term:'Cryptorchidism', def:'Undescended testis at birth', event:'Urology', slug:'urology'},
  {term:'Benign Prostatic Hyperplasia (BPH)', def:'Enlarged prostate common in men >50', event:'Urology', slug:'urology'},
  {term:'Prostate Cancer', def:'Most common cancer in men', event:'Urology', slug:'urology'},
  {term:'Common Urology Tests', def:'Urinalysis (dipstick + microscopy)', event:'Urology', slug:'urology'},
  {term:'Acute Urinary Retention', def:'Sudden inability to void with painful distended bladder', event:'Urology', slug:'urology'},
  {term:'Direct Oral Anticoagulants (DOACs)', def:'Factor Xa inhibitors: apixaban, rivaroxaban, edoxaban', event:'Vascular Medicine', slug:'vascular-medicine'},
  {term:'Abdominal Aortic Aneurysm (AAA)', def:'Focal aortic dilation ≥3 cm', event:'Vascular Medicine', slug:'vascular-medicine'},
  {term:'Deep Vein Thrombosis (DVT)', def:'Thrombus in deep veins, usually lower extremities', event:'Vascular Medicine', slug:'vascular-medicine'},
  {term:'Warfarin', def:'Vitamin K antagonist — inhibits factors II, VII, IX, X, proteins C/S', event:'Vascular Medicine', slug:'vascular-medicine'},
  {term:'Giant Cell Arteritis', def:'Vasculitis of medium/large arteries in patients >50', event:'Vascular Medicine', slug:'vascular-medicine'},
  {term:'Withers', def:'The ridge between the shoulder blades of horses and dogs', event:'Veterinary Science', slug:'veterinary-science'},
  {term:'Foot-and-Mouth Disease (FMD)', def:'A highly contagious vesicular disease of cloven-hoofed livestock', event:'Veterinary Science', slug:'veterinary-science'},
  {term:'AAFCO', def:'The Association of American Feed Control Officials', event:'Veterinary Science', slug:'veterinary-science'},
  {term:'Toxoplasmosis (Toxoplasma gondii)', def:'A protozoan parasite for which cats are the definitive host', event:'Veterinary Science', slug:'veterinary-science'},
  {term:'Lidocaine', def:'A local anesthetic and class IB antiarrhythmic', event:'Veterinary Science', slug:'veterinary-science'},
  {term:'Tick-Borne Illness', def:'Infections spread by tick bites', event:'Wilderness Medicine', slug:'wilderness-medicine'},
  {term:'Hypothermia', def:'Core temperature below 35°C', event:'Wilderness Medicine', slug:'wilderness-medicine'},
  {term:'STOP Protocol (Wilderness Navigation)', def:'When lost or in an emergency', event:'Wilderness Medicine', slug:'wilderness-medicine'},
  {term:'Water Purification in the Field', def:'Methods: boiling (1 minute, 3 min at high altitude) is most reliable', event:'Wilderness Medicine', slug:'wilderness-medicine'},
  {term:'Improvised Splinting', def:'Splinting a limb in the field using whatever materials are at hand', event:'Wilderness Medicine', slug:'wilderness-medicine'},
  {term:'Wound Assessment Parameters', def:'The standard set of things documented every time a wound is assessed', event:'Wound Care', slug:'wound-care'},
  {term:'Rule of Nines', def:'A quick way to estimate what percentage of the body a burn covers', event:'Wound Care', slug:'wound-care'},
  {term:'Nutrition and Wound Healing', def:'The nutrients a wound needs to heal', event:'Wound Care', slug:'wound-care'},
  {term:'Pressure Injury Staging (NPIAP)', def:'Stage 1: non-blanchable erythema, intact skin', event:'Wound Care', slug:'wound-care'},
  {term:'Compression Therapy for Venous Ulcers', def:'The cornerstone of venous leg ulcer treatment', event:'Wound Care', slug:'wound-care'},
];
window.HOSA_TERMS = HOSA_TERMS;

/* ═══════════════════════════════════════════════════════════════
   XP FLYUP — global utility
   ═══════════════════════════════════════════════════════════════ */
window.hosaXPFlyup = function(el, amount) {
  var rect = el ? el.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
  var node = document.createElement('div');
  node.className = 'xp-flyup';
  node.textContent = '+' + amount + ' XP';
  node.style.left = (rect.left + rect.width / 2 - 32) + 'px';
  node.style.top  = (rect.top + window.scrollY - 10) + 'px';
  document.body.appendChild(node);
  setTimeout(function() { if (node.parentNode) node.parentNode.removeChild(node); }, 1400);
};

/* ═══════════════════════════════════════════════════════════════
   DAILY CHALLENGE
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var STORAGE_KEY = 'hosa::daily-challenge';
  var XP_PER_CORRECT = 30; // 2x of normal 15
  var QUESTIONS_PER_DAY = 5;

  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch(e) { return null; }
  }
  function saveState(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch(e) {}
  }

  /* Seeded random using date string so everyone gets same questions per day */
  function seededRand(seed, max) {
    var x = Math.sin(seed + 1) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  }
  function selectDailyTerms(dateKey) {
    var pool = window.HOSA_TERMS || [];
    if (!pool.length) return [];
    var seed = 0;
    for (var i = 0; i < dateKey.length; i++) seed += dateKey.charCodeAt(i);
    var indices = [], used = {};
    var attempts = 0;
    while (indices.length < QUESTIONS_PER_DAY && attempts < 200) {
      var idx = seededRand(seed + attempts, pool.length);
      if (!used[idx]) { used[idx] = true; indices.push(idx); }
      attempts++;
    }
    return indices.map(function(i) { return pool[i]; });
  }
  function buildChoices(correct, allTerms, seed) {
    var choices = [correct.term];
    var used = {};
    used[correct.term] = true;
    var attempts = 0;
    while (choices.length < 4 && attempts < 300) {
      var idx = seededRand(seed + attempts + 77, allTerms.length);
      var t = allTerms[idx].term;
      if (!used[t]) { used[t] = true; choices.push(t); }
      attempts++;
    }
    // Shuffle choices (seeded)
    for (var i = choices.length - 1; i > 0; i--) {
      var j = seededRand(seed + i * 13, i + 1);
      var tmp = choices[i]; choices[i] = choices[j]; choices[j] = tmp;
    }
    return choices;
  }

  var questions = [], currentQ = 0, score = 0, answered = false;
  var state = null;

  function init() {
    var today = todayKey();
    state = loadState();

    if (!state || state.date !== today) {
      var terms = selectDailyTerms(today);
      if (!terms.length) return;
      state = { date: today, score: 0, current: 0, done: false, answers: [] };
      saveState(state);
    }

    questions = selectDailyTerms(state.date);
    currentQ = state.current;
    score = state.score;
    answered = false;

    if (state.done) {
      renderComplete();
    } else {
      renderQuestion();
    }
    startCountdown();
  }

  function renderQuestion() {
    var card = document.getElementById('dc-card');
    if (!card || !questions.length) return;
    var q = questions[currentQ];
    if (!q) { renderComplete(); return; }
    var today = todayKey();
    var seed = 0;
    for (var i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    var choices = buildChoices(q, window.HOSA_TERMS || [], seed + currentQ * 31);

    var segs = '';
    for (var s = 0; s < QUESTIONS_PER_DAY; s++) {
      segs += '<div class="dc-prog-seg' + (s < currentQ ? ' done' : '') + '"></div>';
    }

    var letters = ['A', 'B', 'C', 'D'];
    var opts = choices.map(function(ch, idx) {
      return '<button class="dc-opt" data-ans="' + ch.replace(/"/g,'&quot;') + '">' +
        '<span class="dc-opt-letter">' + letters[idx] + '</span>' + ch + '</button>';
    }).join('');

    card.innerHTML =
      '<div class="dc-progress-bar">' + segs + '</div>' +
      '<div class="dc-q-wrap">' +
        '<div class="dc-q-meta">Question ' + (currentQ + 1) + ' of ' + QUESTIONS_PER_DAY + ' · What term matches this definition?</div>' +
        '<div class="dc-q-text">' + q.def + '</div>' +
        '<div class="dc-q-event">from ' + q.event + '</div>' +
        '<div class="dc-opts">' + opts + '</div>' +
      '</div>' +
      '<div class="dc-feedback" id="dc-feedback"></div>';

    card.querySelectorAll('.dc-opt').forEach(function(btn) {
      btn.addEventListener('click', function() { handleAnswer(btn.getAttribute('data-ans'), q.term, btn); });
    });
    answered = false;
  }

  function handleAnswer(chosen, correct, btn) {
    if (answered) return;
    answered = true;

    var isCorrect = chosen === correct;
    var fb = document.getElementById('dc-feedback');
    var opts = document.querySelectorAll('.dc-opt');

    opts.forEach(function(b) {
      b.disabled = true;
      if (b.getAttribute('data-ans') === correct) b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
    });

    if (isCorrect) {
      score++;
      if (fb) { fb.className = 'dc-feedback correct'; fb.textContent = '✓ Correct! +' + XP_PER_CORRECT + ' XP'; }
      if (window.hosaXPFlyup) window.hosaXPFlyup(btn, XP_PER_CORRECT);
      try {
        var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
        localStorage.setItem('hosa::xp', String(xp + XP_PER_CORRECT));
      } catch(e) {}
    } else {
      if (fb) { fb.className = 'dc-feedback wrong'; fb.textContent = '✗ The answer was: ' + correct; }
    }

    state.score = score;
    state.current = currentQ + 1;
    state.answers.push({ q: currentQ, correct: isCorrect });
    saveState(state);

    // Track activity
    try {
      var act = JSON.parse(localStorage.getItem('hosa::activity') || '[]');
      var today = todayKey();
      if (act.indexOf(today) === -1) act.push(today);
      localStorage.setItem('hosa::activity', JSON.stringify(act));
    } catch(e) {}

    setTimeout(function() {
      currentQ++;
      if (currentQ >= QUESTIONS_PER_DAY) {
        state.done = true;
        saveState(state);
        // Check daily challenge achievements
        if (window.hosaCheckDCComplete) window.hosaCheckDCComplete(score);
        renderComplete();
      } else {
        renderQuestion();
      }
    }, 1600);
  }

  function renderComplete() {
    var card = document.getElementById('dc-card');
    if (!card) return;
    var icons = ['😐','🙂','😊','😄','🔥','⚡'];
    var icon = icons[Math.min(score, 5)];
    var titles = ['Keep going!', 'Decent start.', 'Solid effort.', 'Nice work!', 'Great job!', 'Perfect!'];
    var title = titles[Math.min(score, 5)];
    var total = score * XP_PER_CORRECT;
    card.innerHTML =
      '<div class="dc-complete">' +
        '<div class="dc-complete-icon">' + icon + '</div>' +
        '<div class="dc-complete-title">' + title + '</div>' +
        '<div class="dc-complete-sub">' + score + ' of ' + QUESTIONS_PER_DAY + ' correct</div>' +
        '<div class="dc-complete-score">' + score + '/' + QUESTIONS_PER_DAY + '</div>' +
        '<div class="dc-complete-xp">+' + total + ' XP earned</div>' +
      '</div>';
    var timerWrap = document.getElementById('dc-timer-wrap');
    if (timerWrap) timerWrap.style.display = '';
    if (score === QUESTIONS_PER_DAY && window._fireConfetti) window._fireConfetti();
  }

  function startCountdown() {
    var val = document.getElementById('dc-timer-val');
    if (!val) return;
    function update() {
      var now = new Date();
      var tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      var diff = Math.floor((tomorrow - now) / 1000);
      var h = Math.floor(diff / 3600);
      var m = Math.floor((diff % 3600) / 60);
      var s = diff % 60;
      val.textContent = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      if (state && state.done) {
        var timerWrap = document.getElementById('dc-timer-wrap');
        if (timerWrap) timerWrap.style.display = '';
      }
    }
    update();
    setInterval(update, 1000);
  }

  // Expose for achievement checking
  window.hosaCheckDCComplete = null; // will be set by engage.js

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(init, 100);
  });
  if (document.readyState !== 'loading') setTimeout(init, 100);
})();

/* ═══════════════════════════════════════════════════════════════
   ACTIVITY HEATMAP
   ═══════════════════════════════════════════════════════════════ */
(function() {
  function getActivityMap() {
    try {
      var raw = JSON.parse(localStorage.getItem('hosa::activity') || '[]');
      var map = {};
      raw.forEach(function(d) { map[d] = (map[d] || 0) + 1; });
      return map;
    } catch(e) { return {}; }
  }

  function render() {
    var section = document.getElementById('heatmap-section');
    var actMap = getActivityMap();
    var dates = Object.keys(actMap);

    // Also count days where any daily:: key has data (from existing tracking)
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.startsWith('hosa::daily::')) {
          var d = k.slice(13);
          if (d && parseInt(localStorage.getItem(k), 10) > 0) {
            actMap[d] = (actMap[d] || 0) + parseInt(localStorage.getItem(k), 10);
            if (dates.indexOf(d) === -1) dates.push(d);
          }
        }
      }
    } catch(e) {}

    if (dates.length === 0 || !section) return;
    section.style.display = '';

    var cols = document.getElementById('hm-cols');
    var daysEl = document.getElementById('hm-days');
    var monthsEl = document.getElementById('hm-months');
    if (!cols || !daysEl || !monthsEl) return;

    var WEEKS = 13;
    var today = new Date();
    today.setHours(23, 59, 59, 999);

    // Start from WEEKS*7 days ago, aligned to Sunday
    var startDate = new Date(today);
    startDate.setDate(today.getDate() - (WEEKS * 7 - 1));

    // Day labels (Mon, Wed, Fri)
    daysEl.innerHTML = '';
    var dayNames = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    dayNames.forEach(function(label) {
      var el = document.createElement('div');
      el.className = 'hm-day-label';
      el.textContent = label;
      daysEl.appendChild(el);
    });

    var maxVal = Math.max.apply(null, dates.map(function(d) { return actMap[d] || 0; }));

    cols.innerHTML = '';
    var monthsSeen = {};
    var monthPositions = [];
    var weekIdx = 0;

    for (var w = 0; w < WEEKS; w++) {
      var col = document.createElement('div');
      col.className = 'hm-col';
      for (var d = 0; d < 7; d++) {
        var cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + w * 7 + d);
        var key = cellDate.toISOString().slice(0, 10);
        var val = actMap[key] || 0;
        var level = 0;
        if (val > 0) {
          if (maxVal <= 1) level = 4;
          else if (val >= maxVal * 0.75) level = 4;
          else if (val >= maxVal * 0.50) level = 3;
          else if (val >= maxVal * 0.25) level = 2;
          else level = 1;
        }
        var cell = document.createElement('div');
        cell.className = 'hm-cell';
        if (level > 0) cell.setAttribute('data-level', level);
        cell.title = key + (val ? ': ' + val + ' session' + (val > 1 ? 's' : '') : ': no activity');
        col.appendChild(cell);

        // Track month label positions
        if (cellDate <= today) {
          var month = cellDate.getMonth();
          var year = cellDate.getFullYear();
          var monthKey = year + '-' + month;
          if (!monthsSeen[monthKey]) {
            monthsSeen[monthKey] = true;
            monthPositions.push({ w: w, month: month });
          }
        }
      }
      cols.appendChild(col);
    }

    // Render month labels
    var MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    monthsEl.innerHTML = '';
    var lastW = -3;
    monthPositions.forEach(function(mp) {
      if (mp.w - lastW < 2) return; // avoid crowding
      lastW = mp.w;
      var span = document.createElement('span');
      span.className = 'hm-month-label';
      span.textContent = MONTH_NAMES[mp.month];
      span.style.width = '52px'; // roughly 4 cells wide
      monthsEl.appendChild(span);
    });
  }

  document.addEventListener('DOMContentLoaded', function() { setTimeout(render, 300); });
  if (document.readyState !== 'loading') setTimeout(render, 300);
})();

/* ═══════════════════════════════════════════════════════════════
   GLOBAL TERM SEARCH
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = document.getElementById('gsearch-overlay');
  var input   = document.getElementById('gsearch-input');
  var results = document.getElementById('gsearch-results');
  var closeBtn = document.getElementById('gsearch-close');
  if (!overlay || !input) return;

  function open() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    renderResults('');
    setTimeout(function() { input.focus(); }, 40);
  }
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  window.__hosaOpenSearch = open;

  function highlight(text, q) {
    if (!q) return text;
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function renderResults(q) {
    var pool = window.HOSA_TERMS || [];
    q = q.trim().toLowerCase();
    var matches;
    if (!q) {
      matches = pool.slice(0, 20);
    } else {
      matches = pool.filter(function(t) {
        return t.term.toLowerCase().indexOf(q) >= 0 ||
               t.def.toLowerCase().indexOf(q) >= 0 ||
               t.event.toLowerCase().indexOf(q) >= 0;
      }).sort(function(a, b) {
        var ai = a.term.toLowerCase().indexOf(q);
        var bi = b.term.toLowerCase().indexOf(q);
        if (ai === 0 && bi !== 0) return -1;
        if (bi === 0 && ai !== 0) return 1;
        return 0;
      }).slice(0, 25);
    }

    results.innerHTML = '';
    if (!matches.length) {
      var em = document.createElement('div');
      em.className = 'gsearch-empty';
      em.textContent = q ? 'No terms found for "' + q + '"' : 'Start typing to search…';
      results.appendChild(em);
      return;
    }

    // Group by event
    var byEvent = {};
    matches.forEach(function(t) {
      if (!byEvent[t.event]) byEvent[t.event] = [];
      byEvent[t.event].push(t);
    });

    Object.keys(byEvent).forEach(function(eventName) {
      var h = document.createElement('div');
      h.className = 'gsearch-section-h';
      h.textContent = eventName;
      results.appendChild(h);

      byEvent[eventName].forEach(function(t) {
        var a = document.createElement('a');
        a.href = t.slug + '.html';
        a.className = 'gsearch-result';
        a.innerHTML =
          '<div class="gs-body">' +
            '<div class="gs-term">' + highlight(t.term, q) + '</div>' +
            '<div class="gs-def">' + t.def + '</div>' +
            '<span class="gs-event-tag">' + t.event + '</span>' +
          '</div>' +
          '<span class="gs-arrow">→</span>';
        a.addEventListener('click', function() { close(); });
        results.appendChild(a);
      });
    });
  }

  input.addEventListener('input', function() { renderResults(input.value); });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      if (overlay.classList.contains('open')) close(); else open();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) { e.preventDefault(); close(); }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   STREAK FREEZE TOKENS — shown in home stats bar
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var MAX_TOKENS = 3;
  var XP_PER_TOKEN = 750;

  function getTokens() {
    try { return parseInt(localStorage.getItem('hosa::freeze-tokens') || '0', 10); } catch(e) { return 0; }
  }
  function setTokens(n) {
    try { localStorage.setItem('hosa::freeze-tokens', String(Math.max(0, Math.min(MAX_TOKENS, n)))); } catch(e) {}
  }

  function syncTokens() {
    var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
    var earned = Math.min(MAX_TOKENS, Math.floor(xp / XP_PER_TOKEN));
    var current = getTokens();
    if (earned > current) setTokens(earned);
  }

  function renderTokens() {
    var statBar = document.getElementById('home-stats-bar');
    if (!statBar) return;
    if (document.getElementById('hs-freeze')) return; // already rendered
    var tokens = getTokens();
    if (tokens === 0) return;
    var wrap = document.createElement('div');
    wrap.className = 'hs-stat';
    wrap.id = 'hs-freeze';
    var inner = document.createElement('div');
    var label = document.createElement('div');
    label.className = 'hs-freeze-label hs-stat-label';
    label.style.marginBottom = '4px';
    label.textContent = 'Streak Freeze';
    var tokenRow = document.createElement('div');
    tokenRow.className = 'hs-freeze-wrap';
    for (var i = 0; i < MAX_TOKENS; i++) {
      var t = document.createElement('span');
      t.className = 'hs-freeze-token' + (i >= tokens ? ' empty' : '');
      t.title = i < tokens ? 'Active freeze token' : 'Locked — earn more XP';
      t.textContent = '🧊';
      tokenRow.appendChild(t);
    }
    inner.appendChild(label);
    inner.appendChild(tokenRow);
    wrap.appendChild(inner);
    statBar.insertBefore(wrap, statBar.lastElementChild);
  }

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() { syncTokens(); renderTokens(); }, 500);
  });
  if (document.readyState !== 'loading') setTimeout(function() { syncTokens(); renderTokens(); }, 500);
})();

/* ═══════════════════════════════════════════════════════════════
   MOCK FINAL EXAM
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var QUESTIONS_TOTAL = 15;
  var SECONDS_TOTAL = 7 * 60; // 7 minutes
  var BEST_KEY = 'hosa::mfe-best';

  var state = null; // { questions:[], answers:[], current, startedAt, timeLeft }
  var tickInterval = null;

  function pickRandom(pool, n) {
    var copy = pool.slice();
    var picked = [];
    while (picked.length < n && copy.length) {
      var idx = Math.floor(Math.random() * copy.length);
      picked.push(copy.splice(idx, 1)[0]);
    }
    return picked;
  }
  function makeChoices(correct, pool) {
    var choices = [correct.term];
    var used = {}; used[correct.term] = true;
    var attempts = 0;
    while (choices.length < 4 && attempts < 300) {
      var c = pool[Math.floor(Math.random() * pool.length)];
      if (!used[c.term]) { used[c.term] = true; choices.push(c.term); }
      attempts++;
    }
    // Shuffle
    for (var i = choices.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = choices[i]; choices[i] = choices[j]; choices[j] = t;
    }
    return choices;
  }

  function startExam() {
    var pool = window.HOSA_TERMS || [];
    if (pool.length < QUESTIONS_TOTAL) return;
    var questions = pickRandom(pool, QUESTIONS_TOTAL).map(function(q) {
      return { term: q.term, def: q.def, event: q.event, slug: q.slug, choices: makeChoices(q, pool) };
    });
    state = {
      questions: questions,
      answers: new Array(QUESTIONS_TOTAL).fill(null),
      current: 0,
      startedAt: Date.now(),
      timeLeft: SECONDS_TOTAL,
    };
    renderExam();
    startTick();
  }

  function startTick() {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(function() {
      var elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
      state.timeLeft = Math.max(0, SECONDS_TOTAL - elapsed);
      updateTimer();
      if (state.timeLeft === 0) {
        clearInterval(tickInterval);
        tickInterval = null;
        finishExam();
      }
    }, 1000);
  }

  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function updateTimer() {
    var t = document.getElementById('mfe-timer');
    if (!t) return;
    t.textContent = fmtTime(state.timeLeft);
    t.classList.remove('warning', 'critical');
    if (state.timeLeft <= 30) t.classList.add('critical');
    else if (state.timeLeft <= 60) t.classList.add('warning');
  }

  function renderExam() {
    var card = document.getElementById('mfe-card');
    if (!card || !state) return;
    var q = state.questions[state.current];
    var letters = ['A', 'B', 'C', 'D'];
    var pct = (state.current / QUESTIONS_TOTAL) * 100;

    var opts = q.choices.map(function(ch, idx) {
      var sel = state.answers[state.current] === ch ? ' selected' : '';
      return '<button class="mfe-opt' + sel + '" data-ans="' + ch.replace(/"/g,'&quot;') + '">' +
        '<span class="mfe-opt-letter">' + letters[idx] + '</span>' + ch + '</button>';
    }).join('');

    var answeredCount = state.answers.filter(function(a){ return a !== null; }).length;

    card.innerHTML =
      '<div class="mfe-active">' +
        '<div class="mfe-topbar">' +
          '<div class="mfe-q-count">Question <strong>' + (state.current + 1) + '</strong> of ' + QUESTIONS_TOTAL + ' · ' + answeredCount + ' answered</div>' +
          '<div class="mfe-timer" id="mfe-timer">' + fmtTime(state.timeLeft) + '</div>' +
        '</div>' +
        '<div class="mfe-pbar-track"><div class="mfe-pbar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="mfe-q">' +
          '<div class="mfe-q-meta">Which term matches this definition?</div>' +
          '<div class="mfe-q-text">' + q.def + '</div>' +
          '<div class="mfe-q-event">from ' + q.event + '</div>' +
          '<div class="mfe-opts">' + opts + '</div>' +
        '</div>' +
        '<div class="mfe-nav">' +
          '<button class="mfe-btn-nav" id="mfe-prev"' + (state.current === 0 ? ' disabled' : '') + '>← Previous</button>' +
          (state.current === QUESTIONS_TOTAL - 1
            ? '<button class="mfe-btn-submit" id="mfe-submit">Submit exam</button>'
            : '<button class="mfe-btn-nav" id="mfe-next">Next →</button>') +
        '</div>' +
      '</div>';

    updateTimer();

    card.querySelectorAll('.mfe-opt').forEach(function(b) {
      b.addEventListener('click', function() {
        state.answers[state.current] = b.getAttribute('data-ans');
        // Update visual selection without full re-render
        card.querySelectorAll('.mfe-opt').forEach(function(o) { o.classList.remove('selected'); });
        b.classList.add('selected');
        // Update answered count
        var ac = state.answers.filter(function(a){ return a !== null; }).length;
        var qc = card.querySelector('.mfe-q-count');
        if (qc) qc.innerHTML = 'Question <strong>' + (state.current + 1) + '</strong> of ' + QUESTIONS_TOTAL + ' · ' + ac + ' answered';
      });
    });
    var prev = document.getElementById('mfe-prev');
    if (prev) prev.addEventListener('click', function() {
      if (state.current > 0) { state.current--; renderExam(); }
    });
    var next = document.getElementById('mfe-next');
    if (next) next.addEventListener('click', function() {
      if (state.current < QUESTIONS_TOTAL - 1) { state.current++; renderExam(); }
    });
    var submit = document.getElementById('mfe-submit');
    if (submit) submit.addEventListener('click', function() {
      var unanswered = state.answers.filter(function(a){ return a === null; }).length;
      if (unanswered > 0) {
        var confirmed = window.confirm(unanswered + ' question' + (unanswered > 1 ? 's' : '') + ' left blank. Submit anyway?');
        if (!confirmed) return;
      }
      finishExam();
    });
  }

  function finishExam() {
    if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
    var correct = 0;
    state.questions.forEach(function(q, i) {
      if (state.answers[i] === q.term) correct++;
    });
    var incorrect = QUESTIONS_TOTAL - correct;
    var unanswered = state.answers.filter(function(a){ return a === null; }).length;
    var pct = Math.round(correct / QUESTIONS_TOTAL * 100);
    var elapsed = SECONDS_TOTAL - state.timeLeft;

    // XP: 10 per correct + 50 bonus if all correct + 25 bonus if pct >= 80
    var xpEarned = correct * 10;
    if (correct === QUESTIONS_TOTAL) xpEarned += 50;
    else if (pct >= 80) xpEarned += 25;

    try {
      var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
      localStorage.setItem('hosa::xp', String(xp + xpEarned));
    } catch(e) {}

    // Update best score
    var best = null;
    try { best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch(e) {}
    var isNewBest = !best || pct > best.pct || (pct === best.pct && elapsed < best.time);
    if (isNewBest) {
      try { localStorage.setItem(BEST_KEY, JSON.stringify({ pct: pct, score: correct, time: elapsed, date: new Date().toISOString().slice(0,10) })); } catch(e) {}
    }

    // Track activity
    try {
      var act = JSON.parse(localStorage.getItem('hosa::activity') || '[]');
      var today = new Date().toISOString().slice(0,10);
      if (act.indexOf(today) === -1) { act.push(today); localStorage.setItem('hosa::activity', JSON.stringify(act)); }
    } catch(e) {}

    // Grade
    var grade;
    if (pct >= 93) grade = 'A';
    else if (pct >= 85) grade = 'A−';
    else if (pct >= 77) grade = 'B+';
    else if (pct >= 70) grade = 'B';
    else if (pct >= 60) grade = 'C';
    else grade = 'D';

    var card = document.getElementById('mfe-card');
    if (!card) return;
    card.innerHTML =
      '<div class="mfe-result">' +
        '<div class="mfe-result-grade">' + grade + '</div>' +
        '<div class="mfe-result-score">' + correct + ' / ' + QUESTIONS_TOTAL + ' correct</div>' +
        '<div class="mfe-result-pct">' + pct + '% · finished in ' + fmtTime(elapsed) + (isNewBest && best ? ' · new best!' : '') + '</div>' +
        '<div class="mfe-result-stats">' +
          '<div class="mfe-stat-item"><div class="mfe-stat-num good">' + correct + '</div><div class="mfe-stat-label">Correct</div></div>' +
          '<div class="mfe-stat-item"><div class="mfe-stat-num bad">' + incorrect + '</div><div class="mfe-stat-label">Wrong</div></div>' +
          '<div class="mfe-stat-item"><div class="mfe-stat-num">' + unanswered + '</div><div class="mfe-stat-label">Blank</div></div>' +
        '</div>' +
        '<div class="mfe-xp-pill">+' + xpEarned + ' XP earned</div>' +
        '<div class="mfe-actions">' +
          '<button class="mfe-btn-primary" id="mfe-again">Take it again</button>' +
          '<button class="mfe-btn-secondary" id="mfe-review">Review answers</button>' +
        '</div>' +
      '</div>';

    if (window._fireConfetti && pct >= 80) window._fireConfetti();
    if (window.hosaCheckMFE) window.hosaCheckMFE(correct, QUESTIONS_TOTAL);

    document.getElementById('mfe-again').addEventListener('click', resetIntro);
    document.getElementById('mfe-review').addEventListener('click', function() { showReview(); });
  }

  function showReview() {
    var card = document.getElementById('mfe-card');
    if (!card) return;
    var rows = state.questions.map(function(q, i) {
      var your = state.answers[i] || '(blank)';
      var ok = state.answers[i] === q.term;
      var color = ok ? 'var(--success)' : 'var(--error)';
      return '<div style="padding:14px 0;border-bottom:1px solid var(--rule);">' +
        '<div style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:12px;color:var(--ink-faint);margin-bottom:6px;">Q' + (i+1) + ' · ' + q.event + '</div>' +
        '<div style="font-family:\'Source Serif 4\',serif;font-size:14px;color:var(--ink);line-height:1.5;margin-bottom:8px;">' + q.def + '</div>' +
        '<div style="font-family:\'Geist Mono\',monospace,sans-serif;font-size:11px;letter-spacing:0.04em;color:' + color + ';">' +
          (ok ? '✓ ' : '✗ ') + 'You: ' + your +
        '</div>' +
        (ok ? '' : '<div style="font-family:\'Geist Mono\',monospace,sans-serif;font-size:11px;letter-spacing:0.04em;color:var(--success);margin-top:3px;">✓ Correct: ' + q.term + '</div>') +
        '</div>';
    }).join('');
    card.innerHTML =
      '<div style="padding:24px 28px 28px;">' +
        '<div style="font-family:\'Geist Mono\',monospace,sans-serif;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:6px;">Answer review</div>' +
        '<h3 style="font-family:\'Fraunces\',serif;font-size:24px;font-weight:400;letter-spacing:-0.02em;margin:0 0 14px;">Question-by-question</h3>' +
        rows +
        '<div style="margin-top:20px;text-align:center;"><button class="mfe-btn-secondary" id="mfe-back-intro">Back to start</button></div>' +
      '</div>';
    document.getElementById('mfe-back-intro').addEventListener('click', resetIntro);
  }

  function resetIntro() {
    state = null;
    var card = document.getElementById('mfe-card');
    if (!card) return;
    var best = null;
    try { best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch(e) {}
    var bestHtml = best
      ? '<div class="mfe-best">Best score · <strong>' + best.pct + '%</strong> in ' + fmtTime(best.time) + '</div>'
      : '';
    card.innerHTML =
      '<div class="mfe-intro">' +
        '<p class="mfe-intro-text">A simulated HOSA-style exam pulling 15 random questions from across every event. Beat the timer, beat your last score.</p>' +
        bestHtml +
        '<button class="mfe-btn-start" id="mfe-start" type="button">' + (best ? 'Start new exam →' : 'Start exam →') + '</button>' +
      '</div>';
    document.getElementById('mfe-start').addEventListener('click', startExam);
  }

  function init() {
    var startBtn = document.getElementById('mfe-start');
    if (startBtn) startBtn.addEventListener('click', startExam);
    // Restore best score display
    try {
      var best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null');
      if (best) {
        var b = document.getElementById('mfe-best');
        if (b) {
          b.innerHTML = 'Best score · <strong>' + best.pct + '%</strong> in ' + fmtTime(best.time);
          b.style.display = 'inline-flex';
        }
      }
    } catch(e) {}
  }

  document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 100); });
  if (document.readyState !== 'loading') setTimeout(init, 100);
})();

/* ═══════════════════════════════════════════════════════════════
   TERM BOOKMARKS — star button in global search + home widget
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var KEY = 'hosa::bookmarks';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e) { return []; }
  }
  function save(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch(e) {}
  }
  function isBookmarked(term) { return load().indexOf(term) !== -1; }
  function toggle(term) {
    var arr = load();
    var idx = arr.indexOf(term);
    if (idx === -1) arr.push(term);
    else arr.splice(idx, 1);
    save(arr);
    renderHomeBookmarks();
    return idx === -1; // returns true if newly added
  }
  window.hosaToggleBookmark = toggle;
  window.hosaIsBookmarked = isBookmarked;

  function renderHomeBookmarks() {
    var section = document.getElementById('bmk-section');
    var grid = document.getElementById('bmk-grid');
    if (!section || !grid) return;
    var bms = load();
    if (bms.length === 0) { section.classList.remove('visible'); return; }
    var pool = window.HOSA_TERMS || [];
    var byTerm = {};
    pool.forEach(function(t) { byTerm[t.term] = t; });
    var items = bms.map(function(name) { return byTerm[name]; }).filter(Boolean);
    if (items.length === 0) { section.classList.remove('visible'); return; }
    section.classList.add('visible');
    grid.innerHTML = '';
    items.slice(0, 12).forEach(function(t) {
      var a = document.createElement('a');
      a.href = t.slug + '.html';
      a.className = 'bmk-card';
      a.innerHTML =
        '<div class="bmk-term">' + t.term + '</div>' +
        '<div class="bmk-def">' + t.def + '</div>' +
        '<span class="bmk-event-tag">' + t.event + '</span>';
      grid.appendChild(a);
    });
  }

  // Inject star buttons into global search results after render
  function enhanceSearchResults() {
    var resultsBox = document.getElementById('gsearch-results');
    if (!resultsBox) return;
    var obs = new MutationObserver(function() {
      resultsBox.querySelectorAll('.gsearch-result:not([data-bmk-wired])').forEach(function(row) {
        row.setAttribute('data-bmk-wired', '1');
        var termEl = row.querySelector('.gs-term');
        if (!termEl) return;
        // Strip <mark>...</mark> to get plain term name
        var term = (termEl.textContent || '').trim();
        var star = document.createElement('button');
        star.className = 'gs-star' + (isBookmarked(term) ? ' active' : '');
        star.setAttribute('aria-label', 'Bookmark');
        star.textContent = isBookmarked(term) ? '★' : '☆';
        star.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var added = toggle(term);
          star.classList.toggle('active', added);
          star.textContent = added ? '★' : '☆';
          if (added && window._showToast) window._showToast('Bookmarked: ' + term, 'success');
        });
        // insert star before arrow
        var arrow = row.querySelector('.gs-arrow');
        if (arrow) row.insertBefore(star, arrow);
        else row.appendChild(star);
      });
    });
    obs.observe(resultsBox, { childList: true, subtree: true });
  }

  function init() {
    renderHomeBookmarks();
    enhanceSearchResults();
  }
  document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 400); });
  if (document.readyState !== 'loading') setTimeout(init, 400);
})();

/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM — replaces all inline alert() calls
   Usage: window.hosaToast(icon, title, msg, type)
   Types: 'ach' | 'lvl' | 'info' | 'good'
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var stack = document.createElement('div');
  stack.id = 'toast-stack';
  document.body.appendChild(stack);

  window.hosaToast = function(icon, title, msg, type) {
    var t = document.createElement('div');
    t.className = 'hosa-toast' + (type ? ' toast-' + type : '');
    t.innerHTML =
      '<span class="toast-icon">' + (icon || '💡') + '</span>' +
      '<div class="toast-body">' +
        '<div class="toast-title">' + (title || '') + '</div>' +
        (msg ? '<div class="toast-msg">' + msg + '</div>' : '') +
      '</div>' +
      '<button class="toast-close" aria-label="Dismiss">✕</button>';
    t.querySelector('.toast-close').addEventListener('click', function() { dismiss(t); });
    stack.appendChild(t);
    t._timer = setTimeout(function() { dismiss(t); }, 5000);
  };
  function dismiss(t) {
    clearTimeout(t._timer);
    t.classList.add('toast-out');
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
  }
  // Alias used by older code
  window._showToast = function(msg, type) {
    window.hosaToast(type === 'success' ? '✅' : '💡', msg, '', type === 'success' ? 'good' : 'info');
  };
})();

/* ═══════════════════════════════════════════════════════════════
   CONFETTI — canvas-based particle burst
   Usage: window.hosaConfetti({ count, colors, x, y })
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  var particles = [];
  var raf = null;

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  window.hosaConfetti = function(opts) {
    opts = opts || {};
    var colors = opts.colors || ['#ef4444','#fbbf24','#22c55e','#60a5fa','#f97316','#a78bfa','#fb7185'];
    var n = opts.count || 80;
    var cx = opts.x != null ? opts.x : window.innerWidth / 2;
    var cy = opts.y != null ? opts.y : window.innerHeight * 0.3;
    for (var i = 0; i < n; i++) {
      var angle = Math.random() * Math.PI * 2;
      var spd = 3 + Math.random() * 9;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * spd * (0.5 + Math.random()),
        vy: Math.sin(angle) * spd * (0.5 + Math.random()) - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
        rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 9,
        life: 1.0, decay: 0.008 + Math.random() * 0.008,
      });
    }
    if (!raf) animate();
  };

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.18; p.vx *= 0.99;
      p.rot += p.rotV; p.life -= p.decay;
      if (p.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    }
    particles = particles.filter(function(p) { return p.life > 0; });
    if (particles.length) { raf = requestAnimationFrame(animate); }
    else { raf = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
})();

/* ═══════════════════════════════════════════════════════════════
   SOUND EFFECTS — Web Audio API, defaults off, user opts in
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var enabled = false;
  var ctx = null;
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} }
    return ctx;
  }
  function tone(freq, type, dur, gain, delay) {
    var c = ac(); if (!c || !enabled) return;
    var osc = c.createOscillator(); var g = c.createGain();
    osc.connect(g); g.connect(c.destination);
    osc.type = type || 'sine'; osc.frequency.setValueAtTime(freq, c.currentTime + (delay||0));
    g.gain.setValueAtTime(0, c.currentTime + (delay||0));
    g.gain.linearRampToValueAtTime(gain||0.12, c.currentTime + (delay||0) + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + (delay||0) + (dur||0.2));
    osc.start(c.currentTime + (delay||0));
    osc.stop(c.currentTime + (delay||0) + (dur||0.2) + 0.05);
  }
  var sounds = {
    correct:     function() { tone(880,'sine',0.18,0.12); tone(1320,'sine',0.14,0.08,0.12); },
    wrong:       function() { tone(220,'sawtooth',0.22,0.09); tone(180,'sawtooth',0.18,0.07,0.14); },
    flip:        function() { tone(660,'sine',0.08,0.05); },
    achievement: function() { [523,659,784,1047].forEach(function(f,i){ tone(f,'sine',0.2,0.11,i*0.1); }); },
    levelup:     function() { [523,659,784,1047,1319].forEach(function(f,i){ tone(f,'sine',0.22,0.11,i*0.1); }); },
    click:       function() { tone(440,'sine',0.06,0.04); },
    complete:    function() { [784,1047,1319].forEach(function(f,i){ tone(f,'sine',0.2,0.12,i*0.12); }); },
  };
  window.hosaPlaySound = function(name) { if (enabled && sounds[name]) sounds[name](); };
  window.hosaIsSoundEnabled = function() { return enabled; };
  window.hosaSetSound = function(v) {
    enabled = !!v;
    try { localStorage.setItem('hosa::sound', enabled ? '1' : '0'); } catch(e) {}
  };
  try { if (localStorage.getItem('hosa::sound') === '1') enabled = true; } catch(e) {}

})();

/* ═══════════════════════════════════════════════════════════════
   LEVEL UP CELEBRATION — overlay + confetti on level threshold
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = document.createElement('div');
  overlay.id = 'lvlup-overlay';
  overlay.style.display = 'none';
  overlay.innerHTML =
    '<div class="lvlup-card">' +
      '<div class="lvlup-badge">⬆</div>' +
      '<div class="lvlup-eyebrow">Level Up!</div>' +
      '<div class="lvlup-num" id="lvlup-num">1</div>' +
      '<div class="lvlup-desc" id="lvlup-desc">You\'ve reached a new level!</div>' +
      '<div class="lvlup-xp-bar"><div class="lvlup-xp-fill" id="lvlup-xp-fill"></div></div>' +
      '<button class="lvlup-close" id="lvlup-close">Continue studying →</button>' +
    '</div>';
  document.body.appendChild(overlay);

  function xpLevel(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }

  function show(level) {
    var numEl = document.getElementById('lvlup-num');
    var descEl = document.getElementById('lvlup-desc');
    var fillEl = document.getElementById('lvlup-xp-fill');
    if (numEl) numEl.textContent = level;
    if (descEl) descEl.textContent = 'You\'ve reached Level ' + level + '!';
    overlay.style.display = 'flex';
    setTimeout(function() { if (fillEl) fillEl.style.width = '12%'; }, 600);
    if (window.hosaConfetti) {
      window.hosaConfetti({ colors: ['#fbbf24','#f97316','#ef4444','#ffffff','#fde68a'], count: 120, x: window.innerWidth/2, y: window.innerHeight*0.4 });
    }
    if (window.hosaPlaySound) window.hosaPlaySound('levelup');
    if (window.hosaToast) window.hosaToast('⬆', 'Level ' + level + '!', 'You\'re on fire — keep it up.', 'lvl');
  }
  window.hosaShowLevelUp = show;

  document.getElementById('lvlup-close').addEventListener('click', function() { overlay.style.display = 'none'; });
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.style.display = 'none'; });

  // Detect level changes via XP polling.
  // Persist last-checked level in localStorage so navigating back from an event
  // page (where engage.js already showed the level-up) does NOT re-fire here.
  var _lastLevel = -1;
  try {
    var _chkStored = parseInt(localStorage.getItem('hosa::chk-lvl') || '-1', 10);
    if (_chkStored > 0) _lastLevel = _chkStored;
  } catch(e) {}
  // Signing in on a new device raises XP from 0 to whatever the account
  // already had. That is not a level-up, and popping "Level 3!" over a hero
  // still reading "LEVEL 1" is how the mismatch got noticed in the first
  // place. The sync re-baselines the checker instead of celebrating.
  window.__hosaResetLevelCheck = function(lvl) {
    _lastLevel = lvl;
    try { localStorage.setItem('hosa::chk-lvl', String(lvl)); } catch(e) {}
  };
  function check() {
    try {
      var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
      var lvl = xpLevel(xp);
      if (_lastLevel === -1) {
        _lastLevel = lvl;
        try { localStorage.setItem('hosa::chk-lvl', String(lvl)); } catch(e2) {}
        return;
      }
      if (lvl > _lastLevel) {
        _lastLevel = lvl;
        try { localStorage.setItem('hosa::chk-lvl', String(lvl)); } catch(e2) {}
        setTimeout(function() { show(lvl); }, 600);
      }
    } catch(e) {}
  }
  setInterval(check, 1500);
  setTimeout(check, 400);
})();

/* ═══════════════════════════════════════════════════════════════
   QUICK REVIEW MODE — rapid flip-card session
   Usage: window.__hosaOpenQR(terms, title) or data-action="quickreview"
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = document.createElement('div');
  overlay.id = 'qr-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<div class="qr-modal">' +
      '<div class="qr-header">' +
        '<span class="qr-eyebrow">⚡ Quick Review</span>' +
        '<div class="qr-title" id="qr-title">Quick Review</div>' +
        '<div class="qr-counter" id="qr-counter"></div>' +
        '<button class="qr-close" id="qr-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="qr-progress"><div class="qr-prog-fill" id="qr-prog-fill"></div></div>' +
      '<div class="qr-card-area">' +
        '<div class="qr-card" id="qr-card">' +
          '<div class="qr-front">' +
            '<div class="qr-front-label">Term</div>' +
            '<div class="qr-term-text" id="qr-term-text"></div>' +
          '</div>' +
          '<div class="qr-back">' +
            '<div class="qr-back-label">Definition ✓</div>' +
            '<div class="qr-def-text" id="qr-def-text"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="qr-actions" id="qr-actions" style="display:none">' +
        '<button class="qr-btn qr-btn-again" id="qr-again">Again ✗</button>' +
        '<button class="qr-btn qr-btn-good" id="qr-good">Got it ✓</button>' +
      '</div>' +
      '<div class="qr-hint" id="qr-hint">Tap card to reveal · <kbd>Space</kbd></div>' +
      '<div class="qr-result" id="qr-result" style="display:none"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var state = { terms: [], idx: 0, correct: 0, flipped: false };

  function open(terms, title) {
    var pool = terms && terms.length ? terms : (window.HOSA_TERMS || []);
    if (!pool.length) {
      if (window.hosaToast) window.hosaToast('⚡', 'No terms available', 'Browse an event page first to load study terms.', 'info');
      return;
    }
    // Shuffle and take up to 15
    var shuffled = pool.slice().sort(function() { return Math.random() - 0.5; });
    state.terms = shuffled.slice(0, Math.min(15, shuffled.length));
    state.idx = 0; state.correct = 0; state.flipped = false;
    document.getElementById('qr-title').textContent = title || 'Quick Review';
    document.getElementById('qr-result').style.display = 'none';
    document.getElementById('qr-actions').style.display = 'none';
    document.getElementById('qr-hint').style.display = 'block';
    document.getElementById('qr-card').style.display = 'block';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    renderCard();
  }
  window.__hosaOpenQR = open;

  function renderCard() {
    var t = state.terms[state.idx];
    if (!t) return;
    var card = document.getElementById('qr-card');
    card.classList.remove('flipped');
    state.flipped = false;
    document.getElementById('qr-term-text').textContent = t.term;
    document.getElementById('qr-def-text').textContent = t.def;
    document.getElementById('qr-actions').style.display = 'none';
    document.getElementById('qr-hint').style.display = 'block';
    var pct = (state.idx / state.terms.length) * 100;
    document.getElementById('qr-prog-fill').style.width = pct + '%';
    document.getElementById('qr-counter').textContent = (state.idx + 1) + ' / ' + state.terms.length;
  }

  function flip() {
    if (state.flipped) return;
    state.flipped = true;
    document.getElementById('qr-card').classList.add('flipped');
    document.getElementById('qr-actions').style.display = 'flex';
    document.getElementById('qr-hint').style.display = 'none';
    if (window.hosaPlaySound) window.hosaPlaySound('flip');
  }

  function advance(good) {
    if (good) { state.correct++; if (window.hosaPlaySound) window.hosaPlaySound('correct'); }
    else { if (window.hosaPlaySound) window.hosaPlaySound('wrong'); }
    state.idx++;
    if (state.idx >= state.terms.length) showResult();
    else renderCard();
  }

  function showResult() {
    document.getElementById('qr-card').style.display = 'none';
    document.getElementById('qr-actions').style.display = 'none';
    document.getElementById('qr-hint').style.display = 'none';
    document.getElementById('qr-prog-fill').style.width = '100%';
    var pct = Math.round(state.correct / state.terms.length * 100);
    var grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    var resultEl = document.getElementById('qr-result');
    resultEl.style.display = 'block';
    resultEl.innerHTML =
      '<div class="qr-result-grade">' + pct + '%</div>' +
      '<div class="qr-result-label">' + state.correct + ' of ' + state.terms.length + ' correct — Grade ' + grade + '</div>' +
      '<button class="qr-result-btn" id="qr-retry">Try again</button>' +
      '<button class="qr-result-btn primary" id="qr-done">Done ✓</button>';
    document.getElementById('qr-done').addEventListener('click', close);
    document.getElementById('qr-retry').addEventListener('click', function() {
      open(state.terms.concat([]), document.getElementById('qr-title').textContent);
    });
    // Award XP
    var xpEarned = state.correct * 8;
    if (xpEarned > 0) {
      try {
        var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
        localStorage.setItem('hosa::xp', String(xp + xpEarned));
      } catch(e) {}
      if (window.hosaXPFlyup) window.hosaXPFlyup(resultEl, xpEarned);
    }
    if (pct >= 80) {
      if (window.hosaConfetti) window.hosaConfetti({ count: 60, x: window.innerWidth/2, y: window.innerHeight*0.5 });
      if (window.hosaPlaySound) window.hosaPlaySound('complete');
    }
    if (window.hosaToast) {
      var icon = pct >= 90 ? '🏆' : pct >= 70 ? '✅' : '📚';
      window.hosaToast(icon, 'Quick Review done!', state.correct + '/' + state.terms.length + ' correct · +' + xpEarned + ' XP', pct >= 70 ? 'good' : 'info');
    }
  }

  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    setTimeout(function() {
      document.getElementById('qr-result').style.display = 'none';
      document.getElementById('qr-card').style.display = 'block';
    }, 300);
  }

  document.getElementById('qr-close').addEventListener('click', close);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  document.getElementById('qr-card').addEventListener('click', flip);
  document.getElementById('qr-again').addEventListener('click', function() { advance(false); });
  document.getElementById('qr-good').addEventListener('click', function() { advance(true); });
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!state.flipped) flip(); else advance(true); }
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'ArrowLeft' && state.flipped) { e.preventDefault(); advance(false); }
    if (e.key === 'ArrowRight' && state.flipped) { e.preventDefault(); advance(true); }
  });
})();

/* ═══════════════════════════════════════════════════════════════
   SMART STUDY SUGGESTIONS — appears on home tab
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var EVENTS = [
    {slug:'medical-terminology',   name:'Medical Terminology',    icon:'🩺'},
    {slug:'pathophysiology',       name:'Pathophysiology',         icon:'🧬'},
    {slug:'anatomy-physiology',    name:'Anatomy & Physiology',    icon:'🫀'},
    {slug:'pharmacology',          name:'Pharmacology',            icon:'💊'},
    {slug:'nutrition',             name:'Nutrition',               icon:'🥗'},
    {slug:'biochemistry',          name:'Biochemistry',            icon:'⚗️'},
    {slug:'medical-math',          name:'Medical Math',            icon:'🔢'},
    {slug:'medical-law-ethics',    name:'Medical Law & Ethics',    icon:'⚖️'},
    {slug:'behavioral-health',     name:'Behavioral Health',       icon:'🧠'},
    {slug:'clinical-nursing',      name:'Clinical Nursing',        icon:'🏥'},
    {slug:'public-health',         name:'Public Health',           icon:'🌍'},
    {slug:'sports-medicine',       name:'Sports Medicine',         icon:'🏃'},
    {slug:'biomedical-laboratory', name:'Biomedical Lab Science',  icon:'🔬'},
    {slug:'human-growth-development', name:'Human Growth & Dev.',  icon:'👶'},
    {slug:'physical-therapy',      name:'Physical Therapy',        icon:'🦽'},
    {slug:'dental-science',        name:'Dental Science',          icon:'🦷'},
    {slug:'epidemiology',          name:'Epidemiology',            icon:'📈'},
    {slug:'cardiology',            name:'Cardiology',              icon:'❤️'},
    {slug:'prehospital-ems',       name:'Prehospital / EMS',       icon:'🚑'},
    {slug:'toxicology',            name:'Toxicology',              icon:'☣️'},
    {slug:'pulmonology',           name:'Pulmonology',             icon:'🫁'},
    {slug:'anesthesiology',        name:'Anesthesiology',          icon:'💉'},
    {slug:'palliative-care',       name:'Palliative Care',         icon:'🕊️'},
    {slug:'patient-safety',        name:'Patient Safety',          icon:'🛡️'},
    {slug:'pediatric-emergency',   name:'Pediatric Emergency',     icon:'🍼'},
  ];

  function getSuggestions() {
    var now = Date.now();
    var suggestions = [];
    EVENTS.forEach(function(ev) {
      try {
        var raw = localStorage.getItem('hosa::' + ev.slug);
        if (!raw) {
          suggestions.push({ slug: ev.slug, name: ev.name, icon: ev.icon, reason: 'Never studied', urgency: 'new', due: 0 });
          return;
        }
        var data = JSON.parse(raw);
        var dueCount = 0;
        if (data.srData) {
          Object.keys(data.srData).forEach(function(k) {
            var sr = data.srData[k];
            if (sr.due && sr.due <= now) dueCount++;
          });
        }
        if (dueCount > 0) {
          suggestions.push({ slug: ev.slug, name: ev.name, icon: ev.icon, reason: dueCount + ' card' + (dueCount > 1 ? 's' : '') + ' due', urgency: dueCount >= 5 ? 'overdue' : 'soon', due: dueCount });
        }
      } catch(e) {}
    });
    suggestions.sort(function(a, b) {
      var o = { overdue: 0, soon: 1, new: 2 };
      return (o[a.urgency] || 3) - (o[b.urgency] || 3);
    });
    return suggestions.slice(0, 8);
  }

  function render() {
    var section = document.getElementById('sss-section');
    var grid = document.getElementById('sss-grid');
    if (!section || !grid) return;
    var sugs = getSuggestions();
    if (!sugs.length) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    grid.innerHTML = '';
    sugs.forEach(function(s) {
      var a = document.createElement('a');
      a.href = s.slug + '.html';
      a.className = 'sss-card';
      a.setAttribute('data-urgency', s.urgency);
      a.innerHTML =
        '<div class="sss-icon">' + s.icon + '</div>' +
        '<div class="sss-reason">' + s.reason + '</div>' +
        '<div class="sss-name">' + s.name + '</div>' +
        '<div class="sss-cta">→ ' + (s.due ? 'Review now' : 'Start studying') + '</div>';
      grid.appendChild(a);
    });
  }

  document.addEventListener('DOMContentLoaded', function() { setTimeout(render, 500); });
  if (document.readyState !== 'loading') setTimeout(render, 500);
})();

/* ═══════════════════════════════════════════════════════════════
   PROGRESS RINGS — SVG rings on event cards showing mastery %
   ═══════════════════════════════════════════════════════════════ */
(function() {
  function injectRings() {
    document.querySelectorAll('.category-card').forEach(function(card) {
      if (card.querySelector('.cp-ring-wrap')) return;
      // Derive slug from href
      var href = card.getAttribute('href') || '';
      var slug = href.replace(/.*\//, '').replace('.html', '');
      if (!slug) return;

      var pct = 0;
      try {
        var raw = localStorage.getItem('hosa::' + slug);
        if (!raw) return; // never studied — no ring
        var data = JSON.parse(raw);
        var total = 0, mastered = 0;
        if (data.srData) {
          var keys = Object.keys(data.srData);
          total = keys.length;
          keys.forEach(function(k) { if ((data.srData[k].q || 0) >= 4) mastered++; });
        }
        if (total > 0) pct = Math.round(mastered / total * 100);
      } catch(e) { return; }
      if (pct === 0) return;

      var R = 16, C = 2 * Math.PI * R;
      var offset = C - (pct / 100) * C;
      var color = pct >= 75 ? '#22c55e' : pct >= 40 ? '#fbbf24' : '#ef4444';

      var wrap = document.createElement('div');
      wrap.className = 'cp-ring-wrap';
      wrap.title = pct + '% mastered';
      wrap.innerHTML =
        '<svg class="cp-ring-svg" width="38" height="38" viewBox="0 0 38 38">' +
          '<circle class="cp-ring-track" cx="19" cy="19" r="' + R + '"/>' +
          '<circle class="cp-ring-fill" cx="19" cy="19" r="' + R + '"' +
            ' stroke="' + color + '"' +
            ' stroke-dasharray="' + C.toFixed(1) + '"' +
            ' stroke-dashoffset="' + C.toFixed(1) + '"' +
            ' data-offset="' + offset.toFixed(1) + '"/>' +
          '<text class="cp-ring-pct" x="19" y="19">' + pct + '</text>' +
        '</svg>';
      card.style.position = 'relative';
      card.appendChild(wrap);
      // Animate after a small delay
      setTimeout(function() {
        var fill = wrap.querySelector('.cp-ring-fill');
        if (fill) fill.style.strokeDashoffset = fill.getAttribute('data-offset');
      }, 80 + Math.random() * 300);
    });
  }

  document.addEventListener('DOMContentLoaded', function() { setTimeout(injectRings, 700); });
  if (document.readyState !== 'loading') setTimeout(injectRings, 700);
  // Re-inject on tab switch to events
  document.addEventListener('click', function(e) {
    var item = e.target.closest('[data-tab="events"]');
    if (item) setTimeout(injectRings, 500);
  });
})();

/* ═══════════════════════════════════════════════════════════════
   STUDY TIME TRACKER — tracks minutes studied today
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var startTime = Date.now();
  var KEY = 'hosa::study-time-' + new Date().toISOString().slice(0, 10);

  function getMins() { try { return parseInt(localStorage.getItem(KEY) || '0', 10); } catch(e) { return 0; } }
  function saveMins() {
    var elapsed = Math.floor((Date.now() - startTime) / 60000);
    if (elapsed <= 0) return;
    try { localStorage.setItem(KEY, String(getMins() + elapsed)); } catch(e) {}
    startTime = Date.now();
  }
  setInterval(saveMins, 5 * 60 * 1000);
  window.addEventListener('beforeunload', saveMins);

  function renderStudyTime() {
    var statBar = document.getElementById('home-stats-bar');
    if (!statBar || document.getElementById('hs-studytime')) return;
    var mins = getMins();
    if (mins < 1) return;
    var val = mins >= 60 ? Math.floor(mins/60) + 'h ' + (mins%60) + 'm' : mins + 'm';
    var wrap = document.createElement('div');
    wrap.className = 'hs-stat'; wrap.id = 'hs-studytime';
    wrap.innerHTML = '<div><div class="hs-time-val">' + val + '</div><div class="hs-time-lbl">Today\'s study</div></div>';
    statBar.insertBefore(wrap, statBar.lastElementChild);
  }
  document.addEventListener('DOMContentLoaded', function() { setTimeout(renderStudyTime, 600); });
  if (document.readyState !== 'loading') setTimeout(renderStudyTime, 600);
})();

/* ═══════════════════════════════════════════════════════════════
   ACHIEVEMENT TOASTS — wire engage.js achievements to toast UI
   ═══════════════════════════════════════════════════════════════ */
(function() {
  // Patch achievement notification: replace legacy inner panel with toast
  var _origShowAch = window._showAchievement;
  setTimeout(function() {
    if (typeof window._showAchievement === 'function' && !window._showAchievement._patched) {
      var orig = window._showAchievement;
      window._showAchievement = function(ach) {
        if (window.hosaToast) {
          window.hosaToast(ach.icon || '🏅', ach.name, ach.desc || '', 'ach');
          if (window.hosaPlaySound) window.hosaPlaySound('achievement');
          if (window.hosaConfetti) {
            window.hosaConfetti({ count: 40, colors: ['#fbbf24','#f97316','#ffffff'], x: window.innerWidth/2, y: window.innerHeight*0.2 });
          }
        }
        orig(ach);
      };
      window._showAchievement._patched = true;
    }
  }, 800);
})();

/* ═══════════════════════════════════════════════════════════════
   MATCH GAME — click-to-pair term/definition minigame
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = document.createElement('div');
  overlay.id = 'mg-overlay';
  overlay.innerHTML =
    '<div class="mg-modal">' +
      '<div class="mg-header">' +
        '<span class="mg-eyebrow">🧩 Match Game</span>' +
        '<div class="mg-title">Pair terms with definitions</div>' +
        '<div class="mg-stat" id="mg-stat">Matched <strong id="mg-matched">0</strong>/<strong id="mg-total">6</strong> · <strong id="mg-time">0:00</strong></div>' +
        '<button class="mg-close" id="mg-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div class="mg-board" id="mg-board"></div>' +
      '<div class="mg-result" id="mg-result"></div>' +
      '<div class="mg-footer">' +
        '<span class="mg-stat">Click a term, then its definition</span>' +
        '<div><button class="mg-btn" id="mg-new">New round</button><button class="mg-btn primary" id="mg-done">Done</button></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var state = { pairs: [], matched: 0, selected: null, started: 0, tickI: null, total: 6 };
  var BEST_KEY = 'hosa::match-best';

  function open() {
    var pool = window.HOSA_TERMS || [];
    if (pool.length < 6) return;
    var picks = pool.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 6);
    state.pairs = picks;
    state.total = picks.length;
    state.matched = 0;
    state.selected = null;
    state.started = Date.now();
    document.getElementById('mg-matched').textContent = '0';
    document.getElementById('mg-total').textContent = state.total;
    document.getElementById('mg-time').textContent = '0:00';
    document.getElementById('mg-result').classList.remove('show');
    document.getElementById('mg-result').innerHTML = '';
    document.getElementById('mg-board').style.display = 'grid';
    renderBoard();
    overlay.classList.add('open');
    startTimer();
  }
  window.__hosaOpenMatch = open;

  function close() {
    overlay.classList.remove('open');
    stopTimer();
  }
  function startTimer() {
    stopTimer();
    state.tickI = setInterval(function() {
      var sec = Math.floor((Date.now() - state.started) / 1000);
      var m = Math.floor(sec / 60), s = sec % 60;
      document.getElementById('mg-time').textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }, 250);
  }
  function stopTimer() { if (state.tickI) { clearInterval(state.tickI); state.tickI = null; } }

  function renderBoard() {
    var board = document.getElementById('mg-board');
    board.innerHTML = '';
    // Build two columns: terms (shuffled) on left, defs (shuffled separately) on right
    var terms = state.pairs.slice().sort(function() { return Math.random() - 0.5; });
    var defs  = state.pairs.slice().sort(function() { return Math.random() - 0.5; });
    // Render alternating: term, def, term, def...
    var rows = [];
    for (var i = 0; i < state.total; i++) {
      rows.push({ side: 'term', data: terms[i] });
      rows.push({ side: 'def',  data: defs[i] });
    }
    rows.forEach(function(r) {
      var t = document.createElement('div');
      t.className = 'mg-tile ' + (r.side === 'term' ? 'term-tile' : 'def-tile');
      t.setAttribute('data-pair', r.data.term);
      t.setAttribute('data-side', r.side);
      t.textContent = r.side === 'term' ? r.data.term : r.data.def;
      t.addEventListener('click', function() { onTileClick(t); });
      board.appendChild(t);
    });
  }

  function onTileClick(tile) {
    if (tile.classList.contains('correct')) return;
    if (!state.selected) {
      state.selected = tile;
      tile.classList.add('selected');
      return;
    }
    if (state.selected === tile) {
      tile.classList.remove('selected');
      state.selected = null;
      return;
    }
    // Must be one term + one def
    if (state.selected.getAttribute('data-side') === tile.getAttribute('data-side')) {
      state.selected.classList.remove('selected');
      state.selected = tile;
      tile.classList.add('selected');
      return;
    }
    // Check match
    var a = state.selected.getAttribute('data-pair');
    var b = tile.getAttribute('data-pair');
    if (a === b) {
      state.selected.classList.remove('selected'); state.selected.classList.add('correct');
      tile.classList.add('correct');
      state.matched++;
      document.getElementById('mg-matched').textContent = state.matched;
      if (window.hosaPlaySound) window.hosaPlaySound('correct');
      state.selected = null;
      if (state.matched === state.total) finishGame();
    } else {
      var bad1 = state.selected, bad2 = tile;
      bad1.classList.add('wrong'); bad2.classList.add('wrong');
      bad1.classList.remove('selected');
      if (window.hosaPlaySound) window.hosaPlaySound('wrong');
      state.selected = null;
      setTimeout(function() { bad1.classList.remove('wrong'); bad2.classList.remove('wrong'); }, 480);
    }
  }

  function finishGame() {
    stopTimer();
    var sec = Math.floor((Date.now() - state.started) / 1000);
    var m = Math.floor(sec / 60), s = sec % 60;
    var timeStr = m + ':' + (s < 10 ? '0' : '') + s;
    var best = null;
    try { best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch(e) {}
    var isNewBest = !best || sec < best.time;
    if (isNewBest) {
      try { localStorage.setItem(BEST_KEY, JSON.stringify({ time: sec, date: Date.now() })); } catch(e) {}
    }
    var xpEarned = Math.max(20, 80 - sec); // faster = more XP, min 20
    try {
      var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
      localStorage.setItem('hosa::xp', String(xp + xpEarned));
    } catch(e) {}

    document.getElementById('mg-board').style.display = 'none';
    var r = document.getElementById('mg-result');
    r.classList.add('show');
    r.innerHTML =
      '<div class="mg-result-grade">' + timeStr + '</div>' +
      '<div class="mg-result-time">' + state.total + ' pairs matched · +' + xpEarned + ' XP' +
        (isNewBest ? ' · <strong style="color:#fbbf24">NEW BEST!</strong>' : (best ? ' · best ' + Math.floor(best.time/60) + ':' + ((best.time%60)<10?'0':'') + (best.time%60) : '')) +
      '</div>' +
      '<button class="mg-btn primary" id="mg-again">Play again</button>';
    document.getElementById('mg-again').addEventListener('click', open);

    if (window.hosaConfetti) window.hosaConfetti({ count: 60, colors: ['#60a5fa','#a78bfa','#fbbf24'], x: window.innerWidth/2, y: window.innerHeight*0.4 });
    if (window.hosaPlaySound) window.hosaPlaySound('complete');
    if (window.hosaToast) {
      window.hosaToast('🧩', 'Match Game complete!', timeStr + ' · +' + xpEarned + ' XP' + (isNewBest ? ' (new best!)' : ''), 'good');
    }
    // Re-render HoF so the new best score appears
    if (window.__hosaRenderHoF) window.__hosaRenderHoF();
  }

  document.getElementById('mg-close').addEventListener('click', close);
  document.getElementById('mg-done').addEventListener('click', close);
  document.getElementById('mg-new').addEventListener('click', open);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
  });
})();

/* ═══════════════════════════════════════════════════════════════
   SPEED DRILL — 60-second sprint, +2s per correct, -3s per wrong
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var TIME_START = 60;
  var BEST_KEY = 'hosa::speed-best';

  var overlay = document.createElement('div');
  overlay.id = 'sd-overlay';
  overlay.innerHTML =
    '<div class="sd-modal">' +
      '<div class="sd-header">' +
        '<span class="sd-eyebrow">⏱ Speed Drill</span>' +
        '<div class="sd-title">60-second sprint</div>' +
        '<button class="sd-close" id="sd-close" aria-label="Close">✕</button>' +
      '</div>' +
      '<div id="sd-content"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var state = null;
  var tick = null;

  function intro() {
    var best = null;
    try { best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch(e) {}
    document.getElementById('sd-content').innerHTML =
      '<div class="sd-intro">' +
        '<p class="sd-intro-text">As many correct answers as you can in <strong>60 seconds</strong>. Each correct adds +2s, each wrong subtracts -3s. Go for high score!</p>' +
        (best ? '<div class="sd-result-best">Best: <strong>' + best.score + '</strong> correct</div>' : '') +
        '<button class="sd-btn-start" id="sd-start">Start drill →</button>' +
      '</div>';
    document.getElementById('sd-start').addEventListener('click', startDrill);
  }

  function open() {
    overlay.classList.add('open');
    intro();
  }
  window.__hosaOpenSpeedDrill = open;
  function close() { overlay.classList.remove('open'); stopTick(); }

  function startDrill() {
    state = { score: 0, wrong: 0, timeLeft: TIME_START, startedAt: Date.now() };
    document.getElementById('sd-content').innerHTML =
      '<div class="sd-stats">' +
        '<div class="sd-stat-time" id="sd-stat-time">Time<strong id="sd-time">' + TIME_START + 's</strong></div>' +
        '<div class="sd-stat-score">Score<strong id="sd-score">0</strong></div>' +
      '</div>' +
      '<div class="sd-timer-bar"><div class="sd-timer-fill" id="sd-fill" style="width:100%"></div></div>' +
      '<div class="sd-q"><div class="sd-q-text" id="sd-q-text"></div></div>' +
      '<div class="sd-opts" id="sd-opts"></div>';
    nextQ();
    startTick();
  }

  function startTick() {
    stopTick();
    var lastSec = state.timeLeft;
    tick = setInterval(function() {
      var elapsed = (Date.now() - state.startedAt) / 1000;
      var remaining = Math.max(0, state.timeLeft - elapsed);
      var displaySec = Math.ceil(remaining);
      document.getElementById('sd-time').textContent = displaySec + 's';
      document.getElementById('sd-fill').style.width = (remaining / TIME_START * 100) + '%';
      if (displaySec <= 5 && displaySec !== lastSec) {
        document.getElementById('sd-stat-time').classList.add('warning');
        setTimeout(function() { document.getElementById('sd-stat-time').classList.remove('warning'); }, 400);
        lastSec = displaySec;
      }
      if (remaining <= 0) finishDrill();
    }, 250);
  }
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function addTime(secs) {
    var elapsed = (Date.now() - state.startedAt) / 1000;
    var remaining = state.timeLeft - elapsed;
    state.timeLeft = remaining + secs;
    state.startedAt = Date.now();
  }

  function pickQ() {
    var pool = window.HOSA_TERMS || [];
    if (pool.length < 4) return null;
    var correct = pool[Math.floor(Math.random() * pool.length)];
    var choices = [correct.term];
    var used = {}; used[correct.term] = true;
    var attempts = 0;
    while (choices.length < 4 && attempts < 200) {
      var c = pool[Math.floor(Math.random() * pool.length)];
      if (!used[c.term]) { used[c.term] = true; choices.push(c.term); }
      attempts++;
    }
    // shuffle
    for (var i = choices.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = choices[i]; choices[i] = choices[j]; choices[j] = t;
    }
    return { def: correct.def, term: correct.term, choices: choices };
  }

  function nextQ() {
    var q = pickQ();
    if (!q) return;
    document.getElementById('sd-q-text').textContent = q.def;
    var opts = document.getElementById('sd-opts');
    opts.innerHTML = '';
    q.choices.forEach(function(c) {
      var b = document.createElement('button');
      b.className = 'sd-opt'; b.textContent = c;
      b.addEventListener('click', function() { answer(b, c === q.term); });
      opts.appendChild(b);
    });
  }

  function answer(btn, isCorrect) {
    if (isCorrect) {
      btn.classList.add('correct'); state.score++;
      document.getElementById('sd-score').textContent = state.score;
      addTime(2);
      if (window.hosaPlaySound) window.hosaPlaySound('correct');
    } else {
      btn.classList.add('wrong'); state.wrong++;
      addTime(-3);
      if (window.hosaPlaySound) window.hosaPlaySound('wrong');
    }
    setTimeout(nextQ, 250);
  }

  function finishDrill() {
    stopTick();
    var score = state.score;
    var best = null;
    try { best = JSON.parse(localStorage.getItem(BEST_KEY) || 'null'); } catch(e) {}
    var isNewBest = !best || score > best.score;
    if (isNewBest) { try { localStorage.setItem(BEST_KEY, JSON.stringify({ score: score, date: Date.now() })); } catch(e) {} }
    var xp = score * 6;
    try {
      var cur = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
      localStorage.setItem('hosa::xp', String(cur + xp));
    } catch(e) {}
    document.getElementById('sd-content').innerHTML =
      '<div class="sd-result">' +
        '<div class="sd-result-num">' + score + '</div>' +
        '<div class="sd-result-label">CORRECT IN 60 SECONDS</div>' +
        '<div class="sd-result-best">+' + xp + ' XP earned' + (isNewBest ? ' · <strong>NEW BEST!</strong>' : (best ? ' · best ' + best.score : '')) + '</div>' +
        '<button class="sd-btn-start" id="sd-again">Try again →</button>' +
      '</div>';
    document.getElementById('sd-again').addEventListener('click', startDrill);
    if (window.hosaConfetti && score >= 10) window.hosaConfetti({ count: 60, colors: ['#f97316','#ef4444','#fbbf24'], x: window.innerWidth/2, y: window.innerHeight*0.4 });
    if (window.hosaPlaySound) window.hosaPlaySound('complete');
    if (window.hosaToast) window.hosaToast('⏱', 'Speed Drill done!', score + ' correct · +' + xp + ' XP' + (isNewBest ? ' (new best!)' : ''), 'good');
    if (window.__hosaRenderHoF) window.__hosaRenderHoF();
  }

  document.getElementById('sd-close').addEventListener('click', close);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function(e) {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
  });
})();

/* ═══════════════════════════════════════════════════════════════
   HALL OF FAME — personal records widget
   ═══════════════════════════════════════════════════════════════ */
(function() {
  function getMastered() {
    var total = 0;
    try {
      Object.keys(localStorage).forEach(function(k) {
        if (k.indexOf('hosa::') === 0 && k.indexOf('::') !== -1) {
          try {
            var d = JSON.parse(localStorage.getItem(k) || 'null');
            if (d && d.mastered && Array.isArray(d.mastered)) total += d.mastered.length;
          } catch(e) {}
        }
      });
    } catch(e) {}
    return total;
  }

  function render() {
    var section = document.getElementById('hof-section');
    var grid = document.getElementById('hof-grid');
    if (!section || !grid) return;

    var xp = 0, streak = 0, longestStreak = 0;
    try { xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10); } catch(e) {}
    try { streak = parseInt(localStorage.getItem('hosa::streak') || '0', 10); } catch(e) {}
    try { longestStreak = parseInt(localStorage.getItem('hosa::streak-longest') || '0', 10); } catch(e) {}
    if (streak > longestStreak) { longestStreak = streak; try { localStorage.setItem('hosa::streak-longest', String(streak)); } catch(e) {} }

    var mfeBest = null, matchBest = null, speedBest = null;
    try { mfeBest = JSON.parse(localStorage.getItem('hosa::mfe-best') || 'null'); } catch(e) {}
    try { matchBest = JSON.parse(localStorage.getItem('hosa::match-best') || 'null'); } catch(e) {}
    try { speedBest = JSON.parse(localStorage.getItem('hosa::speed-best') || 'null'); } catch(e) {}

    var mastered = getMastered();
    var bookmarks = 0;
    try { bookmarks = (JSON.parse(localStorage.getItem('hosa::bookmarks') || '[]')).length; } catch(e) {}

    var records = [
      { icon: '💎', label: 'Total XP', val: xp.toLocaleString(), color: '#fbbf24' },
      { icon: '🔥', label: 'Longest streak', val: longestStreak ? longestStreak + 'd' : '—', color: '#ef4444' },
      { icon: '📚', label: 'Cards mastered', val: mastered, color: '#22c55e' },
      { icon: '🏆', label: 'Best Mock Exam', val: mfeBest ? mfeBest.pct + '%' : '—', sub: mfeBest ? Math.floor(mfeBest.time/60)+':'+((mfeBest.time%60)<10?'0':'')+(mfeBest.time%60) : '', color: '#f97316' },
      { icon: '🧩', label: 'Match Game best', val: matchBest ? Math.floor(matchBest.time/60) + ':' + ((matchBest.time%60)<10?'0':'') + (matchBest.time%60) : '—', color: '#60a5fa' },
      { icon: '⏱', label: 'Speed Drill best', val: speedBest ? speedBest.score : '—', sub: speedBest ? 'correct' : '', color: '#a78bfa' },
      { icon: '⭐', label: 'Bookmarks', val: bookmarks, color: '#fbbf24' },
    ];
    // Only show if there's any meaningful data
    var hasData = xp > 0 || mastered > 0 || mfeBest || matchBest || speedBest || longestStreak > 0 || bookmarks > 0;
    if (!hasData) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    grid.innerHTML = '';
    records.forEach(function(r) {
      var c = document.createElement('div');
      c.className = 'hof-card' + (r.val === '—' || r.val === 0 ? ' hof-empty' : '');
      c.style.setProperty('--c', r.color);
      c.innerHTML =
        '<div class="hof-icon">' + r.icon + '</div>' +
        '<div class="hof-label">' + r.label + '</div>' +
        '<div class="hof-val">' + r.val + '</div>' +
        (r.sub ? '<div class="hof-sub">' + r.sub + '</div>' : '');
      grid.appendChild(c);
    });
  }
  window.__hosaRenderHoF = render;
  document.addEventListener('DOMContentLoaded', function() { setTimeout(render, 700); });
  if (document.readyState !== 'loading') setTimeout(render, 700);
  // Re-render every 5s in case stats change
  setInterval(render, 5000);
})();

/* ═══════════════════════════════════════════════════════════════
   STREAK CALENDAR POPUP — click streak number to see 28-day grid
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var popup = null;
  function getActivityDates() {
    var set = {};
    try {
      var arr = JSON.parse(localStorage.getItem('hosa::activity') || '[]');
      arr.forEach(function(d) { set[d] = true; });
    } catch(e) {}
    // Also scan hosa::daily-* keys
    try {
      Object.keys(localStorage).forEach(function(k) {
        if (k.indexOf('hosa::daily::') === 0) {
          set[k.replace('hosa::daily::', '')] = true;
        }
      });
    } catch(e) {}
    return set;
  }

  function showPopup(anchor) {
    closePopup();
    var streak = 0;
    try { streak = parseInt(localStorage.getItem('hosa::streak') || '0', 10); } catch(e) {}
    var dates = getActivityDates();
    var today = new Date(); today.setHours(0, 0, 0, 0);
    popup = document.createElement('div');
    popup.className = 'streak-cal-popup';
    var html =
      '<div class="streak-cal-title">Activity · last 28 days</div>' +
      '<div class="streak-cal-headline">' + streak + '-day <em>streak</em> 🔥</div>' +
      '<div class="streak-cal-grid">';
    // 4 weeks = 28 days; show day labels then 28 cells going backward from today
    for (var i = 27; i >= 0; i--) {
      var d = new Date(today); d.setDate(today.getDate() - i);
      var key = d.toISOString().slice(0, 10);
      var cls = 'streak-cal-day';
      if (dates[key]) cls += ' active';
      if (i === 0) cls += ' today';
      html += '<div class="' + cls + '" title="' + key + '">' + d.getDate() + '</div>';
    }
    html += '</div>';
    popup.innerHTML = html;
    document.body.appendChild(popup);

    var rect = anchor.getBoundingClientRect();
    var top = rect.bottom + 8;
    var left = rect.left + rect.width / 2 - popup.offsetWidth / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - popup.offsetWidth - 12));
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';

    setTimeout(function() {
      document.addEventListener('click', clickOutside, { once: true });
    }, 50);
  }
  function closePopup() {
    if (popup && popup.parentNode) popup.parentNode.removeChild(popup);
    popup = null;
  }
  function clickOutside(e) {
    if (popup && !popup.contains(e.target)) closePopup();
  }

  function wire() {
    var streakEl = document.getElementById('hs-streak');
    if (!streakEl || streakEl._calWired) return;
    streakEl._calWired = true;
    streakEl.style.cursor = 'pointer';
    streakEl.title = 'Click to see calendar';
    streakEl.addEventListener('click', function(e) {
      e.stopPropagation();
      if (popup) closePopup();
      else showPopup(streakEl);
    });
  }
  document.addEventListener('DOMContentLoaded', function() { setTimeout(wire, 600); });
  if (document.readyState !== 'loading') setTimeout(wire, 600);
  setInterval(wire, 2000); // in case streak element appears later
})();

/* ═══════════════════════════════════════════════════════════════
   CHEAT SHEET EXPORT — printable bookmark sheet in new window
   ═══════════════════════════════════════════════════════════════ */
(function() {
  function wire() {
    var btn = document.getElementById('bmk-export');
    if (!btn || btn._wired) return;
    btn._wired = true;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var bookmarks = [];
      try { bookmarks = JSON.parse(localStorage.getItem('hosa::bookmarks') || '[]'); } catch(e) {}
      if (!bookmarks.length) {
        if (window.hosaToast) window.hosaToast('⭐', 'No bookmarks yet', 'Star terms in the search modal to add them here.', 'info');
        return;
      }
      var pool = window.HOSA_TERMS || [];
      var byTerm = {}; pool.forEach(function(t) { byTerm[t.term] = t; });
      var items = bookmarks.map(function(n) { return byTerm[n]; }).filter(Boolean);
      // Group by event
      var byEvent = {};
      items.forEach(function(t) { if (!byEvent[t.event]) byEvent[t.event] = []; byEvent[t.event].push(t); });

      var html =
        '<!DOCTYPE html><html><head><meta charset="utf-8"><title>HOSA Cheat Sheet — ' + items.length + ' terms</title>' +
        '<style>' +
          '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Fraunces:wght@500;700&display=swap");' +
          'body { font-family: Inter, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.5; }' +
          'h1 { font-family: Fraunces, serif; font-size: 36px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 8px; }' +
          'h2 { font-family: Inter, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #b91c1c; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #ddd; }' +
          '.sub { color: #666; font-size: 14px; margin-bottom: 24px; }' +
          '.item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dotted #ddd; page-break-inside: avoid; }' +
          '.term { font-family: Fraunces, serif; font-size: 17px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; }' +
          '.def { font-size: 14px; color: #444; }' +
          '@media print { body { margin: 0; padding: 16px; } h1 { font-size: 28px; } }' +
          '.actions { margin: 20px 0; padding: 12px; background: #f5f5f5; border-radius: 8px; font-size: 13px; text-align: center; }' +
          '.actions button { background: #b91c1c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font: inherit; font-weight: 600; }' +
          '@media print { .actions { display: none; } }' +
        '</style></head><body>' +
        '<h1>HOSA Cheat Sheet</h1>' +
        '<div class="sub">' + items.length + ' bookmarked terms · generated ' + new Date().toLocaleDateString() + '</div>' +
        '<div class="actions"><button onclick="window.print()">🖨️ Print / Save as PDF</button></div>';
      Object.keys(byEvent).sort().forEach(function(ev) {
        html += '<h2>' + ev + '</h2>';
        byEvent[ev].forEach(function(t) {
          html += '<div class="item"><div class="term">' + t.term + '</div><div class="def">' + t.def + '</div></div>';
        });
      });
      html += '</body></html>';
      var w = window.open('', '_blank');
      if (!w) { if (window.hosaToast) window.hosaToast('🚫', 'Pop-up blocked', 'Allow pop-ups to use the cheat sheet export.', 'info'); return; }
      w.document.open(); w.document.write(html); w.document.close();
      if (window.hosaToast) window.hosaToast('📄', 'Cheat sheet ready', items.length + ' terms · use the Print button to save as PDF', 'good');
    });
  }
  document.addEventListener('DOMContentLoaded', function() { setTimeout(wire, 500); });
  if (document.readyState !== 'loading') setTimeout(wire, 500);
  setInterval(wire, 2000);
})();

/* ── ?game= URL param: auto-open game from external link ────── */
(function() {
  function openFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var game = params.get('game');
    if (!game) return;
    history.replaceState({}, '', window.location.pathname);
    setTimeout(function() {
      if (game === 'match' && typeof window.__hosaOpenMatch === 'function') window.__hosaOpenMatch();
      else if (game === 'speed' && typeof window.__hosaOpenSpeedDrill === 'function') window.__hosaOpenSpeedDrill();
      else if (game === 'quickreview' && typeof window.__hosaOpenQR === 'function') window.__hosaOpenQR();
      else if (game === 'typing' && typeof window.__hosaOpenTyping === 'function') window.__hosaOpenTyping();
      else if (game === 'truefalse' && typeof window.__hosaOpenTF === 'function') window.__hosaOpenTF();
    }, 400);
  }
  if (document.readyState !== 'loading') openFromUrl();
  else document.addEventListener('DOMContentLoaded', openFromUrl);
})();

/* ═══════════════════════════════════════════════════════════════
   TYPING CHALLENGE — type the definition, score by word overlap
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = null;
  var timer = null;
  var timeLeft = 90;
  var currentTerm = null;
  var sessionXP = 0;

  function wordScore(typed, real) {
    function clean(s) { return s.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(Boolean); }
    var t = clean(typed), r = clean(real);
    if (!r.length) return 0;
    var hits = t.filter(function(w){ return r.indexOf(w) !== -1; }).length;
    return Math.min(100, Math.round(hits / r.length * 100));
  }

  function pickTerm() {
    var pool = window.HOSA_TERMS;
    if (!pool || !pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function build() {
    var el = document.createElement('div');
    el.id = 'tc-overlay';
    el.className = 'tc-overlay';
    el.innerHTML =
      '<div class="tc-panel">' +
        '<button class="tc-close" id="tc-close" aria-label="Close">✕</button>' +
        '<div class="tc-header"><span class="tc-icon">⌨️</span><h2>Typing Challenge</h2></div>' +
        '<div class="tc-timer-row"><div class="tc-timer-bar"><div id="tc-timer-fill"></div></div><span id="tc-timer-num">90</span>s</div>' +
        '<div class="tc-term-box"><div class="tc-term-label">Define this term:</div><div id="tc-term-name" class="tc-term-name"></div></div>' +
        '<textarea id="tc-input" class="tc-input" placeholder="Type the definition here…" rows="4"></textarea>' +
        '<div id="tc-result" class="tc-result" style="display:none;"></div>' +
        '<div class="tc-actions">' +
          '<button id="tc-check" class="tc-btn-primary">Check Answer</button>' +
          '<button id="tc-next" class="tc-btn-secondary" style="display:none;">Next Term →</button>' +
        '</div>' +
        '<div class="tc-session-xp">Session XP earned: <strong id="tc-sess-xp">0</strong></div>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('#tc-close').addEventListener('click', close);
    el.addEventListener('click', function(e){ if (e.target === el) close(); });
    el.querySelector('#tc-check').addEventListener('click', checkAnswer);
    el.querySelector('#tc-next').addEventListener('click', nextTerm);
    document.addEventListener('keydown', onKey);
    overlay = el;
  }

  function onKey(e) {
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key === 'Escape') close();
  }

  function startTimer() {
    timeLeft = 90;
    updateTimerUI();
    clearInterval(timer);
    timer = setInterval(function() {
      timeLeft--;
      updateTimerUI();
      if (timeLeft <= 0) {
        clearInterval(timer);
        checkAnswer();
      }
    }, 1000);
  }

  function updateTimerUI() {
    var fill = document.getElementById('tc-timer-fill');
    var num = document.getElementById('tc-timer-num');
    if (fill) fill.style.width = (timeLeft / 90 * 100) + '%';
    if (num) num.textContent = timeLeft;
    if (fill) fill.className = timeLeft <= 20 ? 'tc-timer-urgent' : '';
  }

  function nextTerm() {
    currentTerm = pickTerm();
    if (!currentTerm) return;
    var nameEl = document.getElementById('tc-term-name');
    var input = document.getElementById('tc-input');
    var result = document.getElementById('tc-result');
    var checkBtn = document.getElementById('tc-check');
    var nextBtn = document.getElementById('tc-next');
    if (nameEl) nameEl.textContent = currentTerm.term;
    if (input) { input.value = ''; input.disabled = false; input.focus(); }
    if (result) result.style.display = 'none';
    if (checkBtn) checkBtn.style.display = '';
    if (nextBtn) nextBtn.style.display = 'none';
    startTimer();
  }

  function checkAnswer() {
    if (!currentTerm) return;
    clearInterval(timer);
    var input = document.getElementById('tc-input');
    var result = document.getElementById('tc-result');
    var checkBtn = document.getElementById('tc-check');
    var nextBtn = document.getElementById('tc-next');
    var typed = input ? input.value.trim() : '';
    var score = typed ? wordScore(typed, currentTerm.def) : 0;
    // XP: 0.5 per accuracy point (100% = 50 XP, 70% = 35 XP) to match other game modes
    var xpGain = Math.floor(score * 0.5);
    sessionXP += xpGain;

    var grade = score >= 70 ? 'good' : score >= 40 ? 'ok' : 'bad';
    var label = score >= 70 ? '✓ Great!' : score >= 40 ? '~ Partial' : '✗ Missed';
    if (result) {
      result.style.display = '';
      result.className = 'tc-result tc-result-' + grade;
      result.innerHTML =
        '<div class="tc-score-row"><span class="tc-score-num">' + score + '%</span><span class="tc-score-label">' + label + '</span><span class="tc-xp-badge">+' + xpGain + ' XP</span></div>' +
        '<div class="tc-correct-def"><strong>Correct:</strong> ' + escHtml(currentTerm.def) + '</div>';
    }
    if (input) input.disabled = true;
    if (checkBtn) checkBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = '';

    var sessEl = document.getElementById('tc-sess-xp');
    if (sessEl) sessEl.textContent = sessionXP;

    var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10) || 0;
    localStorage.setItem('hosa::xp', String(xp + xpGain));
    if (xpGain > 0 && typeof window.hosaToast === 'function') window.hosaToast('⌨️', 'Typing Challenge', score + '% accuracy · +' + xpGain + ' XP', score >= 70 ? 'good' : 'info');
    if (score >= 80 && typeof window.hosaConfetti === 'function') window.hosaConfetti({count:60});

    try {
      var best = JSON.parse(localStorage.getItem('hosa::typing-best') || 'null');
      if (!best || score > best.score) {
        localStorage.setItem('hosa::typing-best', JSON.stringify({score: score, date: new Date().toISOString()}));
      }
    } catch(e) {}
  }

  function escHtml(s) {
    return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function open() {
    sessionXP = 0;
    if (!overlay) build();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    nextTerm();
  }

  function close() {
    if (!overlay) return;
    clearInterval(timer);
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    overlay = null;
  }

  window.__hosaOpenTyping = open;
})();

/* ═══════════════════════════════════════════════════════════════
   TRUE/FALSE BLITZ — 30-second sprint with combo multiplier
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = null;
  var timer = null;
  var timeLeft = 30;
  var score = 0;
  var combo = 0;
  var total = 0;
  var correct = 0;
  var currentTerm = null;
  var currentIsTrue = false;
  var answered = false;

  function pickRound() {
    var pool = window.HOSA_TERMS;
    if (!pool || pool.length < 2) return null;
    var term = pool[Math.floor(Math.random() * pool.length)];
    var isTrue = Math.random() < 0.5;
    var def;
    if (isTrue) {
      def = term.def;
    } else {
      var other;
      do { other = pool[Math.floor(Math.random() * pool.length)]; } while (other === term);
      def = other.def;
    }
    return {term: term.term, def: def, isTrue: isTrue};
  }

  function build() {
    var el = document.createElement('div');
    el.id = 'tf-overlay';
    el.className = 'tf-overlay';
    el.innerHTML =
      '<div class="tf-panel">' +
        '<button class="tf-close" id="tf-close" aria-label="Close">✕</button>' +
        '<div class="tf-header">' +
          '<span class="tf-icon">🎯</span><h2>True/False Blitz</h2>' +
          '<div class="tf-combo" id="tf-combo"></div>' +
        '</div>' +
        '<div class="tf-timer-bar"><div id="tf-timer-fill" class="tf-timer-fill"></div></div>' +
        '<div class="tf-stats-row">' +
          '<span id="tf-time-num" class="tf-time">30</span>' +
          '<span class="tf-score-live">Score: <strong id="tf-score-live">0</strong></span>' +
        '</div>' +
        '<div id="tf-card" class="tf-card">' +
          '<div id="tf-term" class="tf-term"></div>' +
          '<div class="tf-sep">is defined as</div>' +
          '<div id="tf-def" class="tf-def"></div>' +
        '</div>' +
        '<div id="tf-flash" class="tf-flash" style="display:none;"></div>' +
        '<div class="tf-buttons">' +
          '<button id="tf-true" class="tf-btn tf-btn-true">✓ TRUE</button>' +
          '<button id="tf-false" class="tf-btn tf-btn-false">✗ FALSE</button>' +
        '</div>' +
        '<div id="tf-end" class="tf-end" style="display:none;"></div>' +
      '</div>';
    document.body.appendChild(el);

    el.querySelector('#tf-close').addEventListener('click', close);
    el.addEventListener('click', function(e){ if (e.target === el) close(); });
    el.querySelector('#tf-true').addEventListener('click', function(){ answer(true); });
    el.querySelector('#tf-false').addEventListener('click', function(){ answer(false); });
    document.addEventListener('keydown', onKey);
    overlay = el;
  }

  function onKey(e) {
    if (!overlay || overlay.style.display === 'none') return;
    if (e.key === 'Escape') { close(); return; }
    var endEl = document.getElementById('tf-end');
    if (endEl && endEl.style.display !== 'none') return;
    if (e.key === 't' || e.key === 'T') answer(true);
    if (e.key === 'f' || e.key === 'F') answer(false);
  }

  function startTimer() {
    timeLeft = 30;
    updateTimer();
    clearInterval(timer);
    timer = setInterval(function() {
      timeLeft--;
      updateTimer();
      if (timeLeft <= 0) { clearInterval(timer); showEnd(); }
    }, 1000);
  }

  function updateTimer() {
    var fill = document.getElementById('tf-timer-fill');
    var num = document.getElementById('tf-time-num');
    if (fill) {
      fill.style.width = (timeLeft / 30 * 100) + '%';
      fill.style.background = timeLeft <= 10 ? '#c8102e' : timeLeft <= 20 ? '#f0a500' : '#30d158';
    }
    if (num) num.textContent = timeLeft;
  }

  function nextRound() {
    var round = pickRound();
    if (!round) return;
    currentTerm = round;
    currentIsTrue = round.isTrue;
    answered = false;
    var term = document.getElementById('tf-term');
    var def = document.getElementById('tf-def');
    if (term) term.textContent = round.term;
    if (def) def.textContent = round.def;
    var card = document.getElementById('tf-card');
    if (card) card.className = 'tf-card';
  }

  function answer(userSaysTrue) {
    if (answered) return;
    answered = true;
    total++;
    var isCorrect = (userSaysTrue === currentIsTrue);
    var flash = document.getElementById('tf-flash');
    if (isCorrect) {
      correct++;
      combo++;
      var mult = Math.min(3, 1 + Math.floor((combo - 1) / 2));
      var pts = Math.round(10 * mult);
      score += pts;
      if (flash) { flash.textContent = '+' + pts + (combo > 2 ? ' 🔥 x' + mult : ''); flash.className = 'tf-flash tf-flash-good'; flash.style.display = ''; setTimeout(function(){ if(flash)flash.style.display='none'; }, 700); }
      var comboEl = document.getElementById('tf-combo');
      if (comboEl) comboEl.textContent = combo > 1 ? combo + 'x combo!' : '';
    } else {
      combo = 0;
      score = Math.max(0, score - 5);
      if (flash) { flash.textContent = '-5'; flash.className = 'tf-flash tf-flash-bad'; flash.style.display = ''; setTimeout(function(){ if(flash)flash.style.display='none'; }, 700); }
      var comboEl2 = document.getElementById('tf-combo');
      if (comboEl2) comboEl2.textContent = '';
    }
    var liveScore = document.getElementById('tf-score-live');
    if (liveScore) liveScore.textContent = score;
    var card = document.getElementById('tf-card');
    if (card) card.className = 'tf-card ' + (isCorrect ? 'tf-card-correct' : 'tf-card-wrong');
    setTimeout(nextRound, 350);
  }

  function showEnd() {
    var end = document.getElementById('tf-end');
    var btns = overlay.querySelector('.tf-buttons');
    var card = document.getElementById('tf-card');
    if (card) card.style.display = 'none';
    if (btns) btns.style.display = 'none';

    var xpGain = Math.floor(score * 0.4); // ~40 XP at score 100, scales with combo
    var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10) || 0;
    localStorage.setItem('hosa::xp', String(xp + xpGain));

    try {
      var best = JSON.parse(localStorage.getItem('hosa::tf-best') || 'null');
      var isNew = !best || score > best.score;
      if (isNew) localStorage.setItem('hosa::tf-best', JSON.stringify({score:score, date:new Date().toISOString()}));
    } catch(e) { var isNew = false; }

    if (end) {
      end.style.display = '';
      end.innerHTML =
        '<div class="tf-end-score">' + score + '</div>' +
        '<div class="tf-end-label">Final Score</div>' +
        '<div class="tf-end-stats">' + correct + '/' + total + ' correct · +' + xpGain + ' XP' + (isNew ? ' · 🏆 New best!' : '') + '</div>' +
        '<button class="tc-btn-primary" id="tf-play-again">Play Again</button>';
      end.querySelector('#tf-play-again').addEventListener('click', restart);
    }

    if (score >= 50 && typeof window.hosaConfetti === 'function') window.hosaConfetti({count:80});
    if (typeof window.hosaToast === 'function') window.hosaToast('🎯', 'True/False Blitz', 'Score: ' + score + ' · +' + xpGain + ' XP', score >= 50 ? 'good' : 'info');
  }

  function restart() {
    score = 0; combo = 0; total = 0; correct = 0; answered = false;
    var end = document.getElementById('tf-end');
    var btns = overlay ? overlay.querySelector('.tf-buttons') : null;
    var card = document.getElementById('tf-card');
    var liveScore = document.getElementById('tf-score-live');
    if (end) end.style.display = 'none';
    if (btns) btns.style.display = '';
    if (card) { card.style.display = ''; card.className = 'tf-card'; }
    if (liveScore) liveScore.textContent = '0';
    var comboEl = document.getElementById('tf-combo');
    if (comboEl) comboEl.textContent = '';
    nextRound();
    startTimer();
  }

  function open() {
    if (!overlay) build();
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    restart();
  }

  function close() {
    if (!overlay) return;
    clearInterval(timer);
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    overlay = null;
  }

  window.__hosaOpenTF = open;
})();

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS OVERLAY — press ? to show, M/S/T for games
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var overlay = null;

  var SHORTCUTS = [
    {group:'Navigation', items:[
      {key:'J / K', desc:'Previous / next card'},
      {key:'← →', desc:'Navigate cards'},
      {key:'Space', desc:'Flip card'},
    ]},
    {group:'Rating (after flip)',items:[
      {key:'1', desc:'Again — needs more practice'},
      {key:'2', desc:'Hard'},
      {key:'3', desc:'Good'},
      {key:'4', desc:'Easy'},
      {key:'5', desc:'Perfect — boost interval'},
    ]},
    {group:'Games',items:[
      {key:'M', desc:'Open Match Game'},
      {key:'S', desc:'Open Speed Drill'},
      {key:'T', desc:'Open Typing Challenge'},
    ]},
    {group:'General',items:[
      {key:'?', desc:'Toggle this shortcuts panel'},
      {key:'Esc', desc:'Close any overlay'},
      {key:'⌘ K', desc:'Command palette'},
    ]},
  ];

  function build() {
    var el = document.createElement('div');
    el.id = 'kb-overlay';
    el.className = 'kb-overlay';
    var inner = '<div class="kb-panel"><button class="kb-close" id="kb-close">✕</button><h2 class="kb-title">⌨️ Keyboard Shortcuts</h2><div class="kb-grid">';
    SHORTCUTS.forEach(function(group) {
      inner += '<div class="kb-group"><div class="kb-group-title">' + group.group + '</div>';
      group.items.forEach(function(item) {
        inner += '<div class="kb-row"><kbd class="kb-key">' + item.key + '</kbd><span class="kb-desc">' + item.desc + '</span></div>';
      });
      inner += '</div>';
    });
    inner += '</div></div>';
    el.innerHTML = inner;
    document.body.appendChild(el);
    el.querySelector('#kb-close').addEventListener('click', close);
    el.addEventListener('click', function(e){ if(e.target===el) close(); });
    overlay = el;
  }

  function open() { if (!overlay) build(); overlay.classList.add('kb-visible'); }
  function close() { if (overlay) overlay.classList.remove('kb-visible'); }

  // M/S/T game shortcuts (? is handled by original shortcuts-overlay handler)
  document.addEventListener('keydown', function(e) {
    var tag = (document.activeElement || {}).tagName;
    var editable = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement||{}).isContentEditable;
    if (editable) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // Close kb-overlay on Esc
    if (e.key === 'Escape' && overlay && overlay.classList.contains('kb-visible')) { close(); return; }
    if (overlay && overlay.classList.contains('kb-visible')) return;
    if (e.key === 'm' || e.key === 'M') { if (typeof window.__hosaOpenMatch === 'function') { e.preventDefault(); window.__hosaOpenMatch(); } }
    if (e.key === 's' || e.key === 'S') { if (typeof window.__hosaOpenSpeedDrill === 'function') { e.preventDefault(); window.__hosaOpenSpeedDrill(); } }
    if (e.key === 't' || e.key === 'T') { if (typeof window.__hosaOpenTyping === 'function') { e.preventDefault(); window.__hosaOpenTyping(); } }
  });

  // __hosaOpenShortcuts opens the inline kb-overlay (enhanced version)
  window.__hosaOpenShortcuts = open;
})();

/* ═══════════════════════════════════════════════════════════════
   FOCUS MODE — distraction-free full-width study
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var active = false;
  var btn = null;

  function build() {
    btn = document.createElement('button');
    btn.id = 'focus-mode-btn';
    btn.className = 'focus-mode-btn';
    btn.title = 'Toggle Focus Mode';
    btn.textContent = '🎧';
    btn.addEventListener('click', toggle);
    var topbar = document.getElementById('topbar');
    if (topbar) topbar.appendChild(btn);
    else document.body.appendChild(btn);
  }

  function toggle() {
    active = !active;
    document.body.classList.toggle('focus-mode', active);
    if (btn) {
      btn.textContent = active ? '✕' : '🎧';
      btn.title = active ? 'Exit Focus Mode (Esc)' : 'Enter Focus Mode';
      btn.classList.toggle('focus-active', active);
    }
    if (active && typeof window.hosaToast === 'function') window.hosaToast('🎧', 'Focus Mode', 'Press Esc or click ✕ to exit', 'info');
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && active) toggle();
  });

  if (document.readyState !== 'loading') build();
  else document.addEventListener('DOMContentLoaded', build);

  window.__hosaToggleFocus = toggle;
})();

/* ═══════════════════════════════════════════════════════════════
   XP PROGRESS BAR — animated bar in topbar showing next-level %
   ═══════════════════════════════════════════════════════════════ */
(function() {
  function xpLevel(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }
  function xpForLevel(lvl) { return (lvl - 1) * (lvl - 1) * 50; }

  var bar = null;
  var fill = null;
  var lastXP = -1;

  function build() {
    if (document.getElementById('xp-bar-wrap')) {
      bar = document.getElementById('xp-bar-wrap');
      fill = document.getElementById('xp-bar-fill');
      return true;
    }
    var topbar = document.getElementById('topbar');
    if (!topbar) return false;
    var wrap = document.createElement('div');
    wrap.id = 'xp-bar-wrap';
    wrap.className = 'xp-bar-wrap';
    fill = document.createElement('div');
    fill.id = 'xp-bar-fill';
    fill.className = 'xp-bar-fill';
    wrap.appendChild(fill);
    topbar.appendChild(wrap);
    bar = wrap;
    return true;
  }

  function update() {
    if (!fill) return;
    var xp = parseInt(localStorage.getItem('hosa::xp') || '0', 10);
    if (xp === lastXP) return;
    var gained = xp > lastXP && lastXP >= 0;
    lastXP = xp;
    var lvl = xpLevel(xp);
    var base = xpForLevel(lvl);
    var next = xpForLevel(lvl + 1);
    var pct = next > base ? Math.min(100, Math.round((xp - base) / (next - base) * 100)) : 100;
    fill.style.width = pct + '%';
    if (gained) {
      fill.classList.add('xp-bar-pulse');
      setTimeout(function(){ fill.classList.remove('xp-bar-pulse'); }, 600);
    }
  }

  function init() {
    if (!build()) return;
    update();
    setInterval(update, 2000);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

/* ═══════════════════════════════════════════════════════════════
   DAILY STUDY PATH — prioritized "today's path" on home tab
   ═══════════════════════════════════════════════════════════════ */
(function() {
  var section = document.getElementById('daily-path-section');
  if (!section) return;

  function render() {
    var due = [];
    try {
      if (typeof window.hosaDueToday === 'function') due = window.hosaDueToday();
    } catch(e) {}

    due.sort(function(a, b){ return (b.due || 0) - (a.due || 0); });
    var steps = due.slice(0, 3);

    if (!steps.length) {
      var keys = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.startsWith('hosa::') && k !== 'hosa::xp' && k !== 'hosa::streak' && k !== 'hosa::sound') keys.push(k);
        }
      } catch(e) {}
      if (!keys.length) { section.style.display = 'none'; return; }
    }

    section.style.display = '';
    var html = '<div class="dp-wrap"><div class="dp-header"><span class="dp-icon" data-ic="path" aria-hidden="true"></span><div><div class="dp-title">Today\'s Study Path</div><div class="dp-sub">Your prioritized plan for today</div></div></div><div class="dp-steps">';

    if (steps.length) {
      steps.forEach(function(s, i) {
        var label = s.due > 0 ? s.due + ' card' + (s.due !== 1 ? 's' : '') + ' due' : 'Explore';
        html += '<a href="' + s.slug + '.html" class="dp-step">' +
          '<div class="dp-step-num">' + (i + 1) + '</div>' +
          '<div class="dp-step-body"><div class="dp-step-title">' + escHtml(s.name || s.title || s.slug) + '</div><div class="dp-step-sub">' + label + '</div></div>' +
          '<div class="dp-arrow">→</div>' +
        '</a>';
      });
    } else {
      html += '<a href="index.html" class="dp-step"><div class="dp-step-num">1</div><div class="dp-step-body"><div class="dp-step-title">Start studying</div><div class="dp-step-sub">Pick any event to begin</div></div><div class="dp-arrow">→</div></a>';
    }

    html += '</div></div>';
    section.innerHTML = html;
  }

  function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  if (document.readyState !== 'loading') setTimeout(render, 300);
  else document.addEventListener('DOMContentLoaded', function(){ setTimeout(render, 300); });
})();

/* ═══════════════════════════════════════════════════════════════
   LEVEL LEADERBOARD — seeded fake players + live user row
   ═══════════════════════════════════════════════════════════════ */
(function() {
  function xpLevel(xp) { return Math.floor(Math.sqrt(xp / 50)) + 1; }
  function xpForLevel(lvl) { return (lvl - 1) * (lvl - 1) * 50; }

  // Seeded fake players — realistic spread of XP/levels, email-prefix style names
  var SEED_PLAYERS = [
    {name: 'priya.nair',         xp: 184250, avatar: '🧬'},
    {name: 'mchen2026',          xp: 168400, avatar: '🩺'},
    {name: 'sofia_hernandez',    xp: 152900, avatar: '💉'},
    {name: 'ethanpark',          xp: 142800, avatar: '🔬'},
    {name: 'aaliyah.j',          xp: 131200, avatar: '🧠'},
    {name: 'd.kim2025',          xp: 122600, avatar: '⚕️'},
    {name: 'oliviamartinez',     xp: 118400, avatar: '🦴'},
    {name: 'jaden_wright',       xp: 108700, avatar: '🫀'},
    {name: 'zara.patel21',       xp: 102300, avatar: '🧪'},
    {name: 'lrivera',            xp:  96300, avatar: '🩹'},
    {name: 'maya.singh',         xp:  88400, avatar: '🧬'},
    {name: 'noah_thompson',      xp:  82100, avatar: '🩺'},
    {name: 'avarobinson',        xp:  78900, avatar: '⚕️'},
    {name: 'ryan.obrien',        xp:  73200, avatar: '🔬'},
    {name: 'isabellag',          xp:  68900, avatar: '💊'},
    {name: 'tbrooks23',          xp:  64500, avatar: '🧠'},
    {name: 'chloe.liu',          xp:  62100, avatar: '🦴'},
    {name: 'jordancarter',       xp:  58700, avatar: '🩹'},
    {name: 'emma.davis',         xp:  54300, avatar: '🧪'},
    {name: 'cmendoza',           xp:  49850, avatar: '🫀'},
    {name: 'hannah_lee',         xp:  46100, avatar: '⚕️'},
    {name: 'jackanderson',       xp:  42500, avatar: '🩺'},
    {name: 'amelia.foster',      xp:  38200, avatar: '🧬'},
    {name: 'liam_walker',        xp:  35100, avatar: '💉'},
    {name: 'sophia.rodriguez',   xp:  32400, avatar: '🩺'},
    {name: 'mason.bennett',      xp:  29400, avatar: '🔬'},
    {name: 'mia_richardson',     xp:  27100, avatar: '🧠'},
    {name: 'oliver.scott',       xp:  24800, avatar: '⚕️'},
    {name: 'charlotte.t',        xp:  22150, avatar: '🦴'},
    {name: 'elijahcooper',       xp:  20300, avatar: '🫀'},
    {name: 'abigail_morgan',     xp:  18600, avatar: '🧪'},
    {name: 'jamesreed',          xp:  16800, avatar: '🩹'},
    {name: 'harper.bailey',      xp:  15300, avatar: '🧬'},
    {name: 'benjamin.gray',      xp:  13900, avatar: '🩺'},
    {name: 'evelyn_cox',         xp:  12450, avatar: '⚕️'},
    {name: 'henrywood',          xp:  11200, avatar: '🔬'},
    {name: 'amelia.h',           xp:  10100, avatar: '💊'},
    {name: 'sebastiankelly',     xp:   9200, avatar: '⚕️'},
    {name: 'aria_powell',        xp:   8400, avatar: '🧠'},
    {name: 'mateo.diaz',         xp:   7600, avatar: '🦴'},
    {name: 'scarlett.h',         xp:   6750, avatar: '🔬'},
    {name: 'logan_butler',       xp:   6100, avatar: '🫀'},
    {name: 'gianna.barnes',      xp:   5500, avatar: '🧪'},
    {name: 'jaxon.fisher',       xp:   4900, avatar: '💊'},
    {name: 'penelope.r',         xp:   4400, avatar: '🩹'},
    {name: 'leo_henderson',      xp:   3900, avatar: '🧬'},
    {name: 'nora.coleman',       xp:   3400, avatar: '🧠'},
    {name: 'eli.simmons',        xp:   3000, avatar: '🩺'},
    {name: 'lily_perry',         xp:   2700, avatar: '⚕️'},
    {name: 'asher_long',         xp:   2300, avatar: '🦴'},
    {name: 'aubrey.ross',        xp:   2050, avatar: '💉'},
    {name: 'isaac.washington',   xp:   1800, avatar: '🔬'},
    {name: 'hazel_jenkins',      xp:   1500, avatar: '🩹'},
    {name: 'grayson.b',          xp:   1300, avatar: '🧪'},
    {name: 'zoey.alexander',     xp:   1100, avatar: '🫀'},
    {name: 'levi_russell',       xp:    950, avatar: '🧪'},
    {name: 'paisley.griffin',    xp:    820, avatar: '🩺'},
    {name: 'wyatt.hughes',       xp:    700, avatar: '🧬'},
    {name: 'savannah_sanders',   xp:    600, avatar: '⚕️'},
    {name: 'lincoln.price',      xp:    520, avatar: '🫀'},
    {name: 'genesis.myers',      xp:    450, avatar: '🦴'},
    {name: 'theodore.h',         xp:    380, avatar: '🧠'},
    {name: 'addison_torres',     xp:    320, avatar: '🩹'},
    {name: 'aaron.bell',         xp:    280, avatar: '⚕️'},
    {name: 'kennedy.murphy',     xp:    240, avatar: '🔬'},
    {name: 'declanrogers',       xp:    210, avatar: '💊'},
    {name: 'natalie.j',          xp:    185, avatar: '🧪'},
    {name: 'colton_phillips',    xp:    165, avatar: '🩺'},
    {name: 'naomi.evans',        xp:    140, avatar: '🩺'},
    {name: 'cooper_morris',      xp:    122, avatar: '🧬'},
    {name: 'jasmine.rivera',     xp:    108, avatar: '⚕️'},
    {name: 'easton.parker',      xp:     95, avatar: '🦴'},
    {name: 'eliana_collins',     xp:     84, avatar: '🫀'},
    {name: 'nolan.hayes',        xp:     74, avatar: '🩹'},
    {name: 'autumn.ward',        xp:     65, avatar: '🧠'},
    {name: 'jeremiah.b',         xp:     57, avatar: '🔬'},
    {name: 'arielfoster',        xp:     50, avatar: '💉'},
    {name: 'roman_diaz',         xp:     44, avatar: '🧪'},
    {name: 'piper.gomez',        xp:     38, avatar: '⚕️'},
    {name: 'xavierjenkins',      xp:     33, avatar: '🩺'},
    {name: 'serenity_perry',     xp:     29, avatar: '🦴'},
    {name: 'silas.griffin',      xp:     25, avatar: '🧬'},
    {name: 'gabriella.k',        xp:     22, avatar: '🩹'},
    {name: 'austin_torres',      xp:     19, avatar: '🧠'},
    {name: 'eden.cox',           xp:     16, avatar: '🫀'},
    {name: 'jaxonbailey',        xp:     14, avatar: '⚕️'},
    {name: 'maya.cole',          xp:     12, avatar: '💊'},
    {name: 'christianreed',      xp:     10, avatar: '🩺'},
    {name: 'reagan_wood',        xp:      8, avatar: '🔬'},
    {name: 'kaisonbrown',        xp:      6, avatar: '🧬'},
    {name: 'alaia.foster',       xp:      5, avatar: '⚕️'},
    {name: 'brycemorgan',        xp:      4, avatar: '🩹'},
    {name: 'amaya_kelly',        xp:      3, avatar: '🧪'},
    {name: 'judewright',         xp:      2, avatar: '🧠'},
    {name: 'nora.simmons',       xp:      2, avatar: '⚕️'},
    {name: 'rhett_long',         xp:      1, avatar: '🦴'},
    {name: 'arya.b',             xp:      1, avatar: '🩺'},
    {name: 'maverickross',       xp:      1, avatar: '🩹'},
    {name: 'kinsleyhowell',      xp:      1, avatar: '🫀'},
    {name: 'beau.murray',        xp:      1, avatar: '💉'},
    {name: 'royal_freeman',      xp:      1, avatar: '🔬'},
    {name: 'ophelia.k',          xp:      1, avatar: '🧬'},
    {name: 'kairo_west',         xp:      1, avatar: '🧠'},
    {name: 'junevance33',             xp:    854, avatar: '🩺'},
    {name: 'mabel.u',                 xp:  31495, avatar: '🧪'},
    {name: 'dev_solis',               xp:     54, avatar: '🔬'},
    {name: 'blaiseunderwood',         xp:     90, avatar: '🦴'},
    {name: 'xander_snow',             xp:    194, avatar: '🦴'},
    {name: 'vera.calderon23',         xp:    144, avatar: '🫀'},
    {name: 'reed.v',                  xp:    743, avatar: '🩹'},
    {name: 'cira_tran',               xp:  30871, avatar: '🧠'},
    {name: 'rhea_nakamura',           xp:    750, avatar: '⚕️'},
    {name: 'zanedunn',                xp:    799, avatar: '💊'},
    {name: 'tessavaldez70',           xp:     21, avatar: '🫀'},
    {name: 'hughsnow73',              xp:    432, avatar: '🧬'},
    {name: 'uma.lambert',             xp:    316, avatar: '🩹'},
    {name: 'quillvega52',             xp:     83, avatar: '🫀'},
    {name: 'opal_pike',               xp:     34, avatar: '🩹'},
    {name: 'ulric24',                 xp:    241, avatar: '🧪'},
    {name: 'nev.marsh21',             xp:    263, avatar: '💊'},
    {name: 'tess.valdez',             xp:     60, avatar: '🧪'},
    {name: 'amara.solis21',           xp:     88, avatar: '🧪'},
    {name: 'enzohartley16',           xp:    261, avatar: '🫀'},
    {name: 'avayoon35',               xp:     98, avatar: '💉'},
    {name: 'raya.tillman',            xp:     65, avatar: '🩹'},
    {name: 'lananavarro',             xp:     68, avatar: '🧬'},
    {name: 'sage.mercer',             xp:     40, avatar: '🔬'},
    {name: 'ruby21',                  xp:      9, avatar: '🧪'},
    {name: 'wrenblythe72',            xp:    640, avatar: '🩹'},
    {name: 'tess_yoon',               xp:     26, avatar: '🧠'},
    {name: 'maeveashford58',          xp:     58, avatar: '🩺'},
    {name: 'zion.crane',              xp:     30, avatar: '🩹'},
    {name: 'sana.lowe',               xp:   9834, avatar: '🧬'},
    {name: 'ulla22',                  xp:     28, avatar: '🧪'},
    {name: 'arlo25',                  xp:    584, avatar: '🦴'},
    {name: 'jett.cole',               xp:    520, avatar: '🫀'},
    {name: 'jonahbarlow14',           xp:  45473, avatar: '🩺'},
    {name: 'zion_hale',               xp:  25050, avatar: '🧠'},
    {name: 'fenn.holt21',             xp:     71, avatar: '🩺'},
    {name: 'cole21',                  xp:     31, avatar: '💉'},
    {name: 'ode.m',                   xp:     22, avatar: '🦴'},
    {name: 'avaengel',                xp:    848, avatar: '🧪'},
    {name: 'lior_navarro',            xp:     75, avatar: '🧪'},
    {name: 'eliasfinch',              xp:     65, avatar: '🧪'},
    {name: 'willa21',                 xp:   9907, avatar: '💊'},
    {name: 'wade.farris',             xp:      6, avatar: '🩹'},
    {name: 'rheagentry74',            xp:     34, avatar: '🔬'},
    {name: 'quillholt',               xp:     39, avatar: '🫀'},
    {name: 'quill.varga21',           xp:     73, avatar: '🩺'},
    {name: 'tessa_quintero',          xp:  46745, avatar: '🩺'},
    {name: 'yaradunn',                xp:     91, avatar: '🧠'},
    {name: 'ziggylowe40',             xp:     14, avatar: '💉'},
    {name: 'drew.reyes',              xp:    388, avatar: '🩹'},
    {name: 'oriondelgado',            xp:     34, avatar: '🧪'},
    {name: 'minka.pike21',            xp:     36, avatar: '🧬'},
    {name: 'ava.benson22',            xp:     21, avatar: '🫀'},
    {name: 'ulric.solis',             xp:     89, avatar: '💉'},
    {name: 'ivanmoreau',              xp:  17704, avatar: '🧬'},
    {name: 'onyx.dunn21',             xp:    355, avatar: '💊'},
    {name: 'iris.calderon25',         xp:     96, avatar: '💉'},
    {name: 'wade_ortiz',              xp:  44540, avatar: '🦴'},
    {name: 'zion_snow',               xp:    139, avatar: '🫀'},
    {name: 'sana.hale24',             xp:    914, avatar: '🔬'},
    {name: 'theovance53',             xp:    985, avatar: '🩺'},
    {name: 'holtcalderon53',          xp:     69, avatar: '⚕️'},
    {name: 'tariqreyes',              xp:     34, avatar: '🧬'},
    {name: 'milo.v',                  xp:     56, avatar: '🩹'},
    {name: 'silas.r',                 xp:    825, avatar: '🦴'},
    {name: 'ava.pruitt25',            xp:     95, avatar: '💊'},
    {name: 'lana.d',                  xp:     80, avatar: '⚕️'},
    {name: 'reedeverhart',            xp:     42, avatar: '🦴'},
    {name: 'liv_solis',               xp:     49, avatar: '💊'},
    {name: 'esme23',                  xp:      1, avatar: '🧠'},
    {name: 'juno.v',                  xp:     60, avatar: '🫀'},
    {name: 'anya_barlow',             xp:     95, avatar: '💉'},
    {name: 'cyrus26',                 xp:     12, avatar: '🔬'},
    {name: 'pia.crane22',             xp:  33092, avatar: '🫀'},
    {name: 'tessa.k',                 xp:    813, avatar: '🦴'},
    {name: 'nev_farris',              xp:     97, avatar: '🩺'},
    {name: 'tess_crane',              xp:     72, avatar: '🔬'},
    {name: 'reed_keller',             xp:     72, avatar: '🩹'},
    {name: 'rory.wexler24',           xp:     65, avatar: '🦴'},
    {name: 'blaise_schaefer',         xp:     97, avatar: '🔬'},
    {name: 'gabe.hartley25',          xp:     36, avatar: '🫀'},
    {name: 'bodhidelgado',            xp:    653, avatar: '🩺'},
    {name: 'knox_navarro',            xp:    319, avatar: '🩺'},
    {name: 'runegentry',              xp:    311, avatar: '🦴'},
    {name: 'jorah.schaefer25',        xp:  76456, avatar: '🦴'},
    {name: 'janalowe',                xp:    955, avatar: '🦴'},
    {name: 'sana_mercer',             xp:     50, avatar: '⚕️'},
    {name: 'nash_everhart',           xp:     69, avatar: '🧬'},
    {name: 'kara26',                  xp:  57179, avatar: '💉'},
    {name: 'fenn.oakes',              xp:    565, avatar: '⚕️'},
    {name: 'wes.g',                   xp:     54, avatar: '🧠'},
    {name: 'rhea.lozano',             xp:  46870, avatar: '🔬'},
    {name: 'solhartley98',            xp:  33411, avatar: '🔬'},
    {name: 'kira_whitlock',           xp:     15, avatar: '🩹'},
    {name: 'raulkeller49',            xp:    721, avatar: '🩺'},
    {name: 'zaneyoon',                xp:  41888, avatar: '🩹'},
    {name: 'gemmafarris11',           xp:     81, avatar: '🔬'},
    {name: 'iris.conway23',           xp:     16, avatar: '🩹'},
    {name: 'rosa24',                  xp:    618, avatar: '💊'},
    {name: 'xander.lowe24',           xp:  48472, avatar: '💊'},
    {name: 'eira_delgado',            xp:     84, avatar: '🧠'},
    {name: 'kade.k',                  xp:    972, avatar: '🔬'},
    {name: 'mabel.s',                 xp:     79, avatar: '💊'},
    {name: 'hugh.benson',             xp:    317, avatar: '⚕️'},
    {name: 'cleobenson',              xp:     72, avatar: '🧬'},
    {name: 'ursa_wexler',             xp:     63, avatar: '🧪'},
    {name: 'ximena.c',                xp:      3, avatar: '🩺'},
    {name: 'liv.c',                   xp:    695, avatar: '⚕️'},
    {name: 'ivo23',                   xp:     71, avatar: '⚕️'},
    {name: 'anika.c',                 xp:    223, avatar: '🔬'},
    {name: 'quillreyes99',            xp:     25, avatar: '🔬'},
    {name: 'kadesnow99',              xp:     37, avatar: '🩺'},
    {name: 'kya_wells',               xp:    825, avatar: '🧪'},
    {name: 'wren.snow',               xp:    229, avatar: '💊'},
    {name: 'minka.cole21',            xp:    590, avatar: '🫀'},
    {name: 'xander.oakes',            xp:   9564, avatar: '🦴'},
    {name: 'minka26',                 xp:  20555, avatar: '🩹'},
    {name: 'niko_marsh',              xp:     78, avatar: '🩹'},
    {name: 'theo24',                  xp:     39, avatar: '🩹'},
    {name: 'ulric25',                 xp:     95, avatar: '🩺'},
    {name: 'orion_yamamoto',          xp:  32439, avatar: '💉'},
    {name: 'bodhi.sterling',          xp:     61, avatar: '🧠'},
    {name: 'yukicrane',               xp:     59, avatar: '🩺'},
    {name: 'vivivarga',               xp:     26, avatar: '🦴'},
    {name: 'kai_quintero',            xp:     19, avatar: '🩺'},
    {name: 'elias.sterling23',        xp:     73, avatar: '🧠'},
    {name: 'zeke.r',                  xp:     35, avatar: '🧪'},
    {name: 'nev.imani',               xp:     95, avatar: '⚕️'},
    {name: 'amara.vance',             xp:     74, avatar: '🩹'},
    {name: 'kiragoddard75',           xp:  23962, avatar: '🫀'},
    {name: 'ursa.z',                  xp:     56, avatar: '💊'},
    {name: 'minka.m',                 xp:    786, avatar: '🩺'},
    {name: 'zane.b',                  xp:    510, avatar: '🧪'},
    {name: 'ivan.keller',             xp:    891, avatar: '🦴'},
    {name: 'tomas.lambert',           xp:      7, avatar: '🔬'},
    {name: 'ursa24',                  xp:    152, avatar: '🔬'},
    {name: 'enzo_solis',              xp:     63, avatar: '🩺'},
    {name: 'tariq22',                 xp:    664, avatar: '🧬'},
    {name: 'ode_marsh',               xp:     83, avatar: '💉'},
    {name: 'oonavarga67',             xp:     54, avatar: '🫀'},
    {name: 'hari.h',                  xp:    713, avatar: '🧪'},
    {name: 'faye.ortiz',              xp:    906, avatar: '🧪'},
    {name: 'enzo.lambert',            xp:    701, avatar: '🩹'},
    {name: 'minka_ortiz',             xp:     43, avatar: '🧪'},
    {name: 'gemmakeller',             xp:    492, avatar: '🔬'},
    {name: 'paxames',                 xp:     49, avatar: '🦴'},
    {name: 'tara.mercer',             xp:     43, avatar: '🩺'},
    {name: 'zeke24',                  xp:     53, avatar: '💊'},
    {name: 'vance.f',                 xp:     51, avatar: '💊'},
    {name: 'rheanakamura',            xp:    424, avatar: '💊'},
    {name: 'lior21',                  xp:  83727, avatar: '💊'},
    {name: 'junocrane57',             xp:     98, avatar: '💊'},
    {name: 'hugo_imani',              xp:      6, avatar: '⚕️'},
    {name: 'rubywells',               xp:  70621, avatar: '🦴'},
    {name: 'hana_sterling',           xp:     80, avatar: '💊'},
    {name: 'ximena22',                xp:     33, avatar: '🫀'},
    {name: 'beau.ashford',            xp:     21, avatar: '🩺'},
    {name: 'anyawexler',              xp:     55, avatar: '🧠'},
    {name: 'darionakamura',           xp:     14, avatar: '🔬'},
    {name: 'hughtran',                xp:     38, avatar: '🧬'},
    {name: 'lev.snow',                xp:      7, avatar: '🩹'},
    {name: 'oonamoreau',              xp:     29, avatar: '💊'},
    {name: 'jettwhitlock',            xp:     85, avatar: '💊'},
    {name: 'knox.yamamoto',           xp:  58779, avatar: '🧬'},
    {name: 'dane_everhart',           xp:    525, avatar: '💉'},
    {name: 'marco.blythe25',          xp:     35, avatar: '💉'},
    {name: 'beau.tillman24',          xp:     44, avatar: '🩺'},
    {name: 'greta.yoon',              xp:     87, avatar: '💊'},
    {name: 'lev.yoon25',              xp:  52717, avatar: '🧬'},
    {name: 'drew.quintero',           xp:     87, avatar: '🧠'},
    {name: 'hughlambert15',           xp:     61, avatar: '🧬'},
    {name: 'tobias22',                xp:  61852, avatar: '🧠'},
    {name: 'ode_reyes',               xp:    604, avatar: '🩺'},
    {name: 'vera22',                  xp:     86, avatar: '🧪'},
    {name: 'sorenunderwood21',        xp:     84, avatar: '🩺'},
    {name: 'minka.w',                 xp:     28, avatar: '🫀'},
    {name: 'anya_wexler',             xp:     48, avatar: '🧪'},
    {name: 'bram.q',                  xp:     59, avatar: '🩺'},
    {name: 'priyazimmer4',            xp:  44713, avatar: '🔬'},
    {name: 'wren22',                  xp:     71, avatar: '🔬'},
    {name: 'raul.lambert22',          xp:     77, avatar: '🧬'},
    {name: 'gabe_nakamura',           xp:    278, avatar: '🩺'},
    {name: 'dev.blythe',              xp:      3, avatar: '💉'},
    {name: 'drew_quinn',              xp:     96, avatar: '🩺'},
    {name: 'ivo.imani23',             xp:     58, avatar: '🧪'},
    {name: 'sana21',                  xp:     85, avatar: '🧪'},
    {name: 'nikokeller9',             xp:     52, avatar: '🦴'},
    {name: 'milomercer11',            xp:     42, avatar: '🩹'},
    {name: 'seth_frost',              xp:     71, avatar: '⚕️'},
    {name: 'hugh23',                  xp:     56, avatar: '🩺'},
    {name: 'kainakamura72',           xp:     28, avatar: '🦴'},
    {name: 'carmen_rojas',            xp:     52, avatar: '🦴'},
    {name: 'vera.a',                  xp:    256, avatar: '💊'},
    {name: 'ivo.frost',               xp:    862, avatar: '⚕️'},
    {name: 'arlo.solis',              xp:     86, avatar: '🩺'},
    {name: 'pax.calderon26',          xp:    838, avatar: '🧬'},
    {name: 'junovaldez',              xp:     28, avatar: '💉'},
    {name: 'kade.crane21',            xp:     48, avatar: '🩺'},
    {name: 'holt_tran',               xp:     80, avatar: '🩹'},
    {name: 'devvaldez36',             xp:  36818, avatar: '🧠'},
  ];

  // Real users fetched from Firebase. Uses the public leaderboard/level path
  // so signed-in users can see everyone else (the users/ path is per-user gated).
  var FIREBASE_USERS = [];
  var CHAPTER_MEMBERS = [];
  var LB_OK = false;
  function fetchFirebaseUsers(cb) {
    try {
      if (typeof firebase === 'undefined' || !firebase.database) { cb && cb(); return; }
      firebase.database().ref('leaderboard/level').once('value').then(function(snap) {
        var data = snap.val() || {};
        var out = [];
        var tagged = [];
        Object.keys(data).forEach(function(uid) {
          var u = data[uid] || {};
          var xp = parseInt(u.xp || 0, 10);
          var row = { uid: uid, name: u.name || 'Student', xp: xp, avatar: '👤',
                      days: parseInt(u.days || 0, 10) || 0,
                      chapter: u.chapter || '', chapterName: u.chapterName || '' };
          // Chapter membership counts from the moment someone opens the join
          // link; earning XP is a separate thing. The player board still hides
          // anyone on zero.
          if (row.chapter) tagged.push(row);
          if (xp <= 0) return;
          out.push(row);
        });
        FIREBASE_USERS = out;
        CHAPTER_MEMBERS = tagged;
        LB_OK = true;
        cb && cb();
      }).catch(function() { cb && cb(); });
    } catch(e) { cb && cb(); }
  }

  function currentUid() {
    try { return (firebase.auth().currentUser || {}).uid || null; } catch(e) { return null; }
  }

  function guestId() {
    try { return localStorage.getItem('hosa-guest-id') || null; } catch(e) { return null; }
  }

  function getUserName() {
    try { return localStorage.getItem('hosa-lb-name') || localStorage.getItem('hosa::username') || 'You'; } catch(e) { return 'You'; }
  }

  function getUserXP() {
    try { return parseInt(localStorage.getItem('hosa::xp') || '0', 10); } catch(e) { return 0; }
  }

  // Give a studying guest a stable, account-like display name so they appear on
  // the public board with a real-looking handle instead of "Student".
  var GUEST_FIRSTS = ['skylar','rowan','emerson','quinn','reese','sawyer','finley','blake','hayden','peyton','dakota','phoenix','harlow','ellis','sage','remy','tatum','aspen','lennox','marlowe','river','jordan','casey','alexis','morgan','tyler','devon','kendall','parker','avery'];
  function ensureGuestName() {
    var n = '';
    try { n = localStorage.getItem('hosa-lb-name') || ''; } catch(e) {}
    if (n) return n;
    var gid = guestId() || ('g-' + Math.random().toString(36).slice(2, 7));
    var h = 0; for (var i = 0; i < gid.length; i++) h = (h * 31 + gid.charCodeAt(i)) >>> 0;
    n = GUEST_FIRSTS[h % GUEST_FIRSTS.length] + '.' + (10 + (h % 89));
    try { localStorage.setItem('hosa-lb-name', n); } catch(e) {}
    return n;
  }

  // Mirror a studying guest onto the public leaderboard. Signed-in users are
  // already synced by the auth handler; guests are keyed by their stable
  // hosa-guest-id so everyone can see them too. Only writes once they have XP
  // (i.e. they've actually studied) so the board isn't flooded with empties.
  // Distinct days this browser has studied on. "Active" on chapters.html
  // means three separate days, so a burst of sign-ups in one sitting can't
  // inflate a chapter.
  function activeDays() {
    try {
      var today = new Date().toISOString().slice(0, 10);
      var last  = localStorage.getItem('hosa::last-study-day') || '';
      var n     = parseInt(localStorage.getItem('hosa::study-days') || '0', 10) || 0;
      if (getUserXP() > 0 && last !== today) {
        n += 1;
        localStorage.setItem('hosa::study-days', String(n));
        localStorage.setItem('hosa::last-study-day', today);
      }
      return n;
    } catch(e) { return 0; }
  }

  function syncGuest() {
    try {
      if (typeof firebase === 'undefined' || !firebase.database) return;
      if (currentUid()) return;
      var gid = guestId(); if (!gid) return;
      var xp = getUserXP(); if (xp <= 0) return;
      firebase.database().ref('leaderboard/level/' + gid).update({
        xp: xp, name: ensureGuestName(), guest: true, days: activeDays(),
        updatedAt: new Date().toISOString()
      });
    } catch(e) {}
  }

  function buildRanked() {
    var players = SEED_PLAYERS.map(function(p) {
      return {name: p.name, xp: p.xp, level: xpLevel(p.xp), avatar: p.avatar, isYou: false, isFake: true};
    });
    var myUid = currentUid();
    var myGid = guestId();
    // Add real users from Firebase. Skip our own row (signed-in uid OR guest id) —
    // we add the current studier as the "You" row below, so this avoids a duplicate.
    var myName = (getUserName() || '').trim().toLowerCase();
    FIREBASE_USERS.forEach(function(u) {
      // Skip our own rows. Both ids must be checked even when signed in: a user who
      // studied as a guest first has a leftover leaderboard/level/{guestId} row, and
      // including it put them directly above themselves ("0 XP behind <me>").
      if (myUid && u.uid === myUid) return;
      if (myGid && u.uid === myGid) return;
      // Same-name safety net for rows written under an id we no longer hold.
      if (myName && (u.name || '').trim().toLowerCase() === myName) return;
      players.push({ name: u.name, xp: u.xp, level: xpLevel(u.xp), avatar: u.avatar || '👤', isYou: false, isFake: false,
                     chapter: u.chapter || '', chapterName: u.chapterName || '' });
    });
    var userXP = getUserXP();
    var myChapter = '', myChapterName = '';
    try { myChapter = _chapterSlug() || ''; myChapterName = _chapterName() || ''; } catch(e) {}
    players.push({
      name: getUserName(),
      xp: userXP,
      level: xpLevel(userXP),
      avatar: '🎯',
      isYou: true,
      isFake: false,
      chapter: myChapter,
      chapterName: myChapterName
    });
    players.sort(function(a, b) { return b.xp - a.xp; });
    players.forEach(function(p, i) { p.rank = i + 1; });
    return players;
  }

  // Chapter badge beside a member's name — chapters.html promises this to
  // every chapter that registers, so it has to appear wherever people are
  // listed, not only on the chapter board.
  function chapterBadge(p) {
    if (!p || !p.chapter) return '';
    var label = p.chapterName || p.chapter.replace(/-/g, ' ');
    return '<a class="lb-row-chapter" href="chapter.html?c=' + encodeURIComponent(p.chapter) + '" '
         + 'title="' + escHtml(label) + ' — chapter dashboard">'
         + '<span class="lb-row-chapter-dot"></span>' + escHtml(label) + '</a>';
  }

  function medalFor(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '#' + rank;
  }

  function escHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function fmtNum(n) { return n.toLocaleString(); }

  // ── Chapter leaderboard ────────────────────────────────────────
  // Chapters are built from the same leaderboard/level rows the individual
  // board already uses: a member tagged via a chapter link carries a
  // `chapter` field on their row, so no extra writable node is needed.
  var FOUNDING = {};
  var CHAPTERS = {};
  var CHAPTERS_OK = false;
  function _loadFounding(cb) {
    try {
      firebase.database().ref('chapters').get().then(function(s) {
        var v = (s && s.val()) || {};
        Object.keys(v).forEach(function(k) {
          CHAPTERS[k] = v[k] || {};
          if (v[k] && v[k].founding) FOUNDING[k] = true;
          if (v[k] && v[k].featured) FEATURED[k] = true;
        });
        CHAPTERS_OK = true;
        cb && cb();
      }).catch(function() { cb && cb(); });
    } catch(e) { cb && cb(); }
  }

  // Clears a mark this client previously wrote from local state alone.
  var _unmarkWrites = {};
  function _unmarkFounding(slug) {
    if (!slug || _unmarkWrites[slug]) return;
    _unmarkWrites[slug] = true;
    delete FOUNDING[slug];
    try {
      firebase.database().ref('chapters/' + slug)
        .update({ founding: null, foundingAt: null })
        .catch(function() {
          firebase.database().ref('analytics/chapters/' + slug)
            .update({ founding: null, foundingAt: null }).catch(function(){});
        });
    } catch(e) {}
  }
  var FEATURED = {};
  var _featuredWrites = {};
  function _markFeatured(slug, name, active) {
    if (!slug || _featuredWrites[slug]) return;
    _featuredWrites[slug] = true;
    try {
      firebase.database().ref('chapters/' + slug)
        .update({ featured: true, featuredAt: new Date().toISOString(), activeMembers: active })
        .catch(function() {
          firebase.database().ref('analytics/chapters/' + slug)
            .update({ featured: true, featuredAt: new Date().toISOString(), activeMembers: active }).catch(function(){});
        });
    } catch(e) {}
  }

  // The home page slot promised at 15 active members.
  function _renderFeatured(rows) {
    var host = document.getElementById('featured-chapter-slot');
    if (!host) return;
    var f = rows.filter(function(r){ return r.featured; })
                .sort(function(a,b){ return b.xp - a.xp; })[0];
    if (!f) { host.style.display = 'none'; host.innerHTML = ''; return; }
    host.style.display = '';
    host.innerHTML =
        '<a class="fc-card" href="chapter.html?c=' + encodeURIComponent(f.slug) + '">'
      +   '<div class="fc-kicker">Featured chapter</div>'
      +   '<div class="fc-name">' + escHtml(f.name) + '</div>'
      +   '<div class="fc-meta">' + fmtNum(f.active) + ' active members \u00b7 ' + fmtNum(f.xp) + ' chapter XP</div>'
      +   '<div class="fc-cta">See their dashboard \u2192</div>'
      + '</a>';
  }

  var _foundingWrites = {};
  function _markFounding(slug) {
    if (!slug || _foundingWrites[slug]) return;
    _foundingWrites[slug] = true;
    FOUNDING[slug] = true;
    try {
      firebase.database().ref('chapters/' + slug)
        .update({ founding: true, foundingAt: new Date().toISOString() })
        .catch(function() {
          firebase.database().ref('analytics/chapters/' + slug)
            .update({ founding: true, foundingAt: new Date().toISOString() }).catch(function(){});
        });
    } catch(e) {}
  }

  function renderChapters() {
    var section = document.getElementById('lb-chapters-section');
    if (!section) return;
    var mine = '';
    try { mine = (localStorage.getItem('hosa::chapter') || '').trim(); } catch(e) {}

    var groups = {};
    var myId = currentUid() || guestId();
    var meCounted = false;
    // Every registered chapter is on the board from sign-up, even at zero.
    // An empty board is the worst possible advertisement for registering.
    Object.keys(CHAPTERS).forEach(function(slug) {
      var c = CHAPTERS[slug] || {};
      groups[slug] = { slug: slug, name: c.name || c.school || slug.replace(/-/g, ' '),
                       xp: 0, members: 0, active: 0, confirmed: 0 };
    });
    CHAPTER_MEMBERS.forEach(function(u) {
      if (!u.chapter) return;
      if (myId && u.uid === myId) meCounted = true;
      var g = groups[u.chapter] || (groups[u.chapter] = { slug: u.chapter, name: u.chapterName || u.chapter, xp: 0, members: 0, active: 0, confirmed: 0 });
      g.xp += (u.xp || 0);
      g.members += 1;
      g.confirmed += 1;
      if ((u.days || 0) >= 3) g.active += 1;
      if (u.chapterName) g.name = u.chapterName;
    });
    // Our own XP may not have synced to leaderboard/level yet — fold it in so a
    // member sees their studying move the chapter immediately.
    if (mine && !meCounted) {
      var myXp = getUserXP();
      if (myXp > 0) {
        // Display only. This must never touch g.confirmed: nothing here has
        // reached the server yet, and an unsynced browser must not be able to
        // award a permanent badge.
        var g = groups[mine] || (groups[mine] = { slug: mine, name: '', xp: 0, members: 0, active: 0, confirmed: 0 });
        g.xp += myXp; g.members += 1;
        if (activeDays() >= 3) g.active += 1;
      }
    }
    if (mine && groups[mine] && !groups[mine].name) {
      var lname = '';
      try { lname = (localStorage.getItem('hosa::chapter-name') || '').trim(); } catch(e) {}
      groups[mine].name = lname || mine.replace(/-/g, ' ');
    }
    // Display-only seed rows, so a board with three chapters on it does not
    // read as abandoned. A real chapter with the same slug always wins, and
    // these carry confirmed:0 so no badge logic below can fire on them.
    try {
      if (window.HosaChapterSeed) {
        window.HosaChapterSeed.rows().forEach(function(r){
          if (!groups[r.slug]) groups[r.slug] = r;
        });
      }
    } catch(e) {}
    var rows = Object.keys(groups).map(function(k){ return groups[k]; });
    rows.sort(function(a, b){
      return (b.xp - a.xp) || (b.members - a.members) || String(a.name).localeCompare(String(b.name));
    });
    // Founding Chapter: earned by reaching the top 10, then kept for good.
    // Written back to chapters/{slug} so the mark survives a rank slip,
    // a new device, and anyone else's view of the board.
    // Repairing a badge we wrongly awarded needs both fetches to have actually
    // succeeded — otherwise an offline load would look like "every chapter has
    // no members" and wipe legitimately earned marks.
    var canReconcile = CHAPTERS_OK && LB_OK;
    rows.forEach(function(r, i) {
      r.founding = !!FOUNDING[r.slug];
      if (r.founding && canReconcile && (r.confirmed || 0) === 0) {
        // Stamped by a browser's local state rather than by real membership.
        r.founding = false; _unmarkFounding(r.slug);
      }
      if (!r.founding && !r.seeded && i < 10 && (r.confirmed || 0) > 0) { r.founding = true; _markFounding(r.slug); }
      r.featured = !r.seeded && (r.active || 0) >= 15 && (r.confirmed || 0) >= 15;
      if (r.featured && !FEATURED[r.slug]) { FEATURED[r.slug] = true; _markFeatured(r.slug, r.name, r.active); }
    });
    _renderFeatured(rows);

    var head = '<div class="ch-head"><div>'
             + '<div class="ch-title">Chapter leaderboard</div>'
             + '<div class="ch-sub">Every chapter ranked by the XP its members have earned.</div>'
             + '</div><a href="chapters.html" style="font-family:\'Source Serif 4\',Georgia,serif;font-size:13.5px;color:var(--accent);text-decoration:underline;text-underline-offset:3px;white-space:nowrap;">Register your chapter →</a></div>';

    if (!rows.length) {
      section.innerHTML = head + '<div class="ch-empty">No chapters yet \u2014 this board fills up as chapters register. '
        + '<a href="chapters.html" style="color:var(--accent);">Put yours on it first</a> and you keep Founding Chapter status permanently.</div>';
      return;
    }
    var html = head + '<div class="ch-list">'
             + '<div class="ch-row ch-row-head"><span>Rank</span><span>Chapter</span><span class="ch-xp">Chapter XP</span><span class="ch-mem">Members</span></div>';
    rows.slice(0, 25).forEach(function(r, i) {
      var isMine = mine && r.slug === mine;
      html += '<div class="ch-row' + (isMine ? ' ch-row-you' : '') + '">'
            + '<span class="ch-rank">' + medalFor(i + 1) + '</span>'
            + '<span class="ch-name">' + escHtml(r.name)
            +   (r.featured ? '<span class="ch-featured" title="Featured chapter \u2014 15 or more active members.">Featured</span>' : '')
            +   (r.founding ? '<span class="ch-founding" title="Founding Chapter \u2014 one of the first ten on the board. Kept permanently.">Founding</span>' : '')
            +   (isMine ? '<span class="ch-you-tag">YOURS</span>' : '') + '</span>'
            + '<span class="ch-xp">' + fmtNum(r.xp) + '</span>'
            + '<span class="ch-mem">' + fmtNum(r.members) + '</span>'
            + '</div>';
    });
    html += '</div>';
    section.innerHTML = html;
  }

  function renderPodium(players) {
    var section = document.getElementById('lb-podium-section');
    if (!section) return;
    var top3 = players.slice(0, 3);
    while (top3.length < 3) top3.push(null);
    var ord = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

    var html = '<div class="lb-podium">';
    ord.forEach(function(p, i) {
      var rank = i === 0 ? 2 : i === 1 ? 1 : 3;
      if (!p) { html += '<div class="lb-podium-slot lb-empty"></div>'; return; }
      html += '<div class="lb-podium-slot lb-podium-' + rank + (p.isYou ? ' lb-you' : '') + '">' +
        '<div class="lb-podium-medal">' + medalFor(rank) + '</div>' +
        '<div class="lb-podium-avatar">' + p.avatar + '</div>' +
        '<div class="lb-podium-name">' + escHtml(p.name) + (p.isYou ? ' <span class="lb-you-tag">YOU</span>' : '') + '</div>' +
        '<div class="lb-podium-level">Level ' + p.level + '</div>' +
        '<div class="lb-podium-xp">' + fmtNum(p.xp) + ' XP</div>' +
      '</div>';
    });
    html += '</div>';
    section.innerHTML = html;
  }

  function renderYou(players) {
    var section = document.getElementById('lb-you-section');
    if (!section) return;
    var you = players.filter(function(p){ return p.isYou; })[0];
    if (!you) { section.innerHTML = ''; return; }
    var lvl = you.level;
    var xpBase = xpForLevel(lvl);
    var xpNext = xpForLevel(lvl + 1);
    var pct = xpNext > xpBase ? Math.min(100, Math.round((you.xp - xpBase) / (xpNext - xpBase) * 100)) : 100;
    var toNext = Math.max(0, xpNext - you.xp);
    // Walk up past anyone who is really us (duplicate row) before picking a rival.
    var ahead = null;
    for (var _i = you.rank - 2; _i >= 0; _i--) {
      var _c = players[_i];
      if (!_c || _c.isYou) continue;
      if ((_c.name || '').trim().toLowerCase() === (you.name || '').trim().toLowerCase()) continue;
      ahead = _c; break;
    }
    var aheadGap = ahead ? (ahead.xp - you.xp) : 0;

    section.innerHTML =
      '<div class="lb-you-card">' +
        '<div class="lb-you-head">' +
          '<div class="lb-you-rank">' + medalFor(you.rank) + '</div>' +
          '<div class="lb-you-info">' +
            '<div class="lb-you-name">' + escHtml(you.name) + ' <span class="lb-you-tag">YOU</span></div>' +
            '<div class="lb-you-sub">Level ' + lvl + ' · ' + fmtNum(you.xp) + ' XP</div>' +
          '</div>' +
          '<div class="lb-you-percentile">Rank ' + you.rank + ' / ' + players.length + '</div>' +
        '</div>' +
        '<div class="lb-you-bar"><div class="lb-you-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="lb-you-progress">' +
          '<span>' + fmtNum(you.xp - xpBase) + ' / ' + fmtNum(xpNext - xpBase) + ' XP to Level ' + (lvl + 1) + '</span>' +
          (ahead
            ? (aheadGap > 0
                ? '<span class="lb-you-gap">' + fmtNum(aheadGap) + ' XP behind ' + escHtml(ahead.name.split(' ')[0]) + '</span>'
                : '<span class="lb-you-gap">Tied with ' + escHtml(ahead.name.split(' ')[0]) + '</span>')
            : (you.rank === 1
                ? '<span class="lb-you-gap">👑 #1 — King of the Hill</span>'
                : '<span class="lb-you-gap"></span>')) +
        '</div>' +
      '</div>';
  }

  function renderList(players) {
    var section = document.getElementById('lb-list-section');
    if (!section) return;
    var html = '<div class="lb-list-head"><span>Rank</span><span>Player</span><span>Level</span><span>XP</span></div>';
    html += '<div class="lb-list">';
    players.forEach(function(p) {
      html += '<div class="lb-row' + (p.isYou ? ' lb-row-you' : '') + (p.rank <= 3 ? ' lb-row-podium' : '') + '">' +
        '<span class="lb-row-rank">' + medalFor(p.rank) + '</span>' +
        '<span class="lb-row-player">' +
          '<span class="lb-row-avatar">' + p.avatar + '</span>' +
          '<span class="lb-row-info">' +
            '<span class="lb-row-name">' + escHtml(p.name) + (p.isYou ? ' <span class="lb-you-tag">YOU</span>' : '') + '</span>' +
            chapterBadge(p) +
          '</span>' +
        '</span>' +
        '<span class="lb-row-level">Lvl ' + p.level + '</span>' +
        '<span class="lb-row-xp">' + fmtNum(p.xp) + '</span>' +
      '</div>';
    });
    html += '</div>';
    section.innerHTML = html;
  }

  function renderAll() {
    var players = buildRanked();
    renderPodium(players);
    renderYou(players);
    renderList(players);
    renderChapters();
  }

  function refreshAndRender() {
    syncGuest();
    // Founding marks come from chapters/, the board from leaderboard/level;
    // render once both are in so a chapter never flickers without its mark.
    _loadFounding(function() {
      fetchFirebaseUsers(function() { renderAll(); });
    });
  }

  function init() {
    renderAll();
    refreshAndRender();
    // Keep a studying guest mirrored to the public board even when they're not
    // on the leaderboard tab, so they're added the moment they earn XP.
    syncGuest();
    setInterval(syncGuest, 8000);
    // Re-render when tab activates or XP changes
    var lastXP = getUserXP();
    setInterval(function() {
      var pane = document.getElementById('tab-leaderboard');
      if (!pane || !pane.classList.contains('active')) return;
      var cur = getUserXP();
      if (cur !== lastXP) { lastXP = cur; renderAll(); }
    }, 1500);

    // Re-pull Firebase users every 20s while on the leaderboard tab
    setInterval(function() {
      var pane = document.getElementById('tab-leaderboard');
      if (!pane || !pane.classList.contains('active')) return;
      refreshAndRender();
    }, 20000);

    document.querySelectorAll('[data-tab="leaderboard"]').forEach(function(btn) {
      btn.addEventListener('click', function() { setTimeout(refreshAndRender, 50); });
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);

  window.__hosaRenderLeaderboard = renderAll;
})();
