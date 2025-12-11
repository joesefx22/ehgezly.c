// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecureToken, getTokenExpiry } from '@/lib/auth'
import { emailService } from '@/lib/email'
import { forgotPasswordSchema } from '@/lib/validators'
import { handleError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { withAudit } from '@/lib/security'

export const POST = withAudit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        successResponse('If an account exists with this email, you will receive reset instructions')
      )
    }

    // Delete any existing password reset tokens
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: 'PASSWORD_RESET'
      }
    })

    // Create new password reset token
    const resetToken = generateSecureToken()
    const tokenExpiry = getTokenExpiry(1) // 1 hour

    await prisma.token.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt: tokenExpiry
      }
    })

    // Send password reset email
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`
    const emailContent = emailService.getPasswordResetEmail(
      user.name,
      resetLink
    )

    await emailService.sendEmail({
      to: user.email,
      subject: 'Reset Your Password',
      html: emailContent
    })

    return NextResponse.json(
      successResponse('Password reset instructions sent to your email')
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
}, 'FORGOT_PASSWORD', 'USER')
