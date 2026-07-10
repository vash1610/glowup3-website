import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  verifyPasskey,
  generateEmailCode,
  hashCode,
  verifyCode,
  isCodeExpired,
  generateSessionToken,
} from './admin-security';
import { sendAdminVerificationEmail } from './admin-email';

export const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const CODE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CODE_ATTEMPTS = 5;
const MAX_ATTEMPTS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function adminDb() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin credentials are not configured');
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface AdminSessionResult {
  valid: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

interface LoginResult {
  success: boolean;
  error?: string;
}

interface VerifyMfaResult {
  success: boolean;
  error?: string;
  sessionToken?: string;
  expiresAt?: string;
  durationMs?: number;
}

async function getSessionTimeoutMs(db: ReturnType<typeof adminDb>): Promise<number> {
  const { data } = await db.from('admin_settings').select('session_timeout_hours').limit(1).single();
  const hours = data?.session_timeout_hours;
  return hours && hours > 0 ? hours * 60 * 60 * 1000 : SESSION_DURATION_MS;
}

async function recentAttemptCount(db: ReturnType<typeof adminDb>, email: string): Promise<number> {
  const { count } = await db
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString());
  return count ?? 0;
}

export async function login(email: string, password: string, ip: string): Promise<LoginResult> {
  const db = adminDb();
  const normalizedEmail = email.toLowerCase().trim();

  if ((await recentAttemptCount(db, normalizedEmail)) >= MAX_ATTEMPTS_PER_WINDOW) {
    return { success: false, error: 'Too many attempts. Please try again in 15 minutes.' };
  }

  const { data: admin } = await db
    .from('admin_credentials')
    .select('id, email, passkey_hash, is_active')
    .eq('email', normalizedEmail)
    .maybeSingle();

  const passwordMatches =
    admin && admin.is_active ? await verifyPasskey(password, admin.passkey_hash) : false;

  await db.from('admin_login_attempts').insert({
    email: normalizedEmail,
    ip_address: ip,
    success: passwordMatches,
  });

  if (!admin || !passwordMatches) {
    return { success: false, error: 'Invalid credentials' };
  }

  const code = generateEmailCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_DURATION_MS).toISOString();

  const { error: insertError } = await db.from('admin_verification_codes').insert({
    admin_id: admin.id,
    code_hash: codeHash,
    code_type: 'email',
    expires_at: expiresAt,
  });

  if (insertError) {
    return { success: false, error: 'Failed to start verification. Please try again.' };
  }

  await sendAdminVerificationEmail(admin.email, code);

  return { success: true };
}

export async function resendCode(email: string, ip: string): Promise<LoginResult> {
  const db = adminDb();
  const normalizedEmail = email.toLowerCase().trim();

  if ((await recentAttemptCount(db, normalizedEmail)) >= MAX_ATTEMPTS_PER_WINDOW) {
    return { success: false, error: 'Too many attempts. Please try again later.' };
  }

  const { data: admin } = await db
    .from('admin_credentials')
    .select('id, email, is_active')
    .eq('email', normalizedEmail)
    .maybeSingle();

  await db.from('admin_login_attempts').insert({
    email: normalizedEmail,
    ip_address: ip,
    success: false,
  });

  // Don't reveal whether the account exists.
  if (!admin || !admin.is_active) {
    return { success: true };
  }

  const code = generateEmailCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + CODE_DURATION_MS).toISOString();

  await db.from('admin_verification_codes').insert({
    admin_id: admin.id,
    code_hash: codeHash,
    code_type: 'email',
    expires_at: expiresAt,
  });

  await sendAdminVerificationEmail(admin.email, code);

  return { success: true };
}

export async function verifyMfaCode(
  email: string,
  code: string,
  ip: string,
  userAgent: string
): Promise<VerifyMfaResult> {
  const db = adminDb();
  const normalizedEmail = email.toLowerCase().trim();

  const { data: admin } = await db
    .from('admin_credentials')
    .select('id, email, is_active')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!admin || !admin.is_active) {
    return { success: false, error: 'Invalid credentials' };
  }

  const { data: codeRow } = await db
    .from('admin_verification_codes')
    .select('id, code_hash, expires_at, attempts, used')
    .eq('admin_id', admin.id)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!codeRow) {
    return { success: false, error: 'No active verification code. Please request a new one.' };
  }

  if (isCodeExpired(new Date(codeRow.expires_at))) {
    return { success: false, error: 'Code expired. Please request a new one.' };
  }

  if (codeRow.attempts >= MAX_CODE_ATTEMPTS) {
    return { success: false, error: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (!verifyCode(code, codeRow.code_hash)) {
    await db
      .from('admin_verification_codes')
      .update({ attempts: codeRow.attempts + 1 })
      .eq('id', codeRow.id);
    return { success: false, error: 'Invalid code' };
  }

  await db.from('admin_verification_codes').update({ used: true }).eq('id', codeRow.id);

  const sessionToken = generateSessionToken();
  const durationMs = await getSessionTimeoutMs(db);
  const expiresAt = new Date(Date.now() + durationMs).toISOString();

  const { error: sessionError } = await db.from('admin_sessions').insert({
    admin_id: admin.id,
    session_token: sessionToken,
    ip_address: ip,
    user_agent: userAgent,
    expires_at: expiresAt,
  });

  if (sessionError) {
    return { success: false, error: 'Failed to create session. Please try again.' };
  }

  await db
    .from('admin_credentials')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id);

  return { success: true, sessionToken, expiresAt, durationMs };
}

export async function getSession(token: string): Promise<AdminSessionResult> {
  if (!token) return { valid: false, error: 'No session token' };

  const db = adminDb();
  const { data, error } = await db
    .from('admin_sessions')
    .select('admin_id, expires_at, admin_credentials(email, is_active)')
    .eq('session_token', token)
    .maybeSingle();

  if (error || !data) return { valid: false, error: 'Invalid session' };

  const admin = Array.isArray(data.admin_credentials)
    ? data.admin_credentials[0]
    : data.admin_credentials;

  if (!admin || !admin.is_active) return { valid: false, error: 'Admin inactive' };
  if (new Date(data.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Session expired' };
  }

  return { valid: true, userId: data.admin_id, email: admin.email };
}

export async function logout(token: string): Promise<void> {
  if (!token) return;
  const db = adminDb();
  await db.from('admin_sessions').delete().eq('session_token', token);
}

// Shared session check for API routes. Reads the httpOnly cookie and validates
// it against the admin_sessions table — replaces the ~15 duplicated, mutually
// incompatible verifyAdminSession() implementations that used to live in each route.
export async function requireAdminSession(): Promise<AdminSessionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return { valid: false, error: 'No session token' };
  return getSession(token);
}

export { SESSION_DURATION_MS };
