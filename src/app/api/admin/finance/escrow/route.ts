import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all escrow records
    const { data: escrowRecords, error: escrowError } = await supabaseAdmin
      .from('escrow')
      .select('*')
      .order('created_at', { ascending: false });

    if (escrowError) {
      console.error('Escrow query error:', escrowError);
      return NextResponse.json(
        { success: false, error: escrowError.message },
        { status: 500 }
      );
    }

    // Fetch appointments for service info
    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('id, service_name, date, time')
      .limit(1000);

    // Fetch professionals - use id field
    const { data: professionals } = await supabaseAdmin
      .from('professionals')
      .select('id, display_name, email')
      .limit(1000);

    // Fetch customers - use user_id field  
    const { data: customers } = await supabaseAdmin
      .from('customers')
      .select('id, user_id, display_name, first_name, last_name, email')
      .limit(1000);

    // Create lookup maps
    const appointmentMap = new Map((appointments || []).map(a => [a.id, a]));
    // Pro map by id
    const proMap = new Map((professionals || []).map(p => [p.id, p]));
    // Customer map by user_id
    const customerMap = new Map((customers || []).map(c => [c.user_id, c]));
    // Also create map by id
    const customerMapById = new Map((customers || []).map(c => [c.id, c]));

    // Transform the data - amount already in CZK (no division)
    const escrowData = (escrowRecords || []).map((record: any) => {
      const appointment = appointmentMap.get(record.appointment_id);
      const pro = proMap.get(record.pro_id);
      // Try customer lookup by user_id first, fallback to id
      const customer = customerMap.get(record.customer_id) || customerMapById.get(record.customer_id);

      // Build customer name
      let customerName = 'Unknown Customer';
      if (customer) {
        if (customer.display_name) {
          customerName = customer.display_name;
        } else if (customer.first_name && customer.last_name) {
          customerName = `${customer.first_name} ${customer.last_name}`;
        } else if (customer.first_name) {
          customerName = customer.first_name;
        }
      }

      // Build pro name
      let proName = 'Unknown Pro';
      if (pro) {
        proName = pro.display_name || pro.email?.split('@')[0] || 'Unknown Pro';
      }

      // Build service name with fallback
      let serviceName = 'Unknown Service';
      if (appointment?.service_name) {
        serviceName = appointment.service_name;
      } else if (record.appointment_id) {
        // Fallback: show truncated appointment ID
        serviceName = `Appointment #${record.appointment_id.slice(-6)}`;
      }

      return {
        id: record.id,
        appointment_id: record.appointment_id,
        customer_id: record.customer_id,
        pro_id: record.pro_id,
        amount: record.amount || 0,
        status: record.status,
        // Use camelCase for UI compatibility
        holdDate: record.created_at || record.held_until,
        releaseDate: record.released_at,
        hold_date: record.created_at || record.held_until,
        release_date: record.released_at,
        created_at: record.created_at,
        // UI-friendly fields
        serviceName,
        appointmentDate: appointment?.date || record.held_until?.split('T')[0] || '',
        appointmentTime: appointment?.time || '',
        customer: customer ? {
          id: customer.user_id || customer.id,
          name: customerName,
          email: customer.email || ''
        } : null,
        pro: pro ? {
          id: pro.id,
          name: proName
        } : null,
      };
    });

    // Calculate stats in flat format for UI
    const heldRecords = escrowData.filter(e => e.status === 'held');
    const releasedRecords = escrowData.filter(e => e.status === 'released');
    const refundedRecords = escrowData.filter(e => e.status === 'refunded');
    const cancelledRecords = escrowData.filter(e => e.status === 'cancelled');

    const stats = {
      totalHeld: heldRecords.reduce((sum, e) => sum + e.amount, 0),
      heldCount: heldRecords.length,
      totalReleased: releasedRecords.reduce((sum, e) => sum + e.amount, 0),
      releasedCount: releasedRecords.length,
      totalRefunded: refundedRecords.reduce((sum, e) => sum + e.amount, 0),
      refundedCount: refundedRecords.length,
      totalCancelled: cancelledRecords.reduce((sum, e) => sum + e.amount, 0),
      cancelledCount: cancelledRecords.length,
    };

    return NextResponse.json({
      success: true,
      escrow: escrowData,
      stats,
    });
  } catch (error: any) {
    console.error('Escrow API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch escrow data' },
      { status: 500 }
    );
  }
}
