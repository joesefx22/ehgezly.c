// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecureToken, getTokenExpiry } from '@/lib/auth'
import { emailService } from '@/lib/email'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { withAudit } from '@/lib/security'

// POST: Request verification email
export const POST = withAudit(async (request: NextRequest) => {
  try {
    const { email } = await request.json()

    if (!email) {
      throw new ValidationError('Email is required')
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    if (user.isVerified) {
      return NextResponse.json(
        successResponse('Email already verified')
      )
    }

    // Delete any existing verification tokens
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: 'EMAIL_VERIFICATION'
      }
    })

    // Create new verification token
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

    return NextResponse.json(
      successResponse('Verification email sent')
    )

  } catch (error: any) {
    return NextResponse.json(
      errorResponse(
        error.message || 'Failed to send verification email',
        error.errorCode || 'SERVER_ERROR'
      ),
      { status: error.statusCode || 500 }
    )
  }
}, 'REQUEST_VERIFICATION', 'USER')

// GET: Verify email with token
export const GET = withAudit(async (
  request: NextRequest,
  { params }: { params: { token: string } }
) => {
  try {
    const { token } = params

    const tokenRecord = await prisma.token.findFirst({
      where: {
        token,
        type: 'EMAIL_VERIFICATION',
        expiresAt: { gt: new Date() },
        usedAt: null
      },
      include: {
        user: true
      }
    })

    if (!tokenRecord) {
      throw new ValidationError('Invalid or expired verification token')
    }

    // Mark token as used
    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    })

    // Update user as verified
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { isVerified: true }
    })

    return NextResponse.json(
      successResponse('Email verified successfully')
    )

  } catch (error: any) {
    return NextResponse.json(
      errorResponse(
        error.message || 'Verification failed',
        error.errorCode || 'SERVER_ERROR'
      ),
      { status: error.statusCode || 500 }
    )
  }
}, 'VERIFY_EMAIL', 'USER')
