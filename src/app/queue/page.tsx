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
} from 'lucide-react';
import { ContentSubmission, SubmissionStatus } from '@/types';
import { getStatusBadgeClass, formatDate } from '@/lib/utils';
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
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeStatus !== 'all') params.append('status', activeStatus);
      if (searchQuery.trim()) params.append('q', searchQuery.trim());

      const res = await fetch(`/api/submissions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSubmissions(json.data);
      }
    } catch (e) {
      console.error('Failed to load queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeStatus, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Inbox className="h-4 w-4" />
            Governance Queue
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review & Approval Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official human sign-off pipeline for pre-publication brand compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-xs">
          <span>Active Role:</span>
          <span className="font-semibold text-slate-900">{currentUser.name}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by submission title, copy, or creator name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {submissions.length} {submissions.length === 1 ? 'item' : 'items'} in queue
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeStatus === tab.value
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading review queue...</div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Inbox className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900">No submissions in this queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All content has been processed or no matching submissions were found.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                      sub.status
                    )}`}
                  >
                    {sub.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs font-medium text-slate-500">• {sub.contentType}</span>
                  {sub.revisions && sub.revisions.length > 1 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      Rev {sub.revisions.length}
                    </span>
                  )}
                </div>

                <Link
                  href={`/queue/${sub.id}`}
                  className="text-sm font-bold text-slate-900 hover:text-blue-600 block transition-colors"
                >
                  {sub.title}
                </Link>

                <p className="text-xs text-slate-500 line-clamp-1 font-sans">
                  {sub.currentText}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span>Created by <strong>{sub.creatorName}</strong></span>
                  <span>•</span>
                  <span>Submitted {formatDate(sub.createdAt)}</span>
                  {sub.reviewerName && (
                    <>
                      <span>•</span>
                      <span>Reviewer: <strong>{sub.reviewerName}</strong></span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side Stats & Link */}
              <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                {sub.latestReview && (
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-slate-900">
                      {sub.latestReview.compliance_score}/100
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {sub.latestReview.issues.length} {sub.latestReview.issues.length === 1 ? 'flag' : 'flags'}
                    </div>
                  </div>
                )}

                <Link
                  href={`/queue/${sub.id}`}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>Review</span>
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
