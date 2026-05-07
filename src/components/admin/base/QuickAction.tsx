'use client';

import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
}

export default function QuickAction({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  disabled = false,
  className = ''
}: QuickActionProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const variantStyles = {
    default: 'text-white/50 hover:text-white hover:bg-white/10',
    danger: 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10',
    success: 'text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/10',
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={disabled}
        className={`
          p-2.5 rounded-xl transition-all
          ${variantStyles[variant]}
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        <Icon className="w-5 h-5" />
      </button>

      {showTooltip && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a20] text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-lg z-50">
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1a1a20]" />
        </div>
      )}
    </div>
  );
}
