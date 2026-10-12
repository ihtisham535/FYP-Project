'use client';

export default function CallToAction() {
  return (
    <>
<section className="cta-section">
  <div className="cta-box">
    <h2>Ready to explore the prototype?</h2>
    <p>
      Open the working demo and explore the tools built for every role in the medicine supply chain.
    </p>
    <div className="cta-actions">
      <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}} className="btn btn-primary btn-lg">
        Launch PharmaChain Demo
      </a>
      <a href="#pricing" className="btn btn-outline btn-lg" style={{background:"transparent",color:"#fff",borderColor:"rgba(255,255,255,0.3)"}}>
        View pricing
      </a>
    </div>
  </div>
</section>
    </>
  );
}
