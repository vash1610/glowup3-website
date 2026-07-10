import { NextRequest, NextResponse } from 'next/server';
import { verifyMfaCode, SESSION_DURATION_MS as DEFAULT_SESSION_DURATION_MS } from '@/lib/admin-auth';

const SESSION_COOKIE = 'admin_session';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code || typeof email !== 'string' || typeof code !== 'string') {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await verifyMfaCode(email, code, ip, userAgent);

    if (!result.success || !result.sessionToken) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: (result.durationMs ?? DEFAULT_SESSION_DURATION_MS) / 1000,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
