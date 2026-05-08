'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Users', href: '/admin/users' },
  { name: 'Database', href: '/admin/database' },
  { name: 'Tickets', href: '/admin/tickets' },
  { name: 'Finance', href: '/admin/finance' },
  { name: 'Logs', href: '/admin/logs' },
  { name: 'Monetization', href: '/admin/monetization' },
  { name: 'Settings', href: '/admin/settings' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      padding: '15px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      borderBottom: '2px solid #667eea',
      marginBottom: '20px'
    }}>
      <Link href="/admin" style={{
        color: '#667eea',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: 0,
        textDecoration: 'none'
      }}>
        GlowUp3 Admin
      </Link>
      
      <div style={{
        display: 'flex',
        gap: '10px',
        marginLeft: 'auto',
        flexWrap: 'wrap'
      }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: isActive ? '#667eea' : 'white',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                fontWeight: isActive ? '600' : '400',
                fontSize: '14px',
                border: isActive ? '1px solid #667eea' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}