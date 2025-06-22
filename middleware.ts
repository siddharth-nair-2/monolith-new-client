import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/check-domain',
  '/invite',
  '/forgot-password',
  '/reset-password',
  '/waitlist',
  '/terms-of-service',
  '/privacy-policy',
];

// Define API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/check-domain',
  '/api/auth/forgot-password',
  '/api/invites/validate',
  '/api/waitlist',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('auth_token');
  const refreshToken = request.cookies.get('refresh_token');
  
  // Define auth pages that logged-in users shouldn't access
  const authPages = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  // Check if the path is a public route
  const isPublicRoute = publicRoutes.includes(pathname) || 
    publicRoutes.some(route => pathname.startsWith(route + '/'));
  
  // Check if the path is a public API route
  const isPublicApiRoute = publicApiRoutes.includes(pathname) ||
    publicApiRoutes.some(route => pathname.startsWith(route + '/'));
  
  // Check if it's an auth page
  const isAuthPage = authPages.includes(pathname) || 
    authPages.some(page => pathname.startsWith(page + '/'));
  
  // Allow static files and Next.js internals
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // If user has token and tries to access auth pages, redirect to dashboard
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If no tokens and trying to access protected route
  if (!accessToken && !refreshToken && !isPublicRoute && !isPublicApiRoute) {
    if (pathname.startsWith('/api/')) {
      // For API routes, return 401
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required',
          message: 'Please login to access this resource'
        },
        { status: 401 }
      );
    }
    
    // For page routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }
  
  // For API requests, add refresh token header if available
  if (pathname.startsWith('/api/') && !isPublicApiRoute && refreshToken) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-Refresh-Token', refreshToken.value);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
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
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};