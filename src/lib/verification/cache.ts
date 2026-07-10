// Verification Cache and Rate Limiting
// Provides caching and rate limiting for registry calls

import { supabaseAdmin } from '@/lib/supabase-admin';

// Cache configuration
export const CACHE_CONFIG = {
  // Cache successful responses for 24 hours
  POSITIVE_TTL_HOURS: 24,
  
  // Cache negative results for 1 hour
  NEGATIVE_TTL_HOURS: 1,
  
  // Max cache entries
  MAX_ENTRIES: 10000,
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  // Max requests per user per minute
  USER_LIMIT: 5,
  
  // Max requests per IP per minute
  IP_LIMIT: 10,
  
  // Window in seconds
  WINDOW_SECONDS: 60,
};

// In-memory cache for fast access
interface CacheEntry {
  value: unknown;
  expiresAt: number;
  source: string;
}

const memoryCache = new Map<string, CacheEntry>();

// Check if memory cache has valid entry
function getFromMemoryCache(key: string): unknown | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  
  return entry.value;
}

// Set memory cache entry
function setMemoryCache(key: string, value: unknown, ttlMs: number, source: string): void {
  // Limit memory cache size
  if (memoryCache.size > CACHE_CONFIG.MAX_ENTRIES) {
    // Remove oldest entries
    const entries = [...memoryCache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
    const toRemove = entries.slice(0, 100);
    toRemove.forEach(([k]) => memoryCache.delete(k));
  }
  
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    source
  });
}

// Get from cache (memory first, then database)
export async function getCachedValue(key: string): Promise<{ value: unknown; source: string } | null> {
  // Check memory cache first
  const memoryValue = getFromMemoryCache(key);
  if (memoryValue !== null) {
    return { value: memoryValue, source: 'memory' };
  }
  
  // Check database cache
  try {
    const { data, error } = await supabaseAdmin
      .from('verification_cache')
      .select('*')
      .eq('key', key)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Update hit count
    await supabaseAdmin
      .from('verification_cache')
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq('key', key);
    
    // Add to memory cache
    const ttlMs = new Date(data.expires_at).getTime() - Date.now();
    setMemoryCache(key, data.value, ttlMs, data.source);
    
    return { value: data.value, source: data.source };
  } catch {
    return null;
  }
}

// Set cache value
export async function setCachedValue(
  key: string,
  value: unknown,
  source: string,
  isPositive: boolean
): Promise<void> {
  const ttlHours = isPositive ? CACHE_CONFIG.POSITIVE_TTL_HOURS : CACHE_CONFIG.NEGATIVE_TTL_HOURS;
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  
  // Set memory cache
  setMemoryCache(key, value, ttlHours * 60 * 60 * 1000, source);
  
  // Set database cache
  try {
    await supabaseAdmin
      .from('verification_cache')
      .upsert({
        key,
        value,
        expires_at: expiresAt.toISOString(),
        source,
        hit_count: 0,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });
  } catch (error) {
    console.error('Failed to set cache in database:', error);
  }
}

// Check rate limit for user
export async function checkUserRateLimit(
  userId: string
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const now = Date.now();
  const windowMs = RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;
  
  try {
    // Clean up old entries (older than window)
    await supabaseAdmin
      .from('verification_queue')
      .delete()
      .lt('created_at', new Date(now - windowMs).toISOString());
    
    // Count recent requests
    const { count } = await supabaseAdmin
      .from('verification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('created_at', new Date(now - windowMs).toISOString());
    
    const requests = count || 0;
    const remaining = Math.max(0, RATE_LIMIT_CONFIG.USER_LIMIT - requests);
    
    if (requests >= RATE_LIMIT_CONFIG.USER_LIMIT) {
      // Calculate reset time
      const { data: oldest } = await supabaseAdmin
        .from('verification_queue')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      const resetIn = oldest 
        ? Math.max(0, RATE_LIMIT_CONFIG.WINDOW_SECONDS - Math.floor((now - new Date(oldest.created_at).getTime()) / 1000))
        : RATE_LIMIT_CONFIG.WINDOW_SECONDS;
      
      return { allowed: false, remaining: 0, resetIn };
    }
    
    return { allowed: true, remaining, resetIn: 0 };
  } catch {
    // If database check fails, allow request (fail open)
    return { allowed: true, remaining: RATE_LIMIT_CONFIG.USER_LIMIT, resetIn: 0 };
  }
}

// Check rate limit by IP
export function checkIpRateLimit(
  ip: string,
  requestCounts: Map<string, number[]>
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const windowMs = RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000;
  
  const requests = requestCounts.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < windowMs);
  
  const remaining = Math.max(0, RATE_LIMIT_CONFIG.IP_LIMIT - recentRequests.length);
  
  if (recentRequests.length >= RATE_LIMIT_CONFIG.IP_LIMIT) {
    const oldest = Math.min(...recentRequests);
    const resetIn = Math.max(0, Math.ceil((oldest + windowMs - now) / 1000));
    
    return { allowed: false, remaining: 0, resetIn };
  }
  
  return { allowed: true, remaining, resetIn: 0 };
}

// Record IP request
export function recordIpRequest(
  ip: string,
  requestCounts: Map<string, number[]>
): void {
  const requests = requestCounts.get(ip) || [];
  requests.push(Date.now());
  
  // Keep only last window's requests
  const now = Date.now();
  const recentRequests = requests.filter(t => now - t < RATE_LIMIT_CONFIG.WINDOW_SECONDS * 1000);
  
  requestCounts.set(ip, recentRequests);
}

// Generate cache key
export function getCacheKey(type: 'ico' | 'vat', value: string): string {
  return `${type}:${value.replace(/\s/g, '').toUpperCase()}`;
}

// Cleanup old cache entries
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const { count } = await supabaseAdmin
      .from('verification_cache')
      .delete({ count: 'exact' })
      .lt('expires_at', new Date().toISOString());
    
    return count || 0;
  } catch {
    return 0;
  }
}

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
  BACKOFF_MULTIPLIER: 2,
};

// Calculate retry delay with exponential backoff
export function getRetryDelay(attempt: number): number {
  const delay = RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY_MS);
}

// Sleep helper for retries
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry wrapper for API calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = RETRY_CONFIG.MAX_RETRIES
): Promise<{ success: boolean; data?: T; error?: string; attempts: number }> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    attempts++;
    
    try {
      const data = await fn();
      return { success: true, data, attempts };
    } catch (error) {
      const delay = getRetryDelay(attempts - 1);
      console.log(`Attempt ${attempts} failed, retrying in ${delay}ms...`);
      
      if (attempts < maxRetries) {
        await sleep(delay);
      }
    }
  }
  
  return { success: false, error: `Failed after ${maxRetries} attempts`, attempts };
}