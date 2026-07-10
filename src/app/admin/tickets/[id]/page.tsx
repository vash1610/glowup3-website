'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  MessageSquare,
  Info,
  RotateCcw,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import { BetaBadge } from '@/components/admin/base';

interface Message {
  id: string;
  sender_id: string;
  sender_type: 'customer' | 'admin' | 'system';
  content: string;
  created_at: string;
}

interface AiDraft {
  id: string;
  ticket_id: string;
  diagnosis: string;
  can_resolve: boolean;
  draft_reply: string | null;
  escalation_reason: string | null;
  status: 'pending' | 'approved' | 'discarded';
  created_at: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  description?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  ticket_type?: string;
  user_role?: 'customer' | 'professional';
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;
  user_id: string;
  user_name: string | null;
  assigned_to: string | null;
  messages: Message[];
  resolution_note?: string;
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

// Workflow instructions content
const WORKFLOW_INSTRUCTIONS = (
  <div className="space-y-4 text-white/80">
    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
      <h4 className="text-blue-400 font-semibold mb-2">🟢 Mark as Resolved</h4>
      <p>When marking a ticket as resolved, you must describe what was done to fix the issue. This resolution note is saved and shown in the ticket.</p>
      <p className="mt-2 text-sm text-white/60">The ticket stays in "resolved" status for 3 days before auto-closing. Customer and support can still chat during this period.</p>
    </div>
    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
      <h4 className="text-yellow-400 font-semibold mb-2">🔄 Reopen Ticket</h4>
      <p>If the issue persists or customer reports a new problem, you can reopen a resolved ticket to "In Progress" status.</p>
    </div>
    <div className="p-4 rounded-xl bg-gray-500/10 border border-gray-500/20">
      <h4 className="text-gray-400 font-semibold mb-2">🔴 Close Ticket</h4>
      <p>Closing a ticket permanently ends the conversation. The customer cannot reply or reopen it - they must create a new ticket for further assistance.</p>
    </div>
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <h4 className="text-white font-semibold mb-2">Status Colors</h4>
      <ul className="space-y-1 text-sm">
        <li>• <span className="text-blue-400">Blue</span> - Open: New ticket, awaiting response</li>
        <li>• <span className="text-yellow-400">Yellow</span> - In Progress: Being worked on</li>
        <li>• <span className="text-green-400">Green</span> - Resolved: Issue fixed, 3-day pending close</li>
        <li>• <span className="text-gray-400">Gray</span> - Closed: Permanently closed</li>
      </ul>
    </div>
  </div>
);

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  // AI ticket assistant (Beta)
  const [aiDraft, setAiDraft] = useState<AiDraft | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [editableReply, setEditableReply] = useState('');
  const [aiActionLoading, setAiActionLoading] = useState(false);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  const replyContentRef = useRef('');

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchTicketDetail();
    fetchAiDraft();
  }, [id]);

  const fetchAiDraft = async () => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}/ai-draft`);
      const data = await response.json();
      if (data.draft && data.draft.status === 'pending') {
        setAiDraft(data.draft);
        setEditableReply(data.draft.draft_reply || '');
      }
    } catch (error) {
      console.error('Error fetching AI draft:', error);
    }
  };

  const handleGetAiDiagnosis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`/api/admin/tickets/${id}/ai-draft`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        setAiError(data.error || 'AI diagnosis failed');
        return;
      }
      setAiDraft(data.draft);
      setEditableReply(data.draft.draft_reply || '');
    } catch (error) {
      setAiError('AI diagnosis failed');
      console.error('Error getting AI diagnosis:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApproveSend = async () => {
    if (!aiDraft || !editableReply.trim()) return;
    setAiActionLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets/${id}/approve-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: aiDraft.id, replyText: editableReply }),
      });
      if (response.ok) {
        setAiDraft(null);
        setEditableReply('');
        fetchTicketDetail();
      } else {
        const data = await response.json();
        setAiError(data.error || 'Failed to send reply');
      }
    } catch (error) {
      setAiError('Failed to send reply');
      console.error('Error approving AI draft:', error);
    } finally {
      setAiActionLoading(false);
    }
  };

  const handleEscalateAiDraft = async () => {
    if (!aiDraft) return;
    setAiActionLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets/${id}/ai-draft`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftId: aiDraft.id }),
      });
      if (response.ok) {
        setAiDraft(null);
        setEditableReply('');
      }
    } catch (error) {
      console.error('Error escalating AI draft:', error);
    } finally {
      setAiActionLoading(false);
    }
  };

  const fetchTicketDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets/${id}`);
      const data = await response.json();
      if (data.ticket) {
        setTicket(data.ticket);
      } else {
        setTicket(null);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e?: React.MouseEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Use ref to get current values to avoid closure issues
    const contentToSend = replyContentRef.current || replyContent;
    const currentTicket = ticket;

    if (!contentToSend.trim() || !currentTicket) {
      return;
    }

    // Use ref to track sending state
    if (sending) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: contentToSend,
          status: currentTicket.status === 'resolved' ? 'resolved' : 'in_progress'
        }),
      });

      const data = await response.json();

      if (response.ok && isMountedRef.current) {
        setReplyContent('');
        replyContentRef.current = '';
        // Only fetch if still mounted
        if (isMountedRef.current) {
          fetchTicketDetail();
        }
      } else {
        console.error('Failed to send reply:', data.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      if (isMountedRef.current) {
        setSending(false);
      }
    }
    
    return false;
  };

  const handleResolve = async () => {
    if (!resolutionNote.trim()) {
      alert('Please describe what was done to resolve this issue');
      return;
    }

    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          resolution_note: resolutionNote
        }),
      });

      if (response.ok) {
        setShowResolveModal(false);
        setResolutionNote('');
        fetchTicketDetail();
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
    }
  };

  const handleClose = async () => {
    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (response.ok) {
        setShowCloseModal(false);
        fetchTicketDetail();
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!ticket) return;

    if (newStatus === 'resolved') {
      setShowResolveModal(true);
      return;
    }

    if (newStatus === 'closed') {
      setShowCloseModal(true);
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/tickets/${id}`, {
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

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return formatDate(dateString);
  };

  const getTimeOpen = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} hours`;
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  };

  const getResolvedTimeRemaining = (resolvedAt: string) => {
    const resolved = new Date(resolvedAt);
    const closeTime = new Date(resolved.getTime() + 3 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = closeTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Pending auto-close';
    
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor((diffMs % 86400000) / 3600000);
    
    if (diffDays > 0) return `Auto-close in ${diffDays}d ${diffHours}h`;
    return `Auto-close in ${diffHours} hours`;
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
  const canChat = ticket.status !== 'closed';

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <AdminNav />
      <div style={{ height: '64px' }} />
      <div className="space-y-6">
        {/* Resolve Modal */}
        {showResolveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Mark as Resolved</h3>
              <p className="text-white/60 mb-4">Describe what was done to resolve this issue:</p>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="e.g., Refunded payment, Fixed technical issue, Provided workaround..."
                rows={4}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setShowResolveModal(false); setResolutionNote(''); }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={!resolutionNote.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  Confirm Resolve
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Close Confirmation Modal */}
        {showCloseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-red-500/20">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Close Ticket?</h3>
              </div>
              <p className="text-white/60 mb-4">
                This will permanently close the ticket. The customer will not be able to reply or reopen it - they must create a new ticket for further assistance.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Modal */}
        {showInfoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Ticket Workflow Instructions</h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {WORKFLOW_INSTRUCTIONS}
            </div>
          </div>
        )}

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
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{ticket.subject}</h1>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                  title="Workflow Instructions"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
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
        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <User className="w-4 h-4" />
            <span>{ticket.user_name || ticket.user_id}</span>
          </div>
          {ticket.user_role && (
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${ticket.user_role === 'professional' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {ticket.user_role}
              </span>
            </div>
          )}
          {ticket.category && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Tag className="w-4 h-4" />
              <span>{ticket.category}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            <span>Created: {formatDate(ticket.created_at)}</span>
            <span className="text-white/30">•</span>
            <span className="text-[#667eea]">Open for {getTimeOpen(ticket.created_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MessageSquare className="w-4 h-4" />
            <span>{ticket.messages?.length || 0} messages</span>
          </div>
          {ticket.status === 'resolved' && ticket.resolved_at && (
            <div className="flex items-center gap-2 text-sm text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>{getResolvedTimeRemaining(ticket.resolved_at)}</span>
            </div>
          )}
        </div>

        {/* AI Ticket Assistant (Beta) */}
        {canChat && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#a5b4fc]" />
                <span className="text-sm font-semibold text-white">AI Diagnosis</span>
                <BetaBadge />
              </div>
              {!aiDraft && (
                <button
                  onClick={handleGetAiDiagnosis}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#667eea]/20 text-[#a5b4fc] hover:bg-[#667eea]/30 transition-colors disabled:opacity-50 text-sm"
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {aiLoading ? 'Analyzing...' : 'Get AI Diagnosis'}
                </button>
              )}
            </div>

            {aiError && (
              <p className="text-sm text-red-400">{aiError}</p>
            )}

            {aiDraft && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1">Diagnosis</p>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{aiDraft.diagnosis}</p>
                </div>

                {aiDraft.can_resolve ? (
                  <>
                    <div>
                      <p className="text-xs font-medium text-white/40 uppercase tracking-wide mb-1">Draft reply (editable)</p>
                      <textarea
                        value={editableReply}
                        onChange={(e) => setEditableReply(e.target.value)}
                        rows={4}
                        className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] resize-none text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleApproveSend}
                        disabled={aiActionLoading || !editableReply.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                      >
                        {aiActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve &amp; Send
                      </button>
                      <button
                        onClick={handleEscalateAiDraft}
                        disabled={aiActionLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm"
                      >
                        Discard
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-2">
                      <ShieldAlert className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-orange-400 font-medium">Needs a human</p>
                        <p className="text-sm text-white/70 mt-1">{aiDraft.escalation_reason}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleEscalateAiDraft}
                      disabled={aiActionLoading}
                      className="px-4 py-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm"
                    >
                      Acknowledge
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resolution Note Banner */}
        {ticket.resolution_note && ticket.status === 'resolved' && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 font-medium">Resolution:</p>
            <p className="text-white/80 mt-1">{ticket.resolution_note}</p>
          </div>
        )}

        {/* Conversation Thread */}
        <div className="space-y-4">
          {ticket.messages && ticket.messages.length > 0 ? (
            ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-xl ${
                  message.sender_type === 'system'
                    ? 'bg-green-500/10 border border-green-500/20 text-center'
                    : message.sender_type === 'admin'
                    ? 'bg-[#667eea]/20 border border-[#667eea]/30 ml-8'
                    : 'bg-white/5 border border-white/10 mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      message.sender_type === 'system'
                        ? 'bg-green-500 text-white'
                        : message.sender_type === 'admin'
                        ? 'bg-[#667eea] text-white'
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {message.sender_type === 'system' ? 'System' : message.sender_type === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                    <span className="text-sm text-white/60">
                      {message.sender_type === 'system' ? 'Auto' : message.sender_type === 'admin' ? 'Support Team' : (ticket.user_name || ticket.user_id)}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">{getRelativeTime(message.created_at)}</span>
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

        {/* Reply Composer (disabled for closed tickets) */}
        {canChat && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <textarea
                value={replyContent}
                onChange={(e) => {
                  setReplyContent(e.target.value);
                  replyContentRef.current = e.target.value;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (replyContent.trim()) {
                      handleSendReply();
                    }
                  }
                }}
                placeholder={ticket.status === 'resolved' ? "Continue conversation (ticket is resolved but still open for replies)..." : "Type your reply..."}
                rows={4}
                className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-white/40">
                  {ticket.status === 'resolved' ? 'Reply will reopen the ticket' : 'Reply as Admin Support Team'}
                </span>
                <button
                  type="button"
                  disabled={!replyContent.trim() || sending}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendReply();
                  }}
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
          </div>
        )}

        {/* Closed Ticket Notice */}
        {ticket.status === 'closed' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-white/80">This ticket is closed. Customer must create a new ticket for further assistance.</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {ticket.status === 'resolved' && (
            <button
              onClick={() => handleUpdateStatus('in_progress')}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen to In Progress
            </button>
          )}
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <button
              onClick={() => setShowResolveModal(true)}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Resolved
            </button>
          )}
          {ticket.status !== 'closed' && (
            <button
              onClick={() => setShowCloseModal(true)}
              disabled={updatingStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Close Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}