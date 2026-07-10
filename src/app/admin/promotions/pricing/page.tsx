'use client';

import React, { useEffect, useState } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Star, Sparkles, RotateCcw, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

type SlotType = 'featured' | 'beauty_special';

interface PricingRow {
  id: string;
  slot_type: SlotType;
  platform_section: string;
  daily_price: number;
  weekdays_price: number;
  weekend_price: number;
  is_active: boolean;
  updated_at: string;
}

const SLOT_META: Record<SlotType, { label: string; description: string; icon: React.ReactNode; color: string; border: string }> = {
  featured: {
    label: 'Featured Spot',
    description: 'Pro appears at the top of Discovery as a Featured professional',
    icon: <Star className="w-5 h-5" />,
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
  beauty_special: {
    label: 'Beauty Special',
    description: 'Pro shows a custom promotional card in the Beauty Specials strip',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-pink-400',
    border: 'border-pink-500/20',
  },
};

const SECTIONS = ['glowup', 'healthnow'];

export default function PricingManagementPage() {
  const [rows, setRows] = useState<PricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabaseAdmin
      .from('promotion_pricing')
      .select('*')
      .order('slot_type')
      .order('platform_section');
    if (err) { setError(err.message); } else { setRows(data || []); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateField = (id: string, field: keyof PricingRow, value: number | boolean) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      for (const row of rows) {
        const { error: err } = await supabaseAdmin
          .from('promotion_pricing')
          .update({
            daily_price: row.daily_price,
            weekdays_price: row.weekdays_price,
            weekend_price: row.weekend_price,
            is_active: row.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.id);
        if (err) throw err;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Boost Pricing</h1>
          <p className="text-white/60">Set how much pros pay to appear as Featured or Beauty Special</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#667eea] hover:bg-[#5a6fd6] text-white font-medium transition-colors disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-200">
          All prices are in CZK. Weekend = Friday 3 pm → Sunday 23:59. Changes apply to new purchases immediately — existing active boosts keep original pricing.
        </p>
      </div>

      {/* Group by section */}
      {SECTIONS.map((section) => {
        const sectionRows = rows.filter((r) => r.platform_section === section);
        if (sectionRows.length === 0) return null;
        return (
          <div key={section} className="space-y-4">
            <h2 className="text-lg font-semibold text-white/80 capitalize">{section === 'glowup' ? 'Glowup / Beauty' : 'HealthNow'}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sectionRows.map((row) => {
                const meta = SLOT_META[row.slot_type];
                return (
                  <div key={row.id} className={`rounded-xl bg-white/5 border ${meta.border} overflow-hidden`}>
                    {/* Card header */}
                    <div className="flex items-center gap-4 p-5 bg-white/5">
                      <div className={`p-3 rounded-xl bg-white/10 ${meta.color}`}>{meta.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{meta.label}</h3>
                        <p className="text-white/60 text-sm mt-0.5">{meta.description}</p>
                      </div>
                      <button
                        onClick={() => updateField(row.id, 'is_active', !row.is_active)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          row.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {row.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        {row.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    {/* Prices */}
                    <div className="p-5 space-y-4">
                      <PriceField
                        label="Daily Price (CZK)"
                        subLabel="24 hours of visibility"
                        value={row.daily_price}
                        disabled={!row.is_active}
                        onChange={(v) => updateField(row.id, 'daily_price', v)}
                      />
                      <PriceField
                        label="Weekdays Price (CZK)"
                        subLabel="Mon–Fri (5 days)"
                        value={row.weekdays_price}
                        disabled={!row.is_active}
                        onChange={(v) => updateField(row.id, 'weekdays_price', v)}
                      />
                      <PriceField
                        label="Weekend Price (CZK)"
                        subLabel="Fri 3pm → Sun 23:59"
                        value={row.weekend_price}
                        disabled={!row.is_active}
                        onChange={(v) => updateField(row.id, 'weekend_price', v)}
                      />
                      <p className="text-white/30 text-xs">
                        Last updated: {new Date(row.updated_at).toLocaleString('cs-CZ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Summary table */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Pricing Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                {['Section', 'Slot', 'Daily', 'Weekdays', 'Weekend', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-sm font-medium text-white/60">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="px-5 py-4 text-white/70 capitalize text-sm">{row.platform_section}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-medium ${SLOT_META[row.slot_type].color}`}>
                      {SLOT_META[row.slot_type].label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white font-medium">{row.daily_price} Kč</td>
                  <td className="px-5 py-4 text-white">{row.weekdays_price} Kč</td>
                  <td className="px-5 py-4 text-white">{row.weekend_price} Kč</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      row.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/10 text-white/40'
                    }`}>
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PriceField({ label, subLabel, value, disabled, onChange }: {
  label: string; subLabel: string; value: number; disabled: boolean; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-white/60 text-sm mb-1">{label}</label>
      {subLabel && <p className="text-white/30 text-xs mb-2">{subLabel}</p>}
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}
