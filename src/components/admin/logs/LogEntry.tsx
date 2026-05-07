'use client';

import React from 'react';
import { 
  User, 
  Settings, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Info,
  Calendar,
  MessageSquare,
  Mail,
  Shield,
  LogIn,
  LogOut
} from 'lucide-react';

type LogLevel = 'info' | 'success' | 'warning' | 'error';

interface LogEntryProps {
  level: LogLevel;
  action: string;
  description: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  className?: string;
}

const levelConfig: Record<LogLevel, { icon: React.ReactNode; color: string; bgColor: string }> = {
  info: { 
    icon: <Info className="w-4 h-4" />, 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-400/10' 
  },
  success: { 
    icon: <CheckCircle className="w-4 h-4" />, 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-400/10' 
  },
  warning: { 
    icon: <AlertCircle className="w-4 h-4" />, 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-400/10' 
  },
  error: { 
    icon: <AlertCircle className="w-4 h-4" />, 
    color: 'text-red-400', 
    bgColor: 'bg-red-400/10' 
  },
};

const actionIcons: Record<string, React.ReactNode> = {
  'login': <LogIn className="w-4 h-4" />,
  'logout': <LogOut className="w-4 h-4" />,
  'user': <User className="w-4 h-4" />,
  'settings': <Settings className="w-4 h-4" />,
  'payment': <CreditCard className="w-4 h-4" />,
  'appointment': <Calendar className="w-4 h-4" />,
  'message': <MessageSquare className="w-4 h-4" />,
  'email': <Mail className="w-4 h-4" />,
  'security': <Shield className="w-4 h-4" />,
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getActionIcon = (action: string) => {
  const actionLower = action.toLowerCase();
  for (const [key, icon] of Object.entries(actionIcons)) {
    if (actionLower.includes(key)) {
      return icon;
    }
  }
  return <Info className="w-4 h-4" />;
};

export default function LogEntry({
  level,
  action,
  description,
  user,
  timestamp,
  metadata,
  ipAddress,
  className = ''
}: LogEntryProps) {
  const config = levelConfig[level];

  return (
    <div className={`flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors ${className}`}>
      {/* Level Icon */}
      <div className={`p-2 rounded-lg ${config.bgColor}`}>
        <span className={config.color}>{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`p-1 rounded ${config.bgColor}`}>
            <span className={config.color}>{getActionIcon(action)}</span>
          </span>
          <span className="text-sm font-medium text-white">{action}</span>
          {user && (
            <>
              <span className="text-white/20">by</span>
              <span className="text-sm text-violet-400">{user.name}</span>
            </>
          )}
        </div>
        
        <p className="text-sm text-white/60 mb-1">{description}</p>
        
        <div className="flex items-center gap-4 text-xs text-white/40">
          <span>{formatTimestamp(timestamp)}</span>
          {ipAddress && <span>IP: {ipAddress}</span>}
        </div>

        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-2 p-2 bg-white/[0.03] rounded-lg">
            <pre className="text-xs text-white/50 font-mono overflow-x-auto">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
