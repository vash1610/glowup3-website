'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

const presets = [
  { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Yesterday', getValue: () => { 
    const d = new Date(); 
    d.setDate(d.getDate() - 1); 
    return { start: d, end: d }; 
  }},
  { label: 'Last 7 days', getValue: () => { 
    const end = new Date(); 
    const start = new Date(); 
    start.setDate(start.getDate() - 6); 
    return { start, end }; 
  }},
  { label: 'Last 30 days', getValue: () => { 
    const end = new Date(); 
    const start = new Date(); 
    start.setDate(start.getDate() - 29); 
    return { start, end }; 
  }},
  { label: 'This month', getValue: () => { 
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1); 
    return { start, end: new Date() }; 
  }},
  { label: 'Last month', getValue: () => { 
    const end = new Date(new Date().getFullYear(), new Date().getMonth(), 0); 
    const start = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1); 
    return { start, end }; 
  }},
];

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = 'Select date range',
  className = ''
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(viewDate);
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePresetClick = (preset: typeof presets[0]) => {
    const { start, end } = preset.getValue();
    onStartDateChange(start);
    onEndDateChange(end);
    setIsOpen(false);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    
    if (selecting === 'start') {
      onStartDateChange(clickedDate);
      setSelecting('end');
    } else {
      if (clickedDate < (startDate || new Date(0))) {
        onEndDateChange(startDate);
        onStartDateChange(clickedDate);
      } else {
        onEndDateChange(clickedDate);
      }
      setSelecting('start');
    }
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date >= startDate && date <= endDate;
  };

  const isStartDate = (day: number) => {
    if (!startDate) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date.toDateString() === startDate.toDateString();
  };

  const isEndDate = (day: number) => {
    if (!endDate) return false;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date.toDateString() === endDate.toDateString();
  };

  const clearDates = () => {
    onStartDateChange(null);
    onEndDateChange(null);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white hover:bg-white/[0.05] transition-all"
      >
        <Calendar className="w-4 h-4 text-white/40" />
        <span className={startDate || endDate ? 'text-white' : 'text-white/40'}>
          {startDate || endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : placeholder}
        </span>
        {(startDate || endDate) && (
          <button
            onClick={(e) => { e.stopPropagation(); clearDates(); }}
            className="ml-1 p-1 hover:bg-white/10 rounded"
          >
            <X className="w-3 h-3 text-white/40" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-[#0a0a0f] border border-white/[0.08] rounded-xl shadow-xl z-50 min-w-[300px]">
          <div className="flex gap-4 mb-4">
            {/* Presets */}
            <div className="w-36 border-r border-white/[0.08] pr-4">
              <p className="text-xs text-white/40 uppercase mb-2">Quick Select</p>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="w-full text-left px-2 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white/60" />
                </button>
                <span className="text-sm font-medium text-white">{monthName}</span>
                <button
                  onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-xs text-white/40 py-1">{d}</div>
                ))}
                {Array(firstDay).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array(daysInMonth).fill(null).map((_, i) => {
                  const day = i + 1;
                  const inRange = isInRange(day);
                  const isStart = isStartDate(day);
                  const isEnd = isEndDate(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`
                        w-8 h-8 text-sm rounded-lg transition-all
                        ${inRange ? 'bg-violet-500/20' : ''}
                        ${isStart || isEnd ? 'bg-violet-500 text-white' : 'hover:bg-white/10 text-white/80'}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-white/40 mt-3">
                {selecting === 'start' ? 'Select start date' : 'Select end date'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
