/* ============================================================
   ROLE SELECT / LOGIN / OTP FLOW
   ============================================================ */
const ROLES = [
  {key:'patient', label:'Patient', desc:'Scan & verify medicines, view history and safety alerts', icon:'heart', bg:'var(--green-light)', color:'#067A55'},
  {key:'doctor', label:'Doctor', desc:'Prescriptions, patient history & medicine verification', icon:'stethoscope', bg:'var(--indigo-light)', color:'var(--indigo)'},
  {key:'pharmacy', label:'Pharmacy', desc:'Inventory, sales, QR verification & reporting', icon:'building', bg:'var(--teal-light)', color:'#4338CA'},
  {key:'manufacturer', label:'Manufacturer', desc:'Batches, QR codes, shipments & recalls', icon:'factory', bg:'var(--blue-light)', color:'var(--blue)'},
  {key:'vendor', label:'Vendor / Distributor', desc:'Incoming stock, pharmacy orders & distribution', icon:'truck', bg:'#F1F5F9', color:'#334155'},
  {key:'administrator', label:'Administrator', desc:'Network oversight, approvals & investigations', icon:'gear', bg:'var(--amber-light)', color:'#92620A'},
];
document.getElementById('role-grid').innerHTML = ROLES.map(r=>
  `<div class="role-card" onclick="selectRole('${r.key}')">
    <div class="role-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
    ${icBox(r.icon,r.bg,r.color,52)}
    <h4>${r.label}</h4>
    <p>${r.desc}</p>
  </div>`
).join('');

let selectedRole = null;
let pendingPharmacyStaffEmail = null; // set on staff login before OTP
function togglePasswordVisibility(button){
  const input = button.parentElement.querySelector('input');
  if(!input) return;
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
  button.setAttribute('aria-pressed', String(!visible));
  button.innerHTML = visible
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.3A10.8 10.8 0 0 1 12 4c5 0 8.8 4 10 8a14.8 14.8 0 0 1-3.1 5.3M6.2 6.2C3.9 7.7 2.6 10.1 2 12c1.2 4 5 8 10 8 1 0 2-.2 2.9-.5"></path></svg>';
}
function onPharmacyLoginModeChange(){
  const mode = (document.querySelector('input[name="pharm-login-mode"]:checked')||{}).value || 'owner';
  const hint = document.getElementById('staff-login-hint');
  const ownerLab = document.getElementById('mode-owner-label');
  const staffLab = document.getElementById('mode-staff-label');
  if(hint) hint.style.display = mode==='staff' ? 'block' : 'none';
  if(ownerLab) ownerLab.style.borderColor = mode==='owner' ? 'var(--teal)' : '';
  if(staffLab) staffLab.style.borderColor = mode==='staff' ? 'var(--teal)' : '';
  // Staff accounts are created by the pharmacy owner — no public signup
  const tabs = document.getElementById('login-auth-tabs');
  if(tabs){
    tabs.style.display = (mode==='staff') ? 'none' : (selectedRole==='administrator' ? 'none' : 'flex');
  }
  const email = document.getElementById('login-email');
  if(mode==='staff'){
    if(email && (!email.value || email.value==='demo@pharmachain.pk' || email.value==='owner@medicare.demo')) email.value = 'hassan@medicare.demo';
  } else {
    if(email && ((email.value||'').indexOf('@medicare.demo')>=0 || (email.value||'').indexOf('@prime.demo')>=0)) email.value = 'owner@medicare.demo';
  }
}
function selectRole(key){
  selectedRole = key;
  pendingPharmacyStaffEmail = null;
  currentEmployee = null;
  const r = ROLES.find(x=>x.key===key);
  document.getElementById('selected-role-chip').innerHTML = `${icBox(r.icon,r.bg,r.color,22)} Signing in as ${r.label}`;
  showScreen('screen-login');
  const tabs=document.getElementById('login-auth-tabs');
  if(tabs) tabs.style.display = key==='administrator' ? 'none' : 'flex';
  const modeBox = document.getElementById('pharmacy-login-mode');
  if(modeBox){
    modeBox.style.display = key==='pharmacy' ? 'block' : 'none';
    if(key==='pharmacy'){
      const ownerRadio = document.querySelector('input[name="pharm-login-mode"][value="owner"]');
      if(ownerRadio) ownerRadio.checked = true;
      onPharmacyLoginModeChange();
      const email = document.getElementById('login-email');
      if(email) email.value = 'owner@medicare.demo';
    } else {
      const email = document.getElementById('login-email');
      if(email) email.value = 'demo@pharmachain.pk';
    }
  }
}
function showScreen(id){
  ['screen-role-select','screen-login','screen-otp','screen-signup','screen-forgot'].forEach(s=>{
    const el=document.getElementById(s); if(el) el.style.display = s===id?'flex':'none';
  });
  const tabs=document.getElementById('login-auth-tabs');
  if(tabs){ tabs.style.display = (selectedRole==='administrator') ? 'none' : 'flex'; }
  // Fixed auth overlays scroll internally — lock background page only
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}
function doForgot(e){
  e.preventDefault();
  toast('Password reset link sent to your email');
  showScreen('screen-login');
  return false;
}
function toggleForgot(){ document.getElementById('forgot-panel').classList.toggle('show'); }

function openSignupFromLogin(){
  if(selectedRole==='administrator'){ toast('Admin accounts are provisioned by the system'); return; }
  const mode = (document.querySelector('input[name="pharm-login-mode"]:checked')||{}).value || 'owner';
  if(selectedRole==='pharmacy' && mode==='staff'){
    toast('Staff accounts are created by the pharmacy owner under Employees — not via public signup');
    return;
  }
  prepareSignupForm();
  showScreen('screen-signup');
}
function prepareSignupForm(){
  const r = ROLES.find(x=>x.key===selectedRole) || ROLES[0];
  const chip = document.getElementById('signup-role-chip');
  if(chip) chip.innerHTML = `${icBox(r.icon,r.bg,r.color,22)} Signing up as ${r.label}`;
  const orgField = document.getElementById('signup-org-field');
  const licField = document.getElementById('signup-license-field');
  const orgLabel = document.getElementById('signup-org-label');
  const needsOrg = ['pharmacy','manufacturer','vendor'].includes(selectedRole);
  const needsLic = ['pharmacy','manufacturer','vendor','doctor'].includes(selectedRole);
  if(orgField){ orgField.style.display = needsOrg ? '' : 'none'; orgField.className = 'field'; }
  if(licField){ licField.style.display = needsLic ? '' : 'none'; licField.className = 'field'; }
  if(orgLabel){
    orgLabel.textContent = selectedRole==='manufacturer' ? 'Company name' : selectedRole==='vendor' ? 'Distributor name' : selectedRole==='pharmacy' ? 'Pharmacy name' : 'Organization';
  }
  // Pharmacy signup = owner/org only (staff invited by owner)
  if(chip && selectedRole==='pharmacy'){
    chip.innerHTML = `${icBox(r.icon,r.bg,r.color,22)} Signing up as Pharmacy Owner <span style="font-size:11px;color:var(--muted);font-weight:500;">(staff are added by owner)</span>`;
  }
}
function doSignup(e){
  e.preventDefault();
  const pass = (document.getElementById('signup-pass')||{}).value || '';
  const pass2 = (document.getElementById('signup-pass2')||{}).value || '';
  if(pass !== pass2){ toast('Passwords do not match'); return false; }
  if(pass.length < 6){ toast('Password must be at least 6 characters'); return false; }
  toast('Account created — verify with OTP');
  showScreen('screen-otp');
  return false;
}

function doLogin(e){
  try{
    if(e && e.preventDefault) e.preventDefault();
    pendingPharmacyStaffEmail = null;
    currentEmployee = null;
    const emailEl = document.getElementById('login-email');
    const email = ((emailEl&&emailEl.value)||'').trim().toLowerCase();
    if(selectedRole==='pharmacy'){
      const modeEl = document.querySelector('input[name="pharm-login-mode"]:checked');
      const mode = (modeEl && modeEl.value) || 'owner';
      if(mode==='staff'){
        if(!email){ toast('Enter your staff email'); return false; }
        const emp = pharmacyEmployees.find(function(x){ return (x.email||'').toLowerCase()===email; });
        if(!emp){ toast('Staff not found. Try hassan@medicare.demo'); return false; }
        if(emp.status!=='Active'){ toast('Staff account is inactive'); return false; }
        const ph = pharmacies.find(function(p){ return p.name===emp.pharmacy; });
        if(ph){
          if(ph.plan==='Professional') ph.plan='Premium';
          // Demo safety: refresh expired Premium so staff login works in viva
          if(normalizePlan(ph.plan)==='Premium' && (ph.subStatus==='Expired' || (ph.expiryDate && ph.expiryDate < todayISO()))){
            ph.subStatus='Active'; ph.sub='Active'; ph.expiryDate='2027-12-31';
          }
        }
        const live = ph ? computeSubStatus(ph) : 'Expired';
        if(ph){ ph.subStatus = live; }
        const prem = ph && (live==='Active'||live==='Expiring Soon') && normalizePlan(ph.plan)==='Premium';
        if(!prem){
          toast('Staff login needs active Premium for '+emp.pharmacy+'. Owner can renew under Subscription.');
          return false;
        }
        pendingPharmacyStaffEmail = emp.email;
      }
    }
    showScreen('screen-otp');
  }catch(err){
    console.error(err);
    toast('Login error — retry');
    showScreen('screen-otp');
  }
  return false;
}
function applyEmployeeSession(emp){
  currentEmployee = emp;
  CTX.pharmacy = emp.pharmacy;
  if(PORTAL_META.pharmacy){
    PORTAL_META.pharmacy.name = emp.name;
    PORTAL_META.pharmacy.role = emp.role+' (Staff)';
    PORTAL_META.pharmacy.avatar = emp.name.split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
    PORTAL_META.pharmacy.sub = 'STAFF PORTAL · '+emp.pharmacy;
  }
  logEmployeeAction('LOGIN', emp.id, 'Staff signed in via login screen (demo)');
  if(typeof persistState==='function') try{persistState();}catch(err){}
}
function applyOwnerSession(pharmacyName){
  currentEmployee = null;
  CTX.pharmacy = pharmacyName || CTX.pharmacy || 'MediCare Pharmacy';
  const p = getPharmacySub(CTX.pharmacy);
  if(PORTAL_META.pharmacy){
    PORTAL_META.pharmacy.name = (p&&p.owner) || 'Pharmacy Owner';
    PORTAL_META.pharmacy.role = 'Pharmacy Owner';
    PORTAL_META.pharmacy.avatar = (PORTAL_META.pharmacy.name||'OW').split(' ').map(function(w){return w[0];}).join('').slice(0,2).toUpperCase();
    PORTAL_META.pharmacy.sub = 'PHARMACY PORTAL';
  }
}
function verifyOtp(){
  try{
    const portalMap = {patient:'patient', doctor:'doctor', pharmacy:'pharmacy', manufacturer:'manufacturer', vendor:'vendor', administrator:'admin'};
    const target = portalMap[selectedRole] || 'admin';
    if(target==='patient'){ enterPatientApp(); return; }
    if(target==='pharmacy'){
      if(pendingPharmacyStaffEmail){
        const emp = pharmacyEmployees.find(function(x){ return (x.email||'').toLowerCase()===String(pendingPharmacyStaffEmail).toLowerCase(); });
        if(!emp){ toast('Staff session expired — sign in again'); showScreen('screen-login'); return; }
        applyEmployeeSession(emp);
        pendingPharmacyStaffEmail = null;
        enterDesktopPortal('pharmacy');
        toast('Welcome, '+emp.name+' (staff)');
        return;
      }
      applyOwnerSession('MediCare Pharmacy');
      // Ensure owner demo pharmacy is usable
      const op = getPharmacySub('MediCare Pharmacy');
      if(op && normalizePlan(op.plan)==='Premium' && op.subStatus==='Expired'){
        op.subStatus='Active'; op.sub='Active'; op.expiryDate='2027-12-31';
      }
    } else {
      currentEmployee = null;
    }
    enterDesktopPortal(target);
  }catch(err){
    console.error('verifyOtp', err);
    toast('Could not open portal — try again');
  }
}
function setSidebarOpen(open){
  const shell = document.getElementById('desktop-shell');
  const btn = document.getElementById('menu-toggle');
  const icon = document.getElementById('menu-toggle-icon');
  if(!shell) return;
  if(open){
    shell.classList.remove('sidebar-collapsed');
    // Close control lives only inside the sidebar — hide topbar button while open
    if(btn){ btn.style.display = 'none'; btn.setAttribute('aria-expanded','true'); }
  } else {
    shell.classList.add('sidebar-collapsed');
    // Show hamburger only when sidebar is closed (to open it)
    if(btn){
      btn.style.display = 'inline-flex';
      btn.setAttribute('aria-expanded','false');
      btn.title = 'Open menu';
    }
    if(icon) icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16"/>';
  }
}
function toggleSidebar(){
  const shell = document.getElementById('desktop-shell');
  if(!shell) return;
  // Topbar button only opens; closing is via sidebar X
  if(shell.classList.contains('sidebar-collapsed')) setSidebarOpen(true);
  else setSidebarOpen(false);
}
function toggleUserMenu(e){
  if(e) e.stopPropagation();
  const dd = document.getElementById('user-dropdown');
  if(!dd) return;
  dd.classList.toggle('show');
}
function closeUserMenu(){
  const dd = document.getElementById('user-dropdown');
  if(dd) dd.classList.remove('show');
}
document.addEventListener('click', function(e){
  const wrap = document.querySelector('.user-menu-wrap');
  if(wrap && !wrap.contains(e.target)) closeUserMenu();
});
function doLogout(){
  currentEmployee = null;
  pendingPharmacyStaffEmail = null;
  closeUserMenu();
  backToLanding();
  toast('Signed out');
}

function jumpToPortal(key){
  if(key==='patient') enterPatientApp(); else enterDesktopPortal(key);
}

