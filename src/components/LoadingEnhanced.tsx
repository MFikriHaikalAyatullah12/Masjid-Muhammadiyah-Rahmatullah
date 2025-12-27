import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  type?: 'spinner' | 'skeleton' | 'dots';
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({ 
  size = 'md', 
  text = 'Memuat...', 
  type = 'spinner',
  fullScreen = false,
  className = ''
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse space-y-4 p-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-xl h-64"></div>
      </div>
    );
  }

  if (type === 'dots') {
    const content = (
      <div className="flex flex-col items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        {text && (
          <p className={`mt-3 ${textSizeClasses[size]} text-gray-600 text-center font-medium`}>
            {text}
          </p>
        )}
      </div>
    );

    return fullScreen ? (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`p-4 ${className}`}>
          {content}
        </div>
      </div>
    ) : (
      <div className={`flex items-center justify-center p-4 min-h-[120px] ${className}`}>
        {content}
      </div>
    );
  }

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-2">
      <div 
        className={`animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 ${sizeClasses[size]} gpu-accelerated`}
        role="status"
        aria-label="Loading"
        style={{ animationDuration: '0.6s' }}
      >
        <span className="sr-only">Loading...</span>
      </div>
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 text-center font-medium max-w-xs animate-pulse`} style={{ animationDuration: '1s' }}>
          {text}
        </p>
      )}
      <div className="w-16 h-1 bg-emerald-100 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-600 rounded-full animate-pulse-fast" style={{ animationDuration: '0.8s' }}></div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className={`p-4 ${className}`}>
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-3 min-h-[120px] ${className}`}>
      {spinnerContent}
    </div>
  );
}