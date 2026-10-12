/* ============================================================
   SIDEBAR DEFINITIONS
   ============================================================ */
const SIDEBARS = {
  admin:[ ['dashboard','Dashboard','grid'], ['users','Users','users'], ['manufacturers','Manufacturers','factory'], ['vendors','Vendors','truck'],
    ['pharmacies','Pharmacies','building'], ['doctors','Doctors','stethoscope'], ['patients','Patients','heart'], ['medicines','Medicines','capsule'],
    ['supplychain','Supply Chain','route'], ['verification','Verification Center','search_shield'], ['counterfeit','Counterfeit Reports','flag'],
    ['ledger','Digital Ledger','cube'], ['reports','Reports','clipboard'], ['analytics','Analytics','bars'], ['subscriptions','Subscriptions','clipboard'], ['auditlogs','Audit Logs','history'], ['settings','Settings','gear'] ],
  manufacturer:[ ['dashboard','Dashboard','grid'], ['products','Products','capsule'], ['batches','Medicine Batches','box'], ['createmedicine','Create Medicine','plus'],
    ['qrcodes','QR Codes','qrcode'], ['shipments','Shipments','truck'], ['vendors','Vendors','building'], ['demand','Demand Insights','bars'],
    ['verification','Verification Activity','search_shield'],
    ['recall','Recall Management','flag'], ['reports','Reports','clipboard'], ['analytics','Analytics','bars'], ['settings','Settings','gear'] ],
  vendor:[ ['dashboard','Dashboard','grid'], ['incoming','Incoming Shipments','box'], ['inventory','Inventory','capsule'], ['orders','Orders','clipboard'],
    ['pharmacies','Pharmacies','building'], ['outgoing','Outgoing Shipments','truck'], ['demand','Regional Demand','bars'],
    ['supplychain','Supply Chain','route'], ['verification','Verification','search_shield'],
    ['reports','Reports','clipboard'], ['analytics','Analytics','bars'], ['settings','Settings','gear'] ],
  pharmacy:[ ['dashboard','Dashboard','grid'], ['inventory','Inventory','capsule'], ['medicines','Medicines','box'], ['incoming','Incoming Shipments','truck'],
    ['sales','Sales','clipboard'], ['qrverify','QR Verification','qrcode'], ['counterfeit','Counterfeit Reports','flag'], ['suppliers','Suppliers','building'],
    ['patients','Patients','heart'], ['employees','Employees','users'], ['reports','Reports','clipboard'], ['analytics','Analytics','bars'], ['subscription','Subscription','cube'], ['settings','Settings','gear'] ],
  doctor:[ ['dashboard','Dashboard','grid'], ['mypatients','My Patients','heart'], ['prescriptions','Prescriptions','clipboard'], ['meddb','Medicine Database','capsule'],
    ['medverify','Medicine Verification','search_shield'], ['medhistory','Medication History','history'], ['alerts','Alerts','bell'], ['reports','Reports','clipboard'], ['settings','Settings','gear'] ],
};
const PORTAL_META = {
  admin:{label:'Administrator', sub:'ADMIN PORTAL', avatar:'AR', name:'Ahmad Raza', role:'System Admin'},
  manufacturer:{label:'Manufacturer', sub:'MANUFACTURER PORTAL', avatar:'GP', name:'GSK Pakistan', role:'Manufacturer Ops'},
  vendor:{label:'Vendor / Distributor', sub:'VENDOR PORTAL', avatar:'MS', name:'MediSupply Distributors', role:'Distribution Team'},
  pharmacy:{label:'Pharmacy', sub:'PHARMACY PORTAL', avatar:'MC', name:'MediCare Pharmacy', role:'Pharmacy Staff'},
  doctor:{label:'Doctor', sub:'DOCTOR PORTAL', avatar:'SK', name:'Dr. Sara Khalid', role:'Internal Medicine'},
};


/* Page registry for the desktop portals (filled by each portal folder) */
const PAGES = { admin:{}, manufacturer:{}, vendor:{}, pharmacy:{}, doctor:{} };
const AFTER = { admin:{}, manufacturer:{}, vendor:{}, pharmacy:{}, doctor:{} }; // post-render hooks (charts etc.)
