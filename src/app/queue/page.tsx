'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Inbox, Search, UserCheck } from 'lucide-react';
import type { ContentSubmission, SubmissionStatus } from '@/types';
import { getStatusBadgeClass, formatDate } from '@/lib/utils';
import { getQueueResults, queueToCsv, type QueueSort, type QueueView } from '@/lib/queue';
import { downloadText } from '@/lib/download';
import { useRole } from '@/components/layout/RoleContext';

const statusTabs: { label: string; value: SubmissionStatus | 'all' }[] = [
  { label: 'All Submissions', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Changes Requested', value: 'changes_requested' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

export default function ReviewQueuePage() {
  const { currentUser } = useRole();
  const [records, setRecords] = useState<ContentSubmission[] | null>(null);
  const [activeStatus, setActiveStatus] = useState<SubmissionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<QueueView>('all');
  const [sort, setSort] = useState<QueueSort>('updated');
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadQueue() {
      try {
        const response = await fetch('/api/submissions', { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Queue request failed');
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) throw new Error('Queue data unavailable');
        if (!controller.signal.aborted) setRecords(result.data);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void loadQueue();
    return () => controller.abort();
  }, [attempt]);

  const submissions = getQueueResults(records ?? [], {
    status: activeStatus,
    query: searchQuery,
    view,
    sort,
    userId: currentUser.id,
  });

  function exportQueue() {
    downloadText('brandguard-review-queue.csv', '\ufeff' + queueToCsv(submissions), 'text/csv;charset=utf-8');
  }

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

      {/* Filter Tabs and Search Bar */}
      <div className="glass-card rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              aria-label="Search review queue"
              placeholder="Search title, content, or creator"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/60 transition-all placeholder:text-slate-400"
            />
          </div>

          <button type="button" onClick={exportQueue} disabled={submissions.length === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            View
            <select value={view} onChange={(event) => setView(event.target.value as QueueView)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3">
              <option value="all">Everyone</option>
              <option value="created">Created by me</option>
              <option value="assigned">Assigned to me</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value as QueueSort)} className="min-h-10 rounded-xl border border-slate-200 bg-white px-3">
              <option value="updated">Recently updated</option>
              <option value="oldest">Oldest submitted</option>
              <option value="lowest-score">Lowest compliance first</option>
            </select>
          </label>
          {records && <p aria-live="polite" className="ml-auto py-2 text-sm text-slate-600">{submissions.length} of {records.length} submissions</p>}
        </div>

        {/* Status Filters */}
        <div role="group" aria-label="Submission status" className="flex flex-wrap items-center gap-1.5">
          {statusTabs.map((tab) => {
            const isTabActive = activeStatus === tab.value;
            return (
              <button
                key={tab.value}
                aria-pressed={isTabActive}
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
      {failed ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          The review queue could not be loaded.
          <button type="button" onClick={() => { setFailed(false); setAttempt((value) => value + 1); }} className="font-semibold underline">Retry</button>
        </div>
      ) : !records ? (
        <p role="status" className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">Loading review queue…</p>
      ) : submissions.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No submissions matching filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Change the view or status, or clear your search.
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
                    {sub.status.replace(/_/g, ' ').toUpperCase()}
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
              <div className="flex items-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
                {sub.latestReview && (
                  <div className="text-left md:text-right">
                    <div className="text-xs font-black text-slate-900 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 inline-block">
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
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
