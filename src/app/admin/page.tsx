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
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({
        totalCustomers: 156,
        totalPros: 42,
        activePros: 38,
        appointmentsToday: 23,
        revenueMTD: 284500,
        activeSubscriptions: 89
      });
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Customers"
            value={loading ? '-' : stats?.totalCustomers || 0}
            change={12}
            changeType="positive"
            icon={Users}
            color="#667eea"
          />
          <StatsCard
            title="Active Professionals"
            value={loading ? '-' : `${stats?.activePros || 0}/${stats?.totalPros || 0}`}
            change={8}
            changeType="positive"
            icon={UserCheck}
            color="#10b981"
          />
          <StatsCard
            title="Appointments Today"
            value={loading ? '-' : stats?.appointmentsToday || 0}
            change={-3}
            changeType="negative"
            icon={CalendarCheck}
            color="#f59e0b"
          />
          <StatsCard
            title="Revenue MTD"
            value={loading ? '-' : formatCurrency(stats?.revenueMTD || 0)}
            change={24}
            changeType="positive"
            icon={Wallet}
            color="#8b5cf6"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <AppointmentsChart />
        </div>

        {/* Activity & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <AlertsPanel />
        </div>
      </div>
    </>
  );
}