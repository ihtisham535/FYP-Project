'use client';

import PasswordField from './PasswordField';

export default function Login() {
  return (
    <>
<div className="auth-screen" id="screen-login" style={{display:"none"}}>
  <div className="auth-card auth-form">
    <div className="auth-brand">
      <div className="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg></div>
      <div><h1>PharmaChain</h1><span>Secure sign in</span></div>
    </div>
    <div className="auth-body">
      <div className="login-form-wrap">
        <div className="selected-role-chip" id="selected-role-chip"></div>
        <div className="auth-tabs" id="login-auth-tabs">
          <button type="button" className="auth-tab active">Sign in</button>
          <button type="button" className="auth-tab" id="login-goto-signup" onClick={(event)=>{openSignupFromLogin();}}>Sign up</button>
        </div>
        <h2>Sign in</h2>
        <p className="muted">Enter your credentials to continue.</p>
        <form onSubmit={(event)=>{event.preventDefault(); doLogin(event);}}>
          <div id="pharmacy-login-mode" style={{display:"none",marginBottom:"14px"}}>
            <div style={{fontSize:"12px",fontWeight:"700",color:"var(--muted)",marginBottom:"8px",textTransform:"uppercase",letterSpacing:".3px"}}>Account type</div>
            <div style={{display:"flex",gap:"8px"}}>
              <label style={{flex:"1",display:"flex",alignItems:"center",gap:"8px",padding:"10px 12px",border:"1.5px solid var(--border)",borderRadius:"12px",cursor:"pointer",fontSize:"13px",fontWeight:"600"}} id="mode-owner-label">
                <input type="radio" name="pharm-login-mode" defaultValue="owner" defaultChecked onChange={(event)=>{onPharmacyLoginModeChange();}} /> Owner
              </label>
              <label style={{flex:"1",display:"flex",alignItems:"center",gap:"8px",padding:"10px 12px",border:"1.5px solid var(--border)",borderRadius:"12px",cursor:"pointer",fontSize:"13px",fontWeight:"600"}} id="mode-staff-label">
                <input type="radio" name="pharm-login-mode" defaultValue="staff" onChange={(event)=>{onPharmacyLoginModeChange();}} /> Staff
              </label>
            </div>
            <div id="staff-login-hint" style={{display:"none",marginTop:"10px",padding:"10px 12px",background:"#F0FDFA",border:"1px solid #99F6E4",borderRadius:"10px",fontSize:"12px",color:"#0F766E",lineHeight:"1.45"}}>
              <b>Staff demo logins</b> (password any):<br />
              <a href="#" onClick={(event)=>{document.getElementById('login-email').value='hassan@medicare.demo';event.preventDefault();}} style={{color:"#0F766E",fontWeight:"700"}}>hassan@medicare.demo</a> · Salesman · MediCare<br />
              <a href="#" onClick={(event)=>{document.getElementById('login-email').value='sana@medicare.demo';event.preventDefault();}} style={{color:"#0F766E",fontWeight:"700"}}>sana@medicare.demo</a> · Cashier · MediCare<br />
              <a href="#" onClick={(event)=>{document.getElementById('login-email').value='omar@prime.demo';event.preventDefault();}} style={{color:"#0F766E",fontWeight:"700"}}>omar@prime.demo</a> · Salesman · Prime Health
            </div>
          </div>
          <div className="field"><label>Email address</label><input id="login-email" type="email" defaultValue="demo@pharmachain.pk" required /></div>
          <div className="field"><label>Password</label><PasswordField id="login-pass" required /></div>
          <div className="link-row" style={{textAlign:"right",margin:"0 0 12px"}}><a onClick={(event)=>{showScreen('screen-forgot');}}>Forgot password?</a></div>
          <button className="btn btn-dark btn-block" type="submit">Continue</button>
        </form>
        <div className="link-row"><a onClick={(event)=>{backToLanding();}}>← Home</a></div>
      </div>
    </div>
  </div>
</div>
    </>
  );
}
