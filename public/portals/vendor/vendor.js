/* ============================================================
   VENDOR PORTAL
   ============================================================ */
PAGES.vendor.dashboard = function(){
  const incoming = shipments.filter(s=>s.to===CTX.vendor);
  const outgoing = shipments.filter(s=>s.from===CTX.vendor);
  const stats = [
    {label:"Incoming shipments", value:incoming.length, delta:incoming.filter(s=>s.status!=='Confirmed').length+" pending", icon:'box', bg:'var(--blue-light)', color:'var(--blue)'},
    {label:"Current inventory", value:medicines.filter(m=>m.vendor===CTX.vendor).length, delta:"", icon:'capsule', bg:'var(--teal-light)', color:'#4338CA'},
    {label:"Outgoing shipments", value:outgoing.length, delta:"", icon:'truck', bg:'var(--indigo-light)', color:'var(--indigo)'},
    {label:"Connected pharmacies", value:(vendors.find(v=>v.name===CTX.vendor)||{pharmacies:[]}).pharmacies.length, delta:"", icon:'building', bg:'#F1F5F9', color:'#334155'},
    {label:"Pending orders", value:1, delta:"", icon:'clipboard', bg:'var(--amber-light)', color:'#92620A'},
    {label:"Suspicious items", value:medicines.filter(m=>m.vendor===CTX.vendor && m.status==='Suspicious').length, delta:"review needed", icon:'warn', bg:'var(--red-light)', color:'#B91C1C'},
  ];
  return pageHead(`${CTX.vendor} — Dashboard`,'Incoming stock, inventory and pharmacy orders',
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('vendor','incoming')">${ICONS.box} Incoming</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('vendor','outgoing')">${ICONS.truck} Outgoing</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('vendor','demand')">${ICONS.bars} Demand</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('vendor','reports')">${ICONS.clipboard} Reports</button>`)
    + statGrid(stats)
    + card('Incoming shipments awaiting confirmation','', dataTable(['Shipment','Medicine','Batch','Qty','Status','Action'], incoming.map(s=>[`<span class="mono">${s.id}</span>`,s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,statusBadge(s.status), s.status!=='Confirmed'?`<button class="btn btn-outline btn-sm" onclick="actionConfirmReceipt('${s.id}','vendor','dashboard')">Confirm receipt</button>`:'—'])));
};
PAGES.vendor.incoming = function(){
  const incoming = shipments.filter(s=>s.to===CTX.vendor);
  return pageHead('Incoming shipments','Shipments dispatched to '+CTX.vendor+' by manufacturers')
    + card('','', dataTable(['Manufacturer','Medicine','Batch','Qty','Shipment ID','Date','Status','Actions'], incoming.map(s=>[s.from,s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,`<span class="mono">${s.id}</span>`,`<span class="mono">${s.date}</span>`,statusBadge(s.status),
      s.status!=='Confirmed' ? `<button class="btn btn-outline btn-sm" onclick="actionConfirmReceipt('${s.id}','vendor','incoming')">Confirm receipt</button> <button class="btn btn-outline btn-sm" onclick="toast('Issue reported to manufacturer')">Report issue</button>` : statusBadge('Received')])));
};
PAGES.vendor.inventory = function(){
  const mine = medicines.filter(m=>m.vendor===CTX.vendor);
  return pageHead('Inventory','Current stock held by '+CTX.vendor)
    + card('','', dataTable(['Medicine','Batch','Qty','Expiry','Manufacturer','Status'], mine.map(m=>[m.name,`<span class="mono">${m.batch}</span>`,m.qty,`<span class="mono">${m.exp}</span>`,m.manufacturer,statusBadge(m.status)])));
};
PAGES.vendor.orders = function(){
  return pageHead('Pharmacy orders','Requests received from connected pharmacies')
    + card('','', dataTable(['Pharmacy','Medicine requested','Qty','Date','Status','Action'], [
      ['Cityline Pharmacy','Brufen 400mg',600,'2024-03-24',statusBadge('Pending'),'<button class="btn btn-outline btn-sm" onclick="navigateTo(\'vendor\',\'outgoing\')">Prepare shipment</button>'],
      ['MediCare Pharmacy','Panadol 500mg',1200,'2024-01-15',statusBadge('Confirmed'),'—'],
    ]));
};
PAGES.vendor.pharmacies = function(){
  const v = vendors.find(x=>x.name===CTX.vendor) || {pharmacies:[]};
  return pageHead('Pharmacies','Pharmacy partners supplied by '+CTX.vendor)
    + card('','', `<div class="tag-list">${v.pharmacies.map(p=>`<span class="tag">${p}</span>`).join('')}</div>`);
};
PAGES.vendor.outgoing = function(){
  const mine = shipments.filter(s=>s.from===CTX.vendor);
  const v = vendors.find(x=>x.name===CTX.vendor) || {pharmacies:[]};
  const myStock = medicines.filter(m=>m.vendor===CTX.vendor);
  return pageHead('Outgoing shipments','Dispatch to pharmacies — they must Confirm receipt before inventory increases')
    + card('Create shipment to pharmacy','Status starts as Dispatched. Pharmacy confirmation is a separate event.', `<form onsubmit="return actionCreateShipment(event,'vendor')" style="display:grid;grid-template-columns:1.2fr 1.2fr .8fr 1fr auto;gap:12px;align-items:end;">
        <div class="field" style="margin:0;"><label>Product / Batch</label><select id="vendor-ship-batch">${myStock.map(m=>`<option value="${m.batch}">${m.name} — ${m.batch}</option>`).join('')}</select></div>
        <div class="field" style="margin:0;"><label>Pharmacy</label><select id="vendor-ship-to">${v.pharmacies.map(p=>`<option>${p}</option>`).join('')}</select></div>
        <div class="field" style="margin:0;"><label>Quantity</label><input id="vendor-ship-qty" type="number" placeholder="e.g. 500" required></div>
        <div class="field" style="margin:0;"><label>Expected delivery</label><input id="vendor-ship-eta" type="date"></div>
        <button class="btn btn-primary" type="submit">Dispatch</button>
      </form>`)
    + card('Outgoing history','', dataTable(['Shipment ID','Product','Batch','Pharmacy','Qty','Dispatch','ETA','Status','Actions'], mine.map(s=>[
      `<span class="mono">${s.id}</span>`, s.product||s.medicine, `<span class="mono">${s.batch}</span>`, s.to, s.qty,
      `<span class="mono">${s.dispatchDate||s.date}</span>`, `<span class="mono">${s.expectedDate||'—'}</span>`, statusBadge(s.status),
      `<button class="btn btn-outline btn-sm" onclick="actionViewShipment('${s.id}')">View / QR</button>`+(s.status==='Dispatched'?` <button class="btn btn-outline btn-sm" onclick="actionDispatchShipment('${s.id}')">Mark In Transit</button>`:'')
    ])));
};
PAGES.vendor.supplychain = PAGES.admin.supplychain;
PAGES.vendor.verification = function(){
  const mine = medicines.filter(m=>m.vendor===CTX.vendor);
  return pageHead('Verification','Verification status of stock passing through '+CTX.vendor)
    + card('','', dataTable(['Medicine','Batch','Status'], mine.map(m=>[m.name,`<span class="mono">${m.batch}</span>`,statusBadge(m.status)])));
};
PAGES.vendor.demand = function(){
  const d = buildDemandInsights({vendor:CTX.vendor});
  const focus = d.byMedicine[0] || {name:'Panadol 500mg', regional:DEMAND_REGIONAL['Panadol 500mg']};
  const cityRows = Object.entries(d.byCity).sort((a,b)=>b[1]-a[1]);
  return pageHead('Regional Demand','Where pharmacies in your network are selling — aggregated POS demand')
    + demandPrivacyNote()
    + statGrid([
      {label:'Regional units', value:d.totalQty.toLocaleString(), delta:'all cities', icon:'bars', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Est. channel revenue', value:'Rs. '+(d.totalRev/1000).toFixed(0)+'k', delta:'', icon:'clipboard', bg:'var(--green-light)', color:'#067A55'},
      {label:'Cities covered', value:Object.keys(d.byCity).length, delta:'', icon:'building', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'POS feed rows', value:d.posCount, delta:'anonymized sales', icon:'history', bg:'var(--teal-light)', color:'#4338CA'},
    ])
    + `<div class="grid-2-even">`
    + card('Demand by city','Total units across your assortment', dataTable(['City / region','Units'], cityRows.map(([c,q])=>[c, q.toLocaleString()])))
    + card('Top medicines in your channel','', dataTable(['Medicine','Units','Est. revenue'], d.top.map(m=>[m.name,m.qty.toLocaleString(),'Rs. '+m.revenue.toLocaleString()])))
    + `</div>`
    + `<div class="grid-2-even">`
    + card('Regional demand chart','Units by city', chartWrap('chart-vnd-demand-city'))
    + card('Monthly trend (top SKU)','', chartWrap('chart-vnd-demand-monthly'))
    + `</div>`
    + card('Example — '+(focus.name)+' by city','Matches FYP-style regional breakdown',
      dataTable(['City','Units sold'], Object.entries(focus.regional||{}).sort((a,b)=>b[1]-a[1]).map(([c,q])=>[c, q.toLocaleString()])))
    + card('Category demand','', dataTable(['Category','Units'], Object.entries(d.byCat).sort((a,b)=>b[1]-a[1]).map(([c,q])=>[c,q.toLocaleString()])))
    + card('Inventory movement','Sold vs pharmacy on-hand (aggregated)', dataTable(['Medicine','Sold','On-hand','Turnover'], d.movement.map(m=>[m.name,m.sold.toLocaleString(),m.onHand.toLocaleString(),m.turn])))
    + card('Source','Built from pharmacy POS sales (no patient identifiers)', `<p style="font-size:13px;color:var(--muted);line-height:1.55;margin:0;">Each completed sale at a pharmacy contributes quantity and pharmacy city only. Patient names, CNIC, diagnoses and personal histories are excluded from this module.</p>`);
};
AFTER.vendor.demand = function(){
  const d = buildDemandInsights({vendor:CTX.vendor});
  let cities = Object.keys(d.byCity).sort((a,b)=>d.byCity[b]-d.byCity[a]);
  if(!cities.length) cities = ['Lahore','Karachi','Multan','Faisalabad','Islamabad'];
  const cityData = cities.map(c=>d.byCity[c]||Math.floor(Math.random()*3000+1000));
  safeChart('chart-vnd-demand-city', {
    type:'bar',
    data:{ labels:cities, datasets:[{ data:cityData, backgroundColor:'#0EA5A4', borderRadius:6, maxBarThickness:34 }] },
    options:chartOptsBar()
  });
  const topName = d.top[0]?d.top[0].name:'Panadol 500mg';
  const monthly = DEMAND_MONTHLY[topName] || DEMAND_MONTHLY['Panadol 500mg'];
  safeChart('chart-vnd-demand-monthly', {
    type:'line',
    data:{ labels:DEMAND_MONTHLY.labels, datasets:[{ label:topName, data:monthly, borderColor:'#6366F1', backgroundColor:'rgba(99,102,241,.12)', fill:true, tension:.35, pointRadius:3 }] },
    options:chartOptsLine()
  });
};
PAGES.vendor.settings = genericSettingsPage('vendor');

