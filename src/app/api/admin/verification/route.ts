// GET /api/admin/verification - Fetch all stored verifications

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('business_verifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`declared_ico.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[VERIFICATION API] Error fetching:', error);
      return NextResponse.json(
        { error: 'Failed to fetch verifications', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      verifications: data || [],
      count: data?.length || 0,
      total: count || 0
    });

  } catch (error) {
    console.error('[VERIFICATION API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}