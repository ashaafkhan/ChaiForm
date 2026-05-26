'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function CreateFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createMutation = trpc.forms.create.useMutation({
    onSuccess: (data) => {
      router.push(`/forms/${data.form.id}/edit`);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Form title is required');
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 1 }}>
        {/* Back Link */}
        <Link
          href="/dashboard"
          style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginBottom: '1.75rem',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.75rem' }}>☕</span>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Create New Form
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Give your form a name and optional description to get started
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(22,22,31,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          }}
        >
          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: '#ef4444',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.375rem' }}>
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="label-field"
                style={{ display: 'block', marginBottom: '0.5rem' }}
              >
                Form Title <span style={{ color: '#f97316' }}>*</span>
              </label>
              <input
                id="title"
                className="input-field"
                placeholder="e.g., Customer Feedback Survey"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={500}
                autoFocus
                style={{ fontSize: '1rem', width: '100%' }}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                {title.length}/500 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="desc"
                className="label-field"
                style={{ display: 'block', marginBottom: '0.5rem' }}
              >
                Description{' '}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="desc"
                placeholder="Tell respondents what this form is about..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={2000}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'vertical',
                  minHeight: '100px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
                onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(249,115,22,0.5)'; }}
                onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.375rem' }}>
                {description.length}/2000 characters
              </p>
            </div>

            {/* Tips */}
            <div
              style={{
                background: 'rgba(249,115,22,0.06)',
                border: '1px solid rgba(249,115,22,0.15)',
                borderRadius: '10px',
                padding: '0.875rem 1rem',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: 0, fontWeight: 500, color: '#f97316', marginBottom: '0.25rem' }}>💡 Tip</p>
              <p style={{ margin: 0 }}>
                You&apos;ll be taken to the form builder after creation where you can add questions,
                set up logic, and customize the appearance.
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={createMutation.isPending}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  opacity: createMutation.isPending ? 0.7 : 1,
                  cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {createMutation.isPending ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Creating...
                  </span>
                ) : (
                  'Create Form →'
                )}
              </button>
              <Link href="/dashboard">
                <button
                  type="button"
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,0.22)'; b.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,0.12)'; b.style.color = 'var(--text-secondary)'; }}
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.25rem' }}>
          Forms are saved as drafts by default. Publish when ready to collect responses.
        </p>
      </div>
    </div>
  );
}
