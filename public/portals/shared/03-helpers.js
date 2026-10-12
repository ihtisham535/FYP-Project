/* ============================================================
   SHARED HELPERS
   ============================================================ */
function statusBadge(status){
  const map = {
    Verified:'badge-green', Active:'badge-green', Completed:'badge-green', Confirmed:'badge-green', Approved:'badge-green', Resolved:'badge-green', Delivered:'badge-green', 'Verified Doctor':'badge-green',
    Suspicious:'badge-amber', Pending:'badge-amber', Trial:'badge-amber', Ongoing:'badge-amber', Flagged:'badge-amber', Prepared:'badge-amber', Dispatched:'badge-amber', 'In Transit':'badge-amber', 'Under Investigation':'badge-amber',
    Recalled:'badge-red', Suspended:'badge-red', Expired:'badge-red', Discontinued:'badge-red', 'Not Found':'badge-red', 'Confirmed Counterfeit':'badge-red', Rejected:'badge-red',
    Received:'badge-blue', 'False Alert':'badge-slate',
  };
  const cls = map[status] || 'badge-slate';
  return `<span class="badge ${cls}"><span class="dot"></span>${status}</span>`;
}
function statCard({label,value,delta,icon,bg,color}){
  return `<div class="stat-card"><div class="top"><div class="ic" style="background:${bg};color:${color};">${ICONS[icon]}</div></div><div class="val">${value}</div><div class="lbl">${label}</div>${delta?`<div class="delta" style="color:${color}">${delta}</div>`:''}</div>`;
}
function statGrid(items){ return `<div class="stat-grid">${items.map(statCard).join('')}</div>`; }
function card(title,sub,inner,action){
  return `<div class="card"><div class="card-head"><div><h3>${title}</h3>${sub?`<div class="sub">${sub}</div>`:''}</div>${action||''}</div>${inner}</div>`;
}
function dataTable(cols, rows){
  return `<div class="table-wrap"><table><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function pageHead(title,sub,action){
  const actions = action ? `<div class="page-head-actions">${action}</div>` : '';
  return `<div class="page-head"><div><h2>${title}</h2><div class="sub">${sub}</div></div>${actions}</div>`;
}
function breadcrumb(parentLabel, parentPortal, parentPage, current){
  return `<div class="breadcrumb"><a onclick="navigateTo('${parentPortal}','${parentPage}')">${parentLabel}</a> / ${current}</div>`;
}
function activityList(items){
  return items.map(a=>`<div class="activity-row"><div class="aic" style="background:${a.bg};color:${a.color};">${ICONS[a.icon]}</div><div><div class="txt">${a.txt}</div><div class="time">${a.time}</div></div></div>`).join('');
}
function qrMini(seed, big){
  let h=0; for(let i=0;i<seed.length;i++){h=(h*31+seed.charCodeAt(i))>>>0;}
  let cells='';
  for(let r=0;r<8;r++){
    cells += '<div class="col">';
    for(let c=0;c<8;c++){ h=(h*1103515245+12345)>>>0; const on=(h>>>16)%3===0; cells+=`<div class="qr-cell" style="background:${on?'#0F172A':'transparent'}"></div>`; }
    cells += '</div>';
  }
  return `<div class="qr-block${big?' lg':''}">${cells}</div>`;
}
function icBox(icon,bg,color,size){ size=size||34; return `<div class="ic" style="width:${size}px;height:${size}px;border-radius:9px;background:${bg};color:${color};display:flex;align-items:center;justify-content:center;">${ICONS[icon]}</div>`; }
function findMed(batch){ return medicines.find(m=>m.batch===batch); }

/* ---------- Pharmacy subscription helpers ---------- */
function daysBetween(a,b){
  const d1=new Date(a+'T00:00:00'), d2=new Date(b+'T00:00:00');
  return Math.round((d2-d1)/86400000);
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function computeSubStatus(p){
  if(p.subStatus==='Pending' || p.sub==='Pending') return 'Pending';
  const days = daysBetween(todayISO(), p.expiryDate||'2099-01-01');
  if(days < 0) return 'Expired';
  if(days <= 14) return 'Expiring Soon';
  return 'Active';
}
function daysRemaining(p){
  const days = daysBetween(todayISO(), p.expiryDate||'2099-01-01');
  return days;
}
function getPharmacySub(name){
  const p = pharmacies.find(x=>x.name===(name||CTX.pharmacy));
  if(!p) return null;
  if(p.plan==='Professional') p.plan='Premium';
  if(p.plan==='Free Trial') p.plan='Trial';
  const live = computeSubStatus(p);
  p.subStatus = live;
  p.sub = live==='Expired'?'Expired':(live==='Pending'?'Pending':'Active');
  return p;
}
function pharmacyHasPremium(name){
  const p = getPharmacySub(name);
  if(!p) return false;
  if(p.subStatus==='Expired' || p.subStatus==='Pending') return false;
  return normalizePlan(p.plan)==='Premium';
}
/** Feature gates by plan (DEMO client-side only — not production security) */
function pharmacyCanAccess(feature, name){
  const p = getPharmacySub(name);
  if(!p) return false;
  const active = p.subStatus==='Active' || p.subStatus==='Expiring Soon';
  const plan = normalizePlan(p.plan);
  const trialOk = ['pos','receipts','sales_record','inventory_view','daily_overview'];
  const basicOk = trialOk.concat(['inventory_manage','shipments','verification','suppliers','patients','basic_alerts','basic_reports','counterfeit']);
  const premiumOnly = ['advanced_analytics','advanced_reports','demand','reorder','employee_mgmt','margins','audit_log'];
  if(!active) return ['pos','inventory_view','sales_record','receipts'].includes(feature);
  if(plan==='Premium') return true;
  if(plan==='Basic') return basicOk.includes(feature);
  if(plan==='Trial') return trialOk.includes(feature);
  return basicOk.includes(feature);
}
function startFreeTrial(pharmacyName){
  const p = pharmacies.find(x=>x.name===(pharmacyName||CTX.pharmacy));
  if(!p){ toast('Pharmacy not found'); return; }
  const start = new Date();
  const end = new Date(start.getTime()+14*86400000);
  p.plan = 'Trial';
  p.startDate = start.toISOString().slice(0,10);
  p.expiryDate = end.toISOString().slice(0,10);
  p.subStatus = 'Active';
  p.sub = 'Active';
  toast('Trial activated for 14 days — limited POS features unlocked');
  if(currentPortal==='pharmacy') navigateTo('pharmacy','subscription');
  else if(currentPortal==='admin') navigateTo('admin','subscriptions');
}

/* ---------- Premium Employee Management (demo) ---------- */
const EMP_PERM_KEYS = [
  {key:'viewInventory', label:'View inventory'},
  {key:'createSales', label:'Create sales'},
  {key:'applyDiscount', label:'Apply discounts'},
  {key:'processReturns', label:'Process returns / cancellations'},
  {key:'manageProducts', label:'Manage products'},
  {key:'viewPurchases', label:'View purchases / spending'},
  {key:'viewReports', label:'View business reports'},
  {key:'manageEmployees', label:'Manage employees'}
];
function defaultSalesmanPerms(){
  return {viewInventory:true, createSales:true, applyDiscount:false, processReturns:false, manageProducts:false, viewPurchases:false, viewReports:false, manageEmployees:false};
}
let pharmacyEmployees = [
  {id:'EMP-001', pharmacy:'MediCare Pharmacy', name:'Hassan Ali', email:'hassan@medicare.demo', role:'Salesman', status:'Active',
   permissions:Object.assign(defaultSalesmanPerms(),{applyDiscount:true}), createdAt:'2026-08-01', demo:true},
  {id:'EMP-002', pharmacy:'MediCare Pharmacy', name:'Sana Iqbal', email:'sana@medicare.demo', role:'Cashier', status:'Active',
   permissions:defaultSalesmanPerms(), createdAt:'2026-09-10', demo:true},
  {id:'EMP-003', pharmacy:'Prime Health Pharmacy', name:'Omar Khan', email:'omar@prime.demo', role:'Salesman', status:'Active',
   permissions:defaultSalesmanPerms(), createdAt:'2026-07-15', demo:true}
];
let employeeAuditLog = [
  {id:'AUD-1001', pharmacy:'MediCare Pharmacy', employeeId:'EMP-001', employeeName:'Hassan Ali', action:'SALE_CREATED', recordId:'SALE-9001', detail:'Demo seed activity', time:'2026-09-28 11:20', before:null, after:null, demo:true}
];
let currentEmployee = null;
let empSeq = 100;
function getPharmacyEmployees(pharmacyName){
  return pharmacyEmployees.filter(e=>e.pharmacy===(pharmacyName||CTX.pharmacy));
}
function getEmployeeById(id){ return pharmacyEmployees.find(e=>e.id===id); }
function currentActorName(){
  if(currentEmployee) return currentEmployee.name+' ('+currentEmployee.role+')';
  const owner = (getPharmacySub()||{}).owner;
  return (owner|| (PORTAL_META.pharmacy&&PORTAL_META.pharmacy.name) || 'Owner') + ' (Owner)';
}
function empHasPerm(perm){
  if(!currentEmployee) return true;
  if(currentEmployee.status!=='Active') return false;
  return !!(currentEmployee.permissions && currentEmployee.permissions[perm]);
}
function requireEmpPerm(perm, label){
  if(empHasPerm(perm)) return true;
  toast('Access denied (demo): '+(label||perm)+' — ask the pharmacy owner');
  return false;
}
function requirePlanFeature(feature, label){
  if(pharmacyCanAccess(feature)) return true;
  toast((label||feature)+' needs an active higher plan — open Subscription');
  return false;
}
function logEmployeeAction(action, recordId, detail, before, after){
  const entry = {
    id:'AUD-'+(2000+employeeAuditLog.length),
    pharmacy: CTX.pharmacy,
    employeeId: currentEmployee ? currentEmployee.id : 'OWNER',
    employeeName: currentActorName(),
    action, recordId: recordId||'—', detail: detail||'', time: (typeof nowStr==='function'?nowStr():new Date().toISOString()),
    before: before!=null?before:null, after: after!=null?after:null, demo:false
  };
  employeeAuditLog.unshift(entry);
  return entry;
}
function switchToOwnerSession(){
  currentEmployee = null;
  if(PORTAL_META.pharmacy){
    const p = getPharmacySub();
    PORTAL_META.pharmacy.role = 'Pharmacy Owner';
    PORTAL_META.pharmacy.name = (p&&p.owner) || 'Pharmacy Owner';
    PORTAL_META.pharmacy.avatar = (PORTAL_META.pharmacy.name||'OW').split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
  }
  toast('Owner session active');
  navigateTo('pharmacy','dashboard');
}
function switchToEmployeeSession(empId){
  if(!pharmacyHasPremium()){ toast('Employee sessions require active Premium'); return; }
  const emp = getEmployeeById(empId);
  if(!emp || emp.pharmacy!==CTX.pharmacy){ toast('Employee not found'); return; }
  if(emp.status!=='Active'){ toast('Employee is inactive'); return; }
  currentEmployee = emp;
  if(PORTAL_META.pharmacy){
    PORTAL_META.pharmacy.name = emp.name;
    PORTAL_META.pharmacy.role = emp.role+' (Employee)';
    PORTAL_META.pharmacy.avatar = emp.name.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
  }
  logEmployeeAction('LOGIN', emp.id, 'Employee session started (demo)');
  if(typeof persistState==='function') try{persistState();}catch(e){}
  toast('Logged in as '+emp.name+' (demo)');
  navigateTo('pharmacy','dashboard');
}
function openEmployeeModal(mode, empId){
  if(!pharmacyHasPremium()){ toast('Employee management requires Premium'); navigateTo('pharmacy','subscription'); return; }
  if(currentEmployee && !empHasPerm('manageEmployees')){ toast('Permission denied'); return; }
  if(typeof closeEntityModal==='function') closeEntityModal();
  const emp = empId ? getEmployeeById(empId) : null;
  const perms = emp ? Object.assign(defaultSalesmanPerms(), emp.permissions||{}) : defaultSalesmanPerms();
  const permChecks = EMP_PERM_KEYS.map(function(pk){
    return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;padding:6px 0;cursor:pointer;">'+
      '<input type="checkbox" id="emp-perm-'+pk.key+'" '+(perms[pk.key]?'checked':'')+'>'+
      '<span>'+pk.label+'</span></label>';
  }).join('');
  const overlay = document.createElement('div');
  overlay.id = 'entity-modal-overlay';
  overlay.className = 'receipt-overlay';
  overlay.onclick = function(e){ if(e.target===overlay && typeof closeEntityModal==='function') closeEntityModal(); };
  overlay.innerHTML = '<div class="receipt-modal" style="max-width:560px;width:100%;" role="dialog">'+
    '<div class="receipt-modal-actions"><span style="margin-right:auto;font-weight:800;font-size:14px;">'+(mode==='add'?'Add employee':'Edit employee')+'</span>'+
    '<button class="btn btn-dark btn-sm" type="button" onclick="closeEntityModal()">Close</button></div>'+
    '<div style="padding:18px 22px 24px;">'+
    '<p style="font-size:12px;color:var(--muted);margin:0 0 12px;">Demo only — permissions are client-side and not production security.</p>'+
    '<form onsubmit="return saveEmployee(event,\''+mode+'\',\''+(empId||'')+'\')">'+
    '<div class="field-row"><div class="field"><label>Full name</label><input id="emp-name" required value="'+(emp?emp.name:'')+'" placeholder="e.g. Ali Hassan"></div>'+
    '<div class="field"><label>Email</label><input id="emp-email" type="email" required value="'+(emp?emp.email:'')+'" placeholder="staff@pharmacy.demo"></div></div>'+
    '<div class="field-row"><div class="field"><label>Role</label><select id="emp-role" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13.5px;">'+
    '<option value="Salesman"'+( !emp||emp.role==='Salesman'?' selected':'')+'>Salesman</option>'+
    '<option value="Cashier"'+(emp&&emp.role==='Cashier'?' selected':'')+'>Cashier</option>'+
    '<option value="Supervisor"'+(emp&&emp.role==='Supervisor'?' selected':'')+'>Supervisor</option></select></div>'+
    '<div class="field"><label>Status</label><select id="emp-status" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13.5px;">'+
    '<option value="Active"'+( !emp||emp.status==='Active'?' selected':'')+'>Active</option>'+
    '<option value="Inactive"'+(emp&&emp.status==='Inactive'?' selected':'')+'>Inactive</option></select></div></div>'+
    '<div style="font-size:12px;font-weight:700;color:var(--muted);margin:10px 0 6px;text-transform:uppercase;">Permissions (least privilege)</div>'+
    '<div style="border:1px solid var(--border);border-radius:12px;padding:10px 14px;background:#F8FAFC;margin-bottom:14px;">'+permChecks+'</div>'+
    '<button class="btn btn-primary btn-block" type="submit">'+(mode==='add'?'Create employee':'Save changes')+'</button></form></div></div>';
  document.body.appendChild(overlay);
}
function saveEmployee(e, mode, empId){
  e.preventDefault();
  if(!pharmacyHasPremium()){ toast('Premium required'); return false; }
  if(currentEmployee && !empHasPerm('manageEmployees')){ toast('Permission denied'); return false; }
  const name = fv('emp-name'), email = fv('emp-email'), role = fv('emp-role'), status = fv('emp-status');
  if(!name||!email){ toast('Name and email required'); return false; }
  const permissions = {};
  EMP_PERM_KEYS.forEach(function(pk){ const el=document.getElementById('emp-perm-'+pk.key); permissions[pk.key]=el?!!el.checked:false; });
  if(mode==='add'){
    empSeq++;
    const id = 'EMP-'+String(100+empSeq);
    pharmacyEmployees.unshift({id:id, pharmacy:CTX.pharmacy, name:name, email:email, role:role, status:status, permissions:permissions, createdAt:todayISO(), demo:false});
    logEmployeeAction('EMPLOYEE_CREATED', id, 'Created '+name+' as '+role, null, {name:name, role:role, permissions:permissions});
    toast('Employee created: '+name);
  } else {
    const emp = getEmployeeById(empId);
    if(!emp){ toast('Not found'); return false; }
    const before = {name:emp.name, role:emp.role, status:emp.status, permissions:Object.assign({}, emp.permissions)};
    emp.name=name; emp.email=email; emp.role=role; emp.status=status; emp.permissions=permissions;
    logEmployeeAction('EMPLOYEE_UPDATED', emp.id, 'Updated '+name, before, {name:name, role:role, status:status, permissions:permissions});
    toast('Employee updated');
  }
  if(typeof persistState==='function') try{persistState();}catch(err){}
  closeEntityModal();
  navigateTo('pharmacy','employees');
  return false;
}
function setEmployeeStatus(empId, status){
  if(!pharmacyHasPremium()) return;
  if(currentEmployee && !empHasPerm('manageEmployees')){ toast('Permission denied'); return; }
  const emp = getEmployeeById(empId);
  if(!emp) return;
  const before = emp.status;
  emp.status = status;
  logEmployeeAction(status==='Active'?'EMPLOYEE_ACTIVATED':'EMPLOYEE_DEACTIVATED', emp.id, emp.name+': '+before+' → '+status, before, status);
  if(typeof persistState==='function') try{persistState();}catch(err){}
  toast(emp.name+' is now '+status);
  navigateTo('pharmacy','employees');
}
function employeeSalesStats(empId, pharmacyName){
  const name = pharmacyName || CTX.pharmacy;
  const emp = getEmployeeById(empId);
  const empName = emp ? emp.name : '';
  const rows = sales.filter(function(s){ return s.pharmacy===name && (s.employeeId===empId || s.cashier===empName || (s.cashier||'').indexOf(empName)===0); });
  const total = rows.reduce(function(a,s){ return a+(Number(s.total)||0); },0);
  const txCount = rows.length;
  return {rows:rows, total:total, txCount:txCount, avg: txCount?Math.round(total/txCount):0, discounts: rows.reduce(function(a,s){return a+(Number(s.discount)||0);},0)};
}

function pharmacySubActive(name){
  const p = getPharmacySub(name);
  if(!p) return false;
  return p.subStatus==='Active' || p.subStatus==='Expiring Soon';
}
function subStatusBadge(status){
  const map = {
    'Active':'badge-green',
    'Expiring Soon':'badge-amber',
    'Expired':'badge-red',
    'Pending':'badge-slate'
  };
  return `<span class="badge ${map[status]||'badge-slate'}"><span class="dot"></span>${status}</span>`;
}
function planBadge(plan){
  if(plan==='Premium') return `<span class="badge badge-indigo"><span class="dot"></span>Premium</span>`;
  if(normalizePlan(plan)==='Trial') return `<span class="badge badge-teal"><span class="dot"></span>Trial</span>`;
  return `<span class="badge badge-slate"><span class="dot"></span>Basic</span>`;
}
function crudActions(kind, id, extra){
  const e = extra||{};
  const sid = String(id).replace(/'/g,"\\'");
  return `<div style="display:flex;gap:4px;flex-wrap:wrap;">
    ${e.view?`<button class="btn btn-outline btn-sm" onclick="${e.view}">View</button>`:''}
    <button class="btn btn-outline btn-sm" onclick="openEntityModal('edit','${kind}','${sid}')">Edit</button>
    <button class="btn btn-outline btn-sm" style="color:#B91C1C;border-color:#FECACA;" onclick="crudDelete('${kind}','${sid}')">Delete</button>
  </div>`;
}
function closeEntityModal(){ const el=document.getElementById('entity-modal-overlay'); if(el) el.remove(); }
function openEntityModal(mode, kind, id){
  closeEntityModal();
  let title = (mode==='add'?'Add':'Edit')+' '+kind;
  let body = '';
  const saveBtn = `<button class="btn btn-primary" type="submit">Save changes</button>
    <button class="btn btn-outline" type="button" onclick="closeEntityModal()" style="margin-left:8px;">Cancel</button>`;

  if(kind==='medicine'){
    const m = medicines.find(x=>x.batch===id || x.code===id) || {};
    body = `<form onsubmit="return saveEntity(event,'medicine','${id||''}')">
      <div class="field-row"><div class="field"><label>Medicine name</label><input id="em-name" value="${m.name||''}" required></div>
        <div class="field"><label>Generic</label><input id="em-generic" value="${m.generic||''}"></div></div>
      <div class="field-row3"><div class="field"><label>Category</label><input id="em-cat" value="${m.category||''}"></div>
        <div class="field"><label>Strength</label><input id="em-str" value="${m.strength||''}"></div>
        <div class="field"><label>Qty</label><input id="em-qty" type="number" value="${m.qty||0}"></div></div>
      <div class="field-row"><div class="field"><label>Mfg date</label><input id="em-mfg" type="date" value="${m.mfg||''}"></div>
        <div class="field"><label>Expiry</label><input id="em-exp" type="date" value="${m.exp||''}"></div></div>
      <div class="field"><label>Status</label><select id="em-status">
        ${['Verified','Suspicious','Recalled','Pending'].map(s=>`<option ${m.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='shipment'){
    const s = shipments.find(x=>x.id===id) || {};
    body = `<form onsubmit="return saveEntity(event,'shipment','${id||''}')">
      <div class="field-row"><div class="field"><label>Product</label><input id="em-product" value="${s.product||s.medicine||''}" required></div>
        <div class="field"><label>Batch</label><input id="em-batch" value="${s.batch||''}" class="mono"></div></div>
      <div class="field-row"><div class="field"><label>From</label><input id="em-from" value="${s.from||''}"></div>
        <div class="field"><label>To</label><input id="em-to" value="${s.to||''}"></div></div>
      <div class="field-row3"><div class="field"><label>Qty</label><input id="em-qty" type="number" value="${s.qty||0}"></div>
        <div class="field"><label>Dispatch</label><input id="em-dispatch" type="date" value="${s.dispatchDate||s.date||''}"></div>
        <div class="field"><label>ETA</label><input id="em-eta" type="date" value="${s.expectedDate||''}"></div></div>
      <div class="field"><label>Status</label><select id="em-status">
        ${['Prepared','Dispatched','In Transit','Received','Confirmed','Recalled'].map(st=>`<option ${s.status===st?'selected':''}>${st}</option>`).join('')}</select></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='pharmacy'){
    const p = pharmacies.find(x=>x.name===id) || {};
    body = `<form onsubmit="return saveEntity(event,'pharmacy','${(id||'').replace(/'/g,"\\'")}')">
      <div class="field-row"><div class="field"><label>Pharmacy name</label><input id="em-name" value="${p.name||''}" required></div>
        <div class="field"><label>Owner</label><input id="em-owner" value="${p.owner||''}"></div></div>
      <div class="field-row3"><div class="field"><label>City</label><input id="em-city" value="${p.city||''}"></div>
        <div class="field"><label>License</label><input id="em-license" value="${p.license||''}"></div>
        <div class="field"><label>Contact</label><input id="em-contact" value="${p.contact||''}"></div></div>
      <div class="field-row"><div class="field"><label>Plan</label><select id="em-plan">
        <option value="Trial" ${p.plan==='Trial'?'selected':''}>Free Trial</option>
        <option value="Basic" ${p.plan==='Basic'?'selected':''}>Basic</option>
        <option value="Premium" ${p.plan==='Premium'?'selected':''}>Premium</option>
      </select></div>
        <div class="field"><label>Status</label><select id="em-status">
          ${['Verified','Pending','Suspended'].map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='vendor'){
    const v = vendors.find(x=>x.name===id) || {};
    body = `<form onsubmit="return saveEntity(event,'vendor','${(id||'').replace(/'/g,"\\'")}')">
      <div class="field-row"><div class="field"><label>Vendor name</label><input id="em-name" value="${v.name||''}" required></div>
        <div class="field"><label>License</label><input id="em-license" value="${v.license||''}"></div></div>
      <div class="field-row"><div class="field"><label>City</label><input id="em-city" value="${v.city||''}"></div>
        <div class="field"><label>Status</label><select id="em-status">
          ${['Approved','Pending','Suspended'].map(s=>`<option ${v.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='manufacturer'){
    const m = manufacturers.find(x=>x.name===id) || {};
    body = `<form onsubmit="return saveEntity(event,'manufacturer','${(id||'').replace(/'/g,"\\'")}')">
      <div class="field-row"><div class="field"><label>Manufacturer name</label><input id="em-name" value="${m.name||''}" required></div>
        <div class="field"><label>City</label><input id="em-city" value="${m.city||''}"></div></div>
      <div class="field-row"><div class="field"><label>Products count</label><input id="em-products" type="number" value="${m.products||0}"></div>
        <div class="field"><label>Status</label><select id="em-status">
          ${['Approved','Pending','Suspended'].map(s=>`<option ${m.status===s?'selected':''}>${s}</option>`).join('')}</select></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='prescription'){
    const r = prescriptions.find(x=>x.id===id) || {};
    body = `<form onsubmit="return saveEntity(event,'prescription','${id||''}')">
      <div class="field-row"><div class="field"><label>Patient</label><input id="em-patient" value="${r.patient||''}" required></div>
        <div class="field"><label>Medicine</label><input id="em-medicine" value="${r.medicine||''}" required></div></div>
      <div class="field-row"><div class="field"><label>Diagnosis</label><input id="em-diagnosis" value="${r.diagnosis||''}"></div>
        <div class="field"><label>Date</label><input id="em-date" type="date" value="${r.date||''}"></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='sale'){
    const s = sales.find(x=>x.id===id) || {};
    body = `<form onsubmit="return saveEntity(event,'sale','${id||''}')">
      <div class="field-row"><div class="field"><label>Medicine</label><input id="em-medicine" value="${s.medicine||''}" required></div>
        <div class="field"><label>Patient</label><input id="em-patient" value="${s.patient||''}"></div></div>
      <div class="field-row3"><div class="field"><label>Qty</label><input id="em-qty" type="number" value="${s.qty||1}"></div>
        <div class="field"><label>Total (Rs)</label><input id="em-total" type="number" value="${s.total||0}"></div>
        <div class="field"><label>Date</label><input id="em-date" type="date" value="${s.date||''}"></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='stock'){
    const s = pharmacyStock.find(x=>x.batch===id && x.pharmacy===CTX.pharmacy) || pharmacyStock.find(x=>x.batch===id) || {};
    body = `<form onsubmit="return saveEntity(event,'stock','${id||''}')">
      <div class="field-row"><div class="field"><label>Medicine</label><input id="em-medicine" value="${s.medicine||''}" required></div>
        <div class="field"><label>Batch</label><input id="em-batch" value="${s.batch||id||''}" readonly></div></div>
      <div class="field-row3"><div class="field"><label>Qty</label><input id="em-qty" type="number" value="${s.qty||0}"></div>
        <div class="field"><label>Unit price</label><input id="em-price" type="number" value="${s.unitPrice||0}"></div>
        <div class="field"><label>Expiry</label><input id="em-exp" type="date" value="${s.exp||''}"></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else if(kind==='patient'){
    const p = patients.find(x=>x.id===id) || {};
    body = `<form onsubmit="return saveEntity(event,'patient','${id||''}')">
      <div class="field-row"><div class="field"><label>Display name (masked)</label><input id="em-masked" value="${p.masked||''}" required></div>
        <div class="field"><label>Patient ID</label><input id="em-id" value="${p.id||id||''}" ${id?'readonly':''}></div></div>
      <div style="margin-top:14px;">${saveBtn}</div></form>`;
  }
  else {
    body = `<p style="color:var(--muted);font-size:13px;">No editor defined for "${kind}".</p>
      <button class="btn btn-outline" type="button" onclick="closeEntityModal()">Close</button>`;
  }

  const overlay = document.createElement('div');
  overlay.id = 'entity-modal-overlay';
  overlay.className = 'receipt-overlay';
  overlay.onclick = (e)=>{ if(e.target===overlay) closeEntityModal(); };
  overlay.innerHTML = `<div class="receipt-modal" style="max-width:560px;width:100%;" role="dialog">
    <div class="receipt-modal-actions">
      <span style="font-weight:700;font-size:14px;margin-right:auto;color:var(--navy);">${title}</span>
      <button class="btn btn-outline btn-sm" type="button" onclick="closeEntityModal()">Close</button>
    </div>
    <div style="padding:18px 20px 22px;">${body}</div>
  </div>`;
  document.body.appendChild(overlay);
}
function saveEntity(e, kind, id){
  e.preventDefault();
  if(kind==='medicine'){
    let m = medicines.find(x=>x.batch===id || x.code===id);
    if(!m){
      const batch = 'BT-2026-'+ (3000+medicines.length);
      m = {name:fv('em-name'), generic:fv('em-generic'), category:fv('em-cat'), strength:fv('em-str'), form:'Tablet', batch, manufacturer:CTX.manufacturer||'—', vendor:'—', pharmacy:'—', mfg:fv('em-mfg'), exp:fv('em-exp'), qty:parseInt(fv('em-qty')||'0',10), storage:'Store below 25°C', status:fv('em-status')||'Verified', code:'MED-'+batch};
      medicines.unshift(m);
    } else {
      m.name = fv('em-name'); m.generic = fv('em-generic'); m.category = fv('em-cat');
      m.strength = fv('em-str'); m.qty = parseInt(fv('em-qty')||'0',10);
      m.mfg = fv('em-mfg'); m.exp = fv('em-exp'); m.status = fv('em-status');
    }
    toast('Medicine saved: '+m.name);
  }
  else if(kind==='shipment'){
    const s = shipments.find(x=>x.id===id);
    if(s){
      s.product = fv('em-product'); s.medicine = fv('em-product'); s.batch = fv('em-batch');
      s.from = fv('em-from'); s.to = fv('em-to'); s.qty = parseInt(fv('em-qty')||'0',10);
      s.dispatchDate = fv('em-dispatch'); s.expectedDate = fv('em-eta'); s.status = fv('em-status');
      toast('Shipment updated: '+s.id);
    }
  }
  else if(kind==='pharmacy'){
    let p = pharmacies.find(x=>x.name===id);
    if(!p){
      p = {name:fv('em-name'), owner:fv('em-owner'), license:fv('em-license'), city:fv('em-city'), contact:fv('em-contact'), plan:fv('em-plan')||'Basic', sub:'Active', subStatus:'Active', startDate:todayISO(), expiryDate:todayISO().slice(0,8)+'28', status:fv('em-status')||'Pending'};
      pharmacies.unshift(p);
    } else {
      const oldName = p.name;
      p.name = fv('em-name'); p.owner = fv('em-owner'); p.city = fv('em-city');
      p.license = fv('em-license'); p.contact = fv('em-contact');
      p.plan = fv('em-plan'); p.status = fv('em-status');
      if(oldName!==p.name && CTX.pharmacy===oldName) CTX.pharmacy = p.name;
    }
    toast('Pharmacy saved: '+p.name);
  }
  else if(kind==='vendor'){
    let v = vendors.find(x=>x.name===id);
    if(!v){
      v = {name:fv('em-name'), license:fv('em-license'), city:fv('em-city'), pharmacies:[], supplied:0, status:fv('em-status')||'Pending'};
      vendors.unshift(v);
    } else {
      v.name = fv('em-name'); v.license = fv('em-license'); v.city = fv('em-city'); v.status = fv('em-status');
    }
    toast('Vendor saved: '+v.name);
  }
  else if(kind==='manufacturer'){
    let m = manufacturers.find(x=>x.name===id);
    if(!m){
      m = {name:fv('em-name'), city:fv('em-city'), products:parseInt(fv('em-products')||'0',10), status:fv('em-status')||'Pending'};
      manufacturers.unshift(m);
    } else {
      m.name = fv('em-name'); m.city = fv('em-city'); m.products = parseInt(fv('em-products')||'0',10); m.status = fv('em-status');
    }
    toast('Manufacturer saved: '+m.name);
  }
  else if(kind==='prescription'){
    const r = prescriptions.find(x=>x.id===id);
    if(r){
      r.patient = fv('em-patient'); r.medicine = fv('em-medicine');
      r.diagnosis = fv('em-diagnosis'); r.date = fv('em-date');
      toast('Prescription updated: '+r.id);
    }
  }
  else if(kind==='sale'){
    const s = sales.find(x=>x.id===id);
    if(s){
      s.medicine = fv('em-medicine'); s.patient = fv('em-patient');
      s.qty = parseInt(fv('em-qty')||'1',10); s.total = parseInt(fv('em-total')||'0',10);
      s.price = 'Rs. '+s.total; s.date = fv('em-date');
      toast('Sale updated: '+s.id);
    }
  }
  else if(kind==='stock'){
    const s = pharmacyStock.find(x=>x.batch===id && x.pharmacy===CTX.pharmacy) || pharmacyStock.find(x=>x.batch===id);
    if(s){
      s.medicine = fv('em-medicine'); s.qty = parseInt(fv('em-qty')||'0',10);
      s.unitPrice = parseInt(fv('em-price')||'0',10); s.exp = fv('em-exp');
      toast('Stock updated: '+s.medicine);
    }
  }
  else if(kind==='patient'){
    let p = patients.find(x=>x.id===id);
    if(!p){
      p = {id:fv('em-id')||('PT-'+Date.now()), masked:fv('em-masked'), entries:[]};
      patients.unshift(p);
    } else {
      p.masked = fv('em-masked');
    }
    toast('Patient saved: '+p.masked);
  }
  closeEntityModal();
  if(currentPortal && currentPage) navigateTo(currentPortal, currentPage);
  return false;
}
function crudDelete(kind, id){
  if(!confirm(`Delete this ${kind}? This updates the live demo data.`)) return;
  let ok = false;
  if(kind==='medicine'){
    const i = medicines.findIndex(m=>m.batch===id||m.name===id||m.code===id);
    if(i>=0){ medicines.splice(i,1); ok=true; }
  }
  else if(kind==='shipment'){
    const i = shipments.findIndex(s=>s.id===id);
    if(i>=0){ shipments.splice(i,1); ok=true; }
  }
  else if(kind==='sale'){
    const i = sales.findIndex(s=>s.id===id);
    if(i>=0){ sales.splice(i,1); ok=true; }
  }
  else if(kind==='pharmacy'){
    const i = pharmacies.findIndex(p=>p.name===id);
    if(i>=0){ pharmacies.splice(i,1); ok=true; }
  }
  else if(kind==='vendor'){
    const i = vendors.findIndex(v=>v.name===id);
    if(i>=0){ vendors.splice(i,1); ok=true; }
  }
  else if(kind==='manufacturer'){
    const i = manufacturers.findIndex(m=>m.name===id);
    if(i>=0){ manufacturers.splice(i,1); ok=true; }
  }
  else if(kind==='prescription'){
    const i = prescriptions.findIndex(r=>r.id===id);
    if(i>=0){ prescriptions.splice(i,1); ok=true; }
  }
  else if(kind==='stock'){
    const i = pharmacyStock.findIndex(s=>s.batch===id && s.pharmacy===CTX.pharmacy);
    if(i>=0){ pharmacyStock.splice(i,1); ok=true; }
  }
  else if(kind==='patient'){
    const i = patients.findIndex(p=>p.id===id);
    if(i>=0){ patients.splice(i,1); ok=true; }
  }
  toast(ok ? `${kind} deleted` : `Could not find ${kind}`);
  if(currentPortal && currentPage) navigateTo(currentPortal, currentPage);
}
let subRequests = [
  /* {id, pharmacy, currentPlan, requestedPlan, type, status, date, note, accountName, transactionId, paymentDate, amount, payerName} */
];
/* Official bank accounts for pharmacy subscription payments (demo) */
const PAYMENT_ACCOUNTS = [
  {bank:'HBL', title:'PharmaChain Pvt Ltd', number:'1234-56789012-01', iban:'PK00HABB0000123456789012'},
  {bank:'Meezan Bank', title:'PharmaChain Subscriptions', number:'0215-00123456-78', iban:'PK00MEZN0000215001234567'},
  {bank:'JazzCash / EasyPaisa', title:'PharmaChain', number:'0300-1234567', iban:'—'},
];
function planPriceLabel(plan){
  const sp = (typeof SUB_PLANS!=='undefined' && SUB_PLANS[plan]) ? SUB_PLANS[plan] : null;
  if(!sp) return plan==='Trial' ? 'Rs. 0' : '—';
  return (sp.price||'') + (sp.period||'');
}
function closePaymentModal(){
  const el = document.getElementById('sub-payment-overlay');
  if(el) el.remove();
}
function pharmacyRequestSubscription(plan, type){
  const p = getPharmacySub();
  if(!p){ toast('Pharmacy not found'); return; }
  type = type || (plan===p.plan ? 'Renew' : (['Premium'].includes(plan) && normalizePlan(p.plan)!=='Premium' ? 'Upgrade' : (plan==='Basic' && p.plan==='Premium' ? 'Downgrade' : 'Change plan')));
  if(subRequests.some(r=>r.pharmacy===p.name && r.status==='Pending')){
    toast('You already have a pending request. Wait for admin approval.');
    navigateTo('pharmacy','subscription');
    return;
  }
  // Trial: no payment required
  if(plan==='Trial'){
    openPaymentModal(plan, type, true);
    return;
  }
  openPaymentModal(plan, type, false);
}
function openPaymentModal(plan, type, isTrial){
  const p = getPharmacySub();
  if(!p) return;
  closePaymentModal();
  const amount = planPriceLabel(plan);
  const today = new Date().toISOString().slice(0,10);
  const overlay = document.createElement('div');
  overlay.id = 'sub-payment-overlay';
  overlay.className = 'receipt-overlay';
  overlay.onclick = (e)=>{ if(e.target===overlay) closePaymentModal(); };
  const accountsHtml = PAYMENT_ACCOUNTS.map(a=>`
    <div style="border:1px solid var(--border);border-radius:10px;padding:12px 14px;background:#F8FAFC;">
      <div style="font-weight:800;font-size:13px;color:var(--navy);">${a.bank}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px;">Account title: <b style="color:var(--navy)">${a.title}</b></div>
      <div style="font-size:12.5px;margin-top:4px;">Account / mobile: <span class="mono" style="font-weight:700;">${a.number}</span></div>
      ${a.iban!=='—'?`<div style="font-size:11.5px;color:var(--muted);margin-top:3px;">IBAN: <span class="mono">${a.iban}</span></div>`:''}
    </div>`).join('');

  overlay.innerHTML = `
    <div class="receipt-modal" style="max-width:560px;width:100%;" role="dialog">
      <div class="receipt-modal-actions">
        <span style="margin-right:auto;font-weight:800;font-size:14px;color:var(--navy);">${isTrial?'Request free trial':'Payment & request'}</span>
        <button class="btn btn-dark btn-sm" type="button" onclick="closePaymentModal()">Close</button>
      </div>
      <div style="padding:18px 22px 24px;">
        <div style="margin-bottom:14px;">
          <div style="font-size:12px;color:var(--muted);">Pharmacy · ${p.name}</div>
          <div style="font-size:16px;font-weight:800;margin-top:4px;">${type} → ${plan}</div>
          <div style="font-size:13px;color:var(--muted);margin-top:4px;">Amount: <b style="color:var(--navy)">${amount}</b></div>
        </div>
        ${isTrial ? `
          <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:14px;">Free trial does not require payment. Submit the request and wait for Admin activation.</p>
          <form onsubmit="return submitSubPaymentRequest(event,'${plan}','${type}',true)">
            <div class="field"><label>Your name / contact person</label><input id="pay-account-name" placeholder="e.g. Ahmed Raza" required></div>
            <div class="field"><label>Note (optional)</label><input id="pay-note" placeholder="Any note for admin"></div>
            <button class="btn btn-primary btn-block" type="submit">Submit trial request</button>
          </form>
        ` : `
          <div style="font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px;">Send payment to</div>
          <div style="display:grid;gap:8px;margin-bottom:16px;">${accountsHtml}</div>
          <p style="font-size:12.5px;color:var(--muted);line-height:1.5;margin-bottom:14px;">Transfer the plan amount to one of the accounts above, then enter your payment details. Admin will match the transaction manually and approve.</p>
          <form onsubmit="return submitSubPaymentRequest(event,'${plan}','${type}',false)">
            <div class="field"><label>Account name (sender name on transfer)</label><input id="pay-account-name" placeholder="Name as shown on bank / wallet transfer" required></div>
            <div class="field"><label>Transaction / reference ID</label><input id="pay-txn-id" placeholder="e.g. TXN982374651" required style="font-family:var(--mono)"></div>
            <div class="field-row">
              <div class="field"><label>Payment date</label><input id="pay-date" type="date" value="${today}" required></div>
              <div class="field"><label>Amount paid</label><input id="pay-amount" placeholder="${amount}" value="${(SUB_PLANS[plan]&&SUB_PLANS[plan].price)||''}"></div>
            </div>
            <div class="field"><label>Note (optional)</label><input id="pay-note" placeholder="Bank used, branch, etc."></div>
            <button class="btn btn-primary btn-block" type="submit">Submit payment request to Admin</button>
          </form>
        `}
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
function submitSubPaymentRequest(e, plan, type, isTrial){
  e.preventDefault();
  const p = getPharmacySub();
  if(!p){ toast('Pharmacy not found'); return false; }
  if(subRequests.some(r=>r.pharmacy===p.name && r.status==='Pending')){
    toast('You already have a pending request.');
    closePaymentModal();
    return false;
  }
  const accountName = fv('pay-account-name');
  const transactionId = isTrial ? '—' : fv('pay-txn-id');
  const paymentDate = isTrial ? new Date().toISOString().slice(0,10) : (fv('pay-date')||new Date().toISOString().slice(0,10));
  const amount = isTrial ? 'Rs. 0' : (fv('pay-amount')||planPriceLabel(plan));
  const note = fv('pay-note')||'';
  if(!accountName || (!isTrial && !transactionId)){
    toast('Please fill required payment fields');
    return false;
  }
  const req = {
    id: 'SR-'+String(1000+(subRequests.length+1)),
    pharmacy: p.name,
    payerName: (typeof PORTAL_META!=='undefined' && PORTAL_META.pharmacy && PORTAL_META.pharmacy.name) ? PORTAL_META.pharmacy.name : accountName,
    accountName,
    transactionId,
    paymentDate,
    amount,
    currentPlan: p.plan || 'Basic',
    requestedPlan: plan,
    type,
    status: 'Pending',
    date: new Date().toISOString().slice(0,10),
    note: note || (type==='Renew' ? 'Renewal with payment proof' : (type+' to '+plan))
  };
  subRequests.unshift(req);
  if(p.subStatus==='Expired') p.subStatus = 'Pending';
  if(typeof persistState==='function') try{ persistState(); }catch(err){}
  closePaymentModal();
  toast('Request sent to Admin · match payment & approve');
  navigateTo('pharmacy','subscription');
  return false;
}
function pharmacySetPlan(plan){
  const p = getPharmacySub();
  if(!p){ toast('Pharmacy not found'); return; }
  if(plan==='Trial'){
    pharmacyRequestSubscription('Trial','Trial');
    return;
  }
  const type = plan===p.plan ? 'Renew'
    : (plan==='Premium' ? 'Upgrade'
    : (p.plan==='Premium' && plan==='Basic' ? 'Downgrade' : 'Change plan'));
  pharmacyRequestSubscription(plan, type);
}
function pharmacyRequestRenew(){
  const p = getPharmacySub();
  if(!p){ toast('Pharmacy not found'); return; }
  pharmacyRequestSubscription(p.plan||'Basic', 'Renew');
}
function adminViewSubRequest(reqId){
  const req = subRequests.find(r=>r.id===reqId);
  if(!req){ toast('Request not found'); return; }
  const existing = document.getElementById('sub-req-detail-overlay');
  if(existing) existing.remove();
  const defaultDays = req.requestedPlan==='Trial' ? 14 : 365;
  const overlay = document.createElement('div');
  overlay.id = 'sub-req-detail-overlay';
  overlay.className = 'receipt-overlay';
  overlay.onclick = (e)=>{ if(e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="receipt-modal" style="max-width:540px;width:100%;" role="dialog">
      <div class="receipt-modal-actions">
        <span style="margin-right:auto;font-weight:800;font-size:14px;">Request ${req.id}</span>
        <button class="btn btn-dark btn-sm" type="button" onclick="document.getElementById('sub-req-detail-overlay').remove()">Close</button>
      </div>
      <div style="padding:18px 22px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
          <div>
            <div style="font-size:16px;font-weight:800;">${req.pharmacy}</div>
            <div style="font-size:12.5px;color:var(--muted);margin-top:3px;">${req.type} · ${req.currentPlan} → ${req.requestedPlan}</div>
          </div>
          ${statusBadge(req.status==='Approved'?'Active':req.status==='Rejected'?'Suspicious':'Pending')}
        </div>
        <div class="detail-grid" style="margin-bottom:14px;">
          <div class="detail-item"><div class="k">Pharmacy</div><div class="v">${req.pharmacy}</div></div>
          <div class="detail-item"><div class="k">User / contact</div><div class="v">${req.payerName||'—'}</div></div>
          <div class="detail-item"><div class="k">Account name (sender)</div><div class="v">${req.accountName||'—'}</div></div>
          <div class="detail-item"><div class="k">Transaction ID</div><div class="v mono">${req.transactionId||'—'}</div></div>
          <div class="detail-item"><div class="k">Payment date</div><div class="v mono">${req.paymentDate||'—'}</div></div>
          <div class="detail-item"><div class="k">Amount claimed</div><div class="v">${req.amount||'—'}</div></div>
          <div class="detail-item"><div class="k">Requested plan</div><div class="v">${planBadge(req.requestedPlan)}</div></div>
          <div class="detail-item"><div class="k">Submitted</div><div class="v mono">${req.date||'—'}</div></div>
        </div>
        ${req.note?`<p style="font-size:12.5px;color:var(--muted);margin-bottom:14px;"><b>Note:</b> ${req.note}</p>`:''}
        ${req.status==='Pending'?`
        <div class="field" style="margin-bottom:12px;">
          <label>Subscription duration</label>
          <select id="approve-duration" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13.5px;font-family:inherit;background:#fff;">
            <option value="14" ${defaultDays===14?'selected':''}>14 days (Trial)</option>
            <option value="30" ${defaultDays===30?'selected':''}>30 days (1 month)</option>
            <option value="90">90 days (3 months)</option>
            <option value="180">180 days (6 months)</option>
            <option value="365" ${defaultDays===365?'selected':''}>365 days (1 year)</option>
            <option value="730">730 days (2 years)</option>
          </select>
        </div>
        <p style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:14px;">Match the transaction ID and account name in your bank/wallet statement, choose duration, then approve.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" type="button" onclick="adminApproveSubRequest('${req.id}')">Approve after match</button>
          <button class="btn btn-outline btn-sm" type="button" onclick="document.getElementById('sub-req-detail-overlay').remove();adminRejectSubRequest('${req.id}')">Reject</button>
        </div>`:''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
}
function adminApproveSubRequest(reqId, daysOverride){
  const req = subRequests.find(r=>r.id===reqId);
  if(!req || req.status!=='Pending'){ toast('Request not found'); return; }
  const p = pharmacies.find(x=>x.name===req.pharmacy);
  if(!p){ toast('Pharmacy not found'); return; }
  let days = daysOverride;
  if(days==null){
    const sel = document.getElementById('approve-duration');
    if(sel) days = parseInt(sel.value,10);
    else days = req.requestedPlan==='Trial' ? 14 : 365;
  }
  days = parseInt(days,10) || (req.requestedPlan==='Trial' ? 14 : 365);
  const overlay = document.getElementById('sub-req-detail-overlay');
  if(overlay) overlay.remove();
  req.status = 'Approved';
  req.approvedDays = days;
  p.plan = req.requestedPlan;
  const start = new Date();
  const end = new Date(start.getTime()+days*86400000);
  p.startDate = start.toISOString().slice(0,10);
  p.expiryDate = end.toISOString().slice(0,10);
  p.subStatus = 'Active';
  p.sub = 'Active';
  if(typeof auditLogs!=='undefined') auditLogs.unshift({user:`${CTX.admin} (Admin)`, action:`Approved ${req.type} → ${req.requestedPlan} for ${days} days · TXN ${req.transactionId||'—'}`, target:p.name, time:nowStr()});
  if(typeof persistState==='function') try{ persistState(); }catch(e){}
  toast(`Approved · ${p.name} · ${p.plan} for ${days} days · until ${p.expiryDate}`);
  navigateTo('admin','subscriptions');
}
function adminRejectSubRequest(reqId){
  const req = subRequests.find(r=>r.id===reqId);
  if(!req){ toast('Request not found'); return; }
  req.status = 'Rejected';
  if(typeof auditLogs!=='undefined') auditLogs.unshift({user:`${CTX.admin} (Admin)`, action:`Rejected ${req.type} · TXN ${req.transactionId||'—'}`, target:req.pharmacy, time:nowStr()});
  toast('Request rejected');
  navigateTo('admin','subscriptions');
}
function premiumLockCard(featureName){
  const p = getPharmacySub();
  const reason = !p ? 'Unknown pharmacy'
    : p.subStatus==='Expired' ? 'Your subscription has expired'
    : p.subStatus==='Pending' ? 'Subscription is pending activation'
    : 'This feature requires an active Premium plan';
  return pageHead(featureName,'Premium feature')
    + `<div class="card" style="border:2px dashed var(--amber);background:#FFFBEB;">
        <div style="display:flex;gap:16px;align-items:flex-start;">
          <div class="aic" style="width:48px;height:48px;border-radius:12px;background:var(--amber-light);color:#92620A;display:flex;align-items:center;justify-content:center;">${ICONS.warn}</div>
          <div>
            <h3 style="font-size:17px;margin-bottom:6px;">${reason}</h3>
            <p style="font-size:13.5px;color:var(--muted);line-height:1.55;max-width:520px;">
              <b>${featureName}</b> is included in the <b>Premium</b> plan.
              Basic includes POS, Inventory, Medicine verification and Sales history only.
              ${p&&p.subStatus==='Expired'?'Renew your plan to restore access.':'Upgrade to Premium for advanced analytics, employee management, demand insights and full reports.'}
            </p>
            <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="navigateTo('pharmacy','subscription')">View subscription</button>
              <button class="btn btn-outline btn-sm" onclick="toast('Upgrade request sent to admin (demo)')">Request upgrade</button>
            </div>
          </div>
        </div>
      </div>`;
}

/* Horizontal supply-chain timeline (reused by admin/vendor/pharmacy/doctor + patient trace) */
function renderChainTimeline(batch){
  const steps = supplyChainMap[batch] || [];
  return `<div class="timeline">${steps.map(s=>`
    <div class="tl-step ${s.status}" onclick='showChainStepDetail(${JSON.stringify(s).replace(/'/g,"&apos;")})'>
      <div class="line"></div>
      <div class="tl-dot">${s.status==='done'?ICONS.check:ICONS.route}</div>
      <div class="tl-info"><h4>${s.stage}</h4><div class="party">${s.party}</div><div class="time">${s.time}</div></div>
    </div>`).join('')}</div>`;
}
function showChainStepDetail(s){
  toast(`${s.stage} · ${s.party} · Qty ${s.qty} · ${s.time}`);
}

