'use client';

import React from 'react';
import { AlertTriangle, CreditCard, UserX, Server } from 'lucide-react';

interface Alert {
  id: string;
  type: 'payment' | 'user' | 'system';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface AlertsPanelProps {
  alerts?: Alert[];
}

const getIconForType = (type: Alert['type']) => {
  switch (type) {
    case 'payment':
      return <CreditCard className="w-4 h-4" />;
    case 'user':
      return <UserX className="w-4 h-4" />;
    case 'system':
      return <Server className="w-4 h-4" />;
    default:
      return <AlertTriangle className="w-4 h-4" />;
  }
};

const getSeverityStyles = (severity: Alert['severity']) => {
  switch (severity) {
    case 'high':
      return {
        border: 'border-red-500/30',
        icon: 'text-red-400',
        bg: 'bg-red-400/10',
        badge: 'bg-red-400/20 text-red-400'
      };
    case 'medium':
      return {
        border: 'border-yellow-500/30',
        icon: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        badge: 'bg-yellow-400/20 text-yellow-400'
      };
    case 'low':
      return {
        border: 'border-blue-500/30',
        icon: 'text-blue-400',
        bg: 'bg-blue-400/10',
        badge: 'bg-blue-400/20 text-blue-400'
      };
    default:
      return {
        border: 'border-white/10',
        icon: 'text-white/60',
        bg: 'bg-white/5',
        badge: 'bg-white/10 text-white/60'
      };
  }
};

const getTypeIconColor = (type: Alert['type']) => {
  switch (type) {
    case 'payment':
      return 'text-orange-400';
    case 'user':
      return 'text-purple-400';
    case 'system':
      return 'text-cyan-400';
    default:
      return 'text-white/60';
  }
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const alertList = alerts || [];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Alerts & Warnings</h3>
          <p className="text-sm text-white/50">
            {alertList.filter(a => a.severity === 'high').length} critical issues need attention
          </p>
        </div>
        <div className="p-2 rounded-xl bg-red-400/10">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
      </div>
      
      <div className="space-y-3">
        {alertList.slice(0, 5).map((alert) => {
          const styles = getSeverityStyles(alert.severity);
          return (
            <div 
              key={alert.id}
              className={`p-4 rounded-xl border ${styles.border} ${styles.bg} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${styles.bg}`}>
                  <span className={getTypeIconColor(alert.type)}>
                    {getIconForType(alert.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white">
                      {alert.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">
                    {alert.description}
                  </p>
                </div>
                <span className="text-xs text-white/40 whitespace-nowrap">
                  {alert.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {alertList.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-400/10 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-white/60">All systems operational</p>
        </div>
      )}
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
