// Quick IČO Lookup API
// GET /api/admin/verification/lookup?ico=XXXXXXX - Direct ARES+RŽP lookup
// Saves every search to database with timestamp

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { checkAres, AresResponse } from '@/lib/verification/ares';
import { checkRzp } from '@/lib/verification/rzp';
import { checkVies } from '@/lib/verification/vies';
import { validateIcoChecksum } from '@/lib/verification/matching';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ico = searchParams.get('ico');
    const includeRzp = searchParams.get('rzp') !== 'false'; // Default true
    const includeVies = searchParams.get('vies') === 'true';
    const adminId = searchParams.get('admin_id') || 'system'; // Admin who performed lookup
    
    if (!ico) {
      return NextResponse.json(
        { error: 'IČO is required. Use ?ico=XXXXXXX' },
        { status: 400 }
      );
    }
    
    const cleanIco = ico.replace(/\s/g, '');
    
    // Validate IČO format
    if (!/^\d{8}$/.test(cleanIco)) {
      return NextResponse.json(
        { error: 'Invalid IČO format. Must be 8 digits.' },
        { status: 400 }
      );
    }
    
    // Validate checksum
    const validChecksum = validateIcoChecksum(cleanIco);
    
    // Call ARES
    console.log(`[LOOKUP] Testing ARES for IČO: ${cleanIco}, checksum valid: ${validChecksum}`);
    const aresResult: AresResponse = await checkAres(cleanIco);
    
    let rzpResult = null;
    let viesResult = null;
    
    // Always call RŽP when ARES is found
    if (aresResult.found && includeRzp) {
      console.log(`[LOOKUP] Testing RŽP for IČO: ${cleanIco}`);
      rzpResult = await checkRzp(cleanIco);
    }
    
    if (includeVies) {
      console.log(`[LOOKUP] Testing VIES for CZ${cleanIco}`);
      viesResult = await checkVies(`CZ${cleanIco}`);
    }
    
    // Determine verification status
    let status: 'verified' | 'not_found' | 'requires_action' = 'verified';
    if (!aresResult.found) {
      status = 'not_found';
    } else if (aresResult.status === 'dissolved') {
      status = 'requires_action';
    }
    
    // Save to database (non-critical - if fails, just log and continue)
    let saved = false;
    try {
      // Check if table exists first by trying to query it
      const { data: existing } = await supabaseAdmin
        .from('business_verifications')
        .select('id')
        .eq('declared_ico', cleanIco)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (existing) {
        // Update existing record with new search
        const { error: updateError } = await supabaseAdmin
          .from('business_verifications')
          .update({
            status,
            company_name: aresResult.company_name,
            legal_form: aresResult.legal_form,
            address: aresResult.address,
            registration_date: aresResult.registration_date,
            ico: cleanIco,
            vat_country: aresResult.vat_registered ? 'CZ' : null,
            ares_response: aresResult,
            rzp_response: rzpResult,
            vies_response: viesResult,
            completed_at: new Date().toISOString(),
            source: 'lookup',
            last_search_at: new Date().toISOString(),
            search_count: existing.id ? (await getSearchCount(cleanIco) + 1) : 1
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.log('[LOOKUP] Update failed (non-critical):', updateError.message);
        }
      } else {
        // Create new record - use NULL for user_id (lookup-only records)
        const { error: insertError } = await supabaseAdmin
          .from('business_verifications')
          .insert({
            user_id: null, // lookup-only, no real user
            declared_ico: cleanIco,
            ico: cleanIco,
            status,
            company_name: aresResult.company_name,
            legal_form: aresResult.legal_form,
            address: aresResult.address,
            registration_date: aresResult.registration_date,
            vat_country: aresResult.vat_registered ? 'CZ' : null,
            ares_response: aresResult,
            rzp_response: rzpResult,
            vies_response: viesResult,
            consent_timestamp: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            source: 'lookup',
            last_search_at: new Date().toISOString(),
            search_count: 1
          });
        
        if (insertError) {
          console.log('[LOOKUP] Insert failed (non-critical):', insertError.message);
        }
      }
      
      // Create audit log entry
      await supabaseAdmin
        .from('verification_audit_logs')
        .insert({
          verification_id: existing?.id || 'new',
          event_type: 'lookup_performed',
          actor_type: 'admin',
          actor_id: adminId,
          payload: {
            ico: cleanIco,
            checksum_valid: validChecksum,
            ares_found: aresResult.found,
            rzp_found: rzpResult?.found || false,
            status
          }
        });
        
    } catch (dbError) {
      console.log('[LOOKUP] Database save failed (non-critical):', dbError);
    }
    
    return NextResponse.json({
      ico: cleanIco,
      checksum_valid: validChecksum,
      ares: {
        success: aresResult.found,
        data: aresResult.found ? aresResult : undefined,
        error: aresResult.error
      },
      rzp: rzpResult,
      vies: viesResult,
      timestamp: new Date().toISOString(),
      saved: true
    });
    
  } catch (error) {
    console.error('[LOOKUP] Error:', error);
    return NextResponse.json(
      { error: 'Lookup failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Helper to get search count
async function getSearchCount(ico: string): Promise<number> {
  try {
    const { data } = await supabaseAdmin
      .from('business_verifications')
      .select('search_count')
      .eq('declared_ico', ico)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    return data?.search_count || 0;
  } catch {
    return 0;
  }
}