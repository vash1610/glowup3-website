'use client';

import React from 'react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'dots';
  text?: string;
  className?: string;
}

export default function LoadingState({
  type = 'spinner',
  text = 'Loading...',
  className = ''
}: LoadingStateProps) {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/[0.05] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/[0.05] rounded animate-pulse w-3/4" />
              <div className="h-3 bg-white/[0.05] rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="ml-2 text-sm text-white/50">{text}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        <div className="w-10 h-10 border-2 border-violet-500/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-violet-500 rounded-full animate-spin" />
      </div>
      <span className="text-sm text-white/50">{text}</span>
    </div>
  );
}

export function TableLoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 bg-white/[0.03] rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export function CardLoadingState({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}
