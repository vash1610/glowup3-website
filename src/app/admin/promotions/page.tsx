'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  Pause,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  TrendingUp,
  Eye as EyeIcon,
  MousePointer,
  Send,
  Calendar,
  ChevronDown,
  Filter
} from 'lucide-react';

type PromotionStatus = 'pending' | 'active' | 'paused' | 'completed' | 'rejected';

interface Promotion {
  id: string;
  title: string;
  owner: string;
  ownerEmail: string;
  type: 'carousel' | 'splash' | 'push' | 'interstitial';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: '1',
    title: 'Summer Beauty Sale 2024',
    owner: 'Beauty Studio Prague',
    ownerEmail: 'contact@beautystudio.cz',
    type: 'carousel',
    budget: 50000,
    spent: 32450,
    impressions: 125000,
    clicks: 3750,
    status: 'active',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    createdAt: '2024-05-28'
  },
  {
    id: '2',
    title: 'New Year Special - Hair Styling',
    owner: 'Elite Hair Salon',
    ownerEmail: 'info@elitehair.sk',
    type: 'splash',
    budget: 25000,
    spent: 18750,
    impressions: 89000,
    clicks: 2670,
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    createdAt: '2023-12-20'
  },
  {
    id: '3',
    title: 'Massage Therapy Week',
    owner: 'Wellness Center Brno',
    ownerEmail: 'bookings@wellnessbrno.cz',
    type: 'push',
    budget: 15000,
    spent: 8900,
    impressions: 45000,
    clicks: 1350,
    status: 'paused',
    startDate: '2024-05-15',
    endDate: '2024-06-15',
    createdAt: '2024-05-10'
  },
  {
    id: '4',
    title: 'Nail Art Collection Launch',
    owner: 'Glamour Nails',
    ownerEmail: 'hello@glamournails.com',
    type: 'interstitial',
    budget: 35000,
    spent: 35000,
    impressions: 156000,
    clicks: 4680,
    status: 'active',
    startDate: '2024-04-01',
    endDate: '2024-07-01',
    createdAt: '2024-03-25'
  },
  {
    id: '5',
    title: 'Yoga Studio Grand Opening',
    owner: 'Zen Yoga Prague',
    ownerEmail: 'welcome@zenyoga.cz',
    type: 'carousel',
    budget: 40000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    status: 'pending',
    startDate: '2024-07-01',
    endDate: '2024-09-01',
    createdAt: '2024-06-15'
  },
  {
    id: '6',
    title: 'Spa Weekend Deals',
    owner: 'Relaxation Spa',
    ownerEmail: 'offers@relaxationspa.cz',
    type: 'push',
    budget: 20000,
    spent: 12500,
    impressions: 67000,
    clicks: 2010,
    status: 'active',
    startDate: '2024-05-20',
    endDate: '2024-06-20',
    createdAt: '2024-05-18'
  },
  {
    id: '7',
    title: 'Fitness Challenge 2024',
    owner: 'PowerFit Gym',
    ownerEmail: 'train@powerfit.cz',
    type: 'splash',
    budget: 30000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    status: 'rejected',
    startDate: '2024-06-10',
    endDate: '2024-08-10',
    createdAt: '2024-06-05'
  },
  {
    id: '8',
    title: 'Dental Clinic Special',
    owner: 'Smile Dental Care',
    ownerEmail: 'appointments@smiledental.cz',
    type: 'interstitial',
    budget: 45000,
    spent: 28900,
    impressions: 98000,
    clicks: 2940,
    status: 'active',
    startDate: '2024-03-15',
    endDate: '2024-06-15',
    createdAt: '2024-03-10'
  },
  {
    id: '9',
    title: 'Pet Grooming Promo',
    owner: 'Happy Paws Salon',
    ownerEmail: 'book@happypaws.cz',
    type: 'carousel',
    budget: 12000,
    spent: 7200,
    impressions: 34000,
    clicks: 1020,
    status: 'completed',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    createdAt: '2024-01-25'
  },
  {
    id: '10',
    title: 'Photography Studio Session',
    owner: 'Capture Moments',
    ownerEmail: 'shots@capturemoments.cz',
    type: 'push',
    budget: 18000,
    spent: 18000,
    impressions: 78000,
    clicks: 2340,
    status: 'paused',
    startDate: '2024-04-15',
    endDate: '2024-05-15',
    createdAt: '2024-04-10'
  }
];

const statusFilters: { label: string; value: PromotionStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Rejected', value: 'rejected' },
];

const typeLabels: Record<Promotion['type'], string> = {
  carousel: 'Carousel',
  splash: 'Splash',
  push: 'Push Notification',
  interstitial: 'Interstitial',
};

const statusStyles: Record<PromotionStatus, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  paused: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function PromotionsOverviewPage() {
  const [promotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const [activeFilter, setActiveFilter] = useState<PromotionStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredPromotions = promotions.filter((promo) => {
    const matchesFilter = activeFilter === 'all' || promo.status === activeFilter;
    const matchesSearch =
      promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => p.status === 'active').length,
    pending: promotions.filter((p) => p.status === 'pending').length,
    totalBudget: promotions.reduce((acc, p) => acc + p.budget, 0),
    totalSpent: promotions.reduce((acc, p) => acc + p.spent, 0),
    totalImpressions: promotions.reduce((acc, p) => acc + p.impressions, 0),
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', minimumFractionDigits: 0 }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('cs-CZ').format(value);

  const getStatusBadge = (status: PromotionStatus) => {
    const style = statusStyles[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleAction = (action: string, promo: Promotion) => {
    console.log(`${action} action on promotion:`, promo.title);
    // Mock action handling
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions Overview</h1>
          <p className="text-white/60">Manage and monitor all promotional campaigns</p>
        </div>
        <button
          onClick={() => setLoading(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#667eea] hover:bg-[#5a6fd6] text-white font-medium transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Total Promos</span>
            <TrendingUp className="w-5 h-5 text-[#667eea]" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-white/40 mt-1">{stats.active} active</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Total Budget</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalBudget)}</p>
          <p className="text-xs text-white/40 mt-1">CZK</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Total Spent</span>
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</p>
          <p className="text-xs text-white/40 mt-1">{((stats.totalSpent / stats.totalBudget) * 100).toFixed(1)}% of budget</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Total Impressions</span>
            <EyeIcon className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatNumber(stats.totalImpressions)}</p>
          <p className="text-xs text-white/40 mt-1">views</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.value
                  ? 'bg-[#667eea] text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.label}
              {filter.value !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({promotions.filter((p) => filter.value === 'all' || p.status === filter.value).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search promotions by title, owner, or email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] transition-colors"
          />
        </div>
      </div>

      {/* Promotions Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px]">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Promotion</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Owner</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Budget / Spent</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Impressions</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-white/60">Dates</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-white/60">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredPromotions.map((promo) => (
              <tr key={promo.id} className="bg-white/5 hover:bg-white/[0.07] transition-colors">
                <td className="px-4 py-4">
                  <p className="text-white font-medium">{promo.title}</p>
                  <p className="text-white/40 text-xs mt-0.5">ID: {promo.id}</p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-white text-sm">{promo.owner}</p>
                  <p className="text-white/40 text-xs">{promo.ownerEmail}</p>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2.5 py-1 rounded-lg bg-[#667eea]/10 text-[#667eea] text-xs font-medium">
                    {typeLabels[promo.type]}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <p className="text-white text-sm font-medium">{formatCurrency(promo.budget)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className="h-full bg-[#667eea] rounded-full"
                        style={{ width: `${(promo.spent / promo.budget) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/40 text-xs">{formatCurrency(promo.spent)}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-white/60">
                      <EyeIcon className="w-4 h-4" />
                      {formatNumber(promo.impressions)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-white/60">
                      <MousePointer className="w-4 h-4" />
                      {formatNumber(promo.clicks)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">{getStatusBadge(promo.status)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 text-xs text-white/60">
                    <Calendar className="w-3 h-3" />
                    {promo.startDate} - {promo.endDate}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleAction('view', promo)}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {promo.status === 'active' && (
                      <button
                        onClick={() => handleAction('pause', promo)}
                        className="p-2 rounded-lg hover:bg-yellow-500/10 text-white/60 hover:text-yellow-400 transition-colors"
                        title="Pause"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {promo.status === 'paused' && (
                      <button
                        onClick={() => handleAction('resume', promo)}
                        className="p-2 rounded-lg hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400 transition-colors"
                        title="Resume"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {promo.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction('approve', promo)}
                          className="p-2 rounded-lg hover:bg-emerald-500/10 text-white/60 hover:text-emerald-400 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAction('reject', promo)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPromotions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <Filter className="w-16 h-16 mb-4" />
            <p className="text-lg">No promotions found</p>
            <p className="text-sm text-white/30 mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10">
        <p className="text-sm text-white/60">
          Showing {filteredPromotions.length} of {promotions.length} promotions
        </p>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>Total Budget: {formatCurrency(stats.totalBudget)}</span>
          <span>•</span>
          <span>Total Spent: {formatCurrency(stats.totalSpent)}</span>
          <span>•</span>
          <span>Total Impressions: {formatNumber(stats.totalImpressions)}</span>
        </div>
      </div>
    </div>
  );
}
