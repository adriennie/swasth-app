#!/usr/bin/env node

/**
 * Generates supabase/catalog.sql: an extended demo catalog of general
 * medicines and essentials (generic names, fictional manufacturers, INR).
 * Deterministic, so re-running produces the same file.
 *
 * Run with: node scripts/generate-catalog.js
 */

const fs = require("fs");
const path = require("path");

const MAKERS = ["Arogya Labs", "Medisure Pharma", "Lifeline Healthcare", "Sanjivani Generics", "Vedant Remedies", "Nirmal Biotech"];

// [name, strengths, form, pack, category, base MRP per pack at the first strength]
const ITEMS = [
  // Pain & Fever
  ["Paracetamol", ["250 mg/5 ml"], "Suspension", "Bottle of 60 ml", "Pain & Fever", 32],
  ["Aceclofenac", ["100 mg"], "Tablet", "Strip of 10", "Pain & Fever", 48],
  ["Aceclofenac + Paracetamol", ["100/325 mg"], "Tablet", "Strip of 10", "Pain & Fever", 62],
  ["Nimesulide", ["100 mg"], "Tablet", "Strip of 10", "Pain & Fever", 28],
  ["Naproxen", ["250 mg", "500 mg"], "Tablet", "Strip of 10", "Pain & Fever", 45],
  ["Etoricoxib", ["60 mg", "90 mg", "120 mg"], "Tablet", "Strip of 10", "Pain & Fever", 110],
  ["Tramadol + Paracetamol", ["37.5/325 mg"], "Tablet", "Strip of 10", "Pain & Fever", 95],
  ["Ketorolac", ["10 mg"], "Tablet", "Strip of 10", "Pain & Fever", 40],
  ["Thiocolchicoside", ["4 mg", "8 mg"], "Capsule", "Strip of 10", "Pain & Fever", 165],
  ["Methyl Salicylate + Menthol", ["30 g"], "Ointment", "Tube", "Pain & Fever", 85],
  // Antibiotics
  ["Amoxicillin", ["250 mg", "500 mg"], "Capsule", "Strip of 10", "Antibiotics", 60],
  ["Cefixime", ["100 mg", "200 mg"], "Tablet", "Strip of 10", "Antibiotics", 95],
  ["Cefuroxime", ["250 mg", "500 mg"], "Tablet", "Strip of 6", "Antibiotics", 210],
  ["Cefpodoxime", ["100 mg", "200 mg"], "Tablet", "Strip of 10", "Antibiotics", 140],
  ["Ciprofloxacin", ["250 mg", "500 mg"], "Tablet", "Strip of 10", "Antibiotics", 52],
  ["Levofloxacin", ["250 mg", "500 mg", "750 mg"], "Tablet", "Strip of 10", "Antibiotics", 78],
  ["Ofloxacin", ["200 mg", "400 mg"], "Tablet", "Strip of 10", "Antibiotics", 64],
  ["Doxycycline", ["100 mg"], "Capsule", "Strip of 10", "Antibiotics", 58],
  ["Metronidazole", ["200 mg", "400 mg"], "Tablet", "Strip of 15", "Antibiotics", 22],
  ["Nitrofurantoin", ["100 mg"], "Capsule", "Strip of 10", "Antibiotics", 120],
  ["Clarithromycin", ["250 mg", "500 mg"], "Tablet", "Strip of 4", "Antibiotics", 130],
  ["Linezolid", ["600 mg"], "Tablet", "Strip of 4", "Antibiotics", 190],
  ["Mupirocin", ["5 g"], "Ointment", "Tube", "Antibiotics", 120],
  ["Fusidic Acid", ["10 g"], "Cream", "Tube", "Antibiotics", 135],
  // Antifungal & Antiviral
  ["Fluconazole", ["150 mg"], "Tablet", "Strip of 1", "Antifungal & Antiviral", 18],
  ["Itraconazole", ["100 mg", "200 mg"], "Capsule", "Strip of 4", "Antifungal & Antiviral", 160],
  ["Terbinafine", ["250 mg"], "Tablet", "Strip of 7", "Antifungal & Antiviral", 170],
  ["Clotrimazole", ["15 g"], "Cream", "Tube", "Antifungal & Antiviral", 75],
  ["Luliconazole", ["10 g", "30 g"], "Cream", "Tube", "Antifungal & Antiviral", 140],
  ["Acyclovir", ["400 mg", "800 mg"], "Tablet", "Strip of 10", "Antifungal & Antiviral", 95],
  ["Albendazole", ["400 mg"], "Tablet", "Strip of 1", "Antifungal & Antiviral", 12],
  ["Ivermectin", ["6 mg", "12 mg"], "Tablet", "Strip of 4", "Antifungal & Antiviral", 60],
  // Allergy & Respiratory
  ["Levocetirizine", ["5 mg"], "Tablet", "Strip of 10", "Allergy", 30],
  ["Fexofenadine", ["120 mg", "180 mg"], "Tablet", "Strip of 10", "Allergy", 150],
  ["Desloratadine", ["5 mg"], "Tablet", "Strip of 10", "Allergy", 95],
  ["Chlorpheniramine", ["4 mg"], "Tablet", "Strip of 10", "Allergy", 10],
  ["Bilastine", ["20 mg"], "Tablet", "Strip of 10", "Allergy", 175],
  ["Salbutamol", ["100 mcg"], "Inhaler", "200 doses", "Respiratory", 145],
  ["Budesonide + Formoterol", ["200/6 mcg", "400/6 mcg"], "Inhaler", "120 doses", "Respiratory", 390],
  ["Levosalbutamol", ["50 mcg"], "Inhaler", "200 doses", "Respiratory", 160],
  ["Montelukast", ["4 mg", "10 mg"], "Tablet", "Strip of 10", "Respiratory", 85],
  ["Theophylline + Etofylline", ["231 mg"], "Tablet", "Strip of 30", "Respiratory", 40],
  ["Dextromethorphan Syrup", ["100 ml"], "Syrup", "Bottle", "Cold & Cough", 98],
  ["Guaifenesin + Terbutaline Syrup", ["100 ml"], "Syrup", "Bottle", "Cold & Cough", 105],
  ["Phenylephrine + Chlorpheniramine", ["10/2 mg"], "Tablet", "Strip of 10", "Cold & Cough", 45],
  ["Xylometazoline Nasal Spray", ["0.1%"], "Spray", "Bottle of 10 ml", "Cold & Cough", 95],
  ["Saline Nasal Drops", ["0.65%"], "Drops", "Bottle of 15 ml", "Cold & Cough", 55],
  ["Steam Inhalation Capsules", ["10 caps"], "Capsule", "Strip of 10", "Cold & Cough", 70],
  // Gastro
  ["Rabeprazole", ["20 mg"], "Tablet", "Strip of 15", "Gastro", 120],
  ["Esomeprazole", ["20 mg", "40 mg"], "Tablet", "Strip of 15", "Gastro", 135],
  ["Pantoprazole + Domperidone", ["40/30 mg"], "Capsule", "Strip of 15", "Gastro", 165],
  ["Famotidine", ["20 mg", "40 mg"], "Tablet", "Strip of 14", "Gastro", 35],
  ["Antacid Gel (Mint)", ["170 ml"], "Suspension", "Bottle", "Gastro", 115],
  ["Loperamide", ["2 mg"], "Capsule", "Strip of 10", "Gastro", 25],
  ["Racecadotril", ["100 mg"], "Capsule", "Strip of 10", "Gastro", 140],
  ["Lactulose Solution", ["100 ml", "200 ml"], "Solution", "Bottle", "Gastro", 180],
  ["Bisacodyl", ["5 mg"], "Tablet", "Strip of 10", "Gastro", 18],
  ["Ispaghula Husk", ["100 g"], "Powder", "Pack", "Gastro", 135],
  ["Probiotic (Bacillus clausii)", ["5 ml"], "Suspension", "Pack of 5 vials", "Gastro", 260],
  ["Dicyclomine", ["10 mg", "20 mg"], "Tablet", "Strip of 10", "Gastro", 38],
  ["Ursodeoxycholic Acid", ["150 mg", "300 mg"], "Tablet", "Strip of 10", "Gastro", 290],
  // Diabetes
  ["Metformin SR", ["500 mg", "1000 mg"], "Tablet", "Strip of 15", "Diabetes", 45],
  ["Glimepiride + Metformin", ["1/500 mg", "2/500 mg"], "Tablet", "Strip of 15", "Diabetes", 95],
  ["Gliclazide", ["40 mg", "80 mg"], "Tablet", "Strip of 15", "Diabetes", 70],
  ["Sitagliptin", ["50 mg", "100 mg"], "Tablet", "Strip of 15", "Diabetes", 280],
  ["Sitagliptin + Metformin", ["50/500 mg", "50/1000 mg"], "Tablet", "Strip of 15", "Diabetes", 310],
  ["Vildagliptin", ["50 mg"], "Tablet", "Strip of 15", "Diabetes", 240],
  ["Teneligliptin", ["20 mg"], "Tablet", "Strip of 15", "Diabetes", 150],
  ["Dapagliflozin", ["5 mg", "10 mg"], "Tablet", "Strip of 14", "Diabetes", 320],
  ["Empagliflozin", ["10 mg", "25 mg"], "Tablet", "Strip of 10", "Diabetes", 450],
  ["Voglibose", ["0.2 mg", "0.3 mg"], "Tablet", "Strip of 10", "Diabetes", 110],
  ["Glucometer Test Strips", ["50 strips"], "Strips", "Box", "Diabetes", 899],
  ["Lancets", ["100 pcs"], "Lancet", "Box", "Diabetes", 220],
  // Cardiac
  ["Atorvastatin", ["20 mg", "40 mg"], "Tablet", "Strip of 15", "Cardiac", 160],
  ["Rosuvastatin", ["5 mg", "10 mg", "20 mg"], "Tablet", "Strip of 15", "Cardiac", 145],
  ["Metoprolol Succinate", ["25 mg", "50 mg"], "Tablet", "Strip of 10", "Cardiac", 75],
  ["Bisoprolol", ["2.5 mg", "5 mg"], "Tablet", "Strip of 10", "Cardiac", 85],
  ["Telmisartan + Hydrochlorothiazide", ["40/12.5 mg"], "Tablet", "Strip of 15", "Cardiac", 135],
  ["Telmisartan + Amlodipine", ["40/5 mg"], "Tablet", "Strip of 15", "Cardiac", 145],
  ["Olmesartan", ["20 mg", "40 mg"], "Tablet", "Strip of 10", "Cardiac", 120],
  ["Cilnidipine", ["10 mg"], "Tablet", "Strip of 10", "Cardiac", 110],
  ["Ramipril", ["2.5 mg", "5 mg"], "Capsule", "Strip of 10", "Cardiac", 90],
  ["Clopidogrel", ["75 mg"], "Tablet", "Strip of 15", "Cardiac", 95],
  ["Aspirin (low dose)", ["75 mg", "150 mg"], "Tablet", "Strip of 14", "Cardiac", 15],
  ["Torsemide", ["10 mg", "20 mg"], "Tablet", "Strip of 15", "Cardiac", 60],
  ["Spironolactone", ["25 mg"], "Tablet", "Strip of 15", "Cardiac", 45],
  ["Isosorbide Mononitrate", ["30 mg"], "Tablet", "Strip of 10", "Cardiac", 70],
  // Thyroid & Hormones
  ["Levothyroxine", ["25 mcg", "50 mcg", "75 mcg", "100 mcg"], "Tablet", "Bottle of 100", "Thyroid", 120],
  ["Carbimazole", ["5 mg", "10 mg"], "Tablet", "Strip of 15", "Thyroid", 75],
  // Neuro & Mental health
  ["Gabapentin", ["300 mg"], "Capsule", "Strip of 10", "Neuro", 140],
  ["Pregabalin", ["75 mg", "150 mg"], "Capsule", "Strip of 10", "Neuro", 160],
  ["Amitriptyline", ["10 mg", "25 mg"], "Tablet", "Strip of 10", "Neuro", 30],
  ["Sertraline", ["50 mg", "100 mg"], "Tablet", "Strip of 10", "Neuro", 85],
  ["Escitalopram", ["5 mg", "10 mg"], "Tablet", "Strip of 10", "Neuro", 95],
  ["Flunarizine", ["5 mg", "10 mg"], "Tablet", "Strip of 15", "Neuro", 55],
  ["Betahistine", ["8 mg", "16 mg"], "Tablet", "Strip of 15", "Neuro", 120],
  ["Sumatriptan", ["50 mg"], "Tablet", "Strip of 4", "Neuro", 165],
  // Vitamins & Supplements
  ["Methylcobalamin", ["500 mcg", "1500 mcg"], "Tablet", "Strip of 10", "Vitamins", 95],
  ["Vitamin C (Chewable)", ["500 mg"], "Tablet", "Strip of 15", "Vitamins", 30],
  ["Zinc Sulphate", ["20 mg"], "Tablet", "Strip of 10", "Vitamins", 25],
  ["Multivitamin + Multimineral", ["1 tab"], "Tablet", "Strip of 15", "Vitamins", 140],
  ["Omega-3 Fatty Acids", ["1000 mg"], "Capsule", "Strip of 10", "Vitamins", 210],
  ["Vitamin E", ["400 mg"], "Capsule", "Strip of 10", "Vitamins", 45],
  ["Biotin", ["10 mg"], "Tablet", "Strip of 10", "Vitamins", 195],
  ["Folic Acid", ["5 mg"], "Tablet", "Strip of 10", "Vitamins", 12],
  ["Protein Powder (Vanilla)", ["200 g", "400 g"], "Powder", "Jar", "Vitamins", 420],
  ["Electrolyte Drink (Orange)", ["200 ml"], "Liquid", "Pack of 4", "Vitamins", 140],
  // Women's Health
  ["Tranexamic Acid", ["500 mg"], "Tablet", "Strip of 10", "Women's Health", 210],
  ["Tranexamic Acid + Mefenamic Acid", ["500/250 mg"], "Tablet", "Strip of 10", "Women's Health", 230],
  ["Drotaverine", ["40 mg", "80 mg"], "Tablet", "Strip of 10", "Women's Health", 75],
  ["Calcium Citrate + Vitamin D3", ["1 tab"], "Tablet", "Strip of 15", "Women's Health", 175],
  ["Prenatal Multivitamin", ["1 tab"], "Tablet", "Strip of 15", "Women's Health", 230],
  ["Myo-Inositol + D-Chiro-Inositol", ["550/13.8 mg"], "Sachet", "Pack of 30", "Women's Health", 780],
  ["Cranberry Extract", ["300 mg"], "Capsule", "Strip of 10", "Women's Health", 260],
  ["Clotrimazole Vaginal Tablet", ["100 mg", "500 mg"], "Tablet", "Pack of 6", "Women's Health", 95],
  ["Intimate Wash (pH 3.5)", ["100 ml", "200 ml"], "Liquid", "Bottle", "Women's Health", 199],
  ["Sanitary Pads Regular", ["Pack of 8", "Pack of 20"], "Pad", "Pack", "Women's Health", 79],
  ["Sanitary Pads Overnight XXL", ["Pack of 10"], "Pad", "Pack", "Women's Health", 189],
  ["Panty Liners", ["Pack of 30"], "Liner", "Pack", "Women's Health", 120],
  ["Tampons (Regular)", ["Pack of 16"], "Tampon", "Pack", "Women's Health", 299],
  ["Menstrual Cup (Small)", ["1 cup"], "Cup", "Box", "Women's Health", 349],
  ["Menstrual Cup (Large)", ["1 cup"], "Cup", "Box", "Women's Health", 349],
  ["Heat Patch for Cramps", ["Pack of 3"], "Patch", "Pack", "Women's Health", 199],
  ["Pregnancy Test Kit", ["1 kit"], "Kit", "Box", "Women's Health", 60],
  ["Ovulation Test Strips", ["Pack of 5"], "Strips", "Box", "Women's Health", 450],
  // Dermatology
  ["Calamine Lotion", ["100 ml"], "Lotion", "Bottle", "Dermatology", 110],
  ["Benzoyl Peroxide Gel", ["2.5%", "5%"], "Gel", "Tube of 20 g", "Dermatology", 145],
  ["Adapalene Gel", ["0.1%"], "Gel", "Tube of 15 g", "Dermatology", 230],
  ["Clindamycin Gel", ["1%"], "Gel", "Tube of 20 g", "Dermatology", 125],
  ["Hydrocortisone Cream", ["1%"], "Cream", "Tube of 15 g", "Dermatology", 70],
  ["Sunscreen SPF 50", ["50 g"], "Gel", "Tube", "Dermatology", 450],
  ["Moisturising Cream (Ceramide)", ["100 g"], "Cream", "Tube", "Dermatology", 380],
  ["Permethrin Cream", ["5%"], "Cream", "Tube of 30 g", "Dermatology", 160],
  ["Ketoconazole Shampoo", ["2%"], "Shampoo", "Bottle of 100 ml", "Dermatology", 290],
  // Eye & Ear
  ["Carboxymethylcellulose Eye Drops", ["0.5%"], "Drops", "Bottle of 10 ml", "Eye & Ear", 160],
  ["Moxifloxacin Eye Drops", ["0.5%"], "Drops", "Bottle of 5 ml", "Eye & Ear", 120],
  ["Olopatadine Eye Drops", ["0.1%"], "Drops", "Bottle of 5 ml", "Eye & Ear", 180],
  ["Ciprofloxacin Ear Drops", ["0.3%"], "Drops", "Bottle of 10 ml", "Eye & Ear", 45],
  ["Wax Softening Ear Drops", ["10 ml"], "Drops", "Bottle", "Eye & Ear", 95],
  // First Aid & Devices
  ["Adhesive Bandages", ["Pack of 20", "Pack of 100"], "Bandage", "Box", "First Aid", 60],
  ["Crepe Bandage", ["10 cm"], "Bandage", "Roll", "First Aid", 120],
  ["Sterile Gauze Swabs", ["Pack of 10"], "Gauze", "Pack", "First Aid", 45],
  ["Surgical Cotton", ["100 g", "400 g"], "Cotton", "Roll", "First Aid", 70],
  ["Antiseptic Liquid", ["125 ml", "500 ml"], "Liquid", "Bottle", "First Aid", 90],
  ["Silver Sulfadiazine Cream", ["1%"], "Cream", "Tube of 25 g", "First Aid", 95],
  ["Micropore Surgical Tape", ["1 inch"], "Tape", "Roll", "First Aid", 85],
  ["Nitrile Examination Gloves", ["Box of 100"], "Gloves", "Box", "First Aid", 550],
  ["Surgical Face Masks", ["Box of 50"], "Mask", "Box", "First Aid", 250],
  ["N95 Respirator", ["Pack of 5"], "Mask", "Pack", "First Aid", 375],
  ["Digital BP Monitor", ["Upper arm"], "Device", "1 unit", "Devices", 1899],
  ["Pulse Oximeter", ["Fingertip"], "Device", "1 unit", "Devices", 1199],
  ["Glucometer Kit", ["With 10 strips"], "Device", "1 kit", "Devices", 999],
  ["Infrared Thermometer", ["Non-contact"], "Device", "1 unit", "Devices", 1499],
  ["Nebulizer (Compressor)", ["Adult + Child masks"], "Device", "1 unit", "Devices", 2299],
  ["Hot Water Bag", ["2 L"], "Device", "1 unit", "Devices", 320],
  ["Disposable Syringes", ["2 ml", "5 ml"], "Syringe", "Pack of 10", "Devices", 70],
];

const HSN = { Device: "9018", Syringe: "9018", Pad: "9619", Liner: "9619", Tampon: "9619", Cup: "4014", Mask: "6307", Gloves: "4015", Strips: "3822", Kit: "3822", Lancet: "9018", Bandage: "3005", Gauze: "3005", Cotton: "3005", Tape: "3005", Shampoo: "3305", Liquid: "3004" };
const MOQ = { Device: 2, Syringe: 10, Strips: 5, Kit: 10 };

const esc = (s) => s.replace(/'/g, "''");
const code = (s) => s.replace(/\(.*?\)/g, "").split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w.slice(0, 3).toUpperCase()).join("").slice(0, 9);

const rows = [];
const seen = new Set();
let i = 0;
for (const [name, strengths, form, pack, category, base] of ITEMS) {
  strengths.forEach((strength, idx) => {
    i++;
    // Higher strengths cost more; small deterministic variation per item.
    const mrp = Math.round(base * (1 + idx * 0.45) * (1 + ((i * 37) % 11) / 100));
    const price = +(mrp * 0.78).toFixed(2);
    const distributorPrice = +(mrp * 0.63).toFixed(2);
    let sku = `SW-${code(name)}-${strength.replace(/[^0-9A-Za-z]/g, "").toUpperCase().slice(0, 8)}`;
    while (seen.has(sku)) sku += "X";
    seen.add(sku);
    const isDrugForm = !["Device", "Pad", "Liner", "Tampon", "Cup", "Mask", "Gloves", "Bandage", "Gauze", "Cotton", "Tape", "Syringe", "Lancet", "Kit", "Strips"].includes(form);
    // Per-unit strengths ("1 tab") add nothing to the name.
    const shownStrength = /^1 (tab|cup)$/.test(strength) ? "" : ` ${strength}`;
    const fullName = isDrugForm ? `${name}${shownStrength} ${form}` : `${name} (${strength})`;
    const moq = MOQ[form] || (mrp > 500 ? 5 : mrp > 150 ? 10 : 20);
    rows.push(
      `  ('${sku}', '${esc(fullName)}', '${esc(category)}', '${MAKERS[i % MAKERS.length]}', '${esc(pack)}', '${HSN[form] || "3004"}', ${mrp.toFixed(2)}, ${price.toFixed(2)}, ${distributorPrice.toFixed(2)}, ${moq}, '${esc(`${category} · ${form.toLowerCase()}`)}')`
    );
  });
}

const sql = `-- ===================================================================
-- Swasthya extended demo catalog (${rows.length} products)
-- Generated by scripts/generate-catalog.js. SYNTHETIC DATA: generic names,
-- fictional manufacturers, illustrative INR prices. Safe to re-run.
-- ===================================================================

insert into public.products
  (sku, name, category, manufacturer, pack_size, hsn_code, mrp, price, distributor_price, moq, description)
values
${rows.join(",\n")}
on conflict (sku) do nothing;

-- Approved distributors stock the whole catalog.
insert into public.distributor_stock (distributor_id, product_id, sku, quantity, min_order_quantity, batch_number, expiry_date)
select
  d.id, p.id, p.sku,
  100 + (abs(hashtext(d.id::text || p.sku)) % 1900),
  p.moq,
  'B' || to_char(now(), 'YY') || upper(substr(md5(d.id::text || p.sku), 1, 5)),
  current_date + 180 + (abs(hashtext(p.sku || d.id::text)) % 540)
from public.distributor_profiles d
cross join public.products p
where d.status = 'approved'
on conflict (distributor_id, product_id) do nothing;
`;

fs.writeFileSync(path.join(__dirname, "..", "supabase", "catalog.sql"), sql);
console.log(`Wrote supabase/catalog.sql with ${rows.length} products.`);
