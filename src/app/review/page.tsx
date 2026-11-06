'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSearch,
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ContentType, GuidelineCategory, ReviewResult, ReviewIssue } from '@/types';
import { DiffEditor } from '@/components/review/DiffEditor';
import { EvidenceCard } from '@/components/review/EvidenceCard';
import { useRole } from '@/components/layout/RoleContext';

const contentTypes: ContentType[] = [
  'Social media post',
  'Advertisement',
  'Website copy',
  'Email campaign',
  'Marketing document',
  'General promotional content',
];

const availableCategories: GuidelineCategory[] = [
  'Tone of Voice',
  'Terminology',
  'Approved Facts',
  'Promotional Claims',
  'Messaging',
  'Accessibility',
];

const SAMPLE_VIOLATION_COPY =
  "NovaTech is the undisputed #1 cloud platform in the world! Over 10,000 users agree our cheap pricing delivers 100% uptime with zero crashes ever. Check out our crazy fast tool now and join thousands of users making the switch today!!!";

export default function ContentReviewPage() {
  const router = useRouter();
  const { currentUser } = useRole();

  // Submission Form State
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('Social media post');
  const [rawText, setRawText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<GuidelineCategory[]>([
    'Tone of Voice',
    'Terminology',
    'Approved Facts',
    'Promotional Claims',
  ]);

  // Review & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string>('');

  // Queue submission modal
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [submitNotes, setSubmitNotes] = useState('');
  const [isSubmittingToQueue, setIsSubmittingToQueue] = useState(false);

  const toggleCategory = (cat: GuidelineCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleLoadSample = () => {
    setTitle('Q1 Enterprise Cloud Launch Announcement');
    setContentType('Social media post');
    setRawText(SAMPLE_VIOLATION_COPY);
    setCurrentText(SAMPLE_VIOLATION_COPY);
    setUploadNotice('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadNotice(`Processing ${file.name}...`);
    try {
      // For text-based files, read content directly
      const text = await file.text();
      setRawText(text);
      setCurrentText(text);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
      setUploadNotice(`Loaded ${file.name} (${file.size} bytes)`);
    } catch (err) {
      console.error('File load error', err);
      setUploadNotice('Failed to read file.');
    }
  };

  const handleRunReview = async (textToReview?: string) => {
    const content = textToReview !== undefined ? textToReview : currentText;
    if (!content.trim()) {
      alert('Please enter or upload content to review.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          contentType,
          categories: selectedCategories,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReviewResult(json.data);
      } else {
        alert(`Analysis error: ${json.error}`);
      }
    } catch (err) {
      console.error('Compliance review error', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Correction Handlers
  const handleAcceptCorrection = (issueId: string) => {
    if (!reviewResult) return;

    const issue = reviewResult.issues.find((i) => i.id === issueId);
    if (!issue) return;

    const replacement = issue.edited_text || issue.suggestion;
    const regex = new RegExp(`\\b${issue.original_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const updatedText = currentText.replace(regex, replacement);

    setCurrentText(updatedText);

    // Update issue status
    setReviewResult({
      ...reviewResult,
      issues: reviewResult.issues.map((i) =>
        i.id === issueId ? { ...i, status: 'accepted' } : i
      ),
    });
  };

  const handleRejectCorrection = (issueId: string) => {
    if (!reviewResult) return;
    setReviewResult({
      ...reviewResult,
      issues: reviewResult.issues.map((i) =>
        i.id === issueId ? { ...i, status: 'rejected' } : i
      ),
    });
  };

  const handleEditCorrection = (issueId: string, newText: string) => {
    if (!reviewResult) return;
    setReviewResult({
      ...reviewResult,
      issues: reviewResult.issues.map((i) =>
        i.id === issueId ? { ...i, edited_text: newText, suggestion: newText } : i
      ),
    });
  };

  const handleApplyAll = () => {
    if (!reviewResult) return;

    let updated = currentText;
    const updatedIssues = reviewResult.issues.map((issue) => {
      if (issue.status !== 'rejected') {
        const replacement = issue.edited_text || issue.suggestion;
        const regex = new RegExp(`\\b${issue.original_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        updated = updated.replace(regex, replacement);
        return { ...issue, status: 'accepted' as const };
      }
      return issue;
    });

    setCurrentText(updated);
    setReviewResult({
      ...reviewResult,
      issues: updatedIssues,
    });
  };

  const handleResetAll = () => {
    setCurrentText(rawText);
    if (reviewResult) {
      setReviewResult({
        ...reviewResult,
        issues: reviewResult.issues.map((i) => ({ ...i, status: 'pending' })),
      });
    }
  };

  const handleSubmitToQueue = async () => {
    if (!title.trim()) {
      alert('Please enter a submission title');
      return;
    }

    setIsSubmittingToQueue(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          contentType,
          rawText,
          reviewCategories: selectedCategories,
          latestReview: reviewResult
            ? {
                ...reviewResult,
                // Recalculate score if corrections were accepted
                compliance_score: Math.min(
                  100,
                  reviewResult.compliance_score +
                    reviewResult.issues.filter((i) => i.status === 'accepted').length * 12
                ),
              }
            : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsQueueModalOpen(false);
        router.push(`/queue/${json.data.id}`);
      }
    } catch (e) {
      console.error('Queue submission failed', e);
    } finally {
      setIsSubmittingToQueue(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Fast-Track Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <FileSearch className="h-4 w-4" />
            Compliance Studio
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Content Compliance Review</h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate draft content against NovaTech brand guidelines, tone, facts, and terminology with explainable evidence.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Load Sample Copy (With Violations)</span>
        </button>
      </div>

      {/* Main Content Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign or Content Title *</label>
            <input
              type="text"
              placeholder="e.g. Q1 Enterprise Cloud Launch Announcement"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/40"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Content Type *</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {contentTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Governance Categories to Evaluate
          </label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Input or Upload Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">Content Copy *</label>
            <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload Document (TXT/PDF/DOCX)</span>
              <input
                type="file"
                accept=".txt,.pdf,.docx,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {uploadNotice && (
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded-lg flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              <span>{uploadNotice}</span>
            </div>
          )}

          <textarea
            rows={5}
            placeholder="Paste your draft marketing copy, website text, or campaign messaging here..."
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setCurrentText(e.target.value);
            }}
            className="w-full p-3 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 bg-slate-50/40 leading-relaxed"
          />
        </div>

        {/* Run Review CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {rawText.trim().split(/\s+/).filter(Boolean).length} words ready for brand governance check
          </div>

          <button
            onClick={() => handleRunReview(rawText)}
            disabled={isAnalyzing || !rawText.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
          >
            {isAnalyzing ? (
              <>
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Evaluating Against Brand Rules...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Run Compliance Review</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section (Appears after analysis) */}
      {reviewResult && (
        <div className="space-y-6 pt-2">
          {/* Review Summary Score Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Review Assessment
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {reviewResult.aiModel || 'Rule-Based Engine'}
                </span>
                {reviewResult.requires_human_review && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Human Sign-off Recommended
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                {reviewResult.overall_summary}
              </p>
            </div>

            {/* Compliance Score Donut Badge */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                  Compliance Score
                </div>
                <div
                  className={`text-3xl font-extrabold ${
                    reviewResult.compliance_score >= 80
                      ? 'text-emerald-600'
                      : reviewResult.compliance_score >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {reviewResult.compliance_score}/100
                </div>
              </div>

              <button
                onClick={() => setIsQueueModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit to Queue</span>
              </button>
            </div>
          </div>

          {/* Positive Observations (if any) */}
          {reviewResult.positive_observations.length > 0 && (
            <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4 text-xs space-y-1.5">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Positive Brand Alignments
              </div>
              <ul className="text-slate-700 list-disc pl-5 space-y-1">
                {reviewResult.positive_observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Diff & Correction Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                Interactive Content Correction Studio
              </h3>
              <button
                onClick={() => handleRunReview(currentText)}
                disabled={isAnalyzing}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Re-run Compliance Review</span>
              </button>
            </div>

            <DiffEditor
              originalText={rawText}
              currentText={currentText}
              issues={reviewResult.issues}
              onChange={(newText) => setCurrentText(newText)}
              onApplyAll={handleApplyAll}
              onResetAll={handleResetAll}
            />
          </div>

          {/* Detected Issues & Explainable Evidence Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Detected Compliance Issues ({reviewResult.issues.length})
              </h3>
              <span className="text-xs text-slate-500">
                {reviewResult.issues.filter((i) => i.status === 'accepted').length} accepted •{' '}
                {reviewResult.issues.filter((i) => i.status === 'pending').length} pending
              </span>
            </div>

            {reviewResult.issues.length === 0 ? (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-8 text-center text-xs text-emerald-800">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-sm text-emerald-900">Zero Compliance Violations!</div>
                <p className="mt-1">Content meets all selected brand governance rules.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewResult.issues.map((issue) => (
                  <EvidenceCard
                    key={issue.id}
                    issue={issue}
                    onAccept={handleAcceptCorrection}
                    onReject={handleRejectCorrection}
                    onEdit={handleEditCorrection}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit to Review Queue Modal */}
      {isQueueModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Submit to Approval Queue</h3>
              <button
                onClick={() => setIsQueueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                Your content will be placed in the <strong>Review Queue</strong> for official brand compliance officer review.
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div><strong>Title:</strong> {title}</div>
                <div><strong>Category:</strong> {contentType}</div>
                <div><strong>Creator:</strong> {currentUser.name}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Note or Context for Reviewer (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Applied all AI corrections for terminology and 99.95% SLA. Ready for Q1 campaign release."
                  value={submitNotes}
                  onChange={(e) => setSubmitNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsQueueModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitToQueue}
                disabled={isSubmittingToQueue}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {isSubmittingToQueue ? 'Submitting...' : 'Send for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
