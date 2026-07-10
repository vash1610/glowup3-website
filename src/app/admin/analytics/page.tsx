'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Users, TrendingUp, Eye, Flag, Loader2 } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import StatsCard from '@/components/admin/base/StatsCard';
import BetaBadge from '@/components/admin/base/BetaBadge';

interface AnalyticsData {
  registrationGrowth: Array<{ date: string; customers: number; professionals: number; total: number }>;
  totals: { totalCustomers: number; totalPros: number; newCustomersLast30d: number; newProsLast30d: number };
  engagement: {
    totalPageViews: number;
    uniqueSessions: number;
    avgDurationSeconds: number;
    topScreens: Array<{ screen_name: string; views: number }>;
    hasData: boolean;
  };
  flaggedUsers: { total: number; customers: number; professionals: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) {
          setError(json.error || 'Failed to load analytics');
          return;
        }
        setData(json);
      })
      .catch((err) => {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <BetaBadge />
            </div>
            <p className="text-white/60">Registration growth, engagement, and flagged users</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Customers" value={data.totals.totalCustomers} icon={Users} color="#667eea" description={`+${data.totals.newCustomersLast30d} in last 30d`} />
              <StatsCard title="Total Professionals" value={data.totals.totalPros} icon={TrendingUp} color="#10b981" description={`+${data.totals.newProsLast30d} in last 30d`} />
              <StatsCard title="Page Views (30d)" value={data.engagement.totalPageViews} icon={Eye} color="#f59e0b" description={`${data.engagement.uniqueSessions} sessions`} />
              <StatsCard title="Flagged Users" value={data.flaggedUsers.total} icon={Flag} color="#ef4444" description={`${data.flaggedUsers.customers} customers, ${data.flaggedUsers.professionals} pros`} />
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">Registration Growth</h3>
                <p className="text-sm text-white/50">New signups per day, last 30 days</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
                  <LineChart data={data.registrationGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelFormatter={(d) => new Date(d).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="customers" stroke="#667eea" strokeWidth={2} dot={false} name="Customers" />
                    <Line type="monotone" dataKey="professionals" stroke="#10b981" strokeWidth={2} dot={false} name="Professionals" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-white">Screen Engagement</h3>
                <BetaBadge />
              </div>
              <p className="text-sm text-white/50 mb-6">Most-viewed screens in the mobile app, last 30 days</p>

              {data.engagement.hasData ? (
                <div className="space-y-2">
                  {data.engagement.topScreens.map((screen) => (
                    <div key={screen.screen_name} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <span className="text-white/80 text-sm">{screen.screen_name}</span>
                      <span className="text-white font-medium">{screen.views} views</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40">
                  <p>No screen-view data yet.</p>
                  <p className="text-sm mt-1">
                    This starts populating once the app build with screen tracking reaches real users via TestFlight/App Store - not retroactive.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
