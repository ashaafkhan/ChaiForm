'use client';

import React from 'react';
import { Card } from '@chaiforms/ui';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResponseTrendChartProps {
  data: Array<{ date: string; responses: number }>;
}

export const ResponseTrendChart: React.FC<ResponseTrendChartProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Response Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="responses" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface ConversionFunnelChartProps {
  data: Array<{ stage: string; count: number; percentage: number }>;
}

export const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversion Funnel</h3>
      <div className="space-y-4">
        {data.map((stage, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-slate-700">{stage.stage}</span>
              <span className="text-sm text-slate-600">{stage.count} ({stage.percentage}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface FieldEngagementChartProps {
  data: Array<{ fieldLabel: string; focusCount: number; engagementScore: number }>;
}

export const FieldEngagementChart: React.FC<FieldEngagementChartProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Field Engagement</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fieldLabel" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="focusCount" fill="#8b5cf6" name="Focus Count" />
          <Bar dataKey="engagementScore" fill="#3b82f6" name="Engagement Score" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface ResponseDistributionChartProps {
  data: Array<{ answer: string; count: number; percentage: number }>;
  fieldLabel: string;
}

export const ResponseDistributionChart: React.FC<ResponseDistributionChartProps> = ({ data, fieldLabel }) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Response Distribution: {fieldLabel}</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.answer} (${entry.percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-300 flex items-center justify-center text-slate-500">
          No response data available
        </div>
      )}
    </Card>
  );
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

interface AbandonmentMetricsProps {
  totalStarts: number;
  completions: number;
  abandonments: number;
  inProgress: number;
  abandonmentRate: number;
  completionRate: number;
}

export const AbandonmentMetrics: React.FC<AbandonmentMetricsProps> = ({
  totalStarts,
  completions,
  abandonments,
  inProgress,
  abandonmentRate,
  completionRate,
}) => {
  const data = [
    { name: 'Completed', value: completions },
    { name: 'Abandoned', value: abandonments },
    { name: 'In Progress', value: inProgress },
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Abandonment Analysis</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-slate-600">Total Starts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalStarts}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{completionRate}%</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Abandonment Rate</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{abandonmentRate}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
