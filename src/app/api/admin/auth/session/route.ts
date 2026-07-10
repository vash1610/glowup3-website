import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const session = await requireAdminSession();

  if (!session.valid) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
  });
}
