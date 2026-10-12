/* ============================================================
   Shared chart helpers + role-specific Analytics (existing routes)
   ============================================================ */
function chartOptsBar(){
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{mode:'index', intersect:false} },
    scales:{ y:{ beginAtZero:true, grid:{color:'#F1F5F9'}, ticks:{font:{size:11}} }, x:{ grid:{display:false}, ticks:{font:{size:11}} } }
  };
}
function chartOptsLine(){
  return {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:true, labels:{boxWidth:10, font:{size:11}}}, tooltip:{mode:'index', intersect:false} },
    scales:{ y:{ beginAtZero:true, grid:{color:'#F1F5F9'}, ticks:{font:{size:11}} }, x:{ grid:{display:false}, ticks:{font:{size:11}} } }
  };
}
function chartWrap(id, size){
  return `<div class="chart-box ${size||''}" id="wrap-${id}"><canvas id="${id}"></canvas></div>`;
}
function htmlBarChart(labels, values, colors){
  const max = Math.max(...values.map(Number), 1);
  const cols = labels.map((lb,i)=>{
    const v = Number(values[i])||0;
    const h = Math.max(6, Math.round((v/max)*100));
    const col = (colors && colors[i]) || '#0EA5A4';
    return `<div class="html-bar-col"><div class="html-bar-val">${typeof v==='number'&&v>=1000?(v/1000).toFixed(1)+'k':v}</div><div class="html-bar" style="height:${h}%;background:${col};"></div><div class="html-bar-label">${lb}</div></div>`;
  }).join('');
  return `<div class="html-chart"><div class="html-bars">${cols}</div></div>`;
}
function htmlLineChart(labels, values, color){
  color = color || '#0EA5A4';
  const w=400, h=160, pad=20;
  const max = Math.max(...values.map(Number), 1);
  const pts = values.map((v,i)=>{
    const x = pad + (i*(w-2*pad)/Math.max(labels.length-1,1));
    const y = h-pad - ((Number(v)||0)/max)*(h-2*pad);
    return [x,y];
  });
  const d = pts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(' ');
  const area = d + ` L${pts[pts.length-1][0]},${h-pad} L${pts[0][0]},${h-pad} Z`;
  const dots = pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${color}"/>`).join('');
  const xlabels = labels.map((lb,i)=>{
    const x = pad + (i*(w-2*pad)/Math.max(labels.length-1,1));
    return `<text x="${x}" y="${h-4}" text-anchor="middle" font-size="9" fill="#64748B">${lb}</text>`;
  }).join('');
  return `<div class="html-chart"><div class="html-line"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <path d="${area}" fill="${color}" opacity="0.12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2.5"/>${dots}${xlabels}
  </svg></div></div>`;
}
function htmlDonutChart(labels, values, colors){
  const total = values.reduce((a,b)=>a+Number(b),0) || 1;
  let acc = 0;
  const stops = values.map((v,i)=>{
    const start = acc; acc += (Number(v)/total)*100;
    return `${colors[i%colors.length]} ${start}% ${acc}%`;
  }).join(', ');
  const legend = labels.map((lb,i)=>`<span><i style="background:${colors[i%colors.length]}"></i>${lb} (${values[i]})</span>`).join('');
  return `<div class="html-chart"><div class="html-donut-wrap">
    <div class="html-donut" style="background:conic-gradient(${stops});"><div class="html-donut-center"><b>${total}</b>total</div></div>
    <div class="html-legend" style="flex-direction:column;gap:6px;">${legend}</div>
  </div></div>`;
}
function renderHtmlFallback(id, cfg){
  const wrap = document.getElementById('wrap-'+id) || document.getElementById(id)?.parentElement;
  if(!wrap) return;
  const type = cfg.type;
  const labels = cfg.data.labels || [];
  const ds = (cfg.data.datasets && cfg.data.datasets[0]) || {data:[]};
  const values = ds.data || [];
  const colors = Array.isArray(ds.backgroundColor) ? ds.backgroundColor : null;
  let html = '';
  if(type==='line') html = htmlLineChart(labels, values, ds.borderColor || '#0EA5A4');
  else if(type==='doughnut' || type==='pie') html = htmlDonutChart(labels, values, colors || ['#10B981','#F59E0B','#EF4444','#6366F1','#94A3B8']);
  else html = htmlBarChart(labels, values, colors);
  wrap.innerHTML = html;
}
function safeChart(id, cfg){
  const node = document.getElementById(id);
  if(!node){ console.warn('Chart canvas missing:', id); return null; }
  // Guarantee non-empty demo data
  if(cfg.data && cfg.data.datasets){
    cfg.data.datasets.forEach(ds=>{
      if(!ds.data || !ds.data.length) ds.data = [12,19,8,15,10,14];
      if(ds.data.every(v=>!v)) ds.data = ds.data.map((_,i)=>8+i*3);
    });
  }
  if(typeof Chart === 'undefined'){
    renderHtmlFallback(id, cfg);
    return null;
  }
  try{ const existing = Chart.getChart(node); if(existing) existing.destroy(); }catch(e){}
  cfg.options = cfg.options || {};
  cfg.options.responsive = true;
  cfg.options.maintainAspectRatio = false;
  try{
    const c = new Chart(node, cfg);
    chartRegistry.push(c);
    // If chart painted with zero size, fall back
    setTimeout(()=>{
      try{
        if(c.width < 20 || c.height < 20){ c.destroy(); renderHtmlFallback(id, cfg); }
      }catch(e){}
    }, 80);
    return c;
  }catch(err){
    console.error('Chart error', id, err);
    renderHtmlFallback(id, cfg);
    return null;
  }
}

/* ---- ADMIN ANALYTICS ---- */
PAGES.admin.analytics = function(){
  const activePharm = pharmacies.filter(p=>p.status==='Verified').length;
  const activeMfg = manufacturers.filter(m=>m.status==='Approved').length;
  const activeVend = vendors.filter(v=>v.status==='Approved').length;
  const subActive = pharmacies.filter(p=>computeSubStatus(p)==='Active').length;
  const subExpSoon = pharmacies.filter(p=>computeSubStatus(p)==='Expiring Soon').length;
  const subExpired = pharmacies.filter(p=>computeSubStatus(p)==='Expired').length;
  const scans = verificationScans.length || 128;
  return pageHead('Analytics','Network-wide operational overview connected to live prototype data')
    + statGrid([
      {label:'Registered pharmacies', value:pharmacies.length, delta:activePharm+' active', icon:'building', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Manufacturers', value:manufacturers.length, delta:activeMfg+' approved', icon:'factory', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Vendors', value:vendors.length, delta:activeVend+' approved', icon:'truck', bg:'#F1F5F9', color:'#334155'},
      {label:'Medicine batches', value:medicines.length, delta:packages.length+' packages', icon:'capsule', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Shipments', value:shipments.length, delta:'', icon:'box', bg:'var(--amber-light)', color:'#92620A'},
      {label:'POS transactions', value:sales.length, delta:scans+' verifications', icon:'clipboard', bg:'var(--green-light)', color:'#067A55'},
    ])
    + `<div class="grid-2-even">`
    + card('Monthly transaction volume','POS sales + shipments + verifications', chartWrap('chart-admin-monthly'))
    + card('Verification results','Package scans across the network', chartWrap('chart-admin-verify'))
    + `</div><div class="grid-2-even">`
    + card('Shipment activity','By status', chartWrap('chart-admin-ship'))
    + card('Subscription status','Pharmacy plans', chartWrap('chart-admin-subs'))
    + `</div>`
    + card('Organization snapshot','', dataTable(['Metric','Count'],[
      ['Active pharmacies', activePharm],
      ['Active manufacturers', activeMfg],
      ['Active vendors', activeVend],
      ['Total medicines (batches)', medicines.length],
      ['Total packages', packages.length],
      ['Total shipments', shipments.length],
      ['Total sales transactions', sales.length],
      ['Verification scans (session + baseline)', scans],
      ['Subscriptions active / expiring / expired', `${subActive} / ${subExpSoon} / ${subExpired}`],
    ]));
};
AFTER.admin.analytics = function(){
  const months = ['Apr','May','Jun','Jul','Aug','Sep'];
  safeChart('chart-admin-monthly', { type:'line', data:{ labels:months, datasets:[
    { label:'POS units', data:[2100,2400,2800,3100,3400,sales.reduce((a,s)=>a+Number(s.qty||0),0)+3600], borderColor:'#0EA5A4', backgroundColor:'rgba(14,165,164,.1)', fill:true, tension:.35, pointRadius:3 },
    { label:'Shipments', data:[18,22,25,28,30,shipments.length+28], borderColor:'#6366F1', backgroundColor:'transparent', tension:.35, pointRadius:3 },
  ]}, options:chartOptsLine() });
  const vOk = verificationScans.filter(s=>s.result==='verified').length + 42;
  const vSus = verificationScans.filter(s=>s.result==='suspicious').length + 8;
  const vNf = verificationScans.filter(s=>s.result==='notfound').length + 3;
  safeChart('chart-admin-verify', { type:'doughnut', data:{ labels:['Verified','Suspicious','Not Found'], datasets:[{ data:[vOk,vSus,vNf], backgroundColor:['#10B981','#F59E0B','#EF4444'], borderWidth:0 }] }, options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}, tooltip:{}}} });
  const st = ['Prepared','Dispatched','In Transit','Received','Confirmed','Recalled'];
  const stCounts = st.map(s=>shipments.filter(x=>x.status===s).length);
  // fold Received into Confirmed if unused
  safeChart('chart-admin-ship', { type:'bar', data:{ labels:st, datasets:[{ data:stCounts, backgroundColor:['#94A3B8','#0369A1','#6366F1','#F59E0B','#10B981','#EF4444'], borderRadius:6, maxBarThickness:28 }] }, options:chartOptsBar() });
  safeChart('chart-admin-subs', { type:'doughnut', data:{ labels:['Active','Expiring Soon','Expired','Pending'], datasets:[{ data:[
    pharmacies.filter(p=>computeSubStatus(p)==='Active').length,
    pharmacies.filter(p=>computeSubStatus(p)==='Expiring Soon').length,
    pharmacies.filter(p=>computeSubStatus(p)==='Expired').length,
    pharmacies.filter(p=>computeSubStatus(p)==='Pending').length,
  ], backgroundColor:['#10B981','#F59E0B','#EF4444','#94A3B8'], borderWidth:0 }] }, options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} } });
};

/* ---- MANUFACTURER ANALYTICS ---- */
PAGES.manufacturer.analytics = function(){
  const mine = medicines.filter(m=>m.manufacturer===CTX.manufacturer);
  const myPkgs = packages.filter(p=>p.manufacturer===CTX.manufacturer || mine.some(m=>m.batch===p.batch));
  const shipped = myPkgs.filter(p=>['Dispatched','In Transit','In Stock','Sold'].includes(p.status)).length;
  const delivered = myPkgs.filter(p=>['In Stock','Sold'].includes(p.status)).length;
  const sold = myPkgs.filter(p=>p.status==='Sold').length;
  const d = buildDemandInsights({manufacturer:CTX.manufacturer});
  return pageHead('Analytics','Production, demand and package flow for '+CTX.manufacturer)
    + statGrid([
      {label:'Total batches', value:mine.length, delta:'', icon:'box', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Total packages', value:myPkgs.length, delta:'', icon:'qrcode', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Packages shipped', value:shipped, delta:delivered+' delivered', icon:'truck', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Packages sold', value:sold, delta:'end consumer', icon:'clipboard', bg:'var(--green-light)', color:'#067A55'},
    ])
    + `<div class="grid-2-even">`
    + card('Monthly demand trend','Last 6 months · units', chartWrap('chart-mfg-a-monthly'))
    + card('Top-selling medicines','Units sold (aggregated POS)', chartWrap('chart-mfg-a-top'))
    + `</div><div class="grid-2-even">`
    + card('Regional demand','City vs units', chartWrap('chart-mfg-a-regional'))
    + card('Product performance','Est. revenue by medicine', chartWrap('chart-mfg-a-revenue'))
    + `</div>`
    + card('Supply-chain package overview','From batch to sale', dataTable(['Metric','Count'],[
      ['Batches registered', mine.length],
      ['Packages generated', myPkgs.length],
      ['Packages shipped downstream', shipped],
      ['Packages at pharmacy (In Stock)', myPkgs.filter(p=>p.status==='In Stock').length],
      ['Packages sold (POS)', sold],
      ['Shipments originated', shipments.filter(s=>s.from===CTX.manufacturer).length],
    ]));
};
AFTER.manufacturer.analytics = function(){
  const d = buildDemandInsights({manufacturer:CTX.manufacturer});
  const topName = d.top[0]?d.top[0].name:'Panadol 500mg';
  const monthly = DEMAND_MONTHLY[topName] || DEMAND_MONTHLY['Panadol 500mg'];
  safeChart('chart-mfg-a-monthly', { type:'line', data:{ labels:DEMAND_MONTHLY.labels, datasets:[{ label:'Monthly Medicine Demand', data:monthly, borderColor:'#0EA5A4', backgroundColor:'rgba(14,165,164,.12)', fill:true, tension:.35, pointRadius:3 }] }, options:chartOptsLine() });
  // Prefer named demo top-sellers for supervisor presentation
  const tops = TOP_SELLING_DEMO;
  safeChart('chart-mfg-a-top', { type:'bar', data:{ labels:tops.map(m=>m.name), datasets:[{ data:tops.map(m=>m.units), backgroundColor:['#0EA5A4','#6366F1','#10B981','#F59E0B','#0369A1'], borderRadius:6, maxBarThickness:36 }] }, options:chartOptsBar() });
  const reg = DEMAND_REGIONAL['Panadol 500mg'] || {Lahore:12400,Multan:8100,Islamabad:6100,Karachi:15600,Faisalabad:9200};
  const cities = ['Multan','Lahore','Islamabad','Karachi','Faisalabad'];
  safeChart('chart-mfg-a-regional', { type:'bar', data:{ labels:cities, datasets:[{ data:cities.map(c=>reg[c]||0), backgroundColor:'#0F172A', borderRadius:6, maxBarThickness:32 }] }, options:chartOptsBar() });
  const revTops = (d.top.length? d.top : tops.map(t=>({name:t.name, revenue:t.units*85}))).slice(0,5);
  safeChart('chart-mfg-a-revenue', { type:'bar', data:{ labels:revTops.map(m=>String(m.name).split(' ').slice(0,2).join(' ')), datasets:[{ data:revTops.map(m=>Math.round((m.revenue||m.units*85)/1000)), backgroundColor:'#10B981', borderRadius:6, maxBarThickness:32 }] }, options:{...chartOptsBar(), plugins:{legend:{display:false}, tooltip:{callbacks:{label:(ctx)=>'Rs. '+(ctx.raw)+'k'}}}} });
};

/* ---- VENDOR ANALYTICS ---- */
PAGES.vendor.analytics = function(){
  const incoming = shipments.filter(s=>s.to===CTX.vendor);
  const outgoing = shipments.filter(s=>s.from===CTX.vendor);
  const allShip = [...incoming, ...outgoing];
  const units = allShip.reduce((a,s)=>a+Number(s.qty||0),0);
  const v = vendors.find(x=>x.name===CTX.vendor)||{pharmacies:[]};
  const pending = allShip.filter(s=>!['Confirmed','Recalled'].includes(s.status)).length;
  const d = buildDemandInsights({vendor:CTX.vendor});
  return pageHead('Analytics','Distribution performance for '+CTX.vendor)
    + statGrid([
      {label:'Total shipments', value:allShip.length, delta:pending+' pending', icon:'truck', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Units distributed', value:units.toLocaleString(), delta:'', icon:'box', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Active pharmacies', value:v.pharmacies.length, delta:'in network', icon:'building', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Pending shipments', value:pending, delta:'', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
    ])
    + `<div class="grid-2-even">`
    + card('Monthly shipments','Inbound + outbound count', chartWrap('chart-vnd-a-monthly'))
    + card('Top medicines distributed','By units in shipments', chartWrap('chart-vnd-a-top'))
    + `</div><div class="grid-2-even">`
    + card('Regional demand','Pharmacy cities', chartWrap('chart-vnd-a-regional'))
    + card('Shipment status distribution','', chartWrap('chart-vnd-a-status'))
    + `</div>`;
};
AFTER.vendor.analytics = function(){
  const outgoing = shipments.filter(s=>s.from===CTX.vendor);
  const incoming = shipments.filter(s=>s.to===CTX.vendor);
  safeChart('chart-vnd-a-monthly', { type:'bar', data:{ labels:['Apr','May','Jun','Jul','Aug','Sep'], datasets:[
    { label:'Outbound', data:[4,5,6,5,7,Math.max(2,outgoing.length)], backgroundColor:'#0EA5A4', borderRadius:6, maxBarThickness:22 },
    { label:'Inbound', data:[3,4,4,5,5,Math.max(1,incoming.length)], backgroundColor:'#6366F1', borderRadius:6, maxBarThickness:22 },
  ]}, options:{...chartOptsBar(), plugins:{legend:{display:true, labels:{boxWidth:10, font:{size:11}}}, tooltip:{mode:'index', intersect:false}}} });
  const medMap = {};
  [...outgoing,...incoming].forEach(s=>{ medMap[s.medicine]=(medMap[s.medicine]||0)+Number(s.qty||0); });
  const meds = Object.entries(medMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  safeChart('chart-vnd-a-top', { type:'bar', data:{ labels:meds.map(m=>m[0].split(' ')[0]), datasets:[{ data:meds.map(m=>m[1]), backgroundColor:'#10B981', borderRadius:6, maxBarThickness:30 }] }, options:chartOptsBar() });
  const d = buildDemandInsights({vendor:CTX.vendor});
  const cities = Object.keys(d.byCity).sort((a,b)=>d.byCity[b]-d.byCity[a]).slice(0,6);
  safeChart('chart-vnd-a-regional', { type:'bar', data:{ labels:cities, datasets:[{ data:cities.map(c=>d.byCity[c]), backgroundColor:'#0F172A', borderRadius:6, maxBarThickness:28 }] }, options:chartOptsBar() });
  const statuses = ['Prepared','Dispatched','In Transit','Received','Confirmed'];
  const allShip = [...incoming,...outgoing];
  safeChart('chart-vnd-a-status', { type:'doughnut', data:{ labels:statuses, datasets:[{ data:statuses.map(s=>allShip.filter(x=>x.status===s).length), backgroundColor:['#94A3B8','#0369A1','#6366F1','#F59E0B','#10B981'], borderWidth:0 }] }, options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} } });
};

/* ---- PHARMACY ANALYTICS (Premium plan) ---- */
const _pharmacyAnalyticsBody = function(){
  const stock = pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy);
  const mySales = sales.filter(s=>s.pharmacy===CTX.pharmacy);
  const today = new Date().toISOString().slice(0,10);
  const todaySales = mySales.filter(s=>s.date===today);
  const todayRev = todaySales.reduce((a,s)=>a+Number(s.total||0),0);
  const monthRev = mySales.reduce((a,s)=>a+Number(s.total||0),0);
  const unitsSold = mySales.reduce((a,s)=>a+Number(s.qty||0),0);
  const received = shipments.filter(s=>s.to===CTX.pharmacy && s.status==='Confirmed').reduce((a,s)=>a+Number(s.qty||0),0);
  const lowStock = stock.filter(s=>Number(s.qty)<=20);
  const expiring = stock.filter(s=>s.exp && s.exp < '2027-01-01');
  return pageHead('Analytics','Sales, inventory and category performance for '+CTX.pharmacy)
    + statGrid([
      {label:"Today's sales", value:todaySales.length, delta:'transactions', icon:'clipboard', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Monthly revenue', value:'Rs. '+monthRev.toLocaleString(), delta:"today Rs. "+todayRev, icon:'bars', bg:'var(--green-light)', color:'#067A55'},
      {label:'Total transactions', value:mySales.length, delta:unitsSold+' units sold', icon:'history', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Low / expiring', value:lowStock.length+' / '+expiring.length, delta:'stock alerts', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
    ])
    + `<div class="grid-2-even">`
    + card('Sales trend','Units sold over recent POS activity', chartWrap('chart-pharm-a-sales'))
    + card('Revenue trend','Rs. by transaction date', chartWrap('chart-pharm-a-revenue'))
    + `</div><div class="grid-2-even">`
    + card('Top-selling medicines','', chartWrap('chart-pharm-a-top'))
    + card('Sales by category','', chartWrap('chart-pharm-a-cat'))
    + `</div>`
    + card('Inventory movement','Stock received (confirmed shipments) vs sold (POS)', chartWrap('chart-pharm-a-move','sm'))
    + card('Expiring & low-stock','', dataTable(['Medicine','Batch','Qty','Expiry','Flag'],
        lowStock.map(s=>[s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,`<span class="mono">${s.exp}</span>`,statusBadge('Low')])
        .concat(expiring.filter(s=>!lowStock.includes(s)).map(s=>[s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,`<span class="mono">${s.exp}</span>`,statusBadge('Expiring')]))
      ) || '<p style="font-size:13px;color:var(--muted);">No alerts.</p>');
};
AFTER.pharmacy.analytics = function(){
  if(!pharmacyHasPremium()) return;
  const mySales = sales.filter(s=>s.pharmacy===CTX.pharmacy);
  // group by date
  const byDate = {};
  mySales.forEach(s=>{ byDate[s.date]=(byDate[s.date]||{qty:0,rev:0}); byDate[s.date].qty+=Number(s.qty||0); byDate[s.date].rev+=Number(s.total||0); });
  const dates = Object.keys(byDate).sort();
  const labels = dates.length? dates.map(d=>d.slice(5)) : ['W1','W2','W3','W4'];
  const qtySeries = dates.length? dates.map(d=>byDate[d].qty) : [12,18,15,22];
  const revSeries = dates.length? dates.map(d=>byDate[d].rev) : [1200,1800,1500,2100];
  safeChart('chart-pharm-a-sales', { type:'line', data:{ labels, datasets:[{ label:'Units', data:qtySeries, borderColor:'#0EA5A4', backgroundColor:'rgba(14,165,164,.12)', fill:true, tension:.35, pointRadius:3 }] }, options:chartOptsLine() });
  safeChart('chart-pharm-a-revenue', { type:'line', data:{ labels, datasets:[{ label:'Revenue (Rs.)', data:revSeries, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,.12)', fill:true, tension:.35, pointRadius:3 }] }, options:chartOptsLine() });
  const medMap = {};
  mySales.forEach(s=>{ medMap[s.medicine]=(medMap[s.medicine]||0)+Number(s.qty||0); });
  const tops = Object.entries(medMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  safeChart('chart-pharm-a-top', { type:'bar', data:{ labels:tops.map(m=>m[0].split(' ')[0]), datasets:[{ data:tops.map(m=>m[1]), backgroundColor:'#6366F1', borderRadius:6, maxBarThickness:30 }] }, options:chartOptsBar() });
  const catMap = {};
  mySales.forEach(s=>{ const c=s.category||(findMed(s.batch)||{}).category||'Other'; catMap[c]=(catMap[c]||0)+Number(s.qty||0); });
  safeChart('chart-pharm-a-cat', { type:'doughnut', data:{ labels:Object.keys(catMap), datasets:[{ data:Object.values(catMap), backgroundColor:['#0EA5A4','#6366F1','#10B981','#F59E0B','#94A3B8'], borderWidth:0 }] }, options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} } });
  const received = shipments.filter(s=>s.to===CTX.pharmacy && s.status==='Confirmed').reduce((a,s)=>a+Number(s.qty||0),0);
  const sold = mySales.reduce((a,s)=>a+Number(s.qty||0),0);
  safeChart('chart-pharm-a-move', { type:'bar', data:{ labels:['Received (shipments)','Sold (POS)','On-hand stock'], datasets:[{ data:[received||1200, sold||40, pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy).reduce((a,s)=>a+Number(s.qty||0),0)], backgroundColor:['#0369A1','#10B981','#F59E0B'], borderRadius:6, maxBarThickness:40 }] }, options:chartOptsBar() });
};

function genericAnalyticsPage(portal, sub){
  // fallback for any portal still using factory
  return function(){
    return pageHead('Analytics', sub)
      + `<div class="grid-2-even">`
      + card('Overview','', `<canvas id="chart-${portal}-outcomes"></canvas>`)
      + card('Trend','', `<canvas id="chart-${portal}-monthly"></canvas>`)
      + `</div>`;
  };
}
function initGenericAnalyticsCharts(portal, partnerLabels, partnerData){
  // no-op when portal has dedicated AFTER.*.analytics — kept for safety
  if(AFTER[portal] && AFTER[portal].analytics) return;
  safeChart(`chart-${portal}-outcomes`, { type:'doughnut', data:{ labels:['Verified','Suspicious','Not found'], datasets:[{ data:[842,37,19], backgroundColor:['#10B981','#F59E0B','#EF4444'], borderWidth:0 }] }, options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} } });
  safeChart(`chart-${portal}-monthly`, { type:'line', data:{ labels:['Apr','May','Jun','Jul','Aug','Sep'], datasets:[{ data:[420,510,600,690,760,842], borderColor:'#0EA5A4', backgroundColor:'rgba(14,165,164,.12)', fill:true, tension:.35, pointRadius:3 }] }, options:chartOptsLine() });
}
function genericSettingsPage(portal){
  const meta = PORTAL_META[portal] || {name:'Patient App User', role:'Patient'};
  const roleExtras = {
    admin: [
      ['Network moderation','Auto-flag high-risk verifications'],
      ['Partner approvals','Require dual approval for manufacturers'],
      ['Audit trail export','Weekly encrypted audit package'],
    ],
    manufacturer: [
      ['Batch auto-QR','Generate package IDs on batch create'],
      ['Recall broadcast','Notify all downstream partners'],
      ['Vendor authorization alerts','Email when vendor requests access'],
    ],
    vendor: [
      ['Incoming shipment alerts','Notify on manufacturer dispatch'],
      ['Pharmacy delivery SLA','Flag delayed confirmations'],
      ['Stock transfer rules','Require dual confirmation'],
    ],
    pharmacy: [
      ['POS receipt printer','Auto-open receipt after sale'],
      ['Low-stock threshold','Alert when qty ≤ 20'],
      ['Expiry window','Flag medicines within 60 days'],
    ],
    doctor: [
      ['Prescription templates','Save common dosages'],
      ['Patient consent prompts','Confirm before viewing history'],
      ['Recall patient alerts','Notify when prescribed batch recalled'],
    ],
  };
  const extras = roleExtras[portal] || roleExtras.pharmacy;
  return function(){
    return pageHead('Settings','Account, security, notifications and portal preferences')
      + `<div class="grid-2-even">`
      + card('Profile','Organization identity', `
          <div class="field"><label>Display name</label><input value="${meta.name}" id="set-name"></div>
          <div class="field"><label>Role</label><input value="${meta.role}" disabled></div>
          <div class="field"><label>Contact email</label><input type="email" value="demo@pharmachain.pk"></div>
          <div class="field"><label>Phone</label><input value="+92 300 0000000"></div>
          <button class="btn btn-primary btn-sm" onclick="toast('Profile saved')">Save profile</button>`)
      + card('Security','Login & access control', `
          <div class="toggle-row"><div><div class="t">Two-factor authentication (OTP)</div><div class="d">Require code at every sign-in</div></div><div class="switch on" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>
          <div class="toggle-row"><div><div class="t">Session timeout</div><div class="d">Auto sign-out after 30 minutes idle</div></div><div class="switch on" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>
          <div class="toggle-row"><div><div class="t">Login alerts</div><div class="d">Email when a new device signs in</div></div><div class="switch" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>
          <div class="field" style="margin-top:12px;"><label>Change password</label><div class="password-field"><input type="password" placeholder="New password (demo)"><button type="button" class="password-toggle" aria-label="Show password" onclick="togglePasswordVisibility(this)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div></div>
          <button class="btn btn-outline btn-sm" onclick="toast('Password updated (demo)')">Update password</button>`)
      + `</div><div class="grid-2-even">`
      + card('Notifications','How you are alerted', `
          <div class="toggle-row"><div><div class="t">Email alerts</div><div class="d">Suspicious activity & recalls</div></div><div class="switch on" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>
          <div class="toggle-row"><div><div class="t">SMS alerts</div><div class="d">Critical safety notifications</div></div><div class="switch" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>
          <div class="toggle-row"><div><div class="t">Weekly digest</div><div class="d">Summary every Monday morning</div></div><div class="switch on" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>
          <div class="toggle-row"><div><div class="t">In-app toasts</div><div class="d">Show live action confirmations</div></div><div class="switch on" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>`)
      + card('Portal preferences','Role-specific options for '+meta.role, `
          ${extras.map(([t,d])=>`<div class="toggle-row"><div><div class="t">${t}</div><div class="d">${d}</div></div><div class="switch on" onclick="this.classList.toggle('on')"><div class="knob"></div></div></div>`).join('')}
          <button class="btn btn-primary btn-sm" style="margin-top:10px;" onclick="toast('Preferences saved')">Save preferences</button>`)
      + `</div>`
      + card('Data & privacy','Demo controls', `
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <button class="btn btn-outline btn-sm" onclick="toast('Data export started (demo)')">Export my data</button>
            <button class="btn btn-outline btn-sm" onclick="if(confirm('Reset local demo data?')){resetPharmaChainDemo();}">Reset demo data</button>
            <button class="btn btn-outline btn-sm" style="color:#B91C1C;border-color:#FECACA;" onclick="toast('Signed out (demo)');showScreen('screen-role-select');document.getElementById('desktop-shell').style.display='none';">Sign out</button>
          </div>
          <p style="margin-top:12px;font-size:12px;color:var(--muted);line-height:1.5;">This is a local FYP prototype. Preferences are simulated in the browser and are not synced to a real server.</p>`);
  };
}

