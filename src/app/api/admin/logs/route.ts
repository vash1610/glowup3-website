import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    const level = searchParams.get('level'); // 'error', 'warning', 'info'
    const source = searchParams.get('source'); // 'api', 'app', 'database'
    const userId = searchParams.get('user_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search'); // Search in error message
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();
    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (level) {
      query = query.eq('level', level);
    }
    
    if (source) {
      query = query.eq('source', source);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (search) {
      query = query.or(`message.ilike.%${search}%,stack_trace.ilike.%${search}%`);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    // Get counts by level for stats
    const { data: statsData } = await supabase
      .from('error_logs')
      .select('level');

    const stats = {
      error: 0,
      warning: 0,
      info: 0,
      total: statsData?.length || 0
    };

    statsData?.forEach((log: Record<string, string>) => {
      if (log.level === 'error') stats.error++;
      else if (log.level === 'warning') stats.warning++;
      else if (log.level === 'info') stats.info++;
    });

    await logAdminAction(session.userId!, 'LIST_LOGS', { level, source, page, limit });

    return NextResponse.json({
      logs: data,
      stats,
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
