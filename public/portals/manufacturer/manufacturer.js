/* ============================================================
   MANUFACTURER PORTAL
   ============================================================ */
PAGES.manufacturer.dashboard = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  const stats = [
    {label:"Total products", value:mine.length, delta:"", icon:'capsule', bg:'var(--blue-light)', color:'var(--blue)'},
    {label:"Active batches", value:mine.filter(m=>m.status!=='Recalled').length, delta:"", icon:'box', bg:'var(--teal-light)', color:'#4338CA'},
    {label:"Total production", value:mine.reduce((s,m)=>s+Number(m.qty||0),0).toLocaleString(), delta:"units", icon:'factory', bg:'var(--indigo-light)', color:'var(--indigo)'},
    {label:"Pending shipments", value:shipments.filter(s=>s.from===CTX.manufacturer && s.status==='Dispatched').length, delta:"", icon:'truck', bg:'var(--amber-light)', color:'#92620A'},
    {label:"Active vendors", value:vendors.length, delta:"", icon:'building', bg:'#F1F5F9', color:'#334155'},
    {label:"Verification rate", value:"96.4%", delta:"+1.1% this month", icon:'check', bg:'var(--green-light)', color:'#067A55'},
  ];
  return pageHead(`${CTX.manufacturer} — Dashboard`,'Production, batches and shipment overview',
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('manufacturer','createmedicine')">${ICONS.plus} Create medicine</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('manufacturer','shipments')">${ICONS.truck} Shipments</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('manufacturer','demand')">${ICONS.bars} Demand</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('manufacturer','reports')">${ICONS.clipboard} Reports</button>`)
    + statGrid(stats)
    + card('Recent batches','', dataTable(['Medicine','Batch','Status','Expiry'], mine.slice(0,5).map(m=>[m.name,`<span class="mono">${m.batch}</span>`,statusBadge(m.status),`<span class="mono">${m.exp}</span>`])));
};
PAGES.manufacturer.products = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  const byName = {}; mine.forEach(m=>{ byName[m.name] = (byName[m.name]||0)+1; });
  return pageHead('Products','Distinct medicines produced by '+CTX.manufacturer,
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('manufacturer','createmedicine')">Add product</button>`)
    + card('','', dataTable(['Product','Category','Active batches','Actions'], Object.keys(byName).map(n=>{
      const first = mine.find(m=>m.name===n);
      return [n, first.category, byName[n], crudActions('medicine', first.batch)];
    })));
};
PAGES.manufacturer.batches = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  return pageHead('Medicine batches','All batches produced by '+CTX.manufacturer,
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('manufacturer','createmedicine')">Create batch</button>`)
    + card('','', dataTable(['Medicine','Batch','Qty','Mfg. date','Expiry','Status','QR','Actions'], mine.map(m=>[m.name,`<span class="mono">${m.batch}</span>`,m.qty,`<span class="mono">${m.mfg}</span>`,`<span class="mono">${m.exp}</span>`,statusBadge(m.status),qrMini(m.code),crudActions('medicine',m.batch)])));
};
PAGES.manufacturer.createmedicine = function(){
  return pageHead('Create medicine','Register a new medicine batch into the network')
    + `<div class="card form-card"><form onsubmit="return actionCreateMedicine(event)">
      <div class="section-title">Medicine details</div>
      <div class="field-row"><div class="field"><label>Medicine name</label><input id="mfg-med-name" placeholder="e.g. Flagyl 400mg" required></div><div class="field"><label>Generic name</label><input id="mfg-med-generic" placeholder="e.g. Metronidazole"></div></div>
      <div class="field-row3"><div class="field"><label>Category</label><input id="mfg-med-category" placeholder="e.g. Antibiotic"></div><div class="field"><label>Strength</label><input id="mfg-med-strength" placeholder="e.g. 400mg"></div><div class="field"><label>Dosage form</label><select id="mfg-med-form"><option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Injection</option></select></div></div>
      <div class="section-title">Batch details</div>
      <div class="field-row"><div class="field"><label>Manufacturing date</label><input id="mfg-med-mfgdate" type="date" required></div><div class="field"><label>Expiry date</label><input id="mfg-med-expdate" type="date" required></div></div>
      <div class="field-row"><div class="field"><label>Quantity produced</label><input id="mfg-med-qty" type="number" placeholder="e.g. 5000"></div><div class="field"><label>Storage conditions</label><input id="mfg-med-storage" placeholder="e.g. Store below 25°C"></div></div>
      <button class="btn btn-primary" type="submit">Create medicine &amp; generate batch ID</button>
    </form></div>`;
};
PAGES.manufacturer.qrcodes = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  const latest = mine.find(m=>m.batch===MFG_LAST_BATCH) || mine[0];
  const pkgs = packages.filter(p=>p.batch===latest.batch);
  return pageHead('QR codes & package IDs','Each package unit has a unique Package ID and QR')
    + card(`${latest.name} — ${latest.batch}`,'Batch identity + package units', `<div style="display:flex;gap:26px;align-items:center;flex-wrap:wrap;">${qrMini(latest.code,true)}<div>
        <div class="detail-item" style="margin-bottom:8px;"><div class="k">Medicine code</div><div class="v mono">${latest.code}</div></div>
        <div class="detail-item" style="margin-bottom:8px;"><div class="k">Batch number</div><div class="v mono">${latest.batch}</div></div>
        <div class="detail-item" style="margin-bottom:8px;"><div class="k">Package units</div><div class="v">${pkgs.length}</div></div>
        <div style="display:flex;gap:8px;margin-top:10px;"><button class="btn btn-dark btn-sm" onclick="toast('QR label downloaded (demo)')">Download PNG</button><button class="btn btn-outline btn-sm" onclick="toast('Sent to label printer (demo)')">Print labels</button></div>
      </div></div>`)
    + card('Package IDs for this batch','Unique Package ID + QR per unit', dataTable(['Package ID','QR','Qty','Status','Location'], pkgs.length?pkgs.map(pk=>[`<span class="mono">${pk.id}</span>`,qrMini(pk.qr||pk.id),pk.qty,statusBadge(pk.status),pk.location]):[['—','—','—','—','No packages yet']]))
    + card('All batches','', dataTable(['Medicine','Batch','Code','QR'], mine.map(m=>[m.name,`<span class="mono">${m.batch}</span>`,`<span class="mono">${m.code}</span>`,qrMini(m.code)])));
};
PAGES.manufacturer.shipments = function(){
  const mine = shipments.filter(s=>s.from===CTX.manufacturer);
  const myBatches = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  const auth = authorizedVendors[CTX.manufacturer] || [];
  const vendorOpts = (auth.length? vendors.filter(v=>auth.includes(v.name)) : vendors);
  return pageHead('Shipments','Dispatch batches to authorized vendors only')
    + card('Create shipment','Manufacturer → Vendor. Pharmacy inventory is not updated until the pharmacy confirms receipt later.', `<form onsubmit="return actionCreateShipment(event,'manufacturer')" style="display:grid;grid-template-columns:1.2fr 1.2fr .8fr 1fr auto;gap:12px;align-items:end;">
        <div class="field" style="margin:0;"><label>Batch / Product</label><select id="manufacturer-ship-batch">${myBatches.map(m=>`<option value="${m.batch}">${m.name} — ${m.batch}</option>`).join('')}</select></div>
        <div class="field" style="margin:0;"><label>Authorized vendor</label><select id="manufacturer-ship-to">${vendorOpts.map(v=>`<option>${v.name}</option>`).join('')||'<option disabled>Authorize a vendor first</option>'}</select></div>
        <div class="field" style="margin:0;"><label>Quantity</label><input id="manufacturer-ship-qty" type="number" placeholder="e.g. 2000" required></div>
        <div class="field" style="margin:0;"><label>Expected delivery</label><input id="manufacturer-ship-eta" type="date"></div>
        <button class="btn btn-primary" type="submit">Create shipment</button>
      </form>`)
    + card('Shipment history','Statuses: Prepared → Dispatched → In Transit → Received → Confirmed', dataTable(['Shipment ID','Product','Batch','Vendor','Qty','Dispatch','ETA','Status','Actions'], mine.map(s=>[
      `<span class="mono">${s.id}</span>`, s.product||s.medicine, `<span class="mono">${s.batch}</span>`, s.to, s.qty,
      `<span class="mono">${s.dispatchDate||s.date}</span>`, `<span class="mono">${s.expectedDate||'—'}</span>`, statusBadge(s.status),
      `<div style="display:flex;gap:4px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="actionViewShipment('${s.id}')">View</button>
        ${s.status!=='Confirmed'&&s.status!=='Recalled'?`<button class="btn btn-outline btn-sm" onclick="actionDispatchShipment('${s.id}')">Advance</button>`:''}
        ${crudActions('shipment', s.id)}
      </div>`
    ])));
};
PAGES.manufacturer.vendors = function(){
  const authorized = authorizedVendors[CTX.manufacturer] || [];
  return pageHead('Vendors','Authorize distributors before shipping batches')
    + card('Authorized vendors','Only authorized vendors can receive your shipments', dataTable(['Vendor','City','License','Authorized','Action'], vendors.map(v=>{
      const ok = authorized.includes(v.name);
      return [`<b>${v.name}</b>`, v.city, `<span class="mono">${v.license}</span>`, ok?statusBadge('Approved'):statusBadge('Pending'),
        ok? '<span class="badge badge-green">Authorized</span>'
          : `<button class="btn btn-primary btn-sm" onclick="actionAuthorizeVendor('${v.name}')">Authorize</button>`];
    })));
};
PAGES.manufacturer.verification = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  return pageHead('Verification activity','How your products are being verified across pharmacies')
    + card('','', dataTable(['Medicine','Batch','Status','Verification history'], mine.map(m=>[m.name,`<span class="mono">${m.batch}</span>`,statusBadge(m.status), (verificationHistory[m.code]||[]).length+' scans logged'])));
};
PAGES.manufacturer.recall = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  return pageHead('Recall management','Issue a recall and notify every connected vendor and pharmacy')
    + card('Issue a recall','', `<form onsubmit="return actionIssueRecall(event)" style="max-width:560px;">
        <div class="field"><label>Batch</label><select id="mfg-recall-batch">${mine.map(m=>`<option value="${m.batch}">${m.name} — ${m.batch}</option>`).join('')}</select></div>
        <div class="field"><label>Recall reason</label><textarea id="mfg-recall-reason" placeholder="e.g. Contamination detected during quality audit"></textarea></div>
        <button class="btn btn-red" type="submit">Issue recall</button>
      </form>`)
    + card('Recall history','', dataTable(['Medicine','Batch','Status'], mine.filter(m=>m.status==='Recalled').map(m=>[m.name,`<span class="mono">${m.batch}</span>`,statusBadge(m.status)])));
};
PAGES.manufacturer.settings = genericSettingsPage('manufacturer');
// manufacturer.analytics is defined earlier with full charts (do not overwrite with generic)

/* ---------- Demand analytics (aggregated POS — no patient PII) ---------- */
function pharmacyCity(name){
  const p = pharmacies.find(x=>x.name===name);
  return p ? p.city : 'Unknown';
}
function buildDemandInsights(filter){
  // filter: { manufacturer } or { vendor } or null for network
  // Live POS sales (anonymized aggregates only)
  const pos = sales.filter(s=>{
    if(filter&&filter.manufacturer) return s.manufacturer===filter.manufacturer || (findMed(s.batch)||{}).manufacturer===filter.manufacturer;
    if(filter&&filter.vendor){
      const m = findMed(s.batch);
      return m && m.vendor===filter.vendor;
    }
    return true;
  });
  // Medicine totals from regional baseline + POS increments
  const medNames = Object.keys(DEMAND_REGIONAL).filter(name=>{
    if(filter&&filter.manufacturer){
      return medicines.some(m=>m.name===name && m.manufacturer===filter.manufacturer) || pos.some(s=>s.medicine===name);
    }
    if(filter&&filter.vendor){
      return medicines.some(m=>m.name===name && m.vendor===filter.vendor) || pos.some(s=>s.medicine===name && (findMed(s.batch)||{}).vendor===filter.vendor);
    }
    return true;
  });
  const unitPrice = {};
  medicines.forEach(m=>{ if(!unitPrice[m.name]) unitPrice[m.name]=85; });
  pos.forEach(s=>{ if(s.unitPrice) unitPrice[s.medicine]=s.unitPrice; });

  const byMedicine = medNames.map(name=>{
    const regional = DEMAND_REGIONAL[name] || {};
    let qty = Object.values(regional).reduce((a,b)=>a+b,0);
    // Add live POS qty (small relative to baseline)
    pos.filter(s=>s.medicine===name).forEach(s=>{ qty += Number(s.qty||0); });
    const cat = (medicines.find(m=>m.name===name)||{}).category || (pos.find(s=>s.medicine===name)||{}).category || '—';
    const rev = qty * (unitPrice[name]||85);
    return {name, qty, revenue:rev, category:cat, regional};
  }).sort((a,b)=>b.qty-a.qty);

  // Category demand
  const byCat = {};
  byMedicine.forEach(m=>{ byCat[m.category]=(byCat[m.category]||0)+m.qty; });

  // City totals across selected medicines
  const byCity = {};
  byMedicine.forEach(m=>{
    Object.entries(m.regional||{}).forEach(([city,q])=>{ byCity[city]=(byCity[city]||0)+q; });
  });
  pos.forEach(s=>{
    const city = pharmacyCity(s.pharmacy);
    byCity[city]=(byCity[city]||0)+Number(s.qty||0);
  });

  // Inventory movement proxy: pharmacy stock vs sales
  const movement = byMedicine.slice(0,6).map(m=>{
    const stockQty = pharmacyStock.filter(s=>s.medicine===m.name).reduce((a,s)=>a+Number(s.qty||0),0);
    return {name:m.name, sold:m.qty, onHand:stockQty, turn: stockQty? (m.qty/Math.max(stockQty,1)).toFixed(1) : '—'};
  });

  const totalQty = byMedicine.reduce((a,m)=>a+m.qty,0);
  const totalRev = byMedicine.reduce((a,m)=>a+m.revenue,0);
  const top = byMedicine.slice(0,5);
  const low = byMedicine.slice().sort((a,b)=>a.qty-b.qty).slice(0,5);

  return {byMedicine, byCat, byCity, movement, totalQty, totalRev, top, low, posCount:pos.length};
}
function demandPrivacyNote(){
  return `<div class="privacy-note">${ICONS.info}<div><b>Aggregated pharmacy POS only.</b> Individual patient names, CNIC, diagnoses and personal medicine histories are never shown in demand analytics.</div></div>`;
}
PAGES.manufacturer.demand = function(){
  const d = buildDemandInsights({manufacturer:CTX.manufacturer});
  const focus = d.byMedicine[0];
  return pageHead('Demand Insights','Aggregated sales demand for '+CTX.manufacturer+' products (from pharmacy POS)')
    + demandPrivacyNote()
    + statGrid([
      {label:'Units demanded', value:d.totalQty.toLocaleString(), delta:'network aggregate', icon:'bars', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Est. revenue', value:'Rs. '+(d.totalRev/1000).toFixed(0)+'k', delta:'at unit prices', icon:'clipboard', bg:'var(--green-light)', color:'#067A55'},
      {label:'SKUs tracked', value:d.byMedicine.length, delta:'', icon:'capsule', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'POS transactions', value:d.posCount, delta:'linked sales rows', icon:'history', bg:'var(--indigo-light)', color:'var(--indigo)'},
    ])
    + `<div class="grid-2-even">`
    + card('Top-selling medicines','Highest unit demand', dataTable(['Rank','Medicine','Category','Units','Est. revenue'], d.top.map((m,i)=>[i+1,m.name,m.category,m.qty.toLocaleString(),'Rs. '+m.revenue.toLocaleString()])))
    + card('Lowest-selling medicines','Under-moving SKUs', dataTable(['Medicine','Category','Units'], d.low.map(m=>[m.name,m.category,m.qty.toLocaleString()])))
    + `</div>`
    + `<div class="grid-2-even">`
    + card('Monthly sales trend','Units sold (aggregated)', chartWrap('chart-mfg-demand-monthly'))
    + card('Category demand','Share of units by therapeutic class', chartWrap('chart-mfg-demand-category'))
    + `</div>`
    + card('Regional demand — '+(focus?focus.name:'Top product'),'City-level unit demand (example view)',
        focus ? dataTable(['City / region','Units sold'], Object.entries(focus.regional).sort((a,b)=>b[1]-a[1]).map(([c,q])=>[c, q.toLocaleString()]))
              : '<p style="color:var(--muted);font-size:13px;">No regional data</p>')
    + card('Regional comparison chart','', chartWrap('chart-mfg-demand-regional'))
    + card('Inventory movement','Sold vs on-hand stock at pharmacies (aggregated)', dataTable(['Medicine','Units sold','On-hand stock','Turnover index'], d.movement.map(m=>[m.name,m.sold.toLocaleString(),m.onHand.toLocaleString(),m.turn])))
    + card('Live POS contribution','Recent anonymized pharmacy sales feeding this view', dataTable(['Sale ID','Medicine','Pharmacy city','Qty','Date'],
        sales.filter(s=>(s.manufacturer===CTX.manufacturer)||((findMed(s.batch)||{}).manufacturer===CTX.manufacturer)).slice(0,8).map(s=>[
          `<span class="mono">${s.id}</span>`, s.medicine, pharmacyCity(s.pharmacy), s.qty, `<span class="mono">${s.date}</span>`
        ])));
};
AFTER.manufacturer.demand = function(){
  const d = buildDemandInsights({manufacturer:CTX.manufacturer});
  const topName = d.top[0]?d.top[0].name:'Panadol 500mg';
  const monthly = DEMAND_MONTHLY[topName] || DEMAND_MONTHLY['Panadol 500mg'];
  safeChart('chart-mfg-demand-monthly', {
    type:'line',
    data:{ labels:DEMAND_MONTHLY.labels, datasets:[{ label:topName, data:monthly, borderColor:'#0EA5A4', backgroundColor:'rgba(14,165,164,.12)', fill:true, tension:.35, pointRadius:3 }] },
    options:chartOptsLine()
  });
  const catLabels = Object.keys(d.byCat).length? Object.keys(d.byCat) : ['Analgesic','Antibiotic','NSAID'];
  const catData = catLabels.map(k=>d.byCat[k]||1000);
  safeChart('chart-mfg-demand-category', {
    type:'doughnut',
    data:{ labels:catLabels, datasets:[{ data:catData, backgroundColor:['#0EA5A4','#6366F1','#10B981','#F59E0B','#EF4444','#94A3B8'], borderWidth:0 }] },
    options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} }
  });
  const reg = d.top[0]?d.top[0].regional:DEMAND_REGIONAL['Panadol 500mg'];
  const cities = Object.keys(reg||{Lahore:1,Karachi:1,Multan:1,Faisalabad:1,Islamabad:1});
  safeChart('chart-mfg-demand-regional', {
    type:'bar',
    data:{ labels:cities, datasets:[{ data:cities.map(c=>reg[c]||0), backgroundColor:'#6366F1', borderRadius:6, maxBarThickness:36 }] },
    options:chartOptsBar()
  });
};

