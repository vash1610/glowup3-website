import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function createAdminClient() {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function verifyAdminSession(): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return { valid: false, error: 'No session token' };
    }
    
    const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    if (!session.userId || !session.isAdmin || session.exp < Date.now()) {
      return { valid: false, error: 'Invalid or expired session' };
    }
    
    return { valid: true, userId: session.userId };
  } catch {
    return { valid: false, error: 'Invalid session format' };
  }
}

async function logAdminAction(adminId: string, action: string, details: Record<string, unknown>) {
  console.log(`[ADMIN AUDIT] ${new Date().toISOString()} | Admin: ${adminId} | Action: ${action} | Details:`, details);
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    const status = searchParams.get('status');
    const reportType = searchParams.get('type');
    const reportedUserId = searchParams.get('reported_user_id');
    const reporterId = searchParams.get('reporter_id');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();
    let query = supabase
      .from('user_reports')
      .select(`
        *,
        reporter:customers!user_reports_reporter_id_fkey(id, full_name, email),
        reported_user:customers!user_reports_reported_user_id_fkey(id, full_name, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }
    
    if (reportType) {
      query = query.eq('report_type', reportType);
    }
    
    if (reportedUserId) {
      query = query.eq('reported_user_id', reportedUserId);
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

    await logAdminAction(session.userId!, 'LIST_REPORTS', { status, reportType, page, limit });

    return NextResponse.json({
      reports: data,
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
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reporter_id, reporter_type, reported_user_id, report_type, reason, description, evidence } = body;

    if (!reporter_id || !reported_user_id || !report_type || !reason) {
      return NextResponse.json({ 
        error: 'Reporter ID, reported user ID, report type, and reason are required' 
      }, { status: 400 });
    }

    const validTypes = ['user', 'content', 'behavior', 'spam', 'harassment', 'inappropriate'];
    if (!validTypes.includes(report_type)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const reporterTable = reporter_type === 'professional' ? 'professionals' : 'customers';
    const { error: reporterError } = await supabase
      .from(reporterTable)
      .select('id')
      .eq('id', reporter_id)
      .single();

    if (reporterError) {
      return NextResponse.json({ error: 'Reporter not found' }, { status: 404 });
    }

    const reportedTable = reporter_type === 'professional' ? 'professionals' : 'customers';
    const { error: reportedError } = await supabase
      .from(reportedTable)
      .select('id')
      .eq('id', reported_user_id)
      .single();

    if (reportedError) {
      return NextResponse.json({ error: 'Reported user not found' }, { status: 404 });
    }

    const { data: report, error: reportError } = await supabase
      .from('user_reports')
      .insert({
        reporter_id,
        reporter_type: reporter_type || 'customer',
        reported_user_id,
        report_type,
        reason,
        description,
        evidence,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      reportedUserId: reported_user_id,
      reportType: report_type 
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
