'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  DollarSign,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Star,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, Legend } from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  mrr: number;
}

interface SubscriptionTier {
  name: string;
  count: number;
  revenue: number;
  color: string;
}

const COLORS = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0a0f] border border-white/20 rounded-lg p-3">
        <p className="text-white font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-white/80 text-sm">
            {entry.name}: {formatCurrencyHelper(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function formatCurrencyHelper(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MonetizationPage() {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState({
    mrr: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    growthRate: 0,
  });
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);

  useEffect(() => {
    fetchMonetizationData();
  }, []);

  const fetchMonetizationData = async () => {
    setLoading(true);
    try {
      // Simulate data - in production, this would come from API
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mockRevenueData = months.map((month, index) => ({
        month,
        revenue: Math.floor(Math.random() * 50000) + 20000 + (index * 3000),
        mrr: Math.floor(Math.random() * 30000) + 15000 + (index * 2000),
      }));
      setRevenueData(mockRevenueData);

      setSummary({
        mrr: 28500,
        totalRevenue: 342000,
        activeSubscriptions: 156,
        churnRate: 2.4,
        growthRate: 12.5,
      });

      setTiers([
        { name: 'Basic', count: 45, revenue: 13500, color: '#667eea' },
        { name: 'Premium', count: 72, revenue: 21600, color: '#764ba2' },
        { name: 'Professional', count: 28, revenue: 14000, color: '#f59e0b' },
        { name: 'Enterprise', count: 11, revenue: 16500, color: '#10b981' },
      ]);
    } catch (error) {
      console.error('Error fetching monetization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalTierRevenue = tiers.reduce((sum, t) => sum + t.revenue, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monetization</h1>
          <p className="text-white/60">Revenue overview and subscription analytics</p>
        </div>
        <button
          onClick={fetchMonetizationData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/10 border border-[#667eea]/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#667eea] text-sm font-medium">Monthly Recurring Revenue</span>
            <TrendingUp className="w-5 h-5 text-[#667eea]" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(summary.mrr)}</p>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">+{summary.growthRate}%</span>
            <span className="text-white/60 text-sm ml-1">vs last month</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-green-400 text-sm font-medium">Total Revenue (YTD)</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-sm text-white/60 mt-2">Year to date</p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-blue-400 text-sm font-medium">Active Subscriptions</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white">{summary.activeSubscriptions}</p>
          <p className="text-sm text-white/60 mt-2">Subscribers</p>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/60 text-sm font-medium">Churn Rate</span>
            <TrendingDown className="w-5 h-5 text-white/40" />
          </div>
          <p className="text-3xl font-bold text-white">{summary.churnRate}%</p>
          <p className="text-sm text-white/60 mt-2">Monthly average</p>
        </div>
      </div>

      {/* MRR Chart */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">MRR Trend</h3>
            <p className="text-sm text-white/60">Monthly recurring revenue over time</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#667eea]" />
              <span className="text-sm text-white/60">MRR</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#764ba2]" />
              <span className="text-sm text-white/60">Revenue</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#764ba2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="month" 
                stroke="#ffffff40" 
                tick={{ fill: '#ffffff60', fontSize: 12 }}
              />
              <YAxis 
                stroke="#ffffff40" 
                tick={{ fill: '#ffffff60', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="mrr" 
                stroke="#667eea" 
                fillOpacity={1} 
                fill="url(#colorMrr)" 
                name="MRR"
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#764ba2" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Subscription Tiers</h3>
              <p className="text-sm text-white/60">Revenue by subscription level</p>
            </div>
            <PieChart className="w-5 h-5 text-white/40" />
          </div>

          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={tiers}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {tiers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#ffffff80' }}>{value}</span>}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Tier Details */}
          <div className="mt-4 space-y-3">
            {tiers.map((tier) => (
              <div key={tier.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-white">{tier.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium">{tier.count} users</span>
                  <span className="text-white/60 ml-3">{formatCurrency(tier.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Tier Bar Chart */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Revenue by Tier</h3>
              <p className="text-sm text-white/60">Monthly revenue contribution</p>
            </div>
            <BarChart3 className="w-5 h-5 text-white/40" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tiers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#ffffff40" 
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  tick={{ fill: '#ffffff60', fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} name="Revenue">
                  {tiers.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Total Tier Revenue</span>
              <span className="text-white font-bold text-lg">{formatCurrency(totalTierRevenue)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#667eea]/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#667eea]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Avg Revenue Per User</p>
              <p className="text-xl font-bold text-white">{formatCurrency(summary.mrr / summary.activeSubscriptions)}</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#764ba2]/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#764ba2]" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Upgrade Rate</p>
              <p className="text-xl font-bold text-white">8.3%</p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Net Revenue Retention</p>
              <p className="text-xl font-bold text-green-400">108%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
