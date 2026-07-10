import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import { gatherTicketContext, diagnoseTicket } from '@/lib/ai/ticket-assistant';

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

// GET /api/admin/tickets/[id]/ai-draft - fetch the latest draft, if any
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ticket_ai_drafts')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }

  return NextResponse.json({ draft: data });
}

// POST /api/admin/tickets/[id]/ai-draft - run AI diagnosis and store a new draft
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const context = await gatherTicketContext(id);
    const result = await diagnoseTicket(context);

    const supabase = createAdminClient();
    const { data: draft, error } = await supabase
      .from('ticket_ai_drafts')
      .insert({
        ticket_id: id,
        requested_by: session.email,
        diagnosis: result.diagnosis,
        can_resolve: result.canResolve,
        draft_reply: result.draftReply,
        escalation_reason: result.escalationReason,
        status: 'pending',
        context: {
          appointment_id: context.appointment?.id ?? null,
          escrow_count: context.escrow.length,
          wallet_transaction_count: context.walletTransactions.length,
          stripe_payment_intent: context.stripePaymentIntent,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store AI draft:', error);
      return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
    }

    return NextResponse.json({ draft });
  } catch (err) {
    console.error('AI diagnosis error:', err);
    const message = err instanceof Error ? err.message : 'AI diagnosis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/tickets/[id]/ai-draft - discard a pending draft (escalate to human)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdminSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const draftId = body.draftId;

  if (!draftId) {
    return NextResponse.json({ error: 'draftId is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('ticket_ai_drafts')
    .update({ status: 'discarded', resolved_at: new Date().toISOString() })
    .eq('id', draftId)
    .eq('ticket_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to discard draft' }, { status: 500 });
  }

  return NextResponse.json({ draft: data });
}
