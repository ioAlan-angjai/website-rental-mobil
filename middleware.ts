import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/admin', '/account'];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // Auth routes (login, register) — redirect to home if already logged in
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    // Not logged in — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    // Already logged in — redirect based on role
    if (token.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.redirect(new URL('/account', request.url));
  }

  // Admin-only protection: non-admin cannot access /admin
  if (pathname.startsWith('/admin') && token && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/login', '/register'],
};
