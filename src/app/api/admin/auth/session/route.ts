import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  
  if (!sessionToken) {
    return NextResponse.json({ authenticated: false });
  }
  
  const result = await validateSession(sessionToken);
  
  if (!result.valid) {
    return NextResponse.json({ authenticated: false });
  }
  
  return NextResponse.json({
    authenticated: true,
    email: result.email,
  });
}
