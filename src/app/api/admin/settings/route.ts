import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { createClient } from '@supabase/supabase-js';

function adminDb() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = adminDb();
  const { data, error } = await db.from('admin_settings').select('*').limit(1).single();

  if (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const allowedFields = [
    'platform_name',
    'support_email',
    'timezone',
    'session_timeout_hours',
    'email_alerts',
    'slack_integration',
    'slack_webhook_url',
    'theme',
    'accent_color',
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: session.email };
  for (const field of allowedFields) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  const db = adminDb();
  const { data: existing } = await db.from('admin_settings').select('id').limit(1).single();

  if (!existing) {
    return NextResponse.json({ error: 'Settings row not found' }, { status: 500 });
  }

  const { data, error } = await db
    .from('admin_settings')
    .update(updates)
    .eq('id', existing.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
