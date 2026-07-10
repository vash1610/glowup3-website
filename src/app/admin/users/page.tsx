'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Lock
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface UserRecord {
  id: string;
  email: string;
  full_name: string | null;
  display_name?: string | null;
  phone: string | null;
  user_type: 'customer' | 'professional';
  is_locked: boolean;
  is_flagged: boolean;
  flag_reason: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  booking_count?: number;
  wallet_balance?: number | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Mock data with 20 users
const MOCK_USERS: UserRecord[] = [
  { id: '1', email: 'sarah.johnson@email.com', full_name: 'Sarah Johnson', phone: '+420 123 456 789', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2024-01-15T10:30:00Z', updated_at: '2024-01-15T10:30:00Z', booking_count: 12, wallet_balance: 1500 },
  { id: '2', email: 'mike.wilson@email.com', full_name: 'Mike Wilson', phone: '+420 234 567 890', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Brno', created_at: '2024-02-20T14:45:00Z', updated_at: '2024-02-20T14:45:00Z', booking_count: 5, wallet_balance: 750 },
  { id: '3', email: 'anna.martinez@email.com', full_name: 'Anna Martinez', phone: '+420 345 678 901', user_type: 'professional', is_locked: true, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2023-11-08T09:15:00Z', updated_at: '2024-03-01T11:20:00Z', booking_count: 45, wallet_balance: 12500 },
  { id: '4', email: 'james.brown@email.com', full_name: 'James Brown', phone: '+420 456 789 012', user_type: 'customer', is_locked: false, is_flagged: true, flag_reason: 'Suspicious booking pattern detected', location: 'Ostrava', created_at: '2024-01-28T16:00:00Z', updated_at: '2024-02-14T08:30:00Z', booking_count: 8, wallet_balance: 0 },
  { id: '5', email: 'lisa.chen@email.com', full_name: 'Lisa Chen', phone: '+420 567 890 123', user_type: 'professional', is_locked: false, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2023-08-22T11:30:00Z', updated_at: '2024-01-05T15:45:00Z', booking_count: 89, wallet_balance: 45000 },
  { id: '6', email: 'david.kumar@email.com', full_name: 'David Kumar', phone: '+420 678 901 234', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Plzen', created_at: '2024-03-10T08:00:00Z', updated_at: '2024-03-10T08:00:00Z', booking_count: 2, wallet_balance: 200 },
  { id: '7', email: 'emma.davis@email.com', full_name: 'Emma Davis', phone: '+420 789 012 345', user_type: 'professional', is_locked: false, is_flagged: true, flag_reason: 'Multiple complaint reports', location: 'Brno', created_at: '2023-06-14T13:20:00Z', updated_at: '2024-02-28T10:00:00Z', booking_count: 67, wallet_balance: 8900 },
  { id: '8', email: 'robert.taylor@email.com', full_name: 'Robert Taylor', phone: '+420 890 123 456', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2024-02-05T10:15:00Z', updated_at: '2024-02-05T10:15:00Z', booking_count: 15, wallet_balance: 3200 },
  { id: '9', email: 'maria.garcia@email.com', full_name: 'Maria Garcia', phone: '+420 901 234 567', user_type: 'customer', is_locked: true, is_flagged: false, flag_reason: null, location: 'Olomouc', created_at: '2023-12-01T17:30:00Z', updated_at: '2024-01-20T09:45:00Z', booking_count: 3, wallet_balance: 450 },
  { id: '10', email: 'thomas.anderson@email.com', full_name: 'Thomas Anderson', phone: '+420 012 345 678', user_type: 'professional', is_locked: false, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2023-09-18T14:00:00Z', updated_at: '2024-02-10T16:30:00Z', booking_count: 112, wallet_balance: 67800 },
  { id: '11', email: 'jennifer.white@email.com', full_name: 'Jennifer White', phone: '+420 111 222 333', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Liberec', created_at: '2024-01-20T12:00:00Z', updated_at: '2024-01-20T12:00:00Z', booking_count: 6, wallet_balance: 1100 },
  { id: '12', email: 'chris.lee@email.com', full_name: 'Chris Lee', phone: '+420 222 333 444', user_type: 'professional', is_locked: true, is_flagged: true, flag_reason: 'Failed payment investigations', location: 'Hradec Kralove', created_at: '2023-07-25T09:45:00Z', updated_at: '2024-03-05T14:15:00Z', booking_count: 28, wallet_balance: 15600 },
  { id: '13', email: 'sophia.martini@email.com', full_name: 'Sophia Martini', phone: '+420 333 444 555', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2024-02-15T11:30:00Z', updated_at: '2024-02-15T11:30:00Z', booking_count: 9, wallet_balance: 890 },
  { id: '14', email: 'alex.petrov@email.com', full_name: 'Alex Petrov', phone: '+420 444 555 666', user_type: 'professional', is_locked: false, is_flagged: false, flag_reason: null, location: 'Pardubice', created_at: '2023-10-30T15:45:00Z', updated_at: '2024-01-25T10:20:00Z', booking_count: 56, wallet_balance: 34500 },
  { id: '15', email: 'olivia.black@email.com', full_name: 'Olivia Black', phone: '+420 555 666 777', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Zlin', created_at: '2024-03-01T08:30:00Z', updated_at: '2024-03-01T08:30:00Z', booking_count: 1, wallet_balance: 50 },
  { id: '16', email: 'daniel.harris@email.com', full_name: 'Daniel Harris', phone: '+420 666 777 888', user_type: 'professional', is_locked: false, is_flagged: true, flag_reason: 'Verification pending', location: 'Prague', created_at: '2024-01-08T13:00:00Z', updated_at: '2024-02-22T17:45:00Z', booking_count: 34, wallet_balance: 23400 },
  { id: '17', email: 'nina.rodriguez@email.com', full_name: 'Nina Rodriguez', phone: '+420 777 888 999', user_type: 'customer', is_locked: false, is_flagged: false, flag_reason: null, location: 'Jihlava', created_at: '2024-02-28T10:00:00Z', updated_at: '2024-02-28T10:00:00Z', booking_count: 4, wallet_balance: 600 },
  { id: '18', email: 'ryan.oconnor@email.com', full_name: 'Ryan O\'Connor', phone: '+420 888 999 000', user_type: 'professional', is_locked: false, is_flagged: false, flag_reason: null, location: 'Brno', created_at: '2023-11-12T12:30:00Z', updated_at: '2024-01-15T09:00:00Z', booking_count: 78, wallet_balance: 56700 },
  { id: '19', email: 'elena.popov@email.com', full_name: 'Elena Popov', phone: '+420 999 000 111', user_type: 'customer', is_locked: true, is_flagged: false, flag_reason: null, location: 'Usti nad Labem', created_at: '2023-08-05T16:15:00Z', updated_at: '2024-02-18T14:30:00Z', booking_count: 7, wallet_balance: 1800 },
  { id: '20', email: 'kevin.murphy@email.com', full_name: 'Kevin Murphy', phone: '+420 000 111 222', user_type: 'professional', is_locked: false, is_flagged: false, flag_reason: null, location: 'Prague', created_at: '2023-05-20T11:45:00Z', updated_at: '2024-03-02T08:15:00Z', booking_count: 134, wallet_balance: 89000 },
];

const USERS_PER_PAGE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'customers' | 'pros'>('customers');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

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
      params.append('page', '1');

      const response = await fetch(`/api/admin/users?${params}`);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
        setPagination(data.pagination || null);
        setUsingMockData(false);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching users, using mock data:', error);
      setUsers(MOCK_USERS);
      setPagination({
        page: 1,
        limit: 20,
        total: MOCK_USERS.length,
        totalPages: 1
      });
      setUsingMockData(true);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  // Map API fields to component fields
  const mapUserFields = (user: UserRecord | Record<string, unknown>): UserRecord => {
    const u = user as Record<string, unknown>;
    return {
      id: u.id as string,
      email: u.email as string,
      full_name: u.full_name as string | null,
      display_name: u.display_name as string | null,
      phone: u.phone as string | null,
      user_type: (u.user_type as 'customer' | 'professional') || 'customer',
      is_locked: (u.is_locked as boolean) || false,
      is_flagged: (u.is_flagged as boolean) || false,
      flag_reason: u.flag_reason as string | null,
      location: u.location as string | null,
      created_at: (u.created_at as string) || new Date().toISOString(),
      updated_at: (u.updated_at as string) || new Date().toISOString(),
      booking_count: u.booking_count as number,
      wallet_balance: u.wallet_balance as number | null,
    };
  };

  // Get computed status from is_locked and is_flagged
  const getUserStatus = (user: UserRecord): 'active' | 'locked' | 'flagged' | 'inactive' => {
    if (user.is_locked) return 'locked';
    if (user.is_flagged) return 'flagged';
    return 'active';
  };

  const filteredUsers = useMemo(() => {
    return users.map(mapUserFields).filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesTab = 
        activeTab === 'customers' ? user.user_type === 'customer' : user.user_type === 'professional';
      
      const matchesStatus = (() => {
        const status = getUserStatus(user);
        if (filterStatus === 'all') return true;
        return status === filterStatus;
      })();
      
      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [users, searchQuery, activeTab, filterStatus]);

  // Paginate filtered users
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const stats = {
    totalCustomers: users.map(mapUserFields).filter(u => u.user_type === 'customer').length,
    totalPros: users.map(mapUserFields).filter(u => u.user_type === 'professional').length,
    flaggedUsers: users.map(mapUserFields).filter(u => u.is_flagged).length,
    lockedUsers: users.map(mapUserFields).filter(u => u.is_locked).length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatWalletBalance = (balance: number | null | undefined) => {
    if (balance === null || balance === undefined) {
      return (
        <span className="text-white/30 text-sm">
          💰 —
        </span>
      );
    }
    return (
      <span className="text-white font-medium text-sm">
        💰 {balance.toLocaleString('cs-CZ')} CZK
      </span>
    );
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

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Users</h1>
            <p className="text-white/60">
              Manage customers and professionals
              {usingMockData && (
                <span className="ml-2 text-xs text-yellow-400">(Demo data)</span>
              )}
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => { setActiveTab('customers'); setFilterType('all'); setCurrentPage(1); }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#667eea] transition-colors text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Customers</span>
              <Users className="w-5 h-5 text-white/40" />
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalCustomers}</p>
          </button>

          <button
            onClick={() => { setActiveTab('pros'); setFilterType('all'); setCurrentPage(1); }}
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

        <div className="flex items-center gap-2 border-b border-white/10">
          <button
            onClick={() => { setActiveTab('customers'); setCurrentPage(1); }}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'customers' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Customers
            {activeTab === 'customers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
            )}
          </button>
          <button
            onClick={() => { setActiveTab('pros'); setCurrentPage(1); }}
            className={`px-4 py-3 font-medium transition-colors relative ${
              activeTab === 'pros' ? 'text-white' : 'text-white/60 hover:text-white'
            }`}
          >
            Professionals
            {activeTab === 'pros' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
            )}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

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
          <>
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-white/60">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-white/60 hidden md:table-cell">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-white/60 hidden lg:table-cell">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Wallet Balance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-white/60 hidden sm:table-cell">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-white/60">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {paginatedUsers.map((user) => {
                    const status = getUserStatus(user);
                    return (
                      <tr key={user.id} className="bg-white/5 hover:bg-white/10 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              user.user_type === 'professional' ? 'bg-[#667eea]/20' : 'bg-white/10'
                            }`}>
                              {user.full_name ? (
                                <span className="text-sm font-semibold text-white">
                                  {user.full_name.charAt(0).toUpperCase()}
                                </span>
                              ) : (
                                <User className="w-5 h-5 text-white/40" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">
                                {user.display_name || user.full_name || 'Unknown User'}
                              </p>
                              <p className="text-white/40 text-xs truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="flex flex-col gap-1 text-sm text-white/60">
                            {user.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          {user.location && (
                            <span className="flex items-center gap-1 text-sm text-white/60">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {formatWalletBalance(user.wallet_balance)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(status)}`}>
                              {status}
                            </span>
                            {status === 'flagged' && (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                            {status === 'locked' && (
                              <Lock className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          {user.flag_reason && (
                            <p className="text-xs text-yellow-400 mt-1 truncate max-w-[150px]" title={user.flag_reason}>
                              {user.flag_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="flex items-center gap-1 text-sm text-white/60">
                            <Calendar className="w-3 h-3" />
                            {formatDate(user.created_at)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.user_type === 'professional'
                                ? 'bg-[#667eea]/20 text-[#667eea]'
                                : 'bg-white/10 text-white/60'
                            }`}>
                              {user.user_type}
                            </span>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                            >
                              <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-white/60">
                Showing {((currentPage - 1) * USERS_PER_PAGE) + 1} to {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsLeft className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white/60" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#667eea] text-white'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronsRight className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
