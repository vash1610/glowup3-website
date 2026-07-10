'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface RevenueChartProps {
  data?: Array<{
    date: string;
    revenue: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = (data || []).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }),
  }));
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white/60 text-sm mb-1">{label}</p>
          <p className="text-white font-semibold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Revenue Overview</h3>
        <p className="text-sm text-white/50">Last 30 days revenue in CZK</p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#667eea" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#667eea"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
