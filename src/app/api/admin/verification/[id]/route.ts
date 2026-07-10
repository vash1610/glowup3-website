// Verification Detail API
// GET /api/admin/verification/[id] - Get verification details
// POST /api/admin/verification/[id]/action - Manual review action

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get verification details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const { data, error } = await supabaseAdmin
      .from('business_verifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }
    
    // Get audit logs for this verification
    const { data: auditLogs } = await supabaseAdmin
      .from('verification_audit_logs')
      .select('*')
      .eq('verification_id', id)
      .order('created_at', { ascending: false });
    
    return NextResponse.json({
      verification: data,
      audit_logs: auditLogs || []
    });
    
  } catch (error) {
    console.error('Get verification error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification' },
      { status: 500 }
    );
  }
}

// POST - Manual review action
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const { action, reviewer_id, notes } = body;
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }
    
    // Get current verification
    const { data: current, error: fetchError } = await supabaseAdmin
      .from('business_verifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !current) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }
    
    const previousStatus = current.status;
    let newStatus: string;
    
    switch (action) {
      case 'approve':
        newStatus = 'verified';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'request_docs':
        newStatus = 'requires_action';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: approve, reject, or request_docs' },
          { status: 400 }
        );
    }
    
    // Update verification
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('business_verifications')
      .update({
        status: newStatus,
        manual_reviewer_id: reviewer_id || null,
        notes: notes || current.notes,
        completed_at: new Date().toISOString(),
        source: 'manual',
        reasons: [...(current.reasons || []), `manual_${action}`]
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Failed to update verification:', updateError);
      return NextResponse.json(
        { error: 'Failed to update verification' },
        { status: 500 }
      );
    }
    
    // Create audit log entry
    await supabaseAdmin
      .from('verification_audit_logs')
      .insert({
        verification_id: id,
        event_type: 'manual_action',
        actor_type: reviewer_id ? 'admin' : 'system',
        actor_id: reviewer_id || null,
        action: action,
        previous_status: previousStatus,
        new_status: newStatus,
        payload: {
          notes: notes,
          reviewer_id: reviewer_id
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });
    
    return NextResponse.json({
      verification: updated,
      message: `Verification ${action}d successfully`
    });
    
  } catch (error) {
    console.error('Manual action error:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}