'use client';

import React from 'react';
import AdminNav from '@/components/admin/AdminNav';

export default function FinancePage() {
  return (
    <>
      <AdminNav />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Dashboard</h1>
          <p className="text-white/60">Track revenue, transactions, and financial metrics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Total Revenue', 'Pending Payouts', 'Platform Fees', 'Refunds'].map((item, i) => (
            <div key={i} className="p-6 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/60 text-sm">{item}</p>
              <p className="text-2xl font-bold text-white mt-2">-</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 p-8 text-center text-white/40">
          Transaction history will appear here once connected to payment provider.
        </div>
      </div>
    </>
  );
}