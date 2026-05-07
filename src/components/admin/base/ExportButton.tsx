'use client';

import React, { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, ChevronDown, Check } from 'lucide-react';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename?: string;
  className?: string;
}

type ExportFormat = 'csv' | 'json';

const formatOptions: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { format: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
  { format: 'json', label: 'JSON', icon: <FileJson className="w-4 h-4" /> },
];

export default function ExportButton({ data, filename = 'export', className = '' }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null);

  const exportData = (format: ExportFormat) => {
    setExporting(true);
    setExportedFormat(null);

    setTimeout(() => {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      } else {
        // CSV export
        if (data.length === 0) {
          content = '';
        } else {
          const headers = Object.keys(data[0]);
          const rows = data.map(row => 
            headers.map(h => {
              const val = row[h];
              const str = val === null || val === undefined ? '' : String(val);
              // Escape quotes and wrap in quotes if contains comma, quote, or newline
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            }).join(',')
          );
          content = [headers.join(','), ...rows].join('\n');
        }
        mimeType = 'text/csv';
        extension = 'csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportedFormat(format);
      setTimeout(() => {
        setIsOpen(false);
        setExporting(false);
      }, 1000);
    }, 300);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting || data.length === 0}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white hover:bg-white/[0.05] disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
      >
        <Download className="w-4 h-4" />
        <span>{exporting ? 'Exporting...' : 'Export'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 py-2 bg-[#0a0a0f] border border-white/[0.08] rounded-xl shadow-xl z-50 min-w-[150px]">
          {formatOptions.map((opt) => (
            <button
              key={opt.format}
              onClick={() => exportData(opt.format)}
              disabled={exporting}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-50"
            >
              {opt.icon}
              <span>{opt.label}</span>
              {exportedFormat === opt.format && (
                <Check className="w-4 h-4 text-green-400 ml-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
