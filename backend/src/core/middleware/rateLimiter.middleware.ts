import rateLimit from 'express-rate-limit';

// Strict Rate Limiter for Authentication & Login Probes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 requests per window
  message: {
    success: false,
    message: 'Security Alert: Too many login attempts from this IP. Please try again after 15 minutes.',
    error: { code: 'RATE_LIMITED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Rate Limiter for Password Reset & OTP Requests
export const passwordResetRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,                   // 3 requests per 30 minutes
  message: {
    success: false,
    message: 'Security Alert: Password reset request limit exceeded. Please try again after 30 minutes.',
    error: { code: 'RATE_LIMITED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Rate Limiter for Bulk Data Imports (Registrar CSV/Excel)
export const bulkImportRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,                  // 15 bulk imports per hour
  message: {
    success: false,
    message: 'Security Alert: Bulk import rate limit reached. Please wait before starting another import.',
    error: { code: 'RATE_LIMITED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ultra-Strict Rate Limiter for Break-Glass Privileged Elevation
export const breakGlassRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,                   // 3 requests per hour
  message: {
    success: false,
    message: 'Security Alert: Emergency Break Glass rate limit exceeded.',
    error: { code: 'RATE_LIMITED' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
