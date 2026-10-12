'use client';

export default function Roles() {
  return (
    <>
<section id="roles" className="lp-section">
  <div className="section-inner">
    <div className="section-center">
      <div className="section-label">Stakeholder Portals</div>
      <h2 className="section-title">One ecosystem, six perspectives</h2>
      <p className="section-sub">
        Each participant gets a tailored workspace designed around their real-world responsibilities in the pharmaceutical chain.
      </p>
    </div>
    <div className="roles-grid">
      <div className="lp-role-card">
        <div className="lp-role-icon" style={{background:"#CFF7F5",color:"#067A55"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7.6" r="3" /><path d="M3.2 20.5c0-3.2 2.6-5.3 5.8-5.3" /><path d="M16.7 13.3c1.8-1.5 3.9-.9 3.9 1.1 0 1.7-2.1 3.1-3.9 4.3-1.8-1.2-3.9-2.6-3.9-4.3 0-2 2.1-2.6 3.9-1.1z" /></svg>
        </div>
        <h3>Patient</h3>
        <p>Scan &amp; verify medicines, view purchase history, receive recall alerts, and report suspicious products.</p>
      </div>
      <div className="lp-role-card">
        <div className="lp-role-icon" style={{background:"#EEF2FF",color:"#4338CA"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4v6a4 4 0 0 0 8 0V4" /><path d="M9 20a4 4 0 0 0 4-4v-3" /><circle cx="18" cy="17" r="2.4" /></svg>
        </div>
        <h3>Doctor</h3>
        <p>Create prescriptions, verify medicine authenticity, review patient medication history, and track safety alerts.</p>
      </div>
      <div className="lp-role-card">
        <div className="lp-role-icon" style={{background:"#CCFBF1",color:"#0F766E"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" /><path d="M14 21V10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11" /><path d="M4 21h16" /></svg>
        </div>
        <h3>Pharmacy</h3>
        <p>Manage inventory, confirm shipments, verify before dispensing, record sales, and report counterfeits.</p>
      </div>
      <div className="lp-role-card">
        <div className="lp-role-icon" style={{background:"#E0F2FE",color:"#0369A1"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21V11l5 3v-3l5 3V8l5 4v9z" /><path d="M3 21h18" /><path d="M7 3v3M11 3v3" /></svg>
        </div>
        <h3>Manufacturer</h3>
        <p>Register products &amp; batches, generate QR codes, dispatch to vendors, and issue recalls when needed.</p>
      </div>
      <div className="lp-role-card">
        <div className="lp-role-icon" style={{background:"#F1F5F9",color:"#334155"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 7h11v9H2z" /><path d="M13 10h4l4 3v3h-8z" /><circle cx="6.5" cy="18.5" r="1.6" /><circle cx="17.5" cy="18.5" r="1.6" /></svg>
        </div>
        <h3>Vendor / Distributor</h3>
        <p>Receive stock, manage inventory, fulfill pharmacy orders, and maintain chain-of-custody records.</p>
      </div>
      <div className="lp-role-card">
        <div className="lp-role-icon" style={{background:"#FEF3C7",color:"#B45309"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6a7 7 0 0 0 .1-1.2z" /></svg>
        </div>
        <h3>Administrator</h3>
        <p>Oversee the entire network, approve partners, investigate counterfeit cases, and monitor ledger integrity.</p>
      </div>
    </div>
  </div>
</section>
    </>
  );
}
