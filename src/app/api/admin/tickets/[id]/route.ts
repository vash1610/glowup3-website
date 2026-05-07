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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch ticket with related data
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        customer:customers(id, full_name, email),
        professional:professionals(id, full_name, email),
        assignee:users(id, full_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ticket:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
    }

    // Fetch ticket messages/responses if available
    const { data: messages } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    await logAdminAction(session.userId!, 'VIEW_TICKET', { ticketId: id });

    return NextResponse.json({
      ticket,
      messages: messages || []
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
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, priority, assigned_to, response, add_message } = body;

    const supabase = createAdminClient();
    
    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = status;
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
      }
      updates.priority = priority;
    }

    if (assigned_to !== undefined) {
      updates.assigned_to = assigned_to;
    }

    // Update ticket
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ticket:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // Add message if provided
    if (add_message || response) {
      await supabase.from('ticket_messages').insert({
        ticket_id: id,
        sender_id: session.userId,
        sender_type: 'admin',
        message: response || add_message,
        created_at: new Date().toISOString()
      });
    }

    await logAdminAction(session.userId!, 'UPDATE_TICKET', { 
      ticketId: id, 
      updates: { status, priority, assigned_to } 
    });

    return NextResponse.json({ ticket });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
