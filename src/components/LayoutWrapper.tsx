'use client';

import { usePathname } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import OptimizedLoader from './OptimizedLoader';

const PUBLIC_PATHS = ['/', '/informasi', '/kontak', '/infaq'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPublicPage = PUBLIC_PATHS.some(p =>
    p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/')
  );
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Track route changes for instant feedback
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (isAuthPage || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell min-h-screen bg-slate-50 relative">
      {/* Watermark halus di pojok, tidak mengganggu keterbacaan */}
      <div className="fixed bottom-6 right-6 w-40 h-40 pointer-events-none z-0 opacity-[0.06] hidden lg:block" aria-hidden="true">
        <img src="/Muhammadiyah.jpeg" alt="" className="w-full h-full object-contain grayscale" loading="lazy" decoding="async" />
      </div>
      
      <Sidebar />
      
      {/* Instant loading overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center lg:pl-64">
          <OptimizedLoader />
        </div>
      )}
      
      <main className="lg:pl-64 pt-16 lg:pt-0 relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Suspense fallback={<OptimizedLoader />}>
            <div className={`transition-opacity duration-200 ${isPageLoading ? 'opacity-50' : 'opacity-100'}`}>
              {children}
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
