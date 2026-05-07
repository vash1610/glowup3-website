import { NextRequest, NextResponse } from 'next/server';
import { verifyLoginCode } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const result = await verifyLoginCode(email, code, ip, userAgent);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', result.sessionToken!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
