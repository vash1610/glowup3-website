'use client';

import React from 'react';
import { Inbox, Search, FileX, Users, CreditCard, AlertCircle } from 'lucide-react';

type EmptyStateVariant = 'default' | 'search' | 'no-results' | 'no-users' | 'no-transactions' | 'no-tickets';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const variantConfig: Record<EmptyStateVariant, { icon: React.ReactNode; defaultTitle: string; defaultDesc: string }> = {
  default: {
    icon: <Inbox className="w-12 h-12 text-white/20" />,
    defaultTitle: 'No data yet',
    defaultDesc: 'Data will appear here once available.',
  },
  search: {
    icon: <Search className="w-12 h-12 text-white/20" />,
    defaultTitle: 'Start searching',
    defaultDesc: 'Use the search bar to find what you are looking for.',
  },
  'no-results': {
    icon: <FileX className="w-12 h-12 text-white/20" />,
    defaultTitle: 'No results found',
    defaultDesc: 'Try adjusting your search or filters to find what you are looking for.',
  },
  'no-users': {
    icon: <Users className="w-12 h-12 text-white/20" />,
    defaultTitle: 'No users yet',
    defaultDesc: 'Users will appear here once they register.',
  },
  'no-transactions': {
    icon: <CreditCard className="w-12 h-12 text-white/20" />,
    defaultTitle: 'No transactions yet',
    defaultDesc: 'Transactions will appear here once users make payments.',
  },
  'no-tickets': {
    icon: <AlertCircle className="w-12 h-12 text-white/20" />,
    defaultTitle: 'No support tickets',
    defaultDesc: 'Support tickets will appear here when users submit requests.',
  },
};

export default function EmptyState({
  variant = 'default',
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="mb-4 p-4 rounded-full bg-white/[0.03]">
        {config.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-sm text-white/50 text-center max-w-sm mb-6">
        {description || config.defaultDesc}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
