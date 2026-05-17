#!/usr/bin/env python3
"""Generate genetics.html from dental-science.html template."""
import os, re

BASE = '/home/user/hosa-prep-hub'
SRC  = os.path.join(BASE, 'dental-science.html')
DST  = os.path.join(BASE, 'genetics.html')

with open(SRC, 'r', encoding='utf-8') as f:
    html = f.read()

TERMS_JS = '''const TERMS = [
  // ── Molecular Basics ─────────────────────────────────────────
  { term: "DNA Structure", type: "concept", category: "molecular", meaning: "Double-stranded helix of deoxyribose-phosphate backbones held by hydrogen bonds between complementary base pairs (A–T, G–C). Antiparallel strands run 5' → 3' and 3' → 5'. Contains the genetic code in triplet codons.", example: "The Watson-Crick double helix structure with A-T and G-C base pairing explained how DNA could be faithfully replicated." },
  { term: "Gene and Allele", type: "concept", category: "molecular", meaning: "A gene is a DNA sequence coding for a functional product (protein or RNA). An allele is a variant form of a gene at a particular locus; humans inherit one allele from each parent (diploid).", example: "The BRCA1 gene has many alleles; the patient's pathogenic variant allele was inherited from her affected mother." },
  { term: "Genotype vs Phenotype", type: "concept", category: "molecular", meaning: "Genotype: the genetic constitution at a locus (e.g., AA, Aa, aa). Phenotype: the observable trait resulting from the genotype interacting with environment. Different genotypes can produce the same phenotype.", example: "Both AA and Aa genotypes produce a brown-eye phenotype because the brown allele (A) is dominant over the blue allele (a)." },
  { term: "Transcription and Translation", type: "concept", category: "molecular", meaning: "Transcription: DNA template → mRNA in the nucleus by RNA polymerase. Translation: mRNA → protein at the ribosome (cytoplasm), with tRNAs delivering amino acids per codon-anticodon pairing.", example: "After transcription of the hemoglobin gene in the nucleus, the mRNA was translated at the ribosome into the β-globin polypeptide." },
  { term: "Mutation Types", type: "concept", category: "molecular", meaning: "Point: silent (no aa change), missense (different aa), nonsense (premature stop). Frameshift (insertion/deletion not divisible by 3) shifts the reading frame downstream. Splice-site mutations disrupt mRNA processing.", example: "The cystic fibrosis ΔF508 mutation is a 3-bp in-frame deletion removing a phenylalanine — not a frameshift — but causes misfolded CFTR protein." },
  { term: "Karyotype and Chromosomes", type: "concept", category: "molecular", meaning: "Human somatic cells have 46 chromosomes: 22 pairs of autosomes + 2 sex chromosomes (XX or XY). A karyotype displays chromosomes by size and banding. Used to detect aneuploidy and large structural changes.", example: "The newborn's karyotype 47,XX,+21 revealed trisomy 21, confirming Down syndrome." },

  // ── Mendelian Inheritance ────────────────────────────────────
  { term: "Autosomal Dominant", type: "concept", category: "mendelian", meaning: "One copy of a dominant disease allele on an autosome is sufficient to express the phenotype. Affected individuals usually have an affected parent; both sexes equally affected; vertical transmission; 50% risk to offspring of an affected heterozygote.", example: "Huntington disease is autosomal dominant — every affected patient has an affected parent, and each child has a 50% risk." },
  { term: "Autosomal Recessive", type: "concept", category: "mendelian", meaning: "Two copies of the recessive disease allele are required. Affected individuals typically have unaffected carrier parents; horizontal transmission. Consanguinity raises risk. Carriers may have no symptoms.", example: "Cystic fibrosis is autosomal recessive — both unaffected parents were ΔF508 carriers, and each pregnancy had a 25% risk of an affected child." },
  { term: "X-Linked Recessive", type: "concept", category: "mendelian", meaning: "The disease gene is on the X chromosome; males (XY, hemizygous) express disease with one copy. Females (XX) are usually carriers; affected only if homozygous. No male-to-male transmission.", example: "Hemophilia A is X-linked recessive — the affected boy's mother was an obligate carrier; his sisters had a 50% chance of being carriers." },
  { term: "X-Linked Dominant", type: "concept", category: "mendelian", meaning: "One copy of the dominant X-linked allele causes disease in males and females, though females often have milder, mosaic expression due to X-inactivation. No male-to-male transmission; affected fathers transmit to all daughters.", example: "Vitamin D-resistant rickets is X-linked dominant; the affected father passed it to all four daughters but none of his sons." },
  { term: "Mitochondrial Inheritance", type: "concept", category: "mendelian", meaning: "mtDNA mutations transmitted exclusively through the maternal egg cytoplasm; both sexes affected, but only mothers transmit. Heteroplasmy (mix of mutant and wild-type mtDNA) explains variable expressivity.", example: "Leber's hereditary optic neuropathy was inherited from the patient's mother and affected her brother but not her father's family — typical mitochondrial pattern." },
  { term: "Punnett Square", type: "concept", category: "mendelian", meaning: "A grid showing all combinations of parental gametes to predict offspring genotype and phenotype ratios. Aa × Aa: 1 AA : 2 Aa : 1 aa = 3:1 dominant phenotype. AA × aa: all Aa.", example: "A Punnett square for two CF carriers (Cc × Cc) showed 25% CC unaffected, 50% Cc carrier, 25% cc affected — the classic autosomal recessive ratio." },
  { term: "Pedigree Analysis", type: "concept", category: "mendelian", meaning: "Family diagram tracking inheritance: squares = males, circles = females, filled = affected, horizontal lines = matings, vertical lines = offspring. Patterns reveal autosomal vs X-linked, dominant vs recessive inheritance.", example: "The pedigree showed every affected person had an affected parent, both sexes affected, no skipping — classic autosomal dominant inheritance." },
  { term: "Penetrance and Expressivity", type: "concept", category: "mendelian", meaning: "Penetrance: the proportion of genotype carriers who express any phenotype. Expressivity: variation in severity among those who express. BRCA1 carriers have ~70% penetrance for breast cancer with variable severity.", example: "The family's BRCA1 mutation showed incomplete penetrance — the grandmother carried the variant but never developed cancer." },

  // ── Chromosomal Disorders ────────────────────────────────────
  { term: "Trisomy 21 (Down Syndrome)", type: "concept", category: "chromosomal", meaning: "Extra chromosome 21; usually from maternal meiotic nondisjunction (risk rises with maternal age). Features: intellectual disability, characteristic facies, congenital heart defects (AV canal), duodenal atresia, increased Alzheimer risk.", example: "The infant's karyotype 47,XY,+21 confirmed Down syndrome; an echo identified an AV canal defect requiring surgical repair." },
  { term: "Trisomy 18 and 13 (Edwards/Patau)", type: "concept", category: "chromosomal", meaning: "Trisomy 18 (Edwards): clenched hands, rocker-bottom feet, severe ID, congenital heart defects — most die in infancy. Trisomy 13 (Patau): cleft lip/palate, polydactyly, holoprosencephaly — most die by age 1.", example: "The newborn's clenched hands with overlapping fingers and rocker-bottom feet suggested Edwards syndrome; karyotype confirmed trisomy 18." },
  { term: "Turner Syndrome (45,X)", type: "concept", category: "chromosomal", meaning: "Monosomy of one X chromosome in females. Features: short stature, webbed neck, primary amenorrhea, streak ovaries (infertility), coarctation of the aorta, normal intelligence. Treated with growth hormone and estrogen replacement.", example: "The 14-year-old's short stature, primary amenorrhea, and webbed neck led to karyotype 45,X — Turner syndrome." },
  { term: "Klinefelter Syndrome (47,XXY)", type: "concept", category: "chromosomal", meaning: "Extra X in males. Features: tall stature, small testes, gynecomastia, infertility, mild ID. Often diagnosed during infertility workup with elevated FSH/LH and low testosterone.", example: "The infertile 28-year-old man's karyotype showed 47,XXY — Klinefelter syndrome; testosterone replacement was started." },
  { term: "Cri-du-Chat Syndrome", type: "concept", category: "chromosomal", meaning: "Deletion of part of the short arm of chromosome 5 (5p−); features include high-pitched cat-like cry in infancy, ID, microcephaly, characteristic facies. Most cases are de novo deletions.", example: "The infant's distinctive cat-like cry in the NICU prompted FISH testing that confirmed a 5p deletion — cri-du-chat syndrome." },
  { term: "Fragile X Syndrome", type: "concept", category: "chromosomal", meaning: "Most common inherited cause of ID. Caused by CGG trinucleotide repeat expansion in FMR1 (Xq27.3). Affected males: ID, long face, large ears, macroorchidism. Female carriers may be mildly affected.", example: "The boy with ID, long face, and post-pubertal macroorchidism had >200 CGG repeats in FMR1 — fragile X syndrome." },

  // ── Common Genetic Disorders ─────────────────────────────────
  { term: "Cystic Fibrosis", type: "concept", category: "disorders", meaning: "Autosomal recessive disorder of the CFTR chloride channel (chromosome 7). Thick mucus causes recurrent pulmonary infections, pancreatic insufficiency, infertility (male), elevated sweat chloride. ΔF508 is the most common mutation.", example: "The newborn screen sweat chloride was 90 mEq/L (positive >60) and genetic testing confirmed ΔF508 homozygosity." },
  { term: "Sickle Cell Disease", type: "concept", category: "disorders", meaning: "Autosomal recessive single-base substitution (Glu6Val) in β-globin → HbS polymerization under hypoxia → sickled RBCs. Vaso-occlusive crises, hemolytic anemia, infections. Heterozygotes (sickle trait) are protected against falciparum malaria.", example: "The child's painful vaso-occlusive crisis and hemoglobin electrophoresis showing only HbS confirmed sickle cell disease." },
  { term: "Huntington Disease", type: "concept", category: "disorders", meaning: "Autosomal dominant neurodegeneration from CAG trinucleotide repeat expansion in HTT (chromosome 4). Onset 30s–50s with chorea, behavioral changes, dementia. Anticipation: repeat expansion in successive generations → earlier onset.", example: "The patient's 45 CAG repeats in HTT confirmed Huntington; her father's earlier onset reflected genetic anticipation from repeat expansion." },
  { term: "Tay-Sachs Disease", type: "concept", category: "disorders", meaning: "Autosomal recessive deficiency of hexosaminidase A → GM2 ganglioside accumulation in neurons. Infantile form: developmental regression, cherry-red macular spot, death by age 4. Increased carrier frequency in Ashkenazi Jewish population.", example: "The Ashkenazi infant's loss of motor milestones and cherry-red macula prompted enzyme testing — absent HexA confirmed Tay-Sachs." },
  { term: "Phenylketonuria (PKU)", type: "concept", category: "disorders", meaning: "Autosomal recessive deficiency of phenylalanine hydroxylase → Phe accumulation → severe ID if untreated. Newborn screen catches it; dietary Phe restriction prevents intellectual disability. Maternal PKU during pregnancy causes fetal damage.", example: "The newborn screen showed elevated Phe (>1200 µmol/L); a phenylalanine-restricted diet was started within 7 days to prevent ID." },
  { term: "Hemophilia A and B", type: "concept", category: "disorders", meaning: "X-linked recessive deficiencies. Hemophilia A: factor VIII deficiency (most common). Hemophilia B (Christmas disease): factor IX deficiency. Both cause bleeding into joints (hemarthroses) and muscles; treated with factor concentrates.", example: "The 3-year-old boy's recurrent knee hemarthroses and prolonged aPTT (corrected by factor VIII) confirmed Hemophilia A." },
  { term: "BRCA1 and BRCA2", type: "concept", category: "disorders", meaning: "Tumor suppressor genes involved in DNA double-strand break repair. Autosomal dominant inheritance of a pathogenic variant confers high lifetime risk: BRCA1 ~70% breast, ~40% ovarian cancer. Increased risk also in male carriers (prostate, breast).", example: "The patient's strong family history of breast and ovarian cancer prompted BRCA testing; a pathogenic BRCA1 variant led to prophylactic salpingo-oophorectomy." },

  // ── Genetics in Medicine ─────────────────────────────────────
  { term: "Prenatal Diagnosis", type: "concept", category: "medicine", meaning: "Methods to detect fetal disorders: maternal serum screening (quad screen), cell-free fetal DNA (NIPT, 10 wk+), chorionic villus sampling (CVS, 10–13 wk, risk ~1%), amniocentesis (15–20 wk, risk ~0.5%), and ultrasound.", example: "After abnormal NIPT for trisomy 21, the patient underwent amniocentesis, which confirmed 47,XX,+21." },
  { term: "Newborn Screening", type: "concept", category: "medicine", meaning: "Universal heel-stick blood spot screening for treatable disorders within first 24–48 hours: PKU, congenital hypothyroidism, galactosemia, sickle cell, CF, MCAD, MSUD, and others. Critical for early intervention.", example: "The newborn's elevated TSH on screening prompted confirmatory testing — congenital hypothyroidism; levothyroxine was started by 2 weeks to prevent ID." },
  { term: "Carrier Screening", type: "concept", category: "medicine", meaning: "Genetic testing to identify asymptomatic individuals heterozygous for recessive disorders before reproduction. Common: CF (universal), Tay-Sachs (Ashkenazi), sickle cell (African ancestry), thalassemia, fragile X.", example: "Both members of the Ashkenazi couple underwent expanded carrier screening; both were Tay-Sachs carriers, and they pursued IVF with PGT-M." },
  { term: "Hardy-Weinberg Equilibrium", type: "concept", category: "medicine", meaning: "Mathematical principle that in a large, randomly mating, non-evolving population, allele and genotype frequencies remain constant. p² + 2pq + q² = 1, where p and q are allele frequencies. Used to estimate carrier frequency.", example: "Cystic fibrosis affects 1/2500 (q² ≈ 0.0004), so q ≈ 0.02 and carrier frequency 2pq ≈ 0.04 — about 1 in 25 — by Hardy-Weinberg." },
  { term: "Pharmacogenomics", type: "concept", category: "medicine", meaning: "Study of how genetic variants influence drug response and toxicity. Examples: CYP2D6 (codeine, tamoxifen), CYP2C19 (clopidogrel), TPMT (azathioprine), HLA-B*5701 (abacavir hypersensitivity), warfarin (CYP2C9/VKORC1).", example: "HLA-B*5701 testing before abacavir prevented a potentially fatal hypersensitivity reaction in the HIV patient." },
  { term: "CRISPR-Cas9 and Gene Therapy", type: "concept", category: "medicine", meaning: "CRISPR-Cas9: bacterial adaptive immunity system repurposed for precise genome editing. Gene therapy approved for some inherited diseases (e.g., voretigene for RPE65 retinopathy, exa-cel for sickle cell). Ethical concerns include germline modification.", example: "FDA-approved exa-cel uses CRISPR to disrupt BCL11A, reactivating fetal hemoglobin and effectively curing sickle cell disease in early trials." },
];'''

m = re.search(r'const TERMS = \[.*?^\];', html, re.DOTALL | re.MULTILINE)
if not m: raise SystemExit('TERMS not found')
html = html[:m.start()] + TERMS_JS + html[m.end():]

CAT = """const categoryLabel = c => ({
  'molecular':   'Molecular Basics',
  'mendelian':   'Mendelian Inheritance',
  'chromosomal': 'Chromosomal Disorders',
  'disorders':   'Common Genetic Disorders',
  'medicine':    'Genetics in Medicine',
})[c] || c;"""
html = re.sub(r"const categoryLabel = c => \(\{[^}]+\}\)\[c\] \|\| c;", CAT, html, count=1, flags=re.DOTALL)

html = html.replace("const DB_PATH = 'dental-science';", "const DB_PATH = 'genetics';", 1)
html = html.replace('<title>HOSA Prep Hub — Dental Science</title>',
                    '<title>HOSA Prep Hub — Genetics &amp; Heredity</title>', 1)
html = html.replace('<h1>Dental<br><em>Science</em>.</h1>',
                    '<h1>Gene<em>tics</em>.</h1>', 1)
html = html.replace(
    'A study companion for Dental anatomy, oral diseases, preventive dentistry, restorative procedures, dental materials, and infection control — built for HOSA competitors.',
    'A study companion for molecular genetics, Mendelian inheritance, chromosomal and single-gene disorders, and genetics in clinical medicine — built for HOSA competitors.',
    1
)
html = html.replace('//  DATA — HOSA Emergency Medical Science',
                    '//  DATA — HOSA Genetics & Heredity', 1)

with open(DST, 'w', encoding='utf-8') as f:
    f.write(html)

count = TERMS_JS.count('{ term:')
print(f'Wrote {DST} — {count} terms')
