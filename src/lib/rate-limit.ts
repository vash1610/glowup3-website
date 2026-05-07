import { createClient } from '@supabase/supabase-js';

const rateLimitStore = new Map<string, number[]>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetInSeconds: number;
} {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  
  const userAttempts = rateLimitStore.get(ip) || [];
  const recentAttempts = userAttempts.filter(t => now - t < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    const oldestAttempt = Math.min(...recentAttempts);
    const resetInSeconds = Math.ceil((oldestAttempt + windowMs - now) / 1000);
    
    return {
      allowed: false,
      remainingAttempts: 0,
      resetInSeconds,
    };
  }
  
  return {
    allowed: true,
    remainingAttempts: maxAttempts - recentAttempts.length,
    resetInSeconds: 0,
  };
}

export function recordAttempt(ip: string): void {
  const now = Date.now();
  const userAttempts = rateLimitStore.get(ip) || [];
  userAttempts.push(now);
  
  // Keep only attempts from last 15 minutes
  const windowMs = 15 * 60 * 1000;
  const recentAttempts = userAttempts.filter(t => now - t < windowMs);
  
  rateLimitStore.set(ip, recentAttempts);
}
