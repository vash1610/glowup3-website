'use client';

import React from 'react';

type StatusType = 
  | 'success' | 'warning' | 'error' | 'info' | 'pending' | 'neutral'
  | 'active' | 'inactive' | 'completed' | 'cancelled' | 'refunded' | 'failed'
  | 'paid' | 'unpaid' | 'partial' | 'draft';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const statusConfig: Record<StatusType, { color: string; bgColor: string; label: string }> = {
  success: { color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Success' },
  warning: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', label: 'Warning' },
  error: { color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'Error' },
  info: { color: 'text-blue-400', bgColor: 'bg-blue-400/10', label: 'Info' },
  pending: { color: 'text-orange-400', bgColor: 'bg-orange-400/10', label: 'Pending' },
  neutral: { color: 'text-gray-400', bgColor: 'bg-gray-400/10', label: 'Neutral' },
  active: { color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', label: 'Active' },
  inactive: { color: 'text-slate-400', bgColor: 'bg-slate-400/10', label: 'Inactive' },
  completed: { color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Completed' },
  cancelled: { color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'Cancelled' },
  refunded: { color: 'text-purple-400', bgColor: 'bg-purple-400/10', label: 'Refunded' },
  failed: { color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'Failed' },
  paid: { color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Paid' },
  unpaid: { color: 'text-red-400', bgColor: 'bg-red-400/10', label: 'Unpaid' },
  partial: { color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', label: 'Partial' },
  draft: { color: 'text-gray-400', bgColor: 'bg-gray-400/10', label: 'Draft' },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function StatusBadge({ status, label, size = 'md', pulse = false }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.neutral;
  const displayLabel = label || config.label;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${config.bgColor} ${config.color} ${sizeClasses[size]}`}
    >
      {pulse && (
        <span className={`relative flex h-2 w-2`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.color.replace('text-', 'bg-')}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color.replace('text-', 'bg-')}`} />
        </span>
      )}
      {displayLabel}
    </span>
  );
}
