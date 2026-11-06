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
} from 'lucide-react';
import { useRole } from './RoleContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/review', label: 'Content Review', icon: FileSearch, badge: 'AI' },
  { href: '/guidelines', label: 'Brand Guidelines', icon: BookOpen },
  { href: '/queue', label: 'Review Queue', icon: Inbox },
  { href: '/visual-review', label: 'Visual Review', icon: ImageIcon, badge: 'New' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useRole();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-screen">
      {/* Brand Logo & Name */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight flex items-center gap-1.5 text-base">
            BrandGuard <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-medium">AI</span>
          </div>
          <p className="text-xs text-slate-400">Governance Platform</p>
        </div>
      </div>

      {/* Workspace Indicator */}
      <div className="px-6 py-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Workspace</div>
        <div className="text-sm font-medium text-white flex items-center justify-between mt-0.5">
          <span>NovaTech Solutions</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400" title="Active Organization" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-blue-700 text-blue-100'
                      : 'bg-slate-800 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile & simulated role */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center font-semibold text-white text-xs border border-slate-600 overflow-hidden">
            {currentUser.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                currentUser.role === 'reviewer'
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-700/50'
                  : currentUser.role === 'admin'
                  ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                  : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
