'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import StatsCard from '@/components/admin/base/StatsCard';
import DataTable, { Column } from '@/components/admin/base/DataTable';
import StatusBadge from '@/components/admin/base/StatusBadge';
import BetaBadge from '@/components/admin/base/BetaBadge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  Scale,
  Loader2
} from 'lucide-react';

interface ReconciliationData {
  current: {
    supabaseTotal: number;
    stripeTotal: number;
    discrepancy: number;
    status: 'match' | 'mismatch';
    severity: 'info' | 'warning' | 'critical';
  };
  stripeBalance: {
    available: number;
    pending: number;
  };
  matches: {
    missingTransactions: Array<{ payment_intent_id: string; amount_czk: number; created: string; description: string }>;
    extraTransactions: Array<{ escrow_id: string; idempotency_key: string; amount_czk: number; appointment_id: string | null; reason: string }>;
    discrepancyTransactions: Array<{ payment_intent_id: string; escrow_id: string; stripe_amount_czk: number; escrow_amount_czk: number }>;
  };
  history: ReconciliationLog[];
}

interface ReconciliationLog {
  id: string;
  reconciliation_date: string;
  supabase_total: number;
  stripe_total: number;
  discrepancy_amount: number;
  status: 'match' | 'mismatch';
  severity: 'info' | 'warning' | 'critical';
  notes: string | null;
}

const severityColors = {
  info: {
    text: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
  },
  warning: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/20',
  },
  critical: {
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
  },
};

const severityLabels = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

export default function ReconciliationPage() {
  const [data, setData] = useState<ReconciliationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReconciliation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/finance/reconciliation');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result);
        } else {
          setError(result.error || 'Failed to fetch reconciliation data');
        }
      } else {
        setError('Failed to fetch reconciliation data');
      }
    } catch (err) {
      console.error('Error fetching reconciliation:', err);
      setError('Failed to fetch reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

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

  const historyColumns: Column<ReconciliationLog>[] = [
    {
      key: 'reconciliation_date',
      header: 'Date',
      width: '180px',
      render: (log) => (
        <span className="text-white/50 text-sm">{formatDate(log.reconciliation_date)}</span>
      ),
    },
    {
      key: 'supabase_total',
      header: 'Supabase CZK',
      width: '140px',
      align: 'right',
      render: (log) => (
        <span className="text-green-400 font-medium">{formatCurrency(log.supabase_total)}</span>
      ),
    },
    {
      key: 'stripe_total',
      header: 'Stripe CZK',
      width: '140px',
      align: 'right',
      render: (log) => (
        <span className="text-[#635bff] font-medium">{formatCurrency(log.stripe_total)}</span>
      ),
    },
    {
      key: 'discrepancy_amount',
      header: 'Difference',
      width: '140px',
      align: 'right',
      render: (log) => {
        const isMatch = log.status === 'match';
        return (
          <span className={`font-semibold ${isMatch ? 'text-green-400' : 'text-red-400'}`}>
            {isMatch ? '✓ Match' : formatCurrency(Math.abs(log.discrepancy_amount))}
          </span>
        );
      },
    },
    {
      key: 'severity',
      header: 'Severity',
      width: '120px',
      render: (log) => {
        const colors = severityColors[log.severity];
        return (
          <StatusBadge 
            status={log.severity === 'critical' ? 'error' : log.severity === 'warning' ? 'warning' : 'info'}
            label={severityLabels[log.severity]}
            size="sm"
          />
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (log) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
          log.status === 'match' 
            ? 'bg-green-400/10 text-green-400' 
            : 'bg-red-400/10 text-red-400'
        }`}>
          {log.status === 'match' ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Match
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3" />
              Mismatch
            </>
          )}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <>
        <AdminNav />
        <div className="max-w-[1600px] mx-auto p-6">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 mb-2">{error}</p>
            <button 
              onClick={fetchReconciliation}
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 border border-[#667eea]/20">
              <Scale className="w-6 h-6 text-[#667eea]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Finance Reconciliation</h1>
              <p className="text-white/60">Compare Supabase and Stripe records</p>
            </div>
          </div>
          <button
            onClick={fetchReconciliation}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#667eea] animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supabase Total */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Wallet className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Supabase Total</p>
                    <p className="text-white/40 text-xs">Completed Appointments</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(data.current.supabaseTotal)}
                </p>
              </div>

              {/* Stripe Total */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#635bff]/10 to-[#635bff]/5 border border-[#635bff]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[#635bff]/20">
                    <CreditCard className="w-5 h-5 text-[#635bff]" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Stripe Total</p>
                    <p className="text-white/40 text-xs">Available + Pending</p>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#635bff]">
                  {formatCurrency(data.current.stripeTotal)}
                </p>
              </div>

              {/* Discrepancy */}
              <div className={`p-6 rounded-xl border ${
                data.current.status === 'match'
                  ? 'bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20'
                  : severityColors[data.current.severity].bg + ' ' + severityColors[data.current.severity].border
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    data.current.status === 'match'
                      ? 'bg-green-500/20'
                      : severityColors[data.current.severity].bg
                  }`}>
                    {data.current.status === 'match' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className={`w-5 h-5 ${severityColors[data.current.severity].text}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Discrepancy</p>
                    <p className="text-white/40 text-xs">
                      {data.current.status === 'match' ? 'All systems balanced' : 'Adjustment needed'}
                    </p>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <p className={`text-3xl font-bold ${
                    data.current.status === 'match'
                      ? 'text-green-400'
                      : severityColors[data.current.severity].text
                  }`}>
                    {data.current.status === 'match' ? 'Match' : formatCurrency(Math.abs(data.current.discrepancy))}
                  </p>
                  {data.current.status !== 'match' && data.current.discrepancy < 0 && (
                    <span className="text-red-400 text-sm mb-1">(shortfall)</span>
                  )}
                  {data.current.status !== 'match' && data.current.discrepancy > 0 && (
                    <span className="text-yellow-400 text-sm mb-1">(surplus)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Supabase Appts"
                value={data.current.supabaseTotal.toString()}
                icon={Wallet}
                color="#10b981"
                description="Completed total"
              />
              <StatsCard
                title="Stripe Available"
                value={formatCurrency(data.stripeBalance.available)}
                icon={TrendingUp}
                color="#635bff"
                description="Immediately available"
              />
              <StatsCard
                title="Stripe Pending"
                value={formatCurrency(data.stripeBalance.pending)}
                icon={TrendingDown}
                color="#f59e0b"
                description="In transit"
              />
              <StatsCard
                title="Difference"
                value={formatCurrency(Math.abs(data.current.discrepancy))}
                icon={AlertTriangle}
                color={data.current.status === 'match' ? '#10b981' : '#ef4444'}
                description={data.current.status === 'match' ? 'No issues' : 'Needs review'}
              />
            </div>

            {/* Per-Transaction Discrepancies */}
            {data.matches && (data.matches.missingTransactions.length + data.matches.extraTransactions.length + data.matches.discrepancyTransactions.length) > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                <div className="p-4 bg-red-500/10 border-b border-red-500/20 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {data.matches.missingTransactions.length + data.matches.extraTransactions.length + data.matches.discrepancyTransactions.length} Unmatched Transaction{data.matches.missingTransactions.length + data.matches.extraTransactions.length + data.matches.discrepancyTransactions.length === 1 ? '' : 's'}
                  </h3>
                  <BetaBadge />
                </div>
                <div className="p-4 space-y-3">
                  {data.matches.missingTransactions.map((t) => (
                    <div key={t.payment_intent_id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white text-sm font-medium">Payment succeeded but nothing was granted</p>
                      <p className="text-white/60 text-xs mt-1">
                        Stripe {t.payment_intent_id} &middot; {formatCurrency(t.amount_czk)} &middot; {formatDate(t.created)}
                      </p>
                      <p className="text-white/40 text-xs mt-1">{t.description}</p>
                    </div>
                  ))}
                  {data.matches.extraTransactions.map((t) => (
                    <div key={t.escrow_id} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 text-sm font-medium">Granted with no real payment behind it</p>
                      <p className="text-white/60 text-xs mt-1">
                        Escrow {t.escrow_id} &middot; {formatCurrency(t.amount_czk)} &middot; appointment {t.appointment_id || 'n/a'}
                      </p>
                      <p className="text-white/40 text-xs mt-1">{t.reason}</p>
                    </div>
                  ))}
                  {data.matches.discrepancyTransactions.map((t) => (
                    <div key={t.payment_intent_id} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-yellow-400 text-sm font-medium">Amount mismatch</p>
                      <p className="text-white/60 text-xs mt-1">
                        Stripe charged {formatCurrency(t.stripe_amount_czk)}, escrow holds {formatCurrency(t.escrow_amount_czk)} ({t.payment_intent_id})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reconciliation History Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      data.current.status === 'match' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <h3 className="text-lg font-semibold text-white">Reconciliation History</h3>
                  </div>
                  <span className="text-white/50 text-sm">
                    {data.history.length} records
                  </span>
                </div>
              </div>
              
              {data.history.length > 0 ? (
                <DataTable
                  columns={historyColumns}
                  data={data.history}
                  emptyMessage="No reconciliation records yet"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-white/40">
                  <Scale className="w-12 h-12 mb-3" />
                  <p>No reconciliation history</p>
                  <p className="text-sm">Records will appear after each reconciliation check</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
