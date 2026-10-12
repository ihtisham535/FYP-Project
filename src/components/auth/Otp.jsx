'use client';

export default function Otp() {
  return (
    <>
<div className="auth-screen" id="screen-otp" style={{display:"none"}}>
  <div className="auth-card">
    <div className="auth-brand">
      <div className="logo-mark"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" width="18" height="18"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg></div>
      <div><h1>PharmaChain</h1><span>Two-step verification</span></div>
    </div>
    <div className="auth-body" style={{textAlign:"center"}}>
      <h2>Enter verification code</h2>
      <p className="muted">We've sent a 6-digit code to your registered device.</p>
      <div className="otp-row">
        <input className="otp-box" maxLength="1" defaultValue="4" /><input className="otp-box" maxLength="1" defaultValue="2" /><input className="otp-box" maxLength="1" defaultValue="9" /><input className="otp-box" maxLength="1" defaultValue="1" /><input className="otp-box" maxLength="1" defaultValue="7" /><input className="otp-box" maxLength="1" defaultValue="0" />
      </div>
      <button className="btn btn-dark" style={{padding:"12px 40px"}} onClick={(event)=>{verifyOtp();}}>Verify &amp; continue</button>
      <div className="link-row">Didn't get a code? <a onClick={(event)=>{toast('New code sent');}}>Resend</a></div>
    </div>
  </div>
</div>
    </>
  );
}
