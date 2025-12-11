// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from './lib/auth'
import { securityHeaders } from './lib/security'
import { getClientIp, getUserAgent } from './lib/security'
import { auditLog } from './lib/logger'

// Role-based route mapping
const roleBasedRoutes = {
  PLAYER: ['/dashboard/player'],
  OWNER: ['/dashboard/owner'],
  EMPLOYEE: ['/dashboard/employee'],
  ADMIN: ['/dashboard/admin', '/dashboard/admin/users']
}

// Public routes (no authentication required)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify'
]

// Auth required but not role-specific
const authRoutes = [
  '/dashboard',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/refresh',
  '/api/auth/users'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()
  
  // Apply security headers to all responses
  const headers = securityHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Allow static files and API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/auth/') && 
    !pathname.startsWith('/api/auth/me') &&
    !pathname.startsWith('/api/auth/logout') &&
    !pathname.startsWith('/api/auth/refresh') &&
    !pathname.startsWith('/api/auth/users')
  ) {
    return response
  }

  // Check if route is public
  if (publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(route))) {
    return response
  }

  // Get access token
  const accessToken = request.cookies.get('accessToken')?.value
  
  // If no token and route requires auth, redirect to login
  if (!accessToken && (authRoutes.includes(pathname) || pathname.startsWith('/dashboard'))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token if present
  if (accessToken) {
    const decoded = verifyAccessToken(accessToken)
    
    if (!decoded) {
      // Token invalid or expired
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('expired', 'true')
      const redirectResponse = NextResponse.redirect(loginUrl)
      
      // Clear invalid tokens
      redirectResponse.cookies.delete('accessToken')
      redirectResponse.cookies.delete('refreshToken')
      
      return redirectResponse
    }

    const userRole = decoded.role as keyof typeof roleBasedRoutes
    
    // Handle /dashboard redirect based on role
    if (pathname === '/dashboard') {
      const redirectPath = roleBasedRoutes[userRole]?.[0] || '/dashboard/player'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // Check role-based access
    if (pathname.startsWith('/dashboard')) {
      const allowedRoutes = roleBasedRoutes[userRole] || []
      const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))
      
      if (!hasAccess) {
        // User doesn't have access to this dashboard
        const redirectPath = allowedRoutes[0] || '/dashboard'
        
        // Log unauthorized access attempt
        auditLog(
          decoded.userId,
          'UNAUTHORIZED_ACCESS_ATTEMPT',
          'ROUTE',
          pathname,
          undefined,
          { attemptedPath: pathname, userRole },
          getClientIp(request),
          getUserAgent(request)
        )
        
        return NextResponse.redirect(new URL(redirectPath, request.url))
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', decoded.userId)
      requestHeaders.set('x-user-role', userRole)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    }
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
