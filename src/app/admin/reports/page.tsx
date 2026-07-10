'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Flag, Loader2 } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import DataTable, { Column } from '@/components/admin/base/DataTable';
import StatusBadge from '@/components/admin/base/StatusBadge';
import FilterBar from '@/components/admin/base/FilterBar';

interface Report {
  id: string;
  report_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  description: string;
  created_at: string;
  reporter: { id: string; full_name: string | null; email: string } | null;
  reported_user: { id: string; full_name: string | null; email: string } | null;
}

const severityToStatus: Record<Report['severity'], 'info' | 'warning' | 'error'> = {
  low: 'info',
  medium: 'warning',
  high: 'error',
  critical: 'error',
};

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/reports?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load reports');
        setReports([]);
        return;
      }

      setReports(data.reports || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports(1);
  }, [fetchReports]);

  const columns: Column<Report>[] = [
    {
      key: 'report_type',
      header: 'Type',
      render: (r) => <span className="text-white capitalize">{r.report_type.replace(/_/g, ' ')}</span>,
    },
    {
      key: 'reported_user',
      header: 'Reported',
      render: (r) => (
        <span className="text-white/70">{r.reported_user?.full_name || r.reported_user?.email || 'Unknown'}</span>
      ),
    },
    {
      key: 'reporter',
      header: 'Reported By',
      render: (r) => (
        <span className="text-white/50 text-sm">{r.reporter?.full_name || r.reporter?.email || 'Unknown'}</span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (r) => <StatusBadge status={severityToStatus[r.severity]} label={r.severity} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <StatusBadge
          status={r.status === 'resolved' ? 'completed' : r.status === 'dismissed' ? 'inactive' : 'pending'}
          label={r.status}
          size="sm"
        />
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (r) => <span className="text-white/40 text-sm">{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Flag className="w-6 h-6 text-white/60" />
          <div>
            <h1 className="text-2xl font-bold text-white">Reports</h1>
            <p className="text-white/60">User-submitted reports about other users</p>
          </div>
        </div>

        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search visible reports by description..."
          filters={[
            {
              key: 'status',
              label: 'Status',
              value: statusFilter,
              options: [
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Reviewing', value: 'reviewing' },
                { label: 'Resolved', value: 'resolved' },
                { label: 'Dismissed', value: 'dismissed' },
              ],
              onChange: setStatusFilter,
            },
          ]}
        />

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={search ? reports.filter((r) => r.description?.toLowerCase().includes(search.toLowerCase())) : reports}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => fetchReports(page)}
            onRowClick={(r) => router.push(`/admin/reports/${r.id}`)}
            emptyMessage="No reports found"
          />
        )}
      </div>
    </>
  );
}
