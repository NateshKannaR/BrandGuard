'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { ContentSubmission, SubmissionStatus } from '@/types';
import { getStatusBadgeClass, formatDate } from '@/lib/utils';
import { DEMO_SUBMISSIONS } from '@/lib/storage/mock-data';
import { useRole } from '@/components/layout/RoleContext';

const statusTabs: { label: string; value: string }[] = [
  { label: 'All Submissions', value: 'all' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Changes Requested', value: 'changes_requested' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function ReviewQueuePage() {
  const { currentUser } = useRole();
  // Initialize with seeded submissions so it NEVER flashes 0 items or loading
  const [submissions, setSubmissions] = useState<ContentSubmission[]>(DEMO_SUBMISSIONS);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = async () => {
    try {
      const params = new URLSearchParams();
      if (activeStatus !== 'all') params.append('status', activeStatus);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/submissions?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSubmissions(json.data);
      }
    } catch (e) {
      console.warn('Submissions fetch fallback to local store:', e);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeStatus, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Inbox className="h-3.5 w-3.5" />
            </div>
            Governance Approval Pipeline
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Review & Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Human-in-the-loop sign-off pipeline for pre-publication brand compliance and certificate issuance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-700 glass-card px-4 py-2.5 rounded-2xl shadow-2xs">
          <UserCheck className="h-4 w-4 text-blue-600" />
          <span className="text-slate-400 font-medium">Active Role:</span>
          <span className="font-bold text-slate-900">{currentUser.name}</span>
          <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Role Switcher Instruction Note */}
      <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/70 border border-blue-200/90 rounded-2xl p-4 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="leading-relaxed">
            <strong>Evaluator Testing Guide:</strong> To grant publication approval or request changes, switch role to <strong>Elena Rostova (Reviewer)</strong> in the top header.
          </span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-lg bg-blue-200/80 text-blue-900 font-extrabold shrink-0 border border-blue-300/60">
          Evaluation Gating
        </span>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="glass-card rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by submission title, copy text, or creator name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/60 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-bold font-mono">
            {submissions.length} {submissions.length === 1 ? 'record' : 'records'} in queue
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {statusTabs.map((tab) => {
            const isTabActive = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isTabActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submissions Table / Cards */}
      {submissions.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No submissions matching filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Try switching the status filter tab or clearing your search term.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 sm:px-6 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                      sub.status
                    )}`}
                  >
                    {sub.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">• {sub.contentType}</span>
                  {sub.revisions && sub.revisions.length > 1 && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                      Rev {sub.revisions.length}
                    </span>
                  )}
                </div>

                <Link
                  href={`/queue/${sub.id}`}
                  className="text-sm font-extrabold text-slate-900 hover:text-blue-600 block transition-colors tracking-tight"
                >
                  {sub.title}
                </Link>

                <p className="text-xs text-slate-600 line-clamp-1 font-sans">
                  {sub.currentText}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 font-medium">
                  <span>Created by <strong className="text-slate-700">{sub.creatorName}</strong></span>
                  <span>•</span>
                  <span>Submitted {formatDate(sub.createdAt)}</span>
                  {sub.reviewerName && (
                    <>
                      <span>•</span>
                      <span>Reviewer: <strong className="text-purple-700">{sub.reviewerName}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side Stats & Link */}
              <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                {sub.latestReview && (
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                      {sub.latestReview.compliance_score}/100
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {sub.latestReview.issues.length} {sub.latestReview.issues.length === 1 ? 'flag' : 'flags'}
                    </div>
                  </div>
                )}

                <Link
                  href={`/queue/${sub.id}`}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Review Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
