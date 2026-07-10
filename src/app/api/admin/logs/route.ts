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
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    const priority = searchParams.get('priority'); // error_logs.error_priority
    const category = searchParams.get('category'); // error_logs.category
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
    if (priority) {
      query = query.eq('error_priority', priority);
    }

    if (category) {
      query = query.eq('category', category);
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

    // Get counts by priority for stats
    const { data: statsData } = await supabase
      .from('error_logs')
      .select('error_priority');

    const stats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: statsData?.length || 0
    };

    statsData?.forEach((log: Record<string, string>) => {
      const p = log.error_priority as keyof typeof stats;
      if (p && p in stats && p !== 'total') stats[p]++;
    });

    await logAdminAction(session.userId!, 'LIST_LOGS', { priority, category, page, limit });

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
