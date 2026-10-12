'use client';

export default function Problem() {
  return (
    <>
<section id="problem" className="lp-section">
  <div className="section-inner">
    <div className="section-label">The Challenge</div>
    <h2 className="section-title">Counterfeit medicines put lives at risk</h2>
    <p className="section-sub">
      The pharmaceutical supply chain is complex, fragmented, and vulnerable.
      Without end-to-end visibility, fake and substandard drugs reach patients every day.
    </p>
    <div className="problem-grid">
      <div className="problem-card">
        <span className="problem-num">01</span>
        <div className="problem-icon" style={{background:"#FEE2E2",color:"#B91C1C"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18.5a1.8 1.8 0 0 0 1.5 2.7h17.4a1.8 1.8 0 0 0 1.5-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0z" /></svg>
        </div>
        <h3>Counterfeit products</h3>
        <p>Fake medicines infiltrate the market through weak verification points, endangering patient safety and eroding trust in healthcare systems.</p>
      </div>
      <div className="problem-card">
        <span className="problem-num">02</span>
        <div className="problem-icon" style={{background:"#FEF3C7",color:"#B45309"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></svg>
        </div>
        <h3>Opaque supply chains</h3>
        <p>Once a batch leaves the factory, visibility is lost. Stakeholders cannot independently verify origin, handling, or authenticity of medicines.</p>
      </div>
      <div className="problem-card">
        <span className="problem-num">03</span>
        <div className="problem-icon" style={{background:"#CFF7F5",color:"#4338CA"}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 5 6v5c0 5 3 7.5 7 9 4-1.5 7-4 7-9V6z" /></svg>
        </div>
        <h3>No shared source of truth</h3>
        <p>Manufacturers, vendors, pharmacies, and regulators keep separate records — there is no single tamper-evident history of a medicine’s journey.</p>
      </div>
    </div>
  </div>
</section>
    </>
  );
}
