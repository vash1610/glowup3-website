'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
  X,
  Eye,
  FileText,
  Ban,
  Save,
  Loader2,
  MessageSquare,
  Cpu,
  Calendar,
  Shield,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Phone,
  Star,
  Clock3,
  CheckCircle2
} from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';

interface UserReport {
  id: string;
  reporter_id: string;
  reporter_role: 'customer' | 'professional';
  reported_id: string;
  reported_role: 'customer' | 'professional';
  report_type: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  appointment_id: string | null;
  conversation_id: string | null;
  evidence_urls: string[];
    status: 'open' | 'resolved' | 'dismissed' | 'closed';
  admin_decision: string | null;
  admin_notes: string | null;
  action_taken: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  reporter?: Record<string, any>;
  reported_user?: Record<string, any>;
}

interface ReportHistory {
  total_reports_made?: number;
  total_reports_against?: number;
  reports: UserReport[];
}

const SEVERITY_CONFIG = {
  low: { label: 'Low', bg: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500' },
  medium: { label: 'Medium', bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' },
  high: { label: 'High', bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500' },
  urgent: { label: 'Urgent', bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-gray-500/20 text-gray-400', icon: X },
};

const REPORT_TYPES: Record<string, string> = {
  no_show: 'No Show',
  rude_behavior: 'Rude Behavior',
  suspicious_activity: 'Suspicious Activity',
  service_not_as_described: 'Service Not As Described',
  payment_dispute: 'Payment Dispute',
  harassment: 'Harassment',
  fake_review: 'Fake Review',
  cancellation_abuse: 'Cancellation Abuse',
  other: 'Other',
};

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const [report, setReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [adminDecision, setAdminDecision] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [actionTaken, setActionTaken] = useState('');
  const [reporterHistory, setReporterHistory] = useState<ReportHistory | null>(null);
  const [reportedHistory, setReportedHistory] = useState<ReportHistory | null>(null);
  const [showReporterHistory, setShowReporterHistory] = useState(false);
  const [showReportedHistory, setShowReportedHistory] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Use the individual report endpoint directly
      const reportResponse = await fetch(`/api/admin/reports/${reportId}`);
      const reportData = await reportResponse.json();
      
      if (reportData.report) {
        setReport(reportData.report);
        setAdminNotes(reportData.report.admin_notes || '');
        setAdminDecision(reportData.report.admin_decision || '');
        setSelectedStatus(reportData.report.status);
        setActionTaken(reportData.report.action_taken || '');
      }
      
      // Fetch reporter's report history
      if (reportData.report?.reporter_id) {
        const reporterHistoryResponse = await fetch(`/api/admin/reports?reporter_id=${reportData.report.reporter_id}`);
        const reporterData = await reporterHistoryResponse.json();
        setReporterHistory({
          total_reports_made: reporterData.reports?.length || 0,
          reports: reporterData.reports || []
        });
      }
      
      // Fetch reported user's report history (who reported them)
      if (reportData.report?.reported_id) {
        const reportedHistoryResponse = await fetch(`/api/admin/reports?reported_id=${reportData.report.reported_id}`);
        const reportedData = await reportedHistoryResponse.json();
        setReportedHistory({
          total_reports_against: reportedData.reports?.length || 0,
          reports: reportedData.reports || []
        });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!report) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus,
          admin_notes: adminNotes,
          admin_decision: adminDecision,
          action_taken: actionTaken,
        }),
      });
      
      if (response.ok) {
        await fetchReport();
        alert('Report updated successfully!');
      } else {
        alert('Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('cs-CZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <AdminNav />
        <div style={{ height: '64px' }} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-[1600px] mx-auto p-6">
        <AdminNav />
        <div style={{ height: '64px' }} />
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <p className="text-lg">Report not found</p>
          <button
            onClick={() => router.push('/admin/tickets?tab=reports')}
            className="mt-4 px-4 py-2 rounded-xl bg-[#667eea] text-white hover:bg-[#5a6fd1] transition-colors"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const severityConfig = SEVERITY_CONFIG[report.severity] || SEVERITY_CONFIG.medium;
  const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <AdminNav />
      <div style={{ height: '64px' }} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/admin/tickets?tab=reports')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Reports
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#667eea] hover:bg-[#5a6fd1] text-white transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${severityConfig.bg} flex items-center justify-center`}>
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {REPORT_TYPES[report.report_type] || report.report_type}
                </h1>
                <p className="text-sm text-white/60 font-mono">{report.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig.color}`}>
                <StatusIcon className="w-4 h-4 inline mr-1" />
                {statusConfig.label}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${severityConfig.bg} text-white`}>
                {severityConfig.label}
              </span>
            </div>
          </div>
          
          <p className="text-white/80">{report.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Users Involved */}
            <div className="grid grid-cols-2 gap-4">
                {/* Reporter Card with details */}
              <div className="p-4 rounded-xl bg-white/5 border border-green-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-green-400 font-medium">Reporter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-xs">
                      {report.reporter_role}
                    </span>
                    <button
                      onClick={() => setShowReporterHistory(!showReporterHistory)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-white/80 text-xs hover:bg-white/20"
                    >
                      <AlertOctagon className="w-3 h-3" />
                      {reporterHistory?.total_reports_made || 0}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">
                    {report.reporter?.display_name || report.reporter?.full_name || report.reporter?.first_name || 'Unknown User'}
                  </p>
                  {report.reporter?.email && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.reporter.email}
                    </p>
                  )}
                  {report.reporter?.phone && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {report.reporter.phone}
                    </p>
                  )}
                  {report.reporter?.city && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.reporter.city}
                    </p>
                  )}
                  {report.reporter?.rating && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <Star className="w-3 h-3" /> Rating: {report.reporter.rating}/5
                    </p>
                  )}
                  {report.reporter?.total_reviews !== undefined && (
                    <p className="text-white/40 text-xs">({report.reporter.total_reviews} reviews)</p>
                  )}
                  <p className="text-white/40 text-xs font-mono">{report.reporter_id}</p>
                </div>
              </div>

              {/* Reported User Card with details */}
              <div className="p-4 rounded-xl bg-white/5 border border-red-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Ban className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-red-400 font-medium">Reported User</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">
                      {report.reported_role}
                    </span>
                    <button
                      onClick={() => setShowReportedHistory(!showReportedHistory)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30"
                    >
                      <AlertOctagon className="w-3 h-3" />
                      {reportedHistory?.total_reports_against || 0}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-white font-medium">
                    {report.reported_user?.display_name || report.reported_user?.full_name || report.reported_user?.first_name || 'Unknown User'}
                  </p>
                  {report.reported_user?.email && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.reported_user.email}
                    </p>
                  )}
                  {report.reported_user?.phone && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {report.reported_user.phone}
                    </p>
                  )}
                  {report.reported_user?.city && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {report.reported_user.city}
                    </p>
                  )}
                  {report.reported_user?.rating && (
                    <p className="text-white/60 text-sm flex items-center gap-1">
                      <Star className="w-3 h-3" /> Rating: {report.reported_user.rating}/5
                    </p>
                  )}
                  {report.reported_user?.total_reviews !== undefined && (
                    <p className="text-white/40 text-xs">({report.reported_user.total_reviews} reviews)</p>
                  )}
                  <p className="text-white/40 text-xs font-mono">{report.reported_id}</p>
                </div>
                <button
                  onClick={() => router.push(`/admin/users?userId=${report.reported_id}`)}
                  className="mt-3 w-full px-3 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Full Profile
                </button>
              </div>
            </div>
            
            {/* Reporter's Reports History */}
            {showReporterHistory && reporterHistory && reporterHistory.reports.length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-green-500/20">
                <h3 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Reports Made by This Reporter ({reporterHistory.total_reports_made})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reporterHistory.reports.map((r) => (
                    <div key={r.id} className="p-3 rounded bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${SEVERITY_CONFIG[r.severity]?.bg} text-white`}>
                          {SEVERITY_CONFIG[r.severity]?.label}
                        </span>
                        <span className="text-white/40 text-xs">{formatDate(r.created_at)}</span>
                      </div>
                      <p className="text-white/80 text-sm">{REPORT_TYPES[r.report_type] || r.report_type}</p>
                      <p className="text-white/40 text-xs truncate">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reports Against This User */}
            {showReportedHistory && reportedHistory && reportedHistory.reports.length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-red-500/20">
                <h3 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4" />
                  Reports Against This User ({reportedHistory.total_reports_against})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reportedHistory.reports.map((r) => (
                    <div key={r.id} className="p-3 rounded bg-white/5 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${SEVERITY_CONFIG[r.severity]?.bg} text-white`}>
                          {SEVERITY_CONFIG[r.severity]?.label}
                        </span>
                        <span className="text-white/40 text-xs">{formatDate(r.created_at)}</span>
                      </div>
                      <p className="text-white/80 text-sm">{REPORT_TYPES[r.report_type] || r.report_type}</p>
                      <p className="text-white/40 text-xs truncate">{r.description}</p>
                      <p className="text-white/30 text-xs mt-1">From: {r.reporter_id.slice(0,8)}... ({r.reporter_role})</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Context */}
            {(report.appointment_id || report.conversation_id) && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Related Context
                </h3>
                <div className="space-y-2">
                  {report.appointment_id && (
                    <div className="flex items-center justify-between p-3 rounded bg-white/5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <span className="text-white/60">Appointment ID</span>
                      </div>
                      <span className="text-white font-mono text-sm">{report.appointment_id}</span>
                    </div>
                  )}
                  {report.conversation_id && (
                    <div className="flex items-center justify-between p-3 rounded bg-white/5">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-white/40" />
                        <span className="text-white/60">Conversation ID</span>
                      </div>
                      <span className="text-white font-mono text-sm">{report.conversation_id}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Taken */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Action Taken
              </h3>
              <textarea
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Describe the action taken to resolve this report..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-medium mb-3">Update Status</h3>
              <div className="space-y-2">
                { Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedStatus(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        selectedStatus === key
                          ? `${config.color} border border-current`
                          : 'bg-white/5 hover:bg-white/10 text-white/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-medium mb-3">Admin Notes</h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this report..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] resize-none"
              />
            </div>

            {/* Admin Decision */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-medium mb-3">Decision</h3>
              <textarea
                value={adminDecision}
                onChange={(e) => setAdminDecision(e.target.value)}
                placeholder="Final decision regarding this report..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#667eea] resize-none"
              />
            </div>

            {/* Timeline */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-medium mb-3">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                  <div>
                    <p className="text-white text-sm">Report Submitted</p>
                    <p className="text-white/40 text-xs">{formatDate(report.created_at)}</p>
                  </div>
                </div>
                {report.reviewed_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                      <p className="text-white text-sm">Reviewed</p>
                      <p className="text-white/40 text-xs">{formatDate(report.reviewed_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
