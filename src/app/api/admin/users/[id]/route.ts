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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // First check if user is a customer
    let { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (!customerError && customer) {
      // Fetch related data for customer
      const [appointments, reviews] = await Promise.all([
        supabase.from('appointments').select('*').eq('customer_id', id).order('created_at', { ascending: false }).limit(10),
        supabase.from('reviews').select('*').eq('customer_id', id).order('created_at', { ascending: false }).limit(10)
      ]);

      await logAdminAction(session.userId!, 'VIEW_USER_DETAILS', { userId: id, userType: 'customer' });

      return NextResponse.json({
        user: { ...customer, user_type: 'customer' },
        appointments: appointments.data || [],
        reviews: reviews.data || []
      });
    }

    // Check if user is a professional
    let { data: professional, error: proError } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single();

    if (!proError && professional) {
      // Fetch related data for professional
      const [appointments, reviews, services] = await Promise.all([
        supabase.from('appointments').select('*').eq('professional_id', id).order('created_at', { ascending: false }).limit(10),
        supabase.from('reviews').select('*').eq('professional_id', id).order('created_at', { ascending: false }).limit(10),
        supabase.from('services').select('*').eq('professional_id', id)
      ]);

      await logAdminAction(session.userId!, 'VIEW_USER_DETAILS', { userId: id, userType: 'professional' });

      return NextResponse.json({
        user: { ...professional, user_type: 'professional' },
        appointments: appointments.data || [],
        reviews: reviews.data || [],
        services: services.data || []
      });
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
