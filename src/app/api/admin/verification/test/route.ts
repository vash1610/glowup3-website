// Test Verification API
// GET /api/admin/verification/test?ico=XXXXX - Test ARES lookup

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { checkAres } from '@/lib/verification/ares';
import { checkRzp } from '@/lib/verification/rzp';
import { checkVies } from '@/lib/verification/vies';
import { validateIcoChecksum } from '@/lib/verification/matching';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ico = searchParams.get('ico');
    
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
    
    if (!validChecksum) {
      return NextResponse.json(
        { 
          error: 'Invalid IČO checksum',
          ico: cleanIco,
          note: 'This IČO does not pass checksum validation'
        },
        { status: 400 }
      );
    }
    
    // Test ARES lookup
    console.log(`Testing ARES lookup for IČO: ${cleanIco}`);
    const aresResult = await checkAres(cleanIco);
    
    // Test RŽP lookup
    console.log(`Testing RŽP lookup for IČO: ${cleanIco}`);
    const rzpResult = await checkRzp(cleanIco);
    
    // Test VIES (Czech VAT)
    console.log(`Testing VIES lookup for CZ${cleanIco}`);
    const viesResult = await checkVies(`CZ${cleanIco}`);
    
    return NextResponse.json({
      ico: cleanIco,
      checksum_valid: validChecksum,
      results: {
        ares: aresResult,
        rzp: rzpResult,
        vies: viesResult
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test verification error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    );
  }
}