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
    const { action: lockAction, reason } = body;

    if (!lockAction || !['lock', 'unlock'].includes(lockAction)) {
      return NextResponse.json({ error: 'Action must be "lock" or "unlock"' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const isLocking = lockAction === 'lock';

    // Check if user is a customer
    let { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, is_locked')
      .eq('id', userId)
      .single();

    if (!customerError && customer) {
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          is_locked: isLocking,
          locked_at: isLocking ? new Date().toISOString() : null,
          locked_by: isLocking ? session.userId : null,
          lock_reason: isLocking ? reason : null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating customer lock status:', updateError);
        return NextResponse.json({ error: 'Failed to update lock status' }, { status: 500 });
      }

      await logAdminAction(session.userId!, isLocking ? 'LOCK_USER' : 'UNLOCK_USER', { 
        userId, 
        userType: 'customer',
        reason 
      });

      return NextResponse.json({ 
        success: true, 
        is_locked: isLocking,
        user_type: 'customer'
      });
    }

    // Check if user is a professional
    let { data: professional, error: proError } = await supabase
      .from('professionals')
      .select('id, is_locked')
      .eq('id', userId)
      .single();

    if (!proError && professional) {
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ 
          is_locked: isLocking,
          locked_at: isLocking ? new Date().toISOString() : null,
          locked_by: isLocking ? session.userId : null,
          lock_reason: isLocking ? reason : null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating professional lock status:', updateError);
        return NextResponse.json({ error: 'Failed to update lock status' }, { status: 500 });
      }

      await logAdminAction(session.userId!, isLocking ? 'LOCK_USER' : 'UNLOCK_USER', { 
        userId, 
        userType: 'professional',
        reason 
      });

      return NextResponse.json({ 
        success: true, 
        is_locked: isLocking,
        user_type: 'professional'
      });
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
