'use client';

import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Eye,
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  RefreshCw,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from 'lucide-react';

interface AnalyticsStats {
  totalRevenue: number;
  activePromos: number;
  totalImpressions: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueChange: number;
}

interface TopSpender {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  promoCount: number;
  lastPromo: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

const MOCK_ANALYTICS_STATS: AnalyticsStats = {
  totalRevenue: 2847500,
  activePromos: 8,
  totalImpressions: 1250000,
  thisMonthRevenue: 425800,
  lastMonthRevenue: 389200,
  revenueChange: 9.4,
};

const MOCK_TOP_SPENDERS: TopSpender[] = [
  {
    id: '1',
    name: 'Beauty Studio Prague',
    email: 'contact@beautystudio.cz',
    totalSpent: 185000,
    promoCount: 5,
    lastPromo: 'Summer Beauty Sale 2024',
  },
  {
    id: '2',
    name: 'Smile Dental Care',
    email: 'appointments@smiledental.cz',
    totalSpent: 142500,
    promoCount: 3,
    lastPromo: 'Dental Clinic Special',
  },
  {
    id: '3',
    name: 'Elite Hair Salon',
    email: 'info@elitehair.sk',
    totalSpent: 98500,
    promoCount: 4,
    lastPromo: 'New Year Special',
  },
  {
    id: '4',
    name: 'Zen Yoga Prague',
    email: 'welcome@zenyoga.cz',
    totalSpent: 76500,
    promoCount: 2,
    lastPromo: 'Yoga Studio Grand Opening',
  },
  {
    id: '5',
    name: 'PowerFit Gym',
    email: 'train@powerfit.cz',
    totalSpent: 65000,
    promoCount: 3,
    lastPromo: 'Fitness Challenge 2024',
  },
  {
    id: '6',
    name: 'Relaxation Spa',
    email: 'offers@relaxationspa.cz',
    totalSpent: 54000,
    promoCount: 2,
    lastPromo: 'Spa Weekend Deals',
  },
];

const MOCK_CHART_DATA: ChartDataPoint[] = [
  { label: 'Jan', value: 185000, secondaryValue: 165000 },
  { label: 'Feb', value: 210000, secondaryValue: 190000 },
  { label: 'Mar', value: 245000, secondaryValue: 220000 },
  { label: 'Apr', value: 198000, secondaryValue: 205000 },
  { label: 'May', value: 285000, secondaryValue: 250000 },
  { label: 'Jun', value: 320000, secondaryValue: 289000 },
  { label: 'Jul', value: 298000, secondaryValue: 275000 },
  { label: 'Aug', value: 356000, secondaryValue: 310000 },
  { label: 'Sep', value: 425000, secondaryValue: 378000 },
  { label: 'Oct', value: 389000, secondaryValue: 345000 },
  { label: 'Nov', value: 412000, secondaryValue: 368000 },
  { label: 'Dec', value: 445000, secondaryValue: 395000 },
];

const dateRangeOptions = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'This month', value: 'month' },
  { label: 'This quarter', value: 'quarter' },
  { label: 'This year', value: 'year' },
  { label: 'All time', value: 'all' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat('cs-CZ').format(value);

export default function PromotionsAnalyticsPage() {
  const [stats] = useState<AnalyticsStats>(MOCK_ANALYTICS_STATS);
  const [topSpenders] = useState<TopSpender[]>(MOCK_TOP_SPENDERS);
  const [chartData] = useState<ChartDataPoint[]>(MOCK_CHART_DATA);
  const [selectedRange, setSelectedRange] = useState('month');
  const [showRangeDropdown, setShowRangeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate chart max value for scaling
  const maxValue = Math.max(...chartData.map((d) => Math.max(d.value, d.secondaryValue || 0)));

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting analytics data...');
    // Mock export functionality
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Analytics</h1>
          <p className="text-white/60">Track promotion performance and revenue metrics</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRangeDropdown(!showRangeDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <Calendar className="w-4 h-4 text-white/60" />
              <span>{dateRangeOptions.find((r) => r.value === selectedRange)?.label}</span>
              <ChevronDown className="w-4 h-4 text-white/60" />
            </button>
            {showRangeDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1a1a24] border border-white/10 shadow-xl z-10 overflow-hidden">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedRange(option.value);
                      setShowRangeDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                      selectedRange === option.value
                        ? 'bg-[#667eea]/20 text-[#667eea]'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#667eea] hover:bg-[#5a6fd6] text-white font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl bg-[#667eea]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-white/60">Total Revenue</p>
              <div className="p-3 rounded-xl bg-[#667eea]/20">
                <Wallet className="w-6 h-6 text-[#667eea]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">+24.5%</span>
              <span className="text-white/40">vs last year</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl bg-[#10b981]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-white/60">Active Promos</p>
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stats.activePromos}</p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <span className="text-white/60">Currently running</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl bg-[#f59e0b]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-white/60">Total Impressions</p>
              <div className="p-3 rounded-xl bg-yellow-500/20">
                <Eye className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{formatNumber(stats.totalImpressions)}</p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <span className="text-white/60">All time views</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl bg-[#8b5cf6]" />
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-medium text-white/60">This Month</p>
              <div className="p-3 rounded-xl bg-violet-500/20">
                <DollarSign className="w-6 h-6 text-violet-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(stats.thisMonthRevenue)}</p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              {stats.revenueChange >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">+{stats.revenueChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">{stats.revenueChange}%</span>
                </>
              )}
              <span className="text-white/40">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h3 className="text-white font-semibold">Revenue Overview</h3>
              <p className="text-white/40 text-sm">Monthly revenue from promotions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#667eea]" />
                <span className="text-sm text-white/60">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                <span className="text-sm text-white/60">Last Year</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((data, index) => {
                const heightPercent = (data.value / maxValue) * 100;
                const secondaryHeightPercent = ((data.secondaryValue || 0) / maxValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center gap-1 h-52">
                      <div
                        className="w-4 bg-[#667eea]/70 hover:bg-[#667eea] rounded-t transition-colors cursor-pointer relative group"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-[#1a1a24] border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(data.value)}
                        </div>
                      </div>
                      <div
                        className="w-4 bg-emerald-500/50 rounded-t transition-colors cursor-pointer relative group"
                        style={{ height: `${secondaryHeightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40">{data.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Spenders */}
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h3 className="text-white font-semibold">Top Spenders</h3>
              <p className="text-white/40 text-sm">Highest spending promoters</p>
            </div>
            <Users className="w-5 h-5 text-white/40" />
          </div>
          <div className="divide-y divide-white/10">
            {topSpenders.map((spender, index) => (
              <div key={spender.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#667eea]/20 flex items-center justify-center text-[#667eea] font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{spender.name}</p>
                      <p className="text-white/40 text-xs">{spender.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(spender.totalSpent)}</p>
                    <p className="text-white/40 text-xs">{spender.promoCount} promos</p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/50 truncate">
                  Last: {spender.lastPromo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Performance Metrics</h3>
          <p className="text-white/40 text-sm">Key performance indicators for promotions</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">3.2%</p>
            <p className="text-white/60 text-sm mt-1">Avg. CTR</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 mb-3">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">₵0.18</p>
            <p className="text-white/60 text-sm mt-1">Avg. CPC</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-violet-500/20 mb-3">
              <Eye className="w-6 h-6 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">125K</p>
            <p className="text-white/60 text-sm mt-1">Total Impressions</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 mb-3">
              <Wallet className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">68%</p>
            <p className="text-white/60 text-sm mt-1">Budget Utilization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
