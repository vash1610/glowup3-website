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
    
    const status = searchParams.get('status'); // 'open', 'in_progress', 'resolved', 'closed'
    const priority = searchParams.get('priority'); // 'low', 'medium', 'high', 'urgent'
    const assignedTo = searchParams.get('assigned_to');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    const supabase = createAdminClient();
    let query = supabase
      .from('support_tickets')
      .select(`
        *,
        customer:customers(full_name, email),
        professional:professionals(full_name, email),
        assignee:users(full_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'LIST_TICKETS', { status, priority, page, limit });

    return NextResponse.json({
      tickets: data,
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
    const { user_id, user_type, subject, description, priority, category } = body;

    if (!subject || !description) {
      return NextResponse.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Validate user exists
    const table = user_type === 'professional' ? 'professionals' : 'customers';
    const { error: userError } = await supabase
      .from(table)
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id,
        user_type,
        subject,
        description,
        priority: priority || 'medium',
        category: category || 'general',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'CREATE_TICKET', { ticketId: ticket.id, userId: user_id });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
