import { NextRequest, NextResponse } from 'next/server';
import { resendCode } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const result = await resendCode(email, ip);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 429 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
