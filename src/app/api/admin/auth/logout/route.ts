import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/admin-auth';

const SESSION_COOKIE = 'admin_session';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    await logout(sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);

  return response;
}
