// Business Verification API
// POST /api/admin/verification/business - Start verification
// GET /api/admin/verification - List verifications

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkAres, AresResponse } from '@/lib/verification/ares';
import { checkRzp, RzpResponse } from '@/lib/verification/rzp';
import { checkVies, isEuVat } from '@/lib/verification/vies';
import { 
  matchIco, 
  matchCompanyName, 
  calculateOverallConfidence,
  validateIcoChecksum 
} from '@/lib/verification/matching';
import { getCacheKey, setCachedValue, getCachedValue, checkUserRateLimit, withRetry } from '@/lib/verification/cache';

interface VerificationRequest {
  user_id: string;
  declared_ico?: string;
  declared_vat?: string;
  declared_trade_license_number?: string;
  declared_company_name?: string;
  uploaded_documents?: Array<{
    type: string;
    file_url: string;
    mime_type: string;
    language?: string;
  }>;
  request_id?: string;
  consent_timestamp?: string;
}

// POST - Start business verification
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: VerificationRequest = await request.json();
    
    // Validate required fields
    if (!body.user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }
    
    if (!body.declared_ico) {
      return NextResponse.json(
        { error: 'declared_ico is required' },
        { status: 400 }
      );
    }
    
    // Validate IČO format
    const cleanIco = body.declared_ico.replace(/\s/g, '');
    if (!/^\d{8}$/.test(cleanIco)) {
      return NextResponse.json(
        { error: 'Invalid IČO format. Must be 8 digits.' },
        { status: 400 }
      );
    }
    
    if (!validateIcoChecksum(cleanIco)) {
      return NextResponse.json(
        { error: 'Invalid IČO checksum' },
        { status: 400 }
      );
    }
    
    // Check rate limit
    const rateLimit = await checkUserRateLimit(body.user_id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retry_after: rateLimit.resetIn 
        },
        { status: 429 }
      );
    }
    
    // Generate request ID if not provided
    const requestId = body.request_id || `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create verification record
    const { data: verification, error: createError } = await supabaseAdmin
      .from('business_verifications')
      .insert({
        user_id: body.user_id,
        request_id: requestId,
        declared_ico: cleanIco,
        declared_vat: body.declared_vat || null,
        declared_trade_license_number: body.declared_trade_license_number || null,
        declared_company_name: body.declared_company_name || null,
        status: 'pending',
        consent_timestamp: body.consent_timestamp ? new Date(body.consent_timestamp) : new Date(),
        verification_type: 'initial'
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Failed to create verification:', createError);
      return NextResponse.json(
        { error: 'Failed to create verification record' },
        { status: 500 }
      );
    }
    
    // Start async verification process
    runVerification(verification.id, body, requestId).catch(console.error);
    
    // Return immediate response with verification ID
    return NextResponse.json({
      verification_id: verification.id,
      request_id: requestId,
      status: 'pending',
      message: 'Verification started. Use GET /api/admin/verification/' + verification.id + ' to check status.'
    }, { status: 202 });
    
  } catch (error) {
    console.error('Verification request error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// GET - List verifications
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const userId = searchParams.get('user_id');
    
    let query = supabaseAdmin
      .from('business_verifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Failed to fetch verifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch verifications' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      verifications: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Verification list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}

// Run verification process (async)
async function runVerification(
  verificationId: string,
  body: VerificationRequest,
  requestId: string
) {
  try {
    // Update status to in_progress
    await supabaseAdmin
      .from('business_verifications')
      .update({ status: 'in_progress' })
      .eq('id', verificationId);
    
    const reasons: string[] = [];
    let aresData: AresResponse | null = null;
    let rzpData: RzpResponse | null = null;
    let viesData: { valid: boolean; country_code?: string; name?: string } | null = null;
    let finalStatus: 'verified' | 'requires_action' | 'rejected' | 'not_found' | 'pending' = 'pending';
    let confidenceScore = 0;
    
    // 1. Check ARES (IČO verification)
    const aresResult = await checkAres(body.declared_ico!);
    if (aresResult.found) {
      aresData = aresResult;
      await setCachedValue(getCacheKey('ico', body.declared_ico!), aresData, 'ares', true);
    }
    
    // 2. Check RŽP (Trade license verification)
    const rzpResult = await checkRzp(body.declared_ico!);
    if (rzpResult.found) {
      rzpData = rzpResult;
      await setCachedValue(getCacheKey('ico', `rzp:${body.declared_ico}`), rzpData, 'rzp', true);
    } else {
      rzpData = rzpResult;
    }
    
    // 3. Check VIES (VAT verification) if EU VAT provided
    const vatNumber = body.declared_vat;
    if (vatNumber && isEuVat(vatNumber)) {
      const viesResult = await checkVies(vatNumber);
      if (viesResult) {
        viesData = {
          valid: viesResult.valid,
          country_code: viesResult.country_code,
          name: viesResult.name
        };
        if (!viesResult.error) {
          await setCachedValue(getCacheKey('vat', vatNumber), viesData, 'vies', viesResult.valid);
        }
      }
    }
    
    // Determine verification status
    if (!aresData?.found) {
      finalStatus = 'not_found';
      reasons.push('ico_not_found');
    } else if (aresData.status === 'dissolved') {
      finalStatus = 'rejected';
      reasons.push('company_dissolved');
    } else {
      // IČO found - check other criteria
      reasons.push('ico_found');
      
      // Check trade license
      if (rzpData?.found) {
        const rzpStatus = rzpData.trade_license_status || 'active';
        if (rzpStatus === 'active') {
          reasons.push('trade_license_active');
        } else if (rzpStatus === 'suspended') {
          reasons.push('trade_license_suspended');
          finalStatus = 'requires_action';
        } else if (rzpStatus === 'not_found') {
          reasons.push('trade_license_not_found');
          finalStatus = 'requires_action';
        } else {
          reasons.push(`trade_license_${rzpStatus}`);
        }
      } else {
        reasons.push('trade_license_not_verified');
      }
      
      // Check VAT
      if (viesData) {
        if (viesData.valid) {
          reasons.push('vat_valid');
        } else {
          reasons.push('vat_invalid');
        }
      }
      
      // Calculate confidence
      const icoMatch = matchIco(body.declared_ico!, aresData.ico || body.declared_ico!);
      const nameMatch = matchCompanyName(
        body.declared_company_name || '', 
        aresData.company_name || ''
      );
      
      confidenceScore = calculateOverallConfidence(
        icoMatch,
        nameMatch,
        body.declared_vat ? { score: viesData?.valid ? 1 : 0, match_type: 'none' } : undefined
      );
      
      // Determine final status based on confidence
      if (finalStatus === 'pending') {
        if (confidenceScore >= 0.85) {
          finalStatus = 'verified';
          reasons.push('high_confidence');
        } else if (confidenceScore >= 0.6) {
          finalStatus = 'verified';
          reasons.push('medium_confidence');
        } else {
          finalStatus = 'requires_action';
          reasons.push('low_confidence');
        }
      }
    }
    
    // Update verification record
    await supabaseAdmin
      .from('business_verifications')
      .update({
        status: finalStatus,
        reasons,
        confidence_score: confidenceScore,
        
        // ARES data
        ico: aresData?.ico,
        company_name: aresData?.company_name,
        legal_form: aresData?.legal_form,
        address: aresData?.address,
        registration_date: aresData?.registration_date,
        
        // RŽP data
        trade_license_status: rzpData?.trade_license_status || 'not_found',
        trade_license_scope: [],
        
        // VIES data
        vat_valid: viesData?.valid || false,
        vat_country: viesData?.country_code,
        
        // Full responses
        ares_response: aresData,
        rzp_response: rzpData,
        vies_response: viesData,
        
        completed_at: new Date().toISOString(),
        source: 'automatic'
      })
      .eq('id', verificationId);
    
    // Create audit log entry
    await supabaseAdmin
      .from('verification_audit_logs')
      .insert({
        verification_id: verificationId,
        event_type: 'verification_completed',
        actor_type: 'system',
        new_status: finalStatus,
        payload: {
          request_id: requestId,
          ico_checked: body.declared_ico,
          ares_result: aresData?.found,
          rzp_result: rzpData?.found,
          vies_result: viesData?.valid
        }
      });
    
  } catch (error) {
    console.error('Verification process error:', error);
    
    // Update status to requires_action on error
    await supabaseAdmin
      .from('business_verifications')
      .update({
        status: 'requires_action',
        reasons: ['verification_error'],
        notes: `Verification failed: ${error}`
      })
      .eq('id', verificationId);
  }
}