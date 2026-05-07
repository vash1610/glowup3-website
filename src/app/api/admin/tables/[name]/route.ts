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

const ALLOWED_TABLES = [
  'users', 'customers', 'professionals', 'appointments', 
  'reviews', 'services', 'transactions', 'support_tickets',
  'user_flags', 'user_reports', 'error_logs'
];

function isTableAllowed(tableName: string): boolean {
  const validPattern = /^[a-zA-Z_][a-zA-Z0-9_]{0,49}$/;
  return validPattern.test(tableName) && ALLOWED_TABLES.includes(tableName);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    
    if (!isTableAllowed(name)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = (page - 1) * limit;
    
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    
    let query = supabase.from(name).select('*', { count: 'exact' });
    
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) {
        filters[key] = value;
      }
    });
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value.startsWith('^')) {
        query = query.ilike(key, value.substring(1) + '%');
      } else if (value.includes(',')) {
        query = query.in(key, value.split(','));
      } else {
        query = query.eq(key, value);
      }
    });
    
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error(`Error querying ${name}:`, error);
      return NextResponse.json({ error: 'Failed to query table' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'QUERY_TABLE', { table: name, filters, page, limit });

    return NextResponse.json({
      data,
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    
    if (!isTableAllowed(name)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(name)
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting into ${name}:`, error);
      return NextResponse.json({ error: 'Failed to insert record' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'INSERT_RECORD', { table: name, recordId: data.id });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    
    if (!isTableAllowed(name)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from(name)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${name}:`, error);
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'UPDATE_RECORD', { table: name, recordId: id });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;
    
    if (!isTableAllowed(name)) {
      return NextResponse.json({ error: 'Table not allowed' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from(name)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${name}:`, error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'DELETE_RECORD', { table: name, recordId: id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
