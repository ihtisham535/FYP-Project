'use client';

export default function DesktopShell() {
  return (
    <>
<div id="desktop-shell">
  <aside className="sidebar" id="portal-sidebar">
    <div className="brand">
      <div style={{display:"flex",alignItems:"center",gap:"10px",minWidth:"0"}}>
        <div className="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="16" height="16"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg></div>
        <div className="brand-text"><h1 id="shell-title">PharmaChain</h1><span id="shell-subtitle">ADMIN PORTAL</span></div>
      </div>
      <button type="button" className="sidebar-close" title="Close menu" onClick={(event)=>{setSidebarOpen(false);}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
    <div className="nav-scroll" id="nav-scroll"></div>
    <div className="sidebar-foot"><div className="chain-status"><span className="pulse"></span> Ledger synced · Block #48,213</div></div>
  </aside>
  <div className="main-wrap">
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="menu-toggle" id="menu-toggle" title="Open menu" aria-expanded="true" onClick={(event)=>{toggleSidebar();}}>
          <svg id="menu-toggle-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg><input placeholder="Search medicine, batch, pharmacy, vendor, patient ID, transaction ID..." /></div>
      </div>
      <div className="right">
        <div className="icon-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg><span className="notif-dot"></span></div>
        <div className="user-menu-wrap">
          <div className="userline" onClick={(event)=>{toggleUserMenu(event);}}>
            <div className="avatar" id="shell-avatar">AR</div>
            <div><div className="name" id="shell-username">Ahmad Raza</div><div className="role" id="shell-userrole">System Admin</div></div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"var(--muted)"}}><path d="m6 9 6 6 6-6" /></svg>
          </div>
          <div className="user-dropdown" id="user-dropdown">
            <button type="button" className="ud-item" onClick={(event)=>{closeUserMenu();navigateTo(currentPortal,'settings');}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
              Settings
            </button>
            <div className="ud-sep"></div>
            <button type="button" className="ud-item danger" onClick={(event)=>{closeUserMenu();doLogout();}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
    <main className="content" id="portal-content"></main>
  </div>
</div>
    </>
  );
}
