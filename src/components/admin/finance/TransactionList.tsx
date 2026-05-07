'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, CreditCard, MoreHorizontal } from 'lucide-react';
import DataTable, { Column } from '../base/DataTable';
import StatusBadge from '../base/StatusBadge';
import UserAvatar from '../base/UserAvatar';
import QuickAction from '../base/QuickAction';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  onViewDetails?: (id: string) => void;
  className?: string;
}

const getTypeIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'income':
      return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
    case 'expense':
      return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    case 'transfer':
      return <ArrowRightLeft className="w-4 h-4 text-blue-400" />;
  }
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function TransactionList({
  transactions,
  loading = false,
  onViewDetails,
  className = ''
}: TransactionListProps) {
  const columns: Column<Transaction>[] = [
    {
      key: 'user',
      header: 'User',
      width: '200px',
      render: (tx) => (
        <div className="flex items-center gap-3">
          <UserAvatar 
            src={tx.user.avatar} 
            name={tx.user.name} 
            size="sm" 
          />
          <span className="font-medium text-white/90">{tx.user.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (tx) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(tx.type)}
          <span className="capitalize text-white/60">{tx.type}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '140px',
      align: 'right',
      render: (tx) => (
        <span className={`font-semibold ${
          tx.type === 'income' ? 'text-green-400' : tx.type === 'expense' ? 'text-red-400' : 'text-white/80'
        }`}>
          {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
          {formatCurrency(tx.amount, tx.currency)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (tx) => (
        <StatusBadge 
          status={tx.status} 
          size="sm"
          pulse={tx.status === 'pending'}
        />
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (tx) => (
        <span className="text-white/60 truncate block max-w-xs" title={tx.description}>
          {tx.description}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '150px',
      render: (tx) => (
        <span className="text-white/50 text-sm">{formatDate(tx.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      align: 'right',
      render: (tx) => (
        <QuickAction
          icon={MoreHorizontal}
          label="View details"
          onClick={() => onViewDetails?.(tx.id)}
        />
      ),
    },
  ];

  return (
    <div className={className}>
      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        onRowClick={onViewDetails ? (tx) => onViewDetails(tx.id) : undefined}
        emptyMessage="No transactions found"
      />
    </div>
  );
}
