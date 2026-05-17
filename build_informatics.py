#!/usr/bin/env python3
"""Generate health-informatics.html from dental-science.html template."""
import os, re

BASE = '/home/user/hosa-prep-hub'
SRC  = os.path.join(BASE, 'dental-science.html')
DST  = os.path.join(BASE, 'health-informatics.html')

with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()

TERMS_JS = '''const TERMS = [
  // ── EHR & Clinical Systems ───────────────────────────────────
  { term: "Electronic Health Record (EHR)", type: "concept", category: "ehr", meaning: "A longitudinal digital record of patient health information across providers and care settings; includes demographics, problems, medications, allergies, lab/imaging results, immunizations, and notes. Distinct from EMR (single-practice record).", example: "The hospital's Epic EHR allowed the patient's primary care, cardiology, and pharmacy teams to share medication and allergy data in real time." },
  { term: "Computerized Provider Order Entry (CPOE)", type: "concept", category: "ehr", meaning: "Electronic entry of medication, lab, and procedure orders by clinicians, replacing handwritten orders. Reduces errors from illegibility and transcription; supports decision support and prevents duplicate orders.", example: "When the physician entered the warfarin order via CPOE, the system flagged the recent INR of 5.2 and recommended holding the dose — a CDS alert preventing harm." },
  { term: "Clinical Decision Support (CDS)", type: "concept", category: "ehr", meaning: "Software-based tools that present clinicians with patient-specific knowledge at the point of care: drug interaction alerts, dose adjustment recommendations, preventive care reminders, diagnostic suggestions, and order sets.", example: "The CDS alert prevented a serious drug interaction by warning the physician about combining clarithromycin with the patient's simvastatin." },
  { term: "Patient Portal", type: "concept", category: "ehr", meaning: "A secure web/mobile interface allowing patients to access their health information, message providers, schedule appointments, request refills, view lab results, and pay bills. Mandated by Meaningful Use for patient engagement.", example: "Through MyChart the patient viewed her A1c result, messaged her PCP, and scheduled her annual physical without calling the office." },
  { term: "Meaningful Use / Promoting Interoperability", type: "concept", category: "ehr", meaning: "CMS incentive program (now MIPS Promoting Interoperability) requiring certified EHR use with measurable improvements in care quality, patient engagement, and data exchange; ties Medicare/Medicaid payments to performance.", example: "The hospital documented its CPOE rate, e-prescribing percentage, and patient portal access to meet Promoting Interoperability measures and avoid Medicare payment penalties." },
  { term: "Health Information Exchange (HIE)", type: "concept", category: "ehr", meaning: "Electronic movement of health information among organizations according to national standards. Types: directed (clinician-to-clinician), query-based (find records), consumer-mediated. Improves care coordination and reduces duplication.", example: "When the patient presented to the ED out of state, the HIE pulled her medication list and recent imaging from her home hospital, avoiding duplicate CT." },

  // ── Standards & Interoperability ─────────────────────────────
  { term: "HL7 (Health Level Seven)", type: "concept", category: "standards", meaning: "A nonprofit organization and family of standards for clinical and administrative data exchange. HL7 v2 (legacy pipe-delimited messages) and HL7 v3 (XML-based). Foundation for ADT, lab result, and order messaging.", example: "The lab system sent an HL7 ORU message containing the patient's hemoglobin result to the EHR's interface engine for charting." },
  { term: "FHIR (Fast Healthcare Interoperability Resources)", type: "concept", category: "standards", meaning: "Modern HL7 standard using RESTful APIs and modular 'resources' (Patient, Observation, Medication) in JSON or XML format; enables apps to access EHR data the way websites use web services. Foundational to SMART on FHIR.", example: "A SMART on FHIR app pulled the patient's medication list via the FHIR Medication resource and computed renal-dosing adjustments in real time." },
  { term: "ICD-10-CM / ICD-10-PCS", type: "concept", category: "standards", meaning: "The International Classification of Diseases, 10th Revision: Clinical Modification (CM) codes diagnoses with up to 7 alphanumeric characters; Procedure Coding System (PCS) codes inpatient procedures with 7 characters. Required on US claims.", example: "The hospital coder assigned ICD-10-CM I21.4 for the patient's non-ST elevation MI and ICD-10-PCS 02703DZ for the coronary stent placement." },
  { term: "CPT and HCPCS Codes", type: "concept", category: "standards", meaning: "CPT (Current Procedural Terminology): 5-digit AMA-maintained codes for outpatient procedures and services. HCPCS Level II: alphanumeric codes for DME, drugs, ambulance, and supplies not covered by CPT.", example: "The clinic billed CPT 99214 for the office visit and HCPCS J3490 (unclassified injection) for the medication administered during the visit." },
  { term: "LOINC", type: "concept", category: "standards", meaning: "Logical Observation Identifiers Names and Codes — a universal code system for laboratory and clinical observations; identifies what was measured (analyte, method, sample, scale) and enables semantic interoperability between systems.", example: "The lab result 'glucose, fasting' was coded with LOINC 1558-6 so any receiving system could interpret it identically regardless of local naming." },
  { term: "SNOMED CT", type: "concept", category: "standards", meaning: "Systematized Nomenclature of Medicine Clinical Terms — a comprehensive multilingual clinical terminology covering diseases, findings, procedures, body structures, organisms. Used in EHRs for problem lists and clinical documentation.", example: "The problem list entry 'acute myocardial infarction' was stored as SNOMED CT 22298006, enabling consistent interpretation across systems." },
  { term: "DICOM (Digital Imaging and Communications in Medicine)", type: "concept", category: "standards", meaning: "International standard for transmission, storage, retrieval, and display of medical images and associated metadata; specifies image format and network protocol. Used by all modern PACS and modalities.", example: "The CT scan was acquired in DICOM format and automatically routed to the PACS, where the radiologist viewed it on a DICOM-compatible workstation." },
  { term: "RxNorm", type: "concept", category: "standards", meaning: "A normalized naming system for clinical drugs maintained by the NLM; provides standard identifiers linking proprietary drug databases (e.g., First Databank, Multum, Cerner Multum) for interoperability and CDS.", example: "The e-prescription mapped the patient's 'metoprolol succinate ER 50 mg' to its RxNorm RXCUI, ensuring the receiving pharmacy system understood it unambiguously." },

  // ── Privacy, Security & Regulation ───────────────────────────
  { term: "HIPAA Privacy Rule", type: "concept", category: "privacy", meaning: "Federal regulation protecting Protected Health Information (PHI); covered entities (providers, plans, clearinghouses) must give patients Notice of Privacy Practices and obtain authorization for non-TPO uses. Allows TPO (Treatment, Payment, Operations) without authorization.", example: "The clinic released records to the consulting cardiologist under TPO without separate patient authorization — permitted by HIPAA." },
  { term: "HIPAA Security Rule", type: "concept", category: "privacy", meaning: "Sets standards for protecting ePHI through Administrative (policies, training), Physical (facility access, workstation security), and Technical safeguards (access control, audit, encryption, transmission security).", example: "The hospital implemented role-based access control, full-disk encryption on workstations, and an audit log review process to meet HIPAA Security Rule technical safeguards." },
  { term: "PHI (Protected Health Information)", type: "concept", category: "privacy", meaning: "Any individually identifiable health information held or transmitted by a covered entity. 18 identifiers defined by HIPAA (name, dates, MRN, biometrics, etc.). De-identified data with all 18 removed is not PHI.", example: "Before sharing the dataset for research, the analyst removed all 18 HIPAA identifiers under the Safe Harbor method, rendering it de-identified." },
  { term: "HITECH Act", type: "concept", category: "privacy", meaning: "Health Information Technology for Economic and Clinical Health Act (2009) expanded HIPAA, extended breach notification requirements to covered entities and business associates, increased penalties, and funded EHR adoption.", example: "After the laptop containing 1500 patient records was stolen, the hospital reported the breach to HHS within 60 days per HITECH breach notification rules." },
  { term: "Business Associate Agreement (BAA)", type: "concept", category: "privacy", meaning: "A required HIPAA contract between a covered entity and any third party (cloud vendor, billing service, IT consultant) that handles PHI on its behalf; obligates the business associate to safeguard PHI.", example: "Before migrating the EHR to AWS, the hospital executed a BAA with the cloud provider to ensure HIPAA-compliant handling of PHI." },
  { term: "Breach Notification", type: "concept", category: "privacy", meaning: "Required disclosure when unsecured PHI is acquired, used, or disclosed in a manner not permitted by HIPAA. Notify affected individuals within 60 days; HHS Office for Civil Rights for breaches affecting >500 individuals also notified to media.", example: "After the phishing attack exposed 800 patient records, the practice notified affected individuals, HHS-OCR, and local media within 60 days as required." },
  { term: "21st Century Cures Act / Information Blocking", type: "concept", category: "privacy", meaning: "2016 law that prohibits 'information blocking' — practices that interfere with electronic health information access, exchange, or use; requires patient access to clinical notes (OpenNotes) and full EHI via APIs.", example: "Under the Cures Act Final Rule, the hospital made progress notes, lab results, and imaging reports immediately available to patients in their portal upon signing." },

  // ── Data, Analytics & Workflow ───────────────────────────────
  { term: "Big Data in Healthcare", type: "concept", category: "data-analytics", meaning: "Extremely large datasets (clinical, claims, genomic, sensor) characterized by the four Vs: Volume, Velocity, Variety, Veracity. Used for population health analytics, predictive modeling, and personalized medicine.", example: "By aggregating 5 years of EHR data across 50 hospitals, researchers built a predictive model for sepsis 6 hours earlier than traditional criteria." },
  { term: "Clinical Data Warehouse", type: "concept", category: "data-analytics", meaning: "A consolidated database aggregating data from multiple operational systems (EHR, billing, lab, pharmacy) optimized for analytics and reporting; supports research, quality improvement, and population health management.", example: "The QI team queried the clinical data warehouse to identify all diabetic patients with A1c >9% and missed appointments for targeted outreach." },
  { term: "Population Health Management", type: "concept", category: "data-analytics", meaning: "Proactive management of health outcomes of a defined patient population through data-driven risk stratification, gap-in-care identification, and targeted interventions; aligned with value-based care models.", example: "The ACO used population health analytics to identify high-risk diabetics who hadn't seen a provider in 6 months and dispatched care coordinators for outreach." },
  { term: "Predictive Analytics and Machine Learning", type: "concept", category: "data-analytics", meaning: "Statistical/ML models that predict outcomes (readmission, sepsis, mortality) or recommend actions from historical and real-time data; outputs integrated into clinical workflow as alerts or risk scores.", example: "The hospital's ML readmission risk score flagged the discharged patient as high-risk, prompting an outpatient pharmacist medication review within 48 hours." },
  { term: "Telehealth and Remote Patient Monitoring (RPM)", type: "concept", category: "data-analytics", meaning: "Delivery of healthcare via telecommunications: video visits, store-and-forward (asynchronous), remote monitoring (continuous BP/glucose/weight/ECG). Expanded rapidly during COVID-19; reimbursement evolving.", example: "The CHF patient's home weight scale transmitted daily readings; a 3 lb gain triggered an RPM alert and a nurse call that averted decompensation." },
  { term: "Usability and Alert Fatigue", type: "concept", category: "data-analytics", meaning: "Poor EHR design and excessive low-value alerts contribute to user frustration and missed important warnings (alert fatigue), threatening patient safety. Usability testing and alert tuning are critical informatics tasks.", example: "After reducing low-value drug-drug interaction pop-ups by 60%, clinicians paid greater attention to remaining high-severity alerts — measurably improving response rates." },
  { term: "Workflow Analysis", type: "concept", category: "data-analytics", meaning: "Systematic study of how clinical and administrative tasks are performed (process maps, swim lanes, time-motion studies) to design or optimize information systems supporting them; central to successful EHR implementation.", example: "Workflow analysis revealed that ED nurses spent 2 hours per shift on paper triage redundant with EHR data; redesigning the triage screen eliminated the duplication." },
];'''

m = re.search(r'const TERMS = \[.*?^\];', html, re.DOTALL | re.MULTILINE)
if not m: raise SystemExit('TERMS not found')
html = html[:m.start()] + TERMS_JS + html[m.end():]

CAT = """const categoryLabel = c => ({
  'ehr':            'EHR & Clinical Systems',
  'standards':      'Standards & Interoperability',
  'privacy':        'Privacy, Security & Regulation',
  'data-analytics': 'Data, Analytics & Workflow',
})[c] || c;"""
html = re.sub(r"const categoryLabel = c => \(\{[^}]+\}\)\[c\] \|\| c;", CAT, html, count=1, flags=re.DOTALL)

html = html.replace("const DB_PATH = 'dental-science';", "const DB_PATH = 'health-informatics';", 1)
html = html.replace('<title>HOSA Prep Hub — Dental Science</title>',
                    '<title>HOSA Prep Hub — Health Informatics</title>', 1)
html = html.replace('<h1>Dental<br><em>Science</em>.</h1>',
                    '<h1>Health<br><em>Informatics</em>.</h1>', 1)
html = html.replace(
    'A study companion for Dental anatomy, oral diseases, preventive dentistry, restorative procedures, dental materials, and infection control — built for HOSA competitors.',
    'A study companion for EHRs and clinical systems, interoperability standards, privacy and HIPAA, and healthcare data analytics — built for HOSA competitors.',
    1
)
html = html.replace('//  DATA — HOSA Emergency Medical Science',
                    '//  DATA — HOSA Health Informatics', 1)

with open(DST, 'w', encoding='utf-8') as f:
    f.write(html)

count = TERMS_JS.count('{ term:')
print(f'Wrote {DST} — {count} terms')
