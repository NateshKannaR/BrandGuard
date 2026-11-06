'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  RotateCcw,
  Plus,
  Sparkles,
  ChevronDown,
  Info,
  Key,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { useRole } from './RoleContext';
import { useToast } from '@/components/ui/Toast';

export function Header() {
  const { currentUser, users, switchUser, resetDemoData, isLoading } = useRole();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const handleSwitchUser = async (id: string, name: string, role: string) => {
    await switchUser(id);
    setDropdownOpen(false);
    showToast('Role Switched', `Now acting as ${name} (${role.toUpperCase()})`, 'info');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* BrandGuard Active Engine Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200 text-xs text-blue-900 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="font-bold">Governance Engine:</span>
          <span className="text-blue-700 font-mono text-[11px] font-semibold">
            {process.env.GEMINI_API_KEY ? 'Gemini 1.5 Pro' : 'Explainable Rule & Evidence Retrieval'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>NovaTech Guidelines Enforced</span>
        </div>
      </div>

      {/* Actions: Role switcher, Demo Reset, New Review */}
      <div className="flex items-center gap-2.5">
        {/* Reset Demo Data Button */}
        <button
          onClick={resetDemoData}
          disabled={isLoading}
          title="Reset sample guidelines, reviews, and metrics"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors shadow-2xs"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset Baseline</span>
        </button>

        {/* Demo Role Simulator Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-xs font-medium text-slate-700 shadow-2xs transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline text-slate-500">Simulator:</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 uppercase font-mono font-bold">
              {currentUser.role}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Role Simulator (Evaluation)</span>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setInfoModalOpen(true);
                  }}
                  className="text-blue-600 hover:underline font-normal text-[10px]"
                >
                  Why simulated?
                </button>
              </div>

              <div className="p-1 space-y-0.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchUser(u.id, u.name, u.role)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-lg hover:bg-slate-50 transition-colors ${
                      u.id === currentUser.id ? 'bg-blue-50/80 font-bold text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{u.title}</div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New Review Primary Action */}
        <Link
          href="/review"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Review</span>
        </Link>
      </div>

      {/* Explanation Modal about Role Simulation */}
      {infoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <UserCheck className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">Enterprise Role Simulation</h3>
              </div>
              <button onClick={() => setInfoModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                In a production enterprise deployment, users authenticate with their corporate SSO credentials (e.g., Okta, Google Workspace, Azure AD) with server-side Row Level Security (RLS) enforcing role permissions.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">For Hackathon Round 2 Evaluation:</div>
                <p className="text-[11px]">
                  Role-switching is built directly into this environment so evaluators can experience the full multi-party workflow:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                  <li><strong>Alex Chen (Creator)</strong>: Submits marketing copy, views AI flags, and applies corrections.</li>
                  <li><strong>Elena Rostova (Reviewer)</strong>: Reviews submission diffs, adds audit comments, and grants official publication approvals.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
