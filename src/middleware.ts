import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that must stay reachable without an admin session — this is the
// login flow itself, nothing else. Every other /admin and /api/admin route
// is gated. (Verification endpoints used to be listed here too; they now
// require a real session like everything else and are checked per-route via
// requireAdminSession().)
const PUBLIC_PATHS = [
  '/login/admin',
  '/login/admin/verify',
  '/api/admin/auth/initiate',
  '/api/admin/auth/verify',
  '/api/admin/auth/resend',
  '/_next',
  '/favicon.svg',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Fast-fail on missing cookie at the edge. This is not the source of
    // truth — every route still calls requireAdminSession() to validate the
    // token against the database — but it avoids hitting Postgres at all for
    // the common case of an anonymous request.
    const sessionToken = request.cookies.get('admin_session')?.value;
    if (!sessionToken) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login/admin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.svg).*)'],
};
