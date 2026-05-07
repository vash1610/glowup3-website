'use client';

import React from 'react';
import { MessageSquare, Clock, User, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import UserAvatar from '../base/UserAvatar';
import StatusBadge from '../base/StatusBadge';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    name: string;
    avatar?: string;
  };
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
  className?: string;
}

const priorityColors: Record<Ticket['priority'], string> = {
  low: 'text-gray-400',
  medium: 'text-blue-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
};

export default function TicketCard({ ticket, onClick, className = '' }: TicketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]
        hover:bg-white/[0.05] hover:border-white/[0.12]
        transition-all cursor-pointer
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium uppercase ${priorityColors[ticket.priority]}`}>
              {ticket.priority}
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/40">{formatDate(ticket.createdAt)}</span>
          </div>
          <h4 className="text-white font-medium truncate">{ticket.subject}</h4>
        </div>
        <StatusBadge status={ticket.status === 'in_progress' ? 'pending' : ticket.status === 'resolved' ? 'completed' : ticket.status === 'closed' ? 'inactive' : 'info'} size="sm" />
      </div>

      <p className="text-sm text-white/50 line-clamp-2 mb-4">{ticket.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <UserAvatar src={ticket.user.avatar} name={ticket.user.name} size="sm" />
            <span className="text-sm text-white/60">{ticket.user.name}</span>
          </div>
          {ticket.assignedTo && (
            <>
              <span className="text-white/20">→</span>
              <div className="flex items-center gap-2">
                <UserAvatar src={ticket.assignedTo.avatar} name={ticket.assignedTo.name} size="sm" />
                <span className="text-sm text-white/60">{ticket.assignedTo.name}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-white/40">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{ticket.messageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
