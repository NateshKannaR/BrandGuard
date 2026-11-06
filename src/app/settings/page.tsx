'use client';

import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Key,
  Building,
  RotateCcw,
  CheckCircle,
  Shield,
  Palette,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useRole } from '@/components/layout/RoleContext';

export default function SettingsPage() {
  const { currentUser, users, switchUser, resetDemoData, isLoading } = useRole();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    await resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
          <Settings className="h-4 w-4" />
          System Preferences
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure AI provider credentials, workspace brand parameters, and demo testing controls.
        </p>
      </div>

      {/* AI Provider Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Engine & Model Provider</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
            {process.env.NEXT_PUBLIC_AI_PROVIDER || 'Demo Mode (Deterministic Rules)'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          BrandGuard AI utilizes a provider abstraction supporting Google Gemini and OpenAI. In zero-dependency demo mode, an explainable deterministic rule and retrieval engine processes submissions against stored guidelines without external latency or cost.
        </p>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">Google Gemini API</div>
              <div className="text-slate-500 text-[11px]">Supports Gemini 1.5 Pro & Vision Flash analysis</div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {process.env.GEMINI_API_KEY ? 'Active' : 'Unconfigured (.env.local)'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-800">OpenAI API</div>
              <div className="text-slate-500 text-[11px]">Supports GPT-4o with structured JSON schema outputs</div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              {process.env.OPENAI_API_KEY ? 'Active' : 'Unconfigured (.env.local)'}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          To connect a live LLM key, create <code>.env.local</code> in the project root with <code>GEMINI_API_KEY=your_key</code> or <code>OPENAI_API_KEY=your_key</code>.
        </div>
      </div>

      {/* Organization Workspace Specs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Workspace Brand Parameters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">Organization Name</label>
            <input
              type="text"
              readOnly
              value="NovaTech Solutions"
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="text-slate-500 font-medium block mb-1">Brand Slug</label>
            <input
              type="text"
              readOnly
              value="novatech"
              className="w-full p-2.5 border border-slate-200 rounded-lg bg-slate-50 font-mono text-slate-600"
            />
          </div>
        </div>

        {/* Color Palette Display */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">Approved Corporate Palette</label>
          <div className="flex items-center gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="h-5 w-5 rounded bg-[#0F172A] border" />
              <span>Navy #0F172A (Primary)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="h-5 w-5 rounded bg-[#2563EB] border" />
              <span>Blue #2563EB (Accent)</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="h-5 w-5 rounded bg-[#64748B] border" />
              <span>Slate #64748B (Neutral)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Controls & Testing Suite */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <RotateCcw className="h-4 w-4 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Demo Testing & Data Reset</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          For hackathon evaluators: clicking &ldquo;Reset Factory Demo State&rdquo; will restore the pristine NovaTech enterprise dataset, sample guidelines, mock submissions, and historical compliance records.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Factory Demo State</span>
          </button>

          {resetSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Demo data restored!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
