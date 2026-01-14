/**
 * Simple in-memory rate limiter for API routes.
 *
 * Note: In serverless environments like Vercel, each function instance
 * has its own memory, so this provides protection within a single instance.
 * For production at scale, consider using Vercel KV or Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

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

/**
 * Check if a request should be rate limited.
 *
 * @param identifier - Unique identifier for the client (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const key = identifier;

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
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

  // Within current window
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  return {
    success: true,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  };
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
