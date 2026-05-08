'use client';

import React from 'react';
import AdminNav from '@/components/admin/AdminNav';

export default function SettingsPage() {
  return (
    <>
      <AdminNav />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/60">Configure admin dashboard preferences</p>
        </div>
        
        <div className="rounded-xl border border-white/10 p-8 text-center text-white/40">
          Settings panel will appear here.
        </div>
      </div>
    </>
  );
}