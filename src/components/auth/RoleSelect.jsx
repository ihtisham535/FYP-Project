'use client';

export default function RoleSelect() {
  return (
    <>
<div className="auth-screen" id="screen-role-select" style={{display:"none"}}>
  <div className="auth-card">
    <div className="auth-brand">
      <div className="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg></div>
      <div><h1>PharmaChain</h1><span>Decentralized Pharmaceutical Supply Chain &amp; Counterfeit Detection</span></div>
    </div>
    <div className="auth-body">
      <h2>Select your workspace</h2>
      <p className="muted">Choose a stakeholder role to enter the corresponding portal. Each portal is tailored to real operational needs in the pharmaceutical supply chain.</p>
      <div className="role-grid" id="role-grid"></div>
      <div className="auth-footer-note">Demo mode · No real credentials required · <a onClick={(event)=>{jumpToPortal('admin');}}>Quick jump to Admin</a></div>
    </div>
  </div>
</div>
    </>
  );
}
