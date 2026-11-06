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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Editor Controls Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('interactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'interactive'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Interactive Highlights</span>
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'raw'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Manual Editor</span>
          </button>
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2">
          {pendingIssues.length > 0 && (
            <button
              onClick={onApplyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Apply All Corrections ({pendingIssues.length})</span>
            </button>
          )}

          {acceptedIssues.length > 0 && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs rounded-lg transition-colors"
              title="Revert all applied corrections"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Revert</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor Content Display */}
      <div className="p-5 flex-1 min-h-[280px]">
        {viewMode === 'interactive' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Pending Flag
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Corrected Text
                </span>
              </span>
              <span>{wordCount} words • {charCount} chars</span>
            </div>

            <div
              className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-text p-3 bg-slate-50/50 rounded-lg border border-slate-100"
              dangerouslySetInnerHTML={{ __html: renderHighlightedText() }}
            />
          </div>
        )}

        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-red-200/80 bg-red-50/20 rounded-lg p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-red-900 mb-2 flex items-center justify-between">
                <span>Original Copy</span>
                <span className="text-[11px] font-normal text-red-700">Pre-review</span>
              </div>
              <p className="text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                {originalText}
              </p>
            </div>

            <div className="border border-emerald-200/80 bg-emerald-50/20 rounded-lg p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center justify-between">
                <span>Corrected Draft</span>
                <span className="text-[11px] font-normal text-emerald-700">
                  {acceptedIssues.length} corrections applied
                </span>
              </div>
              <p className="text-xs text-slate-900 font-sans leading-relaxed whitespace-pre-wrap font-medium">
                {currentText}
              </p>
            </div>
          </div>
        )}

        {viewMode === 'raw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Edit content directly. You can re-run compliance review anytime.</span>
              <span>{wordCount} words</span>
            </div>
            <textarea
              rows={9}
              value={currentText}
              onChange={(e) => onChange(e.target.value)}
              className="w-full text-sm font-sans p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white leading-relaxed resize-y"
              placeholder="Enter or modify content..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
