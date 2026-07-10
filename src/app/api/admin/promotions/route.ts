import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { promotionsDb, formatPromotion, resolveOwnerNames, resolveTypeCodes } from '@/lib/promotions-utils';

// GET: Fetch all promotions with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const status = searchParams.get('status');
    const owner_id = searchParams.get('owner_id');
    const search = searchParams.get('search');

    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') === 'asc';

    const db = promotionsDb();
    let query = db.from('promotions').select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (owner_id) query = query.eq('owner_id', owner_id);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error, count } = await query
      .order(sort_by, { ascending: sort_order })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching promotions:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch promotions' }, { status: 500 });
    }

    const rows = data || [];
    const [ownerNames, typeCodes] = await Promise.all([
      resolveOwnerNames(db, rows.map((r) => ({ owner_id: r.owner_id, owner_type: r.owner_type }))),
      resolveTypeCodes(db, [...new Set(rows.map((r) => r.promotion_type_id).filter(Boolean))]),
    ]);

    const promotions = rows.map((row) =>
      formatPromotion(row, ownerNames.get(row.owner_id) || 'Unknown', typeCodes.get(row.promotion_type_id) || 'unknown')
    );

    return NextResponse.json({
      success: true,
      data: promotions,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
      filters: { status, owner_id, search },
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new promotion
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, promotion_type_id, owner_id, owner_type, budget, start_date, end_date } = body;

    if (!name || !promotion_type_id || !owner_id || !owner_type || !budget || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, promotion_type_id, owner_id, owner_type, budget, start_date, end_date' },
        { status: 400 }
      );
    }

    if (budget <= 0) {
      return NextResponse.json({ success: false, error: 'Budget must be greater than 0' }, { status: 400 });
    }

    const db = promotionsDb();
    const { data, error } = await db
      .from('promotions')
      .insert({
        title: name,
        promotion_type_id,
        owner_id,
        owner_type,
        total_budget: budget,
        start_date,
        end_date,
        status: 'pending',
        admin_approved: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating promotion:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const [ownerNames, typeCodes] = await Promise.all([
      resolveOwnerNames(db, [{ owner_id: data.owner_id, owner_type: data.owner_type }]),
      resolveTypeCodes(db, [data.promotion_type_id].filter(Boolean)),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: formatPromotion(data, ownerNames.get(data.owner_id) || 'Unknown', typeCodes.get(data.promotion_type_id) || 'unknown'),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
}
