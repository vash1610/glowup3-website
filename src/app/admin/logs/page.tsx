'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface LogEntry {
  id: string;
  severity: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  stack_trace: string | null;
  context: Record<string, unknown> | null;
  created_at: string;
  source: string | null;
  user_id: string | null;
}

const SEVERITY_CONFIG = {
  error: { label: 'Error', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  warning: { label: 'Warning', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle },
  info: { label: 'Info', color: 'bg-blue-500/20 text-blue-400', icon: Info },
  debug: { label: 'Debug', color: 'bg-gray-500/20 text-gray-400', icon: AlertCircle },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<string>('today');

  useEffect(() => {
    fetchLogs();
  }, [filterSeverity, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSeverity !== 'all') {
        params.append('severity', filterSeverity);
      }
      params.append('limit', '100');
      
      const response = await fetch(`/api/admin/logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return log.message.toLowerCase().includes(query) ||
             (log.stack_trace?.toLowerCase().includes(query) ?? false);
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const severityCounts = {
    error: logs.filter(l => l.severity === 'error').length,
    warning: logs.filter(l => l.severity === 'warning').length,
    info: logs.filter(l => l.severity === 'info').length,
    debug: logs.filter(l => l.severity === 'debug').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Error Logs</h1>
          <p className="text-white/60">Monitor system errors and warnings</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(SEVERITY_CONFIG).map(([key, config]) => {
          const count = severityCounts[key as keyof typeof severityCounts];
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => setFilterSeverity(filterSeverity === key ? 'all' : key)}
              className={`p-4 rounded-xl border transition-all ${
                filterSeverity === key
                  ? `${config.color} border-current`
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${filterSeverity === key ? 'opacity-100' : 'opacity-60'}`} />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className={`text-sm mt-2 ${filterSeverity === key ? '' : 'text-white/60'}`}>
                {config.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
          />
        </div>

        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="all">All Severities</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
        </select>

        {/* Date Range */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <FileText className="w-16 h-16 mb-4" />
          <p>No logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const severityConfig = SEVERITY_CONFIG[log.severity];
            const Icon = severityConfig.icon;
            const isExpanded = expandedLogs.has(log.id);

            return (
              <div
                key={log.id}
                className={`rounded-xl border transition-all ${
                  log.severity === 'error'
                    ? 'border-red-500/30 bg-red-500/5'
                    : log.severity === 'warning'
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                {/* Log Header */}
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="w-full p-4 flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${severityConfig.color}`}>
                      <Icon className="w-3 h-3 inline mr-1" />
                      {severityConfig.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{log.message}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(log.created_at)}
                        </span>
                        {log.source && (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-xs">
                            {log.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {log.stack_trace && (
                    <span className={`text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  )}
                </button>

                {/* Expanded Stack Trace */}
                {isExpanded && log.stack_trace && (
                  <div className="px-4 pb-4">
                    <div className="p-4 rounded-lg bg-black/40 font-mono text-sm text-white/80 overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{log.stack_trace}</pre>
                    </div>
                    {log.context && (
                      <div className="mt-3">
                        <p className="text-xs text-white/40 mb-2">Context:</p>
                        <pre className="p-3 rounded-lg bg-black/40 font-mono text-xs text-white/80 overflow-x-auto">
                          {JSON.stringify(log.context, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
