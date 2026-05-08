'use client';

import React from 'react';
import AdminNav from '@/components/admin/AdminNav';

export default function MonetizationPage() {
  return (
    <>
      <AdminNav />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Monetization</h1>
          <p className="text-white/60">Subscription plans, pricing, and revenue streams</p>
        </div>
        
        <div className="rounded-xl border border-white/10 p-8 text-center text-white/40">
          Monetization analytics will appear here.
        </div>
      </div>
    </>
  );
}