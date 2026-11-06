import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/components/layout/RoleContext';
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
      <body className="bg-slate-50 text-slate-900 min-h-screen flex antialiased">
        <RoleProvider>
          {/* Fixed Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <Header />
            <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
