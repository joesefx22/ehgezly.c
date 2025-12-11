// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validators'
import { handleError, ValidationError, NotFoundError } from '@/lib/errors'
import { successResponse, errorResponse } from '@/lib/responses'
import { withAudit } from '@/lib/security'

export const POST = withAudit(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const validatedData = resetPasswordSchema.parse(body)

    // Check password strength
    const passwordCheck = validatePasswordStrength(validatedData.password)
    if (!passwordCheck.isValid) {
      throw new ValidationError('Password does not meet requirements', passwordCheck.errors)
    }

    // Find valid token
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token: validatedData.token,
        type: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() },
        usedAt: null
      },
      include: {
        user: true
      }
    })

    if (!tokenRecord) {
      throw new ValidationError('Invalid or expired reset token')
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password)

    // Update user password
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { password: hashedPassword }
    })

    // Mark token as used
    await prisma.token.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() }
    })

    // Delete all user sessions (force logout from all devices)
    await prisma.session.deleteMany({
      where: { userId: tokenRecord.userId }
    })

    return NextResponse.json(
      successResponse('Password reset successfully')
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
}, 'RESET_PASSWORD', 'USER')
