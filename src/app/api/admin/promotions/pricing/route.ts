import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '../../../../../lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const activeOnly = searchParams.get('active_only') === 'true';

    let query = supabaseAdmin.from('promotion_pricing').select('*');
    if (section) query = query.eq('platform_section', section);
    if (activeOnly) query = query.eq('is_active', true);
    query = query.order('slot_type').order('platform_section');

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [], total: (data || []).length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, daily_price, weekdays_price, weekend_price, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (daily_price !== undefined) updates.daily_price = daily_price;
    if (weekdays_price !== undefined) updates.weekdays_price = weekdays_price;
    if (weekend_price !== undefined) updates.weekend_price = weekend_price;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('promotion_pricing')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
