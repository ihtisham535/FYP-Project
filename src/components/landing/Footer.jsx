'use client';

export default function Footer() {
  return (
    <>
<footer className="lp-footer">
  <div className="footer-inner">
    <div className="footer-brand">
      <div className="brand">
        <div className="logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18">
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" />
          </svg>
        </div>
        <div>
          <h1 style={{fontSize:"16px"}}>PharmaChain</h1>
        </div>
      </div>
      <p>A pharmaceutical supply-chain platform for counterfeit detection and end-to-end medicine traceability.</p>
    </div>
    <div className="footer-col">
      <h4>Product</h4>
      <a href="#features">Features</a>
      <a href="#roles">Stakeholder Roles</a>
      <a href="#how">How it works</a>
      <a href="#pricing">Pricing</a>
      <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}}>Live Demo</a>
    </div>
    <div className="footer-col">
      <h4>Project</h4>
      <a href="#problem">Problem Statement</a>
      <a href="#features">Capabilities</a>
      <a href="#pricing">Subscription plans</a>
      <a href="#how">Workflow</a>
    </div>
    <div className="footer-col">
      <h4>Portals</h4>
      <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}}>Patient App</a>
      <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}}>Pharmacy Portal</a>
      <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}}>Admin Console</a>
    </div>
  </div>
  <div className="footer-bottom">
    <span>© 2025 PharmaChain · Final Year Project Prototype</span>
    <span>Built for academic demonstration</span>
  </div>
</footer>
    </>
  );
}
