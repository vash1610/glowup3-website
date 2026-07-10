'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Wallet,
  Clock,
  AlertTriangle,
  Lock,
  Unlock,
  Flag,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  CreditCard,
  History
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface Booking {
  id: string;
  service_name: string;
  status: string;
  date: string;
  professional_name: string;
  customer_name: string;
  total_price: number;
}

interface UserDetail {
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
  bio: string | null;
  avatar_url: string | null;
  wallet_balance: number | null;
  total_bookings?: number;
  completed_bookings?: number;
  ratings_count?: number;
  average_rating?: number;
  wallet_transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    created_at: string;
    description: string;
  }>;
  bookings?: Booking[];
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'bookings' | 'wallet' | 'history'>('info');

  useEffect(() => {
    fetchUserDetail();
  }, [resolvedParams.id]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}`);
      const data = await response.json();
      setUser(data.user || null);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlagUser = async (reason: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (response.ok) {
        fetchUserDetail();
      }
    } catch (error) {
      console.error('Error flagging user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLockUser = async (lock: boolean) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${resolvedParams.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lock }),
      });
      if (response.ok) {
        fetchUserDetail();
      }
    } catch (error) {
      console.error('Error locking user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Active' };
      case 'inactive':
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Inactive' };
      case 'locked':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Locked' };
      case 'flagged':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Flagged' };
      default:
        return { bg: 'bg-white/10', text: 'text-white/60', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <User className="w-16 h-16 mb-4" />
        <p>User not found</p>
        <button
          onClick={() => router.push('/admin/users')}
          className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        >
          Back to Users
        </button>
      </div>
    );
  }

  const statusConfig = getStatusBadge(user.status);

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <AdminNav />
      <div style={{ height: '64px' }} />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              user.user_type === 'professional'
                ? 'bg-[#667eea]/20'
                : 'bg-white/10'
            }`}>
              {user.name ? (
                <span className="text-xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-7 h-7 text-white/40" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.name || 'Unnamed User'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  user.user_type === 'professional'
                    ? 'bg-[#667eea]/20 text-[#667eea]'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {user.user_type}
                </span>
                {user.status === 'flagged' && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                {user.status === 'locked' && (
                  <Lock className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {user.status !== 'flagged' ? (
            <button
              onClick={() => {
                const reason = prompt('Enter flag reason:');
                if (reason) handleFlagUser(reason);
              }}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              <Flag className="w-4 h-4" />
              Flag User
            </button>
          ) : (
            <button
              onClick={() => handleFlagUser('')}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Unflag
            </button>
          )}
          
          {user.status !== 'locked' ? (
            <button
              onClick={() => handleLockUser(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Lock Account
            </button>
          ) : (
            <button
              onClick={() => handleLockUser(false)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <Unlock className="w-4 h-4" />
              Unlock
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10">
        {['info', 'bookings', 'wallet', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-3 font-medium transition-colors relative capitalize ${
              activeTab === tab
                ? 'text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm text-white/60">Email</p>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white/60">Phone</p>
                    <p className="text-white">{user.phone}</p>
                  </div>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-sm text-white/60">Location</p>
                    <p className="text-white">{user.location}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm text-white/60">Member Since</p>
                  <p className="text-white">{formatDate(user.created_at)}</p>
                </div>
              </div>
              {user.bio && (
                <div>
                  <p className="text-sm text-white/60 mb-1">Bio</p>
                  <p className="text-white">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{user.total_bookings || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <p className="text-sm text-white/60">Completed</p>
                <p className="text-2xl font-bold text-green-400">{user.completed_bookings || 0}</p>
              </div>
              {user.user_type === 'professional' && (
                <>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/60">Average Rating</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {user.average_rating ? user.average_rating.toFixed(1) : '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5">
                    <p className="text-sm text-white/60">Ratings Count</p>
                    <p className="text-2xl font-bold text-white">{user.ratings_count || 0}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Flag Reason */}
          {user.flag_reason && (
            <div className="lg:col-span-2 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400 font-medium">User Flagged</p>
                  <p className="text-white/80 mt-1">{user.flag_reason}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {user.bookings && user.bookings.length > 0 ? (
            user.bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{booking.service_name}</h4>
                    <p className="text-sm text-white/60">
                      {user.user_type === 'customer' 
                        ? `with ${booking.professional_name}`
                        : `for ${booking.customer_name}`
                      }
                    </p>
                    <p className="text-sm text-white/60">{formatDate(booking.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatCurrency(booking.total_price)}</p>
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-white/40">
              <FileText className="w-12 h-12 mb-3" />
              <p>No bookings found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Balance */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 border border-[#667eea]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Wallet Balance</p>
                <p className="text-4xl font-bold text-white">
                  {formatCurrency(user.wallet_balance || 0)}
                </p>
              </div>
              <Wallet className="w-12 h-12 text-[#667eea]" />
            </div>
          </div>

          {/* Transactions */}
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 bg-white/5">
              <h3 className="text-white font-medium">Recent Transactions</h3>
            </div>
            {user.wallet_transactions && user.wallet_transactions.length > 0 ? (
              <div className="divide-y divide-white/5">
                {user.wallet_transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white">{tx.description}</p>
                      <p className="text-sm text-white/60">{formatDate(tx.created_at)}</p>
                    </div>
                    <span className={`text-lg font-medium ${
                      tx.amount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-white/40">
                <CreditCard className="w-12 h-12 mx-auto mb-3" />
                <p>No wallet transactions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 bg-white/5">
            <h3 className="text-white font-medium">Activity History</h3>
          </div>
          <div className="p-12 text-center text-white/40">
            <History className="w-12 h-12 mx-auto mb-3" />
            <p>Activity history will be displayed here</p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
