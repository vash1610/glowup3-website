'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import StatsCard from '@/components/admin/base/StatsCard';
import DataTable, { Column } from '@/components/admin/base/DataTable';
import StatusBadge from '@/components/admin/base/StatusBadge';
import SearchInput from '@/components/admin/base/SearchInput';
import DateRangePicker from '@/components/admin/base/DateRangePicker';
import Pagination from '@/components/admin/base/Pagination';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter,
  RefreshCw,
  Loader2,
  CreditCard,
  Banknote,
  Shield,
  Settings2,
  ArrowUpDown
} from 'lucide-react';

interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'escrow_hold' | 'escrow_release' | 'refund' | 'platform_fee' | 'adjustment';
  amount: number;
  fee: number;
  balance_before: number;
  balance_after: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference_account_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_transfer_id: string | null;
  stripe_payout_id: string | null;
  appointment_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  account_id: string;
  owner_type: string;
  user?: {
    id: string;
    name: string;
    email: string;
    user_type: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Totals {
  total_amount: number;
  total_fees: number;
  count: number;
  deposits: number;
  withdrawals: number;
}

const TRANSACTION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'transfer_in', label: 'Transfer In' },
  { value: 'transfer_out', label: 'Transfer Out' },
  { value: 'escrow_hold', label: 'Escrow Hold' },
  { value: 'escrow_release', label: 'Escrow Release' },
  { value: 'refund', label: 'Refund' },
  { value: 'platform_fee', label: 'Platform Fee' },
  { value: 'adjustment', label: 'Adjustment' },
];

const TRANSACTION_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  transfer_in: ArrowLeftRight,
  transfer_out: ArrowLeftRight,
  escrow_hold: Shield,
  escrow_release: Shield,
  refund: ArrowDownLeft,
  platform_fee: CreditCard,
  adjustment: Settings2,
};

const TYPE_COLORS: Record<string, string> = {
  deposit: 'text-green-400 bg-green-400/10',
  withdrawal: 'text-red-400 bg-red-400/10',
  transfer_in: 'text-blue-400 bg-blue-400/10',
  transfer_out: 'text-orange-400 bg-orange-400/10',
  escrow_hold: 'text-purple-400 bg-purple-400/10',
  escrow_release: 'text-purple-400 bg-purple-400/10',
  refund: 'text-yellow-400 bg-yellow-400/10',
  platform_fee: 'text-pink-400 bg-pink-400/10',
  adjustment: 'text-gray-400 bg-gray-400/10',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (searchQuery) {
        // Check if it's a UUID (user ID) or a name
        if (searchQuery.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          params.set('user_id', searchQuery);
        } else {
          params.set('user_name', searchQuery);
        }
      }
      
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (startDate) params.set('date_from', startDate.toISOString());
      if (endDate) params.set('date_to', endDate.toISOString());
      
      const response = await fetch(`/api/admin/finance/transactions?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        setTotals(data.totals);
        setPagination(prev => ({
          ...prev,
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, searchQuery, typeFilter, statusFilter, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('cs-CZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const isCredit = (type: string) => {
    return ['deposit', 'transfer_in', 'escrow_release', 'refund', 'adjustment'].includes(type);
  };

  const isDebit = (type: string) => {
    return ['withdrawal', 'transfer_out', 'escrow_hold', 'platform_fee'].includes(type);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const columns: Column<WalletTransaction>[] = [
    {
      key: 'created_at',
      header: 'Date/Time',
      width: '160px',
      sortable: true,
      render: (tx) => (
        <span className="text-white/50 text-sm">{formatDate(tx.created_at)}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '130px',
      render: (tx) => {
        const Icon = TYPE_ICONS[tx.type] || CreditCard;
        const colorClass = TYPE_COLORS[tx.type] || 'text-gray-400 bg-gray-400/10';
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {tx.type.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'user',
      header: 'User',
      render: (tx) => (
        <div className="flex flex-col">
          <span className="text-white/90 text-sm font-medium">
            {tx.user?.name || tx.owner_type || 'Unknown'}
          </span>
          <span className="text-white/40 text-xs">
            {tx.user?.user_type || tx.owner_type}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '140px',
      align: 'right',
      sortable: true,
      render: (tx) => {
        const isPositive = isCredit(tx.type);
        const isNegative = isDebit(tx.type);
        return (
          <div className="text-right">
            <p className={`font-semibold ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/80'}`}>
              {isPositive ? '+' : isNegative ? '-' : ''}{formatCurrency(tx.amount)}
            </p>
            {tx.fee > 0 && (
              <p className="text-white/40 text-xs">Fee: {formatCurrency(tx.fee)}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'balance_after',
      header: 'Balance After',
      width: '130px',
      align: 'right',
      sortable: true,
      render: (tx) => (
        <span className="text-white/70 text-sm">{formatCurrency(tx.balance_after)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (tx) => (
        <StatusBadge 
          status={tx.status as any} 
          size="sm"
          pulse={tx.status === 'pending'}
        />
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (tx) => (
        <div className="max-w-xs">
          <p className="text-white/80 text-sm truncate">{tx.description || '-'}</p>
          {tx.appointment_id && (
            <p className="text-white/40 text-xs mt-0.5">
              Ref: {tx.appointment_id.slice(0, 8)}...
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      width: '100px',
      render: (tx) => (
        <span className="text-white/40 text-xs">
          {tx.appointment_id ? (
            <span className="text-violet-400">#{tx.appointment_id.slice(0, 8)}</span>
          ) : '-'}
        </span>
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    fetchTransactions(newPage);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStatusFilter('');
    setStartDate(null);
    setEndDate(null);
  };

  const hasActiveFilters = searchQuery || typeFilter || statusFilter || startDate || endDate;

  return (
    <>
      <AdminNav />
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Wallet Transactions</h1>
            <p className="text-white/60">All money movements across the platform</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-violet-500" />
              )}
            </button>
            <button
              onClick={() => fetchTransactions(pagination.page)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Transactions"
            value={totals?.count || 0}
            icon={Wallet}
            color="#667eea"
          />
          <StatsCard
            title="Total Amount"
            value={formatCurrency(totals?.total_amount || 0)}
            icon={Banknote}
            color="#10b981"
          />
          <StatsCard
            title="Deposits"
            value={formatCurrency(totals?.deposits || 0)}
            icon={ArrowDownLeft}
            color="#22c55e"
          />
          <StatsCard
            title="Withdrawals"
            value={formatCurrency(totals?.withdrawals || 0)}
            icon={ArrowUpRight}
            color="#ef4444"
          />
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white/80">Filter Transactions</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-xs text-white/50 mb-1.5">Search (Name or User ID)</label>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name or paste user ID..."
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Transaction Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                >
                  {TRANSACTION_TYPES.map(type => (
                    <option key={type.value} value={type.value} className="bg-[#0a0a0f]">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                >
                  {TRANSACTION_STATUSES.map(status => (
                    <option key={status.value} value={status.value} className="bg-[#0a0a0f]">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Date Range</label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                placeholder="Filter by date range"
              />
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                <h3 className="text-lg font-semibold text-white">Transaction History</h3>
              </div>
              <span className="text-white/50 text-sm">
                {pagination.total.toLocaleString()} transactions
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              <p className="text-white/50">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <DataTable
              columns={columns}
              data={transactions}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={handlePageChange}
              onRowClick={(tx) => console.log('View transaction:', tx.id)}
              emptyMessage="No transactions found"
              rowKey={(tx) => tx.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-white/40">
              <Wallet className="w-12 h-12 mb-3" />
              <p className="text-lg font-medium">No transactions found</p>
              <p className="text-sm">Transactions will appear here once users start using wallets.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 text-sm transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
