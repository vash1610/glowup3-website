import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function logAdminAction(adminId: string, action: string, details: Record<string, unknown>) {
  console.log(`[ADMIN AUDIT] ${new Date().toISOString()} | Admin: ${adminId} | Action: ${action} | Details:`, details);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    
    const { data: report, error } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch reporter user info with full details - try both full_name and display_name
    let reporterInfo = null;
    if (report.reporter_id) {
      const reporterTable = report.reporter_role === 'professional' ? 'professionals' : 'customers';
      const { data: reporter } = await supabase
        .from(reporterTable)
        .select('*')
        .eq('id', report.reporter_id)
        .single();
      
      // Normalize field names - prefer full_name, fall back to display_name
      if (reporter) {
        // Handle empty strings as null, prefer first_name + last_name since display_name is empty
        const fullName = reporter.full_name;
        const displayName = reporter.display_name || '';
        const firstName = reporter.first_name || '';
        const lastName = reporter.last_name || '';
        
        const resolvedName = fullName 
          || (displayName.trim() || '') 
          || (firstName && lastName ? `${firstName} ${lastName}` : firstName) 
          || null;
        
        reporterInfo = {
          ...reporter,
          display_name: resolvedName
        };
      }
    }

    // Fetch reported user info with full details
    let reportedUserInfo = null;
    if (report.reported_id) {
      const reportedTable = report.reported_role === 'professional' ? 'professionals' : 'customers';
      const { data: reported } = await supabase
        .from(reportedTable)
        .select('*')
        .eq('id', report.reported_id)
        .single();
      
      // Normalize field names - prefer full_name, fall back to display_name
      if (reported) {
        // Handle empty strings as null, prefer first_name + last_name since display_name is empty
        const fullName = reported.full_name;
        const displayName = reported.display_name || '';
        const firstName = reported.first_name || '';
        const lastName = reported.last_name || '';
        
        const resolvedName = fullName 
          || (displayName.trim() || '') 
          || (firstName && lastName ? `${firstName} ${lastName}` : firstName) 
          || null;
        
        reportedUserInfo = {
          ...reported,
          display_name: resolvedName
        };
      }
    }

    // Fetch reporting history: reports made BY this reporter
    const { data: reporterReports } = await supabase
      .from('user_reports')
      .select('*')
      .eq('reporter_id', report.reporter_id)
      .order('created_at', { ascending: false });

    // Fetch reported history: reports received BY this reported user
    const { data: reportedByCount } = await supabase
      .from('user_reports')
      .select('id', { count: 'exact' })
      .eq('reported_id', report.reported_id);

    // Fetch who reported this user (detailed)
    const { data: reportsAgainstUser } = await supabase
      .from('user_reports')
      .select('*')
      .eq('reported_id', report.reported_id)
      .order('created_at', { ascending: false });

    await logAdminAction(session.userId!, 'VIEW_REPORT', { reportId: id });

    return NextResponse.json({
      report: {
        ...report,
        reporter: reporterInfo,
        reported_user: reportedUserInfo,
      },
      reporter_history: {
        total_reports_made: reporterReports?.length || 0,
        reports: reporterReports || [],
      },
      reported_history: {
        total_reports_against: reportedByCount?.length || 0,
        reports: reportsAgainstUser || [],
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { 
      status,
      admin_notes,
      admin_decision,
      action_taken,
      severity
    } = body;

    const supabase = createAdminClient();

    // Build update object
    const updates: Record<string, unknown> = {};
    
    if (status !== undefined) {
      updates.status = status;
      // Auto-set reviewed_at when status changes to reviewed
      if (status === 'reviewed' || status === 'resolved' || status === 'dismissed') {
        updates.reviewed_at = new Date().toISOString();
        updates.reviewed_by = session.userId;
      }
    }
    
    if (admin_notes !== undefined) {
      updates.admin_notes = admin_notes;
    }
    
    if (admin_decision !== undefined) {
      updates.admin_decision = admin_decision;
    }
    
    if (action_taken !== undefined) {
      updates.action_taken = action_taken;
    }
    
    if (severity !== undefined) {
      updates.severity = severity;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Don't include updated_at if column doesn't exist
    if (updates.updated_at) {
      delete updates.updated_at;
    }

    const { data: updatedReport, error } = await supabase
      .from('user_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating report:', error);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'UPDATE_REPORT', { 
      reportId: id, 
      updates 
    });

    return NextResponse.json({ report: updatedReport });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
