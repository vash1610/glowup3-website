import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { listPublicTables } from '@/lib/db-schema';

// Log admin action
async function logAdminAction(adminId: string, action: string, details: Record<string, unknown>) {
  console.log(`[ADMIN AUDIT] ${new Date().toISOString()} | Admin: ${adminId} | Action: ${action} | Details:`, details);
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tableNames = await listPublicTables();
    const tables = tableNames.map((table_name) => ({ table_name, table_type: 'BASE TABLE' }));

    // Log the action
    await logAdminAction(session.userId!, 'LIST_TABLES', { tableCount: tables.length });

    return NextResponse.json({ tables });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
