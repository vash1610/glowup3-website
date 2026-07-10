'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface AppointmentsChartProps {
  data?: Array<{
    status: string;
    count: number;
    color: string;
  }>;
}

export default function AppointmentsChart({ data }: AppointmentsChartProps) {
  const chartData = data || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white font-semibold text-lg">{label}</p>
          <p className="text-white/70 text-sm">
            {payload[0].value} appointments
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Appointments by Status</h3>
        <p className="text-sm text-white/50">Distribution of appointment statuses</p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer minWidth={0} minHeight={0} width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="status" 
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
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {chartData.map((item) => (
          <div key={item.status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-white/60">{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
