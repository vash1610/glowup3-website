'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Wallet
} from 'lucide-react';
import StatsCard from '@/components/admin/base/StatsCard';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import AppointmentsChart from '@/components/admin/charts/AppointmentsChart';
import ActivityFeed from '@/components/admin/ActivityFeed';
import AlertsPanel from '@/components/admin/AlertsPanel';
import AdminNav from '@/components/admin/AdminNav';

interface DashboardStats {
  totalCustomers: number;
  totalPros: number;
  activePros: number;
  appointmentsToday: number;
  revenueMTD: number;
  revenueData: Array<{ date: string; revenue: number }>;
  appointmentsByStatus: Array<{ status: string; count: number; color: string }>;
  recentActivity: Array<{
    id: string;
    type: 'appointment' | 'user' | 'payment' | 'alert' | 'complete' | 'message';
    title: string;
    description: string;
    timestamp: string;
  }>;
  recentAlerts: Array<{
    id: string;
    type: 'payment' | 'user' | 'system';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load dashboard stats');
        setStats(null);
        return;
      }
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard stats');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <AdminNav />
      
      <div style={{ height: '64px' }} />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              Welcome back, Admin
            </h2>
            <p className="text-white/60">
              Here's what's happening with your platform today.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Customers"
              value={loading ? '-' : stats?.totalCustomers || 0}
              icon={Users}
              color="#667eea"
            />
            <StatsCard
              title="Active Professionals"
              value={loading ? '-' : `${stats?.activePros || 0}/${stats?.totalPros || 0}`}
              icon={UserCheck}
              color="#10b981"
            />
            <StatsCard
              title="Appointments Today"
              value={loading ? '-' : stats?.appointmentsToday || 0}
              icon={CalendarCheck}
              color="#f59e0b"
            />
            <StatsCard
              title="Revenue MTD"
              value={loading ? '-' : formatCurrency(stats?.revenueMTD || 0)}
              icon={Wallet}
              color="#8b5cf6"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={stats?.revenueData} />
            <AppointmentsChart data={stats?.appointmentsByStatus} />
          </div>

          {/* Activity & Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityFeed activities={stats?.recentActivity} />
            <AlertsPanel alerts={stats?.recentAlerts} />
          </div>
        </div>
      </div>
    </>
  );
}
