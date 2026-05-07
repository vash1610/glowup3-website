import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export function generatePasskey(): string {
  return randomBytes(24).toString('base64url');
}

export async function hashPasskey(passkey: string): Promise<string> {
  return bcrypt.hash(passkey, SALT_ROUNDS);
}

export async function verifyPasskey(passkey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(passkey, hash);
}

export function generateEmailCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function verifyCode(code: string, hash: string): boolean {
  const codeHash = hashCode(code);
  return codeHash === hash;
}

export function isCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function isRateLimited(ip: string, attempts: Map<string, number[]>): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  const userAttempts = attempts.get(ip) || [];
  const recentAttempts = userAttempts.filter(t => now - t < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return true;
  }
  
  return false;
}
