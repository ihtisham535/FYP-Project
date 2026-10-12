'use client';

import PasswordField from './PasswordField';

export default function Signup() {
  return (
    <>
<div className="auth-screen" id="screen-signup" style={{display:"none"}}>
  <div className="auth-card auth-form-wide">
    <div className="auth-brand">
      <div className="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg></div>
      <div><h1>PharmaChain</h1><span>Create your account</span></div>
    </div>
    <div className="auth-body">
      <div className="selected-role-chip" id="signup-role-chip"></div>
      <div className="auth-tabs">
        <button type="button" className="auth-tab" onClick={(event)=>{showScreen('screen-login');}}>Sign in</button>
        <button type="button" className="auth-tab active">Sign up</button>
      </div>
      <h2>Sign up</h2>
      <p className="muted">Demo only — no real data is stored.</p>
      <form onSubmit={(event)=>{event.preventDefault(); doSignup(event);}}>
        <div className="signup-grid">
          <div className="field"><label>Full name</label><input id="signup-name" placeholder="e.g. Ali Hassan" required /></div>
          <div className="field"><label>Email</label><input id="signup-email" type="email" placeholder="you@example.com" required /></div>
          <div className="field"><label>Phone</label><input id="signup-phone" placeholder="+92 300 1234567" /></div>
          <div className="field"><label>City</label><input id="signup-city" placeholder="e.g. Lahore" /></div>
          <div className="field" id="signup-org-field" style={{display:"none"}}><label id="signup-org-label">Organization</label><input id="signup-org" placeholder="Organization name" /></div>
          <div className="field" id="signup-license-field" style={{display:"none"}}><label>License number</label><input id="signup-license" placeholder="e.g. PH-LHR-2201" /></div>
          <div className="field"><label>Password</label><PasswordField id="signup-pass" placeholder="Create password" required /></div>
          <div className="field"><label>Confirm password</label><PasswordField id="signup-pass2" placeholder="Repeat password" required /></div>
        </div>
        <div className="signup-actions">
          <button className="btn btn-dark btn-block" type="submit">Create account</button>
        </div>
      </form>
      <div className="link-row" style={{textAlign:"center"}}>Already have an account? <a onClick={(event)=>{showScreen('screen-login');}}>Sign in</a> · <a onClick={(event)=>{backToLanding();}}>Home</a></div>
    </div>
  </div>
</div>
    </>
  );
}
