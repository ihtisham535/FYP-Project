'use client';

export default function ForgotPassword() {
  return (
    <>
<div className="auth-screen" id="screen-forgot" style={{display:"none"}}>
  <div className="auth-card auth-form">
    <div className="auth-brand">
      <div className="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg></div>
      <div><h1>PharmaChain</h1><span>Password recovery</span></div>
    </div>
    <div className="auth-body">
      <div className="login-form-wrap">
        <h2 style={{textAlign:"center"}}>Forgot password?</h2>
        <p className="muted" style={{textAlign:"center",margin:"8px auto 24px",maxWidth:"340px"}}>Enter the email linked to your account and we’ll send a reset link. (Demo only.)</p>
        <form onSubmit={(event)=>{event.preventDefault(); doForgot(event);}}>
          <div className="field"><label>Email address</label><input id="forgot-email" type="email" placeholder="you@example.com" required /></div>
          <button className="btn btn-dark btn-block" type="submit" style={{padding:"12px"}}>Send reset link</button>
        </form>
        <div className="link-row" style={{marginTop:"22px"}}><a onClick={(event)=>{showScreen('screen-login');}}>← Back to sign in</a></div>
        <div className="link-row"><a onClick={(event)=>{showScreen('screen-role-select');}}>Back to role selection</a></div>
      </div>
    </div>
  </div>
</div>
    </>
  );
}
