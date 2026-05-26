'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ResponsesPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const { data: formData } = trpc.forms.getById.useQuery({ formId });
  const { data, isLoading, refetch } = trpc.responses.list.useQuery({ formId, page, limit: 25 });

  const deleteMutation = trpc.responses.delete.useMutation({
    onSuccess: () => { showToast('Response deleted'); refetch(); setSelectedResponse(null); },
  });

  const exportMutation = trpc.responses.exportCsv.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      showToast('CSV exported!');
    },
  });

  const s = {
    base: 'var(--bg-base)',
    card: 'var(--bg-card)',
    elevated: 'var(--bg-elevated)',
    text: 'var(--text-primary)',
    muted: 'var(--text-secondary)',
    accent: 'var(--chai-orange)',
    border: 'rgba(255,255,255,0.07)',
  };

  return (
    <div style={{ minHeight: '100vh', background: s.base }}>
      {/* Header */}
      <header
        style={{
          background: 'rgba(16,16,24,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${s.border}`,
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={`/forms/${formId}/edit`} style={{ color: s.muted, textDecoration: 'none', fontSize: '0.8125rem' }}>
            ← Editor
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
          <span style={{ color: s.text, fontWeight: 600, fontSize: '0.9rem' }}>Responses</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/forms/${formId}/analytics`}>
            <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}>
              📊 Analytics
            </button>
          </Link>
          <button
            className="btn-primary"
            style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            onClick={() => exportMutation.mutate({ formId })}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? 'Exporting...' : '⬇ Export CSV'}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: 'Poppins, sans-serif',
                color: s.text,
                margin: 0,
              }}
            >
              Responses
            </h1>
            <p style={{ color: s.muted, fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {formData?.title} — {data?.total ?? 0} total responses
            </p>
          </div>
        </div>

        {isLoading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem',
              color: s.muted,
              background: s.card,
              borderRadius: '16px',
              border: `1px solid ${s.border}`,
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
            <p>Loading responses...</p>
          </div>
        ) : !data?.responses?.length ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: s.card,
              borderRadius: '16px',
              border: `1px solid ${s.border}`,
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📭</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: s.text }}>No responses yet</h2>
            <p style={{ color: s.muted, marginTop: '0.5rem' }}>Share your form to start collecting responses</p>
            <Link href={`/forms/${formId}/share`}>
              <button className="btn-primary" style={{ marginTop: '1.25rem' }}>
                Share Form →
              </button>
            </Link>
          </div>
        ) : (
          <div>
            {/* Table */}
            <div
              style={{
                background: s.card,
                border: `1px solid ${s.border}`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${s.border}` }}>
                    {['#', 'Email / Respondent', 'Submitted At', 'Completion Time', 'Actions'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: s.muted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.responses.map((resp: any, i: number) => (
                    <tr
                      key={resp.id}
                      style={{ borderBottom: `1px solid ${s.border}`, transition: 'background 0.15s' }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = s.elevated)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLTableRowElement).style.background = 'transparent')
                      }
                    >
                      <td style={{ padding: '0.875rem 1rem', color: s.muted, fontSize: '0.875rem' }}>
                        {(page - 1) * 25 + i + 1}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: s.text, fontSize: '0.875rem' }}>
                        {resp.respondentEmail || (
                          <span style={{ color: s.muted, fontStyle: 'italic' }}>Anonymous</span>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: s.muted, fontSize: '0.8125rem' }}>
                        {formatDate(resp.submittedAt)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: s.muted, fontSize: '0.8125rem' }}>
                        {resp.completionTimeSeconds ? `${resp.completionTimeSeconds}s` : '—'}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn-ghost"
                            style={{ fontSize: '0.8125rem', padding: '0.25rem 0.625rem' }}
                            onClick={() => setSelectedResponse(resp)}
                          >
                            View
                          </button>
                          <button
                            className="btn-danger"
                            style={{ fontSize: '0.8125rem', padding: '0.25rem 0.625rem' }}
                            onClick={() => {
                              if (confirm('Delete this response?')) {
                                deleteMutation.mutate({ responseId: resp.id });
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '1.5rem',
              }}
            >
              <button
                className="btn-secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
              >
                ← Prev
              </button>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: s.muted,
                  fontSize: '0.875rem',
                  padding: '0 0.75rem',
                }}
              >
                Page {page}
              </span>
              <button
                className="btn-secondary"
                disabled={data.responses.length < 25}
                onClick={() => setPage((p) => p + 1)}
                style={{ padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.72)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedResponse(null)}
        >
          <div
            style={{
              background: s.card,
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: s.text }}>Response Details</h2>
              <button
                className="btn-ghost"
                style={{ padding: '0.25rem 0.625rem' }}
                onClick={() => setSelectedResponse(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ color: s.muted, fontSize: '0.875rem', marginBottom: '1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <span>📅 {formatDate(selectedResponse.submittedAt)}</span>
              {selectedResponse.respondentEmail && (
                <span>📧 {selectedResponse.respondentEmail}</span>
              )}
              {selectedResponse.completionTimeSeconds && (
                <span>⏱ {selectedResponse.completionTimeSeconds}s</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(selectedResponse.answers as Record<string, unknown>).map(
                ([fieldId, answer]) => (
                  <div
                    key={fieldId}
                    style={{
                      padding: '0.875rem',
                      background: s.elevated,
                      borderRadius: '8px',
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: s.muted,
                        marginBottom: '0.375rem',
                        fontFamily: 'monospace',
                      }}
                    >
                      Field: {fieldId.slice(0, 8)}…
                    </p>
                    <p style={{ color: s.text, fontSize: '0.875rem', wordBreak: 'break-word' }}>
                      {Array.isArray(answer) ? answer.join(', ') : String(answer ?? '—')}
                    </p>
                  </div>
                )
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
              <button
                className="btn-danger"
                style={{ fontSize: '0.8125rem' }}
                onClick={() => {
                  if (confirm('Delete this response?')) {
                    deleteMutation.mutate({ responseId: selectedResponse.id });
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                🗑 Delete
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedResponse(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast toast-success" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
