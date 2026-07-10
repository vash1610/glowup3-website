import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function GET() {
  try {
    // Fetch Stripe Balance
    const balance = await stripe.balance.retrieve();

    // Fetch recent balance transactions (last 90 days)
    const transactions = await stripe.balanceTransactions.list({
      limit: 100,
      created: {
        gte: Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60, // Last 90 days
      },
    });

    // Calculate stats from transactions
    let totalReceived = 0;
    let totalPending = 0;
    let totalFees = 0;
    let paymentCount = 0;
    let refundCount = 0;
    let disputeCount = 0;

    // Group transactions by type using type assertion
    const txTypes = transactions.data.map(tx => tx.type as string);
    
    transactions.data.forEach((tx) => {
      const amount = tx.amount / 100; // Amount in CZK (cents)
      const type = tx.type as string;
      
      // Count by type
      if (type === 'charge') {
        totalReceived += amount;
        paymentCount++;
      } else if (type === 'charge_pending') {
        totalPending += amount;
      } else if (type === 'refund') {
        refundCount++;
      } else if (type === 'dispute') {
        disputeCount++;
      }
      
      // Always add fees
      totalFees += tx.fee / 100;
    });

    // Get available balance in CZK
    const availableBalance = balance.available.reduce((sum, b) => sum + b.amount / 100, 0);
    const pendingBalance = balance.pending.reduce((sum, b) => sum + b.amount / 100, 0);

    return NextResponse.json({
      success: true,
      balance: {
        available: availableBalance,
        pending: pendingBalance,
        currency: 'CZK',
      },
      stats: {
        totalReceived,
        totalPending,
        totalFees,
        paymentCount,
        refundCount,
        disputeCount,
      },
      transactions: transactions.data.map(tx => ({
        id: tx.id,
        amount: tx.amount / 100, // Convert from cents to CZK
        currency: tx.currency,
        type: tx.type,
        status: tx.status,
        fee: tx.fee / 100,
        created: new Date(tx.created * 1000).toISOString(),
        description: tx.description,
        source: tx.source,
      })),
    });
  } catch (error: any) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Stripe data' },
      { status: 500 }
    );
  }
}