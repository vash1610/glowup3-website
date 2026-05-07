'use client';

import React, { useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
  disabled?: boolean;
}

interface TabsNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function TabsNav({ tabs, activeTab, onTabChange, className = '' }: TabsNavProps) {
  const indicatorRef = useRef<HTMLSpanElement>(null);

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.08] overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap
                ${tab.disabled 
                  ? 'text-white/30 cursor-not-allowed' 
                  : isActive 
                    ? 'text-white' 
                    : 'text-white/50 hover:text-white'
                }
              `}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`
                  px-1.5 py-0.5 text-xs rounded-full
                  ${isActive 
                    ? 'bg-violet-500 text-white' 
                    : 'bg-white/10 text-white/60'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TabPanelProps {
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ isActive, children, className = '' }: TabPanelProps) {
  if (!isActive) return null;
  
  return (
    <div className={className}>
      {children}
    </div>
  );
}
