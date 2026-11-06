'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Edit2,
  Trash2,
} from 'lucide-react';
import { BrandGuideline } from '@/types';
import { formatDate } from '@/lib/utils';

export default function GuidelineDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [guideline, setGuideline] = useState<BrandGuideline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGuideline() {
      try {
        const res = await fetch(`/api/guidelines/${params.id}`);
        const json = await res.json();
        if (json.success) {
          setGuideline(json.data);
        }
      } catch (e) {
        console.error('Failed to load guideline', e);
      } finally {
        setLoading(false);
      }
    }
    loadGuideline();
  }, [params.id]);

  const handleDelete = async () => {
    if (!guideline) return;
    if (confirm(`Delete "${guideline.title}"?`)) {
      try {
        const res = await fetch(`/api/guidelines/${guideline.id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          router.push('/guidelines');
        }
      } catch (err) {
        console.error('Failed to delete', err);
      }
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading guideline details...</div>;
  }

  if (!guideline) {
    return (
      <div className="space-y-4">
        <Link href="/guidelines" className="text-xs text-blue-600 flex items-center gap-1 font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Brand Guidelines
        </Link>
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <h2 className="text-sm font-bold text-slate-800">Guideline Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">This guideline may have been removed or does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link
        href="/guidelines"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Brand Guidelines</span>
      </Link>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {guideline.category}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                guideline.isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {guideline.isActive ? 'Active Standard' : 'Inactive'}
            </span>
          </div>

          <button
            onClick={handleDelete}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 p-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Guideline</span>
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{guideline.title}</h1>

        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Created {formatDate(guideline.createdAt)}
          </span>
          <span>•</span>
          <span>Last updated {formatDate(guideline.updatedAt)}</span>
        </div>
      </div>

      {/* The Rule Statement */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Compliance Rule</h3>
        <p className="text-sm font-semibold text-slate-900 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
          {guideline.rule}
        </p>

        {guideline.description && (
          <div className="pt-2 text-xs text-slate-600 leading-relaxed">
            <h4 className="font-semibold text-slate-700 mb-1">Context & Rationale:</h4>
            <p>{guideline.description}</p>
          </div>
        )}
      </div>

      {/* Source Document Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-blue-600" />
          Source Document & Verifiable Excerpt
        </h3>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="font-semibold text-slate-800">
            Document: <span className="font-mono text-blue-700">{guideline.sourceDocument || 'Direct Policy Entry'}</span>
          </div>
          {guideline.sourceExcerpt ? (
            <div className="border-l-2 border-blue-500 pl-3 py-1 italic font-serif text-slate-700">
              &ldquo;{guideline.sourceExcerpt}&rdquo;
            </div>
          ) : (
            <div className="text-slate-500 italic">No direct excerpt recorded.</div>
          )}
        </div>
      </div>

      {/* Approved vs Prohibited Examples */}
      {guideline.examples && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              Approved Examples
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
              {guideline.examples.approved.length > 0 ? (
                guideline.examples.approved.map((ex, i) => <li key={i}>{ex}</li>)
              ) : (
                <li className="italic text-slate-400">No examples added</li>
              )}
            </ul>
          </div>

          <div className="bg-red-50/40 border border-red-200 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-600" />
              Prohibited Examples
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
              {guideline.examples.prohibited.length > 0 ? (
                guideline.examples.prohibited.map((ex, i) => <li key={i}>{ex}</li>)
              ) : (
                <li className="italic text-slate-400">No examples added</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
