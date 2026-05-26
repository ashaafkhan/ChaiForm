'use client';

import Link from 'next/link';

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    period: 'forever',
    color: '#6b7280',
    description: 'Perfect for personal projects and getting started',
    popular: false,
    features: [
      '5 active forms',
      '100 responses / month',
      '10 field types',
      '3 themes',
      'Basic analytics',
      'Form sharing & embed',
    ],
    cta: 'Get Started Free',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '₹299',
    period: '/ month',
    color: '#f97316',
    description: 'For creators and small businesses who need more power',
    popular: true,
    features: [
      'Unlimited forms',
      '10,000 responses / month',
      'All 20+ field types',
      'All 6 themes',
      'Advanced analytics & funnel',
      'CSV export',
      'Custom domain',
      'Email notifications',
      'QR code sharing',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    href: '/signup?plan=pro',
  },
  {
    name: 'Enterprise',
    price: '₹999',
    period: '/ month',
    color: '#8b5cf6',
    description: 'For teams and organizations at scale',
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited responses',
      'Team collaboration',
      'SSO / SAML',
      'Custom branding & white-label',
      'Webhook integrations',
      'API access',
      'SLA & dedicated support',
      'Audit logs',
      'Custom contracts',
    ],
    cta: 'Contact Sales',
    href: '/signup?plan=enterprise',
  },
];

const FAQ = [
  { q: 'Is ChaiForms really free?', a: 'Yes! The Starter plan is completely free, forever. No credit card required.' },
  { q: 'Can I change plans later?', a: 'Absolutely. Upgrade or downgrade any time from your dashboard.' },
  { q: 'What happens to my data if I downgrade?', a: 'Your data is always safe. Forms exceeding limits become view-only until you upgrade.' },
  { q: 'Do you support custom domains?', a: 'Yes, on Pro and Enterprise plans you can host forms on your own domain.' },
  { q: 'Is there a free trial for Pro?', a: '14-day free trial on the Pro plan — no card needed.' },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>☕</span>
          <span style={{ fontWeight: 800, fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ChaiForms</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/login"><button className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem' }}>Sign In</button></Link>
          <Link href="/signup"><button className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem' }}>Get Started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '5rem 2rem 3rem', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.12), transparent)' }}>
        <div className="badge badge-orange" style={{ marginBottom: '1rem', display: 'inline-flex' }}>💰 Pricing</div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '480px', margin: '0 auto' }}>
          Start free. Upgrade when you&apos;re ready. No surprises, ever.
        </p>
      </section>

      {/* Plans */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              padding: '2rem',
              background: plan.popular ? `rgba(249,115,22,0.05)` : 'var(--bg-card)',
              border: `2px solid ${plan.popular ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '20px',
              position: 'relative',
              transition: 'all 0.25s ease',
              boxShadow: plan.popular ? '0 0 50px rgba(249,115,22,0.1)' : 'none',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f97316, #f59e0b)', borderRadius: '999px', padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                  ⭐ Most Popular
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 700, color: plan.color, fontSize: '0.875rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>{plan.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{plan.period}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>{plan.description}</p>
              </div>

              <Link href={plan.href}>
                <button style={{
                  width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'Inter, sans-serif',
                  background: plan.popular ? 'linear-gradient(135deg, #f97316, #f59e0b)' : 'var(--bg-elevated)',
                  color: plan.popular ? '#fff' : 'var(--text-primary)',
                  boxShadow: plan.popular ? '0 4px 20px rgba(249,115,22,0.3)' : 'none',
                  marginBottom: '1.5rem',
                  transition: 'all 0.15s ease',
                }}>
                  {plan.cta} →
                </button>
              </Link>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '1.25rem' }} />

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 2rem 6rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', textAlign: 'center', marginBottom: '2.5rem' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{item.q}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
