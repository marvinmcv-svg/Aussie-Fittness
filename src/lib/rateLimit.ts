/**
 * Simple in-memory rate limiter.
 * For production with multiple instances, replace with Redis (Upstash, ioredis).
 *
 * Usage:
 *   const { allowed, retryAfter } = rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000);
 *   if (!allowed) return 429;
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g., `signup:ip:1.2.3.4`)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { allowed: boolean, retryAfter: number } — retryAfter is seconds until reset
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter: number; remaining: number } {
  cleanup();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    // First request or window expired
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0, remaining: limit - 1 };
  }

  existing.count++;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) {
    return { allowed: false, retryAfter, remaining: 0 };
  }

  return { allowed: true, retryAfter: 0, remaining };
}
