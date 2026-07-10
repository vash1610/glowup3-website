'use client';

import React from 'react';
import { 
  Calendar, 
  UserPlus, 
  CreditCard, 
  AlertCircle, 
  CheckCircle,
  MessageSquare
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'appointment' | 'user' | 'payment' | 'alert' | 'complete' | 'message';
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities?: ActivityItem[];
}

const getIconForType = (type: ActivityItem['type']) => {
  switch (type) {
    case 'appointment':
      return <Calendar className="w-4 h-4 text-blue-400" />;
    case 'user':
      return <UserPlus className="w-4 h-4 text-green-400" />;
    case 'payment':
      return <CreditCard className="w-4 h-4 text-purple-400" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    case 'complete':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'message':
      return <MessageSquare className="w-4 h-4 text-cyan-400" />;
    default:
      return <Calendar className="w-4 h-4 text-gray-400" />;
  }
};

const getBgColorForType = (type: ActivityItem['type']) => {
  switch (type) {
    case 'appointment':
      return 'bg-blue-400/10';
    case 'user':
      return 'bg-green-400/10';
    case 'payment':
      return 'bg-purple-400/10';
    case 'alert':
      return 'bg-yellow-400/10';
    case 'complete':
      return 'bg-emerald-400/10';
    case 'message':
      return 'bg-cyan-400/10';
    default:
      return 'bg-gray-400/10';
  }
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const activityList = activities || [];

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Recent Activity</h3>
        <p className="text-sm text-white/50">Latest events and updates</p>
      </div>

      {activityList.length === 0 ? (
        <p className="text-center py-8 text-white/40 text-sm">No recent activity</p>
      ) : (
      <div className="space-y-4">
        {activityList.slice(0, 10).map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className={`p-2 rounded-lg ${getBgColorForType(activity.type)}`}>
              {getIconForType(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {activity.title}
              </p>
              <p className="text-sm text-white/50 truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-white/40 whitespace-nowrap">
              {activity.timestamp}
            </span>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
