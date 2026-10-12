'use client';

export default function Hero() {
  return (
    <>
<section className="hero">
  <div className="hero-inner">
    <div>
      <h2>Secure every medicine<br />with <span>blockchain trust</span></h2>
      <p>
        PharmaChain traces pharmaceutical supply chains from manufacturer to patient — detect counterfeits, verify authenticity, and protect public health in real time.
      </p>
      <div className="hero-actions">
        <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}} className="btn btn-dark btn-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          Explore Live Prototype
        </a>
        <a href="#features" className="btn btn-outline btn-lg">See features</a>
      </div>
      <div className="hero-stats">
        <div className="hero-stat">
          <div className="num">6</div>
          <div className="lbl">Stakeholder portals</div>
        </div>
        <div className="hero-stat">
          <div className="num">100%</div>
          <div className="lbl">Traceable batches</div>
        </div>
        <div className="hero-stat">
          <div className="num">Real-time</div>
          <div className="lbl">Counterfeit alerts</div>
        </div>
      </div>
    </div>

    <div className="hero-visual">
      <div className="hero-stage">
        
        

        <img className="hero-photo" alt="Patient checking a medicine before taking it" src="/images/hero-patient.png" />
      </div>
    </div>
  </div>
</section>
    </>
  );
}
