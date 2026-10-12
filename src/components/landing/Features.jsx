'use client';

export default function Features() {
  return (
    <>
<section id="features" className="lp-section features-bg">
  <div className="section-inner">
    <div className="section-center">
      <div className="section-label">Platform Capabilities</div>
      <h2 className="section-title">Everything needed to secure the chain</h2>
      <p className="section-sub">
        A complete ecosystem with role-based portals, QR verification, digital ledger, and real-time counterfeit detection.
      </p>
    </div>
    <div className="features-grid">
      <div className="feature-card">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20.5 14v3M14 20.5h3M20.5 20.5v.01" /></svg>
        </div>
        <h3>QR Medicine Verification</h3>
        <p>Patients, pharmacies, and doctors scan or enter unique codes to instantly confirm authenticity against the network ledger.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg>
        </div>
        <h3>Digital Ledger</h3>
        <p>Every handoff is recorded in a chained, tamper-evident log. Altering history is immediately detectable across the network.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="5" cy="6" r="2.2" /><circle cx="19" cy="18" r="2.2" /><path d="M5 8.2v2.8a4 4 0 0 0 4 4h6a4 4 0 0 1 4 3" /></svg>
        </div>
        <h3>End-to-End Traceability</h3>
        <p>Trace any batch from manufacturer → vendor → pharmacy → patient with full timestamps, quantities, and actor records.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 3v18" /><path d="M5 4h11l-2 4 2 4H5" /></svg>
        </div>
        <h3>Counterfeit Detection</h3>
        <p>Suspicious batches are flagged automatically or reported by stakeholders. Admins investigate and issue network-wide alerts.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 21V11l5 3v-3l5 3V8l5 4v9z" /><path d="M3 21h18" /><path d="M7 3v3M11 3v3" /></svg>
        </div>
        <h3>Batch &amp; Recall Management</h3>
        <p>Manufacturers register batches, generate QR identities, dispatch shipments, and issue recalls that propagate instantly.</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7.6" r="3" /><path d="M3.2 20.5c0-3.2 2.6-5.3 5.8-5.3" /><path d="M16.7 13.3c1.8-1.5 3.9-.9 3.9 1.1 0 1.7-2.1 3.1-3.9 4.3-1.8-1.2-3.9-2.6-3.9-4.3 0-2 2.1-2.6 3.9-1.1z" /></svg>
        </div>
        <h3>Patient Mobile Experience</h3>
        <p>A dedicated mobile-style interface lets patients scan medicines, view history, report issues, and receive safety alerts.</p>
      </div>
    </div>
  </div>
</section>
    </>
  );
}
