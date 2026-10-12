'use client';

export default function Navbar() {
  return (
    <>
<nav className="nav">
  <div className="nav-inner">
    <a href="#" className="brand" onClick={(event)=>{window.scrollTo({top:0,behavior:'smooth'});event.preventDefault();}}>
      <div className="logo-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="16" height="16">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" />
        </svg>
      </div>
      <div>
        <h1>PharmaChain</h1>
      </div>
    </a>
    <div className="nav-links">
      <a href="#problem">Problem</a>
      <a href="#features">Features</a>
      <a href="#roles">Portals</a>
      <a href="#how">How it works</a>
      <a href="#pricing">Pricing</a>
      <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}} className="nav-cta">Launch Demo</a>
    </div>
  </div>
</nav>
    </>
  );
}
