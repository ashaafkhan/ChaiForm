'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

const CATEGORIES = ['All', 'quiz', 'survey', 'feedback', 'event', 'entertainment'];

const CATEGORY_ICONS: Record<string, string> = {
  All: '✨', quiz: '🧠', survey: '📊', feedback: '💬', event: '🎉', entertainment: '🎬',
};

export default function ExplorePage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading } = trpc.forms.listTemplates.useQuery({
    category: category === 'All' ? undefined : category,
    limit: 30,
  });

  const filtered = (data?.templates || []).filter(f =>
    search === '' || f.title.toLowerCase().includes(search.toLowerCase())
  );

  const s = {
    base: 'var(--bg-base)', card: 'var(--bg-card)', elevated: 'var(--bg-elevated)',
    text: 'var(--text-primary)', muted: 'var(--text-secondary)', hint: 'var(--text-muted)',
    accent: 'var(--chai-orange)', border: 'rgba(255,255,255,0.07)',
  };

  return (
    <div style={{ minHeight: '100vh', background: s.base, fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${s.border}`, padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      <section style={{ textAlign: 'center', padding: '4rem 2rem 2.5rem', background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.1), transparent)' }}>
        <div className="badge badge-orange" style={{ marginBottom: '1rem', display: 'inline-flex' }}>🗂️ Templates</div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, fontFamily: 'Poppins, sans-serif', marginBottom: '1rem' }}>
          Explore Form Templates
        </h1>
        <p style={{ color: s.muted, fontSize: '1rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          Browse public forms and templates. Use them as inspiration or start from a copy.
        </p>
        <input
          className="input-field"
          placeholder="🔍 Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: '400px', margin: '0 auto', display: 'block', fontSize: '0.9rem' }}
        />
      </section>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 2rem 1.5rem', overflowX: 'auto', maxWidth: '1100px', margin: '0 auto' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            padding: '0.4rem 0.875rem', borderRadius: '999px', border: `1px solid ${category === cat ? 'rgba(249,115,22,0.5)' : s.border}`,
            background: category === cat ? 'rgba(249,115,22,0.12)' : 'transparent',
            color: category === cat ? s.accent : s.muted,
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: category === cat ? 600 : 400,
            whiteSpace: 'nowrap', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
          }}>
            {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 5rem' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ padding: '1.5rem', background: s.card, border: `1px solid ${s.border}`, borderRadius: '14px' }}>
                <div className="skeleton" style={{ height: '1.25rem', width: '60%', marginBottom: '0.875rem' }} />
                <div className="skeleton" style={{ height: '0.875rem', width: '80%', marginBottom: '0.5rem' }} />
                <div className="skeleton" style={{ height: '0.875rem', width: '50%' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: s.card, borderRadius: '16px', border: `1px solid ${s.border}` }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: s.text }}>No templates found</h2>
            <p style={{ color: s.muted, marginTop: '0.5rem' }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((form: any, i: number) => (
              <div key={form.id} style={{
                padding: '1.5rem', background: s.card,
                border: `1px solid ${s.border}`, borderRadius: '14px',
                transition: 'all 0.2s ease',
                animation: 'fadeInUp 0.4s ease forwards', animationDelay: `${i * 0.04}s`, opacity: 0,
                cursor: 'default',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(249,115,22,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = s.border; (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, lineHeight: 1.3 }}>{form.title}</h3>
                  {form.templateCategory && (
                    <span className="badge badge-orange" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {CATEGORY_ICONS[form.templateCategory]} {form.templateCategory}
                    </span>
                  )}
                </div>
                {form.description && (
                  <p style={{ color: s.muted, fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '1.125rem' }}>
                    {form.description.length > 90 ? form.description.slice(0, 90) + '…' : form.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ color: s.hint, fontSize: '0.75rem' }}>💬 {form.responseCount || 0} responses</span>
                    <span style={{ color: s.hint, fontSize: '0.75rem' }}>👁 {form.viewCount || 0} views</span>
                  </div>
                  <span style={{ color: s.hint, fontSize: '0.75rem' }}>
                    {(form.fields?.length || 0)} fields
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/f/${form.slug}`} style={{ flex: 1 }}>
                    <button className="btn-primary" style={{ width: '100%', padding: '0.5rem', fontSize: '0.8125rem' }}>
                      Fill Form →
                    </button>
                  </Link>
                  <Link href="/signup">
                    <button className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>
                      Use Template
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '4rem', padding: '3rem', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginBottom: '0.75rem' }}>Build Your Own Form</h2>
          <p style={{ color: s.muted, marginBottom: '1.5rem' }}>Create a custom form from scratch in minutes — free forever.</p>
          <Link href="/signup">
            <button className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
              ☕ Get Started Free →
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
