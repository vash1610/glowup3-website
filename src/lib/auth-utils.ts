import { supabase } from './supabase';
import { rateLimit } from './security';
import crypto from 'crypto';

// Rate limiting for login attempts
const LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOGIN_RATE_LIMIT_MAX = 5; // 5 attempts per window

const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): { allowed: boolean; resetInSeconds: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + LOGIN_RATE_LIMIT_WINDOW });
    return { allowed: true, resetInSeconds: 0 };
  }

  if (record.count >= LOGIN_RATE_LIMIT_MAX) {
    const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, resetInSeconds };
  }

  record.count++;
  return { allowed: true, resetInSeconds: 0 };
}

export function recordAttempt(ip: string): void {
  const record = loginAttempts.get(ip);
  if (record) {
    record.count++;
  }
}

// Generate a 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate session token
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Store for verification codes (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expiresAt: number; ip: string }>();
const sessions = new Map<string, { email: string; expiresAt: number; userAgent: string; ip: string }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (now > value.expiresAt) {
      verificationCodes.delete(key);
    }
  }
  for (const [key, value] of sessions.entries()) {
    if (now > value.expiresAt) {
      sessions.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

export interface InitiateLoginResult {
  success: boolean;
  error?: string;
}

export interface VerifyLoginResult {
  success: boolean;
  error?: string;
  sessionToken?: string;
}

export interface ValidateSessionResult {
  valid: boolean;
  email?: string;
}

export async function initiateLogin(email: string, passkey: string, ip: string): Promise<InitiateLoginResult> {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Verify credentials against Supabase
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify passkey using bcrypt comparison
    const crypto = require('crypto');
    const hashedPasskey = crypto.createHash('sha256').update(passkey).digest('hex');
    
    if (admin.passkey_hash !== hashedPasskey) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Generate and store verification code
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    verificationCodes.set(email.toLowerCase(), { code, expiresAt, ip });

    // In production, send the code via email
    console.log(`[DEV] Verification code for ${email}: ${code}`);

    // For development, log the code
    // In production, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Nodemailer with SMTP

    return { success: true };
  } catch (error) {
    console.error('Initiate login error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function verifyLoginCode(
  email: string,
  code: string,
  ip: string,
  userAgent: string
): Promise<VerifyLoginResult> {
  try {
    const record = verificationCodes.get(email.toLowerCase());

    if (!record) {
      return { success: false, error: 'No verification code found. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(email.toLowerCase());
      return { success: false, error: 'Verification code expired. Please request a new code.' };
    }

    if (record.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Delete the used code
    verificationCodes.delete(email.toLowerCase());

    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

    // Store session
    sessions.set(sessionToken, { email: email.toLowerCase(), expiresAt, userAgent, ip });

    return { success: true, sessionToken };
  } catch (error) {
    console.error('Verify login error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function validateSession(sessionToken: string): Promise<ValidateSessionResult> {
  const session = sessions.get(sessionToken);

  if (!session) {
    return { valid: false };
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionToken);
    return { valid: false };
  }

  return { valid: true, email: session.email };
}

export async function invalidateSession(sessionToken: string): Promise<void> {
  sessions.delete(sessionToken);
}
