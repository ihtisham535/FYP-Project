/* ============================================================
   CORE WORKFLOW ACTIONS (mutate shared data, ripple across portals)
   ============================================================ */
function genPackageId(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s='PKG-';
  for(let i=0;i<6;i++) s+=chars[Math.floor(Math.random()*chars.length)];
  // ensure unique
  if(packages.some(p=>p.id===s)) return genPackageId();
  return s;
}
function generatePackagesForBatch({batch, medicine, manufacturer, productId, exp, qty, location, status}){
  const n = Math.max(1, Math.min(Number(qty)||1, 5000)); // hard cap for browser safety
  const ids = [];
  for(let i=0;i<n;i++){
    const id = genPackageId();
    packages.push({
      id, productId: productId||('MED-'+batch), batch, medicine, manufacturer,
      qty:1, status: status||'CREATED', location: location||manufacturer,
      exp, qr:'QR-'+id
    });
    ids.push(id);
  }
  return ids;
}
function packagesAvailable(batch, location, statuses){
  const st = statuses || ['CREATED','At Manufacturer','WITH_DISTRIBUTOR','WITH_PHARMACY','In Stock'];
  return packages.filter(p=>p.batch===batch && st.includes(p.status) && (!location || p.location===location));
}
function persistState(){
  try{
    localStorage.setItem('pharmachain_demo_v1', JSON.stringify({
      medicines, packages, shipments, pharmacyStock, sales, ledger, authorizedVendors, supplyChainMap,
      patients, pharmacies, verificationScans, counterfeitReports, seq, CTX,
      pharmacyEmployees, employeeAuditLog, empSeq, currentEmployeeId: currentEmployee?currentEmployee.id:null, subRequests
    }));
  }catch(e){ /* quota */ }
}
function loadPersistedState(){
  try{
    const raw = localStorage.getItem('pharmachain_demo_v1');
    if(!raw) return false;
    const d = JSON.parse(raw);
    if(d.medicines) medicines = d.medicines;
    if(d.packages) packages = d.packages;
    if(d.shipments) shipments = d.shipments;
    if(d.pharmacyStock) pharmacyStock = d.pharmacyStock;
    if(d.sales) sales = d.sales;
    if(d.ledger) ledger = d.ledger;
    if(d.authorizedVendors) authorizedVendors = d.authorizedVendors;
    if(d.supplyChainMap) Object.assign(supplyChainMap, d.supplyChainMap);
    if(d.patients) patients = d.patients;
    if(d.pharmacies) pharmacies = d.pharmacies;
    if(d.verificationScans) verificationScans = d.verificationScans;
    if(d.counterfeitReports) counterfeitReports = d.counterfeitReports;
    if(d.seq) Object.assign(seq, d.seq);
    if(d.CTX) Object.assign(CTX, d.CTX);
    if(d.pharmacyEmployees) pharmacyEmployees = d.pharmacyEmployees;
    if(d.employeeAuditLog) employeeAuditLog = d.employeeAuditLog;
    if(d.empSeq) empSeq = d.empSeq;
    if(d.subRequests) subRequests = d.subRequests;
    // migrate legacy Professional plan on load
    if(Array.isArray(pharmacies)){
      pharmacies.forEach(function(ph){
        if(ph.plan==='Professional') ph.plan='Premium';
        if(ph.plan==='Free Trial') ph.plan='Trial';
        if(typeof ensurePharmacyLocationFields==='function') ensurePharmacyLocationFields(ph);
        // Refresh demo Active Premium/Basic pharmacies whose seed expiry has passed
        if((ph.name==='MediCare Pharmacy' || ph.name==='Prime Health Pharmacy' || ph.name==='Rahman Pharmacy') &&
           (ph.subStatus==='Expired' || (ph.expiryDate && ph.expiryDate < '2026-10-13'))){
          if(normalizePlan(ph.plan)==='Premium' || normalizePlan(ph.plan)==='Basic'){
            ph.subStatus = 'Active';
            ph.sub = 'Active';
            if(!ph.expiryDate || ph.expiryDate < '2027-01-01') ph.expiryDate = '2027-12-31';
            if(!ph.startDate || ph.startDate > ph.expiryDate) ph.startDate = '2026-01-01';
          }
        }
      });
    }
    if(d.currentEmployeeId && typeof getEmployeeById==='function'){
      currentEmployee = getEmployeeById(d.currentEmployeeId) || null;
    }
    return true;
  }catch(e){ return false; }
}

function actionCreateMedicine(e){
  e.preventDefault();
  const name = fv('mfg-med-name'), generic = fv('mfg-med-generic'), category = fv('mfg-med-category'),
        strength = fv('mfg-med-strength'), form = fv('mfg-med-form'), mfgDate = fv('mfg-med-mfgdate'),
        exp = fv('mfg-med-expdate'), qty = parseInt(fv('mfg-med-qty')||'0',10), storage = fv('mfg-med-storage');
  if(!name || !mfgDate || !exp){ toast('Please fill in the required fields'); return false; }
  if(!qty || qty<1){ toast('Quantity must be at least 1'); return false; }
  const batch = 'BATCH-2026-'+ String(100+medicines.length).padStart(3,'0');
  const code = 'MED-'+ String(1000+medicines.length);
  medicines.unshift({name, generic, category, strength, form, batch, manufacturer:CTX.manufacturer, vendor:'—', pharmacy:'—', mfg:mfgDate, exp, qty:qty||0, storage, status:'Verified', code, productId:code});
  // Generate unique random package IDs — one per unit
  const ids = generatePackagesForBatch({
    batch, medicine:name, manufacturer:CTX.manufacturer, productId:code, exp, qty,
    location:CTX.manufacturer, status:'CREATED'
  });
  if(!supplyChainMap[batch]) supplyChainMap[batch]=[];
  supplyChainMap[batch].push({stage:'Manufacturer', party:CTX.manufacturer, loc:CTX.manufacturer, time:nowStr(), qty, tx:'TX-'+seq.tx, status:'done'});
  ledger.unshift({tx:'TX-'+(seq.tx++), ref:`${name} / ${batch} / BATCH_CREATED`, prev: ledger[0]?ledger[0].curr:'0000000000000000', curr:randHash(), time:nowStr(), actor:`${CTX.manufacturer} (Manufacturer)`, status:'Confirmed'});
  persistState();
  toast(`Batch ${batch} created · ${ids.length} unique packages generated`);
  e.target.reset();
  navigateTo('manufacturer','qrcodes');
  MFG_LAST_BATCH = batch;
  return false;
}
let MFG_LAST_BATCH = null;
function randHash(){ let s=''; const chars='0123456789abcdef'; for(let i=0;i<16;i++) s+=chars[Math.floor(Math.random()*16)]; return s; }
function nowStr(){ const d=new Date(); return d.toISOString().slice(0,16).replace('T',' '); }
function fv(id){ const el=document.getElementById(id); return el? el.value.trim() : ''; }

function actionCreateShipment(e, fromRole){
  e.preventDefault();
  const batch = fv(fromRole+'-ship-batch'), toParty = fv(fromRole+'-ship-to'), qty = parseInt(fv(fromRole+'-ship-qty')||'0',10);
  const expected = fv(fromRole+'-ship-eta') || '';
  const med = findMed(batch);
  if(!med || !toParty || !qty){ toast('Please complete the shipment form'); return false; }
  const from = fromRole==='manufacturer' ? CTX.manufacturer : CTX.vendor;
  if(fromRole==='manufacturer'){
    const auth = authorizedVendors[CTX.manufacturer] || [];
    if(auth.length && !auth.includes(toParty)){ toast(toParty+' is not authorized. Authorize this vendor first.'); navigateTo('manufacturer','vendors'); return false; }
  }
  // Allocate existing packages from current owner — do NOT invent new package IDs
  const needStatuses = fromRole==='manufacturer'
    ? ['CREATED','At Manufacturer']
    : ['WITH_DISTRIBUTOR','In Stock','CREATED'];
  let available = packagesAvailable(batch, from, needStatuses);
  // Fallback: any packages at manufacturer still CREATED
  if(available.length < qty && fromRole==='manufacturer'){
    available = packages.filter(p=>p.batch===batch && (p.status==='CREATED'||p.status==='At Manufacturer'));
  }
  if(available.length < qty){
    toast(`Not enough packages available at ${from}. Available: ${available.length}, requested: ${qty}`);
    return false;
  }
  const allocated = available.slice(0, qty);
  const pkgIds = allocated.map(p=>p.id);
  const today = new Date().toISOString().slice(0,10);
  const shipId = 'SHP-2026-'+ String(seq.shp++).padStart(3,'0');
  allocated.forEach(pk=>{
    pk.status = 'IN_TRANSIT';
    pk.location = 'Shipment '+shipId;
  });
  // Dispatch ≠ receive
  shipments.unshift({
    id: shipId, medicine: med.name, product: med.name, batch, from, to: toParty,
    vendor: fromRole==='vendor' ? from : (fromRole==='manufacturer' ? toParty : '—'),
    pharmacy: fromRole==='vendor' ? toParty : '—',
    qty, dispatchDate: today, expectedDate: expected||today, date: today,
    status: 'Dispatched', type: fromRole==='manufacturer'?'mfg-to-vendor':'vendor-to-pharmacy',
    packages: pkgIds
  });
  ledger.unshift({tx:'TX-'+(seq.tx++), ref:`${med.name} / ${batch} / ${shipId}`, prev: ledger[0]?ledger[0].curr:'0000000000000000', curr:randHash(), time:nowStr(), actor:`${from} (SHIPMENT_DISPATCHED)`, status:'Confirmed'});
  if(!supplyChainMap[batch]) supplyChainMap[batch]=[];
  supplyChainMap[batch].push({stage:'Dispatched', party:from+' → '+toParty, loc:'In transit', time:nowStr(), qty, tx:'TX-'+(seq.tx-1), status:''});
  persistState();
  toast(`Shipment ${shipId} dispatched: ${med.name} × ${qty} → ${toParty}`);
  e.target.reset();
  navigateTo(fromRole, fromRole==='manufacturer'?'shipments':'outgoing');
  return false;
}
function actionDispatchShipment(shipId){
  const s = shipments.find(x=>x.id===shipId);
  if(!s) return;
  const flow = ['Prepared','Dispatched','In Transit','Received','Confirmed'];
  const idx = flow.indexOf(s.status);
  if(idx>=0 && idx < flow.length-2){ // stop before Received/Confirmed — those need Confirm receipt
    s.status = flow[idx+1];
  } else if(s.status==='Prepared'){ s.status='Dispatched'; }
  else if(s.status==='Dispatched'){ s.status='In Transit'; }
  (s.packages||[]).forEach(pid=>{ const pk=packages.find(x=>x.id===pid); if(pk) pk.status=s.status; });
  ledger.unshift({tx:'TX-'+(seq.tx++), ref:`${s.medicine} / ${s.batch} / ${s.id}`, prev: ledger[0]?ledger[0].curr:'0000000000000000', curr:randHash(), time:nowStr(), actor:`${s.from} → ${s.status}`, status:'Confirmed'});
  toast(`Shipment ${s.id} marked ${s.status}`);
  navigateTo(currentPortal, currentPage);
}
function actionAuthorizeVendor(vendorName){
  if(!authorizedVendors[CTX.manufacturer]) authorizedVendors[CTX.manufacturer]=[];
  if(!authorizedVendors[CTX.manufacturer].includes(vendorName)){
    authorizedVendors[CTX.manufacturer].push(vendorName);
    toast(vendorName+' authorized for '+CTX.manufacturer);
  } else toast(vendorName+' is already authorized');
  navigateTo('manufacturer','vendors');
}
function actionConfirmReceipt(shipId, portal, page){
  const s = shipments.find(x=>x.id===shipId);
  if(!s){ toast('Shipment not found'); return; }
  if(s.status==='Confirmed' || s.status==='Received'){ toast('Shipment already confirmed'); return; }
  if(!['Dispatched','In Transit','Prepared','Received'].includes(s.status) && s.status!=='Dispatched'){
    // allow confirm from Dispatched / In Transit
  }
  const isPharmacy = s.type==='vendor-to-pharmacy' || pharmacies.some(p=>p.name===s.to);
  const isVendor = s.type==='mfg-to-vendor' || vendors.some(v=>v.name===s.to);
  s.status = 'Confirmed';
  (s.packages||[]).forEach(pid=>{
    const pk = packages.find(x=>x.id===pid);
    if(pk){
      if(isPharmacy){ pk.status='WITH_PHARMACY'; pk.location=s.to; }
      else if(isVendor){ pk.status='WITH_DISTRIBUTOR'; pk.location=s.to; }
      else { pk.status='In Stock'; pk.location=s.to; }
    }
  });
  // Pharmacy confirmation → inventory increase (vendor dispatch alone does NOT)
  if(isPharmacy){
    let stock = pharmacyStock.find(x=>x.pharmacy===s.to && x.batch===s.batch);
    if(stock){
      stock.qty = Number(stock.qty)+Number(s.qty);
      stock.packages = (stock.packages||[]).concat(s.packages||[]);
    } else {
      const med = findMed(s.batch) || {name:s.medicine, manufacturer:'—', exp:'—', mfg:'—'};
      pharmacyStock.push({
        pharmacy:s.to, medicine:s.medicine||s.product, batch:s.batch,
        manufacturer: med.manufacturer||'—', vendor: s.vendor||s.from,
        qty:Number(s.qty), exp:med.exp||'—', mfg:med.mfg||'—', unitPrice: med.unitPrice||85,
        packages:(s.packages||[]).slice(), status:'Verified'
      });
    }
    const medRow = medicines.find(m=>m.batch===s.batch && m.pharmacy===s.to);
    if(medRow) medRow.qty = Number(medRow.qty)+Number(s.qty);
    else {
      const base = findMed(s.batch);
      if(base){ medicines.unshift(Object.assign({}, base, {pharmacy:s.to, vendor:s.vendor||s.from, qty:Number(s.qty)})); }
    }
  }
  if(s.type==='mfg-to-vendor'){
    const base = findMed(s.batch);
    if(base && (base.vendor==='—' || !base.vendor)) base.vendor = s.to;
  }
  if(!supplyChainMap[s.batch]) supplyChainMap[s.batch]=[];
  const stage = isPharmacy ? 'Pharmacy' : 'Vendor';
  supplyChainMap[s.batch].push({stage, party:s.to, loc:s.to, time:nowStr(), qty:s.qty, tx:'TX-'+seq.tx, status:'done'});
  ledger.unshift({tx:'TX-'+(seq.tx++), ref:`${s.medicine} / ${s.batch} / ${s.id} / RECEIVED`, prev: ledger[0]?ledger[0].curr:'0000000000000000', curr:randHash(), time:nowStr(), actor:`${s.to} (${isPharmacy?'PHARMACY_RECEIVED':'DISTRIBUTOR_RECEIVED'})`, status:'Confirmed'});
  persistState();
  toast(`Receipt confirmed · ${s.medicine} × ${s.qty} at ${s.to}${isPharmacy?' · inventory updated':''}`);
  navigateTo(portal, page);
}
function actionViewShipment(shipId){
  const s = shipments.find(x=>x.id===shipId);
  if(!s){ toast('Shipment not found'); return; }
  const pkgRows = (s.packages||[]).slice(0,12).map(pid=>{
    const pk=packages.find(x=>x.id===pid);
    return pk ? `<tr><td class="mono">${pk.id}</td><td>${qrMini(pk.qr||pk.id)}</td><td>${statusBadge(pk.status)}</td><td>${pk.location}</td></tr>` : `<tr><td class="mono">${pid}</td><td>—</td><td>—</td><td>—</td></tr>`;
  }).join('') || '<tr><td colspan="4" style="color:var(--muted)">No packages linked</td></tr>';
  const more = (s.packages||[]).length > 12 ? `<p style="font-size:12px;color:var(--muted);margin-top:8px;">Showing 12 of ${(s.packages||[]).length} packages</p>` : '';
  const existing = document.getElementById('shipment-viewer-overlay');
  if(existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'shipment-viewer-overlay';
  overlay.className = 'receipt-overlay';
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="receipt-modal" style="max-width:640px;width:100%;" role="dialog">
      <div class="receipt-modal-actions">
        <span style="margin-right:auto;font-weight:800;font-size:14px;color:var(--navy);">Shipment ${s.id}</span>
        <button class="btn btn-dark btn-sm" type="button" onclick="document.getElementById('shipment-viewer-overlay').remove()">Close</button>
      </div>
      <div style="padding:18px 22px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
          <div>
            <div style="font-size:15px;font-weight:800;">${s.product||s.medicine}</div>
            <div style="font-size:12.5px;color:var(--muted);margin-top:3px;">Batch <span class="mono">${s.batch}</span></div>
          </div>
          ${statusBadge(s.status)}
        </div>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><div class="k">From</div><div class="v">${s.from}</div></div>
          <div class="detail-item"><div class="k">To</div><div class="v">${s.to}</div></div>
          <div class="detail-item"><div class="k">Quantity</div><div class="v">${s.qty}</div></div>
          <div class="detail-item"><div class="k">Dispatch</div><div class="v mono">${s.dispatchDate||s.date}</div></div>
          <div class="detail-item"><div class="k">Expected</div><div class="v mono">${s.expectedDate||'—'}</div></div>
          <div class="detail-item"><div class="k">Type</div><div class="v">${s.type||'—'}</div></div>
        </div>
        <h4 style="font-size:13px;margin-bottom:8px;">Package IDs &amp; QR</h4>
        <div class="table-wrap"><table><thead><tr><th>Package ID</th><th>QR</th><th>Status</th><th>Location</th></tr></thead><tbody>${pkgRows}</tbody></table></div>
        ${more}
        ${s.status!=='Confirmed' && s.status!=='Recalled' ? `<div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" type="button" onclick="actionDispatchShipment('${s.id}');document.getElementById('shipment-viewer-overlay').remove();">Advance status</button>
          <button class="btn btn-primary btn-sm" type="button" onclick="document.getElementById('shipment-viewer-overlay').remove();actionConfirmReceipt('${s.id}', currentPortal, currentPage);">Confirm receipt</button>
        </div>` : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
let lastReceipt = null;
let posCart = [];
let posHeldCart = null;
let posDiscountPct = 0;
let posPayMethod = 'Cash';
let posFilterCat = 'All';
let posSearchTerm = '';

function posStockStatus(s){
  const qty = Number(s.qty||0);
  const exp = s.exp||'2099-01-01';
  const today = new Date().toISOString().slice(0,10);
  const days = Math.round((new Date(exp+'T00:00:00')-new Date(today+'T00:00:00'))/86400000);
  if(qty<=0) return {key:'out', label:'Out of Stock', cls:'inv-status-out'};
  if(days < 0) return {key:'expired', label:'Expired', cls:'inv-status-expired'};
  if(days <= 60) return {key:'exp', label:'Expiring Soon', cls:'inv-status-exp'};
  if(qty <= 20) return {key:'low', label:'Low Stock', cls:'inv-status-low'};
  return {key:'in', label:'In Stock', cls:'inv-status-in'};
}
function posCartSubtotal(){ return posCart.reduce((a,i)=>a+i.unitPrice*i.qty,0); }
function posCartDiscount(){ return Math.round(posCartSubtotal() * (posDiscountPct/100)); }
function posCartTotal(){ return Math.max(0, posCartSubtotal() - posCartDiscount()); }
function posAddToCart(batch){
  const stock = pharmacyStock.find(x=>x.pharmacy===CTX.pharmacy && x.batch===batch);
  if(!stock || Number(stock.qty)<=0){ toast('Out of stock'); return; }
  const existing = posCart.find(i=>i.batch===batch);
  const inCart = existing ? existing.qty : 0;
  if(inCart+1 > Number(stock.qty)){ toast('Only '+stock.qty+' available'); return; }
  const med = findMed(batch) || {};
  if(existing) existing.qty += 1;
  else posCart.push({
    batch, medicine:stock.medicine, generic:med.generic||stock.medicine,
    manufacturer:stock.manufacturer, exp:stock.exp, unitPrice:Number(stock.unitPrice||85),
    qty:1, category:med.category||'—'
  });
  posRenderCart();
  toast(stock.medicine+' added to cart');
}
function posSetQty(batch, delta){
  const item = posCart.find(i=>i.batch===batch);
  if(!item) return;
  const stock = pharmacyStock.find(x=>x.pharmacy===CTX.pharmacy && x.batch===batch);
  const max = stock ? Number(stock.qty) : item.qty;
  item.qty = Math.max(0, Math.min(max, item.qty + delta));
  if(item.qty===0) posCart = posCart.filter(i=>i.batch!==batch);
  posRenderCart();
}
function posRemoveItem(batch){ posCart = posCart.filter(i=>i.batch!==batch); posRenderCart(); }
function posClearCart(){ posCart=[]; posDiscountPct=0; posRenderCart(); }
function posHoldSale(){
  if(!posCart.length){ toast('Cart is empty'); return; }
  posHeldCart = JSON.parse(JSON.stringify(posCart));
  posCart = [];
  posRenderCart();
  toast('Sale held — resume anytime');
}
function posResumeSale(){
  if(!posHeldCart || !posHeldCart.length){ toast('No held sale'); return; }
  posCart = posHeldCart; posHeldCart = null;
  posRenderCart();
  toast('Held sale restored');
}
function posRenderCart(){
  const host = document.getElementById('pos-cart-body');
  if(!host) return;
  if(!posCart.length){
    host.innerHTML = `<div style="padding:28px 12px;text-align:center;color:var(--muted);font-size:13px;">Cart is empty.<br>Select medicines from the left panel.</div>`;
  } else {
    host.innerHTML = posCart.map(i=>`
      <div class="pos-cart-row">
        <div>
          <div style="font-weight:700;">${i.medicine}</div>
          <div style="font-size:11px;color:var(--muted);">Batch <span class="mono">${i.batch}</span> · Exp ${i.exp}</div>
          <div style="font-size:11px;color:var(--muted);">Rs. ${i.unitPrice} each</div>
        </div>
        <div style="text-align:right;">
          <div class="pos-qty">
            <button type="button" onclick="posSetQty('${i.batch}',-1)">−</button>
            <span>${i.qty}</span>
            <button type="button" onclick="posSetQty('${i.batch}',1)">+</button>
          </div>
          <div style="font-weight:800;margin-top:6px;">Rs. ${i.unitPrice*i.qty}</div>
          <button type="button" class="btn btn-outline btn-sm" style="margin-top:4px;padding:2px 8px;" onclick="posRemoveItem('${i.batch}')">Remove</button>
        </div>
      </div>`).join('');
  }
  const sub = posCartSubtotal(), disc = posCartDiscount(), tot = posCartTotal();
  const sEl=document.getElementById('pos-subtotal'); if(sEl) sEl.textContent='Rs. '+sub.toLocaleString();
  const dEl=document.getElementById('pos-discount'); if(dEl) dEl.textContent='− Rs. '+disc.toLocaleString();
  const tEl=document.getElementById('pos-grand'); if(tEl) tEl.textContent='Rs. '+tot.toLocaleString();
  const payEl=document.getElementById('pos-payable'); if(payEl) payEl.textContent='Rs. '+tot.toLocaleString();
  posUpdateChange();
}
function posUpdateChange(){
  const tot = posCartTotal();
  const received = parseFloat((document.getElementById('pos-received')||{}).value||0);
  const change = Math.max(0, received - tot);
  const cEl=document.getElementById('pos-change'); if(cEl) cEl.textContent='Rs. '+change.toLocaleString();
}
function posSetDiscount(v){
  if(!empHasPerm('applyDiscount')){ posDiscountPct=0; toast('Discount not allowed for this employee'); posRenderCart(); return; }
  posDiscountPct = Math.min(50, Math.max(0, parseFloat(v)||0));
  posRenderCart();
}
function posFilterProducts(){
  const term = (document.getElementById('pos-search')||{}).value||'';
  posSearchTerm = term.toLowerCase().trim();
  posFilterCat = (document.getElementById('pos-cat')||{}).value||'All';
  const mfg = (document.getElementById('pos-mfg')||{}).value||'All';
  const grid = document.getElementById('pos-product-grid');
  if(!grid) return;
  const stock = pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy);
  const rows = stock.filter(s=>{
    const med = findMed(s.batch)||{};
    const st = posStockStatus(s);
    if(st.key==='out'||st.key==='expired') return false;
    const hay = [s.medicine, med.generic, s.manufacturer, s.batch, (s.packages||[]).join(' ')].join(' ').toLowerCase();
    if(posSearchTerm && !hay.includes(posSearchTerm)) return false;
    if(posFilterCat!=='All' && (med.category||'—')!==posFilterCat) return false;
    if(mfg!=='All' && s.manufacturer!==mfg) return false;
    return true;
  });
  grid.innerHTML = rows.length ? `
    <table><thead><tr>
      <th>Medicine</th><th>Batch</th><th>Stock</th><th>Expiry</th><th>Price</th><th></th>
    </tr></thead><tbody>
    ${rows.map(s=>{
      const med = findMed(s.batch)||{};
      const st = posStockStatus(s);
      return `<tr onclick="posAddToCart('${s.batch}')">
        <td><div class="pn">${s.medicine}</div><div class="psub">${med.generic||'—'} · ${s.manufacturer}</div></td>
        <td><span class="mono">${s.batch}</span></td>
        <td><span class="badge ${st.cls}">${s.qty}</span></td>
        <td><span class="mono">${s.exp}</span></td>
        <td class="pprice">Rs. ${s.unitPrice}</td>
        <td><button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation();posAddToCart('${s.batch}')">Add</button></td>
      </tr>`;
    }).join('')}
    </tbody></table>` : `<div style="padding:40px;text-align:center;color:var(--muted);font-size:13px;">No matching medicines in stock.</div>`;
}
function actionSellMedicine(e){
  if(e) e.preventDefault();
  if(!requirePlanFeature('pos','POS sales')) return false;
  if(!requireEmpPerm('createSales','Create sales')) return false;
  if(posDiscountPct>0 && !empHasPerm('applyDiscount')){ toast('You do not have permission to apply discounts'); return false; }
  if(!posCart.length){ toast('Add medicines to the cart first'); return false; }
  const patientId = fv('pos-patient');
  const patient = patients.find(p=>p.id===patientId);
  const payMethod = (document.querySelector('input[name="pos-pay"]:checked')||{}).value || 'Cash';
  const received = parseFloat(fv('pos-received')||'0') || posCartTotal();
  if(payMethod==='Cash' && received < posCartTotal()){ toast('Amount received is less than total'); return false; }
  const today = new Date().toISOString().slice(0,10);
  const time = new Date().toTimeString().slice(0,5);
  const saleId = 'SALE-'+(9000+sales.length);
  const items = [];
  let grand = 0;
  for(const line of posCart){
    const stock = pharmacyStock.find(x=>x.pharmacy===CTX.pharmacy && x.batch===line.batch);
    if(!stock || Number(stock.qty)<line.qty){ toast('Insufficient stock for '+line.medicine); return false; }
    // Associate each unit sold with a real package ID from pharmacy stock
    const availPkgs = packages.filter(pk=>pk.batch===line.batch && pk.location===CTX.pharmacy && (pk.status==='WITH_PHARMACY'||pk.status==='In Stock'));
    if(availPkgs.length < line.qty){
      toast(`Not enough package units for ${line.medicine}. Available packages: ${availPkgs.length}`);
      return false;
    }
    const soldPkgIds = [];
    for(let i=0;i<line.qty;i++){
      const pkg = availPkgs[i];
      pkg.status = 'SOLD';
      pkg.location = patient ? patient.masked : 'Walk-in';
      soldPkgIds.push(pkg.id);
    }
    const packageId = soldPkgIds[0] || '—';
    stock.qty = Number(stock.qty) - line.qty;
    stock.updatedAt = nowStr();
    if(stock.packages) stock.packages = stock.packages.filter(id=>!soldPkgIds.includes(id));
    const medRow = medicines.find(m=>m.batch===line.batch && m.pharmacy===CTX.pharmacy);
    if(medRow) medRow.qty = Math.max(0, Number(medRow.qty)-line.qty);
    const lineTotal = line.unitPrice * line.qty;
    grand += lineTotal;
    const sale = {
      id: saleId+(items.length? '-'+items.length:''), medicine:line.medicine, batch:line.batch, packageId,
      packageIds: soldPkgIds,
      patient: patient ? `${patient.masked} (${patient.id})` : 'Walk-in customer',
      patientId: patient? patient.id : null,
      pharmacy: CTX.pharmacy, qty:line.qty, unitPrice:line.unitPrice, total:lineTotal,
      price:'Rs. '+lineTotal, date:today, time, manufacturer:line.manufacturer, exp:line.exp,
      category:line.category, payment:payMethod, cashier: currentActorName(), employeeId: currentEmployee?currentEmployee.id:null, discount:posDiscountPct
    };
    sales.unshift(sale);
    items.push(sale);
    if(patient){
      patient.entries.unshift({ medicine:line.medicine, batch:line.batch, pharmacy:CTX.pharmacy, date:today, context:'Purchased at pharmacy POS', usage:'Ongoing', packageId, packageIds:soldPkgIds });
    }
    if(!supplyChainMap[line.batch]) supplyChainMap[line.batch]=[];
    supplyChainMap[line.batch].push({stage:'Patient', party:patient?patient.masked:'Walk-in', loc:CTX.pharmacy, time:nowStr(), qty:line.qty, tx:'TX-'+seq.tx, status:'done'});
    ledger.unshift({tx:'TX-'+(seq.tx++), ref:`${line.medicine} / ${line.batch} / ${packageId} / SOLD`, prev: ledger[0]?ledger[0].curr:'0000000000000000', curr:randHash(), time:nowStr(), actor:`${CTX.pharmacy} (PACKAGE_SOLD)`, status:'Confirmed'});
  }
  const discountAmt = Math.round(grand * (posDiscountPct/100));
  lastReceipt = {
    id: saleId, date:today, time, patient: patient?`${patient.masked} (${patient.id})`:'Walk-in customer',
    patientId: patient?patient.id:null, items, subtotal:grand, discount:discountAmt,
    total: grand-discountAmt, payment:payMethod, received, change:Math.max(0,received-(grand-discountAmt)),
    cashier: currentActorName(), employeeId: currentEmployee?currentEmployee.id:null, pharmacy: CTX.pharmacy
  };
  posCart = []; posDiscountPct = 0;
  persistState();
  logEmployeeAction('SALE_CREATED', saleId, 'POS sale Rs. '+(grand-discountAmt)+' · '+items.length+' line(s)');
  toast('Sale complete — Rs. '+(grand-discountAmt).toLocaleString()+' · inventory & packages updated');
  navigateTo('pharmacy','sales');
  return false;
}
// legacy helpers kept for any residual references
function posFillFromBatch(){}
function posRecalc(){}
function posFilterStock(term){
  const sel = document.getElementById('pharm-sell-batch');
  if(!sel) return;
  term = (term||'').toLowerCase();
  Array.from(sel.options).forEach((opt,i)=>{
    if(i===0) return;
    opt.hidden = term && !opt.textContent.toLowerCase().includes(term);
  });
}
function actionReportCounterfeit(e, source){
  e.preventDefault();
  const medName = fv(source+'-cf-medicine'), batch = fv(source+'-cf-batch'), reason = fv(source+'-cf-reason'), loc = fv(source+'-cf-location') || CTX.cityForSource(source);
  if(!medName || !reason){ toast('Please describe the issue before submitting'); return false; }
  counterfeitReports.unshift({id:'CF-2026-'+(seq.cf++), medicine:medName, batch:batch||'—', reportedBy: source==='pharmacy'?CTX.pharmacy:`Patient (${patients.find(p=>p.id===CURRENT_PATIENT_ID).masked})`, location:loc, date:new Date().toISOString().slice(0,10), reason, status:'Under Investigation'});
  toast('Report submitted — the admin team has been notified');
  e.target.reset();
  if(source==='pharmacy') navigateTo('pharmacy','counterfeit');
  else patientNavigateTo('home');
  return false;
}
CTX_HELPERS_PLACEHOLDER = null; // (unused marker)
function actionInvestigate(id, newStatus){
  const c = counterfeitReports.find(x=>x.id===id);
  if(!c) return;
  c.status = newStatus;
  auditLogs.unshift({user:`${CTX.admin} (Admin)`, action:`Marked case as ${newStatus}`, target:id, time:nowStr()});
  toast(`Case ${id} updated to "${newStatus}"`);
  navigateTo('admin','counterfeit');
}
function actionCreatePrescription(e){
  e.preventDefault();
  const patientId = fv('doc-rx-patient'), medicine = fv('doc-rx-medicine'), dosage = fv('doc-rx-dosage'),
        frequency = fv('doc-rx-frequency'), duration = fv('doc-rx-duration'), instructions = fv('doc-rx-instructions'), diagnosis = fv('doc-rx-diagnosis');
  const patient = patients.find(p=>p.id===patientId);
  if(!patient || !medicine){ toast('Please select a patient and medicine'); return false; }
  prescriptions.unshift({id:'RX-'+(5700+prescriptions.length), doctor:CTX.doctor, patientId, patient:patient.masked, medicine, dosage, frequency, duration, instructions, diagnosis, date:new Date().toISOString().slice(0,10)});
  toast(`Prescription created for ${patient.masked}`);
  e.target.reset();
  navigateTo('doctor','prescriptions');
  return false;
}
function actionIssueRecall(e){
  e.preventDefault();
  const batch = fv('mfg-recall-batch'), reason = fv('mfg-recall-reason');
  const med = findMed(batch);
  if(!med || !reason){ toast('Please select a batch and provide a reason'); return false; }
  med.status = 'Recalled';
  ledger.unshift({tx:'TX-'+(seq.tx++), ref:`${med.name} / ${batch}`, prev: ledger[0]?ledger[0].curr:'0000000000000000', curr:randHash(), time:nowStr(), actor:'System (Recall issued)', status:'Recalled'});
  notifications.unshift({title:'Medicine recall', body:`${med.name} (${batch}) has been recalled: ${reason}`, time:'Just now', type:'danger'});
  toast(`Recall issued for ${med.name} — vendors and pharmacies notified`);
  e.target.reset();
  navigateTo('manufacturer','recall');
  return false;
}
function actionApproveToggle(kind, idx, approveStatus, suspendStatus){
  const arr = {pharmacy:pharmacies, vendor:vendors, manufacturer:manufacturers, doctor:doctors}[kind];
  const item = arr[idx];
  item.status = item.status===approveStatus ? suspendStatus : approveStatus;
  auditLogs.unshift({user:`${CTX.admin} (Admin)`, action:`${item.status} ${kind}`, target:item.name, time:nowStr()});
  toast(`${item.name} is now ${item.status}`);
  navigateTo('admin', kind+'s');
}

const CTX = { admin:'Ahmad Raza', manufacturer:'GSK Pakistan', vendor:'MediSupply Distributors', pharmacy:'MediCare Pharmacy', doctor:'Dr. Sara Khalid',
  cityForSource(s){ return s==='pharmacy' ? 'Lahore' : 'Lahore'; } };

