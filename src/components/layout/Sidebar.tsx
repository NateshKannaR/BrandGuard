'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck, LayoutDashboard, FileSearch, BookOpen, Inbox, Image, BarChart3,
  Settings, GitCompare, Layers, Building2, X,
} from 'lucide-react';
import { useRole } from './RoleContext';

const sections = [
  {
    label: 'Workspace',
    links: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/review', label: 'Content Studio', icon: FileSearch },
      { href: '/visual-review', label: 'Visual Studio', icon: Image },
      { href: '/queue', label: 'Review Queue', icon: Inbox },
    ],
  },
  {
    label: 'Governance',
    links: [
      { href: '/guidelines', label: 'Knowledge Hub', icon: BookOpen },
      { href: '/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/drift', label: 'Guideline Drift', icon: GitCompare },
    ],
  },
  {
    label: 'Administration',
    links: [
      { href: '/extensions', label: 'Extensions', icon: Layers },
      { href: '/workspaces', label: 'Workspaces', icon: Building2 },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isMobileMenuOpen, setIsMobileMenuOpen } = useRole();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isMobileMenuOpen && !dialog.open) dialog.showModal();
    if (!isMobileMenuOpen && dialog.open) dialog.close();
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setIsMobileMenuOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [setIsMobileMenuOpen]);

  const renderNavigation = (mobile: boolean) => (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-white" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="grid size-9 place-items-center rounded-xl bg-[#d8f6e8] text-[#214f43]"><ShieldCheck className="size-5" /></span>
          BrandGuard AI
        </Link>
        {mobile && <button autoFocus onClick={() => setIsMobileMenuOpen(false)} aria-label="Close navigation" className="rounded-lg p-2 text-violet-100 hover:bg-white/10"><X className="size-5" /></button>}
      </div>
      <div className="mx-3 mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <div className="text-sm font-semibold text-white">NovaTech Solutions</div>
        <div className="mt-0.5 text-xs text-violet-200">Demo workspace</div>
      </div>
      <nav aria-label="Workspace navigation" className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {sections.map(({ label, links }) => (
          <div key={label}>
            <div className="mb-1 px-3 text-xs font-semibold text-violet-300">{label}</div>
            <ul className="space-y-0.5">
              {links.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <li key={href}>
                    <Link href={href} aria-current={active ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-[#453576] text-white' : 'text-violet-100 hover:bg-white/10'}`}>
                      <Icon className="size-4 shrink-0" /> {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#453576] text-xs font-semibold">
          {currentUser.name.split(' ').map((name) => name[0]).join('')}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{currentUser.name}</div>
          <div className="truncate text-xs capitalize text-violet-200">{currentUser.role}</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-[#21183d] text-white lg:flex">
        {renderNavigation(false)}
      </aside>
      <dialog
        id="mobile-navigation"
        ref={dialogRef}
        aria-label="Mobile navigation"
        onClose={() => setIsMobileMenuOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setIsMobileMenuOpen(false); }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-slate-950/60"
      >
        <div className="flex h-full w-72 max-w-[85vw] flex-col bg-[#21183d] text-white">
          {renderNavigation(true)}
        </div>
      </dialog>
    </>
  );
}
