'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Lock,
  Key,
  Shield,
  Clock,
  LogOut,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Smartphone,
  Monitor
} from 'lucide-react';

interface Session {
  id: string;
  created_at: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  is_current: boolean;
}

interface LoginHistory {
  id: string;
  login_at: string;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  location: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'passkey' | 'sessions' | 'history'>('passkey');
  
  // Passkey change
  const [currentPasskey, setCurrentPasskey] = useState('');
  const [newPasskey, setNewPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showCurrentPasskey, setShowCurrentPasskey] = useState(false);
  const [showNewPasskey, setShowNewPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeySuccess, setPasskeySuccess] = useState('');
  const [changingPasskey, setChangingPasskey] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  // Login History
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchLoginHistory();
  }, [activeTab]);

  const fetchLoginHistory = async () => {
    if (activeTab === 'history') {
      setLoadingHistory(true);
      // Simulate fetching login history
      setTimeout(() => {
        setLoginHistory([
          {
            id: '1',
            login_at: new Date(Date.now() - 3600000).toISOString(),
            ip_address: '192.168.1.1',
            user_agent: 'Chrome on macOS',
            success: true,
            location: 'Prague, Czech Republic',
          },
          {
            id: '2',
            login_at: new Date(Date.now() - 86400000).toISOString(),
            ip_address: '192.168.1.2',
            user_agent: 'Firefox on Windows',
            success: true,
            location: 'Brno, Czech Republic',
          },
          {
            id: '3',
            login_at: new Date(Date.now() - 172800000).toISOString(),
            ip_address: '10.0.0.1',
            user_agent: 'Safari on iOS',
            success: false,
            location: 'Unknown',
          },
        ]);
        setLoadingHistory(false);
      }, 500);
    }
  };

  const handleChangePasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasskeyError('');
    setPasskeySuccess('');

    if (!currentPasskey) {
      setPasskeyError('Current passkey is required');
      return;
    }

    if (newPasskey.length < 8) {
      setPasskeyError('New passkey must be at least 8 characters');
      return;
    }

    if (newPasskey !== confirmPasskey) {
      setPasskeyError('Passkeys do not match');
      return;
    }

    setChangingPasskey(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPasskeySuccess('Passkey changed successfully');
    setCurrentPasskey('');
    setNewPasskey('');
    setConfirmPasskey('');
    setChangingPasskey(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setRevokingSession(null);
  };

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices?')) {
      return;
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    router.push('/login/admin');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
        <p className="text-white/60">Manage your security and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('passkey')}
          className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'passkey'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          Change Passkey
          {activeTab === 'passkey' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Sessions
          {activeTab === 'sessions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === 'history'
              ? 'text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Login History
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#667eea]" />
          )}
        </button>
      </div>

      {/* Change Passkey Tab */}
      {activeTab === 'passkey' && (
        <div className="max-w-xl">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#667eea]/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-[#667eea]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Change Passkey</h3>
                <p className="text-sm text-white/60">Update your admin passkey</p>
              </div>
            </div>

            <form onSubmit={handleChangePasskey} className="space-y-4">
              {/* Current Passkey */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Current Passkey</label>
                <div className="relative">
                  <input
                    type={showCurrentPasskey ? 'text' : 'password'}
                    value={currentPasskey}
                    onChange={(e) => setCurrentPasskey(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea]"
                    placeholder="Enter current passkey"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPasskey(!showCurrentPasskey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showCurrentPasskey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Passkey */}
              <div>
                <label className="block text-sm text-white/60 mb-2">New Passkey</label>
                <div className="relative">
                  <input
                    type={showNewPasskey ? 'text' : 'password'}
                    value={newPasskey}
                    onChange={(e) => setNewPasskey(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea]"
                    placeholder="Enter new passkey (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPasskey(!showNewPasskey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showNewPasskey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Passkey */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm New Passkey</label>
                <input
                  type="password"
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#667eea]"
                  placeholder="Confirm new passkey"
                />
              </div>

              {/* Error Message */}
              {passkeyError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/20 text-red-400">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{passkeyError}</span>
                </div>
              )}

              {/* Success Message */}
              {passkeySuccess && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/20 text-green-400">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{passkeySuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={changingPasskey}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {changingPasskey ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
                Change Passkey
              </button>
            </form>
          </div>

          {/* Security Tips */}
          <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Security Tips</p>
                <ul className="mt-2 space-y-1 text-sm text-white/80">
                  <li>• Use at least 12 characters for better security</li>
                  <li>• Include numbers and special characters</li>
                  <li>• Don't reuse passkeys from other services</li>
                  <li>• Change passkey regularly (recommended: quarterly)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
              <p className="text-sm text-white/60">Manage your logged-in devices</p>
            </div>
            <button
              onClick={handleLogoutAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout All Devices
            </button>
          </div>

          <div className="space-y-3">
            {/* Current Session */}
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Current Session</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">Active</span>
                    </div>
                    <p className="text-sm text-white/60">Started {getRelativeTime(new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Sessions */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white/60" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">Mobile Device</span>
                    </div>
                    <p className="text-sm text-white/60">Last active 2 hours ago</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession('session-2')}
                  disabled={revokingSession === 'session-2'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {revokingSession === 'session-2' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Login History</h3>
            <p className="text-sm text-white/60">Recent admin login attempts</p>
          </div>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border ${
                    entry.success
                      ? 'bg-white/5 border-white/10'
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        entry.success ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {entry.success ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">
                            {entry.success ? 'Successful Login' : 'Failed Attempt'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            entry.success 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {entry.success ? 'Success' : 'Failed'}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">
                          {formatDate(entry.login_at)} • {entry.location || 'Unknown location'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-white/60">
                      <p>{entry.ip_address || 'Unknown IP'}</p>
                      <p>{entry.user_agent || 'Unknown device'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
