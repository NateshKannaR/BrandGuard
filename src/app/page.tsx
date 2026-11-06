'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileSearch,
  BookOpen,
  Inbox,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Info,
  UserCheck,
} from 'lucide-react';
import { GovernanceMetrics, ContentSubmission } from '@/types';
import { getStatusBadgeClass, formatDate } from '@/lib/utils';
import { DEMO_METRICS, DEMO_SUBMISSIONS } from '@/lib/storage/mock-data';
import { useRole } from '@/components/layout/RoleContext';

export default function DashboardPage() {
  const { currentUser } = useRole();
  // Initialize with seeded baseline so metrics NEVER show '--' or blank delay
  const [metrics, setMetrics] = useState<GovernanceMetrics>(DEMO_METRICS);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>(DEMO_SUBMISSIONS.slice(0, 5));
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/submissions'),
        ]);
        const mData = await mRes.json();
        const sData = await sRes.json();

        if (mData.success && mData.data) setMetrics(mData.data);
        if (sData.success && sData.data) setSubmissions(sData.data.slice(0, 5));
      } catch (err) {
        console.warn('Dashboard fetch fallback to local store baseline:', err);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Role Switching Environment Disclaimer Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Evaluation Environment
              </span>
              <span className="text-xs text-slate-300">Active User: <strong className="text-white">{currentUser.name}</strong> ({currentUser.title})</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Role-switching is <strong>simulated in the top header</strong> so evaluators can test creator submissions and reviewer approval workflows without multiple logins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/review"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <FileSearch className="h-4 w-4" />
            <span>Test Compliance Check</span>
          </Link>
        </div>
      </div>

      {/* Welcome & Primary Action Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <ShieldCheck className="h-4 w-4" />
            Brand Governance Command Center
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            NovaTech Brand Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Live compliance monitoring for marketing copy, social releases, and visual assets against approved corporate guidelines and audited SLA commitments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/review"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            <FileSearch className="h-4 w-4" />
            <span>New Content Review</span>
          </Link>
          <Link
            href="/queue"
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Inbox className="h-4 w-4" />
            <span>Review Queue</span>
          </Link>
        </div>
      </div>

      {/* Governance Insights Alerts */}
      {metrics && metrics.insights && metrics.insights.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Active Governance Insights & Recommendations
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.insights.map((ins) => (
              <div
                key={ins.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {ins.type === 'warning' ? (
                      <span className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-200">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded bg-blue-50 text-blue-600 border border-blue-200">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{ins.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ins.description}</p>
                </div>
                {ins.actionUrl && (
                  <Link
                    href={ins.actionUrl}
                    className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-2 border-t border-slate-100"
                  >
                    <span>{ins.actionLabel || 'Learn more'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metric KPI Cards (NEVER display '--') */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Reviews Evaluated</span>
            <FileSearch className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics.totalReviews}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Live guideline coverage
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Approvals</span>
            <Inbox className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics.pendingCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting reviewer sign-off</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Compliance Score</span>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics.avgComplianceScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Across all content channels</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Correction Adoption</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics.correctionAcceptanceRate}%
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">High creator alignment</div>
        </div>
      </div>

      {/* Two Column Layout: Recent Reviews & Knowledge Base Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Content Reviews */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Content Submissions</h2>
              <p className="text-xs text-slate-500">Live submissions processed by BrandGuard governance</p>
            </div>
            <Link
              href="/queue"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(sub.status)}`}>
                      {sub.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">• {sub.contentType}</span>
                  </div>
                  <Link
                    href={`/queue/${sub.id}`}
                    className="text-sm font-semibold text-slate-900 hover:text-blue-600 truncate block mt-1"
                  >
                    {sub.title}
                  </Link>
                  <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                    <span>By {sub.creatorName}</span>
                    <span>•</span>
                    <span>{formatDate(sub.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {sub.latestReview && (
                    <div className="inline-flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-900">
                        {sub.latestReview.compliance_score}/100
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {sub.latestReview.issues.length} {sub.latestReview.issues.length === 1 ? 'flag' : 'flags'}
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/queue/${sub.id}`}
                    className="ml-3 inline-block px-3 py-1 text-xs border border-slate-200 rounded-lg hover:bg-white text-slate-700 font-medium"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Knowledge Base & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                Brand Knowledge Hub
              </h3>
              <Link href="/guidelines" className="text-xs text-blue-600 font-semibold hover:underline">
                Manage
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Active governance standards stored and referenced by the AI compliance engine:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Tone of Voice Rules</span>
                <span className="font-semibold text-slate-900">Active</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Customer Terminology Rules</span>
                <span className="font-semibold text-slate-900">3 Rules</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Audited SLA (99.95%)</span>
                <span className="font-semibold text-slate-900">Verified</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">WCAG 2.1 AA Accessibility</span>
                <span className="font-semibold text-slate-900">Enforced</span>
              </div>
            </div>

            <Link
              href="/guidelines"
              className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <span>Explore Knowledge Base</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
