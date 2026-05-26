'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { getStoredUser, logout } from '@/lib/auth';

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500 }}>{label}</p>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.875rem', fontWeight: 700, marginTop: '0.375rem', fontFamily: 'Poppins, sans-serif' }}>{value}</p>
        </div>
        <div style={{ fontSize: '2rem', background: color, borderRadius: '12px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Published', cls: 'badge badge-green' },
    draft: { label: 'Draft', cls: 'badge badge-yellow' },
    archived: { label: 'Archived', cls: 'badge badge-gray' },
  };
  const info = map[status] || { label: status, cls: 'badge badge-gray' };
  return <span className={info.cls}>● {info.label}</span>;
}

function FormSkeleton() {
  return (
    <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
      <div className="skeleton" style={{ height: '1.25rem', width: '60%', marginBottom: '0.75rem' }} />
      <div className="skeleton" style={{ height: '0.875rem', width: '40%', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="skeleton" style={{ height: '1.5rem', width: '80px', borderRadius: '999px' }} />
        <div className="skeleton" style={{ height: '1.5rem', width: '100px', borderRadius: '999px' }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
  }, [router]);

  const { data: statsData } = trpc.analytics.getDashboardStats.useQuery(undefined, { enabled: !!user });
  const { data: formsData, isLoading, refetch } = trpc.forms.list.useQuery(
    { page: 1, limit: 50, status: statusFilter === 'all' ? undefined : statusFilter as any },
    { enabled: !!user }
  );

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { setDeleteConfirm(null); refetch(); },
  });

  const filteredForms = (formsData?.forms || []).filter(f =>
    search === '' || f.title.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All Forms' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'archived', label: 'Archived' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top Nav */}
      <header
        style={{
          background: 'rgba(16,16,24,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>☕</span>
            <span
              style={{
                fontWeight: 800,
                fontFamily: 'Poppins, sans-serif',
                background: 'linear-gradient(135deg, #f97316, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.125rem',
              }}
            >
              ChaiForms
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                👤 {user.name}
              </span>
            )}
            <Link href="/forms/create">
              <button
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                + New Form
              </button>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem 0.875rem',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              fontFamily: 'Poppins, sans-serif',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            My Forms
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem', fontSize: '0.9rem' }}>
            Manage and analyze your forms
          </p>
        </div>

        {/* Stats Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <StatCard label="Total Forms" value={statsData?.totalForms ?? '—'} icon="📋" color="rgba(249,115,22,0.15)" />
          <StatCard label="Published" value={statsData?.publishedForms ?? '—'} icon="🚀" color="rgba(16,185,129,0.15)" />
          <StatCard label="Total Responses" value={statsData?.totalResponses ?? '—'} icon="💬" color="rgba(139,92,246,0.15)" />
          <StatCard label="Total Views" value={statsData?.totalViews ?? '—'} icon="👁" color="rgba(14,165,233,0.15)" />
        </div>

        {/* Search + Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '360px' }}>
            <span
              style={{
                position: 'absolute',
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              className="input-field"
              placeholder="Search forms..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '10px',
              padding: '0.25rem',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  transition: 'all 0.15s ease',
                  background: statusFilter === tab.key ? 'rgba(249,115,22,0.18)' : 'transparent',
                  color: statusFilter === tab.key ? '#f97316' : 'var(--text-secondary)',
                  borderBottom: statusFilter === tab.key ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Forms Grid / Loading / Empty */}
        {isLoading ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map(i => <FormSkeleton key={i} />)}
          </div>
        ) : filteredForms.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {search ? 'No forms match your search' : 'No forms yet'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {search ? 'Try a different search term or clear the filter.' : 'Create your first form to get started collecting responses.'}
            </p>
            {!search && (
              <Link href="/forms/create">
                <button className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  + Create Your First Form
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {filteredForms.map((form, i) => (
              <div
                key={form.id}
                style={{
                  padding: '1.25rem 1.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  animation: 'fadeInUp 0.4s ease forwards',
                  animationDelay: `${i * 0.04}s`,
                  opacity: 0,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'rgba(249,115,22,0.3)';
                  el.style.transform = 'translateY(-1px)';
                  el.style.boxShadow = '0 4px 24px rgba(249,115,22,0.06)';
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = 'rgba(255,255,255,0.06)';
                  el.style.transform = 'none';
                  el.style.boxShadow = 'none';
                }}
              >
                {/* Form Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '320px',
                      }}
                    >
                      {form.title}
                    </h3>
                    <StatusBadge status={form.status} />
                    {(form as any).visibility === 'public' && (
                      <span className="badge badge-orange">🌐 Public</span>
                    )}
                  </div>
                  {form.description && (
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8125rem',
                        marginTop: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '480px',
                      }}
                    >
                      {form.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      💬 {(form as any).responseCount ?? 0} responses
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      👁 {(form as any).viewCount ?? 0} views
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      Updated {new Date(form.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Link href={`/forms/${form.id}/edit`}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      ✏️ Edit
                    </button>
                  </Link>
                  <Link href={`/forms/${form.id}/responses`}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      💬 Responses
                    </button>
                  </Link>
                  <Link href={`/forms/${form.id}/analytics`}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      📊 Analytics
                    </button>
                  </Link>
                  <Link href={`/forms/${form.id}/share`}>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      🔗 Share
                    </button>
                  </Link>
                  {deleteConfirm === form.id ? (
                    <>
                      <button
                        className="btn-danger"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                        onClick={() => deleteMutation.mutate({ formId: form.id })}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? '...' : 'Confirm'}
                      </button>
                      <button
                        style={{
                          padding: '0.375rem 0.75rem',
                          fontSize: '0.8125rem',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-danger"
                      style={{ padding: '0.375rem 0.625rem', fontSize: '0.8125rem' }}
                      onClick={() => setDeleteConfirm(form.id)}
                      title="Delete form"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Backdrop */}
      {deleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 40,
          }}
          onClick={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
