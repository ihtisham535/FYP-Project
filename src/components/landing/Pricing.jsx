'use client';

export default function Pricing() {
  const plans = [
    {
      name: 'Trial',
      price: 'Rs. 0',
      period: '/14 days',
      tagline: 'Try the pharmacy POS with limited functionality',
      features: [
        'Basic medicine search',
        'POS billing & receipts',
        'Record sales',
        'View inventory (read-only)',
        'Limited daily sales overview',
        'Demo trial — auto-expires',
      ],
      missing: ['Full inventory management', 'Shipments & suppliers', 'Advanced analytics', 'Employee management', 'Advanced reports'],
      cta: 'Start free trial',
    },
    {
      name: 'Basic',
      price: 'Demo',
      period: '',
      tagline: 'Core operations for small pharmacies',
      features: [
        'Full POS billing & receipts',
        'Medicine & batch inventory',
        'Stock receipts & purchases',
        'Supplier information',
        'Low-stock & expiry alerts',
        'Basic sales summaries & reports',
        'QR / package verification',
        'Incoming shipments',
      ],
      missing: ['Advanced analytics & margins', 'Employee management', 'Reorder suggestions', 'Regional demand insights'],
      cta: 'Start with Basic',
    },
    {
      name: 'Premium',
      price: 'Demo',
      period: '',
      tagline: 'Analytics, teams & business management',
      features: [
        'Everything in Basic',
        'Sales trends & gross margin insights',
        'Best / slow-moving medicines',
        'Advanced stock & expiry alerts',
        'Supplier & purchase insights',
        'Reorder suggestions',
        'Advanced reports',
        'Employee management & sales performance',
        'Activity audit log',
      ],
      missing: [],
      cta: 'Choose Premium',
      popular: true,
    },
  ];

  return (
    <>
<section className="pricing-section" id="pricing">
  <div className="pricing-inner">
    <div className="pricing-head">
      <div className="eyebrow">Pharmacy subscriptions</div>
      <h2>Simple plans for every pharmacy</h2>
      <p>PharmaChain is offered as a subscription for pharmacy partners. Manufacturers, vendors and doctors connect through the network — pharmacies choose the plan that fits their counter.</p>
    </div>
    <div className="pricing-grid">
      {plans.map((plan) => (
        <div className={`price-card${plan.popular ? ' featured' : ''}`} key={plan.name}>
          {plan.popular && <div className="price-badge">Recommended</div>}
          <div className="plan-name">{plan.name}</div>
          <div className="plan-price">{plan.price}<span>{plan.period}</span></div>
          <div className="plan-tag">{plan.tagline}</div>
          <ul>
            {plan.features.map((feature) => <li key={feature}><span className="ck">✓</span>{feature}</li>)}
            {plan.missing.map((feature) => <li className="miss" key={feature}><span className="ck">–</span>{feature}</li>)}
          </ul>
          <a href="#" onClick={(event)=>{enterApp();event.preventDefault();}} className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}>{plan.cta}</a>
        </div>
      ))}
    </div>
    <p className="pricing-note">Demo only — no real payments. Admin can assign Trial, Basic or Premium inside the prototype.</p>
  </div>
</section>
    </>
  );
}
