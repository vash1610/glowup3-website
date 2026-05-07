'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  color?: string;
  description?: string;
  onClick?: () => void;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = '#667eea',
  description,
  onClick
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="w-4 h-4" />;
    if (changeType === 'negative') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (changeType === 'positive') return 'text-green-400';
    if (changeType === 'negative') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.12] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/60 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {description && (
              <p className="text-sm text-white/40 mt-1">{description}</p>
            )}
          </div>
          {Icon && (
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
          )}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-3 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-white/40">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
