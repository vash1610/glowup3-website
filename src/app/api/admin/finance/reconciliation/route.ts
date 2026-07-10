import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { czkToCents } from '@/lib/finance-utils';

// Initialize Supabase admin client with service role
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

// reconciliation_logs stores money in CZK cents (bigint) to match Stripe's
// native units. Every other finance table in this app (appointments, escrow,
// wallet_transactions, customer_wallets, pro_wallets) stores plain CZK major
// units — convert with czkToCents() before writing here, never write raw values.

interface ReconciliationSummary {
  supabaseTotalCzk: number;
  stripeTotalCzk: number;
  discrepancyCzk: number;
  status: 'pending' | 'completed';
  severity: 'info' | 'warning' | 'critical';
}

function computeSeverity(discrepancyCzk: number): 'info' | 'warning' | 'critical' {
  const abs = Math.abs(discrepancyCzk);
  if (abs > 10000) return 'critical';
  if (abs > 1000) return 'warning';
  return 'info';
}

async function computeSupabaseSideTotal(): Promise<{ total: number; count: number }> {
  // "Supabase side" = money that has actually settled: completed appointment
  // payments. Wallet transactions and escrow holds are intermediate states,
  // not final revenue, so they're reported separately rather than folded in
  // (folding them in was the earlier bug — it compared apples to oranges).
  const { data: appointments, error } = await supabaseAdmin
    .from('appointments')
    .select('final_price, status')
    .eq('status', 'completed');

  if (error) {
    console.error('Reconciliation: appointments query failed:', error);
    return { total: 0, count: 0 };
  }

  const total = (appointments || []).reduce((sum, apt) => sum + (apt.final_price || 0), 0);
  return { total, count: appointments?.length || 0 };
}

async function computeStripeSideTotal(): Promise<{
  total: number;
  count: number;
  availableCents: number;
  pendingCents: number;
}> {
  const balance = await stripe.balance.retrieve();
  const availableCents = balance.available.reduce((sum, b) => sum + b.amount, 0);
  const pendingCents = balance.pending.reduce((sum, b) => sum + b.amount, 0);

  const transactions = await stripe.balanceTransactions.list({ limit: 100 });

  return {
    total: availableCents + pendingCents,
    count: transactions.data.length,
    availableCents,
    pendingCents,
  };
}

interface MatchResult {
  missingTransactions: Array<{ payment_intent_id: string; amount_czk: number; created: string; description: string }>;
  extraTransactions: Array<{ escrow_id: string; idempotency_key: string; amount_czk: number; appointment_id: string | null; reason: string }>;
  discrepancyTransactions: Array<{ payment_intent_id: string; escrow_id: string; stripe_amount_czk: number; escrow_amount_czk: number }>;
}

// Real per-transaction matching across the two payment types that actually
// hit Stripe: appointment reservation fees (tracked in escrow) and
// subscriptions (tracked in user_subscriptions, keyed by Stripe customer id).
// A Stripe PaymentIntent whose description says "Subscription ..." is
// resolved against user_subscriptions instead of escrow - checking it
// against escrow would always "fail" since subscriptions never create an
// escrow row, producing false-positive noise instead of real signal.
// escrow.idempotency_key holds the Stripe PaymentIntent id for card-funded
// escrow (wallet-funded escrow uses a different key format, excluded here).
async function matchTransactions(): Promise<MatchResult> {
  const windowStart = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60; // 90 days

  const [paymentIntents, escrowResult, subscriptionsResult] = await Promise.all([
    stripe.paymentIntents.list({ created: { gte: windowStart }, limit: 100 }),
    supabaseAdmin
      .from('escrow')
      .select('id, appointment_id, amount, status, idempotency_key, created_at')
      .gte('created_at', new Date(windowStart * 1000).toISOString())
      .like('idempotency_key', 'pi_%'),
    supabaseAdmin.from('user_subscriptions').select('stripe_customer_id').not('stripe_customer_id', 'is', null),
  ]);

  const escrowRows = escrowResult.data || [];
  const subscribedCustomerIds = new Set((subscriptionsResult.data || []).map((s) => s.stripe_customer_id));
  const succeededPIs = paymentIntents.data.filter((pi) => pi.status === 'succeeded');
  const escrowByPI = new Map(escrowRows.map((e) => [e.idempotency_key, e]));

  const missingTransactions: MatchResult['missingTransactions'] = [];
  const discrepancyTransactions: MatchResult['discrepancyTransactions'] = [];

  for (const pi of succeededPIs) {
    const isSubscriptionPayment = (pi.description || '').toLowerCase().includes('subscription');

    if (isSubscriptionPayment) {
      const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id;
      if (!customerId || !subscribedCustomerIds.has(customerId)) {
        missingTransactions.push({
          payment_intent_id: pi.id,
          amount_czk: pi.amount / 100,
          created: new Date(pi.created * 1000).toISOString(),
          description: `${pi.description} - no active user_subscriptions row for this Stripe customer`,
        });
      }
      continue;
    }

    const escrow = escrowByPI.get(pi.id);
    const stripeAmountCzk = pi.amount / 100;

    if (!escrow) {
      missingTransactions.push({
        payment_intent_id: pi.id,
        amount_czk: stripeAmountCzk,
        created: new Date(pi.created * 1000).toISOString(),
        description: pi.description || 'Succeeded Stripe payment with no matching escrow record',
      });
      continue;
    }

    if (Math.abs(stripeAmountCzk - escrow.amount) > 1) {
      discrepancyTransactions.push({
        payment_intent_id: pi.id,
        escrow_id: escrow.id,
        stripe_amount_czk: stripeAmountCzk,
        escrow_amount_czk: escrow.amount,
      });
    }
  }

  const succeededPIIds = new Set(succeededPIs.map((pi) => pi.id));
  const extraTransactions: MatchResult['extraTransactions'] = [];

  for (const escrow of escrowRows) {
    if (succeededPIIds.has(escrow.idempotency_key)) continue;

    let reason = 'No matching Stripe payment intent found for this window';
    try {
      const pi = await stripe.paymentIntents.retrieve(escrow.idempotency_key);
      reason = `Stripe payment intent status is "${pi.status}", not succeeded`;
    } catch {
      reason = 'Stripe payment intent not found (invalid or from a different Stripe account/mode)';
    }

    extraTransactions.push({
      escrow_id: escrow.id,
      idempotency_key: escrow.idempotency_key,
      amount_czk: escrow.amount,
      appointment_id: escrow.appointment_id,
      reason,
    });
  }

  return { missingTransactions, extraTransactions, discrepancyTransactions };
}

async function runReconciliation(
  reconciliationType: string,
  notes: string,
  checkedBy?: string
): Promise<{
  summary: ReconciliationSummary;
  logEntry: unknown;
  stripeAvailableCzk: number;
  stripePendingCzk: number;
  matches: MatchResult;
}> {
  const [supabaseSide, stripeSide, matches] = await Promise.all([
    computeSupabaseSideTotal(),
    computeStripeSideTotal(),
    matchTransactions(),
  ]);

  const supabaseTotalCents = czkToCents(supabaseSide.total);
  const stripeTotalCents = stripeSide.total; // already in cents from Stripe
  const discrepancyCents = supabaseTotalCents - stripeTotalCents;

  const unmatchedCount = matches.missingTransactions.length + matches.extraTransactions.length + matches.discrepancyTransactions.length;
  let severity = computeSeverity(discrepancyCents / 100);
  if (unmatchedCount > 0 && severity === 'info') severity = 'warning';
  if (matches.extraTransactions.length > 0) severity = 'critical'; // grants with no real payment behind them

  const { data: logEntry, error: logError } = await supabaseAdmin
    .from('reconciliation_logs')
    .insert({
      reconciliation_date: new Date().toISOString().slice(0, 10),
      reconciliation_type: reconciliationType,
      supabase_total: supabaseTotalCents,
      stripe_total: stripeTotalCents,
      discrepancy_amount: discrepancyCents,
      supabase_transaction_count: supabaseSide.count,
      stripe_transaction_count: stripeSide.count,
      count_discrepancy: supabaseSide.count - stripeSide.count,
      status: 'completed',
      severity,
      findings: {
        unmatched_count: unmatchedCount,
        missing_count: matches.missingTransactions.length,
        extra_count: matches.extraTransactions.length,
        discrepancy_count: matches.discrepancyTransactions.length,
      },
      missing_transactions: matches.missingTransactions,
      extra_transactions: matches.extraTransactions,
      discrepancy_transactions: matches.discrepancyTransactions,
      checked_by: checkedBy || null,
      notes,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (logError) {
    console.error('Failed to log reconciliation:', logError);
  }

  return {
    summary: {
      supabaseTotalCzk: supabaseSide.total,
      stripeTotalCzk: stripeTotalCents / 100,
      discrepancyCzk: discrepancyCents / 100,
      status: 'completed',
      severity,
    },
    logEntry,
    stripeAvailableCzk: stripeSide.availableCents / 100,
    stripePendingCzk: stripeSide.pendingCents / 100,
    matches,
  };
}

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { summary, stripeAvailableCzk, stripePendingCzk, matches } = await runReconciliation(
      'manual',
      'Reconciliation check from admin dashboard'
    );

    const { data: history, error: historyError } = await supabaseAdmin
      .from('reconciliation_logs')
      .select('*')
      .order('reconciliation_date', { ascending: false })
      .limit(50);

    if (historyError) {
      console.error('History error:', historyError);
    }

    return NextResponse.json({
      success: true,
      current: {
        supabaseTotal: summary.supabaseTotalCzk,
        stripeTotal: summary.stripeTotalCzk,
        discrepancy: summary.discrepancyCzk,
        status: Math.abs(summary.discrepancyCzk) > 0 ? 'mismatch' : 'match',
        severity: summary.severity,
      },
      stripeBalance: {
        available: stripeAvailableCzk,
        pending: stripePendingCzk,
      },
      matches: {
        missingTransactions: matches.missingTransactions,
        extraTransactions: matches.extraTransactions,
        discrepancyTransactions: matches.discrepancyTransactions,
      },
      history: (history || []).map((row) => ({
        ...row,
        supabase_total: row.supabase_total / 100,
        stripe_total: row.stripe_total / 100,
        discrepancy_amount: row.discrepancy_amount / 100,
      })),
    });
  } catch (error: any) {
    console.error('Reconciliation API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reconciliation data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reconciliationType = body.reconciliation_type || 'manual';
    const notes = body.notes || `Manual reconciliation - Type: ${reconciliationType}`;

    const { summary, logEntry } = await runReconciliation(reconciliationType, notes, session.email);

    return NextResponse.json({
      success: true,
      reconciliation: logEntry,
      summary: {
        supabaseTotal: summary.supabaseTotalCzk,
        stripeTotal: summary.stripeTotalCzk,
        discrepancy: summary.discrepancyCzk,
        status: Math.abs(summary.discrepancyCzk) > 0 ? 'mismatch' : 'match',
        severity: summary.severity,
      },
    });
  } catch (error: any) {
    console.error('Reconciliation POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process reconciliation' },
      { status: 500 }
    );
  }
}
