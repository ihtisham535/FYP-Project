/* ============================================================
   PHARMACY PORTAL
   ============================================================ */
PAGES.pharmacy.dashboard = function(){
  const stock = pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy);
  const today = new Date().toISOString().slice(0,10);
  const todaySales = sales.filter(s=>s.pharmacy===CTX.pharmacy && s.date===today);
  const allSales = sales.filter(s=>s.pharmacy===CTX.pharmacy);
  const revenue = todaySales.reduce((a,s)=>a+Number(s.total||0),0);
  const lowStock = stock.filter(s=>Number(s.qty)<=20);
  const expiring = stock.filter(s=>s.exp && s.exp < '2026-01-01');
  const incoming = shipments.filter(s=>s.to===CTX.pharmacy && !['Confirmed','Received','Recalled'].includes(s.status));
  const sub = getPharmacySub();
  const days = sub ? daysRemaining(sub) : 0;
  const subBanner = !sub ? ''
    : sub.subStatus==='Expired'
    ? `<div class="card" style="border:2px solid var(--red);background:#FEF2F2;margin-bottom:16px;"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;gap:12px;align-items:center;"><div class="aic" style="background:var(--red-light);color:#B91C1C;">${ICONS.warn}</div>
        <div><b style="color:#B91C1C;">Subscription expired</b><div style="font-size:12.5px;color:#991B1B;">Premium features locked · Plan ${sub.plan} ended ${sub.expiryDate}</div></div></div>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','subscription')">View subscription</button></div></div>`
    : sub.subStatus==='Expiring Soon'
    ? `<div class="card" style="border:2px solid var(--amber);background:#FFFBEB;margin-bottom:16px;"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;gap:12px;align-items:center;"><div class="aic" style="background:var(--amber-light);color:#92620A;">${ICONS.warn}</div>
        <div><b style="color:#92620A;">Expiring in ${days} day(s)</b><div style="font-size:12.5px;color:#92400E;">${planBadge(sub.plan)} · expires ${sub.expiryDate}</div></div></div>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','subscription')">Manage plan</button></div></div>`
    : `<div class="card" style="margin-bottom:16px;"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">${planBadge(sub.plan)} ${subStatusBadge(sub.subStatus)}
        <span style="font-size:12.5px;color:var(--muted);">${days} days left · expires ${sub.expiryDate}</span></div>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','subscription')">Subscription</button></div></div>`;
  const invUnits = stock.reduce((a,s)=>a+Number(s.qty||0),0);
  const expSoon = stock.filter(s=>{ const d=Math.round((new Date((s.exp||'2099')+'T00:00:00')-new Date(today+'T00:00:00'))/86400000); return d>=0&&d<=60; });
  const stats = [
    {label:"Today's sales", value:todaySales.length, delta:todaySales.length? 'txns today':'no sales yet', icon:'clipboard', bg:'var(--blue-light)', color:'var(--blue)'},
    {label:"Today's revenue", value:'Rs. '+revenue.toLocaleString(), delta:'', icon:'bars', bg:'var(--green-light)', color:'#067A55'},
    {label:"Total inventory", value:invUnits.toLocaleString(), delta:stock.length+' SKUs', icon:'box', bg:'var(--teal-light)', color:'#4338CA'},
    {label:"Low stock", value:lowStock.length, delta:lowStock.length?'reorder':'OK', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
    {label:"Expiring soon", value:expSoon.length, delta:'≤60 days', icon:'history', bg:'#FEF3C7', color:'#B45309'},
    {label:"Pending shipments", value:incoming.length, delta:'awaiting receipt', icon:'truck', bg:'var(--indigo-light)', color:'var(--indigo)'},
  ];
  return pageHead(`${CTX.pharmacy} — Dashboard`,'Pharmacy operations overview',
      `<button class="btn btn-primary btn-sm" onclick="navigateTo('pharmacy','sales')">${ICONS.clipboard} Open POS</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','incoming')">${ICONS.truck} Incoming</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','inventory')">${ICONS.box} Inventory</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','employees')">${ICONS.users} Employees</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','reports')">${ICONS.clipboard} Reports</button>`)
    + subBanner
    + statGrid(stats)
    + `<div class="grid-2-even">`
    + card('Sales overview','Units sold (recent POS)', chartWrap('chart-pharm-dash-sales'))
    + card('Top selling medicines','By quantity', chartWrap('chart-pharm-dash-top'))
    + `</div>`
    + `<div class="grid-2-even">`
    + card('Inventory status','In stock / low / out / expiring', chartWrap('chart-pharm-dash-inv','sm'))
    + card('Recent transactions','', dataTable(['Txn','Medicine','Customer','Total','Date'], allSales.slice(0,6).map(s=>[`<span class="mono">${s.id||'—'}</span>`,s.medicine,s.patient,s.price||('Rs. '+s.total),`<span class="mono">${s.date}</span>`])))
    + `</div>`
    + card('Incoming shipments','Confirm receipt to add stock (dispatch alone does not)',
        incoming.length
          ? dataTable(['Shipment','Vendor','Medicine','Qty','ETA','Status','Action'], incoming.map(s=>[
              `<span class="mono">${s.id}</span>`, s.vendor||s.from, s.product||s.medicine, s.qty,
              `<span class="mono">${s.expectedDate||'—'}</span>`, statusBadge(s.status),
              `<button class="btn btn-primary btn-sm" onclick="actionConfirmReceipt('${s.id}','pharmacy','dashboard')">Confirm receipt</button>`
            ]))
          : '<p style="font-size:13px;color:var(--muted);">No pending inbound shipments.</p>');
};
AFTER.pharmacy.dashboard = function(){
  const mySales = sales.filter(s=>s.pharmacy===CTX.pharmacy);
  const byDate = {};
  mySales.forEach(s=>{ byDate[s.date]=(byDate[s.date]||0)+Number(s.qty||0); });
  const dates = Object.keys(byDate).sort();
  const labels = dates.length? dates.map(d=>d.slice(5)) : ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const data = dates.length? dates.map(d=>byDate[d]) : [8,12,10,15,9,14];
  safeChart('chart-pharm-dash-sales', { type:'line', data:{ labels, datasets:[{ label:'Units', data, borderColor:'#0EA5A4', backgroundColor:'rgba(14,165,164,.12)', fill:true, tension:.35, pointRadius:3 }] }, options:chartOptsLine() });
  const medMap = {};
  mySales.forEach(s=>{ medMap[s.medicine]=(medMap[s.medicine]||0)+Number(s.qty||0); });
  let tops = Object.entries(medMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(!tops.length) tops = [['Panadol 500mg',24],['Augmentin 625mg',12],['Brufen 400mg',10]];
  safeChart('chart-pharm-dash-top', { type:'bar', data:{ labels:tops.map(t=>t[0].split(' ')[0]), datasets:[{ data:tops.map(t=>t[1]), backgroundColor:'#6366F1', borderRadius:6, maxBarThickness:32 }] }, options:chartOptsBar() });
  const stock = pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy);
  const counts = {in:0,low:0,out:0,exp:0};
  stock.forEach(s=>{ const st=posStockStatus(s); if(st.key==='in') counts.in++; else if(st.key==='low') counts.low++; else if(st.key==='out') counts.out++; else counts.exp++; });
  safeChart('chart-pharm-dash-inv', { type:'doughnut', data:{ labels:['In Stock','Low Stock','Out of Stock','Expiring'], datasets:[{ data:[counts.in||1,counts.low,counts.out,counts.exp], backgroundColor:['#10B981','#F59E0B','#EF4444','#FBBF24'], borderWidth:0 }] }, options:{ plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}} } });
};
PAGES.pharmacy.inventory = function(){
  const mine = pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy);
  const today = new Date().toISOString().slice(0,10);
  const withStatus = mine.map(s=>{
    const st = posStockStatus(s);
    const med = findMed(s.batch)||{};
    return {...s, st, generic:med.generic||'—'};
  });
  const low = withStatus.filter(s=>s.st.key==='low').length;
  const expSoon = withStatus.filter(s=>s.st.key==='exp').length;
  const expired = withStatus.filter(s=>s.st.key==='expired').length;
  const out = withStatus.filter(s=>s.st.key==='out').length;
  return pageHead('Inventory','Stock control for '+CTX.pharmacy, `<button class="btn btn-primary btn-sm" onclick="navigateTo('pharmacy','sales')">Open POS</button>`)
    + statGrid([
      {label:'SKUs', value:mine.length, delta:'', icon:'capsule', bg:'var(--teal-light)', color:'#4338CA'},
      {label:'Low stock', value:low, delta:low?'Reorder':'', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
      {label:'Expiring soon', value:expSoon, delta:'≤60 days', icon:'history', bg:'#FEF3C7', color:'#B45309'},
      {label:'Expired / Out', value:expired+' / '+out, delta:'', icon:'x', bg:'var(--red-light)', color:'#B91C1C'},
    ])
    + (low||expSoon||expired ? `<div class="card" style="border:1px solid var(--amber);background:#FFFBEB;margin-bottom:16px;">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <div class="aic" style="background:var(--amber-light);color:#92620A;">${ICONS.warn}</div>
          <div><b>Stock alerts</b><div style="font-size:13px;color:#92400E;margin-top:4px;">${low} low-stock · ${expSoon} expiring within 60 days · ${expired} expired. Review before dispensing.</div></div>
        </div></div>` : '')
    + `<div class="toolbar">
        <div class="search-sm">${ICONS.search_shield}<input placeholder="Search medicine, batch, manufacturer…" oninput="filterGenericTable(this.value,'pharm-inv-body')"></div>
        <div class="filters">
          <button class="chip-filter" onclick="filterInvStatus('all',this)">All</button>
          <button class="chip-filter" onclick="filterInvStatus('low',this)">Low Stock</button>
          <button class="chip-filter" onclick="filterInvStatus('exp',this)">Expiring Soon</button>
          <button class="chip-filter" onclick="filterInvStatus('expired',this)">Expired</button>
          <button class="chip-filter" onclick="filterInvStatus('out',this)">Out of Stock</button>
        </div>
      </div>`
    + card('Stock ledger','Updated only after confirmed shipments and POS sales',
      `<div id="pharm-inv-body">${dataTable(
        ['Medicine','Generic','Manufacturer','Batch','Packages','Qty','Sell price','Expiry','Status','Actions'],
        withStatus.map(m=>[
          `<b>${m.medicine}</b>`, m.generic, m.manufacturer,
          `<span class="mono">${m.batch}</span>`,
          `<span class="mono">${(m.packages||[]).length}</span>`,
          m.qty, 'Rs. '+m.unitPrice, `<span class="mono">${m.exp}</span>`,
          `<span class="badge ${m.st.cls}">${m.st.label}</span>`,
          crudActions('stock', m.batch)
        ])
      )}</div>`)
    + card('Expiry alerts','30 / 60 day windows', (()=>{
        const d30=[], d60=[], expd=[];
        withStatus.forEach(s=>{
          const days = Math.round((new Date((s.exp||'2099')+'T00:00:00')-new Date(today+'T00:00:00'))/86400000);
          if(days<0) expd.push(s);
          else if(days<=30) d30.push(s);
          else if(days<=60) d60.push(s);
        });
        return dataTable(['Window','Medicine','Batch','Qty','Expiry'],
          d30.map(s=>['≤30 days',s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,`<span class="mono">${s.exp}</span>`])
          .concat(d60.map(s=>['≤60 days',s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,`<span class="mono">${s.exp}</span>`]))
          .concat(expd.map(s=>['Expired',s.medicine,`<span class="mono">${s.batch}</span>`,s.qty,`<span class="mono">${s.exp}</span>`]))
        ) || '<p style="font-size:13px;color:var(--muted);">No expiry alerts.</p>';
      })());
};
function filterInvStatus(key, btn){
  document.querySelectorAll('.filters .chip-filter').forEach(b=>b.style.background='');
  if(btn) btn.style.background='var(--teal-light)';
  const rows = document.querySelectorAll('#pharm-inv-body tbody tr');
  rows.forEach(tr=>{
    const txt = tr.textContent.toLowerCase();
    if(key==='all'){ tr.style.display=''; return; }
    const map = {low:'low stock', exp:'expiring soon', expired:'expired', out:'out of stock'};
    tr.style.display = txt.includes(map[key]) ? '' : 'none';
  });
}
PAGES.pharmacy.medicines = PAGES.pharmacy.inventory;
PAGES.pharmacy.incoming = function(){
  const mine = shipments.filter(s=>s.to===CTX.pharmacy);
  const pending = mine.filter(s=>!['Confirmed','Recalled'].includes(s.status));
  return pageHead('Incoming shipments','Vendor → Pharmacy. Confirm receipt to add stock (dispatch alone does not).')
    + card('Shipment workflow','', `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:12px;font-weight:700;">
        <span class="badge badge-slate">Prepared</span><span style="color:#94A3B8">→</span>
        <span class="badge badge-blue">Dispatched</span><span style="color:#94A3B8">→</span>
        <span class="badge badge-indigo">In Transit</span><span style="color:#94A3B8">→</span>
        <span class="badge badge-amber">Received</span><span style="color:#94A3B8">→</span>
        <span class="badge badge-green">Confirmed</span>
      </div>
      <p style="font-size:12.5px;color:var(--muted);margin-top:10px;"><b>${pending.length}</b> shipment(s) awaiting your confirmation. Viewing QR / package IDs does not receive stock — use <b>Confirm receipt</b>.</p>`)
    + card('Incoming shipments','', dataTable(['Shipment ID','Vendor','Product','Batch','Qty','Dispatch','ETA','Status','Actions'], mine.map(s=>[
      `<span class="mono">${s.id}</span>`,
      s.vendor && s.vendor!=='—' ? s.vendor : s.from,
      s.product||s.medicine,
      `<span class="mono">${s.batch}</span>`,
      s.qty,
      `<span class="mono">${s.dispatchDate||s.date}</span>`,
      `<span class="mono">${s.expectedDate||'—'}</span>`,
      statusBadge(s.status),
      (s.status==='Confirmed'||s.status==='Recalled')
        ? `<button class="btn btn-outline btn-sm" onclick="actionViewShipment('${s.id}')">View / QR</button>`
        : `<button class="btn btn-primary btn-sm" onclick="actionConfirmReceipt('${s.id}','pharmacy','incoming')">Confirm receipt</button>
           <button class="btn btn-outline btn-sm" onclick="actionViewShipment('${s.id}')">View / QR</button>
           <button class="btn btn-outline btn-sm" onclick="toast('Issue reported to vendor')">Report issue</button>`
    ])));
};
PAGES.pharmacy.sales = function(){
  const mySales = sales.filter(s=>s.pharmacy===CTX.pharmacy);
  const cats = ['All',...new Set(pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy).map(s=>(findMed(s.batch)||{}).category||'—'))];
  const mfgs = ['All',...new Set(pharmacyStock.filter(s=>s.pharmacy===CTX.pharmacy).map(s=>s.manufacturer))];
  let receiptHtml = '';
  if(lastReceipt){
    const lines = lastReceipt.items || [lastReceipt];
    receiptHtml = `
    <div class="receipt-overlay" id="pos-receipt-overlay" onclick="if(event.target===this){lastReceipt=null;navigateTo('pharmacy','sales')}">
      <div class="receipt-modal" role="dialog" aria-label="Sale receipt">
        <div class="receipt-modal-actions">
          <button class="btn btn-outline btn-sm" onclick="toast('Sent to thermal printer (demo)')">Print</button>
          <button class="btn btn-dark btn-sm" onclick="lastReceipt=null;navigateTo('pharmacy','sales')">Close · New sale</button>
        </div>
        <div class="receipt-slip">
          <div class="r-center">
            <div class="r-title">${lastReceipt.pharmacy||CTX.pharmacy}</div>
            <div class="r-sub">PharmaChain POS · Sales receipt</div>
            <div class="r-sub" style="margin-top:6px;">${lastReceipt.id}</div>
          </div>
          <hr class="r-dash">
          <div class="r-row"><span>Date</span><span>${lastReceipt.date} ${lastReceipt.time||''}</span></div>
          <div class="r-row"><span>Cashier</span><span>${lastReceipt.cashier||'Staff'}</span></div>
          <div class="r-row"><span>Customer</span><span>${lastReceipt.patient}</span></div>
          <div class="r-row"><span>Payment</span><span>${lastReceipt.payment||'Cash'}</span></div>
          <hr class="r-dash">
          ${lines.map(it=>`<div class="r-item">
            <div class="r-item-name">${it.medicine}</div>
            <div class="r-muted">Batch ${it.batch}${it.packageId&&it.packageId!=='—'?' · '+it.packageId:''}</div>
            <div class="r-row"><span>${it.qty} × ${it.unitPrice}</span><span>Rs. ${it.total}</span></div>
          </div>`).join('')}
          <hr class="r-dash">
          <div class="r-row"><span>Subtotal</span><span>Rs. ${(lastReceipt.subtotal||lastReceipt.total).toLocaleString()}</span></div>
          <div class="r-row"><span>Discount</span><span>Rs. ${(lastReceipt.discount||0).toLocaleString()}</span></div>
          <div class="r-row r-total"><span>TOTAL</span><span>Rs. ${lastReceipt.total.toLocaleString()}</span></div>
          ${lastReceipt.payment==='Cash'?`<div class="r-row"><span>Cash tendered</span><span>Rs. ${(lastReceipt.received||lastReceipt.total).toLocaleString()}</span></div>
          <div class="r-row"><span>Change</span><span>Rs. ${(lastReceipt.change||0).toLocaleString()}</span></div>`:''}
          <hr class="r-dash">
          <div class="r-center" style="margin-top:8px;"><span class="badge badge-green">PAID</span></div>
          <div class="r-thanks">Thank you · Verify medicines via PharmaChain QR<br>Not a tax invoice · Demo prototype</div>
        </div>
      </div>
    </div>`;
  }
  return pageHead('Point of Sale','Counter sale · barcode/batch search · payment & receipt',
      `<button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','inventory')">Inventory</button>
       <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','incoming')">Incoming</button>`)
    + receiptHtml
    + `<div class="pos-shell">
      <div class="pos-topbar">
        <div>
          <h3>${CTX.pharmacy} — POS Terminal</h3>
          <div class="pos-meta">Cashier: ${PORTAL_META.pharmacy.name} · Session open · PharmaChain</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-sm" style="background:rgba(255,255,255,.12);color:#fff;" type="button" onclick="posHoldSale()">Hold sale</button>
          <button class="btn btn-sm" style="background:rgba(255,255,255,.12);color:#fff;" type="button" onclick="posResumeSale()">Resume</button>
          <button class="btn btn-sm" style="background:var(--teal);color:#fff;" type="button" onclick="document.getElementById('pos-search').focus()">Focus search</button>
        </div>
      </div>
      <div class="pos-layout">
        <div class="pos-left">
          <div class="pos-panel-body" style="padding-top:14px;">
            <div class="pos-search-row">
              <div class="search-sm">${ICONS.search_shield}<input id="pos-search" placeholder="Search medicine, batch, barcode…" oninput="posFilterProducts()" autofocus></div>
              <select id="pos-cat" onchange="posFilterProducts()">
                ${cats.map(c=>`<option value="${c}">${c==='All'?'Category':c}</option>`).join('')}
              </select>
              <select id="pos-mfg" onchange="posFilterProducts()">
                ${mfgs.map(m=>`<option value="${m}">${m==='All'?'Brand':m}</option>`).join('')}
              </select>
            </div>
            <div class="pos-product-table" id="pos-product-grid"></div>
          </div>
        </div>
        <div class="pos-right">
          <div class="pos-panel-head">
            <h3>Current sale</h3>
            <button class="btn btn-outline btn-sm" type="button" onclick="posClearCart()">Clear cart</button>
          </div>
          <div class="pos-panel-body" style="padding-bottom:0;">
            <div class="pos-cart-items" id="pos-cart-body"></div>
            <div class="pos-totals">
              <div class="pos-total-row"><span>Subtotal</span><span id="pos-subtotal">Rs. 0</span></div>
              <div class="pos-total-row"><span>Discount %</span>
                <input type="number" min="0" max="50" value="0" style="width:70px;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;text-align:right;" oninput="posSetDiscount(this.value)">
              </div>
              <div class="pos-total-row"><span>Discount amount</span><span id="pos-discount">− Rs. 0</span></div>
              <div class="pos-total-row grand"><span>TOTAL DUE</span><span id="pos-grand" style="color:var(--teal);">Rs. 0</span></div>
            </div>
          </div>
          <div class="pos-checkout">
            <div class="field" style="margin-bottom:10px;">
              <label>Customer</label>
              <select id="pos-patient">
                <option value="">Walk-in customer</option>
                ${patients.map(p=>`<option value="${p.id}">${p.masked} (${p.id})</option>`).join('')}
              </select>
            </div>
            <div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.4px;">Payment method</div>
            <div class="pos-pay-methods" style="grid-template-columns:1fr 1fr;">
              <label><input type="radio" name="pos-pay" value="Cash" checked onchange="posUpdateChange()"><span class="pay-ic">💵</span>Cash</label>
              <label><input type="radio" name="pos-pay" value="Digital" onchange="posUpdateChange()"><span class="pay-ic">📱</span>Digital</label>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:8px;">
              <div class="field" style="margin:0;"><label>Payable</label><div id="pos-payable" style="font-weight:800;font-size:16px;color:var(--navy);">Rs. 0</div></div>
              <div class="field" style="margin:0;"><label>Received</label><input id="pos-received" type="number" min="0" placeholder="0" oninput="posUpdateChange()" style="padding:8px 10px;"></div>
            </div>
            <div class="pos-total-row" style="margin-bottom:12px;"><span>Change</span><span id="pos-change" style="font-weight:700;">Rs. 0</span></div>
            <button class="pos-complete-btn" type="button" onclick="actionSellMedicine()">${ICONS.check} Complete sale &amp; print</button>
          </div>
        </div>
      </div>
    </div>`
    + card('Recent transactions','Sales history at '+CTX.pharmacy, dataTable(
      ['Txn ID','Date/time','Customer','Items','Total','Payment','Cashier','Status'],
      mySales.slice(0,12).map(s=>[
        `<span class="mono">${s.id||'—'}</span>`,
        `<span class="mono">${s.date} ${s.time||''}</span>`,
        s.patient||'Walk-in',
        s.medicine+(s.qty?` ×${s.qty}`:''),
        s.price||('Rs. '+s.total),
        s.payment||'Cash',
        s.cashier||'Staff',
        statusBadge('Confirmed')
      ])));
};
AFTER.pharmacy.sales = function(){ posFilterProducts(); posRenderCart(); };
PAGES.pharmacy.qrverify = function(){
  return pageHead('Package verification','Scan a package QR — identity & supply-chain checks, not chemical proof')
    + `<div class="privacy-note">${ICONS.info}<div><b>PharmaChain verifies package identity and supply-chain consistency and flags suspicious records.</b> A VERIFIED scan does not scientifically prove the physical medicine is genuine.</div></div>`
    + `<div class="grid-2-even">
      <div class="card" style="background:linear-gradient(165deg,#0F172A 0%,#4338CA 55%,#115E59 100%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:320px;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,rgba(45,212,191,.25),transparent 50%),radial-gradient(circle at 80% 80%,rgba(99,102,241,.2),transparent 45%);pointer-events:none;"></div>
        <div style="font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#99F6E4;margin-bottom:14px;position:relative;">Live package scanner</div>
        <div style="width:170px;height:170px;position:relative;z-index:1;">
          <div class="corner tl" style="border-color:#5EEAD4;"></div><div class="corner tr" style="border-color:#5EEAD4;"></div>
          <div class="corner bl" style="border-color:#5EEAD4;"></div><div class="corner br" style="border-color:#5EEAD4;"></div>
          <div class="scan-line" style="background:#5EEAD4;box-shadow:0 0 12px #5EEAD4;"></div>
          <div style="position:absolute;inset:24px;border:1px dashed rgba(94,234,212,.35);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;color:#99F6E4;">PKG QR</div>
        </div>
        <p style="color:#99F6E4;font-size:12.5px;margin-top:22px;text-align:center;position:relative;max-width:260px;line-height:1.45;">Align the package QR inside the frame. Each scan checks identity against the network ledger.</p>
        <button class="btn btn-sm" style="margin-top:16px;background:#fff;color:var(--navy);position:relative;" onclick="document.getElementById('pharm-verify-code').value='PKG-A8F92K';pharmVerify(null)">Simulate scan</button>
      </div>
      <div class="card">
        <h3 style="font-size:15px;margin-bottom:6px;">Enter Package ID or QR code</h3>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px;line-height:1.5;">QR maps to a unique package unit. Verification runs 10 consistency checks.</p>
        <form onsubmit="return pharmVerify(event)">
          <div class="field"><label>Package ID / QR</label>
            <input id="pharm-verify-code" placeholder="e.g. PKG-2024-1187-0101" style="font-family:var(--mono);font-size:14px;padding:12px;" required>
          </div>
          <button class="btn btn-dark btn-block" type="submit" style="padding:12px;">Run verification</button>
        </form>
        <div style="margin-top:16px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;">Demo codes</div>
        <div class="hint-chips" style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
          <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" title="Should VERIFY" onclick="document.getElementById('pharm-verify-code').value='PKG-A8F92K';pharmVerify(null)">PKG-A8F92K · Verified</div>
          <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" title="Already sold" onclick="document.getElementById('pharm-verify-code').value='PKG-SOLD91';pharmVerify(null)">PKG-SOLD91 · Reuse</div>
          <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" title="NOT FOUND" onclick="document.getElementById('pharm-verify-code').value='PKG-FAKE123';pharmVerify(null)">PKG-FAKE123 · Not found</div>
          <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" title="Mismatch" onclick="document.getElementById('pharm-verify-code').value='PKG-MISMATCH';pharmVerify(null)">PKG-MISMATCH · Suspicious</div>
          <div class="chip-filter" style="cursor:pointer;font-family:var(--mono);font-size:11px;" title="Legacy product code" onclick="document.getElementById('pharm-verify-code').value='MED-2024-0113';pharmVerify(null)">MED-2024-0113</div>
        </div>
      </div>
    </div>
    <div id="pharm-verify-result" style="margin-top:18px;"></div>`;
};
function pharmVerify(e){
  if(e) e.preventDefault();
  const code = fv('pharm-verify-code');
  if(!code){ toast('Enter a Package ID or QR code'); return false; }
  const result = lookupVerification(code);
  const chainHtml = (result.pkg && supplyChainMap[result.pkg.batch])
    ? card('Supply-chain timeline','Recorded custody path for this batch', renderChainTimeline(result.pkg.batch))
    : '';
  document.getElementById('pharm-verify-result').innerHTML =
    verificationBannerHtml(result, code)
    + `<div class="grid-2-even">`
    + card('Verification checklist','10 package & supply-chain checks', verificationChecksHtml(result))
    + card('Package record','Identity fields from the network ledger', verificationDetailGrid(result, code))
    + `</div>`
    + chainHtml
    + (result.state!=='verified'
        ? `<div class="card" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <button class="btn btn-red btn-sm" onclick="navigateTo('pharmacy','counterfeit')">Report suspicious package</button>
            <button class="btn btn-outline btn-sm" onclick="toast('Hold instruction logged (demo)')">Hold — do not dispense</button>
            <span style="font-size:12.5px;color:var(--muted);">Document the physical unit and notify the supplier.</span>
          </div>`
        : `<div class="card" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <span class="badge badge-green">Checks passed</span>
            <span style="font-size:12.5px;color:var(--muted);">Identity consistent — still inspect physical packaging before sale.</span>
          </div>`);
  const el = document.getElementById('pharm-verify-result');
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  return false;
}
PAGES.pharmacy.counterfeit = function(){
  const mine = counterfeitReports.filter(c=>c.reportedBy===CTX.pharmacy);
  return pageHead('Counterfeit reports','Report suspicious medicines you have identified')
    + card('Report an issue','', `<form onsubmit="return actionReportCounterfeit(event,'pharmacy')">
        <div class="field-row"><div class="field"><label>Medicine name</label><input id="pharmacy-cf-medicine" placeholder="e.g. Brufen 400mg" required></div><div class="field"><label>Batch number</label><input id="pharmacy-cf-batch" placeholder="e.g. BT-2024-1450"></div></div>
        <div class="field"><label>Reason</label><select id="pharmacy-cf-reason"><option>Suspicious medicine</option><option>Invalid QR</option><option>Batch mismatch</option><option>Expired medicine</option><option>Supply-chain mismatch</option></select></div>
        <button class="btn btn-red" type="submit">Submit report</button>
      </form>`)
    + card('Your submitted reports','', dataTable(['Case ID','Medicine','Batch','Date','Status'], mine.map(c=>[`<span class="mono">${c.id}</span>`,c.medicine,`<span class="mono">${c.batch}</span>`,`<span class="mono">${c.date}</span>`,statusBadge(c.status)])));
};
PAGES.pharmacy.suppliers = function(){
  const mySuppliers = [...new Set(medicines.filter(m=>m.pharmacy===CTX.pharmacy).map(m=>m.vendor))];
  return pageHead('Suppliers','Vendors currently supplying '+CTX.pharmacy)
    + card('','', dataTable(['Vendor','City','License #'], mySuppliers.map(name=>{ const v=vendors.find(x=>x.name===name)||{city:'—',license:'—'}; return [name,v.city,`<span class="mono">${v.license}</span>`]; })));
};
PAGES.pharmacy.patients = function(){
  return pageHead('Patients','Purchase history for patients served by '+CTX.pharmacy)
    + `<div class="privacy-note">${ICONS.info}<div>Patient identity is masked. Full history is only visible with patient consent on file.</div></div>`
    + card('','', dataTable(['Patient','Medicine','Batch','Date','Context'], patients.flatMap(p=>p.entries.filter(e=>e.pharmacy===CTX.pharmacy).map(e=>[p.masked,e.medicine,`<span class="mono">${e.batch}</span>`,`<span class="mono">${e.date}</span>`,e.context]))));
};
PAGES.pharmacy.analytics = function(){
  if(!pharmacyHasPremium()) return premiumLockCard('Advanced analytics');
  return _pharmacyAnalyticsBody();
};
PAGES.pharmacy.subscription = function(){
  const p = getPharmacySub();
  if(!p) return pageHead('Subscription','No subscription record') + card('','','Pharmacy not found in network registry.');
  const days = daysRemaining(p);
  const plan = SUB_PLANS[normalizePlan(p.plan)] || SUB_PLANS.Basic;
  const other = normalizePlan(p.plan)==='Premium' ? SUB_PLANS.Basic : SUB_PLANS.Premium;
  const banner = p.subStatus==='Expired'
    ? `<div class="card" style="border:2px solid var(--red);background:#FEF2F2;margin-bottom:16px;">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div class="aic" style="background:var(--red-light);color:#B91C1C;">${ICONS.warn}</div>
          <div><h3 style="color:#B91C1C;margin-bottom:4px;">Subscription expired</h3>
          <p style="font-size:13px;color:#991B1B;">Premium features are locked. Contact admin to renew. Basic POS/Inventory remain available in this demo for continuity.</p></div>
        </div></div>`
    : p.subStatus==='Expiring Soon'
    ? `<div class="card" style="border:2px solid var(--amber);background:#FFFBEB;margin-bottom:16px;">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div class="aic" style="background:var(--amber-light);color:#92620A;">${ICONS.warn}</div>
          <div><h3 style="color:#92620A;margin-bottom:4px;">Expiring in ${days} day(s)</h3>
          <p style="font-size:13px;color:#92400E;">Renew before ${p.expiryDate} to avoid interruption of Premium features.</p></div>
        </div></div>`
    : p.subStatus==='Pending'
    ? `<div class="card" style="border:2px solid #CBD5E1;background:#F8FAFC;margin-bottom:16px;">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div class="aic" style="background:#F1F5F9;color:#334155;">${ICONS.clipboard}</div>
          <div><h3 style="margin-bottom:4px;">Subscription pending</h3>
          <p style="font-size:13px;color:var(--muted);">Awaiting admin activation. Premium features are not available yet.</p></div>
        </div></div>` : '';
  return pageHead('Subscription','PharmaChain pharmacy plan (demo — no payment gateway)')
    + banner
    + card('Current subscription','', `
      <div class="detail-grid">
        <div class="detail-item"><div class="k">Plan</div><div class="v">${planBadge(p.plan)}</div></div>
        <div class="detail-item"><div class="k">Status</div><div class="v">${subStatusBadge(p.subStatus)}</div></div>
        <div class="detail-item"><div class="k">Start date</div><div class="v mono">${p.startDate||'—'}</div></div>
        <div class="detail-item"><div class="k">Expiry date</div><div class="v mono">${p.expiryDate||'—'}</div></div>
        <div class="detail-item"><div class="k">Days remaining</div><div class="v">${days<0?'<span style="color:#B91C1C;font-weight:700;">Expired</span>':days+' days'}</div></div>
        <div class="detail-item"><div class="k">Price</div><div class="v">${plan.price}${plan.period||''}</div></div>
      </div>`)
    + (pharmacyHasPremium() ? card('Employee management','Premium feature', `<p style="font-size:13px;color:var(--muted);margin:0 0 12px;">Manage salesmen, permissions, performance and activity logs.</p><button class="btn btn-primary btn-sm" onclick="navigateTo('pharmacy','employees')">Open Employees</button>`) : '')
    + card('Compare plans','Choose the tier that fits your counter', `<div class="plan-cards">
        <div class="plan-card ${p.plan==='Trial'||p.plan==='Free Trial'?'featured':''}">
          ${(p.plan==='Trial'||p.plan==='Free Trial')?'<div class="pc-badge">Current</div>':''}
          <div class="pc-name">Trial</div>
          <div class="pc-price">${SUB_PLANS.Trial.price}<span>${SUB_PLANS.Trial.period}</span></div>
          <div class="pc-tag">${SUB_PLANS.Trial.tagline}</div>
          <ul>${SUB_PLANS.Trial.features.slice(0,5).map(f=>`<li><span class="ck">✓</span>${f}</li>`).join('')}</ul>
          ${(normalizePlan(p.plan)!=='Trial')?`<div style="margin-top:14px;"><button class="btn btn-outline btn-sm" onclick="pharmacySetPlan('Trial')">Request trial</button></div>`:''}
        </div>
        <div class="plan-card ${p.plan==='Basic'?'featured':''}">
          ${p.plan==='Basic'?'<div class="pc-badge">Current</div>':''}
          <div class="pc-name">Basic</div>
          <div class="pc-price">${SUB_PLANS.Basic.price}<span>${SUB_PLANS.Basic.period}</span></div>
          <div class="pc-tag">${SUB_PLANS.Basic.tagline}</div>
          <ul>${SUB_PLANS.Basic.features.slice(0,5).map(f=>`<li><span class="ck">✓</span>${f}</li>`).join('')}</ul>
          ${p.plan!=='Basic'?`<div style="margin-top:14px;"><button class="btn btn-outline btn-sm" onclick="pharmacySetPlan('Basic')">Request Basic</button></div>`:`<div style="margin-top:14px;"><button class="btn btn-outline btn-sm" onclick="pharmacyRequestRenew()">Request renew</button></div>`}
        </div>
        <div class="plan-card ${p.plan==='Premium'?'featured':''}">
          ${p.plan==='Premium'?'<div class="pc-badge">Current</div>':'<div class="pc-badge">Recommended</div>'}
          <div class="pc-name">Premium</div>
          <div class="pc-price">${SUB_PLANS.Premium.price}<span>${SUB_PLANS.Premium.period}</span></div>
          <div class="pc-tag">${SUB_PLANS.Premium.tagline}</div>
          <ul>${SUB_PLANS.Premium.features.slice(0,6).map(f=>`<li><span class="ck">✓</span>${f}</li>`).join('')}</ul>
          ${normalizePlan(p.plan)!=='Premium'?`<div style="margin-top:14px;"><button class="btn btn-primary btn-sm" onclick="pharmacySetPlan('Premium')">Request Premium</button></div>`:`<div style="margin-top:14px;"><button class="btn btn-primary btn-sm" onclick="pharmacyRequestRenew()">Request renew</button></div>`}
        </div>
      </div>`)
    + (()=>{
        const mine = subRequests.filter(r=>r.pharmacy===p.name);
        if(!mine.length) return card('Your requests','','No subscription requests yet. Choose a plan, pay to the shown accounts, enter transaction ID — Admin matches and approves.');
        return card('Your requests','Payment proof sent to Admin', dataTable(['ID','Type','Plan','Txn ID','Pay date','Amount','Status'],
          mine.map(r=>[
            `<span class="mono">${r.id}</span>`, r.type, planBadge(r.requestedPlan),
            `<span class="mono">${r.transactionId||'—'}</span>`,
            `<span class="mono">${r.paymentDate||r.date||'—'}</span>`,
            r.amount||'—',
            statusBadge(r.status==='Approved'?'Active':r.status==='Rejected'?'Suspicious':'Pending')
          ])));
      })()
    + card('Included with your plan','Feature access for your current tier', dataTable(['Feature','Access'], plan.features.map(f=>[f, statusBadge('Active')]).concat(
        (p.plan==='Basic'?['Advanced analytics','Demand insights','Reports']:[]).map(f=>[f, statusBadge('Locked')])
      )));
};

PAGES.pharmacy.employees = function(){
  if(!pharmacyHasPremium()) return premiumLockCard('Employee management');
  if(currentEmployee && !empHasPerm('manageEmployees')){
    return pageHead('Employees','Restricted') + card('','','You do not have permission to manage employees.');
  }
  const list = getPharmacyEmployees();
  const audit = employeeAuditLog.filter(a=>a.pharmacy===CTX.pharmacy).slice(0,12);
  const sessionBar = currentEmployee
    ? `<div class="card" style="margin-bottom:14px;border-color:var(--teal);"><div style="font-size:13px;"><b>Staff session:</b> ${currentEmployee.name} · ${currentEmployee.role}. Sign out from the profile menu to leave.</div></div>`
    : `<div class="card" style="margin-bottom:14px;"><div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="font-size:13px;color:var(--muted);">Owner session — staff sign in separately via <b>Pharmacy → Staff</b> on the login screen (not from this dashboard).</div>
        <button class="btn btn-primary btn-sm" type="button" onclick="openEmployeeModal('add')">+ Add employee</button>
      </div></div>`;
  const rows = list.map(e=>{
    const st = employeeSalesStats(e.id);
    const permSummary = EMP_PERM_KEYS.filter(pk=>e.permissions&&e.permissions[pk.key]).map(pk=>pk.label).slice(0,3).join(', ') || 'Minimal';
    return [
      `<b>${e.name}</b><div style="font-size:11px;color:var(--muted)">${e.email}</div>`,
      e.role,
      statusBadge(e.status==='Active'?'Active':'Suspended'),
      st.txCount+' tx · Rs. '+st.total.toLocaleString(),
      `<span style="font-size:11.5px;color:var(--muted)">${permSummary}</span>`,
      `<div style="display:flex;gap:4px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','empdetail','${e.id}')">View</button>
        <button class="btn btn-outline btn-sm" onclick="openEmployeeModal('edit','${e.id}')">Edit</button>
        ${e.status==='Active'
          ? `<button class="btn btn-outline btn-sm" style="color:#B91C1C;border-color:#FECACA;" onclick="setEmployeeStatus('${e.id}','Inactive')">Deactivate</button>`
          : `<button class="btn btn-outline btn-sm" onclick="setEmployeeStatus('${e.id}','Active')">Activate</button>`}
      </div>`
    ];
  });
  return pageHead('Employees','Sales staff & permissions — Premium only (demo)')
    + `<div class="card" style="margin-bottom:14px;background:#ECFEFF;border-color:rgba(14,165,164,.25);">
        <div style="font-size:13px;line-height:1.5;"><b>How to use:</b> Create staff accounts here (owner only). Staff must sign in from the <b>role selection → Pharmacy → Staff</b> login with their own email.
        Demo: <code>hassan@medicare.demo</code> / any password. Premium plan required. Staff cannot open owner management screens.</div>
      </div>`
    + sessionBar
    + (list.length ? card('Team members','Create, edit, activate/deactivate and assign least-privilege permissions', dataTable(['Employee','Role','Status','Performance','Key permissions','Actions'], rows))
        : card('Team members','','No employees yet. Add a salesman or cashier to get started.'))
    + card('Activity audit log','Actions tied to real demo events (sales, logins, permission changes)',
        audit.length ? dataTable(['Time','Actor','Action','Record','Detail'], audit.map(a=>[
          `<span class="mono">${a.time}</span>`, a.employeeName, a.action, `<span class="mono">${a.recordId}</span>`, a.detail||'—'
        ])) : '<p class="muted" style="margin:0;">No activity yet.</p>')
    + `<p style="font-size:12px;color:var(--muted);margin-top:10px;">Permissions are enforced in this browser demo only and are not production-grade security.</p>`;
};
PAGES.pharmacy.empdetail = function(id){
  if(!pharmacyHasPremium()) return premiumLockCard('Employee management');
  const emp = getEmployeeById(id);
  if(!emp || emp.pharmacy!==CTX.pharmacy) return pageHead('Employee','Not found')+card('','','Employee not found.');
  const st = employeeSalesStats(emp.id);
  const perms = EMP_PERM_KEYS.map(pk=>`<div class="detail-item"><div class="k">${pk.label}</div><div class="v">${emp.permissions&&emp.permissions[pk.key]?statusBadge('Active'):statusBadge('Locked')}</div></div>`).join('');
  const myAudit = employeeAuditLog.filter(a=>a.employeeId===emp.id || (a.employeeName||'').indexOf(emp.name)===0).slice(0,10);
  return breadcrumb('Employees','pharmacy','employees', emp.name)
    + pageHead(emp.name, emp.role+' · '+emp.status)
    + statGrid([
      {label:'Transactions', value:st.txCount, delta:'', icon:'clipboard', bg:'var(--blue-light)', color:'var(--blue)'},
      {label:'Sales total', value:'Rs. '+st.total.toLocaleString(), delta:'', icon:'bars', bg:'var(--teal-light)', color:'#0F766E'},
      {label:'Avg ticket', value:'Rs. '+st.avg.toLocaleString(), delta:'', icon:'cube', bg:'var(--indigo-light)', color:'var(--indigo)'},
      {label:'Discount events', value:st.discounts, delta:'% flags on sales', icon:'warn', bg:'var(--amber-light)', color:'#92620A'},
    ])
    + card('Permissions','Assigned by owner', `<div class="detail-grid">${perms}</div>`)
    + card('Recent sales','Attributed to this employee when recorded', st.rows.length
        ? dataTable(['ID','Medicine','Qty','Total','Date'], st.rows.slice(0,12).map(s=>[`<span class="mono">${s.id}</span>`, s.medicine, s.qty, 'Rs. '+(s.total||0), `<span class="mono">${s.date}</span>`]))
        : '<p class="muted" style="margin:0;">No attributed sales yet. Complete a POS sale while logged in as this employee.</p>')
    + card('Activity','', myAudit.length ? dataTable(['Time','Action','Record','Detail'], myAudit.map(a=>[`<span class="mono">${a.time}</span>`, a.action, `<span class="mono">${a.recordId}</span>`, a.detail||'—'])) : '<p class="muted">No log entries.</p>')
    + `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
        <button class="btn btn-outline btn-sm" onclick="openEmployeeModal('edit','${emp.id}')">Edit</button>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('pharmacy','employees')">Back</button>
      </div>`;
};
PAGES.pharmacy.settings = genericSettingsPage('pharmacy');


