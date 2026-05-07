import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Hardcoded password hash for "Valeriia@1234" - for testing only
const TEST_PASSWORD_HASH = '$2b$10$E.zcpjlW.qbhnpot.LadBeTVjWWLCxQO4dP5NSar5HzHrMRmvszjO';

// In-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function checkRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetInSeconds: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function recordAttempt(ip: string) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    record.count++;
    rateLimitMap.set(ip, record);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later.', resetInSeconds: rateLimit.resetInSeconds },
        { status: 429 }
      );
    }
    
    // Check if using test password
    const passwordMatch = await bcrypt.compare(password, TEST_PASSWORD_HASH);
    
    if (passwordMatch && email === 'admin@glowup3.com') {
      // Create a session for test admin
      const sessionToken = Buffer.from(`test-admin:${Date.now()}`).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token: sessionToken,
        admin: {
          id: 'test-admin-id',
          email: 'admin@glowup3.com',
          role: 'super_admin',
        }
      });
    }
    
    // If not test credentials, try database lookup
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!error && admin) {
        const storedPasswordMatch = await bcrypt.compare(password, admin.password_hash);
        
        if (storedPasswordMatch) {
          const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');
          
          return NextResponse.json({ 
            success: true, 
            token: sessionToken,
            admin: {
              id: admin.id,
              email: admin.email,
              role: admin.role,
            }
          });
        }
      }
    }
    
    recordAttempt(ip);
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}