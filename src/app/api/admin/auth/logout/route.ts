import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value;
  
  if (sessionToken) {
    await invalidateSession(sessionToken);
  }
  
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  
  return response;
}
