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
} from 'lucide-react';
import { useRole } from './RoleContext';

export function Header() {
  const { currentUser, users, switchUser, resetDemoData, isLoading } = useRole();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* AI Mode Transparency Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="font-medium">AI Engine:</span>
          <span className="text-slate-600 font-mono text-[11px]">
            {process.env.NEXT_PUBLIC_AI_PROVIDER || 'Demo Mode (Deterministic Rules & Retrieval)'}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
          <Info className="h-3.5 w-3.5 text-slate-400" />
          <span>NovaTech Guidelines Active</span>
        </div>
      </div>

      {/* Actions: Role switcher, Demo Reset, New Review */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button */}
        <button
          onClick={resetDemoData}
          disabled={isLoading}
          title="Reset sample guidelines, reviews, and metrics"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-xs font-medium text-slate-700 shadow-sm transition-colors"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="font-semibold text-slate-900">{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 uppercase text-slate-600 font-mono">
              {currentUser.role}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Simulate Role
              </div>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    u.id === currentUser.id ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.title}</div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* New Review Primary Action */}
        <Link
          href="/review"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Review</span>
        </Link>
      </div>
    </header>
  );
}
