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
  Search,
  PenTool,
  Award,
  Zap,
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

  const getRoleIcon = (role: string) => {
    if (role === 'reviewer') return Award;
    if (role === 'admin') return Sparkles;
    return PenTool;
  };

  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* BrandGuard Active Engine Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border border-blue-200/80 text-xs text-blue-900 shadow-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <span className="font-extrabold tracking-tight">Governance Engine:</span>
          <span className="text-blue-700 font-mono text-[11px] font-semibold bg-white/80 px-2 py-0.5 rounded-full border border-blue-200/50">
            {process.env.GEMINI_API_KEY ? 'Gemini 1.5 Pro' : 'Explainable Rule & Evidence Retrieval'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>9 NovaTech Rules Enforced</span>
        </div>
      </div>

      {/* Actions: Role switcher, Demo Reset, New Review */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={resetDemoData}
          disabled={isLoading}
          title="Reset sample guidelines, reviews, and metrics"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset Baseline</span>
        </button>

        {/* Demo Role Simulator Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:scale-[1.02]"
          >
            <div className="h-5 w-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              {React.createElement(getRoleIcon(currentUser.role), { className: 'h-3 w-3' })}
            </div>
            <span className="hidden sm:inline text-slate-400 text-[11px]">Simulator:</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-mono font-bold ${
                currentUser.role === 'reviewer'
                  ? 'bg-purple-100 text-purple-700'
                  : currentUser.role === 'admin'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {currentUser.role}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Role Simulator (Audit Mode)</span>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setInfoModalOpen(true);
                  }}
                  className="text-blue-600 hover:underline font-semibold text-[10px]"
                >
                  Why simulated?
                </button>
              </div>

              <div className="p-1.5 space-y-1">
                {users.map((u) => {
                  const RoleIcon = getRoleIcon(u.role);
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSwitchUser(u.id, u.name, u.role)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between rounded-xl hover:bg-slate-50 transition-all ${
                        isCurrent
                          ? 'bg-blue-50/90 font-bold text-blue-900 border border-blue-200/60'
                          : 'text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs ${
                            u.role === 'reviewer'
                              ? 'bg-purple-100 text-purple-700'
                              : u.role === 'admin'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <RoleIcon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-normal">{u.title}</div>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-md font-bold ${
                          u.role === 'reviewer'
                            ? 'bg-purple-100 text-purple-700'
                            : u.role === 'admin'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* New Review Primary Action */}
        <Link
          href="/review"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          <span>New Review</span>
        </Link>
      </div>

      {/* Explanation Modal about Role Simulation */}
      {infoModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/50">
                  <UserCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Enterprise Role Simulation</h3>
                  <p className="text-[11px] text-slate-500">Evaluator & Judge Multi-Party Testing</p>
                </div>
              </div>
              <button
                onClick={() => setInfoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                In a production enterprise deployment, team members authenticate through corporate SSO providers (Okta, Google Workspace, Azure AD) with server-side Row-Level Security (RLS) enforcing permission boundaries.
              </p>
              <div className="bg-gradient-to-br from-blue-50/50 to-slate-50 p-3.5 rounded-xl border border-blue-100 space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-blue-600" />
                  Included for Hackathon Round 2 Testing:
                </div>
                <p className="text-[11px] text-slate-600">
                  Role-switching is enabled directly in the top header so evaluators can seamlessly test both sides of brand governance:
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-700 pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span><strong>Content Creator (Sarah Lin / Alex Chen)</strong>: Submits marketing copy, views AI flags, and applies diff suggestions.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    <span><strong>Brand Reviewer (Alex Morgan / Elena Rostova)</strong>: Audits submissions, adds reviewer comments, and grants official publication approvals.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInfoModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Got It, Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
