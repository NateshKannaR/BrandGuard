'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, BookOpen, CheckCircle2,
  ClipboardList, FileSearch, Image, Inbox, RefreshCw, ShieldCheck,
} from 'lucide-react';
import type { ContentSubmission, GovernanceMetrics } from '@/types';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';

const statusFilters = [
  { label: 'All submissions', value: 'all' },
  { label: 'Needs review', value: 'pending' },
  { label: 'Approved', value: 'approved' },
];

const workspaceLinks = [
  { title: 'Visual review', detail: 'Check creative assets against brand guidelines.', href: '/visual-review', icon: Image },
  { title: 'Guidelines', detail: 'Browse the rules and evidence behind reviews.', href: '/guidelines', icon: BookOpen },
  { title: 'Analytics', detail: 'See recurring issues and review trends.', href: '/analytics', icon: BarChart3 },
];

async function getData<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('Request failed');
  const result = await response.json();
  if (!result.success || result.data == null) throw new Error('Data unavailable');
  return result.data;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [submissions, setSubmissions] = useState<ContentSubmission[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([
      getData<GovernanceMetrics>('/api/analytics', controller.signal),
      getData<ContentSubmission[]>('/api/submissions', controller.signal),
    ]).then(([analytics, queue]) => {
      if (controller.signal.aborted) return;
      setMetrics(analytics.status === 'fulfilled' ? analytics.value : null);
      setSubmissions(queue.status === 'fulfilled' ? queue.value : null);
      setLoading(false);
    });
    return () => controller.abort();
  }, [reload]);

  const stats = [
    { label: 'Total reviews', value: metrics?.totalReviews, icon: ClipboardList, tone: 'bg-violet-100 text-violet-700' },
    { label: 'Pending review', value: metrics?.pendingCount, icon: Inbox, tone: 'bg-amber-100 text-amber-800' },
    { label: 'Average compliance', value: metrics ? `${metrics.avgComplianceScore}%` : undefined, icon: ShieldCheck, tone: 'bg-teal-100 text-teal-700' },
    { label: 'Corrections accepted', value: metrics ? `${metrics.correctionAcceptanceRate}%` : undefined, icon: CheckCircle2, tone: 'bg-sky-100 text-sky-700' },
  ];
  const recent = submissions?.filter(({ status }) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return status === 'submitted' || status === 'in_review';
    return status === filter;
  }).slice(0, 5);

  return (
    <div className="space-y-7 pb-6 lg:space-y-8">
      <section className="brand-hero relative isolate overflow-hidden rounded-[28px] px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="relative z-10 max-w-xl">
          <h1 className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
            Keep every release on brand.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-violet-100 sm:text-base">
            Check copy against approved guidelines, trace findings to their source, and route submissions for approval.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/review" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e7faf0] px-4 text-sm font-semibold text-[#143f35] hover:bg-white">
              <FileSearch className="size-4" /> Review content <ArrowRight className="size-4" />
            </Link>
            <Link href="/queue" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 text-sm font-semibold hover:bg-white/20">
              Open review queue
            </Link>
          </div>
        </div>
        <div className="brand-hero-art hidden sm:grid sm:opacity-30 xl:opacity-100" aria-hidden="true"><ShieldCheck className="size-24 lg:size-32" strokeWidth={1} /></div>
      </section>

      <section aria-label="Workspace metrics" aria-busy={loading} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <span className={`inline-flex size-9 items-center justify-center rounded-lg ${tone}`}><Icon className="size-4" /></span>
            <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-950 sm:text-3xl">
              {value ?? (loading ? '…' : '—')}
            </div>
            <div className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">{label}</div>
          </div>
        ))}
      </section>

      {!loading && (!metrics || !submissions) && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {metrics ? 'Recent submissions could not be loaded.' : submissions ? 'Workspace metrics could not be loaded.' : 'Workspace data could not be loaded.'}
          <button className="inline-flex items-center gap-2 font-semibold underline underline-offset-4" onClick={() => { setLoading(true); setReload((value) => value + 1); }}>
            <RefreshCw className="size-4" /> Retry
          </button>
        </div>
      )}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <section aria-labelledby="recent-heading" aria-busy={loading} className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
            <h2 id="recent-heading" className="text-lg font-semibold tracking-tight">Recent submissions</h2>
            <Link href="/queue" className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline">View queue <ArrowUpRight className="size-4" /></Link>
          </div>
          <div className="flex flex-wrap gap-2 px-5 py-4" aria-label="Filter submissions" role="group">
            {statusFilters.map(({ label, value }) => (
              <button key={value} aria-pressed={value === filter} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${value === filter ? 'bg-violet-100 text-violet-900' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {label}
              </button>
            ))}
          </div>
          <div aria-live="polite">
            {recent && recent.length > 0 ? (
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {recent.map((submission) => (
                  <li key={submission.id}>
                    <Link href={`/queue/${submission.id}`} className="flex items-center gap-3 px-5 py-4 hover:bg-violet-50/60">
                      <FileSearch className="hidden size-4 shrink-0 text-violet-600 sm:block" />
                      <div className="min-w-0 flex-1">
                        <div className="break-words text-sm font-semibold text-slate-950">{submission.title}</div>
                        <div className="mt-1 text-xs text-slate-600">{submission.contentType} · {formatDate(submission.createdAt)}</div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold capitalize ${getStatusBadgeClass(submission.status)}`}>
                        {submission.status.replace(/_/g, ' ')}
                      </span>
                      <ArrowRight className="hidden size-4 shrink-0 text-violet-700 sm:block" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-slate-100 px-5 py-8 text-sm text-slate-600">
                {loading ? 'Loading submissions…' : recent ? 'No submissions match this filter.' : 'Submissions are unavailable.'}
              </p>
            )}
          </div>
        </section>

        <section aria-labelledby="tools-heading" className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 id="tools-heading" className="text-lg font-semibold tracking-tight">Workspace tools</h2>
          <div className="mt-3 divide-y divide-slate-100">
            {workspaceLinks.map(({ title, detail, href, icon: Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-3 rounded-lg py-4 hover:bg-violet-50/60">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><Icon className="size-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-950">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{detail}</span>
                </span>
                <ArrowDownRight className="size-4 shrink-0 -rotate-90 text-violet-600" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
