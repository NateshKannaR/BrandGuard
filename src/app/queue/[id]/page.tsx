'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  History,
  FileText,
  UserCheck,
  Check,
  RotateCcw,
  ShieldCheck,
  Award,
  Copy,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ContentSubmission, SubmissionStatus } from '@/types';
import { getStatusBadgeClass, formatDate, formatDateTime, getSeverityBadgeClass } from '@/lib/utils';
import { useRole } from '@/components/layout/RoleContext';
import { useToast } from '@/components/ui/Toast';
import { ComplianceCertificate } from '@/components/queue/ComplianceCertificate';

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { currentUser } = useRole();
  const { showToast } = useToast();

  const [submission, setSubmission] = useState<ContentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'revisions' | 'comments'>('content');
  const [isCertOpen, setIsCertOpen] = useState(false);

  // Reviewer actions modal state
  const [actionType, setActionType] = useState<'approve' | 'request_changes' | 'reject' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Edit copy state (for creators)
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const fetchSubmission = async () => {
    try {
      const res = await fetch(`/api/submissions/${params.id}`);
      const json = await res.json();
      if (json.success) {
        setSubmission(json.data);
        setEditedContent(json.data.currentText);
      }
    } catch (e) {
      console.error('Failed to load submission', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [params.id]);

  const handleStatusTransition = async (status: SubmissionStatus) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reason: actionNote,
          reviewerId: currentUser.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionType(null);
        setActionNote('');
        showToast(
          status === 'approved' ? 'Content Approved for Publication' : `Status changed to ${status}`,
          `By ${currentUser.name}`,
          status === 'approved' ? 'success' : 'info'
        );
        fetchSubmission();
        if (status === 'approved') {
          setIsCertOpen(true);
        }
      }
    } catch (e) {
      console.error('Status change failed', e);
      showToast('Action Failed', 'Could not transition status', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/submissions/${params.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newComment,
          userId: currentUser.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewComment('');
        showToast('Comment Added', 'Appended to audit trail', 'success');
        fetchSubmission();
      }
    } catch (e) {
      console.error('Failed to post comment', e);
      showToast('Comment Error', 'Failed to save comment', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveRevision = async () => {
    if (!editedContent.trim()) return;
    try {
      const res = await fetch(`/api/submissions/${params.id}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editedContent,
          changeSummary: 'Creator updated draft text',
          authorName: currentUser.name,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsEditingContent(false);
        showToast('Revision Recorded', 'Saved new content draft', 'success');
        fetchSubmission();
      }
    } catch (e) {
      console.error('Failed to save revision', e);
      showToast('Revision Error', 'Failed to update content', 'error');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading submission details...</div>;
  }

  if (!submission) {
    return (
      <div className="space-y-4">
        <Link href="/queue" className="text-xs text-blue-600 flex items-center gap-1 font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review Queue
        </Link>
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <h2 className="text-sm font-bold text-slate-800">Submission Not Found</h2>
        </div>
      </div>
    );
  }

  const isReviewerOrAdmin = currentUser.role === 'reviewer' || currentUser.role === 'admin';
  const isApproved = submission.status === 'approved';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back button */}
      <Link
        href="/queue"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Review Queue</span>
      </Link>

      {/* Main Submission Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                  submission.status
                )}`}
              >
                {submission.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-500">• {submission.contentType}</span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {submission.title}
            </h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {isApproved && (
              <button
                onClick={() => setIsCertOpen(true)}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Award className="h-4 w-4 text-indigo-600" />
                <span>View Compliance Certificate</span>
              </button>
            )}

            {isReviewerOrAdmin ? (
              <>
                <button
                  onClick={() => setActionType('reject')}
                  className="px-3.5 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => setActionType('request_changes')}
                  className="px-3.5 py-2 border border-amber-200 hover:bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Request Changes</span>
                </button>

                <button
                  onClick={() => setActionType('approve')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 hover:scale-[1.01]"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Approve for Publication</span>
                </button>
              </>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Switch to <strong>Elena (Reviewer)</strong> in top header to approve</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>Creator: <strong>{submission.creatorName}</strong></span>
          <span>•</span>
          <span>Submitted {formatDateTime(submission.createdAt)}</span>
          {submission.reviewerName && (
            <>
              <span>•</span>
              <span>Reviewer: <strong>{submission.reviewerName}</strong></span>
            </>
          )}
          {submission.approvedAt && (
            <>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Approved {formatDateTime(submission.approvedAt)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabs: Content Review, Revision History, Review Comments */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'content'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Content & AI Review</span>
        </button>

        <button
          onClick={() => setActiveTab('revisions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'revisions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="h-3.5 w-3.5" />
          <span>Revision History ({submission.revisions?.length || 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'comments'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Reviewer Comments ({submission.comments?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Content & AI Findings */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Comparison View */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Current Submission Copy</h3>
              {!isEditingContent ? (
                <button
                  onClick={() => setIsEditingContent(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Edit Copy
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingContent(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRevision}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-semibold"
                  >
                    Save Revision
                  </button>
                </div>
              )}
            </div>

            {isEditingContent ? (
              <textarea
                rows={6}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg text-xs font-sans focus:ring-2 focus:ring-blue-500 bg-white"
              />
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-900 leading-relaxed whitespace-pre-wrap">
                {submission.currentText}
              </div>
            )}
          </div>

          {/* AI Compliance Findings */}
          {submission.latestReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Compliance Review Findings ({submission.latestReview.issues.length})
                </h3>
                <span className="text-xs font-extrabold text-blue-700">
                  Compliance Score: {submission.latestReview.compliance_score}/100
                </span>
              </div>

              {submission.latestReview.issues.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center text-xs text-emerald-800">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-1.5" />
                  All brand compliance checks passed with zero flagged issues.
                </div>
              ) : (
                <div className="space-y-3">
                  {submission.latestReview.issues.map((iss) => (
                    <div
                      key={iss.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${getSeverityBadgeClass(iss.severity)}`}>
                          {iss.severity}
                        </span>
                        <span className="text-slate-500">{iss.category}</span>
                      </div>
                      <h4 className="font-bold text-slate-900">{iss.title}</h4>
                      <p className="text-slate-600">{iss.explanation}</p>
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 italic text-slate-600 font-serif">
                        &ldquo;{iss.evidence}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Revision History */}
      {activeTab === 'revisions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Audit Trail & Revision History</h3>
          <div className="space-y-4 divide-y divide-slate-100">
            {submission.revisions?.map((rev) => (
              <div key={rev.revisionNumber} className="pt-4 first:pt-0 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Revision {rev.revisionNumber}
                  </span>
                  <span className="text-slate-400">{formatDateTime(rev.createdAt)}</span>
                </div>
                <div className="text-slate-500">
                  Created by <strong>{rev.createdBy}</strong>
                  {rev.changeSummary && <span> — {rev.changeSummary}</span>}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-slate-800 text-[11px] whitespace-pre-wrap">
                  {rev.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Comments & Discussion */}
      {activeTab === 'comments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900">Review Comments & Clarifications</h3>

          <div className="space-y-3">
            {submission.comments?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No comments yet.</p>
            ) : (
              submission.comments?.map((c) => (
                <div key={c.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      {c.authorName}
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                        {c.authorRole}
                      </span>
                    </span>
                    <span className="text-slate-400 text-[11px]">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pt-1">{c.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="space-y-3 pt-3 border-t border-slate-100">
            <textarea
              rows={3}
              placeholder="Add your reviewer notes, compliance remarks, or reply to creator..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviewer Action Modal */}
      {actionType && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {actionType === 'approve'
                  ? 'Confirm Pre-Publication Approval'
                  : actionType === 'request_changes'
                  ? 'Request Content Modifications'
                  : 'Reject Content Submission'}
              </h3>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p>
                {actionType === 'approve'
                  ? 'As brand compliance officer, confirm that this marketing copy aligns with official guidelines and approved facts. This will issue an official Brand Compliance Certificate.'
                  : actionType === 'request_changes'
                  ? 'Specify what modifications the creator must make prior to receiving publication approval.'
                  : 'State the formal justification for rejecting this submission.'}
              </p>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  {actionType === 'approve' ? 'Approval Note (optional)' : 'Reason / Instructions *'}
                </label>
                <textarea
                  rows={3}
                  required={actionType !== 'approve'}
                  placeholder={
                    actionType === 'approve'
                      ? 'e.g. Verified 99.95% SLA and customer-first nomenclature. Approved.'
                      : 'Provide actionable feedback for the creator...'
                  }
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActionType(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction || (actionType !== 'approve' && !actionNote.trim())}
                onClick={() => {
                  if (actionType === 'approve') handleStatusTransition('approved');
                  else if (actionType === 'request_changes') handleStatusTransition('changes_requested');
                  else if (actionType === 'reject') handleStatusTransition('rejected');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold text-white shadow-xs ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'request_changes'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessingAction ? 'Processing...' : 'Confirm Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Certificate Modal */}
      <ComplianceCertificate
        submission={submission}
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />
    </div>
  );
}
