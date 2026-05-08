'use client';

import React from 'react';
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
  ChevronRight
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

  return (
    <>
      {/* VERTICAL SIDEBAR - Left Side - Fixed position */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '260px',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100
      }}>
        {/* Logo/Brand */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h1 style={{
            color: '#667eea',
            fontSize: '22px',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            GlowUp3
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '12px',
            margin: '4px 0 0 0'
          }}>
            Admin Panel
          </p>
        </div>

        {/* Navigation Links */}
        <nav style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent'
                }}
              >
                <Icon size={20} />
                <span style={{ flex: 1 }}>{item.name}</span>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '11px',
            margin: 0
          }}>
            © 2025 GlowUp3
          </p>
        </div>
      </div>

      {/* SPACER for page content - pushes content to right of sidebar */}
      <div style={{
        width: '260px',
        flexShrink: 0
      }} />
    </>
  );
}