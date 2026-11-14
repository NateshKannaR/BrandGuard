'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  FileSearch,
  BookOpen,
  Inbox,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  Activity,
  GitCompare,
  Layers,
  Building2,
  X,
} from 'lucide-react';
import { useRole } from './RoleContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/review', label: 'Content Studio', icon: FileSearch, badge: 'AI', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { href: '/guidelines', label: 'Knowledge Hub', icon: BookOpen },
  { href: '/queue', label: 'Review Queue', icon: Inbox },
  { href: '/visual-review', label: 'Visual Studio', icon: ImageIcon, badge: 'Canvas', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { href: '/drift', label: 'RAG & Drift Engine', icon: GitCompare, badge: 'R3 New', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { href: '/extensions', label: 'Omnichannel Studio', icon: Layers, badge: 'R3 New', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { href: '/workspaces', label: 'Enterprise Workspaces', icon: Building2, badge: 'R3 New', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { href: '/analytics', label: 'Governance Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isMobileMenuOpen, setIsMobileMenuOpen } = useRole();

  const renderNavContent = (isMobile = false) => (
    <>
      {/* Brand Logo & Name */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-white tracking-tight flex items-center gap-1.5 text-base">
              BrandGuard
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 font-mono font-bold border border-blue-400/40">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Governance</p>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Workspace Indicator */}
      <div className="px-4 py-3 mx-3 my-3 rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span>Organization</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            99.95% SLA
          </span>
        </div>
        <div className="text-sm font-bold text-white flex items-center justify-between mt-1">
          <span className="truncate">NovaTech Solutions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            v3.2
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md border ${
                    isActive
                      ? 'bg-white/20 text-white border-white/30'
                      : item.badgeColor || 'bg-slate-800 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Engine Health Bar */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl border border-blue-900/40 bg-gradient-to-br from-blue-950/40 to-slate-900/60">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-blue-400" />
            Rule Engine
          </span>
          <span className="text-emerald-400 font-mono text-[10px]">Zero-Latency</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-1.5 rounded-full w-[94%]" />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>9 Guidelines Active</span>
          <span>100% Verified</span>
        </div>
      </div>

      {/* User profile & simulated role */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-inner">
            {currentUser.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md ${
                  currentUser.role === 'reviewer'
                    ? 'bg-purple-900/70 text-purple-300 border border-purple-700/60'
                    : currentUser.role === 'admin'
                    ? 'bg-amber-900/70 text-amber-300 border border-amber-700/60'
                    : 'bg-blue-900/70 text-blue-300 border border-blue-700/60'
                }`}
              >
                {currentUser.role}
              </span>
              <span className="text-[10px] text-slate-500 truncate">{currentUser.title}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950 text-slate-300 flex-col shrink-0 border-r border-slate-800/80 min-h-screen sticky top-0 h-screen z-20">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-over panel */}
          <aside className="relative w-72 max-w-[85vw] bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-800/80 h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
