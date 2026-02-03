/**
 * API security utilities: rate limiting and CSRF protection.
 * For production with multiple instances, use Redis/Upstash for rate limiting.
 */

// Allowed origins for CSRF protection
const ALLOWED_ORIGINS = [
  "https://nostr-wot.com",
  "https://www.nostr-wot.com",
];

// Development origins
const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

/**
 * Validate Origin/Referer header for CSRF protection.
 * Call this for state-changing requests (POST, PUT, DELETE, PATCH).
 * @returns true if the origin is valid, false otherwise
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Combine allowed origins based on environment
  const allowedOrigins = process.env.NODE_ENV === "development"
    ? [...ALLOWED_ORIGINS, ...DEV_ORIGINS]
    : ALLOWED_ORIGINS;

  // Check Origin header first (most reliable)
  if (origin) {
    return allowedOrigins.some((allowed) => origin === allowed);
  }

  // Fall back to Referer header
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      return allowedOrigins.some((allowed) => refererOrigin === allowed);
    } catch {
      return false;
    }
  }

  // In development, allow requests without Origin/Referer (e.g., Postman, curl)
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // In production, reject requests without proper headers
  return false;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store rate limit data in memory (per-instance)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in the window */
  remaining: number;
  /** Time in seconds until the rate limit resets */
  resetIn: number;
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  startCleanup();

  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      resetIn: Math.ceil(config.windowMs / 1000),
    };
  }

  // Increment count
  entry.count++;

  // Check if over limit
  if (entry.count > config.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  };
}

/**
 * Get client identifier from request headers
 * Prefers X-Forwarded-For for proxied requests, falls back to a default
 */
export function getClientIdentifier(request: Request): string {
  // Try X-Forwarded-For first (for proxied requests like Vercel)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(",")[0].trim();
  }

  // Try X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback identifier (not ideal but prevents crashes)
  return "unknown";
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // Contact form: 5 requests per hour
  contact: {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Newsletter: 3 requests per hour
  newsletter: {
    limit: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // General API: 100 requests per minute
  api: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;
