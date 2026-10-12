/* ============================================================
   VERIFICATION ENGINE — package identity + supply-chain consistency
   QR identifies a unique PACKAGE. A pass does NOT scientifically
   prove the physical contents are genuine chemical medicine.
   ============================================================ */
let verificationScans = []; // for duplicate / reuse detection

function normalizeVerifyCode(raw){
  return String(raw||'').trim().toUpperCase().replace(/^QR-/,'').replace(/\s+/g,'');
}
function resolvePackage(code){
  const c = normalizeVerifyCode(code);
  if(!c) return null;
  // Accept package id, QR-id, or legacy medicine code → map to a package on that batch
  let pkg = packages.find(p=> normalizeVerifyCode(p.id)===c || normalizeVerifyCode(p.qr)===c);
  if(pkg) return pkg;
  const med = medicines.find(m=> normalizeVerifyCode(m.code)===c || normalizeVerifyCode(m.batch)===c);
  if(med){
    // Prefer In Stock package at current pharmacy, else any package on batch
    pkg = packages.find(p=>p.batch===med.batch && p.status==='In Stock' && (currentPortal==='pharmacy'? p.location===CTX.pharmacy : true))
      || packages.find(p=>p.batch===med.batch);
  }
  return pkg || null;
}
function lookupVerification(code){
  const input = normalizeVerifyCode(code);
  const checks = [];
  const fail = (id, label, ok, detail)=>({id, label, ok, detail});
  // NOT FOUND — package ID does not exist (and no resolvable product code)
  const pkg = resolvePackage(input);
  if(!pkg){
    return {
      state:'notfound', med:null, pkg:null, input,
      checks:[fail('exists','Package ID exists', false, 'No package record for code '+input)],
      reasons:['Package ID does not exist in the network'],
      disclaimer:'PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.'
    };
  }
  const med = medicines.find(m=>m.batch===pkg.batch) || {name:pkg.medicine, batch:pkg.batch, manufacturer:pkg.manufacturer, vendor:'—', pharmacy:'—', status:'—', exp:pkg.exp, code:'—'};
  const chain = supplyChainMap[pkg.batch] || [];
  const ship = shipments.find(s=>(s.packages||[]).includes(pkg.id));
  const scanHits = verificationScans.filter(s=>s.packageId===pkg.id);
  const reasons = [];

  // 1 Product exists
  const productOk = !!(med && med.name);
  checks.push(fail('product','Product exists', productOk, productOk? med.name : 'No product linked'));
  if(!productOk) reasons.push('Product record missing for this package');

  // 2 Manufacturer matches
  const mfgOk = !!(pkg.manufacturer && med.manufacturer && pkg.manufacturer===med.manufacturer);
  checks.push(fail('mfg','Manufacturer matches', mfgOk, pkg.manufacturer||'—'));
  if(!mfgOk) reasons.push('Manufacturer on package does not match product record');

  // 3 Batch exists
  const batchOk = !!medicines.find(m=>m.batch===pkg.batch);
  checks.push(fail('batch','Batch exists', batchOk, pkg.batch));
  if(!batchOk) reasons.push('Batch number is not registered');

  // 4 Package ID exists (true if we resolved it)
  checks.push(fail('pkg','Package ID exists', true, pkg.id));

  // 5 Package belongs to correct batch
  const batchMatch = pkg.batch && med.batch===pkg.batch;
  checks.push(fail('pkgbatch','Package belongs to batch', batchMatch, pkg.batch));
  if(!batchMatch) reasons.push('Package is not linked to the expected batch');

  // 6 Authorized vendor / supplier
  const vendorName = (ship && (ship.vendor||ship.from)) || med.vendor;
  const vendorOk = vendorName && vendorName!=='—' && vendors.some(v=>v.name===vendorName && v.status==='Approved');
  checks.push(fail('vendor','Authorized vendor/supplier', !!vendorOk, vendorName||'None'));
  if(!vendorOk) reasons.push('No authorized vendor on the supply route');

  // 7 Supply-chain history valid
  const chainOk = !pkg.chainBroken && chain.length>=1 && chain.some(s=>s.stage==='Manufacturer'||s.stage==='Vendor'||s.stage==='Pharmacy');
  const chainBroken = !!pkg.chainBroken || med.status==='Recalled';
  checks.push(fail('chain','Supply-chain history valid', chainOk && !chainBroken && med.status!=='Recalled', chainOk? chain.length+' stages recorded' : 'Inconsistent or incomplete chain'));
  if(pkg.chainBroken) reasons.push('Supply-chain history is inconsistent');
  if(!chainOk && !pkg.chainBroken) reasons.push('Supply-chain history is incomplete or missing');
  if(med.status==='Recalled') reasons.push('Batch has been recalled by the manufacturer');

  // 8 Package supplied to expected pharmacy (when checking at pharmacy portal)
  let pharmacyOk = true;
  if(currentPortal==='pharmacy' && CTX.pharmacy){
    pharmacyOk = pkg.location===CTX.pharmacy || pkg.status==='IN_TRANSIT' || pkg.status==='In Transit' || (ship && ship.to===CTX.pharmacy);
    if((pkg.status==='WITH_PHARMACY'||pkg.status==='In Stock') && pkg.location && pkg.location!==CTX.pharmacy && pharmacies.some(p=>p.name===pkg.location)){
      pharmacyOk = false;
    }
  }
  if(pkg.location==='Unknown Clinic') pharmacyOk = false;
  checks.push(fail('pharmacy','Expected pharmacy / location', pharmacyOk, pkg.location||'—'));
  if(!pharmacyOk) reasons.push('Package location does not match the expected pharmacy / supply route');

  // 9 Not already sold / used / reported / blocked
  const sold = pkg.status==='SOLD' || pkg.status==='Sold' || sales.some(s=>s.packageId===pkg.id || (s.packageIds||[]).includes(pkg.id));
  const reported = pkg.status==='REPORTED' || counterfeitReports.some(c=>c.batch===pkg.batch && (c.status==='Under Investigation'||c.status==='Confirmed Counterfeit'));
  const blocked = pkg.status==='BLOCKED' || pkg.status==='Blocked' || med.status==='Recalled';
  const availableOk = !sold && !blocked;
  checks.push(fail('status','Package not sold/used/blocked', availableOk, pkg.status+(reported?' · reported':'')));
  if(sold) reasons.push('This package identity has already been recorded as sold. Possible duplicate or reused package identity.');
  if(blocked) reasons.push('Package or batch is blocked / recalled');
  if(reported && !sold) reasons.push('Batch linked to an open counterfeit report');

  // 10 No suspicious duplicate / reuse activity
  const dup = scanHits.length >= 2;
  const multiCity = scanHits.length>=2 && new Set(scanHits.map(s=>s.location)).size>1;
  checks.push(fail('reuse','No duplicate / reuse activity', !dup && !multiCity, scanHits.length? scanHits.length+' prior scans' : 'First scan'));
  if(dup) reasons.push('Duplicate or reused package scan activity detected');
  if(multiCity) reasons.push('Same package scanned from multiple locations');

  // Extra: status Suspicious on medicine
  if(med.status==='Suspicious') reasons.push('Product already flagged as suspicious in the network');

  // Log this scan (for subsequent reuse detection)
  verificationScans.push({packageId:pkg.id, code:input, time:nowStr(), location: currentPortal==='pharmacy'?CTX.pharmacy:(currentPortal==='patient'?'Patient app':'Network'), result:null});

  const failed = checks.filter(c=>!c.ok);
  let state = 'verified';
  if(failed.length) state = 'suspicious';
  // Hard not-found only when package missing — already returned
  if(med.status==='Suspicious' || sold || multiCity || reported) state = 'suspicious';

  verificationScans[verificationScans.length-1].result = state;

  return {
    state, med, pkg, input, checks, reasons,
    vendorName, chain,
    disclaimer:'PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.'
  };
}
function verificationBannerHtml(result, code){
  const {state} = result;
  const cfg = {
    verified:{
      banner:'banner-green', icon:ICONS.check, iconColor:'#067A55',
      title:'VERIFIED — Package identity consistent',
      msg:'Package ID, batch, manufacturer and supply-chain records match. No blocking flags on this scan.'
    },
    suspicious:{
      banner:'banner-amber', icon:ICONS.warn, iconColor:'#92620A',
      title:'SUSPICIOUS — Review required',
      msg:'One or more identity or supply-chain checks failed. Do not dispense until investigated.'
    },
    notfound:{
      banner:'banner-red', icon:ICONS.x, iconColor:'#B91C1C',
      title:'NOT FOUND — Unknown package',
      msg:'This Package ID is not registered on PharmaChain. Treat as high risk.'
    },
  }[state];
  return `<div class="result-banner ${cfg.banner}">
      <div class="ric" style="color:${cfg.iconColor}">${cfg.icon}</div>
      <div>
        <h3 style="color:${cfg.iconColor}">${cfg.title}</h3>
        <p style="color:${cfg.iconColor}">${cfg.msg}</p>
        <p style="margin-top:8px;font-size:12px;opacity:.9;max-width:640px;">${result.disclaimer||'PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.'}</p>
      </div>
    </div>`;
}
function verificationChecksHtml(result){
  if(!result.checks||!result.checks.length) return '';
  return `<div style="display:grid;gap:8px;margin-top:4px;">
    ${result.checks.map(c=>`
      <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:${c.ok?'#F0FDF4':'#FFFBEB'};border:1px solid ${c.ok?'#BBF7D0':'#FDE68A'};">
        <div style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${c.ok?'var(--green-light)':'var(--amber-light)'};color:${c.ok?'#067A55':'#92620A'};flex-shrink:0;">${c.ok?ICONS.check:ICONS.warn}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:700;">${c.label}</div>
          <div style="font-size:11.5px;color:var(--muted);font-family:var(--mono);">${c.detail||''}</div>
        </div>
        <span class="badge ${c.ok?'badge-green':'badge-amber'}">${c.ok?'Pass':'Flag'}</span>
      </div>`).join('')}
  </div>`;
}
function verificationDetailGrid(result, code){
  const {med, pkg, reasons, state} = result;
  if(state==='notfound' || !pkg){
    return `<div class="detail-grid">
      <div class="detail-item"><div class="k">Code entered</div><div class="v mono">${code}</div></div>
      <div class="detail-item"><div class="k">Package match</div><div class="v">None</div></div>
      <div class="detail-item"><div class="k">Recommendation</div><div class="v">Do not dispense · report if physical product present</div></div>
    </div>
    <p style="font-size:12.5px;color:var(--muted);margin-top:12px;line-height:1.55;">PharmaChain verifies package identity and supply-chain consistency and flags suspicious records. A missing package ID does not by itself prove chemical composition — it means this unit is not on the network ledger.</p>`;
  }
  const reasonBlock = (reasons&&reasons.length)
    ? `<div style="margin-top:14px;padding:14px;border-radius:12px;background:#FFFBEB;border:1px solid #FDE68A;">
        <div style="font-size:12px;font-weight:800;color:#92620A;margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px;">Why this is SUSPICIOUS</div>
        <ul style="margin:0 0 0 18px;font-size:13px;color:#92400E;line-height:1.7;">
          ${reasons.map(r=>`<li>${r}</li>`).join('')}
        </ul>
      </div>` : '';
  return `<div class="detail-grid">
      <div class="detail-item"><div class="k">Package ID</div><div class="v mono">${pkg.id}</div></div>
      <div class="detail-item"><div class="k">Product</div><div class="v">${med.name||pkg.medicine}</div></div>
      <div class="detail-item"><div class="k">Batch</div><div class="v mono">${pkg.batch}</div></div>
      <div class="detail-item"><div class="k">Manufacturer</div><div class="v">${pkg.manufacturer||med.manufacturer}</div></div>
      <div class="detail-item"><div class="k">Package status</div><div class="v">${statusBadge(pkg.status)}</div></div>
      <div class="detail-item"><div class="k">Recorded location</div><div class="v">${pkg.location||'—'}</div></div>
      <div class="detail-item"><div class="k">Expiry</div><div class="v mono">${pkg.exp||med.exp||'—'}</div></div>
      <div class="detail-item"><div class="k">Network product status</div><div class="v">${statusBadge(med.status||'—')}</div></div>
    </div>
    ${reasonBlock}
    <p style="font-size:12px;color:var(--muted);margin-top:14px;line-height:1.55;padding:12px;background:#F8FAFC;border-radius:10px;border:1px solid var(--border);">
      <b>Important:</b> PharmaChain verifies package identity and supply-chain consistency and flags suspicious records. A VERIFIED result does not scientifically prove the physical chemical composition of the medicine.
    </p>`;
}

