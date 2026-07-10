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
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// POST /api/admin/tickets/[id]/approve-send - the ONLY path that turns an AI
// draft into a real customer-facing message. Requires an admin session and an
// explicit call - nothing here runs automatically.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { draftId, replyText } = body;

  if (!draftId || !replyText || !replyText.trim()) {
    return NextResponse.json({ error: 'draftId and replyText are required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: draft, error: draftError } = await supabase
    .from('ticket_ai_drafts')
    .select('id, ticket_id, status')
    .eq('id', draftId)
    .eq('ticket_id', id)
    .single();

  if (draftError || !draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  }

  if (draft.status !== 'pending') {
    return NextResponse.json({ error: `Draft already ${draft.status}` }, { status: 409 });
  }

  const { error: messageError } = await supabase.from('ticket_messages').insert({
    ticket_id: id,
    sender_id: session.userId,
    sender_type: 'admin',
    content: replyText.trim(),
  });

  if (messageError) {
    console.error('Failed to send approved reply:', messageError);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }

  await supabase
    .from('ticket_ai_drafts')
    .update({ status: 'approved', resolved_at: new Date().toISOString() })
    .eq('id', draftId);

  await supabase
    .from('support_tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id);

  return NextResponse.json({ success: true });
}
