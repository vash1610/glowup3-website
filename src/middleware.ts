import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin dashboard public paths (no session required)
const ADMIN_PUBLIC_PATHS = [
  '/login/admin',
  '/login/admin/verify',
  '/api/admin/auth/initiate',
  '/api/admin/auth/verify',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ADMIN DASHBOARD: Check session for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Allow public admin auth paths
    if (ADMIN_PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    
    // Check for admin session
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login/admin', request.url));
    }
    return NextResponse.next();
  }
  
  // DEVELOPMENT AUTH: Basic Auth for all other routes
  if (process.env.NODE_ENV === 'development') {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader) {
      try {
        const [username, password] = atob(authHeader.split(' ')[1]).split(':');
        // Change these credentials to whatever you want
        if (username === 'glowup' && password === 'Valeriia@1234') {
          return NextResponse.next();
        }
      } catch {
        // Invalid auth header format
      }
    }
    
    // Return 401 Unauthorized with Basic Auth challenge
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="GlowUp3 Dev Access"',
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'],
};
