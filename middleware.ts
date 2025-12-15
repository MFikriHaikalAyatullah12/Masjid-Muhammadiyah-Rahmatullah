import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // API routes yang public
  const publicApiRoutes = ['/api/auth/login', '/api/auth/register'];
  const isPublicApi = publicApiRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute || isPublicApi) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('auth_token');

  if (!token) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify JWT token
    await jwtVerify(token.value, SECRET_KEY);
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
