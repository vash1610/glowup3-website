import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function mapTransactionType(type: string): string {
  switch (type) {
    case 'debit':
      return 'deposit';
    case 'credit':
      return 'withdrawal';
    default:
      return type;
  }
}

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

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = (page - 1) * limit;
    
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const supabase = createAdminClient();
    
    // Query wallet_transactions table
    let query = supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' });

    // Apply filters - map UI types to DB types
    if (type) {
      if (type === 'deposit') {
        query = query.eq('type', 'debit');
      } else if (type === 'withdrawal') {
        query = query.eq('type', 'credit');
      } else {
        query = query.eq('type', type);
      }
    }
    
    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching wallet transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    const transactions = data || [];

    // Fetch profiles for user lookup
    const userIds = [...new Set(transactions.map(tx => tx.user_id).filter(Boolean))];
    let userMap = new Map();
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, user_type')
        .in('id', userIds);
      
      userMap = new Map((profiles || []).map(p => [p.id, p]));
    }

    // Transform data - amounts already in CZK (no division)
    const transformedTransactions = transactions.map((tx) => {
      const profile = userMap.get(tx.user_id);
      return {
        id: tx.id,
        wallet_id: tx.wallet_id,
        user_id: tx.user_id,
        type: mapTransactionType(tx.type), // Map debit→deposit, etc.
        amount: tx.amount || 0, // Already in CZK - no division
        fee: 0,
        balance_before: tx.balance_before || 0,
        balance_after: tx.balance_after || 0,
        status: tx.status,
        description: tx.description || '',
        reference_account_id: tx.counterparty_id,
        appointment_id: tx.reference_type === 'appointment' ? tx.reference_id : null,
        metadata: tx.metadata || {},
        created_at: tx.created_at,
        completed_at: tx.status === 'completed' ? tx.created_at : null,
        account_id: tx.wallet_id,
        owner_type: profile?.user_type || 'customer',
        user: profile ? {
          id: profile.id,
          name: profile.name || 'Unknown User',
          email: profile.email || '',
          user_type: profile.user_type || 'customer'
        } : undefined
      };
    });

    // Calculate totals from ALL transactions matching filters
    let totalsQuery = supabase
      .from('wallet_transactions')
      .select('amount, type');

    if (type) {
      if (type === 'deposit') {
        totalsQuery = totalsQuery.eq('type', 'debit');
      } else if (type === 'withdrawal') {
        totalsQuery = totalsQuery.eq('type', 'credit');
      } else {
        totalsQuery = totalsQuery.eq('type', type);
      }
    }
    
    if (status) {
      totalsQuery = totalsQuery.eq('status', status);
    }

    const { data: allTransactions } = await totalsQuery;
    
    const allTxs = allTransactions || [];
    const deposits = allTxs
      .filter(tx => tx.type === 'debit' || tx.type === 'transfer_in')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const withdrawals = allTxs
      .filter(tx => tx.type === 'credit' || tx.type === 'transfer_out')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);

    console.log(`[ADMIN AUDIT] ${new Date().toISOString()} | Admin: ${session.userId} | Action: LIST_WALLET_TRANSACTIONS | page: ${page}`);

    return NextResponse.json({
      transactions: transformedTransactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      totals: {
        count: count || 0,
        total_amount: deposits + withdrawals,
        total_fees: 0,
        deposits,
        withdrawals
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
