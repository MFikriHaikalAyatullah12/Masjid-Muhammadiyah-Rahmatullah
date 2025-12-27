'use client';

import { useState, useEffect } from 'react';

interface OptimizedLoaderProps {
  text?: string;
  showTimeout?: boolean;
  timeoutDuration?: number;
}

export default function OptimizedLoader({ 
  text = "Memuat...", 
  showTimeout = true, 
  timeoutDuration = 10000 
}: OptimizedLoaderProps) {
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    if (!showTimeout) return;
    
    const timer = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, timeoutDuration);

    return () => clearTimeout(timer);
  }, [showTimeout, timeoutDuration]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="relative">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600"></div>
        {/* Dot animation */}
        <div className="absolute inset-0 rounded-full animate-ping opacity-20 border-2 border-green-600"></div>
      </div>
      
      <p className="mt-4 text-gray-600 font-medium">{text}</p>
      
      {showTimeoutWarning && (
        <div className="mt-4 text-center">
          <p className="text-yellow-600 text-sm">
            Proses memakan waktu lebih lama dari biasanya...
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Mohon tunggu sebentar atau refresh halaman jika terlalu lama
          </p>
        </div>
      )}
    </div>
  );
}