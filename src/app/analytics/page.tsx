'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileSearch,
  Sparkles,
  Info,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
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
  AreaChart,
  Area,
} from 'recharts';
import { GovernanceMetrics } from '@/types';

const SEVERITY_COLORS: Record<string, string> = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#3B82F6',
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (json.success) {
          setMetrics(json.data);
        }
      } catch (e) {
        console.error('Failed to load analytics', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading governance analytics...</div>;
  }

  if (!metrics) {
    return <div className="p-8 text-center text-sm text-slate-500">No analytics data available.</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <BarChart3 className="h-4 w-4" />
            Governance Intelligence (Improvement 3)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Brand Governance Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empirical insights into compliance trends, recurring mistakes, and reviewer throughput.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
          <Info className="h-3.5 w-3.5 text-blue-600" />
          <span>Derived from actual stored review records</span>
        </div>
      </div>

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Total Reviews Evaluated</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{metrics.totalReviews}</div>
          <div className="text-[11px] text-slate-500 mt-1">Marketing copy & creatives</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Approved Submissions</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{metrics.approvedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-1">Publication ready</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Average Compliance Score</div>
          <div className="text-2xl font-extrabold text-blue-600 mt-2">{metrics.avgComplianceScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">+4.2% over last 30 days</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="text-xs font-medium text-slate-400">Correction Adoption Rate</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-2">{metrics.correctionAcceptanceRate}%</div>
          <div className="text-[11px] text-indigo-700 mt-1">AI suggestions accepted</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Frequently Violated Categories */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Most Frequently Violated Guideline Categories</h3>
            <p className="text-xs text-slate-500">Distribution of flagged issues across brand governance categories</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categoryViolations} layout="vertical" margin={{ left: 30, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} name="Violations Found" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Issue Severity Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Issue Severity Breakdown</h3>
            <p className="text-xs text-slate-500">Proportion of High, Medium, and Low risk brand issues</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="severity"
                >
                  {metrics.severityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEVERITY_COLORS[entry.severity] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs">
            {metrics.severityDistribution.map((s) => (
              <div key={s.severity} className="flex items-center gap-1.5 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[s.severity] }}
                />
                <span>{s.severity}: <strong>{s.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Review Activity & Approval Throughput */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Review Activity & Approval Velocity (7-Day Trend)</h3>
            <p className="text-xs text-slate-500">Submissions evaluated vs approved for publication</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.activityTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="reviews" stroke="#2563EB" fillOpacity={1} fill="url(#colorReviews)" name="Reviews" />
                <Area type="monotone" dataKey="approvals" stroke="#10B981" fillOpacity={1} fill="url(#colorApprovals)" name="Approved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recurring Mistakes & Brand Coaching */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Recurring Brand Violations & Governance Actions
            </h3>
            <p className="text-xs text-slate-500">Identified from empirical review data across campaigns</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-200">
                <th className="pb-3">Violating Phrase / Pattern</th>
                <th className="pb-3 text-center">Occurrences</th>
                <th className="pb-3">Strategic Brand Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.recurringMistakes.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-mono text-slate-900 font-bold">{item.termOrPhrase}</td>
                  <td className="py-3.5 text-center font-bold text-blue-700">{item.occurrences}</td>
                  <td className="py-3.5 text-slate-600 leading-relaxed">{item.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
