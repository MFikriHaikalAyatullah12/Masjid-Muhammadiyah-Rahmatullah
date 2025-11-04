import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  type?: 'spinner' | 'skeleton' | 'dots';
}

export default function Loading({ size = 'md', text = 'Memuat...', type = 'spinner' }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (type === 'skeleton') {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="mt-3 text-sm text-gray-600 text-center">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[200px]">
      <div className={`animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600 ${sizeClasses[size]}`}></div>
      <p className="mt-3 text-sm text-gray-600 text-center">{text}</p>
    </div>
  );
}