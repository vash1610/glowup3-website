'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Lock,
  CheckCircle
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  user_type: 'customer' | 'professional';
  status: 'active' | 'inactive' | 'locked' | 'flagged';
  created_at: string;
  updated_at: string;
  flag_reason: string | null;
  location: string | null;
  booking_count?: number;
}

const USER_TYPES = ['all', 'customer', 'professional'];
const STATUSES = ['all', 'active', 'inactive', 'locked', 'flagged'];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'customers' | 'pros'>('customers');

  useEffect(() => {
    fetchUsers();
  }, [filterType, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') params.append('type', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      params.append('limit', '100');

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesTab = 
        activeTab === 'customers' ? user.user_type === 'customer' : user.user_type === 'professional';
      
      return matchesSearch && matchesTab;
    });

  const stats = {
    totalCustomers: users.filter(u => u.user_type === 'customer').length,
    totalPros: users.filter(u => u.user_type === 'professional').length,
    flaggedUsers: users.filter(u => u.status === 'flagged').length,
    lockedUsers: users.filter(u => u.status === 'locked').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400';
      case 'locked':
        return 'bg-red-500/20 text-red-400';
      case 'flagged':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-white/10 text-white/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/60">Manage customers and professionals</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => { setActiveTab('customers'); setFilterType('all'); }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#667eea] transition-colors text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Customers</span>
            <Users className="w-5 h-5 text-white/40" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
        </button>

        <button
          onClick={() => { setActiveTab('pros'); setFilterType('all'); }}
          className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#667eea] transition-colors text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Professionals</span>
            <Shield className="w-5 h-5 text-white/40" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalPros}</p>
        </button>

        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-yellow-400 text-sm">Flagged</span>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.flaggedUsers}</p>
        </div>

        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 text-sm">Locked</span>
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.lockedUsers}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'customers'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Customers
          {activeTab === 'customers' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('pros')}
          className={`px-4 py-3 font-medium transition-colors relative ${
            activeTab === 'pros'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Professionals
          {activeTab === 'pros' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <Users className="w-16 h-16 mb-4" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="block p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  user.user_type === 'professional'
                    ? 'bg-[#667eea]/20'
                    : 'bg-white/10'
                }`}>
                  {user.name ? (
                    <span className="text-lg font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-6 h-6 text-white/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium truncate">
                      {user.name || 'Unnamed User'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                    {user.status === 'flagged' && (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    {user.status === 'locked' && (
                      <Lock className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </span>
                    )}
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(user.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    user.user_type === 'professional'
                      ? 'bg-[#667eea]/20 text-[#667eea]'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {user.user_type}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Flag Reason */}
              {user.flag_reason && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-400">{user.flag_reason}</p>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
