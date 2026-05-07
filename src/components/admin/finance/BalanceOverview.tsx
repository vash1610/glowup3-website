'use client';

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import StatsCard from '../base/StatsCard';

interface BalanceData {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  monthlyChange: number;
  currency?: string;
}

interface BalanceOverviewProps {
  data: BalanceData;
  className?: string;
}

export default function BalanceOverview({ data, className = '' }: BalanceOverviewProps) {
  const {
    totalBalance,
    availableBalance,
    pendingBalance,
    monthlyChange,
    currency = 'CZK'
  } = data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const changeType = monthlyChange >= 0 ? 'positive' : 'negative';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatsCard
        title="Total Balance"
        value={formatCurrency(totalBalance)}
        change={monthlyChange}
        changeType={changeType}
        icon={Wallet}
        color="#667eea"
      />
      
      <StatsCard
        title="Available"
        value={formatCurrency(availableBalance)}
        icon={TrendingUp}
        color="#10b981"
        description="Ready for withdrawal"
      />
      
      <StatsCard
        title="Pending"
        value={formatCurrency(pendingBalance)}
        icon={TrendingDown}
        color="#f59e0b"
        description="Processing"
      />
      
      <StatsCard
        title="This Month"
        value={formatCurrency(totalBalance - pendingBalance)}
        icon={PiggyBank}
        color="#8b5cf6"
        description="Revenue collected"
      />
    </div>
  );
}
