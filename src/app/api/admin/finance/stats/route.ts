import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

// Admin client with service role
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get appointment-based revenue from appointments table
    const { data: appointments, error: appointmentsError } = await supabaseAdmin
      .from('appointments')
      .select('id, final_price, status, reservation_fee, created_at');

    if (appointmentsError) {
      console.error('Appointments error:', appointmentsError);
    }

    // Get customer wallet totals
    const { data: customerWallets, error: customerError } = await supabaseAdmin
      .from('customer_wallets')
      .select('balance, total_earned, total_spent');

    // Get professional wallet totals
    const { data: proWallets, error: proError } = await supabaseAdmin
      .from('pro_wallets')
      .select('balance, total_earned');

    // Get wallet transactions
    const { data: walletTransactions, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .select('id, amount, type, status, balance_after, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate appointment stats
    let totalRevenue = 0;
    let pendingRevenue = 0;
    let totalFees = 0;
    let totalRefunds = 0;
    let completedCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    appointments?.forEach(apt => {
      if (apt.status === 'completed') {
        totalRevenue += apt.final_price || 0;
        totalFees += apt.reservation_fee || 0;
        completedCount++;
      } else if (apt.status === 'confirmed' || apt.status === 'pending') {
        pendingRevenue += apt.final_price || 0;
        pendingCount++;
      } else if (apt.status === 'cancelled') {
        totalRefunds += apt.final_price || 0;
        cancelledCount++;
      }
    });

    // Calculate wallet totals
    const customerWalletTotal = customerWallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
    const proWalletTotal = proWallets?.reduce((sum, w) => sum + (w.balance || 0), 0) || 0;
    const totalPlatformBalance = customerWalletTotal + proWalletTotal;

    // Calculate revenue MTD (this month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let revenueMTD = 0;

    appointments?.forEach(apt => {
      if (apt.status === 'completed') {
        const aptDate = new Date(apt.created_at);
        if (aptDate >= startOfMonth) {
          revenueMTD += apt.final_price || 0;
        }
      }
    });

    // Calculate monthly change (compare to last month)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    let revenueLastMonth = 0;

    appointments?.forEach(apt => {
      if (apt.status === 'completed') {
        const aptDate = new Date(apt.created_at);
        if (aptDate >= startOfLastMonth && aptDate <= endOfLastMonth) {
          revenueLastMonth += apt.final_price || 0;
        }
      }
    });

    const monthlyChange = revenueLastMonth > 0 
      ? ((revenueMTD - revenueLastMonth) / revenueLastMonth) * 100 
      : 0;

    // Get escrow stats
    const { data: escrowData } = await supabaseAdmin
      .from('escrow')
      .select('amount, status')
      .eq('status', 'held');

    const totalEscrowHeld = escrowData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      // Appointment-based stats
      totalRevenue,
      pendingRevenue,
      totalPlatformFees: totalFees,
      totalRefunds,
      revenueMTD,
      monthlyChange,
      stats: {
        totalTransactions: appointments?.length || 0,
        completedCount,
        pendingCount,
        cancelledCount,
      },
      // Wallet-based stats
      wallets: {
        customerTotal: customerWalletTotal,
        professionalTotal: proWalletTotal,
        platformTotal: totalPlatformBalance,
        escrowHeld: totalEscrowHeld,
      },
      // Counts
      customerWalletCount: customerWallets?.length || 0,
      professionalWalletCount: proWallets?.length || 0,
      transactionCount: walletTransactions?.length || 0,
      // Recent transactions
      recentTransactions: walletTransactions?.slice(0, 10).map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        balanceAfter: tx.balance_after,
      })) || [],
    });
  } catch (error: any) {
    console.error('Finance stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch finance stats' },
      { status: 500 }
    );
  }
}