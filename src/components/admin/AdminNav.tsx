'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Database,
  Ticket,
  Wallet,
  FileText,
  TrendingUp,
  Settings,
  Zap,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { name: 'Finance', href: '/admin/finance', icon: Wallet },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
  { name: 'Monetization', href: '/admin/monetization', icon: TrendingUp },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.4); }
          50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
        }
        
        .nav-container {
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .nav-logo {
          animation: fadeInUp 0.4s ease forwards;
          animation-delay: 0.1s;
          opacity: 0;
        }
        
        .nav-link {
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .nav-link:hover {
          transform: translateY(-2px);
          background: rgba(102, 126, 234, 0.12);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
        }
        
        .nav-link:active {
          transform: translateY(0) scale(0.98);
        }
        
        .nav-link.active {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.15) 100%);
          box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #667eea, transparent);
          border-radius: 1px;
        }
        
        .logo-icon {
          animation: glow 3s ease-in-out infinite;
        }
        
        .notification-badge {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .search-input:focus {
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }
        
        /* Smooth scrollbar in nav */
        .nav-container::-webkit-scrollbar {
          height: 4px;
        }
        .nav-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .nav-container::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 2px;
        }
      `}</style>

      {/* PREMIUM GLASSMORPHISM NAV BAR */}
      <nav 
        className="nav-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(16, 16, 26, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          zIndex: 100,
          gap: '32px'
        }}
        aria-label="Admin navigation"
      >
        {/* LOGO SECTION - With Icon + Gradient Glow */}
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Icon Box with Gradient */}
          <div 
            className="logo-icon"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Inner highlight */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              borderRadius: '12px 12px 0 0'
            }} />
            <Zap size={22} color="white" strokeWidth={2.5} />
          </div>
          
          {/* Logo Text */}
          <div>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <h1 style={{
                color: 'white',
                fontSize: '18px',
                fontWeight: '700',
                margin: 0,
                letterSpacing: '-0.5px',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                GlowUp3
              </h1>
            </Link>
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '10px',
              fontWeight: '500',
              margin: '2px 0 0 0',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              Admin
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS - Center */}
        <nav 
          style={{
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
            flex: 1,
            overflowX: 'auto'
          }}
          aria-label="Main navigation links"
        >
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : 'rgba(255,255,255,0.65)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '13.5px',
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  animationDelay: `${0.15 + index * 0.03}s`
                }}
              >
                <Icon 
                  size={17} 
                  strokeWidth={isActive ? 2.2 : 1.8}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                <span>{item.name}</span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#667eea',
                    boxShadow: '0 0 8px rgba(102, 126, 234, 0.8)'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SECTION - Search + Notifications + Profile */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginLeft: 'auto'
        }}>
          {/* Search Bar */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                color: 'rgba(255,255,255,0.3)',
                pointerEvents: 'none'
              }} 
            />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              style={{
                width: '180px',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: 'white',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                e.target.style.background = 'rgba(255,255,255,0.06)';
                e.target.style.width = '220px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                e.target.style.background = 'rgba(255,255,255,0.04)';
                e.target.style.width = '180px';
              }}
            />
            <span style={{
              position: 'absolute',
              right: '10px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.08)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              ⌘K
            </span>
          </div>

          {/* Notifications Button */}
          <button
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            aria-label="Notifications"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <Bell size={18} />
            {/* Notification Badge */}
            <span 
              className="notification-badge"
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                border: '2px solid rgba(16, 16, 26, 0.85)'
              }}
            />
          </button>

          {/* Profile/Avatar Section */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px 6px 6px',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            aria-label="User menu"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: 'white'
            }}>
              A
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Admin</span>
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>
      </nav>

      {/* SPACER */}
      <div style={{ height: '64px' }} />
    </>
  );
}