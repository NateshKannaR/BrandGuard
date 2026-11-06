'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit3,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ReviewIssue } from '@/types';
import { getSeverityBadgeClass } from '@/lib/utils';

interface EvidenceCardProps {
  issue: ReviewIssue;
  onAccept: (issueId: string) => void;
  onReject: (issueId: string) => void;
  onEdit: (issueId: string, newText: string) => void;
}

export function EvidenceCard({ issue, onAccept, onReject, onEdit }: EvidenceCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(issue.edited_text || issue.suggestion);

  const isAccepted = issue.status === 'accepted';
  const isRejected = issue.status === 'rejected';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isAccepted
          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20'
          : isRejected
          ? 'bg-slate-50/60 border-slate-300 opacity-60'
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Top Card Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getSeverityBadgeClass(
              issue.severity
            )}`}
          >
            {issue.severity} Severity
          </span>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {issue.category}
          </span>
          {issue.requires_human_review && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              Human Review Needed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          Confidence: {Math.round(issue.confidence * 100)}%
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Issue Title & Description */}
        <div>
          <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{issue.explanation}</p>
        </div>

        {/* Explainable Evidence Box */}
        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 text-blue-900">
              <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
              Guideline: {issue.guideline_reference}
            </span>
            <Link
              href={`/guidelines?q=${encodeURIComponent(issue.guideline_reference)}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-[11px] font-normal"
            >
              <span>View Rule</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-slate-600 italic border-l-2 border-blue-400 pl-2.5 py-0.5 font-serif text-[12px]">
            &ldquo;{issue.evidence}&rdquo;
          </div>
        </div>

        {/* Original vs Proposed Correction Diff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-red-50/70 border border-red-200 rounded-lg p-3">
            <div className="font-semibold text-red-900 mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide">
              <XCircle className="h-3.5 w-3.5 text-red-600" />
              Original Wording
            </div>
            <div className="font-mono text-red-900 bg-white/70 p-2 rounded border border-red-100 text-xs">
              {issue.original_text}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <div className="font-semibold text-emerald-900 mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide justify-between">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Proposed Correction
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-emerald-700 hover:text-emerald-800 text-[10px] underline flex items-center gap-0.5"
                >
                  <Edit3 className="h-2.5 w-2.5" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full text-xs font-mono p-1.5 border border-emerald-400 rounded focus:ring-1 focus:ring-emerald-500 bg-white"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedText(issue.suggestion);
                    }}
                    className="px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      onEdit(issue.id, editedText);
                    }}
                    className="px-2 py-0.5 text-[11px] bg-emerald-600 text-white rounded font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-emerald-900 bg-white/70 p-2 rounded border border-emerald-100 text-xs">
                {issue.edited_text || issue.suggestion}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {isAccepted && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Correction Accepted
              </span>
            )}
            {isRejected && (
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Correction Dismissed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAccepted || isRejected ? (
              <button
                onClick={() => onReject(issue.id)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            ) : (
              <>
                <button
                  onClick={() => onReject(issue.id)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg font-medium transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onAccept(issue.id)}
                  className="px-3.5 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept Correction
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
