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
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isAccepted
          ? 'bg-emerald-50/50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
          : isRejected
          ? 'bg-slate-50/70 border-slate-300 opacity-60'
          : 'glass-card border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300'
      }`}
    >
      {/* Top Card Header */}
      <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full border ${getSeverityBadgeClass(
              issue.severity
            )}`}
          >
            {issue.severity} Severity
          </span>
          <span className="text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
            {issue.category}
          </span>
          {issue.requires_human_review && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-amber-600" />
              Human Review Gated
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-semibold">
          AI Confidence: {Math.round(issue.confidence * 100)}%
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Issue Title & Description */}
        <div>
          <h4 className="text-sm font-black text-slate-900 tracking-tight">{issue.title}</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">{issue.explanation}</p>
        </div>

        {/* Explainable Evidence Box */}
        <div className="bg-gradient-to-r from-blue-50/60 to-slate-50 rounded-2xl p-4 border border-blue-100 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span className="flex items-center gap-2 text-blue-900">
              <ShieldAlert className="h-4 w-4 text-blue-600" />
              Guideline Reference: {issue.guideline_reference}
            </span>
            <Link
              href={`/guidelines?q=${encodeURIComponent(issue.guideline_reference)}`}
              target="_blank"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px] font-bold"
            >
              <span>View Rule</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-slate-700 italic border-l-2 border-blue-500 pl-3 py-0.5 font-serif text-[12px] bg-white/60 rounded-r-lg p-2">
            &ldquo;{issue.evidence}&rdquo;
          </div>
        </div>

        {/* Original vs Proposed Correction Diff */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-red-50/50 border border-red-200 rounded-2xl p-4">
            <div className="font-extrabold text-red-900 mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
              <XCircle className="h-3.5 w-3.5 text-red-600" />
              Original Flagged Wording
            </div>
            <div className="font-mono text-red-950 bg-white/80 p-2.5 rounded-xl border border-red-100 text-xs font-semibold">
              {issue.original_text}
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4">
            <div className="font-extrabold text-emerald-900 mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wide justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                Approved Brand Correction
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-emerald-700 hover:text-emerald-900 text-[10px] underline font-bold flex items-center gap-0.5"
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
                  className="w-full text-xs font-mono p-2 border border-emerald-400 rounded-xl focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedText(issue.suggestion);
                    }}
                    className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      onEdit(issue.id, editedText);
                    }}
                    className="px-3 py-1 text-[11px] bg-emerald-600 text-white rounded-lg font-bold shadow-xs"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="font-mono text-emerald-950 bg-white/80 p-2.5 rounded-xl border border-emerald-100 text-xs font-semibold">
                {issue.edited_text || issue.suggestion}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-semibold">
            {isAccepted && (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="h-4 w-4" /> Correction Applied to Draft
              </span>
            )}
            {isRejected && (
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Correction Dismissed
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAccepted || isRejected ? (
              <button
                onClick={() => onReject(issue.id)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-white rounded-xl flex items-center gap-1.5 font-bold transition-all shadow-2xs"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            ) : (
              <>
                <button
                  onClick={() => onReject(issue.id)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => onAccept(issue.id)}
                  className="px-4 py-1.5 text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
