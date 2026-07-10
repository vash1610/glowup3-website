import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const MODEL = 'claude-opus-4-8';

function adminDb() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export interface TicketContext {
  ticket: Record<string, unknown>;
  messages: Record<string, unknown>[];
  appointment: Record<string, unknown> | null;
  escrow: Record<string, unknown>[];
  walletTransactions: Record<string, unknown>[];
  stripePaymentIntent: Record<string, unknown> | null;
}

export interface DiagnosisResult {
  diagnosis: string;
  canResolve: boolean;
  draftReply: string | null;
  escalationReason: string | null;
}

// Gathers everything Claude needs to reason about a payment/appointment
// ticket. Prefers the explicit related_appointment_id/related_payment_id
// links on the ticket; falls back to the customer's recent activity when
// those aren't set (older tickets, or issues that don't map to one record).
export async function gatherTicketContext(ticketId: string): Promise<TicketContext> {
  const db = adminDb();

  const { data: ticket, error: ticketError } = await db
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (ticketError || !ticket) {
    throw new Error('Ticket not found');
  }

  const { data: messages } = await db
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  let appointment: Record<string, unknown> | null = null;
  const appointmentId = ticket.related_appointment_id;

  if (appointmentId) {
    const { data } = await db.from('appointments').select('*').eq('id', appointmentId).single();
    appointment = data ?? null;
  }

  const userId = ticket.user_id as string;

  const escrowQuery = appointmentId
    ? db.from('escrow').select('*').eq('appointment_id', appointmentId)
    : db
        .from('escrow')
        .select('*')
        .or(`customer_id.eq.${userId},pro_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(5);
  const { data: escrow } = await escrowQuery;

  const { data: walletTransactions } = await db
    .from('wallet_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // escrow.idempotency_key sometimes holds the Stripe PaymentIntent id
  // directly (observed format: "pi_..."). Pull its live status if so - this
  // is the ground truth for "did the payment actually succeed."
  let stripePaymentIntent: Record<string, unknown> | null = null;
  const paymentIntentId =
    (ticket.related_payment_id as string | null) ||
    (escrow || []).map((e) => e.idempotency_key as string).find((k) => k?.startsWith('pi_'));

  if (paymentIntentId) {
    const stripe = stripeClient();
    if (stripe) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        stripePaymentIntent = {
          id: pi.id,
          status: pi.status,
          amount: pi.amount,
          currency: pi.currency,
          created: pi.created,
          last_payment_error: pi.last_payment_error?.message || null,
        };
      } catch {
        // Not a real/reachable payment intent id - ignore, the AI works with what it has.
      }
    }
  }

  return {
    ticket,
    messages: messages || [],
    appointment,
    escrow: escrow || [],
    walletTransactions: walletTransactions || [],
    stripePaymentIntent,
  };
}

const SYSTEM_PROMPT = `You are a support diagnosis assistant for Todayly, a booking platform connecting customers with beauty/wellness professionals. Payments are reservation fees (held in escrow) and final in-salon payments, tracked in CZK.

You are given a support ticket plus the real database and Stripe records related to it (appointment, escrow holds, wallet transactions, and the live Stripe PaymentIntent status when available).

Your job:
1. Diagnose what actually happened, grounded ONLY in the provided data. Never guess at facts not present in the records.
2. Decide if you can confidently resolve this yourself. Only say you can resolve it if the data gives a clear, unambiguous answer (e.g. Stripe shows the charge succeeded and escrow/wallet records confirm it was credited - or Stripe shows the charge genuinely failed).
3. If you can resolve it, draft a reply to the customer in a warm, clear, non-technical tone. Never mention internal table names, IDs, or system implementation details to the customer.
4. If the data is ambiguous, contradictory, or insufficient, do NOT guess - set can_resolve to false and explain exactly what a human admin needs to check.

A human admin will review your diagnosis and either approve your draft to send, or handle it themselves if you escalated. Nothing you write is ever sent to the customer without human approval.`;

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    diagnosis: {
      type: 'string',
      description: 'Internal-facing explanation of what happened, citing the specific records that support it.',
    },
    can_resolve: {
      type: 'boolean',
      description: 'True only if the evidence is clear enough to confidently reply to the customer without human investigation.',
    },
    draft_reply: {
      type: ['string', 'null'],
      description: 'Customer-facing reply draft. Null if can_resolve is false.',
    },
    escalation_reason: {
      type: ['string', 'null'],
      description: 'Why this needs a human, and what they should check. Null if can_resolve is true.',
    },
  },
  required: ['diagnosis', 'can_resolve', 'draft_reply', 'escalation_reason'],
  additionalProperties: false,
};

export async function diagnoseTicket(context: TicketContext): Promise<DiagnosisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
    thinking: { type: 'adaptive' },
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Ticket and related records:\n\n${JSON.stringify(context, null, 2)}`,
      },
    ],
    output_config: {
      format: {
        type: 'json_schema',
        schema: RESPONSE_SCHEMA,
      },
    },
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock) {
    throw new Error('AI did not return a text response');
  }

  const parsed = JSON.parse(textBlock.text) as {
    diagnosis: string;
    can_resolve: boolean;
    draft_reply: string | null;
    escalation_reason: string | null;
  };

  return {
    diagnosis: parsed.diagnosis,
    canResolve: parsed.can_resolve,
    draftReply: parsed.draft_reply,
    escalationReason: parsed.escalation_reason,
  };
}
