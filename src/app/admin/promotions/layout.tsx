'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  BarChart3,
  Megaphone,
  ChevronRight
} from 'lucide-react';

const promotionNavItems = [
  { name: 'Overview', href: '/admin/promotions', icon: LayoutDashboard },
  { name: 'Pricing', href: '/admin/promotions/pricing', icon: DollarSign },
  { name: 'Analytics', href: '/admin/promotions/analytics', icon: BarChart3 },
];

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Top navigation bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0f0f14] border-b border-white/[0.08] backdrop-blur-xl">
        <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Promotions</h1>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-1">
            {promotionNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-[#667eea]/20 text-[#667eea]'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#667eea]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="w-40" />
        </div>
      </nav>

      {/* Main content area */}
      <div className="pt-16 min-h-screen bg-[#0a0a0f]">
        <div className="max-w-[1600px] mx-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
