import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip auth for API routes (or protect them too by removing this condition)
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [username, password] = atob(authHeader.split(' ')[1]).split(':');
    
    // Change these credentials to whatever you want
    if (username === 'glowup' && password === 'glowup3') {
      return NextResponse.next();
    }
  }

  // Return 401 Unauthorized with a Basic Auth challenge
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="GlowUp3 Dev Access"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'],
};