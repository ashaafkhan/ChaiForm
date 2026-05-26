'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@chaiforms/ui/components/button';
import { Card } from '@chaiforms/ui/components/card';
import {
  ResponseTrendChart,
  ConversionFunnelChart,
  FieldEngagementChart,
  AbandonmentMetrics,
  StatsCard,
} from '@/components/AnalyticsCharts';
import { BarChart3, Download, ChevronLeft, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  timeline: Array<{ date: string; responses: number }>;
  funnel: {
    funnel: Array<{ stage: string; count: number; percentage: number }>;
    conversionRate: number;
  };
  engagement: Array<{ fieldLabel: string; focusCount: number; engagementScore: number }>;
  metrics: {
    totalResponses: number;
    completeResponses: number;
    incompleteResponses: number;
    completionRate: number;
    averageTimeSeconds: number;
  };
  abandonment: {
    totalStarts: number;
    completions: number;
    abandonments: number;
    inProgress: number;
    abandonmentRate: number;
    completionRate: number;
  };
}

export default function AnalyticsDashboard() {
  const params = useParams();
  const formId = params.formId as string;
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // TODO: Load analytics data from tRPC
        // const timeline = await trpc.analyticsAdvanced.getResponseTimeline.query({ formId, days: 30 });
        // const funnel = await trpc.analyticsAdvanced.getConversionFunnel.query({ formId, days: 30 });
        // const engagement = await trpc.analyticsAdvanced.getFieldEngagement.query({ formId });
        // const metrics = await trpc.analyticsAdvanced.getResponseMetrics.query({ formId });
        // const abandonment = await trpc.analyticsAdvanced.getAbandonmentAnalysis.query({ formId, days: 30 });

        // Mock data for demonstration
        setData({
          timeline: [
            { date: '2026-04-27', responses: 5 },
            { date: '2026-04-28', responses: 8 },
            { date: '2026-04-29', responses: 12 },
            { date: '2026-04-30', responses: 15 },
            { date: '2026-05-01', responses: 22 },
            { date: '2026-05-02', responses: 18 },
            { date: '2026-05-03', responses: 25 },
          ],
          funnel: {
            funnel: [
              { stage: 'Views', count: 350, percentage: 100 },
              { stage: 'Starts', count: 280, percentage: 80 },
              { stage: 'Submissions', count: 168, percentage: 60 },
            ],
            conversionRate: 48,
          },
          engagement: [
            { fieldLabel: 'Full Name', focusCount: 280, engagementScore: 280 },
            { fieldLabel: 'Email', focusCount: 275, engagementScore: 275 },
            { fieldLabel: 'Phone', focusCount: 198, engagementScore: 198 },
            { fieldLabel: 'Message', focusCount: 168, engagementScore: 168 },
          ],
          metrics: {
            totalResponses: 168,
            completeResponses: 168,
            incompleteResponses: 0,
            completionRate: 100,
            averageTimeSeconds: 245,
          },
          abandonment: {
            totalStarts: 280,
            completions: 168,
            abandonments: 112,
            inProgress: 0,
            abandonmentRate: 40,
            completionRate: 60,
          },
        });

        console.log('Analytics loaded for form:', formId);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [formId, dateRange]);

  const handleExport = () => {
    if (!data) return;

    const csv = generateAnalyticsCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${formId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateAnalyticsCSV = (analyticsData: AnalyticsData): string => {
    const lines: string[] = [];

    // Header
    lines.push('ChaiForms Analytics Export');
    lines.push(`Form ID,${formId}`);
    lines.push(`Export Date,${new Date().toISOString()}`);
    lines.push('');

    // Summary Metrics
    lines.push('SUMMARY METRICS');
    lines.push(`Total Responses,${analyticsData.metrics.totalResponses}`);
    lines.push(`Completion Rate,${analyticsData.metrics.completionRate}%`);
    lines.push(`Average Time (seconds),${analyticsData.metrics.averageTimeSeconds}`);
    lines.push(`Conversion Rate,${analyticsData.funnel.conversionRate}%`);
    lines.push('');

    // Timeline Data
    lines.push('RESPONSE TIMELINE');
    lines.push('Date,Responses');
    analyticsData.timeline.forEach((point) => {
      lines.push(`${point.date},${point.responses}`);
    });
    lines.push('');

    // Funnel Data
    lines.push('CONVERSION FUNNEL');
    lines.push('Stage,Count,Percentage');
    analyticsData.funnel.funnel.forEach((stage) => {
      lines.push(`${stage.stage},${stage.count},${stage.percentage}%`);
    });
    lines.push('');

    // Field Engagement
    lines.push('FIELD ENGAGEMENT');
    lines.push('Field,Focus Count,Engagement Score');
    analyticsData.engagement.forEach((field) => {
      lines.push(`${field.fieldLabel},${field.focusCount},${field.engagementScore}`);
    });

    return lines.join('\n');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/forms/${formId}/edit`}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Editor
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Analytics Dashboard
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Date Range Selector */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setDateRange(range)}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </Button>
                ))}
              </div>

              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-600">Loading analytics...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Total Responses"
                value={data.metrics.totalResponses}
                icon={<TrendingUp className="w-6 h-6" />}
                color="blue"
              />
              <StatsCard
                label="Completion Rate"
                value={`${data.metrics.completionRate}%`}
                icon={<TrendingUp className="w-6 h-6" />}
                color="green"
              />
              <StatsCard
                label="Avg. Time (sec)"
                value={data.metrics.averageTimeSeconds}
                icon={<TrendingUp className="w-6 h-6" />}
                color="amber"
              />
              <StatsCard
                label="Conversion Rate"
                value={`${data.funnel.conversionRate}%`}
                icon={<TrendingUp className="w-6 h-6" />}
                color="purple"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponseTrendChart data={data.timeline} />
              <ConversionFunnelChart data={data.funnel.funnel} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
              <FieldEngagementChart data={data.engagement} />
            </div>

            {/* Abandonment Analysis */}
            <AbandonmentMetrics {...data.abandonment} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-600">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
