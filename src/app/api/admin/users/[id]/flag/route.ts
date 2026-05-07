import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

async function verifyAdminSession(): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;
    
    if (!sessionToken) {
      return { valid: false, error: 'No session token' };
    }
    
    const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    if (!session.userId || !session.isAdmin || session.exp < Date.now()) {
      return { valid: false, error: 'Invalid or expired session' };
    }
    
    return { valid: true, userId: session.userId };
  } catch {
    return { valid: false, error: 'Invalid session format' };
  }
}

async function logAdminAction(adminId: string, action: string, details: Record<string, unknown>) {
  console.log(`[ADMIN AUDIT] ${new Date().toISOString()} | Admin: ${adminId} | Action: ${action} | Details:`, details);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { reason, type, reported_by } = body;

    if (!reason || !type) {
      return NextResponse.json({ error: 'Reason and type are required' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['inappropriate_content', 'spam', 'harassment', 'fake_profile', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid flag type' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Create flag record
    const { data: flag, error: flagError } = await supabase
      .from('user_flags')
      .insert({
        user_id: userId,
        reason,
        flag_type: type,
        reported_by: reported_by || session.userId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (flagError) {
      console.error('Error creating flag:', flagError);
      return NextResponse.json({ error: 'Failed to create flag' }, { status: 500 });
    }

    await logAdminAction(session.userId!, 'FLAG_USER', { userId, reason, type });

    return NextResponse.json({ flag }, { status: 201 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
