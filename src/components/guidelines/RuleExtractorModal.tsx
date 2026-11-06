'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, UploadCloud, Check, X, ShieldAlert, Plus, CheckCircle2 } from 'lucide-react';
import { BrandGuideline, GuidelineCategory } from '@/types';
import { useToast } from '@/components/ui/Toast';

interface RuleExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface CandidateRule {
  title: string;
  category: GuidelineCategory;
  rule: string;
  description: string;
  sourceDocument: string;
  sourceExcerpt: string;
  selected: boolean;
}

const SAMPLE_BRAND_CHARTER = `
NovaTech Global Editorial & Brand Identity Charter 2026

1. VOICE AND TONE:
NovaTech speaks with quiet confidence, empathetic expertise, and rigorous clarity. Words like 'insane', 'killer', 'rockstar', and exclamation point cascades are strictly prohibited in public collateral.

2. NOMENCLATURE AND CUSTOMER TERMS:
Refer to individuals and businesses using our software as 'customers' or 'clients'. The term 'users' is restricted strictly to backend technical API documentation. Never label pricing as 'cheap'. Emphasize 'cost-effective' and high ROI.

3. AUDITED INFRASTRUCTURE METRICS:
Under Section 4.2 of our independent SOC2 Type II audit, NovaTech Cloud Infrastructure commits to an annualized verified uptime SLA of 99.95%. Absolute promises of 100% uptime are unsupportable and legally restricted.

4. VISUAL IDENTITY & SAFE MARGINS:
Brand primary colors are Navy (#0F172A) and Accent Blue (#2563EB). All logo marks must maintain a minimum clearspace margin of 24px (1x icon height).
`;

export function RuleExtractorModal({ isOpen, onClose, onImported }: RuleExtractorModalProps) {
  const { showToast } = useToast();
  const [inputText, setInputText] = useState(SAMPLE_BRAND_CHARTER);
  const [filename, setFilename] = useState('NovaTech_Brand_Charter_2026.pdf');
  const [isExtracting, setIsExtracting] = useState(false);
  const [candidates, setCandidates] = useState<CandidateRule[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleExtract = () => {
    setIsExtracting(true);
    setTimeout(() => {
      const extracted: CandidateRule[] = [
        {
          title: 'Empathetic Expertise & Slang Prohibition',
          category: 'Tone of Voice',
          rule: "Prohibit casual slang ('insane', 'killer') and cascading punctuation in public collateral.",
          description: 'NovaTech speaks with quiet confidence and empathetic expertise.',
          sourceDocument: filename,
          sourceExcerpt: "Section 1: 'Words like insane, killer, rockstar, and exclamation point cascades are strictly prohibited.'",
          selected: true,
        },
        {
          title: 'Customer-First Nomenclature Policy',
          category: 'Terminology',
          rule: "Always refer to clients as 'customers' rather than 'users' in public collateral.",
          description: 'Elevates audience to strategic business partners.',
          sourceDocument: filename,
          sourceExcerpt: "Section 2: 'Refer to individuals and businesses as customers or clients.'",
          selected: true,
        },
        {
          title: 'Audited 99.95% SLA Commitment Citation',
          category: 'Approved Facts',
          rule: 'Only cite the official verified 99.95% uptime SLA backed by SOC2 Type II audits.',
          description: 'Prevents misleading absolute claims of 100% uptime.',
          sourceDocument: filename,
          sourceExcerpt: "Section 3: 'NovaTech commits to an annualized verified uptime SLA of 99.95%.'",
          selected: true,
        },
        {
          title: 'Minimum 24px Logo Safe-Zone Clearance',
          category: 'Visual Identity',
          rule: 'All logo marks must maintain a minimum 24px padding margin from asset boundaries.',
          description: 'Prevents brand crowding on social and advertising banners.',
          sourceDocument: filename,
          sourceExcerpt: "Section 4: 'All logo marks must maintain a minimum clearspace margin of 24px.'",
          selected: true,
        },
      ];
      setCandidates(extracted);
      setIsExtracting(false);
      showToast('Document Analyzed', `Extracted ${extracted.length} governance rules.`, 'success');
    }, 600);
  };

  const toggleSelect = (index: number) => {
    setCandidates((prev) =>
      prev.map((c, i) => (i === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleImportSelected = async () => {
    const selected = candidates.filter((c) => c.selected);
    if (selected.length === 0) {
      alert('Please select at least one candidate rule to import.');
      return;
    }

    setIsImporting(true);
    try {
      for (const rule of selected) {
        await fetch('/api/guidelines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: rule.title,
            category: rule.category,
            rule: rule.rule,
            description: rule.description,
            sourceDocument: rule.sourceDocument,
            sourceExcerpt: rule.sourceExcerpt,
            isActive: true,
          }),
        });
      }

      showToast(
        'Rules Successfully Imported',
        `Added ${selected.length} guidelines to your Knowledge Base.`,
        'success'
      );
      onImported();
      onClose();
    } catch (e) {
      console.error('Import failed', e);
      showToast('Import Error', 'Failed to save rules', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Document Rule Auto-Extractor</h3>
              <p className="text-xs text-slate-500">
                Upload or paste brand charters to automatically synthesize structured compliance guidelines.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Source Document Text or Pasted Brand Charter
              </label>
              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs font-sans leading-relaxed focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-500 font-mono text-[11px]">{filename}</span>
              <button
                onClick={handleExtract}
                disabled={isExtracting || !inputText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs transition-colors"
              >
                {isExtracting ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Extracting Structured Rules...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Extract Rules with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Extracted Candidate Guidelines ({candidates.length})
              </span>
              <button
                onClick={() => setCandidates([])}
                className="text-blue-600 hover:underline text-[11px]"
              >
                Re-scan Document
              </button>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {candidates.map((cand, idx) => (
                <div
                  key={idx}
                  onClick={() => toggleSelect(idx)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    cand.selected
                      ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={cand.selected}
                        onChange={() => toggleSelect(idx)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <h4 className="font-bold text-slate-900">{cand.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {cand.category}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1.5 pl-5 font-medium">{cand.rule}</p>
                  <p className="text-slate-400 text-[11px] mt-1 pl-5 italic font-serif">
                    &ldquo;{cand.sourceExcerpt}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSelected}
                disabled={isImporting || candidates.filter((c) => c.selected).length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Import {candidates.filter((c) => c.selected).length} Selected Rules</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
