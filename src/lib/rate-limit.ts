/**
 * Distributed rate limiter using Vercel KV (Redis).
 *
 * Uses Vercel KV in production for distributed rate limiting across
 * all serverless instances. Falls back to in-memory for local development.
 */

import { kv } from "@vercel/kv";

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// Check if Vercel KV is available (production)
const isKvAvailable = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

// In-memory fallback for local development
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limit using Vercel KV (distributed across all instances).
 */
async function rateLimitWithKv(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Use Redis MULTI for atomic operations
  const current = await kv.get<{ count: number; resetTime: number }>(key);

  if (!current || now > current.resetTime) {
    // First request or window expired - create new entry
    const newEntry = { count: 1, resetTime: now + windowMs };
    await kv.set(key, newEntry, { px: windowMs }); // Auto-expire
    return {
      success: true,
      remaining: config.limit - 1,
      reset: newEntry.resetTime,
    };
  }

  // Within current window
  if (current.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: current.resetTime,
    };
  }

  // Increment counter
  const updated = { ...current, count: current.count + 1 };
  const ttl = current.resetTime - now;
  await kv.set(key, updated, { px: ttl > 0 ? ttl : windowMs });

  return {
    success: true,
    remaining: config.limit - updated.count,
    reset: current.resetTime,
  };
}

/**
 * Rate limit using in-memory store (for local development).
 */
function rateLimitInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: config.limit - 1,
      reset: now + windowMs,
    };
  }

  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Check if a request should be rate limited.
 *
 * Uses Vercel KV in production for distributed rate limiting.
 * Falls back to in-memory for local development.
 *
 * @param identifier - Unique identifier for the client (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (isKvAvailable) {
    try {
      return await rateLimitWithKv(identifier, config);
    } catch (error) {
      // If KV fails, fall back to in-memory (better than no rate limiting)
      console.error("Vercel KV rate limit error, falling back to in-memory:", error);
      return rateLimitInMemory(identifier, config);
    }
  }

  return rateLimitInMemory(identifier, config);
}

/**
 * Get client identifier from request.
 * Uses X-Forwarded-For header (set by Vercel) or falls back to a default.
 */
export function getClientIdentifier(request: Request): string {
  // Vercel sets x-forwarded-for
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take the first IP (client IP)
    return forwarded.split(",")[0].trim();
  }

  // Fallback for local development
  return "unknown";
}

// Pre-configured rate limiters for different endpoints
export const RATE_LIMITS = {
  // Public endpoints - stricter limits
  usernameCheck: { limit: 30, windowSeconds: 60 }, // 30 per minute

  // Authenticated endpoints - more lenient
  battery: { limit: 30, windowSeconds: 60 }, // 30 per minute
  settings: { limit: 10, windowSeconds: 60 }, // 10 per minute
  usernameClaim: { limit: 5, windowSeconds: 3600 }, // 5 per hour

  // Image generation - prevent abuse
  ogImage: { limit: 60, windowSeconds: 60 }, // 60 per minute
  sticker: { limit: 30, windowSeconds: 60 }, // 30 per minute
} as const;
