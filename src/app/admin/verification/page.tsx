'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Loader2,
  Building2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Hash,
  Briefcase,
  Scale,
  Clock
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface LookupResult {
  ico: string;
  checksum_valid: boolean;
  ares: {
    success: boolean;
    data?: {
      found: boolean;
      ico?: string;
      company_name?: string;
      legal_form?: string;
      address?: string;
      status?: string;
      registration_date?: string;
      dic?: string;
      rzp_status?: string;
      vat_registered?: boolean;
      cz_nace?: string[];
    };
    error?: string;
  };
  rzp: {
    found: boolean;
    company_name?: string;
    address?: string;
    business_type?: string;
    role?: string;
    license_authority?: string;
    trade_license_status?: string;
    error?: string;
  } | null;
  vies?: { valid: boolean; name?: string; address?: string } | null;
  timestamp?: string;
  saved?: boolean;
}

interface VerificationRecord {
  id: string;
  declared_ico: string;
  company_name?: string;
  status: string;
  ares_response?: any;
  rzp_response?: any;
  created_at: string;
  last_search_at?: string;
}

export default function VerificationPage() {
  const [lookupIco, setLookupIco] = useState('');
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [showMoreAres, setShowMoreAres] = useState(false);
  const [showMoreRzp, setShowMoreRzp] = useState(false);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [hasMore, setHasMore] = useState(false);

  const handleLookup = async () => {
    if (!lookupIco.trim()) return;
    
    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);
    setShowMoreAres(false);
    setShowMoreRzp(false);
    
    try {
      const response = await fetch(`/api/admin/verification/lookup?ico=${lookupIco.trim()}&rzp=true&vies=true`);
      if (!response.ok) throw new Error((await response.json()).error || 'Lookup failed');
      const data = await response.json();
      setLookupResult(data);
      // Refresh list
      fetchVerifications();
    } catch (error) {
      setLookupError(String(error));
    } finally {
      setLookupLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  useEffect(() => { fetchVerifications(); }, []);

  const fetchVerifications = async (limit = 10) => {
    try {
      const response = await fetch(`/api/admin/verification?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications || []);
        // hasMore = true if total > limit
        setHasMore((data.total || 0) > limit);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const newLimit = displayLimit + 10;
    setDisplayLimit(newLimit);
    fetchVerifications(newLimit);
  };

  const czNaceDescriptions: Record<string, string> = {
    '70200': 'Činnosti vedení účetnických jednotek', '46900': 'Velkoobchod jinde nezařazený',
    '26200': 'Výroba počítačů', '620': 'Programování, konzultace', '63': 'Informační činnosti'
  };

  return (
    <>
      <AdminNav />
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#667eea]" />
            Business Verification
          </h1>
          <p className="text-white/60">Verify professionals - ARES + RŽP + VIES lookup</p>
        </div>

        {/* Quick Lookup */}
        <div className="bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 border border-[#667eea]/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#667eea]" />
              Quick IČO Lookup
            </h2>
            <span className="text-xs text-white/40">ARES + RŽP + VIES</span>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={lookupIco}
                onChange={(e) => setLookupIco(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                placeholder="Enter 8-digit IČO (e.g., 26432293)"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea]"
                maxLength={8}
              />
            </div>
            <button onClick={handleLookup} disabled={lookupLoading || lookupIco.length !== 8}
              className="px-6 py-3 rounded-xl bg-[#667eea] hover:bg-[#5a6fd6] disabled:bg-white/10 text-white font-medium flex items-center gap-2">
              {lookupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Lookup
            </button>
          </div>
          
          {lookupError && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400">{lookupError}</div>
          )}
          
          {lookupResult && (
            <div className="mt-4 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl flex items-center gap-3 ${lookupResult.ares?.data?.found ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                {lookupResult.ares?.data?.found ? (
                  <><CheckCircle className="w-6 h-6 text-green-400" />
                  <div><p className="text-green-400 font-semibold">IČO Valid</p>
                  <p className="text-green-400/60 text-sm">Found in Czech registries {lookupResult.saved ? '• Saved to DB' : ''}</p></div></>
                ) : (
                  <><XCircle className="w-6 h-6 text-red-400" />
                  <div><p className="text-red-400 font-semibold">IČO Not Found</p>
                  <p className="text-red-400/60 text-sm">This IČO does not exist</p></div></>
                )}
              </div>

              {/* ARES + RŽP Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ARES */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 overflow-hidden">
                  <div className="bg-blue-500/20 px-4 py-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-blue-400">ARES</span>
                    <span className="text-xs text-white/40 ml-auto">Czech Business Register</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {lookupResult.ares?.data?.found ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">Company</span>
                          {lookupResult.ares.data.rzp_status === 'AKTIVNI' && (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">RŽP Active</span>
                          )}
                        </div>
                        <p className="text-white font-semibold text-lg">{lookupResult.ares.data.company_name || 'Unknown'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60 text-sm">Status</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${lookupResult.ares.data.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {lookupResult.ares.data.status?.toUpperCase() || 'ACTIVE'}
                          </span>
                        </div>
                        {lookupResult.ares.data.registration_date && (
                          <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Registered</span><span className="text-white">{lookupResult.ares.data.registration_date}</span></div>
                        )}
                        {lookupResult.ares.data.address && (
                          <div><span className="text-white/60 text-sm">Address</span><p className="text-white mt-1">{lookupResult.ares.data.address}</p></div>
                        )}
                        <button onClick={() => setShowMoreAres(!showMoreAres)} className="w-full mt-2 px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm flex items-center justify-center gap-2">
                          {showMoreAres ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showMoreAres ? 'Show Less' : 'Show More Details'}
                        </button>
                        {showMoreAres && (
                          <div className="space-y-3 pt-2 border-t border-blue-500/20">
                            {lookupResult.ares.data.dic && (
                              <div className="flex items-center justify-between"><span className="text-white/60 text-sm flex items-center gap-1"><Hash className="w-3 h-3" /> DIČ</span><span className="text-white font-mono">{lookupResult.ares.data.dic}</span></div>
                            )}
                            {lookupResult.ares.data.vat_registered !== undefined && (
                              <div className="flex items-center justify-between"><span className="text-white/60 text-sm">VAT Registered</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${lookupResult.ares.data.vat_registered ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{lookupResult.ares.data.vat_registered ? 'YES' : 'NO'}</span></div>
                            )}
                            {lookupResult.ares.data.cz_nace && lookupResult.ares.data.cz_nace.length > 0 && (
                              <div>
                                <span className="text-white/60 text-sm flex items-center gap-1 mb-2"><Briefcase className="w-3 h-3" /> CZ-NACE</span>
                                <div className="space-y-1">
                                  {(lookupResult.ares.data.cz_nace as string[]).map((code, i) => (
                                    <div key={i} className="flex items-center justify-between bg-white/5 rounded px-2 py-1">
                                      <span className="text-white font-mono text-sm">{code}</span>
                                      <span className="text-white/60 text-xs">{czNaceDescriptions[code] || 'Other'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs text-white/40">
                              <span>IČO Checksum</span>
                              <span className={lookupResult.checksum_valid ? 'text-green-400' : 'text-red-400'}>{lookupResult.checksum_valid ? '✓ Valid' : '✗ Invalid'}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4"><XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" /><p className="text-white/60">Not found in ARES</p></div>
                    )}
                  </div>
                </div>

                {/* RŽP */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 overflow-hidden">
                  <div className="bg-purple-500/20 px-4 py-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span className="font-semibold text-purple-400">RŽP</span>
                    <span className="text-xs text-white/40 ml-auto">Trade License Register</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {lookupResult.rzp?.found ? (
                      <>
                        <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Business Type</span><span className="text-white">{lookupResult.rzp.business_type || 'N/A'}</span></div>
                        <div className="flex items-center justify-between"><span className="text-white/60 text-sm">License Status</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${lookupResult.rzp.trade_license_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {(lookupResult.rzp.trade_license_status || 'ACTIVE').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between"><span className="text-white/60 text-sm">Role</span><span className="text-white">{lookupResult.rzp.role || 'N/A'}</span></div>
                        {lookupResult.rzp.license_authority && (
                          <div><span className="text-white/60 text-sm">Authority</span><p className="text-white text-sm mt-1">{lookupResult.rzp.license_authority}</p></div>
                        )}
                        {lookupResult.rzp.address && (
                          <div><span className="text-white/60 text-sm">Address</span><p className="text-white text-sm mt-1">{lookupResult.rzp.address}</p></div>
                        )}
                        <button onClick={() => setShowMoreRzp(!showMoreRzp)} className="w-full mt-2 px-3 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm flex items-center justify-center gap-2">
                          {showMoreRzp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          {showMoreRzp ? 'Show Less' : 'Show More Details'}
                        </button>
                        {showMoreRzp && (
                          <div className="space-y-3 pt-2 border-t border-purple-500/20">
                            <div className="flex items-center justify-between"><span className="text-white/60 text-sm">IČO</span><span className="text-white font-mono">{lookupResult.ico}</span></div>
                            <div className="p-3 rounded-lg bg-purple-500/10"><p className="text-purple-400 text-xs">Detailed trade license list requires PodnikatelID lookup</p></div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4"><XCircle className="w-8 h-8 mx-auto mb-2 text-yellow-400" /><p className="text-white/60">{lookupResult.rzp?.error || 'Not found in RŽP'}</p></div>
                    )}
                  </div>
                </div>
              </div>

              {/* VIES */}
              {lookupResult.vies && (
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">EU VAT (VIES)</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${lookupResult.vies.valid ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {lookupResult.vies.valid ? 'VALID' : 'INVALID'}
                    </span>
                  </div>
                  {lookupResult.vies.name && <p className="text-white mt-2">{lookupResult.vies.name}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Searches */}
        <div className="bg-gradient-to-r from-[#1a1a2e]/80 to-[#16213e]/80 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#667eea]" />
              Recent Searches
            </h2>
            <button onClick={() => fetchVerifications()} className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#667eea]" />
              <span className="ml-2 text-white/60">Loading...</span>
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No searches yet</p>
              <p className="text-sm mt-1">Enter an IČO above to start searching</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {verifications.slice(0, displayLimit).map((v) => (
                  <div key={v.id} onClick={() => { setLookupIco(v.declared_ico); handleLookup(); }}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${v.status === 'verified' ? 'bg-green-500/20' : v.status === 'not_found' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                          {v.status === 'verified' ? <CheckCircle className="w-5 h-5 text-green-400" /> : v.status === 'not_found' ? <XCircle className="w-5 h-5 text-red-400" /> : <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{v.declared_ico}</p>
                          <p className="text-white/60 text-sm">{v.company_name || 'No company name'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${v.status === 'verified' ? 'bg-green-500/20 text-green-400' : v.status === 'not_found' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {v.status?.toUpperCase()}
                        </span>
                        <p className="text-white/40 text-xs mt-1">{v.last_search_at ? formatDate(v.last_search_at) : formatDate(v.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <button onClick={loadMore} className="w-full mt-4 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ChevronDown className="w-4 h-4" />
                  Show More ({verifications.length - displayLimit} remaining)
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}