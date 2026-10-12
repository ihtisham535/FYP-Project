/* ============================================================
   DATA MODEL (shared across every portal — one ecosystem)
   ============================================================ */
let medicines = [
  {name:"Panadol 500mg", generic:"Paracetamol", category:"Analgesic", strength:"500mg", form:"Tablet", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"MediSupply Distributors", pharmacy:"MediCare Pharmacy", mfg:"2024-01-12", exp:"2026-01-12", qty:5000, storage:"Store below 25°C, protect from moisture", status:"Verified", code:"MED-2024-0113"},
  {name:"Augmentin 625mg", generic:"Amoxicillin/Clavulanate", category:"Antibiotic", strength:"625mg", form:"Tablet", batch:"BT-2024-0932", manufacturer:"GSK Pakistan", vendor:"HealthLine Traders", pharmacy:"Rahman Pharmacy", mfg:"2023-11-05", exp:"2025-11-05", qty:2200, storage:"Store below 25°C", status:"Verified", code:"MED-2024-0208"},
  {name:"Brufen 400mg", generic:"Ibuprofen", category:"NSAID", strength:"400mg", form:"Tablet", batch:"BT-2024-1450", manufacturer:"Abbott Pakistan", vendor:"MediSupply Distributors", pharmacy:"Cityline Pharmacy", mfg:"2024-03-20", exp:"2026-03-20", qty:3000, storage:"Store below 30°C", status:"Suspicious", code:"MED-2024-0299"},
  {name:"Calpol Syrup", generic:"Paracetamol", category:"Analgesic", strength:"120mg/5ml", form:"Syrup", batch:"BT-2023-0871", manufacturer:"GSK Pakistan", vendor:"Al-Barakah Pharma Traders", pharmacy:"Prime Health Pharmacy", mfg:"2023-08-15", exp:"2025-08-15", qty:1500, storage:"Do not freeze", status:"Verified", code:"MED-2023-0871"},
  {name:"Risek 20mg", generic:"Omeprazole", category:"Antacid", strength:"20mg", form:"Capsule", batch:"BT-2024-0654", manufacturer:"Getz Pharma", vendor:"HealthLine Traders", pharmacy:"Al-Shifa Pharmacy", mfg:"2024-02-01", exp:"2026-02-01", qty:1800, storage:"Store below 25°C", status:"Recalled", code:"MED-2024-0654"},
  {name:"Arinac Forte", generic:"Paracetamol/Phenylephrine", category:"Cold & Flu", strength:"500mg", form:"Tablet", batch:"BT-2024-1102", manufacturer:"Highnoon Laboratories", vendor:"MediSupply Distributors", pharmacy:"MediCare Pharmacy", mfg:"2024-04-18", exp:"2026-04-18", qty:2600, storage:"Store below 25°C", status:"Verified", code:"MED-2024-1102"},
  {name:"Ponstan 500mg", generic:"Mefenamic Acid", category:"Analgesic", strength:"500mg", form:"Capsule", batch:"BT-2023-0765", manufacturer:"Pfizer Pakistan", vendor:"Al-Barakah Pharma Traders", pharmacy:"Al-Shifa Pharmacy", mfg:"2023-09-09", exp:"2025-09-09", qty:1400, storage:"Store below 25°C", status:"Verified", code:"MED-2023-0765"},
];

const SUB_PLANS = {
  Trial: {
    name:'Trial', price:'Rs. 0', period:'/14 days',
    tagline:'Try the pharmacy POS with limited functionality',
    features:['Basic medicine search','POS billing & receipts','Record sales','View inventory (read-only)','Limited daily sales overview','Demo trial — auto-expires'],
    missing:['Full inventory management','Shipments & suppliers','Advanced analytics','Employee management','Advanced reports'],
    premium:false, trial:true, cta:'Start free trial'
  },
  Basic: {
    name:'Basic', price:'Demo', period:'',
    tagline:'Core operations for small pharmacies',
    features:['Full POS billing & receipts','Medicine & batch inventory','Stock receipts & purchases','Supplier information','Low-stock & expiry alerts','Basic sales summaries & reports','QR / package verification','Incoming shipments'],
    missing:['Advanced analytics & margins','Employee management','Reorder suggestions','Regional demand insights'],
    premium:false, cta:'Start with Basic'
  },
  Premium: {
    name:'Premium', price:'Demo', period:'',
    tagline:'Analytics, teams & business management',
    features:['Everything in Basic','Sales trends & gross margin insights','Best / slow-moving medicines','Advanced stock & expiry alerts','Supplier & purchase insights','Reorder suggestions','Advanced reports','Employee management & sales performance','Activity audit log'],
    missing:[],
    premium:true, cta:'Choose Premium', popular:true
  }
};
/* Migrate legacy plan name Professional → Premium */
function normalizePlan(plan){
  if(plan==='Premium') return 'Premium';
  if(plan==='Free Trial') return 'Trial';
  return plan || 'Basic';
}
let pharmacies = [
  {name:"MediCare Pharmacy", owner:"Ahmed Raza", license:"PH-LHR-2201", city:"Lahore", area:"Gulberg III", address:"12-A Main Boulevard, Gulberg III (demo)", contact:"+92 300 1234567", hours:"09:00 – 22:00", lat:31.5204, lng:74.3587, plan:"Premium", sub:"Active", subStatus:"Active", startDate:"2026-01-01", expiryDate:"2027-12-31", status:"Verified"},
  {name:"Rahman Pharmacy", owner:"Sana Rahman", license:"PH-KHI-1187", city:"Karachi", area:"Clifton Block 5", address:"Shop 4, Khayaban-e-Shamsheer, Clifton (demo)", contact:"+92 321 9988776", hours:"10:00 – 23:00", lat:24.8138, lng:67.0222, plan:"Basic", sub:"Active", subStatus:"Active", startDate:"2026-01-15", expiryDate:"2027-11-15", status:"Verified"},
  {name:"Wellness Point", owner:"Bilal Aslam", license:"PH-ISB-0456", city:"Islamabad", area:"F-7 Markaz", address:"Office Plaza, F-7 Markaz (demo)", contact:"+92 333 4455667", hours:"09:00 – 21:00", lat:33.7215, lng:73.0433, plan:"Basic", sub:"Pending", subStatus:"Pending", startDate:"2026-09-20", expiryDate:"2026-10-20", status:"Pending"},
  {name:"Cityline Pharmacy", owner:"Fatima Noor", license:"PH-FSD-0912", city:"Faisalabad", area:"D Ground", address:"Near Clock Tower Road, D Ground (demo)", contact:"+92 301 2233445", hours:"08:30 – 22:30", lat:31.4187, lng:73.0791, plan:"Premium", sub:"Active", subStatus:"Expiring Soon", startDate:"2026-02-01", expiryDate:"2027-02-01", status:"Verified"},
  {name:"Al-Shifa Pharmacy", owner:"Usman Tariq", license:"PH-MUL-0345", city:"Multan", area:"Cantt", address:"Abdali Road, Multan Cantt (demo)", contact:"+92 302 7766554", hours:"09:00 – 21:00", lat:30.1984, lng:71.4687, plan:"Basic", sub:"Expired", subStatus:"Expired", startDate:"2025-01-01", expiryDate:"2025-12-31", status:"Suspended"},
  {name:"Prime Health Pharmacy", owner:"Ayesha Malik", license:"PH-PSH-0778", city:"Peshawar", area:"University Town", address:"Opposite PDA Building (demo)", contact:"+92 315 8899001", hours:"09:00 – 22:00", lat:34.0151, lng:71.5249, plan:"Premium", sub:"Active", subStatus:"Active", startDate:"2026-03-01", expiryDate:"2027-03-01", status:"Verified"},
];
/* Demo reference points for "Use my location" simulation (not real GPS) */
const DEMO_LOCATIONS = {
  Lahore: {label:'Lahore · Gulberg (demo)', lat:31.5225, lng:74.3520},
  Karachi: {label:'Karachi · Clifton (demo)', lat:24.8150, lng:67.0250},
  Islamabad: {label:'Islamabad · F-7 (demo)', lat:33.7220, lng:73.0450},
  Faisalabad: {label:'Faisalabad · D Ground (demo)', lat:31.4200, lng:73.0800},
  Multan: {label:'Multan · Cantt (demo)', lat:30.2000, lng:71.4700},
  Peshawar: {label:'Peshawar · University Town (demo)', lat:34.0160, lng:71.5260}
};
let patientLocation = {city:'Lahore', lat:31.5225, lng:74.3520, source:'demo'};
let patientNearbyQuery = {medicine:'', sort:'distance', onlyInStock:false, city:'Lahore'};


let vendors = [
  {name:"MediSupply Distributors", license:"VN-0021", city:"Lahore", pharmacies:["MediCare Pharmacy","Cityline Pharmacy","Al-Shifa Pharmacy"], supplied:128, status:"Approved"},
  {name:"HealthLine Traders", license:"VN-0045", city:"Karachi", pharmacies:["Rahman Pharmacy","Wellness Point"], supplied:94, status:"Approved"},
  {name:"Al-Barakah Pharma Traders", license:"VN-0078", city:"Multan", pharmacies:["Prime Health Pharmacy","Al-Shifa Pharmacy"], supplied:76, status:"Approved"},
];

let manufacturers = [
  {name:"GSK Pakistan", license:"MFG-GSK-001", city:"Karachi", products:14, status:"Approved"},
  {name:"Abbott Pakistan", license:"MFG-ABT-002", city:"Karachi", products:9, status:"Approved"},
  {name:"Getz Pharma", license:"MFG-GTZ-003", city:"Karachi", products:11, status:"Approved"},
  {name:"Highnoon Laboratories", license:"MFG-HNL-004", city:"Lahore", products:7, status:"Pending"},
  {name:"Pfizer Pakistan", license:"MFG-PFZ-005", city:"Karachi", products:6, status:"Approved"},
];

let doctors = [
  {name:"Dr. Sara Khalid", specialty:"Internal Medicine", license:"PMC-30214", patients:42, status:"Verified"},
  {name:"Dr. Imran Sheikh", specialty:"Cardiology", license:"PMC-28877", patients:31, status:"Verified"},
  {name:"Dr. Nida Farooq", specialty:"Pediatrics", license:"PMC-31502", patients:56, status:"Pending"},
];

let users = [
  {name:"Ahmad Raza", email:"ahmad@pharmachain.pk", role:"Administrator", status:"Active"},
  {name:"Dr. Sara Khalid", email:"sara.khalid@pharmachain.pk", role:"Doctor", status:"Active"},
  {name:"Bilal Aslam", email:"bilal@wellnesspoint.pk", role:"Pharmacy", status:"Pending"},
  {name:"GSK Pakistan", email:"ops@gsk.com.pk", role:"Manufacturer", status:"Active"},
  {name:"MediSupply Distributors", email:"contact@medisupply.pk", role:"Vendor", status:"Active"},
  {name:"Ali Hassan", email:"ali.hassan@example.com", role:"Patient", status:"Active"},
  {name:"Al-Shifa Pharmacy", email:"contact@alshifa.pk", role:"Pharmacy", status:"Suspended"},
];

let patients = [
  {id:"PT-10432", masked:"A. Iqbal", age:34, city:"Lahore", entries:[
    {medicine:"Panadol 500mg", batch:"BT-2024-1187", pharmacy:"MediCare Pharmacy", date:"2024-01-18", context:"Fever & body ache", usage:"Completed"},
    {medicine:"Augmentin 625mg", batch:"BT-2024-0932", pharmacy:"MediCare Pharmacy", date:"2023-12-02", context:"Bacterial throat infection", usage:"Completed"},
  ]},
  {id:"PT-10577", masked:"S. Rahman", age:29, city:"Karachi", entries:[
    {medicine:"Calpol Syrup", batch:"BT-2023-0871", pharmacy:"Rahman Pharmacy", date:"2023-09-10", context:"Pediatric fever", usage:"Completed"},
    {medicine:"Ponstan 500mg", batch:"BT-2023-0765", pharmacy:"Rahman Pharmacy", date:"2023-09-12", context:"Post-dental pain management", usage:"Discontinued"},
  ]},
  {id:"PT-10891", masked:"M. Tariq", age:47, city:"Multan", entries:[
    {medicine:"Risek 20mg", batch:"BT-2024-0654", pharmacy:"Al-Shifa Pharmacy", date:"2024-02-05", context:"Acid reflux, routine course", usage:"Ongoing"},
  ]},
];
const CURRENT_PATIENT_ID = "PT-10432"; // demo patient used by the mobile app

let prescriptions = [
  {id:"RX-5591", doctor:"Dr. Sara Khalid", patientId:"PT-10432", patient:"A. Iqbal", medicine:"Augmentin 625mg", dosage:"1 tablet", frequency:"Twice daily", duration:"7 days", instructions:"Take after meals", diagnosis:"Bacterial throat infection", date:"2023-12-02"},
  {id:"RX-5602", doctor:"Dr. Sara Khalid", patientId:"PT-10432", patient:"A. Iqbal", medicine:"Panadol 500mg", dosage:"1 tablet", frequency:"As needed", duration:"5 days", instructions:"Max 4 per day", diagnosis:"Fever & body ache", date:"2024-01-16"},
  {id:"RX-5688", doctor:"Dr. Imran Sheikh", patientId:"PT-10891", patient:"M. Tariq", medicine:"Risek 20mg", dosage:"1 capsule", frequency:"Once daily, morning", duration:"30 days", instructions:"Before breakfast", diagnosis:"Acid reflux", date:"2024-02-05"},
];

let shipments = [
  {id:"SHP-7001", medicine:"Panadol 500mg", product:"Panadol 500mg", batch:"BT-2024-1187", from:"GSK Pakistan", to:"MediSupply Distributors", vendor:"MediSupply Distributors", pharmacy:"—", qty:5000, date:"2024-01-14", dispatchDate:"2024-01-14", expectedDate:"2024-01-15", status:"Confirmed", type:"mfg-to-vendor", packages:["PKG-B2X9HL","PKG-C5Y1JM","PKG-A8F92K","PKG-7C29BX","PKG-F91D72"]},
  {id:"SHP-7002", medicine:"Panadol 500mg", product:"Panadol 500mg", batch:"BT-2024-1187", from:"MediSupply Distributors", to:"MediCare Pharmacy", vendor:"MediSupply Distributors", pharmacy:"MediCare Pharmacy", qty:1200, date:"2024-01-16", dispatchDate:"2024-01-16", expectedDate:"2024-01-17", status:"Confirmed", type:"vendor-to-pharmacy", packages:["PKG-A8F92K","PKG-7C29BX","PKG-F91D72","PKG-K3M8PQ","PKG-N4R7TW"]},
  {id:"SHP-7003", medicine:"Brufen 400mg", product:"Brufen 400mg", batch:"BT-2024-1450", from:"Abbott Pakistan", to:"MediSupply Distributors", vendor:"MediSupply Distributors", pharmacy:"—", qty:3000, date:"2024-03-23", dispatchDate:"2024-03-23", expectedDate:"2024-03-24", status:"Confirmed", type:"mfg-to-vendor", packages:["PKG-2024-1450-0001"]},
  {id:"SHP-7004", medicine:"Brufen 400mg", product:"Brufen 400mg", batch:"BT-2024-1450", from:"MediSupply Distributors", to:"Cityline Pharmacy", vendor:"MediSupply Distributors", pharmacy:"Cityline Pharmacy", qty:800, date:"2024-03-25", dispatchDate:"2024-03-25", expectedDate:"2024-03-27", status:"In Transit", type:"vendor-to-pharmacy", packages:["PKG-2024-1450-0101"]},
  {id:"SHP-7005", medicine:"Risek 20mg", product:"Risek 20mg", batch:"BT-2024-0654", from:"Getz Pharma", to:"HealthLine Traders", vendor:"HealthLine Traders", pharmacy:"—", qty:2000, date:"2024-02-03", dispatchDate:"2024-02-03", expectedDate:"2024-02-04", status:"Recalled", type:"mfg-to-vendor", packages:[]},
];

/* Package IDs + QR units (unique per package) */
/* Package statuses: CREATED | WITH_DISTRIBUTOR | WITH_PHARMACY | IN_TRANSIT | SOLD | REPORTED | BLOCKED
   Legacy aliases (In Stock, Sold, At Manufacturer) still accepted in checks. */
let packages = [
  /* DEMO VERIFIED — genuine package at MediCare Pharmacy */
  {id:"PKG-A8F92K", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_PHARMACY", location:"MediCare Pharmacy", exp:"2026-01-12", qr:"QR-PKG-A8F92K"},
  {id:"PKG-7C29BX", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_PHARMACY", location:"MediCare Pharmacy", exp:"2026-01-12", qr:"QR-PKG-7C29BX"},
  {id:"PKG-F91D72", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_PHARMACY", location:"MediCare Pharmacy", exp:"2026-01-12", qr:"QR-PKG-F91D72"},
  /* More pharmacy stock packages for POS sales */
  {id:"PKG-K3M8PQ", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_PHARMACY", location:"MediCare Pharmacy", exp:"2026-01-12", qr:"QR-PKG-K3M8PQ"},
  {id:"PKG-N4R7TW", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_PHARMACY", location:"MediCare Pharmacy", exp:"2026-01-12", qr:"QR-PKG-N4R7TW"},
  /* With distributor */
  {id:"PKG-B2X9HL", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_DISTRIBUTOR", location:"MediSupply Distributors", exp:"2026-01-12", qr:"QR-PKG-B2X9HL"},
  {id:"PKG-C5Y1JM", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_DISTRIBUTOR", location:"MediSupply Distributors", exp:"2026-01-12", qr:"QR-PKG-C5Y1JM"},
  /* DEMO SOLD — reused package identity scenario */
  {id:"PKG-SOLD91", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"SOLD", location:"Patient A. Iqbal", exp:"2026-01-12", qr:"QR-PKG-SOLD91"},
  /* DEMO SUSPICIOUS — supply-chain mismatch (claims pharmacy never on route) */
  {id:"PKG-MISMATCH", productId:"MED-2024-0113", batch:"BT-2024-1187", medicine:"Panadol 500mg", manufacturer:"GSK Pakistan", qty:1, status:"WITH_PHARMACY", location:"Unknown Clinic", exp:"2026-01-12", qr:"QR-PKG-MISMATCH", chainBroken:true},
  /* Brufen packages */
  {id:"PKG-D8W3KN", productId:"MED-2024-1450", batch:"BT-2024-1450", medicine:"Brufen 400mg", manufacturer:"Abbott Pakistan", qty:1, status:"WITH_DISTRIBUTOR", location:"MediSupply Distributors", exp:"2026-03-20", qr:"QR-PKG-D8W3KN"},
  {id:"PKG-E6V2LP", productId:"MED-2024-1450", batch:"BT-2024-1450", medicine:"Brufen 400mg", manufacturer:"Abbott Pakistan", qty:1, status:"IN_TRANSIT", location:"Shipment SHP-7004", exp:"2026-03-20", qr:"QR-PKG-E6V2LP"},
];
/* PKG-FAKE123 intentionally NOT in packages → NOT FOUND */

/* Pharmacy inventory — only grows after pharmacy confirms receipt (not on vendor dispatch) */
let pharmacyStock = [
  {pharmacy:"MediCare Pharmacy", medicine:"Panadol 500mg", generic:"Paracetamol", strength:"500mg", packSize:"1x10 tablets", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"MediSupply Distributors", qty:135, exp:"2026-01-12", mfg:"2024-01-12", unitPrice:85, packages:["PKG-A8F92K","PKG-7C29BX","PKG-F91D72","PKG-K3M8PQ","PKG-N4R7TW"], status:"Verified", updatedAt:"2026-10-10 14:30"},
  {pharmacy:"MediCare Pharmacy", medicine:"Arinac Forte", generic:"Paracetamol/Phenylephrine", strength:"500mg", packSize:"1x20 tablets", batch:"BT-2024-1102", manufacturer:"Highnoon Laboratories", vendor:"MediSupply Distributors", qty:18, exp:"2026-04-18", mfg:"2024-04-18", unitPrice:120, packages:[], status:"Verified", updatedAt:"2026-10-09 11:00"},
  {pharmacy:"MediCare Pharmacy", medicine:"Augmentin 625mg", generic:"Amoxicillin/Clavulanate", strength:"625mg", packSize:"1x6 tablets", batch:"BT-2024-0932", manufacturer:"GSK Pakistan", vendor:"MediSupply Distributors", qty:86, exp:"2025-11-05", mfg:"2023-11-05", unitPrice:340, packages:[], status:"Verified", updatedAt:"2026-10-08 16:45"},
  {pharmacy:"MediCare Pharmacy", medicine:"Brufen 400mg", generic:"Ibuprofen", strength:"400mg", packSize:"1x20 tablets", batch:"BT-2024-1450", manufacturer:"Abbott Pakistan", vendor:"MediSupply Distributors", qty:12, exp:"2026-10-20", mfg:"2024-10-20", unitPrice:95, packages:[], status:"Verified", updatedAt:"2026-10-11 09:20"},
  {pharmacy:"MediCare Pharmacy", medicine:"Calpol Syrup", generic:"Paracetamol", strength:"120mg/5ml", packSize:"60ml bottle", batch:"BT-2023-0871", manufacturer:"GSK Pakistan", vendor:"MediSupply Distributors", qty:8, exp:"2026-10-25", mfg:"2023-10-25", unitPrice:150, packages:[], status:"Verified", updatedAt:"2026-10-07 13:10"},
  {pharmacy:"MediCare Pharmacy", medicine:"Risek 20mg", generic:"Omeprazole", strength:"20mg", packSize:"1x14 capsules", batch:"BT-2024-0654", manufacturer:"Getz Pharma", vendor:"MediSupply Distributors", qty:0, exp:"2025-09-01", mfg:"2024-02-01", unitPrice:110, packages:[], status:"Recalled", updatedAt:"2026-09-01 10:00"},
  {pharmacy:"Rahman Pharmacy", medicine:"Augmentin 625mg", generic:"Amoxicillin/Clavulanate", strength:"625mg", packSize:"1x6 tablets", batch:"BT-2024-0932", manufacturer:"GSK Pakistan", vendor:"HealthLine Traders", qty:300, exp:"2025-11-05", mfg:"2023-11-05", unitPrice:355, packages:[], status:"Verified", updatedAt:"2026-10-11 08:00"},
  {pharmacy:"Rahman Pharmacy", medicine:"Panadol 500mg", generic:"Paracetamol", strength:"500mg", packSize:"1x10 tablets", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"HealthLine Traders", qty:90, exp:"2026-01-12", mfg:"2024-01-12", unitPrice:90, packages:[], status:"Verified", updatedAt:"2026-10-10 18:00"},
  {pharmacy:"Rahman Pharmacy", medicine:"Brufen 400mg", generic:"Ibuprofen", strength:"400mg", packSize:"1x20 tablets", batch:"BT-2024-1450", manufacturer:"Abbott Pakistan", vendor:"HealthLine Traders", qty:40, exp:"2026-10-20", mfg:"2024-10-20", unitPrice:98, packages:[], status:"Verified", updatedAt:"2026-10-09 12:30"},
  {pharmacy:"Cityline Pharmacy", medicine:"Panadol 500mg", generic:"Paracetamol", strength:"500mg", packSize:"1x10 tablets", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"MediSupply Distributors", qty:200, exp:"2026-01-12", mfg:"2024-01-12", unitPrice:82, packages:[], status:"Verified", updatedAt:"2026-10-11 10:15"},
  {pharmacy:"Cityline Pharmacy", medicine:"Brufen 400mg", generic:"Ibuprofen", strength:"400mg", packSize:"1x20 tablets", batch:"BT-2024-1450", manufacturer:"Abbott Pakistan", vendor:"MediSupply Distributors", qty:5, exp:"2026-03-20", mfg:"2024-03-20", unitPrice:92, packages:[], status:"Suspicious", updatedAt:"2026-10-05 15:00"},
  {pharmacy:"Wellness Point", medicine:"Panadol 500mg", generic:"Paracetamol", strength:"500mg", packSize:"1x10 tablets", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"HealthLine Traders", qty:55, exp:"2026-01-12", mfg:"2024-01-12", unitPrice:88, packages:[], status:"Verified", updatedAt:"2026-10-08 11:40"},
  {pharmacy:"Wellness Point", medicine:"Calpol Syrup", generic:"Paracetamol", strength:"120mg/5ml", packSize:"60ml bottle", batch:"BT-2023-0871", manufacturer:"GSK Pakistan", vendor:"HealthLine Traders", qty:22, exp:"2025-08-15", mfg:"2023-08-15", unitPrice:155, packages:[], status:"Verified", updatedAt:"2026-10-06 09:50"},
  {pharmacy:"Prime Health Pharmacy", medicine:"Panadol 500mg", generic:"Paracetamol", strength:"500mg", packSize:"1x10 tablets", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"Al-Barakah Pharma Traders", qty:70, exp:"2026-01-12", mfg:"2024-01-12", unitPrice:87, packages:[], status:"Verified", updatedAt:"2026-10-10 17:20"},
  {pharmacy:"Prime Health Pharmacy", medicine:"Augmentin 625mg", generic:"Amoxicillin/Clavulanate", strength:"625mg", packSize:"1x6 tablets", batch:"BT-2024-0932", manufacturer:"GSK Pakistan", vendor:"Al-Barakah Pharma Traders", qty:15, exp:"2025-11-05", mfg:"2023-11-05", unitPrice:345, packages:[], status:"Verified", updatedAt:"2026-10-09 14:00"},
  {pharmacy:"Al-Shifa Pharmacy", medicine:"Panadol 500mg", generic:"Paracetamol", strength:"500mg", packSize:"1x10 tablets", batch:"BT-2024-1187", manufacturer:"GSK Pakistan", vendor:"MediSupply Distributors", qty:30, exp:"2026-01-12", mfg:"2024-01-12", unitPrice:80, packages:[], status:"Verified", updatedAt:"2026-09-20 10:00"},
];

/* Manufacturer → authorized vendors map */
let authorizedVendors = {
  "GSK Pakistan": ["MediSupply Distributors", "HealthLine Traders"],
  "Abbott Pakistan": ["MediSupply Distributors"],
  "Getz Pharma": ["HealthLine Traders"],
  "Highnoon Laboratories": ["MediSupply Distributors"],
  "Pfizer Pakistan": ["Al-Barakah Pharma Traders"],
};

let ledger = [
  {tx:"TX-88401", ref:"Panadol 500mg / BT-2024-1187", prev:"0000000000000000", curr:"a3f5c9e1d2b47c81", time:"2024-01-12 09:00", actor:"GSK Pakistan (Manufacturer)", status:"Confirmed"},
  {tx:"TX-88402", ref:"Panadol 500mg / BT-2024-1187", prev:"a3f5c9e1d2b47c81", curr:"7e2d1a9f4c6b0e33", time:"2024-01-14 15:30", actor:"MediSupply Distributors (Vendor)", status:"Confirmed"},
  {tx:"TX-88403", ref:"Panadol 500mg / BT-2024-1187", prev:"7e2d1a9f4c6b0e33", curr:"1c4b8d6f2a9e7503", time:"2024-01-16 10:15", actor:"MediCare Pharmacy", status:"Confirmed"},
  {tx:"TX-88404", ref:"Panadol 500mg / BT-2024-1187", prev:"1c4b8d6f2a9e7503", curr:"5f9a3c7e1b4d2680", time:"2024-01-18 12:40", actor:"Patient Verification (A. Iqbal)", status:"Confirmed"},
  {tx:"TX-88405", ref:"Brufen 400mg / BT-2024-1450", prev:"0000000000000000", curr:"9d3e7f1b5c2a4860", time:"2024-03-20 08:20", actor:"Abbott Pakistan (Manufacturer)", status:"Confirmed"},
  {tx:"TX-88406", ref:"Brufen 400mg / BT-2024-1450", prev:"9d3e7f1b5c2a4860", curr:"4a8c2e6d9f1b3752", time:"2024-03-23 13:10", actor:"MediSupply Distributors (Vendor)", status:"Confirmed"},
  {tx:"TX-88407", ref:"Brufen 400mg / BT-2024-1450", prev:"4a8c2e6d9f1b3752", curr:"e6f2a4c8b1d3907e", time:"2024-03-25 09:45", actor:"Cityline Pharmacy", status:"Flagged"},
  {tx:"TX-88408", ref:"Risek 20mg / BT-2024-0654", prev:"0000000000000000", curr:"2b6d8f4a1e9c5073", time:"2024-02-01 10:00", actor:"Getz Pharma (Manufacturer)", status:"Confirmed"},
  {tx:"TX-88409", ref:"Risek 20mg / BT-2024-0654", prev:"2b6d8f4a1e9c5073", curr:"c1e9a3f7b5d20648", time:"2024-02-10 11:00", actor:"System (Recall issued)", status:"Recalled"},
];

let counterfeitReports = [
  {id:"CF-2026-00421", medicine:"Brufen 400mg", batch:"BT-2024-1450", reportedBy:"Cityline Pharmacy", location:"Faisalabad", date:"2024-03-26", reason:"Batch information mismatch", status:"Under Investigation"},
  {id:"CF-2026-00398", medicine:"Risek 20mg", batch:"BT-2024-0654", reportedBy:"System (auto-flag)", location:"Karachi", date:"2024-02-11", reason:"Manufacturer-issued recall", status:"Confirmed Counterfeit"},
  {id:"CF-2026-00355", medicine:"Ponstan 500mg", batch:"BT-2023-0765", reportedBy:"Al-Shifa Pharmacy", location:"Multan", date:"2024-01-02", reason:"Duplicate QR scan detected", status:"False Alert"},
];

let alerts = [
  {type:"Suspicious batch", detail:"Brufen 400mg BT-2024-1450 flagged by Cityline Pharmacy", level:"amber"},
  {type:"Expiring batch", detail:"Calpol Syrup BT-2023-0871 expires within 11 months", level:"slate"},
  {type:"Unusual QR scans", detail:"Code MED-2024-0299 scanned from 2 cities within 1 hour", level:"red"},
  {type:"Supply-chain mismatch", detail:"Shipment SHP-7004 location does not match vendor route", level:"amber"},
];

let notifications = [
  {title:"Medicine verified", body:"Panadol 500mg (BT-2024-1187) verified successfully.", time:"2 hrs ago", type:"success"},
  {title:"Prescription added", body:"Dr. Sara Khalid added a new prescription for Augmentin 625mg.", time:"1 day ago", type:"info"},
  {title:"Medication reminder", body:"Time to take Panadol 500mg — 1 tablet.", time:"Today, 2:00 PM", type:"info"},
  {title:"Medicine recall", body:"Risek 20mg (BT-2024-0654) has been recalled. Stop use immediately.", time:"3 days ago", type:"danger"},
];

let auditLogs = [
  {user:"Ahmad Raza (Admin)", action:"Approved pharmacy", target:"Cityline Pharmacy", time:"2024-03-01 10:20"},
  {user:"System", action:"Issued recall", target:"Risek 20mg / BT-2024-0654", time:"2024-02-10 11:00"},
  {user:"Ahmad Raza (Admin)", action:"Suspended pharmacy", target:"Al-Shifa Pharmacy", time:"2024-01-28 16:40"},
  {user:"Ahmad Raza (Admin)", action:"Resolved counterfeit case", target:"CF-2026-00355", time:"2024-01-05 09:15"},
];

let sales = [
  {id:"SALE-9001", medicine:"Augmentin 625mg", batch:"BT-2024-0932", packageId:"—", patient:"A. Iqbal (PT-10432)", patientId:"PT-10432", pharmacy:"MediCare Pharmacy", qty:1, unitPrice:340, total:340, price:"Rs. 340", date:"2023-12-02", time:"11:20", manufacturer:"GSK Pakistan", exp:"2025-11-05", category:"Antibiotic"},
  {id:"SALE-9002", medicine:"Panadol 500mg", batch:"BT-2024-1187", packageId:"PKG-2024-1187-0101", patient:"A. Iqbal (PT-10432)", patientId:"PT-10432", pharmacy:"MediCare Pharmacy", qty:2, unitPrice:85, total:170, price:"Rs. 170", date:"2024-01-16", time:"14:05", manufacturer:"GSK Pakistan", exp:"2026-01-12", category:"Analgesic"},
  // Aggregated-style POS samples (anonymized — used for demand analytics demos)
  {id:"SALE-9010", medicine:"Panadol 500mg", batch:"BT-2024-1187", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"MediCare Pharmacy", qty:24, unitPrice:85, total:2040, price:"Rs. 2040", date:"2026-09-02", time:"10:12", manufacturer:"GSK Pakistan", category:"Analgesic"},
  {id:"SALE-9011", medicine:"Panadol 500mg", batch:"BT-2024-1187", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Cityline Pharmacy", qty:18, unitPrice:85, total:1530, price:"Rs. 1530", date:"2026-09-03", time:"11:40", manufacturer:"GSK Pakistan", category:"Analgesic"},
  {id:"SALE-9012", medicine:"Panadol 500mg", batch:"BT-2024-1187", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Al-Shifa Pharmacy", qty:12, unitPrice:85, total:1020, price:"Rs. 1020", date:"2026-09-04", time:"09:20", manufacturer:"GSK Pakistan", category:"Analgesic"},
  {id:"SALE-9013", medicine:"Augmentin 625mg", batch:"BT-2024-0932", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Rahman Pharmacy", qty:8, unitPrice:340, total:2720, price:"Rs. 2720", date:"2026-09-05", time:"15:10", manufacturer:"GSK Pakistan", category:"Antibiotic"},
  {id:"SALE-9014", medicine:"Arinac Forte", batch:"BT-2024-1102", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"MediCare Pharmacy", qty:15, unitPrice:120, total:1800, price:"Rs. 1800", date:"2026-09-06", time:"12:00", manufacturer:"Highnoon Laboratories", category:"Cold & Flu"},
  {id:"SALE-9015", medicine:"Brufen 400mg", batch:"BT-2024-1450", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Cityline Pharmacy", qty:10, unitPrice:95, total:950, price:"Rs. 950", date:"2026-09-07", time:"16:30", manufacturer:"Abbott Pakistan", category:"NSAID"},
  {id:"SALE-9016", medicine:"Calpol Syrup", batch:"BT-2023-0871", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Prime Health Pharmacy", qty:6, unitPrice:150, total:900, price:"Rs. 900", date:"2026-09-08", time:"13:15", manufacturer:"GSK Pakistan", category:"Analgesic"},
  {id:"SALE-9017", medicine:"Panadol 500mg", batch:"BT-2024-1187", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Wellness Point", qty:9, unitPrice:85, total:765, price:"Rs. 765", date:"2026-09-09", time:"10:45", manufacturer:"GSK Pakistan", category:"Analgesic"},
  {id:"SALE-9018", medicine:"Risek 20mg", batch:"BT-2024-0654", packageId:"—", patient:"Walk-in", patientId:null, pharmacy:"Al-Shifa Pharmacy", qty:4, unitPrice:110, total:440, price:"Rs. 440", date:"2026-08-20", time:"11:00", manufacturer:"Getz Pharma", category:"Antacid"},
];

/* Regional demand baselines (aggregated pharmacy POS — no patient PII) */
const DEMAND_REGIONAL = {
  "Panadol 500mg": {Lahore:12400, Multan:8100, Bahawalpur:4300, Faisalabad:9200, Karachi:15600, Islamabad:6100, Peshawar:5400},
  "Augmentin 625mg": {Lahore:4200, Multan:2100, Bahawalpur:980, Faisalabad:3100, Karachi:5600, Islamabad:2400, Peshawar:1800},
  "Brufen 400mg": {Lahore:6800, Multan:3200, Bahawalpur:1500, Faisalabad:4100, Karachi:7200, Islamabad:2800, Peshawar:2100},
  "Arinac Forte": {Lahore:3900, Multan:1700, Bahawalpur:800, Faisalabad:2200, Karachi:4100, Islamabad:1600, Peshawar:1200},
  "Calpol Syrup": {Lahore:2800, Multan:1900, Bahawalpur:1100, Faisalabad:1600, Karachi:3400, Islamabad:1500, Peshawar:1300},
  "Risek 20mg": {Lahore:2100, Multan:900, Bahawalpur:400, Faisalabad:1200, Karachi:2800, Islamabad:1100, Peshawar:700},
};
const DEMAND_MONTHLY = {
  labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  "Panadol 500mg":[7200,7800,8100,8200,9100,9800,10500,11200,12400,11800,12100,13000],
  "Augmentin 625mg":[2800,2900,3000,3100,3400,3600,3900,4000,4200,4100,4300,4500],
  "Brufen 400mg":[4000,4200,4400,4500,4800,5200,5500,6000,6800,6500,6700,7000],
  "Arinac Forte":[1500,1600,1700,1800,2100,2500,2800,3200,3900,3600,3400,4100],
  "Calpol Syrup":[2000,2100,2200,2200,2400,2500,2600,2700,2800,2900,3000,3100],
  "Risek 20mg":[1400,1500,1550,1600,1700,1800,1900,2000,2100,2050,2200,2300],
};
const TOP_SELLING_DEMO = [
  {name:'Paracetamol 500mg', alias:'Panadol 500mg', units:12400},
  {name:'Amoxicillin 500mg', alias:'Augmentin 625mg', units:5600},
  {name:'Ibuprofen 400mg', alias:'Brufen 400mg', units:6800},
  {name:'Cetirizine 10mg', alias:'Arinac Forte', units:3900},
  {name:'ORS', alias:'Calpol Syrup', units:2800},
];

const supplyChainMap = {
  "BT-2024-1187":[
    {stage:"Manufacturer", party:"GSK Pakistan", loc:"Karachi", time:"2024-01-12 09:00", qty:5000, tx:"TX-88401", status:"done"},
    {stage:"Vendor", party:"MediSupply Distributors", loc:"Lahore", time:"2024-01-14 15:30", qty:5000, tx:"TX-88402", status:"done"},
    {stage:"Pharmacy", party:"MediCare Pharmacy", loc:"Lahore", time:"2024-01-16 10:15", qty:1200, tx:"TX-88403", status:"done"},
    {stage:"Patient", party:"Verified by A. Iqbal", loc:"Lahore", time:"2024-01-18 12:40", qty:1, tx:"TX-88404", status:"done"},
  ],
  "BT-2024-1450":[
    {stage:"Manufacturer", party:"Abbott Pakistan", loc:"Karachi", time:"2024-03-20 08:20", qty:3000, tx:"TX-88405", status:"done"},
    {stage:"Vendor", party:"MediSupply Distributors", loc:"Lahore", time:"2024-03-23 13:10", qty:3000, tx:"TX-88406", status:"done"},
    {stage:"Pharmacy", party:"Cityline Pharmacy", loc:"Faisalabad", time:"2024-03-25 09:45", qty:800, tx:"TX-88407", status:"done"},
    {stage:"Patient", party:"Flagged before sale", loc:"—", time:"Pending", qty:0, tx:"—", status:""},
  ],
  "BT-2024-0654":[
    {stage:"Manufacturer", party:"Getz Pharma", loc:"Karachi", time:"2024-02-01 10:00", qty:2000, tx:"TX-88408", status:"done"},
    {stage:"Vendor", party:"HealthLine Traders", loc:"Karachi", time:"2024-02-03 16:20", qty:2000, tx:"—", status:"done"},
    {stage:"Pharmacy", party:"Recall issued — withdrawn", loc:"—", time:"2024-02-10 11:00", qty:0, tx:"TX-88409", status:""},
    {stage:"Patient", party:"Not dispensed", loc:"—", time:"—", qty:0, tx:"—", status:""},
  ],
};

let verificationHistory = {
  "MED-2024-0113":[ {time:"2024-01-18 12:40", location:"MediCare Pharmacy, Lahore", result:"Verified"}, {time:"2024-01-17 09:05", location:"Customer app scan", result:"Verified"} ],
  "MED-2024-0299":[ {time:"2024-03-26 14:22", location:"Cityline Pharmacy, Faisalabad", result:"Suspicious"}, {time:"2024-03-25 09:50", location:"Cityline Pharmacy, Faisalabad", result:"Verified"} ],
};

let seq = {shp:7006, cf:426, ver:982342, tx:88410};

