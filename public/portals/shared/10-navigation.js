/* ============================================================
   NAVIGATION ENGINE — DESKTOP PORTALS
   ============================================================ */
let currentPortal = null, currentPage = null;
let chartRegistry = [];
function el(id){ return document.getElementById(id); }
function destroyCharts(){ chartRegistry.forEach(c=>{ try{c.destroy();}catch(e){} }); chartRegistry = []; }

function buildSidebar(portal, activePage){
  let items = (SIDEBARS[portal]||[]).slice();
  if(portal==='pharmacy'){
    // Plan + employee permission filter (demo)
    // Employees always listed so users can discover the module; non-Premium opens lock screen
    items = items.filter(function(it){
      const key = it[0];
      if(key==='employees') return !currentEmployee || empHasPerm('manageEmployees');
      if(key==='analytics') return pharmacyCanAccess('advanced_analytics') || true; // show; page may lock
      if(key==='reports') return true;
      if(key==='incoming' || key==='suppliers') return pharmacyCanAccess('shipments') || pharmacyCanAccess('suppliers') || true;
      if(key==='inventory' || key==='medicines') return pharmacyCanAccess('inventory_view') || empHasPerm('viewInventory') || true;
      if(key==='sales') return pharmacyCanAccess('pos') || empHasPerm('createSales') || true;
      if(key==='patients') return pharmacyCanAccess('patients') || true;
      if(key==='settings') return !currentEmployee; // owner only
      return true;
    });
    if(currentEmployee && !empHasPerm('viewReports')){
      items = items.filter(function(it){ return it[0]!=='counterfeit' && it[0]!=='analytics'; });
    }
  }
  el('nav-scroll').innerHTML = items.map(function(row){
    const key=row[0], label=row[1], icon=row[2];
    var extra = '';
    if(portal==='pharmacy' && key==='employees' && !pharmacyHasPremium()){
      extra = ' <span style="font-size:9px;opacity:.75;font-weight:700;">PREMIUM</span>';
    }
    return '<div class="nav-item '+(key===activePage?'active':'')+'" onclick="navigateTo(\''+portal+'\',\''+key+'\')" title="'+label+'">'+(ICONS[icon]||'')+'<span class="label">'+label+extra+'</span></div>';
  }).join('');
  const meta = PORTAL_META[portal];
  if(meta){
    el('shell-subtitle').textContent = meta.sub + (portal==='pharmacy' && currentEmployee ? ' · STAFF' : '');
    el('shell-avatar').textContent = meta.avatar;
    el('shell-username').textContent = meta.name;
    el('shell-userrole').textContent = meta.role;
  }
}

function navigateTo(portal, page, param){
  destroyCharts();
  // Guard Premium / employee pages
  if(portal==='pharmacy'){
    // employees page handles Premium lock itself via premiumLockCard
    if(page==='employees' && currentEmployee && !empHasPerm('manageEmployees')){ page='dashboard'; toast('Permission denied'); }
    if(page==='settings' && currentEmployee){ page='dashboard'; toast('Settings are owner-only in this demo'); }
    if(page==='sales' && currentEmployee && !empHasPerm('createSales') && !empHasPerm('viewInventory')){ page='dashboard'; toast('Permission denied'); }
  }
  currentPortal = portal; currentPage = page;
  const parentMap = {counterfeitdetail:'counterfeit', medhistory:'mypatients', empdetail:'employees'};
  buildSidebar(portal, parentMap[page] || page);
  const renderer = PAGES[portal][page];
  el('portal-content').innerHTML = renderer ? renderer(param) : `<div class="card">Page not found.</div>`;
  // Defer chart paint until layout has dimensions (fixes blank Chart.js canvases)
  const navToken = (window.__navToken = (window.__navToken||0)+1);
  setTimeout(()=>{
    if(navToken !== window.__navToken) return;
    try{
      if(AFTER[portal] && AFTER[portal][page]) AFTER[portal][page]();
      else if(page==='analytics' || page==='reports' || page==='demand'){
        const partnerData = {
          admin:{labels:['MediSupply','HealthLine','Al-Barakah'], data:[128,94,76]},
          manufacturer:{labels:['Panadol','Augmentin','Brufen','Calpol','Arinac'], data:[12400,5600,6800,2800,3900]},
          vendor:{labels:['Lahore','Karachi','Multan','Faisalabad','Islamabad'], data:[4200,3800,2100,2600,1900]},
          pharmacy:{labels:['Panadol','Augmentin','Brufen','Calpol','Arinac'], data:[120,88,54,63,40]},
        }[portal];
        if(partnerData) initGenericAnalyticsCharts(portal, partnerData.labels, partnerData.data);
      }
      // If Chart.js produced zero-size canvases, convert remaining empty wraps to HTML charts
      setTimeout(()=>{
        if(navToken !== window.__navToken) return;
        document.querySelectorAll('.chart-box canvas').forEach(cv=>{
          const c = (typeof Chart!=='undefined') ? Chart.getChart(cv) : null;
          if(!c || c.width<20 || c.height<20){
            // leave Chart instance; HTML fallback already handles failed creates
          }
        });
      }, 100);
    }catch(err){ console.error('After-render error', err); }
  }, 60);
  document.querySelector('.content').scrollTo(0,0);
  window.scrollTo(0,0);
}

function enterDesktopPortal(portal){
  // Keep currentEmployee if staff just logged in; clear only when entering other portals
  if(portal!=='pharmacy') currentEmployee = null;
  if(portal==='pharmacy' && !CTX.pharmacy) CTX.pharmacy = 'MediCare Pharmacy';

  document.getElementById('screen-role-select').style.display='none';
  document.getElementById('screen-login').style.display='none';
  document.getElementById('screen-otp').style.display='none';
  const su=document.getElementById('screen-signup'); if(su) su.style.display='none';
  document.getElementById('patient-app-wrap').style.display='none';
  document.getElementById('desktop-shell').style.display='flex';
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  setSidebarOpen(true);
  navigateTo(portal,'dashboard');
}

