'use client';

import React from 'react';

interface BetaBadgeProps {
  size?: 'sm' | 'md';
}

const sizeClasses = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
};

export default function BetaBadge({ size = 'sm' }: BetaBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold tracking-wide uppercase rounded-full bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 text-[#a5b4fc] border border-[#667eea]/30 ${sizeClasses[size]}`}
      title="New feature - still maturing, review its output carefully"
    >
      Beta
    </span>
  );
}
