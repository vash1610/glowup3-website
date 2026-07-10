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

// GET /api/admin/tickets - List all tickets
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();

    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // Get all tickets - matching actual database schema
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        id,
        subject,
        description,
        status,
        priority,
        ticket_type,
        user_role,
        user_id,
        created_at,
        updated_at,
        message_count,
        assigned_to,
        resolved_at,
        closed_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }

    return NextResponse.json({ tickets: tickets || [] });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/tickets - Create a new ticket (for testing)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, priority, category, user_email } = body;

    if (!title || !description || !user_email) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, description, user_email' 
      }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Generate ticket ID
    const ticketId = crypto.randomUUID();
    
    // Insert ticket
    const { error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        id: ticketId,
        subject: title,
        status: 'open',
        priority: priority || 'medium',
        category: category || 'General',
        user_id: user_email,
        message_count: 0
      });

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    // Insert first message (the description)
    await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: user_email,
        sender_type: 'customer',
        content: description
      });

    return NextResponse.json({ 
      success: true, 
      ticket_id: ticketId,
      message: 'Ticket created successfully' 
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}