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
    <div className="fixed inset-0 bg-slate-950/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200">
        {/* Certificate Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Official Brand Compliance Certificate
              </h3>
              <p className="text-xs text-slate-500 font-mono">Verification: {certId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-sm font-bold rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* The Printable Certificate Parchment */}
        <div className="relative rounded-xl border-2 border-slate-900/10 bg-gradient-to-b from-slate-50/80 to-white p-6 sm:p-8 shadow-inner space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                NovaTech Brand Governance
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                Certificate of Pre-Publication Compliance
              </h2>
            </div>
            <div className="text-center px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 shadow-xs">
              <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Score
              </div>
              <div className="text-2xl font-extrabold text-emerald-600">{score}/100</div>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p>
              This certifies that the digital marketing collateral titled{' '}
              <strong className="text-slate-900 font-bold">&ldquo;{submission.title}&rdquo;</strong>{' '}
              has been evaluated against the official <em>NovaTech Brand Guidelines</em>, approved
              facts, terminology policies, and promotional claim regulations.
            </p>
          </div>

          {/* Approved Content Excerpt */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Verified Copy Excerpt
            </div>
            <div className="text-xs font-serif italic text-slate-800 leading-relaxed max-h-24 overflow-y-auto">
              &ldquo;{submission.currentText}&rdquo;
            </div>
          </div>

          {/* Signatures & Stamps */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
            <div>
              <div className="text-[11px] text-slate-400">Authorized Compliance Officer:</div>
              <div className="font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{submission.reviewerName || 'Elena Rostova'}</span>
              </div>
              <div className="text-[10px] text-slate-500">Senior Brand Compliance Officer</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Approval Stamp & Date:</div>
              <div className="font-bold text-slate-900 mt-1 font-mono text-[11px]">
                {formatDateTime(submission.approvedAt || new Date().toISOString())}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="h-3 w-3" /> Digitally Verified & Sealed
              </div>
            </div>
          </div>
        </div>

        {/* Export and Action Toolbar */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-slate-700">Export & Publish Options:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => handleCopyText(submission.currentText, 'Approved Copy')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            >
              <Copy className="h-3.5 w-3.5 text-blue-600" />
              <span>{copiedType === 'Approved Copy' ? 'Copied!' : 'Copy Final Text'}</span>
            </button>

            <button
              onClick={() => handleCopyText(cmsPayload, 'CMS JSON Payload')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            >
              <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>{copiedType === 'CMS JSON Payload' ? 'Copied!' : 'Export CMS JSON'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
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
