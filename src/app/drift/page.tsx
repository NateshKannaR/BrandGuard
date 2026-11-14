'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GitCompare,
  Database,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  ShieldAlert,
  ArrowRight,
  Sliders,
  Layers,
  Zap,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface VectorDocument {
  id: string;
  name: string;
  category: string;
  chunksCount: number;
  lastIndexed: string;
  vectorDimension: number;
}

interface DriftCase {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  driftScore: number;
  establishedRule: string;
  observedDrift: string;
  sourceDoc: string;
  conflictingAsset: string;
  status: 'Detected' | 'Resolved';
  recommendation: string;
}

const CORP_DOCUMENTS: VectorDocument[] = [
  {
    id: 'doc-01',
    name: 'NovaTech_Global_Brand_Charter_2026.pdf',
    category: 'Tone & Voice Principles',
    chunksCount: 14,
    lastIndexed: '2026-11-12 18:30 UTC',
    vectorDimension: 1536,
  },
  {
    id: 'doc-02',
    name: 'SOC2_Type_II_Security_Audit_Report.pdf',
    category: 'Approved Corporate Facts & SLAs',
    chunksCount: 9,
    lastIndexed: '2026-11-13 09:15 UTC',
    vectorDimension: 1536,
  },
  {
    id: 'doc-03',
    name: 'Customer_First_Messaging_Pillars_v4.md',
    category: 'Approved Terminology & Taxonomy',
    chunksCount: 8,
    lastIndexed: '2026-11-13 14:00 UTC',
    vectorDimension: 1536,
  },
  {
    id: 'doc-04',
    name: 'Legal_Disclaimers_and_Warranty_SLA_Master.pdf',
    category: 'Promotional Claims & Warranties',
    chunksCount: 11,
    lastIndexed: '2026-11-13 16:45 UTC',
    vectorDimension: 1536,
  },
];

const INITIAL_DRIFTS: DriftCase[] = [
  {
    id: 'drift-01',
    title: 'SLA Uptime Guarantee Metric Inflation',
    severity: 'High',
    driftScore: 94,
    establishedRule: 'Our contractual cloud availability commitment is strictly 99.95% SLA with financial remediation clauses.',
    observedDrift: 'Recent campaign drafts repeatedly promise "100% unbreakable uptime with zero system disruptions".',
    sourceDoc: 'SOC2_Type_II_Security_Audit_Report.pdf (§ 8.3)',
    conflictingAsset: 'Q4 Global SaaS Expansion Pitch Deck (Slide 7)',
    status: 'Detected',
    recommendation: 'Reconcile copy back to audited 99.95% SLA benchmark. Strip absolute "100%" claims to avoid contract breach.',
  },
  {
    id: 'drift-02',
    title: 'Customer-First Terminology Regression',
    severity: 'Medium',
    driftScore: 68,
    establishedRule: 'Refer to enterprise participants exclusively as "customers" or "partners", never depersonalized "users" or "accounts".',
    observedDrift: 'Product release notes introduced "user churn metrics" and "active user seat counts" 24 times.',
    sourceDoc: 'Customer_First_Messaging_Pillars_v4.md (§ 2.1)',
    conflictingAsset: 'v3.2 Changelog & Knowledge Base Article',
    status: 'Detected',
    recommendation: 'Replace depersonalized "users" with approved "customers" or "enterprise team members".',
  },
  {
    id: 'drift-03',
    title: 'Unsubstantiated Hyperbolic AI Claims',
    severity: 'High',
    driftScore: 89,
    establishedRule: 'Performance superlatives ("world\'s fastest", "unmatched") require verified third-party benchmark citations.',
    observedDrift: '"NovaTech operates the world\'s most intelligent and flawless AI engine ever engineered."',
    sourceDoc: 'Legal_Disclaimers_and_Warranty_SLA_Master.pdf (§ 4.2)',
    conflictingAsset: 'Homepage Hero Ad Headline (Draft A)',
    status: 'Detected',
    recommendation: 'Replace hyperbole with verifiable statement: "Enterprise-grade governance powered by verified explainable AI models."',
  },
];

export default function DriftEnginePage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'drift' | 'rag'>('drift');
  const [drifts, setDrifts] = useState<DriftCase[]>(INITIAL_DRIFTS);
  const [isScanning, setIsScanning] = useState(false);
  const [query, setQuery] = useState('contractual uptime guarantee SLA');
  const [ragResults, setRagResults] = useState<any[]>([
    {
      score: 0.942,
      doc: 'SOC2_Type_II_Security_Audit_Report.pdf',
      chunk: 'Section 8.3: NovaTech officially warrants a 99.95% annual cloud availability SLA across all multi-tenant enterprise tiers.',
      category: 'Approved Corporate Facts',
    },
    {
      score: 0.887,
      doc: 'Legal_Disclaimers_and_Warranty_SLA_Master.pdf',
      chunk: 'Section 4.1: Any marketing guarantee of 100% uptime without planned maintenance exclusions violates consumer compliance mandates.',
      category: 'Legal Disclaimers',
    },
  ]);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      showToast('Drift Scan Complete', 'Evaluated 42 recent assets against 4 vector documents.', 'success');
    }, 1200);
  };

  const handleResolve = (id: string, title: string) => {
    setDrifts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Resolved' } : d))
    );
    showToast('Guideline Reconciled', `Resolved drift for "${title}" and synced to Knowledge Hub.`, 'success');
  };

  const handleRAGSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (query.toLowerCase().includes('user') || query.toLowerCase().includes('customer')) {
      setRagResults([
        {
          score: 0.961,
          doc: 'Customer_First_Messaging_Pillars_v4.md',
          chunk: 'Section 2.1: Always address individuals utilizing NovaTech solutions as "customers" or "partners". The term "users" is strictly restricted to technical database schema documentation.',
          category: 'Approved Terminology',
        },
        {
          score: 0.814,
          doc: 'NovaTech_Global_Brand_Charter_2026.pdf',
          chunk: 'Section 1.4: Empathy-driven human-first language forms the cornerstone of NovaTech communication standards.',
          category: 'Tone & Voice Principles',
        },
      ]);
    } else {
      setRagResults([
        {
          score: 0.942,
          doc: 'SOC2_Type_II_Security_Audit_Report.pdf',
          chunk: 'Section 8.3: NovaTech officially warrants a 99.95% annual cloud availability SLA across all multi-tenant enterprise tiers.',
          category: 'Approved Corporate Facts',
        },
        {
          score: 0.887,
          doc: 'Legal_Disclaimers_and_Warranty_SLA_Master.pdf',
          chunk: 'Section 4.1: Any marketing guarantee of 100% uptime without planned maintenance exclusions violates consumer compliance mandates.',
          category: 'Legal Disclaimers',
        },
      ]);
    }
    showToast('Semantic Retrieval Done', `Fetched ${ragResults.length} relevant vector chunks for "${query}".`, 'info');
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <Sparkles className="h-4 w-4" />
            Round 3 Major Improvement 1
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Multi-Document RAG & Guideline Drift Detection
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous vector semantic search across enterprise knowledge repositories and real-time guideline drift monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning...' : 'Run Autonomous Drift Audit'}</span>
          </button>
        </div>
      </div>

      {/* Mode Segmented Controls */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('drift')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'drift'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <GitCompare className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Autonomous Drift Detector</span>
          <span className="sm:hidden">Drift Detector</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            {drifts.filter((d) => d.status === 'Detected').length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rag')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'rag'
              ? 'bg-slate-950 text-white shadow-sm ring-1 ring-slate-800'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Database className="h-4 w-4 text-blue-400" />
          <span className="hidden sm:inline">Multi-Doc Vector Knowledge Base</span>
          <span className="sm:hidden">Vector RAG</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 font-bold">
            4 Documents
          </span>
        </button>
      </div>

      {activeTab === 'drift' ? (
        <div className="space-y-6">
          {/* Drift KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-red-500"></div>
              <div className="text-xs font-semibold text-slate-500">Identified Guideline Drifts</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">
                {drifts.filter((d) => d.status === 'Detected').length}{' '}
                <span className="text-xs font-medium text-amber-600 font-mono">Unresolved</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Across 42 recent marketing drafts</div>
            </div>

            <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="text-xs font-semibold text-slate-500">Mean Drift Deviation Score</div>
              <div className="text-3xl font-extrabold text-blue-600 mt-2">83.7%</div>
              <div className="text-[11px] text-slate-500 mt-1">Cosine distance from source charters</div>
            </div>

            <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <div className="text-xs font-semibold text-slate-500">Auto-Remediated Conflicts</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                {drifts.filter((d) => d.status === 'Resolved').length}
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">Synced to Knowledge Hub</div>
            </div>
          </div>

          {/* Drift Cases List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Detected Discrepancies Between Guidelines & Production Content
            </h3>

            {drifts.map((drift) => {
              const isResolved = drift.status === 'Resolved';
              return (
                <div
                  key={drift.id}
                  className={`glass-card rounded-2xl border p-5 transition-all ${
                    isResolved
                      ? 'border-emerald-200/80 bg-emerald-50/20'
                      : 'border-slate-200/80 hover:shadow-glass-card-hover'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          drift.severity === 'High'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {drift.severity} Risk Drift
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{drift.title}</h4>
                      <span className="text-[11px] font-mono text-slate-400">
                        Deviation: <strong className="text-slate-800">{drift.driftScore}%</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isResolved ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Reconciled & Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolve(drift.id, drift.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Auto-Resolve & Sync
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/60 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                        <FileText className="h-3 w-3 text-blue-600" />
                        Established Rule in Official Source Charter
                      </div>
                      <p className="text-slate-900 font-semibold leading-relaxed">{drift.establishedRule}</p>
                      <div className="text-[11px] font-mono text-blue-600 pt-1">{drift.sourceDoc}</div>
                    </div>

                    <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                        Observed Drift in Field Copy
                      </div>
                      <p className="text-amber-950 font-medium leading-relaxed">{drift.observedDrift}</p>
                      <div className="text-[11px] font-mono text-amber-700 pt-1">{drift.conflictingAsset}</div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">Recommended Action:</span>
                      <span>{drift.recommendation}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* RAG Multi-Document Explorer */
        <div className="space-y-6">
          {/* Query Bar */}
          <div className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <form onSubmit={handleRAGSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Query semantic vector index (e.g., uptime SLA, user terminology, encryption)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                Vector Similarity Search
              </button>
            </form>
          </div>

          {/* Indexed Documents Table */}
          <div className="glass-card rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              Active Enterprise Vector Knowledge Documents
            </h3>

            <div className="divide-y divide-slate-100 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 font-semibold border-b border-slate-200 pb-2">
                    <th className="pb-3">Source Document</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-center">Chunks Indexed</th>
                    <th className="pb-3 text-center">Vector Dim</th>
                    <th className="pb-3">Last Vectorized</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CORP_DOCUMENTS.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-mono font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        {doc.name}
                      </td>
                      <td className="py-3 text-slate-600">{doc.category}</td>
                      <td className="py-3 text-center font-bold text-indigo-600">{doc.chunksCount} chunks</td>
                      <td className="py-3 text-center font-mono text-slate-500">{doc.vectorDimension}d</td>
                      <td className="py-3 text-slate-400 text-[11px] font-mono">{doc.lastIndexed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RAG Retrieval Results */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              Top Semantic Vector Matches for &ldquo;{query}&rdquo;
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ragResults.map((res, i) => (
                <div key={i} className="glass-card rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Similarity: {(res.score * 100).toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">{res.category}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-200/60">
                    &ldquo;{res.chunk}&rdquo;
                  </p>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 pt-1">
                    <FileText className="h-3 w-3 text-slate-400" />
                    <span>{res.doc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
