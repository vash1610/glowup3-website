'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Database,
  Save,
  Check,
  Loader2
} from 'lucide-react';

type TabType = 'general' | 'security' | 'notifications' | 'appearance' | 'database';

interface SettingsSection {
  id: TabType;
  name: string;
  icon: React.ElementType;
}

const sections: SettingsSection[] = [
  { id: 'general', name: 'General', icon: SettingsIcon },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'database', name: 'Database', icon: Database },
];

interface AdminSettings {
  id: string;
  platform_name: string;
  support_email: string;
  timezone: string;
  session_timeout_hours: number;
  email_alerts: boolean;
  slack_integration: boolean;
  slack_webhook_url: string | null;
  theme: string;
  accent_color: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to load settings');
        return;
      }
      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const update = <K extends keyof AdminSettings>(field: K, value: AdminSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_name: settings.platform_name,
          support_email: settings.support_email,
          timezone: settings.timezone,
          session_timeout_hours: settings.session_timeout_hours,
          email_alerts: settings.email_alerts,
          slack_integration: settings.slack_integration,
          slack_webhook_url: settings.slack_webhook_url,
          theme: settings.theme,
          accent_color: settings.accent_color,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to save settings');
        return;
      }
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      </>
    );
  }

  if (!settings) {
    return (
      <>
        <AdminNav />
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error || 'Failed to load settings'}
          </div>
        </div>
      </>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: 'white',
    fontSize: '14px',
    outline: 'none'
  };

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    marginBottom: '8px',
    display: 'block'
  };

  return (
    <>
      <AdminNav />

      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            Settings
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Manage your admin panel preferences and configurations
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '16px',
          flexWrap: 'wrap'
        }}>
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isActive ? '#667eea' : 'rgba(255,255,255,0.05)',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} />
                {section.name}
              </button>
            );
          })}
        </div>

        {/* Content based on active tab */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                General Settings
              </h3>

              <div>
                <label style={labelStyle}>Platform Name</label>
                <input
                  type="text"
                  value={settings.platform_name}
                  onChange={(e) => update('platform_name', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Support Email</label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => update('support_email', e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => update('timezone', e.target.value)}
                  style={inputStyle}
                >
                  <option value="Europe/Prague">Europe/Prague (CEST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Security Settings
              </h3>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-400 text-sm">
                  Two-factor email verification is always required to log in - it's not optional and can't be turned off here.
                </p>
              </div>

              <div>
                <label style={labelStyle}>Session Timeout (hours)</label>
                <select
                  value={settings.session_timeout_hours}
                  onChange={(e) => update('session_timeout_hours', parseInt(e.target.value))}
                  style={inputStyle}
                >
                  <option value={1}>1 hour</option>
                  <option value={8}>8 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={168}>7 days</option>
                </select>
                <p className="text-xs text-white/40 mt-2">Applies to new logins going forward, not sessions already in progress.</p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Notification Settings
              </h3>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ color: 'white', fontWeight: '500', margin: '0 0 4px 0' }}>Email Alerts</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Receive alerts via email</p>
                </div>
                <button
                  onClick={() => update('email_alerts', !settings.email_alerts)}
                  style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    backgroundColor: settings.email_alerts ? '#10b981' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: settings.email_alerts ? '26px' : '2px'
                  }} />
                </button>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ color: 'white', fontWeight: '500', margin: '0 0 4px 0' }}>Slack Integration</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Send notifications to Slack</p>
                </div>
                <button
                  onClick={() => update('slack_integration', !settings.slack_integration)}
                  style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    backgroundColor: settings.slack_integration ? '#10b981' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: settings.slack_integration ? '26px' : '2px'
                  }} />
                </button>
              </div>

              {settings.slack_integration && (
                <div>
                  <label style={labelStyle}>Slack Webhook URL</label>
                  <input
                    type="url"
                    value={settings.slack_webhook_url || ''}
                    onChange={(e) => update('slack_webhook_url', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    style={inputStyle}
                  />
                  <p className="text-xs text-yellow-400/80 mt-2">
                    This URL is saved but no events are wired to send to it yet - that's a follow-up build, not this settings form.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Appearance Settings
              </h3>

              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-yellow-400/80 text-xs">
                  These preferences are saved but the dashboard's dark theme is currently fixed in the UI code - changing them here doesn't yet re-theme the app.
                </p>
              </div>

              <div>
                <label style={labelStyle}>Theme</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['dark', 'light', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => update('theme', t)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: settings.theme === t ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.1)',
                        backgroundColor: settings.theme === t ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        color: 'white',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Accent Color</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => update('accent_color', e.target.value)}
                    style={{ width: '50px', height: '50px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={settings.accent_color}
                    onChange={(e) => update('accent_color', e.target.value)}
                    style={{ ...inputStyle, width: 'auto' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Database
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 8px 0' }}>Database</p>
                  <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>PostgreSQL (Supabase)</p>
                </div>
                <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 8px 0' }}>Browse tables</p>
                  <a href="/admin/database" style={{ color: '#a5b4fc', fontSize: '14px' }}>Open Database Viewer &rarr;</a>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'database' && (
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: saved ? '#10b981' : '#667eea',
                  color: 'white',
                  cursor: saving ? 'default' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '120px',
                  justifyContent: 'center'
                }}
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : saved ? (
                  <>
                    <Check size={18} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
