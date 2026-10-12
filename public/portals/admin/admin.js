/* ============================================================
   PAGE RENDERERS — ADMIN
   ============================================================ */

PAGES.admin.dashboard = function(){
  const stats = [
    {label:"Total users", value:"1,204", delta:"+18 today", icon:'users', bg:'var(--indigo-light)', color:'var(--indigo)'},
    {label:"Manufacturers", value:manufacturers.length, delta:"stable", icon:'factory', bg:'var(--blue-light)', color:'var(--blue)'},
    {label:"Vendors", value:vendors.length, delta:"stable", icon:'truck', bg:'#F1F5F9', color:'#334155'},
    {label:"Pharmacies", value:pharmacies.length, delta:"+2 this month", icon:'building', bg:'var(--teal-light)', color:'#4338CA'},
    {label:"Doctors", value:doctors.length, delta:"+1 pending", icon:'stethoscope', bg:'var(--indigo-light)', color:'var(--indigo)'},
    {label:"Patients", value:"12,406", delta:"+340 this month", icon:'heart', bg:'var(--green-light)', color:'#067A55'},
    {label:"Registered medicines", value:medicines.length+"18", delta:"+12 today", icon:'capsule', bg:'var(--blue-light)', color:'var(--blue)'},
    {label:"Verified medicines", value:"842", delta:"+6.2% vs last week", icon:'check', bg:'var(--green-light)', color:'#067A55'},
    {label:"Suspicious medicines", value:"37", delta:"needs review", icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
    {label:"Counterfeit reports", value:counterfeitReports.length, delta:counterfeitReports.filter(c=>c.status==='Under Investigation').length+" open", icon:'flag', bg:'var(--red-light)', color:'#B91C1C'},
  ];
  const activity = [
    {icon:'truck', bg:'var(--blue-light)', color:'var(--blue)', txt:'<b>MediSupply Distributors</b> shipped BT-2024-1187 to MediCare Pharmacy', time:'12 minutes ago'},
    {icon:'check', bg:'var(--green-light)', color:'#067A55', txt:'<b>MediCare Pharmacy</b> verified Panadol 500mg, batch BT-2024-1187', time:'34 minutes ago'},
    {icon:'warn', bg:'var(--amber-light)', color:'#92620A', txt:'<b>Cityline Pharmacy</b> flagged Brufen 400mg batch BT-2024-1450 as suspicious', time:'2 hours ago'},
    {icon:'building', bg:'var(--indigo-light)', color:'var(--indigo)', txt:'<b>Wellness Point</b> submitted registration for review', time:'5 hours ago'},
    {icon:'cube', bg:'#F1F5F9', color:'#334155', txt:'System recorded '+ledger.length+' ledger transactions', time:'Yesterday'},
  ];
  const alertRows = alerts.map(a=>`<div class="activity-row"><div class="aic" style="background:${a.level==='red'?'var(--red-light)':a.level==='amber'?'var(--amber-light)':'#F1F5F9'};color:${a.level==='red'?'#B91C1C':a.level==='amber'?'#92620A':'#334155'};">${ICONS.warn}</div><div><div class="txt"><b>${a.type}</b> — ${a.detail}</div></div></div>`).join('');
  return pageHead('Dashboard','Network-wide overview across every role in the ecosystem',
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('admin','analytics')">${ICONS.bars} Analytics</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('admin','reports')">${ICONS.clipboard} Reports</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('admin','verification')">${ICONS.search_shield} Verify</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('admin','counterfeit')">${ICONS.flag} Cases</button>`)
    + statGrid(stats)
    + `<div class="grid-2">`
      + card('Recent supply-chain activity','', `<div>${activityList(activity)}</div>`)
      + card('System alerts','Requires admin attention', `<div>${alertRows}</div>`)
    + `</div>`
    + card('Recent verification activity','Latest QR scans across pharmacies', dataTable(['Medicine','Batch','Pharmacy','Result','Time'], [
        ['Panadol 500mg','<span class="mono">BT-2024-1187</span>','MediCare Pharmacy', statusBadge('Verified'), '<span class="mono">12 min ago</span>'],
        ['Brufen 400mg','<span class="mono">BT-2024-1450</span>','Cityline Pharmacy', statusBadge('Suspicious'), '<span class="mono">2 hrs ago</span>'],
        ['Augmentin 625mg','<span class="mono">BT-2024-0932</span>','Rahman Pharmacy', statusBadge('Verified'), '<span class="mono">3 hrs ago</span>'],
        ['Risek 20mg','<span class="mono">BT-2024-0654</span>','Al-Shifa Pharmacy', statusBadge('Recalled'), '<span class="mono">1 day ago</span>'],
      ]));
};
AFTER.admin.dashboard = function(){
  safeChart('chartAdminRegional', { type:'bar', data:{ labels:['Lahore','Karachi','Islamabad','Faisalabad','Multan','Peshawar'], datasets:[{data:[3200,2870,1540,1120,980,860], backgroundColor:'#0EA5A4', borderRadius:6, maxBarThickness:30}] }, options:chartOptsBar() });
};
// inject chart canvas into dashboard via a second card appended (kept separate to control init order)
const _origAdminDash = PAGES.admin.dashboard;
PAGES.admin.dashboard = function(){ return _origAdminDash() + card('Regional sales volume','Units dispensed this month, by city', chartWrap('chartAdminRegional')); };

PAGES.admin.users = function(){
  const rows = users.map(u=>[ `<b>${u.name}</b>`, u.email, `<span class="badge badge-slate">${u.role}</span>`, statusBadge(u.status) ]);
  return pageHead('Users','All accounts across every role in the network')
    + `<div class="toolbar"><div class="search-sm">${ICONS.search_shield}<input placeholder="Search users..." oninput="filterGenericTable(this.value,'admin-users-body')"></div><div class="filters"><button class="chip-filter">All roles</button><button class="chip-filter">Pending only</button></div></div>`
    + card('','', `<div id="admin-users-body">${dataTable(['Name','Email','Role','Status'], rows)}</div>`);
};

function genericApprovalPage(kind, arr, cols, mapRow, title, sub){
  const rows = arr.map((item,idx)=> mapRow(item,idx));
  return pageHead(title, sub) + card('', '', dataTable(cols, rows));
}
PAGES.admin.manufacturers = function(){
  return pageHead('Manufacturers','Registered pharmaceutical manufacturers',
      `<button class="btn btn-primary btn-sm" onclick="openEntityModal('add','manufacturer','')">Add manufacturer</button>`)
    + card('','', dataTable(['Manufacturer','License #','City','Products','Status','Actions'],
      manufacturers.map((m,i)=>[`<b>${m.name}</b>`, `<span class="mono">${m.license||'—'}</span>`, m.city||'—', m.products||0, statusBadge(m.status),
        `<div style="display:flex;gap:4px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="actionApproveToggle('manufacturer',${i},'Approved','Pending')">${m.status==='Approved'?'Set pending':'Approve'}</button>
          ${crudActions('manufacturer', m.name)}
        </div>`])));
};
PAGES.admin.vendors = function(){
  return pageHead('Vendors','Registered distributors in the network',
      `<button class="btn btn-primary btn-sm" onclick="openEntityModal('add','vendor','')">Add vendor</button>`)
    + card('','', dataTable(['Vendor','License #','City','Batches supplied','Status','Actions'],
      vendors.map((v,i)=>[`<b>${v.name}</b>`, `<span class="mono">${v.license||'—'}</span>`, v.city, v.supplied, statusBadge(v.status),
        `<div style="display:flex;gap:4px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="actionApproveToggle('vendor',${i},'Approved','Pending')">${v.status==='Approved'?'Set pending':'Approve'}</button>
          ${crudActions('vendor', v.name)}
        </div>`])));
};
PAGES.admin.pharmacies = function(){
  pharmacies.forEach(p=>{ p.subStatus = computeSubStatus(p); p.sub = p.subStatus==='Expired'?'Expired':(p.subStatus==='Pending'?'Pending':'Active'); });
  return pageHead('Pharmacies','Registered pharmacy partners and subscription overview',
      `<button class="btn btn-primary btn-sm" onclick="openEntityModal('add','pharmacy','')">Add pharmacy</button>`)
    + card('','', dataTable(['Pharmacy','Owner','City','Plan','Sub status','Expiry','Days left','Status','Actions'],
      pharmacies.map((p,i)=>{
        const days = daysRemaining(p);
        return [`<b>${p.name}</b>`, p.owner, p.city, planBadge(p.plan||'Basic'), subStatusBadge(p.subStatus),
          `<span class="mono">${p.expiryDate||'—'}</span>`,
          days<0?`<span style="color:#B91C1C;font-weight:700;">Expired</span>`:`${days}d`,
          statusBadge(p.status),
          `<div style="display:flex;gap:4px;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="navigateTo('admin','subscriptions')">Plan</button>
            <button class="btn btn-outline btn-sm" onclick="actionApproveToggle('pharmacy',${i},'Verified','Suspended')">${p.status==='Suspended'?'Reinstate':'Suspend'}</button>
            ${crudActions('pharmacy', p.name)}
          </div>`];
      })));
};
PAGES.admin.doctors = function(){
  return genericApprovalPage('doctor', doctors, ['Doctor','Specialty','License #','Patients','Status','Actions'],
    (d,i)=>[`<b>${d.name}</b>`, d.specialty, `<span class="mono">${d.license}</span>`, d.patients, statusBadge(d.status),
      `<button class="btn btn-outline btn-sm" onclick="actionApproveToggle('doctor',${i},'Verified','Pending')">${d.status==='Verified'?'Set pending':'Verify'}</button>`],
    'Doctors','Registered and verified physicians');
};
PAGES.admin.patients = function(){
  return pageHead('Patients','Privacy-controlled access — full records require patient consent',
      `<button class="btn btn-primary btn-sm" onclick="openEntityModal('add','patient','')">Add patient</button>`)
    + `<div class="privacy-note">${ICONS.info}<div>Patient identities are shown in masked form. Only authorized pharmacy or doctor accounts can view full medicine history.</div></div>`
    + card('','', dataTable(['Patient ID','Name','Age','City','Records','Actions'],
      patients.map(p=>[`<span class="mono">${p.id}</span>`, p.masked, p.age||'—', p.city||'—', p.entries?p.entries.length:0, crudActions('patient', p.id)])));
};
PAGES.admin.medicines = function(){
  const rows = medicines.map(m=>[`<b>${m.name}</b>`, `<span class="mono">${m.batch}</span>`, m.manufacturer, m.vendor, m.pharmacy, statusBadge(m.status), qrMini(m.code), crudActions('medicine', m.batch)]);
  return pageHead('Medicines','All registered medicine batches network-wide')
    + `<div class="toolbar"><div class="search-sm">${ICONS.search_shield}<input placeholder="Search by name, batch, manufacturer..." oninput="filterGenericTable(this.value,'admin-med-body')"></div></div>`
    + card('','', `<div id="admin-med-body">${dataTable(['Medicine','Batch #','Manufacturer','Vendor','Pharmacy','Status','QR','Actions'], rows)}</div>`);
};
PAGES.admin.supplychain = function(){
  const batches = Object.keys(supplyChainMap);
  const current = ADMIN_SC_BATCH || batches[0];
  return pageHead('Supply chain tracking','Trace any batch from manufacturer to patient', `<select onchange="ADMIN_SC_BATCH=this.value; navigateTo('admin','supplychain')" style="padding:9px 14px;border-radius:8px;border:1px solid var(--border);font-size:13px;">${batches.map(b=>`<option value="${b}" ${b===current?'selected':''}>${findMed(b).name} — ${b}</option>`).join('')}</select>`)
    + card('','', renderChainTimeline(current))
    + card('Shipment log','', dataTable(['Stage','Party','Location','Time','Qty','Transaction'], supplyChainMap[current].map(s=>[s.stage,s.party,s.loc,`<span class="mono">${s.time}</span>`,s.qty,`<span class="mono">${s.tx}</span>`])));
};
let ADMIN_SC_BATCH = null;
PAGES.admin.verification = function(){
  return pageHead('Verification Center','Manually verify any medicine code and review recent scans')
    + card('Manual lookup','', `<form onsubmit="return adminVerify(event)" style="display:flex;gap:10px;max-width:520px;"><input id="admin-verify-code" placeholder="e.g. MED-2024-0113" style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-family:var(--mono);"><button class="btn btn-dark" type="submit">Verify</button></form><div id="admin-verify-result" style="margin-top:18px;"></div>`)
    + card('Recent verification attempts','', dataTable(['Medicine','Batch','Result','Location','Time'], [
        ['Panadol 500mg','<span class="mono">BT-2024-1187</span>', statusBadge('Verified'), 'MediCare Pharmacy', '<span class="mono">2024-01-18 12:40</span>'],
        ['Brufen 400mg','<span class="mono">BT-2024-1450</span>', statusBadge('Suspicious'), 'Cityline Pharmacy', '<span class="mono">2024-03-26 14:22</span>'],
      ]));
};
function adminVerify(e){
  e.preventDefault();
  const code = fv('admin-verify-code');
  const result = lookupVerification(code);
  document.getElementById('admin-verify-result').innerHTML = verificationBannerHtml(result, code) + verificationDetailGrid(result, code);
  return false;
}
PAGES.admin.counterfeit = function(){
  const rows = counterfeitReports.map(c=>[`<span class="mono">${c.id}</span>`, c.medicine, c.reportedBy, c.location, `<span class="mono">${c.date}</span>`, statusBadge(c.status), `<button class="btn btn-outline btn-sm" onclick="navigateTo('admin','counterfeitdetail','${c.id}')">Investigate</button>`]);
  return pageHead('Counterfeit Detection Center','Investigate suspicious and counterfeit medicine reports')
    + card('','', dataTable(['Case ID','Medicine','Reported by','Location','Date','Status','Action'], rows));
};
PAGES.admin.counterfeitdetail = function(id){
  const c = counterfeitReports.find(x=>x.id===(id||ADMIN_CF_ID)) || counterfeitReports[0];
  ADMIN_CF_ID = c.id;
  return breadcrumb('Counterfeit Reports','admin','counterfeit', c.id)
    + pageHead(`Case ${c.id}`, c.medicine+' · '+(c.batch||'—'))
    + card('Case details','', `<div class="detail-grid">
        <div class="detail-item"><div class="k">Medicine</div><div class="v">${c.medicine}</div></div>
        <div class="detail-item"><div class="k">Batch</div><div class="v mono">${c.batch}</div></div>
        <div class="detail-item"><div class="k">Reported by</div><div class="v">${c.reportedBy}</div></div>
        <div class="detail-item"><div class="k">Location</div><div class="v">${c.location}</div></div>
        <div class="detail-item"><div class="k">Date</div><div class="v mono">${c.date}</div></div>
        <div class="detail-item"><div class="k">Status</div><div class="v">${statusBadge(c.status)}</div></div>
      </div><div class="section-title">Reason</div><p style="font-size:13.5px;">${c.reason}</p>
      <div class="section-title">Supply-chain evidence</div>${c.batch && supplyChainMap[c.batch] ? renderChainTimeline(c.batch) : '<p style="font-size:12.5px;color:var(--muted);">No supply-chain record linked.</p>'}
      <div style="display:flex;gap:10px;margin-top:22px;">
        <button class="btn btn-dark" onclick="actionInvestigate('${c.id}','Under Investigation')">Mark under investigation</button>
        <button class="btn btn-red" onclick="actionInvestigate('${c.id}','Confirmed Counterfeit')">Mark counterfeit</button>
        <button class="btn btn-green" onclick="actionInvestigate('${c.id}','Resolved')">Resolve case</button>
      </div>`);
};
let ADMIN_CF_ID = null;
PAGES.admin.ledger = function(){
  return pageHead('Digital Ledger','Tamper-evident record of every supply-chain event')
    + `<div class="chain-banner">${ICONS.cube}<div><div class="t">Ledger Integrity: VERIFIED</div><div class="s">Every record is chained to the one before it — altering history breaks the chain and is immediately detectable.</div></div></div>`
    + card('','', dataTable(['Transaction ID','Medicine / Batch','Previous record','Current record','Timestamp','Actor','Status'],
        ledger.map(l=>[`<span class="mono">${l.tx}</span>`, l.ref, `<span class="hash">${l.prev.slice(0,10)}…</span>`, `<span class="hash">${l.curr.slice(0,10)}…</span>`, `<span class="mono">${l.time}</span>`, l.actor, statusBadge(l.status)])));
};
PAGES.admin.subscriptions = function(){
  pharmacies.forEach(p=>{ p.subStatus = computeSubStatus(p); });
  const counts = {
    active: pharmacies.filter(p=>p.subStatus==='Active').length,
    expiring: pharmacies.filter(p=>p.subStatus==='Expiring Soon').length,
    expired: pharmacies.filter(p=>p.subStatus==='Expired').length,
    pending: pharmacies.filter(p=>p.subStatus==='Pending').length,
    pro: pharmacies.filter(p=>p.plan==='Premium').length,
  };
  const pendingReqs = subRequests.filter(r=>r.status==='Pending');
  return pageHead('Subscriptions','Assign plans, status and expiry for pharmacy partners (demo — no payments)')
    + statGrid([
      {label:'Active', value:counts.active, delta:'', icon:'check', bg:'var(--green-light)', color:'#067A55'},
      {label:'Expiring soon', value:counts.expiring, delta:'≤14 days', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
      {label:'Expired', value:counts.expired, delta:'', icon:'x', bg:'var(--red-light)', color:'#B91C1C'},
      {label:'Pending requests', value:pendingReqs.length, delta:counts.pending+' pending status', icon:'clipboard', bg:'#F1F5F9', color:'#334155'},
      {label:'Premium plans', value:counts.pro, delta:'of '+pharmacies.length, icon:'cube', bg:'var(--indigo-light)', color:'var(--indigo)'},
    ])
    + card('Pharmacy payment requests','Match transaction ID & account name in your bank statement, then approve or reject',
        pendingReqs.length ? dataTable(['Request','Pharmacy','Type','Plan','Account name','Txn ID','Pay date','Amount','Actions'],
          pendingReqs.map(r=>[
            `<span class="mono">${r.id}</span>`,
            `<b>${r.pharmacy}</b><div style="font-size:11px;color:var(--muted)">${r.payerName||''}</div>`,
            r.type,
            planBadge(r.requestedPlan),
            r.accountName||'—',
            `<span class="mono">${r.transactionId||'—'}</span>`,
            `<span class="mono">${r.paymentDate||r.date||'—'}</span>`,
            r.amount||'—',
            `<button class="btn btn-outline btn-sm" onclick="adminViewSubRequest('${r.id}')">View &amp; approve</button>
             <button class="btn btn-outline btn-sm" onclick="adminRejectSubRequest('${r.id}')">Reject</button>`
          ]))
        : `<p style="font-size:13px;color:var(--muted);margin:0;">No pending payment requests. Pharmacies submit transaction ID after paying to PharmaChain accounts.</p>`)
    + (subRequests.filter(r=>r.status!=='Pending').length
        ? card('Recent decisions','Approved / rejected history', dataTable(['Request','Pharmacy','Type','Plan','Txn ID','Status','Date'],
            subRequests.filter(r=>r.status!=='Pending').slice(0,8).map(r=>[
              `<span class="mono">${r.id}</span>`, r.pharmacy, r.type, planBadge(r.requestedPlan),
              `<span class="mono">${r.transactionId||'—'}</span>`,
              statusBadge(r.status==='Approved'?'Active':'Suspicious'), `<span class="mono">${r.date}</span>`
            ])))
        : '')
    + card('Available plans','Pharmacy subscription tiers (demo — no payments)', `<div class="plan-cards">
        <div class="plan-card">
          <div class="pc-name">${SUB_PLANS.Trial.name}</div>
          <div class="pc-price">${SUB_PLANS.Trial.price}<span>${SUB_PLANS.Trial.period}</span></div>
          <div class="pc-tag">${SUB_PLANS.Trial.tagline}</div>
          <ul>${SUB_PLANS.Trial.features.map(f=>`<li><span class="ck">✓</span>${f}</li>`).join('')}</ul>
          <div style="margin-top:12px;"><button class="btn btn-outline btn-sm" onclick="startFreeTrial('Wellness Point')">Assign trial (demo)</button></div>
        </div>
        <div class="plan-card">
          <div class="pc-name">${SUB_PLANS.Basic.name}</div>
          <div class="pc-price">${SUB_PLANS.Basic.price}<span>${SUB_PLANS.Basic.period}</span></div>
          <div class="pc-tag">${SUB_PLANS.Basic.tagline}</div>
          <ul>${SUB_PLANS.Basic.features.map(f=>`<li><span class="ck">✓</span>${f}</li>`).join('')}
          ${(SUB_PLANS.Basic.missing||[]).map(f=>`<li class="miss"><span class="ck">–</span>${f}</li>`).join('')}</ul>
        </div>
        <div class="plan-card featured">
          <div class="pc-badge">Recommended</div>
          <div class="pc-name">${SUB_PLANS.Premium.name}</div>
          <div class="pc-price">${SUB_PLANS.Premium.price}<span>${SUB_PLANS.Premium.period}</span></div>
          <div class="pc-tag">${SUB_PLANS.Premium.tagline}</div>
          <ul>${SUB_PLANS.Premium.features.map(f=>`<li><span class="ck">✓</span>${f}</li>`).join('')}</ul>
        </div>
      </div>`)
    + card('Manage pharmacy subscriptions','Change plan, status or expiry — takes effect immediately in the prototype',
      dataTable(['Pharmacy','City','Plan','Status','Start','Expiry','Days left','Actions'],
        pharmacies.map((p,i)=>{
          const days = daysRemaining(p);
          return [`<b>${p.name}</b>`, p.city, planBadge(p.plan||'Basic'), subStatusBadge(p.subStatus),
            `<span class="mono">${p.startDate||'—'}</span>`, `<span class="mono">${p.expiryDate||'—'}</span>`,
            days<0?`<span style="color:#B91C1C;font-weight:700;">Expired</span>`:`${days}d`,
            `<button class="btn btn-outline btn-sm" onclick="adminOpenSubEditor(${i})">Edit</button>`];
        })))
    + `<div id="admin-sub-editor"></div>`;
};
function adminOpenSubEditor(idx){
  const p = pharmacies[idx];
  if(!p) return;
  const host = document.getElementById('admin-sub-editor');
  if(!host) return;
  host.innerHTML = card(`Edit subscription — ${p.name}`,'Demo controls only · no payment gateway', `
    <form onsubmit="return adminSaveSubscription(event,${idx})">
      <div class="field-row3">
        <div class="field"><label>Plan</label>
          <select id="admin-sub-plan">
            <option value="Trial" ${p.plan==='Trial'||p.plan==='Free Trial'?'selected':''}>Free Trial</option>
            <option value="Basic" ${p.plan==='Basic'?'selected':''}>Basic</option>
            <option value="Premium" ${p.plan==='Premium'?'selected':''}>Premium</option>
          </select>
        </div>
        <div class="field"><label>Status</label>
          <select id="admin-sub-status">
            <option value="Active" ${p.subStatus==='Active'?'selected':''}>Active</option>
            <option value="Expiring Soon" ${p.subStatus==='Expiring Soon'?'selected':''}>Expiring Soon</option>
            <option value="Expired" ${p.subStatus==='Expired'?'selected':''}>Expired</option>
            <option value="Pending" ${p.subStatus==='Pending'?'selected':''}>Pending</option>
          </select>
        </div>
        <div class="field"><label>Start date</label><input id="admin-sub-start" type="date" value="${p.startDate||''}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Expiry date</label><input id="admin-sub-expiry" type="date" value="${p.expiryDate||''}" required></div>
        <div class="field"><label>Quick actions</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('admin-sub-expiry').value='${todayISO().slice(0,8)}'+(Number(todayISO().slice(8))+7)">+7 days</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('admin-sub-plan').value='Premium'">Set Premium</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('admin-sub-status').value='Expired'">Mark expired</button>
          </div>
        </div>
      </div>
      <button class="btn btn-primary" type="submit">Save subscription</button>
      <button class="btn btn-outline" type="button" onclick="document.getElementById('admin-sub-editor').innerHTML=''" style="margin-left:8px;">Cancel</button>
    </form>`);
  host.scrollIntoView({behavior:'smooth', block:'nearest'});
}
function adminSaveSubscription(e, idx){
  e.preventDefault();
  const p = pharmacies[idx];
  if(!p) return false;
  p.plan = fv('admin-sub-plan') || 'Basic';
  p.startDate = fv('admin-sub-start') || p.startDate;
  p.expiryDate = fv('admin-sub-expiry') || p.expiryDate;
  const forced = fv('admin-sub-status');
  // If status forced to Expired/Pending keep it; else recompute from dates
  if(forced==='Pending'){ p.subStatus='Pending'; p.sub='Pending'; }
  else if(forced==='Expired'){ p.subStatus='Expired'; p.sub='Expired'; }
  else {
    p.subStatus = computeSubStatus(p);
    // allow force Expiring Soon only if still not expired
    if(forced==='Expiring Soon' && p.subStatus!=='Expired') p.subStatus='Expiring Soon';
    if(forced==='Active' && p.subStatus!=='Expired') p.subStatus='Active';
    p.sub = p.subStatus==='Expired'?'Expired':'Active';
  }
  auditLogs.unshift({user:`${CTX.admin} (Admin)`, action:`Updated subscription (${p.plan} / ${p.subStatus})`, target:p.name, time:nowStr()});
  toast(`${p.name}: ${p.plan} · ${p.subStatus} · expires ${p.expiryDate}`);
  navigateTo('admin','subscriptions');
  return false;
}
PAGES.admin.auditlogs = function(){
  return pageHead('Audit Logs','Every administrative action taken on the platform')
    + card('','', dataTable(['User','Action','Target','Time'], auditLogs.map(a=>[a.user,a.action,a.target,`<span class="mono">${a.time}</span>`])));
};
PAGES.admin.settings = genericSettingsPage('admin');

