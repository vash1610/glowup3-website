'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  Lock,
  RefreshCw,
  Receipt,
  CheckCircle,
  Bot,
  Shield,
  Flag
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import styles from './AdminNav.module.css';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'AI DB', href: '/admin/ai-db', icon: Bot },
  { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
  { name: 'Reports', href: '/admin/reports', icon: Flag },
  { name: 'Verification', href: '/admin/verification', icon: Shield },
  { name: 'Finance', href: '/admin/finance', icon: Wallet, hasSubmenu: true },
  { name: 'Promotions', href: '/admin/promotions', icon: TrendingUp },
  { name: 'Logs', href: '/admin/logs', icon: FileText },
];

const financeSubmenu = [
  { name: 'Overview', href: '/admin/finance', icon: Wallet },
  { name: 'Transactions', href: '/admin/finance/transactions', icon: Receipt },
  { name: 'Escrow', href: '/admin/finance/escrow', icon: Lock },
  { name: 'Reconciliation', href: '/admin/finance/reconciliation', icon: RefreshCw },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [financeDropdownOpen, setFinanceDropdownOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const financeButtonRef = useRef<HTMLButtonElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const financeDropdownRef = useRef<HTMLDivElement>(null);
  const [unreadCount] = useState(3);
  const [financeDropdownPosition, setFinanceDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate Finance dropdown position when opened
  useEffect(() => {
    if (financeDropdownOpen && financeButtonRef.current) {
      const rect = financeButtonRef.current.getBoundingClientRect();
      setFinanceDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [financeDropdownOpen]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  // Click outside to close finance dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        financeDropdownRef.current &&
        !financeDropdownRef.current.contains(event.target as Node) &&
        financeButtonRef.current &&
        !financeButtonRef.current.contains(event.target as Node)
      ) {
        setFinanceDropdownOpen(false);
      }
    };

    if (financeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [financeDropdownOpen]);

  // Auto-open finance dropdown when on finance subpages
  useEffect(() => {
    if (pathname.startsWith('/admin/finance')) {
      setFinanceDropdownOpen(true);
    }
  }, [pathname]);

  const isFinanceSection = pathname.startsWith('/admin/finance');

  return (
    <>
      {/* PREMIUM GLASSMORPHISM NAV BAR */}
      <nav 
        className={styles.navContainer}
        aria-label="Admin navigation"
      >
        {/* LOGO SECTION */}
        <div className={styles.navLogo}>
          {/* Icon Box with Gradient */}
          <div className={styles.logoIcon}>
            <Zap size={22} color="white" strokeWidth={2.5} />
          </div>
          
          {/* Logo Text */}
          <div>
            <Link href="/admin" className={styles.logoLink}>
              <h1 className={styles.logoText}>Todayly</h1>
            </Link>
            <p className={styles.logoSubtext}>Admin</p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className={styles.navLinks} aria-label="Main navigation links">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            // Finance item - button trigger, no inline dropdown
            if (item.name === 'Finance') {
              return (
                <button
                  key={item.href}
                  ref={financeButtonRef}
                  className={`${styles.navLink} ${isActive || isFinanceSection ? styles.navLinkActive : ''}`}
                  onClick={() => setFinanceDropdownOpen(!financeDropdownOpen)}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ animationDelay: `${0.15 + index * 0.03}s` }}
                >
                  <Icon 
                    size={17} 
                    strokeWidth={isActive || isFinanceSection ? 2.2 : 1.8}
                    style={{
                      transition: 'transform 0.2s ease',
                      transform: isActive || isFinanceSection ? 'scale(1.1)' : 'scale(1)'
                    }}
                  />
                  <span>{item.name}</span>
                  <ChevronDown 
                    size={12} 
                    style={{ 
                      marginLeft: '2px',
                      transform: financeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }} 
                  />
                  {(isActive || isFinanceSection) && <span className={styles.activeDot} />}
                </button>
              );
            }
            
            // Regular nav items
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                aria-current={isActive ? 'page' : undefined}
                style={{ animationDelay: `${0.15 + index * 0.03}s` }}
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
                {isActive && <span className={styles.activeDot} />}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT SECTION */}
        <div className={styles.rightSection}>
          {/* Notifications Button */}
          <button
            ref={notificationButtonRef}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`${styles.notificationButton} ${notificationsOpen ? styles.notificationButtonActive : ''}`}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          <NotificationDropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            triggerRef={notificationButtonRef}
          />

          {/* Profile/Avatar Section */}
          <div style={{ position: 'relative' }}>
            <button
              ref={profileButtonRef}
              onClick={() => setProfileOpen(!profileOpen)}
              className={`${styles.profileButton} ${profileOpen ? styles.profileButtonActive : ''}`}
              aria-label="User menu"
            >
              {/* Avatar */}
              <div className={styles.profileAvatar}>A</div>
              <span>Admin</span>
              <ChevronDown 
                size={14} 
                className={styles.chevronIcon}
                style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              />
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div ref={profileDropdownRef} className={styles.profileDropdown}>
                {/* Settings Option */}
                <a
                  href="/admin/settings"
                  className={styles.profileDropdownItem}
                >
                  <Settings size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  Settings
                </a>

                {/* Divider */}
                <div className={styles.dropdownDivider} />

                {/* Logout Option */}
                <button
                  className={styles.profileDropdownLogout}
                  onClick={async () => {
                    setProfileOpen(false);
                    await fetch('/api/admin/auth/logout', { method: 'POST' });
                    window.location.href = '/login/admin';
                  }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* FINANCE DROPDOWN - Fixed position, outside nav flow */}
      {financeDropdownOpen && (
        <div 
          ref={financeDropdownRef}
          className={styles.profileDropdown}
          style={{ 
            position: 'fixed',
            top: `${financeDropdownPosition.top}px`,
            left: `${financeDropdownPosition.left}px`,
            minWidth: '200px',
            zIndex: 1001,
            animation: 'dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {financeSubmenu.map((subItem) => {
            const SubIcon = subItem.icon;
            const isSubActive = pathname === subItem.href;
            return (
              <Link
                key={subItem.href}
                href={subItem.href}
                className={`${styles.profileDropdownItem} ${isSubActive ? styles.profileDropdownItemActive : ''}`}
                onClick={() => setFinanceDropdownOpen(false)}
              >
                <SubIcon size={16} />
                {subItem.name}
                {isSubActive && <CheckCircle size={14} style={{ marginLeft: 'auto', color: '#10b981' }} />}
              </Link>
            );
          })}
        </div>
      )}

      {/* SPACER */}
      <div className={styles.navSpacer} />
    </>
  );
}
