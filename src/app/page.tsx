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
    <div className="space-y-8">
      {/* Futuristic Enterprise Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-xl shadow-slate-950/20 p-6 sm:p-8 text-white">
        {/* Ambient Gradient Glows in Background */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-canvas-dark opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Explainable AI Brand Governance Active</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px]">NovaTech Enterprise</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              AI-Powered Content & Brand Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Continuous compliance verification against corporate voice, audited SLA commitments, approved facts, and visual identity standards.
            </p>

            {/* Quick telemetry tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400 font-medium">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 9 Active Guidelines
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" /> 91.2% Acceptance
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" /> Real-Time Pre-Publish Check
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <Link
              href="/review"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FileSearch className="h-4 w-4 text-cyan-300" />
              <span>Launch Content Studio</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/visual-review"
              className="flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 text-slate-200 px-5 py-3 rounded-2xl text-xs font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Visual Asset Studio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Evaluator Context Notice */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                Audit Mode
              </span>
              <span className="text-xs font-bold text-slate-800">
                Operating as: <strong className="text-blue-600">{currentUser.name}</strong> ({currentUser.title})
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulated multi-role testing is enabled in the top header to explore both Creator and Reviewer approval permissions.
            </p>
          </div>
        </div>

        <Link
          href="/review"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
        >
          <span>Run Test Scenario</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Key Metric KPI Cards (NEVER display '--') */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews Evaluated */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Reviews Evaluated</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileSearch className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
            {metrics.totalReviews}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Live guideline coverage</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Approvals</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Inbox className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
            {metrics.pendingCount}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Awaiting reviewer sign-off</span>
          </div>
        </div>

        {/* Avg Compliance Score */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Avg Compliance Score</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
            {metrics.avgComplianceScore}%
          </div>
          <div className="text-xs text-slate-500 font-medium mt-2 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>Across all marketing channels</span>
          </div>
        </div>

        {/* Correction Adoption */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden group">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 left-0 right-0" />
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Correction Adoption</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
            {metrics.correctionAcceptanceRate}%
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>High creator alignment</span>
          </div>
        </div>
      </div>

      {/* Governance Insights Alerts */}
      {metrics && metrics.insights && metrics.insights.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Active Governance Insights & Recommendations
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.insights.map((ins) => (
              <div
                key={ins.id}
                className="glass-card rounded-2xl p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    {ins.type === 'warning' ? (
                      <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80">
                        <TrendingUp className="h-4 w-4" />
                      </span>
                    )}
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">{ins.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ins.description}</p>
                </div>
                {ins.actionUrl && (
                  <Link
                    href={ins.actionUrl}
                    className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 pt-3 border-t border-slate-100"
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

      {/* Two Column Layout: Recent Reviews & Knowledge Base Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recent Content Reviews */}
        <div className="lg:col-span-2 glass-card rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Recent Content Submissions</h2>
              <p className="text-xs text-slate-500">Live submissions processed by BrandGuard governance</p>
            </div>
            <Link
              href="/queue"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(sub.status)}`}>
                      {sub.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">• {sub.contentType}</span>
                  </div>
                  <Link
                    href={`/queue/${sub.id}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 truncate block mt-1 transition-colors"
                  >
                    {sub.title}
                  </Link>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span>By {sub.creatorName}</span>
                    <span>•</span>
                    <span>{formatDate(sub.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  {sub.latestReview && (
                    <div className="inline-flex flex-col items-end">
                      <span className="text-xs font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {sub.latestReview.compliance_score}/100
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5">
                        {sub.latestReview.issues.length} {sub.latestReview.issues.length === 1 ? 'flag' : 'flags'}
                      </span>
                    </div>
                  )}
                  <Link
                    href={`/queue/${sub.id}`}
                    className="px-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:text-blue-600 text-slate-700 font-bold transition-all shadow-2xs"
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
          <div className="glass-card rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                Brand Knowledge Hub
              </h3>
              <Link href="/guidelines" className="text-xs text-blue-600 font-bold hover:underline">
                Manage
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Active governance standards stored and referenced by the AI compliance engine:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Tone of Voice Rules</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="h-3 w-3" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Terminology Dictionary</span>
                <span className="font-bold text-blue-600 text-[11px]">3 Rules</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Audited SLA (99.95%)</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="h-3 w-3" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">WCAG 2.1 AA Accessibility</span>
                <span className="font-bold text-indigo-600 text-[11px]">Enforced</span>
              </div>
            </div>

            <Link
              href="/guidelines"
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.01]"
            >
              <span>Explore Knowledge Hub</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
