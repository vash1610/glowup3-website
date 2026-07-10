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

// GET /api/admin/tickets/[id] - Get single ticket with messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    
    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Get messages
    const { data: messages } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    // Always include description as the first message if it exists
    let allMessages = messages || [];
    if (ticket.description) {
      const descMessage = {
        id: 'initial-description',
        ticket_id: ticket.id,
        sender_id: ticket.user_id,
        sender_type: 'customer',
        content: ticket.description,
        created_at: ticket.created_at
      };
      // Only add if not already in messages
      if (!allMessages.some(m => m.id === 'initial-description')) {
        allMessages = [descMessage, ...allMessages];
      }
    }

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        ticket_type: ticket.ticket_type,
        user_role: ticket.user_role,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        resolved_at: ticket.resolved_at,
        closed_at: ticket.closed_at,
        user_id: ticket.user_id,
        user_name: ticket.user_name,
        assigned_to: ticket.assigned_to,
        messages: allMessages,
        resolution_note: ticket.resolution_note
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/tickets/[id] - Update ticket or add reply
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reply, resolution_note, assigned_to } = body;

    const supabase = createAdminClient();
    
    // Get current ticket to check previous status
    const { data: currentTicket } = await supabase
      .from('support_tickets')
      .select('status')
      .eq('id', id)
      .single();
    
    const previousStatus = currentTicket?.status || 'open';
    
    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Handle status change
    if (status) {
      updates.status = status;
      
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolution_note = resolution_note || 'Issue resolved';
      }
      
      if (status === 'in_progress' && !reply) {
        // Reopening - keep resolved_at but set to in_progress
      }
    }

    // Helper function to get status message
    const getStatusMessage = (newStatus: string, previousStatus: string) => {
      if (newStatus === 'in_progress') {
        return '🔄 Ticket is now being worked on by our support team';
      }
      if (newStatus === 'resolved') {
        return '✅ Your ticket has been marked as resolved';
      }
      if (newStatus === 'closed') {
        return '🔴 Ticket has been closed. If you need further assistance, please create a new ticket.';
      }
      return null;
    };

    // Handle assignment
    if (assigned_to !== undefined) {
      updates.assigned_to = assigned_to;
    }

    // Update ticket
    const { error: updateError } = await supabase
      .from('support_tickets')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('Error updating ticket:', updateError);
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }

    // Add system message for status changes
    if (status && status !== previousStatus) {
      const statusMessage = getStatusMessage(status, previousStatus);
      if (statusMessage) {
        await supabase
          .from('ticket_messages')
          .insert({
            ticket_id: id,
            sender_id: 'system',
            sender_type: 'system',
            content: statusMessage
          });
      }
    }

    // Add reply message if provided
    if (reply && reply.trim()) {
      await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: id,
          sender_id: session.userId,
          sender_type: 'admin',
          content: reply.trim()
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/tickets/[id] - Delete a ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();
    
    // Delete messages first (should be cascade but let's be safe)
    await supabase.from('ticket_messages').delete().eq('ticket_id', id);
    
    // Delete ticket
    const { error: deleteError } = await supabase
      .from('support_tickets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting ticket:', deleteError);
      return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}