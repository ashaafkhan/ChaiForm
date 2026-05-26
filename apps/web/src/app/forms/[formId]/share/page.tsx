'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function SharePage() {
  const params = useParams();
  const formId = params.formId as string;
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`${label} copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const { data: form } = trpc.forms.getById.useQuery({ formId });
  const publishMutation = trpc.forms.publish.useMutation({ onSuccess: () => showToast('Form published! 🚀') });
  const unpublishMutation = trpc.forms.unpublish.useMutation({ onSuccess: () => showToast('Form unpublished') });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chaiforms.dev';
  const formUrl = form?.slug ? `${baseUrl}/f/${form.slug}` : '';
  const embedCode = formUrl ? `<iframe src="${formUrl}" width="100%" height="650" frameborder="0" style="border:none;border-radius:12px;"></iframe>` : '';
  const isPublished = form?.status === 'published';

  const s = {
    base: 'var(--bg-base)', card: 'var(--bg-card)', elevated: 'var(--bg-elevated)',
    text: 'var(--text-primary)', muted: 'var(--text-secondary)', accent: 'var(--chai-orange)',
    border: 'rgba(255,255,255,0.08)',
  };

  return (
    <div style={{ minHeight: '100vh', background: s.base }}>
      {/* Header */}
      <header style={{ background: 'rgba(13,13,20,0.97)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${s.border}`, padding: '0 1.5rem', height: '52px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href={`/forms/${formId}/edit`} style={{ color: s.muted, textDecoration: 'none', fontSize: '0.8rem' }}>← Editor</Link>
        <span style={{ color: s.border }}>|</span>
        <span style={{ fontSize: '0.8rem' }}>🔗</span>
        <span style={{ color: s.text, fontWeight: 600, fontSize: '0.9rem' }}>{form?.title || '...'}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <Link href={`/forms/${formId}/responses`}><button className="btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>💬 Responses</button></Link>
          <Link href={`/forms/${formId}/analytics`}><button className="btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>📊 Analytics</button></Link>
        </div>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, fontFamily: 'Poppins, sans-serif', marginBottom: '0.375rem' }}>Share Your Form</h1>
        <p style={{ color: s.muted, marginBottom: '2.5rem', fontSize: '0.9rem' }}>Get the link, embed code, or share on social media</p>

        {/* Status Card */}
        <div style={{
          padding: '1.25rem 1.5rem', background: isPublished ? 'rgba(16,185,129,0.08)' : s.card,
          border: `1px solid ${isPublished ? 'rgba(16,185,129,0.3)' : s.border}`,
          borderRadius: '14px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1rem' }}>{isPublished ? '✅' : '⏸️'}</span>
              <span style={{ fontWeight: 700, color: s.text, fontSize: '0.9375rem' }}>{isPublished ? 'Live & Accepting Responses' : 'Draft — Not Public Yet'}</span>
            </div>
            <p style={{ color: s.muted, fontSize: '0.8125rem' }}>
              {isPublished ? 'Your form is public and can be filled.' : 'Publish to make it accessible.'}
            </p>
          </div>
          <button
            className={isPublished ? 'btn-danger' : 'btn-primary'}
            style={{ whiteSpace: 'nowrap', padding: '0.5rem 1rem', fontSize: '0.875rem', flexShrink: 0 }}
            onClick={() => isPublished ? unpublishMutation.mutate({ formId }) : publishMutation.mutate({ formId, visibility: 'public' })}
          >
            {isPublished ? 'Unpublish' : 'Publish Now 🚀'}
          </button>
        </div>

        {/* Form URL */}
        <div style={{ padding: '1.5rem', background: s.card, border: `1px solid ${s.border}`, borderRadius: '14px', marginBottom: '1rem' }}>
          <p style={{ fontWeight: 700, color: s.text, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📋</span> Form Link
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input readOnly value={formUrl} className="input-field" style={{ flex: 1, fontSize: '0.8rem', color: s.muted, cursor: 'text' }} />
            <button className="btn-primary" style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap', fontSize: '0.875rem' }} onClick={() => copy(formUrl, 'Link')}>
              {copied === 'Link' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {isPublished && (
              <a href={formUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>🔗 Open Form</button>
              </a>
            )}
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent('Fill out my form: ' + (form?.title || ''))}`} target="_blank" rel="noopener noreferrer">
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>𝕏 Twitter</button>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent((form?.title || 'Form') + ': ' + formUrl)}`} target="_blank" rel="noopener noreferrer">
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>💬 WhatsApp</button>
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`} target="_blank" rel="noopener noreferrer">
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>💼 LinkedIn</button>
            </a>
          </div>
        </div>

        {/* Stats */}
        {form && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {[
              { label: 'Responses', value: form.responseCount ?? 0, icon: '💬' },
              { label: 'Views', value: form.viewCount ?? 0, icon: '👁' },
              { label: 'Status', value: isPublished ? 'Live' : 'Draft', icon: '📊' },
            ].map(stat => (
              <div key={stat.label} style={{ padding: '1rem', background: s.card, border: `1px solid ${s.border}`, borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.text, fontFamily: 'Poppins, sans-serif' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: s.muted }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Embed Code */}
        <div style={{ padding: '1.5rem', background: s.card, border: `1px solid ${s.border}`, borderRadius: '14px' }}>
          <p style={{ fontWeight: 700, color: s.text, marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{'</>'}</span> Embed Code
          </p>
          <textarea readOnly value={embedCode} rows={4}
            style={{ width: '100%', background: 'var(--bg-elevated)', border: `1px solid ${s.border}`, borderRadius: '8px', padding: '0.875rem', color: s.muted, fontFamily: 'monospace', fontSize: '0.8rem', resize: 'none', outline: 'none', lineHeight: 1.5 }} />
          <button className="btn-secondary" style={{ marginTop: '0.625rem', fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }} onClick={() => copy(embedCode, 'Embed code')}>
            {copied === 'Embed code' ? '✓ Copied!' : 'Copy Embed Code'}
          </button>
        </div>
      </main>

      {toast && (
        <div className="toast toast-success" style={{ animation: 'slideInRight 0.3s ease' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
