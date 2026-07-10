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
    
    const status = searchParams.get('status'); // 'pending', 'completed', 'failed', 'refunded'
    const type = searchParams.get('type'); // 'payment', 'refund', 'payout'
    const userId = searchParams.get('user_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();
    let query = supabase
      .from('transactions')
      .select(`
        *,
        customer:customers(full_name, email),
        professional:professionals(full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (type) {
      query = query.eq('transaction_type', type);
    }
    
    if (userId) {
      query = query.or(`customer_id.eq.${userId},professional_id.eq.${userId}`);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // Calculate totals
    let totals = { total_amount: 0, count: 0 };
    if (data && data.length > 0) {
      totals = {
        total_amount: data.reduce((sum: number, t: Record<string, unknown>) => sum + (Number(t.amount) || 0), 0),
        count: count || 0
      };
    }

    await logAdminAction(session.userId!, 'LIST_TRANSACTIONS', { status, type, page, limit });

    return NextResponse.json({
      transactions: data,
      totals,
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
