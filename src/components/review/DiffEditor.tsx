'use client';

import React, { useState } from 'react';
import {
  Columns,
  Eye,
  Edit2,
  CheckCheck,
  RotateCcw,
  Sparkles,
  FileText,
} from 'lucide-react';
import { ReviewIssue } from '@/types';

interface DiffEditorProps {
  originalText: string;
  currentText: string;
  issues: ReviewIssue[];
  onChange: (newText: string) => void;
  onApplyAll: () => void;
  onResetAll: () => void;
}

export function DiffEditor({
  originalText,
  currentText,
  issues,
  onChange,
  onApplyAll,
  onResetAll,
}: DiffEditorProps) {
  const [viewMode, setViewMode] = useState<'interactive' | 'side-by-side' | 'raw'>('interactive');

  const pendingIssues = issues.filter((i) => i.status !== 'accepted' && i.status !== 'rejected');
  const acceptedIssues = issues.filter((i) => i.status === 'accepted');

  // Compute highlighted HTML safely
  const renderHighlightedText = () => {
    let result = originalText;

    // Apply pending and accepted highlights
    issues.forEach((issue) => {
      const escaped = issue.original_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

      if (issue.status === 'accepted') {
        const replacement = issue.edited_text || issue.suggestion;
        result = result.replace(
          regex,
          `<mark class="highlight-corrected" title="Corrected: '${issue.original_text}' -> '${replacement}'">${replacement}</mark>`
        );
      } else if (issue.status !== 'rejected') {
        result = result.replace(
          regex,
          `<mark class="highlight-violation" title="${issue.category}: ${issue.title}">$&</mark>`
        );
      }
    });

    return result;
  };

  const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = currentText.length;

  return (
    <div className="glass-card rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Editor Controls Bar */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('interactive')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'interactive'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Interactive Highlights</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'raw'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Manual Editor</span>
          </button>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2.5">
          {pendingIssues.length > 0 && (
            <button
              onClick={onApplyAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Apply All Corrections ({pendingIssues.length})</span>
            </button>
          )}

          {acceptedIssues.length > 0 && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs"
              title="Revert all applied corrections"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>Revert</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Display */}
      <div className="p-6 flex-1 min-h-[280px]">
        {viewMode === 'interactive' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2.5 border-b border-slate-100 font-medium">
              <span className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-200" />
                  <span className="text-red-700 font-semibold">Flagged Violation</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  <span className="text-emerald-700 font-semibold">Corrected Replacement</span>
                </span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {wordCount} words • {charCount} chars
              </span>
            </div>

            <div
              className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-text p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80"
              dangerouslySetInnerHTML={{ __html: renderHighlightedText() }}
            />
          </div>
        )}

        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-red-200/80 bg-red-50/30 rounded-2xl p-5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-red-900 mb-2.5 flex items-center justify-between">
                <span>Original Copy</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-bold">
                  Pre-Review Draft
                </span>
              </div>
              <p className="text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                {originalText}
              </p>
            </div>

            <div className="border border-emerald-200/80 bg-emerald-50/30 rounded-2xl p-5 shadow-2xs">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2.5 flex items-center justify-between">
                <span>Corrected Copy</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                  {acceptedIssues.length} Corrections Active
                </span>
              </div>
              <p className="text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-wrap font-medium">
                {currentText}
              </p>
            </div>
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Modify content directly. You can re-run compliance review anytime.</span>
              <span className="font-mono text-[11px] text-slate-400">{wordCount} words</span>
            </div>
            <textarea
              rows={9}
              value={currentText}
              onChange={(e) => onChange(e.target.value)}
              className="w-full text-xs font-sans p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white leading-relaxed resize-y placeholder:text-slate-400"
              placeholder="Enter or modify content..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
