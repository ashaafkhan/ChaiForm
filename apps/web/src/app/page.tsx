'use client';
import Link from 'next/link';


const FEATURES = [
  { icon: '🎨', title: '14+ Themes', desc: 'Anime, movies, minimal — stunning out of the box' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Conversion funnels, response timelines, field metrics' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'tRPC + Drizzle ORM for zero-latency form loads' },
  { icon: '🔗', title: 'Instant Sharing', desc: 'QR codes, social sharing, embed anywhere in 1 click' },
  { icon: '💬', title: '20+ Field Types', desc: 'Text, rating, matrix, file upload, conditional logic' },
  { icon: '🔒', title: 'Password Protection', desc: 'Keep forms private with optional password gates' },
];

const THEMES = [
  { name: 'The Matrix', category: 'Movies', color: '#00FF41', bg: '#0D0208' },
  { name: 'Interstellar', category: 'Movies', color: '#F5A623', bg: '#0A0E1A' },
  { name: 'Demon Slayer', category: 'Anime', color: '#E63946', bg: '#1B0A0A' },
  { name: 'Cyberpunk', category: 'Anime', color: '#FF2D78', bg: '#0D0D0D' },
  { name: 'Ocean Breeze', category: 'Nature', color: '#0EA5E9', bg: '#F0F9FF' },
  { name: 'Midnight', category: 'Minimal', color: '#8B5CF6', bg: '#0F0F1A' },
];

const STATS = [
  { value: '10K+', label: 'Forms Created' },
  { value: '14', label: 'Unique Themes' },
  { value: '20+', label: 'Field Types' },
  { value: '100%', label: 'Type-Safe' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.375rem' }}>☕</span>
          <span style={{
            fontWeight: 800, fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem',
            background: 'linear-gradient(135deg, #f97316, #f59e0b)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ChaiForms</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link href="/explore" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ fontSize: '0.875rem' }}>Templates</button>
          </Link>
          <Link href="/pricing" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ fontSize: '0.875rem' }}>Pricing</button>
          </Link>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem' }}>Sign In</button>
          </Link>
          <Link href="/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem' }}>Get Started Free</button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4rem 2rem',
        background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(249,115,22,0.18), transparent), radial-gradient(ellipse 40% 40% at 80% 60%, rgba(245,158,11,0.06), transparent), var(--bg-base)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.06), transparent)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
          <div className="badge badge-orange" style={{ marginBottom: '1.5rem', display: 'inline-flex', fontSize: '0.8rem', padding: '0.35rem 0.875rem' }}>
            ✨ The Modern Typeform Alternative — Free Forever
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1,
            fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)',
            marginBottom: '1.5rem', letterSpacing: '-0.02em',
          }}>
            Build Forms That<br />
            <span style={{
              background: 'linear-gradient(135deg, #f97316, #f59e0b, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Actually Convert
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            ChaiForms is a production-grade Typeform alternative. Create stunning forms with 14 anime/movie themes, real-time analytics, conditional logic, and instant sharing — in minutes.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Link href="/signup">
              <button className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700, boxShadow: '0 8px 32px rgba(249,115,22,0.35)' }}>
                Start Building Free →
              </button>
            </Link>
            <Link href="/explore">
              <button className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                Browse Templates
              </button>
            </Link>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No credit card required · Free forever on Starter plan</p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
            {STATS.map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes Showcase */}
      <section style={{ padding: '6rem 2rem', background: 'var(--bg-surface, #111118)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-orange" style={{ marginBottom: '1rem', display: 'inline-flex' }}>🎨 Themes</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
            14 Stunning Themes
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem' }}>
            From anime aesthetics to minimal dark — every form tells a story.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {THEMES.map(theme => (
              <div key={theme.name} style={{
                padding: '1.5rem 1rem',
                background: theme.bg,
                borderRadius: '14px',
                border: `1px solid ${theme.color}30`,
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${theme.color}25`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme.color, margin: '0 auto 0.875rem', boxShadow: `0 0 20px ${theme.color}60` }} />
                <p style={{ fontWeight: 700, color: theme.color, fontSize: '0.9rem', fontFamily: 'Poppins, sans-serif' }}>{theme.name}</p>
                <p style={{ fontSize: '0.75rem', color: theme.color + '99', marginTop: '0.2rem' }}>{theme.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div className="badge badge-orange" style={{ marginBottom: '1rem', display: 'inline-flex' }}>⚡ Features</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
            Everything You Need
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3.5rem', fontSize: '1rem' }}>
            Built with tRPC, Drizzle ORM, Zod, and Next.js 14 — production-grade from day one.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                padding: '1.75rem', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', transition: 'all 0.25s ease',
                animation: 'fadeInUp 0.5s ease forwards', animationDelay: `${i * 0.06}s`, opacity: 0,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>
                <div style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Poppins, sans-serif' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-surface, #111118)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '2rem' }}>
            Powered by a world-class stack
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Turborepo', 'Next.js 14', 'tRPC', 'Drizzle ORM', 'Zod', 'Neon PostgreSQL', 'Tailwind CSS v4', 'Scalar API'].map(tech => (
              <span key={tech} className="badge badge-gray" style={{ fontSize: '0.8rem', padding: '0.4rem 0.875rem' }}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '7rem 2rem', textAlign: 'center',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(249,115,22,0.12), transparent)',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
            Ready to Build?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.0625rem', lineHeight: 1.6 }}>
            Sign up free, create a form in 2 minutes, and share it with the world. No credit card. No limits on the free plan.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <button className="btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '1.0625rem', fontWeight: 700, boxShadow: '0 8px 40px rgba(249,115,22,0.35)' }}>
                ☕ Start Free Today →
              </button>
            </Link>
            <Link href="/login">
              <button className="btn-secondary" style={{ padding: '0.875rem 2.25rem', fontSize: '1.0625rem' }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.125rem' }}>☕</span>
          <span style={{ fontWeight: 700, fontFamily: 'Poppins, sans-serif', background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ChaiForms</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          © 2026 ChaiForms · Built with Turborepo, tRPC, Drizzle ORM &amp; Zod
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          {[['/', 'Home'], ['/explore', 'Templates'], ['/pricing', 'Pricing'], ['/login', 'Sign In'], ['/signup', 'Sign Up']].map(([href, label]) => (
            <Link key={href} href={href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.8125rem' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--chai-orange)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}>
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
