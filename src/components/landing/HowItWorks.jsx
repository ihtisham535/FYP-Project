'use client';

export default function HowItWorks() {
  return (
    <>
<section id="how" className="lp-section features-bg">
  <div className="section-inner">
    <div className="section-center">
      <div className="section-label">Workflow</div>
      <h2 className="section-title">How PharmaChain works</h2>
      <p className="section-sub">
        A simple four-stage flow that keeps every medicine accountable from production to consumption.
      </p>
    </div>
    <div className="how-grid">
      <div className="how-step">
        <div className="how-num">1</div>
        <h3>Register &amp; Produce</h3>
        <p>Manufacturer creates a batch, generates a unique QR identity, and records it on the ledger.</p>
        <span className="how-tag">Manufacturer</span>
      </div>
      <div className="how-step">
        <div className="how-num">2</div>
        <h3>Distribute</h3>
        <p>Vendor receives the shipment, confirms receipt, and ships onward to connected pharmacies.</p>
        <span className="how-tag">Vendor</span>
      </div>
      <div className="how-step">
        <div className="how-num">3</div>
        <h3>Dispense &amp; Verify</h3>
        <p>Pharmacy verifies the medicine via QR before sale. Patients can re-verify at any time.</p>
        <span className="how-tag">Pharmacy · Patient</span>
      </div>
      <div className="how-step">
        <div className="how-num">4</div>
        <h3>Detect &amp; Protect</h3>
        <p>Suspicious activity triggers alerts. Admins investigate and recalls propagate network-wide.</p>
        <span className="how-tag">Admin · Network</span>
      </div>
    </div>
  </div>
</section>
    </>
  );
}
