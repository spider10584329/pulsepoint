import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define role-specific routes and their required roles
const roleBasedRoutes = {
  '/admin': [0], // Admin only
  '/user': [1], // Regular users only
  '/supportTeam': [2], // Support team only
  '/dashboard': [0, 1, 2] // All roles (legacy route)
}

// Define routes that require authentication but not verification
const authRoutes = ['/verify']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a role-based route
  const isRoleBasedRoute = Object.keys(roleBasedRoutes).some((route: string) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route: string) => pathname.startsWith(route))
  
  if (isRoleBasedRoute || isAuthRoute) {
    // Get user data from cookies or headers (since we can't access localStorage in middleware)
    // For now, we'll rely on client-side protection via AuthGuard
    // In a production app, you'd validate JWT tokens here
    
    // Let the request continue, AuthGuard will handle client-side protection
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
