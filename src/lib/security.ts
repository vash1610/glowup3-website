import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from './supabase-admin';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

// Store for tracking requests (in production, use Redis or similar)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { success: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: now + RATE_LIMIT_WINDOW };
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// CORS headers configuration
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'https://todaylytesting.xyz',
    'https://www.todaylytesting.xyz',
    'http://localhost:3000', // For development
    'http://localhost:19006', // For Expo
  ];

  const isAllowed = !origin || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

// API response helper with security headers
export function secureResponse(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...getCorsHeaders(),
    },
  });
}

interface AdminSession {
  userId: string;
  email: string;
  role: string;
}

export async function verifyAdminSession(request: NextRequest): Promise<AdminSession | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const supabase = createAdminClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Check if user has admin role in metadata or user_roles table
    const isAdmin = user.user_metadata?.role === 'admin' || 
                    user.user_metadata?.is_admin === true ||
                    user.app_metadata?.role === 'admin' ||
                    user.app_metadata?.is_admin === true;
    
    if (!isAdmin) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || '',
      role: 'admin'
    };
  } catch (err) {
    console.error('Error verifying admin session:', err);
    return null;
  }
}
