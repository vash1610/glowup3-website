'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  UserPlus,
  Ticket,
  DollarSign,
  AlertTriangle,
  Star,
  Check,
  CheckCheck,
  ExternalLink,
  X
} from 'lucide-react';

// Types
interface Notification {
  id: string;
  type: 'user' | 'ticket' | 'payment' | 'alert' | 'review';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Sample notifications for admin
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'user',
    title: 'New User Registration',
    message: 'Sarah Johnson just registered as a new professional.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
  },
  {
    id: '2',
    type: 'ticket',
    title: 'Support Ticket Submitted',
    message: 'Ticket #4521: "Unable to upload portfolio images" - Medium priority',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment of $249.99 received for Pro subscription upgrade.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    read: true,
  },
  {
    id: '4',
    type: 'alert',
    title: 'System Alert',
    message: 'Scheduled maintenance window: Tonight 2:00 AM - 4:00 AM EST',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: '5',
    type: 'review',
    title: 'New Review Submitted',
    message: 'New 5-star review from client Michael Chen for photographer Alex.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
  },
];

// Get icon for notification type
const getNotificationIcon = (type: Notification['type']) => {
  const iconProps = { size: 18 };
  switch (type) {
    case 'user':
      return <UserPlus {...iconProps} style={{ color: '#10b981' }} />;
    case 'ticket':
      return <Ticket {...iconProps} style={{ color: '#f59e0b' }} />;
    case 'payment':
      return <DollarSign {...iconProps} style={{ color: '#22c55e' }} />;
    case 'alert':
      return <AlertTriangle {...iconProps} style={{ color: '#ef4444' }} />;
    case 'review':
      return <Star {...iconProps} style={{ color: '#fbbf24' }} />;
    default:
      return <Bell {...iconProps} style={{ color: '#667eea' }} />;
  }
};

// Get background color for icon
const getIconBg = (type: Notification['type']) => {
  switch (type) {
    case 'user':
      return 'rgba(16, 185, 129, 0.15)';
    case 'ticket':
      return 'rgba(245, 158, 11, 0.15)';
    case 'payment':
      return 'rgba(34, 197, 94, 0.15)';
    case 'alert':
      return 'rgba(239, 68, 68, 0.15)';
    case 'review':
      return 'rgba(251, 191, 36, 0.15)';
    default:
      return 'rgba(102, 126, 234, 0.15)';
  }
};

// Format timestamp to relative time
const formatTimestamp = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

export default function NotificationDropdown({ isOpen, onClose, triggerRef }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes dropIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 400px;
          }
        }

        .notif-dropdown {
          animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .notif-item {
          transition: background 0.15s ease;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .notif-item.unread {
          background: rgba(102, 126, 234, 0.08);
        }

        .notif-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .notif-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .notif-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .notif-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <div
        ref={dropdownRef}
        className="notif-dropdown"
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '380px',
          background: 'rgba(22, 22, 36, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={18} style={{ color: '#667eea' }} />
            <h3 style={{
              margin: 0,
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '10px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            aria-label="Close notifications"
          >
            <X size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
        </div>

        {/* Notifications List */}
        <div
          className="notif-scroll"
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notif-item ${notification.read ? '' : 'unread'}`}
              style={{
                display: 'flex',
                gap: '14px',
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              {/* Unread indicator */}
              {!notification.read && (
                <span style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#667eea',
                  boxShadow: '0 0 8px rgba(102, 126, 234, 0.6)',
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: getIconBg(notification.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <h4 style={{
                    margin: '0 0 4px 0',
                    color: notification.read ? 'rgba(255, 255, 255, 0.7)' : 'white',
                    fontSize: '13.5px',
                    fontWeight: notification.read ? '500' : '600',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {notification.title}
                  </h4>
                </div>
                <p style={{
                  margin: '0',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {notification.message}
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  color: 'rgba(255, 255, 255, 0.35)',
                  fontSize: '11px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {formatTimestamp(notification.timestamp)}
                </span>
              </div>

              {/* Mark as read button */}
              {!notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification.id);
                  }}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'flex-start',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  }}
                  aria-label="Mark as read"
                >
                  <CheckCheck size={14} style={{ color: '#667eea' }} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: unreadCount === 0 ? 'transparent' : 'rgba(102, 126, 234, 0.1)',
              border: unreadCount === 0 ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '8px',
              padding: '8px 14px',
              cursor: unreadCount === 0 ? 'default' : 'pointer',
              color: unreadCount === 0 ? 'rgba(255, 255, 255, 0.3)' : '#667eea',
              fontSize: '12.5px',
              fontWeight: '500',
              fontFamily: 'Inter, system-ui, sans-serif',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (unreadCount > 0) {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (unreadCount > 0) {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
              }
            }}
          >
            <Check size={14} />
            Mark all as read
          </button>

          <a
            href="/admin/notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: '#667eea',
              fontSize: '12.5px',
              fontWeight: '500',
              fontFamily: 'Inter, system-ui, sans-serif',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(102, 126, 234, 0.1)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
            }}
          >
            View all
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </>
  );
}
