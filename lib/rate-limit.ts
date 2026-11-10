import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  interval?: number;
  maxRequests?: number;
  keyGenerator?: (req: NextRequest) => string;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    interval = 60000,
    maxRequests = 60,
    keyGenerator = (req) => req.ip || 'anonymous',
  } = options;

  return (req: NextRequest) => {
    const key = keyGenerator(req);
    const now = Date.now();

    if (!store[key]) {
      store[key] = { count: 1, resetTime: now + interval };
      return null;
    }

    if (now > store[key].resetTime) {
      store[key] = { count: 1, resetTime: now + interval };
      return null;
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() },
        }
      );
    }

    return null;
  };
}
