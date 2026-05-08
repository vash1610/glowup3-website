'use client';

import React, { useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Save,
  Check
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [saved, setSaved] = useState(false);

  // General settings
  const [platformName, setPlatformName] = useState('GlowUp3');
  const [supportEmail, setSupportEmail] = useState('support@glowup3.com');
  const [timezone, setTimezone] = useState('Europe/Prague');

  // Security settings
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('24h');
  const [ipWhitelist, setIpWhitelist] = useState('');

  // Notifications settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackIntegration, setSlackIntegration] = useState(false);
  const [slackWebhook, setSlackWebhook] = useState('');

  // Appearance settings
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#667eea');

  const handleSave = () => {
    // Simulate save
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <AdminNav />
      
      <div style={{
        padding: '24px',
        maxWidth: '900px'
      }}>
        <div style={{
          marginBottom: '32px'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 8px 0'
          }}>
            Settings
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            margin: 0
          }}>
            Manage your admin panel preferences and configurations
          </p>
        </div>

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
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Platform Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
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
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '8px'
              }}>
                <div>
                  <p style={{ color: 'white', fontWeight: '500', margin: '0 0 4px 0' }}>Two-Factor Authentication</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>Require 2FA for all admin users</p>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    backgroundColor: twoFactor ? '#10b981' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    position: 'absolute',
                    top: '2px',
                    left: twoFactor ? '26px' : '2px',
                    transition: 'all 0.2s ease'
                  }} />
                </button>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Session Timeout
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="1h">1 hour</option>
                  <option value="8h">8 hours</option>
                  <option value="24h">24 hours</option>
                  <option value="7d">7 days</option>
                </select>
              </div>

              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  IP Whitelist (comma separated)
                </label>
                <input
                  type="text"
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  placeholder="e.g., 192.168.1.1, 10.0.0.0/24"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
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
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    backgroundColor: emailAlerts ? '#10b981' : 'rgba(255,255,255,0.2)',
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
                    left: emailAlerts ? '26px' : '2px'
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
                  onClick={() => setSlackIntegration(!slackIntegration)}
                  style={{
                    width: '50px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    backgroundColor: slackIntegration ? '#10b981' : 'rgba(255,255,255,0.2)',
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
                    left: slackIntegration ? '26px' : '2px'
                  }} />
                </button>
              </div>

              {slackIntegration && (
                <div>
                  <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Slack Webhook URL
                  </label>
                  <input
                    type="url"
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
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
              
              <div>
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Theme
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['dark', 'light', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '8px',
                        border: theme === t ? '2px solid #667eea' : '2px solid rgba(255,255,255,0.1)',
                        backgroundColor: theme === t ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
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
                <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Accent Color
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: '0 0 20px 0' }}>
                Database Settings
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 8px 0' }}>Database</p>
                  <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>PostgreSQL</p>
                </div>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 8px 0' }}>Region</p>
                  <p style={{ color: 'white', fontSize: '14px', margin: 0 }}>eu-central-1</p>
                </div>
                <div style={{
                  padding: '20px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: '0 0 8px 0' }}>Status</p>
                  <p style={{ color: '#10b981', fontSize: '14px', margin: 0 }}>● Connected</p>
                </div>
              </div>

              <div style={{
                padding: '16px',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 193, 7, 0.3)'
              }}>
                <p style={{ color: '#ffc107', fontSize: '14px', margin: 0 }}>
                  ⚠️ Database management features are coming soon. Contact support for database operations.
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div style={{
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: saved ? '#10b981' : '#667eea',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '120px',
                justifyContent: 'center'
              }}
            >
              {saved ? (
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
        </div>
      </div>
    </>
  );
}