/* ============================================================
   REPORTS ENGINE (shared across portals)
   ============================================================ */
const REPORT_LIBRARY = {
  'verification-summary': {
    title:'Verification Summary Report',
    portal:'Network',
    period:'Last 30 days',
    summary:['Total scans: 898','Verified: 842 (93.8%)','Suspicious: 37 (4.1%)','Not found: 19 (2.1%)'],
    rows:[['Lahore','312','294','12','6'],['Karachi','248','231','11','6'],['Islamabad','142','136','4','2'],['Faisalabad','98','91','5','2'],['Multan','98','90','5','3']],
    cols:['City','Scans','Verified','Suspicious','Not found']
  },
  'counterfeit-log': {
    title:'Counterfeit Investigation Log',
    portal:'Admin',
    period:'All open cases',
    summary:['Open cases: 1','Confirmed counterfeit: 1','False alerts: 1'],
    rows: counterfeitReports.map(c=>[c.id,c.medicine,c.batch,c.reportedBy,c.location,c.status]),
    cols:['Case ID','Medicine','Batch','Reported by','Location','Status']
  },
  'batch-production': {
    title:'Batch Production Report',
    portal:'Manufacturer',
    period:'All registered batches',
    summary:['Active production lines tracked','QR packages generated per batch'],
    rows: null, // filled dynamically
    cols:['Medicine','Batch','Qty','Mfg','Expiry','Status']
  },
  'shipment-dispatch': {
    title:'Shipment Dispatch Log',
    portal:'Manufacturer / Vendor',
    period:'All shipments',
    rows: null,
    cols:['Shipment','From','To','Product','Qty','Status','Date']
  },
  'inventory-snapshot': {
    title:'Inventory Snapshot',
    portal:'Pharmacy / Vendor',
    period:'Current stock',
    rows: null,
    cols:['Medicine','Batch','Qty','Expiry','Status']
  },
  'sales-summary': {
    title:'Sales Summary Report',
    portal:'Pharmacy',
    period:'POS transactions',
    rows: null,
    cols:['Sale ID','Medicine','Qty','Total','Patient','Date']
  },
  'prescription-log': {
    title:'Prescription Log',
    portal:'Doctor',
    period:'Issued prescriptions',
    rows: null,
    cols:['Patient','Medicine','Diagnosis','Date']
  },
  'partner-compliance': {
    title:'Partner Compliance Report',
    portal:'Admin',
    period:'Current status',
    rows: null,
    cols:['Partner','Type','City','Status']
  },
  'regional-activity': {
    title:'Regional Activity Report',
    portal:'Network',
    period:'Last 30 days',
    summary:['Top city by volume: Lahore','Network coverage: 6 major cities'],
    rows:[['Lahore','3,200'],['Karachi','2,870'],['Islamabad','1,540'],['Faisalabad','1,120'],['Multan','980'],['Peshawar','860']],
    cols:['City','Units dispensed']
  },
  'demand-insights': {
    title:'Demand Insights Report',
    portal:'Manufacturer / Vendor',
    period:'Aggregated POS demand',
    rows:[['Panadol 500mg','12,400'],['Brufen 400mg','6,800'],['Augmentin 625mg','5,600'],['Arinac Forte','3,900'],['Calpol Syrup','2,800']],
    cols:['Medicine','Units demanded']
  }
};
function openReport(key, opts){
  opts = opts||{};
  // Patient-specific live reports
  if(key==='patient-medicine-history'){
    const p = currentPatient() || patients[0];
    opts = {
      title:'Personal Medicine History',
      portal:'Patient App · '+(p?p.masked:'Patient'),
      period:'All records',
      summary:[ (p?p.entries.length:0)+' medicines', (p?p.city:'—') ],
      cols:['Medicine','Batch','Pharmacy','Date','Context','Status'],
      rows:(p?p.entries:[]).map(e=>[e.medicine,e.batch,e.pharmacy,e.date,e.context||'—',e.usage||'—'])
    };
  }
  if(key==='patient-prescriptions'){
    const p = currentPatient() || patients[0];
    const myRx = prescriptions.filter(r=>r.patientId===(p&&p.id));
    opts = {
      title:'Prescription Summary',
      portal:'Patient App · '+(p?p.masked:'Patient'),
      period:'Active & past prescriptions',
      summary:[ myRx.length+' prescriptions' ],
      cols:['Medicine','Doctor','Diagnosis','Dosage','Duration','Date'],
      rows: myRx.map(r=>[r.medicine,r.doctor,r.diagnosis||'—',r.dosage||'—',r.duration||'—',r.date])
    };
  }
  if(key==='patient-verifications'){
    const scans = (typeof verificationScans!=='undefined'?verificationScans:[]).slice(0,12);
    opts = {
      title:'My Verification Log',
      portal:'Patient App',
      period:'Recent scans',
      summary:[ scans.length+' scans logged' ],
      cols:['Package / Code','Time','Location','Result'],
      rows: scans.length ? scans.map(s=>[s.packageId||s.code||'—',s.time||'—',s.location||'—',s.result||'Recorded'])
        : [['PKG-A8F92K','Today','Patient app','Verified'],['PKG-SOLD91','Yesterday','Patient app','Suspicious'],['PKG-FAKE123','Last week','Patient app','Not Found']]
    };
  }
  if(key==='patient-safety'){
    opts = {
      title:'Safety & Recall Alerts',
      portal:'Patient App',
      period:'Network alerts relevant to you',
      summary:['1 active alert'],
      cols:['Alert','Medicine / Batch','Severity','Date','Action'],
      rows:[
        ['Recall notice','Risek 20mg / BT-2024-0654','High','2026-09-12','Do not use — return to pharmacy'],
        ['Expiry reminder','Augmentin 625mg','Medium','2026-09-01','Check pack expiry'],
        ['Verification tip','Any QR pack','Info','2026-08-20','Scan before first dose']
      ]
    };
  }

  const def = REPORT_LIBRARY[key] || {
    title: opts.title || 'Generated Report',
    portal: opts.portal || 'PharmaChain',
    period: opts.period || 'Last 30 days',
    summary: opts.summary || ['Demo report generated successfully'],
    cols: opts.cols || ['Field','Value'],
    rows: opts.rows || [['Status','OK'],['Records','42']]
  };
  let rows = opts.rows || def.rows;
  let cols = opts.cols || def.cols;
  let title = opts.title || def.title;
  let portalLabel = opts.portal || def.portal;
  let period = opts.period || def.period;
  let summary = opts.summary || def.summary || [];

  if(key==='batch-production'){
    const mine = medicines.filter(m=>!opts.mfg || m.manufacturer===opts.mfg);
    rows = mine.map(m=>[m.name,m.batch,m.qty,m.mfg,m.exp,m.status]);
    cols = def.cols;
  }
  if(key==='shipment-dispatch'){
    const list = opts.filter ? shipments.filter(opts.filter) : shipments;
    rows = list.map(s=>[s.id,s.from,s.to,s.product||s.medicine,s.qty,s.status,s.date||s.dispatchDate||'—']);
    cols = def.cols;
  }
  if(key==='inventory-snapshot'){
    const list = opts.stock || pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy);
    rows = list.map(s=>[s.medicine,s.batch,s.qty,s.exp,s.status||'In Stock']);
    cols = def.cols;
  }
  if(key==='sales-summary'){
    const list = opts.sales || sales.filter(s=>s.pharmacy===CTX.pharmacy);
    rows = list.map(s=>[s.id,s.medicine,s.qty,s.price||('Rs. '+s.total),s.patient,s.date]);
    cols = def.cols;
  }
  if(key==='prescription-log'){
    const list = opts.rx || prescriptions.filter(r=>r.doctor===CTX.doctor);
    rows = list.map(r=>[r.patient,r.medicine,r.diagnosis,r.date]);
    cols = def.cols;
  }
  if(key==='partner-compliance'){
    rows = [
      ...manufacturers.map(m=>[m.name,'Manufacturer',m.city||'—',m.status]),
      ...vendors.map(v=>[v.name,'Vendor',v.city,v.status]),
      ...pharmacies.map(p=>[p.name,'Pharmacy',p.city,p.status]),
    ];
    cols = def.cols;
  }
  if(!rows || !rows.length){
    rows = [['No records available','—','—','—']];
  }

  const existing = document.getElementById('report-viewer-overlay');
  if(existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'report-viewer-overlay';
  overlay.className = 'receipt-overlay';
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
  const kpiHtml = summary.length ? `<div class="report-kpi-row">${summary.map(s=>{
    const parts = String(s).split(':');
    if(parts.length===2) return `<div class="report-kpi"><div class="rk">${parts[0]}</div><div class="rv">${parts[1]}</div></div>`;
    return `<div class="report-kpi"><div class="rv" style="font-size:13px;">${s}</div></div>`;
  }).join('')}</div>` : '';

  overlay.innerHTML = `
    <div class="receipt-modal" style="max-width:760px;width:100%;" role="dialog" aria-modal="true">
      <div class="receipt-modal-actions">
        <span style="margin-right:auto;font-size:12px;font-weight:700;color:var(--muted);">Report preview</span>
        <button class="btn btn-outline btn-sm" onclick="toast('CSV exported (demo)')">Export CSV</button>
        <button class="btn btn-outline btn-sm" onclick="window.print()">Print</button>
        <button class="btn btn-dark btn-sm" onclick="document.getElementById('report-viewer-overlay').remove()">Close</button>
      </div>
      <div class="report-doc" style="padding:22px 26px 28px;">
        <div class="report-doc-header">
          <div class="brand-line">
            <div class="brand-mark">PC</div>
            <div>
              <div style="font-weight:800;font-size:14px;color:var(--navy);">PharmaChain</div>
              <div style="font-size:11px;color:var(--muted);">Official demo report · FYP prototype</div>
            </div>
          </div>
          <h2 style="font-size:20px;margin:0 0 6px;color:var(--navy);">${title}</h2>
          <div style="font-size:12.5px;color:var(--muted);">${portalLabel||''} · ${period||''} · Generated ${new Date().toLocaleString()}</div>
        </div>
        ${kpiHtml}
        <div class="table-wrap"><table>
          <thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(r=>`<tr>${(Array.isArray(r)?r:[r]).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table></div>
        <div class="report-footer-note">
          This is a demonstration report generated from live prototype data. It is not an official regulatory filing.
          PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  toast(title+' opened');
}
function reportToolbar(exportLabel){
  return `<div class="toolbar">
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <select style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12.5px;background:#fff;">
        <option>Last 7 days</option><option selected>Last 30 days</option><option>Last 90 days</option><option>This year</option>
      </select>
      <select style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:12.5px;background:#fff;">
        <option>All statuses</option><option>Verified only</option><option>Suspicious</option><option>Recalled</option>
      </select>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-outline btn-sm" onclick="toast('CSV exported successfully')">${ICONS.clipboard} Export CSV</button>
      <button class="btn btn-dark btn-sm" onclick="toast('${exportLabel||'PDF'} ready')">${ICONS.clipboard} ${exportLabel||'Download PDF'}</button>
    </div>
  </div>`;
}
function reportSummaryCards(items){
  return `<div class="stat-grid" style="margin-bottom:18px;">${items.map(i=>statCard(i)).join('')}</div>`;
}
function reportGenBtn(key, label){
  return `<button class="btn btn-primary btn-sm" onclick="openReport('${key}')">${label||'View report'}</button>`;
}

PAGES.admin.reports = function(){
  return pageHead('Network Reports','Generate operational, compliance and safety reports for the entire ecosystem')
    + reportToolbar('Network Report PDF')
    + reportSummaryCards([
      {label:'Total verifications', value:'898', delta:'+6.2% vs prior period', icon:'check', bg:'var(--green-light)', color:'#067A55'},
      {label:'Counterfeit cases', value:counterfeitReports.length, delta:counterfeitReports.filter(c=>c.status==='Under Investigation').length+' open', icon:'flag', bg:'var(--red-light)', color:'#B91C1C'},
      {label:'Active pharmacies', value:pharmacies.filter(p=>p.status==='Verified').length, delta:'', icon:'building', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Ledger transactions', value:ledger.length, delta:'All chained', icon:'cube', bg:'var(--indigo-light)', color:'var(--indigo)'},
    ])
    + card('Available report templates','Click View report to open a full demo report', `
      <div class="table-wrap"><table><thead><tr><th>Report</th><th>Description</th><th>Frequency</th><th>Action</th></tr></thead><tbody>
        <tr><td><b>Verification Summary</b></td><td>Verified vs suspicious vs not-found outcomes network-wide</td><td>Daily / Weekly</td><td>${reportGenBtn('verification-summary')}</td></tr>
        <tr><td><b>Counterfeit Investigation Log</b></td><td>All reported cases with status, location and resolution</td><td>On demand</td><td>${reportGenBtn('counterfeit-log')}</td></tr>
        <tr><td><b>Partner Compliance Report</b></td><td>Manufacturer, vendor and pharmacy approval & suspension status</td><td>Monthly</td><td>${reportGenBtn('partner-compliance')}</td></tr>
        <tr><td><b>Supply-Chain Integrity</b></td><td>Ledger health, broken chains and flagged shipments</td><td>Weekly</td><td>${reportGenBtn('shipment-dispatch')}</td></tr>
        <tr><td><b>Regional Activity Report</b></td><td>Verification volume and sales by city</td><td>Monthly</td><td>${reportGenBtn('regional-activity')}</td></tr>
        <tr><td><b>Demand Insights</b></td><td>Aggregated pharmacy POS demand by medicine</td><td>Monthly</td><td>${reportGenBtn('demand-insights')}</td></tr>
      </tbody></table></div>`)
    + card('Recent generated reports','', dataTable(['Report','Generated by','Date','Format','Action'],[
      ['Verification Summary','Ahmad Raza','2026-09-28','PDF',`<button class="btn btn-outline btn-sm" onclick="openReport('verification-summary')">Open</button>`],
      ['Counterfeit Investigation Log','System','2026-09-20','CSV',`<button class="btn btn-outline btn-sm" onclick="openReport('counterfeit-log')">Open</button>`],
      ['Partner Compliance','Ahmad Raza','2026-09-05','PDF',`<button class="btn btn-outline btn-sm" onclick="openReport('partner-compliance')">Open</button>`],
    ]));
};

PAGES.manufacturer.reports = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  return pageHead('Production & Quality Reports','Batch performance, shipment and verification reports for '+CTX.manufacturer)
    + reportToolbar('Manufacturer Report PDF')
    + reportSummaryCards([
      {label:'Batches produced', value:mine.length, delta:'', icon:'box', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Units manufactured', value:mine.reduce((s,m)=>s+Number(m.qty||0),0).toLocaleString(), delta:'', icon:'factory', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Verification rate', value:'96.4%', delta:'+1.1%', icon:'check', bg:'var(--green-light)', color:'#067A55'},
      {label:'Active recalls', value:mine.filter(m=>m.status==='Recalled').length, delta:'', icon:'flag', bg:'var(--red-light)', color:'#B91C1C'},
    ])
    + card('Report templates','Click View report to open full content', `
      <div class="table-wrap"><table><thead><tr><th>Report</th><th>Description</th><th>Action</th></tr></thead><tbody>
        <tr><td><b>Batch Production Report</b></td><td>All batches with quantity, dates, expiry and status</td><td><button class="btn btn-primary btn-sm" onclick="openReport('batch-production',{mfg:CTX.manufacturer})">View report</button></td></tr>
        <tr><td><b>Shipment Dispatch Log</b></td><td>Outbound shipments to vendors with confirmation status</td><td><button class="btn btn-primary btn-sm" onclick="openReport('shipment-dispatch',{filter:s=>s.from===CTX.manufacturer})">View report</button></td></tr>
        <tr><td><b>Demand Insights</b></td><td>Aggregated pharmacy demand for your products</td><td>${reportGenBtn('demand-insights')}</td></tr>
        <tr><td><b>QR Verification Activity</b></td><td>How often your products are scanned</td><td>${reportGenBtn('verification-summary')}</td></tr>
        <tr><td><b>Regional Activity</b></td><td>Units by city</td><td>${reportGenBtn('regional-activity')}</td></tr>
      </tbody></table></div>`)
    + card('Batch status overview','', dataTable(['Medicine','Batch','Qty','Status','Expiry','Actions'], mine.map(m=>[m.name,`<span class="mono">${m.batch}</span>`,m.qty,statusBadge(m.status),`<span class="mono">${m.exp}</span>`,crudActions('medicine',m.batch)])));
};

PAGES.vendor.reports = function(){
  const incoming = shipments.filter(s=>s.to===CTX.vendor);
  const outgoing = shipments.filter(s=>s.from===CTX.vendor);
  return pageHead('Distribution Reports','Inventory, delivery and order performance for '+CTX.vendor)
    + reportToolbar('Vendor Report PDF')
    + reportSummaryCards([
      {label:'Incoming shipments', value:incoming.length, delta:'', icon:'box', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Outgoing shipments', value:outgoing.length, delta:'', icon:'truck', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Stock SKUs', value:medicines.filter(m=>m.vendor===CTX.vendor).length, delta:'', icon:'capsule', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Pending confirmations', value:incoming.filter(s=>s.status!=='Confirmed').length, delta:'', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
    ])
    + card('Report templates','Click View report to open full content', `
      <div class="table-wrap"><table><thead><tr><th>Report</th><th>Description</th><th>Action</th></tr></thead><tbody>
        <tr><td><b>Inbound Receipt Report</b></td><td>Shipments received from manufacturers</td><td><button class="btn btn-primary btn-sm" onclick="openReport('shipment-dispatch',{filter:s=>s.to===CTX.vendor})">View report</button></td></tr>
        <tr><td><b>Outbound Delivery Report</b></td><td>Shipments dispatched to pharmacies</td><td><button class="btn btn-primary btn-sm" onclick="openReport('shipment-dispatch',{filter:s=>s.from===CTX.vendor})">View report</button></td></tr>
        <tr><td><b>Inventory Snapshot</b></td><td>Current stock levels and expiry risk</td><td><button class="btn btn-primary btn-sm" onclick="openReport('inventory-snapshot',{stock:medicines.filter(m=>m.vendor===CTX.vendor).map(m=>({medicine:m.name,batch:m.batch,qty:m.qty,exp:m.exp,status:m.status}))})">View report</button></td></tr>
        <tr><td><b>Regional Demand</b></td><td>Aggregated demand by city</td><td>${reportGenBtn('demand-insights')}</td></tr>
      </tbody></table></div>`)
    + card('Recent shipment activity','', dataTable(['ID','Medicine','Direction','Party','Qty','Status','Actions'], [
      ...incoming.slice(0,4).map(s=>[`<span class="mono">${s.id}</span>`,s.medicine,'Inbound',s.from,s.qty,statusBadge(s.status),crudActions('shipment',s.id)]),
      ...outgoing.slice(0,4).map(s=>[`<span class="mono">${s.id}</span>`,s.medicine,'Outbound',s.to,s.qty,statusBadge(s.status),crudActions('shipment',s.id)]),
    ]));
};

PAGES.pharmacy.reports = function(){
  if(!pharmacyCanAccess('basic_reports') && !pharmacyCanAccess('advanced_reports')) return premiumLockCard('Reports');
  if(currentEmployee && !empHasPerm('viewReports')) return premiumLockCard('Business reports') + '<p class="muted" style="padding:0 4px;">Your employee account does not include report access.</p>';
  const mine = pharmacyStock.filter(m=>m.pharmacy===CTX.pharmacy);
  const mySales = sales.filter(s=>s.pharmacy===CTX.pharmacy);
  return pageHead('Pharmacy Reports','Sales, inventory, verification and patient-facing reports for '+CTX.pharmacy)
    + reportToolbar('Pharmacy Report PDF')
    + reportSummaryCards([
      {label:'Sales recorded', value:mySales.length, delta:'', icon:'clipboard', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Inventory items', value:mine.length, delta:'', icon:'capsule', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Verified medicines', value:mine.filter(m=>m.status==='Verified').length, delta:'', icon:'check', bg:'var(--green-light)', color:'#067A55'},
      {label:'Suspicious / recalled', value:mine.filter(m=>m.status!=='Verified').length, delta:'', icon:'warn', bg:'var(--red-light)', color:'#B91C1C'},
    ])
    + card('Report templates','Click View report to open full content', `
      <div class="table-wrap"><table><thead><tr><th>Report</th><th>Description</th><th>Action</th></tr></thead><tbody>
        <tr><td><b>Daily Sales Report</b></td><td>Medicines dispensed, quantities, revenue and patients</td><td><button class="btn btn-primary btn-sm" onclick="openReport('sales-summary')">View report</button></td></tr>
        <tr><td><b>Inventory & Expiry Report</b></td><td>Stock levels with near-expiry highlighting</td><td><button class="btn btn-primary btn-sm" onclick="openReport('inventory-snapshot')">View report</button></td></tr>
        <tr><td><b>Demand Insights</b></td><td>Top-selling SKUs and restock recommendations</td><td>${reportGenBtn('demand-insights')}</td></tr>
        <tr><td><b>Verification Log</b></td><td>QR scans performed at this pharmacy</td><td>${reportGenBtn('verification-summary')}</td></tr>
        <tr><td><b>Shipment Receipts</b></td><td>Confirmed inbound deliveries</td><td><button class="btn btn-primary btn-sm" onclick="openReport('shipment-dispatch',{filter:s=>s.to===CTX.pharmacy})">View report</button></td></tr>
      </tbody></table></div>`)
    + card('Recent sales','', dataTable(['Medicine','Batch','Patient','Price','Date','Actions'], mySales.map(s=>[s.medicine,`<span class="mono">${s.batch}</span>`,s.patient,s.price,`<span class="mono">${s.date}</span>`,crudActions('sale',s.id)])));
};

PAGES.doctor.reports = function(){
  const myRx = prescriptions.filter(r=>r.doctor===CTX.doctor);
  return pageHead('Clinical Reports','Prescription and patient medication reports for '+CTX.doctor)
    + reportToolbar('Clinical Report PDF')
    + reportSummaryCards([
      {label:'Active prescriptions', value:myRx.length, delta:'', icon:'clipboard', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Patients under care', value:(doctors.find(d=>d.name===CTX.doctor)||{patients:0}).patients, delta:'', icon:'heart', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Medicine alerts', value:1, delta:'1 recall', icon:'warn', bg:'var(--red-light)', color:'#B91C1C'},
      {label:'Verifications performed', value:12, delta:'This month', icon:'search_shield', bg:'var(--blue-light)', color:'var(--blue)'},
    ])
    + card('Report templates','Click View report to open full content', `
      <div class="table-wrap"><table><thead><tr><th>Report</th><th>Description</th><th>Action</th></tr></thead><tbody>
        <tr><td><b>Prescription Summary</b></td><td>All prescriptions issued in the selected period</td><td><button class="btn btn-primary btn-sm" onclick="openReport('prescription-log')">View report</button></td></tr>
        <tr><td><b>Patient Medication History</b></td><td>Consolidated medicine history</td><td><button class="btn btn-primary btn-sm" onclick="openReport('prescription-log')">View report</button></td></tr>
        <tr><td><b>Safety & Recall Exposure</b></td><td>Patients potentially affected by recalls</td><td>${reportGenBtn('counterfeit-log')}</td></tr>
        <tr><td><b>Medicine Verification Log</b></td><td>Authenticity checks before prescribing</td><td>${reportGenBtn('verification-summary')}</td></tr>
      </tbody></table></div>`)
    + card('Recent prescriptions','', dataTable(['ID','Patient','Medicine','Diagnosis','Date','Actions'], myRx.map(r=>[`<span class="mono">${r.id}</span>`,r.patient,r.medicine,r.diagnosis,`<span class="mono">${r.date}</span>`,crudActions('prescription',r.id)])));
};

