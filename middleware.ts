// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { securityHeaders, getClientIp, getUserAgent } from './lib/security'
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
  '/api/auth/users'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ✅ Apply security headers
  const headers = securityHeaders()
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // ✅ Allow static files and most API auth routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    (pathname.startsWith('/api/auth/') &&
      !pathname.startsWith('/api/auth/me') &&
      !pathname.startsWith('/api/auth/logout') &&
      !pathname.startsWith('/api/auth/users'))
  ) {
    return response
  }

  // ✅ Public routes allowed
  if (publicRoutes.includes(pathname) || publicRoutes.some(route => pathname.startsWith(route))) {
    return response
  }

  // ✅ Get userId from cookie (بديل accessToken)
  const userId = request.cookies.get('userId')?.value

  // ✅ If no userId and route requires auth → redirect
  if (!userId && (authRoutes.includes(pathname) || pathname.startsWith('/dashboard'))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ✅ If userId exists → continue with role-based logic
  if (userId) {
    const userRole = request.cookies.get('userRole')?.value as keyof typeof roleBasedRoutes

    // ✅ Redirect /dashboard → role dashboard
    if (pathname === '/dashboard') {
      const redirectPath = roleBasedRoutes[userRole]?.[0] || '/dashboard/player'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }

    // ✅ Role-based access control
    if (pathname.startsWith('/dashboard')) {
      const allowedRoutes = roleBasedRoutes[userRole] || []
      const hasAccess = allowedRoutes.some(route => pathname.startsWith(route))

      if (!hasAccess) {
        const redirectPath = allowedRoutes[0] || '/dashboard'

        auditLog(
          userId,
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

    // ✅ Add user info to API requests
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', userId)
      if (userRole) requestHeaders.set('x-user-role', userRole)

      return NextResponse.next({
        request: {
          headers: requestHeaders
        }
      })
    }
  }

  return response
}

// ✅ ✅ ✅ FIXED MATCHER ✅ ✅ ✅
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/api/auth/:path*'
  ]
}
