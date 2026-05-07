'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'admin';
  content: string;
  created_at: string;
}

interface TicketDetail {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email: string;
  user_name: string;
  assigned_to: string | null;
  messages: Message[];
}

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-blue-500/20 text-blue-400' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400' },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
  closed: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', bg: 'bg-gray-500', border: 'border-gray-500' },
  medium: { label: 'Medium', bg: 'bg-blue-500', border: 'border-blue-500' },
  high: { label: 'High', bg: 'bg-orange-500', border: 'border-orange-500' },
  urgent: { label: 'Urgent', bg: 'bg-red-500', border: 'border-red-500' },
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTicketDetail();
  }, [resolvedParams.id]);

  const fetchTicketDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets/${resolvedParams.id}`);
      const data = await response.json();
      setTicket(data.ticket || null);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !ticket) return;

    setSending(true);
    try {
      const response = await fetch(`/api/admin/tickets/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reply',
          content: replyContent,
          status: 'in_progress'
        }),
      });

      if (response.ok) {
        setReplyContent('');
        fetchTicketDetail();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!ticket) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/tickets/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTicketDetail();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-white/40">
        <AlertCircle className="w-16 h-16 mb-4" />
        <p>Ticket not found</p>
        <button
          onClick={() => router.push('/admin/tickets')}
          className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/tickets')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bg} text-white`}>
                {priorityConfig.label}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white">{ticket.title}</h1>
          </div>
        </div>

        {/* Status Controls */}
        <div className="flex items-center gap-2">
          <select
            value={ticket.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            disabled={updatingStatus}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none"
          >
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <User className="w-4 h-4" />
          <span>{ticket.user_name || ticket.user_email}</span>
          <span className="text-white/30">({ticket.user_email})</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Tag className="w-4 h-4" />
          <span>{ticket.category}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Clock className="w-4 h-4" />
          <span>Created: {formatDate(ticket.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <MessageSquare className="w-4 h-4" />
          <span>{ticket.messages?.length || 0} messages</span>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        {ticket.messages && ticket.messages.length > 0 ? (
          ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-xl ${
                message.sender_type === 'admin'
                  ? 'bg-[#667eea]/20 border border-[#667eea]/30 ml-8'
                  : 'bg-white/5 border border-white/10 mr-8'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    message.sender_type === 'admin'
                      ? 'bg-[#667eea] text-white'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {message.sender_type === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                  <span className="text-sm text-white/60">{message.sender_type === 'admin' ? 'Support Team' : ticket.user_email}</span>
                </div>
                <span className="text-xs text-white/40">{formatDate(message.created_at)}</span>
              </div>
              <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-white/40">
            <MessageSquare className="w-12 h-12 mx-auto mb-3" />
            <p>No messages yet</p>
          </div>
        )}
      </div>

      {/* Reply Composer */}
      <form onSubmit={handleSendReply} className="space-y-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Type your reply..."
            rows={4}
            className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs text-white/40">
              Reply as Admin Support Team
            </span>
            <button
              type="submit"
              disabled={!replyContent.trim() || sending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Reply
            </button>
          </div>
        </div>
      </form>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {ticket.status !== 'resolved' && (
          <button
            onClick={() => handleUpdateStatus('resolved')}
            disabled={updatingStatus}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Resolved
          </button>
        )}
        {ticket.status !== 'closed' && (
          <button
            onClick={() => handleUpdateStatus('closed')}
            disabled={updatingStatus}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Close Ticket
          </button>
        )}
      </div>
    </div>
  );
}
