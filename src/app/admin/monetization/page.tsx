'use client';

import React, { useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';

type TransactionType = 'subscription' | 'commission' | 'withdrawal' | 'payout';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface MonetizationRecord {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
}

const mockData: MonetizationRecord[] = [
  { id: 'txn_001', date: '2024-01-15', amount: 2990, type: 'subscription', status: 'completed', description: 'Premium subscription - Studio Makeup Prague' },
  { id: 'txn_002', date: '2024-01-14', amount: 850, type: 'commission', status: 'completed', description: 'Service booking commission - Hair Styling' },
  { id: 'txn_003', date: '2024-01-14', amount: 1250, type: 'commission', status: 'pending', description: 'Service booking commission - Nail Art' },
  { id: 'txn_004', date: '2024-01-13', amount: 5000, type: 'payout', status: 'completed', description: 'Monthly payout - Michaela Nováková' },
  { id: 'txn_005', date: '2024-01-12', amount: 1990, type: 'subscription', status: 'completed', description: 'Standard subscription - Beauty Studio Brno' },
  { id: 'txn_006', date: '2024-01-11', amount: 450, type: 'commission', status: 'failed', description: 'Service booking commission - Eyebrow Design' },
  { id: 'txn_007', date: '2024-01-10', amount: 3500, type: 'payout', status: 'pending', description: 'Weekly payout - Anna Kováčová' },
  { id: 'txn_008', date: '2024-01-09', amount: 750, type: 'commission', status: 'completed', description: 'Service booking commission - Makeup Services' },
  { id: 'txn_009', date: '2024-01-08', amount: 2990, type: 'subscription', status: 'completed', description: 'Premium subscription - Glamour Salon Ostrava' },
  { id: 'txn_010', date: '2024-01-07', amount: 4200, type: 'withdrawal', status: 'pending', description: 'Platform withdrawal request' },
];

const statusColors = {
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeLabels = {
  subscription: 'Subscription',
  commission: 'Commission',
  withdrawal: 'Withdrawal',
  payout: 'Payout',
};

export default function MonetizationPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');

  const filteredData = mockData.filter((record) => {
    const typeMatch = typeFilter === 'all' || record.type === typeFilter;
    const statusMatch = statusFilter === 'all' || record.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const totalRevenue = mockData
    .filter((r) => r.status === 'completed' && (r.type === 'subscription' || r.type === 'commission'))
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingPayouts = mockData
    .filter((r) => r.type === 'payout' && r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  const pendingWithdrawals = mockData
    .filter((r) => r.type === 'withdrawal' && r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Monetization</h1>
          <p className="text-white/60">Subscription plans, pricing, and revenue streams</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold text-white mt-1">{totalRevenue.toLocaleString('cs-CZ')} CZK</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60 text-sm">Pending Payouts</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{pendingPayouts.toLocaleString('cs-CZ')} CZK</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/60 text-sm">Pending Withdrawals</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">{pendingWithdrawals.toLocaleString('cs-CZ')} CZK</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white/60 text-sm">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="commission">Commission</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="payout">Payout</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-white/60 text-sm">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Description</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-white/60 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white/80 text-sm font-mono">{record.id}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{record.date}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{record.description}</td>
                  <td className="px-4 py-3 text-white/80 text-sm">{typeLabels[record.type]}</td>
                  <td className="px-4 py-3 text-white font-medium">{record.amount.toLocaleString('cs-CZ')} CZK</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs border ${statusColors[record.status]}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-white/40">
              No transactions match your filters.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
