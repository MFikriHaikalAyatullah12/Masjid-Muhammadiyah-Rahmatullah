'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Sidebar from './Sidebar';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Muhammadiyah Logo Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Main center watermark - Optimized with 40% opacity */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] opacity-40">
          <img 
            src="/Muhammadiyah.jpeg" 
            alt="Logo Muhammadiyah" 
            className="w-full h-full object-contain filter grayscale sepia-[0.3] hue-rotate-[80deg] saturate-[0.8]"
            loading="lazy"
            decoding="async"
            style={{ 
              imageRendering: 'crisp-edges',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          />
        </div>
        
        {/* Subtle corner watermarks for visual balance */}
        <div className="absolute top-8 right-8 w-24 h-24 sm:w-28 sm:h-28 opacity-20 hidden lg:block">
          <img 
            src="/Muhammadiyah.jpeg" 
            alt="Logo Muhammadiyah" 
            className="w-full h-full object-contain filter grayscale sepia-[0.3] hue-rotate-[80deg] saturate-[0.8]"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        <div className="absolute bottom-8 left-8 w-24 h-24 sm:w-28 sm:h-28 opacity-20 hidden lg:block">
          <img 
            src="/Muhammadiyah.jpeg" 
            alt="Logo Muhammadiyah" 
            className="w-full h-full object-contain filter grayscale sepia-[0.3] hue-rotate-[80deg] saturate-[0.8]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      
      <Sidebar />
      <main className="lg:pl-64 pt-16 lg:pt-0 relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[180px] animate-pulse">
              <div className="text-center space-y-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent gpu-accelerated" style={{ animationDuration: '0.6s' }}></div>
                <p className="text-sm text-gray-600 font-medium animate-pulse" style={{ animationDuration: '1s' }}>Memuat...</p>
                <div className="w-20 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full animate-pulse-fast" style={{ animationDuration: '0.8s' }}></div>
                </div>
              </div>
            </div>
          }>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
