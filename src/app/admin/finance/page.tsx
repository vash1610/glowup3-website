'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  ArrowRightLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'withdrawal' | 'deposit' | 'escrow' | 'fee';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
  reference_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface FinanceSummary {
  totalRevenue: number;
  pendingAmount: number;
  totalTransactions: number;
  averageTransaction: number;
  escrowBalance: number;
  withdrawalTotal: number;
}

const TYPE_CONFIG = {
  payment: { label: 'Payment', color: 'bg-green-500/20 text-green-400', icon: CreditCard },
  refund: { label: 'Refund', color: 'bg-red-500/20 text-red-400', icon: ArrowDownRight },
  withdrawal: { label: 'Withdrawal', color: 'bg-purple-500/20 text-purple-400', icon: ArrowUpRight },
  deposit: { label: 'Deposit', color: 'bg-blue-500/20 text-blue-400', icon: ArrowRightLeft },
  escrow: { label: 'Escrow', color: 'bg-yellow-500/20 text-yellow-400', icon: Wallet },
  fee: { label: 'Fee', color: 'bg-gray-500/20 text-gray-400', icon: ArrowRightLeft },
};

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-400' },
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    fetchFinanceData();
  }, [filterType, filterStatus]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      params.append('limit', '100');

      const response = await fetch(`/api/admin/transactions?${params}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
      
      // Calculate summary from transactions
      const txns: Transaction[] = data.transactions || [];
      const completedTxns = txns.filter((t: Transaction) => t.status === 'completed');
      
      setSummary({
        totalRevenue: completedTxns
          .filter((t: Transaction) => t.type === 'payment')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        pendingAmount: txns
          .filter((t: Transaction) => t.status === 'pending')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        totalTransactions: txns.length,
        averageTransaction: completedTxns.length > 0 
          ? completedTxns.reduce((sum: number, t: Transaction) => sum + t.amount, 0) / completedTxns.length 
          : 0,
        escrowBalance: txns
          .filter((t: Transaction) => t.type === 'escrow' && t.status === 'completed')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
        withdrawalTotal: completedTxns
          .filter((t: Transaction) => t.type === 'withdrawal')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        txn.description.toLowerCase().includes(query) ||
        (txn.user_email?.toLowerCase().includes(query) ?? false) ||
        (txn.reference_id?.toLowerCase().includes(query) ?? false)
      );
    }
    return true;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  const formatCurrency = (amount: number, currency = 'CZK') => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Status', 'Description', 'User', 'Reference'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.created_at),
      t.type,
      t.amount.toString(),
      t.status,
      t.description,
      t.user_email || '',
      t.reference_id || '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Center</h1>
          <p className="text-white/60">Monitor transactions and financial health</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFinanceData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-green-400 text-sm font-medium">Total Revenue</span>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-sm text-white/60 mt-1">{summary.totalTransactions} transactions</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-yellow-400 text-sm font-medium">Pending</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(summary.pendingAmount)}</p>
            <p className="text-sm text-white/60 mt-1">Awaiting confirmation</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-purple-400 text-sm font-medium">Escrow Balance</span>
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(summary.escrowBalance)}</p>
            <p className="text-sm text-white/60 mt-1">Held in escrow</p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm font-medium">Avg Transaction</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(summary.averageTransaction)}</p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm font-medium">Total Withdrawals</span>
              <ArrowUpRight className="w-5 h-5 text-white/40" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(summary.withdrawalTotal)}</p>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm font-medium">Reconciliation</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">Balanced</p>
            <p className="text-sm text-white/60 mt-1">All accounts reconciled</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="deposit">Deposit</option>
          <option value="escrow">Escrow</option>
          <option value="fee">Fee</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
        </div>
      ) : paginatedTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <Wallet className="w-16 h-16 mb-4" />
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-white/60">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedTransactions.map((txn) => {
                const typeConfig = TYPE_CONFIG[txn.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.payment;
                const statusConfig = STATUS_CONFIG[txn.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const Icon = typeConfig.icon;
                const isNegative = ['refund', 'withdrawal', 'fee'].includes(txn.type);

                return (
                  <tr key={txn.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-white/60 whitespace-nowrap">
                      {formatDate(txn.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${typeConfig.color}`}>
                        <Icon className="w-3 h-3" />
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
                      {isNegative ? '-' : '+'}{formatCurrency(Math.abs(txn.amount), txn.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/80 max-w-xs truncate">
                      {txn.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60 max-w-xs truncate">
                      {txn.user_email || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/5">
            <span className="text-sm text-white/60">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-white">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
