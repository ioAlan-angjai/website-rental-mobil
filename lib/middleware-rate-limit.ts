import { NextRequest, NextResponse } from 'next/server';
import { createRateLimiter, type RateLimitOptions } from './rate-limit';

const limiters = new Map<string, ReturnType<typeof createRateLimiter>>();

export function getEndpointLimiter(endpoint: string, options: RateLimitOptions = {}) {
  if (!limiters.has(endpoint)) {
    const defaultOptions: RateLimitOptions = {
      interval: 60000,
      maxRequests: 100,
      keyGenerator: (req) => req.ip || 'anonymous',
    };

    limiters.set(endpoint, createRateLimiter({ ...defaultOptions, ...options }));
  }

  return limiters.get(endpoint)!;
}

export const rateLimitConfigs: Record<string, RateLimitOptions> = {
  'POST /api/booking': { maxRequests: 5 },
  'POST /api/booking/[id]/payment': { maxRequests: 10 },
  'POST /api/booking/[id]/cancel': { maxRequests: 10 },
  'POST /api/auth/register': { maxRequests: 3 },
  'POST /api/auth/forgot-password': { maxRequests: 5 },
  'POST /api/auth/reset-password': { maxRequests: 5 },
  'POST /api/chat': { maxRequests: 20 },
  'POST /api/payment/create-transaction': { maxRequests: 10 },
  'POST /api/upload': { maxRequests: 20 },
};
