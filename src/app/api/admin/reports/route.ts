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

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    const status = searchParams.get('status');
    const reportType = searchParams.get('report_type');
    const reportedId = searchParams.get('reported_id');
    const reporterId = searchParams.get('reporter_id');
    const severity = searchParams.get('severity');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();
    let query = supabase
      .from('user_reports')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    
    if (reportType) {
      query = query.eq('report_type', reportType);
    }
    
    if (severity) {
      query = query.eq('severity', severity);
    }
    
    if (reportedId) {
      query = query.eq('reported_id', reportedId);
    }
    
    if (reporterId) {
      query = query.eq('reporter_id', reporterId);
    }

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    // Fetch reporter and reported user info separately based on their roles
    const reportsWithUsers = await Promise.all(
      (data || []).map(async (report) => {
        let reporterInfo = null;
        let reportedInfo = null;

        // Fetch reporter info based on reporter_role
        if (report.reporter_id) {
          const reporterTable = report.reporter_role === 'professional' ? 'professionals' : 'customers';
          const { data: reporter } = await supabase
            .from(reporterTable)
            .select('id, full_name, email')
            .eq('id', report.reporter_id)
            .single();
          reporterInfo = reporter;
        }

        // Fetch reported user info based on reported_role
        if (report.reported_id) {
          const reportedTable = report.reported_role === 'professional' ? 'professionals' : 'customers';
          const { data: reported } = await supabase
            .from(reportedTable)
            .select('id, full_name, email')
            .eq('id', report.reported_id)
            .single();
          reportedInfo = reported;
        }

        return {
          ...report,
          reporter: reporterInfo,
          reported_user: reportedInfo
        };
      })
    );

    await logAdminAction(session.userId!, 'LIST_REPORTS', { status, reportType, severity, page, limit });

    return NextResponse.json({
      reports: reportsWithUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      reporter_id, 
      reporter_role, 
      reported_id, 
      reported_role, 
      report_type, 
      severity, 
      description,
      evidence 
    } = body;

    // Validate required fields based on new schema
    if (!reporter_id || !reported_id || !report_type || !description) {
      return NextResponse.json({ 
        error: 'Reporter ID, reported ID, report type, and description are required' 
      }, { status: 400 });
    }

    // Validate report_type against allowed values
    const validReportTypes = [
      'no_show', 
      'rude_behavior', 
      'suspicious_activity', 
      'service_not_as_described', 
      'payment_dispute', 
      'harassment', 
      'fake_review', 
      'cancellation_abuse', 
      'other'
    ];
    if (!validReportTypes.includes(report_type)) {
      return NextResponse.json({ 
        error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Validate severity if provided
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json({ 
        error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` 
      }, { status: 400 });
    }

    // Validate reporter role if provided
    const validRoles = ['customer', 'professional'];
    if (reporter_role && !validRoles.includes(reporter_role)) {
      return NextResponse.json({ 
        error: `Invalid reporter role. Must be one of: ${validRoles.join(', ')}` 
      }, { status: 400 });
    }

    // Validate reported role if provided
    if (reported_role && !validRoles.includes(reported_role)) {
      return NextResponse.json({ 
        error: `Invalid reported role. Must be one of: ${validRoles.join(', ')}` 
      }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify reporter exists in the appropriate table
    const reporterTable = reporter_role === 'professional' ? 'professionals' : 'customers';
    const { error: reporterError } = await supabase
      .from(reporterTable)
      .select('id')
      .eq('id', reporter_id)
      .single();

    if (reporterError) {
      return NextResponse.json({ error: 'Reporter not found' }, { status: 404 });
    }

    // Verify reported user exists in the appropriate table
    const reportedTable = reported_role === 'professional' ? 'professionals' : 'customers';
    const { error: reportedError } = await supabase
      .from(reportedTable)
      .select('id')
      .eq('id', reported_id)
      .single();

    if (reportedError) {
      return NextResponse.json({ error: 'Reported user not found' }, { status: 404 });
    }

    // Create the report with new schema
    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .insert({
        reporter_id,
        reporter_role: reporter_role || 'customer',
        reported_id,
        reported_role: reported_role || 'customer',
        report_type,
        severity: severity || 'medium',
        description,
        evidence,
        status: 'pending'
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report:', reportError);
      return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'CREATE_REPORT', { 
      reportId: report.id, 
      reporterId: reporter_id, 
      reportedId: reported_id,
      reportType: report_type,
      severity: severity || 'medium'
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
