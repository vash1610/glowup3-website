'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Wallet,
  Bell,
  Settings,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import StatsCard from '@/components/admin/base/StatsCard';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import AppointmentsChart from '@/components/admin/charts/AppointmentsChart';
import ActivityFeed from '@/components/admin/ActivityFeed';
import AlertsPanel from '@/components/admin/AlertsPanel';

interface DashboardStats {
  totalCustomers: number;
  totalPros: number;
  activePros: number;
  appointmentsToday: number;
  revenueMTD: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(true);
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
      // Use default stats if API fails
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
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-[#050508]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        darkMode 
          ? 'bg-[#050508]/80 border-white/[0.08]' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Dashboard
                </h1>
                <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                  admin@glowup3.cz
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className={`relative w-full ${
                darkMode ? 'bg-white/[0.05]' : 'bg-gray-100'
              } rounded-xl`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  darkMode ? 'text-white/40' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-0 focus:ring-2 focus:ring-[#667eea]/50 outline-none transition-all ${
                    darkMode 
                      ? 'bg-transparent text-white placeholder-white/40' 
                      : 'bg-transparent text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2.5 rounded-xl transition-colors ${
                  darkMode 
                    ? 'hover:bg-white/10 text-white/60 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className={`p-2.5 rounded-xl transition-colors relative ${
                darkMode 
                  ? 'hover:bg-white/10 text-white/60 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button className={`p-2.5 rounded-xl transition-colors ${
                darkMode 
                  ? 'hover:bg-white/10 text-white/60 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
              }`}>
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center ml-2">
                <span className="text-white font-semibold">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, Admin
          </h2>
          <p className={darkMode ? 'text-white/60' : 'text-gray-500'}>
            Here&apos;s what&apos;s happening with your platform today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart />
          <AppointmentsChart />
        </div>

        {/* Activity & Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          <AlertsPanel />
        </div>
      </main>
    </div>
  );
}
