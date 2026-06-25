import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

const shouldSkipRateLimit = () =>
  !isProduction || process.env.RATE_LIMIT_DISABLED === 'true';

const rateLimitResponse = (req, res) => {
  const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000);
  res.status(429).json({
    success: false,
    message: 'Too many requests, please try again later',
    retryAfter: retryAfter > 0 ? retryAfter : undefined,
  });
};

/**
 * General API limiter — applies to most /api routes.
 * Disabled in development so login/search during dev never blocks auth.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 500 : 10_000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  handler: rateLimitResponse,
});

/**
 * Stricter limiter for credential-based auth endpoints (brute-force protection).
 * Only counts failed attempts so successful logins are not penalized.
 */
export const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 30 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: shouldSkipRateLimit,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please wait 15 minutes and try again.',
    });
  },
});
