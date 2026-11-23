import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/components/layout/RoleContext';
import { ToastProvider } from '@/components/ui/Toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'BrandGuard AI — Explainable Brand Governance Platform',
  description:
    'Intelligent brand governance platform reviewing content against approved guidelines, facts, terminology, tone of voice, visual assets, and accessibility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex antialiased relative">

        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-white focus:p-3">Skip to content</a>
        <RoleProvider>
          <ToastProvider>
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f6f5fa] relative z-10">
              <Header />
              <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
                {children}
              </main>
            </div>
          </ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
