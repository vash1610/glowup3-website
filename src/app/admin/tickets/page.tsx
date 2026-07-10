'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MessageSquare,
  Inbox,
  X,
  Users,
  Ticket,
  Flag,
  Ban,
  UserX,
  FileWarning,
  Eye,
  CheckCheck
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface Ticket {
  id: string;
  subject: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  ticket_type?: string;
  user_role?: 'customer' | 'professional';
  user_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  assigned_to?: string | null;
}

interface UserReport {
  id: string;
  reporter_id: string;
  reporter_role: 'customer' | 'professional';
  reported_id: string;
  reported_role: 'customer' | 'professional';
  report_type: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  appointment_id: string | null;
  conversation_id: string | null;
  evidence_urls: string[];
  status: 'pending' | 'resolved' | 'dismissed';
  admin_decision: string | null;
  admin_notes: string | null;
  action_taken: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  closed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400', icon: X },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', bg: 'bg-gray-500', border: 'border-gray-500' },
  medium: { label: 'Medium', bg: 'bg-blue-500', border: 'border-blue-500' },
  high: { label: 'High', bg: 'bg-orange-500', border: 'border-orange-500' },
  urgent: { label: 'Urgent', bg: 'bg-red-500', border: 'border-red-500' },
};

const REPORT_SEVERITY_CONFIG = {
  low: { label: 'Low', bg: 'bg-gray-500', border: 'border-gray-500' },
  medium: { label: 'Medium', bg: 'bg-yellow-500', border: 'border-yellow-500' },
  high: { label: 'High', bg: 'bg-orange-500', border: 'border-orange-500' },
  urgent: { label: 'Urgent', bg: 'bg-red-500', border: 'border-red-500' },
};

const REPORT_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400', icon: CheckCheck },
  dismissed: { label: 'Dismissed', color: 'bg-gray-500/20 text-gray-400', icon: X },
};

type SortField = 'created_at' | 'updated_at' | 'priority' | 'status';
type SortOrder = 'asc' | 'desc';
type TabType = 'tickets' | 'reports';

export default function TicketsPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabType>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
  });
  const [reportStats, setReportStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tickets') {
        const response = await fetch('/api/admin/tickets');
        const data = await response.json();
        
        if (data.tickets) {
          setTickets(data.tickets);
          const newStats = {
            total: data.tickets.length,
            open: data.tickets.filter((t: Ticket) => t.status === 'open').length,
            in_progress: data.tickets.filter((t: Ticket) => t.status === 'in_progress').length,
            resolved: data.tickets.filter((t: Ticket) => t.status === 'resolved').length,
            closed: data.tickets.filter((t: Ticket) => t.status === 'closed').length,
          };
          setStats(newStats);
        }
      } else {
        const response = await fetch('/api/admin/reports');
        const data = await response.json();
        
        if (data.reports) {
          setReports(data.reports);
          const newStats = {
            total: data.reports.length,
            pending: data.reports.filter((r: UserReport) => r.status === 'pending').length,
            resolved: data.reports.filter((r: UserReport) => r.status === 'resolved').length,
            dismissed: data.reports.filter((r: UserReport) => r.status === 'dismissed').length,
          };
          setReportStats(newStats);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter(ticket => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          ticket.subject.toLowerCase().includes(query) ||
          ticket.user_id.toLowerCase().includes(query) ||
          (ticket.ticket_type && ticket.ticket_type.toLowerCase().includes(query)) ||
          (ticket.description && ticket.description.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
        case 'updated_at':
          comparison = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          report.reporter_id.toLowerCase().includes(query) ||
          report.reported_id.toLowerCase().includes(query) ||
          report.report_type.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (statusFilter !== 'all' && report.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && (report.severity as string) !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'updated_at':
          if (a.reviewed_at && b.reviewed_at) {
            comparison = new Date(a.reviewed_at).getTime() - new Date(b.reviewed_at).getTime();
          }
          break;
        case 'priority':
          const severityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          comparison = severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const getTimeOpen = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return '1 day';
    return `${diffDays}d`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('cs-CZ', { day: '2-digit', month: 'short' });
    }
  };

  const hasActiveFilters = statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery !== '';

  const currentStats = activeTab === 'tickets' ? stats : reportStats;
  const currentConfig = activeTab === 'tickets' ? STATUS_CONFIG : REPORT_STATUS_CONFIG;

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <AdminNav />
      <div style={{ height: '64px' }} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTab === 'tickets' ? (
              <Ticket className="w-8 h-8 text-[#667eea]" />
            ) : (
              <Flag className="w-8 h-8 text-[#667eea]" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {activeTab === 'tickets' ? 'Support Tickets' : 'User Reports'}
              </h1>
              <p className="text-sm text-white/60">
                {activeTab === 'tickets' ? 'Manage customer support requests' : 'Review user-submitted reports'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'tickets'
                ? 'bg-[#667eea] text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Ticket className="w-4 h-4" />
            Support Tickets
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {stats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'reports'
                ? 'bg-[#667eea] text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <FileWarning className="w-4 h-4" />
            User Reports
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
              {reportStats.pending}
            </span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`p-4 rounded-xl border transition-all ${
              statusFilter === 'all' 
                ? 'bg-white/10 border-[#667eea]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 text-white/60 mb-1">
              <Inbox className="w-4 h-4" />
              <span className="text-sm">Total</span>
            </div>
            <p className="text-2xl font-bold text-white">{currentStats.total}</p>
          </button>
          
          {Object.entries(currentConfig).map(([key, config]) => {
            const Icon = config.icon;
            const count = currentStats[key as keyof typeof currentStats];
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                className={`p-4 rounded-xl border transition-all ${
                  statusFilter === key 
                    ? `${config.color.replace('/20', '/30')} border-current` 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className={`flex items-center gap-2 mb-1 ${statusFilter === key ? '' : 'text-white/60'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{config.label}</span>
                </div>
                <p className={`text-2xl font-bold ${statusFilter === key ? '' : 'text-white'}`}>{count}</p>
              </button>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder={activeTab === 'tickets' 
                ? "Search tickets by title, email, or category..." 
                : "Search reports by user ID, type, or description..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 text-white/60"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-[#667eea]/20 border-[#667eea] text-white'
                : 'bg-white/5 border-white/10 text-white/80 hover:border-white/20'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#667eea]" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-white/60 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(currentConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-white/60 mb-2">
                  {activeTab === 'tickets' ? 'Priority' : 'Severity'}
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  <option value="all">All Priorities</option>
                  {Object.entries(activeTab === 'tickets' ? PRIORITY_CONFIG : REPORT_SEVERITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-white/60 mb-2">Sort By</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  <option value="created_at">Created Date</option>
                  <option value="updated_at">Last Updated</option>
                  <option value="priority">{activeTab === 'tickets' ? 'Priority' : 'Severity'}</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-white/60">
          <p>
            Showing {activeTab === 'tickets' ? filteredTickets.length : filteredReports.length} of {activeTab === 'tickets' ? tickets.length : reports.length} {activeTab === 'tickets' ? 'tickets' : 'reports'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setSearchQuery('');
              }}
              className="text-[#667eea] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Content based on tab */}
        {activeTab === 'tickets' ? (
          /* Tickets List */
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Inbox className="w-16 h-16 mb-4" />
              <p className="text-lg">No support tickets yet</p>
              <p className="text-sm text-white/30 mt-1">Customer tickets will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const statusConfig = STATUS_CONFIG[ticket.status];
                const priorityConfig = PRIORITY_CONFIG[ticket.priority];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <button
                    key={ticket.id}
                    onClick={() => router.push(`/admin/tickets/${ticket.id}`)}
                    className="w-full text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-full min-h-[80px] rounded-full ${priorityConfig.bg}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusConfig.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bg} text-white`}>
                              {priorityConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-white/40">
                            {ticket.message_count > 0 && (
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {ticket.message_count}
                              </span>
                            )}
                            <span>{formatDate(ticket.created_at)}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-white font-medium mb-2 group-hover:text-[#667eea] transition-colors">
                          {ticket.subject}
                        </h3>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-white/60">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {ticket.user_id}
                            </span>
                            {ticket.ticket_type && (
                              <span className="px-2 py-0.5 rounded bg-white/5 text-white/60">
                                {ticket.ticket_type.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-white/40">
                            <Clock className="w-4 h-4" />
                            <span>Open for {getTimeOpen(ticket.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          /* User Reports List */
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <FileWarning className="w-16 h-16 mb-4" />
              <p className="text-lg">No user reports yet</p>
              <p className="text-sm text-white/30 mt-1">User submitted reports will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const statusConfig = REPORT_STATUS_CONFIG[report.status];
                const severityConfig = REPORT_SEVERITY_CONFIG[report.severity as keyof typeof REPORT_SEVERITY_CONFIG];
                const StatusIcon = statusConfig.icon;
                
                return (
                  <button
                    key={report.id}
                    onClick={() => router.push(`/admin/reports/${report.id}`)}
                    className="w-full text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-full min-h-[100px] rounded-full ${severityConfig.bg}`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {statusConfig.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityConfig.bg} text-white`}>
                              {severityConfig.label}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                              {report.report_type.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-sm text-white/40">
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-white mb-3">{report.description}</p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
                                Reporter
                              </span>
                              <span className="text-white/60 font-mono text-xs">
                                {report.reporter_id}
                              </span>
                              <span className="text-white/40 text-xs">
                                ({report.reporter_role})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                                Reported
                              </span>
                              <span className="text-white/60 font-mono text-xs">
                                {report.reported_id}
                              </span>
                              <span className="text-white/40 text-xs">
                                ({report.reported_role})
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/users?userId=${report.reported_id}`);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3 h-3" />
                              View
                            </span>
                          </div>
                        </div>
                        
                        {report.admin_notes && (
                          <div className="mt-3 p-3 rounded bg-white/5 border border-white/10">
                            <p className="text-xs text-white/40 mb-1">Admin Notes:</p>
                            <p className="text-sm text-white/80">{report.admin_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
