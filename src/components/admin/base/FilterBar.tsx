'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  onClearFilters?: () => void;
  className?: string;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  onClearFilters,
  className = ''
}: FilterBarProps) {
  const hasActiveFilters = filters.some(f => f.value !== 'all');
  const activeFilterCount = filters.filter(f => f.value !== 'all').length;

  return (
    <div className={`flex flex-col lg:flex-row gap-3 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-white/50">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
          </div>

          {filters.map((filter) => (
            <select
              key={filter.key}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all cursor-pointer hover:bg-white/[0.05]"
            >
              <option value="all" className="bg-[#0a0a0f]">All {filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {hasActiveFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
