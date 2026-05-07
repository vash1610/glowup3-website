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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    const type = searchParams.get('type'); // 'customer' | 'professional'
    const status = searchParams.get('status'); // 'active' | 'locked' | 'flagged'
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();

    // Build query for customers
    let query = supabase.from('customers').select('*', { count: 'exact' });
    
    // Apply filters
    if (status === 'locked') {
      query = query.eq('is_locked', true);
    } else if (status === 'active') {
      query = query.eq('is_locked', false);
    }
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply sorting and pagination
    const { data: customers, count: customerCount, error: customerError } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (customerError) {
      console.error('Error fetching customers:', customerError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Fetch professionals if type is 'professional' or not specified
    let professionals: unknown[] = [];
    let professionalCount = 0;
    
    if (!type || type === 'professional') {
      let proQuery = supabase.from('professionals').select('*', { count: 'exact' });
      
      if (status === 'locked') {
        proQuery = proQuery.eq('is_locked', true);
      } else if (status === 'active') {
        proQuery = proQuery.eq('is_locked', false);
      }
      
      if (search) {
        proQuery = proQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }
      
      const { data: pros, count: proCount, error: proError } = await proQuery
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);
      
      if (!proError && pros) {
        professionals = pros;
        professionalCount = proCount || 0;
      }
    }

    // Format and combine results
    const formattedCustomers = (customers || []).map(c => ({
      ...c,
      user_type: 'customer'
    }));
    
    const formattedPros = (professionals as Array<Record<string, unknown>>).map(p => ({
      ...p,
      user_type: 'professional'
    }));

    const allUsers = [...formattedCustomers, ...formattedPros];
    const totalCount = (customerCount || 0) + professionalCount;

    await logAdminAction(session.userId!, 'LIST_USERS', { type, status, search, page, limit });

    return NextResponse.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
