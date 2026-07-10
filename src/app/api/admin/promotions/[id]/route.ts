import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { promotionsDb, formatPromotion, resolveOwnerNames, resolveTypeCodes } from '@/lib/promotions-utils';

// GET: Fetch single promotion by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = promotionsDb();
    const { data, error } = await db.from('promotions').select('*').eq('id', id).single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Promotion not found' }, { status: 404 });
    }

    const [ownerNames, typeCodes] = await Promise.all([
      resolveOwnerNames(db, [{ owner_id: data.owner_id, owner_type: data.owner_type }]),
      resolveTypeCodes(db, [data.promotion_type_id].filter(Boolean)),
    ]);

    return NextResponse.json({
      success: true,
      data: formatPromotion(data, ownerNames.get(data.owner_id) || 'Unknown', typeCodes.get(data.promotion_type_id) || 'unknown'),
    });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update promotion (status, budget, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, status, budget, start_date, end_date } = body;

    if (status && !['active', 'paused', 'completed', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    if (budget !== undefined && budget <= 0) {
      return NextResponse.json({ success: false, error: 'Budget must be greater than 0' }, { status: 400 });
    }

    const db = promotionsDb();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.title = name;
    if (status !== undefined) updates.status = status;
    if (budget !== undefined) updates.total_budget = budget;
    if (start_date !== undefined) updates.start_date = start_date;
    if (end_date !== undefined) updates.end_date = end_date;

    const { data, error } = await db.from('promotions').update(updates).eq('id', id).select().single();

    if (error || !data) {
      return NextResponse.json({ success: false, error: error?.message || 'Promotion not found' }, { status: error ? 500 : 404 });
    }

    const [ownerNames, typeCodes] = await Promise.all([
      resolveOwnerNames(db, [{ owner_id: data.owner_id, owner_type: data.owner_type }]),
      resolveTypeCodes(db, [data.promotion_type_id].filter(Boolean)),
    ]);

    return NextResponse.json({
      success: true,
      data: formatPromotion(data, ownerNames.get(data.owner_id) || 'Unknown', typeCodes.get(data.promotion_type_id) || 'unknown'),
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }
}

// DELETE: Delete promotion
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = promotionsDb();
    const { error, count } = await db.from('promotions').delete({ count: 'exact' }).eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!count) {
      return NextResponse.json({ success: false, error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Promotion deleted successfully', deleted_id: id });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
