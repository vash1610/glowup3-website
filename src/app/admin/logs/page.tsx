'use client';

import React from 'react';
import AdminNav from '@/components/admin/AdminNav';

export default function LogsPage() {
  return (
    <>
      <AdminNav />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">System Logs</h1>
          <p className="text-white/60">Monitor application events and errors</p>
        </div>
        
        <div className="rounded-xl border border-white/10 p-8 text-center text-white/40">
          Log entries will appear here once logging system is configured.
        </div>
      </div>
    </>
  );
}