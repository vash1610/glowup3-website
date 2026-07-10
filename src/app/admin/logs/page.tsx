'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface LogEntry {
  id: string;
  created_at: string;
  error_priority: 'critical' | 'high' | 'medium' | 'low' | null;
  category: string | null;
  message: string | null;
  error_code: string | null;
  resolved: boolean;
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const priorityDotColors: Record<string, string> = {
  critical: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-blue-400',
};

const formatTimestamp = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filterPriority !== 'all') params.set('priority', filterPriority);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load logs');
        setLogs([]);
        return;
      }

      setLogs(data.logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filterPriority, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">System Logs</h1>
          <p className="text-white/60">Monitor application events and errors</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-pink-500/50 sm:max-w-xs"
          />

          <div className="flex gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  filterPriority === priority
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-white/10 p-8 text-center text-white/40">
              No log entries found.
            </div>
          ) : (
            logs.map((log) => {
              const priority = log.error_priority || 'low';
              return (
                <div
                  key={log.id}
                  className="group flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                >
                  <div className={`mt-1 h-2 w-2 rounded-full ${priorityDotColors[priority] || 'bg-gray-400'}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[priority] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {priority}
                      </span>
                      {log.category && (
                        <span className="text-sm font-medium text-white/80">{log.category}</span>
                      )}
                      <span className="text-sm text-white/40">{formatTimestamp(log.created_at)}</span>
                      {log.resolved && (
                        <span className="rounded border border-green-500/30 bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60">{log.message || log.error_code || 'No message'}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
