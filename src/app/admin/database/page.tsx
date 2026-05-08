'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  RefreshCw,
  Table,
  FileJson,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface TableInfo {
  table_name: string;
  estimated_row_count: number;
}

interface Column {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
  column_default: string | null;
}

interface TableData {
  columns: Column[];
  rows: Record<string, unknown>[];
  totalCount: number;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function DatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState<string>('');
  const [tableDropOpen, setTableDropOpen] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable, currentPage, pageSize, sortColumn, sortDirection]);

  const fetchTables = async () => {
    setLoadingTables(true);
    try {
      const response = await fetch('/api/admin/tables');
      const data = await response.json();
      setTables(data.tables || []);
      if (data.tables?.length > 0 && !selectedTable) {
        setSelectedTable(data.tables[0].table_name);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
      if (sortColumn) {
        params.append('sort', sortColumn);
        params.append('direction', sortDirection);
      }
      if (searchQuery && searchColumn) {
        params.append('search', searchQuery);
        params.append('searchColumn', searchColumn);
      }

      const response = await fetch(`/api/admin/tables/${selectedTable}?${params}`);
      const data = await response.json();
      setTableData(data);
      setColumns(data.columns || []);
    } catch (error) {
      console.error('Error fetching table data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTableData();
  };

  const exportData = (format: 'csv' | 'json') => {
    if (!tableData?.rows) return;

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'json') {
      content = JSON.stringify(tableData.rows, null, 2);
      mimeType = 'application/json';
      filename = `${selectedTable}_export.json`;
    } else {
      const headers = columns.map(c => c.column_name).join(',');
      const rows = tableData.rows.map(row => 
        columns.map(c => {
          const val = row[c.column_name];
          if (val === null || val === undefined) return '';
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return String(val);
        }).join(',')
      );
      content = [headers, ...rows].join('\n');
      mimeType = 'text/csv';
      filename = `${selectedTable}_export.csv`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const totalPages = tableData ? Math.ceil(tableData.totalCount / pageSize) : 0;

  return (
    <>
      <AdminNav />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Database Viewer</h1>
            <p className="text-white/60">Browse and manage your database tables</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTableData()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative lg:w-80">
              <button
                onClick={() => setTableDropOpen(!tableDropOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Table className="w-5 h-5 text-white/60" />
                  <span>{selectedTable || 'Select a table'}</span>
                </div>
                <ChevronDown className="w-5 h-5 text-white/40" />
              </button>
              
              {tableDropOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0f] border border-white/10 rounded-xl shadow-xl max-h-80 overflow-y-auto z-10">
                  {tables.map((table) => (
                    <button
                      key={table.table_name}
                      onClick={() => {
                        setSelectedTable(table.table_name);
                        setTableDropOpen(false);
                        setCurrentPage(1);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${
                        selectedTable === table.table_name ? 'bg-white/10' : ''
                      }`}
                    >
                      <span className="text-white">{table.table_name}</span>
                      <span className="text-white/40 text-sm">
                        {table.estimated_row_count?.toLocaleString() || 0} rows
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
                />
              </div>
              {columns.length > 0 && (
                <select
                  value={searchColumn}
                  onChange={(e) => setSearchColumn(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
                >
                  <option value="">All columns</option>
                  {columns.map((col) => (
                    <option key={col.column_name} value={col.column_name}>
                      {col.column_name}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {tableData && tableData.rows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Export:</span>
            <button
              onClick={() => exportData('csv')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => exportData('json')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
          </div>
        ) : tableData && columns.length > 0 ? (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.column_name}
                        onClick={() => handleSort(col.column_name)}
                        className="px-4 py-3 text-left text-sm font-medium text-white/60 cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span>{col.column_name}</span>
                          <ArrowUpDown className={`w-4 h-4 ${sortColumn === col.column_name ? 'text-[#667eea]' : ''}`} />
                        </div>
                        <div className="text-xs text-white/30 mt-1">{col.data_type}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tableData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-white/40">
                        No data found
                      </td>
                    </tr>
                  ) : (
                    tableData.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        {columns.map((col) => (
                          <td
                            key={col.column_name}
                            className="px-4 py-3 text-sm text-white/80 max-w-xs truncate"
                            title={renderCellValue(row[col.column_name])}
                          >
                            {renderCellValue(row[col.column_name])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white/5">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/60">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, tableData.totalCount)} of {tableData.totalCount.toLocaleString()}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size} per page</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-white/60" />
                </button>
                <span className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <Database className="w-16 h-16 mb-4" />
            <p>Select a table to view its data</p>
          </div>
        )}
      </div>
    </>
  );
}