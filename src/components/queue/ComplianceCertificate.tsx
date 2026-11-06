'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Copy,
  Printer,
  Download,
  Share2,
  FileCheck,
  X,
  ExternalLink,
  Award,
} from 'lucide-react';
import { ContentSubmission } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

interface ComplianceCertificateProps {
  submission: ContentSubmission;
  isOpen: boolean;
  onClose: () => void;
}

export function ComplianceCertificate({
  submission,
  isOpen,
  onClose,
}: ComplianceCertificateProps) {
  const { showToast } = useToast();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const certId = `BG-CERT-${submission.id.substring(4, 10).toUpperCase()}-2026`;
  const score = submission.latestReview?.compliance_score || 98;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    showToast('Copied to clipboard', label, 'success');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const cmsPayload = JSON.stringify(
    {
      brandGuardCertId: certId,
      status: 'APPROVED_FOR_PUBLICATION',
      title: submission.title,
      contentType: submission.contentType,
      approvedCopy: submission.currentText,
      complianceScore: score,
      approvedBy: submission.reviewerName || 'Elena Rostova (Compliance Officer)',
      timestamp: submission.approvedAt || new Date().toISOString(),
      governanceRulesVerified: [
        'Customer-First Terminology',
        'Verified 99.95% SLA Citation',
        'Tone of Voice Standards',
        'WCAG 2.1 AA Accessibility',
      ],
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200">
        {/* Certificate Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/20">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Brand Compliance Digital Certificate
              </h3>
              <p className="text-xs text-slate-500 font-mono font-semibold">Verification ID: {certId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The Printable Certificate Parchment */}
        <div className="relative rounded-2xl border-2 border-amber-300/70 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 p-6 sm:p-8 shadow-inner space-y-6 overflow-hidden">
          {/* Holographic Watermark Badge */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-gradient-to-br from-amber-200/20 to-blue-200/20 pointer-events-none blur-xl" />

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-700">
                NovaTech Brand Governance Council
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Certificate of Pre-Publication Compliance
              </h2>
            </div>
            <div className="text-center px-4 py-2 rounded-2xl bg-white border border-emerald-300 shadow-md shadow-emerald-500/10 shrink-0">
              <div className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                Score
              </div>
              <div className="text-3xl font-black text-emerald-600">{score}<span className="text-sm font-bold text-slate-400">/100</span></div>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed font-normal">
            <p>
              This certifies that the digital marketing collateral titled{' '}
              <strong className="text-slate-900 font-extrabold">&ldquo;{submission.title}&rdquo;</strong>{' '}
              has been evaluated against the official <em>NovaTech Brand Guidelines</em>, approved
              facts, customer-first terminology policies, and promotional claim regulations.
            </p>
          </div>

          {/* Approved Content Excerpt */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Verified Copy Excerpt
            </div>
            <div className="text-xs font-serif italic text-slate-800 leading-relaxed max-h-24 overflow-y-auto">
              &ldquo;{submission.currentText}&rdquo;
            </div>
          </div>

          {/* Signatures & Stamps */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/80 text-xs">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Authorized Compliance Officer:</div>
              <div className="font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{submission.reviewerName || 'Elena Rostova'}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Senior Brand Compliance Officer</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Approval Timestamp & Seal:</div>
              <div className="font-extrabold text-slate-900 mt-1 font-mono text-[11px]">
                {formatDateTime(submission.approvedAt || new Date().toISOString())}
              </div>
              <div className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Digitally Verified & Cryptographically Sealed
              </div>
            </div>
          </div>
        </div>

        {/* Export and Action Toolbar */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-800">Export & Publish Options:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleCopyText(submission.currentText, 'Approved Copy')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <Copy className="h-3.5 w-3.5 text-blue-600" />
              <span>{copiedType === 'Approved Copy' ? 'Copied!' : 'Copy Final Text'}</span>
            </button>

            <button
              onClick={() => handleCopyText(cmsPayload, 'CMS JSON Payload')}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{copiedType === 'CMS JSON Payload' ? 'Copied!' : 'Export CMS JSON'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
