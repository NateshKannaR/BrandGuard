'use client';

import React, { useState } from 'react';
import {
  Layers,
  Chrome,
  Figma,
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Palette,
  ExternalLink,
  Code2,
  Copy,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function ExtensionsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'chrome' | 'figma'>('chrome');

  // Chrome Simulator State
  const [docText, setDocText] = useState(
    'NovaTech delivers an unmatched 100% unbreakable uptime guarantee. Our product handles millions of users across the globe with zero maintenance windows.'
  );
  const [isInspecting, setIsInspecting] = useState(false);
  const [violationsFound, setViolationsFound] = useState<any[]>([
    {
      term: '100% unbreakable uptime guarantee',
      replacement: 'audited 99.95% cloud availability SLA',
      reason: 'SOC2 verified SLA is 99.95%. Absolute 100% claims constitute unverified contractual breach.',
    },
    {
      term: 'millions of users',
      replacement: 'millions of enterprise customers',
      reason: 'Terminology rule: Refer to participants as "customers", not "users".',
    },
  ]);

  // Figma Simulator State
  const [figmaColor, setFigmaColor] = useState('#EF4444'); // Non-compliant rogue red
  const [figmaPadding, setFigmaPadding] = useState(12); // Under 24px safe zone
  const [figmaFixed, setFigmaFixed] = useState(false);

  const handleApplyChromeCorrection = (term: string, replacement: string) => {
    setDocText((prev) => prev.replace(term, replacement));
    setViolationsFound((prev) => prev.filter((v) => v.term !== term));
    showToast('Correction Injected', `Replaced with "${replacement}" directly in document.`, 'success');
  };

  const handleFixFigmaTokens = () => {
    setFigmaColor('#2563EB'); // Compliant Brand Primary Blue
    setFigmaPadding(24); // Compliant 24px Safe-zone
    setFigmaFixed(true);
    showToast('Figma Tokens Applied', 'Swapped layer fill to NovaTech Blue (#2563EB) & applied 24px padding.', 'success');
  };

  const handleResetFigma = () => {
    setFigmaColor('#EF4444');
    setFigmaPadding(12);
    setFigmaFixed(false);
  };

  const downloadExtensionBundle = () => {
    const manifest = {
      manifest_version: 3,
      name: 'BrandGuard AI — Realtime Omnichannel Governance Copilot',
      version: '3.0.0',
      description: 'Inline brand voice, approved SLA, and terminology linting across Google Docs, Notion, and WordPress.',
      permissions: ['activeTab', 'storage'],
      action: { default_title: 'BrandGuard AI Copilot' },
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BrandGuard_Chrome_Extension_manifest.json';
    a.click();
    showToast('Extension Manifest Downloaded', 'Ready for Chrome Developer Mode (Load unpacked).', 'success');
  };

  const downloadFigmaManifest = () => {
    const figmaManifest = {
      name: 'BrandGuard AI — Design System Governor',
      id: 'brandguard-ai-figma-plugin',
      api: '1.0.0',
      main: 'code.js',
      ui: 'ui.html',
      editorType: ['figma'],
    };
    const blob = new Blob([JSON.stringify(figmaManifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BrandGuard_Figma_Plugin_manifest.json';
    a.click();
    showToast('Figma Plugin Manifest Downloaded', 'Ready to import into Figma Plugins Desktop.', 'success');
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="h-4 w-4" />
            Round 3 Major Improvement 2
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Omnichannel Browser Extension & Figma Plugin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time compliance linting embedded directly within content creators&apos; native workflows (Google Docs, Notion, Figma).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'chrome' ? (
            <button
              onClick={downloadExtensionBundle}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Chrome Extension Bundle</span>
            </button>
          ) : (
            <button
              onClick={downloadFigmaManifest}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Figma Plugin Bundle</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('chrome')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chrome'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Chrome className="h-4 w-4 text-emerald-400" />
          <span>Chrome Extension (Google Docs & Notion Simulator)</span>
        </button>

        <button
          onClick={() => setActiveTab('figma')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'figma'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Figma className="h-4 w-4 text-purple-400" />
          <span>Figma Plugin (Design Token Governor Simulator)</span>
        </button>
      </div>

      {activeTab === 'chrome' ? (
        /* Chrome Extension Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated Google Doc Window */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-semibold text-slate-500 ml-2 font-mono">
                  Google Docs — Q4 Campaign Pitch.gdoc
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                BrandGuard Active in Tab
              </span>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Live Drafting Surface (Try typing or editing):
              </label>
              <textarea
                rows={6}
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                className="w-full p-4 text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />

              {/* Floating Widget Mockup */}
              <div className="absolute bottom-4 right-4 bg-slate-950 text-white px-3.5 py-2 rounded-xl shadow-xl border border-slate-800 flex items-center gap-2 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-bold">BrandGuard Copilot:</span>
                <span className="text-[11px] text-amber-300 font-mono font-bold">
                  {violationsFound.length} issues
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <span>Extension continuously audits cursor selection against local WebWorker rules in &lt;10ms.</span>
              <button
                onClick={() => {
                  setDocText(
                    'NovaTech delivers an unmatched 100% unbreakable uptime guarantee. Our product handles millions of users across the globe with zero maintenance windows.'
                  );
                  setViolationsFound([
                    {
                      term: '100% unbreakable uptime guarantee',
                      replacement: 'audited 99.95% cloud availability SLA',
                      reason: 'SOC2 verified SLA is 99.95%. Absolute 100% claims constitute unverified contractual breach.',
                    },
                    {
                      term: 'millions of users',
                      replacement: 'millions of enterprise customers',
                      reason: 'Terminology rule: Refer to participants as "customers", not "users".',
                    },
                  ]);
                }}
                className="text-blue-600 font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Sample Text
              </button>
            </div>
          </div>

          {/* Extension Sidebar Overlay */}
          <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Chrome className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  BrandGuard Browser Drawer
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                v3.0.0
              </span>
            </div>

            {violationsFound.length === 0 ? (
              <div className="p-8 text-center space-y-2 bg-emerald-50/50 rounded-xl border border-emerald-200">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">Document 100% Compliant</h4>
                <p className="text-[11px] text-slate-500">No voice, SLA, or terminology discrepancies detected.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-600">
                  Detected Violations ({violationsFound.length}):
                </div>
                {violationsFound.map((v, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        Violation
                      </span>
                    </div>
                    <div className="line-through text-red-700 font-mono text-[11px]">&ldquo;{v.term}&rdquo;</div>
                    <div className="text-emerald-700 font-semibold font-mono text-[11px]">
                      &rarr; &ldquo;{v.replacement}&rdquo;
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">{v.reason}</p>
                    <button
                      onClick={() => handleApplyChromeCorrection(v.term, v.replacement)}
                      className="w-full mt-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept & Inject to Doc
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Figma Plugin Simulator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated Figma Canvas */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Figma className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-semibold text-slate-700 font-mono">
                  Figma Canvas — Hero_Banner_Component_Frame
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                Design Tokens Inspector
              </span>
            </div>

            {/* Interactive Component Frame */}
            <div className="p-8 bg-slate-900 rounded-2xl flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
              <div
                className="w-full max-w-md rounded-xl transition-all duration-300 shadow-2xl flex flex-col items-center text-center justify-center"
                style={{
                  backgroundColor: figmaColor,
                  padding: `${figmaPadding}px`,
                }}
              >
                <div className="text-[10px] uppercase font-bold text-white/80 tracking-wider mb-1">
                  NovaTech Enterprise Cloud
                </div>
                <h3 className="text-lg font-black text-white">Continuous Innovation</h3>
                <div className="mt-3 text-[11px] font-mono bg-black/40 text-white/90 px-3 py-1 rounded-md">
                  Fill: {figmaColor} | Safe Margin: {figmaPadding}px
                </div>
              </div>

              {/* Safe-zone indicator overlay */}
              {figmaPadding < 24 && (
                <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                  Safe-Zone Breach: {figmaPadding}px (&lt; 24px minimum)
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Live bidirectional link to Figma plugin bridge via WebSocket API.</span>
              <button onClick={handleResetFigma} className="text-slate-600 font-bold hover:underline flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Reset Frame Styles
              </button>
            </div>
          </div>

          {/* Plugin Panel Mockup */}
          <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-purple-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  BrandGuard Plugin
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">
                Figma v2.4
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Token Compliance Status</div>
                <div className="flex items-center justify-between">
                  <span>Color Token:</span>
                  <span className={`font-mono font-bold ${figmaFixed ? 'text-emerald-600' : 'text-red-600'}`}>
                    {figmaFixed ? 'NovaTech-Blue-600' : 'Unregistered Red (#EF4444)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Safe Margin:</span>
                  <span className={`font-mono font-bold ${figmaFixed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {figmaPadding}px ({figmaFixed ? 'Pass' : 'Violates 24px rule'})
                  </span>
                </div>
              </div>

              {!figmaFixed ? (
                <button
                  onClick={handleFixFigmaTokens}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  Auto-Apply Approved Tokens
                </button>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-800 font-bold text-center rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Frame Complies With Design System
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
