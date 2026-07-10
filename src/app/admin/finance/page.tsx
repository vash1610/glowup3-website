'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import StatsCard from '@/components/admin/base/StatsCard';
import DataTable, { Column } from '@/components/admin/base/DataTable';
import StatusBadge from '@/components/admin/base/StatusBadge';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Loader2, CreditCard, RefreshCw, DollarSign, Zap } from 'lucide-react';

interface FinanceStats {
  totalRevenue: number;
  pendingRevenue: number;
  totalPlatformFees: number;
  totalRefunds: number;
  revenueMTD: number;
  monthlyChange: number;
  stats: {
    totalTransactions: number;
    completedCount: number;
    pendingCount: number;
    cancelledCount: number;
  };
}

interface StripeData {
  balance: {
    available: number;
    pending: number;
    currency: string;
  };
  stats: {
    totalReceived: number;
    totalPending: number;
    totalFees: number;
    paymentCount: number;
    refundCount: number;
    disputeCount: number;
  };
}

interface Transaction {
  id: string;
  type: 'payment' | 'refund';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  user: {
    id: string;
    name: string;
  };
  pro: {
    id: string;
    name: string;
  };
  createdAt: string;
  reservation_fee: number;
}

interface StripeTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  fee: number;
  created: string;
  description: string | null;
}

export default function FinancePage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [stripeData, setStripeData] = useState<StripeData | null>(null);
  const [supabaseTransactions, setSupabaseTransactions] = useState<Transaction[]>([]);
  const [stripeTransactions, setStripeTransactions] = useState<StripeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinanceStats();
    fetchTransactions();
    fetchStripeData();
  }, []);

  const fetchFinanceStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/finance/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch finance stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch finance stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await fetch('/api/admin/finance/transactions?limit=50');
      if (response.ok) {
        const data = await response.json();
        setSupabaseTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchStripeData = async () => {
    try {
      setStripeLoading(true);
      const response = await fetch('/api/admin/finance/stripe');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStripeData(data);
          setStripeTransactions(data.transactions || []);
        }
      }
    } catch (err) {
      console.error('Error fetching Stripe data:', err);
    } finally {
      setStripeLoading(false);
    }
  };

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

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Date',
      width: '150px',
      render: (tx) => (
        <span className="text-white/50 text-sm">{formatDate(tx.createdAt)}</span>
      ),
    },
    {
      key: 'description',
      header: 'Service',
      render: (tx) => (
        <div>
          <p className="text-white/90 font-medium">{tx.description}</p>
          <p className="text-white/50 text-xs">Customer: {tx.user?.name || 'Unknown'}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '100px',
      render: (tx) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          tx.type === 'payment' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {tx.type === 'payment' ? 'Payment' : 'Refund'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '140px',
      align: 'right',
      render: (tx) => (
        <span className={`font-semibold ${
          tx.type === 'payment' ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {tx.type === 'refund' ? '-' : '+'}{formatCurrency(tx.amount)}
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
      key: 'reservation_fee',
      header: 'Platform Fee',
      width: '120px',
      align: 'right',
      render: (tx) => (
        <span className="text-white/50 text-sm">
          {formatCurrency(tx.reservation_fee)}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <>
        <AdminNav />
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchFinanceStats}
              className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
            <p className="text-white/60">Track revenue, transactions, and financial metrics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchStripeData();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#635bff]/20 hover:bg-[#635bff]/30 text-[#635bff] transition-colors"
              disabled={stripeLoading}
            >
              <Zap className={`w-4 h-4 ${stripeLoading ? 'animate-spin' : ''}`} />
              Sync Stripe
            </button>
            <button
              onClick={() => {
                fetchFinanceStats();
                fetchTransactions();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Two-column layout for Supabase and Stripe */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supabase Bookings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h2 className="text-lg font-semibold text-white">Supabase (Bookings)</h2>
            </div>
            
            {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                    <div className="h-3 bg-white/10 rounded w-20 mb-2" />
                    <div className="h-6 bg-white/10 rounded w-28 mt-3" />
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Total Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  change={stats.monthlyChange}
                  changeType={stats.monthlyChange >= 0 ? 'positive' : 'negative'}
                  icon={Wallet}
                  color="#667eea"
                  description={`${stats.stats.completedCount} completed`}
                />
                <StatsCard
                  title="Pending Revenue"
                  value={formatCurrency(stats.pendingRevenue)}
                  icon={TrendingUp}
                  color="#10b981"
                  description={`${stats.stats.pendingCount} pending`}
                />
                <StatsCard
                  title="Platform Fees"
                  value={formatCurrency(stats.totalPlatformFees)}
                  icon={PiggyBank}
                  color="#8b5cf6"
                  description="From reservations"
                />
                <StatsCard
                  title="Refunds"
                  value={formatCurrency(stats.totalRefunds)}
                  icon={TrendingDown}
                  color="#f59e0b"
                  description={`${stats.stats.cancelledCount} cancelled`}
                />
              </div>
            ) : null}

            {/* Revenue MTD */}
            {stats && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 border border-[#667eea]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Revenue MTD</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenueMTD)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/60 text-sm">Monthly Change</p>
                    <p className={`text-lg font-bold ${stats.monthlyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.monthlyChange >= 0 ? '+' : ''}{stats.monthlyChange.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stripe Payments Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#635bff]"></div>
              <h2 className="text-lg font-semibold text-white">Stripe (Payments)</h2>
            </div>
            
            {stripeLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                    <div className="h-3 bg-white/10 rounded w-20 mb-2" />
                    <div className="h-6 bg-white/10 rounded w-28 mt-3" />
                  </div>
                ))}
              </div>
            ) : stripeData ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <StatsCard
                    title="Stripe Balance"
                    value={formatCurrency(stripeData.balance.available)}
                    icon={DollarSign}
                    color="#635bff"
                    description={`${stripeData.stats.paymentCount} payments`}
                  />
                  <StatsCard
                    title="Pending"
                    value={formatCurrency(stripeData.balance.pending)}
                    icon={TrendingUp}
                    color="#10b981"
                    description={`${stripeData.stats.totalPending.toFixed(0)} CZK pending`}
                  />
                  <StatsCard
                    title="Stripe Fees"
                    value={formatCurrency(stripeData.stats.totalFees)}
                    icon={PiggyBank}
                    color="#8b5cf6"
                    description="Stripe processing fees"
                  />
                  <StatsCard
                    title="Refunds"
                    value={formatCurrency(stripeData.stats.refundCount)}
                    icon={TrendingDown}
                    color="#f59e0b"
                    description={`${stripeData.stats.refundCount} refunds issued`}
                  />
                </div>

                {/* Stripe Balance Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#635bff]/20 to-[#635bff]/5 border border-[#635bff]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Available Balance</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(stripeData.balance.available)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-sm">Pending</p>
                      <p className="text-lg font-bold text-yellow-400">{formatCurrency(stripeData.balance.pending)}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-white/50">Stripe data not available</p>
                <button
                  onClick={fetchStripeData}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#635bff]/20 hover:bg-[#635bff]/30 text-[#635bff] text-sm"
                >
                  Connect Stripe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Supabase Transactions Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <h3 className="text-lg font-semibold text-white">Booking Transactions (Supabase)</h3>
              </div>
              <span className="text-white/50 text-sm">
                {supabaseTransactions.length} transactions
              </span>
            </div>
          </div>
          
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
            </div>
          ) : supabaseTransactions.length > 0 ? (
            <DataTable
              columns={transactionColumns}
              data={supabaseTransactions}
              onRowClick={(tx) => console.log('View transaction:', tx.id)}
              emptyMessage="No transactions found"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-white/40">
              <CreditCard className="w-12 h-12 mb-3" />
              <p>No transactions yet</p>
              <p className="text-sm">Transactions will appear here once users make bookings.</p>
            </div>
          )}
        </div>

        {/* Stripe Transactions Table */}
        {stripeTransactions.length > 0 && (
          <div className="rounded-xl border border-[#635bff]/30 overflow-hidden">
            <div className="p-4 bg-[#635bff]/10 border-b border-[#635bff]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#635bff]"></div>
                  <h3 className="text-lg font-semibold text-white">Payment Transactions (Stripe)</h3>
                </div>
                <span className="text-white/50 text-sm">
                  {stripeTransactions.length} transactions
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Type</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Description</th>
                    <th className="text-right p-4 text-white/60 text-sm font-medium">Amount</th>
                    <th className="text-right p-4 text-white/60 text-sm font-medium">Fee</th>
                    <th className="text-left p-4 text-white/60 text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stripeTransactions.slice(0, 20).map((tx, index) => (
                    <tr 
                      key={tx.id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => console.log('Stripe transaction:', tx.id)}
                    >
                      <td className="p-4 text-white/50 text-sm">{formatDate(tx.created)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'charge' 
                            ? 'bg-green-500/20 text-green-400' 
                            : tx.type === 'refund'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-white/90 text-sm">{tx.description || '-'}</p>
                      </td>
                      <td className={`p-4 text-right font-semibold ${
                        tx.amount >= 0 ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </td>
                      <td className="p-4 text-right text-white/50 text-sm">
                        {formatCurrency(tx.fee)}
                      </td>
                      <td className="p-4">
                        <StatusBadge 
                          status={tx.status as any} 
                          size="sm"
                          pulse={tx.status === 'pending'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}