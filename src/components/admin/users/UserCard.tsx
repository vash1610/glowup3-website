'use client';

import React from 'react';
import { Mail, Phone, MapPin, Calendar, MoreVertical, UserCheck, UserX, Flag, Ban } from 'lucide-react';
import UserAvatar from '../base/UserAvatar';
import StatusBadge from '../base/StatusBadge';
import QuickAction from '../base/QuickAction';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  role: 'customer' | 'professional' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  joinedAt: string;
  stats?: {
    appointments?: number;
    reviews?: number;
    rating?: number;
  };
}

interface UserCardProps {
  user: User;
  onView?: () => void;
  onFlag?: () => void;
  onLock?: () => void;
  onDelete?: () => void;
  className?: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function UserCard({ 
  user, 
  onView, 
  onFlag, 
  onLock, 
  onDelete, 
  className = '' 
}: UserCardProps) {
  return (
    <div 
      className={`p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all ${className}`}
      onClick={onView}
    >
      <div className="flex items-start gap-4">
        <UserAvatar src={user.avatar} name={user.name} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="text-white font-semibold truncate">{user.name}</h4>
              <p className="text-sm text-white/50 truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge 
                status={user.status === 'active' ? 'active' : user.status === 'suspended' ? 'inactive' : user.status === 'pending' ? 'pending' : 'inactive'} 
                size="sm" 
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50 mb-3">
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {user.phone}
              </span>
            )}
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Joined {formatDate(user.joinedAt)}
            </span>
          </div>

          {user.stats && (
            <div className="flex items-center gap-4 text-sm">
              {user.stats.appointments !== undefined && (
                <span className="text-white/60">
                  <span className="text-white font-medium">{user.stats.appointments}</span> appointments
                </span>
              )}
              {user.stats.reviews !== undefined && (
                <span className="text-white/60">
                  <span className="text-white font-medium">{user.stats.reviews}</span> reviews
                </span>
              )}
              {user.stats.rating !== undefined && (
                <span className="text-white/60">
                  <span className="text-yellow-400 font-medium">★ {user.stats.rating.toFixed(1)}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {(onFlag || onLock || onDelete) && (
        <div className="flex items-center gap-1 mt-4 pt-4 border-t border-white/[0.08]">
          {onView && (
            <QuickAction
              icon={MoreVertical}
              label="View details"
              onClick={(e) => { e?.stopPropagation(); onView(); }}
            />
          )}
          {onFlag && (
            <QuickAction
              icon={Flag}
              label="Flag user"
              onClick={(e) => { e?.stopPropagation(); onFlag(); }}
            />
          )}
          {onLock && (
            <QuickAction
              icon={user.status === 'suspended' ? UserCheck : Ban}
              label={user.status === 'suspended' ? 'Unlock user' : 'Lock user'}
              onClick={(e) => { e?.stopPropagation(); onLock(); }}
              variant={user.status === 'suspended' ? 'success' : 'danger'}
            />
          )}
        </div>
      )}
    </div>
  );
}
