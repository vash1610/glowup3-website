'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Ticket,
  FileText,
  Wallet,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Database', href: '/admin/database', icon: <Database className="w-5 h-5" /> },
  { name: 'Tickets', href: '/admin/tickets', icon: <Ticket className="w-5 h-5" />, badge: 5 },
  { name: 'Logs', href: '/admin/logs', icon: <FileText className="w-5 h-5" /> },
  { name: 'Finance', href: '/admin/finance', icon: <Wallet className="w-5 h-5" /> },
  { name: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { name: 'Monetization', href: '/admin/monetization', icon: <TrendingUp className="w-5 h-5" /> },
  { name: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/session');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push('/login/admin');
      }
    } catch {
      setIsAuthenticated(false);
      router.push('/login/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    router.push('/login/admin');
  };

  if (isAuthenticated === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#050508]' : 'bg-gray-50'}`}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] animate-pulse" />
          <p className={darkMode ? 'text-white/60' : 'text-gray-500'}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const bgColor = darkMode ? 'bg-[#050508]' : 'bg-gray-50';
  const sidebarBg = darkMode ? 'bg-[#0a0a0f] border-white/[0.08]' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-white/60' : 'text-gray-500';
  const textMuted = darkMode ? 'text-white/40' : 'text-gray-400';
  const hoverBg = darkMode ? 'hover:bg-white/[0.05]' : 'hover:bg-gray-100';
  const activeBg = darkMode ? 'bg-white/[0.08]' : 'bg-gray-100';

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Mobile Header */}
      <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b ${
        darkMode ? 'bg-[#050508]/80 border-white/[0.08]' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className={`font-semibold ${textPrimary}`}>Admin</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300
        ${sidebarBg}
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/[0.08]">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className={`text-lg font-semibold ${textPrimary}`}>Admin</h1>
                  <p className={`text-xs ${textSecondary}`}>GlowUp3</p>
                </div>
              </div>
            )}
            {sidebarCollapsed && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-lg">G</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${isActive ? activeBg : ''}
                    ${hoverBg}
                    ${textSecondary}
                    ${isActive ? 'text-white' : ''}
                    ${sidebarCollapsed ? 'justify-center' : ''}
                  `}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                  {item.badge && !sidebarCollapsed && (
                    <span className="ml-auto bg-red-500/20 text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && sidebarCollapsed && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/[0.08] space-y-1">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${hoverBg} ${textSecondary}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {!sidebarCollapsed && <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${hoverBg} text-red-400`}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`
              hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full items-center justify-center
              ${darkMode ? 'bg-[#1a1a2e] border-white/20 text-white/60' : 'bg-white border-gray-200 text-gray-500'}
              border shadow-lg
            `}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        min-h-screen transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
      `}>
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b h-16 ${
          darkMode 
            ? 'bg-[#050508]/80 border-white/[0.08]' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="lg:hidden w-8" />
            <div className="flex items-center gap-4">
              {pathname !== '/admin' && (
                <Link 
                  href="/admin"
                  className={`text-sm ${textSecondary} hover:${textPrimary} transition-colors`}
                >
                  Admin
                </Link>
              )}
              <span className={`text-sm ${textMuted}`}>/</span>
              <span className={`text-sm ${textPrimary} capitalize`}>
                {pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-green-500`} />
                <span className={`text-sm ${textSecondary}`}>Online</span>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center`}>
                <span className="text-white font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
