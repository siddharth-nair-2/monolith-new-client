import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

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

// JWT token payload interface
interface JWTPayload {
  exp: number;
  iat: number;
  sub?: string;
  [key: string]: any;
}

// Helper to check if tokens are valid
function hasValidTokens(accessToken: string | undefined, refreshToken: string | undefined): boolean {
  // If no tokens, definitely not valid
  if (!accessToken || !refreshToken) return false;
  
  try {
    // Decode and check access token expiration
    const decoded = jwtDecode<JWTPayload>(accessToken);
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 1 minute buffer)
    if (decoded.exp && decoded.exp < (now + 60)) {
      // Token is expired or expiring soon, still valid if we have refresh token
      return !!refreshToken;
    }
    
    return true;
  } catch (error) {
    // If we can't decode the token, assume it's invalid
    // But still valid if we have a refresh token to recover
    return !!refreshToken;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  
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
  
  // Check if tokens are valid
  const hasTokens = hasValidTokens(accessToken, refreshToken);
  
  // If user has valid tokens and tries to access auth pages, redirect to dashboard
  if (hasTokens && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If no valid tokens and trying to access protected route
  if (!hasTokens && !isPublicRoute && !isPublicApiRoute) {
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