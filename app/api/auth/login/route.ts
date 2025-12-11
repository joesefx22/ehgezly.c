// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  incrementLoginAttempts,
  resetLoginAttempts,
  isAccountLocked 
} from '@/lib/auth'
import { loginSchema } from '@/lib/validators'
import { rateLimiter } from '@/lib/rate-limit'
import { handleError, AuthenticationError, ValidationError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { getClientIp, withAudit } from '@/lib/security'
import { auditLog } from '@/lib/logger'

export const POST = withAudit(async (request: NextRequest) => {
  try {
    // Parse and validate input
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    // Rate limiting for login attempts
    await rateLimiter.checkForAuth(request, validatedData.email)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        sessions: {
          where: {
            expiresAt: { gt: new Date() }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      await incrementLoginAttempts('unknown', 5, 15) // Track failed attempts
      throw new AuthenticationError('Invalid email or password')
    }

    // Check if account is locked
    if (isAccountLocked(user.lockedUntil)) {
      throw new AuthenticationError('Account is temporarily locked. Please try again later.')
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated')
    }

    // Verify password
    const isPasswordValid = await comparePassword(validatedData.password, user.password)
    
    if (!isPasswordValid) {
      await incrementLoginAttempts(user.id, 5, 15)
      throw new AuthenticationError('Invalid email or password')
    }

    // Check if email is verified (optional, depending on requirements)
    if (!user.isVerified) {
      throw new AuthenticationError('Please verify your email address first')
    }

    // Reset login attempts on successful login
    await resetLoginAttempts(user.id)

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role)
    const refreshToken = generateRefreshToken(user.id)

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: getClientIp(request),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        updatedAt: new Date()
      }
    })

    // Prepare response
    const response = NextResponse.json(
      successResponse('Login successful', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        }
      })
    )

    // Set cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    // Log successful login
    auditLog(
      user.id,
      'LOGIN',
      'USER',
      user.id,
      null,
      { method: 'email_password' },
      getClientIp(request),
      request.headers.get('user-agent') || undefined
    )

    return response

  } catch (error: any) {
    const appError = handleError(error)
    
    // Log failed login attempt
    if (appError.errorCode === 'AUTHENTICATION_ERROR') {
      auditLog(
        null,
        'LOGIN_FAILED',
        'USER',
        undefined,
        null,
        { 
          email: request.body ? (await request.json()).email : 'unknown',
          error: appError.message 
        },
        getClientIp(request),
        request.headers.get('user-agent') || undefined
      )
    }
    
    return NextResponse.json(
      errorResponse(
        appError.message,
        appError.errorCode,
        appError.details,
        request.nextUrl.pathname
      ),
      { status: appError.statusCode }
    )
  }
}, 'LOGIN', 'USER')
