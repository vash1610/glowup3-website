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
  Settings
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
      {/* HORIZONTAL TOP BAR */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: '#1a1a2e',
        borderBottom: '2px solid #667eea',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 100,
        gap: '40px'
      }}>
        {/* Logo/Brand */}
        <Link href="/admin" style={{
          textDecoration: 'none'
        }}>
          <h1 style={{
            color: '#667eea',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: 0,
            letterSpacing: '-0.5px'
          }}>
            GlowUp3
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '11px',
            margin: '2px 0 0 0'
          }}>
            Admin
          </p>
        </Link>

        {/* Navigation Links - Horizontal */}
        <nav style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          flex: 1
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
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#667eea' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid rgba(102, 126, 234, 0.4)' : '1px solid transparent',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SPACER - Push content below the fixed header */}
      <div style={{
        height: '70px'
      }} />
    </>
  );
}