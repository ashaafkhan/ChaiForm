'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';



function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      style={{
        padding: '1.25rem',
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249,115,22,0.3)')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)')
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>
        {label}
      </p>
      <p
        style={{
          color: 'var(--text-primary)',
          fontSize: '1.75rem',
          fontWeight: 700,
          fontFamily: 'Poppins, sans-serif',
          marginTop: '0.375rem',
          marginBottom: 0,
        }}
      >
        {value}
      </p>
      {sub && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

const customTooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '8px',
  color: 'var(--text-primary)',
  fontSize: '0.8125rem',
};

export default function AnalyticsPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [days, setDays] = useState(30);

  const { data: form } = trpc.forms.getById.useQuery({ formId });
  const { data: summary } = trpc.analytics.getSummary.useQuery({
    formId,
    dateRange: days === 7 ? '7d' : days === 30 ? '30d' : '90d',
  });
  const { data: timeline } = trpc.analyticsAdvanced.getResponseTimeline.useQuery({ formId, days });
  const { data: funnel } = trpc.analyticsAdvanced.getConversionFunnel.useQuery({ formId, days });
  const { data: metrics } = trpc.analyticsAdvanced.getResponseMetrics.useQuery({ formId });
  const { data: abandonment } = trpc.analyticsAdvanced.getAbandonmentAnalysis.useQuery({
    formId,
    days,
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

  const abandonData = abandonment
    ? [
        { name: 'Completed', value: abandonment.completions },
        { name: 'Abandoned', value: abandonment.abandonments },
        { name: 'In Progress', value: Math.max(0, abandonment.inProgress) },
      ]
    : [];
  const abandonColors = ['#10b981', '#ef4444', '#f59e0b'];

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
          <span style={{ color: s.text, fontWeight: 600, fontSize: '0.9rem' }}>Analytics</span>
        </div>

        {/* Day range selector */}
        <div
          style={{
            display: 'flex',
            gap: '0.25rem',
            background: 'rgba(255,255,255,0.04)',
            padding: '0.25rem',
            borderRadius: '8px',
            border: `1px solid ${s.border}`,
          }}
        >
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                background: days === d ? 'rgba(249,115,22,0.25)' : 'transparent',
                color: days === d ? s.accent : s.muted,
                fontWeight: days === d ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            fontFamily: 'Poppins, sans-serif',
            marginBottom: '0.375rem',
            color: s.text,
          }}
        >
          Analytics
        </h1>
        <p style={{ color: s.muted, marginBottom: '2rem', fontSize: '0.875rem' }}>
          {form?.title} — last {days} days
        </p>

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <StatBox label="Total Views" value={summary?.totalViews ?? '—'} />
          <StatBox label="Form Starts" value={summary?.totalStarts ?? '—'} />
          <StatBox label="Completions" value={summary?.totalCompletions ?? '—'} />
          <StatBox
            label="Completion Rate"
            value={`${summary?.completionRate ?? 0}%`}
            sub="starts → completions"
          />
          <StatBox
            label="Avg. Time"
            value={metrics?.averageTimeSeconds ? `${metrics.averageTimeSeconds}s` : '—'}
          />
          <StatBox label="Abandon Rate" value={`${summary?.abandonRate ?? 0}%`} />
        </div>

        {/* Response Timeline */}
        {timeline && timeline.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              background: s.card,
              border: `1px solid ${s.border}`,
              borderRadius: '12px',
              marginBottom: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: s.text }}>
              📈 Response Timeline
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickFormatter={(d) => d.slice(5)}
                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={customTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bottom Row: Funnel + Abandonment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Conversion Funnel */}
          {funnel ? (
            <div
              style={{
                padding: '1.5rem',
                background: s.card,
                border: `1px solid ${s.border}`,
                borderRadius: '12px',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: s.text }}>
                🔽 Conversion Funnel
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {funnel.funnel.map((stage: any) => (
                  <div key={stage.stage}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.375rem',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', color: s.text, fontWeight: 500 }}>
                        {stage.stage}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: s.muted }}>
                        {stage.count} ({stage.percentage}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${stage.percentage}%`,
                          background: 'linear-gradient(90deg, #f97316, #f59e0b)',
                          borderRadius: '3px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '1.25rem', color: s.muted, fontSize: '0.8125rem' }}>
                Overall conversion:{' '}
                <strong style={{ color: s.accent }}>{funnel.conversionRate}%</strong>
              </p>
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem',
                background: s.card,
                border: `1px solid ${s.border}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.muted,
                fontSize: '0.875rem',
              }}
            >
              No funnel data available
            </div>
          )}

          {/* Abandonment Pie */}
          {abandonment ? (
            <div
              style={{
                padding: '1.5rem',
                background: s.card,
                border: `1px solid ${s.border}`,
                borderRadius: '12px',
              }}
            >
              <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: s.text }}>
                📉 Abandonment Analysis
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={abandonData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {abandonData.map((_: any, i: number) => (
                      <Cell key={i} fill={abandonColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: '0.75rem' }}>
                {abandonData.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: abandonColors[i] }} />
                    <span style={{ fontSize: '0.75rem', color: s.muted }}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '1.5rem',
                background: s.card,
                border: `1px solid ${s.border}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.muted,
                fontSize: '0.875rem',
              }}
            >
              No abandonment data available
            </div>
          )}
        </div>

        {/* Field-level bar chart if metrics has field data */}
        {(metrics as any)?.fieldMetrics && (metrics as any).fieldMetrics.length > 0 && (
          <div
            style={{
              padding: '1.5rem',
              background: s.card,
              border: `1px solid ${s.border}`,
              borderRadius: '12px',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: s.text }}>
              📊 Field Completion Rates
            </h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={(metrics as any).fieldMetrics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  width={120}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  formatter={(val: number) => [`${val}%`, 'Completion']}
                />
                <Bar dataKey="completionRate" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
