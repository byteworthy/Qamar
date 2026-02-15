import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for session cookie
  const sessionCookie = request.cookies.get('noor_session');

  // Define protected routes
  const protectedRoutes = ['/reflect', '/history', '/account', '/insights'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/reflect/:path*',
    '/history/:path*',
    '/account/:path*',
    '/insights/:path*',
  ],
};
