'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  Database,
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Table,
  Clock,
  Sparkle
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sql?: string;
  explanation?: string;
  rows?: Record<string, unknown>[];
  rowCount?: number;
  timestamp: Date;
}

interface Suggestion {
  query: string;
  category: string;
}

const SUGGESTED_QUERIES: Suggestion[] = [
  { query: 'Show all open support tickets', category: 'tickets' },
  { query: 'Show recent error logs', category: 'logs' },
  { query: 'Show pending transactions', category: 'transactions' },
  { query: 'Show active user flags', category: 'users' },
  { query: 'Show pending reports', category: 'reports' },
];

const CATEGORY_COLORS: Record<string, string> = {
  tickets: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  logs: 'bg-red-500/20 text-red-400 border-red-500/30',
  transactions: 'bg-green-500/20 text-green-400 border-green-500/30',
  users: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  reports: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  cancellations: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  finance: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export default function AIDatabasePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI database assistant. I can help you query your database using natural language. For example, you can ask me things like "Show all open support tickets" or "Display recent error logs".',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/ai/db-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          execute: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute query');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.explanation || 'Here are the results:',
        sql: data.sql,
        explanation: data.explanation,
        rows: data.rows || [],
        rowCount: data.rowCount || 0,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to execute query'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInput(query);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2]">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Database Assistant</h1>
              <p className="text-white/60">Query your database using natural language</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
            <Sparkle className="w-4 h-4" />
            <span className="text-sm font-medium">MiniMax M2.7</span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* Message Header */}
                <div className="flex items-center gap-3">
                  {message.role === 'user' ? (
                    <div className="p-2 rounded-lg bg-[#667eea]">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-white/60">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                  <span className="text-xs text-white/30">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                {/* Message Content */}
                <div className="pl-11">
                  <p className="text-white/90 leading-relaxed">{message.content}</p>
                </div>

                {/* SQL Query (if present) */}
                {message.sql && (
                  <div className="pl-11 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Generated SQL</span>
                      <button
                        onClick={() => copyToClipboard(message.sql!, `sql-${message.id}`)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                      >
                        {copiedId === `sql-${message.id}` ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span className="text-xs">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-xs">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 rounded-lg bg-black/40 border border-white/10 overflow-x-auto">
                      <code className="text-sm text-green-400 font-mono">{message.sql}</code>
                    </pre>
                  </div>
                )}

                {/* Data Table (if present) */}
                {message.rows && message.rows.length > 0 && (
                  <div className="pl-11 mt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Table className="w-4 h-4 text-white/40" />
                      <span className="text-sm text-white/60">
                        {message.rowCount} row{message.rowCount !== 1 ? 's' : ''} returned
                      </span>
                    </div>
                    <div className="rounded-lg border border-white/10 overflow-hidden">
                      <div className="overflow-x-auto max-h-[300px]">
                        <table className="w-full">
                          <thead className="bg-white/5 sticky top-0">
                            <tr>
                              {Object.keys(message.rows[0]).map((col) => (
                                <th
                                  key={col}
                                  className="px-4 py-2 text-left text-xs font-medium text-white/60 uppercase tracking-wider"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {message.rows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02]">
                                {Object.values(row).map((val, i) => (
                                  <td
                                    key={i}
                                    className="px-4 py-2 text-sm text-white/80 max-w-[200px] truncate"
                                    title={renderCellValue(val)}
                                  >
                                    {renderCellValue(val)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2]">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white/60">AI Assistant</span>
                </div>
                <div className="pl-11 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#667eea] animate-spin" />
                  <span className="text-white/60">Analyzing query...</span>
                </div>
              </div>
            )}

            {/* Suggestions (when no messages or first interaction) */}
            {showSuggestions && messages.length === 1 && (
              <div className="mt-6">
                <p className="text-sm text-white/40 mb-3">Try these queries:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUERIES.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/80 hover:text-white"
                    >
                      <Sparkles className="w-4 h-4 text-[#667eea]" />
                      {suggestion.query}
                      <ArrowRight className="w-4 h-4 text-white/40" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your database..."
                  className="w-full px-4 py-3 pl-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] transition-colors"
                  disabled={loading}
                />
                <Database className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm text-blue-400 font-medium">Security Note</p>
            <p className="text-sm text-white/60">
              This AI assistant only generates SELECT queries. All generated SQL is validated before execution.
              Only data retrieval operations are allowed to protect your database.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}