'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import StatsCard from '@/components/admin/base/StatsCard';
import DataTable, { Column } from '@/components/admin/base/DataTable';
import StatusBadge from '@/components/admin/base/StatusBadge';
import { Shield, Unlock, RotateCcw, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface EscrowRecord {
  id: string;
  amount: number;
  status: 'held' | 'released' | 'refunded' | 'cancelled';
  holdDate: string;
  releaseDate: string | null;
  appointmentId: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  pro: {
    id: string;
    name: string;
  } | null;
}

interface EscrowStats {
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  totalCancelled: number;
  heldCount: number;
  releasedCount: number;
  refundedCount: number;
  cancelledCount: number;
}

export default function EscrowPage() {
  const [escrowData, setEscrowData] = useState<EscrowRecord[]>([]);
  const [stats, setStats] = useState<EscrowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEscrowData();
  }, []);

  const fetchEscrowData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/finance/escrow');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEscrowData(data.escrow || []);
          setStats(data.stats);
        } else {
          setError(data.error || 'Failed to fetch escrow data');
        }
      } else {
        setError('Failed to fetch escrow data');
      }
    } catch (err) {
      console.error('Error fetching escrow data:', err);
      setError('Failed to fetch escrow data');
    } finally {
      setLoading(false);
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('cs-CZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const columns: Column<EscrowRecord>[] = [
    {
      key: 'serviceName',
      header: 'Appointment',
      render: (record) => (
        <div>
          <p className="text-white/90 font-medium">{record.serviceName || 'Unknown Service'}</p>
          <p className="text-white/50 text-xs">
            {formatDate(record.appointmentDate)} at {record.appointmentTime}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (record) => (
        <div>
          <p className="text-white/90">{record.customer?.name || 'Unknown'}</p>
          <p className="text-white/50 text-xs">{record.customer?.email || '-'}</p>
        </div>
      ),
    },
    {
      key: 'pro',
      header: 'Pro',
      render: (record) => (
        <p className="text-white/90">{record.pro?.name || 'Unknown'}</p>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: '140px',
      align: 'right',
      render: (record) => (
        <span className="font-semibold text-[#8b5cf6]">
          {formatCurrency(record.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '120px',
      render: (record) => (
        <StatusBadge 
          status={record.status} 
          size="sm"
          pulse={record.status === 'held'}
        />
      ),
    },
    {
      key: 'holdDate',
      header: 'Hold Date',
      width: '120px',
      render: (record) => (
        <span className="text-white/50 text-sm">{formatDate(record.holdDate)}</span>
      ),
    },
    {
      key: 'releaseDate',
      header: 'Release Date',
      width: '120px',
      render: (record) => (
        <span className={`text-sm ${record.releaseDate ? 'text-white/70' : 'text-white/30'}`}>
          {formatDate(record.releaseDate)}
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminNav />
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Escrow Management</h1>
            <p className="text-white/60">Track deposits and fund releases</p>
          </div>
          <button
            onClick={fetchEscrowData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="h-3 bg-white/10 rounded w-20 mb-2" />
                <div className="h-8 bg-white/10 rounded w-28 mt-3" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Held"
              value={formatCurrency(stats.totalHeld)}
              icon={Shield}
              color="#8b5cf6"
              description={`${stats.heldCount} active deposits`}
            />
            <StatsCard
              title="Released"
              value={formatCurrency(stats.totalReleased)}
              icon={Unlock}
              color="#10b981"
              description={`${stats.releasedCount} released`}
            />
            <StatsCard
              title="Refunded"
              value={formatCurrency(stats.totalRefunded)}
              icon={RotateCcw}
              color="#f59e0b"
              description={`${stats.refundedCount} refunded`}
            />
            <StatsCard
              title="Cancelled"
              value={formatCurrency(stats.totalCancelled)}
              icon={XCircle}
              color="#ef4444"
              description={`${stats.cancelledCount} cancelled`}
            />
          </div>
        ) : null}

        {/* Error State */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchEscrowData}
              className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Escrow Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8b5cf6]"></div>
                <h3 className="text-lg font-semibold text-white">Escrow Records</h3>
              </div>
              <span className="text-white/50 text-sm">
                {escrowData.length} records
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={escrowData}
              onRowClick={(record) => console.log('View escrow:', record.id)}
              emptyMessage="No escrow records found"
            />
          )}
        </div>
      </div>
    </>
  );
}
