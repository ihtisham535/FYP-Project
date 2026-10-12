/* ============================================================
   DOCTOR PORTAL
   ============================================================ */
PAGES.doctor.dashboard = function(){
  const myRx = prescriptions.filter(r=>r.doctor===CTX.doctor);
  const stats = [
    {label:"Total patients", value:(doctors.find(d=>d.name===CTX.doctor)||{patients:0}).patients, delta:"", icon:'heart', bg:'var(--indigo-light)', color:'var(--indigo)'},
    {label:"Today's appointments", value:6, delta:"", icon:'clipboard', bg:'var(--blue-light)', color:'var(--blue)'},
    {label:"Active prescriptions", value:myRx.length, delta:"", icon:'stethoscope', bg:'var(--teal-light)', color:'#4338CA'},
    {label:"Medicine alerts", value:1, delta:"1 recall", icon:'warn', bg:'var(--red-light)', color:'#B91C1C'},
  ];
  return pageHead(`${CTX.doctor} — Dashboard`,'Patients, prescriptions and medicine safety overview',
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('doctor','prescriptions')">${ICONS.plus} New prescription</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('doctor','mypatients')">${ICONS.heart} Patients</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('doctor','medverify')">${ICONS.search_shield} Verify</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('doctor','reports')">${ICONS.clipboard} Reports</button>`)
    + statGrid(stats)
    + card('Recent prescriptions','', dataTable(['Patient','Medicine','Diagnosis','Date'], myRx.slice(0,5).map(r=>[r.patient,r.medicine,r.diagnosis,`<span class="mono">${r.date}</span>`])));
};
PAGES.doctor.mypatients = function(){
  return pageHead('My patients','Authorized patient profiles',
      `<button class="btn btn-primary btn-sm" onclick="openEntityModal('add','patient','')">Add patient</button>`)
    + card('','', dataTable(['Patient ID','Name','Age','City','Records','Actions'], patients.map(p=>[
      `<span class="mono">${p.id}</span>`,p.masked,p.age,p.city,
      `<button class="btn btn-outline btn-sm" onclick="navigateTo('doctor','medhistory','${p.id}')">View history</button>`,
      crudActions('patient', p.id)
    ])));
};
PAGES.doctor.prescriptions = function(){
  const myRx = prescriptions.filter(r=>r.doctor===CTX.doctor);
  const allMeds = [...new Set(medicines.map(m=>m.name))];
  return pageHead('Prescriptions','Create and review patient prescriptions')
    + card('Create prescription','', `<form onsubmit="return actionCreatePrescription(event)">
        <div class="field-row"><div class="field"><label>Patient</label><select id="doc-rx-patient">${patients.map(p=>`<option value="${p.id}">${p.masked} (${p.id})</option>`).join('')}</select></div><div class="field"><label>Medicine</label><select id="doc-rx-medicine">${allMeds.map(n=>`<option>${n}</option>`).join('')}</select></div></div>
        <div class="field-row3"><div class="field"><label>Dosage</label><input id="doc-rx-dosage" placeholder="e.g. 1 tablet"></div><div class="field"><label>Frequency</label><input id="doc-rx-frequency" placeholder="e.g. Twice daily"></div><div class="field"><label>Duration</label><input id="doc-rx-duration" placeholder="e.g. 7 days"></div></div>
        <div class="field"><label>Instructions</label><input id="doc-rx-instructions" placeholder="e.g. Take after meals"></div>
        <div class="field"><label>Diagnosis / context</label><input id="doc-rx-diagnosis" placeholder="e.g. Bacterial throat infection"></div>
        <button class="btn btn-primary" type="submit">Create prescription</button>
      </form>`)
    + card('Prescription history','', dataTable(['ID','Patient','Medicine','Dosage','Date','Actions'], myRx.map(r=>[`<span class="mono">${r.id}</span>`,r.patient,r.medicine,r.dosage,`<span class="mono">${r.date}</span>`,crudActions('prescription',r.id)])));
};
PAGES.doctor.meddb = function(){
  return pageHead('Medicine database','Search safety, manufacturer and recall information')
    + card('','', dataTable(['Medicine','Generic','Manufacturer','Batch','Status'], medicines.map(m=>[m.name,m.generic,m.manufacturer,`<span class="mono">${m.batch}</span>`,statusBadge(m.status)])));
};
PAGES.doctor.medverify = function(){
  return pageHead('Package verification','Identity & supply-chain checks before prescribing')
    + `<div class="privacy-note">${ICONS.info}<div>PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.</div></div>`
    + card('','', `<form onsubmit="return docVerify(event)" style="display:flex;gap:10px;max-width:560px;"><input id="doc-verify-code" placeholder="Package ID e.g. PKG-A8F92K" style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-family:var(--mono);"><button class="btn btn-dark" type="submit">Verify package</button></form>
      <div class="hint-chips" style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" onclick="document.getElementById('doc-verify-code').value='PKG-A8F92K';docVerify(event)">PKG-A8F92K</div>
        <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" onclick="document.getElementById('doc-verify-code').value='PKG-SOLD91';docVerify(event)">PKG-SOLD91</div>
        <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" onclick="document.getElementById('doc-verify-code').value='PKG-FAKE123';docVerify(event)">PKG-FAKE123</div>
      </div>
      <div id="doc-verify-result" style="margin-top:18px;"></div>`);
};
function docVerify(e){
  if(e) e.preventDefault();
  const code = fv('doc-verify-code');
  const result = lookupVerification(code);
  document.getElementById('doc-verify-result').innerHTML = verificationBannerHtml(result, code)
    + card('Checklist','', verificationChecksHtml(result))
    + card('Package record','', verificationDetailGrid(result, code))
    + (result.pkg && supplyChainMap[result.pkg.batch] ? card('Supply-chain history','', renderChainTimeline(result.pkg.batch)) : '');
  return false;
}
PAGES.doctor.medhistory = function(id){
  const p = patients.find(x=>x.id===(id||DOC_PATIENT_ID)) || patients[0];
  DOC_PATIENT_ID = p.id;
  return breadcrumb('My Patients','doctor','mypatients', p.masked)
    + pageHead(`Medication history — ${p.masked}`, p.id)
    + `<div class="privacy-note">${ICONS.info}<div>You are viewing this record as an authorized treating physician.</div></div>`
    + card('','', dataTable(['Medicine','Batch','Pharmacy','Date','Context','Status'], p.entries.map(e=>[e.medicine,`<span class="mono">${e.batch}</span>`,e.pharmacy,`<span class="mono">${e.date}</span>`,e.context,statusBadge(e.usage)])));
};
let DOC_PATIENT_ID = null;
PAGES.doctor.alerts = function(){
  return pageHead('Alerts','Medicine safety notices relevant to your patients')
    + card('','', `<div>${activityList([
      {icon:'warn', bg:'var(--red-light)', color:'#B91C1C', txt:'<b>Risek 20mg</b> (BT-2024-0654) recalled — prescribed to M. Tariq (PT-10891)', time:'3 days ago'},
      {icon:'warn', bg:'var(--amber-light)', color:'#92620A', txt:'<b>Brufen 400mg</b> (BT-2024-1450) flagged as suspicious in Faisalabad', time:'2 hours ago'},
    ])}</div>`);
};
PAGES.doctor.settings = genericSettingsPage('doctor');

