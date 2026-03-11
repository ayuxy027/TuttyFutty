import { Request, Response, NextFunction } from "express";

// In-memory rate limiting store (use Redis for production)
const rateLimiterStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}

/**
 * Rate limiting middleware to prevent brute force attacks
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator, skipSuccessfulRequests = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || "unknown";
    const now = Date.now();

    let record = rateLimiterStore.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimiterStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: "Too many requests",
        message: `Rate limit exceeded. Please try again later.`,
      });
    }

    if (skipSuccessfulRequests) {
      const originalJson = res.json;
      res.json = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          record.count--;
        }
        return originalJson.call(this, body);
      };
    }

    next();
  };
}

/**
 * Stricter rate limit for auth endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 attempts per window (increased for dev)
  keyGenerator: (req) => {
    return `auth:${req.ip}:${req.body.email || req.body.username || "unknown"}`;
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * General rate limit for API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
  skipSuccessfulRequests: false,
});

/**
 * Clean up expired rate limit records periodically
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimiterStore.entries()) {
      if (now > record.resetTime) {
        rateLimiterStore.delete(key);
      }
    }
  }, 60 * 1000); // Clean up every minute
}
