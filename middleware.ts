import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // Protect admin routes: must be logged in as ADMIN
  if (pathname.startsWith('/admin') || pathname === '/admin') {
    if (!token || token.role !== 'ADMIN') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect account, riwayat-booking, and register routes to home since user auth is disabled
  const disabledRoutes = ['/account', '/riwayat-booking', '/register'];
  if (disabledRoutes.some((route) => pathname.startsWith(route) || pathname === route)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If already logged in as ADMIN and trying to go to login, redirect to admin dashboard
  if (pathname === '/login' && token && token.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/account', '/account/:path*', '/riwayat-booking', '/riwayat-booking/:path*', '/login', '/register'],
};
