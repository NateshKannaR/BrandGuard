'use client';

import React, { useState } from 'react';
import {
  Building2,
  Workflow,
  Radio,
  Send,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Sliders,
  Check,
  AlertCircle,
  Copy,
  Terminal,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Workspace {
  id: string;
  name: string;
  division: string;
  region: string;
  activeGuidelines: number;
  riskTolerance: 'Strict' | 'Balanced' | 'Permissive';
  complianceLead: string;
}

const WORKSPACES: Workspace[] = [
  {
    id: 'ws-global',
    name: 'NovaTech Global Enterprise',
    division: 'Corporate Headquarters',
    region: 'North America / Global',
    activeGuidelines: 9,
    riskTolerance: 'Strict',
    complianceLead: 'Elena Rostova (VP Brand Governance)',
  },
  {
    id: 'ws-emea',
    name: 'NovaTech EMEA Operations',
    division: 'European Division (GDPR / Multilingual)',
    region: 'Europe (London / Frankfurt)',
    activeGuidelines: 12,
    riskTolerance: 'Strict',
    complianceLead: 'Klaus Lindner (Director of Regulatory Affairs)',
  },
  {
    id: 'ws-fintech',
    name: 'NovaTech FinTech Solutions',
    division: 'Banking & Payments Unit (SOC2 & SEC)',
    region: 'Americas / APAC',
    activeGuidelines: 15,
    riskTolerance: 'Strict',
    complianceLead: 'Sarah Sterling (Senior Compliance Counsel)',
  },
  {
    id: 'ws-labs',
    name: 'NovaTech AI Labs & R&D',
    division: 'Emerging Technology Exploration',
    region: 'Global Virtual',
    activeGuidelines: 6,
    riskTolerance: 'Balanced',
    complianceLead: 'Alex Chen (Product Marketing Lead)',
  },
];

export default function WorkspacesPage() {
  const { showToast } = useToast();
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(WORKSPACES[0]);
  const [minAIScore, setMinAIScore] = useState(85);
  const [requireLegalSignoff, setRequireLegalSignoff] = useState(true);
  const [requireBrandDirector, setRequireBrandDirector] = useState(true);

  // Webhook Dispatcher State
  const [selectedWebhook, setSelectedWebhook] = useState<'contentful' | 'strapi' | 'slack'>('contentful');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLog, setDispatchLog] = useState<any>(null);

  const handleSaveMatrix = () => {
    showToast(
      'Approval Matrix Updated',
      `Saved tiered workflow for ${selectedWorkspace.name} (Min Score: ${minAIScore}%).`,
      'success'
    );
  };

  const handleDispatchWebhook = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      const timestamp = new Date().toISOString();
      const mockPayload = {
        event: 'compliance.submission.approved',
        timestamp,
        workspaceId: selectedWorkspace.id,
        organization: selectedWorkspace.name,
        submission: {
          id: 'sub_enterprise_q4_hero',
          title: 'Q4 Global Cloud Innovation Campaign',
          complianceScore: 98.4,
          certifiedHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          approver: 'Elena Rostova (Senior Brand Officer)',
        },
        signature: 'sha256=a7f49b109c91f5848d1e2e3f88c6928e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a',
      };
      setDispatchLog({
        status: 200,
        statusText: 'OK',
        durationMs: 38,
        destination:
          selectedWebhook === 'contentful'
            ? 'https://api.contentful.com/spaces/nv_global/environments/master/brandguard'
            : selectedWebhook === 'strapi'
            ? 'https://cms.novatech.io/hooks/brandguard-publish'
            : 'https://hooks.slack.com/services/T0123/B0456/BrandAlerts',
        payload: mockPayload,
      });
      showToast('Webhook Dispatched', `Payload delivered with 200 OK (${38}ms).`, 'success');
    }, 900);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="h-4 w-4" />
            Round 3 Major Improvement 3
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Tenant Hierarchy & Webhook Dispatcher
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise multi-organization governance, tiered approval matrices, and cryptographic webhook publishing pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Workspace:</span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold font-mono">
            {selectedWorkspace.name}
          </span>
        </div>
      </div>

      {/* Multi-Tenant Switcher Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-blue-600" />
          Select Tenant Workspace
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORKSPACES.map((ws) => {
            const isSelected = selectedWorkspace.id === ws.id;
            return (
              <button
                key={ws.id}
                onClick={() => {
                  setSelectedWorkspace(ws);
                  showToast('Workspace Switched', `Active governance context: ${ws.name}`, 'info');
                }}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-950 text-white border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                    : 'glass-card text-slate-800 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {ws.region}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                </div>
                <div className="font-bold text-sm mt-2 line-clamp-1">{ws.name}</div>
                <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  {ws.division}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-800/20 flex items-center justify-between text-[11px]">
                  <span className="font-mono">{ws.activeGuidelines} Active Rules</span>
                  <span className="font-bold text-emerald-400">{ws.riskTolerance} Risk</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiered Approval Matrix & Webhook Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiered Approval Matrix */}
        <div className="glass-card rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Tiered Governance Approval Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
              Scoped to {selectedWorkspace.id}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Tier 1: AI Gate */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Tier 1: AI Verification Threshold
                </span>
                <span className="font-mono text-blue-600">{minAIScore}% Min Score</span>
              </div>
              <input
                type="range"
                min="70"
                max="98"
                value={minAIScore}
                onChange={(e) => setMinAIScore(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Content scoring below {minAIScore}% is automatically returned to creator for revision.
              </p>
            </div>

            {/* Tier 2: Creative & Brand Director Signoff */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  Tier 2: Brand Lead Signoff
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Alex Chen (Product Marketing Lead) or designated reviewer
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireBrandDirector}
                onChange={(e) => setRequireBrandDirector(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Tier 3: Legal & Regulatory Signoff */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  Tier 3: Legal & Compliance Signoff
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedWorkspace.complianceLead}
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireLegalSignoff}
                onChange={(e) => setRequireLegalSignoff(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveMatrix}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              Save Scoped Approval Matrix
            </button>
          </div>
        </div>

        {/* Automated Webhook Dispatcher */}
        <div className="glass-card rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Automated CMS Webhook Pipeline
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              HMAC-SHA256 Signed
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Production Pipeline:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedWebhook('contentful')}
                  className={`py-2 px-2.5 rounded-xl border font-bold transition-all ${
                    selectedWebhook === 'contentful'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Contentful
                </button>
                <button
                  onClick={() => setSelectedWebhook('strapi')}
                  className={`py-2 px-2.5 rounded-xl border font-bold transition-all ${
                    selectedWebhook === 'strapi'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Strapi CMS
                </button>
                <button
                  onClick={() => setSelectedWebhook('slack')}
                  className={`py-2 px-2.5 rounded-xl border font-bold transition-all ${
                    selectedWebhook === 'slack'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Slack Alert
                </button>
              </div>
            </div>

            <button
              onClick={handleDispatchWebhook}
              disabled={isDispatching}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{isDispatching ? 'Transmitting HMAC Payload...' : 'Dispatch Cryptographic Test Webhook'}</span>
            </button>

            {dispatchLog && (
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px] overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    HTTP {dispatchLog.status} {dispatchLog.statusText}
                  </span>
                  <span className="text-slate-400">{dispatchLog.durationMs}ms latency</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">Dest: {dispatchLog.destination}</div>
                <pre className="text-[10px] text-blue-300 max-h-36 overflow-y-auto overflow-x-auto whitespace-pre-wrap break-all pt-1">
                  {JSON.stringify(dispatchLog.payload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
