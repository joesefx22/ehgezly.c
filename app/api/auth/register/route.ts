// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  hashPassword, 
  generateSecureToken, 
  getTokenExpiry,
  validatePasswordStrength 
} from '@/lib/auth'
import { registerSchema } from '@/lib/validators'
import { emailService } from '@/lib/email'
import { rateLimiter } from '@/lib/rate-limit'
import { handleError, ValidationError, ConflictError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { getClientIp, withAudit } from '@/lib/security'
import { auditLog } from '@/lib/logger'

export const POST = withAudit(async (request: NextRequest) => {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    await rateLimiter.checkForRegister(request, ip)

    // Parse and validate input
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check password strength
    const passwordCheck = validatePasswordStrength(validatedData.password)
    if (!passwordCheck.isValid) {
      throw new ValidationError('Password does not meet requirements', passwordCheck.errors)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role
      }
    })

    // Generate email verification token
    const verificationToken = generateSecureToken()
    const tokenExpiry = getTokenExpiry(24) // 24 hours

    await prisma.token.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expiresAt: tokenExpiry
      }
    })

    // Send verification email
    const verificationLink = `${process.env.APP_URL}/verify-email/${verificationToken}`
    const emailContent = emailService.getVerificationEmail(
      user.name,
      verificationLink
    )

    await emailService.sendEmail({
      to: user.email,
      subject: 'Verify Your Email Address',
      html: emailContent
    })

    // Log registration
    auditLog(
      user.id,
      'REGISTER',
      'USER',
      user.id,
      null,
      { email: user.email, role: user.role },
      getClientIp(request),
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json(
      successResponse('Registration successful. Please check your email to verify your account.', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }),
      { status: 201 }
    )

  } catch (error: any) {
    const appError = handleError(error)
    
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
}, 'REGISTER', 'USER')
