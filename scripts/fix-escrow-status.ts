/**
 * Fix Escrow Status Script
 * 
 * Syncs escrow records with appointment statuses to fix data inconsistencies.
 * 
 * Usage: npx ts-node scripts/fix-escrow-status.ts
 * 
 * Business Logic:
 * - cancelled_by_pro → Refund to customer → escrow.status = 'refunded'
 * - cancelled_by_customer → Pro keeps fee → escrow.status = 'released'
 * - paid → Escrow converts to pro earnings → escrow.status = 'released'
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ydnmhnutaitmbeybpwxc.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY in your environment before running this script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface FixResult {
  appointmentId: string;
  oldStatus: string;
  newStatus: string;
  action: string;
}

async function fixEscrowStatus(): Promise<FixResult[]> {
  console.log('🔄 Starting escrow status sync...\n');
  
  const results: FixResult[] = [];
  
  // Get all escrow records with status 'held'
  const { data: escrowRecords, error: escrowError } = await supabase
    .from('escrow')
    .select('id, appointment_id, status, release_reason, released_at')
    .eq('status', 'held');
  
  if (escrowError) {
    console.error('❌ Error fetching escrow records:', escrowError);
    return results;
  }
  
  console.log(`📋 Found ${escrowRecords?.length || 0} escrow records with status 'held'\n`);
  
  if (!escrowRecords || escrowRecords.length === 0) {
    console.log('✅ No escrow records to fix.');
    return results;
  }
  
  // Get appointment IDs
  const appointmentIds = escrowRecords.map(e => e.appointment_id);
  
  // Fetch corresponding appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, status, reservation_fee_refunded, cancelled_by')
    .in('id', appointmentIds);
  
  if (appointmentsError) {
    console.error('❌ Error fetching appointments:', appointmentsError);
    return results;
  }
  
  // Create lookup map
  const appointmentMap = new Map(
    appointments?.map(a => [a.id, a]) || []
  );
  
  console.log('📊 Processing records:\n');
  console.log('─'.repeat(80));
  
  for (const escrow of escrowRecords) {
    const appointment = appointmentMap.get(escrow.appointment_id);
    
    if (!appointment) {
      console.log(`❌ No appointment found for: ${escrow.appointment_id}`);
      continue;
    }
    
    let newStatus = escrow.status;
    let action = 'No change needed';
    
    switch (appointment.status) {
      case 'cancelled_by_pro':
        // Pro cancelled → refund to customer
        if (escrow.status === 'held') {
          newStatus = 'refunded';
          action = 'cancelled_pro';  // Valid release_reason values
        }
        break;
        
      case 'cancelled_by_customer':
        // Customer cancelled late → fee goes to pro
        if (escrow.status === 'held') {
          newStatus = 'released';
          action = 'cancelled_customer_within_policy';  // Valid release_reason
        }
        break;
        
      case 'paid':
      case 'completed':
        // Service completed → release to pro
        if (escrow.status === 'held') {
          newStatus = 'released';
          action = '';  // Will be sent as null
        }
        break;
        
      case 'pending':
      case 'confirmed':
        // Appointment still active → keep as held
        action = 'active_appointment';  // No change needed
        break;
        
      case 'no_show':
        // Client didn't show up → fee to pro
        if (escrow.status === 'held') {
          newStatus = 'released';
          action = 'customer_no_show';  // Valid release_reason
        }
        break;
        
      default:
        action = 'unknown_status';  // Generic fallback
    }
    
    // Update escrow if status changed
    if (newStatus !== escrow.status) {
      console.log(`📝 ${escrow.appointment_id.slice(-6)}: ${escrow.status} → ${newStatus} (${action})`);
      
      const updateData: any = {
        status: newStatus,
        released_at: newStatus === 'released' || newStatus === 'refunded' 
          ? new Date().toISOString() 
          : null
      };
      
      // Only set release_reason if it's non-empty (avoids constraint violation)
      if (action && action.trim() !== '') {
        updateData.release_reason = action;
      }
      
      const { error: updateError } = await supabase
        .from('escrow')
        .update(updateData)
        .eq('id', escrow.id);
      
      if (updateError) {
        console.log(`   ❌ Failed to update: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated successfully`);
        results.push({
          appointmentId: escrow.appointment_id,
          oldStatus: escrow.status,
          newStatus,
          action
        });
      }
    } else {
      console.log(`➖ ${escrow.appointment_id.slice(-6)}: ${action}`);
    }
  }
  
  console.log('─'.repeat(80));
  console.log(`\n✅ Completed: ${results.length} records updated\n`);
  
  return results;
}

// Run if executed directly
fixEscrowStatus()
  .then(results => {
    if (results.length > 0) {
      console.log('\n📝 Summary of changes:');
      results.forEach(r => {
        console.log(`  - ${r.appointmentId.slice(-6)}: ${r.oldStatus} → ${r.newStatus} (${r.action})`);
      });
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

export { fixEscrowStatus };