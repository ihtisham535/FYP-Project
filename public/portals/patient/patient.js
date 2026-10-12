/* ============================================================
   PATIENT MOBILE APP
   ============================================================ */

/* ---------- Patient nearby pharmacies (demo location — not real GPS) ---------- */
function haversineKm(lat1, lng1, lat2, lng2){
  const R=6371, toRad=function(d){return d*Math.PI/180;};
  const dLat=toRad((lat2||0)-(lat1||0)), dLng=toRad((lng2||0)-(lng1||0));
  const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(lat1||0))*Math.cos(toRad(lat2||0))*Math.sin(dLng/2)*Math.sin(dLng/2);
  return Math.round(R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a))*10)/10;
}
function setPatientDemoLocation(city){
  const loc = DEMO_LOCATIONS[city] || DEMO_LOCATIONS.Lahore;
  patientLocation = {city:city, lat:loc.lat, lng:loc.lng, source:'demo'};
  toast('Demo location set: '+loc.label+' (not real GPS)');
  patientNavigateTo('nearby');
}
function useDemoMyLocation(){
  // Simulated "use my location" — picks Lahore Gulberg demo point
  setPatientDemoLocation(patientLocation.city || 'Lahore');
}
function ensurePharmacyLocationFields(ph){
  if(!ph) return ph;
  if(ph.lat==null && DEMO_LOCATIONS[ph.city]){ ph.lat=DEMO_LOCATIONS[ph.city].lat; ph.lng=DEMO_LOCATIONS[ph.city].lng; }
  if(!ph.area) ph.area = ph.city;
  if(!ph.address) ph.address = (ph.area||ph.city)+' (demo address)';
  if(!ph.hours) ph.hours = '09:00 – 22:00';
  return ph;
}
function stockStatusLabel(qty, status){
  if(status==='Recalled' || status==='Suspicious') return status;
  if(Number(qty)<=0) return 'Out of stock';
  if(Number(qty)<=10) return 'Low stock';
  return 'In stock';
}
function findNearbyPharmacies(opts){
  opts = opts || {};
  const city = opts.city || patientNearbyQuery.city || patientLocation.city;
  const medQ = (opts.medicine || patientNearbyQuery.medicine || '').trim().toLowerCase();
  const onlyInStock = opts.onlyInStock!=null ? opts.onlyInStock : patientNearbyQuery.onlyInStock;
  const sort = opts.sort || patientNearbyQuery.sort || 'distance';
  const userLat = patientLocation.lat, userLng = patientLocation.lng;
  let list = pharmacies.map(ensurePharmacyLocationFields).filter(function(ph){
    if(ph.status==='Suspended') return false;
    if(city && city!=='All' && ph.city!==city) return false;
    return true;
  }).map(function(ph){
    const dist = haversineKm(userLat, userLng, ph.lat, ph.lng);
    let stockRows = pharmacyStock.filter(function(s){ return s.pharmacy===ph.name; });
    if(medQ){
      stockRows = stockRows.filter(function(s){
        const med = (typeof findMed==='function' ? findMed(s.batch) : null) || {};
        const hay = [s.medicine, s.generic, med.generic, s.manufacturer, s.strength, med.strength].join(' ').toLowerCase();
        return hay.indexOf(medQ)>=0;
      });
    }
    if(onlyInStock) stockRows = stockRows.filter(function(s){ return Number(s.qty)>0 && s.status!=='Recalled'; });
    const minPrice = stockRows.length ? Math.min.apply(null, stockRows.map(function(s){return Number(s.unitPrice)||99999;})) : null;
    const anyInStock = stockRows.some(function(s){ return Number(s.qty)>0 && s.status!=='Recalled'; });
    return {ph:ph, dist:dist, stockRows:stockRows, minPrice:minPrice, anyInStock:anyInStock};
  });
  if(medQ) list = list.filter(function(x){ return x.stockRows.length>0; });
  if(sort==='price') list.sort(function(a,b){ return (a.minPrice==null?99999:a.minPrice)-(b.minPrice==null?99999:b.minPrice); });
  else if(sort==='availability') list.sort(function(a,b){ return (b.anyInStock?1:0)-(a.anyInStock?1:0) || a.dist-b.dist; });
  else list.sort(function(a,b){ return a.dist-b.dist; });
  return list;
}
function patientNearbySearch(){
  const medEl = document.getElementById('nearby-med-q');
  const cityEl = document.getElementById('nearby-city');
  const sortEl = document.getElementById('nearby-sort');
  const stockEl = document.getElementById('nearby-instock');
  patientNearbyQuery.medicine = medEl ? medEl.value : '';
  patientNearbyQuery.sort = sortEl ? sortEl.value : 'distance';
  patientNearbyQuery.onlyInStock = stockEl ? !!stockEl.checked : false;
  patientNearbyQuery.city = cityEl ? cityEl.value : (patientLocation.city||'Lahore');
  if(cityEl && cityEl.value && cityEl.value!=='All' && DEMO_LOCATIONS[cityEl.value]){
    patientLocation.city = cityEl.value;
    patientLocation.lat = DEMO_LOCATIONS[cityEl.value].lat;
    patientLocation.lng = DEMO_LOCATIONS[cityEl.value].lng;
  }
  patientNavigateTo('nearby');
}

const PATIENT_TABS = [ ['home','Home','home'], ['scan','Scan','scan'], ['nearby','Find','building'], ['medicines','Meds','capsule'], ['profile','Profile','user'] ];
let patientPage = 'home';
let lastScanResult = null;

function enterPatientApp(){
  document.getElementById('screen-role-select').style.display='none';
  document.getElementById('screen-login').style.display='none';
  document.getElementById('screen-otp').style.display='none';
  document.getElementById('desktop-shell').style.display='none';
  document.getElementById('patient-app-wrap').style.display='flex';
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  patientNavigateTo('home');
}
function patientNavigateTo(page, param){
  patientPage = page;
  document.getElementById('bottom-nav').innerHTML = PATIENT_TABS.map(([key,label,icon])=>
    `<div class="bn-item ${(key===page || (page.startsWith('scan') && key==='scan'))?'active':''}" onclick="patientNavigateTo('${key}')">${ICONS[icon]}<span>${label}</span></div>`
  ).join('');
  document.getElementById('app-content').innerHTML = PATIENT_PAGES[page] ? PATIENT_PAGES[page](param) : PATIENT_PAGES.home();
  document.getElementById('app-content').scrollTop = 0;
}
function currentPatient(){ return patients.find(p=>p.id===CURRENT_PATIENT_ID); }

const PATIENT_PAGES = {};
PATIENT_PAGES.home = function(){
  const p = currentPatient();
  const myRx = prescriptions.filter(r=>r.patientId===p.id);
  const myMeds = p.entries.slice(0,3);
  return `
    <div class="greeting">Good morning, ${p.masked.split(' ')[0]}</div>
    <div class="greeting-sub">Here's what's happening with your medicines today.</div>
    <div class="scan-cta" onclick="patientNavigateTo('scan')">
      <div><div class="t">Scan Medicine</div><div class="s">Verify authenticity in seconds</div></div>
      <div class="go">${ICONS.scan}</div>
    </div>
    <div class="app-section-title">My medicines <span onclick="patientNavigateTo('medicines')">See all</span></div>
    ${myMeds.map(e=>`<div class="med-card"><div style="display:flex;align-items:center;"><div class="mic">${ICONS.capsule}</div><div><div class="mname">${e.medicine}</div><div class="msub">${e.pharmacy} · ${e.date}</div></div></div>${statusBadge(e.usage)}</div>`).join('')}
    <div class="app-section-title">Prescriptions <span onclick="patientNavigateTo('reports')">See all</span></div>
    ${myRx.slice(0,2).map(r=>`<div class="rx-card"><div class="rxhead"><div><h4>${r.medicine}</h4><div class="doc">${r.doctor}</div></div>${statusBadge('Active')}</div></div>`).join('') || '<p style="font-size:12px;color:var(--muted);">No active prescriptions.</p>'}
    <div class="app-section-title">Find medicines near you <span onclick="patientNavigateTo('nearby')">Open</span></div>
    <div class="med-card" style="cursor:pointer;" onclick="patientNavigateTo('nearby')">
      <div style="display:flex;align-items:center;">
        <div class="mic">${ICONS.building}</div>
        <div>
          <div class="mname">Nearby registered pharmacies</div>
          <div class="msub">Demo location · ${patientLocation.city} · search by brand or generic</div>
        </div>
      </div>
      <span style="color:var(--teal);font-size:12px;font-weight:700;">Find →</span>
    </div>
    <div class="app-section-title">Recent verification</div>
    <div class="med-card"><div style="display:flex;align-items:center;"><div class="mic">${ICONS.check}</div><div><div class="mname">Panadol 500mg</div><div class="msub">Verified · 2 hrs ago</div></div></div></div>
  `;
};

PATIENT_PAGES.nearby = function(){
  const cities = ['All'].concat(Object.keys(DEMO_LOCATIONS));
  const city = patientLocation.city || 'Lahore';
  const results = findNearbyPharmacies({city: document.getElementById('nearby-city')?null:city});
  // re-query with stored filters
  const list = findNearbyPharmacies({});
  const locLabel = (DEMO_LOCATIONS[patientLocation.city]||{}).label || patientLocation.city;
  let body = '';
  if(!list.length){
    body = `<div class="med-card" style="flex-direction:column;align-items:flex-start;gap:6px;">
      <div class="mname">${patientNearbyQuery.medicine ? 'Medicine not found nearby' : 'No pharmacies in this area'}</div>
      <div class="msub">${patientNearbyQuery.medicine ? 'Try another brand/generic name or city.' : 'Change city or expand search. All data is demo-only.'}</div>
    </div>`;
  } else {
    body = list.map(function(item){
      const ph = item.ph;
      const reg = ph.status==='Verified' ? statusBadge('Verified') : (ph.status==='Pending' ? statusBadge('Pending') : statusBadge('Suspended'));
      const stockHtml = item.stockRows.length ? item.stockRows.slice(0,6).map(function(s){
        const st = stockStatusLabel(s.qty, s.status);
        const stBadge = st==='In stock' ? statusBadge('Active') : (st==='Out of stock'||st==='Recalled' ? statusBadge('Suspicious') : statusBadge('Pending'));
        return `<div style="border-top:1px solid var(--border);padding:10px 0;">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;">
            <div>
              <div style="font-weight:700;font-size:13px;">${s.medicine}</div>
              <div style="font-size:11px;color:var(--muted);">${s.generic||'—'} · ${s.strength||'—'} · ${s.packSize||'Pack n/a'}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px;">Batch <span class="mono">${s.batch}</span> · Updated ${s.updatedAt||'—'}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800;font-size:14px;">Rs. ${Number(s.unitPrice||0)}</div>
              <div style="margin-top:4px;">${stBadge}</div>
              <div style="font-size:11px;color:var(--muted);margin-top:2px;">Qty: ${Number(s.qty)}</div>
            </div>
          </div>
        </div>`;
      }).join('') : `<div style="font-size:12px;color:var(--muted);padding:8px 0;">${patientNearbyQuery.medicine ? 'Out of stock for this medicine at this pharmacy.' : 'No inventory rows in demo for this pharmacy.'}</div>`;
      return `<div class="med-card" style="flex-direction:column;align-items:stretch;gap:8px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;gap:8px;">
          <div>
            <div class="mname">${ph.name}</div>
            <div class="msub">${ph.area||''}, ${ph.city} · ${item.dist} km (demo)</div>
          </div>
          ${reg}
        </div>
        <div style="font-size:11.5px;color:var(--muted);line-height:1.45;">${ph.address||''}<br>Hours: ${ph.hours||'—'} · ${ph.contact||''}</div>
        ${patientNearbyQuery.medicine || item.stockRows.length ? stockHtml : `<div style="font-size:12px;color:var(--teal);font-weight:600;cursor:pointer;" onclick="document.getElementById('nearby-med-q').value='Panadol';patientNearbySearch();">Search a medicine to see prices & stock →</div>`}
      </div>`;
    }).join('');
  }
  return `
    <div class="greeting" style="margin-bottom:4px;">Find medicines</div>
    <div class="greeting-sub">Nearby registered pharmacies · demo data only · not real GPS</div>
    <div class="med-card" style="flex-direction:column;align-items:stretch;gap:10px;margin-bottom:12px;">
      <div style="font-size:12px;color:var(--muted);">Location: <b style="color:var(--navy)">${locLabel}</b></div>
      <button type="button" class="btn btn-outline btn-sm" onclick="useDemoMyLocation()">Use demo location</button>
      <div class="field" style="margin:0;"><label>City / area (demo)</label>
        <select id="nearby-city" onchange="patientNearbySearch()" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;">
          ${cities.map(function(c){ var sel=(patientNearbyQuery.city||patientLocation.city||'Lahore'); return '<option value="'+c+'" '+(c===sel?'selected':'')+'>'+c+'</option>'; }).join('')}
        </select>
      </div>
      <div class="field" style="margin:0;"><label>Medicine (brand or generic)</label>
        <input id="nearby-med-q" placeholder="e.g. Panadol or Paracetamol" value="${(patientNearbyQuery.medicine||'').replace(/"/g,'&quot;')}" onkeydown="if(event.key==='Enter'){event.preventDefault();patientNearbySearch();}">
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <select id="nearby-sort" onchange="patientNearbySearch()" style="flex:1;min-width:120px;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:12px;">
          <option value="distance" ${patientNearbyQuery.sort==='distance'?'selected':''}>Sort: distance</option>
          <option value="price" ${patientNearbyQuery.sort==='price'?'selected':''}>Sort: price</option>
          <option value="availability" ${patientNearbyQuery.sort==='availability'?'selected':''}>Sort: availability</option>
        </select>
        <label style="font-size:12px;display:flex;align-items:center;gap:6px;"><input type="checkbox" id="nearby-instock" ${patientNearbyQuery.onlyInStock?'checked':''} onchange="patientNearbySearch()"> In stock only</label>
      </div>
      <button type="button" class="btn btn-dark btn-block" onclick="patientNearbySearch()">Search</button>
    </div>
    <div class="app-section-title">Results <span style="font-weight:600;color:var(--muted);text-transform:none;letter-spacing:0;">${list.length} pharmacies</span></div>
    ${body}
    <p style="font-size:11px;color:var(--muted);margin-top:8px;line-height:1.45;">Distances and coordinates are simulated for the prototype. Inventory reflects the same demo stock used by pharmacy POS. No patient private data is shown.</p>
  `;
};

PATIENT_PAGES.scan = function(){
  return `
    <div class="greeting" style="margin-bottom:4px;">Scan medicine</div>
    <div class="greeting-sub">Point your camera at the QR code on the pack</div>
    <div class="app-scan-box">
      <div class="app-scan-frame"><div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div><div class="scan-line"></div></div>
      <p>Scan the QR code on your medicine</p>
      <div style="display:flex;gap:14px;margin-top:16px;">
        <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:#fff;" onclick="toast('Flash toggled')">${ICONS.flash}</div>
        <div style="width:40px;height:40px;border-radius:50%;background:var(--teal);display:flex;align-items:center;justify-content:center;color:#fff;" onclick="simulatePatientScan()">${ICONS.scan}</div>
        <div style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:#fff;" onclick="patientNavigateTo('scanmanual')">${ICONS.keyboard}</div>
      </div>
    </div>
    <p style="text-align:center;font-size:11px;color:var(--muted);margin-top:14px;">Tap the teal button to simulate a scan</p>
  `;
};
PATIENT_PAGES.scanmanual = function(){
  return `<div class="greeting" style="margin-bottom:14px;">Enter code manually</div>
    <form onsubmit="return patientManualVerify(event)">
      <div class="field"><label>Medicine code</label><input id="patient-manual-code" placeholder="e.g. MED-2024-0113" style="font-family:var(--mono);"></div>
      <button class="btn btn-dark btn-block" type="submit">Verify</button>
    </form>
    <div class="hint-chips" style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
      <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:10.5px;" onclick="document.getElementById('patient-manual-code').value='MED-2024-0113'">MED-2024-0113</div>
      <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:10.5px;" onclick="document.getElementById('patient-manual-code').value='MED-2024-0299'">MED-2024-0299</div>
      <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:10.5px;" onclick="document.getElementById('patient-manual-code').value='MED-0000-9999'">MED-0000-9999</div>
    </div>`;
};
function patientManualVerify(e){ e.preventDefault(); const code = fv('patient-manual-code'); runPatientVerification(code); return false; }
function simulatePatientScan(){
  const sample = ['PKG-A8F92K','PKG-SOLD91','PKG-FAKE123','PKG-MISMATCH'];
  const code = sample[Math.floor(Math.random()*sample.length)];
  runPatientVerification(code);
}
function runPatientVerification(code){
  patientPage = 'verifying';
  document.getElementById('app-content').innerHTML = PATIENT_PAGES.verifying();
  setTimeout(()=>{
    lastScanResult = {code, result: lookupVerification(code)};
    patientNavigateTo(lastScanResult.result.state);
  }, 900);
}
PATIENT_PAGES.verifying = function(){
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;"><div class="spinner"></div><p style="margin-top:20px;font-size:13px;color:var(--muted);">Checking package identity…</p></div>`;
};
PATIENT_PAGES.verified = function(){
  const r = lastScanResult.result;
  const med = r.med || {};
  const pkg = r.pkg || {};
  return `<div class="result-hero">
      <div class="ric" style="background:var(--green-light);color:#067A55;">${ICONS.check}</div>
      <h2>Package Verified</h2>
      <p>Identity and supply-chain records are consistent. This does not scientifically prove chemical composition.</p>
    </div>
    <div class="app-detail-card">
      <div class="app-detail-row"><div class="k">Package ID</div><div class="v mono">${pkg.id||'—'}</div></div>
      <div class="app-detail-row"><div class="k">Medicine</div><div class="v">${med.name||pkg.medicine||'—'}</div></div>
      <div class="app-detail-row"><div class="k">Batch</div><div class="v mono">${pkg.batch||med.batch||'—'}</div></div>
      <div class="app-detail-row"><div class="k">Manufacturer</div><div class="v">${pkg.manufacturer||med.manufacturer||'—'}</div></div>
      <div class="app-detail-row"><div class="k">Status</div><div class="v">${pkg.status||'—'}</div></div>
      <div class="app-detail-row"><div class="k">Manufactured</div><div class="v">${med.mfg}</div></div>
      <div class="app-detail-row"><div class="k">Expires</div><div class="v">${med.exp}</div></div>
      <div class="app-detail-row"><div class="k">Verification ID</div><div class="v mono">VER-${seq.ver++}</div></div>
    </div>
    <div><span class="chip-verified">${ICONS.check} Supply chain verified</span><span class="chip-verified">${ICONS.check} Ledger verified</span></div>
    <button class="btn btn-dark btn-block" style="margin-top:16px;" onclick="patientNavigateTo('tracechain','${med.batch}')">View full supply chain</button>`;
};
PATIENT_PAGES.suspicious = function(){
  const r = lastScanResult.result;
  const med = r.med;
  const reasons = (r.reasons&&r.reasons.length) ? r.reasons : ['Supply-chain inconsistency detected'];
  return `<div class="result-hero">
      <div class="ric" style="background:var(--amber-light);color:#92620A;">${ICONS.warn}</div>
      <h2>Suspicious Package</h2>
      <p>Identity or supply-chain checks failed. Do not use until investigated.</p>
    </div>
    <div class="app-detail-card">
      <div style="font-size:11px;font-weight:700;color:#92620A;margin-bottom:8px;text-transform:uppercase;">Why flagged</div>
      <div class="reason-list">
        ${reasons.map(x=>`<div class="reason-item">${x}</div>`).join('')}
      </div>
      <p style="font-size:11px;color:var(--muted);margin-top:10px;line-height:1.45;">PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.</p>
    </div>
    <button class="btn btn-red btn-block" style="margin-top:14px;" onclick="patientNavigateTo('reportissue','${med?med.code:''}')">Report package</button>
    <button class="btn btn-outline btn-block" style="margin-top:10px;" onclick="patientNavigateTo('tracechain','${med?med.batch:''}')">View supply chain</button>
    <button class="btn btn-outline btn-block" style="margin-top:10px;" onclick="toast('Connecting to support...')">Contact support</button>`;
};
PATIENT_PAGES.notfound = function(){
  return `<div class="result-hero">
      <div class="ric" style="background:var(--red-light);color:#B91C1C;">${ICONS.x}</div>
      <h2>Package Not Found</h2>
      <p>This Package ID is not registered on PharmaChain. Treat as high risk.</p>
    </div>
    <p style="font-size:11.5px;color:var(--muted);text-align:center;padding:0 12px;line-height:1.45;">PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.</p>
    <button class="btn btn-dark btn-block" style="margin-top:14px;" onclick="patientNavigateTo('scan')">Scan again</button>
    <button class="btn btn-red btn-block" style="margin-top:10px;" onclick="patientNavigateTo('reportissue','')">Report package</button>`;
};
PATIENT_PAGES.reportissue = function(code){
  return breadcrumbApp('Verification result') + `
    <div class="greeting" style="margin-bottom:10px;">Report this medicine</div>
    <form onsubmit="return actionReportCounterfeit(event,'patient')">
      <div class="field"><label>Medicine name</label><input id="patient-cf-medicine" value="${code?findMed_byCode(code)?.name||'':''}" required></div>
      <div class="field"><label>Batch number</label><input id="patient-cf-batch" value="${code?findMed_byCode(code)?.batch||'':''}"></div>
      <div class="field"><label>What's wrong?</label><select id="patient-cf-reason"><option>Batch information mismatch</option><option>Packaging looks different</option><option>Invalid or damaged QR code</option><option>Suspected duplicate sale</option></select></div>
      <button class="btn btn-red btn-block" type="submit">Submit report</button>
    </form>`;
};
function findMed_byCode(code){ return medicines.find(m=>m.code===code); }
PATIENT_PAGES.tracechain = function(batch){
  const steps = supplyChainMap[batch];
  if(!steps) return breadcrumbApp('Back') + `<p style="font-size:12.5px;color:var(--muted);">No supply-chain record available.</p>`;
  return breadcrumbApp('Verification result') + `<div class="greeting" style="margin-bottom:14px;">Supply chain trace</div>` +
    steps.map((s,i)=>`<div class="app-detail-card" style="margin-top:${i===0?0:10}px;">
      <div style="display:flex;justify-content:space-between;align-items:center;"><b style="font-size:13px;">${s.stage}</b>${s.status==='done'?statusBadge('Confirmed'):statusBadge('Pending')}</div>
      <div class="app-detail-row"><div class="k">Organization</div><div class="v">${s.party}</div></div>
      <div class="app-detail-row"><div class="k">Location</div><div class="v">${s.loc}</div></div>
      <div class="app-detail-row"><div class="k">Time</div><div class="v mono" style="font-size:11px;">${s.time}</div></div>
      <div class="app-detail-row"><div class="k">Transaction</div><div class="v mono" style="font-size:11px;">${s.tx}</div></div>
    </div>`).join('') +
    `<button class="btn btn-dark btn-block" style="margin-top:14px;" onclick="patientNavigateTo('ledgerview','${batch}')">View ledger</button>`;
};
PATIENT_PAGES.ledgerview = function(batch){
  const rows = ledger.filter(l=>l.ref.includes(batch));
  return breadcrumbApp('Supply chain') + `<div class="greeting" style="margin-bottom:6px;">Digital ledger</div><div class="greeting-sub">Tamper-evident record for this batch</div>`
    + rows.map(l=>`<div class="app-detail-card" style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;"><b style="font-size:12.5px;" class="mono">${l.tx}</b>${statusBadge(l.status)}</div>
        <div class="app-detail-row"><div class="k">Actor</div><div class="v">${l.actor}</div></div>
        <div class="app-detail-row"><div class="k">Prev record</div><div class="v mono" style="font-size:10.5px;">${l.prev.slice(0,12)}…</div></div>
        <div class="app-detail-row"><div class="k">Current record</div><div class="v mono" style="font-size:10.5px;">${l.curr.slice(0,12)}…</div></div>
      </div>`).join('')
    + `<div class="chip-verified" style="margin-top:14px;">${ICONS.check} Ledger Integrity: VERIFIED</div>`;
};
function breadcrumbApp(label){ return `<div style="display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--teal);font-weight:700;margin-bottom:12px;" onclick="patientNavigateTo('home')">← ${label}</div>`; }

PATIENT_PAGES.medicines = function(){
  const p = currentPatient();
  return `<div class="greeting" style="margin-bottom:14px;">My medicines</div>` + p.entries.map(e=>`
    <div class="med-card"><div style="display:flex;align-items:center;"><div class="mic">${ICONS.capsule}</div><div><div class="mname">${e.medicine}</div><div class="msub">Batch ${e.batch} · ${e.pharmacy}</div></div></div>${statusBadge(e.usage)}</div>
  `).join('');
};
PATIENT_PAGES.history = function(){ return PATIENT_PAGES.reports(); };
PATIENT_PAGES.reports = function(){
  const p = currentPatient();
  const myRx = prescriptions.filter(r=>r.patientId===p.id);
  const verifiedCount = p.entries.length;
  return `
    <div class="greeting" style="margin-bottom:4px;">My Reports</div>
    <div class="greeting-sub">Open a report card — it appears in front of the app</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0;">
      <div class="app-detail-card" style="margin:0;text-align:center;padding:14px 10px;">
        <div style="font-size:22px;font-weight:800;font-family:Manrope,sans-serif;color:var(--navy);">${verifiedCount}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">Medicines logged</div>
      </div>
      <div class="app-detail-card" style="margin:0;text-align:center;padding:14px 10px;">
        <div style="font-size:22px;font-weight:800;font-family:Manrope,sans-serif;color:var(--navy);">${myRx.length}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">Prescriptions</div>
      </div>
      <div class="app-detail-card" style="margin:0;text-align:center;padding:14px 10px;">
        <div style="font-size:22px;font-weight:800;font-family:Manrope,sans-serif;color:#067A55;">${p.entries.filter(e=>e.usage==='Completed').length}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">Completed courses</div>
      </div>
      <div class="app-detail-card" style="margin:0;text-align:center;padding:14px 10px;">
        <div style="font-size:22px;font-weight:800;font-family:Manrope,sans-serif;color:var(--teal);">3</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px;">Verifications</div>
      </div>
    </div>

    <div class="app-section-title">Available reports</div>
    <div class="app-detail-card" style="margin-top:0;cursor:pointer;" onclick="openReport('patient-medicine-history')">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:700;font-size:13.5px;">Medicine history</div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:3px;">Purchases, batches &amp; pharmacies</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openReport('patient-medicine-history')">View</button>
      </div>
    </div>
    <div class="app-detail-card" style="margin-top:8px;cursor:pointer;" onclick="openReport('patient-prescriptions')">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:700;font-size:13.5px;">Prescription summary</div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:3px;">Doctor-issued prescriptions</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openReport('patient-prescriptions')">View</button>
      </div>
    </div>
    <div class="app-detail-card" style="margin-top:8px;cursor:pointer;" onclick="openReport('patient-verifications')">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:700;font-size:13.5px;">Verification log</div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:3px;">QR / package scan outcomes</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openReport('patient-verifications')">View</button>
      </div>
    </div>
    <div class="app-detail-card" style="margin-top:8px;cursor:pointer;" onclick="openReport('patient-safety')">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:700;font-size:13.5px;">Safety &amp; recall alerts</div>
          <div style="font-size:11.5px;color:var(--muted);margin-top:3px;">Recalls and expiry reminders</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();openReport('patient-safety')">View</button>
      </div>
    </div>

    <div class="app-section-title" style="margin-top:20px;">Recent purchases</div>
    ${p.entries.slice(0,4).map(e=>`<div class="app-detail-card" style="margin-top:8px;"><div class="app-detail-row"><div class="k">${e.medicine}</div><div class="v">${statusBadge(e.usage)}</div></div><div class="app-detail-row"><div class="k">Pharmacy</div><div class="v">${e.pharmacy}</div></div><div class="app-detail-row"><div class="k">Date</div><div class="v mono">${e.date}</div></div></div>`).join('') || '<p style="font-size:12px;color:var(--muted);">No purchases yet.</p>'}

    <div class="app-section-title" style="margin-top:22px;">Notifications</div>
    ${notifications.map(n=>`<div class="notif-item"><div class="nic" style="background:${n.type==='danger'?'var(--red-light)':n.type==='success'?'var(--green-light)':'var(--blue-light)'};color:${n.type==='danger'?'#B91C1C':n.type==='success'?'#067A55':'var(--blue)'};">${ICONS[n.type==='danger'?'warn':n.type==='success'?'check':'bell']}</div><div><div class="nt">${n.title}</div><div class="nb">${n.body}</div><div class="nm">${n.time}</div></div></div>`).join('')}
  `;
};
PATIENT_PAGES.profile = function(){
  const p = currentPatient();
  return `<div style="text-align:center;padding:10px 0 20px;"><div class="avatar" style="width:64px;height:64px;font-size:20px;margin:0 auto 10px;">${p.masked.split(' ').map(w=>w[0]).join('')}</div><h3 style="font-size:16px;">${p.masked}</h3><div style="font-size:11.5px;color:var(--muted);">${p.id} · ${p.city}</div></div>
    <div class="app-detail-card">
      <div class="profile-row">${ICONS.user} Personal information</div>
      <div class="profile-row">${ICONS.bell} Notification settings</div>
      <div class="profile-row">${ICONS.heart} Linked doctors</div>
      <div class="profile-row" onclick="patientNavigateTo('reports')">${ICONS.clipboard} My reports</div>
      <div class="profile-row">${ICONS.info} Privacy & data sharing</div>
      <div class="profile-row" onclick="doLogout()">${ICONS.logout} Sign out</div>
    </div>`;
};



/* Hero particles */
(function(){
  function initParticles(){
    var box = document.getElementById('hero-particles');
    if(!box) return;
    box.innerHTML = '';
    for(var i=0;i<28;i++){
      var s = document.createElement('span');
      s.style.left = (Math.random()*100)+'%';
      s.style.bottom = (-10 - Math.random()*20)+'%';
      s.style.animationDuration = (8 + Math.random()*12)+'s';
      s.style.animationDelay = (Math.random()*8)+'s';
      s.style.width = s.style.height = (2 + Math.random()*3)+'px';
      box.appendChild(s);
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initParticles);
  else initParticles();
})();
/* Load persisted demo state so inventory/sales/packages survive navigation & refresh */
try{ if(typeof loadPersistedState==='function') loadPersistedState(); }catch(e){}
/* Ensure pharmacy stock has enough package records for POS (demo helper) */
(function ensurePharmacyPackages(){
  pharmacyStock.forEach(s=>{
    const atPharm = packages.filter(p=>p.batch===s.batch && p.location===s.pharmacy && (p.status==='WITH_PHARMACY'||p.status==='In Stock'));
    const need = Math.min(Number(s.qty||0), 80) - atPharm.length;
    if(need > 0){
      for(let i=0;i<need;i++){
        const id = genPackageId();
        packages.push({id, productId:s.batch, batch:s.batch, medicine:s.medicine, manufacturer:s.manufacturer, qty:1, status:'WITH_PHARMACY', location:s.pharmacy, exp:s.exp, qr:'QR-'+id});
        if(!s.packages) s.packages=[];
        s.packages.push(id);
      }
    }
  });
})();
window.resetPharmaChainDemo = function(){
  localStorage.removeItem('pharmachain_demo_v1');
  location.reload();
};


/* Smooth nav scroll + back to top */
(function(){
  function smoothTo(id){
    var el = document.getElementById(id);
    if(!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href === '#') return;
    var id = href.slice(1);
    if(!document.getElementById(id)) return;
    e.preventDefault();
    smoothTo(id);
  });
  var btn = document.getElementById('back-to-top');
  if(btn){
    window.addEventListener('scroll', function(){
      if(window.pageYOffset > 400) btn.classList.add('show');
      else btn.classList.remove('show');
    }, { passive: true });
    btn.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* Landing → App bridge */
function enterApp(){
  window.location.assign('/admin');
}
function backToLanding(){
  document.getElementById('desktop-shell').style.display='none';
  document.getElementById('patient-app-wrap').style.display='none';
    document.getElementById('screen-role-select').style.display='none';
  document.getElementById('screen-login').style.display='none';
  document.getElementById('screen-otp').style.display='none';
  const su=document.getElementById('screen-signup'); if(su) su.style.display='none';
  const fg=document.getElementById('screen-forgot'); if(fg) fg.style.display='none';
  document.getElementById('landing-page').classList.remove('hidden');
  document.body.style.overflow = 'auto';
  window.history.replaceState({}, '', '/');
  window.scrollTo(0,0);
}

