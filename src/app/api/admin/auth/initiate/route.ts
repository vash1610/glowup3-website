import { NextRequest, NextResponse } from 'next/server';
import { initiateLogin, checkRateLimit, recordAttempt } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, passkey } = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.', resetInSeconds: rateLimit.resetInSeconds },
        { status: 429 }
      );
    }
    
    const result = await initiateLogin(email, passkey, ip);
    
    if (!result.success) {
      recordAttempt(ip);
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    
    return NextResponse.json({ success: true, requiresCode: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
